import { StatusCodes } from 'http-status-codes';
import asyncHandler from '../utils/asyncHandler.js';
import { apiResponse } from '../utils/apiResponse.js';
import { getPagination, getPagingData } from '../utils/helpers.js';
import db from '../models/index.js';

export const listUsers = asyncHandler(async (req, res) => {
    const { page, limit, role } = req.query;
    const { limit: lmt, offset } = getPagination(page, limit);

    const where = {};
    if (role) {
        where.role = role;
    }

    const data = await db.User.findAndCountAll({
        where,
        limit: lmt,
        offset,
        attributes: { exclude: ['password'] },
        include: [{ model: db.Department, as: 'department', attributes: ['name', 'code'] }]
    });

    res.status(StatusCodes.OK).json(apiResponse(true, 'Users fetched', getPagingData(data, page, lmt)));
});

export const getUser = asyncHandler(async (req, res) => {
    const user = await db.User.findByPk(req.params.id, {
        attributes: { exclude: ['password'] }
    });
    if (!user) {
        return res.status(StatusCodes.NOT_FOUND).json(apiResponse(false, 'User not found'));
    }
    res.status(StatusCodes.OK).json(apiResponse(true, 'User found', user));
});

import * as authService from '../services/auth.service.js';

export const createUser = asyncHandler(async (req, res) => {
    const user = await authService.registerUser(req.body);
    res.status(StatusCodes.CREATED).json(apiResponse(true, 'User created', user));
});

export const updateUser = asyncHandler(async (req, res) => {
    const user = await db.User.findByPk(req.params.id);
    if (!user) return res.status(StatusCodes.NOT_FOUND).json(apiResponse(false, 'User not found'));
    await user.update(req.body);
    res.status(StatusCodes.OK).json(apiResponse(true, 'User updated'));
});

export const deleteUser = asyncHandler(async (req, res) => {
    const user = await db.User.findByPk(req.params.id);
    if (!user) return res.status(StatusCodes.NOT_FOUND).json(apiResponse(false, 'User not found'));
    await user.destroy(); // Soft delete
    res.status(StatusCodes.OK).json(apiResponse(true, 'User deleted'));
});
