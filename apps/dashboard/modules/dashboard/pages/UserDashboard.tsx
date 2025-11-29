import React from 'react';
import { Sparkles, CheckSquare, Calendar as CalendarIcon, Mail, FileText } from 'lucide-react';
import { PersonalDashboardData } from '@/types';
import { Card } from '@/components/ui/Card';
import { TasksWidget, CalendarWidget, MailWidget, RecentDocsWidget } from '@/components/widgets/PersonalWidgets';

interface UserDashboardProps {
  data: PersonalDashboardData;
  onAskAi?: () => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({ data, onAskAi }) => {
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{data.greeting}</h1>
          <p className="text-slate-500">Here is what's on your plate for today.</p>
        </div>
        <button
          type="button"
          onClick={onAskAi}
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md shadow-indigo-200 hover:shadow-lg transition-all"
        >
          <Sparkles size={16} /> Ask AI Assistant
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <Card title="My Tasks" icon={<CheckSquare size={18} />} className="xl:col-span-1 h-96">
          <TasksWidget tasks={data.tasks} />
        </Card>

        <Card title="Today's Agenda" icon={<CalendarIcon size={18} />} className="xl:col-span-1 h-96">
          <CalendarWidget events={data.events} />
        </Card>

        <Card title="Inbox" icon={<Mail size={18} />} className="xl:col-span-1 h-96">
          <MailWidget emails={data.emails} />
        </Card>

        <Card title="Recent Files" icon={<FileText size={18} />} className="xl:col-span-1 h-96">
          <RecentDocsWidget docs={data.recentDocs} />
        </Card>
      </div>
    </div>
  );
};
