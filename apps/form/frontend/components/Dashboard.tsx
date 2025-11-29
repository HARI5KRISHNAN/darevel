import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FormsAPI } from '../services/storage';
import { Form, FormStatus } from '../types';
import { Icons } from './ui/Icons';
import { formatDistanceToNow } from 'date-fns';
import clsx from 'clsx';
import { useAuth } from '../contexts/AuthContext';

type FilterType = 'all' | 'active' | 'draft';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [forms, setForms] = useState<Form[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [search, setSearch] = useState('');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setForms(FormsAPI.list());
  }, []);

  const handleCreate = () => {
    const newForm = FormsAPI.create('Untitled Form', 'Start typing to create your form...');
    navigate(`/builder/${newForm.id}`);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this form?')) {
      FormsAPI.delete(id);
      setForms(FormsAPI.list());
    }
  };

  const filteredForms = forms.filter(form => {
    const matchesSearch = form.title.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' 
      ? true 
      : filter === 'active' 
        ? form.status === FormStatus.ACTIVE 
        : form.status === FormStatus.DRAFT;
    return matchesSearch && matchesFilter;
  });

  const NavItem = ({ 
    active, 
    icon: Icon, 
    label, 
    onClick 
  }: { 
    active: boolean; 
    icon: any; 
    label: string; 
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      className={clsx(
        "group w-full flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-200 mb-3",
        active 
          ? "bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30" 
          : "text-gray-500 hover:bg-white/50 hover:text-purple-600"
      )}
      title={label}
    >
      <Icon size={22} strokeWidth={active ? 2.5 : 2} />
      {/* Tooltip-style label for mini sidebar */}
      <span className="text-[10px] font-medium mt-1 opacity-0 group-hover:opacity-100 transition-opacity absolute left-20 bg-gray-800 text-white px-2 py-1 rounded hidden md:block z-50 whitespace-nowrap">
        {label}
      </span>
    </button>
  );

  return (
    <div className="flex min-h-screen">
      {/* Glass Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-20 glass flex flex-col items-center py-6 z-40 border-r border-white/40 hidden md:flex">
        <div className="mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg">
            <span className="font-bold text-xl">D</span>
          </div>
        </div>

        <div className="flex-1 w-full px-3">
          <NavItem 
            active={filter === 'all'} 
            icon={Icons.LayoutGrid} 
            label="All Forms" 
            onClick={() => setFilter('all')}
          />
           <NavItem 
            active={false} 
            icon={Icons.Plus} 
            label="Create New" 
            onClick={handleCreate}
          />
          <div className="h-px bg-gray-200/50 w-full my-3" />
          <NavItem 
            active={filter === 'active'} 
            icon={Icons.CheckCircle} 
            label="Active" 
            onClick={() => setFilter('active')}
          />
          <NavItem 
            active={filter === 'draft'} 
            icon={Icons.FileText} 
            label="Drafts" 
            onClick={() => setFilter('draft')}
          />
        </div>

        <div className="mt-auto px-3">
          <NavItem 
            active={false} 
            icon={Icons.Settings} 
            label="Settings" 
            onClick={() => {}}
          />
          <div className="w-10 h-10 mt-2 rounded-full bg-gradient-to-r from-pink-500 to-orange-400 p-0.5 cursor-pointer hover:scale-105 transition-transform">
             <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" className="w-full h-full rounded-full bg-white" />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 md:ml-20 flex flex-col min-w-0">
        {/* Top Navigation */}
        <header className="h-20 px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="absolute inset-0 glass border-b border-white/40 -z-10"></div>
          
          <div className="flex items-center gap-4">
             <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
               Darevel Form
             </h1>
          </div>

          <div className="flex-1 max-w-xl mx-8">
            <div className="relative group">
              <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-500 transition-colors" size={18} />
              <input 
                type="text"
                placeholder="Search forms..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white/50 border border-white/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:bg-white transition-all shadow-sm backdrop-blur-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white/60 hover:bg-white text-gray-700 rounded-xl text-sm font-medium transition-all border border-white/50 shadow-sm">
              <Icons.Filter size={16} />
              <span>Filter</span>
            </button>
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 hover:bg-black text-white rounded-xl text-sm font-medium shadow-lg shadow-gray-900/20 transition-all hover:-translate-y-0.5"
            >
              <Icons.Plus size={18} />
              Create Form
            </button>

            {/* User Profile Dropdown */}
            <div className="relative ml-2">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-sm font-bold text-white hover:ring-2 hover:ring-purple-300 transition-all shadow-lg"
              >
                {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
              </button>

              {showProfileMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
                    <div className="p-4 border-b border-gray-200 bg-gradient-to-br from-purple-50 to-pink-50">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-xl font-bold text-white">
                          {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-900 truncate">
                            {user?.name || user?.username || 'User'}
                          </div>
                          <div className="text-sm text-gray-600 truncate">
                            {user?.email || 'No email'}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-2">
                      <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-3 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Icons.LogOut size={18} />
                        <span className="font-medium">Sign out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-8 overflow-y-auto">
          
          {/* Dashboard Header in Body */}
          <div className="mb-8 animate-fade-in-up">
            <h2 className="text-3xl font-bold text-gray-800">Dashboard</h2>
            <p className="text-gray-500 mt-1">Manage your forms, analyze responses, and track performance.</p>
          </div>

          {filteredForms.length === 0 ? (
            <div className="h-[50vh] flex flex-col items-center justify-center text-center">
               <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-blue-100 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
                  <Icons.FolderOpen size={48} className="text-purple-400 opacity-80" />
               </div>
               <h2 className="text-2xl font-bold text-gray-800 mb-2">No forms found</h2>
               <p className="text-gray-500 max-w-sm mb-8">
                 {search ? `We couldn't find any forms matching "${search}"` : "Get started by creating your first form with our AI-powered builder."}
               </p>
               {!search && (
                 <button 
                  onClick={handleCreate}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-medium shadow-xl shadow-purple-500/30 hover:shadow-purple-500/40 transition-all"
                 >
                   Create New Form
                 </button>
               )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredForms.map(form => (
                <Link 
                  to={`/builder/${form.id}`} 
                  key={form.id}
                  className="group relative glass-card rounded-2xl p-5 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 hover:-translate-y-1 flex flex-col h-56"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className={clsx(
                      "w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md",
                      form.status === FormStatus.ACTIVE 
                        ? "bg-gradient-to-br from-green-400 to-emerald-600"
                        : "bg-gradient-to-br from-gray-400 to-gray-600"
                    )}>
                      {form.status === FormStatus.ACTIVE ? <Icons.Check size={20} /> : <Icons.FileText size={20} />}
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                       <button 
                         onClick={(e) => handleDelete(e, form.id)}
                         className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                       >
                         <Icons.Trash2 size={16} />
                       </button>
                    </div>
                  </div>

                  <h3 className="font-bold text-gray-800 text-lg mb-1 truncate">{form.title}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">
                    {form.description || "No description provided."}
                  </p>

                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                      {formatDistanceToNow(new Date(form.updatedAt))} ago
                    </span>
                    <div className="flex -space-x-2">
                      <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-200"></div>
                      {form.isPublic && <div className="w-6 h-6 rounded-full border-2 border-white bg-purple-100 flex items-center justify-center text-[10px] text-purple-600 font-bold">+</div>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;