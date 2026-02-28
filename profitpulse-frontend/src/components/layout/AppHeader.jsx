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
            background: 'rgba(255, 255, 255, 0.85)', // Translucent light
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(4, 2, 34, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 90,
            height: 64
        }}>
            <div className="breadcrumb-area">
                {/* Placeholder for dynamic breadcrumbs */}
                <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.02em', color: '#6B7280' }}>WORKSPACE / OVERVIEW</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                <Button type="text" icon={<Bell size={20} style={{ color: '#6B7280' }} />} />
                <Dropdown menu={profileMenu} placement="bottomRight" trigger={['click']}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', padding: '6px 12px', borderRadius: 'var(--radius-button)', transition: 'background 0.2s', background: '#F6F6F6', border: '1px solid rgba(4, 2, 34, 0.08)' }}>
                        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                            <span style={{ fontSize: 14, fontWeight: 600, color: '#040222' }}>{user?.name || 'Administrator'}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end', marginTop: 3 }}>
                                <Tag color="red" bordered={false} style={{ margin: 0, fontSize: 10, lineHeight: 1.2 }}>{user?.role?.toUpperCase() || 'ADMIN'}</Tag>
                            </div>
                        </div>
                        <Avatar style={{ backgroundColor: '#F11A10', color: '#FFF', fontWeight: 700 }}>{user?.name?.charAt(0) || 'A'}</Avatar>
                    </div>
                </Dropdown>
            </div>
        </Header>
    );
}
