# Testing

## Purpose

Explain how to test the project.

## How to Run the App

Run:

```text
npm start
```

Then open `http://127.0.0.1:4173/` in a browser.

The calculator works offline. The map needs internet access because it loads Leaflet and OpenStreetMap tiles from public CDN URLs.

## How to Run Automated Tests

Run:

```text
npm test
```

To rebuild the generated Bangkok district map data from raw files:

```text
npm run build:data
```

## Success Criteria

Before changing code, turn the task into a verifiable goal. For example:

- "Add validation" means invalid inputs are tested and rejected.
- "Fix a bug" means there is a test or manual check that reproduces the bug before the fix and passes after the fix.
- "Refactor code" means behaviour is unchanged and tests pass before and after.

For multi-step tasks, use a short plan:

```text
1. [Step] -> verify: [check]
2. [Step] -> verify: [check]
3. [Step] -> verify: [check]
```

For the first WasteLess build:

```text
1. Build the calculator form -> verify: user can enter type, volume, and discount status.
2. Implement Bangkok fee tiers -> verify: known examples return the expected monthly fees, including 120 THB per 20 liters.
3. Add validation -> verify: negative and missing volume values are rejected.
4. Add source and limitation notes -> verify: the UI says results are estimates and shows source date.
5. Add the Bangkok district map -> verify: real district polygons render and clicking a district shows source, year, and tons/day.
```

## Manual Testing Checklist

- [ ] Can the app start without errors?
- [ ] Can the user enter valid data?
- [ ] Does the app reject invalid data?
- [ ] Can the user add up to 10 waste items?
- [ ] Can each item use liters or kg?
- [ ] Does a household at 20 liters/day show 60 THB/month normally?
- [ ] Does a qualifying household at 20 liters/day show 20 THB/month with the discount?
- [ ] Does 40 liters/day in the business tier show 240 THB/month?
- [ ] Does a large building/business at 1,000 liters/day or more show 8,000 THB/month?
- [ ] Does the result explain the tier and estimated savings?
- [ ] Does the app show source/date and limitation notes?
- [ ] Can the user click a Bangkok district and see metric, unit, year, and source?
- [ ] Can the user save a recycling score and see the footer leaderboard update?

## Common Failure Cases

- Applying the household discount to non-household users.
- Treating missing map data as low waste.
- Mixing liters and cubic meters incorrectly.
- Hiding the fact that calculator results are estimates.
- Using map colors that make the result look more certain than the data really is.

## Expected Outputs

- Household, 20 liters/day, no discount: 60 THB/month.
- Household, 20 liters/day, qualifies for discount: 20 THB/month, 40 THB/month savings.
- Shop/business, 21 liters/day: 240 THB/month because the 120 THB fee is per 20 liters and is rounded up.
- Shop/business, 40 liters/day: 240 THB/month.
- Shop/business, 999 liters/day: 6,000 THB/month.
- Large building/business, 1,000 liters/day: 8,000 THB/month.

The 1,000 liter boundary should still be verified against an official source before public launch.
