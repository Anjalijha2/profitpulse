import { StatusCodes } from 'http-status-codes';
import logger from '../utils/logger.js';
import { apiResponse } from '../utils/apiResponse.js';

const globalErrorHandler = (err, req, res, next) => {
    logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
    logger.error(err.stack);

    let statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
    let message = err.message || 'Internal Server Error';

    // Specific Error Handling
    if (err.name === 'SequelizeValidationError') {
        statusCode = StatusCodes.BAD_REQUEST;
        message = 'Database Validation Error';
        const errors = err.errors.map(e => ({ field: e.path, message: e.message }));
        return res.status(statusCode).json(apiResponse(false, message, null, errors));
    }

    if (err.name === 'SequelizeUniqueConstraintError') {
        statusCode = StatusCodes.CONFLICT;
        message = 'Resource already exists';
        const errors = err.errors.map(e => ({ field: e.path, message: e.message }));
        return res.status(statusCode).json(apiResponse(false, message, null, errors));
    }

    // Multer Error
    if (err.name === 'MulterError') {
        if (err.code === 'LIMIT_FILE_SIZE') {
            statusCode = StatusCodes.REQUEST_TOO_LONG;
            message = 'File is too large. Max size is 10MB.';
        }
    }

    res.status(statusCode).json(
        apiResponse(false, message, null, process.env.NODE_ENV === 'development' ? err.stack : undefined)
    );
};

export default globalErrorHandler;
