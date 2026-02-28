import { Card, Typography } from 'antd';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import CountUp from 'react-countup';

const { Text } = Typography;

export default function StatCard({ title, value, prefix = '', suffix = '', trend, trendValue, icon, loading = false }) {
    const isPositive = trend === 'up';
    const trendColor = isPositive ? '#10b981' : '#ef4444';
    const TrendIcon = isPositive ? ArrowUpRight : ArrowDownRight;

    return (
        <Card
            bordered={true}
            loading={loading}
            style={{
                height: '100%',
                borderRadius: 12,
                borderColor: '#f3f4f6'
            }}
            bodyStyle={{ padding: 24 }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <Text style={{ color: '#6b7280', fontSize: 14, fontWeight: 500 }}>{title}</Text>
                {icon && (
                    <div style={{ width: 40, height: 40, borderRadius: 8, background: '#FAF5FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F11A10' }}>
                        {icon}
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontSize: 32, fontWeight: 700, color: '#111827', letterSpacing: '-0.02em' }}>
                    {prefix}
                    <CountUp end={value} duration={2} separator="," decimals={value % 1 !== 0 ? 2 : 0} />
                    {suffix}
                </span>
            </div>

            {trendValue && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 12 }}>
                    <span style={{ display: 'flex', alignItems: 'center', color: trendColor, fontSize: 14, fontWeight: 600, background: isPositive ? '#d1fae5' : '#fee2e2', padding: '2px 6px', borderRadius: 4 }}>
                        <TrendIcon size={14} style={{ marginRight: 2 }} />
                        {trendValue}%
                    </span>
                    <Text style={{ color: '#9ca3af', fontSize: 13 }}>vs last month</Text>
                </div>
            )}
        </Card>
    );
}
