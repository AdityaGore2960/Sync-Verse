const express = require('express');
const router  = express.Router();

const {
  register,
  login,
  logout,
  refreshToken,
  getMe,
  changePassword,
  getAllUsers,
  updateUserRole,
} = require('../controllers/auth.controller');

const { protect, authorize } = require('../middleware/auth.middleware');
const {
  validate,
  registerRules,
  loginRules,
  changePasswordRules,
  updateRoleRules,
} = require('../middleware/validate.middleware');

// ─────────────────────────────────────────────────────────────────────────────
// Public routes  (no token required)
// Note: Express 5 requires validator rule arrays to be spread with ...
// ─────────────────────────────────────────────────────────────────────────────

// POST /api/auth/register
router.post('/register', ...registerRules, validate, register);

// POST /api/auth/login
router.post('/login', ...loginRules, validate, login);

// POST /api/auth/refresh-token  (reads HttpOnly cookie)
router.post('/refresh-token', refreshToken);

// ─────────────────────────────────────────────────────────────────────────────
// Protected routes  (valid JWT required)
// ─────────────────────────────────────────────────────────────────────────────

// GET  /api/auth/me
router.get('/me', protect, getMe);

// POST /api/auth/logout
router.post('/logout', protect, logout);

// PATCH /api/auth/change-password
router.patch('/change-password', protect, ...changePasswordRules, validate, changePassword);

// ─────────────────────────────────────────────────────────────────────────────
// Admin-only routes  (JWT + role === 'admin')
// ─────────────────────────────────────────────────────────────────────────────

// GET  /api/auth/admin/users
router.get('/admin/users', protect, authorize('admin'), getAllUsers);

// PATCH /api/auth/admin/users/:id/role
router.patch('/admin/users/:id/role', protect, authorize('admin'), ...updateRoleRules, validate, updateUserRole);

module.exports = router;
