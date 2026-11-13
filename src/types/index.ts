/**
 * FitMind AI - Domain Type Definitions
 */

export type BiologicalSex = 'male' | 'female';
export type UnitSystem = 'metric' | 'imperial';

export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced';
export type GymAccess = 'full_gym' | 'home_gym' | 'bodyweight_only';
export type WorkoutSplit = 'ppl' | 'upper_lower' | 'full_body' | 'bro_split' | 'home_circuit';

export type DietaryPreference = 'omnivore' | 'vegetarian' | 'vegan' | 'eggetarian' | 'pescatarian';
export type CuisinePreference = 'indian' | 'mediterranean' | 'western' | 'asian' | 'mexican' | 'flexible';

export type FitnessGoal =
  | 'fat_loss'
  | 'lean_muscle_gain'
  | 'body_recomposition'
  | 'strength_development'
  | 'general_fitness'
  | 'endurance_improvement';

export type ActivityLevel =
  | 'sedentary'
  | 'lightly_active'
  | 'moderately_active'
  | 'very_active'
  | 'extremely_active';

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  sex: BiologicalSex;
  height: number; // in cm
  weight: number; // in kg
  country?: string;
  units: UnitSystem;
  
  // Body measurements (stored in cm internally)
  measurements: {
    waist: number; // Required for US Navy
    neck: number;  // Required for US Navy
    hip?: number;  // Required for females
    chest?: number;
    arm?: number;
    thigh?: number;
    updatedAt: string;
  };

  // Fitness profile
  fitness: {
    level: FitnessLevel;
    experienceYears: number;
    gymAccess: GymAccess;
    daysPerWeek: number;
    preferredDurationMinutes: number;
    injuries: string[];
    exercisePreferences: string[];
    preferredSplit?: WorkoutSplit;
  };

  // Dietary profile
  diet: {
    preference: DietaryPreference;
    allergies: string[];
    intolerances: string[];
    dislikedFoods: string[];
    preferredCuisine: CuisinePreference;
    dailyBudgetEstimated?: number; // In local currency
    currency?: string;
    mealsPerDay: number;
    mealTimings?: string[];
  };

  // Goals
  goals: {
    primaryGoal: FitnessGoal;
    targetWeight?: number; // in kg
    timelineWeeks?: number;
    mainPriority: string;
    motivation?: string;
  };

  // Lifestyle
  lifestyle: {
    activityLevel: ActivityLevel;
    sleepHours: number;
    dailyStepsEstimated?: number;
    occupationType?: string;
    dailyWaterLiters?: number;
  };

  createdAt: string;
  updatedAt: string;
  isOnboarded: boolean;
}

export interface CalculationResults {
  bmi: {
    value: number;
    category: 'Underweight' | 'Normal' | 'Overweight' | 'Obese Class I' | 'Obese Class II' | 'Obese Class III';
    healthyWeightRangeKg: [number, number];
  };
  bodyFatNavy: {
    percentage: number;
    category: 'Essential Fat' | 'Athletes' | 'Fitness' | 'Acceptable' | 'High';
    method: 'US Navy Circumference Method';
    isValid: boolean;
    missingMeasurements?: string[];
  };
  bmr: {
    value: number;
    equation: 'Mifflin-St Jeor';
  };
  tdee: {
    value: number;
    multiplier: number;
    activityLevel: ActivityLevel;
  };
  bodyComposition: {
    fatMassKg: number;
    leanMassKg: number;
    fatMassLbs: number;
    leanMassLbs: number;
  };
  nutritionTargets: {
    dailyCalories: number;
    deficitOrSurplusPercentage: number;
    strategyDescription: string;
    proteinGrams: number;
    carbsGrams: number;
    fatGrams: number;
    proteinCalories: number;
    carbsCalories: number;
    fatCalories: number;
    macroRatios: {
      proteinPct: number;
      carbsPct: number;
      fatPct: number;
    };
  };
  disclaimers: string[];
}

export interface MealItem {
  id: string;
  name: string;
  portion: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  notes?: string;
  alternatives?: string[];
}

export interface DayDietPlan {
  dayNumber: number;
  dayName: string;
  meals: {
    breakfast: MealItem;
    morningSnack?: MealItem;
    lunch: MealItem;
    eveningSnack?: MealItem;
    dinner: MealItem;
    postWorkout?: MealItem;
  };
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

export interface GroceryCategory {
  categoryName: string;
  items: {
    name: string;
    quantity: string;
    estimatedCostApprox?: string;
  }[];
}

export interface DietPlan {
  id: string;
  userId: string;
  createdAt: string;
  calorieTarget: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
  planType: DietaryPreference;
  cuisine: string;
  days: DayDietPlan[];
  groceryList: GroceryCategory[];
  estimatedWeeklyBudget: string;
  hydrationGoalLiters: number;
  dietitianNotes: string[];
}

export interface ExerciseItem {
  id: string;
  name: string;
  targetMuscleGroups: string[];
  sets: number;
  reps: string;
  restSeconds: number;
  equipment: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  instructions: string;
  formCues: string[];
  alternatives: string[];
  category: 'Compound' | 'Isolation' | 'Bodyweight' | 'Cardio';
}

export interface DayWorkoutPlan {
  dayNumber: number;
  dayName: string;
  focus: string; // e.g. "Chest & Triceps (Push A)" or "Rest & Active Recovery"
  isRestDay: boolean;
  warmupRoutine: string[];
  exercises: ExerciseItem[];
  cooldownRoutine: string[];
  estimatedDurationMinutes: number;
}

export interface WorkoutPlan {
  id: string;
  userId: string;
  createdAt: string;
  title: string;
  splitType: WorkoutSplit;
  level: FitnessLevel;
  daysPerWeek: number;
  days: DayWorkoutPlan[];
  progressiveOverloadGuidelines: string[];
  recoveryProtocol: string[];
  injurySafeguards: string[];
}

export interface ProgressEntry {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  weightKg: number;
  waistCm?: number;
  neckCm?: number;
  hipCm?: number;
  chestCm?: number;
  bodyFatPct?: number;
  workoutCompleted?: boolean;
  workoutNotes?: string;
  calorieAdherenceScore?: number; // 1-10 or 1-100%
  notes?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  contextUsed?: boolean;
}
