import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'

// ─── helpers ───────────────────────────────────────────────────
const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) { [a, b] = [b, a % b] } return a }
const lcm = (a, b) => Math.abs(a * b) / gcd(a, b)
const simplify = (n, d) => { if (d === 0) return { n, d }; const g = gcd(Math.abs(n), Math.abs(d)); const sn = n / g; const sd = d / g; return sd < 0 ? { n: -sn, d: -sd } : { n: sn, d: sd } }
const toMixed = (n, d) => { if (Math.abs(n) < Math.abs(d)) return null; const whole = Math.trunc(n / d); const rem = n % d; return { whole, n: rem, d } }
const fmtFraction = (n, d) => d === 1 ? `${n}` : `${n}/${d}`
const fmtMixed = (m) => m ? (m.n === 0 ? `${m.whole}` : `${m.whole} ${Math.abs(m.n)}/${m.d}`) : null

const OPERATIONS = [
  { v: 'add',      label: 'Add',      sym: '+', color: '#10b981' },
  { v: 'subtract', label: 'Subtract', sym: '−', color: '#f59e0b' },
  { v: 'multiply', label: 'Multiply', sym: '×', color: '#3b82f6' },
  { v: 'divide',   label: 'Divide',   sym: '÷', color: '#8b5cf6' },
  { v: 'simplify', label: 'Simplify', sym: '↓', color: '#ec4899' },
]

// ─── compute result + steps ────────────────────────────────────
function compute(op, n1, d1, n2, d2) {
  if (d1 === 0) return { error: 'Denominator cannot be zero' }
  if (op !== 'simplify' && d2 === 0) return { error: 'Second denominator cannot be zero' }
  if (op === 'divide' && n2 === 0) return { error: 'Cannot divide by zero' }

  let rn, rd, steps = []

  if (op === 'simplify') {
    const g = gcd(Math.abs(n1), Math.abs(d1))
    rn = (d1 < 0 ? -n1 : n1) / g
    rd = Math.abs(d1) / g
    steps = [
      { label: 'Write the fraction', math: `${n1}/${d1}`, note: 'Identify the numerator and denominator' },
      { label: 'Find the GCD', math: `GCD(${Math.abs(n1)}, ${Math.abs(d1)}) = ${g}`, note: 'Greatest Common Divisor — the largest number that divides both evenly' },
      { label: 'Divide both by GCD', math: `${n1} ÷ ${g} = ${n1/g}    and    ${Math.abs(d1)} ÷ ${g} = ${Math.abs(d1)/g}`, note: 'Dividing top and bottom by the same number keeps the fraction equal' },
      { label: 'Simplified result', math: `${fmtFraction(rn, rd)}`, note: g === 1 ? 'The fraction was already fully simplified' : `Reduced from ${n1}/${d1} to ${rn}/${rd}` },
    ]
  } else if (op === 'add' || op === 'subtract') {
    const l = lcm(d1, d2)
    const m1 = l / d1, m2 = l / d2
    const nn1 = n1 * m1, nn2 = n2 * m2
    rn = op === 'add' ? nn1 + nn2 : nn1 - nn2
    rd = l
    const sym = op === 'add' ? '+' : '−'
    steps = [
      { label: 'Write out the problem', math: `${fmtFraction(n1,d1)} ${sym} ${fmtFraction(n2,d2)}`, note: 'You cannot add or subtract fractions unless they share the same denominator' },
      { label: 'Find the LCM of denominators', math: `LCM(${d1}, ${d2}) = ${l}`, note: `Lowest Common Multiple — the smallest number both ${d1} and ${d2} divide into` },
      ...(l !== d1 || l !== d2 ? [{ label: 'Convert to equivalent fractions', math: `${n1}/${d1} = ${nn1}/${l}    and    ${n2}/${d2} = ${nn2}/${l}`, note: `Multiply top and bottom of each fraction to make denominators equal to ${l}` }] : []),
      { label: `${op === 'add' ? 'Add' : 'Subtract'} the numerators`, math: `${nn1} ${sym} ${nn2} = ${rn}`, note: 'Denominators stay the same — only numerators are combined' },
      { label: 'Simplify the result', math: (() => { const s = simplify(rn, l); return s.n === rn && s.d === l ? `${fmtFraction(rn, l)} — already simplified` : `${fmtFraction(rn, l)} → ${fmtFraction(s.n, s.d)}` })(), note: 'Always simplify your final answer' },
    ]
    const s = simplify(rn, rd); rn = s.n; rd = s.d
  } else if (op === 'multiply') {
    rn = n1 * n2; rd = d1 * d2
    steps = [
      { label: 'Write out the problem', math: `${fmtFraction(n1,d1)} × ${fmtFraction(n2,d2)}`, note: 'Multiplication is the simplest fraction operation — no common denominator needed' },
      { label: 'Multiply the numerators', math: `${n1} × ${n2} = ${rn}`, note: 'Top × top' },
      { label: 'Multiply the denominators', math: `${d1} × ${d2} = ${rd}`, note: 'Bottom × bottom' },
      { label: 'Write combined fraction', math: `${fmtFraction(rn, rd)}`, note: 'Put the results together' },
      { label: 'Simplify', math: (() => { const s = simplify(rn, rd); return s.n === rn && s.d === rd ? `${fmtFraction(rn, rd)} — already simplified` : `${fmtFraction(rn, rd)} → ${fmtFraction(s.n, s.d)}` })(), note: 'Divide top and bottom by their GCD' },
    ]
    const s = simplify(rn, rd); rn = s.n; rd = s.d
  } else if (op === 'divide') {
    const flippedN = n2, flippedD = d2
    rn = n1 * d2; rd = d1 * n2
    steps = [
      { label: 'Write out the problem', math: `${fmtFraction(n1,d1)} ÷ ${fmtFraction(n2,d2)}`, note: 'Dividing by a fraction is the same as multiplying by its reciprocal' },
      { label: 'Flip the second fraction (reciprocal)', math: `${fmtFraction(n2,d2)} → ${fmtFraction(d2,n2)}`, note: `Swap the numerator and denominator of ${fmtFraction(n2,d2)}` },
      { label: 'Change ÷ to ×', math: `${fmtFraction(n1,d1)} × ${fmtFraction(d2,n2)}`, note: '"Keep, Change, Flip" — keep the first fraction, change divide to multiply, flip the second' },
      { label: 'Multiply numerators', math: `${n1} × ${d2} = ${rn}`, note: 'Top × top' },
      { label: 'Multiply denominators', math: `${d1} × ${n2} = ${rd}`, note: 'Bottom × bottom' },
      { label: 'Simplify', math: (() => { const s = simplify(rn, rd); return s.n === rn && s.d === rd ? `${fmtFraction(rn, rd)} — already simplified` : `${fmtFraction(rn, rd)} → ${fmtFraction(s.n, s.d)}` })(), note: 'Divide top and bottom by their GCD' },
    ]
    const s = simplify(rn, rd); rn = s.n; rd = s.d
  }

  return { rn, rd, steps, error: null }
}

