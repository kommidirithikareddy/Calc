import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'

// Yeast conversion ratios
// 1 tsp active dry = 0.75 tsp instant = 0.33 oz fresh (0.6x/1x/3x)
const YEAST_RATIOS = {
  active:  { toInstant: 0.75,  toFresh: 3 },
  instant: { toActive: 1.333,  toFresh: 4 },
  fresh:   { toActive: 0.333,  toInstant: 0.25 },
}

const FAQ = [
  { q: 'Can I substitute instant yeast for active dry yeast?', a: 'Yes — use 25% less instant yeast than active dry. Instant yeast (also called rapid-rise or bread machine yeast) can be added directly to dry ingredients without proofing. Active dry yeast should be proofed in warm water (105–115°F) for 5–10 minutes first.' },
  { q: 'How do I know if my yeast is still active?', a: 'Proof it: dissolve 1 tsp in ¼ cup of warm water (105–115°F) with a pinch of sugar. Wait 10 minutes. It should become foamy and fragrant. If nothing happens, the yeast is dead. Expired yeast or yeast killed by water that was too hot (over 120°F) will not work.' },
  { q: 'What is the difference between active dry and instant yeast?', a: 'Active dry yeast has larger granules and a dormant outer coating — it must be dissolved in warm liquid before use. Instant yeast (rapid-rise) has finer granules and can be mixed directly into dry ingredients. Instant yeast also works faster — rise times are roughly 25% shorter.' },
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

export default function YeastConverter({ meta, category }) {
  const C = category?.color || '#0d9488'
  const [fromType, setFromType] = useState('active')
  const [amount, setAmount] = useState(1)
  const [openFaq, setOpenFaq] = useState(null)

  const r = YEAST_RATIOS[fromType]
  const results = fromType === 'active'
    ? [{ label: 'Active dry (your amount)', v: `${amount} tsp`, self: true }, { label: 'Instant / Rapid-rise', v: `${(amount * r.toInstant).toFixed(2)} tsp` }, { label: 'Fresh yeast', v: `${(amount * r.toFresh).toFixed(2)} oz` }]
    : fromType === 'instant'
    ? [{ label: 'Active dry', v: `${(amount * r.toActive).toFixed(2)} tsp` }, { label: 'Instant (your amount)', v: `${amount} tsp`, self: true }, { label: 'Fresh yeast', v: `${(amount * r.toFresh).toFixed(2)} oz` }]
    : [{ label: 'Active dry', v: `${(amount * r.toActive).toFixed(2)} tsp` }, { label: 'Instant / Rapid-rise', v: `${(amount * r.toInstant).toFixed(2)} tsp` }, { label: 'Fresh yeast (your amount)', v: `${amount} oz`, self: true }]

  const hint = `${amount} ${fromType === 'fresh' ? 'oz' : 'tsp'} ${fromType} yeast converts to: ${results.filter(r => !r.self).map(r => r.v + ' ' + r.label).join(', ')}.`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ background: `linear-gradient(135deg,${C}12,${C}06)`, border: `1px solid ${C}30`, borderRadius: 14, padding: '16px 20px' }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: C, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Yeast Conversion Ratios</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>1 tsp Active Dry = ¾ tsp Instant = 1 oz Fresh</div>
      </div>

      <CalcShell
        left={<>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 8 }}>I have this type of yeast</label>
            {[['active', 'Active Dry Yeast', 'Standard — proof in warm water before using'],
              ['instant', 'Instant / Rapid-Rise', 'Mix directly into dry ingredients'],
              ['fresh', 'Fresh / Cake Yeast', 'Refrigerated — most potent, shortest shelf life']
            ].map(([id, label, note]) => (
              <button key={id} onClick={() => setFromType(id)}
                style={{ display: 'flex', width: '100%', alignItems: 'flex-start', flexDirection: 'column', padding: '10px 14px', marginBottom: 6, borderRadius: 9, border: `1.5px solid ${fromType === id ? C : 'var(--border-2)'}`, background: fromType === id ? C + '12' : 'var(--bg-raised)', cursor: 'pointer', textAlign: 'left' }}>
                <div style={{ fontSize: 13, fontWeight: fromType === id ? 700 : 500, color: fromType === id ? C : 'var(--text)' }}>{label}</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{note}</div>
              </button>
            ))}
          </div>
          <div>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 6 }}>Amount ({fromType === 'fresh' ? 'oz' : 'tsp'})</label>
            <input type="number" step="0.25" min="0.25" value={amount} onChange={e => setAmount(Math.max(0.25, +e.target.value))}
              style={{ width: '100%', height: 44, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 14px', fontSize: 17, fontWeight: 700, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', fontFamily: "'Space Grotesk',sans-serif", boxSizing: 'border-box' }} />
          </div>
        </>}
        right={<>
          <div style={{ background: 'var(--bg-card)', border: `1.5px solid ${C}30`, borderRadius: 14, padding: '18px 20px', marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 14 }}>Equivalent amounts</div>
            {results.map((r, i) => (
              <div key={i} style={{ padding: '12px 14px', background: r.self ? C + '12' : 'var(--bg-raised)', borderRadius: 10, border: `1px solid ${r.self ? C + '40' : 'var(--border)'}`, marginBottom: 8 }}>
                <div style={{ fontSize: 11, color: r.self ? C : 'var(--text-3)', fontWeight: r.self ? 700 : 400, marginBottom: 4 }}>{r.label}</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: r.self ? C : 'var(--text)', fontFamily: "'Space Grotesk',sans-serif" }}>{r.v}</div>
              </div>
            ))}
          </div>
          <div style={{ padding: '12px 14px', background: 'var(--bg-raised)', borderRadius: 10, border: '0.5px solid var(--border)', marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>QUICK REFERENCE</div>
            {[['1 tsp', 'Active Dry', '→', '¾ tsp Instant / 1 oz Fresh'],
              ['1 tsp', 'Instant', '→', '1⅓ tsp Active / 4 oz Fresh'],
              ['1 oz', 'Fresh', '→', '⅓ tsp Active / ¼ tsp Instant']].map((r, i) => (
              <div key={i} style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 4 }}>{r[0]} {r[1]} {r[2]} {r[3]}</div>
            ))}
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
