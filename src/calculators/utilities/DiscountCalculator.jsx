import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'

const FAQ = [
  { q: 'What is the difference between stacked and combined discounts?', a: 'A combined discount adds the percentages together (e.g. 20% + 10% = 30% off). A stacked discount applies them sequentially — 20% off first, then 10% off the reduced price. Stacked discounts always result in a lower saving than the sum suggests. Two 50% discounts stacked = only 75% off total, not 100%.' },
  { q: 'How do I find what percentage off a sale item is?', a: 'Use the reverse mode: enter the original price and the sale price, and the calculator works out the percentage saved. Formula: ((Original − Sale) ÷ Original) × 100.' },
  { q: 'Is 20% off always a good deal?', a: 'Not necessarily. A 20% discount on an overinflated price may still be more expensive than a competitor\'s normal price. Always compare the final price against alternatives, not just the saving percentage.' },
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

export default function DiscountCalculator({ meta, category }) {
  const C = category?.color || '#0d9488'
  const [mode, setMode]       = useState('single')
  const [orig, setOrig]       = useState(100)
  const [d1, setD1]           = useState(20)
  const [d2, setD2]           = useState(10)
  const [finalP, setFinalP]   = useState(75)
  const [openFaq, setOpenFaq] = useState(null)

  let saving = 0, final = 0, effectivePct = 0, step1 = null
  if (mode === 'single') {
    saving = orig * d1 / 100; final = orig - saving; effectivePct = d1
  } else if (mode === 'stacked') {
    step1 = orig * (1 - d1 / 100)
    final = step1 * (1 - d2 / 100)
    saving = orig - final
    effectivePct = saving / orig * 100
  } else {
    final = finalP; saving = orig - finalP; effectivePct = saving / orig * 100
  }

  const dealLabel = effectivePct >= 50 ? 'Amazing deal' : effectivePct >= 30 ? 'Great deal' : effectivePct >= 20 ? 'Good deal' : effectivePct >= 10 ? 'Fair deal' : 'Small saving'
  const dealColor = effectivePct >= 30 ? '#10b981' : effectivePct >= 15 ? '#3b82f6' : '#f59e0b'

  const hint = `Original $${orig.toFixed(2)}, ${effectivePct.toFixed(1)}% off = save $${saving.toFixed(2)}, pay $${final.toFixed(2)}.`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      <div style={{ background: `linear-gradient(135deg,${C}12,${C}06)`, border: `1px solid ${C}30`, borderRadius: 14, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Discount Formula</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>Final = Original × (1 − Discount%)</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>${final.toFixed(2)}</div>
          <div style={{ fontSize: 12, color: 'var(--text-3)' }}>final price</div>
        </div>
      </div>

      <CalcShell
        left={<>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 8 }}>Discount type</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[['single', 'Single discount'], ['stacked', 'Stacked (two discounts)'], ['reverse', 'Find % off']].map(([m, l]) => (
                <button key={m} onClick={() => setMode(m)}
                  style={{ padding: '9px 14px', borderRadius: 9, border: `1.5px solid ${mode === m ? C : 'var(--border-2)'}`, background: mode === m ? C + '12' : 'var(--bg-raised)', fontSize: 13, fontWeight: mode === m ? 700 : 400, color: mode === m ? C : 'var(--text-2)', cursor: 'pointer', textAlign: 'left' }}>{l}</button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 6 }}>Original price ($)</label>
            <input type="number" value={orig} onChange={e => setOrig(Math.max(0, +e.target.value))}
              style={{ width: '100%', height: 44, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 14px', fontSize: 17, fontWeight: 700, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', fontFamily: "'Space Grotesk',sans-serif", boxSizing: 'border-box' }} />
          </div>

          {(mode === 'single' || mode === 'stacked') && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 8 }}>{mode === 'stacked' ? 'First discount' : 'Discount'}: {d1}%</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                {[5, 10, 15, 20, 25, 30, 40, 50].map(p => (
                  <button key={p} onClick={() => setD1(p)}
                    style={{ padding: '5px 10px', borderRadius: 7, border: `1.5px solid ${d1 === p ? C : 'var(--border-2)'}`, background: d1 === p ? C + '12' : 'var(--bg-raised)', fontSize: 12, fontWeight: d1 === p ? 700 : 500, color: d1 === p ? C : 'var(--text-2)', cursor: 'pointer' }}>{p}%</button>
                ))}
              </div>
              <input type="range" min="0" max="90" step="1" value={d1} onChange={e => setD1(+e.target.value)} style={{ width: '100%', accentColor: C }} />
            </div>
          )}

          {mode === 'stacked' && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 8 }}>Second discount: {d2}%</label>
              <input type="range" min="0" max="90" step="1" value={d2} onChange={e => setD2(+e.target.value)} style={{ width: '100%', accentColor: C }} />
            </div>
          )}

          {mode === 'reverse' && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 6 }}>Sale / final price ($)</label>
              <input type="number" value={finalP} onChange={e => setFinalP(Math.max(0, +e.target.value))}
                style={{ width: '100%', height: 44, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 14px', fontSize: 17, fontWeight: 700, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', fontFamily: "'Space Grotesk',sans-serif", boxSizing: 'border-box' }} />
            </div>
          )}
        </>}

        right={<>
          {/* savings bar */}
          <div style={{ background: 'var(--bg-card)', border: `1.5px solid ${C}30`, borderRadius: 14, padding: '18px 20px', marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 12 }}>Savings</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-3)', marginBottom: 6 }}>
              <span>Original: ${orig.toFixed(2)}</span><span>Final: ${final.toFixed(2)}</span>
            </div>
            <div style={{ height: 14, background: 'var(--border)', borderRadius: 7, overflow: 'hidden', display: 'flex' }}>
              <div style={{ width: `${Math.max(0, 100 - effectivePct).toFixed(1)}%`, background: C, borderRadius: 7, transition: 'width .4s' }} />
              <div style={{ flex: 1, background: '#dcfce7', transition: 'flex .4s' }} />
            </div>
            <div style={{ fontSize: 52, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif", lineHeight: 1, marginTop: 14 }}>${saving.toFixed(2)}</div>
            <div style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 4 }}>you save ({effectivePct.toFixed(1)}%)</div>
            <div style={{ marginTop: 10, display: 'inline-flex', padding: '4px 12px', borderRadius: 20, background: dealColor + '15', border: `1px solid ${dealColor}40`, fontSize: 12, fontWeight: 700, color: dealColor }}>{dealLabel}</div>
          </div>

          {mode === 'stacked' && step1 && (
            <div style={{ background: 'var(--bg-raised)', border: '0.5px solid var(--border)', borderRadius: 10, padding: '12px 14px', marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', marginBottom: 8 }}>HOW STACKING WORKS</div>
              {[
                { label: 'Original price', val: `$${orig.toFixed(2)}` },
                { label: `After first discount (${d1}%)`, val: `$${step1.toFixed(2)}` },
                { label: `After second discount (${d2}%)`, val: `$${final.toFixed(2)}` },
                { label: 'Effective discount', val: `${effectivePct.toFixed(1)}% (not ${d1 + d2}%)` },
              ].map((r, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '0.5px solid var(--border)', fontSize: 12 }}>
                  <span style={{ color: 'var(--text-2)' }}>{r.label}</span>
                  <span style={{ fontWeight: 700, color: i === 3 ? C : 'var(--text)', fontFamily: "'Space Grotesk',sans-serif" }}>{r.val}</span>
                </div>
              ))}
            </div>
          )}

          <BreakdownTable title="Summary" rows={[
            { label: 'Original price', value: `$${orig.toFixed(2)}` },
            { label: 'You save',       value: `$${saving.toFixed(2)}`, color: C },
            { label: 'Final price',    value: `$${final.toFixed(2)}`, bold: true, highlight: true, color: C },
            { label: 'Effective off',  value: `${effectivePct.toFixed(1)}%` },
          ]} />
          <AIHintCard hint={hint} />
        </>}
      />

      <Sec title="Frequently asked questions">
        {FAQ.map((f, i) => <Acc key={i} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} color={C} />)}
      </Sec>
    </div>
  )
}
