
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { startWatchingPods, getPods, stopWatchingPods } from './services/k8s.service';
import { register, podMetrics, requestCounter, requestDuration } from './utils/metrics';
import { startPodMonitor, stopPodMonitor, setSocketIO } from './services/podMonitor.service';

declare global {
  namespace Express {
    export interface Request {
      io: Server;
      user?: any;
    }
  }
}

const app = express();
const httpServer = createServer(app);

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow all origins in development; restrict in production
    callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
};

const io = new Server(httpServer, {
  cors: corsOptions,
  transports: ['websocket', 'polling'] // Support both WebSocket and HTTP polling
});

const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Metrics middleware - track request count and duration
app.use((req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const route = req.route?.path || req.path;
    const method = req.method;
    const status = res.statusCode;

    requestCounter.inc({ method, route, status });
    requestDuration.observe({ method, route }, duration / 1000);
  });

  next();
});

// Attach io instance to request object
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Import routes
import authRoutes from './routes/auth.routes';
import chatRoutes from './routes/chat.routes';
import aiRoutes from './routes/ai.routes';
import podsRoutes from './routes/pods.routes';
import alertsRoutes from './routes/alerts.routes';
import incidentsRoutes from './routes/incidents.routes';
import emailRoutes from './routes/email.routes';
import autohealRoutes from './routes/autoheal.routes';
import permissionsRoutes from './routes/permissions.routes';

// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/pods', podsRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/incidents', incidentsRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/autoheal', autohealRoutes);
app.use('/api/permissions', permissionsRoutes);

// Health check route
app.get('/', (req, res) => {
  res.send('Kubernetes Dashboard API is running!');
});

// Health endpoint for Kubernetes probes
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Prometheus metrics endpoint
app.get('/metrics', async (req, res) => {
  try {
    // Update pod metrics before scraping
    const pods = getPods();
    podMetrics.total.set(pods.length);
    podMetrics.running.set(pods.filter(p => p.status === 'Running').length);
    podMetrics.pending.set(pods.filter(p => p.status === 'Pending').length);
    podMetrics.failed.set(pods.filter(p => p.status === 'Failed').length);

    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (error) {
    res.status(500).end(error);
  }
});

// --- Socket.IO Events ---

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Send initial pod list to new clients
  socket.emit('initial_pods', getPods());

  // Handle joining chat channels/rooms
  socket.on('join_channel', (channelId: string) => {
    socket.join(channelId);
    console.log(`Socket ${socket.id} joined channel: ${channelId}`);
  });

  // Handle leaving chat channels/rooms
  socket.on('leave_channel', (channelId: string) => {
    socket.leave(channelId);
    console.log(`Socket ${socket.id} left channel: ${channelId}`);
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Start the server
httpServer.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);

  // Initialize PostgreSQL database (auto-setup tables)
  const { initializeDatabase } = await import('./db/init');
  await initializeDatabase();
});

// Initialize Kubernetes watcher (optional - server will run without it)
startWatchingPods(io).catch(err => {
  console.warn('Kubernetes watcher not available:', err.message);
  console.log('Server will continue without Kubernetes integration...');
});

// Initialize Auto-Healing Pod Monitor (optional - requires RBAC permissions)
setSocketIO(io); // Attach Socket.IO for real-time incident updates
startPodMonitor().catch(err => {
  console.warn('Pod monitor not available:', err.message);
  console.log('Server will continue without auto-healing...');
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  stopWatchingPods();
  stopPodMonitor();
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
