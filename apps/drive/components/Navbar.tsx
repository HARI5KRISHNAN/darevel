import React, { useState } from 'react';
import { Search, Bell, Settings, Menu, HelpCircle, LogOut, Mail, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface NavbarProps {
  onSearch: (query: string) => void;
  onMenuClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onSearch, onMenuClick }) => {
  const [query, setQuery] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { user, logout } = useAuth();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    onSearch(e.target.value);
  };

  return (
    <div className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-200/60 flex items-center justify-between px-4 sm:px-6 z-20 sticky top-0 transition-all">
      <div className="flex items-center flex-1 max-w-3xl">
        <button
          onClick={onMenuClick}
          className="mr-3 md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="h-6 w-6" />
        </button>

        <div className="relative w-full group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-12 py-2.5 border border-gray-200 rounded-xl leading-5 bg-gray-50/50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-400 sm:text-sm transition-all duration-200 shadow-sm"
            placeholder="Search in Darevel Drive"
            value={query}
            onChange={handleSearch}
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none hidden sm:flex">
             <kbd className="inline-flex items-center border border-gray-200 rounded px-2 text-xs font-sans font-medium text-gray-400 bg-gray-50">⌘K</kbd>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-1 sm:space-x-2 ml-4">
        <button className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100/80 transition-colors hidden sm:block">
          <HelpCircle className="h-5 w-5" />
        </button>
        <button className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100/80 transition-colors relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2.5 block h-2 w-2 rounded-full ring-2 ring-white bg-red-500"></span>
        </button>

        {/* Profile Dropdown */}
        <div className="relative ml-2">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="h-9 w-9 rounded-full bg-gradient-to-br from-teal-600 to-cyan-700 flex items-center justify-center text-white font-medium text-sm shadow-md cursor-pointer hover:ring-2 hover:ring-offset-2 hover:ring-teal-500 transition-all"
          >
            {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
          </button>

          {showProfileMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowProfileMenu(false)}
              ></div>
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-4 bg-gradient-to-br from-teal-600 to-cyan-700 text-white">
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-semibold text-lg border-2 border-white/30">
                      {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{user?.name || user?.username || 'User'}</p>
                      <p className="text-xs text-teal-50 truncate">{user?.email || 'No email'}</p>
                    </div>
                  </div>
                </div>

                <div className="p-2">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      logout();
                    }}
                    className="w-full flex items-center space-x-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-red-50 rounded-md transition-colors group"
                  >
                    <LogOut className="h-4 w-4 text-gray-400 group-hover:text-red-600" />
                    <span className="group-hover:text-red-600">Sign out</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
