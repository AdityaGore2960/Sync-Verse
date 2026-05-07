const mongoose = require('mongoose');

// ─────────────────────────────────────────────────────────────────────────────
// Sub-schema: Collaborator permission entry
// ─────────────────────────────────────────────────────────────────────────────
const CollaboratorSchema = new mongoose.Schema(
  {
    user: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
    },
    role: {
      type:    String,
      enum:    ['viewer', 'editor', 'owner'],
      default: 'viewer',
    },
    addedAt: {
      type:    Date,
      default: Date.now,
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'User',
    },
  },
  { _id: false }
);

// ─────────────────────────────────────────────────────────────────────────────
// Sub-schema: Version / snapshot entry
// ─────────────────────────────────────────────────────────────────────────────
const VersionSchema = new mongoose.Schema(
  {
    version: {
      type:     Number,
      required: true,
    },
    title: {
      type:    String,
      default: '',
    },
    content: {
      type:     String,
    },
    savedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'User',
    },
    savedAt: {
      type:    Date,
      default: Date.now,
    },
    changeNote: {
      type:    String,
      default: '',
      maxlength: [300, 'Change note cannot exceed 300 characters'],
    },
    wordCount: {
      type:    Number,
      default: 0,
    },
    charCount: {
      type:    Number,
      default: 0,
    },
    isAutoSave: {
      type:    Boolean,
      default: false,
    },
  },
  { _id: true }
);

// ─────────────────────────────────────────────────────────────────────────────
// Sub-schema: Auto-save metadata
// ─────────────────────────────────────────────────────────────────────────────
const AutoSaveSchema = new mongoose.Schema(
  {
    enabled: {
      type:    Boolean,
      default: true,
    },
    intervalSeconds: {
      type:    Number,
      default: 30,              // client polls every 30 s
      min:     10,
      max:     300,
    },
    lastAutoSavedAt: {
      type: Date,
    },
    pendingContent: {
      type:    String,          // in-flight draft, cleared after commit
      default: '',
    },
  },
  { _id: false }
);

