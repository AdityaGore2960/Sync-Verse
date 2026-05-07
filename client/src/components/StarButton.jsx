import { Star } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useDocuments } from '../hooks/useDocuments';

/**
 * StarButton: Interactive button to toggle document favorite status.
 */
export default function StarButton({ doc, size = 18, className = "" }) {
  const { user: _user } = useAuth();
  const { toggleFavorite, favorites } = useDocuments();
  
  const isStarred = favorites.some(f => f._id === doc._id);

  const handleToggle = (e) => {
    e.stopPropagation();
    e.preventDefault();
    toggleFavorite(doc._id);
  };

  return (
    <button 
      onClick={handleToggle}
      className={`p-2 rounded-xl transition-all active:scale-75 border-0 bg-transparent flex items-center justify-center cursor-pointer group/star ${className} ${isStarred ? 'text-amber-400' : 'text-gray-400 hover:text-gray-300'}`}
      title={isStarred ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Star 
        size={size} 
        fill={isStarred ? "currentColor" : "transparent"} 
        className={`${isStarred ? 'drop-shadow-[0_0_5px_rgba(251,191,36,0.4)]' : 'group-hover/star:scale-110'} transition-all`}
      />
    </button>
  );
}
