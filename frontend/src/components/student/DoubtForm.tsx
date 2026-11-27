import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import type { Doubt } from '../../types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Sparkles, Paperclip, Send, Loader2, CheckCircle2 } from 'lucide-react';

interface DoubtFormProps {
  onDoubtCreated: (doubt: Doubt) => void;
  activeSessionCode?: string;
}

export const DoubtForm: React.FC<DoubtFormProps> = ({ onDoubtCreated, activeSessionCode }) => {
  const { user } = useAuth();
  const [studentName, setStudentName] = useState(user?.full_name || '');
  const [sessionCode, setSessionCode] = useState(activeSessionCode || 'DX-CS101');
  const [doubtText, setDoubtText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update studentName if user logs in
  React.useEffect(() => {
    if (user?.full_name && !studentName) {
      setStudentName(user.full_name);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !doubtText.trim()) {
      setError('Please provide both your name and question details.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      let attachmentUrl = null;

      // 1. If file attached, upload to S3 via presigned PUT URL
      if (file) {
        setIsUploading(true);
        const presignedRes = await api.post('/api/v1/uploads/presigned-url', {
          filename: file.name,
          content_type: file.type || 'application/octet-stream',
        });
        
        const { upload_url, file_url, is_mock } = presignedRes.data;

        // Perform direct PUT to S3 (or mock endpoint in dev)
        if (!is_mock) {
          await fetch(upload_url, {
            method: 'PUT',
            headers: { 'Content-Type': file.type || 'application/octet-stream' },
            body: file,
          });
        }
        attachmentUrl = file_url;
        setIsUploading(false);
      }

      // 2. Submit doubt to backend (Gemini will automatically analyze)
      const res = await api.post('/api/v1/doubts', {
        student_name: studentName.trim(),
        session_code: sessionCode.trim().toUpperCase(),
        doubt: doubtText.trim(),
        attachment_url: attachmentUrl,
      });

      const newDoubt: Doubt = res.data.doubt;
      onDoubtCreated(newDoubt);
      setDoubtText('');
      setFile(null);
    } catch (err: any) {
      console.error('Error submitting doubt:', err);
      setError(err.response?.data?.error || 'Failed to submit doubt. Please try again.');
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  return (
    <Card className="neo-glass-card bg-navy-900/90 border-white/10 shadow-2xl">
      <CardHeader className="pb-4 border-b border-white/5">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-violet-950/80 border border-violet-500/30 text-cyan-400 shadow-sm">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-white font-extrabold text-lg">Ask a Question</CardTitle>
            <CardDescription className="text-slate-400 text-xs">
              Join the live classroom FIFO queue with Gemini AI-powered instant pre-diagnosis
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/70 text-rose-200 text-xs border border-rose-500/40 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Your Full Name
              </label>
              <Input
                className="bg-navy-950 border-white/10 text-white placeholder-slate-500 focus:border-cyan-500"
                placeholder="e.g. Satyam Kumar"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Classroom Session Code
              </label>
              <Input
                className="bg-navy-950 border-white/10 text-white placeholder-slate-500 font-mono focus:border-cyan-500 uppercase"
                placeholder="e.g. DX-CS101"
                value={sessionCode}
                onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              What are you stuck on? (Be specific, paste errors or code)
            </label>
            <textarea
              className="flex min-h-[110px] w-full rounded-xl border border-white/10 bg-navy-950 p-3.5 text-sm text-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/30 focus-visible:border-cyan-500 leading-relaxed shadow-inner"
              placeholder="e.g. In my quicksort implementation, I am getting RecursionError: maximum recursion depth exceeded when testing sorted arrays..."
              value={doubtText}
              onChange={(e) => setDoubtText(e.target.value)}
              required
            />
          </div>

          {/* S3 Attachment Upload */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <label className="flex items-center space-x-2 text-xs font-medium text-slate-400 hover:text-cyan-400 cursor-pointer transition-colors">
              <Paperclip className="h-4 w-4" />
              <span>{file ? file.name : 'Attach screenshot or code snippet (AWS S3)'}</span>
              <input
                type="file"
                className="hidden"
                accept="image/*,.txt,.py,.js,.jsx,.ts,.tsx,.json"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setFile(e.target.files[0]);
                  }
                }}
              />
            </label>

            {file && (
              <span className="text-[11px] text-emerald-400 font-mono flex items-center">
                <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Ready to upload ({(file.size / 1024).toFixed(1)} KB)
              </span>
            )}

            <Button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="ml-auto w-full sm:w-auto bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white font-bold shadow-glow-cyan"
            >
              {isSubmitting || isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isUploading ? 'Uploading to S3...' : 'AI Analyzing...'}
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Join Doubt Queue
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
