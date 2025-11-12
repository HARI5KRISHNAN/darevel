/**
 * Permission Audit Model
 *
 * Stores audit logs for all permission changes across infrastructure tools
 *
 * Fields:
 * - executor: Who triggered the permission change (email or username)
 * - targetUser: User who received the permission (email)
 * - tool: Infrastructure tool (jenkins, kubernetes, docker, git)
 * - access: Access level granted (read, write, execute)
 * - result: Outcome of the operation (success, failed)
 * - output: Ansible playbook output (stdout/stderr)
 * - errorMessage: Error details if operation failed
 * - timestamp: When the permission change occurred
 * - metadata: Additional context (namespace, gitRepo, etc.)
 */

import mongoose, { Schema, Document } from 'mongoose';

export interface IPermissionAudit extends Document {
  executor: string;
  targetUser: string;
  tool: 'jenkins' | 'kubernetes' | 'docker' | 'git';
  access: 'read' | 'write' | 'execute';
  result: 'success' | 'failed';
  output?: string;
  errorMessage?: string;
  timestamp: Date;
  metadata?: {
    namespace?: string;
    gitRepo?: string;
    gitServerType?: string;
    executionTime?: number;
    [key: string]: any;
  };
}

const PermissionAuditSchema: Schema = new Schema({
  executor: {
    type: String,
    required: true,
    index: true,
    trim: true
  },
  targetUser: {
    type: String,
    required: true,
    index: true,
    trim: true,
    lowercase: true
  },
  tool: {
    type: String,
    required: true,
    enum: ['jenkins', 'kubernetes', 'docker', 'git'],
    index: true
  },
  access: {
    type: String,
    required: true,
    enum: ['read', 'write', 'execute'],
    index: true
  },
  result: {
    type: String,
    required: true,
    enum: ['success', 'failed'],
    index: true,
    default: 'failed'
  },
  output: {
    type: String,
    default: ''
  },
  errorMessage: {
    type: String,
    default: ''
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt
  collection: 'permission_audits'
});

// Indexes for efficient querying
PermissionAuditSchema.index({ timestamp: -1 });
PermissionAuditSchema.index({ executor: 1, timestamp: -1 });
PermissionAuditSchema.index({ targetUser: 1, timestamp: -1 });
PermissionAuditSchema.index({ tool: 1, timestamp: -1 });
PermissionAuditSchema.index({ result: 1, timestamp: -1 });

// TTL index - automatically delete logs older than 90 days
// Uncomment if you want automatic cleanup
// PermissionAuditSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 }); // 90 days

// Virtual for human-readable timestamp
PermissionAuditSchema.virtual('timestampFormatted').get(function() {
  return this.timestamp.toLocaleString();
});

// Method to get summary
PermissionAuditSchema.methods.getSummary = function(): string {
  return `${this.executor} granted ${this.access} access to ${this.targetUser} on ${this.tool} - ${this.result}`;
};

// Static method to get audit stats
PermissionAuditSchema.statics.getStats = async function(
  startDate?: Date,
  endDate?: Date
): Promise<any> {
  const match: any = {};
  if (startDate || endDate) {
    match.timestamp = {};
    if (startDate) match.timestamp.$gte = startDate;
    if (endDate) match.timestamp.$lte = endDate;
  }

  const stats = await this.aggregate([
    { $match: match },
    {
      $group: {
        _id: {
          tool: '$tool',
          result: '$result'
        },
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: '$_id.tool',
        total: { $sum: '$count' },
        successful: {
          $sum: {
            $cond: [{ $eq: ['$_id.result', 'success'] }, '$count', 0]
          }
        },
        failed: {
          $sum: {
            $cond: [{ $eq: ['$_id.result', 'failed'] }, '$count', 0]
          }
        }
      }
    }
  ]);

  return stats;
};

// Ensure indexes are created
PermissionAuditSchema.set('autoIndex', true);

export const PermissionAudit = mongoose.models.PermissionAudit ||
  mongoose.model<IPermissionAudit>('PermissionAudit', PermissionAuditSchema);
