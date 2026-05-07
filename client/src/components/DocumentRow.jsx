import { FileText, MoreHorizontal, Trash2, Edit2, ExternalLink, Globe, Lock } from 'lucide-react';
import { formatDate, getRelativeTime } from '../utils/dateFormatter';
import StarButton from './StarButton';

/**
 * DocumentRow: Single entry in the document list table.
 */
export default function DocumentRow({ doc, onOpen, onDelete, role }) {
  const isPublic = doc.isPublic;

  // Helper to determine role badge styling
  const getRoleBadge = (r) => {
    switch (r?.toLowerCase()) {
      case 'owner':  return 'bg-brand-primary/10 text-brand-primary border-brand-primary/20';
      case 'editor': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'viewer': return 'bg-text-muted/10 text-text-muted border-text-muted/20';
      default:       return 'bg-text-muted/10 text-text-muted border-transparent';
    }
  };
  
  return (
    <tr className="group hover:bg-bg-card-hover transition-colors cursor-pointer border-b border-border-subtle/50 last:border-0" onClick={() => onOpen(doc._id)}>
      {/* Star Column */}
      <td className="w-12 pl-6 py-4 whitespace-nowrap">
        <StarButton doc={doc} size={16} className="!p-0" />
      </td>
      {/* Name Column */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-bg-canvas border border-border-subtle rounded-xl flex items-center justify-center group-hover:border-brand-primary/50 transition-colors">
            <FileText size={18} className="text-text-muted group-hover:text-brand-primary transition-colors" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-text-heading group-hover:text-brand-primary transition-colors">
                {doc.title || 'Untitled Document'}
              </span>
              {role && (
                <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-tighter border ${getRoleBadge(role)}`}>
                  {role}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5 md:hidden">
               <span className="text-[10px] text-text-muted">{getRelativeTime(doc.updatedAt)}</span>
            </div>
          </div>
        </div>
      </td>

      {/* Status Column */}
      <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${isPublic ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
          {isPublic ? <Globe size={11} /> : <Lock size={11} />}
          {isPublic ? 'Public' : 'Private'}
        </div>
      </td>

      {/* Owner Column */}
      <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-brand-primary/20 flex items-center justify-center text-[10px] font-bold text-brand-primary">
            {doc.owner?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <span className="text-[12px] text-text-muted font-medium">{doc.owner?.name || 'Me'}</span>
        </div>
      </td>

      {/* Dates Columns */}
      <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
        <span className="text-[12px] text-text-muted font-medium">{formatDate(doc.updatedAt)}</span>
      </td>
      
      <td className="px-6 py-4 whitespace-nowrap hidden xl:table-cell">
        <span className="text-[12px] text-text-muted font-medium">{formatDate(doc.createdAt)}</span>
      </td>

      <td className="px-6 py-4 whitespace-nowrap text-right">
        <div className="inline-flex items-center gap-1">
          <button 
            onClick={(e) => { e.stopPropagation(); onOpen(doc._id); }}
            className="p-2 text-text-muted hover:text-text-heading hover:bg-bg-canvas rounded-lg transition-all border-0 bg-transparent cursor-pointer"
            title="Open"
          >
            <ExternalLink size={16} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(doc); }}
            className="p-2 text-text-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all border-0 bg-transparent cursor-pointer"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
}
