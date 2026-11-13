/**
 * FitMind AI - Deterministic Fitness & Body Composition Calculation Engine
 * 
 * Implements clinically recognized fitness equations:
 * 1. US Navy Circumference Method for Body Fat %
 * 2. Mifflin-St Jeor Equation for Basal Metabolic Rate (BMR)
 * 3. Total Daily Energy Expenditure (TDEE) with activity multipliers
 * 4. World Health Organization standard Body Mass Index (BMI)
 * 5. Goal-specific macronutrient partitioning with energy balance checks
 */

import {
  ActivityLevel,
  BiologicalSex,
  CalculationResults,
  FitnessGoal,
  UserProfile,
} from '../types';

export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  very_active: 1.725,
  extremely_active: 1.9,
};

// Unit conversions
export const CM_TO_INCHES = 0.393701;
export const INCHES_TO_CM = 2.54;
export const KG_TO_LBS = 2.20462;
export const LBS_TO_KG = 0.453592;

export function cmToInches(cm: number): number {
  return cm * CM_TO_INCHES;
}

export function inchesToCm(inches: number): number {
  return inches * INCHES_TO_CM;
}

export function kgToLbs(kg: number): number {
  return kg * KG_TO_LBS;
}

export function lbsToKg(lbs: number): number {
  return lbs * LBS_TO_KG;
}

/**
 * Calculate BMI and classify according to WHO criteria
 */
export function calculateBMI(weightKg: number, heightCm: number): CalculationResults['bmi'] {
  if (weightKg <= 0 || heightCm <= 0) {
    throw new Error('Weight and height must be positive values.');
  }

  const heightMeters = heightCm / 100;
  const bmiValue = Number((weightKg / (heightMeters * heightMeters)).toFixed(1));

  let category: CalculationResults['bmi']['category'];
  if (bmiValue < 18.5) {
    category = 'Underweight';
  } else if (bmiValue < 25.0) {
    category = 'Normal';
  } else if (bmiValue < 30.0) {
    category = 'Overweight';
  } else if (bmiValue < 35.0) {
    category = 'Obese Class I';
  } else if (bmiValue < 40.0) {
    category = 'Obese Class II';
  } else {
    category = 'Obese Class III';
  }

  // WHO Healthy range is 18.5 to 24.9
  const minHealthyWeight = Number((18.5 * heightMeters * heightMeters).toFixed(1));
  const maxHealthyWeight = Number((24.9 * heightMeters * heightMeters).toFixed(1));

  return {
    value: bmiValue,
    category,
    healthyWeightRangeKg: [minHealthyWeight, maxHealthyWeight],
  };
}

/**
 * Calculate Body Fat % using the US Navy Method.
 * 
 * Requires:
 * Males: Waist, Neck, Height (in inches)
 * Females: Waist, Hip, Neck, Height (in inches)
 */
export function calculateUSNavyBodyFat(
  sex: BiologicalSex,
  heightCm: number,
  waistCm: number,
  neckCm: number,
  hipCm?: number
): CalculationResults['bodyFatNavy'] {
  const missing: string[] = [];
  if (!waistCm || waistCm <= 0) missing.push('Waist circumference');
  if (!neckCm || neckCm <= 0) missing.push('Neck circumference');
  if (!heightCm || heightCm <= 0) missing.push('Height');
  if (sex === 'female' && (!hipCm || hipCm <= 0)) {
    missing.push('Hip circumference');
  }

  if (missing.length > 0) {
    return {
      percentage: 0,
      category: 'Acceptable',
      method: 'US Navy Circumference Method',
      isValid: false,
      missingMeasurements: missing,
    };
  }

  // The standard Hodgdon & Beckett metric US Navy equation uses cm directly:
  // Male: 495 / (1.0324 - 0.19077 * log10(waist - neck) + 0.15456 * log10(height)) - 450
  // Female: 495 / (1.29579 - 0.35004 * log10(waist + hip - neck) + 0.22100 * log10(height)) - 450
  const hCm = heightCm;
  const wCm = waistCm;
  const nCm = neckCm;
  const hipCmVal = hipCm || 0;

  let bodyFatPct = 0;

  if (sex === 'male') {
    const diff = wCm - nCm;
    if (diff <= 0) {
      return {
        percentage: 0,
        category: 'Acceptable',
        method: 'US Navy Circumference Method',
        isValid: false,
        missingMeasurements: ['Waist circumference must be larger than neck circumference'],
      };
    }
    const denom = 1.0324 - 0.19077 * Math.log10(diff) + 0.15456 * Math.log10(hCm);
    if (denom <= 0) {
      return {
        percentage: 0,
        category: 'Acceptable',
        method: 'US Navy Circumference Method',
        isValid: false,
        missingMeasurements: ['Measurements yield an out-of-bounds mathematical result'],
      };
    }
    bodyFatPct = 495 / denom - 450;
  } else {
    const sumDiff = wCm + hipCmVal - nCm;
    if (sumDiff <= 0) {
      return {
        percentage: 0,
        category: 'Acceptable',
        method: 'US Navy Circumference Method',
        isValid: false,
        missingMeasurements: ['Waist + Hip must be greater than neck circumference'],
      };
    }
    const denom = 1.29579 - 0.35004 * Math.log10(sumDiff) + 0.22100 * Math.log10(hCm);
    if (denom <= 0) {
      return {
        percentage: 0,
        category: 'Acceptable',
        method: 'US Navy Circumference Method',
        isValid: false,
        missingMeasurements: ['Measurements yield an out-of-bounds mathematical result'],
      };
    }
    bodyFatPct = 495 / denom - 450;
  }

  // Realistic boundary clamping with rounding
  bodyFatPct = Math.max(3.0, Math.min(65.0, Number(bodyFatPct.toFixed(1))));

  // American Council on Exercise (ACE) body fat categories
  let category: CalculationResults['bodyFatNavy']['category'] = 'Acceptable';
  if (sex === 'male') {
    if (bodyFatPct < 6) category = 'Essential Fat';
    else if (bodyFatPct <= 13.9) category = 'Athletes';
    else if (bodyFatPct <= 17.9) category = 'Fitness';
    else if (bodyFatPct <= 24.9) category = 'Acceptable';
    else category = 'High';
  } else {
    if (bodyFatPct < 14) category = 'Essential Fat';
    else if (bodyFatPct <= 20.9) category = 'Athletes';
    else if (bodyFatPct <= 24.9) category = 'Fitness';
    else if (bodyFatPct <= 31.9) category = 'Acceptable';
    else category = 'High';
  }

  return {
    percentage: bodyFatPct,
    category,
    method: 'US Navy Circumference Method',
    isValid: true,
  };
}

