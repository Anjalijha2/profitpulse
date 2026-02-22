import { useState, useEffect } from 'react';
import { Typography, Card, Switch, Button, Tag, message, Spin, Tooltip, Badge } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ShieldCheck, Save, Info, Lock } from 'lucide-react';
import { axiosInstance } from '../../api/axiosInstance';
import { useRbacStore } from '../../store/rbacStore';

const { Title, Text } = Typography;

// All portal sections that can be toggled per role
const PORTAL_SECTIONS = [
    { key: 'dashboard:executive', label: 'Executive Dashboard', category: 'Dashboards' },
    { key: 'dashboard:employee', label: 'Employee Dashboard', category: 'Dashboards' },
    { key: 'dashboard:project', label: 'Project Dashboard', category: 'Dashboards' },
    { key: 'dashboard:department', label: 'Department Dashboard', category: 'Dashboards' },
    { key: 'dashboard:client', label: 'Client Dashboard', category: 'Dashboards' },
    { key: 'employees', label: 'Employee Records', category: 'Data Hub' },
    { key: 'projects', label: 'Project Records', category: 'Data Hub' },
    { key: 'revenue', label: 'Revenue Data', category: 'Data Hub' },
    { key: 'uploads', label: 'Upload Center', category: 'Data Hub' },
    { key: 'reports', label: 'Reports', category: 'Analytics' },
];

const CONFIGURABLE_ROLES = [
    { key: 'finance', label: 'Finance', color: '#722ed1' },
    { key: 'delivery_manager', label: 'Delivery Mgr', color: '#1677ff' },
    { key: 'dept_head', label: 'Dept Head', color: '#fa8c16' },
    { key: 'hr', label: 'HR', color: '#52c41a' },
];

// Static defaults — mirrors permissions.js
const DEFAULTS = {
    finance: ['dashboard:executive', 'dashboard:project', 'dashboard:department', 'dashboard:client', 'projects', 'revenue', 'uploads', 'reports'],
    delivery_manager: ['dashboard:project', 'projects', 'uploads', 'reports'],
    dept_head: ['dashboard:employee', 'dashboard:department', 'employees', 'reports'],
    hr: ['dashboard:employee', 'employees', 'uploads', 'reports'],
};

const categories = [...new Set(PORTAL_SECTIONS.map(s => s.category))];

