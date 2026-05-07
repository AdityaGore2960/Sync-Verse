import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { validateTokenAndFetchUser } from '../utils/authUtils.js';
import { AuthContext } from './AuthContextModel.js';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    validateTokenAndFetchUser().then((validatedUser) => {
      if (validatedUser) {
        setUser(validatedUser);
      }
      setLoading(false);
    });

    // Listen for unauthorized events fired via axios interceptor
    const handleUnauthorized = () => {
      setUser(null);
      navigate('/login');
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [navigate]);

  const login = (userData, token) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
    setUser(userData);
    navigate('/dashboard');
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
