import { useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Message, User } from '../types';
import { transformBackendMessage } from '../services/api';
import { SignalingMessage } from './useWebRTCCall';

interface UseWebSocketProps {
    channelId: string | null;
    onMessageReceived: (message: Message) => void;
    user?: User | null;
    onCallSignal?: (signal: SignalingMessage) => void;
    sendSignal?: (message: SignalingMessage) => void;
}

export const useWebSocket = ({ channelId, onMessageReceived, user, onCallSignal }: UseWebSocketProps) => {
    const [isConnected, setIsConnected] = useState(false);
    const clientRef = useRef<Client | null>(null);
    const subscriptionRef = useRef<any>(null);
    const callSubscriptionRef = useRef<any>(null);

    // Use refs to avoid reconnecting when callbacks change
    const onMessageReceivedRef = useRef(onMessageReceived);
    const onCallSignalRef = useRef(onCallSignal);

    // Update refs when callbacks change
    useEffect(() => {
        onMessageReceivedRef.current = onMessageReceived;
    }, [onMessageReceived]);

    useEffect(() => {
        onCallSignalRef.current = onCallSignal;
    }, [onCallSignal]);

    // Main WebSocket connection - only reconnect when user changes
    useEffect(() => {
        if (!user) return;

        // WebSocket URL - using chat service on port 8082
        const WS_URL = import.meta.env.VITE_WEBSOCKET_URL || 'http://localhost:8082';
        const socketUrl = `${WS_URL}/ws`;

        console.log('🔌 Initializing WebSocket connection...');
        console.log('🔌 User:', user?.id, user?.name);
        console.log('🔌 Has onCallSignal handler:', !!onCallSignal);

        // Create STOMP client
        const client = new Client({
            webSocketFactory: () => new SockJS(socketUrl),
            debug: (str) => {
                console.log('STOMP Debug:', str);
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        // On connect
        client.onConnect = () => {
            console.log('✓ Connected to WebSocket');
            setIsConnected(true);

            // Subscribe to call signaling for this user (always active)
            if (user && onCallSignalRef.current && client.connected) {
                console.log(`🔔 Subscribing to /topic/call-signal/${user.id} for user: ${user.name}`);
                callSubscriptionRef.current = client.subscribe(
                    `/topic/call-signal/${user.id}`,
                    (message) => {
                        console.log('📞 RAW call signal received:', message.body);
                        try {
                            const signal: SignalingMessage = JSON.parse(message.body);
                            console.log('📞 PARSED call signal:', signal);
                            console.log('📞 Signal type:', signal.type, 'From:', signal.from, 'To:', signal.to);
                            if (onCallSignalRef.current) {
                                onCallSignalRef.current(signal);
                            }
                        } catch (error) {
                            console.error('❌ Error parsing call signal:', error);
                        }
                    }
                );
                console.log(`✅ Successfully subscribed to /topic/call-signal/${user.id}`);
            } else {
                console.log(`⚠️ Not subscribing to call signals. user: ${!!user}, onCallSignal: ${!!onCallSignalRef.current}, connected: ${client.connected}`);
            }
        };

        // On disconnect
        client.onDisconnect = () => {
            console.log('✗ Disconnected from WebSocket');
            setIsConnected(false);
        };

        // On error
        client.onStompError = (frame) => {
            console.error('STOMP error:', frame);
            setIsConnected(false);
        };

        // Activate the client
        client.activate();
        clientRef.current = client;

        // Cleanup on unmount or user change
        return () => {
            if (callSubscriptionRef.current) {
                callSubscriptionRef.current.unsubscribe();
                console.log(`Unsubscribed from /topic/call-signal/${user?.id}`);
            }
            if (clientRef.current) {
                clientRef.current.deactivate();
                console.log('WebSocket client deactivated');
            }
        };
    }, [user]); // Only reconnect when user changes

    // Message channel subscription - change when channelId changes
    useEffect(() => {
        if (!channelId || !clientRef.current?.connected) return;

        console.log(`📬 Subscribing to /topic/messages/${channelId}`);

        // Subscribe to channel
        subscriptionRef.current = clientRef.current.subscribe(
            `/topic/messages/${channelId}`,
            (message) => {
                console.log('📩 Received WebSocket message:', message.body);
                try {
                    const backendMessage = JSON.parse(message.body);
                    // Transform backend message to frontend Message type
                    const transformedMessage = transformBackendMessage(backendMessage);
                    onMessageReceivedRef.current(transformedMessage);
                } catch (error) {
                    console.error('Error parsing message:', error);
                }
            }
        );
        console.log(`Subscribed to /topic/messages/${channelId}`);

        // Cleanup: unsubscribe when channelId changes
        return () => {
            if (subscriptionRef.current) {
                subscriptionRef.current.unsubscribe();
                console.log(`Unsubscribed from /topic/messages/${channelId}`);
            }
        };
    }, [channelId]); // Only change message subscription when channelId changes

    // Send call signaling message
    const sendSignalMessage = (message: SignalingMessage) => {
        console.log('📤 ============ SENDING CALL SIGNAL ============');
        console.log('📤 Signal type:', message.type);
        console.log('📤 From user:', message.from);
        console.log('📤 To user:', message.to);
        console.log('📤 Channel ID:', message.channelId);
        console.log('📤 Call type:', message.callType);
        console.log('📤 Has offer:', !!message.offer);
        console.log('📤 Has answer:', !!message.answer);
        console.log('📤 Has candidate:', !!message.candidate);
        console.log('📤 Destination:', `/app/call-signal/${message.to}`);
        console.log('📤 WebSocket connected:', clientRef.current?.connected);

        const signalBody = JSON.stringify(message);
        console.log('📤 Signal body length:', signalBody.length, 'bytes');
        console.log('📤 Full signal:', signalBody);

        if (clientRef.current && clientRef.current.connected) {
            clientRef.current.publish({
                destination: `/app/call-signal/${message.to}`,
                body: signalBody,
            });
            console.log('✅ Call signal sent successfully');
        } else {
            console.error('❌ Cannot send call signal - WebSocket not connected');
        }
    };

    return { isConnected, sendSignalMessage };
};
