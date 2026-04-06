import { useState, useMemo, useRef } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import FormulaCard from '../../components/calculator/FormulaCard'
import AIHintCard from '../../components/calculator/AIHintCard'

// Safe math evaluator
function evalFn(expr, x) {
  try {
    const clean = expr
      .replace(/\^/g, '**')
      .replace(/sin/g, 'Math.sin')
      .replace(/cos/g, 'Math.cos')
      .replace(/tan/g, 'Math.tan')
      .replace(/sqrt/g, 'Math.sqrt')
      .replace(/abs/g, 'Math.abs')
      .replace(/log/g, 'Math.log10')
      .replace(/ln/g, 'Math.log')
      .replace(/exp/g, 'Math.exp')
      .replace(/pi/g, 'Math.PI')
      .replace(/e(?![a-zA-Z])/g, 'Math.E')
    // eslint-disable-next-line no-new-func
    return Function('x', `"use strict"; return (${clean})`)(x)
  } catch { return NaN }
}

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6']
const PRESETS = [
  { label: 'Sine', expr: 'sin(x)' },
  { label: 'Cosine', expr: 'cos(x)' },
  { label: 'x²', expr: 'x^2' },
  { label: 'x³', expr: 'x^3' },
  { label: '√x', expr: 'sqrt(x)' },
  { label: 'ln(x)', expr: 'ln(x)' },
  { label: '1/x', expr: '1/x' },
  { label: 'x sin(x)', expr: 'x*sin(x)' },
]

const W = 500, H = 320

function Graph({ functions, xMin, xMax, yMin, yMax }) {
  const toSX = x => ((x - xMin) / (xMax - xMin)) * W
  const toSY = y => H - ((y - yMin) / (yMax - yMin)) * H

  // Grid lines
  const xStep = (xMax - xMin) / 8
  const yStep = (yMax - yMin) / 6
  const xGrids = [], yGrids = []
  for (let x = Math.ceil(xMin / xStep) * xStep; x <= xMax; x += xStep) xGrids.push(x)
  for (let y = Math.ceil(yMin / yStep) * yStep; y <= yMax; y += yStep) yGrids.push(y)

  const originX = toSX(0)
  const originY = toSY(0)

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block', borderRadius: 10, background: 'var(--bg-raised)', border: '1px solid var(--border)' }}>
      {/* Grid */}
      {xGrids.map((x, i) => <line key={i} x1={toSX(x)} y1={0} x2={toSX(x)} y2={H} stroke="var(--border)" strokeWidth="0.5" />)}
      {yGrids.map((y, i) => <line key={i} x1={0} y1={toSY(y)} x2={W} y2={toSY(y)} stroke="var(--border)" strokeWidth="0.5" />)}

      {/* Axes */}
      {originX >= 0 && originX <= W && <line x1={originX} y1={0} x2={originX} y2={H} stroke="var(--text-3)" strokeWidth="1.5" />}
      {originY >= 0 && originY <= H && <line x1={0} y1={originY} x2={W} y2={originY} stroke="var(--text-3)" strokeWidth="1.5" />}

      {/* Axis labels */}
      {xGrids.filter((x, i) => i % 2 === 0 && Math.abs(x) > 0.01).map((x, i) => (
        <text key={i} x={toSX(x)} y={Math.min(H - 4, originY + 14)} textAnchor="middle" fontSize="9" fill="var(--text-3)" fontFamily="monospace">{x.toFixed(1)}</text>
      ))}
      {yGrids.filter((y, i) => i % 2 === 0 && Math.abs(y) > 0.01).map((y, i) => (
        <text key={i} x={Math.max(4, originX + 4)} y={toSY(y) + 3} fontSize="9" fill="var(--text-3)" fontFamily="monospace">{y.toFixed(1)}</text>
      ))}

      {/* Curves */}
      {functions.map((fn, fi) => {
        if (!fn.expr.trim()) return null
        const steps = 400
        const pts = []
        let path = ''
        let lastValid = false
        for (let i = 0; i <= steps; i++) {
          const x = xMin + (i / steps) * (xMax - xMin)
          const y = evalFn(fn.expr, x)
          const sx = toSX(x)
          const sy = toSY(y)
          const valid = isFinite(y) && sy > -50 && sy < H + 50
          if (valid) {
            path += (lastValid ? 'L' : 'M') + `${sx.toFixed(2)},${sy.toFixed(2)}`
          }
          lastValid = valid
        }
        return path ? <path key={fi} d={path} fill="none" stroke={fn.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /> : null
      })}

      {/* Origin dot */}
      {originX >= 0 && originX <= W && originY >= 0 && originY <= H && (
        <circle cx={originX} cy={originY} r="3" fill="var(--text-3)" />
      )}
    </svg>
  )
}

