// ============================================================
// TDEE & Macro Calculator — Pure Utility Functions
// ============================================================

export const KG_PER_FAT = 7700;
export const LB_TO_KG  = 0.453592;
export const INCH_TO_CM = 2.54;

// ---------- Unit conversion ----------
export const lbsToKg  = (lbs) => lbs * LB_TO_KG;
export const kgToLbs  = (kg)  => kg  / LB_TO_KG;
export const ftInToCm = (ft, inches) => ft * 30.48 + (inches || 0) * INCH_TO_CM;

// ---------- BMR formulas ----------
export const BMR_FORMULAS = [
  { key: 'mifflin', label: 'Mifflin-St Jeor', short: 'MSJ',  description: 'Most accurate for most people' },
  { key: 'harris',  label: 'Harris-Benedict',  short: 'H-B',  description: 'Classic formula, slight overestimate' },
  { key: 'katch',   label: 'Katch-McArdle',    short: 'KMA',  description: 'Best when body fat % is known' },
];

export function calculateBMR(weightKg, heightCm, age, gender, formula = 'mifflin', bodyFatPct = null) {
  switch (formula) {
    case 'harris':
      return gender === 'male'
        ? 88.362 + 13.397 * weightKg + 4.799 * heightCm - 5.677 * age
        : 447.593 + 9.247 * weightKg + 3.098 * heightCm - 4.330 * age;
    case 'katch': {
      const bf = bodyFatPct != null ? bodyFatPct : 20;
      const lean = weightKg * (1 - bf / 100);
      return 370 + 21.6 * lean;
    }
    default: { // mifflin
      const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
      return gender === 'male' ? base + 5 : base - 161;
    }
  }
}

// ---------- Activity ----------
export const ACTIVITY_LEVELS = [
  { key: 'sedentary',   label: 'Sedentary',         description: 'Little or no exercise',          multiplier: 1.2   },
  { key: 'lightly',     label: 'Lightly Active',     description: '1–3 days/week',                  multiplier: 1.375 },
  { key: 'moderately',  label: 'Moderately Active',  description: '3–5 days/week',                  multiplier: 1.55  },
  { key: 'very',        label: 'Very Active',         description: '6–7 days/week',                  multiplier: 1.725 },
  { key: 'extremely',   label: 'Extremely Active',    description: 'Physical job or 2× training',    multiplier: 1.9   },
];

export function calculateTDEE(bmr, activityKey) {
  const level = ACTIVITY_LEVELS.find((l) => l.key === activityKey);
  return bmr * (level ? level.multiplier : 1.2);
}

// ---------- Goals ----------
export const GOALS = [
  { key: 'aggressive_cut',  label: 'Aggressive Cut',  offset: -1000, color: '#ef4444' },
  { key: 'moderate_cut',    label: 'Moderate Cut',    offset: -500,  color: '#f97316' },
  { key: 'slow_cut',        label: 'Slow Cut',        offset: -250,  color: '#eab308' },
  { key: 'maintain',        label: 'Maintain',        offset: 0,     color: '#22c55e' },
  { key: 'lean_bulk',       label: 'Lean Bulk',       offset: 250,   color: '#38bdf8' },
  { key: 'bulk',            label: 'Bulk',            offset: 500,   color: '#818cf8' },
  { key: 'aggressive_bulk', label: 'Aggressive Bulk', offset: 750,   color: '#c084fc' },
];

export const getGoalOffset = (key) => (GOALS.find((g) => g.key === key)?.offset ?? 0);

// ---------- Safety clamp ----------
export function clampCalories(calories, gender) {
  const min = gender === 'male' ? 1200 : 1000;
  return { clamped: Math.max(calories, min), wasClamped: calories < min };
}

// ---------- Macro split presets ----------
// proteinPct: null  → protein comes from weight × multiplier (Standard mode)
// proteinPct: 0.xx  → all three macros are derived from preset percentages
export const MACRO_PRESETS = [
  { key: 'standard',  label: 'Standard',  proteinPct: null, carbsPct: 0.55, fatPct: 0.45, description: 'Protein from multiplier · 55% C · 45% F' },
  { key: 'low_carb',  label: 'Low Carb',  proteinPct: 0.30, carbsPct: 0.20, fatPct: 0.50, description: '30% P · 20% C · 50% F' },
  { key: 'keto',      label: 'Keto',      proteinPct: 0.25, carbsPct: 0.05, fatPct: 0.70, description: '25% P · 5% C · 70% F' },
  { key: 'high_carb', label: 'High Carb', proteinPct: 0.25, carbsPct: 0.60, fatPct: 0.15, description: '25% P · 60% C · 15% F' },
];

