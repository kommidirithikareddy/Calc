import { useState, useEffect } from 'react'
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
      {open && <p style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.75, margin: '0 0 13px', fontFamily: "'DM Sans',sans-serif" }}>{a}</p>}
    </div>
  )
}

function DateInp({ label, value, onChange, color, hint }) {
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
          style={{ flex: 1, border: 'none', background: 'transparent', padding: '0 14px', fontSize: 14, fontWeight: 600, color: 'var(--text)', outline: 'none', fontFamily: "'DM Sans',sans-serif" }} />
      </div>
    </div>
  )
}

function diffDate(d1, d2) {
  const start = new Date(d1), end = new Date(d2)
  if (isNaN(start) || isNaN(end)) return null
  let y = end.getFullYear() - start.getFullYear()
  let m = end.getMonth() - start.getMonth()
  let d = end.getDate() - start.getDate()
  if (d < 0) { m--; const prev = new Date(end.getFullYear(), end.getMonth(), 0); d += prev.getDate() }
  if (m < 0) { y--; m += 12 }
  const totalDays = Math.round((end - start) / 86400000)
  const totalWeeks = Math.floor(Math.abs(totalDays) / 7)
  const totalMonths = y * 12 + m
  const totalHours = totalDays * 24
  const totalMinutes = totalDays * 1440
  const totalSeconds = totalDays * 86400
  return { years: y, months: m, days: d, totalDays, totalWeeks, totalMonths, totalHours, totalMinutes, totalSeconds }
}

const FAMOUS_BIRTHDAYS = [
  { name: 'Albert Einstein', dob: '1879-03-14' },
  { name: 'Marie Curie', dob: '1867-11-07' },
  { name: 'Nikola Tesla', dob: '1856-07-10' },
  { name: 'Stephen Hawking', dob: '1942-01-08' },
]

const FAQ = [
  { q: 'How is age calculated exactly?', a: 'Age is calculated by counting complete years, months, and days from the birth date to today (or a target date). A year is complete only when the same month and day have passed. So someone born on March 14 is still 24 until March 14 of the next year, even if it is March 13.' },
  { q: 'What is a leap year and how does it affect birthdays?', a: 'A leap year occurs every 4 years (with exceptions for century years). People born on February 29 technically have a birthday only every 4 years. For age calculation, their birthday is usually observed on February 28 or March 1 in non-leap years.' },
  { q: 'What is the difference between chronological and biological age?', a: 'Chronological age is the exact time since birth — what this calculator computes. Biological age reflects how old your body actually is based on health markers, lifestyle, and genetics. You can be 40 chronologically but have the biological markers of a 30-year-old through diet, exercise, and good habits.' },
  { q: 'How many days old am I?', a: 'Multiply your age in years by 365, add days for leap years (approximately age/4), then add the days since your last birthday. The calculator computes this exactly. An average 30-year-old is about 10,957 days old. Each year you add ~365.25 days.' },
]

