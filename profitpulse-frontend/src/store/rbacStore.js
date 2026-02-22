import { create } from 'zustand';
import { axiosInstance } from '../api/axiosInstance';

const DEFAULT_PERMISSIONS = {
    admin: ['all'],
    finance: ['dashboard:executive', 'dashboard:project', 'dashboard:department', 'dashboard:client', 'projects', 'revenue', 'uploads', 'reports'],
    delivery_manager: ['dashboard:project', 'projects', 'uploads', 'reports'],
    dept_head: ['dashboard:employee', 'dashboard:department', 'employees', 'reports'],
    hr: ['dashboard:employee', 'employees', 'uploads', 'reports'],
};

function mergeWithDefaults(overrides) {
    if (!overrides) return DEFAULT_PERMISSIONS;
    return {
        ...DEFAULT_PERMISSIONS,
        ...overrides,
        admin: ['all'], // Admin is always unrestricted
    };
}

export const useRbacStore = create((set, get) => ({
    permissions: DEFAULT_PERMISSIONS,
    isLoaded: false,

    /**
     * Called on every login (AppRoutes.jsx).
     * Uses GET /api/v1/config/rbac — accessible by ALL authenticated roles.
     */
    loadFromApi: async () => {
        try {
            // axiosInstance already unwraps response.data, so result = { success, data }
            const result = await axiosInstance.get('/config/rbac');
            const rawOverrides = result?.data?.rbac_overrides;
            if (rawOverrides) {
                const overrides = JSON.parse(rawOverrides);
                set({ permissions: mergeWithDefaults(overrides), isLoaded: true });
            } else {
                set({ permissions: DEFAULT_PERMISSIONS, isLoaded: true });
            }
        } catch (err) {
            // Silently fallback — e.g. network error or unexpected 403
            console.warn('[rbacStore] Failed to load RBAC config, using defaults.', err?.message);
            set({ permissions: DEFAULT_PERMISSIONS, isLoaded: true });
        }
    },

    /**
     * Called immediately after admin saves config in RoleAccessConfig.jsx.
     * Updates the Zustand store in-memory so Sidebar and ProtectedRoute
     * re-render for the current session without a page reload.
     */
    applyOverrides: (overrides) => {
        set({ permissions: mergeWithDefaults(overrides) });
    },

    hasPermission: (userRole, requiredScope) => {
        if (!userRole) return false;
        const rolePerms = get().permissions[userRole] || [];
        if (rolePerms.includes('all')) return true;
        return rolePerms.includes(requiredScope);
    },
}));
