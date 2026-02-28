import { StatusCodes } from 'http-status-codes';
import asyncHandler from '../utils/asyncHandler.js';
import { apiResponse } from '../utils/apiResponse.js';
import * as uploadService from '../services/upload.service.js';
import db from '../models/index.js';

export const uploadEmployees = asyncHandler(async (req, res) => {
    if (!req.file) throw new Error('No file uploaded');
    const { financialYear } = req.body;

    const uploadLog = await uploadService.processEmployeeMasterUpload(
        req.file.path, financialYear, req.user.id, req.file
    );

    res.status(StatusCodes.OK).json(apiResponse(true, 'Upload processed', uploadLog));
});

export const uploadTimesheets = asyncHandler(async (req, res) => {
    if (!req.file) throw new Error('No file uploaded');
    const { month } = req.body;

    const uploadLog = await uploadService.processTimesheetUpload(
        req.file.path, month, req.user.id, req.file
    );

    res.status(StatusCodes.OK).json(apiResponse(true, 'Timesheet upload processed', uploadLog));
});

export const uploadRevenues = asyncHandler(async (req, res) => {
    if (!req.file) throw new Error('No file uploaded');
    const { month } = req.body;

    const uploadLog = await uploadService.processRevenueUpload(
        req.file.path, month, req.user.id, req.file
    );

    res.status(StatusCodes.OK).json({ success: true, message: 'Revenue upload processed', data: uploadLog });
});

export const getUploadLogs = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, type } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    // RBAC
    const where = {};
    if (type) where.upload_type = type;
    if (req.user.role !== 'admin') {
        where.uploaded_by = req.user.id;
    }

    const { count, rows } = await db.UploadLog.findAndCountAll({
        where,
        limit: Number(limit),
        offset,
        order: [['createdAt', 'DESC']],
        include: [{ model: db.User, as: 'uploader', attributes: ['name', 'email'] }]
    });

    res.status(StatusCodes.OK).json({
        success: true,
        data: { logs: rows },
        meta: {
            total: count,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(count / Number(limit))
        }
    });
});

export const getUploadLogById = asyncHandler(async (req, res) => {
    const log = await db.UploadLog.findByPk(req.params.id);
    if (!log) return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Log not found' });

    if (req.user.role !== 'admin' && log.uploaded_by !== req.user.id) {
        return res.status(StatusCodes.FORBIDDEN).json({ success: false, message: 'Access denied' });
    }

    res.status(StatusCodes.OK).json({ success: true, data: { log } });
});

import { parseExcel } from '../utils/excelParser.js';
import fs from 'fs';
import { UPLOAD_TYPES } from '../config/constants.js';

export const validateUpload = asyncHandler(async (req, res) => {
    if (!req.file) throw new Error('No file uploaded for validation');
    const type = req.body.upload_type || req.body.type;

    if (!type) {
        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        return res.status(StatusCodes.BAD_REQUEST).json(apiResponse(false, 'upload_type is required'));
    }

    // Read the file without inserting
    const rawData = parseExcel(req.file.path);
    let errorRows = 0;
    let errors = [];

    for (let i = 0; i < rawData.length; i++) {
        const row = rawData[i];
        let rowError = null;
        if (type === 'employees' || type === UPLOAD_TYPES.EMPLOYEE_MASTER) {
            if (!row['Employee ID']) rowError = Object.assign(rowError || {}, { 'Employee ID': 'Missing' });
            if (!row['Annual CTC']) rowError = Object.assign(rowError || {}, { 'Annual CTC': 'Missing' });
            else if (isNaN(Number(row['Annual CTC']))) rowError = Object.assign(rowError || {}, { 'Annual CTC': 'Must be a number' });
        } else if (type === 'timesheets' || type === UPLOAD_TYPES.TIMESHEET) {
            if (!row['Employee ID']) rowError = Object.assign(rowError || {}, { 'Employee ID': 'Missing' });
            if (!row['Project ID']) rowError = Object.assign(rowError || {}, { 'Project ID': 'Missing' });
        } else if (type === 'revenue' || type === UPLOAD_TYPES.REVENUE) {
            if (!row['Project ID']) rowError = Object.assign(rowError || {}, { 'Project ID': 'Missing' });
        }

        if (rowError) {
            errorRows++;
            for (const [field, msg] of Object.entries(rowError)) {
                errors.push({ row: i + 2, field, message: msg });
            }
        }
    }

    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

    res.status(StatusCodes.OK).json({
        success: true,
        data: {
            valid: errorRows === 0,
            totalRows: rawData.length,
            validRows: rawData.length - errorRows,
            errorRows,
            errors
        }
    });
});

