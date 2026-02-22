import React from 'react';
import { Card, Typography, Spin, Row, Col, Table } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../../api/axiosInstance';
import ChartCard from '../../components/common/ChartCard';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { formatINRCompact } from '../../utils/formatters';

export default function DepartmentDashboard() {
    const { data: qData, isLoading } = useQuery({
        queryKey: ['departmentDashboard'],
        queryFn: async () => {
            const res = await axiosInstance.get('/dashboard/department');
            return res.data;
        }
    });

    if (isLoading) return <Spin style={{ display: 'block', margin: '100px auto' }} />;
    const data = qData?.departments || qData?.data?.departments || [];

    const columns = [
        { title: 'Department', dataIndex: 'name', key: 'name' },
        { title: 'Employee Count', dataIndex: 'employee_count', key: 'employee_count' },
        { title: 'Utilization %', dataIndex: 'utilization_percent', key: 'utilization_percent', render: (val) => `${val}%` },
        { title: 'Revenue', dataIndex: 'revenue', key: 'revenue', render: (val) => formatINRCompact(val) },
        { title: 'Cost', dataIndex: 'cost', key: 'cost', render: (val) => formatINRCompact(val) },
        { title: 'Profit', dataIndex: 'profit', key: 'profit', render: (val) => formatINRCompact(val) },
        { title: 'Margin %', dataIndex: 'margin_percent', key: 'margin_percent', render: (val) => `${val}%` }
    ];

    return (
        <div className="fade-in">
            <Typography.Title level={2} className="page-title">Department Dashboard</Typography.Title>
            <Row gutter={[24, 24]}>
                <Col span={24}>
                    <ChartCard title="Department Overview" subtitle="Cost vs Revenue">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={data}>
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="revenue" fill="var(--color-primary)" name="Revenue" />
                                <Bar dataKey="cost" fill="var(--color-danger)" name="Cost" />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </Col>
                <Col span={24}>
                    <Card title="Department Details">
                        <Table dataSource={data} columns={columns} rowKey="department" pagination={false} />
                    </Card>
                </Col>
            </Row>
        </div>
    );
}
