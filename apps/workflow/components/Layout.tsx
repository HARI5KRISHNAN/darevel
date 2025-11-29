import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Zap, Settings, Activity, Menu, X, Layers, Boxes, Plug, Kanban, FileText, Grid, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const platformItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Zap, label: 'Workflows', path: '/workflows' },
    { icon: Activity, label: 'Activity Logs', path: '/activity' },
  ];

  const templateItems = [
    { icon: Kanban, label: 'Task Alerts', path: '/workflows/new?templateId=tpl-kanban-notify' },
    { icon: Boxes, label: 'Auto-Assign Tasks', path: '/workflows/new?templateId=tpl-kanban-assign' },
    { icon: FileText, label: 'Form to Slack', path: '/workflows/new?templateId=tpl-form-slack' },
    { icon: Grid, label: 'Browse All...', path: '/templates' },
  ];

  const configItems = [
    { icon: Plug, label: 'Integrations', path: '/integrations' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  const renderNavItem = (item: any) => (
    <NavLink
      key={item.path}
      to={item.path}
      className={({ isActive }) => `
        flex items-center px-4 py-2.5 rounded-lg transition-colors group text-sm font-medium mb-1
        ${isActive && !item.path.includes('new')
          ? 'bg-indigo-50 text-indigo-700' 
          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
      `}
    >
      <item.icon className={`w-4 h-4 mr-3 ${'text-slate-400 group-hover:text-slate-600'}`} />
      {item.label}
    </NavLink>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200">
        <div className="p-6 flex items-center space-x-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-200">
            <Zap className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-bold text-slate-800 tracking-tight">Darevel workflow</span>
        </div>
        
        <div className="flex-1 px-4 py-2 overflow-y-auto">
          <div className="mb-6">
            <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Platform</p>
            {platformItems.map(renderNavItem)}
          </div>

          <div className="mb-6">
            <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Workflow Templates</p>
            {templateItems.map(renderNavItem)}
          </div>
          
          <div className="mb-6">
             <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Configuration</p>
             {configItems.map(renderNavItem)}
          </div>
        </div>

        <div className="p-4 border-t border-slate-100">
          <div className="bg-slate-900 rounded-xl p-4 text-white shadow-xl mb-4">
            <div className="flex justify-between items-center mb-2">
                <p className="text-xs font-semibold uppercase text-indigo-300">Pro Plan</p>
                <button className="text-[10px] bg-indigo-600 px-2 py-0.5 rounded hover:bg-indigo-500">UPGRADE</button>
            </div>
            <p className="text-sm font-medium mb-2">12,450 / 50,000 runs</p>
            <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
              <div className="bg-indigo-500 h-full w-[25%]"></div>
            </div>
          </div>

          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-full flex items-center gap-3 px-1 hover:bg-slate-50 rounded-lg transition-all"
            >
              <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center border border-indigo-200 shrink-0">
                <span className="font-bold text-indigo-700 text-xs">{user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}</span>
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-semibold text-slate-800 truncate">{user?.name || user?.username || 'User'}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email || 'No email'}</p>
              </div>
            </button>

            {showProfileMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-2xl border border-slate-200 z-50 overflow-hidden">
                  <div className="p-2">
                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-3 px-3 py-2 text-left text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="font-medium text-sm">Sign out</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </aside>

      <div className="md:hidden fixed top-0 w-full bg-white z-20 border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-2">
             <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center">
                <Zap className="text-white w-3 h-3" />
             </div>
             <span className="font-bold text-lg text-slate-800">Darevel workflow</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-600">
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      <main className="flex-1 overflow-auto w-full pt-16 md:pt-0 bg-slate-50">
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>

       {isMobileMenuOpen && (
        <div className="fixed inset-0 z-10 bg-white md:hidden pt-20 px-6 overflow-y-auto">
           <nav className="space-y-6">
             <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Platform</p>
                {platformItems.map((item) => (
                    <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center px-4 py-3 rounded-lg text-lg font-medium text-slate-600 hover:bg-slate-50"
                    >
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.label}
                    </NavLink>
                ))}
             </div>
             <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Templates</p>
                {templateItems.map((item) => (
                    <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center px-4 py-3 rounded-lg text-lg font-medium text-slate-600 hover:bg-slate-50"
                    >
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.label}
                    </NavLink>
                ))}
             </div>

             <div className="pt-6 border-t border-slate-100">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center border border-indigo-200">
                   <span className="font-bold text-indigo-700 text-sm">JD</span>
                 </div>
                 <div>
                   <p className="text-sm font-semibold text-slate-800">John Doe</p>
                   <p className="text-xs text-slate-500">john@darevel.com</p>
                 </div>
               </div>
             </div>
            </nav>
        </div>
       )}
    </div>
  );
};
