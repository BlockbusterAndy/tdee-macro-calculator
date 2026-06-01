import { GOALS } from '../utils/calculations';

function formatOffset(offset) {
  if (offset === 0) return '± 0 kcal';
  return `${offset > 0 ? '+' : ''}${offset.toLocaleString()} kcal`;
}

export default function GoalSelector({ goal, setGoal }) {
  return (
    <div className="flex flex-wrap gap-2">
      {GOALS.map((g) => {
        const isActive = goal === g.key;
        return (
          <button
            key={g.key}
            className={`goal-btn ${isActive ? 'active' : ''}`}
            style={isActive ? { background: g.color, borderColor: g.color, color: '#000' } : {}}
            onClick={() => setGoal(g.key)}
          >
            <span className="block">{g.label}</span>
            <span
              className="block text-xs font-normal mt-0.5"
              style={{
                opacity: isActive ? 0.65 : 0.5,
                letterSpacing: '0.01em',
              }}
            >
              {formatOffset(g.offset)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
