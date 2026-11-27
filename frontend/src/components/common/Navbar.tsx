import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Sparkles, Radio, User as UserIcon, LogOut, GraduationCap, LayoutDashboard } from 'lucide-react';

interface NavbarProps {
  currentTab: 'student' | 'teacher';
  setCurrentTab: (tab: 'student' | 'teacher') => void;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab, onOpenAuth }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { isConnected } = useSocket();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        
        {/* Brand Logo */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentTab('student')}>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 text-white shadow-md shadow-indigo-500/20">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                DoubtX AI
              </span>
              <Badge variant="purple" className="text-[10px] uppercase font-bold tracking-wider py-0 px-1.5">
                v2.0
              </Badge>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Real-Time Intelligent Classroom Queue
            </p>
          </div>
        </div>

        {/* View Switcher Navigation */}
        <nav className="flex items-center space-x-2 bg-slate-100 p-1 rounded-xl dark:bg-slate-800/80">
          <button
            onClick={() => setCurrentTab('student')}
            className={`flex items-center space-x-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              currentTab === 'student'
                ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-900 dark:text-indigo-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <GraduationCap className="h-4 w-4" />
            <span>Student Portal</span>
          </button>
          
          <button
            onClick={() => setCurrentTab('teacher')}
            className={`flex items-center space-x-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              currentTab === 'teacher'
                ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-900 dark:text-indigo-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Teacher Console</span>
          </button>
        </nav>

        {/* Status & User Profile */}
        <div className="flex items-center space-x-4">
          {/* Socket.IO Connection Pill */}
          <div className="hidden sm:flex items-center space-x-1.5 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 px-2.5 py-1 rounded-full border border-slate-200/60 dark:border-slate-700/60">
            <Radio className={`h-3 w-3 ${isConnected ? 'text-emerald-500 animate-pulse' : 'text-amber-500'}`} />
            <span>{isConnected ? 'Live Sync' : 'Connecting...'}</span>
          </div>

          {isAuthenticated && user ? (
            <div className="flex items-center space-x-3">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-semibold text-slate-900 dark:text-white">{user.full_name}</div>
                <div className="text-[10px] capitalize text-slate-500">{user.role}</div>
              </div>
              <Button variant="ghost" size="icon" onClick={logout} title="Sign Out" className="h-8 w-8 text-slate-500 hover:text-red-600">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button size="sm" onClick={onOpenAuth} className="text-xs">
              <UserIcon className="h-3.5 w-3.5 mr-1.5" />
              Sign In
            </Button>
          )}
        </div>

      </div>
    </header>
  );
};
