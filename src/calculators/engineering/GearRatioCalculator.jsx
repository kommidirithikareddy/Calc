import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import FormulaCard from '../../components/calculator/FormulaCard'
import AIHintCard from '../../components/calculator/AIHintCard'
function Sec({ title, children }) { return (<div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}><div style={{ padding: '13px 18px', borderBottom: '0.5px solid var(--border)' }}><span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{title}</span></div><div style={{ padding: '16px 18px' }}>{children}</div></div>) }
function Acc({ q, a, open, onToggle, color }) { return (<div style={{ borderBottom: '0.5px solid var(--border)' }}><button onClick={onToggle} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 0', background: 'none', border: 'none', cursor: 'pointer', gap: 12, textAlign: 'left' }}><span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', lineHeight: 1.4 }}>{q}</span><span style={{ fontSize: 18, color, flexShrink: 0, transform: open ? 'rotate(45deg)' : 'none', transition: 'transform .2s' }}>+</span></button>{open && <p style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.75, margin: '0 0 13px' }}>{a}</p>}</div>) }

const FAQ = [
  { q: 'What is gear ratio?', a: 'Gear ratio = driver teeth / driven teeth = output speed / input speed. A ratio of 4:1 means the driven gear spins 4× slower than the driver but delivers 4× more torque. Gear trains trade speed for torque (or vice versa) while conserving power (minus friction losses).' },
  { q: 'What is a compound gear train?', a: 'A compound gear train has multiple gear pairs in series. The total ratio is the product of each stage ratio. Example: two stages of 4:1 each gives 16:1 total. Compound trains achieve high ratios in compact space — used in gearboxes, watches, and industrial machinery.' },
  { q: 'How does gear ratio affect torque and speed?', a: 'Output speed = Input speed / ratio. Output torque = Input torque × ratio × efficiency. So a 5:1 gearbox running at 1000 RPM input gives 200 RPM output and multiplies torque 5-fold (minus ~3-5% friction losses). Gear ratios transform power delivery characteristics.' },
]
export default function GearRatioCalculator({ meta, category }) {
  const C = category?.color || '#f59e0b'
  const [teethDriver, setTeethDriver] = useState(60)
  const [teethDriven, setTeethDriven] = useState(15)
  const [inputRPM, setInputRPM] = useState(1500)
  const [inputTorque, setInputTorque] = useState(10)
  const [efficiency, setEfficiency] = useState(97)
  const [openFaq, setOpenFaq] = useState(null)

  const ratio = teethDriven > 0 ? teethDriver / teethDriven : 0
  const outputRPM = inputRPM / ratio
  const outputTorque = inputTorque * ratio * (efficiency / 100)
  const inputPower = inputTorque * 2 * Math.PI * inputRPM / 60
  const outputPower = outputTorque * 2 * Math.PI * outputRPM / 60

  const hint = `Gear ratio ${ratio.toFixed(2)}:1. Input: ${inputRPM} RPM, ${inputTorque} N·m. Output: ${outputRPM.toFixed(1)} RPM, ${outputTorque.toFixed(2)} N·m.`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ background: `linear-gradient(135deg,${C}15,${C}06)`, border: `1px solid ${C}30`, borderRadius: 14, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div><div style={{ fontSize: 10, fontWeight: 700, color: C, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>Gear Ratio Calculator</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>GR = N_driver / N_driven = ω_in / ω_out</div></div>
        <div style={{ textAlign: 'right', padding: '8px 18px', background: C + '15', borderRadius: 10 }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>{ratio.toFixed(2)}:1</div>
          <div style={{ fontSize: 11, color: 'var(--text-3)' }}>gear ratio</div>
        </div>
      </div>
      <CalcShell
        left={<>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
            {[['Driver teeth (input)', teethDriver, setTeethDriver], ['Driven teeth (output)', teethDriven, setTeethDriven]].map(([l, v, set]) => (
              <div key={l}><label style={{ fontSize: 11, color: 'var(--text-3)', display: 'block', marginBottom: 3 }}>{l}</label><input type="number" value={v} onChange={e => set(+e.target.value)} style={{ width: '100%', height: 40, border: '1px solid var(--border-2)', borderRadius: 7, padding: '0 8px', fontSize: 14, fontWeight: 700, background: 'var(--bg-card)', color: 'var(--text)', boxSizing: 'border-box' }} /></div>
            ))}
          </div>
          {[['Input RPM', inputRPM, setInputRPM], ['Input torque (N·m)', inputTorque, setInputTorque]].map(([l, v, set]) => (
            <div key={l} style={{ marginBottom: 12 }}><label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 5 }}>{l}</label><input type="number" step="any" value={v} onChange={e => set(+e.target.value)} style={{ width: '100%', height: 42, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 14px', fontSize: 16, fontWeight: 700, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', boxSizing: 'border-box' }} /></div>
          ))}
          <div style={{ marginBottom: 12 }}><label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 5 }}>Efficiency: {efficiency}%</label><input type="range" min="50" max="100" value={efficiency} onChange={e => setEfficiency(+e.target.value)} style={{ width: '100%', accentColor: C }} /></div>
          <Sec title="Gear ratio presets">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {[[2,1,'2:1'],[3,1,'3:1'],[4,1,'4:1'],[5,1,'5:1'],[10,1,'10:1'],[1,2,'1:2'],[1,4,'Step-up 1:4']].map(([d,n,l]) => (
                <button key={l} onClick={() => { setTeethDriver(d*10); setTeethDriven(n*10) }} style={{ padding: '5px 10px', borderRadius: 6, border: `1px solid ${teethDriver/teethDriven === d/n ? C : 'var(--border-2)'}`, background: teethDriver/teethDriven === d/n ? C + '12' : 'var(--bg-raised)', fontSize: 11, color: teethDriver/teethDriven === d/n ? C : 'var(--text-2)', cursor: 'pointer' }}>{l}</button>
              ))}
            </div>
          </Sec>
        </>}
        right={<>
          <BreakdownTable title="Output results" rows={[
            { label: 'Gear ratio', value: `${ratio.toFixed(3)}:1`, bold: true, highlight: true, color: C },
            { label: 'Output RPM', value: `${outputRPM.toFixed(1)} RPM` },
            { label: 'Output torque', value: `${outputTorque.toFixed(2)} N·m` },
            { label: 'Torque multiplication', value: `${(outputTorque/inputTorque).toFixed(2)}×` },
            { label: 'Input power', value: `${(inputPower/1000).toFixed(3)} kW` },
            { label: 'Output power', value: `${(outputPower/1000).toFixed(3)} kW` },
            { label: 'Power loss', value: `${((inputPower - outputPower)/1000).toFixed(3)} kW` },
          ]} />
          <AIHintCard hint={hint} />
        </>}
      />
      <FormulaCard formula={"GR = N_driver / N_driven\nω_out = ω_in / GR\nT_out = T_in × GR × η"} variables={[{ symbol: 'GR', meaning: 'Gear ratio' }, { symbol: 'N', meaning: 'Number of teeth' }, { symbol: 'ω', meaning: 'Angular velocity (rad/s or RPM)' }, { symbol: 'η', meaning: 'Transmission efficiency' }]} explanation="Gear ratio determines the speed and torque relationship between input and output shafts. Higher ratio = more torque output at lower speed. Power is conserved (minus friction). For compound trains, multiply all stage ratios." />
      <Sec title="Frequently asked questions">{FAQ.map((f, i) => <Acc key={i} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} color={C} />)}</Sec>
    </div>
  )
}
