import { useState, useMemo } from 'react';
import { Search, FolderOpen, X, FileText, Loader2, ArrowRight } from 'lucide-react';
import Modal from './Modal';
import { useDocuments } from '../hooks/useDocuments';
import { useNavigate } from 'react-router-dom';

/**
 * OpenDocModal: Premium dialog for browsing and searching through saved documents.
 * High-fidelity design with real-time filtering and smooth transitions.
 */
export default function OpenDocModal({ onClose }) {
  const { documents, loading } = useDocuments();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // Optimized filtering logic
  const filteredDocuments = useMemo(() => {
    if (!documents) return [];
    return documents.filter(doc => 
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.description && doc.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [documents, searchQuery]);

  const handleOpenDoc = (id) => {
    navigate(`/document/${id}`);
    onClose();
  };

  return (
    <Modal isOpen={true} onClose={onClose}>
      <div className="bg-bg-surface rounded-2xl shadow-2xl overflow-hidden border border-border-subtle max-w-2xl w-full mx-auto animate-in zoom-in-95 duration-200">
        
        {/* Sticky Header with Search */}
        <div className="px-8 py-6 border-b border-border-subtle bg-bg-surface/50 backdrop-blur-xl sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2.5 bg-brand-primary/10 rounded-xl text-brand-primary border border-brand-primary/20">
                <FolderOpen size={22} strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-text-heading tracking-tight leading-none">Open Document</h2>
                <p className="text-[10px] text-text-muted font-black mt-2 uppercase tracking-[0.2em] leading-none">Your Private Collection</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2.5 bg-bg-card-hover hover:bg-bg-canvas text-text-muted hover:text-text-heading rounded-xl transition-all border border-border-subtle cursor-pointer active:scale-90"
            >
              <X size={18} />
            </button>
          </div>

          {/* Premium Search Interface */}
          <div className="mt-8 relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-brand-primary transition-colors pointer-events-none">
              <Search size={18} />
            </div>
            <input
              type="text"
              autoFocus
              placeholder="Search documents by title or description..."
              className="w-full bg-bg-canvas border border-border-subtle rounded-xl py-4 pl-12 pr-6 text-sm font-bold text-text-heading placeholder:text-text-muted focus:border-brand-primary/50 focus:ring-4 focus:ring-brand-primary/10 transition-all outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-heading bg-transparent border-0 cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Dynamic List Content */}
        <div className="max-h-[450px] overflow-y-auto p-4 custom-scrollbar bg-bg-canvas/30 min-h-[300px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="relative">
                <Loader2 className="text-brand-primary animate-spin" size={40} />
                <div className="absolute inset-0 bg-brand-primary/20 blur-xl animate-pulse rounded-full" />
              </div>
              <p className="text-sm font-bold text-text-muted animate-pulse uppercase tracking-widest">Syncing workspace...</p>
            </div>
          ) : filteredDocuments.length > 0 ? (
            <div className="grid grid-cols-1 gap-2">
              {filteredDocuments.map((doc) => (
                <button
                  key={doc._id}
                  onClick={() => handleOpenDoc(doc._id)}
                  className="flex items-center justify-between p-4 rounded-xl border border-transparent hover:border-border-subtle hover:bg-bg-surface transition-all group cursor-pointer text-left w-full bg-transparent"
                >
                  <div className="flex items-center space-x-4 min-w-0">
                    <div className="p-3 rounded-xl bg-bg-card-hover text-brand-primary group-hover:bg-brand-primary group-hover:text-text-heading transition-all shadow-sm shrink-0">
                      <FileText size={20} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-text-heading group-hover:text-brand-primary transition-colors truncate">{doc.title}</h4>
                      <p className="text-[11px] text-text-muted mt-1 font-medium truncate max-w-[300px]">
                        {doc.description || 'No description provided'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 shrink-0">
                    <div className="hidden sm:block text-right">
                       <p className="text-[9px] font-black text-text-muted uppercase tracking-wider mb-0.5">Last Sync</p>
                       <p className="text-[11px] font-bold text-text-body">{new Date(doc.updatedAt).toLocaleDateString()}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-bg-canvas opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0">
                      <ArrowRight size={16} className="text-brand-primary" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in slide-in-from-bottom-4">
              <div className="w-20 h-20 bg-bg-surface rounded-3xl flex items-center justify-center mb-8 border border-border-subtle shadow-inner relative group">
                <Search size={36} className="text-text-muted group-hover:scale-110 transition-transform" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-ping" />
              </div>
              <h3 className="text-lg font-bold text-text-heading mb-2">No documents found</h3>
              <p className="text-sm text-text-muted max-w-xs font-bold leading-relaxed px-6">
                Your search for "{searchQuery}" didn't return any results. Try another name.
              </p>
            </div>
          )}
        </div>

        {/* Footer Statistics */}
        <div className="px-8 py-5 bg-bg-surface border-t border-border-subtle flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-0">
              {filteredDocuments.length} Available Documents
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Close with</span>
            <kbd className="px-2 py-1 bg-bg-canvas border border-border-subtle rounded-lg text-[10px] font-black text-text-heading shadow-sm ring-1 ring-white/5">ESC</kbd>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.12); }
      `}</style>
    </Modal>
  );
}
