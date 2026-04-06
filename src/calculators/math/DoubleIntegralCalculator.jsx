import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import FormulaCard from '../../components/calculator/FormulaCard'
import AIHintCard from '../../components/calculator/AIHintCard'

function evalFn(expr, x, y) {
  try {
    const clean = expr
      .replace(/\^/g, '**')
      .replace(/sin/g, 'Math.sin')
      .replace(/cos/g, 'Math.cos')
      .replace(/sqrt/g, 'Math.sqrt')
      .replace(/pi/g, 'Math.PI')
      .replace(/e(?![a-zA-Z])/g, 'Math.E')
    // eslint-disable-next-line no-new-func
    return Function('x', 'y', `"use strict"; return (${clean})`)(x, y)
  } catch { return NaN }
}

// Numerical double integration using Simpson's rule
function doubleIntegral(expr, xMin, xMax, yMin, yMax, n = 40) {
  const hx = (xMax - xMin) / n
  const hy = (yMax - yMin) / n
  let total = 0
  for (let i = 0; i <= n; i++) {
    const x = xMin + i * hx
    const wx = i === 0 || i === n ? 1 : i % 2 === 0 ? 2 : 4
    for (let j = 0; j <= n; j++) {
      const y = yMin + j * hy
      const wy = j === 0 || j === n ? 1 : j % 2 === 0 ? 2 : 4
      const fval = evalFn(expr, x, y)
      if (isFinite(fval)) total += wx * wy * fval
    }
  }
  return total * hx * hy / 9
}

const EXAMPLES = [
  { label: '∫∫ 1 dA = area', expr: '1', x1: '0', x2: '3', y1: '0', y2: '2', note: 'Area of 3×2 rectangle = 6' },
  { label: '∫∫ x·y dA', expr: 'x*y', x1: '0', x2: '2', y1: '0', y2: '2', note: 'Should be 4' },
  { label: '∫∫ x²+y² dA', expr: 'x^2+y^2', x1: '0', x2: '1', y1: '0', y2: '1', note: 'Sum of squares' },
  { label: '∫∫ sin(x+y) dA', expr: 'sin(x+y)', x1: '0', x2: '1', y1: '0', y2: '1', note: 'Trig example' },
]

