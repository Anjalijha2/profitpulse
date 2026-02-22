/**
 * Pure functions for profitability formulas
 */

/**
 * Validates inputs to be numbers safely.
 */
const safeNumber = (val) => {
    if (val === null || val === undefined || isNaN(val)) return 0;
    return Number(val);
};

/**
 * Calculates Employee Cost Per Hour dynamically.
 * @param {number} annualCTC Total Compensation
 * @param {number} overheadCostPerYear Global/Dept overhead
 * @param {number} standardMonthlyHours Default 160 or custom
 * @returns {number} Hourly Cost
 */
export const calculateEmployeeCostPerHour = (annualCTC, overheadCostPerYear, standardMonthlyHours) => {
    const ctc = safeNumber(annualCTC);
    const overhead = safeNumber(overheadCostPerYear);
    const hrs = safeNumber(standardMonthlyHours);

    if (hrs === 0) throw new Error("Standard working hours cannot be zero.");

    return Number(((ctc + overhead) / 12 / hrs).toFixed(2));
};

export const calculateTMRevenue = (billedHours, billingRate) => {
    return Number((safeNumber(billedHours) * safeNumber(billingRate)).toFixed(2));
};

export const calculateTMCost = (employeeCostPerHour, projectHours) => {
    return Number((safeNumber(employeeCostPerHour) * safeNumber(projectHours)).toFixed(2));
};

export const calculateFixedCostProjectCost = (employeeCostHoursArray) => {
    if (!Array.isArray(employeeCostHoursArray)) return 0;
    const sum = employeeCostHoursArray.reduce((acc, emp) => {
        return acc + calculateTMCost(emp.employeeCostPerHour, emp.hoursWorked);
    }, 0);
    return Number(sum.toFixed(2));
};

export const calculateInfraCost = (vendorCost, manpowerCost) => {
    return Number((safeNumber(vendorCost) + safeNumber(manpowerCost)).toFixed(2));
};

export const calculateAMCCost = (supportHours, costPerHour) => {
    return Number((safeNumber(supportHours) * safeNumber(costPerHour)).toFixed(2));
};

export const calculateProfit = (revenue, cost) => {
    return Number((safeNumber(revenue) - safeNumber(cost)).toFixed(2));
};

export const calculateMarginPercent = (revenue, cost) => {
    const r = safeNumber(revenue);
    const c = safeNumber(cost);
    if (r === 0) {
        if (c > 0) return -100;
        return 0;
    }
    return Number((((r - c) / r) * 100).toFixed(2));
};

export const calculateUtilizationPercent = (billableHours, totalAvailableHours) => {
    const b = safeNumber(billableHours);
    const t = safeNumber(totalAvailableHours);
    if (t === 0) return 0;
    const percent = (b / t) * 100;
    // Though visually we might cap it to 100%, mathematically we return the true %
    return Number(percent.toFixed(2));
};

export const calculateBurnRate = (totalCostToDate, fixedContractValue) => {
    const cost = safeNumber(totalCostToDate);
    const contract = safeNumber(fixedContractValue);
    if (contract === 0) return 0;
    return Number(((cost / contract) * 100).toFixed(2));
};

export const calculateBudgetVariance = (budgetedCost, actualCost) => {
    const budget = safeNumber(budgetedCost);
    const actual = safeNumber(actualCost);
    if (budget === 0) return 0;
    return Number((((actual - budget) / budget) * 100).toFixed(2));
};

export const calculateGrossMargin = calculateMarginPercent; // Same formula
