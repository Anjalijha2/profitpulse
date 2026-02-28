import { useState } from 'react';
import { Typography, Table, Button, Input, Tag, Select, Drawer, Form, Modal, message } from 'antd';
import { Plus, Search, Download, MoreHorizontal } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../api/axiosInstance';
import dayjs from 'dayjs';
import { tablePagination } from '../utils/pagination';

const { Title, Text } = Typography;

export default function Projects() {
    const [searchText, setSearchText] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);

    const { data: response, isLoading } = useQuery({
        queryKey: ['projects'],
        queryFn: async () => {
            const res = await axiosInstance.get('/projects');
            return res.data;
        }
    });

    const columns = [
        {
            title: 'Project Code',
            dataIndex: 'project_code',
            key: 'project_code',
            render: (text) => <span style={{ fontWeight: 600, color: '#111827' }}>{text}</span>,
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Type',
            dataIndex: 'project_type',
            key: 'project_type',
            render: (type) => (
                <Tag color={type === 'tm' ? 'blue' : type === 'fixed_cost' ? 'purple' : 'cyan'}>
                    {type?.toUpperCase() || 'UNKNOWN'}
                </Tag>
            )
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={status === 'active' ? 'success' : status === 'completed' ? 'default' : 'warning'}>
                    {status?.toUpperCase() || 'UNKNOWN'}
                </Tag>
            )
        },
        {
            title: 'Contract Value',
            dataIndex: 'contract_value',
            key: 'contract_value',
            render: (val) => val ? `$${val.toLocaleString()}` : '-',
        },
        {
            title: 'Timeline',
            key: 'timeline',
            render: (_, record) => (
                <span style={{ color: '#6b7280', fontSize: 13 }}>
                    {record.start_date ? dayjs(record.start_date).format('MMM D, YYYY') : '-'}
                    {' → '}
                    {record.end_date ? dayjs(record.end_date).format('MMM D, YYYY') : '-'}
                </span>
            ),
        },
        {
            title: '',
            key: 'action',
            width: 60,
            render: () => <Button type="text" icon={<MoreHorizontal size={16} />} />
        },
    ];

    const projects = response || [];
    const filteredProjects = projects.filter(p =>
        p.name?.toLowerCase().includes(searchText.toLowerCase()) ||
        p.project_code?.toLowerCase().includes(searchText.toLowerCase())
    );

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                <div>
                    <Title level={2} style={{ margin: 0, fontWeight: 700, letterSpacing: '-0.02em', color: '#111827' }}>
                        Projects
                    </Title>
                    <Text style={{ color: '#6b7280', fontSize: 16 }}>
                        Manage active engagements and historical projects.
                    </Text>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                    <Button icon={<Download size={16} />}>
                        Export
                    </Button>
                    <Button type="primary" style={{ background: '#111827' }} icon={<Plus size={16} />}>
                        New Project
                    </Button>
                </div>
            </div>

            <div style={{ background: '#fff', borderRadius: 12, padding: 24, border: '1px solid #e5e7eb', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
                <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
                    <Input
                        placeholder="Search projects by name or code..."
                        prefix={<Search size={16} style={{ color: '#9ca3af' }} />}
                        style={{ maxWidth: 320, borderRadius: 8, height: 40 }}
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                    <Select placeholder="Filter by Status" style={{ width: 160, height: 40 }} allowClear>
                        <Select.Option value="active">Active</Select.Option>
                        <Select.Option value="completed">Completed</Select.Option>
                        <Select.Option value="on_hold">On Hold</Select.Option>
                    </Select>
                </div>

                <Table
                    columns={columns}
                    dataSource={filteredProjects}
                    rowKey="id"
                    loading={isLoading}
                    pagination={tablePagination(filteredProjects.length, currentPage, pageSize, (page, size) => { setCurrentPage(page); setPageSize(size); })}
                />
            </div>
        </div>
    );
}
