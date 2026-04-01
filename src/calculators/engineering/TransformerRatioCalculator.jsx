import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import FormulaCard from '../../components/calculator/FormulaCard'
import AIHintCard from '../../components/calculator/AIHintCard'

const fmtSI = (val, unit) => {
  if (val === null || isNaN(val) || !isFinite(val)) return '—'
  const abs = Math.abs(val)
  if (abs >= 1e6) return (val/1e6).toFixed(3) + ' M' + unit
  if (abs >= 1e3) return (val/1e3).toFixed(3) + ' k' + unit
  if (abs >= 1)   return val.toFixed(3) + ' ' + unit
  if (abs >= 1e-3) return (val*1e3).toFixed(3) + ' m' + unit
  return val.toExponential(3) + ' ' + unit
}

const TRANSFORMER_TYPES = [
  { name: 'Power distribution', ratio: '10:1 to 20:1', use: '11kV → 415V, utility distribution', icon: '⚡' },
  { name: 'Step-down (mains)', ratio: '2:1 to 10:1', use: '240V → 24V, equipment supply', icon: '🔌' },
  { name: 'Isolation', ratio: '1:1', use: 'Safety isolation, noise reduction', icon: '🛡️' },
  { name: 'Step-up', ratio: '1:5 to 1:50', use: 'Inverters, audio output stages', icon: '📈' },
  { name: 'Current (CT)', ratio: '100:5, 200:5', use: 'Metering, protection relays', icon: '🔄' },
  { name: 'Audio output', ratio: '20:1 to 50:1', use: 'Valve amplifier to speaker', icon: '🔊' },
]

