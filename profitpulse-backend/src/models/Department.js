// src/models/Department.js
export default (sequelize, DataTypes) => {
    const Department = sequelize.define('Department', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
        },
        code: {
            type: DataTypes.STRING(20),
            allowNull: false,
            unique: true,
        },
        description: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
    }, {
        tableName: 'departments',
        underscored: true,
        paranoid: true,
        timestamps: true,
    });

    Department.associate = (models) => {
        Department.hasMany(models.User, { foreignKey: 'department_id', as: 'users' });
        Department.hasMany(models.Employee, { foreignKey: 'department_id', as: 'employees' });
    };

    return Department;
};
