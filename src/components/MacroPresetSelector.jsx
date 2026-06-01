import { MACRO_PRESETS } from '../utils/calculations';

const PRESET_COLORS = {
  standard:  'var(--text)',
  low_carb:  '#fb923c',
  keto:      '#f87171',
  high_carb: '#38bdf8',
};

export default function MacroPresetSelector({ value, onChange }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {MACRO_PRESETS.map((p) => {
        const isActive = value === p.key;
        const col = PRESET_COLORS[p.key];
        return (
          <div key={p.key} className="tooltip-container">
            <button
              onClick={() => onChange(p.key)}
              style={{
                padding: '6px 12px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                border: `1px solid ${isActive ? col : 'var(--border)'}`,
                background: isActive ? `${col}18` : 'transparent',
                color: isActive ? col : 'var(--muted)',
                transition: 'all 0.18s',
                whiteSpace: 'nowrap',
              }}
            >
              {p.label}
            </button>
            {/* Tooltip shows the full split so users know protein changes too */}
            <span className="tooltip-text">{p.description}</span>
          </div>
        );
      })}
    </div>
  );
}
