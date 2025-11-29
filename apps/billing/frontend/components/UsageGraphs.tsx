import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { UsageMetrics } from '../types';

interface UsageGraphsProps {
  usage: UsageMetrics;
}

export const UsageGraphs: React.FC<UsageGraphsProps> = ({ usage }) => {
  const storagePercentage = Math.round((usage.storageUsedGB / usage.storageLimitGB) * 100);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Storage Usage</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900">{usage.storageUsedGB} GB</span>
            <span className="text-sm text-gray-500">of {usage.storageLimitGB} GB</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5 mt-4">
            <div className={`h-2.5 rounded-full ${storagePercentage > 90 ? 'bg-red-500' : 'bg-indigo-600'}`} style={{ width: `${storagePercentage}%` }}></div>
          </div>
          {storagePercentage > 90 && <p className="text-xs text-red-600 mt-2 font-medium">You are approaching your storage limit.</p>}
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Active Users</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900">{usage.usersCount}</span>
            <span className="text-sm text-gray-500">/ {usage.usersLimit} seats</span>
          </div>
          <div className="mt-4 text-sm text-indigo-600 hover:text-indigo-700 font-medium cursor-pointer">Manage users &rarr;</div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Usage History (Last 7 Days)</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={usage.history} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} cursor={{ fill: '#f9fafb' }} />
              <Bar dataKey="apiCalls" name="API Calls" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
