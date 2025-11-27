import React, { useState, useEffect } from 'react';
import { getEmailHistory, clearEmailHistory, formatRecipients, getEmailStats, EmailRecord } from '../utils/emailHistory';
import { devError } from '../utils/devLogger';

const EmailHistory: React.FC = () => {
  const [history, setHistory] = useState<EmailRecord[]>([]);
  const [stats, setStats] = useState<ReturnType<typeof getEmailStats> | null>(null);
  const [expandedEmail, setExpandedEmail] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'summary' | 'incident' | 'analytics'>('all');
  const [selectedEmail, setSelectedEmail] = useState<EmailRecord | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [resending, setResending] = useState(false);
  const [subjectSuggestions, setSubjectSuggestions] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [loadingSubject, setLoadingSubject] = useState(false);

  useEffect(() => {
    loadHistory();

    // Listen for storage events to sync across tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'whooper_email_history') {
        loadHistory();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const loadHistory = () => {
    const emailHistory = getEmailHistory();
    setHistory(emailHistory);
    setStats(getEmailStats());
  };

  const handleClearHistory = () => {
    if (confirm('Are you sure you want to clear all email history?')) {
      clearEmailHistory();
      loadHistory();
    }
  };

  const handleResendEmail = async () => {
    if (!selectedEmail) return;

    setResending(true);
    try {
      const EMAIL_API_URL = import.meta.env.VITE_EMAIL_SERVICE_URL || 'http://localhost:8088';
      const response = await fetch(`${EMAIL_API_URL}/api/email/send-summary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: selectedEmail.to,
          subject: selectedSubject || selectedEmail.subject, // Use selected or original subject
          content: selectedEmail.content || selectedEmail.snippet,
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert('Email resent successfully!');
        setShowEmailModal(false);
      } else {
        alert(`Failed to resend email: ${result.message}`);
      }
    } catch (error) {
      devError('Error resending email:', error);
      alert('Failed to resend email. Please try again.');
    } finally {
      setResending(false);
    }
  };

  const fetchSubjectSuggestions = async (content: string, type: string) => {
    setLoadingSubject(true);
    try {
      const EMAIL_API_URL = import.meta.env.VITE_EMAIL_SERVICE_URL || 'http://localhost:8088';
      const response = await fetch(`${EMAIL_API_URL}/api/email/suggest-subject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: content.slice(0, 500), // Use first 500 chars for context
          type
        }),
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
      devError('Failed to fetch subject suggestions:', error);
    } finally {
      setLoadingSubject(false);
    }
  };

  const handleEmailClick = async (email: EmailRecord, e: React.MouseEvent) => {
    // Prevent opening modal if clicking on the expand toggle area
    if ((e.target as HTMLElement).closest('.email-expand-area')) {
      return;
    }
    setSelectedEmail(email);
    setSelectedSubject(email.subject); // Initialize with original subject
    setShowEmailModal(true);

    // Fetch AI suggestions for alternative subjects
    if (email.content || email.snippet) {
      await fetchSubjectSuggestions(
        email.content || email.snippet,
        email.type
      );
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'summary':
        return '📝';
      case 'incident':
        return '🚨';
      case 'analytics':
        return '📊';
      default:
        return '✉️';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'sent' ? 'text-green-400' : 'text-red-400';
  };

  const getStatusIcon = (status: string) => {
    return status === 'sent' ? '✓' : '✗';
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    if (diffMins < 10080) return `${Math.floor(diffMins / 1440)}d ago`;
    return date.toLocaleDateString();
  };

  const filteredHistory = filter === 'all'
    ? history
    : history.filter(email => email.type === filter);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold text-text-secondary uppercase tracking-wider">
          📧 Email History
        </h2>
        {history.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="text-xs text-text-secondary hover:text-red-400 transition-colors"
            title="Clear all history"
          >
            Clear
          </button>
        )}
      </div>

      {/* Statistics */}
      {stats && stats.total > 0 && (
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-background-panel p-2 rounded-lg border border-border-color">
            <div className="text-lg font-bold text-text-primary">{stats.total}</div>
            <div className="text-xs text-text-secondary">Total</div>
          </div>
          <div className="bg-background-panel p-2 rounded-lg border border-border-color">
            <div className="text-lg font-bold text-green-400">{stats.sent}</div>
            <div className="text-xs text-text-secondary">Sent</div>
          </div>
          <div className="bg-background-panel p-2 rounded-lg border border-border-color">
            <div className="text-lg font-bold text-red-400">{stats.failed}</div>
            <div className="text-xs text-text-secondary">Failed</div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      {history.length > 0 && (
        <div className="flex gap-1 bg-background-panel rounded-lg p-1 border border-border-color">
          {(['all', 'summary', 'incident', 'analytics'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`flex-1 px-2 py-1.5 text-xs font-medium rounded transition-colors ${
                filter === type
                  ? 'bg-indigo-600 text-white'
                  : 'text-text-secondary hover:text-text-primary hover:bg-background-main'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      )}

      {/* Email List */}
      <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
        {filteredHistory.length === 0 ? (
          <div className="text-center py-8 text-text-secondary">
            <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <p className="text-sm">
              {filter === 'all' ? 'No emails sent yet' : `No ${filter} emails sent yet`}
            </p>
          </div>
        ) : (
          filteredHistory.map((email) => (
            <div
              key={email.id}
              className="bg-background-panel p-3 rounded-lg border border-border-color hover:border-indigo-600/50 transition-all cursor-pointer"
              onClick={(e) => handleEmailClick(email, e)}
            >
              {/* Email Header */}
              <div className="flex items-start gap-2">
                <span className="text-xl flex-shrink-0">{getTypeIcon(email.type)}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-text-primary truncate">
                      {email.subject}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold ${getStatusColor(email.status)}`}>
                        {getStatusIcon(email.status)}
                      </span>
                      <button
                        className="email-expand-area text-text-secondary hover:text-text-primary transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedEmail(expandedEmail === email.id ? null : email.id);
                        }}
                        title={expandedEmail === email.id ? "Collapse" : "Expand preview"}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={expandedEmail === email.id ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-text-secondary truncate">
                    To: {formatRecipients(email.to)}
                  </p>
                  <p className="text-xs text-text-secondary mt-1">
                    {formatDate(email.timestamp)}
                  </p>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedEmail === email.id && (
                <div className="mt-3 pt-3 border-t border-border-color space-y-2">
                  <div>
                    <div className="text-xs font-semibold text-text-secondary mb-1">Preview:</div>
                    <p className="text-xs text-text-primary bg-background-main p-2 rounded">
                      {email.snippet || 'No preview available'}
                    </p>
                  </div>

                  {email.status === 'failed' && email.error && (
                    <div>
                      <div className="text-xs font-semibold text-red-400 mb-1">Error:</div>
                      <p className="text-xs text-red-300 bg-red-900/20 p-2 rounded">
                        {email.error}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text-secondary">Type:</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-indigo-600/20 text-indigo-300">
                      {email.type}
                    </span>
                  </div>

                  <div className="text-xs text-text-secondary">
                    Full timestamp: {new Date(email.timestamp).toLocaleString()}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1a1b2e;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #4f46e5;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #6366f1;
        }
      `}</style>

      {/* Email Detail Modal */}
      {showEmailModal && selectedEmail && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          onClick={() => setShowEmailModal(false)}
        >
          <div
            className="bg-[#1a1b2e] rounded-lg border border-indigo-600 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-border-color">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{getTypeIcon(selectedEmail.type)}</span>
                <h2 className="text-lg font-bold text-text-primary">Email Details</h2>
              </div>
              <button
                onClick={() => setShowEmailModal(false)}
                className="text-text-secondary hover:text-text-primary transition-colors"
                title="Close"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              {/* Subject with AI Suggestions */}
              <div>
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-2">
                  Subject
                  {loadingSubject && (
                    <span className="text-xs text-gray-500 font-normal">(AI suggesting alternatives...)</span>
                  )}
                </label>
                {loadingSubject ? (
                  <div className="flex items-center gap-2 mt-2 p-2 bg-background-main rounded border border-border-color">
                    <svg className="animate-spin h-4 w-4 text-indigo-400" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-xs text-text-secondary">Generating suggestions...</span>
                  </div>
                ) : subjectSuggestions.length > 0 ? (
                  <div className="mt-2 space-y-2">
                    <select
                      value={selectedSubject}
                      onChange={(e) => setSelectedSubject(e.target.value)}
                      className="w-full bg-background-main text-text-primary p-2 rounded border border-border-color focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm font-semibold"
                    >
                      <option value={selectedEmail.subject}>📧 {selectedEmail.subject} (Original)</option>
                      {subjectSuggestions.map((suggestion, idx) => (
                        <option key={idx} value={suggestion}>
                          ✨ {suggestion} (AI Suggestion {idx + 1})
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-text-secondary">
                      💡 Select a different subject line to use when resending
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-text-primary mt-1 font-semibold">{selectedEmail.subject}</p>
                )}</div>

              {/* Recipients */}
              <div>
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">To</label>
                <p className="text-sm text-text-primary mt-1">
                  {typeof selectedEmail.to === 'string'
                    ? selectedEmail.to
                    : selectedEmail.to.join(', ')}
                </p>
              </div>

              {/* Date */}
              <div>
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Date</label>
                <p className="text-sm text-text-primary mt-1">
                  {new Date(selectedEmail.timestamp).toLocaleString()}
                </p>
              </div>

              {/* Type & Status */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Type</label>
                  <div className="mt-1">
                    <span className="text-xs px-2 py-1 rounded bg-indigo-600/20 text-indigo-300">
                      {selectedEmail.type}
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Status</label>
                  <div className="mt-1">
                    <span className={`text-xs px-2 py-1 rounded ${
                      selectedEmail.status === 'sent'
                        ? 'bg-green-600/20 text-green-300'
                        : 'bg-red-600/20 text-red-300'
                    }`}>
                      {selectedEmail.status === 'sent' ? '✓ Sent' : '✗ Failed'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div>
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Content</label>
                <div className="text-sm text-text-primary mt-2 bg-background-main p-4 rounded-lg border border-border-color whitespace-pre-wrap">
                  {selectedEmail.content || selectedEmail.snippet || 'No content available'}
                </div>
              </div>

              {/* Error (if failed) */}
              {selectedEmail.status === 'failed' && selectedEmail.error && (
                <div>
                  <label className="text-xs font-semibold text-red-400 uppercase tracking-wider">Error</label>
                  <p className="text-sm text-red-300 bg-red-900/20 p-3 rounded-lg mt-1">
                    {selectedEmail.error}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-4 border-t border-border-color">
              <button
                onClick={() => setShowEmailModal(false)}
                className="px-4 py-2 bg-background-main hover:bg-gray-700 text-text-primary rounded-lg font-medium transition-all"
              >
                Close
              </button>
              <button
                onClick={handleResendEmail}
                disabled={resending}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg flex items-center gap-2"
              >
                {resending ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Resending...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Resend</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailHistory;

