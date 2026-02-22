import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useRbacStore } from '../../store/rbacStore';
import { message, Spin } from 'antd';

export default function ProtectedRoute({ children, requiredScope }) {
    const { isAuthenticated, user } = useAuthStore();
    const hasPermission = useRbacStore((s) => s.hasPermission);
    const isLoaded = useRbacStore((s) => s.isLoaded);
    const location = useLocation();

    if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;

    // If a specific scope is required, we MUST wait for the RBAC config to finish loading from the API
    if (requiredScope && !isLoaded) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <Spin size="large" />
            </div>
        );
    }

    if (requiredScope && !hasPermission(user?.role, requiredScope)) {
        message.warning('You do not have permission to access that module.');
        return <Navigate to="/403" replace />;
    }

    return children;
}
