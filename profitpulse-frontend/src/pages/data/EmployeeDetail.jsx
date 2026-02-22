import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Typography, Spin, Row, Col, Descriptions, Table, Button } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../../api/axiosInstance';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { formatCurrency } from '../../utils/formatters';

export default function EmployeeDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const { data: empData, isLoading: empLoading } = useQuery({
        queryKey: ['employee', id],
        queryFn: async () => {
            const res = await axiosInstance.get(`/employees/${id}`);
            return res.data;
        }
    });

    const { data: timesheetData, isLoading: tsLoading } = useQuery({
        queryKey: ['employeeTimesheets', id],
        queryFn: async () => {
            const res = await axiosInstance.get(`/employees/${id}/timesheet-summary`);
            if (!res.data || !res.data.data || !res.data.data.months) return [];

            // Flatten the month/project structure for the table
            const flatData = [];
            res.data.data.months.forEach(m => {
                m.projects.forEach(p => {
                    flatData.push({
                        id: `${m.month}-${p.project_name}`,
                        project: { name: p.project_name },
                        month: m.month,
                        billable_hours: p.billable_hours,
                        non_billable_hours: p.non_billable_hours,
                        total_hours: p.billable_hours + p.non_billable_hours,
                    });
                });
            });
            return flatData;
        }
    });

    if (empLoading || tsLoading) return <Spin style={{ display: 'block', margin: '100px auto' }} />;
    const employee = empData?.employee || empData?.data?.employee;
    const timesheets = timesheetData || [];

    const tsColumns = [
        { title: 'Project', dataIndex: ['project', 'name'], key: 'project' },
        { title: 'Month', dataIndex: 'month', key: 'month' },
        { title: 'Total Hours', dataIndex: 'total_hours', key: 'total_hours' },
        { title: 'Billable Hours', dataIndex: 'billable_hours', key: 'billable_hours' },
    ];

    if (!employee) return <div>Employee not found</div>;

    return (
        <div className="fade-in">
            <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} style={{ padding: 0, marginBottom: 16 }}>
                Back to Employees
            </Button>
            <Typography.Title level={2} className="page-title">{employee.name}</Typography.Title>

            <Row gutter={[24, 24]}>
                <Col span={24}>
                    <Card title="Employee Information">
                        <Descriptions bordered column={{ xxl: 3, xl: 3, lg: 3, md: 2, sm: 1, xs: 1 }}>
                            <Descriptions.Item label="Code">{employee.employee_code}</Descriptions.Item>
                            <Descriptions.Item label="Designation">{employee.designation}</Descriptions.Item>
                            <Descriptions.Item label="Department">{employee.department?.name}</Descriptions.Item>
                            <Descriptions.Item label="CTC">{formatCurrency(employee.annual_ctc)}</Descriptions.Item>
                            <Descriptions.Item label="Billable">{employee.is_billable ? 'Yes' : 'No'}</Descriptions.Item>
                            <Descriptions.Item label="Joining Date">{employee.joining_date}</Descriptions.Item>
                        </Descriptions>
                    </Card>
                </Col>

                <Col span={24}>
                    <Card title="Timesheet History">
                        <Table dataSource={timesheets} columns={tsColumns} rowKey="id" pagination={{ pageSize: 10 }} />
                    </Card>
                </Col>
            </Row>
        </div>
    );
}
