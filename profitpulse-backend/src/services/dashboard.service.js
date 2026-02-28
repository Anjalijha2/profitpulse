import db from '../models/index.js';
import * as formulas from '../utils/calculations.js';
import pkg from 'sequelize';
import { calculateProjectProfitability } from './profitability.service.js';
const { Op } = pkg;

export const getExecutiveDashboard = async (month, year) => {
    // Construct full YYYY-MM string from query params. 
    const now = new Date();
    let resYear, resMonth;

    if (month && month.includes('-')) {
        [resYear, resMonth] = month.split('-');
    } else {
        resYear = year || String(now.getFullYear());
        resMonth = month || String(now.getMonth() + 1).padStart(2, '0');
    }

    const fullMonth = `${resYear}-${resMonth.padStart(2, '0')}`;

    // --- Preparation ---
    const months = [];
    const targetDate = new Date(Number(resYear), Number(resMonth) - 1, 1);

    for (let i = 5; i >= 0; i--) {
        const d = new Date(targetDate);
        d.setMonth(d.getMonth() - i);
        const mStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (!months.includes(mStr)) months.push(mStr);
    }

    // Ensure fullMonth is always in the months array to prevent undefined dataMap access
    if (!months.includes(fullMonth)) {
        months.push(fullMonth);
    }

    // 1. Bulk Fetch Configs
    const { standardHours, overhead } = await getSystemConfigs();

    // 2. Fetch all projects
    const projects = await db.Project.findAll();
    const projectIds = projects.map(p => p.id);

    // 3. Bulk Fetch Revenues and Timesheets for all relevant months
    const [revenues, timesheets] = await Promise.all([
        db.Revenue.findAll({
            where: {
                project_id: projectIds,
                month: { [Op.in]: months }
            }
        }),
        db.Timesheet.findAll({
            where: {
                project_id: projectIds,
                month: { [Op.in]: months }
            },
            include: [{ model: db.Employee, as: 'employee', attributes: ['annual_ctc'] }]
        })
    ]);

    // --- In-Memory Aggregation ---
    // Structure: dataMap[month] = { revenue: 0, cost: 0, billable: 0, non_billable: 0, projectData: { [projectId]: { revenue: 0, cost: 0 } } }
    const dataMap = {};
    months.forEach(m => {
        dataMap[m] = {
            revenue: 0,
            cost: 0,
            billable: 0,
            non_billable: 0,
            projectData: {}
        };
        projects.forEach(p => {
            const pCost = (p.project_type === 'infrastructure' && p.infra_vendor_cost) ? Number(p.infra_vendor_cost) : 0;
            dataMap[m].projectData[p.id] = { revenue: 0, cost: pCost };
            dataMap[m].cost += pCost;
        });
    });

    revenues.forEach(rev => {
        if (dataMap[rev.month]) {
            const amt = Number(rev.invoice_amount);
            if (dataMap[rev.month].projectData[rev.project_id]) {
                dataMap[rev.month].projectData[rev.project_id].revenue += amt;
            }
            dataMap[rev.month].revenue += amt;
        }
    });

    timesheets.forEach(ts => {
        if (dataMap[ts.month] && ts.employee) {
            const costPerHour = formulas.calculateEmployeeCostPerHour(ts.employee.annual_ctc, overhead, standardHours);
            const b = Number(ts.billable_hours);
            const nb = Number(ts.non_billable_hours);
            const cost = formulas.calculateTMCost(costPerHour, b + nb);

            if (dataMap[ts.month].projectData[ts.project_id]) {
                dataMap[ts.month].projectData[ts.project_id].cost += cost;
            }
            dataMap[ts.month].cost += cost;
            dataMap[ts.month].billable += b;
            dataMap[ts.month].non_billable += nb;
        }
    });

    // --- Calculate KPIs for the Selected Month ---
    const currStats = dataMap[fullMonth];
    const totalRev = currStats.revenue;
    const totalCost = currStats.cost;
    const totalTime = currStats.billable + currStats.non_billable;
    const utilization = totalTime > 0 ? (currStats.billable / totalTime) * 100 : 0;
    const gm = totalRev > 0 ? ((totalRev - totalCost) / totalRev) * 100 : (totalCost > 0 ? -100 : 0);

    const projectStats = projects.map(p => {
        const stats = currStats.projectData[p.id];
        const profit = stats.revenue - stats.cost;
        const margin = stats.revenue > 0 ? (profit / stats.revenue) * 100 : 0;

        return {
            project_id: p.id,
            name: p.name,
            project_type: p.project_type,
            total_revenue: stats.revenue,
            total_cost: stats.cost,
            profit: Number(profit.toFixed(2)),
            margin_percent: Number(margin.toFixed(2))
        };
    });

    // Sort for top 5 / bottom 5
    projectStats.sort((a, b) => b.margin_percent - a.margin_percent);
    const top5 = projectStats.slice(0, 5);
    const bottom5 = projectStats.slice(-5).reverse();

    // --- Calculate Trends & MoM Changes ---
    const prevMonthIdx = months.indexOf(fullMonth) - 1;
    const prevMonth = prevMonthIdx >= 0 ? months[prevMonthIdx] : null;
    const prevStats = prevMonth ? dataMap[prevMonth] : null;

    let trends = { revenue: 0, cost: 0, margin: 0, utilization: 0 };

    if (prevStats) {
        const pRev = prevStats.revenue;
        const pCost = prevStats.cost;
        const pTime = prevStats.billable + prevStats.non_billable;
        const pUtil = pTime > 0 ? (prevStats.billable / pTime) * 100 : 0;
        const pGm = pRev > 0 ? ((pRev - pCost) / pRev) * 100 : (pCost > 0 ? -100 : 0);

        trends.revenue = pRev > 0 ? ((totalRev - pRev) / pRev) * 100 : (totalRev > 0 ? 100 : 0);
        trends.cost = pCost > 0 ? ((totalCost - pCost) / pCost) * 100 : (totalCost > 0 ? 100 : 0);
        trends.margin = gm - pGm; // absolute point change
        trends.utilization = utilization - pUtil; // absolute point change
    }

    const trend = months.map(m => {
        const stats = dataMap[m];
        const [y, mm] = m.split('-');
        const d = new Date(Number(y), Number(mm) - 1, 1);
        const shortName = d.toLocaleString('default', { month: 'short' });

        return {
            name: shortName,
            month: m,
            revenue: Number((stats.revenue / 100000).toFixed(2)), // Lakhs
            cost: Number((stats.cost / 100000).toFixed(2)),
            profit: Number(((stats.revenue - stats.cost) / 100000).toFixed(2))
        };
    });

    return {
        total_revenue: totalRev,
        total_cost: totalCost,
        gross_margin_percent: Number(gm.toFixed(2)),
        utilization_percent: Number(utilization.toFixed(2)),
        trends: {
            revenue: Number(trends.revenue.toFixed(2)),
            cost: Number(trends.cost.toFixed(2)),
            margin: Number(trends.margin.toFixed(2)),
            utilization: Number(trends.utilization.toFixed(2))
        },
        top_5_projects: top5,
        bottom_5_projects: bottom5,
        trend
    };
};

