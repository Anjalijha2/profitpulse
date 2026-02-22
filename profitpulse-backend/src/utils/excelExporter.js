import ExcelJS from 'exceljs';

/**
 * Generates an Excel buffer for download.
 *
 * @param {Array} columns - Array of column definitions: { header: 'Name', key: 'name', width: 20 }
 * @param {Array} data - Array of row items mapping to column keys
 * @param {string} sheetName - Name of the worksheet
 * @returns {Promise<Buffer>}
 */
export const exportToExcel = async (columns, data, sheetName = 'Data') => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(sheetName);

    worksheet.columns = columns;

    // Add rows
    data.forEach((item) => {
        worksheet.addRow(item);
    });

    // Basic styling on headers
    worksheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true };
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' } // Light gray
        };
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
};
