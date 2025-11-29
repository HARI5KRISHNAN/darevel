import React, { useState, useEffect } from 'react';
import { Task, CalendarEvent, Email, Document, TaskStatus, Priority } from '../../types';
import { CheckCircle2, Circle, Clock, Paperclip, FileText, FileSpreadsheet, Presentation, Mail, Calendar as CalendarIcon, ListFilter, X } from 'lucide-react';

// --- Task List Widget ---
export const TasksWidget: React.FC<{ tasks: Task[] }> = ({ tasks: initialTasks }) => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'ALL'>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'ALL'>('ALL');

  // Sync state if props change (e.g. data refresh or parent update)
  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  const toggleTaskStatus = (taskId: string) => {
    setTasks(currentTasks => 
      currentTasks.map(t => {
        if (t.id === taskId) {
           // Toggle logic: If DONE -> TODO. If anything else -> DONE.
           // When unchecking, default back to TODO.
           const newStatus = t.status === TaskStatus.DONE ? TaskStatus.TODO : TaskStatus.DONE;
           return { ...t, status: newStatus };
        }
        return t;
      })
    );
  };

  const filteredTasks = tasks.filter(task => {
    const statusMatch = statusFilter === 'ALL' || task.status === statusFilter;
    const priorityMatch = priorityFilter === 'ALL' || task.priority === priorityFilter;
    return statusMatch && priorityMatch;
  });

  const FilterPill = ({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) => (
    <button
      onClick={onClick}
      className={`text-[10px] font-medium px-2.5 py-1 rounded-full border transition-all whitespace-nowrap
        ${active
          ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
          : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-300 hover:text-indigo-600'
        }`}
    >
      {label}
    </button>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header / Filter Toggle */}
      <div className="flex items-center justify-between mb-2 flex-shrink-0">
        <span className="text-xs font-semibold text-slate-400">
          {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
        </span>
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-md transition-colors
            ${showFilters ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:text-indigo-600 hover:bg-slate-50'}`}
        >
          {showFilters ? <X size={14} /> : <ListFilter size={14} />}
          {showFilters ? 'Close' : 'Filter'}
        </button>
      </div>

      {/* Filter Options Area */}
      {showFilters && (
        <div className="bg-slate-50/80 border border-slate-100 rounded-lg p-3 mb-3 flex flex-col gap-3 flex-shrink-0 animate-in slide-in-from-top-2 duration-200">
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Status</span>
            <div className="flex flex-wrap gap-2">
              <FilterPill label="All" active={statusFilter === 'ALL'} onClick={() => setStatusFilter('ALL')} />
              <FilterPill label="To Do" active={statusFilter === TaskStatus.TODO} onClick={() => setStatusFilter(TaskStatus.TODO)} />
              <FilterPill label="In Progress" active={statusFilter === TaskStatus.IN_PROGRESS} onClick={() => setStatusFilter(TaskStatus.IN_PROGRESS)} />
              <FilterPill label="Done" active={statusFilter === TaskStatus.DONE} onClick={() => setStatusFilter(TaskStatus.DONE)} />
            </div>
          </div>
          <div className="space-y-1.5 border-t border-slate-200/50 pt-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Priority</span>
            <div className="flex flex-wrap gap-2">
              <FilterPill label="All" active={priorityFilter === 'ALL'} onClick={() => setPriorityFilter('ALL')} />
              <FilterPill label="High" active={priorityFilter === Priority.HIGH} onClick={() => setPriorityFilter(Priority.HIGH)} />
              <FilterPill label="Medium" active={priorityFilter === Priority.MEDIUM} onClick={() => setPriorityFilter(Priority.MEDIUM)} />
              <FilterPill label="Low" active={priorityFilter === Priority.LOW} onClick={() => setPriorityFilter(Priority.LOW)} />
            </div>
          </div>
        </div>
      )}

      {/* Tasks List */}
      <div className="flex flex-col gap-1 overflow-y-auto custom-scrollbar flex-1 min-h-0">
        {filteredTasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center h-full">
            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
              <CheckCircle2 className="text-slate-300" size={24} />
            </div>
            <p className="text-slate-500 text-sm font-medium">No tasks found</p>
            <p className="text-slate-400 text-xs">Try adjusting your filters</p>
          </div>
        )}
        
        {filteredTasks.map((task) => (
          <div key={task.id} className="group flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-slate-200 flex-shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  toggleTaskStatus(task.id);
                }}
                className="text-slate-300 hover:text-indigo-600 flex-shrink-0 transition-colors"
              >
                {task.status === TaskStatus.DONE ? (
                  <CheckCircle2 size={20} className="text-emerald-500" />
                ) : (
                  <Circle size={20} />
                )}
              </button>
              <div className="flex flex-col min-w-0">
                <span className={`text-sm font-medium truncate ${task.status === TaskStatus.DONE ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                  {task.title}
                </span>
                <span className="text-xs text-slate-400">{task.dueDate}</span>
              </div>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ml-2 flex-shrink-0
              ${task.priority === Priority.HIGH ? 'bg-rose-100 text-rose-600' : 
                task.priority === Priority.MEDIUM ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>
              {task.priority}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Calendar Widget ---
export const CalendarWidget: React.FC<{ events: CalendarEvent[] }> = ({ events }) => {
  return (
    <div className="flex flex-col gap-3 h-full overflow-y-auto custom-scrollbar">
      {events.map((event) => (
        <div key={event.id} className="flex gap-3 items-start p-1">
          <div className="flex flex-col items-center min-w-[50px] pt-1">
            <span className="text-xs font-bold text-slate-700">{event.startTime.split(' ')[0]}</span>
            <span className="text-[10px] text-slate-400">{event.startTime.split(' ')[1]}</span>
          </div>
          <div className={`flex-1 p-3 rounded-lg border-l-4 ${event.type === 'MEETING' ? 'border-indigo-500 bg-indigo-50' : event.type === 'FOCUS' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300 bg-slate-50'}`}>
            <h4 className="text-sm font-semibold text-slate-800">{event.title}</h4>
            <div className="flex items-center gap-2 mt-1">
              <Clock size={12} className="text-slate-400" />
              <span className="text-xs text-slate-500">{event.startTime} - {event.endTime}</span>
            </div>
          </div>
        </div>
      ))}
      <button className="mt-2 w-full py-2 text-xs font-medium text-slate-500 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
        View Full Calendar
      </button>
    </div>
  );
};

