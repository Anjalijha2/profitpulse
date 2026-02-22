// src/models/Revenue.js
import { PROJECT_TYPES } from '../config/constants.js';

export default (sequelize, DataTypes) => {
    const Revenue = sequelize.define('Revenue', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            primaryKey: true,
        },
        project_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        client_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        invoice_amount: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
        },
        invoice_date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        month: {
            type: DataTypes.STRING(7), // YYYY-MM, derived from invoice_date
            allowNull: false,
        },
        project_type: {
            type: DataTypes.ENUM(Object.values(PROJECT_TYPES)),
            allowNull: false,
        },
        vertical: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        upload_batch_id: {
            type: DataTypes.UUID,
            allowNull: true,
        },
    }, {
        tableName: 'revenues',
        underscored: true,
        paranoid: true,
        timestamps: true,
        indexes: [
            {
                fields: ['project_id', 'month']
            }
        ]
    });

    Revenue.associate = (models) => {
        Revenue.belongsTo(models.Project, { foreignKey: 'project_id', as: 'project' });
        Revenue.belongsTo(models.Client, { foreignKey: 'client_id', as: 'client' });
        Revenue.belongsTo(models.UploadLog, { foreignKey: 'upload_batch_id', as: 'upload_batch' });
    };

    return Revenue;
};
