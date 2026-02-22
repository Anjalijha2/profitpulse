import jwt from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';
import { apiResponse } from '../utils/apiResponse.js';
import db from '../models/index.js';

export const verifyToken = async (req, res, next) => {
    let token = req.headers.authorization;

    if (token && token.startsWith('Bearer ')) {
        token = token.slice(7, token.length); // Remove Bearer from string
    }

    if (!token) {
        return res.status(StatusCodes.UNAUTHORIZED).json(apiResponse(false, 'No token provided.'));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if user still exists and is active
        const user = await db.User.findByPk(decoded.id);
        if (!user || !user.is_active) {
            return res.status(StatusCodes.UNAUTHORIZED).json(apiResponse(false, 'The user belonging to this token does no longer exist or is inactive.'));
        }

        req.user = decoded;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(StatusCodes.UNAUTHORIZED).json(apiResponse(false, 'Token has expired.'));
        }
        return res.status(StatusCodes.UNAUTHORIZED).json(apiResponse(false, 'Invalid token.'));
    }
};
