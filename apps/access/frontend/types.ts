export interface Permission {
  id: string;
  code: string;
  name: string;
  description: string;
  module: 'docs' | 'wiki' | 'storage' | 'mail' | 'tasks' | 'calendar' | 'admin';
}

export interface Role {
  id: string;
  name: string;
  description: string;
  isSystem: boolean;
  permissions: string[]; // List of Permission codes
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  roles: string[]; // Role IDs
  teamIds: string[];
}

export interface Team {
  id: string;
  name: string;
  roles: string[]; // Role IDs
}

export interface Resource {
  id: string;
  name: string;
  type: 'doc' | 'file' | 'wiki';
  ownerId: string;
  acl: AccessControlEntry[];
}

export interface AccessControlEntry {
  subjectId: string;
  subjectType: 'user' | 'team';
  permissions: string[]; // Specific resource permissions e.g., 'read', 'write'
}

export type ViewState = 
  | { name: 'roles_list' }
  | { name: 'role_editor'; roleId?: string }
  | { name: 'users_list' }
  | { name: 'user_assignment'; userId: string }
  | { name: 'teams_list' }
  | { name: 'team_assignment'; teamId: string }
  | { name: 'resources_list' }
  | { name: 'resource_permissions'; resourceId: string; resourceType: Resource['type'] };
