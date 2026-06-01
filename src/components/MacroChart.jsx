import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { SlidersHorizontal } from 'lucide-react';
import MacroPresetSelector from './MacroPresetSelector';

const COLORS = { protein: '#c8f135', carbs: '#38bdf8', fat: '#fb923c' };

function MacroBar({ color, percent }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(percent), 80);
    return () => clearTimeout(t);
  }, [percent]);
  return (
    <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
      <div className="h-full rounded-full macro-bar" style={{ width: `${width}%`, background: color }} />
    </div>
  );
}

const ChartTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const { name, value, payload: p } = payload[0];
  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', fontSize: 13 }}>
      <p style={{ color: p.color, fontWeight: 600 }}>{name}</p>
      <p style={{ color: 'var(--text)' }}>{value.toLocaleString()} kcal</p>
    </div>
  );
};

export default function MacroChart({ macros, targetCalories, macroPreset, setMacroPreset }) {
  if (!macros) return null;
  const { protein_g, protein_kcal, carbs_g, carbs_kcal, fat_g, fat_kcal, overLimit } = macros;

  const total = (protein_kcal + carbs_kcal + fat_kcal) || 1;
  const data  = [
    { name: 'Protein', value: Math.round(protein_kcal), color: COLORS.protein },
    { name: 'Carbs',   value: Math.round(carbs_kcal),   color: COLORS.carbs   },
    { name: 'Fat',     value: Math.round(fat_kcal),     color: COLORS.fat     },
  ];

  const rows = [
    { key: 'protein', label: 'Protein', color: COLORS.protein, grams: protein_g, kcal: protein_kcal, pct: Math.round((protein_kcal / total) * 100) },
    { key: 'carbs',   label: 'Carbs',   color: COLORS.carbs,   grams: carbs_g,   kcal: carbs_kcal,   pct: Math.round((carbs_kcal   / total) * 100) },
    { key: 'fat',     label: 'Fat',     color: COLORS.fat,     grams: fat_g,     kcal: fat_kcal,     pct: Math.round((fat_kcal     / total) * 100) },
  ];

  return (
    <div>
      {/* Header row */}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <h3 className="font-bebas text-2xl tracking-wide text-text">Macro Breakdown</h3>
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={13} color="var(--muted)" />
          <MacroPresetSelector value={macroPreset} onChange={setMacroPreset} />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-6 items-start">
        {/* Donut + center label */}
        <div className="w-full sm:w-44 flex-shrink-0">
          <div style={{ position: 'relative' }}>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={3} dataKey="value" strokeWidth={0}>
                  {data.map((e) => <Cell key={e.name} fill={e.color} />)}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center overlay */}
            <div style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%, -55%)',
              textAlign: 'center', pointerEvents: 'none',
            }}>
              <p style={{ fontFamily: '"Bebas Neue", cursive', fontSize: 22, color: 'var(--accent)', lineHeight: 1 }}>
                {targetCalories.toLocaleString()}
              </p>
              <p style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>kcal</p>
            </div>
          </div>
          <p className="text-center text-muted text-xs mt-1">{macros.preset?.label ?? 'Standard'} split</p>
        </div>

        {/* Macro rows */}
        <div className="flex-1 flex flex-col gap-4">
          {rows.map((row) => (
            <div key={row.key}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: row.color }} />
                  <span className="text-sm font-medium text-text">{row.label}</span>
                  <span className="text-muted text-xs">{row.pct}%</span>
                </div>
                <div className="text-right">
                  <span className="font-bebas text-2xl tracking-wide" style={{ color: row.color }}>
                    {row.grams.toFixed(1)}<span className="text-sm font-sans font-normal ml-1 text-muted">g</span>
                  </span>
                  <span className="text-muted text-xs ml-2">{Math.round(row.kcal)} kcal</span>
                </div>
              </div>
              <MacroBar color={row.color} percent={overLimit && row.key !== 'protein' ? 0 : row.pct} />
            </div>
          ))}
        </div>
      </div>

      <p className="text-muted text-xs mt-4 text-center">
        Protein 4 kcal/g · Carbs 4 kcal/g · Fat 9 kcal/g
      </p>
    </div>
  );
}
