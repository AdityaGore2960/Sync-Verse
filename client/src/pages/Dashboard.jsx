import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { FileText, Search, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import DocumentCard from '../components/DocumentCard';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import { useDocuments } from '../hooks/useDocuments';

export default function Dashboard() {
  const { documents, loading, deleteDocument } = useDocuments();
  const [docToDelete, setDocToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleConfirmDelete = async () => {
    console.log('Confirmed deletion of:', docToDelete?.title);
    if (!docToDelete) return;
    setIsDeleting(true);
    try {
      await api.delete(`/documents/${docToDelete._id}`);
      deleteDocument(docToDelete._id);
      setToast({ message: 'Document deleted successfully', type: 'success' });
      setDocToDelete(null);
    } catch (err) {
      console.error('Failed to delete document', err);
      setToast({ message: err.response?.data?.message || 'Failed to delete document', type: 'error' });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex-1 w-full flex flex-col min-w-0 relative">
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-2 text-text-heading tracking-tight">
          Good evening, {user?.name?.split(' ')[0] || 'User'}!
        </h1>
        <p className="text-text-muted text-sm font-medium">Here are your recent documents. Pick up where you left off.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-48 bg-bg-surface rounded-xl border border-border-subtle"></div>
          ))}
        </div>
      ) : documents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-bg-surface border border-border-subtle rounded-xl p-10">
          <div className="w-16 h-16 bg-bg-canvas rounded-xl flex items-center justify-center border border-border-subtle mb-6">
            <FileText size={32} className="text-brand-primary" />
          </div>
          <h4 className="text-xl font-bold text-text-heading mb-2">Build something great</h4>
          <p className="text-text-muted text-sm text-center max-w-sm font-medium">Your workspace is currently empty. Start by creating a new document above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {documents.map((doc) => (
            <DocumentCard
              key={doc._id}
              doc={doc}
              onOpen={() => {
                navigate(`/document/${doc._id}`);
              }}
              onDelete={(d) => {
                setDocToDelete(d);
              }}
            />
          ))}
        </div>
      )}

      {/* MODALS */}
      {docToDelete && (
        <DeleteConfirmModal
          isOpen={true}
          documentName={docToDelete.title}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDocToDelete(null)}
          isDeleting={isDeleting}
        />
      )}

      {/* TOAST SYSTEM (Simplified Dark Toast) */}
      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-200">
          <div className={`flex items-center space-x-3 px-6 py-4 rounded-xl shadow-2xl border border-border-subtle bg-bg-surface text-text-heading`}>
            {toast.type === 'error' ? <AlertCircle size={20} className="text-red-400" /> : <CheckCircle2 size={20} className="text-brand-primary" />}
            <span className="font-bold text-sm tracking-tight">{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
