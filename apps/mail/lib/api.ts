import { auth } from "@/lib/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8084";

async function getAuthHeaders() {
  const session = await auth();
  if (!session?.accessToken) {
    throw new Error("No access token available");
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${session.accessToken}`,
  };
}

// Generic API request function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = await getAuthHeaders();

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `API Error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data; // Unwrap ApiResponse<T>
}

// Mail API
export const mailAPI = {
  getInbox: (page = 0, size = 20) =>
    apiRequest(`/api/mail/inbox?page=${page}&size=${size}`, { method: "GET" }),

  getSent: (page = 0, size = 20) =>
    apiRequest(`/api/mail/sent?page=${page}&size=${size}`, { method: "GET" }),

  getDrafts: (page = 0, size = 20) =>
    apiRequest(`/api/mail/drafts?page=${page}&size=${size}`, { method: "GET" }),

  getStarred: (page = 0, size = 20) =>
    apiRequest(`/api/mail/starred?page=${page}&size=${size}`, { method: "GET" }),

  getTrash: (page = 0, size = 20) =>
    apiRequest(`/api/mail/trash?page=${page}&size=${size}`, { method: "GET" }),

  getEmailById: (id: number) =>
    apiRequest(`/api/mail/${id}`, { method: "GET" }),

  composeEmail: (data: any) =>
    apiRequest(`/api/mail/compose`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateEmail: (id: number, data: any) =>
    apiRequest(`/api/mail/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  deleteEmail: (id: number) =>
    apiRequest(`/api/mail/${id}`, { method: "DELETE" }),

  getUnreadCount: () =>
    apiRequest(`/api/mail/unread-count`, { method: "GET" }),

  searchEmails: (query: string, page = 0, size = 20) =>
    apiRequest(`/api/mail/search?q=${encodeURIComponent(query)}&page=${page}&size=${size}`, {
      method: "GET",
    }),
};

// Calendar API
export const calendarAPI = {
  getAllEvents: (page = 0, size = 20) =>
    apiRequest(`/api/calendar/events?page=${page}&size=${size}`, { method: "GET" }),

  getEventsByDateRange: (startDate: string, endDate: string) =>
    apiRequest(
      `/api/calendar/events/range?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`,
      { method: "GET" }
    ),

  getEventById: (id: number) =>
    apiRequest(`/api/calendar/events/${id}`, { method: "GET" }),

  createEvent: (data: any) =>
    apiRequest(`/api/calendar/events`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateEvent: (id: number, data: any) =>
    apiRequest(`/api/calendar/events/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  cancelEvent: (id: number) =>
    apiRequest(`/api/calendar/events/${id}/cancel`, { method: "PATCH" }),

  deleteEvent: (id: number) =>
    apiRequest(`/api/calendar/events/${id}`, { method: "DELETE" }),

  searchEvents: (query: string, page = 0, size = 20) =>
    apiRequest(
      `/api/calendar/events/search?q=${encodeURIComponent(query)}&page=${page}&size=${size}`,
      { method: "GET" }
    ),
};

// Meetings API
export const meetingsAPI = {
  getAllMeetings: (page = 0, size = 20) =>
    apiRequest(`/api/meetings?page=${page}&size=${size}`, { method: "GET" }),

  getMeetingsByStatus: (status: string, page = 0, size = 20) =>
    apiRequest(`/api/meetings/status/${status}?page=${page}&size=${size}`, {
      method: "GET",
    }),

  getMeetingsByDateRange: (startDate: string, endDate: string) =>
    apiRequest(
      `/api/meetings/range?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`,
      { method: "GET" }
    ),

  getMeetingById: (id: number) =>
    apiRequest(`/api/meetings/${id}`, { method: "GET" }),

  createMeeting: (data: any) =>
    apiRequest(`/api/meetings`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateMeeting: (id: number, data: any) =>
    apiRequest(`/api/meetings/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  updateMeetingStatus: (id: number, status: string) =>
    apiRequest(`/api/meetings/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  updateMeetingNotes: (id: number, notes: string) =>
    apiRequest(`/api/meetings/${id}/notes`, {
      method: "PATCH",
      body: JSON.stringify({ notes }),
    }),

  deleteMeeting: (id: number) =>
    apiRequest(`/api/meetings/${id}`, { method: "DELETE" }),

  getUpcomingCount: () =>
    apiRequest(`/api/meetings/upcoming/count`, { method: "GET" }),

  searchMeetings: (query: string, page = 0, size = 20) =>
    apiRequest(
      `/api/meetings/search?q=${encodeURIComponent(query)}&page=${page}&size=${size}`,
      { method: "GET" }
    ),
};
