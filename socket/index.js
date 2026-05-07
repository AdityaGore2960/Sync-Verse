const { Server }                              = require('socket.io');
const socketAuthMiddleware                     = require('./auth.socket');
const { registerDocumentHandlers,
        handleLeaveRoom }                      = require('./document.socket');
const { registerChatHandlers,
        getRecentMessages }                    = require('./chat.socket');
const { getGlobalStats, getRoomUsers }         = require('./presence');

/**
 * Initialise Socket.io on the existing HTTP server.
 *
 * @param {import('http').Server} httpServer
 * @returns {import('socket.io').Server} io
 */
const initSocketIO = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin:      ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'],
      methods:     ['GET', 'POST'],
      credentials: true,
    },
    // Tuning & Optimizations
    pingTimeout:       60_000,   // 60 s before considering disconnect
    pingInterval:      25_000,   // heartbeat every 25 s
    maxHttpBufferSize: 1e6,      // 1 MB max message size
    transports:        ['websocket', 'polling'],
    perMessageDeflate: {
      threshold: 1024, // Compress responses over 1KB
    },
  });

  // ─── Authentication middleware ──────────────────────────────────────────────
  io.use(socketAuthMiddleware);

  // ─── Connection handler ─────────────────────────────────────────────────────
  io.on('connection', (socket) => {
    const user = socket.user;
    console.log(`🔌 Socket connected   | ${user.name} (${socket.id})`);

    // Register user to personal room for targeted events (e.g. access revoked)
    socket.join(user.id.toString());

    // Register feature handlers
    registerDocumentHandlers(io, socket);
    registerChatHandlers(io, socket);

    // ── PRESENCE: send recent chat when user joins room ─────────────────────
    socket.on('document:join', ({ documentId } = {}) => {
      // Give a small delay so the join event has been processed first
      setTimeout(() => {
        const recentMessages = getRecentMessages(documentId, 30);
        if (recentMessages.length > 0) {
          socket.emit('chat:history', {
            messages: [...recentMessages].reverse(),
            page:     1,
            hasMore:  false,
            total:    recentMessages.length,
          });
        }
      }, 100);
    });

    // ── PING / PONG (latency check) ─────────────────────────────────────────
    socket.on('ping', (cb) => {
      if (typeof cb === 'function') cb({ timestamp: Date.now() });
    });

    // ── SERVER STATS (admin only) ───────────────────────────────────────────
    socket.on('admin:stats', (cb) => {
      if (socket.user.role !== 'admin') return;
      const stats = getGlobalStats();
      if (typeof cb === 'function') cb(stats);
      else socket.emit('admin:stats', stats);
    });

    // ── DISCONNECT ──────────────────────────────────────────────────────────
    socket.on('disconnect', (reason) => {
      console.log(`🔌 Socket disconnected | ${user.name} (${socket.id}) — ${reason}`);

      // Clean up room presence on disconnect
      if (socket.currentRoom) {
        handleLeaveRoom(io, socket, socket.currentRoom);
      }
    });

    // ── ERROR HANDLING ──────────────────────────────────────────────────────
    socket.on('error', (err) => {
      console.error(`⚡ Socket error [${user.name}]:`, err.message);
    });
  });

  console.log('⚡ Socket.io initialised');
  return io;
};

module.exports = initSocketIO;
