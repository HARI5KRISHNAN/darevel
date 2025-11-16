import React, { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import { addEmailRecord, getSuggestedRecipients } from '../utils/emailHistory';

interface Incident {
  id: string;
  podId: string;
  podName: string;
  namespace: string;
  status: string;
  timestamp: string;
  resolvedAt?: string;
  rootCauseAnalysis?: string;
  remediationSteps?: string[];
  affectedServices?: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  category?: string;
  tags?: string[];
  metadata: {
    restarts: number;
    age: number;
    cpuUsage?: number;
    memoryUsage?: number;
    previousStatus?: string;
  };
}

interface IncidentStats {
  total: number;
  byNamespace: Record<string, number>;
  byStatus: Record<string, number>;
  bySeverity: Record<string, number>;
  recentIncidents: Incident[];
  mttr: number;
  topFailingPods: { podName: string; count: number }[];
}

const IncidentDashboard: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [stats, setStats] = useState<IncidentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedIncident, setExpandedIncident] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'analytics'>('list');
  const [showRecipientSelector, setShowRecipientSelector] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState("");
  const [customRecipient, setCustomRecipient] = useState("");
  const [suggestedRecipients, setSuggestedRecipients] = useState<string[]>([]);
  const [subjectSuggestions, setSubjectSuggestions] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState(`Kubernetes Analytics Report - ${new Date().toLocaleDateString()}`);
  const [loadingSubject, setLoadingSubject] = useState(false);

  // TODO: Incidents API not implemented in Java backend yet
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8082';

  useEffect(() => {
    fetchIncidents();
    fetchStats();

    // Load suggested recipients from history
    const suggested = getSuggestedRecipients();
    setSuggestedRecipients(suggested);

    // Listen for real-time incident creation via Socket.IO
    const socket = new WebSocket(`ws://${BACKEND_URL.replace('http://', '')}`);

    socket.addEventListener('message', (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'incident_created') {
          setIncidents(prev => [data.incident, ...prev]);
          // Refresh stats when new incident arrives
          fetchStats();
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    });

    return () => {
      socket.close();
    };
  }, []);

  const fetchIncidents = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/incidents?limit=100`);
      const data = await response.json();
      setIncidents(data.incidents || []);
    } catch (error) {
      console.error('Failed to fetch incidents:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/incidents/stats`);
      const data = await response.json();
      setStats(data.stats);
    } catch (error) {
      console.error('Failed to fetch incident stats:', error);
    }
  };

  const resolveIncident = async (incidentId: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/incidents/${incidentId}/resolve`, {
        method: 'POST',
      });

      if (response.ok) {
        setIncidents(prev =>
          prev.map(incident =>
            incident.id === incidentId
              ? { ...incident, resolvedAt: new Date().toISOString() }
              : incident
          )
        );
        // Refresh stats after resolving
        fetchStats();
      }
    } catch (error) {
      console.error('Failed to resolve incident:', error);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-900/40 border-red-600 text-red-300';
      case 'high':
        return 'bg-orange-900/40 border-orange-600 text-orange-300';
      case 'medium':
        return 'bg-yellow-900/40 border-yellow-600 text-yellow-300';
      case 'low':
        return 'bg-blue-900/40 border-blue-600 text-blue-300';
      default:
        return 'bg-gray-900/40 border-gray-600 text-gray-300';
    }
  };

  const getSeverityBadge = (severity: string) => {
    const colors = {
      critical: 'bg-red-600 text-white',
      high: 'bg-orange-500 text-white',
      medium: 'bg-yellow-500 text-black',
      low: 'bg-blue-500 text-white'
    };
    return colors[severity as keyof typeof colors] || 'bg-gray-500 text-white';
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const formatDuration = (startTime: string, endTime?: string) => {
    const start = new Date(startTime).getTime();
    const end = endTime ? new Date(endTime).getTime() : Date.now();
    const diffMs = end - start;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 60) return `${diffMins}m`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ${diffMins % 60}m`;
    return `${Math.floor(diffMins / 1440)}d ${Math.floor((diffMins % 1440) / 60)}h`;
  };

  const exportToJSON = () => {
    const dataStr = JSON.stringify(incidents, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `incidents_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    let yPosition = 20;

    // Title
    doc.setFontSize(18);
    doc.text('Incident Report', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, yPosition);
    yPosition += 15;

    // Statistics
    if (stats) {
      doc.setFontSize(14);
      doc.text('Statistics', 20, yPosition);
      yPosition += 8;

      doc.setFontSize(10);
      doc.text(`Total Incidents: ${stats.total}`, 20, yPosition);
      yPosition += 6;
      doc.text(`Mean Time To Recovery: ${Math.round(stats.mttr / 60)} minutes`, 20, yPosition);
      yPosition += 10;
    }

    // Incidents
    doc.setFontSize(14);
    doc.text('Recent Incidents', 20, yPosition);
    yPosition += 8;

    incidents.slice(0, 20).forEach((incident, index) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(`${index + 1}. ${incident.podName} (${incident.severity.toUpperCase()})`, 20, yPosition);
      yPosition += 6;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(`Namespace: ${incident.namespace} | Time: ${formatTimestamp(incident.timestamp)}`, 25, yPosition);
      yPosition += 5;

      if (incident.rootCauseAnalysis) {
        const lines = doc.splitTextToSize(incident.rootCauseAnalysis, 160);
        doc.text(lines.slice(0, 3), 25, yPosition);
        yPosition += (Math.min(lines.length, 3) * 5);
      }

      yPosition += 5;
    });

    doc.save(`incident_report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const fetchSubjectSuggestions = async () => {
    if (!stats) return;

    setLoadingSubject(true);
    try {
      // Create content for AI to analyze
      const content = `
Kubernetes Analytics Report
Total Incidents: ${stats.total}
Mean Time to Recovery: ${Math.round(stats.mttr / 60)} minutes
Active Incidents: ${incidents.filter(i => i.status === 'active').length}
Severity: Critical: ${stats.bySeverity.critical || 0}, High: ${stats.bySeverity.high || 0}
Top Failing Pods: ${stats.topFailingPods.slice(0, 3).map(p => p.podName).join(', ')}
`;

      const response = await fetch(`${BACKEND_URL}/api/email/suggest-subject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          type: 'analytics'
        })
      });

      const result = await response.json();
      if (result.success && result.suggestions) {
        setSubjectSuggestions(result.suggestions);
        // Set first suggestion as selected by default
        if (result.suggestions.length > 0) {
          setSelectedSubject(result.suggestions[0]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch subject suggestions:', error);
    } finally {
      setLoadingSubject(false);
    }
  };

  const emailAnalyticsReport = async () => {
    if (!stats) {
      alert('No analytics data available');
      return;
    }

    // Fetch AI subject suggestions before showing recipient selector
    await fetchSubjectSuggestions();

    // Show recipient selector
    setShowRecipientSelector(true);
  };

  const sendAnalyticsEmail = async () => {
    if (!stats) return;

    const recipient = customRecipient.trim() || selectedRecipient;
    const emailList = recipient ? recipient.split(',').map(e => e.trim()).filter(e => e) : undefined;
    const subject = selectedSubject; // Use AI-suggested or selected subject

    // Create formatted content for email history
    const emailContent = `
Kubernetes Analytics Report
Date: ${new Date().toLocaleString()}

SUMMARY STATISTICS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Incidents: ${stats.total}
Mean Time to Recovery: ${Math.round(stats.mttr / 60)} minutes
Active Incidents: ${incidents.filter(i => i.status === 'active').length}

SEVERITY BREAKDOWN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Critical: ${stats.bySeverity.critical || 0}
High: ${stats.bySeverity.high || 0}
Medium: ${stats.bySeverity.medium || 0}
Low: ${stats.bySeverity.low || 0}

TOP FAILING PODS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${stats.topFailingPods.map((pod, i) => `${i + 1}. ${pod.podName}: ${pod.count} incidents`).join('\n')}
`;

    try {
      const response = await fetch(`${BACKEND_URL}/api/email/send-analytics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stats: {
            totalIncidents: stats.total,
            mttr: stats.mttr,
            topFailingPods: stats.topFailingPods,
            severityBreakdown: stats.bySeverity
          },
          recipients: emailList
        })
      });

      const result = await response.json();

      if (result.success) {
        // Record successful email
        addEmailRecord({
          to: emailList || ['default'],
          subject,
          snippet: `Total: ${stats.total}, MTTR: ${Math.round(stats.mttr / 60)}m`,
          content: emailContent, // Store full content for resending
          type: 'analytics',
          status: 'sent'
        });

        alert('✅ Analytics report sent successfully via email!');
        setShowRecipientSelector(false);
        setCustomRecipient('');

        // Refresh suggested recipients
        const suggested = getSuggestedRecipients();
        setSuggestedRecipients(suggested);
      } else {
        // Record failed email
        addEmailRecord({
          to: emailList || ['default'],
          subject,
          snippet: `Total: ${stats.total}, MTTR: ${Math.round(stats.mttr / 60)}m`,
          content: emailContent, // Store full content for resending
          type: 'analytics',
          status: 'failed',
          error: result.message || 'Email service may not be configured'
        });

        alert('❌ Failed to send report: ' + (result.message || 'Email service may not be configured'));
      }
    } catch (error: any) {
      console.error('Error sending analytics email:', error);

      // Record failed email
      addEmailRecord({
        to: emailList || ['default'],
        subject,
        snippet: `Total: ${stats.total}, MTTR: ${Math.round(stats.mttr / 60)}m`,
        content: emailContent, // Store full content for resending
        type: 'analytics',
        status: 'failed',
        error: error.message || 'Network error'
      });

      alert('❌ Failed to send analytics report. Please check your backend and email service configuration.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-text-primary flex items-center gap-2">
          <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Incident Dashboard
        </h2>

        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex bg-background-panel rounded-lg border border-border-color">
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-indigo-600 text-white'
                  : 'text-text-secondary hover:text-text-primary'
              } rounded-l-lg`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode('analytics')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                viewMode === 'analytics'
                  ? 'bg-indigo-600 text-white'
                  : 'text-text-secondary hover:text-text-primary'
              } rounded-r-lg`}
            >
              Analytics
            </button>
          </div>

          {/* Export Buttons */}
          <button
            onClick={emailAnalyticsReport}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
            title="Email Analytics Report"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Email
          </button>
          <button
            onClick={exportToJSON}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
            title="Export as JSON"
          >
            JSON
          </button>
          <button
            onClick={exportToPDF}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
            title="Export as PDF"
          >
            PDF
          </button>
        </div>
      </div>

      {/* Recipient Selector Modal */}
      {showRecipientSelector && (
        <div className="p-4 bg-background-panel rounded-lg border border-purple-600 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
              <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Send Analytics Report via Email
            </h3>
            <button
              onClick={() => setShowRecipientSelector(false)}
              className="text-text-secondary hover:text-text-primary transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-3">
            {/* AI Subject Line Suggestions */}
            <div>
              <label className="text-xs font-medium text-text-secondary mb-1 block flex items-center gap-2">
                <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Email Subject {loadingSubject && <span className="text-xs text-gray-500">(AI suggesting...)</span>}
              </label>
              {loadingSubject ? (
                <div className="flex items-center gap-2 p-2 bg-background-main rounded border border-border-color">
                  <svg className="animate-spin h-4 w-4 text-purple-400" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-sm text-text-secondary">Generating subject suggestions...</span>
                </div>
              ) : (
                <div className="space-y-2">
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full bg-background-main text-text-primary p-2 rounded border border-border-color focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm"
                  >
                    {subjectSuggestions.length === 0 && (
                      <option value={selectedSubject}>{selectedSubject}</option>
                    )}
                    {subjectSuggestions.map((suggestion, idx) => (
                      <option key={idx} value={suggestion}>
                        {suggestion}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-text-secondary">
                    {subjectSuggestions.length > 0 ? '✨ AI-generated suggestions' : 'Default subject line'}
                  </p>
                </div>
              )}
            </div>

            {/* Suggested Recipients Dropdown */}
            {suggestedRecipients.length > 0 && (
              <div>
                <label className="text-xs font-medium text-text-secondary mb-1 block">
                  Select from recent recipients:
                </label>
                <select
                  value={selectedRecipient}
                  onChange={(e) => {
                    setSelectedRecipient(e.target.value);
                    setCustomRecipient('');
                  }}
                  className="w-full bg-background-main text-text-primary p-2 rounded border border-border-color focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm"
                >
                  <option value="">-- Select Recipient --</option>
                  {suggestedRecipients.map((email) => (
                    <option key={email} value={email}>
                      {email}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Custom Email Input */}
            <div>
              <label className="text-xs font-medium text-text-secondary mb-1 block">
                Or enter email address{suggestedRecipients.length > 0 ? ' manually' : ''}:
              </label>
              <input
                type="email"
                placeholder="email@example.com or leave blank for default"
                value={customRecipient}
                onChange={(e) => {
                  setCustomRecipient(e.target.value);
                  setSelectedRecipient('');
                }}
                className="w-full bg-background-main text-text-primary p-2 rounded border border-border-color focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm placeholder-text-secondary"
              />
              <p className="text-xs text-text-secondary mt-1">
                Separate multiple emails with commas
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={sendAnalyticsEmail}
                className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded transition-all"
              >
                Send Email
              </button>
              <button
                onClick={() => {
                  setShowRecipientSelector(false);
                  setCustomRecipient('');
                  setSelectedRecipient('');
                }}
                className="px-4 py-2 bg-background-main hover:bg-background-panel text-text-primary text-sm font-medium rounded border border-border-color transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Analytics View */}
      {viewMode === 'analytics' && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Overview Stats */}
          <div className="bg-background-panel p-4 rounded-lg border border-border-color">
            <h3 className="text-lg font-semibold text-text-primary mb-3">Overview</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-text-secondary">Total Incidents:</span>
                <span className="font-bold text-text-primary">{stats.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">MTTR:</span>
                <span className="font-bold text-text-primary">{Math.round(stats.mttr / 60)}m</span>
              </div>
            </div>
          </div>

          {/* By Severity */}
          <div className="bg-background-panel p-4 rounded-lg border border-border-color">
            <h3 className="text-lg font-semibold text-text-primary mb-3">By Severity</h3>
            <div className="space-y-2">
              {Object.entries(stats.bySeverity).map(([severity, count]) => (
                <div key={severity} className="flex justify-between items-center">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityBadge(severity)}`}>
                    {severity.toUpperCase()}
                  </span>
                  <span className="font-bold text-text-primary">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* By Namespace */}
          <div className="bg-background-panel p-4 rounded-lg border border-border-color">
            <h3 className="text-lg font-semibold text-text-primary mb-3">By Namespace</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
              {Object.entries(stats.byNamespace).map(([namespace, count]) => (
                <div key={namespace} className="flex justify-between">
                  <span className="text-text-secondary truncate">{namespace}</span>
                  <span className="font-bold text-text-primary ml-2">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Failing Pods */}
          <div className="bg-background-panel p-4 rounded-lg border border-border-color md:col-span-2 lg:col-span-3">
            <h3 className="text-lg font-semibold text-text-primary mb-3">Top Failing Pods</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {stats.topFailingPods.map((pod, index) => (
                <div
                  key={pod.podName}
                  className="flex items-center gap-3 bg-background-primary p-3 rounded-lg border border-border-color"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-600 text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-text-primary truncate">{pod.podName}</div>
                    <div className="text-xs text-text-secondary">{pod.count} incidents</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="space-y-3">
          {incidents.length === 0 ? (
            <div className="text-center py-12 bg-background-panel rounded-lg border border-border-color">
              <svg className="w-16 h-16 mx-auto mb-4 text-text-secondary opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-text-secondary text-lg">No incidents recorded yet</p>
              <p className="text-text-secondary text-sm mt-2">Your pods are running smoothly</p>
            </div>
          ) : (
            incidents.map((incident) => (
              <div
                key={incident.id}
                className={`p-4 rounded-lg border transition-all ${
                  incident.resolvedAt
                    ? 'bg-background-panel border-border-color opacity-70'
                    : getSeverityColor(incident.severity)
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="font-bold text-lg truncate">{incident.podName}</span>
                      <span className={`px-2 py-1 rounded text-xs font-bold ${getSeverityBadge(incident.severity)}`}>
                        {incident.severity.toUpperCase()}
                      </span>
                      <span className="px-2 py-1 rounded bg-black/30 text-xs">
                        {incident.namespace}
                      </span>
                      {incident.category && (
                        <span className="px-2 py-1 rounded bg-purple-600 text-white text-xs">
                          {incident.category}
                        </span>
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="flex items-center gap-4 text-xs text-text-secondary mb-2">
                      <span>{formatTimestamp(incident.timestamp)}</span>
                      {incident.resolvedAt ? (
                        <span className="text-green-400 font-medium">
                          ✓ Resolved in {formatDuration(incident.timestamp, incident.resolvedAt)}
                        </span>
                      ) : (
                        <span className="text-orange-400">
                          Active for {formatDuration(incident.timestamp)}
                        </span>
                      )}
                      <span>Restarts: {incident.metadata.restarts}</span>
                    </div>

                    {/* Root Cause Analysis (Expandable) */}
                    {expandedIncident === incident.id && incident.rootCauseAnalysis && (
                      <div className="mt-3 space-y-3">
                        <div className="p-3 bg-black/30 rounded-lg">
                          <div className="font-semibold mb-2 text-sm">Root Cause Analysis:</div>
                          <div className="text-sm whitespace-pre-wrap opacity-90">
                            {incident.rootCauseAnalysis}
                          </div>
                        </div>

                        {incident.remediationSteps && incident.remediationSteps.length > 0 && (
                          <div className="p-3 bg-indigo-900/30 rounded-lg">
                            <div className="font-semibold mb-2 text-sm">Remediation Steps:</div>
                            <ol className="text-sm space-y-1 list-decimal list-inside opacity-90">
                              {incident.remediationSteps.map((step, idx) => (
                                <li key={idx}>{step}</li>
                              ))}
                            </ol>
                          </div>
                        )}

                        {/* Metadata Details */}
                        <div className="p-3 bg-gray-900/30 rounded-lg">
                          <div className="font-semibold mb-2 text-sm">Technical Details:</div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>Status: {incident.status}</div>
                            <div>Age: {Math.floor(incident.metadata.age / 60)}m</div>
                            {incident.metadata.cpuUsage && (
                              <div>CPU: {incident.metadata.cpuUsage}%</div>
                            )}
                            {incident.metadata.memoryUsage && (
                              <div>Memory: {incident.metadata.memoryUsage.toFixed(0)}Mi</div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    {!incident.resolvedAt && (
                      <button
                        onClick={() => resolveIncident(incident.id)}
                        className="px-3 py-1.5 text-xs rounded bg-green-600 hover:bg-green-700 text-white transition-colors whitespace-nowrap"
                        title="Mark as resolved"
                      >
                        Resolve
                      </button>
                    )}
                    {incident.rootCauseAnalysis && (
                      <button
                        onClick={() => setExpandedIncident(expandedIncident === incident.id ? null : incident.id)}
                        className="px-3 py-1.5 text-xs rounded bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
                        title={expandedIncident === incident.id ? 'Hide details' : 'Show details'}
                      >
                        {expandedIncident === incident.id ? 'Hide' : 'Details'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
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

export default IncidentDashboard;