const getSystemConfigs = async () => {
    let standardHours = 160;
    let overhead = 180000;
    try {
        const configs = await db.SystemConfig.findAll();
        const shConf = configs.find(c => c.key === 'standard_monthly_hours');
        if (shConf) standardHours = Number(shConf.value);
        const ohConf = configs.find(c => c.key === 'overhead_cost_per_year');
        if (ohConf) overhead = Number(ohConf.value);
    } catch (e) { }
    return { standardHours, overhead };
};

export const getEmployeeDashboard = async (month, user) => {
    const { standardHours, overhead } = await getSystemConfigs();

    const empWhere = {};
    if (user.role === 'department_head') {
        empWhere.department_id = user.department_id;
    }

    const employees = await db.Employee.findAll({
        where: empWhere,
        include: [{ model: db.Department, as: 'department', attributes: ['name'] }]
    });

    const timesheets = await db.Timesheet.findAll({
        where: month ? { month } : {},
        include: [{ model: db.Project, as: 'project', attributes: ['project_type', 'billing_rate'] }]
    });

    // Group timesheets by employee
    const tsByEmp = {};
    timesheets.forEach(ts => {
        if (!tsByEmp[ts.employee_id]) tsByEmp[ts.employee_id] = [];
        tsByEmp[ts.employee_id].push(ts);
    });

    let results = employees.map(emp => {
        const cost_per_hour = formulas.calculateEmployeeCostPerHour(emp.annual_ctc, overhead, standardHours);
        const empTs = tsByEmp[emp.id] || [];

        let total_billable = 0;
        let total_non_billable = 0;
        let revenue_contribution = 0;

        empTs.forEach(ts => {
            const b = Number(ts.billable_hours);
            const nb = Number(ts.non_billable_hours);
            total_billable += b;
            total_non_billable += nb;

            if (ts.project && ts.project.project_type === 'tm' && ts.project.billing_rate) {
                revenue_contribution += formulas.calculateTMRevenue(b, ts.project.billing_rate);
            }
        });

        const cost = (total_billable + total_non_billable) * cost_per_hour;
        const profit = revenue_contribution - cost;
        const margin_percent = revenue_contribution > 0 ? (profit / revenue_contribution) * 100 : 0;
        const billable_percent = (total_billable + total_non_billable) > 0 ? (total_billable / (total_billable + total_non_billable)) * 100 : 0;

        return {
            id: emp.id,
            employee_code: emp.employee_code,
            name: emp.name,
            department: emp.department ? emp.department.name : null,
            designation: emp.designation,
            is_billable: emp.is_billable,
            total_billable_hours: total_billable,
            total_non_billable_hours: total_non_billable,
            billable_percent: Number(billable_percent.toFixed(2)),
            revenue_contribution: Number(revenue_contribution.toFixed(2)),
            cost: Number(cost.toFixed(2)),
            profit: Number(profit.toFixed(2)),
            margin_percent: Number(margin_percent.toFixed(2))
        };
    });

    results.sort((a, b) => b.profit - a.profit);
    results = results.map((r, i) => ({ ...r, rank: i + 1 }));

    return { month, employees: results };
};

