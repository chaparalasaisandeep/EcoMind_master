/**
 * EcoMind AI Ultra — AI Sustainability Coach
 * Interactive chat interface with context-aware coaching.
 * Security: Input sanitization, prompt injection protection, rate limiting.
 * Accessibility: ARIA roles, live regions, keyboard navigation.
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useProfile } from '../../hooks/useProfile';
import { sanitizeString, detectPromptInjection, aiRateLimiter } from '../../utils/validation';
import { edgeFunctionService } from '../../services/api';
import { Send, Bot, User, Loader2, AlertTriangle } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const WELCOME_MESSAGE: Message = {
  id: 'welcome',
  role: 'assistant',
  content: `Welcome to EcoMind AI Coach! I'm here to help you reduce your carbon footprint.\n\nI can help you with:\n- Personalized sustainability tips\n- Transport, energy, food, and shopping advice\n- Goal setting and progress tracking\n- Understanding your carbon impact\n\nWhat would you like to focus on today?`,
  timestamp: new Date(),
};

export function AiCoachPage() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !user) return;

    if (!aiRateLimiter.canProceed()) {
      setError('Too many requests. Please wait a moment.');
      return;
    }

    if (detectPromptInjection(input)) {
      setError('Potentially harmful input detected. Please rephrase your question.');
      return;
    }

    const sanitizedInput = sanitizeString(input);
    setInput('');
    setError(null);

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: sanitizedInput,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const data = await edgeFunctionService.callAiCoach(
        sanitizedInput,
        {
          level: profile?.level,
          ecoClass: profile?.eco_class,
          goals: profile?.sustainability_goals,
          location: profile?.location_type,
        },
        messages.slice(-10).map((m) => ({ role: m.role, content: m.content }))
      );

      const assistantMessage: Message = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: data.response || 'I apologize, but I could not process your request. Please try again.',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      setError('Failed to get a response. Please try again.');
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }, [input, isLoading, user, profile, messages]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-white">AI Sustainability Coach</h1>
        <p className="text-slate-400 mt-1">Your personal sustainability expert powered by AI.</p>
      </header>

      <div
        className="bg-slate-900/60 backdrop-blur-sm border border-slate-800/50 rounded-2xl flex flex-col h-[600px]"
        role="region"
        aria-label="AI Coach conversation"
      >
        <div
          className="flex-1 overflow-y-auto p-4 space-y-4"
          role="log"
          aria-live="polite"
          aria-relevant="additions"
        >
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              role="article"
              aria-label={`${message.role === 'user' ? 'You' : 'AI Coach'}: ${message.content.slice(0, 50)}`}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0" aria-hidden="true">
                  <Bot className="w-4 h-4 text-emerald-400" />
                </div>
              )}
              <div
                className={`max-w-[70%] px-4 py-3 rounded-2xl text-sm ${
                  message.role === 'user'
                    ? 'bg-emerald-600 text-white rounded-br-none'
                    : 'bg-slate-800 text-slate-200 rounded-bl-none'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                <time
                  className="text-[10px] opacity-50 mt-1 block"
                  dateTime={message.timestamp.toISOString()}
                >
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </time>
              </div>
              {message.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0" aria-hidden="true">
                  <User className="w-4 h-4 text-blue-400" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3" aria-label="AI Coach is typing">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center" aria-hidden="true">
                <Bot className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="bg-slate-800 rounded-2xl rounded-bl-none px-4 py-3">
                <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" aria-hidden="true" />
                <span className="sr-only">AI Coach is thinking...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm" role="alert">
              <AlertTriangle className="w-4 h-4" aria-hidden="true" />
              {error}
            </div>
          )}

          <div ref={messagesEndRef} aria-hidden="true" />
        </div>

        <form onSubmit={handleSubmit} className="p-4 border-t border-slate-800/50">
          <div className="flex gap-2">
            <label htmlFor="ai-coach-input" className="sr-only">Type your message</label>
            <input
              ref={inputRef}
              id="ai-coach-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about transport, food, energy, or shopping..."
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              disabled={isLoading}
              maxLength={500}
              aria-label="Message input"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-4 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-600/50 text-white rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900"
              aria-label="Send message"
            >
              <Send className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            AI responses are for guidance only. Always verify critical sustainability decisions.
          </p>
        </form>
      </div>
    </div>
  );
}
