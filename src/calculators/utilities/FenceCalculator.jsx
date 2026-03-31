import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'

const FENCE_TYPES = [
  { id: 'wood',    label: 'Wood panels',  ppPost: 8,  ppPanel: 25, icon: '🪵' },
  { id: 'chain',   label: 'Chain link',   ppPost: 15, ppPanel: 18, icon: '⛓️' },
  { id: 'vinyl',   label: 'Vinyl',        ppPost: 30, ppPanel: 45, icon: '⬜' },
  { id: 'iron',    label: 'Wrought iron', ppPost: 40, ppPanel: 80, icon: '🔩' },
]

const FAQ = [
  { q: 'How do I calculate how many fence posts I need?', a: 'Divide the total fence length by the post spacing, then add 1 (for the end post). Example: 100 ft ÷ 8 ft spacing = 12.5, round up to 13, add 1 = 14 posts. Always add extra posts for corners and gates.' },
  { q: 'What post spacing should I use?', a: 'Standard post spacing is 6–8 feet for wood and vinyl fences. Chain link typically uses 10-foot spacing. Closer spacing (6 ft) is stronger but more expensive. Always check local building codes — some areas require specific post depths and spacing.' },
  { q: 'Do I need a permit to build a fence?', a: 'Many municipalities require permits for fences over a certain height (often 6 feet) or near property lines. HOA rules may also restrict fence materials, colours, and styles. Always check local regulations before starting.' },
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

export default function FenceCalculator({ meta, category }) {
  const C = category?.color || '#0d9488'
  const [length, setLength] = useState(150)
  const [postSpacing, setPostSpacing] = useState(8)
  const [panelW, setPanelW] = useState(8)
  const [gates, setGates] = useState(1)
  const [fenceType, setFenceType] = useState('wood')
  const [openFaq, setOpenFaq] = useState(null)

  const ft = FENCE_TYPES.find(f => f.id === fenceType)
  const posts = Math.ceil(length / postSpacing) + 1 + gates * 2
  const panels = Math.ceil(length / panelW)
  const materialCost = posts * ft.ppPost + panels * ft.ppPanel

  const hint = `${length} ft fence: ${posts} posts, ${panels} panels. Est. material cost: $${materialCost.toFixed(0)} (${ft.label}).`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ background: `linear-gradient(135deg,${C}12,${C}06)`, border: `1px solid ${C}30`, borderRadius: 14, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Fence Formula</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>Posts = (Length ÷ Spacing) + 1</div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>Panels = Length ÷ Panel width</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>{posts} posts</div>
          <div style={{ fontSize: 13, color: 'var(--text-3)' }}>{panels} panels</div>
        </div>
      </div>

      <CalcShell
        left={<>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 6 }}>Total fence length (ft)</label>
            <input type="number" value={length} onChange={e => setLength(Math.max(1, +e.target.value))}
              style={{ width: '100%', height: 44, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 14px', fontSize: 17, fontWeight: 700, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', fontFamily: "'Space Grotesk',sans-serif", boxSizing: 'border-box' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
            {[['Post spacing (ft)', postSpacing, setPostSpacing], ['Panel width (ft)', panelW, setPanelW]].map(([l, v, set]) => (
              <div key={l}>
                <label style={{ fontSize: 11, color: 'var(--text-3)', display: 'block', marginBottom: 4 }}>{l}</label>
                <input type="number" value={v} onChange={e => set(Math.max(1, +e.target.value))}
                  style={{ width: '100%', height: 40, border: '1px solid var(--border-2)', borderRadius: 7, padding: '0 10px', fontSize: 14, fontWeight: 700, background: 'var(--bg-card)', color: 'var(--text)', boxSizing: 'border-box' }} />
              </div>
            ))}
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 6 }}>Number of gates</label>
            <div style={{ display: 'flex', gap: 6 }}>
              {[0, 1, 2, 3].map(n => (
                <button key={n} onClick={() => setGates(n)}
                  style={{ flex: 1, padding: '9px', borderRadius: 8, border: `1.5px solid ${gates === n ? C : 'var(--border-2)'}`, background: gates === n ? C + '12' : 'var(--bg-raised)', fontSize: 14, fontWeight: gates === n ? 700 : 500, color: gates === n ? C : 'var(--text-2)', cursor: 'pointer' }}>{n}</button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 4 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 8 }}>Fence type</label>
            {FENCE_TYPES.map(f => (
              <button key={f.id} onClick={() => setFenceType(f.id)}
                style={{ display: 'flex', width: '100%', alignItems: 'center', gap: 12, padding: '10px 12px', marginBottom: 6, borderRadius: 9, border: `1.5px solid ${fenceType === f.id ? C : 'var(--border-2)'}`, background: fenceType === f.id ? C + '12' : 'var(--bg-raised)', cursor: 'pointer', textAlign: 'left' }}>
                <span style={{ fontSize: 18 }}>{f.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: fenceType === f.id ? 700 : 500, color: fenceType === f.id ? C : 'var(--text)' }}>{f.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)' }}>~${f.ppPost}/post · ~${f.ppPanel}/panel</div>
                </div>
              </button>
            ))}
          </div>
        </>}
        right={<>
          <BreakdownTable title="Fence estimate" rows={[
            { label: 'Total length', value: `${length} ft` },
            { label: 'Posts needed', value: posts, color: C },
            { label: 'Panels needed', value: panels, color: C },
            { label: 'Gate posts (extra)', value: gates * 2 },
            { label: 'Est. material cost', value: `$${materialCost.toFixed(0)}`, bold: true, highlight: true, color: C },
          ]} />
          <div style={{ marginTop: 14, padding: '12px 14px', background: 'var(--bg-raised)', borderRadius: 10, border: '0.5px solid var(--border)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>INSTALLATION TIPS</div>
            {['Posts should be buried 1/3 of their total height', 'Use concrete to set posts for stability', 'Check property lines before digging', 'Call 811 before digging to locate utilities'].map((t, i) => (
              <div key={i} style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 4 }}>· {t}</div>
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
