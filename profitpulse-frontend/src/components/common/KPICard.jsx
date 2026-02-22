import { Card, Typography, Skeleton } from 'antd';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import CountUp from 'react-countup';

const { Text } = Typography;

export default function KPICard({ title, value, prefix = '', suffix = '', trend, trendLabel, icon, color, loading = false }) {
    const isPositive = trend === 'up';

    // Custom colors depending on the KPI logic (profit vs loss)
    // But generally, up is green unless specified
    const trendColor = isPositive ? 'var(--color-profit)' : 'var(--color-loss)';
    const trendBg = isPositive ? 'var(--color-profit-bg)' : 'var(--color-loss-bg)';
    const TrendIcon = isPositive ? ArrowUpRight : ArrowDownRight;

    return (
        <Card
            bordered={true}
            className="hover-card"
            style={{
                height: '100%',
                borderRadius: 'var(--radius-card)',
                borderColor: 'var(--color-card-border)',
                boxShadow: 'var(--shadow-card-default)'
            }}
            bodyStyle={{ padding: '24px' }}
        >
            {loading ? <Skeleton active paragraph={{ rows: 2 }} /> : (
                <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                        <span className="kpi-label">{title}</span>
                        {icon && (
                            <div style={{
                                width: 36, height: 36, borderRadius: '50%',
                                background: color === 'blue' ? '#EFF6FF' : trendBg,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: color === 'blue' ? 'var(--color-primary-action)' : trendColor
                            }}>
                                {icon}
                            </div>
                        )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                        <span className="kpi-large-number" style={{ color: 'var(--color-text-primary)' }}>
                            {prefix}
                            {typeof value === 'number' ? (
                                <CountUp end={value} duration={1.5} useEasing preserveValue separator="," decimals={value % 1 !== 0 ? 2 : 0} />
                            ) : value}
                            {suffix}
                        </span>
                    </div>

                    {trendLabel && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 12 }}>
                            <span style={{
                                display: 'flex', alignItems: 'center',
                                color: trendColor, fontSize: 13, fontWeight: 600,
                                background: trendBg, padding: '2px 6px', borderRadius: 4
                            }}>
                                <TrendIcon size={14} style={{ marginRight: 2 }} />
                                {trendLabel}
                            </span>
                        </div>
                    )}
                </>
            )}
        </Card>
    );
}
