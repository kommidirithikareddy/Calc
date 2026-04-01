import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import FormulaCard from '../../components/calculator/FormulaCard'
import AIHintCard from '../../components/calculator/AIHintCard'

const SOLVE_FOR = [
  { key: 'k', label: 'Spring Constant (k)', unit: 'N/m', color: '#f59e0b' },
  { key: 'F', label: 'Force (F)', unit: 'N', color: '#ef4444' },
  { key: 'x', label: 'Deflection (x)', unit: 'm', color: '#3b82f6' },
]

const SPRING_EXAMPLES = [
  { name: 'Pen spring', k: 500, use: 'Ballpoint pen click mechanism' },
  { name: 'Car door spring', k: 2000, use: 'Door hinges and closers' },
  { name: 'Suspension spring', k: 20000, use: 'Vehicle front/rear suspension' },
  { name: 'Industrial press', k: 500000, use: 'Heavy stamping machinery' },
  { name: 'Watch mainspring', k: 50, use: 'Mechanical watch power source' },
  { name: 'Garage door', k: 5000, use: 'Counterbalance torsion spring' },
]

const FAQ = [
  { q: 'What is Hooke\'s Law?', a: 'Hooke\'s Law states F = kx — the restoring force of a spring is proportional to its displacement. Robert Hooke discovered this in 1678. The spring constant k (N/m) is a measure of stiffness: a higher k means a stiffer spring requiring more force for the same deflection. The law holds only within the elastic limit.' },
  { q: 'What happens beyond the elastic limit?', a: 'When a spring is stretched or compressed beyond its elastic limit, it permanently deforms — it no longer returns to its original length. The proportionality between force and displacement breaks down. Springs are designed to operate well within their elastic range, typically <80% of maximum deflection.' },
  { q: 'How do I calculate natural frequency?', a: 'Natural frequency f = (1/2π)√(k/m). A stiffer spring (higher k) or lighter mass gives higher natural frequency. This is critical in vibration engineering — if operating frequency matches natural frequency, resonance occurs, causing destructive vibrations. This is why machinery is designed to operate far from natural frequency.' },
  { q: 'What is spring potential energy?', a: 'The elastic potential energy stored in a compressed or stretched spring: PE = ½kx². This energy is released when the spring returns to equilibrium. In suspension systems, springs store kinetic energy during impact and release it gradually — smoothing the ride.' },
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

export default function SpringConstantCalculator({ meta, category }) {
  const C = category?.color || '#f59e0b'
  const [solveIdx, setSolveIdx] = useState(0)
  const [k, setK] = useState(1000)
  const [F, setF] = useState(100)
  const [x_m, setX] = useState(0.1)
  const [mass, setMass] = useState(5)
  const [openFaq, setOpenFaq] = useState(null)

  const solveKey = SOLVE_FOR[solveIdx].key
  let kCalc, FCalc, xCalc
  if (solveKey === 'k') { kCalc = F / x_m; FCalc = F; xCalc = x_m }
  else if (solveKey === 'F') { FCalc = k * x_m; kCalc = k; xCalc = x_m }
  else { xCalc = F / k; kCalc = k; FCalc = F }

  const PE = 0.5 * kCalc * xCalc * xCalc
  const natFreq = Math.sqrt(kCalc / mass) / (2 * Math.PI)
  const omega_n = Math.sqrt(kCalc / mass)
  const period = 1 / natFreq

  const hint = `k=${kCalc?.toFixed(1)} N/m, F=${FCalc?.toFixed(2)} N, x=${(xCalc*1000)?.toFixed(1)} mm. PE=${PE?.toFixed(4)} J. Natural freq=${natFreq?.toFixed(2)} Hz.`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      <div style={{ background: `linear-gradient(135deg,${C}15,${C}06)`, border: `1px solid ${C}30`, borderRadius: 14, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>Hooke's Law</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>F = k × x · PE = ½kx²</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {[{ l: 'Spring const', v: `${kCalc?.toFixed(0)} N/m` }, { l: 'Nat. freq', v: `${natFreq?.toFixed(2)} Hz` }].map((m, i) => (
            <div key={i} style={{ padding: '8px 14px', background: C + '15', borderRadius: 10, textAlign: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>{m.v}</div>
              <div style={{ fontSize: 10, color: 'var(--text-3)' }}>{m.l}</div>
            </div>
          ))}
        </div>
      </div>

      <CalcShell
        left={<>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 8 }}>Solve for</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {SOLVE_FOR.map((s, i) => (
                <button key={i} onClick={() => setSolveIdx(i)}
                  style={{ padding: '9px 14px', borderRadius: 9, border: `1.5px solid ${solveIdx === i ? s.color : 'var(--border-2)'}`, background: solveIdx === i ? s.color + '12' : 'var(--bg-raised)', fontSize: 12, fontWeight: solveIdx === i ? 700 : 400, color: solveIdx === i ? s.color : 'var(--text)', cursor: 'pointer', textAlign: 'left' }}>{s.label}</button>
              ))}
            </div>
          </div>

          {solveKey !== 'k' && (
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 6 }}>Spring constant k (N/m)</label>
              <input type="number" value={k} onChange={e => setK(+e.target.value)} style={{ width: '100%', height: 44, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 14px', fontSize: 17, fontWeight: 700, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', fontFamily: "'Space Grotesk',sans-serif", boxSizing: 'border-box' }} />
            </div>
          )}
          {solveKey !== 'F' && (
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 6 }}>Applied force F (N)</label>
              <input type="number" value={F} onChange={e => setF(+e.target.value)} style={{ width: '100%', height: 44, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 14px', fontSize: 17, fontWeight: 700, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', fontFamily: "'Space Grotesk',sans-serif", boxSizing: 'border-box' }} />
            </div>
          )}
          {solveKey !== 'x' && (
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 6 }}>Deflection x (mm)</label>
              <input type="number" step="0.1" value={x_m * 1000} onChange={e => setX(+e.target.value / 1000)} style={{ width: '100%', height: 44, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 14px', fontSize: 17, fontWeight: 700, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', fontFamily: "'Space Grotesk',sans-serif", boxSizing: 'border-box' }} />
            </div>
          )}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 6 }}>Attached mass (kg) — for frequency</label>
            <input type="number" step="0.1" value={mass} onChange={e => setMass(+e.target.value)} style={{ width: '100%', height: 44, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 14px', fontSize: 17, fontWeight: 700, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', fontFamily: "'Space Grotesk',sans-serif", boxSizing: 'border-box' }} />
          </div>

          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 8 }}>Spring examples</div>
            {SPRING_EXAMPLES.slice(0, 4).map((s, i) => (
              <button key={i} onClick={() => { setK(s.k); setSolveIdx(1) }}
                style={{ display: 'flex', justifyContent: 'space-between', width: '100%', padding: '7px 10px', borderRadius: 7, border: '1px solid var(--border)', background: 'var(--bg-raised)', cursor: 'pointer', marginBottom: 5, textAlign: 'left' }}>
                <span style={{ fontSize: 11, color: 'var(--text)' }}>{s.name}</span>
                <span style={{ fontSize: 12, color: C, fontWeight: 700, fontFamily: "'Space Grotesk',sans-serif" }}>{s.k.toLocaleString()} N/m</span>
              </button>
            ))}
          </div>
        </>}

        right={<>
          <BreakdownTable title="Spring results" rows={[
            { label: 'Spring constant (k)', value: `${kCalc?.toFixed(1)} N/m = ${(kCalc/1000)?.toFixed(3)} kN/m`, bold: true, highlight: true, color: C },
            { label: 'Applied force (F)', value: `${FCalc?.toFixed(3)} N = ${(FCalc/9.81)?.toFixed(3)} kgf` },
            { label: 'Deflection (x)', value: `${(xCalc*1000)?.toFixed(3)} mm = ${(xCalc*100)?.toFixed(4)} cm` },
            { label: 'Potential energy', value: `${PE?.toFixed(5)} J` },
            { label: 'Natural frequency', value: `${natFreq?.toFixed(3)} Hz` },
            { label: 'Angular frequency (ω)', value: `${omega_n?.toFixed(3)} rad/s` },
            { label: 'Period', value: `${period?.toFixed(4)} s` },
          ]} />

          {/* Spring animation viz */}
          <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 12, padding: '14px 16px', marginTop: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>Force-deflection relationship</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {[0.25, 0.5, 0.75, 1.0, 1.25, 1.5].map((mult, i) => {
                const forceAtX = kCalc * xCalc * mult
                return (
                  <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontSize: 10, color: 'var(--text-3)', minWidth: 50, fontFamily: "'Space Grotesk',sans-serif" }}>{(xCalc*mult*1000).toFixed(1)}mm</span>
                    <div style={{ flex: 1, height: 10, background: 'var(--border)', borderRadius: 5, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${Math.min(mult / 1.5 * 100, 100)}%`, background: mult > 1 ? '#ef4444' : C, borderRadius: 5 }} />
                    </div>
                    <span style={{ fontSize: 10, color: mult > 1 ? '#ef4444' : C, fontWeight: 700, minWidth: 60, textAlign: 'right', fontFamily: "'Space Grotesk',sans-serif" }}>{forceAtX.toFixed(1)}N</span>
                  </div>
                )
              })}
            </div>
          </div>
          <AIHintCard hint={hint} />
        </>}
      />

      <Sec title="Real-world spring applications">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {SPRING_EXAMPLES.map((s, i) => (
            <div key={i} style={{ padding: '11px 13px', borderRadius: 9, background: 'var(--bg-raised)', border: '0.5px solid var(--border)', cursor: 'pointer' }} onClick={() => { setK(s.k); setSolveIdx(1) }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 3 }}>{s.name}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif", marginBottom: 2 }}>{s.k.toLocaleString()} N/m</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{s.use}</div>
            </div>
          ))}
        </div>
      </Sec>

      <FormulaCard
        formula={"F = k × x (Hooke's Law)\nPE = ½ × k × x²\nfn = (1/2π) × √(k/m)\nω = √(k/m)"}
        variables={[
          { symbol: 'k', meaning: 'Spring constant (N/m) — stiffness' },
          { symbol: 'x', meaning: 'Deflection from rest position (m)' },
          { symbol: 'F', meaning: 'Spring force (N)' },
          { symbol: 'fn', meaning: 'Natural frequency (Hz)' },
          { symbol: 'm', meaning: 'Attached mass (kg)' },
        ]}
        explanation="Hooke's Law (F = kx) describes linear elastic behavior — valid only within the elastic limit. Potential energy stored = ½kx². Natural frequency determines resonance — engineers avoid designing systems to operate near their natural frequency to prevent destructive resonance."
      />

      <Sec title="Frequently asked questions">
        {FAQ.map((f, i) => <Acc key={i} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} color={C} />)}
      </Sec>
    </div>
  )
}
