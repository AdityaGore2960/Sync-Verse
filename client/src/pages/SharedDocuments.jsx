import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Share2, Shield, Info, ArrowRightLeft } from 'lucide-react';
import { useDocuments } from '../hooks/useDocuments';
import { useAuth } from '../hooks/useAuth';
import DocumentRow from '../components/DocumentRow';

export default function SharedDocuments() {
  const { sharedWithMe, sharedByMe, loading, fetchSharedWithMe, fetchSharedByMe } = useDocuments();
  const [activeTab, setActiveTab] = useState('withMe'); // 'withMe' or 'byMe'
  const { user } = useAuth();
  const navigate = useNavigate();

  // Polling / Refetching strategy
  useEffect(() => {
    fetchSharedWithMe();
    fetchSharedByMe();
  }, [fetchSharedWithMe, fetchSharedByMe]);

  return (
    <div className="flex-1 w-full flex flex-col min-w-0 relative">
      {/* Page Title & Tab Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
        <div className="flex items-center space-x-4">
          <div className="bg-bg-card-hover text-brand-primary p-3 rounded-xl border border-border-subtle">
            <Users size={24} className="stroke-2" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-text-heading tracking-tight">Collaboration Hub</h2>
            <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest leading-none mt-2 flex items-center gap-1.5">
              <Shield size={10} className="text-brand-primary" />
              Shared Documents
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 bg-bg-card-hover p-1 rounded-xl w-fit border border-border-subtle shadow-inner">
          <button
            onClick={() => setActiveTab('withMe')}
            className={`px-6 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer border-0 ${activeTab === 'withMe' ? 'bg-bg-surface text-brand-primary shadow-xl' : 'text-text-muted hover:text-text-heading bg-transparent'}`}
          >
            Shared with me
          </button>
          <button
            onClick={() => setActiveTab('byMe')}
            className={`px-6 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer border-0 ${activeTab === 'byMe' ? 'bg-bg-surface text-brand-primary shadow-xl' : 'text-text-muted hover:text-text-heading bg-transparent'}`}
          >
            Shared by me
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1">
        {loading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-16 bg-bg-surface rounded-xl border border-border-subtle"></div>
            ))}
          </div>
        ) : activeTab === 'withMe' ? (
          sharedWithMe.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 bg-bg-surface border border-border-subtle rounded-xl p-10 group">
              <div className="w-16 h-16 bg-bg-canvas rounded-xl flex items-center justify-center border border-border-subtle mb-6 group-hover:border-brand-primary/50 transition-colors">
                <Share2 size={32} className="text-brand-primary" />
              </div>
              <h3 className="text-xl font-bold text-text-heading mb-2 tracking-tight">Nothing shared with you</h3>
              <p className="text-text-muted text-center max-w-xs font-medium text-sm">Collaborative documents shared by your teammates will appear here.</p>
            </div>
          ) : (
            <div className="bg-bg-surface border border-border-subtle rounded-xl overflow-hidden shadow-2xl">
              <table className="min-w-full divide-y divide-border-subtle/50">
                <thead className="bg-bg-sidebar border-b border-border-subtle">
                  <tr>
                    <th scope="col" className="w-12 pl-6 py-4"></th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-text-muted uppercase tracking-widest pl-4">Document</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-text-muted uppercase tracking-widest hidden lg:table-cell">Access Role</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-text-muted uppercase tracking-widest hidden md:table-cell">Shared By</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-text-muted uppercase tracking-widest hidden xl:table-cell">Last Active</th>
                    <th className="px-6 py-4 text-right pr-12 text-[10px] font-bold text-text-muted uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle/20">
                  {sharedWithMe.map(doc => {
                    const myCollab = doc.collaborators?.find(c => c.user?._id === user?.id || c.user === user?.id);
                    return (
                      <DocumentRow
                        key={doc._id}
                        doc={doc}
                        role={myCollab?.role}
                        onOpen={() => navigate(`/document/${doc._id}`)}
                        onDelete={() => { }}
                      />
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        ) : (
          sharedByMe.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 bg-bg-surface border border-border-subtle rounded-xl p-10">
              <div className="w-16 h-16 bg-bg-canvas rounded-xl flex items-center justify-center border border-border-subtle mb-6">
                <ArrowRightLeft size={32} className="text-brand-primary" />
              </div>
              <h3 className="text-xl font-bold text-text-heading mb-2 tracking-tight">You haven't shared anything</h3>
              <p className="text-text-muted text-center max-w-xs font-medium text-sm">Share your documents with others to start collaborating in real-time.</p>
            </div>
          ) : (
            <div className="bg-bg-surface border border-border-subtle rounded-xl overflow-hidden shadow-2xl">
              <table className="min-w-full divide-y divide-border-subtle/50">
                <thead className="bg-bg-sidebar border-b border-border-subtle">
                  <tr>
                    <th scope="col" className="w-12 pl-6 py-4"></th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-text-muted uppercase tracking-widest pl-4">Document</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-text-muted uppercase tracking-widest hidden lg:table-cell">Collaborators</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-text-muted uppercase tracking-widest hidden md:table-cell">Sharing Method</th>
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-text-muted uppercase tracking-widest hidden xl:table-cell">Last Updated</th>
                    <th className="px-6 py-4 text-right pr-12 text-[10px] font-bold text-text-muted uppercase tracking-widest">Manage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle/20">
                  {sharedByMe.map(doc => (
                    <DocumentRow
                      key={doc._id}
                      doc={doc}
                      role="Owner"
                      onOpen={() => navigate(`/document/${doc._id}`)}
                      onDelete={() => { }}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </div>
  );
}
