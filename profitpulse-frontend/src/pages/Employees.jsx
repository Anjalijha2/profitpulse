import { useState } from 'react';
import { Typography, Table, Input, Tag, Select, Button, Drawer } from 'antd';
import { Search, Eye } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';

const { Title, Text } = Typography;

export default function Employees() {
    const [searchText, setSearchText] = useState('');
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [selectedEmp, setSelectedEmp] = useState(null);

    const { data: response, isLoading } = useQuery({
        queryKey: ['employees'],
        queryFn: async () => {
            const res = await apiClient.get('/employees');
            return res.data;
        }
    });

    const columns = [
        {
            title: 'Employee ID',
            dataIndex: 'employee_code',
            key: 'employee_code',
            render: (text) => <span style={{ fontWeight: 600 }}>{text}</span>,
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Designation',
            dataIndex: 'designation',
            key: 'designation',
        },
        {
            title: 'Billable',
            dataIndex: 'is_billable',
            key: 'is_billable',
            render: (isBillable) => (
                <Tag color={isBillable ? 'success' : 'default'}>
                    {isBillable ? 'BILLABLE' : 'NON-BILLABLE'}
                </Tag>
            )
        },
        {
            title: 'CTC',
            dataIndex: 'annual_ctc',
            key: 'annual_ctc',
            render: (val) => val ? `$${val.toLocaleString()}` : '-',
        },
        {
            title: 'Actions',
            key: 'action',
            width: 100,
            render: (_, record) => (
                <Button
                    type="text"
                    icon={<Eye size={16} />}
                    onClick={() => {
                        setSelectedEmp(record);
                        setDrawerVisible(true);
                    }}
                >
                    View
                </Button>
            )
        },
    ];

    const employees = response?.data?.items || [];
    const filtered = employees.filter(e =>
        e.name?.toLowerCase().includes(searchText.toLowerCase()) ||
        e.employee_code?.toLowerCase().includes(searchText.toLowerCase())
    );

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                <div>
                    <Title level={2} style={{ margin: 0, fontWeight: 700, letterSpacing: '-0.02em', color: '#111827' }}>
                        Employees
                    </Title>
                    <Text style={{ color: '#6b7280', fontSize: 16 }}>
                        Master directory and resource details.
                    </Text>
                </div>
            </div>

            <div style={{ background: '#fff', borderRadius: 12, padding: 24, border: '1px solid #e5e7eb', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
                <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
                    <Input
                        placeholder="Search employees..."
                        prefix={<Search size={16} style={{ color: '#9ca3af' }} />}
                        style={{ maxWidth: 320, borderRadius: 8, height: 40 }}
                        onChange={(e) => setSearchText(e.target.value)}
                    />
                </div>

                <Table
                    columns={columns}
                    dataSource={filtered}
                    rowKey="id"
                    loading={isLoading}
                    pagination={{ pageSize: 10 }}
                />
            </div>

            <Drawer
                title="Employee Profile"
                placement="right"
                onClose={() => setDrawerVisible(false)}
                open={drawerVisible}
                width={400}
            >
                {selectedEmp && (
                    <div>
                        <Title level={4}>{selectedEmp.name}</Title>
                        <Text type="secondary">{selectedEmp.designation}</Text>

                        {/* Note: Can query the specific profitability endpoint here: GET /employees/:id/profitability */}
                        <div style={{ marginTop: 24, background: '#f9fafb', padding: 16, borderRadius: 8 }}>
                            <p><strong>Employee ID:</strong> {selectedEmp.employee_code}</p>
                            <p><strong>Billable Status:</strong> {selectedEmp.is_billable ? 'Yes' : 'No'}</p>
                            <p><strong>CTC:</strong> ${selectedEmp.annual_ctc?.toLocaleString()}</p>
                        </div>
                    </div>
                )}
            </Drawer>
        </div>
    );
}
