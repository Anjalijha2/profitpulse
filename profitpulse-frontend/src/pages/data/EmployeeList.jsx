import React, { useState } from 'react';
import { Typography, Table, Input, Tag, Button, Select, Row, Col, Card, Avatar, Modal, Form, InputNumber, Switch, message, DatePicker, Space, Tooltip, Popconfirm } from 'antd';
import { Search, Eye, Users, Target, Building2, User2, Plus, UserPlus, Pencil, Trash2 } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { axiosInstance } from '../../api/axiosInstance';
import { formatINRCompact } from '../../utils/formatters';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

export default function EmployeeList() {
    const [searchText, setSearchText] = useState('');
    const [selectedDept, setSelectedDept] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null); // null = create mode, object = edit mode
    const [submitting, setSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // ─── Fetch Employees ────────────────────────────────────────────────────────
    const { data: response, isLoading } = useQuery({
        queryKey: ['employees'],
        queryFn: async () => {
            const res = await axiosInstance.get('/employees?limit=1000');
            return res;
        }
    });

    // ─── Fetch Departments ───────────────────────────────────────────────────────
    const { data: deptsResponse } = useQuery({
        queryKey: ['all_departments'],
        staleTime: 5 * 60 * 1000,
        queryFn: async () => {
            const res = await axiosInstance.get('/employees/departments');
            if (res && Array.isArray(res.data)) return res.data;
            if (Array.isArray(res)) return res;
            return [];
        }
    });

    const employees = Array.isArray(response) ? response : (response?.data || []);

    // Build department map from employees + API
    const departmentMap = new Map();
    employees.forEach(e => {
        if (e.department?.id && e.department?.name) {
            departmentMap.set(e.department.id, e.department.name);
        }
    });
    const deptsFromApi = deptsResponse || [];
    deptsFromApi.forEach(d => {
        if (d.id && d.name) departmentMap.set(d.id, d.name);
    });
    const depts = Array.from(departmentMap.entries())
        .map(([id, name]) => ({ id, name }))
        .sort((a, b) => a.name.localeCompare(b.name));

    const uniqueDeptNames = [...new Set(employees.map(e => e.department?.name).filter(Boolean))];

    // ─── Stats ───────────────────────────────────────────────────────────────────
    const stats = {
        total: employees.length,
        billable: employees.filter(e => e.is_billable).length,
        departments: [...new Set(employees.map(e => e.department?.name).filter(Boolean))].length
    };

    // ─── Open Modal ──────────────────────────────────────────────────────────────
    const openCreateModal = () => {
        setEditingEmployee(null);
        form.resetFields();
        form.setFieldsValue({ joining_date: dayjs(), financial_year: '2025-2026', is_billable: true });
        setIsModalOpen(true);
    };

    const openEditModal = (record) => {
        setEditingEmployee(record);
        form.setFieldsValue({
            name: record.name,
            employee_code: record.employee_code,
            designation: record.designation,
            annual_ctc: record.annual_ctc,
            department_id: record.department_id,
            is_billable: record.is_billable,
            joining_date: record.joining_date ? dayjs(record.joining_date) : dayjs(),
            financial_year: record.financial_year || '2025-2026',
        });
        setIsModalOpen(true);
    };

    // ─── Submit Handler ──────────────────────────────────────────────────────────
    const handleSubmit = async (values) => {
        setSubmitting(true);
        try {
            const payload = {
                ...values,
                joining_date: values.joining_date ? values.joining_date.format('YYYY-MM-DD') : undefined
            };

            if (editingEmployee) {
                await axiosInstance.put(`/employees/${editingEmployee.id}`, payload);
                message.success('Employee updated successfully');
            } else {
                await axiosInstance.post('/employees', payload);
                message.success('Employee onboarded successfully');
            }

            queryClient.invalidateQueries(['employees']);
            setIsModalOpen(false);
            form.resetFields();
            setEditingEmployee(null);
        } catch (error) {
            // axiosInstance interceptor rejects with response.data, so error IS the body object
            // e.g. { success: false, message: "Employee code 'EMP036' already exists..." }
            const msg =
                error?.message ||                      // when error = { message: "..." } (backend body)
                error?.response?.data?.message ||      // fallback for raw axios error
                'Operation failed. Please try again.';
            message.error(msg, 5); // show for 5 seconds so user can read it
            // Do NOT close modal — let user fix the issue inline
        } finally {
            setSubmitting(false);
        }
    };

    // ─── Delete Handler ──────────────────────────────────────────────────────────
    const handleDelete = async (record) => {
        setDeletingId(record.id);
        try {
            await axiosInstance.delete(`/employees/${record.id}`);
            message.success(`Employee '${record.name}' removed successfully`);
            queryClient.invalidateQueries(['employees']);
        } catch (error) {
            message.error(error?.message || 'Failed to delete employee');
        } finally {
            setDeletingId(null);
        }
    };

    // ─── Table Columns ───────────────────────────────────────────────────────────
    const columns = [
        {
            title: 'S.NO.',
            key: 'serial',
            width: 60,
            render: (_, __, index) => {
                // Correctly compute global serial number across pages
                const serialNumber = (currentPage - 1) * pageSize + index + 1;
                return <Text style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>{serialNumber}</Text>;
            },
        },
        {
            title: 'EMPLOYEE',
            key: 'name',
            render: (_, record) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Avatar icon={<User2 size={16} />} style={{ backgroundColor: 'var(--color-primary-bg)', color: 'var(--color-primary-action)' }} />
                    <div>
                        <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{record.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--color-text-muted)', letterSpacing: '0.02em' }}>{record.employee_code}</div>
                    </div>
                </div>
            ),
        },
        {
            title: 'DEPARTMENT',
            dataIndex: 'department',
            key: 'department',
            render: (dept) => <Tag bordered={false} color="blue" style={{ fontSize: 11, fontWeight: 500 }}>{dept?.name || 'N/A'}</Tag>
        },
        {
            title: 'DESIGNATION',
            dataIndex: 'designation',
            key: 'designation',
            render: (text) => <Text style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{text}</Text>
        },
        {
            title: 'STATUS',
            dataIndex: 'is_billable',
            key: 'is_billable',
            render: (isBillable) => (
                <Tag color={isBillable ? 'success' : 'default'} bordered={false} style={{ width: 90, textAlign: 'center' }}>
                    {isBillable ? 'BILLABLE' : 'INTERNAL'}
                </Tag>
            )
        },
        {
            title: 'ANNUAL CTC',
            dataIndex: 'annual_ctc',
            key: 'annual_ctc',
            sorter: (a, b) => a.annual_ctc - b.annual_ctc,
            render: (val) => val ? <Text strong>{formatINRCompact(val)}</Text> : <Text type="secondary">-</Text>,
        },
        {
            title: 'ACTIONS',
            key: 'action',
            width: 180,
            render: (_, record) => (
                <Space size={4}>
                    <Tooltip title="Edit Employee">
                        <Button
                            type="text"
                            icon={<Pencil size={15} />}
                            style={{ color: 'var(--color-primary-action)', padding: '4px 8px', display: 'inline-flex', alignItems: 'center' }}
                            onClick={() => openEditModal(record)}
                        />
                    </Tooltip>
                    <Button
                        type="link"
                        icon={<Eye size={16} />}
                        style={{ padding: '0 6px', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                        onClick={() => navigate(`/employees/${record.id}`)}
                    >
                        Details
                    </Button>
                    <Popconfirm
                        title="Remove Employee"
                        description={`Are you sure you want to remove ${record.name}? This action cannot be undone.`}
                        onConfirm={() => handleDelete(record)}
                        okText="Yes, Remove"
                        cancelText="Cancel"
                        okButtonProps={{ danger: true }}
                    >
                        <Tooltip title="Remove Employee">
                            <Button
                                type="text"
                                danger
                                icon={<Trash2 size={15} />}
                                loading={deletingId === record.id}
                                style={{ padding: '4px 8px', display: 'inline-flex', alignItems: 'center' }}
                            />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            )
        },
    ];

    const filtered = employees.filter(e => {
        const matchesSearch = e.name?.toLowerCase()?.includes(searchText.toLowerCase()) ||
            e.employee_code?.toLowerCase()?.includes(searchText.toLowerCase());
        const matchesDept = selectedDept ? e.department?.name === selectedDept : true;
        return matchesSearch && matchesDept;
    });

    // ─── Render ──────────────────────────────────────────────────────────────────
    return (
        <div className="animate-fade-in-up">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
                <div>
                    <Title level={2} className="page-title" style={{ margin: 0 }}>Workforce</Title>
                    <Text className="text-caption">Master directory of human resources across all functional units.</Text>
                </div>
                <Button
                    type="primary"
                    icon={<Plus size={16} />}
                    onClick={openCreateModal}
                    style={{ height: 44, borderRadius: 10, padding: '0 24px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}
                >
                    Onboard Employee
                </Button>
            </div>

            <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={8}>
                    <Card bordered={false} bodyStyle={{ padding: '16px 24px' }} style={{ borderRadius: 12, boxShadow: 'var(--shadow-card-default)' }}>
                        <Text type="secondary" size="small">Headcount</Text>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
                            <Title level={3} style={{ margin: 0 }}>{stats.total}</Title>
                            <Tag color="default" bordered={false} style={{ margin: 0 }}><Users size={12} /> Total Resources</Tag>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card bordered={false} bodyStyle={{ padding: '16px 24px' }} style={{ borderRadius: 12, boxShadow: 'var(--shadow-card-default)' }}>
                        <Text type="secondary" size="small">Utilization Target</Text>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
                            <Title level={3} style={{ margin: 0, color: 'var(--color-profit)' }}>
                                {stats.total > 0 ? Math.round((stats.billable / stats.total) * 100) : 0}%
                            </Title>
                            <Tag color="success" bordered={false} style={{ margin: 0 }}><Target size={12} /> Billable Staff</Tag>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card bordered={false} bodyStyle={{ padding: '16px 24px' }} style={{ borderRadius: 12, boxShadow: 'var(--shadow-card-default)' }}>
                        <Text type="secondary" size="small">Organization</Text>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
                            <Title level={3} style={{ margin: 0, color: 'var(--color-primary-action)' }}>{stats.departments}</Title>
                            <Tag color="blue" bordered={false} style={{ margin: 0 }}><Building2 size={12} /> Unit Count</Tag>
                        </div>
                    </Card>
                </Col>
            </Row>

            <div style={{ background: 'var(--color-card-bg)', borderRadius: 16, border: '1px solid var(--color-card-border)', overflow: 'hidden', boxShadow: 'var(--shadow-card-default)' }}>
                <div style={{ display: 'flex', gap: 16, padding: '24px 24px 8px 24px' }}>
                    <Input
                        placeholder="Search by ID or name..."
                        prefix={<Search size={16} style={{ color: 'var(--color-text-muted)' }} />}
                        style={{ maxWidth: 320, borderRadius: 8 }}
                        onChange={(e) => { setSearchText(e.target.value); setCurrentPage(1); }}
                    />
                    <Select
                        placeholder="All Departments"
                        style={{ width: 220 }}
                        allowClear
                        onChange={(val) => { setSelectedDept(val); setCurrentPage(1); }}
                    >
                        {uniqueDeptNames.map(d => <Select.Option key={d} value={d}>{d}</Select.Option>)}
                    </Select>
                </div>

                <Table
                    columns={columns}
                    dataSource={filtered}
                    rowKey="id"
                    loading={isLoading}
                    pagination={{
                        current: currentPage,
                        pageSize: pageSize,
                        total: filtered.length,
                        showSizeChanger: true,
                        pageSizeOptions: ['5', '10', '15', '20', '50'],
                        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} employees`,
                        onChange: (page, size) => {
                            setCurrentPage(page);
                            setPageSize(size);
                        },
                        onShowSizeChange: (current, size) => {
                            setCurrentPage(1);
                            setPageSize(size);
                        }
                    }}
                    scroll={{ x: 900 }}
                    style={{ padding: '0 12px' }}
                />
            </div>

            {/* ─── Create / Edit Modal ─────────────────────────────────────────── */}
            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                        {editingEmployee ? <Pencil size={20} color="var(--color-primary-action)" /> : <UserPlus size={20} color="var(--color-primary-action)" />}
                        <span style={{ fontSize: 18, fontWeight: 700 }}>
                            {editingEmployee ? `Edit: ${editingEmployee.name}` : 'Onboard New Employee'}
                        </span>
                    </div>
                }
                open={isModalOpen}
                onCancel={() => { setIsModalOpen(false); form.resetFields(); setEditingEmployee(null); }}
                footer={null}
                width={540}
                centered
                className="premium-modal"
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    style={{ marginTop: 24 }}
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="name" label="Full Name" rules={[{ required: true, message: 'Name is required' }]}>
                                <Input placeholder="John Doe" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="employee_code"
                                label="Employee ID"
                                rules={[{ required: true, message: 'Employee ID is required' }]}
                            >
                                <Input placeholder="EMP001" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="designation" label="Designation" rules={[{ required: true, message: 'Designation is required' }]}>
                                <Input placeholder="Software Engineer" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="annual_ctc" label="Annual CTC (INR)" rules={[{ required: true, message: 'CTC is required' }]}>
                                <InputNumber
                                    style={{ width: '100%' }}
                                    formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={value => value.replace(/₹\s?|(,*)/g, '')}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="department_id" label="Department" rules={[{ required: true, message: 'Department is required' }]}>
                                <Select
                                    placeholder="Select Department"
                                    showSearch
                                    optionFilterProp="label"
                                    options={depts.map(d => ({ value: d.id, label: d.name }))}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="is_billable" label="Is Billable?" valuePropName="checked" initialValue={true}>
                                <Switch />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="joining_date" label="Joining Date">
                                <DatePicker style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="financial_year" label="Financial Year">
                                <Select>
                                    <Select.Option value="2024-2025">2024-2025</Select.Option>
                                    <Select.Option value="2025-2026">2025-2026</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 12 }}>
                        <Button onClick={() => { setIsModalOpen(false); form.resetFields(); setEditingEmployee(null); }}>
                            Cancel
                        </Button>
                        <Button type="primary" htmlType="submit" loading={submitting}>
                            {editingEmployee ? 'Save Changes' : 'Onboard Employee'}
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
}