export function calculateMacros(targetCalories, weightKg, proteinMultiplier, macroPresetKey = 'standard') {
  const preset = MACRO_PRESETS.find((p) => p.key === macroPresetKey) ?? MACRO_PRESETS[0];

  let protein_g, protein_kcal, carbs_g, fat_g, overLimit = false;

  if (preset.proteinPct === null) {
    // Standard: protein pinned to body-weight multiplier, remaining split by preset ratio
    protein_g    = weightKg * proteinMultiplier;
    protein_kcal = protein_g * 4;
    const remaining = targetCalories - protein_kcal;
    if (remaining <= 0) {
      overLimit = true;
      carbs_g = 0;
      fat_g   = 0;
    } else {
      carbs_g = (remaining * preset.carbsPct) / 4;
      fat_g   = (remaining * preset.fatPct)   / 9;
    }
  } else {
    // Preset mode: all three macros come from the preset percentages
    protein_kcal = targetCalories * preset.proteinPct;
    protein_g    = protein_kcal / 4;
    carbs_g      = (targetCalories * preset.carbsPct) / 4;
    fat_g        = (targetCalories * preset.fatPct)   / 9;
  }

  return {
    protein_g,   protein_kcal,
    carbs_g,     carbs_kcal: carbs_g * 4,
    fat_g,       fat_kcal:   fat_g   * 9,
    overLimit,
    preset,
    // tells UI which mode is active
    proteinMode: preset.proteinPct === null ? 'multiplier' : 'preset',
  };
}

// ---------- Meal presets ----------
export const MEAL_PRESETS = [
  {
    key: '3', label: '3 Meals',
    meals: [
      { name: 'Breakfast', time: '8 AM',  pct: 0.30 },
      { name: 'Lunch',     time: '1 PM',  pct: 0.35 },
      { name: 'Dinner',    time: '7 PM',  pct: 0.35 },
    ],
  },
  {
    key: '4', label: '4 Meals',
    meals: [
      { name: 'Breakfast', time: '8 AM',  pct: 0.25 },
      { name: 'Lunch',     time: '1 PM',  pct: 0.30 },
      { name: 'Snack',     time: '4 PM',  pct: 0.15 },
      { name: 'Dinner',    time: '7 PM',  pct: 0.30 },
    ],
  },
  {
    key: '5', label: '5 Meals',
    meals: [
      { name: 'Breakfast', time: '7 AM',  pct: 0.20 },
      { name: 'Snack 1',   time: '10 AM', pct: 0.10 },
      { name: 'Lunch',     time: '1 PM',  pct: 0.30 },
      { name: 'Snack 2',   time: '4 PM',  pct: 0.10 },
      { name: 'Dinner',    time: '7 PM',  pct: 0.30 },
    ],
  },
  {
    key: 'if', label: 'IF 16:8',
    meals: [
      { name: 'Break Fast', time: '12 PM', pct: 0.40 },
      { name: 'Dinner',     time: '6 PM',  pct: 0.60 },
    ],
  },
];

// ---------- BMI ----------
export function calculateBMI(weightKg, heightCm) {
  const h = heightCm / 100;
  return weightKg / (h * h);
}

export function getBMICategory(bmi) {
  if (bmi < 18.5) return { label: 'Underweight', color: '#38bdf8' };
  if (bmi < 25)   return { label: 'Normal',      color: '#c8f135' };
  if (bmi < 30)   return { label: 'Overweight',  color: '#fb923c' };
  return              { label: 'Obese',        color: '#ef4444' };
}

// ---------- Weekly change ----------
export function estimateWeeklyChange(tdee, targetCalories) {
  const deficit = tdee - targetCalories; // positive = cut → lose weight
  return -(deficit * 7) / KG_PER_FAT;   // negative = losing kg/week
}

// ---------- Days to target ----------
export function daysToTarget(currentWeight, targetWeight, weeklyChangeKg) {
  if (!targetWeight || weeklyChangeKg === 0) return null;
  const delta = targetWeight - currentWeight;
  if ((delta < 0 && weeklyChangeKg >= 0) || (delta > 0 && weeklyChangeKg <= 0)) return null;
  return Math.round((Math.abs(delta) / Math.abs(weeklyChangeKg)) * 7);
}

