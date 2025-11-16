// This file will centralize all API calls to the backend.
import { Message, User } from '../types';

// Java Backend Microservices URLs
const AUTH_API_URL = import.meta?.env?.VITE_AUTH_SERVICE_URL || 'http://localhost:8081';
const CHAT_API_URL = import.meta?.env?.VITE_CHAT_SERVICE_URL || 'http://localhost:8082';
const PERMISSIONS_API_URL = import.meta?.env?.VITE_PERMISSIONS_SERVICE_URL || 'http://localhost:8083';

// Legacy fallback for old code
const API_BASE_URL = CHAT_API_URL + '/api';

export const getMessages = async (channelId: string): Promise<Message[]> => {
    const response = await fetch(`${API_BASE_URL}/chat/${channelId}/messages`);
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch messages');
    }
    const result = await response.json();
    // Handle Java backend ApiResponse wrapper
    return result.data || result;
};

export const sendMessage = async (channelId: string, content: string, userId: number): Promise<Message> => {
    // Java backend only needs userId and content
    // It will fetch user details from Auth Service automatically
    const response = await fetch(`${API_BASE_URL}/chat/${channelId}/messages`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            userId,
            content
        }),
    });
     if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send message');
    }
    const result = await response.json();
    // Handle Java backend ApiResponse wrapper
    return result.data || result;
}

export const generateSummary = async (transcript: string): Promise<{ summary: string }> => {
    try {
        const response = await fetch(`${API_BASE_URL}/ai/summary`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ transcript }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || errorData.error || 'Failed to generate summary');
        }

        const data = await response.json();
        return { summary: data.summary };
    } catch (error) {
        console.error('Error generating summary:', error);
        throw new Error('Failed to generate summary from AI. Please try again later.');
    }
};

// FIX: Add interface for the authentication response payload.
interface AuthResponse {
    token: string;
    user: {
        id: number;
        name: string;
        email: string;
        avatar: string;
    };
}

// FIX: Added missing loginUser function.
export const loginUser = async (email: string, password: string): Promise<AuthResponse> => {
    const response = await fetch(`${AUTH_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to login');
    }
    const result = await response.json();
    // Handle Java backend ApiResponse wrapper
    return result.data || result;
};

// FIX: Added missing registerUser function.
export const registerUser = async (name: string, email: string, password: string): Promise<AuthResponse> => {
    const response = await fetch(`${AUTH_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to register');
    }
    const result = await response.json();
    // Handle Java backend ApiResponse wrapper
    return result.data || result;
};
// ==========================
// 🧠 PERMISSION MANAGEMENT API
// ==========================

interface Permission {
  id?: string;
  tool: string;
  user: string;
  access: string; // read | write | execute
}

// ✅ Get all permissions
export const getPermissions = async (): Promise<Permission[]> => {
  const response = await fetch(`${PERMISSIONS_API_URL}/api/permissions`, {
    method: "GET",
  });
  if (!response.ok) throw new Error("Failed to fetch permissions");
  const result = await response.json();
  return result.data || result;
};

// ✅ Create a new permission
export const createPermission = async (permission: Permission): Promise<Permission> => {
  const response = await fetch(`${PERMISSIONS_API_URL}/api/permissions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(permission),
  });
  if (!response.ok) throw new Error("Failed to create permission");
  const result = await response.json();
  return result.data || result;
};

// ✅ Update existing permission
export const updatePermission = async (
  id: string,
  updates: Partial<Permission>
): Promise<Permission> => {
  const response = await fetch(`${PERMISSIONS_API_URL}/api/permissions/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  if (!response.ok) throw new Error("Failed to update permission");
  const result = await response.json();
  return result.data || result;
};

// ✅ Delete permission
export const deletePermission = async (id: string): Promise<void> => {
  const response = await fetch(`${PERMISSIONS_API_URL}/api/permissions/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete permission");
};
