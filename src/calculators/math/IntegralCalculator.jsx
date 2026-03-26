import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'

const fmt = n => (isNaN(n) || !isFinite(n)) ? '—' : parseFloat(Number(n).toFixed(6)).toString()

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
  const [e, se] = useState(false)
  if (!steps?.length) return null
  const vis = e ? steps : steps.slice(0, 3)
  return (
    <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
      <div style={{ padding: '12px 18px', borderBottom: '0.5px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', fontFamily: "'Space Grotesk',sans-serif" }}>Step-by-step integration</span>
        <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{steps.length} steps</span>
      </div>
      <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {vis.map((s, i) => (
          <div key={i} style={{ display: 'flex', gap: 14 }}>
            <div style={{ width: 26, height: 26, borderRadius: '50%', flexShrink: 0, background: i === steps.length - 1 ? color : color + '18', border: `1.5px solid ${color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: i === steps.length - 1 ? '#fff' : color }}>{i === steps.length - 1 ? '✓' : i + 1}</div>
            <div style={{ flex: 1 }}>
              {s.label && <div style={{ fontSize: 10, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>{s.label}</div>}
              <div style={{ fontSize: 13, fontFamily: "'Space Grotesk',sans-serif", background: 'var(--bg-raised)', padding: '8px 12px', borderRadius: 8, border: `0.5px solid ${i === steps.length - 1 ? color + '40' : 'var(--border)'}` }}>{s.math}</div>
              {s.note && <div style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 4, fontStyle: 'italic' }}>↳ {s.note}</div>}
            </div>
          </div>
        ))}
        {steps.length > 3 && <button onClick={() => se(v => !v)} style={{ padding: '9px', borderRadius: 9, border: `1px solid ${color}30`, background: color + '08', color, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>{e ? '▲ Hide steps' : `▼ Show all ${steps.length} steps`}</button>}
      </div>
    </div>
  )
}

function Inp({ label, value, onChange, color, hint }) {
  const [f, sf] = useState(false)
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif" }}>{label}</label>
        {hint && <span style={{ fontSize: 10, color: 'var(--text-3)' }}>{hint}</span>}
      </div>
      <div style={{ display: 'flex', height: 44, border: `1.5px solid ${f ? color : 'var(--border-2)'}`, borderRadius: 9, overflow: 'hidden', background: 'var(--bg-card)' }}>
        <input type="number" value={value} onChange={e => onChange(Number(e.target.value))}
          onFocus={() => sf(true)} onBlur={() => sf(false)}
          style={{ flex: 1, border: 'none', background: 'transparent', padding: '0 14px', fontSize: 17, fontWeight: 700, color: 'var(--text)', outline: 'none', fontFamily: "'Space Grotesk',sans-serif" }} />
      </div>
    </div>
  )
}

// Numerical integration using Simpson's rule
function integrate(f, a, b, n = 1000) {
  if (a === b) return 0
  const h = (b - a) / n
  let sum = f(a) + f(b)
  for (let i = 1; i < n; i++) {
    sum += (i % 2 === 0 ? 2 : 4) * f(a + i * h)
  }
  return (h / 3) * sum
}

const FUNCTIONS = [
  { id: 'power', label: 'Power xⁿ', icon: 'xⁿ', f: (x, a, n) => a * Math.pow(x, n), fStr: (a, n) => `${a}x^${n}`, antifStr: (a, n) => n === -1 ? `${a}ln|x|` : `${fmt(a / (n + 1))}x^${n + 1}`, antif: (x, a, n) => n === -1 ? a * Math.log(Math.abs(x)) : (a / (n + 1)) * Math.pow(x, n + 1), steps: (a, n, lo, hi) => [{ label: 'Function', math: `∫ ${a}x^${n} dx` }, { label: 'Apply power rule', math: `∫ xⁿ dx = xⁿ⁺¹/(n+1) + C`, note: 'Reverse of differentiation' }, { label: 'Antiderivative', math: n === -1 ? `F(x) = ${a}ln|x| + C` : `F(x) = ${fmt(a / (n + 1))}x^${n + 1} + C` }, { label: 'Apply limits', math: `F(${hi}) − F(${lo})` }, { label: 'Result', math: `= ${fmt(integrate(x => a * Math.pow(x, n), lo, hi))}` }] },
  { id: 'sin', label: 'sin(ax)', icon: 'sin', f: (x, a) => Math.sin(a * x), fStr: (a) => `sin(${a}x)`, antifStr: (a) => `−cos(${a}x)/${a}`, antif: (x, a) => -Math.cos(a * x) / a, steps: (a, n, lo, hi) => [{ label: 'Function', math: `∫ sin(${a}x) dx` }, { label: 'Rule', math: `∫ sin(u) du = −cos(u) + C`, note: 'u-substitution: u = ${a}x' }, { label: 'Antiderivative', math: `F(x) = −cos(${a}x)/${a} + C` }, { label: 'Apply limits', math: `[−cos(${a}x)/${a}] from ${lo} to ${hi}` }, { label: 'Result', math: `= ${fmt(integrate(x => Math.sin(a * x), lo, hi))}` }] },
  { id: 'cos', label: 'cos(ax)', icon: 'cos', f: (x, a) => Math.cos(a * x), fStr: (a) => `cos(${a}x)`, antifStr: (a) => `sin(${a}x)/${a}`, antif: (x, a) => Math.sin(a * x) / a, steps: (a, n, lo, hi) => [{ label: 'Function', math: `∫ cos(${a}x) dx` }, { label: 'Rule', math: `∫ cos(u) du = sin(u) + C` }, { label: 'Antiderivative', math: `F(x) = sin(${a}x)/${a} + C` }, { label: 'Apply limits', math: `[sin(${a}x)/${a}] from ${lo} to ${hi}` }, { label: 'Result', math: `= ${fmt(integrate(x => Math.cos(a * x), lo, hi))}` }] },
  { id: 'exp', label: 'e^(ax)', icon: 'eˣ', f: (x, a) => Math.exp(a * x), fStr: (a) => `e^(${a}x)`, antifStr: (a) => `e^(${a}x)/${a}`, antif: (x, a) => Math.exp(a * x) / a, steps: (a, n, lo, hi) => [{ label: 'Function', math: `∫ e^(${a}x) dx` }, { label: 'Rule', math: `∫ eᵘ du = eᵘ + C`, note: 'eˣ integrates to itself' }, { label: 'Antiderivative', math: `F(x) = e^(${a}x)/${a} + C` }, { label: 'Apply limits', math: `[e^(${a}x)/${a}] from ${lo} to ${hi}` }, { label: 'Result', math: `= ${fmt(integrate(x => Math.exp(a * x), lo, hi))}` }] },
  { id: 'ln', label: 'ln(x)', icon: 'ln', f: (x) => Math.log(Math.abs(x)), fStr: () => `ln(x)`, antifStr: () => `x·ln(x) − x`, antif: (x) => x * Math.log(Math.abs(x)) - x, steps: (a, n, lo, hi) => [{ label: 'Function', math: `∫ ln(x) dx` }, { label: 'Method', math: `Use integration by parts: ∫u dv = uv − ∫v du`, note: 'u = ln(x), dv = dx' }, { label: 'Antiderivative', math: `F(x) = x·ln(x) − x + C` }, { label: 'Apply limits', math: `[x·ln(x)−x] from ${lo} to ${hi}` }, { label: 'Result', math: `= ${fmt(integrate(x => Math.log(Math.abs(x)), lo, hi))}` }] },
]

const INTEGRAL_RULES = [
  { rule: '∫ xⁿ dx', result: 'xⁿ⁺¹/(n+1) + C', cond: 'n ≠ −1' },
  { rule: '∫ 1/x dx', result: 'ln|x| + C', cond: 'x ≠ 0' },
  { rule: '∫ eˣ dx', result: 'eˣ + C', cond: '' },
  { rule: '∫ sin x dx', result: '−cos x + C', cond: '' },
  { rule: '∫ cos x dx', result: 'sin x + C', cond: '' },
  { rule: '∫ sec²x dx', result: 'tan x + C', cond: '' },
  { rule: '∫ aˣ dx', result: 'aˣ/ln(a) + C', cond: 'a > 0, a ≠ 1' },
  { rule: '∫ 1/√(1−x²) dx', result: 'arcsin x + C', cond: '|x| < 1' },
]

const FAQ = [
  { q: 'What is an integral?', a: 'An integral has two forms: the indefinite integral ∫f(x)dx = F(x)+C gives the antiderivative (reverse of differentiation). The definite integral ∫ₐᵇf(x)dx gives the net signed area between the curve and the x-axis from a to b, calculated as F(b)−F(a) by the Fundamental Theorem of Calculus.' },
  { q: 'What is the Fundamental Theorem of Calculus?', a: 'The FTC connects differentiation and integration. Part 1: if F(x) = ∫ₐˣf(t)dt, then F′(x) = f(x). Part 2: ∫ₐᵇf(x)dx = F(b)−F(a), where F is any antiderivative of f. This theorem, discovered independently by Newton and Leibniz, is the foundation of all calculus.' },
  { q: 'What is the constant of integration C?', a: 'When you differentiate any constant, you get 0. So when integrating, there could be any constant added — we write +C to represent all possible antiderivatives. When computing definite integrals, C cancels out: [F(b)+C] − [F(a)+C] = F(b)−F(a).' },
  { q: 'What is u-substitution?', a: 'u-substitution is the integration version of the chain rule. Replace a complicated expression with u, compute du, substitute, integrate in terms of u, then substitute back. Example: ∫2x·sin(x²)dx — let u=x², du=2x dx → ∫sin(u)du = −cos(u)+C = −cos(x²)+C.' },
  { q: 'What is integration by parts?', a: '∫u dv = uv − ∫v du. Used when the integrand is a product of two different types of functions (like x·eˣ, x·sin(x), or ln(x)). LIATE rule suggests choosing u in this order: Logarithm, Inverse trig, Algebraic, Trigonometric, Exponential.' },
]

export default function IntegralCalculator({ meta, category }) {
  const C = category?.color || '#6366f1'
  const [fnId, setFnId] = useState('power')
  const [a, setA] = useState(1)
  const [n, setN] = useState(2)
  const [lo, setLo] = useState(0)
  const [hi, setHi] = useState(3)
  const [openFaq, setFaq] = useState(null)
  const [openGloss, setGl] = useState(null)

  const fn = FUNCTIONS.find(f => f.id === fnId) || FUNCTIONS[0]
  const result = integrate(x => fn.f(x, a, n), lo, hi)
  const fStr = fn.fStr(a, n)
  const antifStr = fn.antifStr(a, n)
  const steps = fn.steps(a, n, lo, hi)

  // Area under curve SVG
  const W = 260, H = 160
  const xMin = lo - 0.5, xMax = hi + 0.5
  const ys = []
  for (let i = 0; i <= 80; i++) { const xi = xMin + (i / 80) * (xMax - xMin); ys.push(fn.f(xi, a, n)) }
  const yMin = Math.min(...ys.filter(isFinite)), yMax = Math.max(...ys.filter(isFinite))
  const toSx = x => ((x - xMin) / (xMax - xMin)) * (W - 20) + 10
  const toSy = y => H - 15 - ((y - yMin) / (Math.max(yMax - yMin, 0.1))) * (H - 30)

  const curvePts = [], fillPts = []
  for (let i = 0; i <= 80; i++) {
    const xi = xMin + (i / 80) * (xMax - xMin)
    const yi = fn.f(xi, a, n)
    if (isFinite(yi)) curvePts.push(`${toSx(xi)},${Math.max(5, Math.min(H - 5, toSy(yi)))}`)
  }
  for (let i = 0; i <= 40; i++) {
    const xi = lo + (i / 40) * (hi - lo)
    const yi = fn.f(xi, a, n)
    if (isFinite(yi)) fillPts.push(`${toSx(xi)},${Math.max(5, Math.min(H - 5, toSy(yi)))}`)
  }
  const loY = Math.max(5, Math.min(H - 5, toSy(0)))
  const fillPoly = fillPts.length > 0 ? `${toSx(lo)},${loY} ${fillPts.join(' ')} ${toSx(hi)},${loY}` : ''

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Formula Banner */}
      <div style={{ background: `linear-gradient(135deg,${C}12,${C}06)`, border: `1px solid ${C}30`, borderRadius: 14, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Definite Integral</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>∫ₐᵇ f(x) dx = F(b) − F(a)</div>
          <div style={{ fontSize: 14, color: C + 'cc', fontFamily: "'Space Grotesk',sans-serif", marginTop: 4 }}>∫ {fStr} dx = {antifStr} + C</div>
        </div>
        <div style={{ padding: '10px 20px', background: C + '18', borderRadius: 12, textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 2 }}>∫{lo}^{hi} {fStr} dx</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>{fmt(result)}</div>
          <div style={{ fontSize: 11, color: 'var(--text-3)' }}>area under curve</div>
        </div>
      </div>

      {/* Function selector */}
      <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 14, padding: '14px 18px' }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 12 }}>Select function to integrate</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 8 }}>
          {FUNCTIONS.map(f => (
            <button key={f.id} onClick={() => setFnId(f.id)}
              style={{ padding: '10px 4px', borderRadius: 10, border: `1.5px solid ${fnId === f.id ? C : 'var(--border-2)'}`, background: fnId === f.id ? C + '12' : 'var(--bg-raised)', cursor: 'pointer', textAlign: 'center' }}>
              <div style={{ fontSize: 13, fontFamily: "'Space Grotesk',sans-serif", color: fnId === f.id ? C : 'var(--text)', fontWeight: 700, marginBottom: 2 }}>{f.icon}</div>
              <div style={{ fontSize: 9, color: fnId === f.id ? C : 'var(--text-3)', fontWeight: fnId === f.id ? 700 : 400 }}>{f.label}</div>
            </button>
          ))}
        </div>
      </div>

      <CalcShell
        left={<>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 16, paddingBottom: 8, borderBottom: '0.5px solid var(--border)' }}>Integration parameters</div>
          <Inp label="Coefficient (a)" value={a} onChange={setA} color={C} hint="multiplies function" />
          {fnId === 'power' && <Inp label="Power (n)" value={n} onChange={setN} color={C} hint="exponent of x" />}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <Inp label="Lower limit (a)" value={lo} onChange={setLo} color={C} hint="from" />
            <Inp label="Upper limit (b)" value={hi} onChange={setHi} color={C} hint="to" />
          </div>

          <div style={{ padding: '12px 14px', background: C + '08', borderRadius: 10, border: `1px solid ${C}20`, marginBottom: 14 }}>
            <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 4 }}>Integral</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>∫{lo}^{hi} {fStr} dx</div>
            <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 4 }}>= [{antifStr}]{lo}^{hi}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C, marginTop: 4 }}>= {fmt(result)}</div>
          </div>

          <div style={{ padding: '12px 14px', background: 'var(--bg-raised)', borderRadius: 10, border: '0.5px solid var(--border)', marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Geometric meaning</div>
            <div style={{ fontSize: 11, color: 'var(--text-2)', lineHeight: 1.6 }}>
              The definite integral = net signed area between f(x) and the x-axis from {lo} to {hi}.
              {result >= 0 ? ' The area is above the x-axis (positive).' : ' Net area is negative — more curve is below the x-axis.'}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button style={{ flex: 1, padding: 13, borderRadius: 10, border: 'none', background: C, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Integrate →</button>
            <button onClick={() => { setA(1); setN(2); setLo(0); setHi(3) }} style={{ padding: '13px 18px', borderRadius: 10, border: '1.5px solid var(--border-2)', background: 'var(--bg-raised)', color: 'var(--text-2)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Reset</button>
          </div>
        </>}

        right={<>
          <div style={{ background: 'var(--bg-card)', border: `1.5px solid ${C}30`, borderRadius: 14, padding: '18px 20px', marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 8 }}>∫{lo}^{hi} {fStr} dx</div>
            <div style={{ fontSize: 42, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>{fmt(result)}</div>
            <div style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 6 }}>Antiderivative: F(x) = {antifStr} + C</div>
          </div>

          {/* Area under curve visualization */}
          <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 14, padding: '14px 18px', marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>Area under f(x) = {fStr}</div>
            <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block', background: 'var(--bg-raised)', borderRadius: 8 }}>
              <line x1={10} y1={loY} x2={W - 10} y2={loY} stroke="var(--border)" strokeWidth="1" />
              {fillPoly && <polygon points={fillPoly} fill={C + '30'} stroke="none" />}
              {curvePts.length > 1 && <polyline points={curvePts.join(' ')} fill="none" stroke={C} strokeWidth="2.5" strokeLinejoin="round" />}
              <line x1={toSx(lo)} y1={10} x2={toSx(lo)} y2={H - 10} stroke={C} strokeWidth="1.5" strokeDasharray="4,3" />
              <line x1={toSx(hi)} y1={10} x2={toSx(hi)} y2={H - 10} stroke={C} strokeWidth="1.5" strokeDasharray="4,3" />
              <text x={toSx(lo)} y={H - 2} textAnchor="middle" fontSize="9" fill={C} fontWeight="700">a={lo}</text>
              <text x={toSx(hi)} y={H - 2} textAnchor="middle" fontSize="9" fill={C} fontWeight="700">b={hi}</text>
              <text x={W / 2} y={20} textAnchor="middle" fontSize="9" fill={C} fontWeight="700">Area = {fmt(result)}</text>
            </svg>
          </div>

          <BreakdownTable title="Integration Summary" rows={[
            { label: 'f(x)', value: fStr, highlight: true },
            { label: 'Antiderivative F(x)', value: antifStr + ' + C', color: C },
            { label: 'Lower limit a', value: fmt(lo) },
            { label: 'Upper limit b', value: fmt(hi) },
            { label: 'F(b)', value: fmt(fn.antif ? fn.antif(hi, a, n) : result) },
            { label: 'F(a)', value: fmt(fn.antif ? fn.antif(lo, a, n) : 0) },
            { label: '∫ₐᵇ f(x)dx = F(b)−F(a)', value: fmt(result), bold: true, color: C, highlight: true },
          ]} />
          <AIHintCard hint={`∫${lo}^${hi} ${fStr} dx = ${fmt(result)}. This equals the net signed area between the curve and the x-axis. Antiderivative: F(x) = ${antifStr} + C.`} color={C} />
        </>}
      />

      <StepsCard steps={steps} color={C} />

      {/* Integral rules reference */}
      <Sec title="Standard integration rules" sub="Complete reference table">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>{['Integral', 'Result', 'Condition'].map(h => (
                <th key={h} style={{ padding: '9px 12px', fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textAlign: 'left', borderBottom: '1px solid var(--border)', background: 'var(--bg-raised)' }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {INTEGRAL_RULES.map((r, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? 'transparent' : 'var(--bg-raised)' }}
                  onMouseEnter={e => e.currentTarget.style.background = C + '08'}
                  onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'var(--bg-raised)'}>
                  <td style={{ padding: '8px 12px', fontSize: 13, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif", borderBottom: '0.5px solid var(--border)' }}>{r.rule}</td>
                  <td style={{ padding: '8px 12px', fontSize: 13, fontWeight: 600, color: 'var(--text)', fontFamily: "'Space Grotesk',sans-serif", borderBottom: '0.5px solid var(--border)' }}>{r.result}</td>
                  <td style={{ padding: '8px 12px', fontSize: 11, color: 'var(--text-3)', borderBottom: '0.5px solid var(--border)' }}>{r.cond}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Sec>

      {/* Integration techniques */}
      <Sec title="Integration techniques — which to use when">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { tech: 'Direct rules', when: 'Standard functions: xⁿ, sin, cos, eˣ, ln', how: 'Look up the antiderivative directly from the table', color: C },
            { tech: 'u-substitution', when: 'Composite functions — inner function has its derivative nearby', how: 'Let u = inner function, du = derivative × dx, substitute', color: '#10b981' },
            { tech: 'Integration by parts', when: 'Product of different function types: x·eˣ, x·sin(x), ln(x)', how: '∫u dv = uv − ∫v du. LIATE to choose u', color: '#f59e0b' },
            { tech: 'Partial fractions', when: 'Rational functions (polynomial ÷ polynomial)', how: 'Decompose into simpler fractions, integrate each part', color: '#8b5cf6' },
          ].map((t, i) => (
            <div key={i} style={{ padding: '12px', borderRadius: 10, background: t.color + '08', border: `1px solid ${t.color}25` }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: t.color, marginBottom: 6 }}>{t.tech}</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>When: {t.when}</div>
              <div style={{ fontSize: 10, color: 'var(--text-3)', lineHeight: 1.5 }}>How: {t.how}</div>
            </div>
          ))}
        </div>
      </Sec>

      {/* Real-world applications */}
      <Sec title="Where integrals appear in real life">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { icon: '📐', title: 'Area & volume', desc: 'Area under curves, volume of revolution (rotating a curve around an axis). Archimedes computed these before calculus existed.', color: C },
            { icon: '⚡', title: 'Work & energy', desc: 'Work = ∫F·dx. If force varies with position (like a spring), you integrate. Hooke\'s law: W = ∫kx dx = ½kx².', color: '#10b981' },
            { icon: '💰', title: 'Present value', desc: 'Continuous discounting: PV = ∫₀ᵀ R(t)e^(−rt) dt. The integral of future cash flows discounted back to today.', color: '#f59e0b' },
            { icon: '📊', title: 'Probability', desc: 'P(a≤X≤b) = ∫ₐᵇ f(x) dx where f(x) is the probability density function. All statistics with continuous distributions uses integration.', color: '#8b5cf6' },
          ].map((rw, i) => (
            <div key={i} style={{ padding: '12px 13px', borderRadius: 11, background: rw.color + '08', border: `1px solid ${rw.color}25` }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}><span style={{ fontSize: 18 }}>{rw.icon}</span><span style={{ fontSize: 12, fontWeight: 700, color: rw.color }}>{rw.title}</span></div>
              <p style={{ fontSize: 11.5, color: 'var(--text-2)', lineHeight: 1.6, margin: 0 }}>{rw.desc}</p>
            </div>
          ))}
        </div>
      </Sec>

      {/* Glossary */}
      <Sec title="Key terms" sub="Tap to expand">
        {[
          { term: 'Definite integral', def: '∫ₐᵇf(x)dx — has specific limits a and b, gives a number (net signed area).' },
          { term: 'Indefinite integral', def: '∫f(x)dx — no limits, gives a family of functions F(x)+C (all antiderivatives).' },
          { term: 'Antiderivative', def: 'F(x) is an antiderivative of f(x) if F′(x) = f(x). Integration is the reverse of differentiation.' },
          { term: 'Constant of integration C', def: 'Added to all indefinite integrals because the derivative of any constant is 0.' },
          { term: 'Net signed area', def: 'Area above x-axis counts positive, below counts negative. The definite integral gives the net total.' },
          { term: "Fundamental Theorem of Calculus", def: 'Links differentiation and integration: ∫ₐᵇf(x)dx = F(b)−F(a). Discovered by Newton and Leibniz.' },
        ].map((g, i) => (
          <div key={i} style={{ borderBottom: '0.5px solid var(--border)' }}>
            <button onClick={() => setGl(openGloss === i ? null : i)} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 0', background: 'none', border: 'none', cursor: 'pointer', gap: 12, textAlign: 'left' }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: C, flexShrink: 0 }} /><span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif" }}>{g.term}</span></div>
              <span style={{ fontSize: 16, color: C, flexShrink: 0, transform: openGloss === i ? 'rotate(45deg)' : 'none', transition: 'transform .2s' }}>+</span>
            </button>
            {openGloss === i && <p style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.7, margin: '0 0 12px 18px' }}>{g.def}</p>}
          </div>
        ))}
      </Sec>

      <Sec title="Frequently asked questions">
        {FAQ.map((f, i) => <Acc key={i} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setFaq(openFaq === i ? null : i)} color={C} />)}
      </Sec>
    </div>
  )
}
