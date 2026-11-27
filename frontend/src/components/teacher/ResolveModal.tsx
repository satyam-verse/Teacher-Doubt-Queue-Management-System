import React, { useState } from 'react';
import type { Doubt } from '../../types';
import { Button } from '../ui/button';
import { CheckCircle2, X, Loader2 } from 'lucide-react';

interface ResolveModalProps {
  doubt: Doubt | null;
  onClose: () => void;
  onConfirm: (doubtId: number, notes: string) => Promise<void>;
}

export const ResolveModal: React.FC<ResolveModalProps> = ({ doubt, onClose, onConfirm }) => {
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!doubt) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onConfirm(doubt.id, notes.trim());
      onClose();
    } catch (err) {
      console.error('Error resolving doubt:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Mark Doubt as Resolved
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <p className="text-xs text-slate-500 mb-2">
              Resolving doubt for <strong className="text-slate-800 dark:text-slate-200">{doubt.student_name}</strong>:
            </p>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 italic">
              "{doubt.doubt.slice(0, 140)}{doubt.doubt.length > 140 ? '...' : ''}"
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Resolution Notes (Optional for student reference)
            </label>
            <textarea
              className="flex min-h-[90px] w-full rounded-lg border border-slate-300 bg-white p-3 text-xs placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              placeholder="e.g. Explained base case in recursion and fixed indentation bug on line 14."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  Resolving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                  Confirm Resolution
                </>
              )}
            </Button>
          </div>
        </form>

      </div>
    </div>
  );
};
