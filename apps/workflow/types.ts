export enum TriggerType {
  FORM_SUBMIT = 'FORM_SUBMIT',
  MAIL_RECEIVED = 'MAIL_RECEIVED',
  TASK_CREATED = 'TASK_CREATED',
  TASK_MOVED = 'TASK_MOVED',
  TASK_DUE = 'TASK_DUE',
  TASK_ASSIGNED = 'TASK_ASSIGNED',
  SCHEDULE = 'SCHEDULE',
  CHAT_MESSAGE = 'CHAT_MESSAGE',
  FILE_UPLOADED = 'FILE_UPLOADED',
  HR_EVENT = 'HR_EVENT',
  DEVOPS_PIPELINE = 'DEVOPS_PIPELINE',
  CALENDAR_EVENT = 'CALENDAR_EVENT'
}

export enum ActionType {
  CREATE_TASK = 'CREATE_TASK',
  SEND_EMAIL = 'SEND_EMAIL',
  SLACK_NOTIFY = 'SLACK_NOTIFY',
  UPDATE_CRM = 'UPDATE_CRM',
  DELAY = 'DELAY',
  ASSIGN_USER = 'ASSIGN_USER',
  MOVE_FILE = 'MOVE_FILE',
  KB_REPLY = 'KB_REPLY'
}

export enum WorkflowStatus {
  ACTIVE = 'ACTIVE',
  DISABLED = 'DISABLED',
  DRAFT = 'DRAFT'
}

export interface TriggerConfig {
  type: TriggerType;
  conditions: Record<string, any>;
}

export interface ActionConfig {
  id: string;
  type: ActionType;
  config: Record<string, any>;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  status: WorkflowStatus;
  trigger: TriggerConfig;
  actions: ActionConfig[];
  createdAt: string;
  lastRunAt?: string;
  runCount: number;
  owner?: 'Me' | 'Team' | 'Org';
}

export interface WorkflowRun {
  id: string;
  workflowId: string;
  triggeredAt: string;
  status: 'SUCCESS' | 'FAILED' | 'RUNNING';
  logs: string[];
}
