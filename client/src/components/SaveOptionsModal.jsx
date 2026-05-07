import { Save, Cloud, FileText, Download, CheckCircle2, Loader2, ArrowRight, X, Clock } from 'lucide-react';
import Modal from './Modal';

/**
 * SaveOptionsModal: Premium dialog showing manual sync status and export options.
 */
export default function SaveOptionsModal({ onClose, onDownload, saveStatus }) {
  const options = [
    { 
      id: 'cloud', 
      name: 'Sync to Cloud', 
      desc: 'Ensure your changes are safely stored in SyncVerse records.', 
      icon: <Cloud size={20} />, 
      action: () => {}, 
      status: saveStatus === 'saved' ? 'Synced' : 'Syncing...',
      accent: 'text-blue-500' 
    },
    { 
      id: 'pdf', 
      name: 'Export as PDF', 
      desc: 'Highly compatible document format for professional sharing.', 
      icon: <FileText size={20} />, 
      action: () => onDownload('pdf'),
      accent: 'text-red-500' 
    },
    { 
      id: 'txt', 
      name: 'Export as Plain Text', 
      desc: 'Clean, formatting-free text file for simple portability.', 
      icon: <Download size={20} />, 
      action: () => onDownload('txt'),
      accent: 'text-emerald-500' 
    },
    { 
      id: 'history', 
      name: 'Version History', 
      desc: 'Browse through previous snapshots of this document.', 
      icon: <Clock size={20} />, 
      action: () => {}, 
      accent: 'text-amber-500' 
    }
  ];

  return (
    <Modal isOpen={true} onClose={onClose}>
      <div className="bg-bg-surface rounded-2xl shadow-2xl overflow-hidden border border-border-subtle max-w-lg w-full mx-auto animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-8 py-7 border-b border-border-subtle relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Save size={120} strokeWidth={1} />
          </div>
          
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center space-x-4">
              <div className="p-2.5 bg-brand-primary/10 rounded-xl text-brand-primary border border-brand-primary/20">
                <Save size={24} strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-text-heading tracking-tight leading-none">Manual Save</h2>
                <p className="text-[10px] text-text-muted font-black mt-2 uppercase tracking-[0.2em] leading-none">Synchronization Engine</p>
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

        {/* Status Section */}
        <div className="p-8 bg-bg-canvas/30">
          <div className={`flex items-center justify-between p-4 rounded-xl border ${saveStatus === 'saved' ? 'bg-green-500/5 border-green-500/20' : 'bg-brand-primary/5 border-brand-primary/20'}`}>
            <div className="flex items-center space-x-3">
              {saveStatus === 'saved' ? (
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-text-heading shadow-lg shadow-green-500/20">
                  <CheckCircle2 size={18} />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center text-text-heading animate-pulse">
                  <Loader2 size={18} className="animate-spin" />
                </div>
              )}
              <div>
                <p className="text-xs font-black text-text-heading uppercase tracking-wider">Document Status</p>
                <p className={`text-sm font-bold mt-0.5 ${saveStatus === 'saved' ? 'text-green-500' : 'text-brand-primary'}`}>
                  {saveStatus === 'saved' ? 'All changes saved to cloud' : 'Synching latest edits...'}
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-text-muted opacity-50 px-3 py-1 bg-white/5 rounded-full uppercase tracking-tighter">
              v2.4 Stable
            </span>
          </div>

          <div className="mt-8 space-y-3">
            <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-1 mb-4">Storage & Export Options</p>
            {options.map((opt) => (
              <button
                key={opt.id}
                onClick={opt.action}
                className="w-full flex items-center justify-between p-4 rounded-xl bg-bg-surface hover:bg-bg-card-hover border border-border-subtle hover:border-brand-primary/30 transition-all group cursor-pointer text-left"
              >
                <div className="flex items-center space-x-4">
                  <div className={`p-2.5 rounded-lg bg-bg-canvas ${opt.accent} transition-transform group-hover:scale-110`}>
                    {opt.icon}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-text-heading">{opt.name}</h4>
                    <p className="text-[11px] text-text-muted font-medium mt-0.5 line-clamp-1">{opt.desc}</p>
                  </div>
                </div>
                {opt.status ? (
                  <span className="text-[10px] font-bold text-brand-primary px-2 py-0.5 bg-brand-primary/10 rounded uppercase">
                    {opt.status}
                  </span>
                ) : (
                  <ArrowRight size={14} className="text-text-muted group-hover:text-text-heading transition-all transform group-hover:translate-x-1" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-bg-surface border-t border-border-subtle text-center">
          <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest leading-relaxed">
            Automatic backups are enabled by default. <br />
            Manual sync ensures zero-data loss before closing the tab.
          </p>
        </div>
      </div>
    </Modal>
  );
}
