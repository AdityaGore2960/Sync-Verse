import { useState } from 'react';
import { FilePlus, X, Sparkles, Loader2, ArrowRight, Type, AlignLeft } from 'lucide-react';
import Modal from './Modal';

/**
 * CreateDocModal: A simplified, high-fidelity dialog for initializing new documents.
 * Focuses on core document details: Title and Description.
 */
export default function CreateDocModal({ onClose, onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: '',
    template: 'blank',
    visibility: 'private'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    // Process data for submission
    const processedData = {
      ...formData,
      isPublic: formData.visibility === 'public',
      tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '') : []
    };

    onSubmit(processedData);
  };

  return (
    <Modal isOpen={true} onClose={onClose}>
      <div className="bg-bg-surface rounded-xl shadow-2xl overflow-hidden border border-border-subtle max-w-lg w-full mx-auto animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="relative px-8 py-7 border-b border-border-subtle">
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center space-x-4">
              <div className="p-2.5 bg-bg-card-hover rounded-lg text-brand-primary border border-border-subtle">
                <FilePlus size={22} strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-text-heading tracking-tight leading-none">New Document</h2>
                <p className="text-[10px] text-text-muted font-bold mt-1.5 uppercase tracking-widest leading-none">SyncVerse Engine</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 bg-transparent hover:bg-bg-card-hover text-text-muted hover:text-text-heading rounded-full transition-all border-0 cursor-pointer group"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          
          {/* Title Input */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">
              <Type size={12} className="text-brand-primary" />
              <span>Document Name</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="Enter document title..."
              className="w-full bg-bg-canvas border border-border-subtle rounded-lg py-3 px-4 text-sm font-medium text-text-body placeholder:text-text-muted focus:border-brand-primary/50 transition-all outline-none"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          {/* Description Input */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">
              <AlignLeft size={12} className="text-brand-primary" />
              <span>Description</span>
            </label>
            <textarea
              placeholder="What is this document about? (Optional)"
              rows={3}
              className="w-full bg-bg-canvas border border-border-subtle rounded-lg py-3 px-4 text-sm font-medium text-text-body placeholder:text-text-muted focus:border-brand-primary/50 transition-all outline-none resize-none"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-6">
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-bold text-text-muted hover:text-text-heading transition-colors uppercase tracking-widest px-4 py-2 bg-transparent border-0 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.title.trim()}
              className="bg-brand-primary hover:bg-brand-hover disabled:opacity-50 text-text-heading px-8 py-3 rounded-lg font-bold text-sm shadow-lg shadow-brand-primary/10 transition-all border-0 cursor-pointer active:scale-95"
            >
              {isSubmitting ? (
                <span>Processing...</span>
              ) : (
                <div className="flex items-center gap-2">
                  <span>Create Document</span>
                  <ArrowRight size={18} />
                </div>
              )}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
