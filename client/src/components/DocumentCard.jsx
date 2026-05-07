import { FileText, Globe, Users, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import StarButton from './StarButton';

export default function DocumentCard({ doc, onDelete, variant = 'grid' }) {
  // Format the date nicely
  const dateStr = new Date(doc.updatedAt).toLocaleDateString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric'
  });

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(doc);
  };

  if (variant === 'sidebar') {
    return (
      <div className="group relative mb-2">
        <Link
          to={`/document/${doc._id}`}
          className="flex items-center gap-3 p-3 bg-bg-sidebar border border-border-subtle hover:bg-bg-card-hover hover:border-brand-primary/40 rounded-xl cursor-pointer transition-all duration-200 relative overflow-hidden no-underline outline-none"
        >
          <div className="w-8 h-8 bg-bg-canvas border border-border-subtle rounded-lg flex items-center justify-center group-hover:bg-brand-primary/20 transition-colors shrink-0">
            <FileText size={16} className="text-text-muted group-hover:text-brand-primary transition-colors" />
          </div>
          <div className="flex-1 min-w-0">
            <h6 className="text-[12px] font-bold text-text-body truncate group-hover:text-text-heading transition-colors leading-tight">
              {doc.title || 'Untitled'}
            </h6>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[9px] font-bold text-text-muted uppercase tracking-tighter">{dateStr}</span>
            </div>
          </div>
        </Link>

        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleDelete(e);
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-text-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all border-0 bg-transparent cursor-pointer z-20"
        >
          <Trash2 size={14} />
        </button>
      </div>
    );
  }

  return (
    <div className="group relative h-64">
      {/* The main card link */}
      <Link
        to={`/document/${doc._id}`}
        className="h-full bg-bg-surface border border-border-subtle p-6 rounded-xl hover:bg-bg-card-hover hover:border-brand-primary/30 hover:scale-[1.02] transition-all duration-200 cursor-pointer flex flex-col relative overflow-hidden no-underline"
      >
        {/* Top Icon */}
        <div className="flex items-start mb-6 relative z-10">
          <div className="w-12 h-12 bg-bg-canvas rounded-xl flex items-center justify-center text-brand-primary group-hover:bg-brand-primary group-hover:text-text-heading transition-all duration-300 shadow-sm">
            <FileText size={24} strokeWidth={1.5} />
          </div>
        </div>

        {/* Body: Title & Meta */}
        <h5 className="font-bold text-text-heading truncate text-lg mt-2 mb-1 group-hover:text-brand-primary transition-colors relative z-10">
          {doc.title || 'Untitled Document'}
        </h5>
        <p className="text-text-muted text-[12px] line-clamp-2 font-medium relative z-10">
          Opened recently • {dateStr}
        </p>

        {/* Footer: Avatars & Action */}
        <div className="mt-auto pt-4 border-t border-border-subtle flex justify-between items-center relative z-10 w-full">
          <div className="flex items-center -space-x-2 transition-all duration-300">
            {/* Owner Avatar */}
            <div
              className="w-7 h-7 rounded-full border-2 border-bg-surface bg-brand-primary flex items-center justify-center text-[10px] font-bold text-text-heading shadow-sm relative z-20"
              title={`Owner: ${doc.owner?.name || 'Unknown'}`}
            >
              {doc.owner?.name ? doc.owner.name.charAt(0).toUpperCase() : '?'}
            </div>
          </div>

          <span className="text-[10px] font-bold px-3 py-1.5 bg-bg-canvas border border-border-subtle rounded-lg text-text-muted group-hover:text-brand-primary group-hover:border-brand-primary/20 transition-all shadow-sm shrink-0">
            Open Doc
          </span>
        </div>
      </Link>

      {/* Floating Action Menu */}
      <div className="absolute top-6 right-6 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50">
        <StarButton doc={doc} />
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleDelete(e);
          }}
          className="p-1.5 text-text-muted hover:text-red-400 transition-all border-0 bg-transparent cursor-pointer active:scale-90"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
