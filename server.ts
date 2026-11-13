import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { dbService } from './server/db';
import {
  chatWithAssistant,
  generateAiDietPlan,
  generateAiWorkoutPlan,
  regenerateAiMeal,
  replaceAiExercise,
  hasValidGeminiKey,
} from './server/gemini';
import { calculateFullBodyProfile } from './src/lib/calculations';
import { UserProfile, ProgressEntry } from './src/types';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3000);
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));

// API ROUTES

// Health & System Info
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    geminiConfigured: hasValidGeminiKey,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Profile & Calculations
app.get('/api/profile', (_req, res) => {
  const profile = dbService.getProfile();
  const calculations = dbService.getCalculations();
  res.json({ profile, calculations });
});

app.post('/api/profile', (req, res) => {
  try {
    const profileData: UserProfile = req.body;
    if (!profileData || !profileData.name || !profileData.weight || !profileData.height) {
      return res.status(400).json({ error: 'Missing required profile fields.' });
    }

    const { profile, calculations } = dbService.saveProfile(profileData);
    res.json({ profile, calculations, success: true });
  } catch (err: any) {
    console.error('[API] Save profile error:', err);
    res.status(500).json({ error: err.message || 'Failed to save profile' });
  }
});

app.delete('/api/profile', (_req, res) => {
  dbService.resetAll();
  res.json({ success: true, message: 'All personal data has been reset.' });
});

// Diet Plan Routes
app.get('/api/diet-plan', (_req, res) => {
  const dietPlan = dbService.getDietPlan();
  res.json({ dietPlan });
});

app.post('/api/diet-plan/generate', async (req, res) => {
  try {
    const profile = dbService.getProfile();
    if (!profile) {
      return res.status(400).json({ error: 'Please complete your onboarding profile first.' });
    }

    const calculations = dbService.getCalculations() || calculateFullBodyProfile(profile);
    const dietPlan = await generateAiDietPlan(profile, calculations);
    dbService.saveDietPlan(dietPlan);

    res.json({ dietPlan, success: true });
  } catch (err: any) {
    console.error('[API] Diet plan generation failed:', err);
    res.status(500).json({ error: err.message || 'Diet plan generation failed' });
  }
});

app.post('/api/diet-plan/regenerate-meal', async (req, res) => {
  try {
    const { dayNumber, mealType, existingMeal } = req.body;
    const profile = dbService.getProfile();
    if (!profile) {
      return res.status(400).json({ error: 'No profile found.' });
    }

    const updatedMeal = await regenerateAiMeal(profile, dayNumber, mealType, existingMeal);

    // Update meal in current active diet plan
    const activeDietPlan = dbService.getDietPlan();
    if (activeDietPlan) {
      const targetDay = activeDietPlan.days.find((d) => d.dayNumber === dayNumber);
      if (targetDay && targetDay.meals) {
        (targetDay.meals as any)[mealType] = updatedMeal;
        dbService.saveDietPlan(activeDietPlan);
      }
    }

    res.json({ meal: updatedMeal, success: true });
  } catch (err: any) {
    console.error('[API] Regenerate meal failed:', err);
    res.status(500).json({ error: err.message || 'Failed to swap meal' });
  }
});

// Workout Plan Routes
app.get('/api/workout-plan', (_req, res) => {
  const workoutPlan = dbService.getWorkoutPlan();
  res.json({ workoutPlan });
});

app.post('/api/workout-plan/generate', async (_req, res) => {
  try {
    const profile = dbService.getProfile();
    if (!profile) {
      return res.status(400).json({ error: 'Please complete your onboarding profile first.' });
    }

    const calculations = dbService.getCalculations() || calculateFullBodyProfile(profile);
    const workoutPlan = await generateAiWorkoutPlan(profile, calculations);
    dbService.saveWorkoutPlan(workoutPlan);

    res.json({ workoutPlan, success: true });
  } catch (err: any) {
    console.error('[API] Workout plan generation failed:', err);
    res.status(500).json({ error: err.message || 'Workout plan generation failed' });
  }
});

