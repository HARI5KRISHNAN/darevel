import { Permission, Role, User, Team, Resource } from './types';

// --- Permissions Definition ---
export const SYSTEM_PERMISSIONS: Permission[] = [
  // Docs
  { id: 'p1', code: 'docs.read', name: 'Read Documents', description: 'View documents', module: 'docs' },
  { id: 'p2', code: 'docs.write', name: 'Edit Documents', description: 'Create and edit documents', module: 'docs' },
  { id: 'p3', code: 'docs.comment', name: 'Comment', description: 'Add comments to documents', module: 'docs' },
  { id: 'p4', code: 'docs.share', name: 'Share', description: 'Share documents externally', module: 'docs' },
  
  // Wiki
  { id: 'p5', code: 'wiki.read', name: 'Read Wiki', description: 'View wiki pages', module: 'wiki' },
  { id: 'p6', code: 'wiki.write', name: 'Edit Wiki', description: 'Create and edit wiki pages', module: 'wiki' },
  { id: 'p7', code: 'wiki.manage', name: 'Manage Structure', description: 'Manage wiki hierarchy', module: 'wiki' },
  
  // Storage
  { id: 'p8', code: 'storage.read', name: 'View Files', description: 'View files in storage', module: 'storage' },
  { id: 'p9', code: 'storage.upload', name: 'Upload Files', description: 'Upload new files', module: 'storage' },
  { id: 'p10', code: 'storage.delete', name: 'Delete Files', description: 'Remove files', module: 'storage' },
  
  // Admin
  { id: 'p11', code: 'admin.users', name: 'Manage Users', description: 'Add or remove users', module: 'admin' },
  { id: 'p12', code: 'admin.roles', name: 'Manage Roles', description: 'Create and edit roles', module: 'admin' },
  { id: 'p13', code: 'admin.billing', name: 'Billing', description: 'Access billing information', module: 'admin' },
];

export const INITIAL_ROLES: Role[] = [
  {
    id: 'role_admin',
    name: 'Super Admin',
    description: 'Full access to all modules and settings.',
    isSystem: true,
    permissions: SYSTEM_PERMISSIONS.map(p => p.code),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'role_editor',
    name: 'Content Editor',
    description: 'Can edit docs and wiki, but cannot manage users.',
    isSystem: true,
    permissions: ['docs.read', 'docs.write', 'docs.comment', 'wiki.read', 'wiki.write', 'storage.read', 'storage.upload'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'role_viewer',
    name: 'Viewer',
    description: 'Read-only access.',
    isSystem: true,
    permissions: ['docs.read', 'wiki.read', 'storage.read'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const INITIAL_USERS: User[] = [
  { id: 'u1', name: 'Alice Johnson', email: 'alice@darevel.com', avatarUrl: 'https://picsum.photos/200', roles: ['role_admin'], teamIds: ['t1'] },
  { id: 'u2', name: 'Bob Smith', email: 'bob@darevel.com', avatarUrl: 'https://picsum.photos/201', roles: ['role_editor'], teamIds: ['t1'] },
  { id: 'u3', name: 'Charlie Brown', email: 'charlie@darevel.com', avatarUrl: 'https://picsum.photos/202', roles: ['role_viewer'], teamIds: ['t2'] },
];

export const INITIAL_TEAMS: Team[] = [
  { id: 't1', name: 'Engineering', roles: [] },
  { id: 't2', name: 'Marketing', roles: ['role_viewer'] },
];

export const INITIAL_RESOURCES: Resource[] = [
  { 
    id: 'doc_101', 
    name: 'Q3 Financial Roadmap', 
    type: 'doc', 
    ownerId: 'u1', 
    acl: [
      { subjectId: 'u2', subjectType: 'user', permissions: ['read', 'write'] }
    ] 
  },
  { 
    id: 'file_202', 
    name: 'Logo_Pack_v2.zip', 
    type: 'file', 
    ownerId: 'u3', 
    acl: [
      { subjectId: 't2', subjectType: 'team', permissions: ['read'] }
    ] 
  }
];
