import { Form, Input, Checkbox, message, Typography, Button, Alert } from 'antd';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { EyeInvisibleOutlined, EyeTwoTone, MailOutlined, LockOutlined } from '@ant-design/icons';
import { axiosInstance } from '../../api/axiosInstance';
import { useAuthStore } from '../../store/authStore';

const { Title, Text } = Typography;

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
        <div style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
            {/* LEFT HALF */}
            <div style={{ flex: '0 0 55%', background: 'linear-gradient(135deg, #0F172A, #1E3B6E)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '48px', color: 'white', position: 'relative', overflow: 'hidden' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 40, height: 40, background: '#3B82F6', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 24, fontWeight: 700 }}>
                            ⚡
                        </div>
                        <span style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em' }}>ProfitPulse.</span>
                    </div>
                    <p style={{ marginTop: 12, fontSize: 16, color: '#94A3B8' }}>Profitability Intelligence</p>
                </div>

                <div style={{ position: 'relative', zIndex: 10, alignSelf: 'center', marginTop: -40 }}>
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        padding: '24px 32px',
                        borderRadius: 16,
                        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                        animation: 'fadeInUp 1s ease 0.2s both'
                    }}>
                        <p style={{ margin: 0, color: '#94A3B8', fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Gross Margin</p>
                        <h2 style={{ margin: '8px 0 0 0', fontSize: 40, fontWeight: 700, color: '#10B981', display: 'flex', alignItems: 'center', gap: 12 }}>
                            42.5% <span style={{ fontSize: 24 }}>↑</span>
                        </h2>
                    </div>
                </div>

                <div style={{ fontSize: 12, color: '#475569' }}>
                    © 2025 OSSPL
                </div>

                {/* Decor */}
                <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: 600, height: 600, background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(15,23,42,0) 70%)', borderRadius: '50%' }} />
            </div>

            {/* RIGHT HALF */}
            <div style={{ flex: '0 0 45%', background: '#FFFFFF', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 80px', animation: 'slideIn 0.5s ease' }}>
                <div style={{ maxWidth: 400, width: '100%' }}>
                    <Title level={2} style={{ margin: 0, fontWeight: 700, color: '#0F172A', letterSpacing: '-0.02em' }}>
                        Welcome back
                    </Title>
                    <Text style={{ color: '#94A3B8', fontSize: 14, display: 'block', marginBottom: 32 }}>
                        Sign in to your account
                    </Text>

                    {loginMutation.isError && (
                        <Alert
                            message={loginMutation.error?.response?.data?.message || loginMutation.error?.message || 'Invalid email or password'}
                            type="error"
                            showIcon
                            style={{ marginBottom: 24, borderRadius: 8 }}
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
                            label={<span style={{ fontWeight: 500, color: '#475569' }}>Email</span>}
                            name="email"
                            rules={[{ required: true, message: 'Please input your email!' }, { type: 'email', message: 'Valid email required' }]}
                        >
                            <Input
                                prefix={<MailOutlined style={{ color: '#94A3B8' }} />}
                                placeholder="admin@profitpulse.com"
                            />
                        </Form.Item>

                        <Form.Item
                            label={<span style={{ fontWeight: 500, color: '#475569' }}>Password</span>}
                            name="password"
                            rules={[{ required: true, message: 'Please input your password!' }]}
                        >
                            <Input.Password
                                prefix={<LockOutlined style={{ color: '#94A3B8' }} />}
                                iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                                placeholder="••••••••"
                            />
                        </Form.Item>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                            <Form.Item name="remember" valuePropName="checked" noStyle>
                                <Checkbox style={{ color: '#475569' }}>Remember me</Checkbox>
                            </Form.Item>
                            <a href="#" style={{ color: '#3B82F6', fontSize: 14, fontWeight: 500 }}>
                                Forgot password?
                            </a>
                        </div>

                        <Form.Item style={{ marginBottom: 0 }}>
                            <Button
                                type="primary"
                                htmlType="submit"
                                block
                                loading={loginMutation.isPending}
                                className="btn-press"
                                style={{
                                    borderRadius: 8,
                                    fontWeight: 600,
                                    height: 44,
                                    fontSize: 16
                                }}
                            >
                                Sign In
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
            </div>
        </div>
    );
}
