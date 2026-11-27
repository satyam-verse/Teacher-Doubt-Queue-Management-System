import React from 'react';
import { Terminal, Pi, Atom, Dna, TrendingUp, Scale, Sparkles, Check } from 'lucide-react';

interface SubjectGridProps {
  onSelectPrompt?: (prompt: string) => void;
}

export const SubjectGrid: React.FC<SubjectGridProps> = ({ onSelectPrompt }) => {
  const domains = [
    {
      title: 'Computer Science & Software',
      icon: Terminal,
      color: 'from-blue-500/20 to-indigo-500/10 border-blue-500/30 text-blue-400',
      description: 'Distributed consensus, database B-Trees, asynchronous event loops, and algorithm proofs.',
      examples: [
        'Raft state machine split votes',
        'Goroutine leak prevention in Go',
        'B-Tree vs LSM Tree write amplification'
      ]
    },
    {
      title: 'Advanced Mathematics',
      icon: Pi,
      color: 'from-purple-500/20 to-pink-500/10 border-purple-500/30 text-purple-400',
      description: 'Rigorous step-by-step proofs rendered with full KaTeX math notation and geometric intuition.',
      examples: [
        'Eigenvalue decomposition & SVD',
        'Stokes theorem on non-orientable surfaces',
        'Cauchy-Riemann complex analyticity'
      ]
    },
    {
      title: 'Physics & Engineering',
      icon: Atom,
      color: 'from-cyan-500/20 to-teal-500/10 border-cyan-500/30 text-cyan-400',
      description: 'Thermodynamics, quantum state collapse, electrodynamics, and semiconductor band theory.',
      examples: [
        'Schrödinger wave equation in infinite well',
        'Maxwell displacement current derivation',
        'Carnot cycle entropy irreversibility'
      ]
    },
    {
      title: 'Biomedical & Genetics',
      icon: Dna,
      color: 'from-emerald-500/20 to-green-500/10 border-emerald-500/30 text-emerald-400',
      description: 'CRISPR gene editing, protein secondary folding pathways, PCR cycles, and enzyme kinetics.',
      examples: [
        'Michaelis-Menten Lineweaver-Burk plots',
        'CRISPR Cas9 NHEJ vs HDR mechanisms',
        'Action potential refractory ion flux'
      ]
    },
    {
      title: 'Economics & Econometrics',
      icon: TrendingUp,
      color: 'from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-400',
      description: 'Game theoretic equilibria, Solow growth model, asymmetric information, and OLS regression.',
      examples: [
        'Cournot vs Bertrand duopoly equilibrium',
        'Endogeneity & instrumental variables',
        'Black-Scholes option pricing Greeks'
      ]
    },
    {
      title: 'Logic, Law & Philosophy',
      icon: Scale,
      color: 'from-rose-500/20 to-red-500/10 border-rose-500/30 text-rose-400',
      description: 'Predicate calculus, epistemic paradoxes, statutory interpretation, and ethical frameworks.',
      examples: [
        'Gödel incompleteness theorem intuition',
        'Trolley problem deontology vs utilitarianism',
        'Due process constitutional standards'
      ]
    }
  ];

  return (
    <section className="py-20 md:py-28 bg-navy-950 border-b border-white/10 relative">
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center space-x-2 text-xs text-cyan-400 font-mono font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Universal Domain Matrix</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Zero Academic Subject Restrictions
          </h2>
          <p className="mt-3 text-sm text-slate-400">
            DoubtX AI synthesizes multi-turn academic reasoning and formal proofs across every university faculty.
          </p>
        </div>

        {/* 6 Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {domains.map((domain, index) => {
            const Icon = domain.icon;
            return (
              <div
                key={index}
                className="neo-glass-card rounded-2xl p-6 border border-white/10 hover:border-cyan-500/40 transition-all hover:shadow-glow-cyan group relative overflow-hidden"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`p-2.5 rounded-xl border bg-gradient-to-br ${domain.color} shadow-sm`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-base text-white group-hover:text-cyan-300 transition-colors">
                    {domain.title}
                  </h3>
                </div>

                <p className="text-xs text-slate-400 mb-5 leading-relaxed font-normal">
                  {domain.description}
                </p>

                <div className="space-y-2 pt-3 border-t border-white/10">
                  <div className="text-[10px] uppercase font-mono font-bold text-slate-500 tracking-wider">Example Doubts:</div>
                  {domain.examples.map((ex, i) => (
                    <button
                      key={i}
                      onClick={() => onSelectPrompt && onSelectPrompt(ex)}
                      className="w-full text-left flex items-start space-x-2 text-xs text-slate-300 hover:text-cyan-300 transition-colors p-1.5 rounded-lg hover:bg-white/[0.05]"
                    >
                      <Check className="h-3.5 w-3.5 text-cyan-400 mt-0.5 shrink-0" />
                      <span className="truncate font-medium">{ex}</span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
