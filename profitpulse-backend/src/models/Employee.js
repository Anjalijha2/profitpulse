// src/models/Employee.js
export default (sequelize, DataTypes) => {
    const Employee = sequelize.define('Employee', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            primaryKey: true,
        },
        employee_code: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING(150),
            allowNull: false,
        },
        department_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        designation: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        annual_ctc: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: false,
        },
        is_billable: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        joining_date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        exit_date: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        upload_batch_id: {
            type: DataTypes.UUID,
            allowNull: true, // If created manually, might be null
        },
        financial_year: {
            type: DataTypes.STRING(10),
            allowNull: false,
        },
    }, {
        tableName: 'employees',
        underscored: true,
        paranoid: true,
        timestamps: true,
        indexes: [
            {
                unique: true,
                fields: ['employee_code', 'financial_year'],
                name: 'idx_unique_emp_code_fy' // ensuring unique across paranoid false would require composite constraint filtering deleted_at
            }
        ]
    });

    Employee.associate = (models) => {
        Employee.belongsTo(models.Department, { foreignKey: 'department_id', as: 'department' });
        Employee.belongsTo(models.UploadLog, { foreignKey: 'upload_batch_id', as: 'upload_batch' });
        Employee.hasMany(models.Timesheet, { foreignKey: 'employee_id', as: 'timesheets' });
    };

    return Employee;
};
