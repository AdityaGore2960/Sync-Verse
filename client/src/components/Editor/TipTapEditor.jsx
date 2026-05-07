import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { Underline } from '@tiptap/extension-underline';
import { TextAlign } from '@tiptap/extension-text-align';
import { Highlight } from '@tiptap/extension-highlight';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { FontFamily } from '@tiptap/extension-font-family';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
// import { Link } from '@tiptap/extension-link';
import { Placeholder } from '@tiptap/extension-placeholder';
import { TaskItem } from '@tiptap/extension-task-item';
import { TaskList } from '@tiptap/extension-task-list';
// import { HorizontalRule } from '@tiptap/extension-horizontal-rule';
import { Image } from '@tiptap/extension-image';
import { Extension } from '@tiptap/core';

// Custom Font Size Extension
const FontSize = Extension.create({
  name: 'fontSize',
  addOptions() {
    return {
      types: ['textStyle'],
    };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: element => element.style.fontSize.replace(/['"]+/g, ''),
            renderHTML: attributes => {
              if (!attributes.fontSize) return {};
              return { style: `font-size: ${attributes.fontSize}` };
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setFontSize: fontSize => ({ chain }) => {
        return chain().setMark('textStyle', { fontSize }).run();
      },
      unsetFontSize: () => ({ chain }) => {
        return chain().setMark('textStyle', { fontSize: null }).removeEmptyTextStyle().run();
      },
    };
  },
});

import { useEditorStore } from '../../store/useEditorStore';
import { useDocuments } from '../../hooks/useDocuments';
import Navbar from './Navbar';
import Toolbar from './Toolbar';
import Toast from '../Toast';
import './Editor.css';

import {
  ChevronLeft, List as ListIcon, Search, HelpCircle,
  Settings as SettingsIcon, LayoutGrid, ChevronRight
} from 'lucide-react';

import ShareModal from '../ShareModal';
import RenameDocModal from '../RenameDocModal';
import DeleteConfirmModal from '../DeleteConfirmModal';
import OpenDocModal from '../OpenDocModal';
import SaveOptionsModal from '../SaveOptionsModal';
import DocumentDetailsModal from '../DocumentDetailsModal';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

const TipTapEditor = ({ socket, documentId, initialContent }) => {
  const navigate = useNavigate();
  const { title, setTitle, setSaveStatus, saveStatus, collaborators, documentMetadata, setDocumentMetadata } = useEditorStore();
  const { createDocument, duplicateDocument, deleteDocument, updateDocument } = useDocuments();

  const [headings, setHeadings] = useState([]);
  const [showOutline, setShowOutline] = useState(true);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isOpenDocModalOpen, setIsOpenDocModalOpen] = useState(false);
  const [isSaveOptionsModalOpen, setIsSaveOptionsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState(null);

  const isRemoteUpdate = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        history: { depth: 100 },
        heading: { levels: [1, 2, 3, 4, 5, 6] },
        horizontalRule: true,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Highlight.configure({ multicolor: true }),
      TextStyle,
      Color,
      FontFamily,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({ placeholder: 'Type @ to insert, or choose a template...' }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Image,
      FontSize,
    ],
    content: initialContent || '',
    editorProps: {
      attributes: {
        class: 'tiptap-page focus:outline-none',
      },
    },
    onSelectionUpdate: ({ editor }) => {
      const { from } = editor.state.selection;
      socket?.emit('document:cursor', { documentId, cursor: from });
    },
    onUpdate: ({ editor }) => {
      if (isRemoteUpdate.current) return;

      // Wrap in timeout to avoid impurity warnings if called during render/init
      setTimeout(() => {
        const html = editor.getHTML();
        setSaveStatus('unsaved');

        const now = Date.now();
        socket?.emit('send-changes', {
          documentId,
          delta: null,
          content: html,
          version: now
        });

        updateOutline(editor);
      }, 0);
    },
  });

  const { followingId, setFollowingId, setCollaborators } = useEditorStore();

  const updateOutline = useCallback((editorInstance) => {
    if (!editorInstance) return;
    const list = [];
    editorInstance.state.doc.descendants((node, pos) => {
      if (node.type.name === 'heading') {
        list.push({
          level: node.attrs.level,
          text: node.textContent,
          pos,
        });
      }
    });
    setHeadings(list);
  }, []);

  useEffect(() => {
    if (!socket || !editor) return;

    const handleChanges = ({ content, sender }) => {
      if (sender?.id === socket.user?.id) return;

      // Only update if content is different to minimize selection loss
      const currentContent = editor.getHTML();
      if (content === currentContent) return;

      isRemoteUpdate.current = true;

      // Save current selection
      const { from, to } = editor.state.selection;

      editor.commands.setContent(content, false);

      // Try to restore selection roughly
      try {
        editor.commands.setTextSelection({ from, to });
      } catch {
        // Selection might be invalid now, ignore
      }

      isRemoteUpdate.current = false;
      updateOutline(editor);
    };

    const handleCursor = ({ userId, cursor }) => {
      if (userId === socket.id || userId === socket.user?.id) return;
      
      setCollaborators(useEditorStore.getState().collaborators.map(c => 
        c.id === userId ? { ...c, cursor: cursor } : c
      ));

      // Presence Beam: If we are following this user, scroll to them
      if (followingId === userId && editor) {
        try {
          const domPos = editor.view.coordsAtPos(cursor);
          if (domPos) {
            const viewport = document.getElementById('editor-viewport');
            if (viewport) {
              const currentScroll = viewport.scrollTop;
              const targetScroll = domPos.top + currentScroll - (window.innerHeight / 2);
              viewport.scrollTo({ top: targetScroll, behavior: 'smooth' });
            }
          }
        } catch (e) {
          console.warn('Failed to scroll to followed user', e);
        }
      }
    };

    socket.on('receive-changes', handleChanges);
    socket.on('document:cursor', handleCursor);

    // Auto-save logic
    const saveInterval = setInterval(() => {
      const { saveStatus, title } = useEditorStore.getState();
      if (saveStatus === 'unsaved') {
        setSaveStatus('saving');
        socket.emit('save-document', {
          documentId,
          content: editor.getHTML(),
          title: title
        });
      }
    }, 5000); // 5 second auto-save

    return () => {
      socket.off('receive-changes', handleChanges);
      socket.off('document:cursor', handleCursor);
      clearInterval(saveInterval);
    };
  }, [socket, editor, updateOutline, documentId, setSaveStatus, followingId, setCollaborators]);

  // Initial Content load - ensure it only runs once when content truly arrives
  const hasLoadedInitial = useRef(false);
  useEffect(() => {
    if (editor && initialContent && !hasLoadedInitial.current) {
      isRemoteUpdate.current = true;
      editor.commands.setContent(initialContent);
      isRemoteUpdate.current = false;
      updateOutline(editor);
      hasLoadedInitial.current = true;
    }
  }, [editor, initialContent, updateOutline]);

  // Handle manual title update via socket
  const handleRename = async (newTitle) => {
    if (!newTitle || newTitle.trim() === '' || newTitle === title) return;

    const trimmedTitle = newTitle.trim();
    setTitle(trimmedTitle);

    // Update local metadata to reflect the change immediately
    const currentMetadata = useEditorStore.getState().documentMetadata;
    if (currentMetadata) {
      const updatedMetadata = { ...currentMetadata, title: trimmedTitle };
      setDocumentMetadata(updatedMetadata);
      // SYNC WITH GLOBAL CONTEXT (Dashboard list)
      updateDocument(updatedMetadata);
    }

    // Broadcast to others instantly
    socket?.emit('document:title', { documentId, title: trimmedTitle });
    // Persist to DB
    socket?.emit('save-document', { documentId, title: trimmedTitle });
    setIsRenameModalOpen(false);
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await api.delete(`/documents/${documentId}`);
      deleteDocument(documentId);
      setToast({ message: 'Document deleted successfully!', type: 'success' });
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      console.error('Delete failed:', err);
      setToast({ message: 'Failed to delete document.', type: 'error' });
      setIsDeleting(false);
    }
  };

  const handleNew = async () => {
    try {
      const doc = await createDocument({ title: 'Untitled Document' });
      if (doc) {
        navigate(`/document/${doc._id}`);
      }
    } catch (err) {
      console.error('Failed to create new document:', err);
    }
  };

  const handleManualSave = () => {
    if (editor) {
      setSaveStatus('saving');
      socket?.emit('save-document', {
        documentId,
        content: editor.getHTML(),
        title: title
      });
    }
    setIsSaveOptionsModalOpen(true);
  };

  const handleMakeCopy = async () => {
    try {
      setSaveStatus('saving');
      const copy = await duplicateDocument(documentId);
      if (copy) {
        setToast({ message: 'Document copied successfully!', type: 'success' });
        setTimeout(() => navigate(`/document/${copy._id}`), 1000);
      }
    } catch (err) {
      setToast({ message: 'Failed to create a copy.', type: 'error' });
      console.error(err);
    }
  };

  const scrollToHeading = (pos) => {
    editor.commands.focus();
    editor.commands.setTextSelection(pos);
    const element = editor.view.domAtPos(pos).node;
    if (element instanceof HTMLElement) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else if (element.parentElement) {
      element.parentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleDownload = (type) => {
    if (!editor) return;

    if (type === 'pdf') {
      window.print();
      return;
    }

    const content = type === 'txt' ? editor.getText() : editor.getHTML();
    const blob = new Blob([content], { type: type === 'txt' ? 'text/plain' : 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || 'document'}.${type}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDetails = () => {
    setIsDetailsModalOpen(true);
  };

  const getEditorStats = () => {
    if (!editor) return { words: 0, characters: 0 };
    const text = editor.getText();
    return {
      words: text.trim() === '' ? 0 : text.trim().split(/\s+/).length,
      characters: text.length
    };
  };

  return (
    <div className="tiptap-editor-container font-sans bg-bg-canvas">
      <Navbar
        onShare={() => setIsShareModalOpen(true)}
        onOpen={() => setIsOpenDocModalOpen(true)}
        onSave={handleManualSave}
        collaborators={collaborators}
        onRename={(newTitle) => {
          if (typeof newTitle === 'string' && newTitle.trim()) {
            handleRename(newTitle);
          } else {
            setIsRenameModalOpen(true);
          }
        }}
        onDelete={() => setIsDeleteModalOpen(true)}
        onNew={handleNew}
        onMakeCopy={handleMakeCopy}
        onDownload={handleDownload}
        onDetails={handleDetails}
      />

      <div className="flex flex-col items-center sticky top-0 z-40">
        <Toolbar editor={editor} />
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Sidebar Outline */}
        <aside className={`flex flex-col border-r border-border-subtle transition-all duration-300 bg-bg-sidebar no-print ${showOutline ? 'w-64 opacity-100 p-4' : 'w-0 opacity-0 overflow-hidden'}`}>
          <div className="flex items-center gap-2 mb-6 px-1">
            <div className="p-1.5 bg-bg-card-hover rounded-lg text-brand-primary border border-border-subtle"><ListIcon size={16} /></div>
            <span className="text-sm font-bold text-text-heading tracking-tight">Outline</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1 pr-2 custom-scrollbar">
            {headings.length === 0 ? (
              <p className="text-[11px] text-text-muted font-medium px-4">Identify sections in your document to see them here.</p>
            ) : headings.map((h, i) => (
              <button
                key={i}
                onClick={() => scrollToHeading(h.pos)}
                className={`block w-full text-left truncate transition-all border-0 bg-transparent cursor-pointer rounded-lg py-2 px-4 text-xs hover:bg-bg-card-hover hover:text-text-heading ${h.level === 1 ? 'font-bold text-text-body' : h.level === 2 ? 'pl-8 text-text-muted' : 'pl-12 text-text-muted/60'
                  }`}
              >
                {h.text}
              </button>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-border-subtle">
            <div className="flex items-center gap-2 group cursor-pointer px-4 py-2 hover:bg-bg-card-hover rounded-lg transition-colors">
              <Search size={14} className="text-text-muted group-hover:text-brand-primary" />
              <span className="text-xs font-medium text-text-muted group-hover:text-text-heading">Find in document</span>
            </div>
          </div>
        </aside>

        {/* Outline toggle FAB */}
        <button
          onClick={() => setShowOutline(!showOutline)}
          className={`absolute left-0 top-1/2 -translate-y-1/2 z-50 bg-bg-surface border border-border-subtle rounded-r-full p-2 shadow-xl hover:bg-bg-card-hover transition-all border-l-0 no-print flex items-center justify-center cursor-pointer text-text-muted hover:text-text-heading ${showOutline ? 'translate-x-[256px]' : 'translate-x-0'}`}
        >
          {showOutline ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>

        {/* Editor Area */}
        <div className="flex-1 overflow-y-auto tiptap-scroll-area custom-scrollbar" id="editor-viewport">
          <EditorContent editor={editor} />
        </div>

        {/* Floating Utility Icons Right */}
        <div className="w-16 border-l border-border-subtle bg-bg-sidebar flex flex-col items-center py-6 gap-6 no-print">
          <button className="p-2.5 hover:bg-bg-card-hover rounded-xl transition-colors border-0 bg-transparent cursor-pointer text-brand-primary" title="Calendar">
            <LayoutGrid size={20} />
          </button>
          <button className="p-2.5 hover:bg-bg-card-hover rounded-xl transition-colors border-0 bg-transparent cursor-pointer text-amber-500" title="Help">
            <HelpCircle size={20} />
          </button>
          <button className="p-2.5 hover:bg-bg-card-hover rounded-xl transition-colors border-0 bg-transparent cursor-pointer text-green-500" title="Settings">
            <SettingsIcon size={20} />
          </button>
        </div>
      </div>

      {/* Modals */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        documentId={documentId}
        currentCollaborators={collaborators}
      />
      <RenameDocModal
        isOpen={isRenameModalOpen}
        onClose={() => setIsRenameModalOpen(false)}
        currentTitle={title}
        onRename={handleRename}
      />
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onCancel={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        documentName={title}
        isDeleting={isDeleting}
      />
      {isOpenDocModalOpen && (
        <OpenDocModal onClose={() => setIsOpenDocModalOpen(false)} />
      )}
      {isSaveOptionsModalOpen && (
        <SaveOptionsModal
          onClose={() => setIsSaveOptionsModalOpen(false)}
          saveStatus={saveStatus}
          onDownload={handleDownload}
        />
      )}
      <DocumentDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        metadata={documentMetadata}
        editorStats={getEditorStats()}
      />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default TipTapEditor;
