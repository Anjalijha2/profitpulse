import React, { useState } from 'react';
import { Card, Typography, Upload, Button, message, Select, DatePicker, Steps, Space, Table, Row, Col, Spin } from 'antd';
import { UploadCloud, FileText, Users, IndianRupee, Download, CheckCircle2, AlertCircle, FileSpreadsheet } from 'lucide-react';
import { CheckCircleOutlined } from '@ant-design/icons';
import { axiosInstance } from '../../api/axiosInstance';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;
const { Dragger } = Upload;

const UPLOAD_TYPES_CONFIG = [
    { key: 'employees', label: 'Employee Data', icon: <Users size={32} />, desc: 'Onboard new staff or update designations and CTC.' },
    { key: 'timesheets', label: 'Timesheet Data', icon: <FileText size={32} />, desc: 'Bulk upload project hours for billing and cost tracking.' },
    { key: 'revenue', label: 'Revenue Records', icon: <IndianRupee size={32} />, desc: 'Actual revenue realized per project per month.' },
];

export default function UploadCenter() {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(0);
    const [uploadType, setUploadType] = useState('employees');
    const [financialYear, setFinancialYear] = useState('2024-2025');
    const [selectedMonth, setSelectedMonth] = useState(dayjs());
    const [file, setFile] = useState(null);
    const [validationErrors, setValidationErrors] = useState([]);
    const [validationState, setValidationState] = useState('idle'); // 'idle' | 'validating' | 'errors' | 'valid'
    const [uploading, setUploading] = useState(false);
    const [successData, setSuccessData] = useState(null);

    const uploadTypeLabel = UPLOAD_TYPES_CONFIG.find(t => t.key === uploadType)?.label || uploadType;

    // ── Bug Fix 2: use blob directly (axiosInstance interceptor already returns response.data = Blob)
    const handleDownloadTemplate = async () => {
        try {
            const blob = await axiosInstance.get(`/uploads/template/${uploadType}`, { responseType: 'blob' });
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.setAttribute('download', `${uploadType}_template.xlsx`);
            document.body.appendChild(link);
            link.click();
            setTimeout(() => {
                document.body.removeChild(link);
                window.URL.revokeObjectURL(downloadUrl);
            }, 100);
        } catch (error) {
            message.error('Failed to download template. Please try again.');
        }
    };

    // ── Bug Fix 1: pass file directly to avoid stale closure; append upload_type to FormData
    const handleValidateWithFile = async (fileToValidate) => {
        setValidationState('validating');
        const formData = new FormData();
        formData.append('file', fileToValidate);
        formData.append('upload_type', uploadType);
        if (uploadType === 'employees') {
            formData.append('financialYear', financialYear);
        } else {
            formData.append('month', selectedMonth.format('YYYY-MM'));
        }
        try {
            const res = await axiosInstance.post('/uploads/validate', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const data = res.data || res;
            const errors = data?.errors || [];
            if (errors.length > 0) {
                // Normalize to always have {row, field, message}
                const normalized = errors.map(e => ({
                    row: e.row ?? 'All',
                    field: e.field || '-',
                    message: e.message || 'Invalid value'
                }));
                setValidationErrors(normalized);
                setValidationState('errors');
            } else {
                setValidationErrors([]);
                setValidationState('valid');
            }
        } catch (err) {
            // Show actual backend message if available
            const errMsg = err?.message || err?.response?.data?.message || 'Validation failed. Check your file format and try again.';
            setValidationErrors([{
                row: 'All',
                field: 'File Format',
                message: errMsg
            }]);
            setValidationState('errors');
        }
    };

    const handleFileSelect = (f) => {
        setFile(f);
        setValidationErrors([]);
        setValidationState('idle');
        handleValidateWithFile(f);
    };

    const handleUpload = async () => {
        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        if (uploadType === 'employees') {
            formData.append('financialYear', financialYear);
        } else {
            formData.append('month', selectedMonth.format('YYYY-MM'));
        }
        try {
            const res = await axiosInstance.post(`/uploads/${uploadType}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const data = res.data || res;
            setSuccessData(data?.data || data);
            setCurrentStep(2);
        } catch (error) {
            message.error('Upload failed. Please try again.');
            setValidationErrors([{
                row: 'System',
                message: error.response?.data?.message || 'Database transaction failed. Please try again.'
            }]);
            setValidationState('errors');
        } finally {
            setUploading(false);
        }
    };

    const resetFlow = () => {
        setFile(null);
        setValidationErrors([]);
        setSuccessData(null);
        setValidationState('idle');
        setCurrentStep(0);
    };

    // ── Step 0: Choose Data Type
    const Step0Content = (
        <div style={{ padding: '24px 0' }}>
            <Row gutter={[24, 24]}>
                {UPLOAD_TYPES_CONFIG.map(item => (
                    <Col span={8} key={item.key}>
                        <Card
                            hoverable
                            onClick={() => setUploadType(item.key)}
                            style={{
                                textAlign: 'center',
                                borderRadius: 12,
                                cursor: 'pointer',
                                border: uploadType === item.key
                                    ? '2px solid var(--color-primary-action)'
                                    : '1px solid var(--color-card-border)',
                                background: uploadType === item.key
                                    ? 'var(--color-primary-bg)'
                                    : 'transparent',
                                transition: 'all 0.2s ease',
                            }}
                        >
                            <div style={{
                                color: uploadType === item.key ? 'var(--color-primary-action)' : 'var(--color-text-muted)',
                                marginBottom: 12,
                                display: 'flex',
                                justifyContent: 'center',
                            }}>
                                {item.icon}
                            </div>
                            <Title level={5} style={{ margin: 0 }}>{item.label}</Title>
                            <Text type="secondary" style={{ fontSize: 12 }}>{item.desc}</Text>
                        </Card>
                    </Col>
                ))}
            </Row>

            <div style={{
                marginTop: 40,
                background: 'var(--color-page-bg)',
                padding: 32,
                borderRadius: 16,
                textAlign: 'center',
            }}>
                <Title level={5} style={{ marginBottom: 20 }}>Configure your upload</Title>
                <Space direction="vertical" size="middle" style={{ width: 300 }}>
                    {uploadType === 'employees' && (
                        <div style={{ textAlign: 'left' }}>
                            <Text strong style={{ display: 'block', marginBottom: 8 }}>Financial Year</Text>
                            <Select
                                value={financialYear}
                                onChange={setFinancialYear}
                                style={{ width: '100%' }}
                                size="large"
                            >
                                <Select.Option value="2024-2025">FY 2024 – 2025</Select.Option>
                                <Select.Option value="2025-2026">FY 2025 – 2026</Select.Option>
                            </Select>
                        </div>
                    )}
                    {(uploadType === 'timesheets' || uploadType === 'revenue') && (
                        <div style={{ textAlign: 'left' }}>
                            <Text strong style={{ display: 'block', marginBottom: 8 }}>Reporting Month</Text>
                            <DatePicker
                                picker="month"
                                value={selectedMonth}
                                onChange={(d) => d && setSelectedMonth(d)}
                                style={{ width: '100%' }}
                                size="large"
                            />
                        </div>
                    )}
                    <Button
                        type="primary"
                        size="large"
                        block
                        onClick={() => setCurrentStep(1)}
                    >
                        Next: Upload File
                    </Button>
                </Space>
            </div>
        </div>
    );

    // ── Template download card (reused in Step 1)
    const TemplateCard = (
        <Card
            bordered={false}
            style={{ background: 'var(--color-page-bg)', borderRadius: 12, marginBottom: 24 }}
        >
            <Space align="start" size="large">
                <FileSpreadsheet size={36} color="var(--color-primary-action)" style={{ flexShrink: 0 }} />
                <div>
                    <Text strong style={{ fontSize: 15 }}>Need the template?</Text>
                    <p style={{ margin: '4px 0 8px' }}>
                        <Text type="secondary" style={{ fontSize: 13 }}>
                            Download the required Excel format for {uploadTypeLabel}.
                        </Text>
                    </p>
                    <Button
                        icon={<Download size={14} />}
                        onClick={handleDownloadTemplate}
                        type="link"
                        style={{ padding: 0, fontSize: 13 }}
                    >
                        Download {uploadType}_template.xlsx
                    </Button>
                </div>
            </Space>
        </Card>
    );

    // ── Step 1: Upload File (inline validation states)
    const Step1Content = (
        <div style={{ maxWidth: 640, margin: '24px auto 0' }}>
            {TemplateCard}

            {/* IDLE / VALIDATING — show dragger */}
            {(validationState === 'idle' || validationState === 'validating') && (
                <Dragger
                    beforeUpload={(f) => { handleFileSelect(f); return false; }}
                    maxCount={1}
                    showUploadList={false}
                    disabled={validationState === 'validating'}
                    style={{
                        background: 'var(--color-card-bg)',
                        borderRadius: 16,
                        border: '2px dashed var(--color-card-border)',
                        opacity: validationState === 'validating' ? 0.7 : 1,
                    }}
                >
                    <div style={{ padding: '32px 0' }}>
                        {validationState === 'validating' ? (
                            <>
                                <Spin size="large" style={{ marginBottom: 16 }} />
                                <Title level={4} style={{ marginTop: 16 }}>Checking for errors...</Title>
                                <Text type="secondary">{file?.name}</Text>
                            </>
                        ) : (
                            <>
                                <div style={{ color: 'var(--color-primary-action)', marginBottom: 8, display: 'flex', justifyContent: 'center' }}>
                                    <UploadCloud size={52} />
                                </div>
                                <Title level={4} style={{ marginBottom: 4 }}>Drop your file here</Title>
                                <Text type="secondary">Excel files (.xlsx or .csv) · Max 10 MB</Text>
                            </>
                        )}
                    </div>
                </Dragger>
            )}

            {/* ERRORS — show error table + retry dragger */}
            {validationState === 'errors' && (
                <div>
                    {/* Error Summary Banner */}
                    <div style={{
                        background: 'rgba(244, 63, 94, 0.08)',
                        border: '1px solid var(--color-loss)',
                        borderRadius: 12,
                        padding: '16px 20px',
                        marginBottom: 16,
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 12,
                    }}>
                        <AlertCircle color="var(--color-loss)" size={22} style={{ flexShrink: 0, marginTop: 2 }} />
                        <div style={{ flex: 1 }}>
                            <Text strong style={{ color: 'var(--color-loss)', display: 'block', fontSize: 15 }}>
                                Found {validationErrors.length} issue{validationErrors.length !== 1 ? 's' : ''} in <span style={{ fontStyle: 'italic' }}>{file?.name}</span>
                            </Text>
                            <Text style={{ color: 'var(--color-text-secondary)', fontSize: 13 }}>
                                Fix the rows shown below in your Excel file, then re-upload below.
                            </Text>
                        </div>
                    </div>

                    {/* How to Fix Tip */}
                    <div style={{
                        background: 'rgba(251, 191, 36, 0.07)',
                        border: '1px solid rgba(251, 191, 36, 0.3)',
                        borderRadius: 8,
                        padding: '10px 16px',
                        marginBottom: 16,
                        display: 'flex',
                        gap: 10,
                        alignItems: 'flex-start'
                    }}>
                        <span style={{ fontSize: 16 }}>💡</span>
                        <Text style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                            <strong>Tip:</strong> Row numbers match your Excel sheet rows (Row 2 = first data row after the header).
                            Use <strong>Ctrl + G</strong> in Excel to jump to a specific row.
                            Download the template again to see the <strong>📋 Instructions</strong> tab for allowed values.
                        </Text>
                    </div>

                    {/* Error Table */}
                    <Table
                        dataSource={validationErrors}
                        rowKey={(_, i) => i}
                        size="small"
                        columns={[
                            {
                                title: 'Row #',
                                dataIndex: 'row',
                                width: 90,
                                align: 'center',
                                render: (v) => (
                                    <span style={{
                                        background: 'rgba(244, 63, 94, 0.15)',
                                        color: 'var(--color-loss)',
                                        padding: '2px 8px',
                                        borderRadius: 4,
                                        fontWeight: 600,
                                        fontSize: 12,
                                        fontFamily: 'monospace'
                                    }}>
                                        Row {v}
                                    </span>
                                ),
                            },
                            {
                                title: 'Column / Field',
                                dataIndex: 'field',
                                width: 200,
                                render: (v) => v ? (
                                    <span style={{
                                        background: 'rgba(129, 140, 248, 0.12)',
                                        color: '#818CF8',
                                        padding: '2px 8px',
                                        borderRadius: 4,
                                        fontSize: 12,
                                        fontFamily: 'monospace'
                                    }}>
                                        {v}
                                    </span>
                                ) : <Text type="secondary">—</Text>
                            },
                            {
                                title: '⚠️ Issue / Error',
                                dataIndex: 'message',
                                render: (v) => <Text style={{ color: 'var(--color-loss)', fontSize: 13 }}>{v}</Text>
                            },
                        ]}
                        pagination={{ pageSize: 8, size: 'small' }}
                        style={{ marginBottom: 20, borderRadius: 8, overflow: 'hidden' }}
                    />

                    {/* Re-upload zone */}
                    <Dragger
                        beforeUpload={(f) => { handleFileSelect(f); return false; }}
                        maxCount={1}
                        showUploadList={false}
                        style={{
                            background: 'rgba(34, 211, 238, 0.04)',
                            borderRadius: 12,
                            border: '2px dashed rgba(34, 211, 238, 0.3)',
                        }}
                    >
                        <div style={{ padding: '20px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                            <UploadCloud size={22} color="var(--color-primary-action)" />
                            <div>
                                <Text strong style={{ fontSize: 14 }}>Drop your corrected file here</Text>
                                <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>or click to browse — .xlsx files only</Text>
                            </div>
                        </div>
                    </Dragger>
                </div>
            )}

            {/* VALID — green banner + upload button */}
            {validationState === 'valid' && (
                <div style={{
                    background: 'var(--color-profit-bg)',
                    border: '1px solid var(--color-profit)',
                    borderRadius: 16,
                    padding: '40px 32px',
                    textAlign: 'center',
                }}>
                    <CheckCircle2
                        size={56}
                        color="var(--color-profit)"
                        style={{ marginBottom: 16, display: 'block', margin: '0 auto 16px' }}
                    />
                    <Title level={4} style={{ color: 'var(--color-profit)', marginBottom: 8 }}>
                        No errors found
                    </Title>
                    <Text style={{ color: 'var(--color-text-secondary)', display: 'block', marginBottom: 28 }}>
                        <strong>{file?.name}</strong> is ready to save.
                    </Text>
                    <Space direction="vertical" size="middle" style={{ width: '100%', maxWidth: 280, margin: '0 auto' }}>
                        <Button
                            type="primary"
                            size="large"
                            block
                            loading={uploading}
                            icon={<CheckCircleOutlined />}
                            onClick={handleUpload}
                        >
                            {uploading ? 'Saving...' : 'Save to Database'}
                        </Button>
                        <Button
                            type="link"
                            onClick={() => { setFile(null); setValidationState('idle'); }}
                            style={{ color: 'var(--color-text-muted)' }}
                        >
                            Upload a different file
                        </Button>
                    </Space>
                </div>
            )}

            <Button
                onClick={() => { setCurrentStep(0); setFile(null); setValidationState('idle'); setValidationErrors([]); }}
                style={{ marginTop: 24 }}
            >
                Back to Data Type
            </Button>
        </div>
    );

    // ── Step 2: Done
    const Step2Content = (
        <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <CheckCircle2
                size={72}
                color="var(--color-profit)"
                style={{ display: 'block', margin: '0 auto 20px' }}
            />
            <Title level={3} style={{ color: 'var(--color-profit)', marginBottom: 8 }}>
                Upload Complete
            </Title>
            <Text style={{ color: 'var(--color-text-secondary)', fontSize: 15 }}>
                Your {uploadTypeLabel} data for{' '}
                {uploadType === 'employees' ? financialYear : selectedMonth.format('MMMM YYYY')}{' '}
                has been saved.
            </Text>

            <Row gutter={[16, 16]} style={{ maxWidth: 480, margin: '36px auto' }}>
                <Col span={8}>
                    <Card
                        bordered={false}
                        style={{ background: 'var(--color-page-bg)', borderRadius: 12, textAlign: 'center' }}
                    >
                        <Text className="kpi-label" style={{ display: 'block', marginBottom: 6 }}>Total Rows</Text>
                        <div className="kpi-large-number" style={{ color: 'var(--color-text-primary)', fontSize: 28 }}>
                            {successData?.total_rows ?? '—'}
                        </div>
                    </Card>
                </Col>
                <Col span={8}>
                    <Card
                        bordered={false}
                        style={{ background: 'var(--color-profit-bg)', borderRadius: 12, textAlign: 'center' }}
                    >
                        <Text className="kpi-label" style={{ display: 'block', marginBottom: 6, color: 'var(--color-profit)' }}>Saved</Text>
                        <div className="kpi-large-number" style={{ color: 'var(--color-profit)', fontSize: 28 }}>
                            {successData?.success_rows ?? '—'}
                        </div>
                    </Card>
                </Col>
                <Col span={8}>
                    <Card
                        bordered={false}
                        style={{
                            background: (successData?.error_rows > 0) ? 'var(--color-loss-bg)' : 'var(--color-page-bg)',
                            borderRadius: 12,
                            textAlign: 'center',
                        }}
                    >
                        <Text
                            className="kpi-label"
                            style={{
                                display: 'block',
                                marginBottom: 6,
                                color: (successData?.error_rows > 0) ? 'var(--color-loss)' : 'var(--color-text-muted)',
                            }}
                        >
                            Skipped
                        </Text>
                        <div
                            className="kpi-large-number"
                            style={{
                                color: (successData?.error_rows > 0) ? 'var(--color-loss)' : 'var(--color-text-muted)',
                                fontSize: 28,
                            }}
                        >
                            {successData?.error_rows ?? '—'}
                        </div>
                    </Card>
                </Col>
            </Row>

            <Space size="middle">
                <Button type="primary" size="large" onClick={resetFlow}>
                    Upload Another File
                </Button>
                <Button size="large" onClick={() => navigate('/')}>
                    Go to Dashboard
                </Button>
            </Space>
        </div>
    );

    const steps = [
        { title: 'Choose Data Type', content: Step0Content },
        { title: 'Upload File', content: Step1Content },
        { title: 'Done', content: Step2Content },
    ];

    return (
        <div className="animate-fade-in-up">
            <div style={{ marginBottom: 32 }}>
                <Title level={2} className="page-title" style={{ margin: 0 }}>Upload Center</Title>
                <Text className="text-caption">Bulk upload employee, timesheet, and revenue data.</Text>
            </div>

            <Card
                bordered={false}
                className="premium-card"
                style={{ borderRadius: 16, boxShadow: 'var(--shadow-card-default)' }}
            >
                <Steps
                    current={currentStep}
                    style={{ marginBottom: 40, borderBottom: '1px solid var(--color-card-border)', paddingBottom: 24 }}
                    size="small"
                    items={steps.map(s => ({ title: s.title }))}
                />
                <div style={{ minHeight: 400 }}>
                    {steps[currentStep].content}
                </div>
            </Card>
        </div>
    );
}
