import { useState, useMemo } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import FormulaCard from '../../components/calculator/FormulaCard'
import AIHintCard from '../../components/calculator/AIHintCard'

const fmtSI = (val, unit) => {
  if (val === null || val === undefined || isNaN(val) || !isFinite(val)) return '—'
  const abs = Math.abs(val)
  if (abs >= 1e6)  return (val / 1e6).toFixed(4) + ' M' + unit
  if (abs >= 1e3)  return (val / 1e3).toFixed(4) + ' k' + unit
  if (abs >= 1)    return val.toFixed(4) + ' ' + unit
  if (abs >= 1e-3) return (val * 1e3).toFixed(4) + ' m' + unit
  return val.toExponential(3) + ' ' + unit
}

// AWG wire resistance (Ω per 1000 ft at 20°C, copper)
const AWG_TABLE = [
  { awg: 14, area_mm2: 2.08,  r1000ft: 2.525,  ampacity: 15 },
  { awg: 12, area_mm2: 3.31,  r1000ft: 1.588,  ampacity: 20 },
  { awg: 10, area_mm2: 5.26,  r1000ft: 0.9989, ampacity: 30 },
  { awg:  8, area_mm2: 8.37,  r1000ft: 0.6282, ampacity: 40 },
  { awg:  6, area_mm2: 13.3,  r1000ft: 0.3951, ampacity: 55 },
  { awg:  4, area_mm2: 21.2,  r1000ft: 0.2485, ampacity: 70 },
  { awg:  2, area_mm2: 33.6,  r1000ft: 0.1563, ampacity: 95 },
  { awg:  1, area_mm2: 42.4,  r1000ft: 0.1239, ampacity: 110 },
  { awg: '1/0', area_mm2: 53.5, r1000ft: 0.09827, ampacity: 125 },
  { awg: '2/0', area_mm2: 67.4, r1000ft: 0.07793, ampacity: 145 },
  { awg: '3/0', area_mm2: 85.0, r1000ft: 0.06180, ampacity: 165 },
  { awg: '4/0', area_mm2: 107,  r1000ft: 0.04901, ampacity: 195 },
]

const SYSTEM_TYPES = [
  { id: 'single', label: 'Single-phase', factor: 2 },
  { id: 'three',  label: '3-phase',       factor: Math.sqrt(3) },
  { id: 'dc',     label: 'DC',            factor: 2 },
]

const REAL_WORLD = [
  { icon: '🏠', title: 'Residential Wiring', color: '#f59e0b', desc: 'NEC requires ≤3% voltage drop for branch circuits and ≤5% total from service to outlet. For a 120V circuit, 3% = 3.6V maximum drop.' },
  { icon: '🏭', title: 'Industrial Motors', color: '#ef4444', desc: 'Motors are sensitive to low voltage. A 5% drop reduces torque by ~10% and increases current draw. Always calculate voltage drop in motor feeders.' },
  { icon: '⚡', title: 'Long Cable Runs', color: '#6366f1', desc: 'Data centers often have long power runs. Engineers upsize conductors to maintain efficiency — undersized cables waste energy as heat.' },
  { icon: '🔋', title: 'Solar & Battery', color: '#10b981', desc: 'DC solar wiring should stay under 1–2% voltage drop to maximize energy harvest. Long runs between panels and inverters are critical design points.' },
]

