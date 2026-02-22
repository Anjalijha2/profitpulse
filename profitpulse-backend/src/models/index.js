import Sequelize from 'sequelize';
import dbConfig from '../config/database.js';
import User from './User.js';
import Department from './Department.js';
import Employee from './Employee.js';
import Client from './Client.js';
import Project from './Project.js';
import Timesheet from './Timesheet.js';
import Revenue from './Revenue.js';
import UploadLog from './UploadLog.js';
import SystemConfig from './SystemConfig.js';
import AuditLog from './AuditLog.js';

const env = process.env.NODE_ENV || 'development';
const config = dbConfig[env];

let sequelize;
if (config.use_env_variable) {
    sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
    sequelize = new Sequelize(config.database, config.username, config.password, config);
}

const db = {
    sequelize,
    Sequelize,
    User: User(sequelize, Sequelize),
    Department: Department(sequelize, Sequelize),
    Employee: Employee(sequelize, Sequelize),
    Client: Client(sequelize, Sequelize),
    Project: Project(sequelize, Sequelize),
    Timesheet: Timesheet(sequelize, Sequelize),
    Revenue: Revenue(sequelize, Sequelize),
    UploadLog: UploadLog(sequelize, Sequelize),
    SystemConfig: SystemConfig(sequelize, Sequelize),
    AuditLog: AuditLog(sequelize, Sequelize),
};

// Set up associations
Object.keys(db).forEach((modelName) => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

export default db;
