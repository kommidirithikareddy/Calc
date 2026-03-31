import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'

// ─── helpers ──────────────────────────────────────────────────
const fmt = n => isNaN(n) || !isFinite(n) ? '—' : n.toLocaleString()
const fmtN = n => isNaN(n) || !isFinite(n) ? '—' : parseFloat(n.toFixed(8)).toString()

// True mathematical modulo (always non-negative)
const trueModulo = (a, b) => ((a % b) + b) % b
// Truncated division remainder (JavaScript default, can be negative)
const truncRemainder = (a, b) => a - Math.trunc(a / b) * b
// Floored division remainder
const flooredRemainder = (a, b) => a - Math.floor(a / b) * b
// Euclidean remainder (always non-negative)
const euclideanRemainder = (a, b) => a - Math.abs(b) * Math.floor(a / Math.abs(b))

const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) { [a, b] = [b, a % b] } return a }

// ─── shared UI ────────────────────────────────────────────────
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
        <span style={{ fontSize: 18, color, flexShrink: 0, transform: open ? 'rotate(45deg)' : 'none', transition: 'transform .2s' }}>+</span>
      </button>
      {open && <p style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.75, margin: '0 0 13px', fontFamily: "'DM Sans',sans-serif" }}>{a}</p>}
    </div>
  )
}

