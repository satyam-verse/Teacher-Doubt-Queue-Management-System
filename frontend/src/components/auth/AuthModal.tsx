import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import type { Role } from '../../types';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { X, Lock, Mail, User as UserIcon, Loader2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, register } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<Role>('teacher');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isSignUp) {
        await register(email, password, fullName, role);
      } else {
        await login(email, password);
      }
      onClose();
    } catch (err: any) {
      console.error('Auth error:', err);
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (!err.response) {
        setError('Cannot reach DoubtX backend. Please ensure the backend is running on http://localhost:5000.');
      } else {
        setError('Authentication failed. Please verify credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-2xl neo-glass-card bg-navy-950/95 shadow-2xl border border-white/10 p-6 space-y-4">
        
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-lg text-white">
            {isSignUp ? 'Create DoubtX Account' : 'Sign In to DoubtX'}
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-950/70 text-rose-200 text-xs border border-rose-500/40 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {isSignUp && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-3 h-4 w-4 text-cyan-400" />
                <Input
                  className="pl-9 bg-navy-900 border-white/10 text-white placeholder-slate-500 focus:border-cyan-500"
                  placeholder="e.g. Prof. Satyam Kumar"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required={isSignUp}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-cyan-400" />
              <Input
                type="email"
                className="pl-9 bg-navy-900 border-white/10 text-white placeholder-slate-500 focus:border-cyan-500"
                placeholder="name@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-cyan-400" />
              <Input
                type="password"
                className="pl-9 bg-navy-900 border-white/10 text-white placeholder-slate-500 focus:border-cyan-500"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {isSignUp && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Role
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('teacher')}
                  className={`p-2 text-xs font-semibold rounded-lg border text-center transition-all ${
                    role === 'teacher'
                      ? 'border-cyan-500/60 bg-cyan-950/60 text-cyan-300'
                      : 'border-white/10 text-slate-400 bg-navy-900 hover:text-white'
                  }`}
                >
                  Teacher / TA
                </button>
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`p-2 text-xs font-semibold rounded-lg border text-center transition-all ${
                    role === 'student'
                      ? 'border-violet-500/60 bg-violet-950/60 text-violet-300'
                      : 'border-white/10 text-slate-400 bg-navy-900 hover:text-white'
                  }`}
                >
                  Student
                </button>
              </div>
            </div>
          )}

          <Button type="submit" disabled={isLoading} className="w-full mt-3 bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white font-bold shadow-glow-cyan">
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isSignUp ? (
              'Create Account'
            ) : (
              'Sign In'
            )}
          </Button>
        </form>

        <div className="text-center pt-2 border-t border-white/10">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
            }}
            className="text-xs text-cyan-400 hover:text-cyan-300 hover:underline font-medium"
          >
            {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>

      </div>
    </div>
  );
};
