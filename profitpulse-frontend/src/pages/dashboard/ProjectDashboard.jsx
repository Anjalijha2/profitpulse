import React from 'react';
import { Card, Typography, Spin, Row, Col, Table } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../../api/axiosInstance';
import KPICard from '../../components/common/KPICard';
import ChartCard from '../../components/common/ChartCard';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { formatINRCompact } from '../../utils/formatters';

export default function ProjectDashboard() {
    const { data: qData, isLoading } = useQuery({
        queryKey: ['projectDashboard'],
        queryFn: async () => {
            const res = await axiosInstance.get('/dashboard/project');
            return res.data;
        }
    });

    if (isLoading) return <Spin style={{ display: 'block', margin: '100px auto' }} />;
    const data = qData?.projects || qData?.data?.projects || [];

    const columns = [
        { title: 'Project', dataIndex: 'name', key: 'name' },
        { title: 'Client', dataIndex: 'client_name', key: 'client_name' },
        { title: 'Type', dataIndex: 'project_type', key: 'project_type' },
        { title: 'Revenue', dataIndex: 'revenue', key: 'revenue', render: (val) => formatINRCompact(val) },
        { title: 'Cost', dataIndex: 'cost', key: 'cost', render: (val) => formatINRCompact(val) },
        { title: 'Profit', dataIndex: 'profit', key: 'profit', render: (val) => formatINRCompact(val) },
        { title: 'Margin %', dataIndex: 'margin_percent', key: 'margin_percent', render: (val) => `${val}%` }
    ];

    return (
        <div className="fade-in">
            <Typography.Title level={2} className="page-title">Project Dashboard</Typography.Title>
            <Row gutter={[24, 24]}>
                <Col span={24}>
                    <ChartCard title="Project Margins" subtitle="Margin Percentages">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={data}>
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="margin_percent" fill="var(--color-primary)" name="Margin %" />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </Col>
                <Col span={24}>
                    <Card title="Project Performance">
                        <Table dataSource={data} columns={columns} rowKey="id" pagination={false} />
                    </Card>
                </Col>
            </Row>
        </div>
    );
}
