import * as uploadController from '../controllers/upload.controller.js';

import express from 'express';
import { verifyToken } from '../middleware/auth.middleware.js';
import { authorizeRole } from '../middleware/rbac.middleware.js';
import { upload } from '../middleware/upload.middleware.js';

const router = express.Router();

router.use(verifyToken);

router.post('/employees', authorizeRole('uploads', 'employee'), upload.single('file'), uploadController.uploadEmployees);
router.post('/timesheets', authorizeRole('uploads', 'timesheet'), upload.single('file'), uploadController.uploadTimesheets);
router.post('/revenue', authorizeRole('uploads', 'revenue'), upload.single('file'), uploadController.uploadRevenues);

router.get('/logs', authorizeRole('uploadLogs', 'read'), uploadController.getUploadLogs);
router.get('/logs/:id', authorizeRole('uploadLogs', 'read'), uploadController.getUploadLogById);
router.post('/validate', upload.single('file'), uploadController.validateUpload);
router.get('/template/:type', uploadController.getTemplate);

export default router;
