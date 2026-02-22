import express from 'express';

import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import employeeRoutes from './employee.routes.js';
import projectRoutes from './project.routes.js';
import timesheetRoutes from './timesheet.routes.js';
import revenueRoutes from './revenue.routes.js';
import uploadRoutes from './upload.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import reportRoutes from './report.routes.js';
import configRoutes from './config.routes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/employees', employeeRoutes);
router.use('/projects', projectRoutes);
router.use('/timesheets', timesheetRoutes);
router.use('/revenue', revenueRoutes);
router.use('/uploads', uploadRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/reports', reportRoutes);
router.use('/config', configRoutes);

router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'ProfitPulse API is running',
        data: {
            uptime: process.uptime(),
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV
        }
    });
});

export default router;
