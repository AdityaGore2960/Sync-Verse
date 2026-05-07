const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const initSocketIO = require('./socket');

// Load environment variables before anything else
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);

// ─── Initialise Socket.io ──────────────────────────────────────────────────
const io = initSocketIO(server);

// Make `io` available to REST route handlers if needed
app.set('io', io);

// ─── Security & Utility Middleware ────────────────────────────────────────────
app.use(helmet());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'],
  methods:     ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: true,
  optionsSuccessStatus: 200, // For legacy browser support (IE11, various SmartTVs)
}));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/documents', require('./routes/document.routes'));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
    connections: io.engine.clientsCount,
  });
});

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use(require('./middleware/error.middleware'));

// ─── Start Server ─────────────────────────────────────────────────────────────
let PORT = parseInt(process.env.PORT, 10) || 5000;

function startServer(port) {
  server.listen(port)
    .once('listening', () => {
      console.log(`\n🚀 SyncVerse API    →  http://localhost:${port}`);
      console.log(`⚡ Socket.io        →  ws://localhost:${port}`);
      console.log(`📄 Environment     →  ${process.env.NODE_ENV || 'development'}`);
      console.log(`🛡️  Auth routes     →  http://localhost:${port}/api/auth\n`);
    })
    .once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.warn(`⚠️  Port ${port} is busy. Trying the next one...`);
        startServer(port + 1);
      } else {
        console.error('❌ Server failed to start:', err.message);
        process.exit(1);
      }
    });
}

startServer(PORT);

process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err.message);
  server.close(() => process.exit(1));
});

module.exports = { app, server, io };