// ─────────────────────────────────────────────────────────────────────────────
// Main Document schema
// ─────────────────────────────────────────────────────────────────────────────
const DocumentSchema = new mongoose.Schema(
  {
    // ── Content ──────────────────────────────────────────────────────────────
    title: {
      type:      String,
      required:  [true, 'Document title is required'],
      trim:      true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
      default:   'Untitled Document',
    },
    description: {
      type:    String,
      trim:    true,
      default: '',
    },
    template: {
      type:    String,
      enum:    ['Blank', 'Notes', 'To-Do', 'Resume', 'Proposal', 'blank', 'notes', 'to-do', 'resume', 'proposal'],
      default: 'Blank',
    },
    content: {
      type:    String,
      default: '',
    },

    // ── Ownership ─────────────────────────────────────────────────────────────
    owner: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
    },
    lastEditedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'User',
    },

    // ── Collaboration ─────────────────────────────────────────────────────────
    collaborators: [CollaboratorSchema],   // users with explicit access
    
    // ── Favorites ─────────────────────────────────────────────────────────────
    starredBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    // ── Visibility ────────────────────────────────────────────────────────────
    isPublic: {
      type:    Boolean,
      default: false,
    },

    // ── Organisation ─────────────────────────────────────────────────────────
    tags: [{ type: String, trim: true, maxlength: 50 }],

    // ── Version history ───────────────────────────────────────────────────────
    versionHistory:  [VersionSchema],
    currentVersion:  { type: Number, default: 1 },

    // ── Auto-save ─────────────────────────────────────────────────────────────
    autoSave: {
      type:    AutoSaveSchema,
      default: () => ({}),
    },

    // ── Soft-delete ───────────────────────────────────────────────────────────
    isDeleted: {
      type:    Boolean,
      default: false,
      select:  false,
    },
    deletedAt: {
      type:   Date,
      select: false,
    },

    // ── Real-time ─────────────────────────────────────────────────────────────
    roomId: {
      type:   String,
      unique: true,
      sparse: true,
    },
    editMode: {
      type:    String,
      enum:    ['single', 'multi'],
      default: 'multi',
    },
    lockedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'User',
    },
  },
  {
    timestamps: true,
    toJSON:     { virtuals: true },
    toObject:   { virtuals: true },
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// Virtuals
// ─────────────────────────────────────────────────────────────────────────────
DocumentSchema.virtual('wordCount').get(function () {
  if (!this.content) return 0;
  return this.content.trim().split(/\s+/).filter(Boolean).length;
});

DocumentSchema.virtual('charCount').get(function () {
  return this.content ? this.content.length : 0;
});

DocumentSchema.virtual('collaboratorCount').get(function () {
  return this.collaborators ? this.collaborators.length : 0;
});

DocumentSchema.virtual('versionCount').get(function () {
  return this.versionHistory ? this.versionHistory.length : 0;
});

// helper to get string ID from a potentially populated field
const getStrId = (id) => {
  if (!id) return null;
  return typeof id === 'object' && id._id ? id._id.toString() : id.toString();
};

// ─────────────────────────────────────────────────────────────────────────────
// Instance method: check if a user can read this document
// ─────────────────────────────────────────────────────────────────────────────
DocumentSchema.methods.canRead = function (userId) {
  if (!userId) return false;
  const uidStr = userId.toString();
  
  if (this.isPublic) return true;
  
  const ownerId = getStrId(this.owner);
  if (ownerId === uidStr) return true;
  
  return this.collaborators.some(c => getStrId(c.user) === uidStr);
};

// ─────────────────────────────────────────────────────────────────────────────
// Instance method: check if a user can write to this document
// ─────────────────────────────────────────────────────────────────────────────
DocumentSchema.methods.canWrite = function (userId) {
  if (!userId) return false;
  const uidStr = userId.toString();

  const ownerId = getStrId(this.owner);
  if (ownerId === uidStr) return true;
  
  const collab = this.collaborators.find(c => getStrId(c.user) === uidStr);
  return collab && (collab.role === 'editor' || collab.role === 'owner');
};

// ─────────────────────────────────────────────────────────────────────────────
// Instance method: push a version snapshot
// Keeps max 50 manually saved + last 20 auto-saves
// ─────────────────────────────────────────────────────────────────────────────
DocumentSchema.methods.pushVersion = function ({ content, title, savedBy, changeNote = '', isAutoSave = false }) {
  const countWords = (text) => (text || '').trim().split(/\s+/).filter(Boolean).length;
  
  const finalContent = content !== undefined ? content : (this.content || '');
  const finalTitle   = title   !== undefined ? title   : (this.title   || 'Untitled');

  this.versionHistory.push({
    version:    this.currentVersion,
    title:      finalTitle,
    content:    finalContent,
    savedBy,
    changeNote,
    wordCount:  countWords(finalContent),
    charCount:  finalContent.length,
    isAutoSave,
  });

  this.currentVersion += 1;

  // Prune: keep last 50 manual + 20 auto-saves
  const manual = this.versionHistory.filter(v => !v.isAutoSave).slice(-50);
  const auto   = this.versionHistory.filter(v =>  v.isAutoSave).slice(-20);
  this.versionHistory = [...manual, ...auto].sort((a, b) => a.version - b.version);
};

// ─────────────────────────────────────────────────────────────────────────────
// Indexes
// ─────────────────────────────────────────────────────────────────────────────
DocumentSchema.index({ owner: 1 });
DocumentSchema.index({ 'collaborators.user': 1 });
DocumentSchema.index({ starredBy: 1 });
DocumentSchema.index({ title: 'text', tags: 'text' });
DocumentSchema.index({ isDeleted: 1 });
DocumentSchema.index({ roomId: 1 });

module.exports = mongoose.model('Document', DocumentSchema);
