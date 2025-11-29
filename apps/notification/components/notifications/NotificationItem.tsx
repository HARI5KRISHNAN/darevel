import React from 'react';
import { Notification } from '../../types';
import { getIconForType } from '../ui/Icons';

const timeAgo = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + 'y ago';
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + 'mo ago';
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + 'd ago';
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + 'h ago';
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + 'm ago';
  return 'Just now';
};

interface Props {
  notification: Notification;
  onClick: (n: Notification) => void;
  compact?: boolean;
}

export const NotificationItem: React.FC<Props> = ({ notification, onClick, compact }) => {
  return (
    <div 
      onClick={() => onClick(notification)}
      className={`
        group relative p-4 border-b border-gray-100 cursor-pointer transition-all duration-200
        hover:bg-white hover:shadow-md hover:z-10 hover:border-transparent
        ${!notification.isRead ? 'bg-blue-50/40' : 'bg-white'}
      `}
    >
      <div className="flex gap-3">
        <div className="flex-shrink-0 relative">
          {notification.avatarUrl ? (
             <img 
               src={notification.avatarUrl} 
               alt={notification.senderName} 
               className="w-10 h-10 rounded-full object-cover border border-gray-200 shadow-sm"
             />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shadow-sm">
              {getIconForType(notification.type)}
            </div>
          )}
          
          <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm border border-gray-100">
             {getIconForType(notification.type)}
          </div>
        </div>

        <div className="flex-1 min-w-0 pr-4">
          <div className="flex justify-between items-start">
            <h4 className={`text-sm ${!notification.isRead ? 'font-bold text-gray-900' : 'font-medium text-gray-700'} truncate mr-2`}>
              {notification.title}
            </h4>
            <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
              {timeAgo(notification.createdAt)}
            </span>
          </div>
          
          <p className={`text-sm mt-0.5 line-clamp-2 ${!notification.isRead ? 'text-gray-800' : 'text-gray-500'}`}>
            {notification.message}
          </p>

          {!compact && (
            <div className="mt-2 flex gap-2">
               <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full uppercase tracking-wider font-bold border border-gray-200">
                 {notification.type}
               </span>
            </div>
          )}
        </div>
        
        {!notification.isRead && (
          <div className="absolute top-4 right-3 w-2.5 h-2.5 bg-blue-600 rounded-full ring-2 ring-white shadow-sm" title="Unread" />
        )}
      </div>
    </div>
  );
};
