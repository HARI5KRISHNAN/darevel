# Frontend Migration Guide

This guide explains how to update the frontend to connect to the new Java Spring Boot microservices backend.

## API Endpoint Changes

### 1. Update Base URLs

**Before (Node.js Backend):**
```javascript
const API_BASE_URL = 'http://localhost:5001';
```

**After (Java Microservices):**
```javascript
const AUTH_API_URL = 'http://localhost:8081';
const CHAT_API_URL = 'http://localhost:8082';
const PERMISSIONS_API_URL = 'http://localhost:8083';
```

### 2. Update API Calls

#### Authentication API

**Register:**
```javascript
// Endpoint remains the same, just update the base URL
POST ${AUTH_API_URL}/api/auth/register

// Request body (same)
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "avatar": "https://..."
}

// Response format (new wrapper)
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "jwt-token-here",
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "avatar": "https://...",
      "level": "Elementary",
      "createdAt": "2025-01-01T10:00:00"
    }
  }
}
```

**Login:**
```javascript
POST ${AUTH_API_URL}/api/auth/login

// Request body (same)
{
  "email": "john@example.com",
  "password": "password123"
}

// Response format (new wrapper)
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "jwt-token-here",
    "user": { ... }
  }
}
```

#### Chat API

**Get Messages:**
```javascript
GET ${CHAT_API_URL}/api/chat/{channelId}/messages

// Response format
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "id": 1,
      "channelId": "general",
      "userId": 1,
      "content": "Hello!",
      "timestamp": "2025-01-01T10:00:00",
      "isRead": false,
      "userName": "John Doe",
      "userEmail": "john@example.com",
      "userAvatar": "https://..."
    }
  ]
}
```

**Send Message:**
```javascript
POST ${CHAT_API_URL}/api/chat/{channelId}/messages

// Request body
{
  "userId": 1,
  "content": "Hello, World!"
}

// Response format
{
  "success": true,
  "message": "Message sent successfully",
  "data": { ... }
}
```

#### Permissions API

**Update Permissions:**
```javascript
POST ${PERMISSIONS_API_URL}/api/permissions/update

// Request body (same)
{
  "user": "John Doe",
  "email": "john@example.com",
  "tool": "jenkins",
  "access": "read",
  "executor": "admin",
  "namespace": "default", // optional
  "gitRepo": "owner/repo", // optional
  "gitServerType": "gitea" // optional
}

// Response format
{
  "success": true,
  "message": "✅ Successfully applied read permissions for John Doe on jenkins",
  "data": {
    "user": "John Doe",
    "email": "john@example.com",
    "tool": "jenkins",
    "access": "read",
    "executor": "admin",
    "timestamp": "2025-01-01T10:00:00",
    "executionTime": "1500ms",
    "output": "Ansible output..."
  }
}
```

### 3. WebSocket Connection

**Before (Socket.IO):**
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:5001');

socket.on('new-message', (message) => {
  console.log(message);
});

socket.emit('send-message', {
  channelId: 'general',
  userId: 1,
  content: 'Hello!'
});
```

**After (STOMP over SockJS):**
```javascript
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

const socket = new SockJS('http://localhost:8082/ws');
const stompClient = Stomp.over(socket);

stompClient.connect({}, (frame) => {
  console.log('Connected:', frame);

  // Subscribe to channel messages
  stompClient.subscribe('/topic/messages/general', (message) => {
    const messageData = JSON.parse(message.body);
    console.log('Received:', messageData);
  });

  // Send a message
  stompClient.send('/app/chat/general/send', {}, JSON.stringify({
    userId: 1,
    content: 'Hello!'
  }));
});

// Disconnect
stompClient.disconnect(() => {
  console.log('Disconnected');
});
```

### 4. Response Wrapper Handling

All API responses now use a consistent `ApiResponse<T>` wrapper:

```javascript
// Helper function to handle API responses
async function apiCall(url, options) {
  const response = await fetch(url, options);
  const result = await response.json();

  if (!result.success) {
    throw new Error(result.message);
  }

  return result.data;
}

// Example usage
try {
  const users = await apiCall(`${AUTH_API_URL}/api/auth/users`, {
    method: 'GET'
  });
  console.log(users); // Direct access to data
} catch (error) {
  console.error(error.message);
}
```

### 5. Environment Configuration

Create a `.env` file in your frontend project:

```bash
# Development
VITE_AUTH_API_URL=http://localhost:8081
VITE_CHAT_API_URL=http://localhost:8082
VITE_PERMISSIONS_API_URL=http://localhost:8083
VITE_WS_URL=http://localhost:8082/ws

