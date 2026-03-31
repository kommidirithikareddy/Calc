import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'

const FAQ = [
  { q: 'How do I calculate fuel cost for a road trip?', a: 'Divide trip distance by your vehicle\'s MPG to get gallons needed. Multiply by current gas price per gallon. Formula: Fuel cost = (Miles ÷ MPG) × Price per gallon.' },
  { q: 'How does driving speed affect fuel efficiency?', a: 'Most vehicles achieve peak fuel efficiency between 45–60 mph. Above 60 mph, aerodynamic drag increases exponentially — each 5 mph over 60 mph reduces fuel economy by roughly 7–14%. Highway speeds over 70 mph can cut MPG by 15–20% compared to 55 mph.' },
  { q: 'How much can I save by driving more fuel-efficiently?', a: 'Smooth acceleration, maintaining proper tire pressure, removing roof racks when not in use, and avoiding excessive idling can each improve fuel economy by 5–15%. Combined, these habits can add up to 20–30% better fuel economy.' },
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

export default function FuelCostCalculator({ meta, category }) {
  const C = category?.color || '#0d9488'
  const [distance, setDistance] = useState(300)
  const [mpg, setMpg] = useState(30)
  const [gasPrice, setGasPrice] = useState(3.50)
  const [roundTrip, setRoundTrip] = useState(false)
  const [evMpge, setEvMpge] = useState(100)
  const [electricRate, setElectricRate] = useState(0.13)
  const [openFaq, setOpenFaq] = useState(null)

  const totalMiles = roundTrip ? distance * 2 : distance
  const gallons = totalMiles / mpg
  const fuelCost = gallons * gasPrice
  const evKwh = totalMiles / evMpge * 33.7
  const evCost = evKwh * electricRate
  const savings = fuelCost - evCost

  const hint = `${totalMiles} miles at ${mpg} MPG: ${gallons.toFixed(1)} gallons, $${fuelCost.toFixed(2)} fuel cost. EV equivalent: $${evCost.toFixed(2)}.`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ background: `linear-gradient(135deg,${C}12,${C}06)`, border: `1px solid ${C}30`, borderRadius: 14, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Fuel Cost Formula</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>Cost = (Miles ÷ MPG) × Price per gallon</div>
        </div>
        <div style={{ padding: '8px 18px', background: C + '15', borderRadius: 10, fontSize: 28, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>${fuelCost.toFixed(2)}</div>
      </div>

      <CalcShell
        left={<>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 6 }}>Distance (miles)</label>
            <input type="number" value={distance} onChange={e => setDistance(Math.max(1, +e.target.value))}
              style={{ width: '100%', height: 44, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 14px', fontSize: 17, fontWeight: 700, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', fontFamily: "'Space Grotesk',sans-serif", boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 6 }}>Fuel economy (MPG)</label>
            <input type="number" value={mpg} onChange={e => setMpg(Math.max(1, +e.target.value))}
              style={{ width: '100%', height: 44, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 14px', fontSize: 17, fontWeight: 700, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', fontFamily: "'Space Grotesk',sans-serif", boxSizing: 'border-box' }} />
            <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
              {[['City car', 25], ['Average car', 30], ['SUV', 22], ['Truck', 18], ['Hybrid', 48]].map(([l, v]) => (
                <button key={l} onClick={() => setMpg(v)}
                  style={{ padding: '4px 10px', borderRadius: 7, border: `1px solid ${mpg === v ? C : 'var(--border-2)'}`, background: mpg === v ? C + '12' : 'var(--bg-raised)', fontSize: 11, color: mpg === v ? C : 'var(--text-2)', cursor: 'pointer' }}>{l} ({v})</button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 6 }}>Gas price ($/gal)</label>
            <input type="number" step="0.01" value={gasPrice} onChange={e => setGasPrice(+e.target.value)}
              style={{ width: '100%', height: 44, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 14px', fontSize: 17, fontWeight: 700, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', fontFamily: "'Space Grotesk',sans-serif", boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <button onClick={() => setRoundTrip(!roundTrip)}
              style={{ display: 'flex', width: '100%', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 9, border: `1.5px solid ${roundTrip ? C : 'var(--border-2)'}`, background: roundTrip ? C + '12' : 'var(--bg-raised)', cursor: 'pointer' }}>
              <div style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${roundTrip ? C : 'var(--border-2)'}`, background: roundTrip ? C : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {roundTrip && <span style={{ color: '#fff', fontSize: 12 }}>✓</span>}
              </div>
              <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>Round trip (double the distance)</span>
            </button>
          </div>
          <div style={{ borderTop: '0.5px solid var(--border)', paddingTop: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 10 }}>EV comparison</div>
            {[['EV efficiency (MPGe)', evMpge, setEvMpge, 1], ['Electricity rate ($/kWh)', electricRate, setElectricRate, 0.01]].map(([l, v, set, step]) => (
              <div key={l} style={{ marginBottom: 10 }}>
                <label style={{ fontSize: 11, color: 'var(--text-3)', display: 'block', marginBottom: 4 }}>{l}</label>
                <input type="number" step={step} value={v} onChange={e => set(+e.target.value)}
                  style={{ width: '100%', height: 38, border: '1px solid var(--border-2)', borderRadius: 7, padding: '0 10px', fontSize: 13, background: 'var(--bg-card)', color: 'var(--text)', boxSizing: 'border-box' }} />
              </div>
            ))}
          </div>
        </>}
        right={<>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
            {[{ l: 'Total miles', v: `${totalMiles}` }, { l: 'Gallons needed', v: gallons.toFixed(1) }, { l: 'Fuel cost', v: `$${fuelCost.toFixed(2)}`, c: C }, { l: 'Cost per mile', v: `$${(fuelCost / totalMiles).toFixed(3)}` }].map((m, i) => (
              <div key={i} style={{ padding: '12px 14px', background: 'var(--bg-raised)', borderRadius: 10, border: '0.5px solid var(--border)' }}>
                <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 4 }}>{m.l}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: m.c || 'var(--text)', fontFamily: "'Space Grotesk',sans-serif" }}>{m.v}</div>
              </div>
            ))}
          </div>

          <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 12, padding: '14px 16px', marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>⚡ Gas vs EV comparison</div>
            {[{ l: 'Gas vehicle cost', v: `$${fuelCost.toFixed(2)}`, c: '#ef4444' }, { l: 'EV cost', v: `$${evCost.toFixed(2)}`, c: '#10b981' }, { l: savings > 0 ? 'EV saves' : 'Gas saves', v: `$${Math.abs(savings).toFixed(2)}`, c: C }].map((m, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '0.5px solid var(--border)' }}>
                <span style={{ fontSize: 12, color: 'var(--text-2)' }}>{m.l}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: m.c, fontFamily: "'Space Grotesk',sans-serif" }}>{m.v}</span>
              </div>
            ))}
          </div>

          <AIHintCard hint={hint} />
        </>}
      />
      <Sec title="Frequently asked questions">
        {FAQ.map((f, i) => <Acc key={i} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} color={C} />)}
      </Sec>
    </div>
  )
}
