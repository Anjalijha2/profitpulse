import { exportToExcel } from '../utils/excelExporter.js';
import db from '../models/index.js';
import { calculateProjectProfitability } from './profitability.service.js';
import { getEmployeeDashboard, getDepartmentDashboard } from './dashboard.service.js';

export const generateProjectReport = async (filters) => {
    const projects = await db.Project.findAll({ where: filters });

    const data = await Promise.all(projects.map(async (p) => {
        const prof = await calculateProjectProfitability(p.id);
        return {
            Code: p.project_code,
            Name: p.name,
            Type: p.project_type,
            Revenue: prof.total_revenue,
            Cost: prof.total_cost,
            Profit: prof.profit,
            MarginPercent: prof.margin_percent,
            BurnRate: prof.burn_rate || 'N/A'
        };
    }));

    const columns = [
        { header: 'Project Code', key: 'Code', width: 15 },
        { header: 'Project Name', key: 'Name', width: 30 },
        { header: 'Type', key: 'Type', width: 15 },
        { header: 'Revenue (INR)', key: 'Revenue', width: 20 },
        { header: 'Cost (INR)', key: 'Cost', width: 20 },
        { header: 'Profit (INR)', key: 'Profit', width: 20 },
        { header: 'Margin %', key: 'MarginPercent', width: 15 },
        { header: 'Burn Rate %', key: 'BurnRate', width: 15 }
    ];

    return exportToExcel(columns, data, 'Project Profitability');
};

export const generateEmployeeReport = async (filters) => {
    // Assuming user is an admin for report generation purposes, unless scoping is added
    const data = await getEmployeeDashboard(filters.month, { role: 'admin' });
    const formattedData = data.employees.map(e => ({
        EmpCode: e.employee_code,
        Name: e.name,
        Department: e.department,
        Designation: e.designation,
        IsBillable: e.is_billable,
        BillablePercent: e.billable_percent,
        Revenue: e.revenue_contribution,
        Cost: e.cost,
        Profit: e.profit,
        MarginPercent: e.margin_percent
    }));

    const columns = [
        { header: 'Employee Code', key: 'EmpCode', width: 15 },
        { header: 'Employee Name', key: 'Name', width: 25 },
        { header: 'Department', key: 'Department', width: 20 },
        { header: 'Designation', key: 'Designation', width: 20 },
        { header: 'Is Billable', key: 'IsBillable', width: 15 },
        { header: 'Billable %', key: 'BillablePercent', width: 15 },
        { header: 'Revenue (INR)', key: 'Revenue', width: 20 },
        { header: 'Cost (INR)', key: 'Cost', width: 20 },
        { header: 'Profit (INR)', key: 'Profit', width: 20 },
        { header: 'Margin %', key: 'MarginPercent', width: 15 }
    ];

    return exportToExcel(columns, formattedData, 'Employee Profitability');
};

export const generateDepartmentReport = async (filters) => {
    const data = await getDepartmentDashboard(filters.month, { role: 'admin' });
    const formattedData = data.departments.map(d => ({
        Name: d.name,
        EmpCount: d.employee_count,
        BillableHours: d.total_billable_hours,
        NonBillableHours: d.total_non_billable_hours,
        Utilization: d.utilization_percent,
        Revenue: d.revenue,
        Cost: d.cost,
        Profit: d.profit,
        MarginPercent: d.margin_percent
    }));

    const columns = [
        { header: 'Department', key: 'Name', width: 25 },
        { header: 'Employee Count', key: 'EmpCount', width: 15 },
        { header: 'Billable Hours', key: 'BillableHours', width: 15 },
        { header: 'Non-Billable Hours', key: 'NonBillableHours', width: 15 },
        { header: 'Utilization %', key: 'Utilization', width: 15 },
        { header: 'Revenue (INR)', key: 'Revenue', width: 20 },
        { header: 'Cost (INR)', key: 'Cost', width: 20 },
        { header: 'Profit (INR)', key: 'Profit', width: 20 },
        { header: 'Margin %', key: 'MarginPercent', width: 15 }
    ];

    return exportToExcel(columns, formattedData, 'Department Profitability');
};

export const generateUtilizationReport = async (filters) => {
    const data = await getEmployeeDashboard(filters.month, { role: 'admin' });
    const formattedData = data.employees.map(e => ({
        EmpCode: e.employee_code,
        Name: e.name,
        Department: e.department,
        Designation: e.designation,
        BillableHours: e.total_billable_hours,
        NonBillableHours: e.total_non_billable_hours,
        Utilization: e.billable_percent
    }));

    const columns = [
        { header: 'Employee Code', key: 'EmpCode', width: 15 },
        { header: 'Employee Name', key: 'Name', width: 25 },
        { header: 'Department', key: 'Department', width: 20 },
        { header: 'Designation', key: 'Designation', width: 20 },
        { header: 'Billable Hours', key: 'BillableHours', width: 15 },
        { header: 'Non-Billable Hours', key: 'NonBillableHours', width: 15 },
        { header: 'Utilization %', key: 'Utilization', width: 15 }
    ];

    return exportToExcel(columns, formattedData, 'Utilization Report');
};
