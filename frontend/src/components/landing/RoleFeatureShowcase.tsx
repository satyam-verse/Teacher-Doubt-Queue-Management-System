import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  GraduationCap,
  LayoutDashboard,
  ShieldCheck,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import type { ViewMode } from '../../types';

interface RoleFeatureShowcaseProps {
  onNavigate: (view: ViewMode) => void;
}

export const RoleFeatureShowcase: React.FC<RoleFeatureShowcaseProps> = ({ onNavigate }) => {
  const [activeRole, setActiveRole] = useState<'student' | 'teacher' | 'admin'>('student');

  const roleDetails = {
    student: {
      title: 'Student Learning Workspace',
      badge: 'Empowering Learners',
      badgeColor: 'border-indigo-500/30 text-indigo-300',
      description: 'Master complex academic topics with adaptive step-by-step reasoning, multimodal diagram analysis, and real-time classroom queue visibility.',
      features: [
        'Adaptive explanations tailored to Beginner, Intermediate, or Advanced rigor',
        'Direct PDF, homework screenshot, and handwritten diagram OCR parsing',
        'Synchronized live queue position and estimated wait time countdown',
        'Mathematical derivations rendered in crisp KaTeX and syntax-highlighted code',
        'Full conversation history with search and discussion pinning'
      ],
      ctaText: 'Enter Student Portal',
      targetView: 'student-dashboard' as ViewMode,
      cardColor: 'from-indigo-950/40 via-slate-900 to-slate-950 border-indigo-500/30'
    },
    teacher: {
      title: 'Teacher Live Queue Console',
      badge: 'Optimizing Classrooms',
      badgeColor: 'border-purple-500/30 text-purple-300',
      description: 'Streamline classroom doubt handling during live lectures with an intelligent FIFO queue, automatic AI pre-diagnosis, and fast 1-click claims.',
      features: [
        'Real-time WebSocket Kanban queue (Queued, In Progress, Resolved)',
        'Automatic AI pre-analysis highlighting core student misconceptions',
        'One-click Claim & Resolution with notes and AI-suggested solutions',
        'Classroom session join code management (DX-CS101) with active state toggles',
        'Resolution velocity metrics tracking average turnaround time in minutes'
      ],
      ctaText: 'Launch Teacher Console',
      targetView: 'teacher-console' as ViewMode,
      cardColor: 'from-purple-950/40 via-slate-900 to-slate-950 border-purple-500/30'
    },
    admin: {
      title: 'Institutional Admin Command',
      badge: 'Institutional Governance',
      badgeColor: 'border-cyan-500/30 text-cyan-300',
      description: 'Empower deans and department heads with institution-wide visibility, role management, subscription licensing, and system health telemetry.',
      features: [
        'Departmental user directory with live role switcher (Student, Teacher, Admin)',
        'SaaS subscription licensing management (Free, Pro, Campus tiers)',
        'Classroom queue load and AI token volume analytics',
        'Deep system health diagnostics across DB, Gemini AI API, and WebSockets',
        'Identification of academic subject bottlenecks and difficult topics'
      ],
      ctaText: 'View Admin Dashboard',
      targetView: 'admin-console' as ViewMode,
      cardColor: 'from-cyan-950/40 via-slate-900 to-slate-950 border-cyan-500/30'
    }
  };

  const current = roleDetails[activeRole];

  return (
    <section className="py-20 md:py-28 bg-navy-950 border-b border-white/10 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <Badge variant="cyan" className="mb-3 text-[10px] font-mono font-bold tracking-widest uppercase">
            Tailored Experiences
          </Badge>
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Architected for Every Academic Stakeholder
          </h2>
          <p className="mt-3 text-sm text-slate-400">
            Switch views to discover tailored interfaces engineered specifically for students, professors, and institutional deans.
          </p>

          {/* Role Toggle Buttons */}
          <div className="mt-8 inline-flex items-center rounded-xl bg-navy-900 p-1.5 border border-white/10 shadow-inner">
            <button
              onClick={() => setActiveRole('student')}
              className={`flex items-center space-x-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeRole === 'student' ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <GraduationCap className="h-4 w-4" />
              <span>For Students</span>
            </button>

            <button
              onClick={() => setActiveRole('teacher')}
              className={`flex items-center space-x-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeRole === 'teacher' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>For Teachers</span>
            </button>

            <button
              onClick={() => setActiveRole('admin')}
              className={`flex items-center space-x-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeRole === 'admin' ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="h-4 w-4" />
              <span>For Institutional Admins</span>
            </button>
          </div>
        </div>

        {/* Feature Showcase Card */}
        <div className="max-w-4xl mx-auto rounded-2xl neo-glass-card border border-white/10 p-6 sm:p-10 shadow-2xl transition-all relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-white/10">
            <div>
              <Badge variant="outline" className={`text-[10px] font-mono mb-2 ${current.badgeColor}`}>
                {current.badge}
              </Badge>
              <h3 className="text-2xl font-bold text-white">{current.title}</h3>
              <p className="mt-1 text-xs sm:text-sm text-slate-300 max-w-xl">
                {current.description}
              </p>
            </div>
            <Button
              onClick={() => onNavigate(current.targetView)}
              className="bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs px-5 py-2.5 rounded-xl shrink-0 shadow-lg"
            >
              <span>{current.ctaText}</span>
              <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
            </Button>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            {current.features.map((feat, idx) => (
              <div key={idx} className="flex items-start space-x-3 p-3.5 rounded-xl bg-navy-950/70 border border-white/10 shadow-sm">
                <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                <span className="text-xs text-slate-200 leading-relaxed font-medium">{feat}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
