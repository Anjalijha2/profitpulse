import { Form, Input, Checkbox, message, Button, Alert } from 'antd';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { EyeInvisibleOutlined, EyeTwoTone, MailOutlined, LockOutlined } from '@ant-design/icons';
import { useEffect, useRef } from 'react';
import { axiosInstance } from '../../api/axiosInstance';
import { useAuthStore } from '../../store/authStore';
import ProfitPulseLogo from '../../components/common/ProfitPulseLogo';

import WaveCanvas from '../../components/common/WaveCanvas';

// ─── Login Page ───────────────────────────────────────────────────────────────
export default function LoginPage() {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const setAuth = useAuthStore((state) => state.setAuth);

    const loginMutation = useMutation({
        mutationFn: async (values) => {
            const res = await axiosInstance.post('/auth/login', values);
            return res;
        },
        onSuccess: (res) => {
            setAuth(res.data.user, res.data.token);
            message.success('Welcome back to ProfitPulse.');
            navigate('/');
        },
    });

    return (
        <div style={{ position: 'relative', minHeight: '100vh', width: '100%', fontFamily: "'Inter', -apple-system, sans-serif", overflow: 'hidden' }}>

            {/* 1. Full Screen Waves Background */}
            <WaveCanvas />

            <style>{`
                /* Glassmorphism Inputs */
                .pp-glass-input.ant-input,
                .pp-glass-input.ant-input-affix-wrapper {
                    background: rgba(255, 255, 255, 0.08) !important;
                    border: 1px solid rgba(255, 255, 255, 0.15) !important;
                    border-radius: 12px !important;
                    height: 52px !important;
                    font-size: 15px !important;
                    color: #FFFFFF !important;
                    transition: border-color 0.2s, box-shadow 0.2s, background 0.2s !important;
                }
                .pp-glass-input.ant-input-affix-wrapper:hover,
                .pp-glass-input.ant-input-affix-wrapper-focused {
                    background: rgba(255, 255, 255, 0.12) !important;
                    border-color: rgba(34, 211, 238, 0.5) !important;
                    box-shadow: 0 0 0 3px rgba(34, 211, 238, 0.15) !important;
                }
                .pp-glass-input .ant-input {
                    background: transparent !important;
                    border: none !important;
                    box-shadow: none !important;
                    height: auto !important;
                    color: #FFFFFF !important;
                }
                .pp-glass-input .ant-input::placeholder {
                    color: rgba(255, 255, 255, 0.4) !important;
                }

                /* Override Checkbox Text Color */
                .ant-checkbox-wrapper {
                    color: #E2E8F0 !important;
                }
                .ant-checkbox-inner {
                    background-color: rgba(255,255,255,0.1) !important;
                    border-color: rgba(255,255,255,0.3) !important;
                }
                .ant-checkbox-checked .ant-checkbox-inner {
                    background-color: #22D3EE !important;
                    border-color: #22D3EE !important;
                }

                /* Glow Button */
                .pp-glow-btn {
                    background: linear-gradient(135deg, #06B6D4, #3B82F6) !important;
                    border: none !important;
                    border-radius: 12px !important;
                    height: 52px !important;
                    font-size: 16px !important;
                    font-weight: 600 !important;
                    letter-spacing: 0.02em !important;
                    color: white !important;
                    box-shadow: 0 4px 20px rgba(6, 182, 212, 0.4) !important;
                    transition: transform 0.2s, box-shadow 0.2s !important;
                }
                .pp-glow-btn:hover {
                    transform: translateY(-2px) !important;
                    box-shadow: 0 6px 28px rgba(6, 182, 212, 0.6) !important;
                }
                .pp-glow-btn:active {
                    transform: translateY(0) !important;
                }
                
                /* Glass Panel Animation */
                @keyframes floatIn {
                    from { opacity: 0; transform: scale(0.96) translateY(20px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
            `}</style>

            {/* 2. Top-Left Logo (Optional, looks nice outside the modal) */}
            <div style={{ position: 'absolute', top: 40, left: 48, zIndex: 20 }}>
                <ProfitPulseLogo size={42} dark />
            </div>

            {/* 3. Centered Glassmorphism Modal */}
            <div style={{
                position: 'relative',
                zIndex: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                padding: '24px'
            }}>
                <div style={{
                    width: '100%',
                    maxWidth: 440,
                    padding: '48px',
                    // Super premium glassmorphism
                    background: 'rgba(11, 20, 48, 0.45)',
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)', // Safari support
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '24px',
                    boxShadow: '0 30px 60px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.15)',
                    animation: 'floatIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards'
                }}>

                    <div style={{ textAlign: 'center', marginBottom: 36 }}>
                        <div style={{
                            width: 56, height: 56,
                            margin: '0 auto 20px',
                            background: 'rgba(255,255,255,0.08)',
                            border: '1px solid rgba(255,255,255,0.15)',
                            borderRadius: '16px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 8px 32px rgba(34, 211, 238, 0.2)'
                        }}>
                            {/* Small icon version of logo inside modal */}
                            <ProfitPulseLogo size={28} showText={false} dark />
                        </div>

                        <h1 style={{ margin: '0 0 8px', fontSize: 28, fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
                            Welcome back
                        </h1>
                        <p style={{ margin: 0, fontSize: 15, color: 'rgba(255, 255, 255, 0.6)' }}>
                            Sign in to your intelligent dashboard
                        </p>
                    </div>

                    {loginMutation.isError && (
                        <Alert
                            message={loginMutation.error?.response?.data?.message || 'Invalid email or password'}
                            type="error"
                            showIcon
                            style={{
                                marginBottom: 24,
                                borderRadius: 12,
                                background: 'rgba(239, 68, 68, 0.15)',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                color: '#FECACA'
                            }}
                        />
                    )}

                    <Form
                        form={form}
                        name="login"
                        layout="vertical"
                        initialValues={{ remember: true }}
                        onFinish={(values) => {
                            const { remember, ...loginData } = values;
                            loginMutation.mutate(loginData);
                        }}
                        size="large"
                    >
                        <Form.Item
                            name="email"
                            style={{ marginBottom: 20 }}
                            rules={[
                                { required: true, message: 'Please enter your email!' },
                                { type: 'email', message: 'Enter a valid email' }
                            ]}
                        >
                            <Input
                                className="pp-glass-input"
                                prefix={<MailOutlined style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: 18, marginRight: 8 }} />}
                                placeholder="Email address"
                            />
                        </Form.Item>

                        <Form.Item
                            name="password"
                            style={{ marginBottom: 24 }}
                            rules={[{ required: true, message: 'Please enter your password!' }]}
                        >
                            <Input.Password
                                className="pp-glass-input"
                                prefix={<LockOutlined style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: 18, marginRight: 8 }} />}
                                iconRender={(v) => v
                                    ? <EyeTwoTone twoToneColor="rgba(255, 255, 255, 0.6)" />
                                    : <EyeInvisibleOutlined style={{ color: 'rgba(255, 255, 255, 0.4)' }} />
                                }
                                placeholder="Password"
                            />
                        </Form.Item>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                            <Form.Item name="remember" valuePropName="checked" noStyle>
                                <Checkbox>Remember me</Checkbox>
                            </Form.Item>
                            <a href="#" style={{ color: '#22D3EE', fontSize: 14, fontWeight: 500, textDecoration: 'none', transition: 'text-shadow 0.2s' }}
                                onMouseEnter={(e) => e.target.style.textShadow = '0 0 8px rgba(34, 211, 238, 0.6)'}
                                onMouseLeave={(e) => e.target.style.textShadow = 'none'}>
                                Forgot password?
                            </a>
                        </div>

                        <Form.Item style={{ marginBottom: 0 }}>
                            <Button
                                type="primary"
                                htmlType="submit"
                                block
                                loading={loginMutation.isPending}
                                className="pp-glow-btn"
                            >
                                Sign In to Workspace
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
            </div>

            {/* Footer fixed at bottom center */}
            <div style={{ position: 'absolute', bottom: 24, width: '100%', textAlign: 'center', zIndex: 10, fontSize: 13, color: 'rgba(255, 255, 255, 0.3)' }}>
                © 2026 ProfitPulse  •  Confidential Access Region
            </div>

        </div>
    );
}
