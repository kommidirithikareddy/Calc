import { useState } from 'react'
import FormulaCard from '../../components/calculator/FormulaCard'
import AIHintCard from '../../components/calculator/AIHintCard'

const fmt = v => {
  if (v === null || isNaN(v)) return '—'
  if (!isFinite(v)) return v > 0 ? '∞' : '-∞'
  const r = parseFloat(v.toFixed(6))
  return r.toString()
}

function cloneMatrix(m) { return m.map(r => [...r]) }

function gaussElim(aug) {
  const m = cloneMatrix(aug)
  const rows = m.length
  const cols = m[0].length
  const steps = []
  let pivotRow = 0

  for (let col = 0; col < cols - 1 && pivotRow < rows; col++) {
    // Find pivot
    let maxRow = pivotRow
    for (let r = pivotRow + 1; r < rows; r++) {
      if (Math.abs(m[r][col]) > Math.abs(m[maxRow][col])) maxRow = r
    }
    if (Math.abs(m[maxRow][col]) < 1e-10) continue
    if (maxRow !== pivotRow) {
      [m[pivotRow], m[maxRow]] = [m[maxRow], m[pivotRow]]
      steps.push({ type: 'swap', desc: `R${pivotRow+1} ↔ R${maxRow+1}`, matrix: cloneMatrix(m) })
    }

    const pivot = m[pivotRow][col]
    // Eliminate below
    for (let r = pivotRow + 1; r < rows; r++) {
      if (Math.abs(m[r][col]) < 1e-10) continue
      const factor = m[r][col] / pivot
      for (let c = col; c < cols; c++) m[r][c] -= factor * m[pivotRow][c]
      m[r][col] = 0 // avoid float dust
      steps.push({ type: 'elim', desc: `R${r+1} ← R${r+1} − (${parseFloat(factor.toFixed(4))})×R${pivotRow+1}`, matrix: cloneMatrix(m) })
    }
    pivotRow++
  }

  // Back substitution
  const solution = new Array(rows).fill(null)
  const rank = steps.length > 0 ? Math.min(rows, cols - 1) : 0

  for (let r = rows - 1; r >= 0; r--) {
    const nonzero = m[r].slice(0, -1).findIndex(v => Math.abs(v) > 1e-10)
    if (nonzero === -1) continue
    let sum = m[r][cols - 1]
    for (let c = nonzero + 1; c < cols - 1; c++) sum -= m[r][c] * (solution[c] || 0)
    solution[nonzero] = sum / m[r][nonzero]
  }

  return { echelon: m, steps, solution }
}

function MatrixRow({ row, highlight, color, isResult }) {
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center', padding: '3px 0' }}>
      <span style={{ color: 'var(--text-3)', fontSize: 16, width: 12 }}>|</span>
      {row.slice(0, -1).map((v, j) => (
        <div key={j} style={{
          minWidth: 54, padding: '5px 8px', borderRadius: 6, textAlign: 'center',
          background: highlight ? color + '12' : 'var(--bg-raised)',
          border: `0.5px solid ${highlight ? color + '30' : 'var(--border)'}`,
          fontSize: 13, fontWeight: 700, color: 'var(--text)', fontFamily: "'Space Grotesk',sans-serif"
        }}>{fmt(v)}</div>
      ))}
      <span style={{ color: 'var(--text-3)', fontSize: 14, margin: '0 4px' }}>|</span>
      <div style={{
        minWidth: 54, padding: '5px 8px', borderRadius: 6, textAlign: 'center',
        background: '#3b82f610', border: '0.5px solid #3b82f630',
        fontSize: 13, fontWeight: 700, color: 'var(--text)', fontFamily: "'Space Grotesk',sans-serif"
      }}>{fmt(row[row.length - 1])}</div>
      <span style={{ color: 'var(--text-3)', fontSize: 16, width: 12 }}>|</span>
    </div>
  )
}

