export enum UserStatus {
  ACTIVE = 'Active',
  DEACTIVATED = 'Deactivated',
  PENDING = 'Pending'
}

export interface User {
  id: string;
  name: string;
  email: string;
  status: UserStatus;
  roles: string[];
  teamIds: string[];
  avatarUrl: string;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  memberCount: number;
}

export type TeamRole = 'Owner' | 'Member';

export interface TeamMember {
  userId: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: TeamRole;
}

export interface SecurityPolicy {
  mfaRequired: boolean;
  minPasswordLength: number;
  requireSpecialChar: boolean;
  requireNumber: boolean;
  sessionTimeout: number;
  allowedIpRanges: string[];
}

export interface ActivityLog {
  id: string;
  user: string;
  action: string;
  timestamp: string;
  type: 'critical' | 'info' | 'warning';
}

export interface OrgStats {
  totalUsers: number;
  activeUsers: number;
  storageUsedGB: number;
  storageLimitGB: number;
  filesCount: number;
  topApp: string;
}

export interface BillingInfo {
  plan: string;
  status: 'Active' | 'Past Due';
  renewalDate: string;
  seatsUsed: number;
  seatsTotal: number;
}
