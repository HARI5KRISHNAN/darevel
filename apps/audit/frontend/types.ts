export enum ActionType {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  SECURITY = 'SECURITY',
}

export enum ResourceType {
  FILE = 'FILE',
  DOC = 'DOC',
  SHEET = 'SHEET',
  USER = 'USER',
  BILLING = 'BILLING',
  DRIVE = 'DRIVE',
}

export interface AuditLogMetadata {
  [key: string]: any;
}

export interface AuditLog {
  id: string;
  workspaceId: string;
  action: ActionType;
  resourceType: ResourceType;
  resourceId: string;
  resourceName: string;
  userId: string;
  userName: string;
  userEmail: string;
  ipAddress: string;
  macAddress: string;
  description: string;
  userAgent?: string;
  timestamp: string;
  metadata?: AuditLogMetadata;
}

export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  key: keyof AuditLog;
  direction: SortDirection;
}

export interface AuditFilters {
  action?: ActionType | '';
  resourceType?: ResourceType | '';
  search: string;
  startDate: string;
  endDate: string;
  user?: string;
  resourceId?: string;
}

export interface PaginationMeta {
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

export interface FetchLogsResponse {
  data: AuditLog[];
  meta: PaginationMeta;
}