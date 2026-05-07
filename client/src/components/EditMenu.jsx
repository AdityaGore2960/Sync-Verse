import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Undo2, Redo2, Scissors, Copy, ClipboardPaste,
  MousePointer2, Search, CornerUpLeft, CornerUpRight, Move,
  ChevronDown, ChevronRight
} from 'lucide-react';

/**
 * EditMenu: Provides premium document editing controls with unified styling.
 */
export default function EditMenu({
  onUndo,
  onRedo,
  onCut,
  onCopy,
  onPaste,
  onSelectAll,
  onFind,
  disabled = false,
  hasSelection = false
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const menuRef = useRef(null);

  const menuItems = [
    { label: 'Undo', sub: 'Reverse last action', icon: <Undo2 size={18} />, shortcut: 'Ctrl+Z', onClick: onUndo },
    { label: 'Redo', sub: 'Repeat last action', icon: <Redo2 size={18} />, shortcut: 'Ctrl+Y', onClick: onRedo },
    { type: 'separator' },
    { label: 'Cut', sub: 'Remove selection', icon: <Scissors size={18} />, shortcut: 'Ctrl+X', onClick: onCut, disabled: !hasSelection },
    { label: 'Copy', sub: 'Copy to clipboard', icon: <Copy size={18} />, shortcut: 'Ctrl+C', onClick: onCopy, disabled: !hasSelection },
    { label: 'Paste', sub: 'Insert from clipboard', icon: <ClipboardPaste size={18} />, shortcut: 'Ctrl+V', onClick: onPaste },
    { type: 'separator' },
    { label: 'Select All', sub: 'Select entire document', icon: <MousePointer2 size={18} />, shortcut: 'Ctrl+A', onClick: onSelectAll },
    { type: 'separator' },
    { label: 'Find and Replace', sub: 'Search within text', icon: <Search size={18} />, shortcut: 'Ctrl+F', onClick: onFind },
  ];

  const filteredItems = menuItems.filter(item => item.type !== 'separator');

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') setIsOpen(false);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev < filteredItems.length - 1 ? prev + 1 : prev));
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev > 0 ? prev - 1 : prev));
    }
    if (e.key === 'Enter' && activeIndex >= 0) {
      const item = filteredItems[activeIndex];
      if (!item.disabled) {
        item.onClick();
        setIsOpen(false);
      }
    }
  }, [activeIndex, filteredItems]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  const handleItemClick = (item) => {
    if (item.disabled) return;
    item.onClick();
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onMouseEnter={() => setActiveIndex(-1)}
        className={`text-[11px] px-3 py-1 rounded-md transition-all font-bold flex items-center space-x-1 outline-none border-0 bg-transparent uppercase tracking-wider ${disabled
          ? 'text-slate-300 cursor-not-allowed'
          : isOpen
            ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-gray-800 cursor-pointer'
          }`}
      >
        <span>Edit</span>
        <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? 'rotate-180 text-blue-500' : ''}`} />
      </button>

      {isOpen && (
        <div
          className="absolute left-0 top-full mt-2 w-72 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-slate-200/60 dark:border-gray-800/60 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] py-3 z-[100] animate-in slide-in-from-top-2 zoom-in-95 fade-in duration-300 origin-top-left ring-1 ring-black/5"
          role="menu"
        >
          {menuItems.map((item, index) => {
            if (item.type === 'separator') {
              return <div key={`sep-${index}`} className="h-px bg-slate-100 dark:bg-gray-800 my-1.5 mx-3" />;
            }

            const itemIndex = filteredItems.indexOf(item);
            const isActive = activeIndex === itemIndex;
            const isDisabled = item.disabled;

            return (
              <button
                key={item.label}
                onClick={() => handleItemClick(item)}
                onMouseEnter={() => setActiveIndex(itemIndex)}
                disabled={isDisabled}
                className={`w-full flex items-center gap-4 px-4 py-2.5 text-xs font-bold transition-all border-0 bg-transparent text-left cursor-pointer relative overflow-hidden group ${isDisabled
                  ? 'opacity-40 grayscale cursor-not-allowed text-slate-400'
                  : isActive
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-800/50'
                  }`}
                role="menuitem"
              >
                <div className={`p-2 rounded-xl transition-all ${isDisabled
                  ? 'bg-slate-100 dark:bg-gray-800'
                  : isActive
                    ? 'bg-blue-600 text-text-heading shadow-lg shadow-blue-200 dark:shadow-none'
                    : 'bg-slate-100 dark:bg-gray-800 text-slate-500 group-hover:scale-110'
                  }`}>
                  {item.icon}
                </div>

                <div className="flex flex-col min-w-0">
                  <div className="flex items-baseline justify-between gap-4">
                    <span className={`${isActive && !isDisabled ? 'translate-x-0.5' : ''} transition-transform duration-200`}>
                      {item.label}
                    </span>
                    {item.shortcut && (
                      <span className="text-[9px] text-slate-300 dark:text-slate-600 font-black">
                        {item.shortcut}
                      </span>
                    )}
                  </div>
                  {item.sub && (
                    <span className={`text-[10px] font-medium opacity-60 truncate ${isActive && !isDisabled ? 'text-blue-500 dark:text-blue-300' : 'text-slate-400'}`}>
                      {item.sub}
                    </span>
                  )}
                </div>

                {isActive && !isDisabled && (
                  <div className="ml-auto animate-in fade-in slide-in-from-right-1">
                    <ChevronRight size={14} className="opacity-40" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
