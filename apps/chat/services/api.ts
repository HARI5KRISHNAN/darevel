// This file will centralize all API calls to the backend.
import { Message, User } from '../types';

// Prefer explicit backend URL from env; fall back to localhost backend
const API_BASE_URL = import.meta?.env?.VITE_BACKEND_URL || 'http://localhost:5001/api';

export const getMessages = async (channelId: string, userId: number): Promise<Message[]> => {
    const response = await fetch(`${API_BASE_URL}/chat/${channelId}/messages?userId=${userId}`);
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch messages');
    }
    return response.json();
};

export const sendMessage = async (channelId: string, content: string, userId: number): Promise<Message> => {
    // Get user info from localStorage to send with message
    const savedUser = localStorage.getItem('whooper_user');
    let userName = `User ${userId}`;
    let userEmail = `user${userId}@whooper.com`;
    let userAvatar = `https://i.pravatar.cc/80?u=user${userId}`;

    if (savedUser) {
        try {
            const user = JSON.parse(savedUser);
            userName = user.name || userName;
            userEmail = user.email || userEmail;
            userAvatar = user.avatar || userAvatar;
        } catch (e) {
            console.error('Failed to parse user from localStorage');
        }
    }

    const response = await fetch(`${API_BASE_URL}/chat/${channelId}/messages`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            content,
            userId,
            userName,
            userEmail,
            userAvatar
        }),
    });
     if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send message');
    }
    return response.json();
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
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
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
    return response.json();
};

// FIX: Added missing registerUser function.
export const registerUser = async (name: string, email: string, password: string): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
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
    return response.json();
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
  const response = await fetch(`${API_BASE_URL}/permissions`, {
    method: "GET",
  });
  if (!response.ok) throw new Error("Failed to fetch permissions");
  return response.json();
};

// ✅ Create a new permission
export const createPermission = async (permission: Permission): Promise<Permission> => {
  const response = await fetch(`${API_BASE_URL}/permissions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(permission),
  });
  if (!response.ok) throw new Error("Failed to create permission");
  return response.json();
};

// ✅ Update existing permission
export const updatePermission = async (
  id: string,
  updates: Partial<Permission>
): Promise<Permission> => {
  const response = await fetch(`${API_BASE_URL}/permissions/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  if (!response.ok) throw new Error("Failed to update permission");
  return response.json();
};

// ✅ Delete permission
export const deletePermission = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/permissions/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete permission");
};
