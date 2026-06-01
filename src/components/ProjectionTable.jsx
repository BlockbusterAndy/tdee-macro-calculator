import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ReferenceLine, ResponsiveContainer,
} from 'recharts';
import { CalendarDays, RefreshCw } from 'lucide-react';

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px', fontSize: 12, lineHeight: 1.8 }}>
      <p style={{ color: 'var(--text)', fontWeight: 600, marginBottom: 4 }}>{label} kg</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }}>{p.name}: {Math.round(p.value).toLocaleString()} kcal</p>
      ))}
    </div>
  );
}

function CustomDot({ cx, cy, fill }) {
  return <circle cx={cx} cy={cy} r={4} fill={fill} stroke="var(--bg)" strokeWidth={2} />;
}

export default function ProjectionTable({ projection, unit }) {
  if (!projection || projection.length === 0) return null;

  const isImperial = unit === 'imperial';

  const chartData = [...projection]
    .sort((a, b) => b.weightKg - a.weightKg)
    .map((r) => ({ weight: r.weightKg, 'Target Calories': r.targetCals, BMR: r.bmr }));

  const minBMR = Math.min(...projection.map((r) => r.bmr));

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="font-bebas text-2xl tracking-wide text-text">Adaptive Weight Projection</h3>
        <span className="text-muted text-xs">Recalculated at each 5 kg milestone</span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="projection-table">
          <thead>
            <tr>
              <th>Weight</th>
              <th>BMR</th>
              <th>Maintenance</th>
              <th>Target Cal</th>
              <th>Δ From Start</th>
              <th>Weekly Δ</th>
              <th>Est. Date</th>
              <th>Protein (g)</th>
            </tr>
          </thead>
          <tbody>
            {projection.map((row, i) => {
              const isCurrent = row.isStart;
              const weightDisplay = isImperial
                ? `${Math.round(row.weightKg * 2.20462 * 10) / 10} lbs`
                : `${row.weightKg} kg`;
              const weeklyDisplay = isImperial
                ? `${row.weeklyChangeKg > 0 ? '+' : ''}${Math.round(row.weeklyChangeKg * 2.20462 * 100) / 100} lbs`
                : `${row.weeklyChangeKg > 0 ? '+' : ''}${row.weeklyChangeKg} kg`;

              return (
                <tr key={i} className={isCurrent ? 'current-row' : ''}>
                  <td>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-text">{weightDisplay}</span>
                      {isCurrent && (
                        <span style={{ background: 'rgba(200,241,53,0.15)', border: '1px solid rgba(200,241,53,0.4)', color: 'var(--accent)', fontSize: 10, fontWeight: 600, padding: '1px 5px', borderRadius: 4 }}>YOU</span>
                      )}
                      {row.showBadge && (
                        <span className="recalc-badge">
                          <RefreshCw size={9} />
                          Recalculate
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ color: 'var(--muted)' }}>{row.bmr.toLocaleString()}</td>
                  <td style={{ color: 'var(--muted)' }}>{row.tdee.toLocaleString()}</td>
                  <td style={{ color: 'var(--accent)', fontWeight: 600 }}>{row.targetCals.toLocaleString()}</td>
                  <td>
                    <span style={{ color: row.deltaFromStart < 0 ? '#f87171' : row.deltaFromStart > 0 ? '#4ade80' : 'var(--muted)' }}>
                      {row.deltaFromStart === 0 ? '—' : `${row.deltaFromStart > 0 ? '+' : ''}${row.deltaFromStart} kcal`}
                    </span>
                  </td>
                  <td style={{ color: row.weeklyChangeKg < 0 ? '#4ade80' : row.weeklyChangeKg > 0 ? '#38bdf8' : 'var(--muted)' }}>
                    {row.weeklyChangeKg === 0 ? '—' : weeklyDisplay}
                  </td>
                  <td>
                    <div className="flex items-center gap-1.5">
                      {!isCurrent && <CalendarDays size={11} color="var(--muted)" />}
                      <span style={{ color: isCurrent ? 'var(--accent)' : 'var(--muted)', fontWeight: isCurrent ? 600 : 400 }}>
                        {row.dateLabel}
                      </span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--protein)', fontWeight: 600 }}>{row.protein_g}g</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Line Chart */}
      <div className="mt-8">
        <p className="text-muted text-xs uppercase tracking-widest mb-3 text-center">
          Calorie Roadmap — How Your Target Decreases as You Lose Weight
        </p>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey="weight" reversed
              tick={{ fill: 'var(--muted)', fontSize: 11 }} tickLine={false}
              axisLine={{ stroke: 'var(--border)' }}
              tickFormatter={(v) => `${v} kg`}
              label={{ value: 'Weight (kg)', position: 'insideBottom', offset: -4, fill: 'var(--muted)', fontSize: 11 }}
            />
            <YAxis
              tick={{ fill: 'var(--muted)', fontSize: 11 }} tickLine={false}
              axisLine={{ stroke: 'var(--border)' }} width={55}
            />
            <Tooltip content={<ChartTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12, color: 'var(--muted)', paddingTop: 8 }} />
            <ReferenceLine y={minBMR} stroke="var(--muted)" strokeDasharray="4 4"
              label={{ value: 'BMR Floor', position: 'right', fill: 'var(--muted)', fontSize: 10 }} />
            <Line type="monotone" dataKey="Target Calories" stroke="var(--accent)" strokeWidth={2.5}
              dot={<CustomDot fill="var(--accent)" />} activeDot={{ r: 6, fill: 'var(--accent)' }} />
            <Line type="monotone" dataKey="BMR" stroke="var(--muted)" strokeWidth={1.5} strokeDasharray="4 4"
              dot={<CustomDot fill="var(--muted)" />} activeDot={{ r: 5, fill: 'var(--muted)' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
