import { useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Message, User } from '../types';
import { transformBackendMessage } from '../services/api';
import { SignalingMessage } from './useWebRTCCall';
import { devLog, devError } from '../utils/devLogger';

interface UseWebSocketProps {
    channelId: string | null;
    onMessageReceived: (message: Message) => void;
    user?: User | null;
    onCallSignal?: (signal: SignalingMessage) => void;
    sendSignal?: (message: SignalingMessage) => void;
    subscribeChannelIds?: string[];
}

export const useWebSocket = ({ channelId, onMessageReceived, user, onCallSignal, subscribeChannelIds }: UseWebSocketProps) => {
    const [isConnected, setIsConnected] = useState(false);
    const clientRef = useRef<Client | null>(null);
    const subscriptionRef = useRef<any>(null);
    const callSubscriptionRef = useRef<any>(null);
    const multiSubscriptionsRef = useRef<Map<string, any>>(new Map());

    const onMessageReceivedRef = useRef(onMessageReceived);
    const onCallSignalRef = useRef(onCallSignal);

    useEffect(() => {
        onMessageReceivedRef.current = onMessageReceived;
    }, [onMessageReceived]);

    useEffect(() => {
        onCallSignalRef.current = onCallSignal;
    }, [onCallSignal]);

    useEffect(() => {
        if (!user) return;
        const WS_URL = import.meta.env.VITE_WEBSOCKET_URL || 'http://localhost:8081';
        const socketUrl = `${WS_URL}/ws`;
        devLog('🔌 Initializing WebSocket connection...');
        devLog('🔌 User:', user?.id, user?.name);
        devLog('🔌 Has onCallSignal handler:', !!onCallSignal);
        const client = new Client({
            webSocketFactory: () => new SockJS(socketUrl),
            debug: (str) => {
                devLog('STOMP Debug:', str);
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });
        client.onConnect = () => {
            devLog('✓ Connected to WebSocket');
            setIsConnected(true);
            if (user && onCallSignalRef.current && client.connected) {
                devLog(`🔔 Subscribing to /topic/call-signal/${user.id} for user: ${user.name}`);
                devLog(`🔔 User ID Type: ${typeof user.id}, Value: ${user.id}`);
                callSubscriptionRef.current = client.subscribe(
                    `/topic/call-signal/${user.id}`,
                    (message) => {
                        try {
                            const signal: SignalingMessage = JSON.parse(message.body);
                            if (onCallSignalRef.current) {
                                onCallSignalRef.current(signal);
                            }
                        } catch (error) {
                            devError('❌ Error parsing call signal:', error);
                        }
                    }
                );
                devLog(`✅ Successfully subscribed to /topic/call-signal/${user.id}`);
            }
            // Subscribe to per-user DM topic
            if (user && client.connected) {
                const userTopic = `/topic/messages/user-${user.id}`;
                client.subscribe(userTopic, (message: any) => {
                    try {
                        const backendMessage = JSON.parse(message.body);
                        const transformedMessage = transformBackendMessage(backendMessage);
                        onMessageReceivedRef.current(transformedMessage);
                        devLog(`📥 Received DM via ${userTopic}:`, message.body);
                    } catch (error) {
                        devError('Error parsing per-user DM message:', error);
                    }
                });
                devLog(`✅ Subscribed to ${userTopic}`);
            }
        };
        client.onDisconnect = () => {
            devLog('✗ Disconnected from WebSocket');
            setIsConnected(false);
        };
        client.onStompError = (frame) => {
            devError('STOMP error:', frame);
            setIsConnected(false);
        };
        client.activate();
        clientRef.current = client;
        return () => {
            if (callSubscriptionRef.current) {
                try { callSubscriptionRef.current.unsubscribe(); } catch (e) {}
                devLog(`Unsubscribed from /topic/call-signal/${user?.id}`);
            }
            try {
                const map = multiSubscriptionsRef.current;
                map.forEach((sub, ch) => {
                    try { sub.unsubscribe(); } catch (e) {}
                    devLog(`Unsubscribed from /topic/messages/${ch} (multi)`);
                });
                map.clear();
            } catch (e) {}
            if (clientRef.current) {
                clientRef.current.deactivate();
                devLog('WebSocket client deactivated');
            }
        };
    }, [user]);

    useEffect(() => {
        if (!channelId || !clientRef.current?.connected) return;
        devLog(`📬 Subscribing to /topic/messages/${channelId}`);
        subscriptionRef.current = clientRef.current.subscribe(
            `/topic/messages/${channelId}`,
            (message) => {
                try {
                    const backendMessage = JSON.parse(message.body);
                    const transformedMessage = transformBackendMessage(backendMessage);
                    onMessageReceivedRef.current(transformedMessage);
                } catch (error) {
                    devError('Error parsing message:', error);
                }
            }
        );
        devLog(`Subscribed to /topic/messages/${channelId}`);
        return () => {
            if (subscriptionRef.current) {
                subscriptionRef.current.unsubscribe();
                devLog(`Unsubscribed from /topic/messages/${channelId}`);
            }
        };
    }, [channelId]);

    useEffect(() => {
        if (!clientRef.current) return;
        const map = multiSubscriptionsRef.current;
        const ids = Array.isArray(subscribeChannelIds) ? subscribeChannelIds : [];
        if (!clientRef.current.connected) return;
        ids.forEach(id => {
            if (!map.has(id) && clientRef.current?.connected) {
                const sub = clientRef.current.subscribe(`/topic/messages/${id}`, (message: any) => {
                    try {
                        const backendMessage = JSON.parse(message.body);
                        const transformedMessage = transformBackendMessage(backendMessage);
                        onMessageReceivedRef.current(transformedMessage);
                    } catch (error) {
                        devError('Error parsing multi-channel message:', error);
                    }
                });
                map.set(id, sub);
                devLog(`✅ Subscribed to /topic/messages/${id} (multi)`);
            }
        });
        Array.from(map.keys()).forEach(existing => {
            if (!ids.includes(existing)) {
                const sub = map.get(existing);
                try { sub.unsubscribe(); } catch (e) {}
                map.delete(existing);
                devLog(`Unsubscribed from /topic/messages/${existing} (multi)`);
            }
        });
    }, [subscribeChannelIds, isConnected]);

    const sendSignalMessage = (message: SignalingMessage) => {
        if (clientRef.current && clientRef.current.connected) {
            clientRef.current.publish({
                destination: `/app/call-signal/${message.to}`,
                body: JSON.stringify(message),
            });
            devLog('✅ Call signal sent successfully');
        } else {
            devError('❌ Cannot send call signal - WebSocket not connected');
        }
    };

    return { isConnected, sendSignalMessage };
};

