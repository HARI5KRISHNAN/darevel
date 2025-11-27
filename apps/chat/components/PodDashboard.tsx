import React, { useState, useMemo } from 'react';
import { Pod } from '../types';

interface PodDashboardProps {
  pods: Pod[];
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
}

const PodDashboard: React.FC<PodDashboardProps> = ({ pods, connectionStatus }) => {
  const [selectedNamespace, setSelectedNamespace] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Get unique namespaces
  const namespaces = useMemo(() => {
    const uniqueNamespaces = new Set(pods.map(p => p.namespace));
    return ['all', ...Array.from(uniqueNamespaces).sort()];
  }, [pods]);

  // Filter pods by namespace and search query
  const filteredPods = useMemo(() => {
    return pods
      .filter(pod => selectedNamespace === 'all' || pod.namespace === selectedNamespace)
      .filter(pod => pod.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [pods, selectedNamespace, searchQuery]);

  // Calculate status counts
  const statusCounts = useMemo(() => {
    const counts = {
      Running: 0,
      Pending: 0,
      Failed: 0,
      Succeeded: 0,
      Unknown: 0,
    };
    filteredPods.forEach(pod => {
      counts[pod.status]++;
    });
    return counts;
  }, [filteredPods]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Running':
        return 'text-green-400 bg-green-900/30 border-green-700';
      case 'Pending':
        return 'text-yellow-400 bg-yellow-900/30 border-yellow-700';
      case 'Failed':
        return 'text-red-400 bg-red-900/30 border-red-700';
      case 'Succeeded':
        return 'text-blue-400 bg-blue-900/30 border-blue-700';
      default:
        return 'text-gray-400 bg-gray-900/30 border-gray-700';
    }
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'bg-green-500';
      case 'connecting':
        return 'bg-yellow-500 animate-pulse';
      case 'disconnected':
        return 'bg-gray-500';
      case 'error':
        return 'bg-red-500';
    }
  };

  const formatAge = (ageInSeconds: number) => {
    if (ageInSeconds < 60) return `${ageInSeconds}s`;
    if (ageInSeconds < 3600) return `${Math.floor(ageInSeconds / 60)}m`;
    if (ageInSeconds < 86400) return `${Math.floor(ageInSeconds / 3600)}h`;
    return `${Math.floor(ageInSeconds / 86400)}d`;
  };

  const formatCpu = (millicores: number) => {
    if (millicores < 1000) {
      return `${millicores}m`;
    } else {
      return `${(millicores / 1000).toFixed(2)}`;
    }
  };

  const formatMemory = (mib: number) => {
    if (mib < 1024) {
      return `${mib}Mi`;
    } else {
      return `${(mib / 1024).toFixed(2)}Gi`;
    }
  };

  return (
    <div className="flex flex-col h-full bg-background-main p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Pod Dashboard</h2>
          <p className="text-text-secondary text-sm">Real-time Kubernetes pod monitoring</p>
        </div>

        {/* Connection Status */}
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${getConnectionStatusColor()}`}></div>
          <span className="text-sm text-text-secondary capitalize">{connectionStatus}</span>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {Object.entries(statusCounts).map(([status, count]) => (
          <div
            key={status}
            className={`p-4 rounded-lg border ${getStatusColor(status)}`}
          >
            <div className="text-2xl font-bold">{count}</div>
            <div className="text-xs mt-1 opacity-80">{status}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        {/* Namespace Filter */}
        <select
          value={selectedNamespace}
          onChange={(e) => setSelectedNamespace(e.target.value)}
          className="px-4 py-2 bg-background-panel border border-border-color rounded-lg text-text-primary focus:ring-2 focus:ring-indigo-500 outline-none"
        >
          {namespaces.map(ns => (
            <option key={ns} value={ns}>
              {ns === 'all' ? 'All Namespaces' : ns}
            </option>
          ))}
        </select>

        {/* Search */}
        <input
          type="text"
          placeholder="Search pods..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-4 py-2 bg-background-panel border border-border-color rounded-lg text-text-primary placeholder-text-secondary focus:ring-2 focus:ring-indigo-500 outline-none"
        />
      </div>

      {/* Pods List */}
      <div className="flex-1 overflow-auto custom-scrollbar">
        {filteredPods.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-text-secondary">
            <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <p>No pods found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredPods.map((pod) => (
              <div
                key={pod.id}
                className="p-4 bg-background-panel border border-border-color rounded-lg hover:border-indigo-600/50 transition-all"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-text-primary text-sm">{pod.name}</h3>
                    <p className="text-xs text-text-secondary">{pod.namespace}</p>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(pod.status)}`}
                  >
                    {pod.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 text-xs">
                  <div>
                    <span className="text-text-secondary">Age:</span>
                    <span className="ml-2 text-text-primary font-medium">{formatAge(pod.age)}</span>
                  </div>

                  <div>
                    <span className="text-text-secondary">Restarts:</span>
                    <span className={`ml-2 font-medium ${pod.restarts > 0 ? 'text-yellow-400' : 'text-text-primary'}`}>
                      {pod.restarts}
                    </span>
                  </div>

                  {pod.cpuUsage !== null && (
                    <div>
                      <span className="text-text-secondary">CPU:</span>
                      <span className="ml-2 text-text-primary font-medium">{formatCpu(pod.cpuUsage)}</span>
                    </div>
                  )}

                  {pod.memoryUsage !== null && (
                    <div>
                      <span className="text-text-secondary">Memory:</span>
                      <span className="ml-2 text-text-primary font-medium">{formatMemory(pod.memoryUsage)}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1a1b2e;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #4f46e5;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #6366f1;
        }
      `}</style>
    </div>
  );
};

export default PodDashboard;
