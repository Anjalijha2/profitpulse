import express from 'express';
import * as reportController from '../controllers/report.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { authorizeRole } from '../middleware/rbac.middleware.js';

const router = express.Router();

router.use(verifyToken);

/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: Export to Excel APIs
 */

/**
 * @swagger
 * /reports/project-profitability:
 *   get:
 *     summary: Download project profitability report
 *     tags: [Reports]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Excel File Buffer
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get('/project-profitability', authorizeRole('reports', 'export'), reportController.downloadProjectReport);
router.get('/employee-profitability', authorizeRole('reports', 'export'), reportController.downloadEmployeeReport);
router.get('/department-profitability', authorizeRole('reports', 'export'), reportController.downloadDepartmentReport);
router.get('/utilization', authorizeRole('reports', 'export'), reportController.downloadUtilizationReport);

export default router;
