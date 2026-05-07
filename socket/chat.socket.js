/**
 * Chat handler — real-time messaging inside a document room.
 *
 * Events CLIENT → SERVER:
 *   chat:send       { documentId, message, replyTo? }
 *   chat:typing     { documentId, isTyping }
 *   chat:history    { documentId, page?, limit? }
 *
 * Events SERVER → CLIENT:
 *   chat:message    { id, documentId, sender, message, replyTo, timestamp }
 *   chat:typing     { userId, name, avatar, isTyping }
 *   chat:history    { messages, page, hasMore }
 *   chat:error      { message }
 */

const { v4: uuidv4 } = require('uuid');

// ─────────────────────────────────────────────────────────────────────────────
// In-memory chat store per document room.
// For production: persist to MongoDB ChatMessage model instead.
// Structure: Map<documentId, ChatMessage[]>
// ─────────────────────────────────────────────────────────────────────────────
const chatStore = new Map();
const MAX_MESSAGES_PER_ROOM = 200;   // rolling window

const getOrCreateHistory = (documentId) => {
  if (!chatStore.has(documentId)) chatStore.set(documentId, []);
  return chatStore.get(documentId);
};

const getRoomId = (documentId) => `doc:${documentId}`;

// ─────────────────────────────────────────────────────────────────────────────
// Register chat events on a socket
// ─────────────────────────────────────────────────────────────────────────────
const registerChatHandlers = (io, socket) => {
  const user = socket.user;

  // ── SEND A CHAT MESSAGE ───────────────────────────────────────────────────
  socket.on('chat:send', ({ documentId, message, replyTo } = {}) => {
    if (!documentId) return socket.emit('chat:error', { message: 'documentId is required' });
    if (!message || typeof message !== 'string' || !message.trim()) {
      return socket.emit('chat:error', { message: 'Message cannot be empty' });
    }
    if (message.length > 2000) {
      return socket.emit('chat:error', { message: 'Message exceeds 2000 characters' });
    }

    const history = getOrCreateHistory(documentId);

    // Validate replyTo
    let replyPayload = null;
    if (replyTo) {
      const original = history.find(m => m.id === replyTo);
      if (original) {
        replyPayload = {
          id:      original.id,
          sender:  original.sender.name,
          preview: original.message.substring(0, 80),
        };
      }
    }

    const chatMessage = {
      id:         uuidv4(),
      documentId,
      sender: {
        id:     user.id,
        name:   user.name,
        avatar: user.avatar,
      },
      message:    message.trim(),
      replyTo:    replyPayload,
      timestamp:  new Date().toISOString(),
      edited:     false,
    };

    // Store and keep rolling window
    history.push(chatMessage);
    if (history.length > MAX_MESSAGES_PER_ROOM) {
      history.splice(0, history.length - MAX_MESSAGES_PER_ROOM);
    }

    // Broadcast to ALL users in the room (including sender for confirmation)
    const roomId = getRoomId(documentId);
    io.to(roomId).emit('chat:message', chatMessage);

    console.log(`💬 [doc:${documentId.slice(-6)}] ${user.name}: ${message.substring(0, 40)}`);
  });

  // ── TYPING INDICATOR ──────────────────────────────────────────────────────
  socket.on('chat:typing', ({ documentId, isTyping } = {}) => {
    if (!documentId) return;
    const roomId = getRoomId(documentId);

    socket.to(roomId).emit('chat:typing', {
      userId:   user.id,
      name:     user.name,
      avatar:   user.avatar,
      isTyping: !!isTyping,
    });
  });

  // ── FETCH CHAT HISTORY ────────────────────────────────────────────────────
  socket.on('chat:history', ({ documentId, page = 1, limit = 50 } = {}) => {
    if (!documentId) return socket.emit('chat:error', { message: 'documentId is required' });

    const history = getOrCreateHistory(documentId);
    const total   = history.length;
    const start   = Math.max(0, total - page * limit);
    const end     = total - (page - 1) * limit;
    const messages = history.slice(start, end).reverse();   // newest first

    socket.emit('chat:history', {
      messages,
      page,
      hasMore: start > 0,
      total,
    });
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// Utility: get recent messages for a document (used at room join)
// ─────────────────────────────────────────────────────────────────────────────
const getRecentMessages = (documentId, limit = 30) => {
  const history = chatStore.get(documentId) || [];
  return history.slice(-limit);
};

module.exports = { registerChatHandlers, getRecentMessages };
