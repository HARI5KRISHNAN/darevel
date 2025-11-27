import React, { useState } from 'react';

const PodAlerts = ({ alerts = [] }) => {
  const [filterSeverity, setFilterSeverity] = useState('all');

  // Filter alerts by severity
  const filteredAlerts = alerts.filter(alert => {
    if (filterSeverity === 'all') return true;
    return alert.severity?.toLowerCase() === filterSeverity;
  });

  // Get severity color classes
  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'high':
        return 'bg-red-600 text-red-100 border-red-500';
      case 'medium':
        return 'bg-yellow-600 text-yellow-100 border-yellow-500';
      case 'low':
        return 'bg-blue-600 text-blue-100 border-blue-500';
      default:
        return 'bg-gray-600 text-gray-100 border-gray-500';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'high':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      case 'medium':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'low':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Unknown time';
    
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      
      return date.toLocaleDateString();
    } catch (e) {
      return timestamp;
    }
  };

  // Count alerts by severity
  const severityCounts = {
    high: alerts.filter(a => a.severity?.toLowerCase() === 'high').length,
    medium: alerts.filter(a => a.severity?.toLowerCase() === 'medium').length,
    low: alerts.filter(a => a.severity?.toLowerCase() === 'low').length,
  };

  return (
    <div className="bg-gray-900 rounded-lg shadow-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Pod Alerts</h2>
          <p className="text-gray-400 text-sm">
            {filteredAlerts.length} alert{filteredAlerts.length !== 1 ? 's' : ''}
            {filterSeverity !== 'all' && ` (${filterSeverity} severity)`}
          </p>
        </div>

        {/* Severity Filter */}
        {alerts.length > 0 && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setFilterSeverity('all')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filterSeverity === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              All ({alerts.length})
            </button>
            <button
              onClick={() => setFilterSeverity('high')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filterSeverity === 'high'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              High ({severityCounts.high})
            </button>
            <button
              onClick={() => setFilterSeverity('medium')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filterSeverity === 'medium'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Medium ({severityCounts.medium})
            </button>
            <button
              onClick={() => setFilterSeverity('low')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filterSeverity === 'low'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Low ({severityCounts.low})
            </button>
          </div>
        )}
      </div>

      {/* Empty State */}
      {filteredAlerts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <svg
            className="w-16 h-16 mb-4 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-lg font-medium mb-2">No alerts</p>
          <p className="text-sm">
            {filterSeverity === 'all'
              ? 'All systems are running normally'
              : `No ${filterSeverity} severity alerts at this time`}
          </p>
        </div>
      )}

      {/* Alerts List */}
      {filteredAlerts.length > 0 && (
        <div className="space-y-3">
          {filteredAlerts.map((alert, index) => (
            <div
              key={index}
              className={`border-l-4 rounded-r-lg p-4 bg-gray-800 hover:bg-gray-750 transition-colors ${getSeverityColor(
                alert.severity
              ).split(' ')[2]}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  {/* Severity Icon */}
                  <div
                    className={`flex-shrink-0 p-2 rounded-lg ${
                      getSeverityColor(alert.severity).split(' ')[0]
                    }`}
                  >
                    {getSeverityIcon(alert.severity)}
                  </div>

                  {/* Alert Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-white font-semibold text-base">
                        {alert.title || 'Untitled Alert'}
                      </h3>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(
                          alert.severity
                        )}`}
                      >
                        {alert.severity?.toUpperCase() || 'UNKNOWN'}
                      </span>
                    </div>

                    {alert.description && (
                      <p className="text-gray-300 text-sm mb-2 leading-relaxed">
                        {alert.description}
                      </p>
                    )}

                    <div className="flex items-center text-xs text-gray-500">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {formatTimestamp(alert.timestamp)}
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  className="ml-4 p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                  title="Dismiss alert"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Footer */}
      {alerts.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-800">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                <span>High: {severityCounts.high}</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                <span>Medium: {severityCounts.medium}</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>Low: {severityCounts.low}</span>
              </div>
            </div>
            <span>Total: {alerts.length} alerts</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PodAlerts;
