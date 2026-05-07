import { Info, Calendar, User, FileText, Hash, Clock, X } from 'lucide-react';
import Modal from './Modal';

/**
 * DocumentDetailsModal: Premium card showing technical metadata and stats of the current document.
 */
export default function DocumentDetailsModal({ isOpen, onClose, metadata, editorStats }) {
  if (!metadata) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const details = [
    {
      label: 'Owner',
      value: metadata.owner?.name || 'Unknown',
      icon: <User size={16} />,
      color: 'text-blue-500'
    },
    {
      label: 'Created',
      value: formatDate(metadata.createdAt),
      icon: <Calendar size={16} />,
      color: 'text-emerald-500'
    },
    {
      label: 'Last Modified',
      value: formatDate(metadata.updatedAt),
      icon: <Clock size={16} />,
      color: 'text-amber-500'
    },
    {
      label: 'Word Count',
      value: editorStats.words || 0,
      icon: <FileText size={16} />,
      color: 'text-purple-500'
    },
    {
      label: 'Characters',
      value: editorStats.characters || 0,
      icon: <Hash size={16} />,
      color: 'text-rose-500'
    }
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-bg-surface rounded-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] overflow-hidden border border-border-subtle max-w-md w-full mx-auto animate-in zoom-in-95 duration-300">

        {/* Header */}
        <div className="px-8 py-7 border-b border-border-subtle relative overflow-hidden bg-gradient-to-br from-bg-surface to-bg-card/50">
          <div className="absolute -top-4 -right-4 p-8 opacity-5">
            <Info size={160} strokeWidth={1} />
          </div>

          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-brand-primary/10 rounded-2xl text-brand-primary border border-brand-primary/20 shadow-inner">
                <Info size={24} strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-xl font-black text-text-heading tracking-tight leading-none uppercase">Document Details</h2>
                <p className="text-[10px] text-text-muted font-black mt-2 uppercase tracking-[0.2em] leading-none opacity-50">Technical Metadata</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2.5 bg-bg-card-hover hover:bg-bg-canvas text-text-muted hover:text-text-heading rounded-xl transition-all border border-border-subtle cursor-pointer active:scale-90"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-8 space-y-5">
          {details.map((detail, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-4 rounded-2xl bg-bg-canvas/50 border border-border-subtle/50 hover:border-brand-primary/30 transition-all group"
            >
              <div className="flex items-center space-x-4">
                <div className={`p-2 rounded-lg bg-bg-surface ${detail.color} shadow-sm group-hover:scale-110 transition-transform`}>
                  {detail.icon}
                </div>
                <span className="text-[11px] font-black text-text-muted uppercase tracking-widest">{detail.label}</span>
              </div>
              <span className="text-sm font-bold text-text-heading text-right max-w-[180px] truncate">{detail.value}</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-8 py-6 bg-bg-card/30 border-t border-border-subtle flex items-center justify-center space-x-2">
          <div className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse" />
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest leading-relaxed">
            SyncVerse Analytics Engine v2.0
          </p>
        </div>
      </div>
    </Modal>
  );
}
