import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import FormulaCard from '../../components/calculator/FormulaCard'
import AIHintCard from '../../components/calculator/AIHintCard'

const SECTIONS = [
  { id: 'round_bar',   label: 'Round bar',     icon: '⬤',  formula: 'd' },
  { id: 'square_bar',  label: 'Square bar',    icon: '⬛', formula: 'a' },
  { id: 'flat_plate',  label: 'Flat plate',    icon: '▬',  formula: 'bxt' },
  { id: 'hex_bar',     label: 'Hex bar',       icon: '⬡',  formula: 's' },
  { id: 'pipe',        label: 'Hollow pipe',   icon: '◯',  formula: 'OD,ID' },
  { id: 'angle',       label: 'Angle section', icon: '∟',  formula: 'bxt' },
  { id: 'rebar',       label: 'TMT rebar',     icon: '〰', formula: 'd' },
]

const MATERIALS = [
  { name: 'Structural steel (mild steel)', density: 7850 },
  { name: 'Stainless steel 304',           density: 8000 },
  { name: 'Stainless steel 316',           density: 7980 },
  { name: 'Alloy steel',                   density: 7900 },
  { name: 'Cast iron',                     density: 7200 },
  { name: 'Aluminium 6061',               density: 2700 },
  { name: 'Copper',                        density: 8900 },
  { name: 'Brass',                         density: 8530 },
]

// D² × 0.00617 (approx, in kg/m for round bar dia in mm)
const REBAR_WEIGHTS = [8, 10, 12, 16, 20, 25, 32, 40].map(d => ({
  dia: d, wt_per_m: d * d * 0.00617
}))

