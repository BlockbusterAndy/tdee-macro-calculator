import { Scale, TrendingDown, TrendingUp, Beef, CalendarDays } from 'lucide-react';

const ICONS = {
  bmi:          <Scale size={14} />,
  weekly:       null, // set dynamically
  protein:      <Beef size={14} />,
  days:         <CalendarDays size={14} />,
};

export default function StatCards({ results, unit }) {
  if (!results) return null;

  const { bmi, bmiCategory, weeklyChangeKg, weeklyChangeLbs, proteinPerKg, daysToTarget } = results;

  const isImperial    = unit === 'imperial';
  const weeklyVal     = isImperial ? weeklyChangeLbs : weeklyChangeKg;
  const weeklyUnit    = isImperial ? 'lbs/week' : 'kg/week';
  const weeklySign    = weeklyVal > 0 ? '+' : '';
  const weeklyColor   = weeklyVal < 0 ? '#4ade80' : weeklyVal > 0 ? '#38bdf8' : 'var(--muted)';
  const weeklyLabel   = weeklyVal < 0 ? 'Weight Loss' : weeklyVal > 0 ? 'Weight Gain' : 'Maintaining';
  const WeeklyIcon    = weeklyVal < 0 ? TrendingDown : TrendingUp;

  const cards = [
    {
      id: 'bmi',
      icon: <Scale size={14} color="var(--muted)" />,
      label: 'BMI',
      value: bmi.toFixed(1),
      unit: '',
      sub: bmiCategory.label,
      subColor: bmiCategory.color,
    },
    {
      id: 'weekly-change',
      icon: <WeeklyIcon size={14} color={weeklyColor} />,
      label: 'Est. Weekly Change',
      value: `${weeklySign}${Math.abs(weeklyVal).toFixed(2)}`,
      unit: weeklyUnit,
      sub: weeklyLabel,
      subColor: weeklyColor,
      valueColor: weeklyColor,
    },
    {
      id: 'protein-per-kg',
      icon: <Beef size={14} color="var(--protein)" />,
      label: 'Protein per kg',
      value: proteinPerKg.toFixed(1),
      unit: 'g / kg',
      sub: 'Bodyweight ratio',
      subColor: 'var(--protein)',
      valueColor: 'var(--protein)',
    },
    {
      id: 'days-to-target',
      icon: <CalendarDays size={14} color={daysToTarget !== null ? 'var(--accent)' : 'var(--muted)'} />,
      label: 'Days to Target',
      value: daysToTarget !== null ? daysToTarget.toLocaleString() : '—',
      unit: daysToTarget !== null ? 'days' : '',
      sub: daysToTarget !== null ? `~${Math.round(daysToTarget / 7)} weeks` : 'Set a target weight',
      subColor: daysToTarget !== null ? 'var(--accent)' : 'var(--muted)',
      valueColor: daysToTarget !== null ? 'var(--text)' : 'var(--muted)',
    },
  ];

  return (
    <div>
      <h3 className="font-bebas text-2xl tracking-wide text-text mb-4">Key Stats</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {cards.map((card) => (
          <div key={card.id} className="stat-card text-center">
            <div className="flex items-center justify-center gap-1.5 mb-2">
              {card.icon}
              <p className="text-muted text-xs uppercase tracking-widest">{card.label}</p>
            </div>
            <p className="font-bebas text-3xl tracking-wide" style={{ color: card.valueColor || 'var(--text)' }}>
              {card.value}
            </p>
            {card.unit && <p className="text-muted text-xs mt-0.5">{card.unit}</p>}
            <p className="text-xs mt-2 font-medium" style={{ color: card.subColor }}>{card.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
