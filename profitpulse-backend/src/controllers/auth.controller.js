import { StatusCodes } from 'http-status-codes';
import asyncHandler from '../utils/asyncHandler.js';
import { apiResponse } from '../utils/apiResponse.js';
import * as authService from '../services/auth.service.js';

export const register = asyncHandler(async (req, res) => {
    const user = await authService.registerUser(req.body);
    res.status(StatusCodes.CREATED).json(apiResponse(true, 'User registered successfully', user));
});

export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const result = await authService.loginUser(email, password);
    res.status(StatusCodes.OK).json(apiResponse(true, 'Login successful', result));
});

export const refreshToken = asyncHandler(async (req, res) => {
    const { token } = req.body;
    const result = await authService.refreshAuthToken(token);
    res.status(StatusCodes.OK).json(apiResponse(true, 'Token refreshed', result));
});

export const logout = asyncHandler(async (req, res) => {
    // Client-side removes token. Server-side we could implement token blacklisting if needed
    res.status(StatusCodes.OK).json(apiResponse(true, 'Logout successful'));
});

export const me = asyncHandler(async (req, res) => {
    res.status(StatusCodes.OK).json(apiResponse(true, 'Current user', req.user));
});

export const changePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    await authService.changeUserPassword(req.user.id, oldPassword, newPassword);
    res.status(StatusCodes.OK).json(apiResponse(true, 'Password changed successfully'));
});
