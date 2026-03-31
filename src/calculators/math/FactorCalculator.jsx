import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'

// ─── helpers ──────────────────────────────────────────────────
const isPrime = n => {
  if (n < 2) return false
  if (n === 2) return true
  if (n % 2 === 0) return false
  for (let i = 3; i <= Math.sqrt(n); i += 2) if (n % i === 0) return false
  return true
}

const getAllFactors = n => {
  const factors = []
  for (let i = 1; i <= Math.sqrt(n); i++) {
    if (n % i === 0) {
      factors.push(i)
      if (i !== n / i) factors.push(n / i)
    }
  }
  return factors.sort((a, b) => a - b)
}

const primeFactorization = n => {
  const result = {}
  let d = 2
  let temp = n
  while (d * d <= temp) {
    while (temp % d === 0) {
      result[d] = (result[d] || 0) + 1
      temp = Math.floor(temp / d)
    }
    d++
  }
  if (temp > 1) result[temp] = (result[temp] || 0) + 1
  return result
}

const gcd = (a, b) => { while (b) { [a, b] = [b, a % b] } return a }
const lcm = (a, b) => Math.abs(a * b) / gcd(a, b)
const sumOfFactors = factors => factors.reduce((s, f) => s + f, 0)
const productOfFactors = (factors, n) => Math.pow(n, factors.length / 2)

const fmt = n => isNaN(n) || !isFinite(n) ? '—' : n.toLocaleString()

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

function MathInput({ label, value, onChange, color, hint }) {
  const [f, setF] = useState(false)
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif" }}>{label}</label>
        {hint && <span style={{ fontSize: 10, color: 'var(--text-3)' }}>{hint}</span>}
      </div>
      <div style={{ display: 'flex', height: 44, border: `1.5px solid ${f ? color : 'var(--border-2)'}`, borderRadius: 9, overflow: 'hidden', background: 'var(--bg-card)', transition: 'border-color .15s' }}>
        <input
          type="number" value={value} min={1} max={999999}
          onChange={e => onChange(e.target.value === '' ? '' : Number(e.target.value))}
          onFocus={() => setF(true)} onBlur={() => setF(false)}
          style={{ flex: 1, border: 'none', background: 'transparent', padding: '0 14px', fontSize: 22, fontWeight: 700, color: 'var(--text)', outline: 'none', fontFamily: "'Space Grotesk',sans-serif" }}
        />
      </div>
    </div>
  )
}

// ─── Factor pair visual ───────────────────────────────────────
function FactorPairsVisual({ factors, n, color }) {
  const pairs = []
  for (let i = 0; i < Math.floor(factors.length / 2); i++) {
    pairs.push([factors[i], factors[factors.length - 1 - i]])
  }
  if (factors.length % 2 === 1) {
    const mid = factors[Math.floor(factors.length / 2)]
    pairs.push([mid, mid])
  }

  return (
    <Sec title="Factor pairs" sub={`${pairs.length} pair${pairs.length !== 1 ? 's' : ''} × to give ${fmt(n)}`}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {pairs.map(([a, b], i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 9, background: 'var(--bg-raised)', border: '0.5px solid var(--border)' }}>
            <div style={{ display: 'flex', gap: 8, flex: 1, alignItems: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: isPrime(a) ? color : 'var(--text)', fontFamily: "'Space Grotesk',sans-serif", minWidth: 56, textAlign: 'right' }}>{fmt(a)}</span>
              <span style={{ color: 'var(--text-3)', fontSize: 13 }}>×</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: isPrime(b) ? color : 'var(--text)', fontFamily: "'Space Grotesk',sans-serif" }}>{fmt(b)}</span>
              <span style={{ color: 'var(--text-3)', fontSize: 13 }}>=</span>
              <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{fmt(n)}</span>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {isPrime(a) && <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 10, background: color + '15', color, fontWeight: 700 }}>P</span>}
              {isPrime(b) && a !== b && <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 10, background: color + '15', color, fontWeight: 700 }}>P</span>}
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 10, fontSize: 11, color: 'var(--text-3)' }}>P = prime factor</div>
    </Sec>
  )
}

