import React from 'react';
import { Card, Typography, Spin, Row, Col, Table, DatePicker, Tag } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../../api/axiosInstance';
import ChartCard from '../../components/common/ChartCard';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { formatCurrency, formatINRCompact } from '../../utils/formatters';
import { useUiStore } from '../../store/uiStore';

const { Title, Text } = Typography;

export default function EmployeeDashboard() {
    const { selectedMonth, setSelectedMonth } = useUiStore();
    const monthStr = selectedMonth.format('YYYY-MM');

    const { data: qData, isLoading } = useQuery({
        queryKey: ['employeeDashboard', monthStr],
        queryFn: async () => {
            const res = await axiosInstance.get(`/dashboard/employee?month=${monthStr}`);
            return res.data;
        }
    });

    const employees = qData?.employees || qData?.data?.employees || [];

    // Process data for the chart - take top 10 by profit to keep it clean
    const chartData = [...employees]
        .sort((a, b) => b.profit - a.profit)
        .slice(0, 10)
        .map(emp => ({
            name: emp.name.split(' ')[0], // Use first name for space
            fullName: emp.name,
            revenue: emp.revenue_contribution,
            cost: emp.cost,
            profit: emp.profit
        }));

    const columns = [
        {
            title: 'Employee',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <div>
                    <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{text}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{record.designation}</div>
                </div>
            )
        },
        {
            title: 'Dept',
            dataIndex: 'department',
            key: 'department',
            render: (dept) => <Tag color="blue" bordered={false}>{dept}</Tag>
        },
        {
            title: 'Billable %',
            dataIndex: 'billable_percent',
            key: 'billable_percent',
            sorter: (a, b) => a.billable_percent - b.billable_percent,
            render: (val) => (
                <Text style={{ color: val < 70 ? 'var(--color-loss)' : 'inherit', fontWeight: 500 }}>
                    {val}%
                </Text>
            )
        },
        {
            title: 'Revenue',
            dataIndex: 'revenue_contribution',
            key: 'revenue_contribution',
            render: (val) => formatINRCompact(val)
        },
        {
            title: 'Cost',
            dataIndex: 'cost',
            key: 'cost',
            render: (val) => formatINRCompact(val)
        },
        {
            title: 'Profit',
            dataIndex: 'profit',
            key: 'profit',
            sorter: (a, b) => a.profit - b.profit,
            render: (val) => (
                <Text style={{ color: val >= 0 ? 'var(--color-profit)' : 'var(--color-loss)', fontWeight: 600 }}>
                    {formatINRCompact(val)}
                </Text>
            )
        },
        {
            title: 'Margin %',
            dataIndex: 'margin_percent',
            key: 'margin_percent',
            sorter: (a, b) => a.margin_percent - b.margin_percent,
            render: (val) => (
                <Tag color={val >= 20 ? 'success' : val >= 0 ? 'warning' : 'error'} bordered={false}>
                    {val}%
                </Tag>
            )
        },
    ];

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{ background: '#fff', border: '1px solid var(--color-card-border)', padding: '12px', borderRadius: '8px', boxShadow: 'var(--shadow-dropdown)' }}>
                    <p style={{ margin: '0 0 8px 0', fontWeight: 600, color: 'var(--color-text-primary)' }}>{payload[0].payload.fullName}</p>
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
                        Employee Profitability
                    </Title>
                    <Text className="text-caption" style={{ fontSize: 14 }}>
                        Individual performance tracking and revenue contribution insights.
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
                    <ChartCard title="Top Performers by Profit" subtitle="Comparing top 10 employees by monthly net profit">
                        {isLoading ? <Spin style={{ display: 'block', margin: '50px auto' }} /> : (
                            <div style={{ height: 400 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-card-border)" />
                                        <XAxis
                                            dataKey="name"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }}
                                            dy={10}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }}
                                            tickFormatter={(val) => `₹${(val / 100000).toFixed(1)}L`}
                                        />
                                        <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                                        <Legend verticalAlign="top" align="right" iconType="circle" />
                                        <Bar dataKey="revenue" name="Revenue" fill="var(--color-primary-action, #1677ff)" radius={[4, 4, 0, 0]} barSize={25} />
                                        <Bar dataKey="cost" name="Cost" fill="var(--color-loss, #ff4d4f)" radius={[4, 4, 0, 0]} barSize={25} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </ChartCard>
                </Col>

                <Col span={24}>
                    <Card
                        title="Employee Performance Ledger"
                        bordered={false}
                        bodyStyle={{ padding: 0 }}
                    >
                        <Table
                            dataSource={employees}
                            columns={columns}
                            rowKey="id"
                            loading={isLoading}
                            pagination={{
                                pageSize: 10,
                                showTotal: (total) => `Total ${total} employees`,
                                showSizeChanger: false
                            }}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
}
