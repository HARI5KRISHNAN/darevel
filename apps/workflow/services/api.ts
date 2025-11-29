import { Workflow, WorkflowStatus, WorkflowRun, TriggerType, ActionType } from '../types';

const STORAGE_KEY = 'flowengine_workflows';
const RUNS_KEY = 'flowengine_runs';

export const PREBUILT_TEMPLATES: Workflow[] = [
  {
    id: 'tpl-kanban-notify',
    name: 'Task Movement Alerts',
    description: 'Get notified in Slack when a task is moved to the "Done" column.',
    status: WorkflowStatus.DRAFT,
    createdAt: new Date().toISOString(),
    runCount: 0,
    trigger: {
      type: TriggerType.TASK_MOVED,
      conditions: { column: 'Done' },
    },
    actions: [
      {
        id: 'act-tpl-1',
        type: ActionType.SLACK_NOTIFY,
        config: { channel: '#project-updates', message: 'Task "{{task.title}}" has been completed by {{user.name}}.' },
      },
    ],
  },
  {
    id: 'tpl-kanban-assign',
    name: 'Auto-Assign Team Tasks',
    description: 'Automatically assign tasks to the development team when moved to "In Progress".',
    status: WorkflowStatus.DRAFT,
    createdAt: new Date().toISOString(),
    runCount: 0,
    trigger: {
      type: TriggerType.TASK_MOVED,
      conditions: { column: 'In Progress' },
    },
    actions: [
      {
        id: 'act-tpl-2',
        type: ActionType.ASSIGN_USER,
        config: { group: 'developers', method: 'round-robin' },
      },
      {
        id: 'act-tpl-3',
        type: ActionType.SLACK_NOTIFY,
        config: { channel: '#dev-team', message: 'New task assigned: {{task.title}}' },
      },
    ],
  },
  {
    id: 'tpl-form-slack',
    name: 'New Lead to Slack',
    description: 'Post a message to #sales when a new lead form is submitted.',
    status: WorkflowStatus.DRAFT,
    createdAt: new Date().toISOString(),
    runCount: 0,
    trigger: {
      type: TriggerType.FORM_SUBMIT,
      conditions: { formId: 'contact-us' },
    },
    actions: [
      {
        id: 'act-tpl-4',
        type: ActionType.SLACK_NOTIFY,
        config: { channel: '#sales', message: 'New Lead: {{data.email}}' },
      },
    ],
  },
  {
    id: 'tpl-hr-onboard',
    name: 'New Hire Onboarding',
    description: 'Create IT tasks and welcome email when a new employee joins.',
    status: WorkflowStatus.DRAFT,
    createdAt: new Date().toISOString(),
    runCount: 0,
    trigger: {
      type: TriggerType.HR_EVENT,
      conditions: { type: 'new_hire' },
    },
    actions: [
      {
        id: 'act-tpl-5',
        type: ActionType.CREATE_TASK,
        config: { title: 'Setup Laptop for {{employee.name}}' },
      },
      {
        id: 'act-tpl-6',
        type: ActionType.SEND_EMAIL,
        config: { to: '{{employee.email}}', template: 'welcome-packet' },
      },
    ],
  },
];

