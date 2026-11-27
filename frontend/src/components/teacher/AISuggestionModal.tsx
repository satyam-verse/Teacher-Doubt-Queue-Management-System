import React from 'react';
import type { Doubt } from '../../types';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Sparkles, X, Lightbulb, Code2 } from 'lucide-react';

interface AISuggestionModalProps {
  doubt: Doubt | null;
  onClose: () => void;
}

export const AISuggestionModal: React.FC<AISuggestionModalProps> = ({ doubt, onClose }) => {
  if (!doubt) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-purple-600 text-white shadow-md shadow-purple-500/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Gemini AI Solution Assistant
              </h3>
              <p className="text-xs text-slate-500">
                Recommended teacher guidance for {doubt.student_name}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Student Doubt
            </span>
            <div className="mt-1 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-sm text-slate-800 dark:text-slate-200">
              {doubt.doubt}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Badge variant="purple">{doubt.category}</Badge>
            <Badge variant={doubt.priority === 'HIGH' || doubt.priority === 'URGENT' ? 'destructive' : 'default'}>
              Priority: {doubt.priority}
            </Badge>
          </div>

          {/* AI Recommended Solution */}
          <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/40 dark:border-purple-800/40 dark:bg-purple-950/20">
            <div className="flex items-center space-x-2 text-purple-700 dark:text-purple-300 font-semibold text-xs mb-2">
              <Lightbulb className="h-4 w-4" />
              <span>Recommended Solution & Teaching Points:</span>
            </div>
            <div className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
              {doubt.ai_suggested_solution || "Analyze the student's code syntax and logic flow. Guide them through inspecting variables and inputs."}
            </div>
          </div>

          {/* AI Hint Given to Student */}
          {doubt.ai_hint && (
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/40">
              <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 font-semibold text-xs mb-1">
                <Code2 className="h-4 w-4" />
                <span>Hint Already Delivered to Student:</span>
              </div>
              <p className="text-xs italic text-slate-600 dark:text-slate-300">
                "{doubt.ai_hint}"
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <Button onClick={onClose} variant="secondary" size="sm">
            Close Assistant
          </Button>
        </div>

      </div>
    </div>
  );
};
