import React, { useState, useEffect, useMemo } from 'react';
import { WikiPage, WikiSpace } from './types';
import Sidebar from './components/Sidebar';
import NavigationRail from './components/NavigationRail';
import Editor from './components/Editor';
import { getSpaces, getPages, savePage, createNewPage, deletePageById } from './services/wikiService';
import { HashRouter, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import {
  Menu, Share, Star, Clock, MoreHorizontal, Search,
  Lock, MessageSquare, CornerUpLeft, Download, ChevronRight, ChevronDown, LogOut, Mail, User
} from 'lucide-react';
import { useAuth } from './contexts/AuthContext';

const WikiContainer = () => {
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [spaces, setSpaces] = useState<WikiSpace[]>([]);
  const [pages, setPages] = useState<WikiPage[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const { pageId } = useParams<{ pageId: string }>();

  useEffect(() => {
    setSpaces(getSpaces());
    setPages(getPages());
  }, []);

  useEffect(() => {
    if (!pageId && pages.length > 0) {
        navigate(`/page/${pages[0].id}`, { replace: true });
    }
  }, [pageId, pages, navigate]);

  const activePage = useMemo(() => 
    pages.find(p => p.id === pageId), 
  [pages, pageId]);

  const handleCreatePage = (spaceId: string, parentId: string | null) => {
    const newPage = createNewPage(spaceId, parentId);
    setPages(prev => [...prev, newPage]);
    navigate(`/page/${newPage.id}`);
  };

  const handleUpdatePage = (updatedPage: WikiPage) => {
    savePage(updatedPage);
    setPages(prev => prev.map(p => p.id === updatedPage.id ? updatedPage : p));
  };

  const handleDeletePage = (id: string) => {
      deletePageById(id);
      const remaining = pages.filter(p => p.id !== id);
      setPages(remaining);
      if (activePage?.id === id) {
          navigate(remaining.length > 0 ? `/page/${remaining[0].id}` : '/');
      }
  };

  const getBreadcrumbs = (page: WikiPage): WikiPage[] => {
      const crumbs = [page];
      let current = page;
      while (current.parentId) {
          const parent = pages.find(p => p.id === current.parentId);
          if (parent) {
              crumbs.unshift(parent);
              current = parent;
          } else {
              break;
          }
      }
      return crumbs;
  };

  const breadcrumbs = activePage ? getBreadcrumbs(activePage) : [];

  return (
    <div className="flex h-screen bg-[#F5F7FA] text-gray-900 font-sans overflow-hidden">
      <NavigationRail />
      
      {isSidebarOpen && (
        <Sidebar 
            spaces={spaces} 
            pages={pages} 
            activePageId={activePage?.id || null} 
            onSelectPage={(id) => navigate(`/page/${id}`)}
            onCreatePage={handleCreatePage}
        />
      )}

      <main className="flex-1 flex flex-col h-full min-w-0 bg-white shadow-xl shadow-gray-200/50 rounded-tl-xl overflow-hidden my-1 mr-1 border border-gray-200/50">
        {activePage ? (
          <>
            {/* Enterprise Top Navigation Bar */}
            <header className="h-14 flex items-center justify-between px-6 border-b border-gray-100 bg-white sticky top-0 z-20">
                <div className="flex items-center gap-3 text-sm text-gray-500 overflow-hidden">
                    <button 
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-1.5 hover:bg-gray-100 rounded text-gray-400 transition-colors"
                    >
                        <Menu size={18} />
                    </button>
                    
                    <div className="flex items-center gap-1.5">
                        {breadcrumbs.map((crumb, index) => (
                            <React.Fragment key={crumb.id}>
                                {index > 0 && <ChevronRight size={14} className="text-gray-300" />}
                                <button 
                                    onClick={() => navigate(`/page/${crumb.id}`)}
                                    className="hover:text-gray-900 hover:bg-gray-50 px-2 py-1 rounded transition-colors flex items-center gap-2"
                                >
                                    <span className="text-lg leading-none">{crumb.icon}</span>
                                    <span className="font-medium truncate max-w-[150px]">{crumb.title}</span>
                                </button>
                            </React.Fragment>
                        ))}
                    </div>
                </div>
                
                <div className="flex items-center gap-2 text-gray-400">
                    <div className="hidden md:flex items-center gap-1 mr-4">
                         <span className="text-xs text-gray-400 mr-2">Edited 2m ago</span>
                         {/* Avatars of people on page */}
                         <div className="flex -space-x-2">
                             <img src="https://i.pravatar.cc/150?u=u2" className="w-6 h-6 rounded-full border-2 border-white" alt="User" />
                             <img src="https://i.pravatar.cc/150?u=u3" className="w-6 h-6 rounded-full border-2 border-white" alt="User" />
                         </div>
                    </div>

                    <div className="h-5 w-px bg-gray-200 mx-2 hidden md:block"></div>

                    <button 
                        onClick={() => handleUpdatePage({...activePage, isFavorite: !activePage.isFavorite})}
                        className={`p-1.5 hover:bg-gray-100 rounded transition-colors ${activePage.isFavorite ? 'text-yellow-400' : 'hover:text-yellow-500'}`}
                        title="Favorite"
                    >
                        <Star size={18} fill={activePage.isFavorite ? "currentColor" : "none"} />
                    </button>
                    
                    <button className="p-1.5 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors" title="View History">
                        <Clock size={18} />
                    </button>
                    
                    <button className="p-1.5 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors" title="Comments">
                        <MessageSquare size={18} />
                    </button>
                    
                    <button className="flex items-center gap-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-md transition-colors shadow-sm ml-2">
                        <Share size={14} />
                        <span>Share</span>
                    </button>
                    
                    <button className="p-1.5 hover:bg-gray-100 rounded text-gray-600">
                        <MoreHorizontal size={18} />
                    </button>

                    {/* Profile Section */}
                    <div className="h-5 w-px bg-gray-200 mx-3"></div>

                    {/* User Profile Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                            className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold text-white hover:ring-2 hover:ring-purple-300 transition-all"
                        >
                            {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                        </button>

                        {showProfileMenu && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
                                <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 overflow-hidden">
                                    <div className="p-4 border-b border-gray-200 bg-gradient-to-br from-purple-50 to-pink-50">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-xl font-bold text-white">
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
                                            className="w-full flex items-center gap-3 px-3 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
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

            {/* Main Scrollable Area */}
            <div className="flex-1 overflow-y-auto scroll-smooth relative">
                <Editor 
                    key={activePage.id}
                    page={activePage} 
                    onUpdate={handleUpdatePage} 
                />
                
                {/* Floating Search (CMD+K style) */}
                <div className="fixed bottom-6 right-8">
                     <button className="bg-gray-900 text-white rounded-full p-4 shadow-2xl hover:scale-105 transition-transform group relative">
                         <Search size={24} />
                         <span className="absolute right-full mr-4 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">Quick Find (⌘K)</span>
                     </button>
                </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center flex-col text-gray-400">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-6">
                 <div className="text-4xl">👋</div>
              </div>
              <h2 className="text-xl font-semibold text-gray-800">Welcome to Darevel Wiki</h2>
              <p className="mt-2 text-gray-500 max-w-sm text-center">Select a page from the sidebar to start writing or create a new one.</p>
              <button className="mt-8 px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors">
                  Create First Page
              </button>
          </div>
        )}
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/page/:pageId" element={<WikiContainer />} />
        <Route path="/" element={<WikiContainer />} />
      </Routes>
    </HashRouter>
  );
};

export default App;