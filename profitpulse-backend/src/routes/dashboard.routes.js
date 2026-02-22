import express from 'express';
import * as dashboardController from '../controllers/dashboard.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { authorizeRole } from '../middleware/rbac.middleware.js';

const router = express.Router();

router.use(verifyToken);

/**
 * @swagger
 * tags:
 *   name: Dashboards
 *   description: Dashboard Analytics APIs
 */

/**
 * @swagger
 * /dashboard/executive:
 *   get:
 *     summary: Get Executive Dashboard Data
 *     tags: [Dashboards]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: month
 *         schema:
 *           type: string
 *       - in: query
 *         name: year
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Dashboard KPIs
 */
router.get('/executive', authorizeRole('dashboard', 'executive'), dashboardController.executiveDashboard);
router.get('/employee', authorizeRole('dashboard', 'employee'), dashboardController.employeeDashboard);
router.get('/project', authorizeRole('dashboard', 'project'), dashboardController.projectDashboard);
router.get('/department', authorizeRole('dashboard', 'department'), dashboardController.departmentDashboard);
router.get('/client', authorizeRole('dashboard', 'client'), dashboardController.clientDashboard);
router.get('/company', authorizeRole('dashboard', 'company'), dashboardController.companyDashboard);

export default router;
