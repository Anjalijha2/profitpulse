import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Typography, Spin, Row, Col, Descriptions, Table, Button, Tag, Avatar, Space, Statistic, Divider } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../../api/axiosInstance';
import { ArrowLeft, User, Building2, Briefcase } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';

const { Title, Text } = Typography;

export default function EmployeeDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const { data: qData, isLoading: empLoading } = useQuery({
        queryKey: ['employee', id],
        queryFn: async () => {
            const res = await axiosInstance.get(`/employees/${id}`);
            return res.data || res;
        }
    });

    const { data: timesheetData, isLoading: tsLoading } = useQuery({
        queryKey: ['employeeTimesheets', id],
        queryFn: async () => {
            const res = await axiosInstance.get(`/employees/${id}/timesheet-summary`);
            const data = res.data || res;
            if (!data?.months) return [];

            const flatData = [];
            data.months.forEach(m => {
                m.projects.forEach((p, pIdx) => {
                    flatData.push({
                        id: `${m.month}-${p.project_name}-${pIdx}`,
                        projectName: p.project_name,
                        month: m.month,
                        billableHours: p.billable_hours,
                        nonBillableHours: p.non_billable_hours,
                        totalHours: p.billable_hours + p.non_billable_hours,
                        utilization: (p.billable_hours + p.non_billable_hours > 0)
                            ? ((p.billable_hours / (p.billable_hours + p.non_billable_hours)) * 100).toFixed(1)
                            : '0.0'
                    });
                });
            });
            return flatData;
        }
    });

    if (empLoading || tsLoading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><Spin size="large" tip="Loading profiles..." /></div>;

    const employee = qData?.employee || qData?.data?.employee;
    const timesheets = timesheetData || [];

    if (!employee) return (
        <div style={{ textAlign: 'center', marginTop: 100 }}>
            <Title level={3}>Employee Profile Unavailable</Title>
            <Text type="secondary">The profile you are looking for might have been moved or archived.</Text>
            <div style={{ marginTop: 24 }}>
                <Button type="primary" icon={<ArrowLeft size={16} />} onClick={() => navigate('/employees')}>Back to Directory</Button>
            </div>
        </div>
    );

    const tsColumns = [
        {
            title: 'Project Engagement',
            dataIndex: 'projectName',
            key: 'projectName',
            render: (text) => <Text strong>{text}</Text>
        },
        {
            title: 'Reporting Period',
            dataIndex: 'month',
            key: 'month',
            render: (text) => <Tag bordered={false}>{text}</Tag>
        },
        {
            title: 'Billable Hours',
            dataIndex: 'billableHours',
            key: 'billableHours',
            render: (val) => <Text strong style={{ color: 'var(--color-profit, #52c41a)' }}>{val}</Text>
        },
        {
            title: 'Non-Billable',
            dataIndex: 'nonBillableHours',
            key: 'nonBillableHours',
            render: (val) => <Text type="secondary">{val}</Text>
        },
        {
            title: 'Total Hours',
            dataIndex: 'totalHours',
            key: 'totalHours'
        },
        {
            title: 'Billability %',
            dataIndex: 'utilization',
            key: 'utilization',
            render: (val) => <Tag color={val > 80 ? 'success' : 'warning'} bordered={false}>{val}%</Tag>
        },
    ];

    return (
        <div className="animate-fade-in-up">
            <div style={{ marginBottom: 24 }}>
                <Button
                    type="link"
                    icon={<ArrowLeft size={16} style={{ marginRight: 8 }} />}
                    onClick={() => navigate('/employees')}
                    style={{ padding: 0, display: 'flex', alignItems: 'center', marginBottom: 16 }}
                >
                    Return to Directory
                </Button>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                        <Avatar size={72} icon={<User size={36} />} style={{ backgroundColor: 'var(--color-primary-bg, #e6f7ff)', color: 'var(--color-primary-action, #1890ff)' }} />
                        <div>
                            <Title level={2} style={{ margin: 0 }}>{employee.name}</Title>
                            <Space split={<Divider type="vertical" />}>
                                <Text type="secondary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Briefcase size={14} /> {employee.designation}</Text>
                                <Text type="secondary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Building2 size={14} /> {employee.department?.name || 'Main Unit'}</Text>
                                <Tag color={employee.is_billable ? 'success' : 'default'} bordered={false}>
                                    {employee.is_billable ? 'BILLABLE RESOURCE' : 'INTERNAL SUPPORT'}
                                </Tag>
                            </Space>
                        </div>
                    </div>
                </div>
            </div>

            <Row gutter={[24, 24]}>
                <Col xs={24} lg={8}>
                    <Card title="Resource Metrics" bordered={false} className="premium-card" style={{ borderRadius: 16 }}>
                        <Statistic title="Annual CTC" value={employee.annual_ctc} formatter={(val) => formatCurrency(val)} />
                        <Divider style={{ margin: '16px 0' }} />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Text type="secondary">Employee ID</Text>
                                <Text strong>{employee.employee_code}</Text>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Text type="secondary">Joined On</Text>
                                <Text strong>{formatDate(employee.joining_date)}</Text>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Text type="secondary">Unit</Text>
                                <Tag color="blue" bordered={false} style={{ margin: 0 }}>{employee.department?.name || 'General'}</Tag>
                            </div>
                        </div>
                    </Card>
                </Col>

                <Col xs={24} lg={16}>
                    <Card title="Activity History" bordered={false} className="premium-card" style={{ borderRadius: 16 }} bodyStyle={{ padding: '0 12px' }}>
                        <Table
                            dataSource={timesheets}
                            columns={tsColumns}
                            rowKey="id"
                            pagination={{ pageSize: 8 }}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
}
