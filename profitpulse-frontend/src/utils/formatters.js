export const formatINR = (value) => {
    if (value === undefined || value === null || isNaN(value)) return '₹0';
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(value);
};

export const formatCurrency = formatINR;

export const formatINRCompact = (value) => {
    if (value === undefined || value === null || isNaN(value)) return '₹0';
    const num = Number(value);
    if (Math.abs(num) >= 10000000) {
        return '₹' + (num / 10000000).toFixed(2) + 'Cr';
    } else if (Math.abs(num) >= 100000) {
        return '₹' + (num / 100000).toFixed(2) + 'L';
    }
    return formatINR(num);
};

export const formatPercent = (value) => {
    if (value === undefined || value === null || isNaN(value)) return '0.00%';
    return Number(value).toFixed(2) + '%';
};

export const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

export const formatMonth = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        month: 'short',
        year: 'numeric'
    });
};