const FAQ = [
  { q: 'What is Gaussian elimination?', a: 'Gaussian elimination transforms an augmented matrix [A|b] into row echelon form using three elementary row operations: swap two rows, multiply a row by a nonzero scalar, add a multiple of one row to another. The goal is to create zeros below each pivot, making back-substitution straightforward.' },
  { q: 'What are the three elementary row operations?', a: '(1) Row swap: R_i ↔ R_j. (2) Row scaling: R_i ← k×R_i (k≠0). (3) Row replacement: R_i ← R_i + k×R_j. These operations do not change the solution set of the linear system — they just simplify the matrix representation.' },
  { q: 'What is a pivot?', a: 'A pivot is the first nonzero entry in a row of the echelon form. During elimination, we choose the row with the largest absolute value in the current column as the pivot (partial pivoting) to minimize round-off errors. The pivot is used to eliminate all entries below it in the same column.' },
  { q: 'What does it mean if the system has no solution or infinitely many?', a: 'No solution (inconsistent): a row of zeros in the coefficient part but nonzero in the RHS: [0 0 | 5]. Infinitely many solutions: more variables than pivot columns — the extra variables are "free" parameters. Unique solution: same number of pivots as variables.' },
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

export default function GaussEliminationCalculator({ meta, category }) {
  const C = category?.color || '#3b82f6'
  const [size, setSize] = useState(3)
  const [aug, setAug] = useState([
    [2, 1, -1, 8],
    [-3, -1, 2, -11],
    [-2, 1, 2, -3],
  ])
  const [showSteps, setShowSteps] = useState(true)
  const [openFaq, setOpenFaq] = useState(null)

  const updateCell = (r, c, val) => {
    const m = aug.map(row => [...row])
    m[r][c] = +val || 0
    setAug(m)
  }

  const resizeSystem = (n) => {
    setSize(n)
    setAug(Array.from({ length: n }, (_, i) => Array.from({ length: n + 1 }, (_, j) => aug[i]?.[j] || 0)))
  }

  const { echelon, steps, solution } = gaussElim(aug)
  const vars = Array.from({ length: size }, (_, i) => String.fromCharCode(120 + i)) // x, y, z, ...
  const hasSolution = solution.every(v => v !== null)

  const hint = hasSolution
    ? `Solution: ${vars.map((v, i) => `${v} = ${fmt(solution[i])}`).join(', ')}`
    : `System may have no solution or infinitely many solutions.`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      <div style={{ background: `linear-gradient(135deg,${C}15,${C}06)`, border: `1px solid ${C}30`, borderRadius: 14, padding: '16px 20px' }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: C, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>Gaussian Elimination</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>Row reduction to echelon form · back substitution</div>
      </div>

      {/* Input augmented matrix */}
      <Sec title="Enter augmented matrix [A | b]" sub="Coefficient matrix + constants">
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 14 }}>
          <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)' }}>System size:</label>
          <div style={{ display: 'flex', gap: 5 }}>
            {[2, 3, 4].map(n => (
              <button key={n} onClick={() => resizeSystem(n)}
                style={{ padding: '6px 14px', borderRadius: 7, border: `1.5px solid ${size === n ? C : 'var(--border-2)'}`, background: size === n ? C + '12' : 'var(--bg-raised)', fontSize: 13, fontWeight: size === n ? 700 : 400, color: size === n ? C : 'var(--text)', cursor: 'pointer' }}>{n}×{n}</button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {/* Header */}
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <div style={{ width: 12 }} />
            {vars.map(v => <div key={v} style={{ minWidth: 54, textAlign: 'center', fontSize: 11, fontWeight: 700, color: C }}>{v}</div>)}
            <div style={{ width: 20 }} />
            <div style={{ minWidth: 54, textAlign: 'center', fontSize: 11, fontWeight: 700, color: '#3b82f6' }}>b</div>
          </div>
          {aug.map((row, r) => (
            <div key={r} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={{ color: 'var(--text-3)', fontSize: 14, width: 12 }}>R{r+1}</span>
              {row.map((val, c) => (
                <input key={c} type="number" value={val} onChange={e => updateCell(r, c, e.target.value)}
                  style={{
                    minWidth: 54, width: 54, height: 40, border: `1.5px solid ${c === size ? '#3b82f640' : C + '30'}`,
                    borderRadius: 8, textAlign: 'center', fontSize: 15, fontWeight: 700,
                    color: 'var(--text)', background: c === size ? '#3b82f608' : 'var(--bg-card)',
                    outline: 'none', fontFamily: "'Space Grotesk',sans-serif"
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </Sec>

      {/* Solution */}
      <Sec title="Solution" sub={hasSolution ? 'Unique solution found' : 'Check for consistency'}>
        {hasSolution ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 10 }}>
            {vars.map((v, i) => (
              <div key={i} style={{ padding: '14px 16px', borderRadius: 12, background: C + '10', border: `1.5px solid ${C}30`, textAlign: 'center' }}>
                <div style={{ fontSize: 13, color: C, marginBottom: 4, fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700 }}>{v} =</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', fontFamily: "'Space Grotesk',sans-serif" }}>{fmt(solution[i])}</div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '14px 16px', background: '#fef3c7', borderRadius: 10, border: '1px solid #f59e0b30', fontSize: 13, color: '#92400e' }}>
            ⚠️ System may have no unique solution. Check echelon form for zero rows.
          </div>
        )}
      </Sec>

      {/* Row echelon form */}
      <Sec title="Row echelon form" sub="Result after elimination">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {echelon.map((row, r) => <MatrixRow key={r} row={row} highlight={false} color={C} />)}
        </div>
      </Sec>

      {/* Steps */}
      <Sec title={`Elimination steps (${steps.length} operations)`} sub="Click to see each step">
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <button onClick={() => setShowSteps(!showSteps)}
            style={{ padding: '7px 14px', borderRadius: 8, border: `1px solid ${C}40`, background: C + '12', color: C, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
            {showSteps ? 'Hide' : 'Show'} all steps
          </button>
        </div>
        {showSteps && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {steps.map((step, si) => (
              <div key={si} style={{ background: 'var(--bg-raised)', borderRadius: 10, border: '0.5px solid var(--border)', overflow: 'hidden' }}>
                <div style={{ padding: '8px 12px', background: C + '10', borderBottom: '0.5px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)' }}>Step {si + 1}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>{step.desc}</span>
                </div>
                <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {step.matrix.map((row, r) => <MatrixRow key={r} row={row} highlight={false} color={C} />)}
                </div>
              </div>
            ))}
          </div>
        )}
      </Sec>

      <FormulaCard
        formula={'Ax = b → [A|b] → row echelon form\nR_i ↔ R_j (swap)\nR_i ← k×R_i (scale)\nR_i ← R_i + k×R_j (replace)'}
        variables={[
          { symbol: 'A', meaning: 'Coefficient matrix' },
          { symbol: 'b', meaning: 'Right-hand side vector' },
          { symbol: 'x', meaning: 'Solution vector [x, y, z, ...]' },
          { symbol: 'pivot', meaning: 'First nonzero entry in each row' },
        ]}
        explanation="Gaussian elimination reduces the augmented matrix to upper triangular (row echelon) form by systematic elimination below each pivot. Back substitution then solves from the last equation upward. Partial pivoting (choosing the largest pivot) is used for numerical stability."
      />

      <Sec title="Frequently asked questions">
        {FAQ.map((f, i) => <Acc key={i} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} color={C} />)}
      </Sec>
      <AIHintCard hint={hint} />
    </div>
  )
}
