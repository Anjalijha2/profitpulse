/**
 * Standard pagination config used across all tables in ProfitPulse.
 * Usage:
 *   import { tablePagination } from '../../utils/pagination';
 *   <Table pagination={tablePagination(total, page, pageSize, onChange)} ... />
 */
export const tablePagination = (total, current, pageSize, onChange) => ({
    current,
    pageSize,
    total,
    showSizeChanger: true,
    pageSizeOptions: ['5', '10', '15', '20', '50'],
    showTotal: (t, range) => `${range[0]}–${range[1]} of ${t} records`,
    onChange,
    onShowSizeChange: (_, size) => onChange(1, size),
});
