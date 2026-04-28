import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Sparkles, Loader2, Minus } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { cn } from '../lib/utils';
import { buildCoachEndpoint, requestCoachChat } from './dashboardApi.js';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface FloatingChatBoxProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FloatingChatBox({ isOpen, onClose }: FloatingChatBoxProps) {
  const { session } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hi! I am your AI Career Coach. I can help you with interview preparation, resume advice, career transition strategies, and more. How can I help you today?',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const endpoint = buildCoachEndpoint(import.meta.env.VITE_API_BASE_URL);
      const fallbackEndpoint = import.meta.env.DEV ? 'http://localhost:3001/api/coach' : undefined;
      const authToken = session?.access_token;
      
      const payload = { messages: newMessages };
      
      const result = await requestCoachChat(
        fetch,
        endpoint,
        payload,
        fallbackEndpoint,
        authToken
      );

      if (result.success) {
        setMessages((prev) => [...prev, { role: 'assistant', content: result.data.response }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: `Oops, something went wrong: ${result.error.message}` },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I am having trouble connecting to the server.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-6 right-6 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col z-50 h-[32rem] max-h-[calc(100vh-4rem)]"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Sparkles size={16} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm">AI Career Coach</h3>
                <p className="text-[10px] text-blue-100 uppercase tracking-widest">gapless pro</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-blue-100 hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10"
            >
              <Minus size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 flex flex-col">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm",
                  msg.role === 'user'
                    ? "bg-blue-600 text-white self-end rounded-br-sm"
                    : "bg-white border border-gray-200 text-slate-800 self-start rounded-bl-sm shadow-sm"
                )}
              >
                {msg.content}
              </div>
            ))}
            {isLoading && (
              <div className="bg-white border border-gray-200 text-slate-500 rounded-2xl px-4 py-3 self-start rounded-bl-sm shadow-sm flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                <span className="text-xs">Coach is thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 bg-white border-t border-gray-100 shrink-0">
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Ask your career coach..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full bg-gray-100 border-transparent focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-full pl-4 pr-12 py-2.5 text-sm transition-all"
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="absolute right-1 text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 w-8 h-8 flex items-center justify-center rounded-full transition-colors"
              >
                <Send size={14} className={cn(isLoading || !input.trim() ? "translate-x-0" : "translate-x-[1px]")} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
