import { Layout, Dropdown, Avatar, Tag, Button } from 'antd';
import { Bell, LogOut, User } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';

const { Header } = Layout;

export default function AppHeader() {
    const { user, clearAuth } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        clearAuth();
        navigate('/login');
    };

    const profileMenu = {
        items: [
            { key: 'profile', icon: <User size={16} />, label: 'Profile' },
            { type: 'divider' },
            { key: 'logout', icon: <LogOut size={16} />, label: 'Sign out', danger: true, onClick: handleLogout },
        ]
    };

    return (
        <Header style={{
            padding: '0 32px',
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(8px)',
            borderBottom: '1px solid var(--color-card-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 9,
            height: 64
        }}>
            <div className="breadcrumb-area">
                {/* Placeholder for dynamic breadcrumbs */}
                <span style={{ fontSize: 14, color: 'var(--color-text-muted)' }}>Workspace / Overview</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                <Button type="text" icon={<Bell size={20} className="text-muted" />} />
                <Dropdown menu={profileMenu} placement="bottomRight" trigger={['click']}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', padding: '4px 8px', borderRadius: 'var(--radius-button)', transition: 'background 0.2s' }} className="hover:bg-slate-50">
                        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }}>{user?.name || 'Administrator'}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
                                <Tag color="blue" bordered={false} style={{ margin: 0, fontSize: 10, lineHeight: 1 }}>{user?.role?.toUpperCase() || 'ADMIN'}</Tag>
                            </div>
                        </div>
                        <Avatar style={{ backgroundColor: 'var(--color-primary-action)' }}>{user?.name?.charAt(0) || 'A'}</Avatar>
                    </div>
                </Dropdown>
            </div>
        </Header>
    );
}
