import React, { useState } from 'react';
import type { Doubt } from '../../types';
import { Card, CardHeader, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { formatTimeAgo } from '../../lib/utils';
import { Sparkles, Clock, CheckCircle2, ChevronDown, ChevronUp, Bell, ExternalLink } from 'lucide-react';

interface QueueCardProps {
  doubt: Doubt;
}

export const QueueCard: React.FC<QueueCardProps> = ({ doubt }) => {
  const [showAiHint, setShowAiHint] = useState(true);

  const isAttended = doubt.status === 'IN_PROGRESS';
  const isResolved = doubt.status === 'RESOLVED';

  return (
    <Card className={`border-2 transition-all ${
      isAttended
        ? 'border-indigo-500 shadow-lg shadow-indigo-500/10 bg-indigo-50/20 dark:bg-indigo-950/20'
        : isResolved
        ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20'
        : 'border-slate-200 dark:border-slate-800'
    }`}>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-semibold text-slate-900 dark:text-white">
              {doubt.student_name}'s Question
            </span>
            <span className="text-xs text-slate-500">
              {formatTimeAgo(doubt.created_at)}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {isAttended ? (
              <Badge variant="purple" className="animate-pulse flex items-center space-x-1">
                <Bell className="h-3 w-3 mr-1" /> Teacher Attending Now!
              </Badge>
            ) : isResolved ? (
              <Badge variant="success" className="flex items-center space-x-1">
                <CheckCircle2 className="h-3 w-3 mr-1" /> Resolved
              </Badge>
            ) : (
              <Badge variant="warning" className="flex items-center space-x-1">
                <Clock className="h-3 w-3 mr-1" /> Queue Position #{doubt.queue_position || 1}
              </Badge>
            )}

            <Badge variant="outline">{doubt.category}</Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Question Text */}
        <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
          {doubt.doubt}
        </div>

        {/* Attachment preview if available */}
        {doubt.attachment_url && (
          <div className="flex items-center space-x-2 text-xs text-indigo-600 dark:text-indigo-400">
            <ExternalLink className="h-3.5 w-3.5" />
            <a href={doubt.attachment_url} target="_blank" rel="noopener noreferrer" className="hover:underline font-medium">
              View Attached Screenshot / Code (AWS S3)
            </a>
          </div>
        )}

        {/* Dynamic Queue Status Alert Banner */}
        {isAttended ? (
          <div className="p-3.5 rounded-xl bg-indigo-600 text-white flex items-start space-x-3 shadow-sm">
            <Bell className="h-5 w-5 mt-0.5 flex-shrink-0 animate-bounce" />
            <div>
              <p className="font-semibold text-sm">It's your turn!</p>
              <p className="text-xs text-indigo-100 mt-0.5">
                {doubt.resolver_name ? `${doubt.resolver_name} is assisting you.` : 'Your teacher is actively reviewing your doubt.'}
              </p>
            </div>
          </div>
        ) : isResolved ? (
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-800 dark:text-emerald-300">
            <p className="font-semibold text-sm flex items-center">
              <CheckCircle2 className="h-4 w-4 mr-1.5" /> Doubt Resolved
            </p>
            {doubt.resolution_notes && (
              <p className="text-xs mt-1 text-slate-600 dark:text-slate-300">
                <strong>Teacher Notes:</strong> {doubt.resolution_notes}
              </p>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40 text-xs text-amber-900 dark:text-amber-300">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-amber-600 flex-shrink-0" />
              <span>
                Estimated wait time: <strong>~{doubt.estimated_wait_minutes || 3} minutes</strong>
              </span>
            </div>
            <span className="text-[11px] text-slate-500">
              Spot locked in queue
            </span>
          </div>
        )}

        {/* Gemini AI Hint Box */}
        {doubt.ai_hint && (
          <div className="rounded-xl border border-purple-200/80 bg-purple-50/50 dark:border-purple-900/40 dark:bg-purple-950/20 overflow-hidden">
            <button
              onClick={() => setShowAiHint(!showAiHint)}
              className="w-full flex items-center justify-between p-3 text-left hover:bg-purple-100/50 dark:hover:bg-purple-900/30 transition-colors"
            >
              <div className="flex items-center space-x-2">
                <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <span className="text-xs font-semibold text-purple-900 dark:text-purple-300">
                  Gemini AI Instant Hint (Try this while waiting)
                </span>
              </div>
              {showAiHint ? (
                <ChevronUp className="h-4 w-4 text-purple-600" />
              ) : (
                <ChevronDown className="h-4 w-4 text-purple-600" />
              )}
            </button>

            {showAiHint && (
              <div className="p-3 pt-0 text-xs text-slate-700 dark:text-slate-300 leading-relaxed border-t border-purple-100 dark:border-purple-900/30">
                <p className="italic bg-white/70 dark:bg-slate-900/50 p-2.5 rounded-lg mt-2">
                  "{doubt.ai_hint}"
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2">
                  💡 Deflection Hint: Try fixing this clue. If you resolve it yourself, let your teacher know!
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
