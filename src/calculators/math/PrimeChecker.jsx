import { useState, useMemo } from 'react'
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

const getFactors = n => {
  const factors = []
  for (let i = 1; i <= Math.sqrt(n); i++) {
    if (n % i === 0) {
      factors.push(i)
      if (i !== n / i) factors.push(n / i)
    }
  }
  return factors.sort((a, b) => a - b)
}

const nextPrime = n => {
  let c = n + 1
  while (!isPrime(c)) c++
  return c
}

const prevPrime = n => {
  if (n <= 2) return null
  let c = n - 1
  while (c >= 2 && !isPrime(c)) c--
  return c >= 2 ? c : null
}

const primeFactorization = n => {
  const factors = []
  let d = 2
  while (d * d <= n) {
    while (n % d === 0) { factors.push(d); n = Math.floor(n / d) }
    d++
  }
  if (n > 1) factors.push(n)
  return factors
}

const primesUpTo = limit => {
  const sieve = Array(limit + 1).fill(true)
  sieve[0] = sieve[1] = false
  for (let i = 2; i * i <= limit; i++) if (sieve[i]) for (let j = i * i; j <= limit; j += i) sieve[j] = false
  return sieve.map((v, i) => v ? i : -1).filter(i => i > 0)
}

const fmt = n => isNaN(n) || !isFinite(n) ? '—' : n.toLocaleString()

// ─── shared UI components ──────────────────────────────────────
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
          type="number" value={value} min={2} max={999999}
          onChange={e => onChange(e.target.value === '' ? '' : Number(e.target.value))}
          onFocus={() => setF(true)} onBlur={() => setF(false)}
          style={{ flex: 1, border: 'none', background: 'transparent', padding: '0 14px', fontSize: 22, fontWeight: 700, color: 'var(--text)', outline: 'none', fontFamily: "'Space Grotesk',sans-serif" }}
        />
      </div>
    </div>
  )
}

// ─── Sieve of Eratosthenes visual ─────────────────────────────
function SieveVisual({ n, color }) {
  const limit = 100
  const primes = useMemo(() => primesUpTo(limit), [])
  const safeN = Math.min(n, limit)

  return (
    <Sec title="Sieve of Eratosthenes" sub="Primes up to 100">
      <p style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.7, marginBottom: 14 }}>
        The ancient sieve algorithm finds all primes by crossing out multiples. Every highlighted number is prime — they have no factors other than 1 and themselves.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 4 }}>
        {Array.from({ length: 100 }, (_, i) => i + 1).map(num => {
          const prime = isPrime(num)
          const isN = num === safeN
          return (
            <div key={num} style={{
              aspectRatio: '1', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, fontWeight: prime ? 700 : 400,
              background: isN ? color : prime ? color + '22' : 'var(--bg-raised)',
              color: isN ? '#fff' : prime ? color : 'var(--text-3)',
              border: `1px solid ${isN ? color : prime ? color + '50' : 'var(--border)'}`,
            }}>
              {num}
            </div>
          )
        })}
      </div>
      <div style={{ marginTop: 10, display: 'flex', gap: 14, fontSize: 11, color: 'var(--text-3)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: color, display: 'inline-block' }} /> Prime
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--bg-raised)', border: '1px solid var(--border)', display: 'inline-block' }} /> Composite
        </span>
        {safeN <= 100 && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: color, display: 'inline-block' }} /> Your number
          </span>
        )}
      </div>
    </Sec>
  )
}

