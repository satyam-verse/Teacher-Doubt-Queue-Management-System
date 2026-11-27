import React from 'react';
import type { QueueStats as QueueStatsType } from '../../types';
import { Card, CardContent } from '../ui/card';
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
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-950/30',
      borderColor: 'border-amber-200 dark:border-amber-800/40',
    },
    {
      label: 'Being Attended',
      value: stats.in_progress,
      icon: Flame,
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950/30',
      borderColor: 'border-indigo-200 dark:border-indigo-800/40',
    },
    {
      label: 'Resolved Today',
      value: stats.resolved,
      icon: CheckCircle2,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
      borderColor: 'border-emerald-200 dark:border-emerald-800/40',
    },
    {
      label: 'Estimated Wait',
      value: avgWaitMinutes > 0 ? `~${avgWaitMinutes} min` : 'No Wait',
      icon: Clock,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-950/30',
      borderColor: 'border-purple-200 dark:border-purple-800/40',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((item, idx) => {
        const Icon = item.icon;
        return (
          <Card key={idx} className={`border ${item.borderColor} shadow-sm overflow-hidden`}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {item.label}
                </p>
                <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
                  {item.value}
                </p>
              </div>
              <div className={`p-3 rounded-xl ${item.bgColor} ${item.color}`}>
                <Icon className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
