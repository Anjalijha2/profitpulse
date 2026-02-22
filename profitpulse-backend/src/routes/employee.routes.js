import express from 'express';
import { listEmployees, getEmployee, getEmployeeProfitability, getEmployeeTimesheetSummary } from '../controllers/employee.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { authorizeRole } from '../middleware/rbac.middleware.js';

const router = express.Router();

router.use(verifyToken);

router.get('/', authorizeRole('employees', 'read'), listEmployees);
router.get('/:id', authorizeRole('employees', 'read'), getEmployee);
router.get('/:id/profitability', authorizeRole('employees', 'profitability'), getEmployeeProfitability);
router.get('/:id/timesheet-summary', authorizeRole('employees', 'read'), getEmployeeTimesheetSummary);

export default router;
