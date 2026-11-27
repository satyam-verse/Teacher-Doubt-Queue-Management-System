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
    <div className="relative my-4 rounded-xl border border-white/10 bg-navy-950 text-slate-100 overflow-hidden shadow-2xl group">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-navy-900/95 text-xs text-slate-400 font-mono select-none">
        <div className="flex items-center space-x-2">
          <Terminal className="h-3.5 w-3.5 text-cyan-400" />
          <span className="uppercase tracking-wider font-semibold text-cyan-300">
            {displayLang}
          </span>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center space-x-1 px-2.5 py-1 rounded-md text-[11px] font-sans font-medium text-slate-300 hover:text-white bg-navy-800 hover:bg-navy-700 border border-white/10 transition-colors cursor-pointer"
          title="Copy code to clipboard"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-semibold">Copied!</span>
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
      <div className="p-4 overflow-x-auto text-[13px] leading-relaxed font-mono selection:bg-cyan-500/30">
        <pre className="m-0 whitespace-pre">
          <code>{value}</code>
        </pre>
      </div>
    </div>
  );
};
