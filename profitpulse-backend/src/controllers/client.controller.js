import { StatusCodes } from 'http-status-codes';
import asyncHandler from '../utils/asyncHandler.js';
import { apiResponse } from '../utils/apiResponse.js';
import db from '../models/index.js';

/**
 * List all clients for dropdowns/management
 */
export const listClients = asyncHandler(async (req, res) => {
    const clients = await db.Client.findAll({
        order: [['name', 'ASC']]
    });

    res.status(StatusCodes.OK).json({
        success: true,
        message: 'Clients retrieved',
        data: clients
    });
});
