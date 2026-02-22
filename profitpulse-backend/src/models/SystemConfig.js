// src/models/SystemConfig.js
export default (sequelize, DataTypes) => {
    const SystemConfig = sequelize.define('SystemConfig', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            primaryKey: true,
        },
        key: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
        },
        value: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING(500),
            allowNull: true,
        },
        data_type: {
            type: DataTypes.ENUM('number', 'string', 'boolean'),
            defaultValue: 'string',
        },
        updated_by: {
            type: DataTypes.UUID,
            allowNull: true,
        },
    }, {
        tableName: 'system_configs',
        underscored: true,
        timestamps: true,
        paranoid: false,
    });

    SystemConfig.associate = (models) => {
        SystemConfig.belongsTo(models.User, { foreignKey: 'updated_by', as: 'updater' });
    };

    return SystemConfig;
};
