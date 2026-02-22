import React from 'react';
import { Card, Typography, Spin, Row, Col, Table } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../../api/axiosInstance';
import KPICard from '../../components/common/KPICard';
import ChartCard from '../../components/common/ChartCard';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function EmployeeDashboard() {
    const { data: qData, isLoading } = useQuery({
        queryKey: ['employeeDashboard'],
        queryFn: async () => {
            const res = await axiosInstance.get('/dashboard/employee');
            return res.data;
        }
    });

    if (isLoading) return <Spin style={{ display: 'block', margin: '100px auto' }} />;
    const data = qData?.employees || qData?.data?.employees || [];

    const columns = [
        { title: 'Employee', dataIndex: 'name', key: 'name' },
        { title: 'Department', dataIndex: 'department', key: 'department' },
        { title: 'Billable %', dataIndex: 'billable_percent', key: 'billable_percent' },
        { title: 'Revenue', dataIndex: 'revenue_contribution', key: 'revenue_contribution' },
        { title: 'Cost', dataIndex: 'cost', key: 'cost' },
        { title: 'Profit', dataIndex: 'profit', key: 'profit' },
        { title: 'Margin %', dataIndex: 'margin_percent', key: 'margin_percent' },
    ];

    return (
        <div className="fade-in">
            <Typography.Title level={2} className="page-title">Employee Dashboard</Typography.Title>
            <Row gutter={[24, 24]}>
                <Col span={24}>
                    <ChartCard title="Employee Profitability" subtitle="Cost vs Revenue by Employee">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={data}>
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="revenue_contribution" fill="var(--color-primary)" name="Revenue" />
                                <Bar dataKey="cost" fill="var(--color-danger)" name="Cost" />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </Col>
                <Col span={24}>
                    <Card title="Employee Details">
                        <Table dataSource={data} columns={columns} rowKey="id" pagination={false} />
                    </Card>
                </Col>
            </Row>
        </div>
    );
}
