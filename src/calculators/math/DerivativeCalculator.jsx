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
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', fontFamily: "'Space Grotesk',sans-serif" }}>Step-by-step differentiation</span>
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

// Function types with their derivatives
const FUNCTIONS = [
  { id: 'power', label: 'Power', icon: 'xⁿ', f: (x, a, n) => a * Math.pow(x, n), df: (x, a, n) => a * n * Math.pow(x, n - 1), fStr: (a, n) => `${a}x^${n}`, dfStr: (a, n) => `${a * n}x^${n - 1}`, steps: (a, n, x) => [{ label: 'Function', math: `f(x) = ${a}x^${n}` }, { label: 'Power Rule', math: `d/dx[xⁿ] = n·xⁿ⁻¹`, note: 'Bring down the exponent, reduce by 1' }, { label: 'Apply rule', math: `f′(x) = ${a}·${n}·x^(${n}−1) = ${a * n}x^${n - 1}` }, { label: 'Evaluate at x', math: `f′(${x}) = ${a * n}·${x}^${n - 1} = ${fmt(a * n * Math.pow(x, n - 1))}` }] },
  { id: 'sin', label: 'Sine', icon: 'sin(ax)', f: (x, a) => Math.sin(a * x), df: (x, a) => a * Math.cos(a * x), fStr: (a) => `sin(${a}x)`, dfStr: (a) => `${a}cos(${a}x)`, steps: (a, n, x) => [{ label: 'Function', math: `f(x) = sin(${a}x)` }, { label: 'Trig derivative rule', math: `d/dx[sin(u)] = cos(u)·u′`, note: 'Chain rule applied' }, { label: 'u = ${a}x, u′ = ${a}', math: `f′(x) = cos(${a}x) · ${a} = ${a}cos(${a}x)` }, { label: 'Evaluate', math: `f′(${x}) = ${a}cos(${a * x}rad) = ${fmt(a * Math.cos(a * x))}` }] },
  { id: 'cos', label: 'Cosine', icon: 'cos(ax)', f: (x, a) => Math.cos(a * x), df: (x, a) => -a * Math.sin(a * x), fStr: (a) => `cos(${a}x)`, dfStr: (a) => `−${a}sin(${a}x)`, steps: (a, n, x) => [{ label: 'Function', math: `f(x) = cos(${a}x)` }, { label: 'Trig derivative rule', math: `d/dx[cos(u)] = −sin(u)·u′` }, { label: 'Apply', math: `f′(x) = −sin(${a}x) · ${a} = −${a}sin(${a}x)` }, { label: 'Evaluate', math: `f′(${x}) = −${a}sin(${a * x}rad) = ${fmt(-a * Math.sin(a * x))}` }] },
  { id: 'exp', label: 'Exponential', icon: 'eˣ', f: (x, a) => Math.exp(a * x), df: (x, a) => a * Math.exp(a * x), fStr: (a) => `e^(${a}x)`, dfStr: (a) => `${a}e^(${a}x)`, steps: (a, n, x) => [{ label: 'Function', math: `f(x) = e^(${a}x)` }, { label: 'Exponential rule', math: `d/dx[eᵘ] = eᵘ·u′`, note: 'The exponential function is its own derivative' }, { label: 'Apply', math: `f′(x) = e^(${a}x) · ${a} = ${a}e^(${a}x)` }, { label: 'Evaluate', math: `f′(${x}) = ${a}·e^${a * x} = ${fmt(a * Math.exp(a * x))}` }] },
  { id: 'ln', label: 'Natural Log', icon: 'ln(x)', f: (x, a) => a * Math.log(Math.abs(x)), df: (x, a) => a / x, fStr: (a) => `${a}ln(x)`, dfStr: (a) => `${a}/x`, steps: (a, n, x) => [{ label: 'Function', math: `f(x) = ${a}ln(x)` }, { label: 'Log derivative rule', math: `d/dx[ln(x)] = 1/x` }, { label: 'Apply constant multiple', math: `f′(x) = ${a} · 1/x = ${a}/x` }, { label: 'Evaluate', math: `f′(${x}) = ${a}/${x} = ${fmt(a / x)}` }] },
  { id: 'tan', label: 'Tangent', icon: 'tan(ax)', f: (x, a) => Math.tan(a * x), df: (x, a) => a / Math.pow(Math.cos(a * x), 2), fStr: (a) => `tan(${a}x)`, dfStr: (a) => `${a}sec²(${a}x)`, steps: (a, n, x) => [{ label: 'Function', math: `f(x) = tan(${a}x)` }, { label: 'Trig rule', math: `d/dx[tan(u)] = sec²(u)·u′` }, { label: 'Apply', math: `f′(x) = sec²(${a}x) · ${a} = ${a}sec²(${a}x)` }, { label: 'Evaluate', math: `f′(${x}) = ${a}/cos²(${a * x}) = ${fmt(a / Math.pow(Math.cos(a * x), 2))}` }] },
]

