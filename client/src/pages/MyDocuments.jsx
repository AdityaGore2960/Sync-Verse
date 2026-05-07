import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { FileText, List } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import { useDocuments } from '../hooks/useDocuments';
import DocumentList from '../components/DocumentList';

export default function MyDocuments() {
  const { documents, loading, deleteDocument } = useDocuments();
  const [docToDelete, setDocToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();
  const { user: _user } = useAuth();

  const handleConfirmDelete = async () => {
    if (!docToDelete) return;
    setIsDeleting(true);
    try {
      await api.delete(`/documents/${docToDelete._id}`);
      deleteDocument(docToDelete._id);
      setToast({ message: 'Document deleted successfully' });
      setDocToDelete(null);
    } catch (err) {
      console.error('Failed to delete document', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const sortedDocuments = [...documents].sort((a, b) => 
    new Date(b.updatedAt) - new Date(a.updatedAt)
  );

  return (
    <div className="flex-1 w-full flex flex-col min-w-0 relative">
      <div className="flex items-center space-x-4 mb-10">
         <div className="bg-bg-card-hover text-brand-primary p-3 rounded-xl border border-border-subtle">
           <List size={24} className="stroke-2" />
         </div>
         <div>
           <h2 className="text-2xl font-bold text-text-heading tracking-tight">My Documents</h2>
           <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest leading-none mt-2">
             Personal Library
           </p>
         </div>
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-16 bg-bg-surface rounded-xl border border-border-subtle"></div>
          ))}
        </div>
      ) : documents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 bg-bg-surface border border-border-subtle rounded-xl p-10 mt-4 group">
          <div className="w-16 h-16 bg-bg-canvas rounded-xl flex items-center justify-center border border-border-subtle mb-6 group-hover:border-brand-primary/50 transition-colors">
            <FileText size={32} className="text-brand-primary" />
          </div>
          <h3 className="text-xl font-bold text-text-heading mb-2 tracking-tight">Your library is empty</h3>
          <p className="text-text-muted text-center max-w-xs font-medium leading-relaxed">It looks like you haven't created any documents yet. Start fresh using the button at the top.</p>
        </div>
      ) : (
        <DocumentList 
          documents={sortedDocuments} 
          onOpen={(id) => navigate(`/document/${id}`)}
          onDelete={(d) => setDocToDelete(d)}
        />
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

      {/* TOAST SYSTEM */}
      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200]">
           <div className="bg-gray-900 border border-gray-800 text-text-heading px-6 py-4 rounded-3xl shadow-3xl flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center">
                <FileText size={16} />
             </div>
             <span className="font-black text-sm tracking-tight">{toast.message}</span>
           </div>
        </div>
      )}
    </div>
  );
}
