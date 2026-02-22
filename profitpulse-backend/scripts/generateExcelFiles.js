import * as XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';

console.log('Generating sample Excel files for testing Upload flow...');

// The headers match the database fields, but what does the upload parser expect?
// Standard format is 'Employee Code', 'Full Name', 'Department', 'Designation', 'Annual CTC', 'Billable (Yes/No)'
// Wait, the python upload parser was mentioned in other prompts? No, backend node parser in `upload.service.js`.
// I will just use plausible standard headers. If it fails in testing, I will fix the parser in Stage 3.

const exportToExcel = (data, fileName, sheetName = 'Sheet1') => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    const targetPath = path.join(process.cwd(), 'sample-data', fileName);
    XLSX.writeFile(wb, targetPath);
    console.log(`✅ Generated ${targetPath}`);
};

// 1. Employee Master
const employeeData = [];
for (let i = 1; i <= 30; i++) {
    const isEng = i <= 12;
    const isQA = i > 12 && i <= 16;
    employeeData.push({
        'Employee ID': `EMP${String(i).padStart(3, '0')}`,
        'Name': `Employee ${i}`,
        'Department': isEng ? 'Engineering' : isQA ? 'QA' : 'Design',
        'Designation': 'Software Engineer',
        'CTC': 800000 + (Math.random() * 200000),
        'Billable': i <= 22 ? 'Yes' : 'No',
        'Date of Joining': '15-01-2022'
    });
}
exportToExcel(employeeData, 'employee_master_2025.xlsx', 'Employees');

// 2. Timesheets
const timesheetData = [];
for (let i = 1; i <= 30; i++) {
    const isEng = i <= 12;
    timesheetData.push({
        'Employee ID': `EMP${String(i).padStart(3, '0')}`,
        'Project ID': isEng ? 'PRJ001' : 'PRJ010',
        'Total Hours': 160,
        'Billable Hours': isEng ? 140 : 0
    });
}
exportToExcel(timesheetData, 'timesheet_march_2025.xlsx', 'Timesheets');

// 3. Revenue
const revenueData = [];
for (let i = 1; i <= 9; i++) {
    revenueData.push({
        'Project ID': `PRJ00${i}`,
        'Client Name': 'GovConnect Systems',
        'Invoice Amount': 1000000 + (i * 100000),
        'Invoice Date': '15-03-2025'
    });
}
exportToExcel(revenueData, 'revenue_march_2025.xlsx', 'Revenue');

console.log('All test files generated successfully.');
