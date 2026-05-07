const jwt  = require('jsonwebtoken');
const User = require('../models/User.model');

/**
 * Socket.io authentication middleware.
 * Reads JWT from:
 *   1. socket.handshake.auth.token     (preferred)
 *   2. socket.handshake.headers.authorization  (Bearer <token>)
 *
 * Attaches decoded user to socket.user on success.
 */
const socketAuthMiddleware = async (socket, next) => {
  try {
    let token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.replace(/^Bearer\s+/i, '');

    if (!token) {
      return next(new Error('SOCKET_AUTH: No token provided'));
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return next(new Error(
        err.name === 'TokenExpiredError'
          ? 'SOCKET_AUTH: Token expired'
          : 'SOCKET_AUTH: Invalid token'
      ));
    }

    const user = await User.findById(decoded.id).select('name email avatar role');
    if (!user) return next(new Error('SOCKET_AUTH: User not found'));

    // Attach lightweight user info to every socket
    socket.user = {
      id:     user._id.toString(),
      name:   user.name,
      email:  user.email,
      avatar: user.avatar || '',
      role:   user.role,
    };

    next();
  } catch (err) {
    next(new Error('SOCKET_AUTH: Internal error'));
  }
};

module.exports = socketAuthMiddleware;
