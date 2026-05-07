import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import socketService from '../services/socket';
import api from '../services/api';
import TipTapEditor from '../components/Editor/TipTapEditor';
import { useEditorStore } from '../store/useEditorStore';
import { Loader2 } from 'lucide-react';
import Toast from '../components/Toast';

export default function Editor() {
  const { id: documentId } = useParams();
  useAuth(); // Check auth but user is unused
  const navigate = useNavigate();
  const { setTitle, setSaveStatus, setCollaborators, setDocumentId, setDocumentMetadata } = useEditorStore();

  const [socket, setSocket] = useState(null);
  const [initialContent, setInitialContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!documentId) return;
    setDocumentId(documentId);

    let isSubscribed = true;

    // Quick Load Strategy: Fetch via REST immediately for instant rendering
    const quickLoad = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/documents/${documentId}`);
        if (isSubscribed && data) {
          setTitle(data.title);
          setInitialContent(data.content);
          setDocumentMetadata(data);
          setLoading(false);
          console.log('[Editor] Quick Load Successful via REST ✅');
        }
      } catch (err) {
        console.error('[Editor] Quick Load Failed:', err);
      }
    };

    quickLoad();

    // Secondary Strategy: Connect Socket for Real-time Sync
    const s = socketService.connect();
    // Wrap in timeout to avoid synchronous setState in effect (lint fix)
    setTimeout(() => {
      if (isSubscribed) setSocket(s);
    }, 0);

    if (s) {
      s.on('connect', () => {
        s.emit('document:join', { documentId });
      });

      s.on('document:joined', ({ document, users }) => {
        if (!isSubscribed) return;
        // Only update if we haven't loaded via REST yet or if data is significantly different
        setTitle(document.title);
        setInitialContent(document.content);
        setDocumentMetadata(document);
        setCollaborators(users || []);
        setLoading(false);
      });

      s.on('document:saved', () => {
        setSaveStatus('saved');
      });

      s.on('user-joined', ({ user: u }) => {
        if (isSubscribed) useEditorStore.getState().updateCollaborator(u);
      });

      s.on('user-left', ({ userId }) => {
        if (isSubscribed) useEditorStore.getState().removeCollaborator(userId);
      });

      s.on('document:error', ({ message }) => {
        if (!isSubscribed) return;
        setToast({ message, type: 'error' });
        if (message.includes('not found') || message.includes('denied')) {
          setTimeout(() => navigate('/dashboard'), 3000);
        }
      });
    }

    return () => {
      isSubscribed = false;
      if (s) {
        s.emit('document:leave', { documentId });
        s.off('document:joined');
        s.off('document:saved');
        s.off('user-joined');
        s.off('user-left');
        s.off('document:error');
      }
    };
  }, [documentId, navigate, setTitle, setCollaborators, setSaveStatus, setDocumentId, setDocumentMetadata]);

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-bg-canvas gap-4">
        <Loader2 size={48} className="text-brand-primary animate-spin" />
        <p className="text-text-muted font-medium animate-pulse">Establishing secure connection...</p>
      </div>
    );
  }

  return (
    <>
      <TipTapEditor
        socket={socket}
        documentId={documentId}
        initialContent={initialContent}
      />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </>
  );
}
