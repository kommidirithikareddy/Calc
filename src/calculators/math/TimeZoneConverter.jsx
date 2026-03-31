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
      {open && <p style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.75, margin: '0 0 13px' }}>{a}</p>}
    </div>
  )
}

const TIMEZONES = [
  { id: 'UTC', label: 'UTC', city: 'Coordinated Universal Time', offset: 0 },
  { id: 'EST', label: 'EST / EDT', city: 'New York, Toronto', offset: -5 },
  { id: 'CST', label: 'CST / CDT', city: 'Chicago, Dallas', offset: -6 },
  { id: 'MST', label: 'MST / MDT', city: 'Denver, Phoenix', offset: -7 },
  { id: 'PST', label: 'PST / PDT', city: 'Los Angeles, Seattle', offset: -8 },
  { id: 'AST', label: 'AST', city: 'Halifax, Barbados', offset: -4 },
  { id: 'BRT', label: 'BRT', city: 'São Paulo, Rio', offset: -3 },
  { id: 'GMT', label: 'GMT / BST', city: 'London, Dublin', offset: 0 },
  { id: 'CET', label: 'CET / CEST', city: 'Paris, Berlin, Rome', offset: 1 },
  { id: 'EET', label: 'EET / EEST', city: 'Athens, Cairo', offset: 2 },
  { id: 'MSK', label: 'MSK', city: 'Moscow, Istanbul', offset: 3 },
  { id: 'GST', label: 'GST', city: 'Dubai, Abu Dhabi', offset: 4 },
  { id: 'PKT', label: 'PKT', city: 'Karachi, Lahore', offset: 5 },
  { id: 'IST', label: 'IST', city: 'Mumbai, Delhi, Kolkata', offset: 5.5 },
  { id: 'BST', label: 'BST', city: 'Dhaka, Bangladesh', offset: 6 },
  { id: 'ICT', label: 'ICT', city: 'Bangkok, Jakarta', offset: 7 },
  { id: 'SGT', label: 'SGT', city: 'Singapore, Kuala Lumpur', offset: 8 },
  { id: 'CST8', label: 'CST', city: 'Beijing, Shanghai', offset: 8 },
  { id: 'JST', label: 'JST', city: 'Tokyo, Osaka', offset: 9 },
  { id: 'AEST', label: 'AEST / AEDT', city: 'Sydney, Melbourne', offset: 10 },
  { id: 'NZST', label: 'NZST / NZDT', city: 'Auckland, Wellington', offset: 12 },
]

function pad(n) { return String(Math.floor(n)).padStart(2, '0') }

function offsetToStr(offset) {
  const sign = offset >= 0 ? '+' : '-'
  const abs = Math.abs(offset)
  const h = Math.floor(abs)
  const m = (abs % 1) * 60
  return `UTC${sign}${pad(h)}:${pad(m)}`
}

function applyOffset(date, hour, minute, fromOffset, toOffset) {
  const utcMs = date.getTime() - fromOffset * 3600000 + hour * 3600000 + minute * 60000
  const targetMs = utcMs + toOffset * 3600000
  const d = new Date(targetMs)
  return { hour: d.getUTCHours(), minute: d.getUTCMinutes(), date: d, dayOffset: d.getUTCDate() - new Date(utcMs).getUTCDate() }
}

const MEETING_SLOTS = [9, 10, 11, 14, 15, 16]

const FAQ = [
  { q: 'What is UTC?', a: 'UTC (Coordinated Universal Time) is the primary time standard. All other time zones are defined as offsets from UTC. UTC replaced Greenwich Mean Time (GMT) in 1972 as the global standard, though they are effectively the same for most purposes. UTC never observes daylight saving time.' },
  { q: 'What is daylight saving time?', a: 'Daylight saving time (DST) shifts clocks forward 1 hour in spring and back in autumn to make better use of daylight. Not all countries observe DST. The US shifts in March and November, the EU in March and October. India, China, and most of Africa do not use DST at all.' },
  { q: 'What is the International Date Line?', a: 'The International Date Line is at approximately 180° longitude (opposite the Prime Meridian). Crossing it going eastward moves you back one day; westward adds one day. This is why it is possible to "time travel" — flying from New Zealand to Hawaii crosses the date line and arrives "the day before."' },
  { q: 'What is the best time for an international meeting?', a: 'Look for overlapping business hours. New York (EST) and London (GMT) overlap well: 9am-12pm EST = 2pm-5pm GMT. New York and India (IST = UTC+5:30) are 10.5 hours apart — hard to overlap during normal business hours. The "meeting planner" section helps visualize overlaps.' },
]