// ─── Twin primes visual ───────────────────────────────────────
function TwinPrimesSection({ color }) {
  const twins = []
  for (let i = 3; i < 200; i += 2) {
    if (isPrime(i) && isPrime(i + 2)) twins.push([i, i + 2])
  }
  return (
    <Sec title="Twin primes" sub="Pairs differing by 2">
      <p style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.7, marginBottom: 14 }}>
        Twin primes are pairs of primes that differ by exactly 2, like (3, 5), (11, 13), (17, 19). The Twin Prime Conjecture — that infinitely many such pairs exist — remains unproven.
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {twins.slice(0, 18).map(([a, b], i) => (
          <div key={i} style={{ display: 'flex', gap: 3, padding: '6px 10px', borderRadius: 9, background: color + '10', border: `1px solid ${color}30` }}>
            <span style={{ fontSize: 12, fontWeight: 700, color, fontFamily: "'Space Grotesk',sans-serif" }}>{a}</span>
            <span style={{ fontSize: 11, color: 'var(--text-3)' }}>·</span>
            <span style={{ fontSize: 12, fontWeight: 700, color, fontFamily: "'Space Grotesk',sans-serif" }}>{b}</span>
          </div>
        ))}
        <div style={{ padding: '6px 10px', borderRadius: 9, background: 'var(--bg-raised)', fontSize: 12, color: 'var(--text-3)' }}>···</div>
      </div>
    </Sec>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────
