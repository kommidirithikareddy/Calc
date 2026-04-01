import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import FormulaCard from '../../components/calculator/FormulaCard'
import AIHintCard from '../../components/calculator/AIHintCard'

const SHAPES = [
  { id: 'slab',    label: 'Rectangular slab', icon: '▬' },
  { id: 'column',  label: 'Circular column',  icon: '🔵' },
  { id: 'footing', label: 'Square footing',    icon: '⬜' },
  { id: 'wall',    label: 'Retaining wall',    icon: '🧱' },
  { id: 'stairs',  label: 'Stair flight',      icon: '🪜' },
]

const MIX_RATIOS = [
  { label: 'M15 (1:2:4)',   cement_m3: 8.0,  sand_m3: 0.44, agg_m3: 0.88 },
  { label: 'M20 (1:1.5:3)', cement_m3: 9.5,  sand_m3: 0.39, agg_m3: 0.78 },
  { label: 'M25 (1:1:2)',   cement_m3: 11.2, sand_m3: 0.33, agg_m3: 0.66 },
  { label: 'M30 (RMC)',     cement_m3: 12.0, sand_m3: 0.30, agg_m3: 0.60 },
]

const FAQ = [
  { q: 'Why add extra waste percentage?', a: 'Concrete volume is always ordered with extra to account for spillage, form leakage, uneven subgrade, and the need to slightly overfill forms. Standard practice adds 5–10% for slabs and footings, 10–15% for columns and complex shapes. Running out mid-pour creates a cold joint — a critical defect.' },
  { q: 'What is the difference between M15, M20 and M25 concrete?', a: 'The M-number refers to characteristic compressive strength in MPa at 28 days. M15 (15 MPa) is used for plain concrete, blinding layers and non-structural fills. M20 (20 MPa) is the minimum for reinforced concrete in India per IS 456. M25 and above are for structural members in aggressive environments or high loads.' },
  { q: 'How many bags of cement per cubic metre?', a: 'Approximately: M15 = 8 bags/m³, M20 = 9.5 bags/m³, M25 = 11 bags/m³. One 50kg bag of OPC cement has a volume of approximately 0.035 m³. These are nominal quantities — actual values depend on water-cement ratio, admixtures and aggregate quality.' },
  { q: 'What is the curing period for concrete?', a: 'Concrete must be kept moist for minimum 7 days (14 days for M30+) to achieve full strength. Curing prevents premature drying which causes surface cracks and reduces strength. Methods include wet burlap, curing compound, ponding (for slabs), or covering with plastic sheeting.' },
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

export default function ConcreteVolumeCalculator({ meta, category }) {
  const C = category?.color || '#f59e0b'
  const [shapeId, setShapeId] = useState('slab')
  const [L, setL] = useState(5)
  const [W, setW] = useState(4)
  const [D, setD] = useState(0.15)
  const [dia, setDia] = useState(0.3)
  const [waste, setWaste] = useState(10)
  const [mixIdx, setMixIdx] = useState(1)
  const [openFaq, setOpenFaq] = useState(null)

  const mix = MIX_RATIOS[mixIdx]

  let volume = 0
  if (shapeId === 'slab')    volume = L * W * D
  else if (shapeId === 'column')  volume = Math.PI * (dia/2)**2 * L
  else if (shapeId === 'footing') volume = L * L * D
  else if (shapeId === 'wall')    volume = L * W * D
  else if (shapeId === 'stairs') {
    const riser = 0.15, going = 0.25, nSteps = Math.round(W)
    volume = nSteps * going * riser * L / 2 + nSteps * going * D * L
  }

  const withWaste = volume * (1 + waste / 100)
  const m3_yd3 = withWaste * 1.30795
  const weight_kg = withWaste * 2400
  const cementBags = withWaste * mix.cement_m3
  const sand_m3 = withWaste * mix.sand_m3
  const agg_m3 = withWaste * mix.agg_m3

  const hint = `Volume: ${volume.toFixed(3)} m³ + ${waste}% waste = ${withWaste.toFixed(3)} m³ (${m3_yd3.toFixed(2)} yd³). ${cementBags.toFixed(0)} bags cement, ${sand_m3.toFixed(2)} m³ sand.`

  const inputFields = {
    slab:    [['Length L (m)', L, setL], ['Width W (m)', W, setW], ['Thickness D (m)', D, setD]],
    column:  [['Height H (m)', L, setL], ['Diameter (m)', dia, setDia]],
    footing: [['Side length (m)', L, setL], ['Depth D (m)', D, setD]],
    wall:    [['Length (m)', L, setL], ['Height (m)', W, setW], ['Thickness (m)', D, setD]],
    stairs:  [['Width (m)', L, setL], ['No. of steps', W, setW], ['Slab thickness (m)', D, setD]],
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      <div style={{ background: `linear-gradient(135deg,${C}15,${C}06)`, border: `1px solid ${C}30`, borderRadius: 14, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>Concrete Volume</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>V + waste = order quantity</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {[{ l: 'Net volume', v: `${volume.toFixed(3)} m³` }, { l: 'Order', v: `${withWaste.toFixed(2)} m³` }].map((m, i) => (
            <div key={i} style={{ padding: '8px 14px', background: C + '15', borderRadius: 9, textAlign: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>{m.v}</div>
              <div style={{ fontSize: 10, color: 'var(--text-3)' }}>{m.l}</div>
            </div>
          ))}
        </div>
      </div>

      <Sec title="Select element type">
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {SHAPES.map(s => (
            <button key={s.id} onClick={() => setShapeId(s.id)}
              style={{ padding: '9px 14px', borderRadius: 9, border: `1.5px solid ${shapeId === s.id ? C : 'var(--border-2)'}`, background: shapeId === s.id ? C + '12' : 'var(--bg-raised)', fontSize: 12, fontWeight: shapeId === s.id ? 700 : 500, color: shapeId === s.id ? C : 'var(--text)', cursor: 'pointer' }}>
              {s.icon} {s.label}
            </button>
          ))}
        </div>
      </Sec>

      <CalcShell
        left={<>
          {(inputFields[shapeId] || []).map(([l, v, set]) => (
            <div key={l} style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 6 }}>{l}</label>
              <input type="number" step="0.01" value={v} onChange={e => set(Math.max(0.01, +e.target.value))} style={{ width: '100%', height: 44, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 14px', fontSize: 17, fontWeight: 700, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', fontFamily: "'Space Grotesk',sans-serif", boxSizing: 'border-box' }} />
            </div>
          ))}

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 6 }}>Waste / overage: {waste}%</label>
            <input type="range" min="0" max="20" value={waste} onChange={e => setWaste(+e.target.value)} style={{ width: '100%', accentColor: C }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-3)' }}><span>0%</span><span>Typical 5–10%</span><span>20%</span></div>
          </div>

          <div>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 8 }}>Mix ratio</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {MIX_RATIOS.map((m, i) => (
                <button key={i} onClick={() => setMixIdx(i)}
                  style={{ padding: '8px 12px', borderRadius: 8, border: `1px solid ${mixIdx === i ? C : 'var(--border-2)'}`, background: mixIdx === i ? C + '12' : 'var(--bg-raised)', fontSize: 12, fontWeight: mixIdx === i ? 700 : 400, color: mixIdx === i ? C : 'var(--text)', cursor: 'pointer', textAlign: 'left' }}>
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </>}
        right={<>
          <BreakdownTable title="Volume results" rows={[
            { label: 'Net volume', value: `${volume.toFixed(3)} m³`, bold: true, highlight: true, color: C },
            { label: `With ${waste}% waste`, value: `${withWaste.toFixed(3)} m³` },
            { label: 'Cubic yards', value: `${m3_yd3.toFixed(2)} yd³` },
            { label: 'Concrete weight', value: `${(weight_kg/1000).toFixed(2)} tonnes` },
          ]} />
          <BreakdownTable title={`${mix.label} material quantities`} rows={[
            { label: 'Cement bags (50kg)', value: `${cementBags.toFixed(0)} bags`, bold: true, highlight: true, color: C },
            { label: 'Sand', value: `${sand_m3.toFixed(3)} m³ (${(sand_m3*1600).toFixed(0)} kg)` },
            { label: 'Aggregate (20mm)', value: `${agg_m3.toFixed(3)} m³ (${(agg_m3*1500).toFixed(0)} kg)` },
            { label: 'Water (W/C=0.5)', value: `${(cementBags*50*0.5).toFixed(0)} litres` },
          ]} />
          <AIHintCard hint={hint} />
        </>}
      />

      <Sec title="Concrete grade selection guide">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[
            { grade: 'M10', use: 'Blinding, non-structural fills', color: '#9ca3af' },
            { grade: 'M15', use: 'PCC, pathway slabs, levelling', color: '#6b7280' },
            { grade: 'M20', use: 'RCC slabs, beams, columns (min per IS 456)', color: C },
            { grade: 'M25', use: 'Foundations, footings, structural work', color: '#f59e0b' },
            { grade: 'M30', use: 'Pre-stressed, marine, aggressive exposure', color: '#ef4444' },
            { grade: 'M35+', use: 'High-rise columns, bridges, heavy industry', color: '#dc2626' },
          ].map((g, i) => (
            <div key={i} style={{ padding: '10px 12px', borderRadius: 9, background: g.color + '08', border: `1px solid ${g.color}25` }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: g.color }}>{g.grade}</div>
              <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 3 }}>{g.use}</div>
            </div>
          ))}
        </div>
      </Sec>

      <FormulaCard
        formula={'V_slab = L × W × D\nV_column = π × r² × H\nV_footing = a × b × D\nOrder qty = V × (1 + waste%)'}
        variables={[
          { symbol: 'V', meaning: 'Volume of concrete (m³)' },
          { symbol: 'L, W, D', meaning: 'Length, width, depth/thickness (m)' },
          { symbol: 'r', meaning: 'Column radius (m)' },
          { symbol: 'waste%', meaning: 'Overage allowance (5–15% typical)' },
        ]}
        explanation="Always order concrete with a waste factor — running short mid-pour creates a cold joint, which is a critical structural defect that may require breaking out and re-pouring. Material quantities depend on mix design; nominal ratios given are approximate."
      />

      <Sec title="Frequently asked questions">
        {FAQ.map((f, i) => <Acc key={i} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} color={C} />)}
      </Sec>
    </div>
  )
}
