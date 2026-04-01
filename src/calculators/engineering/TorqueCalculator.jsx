import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import FormulaCard from '../../components/calculator/FormulaCard'
import AIHintCard from '../../components/calculator/AIHintCard'
function Sec({ title, children }) { return (<div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}><div style={{ padding: '13px 18px', borderBottom: '0.5px solid var(--border)' }}><span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{title}</span></div><div style={{ padding: '16px 18px' }}>{children}</div></div>) }
function Acc({ q, a, open, onToggle, color }) { return (<div style={{ borderBottom: '0.5px solid var(--border)' }}><button onClick={onToggle} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 0', background: 'none', border: 'none', cursor: 'pointer', gap: 12, textAlign: 'left' }}><span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', lineHeight: 1.4 }}>{q}</span><span style={{ fontSize: 18, color, flexShrink: 0, transform: open ? 'rotate(45deg)' : 'none', transition: 'transform .2s' }}>+</span></button>{open && <p style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.75, margin: '0 0 13px' }}>{a}</p>}</div>) }

const SOLVE = ['Torque (T)', 'Force (F)', 'Moment arm (r)', 'Power (P)', 'Speed (RPM)']
const FAQ = [
  { q: 'What is torque?', a: 'Torque (T = F × r) is the rotational equivalent of force — it causes angular acceleration. Units: N·m (SI) or lb·ft (imperial). A force of 10N applied 0.5m from the pivot creates 5 N·m of torque. Torque × angular velocity = power.' },
  { q: 'How does torque relate to power and RPM?', a: 'Power (W) = Torque (N·m) × Angular velocity (rad/s) = T × 2π × RPM / 60. So at 1000 RPM, 10 N·m of torque = 10 × 2π × 1000/60 = 1047W ≈ 1.05 kW. This is why high-torque, low-speed motors and low-torque, high-speed motors can have the same power.' },
  { q: 'What is the difference between torque and moment?', a: 'In everyday engineering usage, torque and moment are often used interchangeably. Strictly, torque refers to rotation about an axis (like a shaft), while moment refers to the tendency to rotate about a point. Both are Force × perpendicular distance (N·m).' },
]
export default function TorqueCalculator({ meta, category }) {
  const C = category?.color || '#f59e0b'
  const [solveIdx, setSolveIdx] = useState(0)
  const [force, setForce] = useState(100)
  const [radius, setRadius] = useState(0.5)
  const [power, setPower] = useState(1000)
  const [rpm, setRpm] = useState(1000)
  const [openFaq, setOpenFaq] = useState(null)

  let T, F, r, P, N
  if (solveIdx === 0) { F = force; r = radius; T = F * r; N = rpm; P = T * 2 * Math.PI * N / 60 }
  else if (solveIdx === 1) { T = force; r = radius; F = T / r; N = rpm; P = T * 2 * Math.PI * N / 60 }
  else if (solveIdx === 2) { T = force; F = radius; r = T / F; N = rpm; P = T * 2 * Math.PI * N / 60 }
  else if (solveIdx === 3) { P = power; N = rpm; T = P * 60 / (2 * Math.PI * N); F = force; r = T / F }
  else { P = power; T = force; N = P * 60 / (2 * Math.PI * T); F = radius; r = T / F }

  const T_ftlb = (T || 0) * 0.7376
  const T_inlb = (T || 0) * 8.851

  const hint = `T=${(T||0).toFixed(2)} N·m = ${T_ftlb.toFixed(2)} ft·lb. Power: ${((P||0)/1000).toFixed(3)} kW @ ${(N||rpm)} RPM.`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ background: `linear-gradient(135deg,${C}15,${C}06)`, border: `1px solid ${C}30`, borderRadius: 14, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div><div style={{ fontSize: 10, fontWeight: 700, color: C, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>Torque Calculator</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>T = F × r · P = T × ω</div></div>
        <div style={{ display: 'flex', gap: 10 }}>
          {[{ l: 'Torque', v: `${(T||0).toFixed(2)} N·m` }, { l: 'Power', v: `${((P||0)/1000).toFixed(3)} kW` }].map((m, i) => (
            <div key={i} style={{ padding: '8px 12px', background: C + '15', borderRadius: 9, textAlign: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>{m.v}</div>
              <div style={{ fontSize: 10, color: 'var(--text-3)' }}>{m.l}</div>
            </div>
          ))}
        </div>
      </div>
      <CalcShell
        left={<>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 8 }}>Solve for</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {SOLVE.map((s, i) => <button key={i} onClick={() => setSolveIdx(i)} style={{ padding: '8px 12px', borderRadius: 8, border: `1.5px solid ${solveIdx === i ? C : 'var(--border-2)'}`, background: solveIdx === i ? C + '12' : 'var(--bg-raised)', fontSize: 13, fontWeight: solveIdx === i ? 700 : 400, color: solveIdx === i ? C : 'var(--text)', cursor: 'pointer', textAlign: 'left' }}>{s}</button>)}
            </div>
          </div>
          <div style={{ marginBottom: 12 }}><label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 5 }}>{['Force (N)', 'Torque (N·m)', 'Torque (N·m)', 'Power (W)', 'Power (W)'][solveIdx]}</label><input type="number" step="any" value={force} onChange={e => setForce(+e.target.value)} style={{ width: '100%', height: 42, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 14px', fontSize: 16, fontWeight: 700, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', boxSizing: 'border-box' }} /></div>
          <div style={{ marginBottom: 12 }}><label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 5 }}>{['Moment arm r (m)', 'Moment arm r (m)', 'Force F (N)', 'Force F (N)', 'Torque T (N·m)'][solveIdx]}</label><input type="number" step="any" value={radius} onChange={e => setRadius(+e.target.value)} style={{ width: '100%', height: 42, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 14px', fontSize: 16, fontWeight: 700, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', boxSizing: 'border-box' }} /></div>
          {solveIdx >= 3 && <div style={{ marginBottom: 12 }}><label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 5 }}>Speed (RPM)</label><input type="number" value={rpm} onChange={e => setRpm(+e.target.value)} style={{ width: '100%', height: 42, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 14px', fontSize: 16, fontWeight: 700, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', boxSizing: 'border-box' }} /></div>}
        </>}
        right={<>
          <BreakdownTable title="Results" rows={[
            { label: 'Torque (N·m)', value: `${(T||0).toFixed(3)} N·m`, bold: true, highlight: true, color: C },
            { label: 'Torque (ft·lb)', value: T_ftlb.toFixed(3) },
            { label: 'Torque (in·lb)', value: T_inlb.toFixed(3) },
            { label: 'Power (kW)', value: `${((P||0)/1000).toFixed(4)} kW` },
            { label: 'Power (HP)', value: `${((P||0)/745.7).toFixed(3)} HP` },
          ]} />
          <AIHintCard hint={hint} />
        </>}
      />
      <Sec title="Common torque values for reference">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[['Tightening M8 bolt', '22 N·m'], ['Tightening M12 bolt', '80 N·m'], ['Car wheel nut', '100-140 N·m'], ['Bicycle pedal', '35 N·m'], ['Small electric motor', '0.5-5 N·m'], ['Car engine (typical)', '150-400 N·m'], ['Truck diesel engine', '1000-3000 N·m'], ['Industrial gearbox', '5000+ N·m']].map(([n, v], i) => (
            <div key={i} style={{ padding: '9px 12px', background: 'var(--bg-raised)', borderRadius: 8, border: '0.5px solid var(--border)' }}>
              <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{n}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>{v}</div>
            </div>
          ))}
        </div>
      </Sec>
      <FormulaCard formula={"T = F × r\nP = T × ω = T × 2π × N/60\nω = 2π × N/60 (rad/s)"} variables={[{ symbol: 'T', meaning: 'Torque (N·m)' }, { symbol: 'F', meaning: 'Force (N)' }, { symbol: 'r', meaning: 'Moment arm (m)' }, { symbol: 'P', meaning: 'Power (W)' }, { symbol: 'N', meaning: 'Speed (RPM)' }]} explanation="Torque is force times perpendicular distance from the pivot. Power is torque times angular velocity. At constant power, increasing torque requires decreasing speed and vice versa — fundamental to gearbox design." />
      <Sec title="Frequently asked questions">{FAQ.map((f, i) => <Acc key={i} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} color={C} />)}</Sec>
    </div>
  )
}