// --- Email Widget ---
export const MailWidget: React.FC<{ emails: Email[] }> = ({ emails }) => {
  return (
    <div className="flex flex-col h-full overflow-y-auto custom-scrollbar">
      {emails.map((email) => (
        <div key={email.id} className="flex items-start gap-3 p-3 border-b border-slate-50 last:border-0 hover:bg-slate-50 cursor-pointer transition-colors">
          <div className="relative">
            {email.senderAvatar ? (
              <img src={email.senderAvatar} alt={email.sender} className="w-9 h-9 rounded-full object-cover" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                {email.sender.charAt(0)}
              </div>
            )}
            {email.isUnread && <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-white"></div>}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-baseline mb-0.5">
              <h4 className={`text-sm truncate pr-2 ${email.isUnread ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                {email.sender}
              </h4>
              <span className="text-[10px] text-slate-400 whitespace-nowrap">{email.timestamp}</span>
            </div>
            <p className={`text-sm truncate ${email.isUnread ? 'text-slate-800 font-medium' : 'text-slate-600'}`}>{email.subject}</p>
            <p className="text-xs text-slate-400 truncate">{email.preview}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

// --- Recent Docs Widget ---
export const RecentDocsWidget: React.FC<{ docs: Document[] }> = ({ docs }) => {
  const getIcon = (type: Document['type']) => {
    switch(type) {
      case 'SHEET': return <FileSpreadsheet className="text-emerald-500" size={20} />;
      case 'SLIDE': return <Presentation className="text-amber-500" size={20} />;
      default: return <FileText className="text-blue-500" size={20} />;
    }
  };

  return (
    <div className="grid grid-cols-1 gap-2">
      {docs.map((doc) => (
        <div key={doc.id} className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/30 cursor-pointer transition-all">
          <div className="p-2 bg-white rounded-md shadow-sm border border-slate-100">
            {getIcon(doc.type)}
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-medium text-slate-700 hover:text-indigo-700">{doc.title}</h4>
            <span className="text-xs text-slate-400">Edited {doc.lastModified} by {doc.author}</span>
          </div>
          <button className="text-slate-300 hover:text-slate-600">
            <MoreHorizontalIcon />
          </button>
        </div>
      ))}
    </div>
  );
};

const MoreHorizontalIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="1" />
    <circle cx="19" cy="12" r="1" />
    <circle cx="5" cy="12" r="1" />
  </svg>
);