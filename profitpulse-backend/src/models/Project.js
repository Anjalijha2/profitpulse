// src/models/Project.js
import { PROJECT_TYPES, PROJECT_STATUS } from '../config/constants.js';

export default (sequelize, DataTypes) => {
    const Project = sequelize.define('Project', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            primaryKey: true,
        },
        project_code: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true, // Project ID from Excel
        },
        name: {
            type: DataTypes.STRING(200),
            allowNull: false,
        },
        client_id: {
            type: DataTypes.UUID,
            allowNull: true, // Null for internal projects
        },
        project_type: {
            type: DataTypes.ENUM(Object.values(PROJECT_TYPES)),
            allowNull: false,
        },
        vertical: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        billing_rate: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true, // Required for T&M
        },
        contract_value: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: true, // Required for Fixed/AMC
        },
        budgeted_hours: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true, // Option for fixed
        },
        infra_vendor_cost: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: true, // For infra
        },
        start_date: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
        end_date: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM(Object.values(PROJECT_STATUS)),
            defaultValue: PROJECT_STATUS.ACTIVE,
        },
        delivery_manager_id: {
            type: DataTypes.UUID,
            allowNull: true, // Nullable initially
        },
    }, {
        tableName: 'projects',
        underscored: true,
        paranoid: true,
        timestamps: true,
    });

    Project.associate = (models) => {
        Project.belongsTo(models.Client, { foreignKey: 'client_id', as: 'client' });
        Project.belongsTo(models.User, { foreignKey: 'delivery_manager_id', as: 'delivery_manager' });
        Project.hasMany(models.Timesheet, { foreignKey: 'project_id', as: 'timesheets' });
        Project.hasMany(models.Revenue, { foreignKey: 'project_id', as: 'revenues' });
    };

    return Project;
};
