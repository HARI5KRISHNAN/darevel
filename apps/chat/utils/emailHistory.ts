/**
 * Email History Management Utility
 *
 * Provides localStorage-based email history tracking with:
 * - Persistent storage across sessions
 * - Automatic cleanup of old entries
 * - Type-safe email record management
 */

export interface EmailRecord {
  id: string;
  to: string | string[];
  subject: string;
  snippet: string;
  content?: string; // Full email content for resending
  timestamp: string;
  type: 'summary' | 'incident' | 'analytics' | 'generic';
  status: 'sent' | 'failed';
  error?: string;
}

const EMAIL_HISTORY_KEY = 'whooper_email_history';
const MAX_HISTORY_ITEMS = 50; // Keep last 50 emails

/**
 * Get all email history from localStorage
 */
export function getEmailHistory(): EmailRecord[] {
  try {
    const stored = localStorage.getItem(EMAIL_HISTORY_KEY);
    if (!stored) return [];

    const history = JSON.parse(stored);
    return Array.isArray(history) ? history : [];
  } catch (error) {
    console.error('Failed to load email history:', error);
    return [];
  }
}

/**
 * Add a new email record to history
 */
export function addEmailRecord(record: Omit<EmailRecord, 'id' | 'timestamp'>): EmailRecord {
  const newRecord: EmailRecord = {
    ...record,
    id: `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString()
  };

  try {
    const history = getEmailHistory();
    const updated = [newRecord, ...history].slice(0, MAX_HISTORY_ITEMS);
    localStorage.setItem(EMAIL_HISTORY_KEY, JSON.stringify(updated));
    return newRecord;
  } catch (error) {
    console.error('Failed to save email record:', error);
    return newRecord;
  }
}

/**
 * Get email history filtered by type
 */
export function getEmailHistoryByType(type: EmailRecord['type']): EmailRecord[] {
  return getEmailHistory().filter(record => record.type === type);
}

/**
 * Clear all email history
 */
export function clearEmailHistory(): void {
  try {
    localStorage.removeItem(EMAIL_HISTORY_KEY);
  } catch (error) {
    console.error('Failed to clear email history:', error);
  }
}

/**
 * Clear email history older than specified days
 */
export function clearOldEmailHistory(days: number = 30): number {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const history = getEmailHistory();
    const filtered = history.filter(record => {
      const recordDate = new Date(record.timestamp);
      return recordDate >= cutoffDate;
    });

    const removed = history.length - filtered.length;
    localStorage.setItem(EMAIL_HISTORY_KEY, JSON.stringify(filtered));
    return removed;
  } catch (error) {
    console.error('Failed to clear old email history:', error);
    return 0;
  }
}

/**
 * Get email statistics
 */
export function getEmailStats(): {
  total: number;
  sent: number;
  failed: number;
  byType: Record<string, number>;
} {
  const history = getEmailHistory();

  return {
    total: history.length,
    sent: history.filter(r => r.status === 'sent').length,
    failed: history.filter(r => r.status === 'failed').length,
    byType: history.reduce((acc, record) => {
      acc[record.type] = (acc[record.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  };
}

/**
 * Format recipients for display
 */
export function formatRecipients(recipients: string | string[]): string {
  if (typeof recipients === 'string') return recipients;
  if (recipients.length === 0) return 'None';
  if (recipients.length === 1) return recipients[0];
  if (recipients.length === 2) return recipients.join(' and ');
  return `${recipients[0]} and ${recipients.length - 1} others`;
}

/**
 * Get suggested recipients from history
 */
export function getSuggestedRecipients(): string[] {
  const history = getEmailHistory();
  const recipients = new Set<string>();

  history.forEach(record => {
    if (typeof record.to === 'string') {
      recipients.add(record.to);
    } else {
      record.to.forEach(email => recipients.add(email));
    }
  });

  return Array.from(recipients).slice(0, 10); // Top 10 most recent unique recipients
}
