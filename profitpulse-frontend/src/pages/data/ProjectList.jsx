import { useState } from 'react';
import { Typography, Table, Input, Select, Button, Drawer, Tag, Row, Col, Card, Space, Form, DatePicker as AntDatePicker, message, InputNumber, Popconfirm, Tooltip } from 'antd';
import { Search, Plus, Download, Eye, Briefcase, CheckCircle2, AlertCircle, Pencil, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '../../api/axiosInstance';
import { formatINRCompact } from '../../utils/formatters';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { tablePagination } from '../../utils/pagination';

const { Title, Text } = Typography;

export default function ProjectList() {
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [form] = Form.useForm();
    const [isDrawerVisible, setIsDrawerVisible] = useState(false);
    const [selectedType, setSelectedType] = useState('tm');
    const [editingProject, setEditingProject] = useState(null); // null = create, object = edit
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const { data: response, isLoading } = useQuery({
        queryKey: ['projects', currentPage, pageSize, searchText, statusFilter],
        queryFn: async () => {
            const params = {
                page: currentPage,
                limit: pageSize,
                search: searchText || undefined,
                status: statusFilter || undefined
            };
            const res = await axiosInstance.get('/projects', { params });
            // The backend returns { data: rows, meta: { total } }
            // Interceptor returns the full body
            return res;
        },
        placeholderData: (prev) => prev
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
            message.success(editingProject ? 'Project updated successfully' : 'Project created successfully');
            queryClient.invalidateQueries(['projects']);
            setIsDrawerVisible(false);
            setEditingProject(null);
            form.resetFields();
        },
        onError: (err) => {
            message.error(err.response?.data?.message || err?.message || 'Failed to process project');
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, payload }) => axiosInstance.put(`/projects/${id}`, payload),
        onSuccess: () => {
            message.success('Project updated successfully');
            queryClient.invalidateQueries(['projects']);
            setIsDrawerVisible(false);
            setEditingProject(null);
            form.resetFields();
        },
        onError: (err) => {
            message.error(err.response?.data?.message || err?.message || 'Failed to update project');
        }
    });

    const onFinish = (values) => {
        setIsSubmitting(true);
        const payload = {
            ...values,
            start_date: values.start_date ? values.start_date.format('YYYY-MM-DD') : undefined,
            end_date: values.end_date ? values.end_date.format('YYYY-MM-DD') : undefined,
        };
        
        if (editingProject) {
            updateMutation.mutate({ id: editingProject.id, payload }, {
                onSettled: () => setIsSubmitting(false)
            });
        } else {
            createMutation.mutate(payload, {
                onSettled: () => setIsSubmitting(false)
            });
        }
    };

    const projects = response?.data || [];
    const totalCount = response?.meta?.total || 0;

    const stats = {
        total: response?.meta?.globalTotal ?? 0,
        active: response?.meta?.activeCount ?? 0,
        completed: response?.meta?.completedCount ?? 0,
        cancelled: response?.meta?.cancelledCount ?? 0
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
                    on_hold: { color: 'warning', icon: <AlertCircle size={12} style={{ marginRight: 4 }} /> },
                    cancelled: { color: 'error', icon: <AlertCircle size={12} style={{ marginRight: 4 }} /> }
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
            width: 180,
            render: (_, record) => (
                <Space size={12}>
                    <Tooltip title="View Details">
                        <Button
                            type="text"
                            icon={<Eye size={16} />}
                            style={{ color: 'var(--color-primary-action)', padding: 0 }}
                            onClick={() => navigate(`/projects/${record.id}`)}
                        />
                    </Tooltip>
                    <Tooltip title="Edit Project">
                        <Button
                            type="text"
                            icon={<Pencil size={16} />}
                            style={{ color: 'var(--color-primary-action)', padding: 0 }}
                            onClick={() => {
                                setEditingProject(record);
                                setSelectedType(record.project_type);
                                form.setFieldsValue({
                                    ...record,
                                    start_date: record.start_date ? dayjs(record.start_date) : null,
                                    end_date: record.end_date ? dayjs(record.end_date) : null,
                                });
                                setIsDrawerVisible(true);
                            }}
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Delete Project"
                        description="Are you sure you want to delete this project? This action can be undone later (soft delete)."
                        onConfirm={() => handleDelete(record.id)}
                        okText="Yes"
                        cancelText="No"
                        okButtonProps={{ danger: true, loading: deletingId === record.id }}
                    >
                        <Tooltip title="Delete Project">
                            <Button
                                type="text"
                                danger
                                icon={<Trash2 size={16} />}
                                style={{ padding: 0 }}
                            />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            )
        },
    ];

    const handleDelete = async (id) => {
        setDeletingId(id);
        try {
            await axiosInstance.delete(`/projects/${id}`);
            message.success('Project deleted successfully');
            queryClient.invalidateQueries(['projects']);
        } catch (error) {
            message.error(error.response?.data?.message || 'Failed to delete project');
        } finally {
            setDeletingId(null);
        }
    };

    const handleExport = async () => {
        try {
            message.loading({ content: 'Preparing export...', key: 'exporting' });
            // Fetch all matching records without pagination for export
            const params = {
                search: searchText || undefined,
                status: statusFilter || undefined,
                limit: 2000 // Just fetch everything for CSV
            };
            const res = await axiosInstance.get('/projects', { params });
            const allProjects = res?.data || [];
            
            if (allProjects.length === 0) {
                message.warning({ content: 'No projects to export', key: 'exporting' });
                return;
            }

            const header = ['Project Code', 'Name', 'Type', 'Status', 'Client', 'Contract Value', 'Start Date', 'End Date'];
            const rows = allProjects.map(p => [
                p.project_code || '',
                p.name || '',
                p.project_type || '',
                p.status || '',
                p.client?.name || 'Internal',
                p.contract_value || '',
                p.start_date || '',
                p.end_date || ''
            ]);

            const csvContent = [header, ...rows]
                .map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))
                .join("\n");

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement("a");
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", `projects_export_${dayjs().format('YYYYMMDD')}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            message.success({ content: 'Export successful!', key: 'exporting' });
        } catch (error) {
            message.error({ content: 'Export failed!', key: 'exporting' });
        }
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
                    <Button type="primary" icon={<Plus size={16} />} onClick={() => {
                        setEditingProject(null);
                        form.resetFields();
                        setIsDrawerVisible(true);
                    }}>Create Project</Button>
                </Space>
            </div>

            <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={6}>
                    <Card bordered={false} bodyStyle={{ padding: '16px 24px' }} style={{ borderRadius: 12, boxShadow: 'var(--shadow-card-default)', background: 'var(--color-card-bg)' }}>
                        <Text type="secondary" size="small">Total Projects</Text>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
                            <Title level={3} style={{ margin: 0 }}>{stats.total}</Title>
                            <Tag color="default" bordered={false} style={{ margin: 0 }}><Briefcase size={12} /> Live Assets</Tag>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={6}>
                    <Card bordered={false} bodyStyle={{ padding: '16px 24px' }} style={{ borderRadius: 12, boxShadow: 'var(--shadow-card-default)', background: 'var(--color-card-bg)' }}>
                        <Text type="secondary" size="small">Active</Text>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
                            <Title level={3} style={{ margin: 0, color: 'var(--color-profit)' }}>{stats.active}</Title>
                            <Tag color="success" bordered={false} style={{ margin: 0 }}>In Delivery</Tag>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={6}>
                    <Card bordered={false} bodyStyle={{ padding: '16px 24px' }} style={{ borderRadius: 12, boxShadow: 'var(--shadow-card-default)', background: 'var(--color-card-bg)' }}>
                        <Text type="secondary" size="small">Completed</Text>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
                            <Title level={3} style={{ margin: 0, color: 'var(--color-primary-action)' }}>{stats.completed}</Title>
                            <Tag color="blue" bordered={false} style={{ margin: 0 }}>Archived</Tag>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={6}>
                    <Card bordered={false} bodyStyle={{ padding: '16px 24px' }} style={{ borderRadius: 12, boxShadow: 'var(--shadow-card-default)', background: 'var(--color-card-bg)' }}>
                        <Text type="secondary" size="small">Cancelled</Text>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
                            <Title level={3} style={{ margin: 0, color: 'var(--color-loss)' }}>{stats.cancelled}</Title>
                            <Tag color="error" bordered={false} style={{ margin: 0 }}>Discontinued</Tag>
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
                            setCurrentPage(1);
                        }}
                    />
                    <Select
                        placeholder="Filter by status"
                        style={{ width: 160 }}
                        allowClear
                        onChange={(val) => {
                            setStatusFilter(val);
                            setCurrentPage(1);
                        }}
                    >
                        <Select.Option value="active">Active</Select.Option>
                        <Select.Option value="completed">Completed</Select.Option>
                        <Select.Option value="on_hold">On Hold</Select.Option>
                        <Select.Option value="cancelled">Cancelled</Select.Option>
                    </Select>
                </div>

                <Table
                    columns={columns}
                    dataSource={projects}
                    rowKey="id"
                    loading={isLoading}
                    pagination={tablePagination(
                        totalCount,
                        currentPage,
                        pageSize,
                        (page, size) => { setCurrentPage(page); setPageSize(size); }
                    )}
                    scroll={{ x: 1000 }}
                    style={{ padding: '0 12px' }}
                />
            </div>

            <Drawer
                title={editingProject ? `Update Project: ${editingProject.project_code}` : "Register New Engagement"}
                placement="right"
                onClose={() => {
                    setIsDrawerVisible(false);
                    setEditingProject(null);
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

                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item name="status" label="Project Status" rules={[{ required: true }]}>
                                <Select>
                                    <Select.Option value="active">Active</Select.Option>
                                    <Select.Option value="completed">Completed</Select.Option>
                                    <Select.Option value="on_hold">On Hold</Select.Option>
                                    <Select.Option value="cancelled">Cancelled</Select.Option>
                                </Select>
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
                            <Button type="primary" htmlType="submit" loading={isSubmitting}>
                                {editingProject ? 'Save Changes' : 'Register Project'}
                            </Button>
                        </Space>
                </Form>
            </Drawer>
        </div>
    );
}
