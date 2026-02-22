import Joi from 'joi';
import { ROLES } from '../config/constants.js';

export const authValidation = {
    register: Joi.object({
        name: Joi.string().required().max(100),
        email: Joi.string().required().email().max(150),
        password: Joi.string().required().min(8),
        role: Joi.string().valid(...Object.values(ROLES)).required(),
        department_id: Joi.string().uuid().optional(),
    }),

    login: Joi.object({
        email: Joi.string().required().email(),
        password: Joi.string().required(),
    }),

    changePassword: Joi.object({
        oldPassword: Joi.string().required(),
        newPassword: Joi.string().required().min(8),
    }),
};
