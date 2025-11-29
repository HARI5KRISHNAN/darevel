import React from 'react';
import { CheckSquare, Calendar as CalendarIcon, FileText } from 'lucide-react';
import { TeamDashboardData, TaskStatus } from '@/types';
import { Card } from '@/components/ui/Card';
import { TasksWidget, RecentDocsWidget } from '@/components/widgets/PersonalWidgets';

interface TeamDashboardProps {
  data: TeamDashboardData;
}

export const TeamDashboard: React.FC<TeamDashboardProps> = ({ data }) => {
  const visibleMembers = data.activeMembers.slice(0, 4);
  const remainingMembers = Math.max(data.activeMembers.length - visibleMembers.length, 0);

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{data.teamName} Dashboard</h1>
          <p className="text-slate-500">Track team sprint progress and documents.</p>
        </div>
        <div className="flex -space-x-2">
          {visibleMembers.map(member => (
            <img
              key={member.id}
              src={member.avatar}
              alt={member.name}
              className="w-8 h-8 rounded-full ring-2 ring-white"
              title={member.name}
            />
          ))}
          {remainingMembers > 0 && (
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold ring-2 ring-white text-slate-600">
              +{remainingMembers}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Current Sprint Tasks" icon={<CheckSquare size={18} />} className="md:col-span-2 min-h-[400px]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-full">
            <div className="bg-slate-50 rounded-lg p-3">
              <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-400" /> In Progress
              </h4>
              <TasksWidget tasks={data.sprintTasks.filter(task => task.status === TaskStatus.IN_PROGRESS)} />
            </div>
            <div className="bg-slate-50 rounded-lg p-3">
              <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400" /> Review
              </h4>
              <TasksWidget tasks={data.sprintTasks.filter(task => task.status !== TaskStatus.IN_PROGRESS)} />
            </div>
          </div>
        </Card>

        <div className="flex flex-col gap-6">
          <Card title="Upcoming Deadlines" icon={<CalendarIcon size={18} />} className="flex-1">
            <TasksWidget tasks={data.upcomingDeadlines} />
          </Card>
          <Card title="Team Documents" icon={<FileText size={18} />} className="flex-1">
            <RecentDocsWidget docs={data.teamDocs} />
          </Card>
        </div>
      </div>
    </div>
  );
};
