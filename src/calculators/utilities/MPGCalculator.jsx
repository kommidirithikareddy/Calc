import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'

const US_AVG_MPG = 28.0 // 2023 average new vehicle

const FAQ = [
  { q: 'How do I measure my actual MPG?', a: 'Fill your tank completely. Reset your trip odometer to 0. Drive normally until you need to refuel. Fill the tank again and note the gallons pumped and miles driven. MPG = Miles ÷ Gallons. Do this a few times for an accurate average.' },
  { q: 'Why is my MPG lower than the sticker says?', a: 'EPA estimates are tested under ideal laboratory conditions. Real-world MPG is typically 15–20% lower due to: stop-and-go traffic, air conditioning use, highway speeds above 55 mph, cold weather, payload, tire inflation, and driving style.' },
  { q: 'What is L/100km and how does it relate to MPG?', a: 'L/100km is the metric measure of fuel consumption used in most countries outside the US. It measures how many litres of fuel you use per 100 kilometres. Lower is better. To convert: L/100km = 235.2 ÷ MPG.' },
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

export default function MPGCalculator({ meta, category }) {
  const C = category?.color || '#0d9488'
  const [miles, setMiles] = useState(300)
  const [gallons, setGallons] = useState(10)
  const [openFaq, setOpenFaq] = useState(null)

  const mpg = gallons > 0 ? miles / gallons : 0
  const l100km = mpg > 0 ? 235.2 / mpg : 0
  const kmL = mpg > 0 ? mpg * 0.4251 : 0
  const vsAvg = mpg - US_AVG_MPG
  const rating = mpg >= 40 ? { l: 'Excellent', c: '#10b981' } : mpg >= 30 ? { l: 'Good', c: '#3b82f6' } : mpg >= 22 ? { l: 'Average', c: '#f59e0b' } : { l: 'Below average', c: '#ef4444' }

  const hint = `${miles} miles on ${gallons} gallons = ${mpg.toFixed(1)} MPG (${l100km.toFixed(1)} L/100km). ${vsAvg > 0 ? '+' : ''}${vsAvg.toFixed(1)} vs US average.`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ background: `linear-gradient(135deg,${C}12,${C}06)`, border: `1px solid ${C}30`, borderRadius: 14, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>MPG Formula</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>MPG = Miles Driven ÷ Gallons Used</div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>L/100km = 235.2 ÷ MPG</div>
        </div>
        <div style={{ padding: '8px 18px', background: C + '15', borderRadius: 10, fontSize: 28, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>{mpg.toFixed(1)} MPG</div>
      </div>

      <CalcShell
        left={<>
          {[['Miles driven', miles, setMiles], ['Gallons used', gallons, setGallons]].map(([l, v, set]) => (
            <div key={l} style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 6 }}>{l}</label>
              <input type="number" value={v} onChange={e => set(Math.max(0.1, +e.target.value))}
                style={{ width: '100%', height: 44, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 14px', fontSize: 17, fontWeight: 700, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', fontFamily: "'Space Grotesk',sans-serif", boxSizing: 'border-box' }} />
            </div>
          ))}
          <div style={{ padding: '12px 14px', background: 'var(--bg-raised)', borderRadius: 10, border: '0.5px solid var(--border)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>TYPICAL MPG BY VEHICLE TYPE</div>
            {[['Compact sedan', '28–35'], ['Midsize sedan', '25–32'], ['Full-size SUV', '16–22'], ['Pickup truck', '15–22'], ['Hybrid sedan', '45–55'], ['Electric (MPGe)', '90–130']].map((r, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-2)', marginBottom: 3 }}>
                <span>{r[0]}</span><span style={{ fontWeight: 600 }}>{r[1]} MPG</span>
              </div>
            ))}
          </div>
        </>}
        right={<>
          <div style={{ background: 'var(--bg-card)', border: `1.5px solid ${rating.c}40`, borderRadius: 14, padding: '18px 20px', marginBottom: 14 }}>
            <div style={{ fontSize: 52, fontWeight: 700, color: rating.c, fontFamily: "'Space Grotesk',sans-serif", lineHeight: 1 }}>{mpg.toFixed(1)}</div>
            <div style={{ fontSize: 14, color: 'var(--text-3)', marginTop: 4 }}>MPG</div>
            <div style={{ marginTop: 12, display: 'inline-flex', padding: '4px 12px', borderRadius: 20, background: rating.c + '15', border: `1px solid ${rating.c}40`, fontSize: 12, fontWeight: 700, color: rating.c }}>{rating.l}</div>
            <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-3)' }}>
              {vsAvg > 0 ? `+${vsAvg.toFixed(1)} MPG above` : `${Math.abs(vsAvg).toFixed(1)} MPG below`} US avg ({US_AVG_MPG} MPG)
            </div>
          </div>
          <BreakdownTable title="Fuel efficiency" rows={[
            { label: 'MPG', value: mpg.toFixed(2), bold: true, highlight: true, color: C },
            { label: 'L/100km (metric)', value: l100km.toFixed(2) },
            { label: 'km/L', value: kmL.toFixed(2) },
            { label: 'vs US average', value: `${vsAvg >= 0 ? '+' : ''}${vsAvg.toFixed(1)} MPG`, color: vsAvg >= 0 ? '#10b981' : '#ef4444' },
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
