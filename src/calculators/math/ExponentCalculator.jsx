import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import FormulaCard from '../../components/calculator/FormulaCard'
import AIHintCard from '../../components/calculator/AIHintCard'

// BigInt power for exact large integer results
function bigPow(base, exp) {
  try {
    const b = BigInt(Math.round(base))
    const e = BigInt(Math.round(exp))
    if (e < 0n) return null
    let result = 1n
    let bb = b
    let ee = e
    while (ee > 0n) {
      if (ee % 2n === 1n) result *= bb
      bb *= bb
      ee /= 2n
    }
    return result.toString()
  } catch { return null }
}

function formatBig(str) {
  if (!str || str.length <= 20) return str
  return str.slice(0, 12) + '…' + str.slice(-6) + ` (${str.length} digits)`
}

function scientificNotation(base, exp) {
  try {
    const logVal = exp * Math.log10(Math.abs(base))
    const exponent = Math.floor(logVal)
    const mantissa = Math.pow(10, logVal - exponent)
    return `${mantissa.toFixed(6)} × 10^${exponent}`
  } catch { return '—' }
}

const RULES = [
  { rule: 'Product rule', formula: 'aⁿ × aᵐ = aⁿ⁺ᵐ', example: '2³ × 2⁴ = 2⁷ = 128' },
  { rule: 'Quotient rule', formula: 'aⁿ / aᵐ = aⁿ⁻ᵐ', example: '3⁵ / 3² = 3³ = 27' },
  { rule: 'Power of power', formula: '(aⁿ)ᵐ = aⁿˣᵐ', example: '(2³)⁴ = 2¹² = 4096' },
  { rule: 'Zero exponent', formula: 'a⁰ = 1', example: '99⁰ = 1' },
  { rule: 'Negative exponent', formula: 'a⁻ⁿ = 1/aⁿ', example: '2⁻³ = 1/8 = 0.125' },
  { rule: 'Fractional exponent', formula: 'a^(1/n) = ⁿ√a', example: '8^(1/3) = ∛8 = 2' },
]

const FAMOUS = [
  { expr: '2^10', base: 2, exp: 10, note: '1 KB (kibibyte)' },
  { expr: '2^32', base: 2, exp: 32, note: '32-bit int max+1' },
  { expr: '2^64', base: 2, exp: 64, note: '64-bit max+1' },
  { expr: '2^100', base: 2, exp: 100, note: 'Large crypto number' },
  { expr: '10^9', base: 10, exp: 9, note: '1 Billion' },
  { expr: '10^100', base: 10, exp: 100, note: 'Googol' },
]

