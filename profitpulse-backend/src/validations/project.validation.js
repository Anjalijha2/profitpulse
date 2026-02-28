import Joi from 'joi';
import { PROJECT_TYPES, PROJECT_STATUS } from '../config/constants.js';

export const projectValidation = {
    createProject: Joi.object({
        project_code: Joi.string().required().max(50),
        name: Joi.string().required().max(200),
        client_id: Joi.string().uuid().required(),
        project_type: Joi.string().valid(...Object.values(PROJECT_TYPES)).required(),
        vertical: Joi.string().max(100).optional(),
        billing_rate: Joi.number().optional().allow(null),
        contract_value: Joi.number().optional().allow(null),
        budgeted_hours: Joi.number().optional().allow(null),
        infra_vendor_cost: Joi.number().optional().allow(null),
        start_date: Joi.date().iso().optional(),
        end_date: Joi.date().iso().optional(),
        status: Joi.string().valid(...Object.values(PROJECT_STATUS)).optional(),
        delivery_manager_id: Joi.string().uuid().optional().allow(null),
    }).unknown(true),

    updateProject: Joi.object({
        project_code: Joi.string().max(50).optional(),
        name: Joi.string().max(200).optional(),
        client_id: Joi.string().uuid().optional(),
        project_type: Joi.string().valid(...Object.values(PROJECT_TYPES)).optional(),
        vertical: Joi.string().max(100).optional(),
        billing_rate: Joi.number().optional().allow(null),
        contract_value: Joi.number().optional().allow(null),
        budgeted_hours: Joi.number().optional().allow(null),
        infra_vendor_cost: Joi.number().optional().allow(null),
        start_date: Joi.date().iso().optional(),
        end_date: Joi.date().iso().optional(),
        status: Joi.string().valid(...Object.values(PROJECT_STATUS)).optional(),
        delivery_manager_id: Joi.string().uuid().optional().allow(null),
    }).unknown(true),
};
