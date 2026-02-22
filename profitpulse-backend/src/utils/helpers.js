import { PAGINATION } from '../config/constants.js';

export const getPagination = (page, limit) => {
    const finalPage = page ? parseInt(page, 10) : PAGINATION.DEFAULT_PAGE;
    let finalLimit = limit ? parseInt(limit, 10) : PAGINATION.DEFAULT_LIMIT;

    if (finalLimit > PAGINATION.MAX_LIMIT) {
        finalLimit = PAGINATION.MAX_LIMIT;
    }

    const offset = (finalPage - 1) * finalLimit;

    return { limit: finalLimit, offset, page: finalPage };
};

export const getPagingData = (data, page, limit) => {
    const { count: total, rows: items } = data;
    const currentPage = page ? parseInt(page, 10) : 1;
    const totalPages = Math.ceil(total / limit);

    return {
        total,
        totalPages,
        currentPage,
        limit,
        items
    };
};

// Generates Financial Year based on a date (e.g. 2025-05-10 -> "2025-2026")
export const getFinancialYear = (date, startMonth = 4) => {
    const d = new Date(date);
    if (isNaN(d.getTime())) return null;
    const month = d.getMonth() + 1;
    const year = d.getFullYear();
    if (month >= startMonth) {
        return `${year}-${year + 1}`;
    } else {
        return `${year - 1}-${year}`;
    }
};
