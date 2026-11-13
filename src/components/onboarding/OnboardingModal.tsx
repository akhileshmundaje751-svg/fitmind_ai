import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Activity,
  AlertCircle,
  Apple,
  ArrowLeft,
  ArrowRight,
  Check,
  Dumbbell,
  Heart,
  Info,
  Ruler,
  ShieldAlert,
  Sparkles,
  User,
  X,
} from 'lucide-react';
import {
  ActivityLevel,
  BiologicalSex,
  CuisinePreference,
  DietaryPreference,
  FitnessGoal,
  FitnessLevel,
  GymAccess,
  UnitSystem,
  UserProfile,
  WorkoutSplit,
} from '../../types';
import { cmToInches, inchesToCm, kgToLbs, lbsToKg } from '../../lib/calculations';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveProfile: (profile: UserProfile) => Promise<void>;
  initialProfile?: UserProfile | null;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onSaveProfile,
  initialProfile,
}) => {
  if (!isOpen) return null;

  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [units, setUnits] = useState<UnitSystem>(initialProfile?.units || 'metric');
  const [name, setName] = useState<string>(initialProfile?.name || '');
  const [age, setAge] = useState<number>(initialProfile?.age || 28);
  const [sex, setSex] = useState<BiologicalSex>(initialProfile?.sex || 'male');
  const [heightCm, setHeightCm] = useState<number>(initialProfile?.height || 178);
  const [weightKg, setWeightKg] = useState<number>(initialProfile?.weight || 78);
  const [country, setCountry] = useState<string>(initialProfile?.country || 'United States');

  // Measurements
  const [waistCm, setWaistCm] = useState<number>(initialProfile?.measurements.waist || 84);
  const [neckCm, setNeckCm] = useState<number>(initialProfile?.measurements.neck || 38);
  const [hipCm, setHipCm] = useState<number>(initialProfile?.measurements.hip || 96);
  const [chestCm, setChestCm] = useState<number>(initialProfile?.measurements.chest || 100);
  const [armCm, setArmCm] = useState<number>(initialProfile?.measurements.arm || 36);
  const [thighCm, setThighCm] = useState<number>(initialProfile?.measurements.thigh || 56);

  // Fitness
  const [fitnessLevel, setFitnessLevel] = useState<FitnessLevel>(initialProfile?.fitness.level || 'intermediate');
  const [experienceYears, setExperienceYears] = useState<number>(initialProfile?.fitness.experienceYears || 2);
  const [gymAccess, setGymAccess] = useState<GymAccess>(initialProfile?.fitness.gymAccess || 'full_gym');
  const [daysPerWeek, setDaysPerWeek] = useState<number>(initialProfile?.fitness.daysPerWeek || 4);
  const [preferredDuration, setPreferredDuration] = useState<number>(initialProfile?.fitness.preferredDurationMinutes || 60);
  const [injuries, setInjuries] = useState<string>(initialProfile?.fitness.injuries.join(', ') || '');
  const [exercisePreferences, setExercisePreferences] = useState<string>(initialProfile?.fitness.exercisePreferences.join(', ') || 'Compound lifts, Dumbbells');
  const [preferredSplit, setPreferredSplit] = useState<WorkoutSplit>(initialProfile?.fitness.preferredSplit || 'ppl');

  // Dietary
  const [dietaryPref, setDietaryPref] = useState<DietaryPreference>(initialProfile?.diet.preference || 'omnivore');
  const [allergies, setAllergies] = useState<string>(initialProfile?.diet.allergies.join(', ') || '');
  const [intolerances, setIntolerances] = useState<string>(initialProfile?.diet.intolerances.join(', ') || '');
  const [dislikedFoods, setDislikedFoods] = useState<string>(initialProfile?.diet.dislikedFoods.join(', ') || '');
  const [preferredCuisine, setPreferredCuisine] = useState<CuisinePreference>(initialProfile?.diet.preferredCuisine || 'flexible');
  const [dailyBudget, setDailyBudget] = useState<number>(initialProfile?.diet.dailyBudgetEstimated || 20);
  const [mealsPerDay, setMealsPerDay] = useState<number>(initialProfile?.diet.mealsPerDay || 4);

  // Goals
  const [primaryGoal, setPrimaryGoal] = useState<FitnessGoal>(initialProfile?.goals.primaryGoal || 'lean_muscle_gain');
  const [targetWeightKg, setTargetWeightKg] = useState<number>(initialProfile?.goals.targetWeight || 80);
  const [timelineWeeks, setTimelineWeeks] = useState<number>(initialProfile?.goals.timelineWeeks || 12);
  const [mainPriority, setMainPriority] = useState<string>(initialProfile?.goals.mainPriority || 'Build athletic muscle & drop 2% body fat');
  const [motivation, setMotivation] = useState<string>(initialProfile?.goals.motivation || 'Feel energized and confident');

  // Lifestyle
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(initialProfile?.lifestyle.activityLevel || 'moderately_active');
  const [sleepHours, setSleepHours] = useState<number>(initialProfile?.lifestyle.sleepHours || 7.5);
  const [dailySteps, setDailySteps] = useState<number>(initialProfile?.lifestyle.dailyStepsEstimated || 9000);
  const [dailyWater, setDailyWater] = useState<number>(initialProfile?.lifestyle.dailyWaterLiters || 3.0);
  const [occupation, setOccupation] = useState<string>(initialProfile?.lifestyle.occupationType || 'Desk Job');

  const validateStep = (currentStep: number): boolean => {
    setErrorMsg(null);
    if (currentStep === 1) {
      if (!name.trim()) {
        setErrorMsg('Please enter your name.');
        return false;
      }
      if (age < 12 || age > 110) {
        setErrorMsg('Please enter a valid age between 12 and 110.');
        return false;
      }
      if (heightCm < 90 || heightCm > 250) {
        setErrorMsg('Please enter a realistic height (90 - 250 cm).');
        return false;
      }
      if (weightKg < 30 || weightKg > 350) {
        setErrorMsg('Please enter a realistic weight (30 - 350 kg).');
        return false;
      }
    }

    if (currentStep === 2) {
      if (waistCm <= 0 || neckCm <= 0) {
        setErrorMsg('Waist and neck circumferences are required for US Navy body fat estimation.');
        return false;
      }
      if (sex === 'female' && (!hipCm || hipCm <= 0)) {
        setErrorMsg('Hip circumference is required for females in the US Navy equation.');
        return false;
      }
      if (waistCm <= neckCm) {
        setErrorMsg('Waist circumference must be larger than neck circumference.');
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => Math.min(6, prev + 1));
    }
  };

  const handleBack = () => {
    setErrorMsg(null);
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(step)) return;

    setIsSubmitting(true);
    try {
      const compiledProfile: UserProfile = {
        id: initialProfile?.id || `user-${Date.now()}`,
        name: name.trim(),
        age: Number(age),
        sex,
        height: Number(heightCm),
        weight: Number(weightKg),
        country,
        units,
        measurements: {
          waist: Number(waistCm),
          neck: Number(neckCm),
          hip: sex === 'female' ? Number(hipCm) : hipCm || undefined,
          chest: chestCm ? Number(chestCm) : undefined,
          arm: armCm ? Number(armCm) : undefined,
          thigh: thighCm ? Number(thighCm) : undefined,
          updatedAt: new Date().toISOString(),
        },
        fitness: {
          level: fitnessLevel,
          experienceYears: Number(experienceYears),
          gymAccess,
          daysPerWeek: Number(daysPerWeek),
          preferredDurationMinutes: Number(preferredDuration),
          injuries: injuries ? injuries.split(',').map((s) => s.trim()).filter(Boolean) : [],
          exercisePreferences: exercisePreferences ? exercisePreferences.split(',').map((s) => s.trim()).filter(Boolean) : [],
          preferredSplit,
        },
        diet: {
          preference: dietaryPref,
          allergies: allergies ? allergies.split(',').map((s) => s.trim()).filter(Boolean) : [],
          intolerances: intolerances ? intolerances.split(',').map((s) => s.trim()).filter(Boolean) : [],
          dislikedFoods: dislikedFoods ? dislikedFoods.split(',').map((s) => s.trim()).filter(Boolean) : [],
          preferredCuisine,
          dailyBudgetEstimated: Number(dailyBudget),
          currency: 'USD',
          mealsPerDay: Number(mealsPerDay),
        },
        goals: {
          primaryGoal,
          targetWeight: targetWeightKg ? Number(targetWeightKg) : undefined,
          timelineWeeks: timelineWeeks ? Number(timelineWeeks) : undefined,
          mainPriority,
          motivation,
        },
        lifestyle: {
          activityLevel,
          sleepHours: Number(sleepHours),
          dailyStepsEstimated: dailySteps ? Number(dailySteps) : undefined,
          dailyWaterLiters: dailyWater ? Number(dailyWater) : undefined,
          occupationType: occupation,
        },
        createdAt: initialProfile?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isOnboarded: true,
      };

      await onSaveProfile(compiledProfile);

      // Trigger celebratory confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#06b6d4', '#f59e0b', '#3b82f6'],
      });

      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepsInfo = [
    { num: 1, title: 'Personal Info', icon: User },
    { num: 2, title: 'Body Circumference', icon: Ruler },
    { num: 3, title: 'Fitness & Gym', icon: Dumbbell },
    { num: 4, title: 'Nutrition & Diet', icon: Apple },
    { num: 5, title: 'Goals & Target', icon: Activity },
    { num: 6, title: 'Lifestyle & Sleep', icon: Heart },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl my-8">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-400">
                Step {step} of 6
              </span>
              <span className="text-zinc-600">•</span>
              <span className="text-xs text-zinc-400 font-medium">{stepsInfo[step - 1].title}</span>
            </div>
            <h2 className="text-xl font-extrabold text-zinc-100 tracking-tight mt-0.5">
              {step === 1 && 'Personal & Anthropometric Baseline'}
              {step === 2 && 'US Navy Circumference Measurements'}
              {step === 3 && 'Fitness Capacity & Training Setup'}
              {step === 4 && 'Dietary Preferences & Nutrition'}
              {step === 5 && 'Fitness Objectives & Timelines'}
              {step === 6 && 'Daily Lifestyle & Circadian Rhythm'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800/80 flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Multi-step Progress Bar */}
        <div className="grid grid-cols-6 border-b border-zinc-800/80">
          {stepsInfo.map((s) => {
            const isDone = s.num < step;
            const isCurrent = s.num === step;
            return (
              <div
                key={s.num}
                className={`py-2 px-1 text-center transition-all ${
                  isCurrent
                    ? 'bg-emerald-500/10 border-b-2 border-emerald-400 text-emerald-300'
                    : isDone
                    ? 'border-b-2 border-emerald-500/40 text-zinc-400'
                    : 'border-b-2 border-transparent text-zinc-600'
                }`}
              >
                <div className="flex items-center justify-center gap-1">
                  {isDone ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <span className="text-xs font-bold">{s.num}</span>
                  )}
                  <span className="text-[11px] font-medium hidden md:inline truncate">{s.title}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Error Banner */}
        {errorMsg && (
          <div className="m-6 mb-0 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-2.5 text-red-300 text-xs font-medium">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Step Body */}
        <div className="p-6 max-h-[62vh] overflow-y-auto space-y-6">
          {/* STEP 1: PERSONAL INFORMATION */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5 uppercase tracking-wider">
                    Full or Preferred Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Rivera"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5 uppercase tracking-wider">
                    Age (Years) *
                  </label>
                  <input
                    type="number"
                    min="12"
                    max="110"
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5 uppercase tracking-wider">
                    Biological Sex *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSex('male')}
                      className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                        sex === 'male'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500'
                          : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      Male
                    </button>
                    <button
                      type="button"
                      onClick={() => setSex('female')}
                      className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                        sex === 'female'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500'
                          : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      Female
                    </button>
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-1">Required for Mifflin-St Jeor & US Navy equations.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5 uppercase tracking-wider">
                    Preferred Units *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setUnits('metric')}
                      className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                        units === 'metric'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500'
                          : 'bg-zinc-950 text-zinc-400 border-zinc-800'
                      }`}
                    >
                      Metric (kg/cm)
                    </button>
                    <button
                      type="button"
                      onClick={() => setUnits('imperial')}
                      className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                        units === 'imperial'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500'
                          : 'bg-zinc-950 text-zinc-400 border-zinc-800'
                      }`}
                    >
                      Imperial (lbs/in)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5 uppercase tracking-wider">
                    Country
                  </label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="e.g. India, USA, UK"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5 uppercase tracking-wider">
                    Height {units === 'metric' ? '(cm)' : '(inches)'} *
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.5"
                      value={units === 'metric' ? heightCm : Number(cmToInches(heightCm).toFixed(1))}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setHeightCm(units === 'metric' ? val : inchesToCm(val));
                      }}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
                    />
                    <span className="text-xs text-zinc-400 font-semibold px-2">
                      {units === 'metric'
                        ? `${(heightCm / 30.48).toFixed(1)} ft`
                        : `${heightCm.toFixed(0)} cm`}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5 uppercase tracking-wider">
                    Weight {units === 'metric' ? '(kg)' : '(lbs)'} *
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.1"
                      value={units === 'metric' ? weightKg : Number(kgToLbs(weightKg).toFixed(1))}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setWeightKg(units === 'metric' ? val : lbsToKg(val));
                      }}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
                    />
                    <span className="text-xs text-zinc-400 font-semibold px-2">
                      {units === 'metric'
                        ? `${(weightKg * 2.20462).toFixed(1)} lbs`
                        : `${weightKg.toFixed(1)} kg`}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: BODY CIRCUMFERENCE MEASUREMENTS */}
          {step === 2 && (
            <div className="space-y-5">
              {/* Measurement Guide Visual Box */}
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                  <Info className="w-4 h-4" />
                  US Navy Circumference Measurement Instructions
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-zinc-300">
                  <div className="bg-zinc-950/80 p-2.5 rounded-lg border border-zinc-800/80">
                    <span className="text-emerald-400 font-bold block mb-1">1. Waist Circumference:</span>
                    {sex === 'male'
                      ? 'Measure horizontally at the level of the navel (belly button). Relax abdomen, do not suck in.'
                      : 'Measure at the narrowest natural indentation between ribs and navel.'}
                  </div>
                  <div className="bg-zinc-950/80 p-2.5 rounded-lg border border-zinc-800/80">
                    <span className="text-emerald-400 font-bold block mb-1">2. Neck Circumference:</span>
                    Measure just below the larynx (Adam’s apple) with tape sloping slightly downward to the front.
                  </div>
                  <div className="bg-zinc-950/80 p-2.5 rounded-lg border border-zinc-800/80">
                    <span className="text-emerald-400 font-bold block mb-1">
                      3. Hip Circumference {sex === 'female' ? '(Required)' : '(Optional)'}:
                    </span>
                    Measure horizontally around the widest part of the buttocks/glutes.
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5 uppercase tracking-wider">
                    Waist {units === 'metric' ? '(cm)' : '(in)'} *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={units === 'metric' ? waistCm : Number(cmToInches(waistCm).toFixed(1))}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setWaistCm(units === 'metric' ? val : inchesToCm(val));
                    }}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
                  />
                  <p className="text-[10px] text-zinc-500 mt-1">Horizontally at navel</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5 uppercase tracking-wider">
                    Neck {units === 'metric' ? '(cm)' : '(in)'} *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={units === 'metric' ? neckCm : Number(cmToInches(neckCm).toFixed(1))}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setNeckCm(units === 'metric' ? val : inchesToCm(val));
                    }}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
                  />
                  <p className="text-[10px] text-zinc-500 mt-1">Below Adam&apos;s apple</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5 uppercase tracking-wider">
                    Hip {units === 'metric' ? '(cm)' : '(in)'} {sex === 'female' && '*'}
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={units === 'metric' ? hipCm : Number(cmToInches(hipCm).toFixed(1))}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setHipCm(units === 'metric' ? val : inchesToCm(val));
                    }}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
                  />
                  <p className="text-[10px] text-zinc-500 mt-1">Widest part of hips</p>
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-800/80">
                <span className="text-xs font-bold text-zinc-400 block mb-3 uppercase tracking-wider">
                  Optional Additional Measurements
                </span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Chest ({units === 'metric' ? 'cm' : 'in'})</label>
                    <input
                      type="number"
                      step="0.5"
                      value={units === 'metric' ? chestCm : Number(cmToInches(chestCm).toFixed(1))}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setChestCm(units === 'metric' ? val : inchesToCm(val));
                      }}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Arm ({units === 'metric' ? 'cm' : 'in'})</label>
                    <input
                      type="number"
                      step="0.5"
                      value={units === 'metric' ? armCm : Number(cmToInches(armCm).toFixed(1))}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setArmCm(units === 'metric' ? val : inchesToCm(val));
                      }}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Thigh ({units === 'metric' ? 'cm' : 'in'})</label>
                    <input
                      type="number"
                      step="0.5"
                      value={units === 'metric' ? thighCm : Number(cmToInches(thighCm).toFixed(1))}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setThighCm(units === 'metric' ? val : inchesToCm(val));
                      }}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: FITNESS INFORMATION */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-2 uppercase tracking-wider">
                  Fitness Experience Level *
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['beginner', 'intermediate', 'advanced'] as FitnessLevel[]).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setFitnessLevel(lvl)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        fitnessLevel === lvl
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      <span className="capitalize font-bold text-sm block">{lvl}</span>
                      <span className="text-[11px] text-zinc-400">
                        {lvl === 'beginner' && '< 1 year training'}
                        {lvl === 'intermediate' && '1 - 4 years training'}
                        {lvl === 'advanced' && '4+ years consistent'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5 uppercase tracking-wider">
                    Equipment Access *
                  </label>
                  <select
                    value={gymAccess}
                    onChange={(e) => setGymAccess(e.target.value as GymAccess)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="full_gym">Full Commercial Gym</option>
                    <option value="home_gym">Home Gym (Dumbbells/Barbell)</option>
                    <option value="bodyweight_only">Bodyweight / Calisthenics</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5 uppercase tracking-wider">
                    Workout Days / Week *
                  </label>
                  <select
                    value={daysPerWeek}
                    onChange={(e) => setDaysPerWeek(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value={2}>2 Days / Week</option>
                    <option value={3}>3 Days / Week (Full Body)</option>
                    <option value={4}>4 Days / Week (Upper/Lower)</option>
                    <option value={5}>5 Days / Week (PPL / Hybrid)</option>
                    <option value={6}>6 Days / Week (PPL Split)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5 uppercase tracking-wider">
                    Target Duration (Minutes)
                  </label>
                  <select
                    value={preferredDuration}
                    onChange={(e) => setPreferredDuration(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value={30}>30 mins (Express)</option>
                    <option value={45}>45 mins (Balanced)</option>
                    <option value={60}>60 mins (Standard)</option>
                    <option value={75}>75 mins (High Volume)</option>
                    <option value={90}>90 mins (Powerbuilding)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                  Reported Injuries or Physical Limitations
                </label>
                <input
                  type="text"
                  value={injuries}
                  onChange={(e) => setInjuries(e.target.value)}
                  placeholder="e.g. Mild lower back disc issue, Rotator cuff tightness, Knee patellar pain"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
                />
                <p className="text-[11px] text-zinc-400 mt-1">
                  The AI workout generator will automatically filter out and replace contraindicated movements.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5 uppercase tracking-wider">
                  Exercise Preferences or Favorite Movements
                </label>
                <input
                  type="text"
                  value={exercisePreferences}
                  onChange={(e) => setExercisePreferences(e.target.value)}
                  placeholder="e.g. Bench press, Incline dumbbells, Pull-ups, Bulgarian split squats"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100"
                />
              </div>
            </div>
          )}

          {/* STEP 4: DIETARY INFORMATION */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-2 uppercase tracking-wider">
                  Dietary Pattern *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5">
                  {(['omnivore', 'vegetarian', 'vegan', 'eggetarian', 'pescatarian'] as DietaryPreference[]).map((pref) => (
                    <button
                      key={pref}
                      type="button"
                      onClick={() => setDietaryPref(pref)}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        dietaryPref === pref
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 font-medium'
                      }`}
                    >
                      <span className="capitalize text-xs">{pref}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5 uppercase tracking-wider">
                    Preferred Cuisine
                  </label>
                  <select
                    value={preferredCuisine}
                    onChange={(e) => setPreferredCuisine(e.target.value as CuisinePreference)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="indian">Indian (Dal, Paneer, Chilla, Rice, Roti, Curd)</option>
                    <option value="mediterranean">Mediterranean (Olive oil, Quinoa, Fish, Veggies)</option>
                    <option value="western">Western / American (Oats, Chicken, Potatoes)</option>
                    <option value="asian">East Asian (Tofu, Edamame, Stir-fries)</option>
                    <option value="flexible">Flexible / Global Fusion</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5 uppercase tracking-wider">
                    Meals Per Day
                  </label>
                  <select
                    value={mealsPerDay}
                    onChange={(e) => setMealsPerDay(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value={3}>3 Meals (Breakfast, Lunch, Dinner)</option>
                    <option value={4}>4 Meals (Breakfast, Lunch, Snack, Dinner)</option>
                    <option value={5}>5 Meals (Frequent Smaller Feedings)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5 uppercase tracking-wider">
                    Daily Food Budget Approx ($)
                  </label>
                  <input
                    type="number"
                    value={dailyBudget}
                    onChange={(e) => setDailyBudget(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5 uppercase tracking-wider">
                    Food Allergies (Strict Exclusion)
                  </label>
                  <input
                    type="text"
                    value={allergies}
                    onChange={(e) => setAllergies(e.target.value)}
                    placeholder="e.g. Peanuts, Shellfish, Tree nuts, Gluten"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5 uppercase tracking-wider">
                    Food Intolerances & Dislikes
                  </label>
                  <input
                    type="text"
                    value={intolerances}
                    onChange={(e) => setIntolerances(e.target.value)}
                    placeholder="e.g. Lactose, Mushrooms, Bitter gourd"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: FITNESS GOALS */}
          {step === 5 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-2 uppercase tracking-wider">
                  Primary Fitness Objective *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { id: 'fat_loss', label: 'Fat Loss', desc: 'Sustainable 18% deficit preserving muscle' },
                    { id: 'lean_muscle_gain', label: 'Lean Muscle Gain', desc: 'Controlled 10% surplus for hypertrophy' },
                    { id: 'body_recomposition', label: 'Body Recomposition', desc: 'Simultaneous fat loss & muscle retention' },
                    { id: 'strength_development', label: 'Strength & Power', desc: 'Heavy compound loads & neural drive' },
                    { id: 'general_fitness', label: 'General Health & Energy', desc: 'Metabolic fitness & cardiovascular health' },
                    { id: 'endurance_improvement', label: 'Endurance & Stamina', desc: 'Aerobic threshold & glycogen optimization' },
                  ].map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setPrimaryGoal(g.id as FitnessGoal)}
                      className={`p-3.5 rounded-xl border text-left transition-all ${
                        primaryGoal === g.id
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      <span className="font-bold text-sm block">{g.label}</span>
                      <span className="text-[11px] text-zinc-400 block mt-0.5">{g.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5 uppercase tracking-wider">
                    Target Weight ({units === 'metric' ? 'kg' : 'lbs'})
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={units === 'metric' ? targetWeightKg : Number(kgToLbs(targetWeightKg).toFixed(1))}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setTargetWeightKg(units === 'metric' ? val : lbsToKg(val));
                    }}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5 uppercase tracking-wider">
                    Target Timeline (Weeks)
                  </label>
                  <input
                    type="number"
                    min="4"
                    max="52"
                    value={timelineWeeks}
                    onChange={(e) => setTimelineWeeks(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5 uppercase tracking-wider">
                  Personal Motivation or Objective
                </label>
                <input
                  type="text"
                  value={motivation}
                  onChange={(e) => setMotivation(e.target.value)}
                  placeholder="e.g. Preparing for summer, improving stamina with my kids, hitting a 100kg bench press"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100"
                />
              </div>
            </div>
          )}

          {/* STEP 6: LIFESTYLE & SLEEP */}
          {step === 6 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-2 uppercase tracking-wider">
                  Daily Physical Activity Level *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { id: 'sedentary', label: 'Sedentary (1.2x)', desc: 'Desk job, very little physical movement' },
                    { id: 'lightly_active', label: 'Lightly Active (1.375x)', desc: 'Light exercise / sports 1-3 days/week' },
                    { id: 'moderately_active', label: 'Moderately Active (1.55x)', desc: 'Moderate exercise 3-5 days/week' },
                    { id: 'very_active', label: 'Very Active (1.725x)', desc: 'Hard exercise 6-7 days/week or physical job' },
                    { id: 'extremely_active', label: 'Extremely Active (1.9x)', desc: 'Athletic endurance training or heavy labor' },
                  ].map((act) => (
                    <button
                      key={act.id}
                      type="button"
                      onClick={() => setActivityLevel(act.id as ActivityLevel)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        activityLevel === act.id
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      <span className="font-bold text-xs block">{act.label}</span>
                      <span className="text-[11px] text-zinc-400">{act.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5 uppercase tracking-wider">
                    Sleep (Hours / Night)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="4"
                    max="14"
                    value={sleepHours}
                    onChange={(e) => setSleepHours(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5 uppercase tracking-wider">
                    Daily Steps (Estimated)
                  </label>
                  <input
                    type="number"
                    step="500"
                    value={dailySteps}
                    onChange={(e) => setDailySteps(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5 uppercase tracking-wider">
                    Daily Water (Liters)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={dailyWater}
                    onChange={(e) => setDailyWater(Number(e.target.value))}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-100"
                  />
                </div>
              </div>

              {/* Safety Confirmation Notice */}
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1.5">
                <div className="flex items-center gap-2 text-zinc-300 font-bold text-xs">
                  <ShieldAlert className="w-4 h-4 text-emerald-400" />
                  Health & Safety Commitment
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  FitMind AI is a fitness and sports nutrition educational management platform. Its calculations (US Navy regression and Mifflin-St Jeor) are scientific estimates. By saving your profile, you acknowledge that you are cleared for physical exercise and that this platform does not provide medical diagnoses.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 border-t border-zinc-800 flex items-center justify-between bg-zinc-950/80">
          <button
            type="button"
            onClick={handleBack}
            disabled={step === 1 || isSubmitting}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent flex items-center gap-1.5 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>

          <div className="flex items-center gap-2">
            {step < 6 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 text-zinc-950 text-xs font-bold hover:bg-emerald-400 flex items-center gap-2 transition-all shadow-md shadow-emerald-500/20"
              >
                Continue <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-emerald-500 text-zinc-950 text-xs font-extrabold hover:bg-emerald-400 flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/30 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                {isSubmitting ? 'Calculating Profile...' : 'Complete & Generate Blueprint'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
