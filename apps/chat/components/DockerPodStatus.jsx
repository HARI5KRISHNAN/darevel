import React, { useState, useEffect } from 'react';

// Determine backend URL from Vite or CRA env, fallback to localhost:8083
const BACKEND_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_BACKEND_URL)
  ? import.meta.env.VITE_BACKEND_URL
  : (process.env.REACT_APP_BACKEND_URL || 'http://localhost:8083');

const DockerPodStatus = () => {
  const [containers, setContainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);

  const fetchContainers = async () => {
    setLoading(true);
    setError(null);
    
    try {
    const response = await fetch(`${BACKEND_URL}/api/docker/containers`);
      const result = await response.json();
      
      if (result.success) {
        setContainers(result.data || []);
        setLastRefresh(new Date());
      } else {
        setError(result.message || 'Failed to fetch containers');
      }
    } catch (err) {
      setError('Unable to connect to Docker service');
      console.error('Error fetching containers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContainers();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchContainers, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    if (!status) return 'bg-gray-300';
    const statusLower = status.toLowerCase();
    if (statusLower.includes('failed') || statusLower.includes('exited') || statusLower.includes('error')) return 'bg-status-red';
    if (statusLower.includes('running') || statusLower.includes('up')) return 'bg-status-green';
    return 'bg-gray-300';
  };

  const getStatusBadge = (status) => {
    if (!status) return 'bg-gray-200 text-text-primary';
    const statusLower = status.toLowerCase();
    if (statusLower.includes('failed') || statusLower.includes('exited') || statusLower.includes('error')) return 'bg-status-red text-white';
    if (statusLower.includes('running') || statusLower.includes('up')) return 'bg-status-green text-white';
    return 'bg-gray-200 text-text-primary';
  };

  const formatMemory = (bytes) => {
    if (!bytes || bytes === 0) return 'N/A';
    const mb = bytes / (1024 * 1024);
    if (mb < 1024) return `${mb.toFixed(1)} MB`;
    return `${(mb / 1024).toFixed(2)} GB`;
  };

  const formatCpu = (cpuPercent) => {
    if (cpuPercent === undefined || cpuPercent === null) return 'N/A';
    return `${cpuPercent.toFixed(1)}%`;
  };

  if (loading && containers.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="text-gray-400">Loading containers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background-panel rounded-lg shadow-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-text-primary mb-1">Docker Containers</h2>
          <p className="text-text-secondary text-sm">
            {containers.length} container{containers.length !== 1 ? 's' : ''} found
            {lastRefresh && (
              <span className="ml-2">
                • Last updated: {lastRefresh.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        
        <button
          onClick={fetchContainers}
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
        {/* Quick test button to log backend response */}
        <button
          onClick={async () => {
            try {
              const res = await fetch(`${BACKEND_URL}/api/docker/containers`);
              const body = await res.text();
              console.log('Test backend raw response (text):', body);
              try {
                console.log('Parsed JSON:', JSON.parse(body));
              } catch (e) {
                // not JSON
              }
            } catch (err) {
              console.error('Test backend fetch failed:', err);
              alert('Test fetch failed — see console for details');
            }
          }}
          className="ml-3 px-3 py-2 bg-background-panel/0 hover:bg-background-panel/5 text-text-primary rounded-lg border border-border-color"
        >
          Test Backend
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-900/10 border border-red-500 rounded-lg">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-red-600">{error}</span>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && containers.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center py-16 text-text-secondary">
          <svg className="w-16 h-16 mb-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p className="text-lg font-medium mb-2 text-text-primary">No containers found</p>
          <p className="text-sm text-text-secondary">Start a Docker container to see it here</p>
        </div>
      )}

      {/* Table */}
      {!loading && containers.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-color">
                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Container
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Image
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Created
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">
                  CPU
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Memory
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Restarts
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-color">
              {containers.map((container, index) => (
                <tr
                  key={container.id || index}
                  className="hover:bg-background-panel/5 transition-colors duration-150"
                >
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <div className="text-sm font-medium text-text-primary truncate max-w-xs">
                        {container.names && container.names.length > 0
                          ? container.names[0].replace(/^\//, '')
                          : container.id?.substring(0, 12) || 'Unknown'}
                      </div>
                      <div className="text-xs text-text-secondary font-mono">
                        {container.id?.substring(0, 12) || 'N/A'}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm text-text-secondary truncate max-w-xs">
                      {container.image || 'Unknown'}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(
                        container.status
                      )} text-white`}
                    >
                      <span className={`w-2 h-2 mr-1.5 rounded-full ${getStatusColor(container.status).replace('text-', 'bg-')}`}></span>
                      {container.status || 'Unknown'}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-text-secondary">
                    {container.created || 'N/A'}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-right text-text-secondary">
                    {formatCpu(container.cpuPercent)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-right text-text-secondary">
                    {formatMemory(container.memoryUsage)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-right">
                    <span className={`font-medium ${container.restartCount > 0 ? 'text-yellow-500' : 'text-text-secondary'}`}>
                      {container.restartCount !== undefined ? container.restartCount : 'N/A'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer Info */}
      {!loading && containers.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border-color flex items-center justify-between text-xs text-text-secondary">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>Running: {containers.filter(c => c.status?.toLowerCase().includes('running')).length}</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              <span>Stopped: {containers.filter(c => c.status?.toLowerCase().includes('exited')).length}</span>
            </div>
          </div>
          <div>Auto-refresh: 30s</div>
        </div>
      )}
    </div>
  );
};

export default DockerPodStatus;
