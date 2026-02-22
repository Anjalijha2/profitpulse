import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import AppHeader from './AppHeader';
import { useUiStore } from '../../store/uiStore';
import WaveCanvas from '../common/WaveCanvas';

const { Content } = Layout;

export default function AppLayout() {
    const { sidebarCollapsed } = useUiStore();

    return (
        <Layout style={{ minHeight: '100vh', background: 'transparent' }}>
            {/* Ambient Animated Background */}
            <WaveCanvas />

            <Sidebar />
            <Layout style={{
                marginLeft: sidebarCollapsed ? 80 : 256,
                transition: 'all 0.25s ease',
                background: 'transparent',
                // Adding a subtle backdrop blur over the wave background for the main content area
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
            }}>
                <AppHeader />
                <Content className="page-transition" style={{ margin: '32px 40px', overflow: 'initial' }}>
                    <div style={{ maxWidth: 1600, margin: '0 auto' }}>
                        <Outlet />
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
}
