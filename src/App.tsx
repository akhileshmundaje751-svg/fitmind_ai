import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  CalculationResults,
  ChatMessage,
  DietPlan,
  ExerciseItem,
  MealItem,
  ProgressEntry,
  UnitSystem,
  UserProfile,
  WorkoutPlan,
} from './types';
import { apiClient } from './lib/storage';
import { NavTab, Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { OnboardingModal } from './components/onboarding/OnboardingModal';
import { DisclaimerModal } from './components/layout/DisclaimerModal';
import { DashboardView } from './components/dashboard/DashboardView';
import { BodyAnalysisView } from './components/body-analysis/BodyAnalysisView';
import { DietPlannerView } from './components/diet/DietPlannerView';
import { WorkoutPlannerView } from './components/workout/WorkoutPlannerView';
import { AIAssistantView } from './components/ai-assistant/AIAssistantView';
import { ProgressTrackerView } from './components/progress/ProgressTrackerView';
import { ProfileView } from './components/profile/ProfileView';
import { SettingsView } from './components/settings/SettingsView';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [calculations, setCalculations] = useState<CalculationResults | null>(null);
  const [dietPlan, setDietPlan] = useState<DietPlan | null>(null);
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);
  const [progress, setProgress] = useState<ProgressEntry[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [units, setUnits] = useState<UnitSystem>('metric');

  // UI state
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState<boolean>(false);
  const [geminiConnected, setGeminiConnected] = useState<boolean>(false);

  // Loading states
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isGeneratingDiet, setIsGeneratingDiet] = useState<boolean>(false);
  const [isGeneratingWorkout, setIsGeneratingWorkout] = useState<boolean>(false);
  const [isSendingChat, setIsSendingChat] = useState<boolean>(false);
  const [isLoadingDemo, setIsLoadingDemo] = useState<boolean>(false);

  // Initial load
  useEffect(() => {
    async function initApp() {
      try {
        setIsLoading(true);
        // Check health
        const health = await apiClient.checkHealth();
        setGeminiConnected(health.geminiConfigured);

        // Fetch profile
        const { profile: p, calculations: c } = await apiClient.getProfile();
        if (p) {
          setProfile(p);
          setUnits(p.units || 'metric');
          setCalculations(c);

          // Fetch associated plans
          const [d, w, prog, chat] = await Promise.all([
            apiClient.getDietPlan(),
            apiClient.getWorkoutPlan(),
            apiClient.getProgress(),
            apiClient.getChatHistory(),
          ]);

          setDietPlan(d);
          setWorkoutPlan(w);
          setProgress(prog);
          setChatHistory(chat);
        } else {
          // If fresh app, prompt onboarding after 800ms
          setTimeout(() => setIsOnboardingOpen(true), 800);
        }
      } catch (err) {
        console.error('[FitMind AI Init Error]', err);
      } finally {
        setIsLoading(false);
      }
    }
    initApp();
  }, []);

  // Save profile from onboarding
  const handleSaveProfile = async (newProfile: UserProfile) => {
    const { profile: saved, calculations: c } = await apiClient.saveProfile(newProfile);
    setProfile(saved);
    setCalculations(c);
    setUnits(saved.units);

    // Auto-generate diet and workout blueprints if not present
    try {
      setIsGeneratingDiet(true);
      const generatedDiet = await apiClient.generateDietPlan();
      setDietPlan(generatedDiet);
    } catch (err) {
      console.warn('Initial diet generation fallback:', err);
    } finally {
      setIsGeneratingDiet(false);
    }

    try {
      setIsGeneratingWorkout(true);
      const generatedWorkout = await apiClient.generateWorkoutPlan();
      setWorkoutPlan(generatedWorkout);
    } catch (err) {
      console.warn('Initial workout generation fallback:', err);
    } finally {
      setIsGeneratingWorkout(false);
    }

    // Add initial progress baseline entry
    const initialEntry: ProgressEntry = {
      id: `p-${Date.now()}`,
      userId: saved.id,
      date: new Date().toISOString().split('T')[0],
      weightKg: saved.weight,
      waistCm: saved.measurements.waist,
      neckCm: saved.measurements.neck,
      hipCm: saved.measurements.hip,
      bodyFatPct: c.bodyFatNavy.isValid ? c.bodyFatNavy.percentage : undefined,
      workoutCompleted: true,
      calorieAdherenceScore: 100,
      notes: 'Initial Onboarding Baseline',
    };
    const updatedProgress = await apiClient.addProgress(initialEntry);
    setProgress(updatedProgress);
  };

  // Toggle Units (Metric <-> Imperial)
  const handleToggleUnits = () => {
    const nextUnit: UnitSystem = units === 'metric' ? 'imperial' : 'metric';
    setUnits(nextUnit);
    if (profile) {
      const updated = { ...profile, units: nextUnit };
      setProfile(updated);
      apiClient.saveProfile(updated).catch(console.error);
    }
  };

  // Generate Diet
  const handleGenerateDiet = async () => {
    setIsGeneratingDiet(true);
    try {
      const plan = await apiClient.generateDietPlan();
      setDietPlan(plan);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingDiet(false);
    }
  };

  // Regenerate single meal
  const handleRegenerateMeal = async (dayNumber: number, mealType: string, existingMeal: MealItem) => {
    try {
      const updatedMeal = await apiClient.regenerateMeal(dayNumber, mealType, existingMeal);
      if (dietPlan) {
        const nextDays = dietPlan.days.map((d) => {
          if (d.dayNumber === dayNumber) {
            return {
              ...d,
              meals: {
                ...d.meals,
                [mealType]: updatedMeal,
              },
            };
          }
          return d;
        });
        setDietPlan({ ...dietPlan, days: nextDays });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Generate Workout
  const handleGenerateWorkout = async () => {
    setIsGeneratingWorkout(true);
    try {
      const plan = await apiClient.generateWorkoutPlan();
      setWorkoutPlan(plan);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingWorkout(false);
    }
  };

  // Replace single exercise
  const handleReplaceExercise = async (dayFocus: string, existingExercise: ExerciseItem) => {
    try {
      const replacement = await apiClient.replaceExercise(dayFocus, existingExercise);
      if (workoutPlan) {
        const nextDays = workoutPlan.days.map((d) => {
          return {
            ...d,
            exercises: d.exercises.map((ex) => (ex.id === existingExercise.id ? replacement : ex)),
          };
        });
        setWorkoutPlan({ ...workoutPlan, days: nextDays });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Chat Assistant
  const handleSendMessage = async (text: string) => {
    setIsSendingChat(true);
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      sender: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };
    setChatHistory((prev) => [...prev, userMsg]);

    try {
      const reply = await apiClient.sendChatMessage(text);
      setChatHistory((prev) => [...prev, reply]);
    } catch (err: any) {
      const errorReply: ChatMessage = {
        id: `msg-${Date.now()}-err`,
        sender: 'assistant',
        content: `Error processing request: ${err.message || 'Please check your connection and retry.'}`,
        timestamp: new Date().toISOString(),
      };
      setChatHistory((prev) => [...prev, errorReply]);
    } finally {
      setIsSendingChat(false);
    }
  };

  const handleClearChat = async () => {
    await apiClient.clearChat();
    setChatHistory([]);
  };

  // Progress Logging
  const handleAddProgress = async (entry: ProgressEntry) => {
    const updated = await apiClient.addProgress(entry);
    setProgress(updated);
    // If today's weight updated, update profile weight
    if (entry.weightKg && profile) {
      const updatedProfile = { ...profile, weight: entry.weightKg };
      const { calculations: c } = await apiClient.saveProfile(updatedProfile);
      setProfile(updatedProfile);
      setCalculations(c);
    }
  };

  const handleDeleteProgress = async (id: string) => {
    const updated = await apiClient.deleteProgress(id);
    setProgress(updated);
  };

  // Demo Mode 1-Click Loader
  const handleLoadDemo = async () => {
    setIsLoadingDemo(true);
    try {
      const demo = await apiClient.loadDemo();
      setProfile(demo.profile);
      setCalculations(demo.calculations);
      setDietPlan(demo.dietPlan);
      setWorkoutPlan(demo.workoutPlan);
      const records = await apiClient.getProgress();
      setProgress(records);
      setIsOnboardingOpen(false);

      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#10b981', '#06b6d4', '#f59e0b', '#3b82f6'],
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingDemo(false);
    }
  };

  // Reset Data
  const handleResetData = async () => {
    await apiClient.resetProfile();
    setProfile(null);
    setCalculations(null);
    setDietPlan(null);
    setWorkoutPlan(null);
    setProgress([]);
    setChatHistory([]);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-zinc-950 text-zinc-100 font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        geminiConnected={geminiConnected}
        userGoal={profile?.goals.primaryGoal}
      />

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header
          profile={profile}
          units={units}
          onToggleUnits={handleToggleUnits}
          onOpenOnboarding={() => setIsOnboardingOpen(true)}
          onOpenDisclaimer={() => setIsDisclaimerOpen(true)}
          onLoadDemo={handleLoadDemo}
          isLoadingDemo={isLoadingDemo}
        />

        {/* Routed View Body */}
        <main className="flex-1 overflow-y-auto">
          {currentTab === 'dashboard' && (
            <DashboardView
              profile={profile}
              calculations={calculations}
              dietPlan={dietPlan}
              workoutPlan={workoutPlan}
              progress={progress}
              units={units}
              onNavigate={setCurrentTab}
              onOpenOnboarding={() => setIsOnboardingOpen(true)}
              onGenerateDiet={handleGenerateDiet}
              onGenerateWorkout={handleGenerateWorkout}
              isGeneratingDiet={isGeneratingDiet}
              isGeneratingWorkout={isGeneratingWorkout}
            />
          )}

          {currentTab === 'body-analysis' && (
            <BodyAnalysisView
              profile={profile}
              calculations={calculations}
              units={units}
              onOpenOnboarding={() => setIsOnboardingOpen(true)}
            />
          )}

          {currentTab === 'diet' && (
            <DietPlannerView
              profile={profile}
              calculations={calculations}
              dietPlan={dietPlan}
              onGenerateDiet={handleGenerateDiet}
              onRegenerateMeal={handleRegenerateMeal}
              isGeneratingDiet={isGeneratingDiet}
              onOpenOnboarding={() => setIsOnboardingOpen(true)}
            />
          )}

          {currentTab === 'workout' && (
            <WorkoutPlannerView
              profile={profile}
              workoutPlan={workoutPlan}
              onGenerateWorkout={handleGenerateWorkout}
              onReplaceExercise={handleReplaceExercise}
              isGeneratingWorkout={isGeneratingWorkout}
              onOpenOnboarding={() => setIsOnboardingOpen(true)}
            />
          )}

          {currentTab === 'ai-assistant' && (
            <AIAssistantView
              profile={profile}
              calculations={calculations}
              dietPlan={dietPlan}
              workoutPlan={workoutPlan}
              chatHistory={chatHistory}
              onSendMessage={handleSendMessage}
              onClearChat={handleClearChat}
              isSending={isSendingChat}
              onOpenOnboarding={() => setIsOnboardingOpen(true)}
            />
          )}

          {currentTab === 'progress' && (
            <ProgressTrackerView
              profile={profile}
              calculations={calculations}
              progress={progress}
              units={units}
              onAddEntry={handleAddProgress}
              onDeleteEntry={handleDeleteProgress}
              onOpenOnboarding={() => setIsOnboardingOpen(true)}
            />
          )}

          {currentTab === 'profile' && (
            <ProfileView
              profile={profile}
              calculations={calculations}
              units={units}
              onEditProfile={() => setIsOnboardingOpen(true)}
              onOpenOnboarding={() => setIsOnboardingOpen(true)}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsView
              units={units}
              onSetUnits={setUnits}
              onResetData={handleResetData}
              onEditProfile={() => setIsOnboardingOpen(true)}
              geminiConnected={geminiConnected}
            />
          )}
        </main>
      </div>

      {/* Onboarding Wizard Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        onSaveProfile={handleSaveProfile}
        initialProfile={profile}
      />

      {/* Medical & Algorithmic Disclaimer Modal */}
      <DisclaimerModal
        isOpen={isDisclaimerOpen}
        onClose={() => setIsDisclaimerOpen(false)}
      />
    </div>
  );
}
