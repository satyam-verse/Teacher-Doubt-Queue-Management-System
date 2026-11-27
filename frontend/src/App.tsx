import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider, useSocket } from './context/SocketContext';
import { ThemeProvider } from './context/ThemeContext';
import { Sidebar } from './components/common/Sidebar';
import { NeoNavbar } from './components/common/NeoNavbar';
import { UpgradeModal } from './components/common/UpgradeModal';
import { DoubtSolverWorkspace } from './components/ai/DoubtSolverWorkspace';
import { StudentDashboard } from './components/student/StudentDashboard';
import { LiveQueueKanban } from './components/teacher/LiveQueueKanban';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { LandingPage } from './components/landing/LandingPage';
import { QueueStats } from './components/analytics/QueueStats';
import { AuthModal } from './components/auth/AuthModal';
import { api } from './lib/api';
import type {
  Doubt,
  QueueStats as QueueStatsType,
  Conversation,
  ExplanationLevel,
  ViewMode
} from './types';
import type { AIStatusInfo } from './components/common/Sidebar';
import { Sparkles, RefreshCw, Bell } from 'lucide-react';
import { Button } from './components/ui/button';

const MainShell: React.FC = () => {
  const { socket } = useSocket();

  // Navigation & Layout
  const [activeView, setActiveView] = useState<ViewMode>('landing');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type?: 'info' | 'success' } | null>(null);

  // AI Doubt Solver State
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiStatus, setAiStatus] = useState<AIStatusInfo | null>(null);

  // Classroom Queue State
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [stats, setStats] = useState<QueueStatsType>({ queued: 0, in_progress: 0, resolved: 0, total: 0 });
  const [activeStudentDoubt, setActiveStudentDoubt] = useState<Doubt | null>(null);

  const showToast = (message: string, type: 'info' | 'success' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ==================== Fetch AI Conversations ====================
  const fetchConversations = useCallback(async () => {
    try {
      const res = await api.get('/api/v1/ai/conversations');
      setConversations(res.data.conversations || []);
    } catch (err) {
      console.error('Error fetching conversations:', err);
    }
  }, []);

  const loadConversationDetail = useCallback(async (convId: number) => {
    try {
      const res = await api.get(`/api/v1/ai/conversations/${convId}`);
      setActiveConversation(res.data.conversation);
      setActiveConversationId(convId);
    } catch (err) {
      console.error('Error loading conversation:', err);
    }
  }, []);

  const fetchAiHealth = useCallback(async () => {
    try {
      const res = await api.get('/api/v1/ai/health');
      setAiStatus(res.data);
    } catch (err) {
      console.error('Error checking Gemini AI status:', err);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
    fetchAiHealth();
  }, [fetchConversations, fetchAiHealth]);

  // ==================== Fetch Classroom Queue Doubts ====================
  const fetchDoubts = useCallback(async () => {
    try {
      const res = await api.get('/api/v1/doubts');
      setDoubts(res.data.doubts || []);
      setStats(res.data.stats || { queued: 0, in_progress: 0, resolved: 0, total: 0 });

      if (activeStudentDoubt) {
        const updated = res.data.doubts.find((d: Doubt) => d.id === activeStudentDoubt.id);
        if (updated) {
          if (updated.status !== activeStudentDoubt.status) {
            if (updated.status === 'IN_PROGRESS') {
              showToast('🎉 A teacher has claimed your doubt and is attending now!', 'success');
            } else if (updated.status === 'RESOLVED') {
              showToast('✅ Your doubt has been marked resolved!', 'success');
            }
          }
          setActiveStudentDoubt(updated);
        }
      }
    } catch (err) {
      console.error('Error fetching doubts:', err);
    }
  }, [activeStudentDoubt]);

  useEffect(() => {
    fetchDoubts();
  }, [fetchDoubts]);

  // ==================== Real-Time Socket.IO Synchronization ====================
  useEffect(() => {
    if (!socket) return;

    // Join default classroom session room for isolated real-time events
    socket.emit('join_session', { session_code: 'DX-CS101' });

    socket.on('doubt:created', (newDoubt: Doubt) => {
      setDoubts((prev) => [newDoubt, ...prev.filter((d) => d.id !== newDoubt.id)]);
      setStats((prev) => ({
        ...prev,
        queued: prev.queued + 1,
        total: prev.total + 1,
      }));
      showToast(`New student doubt queued: "${newDoubt.student_name}"`);
    });

    socket.on('doubt:updated', (updatedDoubt: Doubt) => {
      setDoubts((prev) => prev.map((d) => (d.id === updatedDoubt.id ? updatedDoubt : d)));

      if (activeStudentDoubt && activeStudentDoubt.id === updatedDoubt.id) {
        if (updatedDoubt.status === 'IN_PROGRESS') {
          showToast('🔔 Teacher is attending your question now!', 'success');
        } else if (updatedDoubt.status === 'RESOLVED') {
          showToast('✅ Your question has been resolved by teacher!', 'success');
        }
        setActiveStudentDoubt(updatedDoubt);
      }
    });

    socket.on('stats:updated', (newStats: QueueStatsType) => {
      setStats(newStats);
    });

    return () => {
      socket.off('doubt:created');
      socket.off('doubt:updated');
      socket.off('stats:updated');
    };
  }, [socket, activeStudentDoubt]);

  // ==================== Conversation Handlers ====================
  const handleSelectConversation = (convId: number) => {
    loadConversationDetail(convId);
    setActiveView('ai-solver');
  };

  const handleNewConversation = async () => {
    try {
      const res = await api.post('/api/v1/ai/conversations', {
        title: 'New Discussion',
        explanation_level: 'intermediate',
      });
      const newConv = res.data.conversation;
      setConversations((prev) => [newConv, ...prev]);
      setActiveConversation(newConv);
      setActiveConversationId(newConv.id);
      setActiveView('ai-solver');
    } catch (err) {
      console.error('Failed to create new conversation:', err);
    }
  };

  const handleDeleteConversation = async (convId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.delete(`/api/v1/ai/conversations/${convId}`);
      setConversations((prev) => prev.filter((c) => c.id !== convId));
      if (activeConversationId === convId) {
        setActiveConversation(null);
        setActiveConversationId(null);
      }
      showToast('Discussion deleted.', 'info');
    } catch (err) {
      console.error('Failed to delete conversation:', err);
    }
  };

  const handleRenameConversation = async (convId: number, newTitle: string) => {
    try {
      const res = await api.patch(`/api/v1/ai/conversations/${convId}`, {
        title: newTitle,
      });
      const updated = res.data.conversation;
      setConversations((prev) => prev.map((c) => (c.id === convId ? { ...c, title: updated.title } : c)));
      if (activeConversation?.id === convId) {
        setActiveConversation((prev) => (prev ? { ...prev, title: updated.title } : null));
      }
      showToast('Discussion title updated.', 'success');
    } catch (err) {
      console.error('Failed to rename conversation:', err);
    }
  };

  const handlePinConversation = async (convId: number) => {
    try {
      const res = await api.patch(`/api/v1/ai/conversations/${convId}/pin`);
      const updated = res.data.conversation;
      setConversations((prev) =>
        prev.map((c) => (c.id === convId ? { ...c, is_pinned: updated.is_pinned } : c))
      );
      if (activeConversation?.id === convId) {
        setActiveConversation((prev) => (prev ? { ...prev, is_pinned: updated.is_pinned } : null));
      }
      showToast(updated.is_pinned ? 'Discussion pinned.' : 'Discussion unpinned.', 'info');
    } catch (err) {
      console.error('Failed to pin conversation:', err);
    }
  };

  const handleSendMessage = async (
    content: string,
    level: ExplanationLevel,
    attachmentUrl?: string,
    attachmentType?: string
  ) => {
    setIsGenerating(true);
    try {
      let convId = activeConversationId;

      // If no active conversation, create one first
      if (!convId) {
        const titleSnippet = content.trim() ? content.trim().slice(0, 36) : 'Document Analysis';
        const createRes = await api.post('/api/v1/ai/conversations', {
          title: titleSnippet,
          explanation_level: level,
        });
        convId = createRes.data.conversation.id;
        setActiveConversationId(convId);
      }

      // Send message to Gemini
      const res = await api.post(`/api/v1/ai/conversations/${convId}/messages`, {
        content,
        explanation_level: level,
        attachment_url: attachmentUrl,
        attachment_type: attachmentType,
      });

      const { user_message, assistant_message, conversation: updatedConv } = res.data;

      setActiveConversation((prev) => {
        const existingMessages = prev?.messages || [];
        return {
          ...updatedConv,
          messages: [...existingMessages, user_message, assistant_message],
        };
      });

      fetchConversations();
    } catch (err: any) {
      console.error('Failed to send message:', err);
      if (err.response?.status === 429) {
        showToast(err.response.data.message || 'Daily AI query quota reached.', 'info');
        setIsUpgradeOpen(true);
      } else {
        showToast('Error generating AI response. Please check network connection.', 'info');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerate = async () => {
    if (!activeConversationId) return;
    setIsGenerating(true);
    try {
      const res = await api.post(`/api/v1/ai/conversations/${activeConversationId}/regenerate`, {
        explanation_level: activeConversation?.explanation_level || 'intermediate',
      });
      const newAssistantMsg = res.data.assistant_message;

      setActiveConversation((prev) => {
        if (!prev) return null;
        const msgs = [...(prev.messages || [])];
        if (msgs.length > 0 && msgs[msgs.length - 1].sender_type === 'assistant') {
          msgs[msgs.length - 1] = newAssistantMsg;
        } else {
          msgs.push(newAssistantMsg);
        }
        return { ...prev, messages: msgs };
      });
      showToast('Answer regenerated.', 'success');
    } catch (err: any) {
      console.error('Regenerate failed:', err);
      if (err.response?.status === 429) {
        setIsUpgradeOpen(true);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectSuggestedPrompt = (prompt: string, level: ExplanationLevel = 'intermediate') => {
    setActiveView('ai-solver');
    handleSendMessage(prompt, level);
  };

  // ==================== Queue Handlers ====================
  const handleClaimDoubt = async (doubtId: number) => {
    try {
      await api.post(`/api/v1/doubts/${doubtId}/claim`);
      fetchDoubts();
      showToast('Doubt claimed! Marked as In-Progress.', 'success');
    } catch (err: any) {
      if (err.response?.status === 401) {
        setIsAuthOpen(true);
      } else {
        alert(err.response?.data?.error || 'Failed to claim doubt');
      }
    }
  };

  const handleResolveDoubt = async (doubtId: number, notes: string) => {
    try {
      await api.patch(`/api/v1/doubts/${doubtId}/status`, {
        status: 'RESOLVED',
        resolution_notes: notes,
      });
      fetchDoubts();
      showToast('Doubt marked as resolved.', 'success');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to resolve doubt');
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col overflow-x-hidden selection:bg-cyan-500/20 selection:text-cyan-200">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center space-x-2 px-4 py-2.5 rounded-xl neo-glass-card border border-white/20 text-white shadow-2xl text-xs font-semibold animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Bell className="h-4 w-4 text-cyan-400" />
          <span>{toast.message}</span>
        </div>
      )}

      {/* Global SaaS Navigation Bar */}
      <NeoNavbar
        currentView={activeView}
        setCurrentView={setActiveView}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenUpgrade={() => setIsUpgradeOpen(true)}
      />

      <div className="flex-1 flex overflow-hidden">
        
        {/* Collapsible Sidebar (visible in app views, hidden on public landing view) */}
        {activeView !== 'landing' && (
          <Sidebar
            activeView={activeView}
            setActiveView={setActiveView}
            conversations={conversations}
            activeConversationId={activeConversationId}
            onSelectConversation={handleSelectConversation}
            onNewConversation={handleNewConversation}
            onDeleteConversation={handleDeleteConversation}
            onRenameConversation={handleRenameConversation}
            onPinConversation={handlePinConversation}
            aiStatus={aiStatus}
            onOpenAuth={() => setIsAuthOpen(true)}
            onOpenUpgrade={() => setIsUpgradeOpen(true)}
            isCollapsed={isSidebarCollapsed}
            setIsCollapsed={setIsSidebarCollapsed}
          />
        )}

        {/* Main Viewport */}
        <div
          className={`flex-1 flex flex-col min-h-0 overflow-y-auto transition-all duration-300 ${
            activeView !== 'landing' ? (isSidebarCollapsed ? 'ml-16' : 'ml-72') : ''
          }`}
        >
          {activeView === 'landing' ? (
            /* ================= View: Public SaaS Landing Page ================= */
            <LandingPage
              onNavigate={setActiveView}
              onOpenUpgrade={() => setIsUpgradeOpen(true)}
              onSelectPrompt={handleSelectSuggestedPrompt}
            />
          ) : activeView === 'ai-solver' ? (
            /* ================= View: Universal AI Workspace ================= */
            <DoubtSolverWorkspace
              conversation={activeConversation}
              onSendMessage={handleSendMessage}
              onRegenerate={handleRegenerate}
              isGenerating={isGenerating}
              onSelectSuggestedPrompt={handleSelectSuggestedPrompt}
              onRenameConversation={handleRenameConversation}
              onPinConversation={handlePinConversation}
              onOpenUpgrade={() => setIsUpgradeOpen(true)}
              aiStatus={aiStatus}
            />
          ) : activeView === 'student-dashboard' ? (
            /* ================= View: Student Learning Dashboard ================= */
            <StudentDashboard
              doubts={doubts}
              activeDoubt={activeStudentDoubt}
              onDoubtCreated={(doubt) => {
                setActiveStudentDoubt(doubt);
                fetchDoubts();
                showToast('Doubt submitted to live queue!', 'success');
              }}
              onNavigate={setActiveView}
              onOpenUpgrade={() => setIsUpgradeOpen(true)}
            />
          ) : activeView === 'teacher-console' ? (
            /* ================= View: Teacher Live Queue Console ================= */
            <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
                    <span>Teacher Live Queue Console</span>
                    <Sparkles className="h-6 w-6 text-cyan-400" />
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1.5">
                    Live FIFO Kanban board with 1-click claims, Gemini AI pedagogical pre-diagnosis, and turnaround velocity telemetry.
                  </p>
                </div>

                <div className="flex items-center space-x-3">
                  <Button variant="outline" size="sm" onClick={fetchDoubts} className="text-xs border-white/10 bg-navy-900/80 text-slate-300 hover:bg-navy-800 hover:text-white">
                    <RefreshCw className="h-3.5 w-3.5 mr-1.5 text-cyan-400" />
                    Refresh Queue
                  </Button>
                </div>
              </div>

              <QueueStats stats={stats} avgWaitMinutes={stats.queued * 3} />

              <LiveQueueKanban
                doubts={doubts}
                onClaimDoubt={handleClaimDoubt}
                onResolveDoubt={handleResolveDoubt}
              />
            </div>
          ) : activeView === 'admin-console' ? (
            /* ================= View: Institutional Admin Console ================= */
            <AdminDashboard />
          ) : null}
        </div>

      </div>

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

      {/* SaaS Subscription Upgrade Modal */}
      <UpgradeModal
        isOpen={isUpgradeOpen}
        onClose={() => setIsUpgradeOpen(false)}
        onSuccess={(tier) => {
          showToast(`Subscription upgraded to ${tier.toUpperCase()} successfully!`, 'success');
        }}
      />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <MainShell />
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
