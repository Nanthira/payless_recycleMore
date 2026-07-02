import { calculateWasteFee } from "./calculator/feeCalculator.js";
import { bangkokWasteGeoJson } from "./data/bangkokWasteGeoJson.js";

const wasteTypes = {
  food: { label: "Food waste", litersPerKg: 1.5, scorePerLiter: 0.2 },
  recyclable: { label: "Recyclable waste", litersPerKg: 6, scorePerLiter: 1 },
  general: { label: "General waste", litersPerKg: 5, scorePerLiter: 0 },
  hazardous: { label: "Hazardous waste", litersPerKg: 4, scorePerLiter: 0.5 }
};

const leaderboardSeed = [
  { name: "Nok", score: 96 },
  { name: "Mali", score: 82 },
  { name: "Somchai", score: 64 },
  { name: "Waste saver", score: 40 },
  { name: "Green home", score: 28 }
];

const form = document.querySelector("#calculator-form");
const userNameInput = document.querySelector("#user-name");
const userTypeInput = document.querySelector("#user-type");
const discountInput = document.querySelector("#discount-qualified");
const discountRow = document.querySelector("#discount-row");
const addItemButton = document.querySelector("#add-item-button");
const resetButton = document.querySelector("#reset-button");
const saveScoreButton = document.querySelector("#save-score-button");
const calculatorError = document.querySelector("#calculator-error");
const wasteItemsContainer = document.querySelector("#waste-items");

const feeTotal = document.querySelector("#fee-total");
const normalFee = document.querySelector("#normal-fee");
const savings = document.querySelector("#savings");
const volumeSummary = document.querySelector("#volume-summary");
const weightSummary = document.querySelector("#weight-summary");
const scoreSummary = document.querySelector("#score-summary");
const tierLabel = document.querySelector("#tier-label");
const feeExplanation = document.querySelector("#fee-explanation");
const leaderboardList = document.querySelector("#leaderboard-list");

const tabButtons = document.querySelectorAll(".tab-button");
const calculatorView = document.querySelector("#calculator-view");
const mapView = document.querySelector("#map-view");

let map;
let geoJsonLayer;
let itemId = 0;

function createWasteItem({ type = "general", amount = "20", unit = "liter" } = {}) {
  itemId += 1;
  const item = document.createElement("div");
  item.className = "waste-item";
  item.dataset.itemId = String(itemId);
  item.innerHTML = `
    <div class="field-group compact">
      <label for="waste-type-${itemId}">Type</label>
      <select id="waste-type-${itemId}" class="waste-type">
        ${Object.entries(wasteTypes).map(([value, config]) => (
          `<option value="${value}" ${value === type ? "selected" : ""}>${config.label}</option>`
        )).join("")}
      </select>
    </div>
    <div class="field-group compact">
      <label for="waste-amount-${itemId}">Amount</label>
      <input id="waste-amount-${itemId}" class="waste-amount" type="number" min="0" step="0.1" value="${amount}">
    </div>
    <div class="field-group compact">
      <label for="waste-unit-${itemId}">Unit</label>
      <select id="waste-unit-${itemId}" class="waste-unit">
        <option value="liter" ${unit === "liter" ? "selected" : ""}>Liters</option>
        <option value="kg" ${unit === "kg" ? "selected" : ""}>Kg</option>
      </select>
    </div>
    <button class="icon-button remove-item" type="button" aria-label="Remove waste item">x</button>
  `;

  wasteItemsContainer.appendChild(item);
  item.querySelectorAll("input, select").forEach((input) => {
    input.addEventListener("input", renderCalculator);
    input.addEventListener("change", renderCalculator);
  });
  item.querySelector(".remove-item").addEventListener("click", () => {
    if (wasteItemsContainer.children.length > 1) {
      item.remove();
      renderCalculator();
    }
  });
}

function getWasteSummary() {
  const items = Array.from(wasteItemsContainer.querySelectorAll(".waste-item"));
  let totalLiters = 0;
  let totalKg = 0;
  let recyclingScore = 0;

  for (const item of items) {
    const type = item.querySelector(".waste-type").value;
    const amountValue = item.querySelector(".waste-amount").value;
    const unit = item.querySelector(".waste-unit").value;
    const amount = Number(amountValue);
    const config = wasteTypes[type];

    if (amountValue === "" || !Number.isFinite(amount)) {
      return { error: "Enter an amount for every waste item." };
    }

    if (amount < 0) {
      return { error: "Waste amounts cannot be negative." };
    }

    const liters = unit === "kg" ? amount * config.litersPerKg : amount;
    const kg = unit === "kg" ? amount : amount / config.litersPerKg;
    totalLiters += liters;
    totalKg += kg;
    recyclingScore += liters * config.scorePerLiter;
  }

  return {
    totalLiters,
    totalKg,
    recyclingScore: Math.round(recyclingScore)
  };
}

