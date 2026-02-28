import React, { useState } from 'react';
import { Typography, Table, Input, Button, Drawer, Space, Form, message, Popconfirm, Tooltip, Card, Row, Col, Tag, Select } from 'antd';
import { Search, Plus, Pencil, Trash2, Building2, Globe, Users, Briefcase } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '../../api/axiosInstance';
import { tablePagination } from '../../utils/pagination';

const { Title, Text } = Typography;

export default function ClientList() {
    const [searchText, setSearchText] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [isDrawerVisible, setIsDrawerVisible] = useState(false);
    const [editingClient, setEditingClient] = useState(null);
    const [form] = Form.useForm();
    const queryClient = useQueryClient();

    const { data: response, isLoading } = useQuery({
        queryKey: ['clients', currentPage, pageSize, searchText],
        queryFn: async () => {
            const params = {
                page: currentPage,
                limit: pageSize,
                search: searchText || undefined
            };
            const res = await axiosInstance.get('/clients', { params });
            return res;
        },
        placeholderData: (prev) => prev
    });

    const createMutation = useMutation({
        mutationFn: (newClient) => axiosInstance.post('/clients', newClient),
        onSuccess: () => {
            message.success('Client created successfully');
            queryClient.invalidateQueries(['clients']);
            setIsDrawerVisible(false);
            form.resetFields();
        },
        onError: (err) => message.error(err.response?.data?.message || 'Failed to create client')
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, payload }) => axiosInstance.put(`/clients/${id}`, payload),
        onSuccess: () => {
            message.success('Client updated successfully');
            queryClient.invalidateQueries(['clients']);
            setIsDrawerVisible(false);
            setEditingClient(null);
            form.resetFields();
        },
        onError: (err) => message.error(err.response?.data?.message || 'Failed to update client')
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => axiosInstance.delete(`/clients/${id}`),
        onSuccess: () => {
            message.success('Client deleted successfully');
            queryClient.invalidateQueries(['clients']);
        },
        onError: (err) => message.error(err.response?.data?.message || 'Failed to delete client')
    });

    const onFinish = (values) => {
        if (editingClient) {
            updateMutation.mutate({ id: editingClient.id, payload: values });
        } else {
            createMutation.mutate(values);
        }
    };

    const clients = response?.data || [];
    const totalCount = response?.meta?.total || 0;

    const columns = [
        {
            title: 'CLIENT NAME',
            dataIndex: 'name',
            key: 'name',
            render: (text) => <Text strong style={{ color: 'var(--color-primary-action)' }}>{text}</Text>,
        },
        {
            title: 'INDUSTRY',
            dataIndex: 'industry',
            key: 'industry',
            render: (text) => text || <Text type="secondary">Not Specified</Text>
        },
        {
            title: 'PROJECTS',
            dataIndex: 'projects',
            key: 'projects',
            render: (projects) => <Tag color="blue">{projects?.length || 0} Projects</Tag>
        },
        {
            title: 'STATUS',
            dataIndex: 'is_active',
            key: 'is_active',
            render: (active) => (
                <Tag color={active ? 'success' : 'error'} bordered={false}>
                    {active ? 'ACTIVE' : 'INACTIVE'}
                </Tag>
            )
        },
        {
            title: 'ACTIONS',
            key: 'action',
            width: 120,
            render: (_, record) => (
                <Space size={12}>
                    <Tooltip title="Edit Client">
                        <Button
                            type="text"
                            icon={<Pencil size={16} />}
                            style={{ color: 'var(--color-primary-action)', padding: 0 }}
                            onClick={() => {
                                setEditingClient(record);
                                form.setFieldsValue(record);
                                setIsDrawerVisible(true);
                            }}
                        />
                    </Tooltip>
                    <Popconfirm
                        title="Delete Client"
                        description="Are you sure? Clients with active projects cannot be deleted."
                        onConfirm={() => deleteMutation.mutate(record.id)}
                        okText="Yes"
                        cancelText="No"
                        okButtonProps={{ danger: true, loading: deleteMutation.isPending }}
                    >
                        <Tooltip title="Delete Client">
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

    return (
        <div style={{ padding: '0 24px 24px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, padding: '24px 0' }}>
                <div>
                    <Title level={2} style={{ margin: 0, fontWeight: 700, letterSpacing: '-0.02em' }}>Clients</Title>
                    <Text type="secondary">Manage your customer base and industry sectors.</Text>
                </div>
                <Button type="primary" icon={<Plus size={16} />} onClick={() => {
                    setEditingClient(null);
                    form.resetFields();
                    setIsDrawerVisible(true);
                }}>
                    Add Client
                </Button>
            </div>

            <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
                <Col span={8}>
                    <Card bordered={false} className="kpi-card">
                        <Text type="secondary" size="small">Total Clients</Text>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
                            <Title level={3} style={{ margin: 0 }}>{totalCount}</Title>
                            <Tag color="default" bordered={false}><Building2 size={12} /> Partners</Tag>
                        </div>
                    </Card>
                </Col>
            </Row>

            <div style={{ background: 'var(--color-card-bg)', borderRadius: 16, border: '1px solid var(--color-card-border)', overflow: 'hidden' }}>
                <div style={{ padding: '24px 24px 8px 24px' }}>
                    <Input
                        placeholder="Search by client name..."
                        prefix={<Search size={16} style={{ color: 'var(--color-text-muted)' }} />}
                        style={{ maxWidth: 320, borderRadius: 8 }}
                        onChange={(e) => {
                            setSearchText(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
                </div>

                <Table
                    columns={columns}
                    dataSource={clients}
                    rowKey="id"
                    loading={isLoading}
                    pagination={tablePagination(totalCount, currentPage, pageSize, (page, size) => {
                        setCurrentPage(page);
                        setPageSize(size);
                    })}
                    style={{ padding: '0 8px' }}
                />
            </div>

            <Drawer
                title={editingClient ? `Edit Client: ${editingClient.name}` : "Add New Client"}
                placement="right"
                onClose={() => {
                    setIsDrawerVisible(false);
                    setEditingClient(null);
                    form.resetFields();
                }}
                open={isDrawerVisible}
                width={480}
                className="glass-drawer"
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    initialValues={{ is_active: true }}
                >
                    <Form.Item
                        name="name"
                        label="Client Name"
                        rules={[{ required: true, message: 'Please enter client name' }]}
                    >
                        <Input placeholder="e.g. Acme Corp" />
                    </Form.Item>

                    <Form.Item
                        name="industry"
                        label="Industry / Sector"
                    >
                        <Input placeholder="e.g. Technology, Retail, Healthcare" />
                    </Form.Item>

                    <Form.Item name="is_active" label="Account Status">
                        <Select>
                            <Select.Option value={true}>Active Partner</Select.Option>
                            <Select.Option value={false}>Inactive / Archived</Select.Option>
                        </Select>
                    </Form.Item>

                    <div style={{ marginTop: 32, display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                        <Button onClick={() => setIsDrawerVisible(false)}>Cancel</Button>
                        <Button type="primary" htmlType="submit" loading={createMutation.isPending || updateMutation.isPending}>
                            {editingClient ? 'Update Client' : 'Add Client'}
                        </Button>
                    </div>
                </Form>
            </Drawer>
        </div>
    );
}
