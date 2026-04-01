import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import FormulaCard from '../../components/calculator/FormulaCard'
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
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', lineHeight: 1.4 }}>{q}</span>
        <span style={{ fontSize: 18, color, flexShrink: 0, display: 'inline-block', transform: open ? 'rotate(45deg)' : 'none', transition: 'transform .2s' }}>+</span>
      </button>
      {open && <p style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.75, margin: '0 0 13px' }}>{a}</p>}
    </div>
  )
}

const SPACE_TYPES = [
  { type: 'Office', ach: 6, cfm_per_person: 17 },
  { type: 'Classroom', ach: 6, cfm_per_person: 15 },
  { type: 'Hospital room', ach: 12, cfm_per_person: 25 },
  { type: 'Restaurant', ach: 15, cfm_per_person: 20 },
  { type: 'Server room', ach: 30, cfm_per_person: 0 },
  { type: 'Residential', ach: 0.5, cfm_per_person: 10 },
]

const FAQ = [
  { q: 'What are air changes per hour (ACH)?', a: 'ACH is the number of times the total air volume of a room is replaced per hour. ASHRAE 62.1 defines minimum ACH requirements by space type. Higher ACH means better ventilation and air quality but more energy use. Residential spaces typically need 0.35 ACH minimum; hospitals require 12+ ACH for infection control.' },
  { q: 'How is CFM calculated from ACH?', a: 'CFM = (Volume in cubic feet × ACH) / 60. Or: CFM = Room volume (m³) × ACH × 35.31 / 60. The factor 35.31 converts m³ to ft³. This gives the required supply airflow rate in cubic feet per minute.' },
  { q: 'How do I size supply air ducts from CFM?', a: 'Duct sizing uses the equal friction method: select duct size so friction loss is 0.1 inches of water per 100 feet of duct. For rectangular ducts, use the hydraulic diameter. Target duct velocities: main ducts 6-8 m/s (1200-1600 fpm), branch ducts 4-5 m/s.' },
]

