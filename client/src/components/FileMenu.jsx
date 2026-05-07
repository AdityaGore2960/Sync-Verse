import { useState, useEffect, useRef, useCallback } from 'react';
import {
  FilePlus, FolderOpen, Type, Save, Copy, Trash2, Download, Share2,
  ChevronRight, FileText, ChevronDown, Monitor, Clock, FileCode, Info
} from 'lucide-react';

/**
 * FileMenu: Premium dropdown menu for document operations.
 * CSS and Layout matched exactly to EditMenu.jsx.
 */
export default function FileMenu({
  onNew,
  onOpen,
  onRename,
  onSave,
  onSaveAs,
  onDelete,
  onDownload,
  onShare,
  onDetails,
  disabled = false
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const menuRef = useRef(null);

  const menuItems = [
    { label: 'New Document', sub: 'Create a fresh canvas', icon: <FilePlus size={18} />, shortcut: 'Alt+N', onClick: onNew },
    { label: 'Open Document', sub: 'Access your collection', icon: <FolderOpen size={18} />, shortcut: 'Ctrl+O', onClick: onOpen },
    { type: 'separator' },
    { label: 'Rename', sub: 'Give it a new identity', icon: <Type size={18} />, onClick: onRename },
    { label: 'Manual Save', sub: 'Sync to cloud instantly', icon: <Save size={18} />, shortcut: 'Ctrl+S', onClick: onSave },
    { label: 'Make a Copy', sub: 'Duplicate this document', icon: <Copy size={18} />, onClick: onSaveAs },
    { type: 'separator' },
    { label: 'Share', sub: 'Collaborate with others', icon: <Share2 size={18} />, onClick: onShare },
    { label: 'Document Details', sub: 'Technical specifications', icon: <Info size={18} />, onClick: onDetails },
    { label: 'Download (.txt)', sub: 'Export plain text', icon: <FileText size={18} />, onClick: () => onDownload('txt') },
    { label: 'Download (.pdf)', sub: 'Export formatted PDF', icon: <FileCode size={18} />, onClick: () => onDownload('pdf') },
    { type: 'separator' },
    { label: 'Delete', sub: 'Move to trash forever', icon: <Trash2 size={18} />, onClick: onDelete, className: 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20' },
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
      item.onClick();
      setIsOpen(false);
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
        <span>File</span>
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

            return (
              <button
                key={item.label}
                onClick={() => handleItemClick(item)}
                onMouseEnter={() => setActiveIndex(itemIndex)}
                className={`w-full flex items-center gap-4 px-4 py-2.5 text-xs font-bold transition-all border-0 bg-transparent text-left cursor-pointer relative overflow-hidden group ${isActive
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                  : 'text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-800/50'
                  } ${item.className || ''}`}
                role="menuitem"
              >
                <div className={`p-2 rounded-xl transition-all ${isActive
                  ? 'bg-blue-600 text-text-heading shadow-lg shadow-blue-200 dark:shadow-none'
                  : 'bg-slate-100 dark:bg-gray-800 text-slate-500 group-hover:scale-110'
                  }`}>
                  {item.icon}
                </div>

                <div className="flex flex-col min-w-0">
                  <div className="flex items-baseline justify-between gap-4">
                    <span className={`${isActive ? 'translate-x-0.5' : ''} transition-transform duration-200`}>
                      {item.label}
                    </span>
                    {item.shortcut && (
                      <span className="text-[9px] text-slate-300 dark:text-slate-600 font-black">
                        {item.shortcut}
                      </span>
                    )}
                  </div>
                  {item.sub && (
                    <span className={`text-[10px] font-medium opacity-60 truncate ${isActive ? 'text-blue-500 dark:text-blue-300' : 'text-slate-400'}`}>
                      {item.sub}
                    </span>
                  )}
                </div>

                {isActive && (
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
