import { useState } from 'react';
import { Layout, Menu, Button, Dropdown, Avatar, theme as antdTheme } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Briefcase,
    UploadCloud,
    LogOut,
    Settings,
    Bell
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const { Header, Sider, Content } = Layout;

export default function DashboardLayout() {
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuthStore();

    const {
        token: { colorBgContainer, borderRadiusLG },
    } = antdTheme.useToken();

    const handleMenuClick = (e) => {
        navigate(`/${e.key}`);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const menuItems = [
        { key: 'dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
        { key: 'projects', icon: <Briefcase size={18} />, label: 'Projects' },
        { key: 'employees', icon: <Users size={18} />, label: 'Employees' },
        { key: 'uploads', icon: <UploadCloud size={18} />, label: 'Data Hub' },
    ];

    const profileMenu = {
        items: [
            { key: 'settings', icon: <Settings size={16} />, label: 'Settings' },
            { type: 'divider' },
            { key: 'logout', icon: <LogOut size={16} />, label: 'Sign out', danger: true, onClick: handleLogout },
        ]
    };

    return (
        <Layout style={{ minHeight: '100vh', background: '#f9fafb' }}>
            <Sider
                collapsible
                collapsed={collapsed}
                onCollapse={(value) => setCollapsed(value)}
                theme="light"
                width={260}
                style={{
                    borderRight: '1px solid #e5e7eb',
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    zIndex: 10
                }}
            >
                <div style={{ padding: '24px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 32, height: 32, background: '#111827', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 }}>
                        P
                    </div>
                    {!collapsed && <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em', color: '#111827' }}>ProfitPulse</span>}
                </div>
                <Menu
                    theme="light"
                    mode="inline"
                    selectedKeys={[location.pathname.replace('/', '') || 'dashboard']}
                    items={menuItems}
                    onClick={handleMenuClick}
                    style={{ borderRight: 0, padding: '0 12px' }}
                />
            </Sider>
            <Layout style={{ marginLeft: collapsed ? 80 : 260, transition: 'all 0.2s', background: 'transparent' }}>
                <Header style={{
                    padding: '0 32px',
                    background: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(8px)',
                    borderBottom: '1px solid #e5e7eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    position: 'sticky',
                    top: 0,
                    zIndex: 9
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                        <Button type="text" icon={<Bell size={20} color="#4b5563" />} />
                        <Dropdown menu={profileMenu} placement="bottomRight" trigger={['click']}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', padding: '4px 8px', borderRadius: 6, transition: 'background 0.2s' }}>
                                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                                    <span style={{ fontSize: 14, fontWeight: 500, color: '#111827' }}>{user?.name || 'Admin'}</span>
                                    <span style={{ fontSize: 12, color: '#6b7280' }}>{user?.role || 'Executive'}</span>
                                </div>
                                <Avatar style={{ backgroundColor: '#6366f1' }}>{user?.name?.charAt(0) || 'A'}</Avatar>
                            </div>
                        </Dropdown>
                    </div>
                </Header>
                <Content style={{ margin: '32px', overflow: 'initial' }}>
                    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
                        <Outlet />
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
}