function StepsCard({ steps, color }) {
  const [exp, setExp] = useState(false)
  if (!steps?.length) return null
  const vis = exp ? steps : steps.slice(0, 2)
  return (
    <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
      <div style={{ padding: '12px 18px', borderBottom: '0.5px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', fontFamily: "'Space Grotesk',sans-serif" }}>Step-by-step working</span>
        <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{steps.length} steps</span>
      </div>
      <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {vis.map((s, i) => (
          <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <div style={{ width: 26, height: 26, borderRadius: '50%', flexShrink: 0, background: i === steps.length - 1 ? color : color + '18', border: `1.5px solid ${color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: i === steps.length - 1 ? '#fff' : color }}>
              {i === steps.length - 1 ? '✓' : i + 1}
            </div>
            <div style={{ flex: 1 }}>
              {s.label && <div style={{ fontSize: 10, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>{s.label}</div>}
              <div style={{ fontSize: 13, fontFamily: "'Space Grotesk',sans-serif", fontWeight: i === steps.length - 1 ? 700 : 500, background: 'var(--bg-raised)', padding: '8px 12px', borderRadius: 8, border: `0.5px solid ${i === steps.length - 1 ? color + '40' : 'var(--border)'}` }}>{s.math}</div>
              {s.note && <div style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 4, fontStyle: 'italic' }}>↳ {s.note}</div>}
            </div>
          </div>
        ))}
        {steps.length > 2 && (
          <button onClick={() => setExp(e => !e)} style={{ padding: '9px', borderRadius: 9, border: `1px solid ${color}30`, background: color + '08', color, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            {exp ? '▲ Hide steps' : `▼ Show all ${steps.length} steps`}
          </button>
        )}
      </div>
    </div>
  )
}

function MathInput({ label, value, onChange, color, hint, allowNeg }) {
  const [f, setF] = useState(false)
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif" }}>{label}</label>
        {hint && <span style={{ fontSize: 10, color: 'var(--text-3)' }}>{hint}</span>}
      </div>
      <div style={{ display: 'flex', height: 44, border: `1.5px solid ${f ? color : 'var(--border-2)'}`, borderRadius: 9, overflow: 'hidden', background: 'var(--bg-card)', transition: 'border-color .15s' }}>
        <input
          type="number" value={value}
          onChange={e => onChange(e.target.value === '' ? '' : Number(e.target.value))}
          onFocus={() => setF(true)} onBlur={() => setF(false)}
          style={{ flex: 1, border: 'none', background: 'transparent', padding: '0 14px', fontSize: 22, fontWeight: 700, color: 'var(--text)', outline: 'none', fontFamily: "'Space Grotesk',sans-serif" }}
        />
      </div>
    </div>
  )
}

// ─── Clock visual for mod arithmetic ─────────────────────────
function ClockVisual({ dividend, divisor, remainder, color }) {
  const mod = Math.abs(Math.round(divisor))
  if (mod < 2 || mod > 24) return null
  const rem = ((Math.round(dividend) % mod) + mod) % mod
  const W = 180, H = 180, cx = 90, cy = 90, r = 70

  return (
    <Sec title="Clock model of modular arithmetic" sub={`mod ${mod}`}>
      <p style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.7, marginBottom: 14 }}>
        Modular arithmetic is like a clock. After reaching {mod}, you start over at 0. The remainder tells you where you land after going around the clock.
      </p>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <svg viewBox={`0 0 ${W} ${H}`} width={W} style={{ display: 'block' }}>
          <circle cx={cx} cy={cy} r={r} fill="var(--bg-raised)" stroke="var(--border)" strokeWidth="2" />
          {Array.from({ length: mod }, (_, i) => {
            const angle = (i * 2 * Math.PI / mod) - Math.PI / 2
            const x = cx + r * Math.cos(angle)
            const y = cy + r * Math.sin(angle)
            const isRem = i === rem
            return (
              <g key={i}>
                <circle cx={x} cy={y} r={isRem ? 11 : 8} fill={isRem ? color : 'var(--bg-card)'} stroke={isRem ? color : 'var(--border)'} strokeWidth={isRem ? 2 : 1} />
                <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize={isRem ? 10 : 9} fontWeight={isRem ? 700 : 400} fill={isRem ? '#fff' : 'var(--text-2)'} fontFamily="'Space Grotesk',sans-serif">{i}</text>
              </g>
            )
          })}
          {/* hand */}
          {(() => {
            const angle = (rem * 2 * Math.PI / mod) - Math.PI / 2
            return <line x1={cx} y1={cy} x2={cx + (r - 18) * Math.cos(angle)} y2={cy + (r - 18) * Math.sin(angle)} stroke={color} strokeWidth="2.5" strokeLinecap="round" />
          })()}
          <circle cx={cx} cy={cy} r={4} fill={color} />
          <text x={cx} y={cy + 22} textAnchor="middle" fontSize="10" fontWeight="700" fill={color} fontFamily="'Space Grotesk',sans-serif">
            {Math.round(dividend)} mod {mod} = {rem}
          </text>
        </svg>
      </div>
    </Sec>
  )
}

// ─── Modular arithmetic table ─────────────────────────────────
function ModTable({ mod, color }) {
  const m = Math.max(2, Math.min(12, mod))
  return (
    <Sec title={`Modulo ${m} — full remainder table`} sub="a mod b">
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              <th style={{ padding: '6px 10px', fontSize: 10, fontWeight: 700, color: 'var(--text-3)', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>a ÷ {m}</th>
              {Array.from({ length: m + 1 }, (_, i) => (
                <th key={i} style={{ padding: '6px 10px', fontSize: 11, fontWeight: 700, color: C => color, borderBottom: '1px solid var(--border)', textAlign: 'center', fontFamily: "'Space Grotesk',sans-serif" }}>{i}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }, (_, row) => {
              const a = (row + 1) * m - 1
              return (
                <tr key={row}>
                  <td style={{ padding: '6px 10px', fontSize: 11, fontWeight: 600, color: 'var(--text-2)', borderBottom: '0.5px solid var(--border)' }}>{a}</td>
                  {Array.from({ length: m + 1 }, (_, i) => {
                    const val = (a + i) % m
                    return (
                      <td key={i} style={{ padding: '6px 10px', textAlign: 'center', fontSize: 12, fontWeight: val === 0 ? 700 : 400, color: val === 0 ? color : 'var(--text-2)', borderBottom: '0.5px solid var(--border)', background: val === 0 ? color + '10' : 'transparent', fontFamily: "'Space Grotesk',sans-serif" }}>{val}</td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text-3)' }}>Highlighted cells show remainder = 0 (exact division)</div>
    </Sec>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────
export default function RemainderModuloCalculator({ meta, category }) {
  const C = category?.color || '#6366f1'
  const [dividend, setDividend] = useState(17)
  const [divisor, setDivisor] = useState(5)
  const [mode, setMode] = useState('basic') // basic, modular, congruence
  const [openFaq, setOpenFaq] = useState(null)
  const [openGloss, setOpenGloss] = useState(null)

  const a = Number(dividend) || 0
  const b = Number(divisor) || 1
  const bSafe = b === 0 ? 1 : b

  const quotient = Math.trunc(a / bSafe)
  const remainder = truncRemainder(a, bSafe)
  const modResult = trueModulo(a, bSafe)
  const flooredQ = Math.floor(a / bSafe)
  const flooredR = flooredRemainder(a, bSafe)

  const isDivisible = a % bSafe === 0
  const gcdAB = gcd(Math.abs(a), Math.abs(bSafe))

  // Congruence: is a ≡ b (mod m)?
  const congruent = remainder === 0

  const steps = [
    { label: 'Set up division', math: `${fmt(a)} ÷ ${fmt(bSafe)}`, note: 'dividend ÷ divisor' },
    { label: 'Find quotient (truncated)', math: `Quotient = ⌊${a} / ${bSafe}⌋ = ${quotient}`, note: 'Integer part of the division — truncate toward zero' },
    { label: 'Compute remainder', math: `Remainder = ${fmt(a)} − (${quotient} × ${fmt(bSafe)}) = ${fmt(a)} − ${fmt(quotient * bSafe)} = ${fmt(remainder)}` },
    { label: 'Verify', math: `Check: ${quotient} × ${fmt(bSafe)} + ${fmt(remainder)} = ${fmt(quotient * bSafe + remainder)} = ${fmt(a)} ✓`, note: 'Division algorithm: a = q × b + r, where 0 ≤ r < |b|' },
    { label: 'Result', math: `${fmt(a)} = ${quotient} × ${fmt(bSafe)} + ${fmt(remainder)}`, note: isDivisible ? `${fmt(bSafe)} divides ${fmt(a)} exactly — remainder is 0` : `${fmt(a)} is NOT divisible by ${fmt(bSafe)}` },
  ]

  const EXAMPLES = [
    { label: '🕐 Hours in 100 minutes', a: 100, b: 60, note: '1h 40min' },
    { label: '📅 Day of week (day 365)', a: 365, b: 7, note: 'same day as day 1' },
    { label: '🔢 Even/odd check', a: 17, b: 2, note: 'odd if remainder 1' },
    { label: '💻 Array wraparound', a: 23, b: 8, note: 'index in circular buffer' },
    { label: '🔐 Caesar cipher shift', a: 90, b: 26, note: '"Z" + 12 positions' },
    { label: '🎂 Age in months mod 12', a: 307, b: 12, note: 'months beyond last birthday' },
  ]

  const GLOSSARY = [
    { term: 'Remainder', def: 'The amount left over after dividing as many whole times as possible. For 17 ÷ 5: we can divide 3 complete times (15), with 2 left over — so remainder = 2.' },
    { term: 'Modulo (mod)', def: 'The operation that returns the remainder of division. 17 mod 5 = 2. In mathematics, modulo always returns a non-negative result, while some programming languages return a remainder with the sign of the dividend.' },
    { term: 'Quotient', def: 'The integer part of the result of division. 17 ÷ 5 = 3 remainder 2, so the quotient is 3. In truncated division, the quotient is rounded toward zero.' },
    { term: 'Congruence (≡)', def: 'a ≡ b (mod m) means a and b have the same remainder when divided by m. Equivalently, m divides (a − b). This is an equivalence relation used throughout number theory.' },
    { term: 'Modular arithmetic', def: 'Arithmetic performed within a fixed modulus — numbers "wrap around" like a clock. In mod 12 arithmetic, 11 + 3 = 2 (not 14). The set {0, 1, 2, ..., m−1} forms a complete residue system mod m.' },
    { term: 'Residue', def: 'The value of a mod m — the remainder when a is divided by m. Every integer has a unique residue in the range [0, m−1] for a given modulus m.' },
    { term: 'Division algorithm', def: 'For any integers a and b (b ≠ 0), there exist unique integers q and r such that a = qb + r and 0 ≤ r < |b|. This fundamental theorem guarantees that division always produces a well-defined quotient and remainder.' },
    { term: 'Modular inverse', def: 'The modular inverse of a mod m is x such that a×x ≡ 1 (mod m). It exists if and only if gcd(a, m) = 1. Used in RSA decryption and solving linear congruences.' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Formula card */}
      <div style={{ background: `linear-gradient(135deg,${C}12,${C}06)`, border: `1px solid ${C}30`, borderRadius: 14, padding: '16px 20px' }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: C, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Division Algorithm</div>
        <div style={{ fontSize: 18, fontWeight: 800, color: C, fontFamily: "'Space Grotesk',sans-serif", lineHeight: 1.3 }}>
          a = q × b + r     where  0 ≤ r {'<'} |b|
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 6, lineHeight: 1.65 }}>
          a = dividend · b = divisor · q = quotient · r = remainder · a mod b = r
        </div>
      </div>

      {/* Mode selector */}
      <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 14, padding: '14px 18px' }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 10 }}>Mode</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[
            { id: 'basic', label: 'Remainder & Quotient', desc: 'Standard division with remainder' },
            { id: 'modular', label: 'Modular Arithmetic', desc: 'Multiple definitions compared' },
            { id: 'congruence', label: 'Divisibility Check', desc: 'Is a divisible by b?' },
          ].map(m => (
            <button key={m.id} onClick={() => setMode(m.id)}
              style={{ flex: 1, padding: '9px 8px', borderRadius: 10, border: `1.5px solid ${mode === m.id ? C : 'var(--border-2)'}`, background: mode === m.id ? C + '12' : 'var(--bg-raised)', cursor: 'pointer', fontSize: 11, fontWeight: mode === m.id ? 700 : 500, color: mode === m.id ? C : 'var(--text)', textAlign: 'center' }}>
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <CalcShell
        left={<>
          <MathInput label="Dividend (a)" value={dividend} onChange={setDividend} color={C} hint="can be negative" allowNeg />
          <MathInput label="Divisor (b)" value={divisor} onChange={v => setDivisor(v === 0 ? 1 : v)} color={C} hint="cannot be 0" />

          {b === 0 && (
            <div style={{ padding: '10px 14px', borderRadius: 9, background: '#ef444410', border: '1px solid #ef444430', fontSize: 12, color: '#ef4444', marginBottom: 14 }}>
              ⚠ Division by zero is undefined
            </div>
          )}

          <div style={{ padding: '10px 13px', background: C + '08', borderRadius: 9, border: `1px solid ${C}20`, fontSize: 12, color: 'var(--text-2)', lineHeight: 1.65, marginBottom: 14 }}>
            💡 {isDivisible ? `${fmt(a)} is exactly divisible by ${fmt(bSafe)} — remainder is 0` : `${fmt(a)} divided by ${fmt(bSafe)}: ${quotient} times with ${fmt(remainder)} left over`}
          </div>

          <div style={{ borderTop: '0.5px solid var(--border)', paddingTop: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 10 }}>🎯 Real-world examples</div>
            {EXAMPLES.map((ex, i) => (
              <button key={i} onClick={() => { setDividend(ex.a); setDivisor(ex.b) }}
                style={{ display: 'block', width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border-2)', background: 'var(--bg-raised)', cursor: 'pointer', textAlign: 'left', marginBottom: 6 }}
                onMouseEnter={e => e.currentTarget.style.borderColor = C + '60'} onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-2)'}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{ex.label}</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{fmt(ex.a)} ÷ {fmt(ex.b)} · {ex.note}</div>
              </button>
            ))}
          </div>
        </>}

        right={<>
          {/* Main result card */}
          <div style={{ background: 'var(--bg-card)', border: `1.5px solid ${C}30`, borderRadius: 14, padding: '18px 20px', marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 12 }}>
              {fmt(a)} ÷ {fmt(bSafe)}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
              <div style={{ padding: '14px', borderRadius: 12, background: C + '12', border: `1.5px solid ${C}30`, textAlign: 'center' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: C, marginBottom: 6 }}>QUOTIENT</div>
                <div style={{ fontSize: 32, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>{quotient}</div>
                <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 3 }}>whole times</div>
              </div>
              <div style={{ padding: '14px', borderRadius: 12, background: isDivisible ? '#10b98112' : 'var(--bg-raised)', border: `1.5px solid ${isDivisible ? '#10b98140' : 'var(--border)'}`, textAlign: 'center' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: isDivisible ? '#10b981' : 'var(--text-3)', marginBottom: 6 }}>REMAINDER</div>
                <div style={{ fontSize: 32, fontWeight: 700, color: isDivisible ? '#10b981' : 'var(--text)', fontFamily: "'Space Grotesk',sans-serif" }}>{fmt(remainder)}</div>
                <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 3 }}>{isDivisible ? 'divides exactly ✓' : 'left over'}</div>
              </div>
            </div>

            {/* Equation display */}
            <div style={{ padding: '12px 16px', background: 'var(--bg-raised)', borderRadius: 10, border: '0.5px solid var(--border)', textAlign: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', fontFamily: "'Space Grotesk',sans-serif" }}>
                {fmt(a)} = {quotient} × {fmt(bSafe)} + {fmt(remainder)}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>
                {fmt(quotient * bSafe)} + {fmt(remainder)} = {fmt(a)} ✓
              </div>
            </div>
          </div>

          {/* Modular arithmetic section */}
          {mode === 'modular' && (
            <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 14, padding: '14px 18px', marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 12, fontFamily: "'Space Grotesk',sans-serif" }}>Three definitions of remainder</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { name: 'Truncated (JavaScript %)', formula: 'sign follows dividend', result: truncRemainder(a, bSafe), note: 'Most programming languages', color: C },
                  { name: 'Floored (Python %)', formula: 'sign follows divisor', result: flooredRemainder(a, bSafe), note: 'Python, Ruby', color: '#10b981' },
                  { name: 'Euclidean (always ≥ 0)', formula: 'always non-negative', result: euclideanRemainder(a, bSafe), note: 'Mathematical standard', color: '#f59e0b' },
                ].map((def, i) => (
                  <div key={i} style={{ padding: '10px 13px', borderRadius: 10, background: def.color + '08', border: `1px solid ${def.color}25`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: def.color, marginBottom: 2 }}>{def.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{def.formula} · {def.note}</div>
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: def.color, fontFamily: "'Space Grotesk',sans-serif" }}>{fmt(def.result)}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 10, padding: '10px 13px', background: 'var(--bg-raised)', borderRadius: 9, fontSize: 11.5, color: 'var(--text-2)', lineHeight: 1.65 }}>
                💡 The three definitions only differ when <strong>a or b is negative</strong>. For positive inputs they all give the same answer.
              </div>
            </div>
          )}

          {/* Divisibility check mode */}
          {mode === 'congruence' && (
            <div style={{ background: 'var(--bg-card)', border: `1px solid ${isDivisible ? '#10b98130' : C + '30'}`, borderRadius: 14, padding: '14px 18px', marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>Divisibility check: does {fmt(bSafe)} divide {fmt(a)}?</div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '14px', borderRadius: 12, background: isDivisible ? '#10b98110' : '#ef444410', border: `1.5px solid ${isDivisible ? '#10b98140' : '#ef444440'}`, marginBottom: 12 }}>
                <div style={{ fontSize: 32 }}>{isDivisible ? '✓' : '✗'}</div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: isDivisible ? '#10b981' : '#ef4444' }}>
                    {isDivisible ? `YES — ${fmt(bSafe)} divides ${fmt(a)} exactly` : `NO — remainder is ${fmt(remainder)}`}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 3 }}>
                    {isDivisible ? `${fmt(a)} = ${quotient} × ${fmt(bSafe)}` : `${fmt(a)} ≡ ${fmt(remainder)} (mod ${fmt(bSafe)})`}
                  </div>
                </div>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.65 }}>
                GCD({fmt(Math.abs(a))}, {fmt(Math.abs(bSafe))}) = {fmt(gcdAB)} · {' '}
                {gcdAB === Math.abs(bSafe) ? `Since GCD = ${fmt(bSafe)}, the division is exact` : `GCD ≠ ${fmt(bSafe)}, so ${fmt(bSafe)} does not divide ${fmt(a)} exactly`}
              </div>
            </div>
          )}

          <BreakdownTable title="Full summary" rows={[
            { label: 'Dividend (a)', value: fmt(a) },
            { label: 'Divisor (b)', value: fmt(bSafe) },
            { label: 'Quotient (q)', value: fmt(quotient), color: C },
            { label: 'Remainder (r)', value: fmt(remainder), bold: true, highlight: true, color: C },
            { label: 'Modulo (a mod b)', value: fmt(modResult) },
            { label: 'Verify: q×b + r', value: `${fmt(quotient * bSafe + remainder)} = ${fmt(a)} ✓` },
            { label: 'Divisible?', value: isDivisible ? 'YES ✓' : 'NO', color: isDivisible ? '#10b981' : '#ef4444' },
            { label: 'GCD(|a|, b)', value: fmt(gcdAB) },
          ]} />
          <AIHintCard hint={`${fmt(a)} ÷ ${fmt(bSafe)} = ${quotient} remainder ${fmt(remainder)}. ${fmt(a)} mod ${fmt(bSafe)} = ${fmt(modResult)}. ${isDivisible ? 'Exactly divisible.' : 'Not divisible.'}`} />
        </>}
      />

      <StepsCard steps={steps} color={C} />
      <ClockVisual dividend={a} divisor={bSafe} remainder={remainder} color={C} />

      {/* Modular arithmetic explainer */}
      <Sec title="Modular arithmetic — the mathematics of cycles" sub="Why mod is everywhere">
        <p style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.75, marginBottom: 14 }}>
          Modular arithmetic studies the remainder after division. Two numbers are congruent modulo m if they have the same remainder. Written <strong>a ≡ b (mod m)</strong>. This is the mathematics of repeating cycles — clocks, days of the week, circular buffers, cryptography.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { title: 'Time (mod 12 or 24)', ex: '14:00 = 2pm because 14 mod 12 = 2', detail: '10 hours after 7am = 5pm: (7+10) mod 12 = 5', color: C },
            { title: 'Days of the week (mod 7)', ex: 'Day 365 ≡ Day 1 (mod 7) for the same weekday', detail: '365 mod 7 = 1 → one day ahead of the start day', color: '#10b981' },
            { title: 'Even/Odd (mod 2)', ex: 'Any number mod 2 is 0 (even) or 1 (odd)', detail: '7 mod 2 = 1 → odd; 8 mod 2 = 0 → even', color: '#f59e0b' },
            { title: 'Cryptography (mod large prime)', ex: 'RSA: m^e mod n (public key encryption)', detail: 'All modular exponentiation — fast to compute, hard to reverse', color: '#ef4444' },
          ].map((r, i) => (
            <div key={i} style={{ padding: '12px 14px', borderRadius: 10, background: r.color + '08', border: `1px solid ${r.color}25` }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: r.color, marginBottom: 4 }}>{r.title}</div>
              <div style={{ fontSize: 12.5, color: 'var(--text-2)', marginBottom: 3 }}>{r.ex}</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{r.detail}</div>
            </div>
          ))}
        </div>
      </Sec>

      {/* Divisibility rules */}
      <Sec title="Divisibility rules — no calculator needed" sub="Quick mental checks">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { div: 2, rule: 'Last digit is even (0, 2, 4, 6, 8)', ex: '348 ÷ 2 ✓ (ends in 8)' },
            { div: 3, rule: 'Sum of digits is divisible by 3', ex: '273: 2+7+3=12, 12÷3=4 ✓' },
            { div: 4, rule: 'Last two digits form a number divisible by 4', ex: '1324: 24÷4=6 ✓' },
            { div: 5, rule: 'Last digit is 0 or 5', ex: '385 ÷ 5 ✓ (ends in 5)' },
            { div: 6, rule: 'Divisible by both 2 and 3', ex: '126: even ✓, 1+2+6=9 ÷3 ✓' },
            { div: 7, rule: 'Double last digit, subtract from rest; repeat', ex: '203: 20−6=14 ÷7 ✓' },
            { div: 8, rule: 'Last three digits divisible by 8', ex: '2,120: 120÷8=15 ✓' },
            { div: 9, rule: 'Sum of digits divisible by 9', ex: '729: 7+2+9=18 ÷9 ✓' },
            { div: 10, rule: 'Last digit is 0', ex: '4,570 ÷ 10 ✓' },
            { div: 11, rule: 'Alternate digit sum difference divisible by 11', ex: '121: 1−2+1=0 ✓' },
          ].map((r, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, padding: '9px 13px', borderRadius: 9, background: 'var(--bg-raised)', border: '0.5px solid var(--border)', alignItems: 'flex-start' }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: C + '15', border: `1px solid ${C}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: C, flexShrink: 0, fontFamily: "'Space Grotesk',sans-serif" }}>{r.div}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12.5, color: 'var(--text)', fontWeight: 500, marginBottom: 2 }}>{r.rule}</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)' }}>e.g. {r.ex}</div>
              </div>
            </div>
          ))}
        </div>
      </Sec>

      {/* Programming language comparison */}
      <Sec title="Modulo in programming languages" sub="Beware of negative numbers">
        <div style={{ marginBottom: 12, padding: '10px 14px', borderRadius: 9, background: '#f59e0b10', border: '1px solid #f59e0b25', fontSize: 12, color: 'var(--text-2)', lineHeight: 1.65 }}>
          ⚠ Languages differ on how they handle negative numbers in modulo. <strong>−7 mod 3</strong> is either −1, 2, or another value depending on the language.
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 420 }}>
            <thead>
              <tr style={{ background: 'var(--bg-raised)' }}>
                {['Language', 'Operator', '−7 mod 3', 'Sign follows', 'Notes'].map(h => (
                  <th key={h} style={{ padding: '8px 12px', fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textAlign: 'left', borderBottom: '1px solid var(--border)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { lang: 'JavaScript / Java / C', op: '%', result: '−1', sign: 'Dividend', note: 'Truncated division' },
                { lang: 'Python / Ruby', op: '%', result: '2', sign: 'Divisor', note: 'Floored division' },
                { lang: 'C++ (C++11)', op: '%', result: '−1', sign: 'Dividend', note: 'Truncated' },
                { lang: 'R', op: '%%', result: '2', sign: 'Divisor', note: 'Floored' },
                { lang: 'Mathematics', op: 'mod', result: '2', sign: 'Always ≥ 0', note: 'Euclidean' },
              ].map((r, i) => (
                <tr key={i} style={{ borderBottom: '0.5px solid var(--border)' }}
                  onMouseEnter={e => e.currentTarget.style.background = C + '06'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '8px 12px', fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{r.lang}</td>
                  <td style={{ padding: '8px 12px', fontSize: 13, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>{r.op}</td>
                  <td style={{ padding: '8px 12px', fontSize: 13, fontWeight: 700, color: r.result === '2' ? '#10b981' : '#ef4444', fontFamily: "'Space Grotesk',sans-serif" }}>{r.result}</td>
                  <td style={{ padding: '8px 12px', fontSize: 12, color: 'var(--text-2)' }}>{r.sign}</td>
                  <td style={{ padding: '8px 12px', fontSize: 11, color: 'var(--text-3)' }}>{r.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Sec>

      {/* Real-world uses */}
      <Sec title="Where remainder and modulo are used in real life">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { icon: '🔐', field: 'Cryptography', desc: 'RSA, Diffie-Hellman, and elliptic curve cryptography are built entirely on modular arithmetic. Every HTTPS connection you make uses modular exponentiation.', example: 'a^e mod n (RSA)', color: '#ef4444' },
            { icon: '💻', field: 'Programming', desc: 'Circular buffers, hash tables, even/odd checks, colour wrapping in graphics, and array index wrapping all use the modulo operator.', example: 'index = (index+1) % size', color: '#3b82f6' },
            { icon: '🔢', field: 'Checksums', desc: 'ISBN, credit card numbers (Luhn algorithm), and barcodes all use modular arithmetic to detect transcription errors.', example: 'Luhn check: sum mod 10 = 0', color: '#10b981' },
            { icon: '🎵', field: 'Music theory', desc: 'The 12 notes of the chromatic scale form a group under mod-12 arithmetic. Transposition and interval calculations use modulo 12.', example: 'C=0, A=9: A+5 = 14 mod 12 = 2 = D', color: C },
          ].map((rw, i) => (
            <div key={i} style={{ padding: '12px 13px', borderRadius: 11, background: rw.color + '08', border: `1px solid ${rw.color}25` }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 7 }}>
                <span style={{ fontSize: 20 }}>{rw.icon}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: rw.color }}>{rw.field}</span>
              </div>
              <p style={{ fontSize: 11.5, color: 'var(--text-2)', lineHeight: 1.65, margin: '0 0 7px' }}>{rw.desc}</p>
              <div style={{ fontSize: 10, fontWeight: 600, color: rw.color, padding: '3px 8px', background: rw.color + '15', borderRadius: 6, display: 'inline-block' }}>{rw.example}</div>
            </div>
          ))}
        </div>
      </Sec>

      {/* ⚠️ Common mistakes */}
      <Sec title="⚠️ Common mistakes">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            'Assuming "mod" always returns non-negative — in JavaScript, −7 % 3 = −1, not 2',
            'Confusing remainder with modulo — they differ only when negative numbers are involved',
            'Using % in code to check divisibility with negative inputs: −6 % 3 = 0 in all languages, but −5 % 2 = −1 in JS (still correctly non-zero)',
            'Forgetting that a mod b = 0 does NOT mean a = b — it means b divides a (e.g. 6 mod 3 = 0)',
          ].map((m, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, padding: '10px 14px', borderRadius: 9, background: '#fee2e210', border: '0.5px solid #ef444420' }}>
              <span style={{ fontSize: 14, flexShrink: 0, color: '#ef4444', fontWeight: 700 }}>✗</span>
              <span style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.6 }}>{m}</span>
            </div>
          ))}
        </div>
      </Sec>

      {/* Glossary */}
      <Sec title="Key terms explained" sub="Tap to expand">
        {GLOSSARY.map((g, i) => (
          <div key={i} style={{ borderBottom: '0.5px solid var(--border)' }}>
            <button onClick={() => setOpenGloss(openGloss === i ? null : i)} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 0', background: 'none', border: 'none', cursor: 'pointer', gap: 12, textAlign: 'left' }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: C, flexShrink: 0 }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif" }}>{g.term}</span>
              </div>
              <span style={{ fontSize: 16, color: C, flexShrink: 0, transform: openGloss === i ? 'rotate(45deg)' : 'none', transition: 'transform .2s' }}>+</span>
            </button>
            {openGloss === i && <p style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.7, margin: '0 0 12px 18px', fontFamily: "'DM Sans',sans-serif" }}>{g.def}</p>}
          </div>
        ))}
      </Sec>

      {/* FAQ */}
      <Sec title="Frequently asked questions">
        {[
          { q: 'What is the difference between remainder and modulo?', a: 'Mathematically, modulo always returns a non-negative value in [0, b−1]. The remainder from truncated division can be negative (sign follows the dividend). For positive inputs they are identical. The difference only appears with negative dividends or divisors: −7 mod 3 = 2 (mathematical), but in JavaScript −7 % 3 = −1.' },
          { q: 'Why does modular arithmetic matter for cryptography?', a: 'Modular exponentiation (a^e mod n) is easy to compute but hard to reverse — given the result, finding e is computationally infeasible for large n. This one-way property is the foundation of RSA, Diffie-Hellman key exchange, and elliptic-curve cryptography, which secures all modern internet communication.' },
          { q: 'How do I calculate the day of the week for any date?', a: 'Zeller\'s congruence and Tomohiko Sakamoto\'s algorithm both use modulo 7. The key insight: since 7 days form a cycle, any arithmetic involving days of the week should be done mod 7. E.g. to find what day is 100 days after a Monday: (1 + 100) mod 7 = 3 = Wednesday (if Sunday=0).' },
        ].map((f, i) => (
          <Acc key={i} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} color={C} />
        ))}
      </Sec>

    </div>
  )
}
