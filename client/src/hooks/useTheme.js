import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContextModel';

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

