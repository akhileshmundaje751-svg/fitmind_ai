/**
 * Unit Tests for FitMind AI Calculation Engine
 * 
 * Verifies US Navy formula, Mifflin-St Jeor BMR, TDEE, BMI,
 * and internal macronutrient energy consistency.
 */

import {
  calculateBMI,
  calculateMifflinStJeorBMR,
  calculateTDEE,
  calculateUSNavyBodyFat,
  calculateNutritionTargets,
  cmToInches,
  kgToLbs,
} from '../src/lib/calculations';

function assert(condition: boolean, testName: string, details?: any) {
  if (!condition) {
    console.error(`❌ FAILED: ${testName}`, details);
    process.exit(1);
  } else {
    console.log(`✅ PASSED: ${testName}`);
  }
}

function runTests() {
  console.log('--- RUNNING FITMIND AI CALCULATION ENGINE TESTS ---\n');

  // 1. BMI Calculation
  // 75 kg, 175 cm => 75 / (1.75 * 1.75) = 24.49 => 24.5 (Normal)
  const bmiNormal = calculateBMI(75, 175);
  assert(bmiNormal.value === 24.5, 'BMI calculation normal value', bmiNormal);
  assert(bmiNormal.category === 'Normal', 'BMI category normal', bmiNormal);

  // 95 kg, 175 cm => 95 / 3.0625 = 31.02 => 31.0 (Obese Class I)
  const bmiObese = calculateBMI(95, 175);
  assert(bmiObese.value === 31.0, 'BMI obese value', bmiObese);
  assert(bmiObese.category === 'Obese Class I', 'BMI category obese I', bmiObese);

  // 2. Mifflin-St Jeor BMR
  // Male: 10 * 80 + 6.25 * 180 - 5 * 30 + 5 = 800 + 1125 - 150 + 5 = 1780 kcal
  const bmrMale = calculateMifflinStJeorBMR('male', 80, 180, 30);
  assert(bmrMale.value === 1780, 'Mifflin-St Jeor Male (80kg, 180cm, 30yo)', bmrMale);

  // Female: 10 * 60 + 6.25 * 165 - 5 * 28 - 161 = 600 + 1031.25 - 140 - 161 = 1330.25 => 1330 kcal
  const bmrFemale = calculateMifflinStJeorBMR('female', 60, 165, 28);
  assert(bmrFemale.value === 1330, 'Mifflin-St Jeor Female (60kg, 165cm, 28yo)', bmrFemale);

  // 3. TDEE with Activity Multipliers
  // Moderately active (1.55) * 1780 = 2759 kcal
  const tdeeModerate = calculateTDEE(1780, 'moderately_active');
  assert(tdeeModerate.value === 2759, 'TDEE calculation moderately active', tdeeModerate);

  // 4. US Navy Circumference Body Fat Method
  // Male: Height 178 cm, Waist 84 cm, Neck 38 cm => 15.7% (Fitness)
  const bfMale = calculateUSNavyBodyFat('male', 178, 84, 38);
  assert(bfMale.isValid === true, 'US Navy Male valid calculation', bfMale);
  assert(bfMale.percentage === 15.7, 'US Navy Male percentage matches exact formula (15.7%)', bfMale);
  assert(bfMale.category === 'Fitness', 'US Navy Male category Fitness', bfMale);
  console.log(`   US Navy Male Result: ${bfMale.percentage}% (${bfMale.category})`);

  // Female: Height 165 cm, Waist 70 cm, Neck 32 cm, Hip 96 cm => 25.4% (Acceptable)
  const bfFemale = calculateUSNavyBodyFat('female', 165, 70, 32, 96);
  assert(bfFemale.isValid === true, 'US Navy Female valid calculation', bfFemale);
  assert(bfFemale.percentage === 25.4, 'US Navy Female percentage matches exact formula (25.4%)', bfFemale);
  assert(bfFemale.category === 'Acceptable', 'US Navy Female category Acceptable', bfFemale);
  console.log(`   US Navy Female Result: ${bfFemale.percentage}% (${bfFemale.category})`);

  // Missing measurements validation
  const bfMissingFemale = calculateUSNavyBodyFat('female', 165, 70, 32); // No hip provided
  assert(bfMissingFemale.isValid === false, 'Detects missing hip for female', bfMissingFemale);
  assert(Boolean(bfMissingFemale.missingMeasurements?.includes('Hip circumference')), 'Reports hip circumference is required');

  // Invalid waist < neck
  const bfInvalidMale = calculateUSNavyBodyFat('male', 178, 30, 38);
  assert(bfInvalidMale.isValid === false, 'Detects waist smaller than neck error', bfInvalidMale);

  // 5. Macronutrient Internal Consistency
  // Test Fat Loss Goal
  const macrosLoss = calculateNutritionTargets(2600, 80, 'male', 'fat_loss', 18);
  const totalMacroCals = (macrosLoss.proteinGrams * 4) + (macrosLoss.carbsGrams * 4) + (macrosLoss.fatGrams * 9);
  assert(
    Math.abs(totalMacroCals - macrosLoss.dailyCalories) <= 4,
    'Macronutrient energy sum matches daily calorie target (within rounding delta)',
    { totalMacroCals, dailyCalories: macrosLoss.dailyCalories }
  );
  assert(macrosLoss.dailyCalories < 2600, 'Fat loss target is below TDEE', macrosLoss);
  console.log(`   Fat Loss Daily Calories: ${macrosLoss.dailyCalories} kcal (P: ${macrosLoss.proteinGrams}g, C: ${macrosLoss.carbsGrams}g, F: ${macrosLoss.fatGrams}g)`);

  // Test Muscle Gain Goal
  const macrosGain = calculateNutritionTargets(2200, 70, 'male', 'lean_muscle_gain', 14);
  assert(macrosGain.dailyCalories > 2200, 'Muscle gain target is above TDEE', macrosGain);

  // 6. Unit Conversion tests
  assert(Math.round(cmToInches(2.54) * 100) / 100 === 1, 'cmToInches conversion');
  assert(Math.round(kgToLbs(1) * 100) / 100 === 2.2, 'kgToLbs conversion');

  console.log('\n🌟 ALL 12 CALCULATION TESTS PASSED PERFECTLY!\n');
}

runTests();