import ExcelJS from 'exceljs';

export const getTemplate = asyncHandler(async (req, res) => {
    const { type } = req.params;
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'ProfitPulse';

    // ─── Helper to style the header row ─────────────────────────────────────────
    const styleHeader = (sheet) => {
        const headerRow = sheet.getRow(1);
        headerRow.eachCell((cell) => {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF062B4A' } };
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
            cell.border = {
                top: { style: 'thin', color: { argb: 'FF22D3EE' } },
                bottom: { style: 'thin', color: { argb: 'FF22D3EE' } },
            };
        });
        headerRow.height = 22;
    };

    // ─── Helper to style the example row ────────────────────────────────────────
    const styleExampleRow = (sheet, rowNum) => {
        const row = sheet.getRow(rowNum);
        row.eachCell((cell) => {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8F4FD' } };
            cell.font = { italic: true, color: { argb: 'FF555555' }, size: 10 };
            cell.alignment = { vertical: 'middle', horizontal: 'left' };
        });
        row.height = 18;
    };

    // ─── Helper to add an Instructions sheet ────────────────────────────────────
    const addInstructions = (sheet, instructions) => {
        sheet.columns = [
            { header: 'Field Name', key: 'field', width: 28 },
            { header: 'Required?', key: 'required', width: 14 },
            { header: 'Data Type', key: 'type', width: 18 },
            { header: 'Allowed Values / Format', key: 'values', width: 42 },
            { header: 'Example', key: 'example', width: 28 },
        ];

        // Style instruction header
        const hRow = sheet.getRow(1);
        hRow.eachCell((cell) => {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A1A2E' } };
            cell.font = { bold: true, color: { argb: 'FF22D3EE' }, size: 11 };
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
        });
        hRow.height = 22;

        instructions.forEach((row, i) => {
            const r = sheet.addRow(row);
            r.getCell('required').font = {
                bold: true,
                color: { argb: row.required === 'Yes' ? 'FFCC0000' : 'FF006600' }
            };
            if (i % 2 === 0) {
                r.eachCell((cell) => {
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8F8F8' } };
                });
            }
            r.height = 18;
        });
    };

    // ════════════════════════════════════════════════════════════════════════════
    if (type === 'employees') {
        // ── Data Sheet ──────────────────────────────────────────────────────────
        const sheet = workbook.addWorksheet('Employee Data');
        sheet.columns = [
            { header: 'Employee ID', key: 'Employee ID', width: 18 },
            { header: 'Name', key: 'Name', width: 25 },
            { header: 'Department', key: 'Department', width: 22 },
            { header: 'Designation', key: 'Designation', width: 22 },
            { header: 'Annual CTC', key: 'Annual CTC', width: 18 },
            { header: 'Billable / Non-Billable', key: 'Billable / Non-Billable', width: 22 },
            { header: 'Joining Date', key: 'Joining Date', width: 18 },
        ];
        styleHeader(sheet);
        sheet.addRow(['EMP001', 'Rahul Sharma', 'Engineering', 'Senior Developer', 1200000, 'Billable', '2022-06-15']);
        styleExampleRow(sheet, 2);

        // ── Instructions Sheet ───────────────────────────────────────────────────
        const instr = workbook.addWorksheet('📋 Instructions');
        addInstructions(instr, [
            { field: 'Employee ID', required: 'Yes', type: 'Text', values: 'Unique code, e.g. EMP001, EMP002', example: 'EMP001' },
            { field: 'Name', required: 'Yes', type: 'Text', values: 'Full name of the employee', example: 'Rahul Sharma' },
            { field: 'Department', required: 'Yes', type: 'Text', values: 'Engineering, HR, Finance, Operations, etc.', example: 'Engineering' },
            { field: 'Designation', required: 'Yes', type: 'Text', values: 'Job title, e.g. Senior Developer', example: 'Senior Developer' },
            { field: 'Annual CTC', required: 'Yes', type: 'Number', values: 'Annual salary in INR (numbers only, no commas)', example: '1200000' },
            { field: 'Billable / Non-Billable', required: 'Yes', type: 'Text', values: 'Exactly: "Billable" or "Non-Billable"', example: 'Billable' },
            { field: 'Joining Date', required: 'No', type: 'Date', values: 'Format: YYYY-MM-DD or DD/MM/YYYY', example: '2022-06-15' },
        ]);

        // ════════════════════════════════════════════════════════════════════════════
    } else if (type === 'timesheets') {
        // ── Data Sheet ──────────────────────────────────────────────────────────
        const sheet = workbook.addWorksheet('Timesheet Data');
        sheet.columns = [
            { header: 'Employee ID', key: 'Employee ID', width: 18 },
            { header: 'Project ID', key: 'Project ID', width: 18 },
            { header: 'Billable Hours', key: 'Billable Hours', width: 18 },
            { header: 'Non-Billable Hours', key: 'Non-Billable Hours', width: 20 },
            { header: 'Month', key: 'Month', width: 15 },
        ];
        styleHeader(sheet);
        sheet.addRow(['EMP001', 'PRJ001', 160, 20, '2024-03']);
        styleExampleRow(sheet, 2);

        // ── Instructions Sheet ───────────────────────────────────────────────────
        const instr = workbook.addWorksheet('📋 Instructions');
        addInstructions(instr, [
            { field: 'Employee ID', required: 'Yes', type: 'Text', values: 'Must match an existing employee in the system', example: 'EMP001' },
            { field: 'Project ID', required: 'Yes', type: 'Text', values: 'Must match an existing project code in the system', example: 'PRJ001' },
            { field: 'Billable Hours', required: 'Yes', type: 'Number', values: 'Hours billed to client (decimal allowed, e.g. 160.5)', example: '160' },
            { field: 'Non-Billable Hours', required: 'No', type: 'Number', values: 'Internal/non-billable hours (decimal allowed)', example: '20' },
            { field: 'Month', required: 'Yes', type: 'Text', values: 'Format: YYYY-MM (e.g. 2024-03 for March 2024)', example: '2024-03' },
        ]);

        // ════════════════════════════════════════════════════════════════════════════
    } else if (type === 'revenue') {
        // ── Data Sheet ──────────────────────────────────────────────────────────
        const sheet = workbook.addWorksheet('Revenue Data');
        sheet.columns = [
            { header: 'Project ID', key: 'Project ID', width: 18 },
            { header: 'Client Name', key: 'Client Name', width: 25 },
            { header: 'Invoice Amount', key: 'Invoice Amount', width: 18 },
            { header: 'Invoice Date', key: 'Invoice Date', width: 18 },
            { header: 'Project Type', key: 'Project Type', width: 18 },
            { header: 'Vertical', key: 'Vertical', width: 18 },
        ];
        styleHeader(sheet);
        sheet.addRow(['PRJ001', 'Acme Corp', 500000, '2024-03-31', 'tm', 'AI']);
        styleExampleRow(sheet, 2);

        // ── Instructions Sheet ───────────────────────────────────────────────────
        const instr = workbook.addWorksheet('📋 Instructions');
        addInstructions(instr, [
            { field: 'Project ID', required: 'Yes', type: 'Text', values: 'Must match an existing project code in the system', example: 'PRJ001' },
            { field: 'Client Name', required: 'No', type: 'Text', values: 'Name of the client (for reference)', example: 'Acme Corp' },
            { field: 'Invoice Amount', required: 'Yes', type: 'Number', values: 'Revenue amount in INR (numbers only, no commas/₹)', example: '500000' },
            { field: 'Invoice Date', required: 'Yes', type: 'Date', values: 'Format: YYYY-MM-DD or DD/MM/YYYY', example: '2024-03-31' },
            { field: 'Project Type', required: 'No', type: 'Text', values: 'Values: "tm", "fixed" or "amc"', example: 'tm' },
            { field: 'Vertical', required: 'No', type: 'Text', values: 'e.g. AI, Healthcare, BFSI, Enterprise, Education', example: 'AI' },
        ]);

    } else {
        return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: 'Invalid template type' });
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${type}_template.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
});
