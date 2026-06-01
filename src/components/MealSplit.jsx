import { Clock, Utensils } from 'lucide-react';
import { MEAL_PRESETS } from '../utils/calculations';

const MEAL_COLORS = ['#c8f135', '#38bdf8', '#fb923c', '#a78bfa', '#34d399'];

export default function MealSplit({ targetCalories, macros, mealPreset, setMealPreset }) {
  if (!targetCalories || !macros) return null;

  const preset = MEAL_PRESETS.find((p) => p.key === mealPreset) ?? MEAL_PRESETS[0];
  const { protein_g, carbs_g, fat_g } = macros;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="font-bebas text-2xl tracking-wide text-text flex items-center gap-2">
          <Utensils size={20} color="var(--accent)" />
          Meal Split
        </h3>
        <div className="flex gap-2 flex-wrap">
          {MEAL_PRESETS.map((p) => {
            const isActive = mealPreset === p.key;
            return (
              <button
                key={p.key}
                onClick={() => setMealPreset(p.key)}
                style={{
                  padding: '5px 10px', borderRadius: 7, fontSize: 12, fontWeight: 600,
                  cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.18s',
                  border: `1px solid ${isActive ? 'var(--accent)' : 'var(--border)'}`,
                  background: isActive ? 'rgba(200,241,53,0.1)' : 'transparent',
                  color: isActive ? 'var(--accent)' : 'var(--muted)',
                }}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Meal cards grid */}
      <div
        style={{
          display: 'grid',
          gap: 12,
          gridTemplateColumns: `repeat(${Math.min(preset.meals.length, 3)}, 1fr)`,
        }}
      >
        {preset.meals.map((meal, i) => {
          const kcal  = Math.round(targetCalories * meal.pct);
          const prot  = Math.round(protein_g * meal.pct * 10) / 10;
          const carbs = Math.round(carbs_g   * meal.pct * 10) / 10;
          const fat   = Math.round(fat_g     * meal.pct * 10) / 10;
          const color = MEAL_COLORS[i % MEAL_COLORS.length];

          return (
            <div
              key={meal.name}
              style={{
                background: 'var(--card)',
                border: `1px solid ${color}33`,
                borderRadius: 12,
                padding: '14px 16px',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Top color stripe */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                background: color, borderRadius: '12px 12px 0 0',
              }} />

              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6, marginTop: 2 }}>
                <Clock size={11} color={color} />
                <span style={{ fontSize: 10, color, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {meal.time}
                </span>
              </div>

              <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{meal.name}</p>

              <p style={{ fontFamily: '"Bebas Neue", cursive', fontSize: 28, color, lineHeight: 1, marginBottom: 10 }}>
                {kcal.toLocaleString()}
                <span style={{ fontSize: 12, color: 'var(--muted)', marginLeft: 4, fontFamily: 'DM Sans, sans-serif', fontWeight: 400 }}>kcal</span>
              </p>

              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {[
                  { label: 'P', val: prot,  col: '#c8f135' },
                  { label: 'C', val: carbs, col: '#38bdf8' },
                  { label: 'F', val: fat,   col: '#fb923c' },
                ].map((m) => (
                  <span key={m.label} style={{
                    fontSize: 11, fontWeight: 600,
                    background: `${m.col}18`,
                    border: `1px solid ${m.col}33`,
                    color: m.col,
                    padding: '2px 7px', borderRadius: 5,
                  }}>
                    {m.label} {m.val}g
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 10, textAlign: 'center' }}>
        Suggested splits — adjust timing to your schedule
      </p>
    </div>
  );
}
