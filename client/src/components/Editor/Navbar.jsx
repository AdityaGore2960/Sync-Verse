import React, { useState } from 'react';
import {
  FileText, Star, Share2, MessageSquare, History,
  ChevronDown, Search, Cloud, Check, Loader2,
  Trash2, FilePlus, FolderOpen, Save, Copy, FileCode,
  Undo2, Redo2, Scissors, Copy as CopyIcon, Clipboard,
  Maximize2, Eye, Layout, Type, List, Calculator,
  HelpCircle, Settings, User, MousePointer2, Pencil, ChevronRight, EyeOff, Minimize2,
  Upload, Globe, HardDrive, Image, Camera, Link,
  PenTool, BarChart2, Sigma, Bookmark, Plus,
  PieChart, LineChart, BarChartHorizontal, Smile, Divide,
  Wrench, Bold, Italic, Underline as UnderlineIcon, Strikethrough, Superscript, Subscript, Eraser, SpellCheck, Languages, BookOpen
} from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';
import FileMenu from '../FileMenu';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ onShare, onOpen, onSave, onRename, onDelete, onNew, onMakeCopy, onDownload, onDetails, onSelectAll, onFind, collaborators = [] }) => {
  const navigate = useNavigate();
  const { title, setTitle, saveStatus, isStarred, setIsStarred, followingId, setFollowingId } = useEditorStore();
  const [activeMenu, setActiveMenu] = useState(null);
  const [activeSubmenu, setActiveSubmenu] = useState(null);


  const menus = [
    {
      label: 'Edit', items: [
        { label: 'Undo', icon: <Undo2 size={16} />, shortcut: 'Ctrl+Z', onClick: () => document.execCommand('undo') },
        { label: 'Redo', icon: <Redo2 size={16} />, shortcut: 'Ctrl+Y', onClick: () => document.execCommand('redo') },
        { type: 'divider' },
        { label: 'Cut', icon: <Scissors size={16} />, shortcut: 'Ctrl+X', onClick: () => document.execCommand('cut') },
        { label: 'Copy', icon: <CopyIcon size={16} />, shortcut: 'Ctrl+C', onClick: () => document.execCommand('copy') },
        { label: 'Paste', icon: <Clipboard size={16} />, shortcut: 'Ctrl+V', onClick: () => navigator.clipboard.readText() },
        { type: 'divider' },
        { label: 'Select all', icon: <MousePointer2 size={16} />, shortcut: 'Ctrl+A', onClick: onSelectAll },
        { label: 'Find and replace', icon: <Search size={16} />, shortcut: 'Ctrl+F', onClick: onFind },
      ]
    },
    {
      label: 'View', items: [
        { label: 'Full screen', icon: <Maximize2 size={16} />, onClick: () => document.documentElement.requestFullscreen() },
        { label: 'Show layout', icon: <Layout size={16} /> },
        { type: 'divider' },
        {
          label: 'Mode',
          icon: <Eye size={16} />,
          submenu: [
            { label: 'Editing', icon: <Pencil size={14} />, onClick: () => console.log('editing') },
            { label: 'Suggesting', icon: <MessageSquare size={14} />, onClick: () => console.log('suggesting') }
          ]
        },
        {
          label: 'Comments',
          icon: <MessageSquare size={16} />,
          submenu: [
            { label: 'Hide comments', icon: <EyeOff size={14} />, onClick: () => console.log('hide') },
            { label: 'Show all comments', icon: <MessageSquare size={14} />, onClick: () => console.log('show all') },
            { label: 'Minimize comments', icon: <Minimize2 size={14} />, onClick: () => console.log('minimize') },
            { label: 'Expand comments', icon: <Maximize2 size={14} />, onClick: () => console.log('expand') }
          ]
        },
      ]
    },
    {
      label: 'Insert', items: [
        {
          label: 'Image',
          icon: <Image size={16} />,
          submenu: [
            { label: 'Upload from computer', icon: <Upload size={14} />, onClick: () => console.log('upload') },
            { label: 'Search the web', icon: <Globe size={14} />, onClick: () => console.log('search web') },
            { label: 'Drive', icon: <HardDrive size={14} />, onClick: () => console.log('drive') },
            { label: 'Photos', icon: <Image size={14} />, onClick: () => console.log('photos') },
            { label: 'Camera', icon: <Camera size={14} />, onClick: () => console.log('camera') },
            { label: 'By URL', icon: <Link size={14} />, onClick: () => console.log('url') },
          ]
        },
        { label: 'Table', icon: <Layout size={16} /> },
        { label: 'Link', icon: <Share2 size={16} /> },
        { type: 'divider' },
        {
          label: 'Drawing',
          icon: <PenTool size={16} />,
          submenu: [
            { label: 'New', icon: <Plus size={14} />, onClick: () => console.log('new drawing') },
            { label: 'From Drive', icon: <HardDrive size={14} />, onClick: () => console.log('drive drawing') }
          ]
        },
        {
          label: 'Charts',
          icon: <BarChart2 size={16} />,
          submenu: [
            { label: 'Bar', icon: <BarChartHorizontal size={14} />, onClick: () => console.log('bar chart') },
            { label: 'Column', icon: <BarChart2 size={14} />, onClick: () => console.log('column chart') },
            { label: 'Line', icon: <LineChart size={14} />, onClick: () => console.log('line chart') },
            { label: 'Pie', icon: <PieChart size={14} />, onClick: () => console.log('pie chart') },
          ]
        },
        {
          label: 'Symbols',
          icon: <Sigma size={16} />,
          submenu: [
            { label: 'Emoji', icon: <Smile size={14} />, onClick: () => console.log('emoji') },
            { label: 'Special character', icon: <Sigma size={14} />, onClick: () => console.log('special') },
            { label: 'Equations', icon: <Divide size={14} />, onClick: () => console.log('equations') },
          ]
        },
        { label: 'Bookmark', icon: <Bookmark size={16} /> },
      ]
    },
    {
      label: 'Format', items: [
        { label: 'Bold', icon: <Bold size={16} />, shortcut: 'Ctrl+B' },
        { label: 'Italic', icon: <Italic size={16} />, shortcut: 'Ctrl+I' },
        { label: 'Underline', icon: <UnderlineIcon size={16} />, shortcut: 'Ctrl+U' },
        { label: 'Strikethrough', icon: <Strikethrough size={16} />, shortcut: 'Alt+Shift+5' },
        { type: 'divider' },
        { label: 'Superscript', icon: <Superscript size={16} />, shortcut: 'Ctrl+.' },
        { label: 'Subscript', icon: <Subscript size={16} />, shortcut: 'Ctrl+,' },
        { type: 'divider' },
        { label: 'Clear formatting', icon: <Eraser size={16} />, shortcut: 'Ctrl+\\' },
      ]
    },
    {
      label: 'Tools', items: [
        { label: 'Spelling and grammar', icon: <SpellCheck size={16} /> },
        { label: 'Word count', icon: <Calculator size={16} />, shortcut: 'Ctrl+Shift+C' },
        { label: 'Review suggested edits', icon: <MessageSquare size={16} /> },
        { type: 'divider' },
        { label: 'Dictionary', icon: <BookOpen size={16} />, shortcut: 'Ctrl+Shift+Y' },
        { label: 'Translate document', icon: <Languages size={16} /> },
        { type: 'divider' },
        { label: 'Preferences', icon: <Settings size={16} /> },
      ]
    },
    {
      label: 'Help', items: [
        { label: 'Help center', icon: <HelpCircle size={16} /> },
        { label: 'Keyboard shortcuts', icon: <Calculator size={16} /> },
      ]
    },
  ];

  const MinusIcon = () => <div className="h-px w-4 bg-slate-400" />;

  return (
    <nav className="flex items-center justify-between px-4 py-1.5 bg-bg-canvas border-b border-border-subtle select-none no-print sticky top-0 z-50">
      <div className="flex items-center gap-2">
        {/* Logo Icon */}
        <div className="p-1 px-2 cursor-pointer hover:bg-bg-card-hover rounded transition-colors group" onClick={() => navigate('/dashboard')}>
          <FileText size={36} className="text-brand-primary" />
        </div>

        <div className="flex flex-col -space-y-0.5">
          <div className="flex items-center gap-1">
            <input
              className="px-1.5 py-0.5 text-base font-bold text-text-heading bg-transparent border-transparent hover:border-border-subtle border rounded outline-none transition-all cursor-pointer focus:cursor-text min-w-[50px] max-w-[400px]"
              value={title || ''}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => {
                if (title && title.trim() !== useEditorStore.getState().documentMetadata?.title) {
                  onRename?.(title.trim());
                }
              }}
              placeholder="Untitled Document"
              style={{ width: `${Math.max(title?.length || 8, 8) + 2}ch` }}
            />
            <button
              onClick={() => setIsStarred(!isStarred)}
              className={`p-1 rounded hover:bg-bg-card-hover transition-colors border-0 bg-transparent cursor-pointer ${isStarred ? 'text-amber-400' : 'text-text-muted'}`}
            >
              <Star size={16} fill={isStarred ? 'currentColor' : 'none'} strokeWidth={isStarred ? 0 : 2} />
            </button>
            <div className="flex items-center gap-1 px-2 text-text-muted">
              {saveStatus === 'saving' ? (
                <div className="flex items-center gap-1 animate-pulse">
                  <Loader2 size={12} className="animate-spin text-brand-primary" />
                </div>
              ) : (
                <div className="flex items-center gap-1" title="Saved">
                  <Cloud size={12} className="text-text-muted/60" />
                </div>
              )}
            </div>
          </div>

          {/* Menus */}
          <div className="flex items-center gap-0.5 ml-1">
            <FileMenu
              onNew={onNew}
              onOpen={onOpen}
              onRename={() => onRename?.()}
              onSave={onSave}
              onDelete={onDelete}
              onShare={onShare}
              onSaveAs={onMakeCopy}
              onDownload={onDownload}
              onDetails={onDetails}
            />
            {menus.map((menu) => (
              <div key={menu.label} className="relative">
                <button
                  className={`px-2 py-0.5 text-xs font-medium rounded hover:bg-bg-card-hover transition-colors border-0 bg-transparent cursor-pointer ${activeMenu === menu.label ? 'bg-bg-card-hover text-text-heading' : 'text-text-muted hover:text-text-heading'}`}
                  onMouseEnter={() => activeMenu && setActiveMenu(menu.label)}
                  onClick={() => setActiveMenu(activeMenu === menu.label ? null : menu.label)}
                >
                  {menu.label}
                </button>
                {activeMenu === menu.label && (
                  <div className="absolute top-full left-0 mt-1 w-64 bg-bg-surface border border-border-subtle shadow-2xl rounded-lg py-1 z-100 animate-in fade-in duration-150">
                    {menu.items.map((item, idx) => (
                      item.type === 'divider' ? (
                        <div key={idx} className="h-px bg-border-subtle my-1" />
                      ) : (
                        <div key={idx} className="relative">
                          <button
                            className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium hover:bg-bg-card-hover transition-colors border-0 bg-transparent text-left cursor-pointer ${item.className || 'text-text-body hover:text-text-heading'}`}
                            onMouseEnter={() => item.submenu ? setActiveSubmenu(idx) : setActiveSubmenu(null)}
                            onClick={() => { if (!item.submenu) { setActiveMenu(null); item.onClick?.(); } }}
                          >
                            <div className="flex items-center gap-3">
                              {item.icon && <span className="w-4 h-4 opacity-70 flex items-center justify-center">{item.icon}</span>}
                              {!item.icon && <div className="w-4" />}
                              <span>{item.label}</span>
                            </div>
                            {item.shortcut && <span className="text-[10px] text-text-muted font-bold tracking-tighter">{item.shortcut}</span>}
                            {item.submenu && <ChevronRight size={14} className="text-text-muted" />}
                          </button>

                          {item.submenu && activeSubmenu === idx && (
                            <div className="absolute left-full top-0 ml-0.5 w-48 bg-bg-surface border border-border-subtle shadow-2xl rounded-lg py-1 z-110 animate-in slide-in-from-left-1 duration-150">
                              {item.submenu.map((sub, sIdx) => (
                                <button
                                  key={sIdx}
                                  className="w-full flex items-center gap-3 px-3 py-2 text-xs font-medium text-text-body hover:text-text-heading hover:bg-bg-card-hover transition-colors border-0 bg-transparent text-left cursor-pointer"
                                  onClick={() => { setActiveMenu(null); sub.onClick?.(); }}
                                >
                                  {sub.icon && <span className="w-4 h-4 opacity-70 flex items-center justify-center">{sub.icon}</span>}
                                  <span>{sub.label}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-1 text-text-muted">
          <button className="p-2 rounded-lg hover:bg-bg-card-hover transition-colors border-0 bg-transparent cursor-pointer hover:text-text-heading">
            <MessageSquare size={18} />
          </button>
          <button className="p-2 rounded-lg hover:bg-bg-card-hover transition-colors border-0 bg-transparent cursor-pointer hover:text-text-heading">
            <History size={18} />
          </button>
        </div>

        {/* Share Button (Accent) */}
        <button
          onClick={onShare}
          className="flex items-center gap-2 px-6 py-2 bg-brand-primary hover:bg-brand-hover text-text-heading rounded-lg font-bold text-sm transition-all border-0 cursor-pointer shadow-lg shadow-brand-primary/10 active:scale-95"
        >
          <Share2 size={16} />
          <span>Share</span>
        </button>

        {/* User Profile */}
        <div className="flex -space-x-1 items-center">
          <div className="flex -space-x-2 mr-3 border-r border-border-subtle pr-3">
            {collaborators.map(c => (
              <div
                key={c.id}
                onClick={() => setFollowingId(followingId === c.id ? null : c.id)}
                className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-text-heading text-[10px] font-bold shadow-sm cursor-pointer transition-all hover:scale-110 active:scale-95 relative group ${followingId === c.id ? 'border-brand-primary scale-110 ring-2 ring-brand-primary ring-offset-2 ring-offset-bg-canvas' : 'border-bg-canvas'
                  }`}
                style={{ background: c.color || '#3b82f6' }}
                title={followingId === c.id ? `Following ${c.name}` : `Follow ${c.name}`}
              >
                {c.name.charAt(0)}
                {followingId === c.id && (
                  <div className="absolute inset-0 rounded-full animate-ping bg-brand-primary opacity-20 pointer-events-none" />
                )}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-bg-surface border border-border-subtle px-2 py-1 rounded text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-xl font-bold text-text-heading">
                  {c.name} {followingId === c.id ? '(Following)' : ''}
                </div>
              </div>
            ))}
          </div>
          <div className="w-8 h-8 rounded-full bg-bg-card-hover flex items-center justify-center text-text-heading text-xs font-bold ring-1 ring-border-subtle cursor-pointer hover:ring-brand-primary transition-all">
            <User size={16} className="text-text-muted" />
          </div>
        </div>
      </div>

      {activeMenu && (
        <div className="fixed inset-0 z-40" onClick={() => setActiveMenu(null)} />
      )}
    </nav>
  );
};

export default Navbar;
