import React, { useEffect, useState } from 'react';
import { useNotificationStore } from '../store/useNotificationStore';
import { NotificationList } from '../components/notifications/NotificationList';
import { NotificationType } from '../types';
import { Filter, CheckCheck, Trash2, Search, X } from 'lucide-react';

const FILTER_TABS = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
  { id: 'mention', label: 'Mentions' },
  { id: 'assigned', label: 'Assigned' },
];

export const NotificationsPage: React.FC = () => {
  const { 
    notifications, 
    isLoading, 
    markAsRead, 
    markAllAsRead, 
    loadMore,
    fetchNotifications 
  } = useNotificationStore();

  const [activeTab, setActiveTab] = useState('all');
  const [selectedTypes, setSelectedTypes] = useState<NotificationType[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'unread' && n.isRead) return false;
    if (activeTab === 'mention' && n.type !== 'mention') return false;
    if (activeTab === 'assigned' && n.type !== 'task') return false;
    if (selectedTypes.length > 0 && !selectedTypes.includes(n.type)) return false;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = n.title.toLowerCase().includes(query) || n.message.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }
    
    return true;
  });

  const toggleTypeFilter = (type: NotificationType) => {
    setSelectedTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-500">Stay updated with your workspace activity</p>
        </div>
        <div className="flex gap-2">
           <button 
             onClick={() => markAllAsRead()}
             className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors shadow-sm"
           >
             <CheckCheck size={16} />
             Mark all read
           </button>
           <button 
             className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-red-600 transition-colors shadow-sm"
           >
             <Trash2 size={16} />
             Clear all
           </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-64 flex-shrink-0 space-y-6">
           <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
             <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
               <Filter size={16} /> Filters
             </h3>
             
             <div className="space-y-2">
               {['chat', 'mail', 'task', 'calendar', 'doc', 'drive'].map((type) => (
                 <label key={type} className="flex items-center space-x-2 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={selectedTypes.includes(type as NotificationType)}
                      onChange={() => toggleTypeFilter(type as NotificationType)}
                    />
                    <span className="text-sm text-gray-600 group-hover:text-gray-900 capitalize">{type}</span>
                 </label>
               ))}
             </div>
           </div>
        </div>

        <div className="flex-1">
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mb-6">
            <div className="flex gap-1 bg-gray-100/50 p-1 rounded-lg w-full md:w-fit overflow-x-auto">
              {FILTER_TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    px-4 py-2 text-sm font-medium rounded-md transition-all whitespace-nowrap
                    ${activeTab === tab.id 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}
                  `}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-72 group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="text-gray-400 group-focus-within:text-blue-500 transition-colors" size={16} />
              </div>
              <input 
                type="text" 
                placeholder="Search messages..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400 shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-full transition-colors"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[500px]">
            <NotificationList 
              notifications={filteredNotifications}
              isLoading={isLoading}
              onMarkRead={markAsRead}
              onLoadMore={loadMore}
              compact={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
