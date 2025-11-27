import React, { useRef, useEffect, useState } from 'react';
import { DirectConversation, User, Role, Message } from '../types';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import MessagesSummaryView from './MessagesSummaryView';
import { PhoneIcon, VideoCameraIcon, SparklesIcon } from './icons';

interface ConversationViewProps {
    conversation: DirectConversation;
    onSendMessage: (message: string, file?: File) => void;
    isLoading: boolean;
    onGenerateSummary: (messages?: Message[]) => void;
    user: User | null;
    typingUserName: string | null;
    onTypingStart: () => void;
    onTypingStop: () => void;
    onMarkAsRead: () => void;
    onReact: (messageId: number, emoji: string) => void;
    onStartCall: (type: 'audio' | 'video') => void;
    onUpdateGroupName?: (conversationId: string, newName: string) => void;
    onAddGroupMembers?: (conversationId: string, members: User[]) => void;
    availableUsers?: User[];
}

const TooltipButton: React.FC<{ icon: React.ReactNode; label: string; tooltip: string; onClick?: () => void; disabled?: boolean; }> = ({ icon, label, tooltip, onClick, disabled }) => (
    <div className="relative group">
        <button
            onClick={onClick}
            disabled={disabled}
            className="flex items-center gap-2 text-sm font-semibold bg-background-panel px-3 py-1.5 rounded-md text-text-primary hover:bg-background-main border border-transparent hover:border-border-color transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={label}
        >
            {icon}
        </button>
        <div className="absolute bottom-full mb-2 px-2 py-1 bg-background-panel border border-border-color text-text-primary text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
            {tooltip}
        </div>
    </div>
);


