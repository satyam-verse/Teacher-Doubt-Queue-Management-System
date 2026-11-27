import React, { useState, useRef, useEffect } from 'react';
import type { Conversation, ExplanationLevel } from '../../types';
import { MarkdownRenderer } from '../common/MarkdownRenderer';
import { api } from '../../lib/api';
import type { AIStatusInfo } from '../common/Sidebar';
import { 
  Sparkles, 
  Send, 
  Paperclip, 
  Copy, 
  Check, 
  RefreshCw, 
  X, 
  Code2, 
  Loader2,
  FileText,
  Pencil,
  BookOpen,
  Atom,
  Calculator,
  Compass,
  Pin,
  Zap
} from 'lucide-react';

interface DoubtSolverWorkspaceProps {
  conversation: Conversation | null;
  onSendMessage: (content: string, level: ExplanationLevel, attachmentUrl?: string, attachmentType?: string) => Promise<void>;
  onRegenerate: () => Promise<void>;
  isGenerating: boolean;
  onSelectSuggestedPrompt: (prompt: string, level: ExplanationLevel) => void;
  onRenameConversation?: (id: number, newTitle: string) => Promise<void>;
  onPinConversation?: (id: number) => Promise<void>;
  onOpenUpgrade?: () => void;
  aiStatus?: AIStatusInfo | null;
}

