import React from 'react';
import { Activity, Database } from 'lucide-react';
import { OrgDashboardData } from '@/types';
import { Card } from '@/components/ui/Card';
import { StatsGrid, ActivityChart, StorageChart } from '@/components/widgets/OrgWidgets';

interface OrgDashboardProps {
  data: OrgDashboardData;
}

export const OrgDashboard: React.FC<OrgDashboardProps> = ({ data }) => {
  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Organization Overview</h1>
        <p className="text-slate-500">Admin insights for Darevel.</p>
      </div>

      <StatsGrid stats={data.stats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Platform Activity (7 Days)" icon={<Activity size={18} />} className="lg:col-span-2 h-[400px]">
          <ActivityChart data={data.activityData} />
        </Card>

        <Card title="Storage Allocation" icon={<Database size={18} />} className="h-[400px]">
          <StorageChart used={data.storageUsage[0]?.used ?? 0} total={data.storageUsage[0]?.total ?? 1} />
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="System Health" className="h-48">
          <div className="flex items-center gap-4 mt-2">
            <div className="flex-1 bg-slate-50 p-4 rounded-lg border border-slate-100 flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-slate-700">API Uptime</div>
                <div className="text-xs text-slate-500">Last 30 days</div>
              </div>
              <span className="text-emerald-600 font-bold">99.98%</span>
            </div>
            <div className="flex-1 bg-slate-50 p-4 rounded-lg border border-slate-100 flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-slate-700">Database Load</div>
                <div className="text-xs text-slate-500">Current</div>
              </div>
              <span className="text-blue-600 font-bold">34%</span>
            </div>
          </div>
        </Card>
        <Card title="Pending Approvals" className="h-48">
          <div className="flex items-center justify-center h-full text-slate-400 text-sm">
            All systems nominal. No pending admin actions.
          </div>
        </Card>
      </div>
    </div>
  );
};
