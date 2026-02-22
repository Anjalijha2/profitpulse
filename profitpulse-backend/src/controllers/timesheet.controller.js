import { StatusCodes } from 'http-status-codes';
import asyncHandler from '../utils/asyncHandler.js';
import db from '../models/index.js';

export const listTimesheets = asyncHandler(async (req, res) => {
    const { month, employee_id, project_id, page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const where = {};
    if (month) where.month = month;
    if (employee_id) where.employee_id = employee_id;
    if (project_id) where.project_id = project_id;

    // RBAC
    if (req.user.role === 'department_head') {
        const employees = await db.Employee.findAll({ where: { department_id: req.user.department_id } });
        const employeeIds = employees.map(e => e.id);
        where.employee_id = employee_id ? [employee_id] : employeeIds;
        if (employee_id && !employeeIds.includes(employee_id)) {
            return res.status(StatusCodes.FORBIDDEN).json({ success: false, message: 'Access denied' });
        }
    } else if (req.user.role === 'delivery_manager') {
        const projects = await db.Project.findAll({ where: { delivery_manager_id: req.user.id } });
        const projectIds = projects.map(p => p.id);
        where.project_id = project_id ? [project_id] : projectIds;
        if (project_id && !projectIds.includes(project_id)) {
            return res.status(StatusCodes.FORBIDDEN).json({ success: false, message: 'Access denied' });
        }
    }

    const { count, rows } = await db.Timesheet.findAndCountAll({
        where,
        limit: Number(limit),
        offset,
        include: [
            {
                model: db.Employee,
                as: 'employee',
                attributes: ['name', 'employee_code'],
                include: [{ model: db.Department, as: 'department', attributes: ['name'] }]
            },
            { model: db.Project, as: 'project', attributes: ['name', 'project_type'] }
        ]
    });

    res.status(StatusCodes.OK).json({
        success: true,
        message: 'Timesheet records retrieved',
        data: { timesheets: rows },
        meta: { total: count, page: Number(page), limit: Number(limit) }
    });
});

export const getTimesheetSummary = asyncHandler(async (req, res) => {
    const { month } = req.query;
    const where = {};
    if (month) where.month = month;

    const timesheets = await db.Timesheet.findAll({
        where,
        include: [
            {
                model: db.Employee,
                as: 'employee',
                include: [{ model: db.Department, as: 'department', attributes: ['name'] }]
            },
            { model: db.Project, as: 'project', attributes: ['name'] }
        ]
    });

    let total_billable = 0;
    let total_non_billable = 0;
    const employeeIds = new Set();
    const projectMap = {};
    const departmentMap = {};

    timesheets.forEach(ts => {
        const billable = Number(ts.billable_hours);
        const non_billable = Number(ts.non_billable_hours);

        total_billable += billable;
        total_non_billable += non_billable;

        if (ts.employee_id) employeeIds.add(ts.employee_id);

        const projectName = ts.project ? ts.project.name : 'Unknown';
        if (!projectMap[projectName]) {
            projectMap[projectName] = { billable: 0, non_billable: 0 };
        }
        projectMap[projectName].billable += billable;
        projectMap[projectName].non_billable += non_billable;

        const deptName = ts.employee && ts.employee.department ? ts.employee.department.name : 'Unknown';
        if (!departmentMap[deptName]) {
            departmentMap[deptName] = { billable: 0, non_billable: 0 };
        }
        departmentMap[deptName].billable += billable;
        departmentMap[deptName].non_billable += non_billable;
    });

    const total_time = total_billable + total_non_billable;
    const utilization_percent = total_time > 0 ? (total_billable / total_time) * 100 : 0;

    const by_project = Object.keys(projectMap).map(p => ({
        project_name: p,
        billable: projectMap[p].billable,
        non_billable: projectMap[p].non_billable
    }));

    const by_department = Object.keys(departmentMap).map(d => {
        const d_total = departmentMap[d].billable + departmentMap[d].non_billable;
        const d_util = d_total > 0 ? (departmentMap[d].billable / d_total) * 100 : 0;
        return {
            department: d,
            billable: departmentMap[d].billable,
            non_billable: departmentMap[d].non_billable,
            utilization: Number(d_util.toFixed(2))
        };
    });

    res.status(StatusCodes.OK).json({
        success: true,
        data: {
            total_billable_hours: total_billable,
            total_non_billable_hours: total_non_billable,
            distinct_employees: employeeIds.size,
            utilization_percent: Number(utilization_percent.toFixed(2)),
            by_project,
            by_department
        }
    });
});
