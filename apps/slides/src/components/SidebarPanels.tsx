
import React, { useState } from 'react';
import { 
  FileText, Search, Image as ImageIcon, Layers, Users, 
  BarChart2, Settings, MessageSquare, Clock, AlignLeft, 
  Type, Layout, Grid, MoreHorizontal, Plus, PlusSquare,
  Square, Table, Video, LayoutGrid, Play, Pause, ChevronRight,
  Zap, LogIn, LogOut, ArrowRight, Star, MousePointer2,
  MoveHorizontal, Clock3, RotateCw, Trash2, Palette,
  Bold, Italic, List
} from 'lucide-react';
import { LeftPanelType, RightPanelType } from '../types';

interface SidebarPanelProps {
  type: LeftPanelType | RightPanelType;
  docStats?: { wordCount: number };
  presentationId?: string | null;
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

// --- HELPER CONTROLS (Pill style) ---
const ControlPill = ({ children, className }: { children?: React.ReactNode, className?: string }) => (
  <div className={`bg-slate-100 dark:bg-[#111] rounded-2xl p-1 flex items-center border border-slate-200 dark:border-[#222] ${className}`}>
    {children}
  </div>
);

const DarkSlider = ({ value, label, color = "bg-blue-500" }: { value: number, label?: string, color?: string }) => (
  <div className="flex-1 flex items-center gap-3 px-3 py-2 bg-slate-100 dark:bg-[#111] rounded-2xl border border-slate-200 dark:border-[#222]">
    {label && <span className="text-xs font-medium text-slate-500">{label}</span>}
    <div className="flex-1 h-1.5 bg-slate-300 dark:bg-[#333] rounded-full overflow-hidden relative">
      <div className={`h-full ${color}`} style={{ width: `${value}%` }}></div>
    </div>
    <div className="w-3 h-3 rounded-full bg-white shadow-sm"></div>
  </div>
);

const SegmentedToggle = ({ options, activeIndex = 0 }: { options: string[], activeIndex?: number }) => (
  <div className="bg-slate-200 dark:bg-[#222] p-1 rounded-xl flex gap-1">
    {options.map((opt, i) => (
      <button key={opt} className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${i === activeIndex ? 'bg-slate-600 dark:bg-[#444] text-white shadow-sm' : 'text-slate-500 dark:text-[#666] hover:text-slate-700 dark:hover:text-[#888]'}`}>
        {opt}
      </button>
    ))}
  </div>
);

const ColorSwatches = () => (
   <div className="grid grid-cols-6 gap-2">
      {['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#ffffff', '#94a3b8', '#0f172a'].map(c => (
         <div key={c} className="aspect-square rounded-full border border-slate-300 dark:border-slate-700 cursor-pointer hover:scale-110 transition-transform" style={{background: c}}></div>
      ))}
      <div className="aspect-square rounded-full border border-dashed border-slate-400 dark:border-slate-600 flex items-center justify-center cursor-pointer hover:border-blue-500">
         <Plus size={10} className="text-slate-500" />
      </div>
   </div>
);

export const LeftSidebarPanel: React.FC<SidebarPanelProps> = ({ type, docStats, onClose }) => {
  
  if (type === LeftPanelType.NAVIGATOR) {
    return (
      <div className="flex flex-col h-full bg-white dark:bg-[#0f172a] text-slate-600 dark:text-slate-300">
        <PanelHeader title="Slides Outline" icon={Layers} onClose={onClose} />
        <div className="p-4 space-y-6 overflow-y-auto flex-1">
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Sections</h3>
            <div className="space-y-1">
               <div className="text-sm py-1 px-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 rounded border-l-2 border-blue-500 cursor-pointer">Introduction</div>
               <div className="text-sm py-1 px-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded cursor-pointer ml-2 border-l-2 border-transparent">Market Analysis</div>
               <div className="text-sm py-1 px-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded cursor-pointer ml-2 border-l-2 border-transparent">Target Audience</div>
            </div>
          </div>
          
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Slide Sorter</h3>
            <div className="grid grid-cols-2 gap-3">
               <div className="aspect-[16/9] bg-white rounded shadow-md border border-slate-200 dark:border-transparent opacity-90 hover:ring-2 ring-blue-500 cursor-pointer transition-all relative group">
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/20 rounded">
                    <span className="text-xs font-bold text-white bg-black/50 px-2 py-1 rounded">1</span>
                  </div>
               </div>
               <div className="aspect-[16/9] bg-slate-100 dark:bg-slate-700 rounded border border-slate-300 dark:border-slate-600 flex items-center justify-center cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                  <Plus className="text-slate-400" />
               </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === LeftPanelType.INSERT) {
    return (
      <div className="flex flex-col h-full bg-white dark:bg-[#0f172a] text-slate-600 dark:text-slate-300">
        <PanelHeader title="Insert Element" icon={PlusSquare} onClose={onClose} />
        <div className="p-4 grid grid-cols-2 gap-3">
           <button className="flex flex-col items-center justify-center gap-2 p-4 bg-slate-50 dark:bg-[#1a1a1a] rounded-xl border border-slate-200 dark:border-[#333] hover:bg-blue-50 dark:hover:bg-[#222] hover:border-blue-500 transition-all">
              <Type size={24} className="text-blue-500" />
              <span className="text-xs font-medium">Text Box</span>
           </button>
           <button className="flex flex-col items-center justify-center gap-2 p-4 bg-slate-50 dark:bg-[#1a1a1a] rounded-xl border border-slate-200 dark:border-[#333] hover:bg-blue-50 dark:hover:bg-[#222] hover:border-blue-500 transition-all">
              <ImageIcon size={24} className="text-purple-500" />
              <span className="text-xs font-medium">Image</span>
           </button>
           <button className="flex flex-col items-center justify-center gap-2 p-4 bg-slate-50 dark:bg-[#1a1a1a] rounded-xl border border-slate-200 dark:border-[#333] hover:bg-blue-50 dark:hover:bg-[#222] hover:border-blue-500 transition-all">
              <Square size={24} className="text-orange-500" />
              <span className="text-xs font-medium">Shapes</span>
           </button>
           <button className="flex flex-col items-center justify-center gap-2 p-4 bg-slate-50 dark:bg-[#1a1a1a] rounded-xl border border-slate-200 dark:border-[#333] hover:bg-blue-50 dark:hover:bg-[#222] hover:border-blue-500 transition-all">
              <Table size={24} className="text-green-500" />
              <span className="text-xs font-medium">Table</span>
           </button>
           <button className="flex flex-col items-center justify-center gap-2 p-4 bg-slate-50 dark:bg-[#1a1a1a] rounded-xl border border-slate-200 dark:border-[#333] hover:bg-blue-50 dark:hover:bg-[#222] hover:border-blue-500 transition-all">
              <BarChart2 size={24} className="text-red-500" />
              <span className="text-xs font-medium">Chart</span>
           </button>
           <button className="flex flex-col items-center justify-center gap-2 p-4 bg-slate-50 dark:bg-[#1a1a1a] rounded-xl border border-slate-200 dark:border-[#333] hover:bg-blue-50 dark:hover:bg-[#222] hover:border-blue-500 transition-all">
              <Video size={24} className="text-pink-500" />
              <span className="text-xs font-medium">Video</span>
           </button>
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
           {/* Image Adjustments (Control Panel Style) */}
           <div className="bg-[#050505] p-4 rounded-3xl mb-6 space-y-4">
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Adjustments</h3>
              <DarkSlider value={70} label="Brightness" color="bg-white" />
              <div className="flex gap-2">
                 <DarkSlider value={50} color="bg-gradient-to-r from-blue-400 to-pink-500" />
                 <div className="w-8 h-8 rounded-full bg-[#222] border border-[#333] flex items-center justify-center">
                   <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-yellow-400 to-blue-500"></div>
                 </div>
              </div>
              <div className="flex items-center gap-3 px-3 py-2 bg-[#111] rounded-2xl border border-[#222]">
                  <Square size={14} className="text-slate-400" />
                  <div className="h-4 w-px bg-[#333]"></div>
                  <div className="flex-1 flex justify-between text-slate-500 text-xs">
                     <span>16:9</span>
                     <span>4:3</span>
                     <span className="text-white">1:1</span>
                  </div>
              </div>
           </div>
           
           <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Library</h3>
           <div className="grid grid-cols-2 gap-2">
              <div className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-600 hover:border-blue-500 cursor-pointer">Image 1</div>
              <div className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-600 hover:border-blue-500 cursor-pointer">Image 2</div>
           </div>
        </div>
      </div>
    );
  }

  if (type === LeftPanelType.SNIPPETS) {
    return (
       <div className="flex flex-col h-full bg-white dark:bg-[#0f172a] text-slate-600 dark:text-slate-300">
        <PanelHeader title="Elements & Snippets" icon={LayoutGrid} onClose={onClose} />
        <div className="p-4 space-y-2">
           {['Title Slide', 'Two Columns', 'Comparison', 'Picture w/ Caption', 'Quote'].map(item => (
              <div key={item} className="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-blue-500 cursor-pointer group transition-all">
                 <div className="flex items-center justify-center">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-blue-500 dark:group-hover:text-blue-300">{item}</span>
                 </div>
              </div>
           ))}
        </div>
       </div>
    );
  }

  return null;
};

export const RightSidebarPanel: React.FC<SidebarPanelProps> = ({ type, onClose }) => {
   
   if (type === RightPanelType.COMMENTS) {
      return (
         <div className="flex flex-col h-full bg-white dark:bg-[#0f172a] text-slate-600 dark:text-slate-300">
           {/* Custom Collab Header */}
           <div className="p-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 text-slate-700 dark:text-white font-semibold">
                 <Users size={18} className="text-blue-500" />
                 <span>Collaboration</span>
              </div>
           </div>

           {/* Active Users */}
           <div className="p-4 flex gap-2">
              <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm ring-2 ring-blue-500/30 shadow-lg shadow-blue-500/20">You</div>
              <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-sm ring-2 ring-green-500/30 shadow-lg shadow-green-500/20">JD</div>
              <button className="w-10 h-10 rounded-full bg-transparent border border-dashed border-slate-500 text-slate-500 hover:text-white hover:border-white flex items-center justify-center transition-colors">
                 <Plus size={16} />
              </button>
           </div>

           {/* Chat Area */}
           <div className="flex-1 p-4 overflow-y-auto">
              <div className="bg-slate-100 dark:bg-[#1e293b] rounded-2xl p-4 min-h-[300px] flex flex-col relative">
                 <div className="text-xs text-center text-slate-400 mb-4">Today</div>
                 
                 <div className="flex flex-col gap-1 mb-4">
                    <div className="flex justify-between items-baseline px-1">
                       <span className="text-xs font-bold text-green-500">Jane Doe</span>
                       <span className="text-[10px] text-slate-500">10:42 AM</span>
                    </div>
                    <div className="bg-white dark:bg-[#0f172a] p-3 rounded-2xl rounded-tl-none border border-slate-200 dark:border-slate-700/50 shadow-sm text-sm text-slate-700 dark:text-slate-300">
                       Can you review the second paragraph?
                    </div>
                 </div>

                 {/* Input Area */}
                 <div className="mt-auto pt-4">
                    <div className="relative">
                       <input 
                         type="text" 
                         placeholder="Type a message..." 
                         className="w-full bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-4 pr-10 text-sm focus:ring-1 focus:ring-blue-500 outline-none text-slate-800 dark:text-slate-200"
                       />
                       <button className="absolute right-3 top-3 text-blue-500 hover:text-blue-400">
                          <ChevronRight size={16} />
                       </button>
                    </div>
                 </div>
              </div>
           </div>
         </div>
      );
   }

   if (type === RightPanelType.SETTINGS) {
      return (
         <div className="flex flex-col h-full bg-[#050505] text-slate-300">
           <PanelHeader title="Slide Settings" icon={Settings} onClose={onClose} />
           <div className="p-6 space-y-6">
              
              {/* Control Panel Style Settings */}
              <div>
                 <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Orientation</label>
                 <SegmentedToggle options={['Landscape', 'Portrait']} />
              </div>
              
              <div>
                 <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Slide Size</label>
                 <ControlPill className="justify-between px-3 py-2">
                    <span className="text-xs text-slate-400">Widescreen (16:9)</span>
                    <Settings size={14} className="text-slate-500" />
                 </ControlPill>
              </div>

              <div>
                 <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Background</label>
                 <div className="grid grid-cols-4 gap-2 mb-2">
                    {['#fff', '#000', '#1e293b', '#3b82f6'].map(c => (
                       <div key={c} className="h-8 rounded-lg border border-slate-700 cursor-pointer" style={{background: c}}></div>
                    ))}
                 </div>
                 <DarkSlider value={100} label="Opacity" color="bg-slate-400" />
              </div>

           </div>
         </div>
      );
   }

   // --- ANIMATION PANEL (Professional Timeline & Settings) ---
   if (type === RightPanelType.ANIMATION) {
      const [animType, setAnimType] = useState(0);

      return (
         <div className="flex flex-col h-full bg-[#050505] text-slate-300">
            <PanelHeader title="Animation Pane" icon={Zap} onClose={onClose} />
            <div className="p-5 space-y-6 overflow-y-auto">
               
               {/* 1. Animation Types Tab */}
               <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Animation Type</label>
                  <div className="bg-[#111] p-1 rounded-xl flex gap-1 mb-3">
                     {[
                        { name: 'Entrance', icon: LogIn, color: 'text-green-400' }, 
                        { name: 'Emphasis', icon: Star, color: 'text-yellow-400' }, 
                        { name: 'Exit', icon: LogOut, color: 'text-red-400' }
                     ].map((t, i) => (
                        <button 
                           key={t.name}
                           onClick={() => setAnimType(i)}
                           className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-lg transition-all ${animType === i ? 'bg-[#222] text-white shadow-sm' : 'text-slate-600 hover:text-slate-400'}`}
                        >
                           <t.icon size={16} className={animType === i ? t.color : ''} />
                           <span className="text-[9px] font-bold uppercase">{t.name}</span>
                        </button>
                     ))}
                  </div>
                  {/* Grid of effects based on type */}
                  <div className="grid grid-cols-4 gap-2">
                     {['Fade', 'Zoom', 'Fly', 'Pop', 'Wipe', 'Spin', 'Bounce', 'Float'].map(eff => (
                        <button key={eff} className="aspect-square bg-[#111] border border-[#222] rounded-lg flex flex-col items-center justify-center gap-1 hover:border-blue-500 hover:bg-[#1a1a1a] transition-all group">
                           <div className={`w-2 h-2 rounded-full ${animType===0?'bg-green-500':animType===1?'bg-yellow-500':'bg-red-500'} group-hover:scale-125 transition-transform`}></div>
                           <span className="text-[9px] text-slate-500 group-hover:text-white">{eff}</span>
                        </button>
                     ))}
                  </div>
               </div>