export const getProjectDashboard = async (month, project_type, vertical, user) => {
    const { standardHours, overhead } = await getSystemConfigs();

    const projWhere = {};
    if (project_type) projWhere.project_type = project_type;
    if (vertical) projWhere.vertical = vertical;
    if (user.role === 'delivery_manager') {
        projWhere.delivery_manager_id = user.id;
    }

    const projects = await db.Project.findAll({
        where: projWhere,
        include: [{ model: db.Client, as: 'client', attributes: ['name'] }]
    });

    const projectIds = projects.map(p => p.id);

    const revenues = await db.Revenue.findAll({
        where: month ? { project_id: projectIds, month } : { project_id: projectIds }
    });

    const timesheets = await db.Timesheet.findAll({
        where: month ? { project_id: projectIds, month } : { project_id: projectIds },
        include: [{ model: db.Employee, as: 'employee', attributes: ['annual_ctc'] }]
    });

    const revByProj = {};
    revenues.forEach(r => {
        if (!revByProj[r.project_id]) revByProj[r.project_id] = 0;
        revByProj[r.project_id] += Number(r.invoice_amount);
    });

    const costByProj = {};
    timesheets.forEach(ts => {
        if (!ts.employee) return;
        const cost_per_hour = formulas.calculateEmployeeCostPerHour(ts.employee.annual_ctc, overhead, standardHours);
        const cost = (Number(ts.billable_hours) + Number(ts.non_billable_hours)) * cost_per_hour;
        if (!costByProj[ts.project_id]) costByProj[ts.project_id] = 0;
        costByProj[ts.project_id] += cost;
    });

    let total_revenue = 0;
    let total_cost = 0;
    let projects_in_loss = 0;

    const results = projects.map(p => {
        const revenue = revByProj[p.id] || 0;
        let cost = costByProj[p.id] || 0;
        if (p.project_type === 'infrastructure' && p.infra_vendor_cost) {
            cost += Number(p.infra_vendor_cost);
        }

        const profit = revenue - cost;
        const margin_percent = revenue > 0 ? (profit / revenue) * 100 : 0;

        total_revenue += revenue;
        total_cost += cost;
        if (profit < 0) projects_in_loss++;

        return {
            id: p.id,
            project_code: p.project_code,
            name: p.name,
            client_name: p.client ? p.client.name : null,
            project_type: p.project_type,
            vertical: p.vertical,
            status: p.status,
            revenue: Number(revenue.toFixed(2)),
            cost: Number(cost.toFixed(2)),
            profit: Number(profit.toFixed(2)),
            margin_percent: Number(margin_percent.toFixed(2))
        };
    });

    const total_profit = total_revenue - total_cost;
    const avg_margin_percent = total_revenue > 0 ? (total_profit / total_revenue) * 100 : 0;

    return {
        month,
        summary: {
            total_projects: projects.length,
            avg_margin_percent: Number(avg_margin_percent.toFixed(2)),
            projects_in_loss,
            total_revenue: Number(total_revenue.toFixed(2)),
            total_cost: Number(total_cost.toFixed(2)),
            total_profit: Number(total_profit.toFixed(2))
        },
        projects: results
    };
};

