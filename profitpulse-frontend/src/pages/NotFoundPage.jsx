import React from 'react';
import { Typography, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { HelpCircle, ArrowLeft } from 'lucide-react';

const { Title, Text } = Typography;

export default function NotFoundPage() {
    const navigate = useNavigate();

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, var(--color-page-bg) 0%, #e2e8f0 100%)',
            textAlign: 'center',
            padding: '0 20px',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background decorative circles */}
            <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '400px', height: '400px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '50%', filter: 'blur(60px)' }}></div>
            <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: '400px', height: '400px', background: 'rgba(56, 189, 248, 0.1)', borderRadius: '50%', filter: 'blur(60px)' }}></div>

            <div className="animate-fade-in-up" style={{
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                padding: '60px 40px',
                borderRadius: '24px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.05)',
                maxWidth: '500px',
                width: '100%',
                border: '1px solid rgba(255, 255, 255, 0.5)'
            }}>
                <div style={{
                    width: '80px',
                    height: '80px',
                    background: 'var(--color-primary-light)',
                    color: 'var(--color-primary)',
                    borderRadius: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 24px auto',
                    boxShadow: '0 10px 20px rgba(99, 102, 241, 0.2)'
                }}>
                    <HelpCircle size={40} />
                </div>

                <h1 style={{ fontSize: '72px', fontWeight: 800, margin: 0, background: 'linear-gradient(to right, var(--color-primary), #38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1 }}>
                    404
                </h1>

                <Title level={3} style={{ margin: '16px 0 8px', color: 'var(--color-text-primary)' }}>
                    Looks like you're lost
                </Title>

                <Text style={{ display: 'block', marginBottom: '32px', color: 'var(--color-text-secondary)', fontSize: '16px', lineHeight: '1.6' }}>
                    The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                </Text>

                <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                    <Button
                        type="primary"
                        size="large"
                        icon={<ArrowLeft size={18} />}
                        onClick={() => navigate(-1)}
                        style={{ height: '48px', padding: '0 24px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        Go Back
                    </Button>
                    <Button
                        size="large"
                        onClick={() => navigate('/')}
                        style={{ height: '48px', padding: '0 24px', borderRadius: '12px', display: 'flex', alignItems: 'center' }}
                    >
                        Return Home
                    </Button>
                </div>
            </div>
        </div>
    );
}
