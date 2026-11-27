import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { Badge } from '../ui/badge';

export const FAQSection: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does DoubtX AI differ from generic chatbots like ChatGPT?',
      a: 'Generic chatbots lack educational pedagogical grounding and classroom synchronization. DoubtX AI combines Gemini 2.5 multi-turn academic reasoning with an active, real-time classroom FIFO queue. It adapts its pedagogical depth (Beginner, Intermediate, Advanced), renders mathematical proofs in full KaTeX notation, and works directly with course professors during live lectures.'
    },
    {
      q: 'Does DoubtX AI replace classroom instructors or teaching assistants?',
      a: 'Never. DoubtX AI acts as a 24/7 force multiplier for both students and faculty. During lectures, it pre-analyzes student misconceptions and provides instant hints while organizing students into a transparent FIFO queue. Instructors can claim doubts with one click, review AI-synthesized context, and spend lecture time on high-impact explanations rather than queue chaos.'
    },
    {
      q: 'What subjects, programming languages, and file types are supported?',
      a: 'DoubtX AI operates without subject restrictions. It handles everything from Computer Science (Distributed Systems, Concurrency, Algorithms) and Mathematics (Topology, Multivariable Calculus) to Biomedical Sciences, Quantum Physics, Economics, and Philosophy. It natively parses uploaded PDFs, screenshots of homework problems, and code in Python, C++, Java, Rust, Go, SQL, and more.'
    },
    {
      q: 'How does the Real-Time Classroom Queue work during live lectures?',
      a: 'Professors launch an active session (e.g. DX-CS101). Students in the room raise doubts from their portal, optionally uploading screenshots. Doubts are broadcast across WebSockets in under 300ms to the Teacher Kanban Console. The queue dynamically calculates wait positions, and professors can claim, provide notes, and mark doubts resolved in real time.'
    },
    {
      q: 'How does the subscription model work for universities?',
      a: 'Students can use DoubtX Starter free with 20 queries/day. DoubtX Pro ($12/month) provides unlimited queries, multimodal PDF reasoning, and priority queue routing. For institutions, the Campus Enterprise plan covers entire academic departments with administrative role controls, departmental difficulty analytics, and LMS integration.'
    }
  ];

  const toggleFAQ = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section className="py-20 bg-slate-950 border-b border-slate-900" id="faq">
      <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
        
        {/* Header */}
        <div className="text-center mb-14">
          <Badge variant="purple" className="mb-2 text-[10px] font-semibold tracking-wider uppercase">
            Questions & Answers
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-3 text-sm text-slate-400">
            Everything you need to know about DoubtX AI universal intelligence and classroom orchestration.
          </p>
        </div>

        {/* Accordions */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden transition-all"
              >
                <button
                  onClick={() => toggleFAQ(idx)}
                  className="w-full flex items-center justify-between p-5 text-left text-sm font-semibold text-slate-100 hover:text-indigo-300 transition"
                >
                  <span className="flex items-center space-x-2.5 pr-4">
                    <HelpCircle className="h-4 w-4 text-indigo-400 shrink-0" />
                    <span>{faq.q}</span>
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-indigo-400' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/60 bg-slate-950/40">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
