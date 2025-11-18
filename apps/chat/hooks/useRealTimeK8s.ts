
// hooks/useRealTimeK8s.ts
import { useState, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { Pod, PodUpdateEvent } from '../types';

// NOTE: The Java backend uses Spring WebSocket, not Socket.IO
// This hook is disabled until WebSocket is properly migrated
const SOCKET_URL = import.meta.env.VITE_WEBSOCKET_URL || 'http://localhost:8082';

export const useRealTimeK8s = () => {
  const [pods, setPods] = useState<Pod[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected'>('disconnected');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const processUpdate = useCallback((event: PodUpdateEvent) => {
    setPods(currentPods => {
      const { type, object: updatedPod } = event;
      switch (type) {
        case 'ADDED':
          if (!currentPods.some(p => p.id === updatedPod.id)) {
            return [...currentPods, updatedPod];
          }
          return currentPods;
        case 'MODIFIED':
          return currentPods.map(p => p.id === updatedPod.id ? updatedPod : p);
        case 'DELETED':
          return currentPods.filter(p => p.id !== updatedPod.id);
        default:
          return currentPods;
      }
    });
    setLastUpdate(new Date());
  }, []);

  useEffect(() => {
    // TODO: Migrate to Spring WebSocket (SockJS/STOMP)
    // The Java backend doesn't support Socket.IO
    // For now, disable real-time updates
    console.warn('Kubernetes real-time updates disabled - Socket.IO not available in Java backend');
    setConnectionStatus('disconnected');
    // No-op: WebSocket connection disabled
    return () => {}; // Cleanup function

    /* Socket.IO code disabled
    const socket: Socket = io(SOCKET_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      console.log('✓ Connected to Kubernetes backend');
      setConnectionStatus('connected');
    });

    socket.on('disconnect', () => {
      console.log('✗ Disconnected from Kubernetes backend');
      setConnectionStatus('disconnected');
    });

    // Receive initial pod list
    socket.on('initial_pods', (initialPods: Pod[]) => {
      console.log(`Received ${initialPods.length} pods`);
      setPods(initialPods);
    });

    // Receive real-time updates
    socket.on('pod_update', (event: PodUpdateEvent) => {
      processUpdate(event);
    });

    // Receive full pod list updates (includes metrics every 10 seconds)
    socket.on('pods_update', (updatedPods: Pod[]) => {
      console.log(`📊 Received metrics update for ${updatedPods.length} pods`);
      setPods(updatedPods);
      setLastUpdate(new Date());
    });

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });

    return () => {
      socket.disconnect();
    };
    */
  }, [processUpdate]);

  return { pods, connectionStatus, lastUpdate };
};
