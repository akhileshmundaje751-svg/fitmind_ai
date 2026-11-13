import React, { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  Bot,
  ChevronRight,
  Flame,
  Send,
  Sparkles,
  Trash2,
  User,
  Zap,
} from 'lucide-react';
import {
  CalculationResults,
  ChatMessage,
  DietPlan,
  UserProfile,
  WorkoutPlan,
} from '../../types';

interface AIAssistantViewProps {
  profile: UserProfile | null;
  calculations: CalculationResults | null;
  dietPlan: DietPlan | null;
  workoutPlan: WorkoutPlan | null;
  chatHistory: ChatMessage[];
  onSendMessage: (msg: string) => Promise<void>;
  onClearChat: () => Promise<void>;
  isSending: boolean;
  onOpenOnboarding: () => void;
}

export const AIAssistantView: React.FC<AIAssistantViewProps> = ({
  profile,
  calculations,
  dietPlan,
  workoutPlan,
  chatHistory,
  onSendMessage,
  onClearChat,
  isSending,
  onOpenOnboarding,
}) => {
  const [input, setInput] = useState<string>('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isSending]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isSending) return;
    const text = input.trim();
    setInput('');
    await onSendMessage(text);
  };

  const quickPrompts = [
    'Why is my body fat percentage at this level?',
    'How much protein should I consume per meal?',
    'Can I substitute paneer with soy chunks?',
    'Is my weekly workout volume sufficient for my goal?',
    'What should I eat 60 minutes before training?',
    'Why has my body weight scale stalled this week?',
    'How do I progress my bench press and squats next week?',
  ];

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto h-[calc(100vh-4rem)] flex flex-col space-y-4">
      {/* Header & Active Context Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-4 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-400">
              Context-Aware Sports AI
            </span>
            <span className="text-zinc-600">•</span>
            <span className="text-xs text-zinc-400 font-medium">Powered by Gemini 3.8 Flash</span>
          </div>
          <h1 className="text-2xl font-extrabold text-zinc-100 tracking-tight mt-0.5">
            FitMind Intelligent Assistant
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {chatHistory.length > 0 && (
            <button
              onClick={onClearChat}
              className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 hover:text-rose-400 hover:border-zinc-700 transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          )}
        </div>
      </div>

      {/* Profile Context Pill Ribbon */}
      {profile && calculations && (
        <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex flex-wrap items-center gap-3 text-zinc-300">
            <span className="text-zinc-500 font-bold uppercase text-[10px] tracking-wider">Loaded Context:</span>
            <span>Weight: <strong className="text-zinc-100">{profile.weight} kg</strong></span>
            <span>Body Fat: <strong className="text-emerald-400">{calculations.bodyFatNavy.percentage}%</strong></span>
            <span>Calorie Target: <strong className="text-amber-400">{calculations.nutritionTargets.dailyCalories} kcal</strong></span>
            <span>Protein: <strong className="text-cyan-400">{calculations.nutritionTargets.proteinGrams}g</strong></span>
            <span>Split: <strong className="text-zinc-200 uppercase">{profile.fitness.preferredSplit || 'PPL'}</strong></span>
          </div>
          <span className="text-[10px] text-zinc-400 font-medium hidden md:inline">
            Answers are calibrated to your physiological profile
          </span>
        </div>
      )}

      {/* Chat Messages Scroll Window */}
      <div className="flex-1 bg-zinc-950/60 border border-zinc-800/80 rounded-2xl p-5 overflow-y-auto space-y-4">
        {chatHistory.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10">
              <Bot className="w-7 h-7" />
            </div>
            <div className="space-y-1.5 max-w-md">
              <h2 className="text-lg font-bold text-zinc-100">
                How can I assist your training or nutrition?
              </h2>
              <p className="text-xs text-zinc-400 leading-relaxed">
                I have access to your personal measurements, calculated BMR, TDEE, diet macros, and weekly workout schedule.
              </p>
            </div>

            {/* Quick Prompt Pills */}
            <div className="w-full max-w-xl space-y-2 pt-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 block">
                Suggested Questions
              </span>
              <div className="flex flex-wrap justify-center gap-2">
                {quickPrompts.slice(0, 4).map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setInput(prompt);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 hover:bg-zinc-800 text-xs text-zinc-300 transition-all text-left"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          chatHistory.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] md:max-w-[75%] rounded-2xl p-4 text-xs leading-relaxed space-y-2 ${
                    isUser
                      ? 'bg-emerald-500 text-zinc-950 font-medium'
                      : 'bg-zinc-900 border border-zinc-800 text-zinc-200'
                  }`}
                >
                  {/* Message content formatted */}
                  <div className="whitespace-pre-wrap select-text">
                    {msg.content}
                  </div>

                  <div className="flex items-center justify-between text-[10px] opacity-70 pt-1">
                    <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    {!isUser && msg.contextUsed && (
                      <span className="font-semibold text-emerald-400">Profile Context Applied</span>
                    )}
                  </div>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })
        )}

        {isSending && (
          <div className="flex items-center gap-3 text-xs text-zinc-400">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 animate-pulse">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-400 animate-pulse">
              Analyzing physiological metrics and formulating response...
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="shrink-0 space-y-2">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your body fat %, diet substitutions, workout progression..."
            disabled={isSending}
            className="flex-1 bg-zinc-900 border border-zinc-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-sm text-zinc-100 focus:outline-none transition-colors"
          />
          <button
            type="submit"
            disabled={!input.trim() || isSending}
            className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-emerald-500/20 disabled:opacity-40"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </div>

        <p className="text-[11px] text-zinc-500 text-center">
          FitMind AI provides fitness & sports nutrition coaching. Not a medical diagnostic instrument.
        </p>
      </form>
    </div>
  );
};
