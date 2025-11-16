import React, { useState, useRef, useEffect } from 'react';
import MessageListItem from './MessageListItem';
import { DirectConversation, Role, Message, User } from '../types';
import ConversationView from './ConversationView';
import { DoubleArrowLeftIcon, DoubleArrowRightIcon, SearchIcon } from './icons';
import { generateSummary as apiGenerateSummary } from '../services/api';


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

    const selectedConversation = conversations.find(c => c.id === selectedConversationId);

    const filteredConversations = conversations.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSendMessage = (message: string, file?: File) => {
        if (!selectedConversationId || !user) return;

        const newMessage: Message = {
            id: Date.now(),
            role: Role.USER,
            content: message,
            sender: user,
            timestamp: new Date().toISOString(),
            isRead: true, // User's own message is always "read"
        };

        if (file) {
            newMessage.file = {
                url: URL.createObjectURL(file),
                name: file.name,
                type: file.type,
            };
        }

        setConversations(prevConvos => {
            return prevConvos.map(convo => {
                if (convo.id === selectedConversationId) {
                    return {
                        ...convo,
                        messages: [...convo.messages, newMessage],
                        lastMessage: message || file?.name || 'Attachment',
                        timestamp: 'just now',
                    };
                }
                return convo;
            });
        });
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
                    {filteredConversations.length > 0 ? (
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
                    ) : (
                        <div className="text-center text-sm text-text-secondary p-4">
                            No conversations found.
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