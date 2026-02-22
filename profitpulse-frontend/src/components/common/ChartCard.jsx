import { Card } from 'antd';

export default function ChartCard({ title, children, extra }) {
    return (
        <Card
            title={<span className="section-title">{title}</span>}
            bordered={true}
            className="hover-card"
            style={{
                borderRadius: 'var(--radius-card)',
                height: '100%',
                borderColor: 'var(--color-card-border)',
                boxShadow: 'var(--shadow-card-default)'
            }}
            headStyle={{
                borderBottom: '1px solid var(--color-card-border)',
                padding: '16px 24px',
                color: 'var(--color-text-primary)'
            }}
            bodyStyle={{ padding: '24px' }}
            extra={extra}
        >
            {children}
        </Card>
    );
}
