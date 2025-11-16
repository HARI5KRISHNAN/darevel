/**
 * Permissions Controller
 *
 * Manages user permissions across infrastructure tools using Ansible automation
 *
 * Flow:
 * 1. Receive permission update request from frontend
 * 2. Validate inputs (user, tool, access level)
 * 3. Execute appropriate Ansible playbook
 * 4. Return results to frontend
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { Request, Response } from 'express';
import path from 'path';
import { existsSync } from 'fs';
import { PermissionAudit } from '../models/PermissionAudit';
import { isDatabaseConnected } from '../config/database';

const execAsync = promisify(exec);

// Valid tools and access levels
const VALID_TOOLS = ['jenkins', 'kubernetes', 'docker', 'git'];
const VALID_ACCESS_LEVELS = ['read', 'write', 'execute'];

interface PermissionUpdateRequest {
  user: string;
  email: string;
  tool: string;
  access: string;
  executor?: string;       // Who triggered the change
  namespace?: string;      // For Kubernetes
  gitRepo?: string;        // For Git
  gitServerType?: string;  // gitea, gitlab, github
}

interface Member {
  id: number;
  name: string;
  email: string;
  status: 'Active' | 'Inactive';
  role: 'Admin' | 'Editor' | 'Viewer';
}

// In-memory member storage (replace with database in production)
let members: Member[] = [
  { id: 1, name: 'George Lindelof', email: 'carlsen@armand.no', status: 'Active', role: 'Admin' },
  { id: 2, name: 'Eric Dyer', email: 'cristofer.ajer@ione.no', status: 'Active', role: 'Editor' },
  { id: 3, name: 'Haitam Alissami', email: 'haitam@gmail.com', status: 'Active', role: 'Viewer' },
  { id: 4, name: 'Michael Campbel', email: 'camp@hotmail.com', status: 'Inactive', role: 'Viewer' },
  { id: 5, name: 'Ashley Williams', email: 'williams.ash@newt.com', status: 'Active', role: 'Editor' },
  { id: 6, name: 'Vanessa Paradi', email: 'paradi.van@google.com', status: 'Active', role: 'Viewer' },
];

/**
 * Update user permission via Ansible playbook
 */
export const updatePermission = async (req: Request, res: Response): Promise<void> => {
  const startTime = Date.now();
  let auditLogId: string | null = null;

  try {
    const {
      user,
      email,
      tool,
      access,
      executor = 'system',
      namespace = 'default',
      gitRepo = 'darevel/main-repo',
      gitServerType = 'gitea'
    }: PermissionUpdateRequest = req.body;

    // Validate inputs
    if (!user || !email) {
      res.status(400).json({
        success: false,
        message: 'User and email are required'
      });
      return;
    }

    if (!VALID_TOOLS.includes(tool)) {
      res.status(400).json({
        success: false,
        message: `Invalid tool. Must be one of: ${VALID_TOOLS.join(', ')}`
      });
      return;
    }

    if (!VALID_ACCESS_LEVELS.includes(access)) {
      res.status(400).json({
        success: false,
        message: `Invalid access level. Must be one of: ${VALID_ACCESS_LEVELS.join(', ')}`
      });
      return;
    }

    // Build paths
    const playbookPath = path.join(__dirname, '../ansible/playbooks', `${tool}.yml`);
    const inventoryPath = path.join(__dirname, '../ansible/inventory.ini');

    // Check if playbook exists
    if (!existsSync(playbookPath)) {
      res.status(404).json({
        success: false,
        message: `Playbook not found: ${tool}.yml`
      });
      return;
    }

    // Check if inventory exists
    if (!existsSync(inventoryPath)) {
      res.status(404).json({
        success: false,
        message: 'Ansible inventory not found. Please configure inventory.ini'
      });
      return;
    }

    // Build Ansible command with extra vars
    let extraVars = `user=${email} access=${access}`;

    if (tool === 'kubernetes') {
      extraVars += ` namespace=${namespace}`;
    }

    if (tool === 'git') {
      extraVars += ` git_repo=${gitRepo} git_server_type=${gitServerType}`;
    }

    const ansibleCommand = `ansible-playbook -i "${inventoryPath}" "${playbookPath}" --extra-vars "${extraVars}"`;

    console.log(`🔧 Executing Ansible playbook: ${tool}.yml`);
    console.log(`📝 User: ${user} (${email})`);
    console.log(`🔑 Access: ${access}`);
    console.log(`👤 Executor: ${executor}`);

    // Execute Ansible playbook
    const { stdout, stderr } = await execAsync(ansibleCommand, {
      cwd: path.join(__dirname, '../ansible'),
      timeout: 120000, // 2 minutes timeout
    });

    const executionTime = Date.now() - startTime;

    // Check for Ansible errors
    if (stderr && !stderr.includes('warnings')) {
      console.error('❌ Ansible execution error:', stderr);

      // Log failed audit
      if (isDatabaseConnected()) {
        try {
          const audit = await PermissionAudit.create({
            executor,
            targetUser: email,
            tool,
            access,
            result: 'failed',
            output: stdout || '',
            errorMessage: stderr,
            metadata: {
              namespace,
              gitRepo,
              gitServerType,
              executionTime
            }
          });
          auditLogId = audit._id.toString();
          console.log(`📝 Audit log created: ${auditLogId}`);
        } catch (auditError: any) {
          console.error('Failed to create audit log:', auditError.message);
        }
      }

      res.status(500).json({
        success: false,
        message: 'Permission update failed',
        error: stderr,
        stdout,
        auditLogId
      });
      return;
    }

    // Success - Log audit
    console.log(`✅ Successfully updated permissions for ${user} on ${tool}`);

    if (isDatabaseConnected()) {
      try {
        const audit = await PermissionAudit.create({
          executor,
          targetUser: email,
          tool,
          access,
          result: 'success',
          output: stdout || '',
          metadata: {
            namespace,
            gitRepo,
            gitServerType,
            executionTime
          }
        });
        auditLogId = audit._id.toString();
        console.log(`📝 Audit log created: ${auditLogId}`);
      } catch (auditError: any) {
        console.error('Failed to create audit log:', auditError.message);
      }
    }

    res.json({
      success: true,
      message: `✅ Successfully applied ${access} permissions for ${user} on ${tool}`,
      output: stdout,
      auditLogId,
      details: {
        user,
        email,
        tool,
        access,
        executor,
        timestamp: new Date().toISOString(),
        executionTime: `${executionTime}ms`
      }
    });

  } catch (error: any) {
    console.error('Error updating permission:', error);

    const executionTime = Date.now() - startTime;
    const { email, tool, access, executor = 'system', namespace, gitRepo, gitServerType } = req.body;

    // Log failed audit for exceptions
    if (isDatabaseConnected() && email && tool && access) {
      try {
        const audit = await PermissionAudit.create({
          executor,
          targetUser: email,
          tool,
          access,
          result: 'failed',
          output: '',
          errorMessage: error.message || String(error),
          metadata: {
            namespace,
            gitRepo,
            gitServerType,
            executionTime,
            errorCode: error.code,
            errorSignal: error.signal
          }
        });
        auditLogId = audit._id.toString();
        console.log(`📝 Audit log created for error: ${auditLogId}`);
      } catch (auditError: any) {
        console.error('Failed to create audit log for error:', auditError.message);
      }
    }

    // Handle specific error types
    if (error.code === 'ENOENT') {
      res.status(500).json({
        success: false,
        message: 'Ansible is not installed or not in PATH. Please install Ansible first.',
        error: error.message,
        auditLogId
      });
      return;
    }

    if (error.killed || error.signal === 'SIGTERM') {
      res.status(500).json({
        success: false,
        message: 'Ansible execution timed out (exceeded 2 minutes)',
        error: error.message,
        auditLogId
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update permission',
      error: error.message,
      auditLogId
    });
  }
};

/**
 * Get all members
 */
export const getMembers = async (req: Request, res: Response): Promise<void> => {
  try {
    res.json({
      success: true,
      members
    });
  } catch (error: any) {
    console.error('Error fetching members:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch members',
      error: error.message
    });
  }
};