// ─── fraction visual bar ──────────────────────────────────────
function FractionBar({ n, d, color, label, maxW = 220 }) {
  if (!d || d === 0 || n === 0) return null
  const pct = Math.min(Math.abs(n / d), 1)
  const decimal = (n / d).toFixed(4)
  return (
    <div style={{ marginBottom: 10 }}>
      {label && <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 5 }}>{label}</div>}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flex: 1, height: 14, background: 'var(--border)', borderRadius: 7, overflow: 'hidden', position: 'relative' }}>
          <div style={{ height: '100%', width: `${pct * 100}%`, background: color, borderRadius: 7, transition: 'width .5s cubic-bezier(.4,0,.2,1)' }} />
        </div>
        <div style={{ fontSize: 13, fontWeight: 700, color, minWidth: 50, textAlign: 'right', fontFamily: "'Space Grotesk',sans-serif" }}>
          {fmtFraction(n, d)}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-3)', minWidth: 40 }}>= {decimal}</div>
      </div>
    </div>
  )
}

// ─── live fraction visual (pie-style segments) ────────────────
function FractionPie({ n, d, color }) {
  if (!d || d <= 0 || d > 20) return null
  const filled = Math.min(Math.abs(n), d)
  const cells = Array.from({ length: d }, (_, i) => i < filled)
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, justifyContent: 'center', padding: '10px 0' }}>
      {cells.map((f, i) => (
        <div key={i} style={{ width: d <= 8 ? 28 : d <= 12 ? 22 : 16, height: d <= 8 ? 28 : d <= 12 ? 22 : 16, borderRadius: 5, background: f ? color : 'var(--border)', border: `1.5px solid ${f ? color + '60' : 'var(--border)'}`, transition: 'background .3s' }} />
      ))}
    </div>
  )
}

// ─── number input ──────────────────────────────────────────────
function NumInput({ label, value, onChange, color }) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>{label}</div>
      <input
        type="number"
        value={value}
        onChange={e => onChange(e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: '100%',
          height: 44,
          border: `1.5px solid ${focused ? color : 'var(--border-2)'}`,
          borderRadius: 9,
          background: 'var(--bg-card)',
          color: 'var(--text)',
          fontSize: 18,
          fontWeight: 700,
          textAlign: 'center',
          outline: 'none',
          fontFamily: "'Space Grotesk',sans-serif",
          boxSizing: 'border-box',
          transition: 'border-color .15s',
        }}
      />
    </div>
  )
}

// ─── fraction display (a/b stacked) ───────────────────────────
function FractionDisplay({ n, d, color = '#3b82f6', size = 'md' }) {
  const fs = size === 'lg' ? { n: 28, d: 28, line: 2 } : { n: 18, d: 18, line: 1.5 }
  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <span style={{ fontSize: fs.n, fontWeight: 700, color, fontFamily: "'Space Grotesk',sans-serif", lineHeight: 1 }}>{n}</span>
      <div style={{ height: fs.line, width: '100%', minWidth: 20, background: color, borderRadius: 1 }} />
      <span style={{ fontSize: fs.d, fontWeight: 700, color, fontFamily: "'Space Grotesk',sans-serif", lineHeight: 1 }}>{d}</span>
    </div>
  )
}

