import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, HardDrive, FileText, Zap, ArrowUp, ArrowDown } from 'lucide-react';
import { Card, Badge } from './ui/UIComponents';
import { mockApi } from '../services/mockApi';

const StatCard: React.FC<{ title: string; value: string | number; subtext?: string; icon: React.ElementType; trend?: 'up' | 'down' }> = ({
  title,
  value,
  subtext,
  icon: Icon,
  trend,
}) => (
  <Card className="p-6">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
        {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
      </div>
      <div
        className={`p-2 rounded-lg ${
          trend === 'up'
            ? 'bg-green-50 text-green-600'
            : trend === 'down'
              ? 'bg-red-50 text-red-600'
              : 'bg-indigo-50 text-indigo-600'
        }`}
      >
        <Icon className="w-5 h-5" />
      </div>
    </div>
    {trend && (
      <div className={`mt-4 flex items-center text-xs font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
        {trend === 'up' ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />}
        <span>12% from last month</span>
      </div>
    )}
  </Card>
);

const Dashboard: React.FC = () => {
  const { data: stats } = useQuery({ queryKey: ['stats'], queryFn: mockApi.fetchOrgStats });
  const { data: billing } = useQuery({ queryKey: ['billing'], queryFn: mockApi.fetchBillingInfo });
  const { data: activity } = useQuery({ queryKey: ['activity'], queryFn: mockApi.fetchActivity });

  const chartData = [
    { name: 'Mon', active: 4000 },
    { name: 'Tue', active: 3000 },
    { name: 'Wed', active: 2000 },
    { name: 'Thu', active: 2780 },
    { name: 'Fri', active: 1890 },
    { name: 'Sat', active: 2390 },
    { name: 'Sun', active: 3490 },
  ];

  if (!stats || !billing || !activity) return <div className="p-8 text-center text-gray-500">Loading dashboard...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">Welcome back, here's what's happening today.</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Billing Plan:</span>
          <Badge variant="neutral">{billing.plan}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Users" value={stats.totalUsers} subtext={`${stats.activeUsers} Active now`} icon={Users} trend="up" />
        <StatCard title="Storage Used" value={`${stats.storageUsedGB} GB`} subtext={`of ${stats.storageLimitGB} GB limit`} icon={HardDrive} />
        <StatCard title="Total Files" value={stats.filesCount.toLocaleString()} icon={FileText} trend="up" />
        <StatCard title="Top Integration" value={stats.topApp} icon={Zap} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">User Activity</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <CartesianGrid vertical={false} stroke="#e5e7eb" strokeDasharray="3 3" />
                <Tooltip />
                <Area type="monotone" dataKey="active" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorActive)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h3>
          <div className="flow-root">
            <ul className="-mb-8">
              {activity.map((event, eventIdx) => (
                <li key={event.id}>
                  <div className="relative pb-8">
                    {eventIdx !== activity.length - 1 ? <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" /> : null}
                    <div className="relative flex space-x-3">
                      <div>
                        <span
                          className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                            event.type === 'critical' ? 'bg-red-100' : event.type === 'warning' ? 'bg-yellow-100' : 'bg-gray-100'
                          }`}
                        >
                          <Zap
                            className={`w-4 h-4 ${
                              event.type === 'critical'
                                ? 'text-red-600'
                                : event.type === 'warning'
                                  ? 'text-yellow-600'
                                  : 'text-gray-500'
                            }`}
                          />
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p className="text-sm text-gray-500">
                            <span className="font-medium text-gray-900">{event.user}</span> {event.action}
                          </p>
                        </div>
                        <div className="text-right text-xs whitespace-nowrap text-gray-400">{event.timestamp}</div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-6">
            <button className="w-full text-center text-sm font-medium text-indigo-600 hover:text-indigo-500">View full audit logs</button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
