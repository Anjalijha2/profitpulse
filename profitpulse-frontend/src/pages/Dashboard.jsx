import { Row, Col, Typography, Card, Skeleton, Select, DatePicker } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import { DollarSign, Briefcase, Users, Target } from 'lucide-react';
import StatCard from '../components/StatCard';
import { apiClient } from '../api/client';
import dayjs from 'dayjs';
import { useState } from 'react';

const { Title, Text } = Typography;
const { Option } = Select;

export default function Dashboard() {
    const [date, setDate] = useState(dayjs());

    const monthStr = date.format('YYYY-MM');
    const [yearStr, monthNumStr] = monthStr.split('-');

    const { data, isLoading } = useQuery({
        queryKey: ['executiveDashboard', monthStr],
        queryFn: async () => {
            const res = await apiClient.get('/dashboard/executive', {
                params: { month: monthNumStr, year: yearStr }
            });
            return res.data;
        }
    });

    // Mock initial chart data for visuals if backend returns empty or limited data
    const mockRevenueData = [
        { name: 'Jan', value: 120000 },
        { name: 'Feb', value: 145000 },
        { name: 'Mar', value: 135000 },
        { name: 'Apr', value: 180000 },
        { name: 'May', value: 210000 },
        { name: 'Jun', value: data?.totalRevenue || 240000 },
    ];

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{ background: '#fff', border: '1px solid #e5e7eb', padding: '12px', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                    <p style={{ margin: 0, fontWeight: 600, color: '#111827' }}>{label}</p>
                    <p style={{ margin: 0, color: payload[0].color, fontWeight: 500 }}>
                        {payload[0].name}: ${payload[0].value.toLocaleString()}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                <div>
                    <Title level={2} style={{ margin: 0, fontWeight: 700, letterSpacing: '-0.02em', color: '#111827' }}>
                        Executive Overview
                    </Title>
                    <Text style={{ color: '#6b7280', fontSize: 16 }}>
                        Top-level financial intelligence across the organization.
                    </Text>
                </div>
                <div>
                    <DatePicker
                        picker="month"
                        value={date}
                        onChange={(d) => d && setDate(d)}
                        style={{ width: 180, borderRadius: 8, height: 40 }}
                    />
                </div>
            </div>

            <Row gutter={[24, 24]}>
                <Col xs={24} sm={12} lg={6}>
                    <StatCard
                        title="Total Revenue"
                        value={data?.totalRevenue || 0}
                        prefix="$"
                        trend="up"
                        trendValue="12.5"
                        icon={<DollarSign size={20} />}
                        loading={isLoading}
                    />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <StatCard
                        title="Total Cost"
                        value={data?.totalCost || 0}
                        prefix="$"
                        trend="down"
                        trendValue="3.2"
                        icon={<Briefcase size={20} />}
                        loading={isLoading}
                    />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <StatCard
                        title="Net Margin"
                        value={data?.overallMarginPercent || 0}
                        suffix="%"
                        trend="up"
                        trendValue="4.1"
                        icon={<Target size={20} />}
                        loading={isLoading}
                    />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <StatCard
                        title="Overall Utilization"
                        value={data?.overallUtilizationPercent || 0}
                        suffix="%"
                        trend="up"
                        trendValue="1.8"
                        icon={<Users size={20} />}
                        loading={isLoading}
                    />
                </Col>
            </Row>

            <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
                <Col xs={24} lg={16}>
                    <Card
                        title={<span style={{ fontWeight: 600 }}>Revenue Trends (YTD)</span>}
                        bordered={true}
                        style={{ borderRadius: 12, height: '100%', borderColor: '#f3f4f6' }}
                        headStyle={{ borderBottom: '1px solid #f3f4f6', padding: '16px 24px' }}
                        bodyStyle={{ padding: 24 }}
                    >
                        {isLoading ? <Skeleton active /> : (
                            <div style={{ height: 350 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={mockRevenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} tickFormatter={(val) => `$${val / 1000}k`} />
                                        <RechartsTooltip content={<CustomTooltip />} />
                                        <Area type="monotone" dataKey="value" name="Revenue" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </Card>
                </Col>

                <Col xs={24} lg={8}>
                    <Card
                        title={<span style={{ fontWeight: 600 }}>Top Projects by Margin</span>}
                        bordered={true}
                        style={{ borderRadius: 12, height: '100%', borderColor: '#f3f4f6' }}
                        headStyle={{ borderBottom: '1px solid #f3f4f6', padding: '16px 24px' }}
                        bodyStyle={{ padding: 0 }}
                    >
                        {isLoading ? <div style={{ padding: 24 }}><Skeleton active /></div> : (
                            <div>
                                {(data?.top5ProjectsByMargin || []).map((proj, idx) => (
                                    <div key={proj.project_code} style={{
                                        padding: '16px 24px',
                                        borderBottom: idx === (data?.top5ProjectsByMargin?.length - 1) ? 'none' : '1px solid #f3f4f6',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <div>
                                            <div style={{ fontWeight: 600, color: '#111827', fontSize: 14 }}>{proj.project_code}</div>
                                            <div style={{ color: '#6b7280', fontSize: 13 }}>Rev: ${(proj.revenue || 0).toLocaleString()}</div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontWeight: 700, color: proj.margin_percent >= 0 ? '#10b981' : '#ef4444', fontSize: 15 }}>
                                                {proj.margin_percent}%
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {(!data?.top5ProjectsByMargin || data.top5ProjectsByMargin.length === 0) && (
                                    <div style={{ padding: 32, textAlign: 'center', color: '#6b7280' }}>
                                        No project data available for this period.
                                    </div>
                                )}
                            </div>
                        )}
                    </Card>
                </Col>
            </Row>
        </div>
    );
}
