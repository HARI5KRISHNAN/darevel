// Enums
export enum DashboardView {
  PERSONAL = 'PERSONAL',
  TEAM = 'TEAM',
  ORG = 'ORG',
}

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

export enum Priority {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

// Data Models
export interface User {
  id: string;
  name: string;
  avatar: string;
  role: 'ADMIN' | 'USER' | 'MANAGER';
}

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  priority: Priority;
  dueDate: string;
  assignee?: User;
}

export interface CalendarEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  attendees: number;
  type: 'MEETING' | 'FOCUS' | 'OOO';
}

export interface Email {
  id: string;
  subject: string;
  sender: string;
  senderAvatar?: string;
  preview: string;
  timestamp: string;
  isUnread: boolean;
}

export interface Document {
  id: string;
  title: string;
  type: 'DOC' | 'SHEET' | 'SLIDE';
  lastModified: string;
  author: string;
}

export interface OrgStat {
  label: string;
  value: string | number;
  change: number; // percentage
  trend: 'up' | 'down' | 'neutral';
}

// Dashboard Payloads
export interface PersonalDashboardData {
  tasks: Task[];
  events: CalendarEvent[];
  emails: Email[];
  recentDocs: Document[];
  greeting: string;
}

export interface TeamDashboardData {
  teamName: string;
  sprintTasks: Task[];
  upcomingDeadlines: Task[]; // Reusing Task model
  activeMembers: User[];
  teamDocs: Document[];
}

export interface OrgDashboardData {
  stats: OrgStat[];
  storageUsage: { used: number; total: number; unit: string }[];
  activityData: { name: string; users: number; docs: number; tasks: number }[];
  recentSignups: User[];
}
