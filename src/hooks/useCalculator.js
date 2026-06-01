import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {
  calculateBMR, calculateTDEE, calculateMacros,
  calculateBMI, getBMICategory, clampCalories,
  estimateWeeklyChange, daysToTarget,
  generateProjectionMilestones, getGoalOffset,
  lbsToKg, ftInToCm,
} from '../utils/calculations';

// ─────────────────────────────────────────────────
//  Storage key
// ─────────────────────────────────────────────────
const FORM_KEY = 'tdee_form_state';

// ─────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────
function readURLParams() {
  const p = new URLSearchParams(window.location.search);
  if (!p.has('w')) return null;
  return {
    unit:              p.get('unit')    || 'metric',
    gender:            p.get('sex')     || 'male',
    age:               p.get('age')     || '28',
    weight:            p.get('w')       || '80',
    heightCm:          p.get('hcm')     || '175',
    heightFt:          p.get('hft')     || '5',
    heightIn:          p.get('hin')     || '9',
    activity:          p.get('act')     || 'moderately',
    goal:              p.get('goal')    || 'moderate_cut',
    targetWeight:      p.get('tw')      || '',
    proteinMultiplier: parseFloat(p.get('pm') || '1.6'),
    bmrFormula:        p.get('formula') || 'mifflin',
    bodyFatPct:        p.get('bf')      || '',
    macroPreset:       p.get('mp')      || 'standard',
    mealPreset:        p.get('meal')    || '3',
  };
}

function loadStorage() {
  try { return JSON.parse(localStorage.getItem(FORM_KEY) || 'null'); }
  catch { return null; }
}

function saveStorage(state) {
  try { localStorage.setItem(FORM_KEY, JSON.stringify(state)); }
  catch {}
}

