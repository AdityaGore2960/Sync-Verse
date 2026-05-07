const jwt      = require('jsonwebtoken');
const User     = require('../models/User.model');
const { generateAccessToken, generateRefreshToken, sendTokenResponse } = require('../utils/generateToken');

// ═════════════════════════════════════════════════════════════════════════════
// REGISTER
// POST /api/auth/register
// ═════════════════════════════════════════════════════════════════════════════
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Prevent duplicate accounts
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ success: false, message: 'Email already in use' });
    }

    // Only allow 'admin' role if explicitly elevated (guard this endpoint in production)
    const safeRole = role === 'admin' ? 'admin' : 'user';

    const user = await User.create({ name, email, password, role: safeRole });

    // Generate refresh token, persist to DB first, then send response
    const refreshToken = generateRefreshToken();
    await User.findByIdAndUpdate(user._id, { refreshToken });
    sendTokenResponse(user, 201, res, refreshToken);

  } catch (err) {
    next(err);
  }
};

// ═════════════════════════════════════════════════════════════════════════════
// LOGIN
// POST /api/auth/login
// ═════════════════════════════════════════════════════════════════════════════
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Fetch user + password (excluded by default)
    const user = await User.findOne({ email }).select('+password +loginAttempts +lockUntil +refreshToken');

    // Account not found — generic message to prevent enumeration
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // ── Brute-force check ──────────────────────────────────────────────────
    if (user.isLocked) {
      return res.status(429).json({
        success: false,
        message: 'Account temporarily locked due to too many failed attempts. Try again in 15 minutes.',
      });
    }

    // ── Password verification ──────────────────────────────────────────────
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await user.incLoginAttempts();
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // ── Successful login: reset attempts & update lastActive ───────────────
    await User.findByIdAndUpdate(user._id, {
      loginAttempts: 0,
      $unset: { lockUntil: 1 },
      lastActive: Date.now(),
    });

    const refreshToken = generateRefreshToken();
    await User.findByIdAndUpdate(user._id, { refreshToken });
    sendTokenResponse(user, 200, res, refreshToken);

  } catch (err) {
    next(err);
  }
};

// ═════════════════════════════════════════════════════════════════════════════
// LOGOUT
// POST /api/auth/logout     (protected)
// ═════════════════════════════════════════════════════════════════════════════
exports.logout = async (req, res, next) => {
  try {
    // Invalidate refresh token in DB
    await User.findByIdAndUpdate(req.user.id, { $unset: { refreshToken: 1 } });

    // Clear the cookie
    res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'strict' });

    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
};

// ═════════════════════════════════════════════════════════════════════════════
// REFRESH ACCESS TOKEN
// POST /api/auth/refresh-token
// ═════════════════════════════════════════════════════════════════════════════
exports.refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;

    if (!token) {
      return res.status(401).json({ success: false, message: 'No refresh token provided' });
    }

    // Look up user by stored refresh token
    const user = await User.findOne({ refreshToken: token }).select('+refreshToken');
    if (!user) {
      return res.status(403).json({ success: false, message: 'Invalid or expired refresh token' });
    }

    // Issue a new access token
    const accessToken = generateAccessToken(user._id, user.role);

    res.status(200).json({ success: true, accessToken });
  } catch (err) {
    next(err);
  }
};

// ═════════════════════════════════════════════════════════════════════════════
// GET CURRENT USER
// GET /api/auth/me           (protected)
// ═════════════════════════════════════════════════════════════════════════════
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, user: user.toPublicJSON() });
  } catch (err) {
    next(err);
  }
};

// ═════════════════════════════════════════════════════════════════════════════
// CHANGE PASSWORD
// PATCH /api/auth/change-password   (protected)
// ═════════════════════════════════════════════════════════════════════════════
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({ success: false, message: 'New password must differ from current' });
    }

    user.password = newPassword;          // pre-save hook hashes it + sets passwordChangedAt
    await user.save();

    // Force logout all existing sessions by clearing refresh token
    await User.findByIdAndUpdate(user._id, { $unset: { refreshToken: 1 } });
    res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'strict' });

    res.status(200).json({ success: true, message: 'Password changed. Please log in again.' });
  } catch (err) {
    next(err);
  }
};

// ═════════════════════════════════════════════════════════════════════════════
// ADMIN: GET ALL USERS
// GET /api/auth/admin/users   (protected + admin only)
// ═════════════════════════════════════════════════════════════════════════════
exports.getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find().sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      User.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      total,
      pages: Math.ceil(total / limit),
      currentPage: Number(page),
      users: users.map(u => u.toPublicJSON()),
    });
  } catch (err) {
    next(err);
  }
};

// ═════════════════════════════════════════════════════════════════════════════
// ADMIN: UPDATE USER ROLE
// PATCH /api/auth/admin/users/:id/role   (protected + admin only)
// ═════════════════════════════════════════════════════════════════════════════
exports.updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: "Role must be 'user' or 'admin'" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, user: user.toPublicJSON() });
  } catch (err) {
    next(err);
  }
};
