import { useState } from 'react';
import { Typography, Table, Input, Select, Button, Drawer, Tag, Row, Col, Card, Space } from 'antd';
import { Search, Plus, Download, Eye, Briefcase, CheckCircle2, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../../api/axiosInstance';
import { formatINRCompact } from '../../utils/formatters';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

export default function ProjectList() {
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState(null);
    const navigate = useNavigate();

    const { data: response, isLoading } = useQuery({
        queryKey: ['projects'],
        queryFn: async () => {
            const res = await axiosInstance.get('/projects');
            return res.data;
        }
    });

    const projects = Array.isArray(response) ? response : (response?.projects || response?.data?.items || response?.items || []);

    const filteredProjects = projects.filter(p => {
        const matchesSearch = p.name?.toLowerCase().includes(searchText.toLowerCase()) ||
            p.project_code?.toLowerCase().includes(searchText.toLowerCase());
        const matchesStatus = statusFilter ? p.status === statusFilter : true;
        return matchesSearch && matchesStatus;
    });

    const stats = {
        total: projects.length,
        active: projects.filter(p => p.status === 'active').length,
        completed: projects.filter(p => p.status === 'completed').length
    };

    const columns = [
        {
            title: 'PROJECT CODE',
            dataIndex: 'project_code',
            key: 'project_code',
            render: (text) => <Text strong style={{ color: 'var(--color-primary-action)' }}>{text}</Text>,
        },
        {
            title: 'NAME',
            dataIndex: 'name',
            key: 'name',
            ellipsis: true,
            render: (text) => <Text style={{ fontWeight: 500 }}>{text}</Text>
        },
        {
            title: 'TYPE',
            dataIndex: 'project_type',
            key: 'project_type',
            render: (type) => {
                const config = {
                    tm: { color: 'blue', label: 'T&M' },
                    fixed_cost: { color: 'purple', label: 'FIXED' },
                    amc: { color: 'orange', label: 'AMC' },
                    infrastructure: { color: 'cyan', label: 'INFRA' }
                };
                const c = config[type] || { color: 'default', label: type?.toUpperCase() };
                return <Tag bordered={false} color={c.color}>{c.label}</Tag>;
            }
        },
        {
            title: 'STATUS',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                const config = {
                    active: { color: 'success', icon: <CheckCircle2 size={12} style={{ marginRight: 4 }} /> },
                    completed: { color: 'blue', icon: <CheckCircle2 size={12} style={{ marginRight: 4 }} /> },
                    on_hold: { color: 'warning', icon: <AlertCircle size={12} style={{ marginRight: 4 }} /> }
                };
                const c = config[status] || { color: 'default', icon: null };
                return (
                    <Tag bordered={false} color={c.color} style={{ display: 'inline-flex', alignItems: 'center' }}>
                        {c.icon} {status?.toUpperCase() || 'UNKNOWN'}
                    </Tag>
                );
            }
        },
        {
            title: 'CONTRACT VALUE',
            dataIndex: 'contract_value',
            key: 'contract_value',
            render: (val, record) => {
                if (record.project_type === 'tm') return <Text type="secondary" italic style={{ fontSize: 12 }}>T&M Billable</Text>;
                return val ? <Text strong>{formatINRCompact(val)}</Text> : <Text type="secondary">-</Text>;
            },
        },
        {
            title: 'TIMELINE',
            key: 'timeline',
            render: (_, record) => (
                <div style={{ fontSize: 12 }}>
                    <Text type="secondary">{record.start_date ? dayjs(record.start_date).format('MMM YYYY') : '-'}</Text>
                    <span style={{ margin: '0 8px', color: '#ccc' }}>→</span>
                    {record.end_date ? (
                        <Text type="secondary">{dayjs(record.end_date).format('MMM YYYY')}</Text>
                    ) : (
                        <Tag color="processing" bordered={false} style={{ fontSize: 10, margin: 0 }}>ONGOING</Tag>
                    )}
                </div>
            ),
        },
        {
            title: 'ACTIONS',
            key: 'action',
            width: 140,
            render: (_, record) => (
                <Button
                    type="link"
                    icon={<Eye size={16} />}
                    style={{ padding: 0, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                    onClick={() => navigate(`/projects/${record.id}`)}
                >
                    View Details
                </Button>
            )
        },
    ];

    const handleExport = () => {
        const csvRows = [['Project Code', 'Name', 'Type', 'Status', 'Contract Value', 'Start Date', 'End Date']];
        filteredProjects.forEach(p => {
            csvRows.push([p.project_code, p.name, p.project_type, p.status, p.contract_value || '', p.start_date || '', p.end_date || '']);
        });
        const csvContent = "data:text/csv;charset=utf-8," + csvRows.map(e => `"${e.join('","')}"`).join("\n");
        const link = document.createElement("a");
        link.setAttribute("href", encodeURI(csvContent));
        link.setAttribute("download", `projects_export_${dayjs().format('YYYYMMDD')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const [isDrawerVisible, setIsDrawerVisible] = useState(false);

    return (
        <div className="animate-fade-in-up">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
                <div>
                    <Title level={2} className="page-title" style={{ margin: 0 }}>Projects</Title>
                    <Text className="text-caption">Manage active customer engagements and internal projects.</Text>
                </div>
                <Space>
                    <Button icon={<Download size={16} />} onClick={handleExport}>Export</Button>
                    <Button type="primary" icon={<Plus size={16} />} onClick={() => setIsDrawerVisible(true)}>Create Project</Button>
                </Space>
            </div>

            <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={8}>
                    <Card bordered={false} bodyStyle={{ padding: '16px 24px' }} style={{ borderRadius: 12, boxShadow: 'var(--shadow-card-default)' }}>
                        <Text type="secondary" size="small">Total Projects</Text>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
                            <Title level={3} style={{ margin: 0 }}>{stats.total}</Title>
                            <Tag color="default" bordered={false} style={{ margin: 0 }}><Briefcase size={12} /> Live Assets</Tag>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card bordered={false} bodyStyle={{ padding: '16px 24px' }} style={{ borderRadius: 12, boxShadow: 'var(--shadow-card-default)' }}>
                        <Text type="secondary" size="small">Active Engagements</Text>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
                            <Title level={3} style={{ margin: 0, color: 'var(--color-profit)' }}>{stats.active}</Title>
                            <Tag color="success" bordered={false} style={{ margin: 0 }}>In Delivery</Tag>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card bordered={false} bodyStyle={{ padding: '16px 24px' }} style={{ borderRadius: 12, boxShadow: 'var(--shadow-card-default)' }}>
                        <Text type="secondary" size="small">Completed</Text>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
                            <Title level={3} style={{ margin: 0, color: 'var(--color-primary-action)' }}>{stats.completed}</Title>
                            <Tag color="blue" bordered={false} style={{ margin: 0 }}>Archived</Tag>
                        </div>
                    </Card>
                </Col>
            </Row>

            <div style={{ background: 'var(--color-card-bg)', borderRadius: 16, border: '1px solid var(--color-card-border)', overflow: 'hidden', boxShadow: 'var(--shadow-card-default)' }}>
                <div style={{ display: 'flex', gap: 16, padding: '24px 24px 8px 24px' }}>
                    <Input
                        placeholder="Search by code or name..."
                        prefix={<Search size={16} style={{ color: 'var(--color-text-muted)' }} />}
                        style={{ maxWidth: 320, borderRadius: 8 }}
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                    <Select
                        placeholder="Filter by status"
                        style={{ width: 160 }}
                        allowClear
                        onChange={setStatusFilter}
                    >
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
                    pagination={{ pageSize: 15, showSizeChanger: true }}
                    scroll={{ x: 1000 }}
                    style={{ padding: '0 12px' }}
                />
            </div>

            <Drawer
                title="Register New Engagement"
                placement="right"
                onClose={() => setIsDrawerVisible(false)}
                open={isDrawerVisible}
                width={440}
            >
                <div style={{ padding: 12 }}>
                    <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>Enter project details to register a new client engagement.</Text>
                    <Space direction="vertical" style={{ width: '100%' }} size="large">
                        <div>
                            <Text strong style={{ display: 'block', marginBottom: 8 }}>Project Name</Text>
                            <Input placeholder="e.g. Digital Transformation 2.0" size="large" />
                        </div>
                        <div>
                            <Text strong style={{ display: 'block', marginBottom: 8 }}>Project Type</Text>
                            <Select placeholder="Select type" style={{ width: '100%' }} size="large">
                                <Select.Option value="tm">Time & Material</Select.Option>
                                <Select.Option value="fixed_cost">Fixed Cost</Select.Option>
                                <Select.Option value="amc">AMC</Select.Option>
                            </Select>
                        </div>
                        <Button type="primary" block size="large" style={{ marginTop: 24 }} onClick={() => setIsDrawerVisible(false)}>
                            Validate & Save Project
                        </Button>
                    </Space>
                </div>
            </Drawer>
        </div>
    );
}
