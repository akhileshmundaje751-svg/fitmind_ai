import {
  CalculationResults,
  ChatMessage,
  DietPlan,
  ProgressEntry,
  UnitSystem,
  UserProfile,
  WorkoutPlan,
} from '../types';

export const apiClient = {
  async getProfile(): Promise<{ profile: UserProfile | null; calculations: CalculationResults | null }> {
    try {
      const res = await fetch('/api/profile');
      if (!res.ok) throw new Error('Failed to load profile');
      return await res.json();
    } catch (err) {
      console.warn('[Storage] API fetch failed, falling back to localStorage cache:', err);
      const cached = localStorage.getItem('fitmind_profile_cache');
      return cached ? JSON.parse(cached) : { profile: null, calculations: null };
    }
  },

  async saveProfile(profile: UserProfile): Promise<{ profile: UserProfile; calculations: CalculationResults }> {
    const res = await fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to save profile');
    }
    const data = await res.json();
    localStorage.setItem('fitmind_profile_cache', JSON.stringify(data));
    return data;
  },

  async resetProfile(): Promise<void> {
    await fetch('/api/profile', { method: 'DELETE' });
    localStorage.removeItem('fitmind_profile_cache');
  },

  async getDietPlan(): Promise<DietPlan | null> {
    try {
      const res = await fetch('/api/diet-plan');
      if (!res.ok) return null;
      const data = await res.json();
      return data.dietPlan || null;
    } catch {
      return null;
    }
  },

  async generateDietPlan(): Promise<DietPlan> {
    const res = await fetch('/api/diet-plan/generate', { method: 'POST' });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to generate diet plan');
    }
    const data = await res.json();
    return data.dietPlan;
  },

  async regenerateMeal(dayNumber: number, mealType: string, existingMeal: any): Promise<any> {
    const res = await fetch('/api/diet-plan/regenerate-meal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dayNumber, mealType, existingMeal }),
    });
    if (!res.ok) throw new Error('Failed to regenerate meal');
    const data = await res.json();
    return data.meal;
  },

  async getWorkoutPlan(): Promise<WorkoutPlan | null> {
    try {
      const res = await fetch('/api/workout-plan');
      if (!res.ok) return null;
      const data = await res.json();
      return data.workoutPlan || null;
    } catch {
      return null;
    }
  },

  async generateWorkoutPlan(): Promise<WorkoutPlan> {
    const res = await fetch('/api/workout-plan/generate', { method: 'POST' });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to generate workout plan');
    }
    const data = await res.json();
    return data.workoutPlan;
  },

  async replaceExercise(dayFocus: string, existingExercise: any): Promise<any> {
    const res = await fetch('/api/workout-plan/replace-exercise', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dayFocus, existingExercise }),
    });
    if (!res.ok) throw new Error('Failed to replace exercise');
    const data = await res.json();
    return data.exercise;
  },

  async getProgress(): Promise<ProgressEntry[]> {
    try {
      const res = await fetch('/api/progress');
      if (!res.ok) return [];
      const data = await res.json();
      return data.records || [];
    } catch {
      return [];
    }
  },

  async addProgress(entry: ProgressEntry): Promise<ProgressEntry[]> {
    const res = await fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    });
    if (!res.ok) throw new Error('Failed to save progress entry');
    const data = await res.json();
    return data.records;
  },

  async deleteProgress(id: string): Promise<ProgressEntry[]> {
    const res = await fetch(`/api/progress/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete progress entry');
    const data = await res.json();
    return data.records;
  },

  async getChatHistory(): Promise<ChatMessage[]> {
    try {
      const res = await fetch('/api/chat');
      if (!res.ok) return [];
      const data = await res.json();
      return data.history || [];
    } catch {
      return [];
    }
  },

  async sendChatMessage(message: string): Promise<ChatMessage> {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
    if (!res.ok) throw new Error('Chat request failed');
    const data = await res.json();
    return data.message;
  },

  async clearChat(): Promise<void> {
    await fetch('/api/chat', { method: 'DELETE' });
  },

  async loadDemo(): Promise<{
    profile: UserProfile;
    calculations: CalculationResults;
    dietPlan: DietPlan;
    workoutPlan: WorkoutPlan;
  }> {
    const res = await fetch('/api/demo', { method: 'POST' });
    if (!res.ok) throw new Error('Failed to load demo data');
    const data = await res.json();
    return data;
  },

  async checkHealth(): Promise<{ geminiConfigured: boolean; status: string }> {
    try {
      const res = await fetch('/api/health');
      if (!res.ok) return { geminiConfigured: false, status: 'error' };
      return await res.json();
    } catch {
      return { geminiConfigured: false, status: 'offline' };
    }
  },
};

/**
 * Format helpers for displaying weight and measurements according to user unit preference
 */
export function formatWeight(kg: number, unit: UnitSystem = 'metric'): string {
  if (unit === 'imperial') {
    return `${(kg * 2.20462).toFixed(1)} lbs`;
  }
  return `${kg.toFixed(1)} kg`;
}

export function formatLength(cm: number, unit: UnitSystem = 'metric'): string {
  if (unit === 'imperial') {
    return `${(cm * 0.393701).toFixed(1)} in`;
  }
  return `${cm.toFixed(1)} cm`;
}
