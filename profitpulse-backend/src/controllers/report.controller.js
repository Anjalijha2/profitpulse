import { StatusCodes } from 'http-status-codes';
import asyncHandler from '../utils/asyncHandler.js';
import { apiResponse } from '../utils/apiResponse.js';
import * as reportService from '../services/report.service.js';

export const downloadProjectReport = asyncHandler(async (req, res) => {
    const buffer = await reportService.generateProjectReport(req.query);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=project_profitability.xlsx');
    res.send(buffer);
});

export const downloadEmployeeReport = asyncHandler(async (req, res) => {
    const buffer = await reportService.generateEmployeeReport(req.query);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=employee_profitability.xlsx');
    res.send(buffer);
});

export const downloadDepartmentReport = asyncHandler(async (req, res) => {
    const buffer = await reportService.generateDepartmentReport(req.query);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=department_profitability.xlsx');
    res.send(buffer);
});

export const downloadUtilizationReport = asyncHandler(async (req, res) => {
    const buffer = await reportService.generateUtilizationReport(req.query);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=utilization_report.xlsx');
    res.send(buffer);
});
