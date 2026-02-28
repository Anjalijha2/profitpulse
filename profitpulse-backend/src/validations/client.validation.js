import Joi from 'joi';

export const clientValidation = {
    createClient: Joi.object({
        name: Joi.string().required().max(200),
        industry: Joi.string().max(100).optional().allow(''),
    }),
    updateClient: Joi.object({
        name: Joi.string().max(200).optional(),
        industry: Joi.string().max(100).optional().allow(''),
        is_active: Joi.boolean().optional(),
    }).unknown(true),
};
