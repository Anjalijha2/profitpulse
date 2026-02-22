import { Card, Typography, Table, Button, Tag, Modal, Form, Input, Select, message } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2, UserX } from 'lucide-react';
import { useState } from 'react';
import { axiosInstance } from '../../api/axiosInstance';
import { ROLES } from '../../utils/constants';

const { Title, Text } = Typography;

export default function UserManagement() {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();

    const { data: response, isLoading } = useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const res = await axiosInstance.get('/users');
            return res.data;
        }
    });

    const createUserMutation = useMutation({
        mutationFn: async (values) => {
            return await axiosInstance.post('/users', values);
        },
        onSuccess: () => {
            message.success('User created successfully');
            queryClient.invalidateQueries(['users']);
            setIsModalOpen(false);
            form.resetFields();
        }
    });

    const [editingUserId, setEditingUserId] = useState(null);

    const updateUserMutation = useMutation({
        mutationFn: async ({ id, values }) => {
            return await axiosInstance.put(`/users/${id}`, values);
        },
        onSuccess: () => {
            message.success('User updated successfully');
            queryClient.invalidateQueries(['users']);
            setIsModalOpen(false);
            form.resetFields();
            setEditingUserId(null);
        }
    });

    const deactivateUserMutation = useMutation({
        mutationFn: async (id) => {
            return await axiosInstance.delete(`/users/${id}`);
        },
        onSuccess: () => {
            message.success('User deactivated successfully');
            queryClient.invalidateQueries(['users']);
        }
    });

    const handleEdit = (record) => {
        setEditingUserId(record.id);
        form.setFieldsValue({
            name: record.name,
            email: record.email,
            role: record.role
        });
        setIsModalOpen(true);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setEditingUserId(null);
        form.resetFields();
    };

    const handleFormSubmit = (values) => {
        if (editingUserId) {
            updateUserMutation.mutate({ id: editingUserId, values });
        } else {
            createUserMutation.mutate(values);
        }
    };

    const columns = [
        { title: 'NAME', dataIndex: 'name', key: 'name', render: (text) => <span style={{ fontWeight: 600 }}>{text}</span> },
        { title: 'EMAIL', dataIndex: 'email', key: 'email' },
        {
            title: 'ROLE',
            dataIndex: 'role',
            key: 'role',
            render: (role) => <Tag color="blue">{role?.toUpperCase()}</Tag>
        },
        {
            title: 'STATUS',
            dataIndex: 'is_active',
            key: 'is_active',
            render: (active) => <Tag color={active ? 'success' : 'error'}>{active ? 'ACTIVE' : 'INACTIVE'}</Tag>
        },
        {
            title: 'ACTIONS',
            key: 'actions',
            render: (_, record) => (
                <div style={{ display: 'flex', gap: 8 }}>
                    <Button type="text" icon={<Edit2 size={16} />} onClick={() => handleEdit(record)} />
                    <Button
                        type="text"
                        danger
                        icon={<UserX size={16} />}
                        onClick={() => {
                            Modal.confirm({
                                title: 'Deactivate User?',
                                content: `Are you sure you want to deactivate ${record.name}?`,
                                onOk: () => deactivateUserMutation.mutate(record.id)
                            });
                        }}
                    />
                </div>
            )
        }
    ];

    return (
        <div className="animate-fade-in-up">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                <div>
                    <Title level={2} className="page-title" style={{ margin: 0, color: 'var(--color-text-primary)' }}>
                        User Management
                    </Title>
                    <Text className="text-caption" style={{ fontSize: 14 }}>
                        Control system access and role-based permissions.
                    </Text>
                </div>
                <Button type="primary" icon={<Plus size={16} />} onClick={() => { form.resetFields(); setEditingUserId(null); setIsModalOpen(true); }}>
                    Add User
                </Button>
            </div>

            <Card bordered={false} style={{ borderRadius: 'var(--radius-card)', boxShadow: 'var(--shadow-card-default)' }}>
                <Table
                    columns={columns}
                    dataSource={Array.isArray(response) ? response : (response?.data?.items || response?.items || [])}
                    rowKey="id"
                    loading={isLoading}
                    pagination={{ pageSize: 10 }}
                />
            </Card>

            <Modal
                title={editingUserId ? "Edit User" : "Create New User"}
                open={isModalOpen}
                onCancel={handleModalClose}
                onOk={() => form.submit()}
                confirmLoading={createUserMutation.isPending || updateUserMutation.isPending}
            >
                <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
                    <Form.Item name="name" label="Full Name" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="email" label="Email Address" rules={[{ required: true, type: 'email' }]}>
                        <Input disabled={!!editingUserId} />
                    </Form.Item>
                    {!editingUserId && (
                        <Form.Item name="password" label="Temporary Password" rules={[{ required: true }]}>
                            <Input.Password />
                        </Form.Item>
                    )}
                    <Form.Item name="role" label="Role" rules={[{ required: true }]}>
                        <Select>
                            {Object.values(ROLES).map(role => (
                                <Select.Option key={role} value={role}>{role.toUpperCase()}</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
