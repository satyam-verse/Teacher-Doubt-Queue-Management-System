import React from 'react';
import { Sparkles } from 'lucide-react';
import type { ViewMode } from '../../types';

interface SaaSFooterProps {
  onNavigate: (view: ViewMode) => void;
  onOpenUpgrade: () => void;
}

export const SaaSFooter: React.FC<SaaSFooterProps> = ({ onNavigate, onOpenUpgrade }) => {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-900 pt-16 pb-12">
      <div className="container mx-auto px-4 sm:px-6">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-900">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-glow-violet">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">DoubtX AI</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Universal Academic Intelligence & Synchronized Real-Time Classroom Doubt Queue Management for Higher Education.
            </p>
            {/* Live System Status Pill */}
            <div className="inline-flex items-center space-x-2 text-[11px] bg-slate-900 px-3 py-1.5 rounded-full border border-slate-800">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-300 font-medium">All Systems Operational</span>
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Product</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('ai-solver')} className="hover:text-white transition">
                  Universal AI Workspace
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('student-dashboard')} className="hover:text-white transition">
                  Student Learning Portal
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('teacher-console')} className="hover:text-white transition">
                  Teacher Live Queue
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('admin-console')} className="hover:text-white transition">
                  Institutional Admin
                </button>
              </li>
              <li>
                <button onClick={onOpenUpgrade} className="hover:text-white transition">
                  SaaS Subscription Plans
                </button>
              </li>
            </ul>
          </div>

          {/* Capabilities */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Capabilities</h4>
            <ul className="space-y-2 text-xs">
              <li>Computer Science & Systems</li>
              <li>Advanced Mathematical Proofs</li>
              <li>Biomedical & Genetics Analysis</li>
              <li>Multimodal PDF & Image OCR</li>
              <li>KaTeX LaTeX Mathematical Notation</li>
              <li>Sub-Second WebSocket Synchronization</li>
            </ul>
          </div>

          {/* Infrastructure & Security */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Security & Cloud</h4>
            <ul className="space-y-2 text-xs">
              <li>Google Gemini 2.5 Intelligence</li>
              <li>AWS S3 Presigned Uploads</li>
              <li>Role-Based Access Control (RBAC)</li>
              <li>JWT Authentication & Refresh</li>
              <li>MySQL & SQLAlchemy Engine</li>
              <li>Privacy & Data Integrity</li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div>
            &copy; {new Date().getFullYear()} DoubtX AI Inc. All rights reserved.
          </div>
          <div className="flex items-center space-x-1">
            <span>Built with precision for modern higher education.</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
