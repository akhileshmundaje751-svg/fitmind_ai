import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Check,
  ChevronRight,
  Clock,
  Dumbbell,
  Flame,
  Info,
  RefreshCw,
  Repeat,
  ShieldAlert,
  Sparkles,
  Zap,
} from 'lucide-react';
import {
  CalculationResults,
  ExerciseItem,
  UserProfile,
  WorkoutPlan,
} from '../../types';

interface WorkoutPlannerViewProps {
  profile: UserProfile | null;
  workoutPlan: WorkoutPlan | null;
  onGenerateWorkout: () => void;
  onReplaceExercise: (dayFocus: string, existingExercise: ExerciseItem) => Promise<void>;
  isGeneratingWorkout: boolean;
  onOpenOnboarding: () => void;
}

export const WorkoutPlannerView: React.FC<WorkoutPlannerViewProps> = ({
  profile,
  workoutPlan,
  onGenerateWorkout,
  onReplaceExercise,
  isGeneratingWorkout,
  onOpenOnboarding,
}) => {
  const [selectedDayIdx, setSelectedDayIdx] = useState<number>(0);
  const [replacingId, setReplacingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'schedule' | 'overload' | 'recovery'>('schedule');

  if (!profile) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-zinc-400">Please complete onboarding to generate your customized workout program.</p>
        <button
          onClick={onOpenOnboarding}
          className="px-5 py-2.5 bg-emerald-500 text-zinc-950 font-bold text-xs rounded-xl"
        >
          Setup Profile
        </button>
      </div>
    );
  }

  const currentDay = workoutPlan?.days?.[selectedDayIdx];

  const handleSwapExercise = async (ex: ExerciseItem) => {
    if (!currentDay) return;
    setReplacingId(ex.id);
    try {
      await onReplaceExercise(currentDay.focus, ex);
    } finally {
      setReplacingId(null);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-400">
              Evidence-Based Periodization
            </span>
            <span className="text-zinc-600">•</span>
            <span className="text-xs text-zinc-400 font-medium">Strength & Conditioning Protocol</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-zinc-100 tracking-tight mt-1">
            Workout Program & Split Routine
          </h1>
          <p className="text-xs md:text-sm text-zinc-400 mt-1">
            {profile.fitness.daysPerWeek} Days / Week • Access: <span className="text-zinc-200 capitalize font-medium">{profile.fitness.gymAccess.replace('_', ' ')}</span> • Level: <span className="capitalize text-emerald-400 font-semibold">{profile.fitness.level}</span>
          </p>
        </div>

        <button
          onClick={onGenerateWorkout}
          disabled={isGeneratingWorkout}
          className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-extrabold text-xs flex items-center gap-2 transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50 self-start md:self-auto"
        >
          <Sparkles className="w-4 h-4" />
          {isGeneratingWorkout ? 'Generating Program...' : 'Regenerate Entire Program with AI'}
        </button>
      </div>

      {/* Injury Safeguard Banner if injuries reported */}
      {profile.fitness.injuries && profile.fitness.injuries.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3 text-xs text-amber-200">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
          <div>
            <strong className="font-bold">Active Injury Safeguard: </strong>
            Exercises are screened to safeguard against: <span className="text-amber-100 font-semibold">{profile.fitness.injuries.join(', ')}</span>.
          </div>
        </div>
      )}

      {workoutPlan ? (
        <>
          {/* Sub Navigation */}
          <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-3">
            <button
              onClick={() => setActiveTab('schedule')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'schedule'
                  ? 'bg-zinc-800 text-zinc-100 border border-zinc-700/80 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Weekly Training Schedule
            </button>
            <button
              onClick={() => setActiveTab('overload')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'overload'
                  ? 'bg-zinc-800 text-zinc-100 border border-zinc-700/80 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Progressive Overload Rules
            </button>
            <button
              onClick={() => setActiveTab('recovery')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'recovery'
                  ? 'bg-zinc-800 text-zinc-100 border border-zinc-700/80 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Recovery Protocol
            </button>
          </div>

          {/* TAB 1: SCHEDULE */}
          {activeTab === 'schedule' && currentDay && (
            <div className="space-y-6">
              {/* Day Selector Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {workoutPlan.days.map((d, idx) => (
                  <button
                    key={d.dayNumber}
                    onClick={() => setSelectedDayIdx(idx)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                      selectedDayIdx === idx
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500 shadow-sm shadow-emerald-500/10'
                        : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <span>{d.dayName}</span>
                    <span className="block text-[10px] text-zinc-400 font-medium">
                      {d.isRestDay ? 'Rest / Active Recovery' : `${d.exercises.length} Exercises`}
                    </span>
                  </button>
                ))}
              </div>

              {/* Day Focus Header Banner */}
              <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-400">
                      Day {currentDay.dayNumber} Focus
                    </span>
                    {currentDay.isRestDay && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300">
                        Rest & Regeneration
                      </span>
                    )}
                  </div>
                  <h2 className="text-lg font-bold text-zinc-100 mt-0.5">{currentDay.focus}</h2>
                </div>

                {!currentDay.isRestDay && (
                  <div className="flex items-center gap-4 text-xs text-zinc-400">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-emerald-400" />
                      <span>{currentDay.estimatedDurationMinutes} Minutes</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Dumbbell className="w-4 h-4 text-cyan-400" />
                      <span>{currentDay.exercises.length} Exercises</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Warm-up Routine */}
              {currentDay.warmupRoutine && currentDay.warmupRoutine.length > 0 && (
                <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-2">
                  <span className="text-xs uppercase font-bold tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5" />
                    Targeted Dynamic Warm-up Routine (5-8 Mins)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-zinc-300">
                    {currentDay.warmupRoutine.map((w, i) => (
                      <div key={i} className="p-2 rounded-lg bg-zinc-950/80 border border-zinc-800/60 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                        <span>{w}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Exercises List */}
              {currentDay.isRestDay ? (
                <div className="p-8 text-center bg-zinc-900/40 border border-dashed border-zinc-800 rounded-2xl space-y-2">
                  <div className="w-10 h-10 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400">
                    <Zap className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-zinc-200">Scheduled Recovery Day</h3>
                  <p className="text-xs text-zinc-400 max-w-md mx-auto">
                    Muscles grow during recovery, not during the workout. Take a light 20-30 minute walk, perform light foam rolling, and ensure adequate hydration and protein.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {currentDay.exercises.map((ex, idx) => {
                    const isReplacing = replacingId === ex.id;
                    return (
                      <div
                        key={ex.id}
                        className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4 hover:border-zinc-700/80 transition-all"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-zinc-800 text-[11px] font-extrabold flex items-center justify-center text-zinc-300">
                                {idx + 1}
                              </span>
                              <h3 className="text-base font-bold text-zinc-100">{ex.name}</h3>
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                                {ex.category}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-1.5 text-xs text-zinc-400 pt-1">
                              <span className="text-emerald-400 font-semibold">{ex.targetMuscleGroups.join(', ')}</span>
                              <span>•</span>
                              <span>Equipment: {ex.equipment}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <span className="text-base font-black text-emerald-400 block">
                                {ex.sets} sets × {ex.reps}
                              </span>
                              <span className="text-xs text-zinc-400">{ex.restSeconds}s rest</span>
                            </div>

                            <button
                              onClick={() => handleSwapExercise(ex)}
                              disabled={isReplacing}
                              className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-emerald-400 transition-colors disabled:opacity-50"
                              title="Replace with alternative exercise"
                            >
                              <RefreshCw className={`w-4 h-4 ${isReplacing ? 'animate-spin text-emerald-400' : ''}`} />
                            </button>
                          </div>
                        </div>

                        {/* Instructions & Form Cues */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-2 border-t border-zinc-800/60">
                          <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800/60 space-y-1">
                            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block">
                              Execution Blueprint:
                            </span>
                            <p className="text-zinc-300">{ex.instructions}</p>
                          </div>

                          <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800/60 space-y-1">
                            <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block">
                              Critical Form & Joint Cues:
                            </span>
                            <ul className="space-y-1 text-zinc-300">
                              {ex.formCues.map((cue, i) => (
                                <li key={i} className="flex items-center gap-1.5">
                                  <span className="w-1 h-1 rounded-full bg-emerald-400 shrink-0" />
                                  <span>{cue}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Cool-down Routine */}
              {currentDay.cooldownRoutine && currentDay.cooldownRoutine.length > 0 && (
                <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-2">
                  <span className="text-xs uppercase font-bold tracking-wider text-cyan-400 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" />
                    Parasympathetic Cool-down & Mobility (3-5 Mins)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-zinc-300">
                    {currentDay.cooldownRoutine.map((c, i) => (
                      <div key={i} className="p-2 rounded-lg bg-zinc-950/80 border border-zinc-800/60 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                        <span>{c}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PROGRESSIVE OVERLOAD */}
          {activeTab === 'overload' && (
            <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
              <h3 className="text-sm font-extrabold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
                <Repeat className="w-4 h-4 text-emerald-400" />
                Progressive Overload Blueprint
              </h3>
              <p className="text-xs text-zinc-400">
                To stimulate ongoing muscular hypertrophy and neurological adaptation, implement micro-progressions each week:
              </p>
              <div className="space-y-3">
                {workoutPlan.progressiveOverloadGuidelines.map((g, i) => (
                  <div key={i} className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800/80 text-xs text-zinc-200 flex items-start gap-3">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{g}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: RECOVERY PROTOCOL */}
          {activeTab === 'recovery' && (
            <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
              <h3 className="text-sm font-extrabold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                Circadian & CNS Recovery Protocol
              </h3>
              <div className="space-y-3">
                {workoutPlan.recoveryProtocol.map((r, i) => (
                  <div key={i} className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800/80 text-xs text-zinc-200 flex items-start gap-3">
                    <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span>{r}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="p-12 text-center border border-dashed border-zinc-800 rounded-2xl space-y-4 bg-zinc-900/40">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
            <Dumbbell className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-zinc-100">No Workout Program Active</h3>
            <p className="text-xs text-zinc-400 max-w-md mx-auto mt-1">
              Generate a science-backed weekly workout schedule matched to your equipment, available days, and injury limits.
            </p>
          </div>
          <button
            onClick={onGenerateWorkout}
            disabled={isGeneratingWorkout}
            className="px-6 py-2.5 rounded-xl bg-emerald-500 text-zinc-950 font-extrabold text-xs hover:bg-emerald-400 transition-all inline-flex items-center gap-2 shadow-md shadow-emerald-500/20 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            {isGeneratingWorkout ? 'Generating...' : 'Generate Workout Program'}
          </button>
        </div>
      )}
    </div>
  );
};
