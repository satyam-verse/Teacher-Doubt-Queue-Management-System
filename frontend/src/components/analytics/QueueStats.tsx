import React from 'react';
import type { QueueStats as QueueStatsType } from '../../types';
import { Users, Clock, CheckCircle2, Flame } from 'lucide-react';

interface QueueStatsProps {
  stats: QueueStatsType;
  avgWaitMinutes?: number;
}

export const QueueStats: React.FC<QueueStatsProps> = ({ stats, avgWaitMinutes = 0 }) => {
  const items = [
    {
      label: 'Waiting in Queue',
      value: stats.queued,
      icon: Users,
      color: 'text-amber-400',
      bgColor: 'bg-amber-950/70 border border-amber-500/30',
      borderColor: 'border-white/10',
    },
    {
      label: 'Being Attended',
      value: stats.in_progress,
      icon: Flame,
      color: 'text-violet-400',
      bgColor: 'bg-violet-950/70 border border-violet-500/30',
      borderColor: 'border-white/10',
    },
    {
      label: 'Resolved Today',
      value: stats.resolved,
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-950/70 border border-emerald-500/30',
      borderColor: 'border-white/10',
    },
    {
      label: 'Estimated Wait',
      value: avgWaitMinutes > 0 ? `~${avgWaitMinutes} min` : '0 min',
      icon: Clock,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-950/70 border border-cyan-500/30',
      borderColor: 'border-white/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div key={idx} className="neo-glass-card rounded-2xl border border-white/10 p-5 flex items-center justify-between shadow-xl">
            <div>
              <p className="text-xs font-medium text-slate-400">
                {item.label}
              </p>
              <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-mono mt-1">
                {item.value}
              </p>
            </div>
            <div className={`p-3 rounded-xl ${item.bgColor} ${item.color} shadow-sm`}>
              <Icon className="h-5 w-5" />
            </div>
          </div>
        );
      })}
    </div>
  );
};