const FAQ = [
  { q: 'What is the NEC recommended maximum voltage drop?', a: 'The National Electrical Code (NEC) recommends a maximum of 3% voltage drop for branch circuits and 5% combined for feeders and branch circuits. These are recommendations, not hard requirements, but they represent good engineering practice for efficiency and equipment performance.' },
  { q: 'Why does voltage drop matter?', a: 'Voltage drop causes equipment to receive less than rated voltage, which can cause motors to draw more current and overheat, lights to dim, electronics to malfunction, and energy waste as heat in the conductors. Beyond performance issues, excessive drop can create a fire hazard from overheated wires.' },
  { q: 'Should I use copper or aluminum wire?', a: 'Copper is the standard for branch circuits and smaller feeders. Aluminum has higher resistance (about 1.6× copper) but is used for large feeders and service entrance conductors where its lower cost and weight offset the need for larger gauge. Always use the correct connectors for aluminum.' },
  { q: 'How do I reduce voltage drop?', a: 'The most effective methods: (1) Use larger wire gauge, (2) Shorten the run, (3) Increase supply voltage for the same load, (4) Use multiple parallel conductors, (5) Balance three-phase loads. Going up one AWG size (e.g., 12 to 10) reduces resistance by ~37%.' },
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

export default function VoltageDropCalculator({ meta, category }) {
  const C = category?.color || '#f59e0b'
  const [awg, setAwg] = useState('12')
  const [length, setLength] = useState(100)
  const [current, setCurrent] = useState(15)
  const [systemVoltage, setSystemVoltage] = useState(120)
  const [systemType, setSystemType] = useState('single')
  const [openFaq, setOpenFaq] = useState(null)

  const wire = AWG_TABLE.find(w => String(w.awg) === String(awg)) || AWG_TABLE[1]
  const sys = SYSTEM_TYPES.find(s => s.id === systemType)

  // Vdrop = K × I × L / Cmil  or using resistance table
  // R_total = (resistance per 1000ft / 1000) * length (one way) * 2 (round trip for single/DC) or sqrt(3) for 3ph
  const resistance_per_ft = wire.r1000ft / 1000
  const total_resistance = resistance_per_ft * length * sys.factor
  const vDrop = current * total_resistance
  const vDropPct = systemVoltage > 0 ? vDrop / systemVoltage * 100 : 0
  const vAtLoad = systemVoltage - vDrop
  const powerLoss = vDrop * current

  const necStatus = vDropPct <= 3 ? { label: 'NEC Compliant (≤3%)', color: '#10b981', bg: '#d1fae5' }
    : vDropPct <= 5 ? { label: 'Marginal (3–5%)', color: '#f59e0b', bg: '#fef3c7' }
    : { label: 'Exceeds NEC (>5%)', color: '#ef4444', bg: '#fee2e2' }

  // Find minimum compliant AWG
  const minCompliantWire = AWG_TABLE.find(w => {
    const r = (w.r1000ft / 1000) * length * sys.factor
    const vd = current * r
    return (vd / systemVoltage * 100) <= 3
  })

  const hint = `AWG ${awg}, ${length} ft, ${current} A: Voltage drop = ${vDrop.toFixed(3)}V (${vDropPct.toFixed(2)}%). ${necStatus.label}. Load voltage: ${vAtLoad.toFixed(2)}V.`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Live result banner */}
      <div style={{ background: `linear-gradient(135deg,${C}15,${C}06)`, border: `1px solid ${C}30`, borderRadius: 14, padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>Voltage Drop</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>VD = I × R × L</div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 3 }}>Single-phase: R × 2L · 3-phase: R × √3L</div>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'right', padding: '10px 16px', background: necStatus.bg, borderRadius: 10, border: `1px solid ${necStatus.color}30` }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: necStatus.color, fontFamily: "'Space Grotesk',sans-serif", lineHeight: 1 }}>{vDropPct.toFixed(2)}%</div>
            <div style={{ fontSize: 11, color: necStatus.color, fontWeight: 600, marginTop: 2 }}>{necStatus.label}</div>
          </div>
        </div>
      </div>

      <CalcShell
        left={<>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 8 }}>Wire gauge (AWG)</label>
            <select value={awg} onChange={e => setAwg(e.target.value)}
              style={{ width: '100%', height: 44, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 14px', fontSize: 14, background: 'var(--bg-card)', color: 'var(--text)', cursor: 'pointer' }}>
              {AWG_TABLE.map(w => <option key={w.awg} value={String(w.awg)}>AWG {w.awg} — {w.area_mm2} mm² — {w.ampacity}A rated</option>)}
            </select>
          </div>

          {[['One-way run length (ft)', length, setLength, 1, 10000], ['Load current (A)', current, setCurrent, 0.1, wire.ampacity * 1.5], ['Supply voltage (V)', systemVoltage, setSystemVoltage, 1, 1000]].map(([l, v, set, min, max]) => (
            <div key={l} style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 6 }}>{l}</label>
              <input type="number" value={v} onChange={e => set(Math.max(min, +e.target.value))}
                style={{ width: '100%', height: 44, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 14px', fontSize: 17, fontWeight: 700, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', fontFamily: "'Space Grotesk',sans-serif", boxSizing: 'border-box' }} />
            </div>
          ))}

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 8 }}>System type</label>
            <div style={{ display: 'flex', gap: 6 }}>
              {SYSTEM_TYPES.map(s => (
                <button key={s.id} onClick={() => setSystemType(s.id)}
                  style={{ flex: 1, padding: '9px 6px', borderRadius: 8, border: `1.5px solid ${systemType === s.id ? C : 'var(--border-2)'}`, background: systemType === s.id ? C + '12' : 'var(--bg-raised)', fontSize: 11, fontWeight: systemType === s.id ? 700 : 500, color: systemType === s.id ? C : 'var(--text-2)', cursor: 'pointer' }}>{s.label}</button>
              ))}
            </div>
          </div>

          {current > wire.ampacity && (
            <div style={{ padding: '10px 13px', background: '#fee2e2', borderRadius: 9, border: '0.5px solid #ef444430', fontSize: 12, color: '#b91c1c', marginBottom: 10 }}>
              ⚠️ Current ({current}A) exceeds ampacity ({wire.ampacity}A) for AWG {awg}. Upsize the conductor.
            </div>
          )}
        </>}

        right={<>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
            {[
              { l: 'Voltage drop', v: `${vDrop.toFixed(3)} V`, c: necStatus.color },
              { l: 'Drop %', v: `${vDropPct.toFixed(2)}%`, c: necStatus.color },
              { l: 'Voltage at load', v: `${vAtLoad.toFixed(2)} V` },
              { l: 'Power loss', v: `${powerLoss.toFixed(2)} W` },
              { l: 'Wire resistance', v: fmtSI(total_resistance, 'Ω') },
              { l: 'Wire ampacity', v: `${wire.ampacity} A` },
            ].map((m, i) => (
              <div key={i} style={{ padding: '11px 13px', background: 'var(--bg-raised)', borderRadius: 10, border: '0.5px solid var(--border)' }}>
                <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 3 }}>{m.l}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: m.c || 'var(--text)', fontFamily: "'Space Grotesk',sans-serif" }}>{m.v}</div>
              </div>
            ))}
          </div>

          {/* Visual voltage bar */}
          <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 12, padding: '14px 16px', marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>Voltage distribution</div>
            <div style={{ display: 'flex', height: 28, borderRadius: 8, overflow: 'hidden', border: '0.5px solid var(--border)' }}>
              <div style={{ width: `${Math.max(0, 100 - vDropPct)}%`, background: C, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff', transition: 'width .4s' }}>
                {vAtLoad.toFixed(1)}V at load
              </div>
              <div style={{ flex: 1, background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#ef4444' }}>
                {vDrop.toFixed(1)}V drop
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 10, color: 'var(--text-3)' }}>
              <span>Source: {systemVoltage}V</span><span>Load: {vAtLoad.toFixed(2)}V</span>
            </div>
          </div>

          {minCompliantWire && String(minCompliantWire.awg) !== String(awg) && (
            <div style={{ padding: '11px 14px', background: '#d1fae5', borderRadius: 9, border: '0.5px solid #10b98130', marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#065f46', marginBottom: 4 }}>✓ RECOMMENDED MINIMUM</div>
              <div style={{ fontSize: 13, color: '#065f46' }}>Use <strong>AWG {minCompliantWire.awg}</strong> to stay within 3% NEC limit</div>
            </div>
          )}

          <BreakdownTable title="Summary" rows={[
            { label: 'AWG', value: `${awg}`, },
            { label: 'Run length', value: `${length} ft (${(length * 0.3048).toFixed(1)} m)` },
            { label: 'Current', value: `${current} A` },
            { label: 'Resistance/1000ft', value: `${wire.r1000ft} Ω` },
            { label: 'Voltage drop', value: `${vDrop.toFixed(3)} V (${vDropPct.toFixed(2)}%)`, bold: true, highlight: true, color: necStatus.color },
          ]} />
          <AIHintCard hint={hint} />
        </>}
      />

      {/* AWG comparison table */}
      <Sec title="AWG comparison table" sub="All standard gauges for this run">
        <p style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.7, marginBottom: 14, fontFamily: "'DM Sans',sans-serif" }}>
          Showing voltage drop for all wire gauges at your current settings ({length} ft, {current} A, {systemVoltage}V {systemType}).
        </p>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>{['AWG', 'mm²', 'Ampacity', 'V Drop', '% Drop', 'NEC Status'].map(h => (
                <th key={h} style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textAlign: 'left', padding: '8px 12px', borderBottom: '1px solid var(--border)', background: 'var(--bg-raised)' }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {AWG_TABLE.map((w, i) => {
                const r = (w.r1000ft / 1000) * length * sys.factor
                const vd = current * r
                const pct = systemVoltage > 0 ? vd / systemVoltage * 100 : 0
                const ok = pct <= 3, marginal = pct <= 5
                const isSelected = String(w.awg) === String(awg)
                return (
                  <tr key={i} style={{ background: isSelected ? C + '10' : 'transparent', cursor: 'pointer' }} onClick={() => setAwg(String(w.awg))}>
                    <td style={{ padding: '8px 12px', fontSize: 13, fontWeight: isSelected ? 700 : 400, color: isSelected ? C : 'var(--text)', borderBottom: '0.5px solid var(--border)' }}>AWG {w.awg}</td>
                    <td style={{ padding: '8px 12px', fontSize: 12, color: 'var(--text-3)', borderBottom: '0.5px solid var(--border)' }}>{w.area_mm2}</td>
                    <td style={{ padding: '8px 12px', fontSize: 12, color: current > w.ampacity ? '#ef4444' : 'var(--text-2)', borderBottom: '0.5px solid var(--border)' }}>{w.ampacity}A</td>
                    <td style={{ padding: '8px 12px', fontSize: 13, fontWeight: 600, color: ok ? '#10b981' : marginal ? '#f59e0b' : '#ef4444', fontFamily: "'Space Grotesk',sans-serif", borderBottom: '0.5px solid var(--border)' }}>{vd.toFixed(3)}V</td>
                    <td style={{ padding: '8px 12px', fontSize: 13, fontWeight: 600, color: ok ? '#10b981' : marginal ? '#f59e0b' : '#ef4444', fontFamily: "'Space Grotesk',sans-serif", borderBottom: '0.5px solid var(--border)' }}>{pct.toFixed(2)}%</td>
                    <td style={{ padding: '8px 12px', fontSize: 11, borderBottom: '0.5px solid var(--border)' }}>
                      <span style={{ padding: '2px 8px', borderRadius: 6, background: ok ? '#d1fae5' : marginal ? '#fef3c7' : '#fee2e2', color: ok ? '#065f46' : marginal ? '#92400e' : '#b91c1c', fontWeight: 600 }}>{ok ? '✓ Pass' : marginal ? '⚠ Marginal' : '✗ Fail'}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Sec>

      {/* Real world section */}
      <Sec title="Real-world applications">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {REAL_WORLD.map((r, i) => (
            <div key={i} style={{ padding: '12px 13px', borderRadius: 11, background: r.color + '08', border: `1px solid ${r.color}25` }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 7 }}>
                <span style={{ fontSize: 18 }}>{r.icon}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: r.color }}>{r.title}</span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.65, margin: 0, fontFamily: "'DM Sans',sans-serif" }}>{r.desc}</p>
            </div>
          ))}
        </div>
      </Sec>

      {/* NEC Rules */}
      <Sec title="NEC voltage drop guidelines" sub="National Electrical Code reference">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { rule: 'Branch circuits', limit: '≤3%', note: 'From panel to outlet — recommended maximum', ok: vDropPct <= 3 },
            { rule: 'Feeder circuits', limit: '≤3%', note: 'From service to subpanel', ok: null },
            { rule: 'Combined (feeder + branch)', limit: '≤5%', note: 'Total from meter to furthest outlet', ok: vDropPct <= 5 },
          ].map((r, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '11px 14px', borderRadius: 9, background: 'var(--bg-raised)', border: '0.5px solid var(--border)' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{r.rule}: <span style={{ color: C, fontFamily: "'Space Grotesk',sans-serif" }}>{r.limit}</span></div>
                <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{r.note}</div>
              </div>
              {r.ok !== null && <span style={{ padding: '3px 10px', borderRadius: 6, background: r.ok ? '#d1fae5' : '#fee2e2', color: r.ok ? '#065f46' : '#b91c1c', fontSize: 11, fontWeight: 700 }}>{r.ok ? '✓ Pass' : '✗ Fail'}</span>}
            </div>
          ))}
        </div>
      </Sec>

      <FormulaCard
        formula={'VD = I × R × 2L (single-phase)\nVD = I × R × √3 × L (3-phase)\nR = ρ × L / A'}
        variables={[
          { symbol: 'VD', meaning: 'Voltage drop (Volts)' },
          { symbol: 'I', meaning: 'Load current (Amperes)' },
          { symbol: 'R', meaning: 'Resistance per unit length (Ω/ft)' },
          { symbol: 'L', meaning: 'One-way conductor length (ft)' },
          { symbol: 'ρ', meaning: 'Resistivity of conductor material' },
        ]}
        explanation="For single-phase and DC systems, current travels out and back, so the effective length is doubled (2L). For three-phase systems, the phase-to-phase geometry reduces the factor to √3. The resistance per foot comes from the AWG table based on conductor cross-sectional area."
      />

      <Sec title="Frequently asked questions">
        {FAQ.map((f, i) => <Acc key={i} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} color={C} />)}
      </Sec>
    </div>
  )
}
