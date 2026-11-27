import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Sparkles,
  Radio,
  User as UserIcon,
  LogOut,
  GraduationCap,
  LayoutDashboard,
  ShieldCheck,
  Bot,
  Zap,
  Menu,
  X,
  Home
} from 'lucide-react';
import type { ViewMode, SubscriptionTier } from '../../types';

interface NeoNavbarProps {
  currentView: ViewMode;
  setCurrentView: (view: ViewMode) => void;
  onOpenAuth: () => void;
  onOpenUpgrade: () => void;
}

export const NeoNavbar: React.FC<NeoNavbarProps> = ({
  currentView,
  setCurrentView,
  onOpenAuth,
  onOpenUpgrade
}) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { isConnected } = useSocket();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const tier: SubscriptionTier = user?.subscription_tier || 'free';

  const navItems = [
    { id: 'landing' as ViewMode, label: 'Overview', icon: Home },
    { id: 'ai-solver' as ViewMode, label: 'AI Workspace', icon: Bot },
    { id: 'student-dashboard' as ViewMode, label: 'Student Portal', icon: GraduationCap },
    { id: 'teacher-console' as ViewMode, label: 'Teacher Queue', icon: LayoutDashboard },
    ...(user?.role === 'admin'
      ? [{ id: 'admin-console' as ViewMode, label: 'Admin Console', icon: ShieldCheck }]
      : [])
  ];

  const handleNavClick = (view: ViewMode) => {
    setCurrentView(view);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-navy-950/85 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        
        {/* Brand Logo */}
        <div
          className="flex items-center space-x-3 cursor-pointer group"
          onClick={() => handleNavClick('landing')}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-500 text-white shadow-glow-violet transition-all duration-300 group-hover:scale-105 group-hover:shadow-glow-cyan">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-300 bg-clip-text text-transparent">
                DoubtX AI
              </span>
              <Badge variant="cyan" className="text-[9px] font-mono font-bold tracking-widest py-0 px-1.5 uppercase border-cyan-500/40">
                Neo Academic
              </Badge>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block font-mono tracking-tight">
              Universal Intelligence & Live Queue Matrix
            </p>
          </div>
        </div>

        {/* Desktop View Switcher Navigation */}
        <nav className="hidden md:flex items-center space-x-1 bg-navy-900/90 p-1.5 rounded-xl border border-white/10 shadow-inner">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-violet-600 to-cyan-600 text-white shadow-md shadow-violet-600/30'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.06]'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Section: Subscription, Live Status, Profile */}
        <div className="flex items-center space-x-3">
          
          {/* Socket.IO Live Status Pill */}
          <div className="hidden lg:flex items-center space-x-1.5 text-xs text-slate-400 bg-navy-900/90 px-3 py-1 rounded-full border border-white/10 font-mono">
            <Radio className={`h-3 w-3 ${isConnected ? 'text-emerald-400 animate-pulse' : 'text-amber-400'}`} />
            <span className="text-[11px] font-medium">{isConnected ? 'Live Sync' : 'Connecting...'}</span>
          </div>

          {/* Subscription Tier Button / Pill */}
          {isAuthenticated && (
            <button
              onClick={onOpenUpgrade}
              className={`flex items-center space-x-1 text-xs px-2.5 py-1 rounded-full border transition-all ${
                tier === 'campus'
                  ? 'bg-cyan-950/70 border-cyan-500/50 text-cyan-300 hover:border-cyan-400 shadow-glow-cyan'
                  : tier === 'pro'
                  ? 'bg-purple-950/70 border-purple-500/50 text-purple-300 hover:border-purple-400 shadow-glow-violet'
                  : 'bg-navy-900 border-white/10 text-slate-300 hover:bg-navy-800'
              }`}
            >
              <Zap className="h-3 w-3 text-amber-400" />
              <span className="font-mono font-bold text-[10px] uppercase tracking-wider">{tier}</span>
              {tier === 'free' && (
                <span className="hidden sm:inline text-[10px] text-cyan-400 ml-1 font-semibold underline">Upgrade</span>
              )}
            </button>
          )}

          {/* Auth Button or User Profile */}
          {isAuthenticated && user ? (
            <div className="flex items-center space-x-3">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-semibold text-white leading-tight">{user.full_name}</div>
                <div className="text-[10px] capitalize text-cyan-400/90 font-mono">{user.role}</div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={logout}
                title="Sign Out"
                className="h-8 w-8 text-slate-400 hover:text-red-400 hover:bg-navy-900"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                onClick={onOpenAuth}
                className="text-xs bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white shadow-glow-violet font-semibold"
              >
                <UserIcon className="h-3.5 w-3.5 mr-1.5" />
                Sign In
              </Button>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-navy-900"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

        </div>

      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-navy-950 px-4 py-3 space-y-1 backdrop-blur-xl">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center space-x-2.5 px-3 py-2 text-sm font-semibold rounded-lg transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-violet-600 to-cyan-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-navy-900'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
          <div className="pt-2 border-t border-white/10 mt-2 flex justify-between items-center text-xs text-slate-400">
            <span className="flex items-center space-x-1.5 font-mono">
              <Radio className={`h-3 w-3 ${isConnected ? 'text-emerald-400' : 'text-amber-400'}`} />
              <span>{isConnected ? 'Real-Time Live' : 'Connecting...'}</span>
            </span>
            <button
              onClick={() => {
                onOpenUpgrade();
                setMobileMenuOpen(false);
              }}
              className="text-cyan-400 font-semibold"
            >
              Subscription Plans
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
