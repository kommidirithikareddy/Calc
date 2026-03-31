import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'

const CATEGORIES = [
  { id: 'flights',       label: 'Flights',           icon: '✈️', defaultAmt: 600 },
  { id: 'accommodation', label: 'Accommodation',      icon: '🏨', defaultAmt: 120 },
  { id: 'food',          label: 'Food & Dining',      icon: '🍽️', defaultAmt: 60 },
  { id: 'transport',     label: 'Local Transport',    icon: '🚌', defaultAmt: 20 },
  { id: 'activities',   label: 'Activities/Tours',   icon: '🎟️', defaultAmt: 50 },
  { id: 'shopping',      label: 'Shopping',           icon: '🛍️', defaultAmt: 30 },
  { id: 'misc',          label: 'Miscellaneous',      icon: '💼', defaultAmt: 20 },
]

const FAQ = [
  { q: 'How much should I budget per day for travel?', a: 'It varies enormously by destination. Budget travelers in Southeast Asia can live on $30–50/day. Europe typically costs $80–150/day. The US runs $100–200/day. Luxury travel can exceed $500/day. Flights, accommodations, and location are the biggest variables.' },
  { q: 'How do I save money while traveling?', a: 'Book flights 6–8 weeks in advance for domestic, 3–6 months for international. Travel shoulder season (spring/fall) for lower prices. Use public transport. Eat where locals eat — avoid tourist traps. Book accommodations with kitchenettes to cook some meals. Consider house-sitting or Airbnb over hotels.' },
  { q: 'Should I use credit cards or cash abroad?', a: 'Credit cards with no foreign transaction fees are usually best — you get better exchange rates than currency exchanges. Inform your bank before traveling. Keep some local cash for small vendors and markets. ATM withdrawals (at local bank ATMs) typically give better rates than airport currency exchanges.' },
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

export default function TravelBudget({ meta, category }) {
  const C = category?.color || '#0d9488'
  const [days, setDays] = useState(7)
  const [people, setPeople] = useState(2)
  const [items, setItems] = useState(
    CATEGORIES.map(c => ({
      ...c,
      amount: c.defaultAmt,
      perDay: c.id !== 'flights', // flights are total, rest per day
    }))
  )
  const [openFaq, setOpenFaq] = useState(null)

  const update = (i, f, v) => { const n = [...items]; n[i] = { ...n[i], [f]: v }; setItems(n) }

  const totals = items.map(it => ({
    ...it,
    total: it.perDay ? it.amount * days * people : it.amount * people,
  }))
  const grandTotal = totals.reduce((s, t) => s + t.total, 0)
  const perPerson = people > 0 ? grandTotal / people : grandTotal
  const perDay = days > 0 ? grandTotal / days : grandTotal
  const maxTotal = Math.max(...totals.map(t => t.total))

  const hint = `${days}-day trip for ${people} people: $${grandTotal.toFixed(0)} total ($${perPerson.toFixed(0)}/person, $${perDay.toFixed(0)}/day).`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ background: `linear-gradient(135deg,${C}12,${C}06)`, border: `1px solid ${C}30`, borderRadius: 14, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Travel Budget</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>Total = Flights + (Daily costs × Days × People)</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>${grandTotal.toFixed(0)}</div>
          <div style={{ fontSize: 12, color: 'var(--text-3)' }}>total trip budget</div>
        </div>
      </div>

      <CalcShell
        left={<>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
            {[['Trip duration (days)', days, setDays], ['Number of people', people, setPeople]].map(([l, v, set]) => (
              <div key={l}>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 6 }}>{l}</label>
                <input type="number" min="1" value={v} onChange={e => set(Math.max(1, +e.target.value))}
                  style={{ width: '100%', height: 44, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 14px', fontSize: 17, fontWeight: 700, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', fontFamily: "'Space Grotesk',sans-serif", boxSizing: 'border-box' }} />
              </div>
            ))}
          </div>

          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 10, fontFamily: "'DM Sans',sans-serif" }}>Budget by category</div>
            {items.map((it, i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{it.icon} {it.label}</span>
                  <button onClick={() => update(i, 'perDay', !it.perDay)}
                    style={{ padding: '2px 8px', borderRadius: 5, border: `1px solid ${it.perDay ? C : 'var(--border-2)'}`, background: it.perDay ? C + '12' : 'var(--bg-raised)', fontSize: 10, color: it.perDay ? C : 'var(--text-3)', cursor: 'pointer' }}>
                    {it.perDay ? 'per day' : 'total'}
                  </button>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input type="number" value={it.amount} onChange={e => update(i, 'amount', Math.max(0, +e.target.value))}
                    style={{ width: 100, height: 36, border: '1px solid var(--border-2)', borderRadius: 7, padding: '0 10px', fontSize: 14, fontWeight: 700, background: 'var(--bg-card)', color: 'var(--text)', boxSizing: 'border-box' }} />
                  <span style={{ fontSize: 11, color: 'var(--text-3)' }}>${it.amount} {it.perDay ? '/day/person' : '/person total'}</span>
                </div>
              </div>
            ))}
          </div>
        </>}
        right={<>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
            {[{ l: 'Total', v: `$${grandTotal.toFixed(0)}`, c: C }, { l: 'Per person', v: `$${perPerson.toFixed(0)}` }, { l: 'Per day', v: `$${perDay.toFixed(0)}` }, { l: 'Per day/person', v: `$${(perDay / people).toFixed(0)}` }].map((m, i) => (
              <div key={i} style={{ padding: '12px 14px', background: 'var(--bg-raised)', borderRadius: 10, border: '0.5px solid var(--border)' }}>
                <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 4 }}>{m.l}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: m.c || 'var(--text)', fontFamily: "'Space Grotesk',sans-serif" }}>{m.v}</div>
              </div>
            ))}
          </div>

          <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 12, padding: '12px 14px', marginBottom: 14 }}>
            {totals.map((t, i) => (
              <div key={i} style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span style={{ fontSize: 12, color: 'var(--text)' }}>{t.icon} {t.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: C }}>${t.total.toFixed(0)}</span>
                </div>
                <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${maxTotal > 0 ? (t.total / maxTotal * 100).toFixed(0) : 0}%`, background: C, borderRadius: 2 }} />
                </div>
              </div>
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
