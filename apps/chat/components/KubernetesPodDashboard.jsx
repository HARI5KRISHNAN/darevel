import React, { useState, useEffect } from 'react';
import useWebSocketPodUpdates from '../hooks/useWebSocketPodUpdates';

const KubernetesPodDashboard = () => {
  const [pods, setPods] = useState([]);
  const [namespaces, setNamespaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  
  // Filters
  const [selectedNamespace, setSelectedNamespace] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);

  // WebSocket connection
  const { connected: wsConnected, error: wsError, lastMessage } = useWebSocketPodUpdates(
    (message) => {
      // Handle WebSocket updates
      if (message.type === 'kubernetes') {
        console.log('Received Kubernetes update via WebSocket:', message.action);
        // Refresh pods when we get an update
        fetchPods();
      }
    },
    autoRefresh // Only connect when auto-refresh is enabled
  );

  // Fetch connection status
  const fetchConnectionStatus = async () => {
    try {
      const response = await fetch('http://localhost:8083/api/connection-status');
      const data = await response.json();
      setConnectionStatus(data.kubernetes === 'connected' ? 'connected' : 'disconnected');
    } catch (err) {
      setConnectionStatus('disconnected');
    }
  };

  // Fetch namespaces
  const fetchNamespaces = async () => {
    try {
      const response = await fetch('http://localhost:8083/api/k8s/namespaces');
      const result = await response.json();
      
      if (result.success) {
        setNamespaces(result.data || []);
      }
    } catch (err) {
      console.error('Error fetching namespaces:', err);
    }
  };

  // Fetch pods
  const fetchPods = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const url = selectedNamespace === 'all' 
        ? 'http://localhost:8083/api/k8s/pods'
        : `http://localhost:8083/api/k8s/pods?namespace=${selectedNamespace}`;
      
      const response = await fetch(url);
      const result = await response.json();
      
      if (result.success) {
        setPods(result.data || []);
        setLastRefresh(new Date());
      } else {
        setError(result.message || 'Failed to fetch pods');
        setPods([]);
      }
    } catch (err) {
      setError('Unable to connect to Kubernetes service');
      setPods([]);
      console.error('Error fetching pods:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchConnectionStatus();
    fetchNamespaces();
    fetchPods();
  }, []);

  // Auto-refresh with fallback polling (only if WebSocket not connected)
  useEffect(() => {
    if (!autoRefresh || wsConnected) return;
    
    const interval = setInterval(() => {
      fetchConnectionStatus();
      fetchPods();
    }, 10000); // Refresh every 10 seconds as fallback
    
    return () => clearInterval(interval);
  }, [autoRefresh, selectedNamespace]);

  // Fetch pods when namespace changes
  useEffect(() => {
    if (selectedNamespace) {
      fetchPods();
    }
  }, [selectedNamespace]);

  // Filter pods
  const filteredPods = pods.filter(pod => {
    // Status filter
    if (selectedStatus !== 'all' && pod.status?.toLowerCase() !== selectedStatus.toLowerCase()) {
      return false;
    }
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        pod.name?.toLowerCase().includes(query) ||
        pod.namespace?.toLowerCase().includes(query) ||
        pod.nodeName?.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  const getStatusColor = (status) => {
    if (!status) return 'bg-gray-600';
    const statusLower = status.toLowerCase();
    if (statusLower === 'running') return 'bg-green-600';
    if (statusLower === 'pending') return 'bg-yellow-600';
    if (statusLower === 'failed' || statusLower === 'error') return 'bg-red-600';
    if (statusLower === 'succeeded') return 'bg-blue-600';
    return 'bg-gray-600';
  };

  const getStatusDotColor = (status) => {
    if (!status) return 'bg-gray-400';
    const statusLower = status.toLowerCase();
    if (statusLower === 'running') return 'bg-green-500';
    if (statusLower === 'pending') return 'bg-yellow-500';
    if (statusLower === 'failed' || statusLower === 'error') return 'bg-red-500';
    if (statusLower === 'succeeded') return 'bg-blue-500';
    return 'bg-gray-400';
  };

  // Get unique statuses from pods
  const uniqueStatuses = [...new Set(pods.map(p => p.status).filter(Boolean))];

  return (
    <div className="bg-gray-900 rounded-lg shadow-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Kubernetes Pods</h2>
          <p className="text-gray-400 text-sm">
            {filteredPods.length} pod{filteredPods.length !== 1 ? 's' : ''} 
            {selectedNamespace !== 'all' && ` in ${selectedNamespace}`}
            {lastRefresh && (
              <span className="ml-2">
                • Last updated: {lastRefresh.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* WebSocket Status Indicator */}
          {autoRefresh && (
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-gray-800 rounded-lg">
              <span className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-blue-500 animate-pulse' : 'bg-gray-500'}`}></span>
              <span className={`text-xs font-medium ${wsConnected ? 'text-blue-400' : 'text-gray-400'}`}>
                WS {wsConnected ? 'Live' : 'Off'}
              </span>
            </div>
          )}

          {/* Connection Status Indicator */}
          <div className="flex items-center space-x-2 px-3 py-1.5 bg-gray-800 rounded-lg">
            <span className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
            <span className={`text-xs font-medium ${connectionStatus === 'connected' ? 'text-green-400' : 'text-red-400'}`}>
              {connectionStatus === 'connected' ? 'Connected' : 'Disconnected'}
            </span>
          </div>

          {/* Auto-refresh Toggle */}
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-colors ${
              autoRefresh ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'
            }`}
          >
            <svg className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="text-xs font-medium">Auto</span>
          </button>
          
          {/* Manual Refresh Button */}
          <button
            onClick={fetchPods}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200"
          >
            <svg
              className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Namespace Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-2">Namespace</label>
          <select
            value={selectedNamespace}
            onChange={(e) => setSelectedNamespace(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Namespaces</option>
            {namespaces.map((ns) => (
              <option key={ns.name} value={ns.name}>
                {ns.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-2">Status</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            {uniqueStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        {/* Search Bar */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-2">Search</label>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search pods..."
              className="w-full px-3 py-2 pl-10 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-900/50 border border-red-500 rounded-lg">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-red-200">{error}</span>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && pods.length === 0 && (
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="text-gray-400">Loading pods...</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredPods.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <svg className="w-16 h-16 mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p className="text-lg font-medium mb-2">No pods found</p>
          <p className="text-sm">
            {searchQuery ? 'Try adjusting your search or filters' : 'No pods available in this namespace'}
          </p>
        </div>
      )}

      {/* Table */}
      {!loading && filteredPods.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Namespace
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Node
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Ready
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Restarts
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Age
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredPods.map((pod, index) => (
                <tr
                  key={pod.name + pod.namespace || index}
                  className="hover:bg-gray-800/50 transition-colors duration-150"
                >
                  <td className="px-4 py-4">
                    <div className="text-sm font-medium text-white truncate max-w-xs">
                      {pod.name || 'Unknown'}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-300">
                      {pod.namespace || 'default'}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        pod.status
                      )} text-white`}
                    >
                      <span className={`w-2 h-2 mr-1.5 rounded-full ${getStatusDotColor(pod.status)}`}></span>
                      {pod.status || 'Unknown'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-400 truncate max-w-xs">
                    {pod.nodeName || 'N/A'}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <span className="text-sm text-gray-300">
                      {pod.readyContainers !== undefined && pod.totalContainers !== undefined
                        ? `${pod.readyContainers}/${pod.totalContainers}`
                        : 'N/A'}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <span className={`text-sm font-medium ${pod.restartCount > 0 ? 'text-yellow-500' : 'text-gray-400'}`}>
                      {pod.restartCount !== undefined ? pod.restartCount : 'N/A'}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-400">
                    {pod.age || 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer Stats */}
      {!loading && filteredPods.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-800 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>Running: {pods.filter(p => p.status?.toLowerCase() === 'running').length}</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
              <span>Pending: {pods.filter(p => p.status?.toLowerCase() === 'pending').length}</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              <span>Failed: {pods.filter(p => p.status?.toLowerCase() === 'failed').length}</span>
            </div>
          </div>
          <div>
            {autoRefresh && 'Auto-refresh: 10s'}
            {!autoRefresh && 'Auto-refresh: Off'}
          </div>
        </div>
      )}
    </div>
  );
};

export default KubernetesPodDashboard;
