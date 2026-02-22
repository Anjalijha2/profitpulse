import React, { useState } from 'react';
import { Card, Typography, Upload, Button, message, Select, DatePicker, Steps, Result, Space, Table } from 'antd';
import { UploadCloud } from 'lucide-react';
import { DownloadOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { axiosInstance } from '../../api/axiosInstance';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Dragger } = Upload;
const { Step } = Steps;

export default function UploadCenter() {
    const [currentStep, setCurrentStep] = useState(0);
    const [uploadType, setUploadType] = useState('employees');
    const [financialYear, setFinancialYear] = useState('2024-2025');
    const [selectedMonth, setSelectedMonth] = useState(dayjs());
    const [file, setFile] = useState(null);
    const [validationErrors, setValidationErrors] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [successData, setSuccessData] = useState(null);

    const handleDownloadTemplate = async () => {
        try {
            const res = await axiosInstance.get(`/uploads/template/${uploadType}`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${uploadType}_template.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            message.error('Failed to download template');
        }
    };

    const handleFileSelect = (info) => {
        setFile(info.file);
        setCurrentStep(2); // Jump to Validate
    };

    const handleValidate = async () => {
        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        if (uploadType === 'employees') formData.append('financialYear', financialYear);
        if (uploadType === 'timesheets' || uploadType === 'revenue') formData.append('month', selectedMonth.format('YYYY-MM'));

        try {
            const res = await axiosInstance.post('/uploads/validate', formData);
            if (res.data.data.errors && res.data.data.errors.length > 0) {
                setValidationErrors(res.data.data.errors);
                setCurrentStep(3); // Show Errors
            } else {
                setValidationErrors([]);
                setCurrentStep(4); // Confirm
            }
        } catch (error) {
            message.error('Validation failed');
            setValidationErrors([{ row: 'All', message: 'API Error during validation' }]);
            setCurrentStep(3);
        } finally {
            setUploading(false);
        }
    };

    const handleUpload = async () => {
        setCurrentStep(5); // Uploading
        const formData = new FormData();
        formData.append('file', file);
        if (uploadType === 'employees') formData.append('financialYear', financialYear);
        if (uploadType === 'timesheets' || uploadType === 'revenue') formData.append('month', selectedMonth.format('YYYY-MM'));

        try {
            const res = await axiosInstance.post(`/uploads/${uploadType}`, formData);
            setSuccessData(res.data.data);
            setCurrentStep(6); // Success
        } catch (error) {
            message.error('Upload failed');
            setCurrentStep(3); // Show Errors
            setValidationErrors([{ row: 'All', message: error.response?.data?.message || 'Upload execution failed' }]);
        }
    };

    const resetFlow = () => {
        setFile(null);
        setValidationErrors([]);
        setSuccessData(null);
        setCurrentStep(0);
    };

    const steps = [
        {
            title: 'Type', content: (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <Space direction="vertical" size="large">
                        <Select value={uploadType} onChange={setUploadType} style={{ width: 200 }}>
                            <Select.Option value="employees">Employee Master</Select.Option>
                            <Select.Option value="timesheets">Timesheets</Select.Option>
                            <Select.Option value="revenue">Revenue</Select.Option>
                        </Select>
                        {uploadType === 'employees' && (
                            <Select value={financialYear} onChange={setFinancialYear} style={{ width: 200 }}>
                                <Select.Option value="2024-2025">2024 - 2025</Select.Option>
                                <Select.Option value="2025-2026">2025 - 2026</Select.Option>
                            </Select>
                        )}
                        {(uploadType === 'timesheets' || uploadType === 'revenue') && (
                            <DatePicker picker="month" value={selectedMonth} onChange={(d) => d && setSelectedMonth(d)} />
                        )}
                        <Button type="primary" onClick={() => setCurrentStep(1)}>Next</Button>
                    </Space>
                </div>
            )
        },
        {
            title: 'Template', content: (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <Space direction="vertical" size="large">
                        <Text>Download the template to ensure correct formatting.</Text>
                        <Button icon={<DownloadOutlined />} onClick={handleDownloadTemplate}>Download Template</Button>
                        <Dragger beforeUpload={(f) => { handleFileSelect({ file: f }); return false; }} maxCount={1} showUploadList={false}>
                            <p style={{ fontSize: 48, color: 'var(--color-primary)' }}><UploadCloud style={{ margin: '0 auto' }} /></p>
                            <p>Click or drag file here to upload</p>
                        </Dragger>
                    </Space>
                </div>
            )
        },
        {
            title: 'Validate', content: (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <Space direction="vertical" size="large">
                        <Text>File selected: {file?.name}</Text>
                        <Button type="primary" loading={uploading} onClick={handleValidate}>Run Dry-Run Validation</Button>
                        <Button onClick={() => setCurrentStep(1)}>Back</Button>
                    </Space>
                </div>
            )
        },
        {
            title: 'Errors', content: (
                <div style={{ padding: '20px 0' }}>
                    {validationErrors.length > 0 ? (
                        <>
                            <Text type="danger"><CloseCircleOutlined /> Validation Failed. Please fix the errors below.</Text>
                            <Table dataSource={validationErrors} rowKey={(r, i) => i} columns={[{ title: 'Row', dataIndex: 'row' }, { title: 'Error', dataIndex: 'message' }]} pagination={{ pageSize: 5 }} style={{ marginTop: 16 }} />
                            <Space style={{ marginTop: 16 }}>
                                <Button onClick={() => setCurrentStep(1)}>Upload New File</Button>
                            </Space>
                        </>
                    ) : (
                        <Text>No errors found! Proceed to confirm.</Text>
                    )}
                </div>
            )
        },
        {
            title: 'Confirm', content: (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <Space direction="vertical" size="large">
                        <Text><CheckCircleOutlined style={{ color: 'var(--color-success)' }} /> Validation Passed!</Text>
                        <Text>Are you sure you want to upload {file?.name} directly into the database?</Text>
                        <Space>
                            <Button onClick={() => setCurrentStep(1)}>Cancel</Button>
                            <Button type="primary" onClick={handleUpload}>Confirm & Upload</Button>
                        </Space>
                    </Space>
                </div>
            )
        },
        {
            title: 'Uploading', content: (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <Typography.Title level={4}>Uploading to Database...</Typography.Title>
                    <div className="spinner" style={{ margin: '0 auto' }}></div>
                </div>
            )
        },
        {
            title: 'Success', content: (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <Result status="success" title="Successfully Uploaded File!" subTitle={`Processed records and generated audit logs.`} extra={[<Button type="primary" onClick={resetFlow} key="reset">Upload Another</Button>]} />
                </div>
            )
        }
    ];

    return (
        <div className="animate-fade-in-up">
            <Typography.Title level={2} className="page-title">Data Upload Center</Typography.Title>
            <Card>
                <Steps current={currentStep} style={{ marginBottom: 40 }}>
                    {steps.map((item, index) => (
                        <Step key={item.title} title={item.title} />
                    ))}
                </Steps>
                <div className="steps-content" style={{ minHeight: 300 }}>
                    {steps[currentStep].content}
                </div>
            </Card>
        </div>
    );
}
