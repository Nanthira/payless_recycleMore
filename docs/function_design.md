# Function Design

## Purpose

Describe what the app should do from the user's point of view.

## User Goals

- Estimate the monthly waste collection fee for a home, shop, business, condo, or building.
- See whether waste separation could reduce the monthly fee.
- Understand which fee tier applies and why.
- Explore a map that compares waste pressure between places.
- Learn enough to take action without reading a long policy document.

## Main Features

### Phase 1: Waste Fee Calculator

- Select user type: household, shop/business, or large building/business.
- Add up to 10 daily waste items.
- For each item, choose waste type, amount, and unit: liters or kg.
- Summarize the total estimated volume before calculating the fee.
- Mark whether the household qualifies for the waste-separation discount.
- Show the estimated monthly fee.
- Show normal fee, discounted fee, savings, and the matched tier.
- Show a short source/date note.

### Phase 2: Waste Map

- map will be ploted with openStreetMap library
- Show a map with Bangkok district waste data from BKK Open Data.
- Color district polygons by reported waste intensity.
- Let users click a district to see details.
- Show data source, unit, and year.
- Include filters once the data source is chosen.

### Phase 3: leaderboard
- we will collect data of how many time they have been recycling waste
- showing highest 5 people by name and score

## Input Data

- User name.
- User type.
- Waste item type, amount, and unit.
- Household discount eligibility.
- Optional map country or area.
- Optional map metric, such as waste generation, waste site count, or recycling rate.

## Output Data

- Estimated monthly fee in THB.
- Applied fee tier.
- Estimated savings if the discount applies.
- Total estimated liters per day.
- Total estimated kg per day.
- Recycling score.
- Explanation of the calculation.
- Map visual showing higher and lower waste areas.
- Details for the selected map area, including source and year.
- leaderboard of user.

## User Interactions

- user can fills their name.
- User fills the calculator form and immediately sees the result.
- User can add or remove waste item rows up to 10 rows.
- User can change type, amount, or unit and see the result update.
- User can switch from calculator to map.
- User can pan and zoom the map.
- User can click a Bangkok district to inspect details.
- User can save a recycling score under their name and see the leaderboard update.

## Expected Behaviour

- Household with 20 liters/day or less should show 60 THB/month normally.
- Household with 20 liters/day or less and discount eligibility should show 20 THB/month.
- Waste over 20 liters/day and below 1,000 liters/day should show 120 THB per 20 liters, rounded up.
- Large building/business from 1,000 liters/day upward should show 8,000 THB/month.
- Negative volume should be rejected.
- Missing required values should show a clear validation message.
- Map areas with missing data should be visually distinct from low-waste areas.
- a leaderboard that showing 5 hightest score

## Edge Cases

- Exactly 20 liters/day belongs to the household limit when user type is household.
- Exactly 1,000 liters/day belongs to the large-user tier because the source describes the large tier as starting from 1 cubic meter upward.
- Household above 20 liters/day may not fit the simple household discount story; show the matched higher tier or ask the user to choose business/building if appropriate.
- Discount eligibility should not be auto-applied only because the user says they separate waste; it should be framed as "if you qualify".
- If public map data is old or missing, show the limitation close to the map.
