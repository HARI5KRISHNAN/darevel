# Phase 10.5: Auto-Heal Logs UI with Real-Time Updates

Real-time dashboard for viewing pod restart incidents with Socket.IO live updates, advanced filtering, and AI-powered analysis display.

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Architecture](#architecture)
4. [Setup Guide](#setup-guide)
5. [User Guide](#user-guide)
6. [API Integration](#api-integration)
7. [Customization](#customization)
8. [Troubleshooting](#troubleshooting)

---

## Overview

Phase 10.5 adds a beautiful, real-time dashboard for viewing auto-healing incidents detected by the Pod Monitor (Phase 10).

### What You Get

- **Real-Time Updates**: New incidents appear instantly via Socket.IO
- **Live Indicator**: Shows connection status with "Live" badge
- **Browser Notifications**: Desktop notifications for new incidents
- **Statistics Dashboard**: Overview of total incidents, MTTR, severity breakdown
- **Advanced Filtering**: Search and filter by pod name, namespace, severity
- **Incident Cards**: Detailed cards with AI summaries and error messages
- **Responsive Design**: Works on mobile, tablet, and desktop

### Screenshots

**Dashboard View:**
```
┌────────────────────────────────────────────────────────────┐
│ 🔄 Auto-Heal Logs                        [Live]  [Refresh] │
│ Real-time pod restart detection with AI-powered analysis   │
├────────────────────────────────────────────────────────────┤
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐          │
│ │  Total  │ │ Avg MTTR│ │Critical │ │ Healed  │          │
│ │   15    │ │   7s    │ │    3    │ │   12    │          │
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘          │
├────────────────────────────────────────────────────────────┤
│ [Search...] [All Severities ▼] [All Namespaces ▼]         │
├────────────────────────────────────────────────────────────┤
│ ┌────────────────────────────────────────────────────────┐ │
│ │ my-app-xyz                               [CRITICAL]    │ │
│ │ 📍 production 📦 app 🔄 Restart #3 ⚠️ OOMKilled       │ │
│ │ 2025-02-10 14:23:45                      MTTR: 7s     │ │
│ ├────────────────────────────────────────────────────────┤ │
│ │ 🤖 AI Analysis                                         │ │
│ │ The container exceeded its memory limit and was killed │ │
│ │ by Kubernetes. This is the 3rd restart, indicating a  │ │
│ │ persistent memory leak...                              │ │
│ ├────────────────────────────────────────────────────────┤ │
│ │ Error Message                                          │ │
│ │ Container killed by OOM killer (Out of Memory)         │ │
│ └────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────┘
```

---

## Features

### Real-Time Updates

**Socket.IO Integration:**
- Connects to backend on component mount
- Listens for `autoheal_incident` events
- Prepends new incidents to the list automatically
- Shows "Live" badge when connected
- Auto-reconnects if connection drops

**Browser Notifications:**
- Requests notification permission on load
- Shows desktop notification for each new incident
- Includes pod name, namespace, and reason
- Works even when tab is in background

### Statistics Dashboard

**Four Key Metrics:**
1. **Total Incidents** - Count of all incidents detected
2. **Avg MTTR** - Mean Time To Recovery across all incidents
3. **Critical** - Number of critical severity incidents
4. **Healed** - Number of successfully healed incidents

**Real-Time Stats:**
- Automatically recalculates when incidents change
- Updates with each new incident
- Shows formatted durations (7s, 5m, 2h)

### Advanced Filtering

**Search:**
- Filter by pod name (partial match)
- Filter by namespace (partial match)
- Filter by reason (partial match)
- Filter by container name (partial match)
- Case-insensitive search

**Severity Filter:**
- All Severities
- Critical (OOMKilled, CrashLoopBackOff)
- High (Error, ContainerCannotRun)
- Medium (DeadlineExceeded, Evicted)

**Namespace Filter:**
- All Namespaces
- Dynamically populated from incidents
- Shows only namespaces with incidents

**Active Filters Display:**
- Shows "Showing X of Y incidents"
- Combines all filters (search + severity + namespace)

### Incident Cards

**Each card displays:**

**Header:**
- Pod name (large, bold)
- Severity badge (color-coded)
- Healed badge (if applicable)
- Namespace, container, restart count
- Restart reason and exit code
- Detection timestamp and MTTR

**AI Analysis Section:**
- 🤖 Icon for visual identification
- Complete AI-generated summary
- Root cause analysis
- Recommended actions
- Syntax-highlighted for readability

**Error Message Section:**
- Raw error message from Kubernetes
- Monospace font for code readability
- Red background for emphasis
- Scrollable for long messages

**Footer:**
- Email sent indicator
- Incident ID (last part for brevity)

### Responsive Design

**Mobile (< 768px):**
- Single column layout
- Stacked statistics cards
- Full-width incident cards
- Touch-friendly buttons

**Tablet (768px - 1024px):**
- 2-column statistics grid
- Full-width incident cards
- Comfortable touch targets

**Desktop (> 1024px):**
- 4-column statistics grid
- Full-width incident cards
- Mouse hover effects

---

## Architecture

### Component Structure

```
AutoHealLogs Component
│
├─── Socket.IO Connection
│    ├─── Connect on mount
│    ├─── Listen for 'autoheal_incident'
│    ├─── Auto-reconnect on disconnect
│    └─── Cleanup on unmount
│
├─── State Management
│    ├─── incidents: AutoHealingIncident[]
│    ├─── stats: IncidentStats
│    ├─── filters: severity, namespace, search
│    ├─── socket: Socket connection
│    └─── connectedToSocket: boolean
│
├─── Data Flow
│    ├─── Initial: fetchIncidents() → API
│    ├─── Real-time: Socket.IO → incidents
│    ├─── Filtering: incidents → filteredIncidents
│    └─── Stats: incidents → calculateStats()
│
└─── Rendering
     ├─── Header with Live badge
     ├─── Statistics dashboard (4 cards)
     ├─── Filters bar (search + dropdowns)
     └─── Incidents list (cards)
```

### Data Flow

```
Backend Pod Monitor
    │
    ├─► Detects restart
    ├─► Creates incident
    ├─► Stores in memory
    └─► Emits Socket.IO event
            │
            ▼
    Socket.IO Server
            │
            ├─► Broadcasts to all clients
            │
            ▼
    Frontend Component
            │
            ├─► Receives event
            ├─► Prepends to incidents array
            ├─► Recalculates stats
            ├─► Shows notification
            └─► Re-renders UI
```

### Socket.IO Events

**Client → Server:**
- `connect` - Establish connection
- `disconnect` - Connection closed

**Server → Client:**
- `autoheal_incident` - New incident detected

**Event Payload:**
```typescript
interface AutoHealingIncident {
  id: string;
  podName: string;
  namespace: string;
  containerName: string;
  restartCount: number;
  reason: string;
  message: string;
  exitCode?: number;
  detectedAt: string;
  healedAt?: string;
  aiSummary?: string;
  emailSent: boolean;
  status: 'detected' | 'healing' | 'healed' | 'failed';
}
```

---

## Setup Guide

### Prerequisites

- Whooper backend running (Phase 7)
- Pod monitor service active (Phase 10)
- Socket.IO configured on backend
- Frontend build environment (Vite/React)

### Step 1: Verify Backend Socket.IO

Check that backend is emitting events:

```bash
# Check backend logs
kubectl logs -n whooper -l app=whooper,component=backend | grep "Socket.IO"

# Should see:
# Socket.IO instance attached to pod monitor
# 📡 Emitted autoheal_incident event to clients
```

### Step 2: Install Frontend Dependencies

If not already installed:

```bash
npm install socket.io-client
```

### Step 3: Add Component to Router

In your main routing file (e.g., `App.tsx`):

```typescript
import AutoHealLogs from './components/AutoHealLogs';

// Add route
<Route path="/autoheal" element={<AutoHealLogs />} />
```

### Step 4: Add Navigation Link

In your sidebar or navbar:

```typescript
<Link
  to="/autoheal"
  className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg"
>
  <span>🔄</span>
  <span>Auto-Heal Logs</span>
</Link>
```

### Step 5: Configure Backend URL

Set environment variable in `.env`:

```env
VITE_BACKEND_URL=http://localhost:5001
```

For production:
```env
VITE_BACKEND_URL=https://whooper-api.yourdomain.com
```

### Step 6: Build and Run

```bash
# Development
npm run dev

# Production
npm run build
npm run preview
```

### Step 7: Test Real-Time Updates

```bash
# In another terminal, trigger a pod restart
kubectl run test-crash --image=busybox --restart=Always -- /bin/sh -c "exit 1"

# Watch the UI - new incident should appear within seconds
```

---

## User Guide

### Accessing the Dashboard

Navigate to `/autoheal` in your browser:
```
http://localhost:5173/autoheal
```

### Understanding the Live Indicator

**Green "Live" badge:**
- Socket.IO connected
- Real-time updates active
- New incidents will appear automatically

**No badge:**
- Socket.IO disconnected
- Use "Refresh" button to update
- Check backend connection

### Using Filters

**Search:**
1. Type in search box
2. Matches pod name, namespace, reason, container
3. Results filter instantly

**Severity Filter:**
1. Click "All Severities" dropdown
2. Select: All, Critical, High, or Medium
3. Only incidents with that severity show

**Namespace Filter:**
1. Click "All Namespaces" dropdown
2. Select specific namespace
3. Only incidents from that namespace show

**Combining Filters:**
- All filters work together
- Search + Severity + Namespace
- "Showing X of Y" updates accordingly

### Reading Incident Cards

**Severity Badges:**
- 🔴 **Critical** - OOMKilled, CrashLoopBackOff (red)
- 🟠 **High** - Error, ContainerCannotRun (orange)
- 🟡 **Medium** - DeadlineExceeded, Evicted (yellow)
- 🔵 **Warning** - Other reasons (blue)

**MTTR (Mean Time To Recovery):**
- Time from detection to healing
- Shown in green if healed
- Formats: 7s, 5m, 2h

**AI Summary:**
- 🤖 icon indicates AI-generated content
- Includes what happened, root cause, recommendations
- Formatted for readability

**Error Message:**
- Raw Kubernetes error message
- Helpful for debugging
- Shown in monospace font

### Refreshing Data

**Automatic (Real-Time):**
- New incidents appear instantly
- No action needed
- Requires Socket.IO connection

**Manual:**
- Click "Refresh" button
- Fetches latest from API
- Useful if Socket.IO disconnected

### Browser Notifications

**First Time:**
1. Browser asks for notification permission
2. Click "Allow" to enable
3. Notifications will appear for new incidents

**Ongoing:**
- Desktop notification for each new incident
- Shows pod name, namespace, reason
- Works even when tab is in background
- Click notification to focus tab

---

## API Integration

### REST API Endpoints

**Get Incidents:**
```http
GET /api/autoheal/incidents?limit=100
```

**Response:**
```json
{
  "success": true,
  "incidents": [
    {
      "id": "production-my-app-xyz-app-1707574625000",
      "podName": "my-app-xyz",
      "namespace": "production",
      "containerName": "app",
      "restartCount": 3,
      "reason": "OOMKilled",
      "message": "Container killed by OOM killer",
      "exitCode": 137,
      "detectedAt": "2025-02-10T14:23:45.000Z",
      "healedAt": "2025-02-10T14:23:52.000Z",
      "aiSummary": "The container exceeded its memory limit...",
      "emailSent": true,
      "status": "healed"
    }
  ],
  "total": 1
}
```

### Socket.IO Events

**Connect:**
```typescript
const socket = io('http://localhost:5001');

socket.on('connect', () => {
  console.log('Connected to auto-heal socket');
});
```

**Listen for Incidents:**
```typescript
socket.on('autoheal_incident', (incident: AutoHealingIncident) => {
  console.log('New incident:', incident);
  // Update UI
});
```

**Disconnect:**
```typescript
socket.on('disconnect', () => {
  console.log('Disconnected from auto-heal socket');
});
```

**Cleanup:**
```typescript
useEffect(() => {
  const socket = io('http://localhost:5001');

  // ... setup listeners

  return () => {
    socket.close(); // Important: cleanup on unmount
  };
}, []);
```

---

## Customization

### Changing Colors

**Severity Colors:**
```typescript
const getSeverityColor = (severity: string): string => {
  switch (severity) {
    case 'critical':
      return 'text-red-500 bg-red-50 border-red-200';
    case 'high':
      return 'text-orange-500 bg-orange-50 border-orange-200';
    case 'medium':
      return 'text-yellow-500 bg-yellow-50 border-yellow-200';
    default:
      return 'text-blue-500 bg-blue-50 border-blue-200';
  }
};
```

**Dark Mode Support:**
Add `dark:` variants:
```typescript
'text-red-500 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
```

### Adding More Statistics

```typescript
const calculateStats = (incidentList: AutoHealingIncident[]) => {
  // ... existing stats

  // Add custom stat
  const totalRestarts = incidentList.reduce((sum, i) => sum + i.restartCount, 0);

  return {
    // ... existing
    totalRestarts
  };
};

// Display in UI
<div className="stat-card">
  <div>Total Restarts</div>
  <div>{stats.totalRestarts}</div>
</div>
```

### Custom Filters

Add new filter:
```typescript
const [containerFilter, setContainerFilter] = useState('all');

// In filter function
if (containerFilter !== 'all' && incident.containerName !== containerFilter) {
  return false;
}

// In UI
<select value={containerFilter} onChange={e => setContainerFilter(e.target.value)}>
  <option value="all">All Containers</option>
  {uniqueContainers.map(c => <option key={c} value={c}>{c}</option>)}
</select>
```

### Notification Customization

```typescript
if (Notification.permission === 'granted') {
  new Notification('🔄 Pod Restarted', {
    body: `${incident.podName} in ${incident.namespace} (${incident.reason})`,
    icon: '/favicon.ico',
    badge: '/badge.png', // Add custom badge
    tag: incident.id, // Prevent duplicates
    requireInteraction: true, // Notification stays until clicked
    silent: false, // Play sound
  });
}
```

### Export Incidents

Add export button:
```typescript
const exportToCSV = () => {
  const csv = [
    ['Pod', 'Namespace', 'Reason', 'Restart Count', 'Detected', 'MTTR'],
    ...filteredIncidents.map(i => [
      i.podName,
      i.namespace,
      i.reason,
      i.restartCount,
      new Date(i.detectedAt).toISOString(),
      i.healedAt ? ((new Date(i.healedAt).getTime() - new Date(i.detectedAt).getTime()) / 1000) : ''
    ])
  ].map(row => row.join(',')).join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `autoheal-incidents-${new Date().toISOString()}.csv`;
  a.click();
};

// Add button
<button onClick={exportToCSV}>Export CSV</button>
```

---

## Troubleshooting

### Issue 1: No Real-Time Updates

**Symptoms:**
- No "Live" badge shown
- New incidents don't appear automatically
- Must click "Refresh" to see new incidents

**Solutions:**

```bash
# Check backend Socket.IO is running
kubectl logs -n whooper -l app=whooper,component=backend | grep -i socket

# Check if setSocketIO was called
# Should see: "Socket.IO instance attached to pod monitor"

# Check browser console for Socket.IO errors
# Look for: "Failed to connect to socket" or "Socket.IO connection refused"

# Verify VITE_BACKEND_URL is correct
console.log(import.meta.env.VITE_BACKEND_URL);

# Test Socket.IO endpoint directly
curl http://localhost:5001/socket.io/?EIO=4&transport=polling
# Should return: "0{...}" (socket.io handshake)
```

**Common Causes:**
- Backend URL misconfigured
- CORS blocking Socket.IO
- Backend not emitting events
- Socket.IO not installed

**Fix:**
```typescript
// In component, add error handling
socket.on('connect_error', (error) => {
  console.error('Socket connection error:', error);
});

socket.on('connect_timeout', () => {
  console.error('Socket connection timeout');
});
```

### Issue 2: Browser Notifications Not Working

**Symptoms:**
- No desktop notifications appear
- No permission prompt shown

**Solutions:**

```typescript
// Check notification permission
console.log('Notification permission:', Notification.permission);
// Should be: "granted", "denied", or "default"

// Request permission manually
Notification.requestPermission().then(permission => {
  console.log('Permission result:', permission);
});

// Test notification
if (Notification.permission === 'granted') {
  new Notification('Test', { body: 'Testing notifications' });
}
```

**Common Issues:**
- HTTPS required for notifications (except localhost)
- User denied permission
- Browser doesn't support notifications
- Page not focused when requested

**Fix:**
```typescript
// Add permission check and request button
const [notificationPermission, setNotificationPermission] = useState(Notification.permission);

const requestNotificationPermission = async () => {
  const permission = await Notification.requestPermission();
  setNotificationPermission(permission);
};

// In UI
{notificationPermission !== 'granted' && (
  <button onClick={requestNotificationPermission}>
    Enable Notifications
  </button>
)}
```

### Issue 3: Stats Not Updating

**Symptoms:**
- Statistics dashboard shows 0 or incorrect values
- Stats don't update when incidents change

**Solutions:**

```typescript
// Check if calculateStats is being called
useEffect(() => {
  console.log('Recalculating stats for', incidents.length, 'incidents');
  if (incidents.length > 0) {
    calculateStats(incidents);
  }
}, [incidents]);

// Verify stats structure
console.log('Current stats:', stats);

// Check MTTR calculation
incidents.forEach(i => {
  if (i.healedAt && i.detectedAt) {
    const mttr = (new Date(i.healedAt).getTime() - new Date(i.detectedAt).getTime()) / 1000;
    console.log(`${i.podName} MTTR:`, mttr);
  }
});
```

### Issue 4: Filters Not Working

**Symptoms:**
- Changing filters doesn't filter incidents
- Shows all incidents regardless of filter

**Solutions:**

```typescript
// Add debug logging
const getFilteredIncidents = () => {
  console.log('Filtering with:', { filter, namespaceFilter, searchQuery });

  const filtered = incidents.filter(incident => {
    const severity = getSeverityFromReason(incident.reason);
    console.log(`${incident.podName}: severity=${severity}, matches=${severity === filter || filter === 'all'}`);

    // ... filter logic
  });

  console.log('Filtered:', filtered.length, 'of', incidents.length);
  return filtered;
};

// Check filter values
console.log('Current filters:', { filter, namespaceFilter, searchQuery });
```

### Issue 5: Slow Performance with Many Incidents

**Symptoms:**
- UI lags when scrolling
- Slow to filter or search
- High memory usage

**Solutions:**

```typescript
// Implement pagination
const [page, setPage] = useState(1);
const ITEMS_PER_PAGE = 20;

const paginatedIncidents = filteredIncidents.slice(
  (page - 1) * ITEMS_PER_PAGE,
  page * ITEMS_PER_PAGE
);

// Implement virtual scrolling (react-window)
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={filteredIncidents.length}
  itemSize={200}
>
  {({ index, style }) => (
    <div style={style}>
      <IncidentCard incident={filteredIncidents[index]} />
    </div>
  )}
</FixedSizeList>

// Limit stored incidents
const MAX_INCIDENTS = 500;
setIncidents(prev => [incident, ...prev].slice(0, MAX_INCIDENTS));
```

### Issue 6: Memory Leak

**Symptoms:**
- Memory usage grows over time
- Browser becomes slow
- Tab crashes after hours of use

**Solutions:**

```typescript
// Ensure Socket.IO cleanup
useEffect(() => {
  const newSocket = io(BACKEND_URL);
  // ... setup

  return () => {
    newSocket.close(); // CRITICAL: cleanup
    console.log('Socket.IO connection closed');
  };
}, []); // Empty dependency array to run once

// Limit incidents stored
useEffect(() => {
  if (incidents.length > 500) {
    setIncidents(prev => prev.slice(0, 500));
  }
}, [incidents]);

// Clear old incidents periodically
useEffect(() => {
  const interval = setInterval(() => {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours
    setIncidents(prev => prev.filter(i => new Date(i.detectedAt) > cutoff));
  }, 60 * 60 * 1000); // Every hour

  return () => clearInterval(interval);
}, []);
```

---

## Summary

Phase 10.5 successfully implemented:

- **Real-Time Dashboard**: Socket.IO-powered live updates
- **Statistics**: 4-metric overview with auto-calculation
- **Advanced Filtering**: Search + severity + namespace filters
- **Incident Cards**: Beautiful cards with AI summaries
- **Browser Notifications**: Desktop notifications for new incidents
- **Responsive Design**: Mobile-friendly layout
- **Production Ready**: Error handling, cleanup, performance optimizations

Your Whooper dashboard now has a **complete auto-healing UI** with real-time updates, providing instant visibility into pod health and AI-powered incident analysis!
