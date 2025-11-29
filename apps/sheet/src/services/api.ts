import axios from 'axios';
import keycloak from '../keycloak';

const API_BASE = import.meta.env.VITE_SHEET_API_URL || 'http://localhost:8089/api/sheets';

const client = axios.create({
  baseURL: API_BASE
});

client.interceptors.request.use((config) => {
  const token = keycloak.token || localStorage.getItem('kc_token');
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface SheetRecord {
  id: number;
  name: string;
  data: string;
  merges?: string;
  lastSavedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface SaveSheetRequest {
  name: string;
  data: string;
  merges?: string;
}

const sheetApi = {
  async list(): Promise<SheetRecord[]> {
    const { data } = await client.get<SheetRecord[]>('/load');
    return data;
  },
  async get(id: number): Promise<SheetRecord> {
    const { data } = await client.get<SheetRecord>(`/${id}`);
    return data;
  },
  async create(payload: SaveSheetRequest): Promise<SheetRecord> {
    const { data } = await client.post<SheetRecord>('/save', payload);
    return data;
  },
  async update(id: number, payload: SaveSheetRequest): Promise<SheetRecord> {
    const { data } = await client.put<SheetRecord>(`/${id}`, payload);
    return data;
  },
  async remove(id: number): Promise<void> {
    await client.delete(`/${id}`);
  }
};

export default sheetApi;
