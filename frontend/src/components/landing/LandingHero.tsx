import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Sparkles, ArrowRight, Play, CheckCircle2 } from 'lucide-react';
import type { ViewMode } from '../../types';

interface LandingHeroProps {
  onNavigate: (view: ViewMode) => void;
  onOpenUpgrade: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ onNavigate, onOpenUpgrade }) => {
  const sampleDemos = [
    {
      id: 'math',
      tag: 'Mathematics & Topology',
      query: 'Prove why the Klein bottle cannot be embedded in R^3 without self-intersection.',
      reasoning: '1. Topological non-orientability: A compact, connected, 2-dimensional manifold with one continuous boundary.\n2. In R^3, the Jordan-Brouwer separation theorem mandates that every closed hypersurface divides space into an interior and exterior.\n3. Since the Klein bottle is one-sided, it cannot bound an interior in R^3, requiring at least R^4 for an immersion without self-intersection.',
      badgeColor: 'border-purple-500/40 text-purple-300'
    },
    {
      id: 'cs',
      tag: 'Computer Science & Systems',
      query: 'Trace the Raft Consensus state transitions when a leader heart-beat timer elapses.',
      reasoning: '1. Follower election timeout expires -> Converts to Candidate.\n2. Increments currentTerm, votes for itself, and broadcasts RequestVote RPC to all peers.\n3. Split-vote resolution: If neither candidate receives a majority (N/2 + 1), randomized jitter timeout triggers a new term.',
      badgeColor: 'border-cyan-500/40 text-cyan-300'
    },
    {
      id: 'biology',
      tag: 'Biomedical Genetics',
      query: 'Differentiate CRISPR-Cas9 repair pathways: Non-Homologous End Joining (NHEJ) vs HDR.',
      reasoning: '1. Cas9 produces a double-stranded break (DSB) 3-4 bp upstream of the PAM sequence.\n2. NHEJ operates across all cell cycle phases, rapidly ligating ends, often creating indels (knockout).\n3. HDR requires a donor template, is active primarily in late S/G2 phase, achieving precise knock-ins.',
      badgeColor: 'border-emerald-500/40 text-emerald-300'
    },
    {
      id: 'econ',
      tag: 'Quantitative Economics',
      query: 'Calculate the Cournot duopoly equilibrium with asymmetric marginal costs c1 < c2.',
      reasoning: '1. Profit functions: Pi_i = (P(Q) - c_i) * q_i where P(Q) = a - b(q_1 + q_2).\n2. First-order reaction functions: q_1 = (a - c_1 - b*q_2) / (2b).\n3. Solving system yields q_1* = (a - 2*c_1 + c_2)/(3b), demonstrating cost advantage captures greater market share.',
      badgeColor: 'border-amber-500/40 text-amber-300'
    }
  ];

  const [activeDemo, setActiveDemo] = useState(0);

  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:pt-24 md:pb-36 bg-navy-950 border-b border-white/10">
      {/* Background radial glow & cyber grid effects */}
      <div className="absolute inset-0 neo-grid-pattern opacity-30 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-tr from-violet-600/20 via-indigo-600/15 to-cyan-500/15 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute -top-24 right-10 w-96 h-96 bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Top Announcement Pill */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center space-x-2 rounded-full border border-violet-500/30 bg-navy-900/80 px-4 py-1.5 text-xs text-violet-300 shadow-glow-violet backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
            <span className="font-semibold tracking-wide">DoubtX AI v2.5 Universal Intelligence Engine</span>
            <span className="text-slate-600">|</span>
            <span className="text-cyan-300 font-mono text-[11px]">Multi-Domain Gemini Core</span>
          </div>
        </div>

        {/* Hero Headline & Subhead */}
        <div className="text-center max-w-4xl mx-auto mb-12">
          <h1 className="text-4xl font-black tracking-tight text-white sm:text-6xl sm:leading-[1.12]">
            Universal Academic Intelligence Meets{' '}
            <span className="bg-gradient-to-r from-violet-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
              Real-Time Classroom Orchestration
            </span>
          </h1>
          <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Eliminate university doubt backlogs with instant multi-disciplinary AI reasoning, 
            interactive LaTeX derivations, and synchronized real-time FIFO doubt queues.
          </p>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              onClick={() => onNavigate('ai-solver')}
              className="w-full sm:w-auto bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white font-bold text-sm px-8 py-3.5 rounded-xl shadow-glow-violet transition-all transform hover:-translate-y-0.5"
            >
              <span>Launch AI Workspace Free</span>
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={() => onNavigate('student-dashboard')}
              className="w-full sm:w-auto border-white/10 bg-navy-900/60 hover:bg-navy-850 text-slate-200 text-sm px-6 py-3.5 rounded-xl shadow-sm hover:border-cyan-500/40"
            >
              <Play className="h-4 w-4 mr-2 text-cyan-400" />
              <span>Enter Student Portal</span>
            </Button>

            <Button
              size="lg"
              variant="ghost"
              onClick={onOpenUpgrade}
              className="w-full sm:w-auto text-slate-300 hover:text-white hover:bg-white/[0.05] text-sm"
            >
              <span>View SaaS Pricing</span>
            </Button>
          </div>

          {/* Feature Highlights / Metrics */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 text-left max-w-3xl mx-auto">
            <div className="p-4 rounded-xl neo-glass-card">
              <div className="text-2xl font-extrabold text-white font-mono">&lt; 300ms</div>
              <div className="text-xs text-slate-400 mt-1">WebSocket Live Sync</div>
            </div>
            <div className="p-4 rounded-xl neo-glass-card">
              <div className="text-2xl font-extrabold text-violet-400 font-mono">100%</div>
              <div className="text-xs text-slate-400 mt-1">Subject Coverage</div>
            </div>
            <div className="p-4 rounded-xl neo-glass-card">
              <div className="text-2xl font-extrabold text-cyan-400 font-mono">KaTeX + OCR</div>
              <div className="text-xs text-slate-400 mt-1">Math & Multimodal Proofs</div>
            </div>
            <div className="p-4 rounded-xl neo-glass-card">
              <div className="text-2xl font-extrabold text-emerald-400 font-mono">Zero Setup</div>
              <div className="text-xs text-slate-400 mt-1">Instant Student/Teacher RBAC</div>
            </div>
          </div>
        </div>

        {/* Live Interactive AI Playground Simulator Widget */}
        <div className="max-w-4xl mx-auto rounded-2xl neo-glass-card border border-white/10 shadow-2xl p-4 sm:p-6 backdrop-blur-xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-3">
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1.5">
                <div className="h-3 w-3 rounded-full bg-red-500/80" />
                <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
              </div>
              <span className="text-xs font-mono text-cyan-400/90 ml-2">doubtx-ai-simulator ~ interactive-preview</span>
            </div>

            {/* Discipline Selector Tabs */}
            <div className="flex flex-wrap gap-1.5">
              {sampleDemos.map((demo, idx) => (
                <button
                  key={demo.id}
                  onClick={() => setActiveDemo(idx)}
                  className={`text-xs font-mono px-3 py-1 rounded-lg transition-all font-semibold ${
                    activeDemo === idx
                      ? 'bg-gradient-to-r from-violet-600 to-cyan-600 text-white shadow-md'
                      : 'bg-navy-950/70 border border-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  {demo.id.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Active Demo Content */}
          <div className="mt-5 space-y-4">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Badge variant="outline" className={`text-[10px] font-mono ${sampleDemos[activeDemo].badgeColor}`}>
                  {sampleDemos[activeDemo].tag}
                </Badge>
                <span className="text-xs text-slate-400 font-mono">Academic Question</span>
              </div>
              <div className="p-3.5 rounded-xl bg-navy-950/80 border border-white/10 text-sm font-medium text-slate-100 shadow-inner">
                "{sampleDemos[activeDemo].query}"
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                <span className="text-xs font-semibold text-cyan-300">DoubtX AI Step-by-Step Reasoning:</span>
              </div>
              <div className="p-4 rounded-xl bg-navy-950/90 border border-violet-500/20 text-xs sm:text-sm text-slate-200 font-mono whitespace-pre-line leading-relaxed shadow-lg">
                {sampleDemos[activeDemo].reasoning}
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-400 gap-2">
              <span className="flex items-center space-x-1.5 text-emerald-400 font-medium">
                <CheckCircle2 className="h-4 w-4" />
                <span>Verified with Universal Gemini Model</span>
              </span>
              <button
                onClick={() => onNavigate('ai-solver')}
                className="text-cyan-400 hover:text-cyan-300 font-semibold underline flex items-center space-x-1"
              >
                <span>Ask your own doubt in full workspace</span>
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
