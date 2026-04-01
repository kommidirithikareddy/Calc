import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import FormulaCard from '../../components/calculator/FormulaCard'
import AIHintCard from '../../components/calculator/AIHintCard'

function Sec({ title, children }) {
  return (<div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}><div style={{ padding: '13px 18px', borderBottom: '0.5px solid var(--border)' }}><span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{title}</span></div><div style={{ padding: '16px 18px' }}>{children}</div></div>)
}
function Acc({ q, a, open, onToggle, color }) {
  return (<div style={{ borderBottom: '0.5px solid var(--border)' }}><button onClick={onToggle} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 0', background: 'none', border: 'none', cursor: 'pointer', gap: 12, textAlign: 'left' }}><span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', lineHeight: 1.4 }}>{q}</span><span style={{ fontSize: 18, color, flexShrink: 0, transform: open ? 'rotate(45deg)' : 'none', transition: 'transform .2s' }}>+</span></button>{open && <p style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.75, margin: '0 0 13px' }}>{a}</p>}</div>)
}

const HRC_TABLE = [
  {hrc: 65, hrb: null, hb: 739, hv: 832, tensile: 2406},
  {hrc: 60, hrb: null, hb: 627, hv: 746, tensile: 2137},
  {hrc: 55, hrb: null, hb: 534, hv: 630, tensile: 1862},
  {hrc: 50, hrb: null, hb: 481, hv: 514, tensile: 1590},
  {hrc: 45, hrb: null, hb: 421, hv: 446, tensile: 1379},
  {hrc: 40, hrb: null, hb: 371, hv: 392, tensile: 1186},
  {hrc: 35, hrb: null, hb: 327, hv: 345, tensile: 1014},
  {hrc: 30, hrb: null, hb: 286, hv: 302, tensile: 876},
  {hrc: 25, hrb: null, hb: 253, hv: 266, tensile: 772},
  {hrc: 20, hrb: 97, hb: 226, hv: 238, tensile: 703},
  {hrc: 15, hrb: 93, hb: 203, hv: 213, tensile: 634},
  {hrc: 10, hrb: 89, hb: 183, hv: 192, tensile: 565},
  {hrc: 5, hrb: 84, hb: 163, hv: 170, tensile: 524},
  {hrc: 0, hrb: 79, hb: 143, hv: 150, tensile: 490},
]

const FAQ = [
  { q: 'What are the main hardness scales?', a: 'Rockwell C (HRC): Used for hard steels and tool steels. Range 20-70 HRC. Rockwell B (HRB): Soft steels, aluminum, brass. Range 0-100 HRB. Brinell (HB): Cast iron, non-ferrous metals, soft/medium steels. Vickers (HV): Universal scale using diamond pyramid, excellent for thin films and case-hardened layers.' },
  { q: 'Is there an exact formula to convert between scales?', a: 'No — the conversions are empirical approximations based on regression of experimental data (ASTM E140). Small differences between conversion tables from different sources are normal. For critical applications, always measure hardness using the appropriate scale directly.' },
  { q: 'How does hardness relate to tensile strength?', a: 'For carbon steels, tensile strength (MPa) ≈ 3.45 × HB (Brinell hardness). This approximation works reasonably for unalloyed steels but becomes less accurate for alloy steels, stainless steels, or non-ferrous metals. It provides a useful quick estimate without a tensile test.' },
]

