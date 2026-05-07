import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LogOut, LayoutDashboard, FileText } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="h-14 bg-bg-surface border-b border-border-subtle flex items-center px-6 justify-between sticky top-0 z-50 shadow-sm">
      <Link className="flex items-center font-bold text-brand-primary decoration-transparent" to="/">
        <FileText className="mr-2" size={20} /> SyncVerse
      </Link>

      <div className="flex items-center">
        {user ? (
          <>
            <span className="text-text-muted text-sm mr-6 hidden sm:block">
              Welcome, <strong className="text-text-heading">{user.name}</strong>
            </span>
            <Link className="flex items-center text-text-body hover:text-brand-primary text-sm font-medium mr-4 transition-colors decoration-transparent" to="/dashboard">
              <LayoutDashboard size={16} className="mr-1" /> Dashboard
            </Link>
            <button 
              onClick={logout} 
              className="flex items-center text-text-muted hover:text-red-500 hover:bg-bg-subtle text-sm px-3 py-1.5 rounded-md transition-colors font-medium border-0 bg-transparent cursor-pointer"
            >
              <LogOut size={16} className="mr-1" /> Logout
            </button>
          </>
        ) : (
          <>
            <Link className="text-text-body hover:text-brand-primary text-sm font-medium mr-4 transition-colors decoration-transparent" to="/login">Login</Link>
            <Link className="bg-brand-primary hover:bg-brand-hover text-text-heading text-sm font-medium px-4 py-1.5 rounded-md transition-colors shadow-sm decoration-transparent" to="/register">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
}
