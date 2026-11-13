import { GoogleGenAI, Type } from '@google/genai';
import {
  CalculationResults,
  ChatMessage,
  DietPlan,
  ExerciseItem,
  MealItem,
  UserProfile,
  WorkoutPlan,
} from '../src/types';

// Initialize Gemini SDK with User-Agent header as required
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

export const hasValidGeminiKey = Boolean(apiKey && apiKey !== 'MY_GEMINI_API_KEY');

/**
 * Generate a 7-day personalized diet plan using Gemini 3.8 Flash
 */
export async function generateAiDietPlan(
  profile: UserProfile,
  calculations: CalculationResults
): Promise<DietPlan> {
  const { nutritionTargets } = calculations;

  const prompt = `
Act as an expert sports nutritionist and clinical dietitian.
Generate a structured, highly personalized 7-day meal plan for:
- Name: ${profile.name}
- Age: ${profile.age}, Sex: ${profile.sex}
- Height: ${profile.height} cm, Weight: ${profile.weight} kg
- Fitness Goal: ${profile.goals.primaryGoal} (${nutritionTargets.strategyDescription})
- Daily Caloric Target: ${nutritionTargets.dailyCalories} kcal (Protein: ${nutritionTargets.proteinGrams}g, Carbs: ${nutritionTargets.carbsGrams}g, Fats: ${nutritionTargets.fatGrams}g)
- Dietary Preference: ${profile.diet.preference}
- Preferred Cuisine: ${profile.diet.preferredCuisine}
- Food Allergies: ${profile.diet.allergies.length > 0 ? profile.diet.allergies.join(', ') : 'None'}
- Food Intolerances: ${profile.diet.intolerances.length > 0 ? profile.diet.intolerances.join(', ') : 'None'}
- Foods Disliked: ${profile.diet.dislikedFoods.length > 0 ? profile.diet.dislikedFoods.join(', ') : 'None'}
- Daily Estimated Budget: ${profile.diet.dailyBudgetEstimated ? `${profile.diet.dailyBudgetEstimated} ${profile.diet.currency || 'USD'}` : 'Moderate'}

CRITICAL GUIDELINES:
1. STRICT ALLERGY ADHERENCE: Never include items in food allergies or intolerances.
2. If cuisine preference is 'indian', incorporate authentic, macro-balanced Indian foods (such as paneer, dal, soy chunks, roti, rice, curd, idli, dosa, rajma, eggs/chicken/fish if permitted). Never assume Indian means strictly vegetarian unless specified.
3. Every single meal MUST specify realistic portion sizes, calories, protein (g), carbs (g), and fat (g).
4. Each day's sum of meals must align closely with the daily target (${nutritionTargets.dailyCalories} kcal).
5. Provide a categorised grocery list for the full 7-day schedule.
6. Provide actionable dietitian notes.
`;

  try {
    if (!hasValidGeminiKey) {
      console.warn('[Gemini] No valid GEMINI_API_KEY found in environment. Generating deterministic high-fidelity plan.');
      return generateFallbackDietPlan(profile, calculations);
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'You are a certified sports nutrition specialist. Return strictly valid JSON conforming to the requested schema. Ensure internal calorie consistency: (protein*4 + carbs*4 + fat*9) ~= calories.',
        responseMimeType: 'application/json',
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('Empty response received from Gemini model.');
    }

    const parsed = JSON.parse(text);

    return {
      id: `diet-${Date.now()}`,
      userId: profile.id,
      createdAt: new Date().toISOString(),
      calorieTarget: nutritionTargets.dailyCalories,
      macros: {
        protein: nutritionTargets.proteinGrams,
        carbs: nutritionTargets.carbsGrams,
        fat: nutritionTargets.fatGrams,
      },
      planType: profile.diet.preference,
      cuisine: profile.diet.preferredCuisine,
      days: parsed.days || generateFallbackDietPlan(profile, calculations).days,
      groceryList: parsed.groceryList || generateFallbackDietPlan(profile, calculations).groceryList,
      estimatedWeeklyBudget: parsed.estimatedWeeklyBudget || '$60 - $85 (Approx)',
      hydrationGoalLiters: Number((profile.weight * 0.035).toFixed(1)),
      dietitianNotes: parsed.dietitianNotes || [
        'Distribute protein evenly across all meals to maximize muscle protein synthesis.',
        'Hydrate with at least 500ml water upon waking.',
        'Adjust portion sizing if training intensity fluctuates.',
      ],
    };
  } catch (err: any) {
    console.error('[Gemini Diet Plan Error]', err);
    return generateFallbackDietPlan(profile, calculations);
  }
}

/**
 * Regenerate a single meal
 */
