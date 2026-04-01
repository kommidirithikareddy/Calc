import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import FormulaCard from '../../components/calculator/FormulaCard'
import AIHintCard from '../../components/calculator/AIHintCard'

const COLORS = [
  { name: 'Black',  digit: 0, mult: 1,      tol: null,   temp: 250, bg: '#1a1a1a', fg: '#fff' },
  { name: 'Brown',  digit: 1, mult: 10,     tol: 1,      temp: 100, bg: '#7c3f00', fg: '#fff' },
  { name: 'Red',    digit: 2, mult: 100,    tol: 2,      temp: 50,  bg: '#ef4444', fg: '#fff' },
  { name: 'Orange', digit: 3, mult: 1000,   tol: null,   temp: 15,  bg: '#f97316', fg: '#fff' },
  { name: 'Yellow', digit: 4, mult: 10000,  tol: null,   temp: 25,  bg: '#fbbf24', fg: '#000' },
  { name: 'Green',  digit: 5, mult: 100000, tol: 0.5,    temp: 20,  bg: '#22c55e', fg: '#fff' },
  { name: 'Blue',   digit: 6, mult: 1e6,    tol: 0.25,   temp: 10,  bg: '#3b82f6', fg: '#fff' },
  { name: 'Violet', digit: 7, mult: 1e7,    tol: 0.1,    temp: 5,   bg: '#8b5cf6', fg: '#fff' },
  { name: 'Grey',   digit: 8, mult: 1e8,    tol: 0.05,   temp: 1,   bg: '#9ca3af', fg: '#000' },
  { name: 'White',  digit: 9, mult: 1e9,    tol: null,   temp: null, bg: '#f9fafb', fg: '#000' },
  { name: 'Gold',   digit: null, mult: 0.1, tol: 5,      temp: null, bg: '#d4af37', fg: '#000' },
  { name: 'Silver', digit: null, mult: 0.01,tol: 10,     temp: null, bg: '#c0c0c0', fg: '#000' },
  { name: 'None',   digit: null, mult: null, tol: 20,    temp: null, bg: '#e5e7eb', fg: '#000' },
]

const fmtR = val => {
  if (!val || isNaN(val)) return '—'
  if (val >= 1e9) return (val / 1e9).toFixed(3) + ' GΩ'
  if (val >= 1e6) return (val / 1e6).toFixed(3) + ' MΩ'
  if (val >= 1e3) return (val / 1e3).toFixed(3) + ' kΩ'
  return val.toFixed(3) + ' Ω'
}

const E24 = [1.0,1.1,1.2,1.3,1.5,1.6,1.8,2.0,2.2,2.4,2.7,3.0,3.3,3.6,3.9,4.3,4.7,5.1,5.6,6.2,6.8,7.5,8.2,9.1]
const powers = [1,10,100,1000,10000,100000,1e6,1e7,1e8,1e9]
function nearestE24(val) {
  let best = null, bestDiff = Infinity
  for (const p of powers) for (const e of E24) {
    const r = e * p
    const diff = Math.abs(r - val)
    if (diff < bestDiff) { bestDiff = diff; best = r }
  }
  return best
}

function ColorSwatch({ color, selected, onClick, size = 32 }) {
  return (
    <button onClick={onClick} title={color.name}
      style={{ width: size, height: size, borderRadius: 6, background: color.bg, border: `${selected ? 3 : 1.5}px solid ${selected ? '#fff' : 'transparent'}`, cursor: 'pointer', boxShadow: selected ? `0 0 0 2px #000` : 'none', flexShrink: 0, transition: 'transform .1s', transform: selected ? 'scale(1.1)' : 'scale(1)' }}>
      {selected && <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: color.fg }}>✓</div>}
    </button>
  )
}