/**
 * Update member role
 */
export const updateMemberRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, role } = req.body;

    if (!id || !role) {
      res.status(400).json({
        success: false,
        message: 'Member ID and role are required'
      });
      return;
    }

    if (!['Admin', 'Editor', 'Viewer'].includes(role)) {
      res.status(400).json({
        success: false,
        message: 'Invalid role. Must be Admin, Editor, or Viewer'
      });
      return;
    }

    const memberIndex = members.findIndex(m => m.id === id);

    if (memberIndex === -1) {
      res.status(404).json({
        success: false,
        message: 'Member not found'
      });
      return;
    }

    members[memberIndex].role = role;

    res.json({
      success: true,
      message: `Successfully updated role for ${members[memberIndex].name}`,
      member: members[memberIndex]
    });

  } catch (error: any) {
    console.error('Error updating member role:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update member role',
      error: error.message
    });
  }
};

/**
 * Add new member
 */
export const addMember = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, role = 'Viewer' } = req.body;

    if (!name || !email) {
      res.status(400).json({
        success: false,
        message: 'Name and email are required'
      });
      return;
    }

    // Check if email already exists
    if (members.some(m => m.email === email)) {
      res.status(400).json({
        success: false,
        message: 'Member with this email already exists'
      });
      return;
    }

    const newMember: Member = {
      id: Math.max(...members.map(m => m.id)) + 1,
      name,
      email,
      status: 'Active',
      role
    };

    members.push(newMember);

    res.json({
      success: true,
      message: `Successfully added member ${name}`,
      member: newMember
    });

  } catch (error: any) {
    console.error('Error adding member:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add member',
      error: error.message
    });
  }
};

/**
 * Delete member
 */
export const deleteMember = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const memberIndex = members.findIndex(m => m.id === parseInt(id));

    if (memberIndex === -1) {
      res.status(404).json({
        success: false,
        message: 'Member not found'
      });
      return;
    }

    const deletedMember = members.splice(memberIndex, 1)[0];

    res.json({
      success: true,
      message: `Successfully deleted member ${deletedMember.name}`,
      member: deletedMember
    });

  } catch (error: any) {
    console.error('Error deleting member:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete member',
      error: error.message
    });
  }
};

/**
 * Check Ansible availability
 */
export const checkAnsibleStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { stdout } = await execAsync('ansible --version');

    res.json({
      success: true,
      available: true,
      version: stdout.split('\n')[0],
      message: 'Ansible is available'
    });

  } catch (error: any) {
    res.json({
      success: false,
      available: false,
      message: 'Ansible is not installed or not in PATH',
      error: error.message
    });
  }
};
