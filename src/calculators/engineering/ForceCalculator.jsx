import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import FormulaCard from '../../components/calculator/FormulaCard'
import AIHintCard from '../../components/calculator/AIHintCard'

const SOLVE_FOR = [
  { key: 'F', label: 'Force (F)', unit: 'N', color: '#ef4444' },
  { key: 'm', label: 'Mass (m)', unit: 'kg', color: '#3b82f6' },
  { key: 'a', label: 'Acceleration (a)', unit: 'm/s²', color: '#10b981' },
]

const REAL_WORLD = [
  { scenario: 'Car braking (1500 kg)', a: -8, mass: 1500, icon: '🚗', note: 'Emergency brake ~0.8g' },
  { scenario: 'Rocket launch', a: 15, mass: 500000, icon: '🚀', note: '~1.5g net upward' },
  { scenario: 'Elevator up', a: 1, mass: 1000, icon: '🛗', note: 'Typical acceleration' },
  { scenario: 'Ball dropped', a: 9.81, mass: 0.5, icon: '⚽', note: 'Gravity only' },
]

const FAQ = [
  { q: 'What is Newton\'s Second Law?', a: 'F = ma — force equals mass times acceleration. This is the most fundamental equation in classical mechanics. It tells us that a net force on an object causes acceleration proportional to the force and inversely proportional to the mass. Twice the mass needs twice the force for the same acceleration.' },
  { q: 'What is the difference between mass and weight?', a: 'Mass (kg) is the amount of matter in an object — constant everywhere in the universe. Weight (N) is the gravitational force acting on that mass: W = mg, where g = 9.81 m/s² on Earth. On the Moon (g = 1.62 m/s²), you\'d weigh 1/6 as much but have the same mass.' },
  { q: 'What is net force?', a: 'Net force is the vector sum of all forces acting on an object. If you push with 100N and friction acts with 30N opposing, net force = 70N in your direction. Only net force causes acceleration. When net force = 0, the object is in equilibrium (static or moving at constant velocity).' },
  { q: 'What are force unit conversions?', a: '1 Newton (N) = 1 kg·m/s². Other units: 1 kN = 1000N, 1 lbf (pound-force) = 4.448 N, 1 kgf (kilogram-force) = 9.807 N. Note: lbf and kg are often confused with lbm (mass) and kg (mass) — always specify whether you mean a force or a mass unit.' },
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

export default function ForceCalculator({ meta, category }) {
  const C = category?.color || '#f59e0b'
  const [solveIdx, setSolveIdx] = useState(0)
  const [mass, setMass] = useState(100)
  const [accel, setAccel] = useState(9.81)
  const [force, setForce] = useState(981)
  const [angle, setAngle] = useState(0)
  const [openFaq, setOpenFaq] = useState(null)

  const solveKey = SOLVE_FOR[solveIdx].key
  let F, m, a
  if (solveKey === 'F') { F = mass * accel; m = mass; a = accel }
  else if (solveKey === 'm') { m = force / accel; F = force; a = accel }
  else { a = force / mass; F = force; m = mass }

  const F_kN = F / 1000
  const F_lbf = F * 0.224809
  const F_kgf = F / 9.80665
  const weight = m * 9.81
  const F_inclined = m * a * Math.cos(angle * Math.PI / 180)
  const hint = `F = ${F?.toFixed(2)} N = ${F_lbf?.toFixed(2)} lbf. Mass=${m?.toFixed(2)} kg, a=${a?.toFixed(3)} m/s² (${(a/9.81).toFixed(3)}g).`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      <div style={{ background: `linear-gradient(135deg,${C}15,${C}06)`, border: `1px solid ${C}30`, borderRadius: 14, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>Newton's Second Law</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>F = m × a</div>
        </div>
        <div style={{ padding: '8px 18px', background: C + '15', borderRadius: 10, textAlign: 'right' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>{F?.toFixed(2)} N</div>
          <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{F_kgf?.toFixed(2)} kgf · {F_lbf?.toFixed(2)} lbf</div>
        </div>
      </div>

      <CalcShell
        left={<>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 8 }}>Solve for</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
              {SOLVE_FOR.map((s, i) => (
                <button key={i} onClick={() => setSolveIdx(i)}
                  style={{ padding: '9px 4px', borderRadius: 8, border: `1.5px solid ${solveIdx === i ? s.color : 'var(--border-2)'}`, background: solveIdx === i ? s.color + '12' : 'var(--bg-raised)', fontSize: 11, fontWeight: solveIdx === i ? 700 : 400, color: solveIdx === i ? s.color : 'var(--text-2)', cursor: 'pointer' }}>{s.label}</button>
              ))}
            </div>
          </div>

          {solveKey !== 'm' && (
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 6 }}>Mass (kg)</label>
              <input type="number" value={mass} onChange={e => setMass(+e.target.value)} style={{ width: '100%', height: 44, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 14px', fontSize: 17, fontWeight: 700, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', fontFamily: "'Space Grotesk',sans-serif", boxSizing: 'border-box' }} />
            </div>
          )}
          {solveKey !== 'a' && (
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 6 }}>Acceleration (m/s²)</label>
              <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                {[['g Earth', 9.81], ['g Moon', 1.62], ['g Mars', 3.72], ['0 (inertia)', 0]].map(([l, v]) => (
                  <button key={l} onClick={() => setAccel(v)} style={{ padding: '4px 7px', borderRadius: 6, border: `1px solid ${accel === v ? C : 'var(--border-2)'}`, background: accel === v ? C + '12' : 'var(--bg-raised)', fontSize: 10, color: accel === v ? C : 'var(--text-2)', cursor: 'pointer' }}>{l}</button>
                ))}
              </div>
              <input type="number" step="0.01" value={accel} onChange={e => setAccel(+e.target.value)} style={{ width: '100%', height: 44, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 14px', fontSize: 17, fontWeight: 700, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', fontFamily: "'Space Grotesk',sans-serif", boxSizing: 'border-box' }} />
            </div>
          )}
          {solveKey !== 'F' && (
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 6 }}>Force (N)</label>
              <input type="number" value={force} onChange={e => setForce(+e.target.value)} style={{ width: '100%', height: 44, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 14px', fontSize: 17, fontWeight: 700, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', fontFamily: "'Space Grotesk',sans-serif", boxSizing: 'border-box' }} />
            </div>
          )}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 6 }}>Incline angle: {angle}°</label>
            <input type="range" min="0" max="90" value={angle} onChange={e => setAngle(+e.target.value)} style={{ width: '100%', accentColor: C }} />
          </div>
        </>}

        right={<>
          <BreakdownTable title="Force results" rows={[
            { label: 'Force (N)', value: `${F?.toFixed(4)} N`, bold: true, highlight: true, color: C },
            { label: 'Force (kN)', value: `${F_kN?.toFixed(5)} kN` },
            { label: 'Force (lbf)', value: `${F_lbf?.toFixed(4)} lbf` },
            { label: 'Force (kgf)', value: `${F_kgf?.toFixed(4)} kgf` },
            { label: 'Mass', value: `${m?.toFixed(3)} kg` },
            { label: 'Acceleration', value: `${a?.toFixed(4)} m/s² (${(a/9.81).toFixed(3)}g)` },
            { label: 'Weight (Earth)', value: `${weight?.toFixed(2)} N` },
            { label: `Force on ${angle}° incline`, value: `${F_inclined?.toFixed(3)} N` },
          ]} />
          <AIHintCard hint={hint} />
        </>}
      />

      <Sec title="Real-world force examples">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {REAL_WORLD.map((r, i) => (
            <div key={i} style={{ padding: '11px 13px', borderRadius: 9, background: 'var(--bg-raised)', border: '0.5px solid var(--border)', cursor: 'pointer' }}
              onClick={() => { setMass(r.mass); setAccel(Math.abs(r.a)); setSolveIdx(0) }}>
              <div style={{ fontSize: 18, marginBottom: 4 }}>{r.icon}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>{r.scenario}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>{(r.mass * Math.abs(r.a) / 1000).toFixed(1)} kN</div>
              <div style={{ fontSize: 10, color: 'var(--text-3)' }}>{r.note}</div>
            </div>
          ))}
        </div>
      </Sec>

      <Sec title="Force unit reference">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          {[['1 Newton', '1 kg·m/s²'], ['1 kN', '1000 N'], ['1 lbf', '4.448 N'], ['1 kgf', '9.807 N'], ['1 kip', '4448 N'], ['1 dyne', '0.00001 N']].map(([a, b], i) => (
            <div key={i} style={{ padding: '8px 10px', background: 'var(--bg-raised)', borderRadius: 7, border: '0.5px solid var(--border)' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C }}>{a}</div>
              <div style={{ fontSize: 11, color: 'var(--text-2)' }}>= {b}</div>
            </div>
          ))}
        </div>
      </Sec>

      <FormulaCard
        formula={'F = m × a\nW = m × g (weight)\nFnet = F1 + F2 + ... (vector sum)\nF_incline = m × a × cos(θ)'}
        variables={[
          { symbol: 'F', meaning: 'Net force (N)' },
          { symbol: 'm', meaning: 'Mass (kg)' },
          { symbol: 'a', meaning: 'Acceleration (m/s²)' },
          { symbol: 'g', meaning: 'Gravitational acceleration = 9.81 m/s²' },
        ]}
        explanation="Newton's Second Law (F = ma) is the cornerstone of classical mechanics. Net force is the vector sum of all forces. Weight is the gravitational force (mg). On an inclined plane, only the component parallel to motion does work. Always use net force — not just applied force."
      />

      <Sec title="Frequently asked questions">
        {FAQ.map((f, i) => <Acc key={i} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} color={C} />)}
      </Sec>
    </div>
  )
}
