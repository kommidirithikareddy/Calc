import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import FormulaCard from '../../components/calculator/FormulaCard'
import AIHintCard from '../../components/calculator/AIHintCard'

const fmt = (v, dp = 6) => {
  if (v === null || isNaN(v) || !isFinite(v)) return '—'
  if (Math.abs(v) >= 1e9) return v.toExponential(4)
  if (Math.abs(v) < 1e-4 && v !== 0) return v.toExponential(4)
  return parseFloat(v.toFixed(dp)).toString()
}

const PI = Math.PI

// Convert FROM degrees TO all units
function fromDeg(deg) {
  const d = parseFloat(deg)
  if (isNaN(d)) return {}
  return {
    deg: d,
    rad: d * PI / 180,
    grad: d * 400 / 360,
    rev: d / 360,
    arcmin: d * 60,
    arcsec: d * 3600,
    mrad: d * PI / 0.18,   // milliradians
  }
}

// Convert any unit to degrees first
const toDeg = {
  deg: v => v,
  rad: v => v * 180 / PI,
  grad: v => v * 360 / 400,
  rev: v => v * 360,
  arcmin: v => v / 60,
  arcsec: v => v / 3600,
  mrad: v => v * 0.18 / PI,
}

const UNITS = [
  { key: 'deg',    label: 'Degrees',        symbol: '°',      note: 'Most common angle unit (0–360)' },
  { key: 'rad',    label: 'Radians',        symbol: 'rad',    note: 'SI unit — 2π = full circle' },
  { key: 'grad',   label: 'Gradians',       symbol: 'grad',   note: '400 gradians = full circle' },
  { key: 'rev',    label: 'Revolutions',    symbol: 'rev',    note: '1 revolution = 360°' },
  { key: 'arcmin', label: 'Arcminutes',     symbol: '′',      note: '60 arcmin = 1 degree' },
  { key: 'arcsec', label: 'Arcseconds',     symbol: '″',      note: '3600 arcsec = 1 degree' },
  { key: 'mrad',   label: 'Milliradians',   symbol: 'mrad',   note: '1000 mrad ≈ 57.3°' },
]

const COMMON = [
  { label: '0°', deg: 0 }, { label: '30°', deg: 30 }, { label: '45°', deg: 45 }, { label: '60°', deg: 60 },
  { label: '90°', deg: 90 }, { label: '120°', deg: 120 }, { label: '180°', deg: 180 }, { label: '270°', deg: 270 }, { label: '360°', deg: 360 },
]

