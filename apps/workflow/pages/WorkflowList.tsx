import React, { useEffect, useState } from 'react';
import { WorkflowService } from '../services/api';
import { Workflow, TriggerType, WorkflowStatus } from '../types';
import { WorkflowCard } from '../components/WorkflowCard';
import { Plus, Search, Loader2, Filter, ChevronDown, Sparkles, User, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const TEMPLATES = [
  { title: 'Form to Slack', desc: 'Notify channel on new submission', trigger: 'Form', count: 2, color: 'bg-green-100 text-green-700' },
  { title: 'Auto-Assign Tasks', desc: 'Assign "In Progress" tasks', trigger: 'Kanban', count: 1, color: 'bg-sky-100 text-sky-700' },
  { title: 'Deadline Reminder', desc: 'Slack alert 2h before due', trigger: 'Kanban', count: 1, color: 'bg-sky-100 text-sky-700' },
  { title: 'Task to Slack', desc: 'Post completed tasks', trigger: 'Kanban', count: 1, color: 'bg-sky-100 text-sky-700' },
];

export const WorkflowList: React.FC = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [ownerFilter, setOwnerFilter] = useState<string>('ALL');

  const fetchData = async () => {
    try {
      const data = await WorkflowService.getWorkflows();
      setWorkflows(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggle = async (id: string) => {
    await WorkflowService.toggleStatus(id);
    setWorkflows(prev => prev.map(w =>
      w.id === id
        ? ({ ...w, status: w.status === WorkflowStatus.ACTIVE ? WorkflowStatus.DISABLED : WorkflowStatus.ACTIVE } as Workflow)
        : w
    ));
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure?')) {
      await WorkflowService.deleteWorkflow(id);
      setWorkflows(prev => prev.filter(w => w.id !== id));
    }
  };

  const handleRun = async (id: string) => {
    await WorkflowService.createMockRun(id);
    const data = await WorkflowService.getWorkflows();
    setWorkflows(data);
  };

  const filtered = workflows.filter(w => {
    const matchesSearch =
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.description.toLowerCase().includes(search.toLowerCase());

    const matchesType = filterType === 'ALL' || w.trigger.type === filterType;
    const matchesStatus = statusFilter === 'ALL' || w.status === statusFilter;
    const matchesOwner = ownerFilter === 'ALL' || (w.owner || 'Me') === ownerFilter;

    return matchesSearch && matchesType && matchesStatus && matchesOwner;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-indigo-600">
        <Loader2 className="w-10 h-10 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Workflows</h1>
          <p className="text-slate-500 mt-2 text-lg">Automate everything across your workspace.</p>
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap gap-3 w-full xl:w-auto items-center">
          <div className="relative flex-1 min-w-[200px] w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search workflows..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full shadow-sm"
            />
          </div>

          <div className="relative w-full sm:w-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-4 w-4 text-slate-400" />
            </div>
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="pl-9 pr-8 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm appearance-none cursor-pointer w-full sm:w-auto"
            >
              <option value="ALL">All Types</option>
              <option value={TriggerType.FORM_SUBMIT}>Forms</option>
              <option value={TriggerType.MAIL_RECEIVED}>Mail</option>
              <option value={TriggerType.TASK_MOVED}>Kanban</option>
              <option value={TriggerType.HR_EVENT}>HR</option>
              <option value={TriggerType.CHAT_MESSAGE}>Chat</option>
              <option value={TriggerType.DEVOPS_PIPELINE}>DevOps</option>
              <option value={TriggerType.CALENDAR_EVENT}>Calendar</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </div>
          </div>

          <div className="relative w-full sm:w-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <CheckCircle className="h-4 w-4 text-slate-400" />
            </div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="pl-9 pr-8 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm appearance-none cursor-pointer w-full sm:w-auto"
            >
              <option value="ALL">All Status</option>
              <option value={WorkflowStatus.ACTIVE}>Active</option>
              <option value={WorkflowStatus.DISABLED}>Paused</option>
              <option value={WorkflowStatus.DRAFT}>Draft</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </div>
          </div>

          <div className="relative w-full sm:w-auto">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-4 w-4 text-slate-400" />
            </div>
            <select
              value={ownerFilter}
              onChange={e => setOwnerFilter(e.target.value)}
              className="pl-9 pr-8 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm appearance-none cursor-pointer w-full sm:w-auto"
            >
              <option value="ALL">All Owners</option>
              <option value="Me">Me</option>
              <option value="Team">Team</option>
              <option value="Org">Org</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </div>
          </div>

          <Link
            to="/workflows/new"
            className="flex items-center justify-center px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all font-medium shadow-md hover:shadow-lg active:transform active:scale-95 whitespace-nowrap w-full sm:w-auto"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create
          </Link>
        </div>
      </div>

      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          <h2 className="font-semibold text-slate-800">Start fast with templates</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TEMPLATES.map((t, idx) => (
            <div key={idx} className="bg-white p-4 rounded-xl border border-indigo-100 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group">
              <div className="flex justify-between items-start mb-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide ${t.color}`}>{t.trigger}</span>
              </div>
              <h3 className="font-semibold text-slate-900 group-hover:text-indigo-700">{t.title}</h3>
              <p className="text-xs text-slate-500 mt-1">{t.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-medium text-slate-900">No workflows found</h3>
          <p className="text-slate-500 max-w-sm mx-auto mt-2 mb-6">Try adjusting your search or filters to find what you're looking for.</p>
          <button
            onClick={() => {
              setSearch('');
              setFilterType('ALL');
              setStatusFilter('ALL');
              setOwnerFilter('ALL');
            }}
            className="text-indigo-600 font-medium hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map(wf => (
            <WorkflowCard key={wf.id} workflow={wf} onToggleStatus={handleToggle} onDelete={handleDelete} onRun={handleRun} />
          ))}
        </div>
      )}
    </div>
  );
};