export async function regenerateAiMeal(
  profile: UserProfile,
  dayNumber: number,
  mealType: string,
  existingMeal: MealItem
): Promise<MealItem> {
  if (!hasValidGeminiKey) {
    return {
      ...existingMeal,
      id: `meal-${Date.now()}`,
      name: `Alternative: ${existingMeal.name} (Custom Swap)`,
      notes: 'Quick swap matching target macronutrients.',
    };
  }

  const prompt = `
Generate a single alternative meal for:
- Meal Type: ${mealType} (Day ${dayNumber})
- Target Calories: ~${existingMeal.calories} kcal
- Target Protein: ~${existingMeal.protein}g
- Target Carbs: ~${existingMeal.carbs}g
- Target Fat: ~${existingMeal.fat}g
- Dietary Preference: ${profile.diet.preference}
- Preferred Cuisine: ${profile.diet.preferredCuisine}
- Exclude Allergies: ${profile.diet.allergies.join(', ') || 'None'}
- Previous meal to replace: "${existingMeal.name}"

Return strictly valid JSON with properties:
{
  "name": string,
  "portion": string,
  "calories": number,
  "protein": number,
  "carbs": number,
  "fat": number,
  "notes": string,
  "alternatives": string[]
}
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return {
      id: `meal-${Date.now()}`,
      name: parsed.name || `Fresh ${mealType} Alternative`,
      portion: parsed.portion || existingMeal.portion,
      calories: Number(parsed.calories) || existingMeal.calories,
      protein: Number(parsed.protein) || existingMeal.protein,
      carbs: Number(parsed.carbs) || existingMeal.carbs,
      fat: Number(parsed.fat) || existingMeal.fat,
      notes: parsed.notes || 'Nutritionally matched swap.',
      alternatives: parsed.alternatives || ['Tofu scramble', 'Greek yogurt cup'],
    };
  } catch (err) {
    console.error('[Gemini Single Meal Swap Error]', err);
    return {
      ...existingMeal,
      id: `meal-${Date.now()}`,
      name: `Alternate ${existingMeal.name}`,
    };
  }
}

/**
 * Generate a complete customized weekly workout program using Gemini 3.8 Flash
 */
export async function generateAiWorkoutPlan(
  profile: UserProfile,
  calculations: CalculationResults
): Promise<WorkoutPlan> {
  const prompt = `
Act as an elite strength and conditioning coach (CSCS certified).
Create a complete, evidence-based weekly workout program tailored to:
- Name: ${profile.name}
- Age: ${profile.age}, Sex: ${profile.sex}
- Fitness Level: ${profile.fitness.level}
- Training Experience: ${profile.fitness.experienceYears} years
- Goal: ${profile.goals.primaryGoal}
- Days Per Week: ${profile.fitness.daysPerWeek} days
- Equipment Access: ${profile.fitness.gymAccess}
- Preferred Workout Duration: ${profile.fitness.preferredDurationMinutes} minutes
- Reported Injuries / Limitations: ${profile.fitness.injuries.length > 0 ? profile.fitness.injuries.join(', ') : 'None'}
- Preferred Split: ${profile.fitness.preferredSplit || 'Optimal split for frequency'}
- Exercise Preferences: ${profile.fitness.exercisePreferences.length > 0 ? profile.fitness.exercisePreferences.join(', ') : 'Standard'}

RULES:
1. SAFEGUARD: Strict avoidance of exercises that aggravate reported injuries: ${profile.fitness.injuries.join(', ') || 'None'}.
2. Provide specific sets, rep ranges, rest periods (in seconds), equipment needed, and difficulty for every exercise.
3. Include brief execution instructions and 2-3 essential form cues for injury prevention.
4. Provide structured warm-up and cool-down routines for each training day.
5. Provide actionable progressive overload guidance and recovery protocols.
`;

  try {
    if (!hasValidGeminiKey) {
      console.warn('[Gemini] No valid GEMINI_API_KEY found in environment. Generating deterministic workout program.');
      return generateFallbackWorkoutPlan(profile);
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'You are a CSCS certified strength and conditioning coach. Return strictly valid JSON conforming to the requested workout schema.',
        responseMimeType: 'application/json',
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('Empty response received from Gemini.');
    }

    const parsed = JSON.parse(text);

    return {
      id: `workout-${Date.now()}`,
      userId: profile.id,
      createdAt: new Date().toISOString(),
      title: parsed.title || `${profile.name}'s ${profile.fitness.level.toUpperCase()} ${profile.goals.primaryGoal.replace('_', ' ').toUpperCase()} Program`,
      splitType: profile.fitness.preferredSplit || 'ppl',
      level: profile.fitness.level,
      daysPerWeek: profile.fitness.daysPerWeek,
      days: parsed.days || generateFallbackWorkoutPlan(profile).days,
      progressiveOverloadGuidelines: parsed.progressiveOverloadGuidelines || [
        'Add 1 rep per set when all target reps are completed with clean form.',
        'Increase weight by 2.5% - 5% once top of rep range is hit across all sets.',
        'Track RPE (Rate of Perceived Exertion) aiming for 7-9 on working sets.',
      ],
      recoveryProtocol: parsed.recoveryProtocol || [
        'Aim for 7-9 hours of consistent restorative sleep.',
        'Consume 30-40g protein within 2 hours post-workout.',
        'Perform 10-15 minutes of light mobility on designated rest days.',
      ],
      injurySafeguards: parsed.injurySafeguards || [
        'Never train through sharp joint pain.',
        'Maintain neutral spine during loaded compound movements.',
      ],
    };
  } catch (err: any) {
    console.error('[Gemini Workout Plan Error]', err);
    return generateFallbackWorkoutPlan(profile);
  }
}

/**
 * Replace a single exercise
 */