               {/* 2. Effect Settings */}
               <div className="space-y-3 pt-2 border-t border-[#222]">
                  <div>
                     <div className="flex justify-between items-center mb-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Start</label>
                     </div>
                     <ControlPill className="justify-between px-3 py-2 cursor-pointer hover:bg-[#1a1a1a]">
                        <div className="flex items-center gap-2">
                           <MousePointer2 size={12} className="text-blue-500" />
                           <span className="text-xs text-slate-300">On Click</span>
                        </div>
                        <ChevronRight size={12} className="text-slate-600" />
                     </ControlPill>
                  </div>
                  
                  <DarkSlider value={40} label="Duration" color="bg-cyan-500" />
                  <DarkSlider value={10} label="Delay" color="bg-slate-600" />
               </div>

               {/* 3. Animation Timeline */}
               <div className="pt-2 border-t border-[#222]">
                  <div className="flex items-center justify-between mb-3">
                     <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Timeline</label>
                     <div className="flex gap-1">
                        <button className="p-1 hover:bg-[#222] rounded text-slate-400 hover:text-white"><Play size={12} /></button>
                        <button className="p-1 hover:bg-[#222] rounded text-slate-400 hover:text-white"><Pause size={12} /></button>
                     </div>
                  </div>
                  
                  <div className="space-y-1">
                     {/* Timeline Item 1 */}
                     <div className="group">
                        <div className="flex justify-between text-[10px] text-slate-500 mb-0.5 px-1">
                           <span>Title 1</span>
                           <span>0.5s</span>
                        </div>
                        <div className="h-6 bg-[#111] rounded-md relative border border-[#222] overflow-hidden group-hover:border-[#333]">
                           <div className="absolute top-0 bottom-0 left-0 w-[40%] bg-cyan-500/20 border-r border-cyan-500/50 flex items-center px-2">
                              <span className="text-[9px] text-cyan-200 font-mono">Fade In</span>
                           </div>
                        </div>
                     </div>

