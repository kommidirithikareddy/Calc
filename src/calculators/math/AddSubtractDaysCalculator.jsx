import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'

function Sec({ title, sub, children }) {
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

function Acc({ q, a, open, onToggle, color }) {
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

function DateInp({ label, value, onChange, color }) {
  const [f, sf] = useState(false)
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 6 }}>{label}</label>
      <div style={{ display: 'flex', height: 44, border: `1.5px solid ${f ? color : 'var(--border-2)'}`, borderRadius: 9, overflow: 'hidden', background: 'var(--bg-card)', boxShadow: f ? `0 0 0 3px ${color}18` : 'none' }}>
        <input type="date" value={value} onChange={e => onChange(e.target.value)}
          onFocus={() => sf(true)} onBlur={() => sf(false)}
          style={{ flex: 1, border: 'none', background: 'transparent', padding: '0 14px', fontSize: 14, fontWeight: 600, color: 'var(--text)', outline: 'none' }} />
      </div>
    </div>
  )
}

function NumInp({ label, value, onChange, color, hint }) {
  const [f, sf] = useState(false)
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif" }}>{label}</label>
        {hint && <span style={{ fontSize: 10, color: 'var(--text-3)' }}>{hint}</span>}
      </div>
      <div style={{ display: 'flex', height: 44, border: `1.5px solid ${f ? color : 'var(--border-2)'}`, borderRadius: 9, overflow: 'hidden', background: 'var(--bg-card)' }}>
        <input type="number" value={value} onChange={e => onChange(Number(e.target.value))}
          onFocus={() => sf(true)} onBlur={() => sf(false)}
          style={{ flex: 1, border: 'none', background: 'transparent', padding: '0 14px', fontSize: 17, fontWeight: 700, color: 'var(--text)', outline: 'none', fontFamily: "'Space Grotesk',sans-serif" }} />
      </div>
    </div>
  )
}

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

function addDaysToDate(dateStr, y, m, d, wk) {
  const base = new Date(dateStr)
  if (isNaN(base)) return null
  const result = new Date(base)
  result.setFullYear(result.getFullYear() + y)
  result.setMonth(result.getMonth() + m)
  result.setDate(result.getDate() + d + wk * 7)
  return result
}

const FAQ = [
  { q: 'How do I add months to a date?', a: 'Adding months is not the same as adding 30 days. Adding 1 month to January 31 gives February 28/29 (last day of February), not March 2. This calculator handles month-end clamping correctly — the result is always a valid date.' },
  { q: 'How is "30 days from today" calculated?', a: 'Add exactly 30 × 86,400 seconds to the current date. This always gives the exact date 30 days later, regardless of month lengths. Different from "1 month from today" which adds a calendar month.' },
  { q: 'Why might 3 months + 3 months ≠ 6 months?', a: 'Because month lengths vary. Adding 3 months to January 31 gives April 30 (clamped). Adding another 3 months from April 30 gives July 30. But adding 6 months directly from January 31 gives July 31 — different results. Always prefer adding the full period at once.' },
]

