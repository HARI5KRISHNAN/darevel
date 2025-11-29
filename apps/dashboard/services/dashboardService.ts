import {
  PersonalDashboardData,
  TeamDashboardData,
  OrgDashboardData,
} from '../types';
import {
  MOCK_TASKS,
  MOCK_EVENTS,
  MOCK_EMAILS,
  MOCK_DOCS,
  CURRENT_USER,
  MOCK_ORG_STATS,
  MOCK_ACTIVITY_DATA,
} from '../constants';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const API_BASE_URL = (import.meta.env.VITE_DASHBOARD_API_BASE_URL ?? '').replace(/\/$/, '');
const withFallback = async <T>(path: string, fallback: () => Promise<T>): Promise<T> => {
  if (!API_BASE_URL) {
    return fallback();
  }

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Dashboard API error: ${response.status}`);
    }

    return (await response.json()) as T;
  } catch (error) {
    console.warn(`Falling back to mock data for ${path}`, error);
    return fallback();
  }
};

const mockPersonalDashboard = async (): Promise<PersonalDashboardData> => {
  await delay(400);
  return {
    tasks: MOCK_TASKS,
    events: MOCK_EVENTS,
    emails: MOCK_EMAILS,
    recentDocs: MOCK_DOCS,
    greeting: `Good morning, ${CURRENT_USER.name.split(' ')[0]}`,
  };
};

const mockTeamDashboard = async (): Promise<TeamDashboardData> => {
  await delay(500);
  return {
    teamName: 'Engineering Core',
    sprintTasks: MOCK_TASKS.map(task => ({ ...task, id: `${task.id}_team` })),
    upcomingDeadlines: [MOCK_TASKS[0], MOCK_TASKS[3]],
    activeMembers: [
      CURRENT_USER,
      { id: 'u2', name: 'Sarah C', role: 'MANAGER', avatar: 'https://picsum.photos/id/32/200/200' },
      { id: 'u3', name: 'Mike R', role: 'USER', avatar: 'https://picsum.photos/id/55/200/200' },
    ],
    teamDocs: MOCK_DOCS,
  };
};

const mockOrgDashboard = async (): Promise<OrgDashboardData> => {
  await delay(600);
  return {
    stats: MOCK_ORG_STATS,
    storageUsage: [{ used: 45, total: 100, unit: 'TB' }],
    activityData: MOCK_ACTIVITY_DATA,
    recentSignups: [],
  };
};

export const dashboardService = {
  async getPersonalDashboard(): Promise<PersonalDashboardData> {
    return withFallback<PersonalDashboardData>('/user', mockPersonalDashboard);
  },

  async getTeamDashboard(teamId: string): Promise<TeamDashboardData> {
    return withFallback<TeamDashboardData>(`/team/${teamId}`, mockTeamDashboard);
  },

  async getOrgDashboard(): Promise<OrgDashboardData> {
    return withFallback<OrgDashboardData>('/org', mockOrgDashboard);
  },
};
