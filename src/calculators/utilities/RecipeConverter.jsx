import { useState, useMemo } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'

// Smart fraction display
function toFraction(n) {
  if (n === 0) return '0'
  const fractions = [[1,4],[1,3],[1,2],[2,3],[3,4],[1,8],[3,8],[5,8],[7,8]]
  const whole = Math.floor(n)
  const dec = n - whole
  if (dec < 0.03) return whole > 0 ? `${whole}` : '0'
  if (dec > 0.97) return `${whole + 1}`
  let best = null, bestDiff = 1
  for (const [num, den] of fractions) {
    const diff = Math.abs(dec - num / den)
    if (diff < bestDiff) { bestDiff = diff; best = [num, den] }
  }
  if (bestDiff < 0.05 && best) {
    return whole > 0 ? `${whole} ${best[0]}/${best[1]}` : `${best[0]}/${best[1]}`
  }
  return n.toFixed(2)
}

const DEFAULT_INGREDIENTS = [
  { name: 'All-purpose flour', amount: 2, unit: 'cups' },
  { name: 'Sugar', amount: 1, unit: 'cups' },
  { name: 'Butter', amount: 0.5, unit: 'cups' },
  { name: 'Eggs', amount: 2, unit: '' },
  { name: 'Milk', amount: 0.75, unit: 'cups' },
  { name: 'Baking powder', amount: 1, unit: 'tsp' },
  { name: 'Salt', amount: 0.5, unit: 'tsp' },
]

const WARNINGS = [
  { label: 'Baking powder/soda', note: 'Does not scale linearly — use about 75% of calculated amount for large batches.' },
  { label: 'Salt', note: 'Taste and adjust. Scaling up often needs less salt proportionally.' },
  { label: 'Cook time', note: 'Does not scale linearly with batch size. Check doneness early when making larger amounts.' },
  { label: 'Pan size', note: 'Doubling a recipe may require two pans, not one bigger pan.' },
]

