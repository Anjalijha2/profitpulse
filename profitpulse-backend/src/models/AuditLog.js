// src/models/AuditLog.js
import { AUDIT_ACTIONS } from '../config/constants.js';

export default (sequelize, DataTypes) => {
    const AuditLog = sequelize.define('AuditLog', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            primaryKey: true,
        },
        user_id: {
            type: DataTypes.UUID,
            allowNull: true, // Could be null for system actions or failed logins
        },
        action: {
            type: DataTypes.STRING(50), // Extensible via ENUM initially but open String is better
            allowNull: false,
        },
        entity: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        entity_id: {
            type: DataTypes.UUID,
            allowNull: true,
        },
        old_values: {
            type: DataTypes.JSON,
            allowNull: true,
        },
        new_values: {
            type: DataTypes.JSON,
            allowNull: true,
        },
        ip_address: {
            type: DataTypes.STRING(45), // Supports IPv6
            allowNull: true,
        },
    }, {
        tableName: 'audit_logs',
        underscored: true,
        timestamps: true,
        updatedAt: false, // Audit logs shouldn't be updated
        deletedAt: false,
    });

    AuditLog.associate = (models) => {
        AuditLog.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    };

    return AuditLog;
};
