import React from 'react';
import { PREBUILT_TEMPLATES } from '../services/api';
import { TriggerType } from '../types';
import { useNavigate } from 'react-router-dom';
import { FileText, Mail, Kanban, MessageSquare, Users, GitBranch, Calendar, Zap, ArrowRight } from 'lucide-react';

const getIcon = (type: TriggerType) => {
  switch (type) {
    case TriggerType.FORM_SUBMIT:
      return FileText;
    case TriggerType.MAIL_RECEIVED:
      return Mail;
    case TriggerType.TASK_MOVED:
      return Kanban;
    case TriggerType.CHAT_MESSAGE:
      return MessageSquare;
    case TriggerType.HR_EVENT:
      return Users;
    case TriggerType.DEVOPS_PIPELINE:
      return GitBranch;
    case TriggerType.CALENDAR_EVENT:
      return Calendar;
    default:
      return Zap;
  }
};

export const TemplateGallery: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Template Gallery</h1>
        <p className="text-slate-500 mt-2 text-lg">Jumpstart your automation with pre-built workflows.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {PREBUILT_TEMPLATES.map(tpl => {
          const Icon = getIcon(tpl.trigger.type);
          return (
            <div key={tpl.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-6 flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-800">{tpl.name}</h3>
              </div>
              <p className="text-slate-600 text-sm mb-6 flex-1">{tpl.description}</p>

              <div className="flex items-center justify-between mt-auto">
                <div className="flex gap-2">
                  <span className="bg-slate-100 text-slate-500 text-xs px-2 py-1 rounded">
                    {tpl.trigger.type.split('_')[0]}
                  </span>
                  <span className="bg-slate-100 text-slate-500 text-xs px-2 py-1 rounded">
                    {tpl.actions.length} Actions
                  </span>
                </div>
                <button
                  onClick={() => navigate(`/workflows/new?templateId=${tpl.id}`)}
                  className="flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  Use Template <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
