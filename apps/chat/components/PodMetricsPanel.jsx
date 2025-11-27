import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

const PodMetricsPanel = () => {
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedNamespace, setSelectedNamespace] = useState('all');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [chartType, setChartType] = useState('bar');

  // Fetch metrics
  const fetchMetrics = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const url = selectedNamespace === 'all' 
        ? 'http://localhost:8083/api/k8s/pods/metrics'
        : `http://localhost:8083/api/k8s/pods/metrics?namespace=${selectedNamespace}`;
      
      const response = await fetch(url);
      const result = await response.json();
      
      if (result.success) {
        setMetrics(result.data || []);
        setLastRefresh(new Date());
      } else {
        setError(result.message || 'Failed to fetch metrics');
        setMetrics([]);
      }
    } catch (err) {
      setError('Unable to connect to metrics service');
      setMetrics([]);
      console.error('Error fetching metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchMetrics();
  }, [selectedNamespace]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      fetchMetrics();
    }, 15000); // Refresh every 15 seconds
    
    return () => clearInterval(interval);
  }, [autoRefresh, selectedNamespace]);

  // Get unique namespaces from metrics
  const uniqueNamespaces = [...new Set(metrics.map(m => m.namespace).filter(Boolean))];

  // Calculate totals
  const totalCpu = metrics.reduce((sum, m) => sum + (m.cpuMillicores || 0), 0);
  const totalMemory = metrics.reduce((sum, m) => sum + (m.memoryMi || 0), 0);

  // Prepare chart data - top 10 pods by CPU
  const topCpuPods = [...metrics]
    .sort((a, b) => (b.cpuMillicores || 0) - (a.cpuMillicores || 0))
    .slice(0, 10)
    .map(m => ({
      name: m.name?.length > 20 ? m.name.substring(0, 20) + '...' : m.name,
      fullName: m.name,
      cpu: m.cpuMillicores || 0,
      memory: m.memoryMi || 0,
      namespace: m.namespace
    }));

  // Prepare chart data - top 10 pods by Memory
  const topMemoryPods = [...metrics]
    .sort((a, b) => (b.memoryMi || 0) - (a.memoryMi || 0))
    .slice(0, 10)
    .map(m => ({
      name: m.name?.length > 20 ? m.name.substring(0, 20) + '...' : m.name,
      fullName: m.name,
      cpu: m.cpuMillicores || 0,
      memory: m.memoryMi || 0,
      namespace: m.namespace
    }));

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-xl">
          <p className="text-white font-medium mb-2">{payload[0].payload.fullName}</p>
          <p className="text-gray-400 text-sm mb-1">Namespace: {payload[0].payload.namespace}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}{entry.name === 'cpu' ? 'm' : 'Mi'}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-gray-900 rounded-lg shadow-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Pod Metrics</h2>
          <p className="text-gray-400 text-sm">
            {metrics.length} pod{metrics.length !== 1 ? 's' : ''} monitored
            {lastRefresh && (
              <span className="ml-2">
                • Last updated: {lastRefresh.toLocaleTimeString()}
              </span>
            )}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
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
          
          {/* Manual Refresh */}
          <button
            onClick={fetchMetrics}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200"
          >
            <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

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
              <option key={ns} value={ns}>{ns}</option>
            ))}
          </select>
        </div>

        {/* Chart Type */}
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-2">Chart Type</label>
          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="bar">Bar Chart</option>
            <option value="line">Line Chart</option>
          </select>
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
      {loading && metrics.length === 0 && (
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="text-gray-400">Loading metrics...</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && metrics.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <svg className="w-16 h-16 mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-lg font-medium mb-2">No metrics available</p>
          <p className="text-sm">Metrics API may not be available or no pods are running</p>
        </div>
      )}

      {/* Summary Cards */}
      {!loading && metrics.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm font-medium">Total Pods</p>
                <p className="text-white text-3xl font-bold mt-1">{metrics.length}</p>
              </div>
              <svg className="w-12 h-12 text-blue-300 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm font-medium">Total CPU</p>
                <p className="text-white text-3xl font-bold mt-1">{totalCpu.toFixed(0)}m</p>
              </div>
              <svg className="w-12 h-12 text-purple-300 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-200 text-sm font-medium">Total Memory</p>
                <p className="text-white text-3xl font-bold mt-1">{totalMemory.toFixed(0)}Mi</p>
              </div>
              <svg className="w-12 h-12 text-green-300 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* Charts */}
      {!loading && metrics.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* CPU Chart */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-4 flex items-center">
              <span className="w-3 h-3 bg-purple-500 rounded-full mr-2"></span>
              Top 10 Pods by CPU Usage
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              {chartType === 'bar' ? (
                <BarChart data={topCpuPods}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} angle={-45} textAnchor="end" height={100} />
                  <YAxis stroke="#9CA3AF" fontSize={12} label={{ value: 'CPU (m)', angle: -90, position: 'insideLeft', style: { fill: '#9CA3AF' } }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="cpu" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                </BarChart>
              ) : (
                <LineChart data={topCpuPods}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} angle={-45} textAnchor="end" height={100} />
                  <YAxis stroke="#9CA3AF" fontSize={12} label={{ value: 'CPU (m)', angle: -90, position: 'insideLeft', style: { fill: '#9CA3AF' } }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="cpu" stroke="#8B5CF6" strokeWidth={2} dot={{ fill: '#8B5CF6', r: 4 }} />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* Memory Chart */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-white font-semibold mb-4 flex items-center">
              <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
              Top 10 Pods by Memory Usage
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              {chartType === 'bar' ? (
                <BarChart data={topMemoryPods}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} angle={-45} textAnchor="end" height={100} />
                  <YAxis stroke="#9CA3AF" fontSize={12} label={{ value: 'Memory (Mi)', angle: -90, position: 'insideLeft', style: { fill: '#9CA3AF' } }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="memory" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              ) : (
                <LineChart data={topMemoryPods}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} angle={-45} textAnchor="end" height={100} />
                  <YAxis stroke="#9CA3AF" fontSize={12} label={{ value: 'Memory (Mi)', angle: -90, position: 'insideLeft', style: { fill: '#9CA3AF' } }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="memory" stroke="#10B981" strokeWidth={2} dot={{ fill: '#10B981', r: 4 }} />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Metrics Table */}
      {!loading && metrics.length > 0 && (
        <div className="mt-6">
          <h3 className="text-white font-semibold mb-4">All Pod Metrics</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Pod Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Namespace</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">CPU</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Memory</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {metrics.map((metric, index) => (
                  <tr key={metric.name + metric.namespace || index} className="hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3 text-sm text-white truncate max-w-xs">{metric.name || 'Unknown'}</td>
                    <td className="px-4 py-3 text-sm text-gray-400">{metric.namespace || 'default'}</td>
                    <td className="px-4 py-3 text-sm text-right">
                      <span className="text-purple-400 font-medium">{metric.cpuFormatted || `${metric.cpuMillicores}m`}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      <span className="text-green-400 font-medium">{metric.memoryFormatted || `${metric.memoryMi}Mi`}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Footer */}
      {!loading && metrics.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-800 text-xs text-gray-500 text-center">
          {autoRefresh ? 'Auto-refresh: 15s' : 'Auto-refresh: Off'} • Showing top 10 pods per metric
        </div>
      )}
    </div>
  );
};

export default PodMetricsPanel;
