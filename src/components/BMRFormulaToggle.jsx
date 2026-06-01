import { FlaskConical } from 'lucide-react';
import { BMR_FORMULAS } from '../utils/calculations';

export default function BMRFormulaToggle({ formula, setFormula, bodyFatPct, setBodyFatPct }) {
  return (
    <div>
      <span className="field-label flex items-center gap-1.5">
        <FlaskConical size={12} />
        BMR Formula
      </span>

      <div className="flex flex-col gap-2">
        {BMR_FORMULAS.map((f) => {
          const isActive = formula === f.key;
          return (
            <button
              key={f.key}
              onClick={() => setFormula(f.key)}
              style={{
                background: isActive ? 'rgba(200,241,53,0.08)' : 'var(--card)',
                border: `1px solid ${isActive ? 'var(--accent)' : 'var(--border)'}`,
                borderRadius: 10,
                padding: '9px 14px',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.18s',
              }}
            >
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: isActive ? 'var(--accent)' : 'var(--text)', marginBottom: 1 }}>
                  {f.label}
                </p>
                <p style={{ fontSize: 11, color: 'var(--muted)' }}>{f.description}</p>
              </div>
              <span style={{
                fontFamily: '"Bebas Neue", cursive',
                fontSize: 15,
                letterSpacing: '0.05em',
                color: isActive ? 'var(--accent)' : 'var(--border)',
              }}>
                {f.short}
              </span>
            </button>
          );
        })}
      </div>

      {/* Body fat input — only for Katch-McArdle */}
      {formula === 'katch' && (
        <div className="mt-3">
          <label className="field-label" htmlFor="bodyfat-input">
            Body Fat % <span className="text-muted normal-case font-normal">(required for Katch-McArdle)</span>
          </label>
          <input
            id="bodyfat-input"
            type="number"
            className="input-field"
            value={bodyFatPct}
            min={3}
            max={60}
            step={0.5}
            onChange={(e) => setBodyFatPct(e.target.value)}
            placeholder="e.g. 18"
          />
        </div>
      )}
    </div>
  );
}