export default function AddSubtractDaysCalculator({ meta, category }) {
  const C = category?.color || '#6366f1'
  const today = new Date().toISOString().split('T')[0]
  const [baseDate, setBaseDate] = useState(today)
  const [op, setOp] = useState('add')
  const [years, setYears] = useState(0)
  const [months, setMonths] = useState(0)
  const [weeks, setWeeks] = useState(0)
  const [days, setDays] = useState(30)
  const [openFaq, setFaq] = useState(null)

  const sign = op === 'add' ? 1 : -1
  const resultDate = addDaysToDate(baseDate, years * sign, months * sign, days * sign, weeks * sign)
  const totalDaysAdded = sign * (years * 365.25 + months * 30.44 + weeks * 7 + days)

  const QUICK_JUMPS = [
    { label: '+7 days', y: 0, m: 0, w: 1, d: 0 },
    { label: '+30 days', y: 0, m: 0, w: 0, d: 30 },
    { label: '+90 days', y: 0, m: 3, w: 0, d: 0 },
    { label: '+6 months', y: 0, m: 6, w: 0, d: 0 },
    { label: '+1 year', y: 1, m: 0, w: 0, d: 0 },
    { label: '+2 years', y: 2, m: 0, w: 0, d: 0 },
  ]

  // Generate nearby dates
  const nearbyDates = [-90, -60, -30, -14, -7, 7, 14, 30, 60, 90].map(n => {
    const d = new Date(baseDate)
    d.setDate(d.getDate() + n)
    return { days: n, date: d }
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ background: `linear-gradient(135deg,${C}12,${C}06)`, border: `1px solid ${C}30`, borderRadius: 14, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Add / Subtract Days Calculator</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>
            {resultDate ? resultDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>
            {resultDate ? `${op === 'add' ? '+' : '-'}${Math.abs(Math.round(totalDaysAdded))} days from ${baseDate}` : ''}
          </div>
        </div>
        <div style={{ padding: '10px 20px', background: C + '18', borderRadius: 12, textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 2 }}>Result</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>
            {resultDate ? `${MONTHS[resultDate.getMonth()].slice(0, 3)} ${resultDate.getDate()}, ${resultDate.getFullYear()}` : '—'}
          </div>
          {resultDate && <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{DAYS_OF_WEEK[resultDate.getDay()]}</div>}
        </div>
      </div>

      {/* Quick jumps */}
      <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 14, padding: '14px 18px' }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 12 }}>Quick jumps from today</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {QUICK_JUMPS.map((qj, i) => (
            <button key={i} onClick={() => { setBaseDate(today); setOp('add'); setYears(qj.y); setMonths(qj.m); setWeeks(qj.w); setDays(qj.d) }}
              style={{ padding: '7px 14px', borderRadius: 20, fontSize: 11, fontWeight: 600, border: `1.5px solid var(--border)`, background: 'var(--bg-raised)', color: C, cursor: 'pointer' }}>
              {qj.label}
            </button>
          ))}
        </div>
      </div>

      <CalcShell
        left={<>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 16, paddingBottom: 8, borderBottom: '0.5px solid var(--border)' }}>Date & Duration</div>
          <DateInp label="Start Date" value={baseDate} onChange={setBaseDate} color={C} />

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>Operation</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {['add', 'subtract'].map(o => (
                <button key={o} onClick={() => setOp(o)} style={{ flex: 1, padding: '10px', borderRadius: 10, border: `1.5px solid ${op === o ? C : 'var(--border)'}`, background: op === o ? C + '12' : 'var(--bg-raised)', cursor: 'pointer', fontSize: 13, fontWeight: op === o ? 700 : 500, color: op === o ? C : 'var(--text-2)' }}>
                  {o === 'add' ? '➕ Add' : '➖ Subtract'}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <NumInp label="Years" value={years} onChange={setYears} color={C} hint="0 to skip" />
            <NumInp label="Months" value={months} onChange={setMonths} color={C} hint="0 to skip" />
            <NumInp label="Weeks" value={weeks} onChange={setWeeks} color={C} hint="0 to skip" />
            <NumInp label="Days" value={days} onChange={setDays} color={C} hint="0 to skip" />
          </div>

          {resultDate && (
            <div style={{ padding: '10px 14px', background: C + '08', borderRadius: 10, border: `1px solid ${C}20`, marginBottom: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C }}>{baseDate} {op === 'add' ? '+' : '−'} {years > 0 ? `${years}y ` : ''}{months > 0 ? `${months}m ` : ''}{weeks > 0 ? `${weeks}w ` : ''}{days > 0 ? `${days}d` : ''}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: C, marginTop: 4 }}>= {resultDate.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            <button style={{ flex: 1, padding: 13, borderRadius: 10, border: 'none', background: C, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Calculate →</button>
            <button onClick={() => { setBaseDate(today); setYears(0); setMonths(0); setWeeks(0); setDays(30); setOp('add') }} style={{ padding: '13px 18px', borderRadius: 10, border: '1.5px solid var(--border-2)', background: 'var(--bg-raised)', color: 'var(--text-2)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Reset</button>
          </div>
        </>}

        right={<>
          {resultDate && <>
            <div style={{ background: 'var(--bg-card)', border: `1.5px solid ${C}30`, borderRadius: 14, padding: '18px 20px', marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: 8 }}>Result Date</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>{resultDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
              <div style={{ fontSize: 14, color: 'var(--text-3)', marginTop: 6 }}>{DAYS_OF_WEEK[resultDate.getDay()]}</div>
              <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>Day {Math.ceil((resultDate - new Date(resultDate.getFullYear(), 0, 0)) / 86400000)} of {resultDate.getFullYear()}</div>
            </div>

            <BreakdownTable title="Result details" rows={[
              { label: 'Start date', value: baseDate, highlight: true },
              { label: 'Operation', value: `${op === 'add' ? '+' : '−'} ${years > 0 ? years + 'y ' : ''}${months > 0 ? months + 'm ' : ''}${weeks > 0 ? weeks + 'w ' : ''}${days}d` },
              { label: 'Result date', value: resultDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }), bold: true, color: C },
              { label: 'Day of week', value: DAYS_OF_WEEK[resultDate.getDay()] },
              { label: 'Day of year', value: `Day ${Math.ceil((resultDate - new Date(resultDate.getFullYear(), 0, 0)) / 86400000)}` },
              { label: 'Week of year', value: `Week ${Math.ceil(Math.ceil((resultDate - new Date(resultDate.getFullYear(), 0, 0)) / 86400000) / 7)}` },
              { label: 'Total days added', value: `${op === 'add' ? '+' : '-'}${Math.round(Math.abs(totalDaysAdded))} days`, highlight: true },
            ]} />
            <AIHintCard hint={`${baseDate} ${op === 'add' ? '+' : '−'} ${years > 0 ? years + 'y ' : ''}${months > 0 ? months + 'm ' : ''}${weeks > 0 ? weeks + 'w ' : ''}${days}d = ${resultDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.`} color={C} />
          </>}
          {!resultDate && (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-3)' }}>Enter a date and duration to calculate</div>
          )}
        </>}
      />

      {/* Nearby dates explorer */}
      <Sec title="📅 Nearby Dates Explorer" sub="Dates relative to your start date">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {nearbyDates.map((nd, i) => (
            <button key={i} onClick={() => { setDays(Math.abs(nd.days)); setWeeks(0); setYears(0); setMonths(0); setOp(nd.days > 0 ? 'add' : 'subtract') }}
              style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-raised)', cursor: 'pointer', textAlign: 'left', transition: 'all .15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C; e.currentTarget.style.background = C + '10' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-raised)' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: nd.days > 0 ? '#10b981' : '#ef4444' }}>{nd.days > 0 ? '+' : ''}{nd.days} days</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{nd.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
              <div style={{ fontSize: 10, color: 'var(--text-3)' }}>{DAYS_OF_WEEK[nd.date.getDay()]}</div>
            </button>
          ))}
        </div>
      </Sec>

      <Sec title="Frequently asked questions">
        {FAQ.map((f, i) => <Acc key={i} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setFaq(openFaq === i ? null : i)} color={C} />)}
      </Sec>
    </div>
  )
}
