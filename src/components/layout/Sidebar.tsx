import React from 'react';
import {
  Activity,
  Apple,
  Bot,
  Dumbbell,
  Flame,
  LayoutDashboard,
  LineChart,
  Settings,
  User,
  Zap,
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'body-analysis'
  | 'diet'
  | 'workout'
  | 'ai-assistant'
  | 'progress'
  | 'profile'
  | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  geminiConnected: boolean;
  userGoal?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  geminiConnected,
  userGoal,
}) => {
  const navItems = [
    { id: 'dashboard' as NavTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'body-analysis' as NavTab, label: 'Body Analysis', icon: Activity },
    { id: 'diet' as NavTab, label: 'Diet Planner', icon: Apple },
    { id: 'workout' as NavTab, label: 'Workout Planner', icon: Dumbbell },
    { id: 'ai-assistant' as NavTab, label: 'AI Assistant', icon: Bot, highlight: true },
    { id: 'progress' as NavTab, label: 'Progress Tracker', icon: LineChart },
    { id: 'profile' as NavTab, label: 'My Profile', icon: User },
    { id: 'settings' as NavTab, label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-zinc-800/80 bg-zinc-950/95 flex flex-col justify-between shrink-0 select-none">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-zinc-800/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-zinc-950 font-black shadow-lg shadow-emerald-500/20">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold tracking-tight text-base text-zinc-100">
                  FitMind<span className="text-emerald-400">.ai</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/50">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-medium">Body & Nutrition Engine</p>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm shadow-emerald-500/10'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-emerald-400' : 'text-zinc-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.highlight && (
                  <span className="flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                    <Flame className="w-2.5 h-2.5 fill-current" />
                    AI
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Status Panel */}
      <div className="p-4 border-t border-zinc-800/60">
        <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400">Gemini 3.8 Intelligence</span>
            <span className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {geminiConnected ? 'Active' : 'Ready'}
            </span>
          </div>
          {userGoal && (
            <div className="pt-2 border-t border-zinc-800/60 text-[11px] text-zinc-400">
              <span className="text-zinc-500 block text-[10px] uppercase font-bold tracking-wider">Focus</span>
              <span className="capitalize text-zinc-200 font-medium truncate block">
                {userGoal.replace('_', ' ')}
              </span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
