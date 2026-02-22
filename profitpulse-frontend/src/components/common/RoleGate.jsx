import { useAuthStore } from '../../store/authStore';
import { useRbacStore } from '../../store/rbacStore';

/**
 * Conditionally renders children based on the server-sourced RBAC permissions.
 * Uses the reactive rbacStore (fetched from the API on login) for consistency
 * with ProtectedRoute and Sidebar visibility checks.
 */
export default function RoleGate({ children, requiredScope }) {
    const { user } = useAuthStore();
    const hasPermission = useRbacStore((s) => s.hasPermission);

    if (!user || !hasPermission(user.role, requiredScope)) {
        return null;
    }

    return children;
}
