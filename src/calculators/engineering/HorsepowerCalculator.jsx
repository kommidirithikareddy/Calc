import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import FormulaCard from '../../components/calculator/FormulaCard'
import AIHintCard from '../../components/calculator/AIHintCard'

const SOLVE_MODES = [
  { id: 'hp_from_torque', label: 'HP from Torque & RPM' },
  { id: 'torque_from_hp', label: 'Torque from HP & RPM' },
  { id: 'rpm_from_hp', label: 'RPM from HP & Torque' },
]

const ENGINES = [
  { name: 'Small electric motor', hp: 1, torque_ftlb: 3, rpm: 1750, icon: '⚡' },
  { name: 'Typical car (1.4L)', hp: 90, torque_ftlb: 100, rpm: 4500, icon: '🚗' },
  { name: 'Sports car (V8)', hp: 450, torque_ftlb: 420, rpm: 5600, icon: '🏎️' },
  { name: 'Diesel truck', hp: 400, torque_ftlb: 1000, rpm: 1800, icon: '🚛' },
  { name: 'Aircraft piston', hp: 300, torque_ftlb: 225, rpm: 2700, icon: '✈️' },
  { name: 'Industrial pump', hp: 50, torque_ftlb: 150, rpm: 1450, icon: '🏭' },
]

