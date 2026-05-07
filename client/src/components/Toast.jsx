import { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, X, Info } from 'lucide-react';

/**
 * Toast: Minimalist notification component for the SyncVerse platform.
 */
export default function Toast({ message, type = 'success', onClose, duration = 3000 }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for fade-out animation
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle2 size={18} className="text-green-500" />,
    error: <AlertCircle size={18} className="text-red-500" />,
    info: <Info size={18} className="text-blue-500" />
  };

  const bgColors = {
    success: 'bg-green-50 border-green-100 dark:bg-green-900/10 dark:border-green-900/20',
    error: 'bg-red-50 border-red-100 dark:bg-red-900/10 dark:border-red-900/20',
    info: 'bg-blue-50 border-blue-100 dark:bg-blue-900/10 dark:border-blue-900/20'
  };

  return (
    <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999] flex items-center px-6 py-4 rounded-2xl border shadow-2xl transition-all duration-300 ${bgColors[type]} ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
      <div className="mr-3">{icons[type]}</div>
      <p className="text-sm font-black text-gray-800 dark:text-gray-100 uppercase tracking-widest leading-none mt-0.5">{message}</p>
      <button onClick={() => setIsVisible(false)} className="ml-6 text-gray-400 hover:text-gray-600 transition-colors border-0 bg-transparent cursor-pointer">
        <X size={16} />
      </button>
    </div>
  );
}
