import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { DoubtForm } from './DoubtForm';
import { QueueCard } from './QueueCard';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Sparkles,
  Bot,
  Zap,
  Clock,
  CheckCircle2,
  Bookmark,
  ArrowRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import type { Doubt, ViewMode, SubscriptionTier } from '../../types';

interface StudentDashboardProps {
  doubts: Doubt[];
  activeDoubt: Doubt | null;
  onDoubtCreated: (doubt: Doubt) => void;
  onNavigate: (view: ViewMode) => void;
  onOpenUpgrade: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  doubts,
  activeDoubt,
  onDoubtCreated,
  onNavigate,
  onOpenUpgrade
}) => {
  const { user } = useAuth();

  const tier: SubscriptionTier = user?.subscription_tier || 'free';
  const queryCount = user?.daily_ai_query_count || 3;
  const quota = user?.daily_ai_query_quota || 20;
  const quotaPercentage = Math.min(100, Math.round((queryCount / quota) * 100));

  const myDoubts = doubts.filter((d) => !user || d.student_name === user.full_name || d.student_id === user.id);

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 max-w-7xl space-y-8">
      
      {/* Top Welcome & Quota Banner */}
      <div className="relative rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-indigo-950/60 border border-slate-800 p-6 sm:p-8 shadow-xl overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center space-x-2.5 mb-2">
              <span className="text-sm text-slate-400 font-medium">Student Learning Portal</span>
              <Badge
                variant={tier === 'campus' ? 'cyan' : tier === 'pro' ? 'purple' : 'outline'}
                className="text-[10px] uppercase font-bold"
              >
                {tier} Plan
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Welcome back, <span className="text-gradient-violet">{user?.full_name || 'Alex Student'}</span>
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-400 max-w-xl">
              Track your classroom doubt queue in real-time or get instant step-by-step reasoning from universal AI.
            </p>
          </div>

          {/* Quota Progress Card */}
          <div className="rounded-xl bg-slate-950/80 border border-slate-800 p-4 min-w-[260px] space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 flex items-center space-x-1.5">
                <Zap className="h-3.5 w-3.5 text-amber-400" />
                <span>Daily AI Quota</span>
              </span>
              <span className="font-mono text-white font-semibold">
                {queryCount} / {tier === 'pro' || tier === 'campus' ? 'Unlimited' : quota}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  quotaPercentage > 80
                    ? 'bg-amber-500'
                    : 'bg-gradient-to-r from-indigo-500 to-purple-500'
                }`}
                style={{ width: `${tier === 'pro' || tier === 'campus' ? 25 : quotaPercentage}%` }}
              />
            </div>

            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-500">
                {tier === 'free' ? `${quota - queryCount} queries left` : 'Pro priority reasoning active'}
              </span>
              {tier === 'free' && (
                <button
                  onClick={onOpenUpgrade}
                  className="text-indigo-400 hover:text-indigo-300 font-semibold underline"
                >
                  Upgrade
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-4">
          <div className="flex items-center space-x-2 text-slate-400 text-xs mb-1">
            <Clock className="h-3.5 w-3.5 text-indigo-400" />
            <span>Active Doubts</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {myDoubts.filter((d) => d.status !== 'RESOLVED').length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">In live classroom queue</div>
        </div>

        <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-4">
          <div className="flex items-center space-x-2 text-slate-400 text-xs mb-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            <span>Resolved Doubts</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {myDoubts.filter((d) => d.status === 'RESOLVED').length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Answered by teacher</div>
        </div>

        <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-4">
          <div className="flex items-center space-x-2 text-slate-400 text-xs mb-1">
            <Bot className="h-3.5 w-3.5 text-purple-400" />
            <span>AI Discussions</span>
          </div>
          <div className="text-2xl font-bold text-white">{queryCount}</div>
          <div className="text-[11px] text-slate-500 mt-1">Universal AI sessions</div>
        </div>

        <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-4">
          <div className="flex items-center space-x-2 text-slate-400 text-xs mb-1">
            <TrendingUp className="h-3.5 w-3.5 text-cyan-400" />
            <span>Avg Wait Time</span>
          </div>
          <div className="text-2xl font-bold text-white">3.8 min</div>
          <div className="text-[11px] text-slate-500 mt-1">Turnaround velocity</div>
        </div>
      </div>

      {/* Quick Launch Action Banner */}
      <div className="rounded-xl bg-indigo-950/30 border border-indigo-900/40 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3 text-center sm:text-left">
          <div className="h-10 w-10 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm">Need immediate step-by-step academic explanations?</h3>
            <p className="text-xs text-slate-400">Launch the Universal AI Workspace with multimodal PDF and LaTeX support.</p>
          </div>
        </div>
        <Button
          onClick={() => onNavigate('ai-solver')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-5 py-2 rounded-lg shrink-0"
        >
          <span>Open AI Workspace</span>
          <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
        </Button>
      </div>

      {/* Main Content Grid: Live Queue Form & Active Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Submit Doubt to Live Queue */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-white">Ask Classroom Teacher</h2>
              <p className="text-xs text-slate-400">Join the live session FIFO queue. Gemini will automatically pre-diagnose your doubt.</p>
            </div>
            <Badge variant="outline" className="text-xs text-indigo-400 border-indigo-500/30">
              Session DX-CS101
            </Badge>
          </div>

          <DoubtForm onDoubtCreated={onDoubtCreated} />

          {/* Active Queue Card if Doubt is Submitted */}
          {activeDoubt && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-white">Your Active Queue Status:</h3>
              <QueueCard doubt={activeDoubt} />
            </div>
          )}
        </div>

        {/* Right Col: Recent Classroom Doubts & Pinned Topics */}
        <div className="space-y-6">
          <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-5 space-y-4">
            <h3 className="font-semibold text-sm text-white flex items-center space-x-2">
              <Bookmark className="h-4 w-4 text-indigo-400" />
              <span>Recent Queue Doubts</span>
            </h3>

            {doubts.length === 0 ? (
              <p className="text-xs text-slate-500">No doubts currently in queue.</p>
            ) : (
              <div className="space-y-3">
                {doubts.slice(0, 4).map((d) => (
                  <div key={d.id} className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-1.5">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="font-medium text-slate-300 truncate max-w-[150px]">{d.student_name}</span>
                      <Badge
                        variant={d.status === 'RESOLVED' ? 'success' : d.status === 'IN_PROGRESS' ? 'purple' : 'warning'}
                        className="text-[9px] py-0 px-1"
                      >
                        {d.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2">{d.doubt}</p>
                    {d.category && (
                      <span className="text-[10px] text-slate-500 font-mono">{d.category}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tips Card */}
          <div className="rounded-xl bg-slate-900/40 border border-slate-800/80 p-5 space-y-2 text-xs text-slate-400">
            <h4 className="font-semibold text-slate-200 flex items-center space-x-1.5">
              <AlertCircle className="h-3.5 w-3.5 text-indigo-400" />
              <span>Classroom Etiquette</span>
            </h4>
            <p>
              When asking a doubt, attach code snippets or error logs. DoubtX AI automatically structures your doubt with an initial hint so your instructor can help you faster!
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
