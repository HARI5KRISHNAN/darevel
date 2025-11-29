type Listener = (data: any) => void;

class MockWebSocketService {
  private listeners: Set<Listener> = new Set();
  private intervalId: any;

  connect() {
    console.log('Connecting to WS...');
    this.intervalId = setInterval(() => {
      this.simulateIncomingNotification();
    }, 15000);
  }

  disconnect() {
    console.log('Disconnecting WS...');
    if (this.intervalId) clearInterval(this.intervalId);
  }

  onMessage(callback: Listener) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private simulateIncomingNotification() {
    const types = ['chat', 'mail', 'task', 'warning'] as const;
    const type = types[Math.floor(Math.random() * types.length)];
    
    const newNotification = {
      event: 'notification',
      data: {
        id: Math.random().toString(36).substr(2, 9),
        type: type === 'warning' ? 'system' : type,
        title: `New Real-time ${type}`,
        message: 'This notification just arrived via WebSocket!',
        createdAt: new Date().toISOString(),
        isRead: false,
        priority: 'normal',
        senderName: 'System Bot',
        avatarUrl: 'https://picsum.photos/seed/ws/40/40',
      },
    };

    this.listeners.forEach(listener => listener(newNotification));
  }
}

export const wsService = new MockWebSocketService();
