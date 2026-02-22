import { ROLES } from './constants';

/**
 * Static, hardcoded default permissions per role.
 * These are used as a UI rendering baseline only — all actual access
 * enforcement is done server-side via RBAC middleware (rbac.middleware.js).
 *
 * NOTE: Do NOT read from localStorage or any other client-controlled source here.
 * Client-side permission state is managed reactively by rbacStore.js, which
 * fetches authoritative overrides from the server on every login.
 */
export const DEFAULT_PERMISSIONS = {
    [ROLES.ADMIN]: ['all'],
    [ROLES.FINANCE]: ['dashboard:executive', 'dashboard:project', 'dashboard:department', 'dashboard:client', 'projects', 'revenue', 'uploads', 'reports'],
    [ROLES.DELIVERY_MANAGER]: ['dashboard:project', 'projects', 'uploads', 'reports'],
    [ROLES.DEPT_HEAD]: ['dashboard:employee', 'dashboard:department', 'employees', 'reports'],
    [ROLES.HR]: ['dashboard:employee', 'employees', 'uploads', 'reports'],
};

/**
 * Pure, static helper for UX/rendering purposes only (e.g. hiding non-relevant UI).
 * Uses DEFAULT_PERMISSIONS — does NOT read from localStorage or any mutable state.
 *
 * For reactive, server-sourced permission checks (route protection, sidebar visibility),
 * use `useRbacStore().hasPermission` instead.
 */
export const hasPermission = (userRole, requiredScope) => {
    if (!userRole) return false;
    const rolePerms = DEFAULT_PERMISSIONS[userRole] || [];
    if (rolePerms.includes('all')) return true;
    return rolePerms.includes(requiredScope);
};
