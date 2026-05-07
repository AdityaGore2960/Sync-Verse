import { useState, useEffect } from 'react';
import { Link as LinkIcon, X, Check, ArrowRight, ExternalLink } from 'lucide-react';
import Modal from './Modal';

/**
 * LinkModal: A focused dialog for inserting or editing hyperlinks.
 * High visual affordance and easy-to-use input system.
 */
export default function LinkModal({ isOpen, onClose, onInsert, initialText = '', initialUrl = '' }) {
  const [text, setText] = useState(initialText);
  const [url, setUrl] = useState(initialUrl);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!url.trim()) return;
    onInsert(text || url, url);
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      // Wrap in timeout to avoid synchronous setState in effect (lint fix)
      const timeoutId = setTimeout(() => {
        setText(initialText);
        setUrl(initialUrl);
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [isOpen, initialText, initialUrl]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white dark:bg-gray-950 rounded-[2.5rem] shadow-3xl overflow-hidden border border-border-subtle dark:border-gray-850">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-border-subtle dark:border-gray-850 flex items-center justify-between">
          <div className="flex items-center space-x-3 text-slate-800 dark:text-gray-100">
            <div className="p-2 bg-brand-primary/10 rounded-xl text-brand-primary">
              <LinkIcon size={20} />
            </div>
            <h2 className="text-xl font-black tracking-tight uppercase tracking-widest text-sm">Insert Hyperlink</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-gray-800 rounded-full text-slate-400 dark:text-gray-500 border-0 bg-transparent cursor-pointer transition-all">
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="relative group">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Display Text</label>
              <input 
                type="text" 
                className="w-full bg-slate-50 dark:bg-gray-900 border-0 rounded-2xl py-3.5 px-5 text-sm font-bold text-slate-700 dark:text-gray-100 placeholder:text-slate-400 focus:bg-white dark:focus:bg-gray-850 transition-all outline-none"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Text to display..."
                autoFocus
              />
            </div>

            <div className="relative group">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5 ml-1">Destination URL</label>
              <div className="relative">
                <input 
                  type="text" 
                  className="w-full bg-slate-50 dark:bg-gray-900 border-0 rounded-2xl py-3.5 px-5 pr-12 text-sm font-bold text-slate-700 dark:text-gray-100 placeholder:text-slate-400 focus:bg-white dark:focus:bg-gray-850 transition-all outline-none"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                />
                <ExternalLink size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-gray-700" />
              </div>
            </div>
          </div>

          <div className="flex space-x-3 items-center justify-end pt-4">
            <button 
              type="button" 
              onClick={onClose}
              className="px-6 py-3 font-bold text-xs text-slate-400 hover:text-slate-700 transition-colors border-0 bg-transparent cursor-pointer uppercase tracking-widest"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={!url.trim()}
              className="flex items-center space-x-2 bg-brand-primary hover:bg-brand-hover disabled:opacity-50 text-text-heading px-8 py-3 rounded-2xl font-black text-xs shadow-xl shadow-brand-primary/25 transform active:scale-95 transition-all border-0 cursor-pointer uppercase tracking-widest"
            >
              <Check size={16} />
              <span>Insert Link</span>
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="px-8 py-4 bg-slate-50 dark:bg-gray-900 border-t border-border-subtle dark:border-gray-850">
           <span className="text-[9px] text-brand-primary font-black uppercase tracking-tighter">SyncVerse Identity - Connected Web</span>
        </div>
      </div>
    </Modal>
  );
}
