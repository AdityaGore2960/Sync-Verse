const Document = require('../models/Document.model');

/**
 * Document handler — manages all document-room socket events.
 *
 * Events the CLIENT sends → SERVER (emit):
 *   document:join        { documentId }
 *   document:leave       { documentId }
 *   document:change      { documentId, delta, content, version }        ← OT delta
 *   document:cursor      { documentId, cursor: { line, ch, anchor? } }
 *   document:typing      { documentId, isTyping }
 *   document:save        { documentId, content, title, changeNote }
 *   document:title       { documentId, title }
 *
 * Events the SERVER sends → CLIENT (broadcast):
 *   document:joined      { document, users, you }                       ← on join
 *   document:user-joined { user }                                       ← others
 *   document:user-left   { userId, name }                               ← others
 *   document:change      { delta, content, version, sender }            ← OT broadcast
 *   document:cursor      { userId, name, color, cursor }                ← cursor move
 *   document:typing      { userId, name, isTyping, color }              ← typing indicator
 *   document:saved       { documentId, savedAt, version, savedBy }      ← after save
 *   document:title       { documentId, title, updatedBy }               ← title update
 *   document:error       { message }                                    ← error
 */

const {
  joinRoom, leaveRoom, getRoomUsers, updateCursor, updateTyping,
} = require('./presence');

// Throttle: track last-save per document to avoid rapid DB writes
const saveThrottle = new Map(); // documentId → timestamp
const SAVE_THROTTLE_MS = 2000;

// ─── Helper: resolve roomId from documentId ────────────────────────────────
const getRoomId = (documentId) => `doc:${documentId}`;

// ─── Helper: verify access to a document ──────────────────────────────────
const verifyAccess = async (documentId, userId, requireWrite = false) => {
  const doc = await Document.findOne({ _id: documentId, isDeleted: { $ne: true } });
  if (!doc) return { error: 'Document not found', doc: null };

  const canAccess = requireWrite ? doc.canWrite(userId) : doc.canRead(userId);
  if (!canAccess) return { error: 'Access denied', doc: null };

  return { error: null, doc };
};