const FAQ = [
  { q: 'What functions can I plot?', a: 'Supported: sin(x), cos(x), tan(x), sqrt(x), abs(x), log(x) (log base 10), ln(x) (natural log), exp(x) (e^x). Use ^ for powers: x^2, x^3. Use * for multiplication: 2*x. Constants: pi, e. Examples: sin(2*x), x^2 - 4, exp(-x^2), 1/(1+exp(-x)).' },
  { q: 'How do I adjust the view range?', a: 'Change x-min/x-max to zoom in or out horizontally. Change y-min/y-max to control the vertical range. For trig functions, [-6.28, 6.28] (±2π) shows a full period. For parabolas, [-5, 5] works well.' },
  { q: 'Can I plot multiple functions?', a: 'Yes — click "Add function" to add up to 5 functions. Each is automatically assigned a different color. Use this to compare functions, find intersections, or visualize transformations.' },
  { q: 'Why does part of my function not appear?', a: 'The function might be undefined in part of the range. log(x) and sqrt(x) are undefined for x ≤ 0. tan(x) has vertical asymptotes at ±π/2. 1/x is undefined at x=0. The calculator automatically skips undefined points.' },
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

export default function GraphingCalculator({ meta, category }) {
  const C = category?.color || '#3b82f6'
  const [functions, setFunctions] = useState([{ expr: 'sin(x)', color: COLORS[0] }])
  const [xMin, setXMin] = useState(-6.28)
  const [xMax, setXMax] = useState(6.28)
  const [yMin, setYMin] = useState(-3)
  const [yMax, setYMax] = useState(3)
  const [openFaq, setOpenFaq] = useState(null)

  const addFn = () => {
    if (functions.length >= 5) return
    setFunctions(f => [...f, { expr: '', color: COLORS[f.length] }])
  }
  const removeFn = i => setFunctions(f => f.filter((_, j) => j !== i))
  const updateFn = (i, val) => setFunctions(f => f.map((fn, j) => j === i ? { ...fn, expr: val } : fn))

  // Find intercepts for first function
  const intercepts = useMemo(() => {
    const fn = functions[0]?.expr
    if (!fn) return { x: [], y: null }
    const yIntercept = evalFn(fn, 0)
    const xInts = []
    const steps = 1000
    for (let i = 0; i < steps; i++) {
      const x1 = xMin + (i / steps) * (xMax - xMin)
      const x2 = xMin + ((i + 1) / steps) * (xMax - xMin)
      const y1 = evalFn(fn, x1)
      const y2 = evalFn(fn, x2)
      if (isFinite(y1) && isFinite(y2) && y1 * y2 < 0) {
        // Binary search for root
        let lo = x1, hi = x2
        for (let k = 0; k < 20; k++) {
          const mid = (lo + hi) / 2
          if (evalFn(fn, lo) * evalFn(fn, mid) < 0) hi = mid; else lo = mid
        }
        const root = (lo + hi) / 2
        if (!xInts.some(r => Math.abs(r - root) < 0.01)) xInts.push(root)
      }
    }
    return { x: xInts.slice(0, 5), y: isFinite(yIntercept) ? yIntercept : null }
  }, [functions, xMin, xMax])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      <div style={{ background: `linear-gradient(135deg,${C}15,${C}06)`, border: `1px solid ${C}30`, borderRadius: 14, padding: '16px 20px' }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: C, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>Graphing Calculator</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>Plot functions, find intercepts & intersections</div>
      </div>

      {/* Graph */}
      <Sec title="Graph" sub={`x: [${xMin}, ${xMax}] · y: [${yMin}, ${yMax}]`}>
        <Graph functions={functions} xMin={xMin} xMax={xMax} yMin={yMin} yMax={yMax} />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 12 }}>
          {functions.filter(f => f.expr).map((fn, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 20, background: fn.color + '15', border: `1px solid ${fn.color}40` }}>
              <div style={{ width: 10, height: 2, background: fn.color, borderRadius: 2 }} />
              <span style={{ fontSize: 12, color: fn.color, fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600 }}>y = {fn.expr}</span>
            </div>
          ))}
        </div>
      </Sec>

      <CalcShell
        left={<>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 10 }}>Functions</div>
            {functions.map((fn, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: fn.color, flexShrink: 0 }} />
                <input
                  value={fn.expr} onChange={e => updateFn(i, e.target.value)}
                  placeholder="e.g. sin(x), x^2"
                  style={{ flex: 1, height: 40, border: '1.5px solid var(--border-2)', borderRadius: 8, padding: '0 12px', fontSize: 14, fontWeight: 600, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', fontFamily: "'Space Grotesk',sans-serif" }}
                />
                {functions.length > 1 && (
                  <button onClick={() => removeFn(i)} style={{ padding: '6px 10px', borderRadius: 7, border: '1px solid var(--border-2)', background: 'var(--bg-raised)', cursor: 'pointer', fontSize: 12, color: 'var(--text-3)' }}>✕</button>
                )}
              </div>
            ))}
            {functions.length < 5 && (
              <button onClick={addFn} style={{ padding: '8px 14px', borderRadius: 8, border: `1.5px dashed ${C}50`, background: C + '08', color: C, fontSize: 12, fontWeight: 600, cursor: 'pointer', width: '100%' }}>+ Add function</button>
            )}
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 8 }}>Quick presets</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}>
              {PRESETS.map((p, i) => (
                <button key={i} onClick={() => setFunctions([{ expr: p.expr, color: COLORS[0] }])}
                  style={{ padding: '6px 8px', borderRadius: 7, border: `1px solid ${functions[0]?.expr === p.expr ? C : 'var(--border-2)'}`, background: functions[0]?.expr === p.expr ? C + '12' : 'var(--bg-raised)', cursor: 'pointer', fontSize: 12, color: functions[0]?.expr === p.expr ? C : 'var(--text)', fontFamily: "'Space Grotesk',sans-serif" }}>{p.label}</button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 8 }}>X range</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[['x min', xMin, setXMin], ['x max', xMax, setXMax]].map(([l, v, set]) => (
                <div key={l}>
                  <label style={{ fontSize: 10, color: 'var(--text-3)', display: 'block', marginBottom: 3 }}>{l}</label>
                  <input type="number" step="0.5" value={v} onChange={e => set(+e.target.value)}
                    style={{ width: '100%', height: 36, border: '1px solid var(--border-2)', borderRadius: 7, padding: '0 10px', fontSize: 13, fontWeight: 700, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 8 }}>Y range</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[['y min', yMin, setYMin], ['y max', yMax, setYMax]].map(([l, v, set]) => (
                <div key={l}>
                  <label style={{ fontSize: 10, color: 'var(--text-3)', display: 'block', marginBottom: 3 }}>{l}</label>
                  <input type="number" step="0.5" value={v} onChange={e => set(+e.target.value)}
                    style={{ width: '100%', height: 36, border: '1px solid var(--border-2)', borderRadius: 7, padding: '0 10px', fontSize: 13, fontWeight: 700, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              ))}
            </div>
          </div>
        </>}

        right={<>
          <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 12, padding: '14px 16px', marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>Key points — y = {functions[0]?.expr || '...'}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ padding: '9px 12px', borderRadius: 8, background: 'var(--bg-raised)', border: '0.5px solid var(--border)' }}>
                <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 3 }}>y-intercept (x=0)</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>{intercepts.y !== null ? intercepts.y.toFixed(5) : 'undefined'}</div>
              </div>
              <div style={{ padding: '9px 12px', borderRadius: 8, background: 'var(--bg-raised)', border: '0.5px solid var(--border)' }}>
                <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 4 }}>x-intercepts (where y=0)</div>
                {intercepts.x.length > 0
                  ? intercepts.x.map((xi, i) => <div key={i} style={{ fontSize: 14, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>x = {xi.toFixed(5)}</div>)
                  : <div style={{ fontSize: 13, color: 'var(--text-3)' }}>None found in range</div>
                }
              </div>
            </div>
          </div>

          <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 12, padding: '14px 16px', marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>Evaluate at x</div>
            <EvalPoint fn={functions[0]?.expr} color={C} />
          </div>

          <AIHintCard hint={`Plotting y = ${functions.map(f => f.expr).filter(Boolean).join(', ')} over x=[${xMin}, ${xMax}]. Found ${intercepts.x.length} x-intercept(s). y-intercept: ${intercepts.y?.toFixed(4) ?? 'undefined'}.`} />
        </>}
      />

      <FormulaCard
        formula={'Plot: y = f(x)\nIntercepts: f(0) = y-int, f(x)=0 → x-int\nDomain: values of x where f is defined\nRange: all resulting y values'}
        variables={[
          { symbol: 'f(x)', meaning: 'Function of x — evaluates to y' },
          { symbol: 'x-intercept', meaning: 'Where graph crosses x-axis (y = 0)' },
          { symbol: 'y-intercept', meaning: 'Where graph crosses y-axis (x = 0)' },
        ]}
        explanation="Functions are plotted by evaluating f(x) at hundreds of points across the x range and connecting valid results. Discontinuities (like 1/x at x=0) are automatically handled. X-intercepts are found using binary search where the function changes sign."
      />

      <Sec title="Frequently asked questions">
        {FAQ.map((f, i) => <Acc key={i} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} color={C} />)}
      </Sec>
    </div>
  )
}

function EvalPoint({ fn, color }) {
  const [x, setX] = useState(1)
  const y = fn ? evalFn(fn, x) : NaN
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <div style={{ flex: 1 }}>
        <label style={{ fontSize: 10, color: 'var(--text-3)', display: 'block', marginBottom: 3 }}>x =</label>
        <input type="number" step="0.1" value={x} onChange={e => setX(+e.target.value)}
          style={{ width: '100%', height: 36, border: '1px solid var(--border-2)', borderRadius: 7, padding: '0 10px', fontSize: 14, fontWeight: 700, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', boxSizing: 'border-box' }} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 3 }}>f(x) =</div>
        <div style={{ fontSize: 16, fontWeight: 700, color, fontFamily: "'Space Grotesk',sans-serif" }}>{isFinite(y) ? y.toFixed(6) : 'undefined'}</div>
      </div>
    </div>
  )
}
