import React, { useState } from 'react';
import type { Doubt } from '../../types';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { formatTimeAgo } from '../../lib/utils';
import { AISuggestionModal } from './AISuggestionModal';
import { ResolveModal } from './ResolveModal';
import { 
  Users, 
  Flame, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  Paperclip,
  ExternalLink 
} from 'lucide-react';

interface LiveQueueKanbanProps {
  doubts: Doubt[];
  onClaimDoubt: (doubtId: number) => Promise<void>;
  onResolveDoubt: (doubtId: number, notes: string) => Promise<void>;
}

export const LiveQueueKanban: React.FC<LiveQueueKanbanProps> = ({
  doubts,
  onClaimDoubt,
  onResolveDoubt,
}) => {
  const [selectedAiDoubt, setSelectedAiDoubt] = useState<Doubt | null>(null);
  const [resolvingDoubt, setResolvingDoubt] = useState<Doubt | null>(null);

  const queuedDoubts = doubts.filter((d) => d.status === 'QUEUED');
  const inProgressDoubts = doubts.filter((d) => d.status === 'IN_PROGRESS');
  const resolvedDoubts = doubts.filter((d) => d.status === 'RESOLVED');

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* COLUMN 1: Waiting Queue (FIFO) */}
        <div className="flex flex-col rounded-2xl bg-slate-100/70 dark:bg-slate-900/40 p-4 border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-200/60 dark:border-slate-800">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-amber-600" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Waiting Queue
              </h3>
            </div>
            <Badge variant="warning">{queuedDoubts.length}</Badge>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[70vh] pr-1">
            {queuedDoubts.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                🎉 Queue is clear! No pending student doubts.
              </div>
            ) : (
              queuedDoubts.map((doubt, idx) => (
                <div
                  key={doubt.id}
                  className="rounded-xl bg-white dark:bg-slate-900 p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 text-[11px] font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                        {idx + 1}
                      </span>
                      <span className="font-semibold text-xs text-slate-900 dark:text-white">
                        {doubt.student_name}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {formatTimeAgo(doubt.created_at)}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-3">
                    {doubt.doubt}
                  </p>

                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <Badge variant="purple" className="text-[10px] py-0">
                      {doubt.category}
                    </Badge>
                    {doubt.priority === 'HIGH' || doubt.priority === 'URGENT' ? (
                      <Badge variant="destructive" className="text-[10px] py-0">
                        {doubt.priority}
                      </Badge>
                    ) : null}
                    {doubt.attachment_url && (
                      <a
                        href={doubt.attachment_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-indigo-600 hover:underline flex items-center"
                      >
                        <Paperclip className="h-3 w-3 mr-0.5" /> File
                      </a>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => setSelectedAiDoubt(doubt)}
                      className="text-[11px] text-purple-600 dark:text-purple-400 hover:text-purple-700 font-medium flex items-center"
                    >
                      <Sparkles className="h-3.5 w-3.5 mr-1" /> AI Suggestion
                    </button>

                    <Button
                      size="sm"
                      onClick={() => onClaimDoubt(doubt.id)}
                      className="h-7 text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      <span>Claim & Attend</span>
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* COLUMN 2: Currently Assisting */}
        <div className="flex flex-col rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 p-4 border border-indigo-100 dark:border-indigo-900/40">
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-indigo-100 dark:border-indigo-900/40">
            <div className="flex items-center space-x-2">
              <Flame className="h-4 w-4 text-indigo-600 animate-pulse" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                In Progress
              </h3>
            </div>
            <Badge variant="default">{inProgressDoubts.length}</Badge>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[70vh] pr-1">
            {inProgressDoubts.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                No doubts currently in progress. Claim one from the queue!
              </div>
            ) : (
              inProgressDoubts.map((doubt) => (
                <div
                  key={doubt.id}
                  className="rounded-xl bg-white dark:bg-slate-900 p-4 border-2 border-indigo-500 shadow-md space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-slate-900 dark:text-white">
                      {doubt.student_name}
                    </span>
                    <Badge variant="purple" className="text-[10px] animate-pulse">
                      Active
                    </Badge>
                  </div>

                  <p className="text-xs text-slate-800 dark:text-slate-200 font-medium">
                    {doubt.doubt}
                  </p>

                  {doubt.attachment_url && (
                    <div className="flex items-center text-xs text-indigo-600">
                      <ExternalLink className="h-3.5 w-3.5 mr-1" />
                      <a href={doubt.attachment_url} target="_blank" rel="noreferrer" className="hover:underline">
                        View Attached File
                      </a>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => setSelectedAiDoubt(doubt)}
                      className="text-[11px] text-purple-600 hover:text-purple-700 font-medium flex items-center"
                    >
                      <Sparkles className="h-3.5 w-3.5 mr-1" /> AI Solution
                    </button>

                    <Button
                      size="sm"
                      onClick={() => setResolvingDoubt(doubt)}
                      className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      <CheckCircle2 className="h-3 w-3 mr-1" /> Mark Resolved
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* COLUMN 3: Resolved Today */}
        <div className="flex flex-col rounded-2xl bg-slate-100/70 dark:bg-slate-900/40 p-4 border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-200/60 dark:border-slate-800">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Resolved Today
              </h3>
            </div>
            <Badge variant="success">{resolvedDoubts.length}</Badge>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[70vh] pr-1">
            {resolvedDoubts.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                No doubts resolved yet in this session.
              </div>
            ) : (
              resolvedDoubts.slice(0, 15).map((doubt) => (
                <div
                  key={doubt.id}
                  className="rounded-xl bg-white/80 dark:bg-slate-900/80 p-3.5 border border-slate-200/60 dark:border-slate-800 space-y-2 opacity-90"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-slate-900 dark:text-white">
                      {doubt.student_name}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {formatTimeAgo(doubt.resolved_at || doubt.created_at)}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 italic">
                    "{doubt.doubt}"
                  </p>

                  {doubt.resolution_notes && (
                    <div className="p-2 rounded bg-emerald-50 dark:bg-emerald-950/30 text-[11px] text-emerald-800 dark:text-emerald-300">
                      <strong>Notes:</strong> {doubt.resolution_notes}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Modals */}
      <AISuggestionModal doubt={selectedAiDoubt} onClose={() => setSelectedAiDoubt(null)} />
      <ResolveModal
        doubt={resolvingDoubt}
        onClose={() => setResolvingDoubt(null)}
        onConfirm={onResolveDoubt}
      />
    </>
  );
};
