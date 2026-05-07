const jwt  = require('jsonwebtoken');
const User = require('../models/User.model');

// ─────────────────────────────────────────────────────────────────────────────
// protect — verifies JWT and attaches req.user
// ─────────────────────────────────────────────────────────────────────────────
const protect = async (req, res, next) => {
  try {
    let token;

    // 1. Check Authorization header (Bearer <token>)
    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    // 2. Fall back to access token in cookie (optional)
    else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated. Please log in.',
      });
    }

    // 3. Verify signature & expiry
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtErr) {
      const msg = jwtErr.name === 'TokenExpiredError'
        ? 'Access token expired. Please refresh.'
        : 'Invalid token. Please log in again.';
      return res.status(401).json({ success: false, message: msg });
    }

    // 4. Check user still exists
    const user = await User.findById(decoded.id).select('+passwordChangedAt');
    if (!user) {
      return res.status(401).json({ success: false, message: 'User no longer exists.' });
    }

    // 5. Reject tokens issued before a password change
    if (user.passwordChangedAfter(decoded.iat)) {
      return res.status(401).json({
        success: false,
        message: 'Password was recently changed. Please log in again.',
      });
    }

    // 6. Attach lightweight user info to request
    req.user = {
      id:   user._id.toString(),
      role: user.role,
      name: user.name,
    };

    next();
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// authorize — role-based access control (RBAC) factory
//
// Usage:
//   router.get('/admin-only', protect, authorize('admin'), handler)
//   router.get('/staff',      protect, authorize('admin', 'manager'), handler)
// ─────────────────────────────────────────────────────────────────────────────
const authorize = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated.' });
  }
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: `Access denied. Requires one of: [${roles.join(', ')}]. Your role: '${req.user.role}'.`,
    });
  }
  next();
};

// ─────────────────────────────────────────────────────────────────────────────
// optionalProtect — attaches req.user if a valid token exists, otherwise skip.
// Useful for public routes that have richer responses when authenticated.
// ─────────────────────────────────────────────────────────────────────────────
const optionalProtect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.split(' ')[1]
      : req.cookies?.accessToken;

    if (!token) return next(); // unauthenticated — that's fine

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user    = await User.findById(decoded.id);

    if (user && !user.passwordChangedAfter(decoded.iat)) {
      req.user = { id: user._id.toString(), role: user.role, name: user.name };
    }
  } catch (_) {
    // Silently ignore — not required
  }
  next();
};

module.exports = { protect, authorize, optionalProtect };
