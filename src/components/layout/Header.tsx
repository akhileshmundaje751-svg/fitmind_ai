import React from 'react';
import {
  AlertTriangle,
  ChevronRight,
  Flame,
  Globe,
  HelpCircle,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import { UnitSystem, UserProfile } from '../../types';

interface HeaderProps {
  profile: UserProfile | null;
  units: UnitSystem;
  onToggleUnits: () => void;
  onOpenOnboarding: () => void;
  onOpenDisclaimer: () => void;
  onLoadDemo: () => void;
  isLoadingDemo: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  units,
  onToggleUnits,
  onOpenOnboarding,
  onOpenDisclaimer,
  onLoadDemo,
  isLoadingDemo,
}) => {
  return (
    <header className="h-16 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        {profile ? (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-xs">
              {profile.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-zinc-100">{profile.name}</span>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700/60">
                  {profile.fitness.level}
                </span>
              </div>
              <span className="text-xs text-zinc-400">
                {profile.sex === 'male' ? 'Male' : 'Female'} • {profile.age} yrs • {profile.weight} kg
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-400">No profile active.</span>
            <button
              onClick={onOpenOnboarding}
              className="px-3 py-1 text-xs font-semibold rounded-lg bg-emerald-500 text-zinc-950 hover:bg-emerald-400 flex items-center gap-1.5 transition-colors shadow-sm shadow-emerald-500/30"
            >
              Start Onboarding <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Metric / Imperial toggle */}
        <button
          onClick={onToggleUnits}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 hover:text-zinc-100 hover:border-zinc-700 transition-colors"
          title="Toggle Unit System"
        >
          <Globe className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-semibold uppercase tracking-wider">{units}</span>
        </button>

        {/* Demo Mode Button */}
        <button
          onClick={onLoadDemo}
          disabled={isLoadingDemo}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-emerald-500/30 text-xs font-medium text-emerald-300 hover:bg-emerald-500/10 hover:border-emerald-500/50 transition-all disabled:opacity-50"
          title="Load pre-configured demo athlete with 30-day tracking data"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
          <span>{isLoadingDemo ? 'Loading...' : 'Try Demo Mode'}</span>
        </button>

        {/* Medical / Disclaimer info */}
        <button
          onClick={onOpenDisclaimer}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 hover:text-amber-400 transition-colors"
          title="View Medical and Algorithmic Disclaimers"
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
          <span className="hidden sm:inline">Disclaimer</span>
        </button>
      </div>
    </header>
  );
};
