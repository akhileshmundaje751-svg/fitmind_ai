import React from 'react';
import {
  Activity,
  Apple,
  Clock,
  Dumbbell,
  Edit3,
  Flame,
  Heart,
  Ruler,
  Scale,
  ShieldAlert,
  User,
  Zap,
} from 'lucide-react';
import { CalculationResults, UnitSystem, UserProfile } from '../../types';
import { formatLength, formatWeight } from '../../lib/storage';

interface ProfileViewProps {
  profile: UserProfile | null;
  calculations: CalculationResults | null;
  units: UnitSystem;
  onEditProfile: () => void;
  onOpenOnboarding: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  profile,
  calculations,
  units,
  onEditProfile,
  onOpenOnboarding,
}) => {
  if (!profile || !calculations) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-zinc-400">Please complete onboarding to manage your profile.</p>
        <button
          onClick={onOpenOnboarding}
          className="px-5 py-2.5 bg-emerald-500 text-zinc-950 font-bold text-xs rounded-xl"
        >
          Setup Profile
        </button>
      </div>
    );
  }

  const { bodyFatNavy, bmi, bmr, tdee, nutritionTargets } = calculations;

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-zinc-950 font-black text-2xl shadow-xl shadow-emerald-500/20">
            {profile.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-zinc-100">{profile.name}</h1>
              <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {profile.fitness.level}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              {profile.country || 'Global'} • Member since {new Date(profile.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <button
          onClick={onEditProfile}
          className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-extrabold text-xs flex items-center gap-2 transition-all shadow-md shadow-emerald-500/20 self-start sm:self-auto"
        >
          <Edit3 className="w-4 h-4" />
          <span>Edit Full Profile</span>
        </button>
      </div>

      {/* Grid of Profile Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Physical Anthropometrics */}
        <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
            <User className="w-4 h-4" />
            Anthropometric Baseline
          </h3>
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1 border-b border-zinc-800/80">
              <span className="text-zinc-400">Biological Sex:</span>
              <span className="font-bold text-zinc-200 capitalize">{profile.sex}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-zinc-800/80">
              <span className="text-zinc-400">Age:</span>
              <span className="font-bold text-zinc-200">{profile.age} Years</span>
            </div>
            <div className="flex justify-between py-1 border-b border-zinc-800/80">
              <span className="text-zinc-400">Height:</span>
              <span className="font-bold text-zinc-200">{formatLength(profile.height, units)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-zinc-800/80">
              <span className="text-zinc-400">Current Weight:</span>
              <span className="font-bold text-zinc-200">{formatWeight(profile.weight, units)}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-zinc-400">BMI Classification:</span>
              <span className="font-bold text-cyan-400">{bmi.value} ({bmi.category})</span>
            </div>
          </div>
        </div>

        {/* Circumferences */}
        <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
            <Ruler className="w-4 h-4" />
            Body Circumferences
          </h3>
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1 border-b border-zinc-800/80">
              <span className="text-zinc-400">Waist (at navel):</span>
              <span className="font-bold text-zinc-200">{formatLength(profile.measurements.waist, units)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-zinc-800/80">
              <span className="text-zinc-400">Neck (below larynx):</span>
              <span className="font-bold text-zinc-200">{formatLength(profile.measurements.neck, units)}</span>
            </div>
            {profile.measurements.hip && (
              <div className="flex justify-between py-1 border-b border-zinc-800/80">
                <span className="text-zinc-400">Hip (widest glute):</span>
                <span className="font-bold text-zinc-200">{formatLength(profile.measurements.hip, units)}</span>
              </div>
            )}
            <div className="flex justify-between py-1">
              <span className="text-zinc-400">Estimated Body Fat:</span>
              <span className="font-bold text-emerald-400">{bodyFatNavy.percentage}% ({bodyFatNavy.category})</span>
            </div>
          </div>
        </div>

        {/* Metabolic Targets */}
        <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
            <Flame className="w-4 h-4" />
            Metabolic & Energy Balance
          </h3>
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1 border-b border-zinc-800/80">
              <span className="text-zinc-400">Basal Metabolic Rate:</span>
              <span className="font-bold text-zinc-200">{bmr.value} kcal</span>
            </div>
            <div className="flex justify-between py-1 border-b border-zinc-800/80">
              <span className="text-zinc-400">TDEE:</span>
              <span className="font-bold text-zinc-200">{tdee.value} kcal</span>
            </div>
            <div className="flex justify-between py-1 border-b border-zinc-800/80">
              <span className="text-zinc-400">Daily Calorie Target:</span>
              <span className="font-bold text-amber-400">{nutritionTargets.dailyCalories} kcal</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-zinc-400">Strategy:</span>
              <span className="font-bold text-zinc-200 truncate max-w-[150px]">{nutritionTargets.strategyDescription}</span>
            </div>
          </div>
        </div>

        {/* Training Protocol Setup */}
        <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-2">
            <Dumbbell className="w-4 h-4" />
            Training Parameters
          </h3>
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1 border-b border-zinc-800/80">
              <span className="text-zinc-400">Equipment Access:</span>
              <span className="font-bold text-zinc-200 capitalize">{profile.fitness.gymAccess.replace('_', ' ')}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-zinc-800/80">
              <span className="text-zinc-400">Frequency:</span>
              <span className="font-bold text-zinc-200">{profile.fitness.daysPerWeek} Days / Week</span>
            </div>
            <div className="flex justify-between py-1 border-b border-zinc-800/80">
              <span className="text-zinc-400">Session Duration:</span>
              <span className="font-bold text-zinc-200">{profile.fitness.preferredDurationMinutes} Minutes</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-zinc-400">Injuries Safeguarded:</span>
              <span className="font-bold text-amber-400">
                {profile.fitness.injuries.length > 0 ? profile.fitness.injuries.join(', ') : 'None'}
              </span>
            </div>
          </div>
        </div>

        {/* Dietary Profile */}
        <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
            <Apple className="w-4 h-4" />
            Dietary Preferences
          </h3>
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1 border-b border-zinc-800/80">
              <span className="text-zinc-400">Pattern:</span>
              <span className="font-bold text-zinc-200 capitalize">{profile.diet.preference}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-zinc-800/80">
              <span className="text-zinc-400">Cuisine:</span>
              <span className="font-bold text-zinc-200 capitalize">{profile.diet.preferredCuisine}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-zinc-800/80">
              <span className="text-zinc-400">Meals Per Day:</span>
              <span className="font-bold text-zinc-200">{profile.diet.mealsPerDay}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-zinc-400">Allergies:</span>
              <span className="font-bold text-rose-400">
                {profile.diet.allergies.length > 0 ? profile.diet.allergies.join(', ') : 'None'}
              </span>
            </div>
          </div>
        </div>

        {/* Lifestyle & Sleep */}
        <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
            <Heart className="w-4 h-4" />
            Circadian & Lifestyle
          </h3>
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1 border-b border-zinc-800/80">
              <span className="text-zinc-400">Activity Level:</span>
              <span className="font-bold text-zinc-200 capitalize">{profile.lifestyle.activityLevel.replace('_', ' ')}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-zinc-800/80">
              <span className="text-zinc-400">Sleep:</span>
              <span className="font-bold text-zinc-200">{profile.lifestyle.sleepHours} Hours / Night</span>
            </div>
            <div className="flex justify-between py-1 border-b border-zinc-800/80">
              <span className="text-zinc-400">Occupation:</span>
              <span className="font-bold text-zinc-200">{profile.lifestyle.occupationType || 'General'}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-zinc-400">Daily Water:</span>
              <span className="font-bold text-cyan-400">{profile.lifestyle.dailyWaterLiters || 3.0} Liters</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
