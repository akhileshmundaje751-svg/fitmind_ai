import React from 'react';
import {
  Activity,
  Apple,
  ArrowUpRight,
  Bot,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Dumbbell,
  Flame,
  LineChart,
  RefreshCw,
  Scale,
  Sparkles,
  TrendingDown,
  TrendingUp,
  User,
  Zap,
} from 'lucide-react';
import {
  CalculationResults,
  DietPlan,
  ProgressEntry,
  UnitSystem,
  UserProfile,
  WorkoutPlan,
} from '../../types';
import { formatLength, formatWeight } from '../../lib/storage';
import { InteractiveAreaChart, MacroDonutChart, MiniSparkline } from '../ui/Charts';
import { NavTab } from '../layout/Sidebar';

interface DashboardViewProps {
  profile: UserProfile | null;
  calculations: CalculationResults | null;
  dietPlan: DietPlan | null;
  workoutPlan: WorkoutPlan | null;
  progress: ProgressEntry[];
  units: UnitSystem;
  onNavigate: (tab: NavTab) => void;
  onOpenOnboarding: () => void;
  onGenerateDiet: () => void;
  onGenerateWorkout: () => void;
  isGeneratingDiet: boolean;
  isGeneratingWorkout: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  profile,
  calculations,
  dietPlan,
  workoutPlan,
  progress,
  units,
  onNavigate,
  onOpenOnboarding,
  onGenerateDiet,
  onGenerateWorkout,
  isGeneratingDiet,
  isGeneratingWorkout,
}) => {
  if (!profile || !calculations) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center space-y-6 my-12">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
          <Zap className="w-8 h-8 fill-current" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-zinc-100 tracking-tight">
            Welcome to FitMind AI
          </h2>
          <p className="text-sm text-zinc-400 max-w-lg mx-auto">
            Your clinical-grade fitness and nutrition command center. Complete your onboarding to unlock US Navy body fat estimation, Mifflin-St Jeor metabolic tracking, and custom AI plans.
          </p>
        </div>
        <button
          onClick={onOpenOnboarding}
          className="px-6 py-3 rounded-xl bg-emerald-500 text-zinc-950 font-extrabold text-sm hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20 inline-flex items-center gap-2"
        >
          Begin 6-Step Onboarding <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  const { bodyFatNavy, bmi, bmr, tdee, nutritionTargets, bodyComposition } = calculations;

  // Today's meal plan (Day 1 for preview)
  const todayMealPlan = dietPlan?.days?.[0];
  // Today's workout (Day 1)
  const todayWorkout = workoutPlan?.days?.[0];

  // Weight progression chart data
  const weightChartData = progress.map((p) => ({
    label: p.date,
    value: units === 'imperial' ? Number((p.weightKg * 2.20462).toFixed(1)) : p.weightKg,
  }));

  // Sparkline data from recent weights
  const recentWeights = progress.slice(-8).map((p) => p.weightKg);

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-emerald-950/20 p-6 rounded-2xl border border-zinc-800/80 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-widest text-emerald-400">
              Welcome back
            </span>
            <span className="text-zinc-600">•</span>
            <span className="text-xs text-zinc-400 font-medium">Daily Fitness Briefing</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-zinc-100 tracking-tight">
            Hello, {profile.name}
          </h1>
          <p className="text-xs md:text-sm text-zinc-400">
            Goal: <span className="text-zinc-200 font-semibold capitalize">{profile.goals.primaryGoal.replace('_', ' ')}</span> • {nutritionTargets.strategyDescription}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onNavigate('ai-assistant')}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200 border border-zinc-700/60 flex items-center gap-2 transition-all shadow-sm"
          >
            <Bot className="w-3.5 h-3.5 text-emerald-400" /> Ask FitMind AI
          </button>
          <button
            onClick={() => onNavigate('progress')}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-xs font-extrabold text-zinc-950 flex items-center gap-2 transition-all shadow-md shadow-emerald-500/20"
          >
            <Scale className="w-3.5 h-3.5" /> Log Measurements
          </button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Weight Card */}
        <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800/80 relative overflow-hidden group hover:border-zinc-700/80 transition-all">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider">Body Weight</span>
            <Scale className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-zinc-100">
              {formatWeight(profile.weight, units)}
            </span>
            {recentWeights.length > 1 && (
              <span className="text-xs text-emerald-400 font-bold flex items-center">
                <TrendingDown className="w-3 h-3 mr-0.5" />
                Active Track
              </span>
            )}
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-400 pt-2 border-t border-zinc-800/60">
            <span>Target: {profile.goals.targetWeight ? formatWeight(profile.goals.targetWeight, units) : 'Maintenance'}</span>
            {recentWeights.length > 1 && (
              <MiniSparkline data={recentWeights} color="#10b981" width={75} height={20} />
            )}
          </div>
        </div>

        {/* US Navy Body Fat Card */}
        <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800/80 relative overflow-hidden group hover:border-zinc-700/80 transition-all">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider">Estimated Body Fat</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-zinc-100">
              {bodyFatNavy.isValid ? `${bodyFatNavy.percentage}%` : 'N/A'}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              {bodyFatNavy.category}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-400 pt-2 border-t border-zinc-800/60">
            <span>Method: US Navy Circumference</span>
            <span className="text-zinc-300 font-semibold">{bodyComposition.leanMassKg} kg Lean</span>
          </div>
        </div>

        {/* Daily Calorie Target Card */}
        <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800/80 relative overflow-hidden group hover:border-zinc-700/80 transition-all">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider">Calorie Target</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-zinc-100">
              {nutritionTargets.dailyCalories}
            </span>
            <span className="text-xs text-zinc-400 font-medium">kcal / day</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-400 pt-2 border-t border-zinc-800/60">
            <span>TDEE: {tdee.value} kcal</span>
            <span className="text-amber-400 font-semibold">
              {nutritionTargets.deficitOrSurplusPercentage > 0 ? `+${nutritionTargets.deficitOrSurplusPercentage}%` : `${nutritionTargets.deficitOrSurplusPercentage}%`}
            </span>
          </div>
        </div>

        {/* Protein Target Card */}
        <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800/80 relative overflow-hidden group hover:border-zinc-700/80 transition-all">
          <div className="flex items-center justify-between text-zinc-400 text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider">Daily Protein</span>
            <Apple className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-zinc-100">
              {nutritionTargets.proteinGrams}g
            </span>
            <span className="text-xs text-zinc-400 font-medium">
              ({(nutritionTargets.proteinGrams / profile.weight).toFixed(1)}g / kg)
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-400 pt-2 border-t border-zinc-800/60">
            <span>BMI: {bmi.value} ({bmi.category})</span>
            <span className="text-emerald-400 font-semibold">
              {nutritionTargets.proteinCalories} kcal
            </span>
          </div>
        </div>
      </div>

      {/* Center Grid: Nutrition Macro Balance & Progress Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Macro Distribution Card */}
        <div className="p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-zinc-100 uppercase tracking-wider">
              Macronutrient Partitioning
            </h3>
            <button
              onClick={() => onNavigate('diet')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
            >
              Diet Plan <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-xs text-zinc-400">
            Goal-aligned energy distribution calculated to optimize protein synthesis and hormone balance.
          </p>

          <div className="py-2">
            <MacroDonutChart
              proteinG={nutritionTargets.proteinGrams}
              carbsG={nutritionTargets.carbsGrams}
              fatG={nutritionTargets.fatGrams}
              totalCalories={nutritionTargets.dailyCalories}
            />
          </div>

          <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800/60 text-xs text-zinc-400 flex items-center justify-between">
            <span>Hydration Target:</span>
            <span className="font-semibold text-cyan-400">
              {profile.lifestyle.dailyWaterLiters || (profile.weight * 0.035).toFixed(1)} Liters / Day
            </span>
          </div>
        </div>

        {/* Weight Progression Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-zinc-100 uppercase tracking-wider">
                Weight & Body Composition Trend
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Historical records and trend trajectory
              </p>
            </div>
            <button
              onClick={() => onNavigate('progress')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
            >
              Full Analytics <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <InteractiveAreaChart
            data={weightChartData}
            color="#10b981"
            unit={units === 'imperial' ? 'lbs' : 'kg'}
            height={210}
          />
        </div>
      </div>

      {/* Bottom Grid: Today's Workout & Today's Nutrition Plan */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Workout Card */}
        <div className="p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Dumbbell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-zinc-100">
                  {todayWorkout?.dayName || "Today's Workout Program"}
                </h3>
                <span className="text-xs text-zinc-400">{todayWorkout?.focus || 'Scheduled Protocol'}</span>
              </div>
            </div>
            <button
              onClick={() => onNavigate('workout')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
            >
              View Schedule <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {todayWorkout ? (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
                <span>Estimated Duration: {todayWorkout.estimatedDurationMinutes} mins</span>
                <span>{todayWorkout.exercises.length} Exercises Planned</span>
              </div>
              <div className="space-y-2">
                {todayWorkout.exercises.slice(0, 3).map((ex) => (
                  <div
                    key={ex.id}
                    className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800/60 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-zinc-200 block">{ex.name}</span>
                      <span className="text-[11px] text-zinc-400">{ex.targetMuscleGroups.join(', ')}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-emerald-400">{ex.sets} sets × {ex.reps}</span>
                      <span className="text-[10px] text-zinc-400 block">{ex.restSeconds}s rest</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-6 text-center border border-dashed border-zinc-800 rounded-xl space-y-3">
              <p className="text-xs text-zinc-400">No workout program generated yet.</p>
              <button
                onClick={onGenerateWorkout}
                disabled={isGeneratingWorkout}
                className="px-4 py-2 rounded-xl bg-emerald-500 text-zinc-950 font-bold text-xs hover:bg-emerald-400 transition-all inline-flex items-center gap-1.5 shadow-md shadow-emerald-500/20 disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {isGeneratingWorkout ? 'Building Routine...' : 'Generate AI Workout Program'}
              </button>
            </div>
          )}
        </div>

        {/* Today's Meal Plan Card */}
        <div className="p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Apple className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-zinc-100">
                  {todayMealPlan ? `Day 1 Menu: ${todayMealPlan.dayName}` : "Today's Meal Plan"}
                </h3>
                <span className="text-xs text-zinc-400">
                  Target: {nutritionTargets.dailyCalories} kcal • {nutritionTargets.proteinGrams}g Protein
                </span>
              </div>
            </div>
            <button
              onClick={() => onNavigate('diet')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
            >
              Full Diet <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {todayMealPlan ? (
            <div className="space-y-2">
              {[
                { type: 'Breakfast', meal: todayMealPlan.meals.breakfast },
                { type: 'Lunch', meal: todayMealPlan.meals.lunch },
                { type: 'Evening Snack', meal: todayMealPlan.meals.eveningSnack },
                { type: 'Dinner', meal: todayMealPlan.meals.dinner },
              ]
                .filter((item) => Boolean(item.meal))
                .map((item) => (
                  <div
                    key={item.type}
                    className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800/60 flex items-center justify-between text-xs"
                  >
                    <div className="max-w-[70%]">
                      <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider block">
                        {item.type}
                      </span>
                      <span className="font-semibold text-zinc-200 truncate block">
                        {item.meal!.name}
                      </span>
                      <span className="text-[11px] text-zinc-400">{item.meal!.portion}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-bold text-zinc-100 block">{item.meal!.calories} kcal</span>
                      <span className="text-[11px] text-emerald-400 font-semibold">
                        {item.meal!.protein}g P
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="p-6 text-center border border-dashed border-zinc-800 rounded-xl space-y-3">
              <p className="text-xs text-zinc-400">No diet plan generated yet.</p>
              <button
                onClick={onGenerateDiet}
                disabled={isGeneratingDiet}
                className="px-4 py-2 rounded-xl bg-cyan-500 text-zinc-950 font-bold text-xs hover:bg-cyan-400 transition-all inline-flex items-center gap-1.5 shadow-md shadow-cyan-500/20 disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {isGeneratingDiet ? 'Creating Menu...' : 'Generate 7-Day AI Diet Plan'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
