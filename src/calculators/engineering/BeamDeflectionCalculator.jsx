import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import FormulaCard from '../../components/calculator/FormulaCard'
import AIHintCard from '../../components/calculator/AIHintCard'
function Sec({ title, children }) { return (<div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}><div style={{ padding: '13px 18px', borderBottom: '0.5px solid var(--border)' }}><span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{title}</span></div><div style={{ padding: '16px 18px' }}>{children}</div></div>) }
function Acc({ q, a, open, onToggle, color }) { return (<div style={{ borderBottom: '0.5px solid var(--border)' }}><button onClick={onToggle} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 0', background: 'none', border: 'none', cursor: 'pointer', gap: 12, textAlign: 'left' }}><span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', lineHeight: 1.4 }}>{q}</span><span style={{ fontSize: 18, color, flexShrink: 0, transform: open ? 'rotate(45deg)' : 'none', transition: 'transform .2s' }}>+</span></button>{open && <p style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.75, margin: '0 0 13px' }}>{a}</p>}</div>) }

const BEAM_CASES = [
  { label: 'Simply supported — point load at center', icon: '⬇', formula: 'δ = PL³/(48EI)', calc: (P,L,E,I) => P*Math.pow(L,3)/(48*E*I), M: (P,L) => P*L/4 },
  { label: 'Simply supported — UDL (full span)', icon: '▓', formula: 'δ = 5wL⁴/(384EI)', calc: (w,L,E,I) => 5*w*Math.pow(L,4)/(384*E*I), M: (w,L) => w*L*L/8 },
  { label: 'Cantilever — point load at free end', icon: '↙', formula: 'δ = PL³/(3EI)', calc: (P,L,E,I) => P*Math.pow(L,3)/(3*E*I), M: (P,L) => P*L },
  { label: 'Cantilever — UDL (full length)', icon: '▓↙', formula: 'δ = wL⁴/(8EI)', calc: (w,L,E,I) => w*Math.pow(L,4)/(8*E*I), M: (w,L) => w*L*L/2 },
]
const SECTIONS = [
  { name: 'Rect 100×200mm', I: 200*Math.pow(100,3)/12*1e-12 },
  { name: 'Rect 200×300mm', I: 300*Math.pow(200,3)/12*1e-12 },
  { name: 'I-beam IPE 200', I: 1943e-8 },
  { name: 'I-beam IPE 300', I: 8356e-8 },
  { name: 'Hollow 100×100×5mm', I: ((100**4 - 90**4)/12)*1e-12 },
]
const MATERIALS = [
  { name: 'Steel', E: 200e9 }, { name: 'Aluminum', E: 69e9 }, { name: 'Wood', E: 12e9 }, { name: 'Concrete', E: 30e9 }
]
const FAQ = [
  { q: 'What is beam deflection and why does it matter?', a: 'Beam deflection is the displacement of a beam under load. Excessive deflection causes problems: cracking of plaster ceilings, misalignment of machinery, discomfort in floors. Building codes typically limit floor beam deflection to L/360 (length/360) under live load and L/240 total.' },
  { q: 'What is the moment of inertia (I) of a cross-section?', a: 'Second moment of area (I) measures a cross-section\'s resistance to bending. Rectangle: I = bh³/12 (b=width, h=height in bending direction). Placing material far from the neutral axis greatly increases I — this is why I-beams are efficient. Units: m⁴ or mm⁴.' },
]
export default function BeamDeflectionCalculator({ meta, category }) {
  const C = category?.color || '#f59e0b'
  const [caseIdx, setCaseIdx] = useState(0)
  const [load, setLoad] = useState(5000)
  const [span, setSpan] = useState(5)
  const [matIdx, setMatIdx] = useState(0)
  const [secIdx, setSecIdx] = useState(1)
  const [openFaq, setOpenFaq] = useState(null)

  const bc = BEAM_CASES[caseIdx]
  const mat = MATERIALS[matIdx]
  const sec = SECTIONS[secIdx]
  const E = mat.E
  const I = sec.I
  const L = span
  const P = load
  const delta = bc.calc(P, L, E, I) * 1000 // mm
  const Mmax = bc.M(P, L) // N·m
  const limitL360 = span * 1000 / 360
  const ok = delta <= limitL360

  const hint = `${bc.label}: δ=${delta.toFixed(2)}mm, M_max=${(Mmax/1000).toFixed(2)} kN·m. Limit L/360=${limitL360.toFixed(1)}mm. ${ok ? 'PASS' : 'FAIL — increase beam size'}.`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ background: `linear-gradient(135deg,${C}15,${C}06)`, border: `1px solid ${C}30`, borderRadius: 14, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div><div style={{ fontSize: 10, fontWeight: 700, color: C, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>Beam Deflection</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>{bc.formula}</div></div>
        <div style={{ display: 'flex', gap: 10 }}>
          {[{ l: 'Deflection', v: `${delta.toFixed(2)} mm` }, { l: 'L/360 limit', v: `${limitL360.toFixed(1)} mm` }].map((m, i) => (
            <div key={i} style={{ padding: '8px 12px', background: (i===0 && !ok) ? '#fee2e220' : C + '15', borderRadius: 9, textAlign: 'center', border: i===0 ? `1px solid ${ok ? C + '30' : '#ef444430'}` : 'none' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: i===0 ? (ok ? C : '#ef4444') : 'var(--text-3)', fontFamily: "'Space Grotesk',sans-serif" }}>{m.v}</div>
              <div style={{ fontSize: 10, color: 'var(--text-3)' }}>{m.l}</div>
            </div>
          ))}
        </div>
      </div>
      <CalcShell
        left={<>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 8 }}>Loading case</label>
            {BEAM_CASES.map((bc, i) => <button key={i} onClick={() => setCaseIdx(i)} style={{ display: 'block', width: '100%', marginBottom: 5, padding: '8px 12px', borderRadius: 8, border: `1.5px solid ${caseIdx === i ? C : 'var(--border-2)'}`, background: caseIdx === i ? C + '12' : 'var(--bg-raised)', fontSize: 12, fontWeight: caseIdx === i ? 700 : 400, color: caseIdx === i ? C : 'var(--text)', cursor: 'pointer', textAlign: 'left' }}>{bc.icon} {bc.label}</button>)}
          </div>
          {[['Load P or w (N or N/m)', load, setLoad], ['Span L (m)', span, setSpan]].map(([l, v, set]) => (
            <div key={l} style={{ marginBottom: 12 }}><label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 5 }}>{l}</label><input type="number" step="any" value={v} onChange={e => set(+e.target.value)} style={{ width: '100%', height: 42, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 14px', fontSize: 16, fontWeight: 700, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', boxSizing: 'border-box' }} /></div>
          ))}
          <div style={{ marginBottom: 12 }}><label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 5 }}>Material</label><select value={matIdx} onChange={e => setMatIdx(+e.target.value)} style={{ width: '100%', height: 42, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 10px', fontSize: 13, background: 'var(--bg-card)', color: 'var(--text)' }}>{MATERIALS.map((m, i) => <option key={i} value={i}>{m.name} (E={m.E/1e9} GPa)</option>)}</select></div>
          <div style={{ marginBottom: 12 }}><label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 5 }}>Cross-section</label><select value={secIdx} onChange={e => setSecIdx(+e.target.value)} style={{ width: '100%', height: 42, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 10px', fontSize: 13, background: 'var(--bg-card)', color: 'var(--text)' }}>{SECTIONS.map((s, i) => <option key={i} value={i}>{s.name}</option>)}</select></div>
        </>}
        right={<>
          <div style={{ padding: '12px 14px', background: ok ? '#d1fae520' : '#fee2e220', borderRadius: 10, border: `1px solid ${ok ? '#10b98130' : '#ef444430'}`, marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: ok ? '#10b981' : '#ef4444', marginBottom: 4 }}>{ok ? '✓ PASS — Deflection within L/360' : '✗ FAIL — Increase beam depth or reduce span'}</div>
            <div style={{ fontSize: 12, color: 'var(--text)' }}>δ = {delta.toFixed(2)}mm vs limit {limitL360.toFixed(1)}mm</div>
          </div>
          <BreakdownTable title="Results" rows={[
            { label: 'Max deflection δ', value: `${delta.toFixed(3)} mm`, bold: true, highlight: true, color: ok ? C : '#ef4444' },
            { label: 'L/360 limit', value: `${limitL360.toFixed(2)} mm` },
            { label: 'Max moment M', value: `${(Mmax/1000).toFixed(2)} kN·m` },
            { label: 'EI (stiffness)', value: `${(E*I).toFixed(0)} N·m²` },
          ]} />
          <AIHintCard hint={hint} />
        </>}
      />
      <FormulaCard formula={"Simply supported + central load: δ = PL³/(48EI)\nCantilever + end load: δ = PL³/(3EI)\nI_rect = bh³/12"} variables={[{ symbol: 'δ', meaning: 'Maximum deflection (m)' }, { symbol: 'P', meaning: 'Point load (N) or w = UDL (N/m)' }, { symbol: 'L', meaning: 'Span length (m)' }, { symbol: 'E', meaning: 'Elastic modulus (Pa)' }, { symbol: 'I', meaning: 'Second moment of area (m⁴)' }]} explanation="Beam deflection formulas depend on loading pattern and support conditions. Increasing I (deeper beam) or E (stiffer material) reduces deflection. Doubling depth reduces deflection by 8× since I scales with h³." />
      <Sec title="Frequently asked questions">{FAQ.map((f, i) => <Acc key={i} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} color={C} />)}</Sec>
    </div>
  )
}