const RULES_TABLE = [
  { rule: 'Power Rule', formula: 'd/dx[xⁿ] = nxⁿ⁻¹', example: 'd/dx[x³] = 3x²' },
  { rule: 'Constant Rule', formula: 'd/dx[c] = 0', example: 'd/dx[7] = 0' },
  { rule: 'Constant Multiple', formula: 'd/dx[cf] = c·f′', example: 'd/dx[5x²] = 10x' },
  { rule: 'Sum Rule', formula: 'd/dx[f+g] = f′+g′', example: 'd/dx[x²+x] = 2x+1' },
  { rule: 'Product Rule', formula: 'd/dx[fg] = f′g + fg′', example: 'd/dx[x·sin x] = sin x + x cos x' },
  { rule: 'Quotient Rule', formula: 'd/dx[f/g] = (f′g−fg′)/g²', example: 'd/dx[x/sin x] = (sin x − x cos x)/sin²x' },
  { rule: 'Chain Rule', formula: 'd/dx[f(g)] = f′(g)·g′', example: 'd/dx[sin(x²)] = cos(x²)·2x' },
  { rule: 'sin(x)', formula: 'd/dx[sin x] = cos x', example: 'd/dx[sin x] = cos x' },
  { rule: 'cos(x)', formula: 'd/dx[cos x] = −sin x', example: 'd/dx[cos x] = −sin x' },
  { rule: 'eˣ', formula: 'd/dx[eˣ] = eˣ', example: 'd/dx[e²ˣ] = 2e²ˣ' },
  { rule: 'ln(x)', formula: 'd/dx[ln x] = 1/x', example: 'd/dx[3ln x] = 3/x' },
]

const FAQ = [
  { q: 'What is a derivative?', a: 'The derivative f′(x) measures the instantaneous rate of change of f at x — the slope of the tangent line to the curve at that point. It answers: "How fast is this function changing right now?" Formally, f′(x) = lim(h→0) [f(x+h)−f(x)]/h.' },
  { q: 'What is the difference between average and instantaneous rate of change?', a: 'Average rate of change = [f(b)−f(a)]/(b−a) — the slope of the secant line between two points. Instantaneous rate of change = derivative f′(x) — the slope of the tangent line at one point. The derivative is the limit of the average rate as the interval shrinks to zero.' },
  { q: 'When does a derivative not exist?', a: 'A derivative fails to exist at corners (like |x| at x=0), cusps, vertical tangents, or discontinuities. A function must be continuous at a point to be differentiable there — but continuity alone is not sufficient for differentiability.' },
  { q: 'What is the chain rule and when do I use it?', a: "The chain rule handles composite functions: d/dx[f(g(x))] = f′(g(x))·g′(x). Use it whenever you have a function inside a function — like sin(x²), e^(3x), or (2x+1)⁵. Think: 'derivative of outside × derivative of inside.'" },
  { q: 'What do higher-order derivatives mean?', a: 'The second derivative f″(x) is the derivative of f′(x) — it measures how fast the slope is changing. Positive f″ means concave up (accelerating). Negative f″ means concave down (decelerating). In physics: f = position, f′ = velocity, f″ = acceleration.' },
]

