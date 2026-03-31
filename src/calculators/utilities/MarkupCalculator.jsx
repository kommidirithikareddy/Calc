import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'

const FAQ = [
  { q: 'What is the difference between markup and margin?', a: 'Markup is calculated from cost: Markup% = (Profit ÷ Cost) × 100. Margin is calculated from selling price: Margin% = (Profit ÷ Price) × 100. A 50% markup gives only a 33.3% margin. They are NOT interchangeable — confusing them is one of the most common pricing mistakes in business.' },
  { q: 'How do I convert markup to margin?', a: 'Margin = Markup ÷ (1 + Markup). So a 50% markup = 50 ÷ 150 = 33.3% margin. Alternatively: Markup = Margin ÷ (1 − Margin). So a 30% margin = 30 ÷ 70 = 42.9% markup.' },
  { q: 'What markup should I use?', a: 'There is no universal answer — it depends on industry, competition, and cost structure. Retail typically uses 50–100% markup (keystone pricing = 100% = double the cost). Restaurants use 200–400%. Custom services can be much higher. Start with competitor pricing and work backwards to your required margin.' },
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

export default function MarkupCalculator({ meta, category }) {
  const C = category?.color || '#0d9488'
  const [mode, setMode] = useState('markup') // 'markup' | 'margin' | 'reverse'
  const [cost, setCost] = useState(60)
  const [markup, setMarkup] = useState(50)
  const [margin, setMargin] = useState(40)
  const [sellPrice, setSellPrice] = useState(100)
  const [openFaq, setOpenFaq] = useState(null)

  let selling = 0, profit = 0, markupPct = 0, marginPct = 0
  if (mode === 'markup') {
    selling = cost * (1 + markup / 100)
    profit = selling - cost
    markupPct = markup
    marginPct = profit / selling * 100
  } else if (mode === 'margin') {
    selling = margin < 100 ? cost / (1 - margin / 100) : 0
    profit = selling - cost
    markupPct = cost > 0 ? profit / cost * 100 : 0
    marginPct = margin
  } else {
    profit = sellPrice - cost
    markupPct = cost > 0 ? profit / cost * 100 : 0
    marginPct = sellPrice > 0 ? profit / sellPrice * 100 : 0
    selling = sellPrice
  }

  const hint = `Cost $${cost}, sell $${selling.toFixed(2)}: markup ${markupPct.toFixed(1)}%, margin ${marginPct.toFixed(1)}%, profit $${profit.toFixed(2)}.`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ background: `linear-gradient(135deg,${C}12,${C}06)`, border: `1px solid ${C}30`, borderRadius: 14, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Markup Formula</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>Selling Price = Cost × (1 + Markup%)</div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>Margin = Profit ÷ Selling Price</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>${selling.toFixed(2)}</div>
          <div style={{ fontSize: 12, color: 'var(--text-3)' }}>selling price</div>
        </div>
      </div>

      <CalcShell
        left={<>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 8 }}>Calculate mode</label>
            {[['markup', 'Markup % → Price'], ['margin', 'Margin % → Price'], ['reverse', 'Cost + Price → Markup']].map(([m, l]) => (
              <button key={m} onClick={() => setMode(m)}
                style={{ display: 'block', width: '100%', padding: '9px 14px', marginBottom: 6, borderRadius: 9, border: `1.5px solid ${mode === m ? C : 'var(--border-2)'}`, background: mode === m ? C + '12' : 'var(--bg-raised)', fontSize: 13, fontWeight: mode === m ? 700 : 400, color: mode === m ? C : 'var(--text)', cursor: 'pointer', textAlign: 'left' }}>{l}</button>
            ))}
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 6 }}>Cost ($)</label>
            <input type="number" value={cost} onChange={e => setCost(Math.max(0, +e.target.value))}
              style={{ width: '100%', height: 44, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 14px', fontSize: 17, fontWeight: 700, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', fontFamily: "'Space Grotesk',sans-serif", boxSizing: 'border-box' }} />
          </div>

          {mode === 'markup' && (
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 8 }}>Markup: {markup}%</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                {[25, 50, 75, 100, 200].map(p => (
                  <button key={p} onClick={() => setMarkup(p)} style={{ padding: '5px 10px', borderRadius: 7, border: `1.5px solid ${markup === p ? C : 'var(--border-2)'}`, background: markup === p ? C + '12' : 'var(--bg-raised)', fontSize: 12, fontWeight: markup === p ? 700 : 500, color: markup === p ? C : 'var(--text-2)', cursor: 'pointer' }}>{p}%</button>
                ))}
              </div>
              <input type="range" min="0" max="400" step="5" value={markup} onChange={e => setMarkup(+e.target.value)} style={{ width: '100%', accentColor: C }} />
            </div>
          )}
          {mode === 'margin' && (
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 8 }}>Margin: {margin}%</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                {[20, 30, 40, 50, 60].map(p => (
                  <button key={p} onClick={() => setMargin(p)} style={{ padding: '5px 10px', borderRadius: 7, border: `1.5px solid ${margin === p ? C : 'var(--border-2)'}`, background: margin === p ? C + '12' : 'var(--bg-raised)', fontSize: 12, fontWeight: margin === p ? 700 : 500, color: margin === p ? C : 'var(--text-2)', cursor: 'pointer' }}>{p}%</button>
                ))}
              </div>
              <input type="range" min="0" max="95" step="1" value={margin} onChange={e => setMargin(+e.target.value)} style={{ width: '100%', accentColor: C }} />
            </div>
          )}
          {mode === 'reverse' && (
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 6 }}>Selling price ($)</label>
              <input type="number" value={sellPrice} onChange={e => setSellPrice(Math.max(0, +e.target.value))}
                style={{ width: '100%', height: 44, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 14px', fontSize: 17, fontWeight: 700, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', fontFamily: "'Space Grotesk',sans-serif", boxSizing: 'border-box' }} />
            </div>
          )}
        </>}
        right={<>
          <div style={{ background: 'var(--bg-card)', border: `1.5px solid ${C}30`, borderRadius: 14, padding: '18px 20px', marginBottom: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[{ l: 'Cost', v: `$${cost.toFixed(2)}` }, { l: 'Selling Price', v: `$${selling.toFixed(2)}`, c: C }, { l: 'Profit', v: `$${profit.toFixed(2)}`, c: '#10b981' }, { l: 'Markup', v: `${markupPct.toFixed(1)}%` }, { l: 'Margin', v: `${marginPct.toFixed(1)}%`, c: C }, { l: '', v: '' }].map((m, i) => m.l ? (
                <div key={i} style={{ padding: '10px 12px', background: 'var(--bg-raised)', borderRadius: 9 }}>
                  <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 4 }}>{m.l}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: m.c || 'var(--text)', fontFamily: "'Space Grotesk',sans-serif" }}>{m.v}</div>
                </div>
              ) : null)}
            </div>
          </div>
          <div style={{ padding: '12px 14px', background: '#fef3c720', borderRadius: 10, border: '0.5px solid #f59e0b30', marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#92400e', marginBottom: 6 }}>MARKUP ≠ MARGIN</div>
            <div style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.65 }}>
              {markup}% markup = {marginPct.toFixed(1)}% margin. They are calculated differently. Always clarify which one you mean in business discussions.
            </div>
          </div>
          <AIHintCard hint={hint} />
        </>}
      />
      <Sec title="Frequently asked questions">
        {FAQ.map((f, i) => <Acc key={i} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} color={C} />)}
      </Sec>
    </div>
  )
}
