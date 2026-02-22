import express from 'express';
import { listTimesheets, getTimesheetSummary } from '../controllers/timesheet.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { authorizeRole } from '../middleware/rbac.middleware.js';

const router = express.Router();

router.use(verifyToken);
router.get('/', authorizeRole('timesheets', 'read'), listTimesheets);
router.get('/summary', authorizeRole('timesheets', 'read'), getTimesheetSummary);

export default router;
