import { Ruler, Dumbbell, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import UnitToggle from './UnitToggle';
import GoalSelector from './GoalSelector';
import ProteinMultiplier from './ProteinMultiplier';
import BMRFormulaToggle from './BMRFormulaToggle';
import DataPortability from './DataPortability';
import { ACTIVITY_LEVELS } from '../utils/calculations';

export default function InputPanel({
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
  macroPreset,
  bmr, tdee,
  results,      // ← for DataPortability export
  formState,    // ← for DataPortability export
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const activityCalories   = bmr && tdee ? Math.round(tdee - bmr) : null;
  const presetOwnsProtein  = macroPreset && macroPreset !== 'standard';

  return (
    <div className="section-card flex flex-col gap-6">
      {/* Header */}
      <div>
        <h2 className="font-bebas text-3xl tracking-wide text-accent">Your Stats</h2>
        <p className="text-muted text-sm mt-1">Fill in your details — results update instantly</p>
      </div>

      {/* Unit Toggle */}
      <div>
        <span className="field-label flex items-center gap-1.5">
          <Ruler size={12} /> Unit System
        </span>
        <UnitToggle unit={unit} setUnit={setUnit} />
      </div>

      {/* Gender */}
      <div>
        <span className="field-label">Biological Sex</span>
        <div className="flex gap-2">
          <button className={`toggle-btn flex-1 ${gender === 'male' ? 'active' : ''}`} onClick={() => setGender('male')}>♂ Male</button>
          <button className={`toggle-btn flex-1 ${gender === 'female' ? 'active' : ''}`} onClick={() => setGender('female')}>♀ Female</button>
        </div>
      </div>

      {/* Age */}
      <div>
        <label className="field-label" htmlFor="age-input">Age</label>
        <input id="age-input" type="number" className="input-field" value={age} min={10} max={100} onChange={(e) => setAge(e.target.value)} placeholder="Years" />
      </div>

      {/* Weight */}
      <div>
        <label className="field-label" htmlFor="weight-input">Weight ({unit === 'metric' ? 'kg' : 'lbs'})</label>
        <input id="weight-input" type="number" className="input-field" value={weight} min={1} step={0.5} onChange={(e) => setWeight(e.target.value)} placeholder={unit === 'metric' ? 'e.g. 80' : 'e.g. 176'} />
      </div>

      {/* Height */}
      <div>
        <span className="field-label">Height</span>
        {unit === 'metric' ? (
          <input id="height-cm-input" type="number" className="input-field" value={heightCm} min={100} max={250} onChange={(e) => setHeightCm(e.target.value)} placeholder="cm (e.g. 175)" />
        ) : (
          <div className="flex gap-2">
            <div className="flex-1">
              <input id="height-ft-input" type="number" className="input-field" value={heightFt} min={3} max={8} onChange={(e) => setHeightFt(e.target.value)} placeholder="ft" />
              <span className="text-muted text-xs mt-1 block text-center">ft</span>
            </div>
            <div className="flex-1">
              <input id="height-in-input" type="number" className="input-field" value={heightIn} min={0} max={11} step={0.5} onChange={(e) => setHeightIn(e.target.value)} placeholder="in" />
              <span className="text-muted text-xs mt-1 block text-center">in</span>
            </div>
          </div>
        )}
      </div>

      {/* Activity Level */}
      <div>
        <span className="field-label flex items-center gap-1.5">
          <Dumbbell size={12} /> Activity Level
        </span>
        <div className="flex flex-col gap-2">
          {ACTIVITY_LEVELS.map((level) => {
            const isActive   = activity === level.key;
            const levelBurn  = bmr ? Math.round(bmr * level.multiplier - bmr) : null;
            return (
              <button
                key={level.key}
                id={`activity-${level.key}`}
                onClick={() => setActivity(level.key)}
                style={{
                  background: isActive ? 'rgba(200,241,53,0.08)' : 'var(--card)',
                  border: `1px solid ${isActive ? 'var(--accent)' : 'var(--border)'}`,
                  borderRadius: 10, padding: '10px 14px', cursor: 'pointer',
                  textAlign: 'left', transition: 'all 0.18s', width: '100%',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
                }}
              >
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: isActive ? 'var(--accent)' : 'var(--text)', marginBottom: 1 }}>{level.label}</p>
                  <p style={{ fontSize: 11, color: 'var(--muted)' }}>{level.description}</p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  {levelBurn !== null ? (
                    <>
                      <p style={{ fontFamily: '"Bebas Neue", cursive', fontSize: 18, letterSpacing: '0.04em', color: isActive ? 'var(--accent)' : 'var(--muted)', lineHeight: 1 }}>+{levelBurn.toLocaleString()}</p>
                      <p style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>kcal/day</p>
                    </>
                  ) : (
                    <p style={{ fontSize: 11, color: 'var(--border)' }}>×{level.multiplier}</p>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Activity burn summary */}
        {activityCalories !== null && (
          <div style={{ marginTop: 10, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px' }}>
            <p style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>Daily Calorie Breakdown</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontFamily: '"Bebas Neue", cursive', fontSize: 22, color: 'var(--text)', lineHeight: 1 }}>{bmr.toLocaleString()}</p>
                <p style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>BMR</p>
              </div>
              <p style={{ color: 'var(--muted)', fontSize: 16, fontWeight: 300, paddingBottom: 10 }}>+</p>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontFamily: '"Bebas Neue", cursive', fontSize: 22, color: 'var(--carbs)', lineHeight: 1 }}>{activityCalories.toLocaleString()}</p>
                <p style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>Activity</p>
              </div>
              <p style={{ color: 'var(--muted)', fontSize: 16, fontWeight: 300, paddingBottom: 10 }}>=</p>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontFamily: '"Bebas Neue", cursive', fontSize: 22, color: 'var(--accent)', lineHeight: 1 }}>{tdee.toLocaleString()}</p>
                <p style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>Maintenance</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Goal */}
      <div>
        <span className="field-label">Goal</span>
        <GoalSelector goal={goal} setGoal={setGoal} />
      </div>

      {/* Target Weight */}
      <div>
        <label className="field-label" htmlFor="target-weight-input">
          Target Weight ({unit === 'metric' ? 'kg' : 'lbs'})
          <span className="ml-2 text-muted normal-case font-normal text-xs">(optional — for projection)</span>
        </label>
        <input id="target-weight-input" type="number" className="input-field" value={targetWeight} min={1} step={0.5} onChange={(e) => setTargetWeight(e.target.value)} placeholder={unit === 'metric' ? 'e.g. 70' : 'e.g. 154'} />
      </div>

      {/* Protein Multiplier */}
      <div style={{ opacity: presetOwnsProtein ? 0.45 : 1, transition: 'opacity 0.25s', position: 'relative' }}>
        <span className="field-label flex items-center gap-1.5">
          <Dumbbell size={12} />
          Protein Multiplier
          <span className="ml-1 text-muted normal-case font-normal text-xs">(g per kg bodyweight)</span>
        </span>

        {presetOwnsProtein ? (
          <div style={{
            background: 'rgba(200,241,53,0.06)',
            border: '1px solid rgba(200,241,53,0.2)',
            borderRadius: 10, padding: '10px 14px',
            fontSize: 12, color: 'var(--accent)',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{ fontSize: 16 }}>🔒</span>
            <span>
              Protein is set by the <strong>{macroPreset.replace('_', ' ')}</strong> diet preset.
              Switch to <strong>Standard</strong> in the Macro Breakdown section to use the multiplier.
            </span>
          </div>
        ) : (
          <ProteinMultiplier value={proteinMultiplier} onChange={setProteinMultiplier} />
        )}
      </div>

      {/* Advanced — collapsible */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
        <button
          onClick={() => setShowAdvanced((v) => !v)}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            width: '100%', background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--muted)', fontSize: 12, fontWeight: 600,
            textTransform: 'uppercase', letterSpacing: '0.07em',
          }}
        >
          <span>Advanced Settings</span>
          {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {showAdvanced && (
          <div className="mt-4">
            <BMRFormulaToggle
              formula={bmrFormula}
              setFormula={setBmrFormula}
              bodyFatPct={bodyFatPct}
              setBodyFatPct={setBodyFatPct}
            />
          </div>
        )}
      </div>

      {/* Data Backup & Restore */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
        <DataPortability results={results} formState={formState} />
      </div>
    </div>
  );
}
