import React from 'react';
import {
  HardDrive,
  Clock,
  Users,
  Star,
  Trash2,
  Cloud,
  Workflow,
  Plus,
  X,
  WifiOff,
  Settings,
  Moon,
  Sun,
  Database
} from 'lucide-react';

interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeSection,
  setActiveSection,
  isOpen,
  onClose,
  isDarkMode,
  onToggleTheme
}) => {
  const navItems = [
    { id: 'drive', label: 'My Drive', icon: HardDrive },
    { id: 'shared', label: 'Shared with me', icon: Users },
    { id: 'recent', label: 'Recent', icon: Clock },
    { id: 'starred', label: 'Starred', icon: Star },
    { id: 'offline', label: 'Offline Files', icon: WifiOff },
    { id: 'workflows', label: 'Workflows', icon: Workflow },
    { id: 'trash', label: 'Trash', icon: Trash2 },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-xl border-r border-gray-200 dark:border-gray-800 h-full flex flex-col transition-transform duration-300 ease-in-out
        md:translate-x-0 md:static md:inset-auto md:flex
        ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
      `}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-2.5 rounded-xl shadow-lg shadow-blue-500/20">
              <Cloud className="h-5 w-5 text-white fill-white" />
            </div>
            <span className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Darevel<span className="text-primary font-normal">Drive</span></span>
          </div>
          <button
            onClick={onClose}
            className="md:hidden p-1.5 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 mb-6">
          <button className="w-full flex items-center justify-center space-x-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/10 text-slate-700 dark:text-slate-200 hover:text-primary py-3 px-4 rounded-2xl shadow-sm transition-all duration-200 font-medium group relative overflow-hidden">
            <div className="absolute inset-0 bg-blue-50 dark:bg-blue-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
            <div className="bg-blue-100 dark:bg-blue-900/50 group-hover:bg-blue-200 dark:group-hover:bg-blue-800 p-1 rounded-full transition-colors relative z-10">
                <Plus className="h-4 w-4 text-blue-700 dark:text-blue-300" />
            </div>
            <span className="relative z-10">New Upload</span>
          </button>
        </div>

        <div className="px-4 pb-2">
            <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Locations</p>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  onClose();
                }}
                className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 shadow-sm ring-1 ring-blue-100 dark:ring-blue-800'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-gray-100/80 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Icon className={`h-4.5 w-4.5 transition-colors ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
                <span>{item.label}</span>
                {item.id === 'starred' && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-400" />}
              </button>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="p-5 border-t border-gray-200/60 dark:border-gray-800 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm space-y-4">

          {/* Storage Widget */}
          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex justify-between items-center mb-2">
               <div className="flex items-center gap-2">
                   <Database className="h-3.5 w-3.5 text-slate-400" />
                   <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Storage</span>
               </div>
               <span className="text-xs text-slate-400">45%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 mb-2 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-400 h-1.5 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" style={{ width: '45%' }}></div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">6.8 GB of 15 GB used</p>
            <button className="w-full py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                Upgrade Plan
            </button>
          </div>

          <div className="flex items-center justify-between px-2">
             <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded-lg transition-colors">
                <Settings className="h-5 w-5" />
             </button>
             <button
               onClick={onToggleTheme}
               className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded-lg transition-colors"
               aria-label="Toggle dark mode"
             >
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
             </button>
          </div>
        </div>
      </div>
    </>
  );
};
