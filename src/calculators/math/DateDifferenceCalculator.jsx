// ============================================================
// DATE DIFFERENCE CALCULATOR
// ============================================================
import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'

function SecDD({ title, sub, children }) {
  return (
    <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
      <div style={{ padding: '13px 18px', borderBottom: '0.5px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', fontFamily: "'Space Grotesk',sans-serif" }}>{title}</span>
        {sub && <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{sub}</span>}
      </div>
      <div style={{ padding: '16px 18px' }}>{children}</div>
    </div>
  )
}

function AccDD({ q, a, open, onToggle, color }) {
  return (
    <div style={{ borderBottom: '0.5px solid var(--border)' }}>
      <button onClick={onToggle} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 0', background: 'none', border: 'none', cursor: 'pointer', gap: 12, textAlign: 'left' }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", lineHeight: 1.4 }}>{q}</span>
        <span style={{ fontSize: 18, color, flexShrink: 0, transform: open ? 'rotate(45deg)' : 'none', transition: 'transform .2s' }}>+</span>
      </button>
      {open && <p style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.75, margin: '0 0 13px' }}>{a}</p>}
    </div>
  )
}

function DateInpDD({ label, value, onChange, color, hint }) {
  const [f, sf] = useState(false)
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif" }}>{label}</label>
        {hint && <span style={{ fontSize: 10, color: 'var(--text-3)' }}>{hint}</span>}
      </div>
      <div style={{ display: 'flex', height: 44, border: `1.5px solid ${f ? color : 'var(--border-2)'}`, borderRadius: 9, overflow: 'hidden', background: 'var(--bg-card)', boxShadow: f ? `0 0 0 3px ${color}18` : 'none' }}>
        <input type="date" value={value} onChange={e => onChange(e.target.value)}
          onFocus={() => sf(true)} onBlur={() => sf(false)}
          style={{ flex: 1, border: 'none', background: 'transparent', padding: '0 14px', fontSize: 14, fontWeight: 600, color: 'var(--text)', outline: 'none' }} />
      </div>
    </div>
  )
}

function diffDates(d1, d2) {
  const a = new Date(d1), b = new Date(d2)
  if (isNaN(a) || isNaN(b)) return null
  const [start, end] = a <= b ? [a, b] : [b, a]
  let y = end.getFullYear() - start.getFullYear()
  let m = end.getMonth() - start.getMonth()
  let d = end.getDate() - start.getDate()
  if (d < 0) { m--; d += new Date(end.getFullYear(), end.getMonth(), 0).getDate() }
  if (m < 0) { y--; m += 12 }
  const totalDays = Math.round((b - a) / 86400000)
  return { years: y, months: m, days: d, totalDays, totalWeeks: Math.floor(Math.abs(totalDays) / 7), remainder: Math.abs(totalDays) % 7, totalHours: totalDays * 24, totalMonths: y * 12 + m }
}

const PRESET_RANGES = [
  { label: 'Start of 2024 → End of 2024', d1: '2024-01-01', d2: '2024-12-31' },
  { label: 'Moon landing 1969 → Today', d1: '1969-07-20', d2: new Date().toISOString().split('T')[0] },
  { label: '100 days ago → Today', d1: new Date(Date.now() - 100 * 86400000).toISOString().split('T')[0], d2: new Date().toISOString().split('T')[0] },
]

const FAQ_DD = [
  { q: 'How is date difference calculated?', a: 'The difference is calculated as calendar days between two dates — the number of midnight boundaries crossed. One day = 86,400 seconds exactly (ignoring daylight saving changes). For years/months/days breakdown, it counts complete calendar months and years, similar to how age is calculated.' },
  { q: 'Does the calculator include the end date?', a: "By default, the result is the number of days between the two dates (exclusive of the end date). From Jan 1 to Jan 3 = 2 days. If you want to count both endpoints ('inclusive'), add 1 to the result. This matters for project duration calculations." },
  { q: 'How do I calculate business days between two dates?', a: 'Use the Working Days Calculator which accounts for weekends and optionally public holidays. Simple business day count = total days × 5/7 (approximate). Exact count requires checking each day of the week in the range.' },
]

