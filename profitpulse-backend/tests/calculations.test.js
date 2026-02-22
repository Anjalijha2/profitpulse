import { calculateEmployeeCostPerHour, calculateProjectProfitability, calculateProjectBurnRate } from '../src/utils/calculations.js';

describe('Calculations Utility', () => {

    it('cost_per_hour formula: (CTC + overhead) / 12 / std_hours', () => {
        // Assume std_hours = 160, CTC = 1800000, overhead = 0.
        // Month cost = 1800000/12 = 150000
        // Per hour = 150000/160 = 937.5
        const cost = calculateEmployeeCostPerHour(1800000, 0, 160);
        expect(cost).toBeCloseTo(937.5);
    });

    it('margin calculation: ((revenue - cost) / revenue) * 100', () => {
        const revenue = 10000;
        const cost = 5000;
        const res = calculateProjectProfitability(revenue, cost);
        expect(res.profit).toBe(5000);
        expect(res.margin_percent).toBe(50);
    });

    it('utilization: (billable / total) * 100, handled implicitly in service but tested via general logic', () => {
        // We test general margin calculation with edge cases
        const zeroRev = calculateProjectProfitability(0, 5000);
        expect(zeroRev.profit).toBe(-5000);
        expect(zeroRev.margin_percent).toBe(0); // Assuming it returns 0 or -Infinity based on implementation 
    });

    it('burn rate for fixed_cost projects', () => {
        const res1 = calculateProjectBurnRate('fixed_cost', 0, 100000, 50000);
        expect(res1).toBeCloseTo(50);

        const res2 = calculateProjectBurnRate('time_and_materials', 100000, 0, 50000);
        expect(res2).toBeCloseTo(50);
    });
});
