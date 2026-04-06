import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import FormulaCard from '../../components/calculator/FormulaCard'
import AIHintCard from '../../components/calculator/AIHintCard'

const fmt = v => {
  if (v === null || isNaN(v)) return '—'
  if (!isFinite(v)) return v > 0 ? '+∞' : '-∞'
  const r = parseFloat(v.toFixed(6))
  return r.toString()
}

function makeMatrix(r, c, fill = 0) {
  return Array.from({ length: r }, () => Array(c).fill(fill))
}

function matAdd(A, B, sign = 1) {
  if (A.length !== B.length || A[0].length !== B[0].length) return null
  return A.map((row, i) => row.map((v, j) => v + sign * B[i][j]))
}
function matMul(A, B) {
  if (A[0].length !== B.length) return null
  return A.map((row, i) => B[0].map((_, j) => row.reduce((s, v, k) => s + v * B[k][j], 0)))
}
function scalarMul(A, k) { return A.map(row => row.map(v => v * k)) }
function transpose(A) { return A[0].map((_, j) => A.map(row => row[j])) }

const OPS = ['A + B', 'A − B', 'A × B', 'k × A', 'Aᵀ']

function MatrixInput({ mat, onChange, label, color }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color, marginBottom: 8, fontFamily: "'Space Grotesk',sans-serif" }}>{label}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {mat.map((row, i) => (
          <div key={i} style={{ display: 'flex', gap: 4 }}>
            {row.map((val, j) => (
              <input key={j} type="number" value={val}
                onChange={e => { const m = mat.map(r => [...r]); m[i][j] = +e.target.value || 0; onChange(m) }}
                style={{ width: 48, height: 36, border: '1.5px solid var(--border-2)', borderRadius: 7, textAlign: 'center', fontSize: 14, fontWeight: 700, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', fontFamily: "'Space Grotesk',sans-serif" }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function MatrixDisplay({ mat, label, color }) {
  if (!mat) return (
    <div style={{ padding: '14px 16px', background: '#fee2e2', borderRadius: 10, color: '#b91c1c', fontSize: 12, fontWeight: 600 }}>
      ✗ Dimensions incompatible for this operation
    </div>
  )
  return (
    <div style={{ background: 'var(--bg-card)', border: `1.5px solid ${color}40`, borderRadius: 12, overflow: 'hidden' }}>
      <div style={{ padding: '9px 13px', borderBottom: `1px solid ${color}20`, background: color + '08' }}>
        <span style={{ fontSize: 12, fontWeight: 700, color, fontFamily: "'Space Grotesk',sans-serif" }}>{label}</span>
      </div>
      <div style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {mat.map((row, i) => (
            <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={{ color: 'var(--text-3)', fontSize: 16, width: 10, textAlign: 'center' }}>⌊</span>
              {row.map((v, j) => (
                <div key={j} style={{
                  minWidth: 52, padding: '5px 8px', borderRadius: 6,
                  background: Math.abs(v) > 0 ? color + '12' : 'var(--bg-raised)',
                  border: `0.5px solid ${Math.abs(v) > 0 ? color + '30' : 'var(--border)'}`,
                  textAlign: 'center',
                  fontSize: 14, fontWeight: 700,
                  color: 'var(--text)',  // ← FIXED: always use --text for readability
                  fontFamily: "'Space Grotesk',sans-serif"
                }}>{fmt(v)}</div>
              ))}
              <span style={{ color: 'var(--text-3)', fontSize: 16, width: 10, textAlign: 'center' }}>⌋</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 10, fontSize: 11, color: 'var(--text-3)' }}>{mat.length} × {mat[0].length} matrix</div>
      </div>
    </div>
  )
}

const FAQ = [
  { q: 'When can you add two matrices?', a: 'Matrix addition is only defined when both matrices have exactly the same dimensions (same number of rows and columns). You simply add corresponding elements: (A+B)ᵢⱼ = Aᵢⱼ + Bᵢⱼ. There is no workaround for mismatched dimensions.' },
  { q: 'When can you multiply two matrices?', a: 'Matrix multiplication A × B requires the number of columns in A to equal the number of rows in B. If A is m×n and B is n×p, then A×B is m×p. Note: A×B ≠ B×A in general (multiplication is not commutative).' },
  { q: 'What is a matrix transpose?', a: 'The transpose Aᵀ flips a matrix over its main diagonal — rows become columns and columns become rows. If A is m×n, then Aᵀ is n×m. The transpose appears in many formulas: (AB)ᵀ = BᵀAᵀ, and symmetric matrices satisfy A = Aᵀ.' },
  { q: 'What is scalar multiplication?', a: 'Multiplying a matrix by a scalar (single number) k multiplies every element of the matrix by k. This scales the matrix uniformly. The result has the same dimensions as the original.' },
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

export default function MatrixCalculator({ meta, category }) {
  const C = category?.color || '#3b82f6'
  const [opIdx, setOpIdx] = useState(0)
  const [rowsA, setRowsA] = useState(2)
  const [colsA, setColsA] = useState(2)
  const [rowsB, setRowsB] = useState(2)
  const [colsB, setColsB] = useState(2)
  const [matA, setMatA] = useState([[1, 2], [3, 4]])
  const [matB, setMatB] = useState([[5, 6], [7, 8]])
  const [scalar, setScalar] = useState(2)
  const [openFaq, setOpenFaq] = useState(null)

  const resizeA = (r, c) => { setRowsA(r); setColsA(c); setMatA(makeMatrix(r, c)) }
  const resizeB = (r, c) => { setRowsB(r); setColsB(c); setMatB(makeMatrix(r, c)) }

  let result = null
  if (opIdx === 0) result = matAdd(matA, matB, 1)
  else if (opIdx === 1) result = matAdd(matA, matB, -1)
  else if (opIdx === 2) result = matMul(matA, matB)
  else if (opIdx === 3) result = scalarMul(matA, scalar)
  else if (opIdx === 4) result = transpose(matA)

  const needsB = opIdx < 3

  const hint = result
    ? `Result: ${result.length}×${result[0].length} matrix. Operation: ${OPS[opIdx]}.`
    : `Dimensions incompatible for ${OPS[opIdx]}.`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      <div style={{ background: `linear-gradient(135deg,${C}15,${C}06)`, border: `1px solid ${C}30`, borderRadius: 14, padding: '16px 20px' }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: C, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>Matrix Calculator</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>Addition · Subtraction · Multiplication · Transpose</div>
      </div>

      <CalcShell
        left={<>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 8 }}>Operation</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {OPS.map((op, i) => (
                <button key={i} onClick={() => setOpIdx(i)}
                  style={{ padding: '9px 12px', borderRadius: 9, border: `1.5px solid ${opIdx === i ? C : 'var(--border-2)'}`, background: opIdx === i ? C + '12' : 'var(--bg-raised)', fontSize: 13, fontWeight: opIdx === i ? 700 : 500, color: opIdx === i ? C : 'var(--text)', cursor: 'pointer', textAlign: 'left', fontFamily: "'Space Grotesk',sans-serif" }}>{op}</button>
              ))}
            </div>
          </div>

          {/* Matrix A size */}
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: C, display: 'block', marginBottom: 6 }}>Matrix A size</label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {[['Rows', rowsA, r => resizeA(r, colsA)], ['Cols', colsA, c => resizeA(rowsA, c)]].map(([l, v, set]) => (
                <div key={l} style={{ flex: 1 }}>
                  <label style={{ fontSize: 10, color: 'var(--text-3)', display: 'block', marginBottom: 2 }}>{l}</label>
                  <input type="number" min="1" max="4" value={v} onChange={e => set(Math.min(4, Math.max(1, +e.target.value)))}
                    style={{ width: '100%', height: 34, border: '1px solid var(--border-2)', borderRadius: 7, textAlign: 'center', fontSize: 14, fontWeight: 700, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none' }} />
                </div>
              ))}
            </div>
          </div>

          <MatrixInput mat={matA} onChange={setMatA} label="Matrix A" color={C} />

          {opIdx === 3 && (
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 6 }}>Scalar k</label>
              <input type="number" value={scalar} onChange={e => setScalar(+e.target.value)}
                style={{ width: '100%', height: 44, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 14px', fontSize: 20, fontWeight: 700, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', boxSizing: 'border-box' }} />
            </div>
          )}

          {needsB && (
            <>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#ef4444', display: 'block', marginBottom: 6 }}>Matrix B size</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[['Rows', rowsB, r => resizeB(r, colsB)], ['Cols', colsB, c => resizeB(rowsB, c)]].map(([l, v, set]) => (
                    <div key={l} style={{ flex: 1 }}>
                      <label style={{ fontSize: 10, color: 'var(--text-3)', display: 'block', marginBottom: 2 }}>{l}</label>
                      <input type="number" min="1" max="4" value={v} onChange={e => set(Math.min(4, Math.max(1, +e.target.value)))}
                        style={{ width: '100%', height: 34, border: '1px solid var(--border-2)', borderRadius: 7, textAlign: 'center', fontSize: 14, fontWeight: 700, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none' }} />
                    </div>
                  ))}
                </div>
              </div>
              <MatrixInput mat={matB} onChange={setMatB} label="Matrix B" color="#ef4444" />
            </>
          )}
        </>}

        right={<>
          <MatrixDisplay mat={result} label={`Result: ${OPS[opIdx]}`} color={C} />
          <div style={{ marginTop: 14 }}>
            <AIHintCard hint={hint} />
          </div>
        </>}
      />

      <Sec title="Matrix operation rules" sub="Dimension requirements">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { op: 'A + B / A − B', req: 'A and B must have same dimensions (m×n)', color: C },
            { op: 'A × B', req: 'Cols of A must = Rows of B. A is m×n, B is n×p → result is m×p', color: '#10b981' },
            { op: 'k × A', req: 'Works for any matrix and any scalar k', color: '#f59e0b' },
            { op: 'Aᵀ (Transpose)', req: 'Always valid. Rows↔Cols: m×n becomes n×m', color: '#8b5cf6' },
          ].map((r, i) => (
            <div key={i} style={{ padding: '10px 13px', borderRadius: 9, background: r.color + '08', border: `1px solid ${r.color}25` }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: r.color, marginBottom: 3, fontFamily: "'Space Grotesk',sans-serif" }}>{r.op}</div>
              <div style={{ fontSize: 12, color: 'var(--text-2)' }}>{r.req}</div>
            </div>
          ))}
        </div>
      </Sec>

      <FormulaCard
        formula={'(A+B)ᵢⱼ = Aᵢⱼ + Bᵢⱼ\n(AB)ᵢⱼ = Σₖ Aᵢₖ × Bₖⱼ\n(kA)ᵢⱼ = k × Aᵢⱼ\n(Aᵀ)ᵢⱼ = Aⱼᵢ'}
        variables={[
          { symbol: 'Aᵢⱼ', meaning: 'Element in row i, column j of matrix A' },
          { symbol: 'AB', meaning: 'Matrix product — dot product of rows × columns' },
          { symbol: 'k', meaning: 'Scalar (single number)' },
          { symbol: 'Aᵀ', meaning: 'Transpose — rows become columns' },
        ]}
        explanation="Matrix addition and subtraction work element-by-element and require matching dimensions. Matrix multiplication sums products of row elements with column elements — dimensions must be compatible (cols of A = rows of B). Unlike scalar algebra, AB ≠ BA in general."
      />

      <Sec title="Frequently asked questions">
        {FAQ.map((f, i) => <Acc key={i} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} color={C} />)}
      </Sec>
    </div>
  )
}
