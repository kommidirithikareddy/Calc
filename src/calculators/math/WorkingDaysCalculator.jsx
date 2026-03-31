// ============================================================
// WORKING DAYS CALCULATOR
// ============================================================
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

// US Federal Holidays 2024-2025 (static list)
const US_HOLIDAYS_2025 = [
  '2025-01-01', '2025-01-20', '2025-02-17', '2025-05-26',
  '2025-06-19', '2025-07-04', '2025-09-01', '2025-10-13',
  '2025-11-11', '2025-11-27', '2025-12-25',
]
const US_HOLIDAYS_2024 = [
  '2024-01-01', '2024-01-15', '2024-02-19', '2024-05-27',
  '2024-06-19', '2024-07-04', '2024-09-02', '2024-10-14',
  '2024-11-11', '2024-11-28', '2024-12-25',
]
const ALL_HOLIDAYS = new Set([...US_HOLIDAYS_2024, ...US_HOLIDAYS_2025])

function countWorkingDays(startStr, endStr, excludeHolidays, workSat, workSun) {
  const start = new Date(startStr), end = new Date(endStr)
  if (isNaN(start) || isNaN(end) || start > end) return null
  let count = 0, weekends = 0, holidays = 0
  const curr = new Date(start)
  const dayBreakdown = []
  while (curr <= end) {
    const day = curr.getDay()
    const dateStr = curr.toISOString().split('T')[0]
    const isSat = day === 6, isSun = day === 0
    const isHol = excludeHolidays && ALL_HOLIDAYS.has(dateStr)
    const isWorking = !isHol && !(isSat && !workSat) && !(isSun && !workSun)
    if (isWorking) count++
    if ((isSat && !workSat) || (isSun && !workSun)) weekends++
    if (isHol) holidays++
    curr.setDate(curr.getDate() + 1)
  }
  const totalDays = Math.round((end - start) / 86400000) + 1
  return { workingDays: count, weekends, holidays, totalDays, nonWorkingDays: totalDays - count }
}

