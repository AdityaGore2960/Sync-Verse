const Document = require('../models/Document.model');
const User     = require('../models/User.model');
const { v4: uuidv4 } = require('uuid');

// ─────────────────────────────────────────────────────────────────────────────
// Helper: populate standard fields
// ─────────────────────────────────────────────────────────────────────────────
const populateDoc = (query) =>
  query
    .populate('owner',                   'name email avatar')
    .populate('lastEditedBy',            'name email avatar')
    .populate('lockedBy',                'name email avatar')
    .populate('collaborators.user',      'name email avatar')
    .populate('collaborators.addedBy',   'name email')
    .populate('versionHistory.savedBy',  'name email');

// ═════════════════════════════════════════════════════════════════════════════
// CREATE DOCUMENT
// POST /api/documents
// ═════════════════════════════════════════════════════════════════════════════
exports.createDocument = async (req, res, next) => {
  try {
    const { title, description, template, isPublic, tags } = req.body;

    let initialContent = '';
    const selectedTemplate = template || 'Blank';

    if (selectedTemplate.toLowerCase() === 'notes') {
      initialContent = "## Notes\n\n- Add your notes here...";
    } else if (selectedTemplate.toLowerCase() === 'to-do') {
      initialContent = "### To-Do List\n\n- [ ] Task 1\n- [ ] Task 2";
    } else if (selectedTemplate.toLowerCase() === 'resume') {
      initialContent = "# Resume\n\n## Experience\n- Role at Company\n\n## Education\n- Degree at School";
    } else if (selectedTemplate.toLowerCase() === 'proposal' || selectedTemplate.toLowerCase() === 'project') {
      initialContent = "# Proposal\n\n## Objective\nBriefly state the goal.\n\n## Scope\nDetail the project scope.";
    }

    const doc = await Document.create({
      title:       title || 'Untitled Document',
      description: description || '',
      template:    selectedTemplate,
      content:     initialContent,
      owner:       req.user.id,
      isPublic:    !!isPublic,
      tags:        tags || [],
      roomId:      uuidv4(),
    });

    await populateDoc(Document.findById(doc._id)).then(d => {
      res.status(201).json({
        success:  true,
        message:  'Document created successfully',
        document: d,
      });
    });
  } catch (err) {
    next(err);
  }
};

// ═════════════════════════════════════════════════════════════════════════════
// GET ALL DOCUMENTS  (owned only, sorted by updatedAt)
// GET /api/documents?search=term
// ═════════════════════════════════════════════════════════════════════════════
exports.getDocuments = async (req, res, next) => {
  try {
    const { search = '' } = req.query;

    const query = {
      owner:     req.user.id,
      isDeleted: { $ne: true },
      title:     { $regex: search, $options: 'i' },
    };

    const documents = await populateDoc(
      Document.find(query).sort({ updatedAt: -1 })
    );

    res.status(200).json({
      success:   true,
      count:     documents.length,
      documents: documents,
    });
  } catch (err) {
    next(err);
  }
};

// ═════════════════════════════════════════════════════════════════════════════
// GET SHARED WITH ME
// GET /api/documents/shared-with-me
// ═════════════════════════════════════════════════════════════════════════════
exports.getSharedWithMe = async (req, res, next) => {
  try {
    const documents = await populateDoc(
      Document.find({
        'collaborators.user': req.user.id,
        isDeleted: { $ne: true }
      }).sort({ updatedAt: -1 })
    );

    res.status(200).json({
      success: true,
      documents: documents
    });
  } catch (err) {
    next(err);
  }
};

// ═════════════════════════════════════════════════════════════════════════════
// GET SHARED BY ME
// GET /api/documents/shared-by-me
// ═════════════════════════════════════════════════════════════════════════════
exports.getSharedByMe = async (req, res, next) => {
  try {
    const documents = await populateDoc(
      Document.find({
        owner: req.user.id,
        collaborators: { $not: { $size: 0 } },
        isDeleted: { $ne: true }
      }).sort({ updatedAt: -1 })
    );

    res.status(200).json({
      success: true,
      documents: documents
    });
  } catch (err) {
    next(err);
  }
};

// ═════════════════════════════════════════════════════════════════════════════
// GET FAVORITES
// GET /api/documents/favorites
// ═════════════════════════════════════════════════════════════════════════════
exports.getFavorites = async (req, res, next) => {
  try {
    const documents = await populateDoc(
      Document.find({
        starredBy: req.user.id,
        isDeleted: { $ne: true }
      }).sort({ updatedAt: -1 })
    );

    res.status(200).json({
      success: true,
      documents: documents
    });
  } catch (err) {
    next(err);
  }
};

