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
    const sheet = workbook.addWorksheet('Template');
    if (type === 'employees') {
        sheet.columns = [
            { header: 'Employee ID', key: 'Employee ID', width: 15 },
            { header: 'Name', key: 'Name', width: 20 },
            { header: 'Department', key: 'Department', width: 20 },
            { header: 'Designation', key: 'Designation', width: 20 },
            { header: 'Annual CTC', key: 'Annual CTC', width: 15 },
            { header: 'Billable / Non-Billable', key: 'Billable / Non-Billable', width: 20 },
            { header: 'Joining Date', key: 'Joining Date', width: 15 },
        ];
    } else if (type === 'timesheets') {
        sheet.columns = [
            { header: 'Employee ID', key: 'Employee ID', width: 15 },
            { header: 'Project ID', key: 'Project ID', width: 15 },
            { header: 'Billable Hours', key: 'Billable Hours', width: 15 },
            { header: 'Non-Billable Hours', key: 'Non-Billable Hours', width: 15 },
            { header: 'Month', key: 'Month', width: 15 },
        ];
    } else if (type === 'revenue') {
        sheet.columns = [
            { header: 'Project ID', key: 'Project ID', width: 15 },
            { header: 'Client Name', key: 'Client Name', width: 20 },
            { header: 'Invoice Amount', key: 'Invoice Amount', width: 15 },
            { header: 'Invoice Date', key: 'Invoice Date', width: 15 },
            { header: 'Project Type', key: 'Project Type', width: 15 },
            { header: 'Vertical', key: 'Vertical', width: 15 },
        ];
    } else {
        return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: 'Invalid template type' });
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${type}_template.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
});