const seedWorkflows: Workflow[] = [
  {
    id: 'wf-1',
    name: 'New Lead to Slack',
    description: 'Notifies the sales channel when a high-value lead form is submitted.',
    status: WorkflowStatus.ACTIVE,
    createdAt: new Date().toISOString(),
    runCount: 1250,
    lastRunAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    trigger: {
      type: TriggerType.FORM_SUBMIT,
      conditions: { formId: 'enterprise-lead', minBudget: 5000 },
    },
    actions: [
      {
        id: 'act-1',
        type: ActionType.SLACK_NOTIFY,
        config: { channel: '#sales-leads', message: 'New Enterprise Lead: {{data.company}}' },
      },
      {
        id: 'act-2',
        type: ActionType.CREATE_TASK,
        config: { project: 'Sales Pipeline', priority: 'High' },
      },
    ],
    owner: 'Team',
  },
  {
    id: 'wf-2',
    name: 'Support Ticket Auto-Reply',
    description: 'Sends an email receipt when support@company.com receives mail.',
    status: WorkflowStatus.ACTIVE,
    createdAt: new Date().toISOString(),
    runCount: 890,
    lastRunAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    trigger: {
      type: TriggerType.MAIL_RECEIVED,
      conditions: { fromDomain: '!internal.com' },
    },
    actions: [
      {
        id: 'act-3',
        type: ActionType.SEND_EMAIL,
        config: { template: 'ticket-received', to: '{{trigger.sender}}' },
      },
    ],
    owner: 'Me',
  },
  {
    id: 'wf-3',
    name: 'Kanban: Task to Slack',
    description: 'Posts to #engineering when a card moves to "Done".',
    status: WorkflowStatus.ACTIVE,
    createdAt: new Date().toISOString(),
    runCount: 45,
    lastRunAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    trigger: {
      type: TriggerType.TASK_MOVED,
      conditions: { column: 'Done' },
    },
    actions: [{ id: 'act-4', type: ActionType.SLACK_NOTIFY, config: { message: 'Task Completed: {{task.title}}' } }],
    owner: 'Team',
  },
  {
    id: 'wf-7',
    name: 'Auto-Assign Tasks',
    description: 'Automatically assigns tasks moved to "In Progress" to the project lead.',
    status: WorkflowStatus.ACTIVE,
    createdAt: new Date().toISOString(),
    runCount: 89,
    lastRunAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    trigger: {
      type: TriggerType.TASK_MOVED,
      conditions: { column: 'In Progress' },
    },
    actions: [
      {
        id: 'act-9',
        type: ActionType.ASSIGN_USER,
        config: { user: 'project-lead', method: 'round-robin' },
      },
    ],
    owner: 'Team',
  },
  {
    id: 'wf-8',
    name: 'Deadline Reminder',
    description: 'Sends a Slack notification 2 hours before a task is due.',
    status: WorkflowStatus.ACTIVE,
    createdAt: new Date().toISOString(),
    runCount: 210,
    lastRunAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    trigger: {
      type: TriggerType.TASK_DUE,
      conditions: { timeBefore: '2h' },
    },
    actions: [
      {
        id: 'act-10',
        type: ActionType.SLACK_NOTIFY,
        config: { message: 'Reminder: Task "{{task.title}}" is due in 2 hours.' },
      },
    ],
    owner: 'Me',
  },
  {
    id: 'wf-4',
    name: 'HR: Onboarding Checklist',
    description: 'Creates subtasks and emails manager when a new employee is added.',
    status: WorkflowStatus.DRAFT,
    createdAt: new Date().toISOString(),
    runCount: 0,
    trigger: {
      type: TriggerType.HR_EVENT,
      conditions: { event: 'new_hire' },
    },
    actions: [
      { id: 'act-5', type: ActionType.CREATE_TASK, config: { title: 'IT Setup' } },
      { id: 'act-6', type: ActionType.SEND_EMAIL, config: { to: 'manager', subject: 'New Hire Prep' } },
    ],
    owner: 'Org',
  },
  {
    id: 'wf-5',
    name: 'DevOps: Deploy Success',
    description: 'Alerts the team when a production deployment succeeds.',
    status: WorkflowStatus.DISABLED,
    createdAt: new Date().toISOString(),
    runCount: 120,
    lastRunAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    trigger: {
      type: TriggerType.DEVOPS_PIPELINE,
      conditions: { status: 'success', env: 'prod' },
    },
    actions: [{ id: 'act-7', type: ActionType.SLACK_NOTIFY, config: { channel: '#releases' } }],
    owner: 'Team',
  },
  {
    id: 'wf-6',
    name: 'Chat: Help to Knowledge Base',
    description: 'If user sends "help" in chat, auto-reply with KB link.',
    status: WorkflowStatus.ACTIVE,
    createdAt: new Date().toISOString(),
    runCount: 342,
    lastRunAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    trigger: {
      type: TriggerType.CHAT_MESSAGE,
      conditions: { keyword: 'help' },
    },
    actions: [{ id: 'act-8', type: ActionType.KB_REPLY, config: { articleId: 'faq-general' } }],
    owner: 'Org',
  },
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const WorkflowService = {
  getWorkflows: async (): Promise<Workflow[]> => {
    await delay(400);
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seedWorkflows));
      return seedWorkflows;
    }
    return JSON.parse(data);
  },

  getWorkflowById: async (id: string): Promise<Workflow | undefined> => {
    await delay(200);
    const workflows = await WorkflowService.getWorkflows();
    return workflows.find(w => w.id === id);
  },

  saveWorkflow: async (workflow: Workflow): Promise<void> => {
    await delay(500);
    const workflows = await WorkflowService.getWorkflows();
    const index = workflows.findIndex(w => w.id === workflow.id);
    if (index >= 0) {
      workflows[index] = workflow;
    } else {
      workflows.push(workflow);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workflows));
  },

  deleteWorkflow: async (id: string): Promise<void> => {
    await delay(300);
    const workflows = await WorkflowService.getWorkflows();
    const filtered = workflows.filter(w => w.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  },

  toggleStatus: async (id: string): Promise<WorkflowStatus> => {
    const workflows = await WorkflowService.getWorkflows();
    const wf = workflows.find(w => w.id === id);
    if (wf) {
      wf.status = wf.status === WorkflowStatus.ACTIVE ? WorkflowStatus.DISABLED : WorkflowStatus.ACTIVE;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(workflows));
      return wf.status;
    }
    throw new Error('Workflow not found');
  },

  getRuns: async (): Promise<WorkflowRun[]> => {
    await delay(300);
    const data = localStorage.getItem(RUNS_KEY);
    if (!data) return [];
    return JSON.parse(data);
  },

  createMockRun: async (workflowId: string): Promise<WorkflowRun> => {
    const runs = await WorkflowService.getRuns();
    const newRun: WorkflowRun = {
      id: `run-${Date.now()}`,
      workflowId,
      triggeredAt: new Date().toISOString(),
      status: Math.random() > 0.1 ? 'SUCCESS' : 'FAILED',
      logs: [
        `[INFO] Event received for workflow ${workflowId}`,
        `[INFO] Conditions matched.`,
        `[INFO] Executing Action 1...`,
        Math.random() > 0.1 ? `[INFO] Action 1 completed.` : `[ERROR] Action 1 timed out.`,
      ],
    };

    const workflows = await WorkflowService.getWorkflows();
    const wf = workflows.find(w => w.id === workflowId);
    if (wf) {
      wf.runCount += 1;
      wf.lastRunAt = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(workflows));
    }

    runs.unshift(newRun);
    localStorage.setItem(RUNS_KEY, JSON.stringify(runs.slice(0, 100)));
    return newRun;
  },
};