function renderCalculator() {
  const isHousehold = userTypeInput.value === "household";
  discountRow.classList.toggle("disabled", !isHousehold);
  discountInput.disabled = !isHousehold;

  if (!isHousehold) {
    discountInput.checked = false;
  }

  const summary = getWasteSummary();

  if (summary.error) {
    calculatorError.textContent = summary.error;
    return;
  }

  const result = calculateWasteFee({
    userType: userTypeInput.value,
    volumeLiters: summary.totalLiters,
    discountQualified: discountInput.checked
  });

  if (result.error) {
    calculatorError.textContent = result.error;
    return;
  }

  calculatorError.textContent = "";
  feeTotal.textContent = result.monthlyFee.toLocaleString("en-US");
  normalFee.textContent = result.normalFee.toLocaleString("en-US");
  savings.textContent = result.savings.toLocaleString("en-US");
  volumeSummary.textContent = summary.totalLiters.toLocaleString("en-US", { maximumFractionDigits: 1 });
  weightSummary.textContent = summary.totalKg.toLocaleString("en-US", { maximumFractionDigits: 1 });
  scoreSummary.textContent = summary.recyclingScore.toLocaleString("en-US");
  tierLabel.textContent = result.tierLabel;
  feeExplanation.textContent = result.explanation;
}

function loadLeaderboard() {
  try {
    const saved = JSON.parse(localStorage.getItem("wastelessLeaderboard") || "[]");
    return [...saved, ...leaderboardSeed]
      .filter((entry) => entry.name && Number.isFinite(Number(entry.score)))
      .sort((a, b) => Number(b.score) - Number(a.score))
      .slice(0, 5);
  } catch {
    return leaderboardSeed;
  }
}

function renderLeaderboard() {
  leaderboardList.innerHTML = "";
  loadLeaderboard().forEach((entry, index) => {
    const item = document.createElement("li");
    item.innerHTML = `<span>${index + 1}. ${entry.name}</span><strong>${Number(entry.score).toLocaleString("en-US")} pts</strong>`;
    leaderboardList.appendChild(item);
  });
}

function saveScore() {
  const summary = getWasteSummary();

  if (summary.error) {
    calculatorError.textContent = summary.error;
    return;
  }

  const name = userNameInput.value.trim() || "Waste saver";
  const saved = JSON.parse(localStorage.getItem("wastelessLeaderboard") || "[]");
  saved.push({ name, score: summary.recyclingScore });
  localStorage.setItem("wastelessLeaderboard", JSON.stringify(saved.slice(-20)));
  renderLeaderboard();
}

function switchView(viewName) {
  const showMap = viewName === "map";

  calculatorView.classList.toggle("active", !showMap);
  mapView.classList.toggle("active", showMap);

  tabButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.view === viewName);
  });

  if (showMap) {
    initMap();
    setTimeout(() => map.invalidateSize(), 50);
  }
}

function getWasteLevel(value) {
  if (value >= 320) return "high";
  if (value >= 200) return "medium";
  return "low";
}

function colorForValue(value) {
  if (value >= 320) return "#c2410c";
  if (value >= 200) return "#d97706";
  return "#15803d";
}

function selectDistrict(feature) {
  const properties = feature.properties;
  document.querySelector("#place-name").textContent = properties.name;
  document.querySelector("#place-description").textContent = `${properties.nameEn} reported ${properties.wastePerDayTons.toLocaleString("en-US")} tons of municipal waste per day in B.E. ${properties.year}.`;
  document.querySelector("#place-metric").textContent = "Municipal waste by district";
  document.querySelector("#place-value").textContent = `${properties.wastePerDayTons.toLocaleString("en-US")} tons/day`;
  document.querySelector("#place-source").textContent = "BKK Open Data";
}

function initMap() {
  if (map || !window.L) {
    return;
  }

  map = L.map("waste-map", {
    scrollWheelZoom: true
  }).setView([13.7563, 100.5018], 10);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(map);

  geoJsonLayer = L.geoJSON(bangkokWasteGeoJson, {
    style(feature) {
      return {
        color: "#ffffff",
        weight: 1,
        fillColor: colorForValue(feature.properties.wastePerDayTons),
        fillOpacity: 0.68
      };
    },
    onEachFeature(feature, layer) {
      const level = getWasteLevel(feature.properties.wastePerDayTons);
      layer.bindPopup(`<strong>${feature.properties.name}</strong><br>${feature.properties.wastePerDayTons} tons/day<br>${level} reported waste`);
      layer.on("click", () => selectDistrict(feature));
    }
  }).addTo(map);

  map.fitBounds(geoJsonLayer.getBounds(), { padding: [16, 16] });
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  renderCalculator();
});

[userNameInput, userTypeInput, discountInput].forEach((input) => {
  input.addEventListener("input", renderCalculator);
  input.addEventListener("change", renderCalculator);
});

addItemButton.addEventListener("click", () => {
  if (wasteItemsContainer.children.length < 10) {
    createWasteItem({ amount: "", type: "recyclable", unit: "kg" });
    renderCalculator();
  } else {
    calculatorError.textContent = "You can add up to 10 waste items at a time.";
  }
});

resetButton.addEventListener("click", () => {
  userTypeInput.value = "household";
  userNameInput.value = "Waste saver";
  discountInput.checked = false;
  wasteItemsContainer.innerHTML = "";
  createWasteItem({ type: "general", amount: "20", unit: "liter" });
  renderCalculator();
});

saveScoreButton.addEventListener("click", saveScore);

tabButtons.forEach((button) => {
  button.addEventListener("click", () => switchView(button.dataset.view));
});

createWasteItem({ type: "general", amount: "20", unit: "liter" });
renderCalculator();
renderLeaderboard();
