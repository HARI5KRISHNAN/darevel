import { useEffect, useRef, useState } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

/**
 * Custom hook for WebSocket pod updates
 * @param {Function} onMessage - Callback function when message received
 * @param {boolean} enabled - Whether to connect to WebSocket
 * @returns {Object} - { connected, error, lastMessage }
 */
export const useWebSocketPodUpdates = (onMessage, enabled = true) => {
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const [lastMessage, setLastMessage] = useState(null);
  const clientRef = useRef(null);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    // Create SockJS connection
    const socket = new SockJS('http://localhost:8083/ws');
    
    // Create STOMP client
    const stompClient = new Client({
      webSocketFactory: () => socket,
      
      onConnect: () => {
        console.log('WebSocket connected');
        setConnected(true);
        setError(null);
        
        // Subscribe to pod updates topic
        stompClient.subscribe('/topic/pod-updates', (message) => {
          try {
            const data = JSON.parse(message.body);
            console.log('Received pod update:', data.type, data.action, data.totalCount);
            
            setLastMessage(data);
            
            if (onMessage) {
              onMessage(data);
            }
          } catch (err) {
            console.error('Error parsing WebSocket message:', err);
            setError('Failed to parse message');
          }
        });
      },
      
      onDisconnect: () => {
        console.log('WebSocket disconnected');
        setConnected(false);
      },
      
      onStompError: (frame) => {
        console.error('STOMP error:', frame);
        setError('WebSocket connection error');
        setConnected(false);
      },
      
      // Reconnect settings
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    // Activate the client
    stompClient.activate();
    clientRef.current = stompClient;

    // Cleanup on unmount
    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
        console.log('WebSocket deactivated');
      }
    };
  }, [enabled, onMessage]);

  return { connected, error, lastMessage };
};

export default useWebSocketPodUpdates;