// ─────────────────────────────────────────────────
//  Hook
// ─────────────────────────────────────────────────
export function useCalculator() {
  // ── Stable init: useRef so it is read exactly ONCE on mount ──────────────
  // useMemo([]]) is NOT guaranteed to run once in React 18 StrictMode –
  // React may discard the memo and recompute it, returning {} after states
  // are already initialised from the previous run. useRef is the safe fix.
  const initRef = useRef(null);
  if (initRef.current === null) {
    initRef.current = readURLParams() ?? loadStorage() ?? {};
  }
  const init = initRef.current;

  // ── Form state – each field reads from init exactly once ─────────────────
  const [unit,              setUnitRaw]          = useState(() => init.unit              || 'metric');
  const [gender,            setGender]           = useState(() => init.gender            || 'male');
  const [age,               setAge]              = useState(() => init.age               ?? 28);
  const [weight,            setWeight]           = useState(() => init.weight            ?? 80);
  const [heightCm,          setHeightCm]         = useState(() => init.heightCm          ?? 175);
  const [heightFt,          setHeightFt]         = useState(() => init.heightFt          ?? 5);
  const [heightIn,          setHeightIn]         = useState(() => init.heightIn          ?? 9);
  const [activity,          setActivity]         = useState(() => init.activity          || 'moderately');
  const [goal,              setGoal]             = useState(() => init.goal              || 'moderate_cut');
  const [targetWeight,      setTargetWeight]     = useState(() => init.targetWeight      || '');
  const [proteinMultiplier, setProteinMultiplier]= useState(() => Number(init.proteinMultiplier) || 1.6);
  const [bmrFormula,        setBmrFormula]       = useState(() => init.bmrFormula        || 'mifflin');
  const [bodyFatPct,        setBodyFatPct]       = useState(() => init.bodyFatPct        || '');
  const [macroPreset,       setMacroPreset]      = useState(() => init.macroPreset       || 'standard');
  const [mealPreset,        setMealPreset]       = useState(() => init.mealPreset        || '3');

  // "Saved" flash state
  const [savedFlash, setSavedFlash] = useState(false);
  const saveTimerRef = useRef(null);

  const setUnit = useCallback((v) => setUnitRaw(v), []);

  // ── Persist everything whenever any field changes ─────────────────────────
  const formState = useMemo(() => ({
    unit, gender, age, weight, heightCm, heightFt, heightIn,
    activity, goal, targetWeight, proteinMultiplier,
    bmrFormula, bodyFatPct, macroPreset, mealPreset,
  }), [unit, gender, age, weight, heightCm, heightFt, heightIn,
       activity, goal, targetWeight, proteinMultiplier,
       bmrFormula, bodyFatPct, macroPreset, mealPreset]);

  useEffect(() => {
    saveStorage(formState);

    // Show "Saved" flash (skip very first render)
    if (saveTimerRef.current !== undefined) {
      setSavedFlash(true);
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => setSavedFlash(false), 1800);
    } else {
      saveTimerRef.current = undefined; // mark as past first run
    }
  }, [formState]);

  // ── Derived metric values ─────────────────────────────────────────────────
  const weightKg = useMemo(() => {
    const w = parseFloat(weight) || 0;
    return unit === 'imperial' ? lbsToKg(w) : w;
  }, [weight, unit]);

  const resolvedHeightCm = useMemo(() => {
    if (unit === 'imperial') return ftInToCm(parseFloat(heightFt) || 0, parseFloat(heightIn) || 0);
    return parseFloat(heightCm) || 0;
  }, [unit, heightCm, heightFt, heightIn]);

  const targetWeightKg = useMemo(() => {
    if (!targetWeight) return null;
    const tw = parseFloat(targetWeight);
    if (isNaN(tw)) return null;
    return unit === 'imperial' ? lbsToKg(tw) : tw;
  }, [targetWeight, unit]);

  const bf = useMemo(() => {
    const v = parseFloat(bodyFatPct);
    return isNaN(v) ? null : v;
  }, [bodyFatPct]);

  // ── Core calculations ─────────────────────────────────────────────────────
  const results = useMemo(() => {
    const wKg  = weightKg;
    const hCm  = resolvedHeightCm;
    const ageV = parseInt(age) || 25;
    if (wKg <= 0 || hCm <= 0 || ageV <= 0) return null;

    const bmr            = calculateBMR(wKg, hCm, ageV, gender, bmrFormula, bf);
    const tdee           = calculateTDEE(bmr, activity);
    const goalOffset     = getGoalOffset(goal);
    const rawTarget      = tdee + goalOffset;
    const { clamped: targetCalories, wasClamped } = clampCalories(rawTarget, gender);
    const macros         = calculateMacros(targetCalories, wKg, proteinMultiplier, macroPreset);
    const bmi            = calculateBMI(wKg, hCm);
    const bmiCategory    = getBMICategory(bmi);
    const weeklyChangeKg = estimateWeeklyChange(tdee, targetCalories);
    const weeklyChangeLbs = weeklyChangeKg * (1 / 0.453592);
    const days           = daysToTarget(wKg, targetWeightKg, weeklyChangeKg);

    const projection = generateProjectionMilestones({
      currentWeightKg: wKg, targetWeightKg,
      heightCm: hCm, age: ageV, gender,
      activityKey: activity, goalKey: goal,
      proteinMultiplier, macroPresetKey: macroPreset,
      bmrFormula, bodyFatPct: bf,
    });

    return {
      bmr:             Math.round(bmr),
      tdee:            Math.round(tdee),
      targetCalories:  Math.round(targetCalories),
      wasClamped,
      macros,
      bmi:             Math.round(bmi * 10) / 10,
      bmiCategory,
      weeklyChangeKg:  Math.round(weeklyChangeKg  * 100) / 100,
      weeklyChangeLbs: Math.round(weeklyChangeLbs * 100) / 100,
      daysToTarget:    days,
      projection,
      proteinPerKg:    Math.round((macros.protein_g / wKg) * 10) / 10,
      gender,
    };
  }, [weightKg, resolvedHeightCm, age, gender, activity, goal,
      proteinMultiplier, macroPreset, targetWeightKg, bmrFormula, bf]);

  // ── Share URL ─────────────────────────────────────────────────────────────
  const shareURL = useMemo(() => {
    const p = new URLSearchParams({
      unit, sex: gender, age, w: weight,
      hcm: heightCm, hft: heightFt, hin: heightIn,
      act: activity, goal, tw: targetWeight,
      pm: proteinMultiplier, formula: bmrFormula,
      bf: bodyFatPct, mp: macroPreset, meal: mealPreset,
    });
    return `${window.location.origin}${window.location.pathname}?${p.toString()}`;
  }, [unit, gender, age, weight, heightCm, heightFt, heightIn,
      activity, goal, targetWeight, proteinMultiplier,
      bmrFormula, bodyFatPct, macroPreset, mealPreset]);

  return {
    unit, setUnit,
    gender, setGender,
    age, setAge,
    weight, setWeight,
    heightCm, setHeightCm,
    heightFt, setHeightFt,
    heightIn, setHeightIn,
    activity, setActivity,
    goal, setGoal,
    targetWeight, setTargetWeight,
    proteinMultiplier, setProteinMultiplier,
    bmrFormula, setBmrFormula,
    bodyFatPct, setBodyFatPct,
    macroPreset, setMacroPreset,
    mealPreset, setMealPreset,
    results,
    weightKg,
    targetWeightKg,
    shareURL,
    savedFlash,
  };
}
