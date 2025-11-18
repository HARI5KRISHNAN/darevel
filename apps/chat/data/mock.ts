import { User, Project, ProjectTask, ProjectComment, ProjectFile } from '../types';

export const availableUsers: User[] = [];

// --- MOCK DATA FOR PROJECT DETAIL VIEW ---
const today = new Date();
const yesterday = new Date();
yesterday.setDate(today.getDate() - 1);
const tomorrow = new Date();
tomorrow.setDate(today.getDate() + 1);
const nextWeek = new Date();
nextWeek.setDate(today.getDate() + 7);

export const projectFiles: ProjectFile[] = [
    { id: 'f1', name: 'Project_Brief_v2.pdf', size: '2.3 MB', type: 'PDF', url: '#' },
    { id: 'f2', name: 'Homepage_Mockups.jpg', size: '5.1 MB', type: 'Image', url: '#' },
    { id: 'f3', name: 'User_Flow_Diagram.pdf', size: '1.2 MB', type: 'PDF', url: '#' },
    { id: 'f4', name: 'Marketing_Copy.docx', size: '128 KB', type: 'Word', url: '#' },
];

// FIX: Added a 'description' to each task to align with the updated ProjectTask interface, which now requires it for compatibility with the Task type.
export const projectTasks: ProjectTask[] = [
    { id: 't1', title: 'Finalize homepage mockup', description: 'Create the final version of the homepage based on client feedback.', completed: true, dueDate: yesterday.toISOString().split('T')[0] },
    { id: 't2', title: 'Develop user authentication flow', description: 'Implement login, registration, and password reset functionality.', completed: true, dueDate: today.toISOString().split('T')[0] },
    { id: 't3', title: 'Set up database schema', description: 'Design and create the necessary tables for the application.', completed: false, dueDate: tomorrow.toISOString().split('T')[0], attachments: [projectFiles[2]] },
    { id: 't4', title: 'Integrate payment gateway API', description: 'Connect the application to Stripe for payment processing.', completed: false, dueDate: nextWeek.toISOString().split('T')[0], attachments: [projectFiles[0], projectFiles[3]] },
    { id: 't5', title: 'User testing for the new dashboard', description: 'Conduct usability tests with a focus group.', completed: false },
    { id: 't6', title: 'Create wireframes for mobile view', description: 'Design the layout for key screens on mobile devices.', completed: true, dueDate: yesterday.toISOString().split('T')[0] },
    { id: 't7', title: 'Write API documentation', description: 'Document all endpoints for the backend API.', completed: false, dueDate: nextWeek.toISOString().split('T')[0] },
    { id: 't8', title: 'Deploy to staging server', description: 'Push the latest build to the staging environment for QA.', completed: false },
    { id: 't9', title: 'Fix login page CSS bug', description: 'The login button is misaligned on Firefox.', completed: true },
    { id: 't10', title: 'Client presentation preparation', description: 'Create slides and talking points for the upcoming client demo.', completed: false, dueDate: tomorrow.toISOString().split('T')[0] },
];

export const projectComments: ProjectComment[] = [];

export const initialProjects: Project[] = [
    { id: 'p1', title: 'Web Design', category: 'Web Design', categoryTheme: 'blue', description: 'Wireframing, mockups, clients collaboration', progress: 50, members: [], comments: 6, attachments: 4, status: 'Started', tasks: [projectTasks[0], projectTasks[5]] },
    { id: 'p2', title: 'Mobile App', category: 'Mobile App', categoryTheme: 'orange', description: 'Wireframing, mockups, clients collaboration', progress: 30, members: [], comments: 6, attachments: 4, status: 'On Going', tasks: [projectTasks[6]] },
    { id: 'p3', title: 'Dashboard', category: 'Dashboard', categoryTheme: 'purple', description: 'Wireframing, mockups, clients collaboration', progress: 90, members: [], comments: 6, attachments: 4, status: 'Completed', tasks: [projectTasks[1], projectTasks[8]] },
    { id: 'p4', title: 'App Development', category: 'App Development', categoryTheme: 'pink', description: 'Wireframing, mockups, clients collaboration', progress: 60, members: [], comments: 6, attachments: 4, status: 'Started', tasks: [projectTasks[2], projectTasks[3], projectTasks[4]] },
    { id: 'p5', title: 'Dashboard', category: 'Dashboard', categoryTheme: 'purple', description: 'Wireframing, mockups, clients collaboration', progress: 40, members: [], comments: 6, attachments: 4, status: 'On Going', highlighted: true, tasks: [projectTasks[4], projectTasks[9]] },
    { id: 'p6', title: 'Landing Page', category: 'Landing Page', categoryTheme: 'sky', description: 'Wireframing, mockups, clients collaboration', progress: 70, members: [], comments: 6, attachments: 4, status: 'Completed', tasks: [] },
    { id: 'p7', title: 'Mobile App', category: 'Mobile App', categoryTheme: 'orange', description: 'Wireframing, mockups, clients collaboration', progress: 65, members: [], comments: 6, attachments: 4, status: 'Started', tasks: [projectTasks[7]] },
    { id: 'p8', title: 'Web Development', category: 'Web Development', categoryTheme: 'blue', description: 'Wireframing, mockups, clients collaboration', progress: 50, members: [], comments: 6, attachments: 4, status: 'On Going', tasks: [projectTasks[2]] },
    { id: 'p9', title: 'App Development', category: 'App Development', categoryTheme: 'pink', description: 'Wireframing, mockups, clients collaboration', progress: 80, members: [], comments: 6, attachments: 4, status: 'Completed', tasks: [projectTasks[1], projectTasks[6]] },
];