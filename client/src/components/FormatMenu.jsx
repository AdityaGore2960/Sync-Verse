import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Type, Bold, Italic, Underline, List, 
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Palette, CaseUpper, Scissors, Copy, ClipboardPaste,
  ChevronRight, ChevronDown, Highlighter, Strikethrough,
  Superscript, Subscript, Code, Eraser, Sparkles
} from 'lucide-react';

/**
 * FormatMenu V5: Cinematic document styling & AI formatting.
 */
export default function FormatMenu({ onFormat, disabled = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const menuRef = useRef(null);

  const menuItems = [
    { label: 'AI Styling', type: 'header' },
    { label: 'Smart Format', sub: 'Machine learning touch', icon: <Sparkles size={16} />, onClick: () => onFormat('ai-format'), shortcut: 'Ctrl+Shift+F' },
    { type: 'separator' },
    { label: 'Character Style', type: 'header' },
    { label: 'Bold', sub: 'Strong prominence', icon: <Bold size={16} />, onClick: () => onFormat('bold'), shortcut: 'Ctrl+B' },
    { label: 'Italic', sub: 'Emphasis slant', icon: <Italic size={16} />, onClick: () => onFormat('italic'), shortcut: 'Ctrl+I' },
    { label: 'Underline', sub: 'Base underline', icon: <Underline size={16} />, onClick: () => onFormat('underline'), shortcut: 'Ctrl+U' },
    { label: 'Strikethrough', sub: 'Cross out text', icon: <Strikethrough size={16} />, onClick: () => onFormat('strike') },
    { type: 'separator' },
    { label: 'Alignment', type: 'header' },
    { label: 'Align Center', sub: 'Perfect balance', icon: <AlignCenter size={16} />, onClick: () => onFormat({'align': 'center'}) },
    { label: 'Perfect Justify', sub: 'Block alignment', icon: <AlignJustify size={16} />, onClick: () => onFormat({'align': 'justify'}) },
    { type: 'separator' },
    { label: 'Visual Palette', type: 'header' },
    { label: 'Text Color', sub: 'Define identity', icon: <Palette size={16} />, onClick: () => onFormat('color') },
    { label: 'Highlighter', sub: 'Selective focus', icon: <Highlighter size={16} />, onClick: () => onFormat('background') },
    { type: 'separator' },
    { label: 'Reset', sub: 'Clean all styles', icon: <Eraser size={16} />, onClick: () => onFormat('clean'), shortcut: 'Ctrl+\\' },
  ];

  const filteredItems = menuItems.filter(item => item.type !== 'separator' && item.type !== 'header');

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
      filteredItems[activeIndex].onClick();
      setIsOpen(false);
    }
  }, [activeIndex, filteredItems]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setIsOpen(false);
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

  const handleItemClick = (onClick) => {
    onClick();
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block z-[1100]" ref={menuRef}>
      <button 
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onMouseEnter={() => setActiveIndex(-1)}
        className={`text-[11px] px-3 py-1.5 rounded-xl transition-all font-black flex items-center space-x-2 border-0 bg-transparent uppercase tracking-widest cursor-pointer group active:scale-95 ${
          disabled 
            ? 'text-slate-200 cursor-not-allowed opacity-40' 
            : isOpen
              ? 'bg-blue-600 text-text-heading shadow-xl shadow-blue-200'
              : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 group-hover:scale-105'
        }`}
      >
        <span>Format</span>
        <ChevronDown size={14} className={`transition-transform duration-500 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div 
          className="absolute left-0 top-full mt-3 w-80 bg-white/95 backdrop-blur-3xl border border-slate-100 rounded-[32px] shadow-[0_30px_70px_rgba(0,0,0,0.15)] py-4 z-[1000] animate-in slide-in-from-top-3 zoom-in-95 fade-in duration-500 origin-top-left overflow-hidden no-print"
          role="menu"
        >
          {menuItems.map((item, index) => {
            if (item.type === 'separator') {
              return <div key={`sep-${index}`} className="h-px bg-slate-100/60 my-2 mx-6" />;
            }
            if (item.type === 'header') {
              return <div key={`head-${index}`} className="px-8 py-3 text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">{item.label}</div>;
            }

            const itemIndex = filteredItems.indexOf(item);
            const isActive = activeIndex === itemIndex;

            return (
              <button
                key={item.label}
                onClick={() => handleItemClick(item.onClick)}
                onMouseEnter={() => setActiveIndex(itemIndex)}
                className={`w-full flex items-center gap-4 px-6 py-3 text-[11px] font-black transition-all border-0 bg-transparent text-left cursor-pointer relative group/item overflow-hidden ${
                  isActive 
                    ? 'text-blue-600 pl-8' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                role="menuitem"
              >
                {isActive && <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-blue-600 rounded-full animate-in slide-in-from-left duration-300" />}

                <div className={`p-2.5 rounded-2xl transition-all duration-500 ${
                  isActive 
                    ? 'bg-blue-600 text-text-heading shadow-xl shadow-blue-200 rotate-0 scale-110' 
                    : 'bg-slate-50 text-slate-400 group-hover/item:rotate-12 group-hover/item:scale-105 group-hover/item:text-slate-600'
                }`}>
                  {item.icon}
                </div>
                
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-4">
                    <span className={`uppercase tracking-widest ${isActive ? 'translate-x-1 duration-500' : 'translate-x-0'}`}>
                      {item.label}
                    </span>
                    {item.shortcut && (
                      <span className="text-[9px] text-slate-300 font-bold opacity-0 group-hover/item:opacity-100 duration-500">
                        {item.shortcut}
                      </span>
                    )}
                  </div>
                  {item.sub && (
                    <span className={`text-[9px] font-bold opacity-60 truncate transition-colors duration-500 ${isActive ? 'text-blue-400' : 'text-slate-400'}`}>
                      {item.sub}
                    </span>
                  )}
                </div>

                {isActive && (
                  <div className="ml-auto mr-2 animate-in fade-in slide-in-from-right-1">
                    <ChevronRight size={14} className="opacity-30" />
                  </div>
                )}
              </button>
            );
          })}
          
          <div className="mt-4 bg-slate-50 p-4 border-t border-slate-100/60 hidden lg:flex items-center justify-center gap-3">
             <div className="p-1 px-2 rounded-lg bg-white border border-slate-200 shadow-sm text-[8px] font-black text-slate-400 uppercase tracking-widest">Premium Engine</div>
             <div className="w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
          </div>
        </div>
      )}
    </div>
  );
}