export default function TimeZoneConverter({ meta, category }) {
  const C = category?.color || '#6366f1'
  const [fromTz, setFromTz] = useState('EST')
  const [toTzList, setToTzList] = useState(['GMT', 'IST', 'JST', 'AEST'])
  const [hour, setHour] = useState(9)
  const [minute, setMinute] = useState(0)
  const [inputDate, setInputDate] = useState(new Date().toISOString().split('T')[0])
  const [now, setNow] = useState(new Date())
  const [openFaq, setFaq] = useState(null)

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const fromZone = TIMEZONES.find(z => z.id === fromTz) || TIMEZONES[0]
  const baseDate = new Date(inputDate + 'T00:00:00Z')

  const conversions = TIMEZONES.filter(z => toTzList.includes(z.id)).map(tz => {
    const res = applyOffset(baseDate, hour, minute, fromZone.offset, tz.offset)
    return { ...tz, hour: res.hour, minute: res.minute, dayOffset: res.dayOffset }
  })

  function toggleToTz(id) {
    setToTzList(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  // World clock - current time
  const worldClocks = TIMEZONES.slice(0, 12).map(tz => {
    const utcMs = now.getTime()
    const localMs = utcMs + tz.offset * 3600000
    const d = new Date(localMs)
    return { ...tz, h: d.getUTCHours(), m: d.getUTCMinutes(), s: d.getUTCSeconds() }
  })

  // Meeting planner - highlight good overlap slots
  const meetingPlanner = MEETING_SLOTS.map(slot => ({
    slot,
    cities: TIMEZONES.filter(z => toTzList.includes(z.id) || z.id === fromTz).map(tz => {
      const res = applyOffset(baseDate, slot, 0, fromZone.offset, tz.offset)
      const isBusinessHour = res.hour >= 8 && res.hour <= 18
      return { ...tz, hour: res.hour, isGood: isBusinessHour, dayOffset: res.dayOffset }
    })
  }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ background: `linear-gradient(135deg,${C}12,${C}06)`, border: `1px solid ${C}30`, borderRadius: 14, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Time Zone Converter</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>
            {pad(hour)}:{pad(minute)} {fromZone.label}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>{fromZone.city} · {offsetToStr(fromZone.offset)}</div>
        </div>
        <div style={{ padding: '10px 20px', background: C + '18', borderRadius: 12, textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 2 }}>Live UTC now</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif", fontVariantNumeric: 'tabular-nums' }}>
            {pad(now.getUTCHours())}:{pad(now.getUTCMinutes())}:{pad(now.getUTCSeconds())}
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-3)' }}>UTC</div>
        </div>
      </div>

      <CalcShell
        left={<>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 16, paddingBottom: 8, borderBottom: '0.5px solid var(--border)' }}>Convert From</div>

          {/* From timezone */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 6 }}>Source time zone</label>
            <div style={{ display: 'flex', height: 44, border: `1.5px solid ${C}40`, borderRadius: 9, overflow: 'hidden', background: 'var(--bg-card)' }}>
              <select value={fromTz} onChange={e => setFromTz(e.target.value)} style={{ flex: 1, border: 'none', background: 'transparent', padding: '0 14px', fontSize: 13, fontWeight: 600, color: 'var(--text)', outline: 'none' }}>
                {TIMEZONES.map(tz => <option key={tz.id} value={tz.id}>{tz.label} — {tz.city}</option>)}
              </select>
            </div>
          </div>

          {/* Time input */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 6 }}>Time</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ flex: 1, height: 44, border: `1.5px solid ${C}40`, borderRadius: 9, overflow: 'hidden', background: 'var(--bg-card)', display: 'flex', alignItems: 'center' }}>
                <input type="number" min="0" max="23" value={hour} onChange={e => setHour(Math.max(0, Math.min(23, Number(e.target.value))))} style={{ flex: 1, border: 'none', background: 'transparent', padding: '0 14px', fontSize: 17, fontWeight: 700, color: 'var(--text)', outline: 'none', fontFamily: "'Space Grotesk',sans-serif" }} />
                <span style={{ padding: '0 8px', color: 'var(--text-3)', fontSize: 12 }}>h</span>
              </div>
              <div style={{ flex: 1, height: 44, border: `1.5px solid ${C}40`, borderRadius: 9, overflow: 'hidden', background: 'var(--bg-card)', display: 'flex', alignItems: 'center' }}>
                <input type="number" min="0" max="59" value={minute} onChange={e => setMinute(Math.max(0, Math.min(59, Number(e.target.value))))} style={{ flex: 1, border: 'none', background: 'transparent', padding: '0 14px', fontSize: 17, fontWeight: 700, color: 'var(--text)', outline: 'none', fontFamily: "'Space Grotesk',sans-serif" }} />
                <span style={{ padding: '0 8px', color: 'var(--text-3)', fontSize: 12 }}>m</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
              {[0, 6, 9, 12, 15, 18, 21].map(h => (
                <button key={h} onClick={() => { setHour(h); setMinute(0) }} style={{ padding: '5px 10px', borderRadius: 20, fontSize: 10, fontWeight: 600, border: '1.5px solid', borderColor: hour === h && minute === 0 ? C : 'var(--border)', background: hour === h && minute === 0 ? C : 'var(--bg-raised)', color: hour === h && minute === 0 ? '#fff' : 'var(--text-2)', cursor: 'pointer' }}>
                  {pad(h)}:00
                </button>
              ))}
            </div>
          </div>

          {/* Date */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 6 }}>Date</label>
            <div style={{ display: 'flex', height: 44, border: `1.5px solid ${C}40`, borderRadius: 9, overflow: 'hidden', background: 'var(--bg-card)' }}>
              <input type="date" value={inputDate} onChange={e => setInputDate(e.target.value)} style={{ flex: 1, border: 'none', background: 'transparent', padding: '0 14px', fontSize: 13, fontWeight: 600, color: 'var(--text)', outline: 'none' }} />
            </div>
          </div>

          {/* Target zones */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>Convert to (select multiple)</div>
            <div style={{ display: 'flex', flex: 1, flexWrap: 'wrap', gap: 6 }}>
              {TIMEZONES.filter(z => z.id !== fromTz).map(tz => (
                <button key={tz.id} onClick={() => toggleToTz(tz.id)} style={{ padding: '5px 10px', borderRadius: 20, fontSize: 10, fontWeight: 600, border: '1.5px solid', borderColor: toTzList.includes(tz.id) ? C : 'var(--border)', background: toTzList.includes(tz.id) ? C : 'var(--bg-raised)', color: toTzList.includes(tz.id) ? '#fff' : 'var(--text-2)', cursor: 'pointer' }}>
                  {tz.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button style={{ flex: 1, padding: 13, borderRadius: 10, border: 'none', background: C, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Convert →</button>
            <button onClick={() => { setHour(9); setMinute(0); setFromTz('EST'); setToTzList(['GMT', 'IST', 'JST', 'AEST']) }} style={{ padding: '13px 18px', borderRadius: 10, border: '1.5px solid var(--border-2)', background: 'var(--bg-raised)', color: 'var(--text-2)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Reset</button>
          </div>
        </>}

        right={<>
          <div style={{ background: 'var(--bg-card)', border: `1.5px solid ${C}30`, borderRadius: 14, padding: '18px 20px', marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: 12 }}>
              {pad(hour)}:{pad(minute)} {fromZone.label} = ?
            </div>
            {conversions.length > 0 ? conversions.map((conv, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < conversions.length - 1 ? '0.5px solid var(--border)' : 'none' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{conv.label}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-3)' }}>{conv.city}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>{pad(conv.hour)}:{pad(conv.minute)}</div>
                  {conv.dayOffset !== 0 && <div style={{ fontSize: 9, color: conv.dayOffset > 0 ? '#10b981' : '#ef4444' }}>{conv.dayOffset > 0 ? '+1 day' : '-1 day'}</div>}
                  <div style={{ fontSize: 9, color: 'var(--text-3)' }}>{offsetToStr(conv.offset)}</div>
                </div>
              </div>
            )) : <div style={{ color: 'var(--text-3)', fontSize: 13 }}>Select target time zones on the left</div>}
          </div>

          <BreakdownTable title="Offset reference" rows={conversions.map(c => ({
            label: `${c.label} (${c.city.split(',')[0]})`,
            value: `${pad(c.hour)}:${pad(c.minute)}`,
            note: offsetToStr(c.offset),
            color: C,
          }))} />
          {conversions.length > 0 && <AIHintCard hint={`${pad(hour)}:${pad(minute)} ${fromZone.label} = ${conversions.map(c => `${pad(c.hour)}:${pad(c.minute)} ${c.label}${c.dayOffset !== 0 ? ' (' + (c.dayOffset > 0 ? 'next day' : 'prev day') + ')' : ''}`).join(' · ')}`} color={C} />}
        </>}
      />

      {/* Live World Clock */}
      <Sec title="🌍 Live World Clock" sub="Updates every second">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
          {worldClocks.map((wc, i) => {
            const isDay = wc.h >= 6 && wc.h < 20
            return (
              <div key={i} style={{ padding: '12px', borderRadius: 10, background: wc.id === fromTz ? C + '15' : 'var(--bg-raised)', border: `1px solid ${wc.id === fromTz ? C + '40' : 'var(--border)'}` }}>
                <div style={{ fontSize: 9, color: 'var(--text-3)', marginBottom: 2 }}>{isDay ? '☀️' : '🌙'} {wc.label}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: wc.id === fromTz ? C : 'var(--text)', fontFamily: "'Space Grotesk',sans-serif", fontVariantNumeric: 'tabular-nums' }}>
                  {pad(wc.h)}:{pad(wc.m)}:{pad(wc.s)}
                </div>
                <div style={{ fontSize: 9, color: 'var(--text-3)' }}>{wc.city.split(',')[0]}</div>
              </div>
            )
          })}
        </div>
      </Sec>

      {/* Meeting planner */}
      <Sec title="📅 Meeting Planner — Find the best meeting time" sub="Green = business hours, red = outside hours">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
            <thead>
              <tr>
                <th style={{ padding: '8px 10px', textAlign: 'left', borderBottom: '1px solid var(--border)', color: 'var(--text-3)', fontWeight: 700 }}>Time ({fromZone.label})</th>
                {[fromZone, ...TIMEZONES.filter(z => toTzList.includes(z.id))].map(z => (
                  <th key={z.id} style={{ padding: '8px 10px', textAlign: 'center', borderBottom: '1px solid var(--border)', color: 'var(--text-3)', fontWeight: 700, fontSize: 10 }}>{z.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {meetingPlanner.map((slot, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? 'transparent' : 'var(--bg-raised)' }}>
                  <td style={{ padding: '7px 10px', fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>{pad(slot.slot)}:00</td>
                  {slot.cities.map((city, j) => (
                    <td key={j} style={{ padding: '6px 10px', textAlign: 'center' }}>
                      <div style={{ padding: '4px 6px', borderRadius: 6, background: city.isGood ? '#10b98120' : '#ef444415', color: city.isGood ? '#10b981' : '#ef4444', fontSize: 11, fontWeight: 600 }}>
                        {pad(city.hour)}:00{city.dayOffset !== 0 ? (city.dayOffset > 0 ? '▲' : '▼') : ''}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ display: 'flex', gap: 14, marginTop: 10, fontSize: 10 }}>
          <span>🟢 Business hours (8am–6pm)</span>
          <span>🔴 Outside business hours</span>
          <span>▲ Next day ▼ Previous day</span>
        </div>
      </Sec>

      {/* UTC offset reference */}
      <Sec title="🗺️ UTC Offset Reference — All time zones" sub="Standard offsets (DST may add +1h)">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 6 }}>
          {TIMEZONES.map((tz, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderRadius: 8, background: tz.id === fromTz ? C + '12' : 'var(--bg-raised)', border: `1px solid ${tz.id === fromTz ? C + '30' : 'var(--border)'}` }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: tz.id === fromTz ? C : 'var(--text)' }}>{tz.label}</div>
                <div style={{ fontSize: 9, color: 'var(--text-3)' }}>{tz.city.split(',')[0]}</div>
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: tz.id === fromTz ? C : 'var(--text-3)', fontFamily: "'Space Grotesk',sans-serif" }}>{offsetToStr(tz.offset)}</div>
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
