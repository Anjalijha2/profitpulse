import React, { useState } from 'react';
import { Typography, Table, Input, Tag, Button, Select, Row, Col, Card, Space, Avatar } from 'antd';
import { Search, Eye, Users, Target, Building2, User2, Plus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../../api/axiosInstance';
import { formatINRCompact } from '../../utils/formatters';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

export default function EmployeeList() {
    const [searchText, setSearchText] = useState('');
    const [selectedDept, setSelectedDept] = useState(null);
    const navigate = useNavigate();

    const { data: response, isLoading } = useQuery({
        queryKey: ['employees'],
        queryFn: async () => {
            const res = await axiosInstance.get('/employees');
            return res.data;
        }
    });

    const employees = Array.isArray(response) ? response : (response?.data?.items || response?.items || []);

    // Derived stats
    const stats = {
        total: employees.length,
        billable: employees.filter(e => e.is_billable).length,
        departments: [...new Set(employees.map(e => e.department?.name).filter(Boolean))].length
    };

    const columns = [
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
            width: 140,
            render: (_, record) => (
                <Button
                    type="link"
                    icon={<Eye size={16} />}
                    style={{ padding: 0, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                    onClick={() => navigate(`/employees/${record.id}`)}
                >
                    Details
                </Button>
            )
        },
    ];

    const uniqueDepts = [...new Set(employees.map(e => e.department?.name).filter(Boolean))];

    const filtered = employees.filter(e => {
        const matchesSearch = e.name?.toLowerCase().includes(searchText.toLowerCase()) ||
            e.employee_code?.toLowerCase().includes(searchText.toLowerCase());
        const matchesDept = selectedDept ? e.department?.name === selectedDept : true;
        return matchesSearch && matchesDept;
    });

    return (
        <div className="animate-fade-in-up">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
                <div>
                    <Title level={2} className="page-title" style={{ margin: 0 }}>Workforce</Title>
                    <Text className="text-caption">Master directory of human resources across all functional units.</Text>
                </div>
                <Button type="primary" icon={<Plus size={16} />}>Onboard Employee</Button>
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
                            <Title level={3} style={{ margin: 0, color: 'var(--color-profit)' }}>{Math.round((stats.billable / stats.total) * 100)}%</Title>
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
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                    <Select
                        placeholder="All Departments"
                        style={{ width: 220 }}
                        allowClear
                        onChange={setSelectedDept}
                    >
                        {uniqueDepts.map(d => <Select.Option key={d} value={d}>{d}</Select.Option>)}
                    </Select>
                </div>

                <Table
                    columns={columns}
                    dataSource={filtered}
                    rowKey="id"
                    loading={isLoading}
                    pagination={{ pageSize: 15, showSizeChanger: true }}
                    scroll={{ x: 900 }}
                    style={{ padding: '0 12px' }}
                />
            </div>
        </div>
    );
}
