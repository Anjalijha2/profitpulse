import React, { useState } from 'react';
import { Typography, Table, Input, Tag, Button, Select } from 'antd';
import { Search, Eye } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../../api/axiosInstance';
import { formatINRCompact } from '../../utils/formatters';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

export default function EmployeeList() {
    const [searchText, setSearchText] = useState('');
    const navigate = useNavigate();

    const { data: response, isLoading } = useQuery({
        queryKey: ['employees'],
        queryFn: async () => {
            const res = await axiosInstance.get('/employees');
            return res.data;
        }
    });

    const columns = [
        {
            title: 'EMPLOYEE ID',
            dataIndex: 'employee_code',
            key: 'employee_code',
            render: (text) => <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{text}</span>,
        },
        {
            title: 'NAME',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'DEPARTMENT',
            dataIndex: 'department',
            key: 'department',
            render: (dept) => <span style={{ color: 'var(--color-text-secondary)' }}>{dept?.name || '-'}</span>
        },
        {
            title: 'DESIGNATION',
            dataIndex: 'designation',
            key: 'designation',
            render: (text) => <span style={{ color: 'var(--color-text-secondary)' }}>{text}</span>
        },
        {
            title: 'BILLABLE',
            dataIndex: 'is_billable',
            key: 'is_billable',
            render: (isBillable) => (
                <Tag color={isBillable ? 'success' : 'default'} bordered={false}>
                    {isBillable ? 'BILLABLE' : 'NON-BILLABLE'}
                </Tag>
            )
        },
        {
            title: 'CTC (ANNUAL)',
            dataIndex: 'annual_ctc',
            key: 'annual_ctc',
            render: (val) => val ? formatINRCompact(val) : '-',
        },
        {
            title: 'ACTIONS',
            key: 'action',
            width: 100,
            render: (_, record) => (
                <Button
                    type="text"
                    icon={<Eye size={16} />}
                    onClick={() => navigate(`/employees/${record.id}`)}
                >
                    View Details
                </Button>
            )
        },
    ];

    const employees = Array.isArray(response) ? response : (response?.data?.items || response?.items || []);

    // Extract unique departments for filter dropdown
    const uniqueDepts = [...new Set(employees.map(e => e.department?.name).filter(Boolean))];
    const [selectedDept, setSelectedDept] = useState(null);

    const filtered = employees.filter(e => {
        const matchesSearch = e.name?.toLowerCase().includes(searchText.toLowerCase()) || e.employee_code?.toLowerCase().includes(searchText.toLowerCase());
        const matchesDept = selectedDept ? e.department?.name === selectedDept : true;
        return matchesSearch && matchesDept;
    });

    return (
        <div className="animate-fade-in-up">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                <div>
                    <Title level={2} className="page-title" style={{ margin: 0, color: 'var(--color-text-primary)' }}>
                        Employees
                    </Title>
                    <Text className="text-caption" style={{ fontSize: 14 }}>
                        Master directory and resource details.
                    </Text>
                </div>
            </div>

            <div style={{ background: 'var(--color-card-bg)', borderRadius: 'var(--radius-card)', padding: 24, border: '1px solid var(--color-card-border)', boxShadow: 'var(--shadow-card-default)' }}>
                <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
                    <Input
                        placeholder="Search employees..."
                        prefix={<Search size={16} style={{ color: 'var(--color-text-muted)' }} />}
                        style={{ maxWidth: 320 }}
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                    <Select
                        placeholder="Filter by Department"
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
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: 800 }}
                />
            </div>
        </div>
    );
}
