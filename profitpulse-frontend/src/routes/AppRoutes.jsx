import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useRbacStore } from '../store/rbacStore';
import { useEffect } from 'react';
import AppLayout from '../components/layout/AppLayout';
import AuthLayout from '../layouts/AuthLayout';
import LoginPage from '../pages/auth/LoginPage';
import ExecutiveDashboard from '../pages/dashboard/ExecutiveDashboard';
import ProjectDashboard from '../pages/dashboard/ProjectDashboard';
import EmployeeDashboard from '../pages/dashboard/EmployeeDashboard';
import ClientDashboard from '../pages/dashboard/ClientDashboard';
import DepartmentDashboard from '../pages/dashboard/DepartmentDashboard';

import EmployeeList from '../pages/data/EmployeeList';
import EmployeeDetail from '../pages/data/EmployeeDetail';
import ProjectList from '../pages/data/ProjectList';
import ProjectDetail from '../pages/data/ProjectDetail';
import UploadCenter from '../pages/data/UploadCenter';
import RevenueList from '../pages/data/RevenueList';
import ClientList from '../pages/data/ClientList';

import ProtectedRoute from '../components/common/ProtectedRoute';
import NotFoundPage from '../pages/NotFoundPage';
import ForbiddenPage from '../pages/ForbiddenPage';

import ReportCenter from '../pages/reports/ReportCenter';
import SystemConfig from '../pages/admin/SystemConfig';
import AuditLog from '../pages/admin/AuditLog';
import UserManagement from '../pages/admin/UserManagement';
import RoleAccessConfig from '../pages/admin/RoleAccessConfig';

// Basic wrapper for unauthenticated pages
const PublicRoute = ({ children }) => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    if (isAuthenticated) return <Navigate to="/" replace />;
    return children;
};

// Redirect root to role-based dashboard
const RootRedirect = () => {
    const { user } = useAuthStore();
    if (user?.role === 'admin' || user?.role === 'finance') return <Navigate to="/dashboard/executive" replace />;
    if (user?.role === 'delivery_manager') return <Navigate to="/dashboard/project" replace />;
    if (user?.role === 'dept_head') return <Navigate to="/dashboard/department" replace />;
    if (user?.role === 'hr') return <Navigate to="/dashboard/employee" replace />;
    return <Navigate to="/dashboard/executive" replace />;
};

export default function AppRoutes() {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuthStore();
    const loadFromApi = useRbacStore((s) => s.loadFromApi);

    // Load RBAC overrides from the API whenever a user authenticates.
    // This ensures every user (not just admin) gets the latest permission settings.
    useEffect(() => {
        if (isAuthenticated) {
            loadFromApi();
        }
    }, [isAuthenticated, loadFromApi]);

    useEffect(() => {
        const handler = () => navigate('/403', { replace: true });
        window.addEventListener('app:forbidden', handler);
        return () => window.removeEventListener('app:forbidden', handler);
    }, [navigate]);
    return (
        <Routes>
            <Route element={<PublicRoute><AuthLayout /></PublicRoute>}>
                <Route path="/login" element={<LoginPage />} />
            </Route>

            <Route element={<AppLayout />}>
                {/* Dashboards */}
                <Route path="/" element={<ProtectedRoute><RootRedirect /></ProtectedRoute>} />
                <Route path="/dashboard" element={<Navigate to="/" replace />} />

                <Route path="/dashboard/executive" element={
                    <ProtectedRoute requiredScope="dashboard:executive">
                        <ExecutiveDashboard />
                    </ProtectedRoute>
                } />

                <Route path="/dashboard/project" element={
                    <ProtectedRoute requiredScope="dashboard:project">
                        <ProjectDashboard />
                    </ProtectedRoute>
                } />

                <Route path="/dashboard/employee" element={
                    <ProtectedRoute requiredScope="dashboard:employee">
                        <EmployeeDashboard />
                    </ProtectedRoute>
                } />

                <Route path="/dashboard/department" element={
                    <ProtectedRoute requiredScope="dashboard:department">
                        <DepartmentDashboard />
                    </ProtectedRoute>
                } />

                <Route path="/dashboard/client" element={
                    <ProtectedRoute requiredScope="dashboard:client">
                        <ClientDashboard />
                    </ProtectedRoute>
                } />

                {/* Data Management */}
                <Route path="/employees" element={
                    <ProtectedRoute requiredScope="employees">
                        <EmployeeList />
                    </ProtectedRoute>
                } />

                <Route path="/employees/:id" element={
                    <ProtectedRoute requiredScope="employees">
                        <EmployeeDetail />
                    </ProtectedRoute>
                } />

                <Route path="/projects" element={
                    <ProtectedRoute requiredScope="projects">
                        <ProjectList />
                    </ProtectedRoute>
                } />

                <Route path="/projects/:id" element={
                    <ProtectedRoute requiredScope="projects">
                        <ProjectDetail />
                    </ProtectedRoute>
                } />

                <Route path="/clients" element={
                    <ProtectedRoute requiredScope="projects">
                        <ClientList />
                    </ProtectedRoute>
                } />

                <Route path="/revenue" element={
                    <ProtectedRoute requiredScope="revenue">
                        <RevenueList />
                    </ProtectedRoute>
                } />

                <Route path="/upload" element={
                    <ProtectedRoute requiredScope="uploads">
                        <UploadCenter />
                    </ProtectedRoute>
                } />

                <Route path="/reports" element={
                    <ProtectedRoute requiredScope="reports">
                        <ReportCenter />
                    </ProtectedRoute>
                } />

                {/* Administration */}
                <Route path="/admin/users" element={
                    <ProtectedRoute requiredScope="all">
                        <UserManagement />
                    </ProtectedRoute>
                } />

                <Route path="/admin/config" element={
                    <ProtectedRoute requiredScope="all">
                        <SystemConfig />
                    </ProtectedRoute>
                } />

                <Route path="/admin/audit-log" element={
                    <ProtectedRoute requiredScope="all">
                        <AuditLog />
                    </ProtectedRoute>
                } />

                <Route path="/admin/rbac" element={
                    <ProtectedRoute requiredScope="all">
                        <RoleAccessConfig />
                    </ProtectedRoute>
                } />

                {/* 403 & 404 */}
                <Route path="/403" element={<ForbiddenPage />} />
                <Route path="*" element={<NotFoundPage />} />
            </Route>
        </Routes>
    );
}
