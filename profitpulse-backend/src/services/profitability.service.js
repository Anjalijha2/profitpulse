import db from '../models/index.js';
import * as formulas from '../utils/calculations.js';

export const calculateEmployeeProfitability = async (employeeId, month) => {
    // Find employee and their timesheets for the month
    const employee = await db.Employee.findByPk(employeeId, {
        include: [{ model: db.Department, as: 'department' }]
    });
    if (!employee) throw new Error('Employee not found');

    const whereClause = { employee_id: employeeId };
    if (month) whereClause.month = month;

    const timesheets = await db.Timesheet.findAll({
        where: whereClause,
        include: [{ model: db.Project, as: 'project', attributes: ['id', 'project_code', 'name', 'project_type', 'billing_rate'] }]
    });

    let standardHours = 160;
    let overhead = 180000;
    try {
        const configs = await db.SystemConfig.findAll();
        const shConf = configs.find(c => c.key === 'standard_monthly_hours');
        if (shConf) standardHours = Number(shConf.value);
        const ohConf = configs.find(c => c.key === 'overhead_cost_per_year');
        if (ohConf) overhead = Number(ohConf.value);
    } catch (e) { }

    const cost_per_hour = formulas.calculateEmployeeCostPerHour(employee.annual_ctc, overhead, standardHours);

    let total_billable = 0;
    let total_non_billable = 0;
    let total_revenue = 0;
    let total_cost = 0;
    const projectsArray = [];

    timesheets.forEach(ts => {
        const billable = Number(ts.billable_hours);
        const non_billable = Number(ts.non_billable_hours);
        const total_hours = billable + non_billable;

        total_billable += billable;
        total_non_billable += non_billable;

        const cost = total_hours * cost_per_hour;
        let revenue_contribution = 0;

        if (ts.project && ts.project.project_type === 'tm' && ts.project.billing_rate) {
            revenue_contribution = billable * Number(ts.project.billing_rate);
        }

        const profit = revenue_contribution - cost;

        total_revenue += revenue_contribution;
        total_cost += cost;

        projectsArray.push({
            project_id: ts.project ? ts.project.id : null,
            project_name: ts.project ? ts.project.name : 'Unknown',
            project_type: ts.project ? ts.project.project_type : 'Unknown',
            billable_hours: billable,
            non_billable_hours: non_billable,
            revenue: Number(revenue_contribution.toFixed(2)),
            cost: Number(cost.toFixed(2)),
            profit: Number(profit.toFixed(2))
        });
    });

    const total_profit = total_revenue - total_cost;
    const margin_percent = total_revenue > 0 ? (total_profit / total_revenue) * 100 : 0;
    const total_time = total_billable + total_non_billable;
    const billable_percent = total_time > 0 ? (total_billable / total_time) * 100 : 0;

    return {
        employee: {
            id: employee.id,
            name: employee.name,
            department: { name: employee.department ? employee.department.name : null },
            designation: employee.designation
        },
        month,
        cost_per_hour: Number(cost_per_hour.toFixed(2)),
        total_billable_hours: total_billable,
        total_non_billable_hours: total_non_billable,
        billable_percent: Number(billable_percent.toFixed(2)),
        revenue_contribution: Number(total_revenue.toFixed(2)),
        total_cost: Number(total_cost.toFixed(2)),
        profit: Number(total_profit.toFixed(2)),
        margin_percent: Number(margin_percent.toFixed(2)),
        projects: projectsArray
    };
};

export const calculateProjectProfitability = async (projectId, month) => {
    const project = await db.Project.findByPk(projectId);
    if (!project) throw new Error('Project not found');

    const tsWhere = { project_id: projectId };
    const revWhere = { project_id: projectId };
    if (month) {
        tsWhere.month = month;
        revWhere.month = month;
    }

    const timesheets = await db.Timesheet.findAll({
        where: tsWhere,
        include: [{ model: db.Employee, as: 'employee' }]
    });

    const revenues = await db.Revenue.findAll({
        where: revWhere
    });

    let totalRevenue = 0;
    let totalCost = 0;

    let standardHours = 160;
    let overhead = 180000;
    try {
        const shConf = await db.SystemConfig.findOne({ where: { key: 'standard_monthly_hours' } });
        if (shConf) standardHours = Number(shConf.value);
        const ohConf = await db.SystemConfig.findOne({ where: { key: 'overhead_cost_per_year' } });
        if (ohConf) overhead = Number(ohConf.value);
    } catch (e) { }

    // Calculate Cost
    timesheets.forEach(ts => {
        if (ts.employee) {
            const costPerHour = formulas.calculateEmployeeCostPerHour(ts.employee.annual_ctc, overhead, standardHours);
            totalCost += formulas.calculateTMCost(costPerHour, ts.billable_hours + ts.non_billable_hours);
        }
    });

    // Calculate Revenue
    if (project.project_type === 'tm') {
        revenues.forEach(rev => totalRevenue += Number(rev.invoice_amount));
        // If no explicit invoice, could calculate based on billing_rate * billable_hours across time, but SRD says "Monthly Revenue/Sales Data (Excel upload)" meaning we use actuals.
    } else {
        revenues.forEach(rev => totalRevenue += Number(rev.invoice_amount));
    }

    // Add vendors
    if (project.project_type === 'infrastructure' && project.infra_vendor_cost) {
        totalCost += Number(project.infra_vendor_cost);
    }

    const profit = formulas.calculateProfit(totalRevenue, totalCost);
    const marginPercent = formulas.calculateMarginPercent(totalRevenue, totalCost);

    return {
        project_id: project.id,
        name: project.name,
        project_type: project.project_type,
        total_revenue: totalRevenue,
        total_cost: totalCost,
        profit,
        margin_percent: marginPercent,
        burn_rate: project.project_type === 'fixed_cost' ? formulas.calculateBurnRate(totalCost, project.contract_value) : null
    };
};
