import { useEffect } from 'react';
import { Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDocuments } from '../hooks/useDocuments';
import DocumentRow from '../components/DocumentRow';

export default function FavoritesPage() {
  const { favorites, loading, fetchFavorites } = useDocuments();
  const navigate = useNavigate();

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const sortedFavorites = [...favorites].sort((a, b) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  return (
    <div className="flex-1 w-full flex flex-col min-w-0 relative">
      <div className="flex items-center space-x-4 mb-10">
         <div className="bg-bg-card-hover text-amber-400 p-3 rounded-xl border border-border-subtle">
           <Star size={24} fill="currentColor" strokeWidth={1.5} />
         </div>
         <div>
           <h2 className="text-2xl font-bold text-text-heading tracking-tight">Starred Documents</h2>
           <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest leading-none mt-2">
             Quick Access Library
           </p>
         </div>
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-16 bg-bg-surface rounded-xl border border-border-subtle"></div>
          ))}
        </div>
      ) : sortedFavorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 bg-bg-surface border border-border-subtle rounded-xl p-10 mt-4 group">
          <div className="w-16 h-16 bg-bg-canvas rounded-xl flex items-center justify-center border border-border-subtle mb-6 group-hover:border-amber-400/50 transition-colors">
            <Star size={32} className="text-amber-400/50" strokeWidth={2} />
          </div>
          <h3 className="text-xl font-bold text-text-heading mb-2 tracking-tight">No favorites yet</h3>
          <p className="text-text-muted text-center max-w-xs font-medium leading-relaxed">Star your most important documents to find them here instantly.</p>
        </div>
      ) : (
        <div className="bg-bg-surface border border-border-subtle rounded-xl overflow-hidden shadow-2xl">
          <table className="min-w-full divide-y divide-border-subtle/50">
            <thead className="bg-bg-sidebar border-b border-border-subtle">
              <tr>
                <th scope="col" className="w-12 pl-6 py-4"></th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-text-muted uppercase tracking-widest pl-4">Document</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-text-muted uppercase tracking-widest hidden lg:table-cell">Owner</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-text-muted uppercase tracking-widest hidden md:table-cell">Last Updated</th>
                <th className="px-6 py-4 text-right pr-12 text-[10px] font-bold text-text-muted uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle/30">
              {sortedFavorites.map(doc => (
                <DocumentRow 
                  key={doc._id} 
                  doc={doc} 
                  onOpen={() => navigate(`/document/${doc._id}`)}
                  onDelete={() => {}}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
