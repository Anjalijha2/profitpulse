// src/models/Client.js
export default (sequelize, DataTypes) => {
    const Client = sequelize.define('Client', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING(200),
            allowNull: false,
            unique: true,
        },
        industry: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
    }, {
        tableName: 'clients',
        underscored: true,
        paranoid: true,
        timestamps: true,
    });

    Client.associate = (models) => {
        Client.hasMany(models.Project, { foreignKey: 'client_id', as: 'projects' });
        Client.hasMany(models.Revenue, { foreignKey: 'client_id', as: 'revenues' });
    };

    return Client;
};
