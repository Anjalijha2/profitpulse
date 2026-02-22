import { ROLES } from './constants.js';

// Permissions matrix based on the SRD
export const rolePermissions = {
    [ROLES.ADMIN]: {
        users: { read: true, write: true, delete: true },
        systemConfig: { read: true, write: true },
        uploads: { employee: true, timesheet: true, revenue: true },
        uploadLogs: { read: true },
        employees: { read: true, write: true, profitability: true, salaryData: true },
        projects: { read: true, write: true, profitability: true },
        timesheets: { read: true },
        revenue: { read: true },
        dashboard: { executive: true, employee: true, project: true, department: true, client: true },
        reports: { export: true },
        auditLogs: { read: true },
    },
    [ROLES.FINANCE]: {
        users: { read: false, write: false, delete: false },
        systemConfig: { read: false, write: false },
        uploads: { employee: false, timesheet: false, revenue: true },
        uploadLogs: { read: true },
        employees: { read: false, write: false, profitability: false, salaryData: false },
        projects: { read: true, write: false, profitability: true },
        timesheets: { read: false },
        revenue: { read: true },
        dashboard: { executive: true, employee: false, project: true, department: true, client: true },
        reports: { export: true },
        auditLogs: { read: false },
    },
    [ROLES.DELIVERY_MANAGER]: {
        users: { read: false, write: false, delete: false },
        systemConfig: { read: false, write: false },
        uploads: { employee: false, timesheet: true, revenue: false },
        uploadLogs: { read: true },
        employees: { read: false, write: false, profitability: false, salaryData: false },
        projects: { read: 'own', write: 'own', profitability: 'own' },
        timesheets: { read: 'own' },
        revenue: { read: false },
        dashboard: { executive: false, employee: false, project: 'own', department: false, client: false },
        reports: { export: 'own' },
        auditLogs: { read: false },
    },
    [ROLES.DEPARTMENT_HEAD]: {
        users: { read: false, write: false, delete: false },
        systemConfig: { read: false, write: false },
        uploads: { employee: false, timesheet: false, revenue: false },
        uploadLogs: { read: false },
        employees: { read: 'own', write: false, profitability: 'own', salaryData: false },
        projects: { read: false, write: false, profitability: false },
        timesheets: { read: 'own' },
        revenue: { read: false },
        dashboard: { executive: false, employee: 'own', project: false, department: 'own', client: false },
        reports: { export: 'own' },
        auditLogs: { read: false },
    },
    [ROLES.HR]: {
        users: { read: false, write: false, delete: false },
        systemConfig: { read: false, write: false },
        uploads: { employee: true, timesheet: false, revenue: false },
        uploadLogs: { read: true },
        employees: { read: true, write: false, profitability: true, salaryData: true },
        projects: { read: false, write: false, profitability: false },
        timesheets: { read: true },
        revenue: { read: false },
        dashboard: { executive: false, employee: true, project: false, department: true, client: false },
        reports: { export: true },
        auditLogs: { read: false },
    }
};

/**
 * Helper to check permissions
 * @param {string} role User role
 * @param {string} resource Resource string (e.g., 'employees')
 * @param {string} action Action string (e.g., 'read')
 * @returns {boolean|string} True, false, or 'own' for scoped access
 */
export const hasPermission = (role, resource, action) => {
    if (!rolePermissions[role] || !rolePermissions[role][resource]) {
        return false;
    }
    return rolePermissions[role][resource][action] || false;
};
