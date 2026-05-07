import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Image as ImageIcon, Link as LinkIcon, Table as TableIcon, 
  Minus, Calendar, Clock, Smile, Type, 
  List, ListOrdered, Heading1, Heading2, Heading3,
  Plus, ChevronRight, ChevronDown, Hash, Code,
  Upload, Globe, HardDrive, Camera,
  PenTool, BarChart2, Sigma, Bookmark,
  PieChart, LineChart, BarChartHorizontal, Divide
} from 'lucide-react';

/**
 * InsertMenu: Premium Google Docs style dropdown for inserting components.
 */
export default function InsertMenu({ 
  onInsertImage, 
  onInsertLink, 
  onInsertTable, 
  onInsertHeading,
  onInsertDivider,
  onInsertDateTime,
  onInsertEmoji,
  disabled = false 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [showTablePicker, setShowTablePicker] = useState(false);
  const [showImageSubmenu, setShowImageSubmenu] = useState(false);
  const [showDrawingSubmenu, setShowDrawingSubmenu] = useState(false);
  const [showChartSubmenu, setShowChartSubmenu] = useState(false);
  const [showSymbolSubmenu, setShowSymbolSubmenu] = useState(false);
  const [hoveredCell, setHoveredCell] = useState({ r: 0, c: 0 });
  const menuRef = useRef(null);

  const menuItems = [
    { label: 'Media & Tables', type: 'header' },
    { label: 'Image', sub: 'Insert from local disk', icon: <ImageIcon size={18} />, onMouseEnter: () => { setShowImageSubmenu(true); setShowTablePicker(false); }, hasSubmenu: true },
    { label: 'Link', sub: 'Insert hyperlink', icon: <LinkIcon size={18} />, onClick: onInsertLink, shortcut: 'Ctrl+K' },
    { label: 'Table', sub: 'Insert grid structure', icon: <TableIcon size={18} />, onMouseEnter: () => setShowTablePicker(true), hasSubmenu: true },
    { type: 'separator' },
    { label: 'Layout Elements', type: 'header' },
    { label: 'Horizontal Line', sub: 'Section separator', icon: <Minus size={18} />, onClick: onInsertDivider },
    { label: 'Heading 1', sub: 'Main title style', icon: <Heading1 size={18} />, onClick: () => onInsertHeading(1) },
    { label: 'Heading 2', sub: 'Section title style', icon: <Heading2 size={18} />, onClick: () => onInsertHeading(2) },
    { type: 'separator' },
    { label: 'Smart Chips', type: 'header' },
    { label: 'Current Date', sub: 'Auto-insert timestamp', icon: <Calendar size={18} />, onClick: () => onInsertDateTime('date') },
    { label: 'Current Time', sub: 'Exact time marker', icon: <Clock size={18} />, onClick: () => onInsertDateTime('time') },
    { label: 'Emoji', sub: 'Add expressions', icon: <Smile size={18} />, onClick: onInsertEmoji },
    { type: 'separator' },
    { label: 'Advanced Components', type: 'header' },
    { label: 'Drawing', sub: 'Create custom sketches', icon: <PenTool size={18} />, onMouseEnter: () => { setShowDrawingSubmenu(true); setShowImageSubmenu(false); setShowTablePicker(false); }, hasSubmenu: true },
    { label: 'Charts', sub: 'Visualize your data', icon: <BarChart2 size={18} />, onMouseEnter: () => { setShowChartSubmenu(true); setShowDrawingSubmenu(false); setShowImageSubmenu(false); setShowTablePicker(false); }, hasSubmenu: true },
    { label: 'Symbols', sub: 'Insert special characters', icon: <Sigma size={18} />, onMouseEnter: () => { setShowSymbolSubmenu(true); setShowChartSubmenu(false); setShowDrawingSubmenu(false); setShowImageSubmenu(false); setShowTablePicker(false); }, hasSubmenu: true },
    { label: 'Bookmark', sub: 'Mark important spots', icon: <Bookmark size={18} /> },
  ];

  const filteredItems = menuItems.filter(item => item.type !== 'separator' && item.type !== 'header');

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') setIsOpen(false);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev < filteredItems.length - 1 ? prev + 1 : prev));
      setShowTablePicker(false);
      setShowImageSubmenu(false);
      setShowDrawingSubmenu(false);
      setShowChartSubmenu(false);
      setShowSymbolSubmenu(false);
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev > 0 ? prev - 1 : prev));
      setShowTablePicker(false);
      setShowImageSubmenu(false);
      setShowDrawingSubmenu(false);
      setShowChartSubmenu(false);
      setShowSymbolSubmenu(false);
    }
    if (e.key === 'Enter' && activeIndex >= 0) {
      const item = filteredItems[activeIndex];
      if (item.onClick) {
        item.onClick();
        setIsOpen(false);
      }
    }
  }, [activeIndex, filteredItems]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
        setShowTablePicker(false);
        setShowImageSubmenu(false);
        setShowDrawingSubmenu(false);
        setShowChartSubmenu(false);
        setShowSymbolSubmenu(false);
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

  const handleTableInsert = (r, c) => {
    onInsertTable(r, c);
    setIsOpen(false);
    setShowTablePicker(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onMouseEnter={() => setActiveIndex(-1)}
        className={`text-[11px] px-3 py-1 rounded-md transition-all font-bold flex items-center space-x-1 outline-none border-0 bg-transparent uppercase tracking-wider ${
          disabled 
            ? 'text-slate-300 cursor-not-allowed' 
            : isOpen
              ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
              : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-gray-800 cursor-pointer'
        }`}
      >
        <span>Insert</span>
        <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? 'rotate-180 text-blue-500' : ''}`} />
      </button>

      {isOpen && (
        <div 
          className="absolute left-0 top-full mt-2 w-72 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-slate-200/60 dark:border-gray-800/60 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] py-3 z-[100] animate-in slide-in-from-top-2 zoom-in-95 fade-in duration-200 origin-top-left ring-1 ring-black/5"
          role="menu"
        >
          {menuItems.map((item, index) => {
            if (item.type === 'separator') {
              return <div key={`sep-${index}`} className="h-px bg-slate-100 dark:bg-gray-800 my-1.5 mx-3" />;
            }
            if (item.type === 'header') {
              return <div key={`head-${index}`} className="px-4 py-2 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{item.label}</div>;
            }

            const itemIndex = filteredItems.indexOf(item);
            const isActive = activeIndex === itemIndex;

            return (
              <div key={item.label} className="relative">
                <button
                  onMouseEnter={() => {
                    setActiveIndex(itemIndex);
                    if (item.onMouseEnter) item.onMouseEnter();
                    else {
                      setShowTablePicker(false);
                      setShowImageSubmenu(false);
                      setShowDrawingSubmenu(false);
                      setShowChartSubmenu(false);
                      setShowSymbolSubmenu(false);
                    }
                  }}
                  onClick={() => item.onClick && (item.onClick(), setIsOpen(false))}
                  className={`w-full flex items-center gap-4 px-4 py-2.5 text-xs font-bold transition-all border-0 bg-transparent text-left cursor-pointer relative overflow-hidden group ${
                    isActive 
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                      : 'text-slate-600 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-gray-800/50'
                  }`}
                  role="menuitem"
                >
                  <div className={`p-2 rounded-xl transition-all ${
                    isActive 
                      ? 'bg-blue-600 text-text-heading shadow-lg shadow-blue-200 dark:shadow-none' 
                      : 'bg-slate-100 dark:bg-gray-800 text-slate-500 group-hover:scale-110'
                  }`}>
                    {item.icon}
                  </div>
                  
                  <div className="flex flex-col min-w-0 flex-1">
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

                  {item.hasSubmenu && (
                    <div className="ml-auto animate-in fade-in slide-in-from-right-1">
                      <ChevronRight size={14} className="opacity-40" />
                    </div>
                  )}
                </button>

                {/* Table Hover Picker Submenu */}
                {showTablePicker && item.label === 'Table' && (
                  <div className="absolute left-full top-0 ml-2 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-slate-200/60 dark:border-gray-800/60 rounded-2xl shadow-2xl p-5 z-[101] animate-in slide-in-from-left-2 duration-300 ring-1 ring-black/5">
                    <div className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase mb-4 tracking-widest text-center flex items-center justify-center gap-2">
                       <TableIcon size={12} /> Grid: {hoveredCell.r || 1} x {hoveredCell.c || 1}
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                      {[1, 2, 3, 4, 5].map(r => (
                        [1, 2, 3, 4, 5].map(c => (
                          <div
                            key={`${r}-${c}`}
                            onMouseEnter={() => setHoveredCell({ r, c })}
                            onClick={() => handleTableInsert(r, c)}
                            className={`w-6 h-6 border rounded-md transition-all cursor-pointer ${r <= hoveredCell.r && c <= hoveredCell.c ? 'bg-blue-600 border-blue-600 shadow-md scale-110' : 'bg-slate-100 dark:bg-gray-800 border-slate-200 dark:border-gray-700 hover:border-blue-400'}`}
                          />
                        ))
                      ))}
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-gray-800 text-center">
                       <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">Click to finalize</p>
                    </div>
                  </div>
                )}

                {/* Image Hover Submenu */}
                {showImageSubmenu && item.label === 'Image' && (
                  <div className="absolute left-full top-0 ml-2 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-slate-200/60 dark:border-gray-800/60 rounded-2xl shadow-2xl py-3 z-[101] animate-in slide-in-from-left-2 duration-300 ring-1 ring-black/5 w-60">
                    {[
                      { label: 'Upload from computer', icon: <Upload size={14} />, onClick: onInsertImage },
                      { label: 'Search the web', icon: <Globe size={14} /> },
                      { label: 'Drive', icon: <HardDrive size={14} /> },
                      { label: 'Photos', icon: <ImageIcon size={14} /> },
                      { label: 'Camera', icon: <Camera size={14} /> },
                      { label: 'By URL', icon: <LinkIcon size={14} /> },
                    ].map((sub, sIdx) => (
                      <button
                        key={sIdx}
                        onClick={() => { sub.onClick?.(); setIsOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 border-0 bg-transparent text-left cursor-pointer transition-all"
                      >
                        <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-gray-800 text-slate-400 group-hover:text-blue-600">
                          {sub.icon}
                        </div>
                        <span className="uppercase tracking-widest text-[10px]">{sub.label}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Drawing Hover Submenu */}
                {showDrawingSubmenu && item.label === 'Drawing' && (
                  <div className="absolute left-full top-0 ml-2 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-slate-200/60 dark:border-gray-800/60 rounded-2xl shadow-2xl py-3 z-[101] animate-in slide-in-from-left-2 duration-300 ring-1 ring-black/5 w-52">
                    {[
                      { label: 'New', icon: <Plus size={14} />, onClick: () => console.log('new drawing') },
                      { label: 'From Drive', icon: <HardDrive size={14} />, onClick: () => console.log('drive drawing') },
                    ].map((sub, sIdx) => (
                      <button
                        key={sIdx}
                        onClick={() => { sub.onClick?.(); setIsOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 border-0 bg-transparent text-left cursor-pointer transition-all"
                      >
                        <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-gray-800 text-slate-400 group-hover:text-blue-600">
                          {sub.icon}
                        </div>
                        <span className="uppercase tracking-widest text-[10px]">{sub.label}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Chart Hover Submenu */}
                {showChartSubmenu && item.label === 'Charts' && (
                  <div className="absolute left-full top-0 ml-2 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-slate-200/60 dark:border-gray-800/60 rounded-2xl shadow-2xl py-3 z-[101] animate-in slide-in-from-left-2 duration-300 ring-1 ring-black/5 w-52">
                    {[
                      { label: 'Bar', icon: <BarChartHorizontal size={14} />, onClick: () => console.log('bar chart') },
                      { label: 'Column', icon: <BarChart2 size={14} />, onClick: () => console.log('column chart') },
                      { label: 'Line', icon: <LineChart size={14} />, onClick: () => console.log('line chart') },
                      { label: 'Pie', icon: <PieChart size={14} />, onClick: () => console.log('pie chart') },
                    ].map((sub, sIdx) => (
                      <button
                        key={sIdx}
                        onClick={() => { sub.onClick?.(); setIsOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 border-0 bg-transparent text-left cursor-pointer transition-all"
                      >
                        <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-gray-800 text-slate-400 group-hover:text-blue-600">
                          {sub.icon}
                        </div>
                        <span className="uppercase tracking-widest text-[10px]">{sub.label}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Symbol Hover Submenu */}
                {showSymbolSubmenu && item.label === 'Symbols' && (
                  <div className="absolute left-full top-0 ml-2 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-slate-200/60 dark:border-gray-800/60 rounded-2xl shadow-2xl py-3 z-[101] animate-in slide-in-from-left-2 duration-300 ring-1 ring-black/5 w-56">
                    {[
                      { label: 'Emoji', icon: <Smile size={14} />, onClick: () => console.log('emoji') },
                      { label: 'Special character', icon: <Sigma size={14} />, onClick: () => console.log('special') },
                      { label: 'Equations', icon: <Divide size={14} />, onClick: () => console.log('equations') },
                    ].map((sub, sIdx) => (
                      <button
                        key={sIdx}
                        onClick={() => { sub.onClick?.(); setIsOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 border-0 bg-transparent text-left cursor-pointer transition-all"
                      >
                        <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-gray-800 text-slate-400 group-hover:text-blue-600">
                          {sub.icon}
                        </div>
                        <span className="uppercase tracking-widest text-[10px]">{sub.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
