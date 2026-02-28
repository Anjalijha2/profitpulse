import { useState, useEffect } from 'react';
import { Layout, Menu } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Users, Briefcase, FileText, UploadCloud, Settings, Database, Activity, Building, PieChart, ShieldAlert, ShieldCheck
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';
import { useRbacStore } from '../../store/rbacStore';
import ProfitPulseLogo from '../common/ProfitPulseLogo';

const { Sider } = Layout;

export default function Sidebar() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const { sidebarCollapsed, setSidebarCollapsed } = useUiStore();
    const hasPermission = useRbacStore((s) => s.hasPermission);

    const handleMenuClick = (e) => {
        navigate(e.key);
    };

    // Build recursive menu item builder with RoleGate permission checks
    const getMenuItems = () => {
        const items = [];

        // Dashboards
        if (hasPermission(user?.role, 'dashboard:executive') ||
            hasPermission(user?.role, 'dashboard:employee') ||
            hasPermission(user?.role, 'dashboard:project') ||
            hasPermission(user?.role, 'dashboard:department') ||
            hasPermission(user?.role, 'dashboard:client')) {

            const dashboardChildren = [];
            if (hasPermission(user?.role, 'dashboard:executive')) dashboardChildren.push({ key: '/dashboard/executive', label: 'Executive' });
            if (hasPermission(user?.role, 'dashboard:employee')) dashboardChildren.push({ key: '/dashboard/employee', label: 'Employee' });
            if (hasPermission(user?.role, 'dashboard:project')) dashboardChildren.push({ key: '/dashboard/project', label: 'Project' });
            if (hasPermission(user?.role, 'dashboard:department')) dashboardChildren.push({ key: '/dashboard/department', label: 'Department' });
            if (hasPermission(user?.role, 'dashboard:client')) dashboardChildren.push({ key: '/dashboard/client', label: 'Client' });

            items.push({
                key: 'dashboards',
                icon: <PieChart size={18} />,
                label: 'Dashboard',
                children: dashboardChildren
            });
        }

        // Data Management
        const dataChildren = [];
        if (hasPermission(user?.role, 'uploads')) dataChildren.push({ key: '/upload', icon: <UploadCloud size={18} />, label: 'Upload Center' });
        if (hasPermission(user?.role, 'employees')) dataChildren.push({ key: '/employees', icon: <Users size={18} />, label: 'Employees' });
        if (hasPermission(user?.role, 'projects')) {
            dataChildren.push({ key: '/projects', icon: <Briefcase size={18} />, label: 'Projects' });
            dataChildren.push({ key: '/clients', icon: <Building size={18} />, label: 'Clients' });
        }
        if (hasPermission(user?.role, 'revenue')) dataChildren.push({ key: '/revenue', icon: <Database size={18} />, label: 'Revenue' });

        if (dataChildren.length > 0) {
            items.push({
                key: 'data',
                icon: <Activity size={18} />,
                label: 'Data Hub',
                children: dataChildren
            });
        }

        // Reports
        if (hasPermission(user?.role, 'reports')) {
            items.push({ key: '/reports', icon: <FileText size={18} />, label: 'Reports' });
        }

        // Admin
        if (hasPermission(user?.role, 'all')) {
            items.push({
                key: 'admin',
                icon: <Settings size={18} />,
                label: 'Administration',
                children: [
                    { key: '/admin/users', icon: <Users size={18} />, label: 'Users' },
                    { key: '/admin/rbac', icon: <ShieldCheck size={18} />, label: 'Role Access Config' },
                    { key: '/admin/config', icon: <Settings size={18} />, label: 'System Config' },
                    { key: '/admin/audit-log', icon: <ShieldAlert size={18} />, label: 'Audit Log' },
                ]
            });
        }

        return items;
    };

    return (
        <Sider
            collapsible
            collapsed={sidebarCollapsed}
            onCollapse={setSidebarCollapsed}
            width={256}
            style={{
                background: 'rgba(6, 11, 25, 0.6)', /* Translucent dark navy */
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderRight: '1px solid rgba(255, 255, 255, 0.08)',
                overflow: 'auto',
                height: '100vh',
                position: 'fixed',
                left: 0,
                top: 0,
                bottom: 0,
                zIndex: 100,
                boxShadow: '4px 0 24px rgba(0, 0, 0, 0.4)'
            }}
            breakpoint="lg"
        >
            <div style={{ height: 64, padding: '14px 20px', display: 'flex', alignItems: 'center' }}>
                <ProfitPulseLogo collapsed={sidebarCollapsed} size={34} />
            </div>

            {/* Global CSS injected styling override for Ant Menu matching variables */}
            <Menu
                mode="inline"
                selectedKeys={[location.pathname]}
                defaultOpenKeys={['dashboards', 'data', 'admin']}
                items={getMenuItems()}
                onClick={handleMenuClick}
                style={{
                    background: 'transparent',
                    borderRight: 0,
                    padding: '0'
                }}
            />
        </Sider>
    );
}
