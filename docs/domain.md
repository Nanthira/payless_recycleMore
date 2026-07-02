# Domain Notes

## Purpose

Capture domain-related knowledge that the AI may not know. This file can describe scientific assumptions, game rules, business rules, data rules, or any other project-specific domain knowledge.

## Waste Fee Domain Notes

The waste collection fee rules are based on the Greener Bangkok "Baan Nee Mai Te Ruam" project page.

Planning fee tiers:
- Household or general home, up to 20 liters of waste per day: 60 THB/month.
- Household or general home that qualifies for the waste-separation discount: 20 THB/month.
- Waste over 20 liters and below 1 cubic meter per day: 120 THB per 20 liters.
- Waste from 1 cubic meter per day upward: 8,000 THB per cubic meter.

The discount should only be shown as an estimate. The real discount may require registration, evidence submission, approval, and continued compliance.

## Variables and Units

- Waste volume should be entered in liters per day for normal users.
- Users may also enter kg for each waste item; the app converts kg to liters for fee calculation.
- 1 cubic meter is 1,000 liters.
- The Greener Bangkok page gives 20 liters as 4 kg for the over-20-liter tier, so mixed waste uses 1 kg = 5 liters.
- Fees are monthly and shown in Thai baht.
- Map metrics may use different units, such as kilograms per person per day, tonnes per year, number of sites, or complaints per district.

## Reasonable Value Ranges

- Household waste volume: usually 0 to 20 liters per day for the Bangkok household tier.
- Small business or above-household waste volume: more than 20 liters and below 1,000 liters per day.
- Large user waste volume: 1,000 liters per day or more.
- The app should reject negative waste volume.
- Zero waste volume can be allowed for exploration, but the result should explain that real billing may still depend on local rules.

## Missing Value Rules

- The calculator cannot produce a fee without user type and waste volume.
- If discount eligibility is unknown, default to the normal fee and show possible savings separately.
- Map areas with missing data should be shown as "No data", not as low-waste areas.

## Data Cautions

- Fee results are estimates, not official bills.
- Kg-to-liter conversion varies by waste type and should be presented as an estimate.
- Public waste datasets may be old, incomplete, or measured differently between places.
- Map colors should never imply moral blame. Use neutral labels such as "higher reported waste" and "lower reported waste".
- Always show data source and year beside map results.