const FAQ = [
  { q: 'Why use scientific notation for large exponents?', a: '2^100 = 1,267,650,600,228,229,401,496,703,205,376 — a 31-digit number. Scientific notation 1.267650... × 10^30 is more readable. This calculator shows the full exact integer for integer bases and exponents (up to thousands of digits), plus scientific notation for context.' },
  { q: 'What is the difference between x^n and x^(1/n)?', a: 'x^n raises x to a whole number power. x^(1/n) is the nth root — the inverse. 8^(1/3) = ∛8 = 2 because 2³ = 8. Fractional exponents like x^(2/3) mean (∛x)² — take the root first, then the power.' },
  { q: 'What does a negative exponent mean?', a: 'a^(-n) = 1 / a^n. It flips the fraction. 2^(-3) = 1/2³ = 1/8 = 0.125. Negative exponents never produce negative results for positive bases — they just make the number smaller.' },
  { q: 'What is 0^0?', a: '0^0 is mathematically undefined or sometimes defined as 1 by convention depending on context. In combinatorics and limits, 0^0 = 1 is used. In analysis, it is left undefined because the limit depends on how 0 is approached.' },
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

export default function ExponentCalculator({ meta, category }) {
  const C = category?.color || '#3b82f6'
  const [base, setBase] = useState(2)
  const [exp, setExp] = useState(10)
  const [openFaq, setOpenFaq] = useState(null)

  const isIntegerCalc = Number.isInteger(base) && Number.isInteger(exp) && exp >= 0 && exp <= 10000 && base >= -1000 && base <= 1000
  const floatResult = Math.pow(base, exp)
  const bigResult = isIntegerCalc ? bigPow(base, exp) : null
  const sciNotation = scientificNotation(base, exp)
  const numDigits = bigResult ? bigResult.replace('-', '').length : null
  const isVeryLarge = bigResult && bigResult.length > 25

  const hint = isIntegerCalc && bigResult
    ? `${base}^${exp} = ${formatBig(bigResult)} (${numDigits} digits). Scientific: ${sciNotation}`
    : `${base}^${exp} ≈ ${floatResult.toExponential(6)}`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Banner */}
      <div style={{ background: `linear-gradient(135deg,${C}15,${C}06)`, border: `1px solid ${C}30`, borderRadius: 14, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>Exponent Calculator</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>{base}<sup style={{ fontSize: 14 }}>{exp}</sup> = ?</div>
        </div>
        <div style={{ textAlign: 'right', maxWidth: 340 }}>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 3 }}>Scientific notation</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif", wordBreak: 'break-all' }}>{sciNotation}</div>
          {numDigits && <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{numDigits} digits</div>}
        </div>
      </div>

      <CalcShell
        left={<>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 6 }}>Base (a)</label>
            <input type="number" value={base} onChange={e => setBase(+e.target.value)}
              style={{ width: '100%', height: 44, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 14px', fontSize: 20, fontWeight: 700, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', fontFamily: "'Space Grotesk',sans-serif", boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 6 }}>Exponent (n)</label>
            <input type="number" value={exp} onChange={e => setExp(+e.target.value)}
              style={{ width: '100%', height: 44, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 14px', fontSize: 20, fontWeight: 700, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', fontFamily: "'Space Grotesk',sans-serif", boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 8 }}>Quick examples</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}>
              {FAMOUS.map((f, i) => (
                <button key={i} onClick={() => { setBase(f.base); setExp(f.exp) }}
                  style={{ padding: '7px 10px', borderRadius: 8, border: `1px solid ${base === f.base && exp === f.exp ? C : 'var(--border-2)'}`, background: base === f.base && exp === f.exp ? C + '12' : 'var(--bg-raised)', cursor: 'pointer', textAlign: 'left' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: base === f.base && exp === f.exp ? C : 'var(--text)', fontFamily: "'Space Grotesk',sans-serif" }}>{f.expr}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-3)' }}>{f.note}</div>
                </button>
              ))}
            </div>
          </div>
        </>}

        right={<>
          {/* Full exact result box */}
          <div style={{ background: 'var(--bg-card)', border: `1.5px solid ${C}40`, borderRadius: 14, padding: '16px 18px', marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 10 }}>
              {base}^{exp} = 
            </div>
            {bigResult ? (
              <>
                <div style={{
                  fontSize: isVeryLarge ? 12 : bigResult.length > 15 ? 14 : 20,
                  fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif",
                  wordBreak: 'break-all', lineHeight: 1.6,
                  background: 'var(--bg-raised)', borderRadius: 8, padding: '12px 14px',
                  border: '0.5px solid var(--border)', maxHeight: 200, overflowY: 'auto',
                  fontVariantNumeric: 'tabular-nums'
                }}>
                  {bigResult}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11, color: 'var(--text-3)' }}>
                  <span>Exact integer</span>
                  <span>{numDigits} digits</span>
                </div>
              </>
            ) : (
              <div style={{ fontSize: 22, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>
                {isFinite(floatResult) ? floatResult.toExponential(8) : floatResult > 0 ? '∞' : floatResult < 0 ? '-∞' : 'NaN'}
              </div>
            )}
          </div>

          <BreakdownTable title="All representations" rows={[
            { label: 'Scientific notation', value: sciNotation, bold: true, highlight: true, color: C },
            { label: 'Float (64-bit)', value: floatResult.toExponential(10) },
            { label: 'Number of digits', value: numDigits ? `${numDigits}` : 'N/A' },
            { label: 'log₁₀(result)', value: isFinite(floatResult) && floatResult > 0 ? (exp * Math.log10(Math.abs(base))).toFixed(6) : '—' },
            { label: 'ln(result)', value: isFinite(floatResult) && floatResult > 0 ? (exp * Math.log(Math.abs(base))).toFixed(6) : '—' },
          ]} />
          <AIHintCard hint={hint} />
        </>}
      />

      {/* Exponent rules */}
      <Sec title="Exponent rules" sub="Essential laws of exponents">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {RULES.map((r, i) => (
            <div key={i} style={{ padding: '11px 13px', borderRadius: 10, background: 'var(--bg-raised)', border: '0.5px solid var(--border)' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C, marginBottom: 4 }}>{r.rule}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', fontFamily: "'Space Grotesk',sans-serif", marginBottom: 4 }}>{r.formula}</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)' }}>e.g. {r.example}</div>
            </div>
          ))}
        </div>
      </Sec>

      {/* Powers of 2 table */}
      <Sec title="Powers of 2 reference" sub="Common in computing and cryptography">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
          {[0,1,2,3,4,5,6,7,8,10,12,16,20,24,32,64].map(n => {
            const v = bigPow(2, n)
            return (
              <div key={n} onClick={() => { setBase(2); setExp(n) }}
                style={{ padding: '8px 10px', borderRadius: 8, background: base === 2 && exp === n ? C + '12' : 'var(--bg-raised)', border: `0.5px solid ${base === 2 && exp === n ? C : 'var(--border)'}`, cursor: 'pointer', textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: 'var(--text-3)' }}>2^{n}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>{v && v.length <= 12 ? v : formatBig(v)}</div>
              </div>
            )
          })}
        </div>
      </Sec>

      <FormulaCard
        formula={'aⁿ = a × a × ... × a (n times)\naⁿ × aᵐ = aⁿ⁺ᵐ\n(aⁿ)ᵐ = aⁿˣᵐ\na⁻ⁿ = 1/aⁿ\na^(1/n) = ⁿ√a'}
        variables={[
          { symbol: 'a', meaning: 'Base — the number being raised' },
          { symbol: 'n', meaning: 'Exponent — how many times to multiply' },
          { symbol: 'aⁿ', meaning: 'Power — the result' },
        ]}
        explanation="Exponentiation is repeated multiplication. The full exact integer is computed using BigInt arithmetic for integer bases and exponents — no floating-point rounding. For very large results, scientific notation shows the approximate size while the full digit string is scrollable above."
      />

      <Sec title="Frequently asked questions">
        {FAQ.map((f, i) => <Acc key={i} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} color={C} />)}
      </Sec>
    </div>
  )
}
