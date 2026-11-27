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
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        
        {/* Brand Logo */}
        <div
          className="flex items-center space-x-3 cursor-pointer group"
          onClick={() => handleNavClick('landing')}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 text-white shadow-glow-violet transition-transform group-hover:scale-105">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                DoubtX AI
              </span>
              <Badge variant="purple" className="text-[10px] font-bold tracking-wider py-0 px-1.5 uppercase">
                v2.5
              </Badge>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block">
              Universal Academic Intelligence & Live Queue
            </p>
          </div>
        </div>

        {/* Desktop View Switcher Navigation */}
        <nav className="hidden md:flex items-center space-x-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
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
          <div className="hidden lg:flex items-center space-x-1.5 text-xs text-slate-400 bg-slate-900/80 px-2.5 py-1 rounded-full border border-slate-800">
            <Radio className={`h-3 w-3 ${isConnected ? 'text-emerald-400 animate-pulse' : 'text-amber-400'}`} />
            <span className="text-[11px] font-medium">{isConnected ? 'Live Sync' : 'Connecting...'}</span>
          </div>

          {/* Subscription Tier Button / Pill */}
          {isAuthenticated && (
            <button
              onClick={onOpenUpgrade}
              className={`flex items-center space-x-1 text-xs px-2.5 py-1 rounded-full border transition-all ${
                tier === 'campus'
                  ? 'bg-cyan-950/60 border-cyan-700/60 text-cyan-300'
                  : tier === 'pro'
                  ? 'bg-purple-950/60 border-purple-700/60 text-purple-300'
                  : 'bg-indigo-950/40 border-indigo-800/50 text-indigo-300 hover:bg-indigo-900/60'
              }`}
            >
              <Zap className="h-3 w-3 text-amber-400" />
              <span className="font-bold text-[10px] uppercase tracking-wider">{tier}</span>
              {tier === 'free' && (
                <span className="hidden sm:inline text-[10px] text-indigo-400 ml-1 font-semibold underline">Upgrade</span>
              )}
            </button>
          )}

          {/* Auth Button or User Profile */}
          {isAuthenticated && user ? (
            <div className="flex items-center space-x-3">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-semibold text-white leading-tight">{user.full_name}</div>
                <div className="text-[10px] capitalize text-slate-400 font-mono">{user.role}</div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={logout}
                title="Sign Out"
                className="h-8 w-8 text-slate-400 hover:text-red-400 hover:bg-slate-900"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                onClick={onOpenAuth}
                className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
              >
                <UserIcon className="h-3.5 w-3.5 mr-1.5" />
                Sign In
              </Button>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

        </div>

      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950 px-4 py-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center space-x-2.5 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
          <div className="pt-2 border-t border-slate-800 mt-2 flex justify-between items-center text-xs text-slate-400">
            <span className="flex items-center space-x-1.5">
              <Radio className={`h-3 w-3 ${isConnected ? 'text-emerald-400' : 'text-amber-400'}`} />
              <span>{isConnected ? 'Real-Time Live' : 'Connecting...'}</span>
            </span>
            <button
              onClick={() => {
                onOpenUpgrade();
                setMobileMenuOpen(false);
              }}
              className="text-indigo-400 font-semibold"
            >
              Subscription Plans
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
