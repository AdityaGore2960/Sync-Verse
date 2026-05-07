const { body, validationResult } = require('express-validator');

// ─────────────────────────────────────────────────────────────────────────────
// Runner — call after rule arrays to collect & respond with errors
// ─────────────────────────────────────────────────────────────────────────────
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors:  errors.array().map(e => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// ─────────────────────────────────────────────────────────────────────────────
// Register
// ─────────────────────────────────────────────────────────────────────────────
const registerRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 80 }).withMessage('Name must be between 2 and 80 characters'),

  body('email')
    .isEmail().withMessage('A valid email is required')
    .normalizeEmail(),

  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number'),
];

// ─────────────────────────────────────────────────────────────────────────────
// Login
// ─────────────────────────────────────────────────────────────────────────────
const loginRules = [
  body('email')
    .isEmail().withMessage('A valid email is required')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required'),
];

// ─────────────────────────────────────────────────────────────────────────────
// Change Password
// ─────────────────────────────────────────────────────────────────────────────
const changePasswordRules = [
  body('currentPassword')
    .notEmpty().withMessage('Current password is required'),

  body('newPassword')
    .isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('New password must contain at least one uppercase letter')
    .matches(/[0-9]/).withMessage('New password must contain at least one number'),
];

// ─────────────────────────────────────────────────────────────────────────────
// Update Role (admin)
// ─────────────────────────────────────────────────────────────────────────────
const updateRoleRules = [
  body('role')
    .isIn(['user', 'admin']).withMessage("Role must be 'user' or 'admin'"),
];

// ─────────────────────────────────────────────────────────────────────────────
// Document — create / update
// ─────────────────────────────────────────────────────────────────────────────
const documentRules = [
  body('title')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters'),

  body('content')
    .optional()
    .isString().withMessage('Content must be a string'),

  body('tags')
    .optional()
    .isArray().withMessage('Tags must be an array')
    .custom(tags => tags.every(t => typeof t === 'string' && t.length <= 50))
    .withMessage('Each tag must be a string of max 50 characters'),

  body('isPublic')
    .optional()
    .isBoolean().withMessage('isPublic must be a boolean'),

  body('changeNote')
    .optional()
    .isLength({ max: 300 }).withMessage('Change note cannot exceed 300 characters'),
];

// ─────────────────────────────────────────────────────────────────────────────
// Share document
// ─────────────────────────────────────────────────────────────────────────────
const shareRules = [
  body('role')
    .isIn(['viewer', 'editor']).withMessage("Role must be 'viewer' or 'editor'"),

  body('email')
    .optional()
    .isEmail().withMessage('A valid email is required')
    .normalizeEmail(),

  body('userId')
    .optional()
    .isMongoId().withMessage('Invalid user ID'),
];

// ─────────────────────────────────────────────────────────────────────────────
// Auto-save patch
// ─────────────────────────────────────────────────────────────────────────────
const autoSaveRules = [
  body('content')
    .optional()
    .isString().withMessage('Content must be a string'),

  body('title')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters'),
];

module.exports = {
  validate,
  registerRules,
  loginRules,
  changePasswordRules,
  updateRoleRules,
  documentRules,
  shareRules,
  autoSaveRules,
};
