import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || 'http://localhost:8087/api/docs',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Document APIs
export const documentAPI = {
  list: (orgId: string) => api.get(`/documents?orgId=${orgId}`),
  get: (id: string) => api.get(`/documents/${id}`),
  create: (data: any) => api.post('/documents', data),
  update: (id: string, data: any) => api.put(`/documents/${id}`, data),
  delete: (id: string) => api.delete(`/documents/${id}`),
  search: (query: string, orgId: string) =>
    api.get(`/documents?search=${query}&orgId=${orgId}`),
};

// Permission APIs
export const permissionAPI = {
  list: (documentId: string) => api.get(`/documents/${documentId}/permissions`),
  add: (documentId: string, data: any) =>
    api.post(`/documents/${documentId}/permissions`, data),
  update: (documentId: string, userId: string, role: string) =>
    api.put(`/documents/${documentId}/permissions/${userId}?role=${role}`),
  remove: (documentId: string, userId: string) =>
    api.delete(`/documents/${documentId}/permissions/${userId}`),
};

// Comment APIs
export const commentAPI = {
  list: (documentId: string) => api.get(`/documents/${documentId}/comments`),
  create: (documentId: string, data: any) =>
    api.post(`/documents/${documentId}/comments`, data),
  update: (documentId: string, commentId: string, data: any) =>
    api.put(`/documents/${documentId}/comments/${commentId}`, data),
  delete: (documentId: string, commentId: string) =>
    api.delete(`/documents/${documentId}/comments/${commentId}`),
  resolve: (documentId: string, commentId: string) =>
    api.post(`/documents/${documentId}/comments/${commentId}/resolve`),
  reopen: (documentId: string, commentId: string) =>
    api.post(`/documents/${documentId}/comments/${commentId}/reopen`),
};

// Version APIs
export const versionAPI = {
  list: (documentId: string) => api.get(`/documents/${documentId}/versions`),
  get: (documentId: string, versionNumber: number) =>
    api.get(`/documents/${documentId}/versions/${versionNumber}`),
  create: (documentId: string, data: any) =>
    api.post(`/documents/${documentId}/versions`, data),
  restore: (documentId: string, versionNumber: number) =>
    api.post(`/documents/${documentId}/versions/${versionNumber}/restore`),
};

// Activity APIs
export const activityAPI = {
  list: (documentId: string, page = 0, size = 50) =>
    api.get(`/documents/${documentId}/activity?page=${page}&size=${size}`),
  recent: (documentId: string, hours = 24) =>
    api.get(`/documents/${documentId}/activity/recent?hours=${hours}`),
};

// Collaboration APIs
export const collaborationAPI = {
  getCollaborators: (documentId: string) =>
    api.get(`/documents/${documentId}/collaborators`),
};

export default api;
