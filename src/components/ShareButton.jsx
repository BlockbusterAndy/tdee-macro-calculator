import { useState } from 'react';
import { Share2, Copy, Check, Link } from 'lucide-react';

export default function ShareButton({ shareURL, results, unit }) {
  const [copiedURL, setCopiedURL]     = useState(false);
  const [copiedText, setCopiedText]   = useState(false);
  const [open, setOpen]               = useState(false);

  function copyURL() {
    navigator.clipboard.writeText(shareURL).then(() => {
      setCopiedURL(true);
      setTimeout(() => setCopiedURL(false), 2000);
    });
  }

  function copyText() {
    if (!results) return;
    const u = unit === 'imperial' ? 'lbs' : 'kg';
    const wk = unit === 'imperial'
      ? `${results.weeklyChangeLbs > 0 ? '+' : ''}${results.weeklyChangeLbs} lbs/week`
      : `${results.weeklyChangeKg > 0 ? '+' : ''}${results.weeklyChangeKg} kg/week`;

    const text = [
      '── TDEE & Macro Results ──',
      `BMR:        ${results.bmr.toLocaleString()} kcal`,
      `TDEE:       ${results.tdee.toLocaleString()} kcal`,
      `Target:     ${results.targetCalories.toLocaleString()} kcal`,
      '',
      `Protein:    ${results.macros.protein_g.toFixed(1)}g  (${Math.round(results.macros.protein_kcal)} kcal)`,
      `Carbs:      ${results.macros.carbs_g.toFixed(1)}g  (${Math.round(results.macros.carbs_kcal)} kcal)`,
      `Fat:        ${results.macros.fat_g.toFixed(1)}g  (${Math.round(results.macros.fat_kcal)} kcal)`,
      '',
      `BMI:        ${results.bmi} — ${results.bmiCategory.label}`,
      `Weekly Δ:   ${wk}`,
      results.daysToTarget ? `Goal ETA:   ${results.daysToTarget} days (~${Math.round(results.daysToTarget / 7)} weeks)` : '',
      '',
      `Calculated at: ${shareURL}`,
    ].filter(Boolean).join('\n');

    navigator.clipboard.writeText(text).then(() => {
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    });
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'rgba(200,241,53,0.1)',
          border: '1px solid rgba(200,241,53,0.3)',
          color: 'var(--accent)',
          borderRadius: 8, padding: '7px 14px',
          fontSize: 13, fontWeight: 600,
          cursor: 'pointer', transition: 'all 0.18s',
        }}
      >
        <Share2 size={14} />
        Share
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 40 }}
            onClick={() => setOpen(false)}
          />
          {/* Dropdown */}
          <div style={{
            position: 'absolute', top: 'calc(100% + 8px)', right: 0,
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: 12, padding: 6,
            zIndex: 50, minWidth: 200,
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          }}>
            <button
              onClick={copyURL}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                width: '100%', padding: '10px 14px', borderRadius: 8,
                background: copiedURL ? 'rgba(34,197,94,0.1)' : 'transparent',
                border: 'none', color: copiedURL ? '#4ade80' : 'var(--text)',
                fontSize: 13, cursor: 'pointer', textAlign: 'left',
                transition: 'background 0.2s',
              }}
            >
              {copiedURL ? <Check size={15} /> : <Link size={15} color="var(--muted)" />}
              {copiedURL ? 'Link copied!' : 'Copy share link'}
            </button>
            <button
              onClick={copyText}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                width: '100%', padding: '10px 14px', borderRadius: 8,
                background: copiedText ? 'rgba(34,197,94,0.1)' : 'transparent',
                border: 'none', color: copiedText ? '#4ade80' : 'var(--text)',
                fontSize: 13, cursor: 'pointer', textAlign: 'left',
                transition: 'background 0.2s',
              }}
            >
              {copiedText ? <Check size={15} /> : <Copy size={15} color="var(--muted)" />}
              {copiedText ? 'Copied!' : 'Copy results as text'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