const FAQ = [
  { q: 'Does cooking time scale with recipe size?', a: 'No — cooking time is mainly determined by the thickness of the food, not the total volume. A double batch of cookies baked in the same size pieces will take the same time per sheet. A larger cake loaf will take longer because it is thicker, but not double the time.' },
  { q: 'Do baking ingredients scale exactly?', a: 'Most do, but leavening agents (baking powder, baking soda) and salt do not scale perfectly. When doubling, use about 1.5× the leavening rather than exactly 2×. Too much baking powder makes baked goods taste metallic and rise then collapse.' },
  { q: 'Why might a scaled recipe not turn out the same?', a: 'Beyond ingredient ratios, the cooking vessel size, surface area, and heat distribution all change when you scale. Cookie sheets hold different amounts. Mixing technique becomes harder with larger batches. Chemical reactions in baking are also sensitive to ingredient proportions.' },
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

export default function RecipeConverter({ meta, category }) {
  const C = category?.color || '#0d9488'
  const [originalServings, setOriginalServings] = useState(4)
  const [targetServings, setTargetServings] = useState(8)
  const [ingredients, setIngredients] = useState(DEFAULT_INGREDIENTS)
  const [newName, setNewName] = useState('')
  const [newAmt, setNewAmt] = useState('')
  const [newUnit, setNewUnit] = useState('cups')
  const [openFaq, setOpenFaq] = useState(null)

  const scale = originalServings > 0 ? targetServings / originalServings : 1
  const scaled = ingredients.map(ing => ({
    ...ing,
    scaledAmount: ing.amount * scale,
  }))

  const addIngredient = () => {
    if (!newName) return
    setIngredients([...ingredients, { name: newName, amount: +newAmt || 1, unit: newUnit }])
    setNewName(''); setNewAmt('')
  }

  const update = (i, f, v) => { const n = [...ingredients]; n[i] = { ...n[i], [f]: v }; setIngredients(n) }

  const hint = `Scaling from ${originalServings} to ${targetServings} servings (×${scale.toFixed(2)}). ${ingredients.length} ingredients converted.`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ background: `linear-gradient(135deg,${C}12,${C}06)`, border: `1px solid ${C}30`, borderRadius: 14, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Recipe Scaling</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>New amount = Original × (Target ÷ Original servings)</div>
        </div>
        <div style={{ padding: '8px 18px', background: C + '15', borderRadius: 10, fontSize: 28, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>×{scale.toFixed(2)}</div>
      </div>

      <CalcShell
        left={<>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
            {[['Original servings', originalServings, setOriginalServings], ['Target servings', targetServings, setTargetServings]].map(([l, v, set]) => (
              <div key={l}>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 6 }}>{l}</label>
                <input type="number" min="1" value={v} onChange={e => set(Math.max(1, +e.target.value))}
                  style={{ width: '100%', height: 44, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 14px', fontSize: 17, fontWeight: 700, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', fontFamily: "'Space Grotesk',sans-serif", boxSizing: 'border-box' }} />
              </div>
            ))}
          </div>

          <div style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif" }}>Ingredients</label>
            </div>
            {ingredients.map((ing, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 60px 60px auto', gap: 6, marginBottom: 6, alignItems: 'center' }}>
                <input value={ing.name} onChange={e => update(i, 'name', e.target.value)}
                  style={{ height: 34, border: '1px solid var(--border-2)', borderRadius: 7, padding: '0 8px', fontSize: 12, background: 'var(--bg-card)', color: 'var(--text)' }} />
                <input type="number" value={ing.amount} onChange={e => update(i, 'amount', +e.target.value)}
                  style={{ height: 34, border: '1px solid var(--border-2)', borderRadius: 7, padding: '0 6px', fontSize: 12, fontWeight: 700, background: 'var(--bg-card)', color: 'var(--text)', width: '100%', boxSizing: 'border-box' }} />
                <input value={ing.unit} onChange={e => update(i, 'unit', e.target.value)}
                  style={{ height: 34, border: '1px solid var(--border-2)', borderRadius: 7, padding: '0 6px', fontSize: 12, background: 'var(--bg-card)', color: 'var(--text)', width: '100%', boxSizing: 'border-box' }} />
                <button onClick={() => setIngredients(ingredients.filter((_, j) => j !== i))}
                  style={{ width: 26, height: 26, borderRadius: '50%', border: 'none', background: 'var(--bg-raised)', cursor: 'pointer', color: 'var(--text-3)', fontSize: 14 }}>×</button>
              </div>
            ))}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px 60px auto', gap: 6, marginTop: 8 }}>
              <input placeholder="Ingredient" value={newName} onChange={e => setNewName(e.target.value)}
                style={{ height: 34, border: '1px solid var(--border-2)', borderRadius: 7, padding: '0 8px', fontSize: 12, background: 'var(--bg-card)', color: 'var(--text)' }} />
              <input type="number" placeholder="Amt" value={newAmt} onChange={e => setNewAmt(e.target.value)}
                style={{ height: 34, border: '1px solid var(--border-2)', borderRadius: 7, padding: '0 6px', fontSize: 12, background: 'var(--bg-card)', color: 'var(--text)', width: '100%', boxSizing: 'border-box' }} />
              <input placeholder="unit" value={newUnit} onChange={e => setNewUnit(e.target.value)}
                style={{ height: 34, border: '1px solid var(--border-2)', borderRadius: 7, padding: '0 6px', fontSize: 12, background: 'var(--bg-card)', color: 'var(--text)', width: '100%', boxSizing: 'border-box' }} />
              <button onClick={addIngredient}
                style={{ height: 26, borderRadius: 6, border: `1px solid ${C}`, background: C + '10', color: C, fontSize: 11, fontWeight: 600, cursor: 'pointer', padding: '0 6px' }}>Add</button>
            </div>
          </div>
        </>}
        right={<>
          <div style={{ background: 'var(--bg-card)', border: `1.5px solid ${C}30`, borderRadius: 14, overflow: 'hidden', marginBottom: 14 }}>
            <div style={{ padding: '10px 14px', borderBottom: '0.5px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', fontFamily: "'Space Grotesk',sans-serif" }}>Scaled ingredients ({targetServings} servings)</span>
              <span style={{ fontSize: 11, color: C, fontWeight: 700 }}>×{scale.toFixed(2)}</span>
            </div>
            {scaled.map((ing, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 14px', borderBottom: '0.5px solid var(--border)' }}>
                <span style={{ fontSize: 13, color: 'var(--text)' }}>{ing.name}</span>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>{toFraction(ing.scaledAmount)} {ing.unit}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-3)' }}>was: {toFraction(ing.amount)} {ing.unit}</div>
                </div>
              </div>
            ))}
          </div>
          <AIHintCard hint={hint} />
        </>}
      />

      <Sec title="Scaling warnings" sub="Ingredients that don't scale exactly">
        {WARNINGS.map((w, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, padding: '10px 13px', borderRadius: 9, background: 'var(--bg-raised)', border: '0.5px solid var(--border)', marginBottom: 8 }}>
            <span style={{ fontSize: 14, color: '#f59e0b' }}>⚠️</span>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 3 }}>{w.label}</div>
              <div style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.6 }}>{w.note}</div>
            </div>
          </div>
        ))}
      </Sec>

      <Sec title="Frequently asked questions">
        {FAQ.map((f, i) => <Acc key={i} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} color={C} />)}
      </Sec>
    </div>
  )
}