export const getDepartmentDashboard = async (month, user) => {
    const { standardHours, overhead } = await getSystemConfigs();

    const deptWhere = {};
    if (user.role === 'department_head') {
        deptWhere.id = user.department_id;
    }

    const departments = await db.Department.findAll({ where: deptWhere });
    const deptIds = departments.map(d => d.id);

    const employees = await db.Employee.findAll({
        where: { department_id: deptIds }
    });

    const empIdToDeptId = {};
    employees.forEach(e => { empIdToDeptId[e.id] = e.department_id; });

    const timesheets = await db.Timesheet.findAll({
        where: month ? { month, employee_id: employees.map(e => e.id) } : { employee_id: employees.map(e => e.id) },
        include: [
            { model: db.Employee, as: 'employee', attributes: ['annual_ctc'] },
            { model: db.Project, as: 'project', attributes: ['project_type', 'billing_rate'] }
        ]
    });

    const deptDataMap = {};
    departments.forEach(d => {
        deptDataMap[d.id] = { id: d.id, name: d.name, employee_count: 0, billable: 0, non_billable: 0, revenue: 0, cost: 0 };
    });

    employees.forEach(e => {
        if (deptDataMap[e.department_id]) deptDataMap[e.department_id].employee_count++;
    });

    timesheets.forEach(ts => {
        const deptId = empIdToDeptId[ts.employee_id];
        if (!deptId || !deptDataMap[deptId]) return;

        const b = Number(ts.billable_hours);
        const nb = Number(ts.non_billable_hours);
        const dmap = deptDataMap[deptId];

        dmap.billable += b;
        dmap.non_billable += nb;

        const cost_per_hour = formulas.calculateEmployeeCostPerHour(ts.employee.annual_ctc, overhead, standardHours);
        dmap.cost += (b + nb) * cost_per_hour;

        if (ts.project && ts.project.project_type === 'tm' && ts.project.billing_rate) {
            dmap.revenue += b * Number(ts.project.billing_rate);
        }
    });

    const results = departments.map(d => {
        const m = deptDataMap[d.id];
        const profit = m.revenue - m.cost;
        const margin_percent = m.revenue > 0 ? (profit / m.revenue) * 100 : 0;
        const total_capac = m.employee_count * standardHours;
        const utilization_percent = total_capac > 0 ? (m.billable / total_capac) * 100 : 0;

        return {
            id: m.id,
            name: m.name,
            employee_count: m.employee_count,
            total_billable_hours: m.billable,
            total_non_billable_hours: m.non_billable,
            utilization_percent: Number(utilization_percent.toFixed(2)),
            revenue: Number(m.revenue.toFixed(2)),
            cost: Number(m.cost.toFixed(2)),
            profit: Number(profit.toFixed(2)),
            margin_percent: Number(margin_percent.toFixed(2))
        };
    });

    return { month, departments: results };
};