export default function DateDifferenceCalculator({ meta, category }) {
  const C = category?.color || '#6366f1'
  const today = new Date().toISOString().split('T')[0]
  const [d1, setD1] = useState('2020-01-01')
  const [d2, setD2] = useState(today)
  const [openFaq, setFaq] = useState(null)

  const diff = diffDates(d1, d2)
  const isForward = diff ? diff.totalDays >= 0 : true

  const TIMELINE_EVENTS = diff ? [
    { label: 'Start date', date: d1, pos: 0 },
    { label: 'Midpoint', date: new Date((new Date(d1).getTime() + new Date(d2).getTime()) / 2).toISOString().split('T')[0], pos: 50 },
    { label: 'End date', date: d2, pos: 100 },
  ] : []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ background: `linear-gradient(135deg,${C}12,${C}06)`, border: `1px solid ${C}30`, borderRadius: 14, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Date Difference Calculator</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>
            {diff ? `${diff.years}y ${diff.months}m ${diff.days}d` : '—'}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>{diff ? `${Math.abs(diff.totalDays).toLocaleString()} days ${isForward ? 'forward' : 'backward'}` : 'Select two dates'}</div>
        </div>
        <div style={{ padding: '10px 20px', background: C + '18', borderRadius: 12, textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 2 }}>Total days</div>
          <div style={{ fontSize: 36, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>{diff ? Math.abs(diff.totalDays).toLocaleString() : '—'}</div>
        </div>
      </div>

      <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 14, padding: '14px 18px' }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 12 }}>Quick presets</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {PRESET_RANGES.map((pr, i) => (
            <button key={i} onClick={() => { setD1(pr.d1); setD2(pr.d2) }}
              style={{ padding: '9px 14px', borderRadius: 10, border: `1.5px solid ${d1 === pr.d1 && d2 === pr.d2 ? C : 'var(--border-2)'}`, background: d1 === pr.d1 && d2 === pr.d2 ? C + '12' : 'var(--bg-raised)', cursor: 'pointer', textAlign: 'left', fontSize: 11, fontWeight: 600, color: d1 === pr.d1 && d2 === pr.d2 ? C : 'var(--text)' }}>
              {pr.label}
            </button>
          ))}
        </div>
      </div>

      <CalcShell
        left={<>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 16, paddingBottom: 8, borderBottom: '0.5px solid var(--border)' }}>Select Two Dates</div>
          <DateInpDD label="Start Date" value={d1} onChange={setD1} color={C} />
          <DateInpDD label="End Date" value={d2} onChange={setD2} color={C} />
          <button onClick={() => { const tmp = d1; setD1(d2); setD2(tmp) }} style={{ width: '100%', padding: '9px', borderRadius: 9, border: `1px solid ${C}30`, background: C + '08', color: C, fontSize: 12, fontWeight: 600, cursor: 'pointer', marginBottom: 14 }}>
            ⇅ Swap dates
          </button>
          {diff && (
            <div style={{ padding: '12px 14px', background: C + '08', borderRadius: 10, border: `1px solid ${C}20`, marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 4 }}>Exact difference</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>
                {diff.years > 0 ? `${diff.years} year${diff.years > 1 ? 's' : ''}, ` : ''}{diff.months > 0 ? `${diff.months} month${diff.months > 1 ? 's' : ''}, ` : ''}{diff.days} day{diff.days !== 1 ? 's' : ''}
              </div>
            </div>
          )}
          <div style={{ display: 'flex', gap: 10 }}>
            <button style={{ flex: 1, padding: 13, borderRadius: 10, border: 'none', background: C, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Calculate →</button>
            <button onClick={() => { setD1('2020-01-01'); setD2(today) }} style={{ padding: '13px 18px', borderRadius: 10, border: '1.5px solid var(--border-2)', background: 'var(--bg-raised)', color: 'var(--text-2)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Reset</button>
          </div>
        </>}
        right={<>
          <div style={{ background: 'var(--bg-card)', border: `1.5px solid ${C}30`, borderRadius: 14, padding: '18px 20px', marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: 12 }}>Difference</div>
            {diff && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
                {[['Years', diff.years, C], ['Months', diff.months, '#10b981'], ['Days', diff.days, '#f59e0b']].map(([l, v, col]) => (
                  <div key={l} style={{ textAlign: 'center', padding: '10px', background: col + '10', borderRadius: 10 }}>
                    <div style={{ fontSize: 28, fontWeight: 700, color: col, fontFamily: "'Space Grotesk',sans-serif" }}>{v}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-3)' }}>{l}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {diff && <>
            <BreakdownTable title="All units" rows={[
              { label: 'Total days', value: Math.abs(diff.totalDays).toLocaleString(), bold: true, highlight: true, color: C },
              { label: 'Total weeks + days', value: `${diff.totalWeeks.toLocaleString()}w ${diff.remainder}d` },
              { label: 'Total months', value: Math.abs(diff.totalMonths).toLocaleString() },
              { label: 'Total hours', value: Math.abs(diff.totalHours).toLocaleString() },
              { label: 'Direction', value: isForward ? '→ Forward' : '← Backward', color: isForward ? '#10b981' : '#ef4444' },
            ]} />
            <AIHintCard hint={`${d1} to ${d2} = ${Math.abs(diff.totalDays).toLocaleString()} days (${diff.totalWeeks}w ${diff.remainder}d). That's ${diff.years} years, ${diff.months} months and ${diff.days} days.`} color={C} />
          </>}
        </>}
      />

      {/* Timeline visual */}
      {diff && (
        <SecDD title="📅 Visual Timeline" sub={`${d1} → ${d2}`}>
          <div style={{ position: 'relative', height: 60, margin: '10px 0 20px' }}>
            <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 4, background: C + '30', borderRadius: 2, transform: 'translateY(-50%)' }} />
            <div style={{ position: 'absolute', top: '50%', left: 0, width: '100%', height: 4, background: C, borderRadius: 2, transform: 'translateY(-50%)', transition: 'width .4s' }} />
            {TIMELINE_EVENTS.map((ev, i) => (
              <div key={i} style={{ position: 'absolute', left: `${ev.pos}%`, top: '50%', transform: 'translate(-50%, -50%)' }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: C, border: '2px solid var(--bg-card)', marginBottom: 4 }} />
                <div style={{ fontSize: 9, color: C, fontWeight: 700, whiteSpace: 'nowrap', textAlign: 'center', marginTop: 14 }}>{ev.label}</div>
                <div style={{ fontSize: 8, color: 'var(--text-3)', textAlign: 'center' }}>{ev.date}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginTop: 8 }}>
            {[['Weekdays', Math.round(Math.abs(diff.totalDays) * 5 / 7)], ['Weekends', Math.round(Math.abs(diff.totalDays) * 2 / 7)], ['Full weeks', diff.totalWeeks]].map(([l, v]) => (
              <div key={l} style={{ padding: '10px', background: 'var(--bg-raised)', borderRadius: 9, textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: C }}>{v.toLocaleString()}</div>
                <div style={{ fontSize: 10, color: 'var(--text-3)' }}>{l}</div>
              </div>
            ))}
          </div>
        </SecDD>
      )}

      <SecDD title="Frequently asked questions">
        {FAQ_DD.map((f, i) => <AccDD key={i} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setFaq(openFaq === i ? null : i)} color={C} />)}
      </SecDD>
    </div>
  )
}
