export const ROLES = {
    ADMIN: 'admin',
    FINANCE: 'finance',
    DELIVERY_MANAGER: 'delivery_manager',
    DEPARTMENT_HEAD: 'department_head',
    HR: 'hr'
};

export const PROJECT_TYPES = {
    TM: 'tm',
    FIXED_COST: 'fixed_cost',
    INFRASTRUCTURE: 'infrastructure',
    AMC: 'amc'
};

export const PROJECT_STATUS = {
    ACTIVE: 'active',
    COMPLETED: 'completed',
    ON_HOLD: 'on_hold',
    CANCELLED: 'cancelled'
};

export const UPLOAD_TYPES = {
    EMPLOYEE_MASTER: 'employee_master',
    TIMESHEET: 'timesheet',
    REVENUE: 'revenue'
};

export const UPLOAD_STATUS = {
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    FAILED: 'failed',
    PARTIAL: 'partial'
};

export const VERTICALS = [
    'Municipal', 'Enterprise', 'AI', 'Healthcare', 'Education', 'BFSI', 'Retail', 'Other'
];

export const AUDIT_ACTIONS = {
    CREATE: 'CREATE',
    UPDATE: 'UPDATE',
    DELETE: 'DELETE',
    UPLOAD: 'UPLOAD',
    LOGIN: 'LOGIN',
    EXPORT: 'EXPORT'
};

export const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100
};

export const FILE_UPLOAD = {
    MAX_SIZE: process.env.MAX_FILE_SIZE ? parseInt(process.env.MAX_FILE_SIZE) : 10 * 1024 * 1024,
    ALLOWED_EXTENSIONS: ['.xlsx', '.xls', '.csv']
};

export const DEFAULTS = {
    OVERHEAD_COST: process.env.DEFAULT_OVERHEAD_COST ? parseInt(process.env.DEFAULT_OVERHEAD_COST) : 180000,
    STANDARD_HOURS: process.env.DEFAULT_STANDARD_HOURS ? parseInt(process.env.DEFAULT_STANDARD_HOURS) : 160
};

export const CONFIG_KEYS = {
    OVERHEAD_COST: 'overhead_cost_per_year',
    STANDARD_HOURS: 'standard_monthly_hours',
    FINANCIAL_YEAR_START: 'financial_year_start_month'
};
