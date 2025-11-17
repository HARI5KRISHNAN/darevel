import React, { useState, useRef, useEffect, useCallback } from 'react';
import MessageListItem from './MessageListItem';
import { DirectConversation, Role, Message, User } from '../types';
import ConversationView from './ConversationView';
import { DoubleArrowLeftIcon, DoubleArrowRightIcon } from './icons';
import { generateSummary as apiGenerateSummary, sendMessage as apiSendMessage, getMessages as apiGetMessages, getUserChannels } from '../services/api';
import { useWebSocket } from '../hooks/useWebSocket';
import { useWebRTCCall } from '../hooks/useWebRTCCall';
import CallWindow from './CallWindow';
import IncomingCall from './IncomingCall';


// Default conversations (channels)
export const dummyConversations: DirectConversation[] = [
    {
        id: 'general',
        name: 'General Channel',
        avatar: 'https://ui-avatars.com/api/?name=General&background=4f46e5&color=fff',
        lastMessage: 'Welcome to the general channel',
        timestamp: 'now',
        online: true,
        messages: []
    }
];

interface MessagesViewProps {
    user: User | null;
    searchQuery: string;
}

const MessagesView: React.FC<MessagesViewProps> = ({ user, searchQuery }) => {
    const [conversations, setConversations] = useState<DirectConversation[]>(dummyConversations);
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
    const [availableUsers, setAvailableUsers] = useState<User[]>([]);
    const [showGroupModal, setShowGroupModal] = useState(false);
    const [groupName, setGroupName] = useState('');
    const [selectedGroupMembers, setSelectedGroupMembers] = useState<User[]>([]);
    const [groupMemberSearch, setGroupMemberSearch] = useState('');

    // WebRTC call state
    const [incomingCall, setIncomingCall] = useState<{ type: 'audio' | 'video'; caller: User; receiver: User; channelId: string; offer?: RTCSessionDescriptionInit } | null>(null);
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);

    // Helper function to create consistent channel ID for direct messages
    const createDirectMessageChannelId = (userId1: number, userId2: number): string => {
        // Sort user IDs to ensure consistent channel ID regardless of who initiates
        const [smallerId, largerId] = [userId1, userId2].sort((a, b) => a - b);
        return `dm-${smallerId}-${largerId}`;
    };

    // Placeholder for sendSignalMessage - will be set by useWebSocket
    const sendSignalRef = useRef<((message: any) => void) | null>(null);

    // WebRTC call hook
    const {
        callState,
        currentCall,
        localStream,
        remoteStream,
        isMuted,
        isVideoOff,
        startCall,
        answerCall,
        endCall,
        toggleMute,
        toggleVideo,
        handleSignalingMessage,
    } = useWebRTCCall({
        user: user,
        onIncomingCall: (callData) => {
            setIncomingCall(callData);
        },
        sendSignal: (message) => sendSignalRef.current?.(message),
    });

    // Attach streams to video elements when they change
    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream]);

    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);

    // Helper to save conversation settings to localStorage
    const saveConversationSettings = (convos: DirectConversation[]) => {
        const settings = convos.map(c => ({
            id: c.id,
            isPinned: c.isPinned,
            isMuted: c.isMuted
        }));
        localStorage.setItem('conversationSettings', JSON.stringify(settings));
    };

    // Helper to load conversation settings from localStorage
    const loadConversationSettings = () => {
        const saved = localStorage.getItem('conversationSettings');
        return saved ? JSON.parse(saved) : [];
    };

    // WebSocket message handler
    const handleWebSocketMessage = useCallback((message: Message) => {
        console.log('📩 Received message via WebSocket:', message);

        setConversations(prev => {
            const existingConvo = prev.find(c => c.id === message.channelId);

            if (existingConvo) {
                // Update existing conversation
                return prev.map(convo => {
                    if (convo.id === message.channelId) {
                        // Check if message already exists
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
                });
            } else {
                // Auto-create conversation if message arrives for non-existent channel
                if (message.sender && message.channelId) {
                    // Handle direct messages
                    if (message.channelId.startsWith('dm-')) {
                        const newConvo: DirectConversation = {
                            id: message.channelId,
                            name: message.sender.name,
                            avatar: message.sender.avatar,
                            lastMessage: message.content || 'New message',
                            timestamp: 'just now',
                            online: false,
                            messages: [message]
                        };
                        return [newConvo, ...prev];
                    }
                    // Handle group messages
                    else if (message.channelId.startsWith('group-')) {
                        // Try to parse group info from message content
                        let groupName = 'Group Chat';
                        const groupCreationMatch = message.content.match(/Group "([^"]+)" created/);
                        if (groupCreationMatch) {
                            groupName = groupCreationMatch[1];
                        }

                        const newGroup: DirectConversation = {
                            id: message.channelId,
                            name: groupName,
                            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(groupName)}&background=random`,
                            lastMessage: message.content || 'New message',
                            timestamp: 'just now',
                            online: false,
                            messages: [message],
                            isGroup: true,
                            members: [] // Members will be populated from context
                        };
                        console.log(`✨ Auto-created group conversation: ${groupName}`);
                        return [newGroup, ...prev];
                    }
                }
                return prev;
            }
        });
    }, []);

    // Handle incoming call signals
    const handleCallSignal = useCallback((signal: any) => {
        console.log('📞 Received call signal in MessagesView:', signal);
        console.log('📞 Current user:', user?.id, user?.name);
        console.log('📞 Available users:', availableUsers.length, availableUsers.map(u => `${u.name}(${u.id})`));

        if (signal.type === 'call-offer') {
            console.log('📞 This is a call-offer signal');
            console.log('📞 Looking for caller with ID:', signal.from);

            // Find the caller user
            const caller = availableUsers.find(u => u.id === signal.from);
            console.log('📞 Found caller:', caller?.name, caller?.id);

            const receiver = user!;
            console.log('📞 Receiver (current user):', receiver?.name, receiver?.id);

            if (caller && signal.offer) {
                console.log('✅ Creating incoming call notification');
                setIncomingCall({
                    type: signal.callType,
                    caller,
                    receiver,
                    channelId: signal.channelId,
                    offer: signal.offer,
                });
            } else {
                console.error('❌ Cannot create incoming call:');
                console.error('   - Caller found:', !!caller);
                console.error('   - Offer present:', !!signal.offer);
                console.error('   - Signal:', signal);
            }
        }

        // Forward all signals to WebRTC hook
        handleSignalingMessage(signal);
    }, [availableUsers, user, handleSignalingMessage]);

    // Connect to WebSocket for real-time messages and call signaling
    const { sendSignalMessage } = useWebSocket({
        channelId: selectedConversationId,
        onMessageReceived: handleWebSocketMessage,
        user: user,
        onCallSignal: handleCallSignal,
    });

    // Update sendSignalRef when sendSignalMessage is available
    useEffect(() => {
        sendSignalRef.current = sendSignalMessage;
    }, [sendSignalMessage]);

    // Fetch all registered users on mount
    useEffect(() => {
        fetchRegisteredUsers();
    }, []);

    // Load user's conversations on mount
    useEffect(() => {
        if (!user) return;

        const loadUserConversations = async () => {
            try {
                const channelIds = await getUserChannels(user.id);
                console.log(`Loading ${channelIds.length} conversations for user ${user.id}`);

                // Fetch all users to map channel IDs to user info
                const AUTH_API_URL = import.meta.env.VITE_AUTH_SERVICE_URL || 'http://localhost:8081';
                const response = await fetch(`${AUTH_API_URL}/api/auth/users`);
                const data = await response.json();
                const allUsers = (data.data || data) as User[];

                const loadedConversations: DirectConversation[] = [];

                // Add general channel
                loadedConversations.push({
                    id: 'general',
                    name: 'General Channel',
                    avatar: 'https://ui-avatars.com/api/?name=General&background=4f46e5&color=fff',
                    lastMessage: 'Welcome to the general channel',
                    timestamp: 'now',
                    online: true,
                    messages: []
                });

                // Process each channel
                for (const channelId of channelIds) {
                    if (channelId === 'general') continue; // Already added

                    // Parse direct message channel ID: dm-{userId1}-{userId2}
                    if (channelId.startsWith('dm-')) {
                        const parts = channelId.split('-');
                        if (parts.length === 3) {
                            const userId1 = parseInt(parts[1]);
                            const userId2 = parseInt(parts[2]);
                            // Get the other user's ID (not current user)
                            const otherUserId = userId1 === user.id ? userId2 : userId1;
                            const otherUser = allUsers.find(u => u.id === otherUserId);

                            if (otherUser) {
                                loadedConversations.push({
                                    id: channelId,
                                    name: otherUser.name,
                                    avatar: otherUser.avatar,
                                    lastMessage: 'Continue conversation...',
                                    timestamp: 'earlier',
                                    online: false,
                                    messages: []
                                });
                            }
                        }
                    }
                }

                // Apply saved pin/mute settings from localStorage
                const savedSettings = loadConversationSettings();
                const conversationsWithSettings = loadedConversations.map(convo => {
                    const saved = savedSettings.find((s: any) => s.id === convo.id);
                    return saved ? { ...convo, isPinned: saved.isPinned, isMuted: saved.isMuted } : convo;
                });

                setConversations(conversationsWithSettings);
                console.log(`✓ Loaded ${conversationsWithSettings.length} conversations`);
            } catch (error) {
                console.error('Error loading user conversations:', error);
            }
        };

        loadUserConversations();
    }, [user]);

    // Fetch messages when conversation is selected (initial load only)
    useEffect(() => {
        if (!selectedConversationId) return;

        const fetchMessages = async () => {
            try {
                const messages = await apiGetMessages(selectedConversationId);

                // Update the conversation with fetched messages
                setConversations(prev => prev.map(convo => {
                    if (convo.id === selectedConversationId) {
                        return {
                            ...convo,
                            messages: messages
                        };
                    }
                    return convo;
                }));

                console.log(`✓ Loaded ${messages.length} messages for ${selectedConversationId}`);
            } catch (error) {
                console.error('Error fetching messages:', error);
            }
        };

        // Initial fetch only - new messages come via WebSocket
        fetchMessages();
    }, [selectedConversationId]);

    const fetchRegisteredUsers = async () => {
        try {
            console.log('👥 Fetching registered users...');
            // Use Auth Service to fetch users (port 8081)
            const AUTH_API_URL = import.meta.env.VITE_AUTH_SERVICE_URL || 'http://localhost:8081';
            const response = await fetch(`${AUTH_API_URL}/api/auth/users`);
            const data = await response.json();
            console.log('👥 Received user data:', data);
            // Handle Java backend ApiResponse wrapper: data.data or data
            const users = data.data || data;
            console.log('👥 Parsed users:', users);
            // Filter out current user
            const otherUsers = Array.isArray(users) ? users.filter((u: User) => u.id !== user?.id) : [];
            console.log('👥 Available users (excluding current):', otherUsers.map(u => `${u.name}(${u.id})`));
            setAvailableUsers(otherUsers);
        } catch (error) {
            console.error('❌ Error fetching users:', error);
            setAvailableUsers([]);
        }
    };

    const selectedConversation = conversations.find(c => c.id === selectedConversationId);

    // Filter and sort conversations - pinned ones at top
    const filteredConversations = conversations
        .filter(c =>
            c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => {
            // Pinned conversations first
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            return 0;
        });

    // Filter users based on search query
    const filteredUsers = availableUsers.filter(u =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    // Show user list when searching or when no conversations exist
    const shouldShowUserList = searchQuery.length > 0 || conversations.length === 0;

    // Start a new conversation with a user
    const startConversationWithUser = (selectedUser: User) => {
        if (!user) return;

        // Create consistent channel ID using both user IDs
        const channelId = createDirectMessageChannelId(user.id, selectedUser.id);

        // Check if conversation already exists
        const existingConvo = conversations.find(c => c.id === channelId);

        if (existingConvo) {
            setSelectedConversationId(existingConvo.id);
            return;
        }

        // Create new conversation
        const newConversation: DirectConversation = {
            id: channelId,
            name: selectedUser.name,
            avatar: selectedUser.avatar,
            lastMessage: 'Start a conversation...',
            timestamp: 'now',
            online: false,
            messages: []
        };

        setConversations(prev => [newConversation, ...prev]);
        setSelectedConversationId(newConversation.id);
    };

    // Toggle pin status
    const handleTogglePin = (conversationId: string) => {
        setConversations(prev => {
            const pinnedCount = prev.filter(c => c.isPinned).length;
            const conversation = prev.find(c => c.id === conversationId);

            // Check if trying to pin and already at max
            if (conversation && !conversation.isPinned && pinnedCount >= 7) {
                alert('Maximum 7 conversations can be pinned');
                return prev;
            }

            const updated = prev.map(c =>
                c.id === conversationId ? { ...c, isPinned: !c.isPinned } : c
            );
            saveConversationSettings(updated);
            return updated;
        });
    };

    // Toggle mute status
    const handleToggleMute = (conversationId: string) => {
        setConversations(prev => {
            const updated = prev.map(c =>
                c.id === conversationId ? { ...c, isMuted: !c.isMuted } : c
            );
            saveConversationSettings(updated);
            return updated;
        });
    };

    // Create group chat
    const handleCreateGroup = async () => {
        if (!user) return;
        if (!groupName.trim()) {
            alert('Please enter a group name');
            return;
        }
        if (selectedGroupMembers.length === 0) {
            alert('Please select at least one member');
            return;
        }

        // Create group channel ID
        const groupId = `group-${Date.now()}`;

        const newGroup: DirectConversation = {
            id: groupId,
            name: groupName,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(groupName)}&background=random`,
            lastMessage: 'Group created',
            timestamp: 'now',
            online: false,
            messages: [],
            isGroup: true,
            members: [user, ...selectedGroupMembers]
        };

        setConversations(prev => [newGroup, ...prev]);
        setSelectedConversationId(groupId);
        setShowGroupModal(false);
        setGroupName('');
        setSelectedGroupMembers([]);
        setGroupMemberSearch('');

        // Send initial message to notify all members via WebSocket
        try {
            const memberNames = selectedGroupMembers.map(m => m.name).join(', ');
            await apiSendMessage(
                groupId,
                `🎉 Group "${groupName}" created by ${user.name}. Members: ${memberNames}`,
                user.id
            );
        } catch (error) {
            console.error('Error sending group creation message:', error);
        }
    };

    const handleSendMessage = async (message: string, _file?: File) => {
        if (!selectedConversationId || !user) return;

        setIsLoading(true);

        try {
            // Send message to backend API
            const sentMessage = await apiSendMessage(selectedConversationId, message, user.id);

            // Optimistic update - add message immediately (will also come via WebSocket)
            setConversations(prevConvos => {
                return prevConvos.map(convo => {
                    if (convo.id === selectedConversationId) {
                        // Check if message already exists (from WebSocket)
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

    // Handle starting a call
    const handleStartCall = async (callType: 'audio' | 'video') => {
        if (!selectedConversation || !user) return;

        // Get receiver info based on conversation type
        let receiver: User | undefined;

        if (selectedConversation.isGroup) {
            // For groups, we would need to implement group calling (future feature)
            alert('Group calls are not yet supported');
            return;
        } else {
            // For direct messages, extract the other user
            const parts = selectedConversation.id.split('-');
            if (parts.length === 3) {
                const userId1 = parseInt(parts[1]);
                const userId2 = parseInt(parts[2]);
                const otherUserId = userId1 === user.id ? userId2 : userId1;
                receiver = availableUsers.find(u => u.id === otherUserId);
            }
        }

        if (!receiver) {
            alert('Cannot find receiver for this conversation');
            return;
        }

        try {
            await startCall(receiver, selectedConversation.id, callType);
        } catch (error) {
            console.error('Error starting call:', error);
            alert('Failed to start call. Please check your camera/microphone permissions.');
        }
    };

    // Handle accepting an incoming call
    const handleAcceptCall = async () => {
        if (!incomingCall || !incomingCall.offer) return;

        try {
            await answerCall(incomingCall, incomingCall.offer);
            setIncomingCall(null);
        } catch (error) {
            console.error('Error accepting call:', error);
            alert('Failed to accept call. Please check your camera/microphone permissions.');
        }
    };

    // Handle rejecting an incoming call
    const handleRejectCall = () => {
        if (incomingCall && sendSignalRef.current) {
            sendSignalRef.current({
                type: 'call-rejected',
                from: incomingCall.receiver.id,
                to: incomingCall.caller.id,
                channelId: incomingCall.channelId,
            });
        }
        setIncomingCall(null);
    };

    // Handle ending the current call
    const handleEndCall = () => {
        console.log('👆 handleEndCall called from UI');
        console.log('👆 Call state:', callState);
        console.log('👆 Current call:', currentCall);
        endCall();
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
                    {!isCollapsed && (
                        <button
                            onClick={() => setShowGroupModal(true)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-accent to-accent-hover text-white text-xs font-semibold rounded-md hover:shadow-lg hover:scale-105 transition-all ml-2 shrink-0"
                            title="Create Group Chat"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Create Group
                        </button>
                    )}
                    {!isCollapsed && hasUnreadMessages && (
                        <button
                            onClick={handleMarkAllAsRead}
                            className="text-xs font-semibold text-text-secondary hover:underline ml-2 shrink-0"
                            title="Mark all as read"
                        >
                            Mark all
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
                                        onTogglePin={handleTogglePin}
                                        onToggleMute={handleToggleMute}
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
                        onStartCall={handleStartCall}
                    />
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <p className="text-text-secondary">Select a conversation to start messaging.</p>
                    </div>
                )}
            </main>

            {/* Group Creation Modal */}
            {showGroupModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-background-panel rounded-lg shadow-xl max-w-md w-full p-6">
                        <h2 className="text-xl font-bold text-text-primary mb-4">Create Group Chat</h2>

                        <div className="mb-4">
                            <label className="block text-sm font-semibold text-text-primary mb-2">
                                Group Name
                            </label>
                            <input
                                type="text"
                                value={groupName}
                                onChange={(e) => setGroupName(e.target.value)}
                                className="w-full px-3 py-2 border border-border-color rounded-md bg-background-main text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                                placeholder="Enter group name..."
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-semibold text-text-primary mb-2">
                                Select Members ({selectedGroupMembers.length} selected)
                            </label>
                            {/* Search input */}
                            <div className="mb-2 relative">
                                <input
                                    type="text"
                                    value={groupMemberSearch}
                                    onChange={(e) => setGroupMemberSearch(e.target.value)}
                                    className="w-full px-3 py-2 pl-9 border border-border-color rounded-md bg-background-main text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                                    placeholder="Search members..."
                                />
                                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            {!groupMemberSearch && (
                                <div className="text-xs text-text-secondary mb-2 px-1">
                                    Showing recent chats. Search to see all users.
                                </div>
                            )}
                            <div className="max-h-60 overflow-y-auto border border-border-color rounded-md">
                                {(() => {
                                    // Get recent users from conversations (exclude current user and groups)
                                    const recentUserIds = conversations
                                        .filter(c => c.id.startsWith('dm-') && !c.isGroup)
                                        .slice(0, 5) // Take top 5 recent conversations
                                        .map(c => {
                                            // Extract other user's ID from dm-{id1}-{id2}
                                            const parts = c.id.split('-');
                                            if (parts.length === 3) {
                                                const userId1 = parseInt(parts[1]);
                                                const userId2 = parseInt(parts[2]);
                                                return userId1 === user?.id ? userId2 : userId1;
                                            }
                                            return null;
                                        })
                                        .filter(id => id !== null) as number[];

                                    // Filter users based on search
                                    let usersToShow = availableUsers.filter(u =>
                                        u.name.toLowerCase().includes(groupMemberSearch.toLowerCase()) ||
                                        (u.email && u.email.toLowerCase().includes(groupMemberSearch.toLowerCase()))
                                    );

                                    // If no search, show only recent users (max 3)
                                    if (!groupMemberSearch) {
                                        const recentUsers = usersToShow.filter(u => recentUserIds.includes(u.id));
                                        usersToShow = recentUsers.slice(0, 3);
                                    }

                                    if (usersToShow.length === 0) {
                                        return (
                                            <div className="p-4 text-center text-sm text-text-secondary">
                                                {groupMemberSearch ? 'No users found' : 'No recent chats. Search to find users.'}
                                            </div>
                                        );
                                    }

                                    return usersToShow.map(availUser => (
                                    <div
                                        key={availUser.id}
                                        onClick={() => {
                                            if (selectedGroupMembers.find(u => u.id === availUser.id)) {
                                                setSelectedGroupMembers(prev => prev.filter(u => u.id !== availUser.id));
                                            } else {
                                                setSelectedGroupMembers(prev => [...prev, availUser]);
                                            }
                                        }}
                                        className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-background-main transition-colors ${
                                            selectedGroupMembers.find(u => u.id === availUser.id) ? 'bg-accent-soft' : ''
                                        }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={!!selectedGroupMembers.find(u => u.id === availUser.id)}
                                            onChange={() => {}}
                                            className="w-4 h-4"
                                        />
                                        <img
                                            src={availUser.avatar}
                                            alt={availUser.name}
                                            className="w-8 h-8 rounded-full object-cover"
                                        />
                                        <div>
                                            <p className="font-semibold text-sm text-text-primary">{availUser.name}</p>
                                            <p className="text-xs text-text-secondary">{availUser.email}</p>
                                        </div>
                                    </div>
                                    ));
                                })()}
                            </div>
                        </div>

                        <div className="flex gap-2 justify-end">
                            <button
                                onClick={() => {
                                    setShowGroupModal(false);
                                    setGroupName('');
                                    setSelectedGroupMembers([]);
                                    setGroupMemberSearch('');
                                }}
                                className="px-4 py-2 bg-background-main border border-border-color text-text-primary font-semibold rounded-lg hover:bg-input-field transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateGroup}
                                className="px-4 py-2 bg-accent text-white font-semibold rounded-lg hover:bg-accent-hover transition-colors"
                            >
                                Create Group
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Call Window - Full screen when call is active */}
            {callState !== 'idle' && currentCall && (
                <CallWindow
                    callState={callState}
                    callType={currentCall.type}
                    caller={currentCall.caller}
                    receiver={currentCall.receiver}
                    localVideoRef={localVideoRef}
                    remoteVideoRef={remoteVideoRef}
                    isMuted={isMuted}
                    isVideoOff={isVideoOff}
                    onToggleMute={toggleMute}
                    onToggleVideo={toggleVideo}
                    onEndCall={handleEndCall}
                />
            )}

            {/* Incoming Call Notification */}
            {incomingCall && (
                <IncomingCall
                    caller={incomingCall.caller}
                    callType={incomingCall.type}
                    onAccept={handleAcceptCall}
                    onReject={handleRejectCall}
                />
            )}
        </div>
    );
};

export default MessagesView;