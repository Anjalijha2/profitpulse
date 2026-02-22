import React, { useState } from 'react';
import { Card, Typography, Upload, Button, message, Select, DatePicker, Steps, Result, Space, Table, Row, Col, Divider } from 'antd';
import { UploadCloud, FileText, Users, DollarSign, Download, ArrowRight, CheckCircle2, AlertCircle, FileSpreadsheet } from 'lucide-react';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
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
            const blob = await axiosInstance.get(`/uploads/template/${uploadType}`, {
                responseType: 'blob'
            });

            // Create a Blob from the response data if it's not already one (Axios returns the blob directly if responseType is blob)
            const downloadUrl = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.setAttribute('download', `${uploadType}_template.xlsx`);
            document.body.appendChild(link);
            link.click();

            // Clean up
            setTimeout(() => {
                document.body.removeChild(link);
                window.URL.revokeObjectURL(downloadUrl);
            }, 100);
        } catch (error) {
            console.error('Download error:', error);
            message.error('Failed to download template. Please try again.');
        }
    };

    const handleFileSelect = (info) => {
        setFile(info.file);
        message.success(`${info.file.name} selected successfully.`);
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
            const data = res.data?.data || res.data;
            if (data?.errors && data.errors.length > 0) {
                setValidationErrors(data.errors);
                setCurrentStep(3); // Show Errors
            } else {
                setValidationErrors([]);
                setCurrentStep(4); // Confirm
            }
        } catch (error) {
            console.error('Validation error:', error);
            message.error('Validation failed. Please check the file format.');
            setValidationErrors([{ row: 'All', message: error.response?.data?.message || 'Technical error during validation' }]);
            setCurrentStep(3);
        } finally {
            setUploading(false);
        }
    };

    const handleUpload = async () => {
        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        if (uploadType === 'employees') formData.append('financialYear', financialYear);
        if (uploadType === 'timesheets' || uploadType === 'revenue') formData.append('month', selectedMonth.format('YYYY-MM'));

        try {
            const res = await axiosInstance.post(`/uploads/${uploadType}`, formData);
            setSuccessData(res.data?.data || res.data);
            setCurrentStep(6); // Success
        } catch (error) {
            message.error('Final upload failed');
            setCurrentStep(3); // Show Errors
            setValidationErrors([{ row: 'System', message: error.response?.data?.message || 'Database transaction failed' }]);
        } finally {
            setUploading(false);
        }
    };

    const resetFlow = () => {
        setFile(null);
        setValidationErrors([]);
        setSuccessData(null);
        setCurrentStep(0);
    };

    const TypeSelection = () => (
        <div style={{ padding: '24px 0' }}>
            <Row gutter={[24, 24]}>
                {[
                    { key: 'employees', title: 'Employee Master', icon: <Users />, desc: 'Onboard new staff or update designations.' },
                    { key: 'timesheets', title: 'Timesheets', icon: <FileText />, desc: 'Bulk upload project hours for billing.' },
                    { key: 'revenue', title: 'Revenue Records', icon: <DollarSign />, desc: 'Actual revenue realized per month.' }
                ].map(item => (
                    <Col span={8} key={item.key}>
                        <Card
                            hoverable
                            onClick={() => setUploadType(item.key)}
                            className={uploadType === item.key ? 'selected-upload-card' : ''}
                            style={{
                                textAlign: 'center',
                                borderRadius: 12,
                                border: uploadType === item.key ? '2px solid var(--color-primary-action)' : '1px solid var(--color-card-border)',
                                background: uploadType === item.key ? 'var(--color-primary-bg)' : 'transparent'
                            }}
                        >
                            <div style={{ fontSize: 32, color: uploadType === item.key ? 'var(--color-primary-action)' : 'var(--color-text-muted)', marginBottom: 16 }}>
                                {item.icon}
                            </div>
                            <Title level={5} style={{ margin: 0 }}>{item.title}</Title>
                            <Text type="secondary" style={{ fontSize: 12 }}>{item.desc}</Text>
                        </Card>
                    </Col>
                ))}
            </Row>

            <div style={{ marginTop: 40, textAlign: 'center', background: 'var(--color-page-bg)', padding: 32, borderRadius: 16 }}>
                <Title level={5}>Selection Details</Title>
                <Space direction="vertical" size="middle" style={{ width: 300, marginTop: 16 }}>
                    {uploadType === 'employees' && (
                        <div>
                            <Text strong style={{ display: 'block', marginBottom: 8 }}>Fiscal Year</Text>
                            <Select value={financialYear} onChange={setFinancialYear} style={{ width: '100%' }}>
                                <Select.Option value="2024-2025">FY 2024 - 2025</Select.Option>
                                <Select.Option value="2025-2026">FY 2025 - 2026</Select.Option>
                            </Select>
                        </div>
                    )}
                    {(uploadType === 'timesheets' || uploadType === 'revenue') && (
                        <div>
                            <Text strong style={{ display: 'block', marginBottom: 8 }}>Reporting Period</Text>
                            <DatePicker picker="month" value={selectedMonth} onChange={(d) => d && setSelectedMonth(d)} style={{ width: '100%' }} />
                        </div>
                    )}
                    <Button type="primary" size="large" block onClick={() => setCurrentStep(1)} icon={<ArrowRight size={18} />}>
                        Next: Template & File
                    </Button>
                </Space>
            </div>
        </div>
    );

    const steps = [
        { title: 'Information Type', content: <TypeSelection /> },
        {
            title: 'File Upload', content: (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <div style={{ maxWidth: 600, margin: '0 auto' }}>
                        <Card bordered={false} style={{ background: 'var(--color-page-bg)', borderRadius: 16, marginBottom: 24 }}>
                            <Space align="start" size="large">
                                <FileSpreadsheet size={40} color="var(--color-primary-action)" />
                                <div style={{ textAlign: 'left' }}>
                                    <Text strong style={{ fontSize: 16 }}>Need the latest template?</Text>
                                    <p><Text type="secondary">Download the specific Excel structure required for {uploadType}.</Text></p>
                                    <Button icon={<Download size={16} />} onClick={handleDownloadTemplate} type="link" style={{ padding: 0 }}>
                                        Download {uploadType}_template.xlsx
                                    </Button>
                                </div>
                            </Space>
                        </Card>

                        <Dragger
                            beforeUpload={(f) => { handleFileSelect({ file: f }); return false; }}
                            maxCount={1}
                            showUploadList={false}
                            style={{ background: '#fff', borderRadius: 16, border: '2px dashed #d9d9d9' }}
                        >
                            <div style={{ padding: '24px 0' }}>
                                <p style={{ fontSize: 48, color: 'var(--color-primary-action)' }}><UploadCloud style={{ margin: '0 auto' }} /></p>
                                <Title level={4}>Drop your file here</Title>
                                <Text type="secondary">Excel files (.xlsx or .csv) supported. Maximum 50MB.</Text>
                            </div>
                        </Dragger>
                        <Button onClick={() => setCurrentStep(0)} style={{ marginTop: 24 }}>Back to Configuration</Button>
                    </div>
                </div>
            )
        },
        {
            title: 'Validation', content: (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <Result
                        icon={<FileText size={48} color="var(--color-primary-action)" style={{ margin: '0 auto' }} />}
                        title="File Ready for Inspection"
                        subTitle={`Target: ${uploadType.toUpperCase()} | File: ${file?.name}`}
                        extra={[
                            <Button type="primary" size="large" key="v" loading={uploading} onClick={handleValidate}>Execute Validation Scan</Button>,
                            <Button key="b" onClick={() => setCurrentStep(1)}>Cancel</Button>
                        ]}
                    />
                </div>
            )
        },
        {
            title: 'Review Errors', content: (
                <div style={{ padding: '20px 0' }}>
                    <div style={{ background: '#FFF1F0', border: '1px solid #FFA39E', padding: 24, borderRadius: 12, marginBottom: 24 }}>
                        <Title level={4} style={{ color: '#CF1322', margin: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
                            <AlertCircle color="#CF1322" /> Validation Incomplete
                        </Title>
                        <Text style={{ display: 'block', marginTop: 8 }}>Found {validationErrors.length} inconsistencies in your data file. Please fix these in your Excel and re-upload.</Text>
                    </div>
                    <Table
                        dataSource={validationErrors}
                        rowKey={(r, i) => i}
                        columns={[{ title: 'Row / Field', dataIndex: 'row', width: 120 }, { title: 'Issue Description', dataIndex: 'message' }]}
                        pagination={{ pageSize: 5 }}
                    />
                    <div style={{ marginTop: 24 }}>
                        <Button type="primary" onClick={() => setCurrentStep(1)}>Retry with New File</Button>
                    </div>
                </div>
            )
        },
        {
            title: 'Confirmation', content: (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <Result
                        status="success"
                        title="Data Integrity Verified"
                        subTitle="No errors found. The file is mapped correctly to the database schema."
                        extra={[
                            <Button type="primary" size="large" key="confirm" loading={uploading} onClick={handleUpload}>Commit to Database</Button>,
                            <Button key="back" onClick={() => setCurrentStep(1)}>Abort</Button>
                        ]}
                    />
                </div>
            )
        },
        {
            title: 'Commit', content: (
                <div style={{ textAlign: 'center', padding: '80px 0' }}>
                    <div className="custom-loader" style={{ marginBottom: 24 }}></div>
                    <Title level={4}>Syncing with Central Database...</Title>
                    <Text type="secondary">This may take a moment depending on the record count.</Text>
                </div>
            )
        },
        {
            title: 'Finished', content: (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <Result
                        status="success"
                        title="Database Sync Complete"
                        subTitle={`Successfully processed and archived ${uploadType} data for ${uploadType === 'employees' ? financialYear : selectedMonth.format('MMM YYYY')}.`}
                        extra={[
                            <Button type="primary" size="large" onClick={resetFlow} key="reset">Start New Batch</Button>,
                            <Button onClick={() => window.location.reload()} key="dash">View Dashboard Updates</Button>
                        ]}
                    />
                </div>
            )
        }
    ];

    return (
        <div className="animate-fade-in-up">
            <div style={{ marginBottom: 32 }}>
                <Title level={2} className="page-title" style={{ margin: 0 }}>Information Intake</Title>
                <Text className="text-caption">Centralized terminal for bulk uploading financial and workforce data.</Text>
            </div>

            <Card bordered={false} className="premium-card" style={{ borderRadius: 16, boxShadow: 'var(--shadow-card-default)' }}>
                <Steps
                    current={currentStep}
                    style={{ marginBottom: 40, borderBottom: '1px solid var(--color-card-border)', paddingBottom: 24 }}
                    size="small"
                >
                    {steps.map((item, index) => (
                        <Step key={item.title} title={item.title} />
                    ))}
                </Steps>
                <div className="steps-content" style={{ minHeight: 400 }}>
                    {steps[currentStep].content}
                </div>
            </Card>
        </div>
    );
}
