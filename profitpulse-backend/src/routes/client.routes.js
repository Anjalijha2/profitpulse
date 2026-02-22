import express from 'express';
import { listClients } from '../controllers/client.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { authorizeRole } from '../middleware/rbac.middleware.js';

const router = express.Router();

router.use(verifyToken);

// For now, allow reading clients to anyone authenticated, 
// or refine RBAC if needed (e.g., projects:write)
router.get('/', listClients);

export default router;