const FAQ = [
  { q: 'What is a double integral and what does it calculate?', a: 'A double integral ∬f(x,y) dA integrates a function of two variables over a 2D region. Geometrically: if f(x,y) ≥ 0, the double integral equals the volume under the surface z=f(x,y) above the region. If f(x,y) = 1, it equals the area of the region. In physics it computes mass (with density), center of mass, moment of inertia, and probability.' },
  { q: 'How does the order of integration work?', a: 'A double integral over a rectangle is computed as two nested single integrals: ∫ from x₁ to x₂ [∫ from y₁ to y₂ f(x,y) dy] dx. The inner integral treats x as a constant and integrates over y. The result (a function of x only) is then integrated over x. By Fubini\'s theorem, you can reverse the order (dx dy vs dy dx) and get the same answer for continuous functions.' },
  { q: 'What is this calculator actually doing?', a: 'This calculator uses 2D Simpson\'s rule — a numerical method. It divides the rectangle into an n×n grid and applies the weighted sum from Simpson\'s 1D rule in both dimensions. With n=40, it evaluates f(x,y) at 1,681 points. The error is O(h⁴) — very small for smooth functions. For exact symbolic answers, you need a CAS like Mathematica or Wolfram Alpha.' },
  { q: 'How do I handle non-rectangular regions?', a: 'For triangular or curved regions, you express the y-bounds as functions of x: ∫ from x₁ to x₂ [∫ from g(x) to h(x) f(x,y) dy] dx. For example, integrating over a triangle with vertices (0,0), (1,0), (0,1): y goes from 0 to (1-x) for each x from 0 to 1. This calculator handles rectangular regions only.' },
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

export default function DoubleIntegralCalculator({ meta, category }) {
  const C = category?.color || '#3b82f6'
  const [expr, setExpr] = useState('x*y')
  const [x1, setX1] = useState(0)
  const [x2, setX2] = useState(2)
  const [y1, setY1] = useState(0)
  const [y2, setY2] = useState(2)
  const [openFaq, setOpenFaq] = useState(null)

  const result = doubleIntegral(expr, x1, x2, y1, y2)
  const area = (x2 - x1) * (y2 - y1)
  const avgValue = area > 0 ? result / area : null
  const fmt = v => v === null || isNaN(v) || !isFinite(v) ? '—' : parseFloat(v.toFixed(8)).toString()

  const hint = `∬ ${expr} dA over [${x1},${x2}]×[${y1},${y2}] ≈ ${fmt(result)}. Area = ${area}. Average value ≈ ${fmt(avgValue)}.`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Plain-English explanation banner */}
      <div style={{ background: `linear-gradient(135deg,${C}15,${C}06)`, border: `1px solid ${C}30`, borderRadius: 14, padding: '16px 20px' }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: C, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Double Integral</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif", marginBottom: 8 }}>∬ f(x, y) dA — integrate over a 2D region</div>
        <div style={{ background: 'var(--bg-card)', borderRadius: 10, padding: '12px 14px', border: '0.5px solid var(--border)' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>📖 What this means, in plain English:</div>
          <div style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.8 }}>
            A double integral adds up the value of <strong style={{ color: C }}>f(x, y)</strong> over every tiny piece of a 2D region.<br />
            <strong>Think of it as:</strong> if f(x, y) is the height of a surface above the xy-plane,<br />
            the double integral = <strong style={{ color: C }}>volume under that surface</strong> above your region.<br />
            If f(x, y) = 1, the result is just the <strong style={{ color: C }}>area</strong> of the region.
          </div>
        </div>
      </div>

      <CalcShell
        left={<>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 6 }}>Function f(x, y)</label>
            <input value={expr} onChange={e => setExpr(e.target.value)} placeholder="e.g. x*y, x^2+y^2, sin(x+y)"
              style={{ width: '100%', height: 48, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 14px', fontSize: 16, fontWeight: 700, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', fontFamily: "'Space Grotesk',sans-serif", boxSizing: 'border-box' }} />
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 5 }}>Use: x, y, +, −, *, /, ^, sin(), cos(), sqrt(), pi</div>
          </div>

          {/* Region bounds — visually clear */}
          <div style={{ background: 'var(--bg-raised)', borderRadius: 11, padding: '14px', marginBottom: 14, border: '0.5px solid var(--border)' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>Integration region (rectangle)</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: C, marginBottom: 6 }}>x range (left → right)</div>
                {[['x₁ (from)', x1, setX1], ['x₂ (to)', x2, setX2]].map(([l, v, set]) => (
                  <div key={l} style={{ marginBottom: 8 }}>
                    <label style={{ fontSize: 10, color: 'var(--text-3)', display: 'block', marginBottom: 3 }}>{l}</label>
                    <input type="number" step="0.5" value={v} onChange={e => set(+e.target.value)}
                      style={{ width: '100%', height: 38, border: `1.5px solid ${C}40`, borderRadius: 8, padding: '0 10px', fontSize: 15, fontWeight: 700, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                ))}
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#ef4444', marginBottom: 6 }}>y range (bottom → top)</div>
                {[['y₁ (from)', y1, setY1], ['y₂ (to)', y2, setY2]].map(([l, v, set]) => (
                  <div key={l} style={{ marginBottom: 8 }}>
                    <label style={{ fontSize: 10, color: 'var(--text-3)', display: 'block', marginBottom: 3 }}>{l}</label>
                    <input type="number" step="0.5" value={v} onChange={e => set(+e.target.value)}
                      style={{ width: '100%', height: 38, border: '1.5px solid #ef444440', borderRadius: 8, padding: '0 10px', fontSize: 15, fontWeight: 700, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                ))}
              </div>
            </div>

            {/* Visual rectangle */}
            <div style={{ padding: '8px 12px', background: C + '08', borderRadius: 8, border: `1px solid ${C}20`, textAlign: 'center' }}>
              <div style={{ fontSize: 12, color: C, fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600 }}>
                Region: x ∈ [{x1}, {x2}] × y ∈ [{y1}, {y2}]
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>Area = {Math.abs(area).toFixed(3)} square units</div>
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 8 }}>Classic examples (click to load)</div>
            {EXAMPLES.map((ex, i) => (
              <button key={i} onClick={() => { setExpr(ex.expr); setX1(+ex.x1); setX2(+ex.x2); setY1(+ex.y1); setY2(+ex.y2) }}
                style={{ display: 'block', width: '100%', padding: '8px 12px', marginBottom: 5, borderRadius: 8, border: '1px solid var(--border-2)', background: 'var(--bg-raised)', cursor: 'pointer', textAlign: 'left' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>{ex.label}</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{ex.note}</div>
              </button>
            ))}
          </div>
        </>}

        right={<>
          {/* Main result */}
          <div style={{ padding: '20px', background: `linear-gradient(135deg, ${C}, ${C}dd)`, borderRadius: 14, textAlign: 'center', marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>
              ∬ {expr} dA
            </div>
            <div style={{ fontSize: 36, fontWeight: 700, color: '#fff', fontFamily: "'Space Grotesk',sans-serif" }}>{fmt(result)}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>numerical result (Simpson's rule, n=40)</div>
          </div>

          <BreakdownTable title="Analysis" rows={[
            { label: '∬ f dA (integral)', value: fmt(result), bold: true, highlight: true, color: C },
            { label: 'Region area', value: fmt(area) },
            { label: 'Average value of f', value: fmt(avgValue) },
            { label: 'x span', value: `${x1} to ${x2} (width ${Math.abs(x2 - x1)})` },
            { label: 'y span', value: `${y1} to ${y2} (height ${Math.abs(y2 - y1)})` },
          ]} />

          <AIHintCard hint={hint} />
        </>}
      />

      {/* Visual explanation of what's happening */}
      <Sec title="What does ∬ f(x, y) dA mean visually?" sub="Intuitive guide">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { icon: '📦', title: 'Volume interpretation', desc: `If f(x,y) ≥ 0, the double integral equals the volume of the 3D solid between the surface z = f(x,y) and the xy-plane over your region.`, color: C },
            { icon: '📐', title: 'Area special case', desc: `When f(x,y) = 1, the double integral just gives the area of your region. Your region [${x1},${x2}]×[${y1},${y2}] has area = ${Math.abs(area).toFixed(3)}.`, color: '#10b981' },
            { icon: '⚖️', title: 'Average value', desc: `The average value of f over the region = (1/Area) × ∬f dA. For your inputs: ${fmt(avgValue)}.`, color: '#f59e0b' },
            { icon: '🔢', title: 'How it is computed', desc: 'Split the region into a 40×40 grid of tiny rectangles. Multiply f(x,y) by each rectangle area and add everything up — that is the integral.', color: '#8b5cf6' },
          ].map((card, i) => (
            <div key={i} style={{ padding: '12px 14px', borderRadius: 10, background: card.color + '08', border: `1px solid ${card.color}25` }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 16 }}>{card.icon}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: card.color }}>{card.title}</span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.65, margin: 0, fontFamily: "'DM Sans',sans-serif" }}>{card.desc}</p>
            </div>
          ))}
        </div>
      </Sec>

      {/* How to evaluate step by step */}
      <Sec title="How to evaluate ∬ x·y dA over [0,2]×[0,2]" sub="Worked example step by step">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { step: 1, label: 'Write as nested integrals', detail: '∫₀² [∫₀² x·y dy] dx', note: 'Inner bracket = integrate over y first, treating x as a constant' },
            { step: 2, label: 'Solve inner integral (over y)', detail: '∫₀² x·y dy = x·[y²/2]₀² = x·(4/2) = 2x', note: 'Integrate x·y with respect to y → x·y²/2, evaluate from 0 to 2' },
            { step: 3, label: 'Now solve outer integral (over x)', detail: '∫₀² 2x dx = [x²]₀² = 4', note: 'Integrate 2x with respect to x → x², evaluate from 0 to 2' },
            { step: 4, label: 'Final answer', detail: '∬ x·y dA = 4', note: 'Confirmed by the numerical result above' },
          ].map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 14px', borderRadius: 10, background: 'var(--bg-raised)', border: '0.5px solid var(--border)' }}>
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: C + '18', color: C, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{s.step}</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif", marginBottom: 3 }}>{s.detail}</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{s.note}</div>
              </div>
            </div>
          ))}
        </div>
      </Sec>

      <FormulaCard
        formula={'∬_R f(x,y) dA = ∫_{x₁}^{x₂} [∫_{y₁}^{y₂} f(x,y) dy] dx\n\nStep 1: Inner integral — integrate over y, treat x as constant\nStep 2: Outer integral — integrate the result over x\n\nIf f(x,y) = 1: result = area of region\nAverage value = (1/Area) × ∬ f dA'}
        variables={[
          { symbol: '∬ f dA', meaning: 'Sum of f(x,y) × tiny area over the whole region' },
          { symbol: 'dA', meaning: 'A tiny piece of area (dx × dy)' },
          { symbol: 'x₁,x₂', meaning: 'Horizontal bounds of the region' },
          { symbol: 'y₁,y₂', meaning: 'Vertical bounds of the region' },
          { symbol: 'Fubini', meaning: 'Theorem: you can reverse dy dx order with same result' },
        ]}
        explanation="A double integral is just a single integral done twice. First integrate over y while treating x as a constant — this gives a function of x only. Then integrate that result over x. The key insight: dA = dx × dy, so we are really splitting the 2D region into infinitely many infinitesimally thin slices."
      />

      <Sec title="Frequently asked questions">
        {FAQ.map((f, i) => <Acc key={i} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} color={C} />)}
      </Sec>
    </div>
  )
}
