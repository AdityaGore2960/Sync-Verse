import { AlertTriangle, Trash2, Loader2 } from 'lucide-react';
import Modal from './Modal';

/**
 * DeleteConfirmModal: Modern confirmation modal for document deletion.
 * Styled to match the SyncVerse SaaS light theme.
 */
export default function DeleteConfirmModal({ isOpen, documentName, onConfirm, onCancel, isDeleting }) {
  
  return (
    <Modal isOpen={isOpen} onClose={onCancel}>
      <div className="relative w-full max-w-sm bg-white rounded-[40px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)] overflow-hidden border border-slate-100 mx-auto">
        
        {/* Warning Indicator (Top Bar) */}
        <div className="h-1.5 w-full bg-red-500"></div>

        <div className="p-10">
          <div className="flex flex-col items-center text-center space-y-5">
            <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center text-red-600 mb-2 shadow-inner">
              <AlertTriangle size={40} strokeWidth={2.5} />
            </div>
            
            <h3 className="text-2xl font-black text-text-heading tracking-tight">Delete Document?</h3>
            
            <p className="text-slate-400 text-sm font-semibold leading-relaxed px-2">
              Are you sure you want to delete <span className="text-text-heading font-black">"{documentName || 'this document'}"</span>? 
              <br />This action is permanent and cannot be undone.
            </p>
          </div>

          <div className="flex flex-col space-y-4 mt-12">
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="w-full flex items-center justify-center gap-3 px-8 py-5 rounded-2xl font-black text-sm bg-red-500 hover:bg-red-600 text-white shadow-xl shadow-red-200 transition-all transform active:scale-95 border-0 cursor-pointer disabled:opacity-50 group"
            >
              {isDeleting ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 size={20} />
                  <span>Delete Forever</span>
                </>
              )}
            </button>
            
            <button
              onClick={onCancel}
              disabled={isDeleting}
              className="w-full px-8 py-5 rounded-2xl font-black text-sm bg-white hover:bg-slate-50 text-slate-400 transition-all border-0 cursor-pointer active:scale-95 border border-slate-100"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
