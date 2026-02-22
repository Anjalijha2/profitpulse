import { StatusCodes } from 'http-status-codes';
import { apiResponse } from '../utils/apiResponse.js';

export const validateRequest = (schema, property = 'body') => {
    return (req, res, next) => {
        const { error } = schema.validate(req[property], { abortEarly: false });
        const valid = error == null;

        if (valid) {
            next();
        } else {
            const { details } = error;
            const errors = details.map((i) => ({ field: i.context.key, message: i.message }));

            res.status(StatusCodes.BAD_REQUEST).json(
                apiResponse(false, 'Validation failed', null, errors)
            );
        }
    };
};
