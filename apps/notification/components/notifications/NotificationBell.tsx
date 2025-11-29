import React, { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { useNotificationStore } from '../../store/useNotificationStore';
import { NotificationPanel } from './NotificationPanel';

export const NotificationBell: React.FC = () => {
  const { unreadCount, isPanelOpen, setPanelOpen } = useNotificationStore();
  const [animate, setAnimate] = useState(false);
  const prevCount = React.useRef(unreadCount);

  useEffect(() => {
    if (unreadCount > prevCount.current) {
      setAnimate(true);
      const timer = setTimeout(() => setAnimate(false), 1000);
      return () => clearTimeout(timer);
    }
    prevCount.current = unreadCount;
  }, [unreadCount]);

  return (
    <div className="relative">
      <button 
        className={`p-2 rounded-full hover:bg-gray-100 transition-colors relative ${isPanelOpen ? 'bg-blue-50 text-blue-600' : 'text-gray-600'}`}
        onClick={() => setPanelOpen(!isPanelOpen)}
        aria-label="Notifications"
      >
        <Bell className={`w-6 h-6 ${animate ? 'animate-bell-shake' : ''}`} />
        
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-[10px] font-bold text-white items-center justify-center">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          </span>
        )}
      </button>

      {isPanelOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 z-50 origin-top-right">
          <NotificationPanel onClose={() => setPanelOpen(false)} />
        </div>
      )}
    </div>
  );
};
