import Joi from 'joi';
import { ROLES } from '../config/constants.js';

export const userValidation = {
    createUser: Joi.object({
        name: Joi.string().required().max(100),
        email: Joi.string().required().email().max(150),
        password: Joi.string().required().min(8),
        role: Joi.string().valid(...Object.values(ROLES)).required(),
        department_id: Joi.string().uuid().optional(),
    }),

    updateUser: Joi.object({
        name: Joi.string().max(100).optional(),
        role: Joi.string().valid(...Object.values(ROLES)).optional(),
        department_id: Joi.string().uuid().optional().allow(null),
        is_active: Joi.boolean().optional(),
    }),
};
