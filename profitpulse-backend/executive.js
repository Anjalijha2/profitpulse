import db from '../models/index.js';
import { calculateProjectProfitability } from './profitability.service.js';

export const getExecutiveDashboard = async (month, year) => {
    // Aggregate company wide logic
    const projects = await db.Project.findAll({ attributes: ['id', 'name', 'status'] });

    let totalRev = 0;
    let totalCost = 0;
    let projectStats = [];

    // This is a slow loop for huge datasets, but fine for 100+ projects
    for (let p of projects) {
        const prof = await calculateProjectProfitability(p.id, month); // simplified
        totalRev += prof.total_revenue;
        totalCost += prof.total_cost;
        projectStats.push(prof);
    }

    // Sort for top 5 / bottom 5
    projectStats.sort((a, b) => b.margin_percent - a.margin_percent);

    const top5 = projectStats.slice(0, 5);
    const bottom5 = projectStats.slice(-5).reverse();

    let gm = 0;
    if (totalRev > 0) gm = ((totalRev - totalCost) / totalRev) * 100;
    else if (totalCost > 0) gm = -100;

    return {
        total_revenue: totalRev,
        total_cost: totalCost,
        gross_margin_percent: Number(gm.toFixed(2)),
        utilization_percent: 85.5, // Mocked overall util for now, requires deep timesheet scan
        top_5_projects: top5,
        bottom_5_projects: bottom5
    };
};
