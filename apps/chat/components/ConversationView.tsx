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


const ConversationView: React.FC<ConversationViewProps> = ({ conversation, onSendMessage, isLoading, onGenerateSummary, user, typingUserName, onTypingStart, onTypingStop, onMarkAsRead, onReact, onStartCall }) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [selectedMessageIds, setSelectedMessageIds] = useState<number[]>([]);
    const [showSummaryView, setShowSummaryView] = useState(false);
    const [currentSummary, setCurrentSummary] = useState<string>('');

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
                    <div>
                        <h2 className="text-lg font-semibold text-text-primary leading-tight">
                            {conversation.name}
                        </h2>
                        {conversation.online && <p className="text-xs text-status-green">Online</p>}
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