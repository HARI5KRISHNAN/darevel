/**
 * Permissions Routes
 *
 * API endpoints for managing user permissions across infrastructure tools
 */

import express from 'express';
import {
  updatePermission,
  getMembers,
  updateMemberRole,
  addMember,
  deleteMember,
  checkAnsibleStatus
} from '../controllers/permissions.controller';

const router = express.Router();

/**
 * POST /api/permissions/update
 * Update user permission via Ansible playbook
 *
 * Body:
 * {
 *   "user": "John Doe",
 *   "email": "john@example.com",
 *   "tool": "jenkins|kubernetes|docker|git",
 *   "access": "read|write|execute",
 *   "namespace": "default",          // Optional, for Kubernetes
 *   "gitRepo": "owner/repo",         // Optional, for Git
 *   "gitServerType": "gitea"         // Optional, for Git (gitea|gitlab|github)
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "message": "✅ Successfully applied read permissions for john@example.com on jenkins",
 *   "output": "Ansible playbook output...",
 *   "details": {
 *     "user": "John Doe",
 *     "email": "john@example.com",
 *     "tool": "jenkins",
 *     "access": "read",
 *     "timestamp": "2025-02-10T10:30:00.000Z"
 *   }
 * }
 */
router.post('/update', updatePermission);

/**
 * GET /api/permissions/members
 * Get all members
 *
 * Response:
 * {
 *   "success": true,
 *   "members": [...]
 * }
 */
router.get('/members', getMembers);

/**
 * PUT /api/permissions/members/role
 * Update member role
 *
 * Body:
 * {
 *   "id": 1,
 *   "role": "Admin|Editor|Viewer"
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "message": "Successfully updated role for George Lindelof",
 *   "member": {...}
 * }
 */
router.put('/members/role', updateMemberRole);

/**
 * POST /api/permissions/members
 * Add new member
 *
 * Body:
 * {
 *   "name": "New User",
 *   "email": "new@example.com",
 *   "role": "Viewer"  // Optional, defaults to Viewer
 * }
 *
 * Response:
 * {
 *   "success": true,
 *   "message": "Successfully added member New User",
 *   "member": {...}
 * }
 */
router.post('/members', addMember);

/**
 * DELETE /api/permissions/members/:id
 * Delete member
 *
 * Response:
 * {
 *   "success": true,
 *   "message": "Successfully deleted member John Doe",
 *   "member": {...}
 * }
 */
router.delete('/members/:id', deleteMember);

/**
 * GET /api/permissions/ansible/status
 * Check if Ansible is installed and available
 *
 * Response:
 * {
 *   "success": true,
 *   "available": true,
 *   "version": "ansible [core 2.14.3]",
 *   "message": "Ansible is available"
 * }
 */
router.get('/ansible/status', checkAnsibleStatus);

/**
 * GET /api/permissions/audit/history
 * Audit logs have been disabled (MongoDB removed)
 */
router.get('/audit/history', async (req, res) => {
  res.status(503).json({
    success: false,
    message: 'Audit logs are not available. MongoDB has been removed from this application.',
    data: [],
    total: 0
  });
});

/**
 * GET /api/permissions/audit/stats
 * Audit stats have been disabled (MongoDB removed)
 */
router.get('/audit/stats', async (req, res) => {
  res.status(503).json({
    success: false,
    message: 'Audit stats are not available. MongoDB has been removed from this application.',
    stats: []
  });
});

/**
 * GET /api/permissions/audit/:id
 * Audit logs have been disabled (MongoDB removed)
 */
router.get('/audit/:id', async (req, res) => {
  res.status(503).json({
    success: false,
    message: 'Audit logs are not available. MongoDB has been removed from this application.'
  });
});

export default router;
