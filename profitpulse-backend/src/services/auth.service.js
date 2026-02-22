import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../models/index.js';
import { StatusCodes } from 'http-status-codes';

export const registerUser = async (userData) => {
    const { email, password, role, name, department_id } = userData;

    const existingUser = await db.User.findOne({ where: { email } });
    if (existingUser) {
        const error = new Error('Email is already registered');
        error.statusCode = StatusCodes.CONFLICT;
        throw error;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await db.User.create({
        email,
        password: hashedPassword,
        role,
        name,
        department_id: department_id || null,
    });

    return { id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name };
};

export const loginUser = async (email, password) => {
    const user = await db.User.findOne({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
        const error = new Error('Invalid email or password');
        error.statusCode = StatusCodes.UNAUTHORIZED;
        throw error;
    }

    if (!user.is_active) {
        const error = new Error('Account disabled. Please contact admin.');
        error.statusCode = StatusCodes.FORBIDDEN;
        throw error;
    }

    const token = jwt.sign(
        { id: user.id, role: user.role, department_id: user.department_id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRY || '24h' }
    );

    const refreshToken = jwt.sign(
        { id: user.id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d' }
    );

    // Update last login
    await user.update({ last_login: new Date() });

    return {
        token,
        refreshToken,
        user: { id: user.id, name: user.name, email: user.email, role: user.role, department_id: user.department_id }
    };
};

export const changeUserPassword = async (userId, oldPassword, newPassword) => {
    const user = await db.User.findByPk(userId);
    if (!user) {
        const error = new Error('User not found');
        error.statusCode = StatusCodes.NOT_FOUND;
        throw error;
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
        const error = new Error('Incorrect old password');
        error.statusCode = StatusCodes.UNAUTHORIZED;
        throw error;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await user.update({ password: hashedPassword });
};

export const refreshAuthToken = async (refreshToken) => {
    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const user = await db.User.findByPk(decoded.id);

        if (!user || !user.is_active) {
            throw new Error('User not found or inactive');
        }

        const token = jwt.sign(
            { id: user.id, role: user.role, department_id: user.department_id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRY || '24h' }
        );

        return { token };
    } catch (err) {
        const error = new Error('Invalid or expired refresh token');
        error.statusCode = StatusCodes.UNAUTHORIZED;
        throw error;
    }
};
