import { Flame, Activity, Target, AlertTriangle } from 'lucide-react';

export default function ResultsSummary({ results }) {
  if (!results) return null;
  const { bmr, tdee, targetCalories, wasClamped, gender, macros } = results;

  return (
    <div>
      <h3 className="font-bebas text-2xl tracking-wide text-text mb-4">Daily Targets</h3>

      {wasClamped && (
        <div className="warning-box mb-4 flex items-start gap-2">
          <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
          <span>
            Your target was clamped to the safe minimum of {gender === 'male' ? '1,200' : '1,000'} kcal.
            Consider a less aggressive goal or consult a professional.
          </span>
        </div>
      )}
      {macros?.overLimit && (
        <div className="warning-box mb-4 flex items-start gap-2">
          <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
          <span>Protein alone exceeds your calorie target. Lower your protein multiplier or reduce your deficit.</span>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        {/* BMR */}
        <div className="stat-card text-center">
          <div className="flex items-center justify-center gap-1.5 mb-2">
            <Flame size={13} color="var(--muted)" />
            <p className="text-muted text-xs uppercase tracking-widest">BMR</p>
          </div>
          <p className="font-bebas text-4xl text-text tracking-wide">{bmr.toLocaleString()}</p>
          <p className="text-muted text-xs mt-1">kcal</p>
          <p className="text-muted text-xs mt-2 font-medium">At Rest</p>
        </div>

        {/* TDEE */}
        <div className="stat-card text-center">
          <div className="flex items-center justify-center gap-1.5 mb-2">
            <Activity size={13} color="var(--muted)" />
            <p className="text-muted text-xs uppercase tracking-widest">TDEE</p>
          </div>
          <p className="font-bebas text-4xl text-text tracking-wide">{tdee.toLocaleString()}</p>
          <p className="text-muted text-xs mt-1">kcal</p>
          <p className="text-muted text-xs mt-2 font-medium">Maintenance</p>
        </div>

        {/* Target */}
        <div className="stat-card accent text-center">
          <div className="flex items-center justify-center gap-1.5 mb-2">
            <Target size={13} color="var(--accent)" />
            <p className="text-xs uppercase tracking-widest" style={{ color: 'var(--accent)' }}>Target</p>
          </div>
          <p className="font-bebas text-4xl tracking-wide" style={{ color: 'var(--accent)' }}>
            {targetCalories.toLocaleString()}
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--accent)', opacity: 0.7 }}>kcal</p>
          <p className="text-xs mt-2 font-medium" style={{ color: 'var(--accent)' }}>Your Target</p>
        </div>
      </div>
    </div>
  );
}
