import { useState, useRef } from 'react';
import { Download, Upload, FileJson, Check, AlertCircle, RefreshCw } from 'lucide-react';
import {
  GOALS, ACTIVITY_LEVELS, BMR_FORMULAS, MACRO_PRESETS,
} from '../utils/calculations';

const FORM_KEY = 'tdee_form_state';
const LOG_KEY  = 'tdee_weight_log';
const APP_TAG  = 'TDEE & Macro Calculator';

// ─── Build the full AI-ready export payload ────────────────────────────────────
function buildExportPayload(results, formState) {
  const raw  = JSON.parse(localStorage.getItem(FORM_KEY) || 'null') ?? formState ?? {};
  const logs = JSON.parse(localStorage.getItem(LOG_KEY)  || '[]')   ?? [];

  // Human-readable label helpers
  const goalLabel     = GOALS.find(g => g.key === raw.goal)?.label             ?? raw.goal     ?? '—';
  const actLabel      = ACTIVITY_LEVELS.find(a => a.key === raw.activity)?.label ?? raw.activity ?? '—';
  const formulaLabel  = BMR_FORMULAS.find(f => f.key === raw.bmrFormula)?.label  ?? raw.bmrFormula ?? 'Mifflin-St Jeor';
  const presetLabel   = MACRO_PRESETS.find(p => p.key === raw.macroPreset)?.label ?? raw.macroPreset ?? 'Standard';

  // ── Calculated block (only if results are available) ────────────────────────
  let calculated = null;
  let aiContext  = null;

  if (results) {
    const {
      bmr, tdee, targetCalories,
      macros, bmi, bmiCategory,
      weeklyChangeKg, weeklyChangeLbs,
      daysToTarget, proteinPerKg,
    } = results;

    const deficit  = tdee - targetCalories;   // positive = deficit, negative = surplus
    const isDeficit = deficit >= 0;
    const unitLabel = raw.unit === 'imperial' ? 'lbs' : 'kg';
    const weightVal = raw.weight ?? '—';
    const wkChange  = raw.unit === 'imperial'
      ? `${weeklyChangeLbs > 0 ? '+' : ''}${weeklyChangeLbs} lbs/week`
      : `${weeklyChangeKg  > 0 ? '+' : ''}${weeklyChangeKg}  kg/week`;

    calculated = {
      energyBalance: {
        BMR_kcal:          bmr,
        TDEE_kcal:         tdee,
        targetCalories_kcal: targetCalories,
        [isDeficit ? 'deficit_kcal' : 'surplus_kcal']: Math.abs(deficit),
        weeklyWeightChange: wkChange,
        estimatedDaysToGoal: daysToTarget ?? null,
        estimatedWeeksToGoal: daysToTarget ? Math.round(daysToTarget / 7) : null,
      },
      macros: {
        protein: {
          grams:      +macros.protein_g.toFixed(1),
          kcal:       Math.round(macros.protein_kcal),
          percentage: `${Math.round((macros.protein_kcal / targetCalories) * 100)}%`,
        },
        carbs: {
          grams:      +macros.carbs_g.toFixed(1),
          kcal:       Math.round(macros.carbs_kcal),
          percentage: `${Math.round((macros.carbs_kcal / targetCalories) * 100)}%`,
        },
        fat: {
          grams:      +macros.fat_g.toFixed(1),
          kcal:       Math.round(macros.fat_kcal),
          percentage: `${Math.round((macros.fat_kcal / targetCalories) * 100)}%`,
        },
        splitPreset: presetLabel,
      },
      bodyMetrics: {
        BMI:         bmi,
        BMICategory: bmiCategory.label,
        proteinPerKg_g: proteinPerKg,
      },
      settings: {
        goal:          goalLabel,
        activityLevel: actLabel,
        bmrFormula:    formulaLabel,
        dietType:      presetLabel,
        unit:          raw.unit ?? 'metric',
      },
    };

    // ── Pre-written AI context paragraph ──────────────────────────────────────
    const ageStr    = raw.age     ? `${raw.age}-year-old` : '';
    const genderStr = raw.gender  ?? '';
    const wtStr     = `${weightVal} ${unitLabel}`;
    const htStr     = raw.unit === 'metric'
      ? `${raw.heightCm} cm`
      : `${raw.heightFt}ft ${raw.heightIn}in`;
    const twStr     = raw.targetWeight
      ? ` My target weight is ${raw.targetWeight} ${unitLabel}.` : '';
    const etaStr    = daysToTarget
      ? ` At this rate I should reach my goal in approximately ${daysToTarget} days (~${Math.round(daysToTarget / 7)} weeks).`
      : '';
    const bfStr     = raw.bodyFatPct ? ` Body fat: ${raw.bodyFatPct}%.` : '';

    aiContext = [
      `I am a ${ageStr} ${genderStr} weighing ${wtStr}, height ${htStr}.${bfStr}`,
      `My BMR (${formulaLabel}) is ${bmr} kcal/day and my TDEE (${actLabel}) is ${tdee} kcal/day.`,
      `My goal is ${goalLabel}. I am eating ${targetCalories} kcal/day,`,
      isDeficit
        ? `which is a ${Math.abs(deficit)} kcal deficit — expected weight change: ${wkChange}.`
        : `which is a ${Math.abs(deficit)} kcal surplus — expected weight change: ${wkChange}.`,
      `${twStr}${etaStr}`,
      ``,
      `Daily macros (${presetLabel} split):`,
      `  • Protein: ${macros.protein_g.toFixed(1)} g  (${Math.round(macros.protein_kcal)} kcal, ${calculated.macros.protein.percentage})`,
      `  • Carbs:   ${macros.carbs_g.toFixed(1)} g  (${Math.round(macros.carbs_kcal)} kcal, ${calculated.macros.carbs.percentage})`,
      `  • Fat:     ${macros.fat_g.toFixed(1)} g  (${Math.round(macros.fat_kcal)} kcal, ${calculated.macros.fat.percentage})`,
      ``,
      `BMI: ${bmi} (${bmiCategory.label}). Protein per kg bodyweight: ${proteinPerKg} g/kg.`,
      ``,
      `Please use this data to provide personalised nutrition and fitness guidance.`,
    ].join('\n');
  }

  return {
    version:       1,
    app:           APP_TAG,
    exportedAt:    new Date().toISOString(),
    aiContext,          // paste this straight into any AI chatbot
    formState:     raw,
    calculated,        // all computed numbers
    weightLog:     logs,
  };
}