const FAQ = [
  { q: 'What is the difference between horsepower and torque?', a: 'Torque is the rotational force — what actually accelerates you at low speed. Horsepower is the rate of doing work (torque × speed). High torque makes a car feel "strong" at low RPM (diesels, trucks). High horsepower means sustained power at high RPM (sports cars). HP = Torque × RPM / 5252.' },
  { q: 'What is the 5252 constant?', a: 'HP = Torque(ft·lb) × RPM / 5252 comes from unit conversion: 1 HP = 550 ft·lb/s, and RPM × 2π/60 converts to rad/s. The constant 5252 = 33,000 / (2π) ≈ 5252. At 5252 RPM, torque in ft·lb equals horsepower numerically — that\'s where dyno curves always cross.' },
  { q: 'What is the difference between HP, kW, and PS?', a: 'Mechanical HP (UK/US) = 745.7W. Metric HP (PS, German "Pferdestärke") = 735.5W — about 1.4% less. European car specs often use kW or PS. To convert: 1 HP ≈ 1.014 PS ≈ 0.7457 kW. Always check which horsepower definition is being used when comparing specs across countries.' },
  { q: 'How is horsepower measured in practice?', a: 'A dynamometer (dyno) measures torque at the output shaft or wheels at different RPM. Software calculates HP = Torque × RPM / 5252. "Crank HP" (at the engine) is higher than "wheel HP" (at the drive wheels) — the difference is drivetrain losses, typically 15–25% for most vehicles.' },
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

export default function HorsepowerCalculator({ meta, category }) {
  const C = category?.color || '#f59e0b'
  const [mode, setMode] = useState('hp_from_torque')
  const [torque_ftlb, setTorque] = useState(300)
  const [rpm, setRpm] = useState(3500)
  const [hp_in, setHpIn] = useState(200)
  const [openFaq, setOpenFaq] = useState(null)

  let hp_mech, torque_out, rpm_out
  if (mode === 'hp_from_torque') {
    hp_mech = torque_ftlb * rpm / 5252
    torque_out = torque_ftlb
    rpm_out = rpm
  } else if (mode === 'torque_from_hp') {
    torque_out = hp_in * 5252 / rpm
    hp_mech = hp_in
    rpm_out = rpm
  } else {
    rpm_out = hp_in * 5252 / torque_ftlb
    hp_mech = hp_in
    torque_out = torque_ftlb
  }

  const hp_metric = hp_mech * 1.01387 // PS
  const kW = hp_mech * 0.745699
  const torque_Nm = torque_out * 1.35582
  const omega = rpm_out * 2 * Math.PI / 60

  const hint = `${hp_mech?.toFixed(1)} HP = ${kW?.toFixed(1)} kW = ${hp_metric?.toFixed(1)} PS. Torque: ${torque_out?.toFixed(1)} ft·lb = ${torque_Nm?.toFixed(1)} N·m at ${rpm_out?.toFixed(0)} RPM.`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      <div style={{ background: `linear-gradient(135deg,${C}15,${C}06)`, border: `1px solid ${C}30`, borderRadius: 14, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>Horsepower</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>HP = Torque(ft·lb) × RPM / 5252</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {[{ l: 'HP', v: hp_mech?.toFixed(1) }, { l: 'kW', v: kW?.toFixed(1) }].map((m, i) => (
            <div key={i} style={{ padding: '8px 14px', background: C + '15', borderRadius: 10, textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>{m.v}</div>
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
              {SOLVE_MODES.map(m => (
                <button key={m.id} onClick={() => setMode(m.id)}
                  style={{ padding: '9px 14px', borderRadius: 9, border: `1.5px solid ${mode === m.id ? C : 'var(--border-2)'}`, background: mode === m.id ? C + '12' : 'var(--bg-raised)', fontSize: 12, fontWeight: mode === m.id ? 700 : 400, color: mode === m.id ? C : 'var(--text)', cursor: 'pointer', textAlign: 'left' }}>{m.label}</button>
              ))}
            </div>
          </div>

          {(mode === 'hp_from_torque' || mode === 'rpm_from_hp') && (
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 6 }}>Torque (ft·lb)</label>
              <input type="number" value={torque_ftlb} onChange={e => setTorque(+e.target.value)} style={{ width: '100%', height: 44, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 14px', fontSize: 17, fontWeight: 700, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', fontFamily: "'Space Grotesk',sans-serif", boxSizing: 'border-box' }} />
            </div>
          )}
          {(mode === 'hp_from_torque' || mode === 'torque_from_hp') && (
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 6 }}>RPM</label>
              <input type="number" value={rpm} onChange={e => setRpm(+e.target.value)} style={{ width: '100%', height: 44, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 14px', fontSize: 17, fontWeight: 700, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', fontFamily: "'Space Grotesk',sans-serif", boxSizing: 'border-box' }} />
            </div>
          )}
          {(mode === 'torque_from_hp' || mode === 'rpm_from_hp') && (
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 6 }}>Horsepower (HP)</label>
              <input type="number" value={hp_in} onChange={e => setHpIn(+e.target.value)} style={{ width: '100%', height: 44, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 14px', fontSize: 17, fontWeight: 700, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', fontFamily: "'Space Grotesk',sans-serif", boxSizing: 'border-box' }} />
            </div>
          )}

          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 8 }}>Quick presets</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}>
              {ENGINES.slice(0, 4).map((e, i) => (
                <button key={i} onClick={() => { setMode('hp_from_torque'); setTorque(e.torque_ftlb); setRpm(e.rpm) }}
                  style={{ padding: '7px 8px', borderRadius: 7, border: '1px solid var(--border-2)', background: 'var(--bg-raised)', cursor: 'pointer', textAlign: 'left' }}>
                  <div style={{ fontSize: 11 }}>{e.icon} {e.name}</div>
                  <div style={{ fontSize: 11, color: C, fontWeight: 700, fontFamily: "'Space Grotesk',sans-serif" }}>{e.hp} HP</div>
                </button>
              ))}
            </div>
          </div>
        </>}

        right={<>
          <BreakdownTable title="Power conversion results" rows={[
            { label: 'Mechanical HP', value: `${hp_mech?.toFixed(2)} HP`, bold: true, highlight: true, color: C },
            { label: 'Metric HP (PS)', value: `${hp_metric?.toFixed(2)} PS` },
            { label: 'Power (kW)', value: `${kW?.toFixed(2)} kW` },
            { label: 'Power (W)', value: `${(kW * 1000)?.toFixed(0)} W` },
            { label: 'Torque', value: `${torque_out?.toFixed(1)} ft·lb = ${torque_Nm?.toFixed(1)} N·m` },
            { label: 'Speed', value: `${rpm_out?.toFixed(0)} RPM = ${omega?.toFixed(1)} rad/s` },
          ]} />
          <AIHintCard hint={hint} />
        </>}
      />

      <Sec title="Engine reference examples" sub="Click to load values">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {ENGINES.map((e, i) => (
            <div key={i} onClick={() => { setMode('hp_from_torque'); setTorque(e.torque_ftlb); setRpm(e.rpm) }}
              style={{ padding: '12px 13px', borderRadius: 9, background: 'var(--bg-raised)', border: '0.5px solid var(--border)', cursor: 'pointer' }}>
              <div style={{ fontSize: 16, marginBottom: 4 }}>{e.icon}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{e.name}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4 }}>
                {[['HP', e.hp], ['ft·lb', e.torque_ftlb], ['RPM', e.rpm]].map(([l, v]) => (
                  <div key={l} style={{ textAlign: 'center', padding: '4px', background: C + '10', borderRadius: 5 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>{v}</div>
                    <div style={{ fontSize: 9, color: 'var(--text-3)' }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Sec>

      <Sec title="Power unit conversion table">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[['1 HP (mech)', '745.7 W = 0.7457 kW'], ['1 HP (metric/PS)', '735.5 W = 0.7355 kW'], ['1 kW', '1.341 HP = 1.360 PS'], ['1 BTU/hr', '0.000293 kW = 0.000393 HP'], ['5252 RPM', 'HP = Torque(ft·lb) numerically'], ['33,000 ft·lb/min', '= 1 HP (original definition)']].map(([a, b], i) => (
            <div key={i} style={{ padding: '9px 11px', background: 'var(--bg-raised)', borderRadius: 8, border: '0.5px solid var(--border)' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>{a}</div>
              <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 2 }}>{b}</div>
            </div>
          ))}
        </div>
      </Sec>

      <FormulaCard
        formula={'HP = Torque(ft·lb) × RPM / 5252\nkW = HP × 0.7457\nPS = HP × 1.0139\nTorque(N·m) = HP × 9549 / RPM'}
        variables={[
          { symbol: 'HP', meaning: 'Mechanical horsepower (US/UK)' },
          { symbol: 'PS', meaning: 'Metric horsepower (Pferdestärke)' },
          { symbol: '5252', meaning: '33,000 / (2π) — unit conversion constant' },
        ]}
        explanation="Horsepower relates torque and speed: power is the rate of doing work. At 5252 RPM, torque in ft·lb always equals horsepower numerically — this is where all dyno curves cross. The constant 5252 = 33,000 / 2π comes from converting RPM to rad/s and minutes to seconds."
      />

      <Sec title="Frequently asked questions">
        {FAQ.map((f, i) => <Acc key={i} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} color={C} />)}
      </Sec>
    </div>
  )
}