function addWorkingDays(startStr, n, excludeHolidays, workSat, workSun) {
  const start = new Date(startStr)
  if (isNaN(start)) return null
  let count = 0
  const curr = new Date(start)
  const sign = n >= 0 ? 1 : -1
  const target = Math.abs(n)
  while (count < target) {
    curr.setDate(curr.getDate() + sign)
    const day = curr.getDay()
    const dateStr = curr.toISOString().split('T')[0]
    const isSat = day === 6, isSun = day === 0
    const isHol = excludeHolidays && ALL_HOLIDAYS.has(dateStr)
    if (!isHol && !(isSat && !workSat) && !(isSun && !workSun)) count++
  }
  return curr
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const FAQ = [
  { q: 'What counts as a working day?', a: 'By default, working days are Monday through Friday, excluding public holidays. Some industries (retail, healthcare, finance) operate on weekends. This calculator lets you include Saturday and/or Sunday as working days for your specific situation.' },
  { q: 'How do I calculate a deadline that is 30 business days away?', a: 'Use the "Add working days" mode — enter your start date and 30 working days. The calculator skips weekends and holidays automatically to give you the exact deadline date, even if it falls months away.' },
  { q: 'Are public holidays the same in every country?', a: 'No — every country, and often every region, has different public holidays. This calculator uses US Federal Holidays. For other countries, you can toggle off "Exclude holidays" and manually count. A full international holiday database would require live data.' },
]

export default function WorkingDaysCalculator({ meta, category }) {
  const C = category?.color || '#6366f1'
  const today = new Date().toISOString().split('T')[0]
  const [mode, setMode] = useState('count') // count | add
  const [d1, setD1] = useState(today)
  const [d2, setD2] = useState(new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0])
  const [workDaysToAdd, setWorkDaysToAdd] = useState(30)
  const [excludeHolidays, setExcludeHolidays] = useState(true)
  const [workSat, setWorkSat] = useState(false)
  const [workSun, setWorkSun] = useState(false)
  const [openFaq, setFaq] = useState(null)

  const result = mode === 'count' ? countWorkingDays(d1, d2, excludeHolidays, workSat, workSun) : null
  const addResult = mode === 'add' ? addWorkingDays(d1, workDaysToAdd, excludeHolidays, workSat, workSun) : null

  // Calendar view for current month
  const viewDate = new Date(d1)
  const year = viewDate.getFullYear(), month = viewDate.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ background: `linear-gradient(135deg,${C}12,${C}06)`, border: `1px solid ${C}30`, borderRadius: 14, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Working Days Calculator</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>
            {mode === 'count' && result ? `${result.workingDays} working days` : addResult ? addResult.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : '—'}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>
            {mode === 'count' && result ? `${result.weekends} weekend days · ${result.holidays} holidays excluded` : mode === 'add' ? `${workDaysToAdd} working days from ${d1}` : ''}
          </div>
        </div>
        <div style={{ padding: '10px 20px', background: C + '18', borderRadius: 12, textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 2 }}>{mode === 'count' ? 'Working days' : 'Target date'}</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>
            {mode === 'count' && result ? result.workingDays : addResult ? addResult.getDate() : '—'}
          </div>
          {mode === 'add' && addResult && <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{addResult.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</div>}
        </div>
      </div>

      {/* Mode toggle */}
      <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 14, padding: '14px 18px' }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 12 }}>Mode</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[['count', 'Count working days between dates'], ['add', 'Add working days to a date']].map(([k, l]) => (
            <button key={k} onClick={() => setMode(k)} style={{ flex: 1, padding: '10px', borderRadius: 10, border: `1.5px solid ${mode === k ? C : 'var(--border)'}`, background: mode === k ? C + '12' : 'var(--bg-raised)', cursor: 'pointer', fontSize: 11, fontWeight: mode === k ? 700 : 500, color: mode === k ? C : 'var(--text-2)' }}>{l}</button>
          ))}
        </div>
      </div>

      <CalcShell
        left={<>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 16, paddingBottom: 8, borderBottom: '0.5px solid var(--border)' }}>Parameters</div>
          <DateInp label={mode === 'count' ? 'Start Date' : 'Start Date'} value={d1} onChange={setD1} color={C} />
          {mode === 'count'
            ? <DateInp label="End Date" value={d2} onChange={setD2} color={C} />
            : (
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 6 }}>Working days to add</label>
                <div style={{ display: 'flex', height: 44, border: `1.5px solid ${C}40`, borderRadius: 9, overflow: 'hidden', background: 'var(--bg-card)' }}>
                  <input type="number" value={workDaysToAdd} onChange={e => setWorkDaysToAdd(Number(e.target.value))} style={{ flex: 1, border: 'none', background: 'transparent', padding: '0 14px', fontSize: 17, fontWeight: 700, color: 'var(--text)', outline: 'none', fontFamily: "'Space Grotesk',sans-serif" }} />
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                  {[5, 10, 20, 30, 60, 90].map(n => (
                    <button key={n} onClick={() => setWorkDaysToAdd(n)} style={{ padding: '5px 10px', borderRadius: 20, fontSize: 10, fontWeight: 600, border: '1.5px solid', borderColor: workDaysToAdd === n ? C : 'var(--border)', background: workDaysToAdd === n ? C : 'var(--bg-raised)', color: workDaysToAdd === n ? '#fff' : 'var(--text-2)', cursor: 'pointer' }}>{n}d</button>
                  ))}
                </div>
              </div>
            )
          }

          {/* Work week settings */}
          <div style={{ padding: '12px 14px', background: 'var(--bg-raised)', borderRadius: 10, border: '0.5px solid var(--border)', marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>Work week settings</div>
            {[
              { label: 'Include Saturday', val: workSat, set: setWorkSat },
              { label: 'Include Sunday', val: workSun, set: setWorkSun },
              { label: 'Exclude US holidays', val: excludeHolidays, set: setExcludeHolidays },
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: 'var(--text)' }}>{s.label}</span>
                <button onClick={() => s.set(v => !v)} style={{ width: 44, height: 24, borderRadius: 12, border: 'none', background: s.val ? C : 'var(--border)', cursor: 'pointer', position: 'relative', transition: 'background .2s' }}>
                  <div style={{ position: 'absolute', top: 2, left: s.val ? 22 : 2, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,.2)' }} />
                </button>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button style={{ flex: 1, padding: 13, borderRadius: 10, border: 'none', background: C, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Calculate →</button>
            <button onClick={() => { setD1(today); setD2(new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]); setWorkDaysToAdd(30) }} style={{ padding: '13px 18px', borderRadius: 10, border: '1.5px solid var(--border-2)', background: 'var(--bg-raised)', color: 'var(--text-2)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Reset</button>
          </div>
        </>}

        right={<>
          {mode === 'count' && result ? <>
            <div style={{ background: 'var(--bg-card)', border: `1.5px solid ${C}30`, borderRadius: 14, padding: '18px 20px', marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: 12 }}>Day breakdown</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
                {[['Working', result.workingDays, C], ['Weekends', result.weekends, '#f59e0b'], ['Holidays', result.holidays, '#ef4444']].map(([l, v, col]) => (
                  <div key={l} style={{ textAlign: 'center', padding: '10px', background: col + '10', borderRadius: 10 }}>
                    <div style={{ fontSize: 28, fontWeight: 700, color: col, fontFamily: "'Space Grotesk',sans-serif" }}>{v}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-3)' }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
            <BreakdownTable title="Full breakdown" rows={[
              { label: 'Working days', value: result.workingDays.toString(), bold: true, highlight: true, color: C },
              { label: 'Total calendar days', value: result.totalDays.toString() },
              { label: 'Weekend days', value: result.weekends.toString(), color: '#f59e0b' },
              { label: 'Holidays', value: result.holidays.toString(), color: '#ef4444' },
              { label: 'Non-working days', value: result.nonWorkingDays.toString() },
              { label: '% working', value: `${((result.workingDays / result.totalDays) * 100).toFixed(1)}%` },
            ]} />
            <AIHintCard hint={`Between ${d1} and ${d2}: ${result.workingDays} working days out of ${result.totalDays} total. ${result.weekends} weekend days and ${result.holidays} holidays excluded.`} color={C} />
          </> : mode === 'add' && addResult ? <>
            <div style={{ background: 'var(--bg-card)', border: `1.5px solid ${C}30`, borderRadius: 14, padding: '18px 20px', marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: 8 }}>Result: {workDaysToAdd} working days from {d1}</div>
              <div style={{ fontSize: 26, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>{addResult.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</div>
            </div>
            <BreakdownTable title="Deadline details" rows={[
              { label: 'Start date', value: d1 },
              { label: 'Working days added', value: workDaysToAdd.toString(), color: C },
              { label: 'Result date', value: addResult.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }), bold: true, color: C, highlight: true },
              { label: 'Day of week', value: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][addResult.getDay()] },
            ]} />
            <AIHintCard hint={`${workDaysToAdd} working days from ${d1} = ${addResult.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}.`} color={C} />
          </> : <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-3)' }}>Enter dates to calculate</div>}
        </>}
      />

      {/* Mini calendar */}
      <Sec title="📅 Calendar View" sub={`${['January','February','March','April','May','June','July','August','September','October','November','December'][month]} ${year}`}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4, marginBottom: 8 }}>
          {DAYS.map(d => <div key={d} style={{ textAlign: 'center', fontSize: 10, fontWeight: 700, color: 'var(--text-3)', padding: '4px 0' }}>{d}</div>)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4 }}>
          {Array.from({ length: firstDay }, (_, i) => <div key={'e' + i} />)}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const dayNum = i + 1
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`
            const dayOfWeek = new Date(dateStr).getDay()
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
            const isHoliday = ALL_HOLIDAYS.has(dateStr)
            const isStart = dateStr === d1, isEnd = dateStr === d2
            const inRange = mode === 'count' && dateStr >= d1 && dateStr <= d2
            const isWorkingInRange = inRange && !isWeekend && !(excludeHolidays && isHoliday)
            return (
              <div key={dayNum} style={{ textAlign: 'center', padding: '5px 2px', borderRadius: 6, fontSize: 11, fontWeight: (isStart || isEnd) ? 700 : 400, background: isStart || isEnd ? C : isHoliday ? '#ef444415' : isWorkingInRange ? C + '20' : inRange ? '#f59e0b10' : 'transparent', color: isStart || isEnd ? '#fff' : isHoliday ? '#ef4444' : isWeekend ? '#f59e0b' : 'var(--text)', border: isHoliday && !isStart && !isEnd ? '1px solid #ef444430' : 'none' }}>
                {dayNum}
              </div>
            )
          })}
        </div>
        <div style={{ display: 'flex', gap: 14, marginTop: 10, flexWrap: 'wrap', fontSize: 10 }}>
          {[[C, 'Selected dates'], [C + '20', 'Working days in range'], ['#f59e0b', 'Weekend'], ['#ef4444', 'Holiday']].map(([col, label]) => (
            <div key={label} style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: col }} />
              <span style={{ color: 'var(--text-3)' }}>{label}</span>
            </div>
          ))}
        </div>
      </Sec>

      <Sec title="Frequently asked questions">
        {FAQ.map((f, i) => <Acc key={i} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setFaq(openFaq === i ? null : i)} color={C} />)}
      </Sec>
    </div>
  )
}
