import db from '../models/index.js';
import asyncHandler from '../utils/asyncHandler.js';
import { StatusCodes } from 'http-status-codes';

export const getConfig = asyncHandler(async (req, res) => {
    const configs = await db.SystemConfig.findAll();
    res.status(StatusCodes.OK).json({ success: true, data: { configs } });
});

export const updateConfig = asyncHandler(async (req, res) => {
    const { configs } = req.body;
    if (!configs || !Array.isArray(configs)) {
        return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: 'Invalid payload. Expected { configs: [{ key, value }] }' });
    }

    const updatedConfigs = [];
    for (const item of configs) {
        if (!item.key) continue;

        // Use findOrCreate so new keys (like rbac_overrides) are inserted if they don't exist yet
        const [config, created] = await db.SystemConfig.findOrCreate({
            where: { key: item.key },
            defaults: {
                key: item.key,
                value: String(item.value),
                description: item.description || null,
                data_type: 'string',
                updated_by: req.user.id,
            }
        });

        if (!created) {
            const oldValues = { value: config.value };
            config.value = String(item.value);
            config.updated_by = req.user.id;
            await config.save();

            await db.AuditLog.create({
                user_id: req.user.id,
                action: 'UPDATE',
                entity: 'SystemConfig',
                entity_id: config.id,
                old_values: oldValues,
                new_values: { value: config.value },
                ip_address: req.ip
            });
        }

        updatedConfigs.push(config);
    }

    res.status(StatusCodes.OK).json({ success: true, message: 'Configuration updated successfully', data: { configs: updatedConfigs } });
});

/**
 * GET /config/rbac - accessible by ALL authenticated roles
 * Returns only the rbac_overrides key so non-admin users can load their permissions.
 */
export const getRbacConfig = asyncHandler(async (req, res) => {
    const config = await db.SystemConfig.findOne({ where: { key: 'rbac_overrides' } });
    if (!config) {
        return res.status(StatusCodes.OK).json({ success: true, data: { rbac_overrides: null } });
    }
    res.status(StatusCodes.OK).json({ success: true, data: { rbac_overrides: config.value } });
});
