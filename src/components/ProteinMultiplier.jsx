import { PROTEIN_MULTIPLIERS } from '../utils/calculations';

export default function ProteinMultiplier({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {PROTEIN_MULTIPLIERS.map((opt) => (
        <div key={opt.value} className="tooltip-container">
          <button
            className={`toggle-btn text-xs ${value === opt.value ? 'active' : ''}`}
            style={{ padding: '6px 10px', minWidth: '52px' }}
            onClick={() => onChange(opt.value)}
          >
            {opt.label}
          </button>
          <span className="tooltip-text">{opt.label} — {opt.descriptor}</span>
        </div>
      ))}
    </div>
  );
}
