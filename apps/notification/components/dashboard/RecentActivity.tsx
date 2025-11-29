import React, { useState } from 'react';
import { useNotificationStore } from '../../store/useNotificationStore';
import { formatDistanceToNow } from 'date-fns';
import { Activity, AlertCircle } from 'lucide-react';

type FilterType = 'all' | 'unread' | 'high';

export const RecentActivity: React.FC = () => {
  const { notifications } = useNotificationStore();
  const [filter, setFilter] = useState<FilterType>('all');

  const filteredNotifications = notifications
    .filter(n => {
      if (filter === 'unread') return !n.isRead;
      if (filter === 'high') return n.priority === 'high';
      return true;
    })
    .slice(0, 10);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Activity size={18} className="text-blue-600" />
          Recent Activity
        </h3>
        <div className="flex gap-1 bg-gray-200/50 p-1 rounded-lg">
          {(['all', 'unread', 'high'] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`
                px-2 py-1 text-xs font-medium rounded-md capitalize transition-colors
                ${filter === f 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'}
              `}
              title={`Filter by ${f}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="divide-y divide-gray-50">
        {filteredNotifications.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <p className="text-sm">No recent activity</p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div key={notification.id} className="p-3 hover:bg-gray-50 transition-colors group">
              <div className="flex items-start gap-3">
                <div className={`
                  mt-1 w-2 h-2 rounded-full flex-shrink-0
                  ${!notification.isRead ? 'bg-blue-500 ring-2 ring-blue-100' : 'bg-gray-300'}
                `} />
                
                <div className="min-w-0 flex-1">
                  <p className={`text-sm truncate ${!notification.isRead ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                    {notification.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-400 flex-shrink-0">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </span>
                    {notification.priority === 'high' && (
                      <span className="flex items-center gap-0.5 text-[10px] font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-100">
                        <AlertCircle size={10} /> High
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-3 border-t border-gray-100 bg-gray-50 text-center">
        <span className="text-xs text-gray-500">
          Showing latest {filteredNotifications.length} updates
        </span>
      </div>
    </div>
  );
};
