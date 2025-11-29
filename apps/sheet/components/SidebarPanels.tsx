import React from 'react';
import { 
  FileText, Search, Image as ImageIcon, Layers, Users, 
  BarChart2, Settings, MessageSquare, Clock, AlignLeft, 
  Type, Layout, Grid, MoreHorizontal, Plus, PlusSquare,
  Square, Table, Video, LayoutGrid, Play, Pause, ChevronRight,
  Zap, LogIn, LogOut, ArrowRight, Star, MousePointer2,
  MoveHorizontal, Trash2, Palette,
  Bold, Italic, List, Sigma, Calculator, Database, Table2, FunctionSquare,
  Code, PieChart, Box, CheckSquare
} from 'lucide-react';
import { LeftPanelType, RightPanelType } from '../types';

interface SidebarPanelProps {
  type: LeftPanelType | RightPanelType;
  onClose: () => void;
}

const PanelHeader = ({ title, icon: Icon, onClose }: { title: string, icon: any, onClose: () => void }) => (
  <div className="h-14 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 bg-slate-50 dark:bg-slate-900/50">
    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
      <Icon size={18} className="text-green-500 dark:text-green-400" />
      <span className="font-semibold text-sm tracking-wide">{title}</span>
    </div>
  </div>
);

// --- HELPER CONTROLS ---
const ControlPill = ({ children, className }: { children?: React.ReactNode, className?: string }) => (
  <div className={`bg-slate-100 dark:bg-[#111] rounded-2xl p-1 flex items-center border border-slate-200 dark:border-[#222] ${className}`}>
    {children}
  </div>
);

export const LeftSidebarPanel: React.FC<SidebarPanelProps> = ({ type, onClose }) => {
  
  if (type === LeftPanelType.FUNCTIONS) {
    return (
      <div className="flex flex-col h-full bg-white dark:bg-[#0f172a] text-slate-600 dark:text-slate-300">
        <PanelHeader title="Functions" icon={Sigma} onClose={onClose} />
        <div className="p-4 space-y-4 overflow-y-auto">
           <input type="text" placeholder="Search functions..." className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-2 px-3 text-sm outline-none" />
           
           <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Most Used</h3>
              <div className="space-y-1">
                 {['SUM', 'AVERAGE', 'IF', 'VLOOKUP', 'COUNT', 'MAX', 'MIN'].map(f => (
                    <div key={f} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded cursor-pointer flex items-center justify-between group">
                       <span className="font-mono text-sm font-bold text-green-600 dark:text-green-400">{f}</span>
                       <Plus size={14} className="opacity-0 group-hover:opacity-100 text-slate-400" />
                    </div>
                 ))}
              </div>
           </div>

           <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Categories</h3>
              <div className="grid grid-cols-2 gap-2">
                 {['Financial', 'Date & Time', 'Math & Trig', 'Statistical', 'Lookup', 'Database', 'Text', 'Logical'].map(c => (
                    <div key={c} className="p-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded text-xs text-center cursor-pointer hover:border-green-500 transition-colors">
                       {c}
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    );
  }

  if (type === LeftPanelType.DATA) {
    return (
      <div className="flex flex-col h-full bg-white dark:bg-[#0f172a] text-slate-600 dark:text-slate-300">
        <PanelHeader title="Data Sources" icon={Database} onClose={onClose} />
        <div className="p-4">
           <div className="p-3 mb-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-sm text-blue-800 dark:text-blue-300">
              Connect to external data sources to import live data.
           </div>
           <div className="space-y-2">
              <button className="w-full flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-green-500 transition-all">
                 <Database size={18} className="text-slate-400" />
                 <span className="text-sm font-medium">From Database</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-green-500 transition-all">
                 <Table size={18} className="text-slate-400" />
                 <span className="text-sm font-medium">From CSV/Text</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-green-500 transition-all">
                 <LayoutGrid size={18} className="text-slate-400" />
                 <span className="text-sm font-medium">From Web</span>
              </button>
           </div>
        </div>
      </div>
    );
  }

  if (type === LeftPanelType.SNIPPETS) {
      return (
        <div className="flex flex-col h-full bg-white dark:bg-[#0f172a] text-slate-600 dark:text-slate-300">
          <PanelHeader title="Elements" icon={LayoutGrid} onClose={onClose} />
          <div className="p-4 grid grid-cols-2 gap-3 overflow-y-auto">
             {['Table', 'Chart', 'Image', 'Shape', 'Icon', 'Button', 'Drop', 'Check'].map(item => (
                <div key={item} className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-green-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-all gap-2">
                   {item === 'Table' && <Table size={24} />}
                   {item === 'Chart' && <BarChart2 size={24} />}
                   {item === 'Image' && <ImageIcon size={24} />}
                   {item === 'Shape' && <Square size={24} />}
                   {item === 'Icon' && <Star size={24} />}
                   {item === 'Button' && <MousePointer2 size={24} />}
                   {item === 'Drop' && <List size={24} />}
                   {item === 'Check' && <CheckSquare size={24} />}
                   {item === 'Video' && <Video size={24} />}
                   <span className="text-xs font-medium">{item}</span>
                </div>
             ))}
          </div>
        </div>
      );
  }

  return null;
};

export const RightSidebarPanel: React.FC<SidebarPanelProps> = ({ type, onClose }) => {
   if (type === RightPanelType.FORMATTING) {
      return (
         <div className="flex flex-col h-full bg-[#050505] text-slate-300">
            <PanelHeader title="Format Cells" icon={LayoutGrid} onClose={onClose} />
            <div className="p-6 space-y-6">
               <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Number Format</label>
                  <div className="grid grid-cols-2 gap-2">
                     {['General', 'Number', 'Currency', 'Accounting', 'Date', 'Time', 'Percentage', 'Text'].map(f => (
                        <button key={f} className="p-2 bg-[#111] text-xs rounded border border-[#222] hover:bg-[#222] hover:text-white text-left">{f}</button>
                     ))}
                  </div>
               </div>
               <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Alignment</label>
                  <ControlPill className="justify-center gap-4 px-3 py-2">
                     <AlignLeft size={16} className="text-white" />
                     <div className="w-px h-4 bg-[#333]"></div>
                     <Layout size={16} className="text-slate-500" />
                     <div className="w-px h-4 bg-[#333]"></div>
                     <ArrowRight size={16} className="text-slate-500" />
                  </ControlPill>
               </div>
            </div>
         </div>
      );
   }

   if (type === RightPanelType.CHART) {
      return (
         <div className="flex flex-col h-full bg-[#050505] text-slate-300">
            <PanelHeader title="Chart Editor" icon={BarChart2} onClose={onClose} />
            <div className="p-6">
               <div className="aspect-video bg-[#111] border border-[#222] rounded-lg mb-4 flex items-center justify-center">
                  <BarChart2 size={48} className="text-slate-700" />
               </div>
               <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Chart Type</label>
               <ControlPill className="justify-between px-3 py-2 cursor-pointer hover:bg-[#1a1a1a]">
                   <span className="text-xs text-slate-300">Column Chart</span>
                   <ChevronRight size={12} className="text-slate-600" />
               </ControlPill>
            </div>
         </div>
      );
   }

   return null;
}