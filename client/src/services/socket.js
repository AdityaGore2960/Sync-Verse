import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect() {
    // Return existing connected socket
    if (this.socket?.connected) return this.socket;

    // Close any stale socket before reconnecting
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('[SocketService] No auth token — aborting connection.');
      return null;
    }

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    this.socket.on('connect', () => {
      console.log(`[Socket] Connected ✅ (${this.socket.id})`);
    });

    this.socket.on('connect_error', (err) => {
      console.error('[Socket] Connection error:', err.message);
    });

    this.socket.on('disconnect', (reason) => {
      console.warn('[Socket] Disconnected:', reason);
    });

    this.socket.on('reconnect', (attempt) => {
      console.log(`[Socket] Reconnected on attempt ${attempt}`);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket() {
    return this.socket?.connected ? this.socket : this.connect();
  }
}

export default new SocketService();
