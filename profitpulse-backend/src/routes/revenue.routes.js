import express from 'express';
import { listRevenue, getRevenueSummary } from '../controllers/revenue.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { authorizeRole } from '../middleware/rbac.middleware.js';

const router = express.Router();

router.use(verifyToken);
router.get('/', authorizeRole('revenue', 'read'), listRevenue);
router.get('/summary', authorizeRole('revenue', 'read'), getRevenueSummary);

export default router;
