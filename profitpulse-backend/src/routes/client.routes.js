import express from 'express';
import { listClients, createClient, updateClient, deleteClient, getClientDetails } from '../controllers/client.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { authorizeRole } from '../middleware/rbac.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { clientValidation } from '../validations/client.validation.js';

const router = express.Router();

router.use(verifyToken);

router.get('/', authorizeRole('projects', 'read'), listClients);
router.get('/:id', authorizeRole('projects', 'read'), getClientDetails);
router.post('/', authorizeRole('projects', 'write'), validateRequest(clientValidation.createClient), createClient);
router.put('/:id', authorizeRole('projects', 'write'), validateRequest(clientValidation.updateClient), updateClient);
router.delete('/:id', authorizeRole('projects', 'write'), deleteClient);

export default router;
