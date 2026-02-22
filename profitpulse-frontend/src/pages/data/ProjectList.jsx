import { useState } from 'react';
import { Typography, Table, Input, Select, Button, Drawer, Tag, Row, Col, Card, Space, Form, DatePicker as AntDatePicker, message, InputNumber } from 'antd';
import { Search, Plus, Download, Eye, Briefcase, CheckCircle2, AlertCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '../../api/axiosInstance';
import { formatINRCompact } from '../../utils/formatters';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

export default function ProjectList() {
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState(null);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 15 });
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [form] = Form.useForm();
    const [isDrawerVisible, setIsDrawerVisible] = useState(false);
    const [selectedType, setSelectedType] = useState('tm');

    const { data: response, isLoading } = useQuery({
        queryKey: ['projects', pagination.current, pagination.pageSize, searchText, statusFilter],
        queryFn: async () => {
            const params = {
                page: pagination.current,
                limit: pagination.pageSize,
                search: searchText || undefined,
                status: statusFilter || undefined
            };
            const res = await axiosInstance.get('/projects', { params });
            return res; // AxiosInstance response interceptor returns response.data
        },
        keepPreviousData: true
    });

    // Fetch Clients for dropdown
    const { data: clientsResponse } = useQuery({
        queryKey: ['clients-lookup'],
        queryFn: async () => {
            const res = await axiosInstance.get('/clients');
            return res.data || [];
        }
    });

    // Fetch Delivery Managers for dropdown
    const { data: dmsResponse } = useQuery({
        queryKey: ['dms-lookup'],
        queryFn: async () => {
            const res = await axiosInstance.get('/users?role=delivery_manager');
            return res.data?.items || res.data || [];
        }
    });

    const createMutation = useMutation({
        mutationFn: (newProject) => axiosInstance.post('/projects', newProject),
        onSuccess: () => {
            message.success('Project created successfully');
            queryClient.invalidateQueries(['projects']);
            setIsDrawerVisible(false);
            form.resetFields();
        },
        onError: (err) => {
            message.error(err.response?.data?.message || 'Failed to create project');
        }
    });

    const onFinish = (values) => {
        // Format dates for backend
        const payload = {
            ...values,
            start_date: values.start_date ? values.start_date.format('YYYY-MM-DD') : undefined,
            end_date: values.end_date ? values.end_date.format('YYYY-MM-DD') : undefined,
        };
        createMutation.mutate(payload);
    };

    const projects = response?.data || [];
    const totalCount = response?.meta?.total || 0;

    const stats = {
        total: totalCount,
        active: projects.filter(p => p.status === 'active').length, // This will only be for the current page, refine if needed
        completed: projects.filter(p => p.status === 'completed').length
    };

    const handleTableChange = (newPagination) => {
        setPagination(newPagination);
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
        setTimeout(() => {
            document.body.removeChild(link);
        }, 100);
    };

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
                    <Card bordered={false} bodyStyle={{ padding: '16px 24px' }} style={{ borderRadius: 12, boxShadow: 'var(--shadow-card-default)', background: 'var(--color-card-bg)' }}>
                        <Text type="secondary" size="small">Total Projects</Text>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
                            <Title level={3} style={{ margin: 0 }}>{stats.total}</Title>
                            <Tag color="default" bordered={false} style={{ margin: 0 }}><Briefcase size={12} /> Live Assets</Tag>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card bordered={false} bodyStyle={{ padding: '16px 24px' }} style={{ borderRadius: 12, boxShadow: 'var(--shadow-card-default)', background: 'var(--color-card-bg)' }}>
                        <Text type="secondary" size="small">Active Engagements</Text>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
                            <Title level={3} style={{ margin: 0, color: 'var(--color-profit)' }}>{stats.active}</Title>
                            <Tag color="success" bordered={false} style={{ margin: 0 }}>In Delivery</Tag>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card bordered={false} bodyStyle={{ padding: '16px 24px' }} style={{ borderRadius: 12, boxShadow: 'var(--shadow-card-default)', background: 'var(--color-card-bg)' }}>
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
                        onChange={(e) => {
                            setSearchText(e.target.value);
                            setPagination(prev => ({ ...prev, current: 1 }));
                        }}
                    />
                    <Select
                        placeholder="Filter by status"
                        style={{ width: 160 }}
                        allowClear
                        onChange={(val) => {
                            setStatusFilter(val);
                            setPagination(prev => ({ ...prev, current: 1 }));
                        }}
                    >
                        <Select.Option value="active">Active</Select.Option>
                        <Select.Option value="completed">Completed</Select.Option>
                        <Select.Option value="on_hold">On Hold</Select.Option>
                    </Select>
                </div>

                <Table
                    columns={columns}
                    dataSource={projects}
                    rowKey="id"
                    loading={isLoading}
                    pagination={{
                        ...pagination,
                        total: totalCount,
                        showSizeChanger: true,
                        pageSizeOptions: ['10', '15', '20', '50']
                    }}
                    onChange={handleTableChange}
                    scroll={{ x: 1000 }}
                    style={{ padding: '0 12px' }}
                />
            </div>

            <Drawer
                title="Register New Engagement"
                placement="right"
                onClose={() => {
                    setIsDrawerVisible(false);
                    form.resetFields();
                }}
                open={isDrawerVisible}
                width={560}
                className="glass-drawer"
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    initialValues={{ project_type: 'tm', status: 'active' }}
                    requiredMark="optional"
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="project_code"
                                label="Project ID / Code"
                                rules={[{ required: true, message: 'Code is required' }]}
                            >
                                <Input placeholder="e.g. PRJ012" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="name"
                                label="Project Name"
                                rules={[{ required: true, message: 'Name is required' }]}
                            >
                                <Input placeholder="e.g. Enterprise Cloud Migration" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="client_id"
                                label="Client"
                                rules={[{ required: true, message: 'Client is required' }]}
                            >
                                <Select placeholder="Select client" showSearch optionFilterProp="children">
                                    {clientsResponse?.map(c => (
                                        <Select.Option key={c.id} value={c.id}>{c.name}</Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="project_type"
                                label="Project Type"
                                rules={[{ required: true }]}
                            >
                                <Select onChange={(v) => setSelectedType(v)}>
                                    <Select.Option value="tm">Time & Material</Select.Option>
                                    <Select.Option value="fixed_cost">Fixed Cost</Select.Option>
                                    <Select.Option value="amc">AMC</Select.Option>
                                    <Select.Option value="infrastructure">Infrastructure</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="vertical" label="Vertical">
                                <Select placeholder="e.g. AI / Healthcare">
                                    <Select.Option value="AI">AI</Select.Option>
                                    <Select.Option value="Healthcare">Healthcare</Select.Option>
                                    <Select.Option value="Enterprise">Enterprise</Select.Option>
                                    <Select.Option value="BFSI">BFSI</Select.Option>
                                    <Select.Option value="Education">Education</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="delivery_manager_id" label="Delivery Manager">
                                <Select placeholder="Assign manager" showSearch optionFilterProp="children">
                                    {dmsResponse?.map(dm => (
                                        <Select.Option key={dm.id} value={dm.id}>{dm.name}</Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="start_date" label="Start Date">
                                <AntDatePicker style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="end_date" label="Anticipated End Date">
                                <AntDatePicker style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: 16, borderRadius: 8, marginBottom: 24, border: '1px dashed rgba(255,255,255,0.1)' }}>
                        <Title level={5} style={{ fontSize: 14, marginTop: 0 }}>Contractual Details</Title>
                        {selectedType === 'tm' ? (
                            <Form.Item name="billing_rate" label="Hourly Billing Rate (₹)">
                                <InputNumber style={{ width: '100%' }} formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={value => value.replace(/\₹\s?|(,*)/g, '')} />
                            </Form.Item>
                        ) : (
                            <Row gutter={12}>
                                <Col span={12}>
                                    <Form.Item name="contract_value" label="Total Contract Value (₹)">
                                        <InputNumber style={{ width: '100%' }} formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} parser={value => value.replace(/\₹\s?|(,*)/g, '')} />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name="budgeted_hours" label="Budgeted Hours">
                                        <InputNumber style={{ width: '100%' }} />
                                    </Form.Item>
                                </Col>
                            </Row>
                        )}
                        {selectedType === 'infrastructure' && (
                            <Form.Item name="infra_vendor_cost" label="Infra Vendor Cost (₹)">
                                <InputNumber style={{ width: '100%' }} />
                            </Form.Item>
                        )}
                    </div>

                    <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                        <Button onClick={() => setIsDrawerVisible(false)}>Cancel</Button>
                        <Button type="primary" htmlType="submit" loading={createMutation.isLoading}>
                            Register Project
                        </Button>
                    </Space>
                </Form>
            </Drawer>
        </div>
    );
}