/**
 * Mifflin-St Jeor Basal Metabolic Rate (BMR)
 * Male: 10 * weight(kg) + 6.25 * height(cm) - 5 * age(y) + 5
 * Female: 10 * weight(kg) + 6.25 * height(cm) - 5 * age(y) - 161
 */
export function calculateMifflinStJeorBMR(
  sex: BiologicalSex,
  weightKg: number,
  heightCm: number,
  ageYears: number
): CalculationResults['bmr'] {
  if (weightKg <= 0 || heightCm <= 0 || ageYears <= 0) {
    throw new Error('Weight, height, and age must be positive.');
  }

  let bmr = 10 * weightKg + 6.25 * heightCm - 5 * ageYears;
  if (sex === 'male') {
    bmr += 5;
  } else {
    bmr -= 161;
  }

  return {
    value: Math.round(bmr),
    equation: 'Mifflin-St Jeor',
  };
}

/**
 * Total Daily Energy Expenditure (TDEE)
 */
export function calculateTDEE(
  bmr: number,
  activityLevel: ActivityLevel
): CalculationResults['tdee'] {
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel] || 1.2;
  const tdeeValue = Math.round(bmr * multiplier);

  return {
    value: tdeeValue,
    multiplier,
    activityLevel,
  };
}

/**
 * Calculate Calorie Target and Internally Consistent Macronutrients
 */
