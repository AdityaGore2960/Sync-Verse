import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MyDocuments from './pages/MyDocuments';
import Editor from './pages/Editor';
import Sidebar from './components/Sidebar';
import DashboardLayout from './components/DashboardLayout';
import SharedDocuments from './pages/SharedDocuments';
import FavoritesPage from './pages/FavoritesPage';

// Protected route guard
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-bg-canvas">
      <div className="w-10 h-10 border-4 border-gray-200 border-t-brand-primary rounded-full animate-spin" />
    </div>
  );
  return user ? children : <Navigate to="/login" />;
};

function App() {
  const location = useLocation();
  const isEditor = location.pathname.startsWith('/document/');

  if (isEditor) {
    return (
      <Routes>
        <Route path="/document/:id" element={
          <PrivateRoute><Editor /></PrivateRoute>
        } />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen bg-bg-canvas flex flex-col text-text-body font-sans overflow-hidden">
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/dashboard" element={
          <PrivateRoute>
            <DashboardLayout><Dashboard /></DashboardLayout>
          </PrivateRoute>
        } />
        
        <Route path="/my-documents" element={
          <PrivateRoute>
            <DashboardLayout><MyDocuments /></DashboardLayout>
          </PrivateRoute>
        } />

        <Route path="/shared-documents" element={
          <PrivateRoute>
            <DashboardLayout><SharedDocuments /></DashboardLayout>
          </PrivateRoute>
        } />

        <Route path="/favorites" element={
          <PrivateRoute>
            <DashboardLayout><FavoritesPage /></DashboardLayout>
          </PrivateRoute>
        } />

        <Route path="*" element={
          <div className="flex flex-col items-center justify-center flex-grow py-20 text-center">
            <h2 className="text-4xl font-black text-text-heading mb-4 px-6">404 — Page Not Found</h2>
            <p className="text-text-muted mb-8 font-medium">It seems you've wandered off the grid. Let's get you back.</p>
            <button onClick={() => window.history.back()} className="px-6 py-3 bg-brand-primary text-text-heading rounded-xl font-bold cursor-pointer border-0">Go Back</button>
          </div>
        } />
      </Routes>
    </div>
  );
}

export default App;