const FAQ = [
  { q: 'How do I read a 4-band resistor?', a: 'Band 1 = first digit, Band 2 = second digit, Band 3 = multiplier (×10^n), Band 4 = tolerance (gold=±5%, silver=±10%). Example: Red Red Orange Gold = 2, 2, ×1000, ±5% = 22,000Ω = 22kΩ ±5%.' },
  { q: 'What is the difference between 4-band and 5-band resistors?', a: '5-band resistors add a third significant digit, allowing more precise values. Common in precision resistors (1% and better). Band 1, 2, 3 = digits, Band 4 = multiplier, Band 5 = tolerance.' },
  { q: 'What does tolerance mean?', a: 'Tolerance is the allowable variation from the stated value. A 100Ω ±5% resistor could measure anywhere from 95Ω to 105Ω and still be within spec. For critical circuits (audio, sensing), use 1% or 0.5% precision resistors.' },
  { q: 'How do I identify which end to start reading from?', a: 'On 4-band resistors, the gold or silver tolerance band is usually on the right — read from left. If bands are clustered to one side, start from that side. When unsure, read both ways and see which gives a standard E24/E96 value.' },
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

export default function ResistorColorCalculator({ meta, category }) {
  const C = category?.color || '#f59e0b'
  const [bands, setBands] = useState(4)
  const [selected, setSelected] = useState([1, 2, 5, 10, null]) // indices into COLORS
  const [mode, setMode] = useState('decode') // decode | encode
  const [encodeVal, setEncodeVal] = useState(1000)
  const [openFaq, setOpenFaq] = useState(null)

  const setColor = (band, idx) => {
    const n = [...selected]; n[band] = idx; setSelected(n)
  }

  // Decode: read bands → resistance
  const band = i => selected[i] !== null ? COLORS[selected[i]] : null
  let resistance = null, tolerance = null, tempCoeff = null
  if (mode === 'decode') {
    const b1 = band(0), b2 = band(1), b3 = bands >= 5 ? band(2) : null, bMult = band(bands === 4 ? 2 : 3), bTol = band(bands === 4 ? 3 : 4)
    if (b1 && b2 && bMult && b1.digit !== null && b2.digit !== null) {
      const digits = bands === 4
        ? b1.digit * 10 + b2.digit
        : b3 && b3.digit !== null ? b1.digit * 100 + b2.digit * 10 + b3.digit : null
      if (digits !== null && bMult.mult !== null) {
        resistance = digits * bMult.mult
        tolerance = bTol?.tol
        tempCoeff = bands === 6 ? band(5)?.temp : null
      }
    }
  } else {
    resistance = encodeVal
  }

  const nearest = resistance && mode === 'decode' ? nearestE24(resistance) : null
  const tolLow = resistance && tolerance ? resistance * (1 - tolerance / 100) : null
  const tolHigh = resistance && tolerance ? resistance * (1 + tolerance / 100) : null

  // Encode: find bands for a given value
  let encodedBands = null
  if (mode === 'encode' && encodeVal) {
    const n = nearestE24(encodeVal)
    const digits = Math.round(n)
    // Find 4-band code: 2 significant digits + multiplier
    const log = Math.floor(Math.log10(n)) - 1
    const sig = Math.round(n / Math.pow(10, log))
    const d1 = Math.floor(sig / 10), d2 = sig % 10
    const mult = log
    encodedBands = { d1, d2, mult, value: n }
  }

  const hint = resistance ? `Resistance: ${fmtR(resistance)}${tolerance ? ` ±${tolerance}%` : ''}${tolLow ? `. Range: ${fmtR(tolLow)} – ${fmtR(tolHigh)}` : ''}` : 'Select color bands to decode resistance.'

  const digitColors = COLORS.filter(c => c.digit !== null && c.name !== 'None')
  const multColors = COLORS.filter(c => c.mult !== null)
  const tolColors = COLORS.filter(c => c.tol !== null)

  const bandLabels = bands === 4
    ? ['Digit 1', 'Digit 2', 'Multiplier', 'Tolerance']
    : ['Digit 1', 'Digit 2', 'Digit 3', 'Multiplier', 'Tolerance', ...(bands === 6 ? ['Temp. coeff.'] : [])]

  const bandValidColors = bands === 4
    ? [digitColors, digitColors, multColors, tolColors]
    : [digitColors, digitColors, digitColors, multColors, tolColors, COLORS.filter(c => c.temp !== null)]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      <div style={{ background: `linear-gradient(135deg,${C}15,${C}06)`, border: `1px solid ${C}30`, borderRadius: 14, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>Resistor Color Code</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>R = (d1d2[d3]) × Multiplier</div>
        </div>
        {resistance && (
          <div style={{ padding: '8px 18px', background: C + '15', borderRadius: 10, textAlign: 'right' }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>{fmtR(resistance)}</div>
            {tolerance && <div style={{ fontSize: 11, color: 'var(--text-3)' }}>±{tolerance}%</div>}
          </div>
        )}
      </div>

      {/* Visual resistor */}
      {mode === 'decode' && (
        <Sec title="Visual resistor preview">
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '10px 0' }}>
            <svg width="320" height="60" viewBox="0 0 320 60">
              {/* Body */}
              <rect x="60" y="20" width="200" height="20" rx="6" fill="#c9a96e" stroke="#a07840" strokeWidth="1"/>
              {/* Leads */}
              <line x1="0" y1="30" x2="60" y2="30" stroke="#9ca3af" strokeWidth="3"/>
              <line x1="260" y1="30" x2="320" y2="30" stroke="#9ca3af" strokeWidth="3"/>
              {/* Color bands */}
              {bandLabels.slice(0, bands - (bands === 6 ? 1 : 0)).map((_, i) => {
                const c = selected[i] !== null ? COLORS[selected[i]] : null
                const x = 80 + i * (bands === 4 ? 44 : 33)
                const isLast = i === bandLabels.length - 1
                const finalX = isLast ? 218 : x
                return c ? <rect key={i} x={finalX} y="18" width="12" height="24" fill={c.bg} rx="2" stroke="#00000020" strokeWidth="0.5"/> : null
              })}
              {/* Labels */}
              {[bands === 4 ? 'Ω' : 'Ω'].map((_, i) => null)}
            </svg>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 20, flexWrap: 'wrap' }}>
            {bandLabels.map((l, i) => {
              const c = selected[i] !== null ? COLORS[selected[i]] : null
              return (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: c?.bg || '#e5e7eb', margin: '0 auto 4px', border: '1px solid #00000010' }} />
                  <div style={{ fontSize: 10, color: 'var(--text-3)' }}>{l}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)' }}>{c?.name || '—'}</div>
                </div>
              )
            })}
          </div>
        </Sec>
      )}

      <CalcShell
        left={<>
          <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
            {['Decode (color→Ω)', 'Encode (Ω→color)'].map((l, i) => (
              <button key={i} onClick={() => setMode(i === 0 ? 'decode' : 'encode')}
                style={{ flex: 1, padding: '9px', borderRadius: 8, border: `1.5px solid ${mode === (i === 0 ? 'decode' : 'encode') ? C : 'var(--border-2)'}`, background: mode === (i === 0 ? 'decode' : 'encode') ? C + '12' : 'var(--bg-raised)', fontSize: 12, fontWeight: mode === (i === 0 ? 'decode' : 'encode') ? 700 : 500, color: mode === (i === 0 ? 'decode' : 'encode') ? C : 'var(--text-2)', cursor: 'pointer' }}>{l}</button>
            ))}
          </div>

          {mode === 'decode' ? (
            <>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 8 }}>Number of bands</label>
                <div style={{ display: 'flex', gap: 6 }}>
                  {[4, 5, 6].map(n => (
                    <button key={n} onClick={() => setBands(n)}
                      style={{ flex: 1, padding: '9px', borderRadius: 8, border: `1.5px solid ${bands === n ? C : 'var(--border-2)'}`, background: bands === n ? C + '12' : 'var(--bg-raised)', fontSize: 13, fontWeight: bands === n ? 700 : 500, color: bands === n ? C : 'var(--text-2)', cursor: 'pointer' }}>{n}-band</button>
                  ))}
                </div>
              </div>
              {bandLabels.map((label, bi) => (
                <div key={bi} style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 6 }}>Band {bi + 1}: {label}</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {(bandValidColors[bi] || COLORS).map((c, ci) => {
                      const realIdx = COLORS.indexOf(c)
                      return <ColorSwatch key={ci} color={c} selected={selected[bi] === realIdx} onClick={() => setColor(bi, realIdx)} size={28} />
                    })}
                  </div>
                  {selected[bi] !== null && <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>{COLORS[selected[bi]]?.name}</div>}
                </div>
              ))}
            </>
          ) : (
            <>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 6 }}>Desired resistance (Ω)</label>
                <input type="number" value={encodeVal} onChange={e => setEncodeVal(+e.target.value)}
                  style={{ width: '100%', height: 44, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 14px', fontSize: 17, fontWeight: 700, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', fontFamily: "'Space Grotesk',sans-serif", boxSizing: 'border-box' }} />
              </div>
              <div style={{ padding: '10px 13px', background: 'var(--bg-raised)', borderRadius: 9, border: '0.5px solid var(--border)', fontSize: 12, color: 'var(--text-2)' }}>
                Nearest E24 value: <strong style={{ color: C }}>{fmtR(nearestE24(encodeVal))}</strong>
              </div>
            </>
          )}
        </>}

        right={<>
          {resistance ? (
            <>
              <div style={{ background: 'var(--bg-card)', border: `1.5px solid ${C}40`, borderRadius: 14, padding: '18px 20px', marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 8 }}>Resistance</div>
                <div style={{ fontSize: 42, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif", lineHeight: 1 }}>{fmtR(resistance)}</div>
                {tolerance && <div style={{ fontSize: 14, color: 'var(--text-2)', marginTop: 6 }}>Tolerance: <strong>±{tolerance}%</strong></div>}
                {tolLow && <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>Range: {fmtR(tolLow)} – {fmtR(tolHigh)}</div>}
                {tempCoeff && <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>Temp coeff: {tempCoeff} ppm/°C</div>}
              </div>
              {nearest && nearest !== resistance && (
                <div style={{ padding: '10px 13px', background: '#fef3c7', borderRadius: 9, border: '0.5px solid #f59e0b30', marginBottom: 14, fontSize: 12, color: '#92400e' }}>
                  Nearest E24 standard value: <strong>{fmtR(nearest)}</strong>
                </div>
              )}
              <BreakdownTable title="Decoded values" rows={[
                { label: 'Resistance', value: fmtR(resistance), bold: true, highlight: true, color: C },
                ...(tolerance ? [{ label: 'Tolerance', value: `±${tolerance}%` }] : []),
                ...(tolLow ? [{ label: 'Min value', value: fmtR(tolLow) }] : []),
                ...(tolHigh ? [{ label: 'Max value', value: fmtR(tolHigh) }] : []),
                ...(tempCoeff ? [{ label: 'Temp coeff', value: `${tempCoeff} ppm/°C` }] : []),
              ]} />
            </>
          ) : (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-3)', fontSize: 13, background: 'var(--bg-raised)', borderRadius: 14, marginBottom: 14, border: '1px dashed var(--border)' }}>Select all color bands to decode</div>
          )}
          <AIHintCard hint={hint} />
        </>}
      />

      <Sec title="Color code reference table" sub="All 13 colors and their values">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>{['Color', 'Digit', 'Multiplier', 'Tolerance', 'Temp (ppm/°C)'].map(h => (
                <th key={h} style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textAlign: 'left', padding: '8px 10px', borderBottom: '1px solid var(--border)', background: 'var(--bg-raised)' }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {COLORS.filter(c => c.name !== 'None').map((c, i) => (
                <tr key={i}>
                  <td style={{ padding: '7px 10px', borderBottom: '0.5px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 20, height: 20, borderRadius: 4, background: c.bg, border: '1px solid #00000015' }} />
                      <span style={{ fontSize: 12, color: 'var(--text)', fontWeight: 500 }}>{c.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '7px 10px', fontSize: 12, color: 'var(--text)', borderBottom: '0.5px solid var(--border)', fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600 }}>{c.digit !== null ? c.digit : '—'}</td>
                  <td style={{ padding: '7px 10px', fontSize: 12, color: C, borderBottom: '0.5px solid var(--border)', fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600 }}>{c.mult !== null ? (c.mult >= 1 ? '×' + c.mult.toLocaleString() : '×' + c.mult) : '—'}</td>
                  <td style={{ padding: '7px 10px', fontSize: 12, color: 'var(--text)', borderBottom: '0.5px solid var(--border)', fontFamily: "'Space Grotesk',sans-serif" }}>{c.tol !== null ? `±${c.tol}%` : '—'}</td>
                  <td style={{ padding: '7px 10px', fontSize: 12, color: 'var(--text-3)', borderBottom: '0.5px solid var(--border)' }}>{c.temp !== null ? c.temp : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Sec>

      <Sec title="Frequently asked questions">
        {FAQ.map((f, i) => <Acc key={i} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} color={C} />)}
      </Sec>
    </div>
  )
}
