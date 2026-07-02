# WasteLess Fee & Map

## Purpose

This project helps people estimate how much they may need to pay for waste collection fees and understand where waste pressure is higher or lower on a map.

The fee rules use the official Greener Bangkok "Baan Nee Mai Te Ruam" project page:
- Household waste up to 20 liters per day: 60 THB/month, or 20 THB/month if the household separates waste and registers for the discount.
- Waste over 20 liters and up to 1 cubic meter per day: 120 THB per 20 liters.
- Waste from 1 cubic meter per day upward: 8,000 THB per cubic meter.

The app should begin as a practical calculator, then grow into a map that shows waste hot spots and lower-waste areas using public datasets.

## How to install

No install step is needed for the static app.

## How to run

Run:

```text
npm start
```

Then open `http://127.0.0.1:4173/` in a browser.

The calculator works from the local files. The map uses Leaflet with OpenStreetMap tiles from a CDN, so the map needs internet access when viewed.

## How to test

Run:

```text
npm test
```

To rebuild the generated Bangkok district map data from the raw files, run:

```text
npm run build:data
```

## Main files

- `docs/brainstorm.md`: product idea, MVP, and open questions.
- `docs/domain.md`: waste-fee and mapping rules.
- `docs/function_design.md`: user-facing feature design.
- `docs/architecture.md`: early system shape.
- `docs/testing.md`: success criteria for the first build.
- `src/index.html`: main web page.
- `src/app.js`: browser interactions.
- `src/calculator/feeCalculator.js`: waste-fee calculation logic.
- `src/data/bangkokWasteGeoJson.js`: generated Bangkok district waste map data.
- `src/data/raw/`: raw Bangkok Open Data files used to build the map.
- `src/scripts/`: local server and data build scripts.
- `src/styles.css`: page styling.
- `tests/feeCalculator.test.js`: calculator tests.

## Known limitations

- The Bangkok fee rules should still be checked before public launch because fee implementation details can change.
- The map currently uses Bangkok district data from BKK Open Data, with latest included waste columns from B.E. 2561.
- The first version should explain that calculator results are estimates, not official bills.
- Kg-to-liter conversion is an estimate. The app uses the official 20 liters = 4 kg note as the mixed-waste anchor and type-specific approximations for item summaries.
