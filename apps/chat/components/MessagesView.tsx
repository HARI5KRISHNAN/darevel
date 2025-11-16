import React, { useState, useRef, useEffect } from 'react';
import MessageListItem from './MessageListItem';
import { DirectConversation, Role, Message, User } from '../types';
import ConversationView from './ConversationView';
import { DoubleArrowLeftIcon, DoubleArrowRightIcon, SearchIcon } from './icons';
import { generateSummary as apiGenerateSummary, sendMessage as apiSendMessage, getMessages as apiGetMessages } from '../services/api';
import { io, Socket } from 'socket.io-client';


export const dummyConversations: DirectConversation[] = [];

interface MessagesViewProps {
    user: User | null;
    searchQuery: string;
    onStartCall: (channelId: string, callType: 'audio' | 'video') => void;
}

const MessagesView: React.FC<MessagesViewProps> = ({ user, searchQuery, onStartCall }) => {
    const [conversations, setConversations] = useState<DirectConversation[]>(dummyConversations);
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
    const [availableUsers, setAvailableUsers] = useState<User[]>([]);
    const [showUserList, setShowUserList] = useState(false);
    const [socket, setSocket] = useState<Socket | null>(null);

    // Fetch all registered users on mount
    useEffect(() => {
        fetchRegisteredUsers();
    }, []);

    // Setup Socket.IO connection for real-time messaging
    useEffect(() => {
        const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';
        const socketInstance: Socket = io(SOCKET_URL);

        socketInstance.on('connect', () => {
            console.log('✓ Connected to chat backend');
        });

        socketInstance.on('new_message', (message: Message) => {
            console.log('📩 Received new message:', message);
            // Add message to the appropriate conversation
            setConversations(prev => prev.map(convo => {
                if (convo.id === message.channelId) {
                    // Avoid duplicates
                    const exists = convo.messages.some(m => m.id === message.id);
                    if (exists) return convo;

                    return {
                        ...convo,
                        messages: [...convo.messages, message],
                        lastMessage: message.content || 'New message',
                        timestamp: 'just now'
                    };
                }
                return convo;
            }));
        });

        socketInstance.on('disconnect', () => {
            console.log('✗ Disconnected from chat backend');
        });

        setSocket(socketInstance);

        return () => {
            socketInstance.disconnect();
        };
    }, []);

    // Join/leave channels when conversation changes
    useEffect(() => {
        if (!socket) return;

        // Leave previous channel
        const previousChannel = conversations.find(c => c.id !== selectedConversationId);
        if (previousChannel) {
            socket.emit('leave_channel', previousChannel.id);
        }

        // Join new channel
        if (selectedConversationId) {
            socket.emit('join_channel', selectedConversationId);
            console.log(`Joined channel: ${selectedConversationId}`);
        }
    }, [selectedConversationId, socket]);

    const fetchRegisteredUsers = async () => {
        try {
            const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';
            const response = await fetch(`${BACKEND_URL}/api/auth/users`);
            const data = await response.json();
            // Filter out current user
            const otherUsers = data.users.filter((u: User) => u.id !== user?.id);
            setAvailableUsers(otherUsers);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const selectedConversation = conversations.find(c => c.id === selectedConversationId);

    const filteredConversations = conversations.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Filter users based on search query
    const filteredUsers = availableUsers.filter(u =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Show user list when searching or when no conversations exist
    const shouldShowUserList = searchQuery.length > 0 || conversations.length === 0;

    // Start a new conversation with a user
    const startConversationWithUser = (selectedUser: User) => {
        // Check if conversation already exists
        const existingConvo = conversations.find(c => c.id === `user-${selectedUser.id}`);

        if (existingConvo) {
            setSelectedConversationId(existingConvo.id);
            setShowUserList(false);
            return;
        }

        // Create new conversation
        const newConversation: DirectConversation = {
            id: `user-${selectedUser.id}`,
            name: selectedUser.name,
            avatar: selectedUser.avatar,
            lastMessage: 'Start a conversation...',
            timestamp: 'now',
            online: false,
            messages: []
        };

        setConversations(prev => [newConversation, ...prev]);
        setSelectedConversationId(newConversation.id);
        setShowUserList(false);
    };

    const handleSendMessage = async (message: string, file?: File) => {
        if (!selectedConversationId || !user) return;

        setIsLoading(true);

        try {
            // Send message to backend API
            const sentMessage = await apiSendMessage(selectedConversationId, message, user.id);

            // Add the sent message to local state
            setConversations(prevConvos => {
                return prevConvos.map(convo => {
                    if (convo.id === selectedConversationId) {
                        // Check if message already exists (from Socket.IO)
                        const exists = convo.messages.some(m => m.id === sentMessage.id);
                        if (exists) return convo;

                        return {
                            ...convo,
                            messages: [...convo.messages, sentMessage],
                            lastMessage: message || 'New message',
                            timestamp: 'just now',
                        };
                    }
                    return convo;
                });
            });
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Failed to send message. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // FIX: Implement reaction handling within MessagesView as it owns the conversation state.
    // This resolves the missing prop error in App.tsx.
    const handleReact = (messageId: number, emoji: string) => {
        if (!user) return;

        setConversations(prevConvos => {
            return prevConvos.map(convo => {
                const messageIndex = convo.messages.findIndex(m => m.id === messageId);
                if (messageIndex === -1) return convo;

                const updatedMessages = [...convo.messages];
                const message = { ...updatedMessages[messageIndex] };
                const reactions = { ...(message.reactions || {}) };
                
                const userIds = (reactions[emoji] || []) as number[];
                const currentUserReacted = userIds.includes(user.id);

                if (currentUserReacted) {
                    reactions[emoji] = userIds.filter(id => id !== user.id);
                    if (reactions[emoji].length === 0) {
                        delete reactions[emoji];
                    }
                } else {
                    reactions[emoji] = [...userIds, user.id];
                }

                message.reactions = reactions;
                updatedMessages[messageIndex] = message;

                return { ...convo, messages: updatedMessages };
            });
        });
    };


    const handleMarkAllAsRead = () => {
        setConversations(prev =>
            prev.map(c => ({ ...c, unreadCount: 0 }))
        );
    };

    const hasUnreadMessages = conversations.some(c => c.unreadCount && c.unreadCount > 0);

    const handleGenerateSummary = async (messagesToSummarize?: Message[]) => {
        if (!selectedConversationId || !user) return;

        const conversationToSummarize = conversations.find(c => c.id === selectedConversationId);
        if (!conversationToSummarize) return;

        const messagesForTranscript = messagesToSummarize || conversationToSummarize.messages;
        
        if (messagesForTranscript.length === 0) {
            alert("There are no messages to summarize.");
            return;
        }

        const transcript = messagesForTranscript
            .filter(msg => msg.type !== 'summary' && msg.content)
            .map(msg => {
                const senderName = msg.sender?.id === user.id ? (user.name || 'You') : conversationToSummarize.name;
                return `${senderName}: "${msg.content}"`;
            })
            .join('\n');
        
        if (!transcript.trim()) {
            alert("There are no text messages to summarize.");
            return;
        }
        
        setIsGeneratingSummary(true);
        
        const loadingMessage: Message = {
            id: Date.now(),
            role: Role.MODEL,
            content: "Generating summary with Gemini AI...",
            type: 'summary'
        };

        setConversations(prev => prev.map(c => 
            c.id === selectedConversationId 
            ? { ...c, messages: [...c.messages, loadingMessage] } 
            : c
        ));

        try {
            const data = await apiGenerateSummary(transcript);
            const summaryMessage: Message = {
                id: Date.now() + 1,
                role: Role.MODEL,
                content: data.summary,
                type: 'summary'
            };

            setConversations(prev => prev.map(c => {
                if (c.id === selectedConversationId) {
                    const newMessages = c.messages.slice(0, -1); // Remove loading message
                    return { 
                        ...c, 
                        messages: [...newMessages, summaryMessage],
                        lastMessage: 'Meeting Summary',
                        timestamp: 'now',
                    };
                }
                return c;
            }));

        } catch (error) {
            console.error("Error generating summary:", error);
            const errorMessage: Message = {
                id: Date.now() + 1,
                role: Role.MODEL,
                content: error instanceof Error ? error.message : "An unknown error occurred while generating the summary.",
                type: 'text' // Render as a normal error text
            };
             setConversations(prev => prev.map(c => {
                if (c.id === selectedConversationId) {
                    const newMessages = c.messages.slice(0, -1); // Remove loading message
                    return { ...c, messages: [...newMessages, errorMessage] };
                }
                return c;
            }));
        } finally {
            setIsGeneratingSummary(false);
        }
    };

    return (
        <div className="flex-1 flex min-w-0 h-full">
            <aside className={`bg-background-panel flex flex-col border-r border-border-color transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-96'}`}>
                <header className="p-4 border-b border-border-color shadow-sm h-[61px] flex items-center justify-between shrink-0">
                    {!isCollapsed && (
                        <div className="overflow-hidden flex-1">
                            <h1 className="text-xl font-bold text-text-primary truncate">Direct Messages</h1>
                            <p className="text-xs text-text-secondary truncate">All your conversations</p>
                        </div>
                    )}
                    {!isCollapsed && hasUnreadMessages && (
                        <button 
                            onClick={handleMarkAllAsRead}
                            className="text-xs font-semibold text-accent hover:underline ml-2 shrink-0"
                            title="Mark all as read"
                        >
                            Mark all as read
                        </button>
                    )}
                     <button 
                        onClick={() => setIsCollapsed(!isCollapsed)} 
                        className="text-text-secondary hover:text-text-primary p-1 ml-2 shrink-0"
                        aria-label={isCollapsed ? 'Expand messages list' : 'Collapse messages list'}
                    >
                        {isCollapsed ? <DoubleArrowRightIcon className="w-5 h-5" /> : <DoubleArrowLeftIcon className="w-5 h-5" />}
                    </button>
                </header>
                
                <div className="flex-1 overflow-y-auto p-2">
                    {shouldShowUserList && filteredUsers.length > 0 && (
                        <div className="mb-4">
                            {!isCollapsed && (
                                <div className="px-2 py-1 text-xs font-semibold text-text-secondary uppercase tracking-wide">
                                    Available Users
                                </div>
                            )}
                            <div className="space-y-1">
                                {filteredUsers.map(availUser => (
                                    <div
                                        key={availUser.id}
                                        onClick={() => startConversationWithUser(availUser)}
                                        className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-background-main transition-colors"
                                    >
                                        <img
                                            src={availUser.avatar}
                                            alt={availUser.name}
                                            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                                        />
                                        {!isCollapsed && (
                                            <div className="flex-1 overflow-hidden">
                                                <p className="font-semibold text-sm text-text-primary truncate">
                                                    {availUser.name}
                                                </p>
                                                <p className="text-xs text-text-secondary truncate">
                                                    {availUser.email}
                                                </p>
                                            </div>
                                        )}
                                        {!isCollapsed && (
                                            <div className="text-xs text-accent">
                                                Start Chat
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {filteredConversations.length > 0 && (
                        <div>
                            {!isCollapsed && shouldShowUserList && filteredUsers.length > 0 && (
                                <div className="px-2 py-1 text-xs font-semibold text-text-secondary uppercase tracking-wide">
                                    Your Conversations
                                </div>
                            )}
                            <div className="space-y-1">
                                {filteredConversations.map(dm => (
                                    <MessageListItem
                                        key={dm.id}
                                        message={dm}
                                        isActive={dm.id === selectedConversationId}
                                        isCollapsed={isCollapsed}
                                        onClick={() => setSelectedConversationId(dm.id)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {!shouldShowUserList && filteredConversations.length === 0 && (
                        <div className="text-center text-sm text-text-secondary p-4">
                            No conversations found.
                        </div>
                    )}

                    {shouldShowUserList && filteredUsers.length === 0 && filteredConversations.length === 0 && (
                        <div className="text-center text-sm text-text-secondary p-4">
                            {searchQuery ? 'No users or conversations found.' : 'No other users registered yet.'}
                        </div>
                    )}
                </div>
            </aside>
            <main className="flex-1 flex flex-col bg-background-main min-w-0">
                {selectedConversation ? (
                    <ConversationView 
                        conversation={selectedConversation} 
                        onSendMessage={handleSendMessage} 
                        isLoading={isLoading || isGeneratingSummary}
                        onGenerateSummary={handleGenerateSummary}
                        user={user}
                        typingUserName={null}
                        onTypingStart={() => {}}
                        onTypingStop={() => {}}
                        onMarkAsRead={() => {
                            if (selectedConversationId) {
                                setConversations(prev =>
                                    prev.map(c =>
                                        c.id === selectedConversationId
                                            ? { ...c, unreadCount: 0 }
                                            : c
                                    )
                                );
                            }
                        }}
                        onReact={handleReact}
                        onStartCall={(type) => onStartCall(selectedConversation.id, type)}
                    />
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <p className="text-text-secondary">Select a conversation to start messaging.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default MessagesView;