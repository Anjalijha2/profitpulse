import React from 'react';
import { Card, Typography, Table, Tag } from 'antd';
import { ShieldAlert } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../../api/axiosInstance';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

export default function AuditLog() {
    const { data: qData, isLoading } = useQuery({
        queryKey: ['auditLogs'],
        queryFn: async () => {
            const res = await axiosInstance.get('/uploads/logs');
            return res.data;
        }
    });

    const columns = [
        { title: 'TIMESTAMP', dataIndex: 'createdAt', key: 'createdAt', render: (t) => dayjs(t).format('YYYY-MM-DD HH:mm') },
        { title: 'USER', dataIndex: 'uploaded_by', key: 'uploaded_by', render: (t, record) => <span style={{ fontWeight: 600 }}>{record?.uploader?.name || t}</span> },
        { title: 'ACTION', dataIndex: 'upload_type', key: 'upload_type', render: (a) => <Tag color="blue">{a?.toUpperCase() || 'UNKNOWN'} UPLOAD</Tag> },
        { title: 'FILE NAME', dataIndex: 'file_name', key: 'file_name' },
        { title: 'STATUS', dataIndex: 'status', key: 'status', render: (s) => <Tag color={s === 'completed' ? 'success' : 'error'}>{s?.toUpperCase()}</Tag> },
        { title: 'DETAILS', dataIndex: 'summary', key: 'summary', render: (s) => s ? JSON.stringify(s) : '-' },
    ];

    const data = qData?.logs || qData?.data?.logs || [];

    return (
        <div className="animate-fade-in-up">
            <div style={{ marginBottom: 32 }}>
                <Title level={2} className="page-title" style={{ margin: 0, color: 'var(--color-text-primary)' }}>
                    Audit Log
                </Title>
                <Text className="text-caption" style={{ fontSize: 14 }}>
                    Immutable record of system changes and uploads.
                </Text>
            </div>

            <Card bordered={false} style={{ borderRadius: 'var(--radius-card)', boxShadow: 'var(--shadow-card-default)' }}>
                <Table columns={columns} dataSource={data} rowKey="id" pagination={{ pageSize: 15 }} loading={isLoading} scroll={{ x: true }} />
            </Card>
        </div>
    );
}
