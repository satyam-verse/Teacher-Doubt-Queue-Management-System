import React, { useState } from 'react';
import { Copy, Check, Terminal } from 'lucide-react';

interface CodeBlockProps {
  language?: string;
  value: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ language, value }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const displayLang = language || 'code';

  return (
    <div className="relative my-4 rounded-xl border border-slate-700/80 bg-slate-950 text-slate-100 overflow-hidden shadow-lg shadow-black/20 group">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900/90 text-xs text-slate-400 font-mono select-none">
        <div className="flex items-center space-x-2">
          <Terminal className="h-3.5 w-3.5 text-indigo-400" />
          <span className="uppercase tracking-wider font-semibold text-indigo-300">
            {displayLang}
          </span>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center space-x-1 px-2.5 py-1 rounded-md text-[11px] font-sans font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
          title="Copy code to clipboard"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Content */}
      <div className="p-4 overflow-x-auto text-[13px] leading-relaxed font-mono">
        <pre className="m-0 whitespace-pre">
          <code>{value}</code>
        </pre>
      </div>
    </div>
  );
};