export default function HVACCalculator({ meta, category }) {
  const C = category?.color || '#f59e0b'
  const [length, setLength] = useState(10)
  const [width, setWidth] = useState(8)
  const [height, setHeight] = useState(3)
  const [spaceIdx, setSpaceIdx] = useState(0)
  const [occupants, setOccupants] = useState(10)
  const [openFaq, setOpenFaq] = useState(null)

  const space = SPACE_TYPES[spaceIdx]
  const vol_m3 = length * width * height
  const vol_ft3 = vol_m3 * 35.31
  const cfm_ach = (vol_ft3 * space.ach) / 60
  const cfm_person = occupants * space.cfm_per_person
  const cfm_total = Math.max(cfm_ach, cfm_person)
  const ls_total = cfm_total * 0.4719
  const ach_actual = (cfm_total * 60) / vol_ft3

  // Duct sizing (circular duct at 5 m/s)
  const duct_area_m2 = (ls_total / 1000) / 5
  const duct_d_mm = 2 * Math.sqrt(duct_area_m2 / Math.PI) * 1000

  const hint = `${space.type}, ${vol_m3.toFixed(0)}m³, ${occupants} people: Need ${cfm_total.toFixed(0)} CFM (${ls_total.toFixed(1)} L/s) = ${ach_actual.toFixed(1)} ACH. Duct diameter: ${duct_d_mm.toFixed(0)}mm.`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ background: `linear-gradient(135deg,${C}15,${C}06)`, border: `1px solid ${C}30`, borderRadius: 14, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>HVAC Airflow</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>CFM = (Vol × ACH) / 60</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {[{ l: 'CFM', v: cfm_total.toFixed(0) }, { l: 'L/s', v: ls_total.toFixed(1) }, { l: 'ACH', v: ach_actual.toFixed(1) }].map((m, i) => (
            <div key={i} style={{ padding: '8px 12px', background: C + '15', borderRadius: 9, textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>{m.v}</div>
              <div style={{ fontSize: 10, color: 'var(--text-3)' }}>{m.l}</div>
            </div>
          ))}
        </div>
      </div>

      <CalcShell
        left={<>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 14 }}>
            {[['Length (m)', length, setLength], ['Width (m)', width, setWidth], ['Height (m)', height, setHeight]].map(([l, v, set]) => (
              <div key={l}>
                <label style={{ fontSize: 11, color: 'var(--text-3)', display: 'block', marginBottom: 3 }}>{l}</label>
                <input type="number" step="0.5" value={v} onChange={e => set(+e.target.value)} style={{ width: '100%', height: 40, border: '1px solid var(--border-2)', borderRadius: 7, padding: '0 8px', fontSize: 14, fontWeight: 700, background: 'var(--bg-card)', color: 'var(--text)', boxSizing: 'border-box' }} />
              </div>
            ))}
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 8 }}>Space type</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {SPACE_TYPES.map((s, i) => (
                <button key={i} onClick={() => setSpaceIdx(i)} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', borderRadius: 8, border: `1.5px solid ${spaceIdx === i ? C : 'var(--border-2)'}`, background: spaceIdx === i ? C + '12' : 'var(--bg-raised)', cursor: 'pointer' }}>
                  <span style={{ fontSize: 12, color: spaceIdx === i ? C : 'var(--text)' }}>{s.type}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{s.ach} ACH min</span>
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 6 }}>Number of occupants</label>
            <input type="number" value={occupants} onChange={e => setOccupants(+e.target.value)} style={{ width: '100%', height: 44, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 14px', fontSize: 17, fontWeight: 700, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', fontFamily: "'Space Grotesk',sans-serif", boxSizing: 'border-box' }} />
          </div>
        </>}
        right={<>
          <BreakdownTable title="Airflow results" rows={[
            { label: 'Room volume', value: `${vol_m3.toFixed(1)} m³ (${vol_ft3.toFixed(0)} ft³)` },
            { label: 'Required ACH', value: `${space.ach} (min for ${space.type})` },
            { label: 'CFM by ACH', value: `${cfm_ach.toFixed(0)} CFM` },
            { label: 'CFM by occupancy', value: `${cfm_person.toFixed(0)} CFM` },
            { label: 'Design CFM (max)', value: `${cfm_total.toFixed(0)} CFM`, bold: true, highlight: true, color: C },
            { label: 'Flow in L/s', value: `${ls_total.toFixed(1)} L/s` },
            { label: 'Circular duct size', value: `⌀${duct_d_mm.toFixed(0)} mm` },
          ]} />
          <AIHintCard hint={hint} />
        </>}
      />

      <Sec title="ASHRAE minimum ACH by space type" sub="62.1 Ventilation Standard">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[...SPACE_TYPES, { type: 'Operating room', ach: 25 }, { type: 'Pharmacy', ach: 12 }, { type: 'Gym', ach: 10 }, { type: 'Parking garage', ach: 6 }].map((s, i) => (
            <div key={i} style={{ padding: '9px 12px', background: 'var(--bg-raised)', borderRadius: 8, border: '0.5px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: 'var(--text)' }}>{s.type}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>{s.ach} ACH</span>
            </div>
          ))}
        </div>
      </Sec>

      <FormulaCard
        formula={'CFM = (Volume_ft³ × ACH) / 60\nL/s = CFM × 0.4719\nDuct area = Q / v'}
        variables={[
          { symbol: 'CFM', meaning: 'Cubic feet per minute' },
          { symbol: 'ACH', meaning: 'Air changes per hour' },
          { symbol: 'Q', meaning: 'Flow rate (m³/s or L/s)' },
          { symbol: 'v', meaning: 'Air velocity in duct (m/s)' },
        ]}
        explanation="HVAC sizing takes the greater of: (1) ACH-based airflow for space type, (2) occupancy-based airflow per person. Both criteria from ASHRAE 62.1 must be satisfied. Duct size is then calculated to maintain target velocity."
      />

      <Sec title="Frequently asked questions">
        {FAQ.map((f, i) => <Acc key={i} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} color={C} />)}
      </Sec>
    </div>
  )
}
