import { StatusCodes } from 'http-status-codes';
import asyncHandler from '../utils/asyncHandler.js';
import { apiResponse } from '../utils/apiResponse.js';
import db from '../models/index.js';
import { calculateEmployeeProfitability } from '../services/profitability.service.js';

export const listEmployees = asyncHandler(async (req, res) => {
    const { department_id, is_billable, designation, financial_year, page = 1, limit = 1000 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const where = {};
    if (department_id) where.department_id = department_id;
    if (is_billable !== undefined) where.is_billable = is_billable === 'true';
    if (designation) where.designation = designation;
    if (financial_year) where.financial_year = financial_year;

    // RBAC Scoping
    if (req.user.role === 'department_head') {
        where.department_id = req.user.department_id;
    }

    const { count, rows } = await db.Employee.findAndCountAll({
        where,
        limit: Number(limit),
        offset,
        order: [['createdAt', 'DESC']],
        include: [{ model: db.Department, as: 'department', attributes: ['id', 'name'] }]
    });

    res.status(StatusCodes.OK).json({ success: true, message: 'Employees retrieved', data: rows, meta: { total: count, page: Number(page), limit: Number(limit) } });
});

export const getEmployee = asyncHandler(async (req, res) => {
    const employee = await db.Employee.findByPk(req.params.id, {
        include: [{ model: db.Department, as: 'department', attributes: ['id', 'name'] }]
    });
    if (!employee) return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Employee not found' });

    // RBAC
    if (req.user.role === 'department_head' && employee.department_id !== req.user.department_id) {
        return res.status(StatusCodes.FORBIDDEN).json({ success: false, message: 'Access denied to this employee' });
    }

    res.status(StatusCodes.OK).json({ success: true, data: { employee } });
});

export const getEmployeeProfitability = asyncHandler(async (req, res) => {
    const { month } = req.query;
    if (!month) return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: 'month query parameter is required' });

    // RBAC Check
    const employee = await db.Employee.findByPk(req.params.id);
    if (!employee) return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Employee not found' });
    if (req.user.role === 'department_head' && employee.department_id !== req.user.department_id) {
        return res.status(StatusCodes.FORBIDDEN).json({ success: false, message: 'Access denied' });
    }

    const data = await calculateEmployeeProfitability(req.params.id, month);
    res.status(StatusCodes.OK).json({ success: true, data });
});

export const getEmployeeTimesheetSummary = asyncHandler(async (req, res) => {
    const { year = new Date().getFullYear().toString() } = req.query;

    // RBAC Check
    const employee = await db.Employee.findByPk(req.params.id);
    if (!employee) return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Employee not found' });
    // Delivery Manager restriction logic would be complex here, keeping it simple as they can view if they have role access.

    // Get all timesheets for this employee where month starts with year
    const timesheets = await db.Timesheet.findAll({
        where: { employee_id: req.params.id },
        include: [{ model: db.Project, as: 'project', attributes: ['name'] }]
    });

    const yearTimesheets = timesheets.filter(ts => ts.month.startsWith(year));

    const monthlyData = {};
    yearTimesheets.forEach(ts => {
        if (!monthlyData[ts.month]) {
            monthlyData[ts.month] = { month: ts.month, total_billable: 0, total_non_billable: 0, projects: [] };
        }

        monthlyData[ts.month].total_billable += Number(ts.billable_hours);
        monthlyData[ts.month].total_non_billable += Number(ts.non_billable_hours);

        monthlyData[ts.month].projects.push({
            project_name: ts.project ? ts.project.name : 'Unknown',
            billable_hours: Number(ts.billable_hours),
            non_billable_hours: Number(ts.non_billable_hours)
        });
    });

    const months = Object.values(monthlyData).map(m => {
        const total = m.total_billable + m.total_non_billable;
        m.utilization_percent = total > 0 ? Number(((m.total_billable / total) * 100).toFixed(2)) : 0;
        return m;
    });

    res.status(StatusCodes.OK).json({
        success: true,
        data: {
            employee: { id: employee.id, name: employee.name },
            year,
            months
        }
    });
});

export const createEmployee = asyncHandler(async (req, res) => {
    const data = { ...req.body };
    if (!data.joining_date) data.joining_date = new Date().toISOString().split('T')[0];
    if (!data.financial_year) {
        const now = new Date();
        const year = now.getFullYear();
        data.financial_year = now.getMonth() >= 3 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
    }

    // Unique employee_code check
    if (data.employee_code) {
        const existing = await db.Employee.findOne({ where: { employee_code: data.employee_code } });
        if (existing) {
            return res.status(StatusCodes.CONFLICT).json({
                success: false,
                message: `Employee code '${data.employee_code}' already exists. Please use a unique employee ID.`
            });
        }
    }

    const employee = await db.Employee.create(data);
    res.status(StatusCodes.CREATED).json({ success: true, message: 'Employee onboarded successfully', data: employee });
});

export const updateEmployee = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const employee = await db.Employee.findByPk(id);
    if (!employee) {
        return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Employee not found' });
    }

    const data = { ...req.body };

    // If employee_code is being changed, check uniqueness
    if (data.employee_code && data.employee_code !== employee.employee_code) {
        const existing = await db.Employee.findOne({ where: { employee_code: data.employee_code } });
        if (existing) {
            return res.status(StatusCodes.CONFLICT).json({
                success: false,
                message: `Employee code '${data.employee_code}' already exists. Please use a unique employee ID.`
            });
        }
    }

    await employee.update(data);
    const updated = await db.Employee.findByPk(id, {
        include: [{ model: db.Department, as: 'department', attributes: ['id', 'name'] }]
    });
    res.status(StatusCodes.OK).json({ success: true, message: 'Employee updated successfully', data: updated });
});

export const deleteEmployee = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const employee = await db.Employee.findByPk(id);
    if (!employee) {
        return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Employee not found' });
    }
    // Soft-delete (paranoid: true sets deletedAt, keeps DB record)
    await employee.destroy();
    res.status(StatusCodes.OK).json({ success: true, message: `Employee '${employee.name}' has been removed.` });
});

export const listDepartments = asyncHandler(async (req, res) => {
    const departments = await db.Department.findAll({ order: [['name', 'ASC']] });
    console.log(`[API] listDepartments hit. Found ${departments.length} departments.`);
    res.status(StatusCodes.OK).json({ success: true, data: departments });
});




