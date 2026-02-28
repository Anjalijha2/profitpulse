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
                /* Clean Inputs */
                .pp-glass-input.ant-input,
                .pp-glass-input.ant-input-affix-wrapper {
                    background: #FFFFFF !important;
                    border: 1px solid rgba(4, 2, 34, 0.15) !important;
                    border-radius: 8px !important;
                    height: 52px !important;
                    font-size: 15px !important;
                    color: #040222 !important;
                    transition: border-color 0.2s, box-shadow 0.2s, background 0.2s !important;
                }
                .pp-glass-input.ant-input-affix-wrapper:hover,
                .pp-glass-input.ant-input-affix-wrapper-focused {
                    background: #FFFFFF !important;
                    border-color: #F11A10 !important;
                    box-shadow: 0 0 0 3px rgba(241, 26, 16, 0.15) !important;
                }
                .pp-glass-input .ant-input {
                    background: transparent !important;
                    border: none !important;
                    box-shadow: none !important;
                    height: auto !important;
                    color: #040222 !important;
                }
                .pp-glass-input .ant-input::placeholder {
                    color: #6B7280 !important;
                }

                /* Override Checkbox Text Color */
                .ant-checkbox-wrapper {
                    color: #212529 !important;
                }
                .ant-checkbox-inner {
                    background-color: #FFFFFF !important;
                    border-color: rgba(4, 2, 34, 0.3) !important;
                }
                .ant-checkbox-checked .ant-checkbox-inner {
                    background-color: #F11A10 !important;
                    border-color: #F11A10 !important;
                }

                /* Primary Button */
                .pp-glow-btn {
                    background: #F11A10 !important;
                    border: none !important;
                    border-radius: 8px !important;
                    height: 52px !important;
                    font-size: 16px !important;
                    font-weight: 600 !important;
                    letter-spacing: 0.02em !important;
                    color: white !important;
                    box-shadow: 0 4px 14px rgba(241, 26, 16, 0.3) !important;
                    transition: transform 0.2s, box-shadow 0.2s, background 0.2s !important;
                }
                .pp-glow-btn:hover {
                    transform: translateY(-2px) !important;
                    box-shadow: 0 6px 20px rgba(241, 26, 16, 0.4) !important;
                    background: #D1170D !important;
                }
                .pp-glow-btn:active {
                    transform: translateY(0) !important;
                }
                
                /* Modal Animation */
                @keyframes floatIn {
                    from { opacity: 0; transform: scale(0.96) translateY(20px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
            `}</style>

            {/* 2. Top-Left Logo (Optional, looks nice outside the modal) */}
            <div style={{ position: 'absolute', top: 40, left: 48, zIndex: 20 }}>
                <ProfitPulseLogo size={42} />
            </div>

            {/* 3. Centered Clean Modal */}
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
                    // Clean white card
                    background: '#FFFFFF',
                    border: '1px solid rgba(4, 2, 34, 0.08)',
                    borderRadius: '16px',
                    boxShadow: '0 12px 40px rgba(4, 2, 34, 0.06)',
                    animation: 'floatIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards'
                }}>

                    <div style={{ textAlign: 'center', marginBottom: 36 }}>
                        <div style={{
                            width: 56, height: 56,
                            margin: '0 auto 20px',
                            background: '#FAF5FF',
                            border: '1px solid rgba(4, 2, 34, 0.08)',
                            borderRadius: '12px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            {/* Small icon version of logo inside modal */}
                            <ProfitPulseLogo size={28} showText={false} />
                        </div>

                        <h1 style={{ margin: '0 0 8px', fontSize: 28, fontWeight: 700, color: '#040222', letterSpacing: '-0.02em' }}>
                            Welcome back
                        </h1>
                        <p style={{ margin: 0, fontSize: 15, color: '#6B7280' }}>
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
                                borderRadius: 8,
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                color: '#EF4444'
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
                                prefix={<MailOutlined style={{ color: '#6B7280', fontSize: 18, marginRight: 8 }} />}
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
                                prefix={<LockOutlined style={{ color: '#6B7280', fontSize: 18, marginRight: 8 }} />}
                                iconRender={(v) => v
                                    ? <EyeTwoTone twoToneColor="#6B7280" />
                                    : <EyeInvisibleOutlined style={{ color: '#6B7280' }} />
                                }
                                placeholder="Password"
                            />
                        </Form.Item>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                            <Form.Item name="remember" valuePropName="checked" noStyle>
                                <Checkbox>Remember me</Checkbox>
                            </Form.Item>
                            <a href="#" style={{ color: '#F11A10', fontSize: 14, fontWeight: 500, textDecoration: 'none', transition: 'color 0.2s' }}
                                onMouseEnter={(e) => e.target.style.color = '#D1170D'}
                                onMouseLeave={(e) => e.target.style.color = '#F11A10'}>
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
            <div style={{ position: 'absolute', bottom: 24, width: '100%', textAlign: 'center', zIndex: 10, fontSize: 13, color: '#6B7280' }}>
                © 2026 ProfitPulse  •  Confidential Access Region
            </div>

        </div>
    );
}
