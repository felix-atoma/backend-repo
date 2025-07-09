const http = require('http');
const app = require('./app');
const { Server } = require('socket.io');
const socketHandler = require('./sockets/socketHandler');

// Create HTTP server
const server = http.createServer(app);

// Configure allowed origins for Socket.io
const allowedSocketOrigins = [
  'http://localhost:5173',
  
  'https://week-5-web-sockets-assignment-felix-*.vercel.app' // For preview deployments
];

// Enhanced Socket.io configuration
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // Allow non-browser clients
      
      // Check against allowed origins with wildcard support
      const isAllowed = allowedSocketOrigins.some(allowedOrigin => {
        if (allowedOrigin.includes('*')) {
          const regex = new RegExp(allowedOrigin.replace('*', '.*'));
          return regex.test(origin);
        }
        return origin === allowedOrigin;
      });

      if (isAllowed) {
        return callback(null, true);
      } else {
        console.warn(`⚠️ Blocked Socket.io connection from: ${origin}`);
        return callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  },
  connectionStateRecovery: {
    // Enable reconnection with a delay
    maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes
    skipMiddlewares: true
  },
  pingInterval: 10000, // 10 seconds
  pingTimeout: 5000,    // 5 seconds
  cookie: {
    name: 'io',
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  }
});

// Socket.io error handling
io.on('connection_error', (err) => {
  console.error('Socket.io connection error:', err.message);
});

// Initialize socket handler
socketHandler(io);

// Server startup with error handling
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🔄 Socket.io waiting for connections`);
});

// Handle server errors
server.on('error', (error) => {
  console.error('❌ Server error:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use`);
    process.exit(1);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received. Closing server...');
  server.close(() => {
    console.log('🔌 Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received. Closing server...');
  server.close(() => {
    console.log('🔌 Server closed');
    process.exit(0);
  });
});