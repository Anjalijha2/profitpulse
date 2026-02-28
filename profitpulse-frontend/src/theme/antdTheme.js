import { theme } from 'antd';

export const antdTheme = {
    algorithm: theme.defaultAlgorithm,
    token: {
        fontFamily: "'Inter', -apple-system, sans-serif",
        colorPrimary: '#F11A10',    // Primary Red
        colorInfo: '#DBF0FF',      // Light Blue
        colorSuccess: '#10B981',    // Green
        colorWarning: '#F59E0B',    // Amber
        colorError: '#EF4444',      // Red

        // Light Mode Base
        colorTextBase: '#040222',
        colorTextSecondary: '#212529',
        colorTextQuaternary: '#6B7280',
        colorBgLayout: '#F6F6F6',      // Background
        colorBgContainer: '#FFFFFF', // Cards
        colorBgElevated: '#FFFFFF',  // Modals, Dropdowns

        // Borders
        colorBorder: 'rgba(4, 2, 34, 0.15)',
        colorBorderSecondary: 'rgba(4, 2, 34, 0.08)',

        // Radii
        borderRadius: 8,
        borderRadiusLG: 16,
        borderRadiusSM: 6,
        boxShadowTertiary: '0 8px 32px rgba(4, 2, 34, 0.08)',
    },
    components: {
        Button: {
            colorPrimary: '#F11A10',
            colorPrimaryHover: '#D1170D',
            colorPrimaryActive: '#B21008',
            borderRadius: 8,
            controlHeight: 40,
        },
        Card: {
            borderRadiusLG: 16,
            colorBorderSecondary: 'rgba(4, 2, 34, 0.08)',
            boxShadowTertiary: '0 4px 20px rgba(4, 2, 34, 0.06)',
        },
        Menu: {
            colorItemText: '#6B7280',
            colorItemTextHover: '#040222',
            colorItemBg: 'transparent',
            colorItemBgHover: 'rgba(241, 26, 16, 0.04)',
            colorItemBgSelected: 'rgba(241, 26, 16, 0.08)',
            colorItemTextSelected: '#F11A10',
            itemBorderRadius: 8,
            itemMarginInline: 12,
        },
        Table: {
            headerBg: '#FAF5FF',
            headerColor: '#040222',
            rowHoverBg: 'rgba(4, 2, 34, 0.02)',
            borderRadius: 8,
            fontSize: 14,
            borderColor: 'rgba(4, 2, 34, 0.06)',
            colorBgContainer: '#FFFFFF',
        },
        Input: {
            borderRadius: 8,
            controlHeight: 40,
            colorBgContainer: '#FFFFFF',
            colorBorder: 'rgba(4, 2, 34, 0.15)',
        },
        Select: {
            borderRadius: 8,
            controlHeight: 40,
            colorBgContainer: '#FFFFFF',
            colorBorder: 'rgba(4, 2, 34, 0.15)',
        },
        DatePicker: {
            borderRadius: 8,
            colorBgContainer: '#FFFFFF',
            colorBorder: 'rgba(4, 2, 34, 0.15)',
        }
    }
};
