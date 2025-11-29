import React from 'react';
import { Shield, Users, Lock, Grid, LogOut, Layout as LayoutIcon, Briefcase } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentView: string;
  onNavigate: (view: any) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentView, onNavigate }) => {
  const navItems = [
    { id: 'roles_list', label: 'Roles', icon: Shield },
    { id: 'users_list', label: 'Users', icon: Users },
    { id: 'teams_list', label: 'Teams', icon: Briefcase },
    { id: 'resources_list', label: 'Resources', icon: Lock },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col fixed h-full z-20">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center shrink-0">
            <LayoutIcon size={20} className="text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight leading-tight">Darevel Access Control</span>
        </div>

        <div className="flex-1 py-6 px-3">
          <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Access Control</p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = currentView.startsWith(item.id.split('_')[0]); // Simple active check
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate({ name: item.id })}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <item.icon size={18} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-2 mb-4 group cursor-pointer">
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
                alt="Profile" 
                className="w-9 h-9 rounded-full border border-slate-600 object-cover"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-slate-900 rounded-full"></span>
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-white truncate group-hover:text-indigo-400 transition-colors">Jane Admin</p>
              <p className="text-xs text-slate-500 truncate">jane@darevel.com</p>
            </div>
          </div>

          <button className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium w-full px-2 py-2 rounded hover:bg-slate-800">
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 min-h-screen">
        {children}
      </main>
    </div>
  );
};

export default Layout;
