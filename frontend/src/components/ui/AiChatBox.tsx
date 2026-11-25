import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Sparkles, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { useSolarSystemStore } from '../../store/useSolarSystemStore';

export const AiChatBox: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const messages = useSolarSystemStore((state) => state.messages);
  const isAiThinking = useSolarSystemStore((state) => state.isAiThinking);
  const isChatOpen = useSolarSystemStore((state) => state.isChatOpen);
  const setIsChatOpen = useSolarSystemStore((state) => state.setIsChatOpen);
  const sendMessage = useSolarSystemStore((state) => state.sendMessage);
  const clearChat = useSolarSystemStore((state) => state.clearChat);

  const suggestedQuestions = [
    'Tell me about Earth.',
    'Explore Mars.',
    'What is the biggest planet?',
    'Compare Earth and Mars.',
    "Tell me about Saturn's rings.",
  ];

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = inputText.trim();
    if (!text || isAiThinking) return;

    setInputText('');
    await sendMessage(text);
  };

  const handleSelectSuggested = async (q: string) => {
    if (isAiThinking) return;
    await sendMessage(q);
  };

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAiThinking]);

  return (
    <aside aria-label="AI Space Assistant" className="fixed bottom-4 right-3 md:right-6 z-30 w-[calc(100vw-1.5rem)] sm:w-[380px] md:w-[410px] max-w-full pointer-events-auto">
      <div className="relative flex flex-col bg-slate-950/90 backdrop-blur-2xl border border-amber-500/35 rounded-2xl shadow-[0_0_35px_rgba(245,158,11,0.18)] overflow-hidden">
        {/* Amber Gradient Header Bar */}
        <div className="h-1 w-full bg-gradient-to-r from-amber-500 via-orange-400 to-amber-600 shadow-[0_0_12px_#f59e0b]" />

        {/* Chat Box Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/80 bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="relative w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.25)]">
              <Bot className="w-4 h-4" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-slate-950 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xs md:text-sm font-bold text-white tracking-wide flex items-center gap-1.5">
                AI Assistant
                <Sparkles className="w-3 h-3 text-amber-400" />
              </h2>
              <p className="text-[10px] text-amber-300/70 font-mono">
                {isAiThinking ? 'PROCESSING QUERY...' : 'READY FOR EXPLORATION'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={clearChat}
              title="Clear chat history"
              className="p-1.5 text-slate-400 hover:text-amber-400 rounded-lg hover:bg-slate-800/60 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsChatOpen(!isChatOpen)}
              title={isChatOpen ? 'Collapse chat' : 'Expand chat'}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition"
            >
              {isChatOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Collapsible Body */}
        <AnimatePresence initial={false}>
          {isChatOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="flex flex-col"
            >
              {/* Message History */}
              <div className="h-60 sm:h-64 overflow-y-auto p-3.5 space-y-3 custom-scrollbar text-xs">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2 ${
                      msg.sender === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {msg.sender === 'assistant' && (
                      <div className="w-6 h-6 rounded-md bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                        <Bot className="w-3.5 h-3.5" />
                      </div>
                    )}

                    <div
                      className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-amber-500 text-slate-950 font-medium rounded-tr-none shadow-md shadow-amber-500/10'
                          : 'bg-slate-900/90 text-slate-200 border border-slate-800 rounded-tl-none'
                      }`}
                    >
                      <p>{msg.text}</p>
                      <span
                        className={`block text-[9px] mt-1 ${
                          msg.sender === 'user' ? 'text-amber-950/70 text-right' : 'text-slate-400'
                        }`}
                      >
                        {msg.timestamp}
                      </span>
                    </div>

                    {msg.sender === 'user' && (
                      <div className="w-6 h-6 rounded-md bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0 mt-0.5">
                        <User className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                ))}

                {/* AI Thinking Animation */}
                {isAiThinking && (
                  <div className="flex items-center gap-2 text-amber-400 text-xs py-1">
                    <div className="w-6 h-6 rounded-md bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
                      <Bot className="w-3.5 h-3.5 animate-spin" />
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-900/90 border border-slate-800 rounded-2xl rounded-tl-none">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                      <span className="ml-1 text-[11px] text-amber-300/80 font-mono">Analyzing coordinates...</span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Suggested Questions Pills */}
              <div className="px-3 py-2 bg-slate-900/40 border-t border-slate-800/60 overflow-x-auto flex gap-1.5 no-scrollbar">
                {suggestedQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectSuggested(q)}
                    disabled={isAiThinking}
                    className="whitespace-nowrap px-2.5 py-1 text-[11px] font-medium text-slate-300 hover:text-amber-300 bg-slate-800/70 hover:bg-amber-500/10 border border-slate-700 hover:border-amber-500/40 rounded-full transition disabled:opacity-50"
                  >
                    {q}
                  </button>
                ))}
              </div>

              {/* Chat Input Form */}
              <form onSubmit={handleSend} className="p-2.5 bg-slate-900/90 border-t border-slate-800 flex items-center gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Ask about any planet, moons, or facts..."
                  disabled={isAiThinking}
                  className="flex-1 px-3 py-2 bg-slate-950/80 border border-slate-800 focus:border-amber-500/60 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none transition"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || isAiThinking}
                  aria-label="Send query"
                  className="p-2 text-slate-950 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 rounded-xl transition disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(245,158,11,0.3)] active:scale-95"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </aside>
  );
};
