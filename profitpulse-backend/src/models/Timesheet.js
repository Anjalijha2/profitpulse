// src/models/Timesheet.js
export default (sequelize, DataTypes) => {
    const Timesheet = sequelize.define('Timesheet', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            primaryKey: true,
        },
        employee_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        project_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        month: {
            type: DataTypes.STRING(7), // YYYY-MM
            allowNull: false,
        },
        billable_hours: {
            type: DataTypes.DECIMAL(6, 2),
            allowNull: false,
            defaultValue: 0,
        },
        non_billable_hours: {
            type: DataTypes.DECIMAL(6, 2),
            allowNull: false,
            defaultValue: 0,
        },
        upload_batch_id: {
            type: DataTypes.UUID,
            allowNull: true,
        },
    }, {
        tableName: 'timesheets',
        underscored: true,
        paranoid: true,
        timestamps: true,
        indexes: [
            {
                unique: true,
                fields: ['employee_id', 'project_id', 'month'] // Ensures Upsert integrity
            }
        ]
    });

    Timesheet.associate = (models) => {
        Timesheet.belongsTo(models.Employee, { foreignKey: 'employee_id', as: 'employee' });
        Timesheet.belongsTo(models.Project, { foreignKey: 'project_id', as: 'project' });
        Timesheet.belongsTo(models.UploadLog, { foreignKey: 'upload_batch_id', as: 'upload_batch' });
    };

    return Timesheet;
};
