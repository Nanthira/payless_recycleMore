export function calculateWasteFee({ userType, volumeLiters, discountQualified }) {
  if (volumeLiters === "" || volumeLiters === null || volumeLiters === undefined) {
    return { error: "Enter a waste volume." };
  }

  const volume = Number(volumeLiters);

  if (!userType) {
    return { error: "Choose a user type." };
  }

  if (!Number.isFinite(volume)) {
    return { error: "Enter a waste volume." };
  }

  if (volume < 0) {
    return { error: "Waste volume cannot be negative." };
  }

  if (userType === "household" && volume <= 20) {
    const normalFee = 60;
    const monthlyFee = discountQualified ? 20 : normalFee;

    return {
      monthlyFee,
      normalFee,
      savings: normalFee - monthlyFee,
      tierLabel: "Household tier",
      explanation: discountQualified
        ? "This household is at or below 20 liters per day and is marked as qualifying for the waste-separation discount."
        : "This household is at or below 20 liters per day, so the normal planning fee is 60 THB/month."
    };
  }

  if (userType === "large" || volume >= 1000) {
    const cubicMeters = Math.max(1, Math.ceil(volume / 1000));
    const normalFee = cubicMeters * 8000;

    return {
      monthlyFee: normalFee,
      normalFee,
      savings: 0,
      tierLabel: "Large building or business tier",
      explanation: `This estimate uses the large-user tier at 8,000 THB per cubic meter, rounded up to ${cubicMeters} cubic meter(s).`
    };
  }

  if (userType === "business" || volume > 20) {
    const units = Math.ceil(volume / 20);
    const normalFee = units * 120;

    return {
      monthlyFee: normalFee,
      normalFee,
      savings: 0,
      tierLabel: "Shop or small business tier",
      explanation: `This estimate uses the shop or small-business tier at 120 THB per 20 liters, rounded up to ${units} unit(s).`
    };
  }

  return {
    monthlyFee: 60,
    normalFee: 60,
    savings: 0,
    tierLabel: "Household tier",
    explanation: "This estimate uses the household tier."
  };
}