const FAQ = [
  { q: 'What is transformer turns ratio?', a: 'The turns ratio N = N1/N2 is the ratio of primary to secondary turns. It determines voltage transformation: V2/V1 = N2/N1. A transformer with 200 primary turns and 50 secondary turns has a ratio of 4:1, stepping voltage down by 4.' },
  { q: 'Why does current transform inversely to voltage?', a: 'Conservation of energy requires that (ignoring losses) power in = power out: V1 × I1 = V2 × I2. If voltage steps down by 4×, current must step up by 4× to maintain the same power. This is why distribution systems use high voltage — lower current means less I²R loss in the cables.' },
  { q: 'What are transformer losses?', a: 'Core losses (hysteresis and eddy current losses) occur in the iron core and are nearly constant regardless of load. Copper losses (I²R in windings) increase with load current squared. Modern distribution transformers are 97–99.5% efficient at full load.' },
  { q: 'What does the impedance matching formula mean?', a: 'Transformers can match impedances: Z1/Z2 = (N1/N2)². If you need to connect a 600Ω microphone to a 50Ω input, the turns ratio = √(600/50) = 3.46:1. Impedance matching maximizes power transfer — critical in audio and RF circuits.' },
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

export default function TransformerRatioCalculator({ meta, category }) {
  const C = category?.color || '#f59e0b'
  const [n1, setN1] = useState(200)
  const [n2, setN2] = useState(50)
  const [v1, setV1] = useState(240)
  const [i1, setI1] = useState(2)
  const [efficiency, setEfficiency] = useState(98)
  const [openFaq, setOpenFaq] = useState(null)

  const ratio = n2 > 0 ? n1 / n2 : null
  const v2 = ratio ? v1 / ratio : null
  const i2_ideal = ratio ? i1 * ratio : null
  const i2_actual = i1 && efficiency ? (i1 * v1 * (efficiency / 100)) / (v2 || 1) : null
  const powerIn = v1 * i1
  const powerOut = powerIn * (efficiency / 100)
  const losses = powerIn - powerOut
  const z_ratio = ratio ? ratio * ratio : null

  const hint = `Turns ratio ${n1}:${n2} (${ratio?.toFixed(2)}:1). V2=${v2?.toFixed(2)}V, I2≈${i2_actual?.toFixed(3)}A. Power in=${powerIn.toFixed(1)}W, out=${powerOut.toFixed(1)}W, losses=${losses.toFixed(1)}W.`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      <div style={{ background: `linear-gradient(135deg,${C}15,${C}06)`, border: `1px solid ${C}30`, borderRadius: 14, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>Transformer Ratio</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>V2/V1 = N2/N1 · I2/I1 = N1/N2</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>{ratio?.toFixed(2)}:1</div>
          <div style={{ fontSize: 11, color: 'var(--text-3)' }}>turns ratio</div>
        </div>
      </div>

      <CalcShell
        left={<>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
            {[['Primary turns (N1)', n1, setN1], ['Secondary turns (N2)', n2, setN2]].map(([l, v, set]) => (
              <div key={l}>
                <label style={{ fontSize: 11, color: 'var(--text-3)', display: 'block', marginBottom: 4 }}>{l}</label>
                <input type="number" value={v} onChange={e => set(Math.max(1, +e.target.value))} style={{ width: '100%', height: 40, border: '1px solid var(--border-2)', borderRadius: 7, padding: '0 10px', fontSize: 14, fontWeight: 700, background: 'var(--bg-card)', color: 'var(--text)', boxSizing: 'border-box' }} />
              </div>
            ))}
          </div>
          {[['Primary voltage V1 (V)', v1, setV1, 1, 100000], ['Primary current I1 (A)', i1, setI1, 0.001, 10000]].map(([l, v, set, min]) => (
            <div key={l} style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 6 }}>{l}</label>
              <input type="number" value={v} onChange={e => set(Math.max(min, +e.target.value))} style={{ width: '100%', height: 44, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 14px', fontSize: 17, fontWeight: 700, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', fontFamily: "'Space Grotesk',sans-serif", boxSizing: 'border-box' }} />
            </div>
          ))}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 6 }}>Efficiency: {efficiency}%</label>
            <input type="range" min="50" max="100" step="0.5" value={efficiency} onChange={e => setEfficiency(+e.target.value)} style={{ width: '100%', accentColor: C }} />
          </div>
        </>}
        right={<>
          <BreakdownTable title="Transformer results" rows={[
            { label: 'Turns ratio', value: `${n1}:${n2} (${ratio?.toFixed(3)}:1)`, bold: true, highlight: true, color: C },
            { label: 'Secondary voltage (V2)', value: fmtSI(v2, 'V'), color: C },
            { label: 'Primary current (I1)', value: fmtSI(i1, 'A') },
            { label: 'Secondary current (I2)', value: fmtSI(i2_actual, 'A') },
            { label: 'Power input', value: fmtSI(powerIn, 'W') },
            { label: 'Power output', value: fmtSI(powerOut, 'W') },
            { label: 'Losses', value: fmtSI(losses, 'W') },
            { label: 'Impedance ratio (Z)', value: `${z_ratio?.toFixed(2)}:1` },
          ]} />
          <AIHintCard hint={hint} />
        </>}
      />

      {/* Visual transformer diagram */}
      <Sec title="Transformer diagram">
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0' }}>
          <svg width="340" height="100" viewBox="0 0 340 100">
            {/* Primary coil representation */}
            <line x1="20" y1="50" x2="80" y2="50" stroke="#9ca3af" strokeWidth="2"/>
            {[0,1,2,3].map(i => <ellipse key={i} cx={90 + i*14} cy="50" rx="8" ry="20" fill="none" stroke={C} strokeWidth="2"/>)}
            {/* Core */}
            <rect x="140" y="20" width="14" height="60" fill="#78716c" rx="3"/>
            {/* Secondary coil */}
            {[0,1,2].map(i => <ellipse key={i} cx={162 + i*14} cy="50" rx="8" ry="20" fill="none" stroke="#3b82f6" strokeWidth="2"/>)}
            <line x1="200" y1="50" x2="320" y2="50" stroke="#9ca3af" strokeWidth="2"/>
            {/* Labels */}
            <text x="50" y="90" textAnchor="middle" fontSize="10" fill={C} fontWeight="700">Primary</text>
            <text x="50" y="100" textAnchor="middle" fontSize="10" fill="var(--text-3)">{n1} turns</text>
            <text x="178" y="90" textAnchor="middle" fontSize="10" fill="#3b82f6" fontWeight="700">Secondary</text>
            <text x="178" y="100" textAnchor="middle" fontSize="10" fill="var(--text-3)">{n2} turns</text>
            {/* Voltage labels */}
            <text x="40" y="35" textAnchor="middle" fontSize="11" fill={C} fontWeight="700">{v1}V</text>
            <text x="270" y="35" textAnchor="middle" fontSize="11" fill="#3b82f6" fontWeight="700">{v2?.toFixed(1)}V</text>
            <text x="40" y="70" textAnchor="middle" fontSize="10" fill="var(--text-3)">{i1}A →</text>
            <text x="270" y="70" textAnchor="middle" fontSize="10" fill="var(--text-3)">← {i2_actual?.toFixed(2)}A</text>
          </svg>
        </div>
      </Sec>

      <Sec title="Common transformer applications">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {TRANSFORMER_TYPES.map((t, i) => (
            <div key={i} style={{ padding: '11px 13px', borderRadius: 9, background: 'var(--bg-raised)', border: '0.5px solid var(--border)' }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontSize: 16 }}>{t.icon}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: C }}>{t.name}</span>
              </div>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)', marginBottom: 2, fontFamily: "'Space Grotesk',sans-serif" }}>{t.ratio}</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{t.use}</div>
            </div>
          ))}
        </div>
      </Sec>

      <FormulaCard
        formula={'N = N1/N2 (turns ratio)\nV2 = V1 × (N2/N1)\nI2 = I1 × (N1/N2)\nZ2/Z1 = (N2/N1)²'}
        variables={[
          { symbol: 'N', meaning: 'Turns ratio (N1:N2)' },
          { symbol: 'V1, V2', meaning: 'Primary and secondary voltages' },
          { symbol: 'I1, I2', meaning: 'Primary and secondary currents' },
          { symbol: 'Z', meaning: 'Impedance (transforms as N²)' },
        ]}
        explanation="An ideal transformer conserves power: V1×I1 = V2×I2. Voltage transforms proportional to turns ratio; current transforms inversely. Impedance transforms as the square of the turns ratio — essential for impedance matching in audio and RF circuits."
      />

      <Sec title="Frequently asked questions">
        {FAQ.map((f, i) => <Acc key={i} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} color={C} />)}
      </Sec>
    </div>
  )
}
