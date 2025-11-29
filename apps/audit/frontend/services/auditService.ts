import { AuditFilters, FetchLogsResponse, SortConfig } from '../types';

const API_BASE_URL = import.meta.env.VITE_AUDIT_API_BASE_URL ?? 'http://localhost:8086/api/v1/audit';
const DEFAULT_WORKSPACE_ID = import.meta.env.VITE_AUDIT_WORKSPACE_ID ?? '00000000-0000-0000-0000-000000000000';
const API_TOKEN = import.meta.env.VITE_AUDIT_API_TOKEN;

const buildHeaders = (): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'X-Organization-ID': DEFAULT_WORKSPACE_ID
  };

  if (API_TOKEN) {
    headers['Authorization'] = `Bearer ${API_TOKEN}`;
  }

  return headers;
};

const toIsoDate = (value: string, endOfDay = false): string => {
  const date = new Date(value);
  if (endOfDay) {
    date.setHours(23, 59, 59, 999);
  } else {
    date.setHours(0, 0, 0, 0);
  }
  return date.toISOString();
};

const buildQueryParams = (
  page: number,
  pageSize: number,
  filters: AuditFilters,
  sortConfig: SortConfig
): URLSearchParams => {
  const params = new URLSearchParams();
  params.set('page', Math.max(0, page - 1).toString());
  params.set('size', pageSize.toString());
  params.append('sort', `${sortConfig.key},${sortConfig.direction}`);

  if (filters.search) params.set('search', filters.search);
  if (filters.action) params.set('action', filters.action);
  if (filters.resourceType) params.set('resourceType', filters.resourceType);
  if (filters.resourceId) params.set('resourceId', filters.resourceId);
  if (filters.user) params.set('userQuery', filters.user);
  if (filters.startDate) params.set('startTime', toIsoDate(filters.startDate));
  if (filters.endDate) params.set('endTime', toIsoDate(filters.endDate, true));

  return params;
};

const handleResponse = async (response: Response) => {
  if (response.status === 403) {
    throw new Error('403_FORBIDDEN');
  }

  if (!response.ok) {
    const payload = await response.text();
    throw new Error(payload || 'API_ERROR');
  }

  return response;
};

export const fetchAuditLogs = async (
  page: number,
  pageSize: number,
  filters: AuditFilters,
  sortConfig: SortConfig,
  isAdmin: boolean
): Promise<FetchLogsResponse> => {
  if (!isAdmin) {
    throw new Error('403_FORBIDDEN');
  }

  const params = buildQueryParams(page, pageSize, filters, sortConfig);
  const response = await fetch(
    `${API_BASE_URL}/workspaces/${DEFAULT_WORKSPACE_ID}/logs?${params.toString()}`,
    {
      method: 'GET',
      headers: buildHeaders()
    }
  );

  const handled = await handleResponse(response);
  const payload = await handled.json();
  return payload as FetchLogsResponse;
};

export const exportAuditLogsToCSV = async (
  filters: AuditFilters,
  sortConfig: SortConfig,
  isAdmin: boolean
): Promise<void> => {
  if (!isAdmin) {
    throw new Error('403_FORBIDDEN');
  }

  const params = buildQueryParams(1, 5000, filters, sortConfig);
  const response = await fetch(
    `${API_BASE_URL}/workspaces/${DEFAULT_WORKSPACE_ID}/logs/export?${params.toString()}`,
    {
      method: 'GET',
      headers: buildHeaders()
    }
  );

  const handled = await handleResponse(response);
  const blob = await handled.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `audit_export_${new Date().toISOString()}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};