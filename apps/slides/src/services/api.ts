import axios from 'axios';
import keycloak from '../keycloak';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || 'http://localhost:8084/api/slides',
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
      console.log('Authentication required. Please login to access slides features.');
    }
    return Promise.reject(error);
  }
);

export const presentationAPI = {
  list: (orgId: string) => api.get(`/presentations?orgId=${orgId}`),
  get: (id: string) => api.get(`/presentations/${id}`),
  create: (data: any) => api.post('/presentations', data),
  update: (id: string, data: any) => api.put(`/presentations/${id}`, data),
  delete: (id: string) => api.delete(`/presentations/${id}`),
};

export const slideAPI = {
  list: (presentationId: string) => api.get(`/presentations/${presentationId}/slides`),
  create: (presentationId: string, data: any) => api.post(`/presentations/${presentationId}/slides`, data),
  update: (presentationId: string, slideId: string, data: any) =>
    api.put(`/presentations/${presentationId}/slides/${slideId}`, data),
  delete: (presentationId: string, slideId: string) =>
    api.delete(`/presentations/${presentationId}/slides/${slideId}`),
  reorder: (presentationId: string, data: any) =>
    api.post(`/presentations/${presentationId}/slides/reorder`, data),
};

export const versionAPI = {
  list: (presentationId: string) => api.get(`/presentations/${presentationId}/versions`),
  create: (presentationId: string, data: any) => api.post(`/presentations/${presentationId}/versions`, data),
  restore: (presentationId: string, versionId: number) =>
    api.post(`/presentations/${presentationId}/versions/${versionId}/restore`),
};
