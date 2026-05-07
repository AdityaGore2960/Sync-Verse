import { useState, useEffect, useRef } from 'react';
import { 
  Maximize2, Minimize2, Type, Layout, List, 
  ZoomIn, ZoomOut, Eye, EyeOff, 
  Sidebar as SidebarIcon, Terminal, Smartphone, Monitor, Check,
  ChevronRight, ChevronDown, Sparkles, LayoutGrid, Layers, MessageSquare,
  Pencil, MessageCircle
} from 'lucide-react';

/**
 * ViewMenu V5: Cinematic viewport control & perspective management.
 */
export default function ViewMenu({ 
  viewSettings, 
  onToggleSetting, 
  onZoom, 
  onToggleOutline, 
  disabled = false 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [activeSubmenu, setActiveSubmenu] = useState(null);
  const menuRef = useRef(null);

  const menuItems = [
    { label: 'Workspace Perspective', type: 'header' },
    { 
      label: 'Focus Mode', 
      sub: 'Cinematic writing focus', 
      icon: <Layers size={16} />, 
      active: viewSettings.isFocusMode, 
      onClick: () => onToggleSetting('isFocusMode'), 
      shortcut: 'Ctrl+Shift+L' 
    },
    { 
      label: 'Full Screen', 
      sub: 'Infinite screen real-estate', 
      icon: <Maximize2 size={16} />, 
      active: viewSettings.isFullScreen, 
      onClick: () => onToggleSetting('isFullScreen'), 
      shortcut: 'F11' 
    },
    { 
      label: 'Viewing Mode', 
      sub: 'Switch between Edit/View', 
      icon: <Eye size={16} />, 
      onClick: () => onToggleSetting('isViewMode'),
      submenu: [
        { label: 'Editing', icon: <Pencil size={14} />, onClick: () => console.log('editing') },
        { label: 'Suggesting', icon: <MessageCircle size={14} />, onClick: () => console.log('suggesting') }
      ]
    },
    { type: 'separator' },
    { label: 'Navigation Layout', type: 'header' },
    { 
      label: 'Document Outline', 
      sub: 'Left-side structural view', 
      icon: <List size={16} />, 
      active: viewSettings.showOutline, 
      onClick: onToggleOutline, 
      shortcut: 'Ctrl+Shift+O' 
    },
    { 
      label: 'Collaboration Chat', 
      sub: 'Toggle presence sidebar', 
      icon: <Sparkles size={16} />, 
      active: viewSettings.showChat, 
      onClick: () => onToggleSetting('showChat') 
    },
    { 
      label: 'Comments', 
      sub: 'Manage review threads', 
      icon: <MessageSquare size={16} />, 
      onClick: () => onToggleSetting('showComments'),
      submenu: [
        { label: 'Hide comments', icon: <EyeOff size={14} />, onClick: () => console.log('hide') },
        { label: 'Show all comments', icon: <MessageSquare size={14} />, onClick: () => console.log('show all') },
        { label: 'Minimize comments', icon: <Minimize2 size={14} />, onClick: () => console.log('minimize') },
        { label: 'Expand comments', icon: <Maximize2 size={14} />, onClick: () => console.log('expand') }
      ]
    },
    { type: 'separator' },
    { label: 'Zoom Experience', type: 'header' },
    { 
      label: 'Zoom In', 
      sub: 'Increase canvas size', 
      icon: <ZoomIn size={16} />, 
      onClick: () => onZoom(10), 
      shortcut: 'Ctrl + +' 
    },
    { 
      label: 'Reset Zoom', 
      sub: 'Standard 100% scale', 
      icon: <LayoutGrid size={16} />, 
      onClick: () => onZoom(0) 
    },
    { 
      label: 'Zoom Out', 
      sub: 'Decrease canvas size', 
      icon: <ZoomOut size={16} />, 
      onClick: () => onZoom(-10), 
      shortcut: 'Ctrl + -' 
    },
  ];

  const filteredItems = menuItems.filter(item => item.type !== 'separator' && item.type !== 'header');

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setIsOpen(false);
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('keydown', (e) => { if(e.key==='Escape') setIsOpen(false); });
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

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
              ? 'bg-slate-900 text-text-heading shadow-xl'
              : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
        }`}
      >
        <span>View</span>
        <ChevronDown size={14} className={`transition-transform duration-500 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div 
          className="absolute left-0 top-full mt-3 w-80 bg-white border border-slate-100 rounded-[32px] shadow-[0_30px_70px_rgba(0,0,0,0.15)] py-4 z-[1000] animate-in slide-in-from-top-3 zoom-in-95 fade-in duration-500 origin-top-left overflow-hidden no-print"
          role="menu"
        >
          {menuItems.map((item, index) => {
            if (item.type === 'separator') {
              return <div key={`sep-${index}`} className="h-px bg-slate-50 my-2 mx-6" />;
            }
            if (item.type === 'header') {
              return <div key={`head-${index}`} className="px-8 py-3 text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">{item.label}</div>;
            }

            const itemIndex = filteredItems.indexOf(item);
            const isActive = activeIndex === itemIndex;
            const isSelected = item.active;
            const hasSubmenu = !!item.submenu;

            return (
              <button
                key={item.label}
                onClick={() => !hasSubmenu && handleItemClick(item.onClick)}
                onMouseEnter={() => {
                  setActiveIndex(itemIndex);
                  if (hasSubmenu) setActiveSubmenu(itemIndex);
                  else setActiveSubmenu(null);
                }}
                className={`w-full flex items-center gap-4 px-6 py-3 text-[11px] font-black transition-all border-0 bg-transparent text-left cursor-pointer relative group/item overflow-visible ${
                  isActive 
                    ? 'text-blue-600 pl-8' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                role="menuitem"
              >
                {isSelected && (
                   <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 shadow-[2px_0_10px_rgba(37,99,235,0.4)]" />
                )}

                <div className={`p-2.5 rounded-2xl transition-all duration-500 ${
                  isActive 
                    ? 'bg-blue-600 text-text-heading shadow-xl shadow-blue-200' 
                    : 'bg-slate-50 text-slate-400 group-hover/item:text-slate-600'
                }`}>
                  {item.icon}
                </div>
                
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-4">
                    <span className={`uppercase tracking-widest ${isActive ? 'translate-x-1 duration-500' : 'translate-x-0'}`}>
                      {item.label}
                    </span>
                    {isSelected && <Check size={14} className="text-blue-600 animate-in zoom-in duration-300" />}
                    {hasSubmenu && <ChevronRight size={14} className={`ml-auto transition-transform ${isActive ? 'translate-x-1' : ''}`} />}
                  </div>
                  {item.sub && (
                    <span className={`text-[9px] font-bold opacity-60 truncate transition-colors duration-500 ${isActive ? 'text-blue-400' : 'text-slate-400'}`}>
                      {item.sub}
                    </span>
                  )}
                </div>

                {hasSubmenu && activeSubmenu === itemIndex && (
                  <div className="absolute left-full top-0 ml-1 w-48 bg-white border border-slate-100 rounded-2xl shadow-2xl py-2 z-[2000] animate-in slide-in-from-left-2 fade-in duration-300">
                    {item.submenu.map((sub, sIdx) => (
                      <button
                        key={sIdx}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleItemClick(sub.onClick);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-[10px] font-black text-slate-600 hover:text-blue-600 hover:bg-slate-50 border-0 bg-transparent text-left cursor-pointer transition-all"
                      >
                        <div className="p-1.5 rounded-lg bg-slate-50 text-slate-400 group-hover:text-blue-600">
                          {sub.icon}
                        </div>
                        <span className="uppercase tracking-widest">{sub.label}</span>
                      </button>
                    ))}
                  </div>
                )}

                {item.shortcut && (
                   <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest opacity-0 group-hover/item:opacity-100 transition-opacity">
                      {item.shortcut}
                   </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
