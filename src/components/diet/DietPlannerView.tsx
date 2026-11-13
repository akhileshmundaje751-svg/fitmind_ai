import React, { useState } from 'react';
import {
  Apple,
  Check,
  ChevronRight,
  DollarSign,
  Droplets,
  Flame,
  Info,
  RefreshCw,
  ShoppingBag,
  Sparkles,
  Utensils,
  Wheat,
} from 'lucide-react';
import {
  CalculationResults,
  DietPlan,
  MealItem,
  UnitSystem,
  UserProfile,
} from '../../types';
import { MacroDonutChart } from '../ui/Charts';

interface DietPlannerViewProps {
  profile: UserProfile | null;
  calculations: CalculationResults | null;
  dietPlan: DietPlan | null;
  onGenerateDiet: () => void;
  onRegenerateMeal: (dayNumber: number, mealType: string, existingMeal: MealItem) => Promise<void>;
  isGeneratingDiet: boolean;
  onOpenOnboarding: () => void;
}

export const DietPlannerView: React.FC<DietPlannerViewProps> = ({
  profile,
  calculations,
  dietPlan,
  onGenerateDiet,
  onRegenerateMeal,
  isGeneratingDiet,
  onOpenOnboarding,
}) => {
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [swappingMealKey, setSwappingMealKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'schedule' | 'grocery' | 'notes'>('schedule');

  if (!profile || !calculations) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-zinc-400">Please complete onboarding to generate your personalized diet plan.</p>
        <button
          onClick={onOpenOnboarding}
          className="px-5 py-2.5 bg-emerald-500 text-zinc-950 font-bold text-xs rounded-xl"
        >
          Setup Profile
        </button>
      </div>
    );
  }

  const { nutritionTargets } = calculations;

  const currentDay = dietPlan?.days?.[selectedDayIndex];

  const handleSwapMeal = async (mealType: string, meal: MealItem) => {
    if (!currentDay) return;
    setSwappingMealKey(mealType);
    try {
      await onRegenerateMeal(currentDay.dayNumber, mealType, meal);
    } finally {
      setSwappingMealKey(null);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-400">
              Personalized Sports Nutrition
            </span>
            <span className="text-zinc-600">•</span>
            <span className="text-xs text-zinc-400 font-medium">7-Day Macro-Synchronized Blueprint</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-zinc-100 tracking-tight mt-1">
            Diet & Meal Plan Planner
          </h1>
          <p className="text-xs md:text-sm text-zinc-400 mt-1">
            Target: <strong className="text-zinc-200">{nutritionTargets.dailyCalories} kcal</strong> ({nutritionTargets.proteinGrams}g Protein, {nutritionTargets.carbsGrams}g Carbs, {nutritionTargets.fatGrams}g Fat) • Cuisine: <span className="capitalize text-emerald-400">{profile.diet.preferredCuisine}</span>
          </p>
        </div>

        <button
          onClick={onGenerateDiet}
          disabled={isGeneratingDiet}
          className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-extrabold text-xs flex items-center gap-2 transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50 self-start md:self-auto"
        >
          <Sparkles className="w-4 h-4" />
          {isGeneratingDiet ? 'Cooking Up Plan...' : 'Regenerate Entire Diet Plan with AI'}
        </button>
      </div>

      {dietPlan ? (
        <>
          {/* Sub Navigation: Schedule vs Grocery vs Notes */}
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('schedule')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'schedule'
                    ? 'bg-zinc-800 text-zinc-100 border border-zinc-700/80 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                7-Day Meal Schedule
              </button>
              <button
                onClick={() => setActiveTab('grocery')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'grocery'
                    ? 'bg-zinc-800 text-zinc-100 border border-zinc-700/80 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
                Grocery List & Budget
              </button>
              <button
                onClick={() => setActiveTab('notes')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'notes'
                    ? 'bg-zinc-800 text-zinc-100 border border-zinc-700/80 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Dietitian Guidelines
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-4 text-xs text-zinc-400">
              <div className="flex items-center gap-1.5">
                <Droplets className="w-4 h-4 text-cyan-400" />
                <span>Hydration: <strong className="text-zinc-200">{dietPlan.hydrationGoalLiters} L/day</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span>Est. Budget: <strong className="text-zinc-200">{dietPlan.estimatedWeeklyBudget}</strong></span>
              </div>
            </div>
          </div>

          {/* TAB 1: 7-DAY SCHEDULE */}
          {activeTab === 'schedule' && currentDay && (
            <div className="space-y-6">
              {/* Day selector pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {dietPlan.days.map((d, idx) => (
                  <button
                    key={d.dayNumber}
                    onClick={() => setSelectedDayIndex(idx)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                      selectedDayIndex === idx
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500 shadow-sm shadow-emerald-500/10'
                        : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <span>{d.dayName}</span>
                    <span className="block text-[10px] text-zinc-400 font-medium">
                      {d.totalCalories} kcal
                    </span>
                  </button>
                ))}
              </div>

              {/* Day Macro Overview Bar */}
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs uppercase font-extrabold tracking-wider text-zinc-400">
                    Day {currentDay.dayNumber} Targets:
                  </span>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-zinc-100 font-bold">{currentDay.totalCalories} kcal</span>
                    <span className="text-emerald-400 font-semibold">{currentDay.totalProtein}g Protein</span>
                    <span className="text-cyan-400 font-semibold">{currentDay.totalCarbs}g Carbs</span>
                    <span className="text-amber-400 font-semibold">{currentDay.totalFat}g Fat</span>
                  </div>
                </div>

                <div className="text-xs text-zinc-400">
                  Allergy Filter: <span className="text-zinc-300">{profile.diet.allergies.length > 0 ? profile.diet.allergies.join(', ') : 'None'}</span>
                </div>
              </div>

              {/* Meal Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[
                  { key: 'breakfast', title: 'Breakfast', meal: currentDay.meals.breakfast, icon: Apple },
                  { key: 'morningSnack', title: 'Morning Snack', meal: currentDay.meals.morningSnack, icon: Wheat },
                  { key: 'lunch', title: 'Lunch', meal: currentDay.meals.lunch, icon: Utensils },
                  { key: 'eveningSnack', title: 'Evening Snack', meal: currentDay.meals.eveningSnack, icon: Wheat },
                  { key: 'dinner', title: 'Dinner', meal: currentDay.meals.dinner, icon: Utensils },
                  { key: 'postWorkout', title: 'Post-Workout Fuel', meal: currentDay.meals.postWorkout, icon: Flame },
                ]
                  .filter((item) => Boolean(item.meal))
                  .map((item) => {
                    const Icon = item.icon;
                    const m = item.meal!;
                    const isSwapping = swappingMealKey === item.key;

                    return (
                      <div
                        key={item.key}
                        className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col justify-between space-y-4 hover:border-zinc-700/80 transition-all group"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-300">
                                <Icon className="w-3.5 h-3.5 text-emerald-400" />
                              </div>
                              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                                {item.title}
                              </span>
                            </div>
                            <button
                              onClick={() => handleSwapMeal(item.key, m)}
                              disabled={isSwapping}
                              className="text-[11px] font-semibold text-zinc-400 hover:text-emerald-400 flex items-center gap-1 transition-colors disabled:opacity-50"
                              title="Regenerate this specific meal with AI alternative"
                            >
                              <RefreshCw className={`w-3 h-3 ${isSwapping ? 'animate-spin text-emerald-400' : ''}`} />
                              <span>{isSwapping ? 'Swapping...' : 'Swap Meal'}</span>
                            </button>
                          </div>

                          <div>
                            <h3 className="text-base font-bold text-zinc-100 group-hover:text-emerald-300 transition-colors">
                              {m.name}
                            </h3>
                            <span className="text-xs text-zinc-400 font-medium">{m.portion}</span>
                          </div>

                          {m.notes && (
                            <p className="text-xs text-zinc-400 italic bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-800/60">
                              {m.notes}
                            </p>
                          )}
                        </div>

                        {/* Macro details pills */}
                        <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-3">
                            <span className="text-zinc-100 font-extrabold">{m.calories} kcal</span>
                            <span className="text-emerald-400 font-semibold">{m.protein}g P</span>
                            <span className="text-cyan-400 font-semibold">{m.carbs}g C</span>
                            <span className="text-amber-400 font-semibold">{m.fat}g F</span>
                          </div>

                          {m.alternatives && m.alternatives.length > 0 && (
                            <span className="text-[10px] text-zinc-400 hidden sm:inline" title={m.alternatives.join(', ')}>
                              Swap: {m.alternatives[0]}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* TAB 2: GROCERY LIST */}
          {activeTab === 'grocery' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-zinc-100">7-Day Consolidated Grocery List</h3>
                  <p className="text-xs text-zinc-400">Everything needed to cook your 7-day schedule with zero waste.</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-zinc-400 block uppercase font-bold tracking-wider">Estimated Cost</span>
                  <span className="text-base font-black text-emerald-400">{dietPlan.estimatedWeeklyBudget}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {dietPlan.groceryList.map((cat, i) => (
                  <div key={i} className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                      <ShoppingBag className="w-3.5 h-3.5" />
                      {cat.categoryName}
                    </h4>
                    <div className="space-y-2">
                      {cat.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800/60 flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            <span className="text-zinc-200 font-medium">{item.name}</span>
                          </div>
                          <div className="flex items-center gap-2 text-zinc-400">
                            <span className="font-semibold text-zinc-300">{item.quantity}</span>
                            {item.estimatedCostApprox && (
                              <span className="text-[11px] text-zinc-500">({item.estimatedCostApprox})</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: DIETITIAN NOTES */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
                <h3 className="text-sm font-extrabold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
                  <Info className="w-4 h-4 text-emerald-400" />
                  Clinical & Sports Nutrition Guidance
                </h3>
                <div className="space-y-3">
                  {dietPlan.dietitianNotes.map((note, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800/80 text-xs text-zinc-300 flex items-start gap-3"
                    >
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{note}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        /* Empty State */
        <div className="p-12 text-center border border-dashed border-zinc-800 rounded-2xl space-y-4 bg-zinc-900/40">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
            <Apple className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-zinc-100">No Diet Plan Active</h3>
            <p className="text-xs text-zinc-400 max-w-md mx-auto mt-1">
              Generate a personalized 7-day meal plan calculated to hit your {nutritionTargets.dailyCalories} kcal target with optimal macronutrient partitioning.
            </p>
          </div>
          <button
            onClick={onGenerateDiet}
            disabled={isGeneratingDiet}
            className="px-6 py-2.5 rounded-xl bg-emerald-500 text-zinc-950 font-extrabold text-xs hover:bg-emerald-400 transition-all inline-flex items-center gap-2 shadow-md shadow-emerald-500/20 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            {isGeneratingDiet ? 'Generating...' : 'Generate 7-Day Diet Plan'}
          </button>
        </div>
      )}
    </div>
  );
};