export async function replaceAiExercise(
  profile: UserProfile,
  dayFocus: string,
  existingExercise: ExerciseItem
): Promise<ExerciseItem> {
  if (!hasValidGeminiKey) {
    return {
      ...existingExercise,
      id: `ex-${Date.now()}`,
      name: `Alternative: Dumbbell ${existingExercise.name}`,
      category: 'Compound',
    };
  }

  const prompt = `
Provide an alternative exercise for:
- Current Exercise: ${existingExercise.name}
- Muscle Groups: ${existingExercise.targetMuscleGroups.join(', ')}
- Day Focus: ${dayFocus}
- Equipment Access: ${profile.fitness.gymAccess}
- Reported Injuries to avoid: ${profile.fitness.injuries.join(', ') || 'None'}

Return valid JSON with properties:
{
  "name": string,
  "targetMuscleGroups": string[],
  "sets": number,
  "reps": string,
  "restSeconds": number,
  "equipment": string,
  "difficulty": "Beginner" | "Intermediate" | "Advanced",
  "instructions": string,
  "formCues": string[],
  "alternatives": string[],
  "category": "Compound" | "Isolation" | "Bodyweight" | "Cardio"
}
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return {
      id: `ex-${Date.now()}`,
      name: parsed.name || `Alternative ${existingExercise.name}`,
      targetMuscleGroups: parsed.targetMuscleGroups || existingExercise.targetMuscleGroups,
      sets: Number(parsed.sets) || existingExercise.sets,
      reps: parsed.reps || existingExercise.reps,
      restSeconds: Number(parsed.restSeconds) || existingExercise.restSeconds,
      equipment: parsed.equipment || existingExercise.equipment,
      difficulty: parsed.difficulty || existingExercise.difficulty,
      instructions: parsed.instructions || existingExercise.instructions,
      formCues: parsed.formCues || existingExercise.formCues,
      alternatives: parsed.alternatives || existingExercise.alternatives,
      category: parsed.category || existingExercise.category,
    };
  } catch (err) {
    console.error('[Gemini Replace Exercise Error]', err);
    return {
      ...existingExercise,
      id: `ex-${Date.now()}`,
      name: `Alternative ${existingExercise.name}`,
    };
  }
}

/**
 * Context-aware AI Fitness Assistant Chat
 */
export async function chatWithAssistant(
  message: string,
  conversationHistory: ChatMessage[],
  profile: UserProfile | null,
  calculations: CalculationResults | null,
  dietPlan: DietPlan | null,
  workoutPlan: WorkoutPlan | null
): Promise<{ reply: string; contextUsed: boolean }> {
  if (!hasValidGeminiKey) {
    return {
      reply: generateDeterministicAssistantReply(message, profile, calculations),
      contextUsed: Boolean(profile),
    };
  }

  const userContextPrompt = profile
    ? `
USER REAL FITNESS PROFILE:
- Name: ${profile.name}
- Age: ${profile.age}, Biological Sex: ${profile.sex}
- Height: ${profile.height} cm, Weight: ${profile.weight} kg (${(profile.weight * 2.20462).toFixed(1)} lbs)
- Primary Goal: ${profile.goals.primaryGoal}
- Body Fat (US Navy): ${calculations?.bodyFatNavy.isValid ? `${calculations.bodyFatNavy.percentage}% (${calculations.bodyFatNavy.category})` : 'Not yet calculated'}
- BMI: ${calculations?.bmi.value} (${calculations?.bmi.category})
- Basal Metabolic Rate (BMR): ${calculations?.bmr.value} kcal
- TDEE: ${calculations?.tdee.value} kcal
- Calorie Target: ${calculations?.nutritionTargets.dailyCalories} kcal
- Macros Target: Protein ${calculations?.nutritionTargets.proteinGrams}g, Carbs ${calculations?.nutritionTargets.carbsGrams}g, Fat ${calculations?.nutritionTargets.fatGrams}g
- Dietary Preference: ${profile.diet.preference}, Preferred Cuisine: ${profile.diet.preferredCuisine}
- Food Allergies: ${profile.diet.allergies.join(', ') || 'None'}
- Fitness Level: ${profile.fitness.level}, Days/week: ${profile.fitness.daysPerWeek}
- Gym Access: ${profile.fitness.gymAccess}
- Reported Injuries: ${profile.fitness.injuries.join(', ') || 'None'}
- Current Workout Split: ${workoutPlan?.splitType || profile.fitness.preferredSplit || 'Standard'}
`
    : 'User has not completed their onboarding profile yet.';

  const systemInstruction = `
You are FitMind AI, an elite evidence-based fitness, sports nutrition, and body composition coach.
You have direct access to the user's validated profile, calculations, and active plans.

STRICT OPERATIONAL DIRECTIVES:
1. ALWAYS anchor answers to the user's real stats above (e.g. refer to their exact ${calculations?.nutritionTargets.dailyCalories || 'calorie'} target, weight, or goal).
2. Avoid generic boilerplate when user-specific numbers are available.
3. NEVER invent body measurements or clinical diagnoses.
4. Explain the scientific physiological rationale (e.g., energy balance, protein synthesis, progressive overload).
5. SAFETY: If asked about chest pain, joint trauma, acute injury, or eating disorders, urge them to consult a medical professional immediately.
6. Keep tone encouraging, direct, professional, and concise with structured markdown.
`;

  try {
    // Format previous turns for multi-turn context
    const recentHistory = conversationHistory.slice(-6).map((c) => ({
      role: c.sender === 'user' ? 'user' : 'model',
      parts: [{ text: c.content }],
    }));

    const contents = [
      ...recentHistory,
      {
        role: 'user',
        parts: [{ text: `[Active User Context]:\n${userContextPrompt}\n\n[User Question]:\n${message}` }],
      },
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
      },
    });

    const reply = response.text || 'I analyzed your request. Let me know if you would like me to adjust your diet or workout parameters.';
    return { reply, contextUsed: true };
  } catch (err: any) {
    console.error('[Gemini Chat Error]', err);
    return {
      reply: generateDeterministicAssistantReply(message, profile, calculations),
      contextUsed: Boolean(profile),
    };
  }
}

/**
 * Deterministic fallback reply when Gemini API is offline or key is unconfigured
 */
function generateDeterministicAssistantReply(
  query: string,
  profile: UserProfile | null,
  calculations: CalculationResults | null
): string {
  const q = query.toLowerCase();

  if (!profile || !calculations) {
    return `Welcome to FitMind AI! Please complete your onboarding profile first so I can calculate your exact US Navy body fat percentage, BMR, TDEE, and daily macronutrient targets.`;
  }

  const { nutritionTargets, bmi, bodyFatNavy, tdee, bmr } = calculations;

  if (q.includes('protein')) {
    return `### Protein Recommendation for ${profile.name}
Based on your goal of **${profile.goals.primaryGoal.replace('_', ' ')}** and current weight of **${profile.weight} kg**:

- **Daily Target:** **${nutritionTargets.proteinGrams}g** of protein per day (~${(nutritionTargets.proteinGrams / profile.weight).toFixed(1)}g per kg of bodyweight).
- **Energy Contribution:** ${nutritionTargets.proteinCalories} kcal (${nutritionTargets.macroRatios.proteinPct}% of total daily calories).
- **Recommended Sources:** ${profile.diet.preference === 'vegetarian' || profile.diet.preference === 'vegan' ? 'Tofu, Tempeh, Soy chunks, Lentils/Dal, Paneer (if vegetarian), Chickpeas, Edamame, and High-grade Plant Protein isolate.' : 'Chicken breast, Eggs, Greek yogurt, Lean beef, Fish, Paneer/Cottage cheese, and Whey isolate.'}
- **Timing:** Aim for 30–45g of high-leucine protein spaced every 3–4 hours to maximize muscle protein synthesis.`;
  }

  if (q.includes('body fat') || q.includes('navy')) {
    return `### Body Fat Analysis
- **Estimated Body Fat:** **${bodyFatNavy.percentage}%**
- **Classification:** **${bodyFatNavy.category}** (ACE standard)
- **Method Used:** US Navy Circumference Equation
- **Measurements:** Waist: ${profile.measurements.waist}cm, Neck: ${profile.measurements.neck}cm${profile.measurements.hip ? `, Hip: ${profile.measurements.hip}cm` : ''}.
- **Calculated Fat Mass:** ${calculations.bodyComposition.fatMassKg} kg (${calculations.bodyComposition.fatMassLbs} lbs)
- **Lean Body Mass:** ${calculations.bodyComposition.leanMassKg} kg (${calculations.bodyComposition.leanMassLbs} lbs)

*Note: Circumference regression is a statistical model with ~3% margin of error compared to DEXA.*`;
  }

  if (q.includes('calorie') || q.includes('tdee') || q.includes('deficit')) {
    return `### Energy Balance Breakdown
- **BMR (Mifflin-St Jeor):** ${bmr.value} kcal (energy burned at complete physical rest)
- **TDEE (Daily Burn):** ${tdee.value} kcal (with ${profile.lifestyle.activityLevel} multiplier of ${tdee.multiplier}x)
- **Daily Target:** **${nutritionTargets.dailyCalories} kcal/day**
- **Strategy:** ${nutritionTargets.strategyDescription} (${nutritionTargets.deficitOrSurplusPercentage > 0 ? `+${nutritionTargets.deficitOrSurplusPercentage}%` : `${nutritionTargets.deficitOrSurplusPercentage}%`})
- **Daily Macros:** Protein: ${nutritionTargets.proteinGrams}g | Carbs: ${nutritionTargets.carbsGrams}g | Fats: ${nutritionTargets.fatGrams}g`;
  }

  if (q.includes('paneer') && q.includes('soy')) {
    return `### Paneer vs Soy Chunks Substitution
Yes! Soy chunks are an exceptional swap for paneer:
- **Soy Chunks (50g raw):** ~170 kcal | **26g Protein** | 16g Carbs | 0.5g Fat.
- **Paneer (100g):** ~265–290 kcal | **18g Protein** | 4g Carbs | 20–22g Fat.
- **Verdict:** Soy chunks provide **significantly higher protein density** with virtually zero saturated fat, making them ideal during a caloric deficit or fat loss phase.`;
  }

  return `### FitMind AI Diagnostic for ${profile.name}
- **Current Weight:** ${profile.weight} kg | **BMI:** ${bmi.value} (${bmi.category})
- **Body Fat:** ${bodyFatNavy.percentage}% (${bodyFatNavy.category})
- **Daily Target:** ${nutritionTargets.dailyCalories} kcal (${nutritionTargets.proteinGrams}g Protein, ${nutritionTargets.carbsGrams}g Carbs, ${nutritionTargets.fatGrams}g Fat)
- **Training Frequency:** ${profile.fitness.daysPerWeek} days/week (${profile.fitness.gymAccess.replace('_', ' ')})

How can I help you adjust your workout or nutrition plan today?`;
}

/**
 * Deterministic fallback diet plan generator with rich realistic meals
 */
export function generateFallbackDietPlan(
  profile: UserProfile,
  calculations: CalculationResults
): DietPlan {
  const { nutritionTargets } = calculations;
  const isVeg = profile.diet.preference === 'vegetarian' || profile.diet.preference === 'vegan';
  const isIndian = profile.diet.preferredCuisine === 'indian';

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const days = daysOfWeek.map((dayName, index) => {
    const bCalories = Math.round(nutritionTargets.dailyCalories * 0.25);
    const lCalories = Math.round(nutritionTargets.dailyCalories * 0.35);
    const dCalories = Math.round(nutritionTargets.dailyCalories * 0.30);
    const sCalories = nutritionTargets.dailyCalories - (bCalories + lCalories + dCalories);

    return {
      dayNumber: index + 1,
      dayName,
      meals: {
        breakfast: {
          id: `b-${index}`,
          name: isIndian
            ? (isVeg ? 'High-Protein Moong Dal Chilla with Mint Chutney & Curd' : 'Masala Egg Omelette with Whole Wheat Toast & Spiced Sprouts')
            : (isVeg ? 'Rolled Oats with Chia Seeds, Almond Butter & Berries' : '3 Egg Scramble with Sautéed Spinach, Avocado & Ezekiel Toast'),
          portion: '1 generous serving',
          calories: bCalories,
          protein: Math.round(nutritionTargets.proteinGrams * 0.25),
          carbs: Math.round(nutritionTargets.carbsGrams * 0.25),
          fat: Math.round(nutritionTargets.fatGrams * 0.25),
          alternatives: ['Greek yogurt bowl with walnuts and blueberries', 'Protein pancake stack with maple syrup'],
        },
        lunch: {
          id: `l-${index}`,
          name: isIndian
            ? (isVeg ? 'Paneer Tikka with Yellow Tadka Dal, Brown Rice & Cucumber Salad' : 'Grilled Chicken Breast Curry with Steamed Rice, Roti & Curd')
            : (isVeg ? 'Mediterranean Quinoa Salad with Roasted Chickpeas & Tahini' : 'Herb Roasted Chicken Breast with Sweet Potato & Steamed Broccoli'),
          portion: '1 bowl',
          calories: lCalories,
          protein: Math.round(nutritionTargets.proteinGrams * 0.35),
          carbs: Math.round(nutritionTargets.carbsGrams * 0.35),
          fat: Math.round(nutritionTargets.fatGrams * 0.35),
          alternatives: ['Soy chunks pulav with raita', 'Lentil shepherd’s pie with cauliflower mash'],
        },
        eveningSnack: {
          id: `s-${index}`,
          name: isIndian ? 'Roasted Chana & Handful of Almonds with Green Tea' : 'Whey / Plant Protein Shake with a Banana and Walnuts',
          portion: '1 serving',
          calories: sCalories,
          protein: Math.round(nutritionTargets.proteinGrams * 0.15),
          carbs: Math.round(nutritionTargets.carbsGrams * 0.15),
          fat: Math.round(nutritionTargets.fatGrams * 0.15),
          alternatives: ['Cottage cheese with pineapple chunks', 'Sprouted bean salad with lemon'],
        },
        dinner: {
          id: `d-${index}`,
          name: isIndian
            ? (isVeg ? 'Rajma Masala with Multi-grain Roti & Stir-fried French Beans' : 'Pan-seared Salmon or Fish Masala with Jeera Rice & Green Salad')
            : (isVeg ? 'Tofu & Vegetable Stir-Fry with Sesame Edamame' : 'Lean Turkey / Salmon Fillet with Asparagus and Quinoa'),
          portion: '1 plated dinner',
          calories: dCalories,
          protein: Math.round(nutritionTargets.proteinGrams * 0.25),
          carbs: Math.round(nutritionTargets.carbsGrams * 0.25),
          fat: Math.round(nutritionTargets.fatGrams * 0.25),
          alternatives: ['Soya bhurji with baked roti', 'Grilled tempeh with baked pumpkin'],
        },
      },
      totalCalories: nutritionTargets.dailyCalories,
      totalProtein: nutritionTargets.proteinGrams,
      totalCarbs: nutritionTargets.carbsGrams,
      totalFat: nutritionTargets.fatGrams,
    };
  });

  const groceryList = [
    {
      categoryName: 'Proteins & Dairy',
      items: isIndian
        ? [
            { name: isVeg ? 'Low-fat Paneer' : 'Chicken Breast', quantity: '1.2 kg', estimatedCostApprox: '$12.00' },
            { name: 'Greek Yogurt / Thick Curd', quantity: '1 kg', estimatedCostApprox: '$5.50' },
            { name: 'Soy Chunks / Soya Nuggets', quantity: '500g', estimatedCostApprox: '$3.00' },
            { name: isVeg ? 'Firm Tofu' : 'Eggs (Pasture-raised)', quantity: isVeg ? '600g' : '18 eggs', estimatedCostApprox: '$6.50' },
          ]
        : [
            { name: isVeg ? 'Extra Firm Tofu' : 'Skinless Chicken Breast', quantity: '1.5 kg', estimatedCostApprox: '$15.00' },
            { name: 'Greek Yogurt (0% or 2%)', quantity: '1 kg', estimatedCostApprox: '$6.00' },
            { name: 'Whey / Pea Protein Isolate', quantity: '1 container', estimatedCostApprox: '$25.00' },
          ],
    },
    {
      categoryName: 'Complex Carbs & Grains',
      items: [
        { name: 'Brown Basmati Rice / Quinoa', quantity: '1 kg', estimatedCostApprox: '$4.50' },
        { name: 'Rolled Oats', quantity: '750g', estimatedCostApprox: '$3.50' },
        { name: isIndian ? 'Whole Wheat Atta / Multi-grain Flour' : 'Ezekiel / Sourdough Bread', quantity: '1 kg / 1 loaf', estimatedCostApprox: '$4.00' },
        { name: 'Sweet Potatoes', quantity: '1.5 kg', estimatedCostApprox: '$3.50' },
      ],
    },
    {
      categoryName: 'Vegetables & Greens',
      items: [
        { name: 'Fresh Baby Spinach', quantity: '500g', estimatedCostApprox: '$4.00' },
        { name: 'Broccoli & Cauliflower', quantity: '2 heads', estimatedCostApprox: '$5.00' },
        { name: 'Cucumbers, Tomatoes & Bell Peppers', quantity: '1 kg', estimatedCostApprox: '$6.00' },
      ],
    },
    {
      categoryName: 'Healthy Fats & Pantry Staples',
      items: [
        { name: 'Raw Almonds & Walnuts', quantity: '300g', estimatedCostApprox: '$7.00' },
        { name: 'Extra Virgin Olive Oil / Ghee', quantity: '500ml', estimatedCostApprox: '$8.50' },
        { name: 'Chia Seeds / Flaxseeds', quantity: '250g', estimatedCostApprox: '$3.50' },
      ],
    },
  ];

  return {
    id: `diet-${Date.now()}`,
    userId: profile.id,
    createdAt: new Date().toISOString(),
    calorieTarget: nutritionTargets.dailyCalories,
    macros: {
      protein: nutritionTargets.proteinGrams,
      carbs: nutritionTargets.carbsGrams,
      fat: nutritionTargets.fatGrams,
    },
    planType: profile.diet.preference,
    cuisine: profile.diet.preferredCuisine,
    days,
    groceryList,
    estimatedWeeklyBudget: '$65 - $80 / week (approx)',
    hydrationGoalLiters: Number((profile.weight * 0.035).toFixed(1)),
    dietitianNotes: [
      'Maintain adequate electrolyte intake (sodium, potassium, magnesium) especially around workout windows.',
      'Drink 500ml of water 30 minutes before major meals to assist satiety and gastric motility.',
      'Consistent meal timing supports circadian insulin sensitivity.',
    ],
  };
}

/**
 * Deterministic fallback workout plan generator
 */
export function generateFallbackWorkoutPlan(profile: UserProfile): WorkoutPlan {
  const isGym = profile.fitness.gymAccess === 'full_gym';
  const daysPerWeek = profile.fitness.daysPerWeek;

  const days: WorkoutPlan['days'] = [
    {
      dayNumber: 1,
      dayName: 'Day 1: Push (Chest, Shoulders & Triceps)',
      focus: 'Horizontal & Vertical Upper Body Pressing',
      isRestDay: false,
      estimatedDurationMinutes: profile.fitness.preferredDurationMinutes || 50,
      warmupRoutine: [
        '5 mins Dynamic Arm Circles & Band Pull-Aparts',
        'Scapular Push-ups (2 sets of 10)',
        'Rotator Cuff External Rotations',
      ],
      exercises: [
        {
          id: 'ex-1-1',
          name: isGym ? 'Barbell Bench Press' : 'Weighted / Deficit Push-ups',
          targetMuscleGroups: ['Pectoralis Major', 'Anterior Deltoids', 'Triceps Brachii'],
          sets: 4,
          reps: '6-8 reps',
          restSeconds: 120,
          equipment: isGym ? 'Barbell & Flat Bench' : 'Floor & Resistance Bands',
          difficulty: 'Intermediate',
          category: 'Compound',
          instructions: 'Retract scapulae, touch lower sternum, drive through feet and press forcefully to lockout.',
          formCues: ['Keep wrists stacked directly over elbows', 'Maintain slight natural arch in lower back'],
          alternatives: ['Dumbbell Flat Press', 'Floor Press'],
        },
        {
          id: 'ex-1-2',
          name: isGym ? 'Incline Dumbbell Press' : 'Pike Push-ups',
          targetMuscleGroups: ['Clavicular Pectorals', 'Front Delts'],
          sets: 3,
          reps: '8-10 reps',
          restSeconds: 90,
          equipment: isGym ? 'Incline Bench & Dumbbells' : 'Elevated Surface',
          difficulty: 'Intermediate',
          category: 'Compound',
          instructions: 'Set bench to 30 degrees. Lower dumbbells slowly with flared elbows at 45 degrees.',
          formCues: ['Do not bounce at the bottom', 'Control the 3-second eccentric'],
          alternatives: ['Incline Machine Press', 'Feet-Elevated Push-ups'],
        },
        {
          id: 'ex-1-3',
          name: isGym ? 'Cable / Dumbbell Lateral Raises' : 'Resistance Band Lateral Raises',
          targetMuscleGroups: ['Lateral Deltoids'],
          sets: 4,
          reps: '12-15 reps',
          restSeconds: 60,
          equipment: isGym ? 'Dumbbells or Cable Crossover' : 'Loop Bands',
          difficulty: 'Beginner',
          category: 'Isolation',
          instructions: 'Raise arms out to 90 degrees with slight forward lean. Lead with elbows.',
          formCues: ['Avoid swinging torso for momentum', 'Pause for 1 second at top contraction'],
          alternatives: ['Machine Lateral Raise', 'Leaning Cable Lateral'],
        },
        {
          id: 'ex-1-4',
          name: isGym ? 'Overhead Tricep Cable Extension' : 'Tricep Bench Dips',
          targetMuscleGroups: ['Triceps Long Head'],
          sets: 3,
          reps: '10-12 reps',
          restSeconds: 60,
          equipment: isGym ? 'Cable & Rope Attachment' : 'Bench or Chair',
          difficulty: 'Beginner',
          category: 'Isolation',
          instructions: 'Keep upper arms fixed beside ears. Extend through triceps without flaring elbows.',
          formCues: ['Deep stretch at the bottom', 'Lock out elbows fully at peak'],
          alternatives: ['Skull Crushers', 'Diamond Push-ups'],
        },
      ],
      cooldownRoutine: [
        'Doorway Pectoral Stretch (45 seconds/side)',
        'Cross-Body Shoulder Stretch (45 seconds/side)',
        'Diaphragmatic Box Breathing (2 mins)',
      ],
    },
    {
      dayNumber: 2,
      dayName: 'Day 2: Pull (Back, Rear Delts & Biceps)',
      focus: 'Vertical & Horizontal Upper Body Pulling',
      isRestDay: false,
      estimatedDurationMinutes: profile.fitness.preferredDurationMinutes || 50,
      warmupRoutine: [
        'Dead Hang from Pull-up Bar (2 x 30s)',
        'Cat-Cow Mobility Flow (10 reps)',
        'Band Face Pulls (2 x 15)',
      ],
      exercises: [
        {
          id: 'ex-2-1',
          name: isGym ? 'Neutral-Grip Lat Pulldown / Pull-ups' : 'Inverted Row / Doorway Rows',
          targetMuscleGroups: ['Latissimus Dorsi', 'Teres Major', 'Biceps'],
          sets: 4,
          reps: '8-10 reps',
          restSeconds: 90,
          equipment: isGym ? 'Cable Machine or Pull-up Bar' : 'Sturdy Table / Bed Sheet Door Anchor',
          difficulty: 'Intermediate',
          category: 'Compound',
          instructions: 'Depress shoulders before initiating elbow pull. Drive elbows down towards hip pockets.',
          formCues: ['Chest high throughout', 'Do not arch backward excessively'],
          alternatives: ['Wide Grip Pulldown', 'Assisted Chin-ups'],
        },
        {
          id: 'ex-2-2',
          name: isGym ? 'Chest-Supported Dumbbell Row' : 'Resistance Band Bent-Over Rows',
          targetMuscleGroups: ['Rhomboids', 'Mid Traps', 'Rear Delts'],
          sets: 3,
          reps: '10-12 reps',
          restSeconds: 90,
          equipment: isGym ? 'Incline Bench & Dumbbells' : 'Resistance Bands',
          difficulty: 'Intermediate',
          category: 'Compound',
          instructions: 'Lie chest-down on incline bench. Pull elbows back, squeezing shoulder blades together.',
          formCues: ['Zero lower back strain', '2-second peak isometric squeeze'],
          alternatives: ['Seated Cable Row', 'Single-Arm Dumbbell Row'],
        },
        {
          id: 'ex-2-3',
          name: isGym ? 'Incline Dumbbell Bicep Curl' : 'Bicep Band Curls',
          targetMuscleGroups: ['Biceps Brachii'],
          sets: 3,
          reps: '10-12 reps',
          restSeconds: 60,
          equipment: isGym ? 'Dumbbells & Incline Bench' : 'Bands',
          difficulty: 'Beginner',
          category: 'Isolation',
          instructions: 'Sit at 45 degree angle. Start with arms fully extended behind torso, curl with supinated palms.',
          formCues: ['Keep elbows pinned behind torso for maximum long head stretch'],
          alternatives: ['EZ-Bar Preacher Curl', 'Hammer Curls'],
        },
      ],
      cooldownRoutine: [
        'Child’s Pose Lat Stretch (60s)',
        'Bicep Wall Stretch (45s/side)',
      ],
    },
    {
      dayNumber: 3,
      dayName: 'Day 3: Active Recovery & Mobility',
      focus: 'Joint Health, Tissue Hydration & Low-Intensity Cardio',
      isRestDay: true,
      estimatedDurationMinutes: 30,
      warmupRoutine: ['Light walk (10 mins)'],
      exercises: [],
      cooldownRoutine: ['Full-body foam rolling (15 mins)'],
    },
    {
      dayNumber: 4,
      dayName: 'Day 4: Legs & Core (Squat & Hinge)',
      focus: 'Quadriceps, Hamstrings, Glutes & Anti-Extension Core',
      isRestDay: false,
      estimatedDurationMinutes: profile.fitness.preferredDurationMinutes || 55,
      warmupRoutine: [
        'Bodyweight Deep Squats with Pause (15 reps)',
        'Glute Bridges (2 x 15)',
        'World’s Greatest Stretch (5 reps/side)',
      ],
      exercises: [
        {
          id: 'ex-4-1',
          name: isGym ? 'Barbell / Goblet Squat' : 'Tempo Goblet Squat / Bulgarian Split Squat',
          targetMuscleGroups: ['Quadriceps', 'Gluteus Maximus', 'Core'],
          sets: 4,
          reps: '6-8 reps',
          restSeconds: 120,
          equipment: isGym ? 'Squat Rack & Barbell' : 'Dumbbell or Backpack',
          difficulty: 'Intermediate',
          category: 'Compound',
          instructions: 'Hips back and knees tracking in line with toes. Descend to parallel depth, drive through mid-foot.',
          formCues: ['Brace core like taking a punch', 'Chest up, knees pushed outward'],
          alternatives: ['Leg Press', 'Front Squat'],
        },
        {
          id: 'ex-4-2',
          name: isGym ? 'Romanian Deadlift (RDL)' : 'Single-Leg Dumbbell RDL',
          targetMuscleGroups: ['Hamstrings', 'Glutes', 'Erector Spinae'],
          sets: 3,
          reps: '8-10 reps',
          restSeconds: 90,
          equipment: isGym ? 'Barbell or Heavy Dumbbells' : 'Dumbbells or Bands',
          difficulty: 'Intermediate',
          category: 'Compound',
          instructions: 'Soft bend in knees. Hinge hips straight back as if touching wall behind you with tailbone.',
          formCues: ['Feel deep hamstring stretch', 'Keep bar grazing shins'],
          alternatives: ['Lying Leg Curl', 'Good Mornings'],
        },
        {
          id: 'ex-4-3',
          name: 'Hanging Knee Raises / Hollow Body Hold',
          targetMuscleGroups: ['Rectus Abdominis', 'Hip Flexors'],
          sets: 3,
          reps: '12-15 reps / 45s hold',
          restSeconds: 60,
          equipment: isGym ? 'Pull-up Bar' : 'Floor Mat',
          difficulty: 'Beginner',
          category: 'Bodyweight',
          instructions: 'Tuck pelvis under and curl knees toward ribs without swinging.',
          formCues: ['Avoid swinging', 'Exhale hard at peak contraction'],
          alternatives: ['Ab Wheel Rollout', 'Deadbug'],
        },
      ],
      cooldownRoutine: [
        'Pigeon Pose Hip Stretch (60s/side)',
        'Standing Quad Stretch (45s/side)',
      ],
    },
    {
      dayNumber: 5,
      dayName: 'Day 5: Upper Body Hypertrophy & Arms',
      focus: 'Volume Upper Pump & Shoulder Integrity',
      isRestDay: false,
      estimatedDurationMinutes: profile.fitness.preferredDurationMinutes || 45,
      warmupRoutine: ['Light cardio (5m)', 'Band pull-aparts (2x20)'],
      exercises: [
        {
          id: 'ex-5-1',
          name: isGym ? 'Standing Overhead Press (OHP)' : 'Handstand / Pike Push-up Progression',
          targetMuscleGroups: ['Deltoids', 'Triceps', 'Upper Chest'],
          sets: 3,
          reps: '8 reps',
          restSeconds: 90,
          equipment: isGym ? 'Barbell' : 'Bodyweight',
          difficulty: 'Intermediate',
          category: 'Compound',
          instructions: 'Lock glutes and abs. Press bar straight up, tucking head back until bar clears forehead.',
          formCues: ['Squeeze glutes to prevent lumbar hyperextension'],
          alternatives: ['Seated Dumbbell Press', 'Kettlebell Press'],
        },
        {
          id: 'ex-5-2',
          name: isGym ? 'Cable Face Pulls' : 'Band Face Pulls with External Rotation',
          targetMuscleGroups: ['Rear Deltoids', 'Rotator Cuff', 'Rhomboids'],
          sets: 4,
          reps: '15 reps',
          restSeconds: 60,
          equipment: isGym ? 'Cable Machine' : 'Bands',
          difficulty: 'Beginner',
          category: 'Isolation',
          instructions: 'Pull rope toward eyes while pulling hands apart, ending in a double bicep pose.',
          formCues: ['Thumbs pointing backwards at completion'],
          alternatives: ['Reverse Pec Deck', 'Prone Y-T-W'],
        },
      ],
      cooldownRoutine: ['Tricep overhead stretch', 'Chest stretch'],
    },
    {
      dayNumber: 6,
      dayName: 'Day 6: Lower Body & Functional Conditioning',
      focus: 'Unilateral Legs, Calves & Aerobic Capacity',
      isRestDay: daysPerWeek < 5,
      estimatedDurationMinutes: 45,
      warmupRoutine: ['Dynamic lunges', 'Ankle mobility rocks'],
      exercises: [
        {
          id: 'ex-6-1',
          name: 'Walking Lunges with Dumbbells',
          targetMuscleGroups: ['Quadriceps', 'Glutes', 'Adductors'],
          sets: 3,
          reps: '10 reps / leg',
          restSeconds: 75,
          equipment: 'Dumbbells or Bodyweight',
          difficulty: 'Intermediate',
          category: 'Compound',
          instructions: 'Step forward smoothly, descending until trailing knee is 1 inch off floor.',
          formCues: ['Torso upright', 'Drive through lead heel'],
          alternatives: ['Step-ups', 'Reverse Lunges'],
        },
      ],
      cooldownRoutine: ['Hamstring stretch', 'Calf stretch on wall'],
    },
    {
      dayNumber: 7,
      dayName: 'Day 7: Full Rest & CNS Regeneration',
      focus: 'Sleep, Hydration & Weekly Mental Reset',
      isRestDay: true,
      estimatedDurationMinutes: 0,
      warmupRoutine: [],
      exercises: [],
      cooldownRoutine: ['Light 20-minute nature walk', 'Hydration focus: 3L water'],
    },
  ];

  return {
    id: `workout-${Date.now()}`,
    userId: profile.id,
    createdAt: new Date().toISOString(),
    title: `${profile.name}'s ${profile.fitness.level.toUpperCase()} Protocol`,
    splitType: profile.fitness.preferredSplit || 'ppl',
    level: profile.fitness.level,
    daysPerWeek: profile.fitness.daysPerWeek,
    days,
    progressiveOverloadGuidelines: [
      'Double Progression: When you hit the top rep range for all sets, increase resistance by 2.5kg - 5kg next session.',
      'Control the eccentric (lowering) phase for 2 to 3 seconds on all compound lifts.',
      'Keep 1 to 2 reps in reserve (RIR 1-2) on compound movements to manage central nervous system fatigue.',
    ],
    recoveryProtocol: [
      'Prioritize 7.5 to 9 hours of uninterrupted sleep for peak growth hormone release.',
      'Post-workout nutrition: 30g protein + 40-60g carbohydrates within 2 hours.',
      'Active recovery walks promote lymphatic clearance and reduce delayed onset muscle soreness (DOMS).',
    ],
    injurySafeguards: [
      'Warm up with dynamic joint circles and sub-maximal warm-up sets before heavy work.',
      'Discontinue any exercise that elicits sharp or localized joint pain immediately.',
      'Protect lower back posture during hinge and squat variations.',
    ],
  };
}
