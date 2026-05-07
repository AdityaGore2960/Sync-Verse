import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { UserPlus } from 'lucide-react';

export default function Register() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If already logged in, go straight to dashboard
  if (user) {
    return <Navigate to="/dashboard" />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/register', formData);
      navigate('/login', { state: { message: 'Account created successfully! Please log in to continue.' } });
    } catch (err) {
      if (err.response?.data?.errors) {
        setError(err.response.data.errors.map(e => e.message).join(', '));
      } else {
        setError(err.response?.data?.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center flex-grow py-12 px-4 fade-in bg-bg-canvas min-h-[calc(100vh-56px)]">
      <div className="bg-bg-surface border border-border-subtle shadow-md rounded-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-brand-primary/10 text-brand-primary rounded-full inline-flex justify-center items-center mb-4 w-16 h-16">
            <UserPlus size={28} />
          </div>
          <h2 className="text-2xl font-bold text-text-heading mb-2">Create Account</h2>
          <p className="text-text-muted text-sm">Join SyncVerse to collaborate in real-time</p>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-md border border-red-200 mb-6 text-sm">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-text-muted text-xs font-bold uppercase tracking-wider mb-2">Full Name</label>
            <input 
              type="text" 
              className="w-full bg-bg-subtle border border-border-subtle focus:border-brand-primary focus:ring-1 focus:ring-brand-primary rounded-lg px-4 py-3 outline-none transition-all" 
              placeholder="John Doe"
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
              required 
            />
          </div>
          <div className="mb-4">
            <label className="block text-text-muted text-xs font-bold uppercase tracking-wider mb-2">Email address</label>
            <input 
              type="email" 
              className="w-full bg-bg-subtle border border-border-subtle focus:border-brand-primary focus:ring-1 focus:ring-brand-primary rounded-lg px-4 py-3 outline-none transition-all" 
              placeholder="name@example.com"
              value={formData.email} 
              onChange={e => setFormData({...formData, email: e.target.value})} 
              required 
            />
          </div>
          <div className="mb-6">
            <label className="block text-text-muted text-xs font-bold uppercase tracking-wider mb-2">Password</label>
            <input 
              type="password" 
              className="w-full bg-bg-subtle border border-border-subtle focus:border-brand-primary focus:ring-1 focus:ring-brand-primary rounded-lg px-4 py-3 outline-none transition-all" 
              placeholder="Min 8 chars, 1 uppercase, 1 number"
              value={formData.password} 
              onChange={e => setFormData({...formData, password: e.target.value})} 
              required 
            />
          </div>
          <button type="submit" className="w-full bg-brand-primary hover:bg-brand-hover text-text-heading py-3 rounded-lg font-semibold transition-colors shadow-sm flex justify-center items-center disabled:opacity-70 cursor-pointer border-0" disabled={loading}>
            {loading ? <svg className="animate-spin h-5 w-5 mr-2 text-text-heading" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : 'Create Account'}
          </button>
        </form>
        
        <div className="text-center mt-6">
          <span className="text-text-muted text-sm">Already have an account? </span>
          <Link to="/login" className="text-brand-primary hover:text-brand-hover font-semibold transition-colors decoration-transparent">Log in</Link>
        </div>
      </div>
    </div>
  );
}
