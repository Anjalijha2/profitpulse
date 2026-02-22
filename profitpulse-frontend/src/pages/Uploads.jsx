import { useState } from 'react';
import { Card, Typography, Upload, Button, message, Select, DatePicker, Tabs, Result } from 'antd';
import { UploadCloud } from 'lucide-react';
import { axiosInstance } from '../api/axiosInstance';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Dragger } = Upload;
const { TabPane } = Tabs;

export default function Uploads() {
    const [uploading, setUploading] = useState(false);
    const [success, setSuccess] = useState(null); // stores success message/log

    // States for specific upload fields
    const [financialYear, setFinancialYear] = useState('2024-2025');
    const [selectedMonth, setSelectedMonth] = useState(dayjs());

    const handleCustomRequest = async ({ file, onSuccess, onError }, type) => {
        setUploading(true);
        setSuccess(null);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);

        // Add specific fields based on upload type
        if (type === 'employees') formData.append('financialYear', financialYear);
        if (type === 'timesheets') formData.append('month', selectedMonth.format('YYYY-MM'));
        if (type === 'revenue') formData.append('month', selectedMonth.format('YYYY-MM'));

        try {
            // Validate first
            const valRes = await axiosInstance.post(`/uploads/validate`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (valRes && valRes.data && !valRes.data.valid) {
                message.error(`Validation Failed! Found errors in ${valRes.data.errorRows} row(s). Check format and missing fields.`);
                onError(new Error('Validation failed'));
                setUploading(false);
                return;
            }

            const res = await axiosInstance.post(`/uploads/${type}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            message.success(`${file.name} uploaded successfully.`);
            setSuccess(res.data);
            onSuccess('ok');
        } catch (err) {
            console.error(err);
            message.error(typeof err === 'string' ? err : (err.message || 'Upload failed. Check format or values.'));
            onError(err);
        } finally {
            setUploading(false);
        }
    };

    const handleDownloadTemplate = async (type) => {
        try {
            const response = await axiosInstance.get(`/uploads/template/${type}`, {
                responseType: 'arraybuffer',
            });
            const blob = new Blob([response.data || response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${type}_template.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            message.success('Template downloaded.');
        } catch (err) {
            message.error('Failed to download template.');
        }
    };

    const uploadProps = (type) => ({
        name: 'file',
        multiple: false,
        maxCount: 1,
        accept: '.xlsx, .xls',
        customRequest: (options) => handleCustomRequest(options, type),
        onChange(info) { },
        onDrop(e) { },
        showUploadList: false
    });

    const renderDragger = (type, description) => {
        if (success) {
            return (
                <Result
                    status="success"
                    title="Upload Complete"
                    subTitle={`Successfully processed ${success?.data?.success_rows || 'all'} rows.`}
                    extra={[
                        <Button type="primary" key="console" onClick={() => setSuccess(null)}>
                            Upload Another File
                        </Button>
                    ]}
                />
            );
        }

        return (
            <Dragger {...uploadProps(type)} disabled={uploading}>
                <p style={{ fontSize: 48, color: '#6366f1', marginBottom: 24, padding: '24px 0' }}>
                    <UploadCloud size={64} style={{ margin: '0 auto', display: 'block' }} />
                </p>
                <p style={{ fontSize: 18, fontWeight: 600, color: '#111827' }}>Click or drag file to this area to upload</p>
                <p style={{ color: '#6b7280', marginTop: 8 }}>{description}</p>
                <p style={{ color: '#9ca3af', fontSize: 13, marginTop: 16 }}>Supports .xlsx and .xls formats only. Max 5MB.</p>
            </Dragger>
        );
    };

    return (
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <div style={{ marginBottom: 32, textAlign: 'center' }}>
                <Title level={2} style={{ margin: 0, fontWeight: 700, letterSpacing: '-0.02em', color: '#111827' }}>
                    Data Ingestion Hub
                </Title>
                <Text style={{ color: '#6b7280', fontSize: 16 }}>
                    Upload master data and monthly tracking records.
                </Text>
            </div>

            <Card
                bordered={false}
                style={{ borderRadius: 12, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                bodyStyle={{ padding: 32 }}
            >
                <Tabs defaultActiveKey="employees" centered size="large">
                    <TabPane tab="Employee Master" key="employees">
                        <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16, justifyContent: 'center' }}>
                            <Text style={{ fontWeight: 500 }}>Target Year:</Text>
                            <Select value={financialYear} onChange={setFinancialYear} style={{ width: 140 }}>
                                <Select.Option value="2024-2025">2024 - 2025</Select.Option>
                                <Select.Option value="2025-2026">2025 - 2026</Select.Option>
                            </Select>
                            <Button type="link" onClick={() => handleDownloadTemplate('employees')}>Download Template</Button>
                        </div>
                        {renderDragger('employees', 'Upload the latest employee directory containing names, CTC, and designations.')}
                    </TabPane>

                    <TabPane tab="Monthly Timesheets" key="timesheets">
                        <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16, justifyContent: 'center' }}>
                            <Text style={{ fontWeight: 500 }}>Target Month:</Text>
                            <DatePicker picker="month" value={selectedMonth} onChange={(d) => d && setSelectedMonth(d)} />
                            <Button type="link" onClick={() => handleDownloadTemplate('timesheets')}>Download Template</Button>
                        </div>
                        {renderDragger('timesheets', 'Upload the timesheet data linking employee hours to specific projects.')}
                    </TabPane>

                    <TabPane tab="Monthly Revenue" key="revenue">
                        <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16, justifyContent: 'center' }}>
                            <Text style={{ fontWeight: 500 }}>Target Month:</Text>
                            <DatePicker picker="month" value={selectedMonth} onChange={(d) => d && setSelectedMonth(d)} />
                            <Button type="link" onClick={() => handleDownloadTemplate('revenue')}>Download Template</Button>
                        </div>
                        {renderDragger('revenue', 'Upload the invoiced revenue categorized by project code.')}
                    </TabPane>
                </Tabs>
            </Card>
        </div>
    );
}