const ConversationView: React.FC<ConversationViewProps> = ({ conversation, onSendMessage, isLoading, onGenerateSummary, user, typingUserName, onTypingStart, onTypingStop, onMarkAsRead, onReact, onStartCall, onUpdateGroupName, onAddGroupMembers, availableUsers = [] }) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [selectedMessageIds, setSelectedMessageIds] = useState<number[]>([]);
    const [pinnedMessageIds, setPinnedMessageIds] = useState<number[]>([]);
    const [showSummaryView, setShowSummaryView] = useState(false);
    const [currentSummary, setCurrentSummary] = useState<string>('');
    const [showCopiedToast, setShowCopiedToast] = useState(false);
    const [isEditingGroupName, setIsEditingGroupName] = useState(false);
    const [editedGroupName, setEditedGroupName] = useState(conversation.name);
    const [showMembersModal, setShowMembersModal] = useState(false);
    const [showAddMembersModal, setShowAddMembersModal] = useState(false);
    const [memberSearch, setMemberSearch] = useState('');
    const [selectedNewMembers, setSelectedNewMembers] = useState<User[]>([]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [conversation.messages, typingUserName]);

    useEffect(() => {
        onMarkAsRead();
        setSelectedMessageIds([]); // Clear selection when conversation changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [conversation.id]);

    useEffect(() => {
        // Clear selection if new messages arrive
        setSelectedMessageIds([]);
    }, [conversation.messages]);

    const handleSelectMessage = (messageId: number) => {
        setSelectedMessageIds(prev =>
            prev.includes(messageId)
                ? prev.filter(id => id !== messageId)
                : [...prev, messageId]
        );
    };

    const handleCancelSelection = () => {
        setSelectedMessageIds([]);
    };

    const handlePinMessage = (messageId: number) => {
        setPinnedMessageIds(prev => {
            if (prev.includes(messageId)) {
                // Unpin message
                return prev.filter(id => id !== messageId);
            } else {
                // Pin message (max 3)
                if (prev.length >= 3) {
                    // Remove oldest pinned message and add new one
                    return [...prev.slice(1), messageId];
                }
                return [...prev, messageId];
            }
        });
    };

    const handleCopyMessage = () => {
        setShowCopiedToast(true);
        setTimeout(() => setShowCopiedToast(false), 2000);
    };

    const handleSaveGroupName = () => {
        if (editedGroupName.trim() && onUpdateGroupName) {
            onUpdateGroupName(conversation.id, editedGroupName.trim());
            setIsEditingGroupName(false);
        }
    };

    const handleAddMembers = () => {
        if (selectedNewMembers.length > 0 && onAddGroupMembers) {
            onAddGroupMembers(conversation.id, selectedNewMembers);
            setSelectedNewMembers([]);
            setMemberSearch('');
            setShowAddMembersModal(false);
        }
    };

    const handleSummarizeSelection = () => {
        const selectedMessages = conversation.messages.filter(msg => msg.id && selectedMessageIds.includes(msg.id));
        onGenerateSummary(selectedMessages);
        setSelectedMessageIds([]);
    };

    const handleGenerateSummaryWithExport = async (selectedMessages?: Message[]) => {
        await onGenerateSummary(selectedMessages);
        // Extract summary from the last summary message
        const summaryMsg = conversation.messages.find(msg => msg.type === 'summary');
        if (summaryMsg) {
            setCurrentSummary(summaryMsg.content || '');
        }
    };

    // Update current summary when messages change
    useEffect(() => {
        const latestSummary = [...conversation.messages].reverse().find(msg => msg.type === 'summary');
        if (latestSummary) {
            setCurrentSummary(latestSummary.content || '');
        }
    }, [conversation.messages]);


    return (
        <div className="flex-1 flex flex-col bg-background-main">
            <header className="flex-shrink-0 flex items-center justify-between h-[61px] px-6 border-b border-border-color shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <img src={conversation.avatar} alt={conversation.name} className="w-9 h-9 rounded-full object-cover" />
                        {conversation.online && (
                            <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-status-green ring-2 ring-background-main"></span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {isEditingGroupName && conversation.isGroup ? (
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={editedGroupName}
                                    onChange={(e) => setEditedGroupName(e.target.value)}
                                    onBlur={handleSaveGroupName}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleSaveGroupName();
                                        if (e.key === 'Escape') setIsEditingGroupName(false);
                                    }}
                                    className="text-lg font-semibold text-text-primary bg-background-panel border border-border-color rounded px-2 py-1 leading-tight focus:outline-none focus:ring-2 focus:ring-accent"
                                    autoFocus
                                />
                                <button
                                    onClick={handleSaveGroupName}
                                    className="text-accent hover:text-accent/80"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </button>
                            </div>
                        ) : (
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-lg font-semibold text-text-primary leading-tight">
                                        {conversation.name}
                                    </h2>
                                    {conversation.isGroup && onUpdateGroupName && (
                                        <button
                                            onClick={() => setIsEditingGroupName(true)}
                                            className="text-text-secondary hover:text-accent transition-colors"
                                            title="Edit group name"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                                {conversation.online && <p className="text-xs text-status-green">Online</p>}
                            </div>
                        )}
                        {conversation.isGroup && conversation.members && conversation.members.length > 0 && (
                            <button
                                onClick={() => setShowMembersModal(true)}
                                className="ml-2 flex items-center gap-1 px-2 py-1 rounded-md bg-background-panel hover:bg-accent-soft/30 border border-border-color transition-colors"
                                title="View members"
                            >
                                <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                                <span className="text-sm font-medium text-text-secondary">{conversation.members.length}</span>
                            </button>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                     <button
                        onClick={() => setShowSummaryView(true)}
                        disabled={conversation.messages.length === 0}
                        className="flex items-center gap-2 text-sm font-semibold bg-accent-soft text-accent px-3 py-1.5 rounded-md hover:bg-accent/30 border border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                       <SparklesIcon className="w-4 h-4"/>
                       <span>AI Summary</span>
                    </button>
                    <TooltipButton
                        icon={<PhoneIcon className="w-4 h-4" />}
                        label="Start Audio Call"
                        tooltip="Start an audio call"
                        onClick={() => onStartCall('audio')}
                    />
                     <TooltipButton
                        icon={<VideoCameraIcon className="w-4 h-4" />}
                        label="Start Video Call"
                        tooltip="Start a video call"
                        onClick={() => onStartCall('video')}
                    />
                </div>
            </header>
            
            {/* Pinned Messages Section */}
            {pinnedMessageIds.length > 0 && (
                <div className="bg-accent-soft/20 border-b border-border-color px-6 py-3">
                    <div className="text-xs font-semibold text-accent mb-2 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                        Pinned Messages ({pinnedMessageIds.length}/3)
                    </div>
                    <div className="space-y-2">
                        {pinnedMessageIds.map(pinnedId => {
                            const pinnedMsg = conversation.messages.find(m => m.id === pinnedId);
                            if (!pinnedMsg) return null;
                            return (
                                <div key={pinnedId} className="bg-background-panel rounded-lg p-3 text-sm flex items-start gap-2">
                                    <div className="flex-1 truncate">
                                        <span className="font-semibold text-text-primary">{pinnedMsg.sender?.name}: </span>
                                        <span className="text-text-secondary">{pinnedMsg.content}</span>
                                    </div>
                                    <button
                                        onClick={() => handlePinMessage(pinnedId)}
                                        className="text-text-secondary hover:text-red-500 shrink-0"
                                        title="Unpin"
                                    >
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
            
            {/* Copied Toast */}
            {showCopiedToast && (
                <div className="fixed top-20 right-4 z-50 bg-background-panel border border-border-color rounded-lg shadow-lg px-4 py-2 animate-fade-in">
                    <div className="flex items-center gap-2 text-sm text-text-primary">
                        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Copied!
                    </div>
                </div>
            )}
            
            <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
                <div className="space-y-1">
                    {conversation.messages.map((msg, index) => {
                        // Don't augment messages - backend provides complete sender info
                        const augmentedMessage: Message = { ...msg };

                        // Only add sender for legacy messages without sender info
                        if (!msg.sender) {
                            if (msg.role === Role.USER && user) {
                                augmentedMessage.sender = user;
                            } else if (msg.role === Role.MODEL) {
                                augmentedMessage.sender = {
                                    id: -parseInt(conversation.id.replace(/\D/g, '') || '0'),
                                    name: conversation.name,
                                    avatar: conversation.avatar,
                                };
                            }
                        }

                        return (
                            <ChatMessage
                                key={msg.id || index}
                                message={augmentedMessage}
                                currentUserId={user?.id || null}
                                onReact={onReact}
                                isSelected={msg.id ? selectedMessageIds.includes(msg.id) : false}
                                onSelectMessage={handleSelectMessage}
                                onPinMessage={handlePinMessage}
                                onCopy={handleCopyMessage}
                                showCheckbox={selectedMessageIds.length > 0}
                                isPinned={msg.id ? pinnedMessageIds.includes(msg.id) : false}
                             />
                        );
                    })}
                     {typingUserName && (
                        <div className="text-sm text-text-secondary animate-pulse">{typingUserName} is typing...</div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>
            {selectedMessageIds.length > 0 ? (
                <div className="p-4 bg-background-panel border-t border-border-color flex justify-between items-center animate-fade-in shadow-md">
                    <span className="font-semibold text-text-primary">{selectedMessageIds.length} message{selectedMessageIds.length > 1 ? 's' : ''} selected</span>
                    <div className="flex gap-2">
                        <button onClick={handleCancelSelection} className="px-4 py-2 bg-background-main border border-border-color text-text-primary font-semibold rounded-lg hover:bg-input-field transition-colors">
                            Cancel
                        </button>
                        <button onClick={handleSummarizeSelection} disabled={isLoading} className="px-4 py-2 bg-accent text-white font-semibold rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50">
                            {isLoading ? 'Summarizing...' : 'Summarize Selection'}
                        </button>
                    </div>
                </div>
            ) : (
                 <div className="p-6 pt-0">
                    <ChatInput
                        onSendMessage={onSendMessage}
                        isLoading={isLoading}
                        onTypingStart={onTypingStart}
                        onTypingStop={onTypingStop}
                    />
                </div>
            )}

            {/* Members Modal */}
            {showMembersModal && conversation.isGroup && conversation.members && conversation.members.length > 0 && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-background-main rounded-2xl shadow-2xl max-w-md w-full border border-border-color">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-text-primary">Group Members ({conversation.members.length})</h2>
                                <button
                                    onClick={() => setShowMembersModal(false)}
                                    className="text-text-secondary hover:text-text-primary transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="space-y-3 max-h-96 overflow-y-auto mb-4">
                                {conversation.members.map((member) => (
                                    <div key={member.id} className="flex items-center gap-3 p-3 rounded-lg bg-background-panel hover:bg-accent-soft/30 transition-colors">
                                        <img src={member.avatar} alt={member.name} className="w-10 h-10 rounded-full object-cover" />
                                        <div className="flex-1">
                                            <p className="font-medium text-text-primary">{member.name}</p>
                                            {member.email && <p className="text-xs text-text-secondary">{member.email}</p>}
                                        </div>
                                        {member.id === user?.id && (
                                            <span className="text-xs bg-accent-soft text-accent px-2 py-1 rounded">You</span>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {onAddGroupMembers && (
                                <button
                                    onClick={() => {
                                        setShowMembersModal(false);
                                        setShowAddMembersModal(true);
                                    }}
                                    className="w-full flex items-center justify-center gap-2 bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent/90 transition-colors font-medium"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Add Members
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Add Members Modal */}
            {showAddMembersModal && conversation.isGroup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-background-main rounded-2xl shadow-2xl max-w-md w-full border border-border-color">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-text-primary">Add Members</h2>
                                <button
                                    onClick={() => {
                                        setShowAddMembersModal(false);
                                        setSelectedNewMembers([]);
                                        setMemberSearch('');
                                    }}
                                    className="text-text-secondary hover:text-text-primary transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-text-primary mb-2">
                                    Search Users ({selectedNewMembers.length} selected)
                                </label>
                                <input
                                    type="text"
                                    value={memberSearch}
                                    onChange={(e) => setMemberSearch(e.target.value)}
                                    placeholder="Search by name or email..."
                                    className="w-full bg-background-panel text-text-primary border border-border-color rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent"
                                />
                            </div>

                            <div className="space-y-2 max-h-80 overflow-y-auto mb-4">
                                {availableUsers
                                    .filter(availUser => {
                                        // Filter out users already in the group
                                        const isAlreadyMember = conversation.members?.some(m => m.id === availUser.id);
                                        if (isAlreadyMember) return false;
                                        
                                        // Filter by search
                                        if (!memberSearch) return true;
                                        return (
                                            availUser.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
                                            (availUser.email && availUser.email.toLowerCase().includes(memberSearch.toLowerCase()))
                                        );
                                    })
                                    .map((availUser) => {
                                        const isSelected = selectedNewMembers.find(u => u.id === availUser.id);
                                        return (
                                            <div
                                                key={availUser.id}
                                                onClick={() => {
                                                    if (isSelected) {
                                                        setSelectedNewMembers(prev => prev.filter(u => u.id !== availUser.id));
                                                    } else {
                                                        setSelectedNewMembers(prev => [...prev, availUser]);
                                                    }
                                                }}
                                                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                                                    isSelected ? 'bg-accent-soft border-2 border-accent' : 'bg-background-panel hover:bg-accent-soft/30'
                                                }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={!!isSelected}
                                                    onChange={() => {}}
                                                    className="w-5 h-5 rounded border-2 border-border-color text-accent focus:ring-2 focus:ring-accent cursor-pointer"
                                                />
                                                <img src={availUser.avatar} alt={availUser.name} className="w-10 h-10 rounded-full object-cover" />
                                                <div className="flex-1">
                                                    <p className="font-medium text-text-primary">{availUser.name}</p>
                                                    {availUser.email && <p className="text-xs text-text-secondary">{availUser.email}</p>}
                                                </div>
                                            </div>
                                        );
                                    })}
                                {availableUsers.filter(u => !conversation.members?.some(m => m.id === u.id)).length === 0 && (
                                    <p className="text-center text-text-secondary py-4">All users are already members</p>
                                )}
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        setShowAddMembersModal(false);
                                        setSelectedNewMembers([]);
                                        setMemberSearch('');
                                    }}
                                    className="flex-1 bg-background-panel text-text-primary border border-border-color px-4 py-2 rounded-lg hover:bg-accent-soft/30 transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddMembers}
                                    disabled={selectedNewMembers.length === 0}
                                    className="flex-1 bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Add {selectedNewMembers.length > 0 && `(${selectedNewMembers.length})`}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Summary Modal */}
            {showSummaryView && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto relative">
                        {/* Close Button */}
                        <button
                            onClick={() => setShowSummaryView(false)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors z-10"
                            aria-label="Close summary view"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        {/* Summary View Component */}
                        <MessagesSummaryView
                            messages={conversation.messages}
                            onGenerateSummary={handleGenerateSummaryWithExport}
                            currentSummary={currentSummary}
                            isGenerating={isLoading}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ConversationView;