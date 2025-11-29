import { 
  Task, 
  TaskStatus, 
  Priority, 
  CalendarEvent, 
  Email, 
  Document,
  OrgStat,
  User 
} from './types';

export const CURRENT_USER: User = {
  id: 'u1',
  name: 'Alex Chen',
  avatar: 'https://picsum.photos/id/64/200/200',
  role: 'ADMIN'
};

export const MOCK_TASKS: Task[] = [
  { id: 't1', title: 'Review Q3 Financial Reports', status: TaskStatus.IN_PROGRESS, priority: Priority.HIGH, dueDate: 'Today' },
  { id: 't2', title: 'Update Dashboard Widget API', status: TaskStatus.TODO, priority: Priority.MEDIUM, dueDate: 'Tomorrow' },
  { id: 't3', title: 'Finalize Hiring Plan', status: TaskStatus.DONE, priority: Priority.HIGH, dueDate: 'Yesterday' },
  { id: 't4', title: 'Prepare Town Hall Slides', status: TaskStatus.IN_PROGRESS, priority: Priority.MEDIUM, dueDate: 'Thu' },
];

export const MOCK_EVENTS: CalendarEvent[] = [
  { id: 'e1', title: 'Product Sync', startTime: '10:00 AM', endTime: '11:00 AM', attendees: 5, type: 'MEETING' },
  { id: 'e2', title: 'Design Review', startTime: '01:30 PM', endTime: '02:30 PM', attendees: 3, type: 'MEETING' },
  { id: 'e3', title: 'Focus Time', startTime: '03:00 PM', endTime: '05:00 PM', attendees: 1, type: 'FOCUS' },
];

export const MOCK_EMAILS: Email[] = [
  { id: 'm1', subject: 'Project Alpha Update', sender: 'Sarah Connor', senderAvatar: 'https://picsum.photos/id/32/200/200', preview: 'Here are the latest metrics from the...', timestamp: '10m ago', isUnread: true },
  { id: 'm2', subject: 'New Policy Changes', sender: 'HR Team', preview: 'Please review the attached handbook...', timestamp: '1h ago', isUnread: true },
  { id: 'm3', subject: 'Lunch?', sender: 'Mike Ross', senderAvatar: 'https://picsum.photos/id/55/200/200', preview: 'Are we still on for tacos today?', timestamp: '2h ago', isUnread: false },
];

export const MOCK_DOCS: Document[] = [
  { id: 'd1', title: 'Q3 Marketing Strategy', type: 'DOC', lastModified: '2h ago', author: 'Alex Chen' },
  { id: 'd2', title: 'Budget 2024_v2', type: 'SHEET', lastModified: '1d ago', author: 'Finance' },
  { id: 'd3', title: 'All Hands Deck', type: 'SLIDE', lastModified: '3d ago', author: 'Sarah Connor' },
];

export const MOCK_ORG_STATS: OrgStat[] = [
  { label: 'Total Users', value: '1,240', change: 12.5, trend: 'up' },
  { label: 'Active Projects', value: '86', change: 5.2, trend: 'up' },
  { label: 'Storage Used', value: '4.2 TB', change: 8.1, trend: 'up' },
  { label: 'Avg. Response Time', value: '1.2h', change: -2.4, trend: 'down' }, // down is good for time
];

export const MOCK_ACTIVITY_DATA = [
  { name: 'Mon', users: 400, docs: 240, tasks: 240 },
  { name: 'Tue', users: 300, docs: 139, tasks: 221 },
  { name: 'Wed', users: 200, docs: 980, tasks: 229 },
  { name: 'Thu', users: 278, docs: 390, tasks: 200 },
  { name: 'Fri', users: 189, docs: 480, tasks: 218 },
  { name: 'Sat', users: 239, docs: 380, tasks: 250 },
  { name: 'Sun', users: 349, docs: 430, tasks: 210 },
];
