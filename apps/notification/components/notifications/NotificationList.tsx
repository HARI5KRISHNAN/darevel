import React, { useEffect, useRef } from 'react';
import { Notification } from '../../types';
import { NotificationItem } from './NotificationItem';
import { Loader2 } from 'lucide-react';

interface Props {
  notifications: Notification[];
  isLoading: boolean;
  onMarkRead: (id: string) => void;
  onLoadMore: () => void;
  compact?: boolean;
}

const NotificationSkeleton = () => (
  <div className="p-4 border-b border-gray-100 flex gap-3 animate-pulse bg-white">
    <div className="flex-shrink-0">
      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
    </div>
    <div className="flex-1 space-y-3 py-1 min-w-0">
      <div className="flex justify-between items-start gap-4">
        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        <div className="h-3 bg-gray-200 rounded w-12 flex-shrink-0"></div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 rounded w-full"></div>
        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
      </div>
    </div>
  </div>
);

export const NotificationList: React.FC<Props> = ({ 
  notifications, 
  isLoading, 
  onMarkRead, 
  onLoadMore,
  compact 
}) => {
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const prevFirstIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (notifications.length > 0) {
      const firstId = notifications[0].id;
      if (prevFirstIdRef.current && prevFirstIdRef.current !== firstId) {
        topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      prevFirstIdRef.current = firstId;
    }
  }, [notifications]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading && notifications.length > 0) {
          onLoadMore();
        }
      },
      { threshold: 1.0 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [isLoading, onLoadMore, notifications.length]);

  if (notifications.length === 0 && isLoading) {
    return (
      <div className="flex flex-col w-full">
        {Array.from({ length: compact ? 4 : 6 }).map((_, i) => (
          <NotificationSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (notifications.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400">
        <div className="bg-gray-50 p-4 rounded-full mb-3">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </div>
        <p>No notifications yet</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full relative">
      <div ref={topRef} className="absolute top-0 w-full h-0 pointer-events-none" />
      
      {notifications.map((notification) => (
        <NotificationItem 
          key={notification.id} 
          notification={notification} 
          onClick={() => onMarkRead(notification.id)}
          compact={compact}
        />
      ))}
      
      <div ref={loadMoreRef} className="p-4 flex justify-center w-full">
        {isLoading && (
          <div className="flex items-center space-x-2 text-gray-400">
            <Loader2 className="animate-spin w-4 h-4" />
            <span className="text-sm">Loading more...</span>
          </div>
        )}
      </div>
    </div>
  );
};