app.post('/api/workout-plan/replace-exercise', async (req, res) => {
  try {
    const { dayFocus, existingExercise } = req.body;
    const profile = dbService.getProfile();
    if (!profile) {
      return res.status(400).json({ error: 'No profile found.' });
    }

    const replacement = await replaceAiExercise(profile, dayFocus, existingExercise);
    res.json({ exercise: replacement, success: true });
  } catch (err: any) {
    console.error('[API] Exercise replacement error:', err);
    res.status(500).json({ error: err.message || 'Failed to replace exercise' });
  }
});

// Progress Tracking Routes
app.get('/api/progress', (_req, res) => {
  const records = dbService.getProgress();
  res.json({ records });
});

app.post('/api/progress', (req, res) => {
  try {
    const entry: ProgressEntry = req.body;
    if (!entry.date || !entry.weightKg) {
      return res.status(400).json({ error: 'Date and Weight are required.' });
    }

    const updated = dbService.addProgressEntry(entry);
    res.json({ records: updated, success: true });
  } catch (err: any) {
    console.error('[API] Progress save error:', err);
    res.status(500).json({ error: err.message || 'Failed to record progress' });
  }
});

app.delete('/api/progress/:id', (req, res) => {
  const { id } = req.params;
  const updated = dbService.deleteProgressEntry(id);
  res.json({ records: updated, success: true });
});

// AI Fitness Assistant Chat
app.get('/api/chat', (_req, res) => {
  const history = dbService.getChatHistory();
  res.json({ history });
});

app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message text required' });
    }

    const profile = dbService.getProfile();
    const calculations = dbService.getCalculations();
    const dietPlan = dbService.getDietPlan();
    const workoutPlan = dbService.getWorkoutPlan();
    const history = dbService.getChatHistory();

    const userMsg = {
      id: `msg-${Date.now()}-user`,
      sender: 'user' as const,
      content: message,
      timestamp: new Date().toISOString(),
    };
    dbService.addChatMessage(userMsg);

    const { reply, contextUsed } = await chatWithAssistant(
      message,
      history,
      profile,
      calculations,
      dietPlan,
      workoutPlan
    );

    const assistantMsg = {
      id: `msg-${Date.now()}-assistant`,
      sender: 'assistant' as const,
      content: reply,
      timestamp: new Date().toISOString(),
      contextUsed,
    };
    dbService.addChatMessage(assistantMsg);

    res.json({ message: assistantMsg, success: true });
  } catch (err: any) {
    console.error('[API] Chat error:', err);
    res.status(500).json({ error: err.message || 'Failed to process chat message' });
  }
});

app.delete('/api/chat', (_req, res) => {
  dbService.clearChatHistory();
  res.json({ success: true });
});