export default function PrimeChecker({ meta, category }) {
  const C = category?.color || '#6366f1'
  const [num, setNum] = useState(97)
  const [openFaq, setOpenFaq] = useState(null)
  const [openGloss, setOpenGloss] = useState(null)

  const n = Math.max(2, Math.min(999999, Math.round(Number(num) || 2)))
  const prime = isPrime(n)
  const factors = getFactors(n)
  const pFactors = primeFactorization(n)
  const np = nextPrime(n)
  const pp = prevPrime(n)
  const sqrtN = Math.sqrt(n)

  // build unique prime factor exponents
  const pFactorMap = {}
  pFactors.forEach(f => { pFactorMap[f] = (pFactorMap[f] || 0) + 1 })

  const steps = prime ? [
    { label: 'Check if n < 2', math: `${n} ≥ 2 → proceed`, note: 'Numbers less than 2 are not prime by definition' },
    { label: 'Check if even', math: n === 2 ? '2 is the only even prime' : `${n} is odd → not divisible by 2`, note: 'All even numbers > 2 are composite' },
    { label: 'Trial division up to √n', math: `√${n} ≈ ${sqrtN.toFixed(3)} → check divisors up to ${Math.floor(sqrtN)}`, note: 'If no factor ≤ √n exists, n is prime' },
    { label: 'Check odd divisors', math: `No odd number from 3 to ${Math.floor(sqrtN)} divides ${n} evenly`, note: 'We only need to check up to √n — any larger factor would pair with a smaller one we already checked' },
    { label: 'Conclusion', math: `${n} is PRIME ✓`, note: `${n} has exactly 2 factors: 1 and ${n}` },
  ] : [
    { label: 'Check if n < 2', math: `${n} ≥ 2 → proceed`, note: 'Numbers less than 2 are neither prime nor composite' },
    { label: 'Trial division', math: `√${n} ≈ ${sqrtN.toFixed(3)} → check divisors up to ${Math.floor(sqrtN)}` },
    { label: 'Found a divisor', math: `${n} ÷ ${factors[1]} = ${n / factors[1]} → ${factors[1]} is a factor`, note: `${n} is divisible by ${factors[1]}, so it cannot be prime` },
    { label: 'Prime factorisation', math: `${n} = ${Object.entries(pFactorMap).map(([p, e]) => e > 1 ? `${p}^${e}` : p).join(' × ')}` },
    { label: 'Conclusion', math: `${n} is COMPOSITE — it has ${factors.length} factors`, note: `Factors: ${factors.join(', ')}` },
  ]

  const FAMOUS_PRIMES = [
    { n: 2, note: 'Only even prime' },
    { n: 3, note: 'First odd prime' },
    { n: 5, note: 'Sum of 2 + 3' },
    { n: 11, note: 'Repunit prime' },
    { n: 13, note: 'Twin with 11' },
    { n: 17, note: 'Fermat prime' },
    { n: 19, note: 'Twin with 17' },
    { n: 23, note: '9th prime' },
    { n: 97, note: 'Largest 2-digit' },
    { n: 101, note: 'First 3-digit' },
    { n: 127, note: 'Mersenne prime' },
    { n: 257, note: 'Fermat prime' },
  ]

  const GLOSSARY = [
    { term: 'Prime number', def: 'A natural number greater than 1 with exactly two distinct positive divisors: 1 and itself. Examples: 2, 3, 5, 7, 11, 13.' },
    { term: 'Composite number', def: 'A natural number greater than 1 that has more than two factors — i.e. it can be divided evenly by at least one number other than 1 and itself.' },
    { term: 'Fundamental Theorem of Arithmetic', def: 'Every integer greater than 1 is either prime or can be expressed as a unique product of primes (up to ordering). This is why primes are called the "atoms" of arithmetic.' },
    { term: 'Trial division', def: 'The basic primality test: divide n by every integer from 2 up to √n. If no exact division occurs, n is prime. Optimised by only checking odd divisors after 2.' },
    { term: 'Mersenne prime', def: 'A prime of the form 2^p − 1, where p is also prime. Examples: 7 (2³−1), 31 (2⁵−1), 127 (2⁷−1). The largest known primes are Mersenne primes.' },
    { term: 'Fermat prime', def: 'A prime of the form 2^(2^n) + 1. Known Fermat primes: 3, 5, 17, 257, 65537. No others have been found despite extensive searching.' },
    { term: 'Twin primes', def: 'A pair of primes differing by 2, such as (11,13) or (17,19). The Twin Prime Conjecture says infinitely many such pairs exist, but this remains unproven.' },
    { term: 'Primorial', def: 'The product of all primes up to n, written n#. E.g. 7# = 2×3×5×7 = 210. Used in proofs about prime gaps.' },
  ]

  const FAQ = [
    { q: 'Why is 1 not considered a prime number?', a: 'By modern definition, primes must have exactly two distinct factors: 1 and themselves. The number 1 has only one distinct factor (itself), so it does not qualify. Historically this exclusion is also necessary to preserve the uniqueness in the Fundamental Theorem of Arithmetic — if 1 were prime, factorizations like 12 = 2²×3 would have infinitely many equivalent forms (2²×3×1, 2²×3×1×1, etc.).' },
    { q: 'Is 2 special among primes?', a: '2 is the only even prime and the smallest prime. Every other even number is divisible by 2 and thus composite. This makes 2 unique — all other primes are odd, which is why the sum of any two odd primes is even (and therefore composite if > 2).' },
    { q: 'How do we know there are infinitely many primes?', a: "Euclid proved this around 300 BC with an elegant argument: assume there are finitely many primes p₁, p₂,…, pₙ. Compute N = p₁×p₂×…×pₙ + 1. N is either prime (contradicting our list) or divisible by some prime not in our list (also a contradiction). Therefore the list cannot be finite." },
    { q: 'What is the largest known prime?', a: 'As of 2024, the largest known prime is a Mersenne prime: 2^136,279,841 − 1, discovered in October 2024. It has over 41 million digits. The Great Internet Mersenne Prime Search (GIMPS) coordinates distributed computing to search for new Mersenne primes.' },
    { q: 'How quickly can a computer check if a number is prime?', a: 'For numbers up to ~10^15, optimised trial division or Miller-Rabin probabilistic tests are fast (microseconds). For cryptographic primes with hundreds of digits, the Miller-Rabin test with multiple witnesses is used — it is extremely fast and astronomically unlikely to give a wrong answer.' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Formula / definition card */}
      <div style={{ background: `linear-gradient(135deg,${C}12,${C}06)`, border: `1px solid ${C}30`, borderRadius: 14, padding: '16px 20px' }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: C, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Definition</div>
        <div style={{ fontSize: 18, fontWeight: 800, color: C, fontFamily: "'Space Grotesk',sans-serif", lineHeight: 1.3 }}>
          A prime p has exactly 2 factors: 1 and p
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 6, lineHeight: 1.65 }}>
          To test: check divisibility by all integers from 2 up to √n — if none divide evenly, n is prime.
        </div>
      </div>

      <CalcShell
        left={<>
          <MathInput label="Enter a number to check" value={num} onChange={v => setNum(Math.max(2, Math.min(999999, Math.round(Number(v) || 2))))} color={C} hint="2 – 999,999" />

          {/* Quick select famous primes */}
          <div style={{ borderTop: '0.5px solid var(--border)', paddingTop: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 10 }}>⚡ Famous primes</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
              {FAMOUS_PRIMES.map((fp, i) => (
                <button key={i} onClick={() => setNum(fp.n)}
                  style={{ padding: '8px', borderRadius: 9, border: `1.5px solid ${num === fp.n ? C : 'var(--border-2)'}`, background: num === fp.n ? C + '12' : 'var(--bg-raised)', cursor: 'pointer', textAlign: 'center' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = C + '60'} onMouseLeave={e => e.currentTarget.style.borderColor = num === fp.n ? C : 'var(--border-2)'}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: num === fp.n ? C : 'var(--text)', fontFamily: "'Space Grotesk',sans-serif" }}>{fmt(fp.n)}</div>
                  <div style={{ fontSize: 9, color: 'var(--text-3)', marginTop: 2 }}>{fp.note}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Neighbor primes */}
          <div style={{ borderTop: '0.5px solid var(--border)', paddingTop: 14, marginTop: 4 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 10 }}>Neighbouring primes</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { label: '← Previous prime', val: pp, action: () => pp && setNum(pp) },
                { label: '→ Next prime', val: np, action: () => setNum(np) },
              ].map((nb, i) => (
                <button key={i} onClick={nb.action}
                  style={{ padding: '10px 12px', borderRadius: 10, border: `1px solid ${C}30`, background: C + '08', cursor: 'pointer', textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 4 }}>{nb.label}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>{nb.val ? fmt(nb.val) : '—'}</div>
                </button>
              ))}
            </div>
          </div>
        </>}

        right={<>
          {/* Main verdict */}
          <div style={{ background: 'var(--bg-card)', border: `2px solid ${prime ? C : '#ef4444'}30`, borderRadius: 14, padding: '20px', marginBottom: 14 }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 14 }}>
              <div style={{ width: 56, height: 56, borderRadius: 14, background: prime ? C + '18' : '#ef444418', border: `2px solid ${prime ? C : '#ef4444'}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>
                {prime ? '✓' : '✗'}
              </div>
              <div>
                <div style={{ fontSize: 32, fontWeight: 800, color: prime ? C : '#ef4444', fontFamily: "'Space Grotesk',sans-serif", lineHeight: 1 }}>{fmt(n)}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: prime ? C : '#ef4444', marginTop: 4 }}>
                  {prime ? 'is PRIME' : 'is NOT PRIME (Composite)'}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div style={{ padding: '10px 12px', background: 'var(--bg-raised)', borderRadius: 10, border: '0.5px solid var(--border)' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', marginBottom: 3 }}>NUMBER OF FACTORS</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: prime ? C : '#ef4444', fontFamily: "'Space Grotesk',sans-serif" }}>{factors.length}</div>
                <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 1 }}>{prime ? 'exactly 2 (prime)' : 'more than 2 (composite)'}</div>
              </div>
              <div style={{ padding: '10px 12px', background: 'var(--bg-raised)', borderRadius: 10, border: '0.5px solid var(--border)' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', marginBottom: 3 }}>√n (check limit)</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>{sqrtN.toFixed(2)}</div>
                <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 1 }}>divisors checked up to {Math.floor(sqrtN)}</div>
              </div>
            </div>
          </div>

          {/* Prime factorisation */}
          <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 14, padding: '14px 18px', marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 10, fontFamily: "'Space Grotesk',sans-serif" }}>Prime factorisation</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
              {prime
                ? <div style={{ padding: '8px 14px', borderRadius: 9, background: C + '15', border: `1.5px solid ${C}40`, fontSize: 16, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>{n} is itself prime</div>
                : Object.entries(pFactorMap).map(([p, e], i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {i > 0 && <span style={{ color: 'var(--text-3)', fontSize: 14 }}>×</span>}
                    <div style={{ padding: '8px 14px', borderRadius: 9, background: C + '15', border: `1.5px solid ${C}40`, fontSize: 16, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>
                      {p}{e > 1 ? <sup>{e}</sup> : ''}
                    </div>
                  </div>
                ))
              }
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-2)' }}>
              {prime ? `${n} = 1 × ${n}` : `${n} = ${Object.entries(pFactorMap).map(([p, e]) => e > 1 ? `${p}^${e}` : p).join(' × ')}`}
            </div>
          </div>

          {/* All factors */}
          {!prime && (
            <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 14, padding: '14px 18px', marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 10, fontFamily: "'Space Grotesk',sans-serif" }}>All {factors.length} factors of {fmt(n)}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {factors.map((f, i) => (
                  <div key={i} onClick={() => setNum(f)}
                    style={{ padding: '5px 11px', borderRadius: 8, background: isPrime(f) ? C + '15' : 'var(--bg-raised)', border: `1px solid ${isPrime(f) ? C + '40' : 'var(--border)'}`, fontSize: 12, fontWeight: 600, color: isPrime(f) ? C : 'var(--text)', cursor: 'pointer', fontFamily: "'Space Grotesk',sans-serif" }}>
                    {fmt(f)}
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 8 }}>Highlighted factors are themselves prime — click any to check it</div>
            </div>
          )}

          <BreakdownTable title="Summary" rows={[
            { label: 'Number', value: fmt(n) },
            { label: 'Is prime?', value: prime ? 'YES ✓' : 'NO ✗', bold: true, highlight: true, color: prime ? C : '#ef4444' },
            { label: 'Number of factors', value: String(factors.length) },
            { label: 'Prime factorisation', value: prime ? String(n) : Object.entries(pFactorMap).map(([p, e]) => e > 1 ? `${p}^${e}` : p).join(' × ') },
            { label: '√n (trial division limit)', value: sqrtN.toFixed(4) },
            { label: 'Previous prime', value: pp ? fmt(pp) : '—' },
            { label: 'Next prime', value: fmt(np) },
          ]} />
          <AIHintCard hint={`${n} ${prime ? 'is prime' : `is composite: ${Object.entries(pFactorMap).map(([p, e]) => e > 1 ? `${p}^${e}` : p).join('×')}`}. Factors: ${factors.join(', ')}`} />
        </>}
      />

      <StepsCard steps={steps} color={C} />
      <SieveVisual n={n} color={C} />
      <TwinPrimesSection color={C} />

      {/* Prime number theorem */}
      <Sec title="Prime Number Theorem" sub="How primes are distributed">
        <p style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.75, marginBottom: 14 }}>
          Primes become less frequent as numbers grow, but never disappear. The Prime Number Theorem (proved in 1896) quantifies this: the number of primes up to n, written π(n), is approximately n / ln(n).
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
          {[
            { range: 'Up to 10', exact: 4, approx: '10/ln(10) ≈ 4.3' },
            { range: 'Up to 100', exact: 25, approx: '100/ln(100) ≈ 21.7' },
            { range: 'Up to 1,000', exact: 168, approx: '1000/ln(1000) ≈ 145' },
            { range: 'Up to 1,000,000', exact: 78498, approx: '10^6/ln(10^6) ≈ 72,382' },
          ].map((r, i) => (
            <div key={i} style={{ padding: '10px 13px', borderRadius: 10, background: 'var(--bg-raised)', border: '0.5px solid var(--border)' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C, marginBottom: 4 }}>{r.range}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', fontFamily: "'Space Grotesk',sans-serif", marginBottom: 2 }}>π(n) = {r.exact}</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)' }}>≈ {r.approx}</div>
            </div>
          ))}
        </div>
      </Sec>

      {/* Real-world uses */}
      <Sec title="Where prime numbers are used in real life">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { icon: '🔒', field: 'Cryptography (RSA)', desc: 'RSA encryption — used in every HTTPS website — relies on the fact that multiplying two large primes is easy, but factoring the result back into primes is computationally infeasible. Your bank uses primes to protect your transactions.', example: 'n = p × q where p, q are 1024-bit primes', color: '#ef4444' },
            { icon: '🎵', field: 'Music & Rhythm', desc: 'Prime-length rhythmic cycles do not repeat until much later, making them useful in polyrhythmic music. The cicada Magicicada uses 13- or 17-year prime cycles to avoid synchronising with predator populations.', example: '13-year and 17-year cicadas', color: '#f59e0b' },
            { icon: '🔢', field: 'Hash functions', desc: 'Hash table sizes are often prime to minimise clustering. Many checksum algorithms use prime moduli because they interact well with the structure of arithmetic.', example: 'Hash size = next prime after 2n', color: '#10b981' },
            { icon: '🌌', field: 'SETI & communication', desc: 'Scientists suggested broadcasting primes to extraterrestrials as a signal of intelligence — any civilisation advanced enough for radio would understand primes as non-random.', example: 'Arecibo message used prime grid dimensions', color: C },
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

      {/* Special prime families */}
      <Sec title="Special families of primes" sub="Beyond ordinary primes">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { name: 'Mersenne primes', form: '2^p − 1', examples: '3, 7, 31, 127, 8191, 131071…', desc: 'Only 51 known. The largest known prime is always a Mersenne prime. GIMPS project actively searches for new ones.', color: C },
            { name: 'Fermat primes', form: '2^(2^n) + 1', examples: '3, 5, 17, 257, 65537', desc: 'Only 5 known. Gauss proved a regular polygon with n sides is constructible with compass and straightedge if and only if n has only Fermat prime factors.', color: '#10b981' },
            { name: 'Palindrome primes', form: 'reads same backwards', examples: '11, 101, 131, 151, 181, 191, 313…', desc: 'Primes that read the same forwards and backwards in decimal. All palindrome primes with an even number of digits are divisible by 11 (except 11 itself).', color: '#f59e0b' },
            { name: 'Gaussian primes', form: 'a + bi in ℤ[i]', examples: '1+i, 3, 7, 2+3i…', desc: 'Primes in the complex number system. Some ordinary primes like 5 = (2+i)(2−i) are NOT Gaussian primes; others like 3 remain prime in ℤ[i].', color: '#ef4444' },
          ].map((p, i) => (
            <div key={i} style={{ padding: '12px 14px', borderRadius: 11, background: p.color + '08', border: `1px solid ${p.color}25` }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'baseline', marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: p.color }}>{p.name}</span>
                <span style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: "'Space Grotesk',sans-serif" }}>{p.form}</span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.6, margin: '0 0 6px' }}>{p.desc}</p>
              <div style={{ fontSize: 11, color: p.color, fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600 }}>Examples: {p.examples}</div>
            </div>
          ))}
        </div>
      </Sec>

      {/* ⚠️ Common mistakes */}
      <Sec title="⚠️ Common mistakes">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            '1 is NOT prime — it has only one distinct factor (itself), not two',
            '2 is the ONLY even prime — all other even numbers are divisible by 2',
            'Assuming all odd numbers are prime — 9, 15, 21, 25, 27 are all odd and composite',
            'Confusing "prime" with "odd" — they overlap heavily but are not the same',
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
        {FAQ.map((f, i) => (
          <Acc key={i} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} color={C} />
        ))}
      </Sec>

    </div>
  )
}
