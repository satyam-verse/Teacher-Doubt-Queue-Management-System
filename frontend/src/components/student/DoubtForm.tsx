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
    <Card className="border-indigo-100 dark:border-slate-800 shadow-md shadow-indigo-500/5">
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <CardTitle>Ask a Question</CardTitle>
            <CardDescription>
              Join the live classroom queue with AI-powered instant assistance
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-xs border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Your Full Name
              </label>
              <Input
                placeholder="e.g. Satyam Kumar"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Classroom Session Code
              </label>
              <Input
                placeholder="e.g. DX-CS101"
                value={sessionCode}
                onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              What are you stuck on? (Be specific, paste errors or code)
            </label>
            <textarea
              className="flex min-h-[110px] w-full rounded-lg border border-slate-300 bg-white p-3 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              placeholder="e.g. In my quicksort implementation, I am getting RecursionError: maximum recursion depth exceeded when testing sorted arrays..."
              value={doubtText}
              onChange={(e) => setDoubtText(e.target.value)}
              required
            />
          </div>

          {/* S3 Attachment Upload */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <label className="flex items-center space-x-2 text-xs font-medium text-slate-600 hover:text-indigo-600 cursor-pointer dark:text-slate-400">
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
              <span className="text-[11px] text-emerald-600 flex items-center">
                <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Ready to upload ({(file.size / 1024).toFixed(1)} KB)
              </span>
            )}

            <Button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="ml-auto w-full sm:w-auto"
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
