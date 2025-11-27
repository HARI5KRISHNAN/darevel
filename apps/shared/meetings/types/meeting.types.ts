// Meeting Types for shared meetings module

export interface Meeting {
  id: string;
  title: string;
  description?: string;
  startTime: string; // ISO date string
  endTime: string; // ISO date string
  location?: string;
  meetingLink?: string;
  roomName?: string;
  organizer: MeetingParticipant;
  participants: MeetingParticipant[];
  status: MeetingStatus;
  isRecurring?: boolean;
  recurrence?: RecurrenceRule;
  reminders?: MeetingReminder[];
  createdAt: string;
  updatedAt: string;
}

export interface MeetingParticipant {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status: ParticipantStatus;
}

export type MeetingStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
export type ParticipantStatus = 'pending' | 'accepted' | 'declined' | 'tentative';

export interface RecurrenceRule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  endDate?: string;
  count?: number;
  daysOfWeek?: number[]; // 0 = Sunday, 6 = Saturday
}

export interface MeetingReminder {
  type: 'email' | 'notification';
  minutesBefore: number;
}

export interface CreateMeetingRequest {
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  location?: string;
  participantIds: string[];
  participantEmails?: string[];
  generateVideoLink?: boolean;
  sendInvites?: boolean;
  reminders?: MeetingReminder[];
}

export interface UpdateMeetingRequest {
  title?: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  meetingLink?: string;
  status?: MeetingStatus;
  participantIds?: string[];
}

export interface MeetingFilter {
  status?: MeetingStatus;
  startDate?: string;
  endDate?: string;
  organizerId?: string;
  participantId?: string;
}

// To-Do Note types
export interface TodoNote {
  id: string;
  content: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTodoRequest {
  content: string;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
}

// Calendar Event (combines meetings and other calendar items)
export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: 'meeting' | 'task' | 'reminder';
  color?: string;
  data?: Meeting | TodoNote;
}
