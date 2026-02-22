import Joi from 'joi';

export const uploadValidation = {
    employeeMaster: Joi.object({
        financialYear: Joi.string().pattern(/^\d{4}-\d{4}$/).required(), // e.g., 2025-2026
    }),

    timesheet: Joi.object({
        month: Joi.string().pattern(/^\d{4}-\d{2}$/).required(),
    }),

    revenue: Joi.object({
        month: Joi.string().pattern(/^\d{4}-\d{2}$/).required(),
    }),
};
