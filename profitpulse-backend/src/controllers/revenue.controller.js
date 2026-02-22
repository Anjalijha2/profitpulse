import { StatusCodes } from 'http-status-codes';
import asyncHandler from '../utils/asyncHandler.js';
import db from '../models/index.js';

export const listRevenue = asyncHandler(async (req, res) => {
    const { month, project_id, client_id, project_type, page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const where = {};
    if (month) where.month = month;
    if (project_id) where.project_id = project_id;
    if (client_id) where.client_id = client_id;
    if (project_type) where.project_type = project_type;

    // RBAC
    if (req.user.role === 'delivery_manager') {
        const projects = await db.Project.findAll({ where: { delivery_manager_id: req.user.id } });
        const projectIds = projects.map(p => p.id);
        if (project_id && !projectIds.includes(project_id)) {
            return res.status(StatusCodes.FORBIDDEN).json({ success: false, message: 'Access denied' });
        }
        where.project_id = project_id ? project_id : projectIds;
    }

    const { count, rows } = await db.Revenue.findAndCountAll({
        where,
        limit: Number(limit),
        offset,
        include: [
            { model: db.Project, as: 'project', attributes: ['name', 'project_type'] },
            { model: db.Client, as: 'client', attributes: ['name'] }
        ]
    });

    res.status(StatusCodes.OK).json({
        success: true,
        message: 'Revenue records retrieved',
        data: { revenues: rows },
        meta: { total: count, page: Number(page), limit: Number(limit) }
    });
});

export const getRevenueSummary = asyncHandler(async (req, res) => {
    const { month } = req.query;
    const where = {};
    if (month) where.month = month;

    // Ensure we only look at what the user is allowed to if needed. 
    // The requirement says "Auth: Yes | Roles: Admin, Finance". No scoping mentioned.

    const revenues = await db.Revenue.findAll({
        where,
        include: [
            { model: db.Project, as: 'project', attributes: ['name'] },
            { model: db.Client, as: 'client', attributes: ['name'] }
        ]
    });

    let total_revenue = 0;
    const by_project_type = { tm: 0, fixed_cost: 0, infrastructure: 0, amc: 0 };
    const clientMap = {};
    const verticalMap = {};

    revenues.forEach(rev => {
        const amt = Number(rev.invoice_amount) || 0;
        total_revenue += amt;

        const type = rev.project_type || 'unknown';
        if (by_project_type[type] !== undefined) {
            by_project_type[type] += amt;
        } else {
            by_project_type[type] = amt;
        }

        const clientName = rev.client ? rev.client.name : 'Unknown';
        if (!clientMap[clientName]) clientMap[clientName] = 0;
        clientMap[clientName] += amt;

        const vertical = rev.vertical || 'Unknown';
        if (!verticalMap[vertical]) verticalMap[vertical] = 0;
        verticalMap[vertical] += amt;
    });

    const by_client = Object.keys(clientMap).map(k => ({ client_name: k, total: Number(clientMap[k].toFixed(2)) }));
    const by_vertical = Object.keys(verticalMap).map(k => ({ vertical: k, total: Number(verticalMap[k].toFixed(2)) }));

    res.status(StatusCodes.OK).json({
        success: true,
        data: {
            total_revenue: Number(total_revenue.toFixed(2)),
            by_project_type,
            by_client,
            by_vertical
        }
    });
});
