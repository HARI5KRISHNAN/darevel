
// hooks/useRealTimeK8s.ts
import { useState, useEffect, useCallback } from 'react';
import { Pod } from '../types';

// Backend URL for containers API
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8083';

// Polling interval in milliseconds (30 seconds)
const POLL_INTERVAL = 30000;

export type PodSource = 'docker' | 'kubernetes' | 'openshift';

export const useRealTimeK8s = (source: PodSource = 'docker') => {
  const [pods, setPods] = useState<Pod[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected'>('disconnected');
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Convert Docker container to Pod format
  const containerToPod = (container: any, sourceType: PodSource): Pod => {
    const name = container.names && container.names.length > 0
      ? container.names[0].replace(/^\//, '')
      : container.name || container.id?.substring(0, 12) || 'Unknown';

    // Map status to Pod status
    let status: Pod['status'] = 'Unknown';
    const statusLower = (container.status || '').toLowerCase();
    if (statusLower.includes('running') || statusLower.includes('up')) {
      status = 'Running';
    } else if (statusLower.includes('exited') || statusLower.includes('stopped') || statusLower.includes('failed') || statusLower.includes('error')) {
      status = 'Failed';
    } else if (statusLower.includes('created') || statusLower.includes('starting') || statusLower.includes('pending')) {
      status = 'Pending';
    }

    return {
      id: container.id || `${sourceType}-${Date.now()}-${Math.random()}`,
      name,
      namespace: container.namespace || sourceType,
      status,
      containerId: container.id?.substring(0, 12),
      image: container.image,
      restarts: container.restartCount || container.restarts || 0,
      age: container.created || container.age || 'N/A',
      cpuUsage: container.cpuPercent || container.cpuUsage,
      memoryUsage: container.memoryUsage,
    };
  };

  // Get API endpoint based on source
  const getApiEndpoint = (sourceType: PodSource): string => {
    switch (sourceType) {
      case 'docker':
        return `${BACKEND_URL}/api/docker/containers`;
      case 'kubernetes':
        return `${BACKEND_URL}/api/kubernetes/pods`;
      case 'openshift':
        return `${BACKEND_URL}/api/openshift/pods`;
      default:
        return `${BACKEND_URL}/api/docker/containers`;
    }
  };

  // Fetch containers/pods from backend
  const fetchData = useCallback(async () => {
    try {
      const endpoint = getApiEndpoint(source);
      const response = await fetch(endpoint);
      const result = await response.json();

      if (result.success && result.data) {
        const podData = result.data.map((item: any) => containerToPod(item, source));
        setPods(podData);
        setConnectionStatus('connected');
        setLastUpdate(new Date());
      } else {
        console.warn(`Failed to fetch ${source} data:`, result.message);
        setPods([]);
        setConnectionStatus('disconnected');
      }
    } catch (error) {
      console.error(`Error fetching ${source} data:`, error);
      setPods([]);
      setConnectionStatus('disconnected');
    }
  }, [source]);

  useEffect(() => {
    // Initial fetch
    fetchData();

    // Set up polling interval
    const interval = setInterval(fetchData, POLL_INTERVAL);

    return () => {
      clearInterval(interval);
    };
  }, [fetchData]);

  // Function to manually refresh
  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { pods, connectionStatus, lastUpdate, refresh };
};