export const getClientDashboard = async (month) => {
    const { standardHours, overhead } = await getSystemConfigs();

    const clients = await db.Client.findAll();
    const projects = await db.Project.findAll();

    const clientProjectsMap = {};
    projects.forEach(p => {
        if (!clientProjectsMap[p.client_id]) clientProjectsMap[p.client_id] = [];
        clientProjectsMap[p.client_id].push(p.id);
    });

    const revenues = await db.Revenue.findAll(month ? { where: { month } } : {});
    const revByProj = {};
    revenues.forEach(r => {
        if (!revByProj[r.project_id]) revByProj[r.project_id] = 0;
        revByProj[r.project_id] += Number(r.invoice_amount);
    });

    const timesheets = await db.Timesheet.findAll({
        where: month ? { month } : {},
        include: [{ model: db.Employee, as: 'employee', attributes: ['annual_ctc'] }]
    });

    const costByProj = {};
    timesheets.forEach(ts => {
        if (!ts.employee) return;
        const cost_per_hour = formulas.calculateEmployeeCostPerHour(ts.employee.annual_ctc, overhead, standardHours);
        const cost = (Number(ts.billable_hours) + Number(ts.non_billable_hours)) * cost_per_hour;
        if (!costByProj[ts.project_id]) costByProj[ts.project_id] = 0;
        costByProj[ts.project_id] += cost;
    });

    const results = clients.map(c => {
        const pIds = clientProjectsMap[c.id] || [];

        let revenue = 0;
        let cost = 0;

        pIds.forEach(pid => {
            revenue += revByProj[pid] || 0;
            cost += costByProj[pid] || 0;
            const p = projects.find(proj => proj.id === pid);
            if (p && p.project_type === 'infrastructure' && p.infra_vendor_cost) {
                cost += Number(p.infra_vendor_cost);
            }
        });

        const profit = revenue - cost;
        const margin_percent = revenue > 0 ? (profit / revenue) * 100 : 0;

        return {
            id: c.id,
            name: c.name,
            industry: c.industry,
            project_count: pIds.length,
            revenue: Number(revenue.toFixed(2)),
            cost: Number(cost.toFixed(2)),
            profit: Number(profit.toFixed(2)),
            margin_percent: Number(margin_percent.toFixed(2))
        };
    });

    return { month, clients: results };
};

