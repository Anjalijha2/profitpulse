import { theme } from 'antd';

export const antdTheme = {
    algorithm: theme.darkAlgorithm,
    token: {
        fontFamily: "'Inter', -apple-system, sans-serif",
        colorPrimary: '#22D3EE',    // Neon Cyan
        colorInfo: '#818CF8',      // Soft Indigo
        colorSuccess: '#34D399',    // Neon Emerald
        colorWarning: '#FBBF24',    // Bright Amber
        colorError: '#F43F5E',      // Neon Rose

        // Dark Mode Base
        colorTextBase: '#FFFFFF',
        colorTextSecondary: '#CBD5E1',     // Slate-300
        colorTextQuaternary: '#64748B',    // Slate-500
        colorBgLayout: 'transparent',      // Was '#F8FAFC' now transparent to let waves show
        colorBgContainer: 'rgba(11, 20, 48, 0.55)', // Glass Panel Background
        colorBgElevated: 'rgba(11, 20, 48, 0.85)',  // Modals, Dropdowns

        // Borders
        colorBorder: 'rgba(255, 255, 255, 0.1)',
        colorBorderSecondary: 'rgba(255, 255, 255, 0.05)',

        // Radii
        borderRadius: 10,
        borderRadiusLG: 16,
        borderRadiusSM: 6,
        boxShadowTertiary: '0 8px 32px rgba(0, 0, 0, 0.3)',
    },
    components: {
        Button: {
            colorPrimary: '#06B6D4',
            colorPrimaryHover: '#22D3EE',
            colorPrimaryActive: '#0891B2',
            borderRadius: 10,
            controlHeight: 40,
        },
        Card: {
            borderRadiusLG: 16,
            colorBorderSecondary: 'rgba(255, 255, 255, 0.1)',
            boxShadowTertiary: '0 4px 20px rgba(0, 0, 0, 0.3)',
        },
        Menu: {
            colorItemText: '#94A3B8',
            colorItemTextHover: '#FFFFFF',
            colorItemBg: 'transparent',
            colorItemBgHover: 'rgba(34, 211, 238, 0.08)',
            colorItemBgSelected: 'rgba(34, 211, 238, 0.12)',
            colorItemTextSelected: '#22D3EE',
            itemBorderRadius: 8,
            itemMarginInline: 12,
        },
        Table: {
            headerBg: 'rgba(255, 255, 255, 0.03)',
            headerColor: '#CBD5E1',       // High contrast header text
            rowHoverBg: 'rgba(255, 255, 255, 0.04)',
            borderRadius: 10,
            fontSize: 14,
            borderColor: 'rgba(255, 255, 255, 0.06)',
            colorBgContainer: 'transparent', // Make tables glass too inside cards
        },
        Input: {
            borderRadius: 10,
            controlHeight: 40,
            colorBgContainer: 'rgba(255, 255, 255, 0.08)',
            colorBorder: 'rgba(255, 255, 255, 0.15)',
        },
        Select: {
            borderRadius: 10,
            controlHeight: 40,
            colorBgContainer: 'rgba(255, 255, 255, 0.08)',
            colorBorder: 'rgba(255, 255, 255, 0.15)',
        },
        DatePicker: {
            borderRadius: 10,
            colorBgContainer: 'rgba(255, 255, 255, 0.08)',
            colorBorder: 'rgba(255, 255, 255, 0.15)',
        }
    }
};
