import express from 'express';
import { listEmployees, getEmployee, getEmployeeProfitability, getEmployeeTimesheetSummary, createEmployee, updateEmployee, deleteEmployee, listDepartments } from '../controllers/employee.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { authorizeRole } from '../middleware/rbac.middleware.js';

const router = express.Router();

router.use(verifyToken);

router.get('/', authorizeRole('employees', 'read'), listEmployees);
router.get('/departments', authorizeRole('employees', 'read'), listDepartments);
router.get('/:id', authorizeRole('employees', 'read'), getEmployee);
router.get('/:id/profitability', authorizeRole('employees', 'profitability'), getEmployeeProfitability);
router.get('/:id/timesheet-summary', authorizeRole('employees', 'read'), getEmployeeTimesheetSummary);
router.post('/', authorizeRole('employees', 'write'), createEmployee);
router.put('/:id', authorizeRole('employees', 'write'), updateEmployee);
router.delete('/:id', authorizeRole('employees', 'write'), deleteEmployee);

export default router;
