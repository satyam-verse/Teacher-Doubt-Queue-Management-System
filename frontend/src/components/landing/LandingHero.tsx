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
    <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32 bg-slate-950 border-b border-slate-900">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-indigo-600/20 via-purple-600/15 to-cyan-500/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Top Announcement Pill */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center space-x-2 rounded-full border border-indigo-500/30 bg-indigo-950/40 px-3.5 py-1 text-xs text-indigo-300 shadow-glow-violet">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span className="font-medium">DoubtX AI v2.5 Universal Intelligence Upgrade</span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-300">Google Gemini Powered</span>
          </div>
        </div>

        {/* Hero Headline & Subhead */}
        <div className="text-center max-w-4xl mx-auto mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl sm:leading-[1.15]">
            Universal Academic Intelligence Meets{' '}
            <span className="text-gradient-violet">Real-Time Classroom Orchestration</span>
          </h1>
          <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Eliminate classroom bottleneck with a unified platform for multi-disciplinary AI reasoning, 
            instant LaTeX derivations, and synchronized live FIFO doubt queue management for universities.
          </p>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              onClick={() => onNavigate('ai-solver')}
              className="w-full sm:w-auto bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold text-sm px-7 py-3 rounded-xl shadow-glow-violet transition-all transform hover:-translate-y-0.5"
            >
              <span>Launch AI Workspace Free</span>
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>

            <Button
              size="lg"
              variant="outline"
              onClick={() => onNavigate('student-dashboard')}
              className="w-full sm:w-auto border-slate-700 hover:bg-slate-900 text-slate-200 text-sm px-6 py-3 rounded-xl"
            >
              <Play className="h-4 w-4 mr-2 text-indigo-400" />
              <span>Enter Student Portal</span>
            </Button>

            <Button
              size="lg"
              variant="ghost"
              onClick={onOpenUpgrade}
              className="w-full sm:w-auto text-slate-400 hover:text-white text-sm"
            >
              <span>View SaaS Pricing</span>
            </Button>
          </div>

          {/* Feature Highlights / Metrics */}
          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4 text-left max-w-3xl mx-auto">
            <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800/80">
              <div className="text-xl font-bold text-white">0.3s</div>
              <div className="text-xs text-slate-400">WebSocket Live Sync</div>
            </div>
            <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800/80">
              <div className="text-xl font-bold text-indigo-400">100%</div>
              <div className="text-xs text-slate-400">Subject Coverage</div>
            </div>
            <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800/80">
              <div className="text-xl font-bold text-cyan-400">KaTeX + OCR</div>
              <div className="text-xs text-slate-400">Math & PDF Solving</div>
            </div>
            <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800/80">
              <div className="text-xl font-bold text-purple-400">Role-Based</div>
              <div className="text-xs text-slate-400">Student, Teacher, Admin</div>
            </div>
          </div>
        </div>

        {/* Live Interactive AI Playground Simulator Widget */}
        <div className="max-w-4xl mx-auto rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl p-4 sm:p-6 backdrop-blur">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1.5">
                <div className="h-3 w-3 rounded-full bg-red-500/80" />
                <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
              </div>
              <span className="text-xs font-mono text-slate-400 ml-2">doubtx-ai-simulator ~ interactive-preview</span>
            </div>

            {/* Discipline Selector Tabs */}
            <div className="flex flex-wrap gap-1.5">
              {sampleDemos.map((demo, idx) => (
                <button
                  key={demo.id}
                  onClick={() => setActiveDemo(idx)}
                  className={`text-xs px-2.5 py-1 rounded-md transition-all font-medium ${
                    activeDemo === idx
                      ? 'bg-indigo-600 text-white shadow'
                      : 'bg-slate-800/80 text-slate-400 hover:text-white'
                  }`}
                >
                  {demo.id.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Active Demo Content */}
          <div className="mt-4 space-y-4">
            <div>
              <div className="flex items-center space-x-2 mb-1.5">
                <Badge variant="outline" className={`text-[10px] ${sampleDemos[activeDemo].badgeColor}`}>
                  {sampleDemos[activeDemo].tag}
                </Badge>
                <span className="text-xs text-slate-500">Student Question</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 text-sm font-medium text-slate-100">
                "{sampleDemos[activeDemo].query}"
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-2 mb-1.5">
                <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                <span className="text-xs font-semibold text-indigo-300">DoubtX AI Step-by-Step Reasoning:</span>
              </div>
              <div className="p-4 rounded-lg bg-slate-950 border border-indigo-900/30 text-xs sm:text-sm text-slate-200 font-mono whitespace-pre-line leading-relaxed">
                {sampleDemos[activeDemo].reasoning}
              </div>
            </div>

            <div className="pt-2 flex justify-between items-center text-xs text-slate-400">
              <span className="flex items-center space-x-1.5 text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Verified with Universal Gemini Model</span>
              </span>
              <button
                onClick={() => onNavigate('ai-solver')}
                className="text-indigo-400 hover:text-indigo-300 font-medium underline flex items-center space-x-1"
              >
                <span>Ask your own doubt in full workspace</span>
                <ArrowRight className="h-3 w-3 ml-1" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
