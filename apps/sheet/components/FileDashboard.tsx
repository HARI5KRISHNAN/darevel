
import React from 'react';
import { 
  ArrowLeft, Search, Bell, HardDrive, Share2, Clock, Star, Trash, 
  Plus, ChevronRight, Folder, UploadCloud, Layout, FileText, MonitorPlay, 
  Briefcase, Table, FileDown, Loader2, RefreshCcw
} from 'lucide-react';

interface SheetListItem {
  id: number;
  name: string;
  lastSavedAt?: string;
  updatedAt?: string;
}

interface FileDashboardProps {
  onBack: () => void;
  onOpenTemplates: () => void;
  sheets: SheetListItem[];
  isLoading: boolean;
  onOpenSheet: (id: number) => void;
  onCreateSheet: () => void;
  onDeleteSheet: (id: number) => void;
  onRefresh: () => void;
}

const FileDashboard: React.FC<FileDashboardProps> = ({
  onBack,
  onOpenTemplates,
  sheets,
  isLoading,
  onOpenSheet,
  onCreateSheet,
  onDeleteSheet,
  onRefresh
}) => {
  const formatDate = (value?: string) => {
    if (!value) return '—';
    try {
      return new Date(value).toLocaleString();
    } catch {
      return value;
    }
  };
  return (
    <div className="fixed inset-0 bg-white dark:bg-[#0f172a] text-slate-800 dark:text-slate-300 z-50 flex font-sans transition-colors duration-200">
      
      {/* SIDEBAR */}
      <div className="w-64 bg-slate-50 dark:bg-[#0f172a] border-r border-slate-200 dark:border-slate-800 flex flex-col p-6">
        
        {/* Back Button */}
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-8 group transition-colors"
        >
          <div className="p-2 rounded-full bg-slate-200 dark:bg-slate-800 group-hover:bg-slate-300 dark:group-hover:bg-slate-700 transition-colors">
            <ArrowLeft size={18} />
          </div>
          <span className="font-medium">Back to Editor</span>
        </button>

        <div className="space-y-8 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-800">
          
          {/* Storage Section */}
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 px-2">Storage</h3>
            <div className="space-y-1">
              <NavItem icon={UploadCloud} label="Upload" active subtext="Drag & Drop" color="text-blue-500 dark:text-blue-400" />
              <NavItem icon={HardDrive} label="Darevel Drive" subtext="83 GB / 512 GB" color="text-green-500" />
              <NavItem 
                icon={Layout} 
                label="Sample Docs template" 
                subtext="124 Available" 
                color="text-sky-500" 
                onClick={onOpenTemplates}
              />
            </div>
          </div>

          {/* Navigation Section */}
          <div>
             <div className="space-y-1">
              <NavItem icon={Share2} label="Shared with me" />
              <NavItem icon={Clock} label="Recent" />
              <NavItem icon={Star} label="Starred" />
              <NavItem icon={Trash} label="Trash" />
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-xl p-4 mb-4 border border-slate-200 dark:border-slate-700/50">
             <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-500/10 dark:bg-blue-500/20 rounded-lg text-blue-500 dark:text-blue-400">
                   <Folder size={20} />
                </div>
                <div>
                   <div className="text-sm font-semibold text-slate-800 dark:text-white">Upgrade to PRO</div>
                   <div className="text-[10px] text-slate-500 dark:text-slate-400">Get all features</div>
                </div>
             </div>
             <button className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-medium flex items-center gap-1">
                Upgrade Now <ChevronRight size={12} />
             </button>
          </div>

          <button onClick={onCreateSheet} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center gap-2 font-medium shadow-lg shadow-blue-500/20 dark:shadow-blue-900/20 transition-all active:scale-95">
            <Plus size={20} /> Create New
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 bg-slate-100 dark:bg-[#0b1120] flex flex-col min-w-0">
        
        {/* Header */}
        <div className="h-20 flex items-center justify-between px-8 border-b border-slate-200 dark:border-slate-800/50 bg-white dark:bg-transparent">
          <div className="w-96 relative">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
             <input 
               type="text" 
               placeholder="Search something..." 
               className="w-full bg-slate-50 dark:bg-[#1e293b] border border-slate-200 dark:border-none rounded-2xl py-3 pl-12 pr-4 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500/50 outline-none"
             />
          </div>
          
          <div className="flex items-center gap-6">
             <button
               onClick={onRefresh}
               className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
               title="Refresh"
             >
               {isLoading ? <Loader2 size={18} className="animate-spin" /> : <RefreshCcw size={18} />}
             </button>
             <button className="relative text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
                <Bell size={20} />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-[#0b1120]"></span>
             </button>
             <div className="flex items-center gap-3 pl-6 border-l border-slate-200 dark:border-slate-800">
                <div className="text-right hidden md:block">
                   <div className="text-sm font-semibold text-slate-800 dark:text-white">Hi, Darevel</div>
                   <div className="text-xs text-slate-500">Admin</div>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 border-2 border-white dark:border-[#0b1120] shadow-lg"></div>
             </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8">
           
           {/* Storage Cards */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <StorageCard 
                icon={UploadCloud} 
                name="Upload" 
                used="Select Files" 
                total="Cloud" 
                color="bg-blue-500" 
                active 
              />
              <StorageCard 
                icon={HardDrive} 
                name="Darevel Drive" 
                used="83 Gb" 
                total="512 Gb" 
                percent={11} 
                color="bg-green-500" 
              />
              <StorageCard 
                icon={Layout} 
                name="Sample Docs template" 
                used="124" 
                total="Items" 
                color="bg-sky-500" 
                onClick={onOpenTemplates}
              />
           </div>

           {/* Quick Access */}
           <div className="mb-10">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Quick Access</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                 <QuickItem icon={FileText} label="Docs" color="text-blue-500 dark:text-blue-400" bg="bg-blue-100 dark:bg-blue-500/10" />
                 <QuickItem icon={MonitorPlay} label="Slides" color="text-orange-500 dark:text-orange-400" bg="bg-orange-100 dark:bg-orange-500/10" />
                 <QuickItem icon={Briefcase} label="Suites" color="text-amber-500 dark:text-amber-400" bg="bg-amber-100 dark:bg-amber-500/10" />
                 <QuickItem icon={Table} label="Sheet" color="text-emerald-500 dark:text-emerald-400" bg="bg-emerald-100 dark:bg-emerald-500/10" onClick={onCreateSheet} />
                 <QuickItem icon={File} label="Zip Files" color="text-slate-500 dark:text-slate-400" bg="bg-slate-200 dark:bg-slate-500/10" />
                 <QuickItem icon={File} label="Documents" color="text-indigo-500 dark:text-indigo-400" bg="bg-indigo-100 dark:bg-indigo-500/10" />
                 <QuickItem icon={FileDown} label="Download as PDF" color="text-red-500 dark:text-red-400" bg="bg-red-100 dark:bg-red-500/10" />
              </div>
           </div>

           {/* My Files */}
           <div>
              <div className="flex items-center justify-between mb-6">
                 <h2 className="text-lg font-bold text-slate-800 dark:text-white">My Files</h2>
                <span className="text-xs text-slate-500 dark:text-slate-400">{sheets.length} items</span>
              </div>

              <div className="bg-white dark:bg-[#1e293b]/50 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800/50">
                {isLoading ? (
                 <div className="p-8 text-center text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  Loading sheets…
                 </div>
                ) : sheets.length === 0 ? (
                 <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                  No sheets available yet.
                  <button onClick={onCreateSheet} className="ml-2 text-blue-600 dark:text-blue-400 underline">Create one</button>
                 </div>
                ) : (
                 <table className="w-full text-left text-sm">
                   <thead>
                     <tr className="text-slate-500 border-b border-slate-200 dark:border-slate-800">
                       <th className="font-medium p-4 pl-6">Name</th>
                       <th className="font-medium p-4">Last Saved</th>
                       <th className="font-medium p-4">Updated</th>
                       <th className="font-medium p-4 pr-6 text-right">Actions</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                     {sheets.map(sheet => (
                      <tr key={sheet.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/30">
                        <td className="p-4 pl-6">
                         <button onClick={() => onOpenSheet(sheet.id)} className="flex items-center gap-3 text-left">
                          <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-300">
                            <Table size={18} />
                          </div>
                          <div>
                            <div className="font-medium text-slate-700 dark:text-slate-200">{sheet.name}</div>
                            <div className="text-xs text-slate-500">Sheet #{sheet.id}</div>
                          </div>
                         </button>
                        </td>
                        <td className="p-4 text-slate-600 dark:text-slate-400">{formatDate(sheet.lastSavedAt)}</td>
                        <td className="p-4 text-slate-600 dark:text-slate-400">{formatDate(sheet.updatedAt)}</td>
                        <td className="p-4 pr-6 flex items-center justify-end gap-2">
                         <button onClick={() => onOpenSheet(sheet.id)} className="px-3 py-1.5 text-xs rounded-lg bg-blue-600 text-white hover:bg-blue-700">Open</button>
                         <button onClick={() => onDeleteSheet(sheet.id)} className="px-3 py-1.5 text-xs rounded-lg bg-red-100 text-red-600 hover:bg-red-200">Delete</button>
                        </td>
                      </tr>
                     ))}
                   </tbody>
                 </table>
                )}
              </div>
           </div>

        </div>
      </div>
    </div>
  );
};

// --- Subcomponents ---

const NavItem = ({ icon: Icon, label, active, subtext, color, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${active ? 'bg-blue-50 dark:bg-blue-600/10 border border-blue-200 dark:border-blue-600/20' : 'hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent'}`}
  >
     <div className={`${active ? color || 'text-blue-600 dark:text-blue-400' : 'text-slate-500'}`}>
       <Icon size={20} />
     </div>
     <div className="text-left overflow-hidden">
       <div className={`text-sm font-medium truncate ${active ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>{label}</div>
       {subtext && <div className="text-[10px] text-slate-500 truncate">{subtext}</div>}
     </div>
  </button>
);

const StorageCard = ({ icon: Icon, name, used, total, percent, color, active, onClick }: any) => (
  <div 
    onClick={onClick}
    className={`p-6 rounded-3xl relative overflow-hidden transition-all cursor-pointer ${active ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/30 dark:shadow-blue-900/30' : 'bg-white dark:bg-[#1e293b] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600'}`}
  >
     <div className="flex justify-between items-start mb-6">
        <div className={`p-3 rounded-2xl ${active ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800'}`}>
           <Icon size={24} className={active ? 'text-white' : 'text-slate-400'} />
        </div>
        
        {/* Only render percentage ring if percent is defined */}
        {percent !== undefined && (
          <div className="relative w-12 h-12 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path className={`${active ? 'text-blue-800' : 'text-slate-200 dark:text-slate-700'}`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                <path className={`${active ? 'text-white' : 'text-blue-500'}`} strokeDasharray={`${percent}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
            </svg>
            <span className="absolute text-[10px] font-bold">{percent}%</span>
          </div>
        )}
     </div>
     <div className="font-bold text-lg mb-1">{name}</div>
     <div className={`text-xs ${active ? 'text-blue-100' : 'text-slate-500'}`}>{used} / {total}</div>
  </div>
);

const QuickItem = ({ icon: Icon, label, color, bg, onClick }: any) => (
  <button onClick={onClick} className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors gap-3 shadow-sm dark:shadow-none">
     <div className={`p-3 rounded-xl ${bg} ${color}`}>
        <Icon size={24} />
     </div>
     <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{label}</span>
  </button>
);

export default FileDashboard;