export function calculateNutritionTargets(
  tdee: number,
  weightKg: number,
  sex: BiologicalSex,
  goal: FitnessGoal,
  bodyFatPct: number
): CalculationResults['nutritionTargets'] {
  let deltaPct = 0;
  let strategy = 'Maintenance: Preserving current metabolic equilibrium';

  switch (goal) {
    case 'fat_loss':
      deltaPct = -0.18; // Safe 18% deficit
      strategy = 'Conservative 18% Caloric Deficit for sustainable fat loss';
      break;
    case 'lean_muscle_gain':
      deltaPct = 0.10; // Controlled 10% surplus
      strategy = 'Modest 10% Caloric Surplus for lean muscle hypertrophy';
      break;
    case 'body_recomposition':
      deltaPct = -0.05; // Slight 5% deficit for recomp
      strategy = 'Slight 5% deficit with high protein for concurrent fat loss and muscle retention';
      break;
    case 'strength_development':
      deltaPct = 0.05;
      strategy = 'Slight 5% surplus supporting neural recovery and muscular power';
      break;
    case 'endurance_improvement':
      deltaPct = 0.05;
      strategy = 'High glycogen replenishing carbohydrate profile at maintenance/slight surplus';
      break;
    case 'general_fitness':
    default:
      deltaPct = 0.0;
      strategy = 'Caloric balance supporting active health and vitality';
      break;
  }

  let targetCalories = Math.round(tdee * (1 + deltaPct));

  // Medical/safety floors: never allow calorie targets to plunge beneath safe basal levels
  const minimumCalorieFloor = sex === 'male' ? 1500 : 1200;
  if (targetCalories < minimumCalorieFloor) {
    targetCalories = minimumCalorieFloor;
  }

  // Protein calculation:
  // 1.8g to 2.2g per kg of bodyweight, or lean mass if body fat is higher
  let proteinPerKg = 1.8;
  if (goal === 'fat_loss' || goal === 'body_recomposition') {
    proteinPerKg = 2.1; // Higher protein preserves lean mass in deficit
  } else if (goal === 'lean_muscle_gain' || goal === 'strength_development') {
    proteinPerKg = 2.0;
  } else {
    proteinPerKg = 1.6;
  }

  // If body fat is very high (> 28% for men, > 35% for women), scale protein slightly towards lean body mass to avoid excessive amounts
  let proteinGrams = Math.round(weightKg * proteinPerKg);
  if (bodyFatPct > 0) {
    const leanMass = weightKg * (1 - bodyFatPct / 100);
    const proteinByLean = Math.round(leanMass * 2.3);
    proteinGrams = Math.min(proteinGrams, Math.max(120, proteinByLean));
  }

  // Dietary Fat:
  // Set to 25% of target calories (crucial for endocrine balance, vitamin absorption)
  const fatCalories = Math.round(targetCalories * 0.25);
  const fatGrams = Math.round(fatCalories / 9);

  // Carbohydrates:
  // Remainder of calories to guarantee strict internal consistency:
  // Calories = (Protein * 4) + (Carbs * 4) + (Fat * 9)
  const proteinCalories = proteinGrams * 4;
  const remainingCaloriesForCarbs = Math.max(0, targetCalories - (proteinCalories + (fatGrams * 9)));
  const carbsGrams = Math.round(remainingCaloriesForCarbs / 4);
  const carbsCalories = carbsGrams * 4;

  // Exact reconciled daily calories
  const finalDailyCalories = proteinCalories + carbsCalories + (fatGrams * 9);

  const proteinPct = Math.round((proteinCalories / finalDailyCalories) * 100);
  const fatPct = Math.round(((fatGrams * 9) / finalDailyCalories) * 100);
  const carbsPct = 100 - (proteinPct + fatPct);

  return {
    dailyCalories: finalDailyCalories,
    deficitOrSurplusPercentage: Math.round(deltaPct * 100),
    strategyDescription: strategy,
    proteinGrams,
    carbsGrams,
    fatGrams,
    proteinCalories,
    carbsCalories,
    fatCalories: fatGrams * 9,
    macroRatios: {
      proteinPct,
      carbsPct,
      fatPct,
    },
  };
}

/**
 * Complete body composition and nutritional profile engine
 */
export function calculateFullBodyProfile(profile: UserProfile): CalculationResults {
  const bmi = calculateBMI(profile.weight, profile.height);
  const bodyFatNavy = calculateUSNavyBodyFat(
    profile.sex,
    profile.height,
    profile.measurements.waist,
    profile.measurements.neck,
    profile.measurements.hip
  );

  const bmr = calculateMifflinStJeorBMR(
    profile.sex,
    profile.weight,
    profile.height,
    profile.age
  );

  const tdee = calculateTDEE(bmr.value, profile.lifestyle.activityLevel);

  // Estimate Fat Mass and Lean Body Mass
  const bfPctForCalc = bodyFatNavy.isValid ? bodyFatNavy.percentage : 20.0;
  const fatMassKg = Number(((profile.weight * bfPctForCalc) / 100).toFixed(1));
  const leanMassKg = Number((profile.weight - fatMassKg).toFixed(1));

  const nutritionTargets = calculateNutritionTargets(
    tdee.value,
    profile.weight,
    profile.sex,
    profile.goals.primaryGoal,
    bodyFatNavy.isValid ? bodyFatNavy.percentage : 0
  );

  const disclaimers = [
    'Body composition estimates are calculated using the circumference-based US Navy regression method and Mifflin-St Jeor equation. These are statistical models, not laboratory DEXA or hydrostatic scans.',
    'Nutritional targets are data-driven estimates. Individual metabolic rates, gut absorption, and NEAT vary.',
    'Always consult a physician or licensed dietitian before initiating intensive caloric restriction or novel workout protocols, particularly if you have underlying conditions.',
  ];

  if (profile.age < 18) {
    disclaimers.push('Safeguard note: Adolescents require tailored adolescent growth nutrition. Restrictive deficits are strictly discouraged.');
  }

  return {
    bmi,
    bodyFatNavy,
    bmr,
    tdee,
    bodyComposition: {
      fatMassKg,
      leanMassKg,
      fatMassLbs: Number(kgToLbs(fatMassKg).toFixed(1)),
      leanMassLbs: Number(kgToLbs(leanMassKg).toFixed(1)),
    },
    nutritionTargets,
    disclaimers,
  };
}
