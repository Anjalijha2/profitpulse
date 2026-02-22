import React from 'react';
import { Card, Typography, Spin, Row, Col, Table, DatePicker, Tag } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../../api/axiosInstance';
import ChartCard from '../../components/common/ChartCard';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { formatINRCompact } from '../../utils/formatters';
import { useUiStore } from '../../store/uiStore';

const { Title, Text } = Typography;

export default function ClientDashboard() {
    const { selectedMonth, setSelectedMonth } = useUiStore();
    const monthStr = selectedMonth.format('YYYY-MM');

    const { data: qData, isLoading } = useQuery({
        queryKey: ['clientDashboard', monthStr],
        queryFn: async () => {
            const res = await axiosInstance.get(`/dashboard/client?month=${monthStr}`);
            return res.data;
        }
    });

    const clients = qData?.clients || qData?.data?.clients || [];

    const columns = [
        {
            title: 'Client',
            dataIndex: 'name',
            key: 'name',
            render: (text) => <Text strong style={{ color: 'var(--color-primary-action)' }}>{text}</Text>
        },
        {
            title: 'Industry',
            dataIndex: 'industry',
            key: 'industry',
            render: (industry) => <Tag bordered={false}>{industry}</Tag>
        },
        {
            title: 'Projects',
            dataIndex: 'project_count',
            key: 'project_count',
            sorter: (a, b) => a.project_count - b.project_count
        },
        {
            title: 'Revenue',
            dataIndex: 'revenue',
            key: 'revenue',
            sorter: (a, b) => a.revenue - b.revenue,
            render: (val) => formatINRCompact(val)
        },
        {
            title: 'Cost',
            dataIndex: 'cost',
            key: 'cost',
            sorter: (a, b) => a.cost - b.cost,
            render: (val) => formatINRCompact(val)
        },
        {
            title: 'Margin %',
            dataIndex: 'margin_percent',
            key: 'margin_percent',
            sorter: (a, b) => a.margin_percent - b.margin_percent,
            render: (val) => (
                <Tag color={val >= 30 ? 'success' : val >= 10 ? 'warning' : 'error'} bordered={false}>
                    {val}%
                </Tag>
            )
        }
    ];

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{ background: 'rgba(11, 20, 48, 0.95)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)', padding: '12px', borderRadius: '10px', boxShadow: 'var(--shadow-dropdown)' }}>
                    <p style={{ margin: '0 0 8px 0', fontWeight: 600, color: '#FFFFFF' }}>{label}</p>
                    {payload.map(p => (
                        <p key={p.dataKey} style={{ margin: 0, color: p.color, fontWeight: 500, fontSize: 13 }}>
                            {p.name}: {formatINRCompact(p.value)}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="animate-fade-in-up">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
                <div>
                    <Title level={2} className="page-title" style={{ color: 'var(--color-text-primary)' }}>
                        Client Portfolio
                    </Title>
                    <Text className="text-caption" style={{ fontSize: 14 }}>
                        Evaluating key accounts by revenue contribution and gross margin.
                    </Text>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                    <DatePicker
                        picker="month"
                        value={selectedMonth}
                        onChange={(d) => d && setSelectedMonth(d)}
                        style={{ width: 160 }}
                    />
                </div>
            </div>

            <Row gutter={[24, 24]}>
                <Col span={24}>
                    <ChartCard title="Top Clients by Revenue" subtitle="Current monthly revenue per account">
                        {isLoading ? <Spin style={{ display: 'block', margin: '50px auto' }} /> : (
                            <div style={{ height: 400 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={clients.slice(0, 10).sort((a, b) => b.revenue - a.revenue)}
                                        layout="vertical"
                                        margin={{ top: 20, right: 60, left: 20, bottom: 20 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--color-card-border)" />
                                        <XAxis
                                            type="number"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }}
                                            tickFormatter={(val) => `₹${(val / 100000).toFixed(0)}L`}
                                        />
                                        <YAxis
                                            dataKey="name"
                                            type="category"
                                            axisLine={false}
                                            tickLine={false}
                                            width={150}
                                            tick={{ fill: 'var(--color-text-primary)', fontSize: 12, fontWeight: 500 }}
                                            tickFormatter={(value) => value.length > 20 ? `${value.substring(0, 18)}...` : value}
                                        />
                                        <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'var(--color-card-bg-hover)', opacity: 0.4 }} />
                                        <Bar dataKey="revenue" name="Revenue" fill="var(--color-primary-action)" radius={[0, 4, 4, 0]} barSize={25} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </ChartCard>
                </Col>

                <Col span={24}>
                    <Card title="Client Performance Ledger" bordered={false}>
                        <Table dataSource={clients} columns={columns} rowKey="id" loading={isLoading} pagination={{ pageSize: 10 }} />
                    </Card>
                </Col>
            </Row>
        </div>
    );
}
