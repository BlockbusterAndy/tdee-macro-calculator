import { useState } from 'react';
import { Plus, Trash2, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const LOG_KEY = 'tdee_weight_log';

function loadLog() {
  try { return JSON.parse(localStorage.getItem(LOG_KEY) || '[]'); }
  catch { return []; }
}

function saveLog(entries) {
  try { localStorage.setItem(LOG_KEY, JSON.stringify(entries)); }
  catch {}
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const SparkTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 10px', fontSize: 12 }}>
      <p style={{ color: 'var(--muted)', marginBottom: 2 }}>{label}</p>
      <p style={{ color: 'var(--accent)', fontWeight: 600 }}>{payload[0].value} kg</p>
    </div>
  );
};

export default function WeightLog({ unit, currentWeightKg }) {
  const [entries, setEntries] = useState(loadLog);
  const [newWeight, setNewWeight] = useState('');
  const [added, setAdded] = useState(false);

  const displayUnit = unit === 'imperial' ? 'lbs' : 'kg';
  const toDisplay = (kg) => unit === 'imperial' ? Math.round(kg * 2.20462 * 10) / 10 : kg;

  function addEntry() {
    const val = parseFloat(newWeight);
    if (isNaN(val) || val <= 0) return;
    const kg = unit === 'imperial' ? val * 0.453592 : val;
    const today = new Date().toISOString().split('T')[0];
    const updated = [...entries.filter((e) => e.date !== today), { date: today, weight: Math.round(kg * 10) / 10 }]
      .sort((a, b) => a.date.localeCompare(b.date));
    setEntries(updated);
    saveLog(updated);
    setNewWeight('');
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  function removeEntry(date) {
    const updated = entries.filter((e) => e.date !== date);
    setEntries(updated);
    saveLog(updated);
  }

  const last8 = entries.slice(-8);
  const chartData = last8.map((e) => ({ date: formatDate(e.date), weight: toDisplay(e.weight) }));

  // Trend
  let trend = null;
  if (last8.length >= 2) {
    const first = toDisplay(last8[0].weight);
    const last  = toDisplay(last8[last8.length - 1].weight);
    trend = Math.round((last - first) * 100) / 100;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="font-bebas text-2xl tracking-wide text-text flex items-center gap-2">
          <span style={{ color: 'var(--accent)' }}>⚖</span> Weight Log
        </h3>
        {trend !== null && (
          <span style={{
            display: 'flex', alignItems: 'center', gap: 5,
            fontSize: 12, fontWeight: 600,
            color: trend < 0 ? '#4ade80' : trend > 0 ? '#f87171' : 'var(--muted)',
            background: trend < 0 ? 'rgba(74,222,128,0.1)' : trend > 0 ? 'rgba(248,113,113,0.1)' : 'transparent',
            border: `1px solid ${trend < 0 ? 'rgba(74,222,128,0.3)' : trend > 0 ? 'rgba(248,113,113,0.3)' : 'var(--border)'}`,
            borderRadius: 20, padding: '3px 10px',
          }}>
            {trend < 0 ? <TrendingDown size={13} /> : <TrendingUp size={13} />}
            {trend > 0 ? '+' : ''}{trend} {displayUnit} over {last8.length} entries
          </span>
        )}
      </div>

      {/* Add today's weight */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input
          type="number"
          className="input-field"
          style={{ flex: 1 }}
          value={newWeight}
          min={1}
          step={0.1}
          onChange={(e) => setNewWeight(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addEntry()}
          placeholder={`Log today's weight (${displayUnit})`}
        />
        <button
          onClick={addEntry}
          style={{
            background: added ? '#22c55e' : 'var(--accent)',
            color: '#000',
            border: 'none',
            borderRadius: 8,
            padding: '0 16px',
            fontWeight: 700,
            fontSize: 13,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            transition: 'background 0.2s',
            whiteSpace: 'nowrap',
          }}
        >
          <Plus size={15} />
          {added ? 'Logged!' : 'Log'}
        </button>
      </div>

      {/* Sparkline chart */}
      {chartData.length >= 2 ? (
        <div style={{ marginBottom: 16 }}>
          <ResponsiveContainer width="100%" height={140}>
            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#c8f135" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#c8f135" stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fill: 'var(--muted)', fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis
                domain={['auto', 'auto']}
                tick={{ fill: 'var(--muted)', fontSize: 10 }}
                tickLine={false} axisLine={false}
                width={40}
                tickFormatter={(v) => `${v}`}
              />
              <Tooltip content={<SparkTooltip />} />
              <Area
                type="monotone"
                dataKey="weight"
                stroke="#c8f135"
                strokeWidth={2}
                fill="url(#weightGrad)"
                dot={{ r: 3, fill: '#c8f135', stroke: 'var(--bg)', strokeWidth: 2 }}
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : entries.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '24px 0',
          color: 'var(--muted)', fontSize: 13,
          border: '1px dashed var(--border)', borderRadius: 10, marginBottom: 16,
        }}>
          Log at least 2 entries to see your progress chart
        </div>
      ) : (
        <div style={{
          textAlign: 'center', padding: '16px 0',
          color: 'var(--muted)', fontSize: 12, marginBottom: 16,
        }}>
          Log one more entry to see the trend chart
        </div>
      )}

      {/* Entry list */}
      {entries.length > 0 && (
        <div style={{
          maxHeight: 200, overflowY: 'auto',
          border: '1px solid var(--border)', borderRadius: 10,
        }}>
          {[...entries].reverse().map((e) => (
            <div
              key={e.date}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '9px 14px',
                borderBottom: '1px solid var(--border)',
                fontSize: 13,
              }}
            >
              <span style={{ color: 'var(--muted)' }}>{formatDate(e.date)}</span>
              <span style={{ fontFamily: '"Bebas Neue", cursive', fontSize: 18, color: 'var(--text)', letterSpacing: '0.03em' }}>
                {toDisplay(e.weight)} <span style={{ fontSize: 12, color: 'var(--muted)', fontFamily: 'sans-serif' }}>{displayUnit}</span>
              </span>
              <button
                onClick={() => removeEntry(e.date)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: '2px 4px', borderRadius: 4 }}
                title="Remove"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
