import DocumentRow from './DocumentRow';

/**
 * DocumentList: Renders a list of documents in a table/list view.
 */
export default function DocumentList({ documents, onOpen, onDelete, onRename }) {
  if (!documents || documents.length === 0) return (
    <div className="flex flex-col items-center justify-center py-24 bg-bg-surface border border-border-subtle rounded-xl p-10">
      <div className="w-16 h-16 bg-bg-canvas rounded-xl flex items-center justify-center border border-border-subtle mb-6">
         <FileText size={32} className="text-brand-primary" />
      </div>
      <h3 className="text-xl font-bold text-text-heading mb-2">No documents found</h3>
      <p className="text-text-muted text-sm max-w-xs text-center">Your library is currently empty. Create a new document to get started.</p>
    </div>
  );

  return (
    <div className="bg-bg-surface border border-border-subtle rounded-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-500">
      <div className="overflow-x-auto overflow-y-visible">
        <table className="min-w-full divide-y divide-border-subtle/50">
          <thead className="bg-bg-sidebar border-b border-border-subtle">
            <tr>
              <th scope="col" className="w-12 pl-6 py-4"></th>
              <th scope="col" className="px-6 py-4 text-left text-[10px] font-bold text-text-muted uppercase tracking-widest">Name</th>
              <th scope="col" className="px-6 py-4 text-left text-[10px] font-bold text-text-muted uppercase tracking-widest hidden lg:table-cell">Status</th>
              <th scope="col" className="px-6 py-4 text-left text-[10px] font-bold text-text-muted uppercase tracking-widest hidden sm:table-cell">Owner</th>
              <th scope="col" className="px-6 py-4 text-left text-[10px] font-bold text-text-muted uppercase tracking-widest hidden md:table-cell">Last Modified</th>
              <th scope="col" className="px-6 py-4 text-left text-[10px] font-bold text-text-muted uppercase tracking-widest hidden xl:table-cell">Created At</th>
              <th scope="col" className="relative px-6 py-4 text-right pr-12"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle/30">
            {documents.map((doc) => (
              <DocumentRow 
                key={doc._id} 
                doc={doc} 
                onOpen={onOpen} 
                onDelete={onDelete} 
                onRename={onRename}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
