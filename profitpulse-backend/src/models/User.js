// src/models/User.js
import { ROLES } from '../config/constants.js';

export default (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING(150),
            allowNull: false,
            unique: true,
            validate: { isEmail: true }
        },
        password: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        role: {
            type: DataTypes.ENUM(Object.values(ROLES)),
            allowNull: false,
        },
        department_id: {
            type: DataTypes.UUID,
            allowNull: true,
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        last_login: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        reset_token: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        reset_token_expires_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    }, {
        tableName: 'users',
        underscored: true,
        paranoid: true, // soft delete
        timestamps: true,
    });

    User.associate = (models) => {
        User.belongsTo(models.Department, { foreignKey: 'department_id', as: 'department' });
        User.hasMany(models.Project, { foreignKey: 'delivery_manager_id', as: 'managed_projects' });
        User.hasMany(models.UploadLog, { foreignKey: 'uploaded_by', as: 'uploads' });
        User.hasMany(models.SystemConfig, { foreignKey: 'updated_by', as: 'config_updates' });
        User.hasMany(models.AuditLog, { foreignKey: 'user_id', as: 'audit_logs' });
    };

    return User;
};
