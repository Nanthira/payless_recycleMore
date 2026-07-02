import assert from "node:assert/strict";
import { calculateWasteFee } from "../src/calculator/feeCalculator.js";

const cases = [
  {
    name: "household normal fee at 20 liters",
    input: { userType: "household", volumeLiters: 20, discountQualified: false },
    expected: { monthlyFee: 60, normalFee: 60, savings: 0 }
  },
  {
    name: "household discount fee at 20 liters",
    input: { userType: "household", volumeLiters: 20, discountQualified: true },
    expected: { monthlyFee: 20, normalFee: 60, savings: 40 }
  },
  {
    name: "business fee above 20 liters",
    input: { userType: "business", volumeLiters: 21, discountQualified: false },
    expected: { monthlyFee: 240, normalFee: 240, savings: 0 }
  },
  {
    name: "business fee below one cubic meter",
    input: { userType: "business", volumeLiters: 999, discountQualified: false },
    expected: { monthlyFee: 6000, normalFee: 6000, savings: 0 }
  },
  {
    name: "large user fee at one cubic meter",
    input: { userType: "large", volumeLiters: 1000, discountQualified: false },
    expected: { monthlyFee: 8000, normalFee: 8000, savings: 0 }
  }
];

for (const testCase of cases) {
  const result = calculateWasteFee(testCase.input);
  assert.equal(result.monthlyFee, testCase.expected.monthlyFee, testCase.name);
  assert.equal(result.normalFee, testCase.expected.normalFee, testCase.name);
  assert.equal(result.savings, testCase.expected.savings, testCase.name);
}

assert.equal(
  calculateWasteFee({ userType: "household", volumeLiters: -1, discountQualified: false }).error,
  "Waste volume cannot be negative."
);

assert.equal(
  calculateWasteFee({ userType: "household", volumeLiters: "", discountQualified: false }).error,
  "Enter a waste volume."
);

assert.equal(
  calculateWasteFee({ userType: "business", volumeLiters: 40, discountQualified: false }).monthlyFee,
  240
);

console.log("All fee calculator tests passed.");
