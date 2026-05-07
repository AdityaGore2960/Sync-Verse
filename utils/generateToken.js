const jwt = require('jsonwebtoken');
const crypto = require('crypto');

/**
 * Generate a signed JWT access token (short-lived).
 * @param {string} userId
 * @param {string} role
 * @returns {string} signed JWT
 */
const generateAccessToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );
};

/**
 * Generate an opaque refresh token (long-lived, stored in DB).
 * @returns {string} hex token
 */
const generateRefreshToken = () => {
  return crypto.randomBytes(40).toString('hex');
};

/**
 * Send access token in JSON body + set refresh token as HttpOnly cookie.
 * @param {object} user         - Mongoose User document
 * @param {number} statusCode
 * @param {object} res          - Express response
 * @param {string} refreshToken - Pre-generated opaque refresh token (already saved to DB)
 */
const sendTokenResponse = (user, statusCode, res, refreshToken) => {
  const accessToken = generateAccessToken(user._id, user.role);

  const cookieOptions = {
    expires:  new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  };

  res
    .status(statusCode)
    .cookie('refreshToken', refreshToken, cookieOptions)
    .json({
      success:     true,
      accessToken,
      user:        user.toPublicJSON(),
    });
};

module.exports = { generateAccessToken, generateRefreshToken, sendTokenResponse };
