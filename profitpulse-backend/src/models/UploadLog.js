// src/models/UploadLog.js
import { UPLOAD_TYPES, UPLOAD_STATUS } from '../config/constants.js';

export default (sequelize, DataTypes) => {
    const UploadLog = sequelize.define('UploadLog', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            primaryKey: true,
        },
        upload_type: {
            type: DataTypes.ENUM(Object.values(UPLOAD_TYPES)),
            allowNull: false,
        },
        file_name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        file_size: {
            type: DataTypes.INTEGER, // in bytes
            allowNull: false,
        },
        total_rows: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        success_rows: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        error_rows: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        status: {
            type: DataTypes.ENUM(Object.values(UPLOAD_STATUS)),
            defaultValue: UPLOAD_STATUS.PROCESSING,
        },
        error_details: {
            type: DataTypes.JSON, // Maps to JSON or JSONB depending on dialect config
            allowNull: true,
        },
        month: {
            type: DataTypes.STRING(7),
            allowNull: true, // For timesheet/revenue
        },
        financial_year: {
            type: DataTypes.STRING(10),
            allowNull: true, // For employee master
        },
        uploaded_by: {
            type: DataTypes.UUID,
            allowNull: false,
        },
    }, {
        tableName: 'upload_logs',
        underscored: true,
        timestamps: true,
        updatedAt: true,
        createdAt: true,
        paranoid: false, // Upload logs are immutable — no soft deletes
    });

    UploadLog.associate = (models) => {
        UploadLog.belongsTo(models.User, { foreignKey: 'uploaded_by', as: 'uploader' });
        UploadLog.hasMany(models.Employee, { foreignKey: 'upload_batch_id', as: 'employees_uploaded' });
        UploadLog.hasMany(models.Timesheet, { foreignKey: 'upload_batch_id', as: 'timesheets_uploaded' });
        UploadLog.hasMany(models.Revenue, { foreignKey: 'upload_batch_id', as: 'revenues_uploaded' });
    };

    return UploadLog;
};
