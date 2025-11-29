import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Building2,
  Settings,
  Bell,
  Search,
  Menu,
  X,
  Plus,
  HelpCircle,
  Command,
  LogOut
} from 'lucide-react';
import { DashboardView, User } from '../types';
import { CURRENT_USER } from '../constants';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
  currentView: DashboardView;
  onViewChange: (view: DashboardView) => void;
}

export const DashboardLayout: React.FC<LayoutProps> = ({ children, currentView, onViewChange }) => {
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const NavItem = ({ view, icon: Icon, label }: { view: DashboardView, icon: any, label: string }) => (
    <button
      onClick={() => {
        onViewChange(view);
        setIsMobileMenuOpen(false);
      }}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
        ${currentView === view 
          ? 'bg-indigo-50 text-indigo-700' 
          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
        }`}
    >
      <Icon size={18} />
      {label}
    </button>
  );

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden">
      
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b border-slate-100">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center mr-3 shadow-indigo-200 shadow-md">
              <span className="text-white font-bold text-lg">D</span>
            </div>
            <span className="text-xl font-bold text-slate-800 tracking-tight">Darevel Dashoboard</span>
          </div>

          {/* Navigation */}
          <div className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            <div className="text-xs font-bold text-slate-400 uppercase px-3 mb-2 tracking-wider">Dashboards</div>
            <NavItem view={DashboardView.PERSONAL} icon={LayoutDashboard} label="Personal" />
            <NavItem view={DashboardView.TEAM} icon={Users} label="Team" />
            {CURRENT_USER.role === 'ADMIN' && (
              <NavItem view={DashboardView.ORG} icon={Building2} label="Organization" />
            )}

            <div className="my-6 border-t border-slate-100"></div>

            <div className="text-xs font-bold text-slate-400 uppercase px-3 mb-2 tracking-wider">Apps</div>
             {/* Mock links for other modules */}
             {['Tasks', 'Docs', 'Mail', 'Calendar'].map(app => (
               <button key={app} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
                 <span className="w-4 h-4 rounded bg-slate-200"></span> {app}
               </button>
             ))}
          </div>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-slate-100">
            <button className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors w-full">
              <Settings size={18} /> Settings
            </button>
            <button className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors w-full mt-1">
              <HelpCircle size={18} /> Help & Support
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 z-30">
          <div className="flex items-center gap-4">
            <button className="lg:hidden text-slate-500 hover:text-slate-700" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu size={24} />
            </button>
            
            {/* Search Bar */}
            <div className="hidden md:flex items-center relative group">
              <Search size={16} className="absolute left-3 text-slate-400 group-hover:text-indigo-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search everything... (Cmd+K)" 
                className="pl-9 pr-4 py-2 w-64 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
              <div className="absolute right-2 flex items-center pointer-events-none">
                 <Command size={12} className="text-slate-400" />
                 <span className="text-[10px] text-slate-400 ml-0.5">K</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
             {/* Quick Add */}
             <button className="hidden sm:flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-all shadow-sm shadow-indigo-200">
                <Plus size={16} /> <span className="hidden md:inline">Create</span>
             </button>

             <div className="h-6 w-px bg-slate-200 mx-1"></div>

             {/* Notifications */}
             <button className="relative text-slate-500 hover:text-indigo-600 transition-colors p-1.5 rounded-full hover:bg-indigo-50">
               <Bell size={20} />
               <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border border-white"></span>
             </button>

             {/* User Profile Dropdown */}
             <div className="relative">
               <button
                 onClick={() => setShowProfileMenu(!showProfileMenu)}
                 className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white hover:ring-2 hover:ring-indigo-300 transition-all shadow-sm"
               >
                 {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
               </button>

               {showProfileMenu && (
                 <>
                   <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
                   <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-2xl border border-slate-200 z-50 overflow-hidden">
                     <div className="p-4 border-b border-slate-200 bg-gradient-to-br from-indigo-50 to-purple-50">
                       <div className="flex items-center gap-3">
                         <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl font-bold text-white">
                           {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                         </div>
                         <div className="flex-1 min-w-0">
                           <div className="font-semibold text-slate-900 truncate">
                             {user?.name || user?.username || 'User'}
                           </div>
                           <div className="text-sm text-slate-600 truncate">
                             {user?.email || 'No email'}
                           </div>
                         </div>
                       </div>
                     </div>
                     <div className="p-2">
                       <button
                         onClick={logout}
                         className="w-full flex items-center gap-3 px-3 py-2 text-left text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                       >
                         <LogOut size={18} />
                         <span className="font-medium">Sign out</span>
                       </button>
                     </div>
                   </div>
                 </>
               )}
             </div>
          </div>
        </header>

        {/* Dashboard Content Scrollable Area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 bg-slate-50/50">
           <div className="max-w-7xl mx-auto h-full">
             {children}
           </div>
        </main>

      </div>
    </div>
  );
};