// ─── Factor tree visual ───────────────────────────────────────
function FactorTree({ n, pFactorMap, color }) {
  const entries = Object.entries(pFactorMap)
  if (entries.length === 1 && entries[0][1] === 1) return null // n is prime

  return (
    <Sec title="Prime factor tree" sub="Step-by-step breakdown">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)', fontFamily: "'Space Grotesk',sans-serif" }}>{fmt(n)}</div>
        <div style={{ width: 1, height: 20, background: 'var(--border)' }} />
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
          {entries.map(([p, e], i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              {Array.from({ length: e }).map((_, j) => (
                <div key={j} style={{ width: 42, height: 42, borderRadius: 10, background: color + '18', border: `2px solid ${color}60`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color, fontFamily: "'Space Grotesk',sans-serif" }}>
                  {p}
                </div>
              ))}
              {e > 1 && <div style={{ fontSize: 10, color: 'var(--text-3)' }}>×{e}</div>}
            </div>
          ))}
        </div>
        <div style={{ padding: '10px 18px', borderRadius: 10, background: color + '10', border: `1px solid ${color}30`, fontSize: 14, fontWeight: 700, color, fontFamily: "'Space Grotesk',sans-serif" }}>
          {fmt(n)} = {entries.map(([p, e]) => e > 1 ? `${p}^${e}` : p).join(' × ')}
        </div>
      </div>
    </Sec>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────
export default function FactorCalculator({ meta, category }) {
  const C = category?.color || '#6366f1'
  const [num, setNum] = useState(360)
  const [num2, setNum2] = useState(480)
  const [showSecond, setShowSecond] = useState(false)
  const [openFaq, setOpenFaq] = useState(null)
  const [openGloss, setOpenGloss] = useState(null)

  const n = Math.max(1, Math.min(999999, Math.round(Number(num) || 1)))
  const n2 = Math.max(1, Math.min(999999, Math.round(Number(num2) || 1)))

  const factors = getAllFactors(n)
  const pFactorMap = primeFactorization(n)
  const sum = sumOfFactors(factors)
  const sumProper = sum - n
  const isPerf = sumProper === n
  const isAbund = sumProper > n
  const isDefic = sumProper < n
  const primeFactors = factors.filter(isPrime)
  const compositeFactors = factors.filter(f => f > 1 && !isPrime(f) && f !== n)

  const pFactorMap2 = showSecond ? primeFactorization(n2) : {}
  const gcdVal = showSecond ? gcd(n, n2) : null
  const lcmVal = showSecond ? lcm(n, n2) : null
  const commonFactors = showSecond ? getAllFactors(n).filter(f => n2 % f === 0) : []

  // count formula: multiply (e+1) for each prime power
  const countFormula = Object.entries(pFactorMap).map(([p, e]) => e > 1 ? `(${e}+1)` : '(1+1)').join(' × ')
  const countResult = Object.values(pFactorMap).reduce((prod, e) => prod * (e + 1), 1)

  const steps = [
    { label: 'Start with n', math: `n = ${fmt(n)}` },
    { label: 'Find smallest prime factor', math: `${fmt(n)} ÷ ${Object.keys(pFactorMap)[0]} = ${fmt(n / Number(Object.keys(pFactorMap)[0]))}`, note: 'Always start dividing by 2, then 3, 5, 7...' },
    { label: 'Continue dividing', math: `Prime factorisation: ${fmt(n)} = ${Object.entries(pFactorMap).map(([p, e]) => e > 1 ? `${p}^${e}` : p).join(' × ')}` },
    { label: 'Count factors formula', math: `Number of factors = ${countFormula} = ${countResult}`, note: 'For n = p₁^a × p₂^b × …, count = (a+1)(b+1)…' },
    { label: 'List all factors', math: `Factors of ${fmt(n)}: ${factors.slice(0, 10).join(', ')}${factors.length > 10 ? `, …(${factors.length} total)` : ''}` },
    { label: 'Result', math: `${fmt(n)} has ${factors.length} factors. Sum of factors = ${fmt(sum)}`, note: isPerf ? 'This is a perfect number! Sum of proper divisors = n' : isAbund ? 'Abundant: sum of proper divisors > n' : 'Deficient: sum of proper divisors < n' },
  ]

  const EXAMPLES = [
    { n: 12, label: '12 — highly composite' },
    { n: 24, label: '24 — 8 factors' },
    { n: 360, label: '360 — 24 factors' },
    { n: 496, label: '496 — perfect number' },
    { n: 720, label: '720 — 30 factors' },
    { n: 1024, label: '1024 — power of 2' },
  ]

  const GLOSSARY = [
    { term: 'Factor (divisor)', def: 'A factor of n is any positive integer that divides n exactly, leaving no remainder. Every number has at least two factors: 1 and itself.' },
    { term: 'Prime factorisation', def: 'Writing a number as a product of its prime factors. E.g. 360 = 2³ × 3² × 5. The Fundamental Theorem of Arithmetic guarantees this representation is unique.' },
    { term: 'Proper divisors', def: 'All factors of n excluding n itself. For 12: proper divisors are 1, 2, 3, 4, 6 (not 12). Used to classify numbers as perfect, abundant, or deficient.' },
    { term: 'Perfect number', def: 'A number equal to the sum of its proper divisors. 6 = 1+2+3. 28 = 1+2+4+7+14. Only 51 perfect numbers are known; all are even.' },
    { term: 'Abundant number', def: 'A number whose proper divisors sum to more than the number itself. 12 is abundant: 1+2+3+4+6 = 16 > 12.' },
    { term: 'Deficient number', def: 'A number whose proper divisors sum to less than the number. Most numbers are deficient. All primes are deficient (proper divisors sum to 1).' },
    { term: 'GCD (Greatest Common Divisor)', def: 'The largest number that divides both a and b. Also called HCF (Highest Common Factor). gcd(12, 8) = 4. Used to simplify fractions.' },
    { term: 'LCM (Least Common Multiple)', def: 'The smallest number divisible by both a and b. lcm(4, 6) = 12. Used to add fractions with different denominators.' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Formula card */}
      <div style={{ background: `linear-gradient(135deg,${C}12,${C}06)`, border: `1px solid ${C}30`, borderRadius: 14, padding: '16px 20px' }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: C, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Factor counting formula</div>
        <div style={{ fontSize: 18, fontWeight: 800, color: C, fontFamily: "'Space Grotesk',sans-serif", lineHeight: 1.3 }}>
          If n = p₁^a × p₂^b × … then τ(n) = (a+1)(b+1)…
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 6, lineHeight: 1.65 }}>
          τ(n) = total number of factors · GCD(a,b) × LCM(a,b) = a × b
        </div>
      </div>

      <CalcShell
        left={<>
          <MathInput label="Enter a number" value={num} onChange={v => setNum(Math.max(1, Math.min(999999, Math.round(Number(v) || 1))))} color={C} hint="1 – 999,999" />

          {/* Toggle second number for GCD/LCM */}
          <button onClick={() => setShowSecond(s => !s)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px', borderRadius: 9, border: `1.5px solid ${showSecond ? C : 'var(--border-2)'}`, background: showSecond ? C + '10' : 'var(--bg-raised)', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: showSecond ? C : 'var(--text)', marginBottom: 14, width: '100%' }}>
            <span>{showSecond ? '✓' : '+'}</span>
            <span>{showSecond ? 'Compare two numbers (GCD/LCM mode)' : 'Add second number to find GCD & LCM'}</span>
          </button>

          {showSecond && (
            <MathInput label="Second number" value={num2} onChange={v => setNum2(Math.max(1, Math.min(999999, Math.round(Number(v) || 1))))} color={C} hint="1 – 999,999" />
          )}

          {/* Quick examples */}
          <div style={{ borderTop: '0.5px solid var(--border)', paddingTop: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 10 }}>⚡ Try these</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {EXAMPLES.map((ex, i) => (
                <button key={i} onClick={() => setNum(ex.n)}
                  style={{ padding: '9px 10px', borderRadius: 9, border: `1px solid ${num === ex.n ? C : 'var(--border-2)'}`, background: num === ex.n ? C + '10' : 'var(--bg-raised)', cursor: 'pointer', textAlign: 'left' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = C + '60'} onMouseLeave={e => e.currentTarget.style.borderColor = num === ex.n ? C : 'var(--border-2)'}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: num === ex.n ? C : 'var(--text)', fontFamily: "'Space Grotesk',sans-serif" }}>{fmt(ex.n)}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2 }}>{ex.label}</div>
                </button>
              ))}
            </div>
          </div>
        </>}

        right={<>
          {/* Main result */}
          <div style={{ background: 'var(--bg-card)', border: `1.5px solid ${C}30`, borderRadius: 14, padding: '18px 20px', marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 8 }}>Factors of {fmt(n)}</div>
            <div style={{ fontSize: 52, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif", lineHeight: 1 }}>{factors.length}</div>
            <div style={{ fontSize: 14, color: 'var(--text-3)', marginTop: 4, marginBottom: 12 }}>total factors</div>
            <div style={{ padding: '10px 13px', background: C + '08', borderRadius: 9, border: `1px solid ${C}20`, fontSize: 12, color: 'var(--text-2)', lineHeight: 1.65 }}>
              💡 {isPerf ? `${fmt(n)} is a PERFECT NUMBER — its proper divisors sum to exactly ${fmt(n)}!` : isAbund ? `${fmt(n)} is ABUNDANT — proper divisors sum to ${fmt(sumProper)}, which exceeds ${fmt(n)}` : `${fmt(n)} is DEFICIENT — proper divisors sum to only ${fmt(sumProper)}`}
            </div>
          </div>

          {/* Factor list */}
          <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 14, padding: '14px 18px', marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 10, fontFamily: "'Space Grotesk',sans-serif" }}>All factors</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
              {factors.map((f, i) => (
                <div key={i} style={{ padding: '5px 12px', borderRadius: 8, background: isPrime(f) ? C + '15' : f === 1 || f === n ? 'var(--bg-raised)' : 'var(--bg-raised)', border: `1px solid ${isPrime(f) ? C + '50' : 'var(--border)'}`, fontSize: 12, fontWeight: isPrime(f) ? 700 : 500, color: isPrime(f) ? C : 'var(--text)', fontFamily: "'Space Grotesk',sans-serif" }}>
                  {fmt(f)}
                </div>
              ))}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-3)' }}>
              {primeFactors.length} prime · {compositeFactors.length} composite · highlighted in {C.includes('#') ? 'colour' : 'colour'} = prime
            </div>
          </div>

          {/* Prime factorisation */}
          <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 14, padding: '14px 18px', marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 10, fontFamily: "'Space Grotesk',sans-serif" }}>Prime factorisation</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
              {Object.entries(pFactorMap).map(([p, e], i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  {i > 0 && <span style={{ color: 'var(--text-3)', fontSize: 16 }}>×</span>}
                  <div style={{ padding: '8px 14px', borderRadius: 9, background: C + '15', border: `1.5px solid ${C}40`, fontSize: 18, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>
                    {p}{e > 1 ? <sup style={{ fontSize: 12 }}>{e}</sup> : ''}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-2)' }}>
              {fmt(n)} = {Object.entries(pFactorMap).map(([p, e]) => e > 1 ? `${p}^${e}` : p).join(' × ')}
            </div>
            <div style={{ marginTop: 6, fontSize: 11.5, color: 'var(--text-3)' }}>
              Number of factors = {countFormula} = <strong style={{ color: C }}>{countResult}</strong>
            </div>
          </div>

          {/* GCD/LCM section */}
          {showSecond && (
            <div style={{ background: 'var(--bg-card)', border: `1px solid ${C}30`, borderRadius: 14, padding: '14px 18px', marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 10, fontFamily: "'Space Grotesk',sans-serif" }}>GCD & LCM of {fmt(n)} and {fmt(n2)}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                <div style={{ padding: '12px', borderRadius: 10, background: C + '12', border: `1.5px solid ${C}40`, textAlign: 'center' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: C, marginBottom: 4 }}>GCD (HCF)</div>
                  <div style={{ fontSize: 26, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>{fmt(gcdVal)}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2 }}>largest common factor</div>
                </div>
                <div style={{ padding: '12px', borderRadius: 10, background: '#10b98112', border: '1.5px solid #10b98140', textAlign: 'center' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#10b981', marginBottom: 4 }}>LCM</div>
                  <div style={{ fontSize: 26, fontWeight: 700, color: '#10b981', fontFamily: "'Space Grotesk',sans-serif" }}>{fmt(lcmVal)}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2 }}>smallest common multiple</div>
                </div>
              </div>
              {commonFactors.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', marginBottom: 6 }}>Common factors ({commonFactors.length}):</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {commonFactors.map((f, i) => (
                      <div key={i} style={{ padding: '4px 10px', borderRadius: 7, background: C + '12', border: `1px solid ${C}30`, fontSize: 12, fontWeight: 600, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>{fmt(f)}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <BreakdownTable title="Summary" rows={[
            { label: 'Number', value: fmt(n) },
            { label: 'Total factors', value: String(factors.length), bold: true, highlight: true, color: C },
            { label: 'Prime factorisation', value: Object.entries(pFactorMap).map(([p, e]) => e > 1 ? `${p}^${e}` : p).join('×') },
            { label: 'Sum of all factors', value: fmt(sum) },
            { label: 'Sum of proper divisors', value: fmt(sumProper) },
            { label: 'Number type', value: isPerf ? 'Perfect ⭐' : isAbund ? 'Abundant' : 'Deficient' },
            ...(showSecond ? [{ label: 'GCD', value: fmt(gcdVal) }, { label: 'LCM', value: fmt(lcmVal) }] : []),
          ]} />
          <AIHintCard hint={`${fmt(n)} has ${factors.length} factors: ${factors.slice(0, 8).join(', ')}${factors.length > 8 ? '…' : ''}. Prime factorisation: ${Object.entries(pFactorMap).map(([p, e]) => e > 1 ? `${p}^${e}` : p).join('×')}`} />
        </>}
      />

      <StepsCard steps={steps} color={C} />
      <FactorPairsVisual factors={factors} n={n} color={C} />
      <FactorTree n={n} pFactorMap={pFactorMap} color={C} />

      {/* Highly composite numbers */}
      <Sec title="Highly composite numbers" sub="Most factors for their size">
        <p style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.7, marginBottom: 14 }}>
          A highly composite number has more factors than any smaller positive integer. They are the most divisible numbers — which is why 12 inches = 1 foot, 24 hours in a day, and 360 degrees in a circle.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {[
            { n: 12, f: 6 }, { n: 24, f: 8 }, { n: 36, f: 9 }, { n: 48, f: 10 },
            { n: 60, f: 12 }, { n: 120, f: 16 }, { n: 360, f: 24 }, { n: 720, f: 30 },
          ].map((hc, i) => (
            <button key={i} onClick={() => setNum(hc.n)}
              style={{ padding: '10px', borderRadius: 10, border: `1px solid ${num === hc.n ? C : 'var(--border-2)'}`, background: num === hc.n ? C + '12' : 'var(--bg-raised)', cursor: 'pointer', textAlign: 'center' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = C + '60'} onMouseLeave={e => e.currentTarget.style.borderColor = num === hc.n ? C : 'var(--border-2)'}>
              <div style={{ fontSize: 15, fontWeight: 700, color: num === hc.n ? C : 'var(--text)', fontFamily: "'Space Grotesk',sans-serif" }}>{hc.n}</div>
              <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 3 }}>{hc.f} factors</div>
            </button>
          ))}
        </div>
      </Sec>

      {/* Perfect, Abundant, Deficient */}
      <Sec title="Perfect, abundant and deficient numbers" sub="Classified by their factor sums">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { type: 'Perfect', condition: 'σ(n) − n = n', desc: 'The sum of proper divisors equals the number itself. Only 51 perfect numbers are known, all even. The next after 8128 is 33,550,336.', examples: [6, 28, 496, 8128], color: C },
            { type: 'Abundant', condition: 'σ(n) − n > n', desc: 'Proper divisors sum to MORE than the number. About 25% of all numbers are abundant. The smallest abundant odd number is 945.', examples: [12, 18, 20, 24], color: '#10b981' },
            { type: 'Deficient', condition: 'σ(n) − n < n', desc: 'Proper divisors sum to LESS than the number. All primes are deficient (only proper divisor is 1). Most numbers are deficient.', examples: [1, 2, 3, 4], color: '#f59e0b' },
          ].map((t, i) => (
            <div key={i} style={{ padding: '12px 14px', borderRadius: 11, background: t.color + '08', border: `1px solid ${t.color}25` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: t.color }}>{t.type}</span>
                <span style={{ fontSize: 12, fontFamily: "'Space Grotesk',sans-serif", color: t.color, background: t.color + '15', padding: '2px 8px', borderRadius: 6 }}>{t.condition}</span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.6, margin: '0 0 8px' }}>{t.desc}</p>
              <div style={{ display: 'flex', gap: 6 }}>
                {t.examples.map((ex, j) => (
                  <button key={j} onClick={() => setNum(ex)}
                    style={{ padding: '4px 10px', borderRadius: 7, background: t.color + '15', border: `1px solid ${t.color}30`, fontSize: 12, fontWeight: 600, color: t.color, cursor: 'pointer' }}>{ex}</button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Sec>

      {/* Real world uses */}
      <Sec title="Where factors are used in real life">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { icon: '🔢', field: 'Fractions & Simplifying', desc: 'To simplify 12/18, find GCD(12, 18) = 6, then divide: 12/18 = 2/3. Factors are the foundation of fraction arithmetic.', example: 'GCD(12,18) = 6 → 12/18 = 2/3', color: '#3b82f6' },
            { icon: '📐', field: 'Geometry & Tiling', desc: 'To tile an m×n rectangle with 1×1 or larger squares, you need factors. Arranging 24 students into equal rows: use factors of 24.', example: '24 students: 1×24, 2×12, 3×8, 4×6', color: '#f59e0b' },
            { icon: '💻', field: 'Cryptography (RSA)', desc: 'RSA security relies on the difficulty of finding factors of very large numbers. Multiplying two 1024-bit primes is easy; factoring the result is believed computationally infeasible.', example: 'Factor a 2048-bit number → RSA broken', color: '#ef4444' },
            { icon: '🕐', field: 'Calendars & Clocks', desc: '360 degrees in a circle (24 divisors), 60 minutes in an hour (12 divisors), 24 hours in a day — these highly composite numbers allow many even subdivisions.', example: '360 has 24 factors → many angles', color: C },
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
            'Missing factor pairs — always check both sides: if 3 divides 12, then so does 4',
            'Forgetting 1 and n are always factors — every number ≥ 1 is divisible by 1 and itself',
            'Confusing factors with multiples — 3 is a factor of 12; 24 is a multiple of 12',
            'Using GCD where LCM is needed — for "what is the smallest container to hold 4 and 6 litre bottles?", use LCM(4,6)=12',
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
          { q: 'How do I find all factors quickly?', a: 'Only check divisors up to √n. For each divisor d that works, n/d is automatically the paired factor. This reduces the work from n checks to √n checks — for 1,000,000 you only need to check up to 1,000.' },
          { q: 'Why does the factor counting formula work?', a: 'If n = p₁^a × p₂^b, each factor is formed by choosing an exponent for p₁ (0 to a, giving a+1 choices) and for p₂ (0 to b, giving b+1 choices). Multiplying the choices gives (a+1)(b+1) total factors. For 12 = 2²×3¹: (2+1)(1+1) = 6 factors: 1, 2, 3, 4, 6, 12.' },
          { q: 'Are there infinitely many perfect numbers?', a: 'Unknown. Every even perfect number corresponds to a Mersenne prime via the formula 2^(p−1) × (2^p − 1). Since we do not know if there are infinitely many Mersenne primes, we cannot answer this. It is also unknown whether any odd perfect numbers exist, though if they do they must be astronomically large.' },
          { q: 'What is the GCD × LCM relationship?', a: 'For any two positive integers a and b: GCD(a,b) × LCM(a,b) = a × b. This elegant formula means once you have the GCD, you can compute the LCM instantly: LCM(a,b) = a×b / GCD(a,b). Example: GCD(12,8) = 4, LCM(12,8) = 12×8/4 = 24.' },
        ].map((f, i) => (
          <Acc key={i} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} color={C} />
        ))}
      </Sec>

    </div>
  )
}
