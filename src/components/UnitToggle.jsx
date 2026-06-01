export default function UnitToggle({ unit, setUnit }) {
  return (
    <div className="flex items-center gap-2">
      <button
        className={`toggle-btn ${unit === 'metric' ? 'active' : ''}`}
        onClick={() => setUnit('metric')}
      >
        Metric (kg / cm)
      </button>
      <button
        className={`toggle-btn ${unit === 'imperial' ? 'active' : ''}`}
        onClick={() => setUnit('imperial')}
      >
        Imperial (lbs / ft)
      </button>
    </div>
  );
}
