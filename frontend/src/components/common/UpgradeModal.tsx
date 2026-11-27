import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { Check, Zap, Building2, X, ArrowRight, Loader2, KeyRound } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import type { SubscriptionTier } from '../../types';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (tier: SubscriptionTier) => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { user, token } = useAuth();
  const [selectedBilling, setSelectedBilling] = useState<'monthly' | 'annual'>('monthly');
  const [loadingTier, setLoadingTier] = useState<SubscriptionTier | null>(null);
  const [licenseKey, setLicenseKey] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleUpgrade = async (tier: SubscriptionTier) => {
    if (!token) {
      setErrorMsg('Please sign in or create an account to upgrade your subscription.');
      return;
    }

    setLoadingTier(tier);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const response = await api.post('/api/v1/auth/subscription/upgrade', {
        tier,
        license_key: licenseKey.trim()
      });

      if (response.status === 200) {
        setSuccessMsg(response.data.message || `Welcome to DoubtX ${tier.toUpperCase()}! Your account has been upgraded with instant access.`);
        if (onSuccess) {
          onSuccess(tier);
        }
        setTimeout(() => {
          onClose();
          setSuccessMsg(null);
        }, 1500);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.error || err.message || 'An error occurred during upgrade.';
      setErrorMsg(msg);
    } finally {
      setLoadingTier(null);
    }
  };

  const currentTier = user?.subscription_tier || 'free';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl rounded-2xl neo-glass-card bg-navy-950/95 border border-white/10 text-slate-100 shadow-2xl overflow-hidden p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-navy-900 transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <Badge variant="cyan" className="mb-3 px-3 py-1 font-mono font-bold text-[10px] tracking-widest uppercase">
            SaaS Subscription
          </Badge>
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Choose the Power of <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">Universal Intelligence</span>
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            From individual STEM students to entire university computer science and medical faculties.
          </p>

          {/* License Key Input Option */}
          <div className="mt-5 max-w-md mx-auto p-3 rounded-xl bg-navy-900/80 border border-white/10 text-left">
            <label className="text-[11px] font-mono text-slate-400 flex items-center space-x-1.5 mb-1.5">
              <KeyRound className="h-3.5 w-3.5 text-cyan-400" />
              <span>Have an institutional license key?</span>
            </label>
            <input
              type="text"
              placeholder="e.g. CAMPUS-XXXX-YYYY"
              value={licenseKey}
              onChange={(e) => setLicenseKey(e.target.value)}
              className="w-full bg-navy-950 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          {/* Error & Success Messages */}
          {errorMsg && (
            <div className="mt-4 p-3 rounded-xl bg-amber-950/70 border border-amber-500/40 text-amber-200 text-xs font-medium">
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="mt-4 p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-200 text-xs font-medium">
              {successMsg}
            </div>
          )}

          {/* Billing Toggle */}
          <div className="mt-6 inline-flex items-center rounded-xl bg-navy-900 p-1 border border-white/10">
            <button
              onClick={() => setSelectedBilling('monthly')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                selectedBilling === 'monthly' ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setSelectedBilling('annual')}
              className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center space-x-1 ${
                selectedBilling === 'annual' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Annual</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-1.5 py-0.5 rounded">SAVE 20%</span>
            </button>
          </div>
        </div>

        {/* Status Alerts */}
        {errorMsg && (
          <div className="mb-6 p-3 rounded-lg bg-red-950/60 border border-red-800/60 text-red-300 text-xs text-center">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="mb-6 p-3 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs text-center font-medium">
            {successMsg}
          </div>
        )}

        {/* Plan Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Plan 1: Free Starter */}
          <div className={`rounded-xl p-6 border flex flex-col justify-between transition-all ${
            currentTier === 'free' ? 'border-indigo-500/50 bg-slate-900/60' : 'border-slate-800/80 bg-slate-900/30'
          }`}>
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-lg text-white">Starter</h3>
                {currentTier === 'free' && (
                  <Badge variant="outline" className="border-indigo-500 text-indigo-400 text-[10px]">
                    Current Plan
                  </Badge>
                )}
              </div>
              <p className="text-xs text-slate-400 mb-4">Essential assistance for daily coursework and simple homework.</p>
              <div className="mb-6">
                <span className="text-3xl font-extrabold text-white">$0</span>
                <span className="text-xs text-slate-400 ml-1">/ forever</span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-300">
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
                  <span>Standard LaTeX & Code syntax</span>
                </li>
                <li className="flex items-center space-x-2 text-slate-500">
                  <X className="h-4 w-4 text-slate-600 shrink-0" />
                  <span>Multimodal PDF / Diagram OCR</span>
                </li>
                <li className="flex items-center space-x-2 text-slate-500">
                  <X className="h-4 w-4 text-slate-600 shrink-0" />
                  <span>Live Queue Teacher Priority</span>
                </li>
              </ul>
            </div>

            <div className="mt-8">
              <Button
                variant="outline"
                className="w-full text-xs"
                disabled={currentTier === 'free'}
                onClick={() => handleUpgrade('free')}
              >
                {currentTier === 'free' ? 'Active' : 'Downgrade to Free'}
              </Button>
            </div>
          </div>

          {/* Plan 2: DoubtX Pro (Highlighted) */}
          <div className="relative rounded-xl p-6 border-2 border-indigo-500 bg-gradient-to-b from-indigo-950/40 via-slate-900/60 to-slate-950 flex flex-col justify-between shadow-glow-violet">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-[10px] tracking-wider uppercase px-3 py-0.5">
                MOST POPULAR
              </Badge>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2 mt-1">
                <div className="flex items-center space-x-1.5">
                  <Zap className="h-4 w-4 text-amber-400" />
                  <h3 className="font-bold text-lg text-white">DoubtX Pro</h3>
                </div>
                {currentTier === 'pro' && (
                  <Badge variant="purple" className="text-[10px]">Active</Badge>
                )}
              </div>
              <p className="text-xs text-slate-400 mb-4">Unconstrained universal reasoning with multimodal support for serious students.</p>
              <div className="mb-6">
                <span className="text-3xl font-extrabold text-white">
                  {selectedBilling === 'monthly' ? '$12' : '$9.50'}
                </span>
                <span className="text-xs text-slate-400 ml-1">/ month</span>
                {selectedBilling === 'annual' && (
                  <span className="block text-[11px] text-emerald-400 mt-0.5">Billed annually ($114/year)</span>
                )}
              </div>
              <ul className="space-y-2.5 text-xs text-slate-200">
                <li className="flex items-center space-x-2 font-medium">
                  <Check className="h-4 w-4 text-indigo-400 shrink-0" />
                  <span>Unlimited Universal AI queries</span>
                </li>
                <li className="flex items-center space-x-2 font-medium">
                  <Check className="h-4 w-4 text-indigo-400 shrink-0" />
                  <span>Full Multimodal PDF, Image & Diagram solving</span>
                </li>
                <li className="flex items-center space-x-2 font-medium">
                  <Check className="h-4 w-4 text-indigo-400 shrink-0" />
                  <span>Advanced Mathematical Proofs (KaTeX)</span>
                </li>
                <li className="flex items-center space-x-2 font-medium">
                  <Check className="h-4 w-4 text-indigo-400 shrink-0" />
                  <span>Priority Live Classroom FIFO Queue</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-indigo-400 shrink-0" />
                  <span>Searchable history & Pinned discussions</span>
                </li>
              </ul>
            </div>

            <div className="mt-8">
              <Button
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold text-xs shadow-lg"
                disabled={loadingTier === 'pro' || currentTier === 'pro'}
                onClick={() => handleUpgrade('pro')}
              >
                {loadingTier === 'pro' ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                ) : currentTier === 'pro' ? (
                  'Active Plan'
                ) : (
                  <>
                    <span>Upgrade to Pro</span>
                    <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Plan 3: Campus Department */}
          <div className={`rounded-xl p-6 border flex flex-col justify-between transition-all ${
            currentTier === 'campus' ? 'border-cyan-500/50 bg-slate-900/60' : 'border-slate-800/80 bg-slate-900/30'
          }`}>
            <div>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center space-x-1.5">
                  <Building2 className="h-4 w-4 text-cyan-400" />
                  <h3 className="font-semibold text-lg text-white">Campus</h3>
                </div>
                {currentTier === 'campus' && (
                  <Badge variant="cyan" className="text-[10px]">Active</Badge>
                )}
              </div>
              <p className="text-xs text-slate-400 mb-4">Complete infrastructure for university departments, professors, and TAs.</p>
              <div className="mb-6">
                <span className="text-3xl font-extrabold text-white">
                  {selectedBilling === 'monthly' ? '$499' : '$399'}
                </span>
                <span className="text-xs text-slate-400 ml-1">/ month</span>
                <span className="block text-[11px] text-cyan-400 mt-0.5">Per department / cohort</span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-cyan-400 shrink-0" />
                  <span>Unlimited faculty & student seats</span>
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
                  <span>Dedicated Live Queue routing</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-cyan-400 shrink-0" />
                  <span>99.9% uptime SLA & priority support</span>
                </li>
              </ul>
            </div>

            <div className="mt-8">
              <Button
                variant="outline"
                className="w-full text-xs border-cyan-800 hover:bg-cyan-950/40 text-cyan-300"
                disabled={loadingTier === 'campus' || currentTier === 'campus'}
                onClick={() => handleUpgrade('campus')}
              >
                {loadingTier === 'campus' ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                ) : currentTier === 'campus' ? (
                  'Active Plan'
                ) : (
                  'Deploy Campus Edition'
                )}
              </Button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
