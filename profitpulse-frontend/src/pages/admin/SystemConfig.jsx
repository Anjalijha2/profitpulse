import React, { useState, useEffect } from 'react';
import { Card, Typography, Form, InputNumber, Button, message, Spin, Tabs } from 'antd';
import { Save, DollarSign, Settings, Link } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { axiosInstance } from '../../api/axiosInstance';

const { Title, Text } = Typography;

export default function SystemConfig() {
    const [form] = Form.useForm();

    const { data: qData, isLoading, refetch } = useQuery({
        queryKey: ['systemConfig'],
        queryFn: async () => {
            const res = await axiosInstance.get('/config');
            return res.data;
        }
    });

    const updateMutation = useMutation({
        mutationFn: async (values) => {
            const configs = Object.keys(values).map(key => ({ key, value: values[key] }));
            const res = await axiosInstance.put('/config', { configs });
            return res.data;
        },
        onSuccess: () => {
            message.success('System configuration updated successfully.');
            refetch();
        },
        onError: () => {
            message.error('Failed to update system config.');
        }
    });

    useEffect(() => {
        const configsArray = qData?.configs || qData?.data?.configs;
        if (configsArray) {
            const configMap = {};
            configsArray.forEach(item => {
                configMap[item.key] = Number(item.value);
            });
            form.setFieldsValue({
                overhead_cost_per_year: configMap.overhead_cost_per_year ?? 180000,
                standard_monthly_hours: configMap.standard_monthly_hours ?? 160
            });
        }
    }, [qData, form]);

    const onFinish = (values) => {
        updateMutation.mutate(values);
    };

    if (isLoading) return <Spin style={{ display: 'block', margin: '100px auto' }} />;

    const items = [
        {
            key: 'financials',
            label: <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><DollarSign size={16} /> Financials</span>,
            children: (
                <div style={{ paddingTop: 16 }}>
                    <Form form={form} layout="vertical" onFinish={onFinish}>
                        <Form.Item
                            name="overhead_cost_per_year"
                            label={<span style={{ fontWeight: 500 }}>Default Annual Overhead Cost (₹)</span>}
                            extra="Fixed annual cost applied evenly across all billable and non-billable resources."
                        >
                            <InputNumber
                                style={{ width: '100%' }}
                                size="large"
                                formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            />
                        </Form.Item>

                        <Form.Item
                            name="standard_monthly_hours"
                            label={<span style={{ fontWeight: 500 }}>Standard Monthly Hours</span>}
                            extra="Base hours used to calculate effective hourly rate per resource."
                        >
                            <InputNumber style={{ width: '100%' }} size="large" />
                        </Form.Item>

                        <div style={{ padding: '24px 0 0 0', marginTop: 16, borderTop: '1px solid var(--color-border)' }}>
                            <Button type="primary" htmlType="submit" icon={<Save size={16} />} loading={updateMutation.isPending} size="large">
                                Save Financial Settings
                            </Button>
                        </div>
                    </Form>
                </div>
            )
        },
        {
            key: 'general',
            label: <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Settings size={16} /> General Defaults</span>,
            children: (
                <div style={{ paddingTop: 16, textAlign: 'center', color: 'gray' }}>
                    <p>Coming Soon</p>
                    <p style={{ fontSize: 13 }}>Configure company-wide defaults like Timezones, Default Language, and Date Formats.</p>
                </div>
            )
        },
        {
            key: 'integrations',
            label: <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Link size={16} /> Integrations</span>,
            children: (
                <div style={{ paddingTop: 16, textAlign: 'center', color: 'gray' }}>
                    <p>Coming Soon</p>
                    <p style={{ fontSize: 13 }}>Connect to Jira, Active Directory, or ERP systems.</p>
                </div>
            )
        }
    ];

    return (
        <div className="animate-fade-in-up">
            <div style={{ marginBottom: 32 }}>
                <Title level={2} className="page-title" style={{ margin: 0, color: 'var(--color-text-primary)' }}>
                    System Configuration
                </Title>
                <Text className="text-caption" style={{ fontSize: 14 }}>
                    Manage global financial constants, integrations, and system defaults.
                </Text>
            </div>

            <Card bordered={false} style={{ maxWidth: 800, borderRadius: 'var(--radius-card)', boxShadow: 'var(--shadow-card-default)' }} bodyStyle={{ padding: 0 }}>
                <Tabs defaultActiveKey="financials" items={items} tabPosition="left" style={{ minHeight: 400 }} />
            </Card>
        </div>
    );
}
