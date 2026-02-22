import express from 'express';
import { getConfig, updateConfig, getRbacConfig } from '../controllers/config.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { authorizeRole } from '../middleware/rbac.middleware.js';

const router = express.Router();

router.use(verifyToken);

// Any authenticated user can read the RBAC overrides (needed by rbacStore on login)
router.get('/rbac', getRbacConfig);

// Admin only for system config
router.get('/', authorizeRole('systemConfig', 'read'), getConfig);
router.put('/', authorizeRole('systemConfig', 'write'), updateConfig);

export default router;
