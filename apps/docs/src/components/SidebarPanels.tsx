import React, { useState, useEffect } from 'react';
import {
  FileText, Search, Image as ImageIcon, Layers, Users,
  BarChart2, Settings, MessageSquare, Clock, AlignLeft,
  Type, Layout, Grid, MoreHorizontal, Plus
} from 'lucide-react';
import { LeftPanelType, RightPanelType } from '../types';
import { commentAPI, versionAPI } from '../services/api';

interface SidebarPanelProps {
  type: LeftPanelType | RightPanelType;
  docStats?: { wordCount: number };
  documentId?: string | null;
  onClose: () => void;
}

const PanelHeader = ({ title, icon: Icon, onClose }: { title: string, icon: any, onClose: () => void }) => (
  <div className="h-14 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 bg-slate-50 dark:bg-slate-900/50">
    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
      <Icon size={18} className="text-blue-500 dark:text-blue-400" />
      <span className="font-semibold text-sm tracking-wide">{title}</span>
    </div>
  </div>
);

export const LeftSidebarPanel: React.FC<SidebarPanelProps> = ({ type, docStats, onClose }) => {
  
  if (type === LeftPanelType.NAVIGATOR) {
    return (
      <div className="flex flex-col h-full bg-white dark:bg-[#0f172a] text-slate-600 dark:text-slate-300">
        <PanelHeader title="Navigator" icon={FileText} onClose={onClose} />
        <div className="p-4 space-y-6 overflow-y-auto flex-1">
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Table of Contents</h3>
            <div className="space-y-1">
               <div className="text-sm py-1 px-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 rounded border-l-2 border-blue-500 cursor-pointer">Introduction</div>
               <div className="text-sm py-1 px-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded cursor-pointer ml-2 border-l-2 border-transparent">Market Analysis</div>
               <div className="text-sm py-1 px-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded cursor-pointer ml-2 border-l-2 border-transparent">Target Audience</div>
               <div className="text-sm py-1 px-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded cursor-pointer ml-4 border-l-2 border-transparent">Demographics</div>
               <div className="text-sm py-1 px-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded cursor-pointer">Conclusion</div>
            </div>
          </div>
          
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Pages</h3>
            <div className="grid grid-cols-2 gap-3">
               <div className="aspect-[3/4] bg-white rounded shadow-md border border-slate-200 dark:border-transparent opacity-90 hover:ring-2 ring-blue-500 cursor-pointer transition-all relative group">
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/20 rounded">
                    <span className="text-xs font-bold text-white bg-black/50 px-2 py-1 rounded">Pg 1</span>
                  </div>
               </div>
               <div className="aspect-[3/4] bg-slate-100 dark:bg-slate-700 rounded border border-slate-300 dark:border-slate-600 flex items-center justify-center cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                  <Plus className="text-slate-400" />
               </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === LeftPanelType.SEARCH) {
    return (
      <div className="flex flex-col h-full bg-white dark:bg-[#0f172a] text-slate-600 dark:text-slate-300">
        <PanelHeader title="Find & Replace" icon={Search} onClose={onClose} />
        <div className="p-4 space-y-4">
          <div className="relative">
             <input type="text" placeholder="Find..." className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg py-2 pl-9 pr-3 text-sm focus:ring-1 focus:ring-blue-500 outline-none text-slate-800 dark:text-slate-200" />
             <Search size={14} className="absolute left-3 top-3 text-slate-500" />
          </div>
          <div className="relative">
             <input type="text" placeholder="Replace with..." className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg py-2 pl-9 pr-3 text-sm focus:ring-1 focus:ring-blue-500 outline-none text-slate-800 dark:text-slate-200" />
             <Type size={14} className="absolute left-3 top-3 text-slate-500" />
          </div>
          <div className="flex gap-2 pt-2">
             <button className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-md transition-colors">Replace All</button>
             <button className="flex-1 py-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-md transition-colors border border-slate-300 dark:border-slate-700">Find Next</button>
          </div>
        </div>
      </div>
    );
  }

  if (type === LeftPanelType.MEDIA) {
    return (
      <div className="flex flex-col h-full bg-white dark:bg-[#0f172a] text-slate-600 dark:text-slate-300">
        <PanelHeader title="Media Library" icon={ImageIcon} onClose={onClose} />
        <div className="p-4">
           <button className="w-full py-2 border border-dashed border-slate-300 dark:border-slate-600 hover:border-blue-500 rounded-lg flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 transition-all mb-4 bg-slate-50 dark:bg-slate-900/50">
              <Plus size={16} /> Upload Image
           </button>
           
           <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Recent Uploads</h3>
           <div className="grid grid-cols-2 gap-2">
              <div className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-600 hover:border-blue-500 cursor-pointer">Image 1</div>
              <div className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-600 hover:border-blue-500 cursor-pointer">Image 2</div>
              <div className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-600 hover:border-blue-500 cursor-pointer">Logo</div>
              <div className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-600 hover:border-blue-500 cursor-pointer">Chart</div>
           </div>
        </div>
      </div>
    );
  }

  if (type === LeftPanelType.SNIPPETS) {
    return (
       <div className="flex flex-col h-full bg-white dark:bg-[#0f172a] text-slate-600 dark:text-slate-300">
        <PanelHeader title="Snippets" icon={Layers} onClose={onClose} />
        <div className="p-4 space-y-2">
           {['Cover Page', 'Invoice Table', 'Meeting Agenda', 'Code Block', 'Warning Callout'].map(item => (
              <div key={item} className="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-blue-500 cursor-pointer group transition-all">
                 <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-blue-500 dark:group-hover:text-blue-300">{item}</span>
                    <Plus size={14} className="opacity-0 group-hover:opacity-100 text-blue-500 dark:text-blue-400" />
                 </div>
              </div>
           ))}
        </div>
       </div>
    );
  }

  if (type === LeftPanelType.COLLAB) {
     return (
       <div className="flex flex-col h-full bg-white dark:bg-[#0f172a] text-slate-600 dark:text-slate-300 font-sans">
        
        {/* Header */}
        <div className="p-6 pb-2">
            <div className="flex items-center gap-3 mb-6">
                <Users size={20} className="text-slate-500 dark:text-slate-400" />
                <h2 className="font-semibold text-slate-800 dark:text-white tracking-wide text-sm">Collaboration</h2>
            </div>
            
            {/* Avatars */}
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-blue-500/20 ring-2 ring-white dark:ring-[#0f172a] transition-transform hover:scale-105 cursor-pointer">You</div>
                <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-emerald-500/20 ring-2 ring-white dark:ring-[#0f172a] transition-transform hover:scale-105 cursor-pointer" title="Jane Doe">JD</div>
                <button className="w-10 h-10 rounded-full border border-dashed border-slate-400 dark:border-slate-600 flex items-center justify-center text-slate-500 dark:text-slate-500 hover:text-blue-500 dark:hover:text-white hover:border-blue-500 dark:hover:border-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all ring-2 ring-white dark:ring-[#0f172a]">
                    <Plus size={16} />
                </button>
            </div>
        </div>

        {/* Chat Area - Card Style */}
        <div className="px-4 flex-1 flex flex-col min-h-0 pb-6">
           <div className="flex-1 bg-slate-100 dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden relative shadow-inner">
              
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
                  {/* Date Separator */}
                  <div className="text-center">
                      <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 tracking-wide">Today</span>
                  </div>

                  {/* Message */}
                  <div className="animate-in slide-in-from-bottom-2 fade-in duration-300">
                      <div className="flex items-baseline gap-2 mb-1.5">
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Jane Doe</span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500">10:42 AM</span>
                      </div>
                      <div className="bg-white dark:bg-[#2a374a] p-3.5 rounded-2xl rounded-tl-none text-sm text-slate-700 dark:text-slate-200 leading-relaxed shadow-sm border border-slate-200 dark:border-slate-700/30">
                          Can you review the second paragraph?
                      </div>
                  </div>
              </div>

              {/* Input Area */}
              <div className="p-4 bg-slate-100 dark:bg-[#1e293b] border-t border-slate-200 dark:border-slate-800">
                  <input 
                    type="text" 
                    placeholder="Type a message..." 
                    className="w-full bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-xs text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all shadow-sm dark:shadow-inner" 
                  />
              </div>
           </div>
        </div>
       </div>
     );
  }

  if (type === LeftPanelType.INSIGHTS) {
     return (
       <div className="flex flex-col h-full bg-white dark:bg-[#0f172a] text-slate-600 dark:text-slate-300">
        <PanelHeader title="Insights" icon={BarChart2} onClose={onClose} />
        <div className="p-4 space-y-6">
           <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                 <div className="text-2xl font-bold text-slate-800 dark:text-white mb-1">{docStats?.wordCount || 0}</div>
                 <div className="text-xs text-slate-500 dark:text-slate-400">Words</div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                 <div className="text-2xl font-bold text-slate-800 dark:text-white mb-1">2m</div>
                 <div className="text-xs text-slate-500 dark:text-slate-400">Read Time</div>
              </div>
           </div>
           
           <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Readability Score</h3>
              <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 mb-1">
                 <div className="bg-emerald-500 h-2 rounded-full w-[85%]"></div>
              </div>
              <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                 <span>Easy</span>
                 <span className="text-slate-800 dark:text-white font-medium">85/100</span>
              </div>
           </div>
        </div>
       </div>
     );
  }

  return null;
};

export const RightSidebarPanel: React.FC<SidebarPanelProps> = ({ type, documentId, onClose }) => {
   const [comments, setComments] = useState<any[]>([]);
   const [versions, setVersions] = useState<any[]>([]);
   const [loading, setLoading] = useState(false);

   // Load comments when COMMENTS panel is opened
   useEffect(() => {
      if (type === RightPanelType.COMMENTS && documentId) {
         setLoading(true);
         commentAPI.list(documentId)
            .then(response => {
               setComments(response.data || []);
            })
            .catch(error => {
               console.error('Failed to load comments:', error);
            })
            .finally(() => {
               setLoading(false);
            });
      }
   }, [type, documentId]);

   // Load versions when HISTORY panel is opened
   useEffect(() => {
      if (type === RightPanelType.HISTORY && documentId) {
         setLoading(true);
         versionAPI.list(documentId)
            .then(response => {
               setVersions(response.data || []);
            })
            .catch(error => {
               console.error('Failed to load versions:', error);
            })
            .finally(() => {
               setLoading(false);
            });
      }
   }, [type, documentId]);

   if (type === RightPanelType.COMMENTS) {
      return (
         <div className="flex flex-col h-full bg-white dark:bg-[#0f172a] text-slate-600 dark:text-slate-300">
           <PanelHeader title="Comments" icon={MessageSquare} onClose={onClose} />
           {loading ? (
              <div className="flex-1 flex items-center justify-center">
                 <div className="text-sm text-slate-400">Loading comments...</div>
              </div>
           ) : comments.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 p-8 text-center">
                 <MessageSquare size={48} className="mb-4 opacity-20" />
                 <p className="text-sm">No comments yet.</p>
                 <button className="mt-4 px-4 py-2 bg-blue-50 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-600/30 rounded-lg text-sm transition-colors border border-blue-200 dark:border-blue-600/30">
                    Add Comment
                 </button>
              </div>
           ) : (
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                 {comments.map((comment: any) => (
                    <div key={comment.id} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                       <div className="flex items-start justify-between mb-2">
                          <span className="text-sm font-semibold text-slate-800 dark:text-white">{comment.authorName || 'User'}</span>
                          <span className="text-xs text-slate-400">{new Date(comment.createdAt).toLocaleDateString()}</span>
                       </div>
                       <p className="text-sm text-slate-600 dark:text-slate-300">{comment.content}</p>
                       {comment.status === 'RESOLVED' && (
                          <span className="inline-block mt-2 text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded">Resolved</span>
                       )}
                    </div>
                 ))}
              </div>
           )}
         </div>
      );
   }

   if (type === RightPanelType.HISTORY) {
      return (
         <div className="flex flex-col h-full bg-white dark:bg-[#0f172a] text-slate-600 dark:text-slate-300">
           <PanelHeader title="Version History" icon={Clock} onClose={onClose} />
           {loading ? (
              <div className="flex-1 flex items-center justify-center">
                 <div className="text-sm text-slate-400">Loading version history...</div>
              </div>
           ) : versions.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 p-8 text-center">
                 <Clock size={48} className="mb-4 opacity-20" />
                 <p className="text-sm">No version history yet.</p>
              </div>
           ) : (
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                 {versions.map((version: any) => (
                    <div key={version.id} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-600 transition-colors cursor-pointer">
                       <div className="flex items-start justify-between mb-2">
                          <span className="text-sm font-semibold text-slate-800 dark:text-white">Version {version.versionNumber}</span>
                          <span className="text-xs text-slate-400">{new Date(version.createdAt).toLocaleString()}</span>
                       </div>
                       {version.description && (
                          <p className="text-sm text-slate-600 dark:text-slate-300">{version.description}</p>
                       )}
                       <div className="mt-2 text-xs text-slate-400">by {version.createdBy}</div>
                    </div>
                 ))}
              </div>
           )}
         </div>
      );
   }

   if (type === RightPanelType.SETTINGS) {
      return (
         <div className="flex flex-col h-full bg-white dark:bg-[#0f172a] text-slate-600 dark:text-slate-300">
           <PanelHeader title="Page Settings" icon={Settings} onClose={onClose} />
           <div className="p-4 space-y-6">
              <div>
                 <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Orientation</label>
                 <div className="grid grid-cols-2 gap-2">
                    <button className="flex flex-col items-center justify-center p-3 bg-blue-50 dark:bg-blue-600/20 border border-blue-500 rounded-lg text-blue-600 dark:text-blue-300">
                       <div className="w-6 h-8 border-2 border-current mb-1 rounded-sm"></div>
                       <span className="text-xs">Portrait</span>
                    </button>
                    <button className="flex flex-col items-center justify-center p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                       <div className="w-8 h-6 border-2 border-current mb-1 rounded-sm"></div>
                       <span className="text-xs">Landscape</span>
                    </button>
                 </div>
              </div>
              
              <div>
                 <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Margins</label>
                 <select className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 text-slate-700 dark:text-slate-300">
                    <option>Normal (1 inch)</option>
                    <option>Narrow (0.5 inch)</option>
                    <option>Wide (1.5 inch)</option>
                 </select>
              </div>

              <div>
                 <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Page Size</label>
                 <select className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 text-slate-700 dark:text-slate-300">
                    <option>Letter (8.5 x 11)</option>
                    <option>A4</option>
                    <option>Legal</option>
                 </select>
              </div>
           </div>
         </div>
      );
   }

   return null;
}