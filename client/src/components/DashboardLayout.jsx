import Sidebar from './Sidebar';
import Topbar from './Topbar';

/**
 * DashboardLayout: Global structural layout for all project library pages.
 * Includes Sidebar, Topbar, and Scrollable Content Area.
 */
export default function DashboardLayout({ children }) {
  return (
    <div className="flex h-screen bg-bg-canvas overflow-hidden font-sans">
      {/* Persistent Sidebar */}
      <Sidebar />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Persistent Topbar (Global Search + Actions) */}
        <Topbar />

        {/* Dynamic Page Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden bg-bg-canvas px-4 sm:px-8 py-8 scroll-smooth scrollbar-hide">
          <div className="max-w-7xl mx-auto w-full relative z-10 transition-all duration-500 animate-in fade-in slide-in-from-bottom-4">
            {children}
          </div>
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
