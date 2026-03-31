import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'

const LANDMARKS = [
  { label: 'Football field', acres: 1.32, icon: '🏈' },
  { label: 'City block (avg)', acres: 2.0, icon: '🏙️' },
  { label: 'Central Park', acres: 843, icon: '🌳' },
  { label: 'Average US farm', acres: 445, icon: '🌾' },
  { label: 'Disneyland', acres: 87, icon: '🎢' },
  { label: 'Vatican City', acres: 110, icon: '⛪' },
]

const FAQ = [
  { q: 'How many square feet are in an acre?', a: 'One acre = exactly 43,560 square feet. This unusual number comes from historical surveying: 1 acre was the area a team of oxen could plow in a day — 1 chain (66 ft) wide by 1 furlong (660 ft) long = 43,560 sq ft.' },
  { q: 'How many acres is a typical residential lot?', a: 'A typical suburban US residential lot is about 0.15–0.25 acres (6,500–10,890 sq ft). Rural properties can range from 1–20+ acres. Agricultural land is typically sold in 40-acre parcels (a "forty" in farm terminology).' },
  { q: 'How do I calculate acreage from feet?', a: 'Multiply length (ft) × width (ft) to get square feet, then divide by 43,560 to get acres. Example: 200 ft × 300 ft = 60,000 sq ft ÷ 43,560 = 1.38 acres. For circular areas: π × radius² ÷ 43,560.' },
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

export default function AcreageCalculator({ meta, category }) {
  const C = category?.color || '#0d9488'
  const [shape, setShape] = useState('rectangle')
  const [length, setLength] = useState(300)
  const [width, setWidth] = useState(200)
  const [radius, setRadius] = useState(150)
  const [openFaq, setOpenFaq] = useState(null)

  const sqFt = shape === 'rectangle' ? length * width : Math.PI * radius * radius
  const acres = sqFt / 43560
  const hectares = acres * 0.404686
  const sqM = sqFt * 0.0929

  const nearest = LANDMARKS.reduce((best, ref) => {
    return Math.abs(Math.log10(acres + 0.0001) - Math.log10(ref.acres)) < Math.abs(Math.log10(acres + 0.0001) - Math.log10(best.acres)) ? ref : best
  })
  const ratio = acres / nearest.acres

  const hint = `${sqFt.toFixed(0)} sq ft = ${acres.toFixed(4)} acres = ${hectares.toFixed(4)} hectares. ${ratio >= 1 ? `${ratio.toFixed(1)}×` : `${(1/ratio).toFixed(1)}th the size of`} ${nearest.label}.`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ background: `linear-gradient(135deg,${C}12,${C}06)`, border: `1px solid ${C}30`, borderRadius: 14, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Acreage Formula</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>Acres = Square feet ÷ 43,560</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>{acres.toFixed(4)}</div>
          <div style={{ fontSize: 12, color: 'var(--text-3)' }}>acres</div>
        </div>
      </div>

      <CalcShell
        left={<>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 8 }}>Shape</label>
            <div style={{ display: 'flex', gap: 6 }}>
              {[['rectangle', 'Rectangle'], ['circle', 'Circle']].map(([s, l]) => (
                <button key={s} onClick={() => setShape(s)}
                  style={{ flex: 1, padding: '9px', borderRadius: 8, border: `1.5px solid ${shape === s ? C : 'var(--border-2)'}`, background: shape === s ? C + '12' : 'var(--bg-raised)', fontSize: 13, fontWeight: shape === s ? 700 : 500, color: shape === s ? C : 'var(--text-2)', cursor: 'pointer' }}>{l}</button>
              ))}
            </div>
          </div>

          {shape === 'rectangle' ? (
            <>
              {[['Length (ft)', length, setLength], ['Width (ft)', width, setWidth]].map(([l, v, set]) => (
                <div key={l} style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 6 }}>{l}</label>
                  <input type="number" value={v} onChange={e => set(Math.max(1, +e.target.value))}
                    style={{ width: '100%', height: 44, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 14px', fontSize: 17, fontWeight: 700, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', fontFamily: "'Space Grotesk',sans-serif", boxSizing: 'border-box' }} />
                </div>
              ))}
            </>
          ) : (
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 6 }}>Radius (ft)</label>
              <input type="number" value={radius} onChange={e => setRadius(Math.max(1, +e.target.value))}
                style={{ width: '100%', height: 44, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 14px', fontSize: 17, fontWeight: 700, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', fontFamily: "'Space Grotesk',sans-serif", boxSizing: 'border-box' }} />
            </div>
          )}

          <div style={{ padding: '12px 14px', background: C + '08', borderRadius: 10, border: `1px solid ${C}20`, fontSize: 12, color: 'var(--text-2)', lineHeight: 1.65 }}>
            💡 {ratio >= 1 ? `Your land is ${ratio.toFixed(1)}× the size of` : `Your land is ${(1/ratio).toFixed(1)}× smaller than`} {nearest.icon} {nearest.label}.
          </div>
        </>}
        right={<>
          <BreakdownTable title="Area conversions" rows={[
            { label: 'Square feet', value: `${sqFt.toFixed(0)} ft²` },
            { label: 'Acres', value: `${acres.toFixed(4)} ac`, bold: true, highlight: true, color: C },
            { label: 'Hectares', value: `${hectares.toFixed(4)} ha` },
            { label: 'Square meters', value: `${sqM.toFixed(0)} m²` },
            { label: 'Square miles', value: `${(acres / 640).toFixed(6)}` },
          ]} />

          <Sec title="Landmark comparisons">
            {LANDMARKS.map((l, i) => {
              const r = acres / l.acres
              return (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '0.5px solid var(--border)' }}>
                  <span style={{ fontSize: 12, color: 'var(--text)' }}>{l.icon} {l.label}</span>
                  <span style={{ fontSize: 11, color: r >= 0.5 && r <= 2 ? C : 'var(--text-3)', fontWeight: r >= 0.5 && r <= 2 ? 700 : 400 }}>
                    {r >= 1 ? `${r.toFixed(1)}×` : `1/${(1/r).toFixed(0)}×`}
                  </span>
                </div>
              )
            })}
          </Sec>

          <AIHintCard hint={hint} />
        </>}
      />
      <Sec title="Frequently asked questions">
        {FAQ.map((f, i) => <Acc key={i} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} color={C} />)}
      </Sec>
    </div>
  )
}
