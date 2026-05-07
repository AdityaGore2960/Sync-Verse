const express = require('express');
const router = express.Router();

const {
  createDocument,
  getDocuments,
  getSharedWithMe,
  getSharedByMe,
  getFavorites,
  toggleFavorite,
  getDocument,
  updateDocument,
  autoSave,
  deleteDocument,
  shareDocument,
  removeCollaborator,
  getVersionHistory,
  getVersion,
  restoreVersion,
  duplicateDocument,
  updateAutoSaveSettings,
  switchMode,
  lockDocument,
  unlockDocument,
  searchDocuments,
} = require('../controllers/document.controller');

const { protect } = require('../middleware/auth.middleware');
const {
  validate,
  documentRules,
  shareRules,
  autoSaveRules,
} = require('../middleware/validate.middleware');

// All document routes require a valid JWT
router.use(protect);

// ─────────────────────────────────────────────────────────────────────────────
// Collection
// ─────────────────────────────────────────────────────────────────────────────
router.route('/')
  .get(getDocuments)
  .post(...documentRules, validate, createDocument);

router.get('/search', searchDocuments);

// ─────────────────────────────────────────────────────────────────────────────
// Shared views
// ─────────────────────────────────────────────────────────────────────────────
router.get('/shared-with-me', getSharedWithMe);
router.get('/shared-by-me', getSharedByMe);
router.get('/favorites', getFavorites);

// ─────────────────────────────────────────────────────────────────────────────
// Single document
// ─────────────────────────────────────────────────────────────────────────────
router.route('/:id')
  .get(getDocument)
  .put(...documentRules, validate, updateDocument)
  .delete(deleteDocument);

// ─────────────────────────────────────────────────────────────────────────────
// Auto-save
// ─────────────────────────────────────────────────────────────────────────────
router.patch('/:id/autosave', ...autoSaveRules, validate, autoSave);
router.patch('/:id/autosave/settings', updateAutoSaveSettings);

// ─────────────────────────────────────────────────────────────────────────────
// Sharing & collaboration & Favorites
// ─────────────────────────────────────────────────────────────────────────────
router.post('/:id/share', ...shareRules, validate, shareDocument);
router.delete('/:id/collaborators/:userId', removeCollaborator);
router.patch('/:id/favorite', toggleFavorite);

// ─────────────────────────────────────────────────────────────────────────────
// Version history
// ─────────────────────────────────────────────────────────────────────────────
router.get('/:id/versions', getVersionHistory);
router.get('/:id/versions/:versionId', getVersion);
router.post('/:id/versions/:versionId/restore', restoreVersion);

// ─────────────────────────────────────────────────────────────────────────────
// Edit Modes & Locking
// ─────────────────────────────────────────────────────────────────────────────
router.patch('/:id/mode', switchMode);
router.patch('/:id/lock', lockDocument);
router.patch('/:id/unlock', unlockDocument);

// ─────────────────────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────────────────────
router.post('/:id/duplicate', duplicateDocument);

module.exports = router;
