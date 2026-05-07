const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, searchUsers, getFavorites, toggleFavorite } = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');

// All user routes are protected
router.use(protect);

// ─── Favorites ──────────────────────────────────────
router.get('/favorites', getFavorites);
router.patch('/favorites/:docId', toggleFavorite);

// ─── Search ─────────────────────────────────────────
router.get('/search', searchUsers);

// ─── Profile ────────────────────────────────────────
router.get('/:id', getProfile);
router.put('/profile', updateProfile);

module.exports = router;