export default function HardnessConverterCalculator({ meta, category }) {
  const C = category?.color || '#f59e0b'
  const [inputScale, setInputScale] = useState('hrc')
  const [inputVal, setInputVal] = useState(40)
  const [openFaq, setOpenFaq] = useState(null)

  const closest = HRC_TABLE.reduce((best, row) => {
    const val = row[inputScale]
    if (val === null) return best
    const diff = Math.abs(val - inputVal)
    return diff < Math.abs((best[inputScale] || 9999) - inputVal) ? row : best
  }, HRC_TABLE[HRC_TABLE.length-1])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ background: `linear-gradient(135deg,${C}15,${C}06)`, border: `1px solid ${C}30`, borderRadius: 14, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>Hardness Scale Converter</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>HRC ↔ HRB ↔ HB ↔ HV (ASTM E140)</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[{ l: 'HRC', v: closest.hrc }, { l: 'HB', v: closest.hb }, { l: 'HV', v: closest.hv }].map((m, i) => (
            <div key={i} style={{ padding: '6px 10px', background: C + '15', borderRadius: 8, textAlign: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>{m.v ?? '—'}</div>
              <div style={{ fontSize: 10, color: 'var(--text-3)' }}>{m.l}</div>
            </div>
          ))}
        </div>
      </div>
      <CalcShell
        left={<>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 8 }}>Input scale</label>
            <div style={{ display: 'flex', gap: 6 }}>
              {[['HRC', 'hrc'], ['HRB', 'hrb'], ['HB', 'hb'], ['HV', 'hv']].map(([l, v]) => (
                <button key={v} onClick={() => setInputScale(v)} style={{ flex: 1, padding: '8px 4px', borderRadius: 8, border: `1.5px solid ${inputScale === v ? C : 'var(--border-2)'}`, background: inputScale === v ? C + '12' : 'var(--bg-raised)', fontSize: 12, fontWeight: inputScale === v ? 700 : 400, color: inputScale === v ? C : 'var(--text-2)', cursor: 'pointer' }}>{l}</button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 6 }}>Hardness value</label>
            <input type="number" value={inputVal} onChange={e => setInputVal(+e.target.value)} style={{ width: '100%', height: 44, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 14px', fontSize: 18, fontWeight: 700, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', boxSizing: 'border-box' }} />
          </div>
        </>}
        right={<>
          <BreakdownTable title="Converted values" rows={[
            { label: 'Rockwell C (HRC)', value: String(closest.hrc ?? '—'), bold: true, highlight: true, color: C },
            { label: 'Rockwell B (HRB)', value: String(closest.hrb ?? '—') },
            { label: 'Brinell (HB)', value: String(closest.hb ?? '—') },
            { label: 'Vickers (HV)', value: String(closest.hv ?? '—') },
            { label: 'Tensile strength (~)', value: closest.tensile ? `~${closest.tensile} MPa` : '—' },
          ]} />
          <AIHintCard hint={`Closest match: HRC=${closest.hrc}, HB=${closest.hb}, HV=${closest.hv}, ~${closest.tensile}MPa tensile strength.`} />
        </>}
      />
      <Sec title="ASTM E140 Conversion Reference Table">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>{['HRC', 'HRB', 'Brinell HB', 'Vickers HV', 'UTS (MPa)'].map(h => <th key={h} style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textAlign: 'left', padding: '7px 10px', borderBottom: '1px solid var(--border)', background: 'var(--bg-raised)' }}>{h}</th>)}</tr></thead>
            <tbody>{HRC_TABLE.map((row, i) => <tr key={i} style={{ background: row.hrc === closest.hrc ? C + '10' : 'transparent' }}>{[row.hrc, row.hrb ?? '—', row.hb, row.hv, row.tensile].map((v, j) => <td key={j} style={{ padding: '6px 10px', fontSize: 12, color: j === 0 ? C : 'var(--text)', fontWeight: j === 0 ? 700 : 400, borderBottom: '0.5px solid var(--border)', fontFamily: "'Space Grotesk',sans-serif" }}>{v}</td>)}</tr>)}</tbody>
          </table>
        </div>
      </Sec>
      <FormulaCard formula={"HRC → HB: empirical ASTM E140 table\nUTS (MPa) ≈ 3.45 × HB (for carbon steel)"} variables={[{ symbol: 'HRC', meaning: 'Rockwell C hardness (hard steels, 20–70)' }, { symbol: 'HB', meaning: 'Brinell hardness number (soft-medium materials)' }, { symbol: 'HV', meaning: 'Vickers hardness (universal, thin materials)' }]} explanation="Hardness conversion is empirical — no single formula covers all materials. ASTM E140 provides correlation tables from large experimental datasets. Tensile strength from Brinell hardness is a useful approximation for unalloyed carbon steels only." />
      <Sec title="Frequently asked questions">{FAQ.map((f, i) => <Acc key={i} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} color={C} />)}</Sec>
    </div>
  )
}
