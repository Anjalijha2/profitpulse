import React, { useState } from 'react';
import { Typography, Table, Input, Button } from 'antd';
import { Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../../api/axiosInstance';
import { formatCurrency } from '../../utils/formatters';

const { Title, Text } = Typography;

export default function RevenueList() {
    const [searchText, setSearchText] = useState('');

    const { data: qData, isLoading } = useQuery({
        queryKey: ['revenueList'],
        queryFn: async () => {
            const res = await axiosInstance.get('/revenue');
            return res.data;
        }
    });

    const data = Array.isArray(qData) ? qData : (qData?.revenues || qData?.data?.revenues || qData?.items || []);
    const filtered = data.filter(r => r.project?.name?.toLowerCase().includes(searchText.toLowerCase()) || r.month?.includes(searchText));

    const columns = [
        { title: 'Month', dataIndex: 'month', key: 'month' },
        { title: 'Project', dataIndex: ['project', 'name'], key: 'project' },
        { title: 'Project Type', dataIndex: ['project', 'project_type'], key: 'project_type' },
        { title: 'Client', dataIndex: ['client', 'name'], key: 'client' },
        { title: 'Invoice Amount', dataIndex: 'invoice_amount', key: 'invoice_amount', render: (val) => formatCurrency(val) },
        { title: 'Invoice Date', dataIndex: 'invoice_date', key: 'invoice_date' }
    ];

    return (
        <div className="fade-in">
            <Title level={2} className="page-title">Revenue Records</Title>
            <div style={{ background: 'var(--color-card-bg)', borderRadius: 'var(--radius-card)', padding: 24 }}>
                <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
                    <Input
                        placeholder="Search by project or month..."
                        prefix={<Search size={16} />}
                        style={{ maxWidth: 320 }}
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                </div>
                <Table
                    columns={columns}
                    dataSource={filtered}
                    rowKey="id"
                    loading={isLoading}
                    pagination={{ pageSize: 15 }}
                />
            </div>
        </div>
    );
}
