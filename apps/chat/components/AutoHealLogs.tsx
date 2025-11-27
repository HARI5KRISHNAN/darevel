import React, { useState, useEffect } from 'react';\nimport { io, Socket } from 'socket.io-client';\nimport { devLog } from '../utils/devLogger';

interface AutoHealingIncident {
  id: string;
  podName: string;
  namespace: string;
  containerName: string;
  restartCount: number;
  reason: string;
  message: string;
  exitCode?: number;
  detectedAt: string;
  healedAt?: string;
  aiSummary?: string;
  emailSent: boolean;
  status: 'detected' | 'healing' | 'healed' | 'failed';
}

interface IncidentStats {
  total: number;
  byStatus: Record<string, number>;
  bySeverity: Record<string, number>;
  byNamespace: Record<string, number>;
  avgMTTR: number;
}

const AutoHealLogs: React.FC = () => {
  const [incidents, setIncidents] = useState<AutoHealingIncident[]>([]);
  const [stats, setStats] = useState<IncidentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'critical' | 'high' | 'medium'>('all');
  const [namespaceFilter, setNamespaceFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connectedToSocket, setConnectedToSocket] = useState(false);

  // Fetch incidents from API
  const fetchIncidents = async () => {
    setLoading(true);
    try {
      const INCIDENTS_API_URL = import.meta.env.VITE_INCIDENTS_SERVICE_URL || 'http://localhost:8086';
      const response = await fetch(`${INCIDENTS_API_URL}/api/autoheal/incidents?limit=100`);
      const data = await response.json();

      if (data.success) {
        setIncidents(data.incidents || []);
        calculateStats(data.incidents || []);
      }
    } catch (error) {
      devError('Failed to fetch incidents:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const calculateStats = (incidentList: AutoHealingIncident[]) => {
    const byStatus: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};
    const byNamespace: Record<string, number> = {};
    let totalMTTR = 0;
    let mttrCount = 0;

    incidentList.forEach(incident => {
      // Status
      byStatus[incident.status] = (byStatus[incident.status] || 0) + 1;

      // Severity
      const severity = getSeverityFromReason(incident.reason);
      bySeverity[severity] = (bySeverity[severity] || 0) + 1;

      // Namespace
      byNamespace[incident.namespace] = (byNamespace[incident.namespace] || 0) + 1;

      // MTTR
      if (incident.healedAt && incident.detectedAt) {
        const mttr = (new Date(incident.healedAt).getTime() - new Date(incident.detectedAt).getTime()) / 1000;
        totalMTTR += mttr;
        mttrCount++;
      }
    });

    setStats({
      total: incidentList.length,
      byStatus,
      bySeverity,
      byNamespace,
      avgMTTR: mttrCount > 0 ? totalMTTR / mttrCount : 0
    });
  };

  // Setup Socket.IO for real-time updates
  useEffect(() => {
    const INCIDENTS_API_URL = import.meta.env.VITE_INCIDENTS_SERVICE_URL || 'http://localhost:8086';
    const newSocket = io(INCIDENTS_API_URL);

    newSocket.on('connect', () => {
      devLog('Connected to auto-heal socket');
      setConnectedToSocket(true);
    });

    newSocket.on('disconnect', () => {
      devLog('Disconnected from auto-heal socket');
      setConnectedToSocket(false);
    });

    // Listen for new incidents
    newSocket.on('autoheal_incident', (incident: AutoHealingIncident) => {
      console.log('Received new incident:', incident);
      setIncidents(prev => [incident, ...prev]);

      // Show notification
      if (Notification.permission === 'granted') {
        new Notification('🔄 Pod Restarted', {
          body: `${incident.podName} in ${incident.namespace} (${incident.reason})`,
          icon: '/favicon.ico'
        });
      }
    });

    setSocket(newSocket);

    // Request notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      newSocket.close();
    };
  }, []);

  // Initial load
  useEffect(() => {
    fetchIncidents();
  }, []);

  // Recalculate stats when incidents change
  useEffect(() => {
    if (incidents.length > 0) {
      calculateStats(incidents);
    }
  }, [incidents]);

  // Get severity from reason
  const getSeverityFromReason = (reason: string): string => {
    switch (reason) {
      case 'OOMKilled':
      case 'CrashLoopBackOff':
        return 'critical';
      case 'Error':
      case 'ContainerCannotRun':
        return 'high';
      case 'DeadlineExceeded':
      case 'Evicted':
        return 'medium';
      default:
        return 'warning';
    }
  };

  // Get severity color
  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'critical':
        return 'text-red-500 bg-red-50 border-red-200';
      case 'high':
        return 'text-orange-500 bg-orange-50 border-orange-200';
      case 'medium':
        return 'text-yellow-500 bg-yellow-50 border-yellow-200';
      default:
        return 'text-blue-500 bg-blue-50 border-blue-200';
    }
  };

  // Filter incidents
  const getFilteredIncidents = () => {
    return incidents.filter(incident => {
      const severity = getSeverityFromReason(incident.reason);

      // Severity filter
      if (filter !== 'all' && severity !== filter) {
        return false;
      }

      // Namespace filter
      if (namespaceFilter !== 'all' && incident.namespace !== namespaceFilter) {
        return false;
      }

      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          incident.podName.toLowerCase().includes(query) ||
          incident.namespace.toLowerCase().includes(query) ||
          incident.reason.toLowerCase().includes(query) ||
          incident.containerName.toLowerCase().includes(query)
        );
      }

      return true;
    });
  };

  const filteredIncidents = getFilteredIncidents();
  const uniqueNamespaces = Array.from(new Set(incidents.map(i => i.namespace)));

  // Format duration
  const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
    return `${Math.round(seconds / 3600)}h`;
  };

  return (
    <div className="w-full h-full bg-background-main overflow-auto">
      {/* Header */}
      <div className="bg-background-panel border-b border-border-color p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
              🔄 Auto-Heal Logs
              {connectedToSocket && (
                <span className="text-xs px-2 py-1 bg-green-500 text-white rounded-full">Live</span>
              )}
            </h1>
            <p className="text-sm text-text-secondary mt-1">
              Real-time pod restart detection with AI-powered incident analysis
            </p>
          </div>
          <button
            onClick={fetchIncidents}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4">
          <div className="bg-background-panel p-4 rounded-lg border border-border-color">
            <div className="flex items-center gap-2 text-text-secondary text-sm mb-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Total Incidents
            </div>
            <div className="text-3xl font-bold text-text-primary">{stats.total}</div>
          </div>

          <div className="bg-background-panel p-4 rounded-lg border border-border-color">
            <div className="flex items-center gap-2 text-text-secondary text-sm mb-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Avg MTTR
            </div>
            <div className="text-3xl font-bold text-text-primary">
              {formatDuration(stats.avgMTTR)}
            </div>
          </div>

          <div className="bg-background-panel p-4 rounded-lg border border-border-color">
            <div className="flex items-center gap-2 text-text-secondary text-sm mb-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Critical
            </div>
            <div className="text-3xl font-bold text-red-500">
              {stats.bySeverity.critical || 0}
            </div>
          </div>

          <div className="bg-background-panel p-4 rounded-lg border border-border-color">
            <div className="flex items-center gap-2 text-text-secondary text-sm mb-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Healed
            </div>
            <div className="text-3xl font-bold text-green-500">
              {stats.byStatus.healed || 0}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="p-4 bg-background-panel border-b border-border-color">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search pod name, namespace, reason..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-background-main text-text-primary px-4 py-2 rounded-lg border border-border-color focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Severity Filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="bg-background-main text-text-primary px-4 py-2 rounded-lg border border-border-color focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
          </select>

          {/* Namespace Filter */}
          <select
            value={namespaceFilter}
            onChange={(e) => setNamespaceFilter(e.target.value)}
            className="bg-background-main text-text-primary px-4 py-2 rounded-lg border border-border-color focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">All Namespaces</option>
            {uniqueNamespaces.map(ns => (
              <option key={ns} value={ns}>{ns}</option>
            ))}
          </select>

          <div className="text-sm text-text-secondary">
            Showing {filteredIncidents.length} of {incidents.length} incidents
          </div>
        </div>
      </div>

      {/* Incidents List */}
      <div className="p-4 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <svg className="animate-spin h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : filteredIncidents.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-text-secondary mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-text-secondary text-lg">
              {searchQuery || filter !== 'all' || namespaceFilter !== 'all'
                ? 'No incidents match your filters'
                : 'No incidents yet - all pods are healthy!'}
            </p>
          </div>
        ) : (
          filteredIncidents.map((incident) => {
            const severity = getSeverityFromReason(incident.reason);
            const severityColor = getSeverityColor(severity);

            return (
              <div
                key={incident.id}
                className="bg-background-panel border border-border-color rounded-lg overflow-hidden hover:border-indigo-500 transition-all"
              >
                {/* Header */}
                <div className="p-4 border-b border-border-color">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-text-primary">
                          {incident.podName}
                        </h3>
                        <span className={`text-xs px-2 py-1 rounded font-bold uppercase border ${severityColor}`}>
                          {severity}
                        </span>
                        {incident.status === 'healed' && (
                          <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded border border-green-200">
                            Healed
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-text-secondary">
                        <span>📍 {incident.namespace}</span>
                        <span>📦 {incident.containerName}</span>
                        <span>🔄 Restart #{incident.restartCount}</span>
                        <span>⚠️ {incident.reason}</span>
                        {incident.exitCode !== undefined && <span>❌ Exit {incident.exitCode}</span>}
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <div className="text-text-secondary">
                        {new Date(incident.detectedAt).toLocaleString()}
                      </div>
                      {incident.healedAt && (
                        <div className="text-green-500 font-medium">
                          MTTR: {formatDuration((new Date(incident.healedAt).getTime() - new Date(incident.detectedAt).getTime()) / 1000)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* AI Summary */}
                {incident.aiSummary && (
                  <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20">
                    <div className="flex items-start gap-2">
                      <span className="text-2xl">🤖</span>
                      <div className="flex-1">
                        <h4 className="font-semibold text-text-primary mb-2">AI Analysis</h4>
                        <div className="text-sm text-text-primary whitespace-pre-wrap">
                          {incident.aiSummary}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {incident.message && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border-t border-border-color">
                    <h4 className="font-semibold text-text-primary mb-2 text-sm">Error Message</h4>
                    <pre className="text-xs text-red-700 dark:text-red-300 font-mono whitespace-pre-wrap">
                      {incident.message}
                    </pre>
                  </div>
                )}

                {/* Footer */}
                <div className="p-3 bg-background-main border-t border-border-color flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-text-secondary">
                    {incident.emailSent && (
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Email sent
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-text-secondary">
                    ID: {incident.id.split('-').pop()}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AutoHealLogs;

