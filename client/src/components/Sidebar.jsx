import { useState } from 'react';
import { Home, FileText, Users, ChevronLeft, ChevronRight, LogOut, Star } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useLocation, Link } from 'react-router-dom';

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { name: 'Home', icon: Home, path: '/dashboard' },
    { name: 'My Docs', icon: FileText, path: '/my-documents' },
    { name: 'Shared Docs', icon: Users, path: '/shared-documents' },
    { name: 'Favorites', icon: Star, path: '/favorites' },
  ];

  return (
    <aside
      className={`${isCollapsed ? 'w-20' : 'w-72'} transition-all duration-300 ease-in-out border-r border-border-subtle bg-bg-sidebar text-text-muted flex flex-col hidden md:flex shrink-0 relative z-[100] h-screen overflow-visible`}
    >
      {/* Collapse Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3.5 top-7 bg-bg-surface border border-border-subtle text-text-muted rounded-full p-1.5 hover:bg-brand-primary hover:text-text-heading transition-all z-[110] shadow-md cursor-pointer flex items-center justify-center focus:outline-none"
      >
        {isCollapsed ? <ChevronRight size={14} strokeWidth={3} /> : <ChevronLeft size={14} strokeWidth={3} />}
      </button>

      {/* Header / Logo */}
      <div className={`h-24 flex items-center shrink-0 transition-all duration-300 ${isCollapsed ? 'justify-center px-0' : 'px-8 space-x-4'}`}>
        <div className="bg-brand-primary text-text-heading p-2.5 rounded-2xl flex-shrink-0 shadow-lg shadow-brand-primary/20">
          <FileText size={22} className="stroke-[2.5]" />
        </div>
        {!isCollapsed && (
          <span className="font-black text-2xl text-text-heading tracking-tighter whitespace-nowrap animate-in fade-in zoom-in duration-300">
            SyncVerse
          </span>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="px-4 flex-grow overflow-y-auto space-y-1 overflow-x-hidden hide-scrollbar">
        <p className={`text-[10px] font-black text-text-muted/60 mb-6 mt-2 px-4 uppercase tracking-[0.2em] whitespace-nowrap transition-all duration-300 ${isCollapsed ? 'opacity-0 h-0 hidden' : 'opacity-100'}`}>
          Main menu
        </p>

        {navItems.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.name}
              to={item.path}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center p-3' : 'space-x-4 px-4 py-3.5'} rounded-xl font-bold transition-all duration-200 cursor-pointer border border-transparent relative group
                ${isActive
                  ? 'bg-bg-card-hover text-text-heading'
                  : 'text-text-muted hover:bg-bg-card-hover hover:text-text-heading'
                }`}
              title={isCollapsed ? item.name : undefined}
            >
              <item.icon size={20} className={`${isActive ? 'text-brand-primary' : 'text-text-muted group-hover:text-text-heading'} flex-shrink-0 transition-colors`} />

              {!isCollapsed && (
                <span className="whitespace-nowrap flex-grow text-sm tracking-tight">{item.name}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Profile / Settings */}
      <div className="p-4 border-t border-border-subtle bg-bg-sidebar shrink-0">
        {!isCollapsed ? (
          <div className="flex items-center space-x-4 px-4 py-4 mb-4 rounded-2xl bg-bg-surface/50 border border-border-subtle cursor-pointer hover:bg-bg-card-hover transition-colors">
            <div className="w-11 h-11 rounded-2xl bg-brand-primary flex items-center justify-center text-text-heading font-black shadow-lg flex-shrink-0">
              <span>{user?.name?.charAt(0).toUpperCase() || 'U'}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-text-heading truncate leading-tight">{user?.name || 'User'}</p>
              <p className="text-[11px] text-text-muted truncate mt-0.5">Workspace Member</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center mb-6">
            <div className="w-11 h-11 rounded-2xl bg-brand-primary flex items-center justify-center text-text-heading font-black shadow-lg cursor-pointer" title={user?.name || 'Profile'}>
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>
        )}

        <div className="space-y-1">
          <button
            onClick={logout}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center p-3' : 'space-x-4 px-4 py-3'} rounded-xl hover:bg-red-500/10 hover:text-red-400 text-text-muted font-bold transition-colors cursor-pointer flex-shrink-0 border-0 bg-transparent`}
            title={isCollapsed ? 'Logout' : undefined}
          >
            <LogOut size={18} />
            {!isCollapsed && <span className="text-sm">Log out</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}
