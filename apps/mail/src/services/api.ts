import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { Email, Meeting, Draft } from '../../types';

declare global {
  interface Window {
    keycloak: any;
  }
}

class MailApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: '/api',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add auth interceptor
    this.client.interceptors.request.use(
      (config) => {
        const token = window.keycloak?.token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          window.keycloak?.login();
        }
        return Promise.reject(error);
      }
    );
  }

  // Email operations
  async getEmails(folder: string): Promise<Email[]> {
    const response = await this.client.get<Email[]>(`/emails/folder/${folder}`);
    return response.data;
  }

  async getEmailById(id: string): Promise<Email> {
    const response = await this.client.get<Email>(`/emails/${id}`);
    return response.data;
  }

  async sendEmail(email: Partial<Email>): Promise<Email> {
    const response = await this.client.post<Email>('/emails/send', email);
    return response.data;
  }

  async saveDraft(draft: Partial<Draft>): Promise<Draft> {
    const response = await this.client.post<Draft>('/emails/draft', draft);
    return response.data;
  }

  async deleteEmail(id: string): Promise<void> {
    await this.client.delete(`/emails/${id}`);
  }

  async markAsRead(id: string, isRead: boolean): Promise<void> {
    await this.client.patch(`/emails/${id}/read`, { isRead });
  }

  async starEmail(id: string, isStarred: boolean): Promise<void> {
    await this.client.patch(`/emails/${id}/star`, { isStarred });
  }

  async moveToFolder(id: string, folder: string): Promise<void> {
    await this.client.patch(`/emails/${id}/move`, { folder });
  }

  async searchEmails(query: string): Promise<Email[]> {
    const response = await this.client.get<Email[]>(`/emails/search?q=${encodeURIComponent(query)}`);
    return response.data;
  }

  // Meeting operations
  async getMeetings(): Promise<Meeting[]> {
    const response = await this.client.get<Meeting[]>('/meetings');
    return response.data;
  }

  async createMeeting(meeting: Partial<Meeting>): Promise<Meeting> {
    const response = await this.client.post<Meeting>('/meetings', meeting);
    return response.data;
  }

  async updateMeeting(id: string, meeting: Partial<Meeting>): Promise<Meeting> {
    const response = await this.client.put<Meeting>(`/meetings/${id}`, meeting);
    return response.data;
  }

  async deleteMeeting(id: string): Promise<void> {
    await this.client.delete(`/meetings/${id}`);
  }

  async generateMeetingLink(): Promise<string> {
    const response = await this.client.post<{ link: string }>('/meetings/generate-link');
    return response.data.link;
  }

  // Draft operations
  async getDrafts(): Promise<Draft[]> {
    const response = await this.client.get<Draft[]>('/emails/drafts');
    return response.data;
  }

  async updateDraft(id: string, draft: Partial<Draft>): Promise<Draft> {
    const response = await this.client.put<Draft>(`/emails/draft/${id}`, draft);
    return response.data;
  }

  async deleteDraft(id: string): Promise<void> {
    await this.client.delete(`/emails/draft/${id}`);
  }

  // Attachment operations
  async uploadAttachment(file: File): Promise<{ id: string; url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await this.client.post<{ id: string; url: string }>(
      '/attachments/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  }

  async downloadAttachment(id: string): Promise<Blob> {
    const response = await this.client.get(`/attachments/${id}`, {
      responseType: 'blob',
    });
    return response.data;
  }
}

// Export singleton instance
export const mailApi = new MailApiClient();
export default mailApi;
