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
import { PermissionAudit } from '../models/PermissionAudit';
import { isDatabaseConnected } from '../config/database';

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
 * Get permission change audit history
 *
 * Query parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 20, max: 100)
 * - tool: Filter by tool (jenkins|kubernetes|docker|git)
 * - user: Filter by target user email
 * - executor: Filter by executor email
 * - result: Filter by result (success|failed)
 * - startDate: Filter by start date (ISO string)
 * - endDate: Filter by end date (ISO string)
 *
 * Response:
 * {
 *   "success": true,
 *   "total": 100,
 *   "page": 1,
 *   "limit": 20,
 *   "pages": 5,
 *   "data": [...]
 * }
 */
router.get('/audit/history', async (req, res) => {
  try {
    if (!isDatabaseConnected()) {
      return res.status(503).json({
        success: false,
        message: 'MongoDB is not connected. Audit logs unavailable.',
        data: [],
        total: 0
      });
    }

    // Parse pagination
    const page = Math.max(1, parseInt(req.query.page as string || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string || '20')));
    const skip = (page - 1) * limit;

    // Build filter
    const filter: any = {};

    if (req.query.tool) {
      filter.tool = req.query.tool;
    }

    if (req.query.user) {
      filter.targetUser = { $regex: req.query.user, $options: 'i' };
    }

    if (req.query.executor) {
      filter.executor = { $regex: req.query.executor, $options: 'i' };
    }

    if (req.query.result) {
      filter.result = req.query.result;
    }

    if (req.query.startDate || req.query.endDate) {
      filter.timestamp = {};
      if (req.query.startDate) {
        filter.timestamp.$gte = new Date(req.query.startDate as string);
      }
      if (req.query.endDate) {
        filter.timestamp.$lte = new Date(req.query.endDate as string);
      }
    }

    // Execute query
    const [total, audits] = await Promise.all([
      PermissionAudit.countDocuments(filter),
      PermissionAudit.find(filter)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
    ]);

    const pages = Math.ceil(total / limit);

    res.json({
      success: true,
      total,
      page,
      limit,
      pages,
      data: audits
    });

  } catch (error: any) {
    console.error('Failed to fetch audit history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch audit history',
      error: error.message
    });
  }
});

/**
 * GET /api/permissions/audit/stats
 * Get audit statistics
 *
 * Query parameters:
 * - startDate: Start date filter (ISO string)
 * - endDate: End date filter (ISO string)
 *
 * Response:
 * {
 *   "success": true,
 *   "stats": [
 *     {
 *       "_id": "jenkins",
 *       "total": 50,
 *       "successful": 45,
 *       "failed": 5
 *     }
 *   ]
 * }
 */
router.get('/audit/stats', async (req, res) => {
  try {
    if (!isDatabaseConnected()) {
      return res.status(503).json({
        success: false,
        message: 'MongoDB is not connected. Stats unavailable.',
        stats: []
      });
    }

    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (req.query.startDate) {
      startDate = new Date(req.query.startDate as string);
    }

    if (req.query.endDate) {
      endDate = new Date(req.query.endDate as string);
    }

    const stats = await (PermissionAudit as any).getStats(startDate, endDate);

    res.json({
      success: true,
      stats
    });

  } catch (error: any) {
    console.error('Failed to fetch audit stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch audit stats',
      error: error.message
    });
  }
});

/**
 * GET /api/permissions/audit/:id
 * Get specific audit log by ID
 *
 * Response:
 * {
 *   "success": true,
 *   "audit": {...}
 * }
 */
router.get('/audit/:id', async (req, res) => {
  try {
    if (!isDatabaseConnected()) {
      return res.status(503).json({
        success: false,
        message: 'MongoDB is not connected. Audit logs unavailable.'
      });
    }

    const audit = await PermissionAudit.findById(req.params.id).lean();

    if (!audit) {
      return res.status(404).json({
        success: false,
        message: 'Audit log not found'
      });
    }

    res.json({
      success: true,
      audit
    });

  } catch (error: any) {
    console.error('Failed to fetch audit log:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch audit log',
      error: error.message
    });
  }
});

export default router;
