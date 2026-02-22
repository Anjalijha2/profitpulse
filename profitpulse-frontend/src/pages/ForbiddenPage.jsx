import React from 'react';
import { Typography, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

const { Title, Text } = Typography;

export default function ForbiddenPage() {
    const navigate = useNavigate();

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)',
            textAlign: 'center',
            padding: '0 20px',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background decorative circles */}
            <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '400px', height: '400px', background: 'rgba(225, 29, 72, 0.05)', borderRadius: '50%', filter: 'blur(60px)' }}></div>
            <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: '400px', height: '400px', background: 'rgba(244, 63, 94, 0.05)', borderRadius: '50%', filter: 'blur(60px)' }}></div>

            <div className="animate-fade-in-up" style={{
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                padding: '60px 40px',
                borderRadius: '24px',
                boxShadow: '0 20px 40px rgba(225, 29, 72, 0.05)',
                maxWidth: '500px',
                width: '100%',
                border: '1px solid rgba(255, 255, 255, 0.5)'
            }}>
                <div style={{
                    width: '80px',
                    height: '80px',
                    background: '#ffe4e6',
                    color: '#e11d48',
                    borderRadius: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 24px auto',
                    boxShadow: '0 10px 20px rgba(225, 29, 72, 0.15)'
                }}>
                    <ShieldAlert size={40} />
                </div>

                <h1 style={{ fontSize: '72px', fontWeight: 800, margin: 0, background: 'linear-gradient(to right, #e11d48, #f43f5e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1 }}>
                    403
                </h1>

                <Title level={3} style={{ margin: '16px 0 8px', color: 'var(--color-text-primary)' }}>
                    Access Restricted
                </Title>

                <Text style={{ display: 'block', marginBottom: '32px', color: 'var(--color-text-secondary)', fontSize: '16px', lineHeight: '1.6' }}>
                    You don't have the necessary privileges to view this page. If you believe this is a mistake, please contact your administrator.
                </Text>

                <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                    <Button
                        type="primary"
                        size="large"
                        icon={<ArrowLeft size={18} />}
                        onClick={() => navigate(-1)}
                        style={{ height: '48px', padding: '0 24px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', background: '#e11d48', borderColor: '#e11d48' }}
                    >
                        Go Back
                    </Button>
                    <Button
                        size="large"
                        onClick={() => navigate('/')}
                        style={{ height: '48px', padding: '0 24px', borderRadius: '12px', display: 'flex', alignItems: 'center' }}
                    >
                        Return to Dashboard
                    </Button>
                </div>
            </div>
        </div>
    );
}