// ─── steps card ───────────────────────────────────────────────
function StepsCard({ steps, color }) {
  const [expanded, setExpanded] = useState(false)
  if (!steps || steps.length === 0) return null
  const visible = expanded ? steps : steps.slice(0, 2)
  const hasMore = steps.length > 2
  return (
    <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
      <div style={{ padding: '12px 18px', borderBottom: '0.5px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', fontFamily: "'Space Grotesk',sans-serif" }}>Step-by-step working</span>
        <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{steps.length} steps</span>
      </div>
      <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {visible.map((s, i) => (
          <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <div style={{
              width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
              background: i === steps.length - 1 ? color : color + '18',
              border: `1.5px solid ${color}40`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700,
              color: i === steps.length - 1 ? '#fff' : color,
            }}>
              {i === steps.length - 1 ? '✓' : i + 1}
            </div>
            <div style={{ flex: 1 }}>
              {s.label && (
                <div style={{ fontSize: 10, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>
                  {s.label}
                </div>
              )}
              <div style={{
                fontSize: 13, lineHeight: 1.6,
                color: i === steps.length - 1 ? 'var(--text)' : 'var(--text)',
                fontFamily: "'Space Grotesk',sans-serif",
                fontWeight: i === steps.length - 1 ? 700 : 500,
                background: 'var(--bg-raised)',
                padding: '8px 12px',
                borderRadius: 8,
                border: `0.5px solid ${i === steps.length - 1 ? color + '40' : 'var(--border)'}`,
              }}>
                {s.math}
              </div>
              {s.note && (
                <div style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 4, lineHeight: 1.55, fontStyle: 'italic' }}>
                  ↳ {s.note}
                </div>
              )}
            </div>
          </div>
        ))}
        {hasMore && (
          <button onClick={() => setExpanded(e => !e)} style={{
            padding: '9px', borderRadius: 9,
            border: `1px solid ${color}30`, background: color + '08',
            color, fontSize: 12, fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>
            {expanded ? '▲ Hide steps' : `▼ Show all ${steps.length} steps`}
          </button>
        )}
      </div>
    </div>
  )
}

// ─── section wrapper ───────────────────────────────────────────
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

// ─── EXAMPLES ─────────────────────────────────────────────────
const EXAMPLES = {
  add:      [
    { icon: '🍕', label: 'Sharing a pizza',          desc: '1/2 of a pizza + 1/4 of a pizza', n1:1, d1:2, n2:1, d2:4 },
    { icon: '📏', label: 'Adding lengths',            desc: '3/8 metres + 5/8 metres',          n1:3, d1:8, n2:5, d2:8 },
    { icon: '🧪', label: 'Mixing solutions',          desc: '2/3 cup + 1/6 cup of liquid',      n1:2, d1:3, n2:1, d2:6 },
  ],
  subtract: [
    { icon: '🍰', label: 'Cake left over',            desc: '3/4 of a cake minus 1/3 eaten',    n1:3, d1:4, n2:1, d2:3 },
    { icon: '⛽', label: 'Fuel remaining',            desc: '7/8 tank minus 3/8 used',          n1:7, d1:8, n2:3, d2:8 },
    { icon: '📐', label: 'Trimming material',         desc: '5/6 metre minus 1/4 metre cut off',n1:5, d1:6, n2:1, d2:4 },
  ],
  multiply: [
    { icon: '🏡', label: 'Area of a garden',          desc: '3/4 m × 2/3 m to find area',       n1:3, d1:4, n2:2, d2:3 },
    { icon: '💸', label: 'Fraction of a price',       desc: '2/5 of 3/4 of original price',     n1:2, d1:5, n2:3, d2:4 },
    { icon: '🧵', label: 'Cutting fabric',            desc: '3/8 metres × 1/2 width',           n1:3, d1:8, n2:1, d2:2 },
  ],
  divide:   [
    { icon: '🍫', label: 'Splitting chocolate',       desc: '3/4 bar divided among 3 people (÷ 3/1)', n1:3, d1:4, n2:3, d2:1 },
    { icon: '🏃', label: 'Running pace',              desc: '5/6 km in 2/3 of an hour',          n1:5, d1:6, n2:2, d2:3 },
    { icon: '🔬', label: 'Science experiment',        desc: '7/8 litre split into 7/4 portions', n1:7, d1:8, n2:7, d2:4 },
  ],
  simplify: [
    { icon: '📊', label: 'Survey result',             desc: '12 out of 16 people agreed',        n1:12, d1:16, n2:1, d2:1 },
    { icon: '🎯', label: 'Score percentage',          desc: '18 correct out of 24 questions',    n1:18, d1:24, n2:1, d2:1 },
    { icon: '📦', label: 'Stock fraction',            desc: '15 items remaining out of 45',      n1:15, d1:45, n2:1, d2:1 },
  ],
}

const MISTAKES = {
  add:      ['Adding both numerators AND denominators (e.g. 1/2 + 1/3 ≠ 2/5 — this is the most common error)', 'Forgetting to find a common denominator first', 'Not simplifying the final answer'],
  subtract: ['Subtracting numerators and denominators separately', 'Getting the order wrong (e.g. 1/4 − 3/4 ≠ 2/0)', 'Forgetting to simplify at the end'],
  multiply: ['Finding a common denominator (not needed for multiplication)', 'Multiplying only the numerators and forgetting the denominators', 'Multiplying incorrectly when one fraction is a whole number — write whole number as n/1 first'],
  divide:   ['Flipping the first fraction instead of the second', 'Forgetting to flip at all and just multiplying straight across', 'Dividing by zero — a denominator of zero is undefined'],
  simplify: ['Dividing only the numerator or only the denominator (must do both)', 'Using a common factor instead of the GCF (you can simplify further)', 'Thinking a fraction with different top and bottom is automatically unsimplified'],
}

const GLOSSARY_ITEMS = [
  { term: 'Numerator',    def: 'The top number of a fraction — how many parts you have.' },
  { term: 'Denominator',  def: 'The bottom number of a fraction — how many equal parts the whole is divided into.' },
  { term: 'Equivalent fractions', def: 'Fractions that represent the same value. Example: 1/2 = 2/4 = 4/8.' },
  { term: 'Simplest form', def: 'A fraction where the numerator and denominator share no common factor other than 1.' },
  { term: 'GCD / GCF',    def: 'Greatest Common Divisor (or Factor) — the largest number that divides both numerator and denominator evenly.' },
  { term: 'LCM',          def: 'Lowest Common Multiple — the smallest number that both denominators divide into. Used when adding or subtracting fractions.' },
  { term: 'Mixed number', def: 'A whole number combined with a proper fraction, e.g. 1¾. Useful when an improper fraction is greater than 1.' },
  { term: 'Improper fraction', def: 'A fraction where the numerator is larger than the denominator, e.g. 7/4. Fully valid — just greater than 1.' },
  { term: 'Reciprocal',   def: 'A fraction flipped upside down. The reciprocal of 3/4 is 4/3. Used when dividing fractions.' },
]

// ─── operation cheat sheet data ───────────────────────────────
const CHEAT_SHEET = [
  {
    op: 'Add', sym: '+', color: '#10b981',
    rule: 'Find LCM → convert → add numerators → simplify',
    example: '1/3 + 1/4 = 4/12 + 3/12 = 7/12',
    mnemonic: 'Same bottom before you add on top',
    steps: ['Find LCM(3,4) = 12', 'Convert: 1/3 = 4/12, 1/4 = 3/12', 'Add: 4+3 = 7 → 7/12'],
  },
  {
    op: 'Subtract', sym: '−', color: '#f59e0b',
    rule: 'Find LCM → convert → subtract numerators → simplify',
    example: '3/4 − 1/3 = 9/12 − 4/12 = 5/12',
    mnemonic: 'Same bottom before you take away on top',
    steps: ['Find LCM(4,3) = 12', 'Convert: 3/4 = 9/12, 1/3 = 4/12', 'Subtract: 9−4 = 5 → 5/12'],
  },
  {
    op: 'Multiply', sym: '×', color: '#3b82f6',
    rule: 'Multiply numerators × numerators, denominators × denominators → simplify',
    example: '2/3 × 3/4 = 6/12 = 1/2',
    mnemonic: 'Top times top, bottom times bottom',
    steps: ['Multiply tops: 2×3 = 6', 'Multiply bottoms: 3×4 = 12', 'Simplify: 6/12 = 1/2'],
  },
  {
    op: 'Divide', sym: '÷', color: '#8b5cf6',
    rule: 'Keep first fraction, flip second fraction, multiply',
    example: '2/3 ÷ 4/5 = 2/3 × 5/4 = 10/12 = 5/6',
    mnemonic: 'Keep · Change · Flip',
    steps: ['Keep 2/3', 'Flip 4/5 → 5/4', 'Multiply: 2×5=10, 3×4=12 → 10/12 → 5/6'],
  },
]

// ─── real world uses data ──────────────────────────────────────
const REAL_WORLD = [
  {
    icon: '🍳', field: 'Cooking & Baking',
    desc: 'Every recipe uses fractions. If a recipe calls for 3/4 cup of sugar but you want to make 1.5× the batch, you need to multiply: 3/4 × 3/2 = 9/8 = 1 1/8 cups. Professional chefs do this constantly.',
    example: 'Scaling a cake recipe from 8 to 12 servings',
    color: '#f59e0b',
  },
  {
    icon: '💊', field: 'Medicine & Pharmacy',
    desc: 'Drug dosages are calculated as fractions of body weight. A dose of 1/4 mg per kg for a 60 kg patient = 15 mg. Pharmacists work in fractions of milligrams daily. Errors here are dangerous — precision matters.',
    example: 'Calculating 3/4 of the adult dose for a child',
    color: '#ef4444',
  },
  {
    icon: '🏗️', field: 'Construction & Engineering',
    desc: 'Measurements in inches and feet are all fractions: 3/8 inch, 5/16 inch. When cutting timber or pipe, a carpenter adds 7/8" + 3/4" = 7/8 + 6/8 = 13/8 = 1 5/8". Getting this wrong wastes material and money.',
    example: 'Adding 5/8" and 3/4" plywood thickness',
    color: '#10b981',
  },
  {
    icon: '📈', field: 'Finance & Investing',
    desc: 'Before 2001, US stock prices were quoted in fractions: a stock might be 37 and 3/8 dollars. Bond interest rates like 6 3/4% are fractions. Understanding fractions is fundamental to reading financial data.',
    example: 'A bond paying 6¾% annual interest on ₹10,000',
    color: '#3b82f6',
  },
  {
    icon: '🎵', field: 'Music Theory',
    desc: 'Time signatures are fractions. 3/4 time means 3 beats per bar, each beat a quarter note. Note durations — whole, half, quarter, eighth — are literal fractions of a bar. Rhythm is applied fraction arithmetic.',
    example: '3/4 + 4/4 + 6/8 — mixing time signatures',
    color: '#8b5cf6',
  },
  {
    icon: '🛰️', field: 'Science & Engineering',
    desc: 'Gear ratios, wavelengths, probability distributions, chemical concentrations — all fractions. A gear ratio of 3/2 means for every 3 turns of the input gear, the output turns twice. Machines are built on this.',
    example: 'Gear ratio: 3/2 means 1.5× speed reduction',
    color: '#ec4899',
  },
]

// ─── fun facts ────────────────────────────────────────────────
const FUN_FACTS = [
  {
    fact: "Ancient Egyptians (3000 BC) only used fractions with 1 in the numerator — called 'unit fractions'. They would write 3/4 as 1/2 + 1/4. A special mathematical papyrus called the Rhind Papyrus contains a table of unit fraction equivalents.",
    icon: '🏛️',
  },
  {
    fact: "The word 'fraction' comes from the Latin 'fractio' meaning 'to break'. The horizontal line separating the numerator from the denominator is called the vinculum — from the Latin for 'bond' or 'chain'.",
    icon: '📜',
  },
  {
    fact: "In the Imperial system still used in the UK and US for some measurements, fractions never disappeared — you still buy timber in 3/4 inch thickness, and recipes still call for 1/3 cup. Metric was partly adopted because decimals are easier to compute, but fractions are more exact.",
    icon: '📏',
  },
  {
    fact: "Every terminating decimal (like 0.25 or 0.375) is a fraction. But recurring decimals like 1/3 = 0.333... are fractions whose decimal form never ends. Fractions are actually more precise than decimals for many values — 1/3 in fraction form is exact, while 0.333... is always an approximation.",
    icon: '♾️',
  },
]

const FAQ_ITEMS = [
  { q: 'Why do I need a common denominator to add fractions but not to multiply?',
    a: 'Because addition combines parts of the same-sized whole — you can only add "thirds" to "thirds", not "thirds" to "quarters" directly. Multiplication is different: you are taking a fraction of a fraction, so you simply multiply across. Think of it as finding a fraction of a fraction rather than combining equal portions.' },
  { q: 'When would I use fractions in real life?',
    a: 'Constantly — cooking (recipe scaling), construction (measurements in inches), finance (interest rates, tax), medicine (dosage calculations), data analysis (ratios and proportions), probability, and engineering. Fractions appear wherever precision matters more than rounded decimals.' },
  { q: 'What is the difference between a proper and improper fraction?',
    a: 'A proper fraction has a numerator smaller than its denominator (e.g. 3/4) and represents a value less than 1. An improper fraction has a numerator equal to or larger than its denominator (e.g. 7/4) and represents a value ≥ 1. Neither is wrong — they are just two ways to express the same thing. Improper fractions can be converted to mixed numbers (7/4 = 1¾).' },
  { q: 'Why does dividing by a fraction make the result bigger?',
    a: 'Because dividing by a fraction asks "how many times does this fraction fit into the original?" Dividing by 1/2 asks how many halves fit into a number — and naturally more halves fit than wholes. For example: 3 ÷ 1/2 = 6, because six halves make three whole units. The smaller the fraction you divide by, the larger the result.' },
  { q: 'My answer is an improper fraction — is that correct?',
    a: 'Yes, completely. An improper fraction like 7/3 is a perfectly valid answer. In many contexts (especially algebra and further maths) it is preferred over mixed numbers. You can convert it: 7/3 = 2⅓. The calculator shows both forms when applicable.' },
]

// ─── MAIN COMPONENT ───────────────────────────────────────────
export default function FractionCalculator({ meta, category }) {
  const catColor = category?.color || '#3b82f6'

  const [op,       setOp]      = useState('add')
  const [n1,       setN1]      = useState(1)
  const [d1,       setD1]      = useState(2)
  const [n2,       setN2]      = useState(1)
  const [d2,       setD2]      = useState(4)
  const [openFaq,  setOpenFaq] = useState(null)
  const [openGloss,setOpenGloss] = useState(null)
  const [stepsOpen,setStepsOpen] = useState(false)

  const showSecond = op !== 'simplify'
  const opObj = OPERATIONS.find(o => o.v === op) || OPERATIONS[0]
  const { rn, rd, steps, error } = compute(op, n1 || 0, d1 || 1, n2 || 0, d2 || 1)

  const mixed = !error && rn !== undefined ? toMixed(rn, rd) : null
  const decimal = !error && rd ? (rn / rd).toFixed(6).replace(/\.?0+$/, '') : null
  const pct = !error && rd ? ((rn / rd) * 100).toFixed(2).replace(/\.?0+$/, '') + '%' : null

  const opFormulas = {
    add:      'a/b + c/d = (ad + bc) / bd',
    subtract: 'a/b − c/d = (ad − bc) / bd',
    multiply: 'a/b × c/d = (a×c) / (b×d)',
    divide:   'a/b ÷ c/d = a/b × d/c = (a×d) / (b×c)',
    simplify: 'a/b → (a÷GCD) / (b÷GCD)',
  }

  const whatThisMeans = () => {
    if (error || rn === undefined) return null
    const frac = fmtFraction(rn, rd)
    const mixedStr = mixed ? ` — that is the same as ${fmtMixed(mixed)}` : ''
    const decStr = decimal ? ` or ${decimal} as a decimal` : ''
    if (op === 'add')      return `Adding those two fractions gives ${frac}${mixedStr}${decStr}. This is the total combined amount when you put both portions together.`
    if (op === 'subtract') return `After subtracting, ${frac} remains${mixedStr}${decStr}. This is how much is left when you remove the second amount from the first.`
    if (op === 'multiply') return `The result is ${frac}${mixedStr}${decStr}. This represents the fraction of a fraction — for example, taking ${fmtFraction(n1,d1)} of a quantity that is already ${fmtFraction(n2,d2)} of the whole.`
    if (op === 'divide')   return `Dividing gives ${frac}${mixedStr}${decStr}. This tells you how many times ${fmtFraction(n2,d2)} fits into ${fmtFraction(n1,d1)}.`
    if (op === 'simplify') return `${fmtFraction(n1,d1)} simplifies to ${frac}. Both fractions represent exactly the same value — ${decimal} — just written using smaller numbers.`
    return null
  }

  const hint = error
    ? `Error: ${error}`
    : `${fmtFraction(n1,d1)} ${opObj.sym} ${showSecond ? fmtFraction(n2,d2) + ' = ' : '= '} ${fmtFraction(rn,rd)}${decimal ? ` = ${decimal}` : ''}${mixed ? ` = ${fmtMixed(mixed)}` : ''}`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── FORMULA CARD ─────────────────────────────────────── */}
      <div style={{
        background: `linear-gradient(135deg, ${catColor}12 0%, ${catColor}06 100%)`,
        border: `1px solid ${catColor}30`,
        borderRadius: 14,
        padding: '16px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 16,
        flexWrap: 'wrap',
      }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: catColor, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>
            {opObj.label} Fractions — Formula
          </div>
          <div style={{ fontSize: 17, fontWeight: 700, color: catColor, fontFamily: "'Space Grotesk',sans-serif", letterSpacing: '.01em' }}>
            {opFormulas[op]}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>
            {op === 'add'      && 'Find the LCM of the denominators, convert both fractions, then add numerators'}
            {op === 'subtract' && 'Find the LCM of the denominators, convert both fractions, then subtract numerators'}
            {op === 'multiply' && 'Multiply numerators together and denominators together, then simplify'}
            {op === 'divide'   && 'Keep the first fraction, flip the second, then multiply — "Keep, Change, Flip"'}
            {op === 'simplify' && 'Divide both numerator and denominator by their Greatest Common Divisor'}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
          {/* visual fraction glyphs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', background: catColor + '12', borderRadius: 10 }}>
            <FractionDisplay n={n1 || 0} d={d1 || 1} color={catColor} />
            {showSecond && <>
              <span style={{ fontSize: 20, fontWeight: 700, color: catColor }}>{opObj.sym}</span>
              <FractionDisplay n={n2 || 0} d={d2 || 1} color={catColor} />
            </>}
            {!error && rn !== undefined && <>
              <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-3)' }}>=</span>
              <FractionDisplay n={rn} d={rd} color={catColor} />
            </>}
          </div>
        </div>
      </div>

      {/* ── CALCSHELL ────────────────────────────────────────── */}
      <CalcShell
        left={<>
          {/* Operation selector */}
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 10, fontFamily: "'DM Sans',sans-serif" }}>Operation</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6, marginBottom: 18 }}>
            {OPERATIONS.map(o => (
              <button key={o.v} onClick={() => setOp(o.v)} style={{
                padding: '9px 6px',
                borderRadius: 9,
                border: `1.5px solid ${op === o.v ? o.color : 'var(--border-2)'}`,
                background: op === o.v ? o.color + '12' : 'var(--bg-raised)',
                cursor: 'pointer',
                fontFamily: "'DM Sans',sans-serif",
              }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: op === o.v ? o.color : 'var(--text-3)', lineHeight: 1 }}>{o.sym}</div>
                <div style={{ fontSize: 10, fontWeight: op === o.v ? 700 : 400, color: op === o.v ? o.color : 'var(--text-2)', marginTop: 2 }}>{o.label}</div>
              </button>
            ))}
          </div>

          {/* First fraction */}
          <div style={{ borderTop: '0.5px solid var(--border)', paddingTop: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 10, fontFamily: "'DM Sans',sans-serif" }}>
              First fraction
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '12px', background: 'var(--bg-raised)', borderRadius: 10, border: '0.5px solid var(--border)', marginBottom: 14 }}>
              <NumInput label="Numerator" value={n1} onChange={setN1} color={catColor} />
              <div style={{ width: '60%', height: 2, background: catColor, borderRadius: 1 }} />
              <NumInput label="Denominator" value={d1} onChange={v => setD1(v === 0 ? 1 : v)} color={catColor} />
            </div>

            {/* Second fraction */}
            {showSecond && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                  <div style={{ height: 1, flex: 1, background: 'var(--border)' }} />
                  <span style={{ fontSize: 20, fontWeight: 700, color: opObj.color, padding: '0 12px' }}>{opObj.sym}</span>
                  <div style={{ height: 1, flex: 1, background: 'var(--border)' }} />
                </div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 10, fontFamily: "'DM Sans',sans-serif" }}>
                  Second fraction
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '12px', background: 'var(--bg-raised)', borderRadius: 10, border: '0.5px solid var(--border)' }}>
                  <NumInput label="Numerator" value={n2} onChange={setN2} color={catColor} />
                  <div style={{ width: '60%', height: 2, background: catColor, borderRadius: 1 }} />
                  <NumInput label="Denominator" value={d2} onChange={v => setD2(v === 0 ? 1 : v)} color={catColor} />
                </div>
              </>
            )}
          </div>

          {/* Real-world examples */}
          <div style={{ borderTop: '0.5px solid var(--border)', paddingTop: 14, marginTop: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 10 }}>
              🎯 Try a real example
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {(EXAMPLES[op] || []).map((ex, i) => (
                <button key={i} onClick={() => { setN1(ex.n1); setD1(ex.d1); setN2(ex.n2); setD2(ex.d2) }} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '9px 13px', borderRadius: 9,
                  border: '1px solid var(--border-2)',
                  background: 'var(--bg-raised)',
                  cursor: 'pointer', textAlign: 'left', gap: 8,
                  transition: 'border-color .15s',
                }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = catColor + '60'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-2)'}
                >
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)' }}>{ex.icon} {ex.label}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 1 }}>{ex.desc}</div>
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: catColor, flexShrink: 0 }}>
                    {fmtFraction(ex.n1, ex.d1)} {opObj.sym} {op !== 'simplify' ? fmtFraction(ex.n2, ex.d2) : ''}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>}

        right={<>
          {/* Error state */}
          {error ? (
            <div style={{ background: '#fee2e2', border: '1px solid #ef444430', borderRadius: 14, padding: '20px', marginBottom: 14, textAlign: 'center' }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#dc2626', marginBottom: 4 }}>⚠ {error}</div>
              <div style={{ fontSize: 12, color: '#991b1b' }}>Check your input values and try again.</div>
            </div>
          ) : (
            <>
              {/* Answer card */}
              <div style={{ background: 'var(--bg-card)', border: `1.5px solid ${catColor}30`, borderRadius: 14, padding: '18px 20px', marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.07em' }}>Result</span>
                  <button onClick={() => navigator.clipboard?.writeText(fmtFraction(rn, rd)).catch(()=>{})} style={{ padding: '3px 10px', borderRadius: 7, border: `1px solid ${catColor}30`, background: catColor + '08', color: catColor, fontSize: 10, fontWeight: 600, cursor: 'pointer' }}>
                    Copy
                  </button>
                </div>
                {/* Big stacked fraction display */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14 }}>
                  <FractionDisplay n={rn} d={rd} color={catColor} size="lg" />
                  <div>
                    {mixed && fmtMixed(mixed) && (
                      <div style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 4 }}>
                        = <strong style={{ color: catColor }}>{fmtMixed(mixed)}</strong> <span style={{ fontSize: 10, color: 'var(--text-3)' }}>(mixed number)</span>
                      </div>
                    )}
                    {decimal && (
                      <div style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 4 }}>
                        = <strong style={{ color: catColor }}>{decimal}</strong> <span style={{ fontSize: 10, color: 'var(--text-3)' }}>(decimal)</span>
                      </div>
                    )}
                    {pct && (
                      <div style={{ fontSize: 13, color: 'var(--text-2)' }}>
                        = <strong style={{ color: catColor }}>{pct}</strong> <span style={{ fontSize: 10, color: 'var(--text-3)' }}>(percentage)</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* What this means — inline under the answer */}
                {whatThisMeans() && (
                  <div style={{ padding: '10px 13px', background: catColor + '08', borderRadius: 9, border: `1px solid ${catColor}20`, fontSize: 12, color: 'var(--text-2)', lineHeight: 1.65 }}>
                    💡 {whatThisMeans()}
                  </div>
                )}
              </div>

              {/* Visual fraction bars */}
              <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 14, padding: '14px 18px', marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 12, fontFamily: "'Space Grotesk',sans-serif" }}>
                  Visual comparison
                </div>
                <FractionBar n={n1} d={d1 || 1} color={catColor} label={`First: ${fmtFraction(n1, d1)}`} />
                {showSecond && <FractionBar n={n2} d={d2 || 1} color={opObj.color} label={`Second: ${fmtFraction(n2, d2)}`} />}
                <FractionBar n={rn} d={rd} color='#22a355' label={`Result: ${fmtFraction(rn, rd)}`} />
                {/* Pie for result if denominator is small */}
                {rd <= 16 && rd > 0 && (
                  <div style={{ marginTop: 10, padding: '10px', background: 'var(--bg-raised)', borderRadius: 9, border: '0.5px solid var(--border)', textAlign: 'center' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>
                      {rn} out of {rd} equal parts
                    </div>
                    <FractionPie n={rn} d={rd} color='#22a355' />
                  </div>
                )}
              </div>

              <BreakdownTable title="Summary" rows={[
                { label: 'Result (fraction)',  value: fmtFraction(rn, rd),    bold: true, highlight: true, color: catColor },
                ...(mixed && fmtMixed(mixed) ? [{ label: 'Mixed number',         value: fmtMixed(mixed) }] : []),
                { label: 'Decimal',            value: decimal },
                { label: 'Percentage',         value: pct },
                { label: 'Operation',          value: opObj.label },
                ...(op !== 'simplify' ? [{ label: 'Inputs', value: `${fmtFraction(n1,d1)} ${opObj.sym} ${fmtFraction(n2,d2)}` }] : [{ label: 'Input', value: fmtFraction(n1,d1) }]),
              ]} />
              <AIHintCard hint={hint} />
            </>
          )}
        </>}
      />

      {/* ── STEPS ─────────────────────────────────────────────── */}
      {!error && steps && steps.length > 0 && (
        <StepsCard steps={steps} color={catColor} />
      )}

      {/* ── NUMBER LINE VISUAL ───────────────────────────────── */}
      {!error && rn !== undefined && (() => {
        const vals = [
          { v: n1 / (d1||1), label: fmtFraction(n1, d1||1), color: catColor },
          ...(showSecond ? [{ v: n2 / (d2||1), label: fmtFraction(n2, d2||1), color: opObj.color }] : []),
          { v: rn / rd, label: fmtFraction(rn, rd), color: '#22a355', isResult: true },
        ]
        const maxVal = Math.max(...vals.map(v => Math.abs(v.v)), 1)
        const W = 520, H = 80, padX = 40, lineY = 44
        const toX = v => padX + ((v + maxVal) / (2 * maxVal)) * (W - 2 * padX)
        const ticks = []
        for (let i = Math.ceil(-maxVal); i <= Math.floor(maxVal) + 1; i++) ticks.push(i)
        return (
          <Sec title="Number line" sub="Where your fractions sit">
            <p style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.7, marginBottom: 14, fontFamily: "'DM Sans',sans-serif" }}>
              Seeing fractions on a number line helps you understand their relative size and whether your answer is reasonable.
            </p>
            <div style={{ background: 'var(--bg-raised)', borderRadius: 10, padding: '12px 8px', border: '0.5px solid var(--border)', overflowX: 'auto' }}>
              <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block', minWidth: 280 }}>
                {/* line */}
                <line x1={padX - 10} y1={lineY} x2={W - padX + 10} y2={lineY} stroke="var(--border)" strokeWidth="2" strokeLinecap="round" />
                {/* arrowheads */}
                <polygon points={`${W-padX+10},${lineY} ${W-padX+4},${lineY-4} ${W-padX+4},${lineY+4}`} fill="var(--border)" />
                <polygon points={`${padX-10},${lineY} ${padX-4},${lineY-4} ${padX-4},${lineY+4}`} fill="var(--border)" />
                {/* tick marks */}
                {ticks.map(t => {
                  const x = toX(t)
                  if (x < padX - 5 || x > W - padX + 5) return null
                  return (
                    <g key={t}>
                      <line x1={x} y1={lineY - 6} x2={x} y2={lineY + 6} stroke="var(--border)" strokeWidth="1.5" />
                      <text x={x} y={lineY + 18} textAnchor="middle" fontSize="10" fill="var(--text-3)">{t}</text>
                    </g>
                  )
                })}
                {/* fraction dots */}
                {vals.map((val, i) => {
                  const x = toX(val.v)
                  const yOffset = i === 0 ? -22 : i === 1 ? -22 : -22
                  const stagger = vals.length > 2 ? (i - 1) * 0 : 0
                  return (
                    <g key={i}>
                      <line x1={x} y1={lineY - (val.isResult ? 10 : 8)} x2={x} y2={lineY} stroke={val.color} strokeWidth="1.5" strokeDasharray={val.isResult ? '' : '3,2'} />
                      <circle cx={x} cy={lineY} r={val.isResult ? 7 : 5} fill={val.color} />
                      <rect x={x - 18} y={lineY - 36} width={36} height={18} rx={5} fill={val.color + '20'} stroke={val.color + '60'} strokeWidth="1" />
                      <text x={x} y={lineY - 24} textAnchor="middle" fontSize="9" fontWeight="700" fill={val.color}>{val.label}</text>
                      {val.isResult && <text x={x} y={lineY + 22} textAnchor="middle" fontSize="9" fill={val.color} fontWeight="700">result</text>}
                    </g>
                  )
                })}
              </svg>
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 10, flexWrap: 'wrap' }}>
              {vals.map((v, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: v.color }} />
                  <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{v.label} = {v.v.toFixed(4).replace(/\.?0+$/,'')}{v.isResult ? ' (result)' : ''}</span>
                </div>
              ))}
            </div>
          </Sec>
        )
      })()}

      {/* ── EQUIVALENT FRACTIONS EXPLORER ────────────────────── */}
      {!error && rn !== undefined && (() => {
        const baseN = rn, baseD = rd
        const equivList = Array.from({ length: 8 }, (_, i) => {
          const mult = i + 1
          return { n: baseN * mult, d: baseD * mult, mult }
        })
        return (
          <Sec title="Equivalent fractions" sub={`All equal to ${fmtFraction(rn, rd)}`}>
            <p style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.7, marginBottom: 14, fontFamily: "'DM Sans',sans-serif" }}>
              These fractions all represent exactly the same value as your result — just written with different numbers. Multiplying both numerator and denominator by the same number never changes the fraction's value.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {equivList.map((e, i) => {
                const pct = Math.min(Math.abs(e.n / e.d), 1) * 100
                return (
                  <button key={i} onClick={() => { setN1(e.n); setD1(e.d) }}
                    style={{ padding: '10px 8px', borderRadius: 10, border: `1.5px solid ${i === 0 ? catColor : 'var(--border-2)'}`, background: i === 0 ? catColor + '10' : 'var(--bg-raised)', cursor: 'pointer', textAlign: 'center', transition: 'border-color .15s' }}
                    onMouseEnter={e2 => e2.currentTarget.style.borderColor = catColor + '80'}
                    onMouseLeave={e2 => e2.currentTarget.style.borderColor = i === 0 ? catColor : 'var(--border-2)'}
                  >
                    <div style={{ fontSize: 13, fontWeight: 700, color: i === 0 ? catColor : 'var(--text)', fontFamily: "'Space Grotesk',sans-serif", marginBottom: 6 }}>
                      {e.n}/{e.d}
                    </div>
                    <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: i === 0 ? catColor : catColor + '60', borderRadius: 2 }} />
                    </div>
                    <div style={{ fontSize: 9, color: 'var(--text-3)', marginTop: 4 }}>×{e.mult}</div>
                  </button>
                )
              })}
            </div>
            <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 12, lineHeight: 1.6, fontStyle: 'italic', margin: '12px 0 0' }}>
              Tap any card to load that fraction into the calculator above.
            </p>
          </Sec>
        )
      })()}

      {/* ── THREE-WAY CONVERTER ───────────────────────────────── */}
      {(() => {
        const [convMode, setConvMode] = useState('fraction')
        const [convN,    setConvN]    = useState(3)
        const [convD,    setConvD]    = useState(4)
        const [convDec,  setConvDec]  = useState('0.75')
        const [convPct,  setConvPct]  = useState('75')

        const fromFraction = (n, d) => {
          if (!d || d === 0) return
          const dec = n / d
          setConvDec(dec.toFixed(6).replace(/\.?0+$/, ''))
          setConvPct((dec * 100).toFixed(4).replace(/\.?0+$/, ''))
        }
        const fromDecimal = (val) => {
          setConvDec(val)
          const dec = parseFloat(val)
          if (isNaN(dec)) return
          setConvPct((dec * 100).toFixed(4).replace(/\.?0+$/, ''))
          // Convert decimal to fraction
          const tolerance = 1e-6
          let h1=1,h2=0,k1=0,k2=1,b=dec
          for (let i=0;i<50;i++) {
            const a=Math.floor(b); const aux=h1; h1=a*h1+h2; h2=aux; const aux2=k1; k1=a*k1+k2; k2=aux2
            if (Math.abs(dec-h1/k1)<tolerance) break; b=1/(b-a)
          }
          setConvN(h1); setConvD(k1)
        }
        const fromPercent = (val) => {
          setConvPct(val)
          const pctNum = parseFloat(val)
          if (isNaN(pctNum)) return
          const dec = pctNum / 100
          setConvDec(dec.toFixed(6).replace(/\.?0+$/, ''))
          const tolerance = 1e-6
          let h1=1,h2=0,k1=0,k2=1,b=dec
          for (let i=0;i<50;i++) {
            const a=Math.floor(b); const aux=h1; h1=a*h1+h2; h2=aux; const aux2=k1; k1=a*k1+k2; k2=aux2
            if (Math.abs(dec-h1/k1)<tolerance) break; b=1/(b-a)
          }
          setConvN(h1); setConvD(k1)
        }

        const inputStyle = (focused) => ({
          width: '100%',
          height: 44,
          border: `1.5px solid ${focused ? catColor : 'var(--border-2)'}`,
          borderRadius: 9,
          background: 'var(--bg-card)',
          color: 'var(--text)',
          fontSize: 17,
          fontWeight: 700,
          textAlign: 'center',
          outline: 'none',
          fontFamily: "'Space Grotesk',sans-serif",
          boxSizing: 'border-box',
          transition: 'border-color .15s',
        })
        const [f1,setF1]=useState(false)
        const [f2,setF2]=useState(false)
        const [f3,setF3]=useState(false)
        const [f4,setF4]=useState(false)
        const [f5,setF5]=useState(false)

        return (
          <Sec title="🔄 Fraction ↔ Decimal ↔ Percentage converter" sub="Type in any form — the others update automatically">
            <p style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.7, marginBottom: 16, fontFamily: "'DM Sans',sans-serif" }}>
              All three forms represent the same number. Edit any field below and the others convert instantly.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr auto 1fr', gap: 10, alignItems: 'center', marginBottom: 14 }}>
              {/* Fraction */}
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: catColor, textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 6, textAlign: 'center' }}>Fraction</div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                  <input type="number" value={convN} onChange={e => { setConvN(parseInt(e.target.value)||0); fromFraction(parseInt(e.target.value)||0, convD) }}
                    onFocus={()=>setF1(true)} onBlur={()=>setF1(false)}
                    style={{ ...inputStyle(f1), width: '80%' }} />
                  <div style={{ width: '60%', height: 2, background: catColor, borderRadius: 1 }} />
                  <input type="number" value={convD} onChange={e => { const v=parseInt(e.target.value)||1; setConvD(v); fromFraction(convN, v) }}
                    onFocus={()=>setF2(true)} onBlur={()=>setF2(false)}
                    style={{ ...inputStyle(f2), width: '80%' }} />
                </div>
              </div>
              <div style={{ fontSize: 22, fontWeight: 300, color: 'var(--text-3)', textAlign: 'center' }}>=</div>
              {/* Decimal */}
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 6, textAlign: 'center' }}>Decimal</div>
                <input type="text" value={convDec} onChange={e => fromDecimal(e.target.value)}
                  onFocus={()=>setF3(true)} onBlur={()=>setF3(false)}
                  style={{ ...inputStyle(f3), borderColor: f3 ? '#f59e0b' : 'var(--border-2)' }} />
              </div>
              <div style={{ fontSize: 22, fontWeight: 300, color: 'var(--text-3)', textAlign: 'center' }}>=</div>
              {/* Percentage */}
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 6, textAlign: 'center' }}>Percentage</div>
                <div style={{ position: 'relative' }}>
                  <input type="text" value={convPct} onChange={e => fromPercent(e.target.value)}
                    onFocus={()=>setF4(true)} onBlur={()=>setF4(false)}
                    style={{ ...inputStyle(f4), borderColor: f4 ? '#10b981' : 'var(--border-2)', paddingRight: 24 }} />
                  <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 16, fontWeight: 700, color: '#10b981' }}>%</span>
                </div>
              </div>
            </div>
            {/* Quick reference presets */}
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 8 }}>Common conversions</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {[
                { n:1,d:2,label:'1/2 = 0.5 = 50%' }, { n:1,d:3,label:'1/3 = 0.333...' }, { n:1,d:4,label:'1/4 = 0.25 = 25%' },
                { n:3,d:4,label:'3/4 = 0.75 = 75%' }, { n:1,d:5,label:'1/5 = 0.2 = 20%' }, { n:2,d:3,label:'2/3 = 0.667...' },
                { n:1,d:8,label:'1/8 = 0.125' }, { n:7,d:8,label:'7/8 = 0.875' },
              ].map((p,i) => (
                <button key={i} onClick={() => { setConvN(p.n); setConvD(p.d); fromFraction(p.n, p.d) }}
                  style={{ padding: '5px 10px', borderRadius: 7, border: `1px solid var(--border-2)`, background: 'var(--bg-raised)', fontSize: 11, color: 'var(--text-2)', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = catColor + '60'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-2)'}
                >{p.label}</button>
              ))}
            </div>
          </Sec>
        )
      })()}

      {/* ── REAL WORLD USES ───────────────────────────────────── */}
      <Sec title="Where fractions actually show up in real life" sub="Why this matters beyond the classroom">
        <p style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.7, marginBottom: 16, fontFamily: "'DM Sans',sans-serif" }}>
          Fractions are not just a school topic — they appear in almost every skilled profession and daily life situation where precision matters. Here are six places you will encounter them.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {REAL_WORLD.map((rw, i) => (
            <div key={i} style={{ padding: '13px 14px', borderRadius: 11, background: rw.color + '08', border: `1px solid ${rw.color}25` }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 20 }}>{rw.icon}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: rw.color }}>{rw.field}</span>
              </div>
              <p style={{ fontSize: 11.5, color: 'var(--text-2)', lineHeight: 1.65, margin: '0 0 8px', fontFamily: "'DM Sans',sans-serif" }}>{rw.desc}</p>
              <div style={{ fontSize: 10, fontWeight: 600, color: rw.color, padding: '4px 9px', background: rw.color + '15', borderRadius: 6, display: 'inline-block' }}>
                Example: {rw.example}
              </div>
            </div>
          ))}
        </div>
      </Sec>

      {/* ── CHEAT SHEET ───────────────────────────────────────── */}
      <Sec title="Quick reference — all four operations" sub="The complete rules on one card">
        <p style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.7, marginBottom: 16, fontFamily: "'DM Sans',sans-serif" }}>
          Each operation has a different method. Here they all are side by side, with the key rule and a worked example. Bookmark this for revision.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {CHEAT_SHEET.map((cs, i) => (
            <div key={i} style={{ borderRadius: 12, border: `1px solid ${cs.color}30`, overflow: 'hidden' }}>
              {/* header */}
              <div style={{ padding: '10px 16px', background: cs.color + '12', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 20, fontWeight: 700, color: cs.color }}>{cs.sym}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: cs.color }}>{cs.op}</span>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: cs.color, background: cs.color + '20', padding: '3px 10px', borderRadius: 20, fontStyle: 'italic' }}>
                  "{cs.mnemonic}"
                </span>
              </div>
              {/* body */}
              <div style={{ padding: '12px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>Rule</div>
                  <div style={{ fontSize: 12, color: 'var(--text)', lineHeight: 1.6 }}>{cs.rule}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>Worked example</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: cs.color, fontFamily: "'Space Grotesk',sans-serif" }}>{cs.example}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 6 }}>
                    {cs.steps.map((s, j) => (
                      <div key={j} style={{ fontSize: 11, color: 'var(--text-3)' }}>
                        <span style={{ fontWeight: 700, color: cs.color }}>{j+1}.</span> {s}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Sec>

      {/* ── FUN FACTS ─────────────────────────────────────────── */}
      <Sec title="⚡ Things worth knowing about fractions">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {FUN_FACTS.map((f, i) => (
            <div key={i} style={{ display: 'flex', gap: 14, padding: '13px 16px', borderRadius: 11, background: 'var(--bg-raised)', border: '0.5px solid var(--border)' }}>
              <span style={{ fontSize: 22, flexShrink: 0 }}>{f.icon}</span>
              <p style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.7, margin: 0, fontFamily: "'DM Sans',sans-serif" }}>{f.fact}</p>
            </div>
          ))}
        </div>
      </Sec>

      {/* ── COMMON MISTAKES ───────────────────────────────────── */}
      <Sec title="⚠️ Common mistakes to avoid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {(MISTAKES[op] || []).map((m, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, padding: '10px 14px', borderRadius: 9, background: '#fee2e210', border: '0.5px solid #ef444420' }}>
              <span style={{ fontSize: 14, flexShrink: 0, color: '#ef4444', fontWeight: 700 }}>✗</span>
              <span style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.6 }}>{m}</span>
            </div>
          ))}
        </div>
      </Sec>

      {/* ── GLOSSARY ──────────────────────────────────────────── */}
      <Sec title="Key terms explained" sub="Tap to expand">
        {GLOSSARY_ITEMS.map((g, i) => (
          <div key={i} style={{ borderBottom: '0.5px solid var(--border)' }}>
            <button onClick={() => setOpenGloss(openGloss === i ? null : i)} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 0', background: 'none', border: 'none', cursor: 'pointer', gap: 12, textAlign: 'left' }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: catColor, flexShrink: 0 }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif" }}>{g.term}</span>
              </div>
              <span style={{ fontSize: 16, color: catColor, flexShrink: 0, display: 'inline-block', transform: openGloss === i ? 'rotate(45deg)' : 'none', transition: 'transform .2s' }}>+</span>
            </button>
            {openGloss === i && (
              <p style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.7, margin: '0 0 12px 18px', fontFamily: "'DM Sans',sans-serif" }}>{g.def}</p>
            )}
          </div>
        ))}
      </Sec>

      {/* ── FAQ ───────────────────────────────────────────────── */}
      <Sec title="Frequently asked questions">
        {FAQ_ITEMS.map((f, i) => (
          <Acc key={i} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} color={catColor} />
        ))}
      </Sec>

    </div>
  )
}