export default function AgeCalculator({ meta, category }) {
  const C = category?.color || '#6366f1'
  const today = new Date().toISOString().split('T')[0]
  const [dob, setDob] = useState('1995-06-15')
  const [refDate, setRefDate] = useState(today)
  const [useCustom, setUseCustom] = useState(false)
  const [openFaq, setFaq] = useState(null)
  const [tick, setTick] = useState(0)

  // Live tick every second
  useEffect(() => {
    if (!useCustom) {
      const id = setInterval(() => setTick(t => t + 1), 1000)
      return () => clearInterval(id)
    }
  }, [useCustom])

  const calcDate = useCustom ? refDate : new Date().toISOString().split('T')[0]
  const diff = diffDate(dob, calcDate)
  const birthDate = new Date(dob)
  const calcDateObj = new Date(calcDate)

  // Next birthday
  let nextBday = new Date(calcDateObj.getFullYear(), birthDate.getMonth(), birthDate.getDate())
  if (nextBday <= calcDateObj) nextBday.setFullYear(nextBday.getFullYear() + 1)
  const daysToNext = Math.ceil((nextBday - calcDateObj) / 86400000)

  // Day of week born
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const dayBorn = days[birthDate.getDay()]

  // Zodiac
  const zodiac = (() => {
    const m = birthDate.getMonth() + 1, d = birthDate.getDate()
    if ((m === 3 && d >= 21) || (m === 4 && d <= 19)) return '♈ Aries'
    if ((m === 4 && d >= 20) || (m === 5 && d <= 20)) return '♉ Taurus'
    if ((m === 5 && d >= 21) || (m === 6 && d <= 20)) return '♊ Gemini'
    if ((m === 6 && d >= 21) || (m === 7 && d <= 22)) return '♋ Cancer'
    if ((m === 7 && d >= 23) || (m === 8 && d <= 22)) return '♌ Leo'
    if ((m === 8 && d >= 23) || (m === 9 && d <= 22)) return '♍ Virgo'
    if ((m === 9 && d >= 23) || (m === 10 && d <= 22)) return '♎ Libra'
    if ((m === 10 && d >= 23) || (m === 11 && d <= 21)) return '♏ Scorpio'
    if ((m === 11 && d >= 22) || (m === 12 && d <= 21)) return '♐ Sagittarius'
    if ((m === 12 && d >= 22) || (m === 1 && d <= 19)) return '♑ Capricorn'
    if ((m === 1 && d >= 20) || (m === 2 && d <= 18)) return '♒ Aquarius'
    return '♓ Pisces'
  })()

  // Chinese zodiac
  const chineseZodiac = ['🐀 Rat', '🐂 Ox', '🐯 Tiger', '🐇 Rabbit', '🐉 Dragon', '🐍 Snake', '🐎 Horse', '🐑 Goat', '🐒 Monkey', '🐓 Rooster', '🐕 Dog', '🐖 Pig']
  const chineseSign = chineseZodiac[(birthDate.getFullYear() - 4) % 12]

  // Life progress bar (based on 80 years avg)
  const lifeProgress = diff ? Math.min(100, (diff.totalDays / (80 * 365.25)) * 100) : 0

  // Milestones
  const milestones = diff ? [
    { label: '10,000 days', days: 10000, date: new Date(birthDate.getTime() + 10000 * 86400000) },
    { label: '25 years', days: 25 * 365.25, date: new Date(birthDate.getTime() + 25 * 365.25 * 86400000) },
    { label: '50 years', days: 50 * 365.25, date: new Date(birthDate.getTime() + 50 * 365.25 * 86400000) },
    { label: '1 billion seconds', days: 1e9 / 86400, date: new Date(birthDate.getTime() + 1e9 * 1000) },
  ] : []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Banner */}
      <div style={{ background: `linear-gradient(135deg,${C}12,${C}06)`, border: `1px solid ${C}30`, borderRadius: 14, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Age Calculator</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>
            {diff ? `${diff.years} years, ${diff.months} months, ${diff.days} days` : '—'}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>
            {diff ? `${Math.abs(diff.totalDays).toLocaleString()} days total · Born ${dayBorn}` : 'Enter a date of birth'}
          </div>
        </div>
        <div style={{ padding: '10px 20px', background: C + '18', borderRadius: 12, textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 2 }}>Age</div>
          <div style={{ fontSize: 42, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif", lineHeight: 1 }}>
            {diff ? diff.years : '—'}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-3)' }}>years old</div>
        </div>
      </div>

      {/* Famous birthdays quick-load */}
      <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 14, padding: '14px 18px' }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 12 }}>Try a famous birthday</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
          {FAMOUS_BIRTHDAYS.map((fb, i) => (
            <button key={i} onClick={() => setDob(fb.dob)}
              style={{ padding: '9px 6px', borderRadius: 10, border: `1.5px solid ${dob === fb.dob ? C : 'var(--border-2)'}`, background: dob === fb.dob ? C + '12' : 'var(--bg-raised)', cursor: 'pointer', textAlign: 'center' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: C, marginBottom: 2 }}>{fb.name}</div>
              <div style={{ fontSize: 9, color: 'var(--text-3)' }}>{fb.dob}</div>
            </button>
          ))}
        </div>
      </div>

      <CalcShell
        left={<>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 16, paddingBottom: 8, borderBottom: '0.5px solid var(--border)' }}>Date of Birth</div>
          <DateInp label="Date of Birth" value={dob} onChange={setDob} color={C} />

          <div style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif" }}>Calculate age as of</span>
              <button onClick={() => setUseCustom(v => !v)} style={{ padding: '4px 10px', borderRadius: 6, border: `1px solid ${C}`, background: useCustom ? C : 'transparent', color: useCustom ? '#fff' : C, fontSize: 10, fontWeight: 700, cursor: 'pointer' }}>
                {useCustom ? 'Custom date' : 'Today (live)'}
              </button>
            </div>
            {useCustom
              ? <DateInp label="Reference date" value={refDate} onChange={setRefDate} color={C} />
              : <div style={{ padding: '10px 14px', background: C + '08', borderRadius: 9, border: `1px solid ${C}20` }}>
                <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Live — updates every second</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C }}>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
              </div>
            }
          </div>

          {/* Personal facts */}
          {diff && (
            <div style={{ padding: '12px 14px', background: 'var(--bg-raised)', borderRadius: 10, border: '0.5px solid var(--border)', marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Personal facts</div>
              {[
                ['Born on', dayBorn],
                ['Zodiac', zodiac],
                ['Chinese zodiac', chineseSign],
                ['Next birthday in', `${daysToNext} days`],
                ['Next birthday', nextBday.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', borderBottom: '0.5px solid var(--border)' }}>
                  <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{k}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: C }}>{v}</span>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            <button style={{ flex: 1, padding: 13, borderRadius: 10, border: 'none', background: C, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Calculate →</button>
            <button onClick={() => { setDob('1995-06-15'); setUseCustom(false) }} style={{ padding: '13px 18px', borderRadius: 10, border: '1.5px solid var(--border-2)', background: 'var(--bg-raised)', color: 'var(--text-2)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Reset</button>
          </div>
        </>}

        right={<>
          <div style={{ background: 'var(--bg-card)', border: `1.5px solid ${C}30`, borderRadius: 14, padding: '18px 20px', marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 12 }}>Exact Age</div>
            {diff ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
                {[['Years', diff.years, C], ['Months', diff.months, '#10b981'], ['Days', diff.days, '#f59e0b']].map(([label, val, col]) => (
                  <div key={label} style={{ textAlign: 'center', padding: '10px', background: col + '10', borderRadius: 10 }}>
                    <div style={{ fontSize: 28, fontWeight: 700, color: col, fontFamily: "'Space Grotesk',sans-serif" }}>{val}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-3)' }}>{label}</div>
                  </div>
                ))}
              </div>
            ) : <div style={{ fontSize: 14, color: 'var(--text-3)' }}>Enter a date of birth above</div>}
          </div>

          <BreakdownTable title="Age in all units" rows={diff ? [
            { label: 'Years', value: diff.years.toLocaleString(), bold: true, highlight: true, color: C },
            { label: 'Total months', value: diff.totalMonths.toLocaleString() },
            { label: 'Total weeks', value: diff.totalWeeks.toLocaleString() },
            { label: 'Total days', value: Math.abs(diff.totalDays).toLocaleString(), color: C },
            { label: 'Total hours', value: Math.abs(diff.totalHours).toLocaleString() },
            { label: 'Total minutes', value: Math.abs(diff.totalMinutes).toLocaleString() },
            { label: 'Total seconds', value: Math.abs(diff.totalSeconds).toLocaleString() },
          ] : []} />
          {diff && <AIHintCard hint={`You are ${diff.years} years, ${diff.months} months and ${diff.days} days old — ${Math.abs(diff.totalDays).toLocaleString()} days total. Your next birthday is in ${daysToNext} days. Zodiac: ${zodiac}.`} color={C} />}
        </>}
      />

      {/* Life progress */}
      {diff && (
        <Sec title="⏳ Life Progress — Visual Timeline" sub="Based on 80-year average lifespan">
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>Life elapsed</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: C }}>{lifeProgress.toFixed(1)}%</span>
            </div>
            <div style={{ height: 16, background: 'var(--bg-raised)', borderRadius: 8, overflow: 'hidden', position: 'relative' }}>
              <div style={{ height: '100%', width: `${lifeProgress}%`, background: `linear-gradient(90deg, ${C}80, ${C})`, borderRadius: 8, transition: 'width .5s' }} />
              {[25, 50, 75].map(pct => (
                <div key={pct} style={{ position: 'absolute', left: `${pct}%`, top: 0, bottom: 0, width: 1, background: 'var(--border)', opacity: 0.5 }} />
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: 'var(--text-3)', marginTop: 4 }}>
              <span>Birth</span><span>20</span><span>40</span><span>60</span><span>80</span>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { label: 'Days lived', value: Math.abs(diff.totalDays).toLocaleString(), color: C },
              { label: 'Days remaining (to 80)', value: Math.max(0, Math.round(80 * 365.25 - Math.abs(diff.totalDays))).toLocaleString(), color: '#10b981' },
              { label: 'Heartbeats (est.)', value: Math.round(Math.abs(diff.totalMinutes) * 70).toLocaleString(), color: '#ef4444' },
              { label: 'Breaths taken (est.)', value: Math.round(Math.abs(diff.totalMinutes) * 16).toLocaleString(), color: '#8b5cf6' },
            ].map((s, i) => (
              <div key={i} style={{ padding: '10px 12px', background: s.color + '08', borderRadius: 9, border: `1px solid ${s.color}20` }}>
                <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 3 }}>{s.label}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: s.color, fontFamily: "'Space Grotesk',sans-serif" }}>{s.value}</div>
              </div>
            ))}
          </div>
        </Sec>
      )}

      {/* Milestones */}
      {diff && (
        <Sec title="🎯 Age Milestones — Past & Upcoming" sub="Special days in your life">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {milestones.map((m, i) => {
              const isPast = m.date <= calcDateObj
              const daysAway = Math.round((m.date - calcDateObj) / 86400000)
              return (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: 10, background: isPast ? '#10b98110' : C + '08', border: `1px solid ${isPast ? '#10b98130' : C + '25'}` }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: isPast ? '#10b981' : C }}>{m.label}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-3)' }}>{m.date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: isPast ? '#10b981' : C }}>{isPast ? '✓ Passed' : `in ${daysAway.toLocaleString()} days`}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </Sec>
      )}

      {/* Decade context */}
      <Sec title="📅 Historical context — what happened in your birth year">
        {birthDate && (
          <div style={{ padding: '14px', background: C + '08', borderRadius: 10, border: `1px solid ${C}25`, marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C, marginBottom: 6 }}>Born in {birthDate.getFullYear()}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                ['Generation', birthDate.getFullYear() >= 2010 ? 'Generation Alpha' : birthDate.getFullYear() >= 1997 ? 'Generation Z' : birthDate.getFullYear() >= 1981 ? 'Millennial' : birthDate.getFullYear() >= 1965 ? 'Generation X' : birthDate.getFullYear() >= 1946 ? 'Baby Boomer' : 'Silent Generation'],
                ['Decade', `${Math.floor(birthDate.getFullYear() / 10) * 10}s`],
                ['Century', birthDate.getFullYear() >= 2000 ? '21st century' : '20th century'],
                ['Millennium', birthDate.getFullYear() >= 2000 ? '3rd millennium' : '2nd millennium'],
              ].map(([k, v]) => (
                <div key={k} style={{ padding: '8px 10px', background: 'var(--bg-raised)', borderRadius: 8 }}>
                  <div style={{ fontSize: 10, color: 'var(--text-3)' }}>{k}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Sec>

      <Sec title="Frequently asked questions">
        {FAQ.map((f, i) => <Acc key={i} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setFaq(openFaq === i ? null : i)} color={C} />)}
      </Sec>
    </div>
  )
}
