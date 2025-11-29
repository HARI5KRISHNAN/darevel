import React, { useRef, useEffect, useState } from 'react';
import { useNotificationStore } from '../../store/useNotificationStore';
import { NotificationList } from './NotificationList';
import { CheckCheck, Settings, ExternalLink, Search, X } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Props {
  onClose: () => void;
}

export const NotificationPanel: React.FC<Props> = ({ onClose }) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { 
    notifications, 
    isLoading, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    loadMore 
  } = useNotificationStore();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const filteredNotifications = notifications.filter(n => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return n.title.toLowerCase().includes(query) || n.message.toLowerCase().includes(query);
  });

  return (
    <div 
      ref={panelRef}
      className="bg-white rounded-xl shadow-2xl ring-1 ring-black ring-opacity-5 flex flex-col max-h-[80vh] w-full overflow-hidden animate-slide-in"
    >
      <div className="flex-shrink-0 p-4 border-b border-gray-100 flex justify-between items-center bg-white z-20">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-gray-800">Notifications</h3>
          {unreadCount > 0 && (
            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">
              {unreadCount} New
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => markAllAsRead()}
            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            title="Mark all as read"
          >
            <CheckCheck size={18} />
          </button>
          <Link 
            to="/settings/notifications"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            title="Settings"
          >
            <Settings size={18} />
          </Link>
        </div>
      </div>

      <div className="flex-shrink-0 px-4 py-3 bg-gray-50/80 border-b border-gray-100 backdrop-blur-sm z-10">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={14} />
          <input 
            type="text" 
            placeholder="Search notifications..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400 shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 rounded-full transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overscroll-contain bg-white min-h-[300px]">
        <NotificationList 
          notifications={filteredNotifications}
          isLoading={isLoading}
          onMarkRead={markAsRead}
          onLoadMore={loadMore}
          compact={true}
        />
      </div>

      <div className="flex-shrink-0 p-3 border-t border-gray-100 bg-gray-50 text-center z-20">
        <Link 
          to="/notifications" 
          onClick={onClose}
          className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center justify-center gap-1 py-1"
        >
          View all notifications
          <ExternalLink size={14} />
        </Link>
      </div>
    </div>
  );
};
