import { Row, Col, Typography, Card, Skeleton, Select, DatePicker } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';
import { DollarSign, Briefcase, Users, Target } from 'lucide-react';
import KPICard from '../../components/common/KPICard';
import ChartCard from '../../components/common/ChartCard';
import { axiosInstance } from '../../api/axiosInstance';
import { useUiStore } from '../../store/uiStore';
import { formatINRCompact } from '../../utils/formatters';

const { Title, Text } = Typography;

export default function ExecutiveDashboard() {
    const { selectedMonth, setSelectedMonth } = useUiStore();

    const monthStr = selectedMonth.format('YYYY-MM');
    const [yearStr, monthNumStr] = monthStr.split('-');

    const { data, isLoading } = useQuery({
        queryKey: ['executiveDashboard', monthStr],
        queryFn: async () => {
            const res = await axiosInstance.get('/dashboard/executive', {
                params: { month: monthNumStr, year: yearStr }
            });
            return res.data;
        }
    });


    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{ background: 'rgba(11, 20, 48, 0.95)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)', padding: '12px', borderRadius: '10px', boxShadow: 'var(--shadow-dropdown)' }}>
                    <p style={{ margin: '0 0 8px 0', fontWeight: 600, color: '#FFFFFF' }}>{label}</p>
                    {payload.map(p => (
                        <p key={p.dataKey} style={{ margin: 0, color: p.color, fontWeight: 500, fontSize: 13 }}>
                            {p.name}: {p.dataKey === 'profit' || p.dataKey === 'revenue' || p.dataKey === 'cost' ? '₹' + p.value + 'L' : p.value}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="animate-fade-in-up">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
                <div>
                    <Title level={2} className="page-title" style={{ color: 'var(--color-text-primary)' }}>
                        Executive Overview
                    </Title>
                    <Text className="text-caption" style={{ fontSize: 14 }}>
                        Top-level financial intelligence across the organization.
                    </Text>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                    <DatePicker
                        picker="month"
                        value={selectedMonth}
                        onChange={(d) => d && setSelectedMonth(d)}
                        style={{ width: 160 }}
                    />
                </div>
            </div>

            <Row gutter={[24, 24]}>
                <Col xs={24} sm={12} lg={6}>
                    <KPICard
                        title="Total Revenue"
                        value={formatINRCompact(data?.total_revenue ?? 0)}
                        trend={data?.total_revenue > 0 ? 'up' : null}
                        trendLabel={data?.total_revenue > 0 ? '12.5% vs Prev' : null}
                        icon={<DollarSign size={20} />}
                        color="blue"
                        loading={isLoading}
                    />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <KPICard
                        title="Total Cost"
                        value={formatINRCompact(data?.total_cost ?? 0)}
                        trend={data?.total_cost > 0 ? 'down' : null}
                        trendLabel={data?.total_cost > 0 ? '3.2% vs Prev' : null}
                        icon={<Briefcase size={20} />}
                        color="red"
                        loading={isLoading}
                    />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <KPICard
                        title="Net Margin"
                        value={data?.gross_margin_percent ?? 0}
                        suffix="%"
                        trend={data?.gross_margin_percent > 0 ? 'up' : null}
                        trendLabel={data?.gross_margin_percent > 0 ? '4.1% vs Prev' : null}
                        icon={<Target size={20} />}
                        color="green"
                        loading={isLoading}
                    />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <KPICard
                        title="Utilization"
                        value={data?.utilization_percent ?? 0}
                        suffix="%"
                        trend={data?.utilization_percent > 0 ? 'up' : null}
                        trendLabel={data?.utilization_percent > 0 ? '1.8% vs Prev' : null}
                        icon={<Users size={20} />}
                        color="blue"
                        loading={isLoading}
                    />
                </Col>
            </Row>

            <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
                <Col xs={24} lg={16}>
                    <ChartCard title="Monthly Profitability Trend">
                        {isLoading ? <Skeleton active /> : (
                            <div style={{ height: 320 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={data?.trend || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="var(--color-profit)" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="var(--color-profit)" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-card-border)" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }} tickFormatter={(val) => `₹${val}L`} />
                                        <RechartsTooltip content={<CustomTooltip />} />
                                        <Area type="monotone" dataKey="profit" name="Profit" stroke="var(--color-profit)" strokeWidth={3} fillOpacity={1} fill="url(#colorProfit)" />
                                        <Area type="monotone" dataKey="revenue" name="Revenue" stroke="var(--color-primary-action)" strokeWidth={2} fill="none" />
                                        <Area type="monotone" dataKey="cost" name="Cost" stroke="var(--color-loss)" strokeWidth={2} fill="none" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </ChartCard>
                </Col>

                <Col xs={24} lg={8}>
                    <ChartCard title="Top Projects by Margin">
                        {isLoading ? <Skeleton active /> : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                {(data?.top_5_projects || []).length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-text-muted)' }}>
                                        No project data for selected month.
                                    </div>
                                ) : (
                                    (data.top_5_projects).map((proj) => (
                                        <div key={proj.project_id} style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '12px 16px',
                                            background: 'var(--color-page-bg)',
                                            borderRadius: 'var(--radius-badge)'
                                        }}>
                                            <div>
                                                <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', fontSize: 14 }}>{proj.name}</div>
                                                <div style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>Rev: {formatINRCompact(proj.total_revenue)}</div>
                                            </div>
                                            <div style={{ fontWeight: 700, color: proj.margin_percent >= 0 ? 'var(--color-profit)' : 'var(--color-loss)', fontSize: 15, background: proj.margin_percent >= 0 ? 'var(--color-profit-bg)' : 'var(--color-loss-bg)', padding: '4px 8px', borderRadius: 4 }}>
                                                {proj.margin_percent}%
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </ChartCard>
                </Col>
            </Row>
        </div>
    );
}
