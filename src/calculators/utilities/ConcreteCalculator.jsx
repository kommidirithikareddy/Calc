import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'

const SHAPES = [
  { id: 'slab',    label: 'Slab / Patio',  fields: ['Length (ft)', 'Width (ft)', 'Thickness (in)'], minDepth: '4" for driveway, 3.5" patio, 3" walkway' },
  { id: 'footing', label: 'Wall Footing',   fields: ['Length (ft)', 'Width (ft)', 'Depth (in)'],     minDepth: '12"+ for most foundations' },
  { id: 'column',  label: 'Column / Post',  fields: ['Height (ft)', 'Diameter (in)'],               minDepth: 'Varies by load' },
]

const FAQ = [
  { q: 'How many 60-lb bags of concrete do I need?', a: 'One 60-lb bag yields approximately 0.45 cubic feet of concrete. To find bags needed: divide total cubic feet by 0.45. For 80-lb bags, divide by 0.60. This calculator shows both for you automatically.' },
  { q: 'When should I order ready-mix vs use bags?', a: 'For jobs under 1 cubic yard (~27 cubic feet), bagged concrete is more practical. For larger pours — driveways, foundations, slabs — ready-mix delivered by truck is more economical and gives a more consistent result.' },
  { q: 'What is the minimum concrete thickness for a driveway?', a: 'Residential driveways need at least 4 inches (ideally 5–6 inches for heavy vehicles). Patios: 3.5 inches. Walkways: 3 inches. Thicker slabs cost more but are significantly stronger and more durable.' },
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

export default function ConcreteCalculator({ meta, category }) {
  const C = category?.color || '#0d9488'
  const [shape, setShape] = useState('slab')
  const [v1, setV1] = useState(10), [v2, setV2] = useState(10), [v3, setV3] = useState(4)
  const [openFaq, setOpenFaq] = useState(null)

  const shapeData = SHAPES.find(s => s.id === shape)

  let cubicFt = 0
  if (shape === 'slab' || shape === 'footing') {
    cubicFt = v1 * v2 * (v3 / 12)
  } else if (shape === 'column') {
    const r = (v2 / 2) / 12
    cubicFt = Math.PI * r * r * v1
  }
  const cubicYards = cubicFt / 27
  const bags60 = Math.ceil(cubicFt / 0.45)
  const bags80 = Math.ceil(cubicFt / 0.60)

  const hint = `${shapeData.label}: ${cubicYards.toFixed(2)} cubic yards, ${cubicFt.toFixed(1)} cubic feet. Need ${bags60} × 60-lb bags or ${bags80} × 80-lb bags.`

  const labels = shapeData.fields

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ background: `linear-gradient(135deg,${C}12,${C}06)`, border: `1px solid ${C}30`, borderRadius: 14, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Concrete Formula</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>Volume (yd³) = L × W × D ÷ 27</div>
        </div>
        <div style={{ padding: '8px 18px', background: C + '15', borderRadius: 10, textAlign: 'right' }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>{cubicYards.toFixed(2)}</div>
          <div style={{ fontSize: 11, color: 'var(--text-3)' }}>cubic yards</div>
        </div>
      </div>

      <CalcShell
        left={<>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 8 }}>Shape</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {SHAPES.map(s => (
                <button key={s.id} onClick={() => setShape(s.id)}
                  style={{ padding: '10px 14px', borderRadius: 9, border: `1.5px solid ${shape === s.id ? C : 'var(--border-2)'}`, background: shape === s.id ? C + '12' : 'var(--bg-raised)', fontSize: 13, fontWeight: shape === s.id ? 700 : 400, color: shape === s.id ? C : 'var(--text)', cursor: 'pointer', textAlign: 'left' }}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {[[labels[0], v1, setV1], [labels[1], v2, setV2], ...(labels[2] ? [[labels[2], v3, setV3]] : [])].map(([lbl, v, set]) => (
            <div key={lbl} style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 6 }}>{lbl}</label>
              <input type="number" value={v} onChange={e => set(Math.max(0.1, +e.target.value))}
                style={{ width: '100%', height: 44, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 14px', fontSize: 17, fontWeight: 700, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', fontFamily: "'Space Grotesk',sans-serif", boxSizing: 'border-box' }} />
            </div>
          ))}

          <div style={{ padding: '10px 13px', background: 'var(--bg-raised)', borderRadius: 9, border: '0.5px solid var(--border)', fontSize: 12, color: 'var(--text-2)' }}>
            📐 Min depth: {shapeData.minDepth}
          </div>
        </>}
        right={<>
          <BreakdownTable title="Concrete needed" rows={[
            { label: 'Cubic feet',     value: cubicFt.toFixed(2) },
            { label: 'Cubic yards',    value: cubicYards.toFixed(2), bold: true, highlight: true, color: C },
            { label: '60-lb bags',     value: bags60, color: C },
            { label: '80-lb bags',     value: bags80 },
          ]} />
          <div style={{ marginTop: 14, padding: '12px 14px', background: 'var(--bg-raised)', borderRadius: 10, border: '0.5px solid var(--border)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>BAG GUIDE</div>
            {[['40-lb bag', '0.30 cu ft'], ['60-lb bag', '0.45 cu ft'], ['80-lb bag', '0.60 cu ft'], ['Ready-mix truck', '≥ 1 cubic yard']].map((r, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-2)', marginBottom: 3 }}>
                <span>{r[0]}</span><span style={{ fontWeight: 600 }}>{r[1]}</span>
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
