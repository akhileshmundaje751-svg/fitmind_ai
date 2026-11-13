import React from 'react';
import {
  Activity,
  AlertTriangle,
  Award,
  CheckCircle2,
  ChevronRight,
  Flame,
  Info,
  Scale,
  ShieldAlert,
  Zap,
} from 'lucide-react';
import { CalculationResults, UnitSystem, UserProfile } from '../../types';
import { formatLength, formatWeight } from '../../lib/storage';

interface BodyAnalysisViewProps {
  profile: UserProfile | null;
  calculations: CalculationResults | null;
  units: UnitSystem;
  onOpenOnboarding: () => void;
}

export const BodyAnalysisView: React.FC<BodyAnalysisViewProps> = ({
  profile,
  calculations,
  units,
  onOpenOnboarding,
}) => {
  if (!profile || !calculations) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-zinc-400">Please complete onboarding to view body composition analytics.</p>
        <button
          onClick={onOpenOnboarding}
          className="px-5 py-2.5 bg-emerald-500 text-zinc-950 font-bold text-xs rounded-xl"
        >
          Setup Profile
        </button>
      </div>
    );
  }

  const { bodyFatNavy, bmi, bmr, tdee, bodyComposition, nutritionTargets, disclaimers } = calculations;

  // ACE Body Fat Categories for Male/Female
  const aceScale = profile.sex === 'male'
    ? [
        { label: 'Essential Fat', range: '2% - 5%', color: 'text-amber-400 bg-amber-500/10' },
        { label: 'Athletes', range: '6% - 13%', color: 'text-emerald-400 bg-emerald-500/10' },
        { label: 'Fitness', range: '14% - 17%', color: 'text-cyan-400 bg-cyan-500/10' },
        { label: 'Acceptable', range: '18% - 24%', color: 'text-blue-400 bg-blue-500/10' },
        { label: 'High', range: '25%+', color: 'text-rose-400 bg-rose-500/10' },
      ]
    : [
        { label: 'Essential Fat', range: '10% - 13%', color: 'text-amber-400 bg-amber-500/10' },
        { label: 'Athletes', range: '14% - 20%', color: 'text-emerald-400 bg-emerald-500/10' },
        { label: 'Fitness', range: '21% - 24%', color: 'text-cyan-400 bg-cyan-500/10' },
        { label: 'Acceptable', range: '25% - 31%', color: 'text-blue-400 bg-blue-500/10' },
        { label: 'High', range: '32%+', color: 'text-rose-400 bg-rose-500/10' },
      ];

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-400">
              Deterministic Analytics
            </span>
            <span className="text-zinc-600">•</span>
            <span className="text-xs text-zinc-400 font-medium">Circumference Regression Engine</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-zinc-100 tracking-tight mt-1">
            Body Composition & Metabolic Analysis
          </h1>
          <p className="text-xs md:text-sm text-zinc-400 mt-1 max-w-2xl">
            Calculated through clinically validated mathematical regression formulas. Numbers are separated from generative AI to ensure mathematical accuracy and repeatability.
          </p>
        </div>
        <button
          onClick={onOpenOnboarding}
          className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200 border border-zinc-700/60 self-start md:self-auto"
        >
          Update Measurements
        </button>
      </div>

      {/* Primary Comparison Banner: Lean Mass vs Fat Mass */}
      <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800/80 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-extrabold text-zinc-100 tracking-tight">
              Total Mass Partitioning ({formatWeight(profile.weight, units)})
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Distinguishing active skeletal muscle, bone, and organs from adipose tissue
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-500" />
              <span className="text-zinc-300 font-semibold">Lean Body Mass ({100 - (bodyFatNavy.percentage || 0)}%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-cyan-500" />
              <span className="text-zinc-300 font-semibold">Fat Mass ({bodyFatNavy.percentage || 0}%)</span>
            </div>
          </div>
        </div>

        {/* Visual Partitioning Bar */}
        <div className="space-y-2">
          <div className="w-full h-8 bg-zinc-950 rounded-xl overflow-hidden flex border border-zinc-800 p-1">
            <div
              style={{ width: `${Math.max(5, 100 - (bodyFatNavy.percentage || 20))}%` }}
              className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-lg flex items-center px-3 transition-all duration-500"
            >
              <span className="text-[11px] font-extrabold text-zinc-950 truncate">
                {units === 'imperial' ? `${bodyComposition.leanMassLbs} lbs` : `${bodyComposition.leanMassKg} kg`}
              </span>
            </div>
            <div
              style={{ width: `${Math.max(5, bodyFatNavy.percentage || 20)}%` }}
              className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-lg flex items-center justify-end px-3 transition-all duration-500"
            >
              <span className="text-[11px] font-extrabold text-zinc-950 truncate">
                {units === 'imperial' ? `${bodyComposition.fatMassLbs} lbs` : `${bodyComposition.fatMassKg} kg`}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
            <span>
              <strong className="text-zinc-200">Lean Mass:</strong> Skeletal muscle, bones, connective tissue, vital organs, blood volume.
            </span>
            <span>
              <strong className="text-zinc-200">Fat Mass:</strong> Essential cellular lipids & storage adipose tissue.
            </span>
          </div>
        </div>
      </div>

      {/* Grid of Clinical Calculations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* US Navy Body Fat Card */}
        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              US Navy Body Fat
            </span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="text-3xl font-black text-zinc-100">
              {bodyFatNavy.isValid ? `${bodyFatNavy.percentage}%` : 'Incomplete'}
            </div>
            <span className="inline-block mt-1 text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {bodyFatNavy.category}
            </span>
          </div>
          <div className="text-[11px] text-zinc-400 pt-2 border-t border-zinc-800/80 space-y-1">
            <div className="flex justify-between">
              <span>Waist:</span>
              <span className="font-semibold text-zinc-200">{formatLength(profile.measurements.waist, units)}</span>
            </div>
            <div className="flex justify-between">
              <span>Neck:</span>
              <span className="font-semibold text-zinc-200">{formatLength(profile.measurements.neck, units)}</span>
            </div>
            {profile.sex === 'female' && (
              <div className="flex justify-between">
                <span>Hip:</span>
                <span className="font-semibold text-zinc-200">{formatLength(profile.measurements.hip || 0, units)}</span>
              </div>
            )}
          </div>
        </div>

        {/* BMI Card */}
        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              Body Mass Index
            </span>
            <Scale className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <div className="text-3xl font-black text-zinc-100">{bmi.value}</div>
            <span className="inline-block mt-1 text-xs px-2.5 py-0.5 rounded-full font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              {bmi.category}
            </span>
          </div>
          <div className="text-[11px] text-zinc-400 pt-2 border-t border-zinc-800/80 space-y-1">
            <div className="flex justify-between">
              <span>Height:</span>
              <span className="font-semibold text-zinc-200">{formatLength(profile.height, units)}</span>
            </div>
            <div className="flex justify-between">
              <span>Healthy Range:</span>
              <span className="font-semibold text-zinc-200">
                {bmi.healthyWeightRangeKg[0]} - {bmi.healthyWeightRangeKg[1]} kg
              </span>
            </div>
          </div>
        </div>

        {/* Mifflin-St Jeor BMR Card */}
        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Basal Metabolic Rate
            </span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <div className="text-3xl font-black text-zinc-100">{bmr.value}</div>
            <span className="text-xs text-zinc-400 font-medium">kcal at complete physical rest</span>
          </div>
          <div className="text-[11px] text-zinc-400 pt-2 border-t border-zinc-800/80 space-y-1">
            <div className="flex justify-between">
              <span>Formula:</span>
              <span className="font-semibold text-zinc-200">Mifflin-St Jeor</span>
            </div>
            <div className="flex justify-between">
              <span>Age & Sex:</span>
              <span className="font-semibold text-zinc-200">{profile.age}y • {profile.sex}</span>
            </div>
          </div>
        </div>

        {/* TDEE Card */}
        <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
              Total Daily Expenditure
            </span>
            <Zap className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <div className="text-3xl font-black text-zinc-100">{tdee.value}</div>
            <span className="text-xs text-zinc-400 font-medium">estimated daily burn</span>
          </div>
          <div className="text-[11px] text-zinc-400 pt-2 border-t border-zinc-800/80 space-y-1">
            <div className="flex justify-between">
              <span>Multiplier:</span>
              <span className="font-semibold text-zinc-200">{tdee.multiplier}x</span>
            </div>
            <div className="flex justify-between">
              <span>Activity Tier:</span>
              <span className="font-semibold text-zinc-200 capitalize">{tdee.activityLevel.replace('_', ' ')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ACE Classification Reference Table & Scale */}
      <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-zinc-100 uppercase tracking-wider">
              ACE Body Fat Standards ({profile.sex === 'male' ? 'Men' : 'Women'})
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              American Council on Exercise demographic body composition categorization
            </p>
          </div>
          <span className="text-xs text-zinc-400">
            Your Tier: <strong className="text-emerald-400">{bodyFatNavy.category}</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {aceScale.map((tier) => {
            const isUserTier = bodyFatNavy.category === tier.label;
            return (
              <div
                key={tier.label}
                className={`p-3.5 rounded-xl border text-center transition-all ${
                  isUserTier
                    ? 'border-emerald-500 bg-emerald-500/10 shadow-sm shadow-emerald-500/20'
                    : 'border-zinc-800 bg-zinc-950'
                }`}
              >
                <span className={`text-[11px] font-extrabold uppercase tracking-wider block ${tier.color.split(' ')[0]}`}>
                  {tier.label}
                </span>
                <span className="text-base font-black text-zinc-100 block my-1">{tier.range}</span>
                {isUserTier && (
                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
                    <CheckCircle2 className="w-3 h-3" /> You Are Here
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Algorithmic Methodology Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3 text-xs text-zinc-300">
          <div className="flex items-center gap-2 text-zinc-100 font-bold text-sm">
            <Info className="w-4 h-4 text-emerald-400" />
            US Navy Circumference Equation
          </div>
          <p className="text-zinc-400 leading-relaxed">
            Developed by researchers Hodgdon and Beckett at the Naval Health Research Center. It computes estimated body density using logarithmic regression of abdominal and neck circumferences relative to height.
          </p>
          <div className="p-3 rounded-xl bg-zinc-950 font-mono text-[11px] text-zinc-400 border border-zinc-800/80 overflow-x-auto">
            {profile.sex === 'male' ? (
              <code>495 / (1.0324 - 0.19077*log10(waist-neck) + 0.15456*log10(height)) - 450</code>
            ) : (
              <code>495 / (1.29579 - 0.35004*log10(waist+hip-neck) + 0.22100*log10(height)) - 450</code>
            )}
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3 text-xs text-zinc-300">
          <div className="flex items-center gap-2 text-zinc-100 font-bold text-sm">
            <Flame className="w-4 h-4 text-amber-400" />
            Mifflin-St Jeor Energy Equation
          </div>
          <p className="text-zinc-400 leading-relaxed">
            The Mifflin-St Jeor equation is recognized by the Academy of Nutrition and Dietetics as the most clinically accurate predictive BMR equation for non-obese and obese adults.
          </p>
          <div className="p-3 rounded-xl bg-zinc-950 font-mono text-[11px] text-zinc-400 border border-zinc-800/80 overflow-x-auto">
            <code>
              {profile.sex === 'male'
                ? '(10 × weight_kg) + (6.25 × height_cm) - (5 × age) + 5'
                : '(10 × weight_kg) + (6.25 × height_cm) - (5 × age) - 161'}
            </code>
          </div>
        </div>
      </div>

      {/* Disclaimers & Safety Notice */}
      <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          Medical & Accuracy Disclaimer
        </div>
        <ul className="text-xs text-zinc-300 space-y-1 list-disc pl-4">
          {disclaimers.map((d, i) => (
            <li key={i}>{d}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};
