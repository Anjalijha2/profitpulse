import React from 'react';
import { Card, Typography, Spin, Row, Col, Table } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../../api/axiosInstance';
import ChartCard from '../../components/common/ChartCard';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { formatINRCompact } from '../../utils/formatters';

export default function ClientDashboard() {
    const { data: qData, isLoading } = useQuery({
        queryKey: ['clientDashboard'],
        queryFn: async () => {
            const res = await axiosInstance.get('/dashboard/client');
            return res.data;
        }
    });

    if (isLoading) return <Spin style={{ display: 'block', margin: '100px auto' }} />;
    const data = qData?.clients || qData?.data?.clients || [];

    const columns = [
        { title: 'Client', dataIndex: 'name', key: 'name' },
        { title: 'Industry', dataIndex: 'industry', key: 'industry' },
        { title: 'Projects', dataIndex: 'project_count', key: 'project_count' },
        { title: 'Revenue', dataIndex: 'revenue', key: 'revenue', render: (val) => formatINRCompact(val) },
        { title: 'Cost', dataIndex: 'cost', key: 'cost', render: (val) => formatINRCompact(val) },
        { title: 'Profit', dataIndex: 'profit', key: 'profit', render: (val) => formatINRCompact(val) },
        { title: 'Margin %', dataIndex: 'margin_percent', key: 'margin_percent', render: (val) => `${val}%` }
    ];

    return (
        <div className="fade-in">
            <Typography.Title level={2} className="page-title">Client Dashboard</Typography.Title>
            <Row gutter={[24, 24]}>
                <Col span={24}>
                    <ChartCard title="Client Revenue" subtitle="Top Clients">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={data}>
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="revenue" fill="var(--color-primary)" name="Revenue" />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </Col>
                <Col span={24}>
                    <Card title="Client Details">
                        <Table dataSource={data} columns={columns} rowKey="id" pagination={false} />
                    </Card>
                </Col>
            </Row>
        </div>
    );
}