export default function RoleAccessConfig() {
    const [matrix, setMatrix] = useState(null);
    const [dirty, setDirty] = useState(false);
    const applyOverrides = useRbacStore((s) => s.applyOverrides);
    const queryClient = useQueryClient();

    // Load existing config
    const { data: configData, isLoading } = useQuery({
        queryKey: ['config'],
        queryFn: async () => {
            return axiosInstance.get('/config');
        }
    });

    useEffect(() => {
        if (!configData) return;
        // Backend returns { success: true, data: { configs: [...] } }
        const items = configData?.data?.configs || configData?.data?.items || [];
        const rbacEntry = items.find(c => c.key === 'rbac_overrides');
        if (rbacEntry?.value) {
            try {
                setMatrix(JSON.parse(rbacEntry.value));
            } catch {
                setMatrix(DEFAULTS);
            }
        } else {
            setMatrix(DEFAULTS);
        }
    }, [configData]);

    const saveMutation = useMutation({
        mutationFn: async (newMatrix) => {
            return axiosInstance.put('/config', {
                configs: [
                    {
                        key: 'rbac_overrides',
                        value: JSON.stringify(newMatrix)
                    }
                ]
            });
        },
        onSuccess: () => {
            message.success('Role access configuration saved successfully!');
            // Update the Zustand store immediately — this triggers re-renders
            // in Sidebar and ProtectedRoute for the current session
            applyOverrides(matrix);
            // Invalidate the cache so navigating away and back doesn't show old state
            queryClient.invalidateQueries({ queryKey: ['config'] });
            setDirty(false);
        },
        onError: () => {
            message.error('Failed to save configuration. Please try again.');
        }
    });

    const toggle = (role, sectionKey) => {
        setMatrix(prev => {
            const current = prev[role] || [];
            const updated = current.includes(sectionKey)
                ? current.filter(k => k !== sectionKey)
                : [...current, sectionKey];
            return { ...prev, [role]: updated };
        });
        setDirty(true);
    };

    const handleReset = () => {
        setMatrix(DEFAULTS);
        setDirty(true);
    };

    if (isLoading || !matrix) {
        return <Spin size="large" style={{ display: 'block', margin: '80px auto' }} />;
    }

    return (
        <div className="animate-fade-in-up">
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{
                        width: 44, height: 44, borderRadius: 12,
                        background: 'linear-gradient(135deg, #667eea, #764ba2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 14px rgba(102,126,234,0.4)'
                    }}>
                        <ShieldCheck size={22} color="#fff" />
                    </div>
                    <div>
                        <Title level={2} className="page-title" style={{ margin: 0, color: 'var(--color-text-primary)' }}>
                            Role Access Configuration
                        </Title>
                        <Text style={{ color: 'var(--color-text-muted)', fontSize: 14 }}>
                            Configure which portal sections each role can access.
                        </Text>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                    <Button onClick={handleReset}>Reset to Defaults</Button>
                    <Button
                        type="primary"
                        icon={<Save size={15} />}
                        onClick={() => saveMutation.mutate(matrix)}
                        loading={saveMutation.isPending}
                        disabled={!dirty}
                        style={{ background: dirty ? 'var(--color-primary-action)' : undefined }}
                    >
                        Save Changes
                    </Button>
                </div>
            </div>

            {dirty && (
                <div style={{
                    background: '#fff7e6', border: '1px solid #ffd591', borderRadius: 8,
                    padding: '10px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8
                }}>
                    <Info size={15} color="#fa8c16" />
                    <Text style={{ color: '#d46b08', fontSize: 13 }}>
                        You have unsaved changes. Click <strong>Save Changes</strong> to apply.
                    </Text>
                </div>
            )}

            {/* Admin note */}
            <Card
                style={{ marginBottom: 20, background: 'linear-gradient(135deg, #f0f5ff, #e6f7ff)', border: '1px solid #adc6ff', borderRadius: 12 }}
                bodyStyle={{ padding: '12px 20px' }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Lock size={16} color="#1677ff" />
                    <Text style={{ color: '#1677ff', fontSize: 13 }}>
                        <strong>Admin</strong> always has full access to all sections and cannot be restricted.
                        Changes here affect sidebar visibility and route protection for other roles.
                    </Text>
                </div>
            </Card>

            {/* Matrix Table */}
            {categories.map(cat => (
                <Card
                    key={cat}
                    title={<span style={{ fontWeight: 700, fontSize: 15 }}>{cat}</span>}
                    style={{ marginBottom: 20, borderRadius: 'var(--radius-card)', boxShadow: 'var(--shadow-card-default)' }}
                    bodyStyle={{ padding: 0 }}
                >
                    {/* Column headers */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '220px repeat(4, 1fr)',
                        background: 'var(--color-page-bg)',
                        borderBottom: '1px solid var(--color-card-border)',
                        padding: '10px 20px'
                    }}>
                        <div>
                            <Text style={{ color: 'var(--color-text-muted)', fontSize: 12, fontWeight: 600 }}>PORTAL SECTION</Text>
                        </div>
                        {CONFIGURABLE_ROLES.map(r => (
                            <div key={r.key} style={{ textAlign: 'center' }}>
                                <Tag color={r.color} style={{ fontWeight: 600, fontSize: 12 }}>{r.label.toUpperCase()}</Tag>
                            </div>
                        ))}
                    </div>

                    {/* Rows */}
                    {PORTAL_SECTIONS.filter(s => s.category === cat).map((section, idx, arr) => (
                        <div
                            key={section.key}
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '220px repeat(4, 1fr)',
                                padding: '14px 20px',
                                alignItems: 'center',
                                borderBottom: idx < arr.length - 1 ? '1px solid var(--color-card-border)' : 'none',
                                transition: 'background 0.15s',
                            }}
                            className="rbac-row"
                        >
                            <div>
                                <Text style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>{section.label}</Text>
                            </div>
                            {CONFIGURABLE_ROLES.map(role => {
                                const enabled = (matrix[role.key] || []).includes(section.key);
                                return (
                                    <div key={role.key} style={{ display: 'flex', justifyContent: 'center' }}>
                                        <Tooltip title={enabled ? `Disable for ${role.label}` : `Enable for ${role.label}`}>
                                            <Switch
                                                checked={enabled}
                                                onChange={() => toggle(role.key, section.key)}
                                                style={enabled ? { backgroundColor: role.color } : {}}
                                                size="small"
                                            />
                                        </Tooltip>
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </Card>
            ))}

            {/* Admin row (read-only) */}
            <Card
                title={<span style={{ fontWeight: 700, fontSize: 15 }}>Admin Access (Read-only)</span>}
                style={{ borderRadius: 'var(--radius-card)', boxShadow: 'var(--shadow-card-default)' }}
                bodyStyle={{ padding: '14px 20px' }}
            >
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                    {PORTAL_SECTIONS.map(s => (
                        <Badge key={s.key} color="green" text={
                            <Text style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{s.label}</Text>
                        } />
                    ))}
                </div>
            </Card>
        </div>
    );
}
