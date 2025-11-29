import { create } from 'zustand';
import { Role, User, Team, Resource, Permission } from '../types';
import { INITIAL_ROLES, INITIAL_USERS, INITIAL_TEAMS, INITIAL_RESOURCES, SYSTEM_PERMISSIONS } from '../constants';

interface AuthzState {
  roles: Role[];
  users: User[];
  teams: Team[];
  resources: Resource[];
  permissions: Permission[];
  
  // Actions
  addRole: (role: Role) => void;
  updateRole: (id: string, updates: Partial<Role>) => void;
  deleteRole: (id: string) => void;
  
  assignUserRole: (userId: string, roleId: string) => void;
  revokeUserRole: (userId: string, roleId: string) => void;
  
  assignTeamRole: (teamId: string, roleId: string) => void;
  revokeTeamRole: (teamId: string, roleId: string) => void;

  grantResourcePermission: (resourceId: string, subjectId: string, subjectType: 'user' | 'team', permission: string) => void;
  revokeResourcePermission: (resourceId: string, subjectId: string, subjectType: 'user' | 'team', permission: string) => void;
}

export const useAuthzStore = create<AuthzState>((set) => ({
  roles: INITIAL_ROLES,
  users: INITIAL_USERS,
  teams: INITIAL_TEAMS,
  resources: INITIAL_RESOURCES,
  permissions: SYSTEM_PERMISSIONS,

  addRole: (role) => set((state) => ({ roles: [...state.roles, role] })),
  
  updateRole: (id, updates) => set((state) => ({
    roles: state.roles.map((r) => (r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r))
  })),
  
  deleteRole: (id) => set((state) => ({
    roles: state.roles.filter((r) => r.id !== id)
  })),

  assignUserRole: (userId, roleId) => set((state) => ({
    users: state.users.map(u => 
      u.id === userId && !u.roles.includes(roleId) 
        ? { ...u, roles: [...u.roles, roleId] } 
        : u
    )
  })),

  revokeUserRole: (userId, roleId) => set((state) => ({
    users: state.users.map(u => 
      u.id === userId 
        ? { ...u, roles: u.roles.filter(r => r !== roleId) } 
        : u
    )
  })),

  assignTeamRole: (teamId, roleId) => set((state) => ({
    teams: state.teams.map(t =>
      t.id === teamId && !t.roles.includes(roleId)
        ? { ...t, roles: [...t.roles, roleId] }
        : t
    )
  })),

  revokeTeamRole: (teamId, roleId) => set((state) => ({
    teams: state.teams.map(t =>
      t.id === teamId
        ? { ...t, roles: t.roles.filter(r => r !== roleId) }
        : t
    )
  })),

  grantResourcePermission: (resourceId, subjectId, subjectType, permission) => set((state) => {
    return {
      resources: state.resources.map(res => {
        if (res.id !== resourceId) return res;
        
        const existingEntryIndex = res.acl.findIndex(e => e.subjectId === subjectId && e.subjectType === subjectType);
        
        let newAcl = [...res.acl];
        if (existingEntryIndex >= 0) {
          // Update existing
          const entry = newAcl[existingEntryIndex];
          if (!entry.permissions.includes(permission)) {
             newAcl[existingEntryIndex] = { ...entry, permissions: [...entry.permissions, permission] };
          }
        } else {
          // Create new
          newAcl.push({ subjectId, subjectType, permissions: [permission] });
        }
        return { ...res, acl: newAcl };
      })
    };
  }),

  revokeResourcePermission: (resourceId, subjectId, subjectType, permission) => set((state) => {
    return {
      resources: state.resources.map(res => {
        if (res.id !== resourceId) return res;
        
        const newAcl = res.acl.map(entry => {
          if (entry.subjectId === subjectId && entry.subjectType === subjectType) {
            return { ...entry, permissions: entry.permissions.filter(p => p !== permission) };
          }
          return entry;
        }).filter(entry => entry.permissions.length > 0); // Remove entry if no permissions left

        return { ...res, acl: newAcl };
      })
    };
  })
}));
