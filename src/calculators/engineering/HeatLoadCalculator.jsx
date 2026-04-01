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

const INSULATION = [
  { label: 'Poor (old buildings)', u: 0.8 },
  { label: 'Average (1980s)', u: 0.5 },
  { label: 'Good (modern)', u: 0.3 },
  { label: 'Excellent (passive)', u: 0.15 },
]

const CLIMATES = [
  { label: 'Hot (Miami, Dubai)', dt: 15 },
  { label: 'Moderate (NYC, London)', dt: 25 },
  { label: 'Cold (Chicago, Berlin)', dt: 35 },
  { label: 'Very cold (Minneapolis)', dt: 50 },
]

const FAQ = [
  { q: 'What is a BTU and how does it relate to tons of cooling?', a: 'BTU (British Thermal Unit) is the energy needed to raise 1 lb of water by 1°F. In HVAC, BTU/hr is the rate of heating or cooling. 1 ton of cooling = 12,000 BTU/hr (based on the energy to melt 1 ton of ice in 24 hours). A typical home room needs 5,000–15,000 BTU/hr.' },
  { q: 'What is the rule of thumb for sizing HVAC?', a: 'A rough rule: 20 BTU/hr per square foot for cooling in moderate climates. Add 600 BTU/hr per occupant, 4,000 BTU/hr for kitchen, and additional for poor insulation or extreme climates. This calculator uses a more accurate envelope model.' },
  { q: 'Why is Manual J the gold standard?', a: 'ACCA Manual J accounts for: orientation, insulation values, window areas and types, internal gains from people/lighting/equipment, local climate data, and infiltration rates. A proper Manual J analysis by an HVAC engineer is required for most new construction permits and gives accurate equipment sizing.' },
]

