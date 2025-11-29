import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Shield,
  CreditCard,
  Activity,
  Menu,
  Bell,
  Search,
  Settings,
  X,
  Sparkles,
  Building2,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { generateAdminInsights } from '../services/geminiService';
import { mockApi } from '../services/mockApi';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const SidebarLink: React.FC<{ to: string; icon: React.ElementType; label: string; active: boolean; onClick?: () => void }> = ({
  to,
  icon: Icon,
  label,
  active,
  onClick,
}) => (
  <Link
    to={to}
    onClick={onClick}
    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
      active ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-600'
    }`}
  >
    <Icon className="w-5 h-5" />
    <span className="font-medium">{label}</span>
  </Link>
);

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const usersQuery = useQuery({ queryKey: ['users', ''], queryFn: () => mockApi.fetchUsers('') });
  const statsQuery = useQuery({ queryKey: ['stats'], queryFn: mockApi.fetchOrgStats });
  const activityQuery = useQuery({ queryKey: ['activity'], queryFn: mockApi.fetchActivity });
  const teamsQuery = useQuery({ queryKey: ['teams'], queryFn: mockApi.fetchTeams });

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Overview' },
    { to: '/users', icon: Users, label: 'Users' },
    { to: '/teams', icon: Building2, label: 'Teams' },
    { to: '/security', icon: Shield, label: 'Security' },
    { to: '/billing', icon: CreditCard, label: 'Billing' },
    { to: '/audit', icon: Activity, label: 'Audit Log' },
  ];

  const handleAiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    setAiLoading(true);
    setAiResponse('');

    const contextData = {
      users: usersQuery.data || [],
      teams: teamsQuery.data || [],
      stats: statsQuery.data || {
        activeUsers: 0,
        totalUsers: 0,
        storageUsedGB: 0,
        storageLimitGB: 0,
        filesCount: 0,
        topApp: '',
      },
      activity: activityQuery.data || [],
    };

    const response = await generateAdminInsights(aiPrompt, contextData);
    setAiResponse(response);
    setAiLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setIsSidebarOpen(false)} />}

      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 z-30 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center mr-3">
            <span className="text-white font-bold text-lg">A</span>
          </div>
          <span className="text-xl font-bold text-gray-800">AdminConsole</span>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map(item => (
            <SidebarLink key={item.to} {...item} active={location.pathname === item.to} onClick={() => setIsSidebarOpen(false)} />
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 w-full p-4 border-t border-gray-100">
          <div className="flex items-center space-x-3 p-2 rounded-lg bg-gray-50">
            <img src="https://picsum.photos/id/64/100/100" className="w-8 h-8 rounded-full" alt="Profile" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">Admin User</p>
              <p className="text-xs text-gray-500 truncate">admin@acme.com</p>
            </div>
            <Settings className="w-4 h-4 text-gray-400 cursor-pointer" />
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 focus:outline-none">
              <Menu className="w-6 h-6" />
            </button>

            <nav className="hidden sm:flex" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2">
                <li>
                  <span className="text-gray-400">Org</span>
                </li>
                <li className="text-gray-300">/</li>
                <li>
                  <span className="text-gray-900 font-medium">Acme Corp</span>
                </li>
                <li className="text-gray-300">/</li>
                <li>
                  <span className="text-indigo-600 font-medium capitalize">
                    {location.pathname === '/' ? 'Overview' : location.pathname.substring(1)}
                  </span>
                </li>
              </ol>
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64"
              />
            </div>
            <button className="p-2 text-gray-400 hover:text-gray-500 relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 relative">{children}</div>
      </main>

      <div className="fixed bottom-6 right-6 z-40">
        {!isAiOpen && (
          <button
            onClick={() => setIsAiOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-110 flex items-center gap-2"
          >
            <Sparkles className="w-6 h-6" />
            <span className="font-medium hidden sm:block">Ask AI</span>
          </button>
        )}

        {isAiOpen && (
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-80 sm:w-96 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5">
            <div className="bg-indigo-600 p-4 flex justify-between items-center text-white">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                <h3 className="font-semibold">Admin Assistant</h3>
              </div>
              <button onClick={() => setIsAiOpen(false)} className="hover:bg-indigo-700 p-1 rounded">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="h-64 overflow-y-auto p-4 bg-gray-50 space-y-3">
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="bg-white p-3 rounded-lg shadow-sm text-sm text-gray-700">
                  Hi! I can analyze your dashboard data. Ask me about users, security logs, or usage stats.
                </div>
              </div>
              {aiResponse && (
                <div className="flex gap-2 animate-in fade-in">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="bg-white p-3 rounded-lg shadow-sm text-sm text-gray-700">{aiResponse}</div>
                </div>
              )}
            </div>
            <form onSubmit={handleAiSubmit} className="p-3 border-t bg-white flex gap-2">
              <input
                type="text"
                value={aiPrompt}
                onChange={e => setAiPrompt(e.target.value)}
                placeholder="Ask about your data..."
                className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={aiLoading}
                className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {aiLoading ? <Activity className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLayout;
