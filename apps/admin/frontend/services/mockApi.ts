import { User, UserStatus, Team, SecurityPolicy, ActivityLog, OrgStats, BillingInfo, TeamMember, TeamRole } from '../types';

const DELAY = 600;

let users: User[] = Array.from({ length: 25 }).map((_, i) => ({
  id: `user-${i}`,
  name: i === 0 ? 'Admin User' : `User ${i}`,
  email: `user${i}@acme.com`,
  status: i % 5 === 0 ? UserStatus.DEACTIVATED : UserStatus.ACTIVE,
  roles: i === 0 ? ['ORG_ADMIN'] : ['MEMBER'],
  teamIds: i % 2 === 0 ? ['team-1'] : ['team-2'],
  avatarUrl: `https://picsum.photos/seed/${i}/40/40`,
}));

let teams: Team[] = [
  { id: 'team-1', name: 'Engineering', description: 'Core product development', memberCount: 12 },
  { id: 'team-2', name: 'Sales', description: 'Global sales team', memberCount: 8 },
  { id: 'team-3', name: 'Marketing', description: 'Brand and outreach', memberCount: 5 },
];

interface Membership {
  teamId: string;
  userId: string;
  role: TeamRole;
}

let memberships: Membership[] = [];

users.forEach(u => {
  u.teamIds.forEach(tid => {
    memberships.push({
      teamId: tid,
      userId: u.id,
      role: 'Member',
    });
  });
});

memberships.forEach((m, i) => {
  if (i % 10 === 0) m.role = 'Owner';
});

let policy: SecurityPolicy = {
  mfaRequired: true,
  minPasswordLength: 12,
  requireSpecialChar: true,
  requireNumber: true,
  sessionTimeout: 60,
  allowedIpRanges: ['192.168.1.0/24'],
};

const activityLogs: ActivityLog[] = [
  { id: '1', user: 'Admin User', action: 'Updated security policy', timestamp: '2 mins ago', type: 'critical' },
  { id: '2', user: 'User 4', action: 'Invited new member', timestamp: '1 hour ago', type: 'info' },
  { id: '3', user: 'System', action: 'Monthly billing processed', timestamp: '1 day ago', type: 'info' },
  { id: '4', user: 'User 12', action: 'Failed login attempt', timestamp: '1 day ago', type: 'warning' },
];

export const mockApi = {
  fetchOrgStats: async (): Promise<OrgStats> => {
    return new Promise(resolve =>
      setTimeout(
        () =>
          resolve({
            totalUsers: users.length,
            activeUsers: users.filter(u => u.status === UserStatus.ACTIVE).length,
            storageUsedGB: 450,
            storageLimitGB: 1000,
            filesCount: 12403,
            topApp: 'Slack Integration',
          }),
        DELAY
      )
    );
  },

  fetchBillingInfo: async (): Promise<BillingInfo> => {
    return new Promise(resolve =>
      setTimeout(
        () =>
          resolve({
            plan: 'Enterprise',
            status: 'Active',
            renewalDate: '2024-12-31',
            seatsUsed: users.length,
            seatsTotal: 50,
          }),
        DELAY
      )
    );
  },

  fetchUsers: async (search = ''): Promise<User[]> => {
    return new Promise(resolve =>
      setTimeout(() => {
        const filtered = users.filter(u =>
          u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
        );
        resolve(filtered);
      }, DELAY)
    );
  },

  createUser: async (user: Omit<User, 'id' | 'avatarUrl'>): Promise<User> => {
    return new Promise(resolve =>
      setTimeout(() => {
        const newUser = {
          ...user,
          id: `user-${Date.now()}`,
          avatarUrl: `https://picsum.photos/seed/${Date.now()}/40/40`,
        };
        users = [newUser, ...users];
        resolve(newUser);
      }, DELAY)
    );
  },

  updateUserStatus: async (id: string, status: UserStatus): Promise<void> => {
    return new Promise(resolve =>
      setTimeout(() => {
        users = users.map(u => (u.id === id ? { ...u, status } : u));
        resolve();
      }, DELAY)
    );
  },

  fetchTeams: async (): Promise<Team[]> => {
    return new Promise(resolve =>
      setTimeout(() => {
        const teamsWithCounts = teams.map(t => ({
          ...t,
          memberCount: memberships.filter(m => m.teamId === t.id).length,
        }));
        resolve(teamsWithCounts);
      }, DELAY)
    );
  },

  updateTeam: async (id: string, updates: Partial<Team>): Promise<void> => {
    return new Promise(resolve =>
      setTimeout(() => {
        teams = teams.map(t => (t.id === id ? { ...t, ...updates } : t));
        resolve();
      }, DELAY)
    );
  },

  createTeam: async (team: Omit<Team, 'id' | 'memberCount'>): Promise<Team> => {
    return new Promise(resolve =>
      setTimeout(() => {
        const newTeam = {
          ...team,
          id: `team-${Date.now()}`,
          memberCount: 0,
        };
        teams = [...teams, newTeam];
        resolve(newTeam);
      }, DELAY)
    );
  },

  fetchTeamMembers: async (teamId: string): Promise<TeamMember[]> => {
    return new Promise(resolve =>
      setTimeout(() => {
        const membersForTeam = memberships
          .filter(m => m.teamId === teamId)
          .map(m => {
            const user = users.find(u => u.id === m.userId);
            if (!user) return null;
            return {
              userId: user.id,
              name: user.name,
              email: user.email,
              avatarUrl: user.avatarUrl,
              role: m.role,
            };
          })
          .filter((m): m is TeamMember => m !== null);
        resolve(membersForTeam);
      }, DELAY)
    );
  },

  addTeamMember: async (teamId: string, userId: string, role: TeamRole = 'Member'): Promise<void> => {
    return new Promise(resolve =>
      setTimeout(() => {
        if (!memberships.some(m => m.teamId === teamId && m.userId === userId)) {
          memberships.push({ teamId, userId, role });
        }
        resolve();
      }, DELAY)
    );
  },

  removeTeamMember: async (teamId: string, userId: string): Promise<void> => {
    return new Promise(resolve =>
      setTimeout(() => {
        memberships = memberships.filter(m => !(m.teamId === teamId && m.userId === userId));
        resolve();
      }, DELAY)
    );
  },

  updateTeamMemberRole: async (teamId: string, userId: string, role: TeamRole): Promise<void> => {
    return new Promise(resolve =>
      setTimeout(() => {
        memberships = memberships.map(m => (m.teamId === teamId && m.userId === userId ? { ...m, role } : m));
        resolve();
      }, DELAY)
    );
  },

  fetchPolicy: async (): Promise<SecurityPolicy> => {
    return new Promise(resolve => setTimeout(() => resolve(policy), DELAY));
  },

  updatePolicy: async (newPolicy: SecurityPolicy): Promise<void> => {
    return new Promise(resolve =>
      setTimeout(() => {
        policy = newPolicy;
        resolve();
      }, DELAY)
    );
  },

  fetchActivity: async (): Promise<ActivityLog[]> => {
    return new Promise(resolve => setTimeout(() => resolve(activityLogs), DELAY));
  },
};
