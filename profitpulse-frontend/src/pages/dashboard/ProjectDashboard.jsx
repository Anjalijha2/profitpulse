import React, { useState } from 'react';
import { Card, Typography, Spin, Row, Col, Table, DatePicker, Tag } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../../api/axiosInstance';
import ChartCard from '../../components/common/ChartCard';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid, Legend, Cell } from 'recharts';
import { formatINRCompact } from '../../utils/formatters';
import { useUiStore } from '../../store/uiStore';
import { Briefcase, Target, Layers } from 'lucide-react';
import { tablePagination } from '../../utils/pagination';

const { Title, Text } = Typography;

export default function ProjectDashboard() {
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const { selectedMonth, setSelectedMonth } = useUiStore();
    const monthStr = selectedMonth.format('YYYY-MM');

    const { data: qData, isLoading } = useQuery({
        queryKey: ['projectDashboard', monthStr],
        queryFn: async () => {
            const res = await axiosInstance.get(`/dashboard/project?month=${monthStr}`);
            return res.data;
        }
    });

    const projects = qData?.projects || qData?.data?.projects || [];
    const summary = qData?.summary || qData?.data?.summary || {};

    const columns = [
        {
            title: 'Project',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <div>
                    <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{text}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{record.project_code}</div>
                </div>
            )
        },
        { title: 'Client', dataIndex: 'client_name', key: 'client_name' },
        {
            title: 'Type',
            dataIndex: 'project_type',
            key: 'project_type',
            render: (type) => <Tag bordered={false}>{type?.toUpperCase()}</Tag>
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
                <Tag color={val >= 30 ? 'success' : val >= 15 ? 'warning' : 'error'} bordered={false}>
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
                            {p.name}: {p.name === 'Margin %' ? `${p.value}%` : formatINRCompact(p.value)}
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
                        Project Profitability
                    </Title>
                    <Text className="text-caption" style={{ fontSize: 14 }}>
                        Detailed analysis of project-wise revenue leakage and margin performance.
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
                    <ChartCard title="Project Margin Analysis" subtitle="Net Margin % per Project">
                        {isLoading ? <Spin style={{ display: 'block', margin: '50px auto' }} /> : (
                            <div style={{ height: 400 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={projects.slice(0, 15)} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-card-border)" />
                                        <XAxis
                                            dataKey="name"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
                                            angle={-35}
                                            textAnchor="end"
                                            interval={0}
                                            tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 13)}...` : value}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }}
                                            tickFormatter={(val) => `${val}%`}
                                        />
                                        <RechartsTooltip content={<CustomTooltip />} />
                                        <Bar dataKey="margin_percent" name="Margin %" radius={[4, 4, 0, 0]} barSize={30}>
                                            {projects.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.margin_percent >= 30 ? 'var(--color-profit)' : entry.margin_percent >= 0 ? 'var(--color-primary-action)' : 'var(--color-loss)'} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </ChartCard>
                </Col>

                <Col span={24}>
                    <Card title="Project Performance Ledger" bordered={false}>
                        <Table
                            dataSource={projects}
                            columns={columns}
                            rowKey="id"
                            loading={isLoading}
                            pagination={tablePagination(projects.length, currentPage, pageSize, (page, size) => { setCurrentPage(page); setPageSize(size); })}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
}
