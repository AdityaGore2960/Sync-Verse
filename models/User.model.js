const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    // ── Core Fields ────────────────────────────────────
    name: {
      type:      String,
      required:  [true, 'Name is required'],
      trim:      true,
      maxlength: [80, 'Name cannot exceed 80 characters'],
    },
    email: {
      type:     String,
      required: [true, 'Email is required'],
      unique:   true,
      lowercase: true,
      trim:     true,
      match:    [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type:      String,
      required:  [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select:    false,   // never returned in queries by default
    },

    // ── Profile ────────────────────────────────────────
    avatar: {
      type:    String,
      default: '',
    },

    // ── Authorisation ──────────────────────────────────
    role: {
      type:    String,
      enum:    ['user', 'admin'],
      default: 'user',
    },
    isVerified: {
      type:    Boolean,
      default: false,
    },

    // ── Security: refresh token ────────────────────────
    refreshToken: {
      type:   String,
      select: false,
    },

    // ── Security: password rotation ────────────────────
    passwordChangedAt: {
      type: Date,
    },

    // ── Security: brute-force protection ──────────────
    loginAttempts: {
      type:    Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
    },

    // ── Activity ───────────────────────────────────────
    lastActive: {
      type:    Date,
      default: Date.now,
    },
    favorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref:  'Document',
      },
    ],
  },
  { timestamps: true }
);

// ─────────────────────────────────────────────────────────────────────────────
// Virtual: is account currently locked?
// ─────────────────────────────────────────────────────────────────────────────
UserSchema.virtual('isLocked').get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// ─────────────────────────────────────────────────────────────────────────────
// Pre-save: hash password whenever it changes
// ─────────────────────────────────────────────────────────────────────────────
UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  const salt    = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);

  // Record when password was changed (skip on first save)
  if (!this.isNew) {
    this.passwordChangedAt = Date.now() - 1000; // 1 s buffer for token iat
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Instance method: verify a candidate password
// ─────────────────────────────────────────────────────────────────────────────
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ─────────────────────────────────────────────────────────────────────────────
// Instance method: was the password changed AFTER a given JWT was issued?
// jwt.iat is in seconds; passwordChangedAt is ms → convert
// ─────────────────────────────────────────────────────────────────────────────
UserSchema.methods.passwordChangedAfter = function (jwtIssuedAt) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return jwtIssuedAt < changedTimestamp;
  }
  return false; // password never changed
};

// ─────────────────────────────────────────────────────────────────────────────
// Instance method: handle failed login (brute-force lockout)
// Locks account for 15 minutes after 5 failed attempts.
// ─────────────────────────────────────────────────────────────────────────────
const MAX_ATTEMPTS = 5;
const LOCK_TIME    = 15 * 60 * 1000; // 15 minutes in ms

UserSchema.methods.incLoginAttempts = async function () {
  // If a previous lock has expired, reset
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({ $set: { loginAttempts: 1 }, $unset: { lockUntil: 1 } });
  }

  const updates = { $inc: { loginAttempts: 1 } };

  // Lock if this attempt pushes us to the threshold
  if (this.loginAttempts + 1 >= MAX_ATTEMPTS && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + LOCK_TIME };
  }

  return this.updateOne(updates);
};

// ─────────────────────────────────────────────────────────────────────────────
// Instance method: safe public shape (no password / tokens)
// ─────────────────────────────────────────────────────────────────────────────
UserSchema.methods.toPublicJSON = function () {
  const { _id, name, email, avatar, role, isVerified, lastActive, createdAt } = this;
  return { _id, name, email, avatar, role, isVerified, lastActive, createdAt };
};

// ─────────────────────────────────────────────────────────────────────────────
// Note: email index is created automatically by `unique: true` on the field

module.exports = mongoose.model('User', UserSchema);
