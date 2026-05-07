/**
 * Presence Manager
 * ─────────────────────────────────────────────────────────────────────────────
 * Tracks which users are active in which document rooms.
 * Uses an in-memory Map — for multi-server deploys, replace with Redis.
 *
 * Structure:
 *   roomPresence  : Map<roomId, Map<socketId, UserInfo>>
 *   userSockets   : Map<userId, Set<socketId>>   (one user can have multiple tabs)
 */

const roomPresence = new Map();   // roomId → Map<socketId, UserInfo>
const userSockets  = new Map();   // userId  → Set<socketId>

// ─────────────────────────────────────────────────────────────────────────────
// Add a user to a room
// ─────────────────────────────────────────────────────────────────────────────
const joinRoom = (roomId, socketId, userInfo) => {
  if (!roomPresence.has(roomId)) {
    roomPresence.set(roomId, new Map());
  }
  roomPresence.get(roomId).set(socketId, {
    ...userInfo,
    socketId,
    joinedAt:  new Date().toISOString(),
    cursor:    null,      // { line, ch } – last known cursor position
    isTyping:  false,
    color:     generateUserColor(userInfo.id),
  });

  // Track sockets per user
  if (!userSockets.has(userInfo.id)) {
    userSockets.set(userInfo.id, new Set());
  }
  userSockets.get(userInfo.id).add(socketId);
};

// ─────────────────────────────────────────────────────────────────────────────
// Remove a socket from a room; return whether the user fully left the room
// ─────────────────────────────────────────────────────────────────────────────
const leaveRoom = (roomId, socketId, userId) => {
  const room = roomPresence.get(roomId);
  if (room) {
    room.delete(socketId);
    if (room.size === 0) roomPresence.delete(roomId);
  }

  // Remove socket from user tracking
  const sockets = userSockets.get(userId);
  if (sockets) {
    sockets.delete(socketId);
    if (sockets.size === 0) userSockets.delete(userId);
  }

  // Return true only if this user has NO remaining sockets in the room
  const remaining = roomPresence.get(roomId);
  if (!remaining) return true;
  for (const [, info] of remaining) {
    if (info.id === userId) return false;
  }
  return true;
};

// ─────────────────────────────────────────────────────────────────────────────
// Get all users currently in a room (deduplicated by userId)
// ─────────────────────────────────────────────────────────────────────────────
const getRoomUsers = (roomId) => {
  const room = roomPresence.get(roomId);
  if (!room) return [];

  const seen = new Map();
  for (const [socketId, info] of room) {
    if (!seen.has(info.id)) {
      seen.set(info.id, { ...info, socketIds: [socketId] });
    } else {
      seen.get(info.id).socketIds.push(socketId);
    }
  }
  return Array.from(seen.values());
};

// ─────────────────────────────────────────────────────────────────────────────
// Update cursor position for a socket
// ─────────────────────────────────────────────────────────────────────────────
const updateCursor = (roomId, socketId, cursor) => {
  const room = roomPresence.get(roomId);
  if (room && room.has(socketId)) {
    room.get(socketId).cursor = cursor;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Update typing state for a socket
// ─────────────────────────────────────────────────────────────────────────────
const updateTyping = (roomId, socketId, isTyping) => {
  const room = roomPresence.get(roomId);
  if (room && room.has(socketId)) {
    room.get(socketId).isTyping = isTyping;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Get count of unique users across all rooms (for monitoring)
// ─────────────────────────────────────────────────────────────────────────────
const getGlobalStats = () => {
  let totalConnections = 0;
  const rooms = [];
  for (const [roomId, users] of roomPresence) {
    totalConnections += users.size;
    rooms.push({ roomId, connections: users.size, uniqueUsers: getRoomUsers(roomId).length });
  }
  return { totalRooms: roomPresence.size, totalConnections, rooms };
};

// ─────────────────────────────────────────────────────────────────────────────
// Deterministic color per user (for cursor/highlight colour in editor)
// ─────────────────────────────────────────────────────────────────────────────
const COLORS = [
  '#F87171','#FB923C','#FBBF24','#34D399','#60A5FA',
  '#A78BFA','#F472B6','#38BDF8','#4ADE80','#E879F9',
];
const generateUserColor = (userId) => {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
};

module.exports = {
  joinRoom,
  leaveRoom,
  getRoomUsers,
  updateCursor,
  updateTyping,
  getGlobalStats,
};
