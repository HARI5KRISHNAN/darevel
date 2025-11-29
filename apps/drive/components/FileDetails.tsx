import React, { useState, useEffect } from 'react';
import { FileItem } from '../types';
import {
    X, Sparkles, FileText, Calendar, HardDrive, Share2, Loader2, Workflow,
    Clock, Tag, Eye, Shield, MessageSquare, History, User as UserIcon
} from 'lucide-react';
import { formatSize } from '../services/storageService';
import { generateFileSummary, suggestWorkflows } from '../services/geminiService';

interface FileDetailsProps {
  file: FileItem | null;
  onClose: () => void;
}

export const FileDetails: React.FC<FileDetailsProps> = ({ file, onClose }) => {
  const [activeTab, setActiveTab] = useState<'details' | 'activity' | 'ai'>('details');
  const [summary, setSummary] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState(false);

  // Reset state when file changes
  useEffect(() => {
    setSummary('');
    setLoadingAi(false);
    setActiveTab('details');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file?.id]);

  const handleGenerateSummary = async (f: FileItem) => {
    setLoadingAi(true);
    const result = await generateFileSummary(f);
    setSummary(result);
    setLoadingAi(false);
  };

  const handleGenerateWorkflow = async (f: FileItem) => {
      setLoadingAi(true);
      const result = await suggestWorkflows([f]);
      setSummary(result);
      setLoadingAi(false);
  };

  if (!file) {
    return (
        <div className="w-80 border-l border-gray-200 bg-white/50 backdrop-blur-xl h-full hidden lg:flex flex-col items-center justify-center text-gray-400 p-6 text-center">
            <div className="bg-slate-50 p-6 rounded-full mb-4 shadow-sm">
                <FileText className="h-10 w-10 text-slate-300"/>
            </div>
            <h3 className="text-slate-600 font-medium mb-1">No Selection</h3>
            <p className="text-xs text-slate-400">Select a file to view properties and insights</p>
        </div>
    );
  }

  return (
    <div className="w-80 border-l border-gray-200 bg-white/90 backdrop-blur-xl h-full flex flex-col shadow-2xl lg:shadow-none absolute right-0 top-0 bottom-0 z-30 lg:relative">

      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white/50">
        <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Smart Preview</span>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-white/30">
        {['details', 'activity', 'ai'].map((tab) => (
            <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wide border-b-2 transition-all ${
                    activeTab === tab
                    ? 'border-blue-500 text-blue-600 bg-blue-50/30'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-gray-50'
                }`}
            >
                {tab === 'ai' ? (
                    <span className="flex items-center justify-center gap-1"><Sparkles className="h-3 w-3" /> AI</span>
                ) : tab}
            </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">

        {/* --- DETAILS TAB --- */}
        {activeTab === 'details' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Thumbnail Preview Area */}
            <div className="flex flex-col items-center justify-center py-6 bg-slate-50/50 rounded-2xl border border-slate-100 mb-4 shadow-inner">
                {file.type === 'image' ? (
                     <div className="h-32 w-32 bg-slate-200 rounded-lg flex items-center justify-center text-slate-400 overflow-hidden relative">
                         {/* In a real app, render image thumbnail here */}
                        <div className="absolute inset-0 bg-indigo-100/50 flex items-center justify-center">
                             <span className="text-xs font-medium text-indigo-400">Preview</span>
                        </div>
                     </div>
                ) : (
                    <div className="h-24 w-24 bg-white rounded-2xl flex items-center justify-center border border-gray-100 shadow-sm">
                         <FileText className={`h-10 w-10 ${file.type === 'folder' ? 'text-blue-500' : 'text-slate-400'}`} />
                    </div>
                )}
                <p className="mt-3 text-sm font-semibold text-slate-700 px-4 text-center break-words w-full">{file.name}</p>
            </div>

            <div className="space-y-5">
                {/* Properties */}
                <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Properties</h4>

                    <div className="grid grid-cols-2 gap-y-3 gap-x-2">
                        <div>
                            <label className="text-[10px] font-medium text-slate-400">Type</label>
                            <p className="text-sm text-slate-700 capitalize">{file.type}</p>
                        </div>
                        <div>
                            <label className="text-[10px] font-medium text-slate-400">Size</label>
                            <p className="text-sm text-slate-700">{formatSize(file.size)}</p>
                        </div>
                        <div>
                            <label className="text-[10px] font-medium text-slate-400">Created</label>
                            <p className="text-xs text-slate-700">{new Date(file.updatedAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                            <label className="text-[10px] font-medium text-slate-400">Location</label>
                            <p className="text-xs text-slate-700 truncate">My Drive/Marketing</p>
                        </div>
                    </div>
                </div>

                {/* Owner & Collaborators (Unified Access List) */}
                <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Access</h4>

                    <div className="bg-white rounded-xl border border-gray-200/60 shadow-sm overflow-hidden">
                        {/* Owner Row */}
                        <div className="flex items-center justify-between p-3 hover:bg-slate-50 transition-colors border-b border-gray-100 last:border-0">
                            <div className="flex items-center gap-3">
                                 <div className={`h-8 w-8 rounded-full ${file.owner.color} text-white flex items-center justify-center text-xs font-bold ring-2 ring-white shadow-sm`}>
                                     {file.owner.name.charAt(0)}
                                 </div>
                                 <div className="flex flex-col">
                                     <span className="text-sm font-semibold text-slate-700">{file.owner.name}</span>
                                     <span className="text-[10px] text-slate-400">Owner</span>
                                 </div>
                            </div>
                        </div>

                        {/* Collaborators Rows */}
                        {file.collaborators && file.collaborators.map((u, i) => (
                             <div key={i} className="flex items-center justify-between p-3 hover:bg-slate-50 transition-colors border-b border-gray-100 last:border-0">
                                <div className="flex items-center gap-3">
                                    <div className={`h-8 w-8 rounded-full ring-2 ring-white ${u.color || 'bg-gray-400'} flex items-center justify-center text-white text-xs font-bold shadow-sm`} title={u.name}>
                                        {u.name.charAt(0)}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold text-slate-700">{u.name}</span>
                                        <span className="text-[10px] text-slate-400">Collaborator</span>
                                    </div>
                                </div>
                                <span className="px-2 py-1 rounded-md bg-blue-50 text-blue-600 text-[10px] font-bold border border-blue-100">
                                    Editor
                                </span>
                            </div>
                        ))}
                    </div>
                    {/* Add User Button (Visual) */}
                    <button className="mt-2 w-full py-1.5 text-xs font-medium text-slate-500 border border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:text-blue-600 transition-colors">
                        + Invite people
                    </button>
                </div>

                {/* Tags */}
                <div>
                     <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Tags</h4>
                     <div className="flex flex-wrap gap-1.5">
                         {file.tags && file.tags.map(tag => (
                             <span key={tag} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                 <Tag className="h-3 w-3 mr-1" />
                                 {tag}
                             </span>
                         ))}
                         <button className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-50 text-gray-400 border border-gray-200 border-dashed hover:text-gray-600 hover:border-gray-300 transition-colors">
                             + Add tag
                         </button>
                     </div>
                </div>
            </div>

            <div className="pt-4 mt-4 border-t border-gray-100">
                <button className="w-full py-2.5 flex items-center justify-center space-x-2 bg-slate-800 text-white rounded-xl text-sm font-medium hover:bg-slate-900 transition-all shadow-md hover:shadow-lg">
                    <Share2 className="h-4 w-4" />
                    <span>Manage Access</span>
                </button>
            </div>
          </div>
        )}

        {/* --- ACTIVITY TAB --- */}
        {activeTab === 'activity' && (
             <div className="space-y-6 animate-in fade-in duration-300">

                 {/* Versions */}
                 <div>
                    <h4 className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                        <History className="h-3 w-3" /> Version History
                    </h4>
                    <div className="space-y-0 relative before:absolute before:inset-y-0 before:left-[19px] before:w-0.5 before:bg-gray-100">
                        {file.versions && file.versions.length > 0 ? (
                            file.versions.map((v, i) => (
                                <div key={v.id} className="relative pl-10 pb-6 last:pb-0 group">
                                    <div className={`absolute left-[15px] -translate-x-0 mt-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-white ${i === 0 ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                                    <div className="flex flex-col bg-white p-3 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start mb-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold text-slate-700">Version {v.version}.0</span>
                                                {i === 0 && (
                                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100">Current</span>
                                                )}
                                            </div>
                                            <span className="text-[10px] font-medium text-slate-400">{new Date(v.updatedAt).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-2">
                                            <div className="h-5 w-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                                                {v.modifier.charAt(0)}
                                            </div>
                                            <p className="text-xs text-slate-500">Modified by <span className="text-slate-700 font-medium">{v.modifier}</span></p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="pl-10 text-xs text-gray-400 italic">No previous versions available.</div>
                        )}
                    </div>
                 </div>

                 {/* Comments Placeholder */}
                 <div className="pt-6 border-t border-gray-100">
                     <h4 className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                        <MessageSquare className="h-3 w-3" /> Comments
                    </h4>
                     <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100 border-dashed">
                         <p className="text-xs text-gray-500 mb-2">No comments on this file yet.</p>
                         <button className="px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg text-slate-600 font-medium hover:text-blue-600 hover:border-blue-200 shadow-sm transition-all">Start a discussion</button>
                     </div>
                 </div>
             </div>
        )}

        {/* --- AI TAB --- */}
        {activeTab === 'ai' && (
          <div className="space-y-4 animate-in fade-in duration-300">
             <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-4 rounded-xl border border-indigo-100 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4 text-indigo-500" />
                    <h4 className="text-sm font-semibold text-indigo-900">Gemini Insights</h4>
                </div>
                <p className="text-xs text-indigo-700/80 leading-relaxed">
                    Powered by Gemini 2.5 Flash. Analyze content, summarize documents, and suggest automated workflows instantly.
                </p>
             </div>

             <div className="grid grid-cols-2 gap-2">
                 <button
                    onClick={() => handleGenerateSummary(file)}
                    className="flex flex-col items-center justify-center gap-2 px-3 py-3 bg-white border border-gray-200 rounded-xl text-xs font-medium text-slate-700 hover:border-indigo-300 hover:text-indigo-600 hover:shadow-md transition-all group"
                 >
                    <div className="p-2 bg-indigo-50 rounded-full group-hover:bg-indigo-100 transition-colors">
                        <FileText className="h-4 w-4 text-indigo-600" />
                    </div>
                    Summarize
                 </button>
                 <button
                    onClick={() => handleGenerateWorkflow(file)}
                    className="flex flex-col items-center justify-center gap-2 px-3 py-3 bg-white border border-gray-200 rounded-xl text-xs font-medium text-slate-700 hover:border-indigo-300 hover:text-indigo-600 hover:shadow-md transition-all group"
                 >
                    <div className="p-2 bg-purple-50 rounded-full group-hover:bg-purple-100 transition-colors">
                        <Workflow className="h-4 w-4 text-purple-600" />
                    </div>
                    Automate
                 </button>
             </div>

             {loadingAi ? (
                <div className="flex flex-col items-center justify-center py-10 space-y-3">
                    <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
                    <span className="text-xs font-medium text-slate-500 animate-pulse">Analyzing file content...</span>
                </div>
             ) : (
                 <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                     {summary ? (
                         <div className="prose prose-sm prose-indigo text-slate-600 text-xs leading-relaxed whitespace-pre-wrap">
                             {summary}
                         </div>
                     ) : (
                         <div className="text-center py-8 text-slate-400 text-xs italic">
                             Select an action above to generate insights.
                         </div>
                     )}
                 </div>
             )}
          </div>
        )}
      </div>
    </div>
  );
};
