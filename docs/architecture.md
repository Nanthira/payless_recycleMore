# Architecture

## Purpose

Explain how the system is organised.

## Main Components

- Fee calculator: applies published fee tiers to user inputs.
- Source note panel: shows where the fee assumptions came from and when they were last checked.
- Map viewer: displays Bangkok district waste data from BKK Open Data.
- Data builder: converts raw Bangkok district shapefile and waste CSV files into browser-friendly GeoJSON-style JavaScript.
- Validation layer: keeps invalid inputs out of the calculator.
- Leaderboard: stores local recycling scores in browser `localStorage`.

## File Structure

- `src/index.html`: main web page.
- `src/app.js`: connects the form, result panel, tabs, and map.
- `src/styles.css`: visual styles.
- `src/calculator/feeCalculator.js`: fee calculation and validation logic.
- `src/data/bangkokWasteGeoJson.js`: generated Bangkok district waste map data.
- `src/data/raw/`: raw BKK Open Data files for rebuilding map data.
- `src/scripts/buildBangkokWasteData.js`: raw data conversion script.
- `src/scripts/serve.js`: local static server.
- `tests/feeCalculator.test.js`: automated calculator tests.
- `docs/`: product and domain notes.

## Frontend and Backend Split

The first version is a frontend-only static web app. This keeps the project small and easy to run.

Add a backend only if the app needs live data updates, saved user estimates, user accounts, or protected API keys.

## Data Flow

Calculator flow:

1. User enters name, user type, discount eligibility, and up to 10 waste items.
2. Each waste item has type, amount, and unit.
3. App converts kg inputs to liters and summarizes total volume, estimated weight, and recycling score.
4. Calculator matches the total liters to a fee tier.
5. Result UI displays fee, tier, savings, and notes.

Map flow:

1. App imports generated Bangkok district GeoJSON-style data.
2. Map colors district polygons by reported tons/day.
3. User clicks a place to inspect details.

## Storage Method

Fee logic is stored in `src/calculator/feeCalculator.js`.
Generated map data is stored in `src/data/bangkokWasteGeoJson.js`.
Leaderboard entries are stored in browser `localStorage`.

Do not store personal user data in the first version.

## External Libraries

- Leaflet for the OpenStreetMap-based map.
- OpenStreetMap tiles for the visual map layer.

No paid APIs or services are used.
