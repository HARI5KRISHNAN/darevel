import { ActionType, ResourceType, AuditLog } from './types';

// Helper to generate mock data
const generateMockLogs = (count: number): AuditLog[] => {
  const logs: AuditLog[] = [];
  const users = [
    { id: 'u1', name: 'John Doe', email: 'john@example.com' },
    { id: 'u2', name: 'Jane Smith', email: 'jane@example.com' },
    { id: 'u3', name: 'Admin User', email: 'admin@example.com' },
    { id: 'u4', name: 'Guest User', email: 'guest@example.com' },
  ];
  
  const actions = Object.values(ActionType);
  const resources = Object.values(ResourceType);
  
  const descriptions = [
    "Modified document permissions",
    "Exported monthly report",
    "Changed billing method",
    "Deleted old archive",
    "Viewed confidential file",
    "Login attempt failed",
    "Updated user profile",
    "Created new shared drive",
  ];

  const generateMac = () => "XX:XX:XX:XX:XX:XX".replace(/X/g, () => "0123456789ABCDEF".charAt(Math.floor(Math.random() * 16)));

  const now = new Date();

  for (let i = 0; i < count; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const action = actions[Math.floor(Math.random() * actions.length)];
    const resource = resources[Math.floor(Math.random() * resources.length)];
    const date = new Date(now.getTime() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)); // Last 30 days
    
    logs.push({
      id: `log-${i + 1000}`,
      action,
      resourceType: resource,
      resourceId: `res-${Math.floor(Math.random() * 9999)}`,
      resourceName: `${resource}_${Math.floor(Math.random() * 100)}.obj`,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      ipAddress: `192.168.0.${Math.floor(Math.random() * 255)}`,
      macAddress: generateMac(),
      timestamp: date.toISOString(),
      description: descriptions[Math.floor(Math.random() * descriptions.length)],
      metadata: {
        oldValue: Math.random() > 0.5 ? 'Draft' : undefined,
        newValue: Math.random() > 0.5 ? 'Final' : undefined,
        browser: 'Chrome 122.0',
        os: 'MacOS 14.2'
      }
    });
  }
  
  // Sort by date desc
  return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export const MOCK_LOGS = generateMockLogs(150);