const FAQ = [
  { q: 'What is the formula for steel round bar weight?', a: 'Weight (kg/m) = D² × 0.00617, where D is diameter in mm. This is derived from: Volume = π/4 × (D/1000)² × 1 m³, Weight = Volume × Density (7850 kg/m³). The factor 0.00617 is π/4 × 7850 / 1,000,000 rounded.' },
  { q: 'What does TMT rebar stand for?', a: 'TMT = Thermo-Mechanically Treated. It is a high-strength ribbed steel bar for reinforced concrete, made by quenching hot-rolled rods. Common grades: Fe415 (yield 415 MPa), Fe500 (500 MPa), Fe550D (550 MPa with improved ductility for seismic zones). Standard diameters: 8, 10, 12, 16, 20, 25, 32, 40 mm.' },
  { q: 'How do I calculate the weight of a hollow section?', a: 'Weight = (Outer area − Inner area) × Length × Density. For a round pipe: Weight (kg/m) = π/4 × (OD² − ID²) / 1,000,000 × 7850. For rectangular hollow sections (RHS): Weight = 2 × (B + D − 2t) × t / 1,000,000 × 7850 (per meter), where t is wall thickness.' },
  { q: 'Why does mild steel density vary slightly?', a: 'The standard value is 7850 kg/m³ (density varies 7800–7900 kg/m³ depending on carbon content and alloying elements). Stainless steels are slightly denser due to chromium and nickel content. For structural calculations, 7850 kg/m³ is universally used.' },
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

export default function SteelWeightCalculator({ meta, category }) {
  const C = category?.color || '#f59e0b'
  const [sectionId, setSectionId] = useState('round_bar')
  const [length, setLength] = useState(6)
  const [qty, setQty] = useState(10)
  const [matIdx, setMatIdx] = useState(0)
  const [d1, setD1] = useState(16) // diameter / side / width / OD
  const [d2, setD2] = useState(10) // inner diameter or thickness
  const [openFaq, setOpenFaq] = useState(null)

  const density = MATERIALS[matIdx].density

  // Calculate area in mm²
  let area_mm2 = 0
  if (sectionId === 'round_bar' || sectionId === 'rebar') area_mm2 = Math.PI / 4 * d1 * d1
  else if (sectionId === 'square_bar') area_mm2 = d1 * d1
  else if (sectionId === 'flat_plate') area_mm2 = d1 * d2
  else if (sectionId === 'hex_bar') area_mm2 = (Math.sqrt(3) / 2) * d1 * d1
  else if (sectionId === 'pipe') area_mm2 = Math.PI / 4 * (d1 * d1 - d2 * d2)
  else if (sectionId === 'angle') area_mm2 = 2 * d1 * d2 - d2 * d2

  const wt_per_m = area_mm2 * 1e-6 * density
  const wt_per_piece = wt_per_m * length
  const total_wt = wt_per_piece * qty

  const hint = `${sectionId === 'rebar' ? 'TMT ' : ''}${SECTIONS.find(s=>s.id===sectionId)?.label} ⌀${d1}mm × ${length}m × ${qty} nos: ${total_wt.toFixed(2)} kg (${(total_wt/1000).toFixed(3)} tonnes).`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      <div style={{ background: `linear-gradient(135deg,${C}15,${C}06)`, border: `1px solid ${C}30`, borderRadius: 14, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>Steel Weight</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>W = A × L × ρ</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {[{ l: 'kg/m', v: `${wt_per_m.toFixed(3)} kg/m` }, { l: 'Total weight', v: `${total_wt.toFixed(2)} kg` }].map((m, i) => (
            <div key={i} style={{ padding: '8px 14px', background: C + '15', borderRadius: 9, textAlign: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>{m.v}</div>
              <div style={{ fontSize: 10, color: 'var(--text-3)' }}>{m.l}</div>
            </div>
          ))}
        </div>
      </div>

      <Sec title="Select section type">
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {SECTIONS.map(s => (
            <button key={s.id} onClick={() => setSectionId(s.id)}
              style={{ padding: '8px 12px', borderRadius: 8, border: `1.5px solid ${sectionId === s.id ? C : 'var(--border-2)'}`, background: sectionId === s.id ? C + '12' : 'var(--bg-raised)', fontSize: 12, fontWeight: sectionId === s.id ? 700 : 500, color: sectionId === s.id ? C : 'var(--text)', cursor: 'pointer' }}>
              {s.icon} {s.label}
            </button>
          ))}
        </div>
      </Sec>

      <CalcShell
        left={<>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 6 }}>
              {sectionId === 'round_bar' || sectionId === 'rebar' ? 'Diameter (mm)' : sectionId === 'square_bar' ? 'Side (mm)' : sectionId === 'hex_bar' ? 'Across flats (mm)' : 'Width / OD (mm)'}
            </label>
            <input type="number" value={d1} onChange={e => setD1(Math.max(1, +e.target.value))} style={{ width: '100%', height: 44, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 14px', fontSize: 17, fontWeight: 700, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', fontFamily: "'Space Grotesk',sans-serif", boxSizing: 'border-box' }} />
          </div>

          {(sectionId === 'flat_plate' || sectionId === 'pipe' || sectionId === 'angle') && (
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 6 }}>
                {sectionId === 'pipe' ? 'Inner diameter (mm)' : 'Thickness (mm)'}
              </label>
              <input type="number" value={d2} onChange={e => setD2(Math.max(0.5, +e.target.value))} style={{ width: '100%', height: 44, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 14px', fontSize: 17, fontWeight: 700, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', fontFamily: "'Space Grotesk',sans-serif", boxSizing: 'border-box' }} />
            </div>
          )}

          {[['Length per piece (m)', length, setLength, 0.01], ['Quantity (nos)', qty, setQty, 1]].map(([l, v, set, min]) => (
            <div key={l} style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 6 }}>{l}</label>
              <input type="number" value={v} onChange={e => set(Math.max(min, +e.target.value))} style={{ width: '100%', height: 44, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 14px', fontSize: 17, fontWeight: 700, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', fontFamily: "'Space Grotesk',sans-serif", boxSizing: 'border-box' }} />
            </div>
          ))}

          <div>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 8 }}>Material</label>
            <select value={matIdx} onChange={e => setMatIdx(+e.target.value)} style={{ width: '100%', height: 44, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 14px', fontSize: 13, background: 'var(--bg-card)', color: 'var(--text)' }}>
              {MATERIALS.map((m, i) => <option key={i} value={i}>{m.name} ({m.density} kg/m³)</option>)}
            </select>
          </div>
        </>}
        right={<>
          <BreakdownTable title="Weight results" rows={[
            { label: 'Cross-section area', value: `${area_mm2.toFixed(2)} mm²` },
            { label: 'Weight per metre', value: `${wt_per_m.toFixed(4)} kg/m`, bold: true, highlight: true, color: C },
            { label: 'Weight per piece', value: `${wt_per_piece.toFixed(3)} kg` },
            { label: `Total (× ${qty})`, value: `${total_wt.toFixed(2)} kg`, bold: true },
            { label: 'In tonnes', value: `${(total_wt/1000).toFixed(3)} t` },
            { label: 'Density used', value: `${MATERIALS[matIdx].density} kg/m³` },
          ]} />
          <AIHintCard hint={hint} />
        </>}
      />

      <Sec title="TMT rebar weight reference" sub="Standard deformed bars per IS 1786">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          {REBAR_WEIGHTS.map((r, i) => (
            <div key={i} style={{ padding: '10px 12px', borderRadius: 9, background: 'var(--bg-raised)', border: '0.5px solid var(--border)', cursor: 'pointer' }}
              onClick={() => { setSectionId('rebar'); setD1(r.dia) }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>⌀{r.dia}mm</div>
              <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 2 }}>{r.wt_per_m.toFixed(3)} kg/m</div>
              <div style={{ fontSize: 10, color: 'var(--text-3)' }}>{(r.wt_per_m * 12).toFixed(2)} kg per 12m bar</div>
            </div>
          ))}
        </div>
      </Sec>

      <Sec title="Material density reference">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {MATERIALS.map((m, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', borderRadius: 8, background: matIdx === i ? C + '10' : 'var(--bg-raised)', border: `0.5px solid ${matIdx === i ? C + '30' : 'var(--border)'}`, cursor: 'pointer' }}
              onClick={() => setMatIdx(i)}>
              <span style={{ fontSize: 12, color: matIdx === i ? C : 'var(--text)' }}>{m.name}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: matIdx === i ? C : 'var(--text-2)', fontFamily: "'Space Grotesk',sans-serif" }}>{m.density} kg/m³</span>
            </div>
          ))}
        </div>
      </Sec>

      <FormulaCard
        formula={'W = A × L × ρ\nRound bar: A = π/4 × D²\nFlat: A = b × t\nWt/m (round) = D² × 0.00617'}
        variables={[
          { symbol: 'W', meaning: 'Weight (kg)' },
          { symbol: 'A', meaning: 'Cross-sectional area (m²)' },
          { symbol: 'L', meaning: 'Length (m)' },
          { symbol: 'ρ', meaning: 'Material density (kg/m³)' },
          { symbol: 'D', meaning: 'Diameter (mm) for shortcut formula' },
        ]}
        explanation="Steel weight = Volume × Density. Cross-sectional area depends on shape. The shortcut formula for round steel bars (D² × 0.00617 kg/m) is derived from the full formula using 7850 kg/m³ density — accurate for all mild steel."
      />

      <Sec title="Frequently asked questions">
        {FAQ.map((f, i) => <Acc key={i} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} color={C} />)}
      </Sec>
    </div>
  )
}
