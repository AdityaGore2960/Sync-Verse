import { useEffect, useState } from 'react';
import { ThemeContext } from './ThemeContextModel.js';

export function ThemeProvider({ children }) {
  // Always default to dark
  const [theme] = useState('dark');

  useEffect(() => {
    // Force standard 'dark' class on HTML root for global CSS variables
    const root = window.document.documentElement;
    root.classList.add('dark');
    // Remove light class if it somehow exists
    root.classList.remove('light');
    
    // Cleanup any legacy theme from localStorage
    localStorage.removeItem('theme');
  }, []);

  return (
    <ThemeContext.Provider value={{ theme }}>
      {children}
    </ThemeContext.Provider>
  );
}
