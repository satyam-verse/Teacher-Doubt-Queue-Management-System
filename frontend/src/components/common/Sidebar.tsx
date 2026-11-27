import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useSocket } from '../../context/SocketContext';
import type { Conversation } from '../../types';
import { 
  Sparkles, 
  Plus, 
  MessageSquare, 
  GraduationCap, 
  LayoutDashboard, 
  Sun, 
  Moon, 
  LogOut, 
  User as UserIcon, 
  Trash2, 
  Pencil,
  Check,
  ChevronLeft, 
  ChevronRight,
  Radio,
  Cpu,
  Pin,
  Search,
  ShieldCheck,
  Home
} from 'lucide-react';
import type { ViewMode } from '../../types';

export type ActiveView = ViewMode;

export interface AIStatusInfo {
  status: string;
  configured: boolean;
  model: string;
  message: string;
}

interface SidebarProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  conversations: Conversation[];
  activeConversationId: number | null;
  onSelectConversation: (id: number) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: number, e: React.MouseEvent) => void;
  onRenameConversation?: (id: number, newTitle: string) => Promise<void>;
  onPinConversation?: (id: number, e: React.MouseEvent) => Promise<void>;
  aiStatus?: AIStatusInfo | null;
  onOpenAuth: () => void;
  onOpenUpgrade?: () => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  setActiveView,
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onRenameConversation,
  onPinConversation,
  aiStatus,
  onOpenAuth,
  onOpenUpgrade,
  isCollapsed,
  setIsCollapsed,
}) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { isConnected } = useSocket();

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleStartRename = (conv: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditingTitle(conv.title);
  };

  const handleSaveRename = async (id: number, e?: React.MouseEvent | React.FormEvent) => {
    if (e) e.stopPropagation();
    if (editingTitle.trim() && onRenameConversation) {
      await onRenameConversation(id, editingTitle.trim());
    }
    setEditingId(null);
  };

  const filteredConversations = conversations.filter(c =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex flex-col border-r border-white/10 bg-navy-950/95 backdrop-blur-xl transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-72'
      }`}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-3.5 border-b border-white/10">
        <div
          className="flex items-center space-x-3 cursor-pointer overflow-hidden group"
          onClick={() => setActiveView('landing')}
        >
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-500 text-white shadow-glow-violet transition-transform group-hover:scale-105">
            <Sparkles className="h-4.5 w-4.5" />
          </div>
          {!isCollapsed && (
            <div className="truncate">
              <span className="text-base font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-300 bg-clip-text text-transparent">
                DoubtX AI
              </span>
              <p className="text-[10px] text-slate-400 font-mono">Neo Academic</p>
            </div>
          )}
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Primary Action: New Chat */}
      <div className="p-3">
        <button
          onClick={onNewConversation}
          className={`w-full flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl font-semibold text-xs text-white bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 shadow-glow-violet transition-all cursor-pointer ${
            isCollapsed ? 'px-0' : ''
          }`}
          title="Start New AI Chat"
        >
          <Plus className="h-4 w-4 flex-shrink-0" />
          {!isCollapsed && <span>New AI Discussion</span>}
        </button>
      </div>

      {/* Main Navigation Links */}
      <div className="px-2 space-y-1">
        <button
          onClick={() => setActiveView('landing')}
          className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeView === 'landing'
              ? 'bg-gradient-to-r from-violet-600 to-cyan-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
          }`}
          title="Overview & Landing"
        >
          <Home className="h-4 w-4 flex-shrink-0 text-cyan-400" />
          {!isCollapsed && <span>Overview</span>}
        </button>

        <button
          onClick={() => setActiveView('ai-solver')}
          className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeView === 'ai-solver'
              ? 'bg-gradient-to-r from-violet-600 to-cyan-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
          }`}
          title="Universal AI Workspace"
        >
          <Sparkles className="h-4 w-4 flex-shrink-0 text-violet-400" />
          {!isCollapsed && <span>AI Workspace</span>}
        </button>

        <button
          onClick={() => setActiveView('student-dashboard')}
          className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeView === 'student-dashboard'
              ? 'bg-gradient-to-r from-violet-600 to-cyan-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
          }`}
          title="Student Classroom Portal"
        >
          <GraduationCap className="h-4 w-4 flex-shrink-0 text-cyan-400" />
          {!isCollapsed && <span>Student Portal</span>}
        </button>

        <button
          onClick={() => setActiveView('teacher-console')}
          className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeView === 'teacher-console'
              ? 'bg-gradient-to-r from-violet-600 to-cyan-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
          }`}
          title="Teacher Live Queue"
        >
          <LayoutDashboard className="h-4 w-4 flex-shrink-0 text-indigo-400" />
          {!isCollapsed && <span>Teacher Queue</span>}
        </button>

        {user?.role === 'admin' && (
          <button
            onClick={() => setActiveView('admin-console')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeView === 'admin-console'
                ? 'bg-gradient-to-r from-violet-600 to-cyan-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
            }`}
            title="Institutional Admin Console"
          >
            <ShieldCheck className="h-4 w-4 flex-shrink-0 text-cyan-400" />
            {!isCollapsed && <span>Admin Console</span>}
          </button>
        )}
      </div>

      {/* Recent AI Discussions Section with Search */}
      {!isCollapsed && (
        <div className="flex-1 flex flex-col min-h-0 mt-3 px-3">
          
          {/* Search Bar */}
          <div className="relative mb-2">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-navy-900 border border-white/10 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          <div className="flex items-center justify-between pb-1 px-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              Discussions
            </span>
            <span className="text-[10px] font-mono text-cyan-400">
              {filteredConversations.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1 py-1 pr-1">
            {filteredConversations.length === 0 ? (
              <p className="text-[11px] text-slate-500 italic px-2 py-4 text-center">
                {searchQuery ? 'No matching discussions' : 'No discussions yet. Ask anything!'}
              </p>
            ) : (
              filteredConversations.map((conv) => {
                const isActive = activeConversationId === conv.id && activeView === 'ai-solver';
                const isEditing = editingId === conv.id;
                const isPinned = conv.is_pinned;

                return (
                  <div
                    key={conv.id}
                    onClick={() => {
                      if (!isEditing) {
                        onSelectConversation(conv.id);
                        setActiveView('ai-solver');
                      }
                    }}
                    className={`group flex items-center justify-between px-2.5 py-2 rounded-xl text-xs cursor-pointer transition-all ${
                      isActive
                        ? 'bg-navy-850 border border-cyan-500/40 text-white font-medium shadow-sm'
                        : 'text-slate-400 hover:bg-white/[0.04] hover:text-white'
                    }`}
                  >
                    {isEditing ? (
                      <div className="flex items-center space-x-1.5 flex-1 pr-1" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveRename(conv.id);
                            if (e.key === 'Escape') setEditingId(null);
                          }}
                          autoFocus
                          className="w-full bg-navy-900 border border-cyan-400 rounded px-1.5 py-0.5 text-xs text-white focus:outline-none"
                        />
                        <button
                          onClick={(e) => handleSaveRename(conv.id, e)}
                          className="p-1 text-emerald-400 hover:text-emerald-300"
                          title="Save title"
                        >
                          <Check className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center space-x-2 truncate pr-2">
                          {isPinned ? (
                            <Pin className="h-3 w-3 flex-shrink-0 text-cyan-400 rotate-45" />
                          ) : (
                            <MessageSquare className="h-3.5 w-3.5 flex-shrink-0 text-slate-500 group-hover:text-cyan-400" />
                          )}
                          <span className="truncate">{conv.title}</span>
                        </div>

                        <div className="flex items-center space-x-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          {onPinConversation && (
                            <button
                              onClick={(e) => onPinConversation(conv.id, e)}
                              className={`p-1 rounded transition-colors ${
                                isPinned ? 'text-cyan-400 hover:text-slate-400' : 'text-slate-500 hover:text-cyan-400'
                              }`}
                              title={isPinned ? 'Unpin discussion' : 'Pin discussion'}
                            >
                              <Pin className="h-3 w-3" />
                            </button>
                          )}
                          <button
                            onClick={(e) => handleStartRename(conv, e)}
                            className="p-1 text-slate-500 hover:text-cyan-400 rounded"
                            title="Rename chat"
                          >
                            <Pencil className="h-3 w-3" />
                          </button>
                          <button
                            onClick={(e) => onDeleteConversation(conv.id, e)}
                            className="p-1 text-slate-500 hover:text-red-400 rounded"
                            title="Delete chat"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Spacer if collapsed */}
      {isCollapsed && <div className="flex-1" />}

      {/* Bottom Footer Controls */}
      <div className="p-3 border-t border-white/10 space-y-2">
        {/* Gemini Engine & Connection status */}
        {!isCollapsed && (
          <div className="space-y-1.5 px-1 pb-1">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center space-x-1.5" title={aiStatus?.message || 'Universal AI Engine'}>
                <Cpu className="h-3.5 w-3.5 text-cyan-400 flex-shrink-0" />
                <span className="font-mono text-slate-300">
                  {aiStatus?.model || 'Gemini 2.5'}
                </span>
              </span>
              <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-mono font-semibold ${
                aiStatus?.status === 'connected'
                  ? 'bg-emerald-950/70 border border-emerald-500/40 text-emerald-300'
                  : aiStatus?.status === 'unconfigured'
                  ? 'bg-amber-950/70 border border-amber-500/40 text-amber-300'
                  : 'bg-rose-950/70 border border-rose-500/40 text-rose-300'
              }`}>
                {aiStatus?.status === 'connected' ? 'Active' : aiStatus?.status === 'unconfigured' ? 'Key Needed' : 'Offline'}
              </span>
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span className="flex items-center space-x-1.5">
                <Radio className={`h-2.5 w-2.5 ${isConnected ? 'text-emerald-500 animate-pulse' : 'text-amber-500'}`} />
                <span>{isConnected ? 'Real-Time Sync' : 'Reconnecting...'}</span>
              </span>
            </div>
          </div>
        )}

        {/* Theme switcher */}
        <button
          onClick={toggleTheme}
          className={`w-full flex items-center space-x-3 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors ${
            isCollapsed ? 'justify-center px-0' : ''
          }`}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? (
            <>
              <Sun className="h-4 w-4 text-amber-400 flex-shrink-0" />
              {!isCollapsed && <span>Light Mode</span>}
            </>
          ) : (
            <>
              <Moon className="h-4 w-4 text-indigo-500 flex-shrink-0" />
              {!isCollapsed && <span>Dark Mode</span>}
            </>
          )}
        </button>

        {/* Auth profile / login */}
        {isAuthenticated && user ? (
          <div
            className={`flex items-center justify-between p-2 rounded-xl bg-navy-900 border border-white/10 ${
              isCollapsed ? 'p-1 justify-center' : ''
            }`}
          >
            <div className="flex items-center space-x-2 truncate">
              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-tr from-violet-600 to-cyan-500 text-white text-xs font-bold shadow-sm">
                {user.full_name.charAt(0).toUpperCase()}
              </div>
              {!isCollapsed && (
                <div className="truncate text-left">
                  <div className="text-xs font-semibold text-white truncate">
                    {user.full_name}
                  </div>
                  <div className="flex items-center space-x-1.5 text-[10px] text-slate-400">
                    <span className="capitalize text-slate-400 font-mono">{user.role}</span>
                    <span>•</span>
                    <span
                      onClick={onOpenUpgrade}
                      className="uppercase font-mono font-bold text-cyan-400 hover:text-cyan-300 cursor-pointer"
                      title="Subscription Plan"
                    >
                      {user.subscription_tier || 'free'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {!isCollapsed && (
              <button
                onClick={logout}
                className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                title="Sign Out"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className={`w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-xl border border-white/10 text-xs font-semibold text-white bg-navy-900 hover:bg-navy-850 hover:border-cyan-500/30 transition-all ${
              isCollapsed ? 'px-0' : ''
            }`}
          >
            <UserIcon className="h-3.5 w-3.5 text-cyan-400" />
            {!isCollapsed && <span>Sign In</span>}
          </button>
        )}
      </div>
    </aside>
  );
};