export default function DerivativeCalculator({ meta, category }) {
  const C = category?.color || '#6366f1'
  const [fnId, setFnId] = useState('power')
  const [a, setA] = useState(3)
  const [n, setN] = useState(2)
  const [x, setX] = useState(2)
  const [openFaq, setFaq] = useState(null)
  const [openGloss, setGl] = useState(null)

  const fn = FUNCTIONS.find(f => f.id === fnId) || FUNCTIONS[0]
  const fVal = fn.f(x, a, n)
  const dfVal = fn.df(x, a, n)
  const fStr = fn.fStr(a, n)
  const dfStr = fn.dfStr(a, n)
  const steps = fn.steps(a, n, x)

  // Tangent line SVG
  const W = 260, H = 160
  const pts = []
  const xMin = x - 3, xMax = x + 3
  for (let i = 0; i <= 60; i++) {
    const xi = xMin + (i / 60) * (xMax - xMin)
    const yi = fn.f(xi, a, n)
    const px = (i / 60) * (W - 20) + 10
    const py = H / 2 - (yi - fVal) / (Math.max(Math.abs(dfVal) * 3 + 1, 5)) * (H / 3)
    if (isFinite(py)) pts.push(`${px},${Math.max(5, Math.min(H - 5, py))}`)
  }
  const tPts = []
  for (let i = 0; i <= 20; i++) {
    const xi = xMin + (i / 20) * (xMax - xMin)
    const yi = fVal + dfVal * (xi - x)
    const px = (xi - xMin) / (xMax - xMin) * (W - 20) + 10
    const py = H / 2 - (yi - fVal) / (Math.max(Math.abs(dfVal) * 3 + 1, 5)) * (H / 3)
    tPts.push(`${px},${Math.max(5, Math.min(H - 5, py))}`)
  }
  const cx = (x - xMin) / (xMax - xMin) * (W - 20) + 10

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Formula Banner */}
      <div style={{ background: `linear-gradient(135deg,${C}12,${C}06)`, border: `1px solid ${C}30`, borderRadius: 14, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Derivative — {fn.label}</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>f(x) = {fStr}</div>
          <div style={{ fontSize: 18, fontWeight: 600, color: C + 'cc', fontFamily: "'Space Grotesk',sans-serif", marginTop: 4 }}>f′(x) = {dfStr}</div>
        </div>
        <div style={{ padding: '10px 20px', background: C + '18', borderRadius: 12, textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 2 }}>f′({x})</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>{fmt(dfVal)}</div>
          <div style={{ fontSize: 11, color: 'var(--text-3)' }}>slope at x={x}</div>
        </div>
      </div>

      {/* Function selector */}
      <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 14, padding: '14px 18px' }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 12 }}>Select function type</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 8 }}>
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
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 16, paddingBottom: 8, borderBottom: '0.5px solid var(--border)' }}>
            Parameters
          </div>
          <Inp label="Coefficient (a)" value={a} onChange={setA} color={C} hint="multiplies the function" />
          {fnId === 'power' && <Inp label="Power (n)" value={n} onChange={setN} color={C} hint="exponent" />}
          <Inp label="Evaluate at x" value={x} onChange={setX} color={C} hint="point to evaluate f′" />

          {/* Live result preview */}
          <div style={{ padding: '12px 14px', background: C + '08', borderRadius: 10, border: `1px solid ${C}20`, marginBottom: 14 }}>
            <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 4 }}>Function</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>f(x) = {fStr}</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif", marginTop: 2 }}>f′(x) = {dfStr}</div>
            <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 6 }}>f({x}) = {fmt(fVal)}</div>
            <div style={{ fontSize: 13, color: 'var(--text-2)' }}>f′({x}) = {fmt(dfVal)}</div>
          </div>

          {/* Geometric meaning */}
          <div style={{ padding: '12px 14px', background: 'var(--bg-raised)', borderRadius: 10, border: '0.5px solid var(--border)', marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>What f′(x) means</div>
            {[['Slope', `Tangent line at x=${x} has slope ${fmt(dfVal)}`], ['Rate', `Function changes at ${fmt(dfVal)} units per unit of x`], ['Sign', dfVal > 0 ? 'Positive → function is increasing' : dfVal < 0 ? 'Negative → function is decreasing' : 'Zero → local extremum']].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: C, minWidth: 36 }}>{k}:</span>
                <span style={{ fontSize: 11, color: 'var(--text-2)' }}>{v}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button style={{ flex: 1, padding: 13, borderRadius: 10, border: 'none', background: C, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Differentiate →</button>
            <button onClick={() => { setA(3); setN(2); setX(2) }} style={{ padding: '13px 18px', borderRadius: 10, border: '1.5px solid var(--border-2)', background: 'var(--bg-raised)', color: 'var(--text-2)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Reset</button>
          </div>
        </>}

        right={<>
          {/* Result */}
          <div style={{ background: 'var(--bg-card)', border: `1.5px solid ${C}30`, borderRadius: 14, padding: '18px 20px', marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 8 }}>Derivative at x = {x}</div>
            <div style={{ fontSize: 42, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>{fmt(dfVal)}</div>
            <div style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 6 }}>Tangent line: y = {fmt(dfVal)}(x − {x}) + {fmt(fVal)}</div>
          </div>

          {/* Tangent line graph */}
          <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 14, padding: '14px 18px', marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>f(x) and tangent line at x={x}</div>
            <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block', background: 'var(--bg-raised)', borderRadius: 8 }}>
              <line x1={10} y1={H / 2} x2={W - 10} y2={H / 2} stroke="var(--border)" strokeWidth="1" />
              <line x1={cx} y1={5} x2={cx} y2={H - 5} stroke="var(--border)" strokeWidth="1" strokeDasharray="3,3" />
              {pts.length > 1 && <polyline points={pts.join(' ')} fill="none" stroke={C} strokeWidth="2.5" strokeLinejoin="round" />}
              {tPts.length > 1 && <polyline points={tPts.join(' ')} fill="none" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="5,3" />}
              <circle cx={cx} cy={H / 2} r={5} fill={C} stroke="#fff" strokeWidth="2" />
              <text x={14} y={14} fontSize="9" fill={C} fontWeight="700">f(x)</text>
              <text x={14} y={26} fontSize="9" fill="#ef4444" fontWeight="700">tangent</text>
            </svg>
          </div>

          <BreakdownTable title="Differentiation Summary" rows={[
            { label: 'f(x)', value: fStr, highlight: true },
            { label: 'f′(x)', value: dfStr, bold: true, color: C },
            { label: `f(${x})`, value: fmt(fVal) },
            { label: `f′(${x})`, value: fmt(dfVal), bold: true, color: C, highlight: true },
            { label: 'Tangent slope', value: fmt(dfVal), note: 'at x=' + x },
            { label: 'Tangent intercept', value: `y = ${fmt(dfVal)}x + ${fmt(fVal - dfVal * x)}` },
          ]} />
          <AIHintCard hint={`f(x) = ${fStr} → f′(x) = ${dfStr}. At x=${x}: f′(${x}) = ${fmt(dfVal)}. This is the slope of the tangent line — the function is ${dfVal > 0 ? 'increasing' : dfVal < 0 ? 'decreasing' : 'at a local extremum'} at this point.`} color={C} />
        </>}
      />

      <StepsCard steps={steps} color={C} />

      {/* Differentiation rules reference table */}
      <Sec title="Complete differentiation rules reference" sub="All standard rules">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'DM Sans',sans-serif" }}>
            <thead>
              <tr>{['Rule', 'Formula', 'Example'].map(h => (
                <th key={h} style={{ padding: '9px 12px', fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textAlign: 'left', borderBottom: '1px solid var(--border)', background: 'var(--bg-raised)' }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {RULES_TABLE.map((r, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? 'transparent' : 'var(--bg-raised)' }}
                  onMouseEnter={e => e.currentTarget.style.background = C + '08'}
                  onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'var(--bg-raised)'}>
                  <td style={{ padding: '8px 12px', fontSize: 12, fontWeight: 600, color: 'var(--text)', borderBottom: '0.5px solid var(--border)' }}>{r.rule}</td>
                  <td style={{ padding: '8px 12px', fontSize: 12, color: C, fontFamily: "'Space Grotesk',sans-serif", borderBottom: '0.5px solid var(--border)' }}>{r.formula}</td>
                  <td style={{ padding: '8px 12px', fontSize: 11, color: 'var(--text-3)', borderBottom: '0.5px solid var(--border)' }}>{r.example}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Sec>

      {/* Higher-order derivatives */}
      <Sec title="Higher-order derivatives — f′, f″, f‴..." sub="Derivatives of derivatives">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
          {[{ order: 'f(x)', meaning: 'Position / value', physics: 'Displacement', color: C }, { order: 'f′(x)', meaning: 'Rate of change / slope', physics: 'Velocity', color: '#10b981' }, { order: 'f″(x)', meaning: 'Rate of rate of change', physics: 'Acceleration', color: '#f59e0b' }, { order: 'f‴(x)', meaning: 'Third derivative', physics: 'Jerk (rate of acceleration)', color: '#8b5cf6' }].map((d, i) => (
            <div key={i} style={{ padding: '10px 12px', borderRadius: 9, background: d.color + '08', border: `1px solid ${d.color}25` }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: d.color, fontFamily: "'Space Grotesk',sans-serif", marginBottom: 4 }}>{d.order}</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)', marginBottom: 2 }}>{d.meaning}</div>
              <div style={{ fontSize: 10, color: 'var(--text-3)' }}>Physics: {d.physics}</div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.75, margin: 0 }}>
          For f(x) = {fStr}: f′(x) = {dfStr}. The second derivative tells you whether the function is concave up (f″ &gt; 0) or concave down (f″ &lt; 0). Inflection points occur where f″ changes sign.
        </p>
      </Sec>

      {/* Real-world applications */}
      <Sec title="Where derivatives are used in the real world">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { icon: '🚀', title: 'Physics — velocity & acceleration', desc: 'If s(t) is position, s′(t) is velocity, s″(t) is acceleration. Rockets compute derivatives of position thousands of times per second.', color: C },
            { icon: '📈', title: 'Economics — marginal cost', desc: 'Marginal cost = derivative of total cost function. Marginal revenue = derivative of revenue. Profit is maximized where marginal cost = marginal revenue.', color: '#10b981' },
            { icon: '🤖', title: 'Machine learning — gradient descent', desc: 'Training a neural network requires computing derivatives (gradients) of the loss function with respect to millions of parameters — done by backpropagation.', color: '#f59e0b' },
            { icon: '💊', title: 'Medicine — drug concentration', desc: 'The rate at which a drug concentration changes in blood = derivative of the concentration-time curve. Determines dosing frequency.', color: '#8b5cf6' },
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
          { term: 'Derivative', def: 'The instantaneous rate of change of a function at a point. Equals the slope of the tangent line.' },
          { term: 'Tangent line', def: 'A line that touches the curve at exactly one point and has the same slope as the curve at that point.' },
          { term: 'Differentiable', def: 'A function is differentiable at x if its derivative exists there. Requires continuity, but is stronger.' },
          { term: 'Chain rule', def: 'For composite functions f(g(x)): derivative = f′(g(x)) × g′(x). "Outer times inner derivative."' },
          { term: 'Critical point', def: 'A point where f′(x) = 0 or f′(x) is undefined. Candidate for local maximum or minimum.' },
          { term: 'Inflection point', def: 'Where f″(x) changes sign — the curve switches from concave up to concave down or vice versa.' },
        ].map((g, i) => (
          <div key={i} style={{ borderBottom: '0.5px solid var(--border)' }}>
            <button onClick={() => setGl(openGloss === i ? null : i)} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 0', background: 'none', border: 'none', cursor: 'pointer', gap: 12, textAlign: 'left' }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: C, flexShrink: 0 }} /><span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif" }}>{g.term}</span></div>
              <span style={{ fontSize: 16, color: C, flexShrink: 0, transform: openGloss === i ? 'rotate(45deg)' : 'none', transition: 'transform .2s' }}>+</span>
            </button>
            {openGloss === i && <p style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.7, margin: '0 0 12px 18px', fontFamily: "'DM Sans',sans-serif" }}>{g.def}</p>}
          </div>
        ))}
      </Sec>

      <Sec title="Frequently asked questions">
        {FAQ.map((f, i) => <Acc key={i} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setFaq(openFaq === i ? null : i)} color={C} />)}
      </Sec>
    </div>
  )
}
