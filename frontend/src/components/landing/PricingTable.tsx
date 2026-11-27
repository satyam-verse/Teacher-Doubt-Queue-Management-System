import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Check, Zap, Building2, ArrowRight } from 'lucide-react';

interface PricingTableProps {
  onOpenUpgrade: () => void;
}

export const PricingTable: React.FC<PricingTableProps> = ({ onOpenUpgrade }) => {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');

  return (
    <section className="py-20 md:py-28 bg-navy-950 border-b border-white/10 relative" id="pricing">
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <Badge variant="cyan" className="mb-3 text-[10px] font-mono font-bold tracking-widest uppercase">
            Transparent SaaS Licensing
          </Badge>
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Simple, Scalable Tier Pricing
          </h2>
          <p className="mt-3 text-sm text-slate-400">
            Start free, upgrade as your coursework demands deeper multi-step proofs, or deploy across entire academic faculties.
          </p>

          {/* Billing Switch */}
          <div className="mt-7 inline-flex items-center rounded-xl bg-navy-900 p-1.5 border border-white/10 shadow-inner">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                billingPeriod === 'monthly' ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('annual')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center space-x-1.5 ${
                billingPeriod === 'annual' ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Annual</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-1.5 py-0.5 rounded font-mono">20% OFF</span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
          
          {/* Free Tier */}
          <div className="neo-glass-card rounded-2xl p-7 border border-white/10 flex flex-col justify-between hover:border-white/20 transition-all">
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-bold text-white">Free Starter</h3>
                <Badge variant="outline" className="text-[10px] font-mono border-white/10 text-slate-400">For Casual Use</Badge>
              </div>
              <p className="text-xs text-slate-400 mb-6">Essential help for daily homework and quick concept questions.</p>
              <div className="mb-6 font-mono">
                <span className="text-4xl font-black text-white">$0</span>
                <span className="text-xs text-slate-400 ml-1">/ forever</span>
              </div>
              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>20 Universal AI queries per day</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Beginner & Intermediate explanations</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Basic LaTeX equation rendering</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Live FIFO classroom queue participation</span>
                </li>
              </ul>
            </div>

            <div className="mt-8">
              <Button
                variant="outline"
                className="w-full text-xs border-white/10 bg-navy-900/60 text-slate-300 hover:bg-navy-800 hover:text-white"
                onClick={onOpenUpgrade}
              >
                Get Started Free
              </Button>
            </div>
          </div>

          {/* Pro Tier (Featured) */}
          <div className="relative rounded-2xl p-7 bg-navy-900/90 border-2 border-violet-500 shadow-glow-violet flex flex-col justify-between">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <Badge className="bg-gradient-to-r from-violet-600 to-cyan-600 text-white font-mono font-bold text-[10px] uppercase px-3 py-1 shadow-lg">
                RECOMMENDED FOR STUDENTS
              </Badge>
            </div>
            <div>
              <div className="flex justify-between items-center mb-3 mt-1">
                <div className="flex items-center space-x-1.5">
                  <Zap className="h-4 w-4 text-amber-400" />
                  <h3 className="text-lg font-bold text-white">DoubtX Pro</h3>
                </div>
                <Badge variant="purple" className="text-[10px] font-mono">Unlimited</Badge>
              </div>
              <p className="text-xs text-slate-300 mb-6">Complete universal problem solving with multimodal document OCR.</p>
              <div className="mb-6 font-mono">
                <span className="text-4xl font-black text-white">
                  {billingPeriod === 'monthly' ? '$12' : '$9.50'}
                </span>
                <span className="text-xs text-slate-400 ml-1">/ month</span>
                {billingPeriod === 'annual' && (
                  <div className="text-[11px] text-emerald-400 font-medium mt-1">Billed annually ($114/yr)</div>
                )}
              </div>
              <ul className="space-y-3 text-xs text-slate-200">
                <li className="flex items-center space-x-2 font-semibold">
                  <Check className="h-4 w-4 text-cyan-400 shrink-0" />
                  <span>Unlimited Universal AI queries</span>
                </li>
                <li className="flex items-center space-x-2 font-semibold">
                  <Check className="h-4 w-4 text-cyan-400 shrink-0" />
                  <span>Multimodal PDF, image, diagram OCR solving</span>
                </li>
                <li className="flex items-center space-x-2 font-semibold">
                  <Check className="h-4 w-4 text-cyan-400 shrink-0" />
                  <span>Advanced mathematical rigor & proofs (KaTeX)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-cyan-400 shrink-0" />
                  <span>Priority Live Classroom FIFO queue</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-cyan-400 shrink-0" />
                  <span>Pinned discussions & searchable history</span>
                </li>
              </ul>
            </div>

            <div className="mt-8">
              <Button
                className="w-full bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white font-bold text-xs py-2.5 shadow-glow-violet"
                onClick={onOpenUpgrade}
              >
                <span>Upgrade to Pro Now</span>
                <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
              </Button>
            </div>
          </div>

          {/* Campus Enterprise */}
          <div className="neo-glass-card rounded-2xl p-7 border border-white/10 flex flex-col justify-between hover:border-cyan-500/30 transition-all">
            <div>
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center space-x-1.5">
                  <Building2 className="h-4 w-4 text-cyan-400" />
                  <h3 className="text-lg font-bold text-white">Campus Enterprise</h3>
                </div>
                <Badge variant="cyan" className="text-[10px] font-mono">Institutions</Badge>
              </div>
              <p className="text-xs text-slate-400 mb-6">Department-wide deployment for colleges, professors, and teaching assistants.</p>
              <div className="mb-6 font-mono">
                <span className="text-4xl font-black text-white">
                  {billingPeriod === 'monthly' ? '$499' : '$399'}
                </span>
                <span className="text-xs text-slate-400 ml-1">/ month</span>
                <div className="text-[11px] text-cyan-400 font-medium mt-1">Per academic department</div>
              </div>
              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-cyan-400 shrink-0" />
                  <span>Unlimited student & faculty accounts</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-cyan-400 shrink-0" />
                  <span>Institutional Admin Console & RBAC</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-cyan-400 shrink-0" />
                  <span>Cohort bottleneck & difficulty analytics</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-cyan-400 shrink-0" />
                  <span>Dedicated live classroom queue routing</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-cyan-400 shrink-0" />
                  <span>99.9% uptime SLA & dedicated manager</span>
                </li>
              </ul>
            </div>

            <div className="mt-8">
              <Button
                variant="outline"
                className="w-full text-xs border-cyan-500/40 text-cyan-300 hover:bg-cyan-950/40"
                onClick={onOpenUpgrade}
              >
                Contact Campus Sales
              </Button>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
