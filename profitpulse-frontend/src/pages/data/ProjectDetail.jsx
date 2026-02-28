import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Typography, Spin, Row, Col, Descriptions, Button, Tag, Avatar, Space, Statistic, Divider, Progress } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../../api/axiosInstance';
import { ArrowLeft, Briefcase, User, Calendar, IndianRupee, Target, Clock, TrendingUp } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';

const { Title, Text } = Typography;

export default function ProjectDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const { data: qData, isLoading } = useQuery({
        queryKey: ['project', id],
        queryFn: async () => {
            const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
            const [projRes, profRes, burnRes] = await Promise.all([
                axiosInstance.get(`/projects/${id}`),
                axiosInstance.get(`/projects/${id}/profitability?month=${currentMonth}`).catch(() => null),
                axiosInstance.get(`/projects/${id}/burn-rate`).catch(() => null)
            ]);

            return {
                project: projRes?.data || projRes,
                profitability: profRes?.data || profRes,
                burnRate: burnRes?.data || burnRes
            };
        }
    });

    if (isLoading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><Spin size="large" tip="Loading project intelligence..." /></div>;

    const { project, profitability, burnRate } = qData || {};

    if (!project) return (
        <div style={{ textAlign: 'center', marginTop: 100 }}>
            <Title level={3}>Project Not Found</Title>
            <Text type="secondary">The engagement you are looking for might have been closed or moved.</Text>
            <div style={{ marginTop: 24 }}>
                <Button type="primary" icon={<ArrowLeft size={16} />} onClick={() => navigate('/projects')}>Back to Projects</Button>
            </div>
        </div>
    );

    const burnPercent = burnRate?.total_budget > 0
        ? Math.round((burnRate.actual_cost_to_date / burnRate.total_budget) * 100)
        : 0;

    return (
        <div className="animate-fade-in-up">
            <div style={{ marginBottom: 24 }}>
                <Button
                    type="link"
                    icon={<ArrowLeft size={16} style={{ marginRight: 8 }} />}
                    onClick={() => navigate('/projects')}
                    style={{ padding: 0, display: 'flex', alignItems: 'center', marginBottom: 16 }}
                >
                    Return to Portfolio
                </Button>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                        <Avatar size={72} icon={<Briefcase size={36} />} style={{ backgroundColor: 'var(--color-primary-bg, #e6f7ff)', color: 'var(--color-primary-action, #1890ff)' }} />
                        <div>
                            <Title level={2} style={{ margin: 0 }}>{project.name}</Title>
                            <Space split={<Divider type="vertical" />}>
                                <Text type="secondary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Target size={14} /> {project.project_code}</Text>
                                <Text type="secondary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><User size={14} /> Client: {project.client?.name || 'Internal'}</Text>
                                <Tag bordered={false} color={project.status === 'active' ? 'success' : 'default'} style={{ margin: 0 }}>
                                    {project.status?.toUpperCase()}
                                </Tag>
                            </Space>
                        </div>
                    </div>
                </div>
            </div>

            <Row gutter={[24, 24]}>
                <Col xs={24} lg={16}>
                    <Card title="Project Performance Snapshot" bordered={false} className="premium-card" style={{ borderRadius: 16 }}>
                        <Row gutter={[32, 32]}>
                            <Col xs={24} sm={8}>
                                <Statistic title="Current P&L" value={profitability?.profit || 0} precision={0} prefix="₹" valueStyle={{ color: (profitability?.profit >= 0) ? 'var(--color-profit)' : 'var(--color-loss)' }} />
                            </Col>
                            <Col xs={24} sm={8}>
                                <Statistic title="Margin" value={profitability?.margin_percent || 0} suffix="%" valueStyle={{ color: (profitability?.margin_percent >= 25) ? 'var(--color-profit)' : 'var(--color-primary-action)' }} />
                            </Col>
                            <Col xs={24} sm={8}>
                                <Statistic title="Revenue Leakage" value={1.5} suffix="%" />
                            </Col>
                        </Row>

                        <Divider style={{ margin: '24px 0' }} />

                        <div style={{ marginBottom: 8 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <Text strong>Budget Consumption</Text>
                                <Text type="secondary">{burnPercent}% Utilized</Text>
                            </div>
                            <Progress
                                percent={burnPercent}
                                status={burnPercent > 90 ? 'exception' : 'active'}
                                strokeColor={burnPercent > 90 ? 'var(--color-loss)' : 'var(--color-primary-action)'}
                                showInfo={false}
                                strokeWidth={12}
                            />
                        </div>
                    </Card>

                    <Card title="Management Overview" bordered={false} className="premium-card" style={{ borderRadius: 16, marginTop: 24 }}>
                        <Descriptions column={{ xs: 1, sm: 2 }} colon={false}>
                            <Descriptions.Item label={<Space><User size={14} /> Manager</Space>}>{project.delivery_manager?.name}</Descriptions.Item>
                            <Descriptions.Item label={<Space><Calendar size={14} /> Start Date</Space>}>{formatDate(project.start_date)}</Descriptions.Item>
                            <Descriptions.Item label={<Space><TrendingUp size={14} /> Billing Type</Space>}>{project.project_type?.replace('_', ' ').toUpperCase()}</Descriptions.Item>
                            <Descriptions.Item label={<Space><IndianRupee size={14} /> Billing Rate</Space>}>{formatCurrency(project.billing_rate)} / hr</Descriptions.Item>
                        </Descriptions>
                    </Card>
                </Col>

                <Col xs={24} lg={8}>
                    <Card title="Budget Details" bordered={false} className="premium-card" style={{ borderRadius: 16 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            <Statistic title="Total Budget" value={burnRate?.total_budget ?? 0} prefix="₹" />
                            <Statistic title="Cost Incurred" value={burnRate?.actual_cost_to_date ?? 0} prefix="₹" valueStyle={{ color: 'var(--color-text-primary)' }} />
                            <Statistic
                                title="Budget Remaining"
                                value={burnRate?.budget_remaining ?? 0}
                                prefix="₹"
                                valueStyle={{ color: (burnRate?.budget_remaining > 0) ? 'var(--color-profit)' : 'var(--color-loss)' }}
                            />
                        </div>
                        <Divider style={{ margin: '20px 0' }} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 40, height: 40, borderRadius: 8, background: 'var(--color-page-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Clock size={20} color="var(--color-primary-action)" />
                            </div>
                            <div>
                                <Text type="secondary" size="small" style={{ display: 'block' }}>Project Age</Text>
                                <Text strong>{burnRate?.months_elapsed ?? 0} Months Active</Text>
                            </div>
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
}
