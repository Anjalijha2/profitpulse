import React from 'react';
import { Card, Typography, Spin, Row, Col, Table, DatePicker, Tag, Progress } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../../api/axiosInstance';
import ChartCard from '../../components/common/ChartCard';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { formatINRCompact } from '../../utils/formatters';
import { useUiStore } from '../../store/uiStore';

const { Title, Text } = Typography;

export default function DepartmentDashboard() {
    const { selectedMonth, setSelectedMonth } = useUiStore();
    const monthStr = selectedMonth.format('YYYY-MM');

    const { data: qData, isLoading } = useQuery({
        queryKey: ['departmentDashboard', monthStr],
        queryFn: async () => {
            const res = await axiosInstance.get(`/dashboard/department?month=${monthStr}`);
            return res.data;
        }
    });

    const departments = qData?.departments || qData?.data?.departments || [];

    const columns = [
        { title: 'Department', dataIndex: 'name', key: 'name', render: (text) => <Text strong>{text}</Text> },
        { title: 'HC', dataIndex: 'employee_count', key: 'employee_count' },
        {
            title: 'Utilization',
            dataIndex: 'utilization_percent',
            key: 'utilization_percent',
            render: (val) => (
                <div style={{ width: 120 }}>
                    <Progress percent={val} size="small" strokeColor={val > 80 ? 'var(--color-profit)' : val > 60 ? 'var(--color-primary-action)' : 'var(--color-loss)'} />
                </div>
            )
        },
        { title: 'Revenue', dataIndex: 'revenue', key: 'revenue', render: (val) => formatINRCompact(val) },
        { title: 'Cost', dataIndex: 'cost', key: 'cost', render: (val) => formatINRCompact(val) },
        {
            title: 'Margin %',
            dataIndex: 'margin_percent',
            key: 'margin_percent',
            render: (val) => (
                <Tag color={val >= 25 ? 'success' : val >= 0 ? 'warning' : 'error'} bordered={false}>
                    {val}%
                </Tag>
            )
        }
    ];

    return (
        <div className="animate-fade-in-up">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
                <div>
                    <Title level={2} className="page-title" style={{ color: 'var(--color-text-primary)' }}>
                        Department Intelligence
                    </Title>
                    <Text className="text-caption" style={{ fontSize: 14 }}>
                        Analyzing P&L and workforce utilization at the departmental level.
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
                    <ChartCard title="Department P&L Comparison" subtitle="Revenue vs Cost by Department">
                        {isLoading ? <Spin style={{ display: 'block', margin: '50px auto' }} /> : (
                            <div style={{ height: 400 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={departments} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-card-border)" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} tickFormatter={(val) => `₹${(val / 100000).toFixed(1)}L`} />
                                        <RechartsTooltip
                                            formatter={(val) => formatINRCompact(val)}
                                            contentStyle={{ background: 'rgba(11, 20, 48, 0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', boxShadow: 'var(--shadow-dropdown)', backdropFilter: 'blur(8px)' }}
                                            itemStyle={{ color: '#fff', fontWeight: 500 }}
                                            labelStyle={{ color: '#fff', fontWeight: 600, marginBottom: 8 }}
                                        />
                                        <Legend verticalAlign="top" align="right" iconType="circle" />
                                        <Bar dataKey="revenue" name="Revenue" fill="var(--color-primary-action)" radius={[4, 4, 0, 0]} barSize={35} />
                                        <Bar dataKey="cost" name="Cost" fill="var(--color-loss)" radius={[4, 4, 0, 0]} barSize={35} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </ChartCard>
                </Col>

                <Col span={24}>
                    <Card title="Department Statistics" bordered={false}>
                        <Table dataSource={departments} columns={columns} rowKey="id" pagination={false} loading={isLoading} />
                    </Card>
                </Col>
            </Row>
        </div>
    );
}
