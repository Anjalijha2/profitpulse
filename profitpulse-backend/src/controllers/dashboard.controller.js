import { StatusCodes } from 'http-status-codes';
import asyncHandler from '../utils/asyncHandler.js';
import { apiResponse } from '../utils/apiResponse.js';
import * as dashboardService from '../services/dashboard.service.js';

export const executiveDashboard = asyncHandler(async (req, res) => {
    const { month, year } = req.query;
    const data = await dashboardService.getExecutiveDashboard(month, year);
    res.status(StatusCodes.OK).json({ success: true, message: 'Executive Dashboard Data', data });
});

export const employeeDashboard = asyncHandler(async (req, res) => {
    const { month } = req.query;
    const data = await dashboardService.getEmployeeDashboard(month, req.user);
    res.status(StatusCodes.OK).json({ success: true, data });
});

export const projectDashboard = asyncHandler(async (req, res) => {
    const { month, project_type, vertical } = req.query;
    const data = await dashboardService.getProjectDashboard(month, project_type, vertical, req.user);
    res.status(StatusCodes.OK).json({ success: true, data });
});

export const departmentDashboard = asyncHandler(async (req, res) => {
    const { month } = req.query;
    const data = await dashboardService.getDepartmentDashboard(month, req.user);
    res.status(StatusCodes.OK).json({ success: true, data });
});

export const clientDashboard = asyncHandler(async (req, res) => {
    const { month } = req.query;
    const data = await dashboardService.getClientDashboard(month);
    res.status(StatusCodes.OK).json({ success: true, data });
});

export const companyDashboard = asyncHandler(async (req, res) => {
    // year (YYYY) defaults to current year
    const { year = new Date().getFullYear().toString() } = req.query;
    const data = await dashboardService.getCompanyDashboard(year);
    res.status(StatusCodes.OK).json({ success: true, data });
});
