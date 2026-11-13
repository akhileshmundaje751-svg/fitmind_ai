import React, { useState } from 'react';
import {
  Activity,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Flame,
  Info,
  Plus,
  Scale,
  Sparkles,
  Trash2,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import {
  CalculationResults,
  ProgressEntry,
  UnitSystem,
  UserProfile,
} from '../../types';
import { calculateUSNavyBodyFat, cmToInches, inchesToCm, kgToLbs, lbsToKg } from '../../lib/calculations';
import { formatLength, formatWeight } from '../../lib/storage';
import { InteractiveAreaChart } from '../ui/Charts';

interface ProgressTrackerViewProps {
  profile: UserProfile | null;
  calculations: CalculationResults | null;
  progress: ProgressEntry[];
  units: UnitSystem;
  onAddEntry: (entry: ProgressEntry) => Promise<void>;
  onDeleteEntry: (id: string) => Promise<void>;
  onOpenOnboarding: () => void;
}

type TimeRange = '7d' | '30d' | '3m' | '6m' | '1y';

export const ProgressTrackerView: React.FC<ProgressTrackerViewProps> = ({
  profile,
  calculations,
  progress,
  units,
  onAddEntry,
  onDeleteEntry,
  onOpenOnboarding,
}) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [isLogging, setIsLogging] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // New Entry Form State
  const todayStr = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState<string>(todayStr);
  const [weight, setWeight] = useState<number>(profile?.weight || 78);
  const [waist, setWaist] = useState<number>(profile?.measurements.waist || 84);
  const [neck, setNeck] = useState<number>(profile?.measurements.neck || 38);
  const [hip, setHip] = useState<number>(profile?.measurements.hip || 96);
  const [workoutDone, setWorkoutDone] = useState<boolean>(true);
  const [adherenceScore, setAdherenceScore] = useState<number>(90);
  const [notes, setNotes] = useState<string>('');

  if (!profile) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-zinc-400">Please complete onboarding to track progress.</p>
        <button
          onClick={onOpenOnboarding}
          className="px-5 py-2.5 bg-emerald-500 text-zinc-950 font-bold text-xs rounded-xl"
        >
          Setup Profile
        </button>
      </div>
    );
  }

  // Filter progress entries by selected time range
  const now = new Date().getTime();
  const rangeDays: Record<TimeRange, number> = {
    '7d': 7,
    '30d': 30,
    '3m': 90,
    '6m': 180,
    '1y': 365,
  };

  const cutoff = now - rangeDays[timeRange] * 86400000;
  const filteredRecords = progress.filter(
    (p) => new Date(p.date).getTime() >= cutoff
  );

  const weightChartData = filteredRecords.map((p) => ({
    label: p.date,
    value: units === 'imperial' ? Number((p.weightKg * 2.20462).toFixed(1)) : p.weightKg,
  }));

  const bodyFatChartData = filteredRecords
    .filter((p) => p.bodyFatPct !== undefined)
    .map((p) => ({
      label: p.date,
      value: p.bodyFatPct!,
    }));

  // Delta calculations
  const latest = progress[progress.length - 1];
  const earliest = progress[0];
  const weightDelta = latest && earliest ? latest.weightKg - earliest.weightKg : 0;
  const bodyFatDelta =
    latest?.bodyFatPct !== undefined && earliest?.bodyFatPct !== undefined
      ? latest.bodyFatPct - earliest.bodyFatPct
      : 0;

  const handleSaveEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Calculate estimated body fat if waist & neck provided
      let calculatedBf: number | undefined = undefined;
      if (waist > 0 && neck > 0) {
        const bfResult = calculateUSNavyBodyFat(
          profile.sex,
          profile.height,
          waist,
          neck,
          profile.sex === 'female' ? hip : undefined
        );
        if (bfResult.isValid) {
          calculatedBf = bfResult.percentage;
        }
      }

      const newEntry: ProgressEntry = {
        id: `p-${Date.now()}`,
        userId: profile.id,
        date,
        weightKg: Number(weight),
        waistCm: waist ? Number(waist) : undefined,
        neckCm: neck ? Number(neck) : undefined,
        hipCm: hip ? Number(hip) : undefined,
        bodyFatPct: calculatedBf,
        workoutCompleted: workoutDone,
        calorieAdherenceScore: Number(adherenceScore),
        notes: notes.trim() || undefined,
      };

      await onAddEntry(newEntry);
      setIsLogging(false);
      setNotes('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-400">
              Longitudinal Metrics
            </span>
            <span className="text-zinc-600">•</span>
            <span className="text-xs text-zinc-400 font-medium">Trajectory & Compliance Analytics</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-zinc-100 tracking-tight mt-1">
            Progress & Performance Tracker
          </h1>
          <p className="text-xs md:text-sm text-zinc-400 mt-1">
            Track weight, body fat %, circumferences, and workout adherence. Short-term daily water fluctuations are normal; look for multi-week trends.
          </p>
        </div>

        <button
          onClick={() => setIsLogging(!isLogging)}
          className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-extrabold text-xs flex items-center gap-2 transition-all shadow-md shadow-emerald-500/20 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{isLogging ? 'Close Form' : 'Log Daily Check-in'}</span>
        </button>
      </div>

      {/* Log Entry Drawer Form */}
      {isLogging && (
        <form
          onSubmit={handleSaveEntry}
          className="p-6 rounded-2xl bg-zinc-900 border border-emerald-500/30 space-y-5 animate-in fade-in"
        >
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
              <Scale className="w-4 h-4 text-emerald-400" />
              Record New Anthropometric Check-In
            </h3>
            <span className="text-xs text-zinc-400">US Navy formula automatically estimates body fat %</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1.5 uppercase">Date *</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1.5 uppercase">
                Weight ({units === 'metric' ? 'kg' : 'lbs'}) *
              </label>
              <input
                type="number"
                step="0.1"
                value={units === 'metric' ? weight : Number(kgToLbs(weight).toFixed(1))}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setWeight(units === 'metric' ? val : lbsToKg(val));
                }}
                required
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1.5 uppercase">
                Waist ({units === 'metric' ? 'cm' : 'in'})
              </label>
              <input
                type="number"
                step="0.5"
                value={units === 'metric' ? waist : Number(cmToInches(waist).toFixed(1))}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setWaist(units === 'metric' ? val : inchesToCm(val));
                }}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-100"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1.5 uppercase">
                Neck ({units === 'metric' ? 'cm' : 'in'})
              </label>
              <input
                type="number"
                step="0.5"
                value={units === 'metric' ? neck : Number(cmToInches(neck).toFixed(1))}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setNeck(units === 'metric' ? val : inchesToCm(val));
                }}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1.5 uppercase">
                Workout Completed Today?
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setWorkoutDone(true)}
                  className={`py-2 rounded-xl text-xs font-bold border ${
                    workoutDone
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500'
                      : 'bg-zinc-950 text-zinc-400 border-zinc-800'
                  }`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setWorkoutDone(false)}
                  className={`py-2 rounded-xl text-xs font-bold border ${
                    !workoutDone
                      ? 'bg-zinc-800 text-zinc-200 border-zinc-700'
                      : 'bg-zinc-950 text-zinc-400 border-zinc-800'
                  }`}
                >
                  Rest / Off
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1.5 uppercase">
                Calorie Adherence: {adherenceScore}%
              </label>
              <input
                type="range"
                min="20"
                max="100"
                step="5"
                value={adherenceScore}
                onChange={(e) => setAdherenceScore(Number(e.target.value))}
                className="w-full accent-emerald-500 mt-2"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1.5 uppercase">Notes / Energy</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Great energy on squats, hit all protein"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-zinc-100"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
            <button
              type="button"
              onClick={() => setIsLogging(false)}
              className="px-4 py-2 text-xs text-zinc-400 hover:text-zinc-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-emerald-500 text-zinc-950 font-bold text-xs hover:bg-emerald-400 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Check-in'}
            </button>
          </div>
        </form>
      )}

      {/* Trajectory Delta Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Total Net Change</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-zinc-100">
              {weightDelta > 0 ? `+${weightDelta.toFixed(1)}` : weightDelta.toFixed(1)} {units === 'imperial' ? 'lbs' : 'kg'}
            </span>
            <span className={`text-xs font-bold flex items-center ${weightDelta < 0 ? 'text-emerald-400' : 'text-cyan-400'}`}>
              {weightDelta < 0 ? <TrendingDown className="w-3.5 h-3.5 mr-0.5" /> : <TrendingUp className="w-3.5 h-3.5 mr-0.5" />}
              {earliest ? `Since ${earliest.date}` : 'Baseline'}
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Body Fat Trajectory</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-zinc-100">
              {bodyFatDelta > 0 ? `+${bodyFatDelta.toFixed(1)}%` : `${bodyFatDelta.toFixed(1)}%`}
            </span>
            <span className="text-xs text-emerald-400 font-semibold">US Navy Method</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Logged Consistency</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-zinc-100">{progress.length} Check-ins</span>
            <span className="text-xs text-zinc-400">Across lifetime</span>
          </div>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
          Analytics Timeframe
        </span>
        <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
          {(['7d', '30d', '3m', '6m', '1y'] as TimeRange[]).map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                timeRange === r
                  ? 'bg-emerald-500 text-zinc-950 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {r.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weight Progression Chart */}
        <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
              <Scale className="w-4 h-4 text-emerald-400" />
              Weight Progression ({units === 'imperial' ? 'lbs' : 'kg'})
            </h3>
            <span className="text-xs text-zinc-400">{filteredRecords.length} records</span>
          </div>
          <InteractiveAreaChart
            data={weightChartData}
            color="#10b981"
            unit={units === 'imperial' ? 'lbs' : 'kg'}
            height={210}
          />
        </div>

        {/* Body Fat Progression Chart */}
        <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              Estimated Body Fat % (US Navy)
            </h3>
            <span className="text-xs text-zinc-400">{bodyFatChartData.length} calculated</span>
          </div>
          <InteractiveAreaChart
            data={bodyFatChartData}
            color="#06b6d4"
            unit="%"
            height={210}
          />
        </div>
      </div>

      {/* Historical Records Table */}
      <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
        <h3 className="text-sm font-extrabold text-zinc-100 uppercase tracking-wider">
          Recorded Log History
        </h3>

        {progress.length === 0 ? (
          <div className="p-6 text-center text-xs text-zinc-500">
            No records logged yet. Click &ldquo;Log Daily Check-in&rdquo; to add your first entry!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] uppercase font-bold text-zinc-400 border-b border-zinc-800">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Weight</th>
                  <th className="py-2.5 px-3">Waist</th>
                  <th className="py-2.5 px-3">Body Fat</th>
                  <th className="py-2.5 px-3">Workout</th>
                  <th className="py-2.5 px-3">Adherence</th>
                  <th className="py-2.5 px-3">Notes</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {progress.slice().reverse().map((entry) => (
                  <tr key={entry.id} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="py-3 px-3 font-semibold text-zinc-200">{entry.date}</td>
                    <td className="py-3 px-3 font-bold text-zinc-100">
                      {formatWeight(entry.weightKg, units)}
                    </td>
                    <td className="py-3 px-3 text-zinc-300">
                      {entry.waistCm ? formatLength(entry.waistCm, units) : '—'}
                    </td>
                    <td className="py-3 px-3 font-semibold text-emerald-400">
                      {entry.bodyFatPct !== undefined ? `${entry.bodyFatPct}%` : '—'}
                    </td>
                    <td className="py-3 px-3">
                      {entry.workoutCompleted ? (
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Done
                        </span>
                      ) : (
                        <span className="text-zinc-500">Rest</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-zinc-300">
                      {entry.calorieAdherenceScore !== undefined ? `${entry.calorieAdherenceScore}%` : '—'}
                    </td>
                    <td className="py-3 px-3 text-zinc-400 truncate max-w-[180px]">
                      {entry.notes || '—'}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => onDeleteEntry(entry.id)}
                        className="text-zinc-500 hover:text-rose-400 transition-colors p-1"
                        title="Delete entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