// ═════════════════════════════════════════════════════════════════════════════
// TOGGLE FAVORITE
// PATCH /api/documents/:id/favorite
// ═════════════════════════════════════════════════════════════════════════════
exports.toggleFavorite = async (req, res, next) => {
  try {
    const doc = await Document.findOne({ _id: req.params.id, isDeleted: { $ne: true } });
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    if (!doc.canRead(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const isStarred = doc.starredBy.includes(req.user.id);
    if (isStarred) {
       doc.starredBy = doc.starredBy.filter(id => id.toString() !== req.user.id);
    } else {
       doc.starredBy.push(req.user.id);
    }

    await doc.save();
    
    res.status(200).json({ 
      success:   true, 
      isStarred: !isStarred, 
      message:   !isStarred ? 'Added to favorites' : 'Removed from favorites' 
    });
  } catch (err) {
    next(err);
  }
};

// ═════════════════════════════════════════════════════════════════════════════
// GET SINGLE DOCUMENT
// GET /api/documents/:id
// ═════════════════════════════════════════════════════════════════════════════
exports.getDocument = async (req, res, next) => {
  try {
    const doc = await populateDoc(
      Document.findOne({ _id: req.params.id, isDeleted: { $ne: true } })
    );

    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    if (!doc.canRead(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Determine caller's access level
    const isOwner = doc.owner._id.toString() === req.user.id;
    const collab  = doc.collaborators.find(c => c.user._id.toString() === req.user.id);
    const access  = isOwner ? 'owner' : (collab?.role || (doc.isPublic ? 'public' : 'none'));

    res.status(200).json({ success: true, access, document: doc });
  } catch (err) {
    next(err);
  }
};

// ═════════════════════════════════════════════════════════════════════════════
// UPDATE DOCUMENT  (title, content, tags, isPublic)
// PUT /api/documents/:id
// ═════════════════════════════════════════════════════════════════════════════
exports.updateDocument = async (req, res, next) => {
  try {
    const { title, content, isPublic, tags, changeNote } = req.body;

    const doc = await Document.findOne({ _id: req.params.id, isDeleted: { $ne: true } });
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    if (!doc.canWrite(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Not authorised to edit this document' });
    }

    const isOwner = doc.owner.toString() === req.user.id;

    // Snapshot the current state before applying changes
    const contentChanged = content !== undefined && content !== doc.content;
    const titleChanged   = title   !== undefined && title   !== doc.title;

    if (contentChanged || titleChanged) {
      doc.pushVersion({
        content:    doc.content,
        title:      doc.title,
        savedBy:    req.user.id,
        changeNote: changeNote || '',
        isAutoSave: false,
      });
    }

    // Apply changes
    if (title   !== undefined) doc.title   = title;
    if (content !== undefined) doc.content = content;
    if (tags    !== undefined) doc.tags    = tags;
    if (isPublic !== undefined && isOwner) doc.isPublic = isPublic;
    doc.lastEditedBy = req.user.id;

    await doc.save();
    await populateDoc(Document.findById(doc._id)).then(d => {
      res.status(200).json({ success: true, message: 'Document updated', document: d });
    });
  } catch (err) {
    next(err);
  }
};

// ═════════════════════════════════════════════════════════════════════════════
// AUTO-SAVE  — lightweight, no version snapshot
// PATCH /api/documents/:id/autosave
// ═════════════════════════════════════════════════════════════════════════════
exports.autoSave = async (req, res, next) => {
  try {
    const { content, title } = req.body;

    const doc = await Document.findOne({ _id: req.params.id, isDeleted: { $ne: true } });
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    if (!doc.canWrite(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Not authorised' });
    }

    // Push an auto-save snapshot if content actually changed
    const contentChanged = content !== undefined && content !== doc.content;
    if (contentChanged) {
      doc.pushVersion({
        content,
        title:      title || doc.title,
        savedBy:    req.user.id,
        changeNote: 'Auto-save',
        isAutoSave: true,
      });
    }

    if (title   !== undefined) doc.title   = title;
    if (content !== undefined) doc.content = content;
    doc.lastEditedBy          = req.user.id;
    doc.autoSave.lastAutoSavedAt = new Date();
    doc.autoSave.pendingContent  = '';     // clear pending draft

    // Minimal save — only update relevant fields
    await doc.save();

    res.status(200).json({
      success:         true,
      message:         'Auto-saved',
      savedAt:         doc.autoSave.lastAutoSavedAt,
      currentVersion:  doc.currentVersion,
      wordCount:       doc.wordCount,
      charCount:       doc.charCount,
    });
  } catch (err) {
    next(err);
  }
};

// ═════════════════════════════════════════════════════════════════════════════
// DELETE DOCUMENT  (soft-delete — owner only)
// DELETE /api/documents/:id
// ═════════════════════════════════════════════════════════════════════════════
exports.deleteDocument = async (req, res, next) => {
  try {
    const doc = await Document.findOne({ _id: req.params.id, isDeleted: { $ne: true } });

    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    if (doc.owner.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Only the owner can delete this document' });
    }

    await Document.findByIdAndDelete(req.params.id);

    res.status(200).json({ 
      success: true, 
      message: 'Document deleted successfully',
      id:      req.params.id 
    });
  } catch (err) {
    next(err);
  }
};

// ═════════════════════════════════════════════════════════════════════════════
// SHARE DOCUMENT  — add or update a collaborator's role
// POST /api/documents/:id/share
// Body: { email, role }  or  { userId, role }
// ═════════════════════════════════════════════════════════════════════════════
exports.shareDocument = async (req, res, next) => {
  try {
    const { userId, email, role } = req.body;

    if (!role || !['viewer', 'editor'].includes(role)) {
      return res.status(400).json({ success: false, message: "role must be 'viewer' or 'editor'" });
    }
    if (!userId && !email) {
      return res.status(400).json({ success: false, message: 'Provide userId or email' });
    }

    const doc = await Document.findOne({ _id: req.params.id, isDeleted: { $ne: true } });
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    if (doc.owner.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Only the owner can share this document' });
    }

    // Resolve target user
    const targetUser = userId
      ? await User.findById(userId)
      : await User.findOne({ email: email.toLowerCase() });

    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'Target user not found' });
    }

    if (targetUser._id.toString() === req.user.id) {
      return res.status(400).json({ success: false, message: 'Cannot share with yourself' });
    }

    // Upsert collaborator entry
    const existingIdx = doc.collaborators.findIndex(
      c => c.user.toString() === targetUser._id.toString()
    );

    if (existingIdx > -1) {
      doc.collaborators[existingIdx].role    = role;
    } else {
      doc.collaborators.push({
        user:    targetUser._id,
        role,
        addedBy: req.user.id,
      });
    }

    await doc.save();
    await doc.populate('collaborators.user', 'name email avatar');

    // ── REAL-TIME: Notify the affected user ──────────────────────────
    const io = req.app.get('io');
    if (io) {
      io.to(targetUser._id.toString()).emit('document:access-changed', {
        documentId: doc._id,
        role:       role,
      });
    }

    res.status(200).json({
      success:       true,
      message:       `Shared with ${targetUser.email} as ${role}`,
      collaborators: doc.collaborators,
    });
  } catch (err) {
    next(err);
  }
};

// ═════════════════════════════════════════════════════════════════════════════
// REMOVE COLLABORATOR
// DELETE /api/documents/:id/collaborators/:userId
// ═════════════════════════════════════════════════════════════════════════════
exports.removeCollaborator = async (req, res, next) => {
  try {
    const doc = await Document.findOne({ _id: req.params.id, isDeleted: { $ne: true } });
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    const isOwner = doc.owner.toString() === req.user.id;
    const isSelf  = req.params.userId === req.user.id;  // user leaving themselves

    if (!isOwner && !isSelf) {
      return res.status(403).json({ success: false, message: 'Not authorised' });
    }

    doc.collaborators = doc.collaborators.filter(
      c => c.user.toString() !== req.params.userId
    );

    await doc.save();

    // ── REAL-TIME: Boot the user (if they are currently editing) ───
    const io = req.app.get('io');
    if (io) {
      io.to(req.params.userId).emit('document:access-revoked', {
        documentId: doc._id,
      });
    }

    res.status(200).json({ success: true, message: 'Collaborator removed', collaborators: doc.collaborators });
  } catch (err) {
    next(err);
  }
};

// ═════════════════════════════════════════════════════════════════════════════
// GET VERSION HISTORY  (metadata only, no full content)
// GET /api/documents/:id/versions
// ═════════════════════════════════════════════════════════════════════════════
exports.getVersionHistory = async (req, res, next) => {
  try {
    const doc = await Document.findOne({ _id: req.params.id, isDeleted: { $ne: true } })
      .populate('versionHistory.savedBy', 'name email avatar')
      .select('versionHistory currentVersion owner collaborators isPublic');

    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    if (!doc.canRead(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Return history newest first, without the full content to keep payload small
    const history = [...doc.versionHistory]
      .sort((a, b) => b.version - a.version)
      .map(v => ({
        _id:        v._id,
        version:    v.version,
        title:      v.title,
        savedBy:    v.savedBy,
        savedAt:    v.savedAt,
        changeNote: v.changeNote,
        wordCount:  v.wordCount,
        charCount:  v.charCount,
        isAutoSave: v.isAutoSave,
      }));

    res.status(200).json({
      success:        true,
      currentVersion: doc.currentVersion,
      totalVersions:  history.length,
      versions:       history,
    });
  } catch (err) {
    next(err);
  }
};

// ═════════════════════════════════════════════════════════════════════════════
// GET SINGLE VERSION (full content)
// GET /api/documents/:id/versions/:versionId
// ═════════════════════════════════════════════════════════════════════════════
exports.getVersion = async (req, res, next) => {
  try {
    const doc = await Document.findOne({ _id: req.params.id, isDeleted: { $ne: true } })
      .populate('versionHistory.savedBy', 'name email avatar');

    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    if (!doc.canRead(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const version = doc.versionHistory.id(req.params.versionId);
    if (!version) {
      return res.status(404).json({ success: false, message: 'Version not found' });
    }

    res.status(200).json({ success: true, version });
  } catch (err) {
    next(err);
  }
};

// ═════════════════════════════════════════════════════════════════════════════
// RESTORE VERSION  — snapshot current → apply old version as new content
// POST /api/documents/:id/versions/:versionId/restore
// ═════════════════════════════════════════════════════════════════════════════
exports.restoreVersion = async (req, res, next) => {
  try {
    const doc = await Document.findOne({ _id: req.params.id, isDeleted: { $ne: true } });
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    if (!doc.canWrite(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Not authorised to restore versions' });
    }

    const targetVersion = doc.versionHistory.id(req.params.versionId);
    if (!targetVersion) {
      return res.status(404).json({ success: false, message: 'Version not found' });
    }

    // Snapshot current state first
    doc.pushVersion({
      content:    doc.content,
      title:      doc.title,
      savedBy:    req.user.id,
      changeNote: `Before restore to version ${targetVersion.version}`,
      isAutoSave: false,
    });

    // Restore
    doc.content      = targetVersion.content;
    doc.title        = targetVersion.title || doc.title;
    doc.lastEditedBy = req.user.id;

    await doc.save();

    res.status(200).json({
      success:  true,
      message:  `Restored to version ${targetVersion.version}`,
      document: {
        _id:            doc._id,
        title:          doc.title,
        content:        doc.content,
        currentVersion: doc.currentVersion,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ═════════════════════════════════════════════════════════════════════════════
// DUPLICATE DOCUMENT
// POST /api/documents/:id/duplicate
// ═════════════════════════════════════════════════════════════════════════════
exports.duplicateDocument = async (req, res, next) => {
  try {
    const original = await Document.findOne({ _id: req.params.id, isDeleted: { $ne: true } });
    if (!original) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    if (!original.canRead(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const copy = await Document.create({
      title:   `${original.title} (Copy)`,
      content: original.content,
      owner:   req.user.id,
      tags:    original.tags,
      roomId:  uuidv4(),
      isPublic: false,
    });

    await copy.populate('owner', 'name email avatar');

    res.status(201).json({
      success:  true,
      message:  'Document duplicated',
      document: copy,
    });
  } catch (err) {
    next(err);
  }
};

// ═════════════════════════════════════════════════════════════════════════════
// UPDATE AUTO-SAVE SETTINGS
// PATCH /api/documents/:id/autosave/settings
// ═════════════════════════════════════════════════════════════════════════════
exports.updateAutoSaveSettings = async (req, res, next) => {
  try {
    const { enabled, intervalSeconds } = req.body;

    const doc = await Document.findOne({ _id: req.params.id, isDeleted: { $ne: true } });
    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    if (doc.owner.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Only owner can change auto-save settings' });
    }

    if (enabled          !== undefined) doc.autoSave.enabled         = enabled;
    if (intervalSeconds  !== undefined) doc.autoSave.intervalSeconds = intervalSeconds;

    await doc.save();

    res.status(200).json({ success: true, autoSave: doc.autoSave });
  } catch (err) {
    next(err);
  }
};

// ═════════════════════════════════════════════════════════════════════════════
// GLOBAL SEARCH
// GET /api/documents/search?q=query
// ═════════════════════════════════════════════════════════════════════════════
exports.searchDocuments = async (req, res, next) => {
  try {
    const { q = '' } = req.query;

    if (!q.trim()) {
      return res.status(200).json({ success: true, documents: [] });
    }

    const searchQuery = {
      $and: [
        { isDeleted: { $ne: true } },
        {
          $or: [
            { owner: req.user.id },
            { 'collaborators.user': req.user.id },
            { isPublic: true }
          ]
        },
        {
          $or: [
            { title: { $regex: q, $options: 'i' } },
            { tags: { $in: [new RegExp(q, 'i')] } }
          ]
        }
      ]
    };

    const documents = await Document.find(searchQuery)
      .select('title tags updatedAt owner')
      .populate('owner', 'name avatar')
      .limit(10)
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      documents
    });
  } catch (err) {
    next(err);
  }
};
// ═════════════════════════════════════════════════════════════════════════════
// SWITCH EDIT MODE (single/multi)
// PATCH /api/documents/:id/mode
// Body: { mode }
// ═════════════════════════════════════════════════════════════════════════════
exports.switchMode = async (req, res, next) => {
  try {
    const { mode } = req.body;
    if (!['single', 'multi'].includes(mode)) {
      return res.status(400).json({ success: false, message: 'Invalid mode' });
    }

    const doc = await Document.findOne({ _id: req.params.id, isDeleted: { $ne: true } });
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });

    if (doc.owner.toString() !== req.user.id) {
       return res.status(403).json({ success: false, message: 'Only organic owner can change mode' });
    }

    doc.editMode = mode;
    
    // Auto-unlock if switching to multi
    if (mode === 'multi') {
      doc.lockedBy = null;
    } else {
      // Auto-lock if switching to single
      doc.lockedBy = req.user.id;
    }

    await doc.save();
    
    // Broadcast via socket
    const io = req.app.get('io');
    if (io) {
      io.to(doc.roomId).emit('document:mode-changed', {
        mode,
lockedBy: doc.lockedBy,
        user:       req.user.name
      });
    }

    res.status(200).json({ success: true, mode, lockedBy: doc.lockedBy });
  } catch (err) {
    next(err);
  }
};

// ═════════════════════════════════════════════════════════════════════════════
// LOCK DOCUMENT
// PATCH /api/documents/:id/lock
// ═════════════════════════════════════════════════════════════════════════════
exports.lockDocument = async (req, res, next) => {
  try {
    const doc = await Document.findOne({ _id: req.params.id, isDeleted: { $ne: true } });
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });

    if (!doc.canWrite(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Not authorised to lock' });
    }

    if (doc.lockedBy && doc.lockedBy.toString() !== req.user.id) {
      return res.status(409).json({ success: false, message: 'Document is already locked by another user' });
    }

    doc.lockedBy = req.user.id;
    await doc.save();

    // Broadcast
    const io = req.app.get('io');
    if (io) {
      io.to(doc.roomId).emit('document:locked', {
        lockedBy: req.user.id,
        userName: req.user.name
      });
    }

    res.status(200).json({ success: true, lockedBy: req.user.id });
  } catch (err) {
    next(err);
  }
};

// ═════════════════════════════════════════════════════════════════════════════
// UNLOCK DOCUMENT
// PATCH /api/documents/:id/unlock
// ═════════════════════════════════════════════════════════════════════════════
exports.unlockDocument = async (req, res, next) => {
  try {
    const doc = await Document.findOne({ _id: req.params.id, isDeleted: { $ne: true } });
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });

    // Only owner or current locker can unlock
    const isOwner = doc.owner.toString() === req.user.id;
    const isLocker = doc.lockedBy && doc.lockedBy.toString() === req.user.id;

    if (!isOwner && !isLocker) {
      return res.status(403).json({ success: false, message: 'Not authorised to unlock' });
    }

    doc.lockedBy = null;
    await doc.save();

    // Broadcast
    const io = req.app.get('io');
    if (io) {
      io.to(doc.roomId).emit('document:unlocked', {
        unlockedBy: req.user.id,
        userName:   req.user.name
      });
    }

    res.status(200).json({ success: true, message: 'Document unlocked' });
  } catch (err) {
    next(err);
  }
};
