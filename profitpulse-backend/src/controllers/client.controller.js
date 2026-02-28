import { StatusCodes } from 'http-status-codes';
import asyncHandler from '../utils/asyncHandler.js';
import db from '../models/index.js';
import pkg from 'sequelize';
const { Op } = pkg;

export const listClients = asyncHandler(async (req, res) => {
    const { search, page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const where = {};
    if (search) {
        where.name = { [Op.like]: `%${search}%` };
    }

    const { count, rows } = await db.Client.findAndCountAll({
        where,
        limit: Number(limit),
        offset,
        order: [['createdAt', 'DESC']],
        include: [{ 
            model: db.Project, 
            as: 'projects',
            attributes: ['id']
        }]
    });

    res.status(StatusCodes.OK).json({
        success: true,
        message: 'Clients retrieved',
        data: rows,
        meta: {
            total: count,
            page: Number(page),
            limit: Number(limit)
        }
    });
});

export const createClient = asyncHandler(async (req, res) => {
    const { name, industry } = req.body;
    
    const existing = await db.Client.findOne({ where: { name } });
    if (existing) {
        return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: 'Client name already exists' });
    }

    const client = await db.Client.create({ name, industry });
    res.status(StatusCodes.CREATED).json({ success: true, data: client });
});

export const updateClient = asyncHandler(async (req, res) => {
    const client = await db.Client.findByPk(req.params.id);
    if (!client) {
        return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Client not found' });
    }

    const { name, industry, is_active } = req.body;
    
    if (name && name !== client.name) {
        const existing = await db.Client.findOne({ where: { name } });
        if (existing) {
            return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: 'Client name already exists' });
        }
    }

    await client.update({ name, industry, is_active });
    res.status(StatusCodes.OK).json({ success: true, data: client });
});

export const deleteClient = asyncHandler(async (req, res) => {
    const client = await db.Client.findByPk(req.params.id);
    if (!client) {
        return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Client not found' });
    }

    // Check if client has projects
    const projectCount = await db.Project.count({ where: { client_id: client.id } });
    if (projectCount > 0) {
        return res.status(StatusCodes.BAD_REQUEST).json({ 
            success: false, 
            message: `Cannot delete client with ${projectCount} associated projects. Archive them first.` 
        });
    }

    await client.destroy();
    res.status(StatusCodes.OK).json({ success: true, message: 'Client deleted successfully' });
});

export const getClientDetails = asyncHandler(async (req, res) => {
    const client = await db.Client.findByPk(req.params.id, {
        include: [{ 
            model: db.Project, 
            as: 'projects',
            include: [{ model: db.Revenue, as: 'revenues' }]
        }]
    });

    if (!client) {
        return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Client not found' });
    }

    res.status(StatusCodes.OK).json({ success: true, data: client });
});
