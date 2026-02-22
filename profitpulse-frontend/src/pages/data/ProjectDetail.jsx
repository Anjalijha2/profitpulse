import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Typography, Spin, Row, Col, Descriptions, Button } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../../api/axiosInstance';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { formatCurrency } from '../../utils/formatters';

export default function ProjectDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const { data: qData, isLoading } = useQuery({
        queryKey: ['project', id],
        queryFn: async () => {
            const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
            const [projRes, profRes, burnRes] = await Promise.all([
                axiosInstance.get(`/projects/${id}`),
                axiosInstance.get(`/projects/${id}/profitability?month=${currentMonth}`).catch(() => ({ data: { data: null } })),
                axiosInstance.get(`/projects/${id}/burn-rate`).catch(() => ({ data: { data: null } }))
            ]);
            return {
                project: projRes?.data || projRes || null,
                profitability: profRes?.data || profRes || null,
                burnRate: burnRes?.data || burnRes || null
            };
        }
    });

    if (isLoading) return <Spin style={{ display: 'block', margin: '100px auto' }} />;
    const { project, profitability, burnRate } = qData || {};

    if (!project) return <div>Project not found</div>;

    return (
        <div className="fade-in">
            <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} style={{ padding: 0, marginBottom: 16 }}>
                Back to Projects
            </Button>
            <Typography.Title level={2} className="page-title">{project.name}</Typography.Title>

            <Row gutter={[24, 24]}>
                <Col span={24}>
                    <Card title="Project Summary">
                        <Descriptions bordered column={{ xxl: 3, xl: 3, lg: 3, md: 2, sm: 1, xs: 1 }}>
                            <Descriptions.Item label="Code">{project.project_code}</Descriptions.Item>
                            <Descriptions.Item label="Client">{project.client?.name}</Descriptions.Item>
                            <Descriptions.Item label="Manager">{project.delivery_manager?.name}</Descriptions.Item>
                            <Descriptions.Item label="Type">{project.project_type}</Descriptions.Item>
                            <Descriptions.Item label="Status">{project.status}</Descriptions.Item>
                            <Descriptions.Item label="Billing Rate">{formatCurrency(project.billing_rate)}</Descriptions.Item>
                            <Descriptions.Item label="Start Date">{project.start_date || 'N/A'}</Descriptions.Item>
                        </Descriptions>
                    </Card>
                </Col>

                <Col span={12}>
                    <Card title="Profitability Metrics">
                        <Descriptions column={1}>
                            <Descriptions.Item label="Total Revenue">{formatCurrency(profitability?.total_revenue || 0)}</Descriptions.Item>
                            <Descriptions.Item label="Total Cost">{formatCurrency(profitability?.total_cost || 0)}</Descriptions.Item>
                            <Descriptions.Item label="Profit">{formatCurrency(profitability?.profit || 0)}</Descriptions.Item>
                            <Descriptions.Item label="Margin %">{profitability?.margin_percent || 0}%</Descriptions.Item>
                        </Descriptions>
                    </Card>
                </Col>

                <Col span={12}>
                    <Card title="Burn Rate & Hours">
                        <Descriptions column={1}>
                            <Descriptions.Item label="Total Hours Logged">{burnRate?.hours_consumed || 0}</Descriptions.Item>
                            <Descriptions.Item label="Total Cost Incurred">{formatCurrency(burnRate?.total_cost || 0)}</Descriptions.Item>
                        </Descriptions>
                    </Card>
                </Col>
            </Row>
        </div>
    );
}
