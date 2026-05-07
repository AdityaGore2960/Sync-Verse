import { Search, Plus, Sparkles, Command, Loader2, FileText, Tag, User as UserIcon, X, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDocuments } from '../hooks/useDocuments';
import CreateDocModal from './CreateDocModal';
import api from '../services/api';
import { useState, useEffect, useRef } from 'react';

/**
 * Topbar: Consistent navigation bar for all project library pages.
 */
export default function Topbar() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const { createDocument } = useDocuments();
  const navigate = useNavigate();
  const searchRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced Search
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length > 1) {
        setIsLoading(true);
        try {
          const { data } = await api.get(`/documents/search?q=${searchQuery}`);
          setResults(data.documents || []);
          setShowDropdown(true);
        } catch (err) {
          console.error("Search error:", err);
          setResults([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setResults([]);
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      handleResultClick(results[selectedIndex]._id);
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  const handleResultClick = (id) => {
    navigate(`/document/${id}`);
    setShowDropdown(false);
    setSearchQuery('');
    setIsMobileSearchOpen(false);
  };

  const handleCreateDocument = async (formData) => {
    setIsSubmitting(true);
    try {
      const doc = await createDocument(formData);
      if (doc) {
        setIsModalOpen(false);
        navigate(`/document/${doc._id}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const Highlight = ({ text, highlight }) => {
    if (!highlight.trim()) return <span>{text}</span>;
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === highlight.toLowerCase() ? (
            <mark key={i} className="bg-brand-primary/20 text-brand-primary rounded-sm px-0.5 font-bold">{part}</mark>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  return (
    <header className="h-20 bg-bg-canvas border-b border-border-subtle flex items-center justify-between px-4 sm:px-8 shrink-0 z-40 sticky top-0 backdrop-blur-md">

      {/* Mobile Search Toggle */}
      <div className="flex sm:hidden">
        {!isMobileSearchOpen && (
          <button
            onClick={() => setIsMobileSearchOpen(true)}
            className="p-2 text-text-muted hover:text-brand-primary transition-colors bg-bg-surface rounded-full border-0 cursor-pointer"
          >
            <Search size={20} />
          </button>
        )}
      </div>

      {/* Search Interface */}
      <div
        ref={searchRef}
        className={`fixed inset-0 z-50 bg-bg-canvas p-4 sm:relative sm:inset-auto sm:p-0 sm:flex-1 sm:max-w-2xl sm:block transition-all duration-300 ${isMobileSearchOpen ? 'translate-x-0 opacity-100' : 'max-sm:translate-x-full max-sm:opacity-0 pointer-events-none sm:pointer-events-auto'}`}
      >
        <div className="flex items-center space-x-2 sm:hidden mb-6">
          <button onClick={() => setIsMobileSearchOpen(false)} className="p-2 bg-transparent border-0 text-text-muted cursor-pointer">
            <X size={24} />
          </button>
          <span className="text-lg font-bold text-text-heading">Search</span>
        </div>

        <div className="relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center space-x-2 text-text-muted group-focus-within:text-brand-primary transition-colors pointer-events-none">
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} strokeWidth={2.5} />}
          </div>
          <input
            type="text"
            placeholder="Search documents..."
            className="w-full bg-bg-surface border border-border-subtle rounded-xl py-2.5 pl-12 pr-16 text-sm font-medium text-text-body placeholder:text-text-muted focus:border-brand-primary/50 transition-all outline-none"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSelectedIndex(-1);
            }}
            onFocus={() => searchQuery.trim().length > 1 && setShowDropdown(true)}
            onKeyDown={handleKeyDown}
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden sm:flex items-center space-x-1 px-2 py-1 bg-bg-canvas border border-border-subtle rounded-lg pointer-events-none">
            <Command size={10} className="text-text-muted" />
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-tighter">K</span>
          </div>

          {/* Results Dropdown */}
          {showDropdown && (
            <div className="absolute top-full left-0 right-0 mt-3 bg-bg-surface border border-border-subtle rounded-xl shadow-2xl overflow-hidden z-50 animate-pop-in max-h-[70vh] overflow-y-auto">
              {results.length > 0 ? (
                <div className="p-2">
                  <div className="px-4 py-2 text-[10px] font-black text-text-muted uppercase tracking-widest border-b border-border-subtle mb-2">
                    Documents Found
                  </div>
                  {results.map((doc, idx) => (
                    <div
                      key={doc._id}
                      onClick={() => handleResultClick(doc._id)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${selectedIndex === idx ? 'bg-bg-card-hover border-border-subtle' : 'hover:bg-bg-card-hover'}`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-lg ${selectedIndex === idx ? 'bg-brand-primary text-text-heading' : 'bg-bg-canvas text-text-muted'}`}>
                          <FileText size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-text-body">
                            <Highlight text={doc.title} highlight={searchQuery} />
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <div className="flex items-center space-x-1 text-[10px] text-text-muted">
                              <UserIcon size={10} />
                              <span>{doc.owner?.name || 'Unknown'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <ArrowRight size={14} className={`transition-all text-brand-primary ${selectedIndex === idx ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-bg-canvas rounded-full flex items-center justify-center mx-auto mb-4 border border-border-subtle">
                    <Search size={24} className="text-text-muted" />
                  </div>
                  <h3 className="text-sm font-bold text-text-heading mb-1">No results found</h3>
                  <p className="text-xs text-text-muted">We couldn't find any documents matching "{searchQuery}"</p>
                </div>
              )}

              <div className="bg-bg-canvas/50 px-4 py-3 flex items-center justify-between border-t border-border-subtle">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <kbd className="px-1.5 py-0.5 rounded border border-border-subtle text-[10px] font-bold bg-bg-surface text-text-muted">↑↓</kbd>
                    <span className="text-[10px] text-text-muted font-bold">Navigate</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <kbd className="px-1.5 py-0.5 rounded border border-border-subtle text-[10px] font-bold bg-bg-surface text-text-muted">Enter</kbd>
                    <span className="text-[10px] text-text-muted font-bold">Open</span>
                  </div>
                </div>
                <span className="text-[10px] text-brand-primary font-black uppercase tracking-tighter">SyncVerse Search</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Global Actions */}
      <div className={`items-center space-x-6 pl-8 ${isMobileSearchOpen ? 'hidden sm:flex' : 'flex'}`}>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-brand-primary hover:bg-brand-hover text-text-heading px-5 py-2.5 rounded-lg font-bold text-sm shadow-lg shadow-brand-primary/10 flex items-center space-x-2 border-0 cursor-pointer active:scale-95 transition-all"
        >
          <Plus size={18} strokeWidth={3} />
          <span>New Document</span>
        </button>
      </div>

      {/* Create Modal Injection */}
      {isModalOpen && (
        <CreateDocModal
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreateDocument}
          isSubmitting={isSubmitting}
        />
      )}
    </header>
  );
}
