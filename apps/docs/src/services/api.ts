import axios from 'axios';
import keycloak from '../keycloak';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || 'http://localhost:8087/api/docs',
});

// Add authentication interceptor
api.interceptors.request.use(async (config) => {
  if (keycloak && keycloak.token) {
    // Refresh token if it's about to expire
    if (keycloak.isTokenExpired()) {
      try {
        console.log('🔄 Refreshing expired Keycloak token...');
        await keycloak.updateToken(30);
        console.log('✅ Token refreshed successfully');
      } catch (error) {
        console.error("❌ Failed to refresh token", error);
        keycloak.login();
      }
    }
    config.headers.Authorization = `Bearer ${keycloak.token}`;
  } else {
    console.warn('⚠️ No Keycloak token available for request:', config.url);
  }
  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log('Authentication required. Please login to access docs features.');
    }
    return Promise.reject(error);
  }
);

export const documentAPI = {
  list: (orgId: string) => api.get(`/documents?orgId=${orgId}`),
  get: (id: string) => api.get(`/documents/${id}`),
  create: (data: any) => api.post('/documents', data),
  update: (id: string, data: any) => api.put(`/documents/${id}`, data),
  delete: (id: string) => api.delete(`/documents/${id}`),
};

export const commentAPI = {
  list: (docId: string) => api.get(`/documents/${docId}/comments`),
  create: (docId: string, data: any) => api.post(`/documents/${docId}/comments`, data),
  resolve: (docId: string, commentId: string) =>
    api.post(`/documents/${docId}/comments/${commentId}/resolve`),
};

export const versionAPI = {
  list: (docId: string) => api.get(`/documents/${docId}/versions`),
  create: (docId: string, data: any) => api.post(`/documents/${docId}/versions`, data),
  restore: (docId: string, versionId: number) =>
    api.post(`/documents/${docId}/versions/${versionId}/restore`),
};
