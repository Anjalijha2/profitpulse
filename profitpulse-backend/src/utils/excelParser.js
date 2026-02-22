import xlsx from 'xlsx';
import fs from 'fs';

/**
 * Parse an uploaded Excel file and map its headers to defined keys.
 * 
 * @param {string} filePath - Path to the Excel file
 * @param {Object} schema - Key-value pair mapping where key is our system key, and value is the expected header name (or array of possible header variations). Not fully robust but a good abstraction.
 * @returns {Array} - Array of parsed JSON objects row by row
 */
export const parseExcel = (filePath) => {
    try {
        const workbook = xlsx.readFile(filePath, { type: 'file' });
        const sheetName = workbook.SheetNames[0]; // Assuming data is in the first sheet
        const worksheet = workbook.Sheets[sheetName];

        // Convert sheet to json
        // raw: true means it won't force everything to a string (keeps numbers, booleans)
        const json = xlsx.utils.sheet_to_json(worksheet, { raw: true, defval: null });

        return json;
    } catch (err) {
        throw new Error(`Failed to parse Excel file: ${err.message}`);
    }
};
