import { useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Message } from '../types';
import { transformBackendMessage } from '../services/api';

interface UseWebSocketProps {
    channelId: string | null;
    onMessageReceived: (message: Message) => void;
}

export const useWebSocket = ({ channelId, onMessageReceived }: UseWebSocketProps) => {
    const [isConnected, setIsConnected] = useState(false);
    const clientRef = useRef<Client | null>(null);
    const subscriptionRef = useRef<any>(null);

    useEffect(() => {
        // WebSocket URL - using chat service on port 8082
        const WS_URL = import.meta.env.VITE_WEBSOCKET_URL || 'http://localhost:8082';
        const socketUrl = `${WS_URL}/ws`;

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

            // Subscribe to channel if channelId is provided
            if (channelId && client.connected) {
                subscriptionRef.current = client.subscribe(
                    `/topic/messages/${channelId}`,
                    (message) => {
                        console.log('📩 Received WebSocket message:', message.body);
                        try {
                            const backendMessage = JSON.parse(message.body);
                            // Transform backend message to frontend Message type
                            const transformedMessage = transformBackendMessage(backendMessage);
                            onMessageReceived(transformedMessage);
                        } catch (error) {
                            console.error('Error parsing message:', error);
                        }
                    }
                );
                console.log(`Subscribed to /topic/messages/${channelId}`);
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

        // Cleanup on unmount or channel change
        return () => {
            if (subscriptionRef.current) {
                subscriptionRef.current.unsubscribe();
                console.log(`Unsubscribed from /topic/messages/${channelId}`);
            }
            if (clientRef.current) {
                clientRef.current.deactivate();
                console.log('WebSocket client deactivated');
            }
        };
    }, [channelId, onMessageReceived]);

    return { isConnected };
};
