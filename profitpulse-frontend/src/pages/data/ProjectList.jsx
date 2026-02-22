import { useState } from 'react';
import { Typography, Table, Input, Select, Button, Drawer, Tag } from 'antd';
import { Search, Plus, Download, MoreHorizontal, Eye } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../../api/axiosInstance';
import { formatINRCompact } from '../../utils/formatters';
import dayjs from 'dayjs';

import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

export default function ProjectList() {
    const [searchText, setSearchText] = useState('');
    const navigate = useNavigate();

    const { data: response, isLoading } = useQuery({
        queryKey: ['projects'],
        queryFn: async () => {
            const res = await axiosInstance.get('/projects');
            return res.data;
        }
    });

    const columns = [
        {
            title: 'PROJECT CODE',
            dataIndex: 'project_code',
            key: 'project_code',
            render: (text) => <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{text}</span>,
        },
        {
            title: 'NAME',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'TYPE',
            dataIndex: 'project_type',
            key: 'project_type',
            render: (type) => (
                <Tag color={type === 'tm' ? 'blue' : type === 'fixed_cost' ? 'purple' : 'cyan'}>
                    {type?.toUpperCase() || 'UNKNOWN'}
                </Tag>
            )
        },
        {
            title: 'STATUS',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                let color = 'default';
                if (status === 'active') color = 'success';
                if (status === 'on_hold') color = 'warning';
                return <Tag color={color}>{status?.toUpperCase() || 'UNKNOWN'}</Tag>;
            }
        },
        {
            title: 'CONTRACT VALUE',
            dataIndex: 'contract_value',
            key: 'contract_value',
            render: (val) => val ? formatINRCompact(val) : '-',
        },
        {
            title: 'TIMELINE',
            key: 'timeline',
            render: (_, record) => (
                <span style={{ color: 'var(--color-text-secondary)', fontSize: 13 }}>
                    {record.start_date ? dayjs(record.start_date).format('MMM D, YYYY') : '-'}
                    {' → '}
                    {record.end_date ? dayjs(record.end_date).format('MMM D, YYYY') : '-'}
                </span>
            ),
        },
        {
            title: 'ACTIONS',
            key: 'action',
            width: 100,
            render: (_, record) => (
                <Button
                    type="text"
                    icon={<Eye size={16} />}
                    onClick={() => navigate(`/projects/${record.id}`)}
                >
                    View Details
                </Button>
            )
        },
    ];

    const projects = Array.isArray(response) ? response : (response?.projects || response?.data?.items || response?.items || []);
    const filteredProjects = projects.filter(p =>
        p.name?.toLowerCase().includes(searchText.toLowerCase()) ||
        p.project_code?.toLowerCase().includes(searchText.toLowerCase())
    );

    const handleExport = () => {
        const csvRows = [
            ['Project Code', 'Name', 'Type', 'Status', 'Contract Value', 'Start Date', 'End Date']
        ];
        filteredProjects.forEach(p => {
            csvRows.push([
                p.project_code,
                p.name,
                p.project_type,
                p.status,
                p.contract_value || '',
                p.start_date || '',
                p.end_date || ''
            ]);
        });
        const csvContent = "data:text/csv;charset=utf-8," + csvRows.map(e => `"${e.join('","')}"`).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "projects_export.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const [isDrawerVisible, setIsDrawerVisible] = useState(false);

    return (
        <div className="animate-fade-in-up">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                <div>
                    <Title level={2} className="page-title" style={{ margin: 0, color: 'var(--color-text-primary)' }}>
                        Projects
                    </Title>
                    <Text className="text-caption" style={{ fontSize: 14 }}>
                        Manage active engagements and historical projects.
                    </Text>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                    <Button icon={<Download size={16} />} onClick={handleExport}>Export</Button>
                    <Button type="primary" icon={<Plus size={16} />} onClick={() => setIsDrawerVisible(true)}>New Project</Button>
                </div>
            </div>

            <div style={{ background: 'var(--color-card-bg)', borderRadius: 'var(--radius-card)', padding: 24, border: '1px solid var(--color-card-border)', boxShadow: 'var(--shadow-card-default)' }}>
                <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
                    <Input
                        placeholder="Search projects..."
                        prefix={<Search size={16} style={{ color: 'var(--color-text-muted)' }} />}
                        style={{ maxWidth: 320 }}
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                    <Select placeholder="Filter by Status" style={{ width: 160 }} allowClear>
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
                    pagination={{ pageSize: 10, showSizeChanger: true }}
                    scroll={{ x: 800 }}
                />
            </div>

            <Drawer
                title="Create New Project"
                placement="right"
                onClose={() => setIsDrawerVisible(false)}
                open={isDrawerVisible}
                width={400}
            >
                <div style={{ padding: 16, textAlign: 'center', color: 'gray' }}>
                    <p>Dummy Project Form</p>
                    <Input placeholder="Project Name" style={{ marginBottom: 16 }} />
                    <Input placeholder="Client Name" style={{ marginBottom: 16 }} />
                    <Button type="primary" block onClick={() => setIsDrawerVisible(false)}>Save (Mock)</Button>
                </div>
            </Drawer>
        </div>
    );
}
