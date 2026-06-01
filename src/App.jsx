import { useCalculator } from './hooks/useCalculator';
import InputPanel from './components/InputPanel';
import ResultsSummary from './components/ResultsSummary';
import MacroChart from './components/MacroChart';
import ProjectionTable from './components/ProjectionTable';
import StatCards from './components/StatCards';
import MealSplit from './components/MealSplit';
import WeightLog from './components/WeightLog';
import ShareButton from './components/ShareButton';

export default function App() {
  const calc = useCalculator();
  const { results, unit, shareURL, savedFlash } = calc;

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* ── Header ─────────────────────────────────────────── */}
      <header style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center font-bebas text-black text-xl flex-shrink-0"
              style={{ background: 'var(--accent)' }}
            >
              T
            </div>
            <div>
              <h1 className="font-bebas text-2xl tracking-widest text-text leading-none">
                TDEE &amp; MACRO CALC
              </h1>
              <p className="text-muted text-xs">Adaptive Calorie Intelligence</p>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* "Saved" flash badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                fontSize: 11,
                fontWeight: 600,
                color: '#4ade80',
                background: 'rgba(74,222,128,0.1)',
                border: '1px solid rgba(74,222,128,0.3)',
                borderRadius: 20,
                padding: '4px 10px',
                opacity: savedFlash ? 1 : 0,
                transform: savedFlash ? 'translateY(0)' : 'translateY(-4px)',
                transition: 'opacity 0.3s, transform 0.3s',
                pointerEvents: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M1.5 5L4 7.5L8.5 2.5" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Saved locally
            </div>

            {/* Share button */}
            {results && <ShareButton shareURL={shareURL} results={results} unit={unit} />}

            {/* GitHub */}
            <a
              href="https://github.com/BlockbusterAndy"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 group"
              style={{ textDecoration: 'none' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"
                style={{ color: 'var(--muted)', transition: 'color 0.2s' }} className="group-hover:text-text">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
              </svg>
              <span style={{ fontSize: 13, color: 'var(--muted)', transition: 'color 0.2s' }} className="group-hover:text-text hidden sm:block">
                BlockbusterAndy
              </span>
            </a>
          </div>
        </div>
      </header>

      {/* ── Main ───────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 items-start">

          {/* LEFT — sticky input panel */}
          <div className="lg:sticky lg:top-6">
            <InputPanel
              unit={calc.unit}              setUnit={calc.setUnit}
              gender={calc.gender}          setGender={calc.setGender}
              age={calc.age}                setAge={calc.setAge}
              weight={calc.weight}          setWeight={calc.setWeight}
              heightCm={calc.heightCm}      setHeightCm={calc.setHeightCm}
              heightFt={calc.heightFt}      setHeightFt={calc.setHeightFt}
              heightIn={calc.heightIn}      setHeightIn={calc.setHeightIn}
              activity={calc.activity}      setActivity={calc.setActivity}
              goal={calc.goal}              setGoal={calc.setGoal}
              targetWeight={calc.targetWeight} setTargetWeight={calc.setTargetWeight}
              proteinMultiplier={calc.proteinMultiplier} setProteinMultiplier={calc.setProteinMultiplier}
              bmrFormula={calc.bmrFormula}  setBmrFormula={calc.setBmrFormula}
              bodyFatPct={calc.bodyFatPct}  setBodyFatPct={calc.setBodyFatPct}
              macroPreset={calc.macroPreset}
              bmr={results?.bmr ?? null}
              tdee={results?.tdee ?? null}
              results={results}
              formState={{
                unit: calc.unit, gender: calc.gender, age: calc.age,
                weight: calc.weight, heightCm: calc.heightCm,
                heightFt: calc.heightFt, heightIn: calc.heightIn,
                activity: calc.activity, goal: calc.goal,
                targetWeight: calc.targetWeight,
                proteinMultiplier: calc.proteinMultiplier,
                bmrFormula: calc.bmrFormula, bodyFatPct: calc.bodyFatPct,
                macroPreset: calc.macroPreset, mealPreset: calc.mealPreset,
              }}
            />
          </div>

          {/* RIGHT — results */}
          <div className="flex flex-col gap-6">
            {!results ? (
              <div className="section-card flex items-center justify-center py-20">
                <div className="text-center">
                  <p className="font-bebas text-5xl tracking-wide" style={{ color: 'var(--border)' }}>ENTER YOUR STATS</p>
                  <p className="text-muted text-sm mt-2">Fill in the form on the left to see your results</p>
                </div>
              </div>
            ) : (
              <>
                {/* 1 — Daily Targets */}
                <div className="section-card">
                  <ResultsSummary results={results} />
                </div>

                {/* 2 — Macro Breakdown */}
                <div className="section-card">
                  <MacroChart
                    macros={results.macros}
                    targetCalories={results.targetCalories}
                    macroPreset={calc.macroPreset}
                    setMacroPreset={calc.setMacroPreset}
                  />
                </div>

                {/* 3 — Meal Split */}
                <div className="section-card">
                  <MealSplit
                    targetCalories={results.targetCalories}
                    macros={results.macros}
                    mealPreset={calc.mealPreset}
                    setMealPreset={calc.setMealPreset}
                  />
                </div>

                {/* 4 — Key Stats */}
                <div className="section-card">
                  <StatCards results={results} unit={unit} />
                </div>

                {/* 5 — Weight Log */}
                <div className="section-card">
                  <WeightLog unit={unit} currentWeightKg={calc.weightKg} />
                </div>

                {/* 6 — Adaptive Projection */}
                <div className="section-card">
                  <ProjectionTable
                    projection={results.projection}
                    currentWeightKg={calc.weightKg}
                    unit={unit}
                  />
                </div>

                {/* Disclaimer */}
                <div
                  className="rounded-xl p-4 text-xs text-center"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', color: 'var(--muted)' }}
                >
                  Results are estimates based on the Mifflin-St Jeor / Harris-Benedict / Katch-McArdle equations.
                  Recalculate every 4–6 weeks using your actual current weight.
                  Consult a registered dietitian or physician before making significant dietary changes.
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer style={{ borderTop: '1px solid var(--border)', background: 'var(--surface)', padding: '20px 24px', marginTop: 16 }}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p style={{ fontSize: 12, color: 'var(--muted)' }}>
            © {new Date().getFullYear()} BlockbusterAndy. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span style={{ fontSize: 11, color: 'var(--muted)', background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: 20, padding: '2px 10px' }}>
              💾 All data saved locally — nothing leaves your device
            </span>
            <a
              href="https://github.com/BlockbusterAndy"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 group"
              style={{ textDecoration: 'none' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"
                style={{ color: 'var(--muted)', transition: 'color 0.2s' }} className="group-hover:text-accent">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
              </svg>
              <span style={{ fontSize: 12, color: 'var(--muted)', transition: 'color 0.2s' }} className="group-hover:text-accent">
                github.com/BlockbusterAndy
              </span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
