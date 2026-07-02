import { readFileSync, writeFileSync } from "node:fs";

const rootDir = new URL("../", import.meta.url);
const sourceDir = new URL("data/raw/", rootDir);

function parseCsv(text) {
  const rows = text.trim().split(/\r?\n/).map((line) => (
    line.split(",").map((cell) => cell.replace(/^"|"$/g, ""))
  ));
  const headers = rows.shift();
  return rows.map((cells) => Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? ""])));
}

function readDbf(path) {
  const buffer = readFileSync(path);
  const recordCount = buffer.readUInt32LE(4);
  const headerLength = buffer.readUInt16LE(8);
  const recordLength = buffer.readUInt16LE(10);
  const fields = [];

  for (let offset = 32; offset < headerLength - 1; offset += 32) {
    fields.push({
      name: buffer.slice(offset, offset + 11).toString("ascii").replace(/\0/g, "").trim(),
      length: buffer[offset + 16]
    });
  }

  const records = [];

  for (let recordIndex = 0; recordIndex < recordCount; recordIndex += 1) {
    const recordOffset = headerLength + recordIndex * recordLength;
    let fieldOffset = recordOffset + 1;
    const record = {};

    fields.forEach((field) => {
      record[field.name] = buffer
        .slice(fieldOffset, fieldOffset + field.length)
        .toString("utf8")
        .trim();
      fieldOffset += field.length;
    });

    records.push(record);
  }

  return records;
}

function utm47ToLonLat(x, y) {
  const a = 6378137;
  const e = 0.08181919084262149;
  const e1sq = 0.006739496742276434;
  const k0 = 0.9996;
  const zoneNumber = 47;
  const xAdjusted = x - 500000;
  const m = y / k0;
  const mu = m / (a * (1 - e ** 2 / 4 - (3 * e ** 4) / 64 - (5 * e ** 6) / 256));
  const e1 = (1 - Math.sqrt(1 - e ** 2)) / (1 + Math.sqrt(1 - e ** 2));
  const j1 = (3 * e1) / 2 - (27 * e1 ** 3) / 32;
  const j2 = (21 * e1 ** 2) / 16 - (55 * e1 ** 4) / 32;
  const j3 = (151 * e1 ** 3) / 96;
  const j4 = (1097 * e1 ** 4) / 512;
  const fp = mu + j1 * Math.sin(2 * mu) + j2 * Math.sin(4 * mu) + j3 * Math.sin(6 * mu) + j4 * Math.sin(8 * mu);
  const c1 = e1sq * Math.cos(fp) ** 2;
  const t1 = Math.tan(fp) ** 2;
  const r1 = (a * (1 - e ** 2)) / (1 - e ** 2 * Math.sin(fp) ** 2) ** 1.5;
  const n1 = a / Math.sqrt(1 - e ** 2 * Math.sin(fp) ** 2);
  const d = xAdjusted / (n1 * k0);
  const q1 = n1 * Math.tan(fp) / r1;
  const q2 = d ** 2 / 2;
  const q3 = ((5 + 3 * t1 + 10 * c1 - 4 * c1 ** 2 - 9 * e1sq) * d ** 4) / 24;
  const q4 = ((61 + 90 * t1 + 298 * c1 + 45 * t1 ** 2 - 252 * e1sq - 3 * c1 ** 2) * d ** 6) / 720;
  const latitude = fp - q1 * (q2 - q3 + q4);
  const q5 = d;
  const q6 = ((1 + 2 * t1 + c1) * d ** 3) / 6;
  const q7 = ((5 - 2 * c1 + 28 * t1 - 3 * c1 ** 2 + 8 * e1sq + 24 * t1 ** 2) * d ** 5) / 120;
  const centralMeridian = ((zoneNumber - 1) * 6 - 180 + 3) * Math.PI / 180;
  const longitude = centralMeridian + (q5 - q6 + q7) / Math.cos(fp);

  return [Number((longitude * 180 / Math.PI).toFixed(6)), Number((latitude * 180 / Math.PI).toFixed(6))];
}

function readShp(path) {
  const buffer = readFileSync(path);
  let offset = 100;
  const shapes = [];

  while (offset < buffer.length) {
    const contentLength = buffer.readInt32BE(offset + 4) * 2;
    const contentOffset = offset + 8;
    const shapeType = buffer.readInt32LE(contentOffset);

    if (shapeType === 5) {
      const numParts = buffer.readInt32LE(contentOffset + 36);
      const numPoints = buffer.readInt32LE(contentOffset + 40);
      const parts = [];
      const points = [];
      let cursor = contentOffset + 44;

      for (let partIndex = 0; partIndex < numParts; partIndex += 1) {
        parts.push(buffer.readInt32LE(cursor));
        cursor += 4;
      }

      for (let pointIndex = 0; pointIndex < numPoints; pointIndex += 1) {
        const x = buffer.readDoubleLE(cursor);
        const y = buffer.readDoubleLE(cursor + 8);
        points.push(utm47ToLonLat(x, y));
        cursor += 16;
      }

      const rings = parts.map((start, index) => {
        const end = parts[index + 1] ?? points.length;
        const ring = points.slice(start, end);
        const step = Math.max(1, Math.ceil(ring.length / 240));
        return ring.filter((_, pointIndex) => pointIndex % step === 0 || pointIndex === ring.length - 1);
      });

      shapes.push(rings);
    } else {
      shapes.push([]);
    }

    offset += 8 + contentLength;
  }

  return shapes;
}

const districtRows = parseCsv(readFileSync(new URL("data-district.csv", sourceDir), "utf8"));
const districtByCode = new Map(districtRows.map((row) => [row.dcode, row]));
const garbageRows = parseCsv(readFileSync(new URL("data-garbage.csv", sourceDir), "utf8"));
const garbageByCode = new Map(garbageRows.map((row) => [row.dcode, row]));
const dbfRecords = readDbf(new URL("district.dbf", sourceDir));
const shapes = readShp(new URL("district.shp", sourceDir));

const features = dbfRecords.map((record, index) => {
  const district = districtByCode.get(record.dcode) ?? {};
  const garbage = garbageByCode.get(record.dcode) ?? {};
  const perDay = Number(garbage.garbageperday61 || 0);
  const annual = Number(garbage.garbage61 || 0);

  return {
    type: "Feature",
    properties: {
      dcode: record.dcode,
      name: district.dname || record.dname,
      nameEn: district.dname_e || record.dname_e,
      wastePerDayTons: perDay,
      annualWasteTons: annual,
      year: 2561,
      areaSqKm: Number(district.area_dis || 0)
    },
    geometry: {
      type: "Polygon",
      coordinates: shapes[index]
    }
  };
}).filter((feature) => feature.geometry.coordinates.length > 0);

const output = `export const bangkokWasteGeoJson = ${JSON.stringify({
  type: "FeatureCollection",
  sourceName: "BKK Open Data: Bangkok municipal waste by administrative district",
  sourceUrl: "https://data.bangkok.go.th/dataset/garbage",
  boundarySourceUrl: "https://data.bangkok.go.th/dataset/district",
  features
}, null, 2)};\n`;

writeFileSync(new URL("data/bangkokWasteGeoJson.js", rootDir), output, "utf8");
console.log(`Wrote ${features.length} Bangkok district waste features.`);
