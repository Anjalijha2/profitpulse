import { StatusCodes } from 'http-status-codes';
import { rolePermissions } from '../config/roles.js';
import { apiResponse } from '../utils/apiResponse.js';

/**
 * Middleware to check RBAC
 * @param {string} resource The resource being accessed (e.g., 'users')
 * @param {string} action The action being performed (e.g., 'read', 'write')
 */
export const authorizeRole = (resource, action) => {
    return (req, res, next) => {
        // Requires verifyToken to have run first
        if (!req.user || !req.user.role) {
            return res.status(StatusCodes.UNAUTHORIZED).json(apiResponse(false, 'Authentication required for authorization.'));
        }

        const { role } = req.user;

        // Check if the role is defined in our matrix
        if (!rolePermissions[role]) {
            return res.status(StatusCodes.FORBIDDEN).json(apiResponse(false, 'Role not recognized.'));
        }

        // Check if the resource exists in role map
        const resourceMap = rolePermissions[role][resource];
        if (!resourceMap) {
            return res.status(StatusCodes.FORBIDDEN).json(apiResponse(false, 'Access to this resource is forbidden.'));
        }

        // Check specific action
        const permission = resourceMap[action];

        if (permission === true) {
            // Full access
            req.accessContext = 'all';
            return next();
        }

        if (permission === 'own') {
            // Scoped access (department / own project)
            // Controller must handle the filtering via req.accessContext & req.user.department_id
            req.accessContext = 'own';
            return next();
        }

        // No permission
        return res.status(StatusCodes.FORBIDDEN).json(apiResponse(false, 'You do not have permission to perform this action.'));
    };
};