// ─── Import validation ─────────────────────────────────────────────────────────
function validate(data) {
  if (typeof data !== 'object' || data === null) throw new Error('Not a JSON object');
  if (data.version !== 1)    throw new Error('Unknown file version');
  if (data.app !== APP_TAG)  throw new Error('File is not from this app');
  if (typeof data.formState !== 'object') throw new Error('Missing formState');
  return true;
}

// ─── Download helper ───────────────────────────────────────────────────────────
function triggerDownload(payload) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement('a'), {
    href:     url,
    download: `tdee-backup-${new Date().toISOString().split('T')[0]}.json`,
  });
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Component ─────────────────────────────────────────────────────────────────
export default function DataPortability({ results, formState }) {
  const fileRef              = useRef(null);
  const [status, setStatus]  = useState(null);
  const [msg,    setMsg]     = useState('');
  const [loading, setLoading]= useState(false);

  function flash(type, message, ms = 3500) {
    setStatus(type); setMsg(message);
    if (type !== 'success') setTimeout(() => setStatus(null), ms);
  }

  // ── Export ───────────────────────────────────────────────────────────────────
  function handleExport() {
    try {
      triggerDownload(buildExportPayload(results, formState));
      flash('success-export', 'Download started!');
      setTimeout(() => setStatus(null), 2000);
    } catch {
      flash('error', 'Export failed — check browser permissions.');
    }
  }

  // ── Import ───────────────────────────────────────────────────────────────────
  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        validate(data);

        localStorage.setItem(FORM_KEY, JSON.stringify(data.formState));
        if (Array.isArray(data.weightLog)) {
          localStorage.setItem(LOG_KEY, JSON.stringify(data.weightLog));
        }

        flash('success', `Restored ${data.weightLog?.length ?? 0} weight log entries. Reloading…`);
        setTimeout(() => window.location.reload(), 1400);
      } catch (err) {
        setLoading(false);
        flash('error', `Invalid file: ${err.message}`);
      }
    };
    reader.onerror = () => { setLoading(false); flash('error', 'Could not read file.'); };
    reader.readAsText(file);
    e.target.value = '';
  }

  const isError = status === 'error';

  return (
    <div>
      {/* Label */}
      <span className="field-label flex items-center gap-1.5 mb-3">
        <FileJson size={12} />
        Data Backup &amp; Restore
      </span>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={handleExport}
          title="Download all your data + calculated results as JSON — paste the aiContext into any AI for guidance"
          style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
            padding: '10px 0',
            background: 'var(--card)', border: '1px solid var(--border)',
            borderRadius: 10, color: 'var(--text)',
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
            transition: 'border-color 0.18s, color 0.18s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)';  e.currentTarget.style.color = 'var(--text)'; }}
        >
          <Download size={14} />
          Export JSON
        </button>

        <button
          onClick={() => fileRef.current?.click()}
          disabled={loading}
          style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
            padding: '10px 0',
            background: 'rgba(200,241,53,0.08)', border: '1px solid rgba(200,241,53,0.3)',
            borderRadius: 10, color: 'var(--accent)',
            fontSize: 13, fontWeight: 600,
            cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.6 : 1,
            transition: 'all 0.18s',
          }}
        >
          {loading
            ? <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} />
            : <Upload size={14} />}
          {loading ? 'Restoring…' : 'Import JSON'}
        </button>
      </div>

      <input
        ref={fileRef} type="file" accept=".json,application/json"
        style={{ display: 'none' }} onChange={handleFileChange}
      />

      {/* Status banner */}
      {status && (
        <div style={{
          marginTop: 10, display: 'flex', alignItems: 'flex-start', gap: 8,
          padding: '10px 12px', borderRadius: 9, fontSize: 12,
          background: isError ? 'rgba(248,113,113,0.1)' : 'rgba(74,222,128,0.1)',
          border:     `1px solid ${isError ? 'rgba(248,113,113,0.3)' : 'rgba(74,222,128,0.3)'}`,
          color:      isError ? '#f87171' : '#4ade80',
        }}>
          {isError
            ? <AlertCircle size={13} style={{ flexShrink: 0, marginTop: 1 }} />
            : <Check       size={13} style={{ flexShrink: 0, marginTop: 1 }} />}
          <span>{msg}</span>
        </div>
      )}

      {/* Helper text */}
      <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 8, lineHeight: 1.6 }}>
        Export includes your <strong style={{ color: 'var(--text)' }}>deficit, macros, BMI</strong> &amp; a ready-to-paste
        <strong style={{ color: 'var(--accent)' }}> aiContext</strong> paragraph — open the JSON and paste it into
        ChatGPT, Claude, or any AI for personalised guidance.
      </p>
    </div>
  );
}
