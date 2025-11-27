import React, { useState, useEffect } from 'react';

const OpenShiftPodDashboard = () => {
  const [pods, setPods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  
  // Filters
  const [selectedNamespace, setSelectedNamespace] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [expandedPod, setExpandedPod] = useState(null);

  // Fetch connection status
  const fetchConnectionStatus = async () => {
    try {
      const response = await fetch('http://localhost:8083/api/connection-status');
      const data = await response.json();
      setConnectionStatus(data.openshift === 'connected' ? 'connected' : 'disconnected');
    } catch (err) {
      setConnectionStatus('disconnected');
    }
  };

  // Fetch pods
  const fetchPods = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const url = selectedNamespace === 'all' 
        ? 'http://localhost:8083/api/openshift/pods'
        : `http://localhost:8083/api/openshift/pods?namespace=${selectedNamespace}`;
      
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
      setError('Unable to connect to OpenShift service');
      setPods([]);
      console.error('Error fetching pods:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchConnectionStatus();
    fetchPods();
  }, []);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      fetchConnectionStatus();
      fetchPods();
    }, 10000); // Refresh every 10 seconds
    
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
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        pod.name?.toLowerCase().includes(query) ||
        pod.namespace?.toLowerCase().includes(query) ||
        Object.values(pod.labels || {}).some(v => v.toLowerCase().includes(query))
      );
    }
    return true;
  });

  // Get unique namespaces
  const uniqueNamespaces = [...new Set(pods.map(p => p.namespace).filter(Boolean))];

  // Get health status based on phase and restarts
  const getHealthStatus = (pod) => {
    if (!pod.phase) return 'unknown';
    
    const phase = pod.phase.toLowerCase();
    const restarts = pod.restarts || 0;
    
    if (phase === 'running' && restarts === 0) return 'healthy';
    if (phase === 'running' && restarts > 0 && restarts < 5) return 'warning';
    if (phase === 'running' && restarts >= 5) return 'critical';
    if (phase === 'pending') return 'warning';
    if (phase === 'failed' || phase === 'error') return 'critical';
    if (phase === 'succeeded') return 'healthy';
    
    return 'unknown';
  };

  const getHealthColor = (health) => {
    switch (health) {
      case 'healthy': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getHealthBadge = (health) => {
    switch (health) {
      case 'healthy': return 'bg-green-600 text-green-100';
      case 'warning': return 'bg-yellow-600 text-yellow-100';
      case 'critical': return 'bg-red-600 text-red-100';
      default: return 'bg-gray-600 text-gray-100';
    }
  };

  const getHealthIcon = (health) => {
    switch (health) {
      case 'healthy':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'critical':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  // Count health statuses
  const healthCounts = {
    healthy: pods.filter(p => getHealthStatus(p) === 'healthy').length,
    warning: pods.filter(p => getHealthStatus(p) === 'warning').length,
    critical: pods.filter(p => getHealthStatus(p) === 'critical').length,
  };

  return (
    <div className="bg-gray-900 rounded-lg shadow-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">OpenShift Pods</h2>
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

      {/* Health Summary Cards */}
      {!loading && pods.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-200 text-sm font-medium">Healthy</p>
                <p className="text-white text-3xl font-bold mt-1">{healthCounts.healthy}</p>
              </div>
              <svg className="w-12 h-12 text-green-300 opacity-50" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-600 to-yellow-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-200 text-sm font-medium">Warning</p>
                <p className="text-white text-3xl font-bold mt-1">{healthCounts.warning}</p>
              </div>
              <svg className="w-12 h-12 text-yellow-300 opacity-50" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-200 text-sm font-medium">Critical</p>
                <p className="text-white text-3xl font-bold mt-1">{healthCounts.critical}</p>
              </div>
              <svg className="w-12 h-12 text-red-300 opacity-50" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Namespace Filter */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-2">Namespace</label>
          <select
            value={selectedNamespace}
            onChange={(e) => setSelectedNamespace(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Namespaces</option>
            {uniqueNamespaces.map((ns) => (
              <option key={ns} value={ns}>
                {ns}
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
              placeholder="Search pods or labels..."
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
            {searchQuery ? 'Try adjusting your search' : 'No pods available in this namespace'}
          </p>
        </div>
      )}

      {/* Pods Grid */}
      {!loading && filteredPods.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredPods.map((pod, index) => {
            const health = getHealthStatus(pod);
            const isExpanded = expandedPod === pod.name + pod.namespace;
            
            return (
              <div
                key={pod.name + pod.namespace || index}
                className="bg-gray-800 rounded-lg p-4 hover:bg-gray-750 transition-colors cursor-pointer"
                onClick={() => setExpandedPod(isExpanded ? null : pod.name + pod.namespace)}
              >
                {/* Pod Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-white font-semibold truncate">
                        {pod.name || 'Unknown'}
                      </h3>
                      <span className={`flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-medium ${getHealthBadge(health)}`}>
                        {getHealthIcon(health)}
                        <span className="ml-1">{health}</span>
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm">
                      Namespace: <span className="text-blue-400">{pod.namespace || 'default'}</span>
                    </p>
                  </div>
                  
                  <div className={`w-3 h-3 rounded-full ${getHealthColor(health)} animate-pulse`}></div>
                </div>

                {/* Pod Details Grid */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="bg-gray-900 rounded p-2">
                    <p className="text-gray-500 text-xs mb-1">Phase</p>
                    <p className="text-white text-sm font-medium">{pod.phase || 'Unknown'}</p>
                  </div>
                  
                  <div className="bg-gray-900 rounded p-2">
                    <p className="text-gray-500 text-xs mb-1">Restarts</p>
                    <p className={`text-sm font-medium ${pod.restarts > 0 ? 'text-yellow-400' : 'text-white'}`}>
                      {pod.restarts !== undefined ? pod.restarts : 'N/A'}
                    </p>
                  </div>
                  
                  <div className="bg-gray-900 rounded p-2">
                    <p className="text-gray-500 text-xs mb-1">Age</p>
                    <p className="text-white text-sm font-medium">{pod.age || 'Unknown'}</p>
                  </div>
                  
                  <div className="bg-gray-900 rounded p-2">
                    <p className="text-gray-500 text-xs mb-1">Labels</p>
                    <p className="text-white text-sm font-medium">
                      {pod.labels ? Object.keys(pod.labels).length : 0}
                    </p>
                  </div>
                </div>

                {/* Expanded Labels Section */}
                {isExpanded && pod.labels && Object.keys(pod.labels).length > 0 && (
                  <div className="border-t border-gray-700 pt-3 mt-3">
                    <p className="text-gray-400 text-xs font-medium mb-2">Labels:</p>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(pod.labels).map(([key, value]) => (
                        <span
                          key={key}
                          className="px-2 py-1 bg-gray-900 border border-gray-700 rounded text-xs text-gray-300"
                        >
                          <span className="text-blue-400">{key}</span>
                          <span className="text-gray-500 mx-1">=</span>
                          <span className="text-green-400">{value}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Expand Indicator */}
                {pod.labels && Object.keys(pod.labels).length > 0 && (
                  <div className="flex items-center justify-center mt-2">
                    <svg
                      className={`w-4 h-4 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Footer */}
      {!loading && filteredPods.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-800 text-xs text-gray-500 text-center">
          {autoRefresh ? 'Auto-refresh: 10s' : 'Auto-refresh: Off'} • Click pods to view labels
        </div>
      )}
    </div>
  );
};

export default OpenShiftPodDashboard;
