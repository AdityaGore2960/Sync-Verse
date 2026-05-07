import { useState } from 'react';
import { 
  X, Mail, Globe, Lock, Copy, 
  Check, Users, ShieldCheck, Zap, 
  ChevronRight, MoreVertical, Trash2
} from 'lucide-react';

/**
 * ShareModal V5: Strategic permission & link sharing dashboard.
 */
export default function ShareModal({ 
  isOpen, 
  onClose, 
  documentId, 
  currentCollaborators = []
}) {
  const [method, setMethod] = useState('link'); // 'email', 'link'
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState('');
  const shareUrl = `${window.location.origin}/document/${documentId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300" 
        onClick={onClose} 
      />
      
      <div className="relative w-full max-w-lg bg-white rounded-[40px] shadow-[0_40px_100px_rgba(0,0,0,0.2)] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-5 duration-500">
        {/* Top Header */}
        <div className="p-10 pb-4 flex items-center justify-between">
          <div className="flex flex-col gap-1">
             <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-600 rounded-2xl text-text-heading shadow-xl shadow-blue-200">
                   <Share2 size={24} strokeWidth={2.5} />
                </div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Access Hub</h2>
             </div>
             <p className="text-xs font-black text-slate-400 uppercase tracking-widest pl-1">Document permissions & distribution</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-3 hover:bg-slate-50 rounded-full text-slate-300 hover:text-slate-800 transition-all border-0 bg-transparent rotate-0 hover:rotate-90"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tab System */}
        <div className="px-10 mt-6 overflow-hidden">
           <div className="flex p-1.5 bg-slate-100/50 rounded-[30px] gap-2">
              {[
                { id: 'link', label: 'Magic Link', icon: <Globe size={18} /> },
                { id: 'email', label: 'Invite Contributor', icon: <Mail size={18} /> }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setMethod(t.id)}
                  className={`flex-1 flex items-center justify-center gap-3 py-3 rounded-[24px] text-xs font-black uppercase tracking-widest transition-all duration-500 border-0 cursor-pointer ${
                    method === t.id 
                      ? 'bg-white text-blue-600 shadow-xl shadow-slate-200 translate-y-0.5' 
                      : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'
                  }`}
                >
                  {t.icon}
                  {t.label}
                </button>
              ))}
           </div>
        </div>

        <div className="p-10 pt-8 space-y-10">
          {method === 'link' && (
            <div className="space-y-6 animate-in slide-in-from-left duration-500">
              <div className="flex flex-col gap-3">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Collaborative URL</label>
                 <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-[28px] border-2 border-transparent focus-within:border-blue-100 group transition-all">
                    <Globe size={20} className="text-slate-300 group-focus-within:text-blue-500 transition-colors ml-2" />
                    <input 
                      readOnly 
                      value={shareUrl} 
                      className="flex-1 bg-transparent border-0 text-sm font-bold text-slate-700 focus:outline-none px-2 truncate cursor-text"
                    />
                    <button 
                      onClick={handleCopy}
                      className={`px-6 py-2.5 rounded-[20px] text-[11px] font-black uppercase transition-all flex items-center gap-2 border-0 cursor-pointer ${
                        copied ? 'bg-green-500 text-text-heading shadow-lg' : 'bg-slate-900 text-text-heading hover:bg-blue-600'
                      }`}
                    >
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                      {copied ? 'Copied' : 'Action'}
                    </button>
                 </div>
              </div>

              <div className="p-6 bg-blue-50/50 rounded-[40px] border border-blue-100/50 flex gap-4 group">
                 <div className="w-12 h-12 bg-white rounded-3xl shadow-xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                    <ShieldCheck size={24} />
                 </div>
                 <div className="flex-1 flex flex-col justify-center gap-1">
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Visibility Rule</span>
                    <p className="text-xs font-bold text-slate-500 italic">Anyone with this link can view. Authenticated users can request edit access.</p>
                 </div>
              </div>
            </div>
          )}

          {method === 'email' && (
            <div className="space-y-6 animate-in slide-in-from-right duration-500">
              <div className="flex flex-col gap-3">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Contributor Identity</label>
                 <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-[28px] border-2 border-transparent focus-within:border-blue-100 group transition-all">
                    <Mail size={20} className="text-slate-300 group-focus-within:text-blue-500 transition-colors ml-2" />
                    <input 
                      type="email"
                      placeholder="Enter contributor email..."
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-1 bg-transparent border-0 text-sm font-bold text-slate-700 focus:outline-none px-2 cursor-text"
                    />
                    <button 
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-text-heading rounded-[20px] text-[11px] font-black uppercase shadow-xl shadow-blue-200 active:scale-95 transition-all border-0 cursor-pointer flex items-center gap-2"
                    >
                      <Zap size={14} strokeWidth={2.5} />
                      Invite
                    </button>
                 </div>
              </div>

              <div className="space-y-4">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Active Collaborators</label>
                 <div className="space-y-3">
                    {currentCollaborators.slice(0, 3).map((c, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-[24px] hover:bg-slate-100/50 transition-all group">
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-black text-text-heading shadow-lg group-hover:rotate-6 transition-transform" style={{background: c.color}}>
                               {c.name.charAt(0)}
                            </div>
                            <div className="flex flex-col">
                               <span className="text-sm font-black text-slate-800">{c.name}</span>
                               <span className="text-[10px] font-black text-slate-400 uppercase">{c.email}</span>
                            </div>
                         </div>
                         <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="p-2 border-2 border-slate-100 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-white transition-all cursor-pointer">
                               <MoreVertical size={16} />
                            </div>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Premium footer hint */}
        <div className="bg-slate-50 p-6 flex justify-center border-t border-slate-100">
           <div className="flex items-center gap-2 grayscale hover:grayscale-0 transition-all opacity-40 hover:opacity-100 cursor-help">
              <ShieldCheck size={14} className="text-blue-500" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Encrypted Sharing Protection</span>
           </div>
        </div>
      </div>
    </div>
  );
}

// Re-using same style naming but exported separately for clarity
const Share2 = ShieldCheck; // Fallback if missing