const FAQ = [
  { q: 'Why are radians the standard in mathematics?', a: 'Radians make calculus formulas simpler. The derivative of sin(x) is cos(x) only when x is in radians. In degrees, it would be (π/180)cos(x). Arc length = r × θ works directly in radians without conversion factors. All higher mathematics uses radians.' },
  { q: 'What are gradians used for?', a: 'Gradians (or gons) divide a right angle into 100 parts, making right angles equal exactly 100 grad. They are used in surveying and civil engineering — a slope of 1% in gradians notation is 1 grad, which makes grade calculations very clean. Some European countries still use them.' },
  { q: 'How do I convert degrees to radians mentally?', a: 'Multiply degrees by π/180 ≈ 0.01745. Common values to memorize: 30° = π/6, 45° = π/4, 60° = π/3, 90° = π/2, 180° = π, 360° = 2π. For rough estimates: 57.3° ≈ 1 radian.' },
  { q: 'What are arcminutes and arcseconds used for?', a: 'Arcminutes (′) and arcseconds (″) are used in astronomy, navigation, and GPS. One arcminute of latitude ≈ 1 nautical mile (1852m). The Moon\'s apparent diameter is about 31 arcminutes. GPS accuracy of 1m corresponds to about 0.03 arcseconds of latitude.' },
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

export default function AngleConverterCalculator({ meta, category }) {
  const C = category?.color || '#3b82f6'
  const [inputKey, setInputKey] = useState('deg')
  const [inputVal, setInputVal] = useState('90')
  const [openFaq, setOpenFaq] = useState(null)

  const degVal = toDeg[inputKey] ? toDeg[inputKey](parseFloat(inputVal)) : parseFloat(inputVal)
  const all = fromDeg(isNaN(degVal) ? 0 : degVal)

  const hint = `${inputVal} ${UNITS.find(u => u.key === inputKey)?.symbol} = ${fmt(all.deg)}° = ${fmt(all.rad)} rad = ${fmt(all.grad)} grad`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      <div style={{ background: `linear-gradient(135deg,${C}15,${C}06)`, border: `1px solid ${C}30`, borderRadius: 14, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>Angle Converter</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>Degrees · Radians · Gradians · Arcmin · Arcsec</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 26, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>{fmt(all.deg, 5)}°</div>
          <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{fmt(all.rad, 6)} rad</div>
        </div>
      </div>

      <CalcShell
        left={<>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 8 }}>Convert from</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {UNITS.map(u => (
                <button key={u.key} onClick={() => setInputKey(u.key)}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 12px', borderRadius: 9, border: `1.5px solid ${inputKey === u.key ? C : 'var(--border-2)'}`, background: inputKey === u.key ? C + '12' : 'var(--bg-raised)', cursor: 'pointer' }}>
                  <span style={{ fontSize: 13, fontWeight: inputKey === u.key ? 700 : 500, color: inputKey === u.key ? C : 'var(--text)' }}>{u.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-3)', fontFamily: "'Space Grotesk',sans-serif" }}>{u.symbol}</span>
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 6 }}>Value</label>
            <input type="number" value={inputVal} onChange={e => setInputVal(e.target.value)}
              style={{ width: '100%', height: 48, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 14px', fontSize: 20, fontWeight: 700, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', fontFamily: "'Space Grotesk',sans-serif", boxSizing: 'border-box' }} />
          </div>

          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 8 }}>Common angles</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {COMMON.map(ca => (
                <button key={ca.deg} onClick={() => { setInputKey('deg'); setInputVal(String(ca.deg)) }}
                  style={{ padding: '5px 10px', borderRadius: 7, border: `1px solid ${inputKey === 'deg' && inputVal === String(ca.deg) ? C : 'var(--border-2)'}`, background: inputKey === 'deg' && inputVal === String(ca.deg) ? C + '12' : 'var(--bg-raised)', fontSize: 12, fontWeight: 600, color: inputKey === 'deg' && inputVal === String(ca.deg) ? C : 'var(--text)', cursor: 'pointer' }}>{ca.label}</button>
              ))}
            </div>
          </div>
        </>}

        right={<>
          {/* All conversions — with text that won't overflow */}
          <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 12, overflow: 'hidden', marginBottom: 14 }}>
            <div style={{ padding: '10px 14px', borderBottom: '0.5px solid var(--border)', fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>All conversions</div>
            {UNITS.map(u => {
              const val = all[u.key]
              const isActive = u.key === inputKey
              return (
                <div key={u.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderBottom: '0.5px solid var(--border)', background: isActive ? C + '08' : 'transparent', gap: 12 }}>
                  <div style={{ minWidth: 90 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: isActive ? C : 'var(--text)' }}>{u.label}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-3)' }}>{u.symbol}</div>
                  </div>
                  <div style={{
                    fontSize: 14, fontWeight: 700,
                    color: isActive ? C : 'var(--text)',
                    fontFamily: "'Space Grotesk',sans-serif",
                    textAlign: 'right',
                    wordBreak: 'break-all',
                    maxWidth: 180,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }} title={String(val)}>
                    {fmt(val, 8)}
                  </div>
                </div>
              )
            })}
          </div>
          <AIHintCard hint={hint} />
        </>}
      />

      {/* Visual angle wheel */}
      <Sec title="Angle visualizer" sub={`${fmt(all.deg, 2)}° shown`}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0' }}>
          <svg width="200" height="200" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="90" fill="none" stroke="var(--border)" strokeWidth="1" />
            <circle cx="100" cy="100" r="90" fill={C + '08'} />
            {/* Angle arc */}
            {(() => {
              const a = (-all.deg * PI / 180)
              const x = 100 + 90 * Math.cos(a)
              const y = 100 + 90 * Math.sin(a)
              const largeArc = all.deg > 180 ? 1 : 0
              return <>
                <path d={`M 100 100 L 190 100 A 90 90 0 ${largeArc} 0 ${x.toFixed(2)} ${y.toFixed(2)} Z`} fill={C + '20'} stroke={C} strokeWidth="1.5" />
                <line x1="100" y1="100" x2={x.toFixed(2)} y2={y.toFixed(2)} stroke={C} strokeWidth="2.5" strokeLinecap="round" />
              </>
            })()}
            <line x1="100" y1="100" x2="190" y2="100" stroke="var(--text-3)" strokeWidth="1.5" />
            {[0, 90, 180, 270].map(a => (
              <text key={a} x={100 + 78 * Math.cos(-a * PI / 180)} y={104 + 78 * Math.sin(-a * PI / 180)} textAnchor="middle" fontSize="10" fill="var(--text-3)" fontFamily="monospace">{a}°</text>
            ))}
            <text x="100" y="104" textAnchor="middle" fontSize="14" fontWeight="700" fill={C} fontFamily="inherit">{fmt(all.deg, 1)}°</text>
          </svg>
        </div>
      </Sec>

      <FormulaCard
        formula={'Degrees → Radians: × π/180\nRadians → Degrees: × 180/π\nDegrees → Gradians: × 400/360\nDegrees → Arcminutes: × 60\nDegrees → Arcseconds: × 3600'}
        variables={[
          { symbol: '°', meaning: 'Degrees — 360 per full circle' },
          { symbol: 'rad', meaning: 'Radians — 2π per full circle' },
          { symbol: 'grad', meaning: 'Gradians — 400 per full circle' },
          { symbol: '′', meaning: 'Arcminutes — 60 per degree' },
          { symbol: '″', meaning: 'Arcseconds — 60 per arcminute' },
        ]}
        explanation="All angle units describe the same rotation — just in different scales. Radians are natural for mathematics (arc length = r × θ). Degrees are intuitive for most people. Gradians suit surveying. Arcminutes and arcseconds are used in astronomy and navigation where very small angles matter."
      />

      <Sec title="Frequently asked questions">
        {FAQ.map((f, i) => <Acc key={i} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} color={C} />)}
      </Sec>
    </div>
  )
}
