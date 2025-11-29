import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { OrgStat } from '../../types';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

// --- Stat Cards Grid ---
export const StatsGrid: React.FC<{ stats: OrgStat[] }> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, idx) => (
        <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-sm font-medium text-slate-500">{stat.label}</span>
          <div className="flex items-end justify-between mt-2">
            <span className="text-2xl font-bold text-slate-800">{stat.value}</span>
            <div className={`flex items-center text-xs font-bold px-1.5 py-0.5 rounded ${
              stat.trend === 'up' ? 'text-emerald-700 bg-emerald-100' : 
              stat.trend === 'down' ? 'text-rose-700 bg-rose-100' : 'text-slate-700 bg-slate-100'
            }`}>
              {stat.trend === 'up' && <ArrowUpRight size={12} className="mr-1" />}
              {stat.trend === 'down' && <ArrowDownRight size={12} className="mr-1" />}
              {stat.trend === 'neutral' && <Minus size={12} className="mr-1" />}
              {Math.abs(stat.change)}%
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// --- Main Analytics Chart ---
export const ActivityChart: React.FC<{ data: any[] }> = ({ data }) => {
  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 10,
            left: 0,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorDocs" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} dy={10} />
          <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            itemStyle={{ fontSize: '12px', fontWeight: 600 }}
          />
          <Area type="monotone" dataKey="users" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorUsers)" />
          <Area type="monotone" dataKey="docs" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorDocs)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

// --- Storage Usage Widget ---
export const StorageChart: React.FC<{ used: number, total: number }> = ({ used, total }) => {
  const percentage = (used / total) * 100;
  
  return (
    <div className="flex flex-col items-center justify-center h-full p-4">
        <div className="relative w-32 h-32">
             <svg className="w-full h-full" viewBox="0 0 36 36">
                <path
                  className="text-slate-100"
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.5"
                />
                <path
                  className="text-indigo-600"
                  strokeDasharray={`${percentage}, 100`}
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
             </svg>
             <div className="absolute inset-0 flex flex-col items-center justify-center">
               <span className="text-2xl font-bold text-slate-800">{used}</span>
               <span className="text-[10px] text-slate-500 uppercase font-semibold">TB Used</span>
             </div>
        </div>
        <div className="mt-4 text-center">
          <p className="text-sm text-slate-600">You have used <span className="font-bold">{percentage.toFixed(0)}%</span> of your total storage.</p>
          <button className="mt-3 text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline">Manage Storage</button>
        </div>
    </div>
  );
};
