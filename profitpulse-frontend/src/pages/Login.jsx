import { Card, Result, Button } from 'antd';
import { MailOutlined, LockOutlined, ArrowRightOutlined } from '@ant-design/icons';

// Wait, the auth is done, now generating the Login page
import { Form, Input, Checkbox, message, Typography } from 'antd';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { apiClient } from '../api/client';
import { useAuthStore } from '../store/authStore';

const { Title, Text } = Typography;

export default function Login() {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const setAuth = useAuthStore((state) => state.setAuth);

    const loginMutation = useMutation({
        mutationFn: async (values) => {
            const res = await apiClient.post('/auth/login', values);
            return res.data;
        },
        onSuccess: (data) => {
            setAuth(data.user, data.token);
            message.success('Welcome back to ProfitPulse.');
            navigate('/dashboard');
        },
        onError: (error) => {
            message.error(error || 'Invalid credentials.');
        },
    });

    const onFinish = (values) => {
        loginMutation.mutate(values);
    };

    return (
        <Card
            bordered={false}
            style={{
                boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
                borderRadius: 16,
                padding: '32px 16px'
            }}
        >
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
                <Title level={2} style={{ margin: 0, fontWeight: 700, letterSpacing: '-0.03em' }}>
                    Log in
                </Title>
                <Text style={{ color: '#6b7280', fontSize: 16 }}>
                    Enter your credentials to access your workspace.
                </Text>
            </div>

            <Form
                form={form}
                name="login"
                layout="vertical"
                initialValues={{ remember: true }}
                onFinish={onFinish}
                size="large"
            >
                <Form.Item
                    name="email"
                    rules={[{ required: true, message: 'Please input your email!' }, { type: 'email', message: 'Valid email required' }]}
                >
                    <Input
                        prefix={<MailOutlined style={{ color: '#9ca3af' }} />}
                        placeholder="name@company.com"
                        style={{ borderRadius: 8 }}
                    />
                </Form.Item>

                <Form.Item
                    name="password"
                    rules={[{ required: true, message: 'Please input your password!' }]}
                >
                    <Input.Password
                        prefix={<LockOutlined style={{ color: '#9ca3af' }} />}
                        placeholder="Password"
                        style={{ borderRadius: 8 }}
                    />
                </Form.Item>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <Form.Item name="remember" valuePropName="checked" noStyle>
                        <Checkbox>Remember me</Checkbox>
                    </Form.Item>
                    <a style={{ color: '#6366f1', fontSize: 14, fontWeight: 500 }}>
                        Forgot password?
                    </a>
                </div>

                <Form.Item style={{ marginBottom: 0 }}>
                    <Button
                        type="primary"
                        htmlType="submit"
                        block
                        loading={loginMutation.isPending}
                        style={{
                            borderRadius: 8,
                            fontWeight: 500,
                            height: 44,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: 8
                        }}
                    >
                        Sign in <ArrowRightOutlined />
                    </Button>
                </Form.Item>
            </Form>
        </Card>
    );
}