                     {/* Timeline Item 2 */}
                     <div className="group">
                        <div className="flex justify-between text-[10px] text-slate-500 mb-0.5 px-1">
                           <span>Image 2</span>
                           <span>1.2s</span>
                        </div>
                        <div className="h-6 bg-[#111] rounded-md relative border border-[#222] overflow-hidden group-hover:border-[#333]">
                           <div className="absolute top-0 bottom-0 left-[40%] w-[30%] bg-purple-500/20 border-r border-purple-500/50 flex items-center px-2">
                              <span className="text-[9px] text-purple-200 font-mono">Zoom</span>
                           </div>
                        </div>
                     </div>
                     
                     {/* Timeline Item 3 */}
                     <div className="group">
                        <div className="flex justify-between text-[10px] text-slate-500 mb-0.5 px-1">
                           <span>Shape 4</span>
                           <span>2.0s</span>
                        </div>
                        <div className="h-6 bg-[#111] rounded-md relative border border-[#222] overflow-hidden group-hover:border-[#333]">
                           <div className="absolute top-0 bottom-0 left-[70%] w-[20%] bg-orange-500/20 border-r border-orange-500/50 flex items-center px-2">
                              <span className="text-[9px] text-orange-200 font-mono">Fly Out</span>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Time Ruler */}
                  <div className="flex justify-between text-[9px] text-slate-600 mt-2 px-1 font-mono">
                     <span>0s</span>
                     <span>1s</span>
                     <span>2s</span>
                     <span>3s</span>
                  </div>
               </div>

            </div>
         </div>
      );
   }

   // --- FORMATTING (Control Panel Style) ---
   if (type === RightPanelType.FORMATTING) {
      return (
         <div className="flex flex-col h-full bg-[#050505] text-slate-300">
            <PanelHeader title="Format Shape" icon={LayoutGrid} onClose={onClose} />
            <div className="p-6 space-y-6 overflow-y-auto">
               <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Fill</label>
                  <ColorSwatches />
                  <div className="mt-2">
                     <DarkSlider value={100} label="Opacity" color="bg-blue-500" />
                  </div>
               </div>

               <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Border</label>
                  <ControlPill className="mb-2 justify-between px-3 py-2">
                     <span className="text-xs text-slate-400">Solid Line</span>
                     <div className="w-4 h-4 rounded bg-white border border-slate-600"></div>
                  </ControlPill>
                  <DarkSlider value={20} label="Thickness" color="bg-slate-400" />
               </div>

               <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Size</label>
                  <div className="grid grid-cols-2 gap-2">
                     <ControlPill className="justify-between px-3 py-2"><span className="text-xs text-slate-500">W</span> <span className="text-xs font-mono">400</span></ControlPill>
                     <ControlPill className="justify-between px-3 py-2"><span className="text-xs text-slate-500">H</span> <span className="text-xs font-mono">300</span></ControlPill>
                  </div>
               </div>
               
               <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Rotation</label>
                  <DarkSlider value={0} label="Angle" color="bg-purple-500" />
               </div>

               <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Shadow</label>
                  <div className="flex justify-between items-center bg-[#111] p-3 rounded-2xl border border-[#222]">
                     <span className="text-xs text-slate-400">Drop Shadow</span>
                     <div className="w-10 h-5 bg-blue-900/30 rounded-full relative cursor-pointer border border-blue-500/50"><div className="absolute right-0.5 top-0.5 w-4 h-4 bg-blue-500 rounded-full shadow-lg"></div></div>
                  </div>
               </div>
            </div>
         </div>
      );
   }

   // --- DESIGN PANEL ---
   if (type === RightPanelType.DESIGN) {
      return (
         <div className="flex flex-col h-full bg-[#050505] text-slate-300">
            <PanelHeader title="Design & Themes" icon={Palette} onClose={onClose} />
            <div className="p-6 space-y-6">
               <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Themes</label>
                  <div className="grid grid-cols-2 gap-2">
                     {[1,2,3,4,5,6].map(i => (
                        <div key={i} className="aspect-[16/9] rounded-lg bg-[#111] border border-[#222] hover:border-blue-500 cursor-pointer overflow-hidden relative group">
                           <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${i%2?'from-blue-500 to-purple-500':'from-orange-500 to-red-500'}`}></div>
                           <div className="absolute bottom-2 left-2 w-1/2 h-1 bg-[#333] rounded"></div>
                        </div>
                     ))}
                  </div>
               </div>
               
               <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Background</label>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                     <button className="py-2 bg-[#111] rounded-lg text-xs border border-[#222] hover:bg-[#222] hover:text-white">Solid</button>
                     <button className="py-2 bg-[#111] rounded-lg text-xs border border-[#222] hover:bg-[#222] hover:text-white">Gradient</button>
                  </div>
                  <ColorSwatches />
               </div>
            </div>
         </div>
      );
   }

   // --- TRANSITIONS PANEL ---
   if (type === RightPanelType.TRANSITIONS) {
      return (
         <div className="flex flex-col h-full bg-[#050505] text-slate-300">
            <PanelHeader title="Slide Transitions" icon={MoveHorizontal} onClose={onClose} />
            <div className="p-6 space-y-6">
               <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Effect</label>
                  <div className="grid grid-cols-3 gap-2">
                     {['None', 'Fade', 'Push', 'Wipe', 'Split', 'Morph'].map(t => (
                        <button key={t} className="py-2 bg-[#111] text-slate-400 hover:text-white hover:bg-[#222] rounded-lg text-xs font-medium border border-[#222] transition-colors">{t}</button>
                     ))}
                  </div>
               </div>

               <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Settings</label>
                  <div className="space-y-3">
                     <DarkSlider value={50} label="Duration" color="bg-green-500" />
                     <ControlPill className="justify-between px-3 py-2 cursor-pointer hover:bg-[#1a1a1a]">
                        <span className="text-xs text-slate-300">Sound: None</span>
                        <ChevronRight size={12} className="text-slate-600" />
                     </ControlPill>
                  </div>
               </div>

               <div className="pt-4 border-t border-[#222]">
                   <button className="w-full py-2 bg-[#1a1a1a] hover:bg-[#222] text-slate-300 text-xs font-medium rounded-xl border border-[#333] mb-2">Apply to All Slides</button>
                   <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-xl">Play Preview</button>
               </div>
            </div>
         </div>
      );
   }

   // --- LAYOUTS PANEL ---
   if (type === RightPanelType.LAYOUTS) {
      return (
         <div className="flex flex-col h-full bg-[#050505] text-slate-300">
            <PanelHeader title="Slide Layouts" icon={Layout} onClose={onClose} />
            <div className="p-4 grid grid-cols-2 gap-3">
               {['Title Slide', 'Title & Content', 'Section Header', 'Two Content', 'Comparison', 'Title Only', 'Blank', 'Content w/ Caption'].map(l => (
                  <div key={l} className="group cursor-pointer">
                     <div className="aspect-[16/9] bg-[#111] border border-[#222] rounded-lg mb-1 group-hover:border-blue-500 transition-colors relative">
                        {/* Mock layout lines */}
                        <div className="absolute top-2 left-2 right-2 h-1 bg-[#333] rounded-sm"></div>
                        <div className="absolute top-4 left-2 right-2 bottom-2 bg-[#1a1a1a] rounded-sm border border-[#222]"></div>
                     </div>
                     <div className="text-[10px] text-center text-slate-500 group-hover:text-slate-300">{l}</div>
                  </div>
               ))}
            </div>
         </div>
      );
   }

   // --- NOTES PANEL ---
   if (type === RightPanelType.NOTES) {
      return (
         <div className="flex flex-col h-full bg-white dark:bg-[#0f172a] text-slate-600 dark:text-slate-300">
            <PanelHeader title="Speaker Notes" icon={FileText} onClose={onClose} />
            <div className="flex-1 flex flex-col p-4">
               <div className="flex items-center gap-1 mb-2 p-1 bg-slate-100 dark:bg-[#111] rounded-lg border border-slate-200 dark:border-[#222]">
                  <button className="p-1 hover:bg-slate-200 dark:hover:bg-[#222] rounded"><Bold size={14} /></button>
                  <button className="p-1 hover:bg-slate-200 dark:hover:bg-[#222] rounded"><Italic size={14} /></button>
                  <button className="p-1 hover:bg-slate-200 dark:hover:bg-[#222] rounded"><List size={14} /></button>
               </div>
               <textarea 
                  className="flex-1 w-full bg-transparent resize-none outline-none text-sm leading-relaxed placeholder-slate-400" 
                  placeholder="Click to add notes for this slide..."
               ></textarea>
            </div>
         </div>
      );
   }

   return null;
}
