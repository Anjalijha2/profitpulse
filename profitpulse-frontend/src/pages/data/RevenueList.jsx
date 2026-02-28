import React, { useState } from 'react';
import { Typography, Table, Input, Button, Row, Col, Card, Tag, Space, Select, DatePicker } from 'antd';
import { Search, IndianRupee, FileText, TrendingUp, Calendar, Building2, Briefcase } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../../api/axiosInstance';
import { formatCurrency, formatINRCompact, formatMonth, formatDate } from '../../utils/formatters';
import dayjs from 'dayjs';
import { tablePagination } from '../../utils/pagination';

const { Title, Text } = Typography;

export default function RevenueList() {
    const [searchText, setSearchText] = useState('');
    const [typeFilter, setTypeFilter] = useState(null);
    const [monthFilter, setMonthFilter] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);

    const { data: qData, isLoading } = useQuery({
        queryKey: ['revenueList'],
        queryFn: async () => {
            const res = await axiosInstance.get('/revenue');
            return res.data || res;
        }
    });

    const data = Array.isArray(qData) ? qData : (qData?.revenues || qData?.data || qData?.items || []);

    // Derived stats
    const stats = {
        totalRevenue: data.reduce((sum, item) => sum + (item.invoice_amount || 0), 0),
        invoiceCount: data.length,
        avgInvoice: data.length > 0 ? data.reduce((sum, item) => sum + (item.invoice_amount || 0), 0) / data.length : 0
    };

    const filtered = data.filter(r => {
        const matchesSearch = r.project?.name?.toLowerCase().includes(searchText.toLowerCase()) ||
            r.client?.name?.toLowerCase().includes(searchText.toLowerCase());
        const matchesType = typeFilter ? r.project?.project_type === typeFilter : true;
        const matchesMonth = monthFilter ? r.month === monthFilter : true;
        return matchesSearch && matchesType && matchesMonth;
    });

    const columns = [
        {
            title: 'PERIOD',
            dataIndex: 'month',
            key: 'month',
            render: (text) => <Tag color="blue" bordered={false} style={{ fontWeight: 600 }}>{text}</Tag>
        },
        {
            title: 'PROJECT & CLIENT',
            key: 'project_info',
            render: (_, record) => (
                <Space direction="vertical" size={0}>
                    <Text strong style={{ color: 'var(--color-primary-action)' }}>{record.project?.name}</Text>
                    <Text type="secondary" style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Building2 size={10} /> {record.client?.name}
                    </Text>
                </Space>
            )
        },
        {
            title: 'MODEL',
            dataIndex: ['project', 'project_type'],
            key: 'project_type',
            render: (type) => {
                const config = {
                    tm: { color: 'cyan', label: 'T&M' },
                    fixed_cost: { color: 'purple', label: 'FIXED' },
                    amc: { color: 'orange', label: 'AMC' }
                };
                const c = config[type] || { color: 'default', label: type?.toUpperCase() };
                return <Tag color={c.color} bordered={false} style={{ fontSize: 10 }}>{c.label}</Tag>;
            }
        },
        {
            title: 'INVOICE VALUE',
            dataIndex: 'invoice_amount',
            key: 'invoice_amount',
            sorter: (a, b) => a.invoice_amount - b.invoice_amount,
            render: (val) => <Text strong>{formatCurrency(val)}</Text>
        },
        {
            title: 'BILLING DATE',
            dataIndex: 'invoice_date',
            key: 'invoice_date',
            render: (date) => <Text type="secondary" style={{ fontSize: 13 }}>{formatDate(date)}</Text>
        },
        {
            title: 'STATUS',
            key: 'status',
            render: () => <Tag color="success" bordered={false}>RECOGNIZED</Tag>
        }
    ];

    return (
        <div className="animate-fade-in-up">
            <div style={{ marginBottom: 32 }}>
                <Title level={2} className="page-title" style={{ margin: 0 }}>Revenue Ledger</Title>
                <Text className="text-caption">Historical records of recognized revenue across all engagements.</Text>
            </div>

            <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={8}>
                    <Card bordered={false} bodyStyle={{ padding: '20px 24px' }} style={{ borderRadius: 16, boxShadow: 'var(--shadow-card-default)' }}>
                        <Text type="secondary" size="small">Lifetime Realized</Text>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
                            <Title level={3} style={{ margin: 0 }}>{formatINRCompact(stats.totalRevenue)}</Title>
                            <Tag color="success" bordered={false} style={{ margin: 0 }}><IndianRupee size={12} /> Total</Tag>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card bordered={false} bodyStyle={{ padding: '20px 24px' }} style={{ borderRadius: 16, boxShadow: 'var(--shadow-card-default)' }}>
                        <Text type="secondary" size="small">Invoice Volume</Text>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
                            <Title level={3} style={{ margin: 0 }}>{stats.invoiceCount}</Title>
                            <Tag color="blue" bordered={false} style={{ margin: 0 }}><FileText size={12} /> Documents</Tag>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card bordered={false} bodyStyle={{ padding: '20px 24px' }} style={{ borderRadius: 16, boxShadow: 'var(--shadow-card-default)' }}>
                        <Text type="secondary" size="small">Average Ticket</Text>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
                            <Title level={3} style={{ margin: 0 }}>{formatINRCompact(stats.avgInvoice)}</Title>
                            <Tag color="purple" bordered={false} style={{ margin: 0 }}><TrendingUp size={12} /> Per Invoice</Tag>
                        </div>
                    </Card>
                </Col>
            </Row>

            <div style={{ background: 'var(--color-card-bg)', borderRadius: 16, border: '1px solid var(--color-card-border)', overflow: 'hidden', boxShadow: 'var(--shadow-card-default)' }}>
                <div style={{ display: 'flex', gap: 16, padding: '24px 24px 8px 24px', flexWrap: 'wrap' }}>
                    <Input
                        placeholder="Search project or client..."
                        prefix={<Search size={16} style={{ color: 'var(--color-text-muted)' }} />}
                        style={{ maxWidth: 300, borderRadius: 8 }}
                        onChange={(e) => { setSearchText(e.target.value); setCurrentPage(1); }}
                    />
                    <Select
                        placeholder="Billing Model"
                        style={{ width: 160 }}
                        allowClear
                        onChange={(val) => { setTypeFilter(val); setCurrentPage(1); }}
                    >
                        <Select.Option value="tm">Time & Material</Select.Option>
                        <Select.Option value="fixed_cost">Fixed Cost</Select.Option>
                        <Select.Option value="amc">AMC</Select.Option>
                    </Select>
                    <DatePicker
                        picker="month"
                        placeholder="Filter Month"
                        onChange={(date) => { setMonthFilter(date ? date.format('YYYY-MM') : null); setCurrentPage(1); }}
                    />
                </div>

                <Table
                    columns={columns}
                    dataSource={filtered}
                    rowKey="id"
                    loading={isLoading}
                    pagination={tablePagination(filtered.length, currentPage, pageSize, (page, size) => { setCurrentPage(page); setPageSize(size); })}
                    scroll={{ x: 1000 }}
                    style={{ padding: '0 12px' }}
                />
            </div>
        </div>
    );
}
