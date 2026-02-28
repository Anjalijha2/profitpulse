import React, { useState } from 'react';
import { Card, Typography, Form, Button, message, DatePicker, Select } from 'antd';
import { DownloadCloud } from 'lucide-react';
import { axiosInstance } from '../../api/axiosInstance';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

export default function ReportCenter() {
    const [form] = Form.useForm();
    const [downloading, setDownloading] = useState(false);

    const handleDownload = async (values) => {
        setDownloading(true);
        let endpoint = '/reports/project-profitability';
        if (values.report_type === 'employee_profitability') endpoint = '/reports/employee-profitability';
        if (values.report_type === 'department_profitability') endpoint = '/reports/department-profitability';
        if (values.report_type === 'employee_utilization') endpoint = '/reports/utilization';

        try {
            const params = {
                month: values.start_month.format('YYYY-MM'),
                start_month: values.start_month.format('YYYY-MM'),
                end_month: values.end_month.format('YYYY-MM'),
                report_type: values.report_type
            };

            const response = await axiosInstance.get(endpoint, {
                params,
                responseType: 'arraybuffer',
            });

            // Create a blob from the response data
            const blob = new Blob([response.data || response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${values.report_type}_report_${dayjs().format('YYYY-MM-DD')}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            message.success('Report downloaded successfully!');
        } catch (err) {
            console.error(err);
            message.error('Failed to download report.');
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div className="animate-fade-in-up">
            <div style={{ marginBottom: 32 }}>
                <Title level={2} className="page-title" style={{ margin: 0, color: 'var(--color-text-primary)' }}>
                    Report Center
                </Title>
                <Text className="text-caption" style={{ fontSize: 14 }}>
                    Generate standard and custom Excel intelligence reports.
                </Text>
            </div>

            <Card bordered={false} style={{ maxWidth: 600, borderRadius: 'var(--radius-card)', boxShadow: 'var(--shadow-card-default)' }} bodyStyle={{ padding: 32 }}>
                <Form form={form} layout="vertical" onFinish={handleDownload}>
                    <Form.Item name="report_type" label="Report Type" rules={[{ required: true }]} initialValue="project_profitability">
                        <Select size="large">
                            <Select.Option value="project_profitability">Project Profitability Master</Select.Option>
                            <Select.Option value="employee_profitability">Employee Profitability Summary</Select.Option>
                            <Select.Option value="department_profitability">Department Profitability Summary</Select.Option>
                            <Select.Option value="employee_utilization">Employee Utilization Summary</Select.Option>
                        </Select>
                    </Form.Item>

                    <div style={{ display: 'flex', gap: 16 }}>
                        <Form.Item name="start_month" label="From Month" style={{ flex: 1 }} initialValue={dayjs().subtract(6, 'month')}>
                            <DatePicker picker="month" size="large" style={{ width: '100%' }} />
                        </Form.Item>
                        <Form.Item name="end_month" label="To Month" style={{ flex: 1 }} initialValue={dayjs()}>
                            <DatePicker picker="month" size="large" style={{ width: '100%' }} />
                        </Form.Item>
                    </div>

                    <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
                        <Button type="primary" htmlType="submit" icon={<DownloadCloud size={16} />} loading={downloading} size="large" block>
                            Generate & Download Excel
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
}