// Demo Data Loader
app.post('/api/demo', async (_req, res) => {
  try {
    const demoProfile: UserProfile = {
      id: 'demo-user-1',
      name: 'Alex Rivera',
      age: 29,
      sex: 'male',
      height: 178,
      weight: 78.5,
      country: 'United States',
      units: 'metric',
      measurements: {
        waist: 83,
        neck: 38.5,
        hip: 94,
        chest: 102,
        arm: 37,
        thigh: 58,
        updatedAt: new Date().toISOString(),
      },
      fitness: {
        level: 'intermediate',
        experienceYears: 3,
        gymAccess: 'full_gym',
        daysPerWeek: 4,
        preferredDurationMinutes: 60,
        injuries: ['Mild lower back tightness with heavy conventional deadlifts'],
        exercisePreferences: ['Barbell bench press', 'Incline dumbbell presses', 'Pull-ups', 'RDLs'],
        preferredSplit: 'upper_lower',
      },
      diet: {
        preference: 'omnivore',
        allergies: [],
        intolerances: ['Lactose (mild)'],
        dislikedFoods: ['Eggplant'],
        preferredCuisine: 'flexible',
        dailyBudgetEstimated: 25,
        currency: 'USD',
        mealsPerDay: 4,
      },
      goals: {
        primaryGoal: 'lean_muscle_gain',
        targetWeight: 82,
        timelineWeeks: 16,
        mainPriority: 'Build lean chest, back and arms while keeping waist under 84cm',
        motivation: 'Improve athletic performance and functional body composition',
      },
      lifestyle: {
        activityLevel: 'moderately_active',
        sleepHours: 7.5,
        dailyStepsEstimated: 9500,
        occupationType: 'Software Engineer',
        dailyWaterLiters: 3.5,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isOnboarded: true,
    };

    const { profile, calculations } = dbService.saveProfile(demoProfile);
    const dietPlan = await generateAiDietPlan(profile, calculations);
    dbService.saveDietPlan(dietPlan);
    const workoutPlan = await generateAiWorkoutPlan(profile, calculations);
    dbService.saveWorkoutPlan(workoutPlan);

    // Seed realistic 30-day progress history
    const baseDate = new Date();
    const demoProgress: ProgressEntry[] = [
      {
        id: 'p-1',
        userId: profile.id,
        date: new Date(baseDate.getTime() - 28 * 86400000).toISOString().split('T')[0],
        weightKg: 80.2,
        waistCm: 85.0,
        neckCm: 38.0,
        bodyFatPct: 17.2,
        workoutCompleted: true,
        calorieAdherenceScore: 85,
        notes: 'Initial weigh-in after reset.',
      },
      {
        id: 'p-2',
        userId: profile.id,
        date: new Date(baseDate.getTime() - 21 * 86400000).toISOString().split('T')[0],
        weightKg: 79.6,
        waistCm: 84.5,
        neckCm: 38.2,
        bodyFatPct: 16.6,
        workoutCompleted: true,
        calorieAdherenceScore: 90,
        notes: 'Consistent with 4 training sessions.',
      },
      {
        id: 'p-3',
        userId: profile.id,
        date: new Date(baseDate.getTime() - 14 * 86400000).toISOString().split('T')[0],
        weightKg: 79.1,
        waistCm: 84.0,
        neckCm: 38.3,
        bodyFatPct: 16.0,
        workoutCompleted: true,
        calorieAdherenceScore: 92,
        notes: 'Upper body strength increasing on incline press.',
      },
      {
        id: 'p-4',
        userId: profile.id,
        date: new Date(baseDate.getTime() - 7 * 86400000).toISOString().split('T')[0],
        weightKg: 78.8,
        waistCm: 83.5,
        neckCm: 38.4,
        bodyFatPct: 15.5,
        workoutCompleted: true,
        calorieAdherenceScore: 95,
        notes: 'Energy levels high, sleep quality at 8 hours.',
      },
      {
        id: 'p-5',
        userId: profile.id,
        date: new Date().toISOString().split('T')[0],
        weightKg: 78.5,
        waistCm: 83.0,
        neckCm: 38.5,
        bodyFatPct: 15.0,
        workoutCompleted: true,
        calorieAdherenceScore: 98,
        notes: 'Weigh-in on track with lean recomp target.',
      },
    ];

    demoProgress.forEach((entry) => dbService.addProgressEntry(entry));

    res.json({
      success: true,
      profile,
      calculations,
      dietPlan,
      workoutPlan,
    });
  } catch (err: any) {
    console.error('[API] Demo seeding error:', err);
    res.status(500).json({ error: err.message || 'Failed to seed demo data' });
  }
});

// Export & Import
app.get('/api/export', (_req, res) => {
  const data = dbService.exportAll();
  res.setHeader('Content-Disposition', 'attachment; filename="fitmind_backup.json"');
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(data, null, 2));
});

app.post('/api/import', (req, res) => {
  const ok = dbService.importAll(req.body);
  if (!ok) {
    return res.status(400).json({ error: 'Invalid database payload' });
  }
  res.json({ success: true });
});

// Express & Vite server startup
async function startServer() {
  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🚀 [FitMind AI Server] Running on http://0.0.0.0:${PORT}`);
    console.log(`⚡ Gemini 3.8 Flash Integration: ${hasValidGeminiKey ? 'CONNECTED' : 'STANDBY (Using High-Quality Deterministic Mode)'}`);
  });
}

startServer();
