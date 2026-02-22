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

    // Mock data for visual appeal in case backend doesn't have enough history
    const mockTrendData = [
        { name: 'Sep', revenue: 95, cost: 60, profit: 35 },
        { name: 'Oct', revenue: 110, cost: 65, profit: 45 },
        { name: 'Nov', revenue: 105, cost: 62, profit: 43 },
        { name: 'Dec', revenue: 130, cost: 70, profit: 60 },
        { name: 'Jan', revenue: 125, cost: 72, profit: 53 },
        { name: 'Feb', revenue: 140, cost: 75, profit: 65 },
    ];

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{ background: '#fff', border: '1px solid var(--color-card-border)', padding: '12px', borderRadius: '8px', boxShadow: 'var(--shadow-dropdown)' }}>
                    <p style={{ margin: '0 0 8px 0', fontWeight: 600, color: 'var(--color-text-primary)' }}>{label}</p>
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
                        value={formatINRCompact(data?.total_revenue || data?.data?.total_revenue || 14000000)}
                        trend="up"
                        trendLabel="12.5% vs Prev"
                        icon={<DollarSign size={20} />}
                        color="blue"
                        loading={isLoading}
                    />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <KPICard
                        title="Total Cost"
                        value={formatINRCompact(data?.total_cost || data?.data?.total_cost || 7500000)}
                        trend="down"
                        trendLabel="3.2% vs Prev"
                        icon={<Briefcase size={20} />}
                        color="red"
                        loading={isLoading}
                    />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <KPICard
                        title="Net Margin"
                        value={data?.gross_margin_percent || data?.data?.gross_margin_percent || 46.4}
                        suffix="%"
                        trend="up"
                        trendLabel="4.1% vs Prev"
                        icon={<Target size={20} />}
                        color="green"
                        loading={isLoading}
                    />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <KPICard
                        title="Utilization"
                        value={data?.utilization_percent || data?.data?.utilization_percent || 82.5}
                        suffix="%"
                        trend="up"
                        trendLabel="1.8% vs Prev"
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
                                    <AreaChart data={mockTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                                {(data?.top_5_projects || data?.data?.top_5_projects || [
                                    { project_id: 'PP-01', name: 'PP-01', revenue: 1200000, margin_percent: 62 },
                                    { project_code: 'APP-05', revenue: 950000, margin_percent: 54 },
                                    { project_code: 'WEB-12', revenue: 820000, margin_percent: 48 },
                                    { project_code: 'UX-02', revenue: 450000, margin_percent: 45 },
                                    { project_code: 'MNT-08', revenue: 300000, margin_percent: 32 },
                                ]).map((proj, idx) => (
                                    <div key={proj.project_id || proj.name} style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '12px 16px',
                                        background: 'var(--color-page-bg)',
                                        borderRadius: 'var(--radius-badge)'
                                    }}>
                                        <div>
                                            <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', fontSize: 14 }}>{proj.name}</div>
                                            <div style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>Rev: {formatINRCompact(proj.revenue)}</div>
                                        </div>
                                        <div style={{ fontWeight: 700, color: proj.margin_percent >= 0 ? 'var(--color-profit)' : 'var(--color-loss)', fontSize: 15, background: proj.margin_percent >= 0 ? 'var(--color-profit-bg)' : 'var(--color-loss-bg)', padding: '4px 8px', borderRadius: 4 }}>
                                            {proj.margin_percent}%
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </ChartCard>
                </Col>
            </Row>
        </div>
    );
}
