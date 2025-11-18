import React, { useEffect, useState } from 'react';

interface PodAlert {
  id: string;
  podName: string;
  namespace: string;
  status: string;
  timestamp: string;
  summary?: string;
  acknowledged: boolean;
}

const PodAlertsPanel: React.FC = () => {
  const [alerts, setAlerts] = useState<PodAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null);

  useEffect(() => {
    fetchAlerts();
    // Socket.IO connection is handled by useRealTimeK8s hook
    // Remove duplicate WebSocket connection
  }, []);

  const fetchAlerts = async () => {
    try {
      // TODO: Alerts API not yet implemented in Java backend
      // For now, use mock data or disable alerts
      console.warn('Alerts API not available in Java backend yet');
      setAlerts([]);
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const acknowledgeAlert = async (alertId: string) => {
    try {
      // TODO: Alerts API not yet implemented in Java backend
      console.warn('Acknowledge alert not available in Java backend yet');
      setAlerts(prev =>
        prev.map(alert =>
          alert.id === alertId ? { ...alert, acknowledged: true } : alert
        )
      );
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'failed':
        return 'bg-red-900/30 border-red-700 text-red-400';
      case 'unknown':
        return 'bg-yellow-900/30 border-yellow-700 text-yellow-400';
      case 'pending':
        return 'bg-orange-900/30 border-orange-700 text-orange-400';
      default:
        return 'bg-gray-900/30 border-gray-700 text-gray-400';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
          <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          Pod Alerts
        </h3>
        <span className="text-xs text-text-secondary">
          {alerts.filter(a => !a.acknowledged).length} unacknowledged
        </span>
      </div>

      {alerts.length === 0 ? (
        <div className="text-center py-8 text-text-secondary bg-background-panel rounded-lg border border-border-color">
          <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm">No alerts yet - All pods are healthy!</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-3 rounded-lg border transition-all ${
                alert.acknowledged
                  ? 'bg-background-panel border-border-color opacity-60'
                  : getStatusColor(alert.status)
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm truncate">
                      {alert.podName}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-black/20">
                      {alert.namespace}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="opacity-75">{formatTimestamp(alert.timestamp)}</span>
                    {alert.acknowledged && (
                      <span className="px-2 py-0.5 rounded bg-green-900/30 text-green-400 border border-green-700">
                        ✓ Acknowledged
                      </span>
                    )}
                  </div>

                  {expandedAlert === alert.id && alert.summary && (
                    <div className="mt-2 p-2 bg-black/30 rounded text-xs">
                      <div className="font-semibold mb-1">AI Analysis:</div>
                      <div className="whitespace-pre-wrap opacity-90">{alert.summary}</div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  {!alert.acknowledged && (
                    <button
                      onClick={() => acknowledgeAlert(alert.id)}
                      className="px-2 py-1 text-xs rounded bg-green-600 hover:bg-green-700 text-white transition-colors"
                      title="Acknowledge alert"
                    >
                      ✓
                    </button>
                  )}
                  {alert.summary && (
                    <button
                      onClick={() => setExpandedAlert(expandedAlert === alert.id ? null : alert.id)}
                      className="px-2 py-1 text-xs rounded bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
                      title={expandedAlert === alert.id ? 'Hide details' : 'Show details'}
                    >
                      {expandedAlert === alert.id ? '−' : '+'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

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

export default PodAlertsPanel;
