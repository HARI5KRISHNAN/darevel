import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FormsAPI } from '../services/storage';
import { analyzeTextResponses } from '../services/geminiService';
import { Form, FormResponse, FieldType, FormField } from '../types';
import { Icons } from './ui/Icons';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip } from 'recharts';
import clsx from 'clsx';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#0ea5e9', '#10b981'];

const ResponseViewer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [form, setForm] = useState<Form | null>(null);
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [activeTab, setActiveTab] = useState<'summary' | 'individual'>('summary');

  useEffect(() => {
    if (id) {
      setForm(FormsAPI.get(id) || null);
      setResponses(FormsAPI.getFormResponses(id));
    }
  }, [id]);

  if (!form) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
       {/* Header */}
       <header className="h-20 glass border-b border-white/50 sticky top-0 z-30 px-8 flex items-center justify-between">
           <div className="flex items-center gap-4">
               <Link to={`/builder/${form.id}`} className="p-2 rounded-lg hover:bg-white/50 text-gray-500 transition-colors">
                    <Icons.ArrowLeft size={20} />
               </Link>
               <div>
                   <h1 className="text-lg font-bold text-gray-800">{form.title}</h1>
                   <p className="text-xs text-gray-500">Analytics Dashboard</p>
               </div>
           </div>

           <div className="flex bg-gray-200/50 p-1 rounded-lg">
                <button 
                    onClick={() => setActiveTab('summary')}
                    className={clsx("px-4 py-2 rounded-md text-sm font-medium transition-all", activeTab === 'summary' ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700")}
                >
                    Summary
                </button>
                <button 
                    onClick={() => setActiveTab('individual')}
                    className={clsx("px-4 py-2 rounded-md text-sm font-medium transition-all", activeTab === 'individual' ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700")}
                >
                    Individual
                </button>
           </div>
       </header>

      <main className="max-w-5xl mx-auto px-4 py-8 w-full">
         {/* Stats Cards */}
         <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="glass-card p-6 rounded-2xl">
                <span className="text-gray-500 text-sm font-medium">Total Responses</span>
                <div className="text-4xl font-bold text-gray-800 mt-2">{responses.length}</div>
            </div>
            <div className="glass-card p-6 rounded-2xl">
                <span className="text-gray-500 text-sm font-medium">Completion Rate</span>
                <div className="text-4xl font-bold text-gray-800 mt-2">100%</div>
            </div>
             <div className="glass-card p-6 rounded-2xl">
                <span className="text-gray-500 text-sm font-medium">Status</span>
                <div className="text-lg font-bold text-emerald-600 mt-3 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Active
                </div>
            </div>
         </div>

         {responses.length === 0 ? (
             <div className="text-center py-20 bg-white/50 rounded-3xl border border-white/50 backdrop-blur-sm">
                 <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                    <Icons.BarChart2 size={32} />
                 </div>
                 <h3 className="text-lg font-medium text-gray-900">No responses yet</h3>
                 <p className="text-gray-500 mt-2">Share your form link to start collecting data.</p>
             </div>
         ) : (
            <>
                {activeTab === 'summary' && (
                    <div className="space-y-6">
                        {form.fields.map(field => (
                            <SummaryCard key={field.id} field={field} responses={responses} />
                        ))}
                    </div>
                )}

                {activeTab === 'individual' && (
                    <div className="glass-card rounded-2xl overflow-hidden border border-white/60">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50/50 text-gray-600 font-semibold border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 w-48">Timestamp</th>
                                        {form.fields.map(f => (
                                            <th key={f.id} className="px-6 py-4 min-w-[200px]">{f.label}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {responses.map(r => (
                                        <tr key={r.id} className="hover:bg-purple-50/30 transition-colors">
                                            <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                                                {new Date(r.submittedAt).toLocaleString()}
                                            </td>
                                            {form.fields.map(f => {
                                                const ans = r.answers.find(a => a.fieldId === f.id)?.value;
                                                return (
                                                    <td key={f.id} className="px-6 py-4 text-gray-800">
                                                        {Array.isArray(ans) ? ans.join(', ') : (ans?.toString() || '-')}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </>
         )}
      </main>
    </div>
  );
};

const SummaryCard: React.FC<{ field: FormField, responses: FormResponse[] }> = ({ field, responses }) => {
    const values = responses.flatMap(r => {
        const ans = r.answers.find(a => a.fieldId === field.id)?.value;
        return Array.isArray(ans) ? ans : (ans ? [ans] : []);
    });

    const hasData = values.length > 0;
    const [aiAnalysis, setAiAnalysis] = useState<{ summary: string, sentiment: string, themes: string[] } | null>(null);
    const [loadingAi, setLoadingAi] = useState(false);

    const runAnalysis = async () => {
        setLoadingAi(true);
        const textValues = values.map(v => v.toString());
        const result = await analyzeTextResponses(field.label, textValues);
        setAiAnalysis(result);
        setLoadingAi(false);
    };

    if (!hasData) return null;

    const isText = [FieldType.SHORT_TEXT, FieldType.LONG_TEXT].includes(field.type);
    const isChartable = [FieldType.SINGLE_CHOICE, FieldType.MULTI_CHOICE, FieldType.DROPDOWN, FieldType.RATING].includes(field.type);

    const counts: Record<string, number> = {};
    values.forEach(v => {
        const key = v.toString();
        counts[key] = (counts[key] || 0) + 1;
    });
    const chartData = Object.entries(counts).map(([name, value]) => ({ name, value }));

    return (
        <div className="glass-card rounded-2xl p-8 border border-white/60">
            <h3 className="text-xl font-bold text-gray-800 mb-2">{field.label}</h3>
            <div className="text-sm text-gray-500 mb-6 flex items-center gap-2">
                <Icons.MessageSquare size={14} />
                {values.length} responses
            </div>

            {isChartable && (
                <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        {field.type === FieldType.RATING || chartData.length > 5 ? (
                             <BarChart data={chartData}>
                                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                                <RechartsTooltip 
                                    cursor={{fill: '#f3f4f6'}} 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} 
                                />
                                <Bar dataKey="value" fill="#8884d8" radius={[6, 6, 0, 0]}>
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                             </BarChart>
                        ) : (
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} />
                            </PieChart>
                        )}
                    </ResponsiveContainer>
                </div>
            )}

            {isText && (
                <div className="space-y-4">
                    {!aiAnalysis && (
                        <button 
                            onClick={runAnalysis}
                            disabled={loadingAi}
                            className="flex items-center gap-2 text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2 rounded-lg hover:shadow-lg hover:shadow-purple-500/20 transition-all"
                        >
                            <Icons.Wand2 size={14} />
                            {loadingAi ? 'Analyzing...' : 'Analyze with Gemini'}
                        </button>
                    )}

                    {aiAnalysis && (
                        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl p-5 text-sm">
                            <div className="flex items-center gap-2 mb-3 font-bold text-indigo-900">
                                <Icons.Wand2 size={16} className="text-purple-600" />
                                AI Insights
                            </div>
                            <p className="text-gray-700 mb-3 leading-relaxed">{aiAnalysis.summary}</p>
                            <div className="flex flex-wrap gap-2 mb-3">
                                <span className="bg-white px-3 py-1 rounded-full text-xs font-semibold text-gray-600 shadow-sm">Sentiment: {aiAnalysis.sentiment}</span>
                            </div>
                            <div>
                                <strong className="text-gray-800 block mb-1">Key Themes:</strong>
                                <ul className="list-disc list-inside text-gray-600 space-y-1">
                                    {aiAnalysis.themes.map((t, i) => <li key={i}>{t}</li>)}
                                </ul>
                            </div>
                        </div>
                    )}

                    <div className="max-h-60 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
                        {values.map((val, i) => (
                            <div key={i} className="bg-white/60 p-4 rounded-xl text-gray-700 text-sm border border-white/60 shadow-sm">
                                {val.toString()}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResponseViewer;