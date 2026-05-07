import { useState, useEffect } from 'react';
import { 
  Search, X, Check, ArrowDown, ArrowUp, Zap, 
  RotateCw, ArrowRight, Loader2
} from 'lucide-react';
import Modal from './Modal';

/**
 * FindReplaceModal: A focused dialog for finding and replacing text within the editor.
 */
export default function FindReplaceModal({ isOpen, onClose, onFind, onReplace, onReplaceAll }) {
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [totalMatches, setTotalMatches] = useState(0);
  const [isCaseSensitive, setIsCaseSensitive] = useState(false);

  const handleFind = () => {
    if (!findText) return;
    const count = onFind(findText, isCaseSensitive);
    setTotalMatches(count);
  };

  const handleReplace = () => {
    if (!findText) return;
    const count = onReplace(findText, replaceText, isCaseSensitive);
    setTotalMatches(count);
  };

  const handleReplaceAll = () => {
    if (!findText) return;
    onReplaceAll(findText, replaceText, isCaseSensitive);
    setTotalMatches(0);
    setFindText('');
    setReplaceText('');
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      // Wrap in timeout to avoid synchronous setState in effect (lint fix)
      const timeoutId = setTimeout(() => {
        setFindText('');
        setReplaceText('');
        setTotalMatches(0);
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-3xl overflow-hidden border border-border-subtle dark:border-gray-800">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-border-subtle dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center space-x-3 text-text-heading dark:text-gray-100">
            <div className="p-2 bg-brand-primary/10 rounded-xl text-brand-primary">
              <Search size={20} />
            </div>
            <h2 className="text-xl font-black tracking-tight">Find and Replace</h2>
          </div>
          <button onClick={onClose} className="p-2 bg-bg-subtle dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-750 text-text-muted dark:text-gray-400 rounded-full transition-all border-0 cursor-pointer">
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="relative group">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-widest block mb-1.5 ml-1">Find</label>
              <input 
                type="text" 
                className="w-full bg-bg-subtle dark:bg-gray-800 border-2 border-transparent rounded-2xl py-3.5 px-5 text-sm font-bold text-text-heading dark:text-gray-100 placeholder:text-gray-400 focus:bg-white dark:focus:bg-gray-750 focus:border-brand-primary/20 transition-all outline-none"
                value={findText}
                onChange={(e) => setFindText(e.target.value)}
                placeholder="Find text..."
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleFind()}
              />
              {totalMatches > 0 && (
                <div className="absolute right-4 top-[2.5rem] flex items-center space-x-2 text-[10px] font-black text-brand-primary bg-brand-primary/5 px-2 py-1 rounded-lg">
                  <span>{totalMatches} matches</span>
                </div>
              )}
            </div>

            <div className="relative group">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-widest block mb-1.5 ml-1">Replace With</label>
              <input 
                type="text" 
                className="w-full bg-bg-subtle dark:bg-gray-800 border-2 border-transparent rounded-2xl py-3.5 px-5 text-sm font-bold text-text-heading dark:text-gray-100 placeholder:text-gray-400 focus:bg-white dark:focus:bg-gray-750 focus:border-brand-primary/20 transition-all outline-none"
                value={replaceText}
                onChange={(e) => setReplaceText(e.target.value)}
                placeholder="Replace with..."
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setIsCaseSensitive(!isCaseSensitive)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-0 cursor-pointer ${isCaseSensitive ? 'bg-brand-primary text-text-heading' : 'bg-bg-subtle dark:bg-gray-800 text-text-muted hover:text-text-heading'}`}
            >
              <Zap size={12} fill={isCaseSensitive ? 'currentColor' : 'none'} />
              <span>Case Sensitive</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border-subtle dark:border-gray-800">
            <div className="flex space-x-3">
              <button 
                onClick={handleFind}
                disabled={!findText}
                className="flex-1 flex items-center justify-center space-x-2 bg-bg-subtle dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-750 text-text-heading dark:text-gray-100 py-3 rounded-2xl font-black text-sm transition-all border-0 cursor-pointer disabled:opacity-50"
              >
                <ArrowDown size={16} />
                <span>Find Next</span>
              </button>
            </div>
            
            <div className="flex space-x-3">
              <button 
                onClick={handleReplace}
                disabled={!findText || totalMatches === 0}
                className="flex-1 flex items-center justify-center space-x-2 bg-bg-subtle dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-750 text-text-heading dark:text-gray-100 py-3 rounded-2xl font-black text-sm transition-all border-0 cursor-pointer disabled:opacity-50"
              >
                <ArrowRight size={16} />
                <span>Replace</span>
              </button>
              
              <button 
                onClick={handleReplaceAll}
                disabled={!findText}
                className="flex-1 flex items-center justify-center space-x-2 bg-brand-primary hover:bg-brand-hover text-text-heading py-3 rounded-2xl font-black text-sm shadow-xl shadow-brand-primary/25 transform active:scale-95 transition-all border-0 cursor-pointer disabled:opacity-50"
              >
                <RotateCw size={16} />
                <span>Replace All</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-4 bg-bg-subtle dark:bg-gray-850 border-t border-border-subtle dark:border-gray-800 flex justify-between items-center">
           <span className="text-[10px] text-brand-primary font-black uppercase tracking-tighter">SyncVerse Search Engine</span>
           <div className="flex items-center space-x-1">
             <kbd className="px-1.5 py-0.5 rounded border border-border-strong text-[10px] font-bold bg-white dark:bg-gray-800 text-text-muted uppercase">Alt</kbd>
             <kbd className="px-1.5 py-0.5 rounded border border-border-strong text-[10px] font-bold bg-white dark:bg-gray-800 text-text-muted uppercase">Enter</kbd>
             <span className="text-[10px] text-text-muted font-bold ml-1">to Replace</span>
           </div>
        </div>
      </div>
    </Modal>
  );
}
