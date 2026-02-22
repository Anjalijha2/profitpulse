import express from 'express';
import { listProjects, getProject, createProject, updateProject, getProjectProfitability, getProjectBurnRate } from '../controllers/project.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { authorizeRole } from '../middleware/rbac.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { projectValidation } from '../validations/project.validation.js';

const router = express.Router();

router.use(verifyToken);

router.get('/', authorizeRole('projects', 'read'), listProjects);
router.get('/:id', authorizeRole('projects', 'read'), getProject);
router.post('/', authorizeRole('projects', 'write'), validateRequest(projectValidation.createProject), createProject);
router.put('/:id', authorizeRole('projects', 'write'), validateRequest(projectValidation.updateProject), updateProject);
router.get('/:id/profitability', authorizeRole('projects', 'read'), getProjectProfitability);
router.get('/:id/burn-rate', authorizeRole('projects', 'read'), getProjectBurnRate);

export default router;
