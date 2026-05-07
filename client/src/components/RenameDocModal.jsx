import { useState, useEffect } from 'react';
import { Type, X, Check, Loader2 } from 'lucide-react';
import Modal from './Modal';

/**
 * RenameDocModal: Quick rename dialog for local and remote updates.
 * Styled to match the SyncVerse SaaS light theme.
 */
export default function RenameDocModal({ isOpen, onClose, currentTitle, onRename }) {
  const [title, setTitle] = useState(currentTitle || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) setTitle(currentTitle || '');
  }, [isOpen, currentTitle]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || title === currentTitle) {
      onClose();
      return;
    }
    setLoading(true);
    try {
      await onRename(title.trim());
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white rounded-[40px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)] overflow-hidden border border-slate-100 max-w-sm w-full mx-auto">
        
        {/* Header */}
        <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-4 text-text-heading">
            <div className="p-3 bg-blue-50 rounded-2xl text-brand-primary">
              <Type size={22} strokeWidth={2.5} />
            </div>
            <h2 className="text-xl font-black tracking-tight">Rename Document</h2>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-50 text-slate-300 hover:text-text-heading rounded-full transition-all border-0 bg-transparent cursor-pointer">
            <X size={22} strokeWidth={2.5} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-10">
          <div className="space-y-6">
            <div className="relative">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] block mb-3 ml-1">New Document Title</label>
              <input 
                type="text" 
                className="w-full bg-slate-50 border-2 border-transparent rounded-[20px] py-4 px-6 text-[15px] font-bold text-text-heading placeholder:text-slate-300 focus:bg-white focus:border-brand-primary/20 transition-all outline-none"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter new title..."
                autoFocus
                disabled={loading}
              />
            </div>
            
            <div className="flex flex-col space-y-4 pt-4">
              <button 
                type="submit" 
                disabled={loading || !title.trim() || title === currentTitle}
                className="w-full flex items-center justify-center space-x-3 bg-brand-primary hover:bg-brand-hover disabled:opacity-50 text-white px-8 py-5 rounded-2xl font-black text-sm shadow-xl shadow-brand-primary/20 transform active:scale-95 transition-all border-0 cursor-pointer"
              >
                {loading ? <Loader2 size={20} className="animate-spin" /> : <Check size={20} strokeWidth={3} />}
                <span>Update Title</span>
              </button>
              <button 
                type="button" 
                onClick={onClose}
                className="w-full py-5 font-black text-sm text-slate-400 hover:text-text-heading transition-colors border-0 bg-transparent cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-10 py-5 bg-slate-50/50 border-t border-slate-50">
           <span className="text-[10px] text-brand-primary font-black uppercase tracking-widest">SyncVerse System</span>
        </div>
      </div>
    </Modal>
  );
}