# Production
# VITE_AUTH_API_URL=https://api.darevel.com/auth
# VITE_CHAT_API_URL=https://api.darevel.com/chat
# VITE_PERMISSIONS_API_URL=https://api.darevel.com/permissions
# VITE_WS_URL=wss://api.darevel.com/chat/ws
```

Then use in your code:

```javascript
const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL;
const CHAT_API_URL = import.meta.env.VITE_CHAT_API_URL;
const PERMISSIONS_API_URL = import.meta.env.VITE_PERMISSIONS_API_URL;
const WS_URL = import.meta.env.VITE_WS_URL;
```

### 6. Install Required Dependencies

```bash
npm install sockjs-client @stomp/stompjs
```

### 7. Example API Service

Here's a complete example of an API service:

```javascript
// services/api.js
const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL;
const CHAT_API_URL = import.meta.env.VITE_CHAT_API_URL;
const PERMISSIONS_API_URL = import.meta.env.VITE_PERMISSIONS_API_URL;

class ApiService {
  async call(url, options = {}) {
    const token = localStorage.getItem('token');

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message);
    }

    return result.data;
  }

  // Auth APIs
  async register(data) {
    return this.call(`${AUTH_API_URL}/api/auth/register`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data) {
    return this.call(`${AUTH_API_URL}/api/auth/login`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getUsers() {
    return this.call(`${AUTH_API_URL}/api/auth/users`);
  }

  // Chat APIs
  async getMessages(channelId) {
    return this.call(`${CHAT_API_URL}/api/chat/${channelId}/messages`);
  }

  async sendMessage(channelId, data) {
    return this.call(`${CHAT_API_URL}/api/chat/${channelId}/messages`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Permissions APIs
  async updatePermissions(data) {
    return this.call(`${PERMISSIONS_API_URL}/api/permissions/update`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMembers() {
    return this.call(`${PERMISSIONS_API_URL}/api/permissions/members`);
  }
}

export default new ApiService();
```

### 8. Example WebSocket Service

```javascript
// services/websocket.js
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

const WS_URL = import.meta.env.VITE_WS_URL;

class WebSocketService {
  constructor() {
    this.stompClient = null;
    this.connected = false;
  }

  connect(onConnected) {
    const socket = new SockJS(WS_URL);
    this.stompClient = Stomp.over(socket);

    // Disable debug logging (optional)
    this.stompClient.debug = () => {};

    this.stompClient.connect({}, (frame) => {
      this.connected = true;
      console.log('WebSocket connected:', frame);
      if (onConnected) onConnected();
    }, (error) => {
      this.connected = false;
      console.error('WebSocket error:', error);
    });
  }

  disconnect() {
    if (this.stompClient && this.connected) {
      this.stompClient.disconnect(() => {
        this.connected = false;
        console.log('WebSocket disconnected');
      });
    }
  }

  subscribe(channelId, callback) {
    if (!this.stompClient || !this.connected) {
      console.error('WebSocket not connected');
      return null;
    }

    return this.stompClient.subscribe(`/topic/messages/${channelId}`, (message) => {
      const data = JSON.parse(message.body);
      callback(data);
    });
  }

  sendMessage(channelId, userId, content) {
    if (!this.stompClient || !this.connected) {
      console.error('WebSocket not connected');
      return;
    }

    this.stompClient.send(`/app/chat/${channelId}/send`, {}, JSON.stringify({
      userId,
      content,
    }));
  }
}

export default new WebSocketService();
```

### 9. Usage Example in React

```javascript
import { useEffect, useState } from 'react';
import apiService from './services/api';
import websocketService from './services/websocket';

function ChatComponent() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    // Load initial messages
    apiService.getMessages('general').then(setMessages);

    // Connect to WebSocket
    websocketService.connect(() => {
      // Subscribe to new messages
      websocketService.subscribe('general', (newMessage) => {
        setMessages(prev => [...prev, newMessage]);
      });
    });

    // Cleanup on unmount
    return () => {
      websocketService.disconnect();
    };
  }, []);

  const sendMessage = async () => {
    const userId = 1; // Get from auth context
    await apiService.sendMessage('general', {
      userId,
      content: inputValue,
    });
    setInputValue('');
  };

  return (
    <div>
      <div>
        {messages.map(msg => (
          <div key={msg.id}>
            <strong>{msg.userName}:</strong> {msg.content}
          </div>
        ))}
      </div>
      <input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}
```

## Summary of Changes

1. **Update base URLs** to point to three separate services (8081, 8082, 8083)
2. **Handle new response wrapper** - all responses now have `{ success, message, data }` format
3. **Update WebSocket** from Socket.IO to STOMP over SockJS
4. **Install new dependencies** - sockjs-client and @stomp/stompjs
5. **Update environment variables** to use separate service URLs

## Testing

After updating the frontend:

1. Start all backend services (see backend README)
2. Update frontend environment variables
3. Test authentication flow
4. Test chat messaging
5. Test WebSocket real-time updates
6. Test permissions management

## Rollback Plan

If you need to rollback to the Node.js backend:

1. Change environment variables back to single API URL
2. Revert WebSocket code to Socket.IO
3. Remove the ApiResponse wrapper handling
4. Start the Node.js backend on port 5001
