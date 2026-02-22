import axios from 'axios';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import ExcelJS from 'exceljs';
import db from './src/models/index.js';

dotenv.config();

async function run() {
    try {
        const u = await db.User.findOne({ where: { role: 'admin' } });
        const token = jwt.sign({ id: u.id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });

        const res = await axios.get('http://localhost:5000/api/v1/uploads/template/employees', {
            headers: { 'Authorization': 'Bearer ' + token },
            responseType: 'arraybuffer'
        });

        console.log('Downloaded file size:', res.data.byteLength, 'bytes');

        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(res.data);
        const worksheet = workbook.getWorksheet(1);
        console.log('Sheet name:', worksheet.name);
        console.log('Row 1 (Headers):');
        worksheet.getRow(1).eachCell((cell, colNumber) => {
            console.log(`Col ${colNumber}: ${cell.value}`);
        });
        console.log('TEST PASSED: Excel template parsed successfully.');
    } catch (err) {
        console.error('Test Error:', err.message);
    }
}
run();
