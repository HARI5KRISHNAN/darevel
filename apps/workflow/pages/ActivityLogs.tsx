import React, { useEffect, useState } from 'react';
import { WorkflowService } from '../services/api';
import { GeminiService } from '../services/gemini';
import { WorkflowRun } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Loader2, AlertCircle, CheckCircle, Search } from 'lucide-react';

export const ActivityLogs: React.FC = () => {
  const [runs, setRuns] = useState<WorkflowRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);

  useEffect(() => {
    const fetchRuns = async () => {
      const data = await WorkflowService.getRuns();
      setRuns(data);
      setLoading(false);
    };
    fetchRuns();
    const interval = setInterval(fetchRuns, 5000);
    return () => clearInterval(interval);
  }, []);

  const analyzeRun = async (run: WorkflowRun) => {
    setAiAnalysis('Analyzing logs with Gemini...');
    const result = await GeminiService.analyzeRunError(run.logs);
    setAiAnalysis(result);
  };

  const chartData = [
    { name: 'Success', value: runs.filter(r => r.status === 'SUCCESS').length },
    { name: 'Failed', value: runs.filter(r => r.status === 'FAILED').length },
  ];

  if (loading) {
    return (
      <div className="p-10 text-center">
        <Loader2 className="animate-spin inline" /> Loading logs...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">Activity Logs</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Recent Executions</h2>
          <div className="space-y-0">
            {runs.length === 0 && <p className="text-slate-500">No runs yet.</p>}
            {runs.slice(0, 10).map(run => (
              <div
                key={run.id}
                className="flex items-start justify-between p-4 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors cursor-pointer group"
                onClick={() => analyzeRun(run)}
              >
                <div className="flex items-start gap-3">
                  {run.status === 'SUCCESS' ? (
                    <CheckCircle className="text-green-500 w-5 h-5 mt-0.5" />
                  ) : (
                    <AlertCircle className="text-red-500 w-5 h-5 mt-0.5" />
                  )}
                  <div>
                    <p className="font-medium text-sm text-slate-800">Workflow ID: {run.workflowId}</p>
                    <p className="text-xs text-slate-500">{new Date(run.triggeredAt).toLocaleString()}</p>
                    <div className="mt-1 font-mono text-xs text-slate-400 hidden group-hover:block bg-slate-100 p-1 rounded">
                      {run.logs[run.logs.length - 1]}
                    </div>
                  </div>
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    run.status === 'SUCCESS' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}
                >
                  {run.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-64">
            <h2 className="text-lg font-semibold mb-2">Run Status</h2>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip cursor={{ fill: 'transparent' }} />
                <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-indigo-600 text-white p-1 rounded">
                <Search className="w-3 h-3" />
              </div>
              <h3 className="font-bold text-indigo-900 text-sm">AI Log Analysis</h3>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">
              {aiAnalysis || 'Click on a row in the execution list to have Gemini analyze the logs for root cause or summary.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
