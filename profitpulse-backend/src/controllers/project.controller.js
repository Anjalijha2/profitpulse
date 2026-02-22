import { StatusCodes } from 'http-status-codes';
import asyncHandler from '../utils/asyncHandler.js';
import { apiResponse } from '../utils/apiResponse.js';
import db from '../models/index.js';

import { calculateProjectProfitability } from '../services/profitability.service.js';

export const listProjects = asyncHandler(async (req, res) => {
    const { project_type, client_id, vertical, status, page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const where = {};
    if (project_type) where.project_type = project_type;
    if (client_id) where.client_id = client_id;
    if (vertical) where.vertical = vertical;
    if (status) where.status = status;

    // RBAC
    if (req.user.role === 'delivery_manager') {
        where.delivery_manager_id = req.user.id;
    }

    const { count, rows } = await db.Project.findAndCountAll({
        where,
        limit: Number(limit),
        offset,
        include: [{ model: db.Client, as: 'client', attributes: ['name'] }]
    });

    res.status(StatusCodes.OK).json({ success: true, message: 'Projects retrieved', data: rows, meta: { total: count, page: Number(page), limit: Number(limit) } });
});

export const getProject = asyncHandler(async (req, res) => {
    const project = await db.Project.findByPk(req.params.id, {
        include: [
            { model: db.Client, as: 'client' },
            { model: db.User, as: 'delivery_manager', attributes: ['id', 'name'] }
        ]
    });
    if (!project) return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Project not found' });

    // RBAC
    if (req.user.role === 'delivery_manager' && project.delivery_manager_id !== req.user.id) {
        return res.status(StatusCodes.FORBIDDEN).json({ success: false, message: 'Access denied' });
    }

    res.status(StatusCodes.OK).json({ success: true, data: project });
});

export const createProject = asyncHandler(async (req, res) => {
    const project = await db.Project.create(req.body);
    res.status(StatusCodes.CREATED).json({ success: true, message: 'Project created', data: project });
});

export const updateProject = asyncHandler(async (req, res) => {
    const project = await db.Project.findByPk(req.params.id);
    if (!project) return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Not found' });

    // RBAC
    if (req.user.role === 'delivery_manager' && project.delivery_manager_id !== req.user.id) {
        return res.status(StatusCodes.FORBIDDEN).json({ success: false, message: 'Access denied' });
    }

    await project.update(req.body);
    res.status(StatusCodes.OK).json({ success: true, message: 'Project updated', data: project });
});

import * as formulas from '../utils/calculations.js';

export const getProjectProfitability = asyncHandler(async (req, res) => {
    const { month } = req.query;
    if (!month) return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: 'month query parameter is required' });

    const project = await db.Project.findByPk(req.params.id, {
        include: [{ model: db.Client, as: 'client' }]
    });
    if (!project) return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Project not found' });

    // RBAC
    if (req.user.role === 'delivery_manager' && project.delivery_manager_id !== req.user.id) {
        return res.status(StatusCodes.FORBIDDEN).json({ success: false, message: 'Access denied' });
    }

    const revenues = await db.Revenue.findAll({ where: { project_id: req.params.id, month } });
    const total_revenue = revenues.reduce((acc, rev) => acc + Number(rev.invoice_amount), 0);

    const timesheets = await db.Timesheet.findAll({
        where: { project_id: req.params.id, month },
        include: [{ model: db.Employee, as: 'employee' }]
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

    let total_cost = 0;
    const employeesData = [];

    timesheets.forEach(ts => {
        if (!ts.employee) return;
        const employee = ts.employee;
        const cost_per_hour = formulas.calculateEmployeeCostPerHour(employee.annual_ctc, overhead, standardHours);
        const billable = Number(ts.billable_hours);
        const non_billable = Number(ts.non_billable_hours);
        const cost = (billable + non_billable) * cost_per_hour;

        total_cost += cost;

        employeesData.push({
            name: employee.name,
            designation: employee.designation,
            billable_hours: billable,
            non_billable_hours: non_billable,
            cost_per_hour: Number(cost_per_hour.toFixed(2)),
            total_cost: Number(cost.toFixed(2))
        });
    });

    if (project.project_type === 'infrastructure' && project.infra_vendor_cost) {
        total_cost += Number(project.infra_vendor_cost);
    }

    const profit = total_revenue - total_cost;
    const margin_percent = total_revenue > 0 ? (profit / total_revenue) * 100 : 0;

    res.status(StatusCodes.OK).json({
        success: true,
        data: {
            project: {
                id: project.id,
                name: project.name,
                code: project.project_code,
                type: project.project_type,
                client_name: project.client ? project.client.name : null,
                vertical: project.vertical,
                status: project.status
            },
            month,
            revenue: Number(total_revenue.toFixed(2)),
            total_cost: Number(total_cost.toFixed(2)),
            profit: Number(profit.toFixed(2)),
            margin_percent: Number(margin_percent.toFixed(2)),
            employees: employeesData
        }
    });
});

export const getProjectBurnRate = asyncHandler(async (req, res) => {
    const project = await db.Project.findByPk(req.params.id);
    if (!project) return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Project not found' });

    // RBAC
    if (req.user.role === 'delivery_manager' && project.delivery_manager_id !== req.user.id) {
        return res.status(StatusCodes.FORBIDDEN).json({ success: false, message: 'Access denied' });
    }

    if (project.project_type !== 'fixed_cost') {
        return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: 'Burn rate is only applicable to Fixed Cost projects' });
    }

    const total_budget = Number(project.contract_value || 0);

    const timesheets = await db.Timesheet.findAll({
        where: { project_id: req.params.id },
        include: [{ model: db.Employee, as: 'employee' }]
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

    let actual_cost_to_date = 0;
    const monthly_breakdown_map = {};

    timesheets.forEach(ts => {
        if (!ts.employee) return;
        const employee = ts.employee;
        const cost_per_hour = formulas.calculateEmployeeCostPerHour(employee.annual_ctc, overhead, standardHours);
        const cost = (Number(ts.billable_hours) + Number(ts.non_billable_hours)) * cost_per_hour;

        actual_cost_to_date += cost;
        if (!monthly_breakdown_map[ts.month]) monthly_breakdown_map[ts.month] = 0;
        monthly_breakdown_map[ts.month] += cost;
    });

    const budget_consumed_percent = total_budget > 0 ? (actual_cost_to_date / total_budget) * 100 : 0;
    const months_elapsed = Object.keys(monthly_breakdown_map).length;
    const avg_monthly_burn = months_elapsed > 0 ? actual_cost_to_date / months_elapsed : 0;
    const budget_remaining = total_budget - actual_cost_to_date;

    let status = 'under_budget';
    if (budget_consumed_percent > 100) status = 'over_budget';
    else if (budget_consumed_percent >= 75) status = 'on_track';

    const monthly_breakdown = Object.keys(monthly_breakdown_map).sort().map(m => ({
        month: m,
        cost: Number(monthly_breakdown_map[m].toFixed(2))
    }));

    res.status(StatusCodes.OK).json({
        success: true,
        data: {
            project: {
                id: project.id,
                name: project.name,
                type: project.project_type
            },
            total_budget,
            actual_cost_to_date: Number(actual_cost_to_date.toFixed(2)),
            budget_consumed_percent: Number(budget_consumed_percent.toFixed(2)),
            budget_remaining: Number(budget_remaining.toFixed(2)),
            months_elapsed,
            avg_monthly_burn: Number(avg_monthly_burn.toFixed(2)),
            status,
            monthly_breakdown
        }
    });
});