export default function HeatLoadCalculator({ meta, category }) {
  const C = category?.color || '#f59e0b'
  const [length, setLength] = useState(5)
  const [width, setWidth] = useState(4)
  const [height, setHeight] = useState(3)
  const [insIdx, setInsIdx] = useState(1)
  const [climIdx, setClimIdx] = useState(1)
  const [occupants, setOccupants] = useState(2)
  const [windows, setWindows] = useState(2)
  const [openFaq, setOpenFaq] = useState(null)

  const ins = INSULATION[insIdx]
  const clim = CLIMATES[climIdx]
  const wallArea = 2 * (length + width) * height
  const ceilArea = length * width
  const windowArea = windows * 1.5
  const envLoad = (wallArea + ceilArea + windowArea) * ins.u * clim.dt
  const occupantLoad = occupants * 75
  const lightingLoad = ceilArea * 10
  const totalW = envLoad + occupantLoad + lightingLoad
  const btu = totalW * 3.412
  const tons = btu / 12000
  const kW = totalW / 1000

  const hint = `Room ${length}×${width}×${height}m: Heat load = ${totalW.toFixed(0)}W = ${btu.toFixed(0)} BTU/hr = ${tons.toFixed(2)} tons. Insulation: ${ins.label}, ΔT: ${clim.dt}°C.`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ background: `linear-gradient(135deg,${C}15,${C}06)`, border: `1px solid ${C}30`, borderRadius: 14, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>Heat Load Estimation</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>Q = U × A × ΔT + Internal gains</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {[{ l: 'BTU/hr', v: btu.toFixed(0) }, { l: 'Tons', v: tons.toFixed(2) }].map((m, i) => (
            <div key={i} style={{ padding: '8px 14px', background: C + '15', borderRadius: 9, textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>{m.v}</div>
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
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 8 }}>Insulation quality</label>
            {INSULATION.map((ins, i) => (
              <button key={i} onClick={() => setInsIdx(i)} style={{ display: 'block', width: '100%', marginBottom: 5, padding: '8px 12px', borderRadius: 8, border: `1.5px solid ${insIdx === i ? C : 'var(--border-2)'}`, background: insIdx === i ? C + '12' : 'var(--bg-raised)', fontSize: 12, fontWeight: insIdx === i ? 700 : 400, color: insIdx === i ? C : 'var(--text)', cursor: 'pointer', textAlign: 'left' }}>
                {ins.label} (U={ins.u} W/m²·K)
              </button>
            ))}
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 8 }}>Climate / design ΔT</label>
            {CLIMATES.map((cl, i) => (
              <button key={i} onClick={() => setClimIdx(i)} style={{ display: 'block', width: '100%', marginBottom: 5, padding: '8px 12px', borderRadius: 8, border: `1.5px solid ${climIdx === i ? C : 'var(--border-2)'}`, background: climIdx === i ? C + '12' : 'var(--bg-raised)', fontSize: 12, fontWeight: climIdx === i ? 700 : 400, color: climIdx === i ? C : 'var(--text)', cursor: 'pointer', textAlign: 'left' }}>
                {cl.label} (ΔT={cl.dt}°C)
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[['Occupants', occupants, setOccupants, 1, 50], ['Windows', windows, setWindows, 0, 20]].map(([l, v, set, min, max]) => (
              <div key={l}>
                <label style={{ fontSize: 11, color: 'var(--text-3)', display: 'block', marginBottom: 3 }}>{l}</label>
                <input type="number" value={v} onChange={e => set(Math.max(min, +e.target.value))} style={{ width: '100%', height: 40, border: '1px solid var(--border-2)', borderRadius: 7, padding: '0 8px', fontSize: 14, fontWeight: 700, background: 'var(--bg-card)', color: 'var(--text)', boxSizing: 'border-box' }} />
              </div>
            ))}
          </div>
        </>}
        right={<>
          <BreakdownTable title="Load breakdown" rows={[
            { label: 'Envelope (walls/ceiling)', value: `${envLoad.toFixed(0)} W` },
            { label: 'Occupant load', value: `${occupantLoad.toFixed(0)} W` },
            { label: 'Lighting estimate', value: `${lightingLoad.toFixed(0)} W` },
            { label: 'Total load (W)', value: `${totalW.toFixed(0)} W`, bold: true, highlight: true, color: C },
            { label: 'BTU/hr', value: btu.toFixed(0) },
            { label: 'Tons of cooling', value: tons.toFixed(2) },
            { label: 'kW cooling', value: kW.toFixed(2) },
          ]} />
          {/* AC size recommendation */}
          <div style={{ padding: '12px 14px', background: C + '10', borderRadius: 10, marginTop: 12, border: `1px solid ${C}25` }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C, marginBottom: 6 }}>💡 AC Recommendation</div>
            <div style={{ fontSize: 13, color: 'var(--text)' }}>Select a unit rated <strong>{Math.ceil(tons * 2) / 2} tons</strong> or <strong>{(Math.ceil(kW * 2) / 2).toFixed(1)} kW</strong></div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>Always add 10–15% oversizing buffer for peak conditions</div>
          </div>
          <AIHintCard hint={hint} />
        </>}
      />

      <Sec title="Internal heat gains reference" sub="Typical values for load calculations">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[['Person (seated)', '75 W sensible', '#3b82f6'], ['Person (active)', '150 W sensible', '#3b82f6'], ['LED lighting', '10 W/m²', '#f59e0b'], ['Desktop computer', '150 W', '#6366f1'], ['Laptop', '50 W', '#6366f1'], ['Commercial kitchen', '1500 W', '#ef4444'], ['Server rack', '3–20 kW', '#ef4444'], ['Window solar gain', '400 W/m²', '#f97316']].map(([name, v, c], i) => (
            <div key={i} style={{ padding: '9px 12px', background: 'var(--bg-raised)', borderRadius: 8, border: '0.5px solid var(--border)' }}>
              <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{name}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: c, fontFamily: "'Space Grotesk',sans-serif" }}>{v}</div>
            </div>
          ))}
        </div>
      </Sec>

      <FormulaCard
        formula={'Q_envelope = U × A × ΔT\nQ_total = Q_envelope + Q_people + Q_lighting + Q_equipment\n1 ton = 12,000 BTU/hr = 3.517 kW'}
        variables={[
          { symbol: 'U', meaning: 'Overall heat transfer coefficient (W/m²·K)' },
          { symbol: 'A', meaning: 'Surface area (m²)' },
          { symbol: 'ΔT', meaning: 'Design temperature difference (°C)' },
          { symbol: 'Q', meaning: 'Heat load (W or BTU/hr)' },
        ]}
        explanation="HVAC heat load combines envelope losses (conduction through walls, roof, windows) with internal gains (people, lighting, equipment). The envelope load uses the U-value (thermal transmittance) times surface area times temperature difference. Internal gains add directly to cooling load."
      />

      <Sec title="Frequently asked questions">
        {FAQ.map((f, i) => <Acc key={i} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} color={C} />)}
      </Sec>
    </div>
  )
}