// ---------- Protein multiplier options ----------
export const PROTEIN_MULTIPLIERS = [
  { value: 0.8, label: '0.8×', descriptor: 'Sedentary'      },
  { value: 1.2, label: '1.2×', descriptor: 'Light activity'  },
  { value: 1.6, label: '1.6×', descriptor: 'Gym standard'    },
  { value: 1.8, label: '1.8×', descriptor: 'Active lifter'   },
  { value: 2.0, label: '2.0×', descriptor: 'Performance'     },
  { value: 2.2, label: '2.2×', descriptor: 'Heavy lifting'   },
  { value: 2.5, label: '2.5×', descriptor: 'High intensity'  },
  { value: 3.0, label: '3.0×', descriptor: 'Comp prep'       },
];

// ---------- Projection milestones ----------
export function generateProjectionMilestones(params) {
  const {
    currentWeightKg, targetWeightKg,
    heightCm, age, gender,
    activityKey, goalKey,
    proteinMultiplier, macroPresetKey = 'standard',
    bmrFormula = 'mifflin', bodyFatPct = null,
  } = params;

  const goalOffset        = getGoalOffset(goalKey);
  const activityMultiplier = ACTIVITY_LEVELS.find((l) => l.key === activityKey)?.multiplier ?? 1.2;
  const step              = 5;
  const direction         = targetWeightKg && targetWeightKg < currentWeightKg ? -1 : 1;

  // Build milestone weight list
  let milestones = [currentWeightKg];

  if (targetWeightKg && targetWeightKg !== currentWeightKg) {
    let w = currentWeightKg;
    while (true) {
      const next = w + direction * step;
      if (direction === -1 && next <= targetWeightKg) { milestones.push(Math.max(next, targetWeightKg)); break; }
      if (direction ===  1 && next >= targetWeightKg) { milestones.push(Math.min(next, targetWeightKg)); break; }
      milestones.push(next);
      w = next;
    }
    if (milestones[milestones.length - 1] !== targetWeightKg) milestones.push(targetWeightKg);
  } else {
    for (let i = 1; i < 5; i++) milestones.push(currentWeightKg - i * step);
  }

  // Reference values from start
  const startBMR    = calculateBMR(currentWeightKg, heightCm, age, gender, bmrFormula, bodyFatPct);
  const startTDEE   = startBMR * activityMultiplier;
  const startTarget = clampCalories(startTDEE + goalOffset, gender).clamped;

  let cumulativeWeeks = 0, lastBadgeWeeks = 0;
  const today = new Date();

  return milestones.map((weightKg, index) => {
    const bmr        = calculateBMR(weightKg, heightCm, age, gender, bmrFormula, bodyFatPct);
    const tdee       = bmr * activityMultiplier;
    const targetCals = clampCalories(tdee + goalOffset, gender).clamped;

    const weeklyChange = estimateWeeklyChange(tdee, targetCals);

    let weeksToReach = 0;
    if (index > 0) {
      const dist = Math.abs(weightKg - milestones[index - 1]);
      const rate = Math.abs(weeklyChange);
      weeksToReach = rate > 0 ? dist / rate : 0;
    }
    cumulativeWeeks += weeksToReach;

    const showBadge = index > 0 && (cumulativeWeeks - lastBadgeWeeks) >= 4;
    if (showBadge) lastBadgeWeeks = cumulativeWeeks;

    // Estimated calendar date
    const estDate = new Date(today);
    estDate.setDate(today.getDate() + Math.round(cumulativeWeeks * 7));
    const dateLabel = index === 0 ? 'Today' : estDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    return {
      weightKg:       Math.round(weightKg * 10) / 10,
      bmr:            Math.round(bmr),
      tdee:           Math.round(tdee),
      targetCals:     Math.round(targetCals),
      deltaFromStart: Math.round(targetCals - startTarget),
      weeklyChangeKg: Math.round(weeklyChange * 100) / 100,
      weeksToReach:   Math.round(weeksToReach * 10) / 10,
      cumulativeWeeks: Math.round(cumulativeWeeks * 10) / 10,
      showBadge,
      isStart: index === 0,
      protein_g: Math.round(weightKg * proteinMultiplier * 10) / 10,
      dateLabel,
    };
  });
}
