import Joi from 'joi';

export const queryValidation = {
    pagination: Joi.object({
        page: Joi.number().integer().min(1).optional(),
        limit: Joi.number().integer().min(1).max(100).optional(),
        sortBy: Joi.string().optional(),
        order: Joi.string().valid('asc', 'desc', 'ASC', 'DESC').optional(),
    }),

    monthYear: Joi.object({
        month: Joi.string().pattern(/^\d{4}-\d{2}$/).optional(),
        year: Joi.string().pattern(/^\d{4}-\d{4}$/).optional(),
    }),
};
