import React from 'react';
import { DirectMessage } from '../types';

interface MessageListItemProps {
  message: DirectMessage;
  isActive: boolean;
  isCollapsed: boolean;
  onClick: () => void;
  onTogglePin?: (id: string) => void;
  onToggleMute?: (id: string) => void;
}

const MessageListItem: React.FC<MessageListItemProps> = ({ message, isActive, isCollapsed, onClick, onTogglePin, onToggleMute }) => {
    // An item is considered "unread" if it has an unread count and is not the currently active chat.
    const isUnread = !!message.unreadCount && message.unreadCount > 0 && !isActive;

    if (isCollapsed) {
        return (
             <button 
                onClick={onClick} 
                className={`w-full flex justify-center p-3 rounded-md transition-colors relative group ${isActive ? 'bg-background-main' : 'hover:bg-background-main'}`}
                aria-label={message.name}
            >
                <div className="relative shrink-0">
                    <img src={message.avatar} alt={message.name} className="w-10 h-10 rounded-full object-cover" />
                    {message.online && <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-status-green ring-2 ring-background-panel"></span>}
                </div>
                {isUnread && (
                    <span className="absolute top-1 right-1 text-xs font-bold bg-accent text-white rounded-full h-4 w-4 flex items-center justify-center shrink-0 text-[10px]">
                        {message.unreadCount! > 9 ? '9+' : message.unreadCount}
                    </span>
                )}
                <div className="absolute left-full ml-4 px-2 py-1 bg-background-panel border border-border-color text-text-primary text-sm rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                    {message.name}
                </div>
            </button>
        );
    }
    
  return (
    <div className="relative group/item">
        <button onClick={onClick} className={`w-full text-left p-3 flex items-center gap-4 rounded-md transition-colors ${isActive ? 'bg-background-main' : isUnread ? 'bg-accent-soft hover:bg-background-main' : 'hover:bg-background-main'}`}>
            <div className="relative shrink-0">
                <img src={message.avatar} alt={message.name} className="w-10 h-10 rounded-full object-cover" />
                {message.online && <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-status-green ring-2 ring-background-panel"></span>}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <p className={`font-semibold truncate ${isUnread ? 'text-text-primary' : 'text-text-primary/80'}`}>{message.name}</p>
                        {message.isPinned && (
                            <svg className="w-3 h-3 text-accent" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 3l1.5 5h5.5l-4.5 3.5 1.5 5.5-4-3-4 3 1.5-5.5-4.5-3.5h5.5z"/>
                            </svg>
                        )}
                        {message.isMuted && (
                            <svg className="w-3 h-3 text-text-secondary" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z"/>
                            </svg>
                        )}
                    </div>
                    <p className="text-xs text-text-secondary shrink-0 ml-2">{message.timestamp}</p>
                </div>
                <div className="flex justify-between items-center mt-1">
                    <p className={`text-sm truncate ${isUnread ? 'text-text-primary font-semibold' : 'text-text-secondary'}`}>{message.lastMessage}</p>
                    {isUnread && (
                        <span className="text-xs font-bold bg-accent text-white rounded-full h-5 w-5 flex items-center justify-center shrink-0">
                            {message.unreadCount}
                        </span>
                    )}
                </div>
            </div>
        </button>
        {/* Pin and Mute buttons - show on hover - positioned lower to not cover timestamp */}
        <div className="absolute right-2 bottom-2 flex gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity bg-background-panel rounded px-1 shadow-sm">
            {onTogglePin && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onTogglePin(message.id);
                    }}
                    className={`p-1 rounded hover:bg-background-main ${message.isPinned ? 'text-accent' : 'text-text-secondary'}`}
                    title={message.isPinned ? 'Unpin' : 'Pin'}
                >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 3l1.5 5h5.5l-4.5 3.5 1.5 5.5-4-3-4 3 1.5-5.5-4.5-3.5h5.5z"/>
                    </svg>
                </button>
            )}
            {onToggleMute && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggleMute(message.id);
                    }}
                    className={`p-1 rounded hover:bg-background-main ${message.isMuted ? 'text-accent' : 'text-text-secondary'}`}
                    title={message.isMuted ? 'Unmute' : 'Mute'}
                >
                    {message.isMuted ? (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z"/>
                        </svg>
                    ) : (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z"/>
                        </svg>
                    )}
                </button>
            )}
        </div>
    </div>
  );
};

export default MessageListItem;