export const DoubtSolverWorkspace: React.FC<DoubtSolverWorkspaceProps> = ({
  conversation,
  onSendMessage,
  onRegenerate,
  isGenerating,
  onSelectSuggestedPrompt,
  onRenameConversation,
  onPinConversation,
  onOpenUpgrade,
  aiStatus,
}) => {
  const [inputText, setInputText] = useState('');
  const [level, setLevel] = useState<ExplanationLevel>(conversation?.explanation_level || 'intermediate');
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<number | null>(null);

  // Title inline editing
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync level with active conversation
  useEffect(() => {
    if (conversation?.explanation_level) {
      setLevel(conversation.explanation_level);
    }
    if (conversation) {
      setEditedTitle(conversation.title);
      setIsEditingTitle(false);
    }
  }, [conversation?.explanation_level, conversation?.id]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation?.messages, isGenerating]);

  // Handle file preview (image and PDF)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      const reader = new FileReader();
      reader.onload = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(selected);
    }
  };

  const clearFile = () => {
    setFile(null);
    setFilePreview(null);
  };

  const handleCopyAnswer = async (id: number, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessageId(id);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleSaveTitle = async () => {
    if (conversation && editedTitle.trim() && onRenameConversation) {
      await onRenameConversation(conversation.id, editedTitle.trim());
    }
    setIsEditingTitle(false);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!inputText.trim() && !file) || isGenerating || isUploading) return;

    let attachmentUrl: string | undefined = undefined;
    let attachmentType: string | undefined = undefined;

    if (file) {
      setIsUploading(true);
      try {
        if (filePreview && filePreview.startsWith('data:')) {
          attachmentUrl = filePreview;
          attachmentType = file.type || (file.name.endsWith('.pdf') ? 'application/pdf' : 'image/png');
        } else {
          // Upload via S3 presigned URL or direct upload
          const presignedRes = await api.post('/api/v1/uploads/presigned-url', {
            filename: file.name,
            content_type: file.type || 'application/octet-stream',
          });
          const { upload_url, file_url, is_mock } = presignedRes.data;

          if (!is_mock) {
            await fetch(upload_url, {
              method: 'PUT',
              headers: { 'Content-Type': file.type || 'application/octet-stream' },
              body: file,
            });
          }
          attachmentUrl = file_url;
          attachmentType = file.type || 'application/octet-stream';
        }
      } catch (err) {
        console.error('Upload failed:', err);
      } finally {
        setIsUploading(false);
      }
    }

    const currentText = inputText.trim();
    setInputText('');
    clearFile();

    await onSendMessage(currentText, level, attachmentUrl, attachmentType);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Universal Cross-Domain Suggested Prompt Cards
  const suggestedCards = [
    {
      title: 'Cloud & Infrastructure',
      subtitle: 'AWS EC2 vs Serverless Lambda',
      icon: Atom,
      color: 'from-indigo-500/20 to-violet-500/10 text-indigo-500 border-indigo-500/20',
      prompt: 'Explain the architectural differences, cost models, and operational trade-offs between AWS EC2 and AWS Lambda.',
      level: 'intermediate' as ExplanationLevel,
    },
    {
      title: 'Biological Sciences',
      subtitle: 'Photosynthesis & Cellular Energy',
      icon: BookOpen,
      color: 'from-emerald-500/20 to-teal-500/10 text-emerald-500 border-emerald-500/20',
      prompt: 'How does photosynthesis convert light energy into chemical energy? Break down the light-dependent and Calvin cycle reactions step-by-step.',
      level: 'beginner' as ExplanationLevel,
    },
    {
      title: 'Mathematics & Formulas',
      subtitle: 'Step-by-Step Algebraic Equation',
      icon: Calculator,
      color: 'from-purple-500/20 to-fuchsia-500/10 text-purple-500 border-purple-500/20',
      prompt: 'Solve the quadratic equation step by step using the quadratic formula and explain each calculation: 2x^2 + 5x - 3 = 0',
      level: 'intermediate' as ExplanationLevel,
    },
    {
      title: 'History & Economics',
      subtitle: 'Causes of the French Revolution',
      icon: Compass,
      color: 'from-amber-500/20 to-orange-500/10 text-amber-500 border-amber-500/20',
      prompt: 'What were the primary economic, social, and political catalysts that sparked the French Revolution in 1789?',
      level: 'intermediate' as ExplanationLevel,
    },
  ];

  const hasMessages = conversation?.messages && conversation.messages.length > 0;

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden">
      
      {/* Top Workspace Header Bar */}
      <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur z-10">
        <div className="flex items-center space-x-3 truncate flex-1 mr-4">
          <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex-shrink-0">
            <Sparkles className="h-4 w-4" />
          </div>

          {conversation && isEditingTitle ? (
            <div className="flex items-center space-x-1.5 flex-1 max-w-md">
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveTitle();
                  if (e.key === 'Escape') setIsEditingTitle(false);
                }}
                autoFocus
                className="w-full bg-slate-100 dark:bg-slate-800 border border-indigo-400 rounded-md px-2 py-1 text-sm font-semibold focus:outline-none"
              />
              <button
                onClick={handleSaveTitle}
                className="p-1 text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                title="Save title"
              >
                <Check className="h-4 w-4" />
              </button>
              <button
                onClick={() => setIsEditingTitle(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
                title="Cancel"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2 truncate group">
              <h2 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white truncate">
                {conversation ? conversation.title : 'Universal Academic & Technical Assistant'}
              </h2>
              {conversation && (
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {onPinConversation && (
                    <button
                      onClick={() => onPinConversation(conversation.id)}
                      className={`p-1 rounded ${
                        conversation.is_pinned ? 'text-indigo-500' : 'text-slate-400 hover:text-indigo-600'
                      }`}
                      title={conversation.is_pinned ? 'Unpin discussion' : 'Pin discussion'}
                    >
                      <Pin className="h-3 w-3" />
                    </button>
                  )}
                  <button
                    onClick={() => setIsEditingTitle(true)}
                    className="p-1 text-slate-400 hover:text-indigo-600 transition-opacity"
                    title="Rename chat"
                  >
                    <Pencil className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mode Selector Pill Group */}
        <div className="flex items-center space-x-2">
          {onOpenUpgrade && (
            <button
              onClick={onOpenUpgrade}
              className="hidden sm:flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-950/60 border border-indigo-700/60 text-indigo-300 hover:bg-indigo-900/60 transition"
              title="Upgrade to DoubtX Pro"
            >
              <Zap className="h-3 w-3 text-amber-400" />
              <span>Pro</span>
            </button>
          )}

          <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl text-xs font-semibold flex-shrink-0">
            <button
              onClick={() => setLevel('beginner')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              level === 'beginner'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
            title="Beginner: Everyday analogies, step-by-step scaffolding, simple terms"
          >
            Beginner
          </button>
          <button
            onClick={() => setLevel('intermediate')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              level === 'intermediate'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
            title="Intermediate: Comprehensive analysis, Big-O, industry/academic standards"
          >
            Intermediate
          </button>
          <button
            onClick={() => setLevel('advanced')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              level === 'advanced'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
            title="Advanced: Deep internals, formal mathematical proofs, low-level trade-offs"
          >
            Advanced
          </button>
        </div>
      </div>
    </div>

      {/* Unconfigured API Notice Banner */}
      {aiStatus?.status === 'unconfigured' && (
        <div className="mx-6 mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-200 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-4 w-4 text-amber-500 flex-shrink-0" />
            <span>
              <strong>Gemini API Key Needed:</strong> Add your <code>GEMINI_API_KEY</code> to <code>backend/.env</code> to activate live Gemini AI answers.
            </span>
          </div>
        </div>
      )}

      {/* Main Messages & Welcome View */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {!hasMessages ? (
          /* Welcome Screen */
          <div className="max-w-3xl mx-auto py-12 text-center space-y-8 animate-in fade-in duration-300">
            <div className="space-y-3">
              <div className="inline-flex p-3.5 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-xl shadow-indigo-500/20">
                <Sparkles className="h-8 w-8" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Universal AI Academic Assistant
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
                Ask about virtually any subject—Computer Science, Mathematics, Natural Sciences, History, Economics, Engineering, or unfamiliar concepts.
              </p>
            </div>

            {/* Suggested Question Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
              {suggestedCards.map((card, idx) => {
                const IconComponent = card.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setLevel(card.level);
                      onSelectSuggestedPrompt(card.prompt, card.level);
                    }}
                    className="group p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 hover:border-indigo-500/40 hover:shadow-lg hover:shadow-indigo-500/5 transition-all text-left flex flex-col justify-between cursor-pointer"
                  >
                    <div className="space-y-2">
                      <div className={`inline-flex p-2 rounded-xl bg-gradient-to-br ${card.color} border`}>
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {card.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                        {card.subtitle}
                      </p>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-400 group-hover:text-indigo-500 flex items-center space-x-1 mt-4">
                      <span>Ask question</span>
                      <span>→</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* Conversation Message Feed */
          <div className="max-w-3xl mx-auto space-y-6">
            {(conversation.messages || []).map((msg) => {
              const isUser = msg.sender_type === 'user';
              const isPdf = msg.attachment_type === 'application/pdf' || msg.attachment_url?.endsWith('.pdf');

              return (
                <div
                  key={msg.id}
                  className={`flex items-start space-x-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20">
                      <Sparkles className="h-4 w-4" />
                    </div>
                  )}

                  <div
                    className={`relative max-w-[85%] rounded-2xl px-5 py-4 ${
                      isUser
                        ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/10 rounded-tr-sm'
                        : 'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm rounded-tl-sm text-slate-900 dark:text-slate-100'
                    }`}
                  >
                    {/* Attachment preview if user uploaded image or PDF */}
                    {msg.attachment_url && (
                      <div className="mb-3 overflow-hidden rounded-xl border border-white/20 dark:border-slate-700 max-w-sm">
                        {isPdf ? (
                          <div className="flex items-center space-x-2.5 p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200">
                            <FileText className="h-6 w-6 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                            <div className="truncate">
                              <p className="text-xs font-semibold truncate">PDF Document</p>
                              <p className="text-[10px] text-slate-400">Attached for analysis</p>
                            </div>
                          </div>
                        ) : (
                          <img
                            src={msg.attachment_url}
                            alt="Uploaded screenshot or diagram"
                            className="w-full h-auto max-h-64 object-cover"
                          />
                        )}
                      </div>
                    )}

                    {isUser ? (
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    ) : (
                      <MarkdownRenderer content={msg.content} />
                    )}

                    {/* AI Message Action Controls */}
                    {!isUser && (
                      <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-400">
                        <div className="flex items-center space-x-2">
                          {msg.explanation_level && (
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                              {msg.explanation_level}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleCopyAnswer(msg.id, msg.content)}
                            className="flex items-center space-x-1 p-1 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
                            title="Copy entire response"
                          >
                            {copiedMessageId === msg.id ? (
                              <Check className="h-3.5 w-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                            <span className="text-[11px]">{copiedMessageId === msg.id ? 'Copied' : 'Copy'}</span>
                          </button>

                          <button
                            onClick={onRegenerate}
                            disabled={isGenerating}
                            className="flex items-center space-x-1 p-1 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer disabled:opacity-50"
                            title="Regenerate answer"
                          >
                            <RefreshCw className={`h-3.5 w-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                            <span className="text-[11px]">Regenerate</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Thinking / Generating animation state */}
            {isGenerating && (
              <div className="flex items-start space-x-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20 animate-pulse">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="p-4 rounded-2xl rounded-tl-sm bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center space-x-2.5">
                  <Loader2 className="h-4 w-4 text-indigo-500 animate-spin" />
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 animate-pulse">
                    DoubtX AI is synthesizing answer...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Bottom Message Input Bar */}
      <div className="p-4 border-t border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900">
        <div className="max-w-3xl mx-auto space-y-2">
          
          {/* File attachment preview chip */}
          {file && (
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
              <div className="flex items-center space-x-2 truncate">
                {file.type === 'application/pdf' || file.name.endsWith('.pdf') ? (
                  <FileText className="h-5 w-5 text-indigo-500 flex-shrink-0" />
                ) : filePreview ? (
                  <img src={filePreview} alt="Preview" className="h-8 w-8 rounded object-cover" />
                ) : (
                  <Code2 className="h-4 w-4 text-indigo-500" />
                )}
                <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                  {file.name}
                </span>
                <span className="text-slate-400 text-[10px]">
                  ({(file.size / 1024).toFixed(1)} KB)
                </span>
              </div>
              <button onClick={clearFile} className="p-1 text-slate-400 hover:text-red-500">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="relative flex items-end rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all shadow-sm">
            
            {/* Attachment Button */}
            <label className="p-3 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors" title="Attach screenshot, diagram, or PDF document">
              <Paperclip className="h-5 w-5" />
              <input
                type="file"
                className="hidden"
                accept="image/*,application/pdf,.pdf,.txt,.py,.cpp,.c,.java,.js,.jsx,.ts,.tsx,.sql,.html,.css"
                onChange={handleFileChange}
              />
            </label>

            {/* Auto-expanding Textarea */}
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Ask about any academic or technical subject... (${level.toUpperCase()} mode)`}
              className="flex-1 max-h-48 min-h-[44px] py-3 px-1 text-sm bg-transparent border-0 focus:outline-none resize-none placeholder:text-slate-400 text-slate-900 dark:text-white"
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={(!inputText.trim() && !file) || isGenerating || isUploading}
              className="p-2.5 m-1.5 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20 hover:from-indigo-700 hover:to-violet-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              title="Send message (Enter)"
            >
              {isGenerating || isUploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </form>

          <p className="text-[11px] text-center text-slate-400">
            Press <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-mono">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-mono">Shift+Enter</kbd> for new line. Universal AI reasoning across all subjects.
          </p>
        </div>
      </div>

    </div>
  );
};
