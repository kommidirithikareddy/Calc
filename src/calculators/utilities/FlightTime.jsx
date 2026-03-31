import { useState, useMemo } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'

const FAQ = [
  { q: 'How is flight time calculated?', a: 'Basic flight time = Distance ÷ Aircraft speed. However, actual flight time varies due to jet streams (which can add or subtract 1–2 hours on transatlantic flights), air traffic control routing, taxiing, and holding patterns. Airlines pad schedules by 10–20% to maintain on-time performance.' },
  { q: 'What is the fastest commercial aircraft speed?', a: 'Most narrow-body jets (Boeing 737, Airbus A320) cruise at 460–490 mph. Wide-body jets (Boeing 787, Airbus A350) cruise at 480–560 mph. The Concorde (retired 2003) flew at 1,350 mph — Mach 2. Modern commercial aircraft top out around 575–590 mph.' },
  { q: 'How do I calculate total door-to-door travel time?', a: 'Add: travel to airport (minimum 30–60 min), check-in and security (60–90 min domestic, 2–3 hours international), boarding (30–45 min), actual flight time, deplaning (15–30 min), baggage claim (20–40 min), and travel to destination. Budget 4–5 hours for a 1-hour domestic flight.' },
]

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
        <span style={{ fontSize: 18, color, flexShrink: 0, display: 'inline-block', transform: open ? 'rotate(45deg)' : 'none', transition: 'transform .2s' }}>+</span>
      </button>
      {open && <p style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.75, margin: '0 0 13px', fontFamily: "'DM Sans',sans-serif" }}>{a}</p>}
    </div>
  )
}

export default function FlightTime({ meta, category }) {
  const C = category?.color || '#0d9488'
  const [distance, setDistance] = useState(2500)
  const [speed, setSpeed] = useState(500)
  const [airportBuffer, setAirportBuffer] = useState(90)
  const [openFaq, setOpenFaq] = useState(null)

  const flightHours = speed > 0 ? distance / speed : 0
  const totalMinutes = flightHours * 60 + airportBuffer * 2
  const totalHours = totalMinutes / 60

  const fh = Math.floor(flightHours)
  const fm = Math.round((flightHours % 1) * 60)
  const th = Math.floor(totalHours)
  const tm = Math.round((totalHours % 1) * 60)

  const hint = `${distance} miles at ${speed} mph: ${fh}h ${fm}m flight time. Total door-to-door: ~${th}h ${tm}m.`

  const ROUTES = [
    { from: 'New York',       to: 'Los Angeles',  mi: 2445, icon: '🇺🇸' },
    { from: 'London',         to: 'New York',     mi: 3459, icon: '🌊' },
    { from: 'Los Angeles',    to: 'Tokyo',        mi: 5470, icon: '🌏' },
    { from: 'New York',       to: 'London',       mi: 3459, icon: '✈️' },
    { from: 'Sydney',         to: 'Singapore',    mi: 3905, icon: '🦘' },
    { from: 'Chicago',        to: 'Miami',        mi: 1188, icon: '🌴' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ background: `linear-gradient(135deg,${C}12,${C}06)`, border: `1px solid ${C}30`, borderRadius: 14, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Flight Time Formula</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>Time = Distance ÷ Aircraft Speed</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>{fh}h {fm}m</div>
          <div style={{ fontSize: 12, color: 'var(--text-3)' }}>flight time</div>
        </div>
      </div>

      <CalcShell
        left={<>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 6 }}>Flight distance (miles)</label>
            <input type="number" value={distance} onChange={e => setDistance(Math.max(1, +e.target.value))}
              style={{ width: '100%', height: 44, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 14px', fontSize: 17, fontWeight: 700, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', fontFamily: "'Space Grotesk',sans-serif", boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 8 }}>Aircraft speed (mph)</label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
              {[['Prop plane', 150], ['Regional jet', 400], ['Narrow-body', 480], ['Wide-body', 560]].map(([l, v]) => (
                <button key={l} onClick={() => setSpeed(v)}
                  style={{ padding: '5px 10px', borderRadius: 7, border: `1px solid ${speed === v ? C : 'var(--border-2)'}`, background: speed === v ? C + '12' : 'var(--bg-raised)', fontSize: 11, color: speed === v ? C : 'var(--text-2)', cursor: 'pointer' }}>{l} ({v})</button>
              ))}
            </div>
            <input type="number" value={speed} onChange={e => setSpeed(Math.max(1, +e.target.value))}
              style={{ width: '100%', height: 44, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 14px', fontSize: 17, fontWeight: 700, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', fontFamily: "'Space Grotesk',sans-serif", boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 6 }}>Airport time buffer (min each way)</label>
            <input type="number" value={airportBuffer} onChange={e => setAirportBuffer(Math.max(0, +e.target.value))}
              style={{ width: '100%', height: 44, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 14px', fontSize: 17, fontWeight: 700, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', fontFamily: "'Space Grotesk',sans-serif", boxSizing: 'border-box' }} />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 8 }}>COMMON ROUTES</div>
            {ROUTES.map((r, i) => (
              <button key={i} onClick={() => setDistance(r.mi)}
                style={{ display: 'flex', justifyContent: 'space-between', width: '100%', padding: '7px 10px', borderRadius: 8, border: '0.5px solid var(--border)', background: distance === r.mi ? C + '10' : 'var(--bg-raised)', marginBottom: 4, cursor: 'pointer' }}>
                <span style={{ fontSize: 12, color: 'var(--text)' }}>{r.icon} {r.from} → {r.to}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: C }}>{r.mi.toLocaleString()} mi</span>
              </button>
            ))}
          </div>
        </>}
        right={<>
          <BreakdownTable title="Time estimate" rows={[
            { label: 'Flight time', value: `${fh}h ${fm}m`, bold: true, highlight: true, color: C },
            { label: 'Airport buffer (×2)', value: `${airportBuffer * 2} min` },
            { label: 'Total door-to-door', value: `~${th}h ${tm}m` },
            { label: 'Speed', value: `${speed} mph` },
            { label: 'Distance', value: `${distance.toLocaleString()} mi` },
          ]} />
          <AIHintCard hint={hint} />
        </>}
      />
      <Sec title="Frequently asked questions">
        {FAQ.map((f, i) => <Acc key={i} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} color={C} />)}
      </Sec>
    </div>
  )
}
