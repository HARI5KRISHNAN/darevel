import React from 'react';
import { Workflow, WorkflowStatus, TriggerType } from '../types';
import { Play, Mail, FileText, Calendar, GitBranch, MessageSquare, Users, Kanban, MoreVertical, Zap, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const getCategoryInfo = (type: TriggerType) => {
  switch (type) {
    case TriggerType.FORM_SUBMIT:
      return { icon: FileText, color: 'text-green-600', bg: 'bg-green-100', label: 'Forms' };
    case TriggerType.MAIL_RECEIVED:
      return { icon: Mail, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Email' };
    case TriggerType.TASK_MOVED:
    case TriggerType.TASK_CREATED:
    case TriggerType.TASK_DUE:
    case TriggerType.TASK_ASSIGNED:
      return { icon: Kanban, color: 'text-sky-600', bg: 'bg-sky-100', label: 'Kanban' };
    case TriggerType.CHAT_MESSAGE:
      return { icon: MessageSquare, color: 'text-purple-600', bg: 'bg-purple-100', label: 'Chat' };
    case TriggerType.HR_EVENT:
      return { icon: Users, color: 'text-pink-600', bg: 'bg-pink-100', label: 'HR' };
    case TriggerType.DEVOPS_PIPELINE:
      return { icon: GitBranch, color: 'text-slate-600', bg: 'bg-slate-100', label: 'DevOps' };
    case TriggerType.SCHEDULE:
    case TriggerType.CALENDAR_EVENT:
      return { icon: Calendar, color: 'text-orange-600', bg: 'bg-orange-100', label: 'Calendar' };
    default:
      return { icon: Zap, color: 'text-indigo-600', bg: 'bg-indigo-100', label: 'Custom' };
  }
};

interface Props {
  workflow: Workflow;
  onToggleStatus: (id: string) => void;
  onDelete: (id: string) => void;
  onRun: (id: string) => void;
}

export const WorkflowCard: React.FC<Props> = ({ workflow, onToggleStatus, onRun }) => {
  const cat = getCategoryInfo(workflow.trigger.type);
  const Icon = cat.icon;

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    return isToday
      ? `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
      : date.toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col h-full group">
      <div className="p-5 flex items-start justify-between pb-3">
        <div className="flex gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${cat.bg}`}>
            <Icon className={`w-6 h-6 ${cat.color}`} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors cursor-pointer">
                <Link to={`/workflows/${workflow.id}`}>{workflow.name}</Link>
              </h3>
            </div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{cat.label}</p>
          </div>
        </div>
        <div className="relative">
          <button className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="px-5 pb-5 flex-1">
        <p className="text-sm text-slate-600 line-clamp-2 mb-4 min-h-[40px] leading-relaxed">
          {workflow.description || 'No description provided.'}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-50 text-slate-600 border border-slate-200">
            <Zap className="w-3 h-3 mr-1.5 text-slate-400" />
            {workflow.trigger.type.split('_').join(' ')}
          </span>
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-50 text-slate-600 border border-slate-200">
            {workflow.actions.length} Action{workflow.actions.length !== 1 && 's'}
          </span>
        </div>
      </div>

      <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50 rounded-b-xl">
        <div className="flex flex-col">
          <div className="flex items-center text-xs text-slate-500 mb-1">
            <Clock className="w-3 h-3 mr-1" />
            {formatDate(workflow.lastRunAt)}
          </div>
          <div className="text-[10px] font-semibold text-slate-400">RUNS: {workflow.runCount.toLocaleString()}</div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onRun(workflow.id)}
            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 hover:shadow-sm transition-all"
            title="Run Now"
          >
            <Play className="w-4 h-4 fill-current" />
          </button>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={workflow.status === WorkflowStatus.ACTIVE}
              onChange={() => onToggleStatus(workflow.id)}
            />
            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </div>
      </div>
    </div>
  );
};
