import { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, Users, History, X, Send, 
  MoreVertical, ThumbsUp, Reply, Trash2, 
  Clock, Hash, Sparkles, Zap, ShieldCheck
} from 'lucide-react';

/**
 * SidePanel V5: Premium SaaS collaboration sidebar.
 */
export default function SidePanel({ 
  isOpen, 
  onClose, 
  activeTab = 'chat', 
  onTabChange,
  collaborators = [],
  currentUser = {},
  messages = [],
  onSendMessage,
}) {
  const [msgInput, setMsgInput] = useState('');
  const scrollRef = useRef(null);
  const [renderTimestamp] = useState(() => Date.now());

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const tabs = [
    { id: 'chat', label: 'Chat', icon: <MessageSquare size={16} /> },
    { id: 'activity', label: 'Presence', icon: <Users size={16} /> },
    { id: 'security', label: 'Vault', icon: <ShieldCheck size={16} /> },
  ];

  return (
    <div className="w-80 h-full bg-white/95 backdrop-blur-3xl border-l border-slate-200 flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.1)] z-[1000] no-print animate-in slide-in-from-right duration-500 ease-out">
      {/* Header */}
      <div className="p-6 border-b border-slate-50 flex items-center justify-between">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-sm font-black text-slate-800 uppercase tracking-widest">Workspace</span>
            <div className="px-1.5 py-0.5 rounded-lg bg-blue-500/10 text-blue-500 text-[8px] font-black uppercase tracking-widest overflow-hidden">
               <div className="animate-pulse flex items-center gap-1">
                  <div className="w-1 h-1 bg-blue-500 rounded-full" />
                  Live Sync
               </div>
            </div>
          </div>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Collaborative Session v5.0</span>
        </div>
        <button 
          onClick={onClose}
          className="p-2.5 hover:bg-slate-100 rounded-2xl text-slate-400 transition-all border-0 bg-transparent cursor-pointer group"
        >
          <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
        </button>
      </div>

      {/* Modern Tab Pill Switcher */}
      <div className="px-6 mt-6">
        <div className="flex p-1.5 bg-slate-100/50 rounded-2xl gap-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => onTabChange && onTabChange(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[10px] font-black uppercase transition-all duration-300 border-0 cursor-pointer ${
                activeTab === tab.id 
                  ? 'bg-white text-blue-600 shadow-xl shadow-slate-200' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar" ref={scrollRef}>
        {activeTab === 'chat' && (
          <div className="space-y-6">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[300px] text-center space-y-6 opacity-30 select-none animate-pulse">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center">
                  <MessageSquare size={36} className="text-slate-400" />
                </div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-loose">Quiet in here.<br/>Break the ice!</p>
              </div>
            ) : (
              messages.map((m, i) => (
                <div key={i} className={`flex flex-col ${m.userId === currentUser?.id ? 'items-end' : 'items-start'} group/msg animate-slide-up`}>
                  <div className="flex items-center gap-2 mb-1 px-1">
                     <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                        {m.userName} {m.userId === currentUser?.id && ' (You)'}
                     </span>
                  </div>
                  <div className={`max-w-[100%] p-3 px-4 rounded-3xl text-[12px] font-medium shadow-sm transition-all duration-300 hover:shadow-md ${
                    m.userId === currentUser?.id 
                      ? 'bg-blue-600 text-text-heading rounded-tr-none' 
                      : 'bg-slate-50 text-slate-800 rounded-tl-none border border-slate-100'
                  }`}>
                    {m.message || m.text}
                  </div>
                  <span className="text-[8px] text-slate-300 mt-1 uppercase font-black tracking-widest px-1 opacity-0 group-hover/msg:opacity-100 transition-opacity">
                     {new Date(m.timestamp || renderTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="space-y-8">
            <div className="space-y-4">
               <div className="flex items-center justify-between px-1">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Presence</h3>
                  <Zap size={12} className="text-amber-500 animate-bounce" />
               </div>
               <div className="space-y-3">
                 {collaborators.map(c => (
                   <div key={c.id} className="flex items-center justify-between px-4 py-3 bg-slate-50/50 hover:bg-slate-100 rounded-2xl border border-transparent hover:border-slate-200 transition-all cursor-pointer group">
                     <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-black text-text-heading shadow-lg group-hover:scale-110 transition-transform rotate-3 group-hover:-rotate-3" style={{ background: `linear-gradient(135deg, ${c.color || '#3B82F6'} 0%, #1E40AF 100%)` }}>
                            {c.name.charAt(0)}
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-sm">
                             <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-slate-800">{c.name}</span>
                          <span className="text-[9px] text-slate-400 font-black uppercase tracking-tighter">{c.id === currentUser?.id ? 'System User' : 'Contributor'}</span>
                        </div>
                     </div>
                     <MoreVertical size={14} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                   </div>
                 ))}
               </div>
            </div>

            <div className="pt-6 border-t border-slate-50 space-y-4">
               <div className="flex items-center justify-between px-1">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Security Log</h3>
                  <Clock size={12} className="text-blue-500" />
               </div>
               <div className="space-y-5 px-1">
                  {[
                    { u: 'System', t: 'Just now', m: 'Auto-save cluster sync complete' },
                    { u: 'Global', t: '5m ago', m: 'Room joined by encrypted socket' }
                  ].map((e, i) => (
                    <div key={i} className="flex gap-4 group cursor-help">
                       <div className="w-1 bg-slate-100 rounded-full group-hover:bg-blue-500 transition-colors" />
                       <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                             <span className="text-[10px] font-black text-slate-700 uppercase tracking-tighter">{e.u}</span>
                             <span className="text-[8px] font-black text-slate-300 uppercase">{e.t}</span>
                          </div>
                          <p className="text-[10px] font-medium text-slate-400 italic truncate tracking-tight">{e.m}</p>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Chat Input - Floating Island style */}
      {activeTab === 'chat' && (
        <div className="p-6 bg-white/50 backdrop-blur-md">
          <form 
            className="flex items-center gap-2 bg-white p-2 rounded-[24px] shadow-2xl shadow-slate-200 border border-slate-100 focus-within:border-blue-300 transition-all group"
            onSubmit={(e) => {
              e.preventDefault();
              if (msgInput.trim()) {
                onSendMessage(msgInput);
                setMsgInput('');
              }
            }}
          >
            <div className="p-2 bg-slate-50 rounded-full text-slate-400 group-focus-within:text-blue-500 transition-colors">
               <Zap size={16} />
            </div>
            <input 
              className="flex-1 bg-transparent border-0 text-xs font-bold focus:outline-none px-2 text-slate-800 placeholder:text-slate-300"
              placeholder="Beam a message..."
              value={msgInput}
              onChange={(e) => setMsgInput(e.target.value)}
            />
            <button className="w-10 h-10 transition-all hover:scale-110 active:scale-95 bg-blue-600 text-text-heading rounded-full shadow-lg shadow-blue-200 border-0 flex items-center justify-center cursor-pointer">
              <Send size={18} strokeWidth={2.5} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