// ─────────────────────────────────────────────────────────────────────────────
// Register all document events on a socket
// ─────────────────────────────────────────────────────────────────────────────
const registerDocumentHandlers = (io, socket) => {
  const user = socket.user;

  // ── GET DOCUMENT (Alias for document:join to match requirements) ──────────
  socket.on('get-document', (data) => joinDocument(data));
  socket.on('document:join', (data) => joinDocument(data));

  const joinDocument = async ({ documentId } = {}) => {
    if (!documentId) return socket.emit('document:error', { message: 'documentId is required' });

    const { error, doc } = await verifyAccess(documentId, user.id, false);
    if (error) return socket.emit('document:error', { message: error });

    const roomId = getRoomId(documentId);

    // Leave any previous document room (enforce one active doc per socket)
    if (socket.currentRoom) {
      handleLeaveRoom(io, socket, socket.currentRoom);
    }

    // Join new room
    socket.join(roomId);
    socket.currentRoom    = roomId;
    socket.currentDocId   = documentId;

    joinRoom(roomId, socket.id, user);

    const roomUsers = getRoomUsers(roomId);

    const access = doc.owner.toString() === user.id.toString() 
      ? 'owner' 
      : (doc.collaborators.find(c => c.user.toString() === user.id.toString())?.role || 'viewer');

    // Send the full document + user list ONLY to the joining socket
    const joinedPayload = {
      document: {
        _id:            doc._id,
        title:          doc.title,
        content:        doc.content,
        currentVersion: doc.currentVersion,
        isPublic:       doc.isPublic,
        owner:          doc.owner,
        collaborators:  doc.collaborators,
        autoSave:       doc.autoSave,
        updatedAt:      doc.updatedAt,
        editMode:       doc.editMode,
        lockedBy:       doc.lockedBy,
      },
      users: roomUsers,
      you:   { ...user, color: roomUsers.find(u => u.id === user.id)?.color },
      access,
    };

    socket.emit('document:joined', joinedPayload);
    socket.emit('load-document', joinedPayload); // Alias for specific requirement

    // Notify everyone else that a new user joined
    socket.to(roomId).emit('user-joined', {
      user: roomUsers.find(u => u.id === user.id),
    });

    console.log(`📄 [${doc.title}] — ${user.name} joined via socket (${roomUsers.length} active)`);
  };

  // ── LEAVE DOCUMENT ROOM ───────────────────────────────────────────────────
  socket.on('document:leave', ({ documentId } = {}) => {
    const roomId = getRoomId(documentId || socket.currentDocId);
    handleLeaveRoom(io, socket, roomId);
  });

  // ── REAL-TIME CONTENT CHANGE (Delta/OT broadcast) ─────────────────────────
  socket.on('send-changes', ({ documentId, delta, content, version } = {}) => {
    if (!documentId || !socket.currentRoom) return;

    const roomId = getRoomId(documentId);

    // Broadcast the change to ALL OTHER users in the room (not sender)
    socket.to(roomId).emit('receive-changes', {
      delta,                    // Operational Transform delta (Quill / ProseMirror format)
      content,                  // Full content fallback
      version,                  // Optimistic version counter from client
      sender: {
        id:    user.id,
        name:  user.name,
        color: getRoomUsers(roomId).find(u => u.id === user.id)?.color,
      },
    });
  });

  // ── CURSOR POSITION ───────────────────────────────────────────────────────
  socket.on('document:cursor', ({ documentId, cursor } = {}) => {
    if (!documentId || !cursor) return;

    const roomId = getRoomId(documentId);
    updateCursor(roomId, socket.id, cursor);

    const users  = getRoomUsers(roomId);
    const color  = users.find(u => u.id === user.id)?.color;

    socket.to(roomId).emit('document:cursor', {
      userId: user.id,
      name:   user.name,
      avatar: user.avatar,
      color,
      cursor,
    });
  });

  // ── TYPING INDICATOR ──────────────────────────────────────────────────────
  socket.on('document:typing', ({ documentId, isTyping } = {}) => {
    if (!documentId) return;

    const roomId = getRoomId(documentId);
    updateTyping(roomId, socket.id, !!isTyping);

    const color = getRoomUsers(roomId).find(u => u.id === user.id)?.color;

    socket.to(roomId).emit('document:typing', {
      userId:   user.id,
      name:     user.name,
      avatar:   user.avatar,
      isTyping: !!isTyping,
      color,
    });
  });

  // ── MANUAL SAVE ──────────────────────────────────────────────────────────
  socket.on('save-document', async ({ documentId, content, title, changeNote } = {}) => {
    if (!documentId) return;

    // Throttle: no more than 1 DB write every 2 s per document
    const now   = Date.now();
    const lastSave = saveThrottle.get(documentId) || 0;
    if (now - lastSave < SAVE_THROTTLE_MS) {
      return socket.emit('document:saved', { throttled: true });
    }
    saveThrottle.set(documentId, now);

    const { error, doc } = await verifyAccess(documentId, user.id, true);
    if (error) return socket.emit('document:error', { message: error });

    try {
      const contentChanged = content !== undefined && content !== doc.content;
      const titleChanged   = title   !== undefined && title   !== doc.title;

      if (contentChanged || titleChanged) {
        doc.pushVersion({
          content:    doc.content,
          title:      doc.title,
          savedBy:    user.id,
          changeNote: changeNote || 'Saved via socket',
          isAutoSave: false,
        });
      }

      if (content !== undefined) doc.content = content;
      if (title   !== undefined) doc.title   = title;
      doc.lastEditedBy = user.id;
      await doc.save();

      const roomId = getRoomId(documentId);

      // Notify ALL users in room (including sender) about the save
      io.to(roomId).emit('document:saved', {
        documentId,
        savedAt:  new Date().toISOString(),
        version:  doc.currentVersion,
        savedBy:  { id: user.id, name: user.name },
        title:    doc.title,
      });

      console.log(`💾 [${doc.title}] saved by ${user.name} (v${doc.currentVersion})`);
    } catch (err) {
      socket.emit('document:error', { message: 'Save failed: ' + err.message });
    }
  });

  // ── TITLE UPDATE ──────────────────────────────────────────────────────────
  socket.on('document:title', ({ documentId, title } = {}) => {
    if (!documentId || !title) return;
    const roomId = getRoomId(documentId);

    // Broadcast title change instantly (DB persisted on next save)
    socket.to(roomId).emit('document:title', {
      documentId,
      title,
      updatedBy: { id: user.id, name: user.name },
    });
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// Shared leave-room logic (used on explicit leave + disconnect)
// ─────────────────────────────────────────────────────────────────────────────
const handleLeaveRoom = async (io, socket, roomId) => {
  if (!roomId) return;

  const documentId = socket.currentDocId;
  const userId     = socket.user.id;

  const fullyLeft = leaveRoom(roomId, socket.id, userId);
  socket.leave(roomId);

  if (fullyLeft) {
    socket.to(roomId).emit('user-left', {
      userId: userId,
      name:   socket.user.name,
    });

    // AUTO-UNLOCK: If the user who locked the document leaves, release the lock.
    try {
      const doc = await Document.findById(documentId);
      if (doc && doc.lockedBy && doc.lockedBy.toString() === userId.toString()) {
        doc.lockedBy = null;
        await doc.save();
        
        io.to(roomId).emit('document:unlocked', { 
          unlockedBy: userId, 
          userName: socket.user.name,
          auto: true 
        });
        
        console.log(`🔓 [${doc.title}] auto-unlocked — locker left`);
      }
    } catch (err) {
      console.error('Auto-unlock failed:', err.message);
    }
  }

  socket.currentRoom  = null;
  socket.currentDocId = null;
};

module.exports = { registerDocumentHandlers, handleLeaveRoom };