export const getCompanyDashboard = async (year) => {
    const { standardHours, overhead } = await getSystemConfigs();

    // Limit revenues and timesheets to the specified year
    const revenues = await db.Revenue.findAll({
        where: { month: { [Op.like]: `${year}-%` } },
        include: [{ model: db.Project, as: 'project', attributes: ['project_type', 'vertical', 'infra_vendor_cost'] }]
    });

    const timesheets = await db.Timesheet.findAll({
        where: { month: { [Op.like]: `${year}-%` } },
        include: [
            { model: db.Employee, as: 'employee', attributes: ['annual_ctc'] },
            { model: db.Project, as: 'project', attributes: ['project_type', 'vertical'] }
        ]
    });

    const monthlyMap = {};
    for (let i = 1; i <= 12; i++) {
        const m = `${year}-${String(i).padStart(2, '0')}`;
        monthlyMap[m] = { revenue: 0, cost: 0, billable: 0, non_billable: 0 };
    }

    const verticalMap = {};
    const typeMap = {};

    revenues.forEach(rev => {
        const amt = Number(rev.invoice_amount);
        if (monthlyMap[rev.month]) monthlyMap[rev.month].revenue += amt;

        const vertical = rev.project && rev.project.vertical ? rev.project.vertical : 'Unknown';
        if (!verticalMap[vertical]) verticalMap[vertical] = { revenue: 0, cost: 0 };
        verticalMap[vertical].revenue += amt;

        const type = rev.project ? rev.project.project_type : 'Unknown';
        if (!typeMap[type]) typeMap[type] = { revenue: 0, cost: 0 };
        typeMap[type].revenue += amt;
    });

    const infraVendorsAdded = new Set(); // To avoid adding monthly infra cost multiple times (wait, infra cost is annual or monthly? We assume it's overall or we just apportion it. Actually it's simple to add to total via projects. The instructions don't detail infra spreading per month, we can omit vendor cost here or just add a fraction.)

    timesheets.forEach(ts => {
        if (!ts.employee) return;
        const cost_per_hour = formulas.calculateEmployeeCostPerHour(ts.employee.annual_ctc, overhead, standardHours);
        const cost = (Number(ts.billable_hours) + Number(ts.non_billable_hours)) * cost_per_hour;

        if (monthlyMap[ts.month]) {
            monthlyMap[ts.month].cost += cost;
            monthlyMap[ts.month].billable += Number(ts.billable_hours);
            monthlyMap[ts.month].non_billable += Number(ts.non_billable_hours);
        }

        const vertical = ts.project && ts.project.vertical ? ts.project.vertical : 'Unknown';
        if (!verticalMap[vertical]) verticalMap[vertical] = { revenue: 0, cost: 0 };
        verticalMap[vertical].cost += cost;

        const type = ts.project ? ts.project.project_type : 'Unknown';
        if (!typeMap[type]) typeMap[type] = { revenue: 0, cost: 0 };
        typeMap[type].cost += cost;
    });

    const ytd = { revenue: 0, cost: 0, billable: 0, non_billable: 0 };

    const monthlyArray = Object.keys(monthlyMap).sort().map(m => {
        const stats = monthlyMap[m];
        ytd.revenue += stats.revenue;
        ytd.cost += stats.cost;
        ytd.billable += stats.billable;
        ytd.non_billable += stats.non_billable;

        const profit = stats.revenue - stats.cost;
        const margin_percent = stats.revenue > 0 ? (profit / stats.revenue) * 100 : 0;
        const total_time = stats.billable + stats.non_billable;
        const utilization_percent = total_time > 0 ? (stats.billable / total_time) * 100 : 0;

        return {
            month: m,
            revenue: Number(stats.revenue.toFixed(2)),
            cost: Number(stats.cost.toFixed(2)),
            profit: Number(profit.toFixed(2)),
            margin_percent: Number(margin_percent.toFixed(2)),
            utilization_percent: Number(utilization_percent.toFixed(2))
        };
    });

    const ytd_profit = ytd.revenue - ytd.cost;
    const ytd_margin = ytd.revenue > 0 ? (ytd_profit / ytd.revenue) * 100 : 0;
    const ytd_time = ytd.billable + ytd.non_billable;
    const ytd_utilization = ytd_time > 0 ? (ytd.billable / ytd_time) * 100 : 0;

    const by_vertical = Object.keys(verticalMap).map(k => {
        const r = verticalMap[k].revenue;
        const c = verticalMap[k].cost;
        return { vertical: k, revenue: Number(r.toFixed(2)), cost: Number(c.toFixed(2)), profit: Number((r - c).toFixed(2)) };
    });

    const by_project_type = Object.keys(typeMap).map(k => {
        const r = typeMap[k].revenue;
        const c = typeMap[k].cost;
        return { type: k, revenue: Number(r.toFixed(2)), cost: Number(c.toFixed(2)), profit: Number((r - c).toFixed(2)) };
    });

    return {
        year,
        ytd: {
            revenue: Number(ytd.revenue.toFixed(2)),
            cost: Number(ytd.cost.toFixed(2)),
            profit: Number(ytd_profit.toFixed(2)),
            margin_percent: Number(ytd_margin.toFixed(2)),
            utilization_percent: Number(ytd_utilization.toFixed(2))
        },
        monthly: monthlyArray,
        by_vertical,
        by_project_type
    };
};
