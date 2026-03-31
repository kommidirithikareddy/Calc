import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'

const clamp = (v, a, b) => Math.min(b, Math.max(a, v))

const SERVICE_LEVELS = [
  { label: 'Poor',        pct: 10, desc: 'Service was unsatisfactory' },
  { label: 'Fair',        pct: 15, desc: 'Below average service' },
  { label: 'Good',        pct: 18, desc: 'Standard, appreciated' },
  { label: 'Great',       pct: 20, desc: 'Above and beyond' },
  { label: 'Exceptional', pct: 25, desc: 'Outstanding service' },
]

const ETIQUETTE = {
  US:  { flag: '🇺🇸', text: 'In the US, 18–20% is standard. Tip on pre-tax amount. Tipping is culturally expected in restaurants, taxis, and salons.' },
  UK:  { flag: '🇬🇧', text: 'In the UK, 10–15% is customary. Always check the bill — a "service charge" is often already included.' },
  EU:  { flag: '🇪🇺', text: 'In most of Europe, rounding up or 5–10% is appreciated but not obligatory. Cash tips go directly to the server.' },
  JP:  { flag: '🇯🇵', text: 'In Japan, tipping is considered rude. Exceptional service is the standard — no tip expected or needed.' },
  AU:  { flag: '🇦🇺', text: 'In Australia, tipping is optional. 10% for great service is appreciated, but never required.' },
  CA:  { flag: '🇨🇦', text: 'In Canada, 15–20% is standard, similar to the US. Most card machines suggest 18%, 20%, or 25%.' },
  IN:  { flag: '🇮🇳', text: 'In India, 10% is customary in restaurants. Check if service charge is already added. Rounding up is common.' },
}

const FAQ = [
  { q: 'Should I tip on the pre-tax or post-tax amount?', a: 'Etiquette experts generally recommend tipping on the pre-tax subtotal, since the tax goes to the government, not the server. In practice, most people tip on the total — the difference is small and servers appreciate the generosity.' },
  { q: 'What is a good tip for takeout or delivery?', a: 'For takeout, 10% or $2–5 is appreciated but optional. For delivery, 15–20% is standard — delivery drivers use their own vehicles, pay for gas, and often earn close to minimum wage before tips. Bad weather or long distances warrant more.' },
  { q: 'How do I tip when splitting a bill unevenly?', a: 'The cleanest approach: calculate the total bill including tip, then divide based on what each person ordered. Alternatively, everyone tips on their own subtotal. Avoid tipping on just the split total — the server served everyone equally.' },
  { q: 'Is it ever okay not to tip?', a: 'Yes — for counter service where you pick up your own food, self-checkout, or genuinely terrible service where you\'ve already spoken to a manager. If the service was average or better, tipping is the socially expected norm in tip-culture countries.' },
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

function Stepper({ label, value, onChange, min, max, unit, color }) {
  const btn = { width: 38, height: '100%', border: 'none', background: 'var(--bg-raised)', color: 'var(--text)', fontSize: 20, fontWeight: 300, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 6 }}>{label}</label>
      <div style={{ display: 'flex', alignItems: 'stretch', height: 44, border: '1.5px solid var(--border-2)', borderRadius: 9, overflow: 'hidden', background: 'var(--bg-card)' }}>
        <button onMouseDown={e => { e.preventDefault(); onChange(clamp(value - 1, min, max)) }} style={{ ...btn, borderRight: '1px solid var(--border)' }} onMouseEnter={e => e.currentTarget.style.background = color + '18'} onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-raised)'}>−</button>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', fontFamily: "'Space Grotesk',sans-serif" }}>{value}</span>
          {unit && <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{unit}</span>}
        </div>
        <button onMouseDown={e => { e.preventDefault(); onChange(clamp(value + 1, min, max)) }} style={{ ...btn, borderLeft: '1px solid var(--border)' }} onMouseEnter={e => e.currentTarget.style.background = color + '18'} onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-raised)'}>+</button>
      </div>
    </div>
  )
}

export default function TipCalculator({ meta, category }) {
  const C = category?.color || '#0d9488'
  const [bill, setBill]         = useState(85)
  const [tipPct, setTipPct]     = useState(18)
  const [people, setPeople]     = useState(2)
  const [region, setRegion]     = useState('US')
  const [splitMode, setSplitMode] = useState('even')
  const [splits, setSplits]     = useState([{ name: 'Person 1', pct: 50 }, { name: 'Person 2', pct: 50 }])
  const [openFaq, setOpenFaq]   = useState(null)

  const tipAmt   = bill * (tipPct / 100)
  const total    = bill + tipAmt
  const perPerson = people > 0 ? total / people : total
  const tipPer   = people > 0 ? tipAmt / people : tipAmt

  const totalUnevenPct = splits.reduce((s, x) => s + x.pct, 0)

  const updateSplitCount = n => {
    const count = clamp(n, 1, 10)
    setPeople(count)
    const even = Math.floor(100 / count)
    const rem  = 100 - even * count
    setSplits(Array.from({ length: count }, (_, i) => ({ name: `Person ${i + 1}`, pct: i === 0 ? even + rem : even })))
  }

  const serviceLvl = SERVICE_LEVELS.find(s => s.pct === tipPct)
  const hint = `Bill $${bill.toFixed(2)}, tip ${tipPct}% = $${tipAmt.toFixed(2)}. Total $${total.toFixed(2)}. Per person (${people}): $${perPerson.toFixed(2)}.`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* formula banner */}
      <div style={{ background: `linear-gradient(135deg,${C}12,${C}06)`, border: `1px solid ${C}30`, borderRadius: 14, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Tip Formula</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>Tip = Bill × (Tip% ÷ 100)</div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>Total = Bill + Tip &nbsp;·&nbsp; Per person = Total ÷ People</div>
        </div>
        <div style={{ padding: '8px 18px', background: C + '15', borderRadius: 10, fontSize: 28, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>${total.toFixed(2)}</div>
      </div>

      <CalcShell
        left={<>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 14 }}>Bill details</div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 6 }}>Bill amount ($)</label>
            <div style={{ display: 'flex', height: 44, border: `1.5px solid var(--border-2)`, borderRadius: 9, overflow: 'hidden', background: 'var(--bg-card)' }}>
              <div style={{ padding: '0 14px', display: 'flex', alignItems: 'center', background: 'var(--bg-raised)', borderRight: '1px solid var(--border)', fontSize: 15, fontWeight: 700, color: C }}>$</div>
              <input type="number" value={bill} onChange={e => setBill(Math.max(0, +e.target.value))}
                style={{ flex: 1, border: 'none', background: 'transparent', padding: '0 14px', fontSize: 17, fontWeight: 700, color: 'var(--text)', outline: 'none', fontFamily: "'Space Grotesk',sans-serif" }} />
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 8 }}>Service quality</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
              {SERVICE_LEVELS.map(s => (
                <button key={s.pct} onClick={() => setTipPct(s.pct)}
                  style={{ padding: '8px 4px', borderRadius: 9, border: `1.5px solid ${tipPct === s.pct ? C : 'var(--border-2)'}`, background: tipPct === s.pct ? C + '12' : 'var(--bg-raised)', cursor: 'pointer', textAlign: 'center' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: tipPct === s.pct ? C : 'var(--text)' }}>{s.pct}%</div>
                  <div style={{ fontSize: 9, color: tipPct === s.pct ? C : 'var(--text-3)', marginTop: 2 }}>{s.label}</div>
                </button>
              ))}
            </div>
            {/* custom slider */}
            <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 11, color: 'var(--text-3)' }}>0%</span>
              <input type="range" min="0" max="40" step="1" value={tipPct} onChange={e => setTipPct(+e.target.value)}
                style={{ flex: 1, accentColor: C }} />
              <span style={{ fontSize: 11, color: 'var(--text-3)' }}>40%</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: C, minWidth: 36 }}>{tipPct}%</span>
            </div>
          </div>

          <Stepper label="Number of people" value={people} onChange={updateSplitCount} min={1} max={10} color={C} />

          {people > 1 && (
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 8 }}>Split mode</label>
              <div style={{ display: 'flex', gap: 6 }}>
                {['even', 'custom'].map(m => (
                  <button key={m} onClick={() => setSplitMode(m)}
                    style={{ flex: 1, padding: '8px', borderRadius: 8, border: `1.5px solid ${splitMode === m ? C : 'var(--border-2)'}`, background: splitMode === m ? C + '12' : 'var(--bg-raised)', fontSize: 12, fontWeight: splitMode === m ? 700 : 500, color: splitMode === m ? C : 'var(--text-2)', cursor: 'pointer', textTransform: 'capitalize' }}>{m} split</button>
                ))}
              </div>
            </div>
          )}

          {splitMode === 'custom' && people > 1 && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)' }}>Custom percentages</span>
                <span style={{ fontSize: 11, color: Math.abs(totalUnevenPct - 100) < 1 ? '#10b981' : '#f59e0b', fontWeight: 600 }}>{totalUnevenPct.toFixed(0)}% allocated</span>
              </div>
              {splits.map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                  <input value={s.name} onChange={e => { const n = [...splits]; n[i] = { ...n[i], name: e.target.value }; setSplits(n) }}
                    style={{ width: 100, height: 36, border: '1px solid var(--border-2)', borderRadius: 7, padding: '0 10px', fontSize: 12, background: 'var(--bg-card)', color: 'var(--text)', fontFamily: "'DM Sans',sans-serif" }} />
                  <input type="range" min="0" max="100" value={s.pct} onChange={e => { const n = [...splits]; n[i] = { ...n[i], pct: +e.target.value }; setSplits(n) }}
                    style={{ flex: 1, accentColor: C }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: C, minWidth: 32 }}>{s.pct}%</span>
                </div>
              ))}
            </div>
          )}

          <div>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 8 }}>Tipping etiquette by region</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {Object.entries(ETIQUETTE).map(([k, v]) => (
                <button key={k} onClick={() => setRegion(k)}
                  style={{ padding: '5px 10px', borderRadius: 7, border: `1.5px solid ${region === k ? C : 'var(--border-2)'}`, background: region === k ? C + '12' : 'var(--bg-raised)', fontSize: 12, fontWeight: region === k ? 700 : 500, color: region === k ? C : 'var(--text-2)', cursor: 'pointer' }}>
                  {v.flag} {k}
                </button>
              ))}
            </div>
            <div style={{ marginTop: 10, padding: '10px 13px', background: 'var(--bg-raised)', borderRadius: 9, border: '0.5px solid var(--border)', fontSize: 12, color: 'var(--text-2)', lineHeight: 1.65 }}>
              {ETIQUETTE[region].text}
            </div>
          </div>
        </>}

        right={<>
          <div style={{ background: 'var(--bg-card)', border: `1.5px solid ${C}30`, borderRadius: 14, padding: '18px 20px', marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 8 }}>Results</div>
            <div style={{ fontSize: 48, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif", lineHeight: 1 }}>${total.toFixed(2)}</div>
            <div style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 4 }}>total including tip</div>
            {serviceLvl && (
              <div style={{ marginTop: 12, padding: '8px 12px', background: C + '10', borderRadius: 8, border: `1px solid ${C}25`, fontSize: 12, color: 'var(--text-2)' }}>
                💡 {serviceLvl.label} service — {serviceLvl.desc}
              </div>
            )}
          </div>

          {splitMode === 'even' ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
              {[
                { label: 'Tip amount', value: `$${tipAmt.toFixed(2)}`, sub: `${tipPct}% of $${bill.toFixed(2)}` },
                { label: 'Total', value: `$${total.toFixed(2)}`, sub: 'bill + tip' },
                { label: 'Per person', value: `$${perPerson.toFixed(2)}`, sub: `split ${people} ways` },
                { label: 'Tip per person', value: `$${tipPer.toFixed(2)}`, sub: 'each owes' },
              ].map((m, i) => (
                <div key={i} style={{ padding: '12px 14px', background: 'var(--bg-raised)', borderRadius: 10, border: '0.5px solid var(--border)' }}>
                  <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 4 }}>{m.label}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: i < 2 ? C : 'var(--text)', fontFamily: "'Space Grotesk',sans-serif" }}>{m.value}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2 }}>{m.sub}</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 12, overflow: 'hidden', marginBottom: 14 }}>
              <div style={{ padding: '10px 14px', borderBottom: '0.5px solid var(--border)', fontSize: 12, fontWeight: 700, color: 'var(--text)', fontFamily: "'Space Grotesk',sans-serif" }}>Custom split</div>
              {splits.map((s, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderBottom: '0.5px solid var(--border)' }}>
                  <span style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500 }}>{s.name}</span>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>${(total * s.pct / 100).toFixed(2)}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-3)' }}>{s.pct}%</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <BreakdownTable title="Summary" rows={[
            { label: 'Bill',        value: `$${bill.toFixed(2)}` },
            { label: `Tip (${tipPct}%)`, value: `$${tipAmt.toFixed(2)}`, color: C },
            { label: 'Total',       value: `$${total.toFixed(2)}`, bold: true, highlight: true, color: C },
            { label: 'Per person',  value: `$${perPerson.toFixed(2)}` },
            { label: 'Tip/person',  value: `$${tipPer.toFixed(2)}` },
          ]} />
          <AIHintCard hint={hint} />
        </>}
      />

      <Sec title="Tip quick reference" sub="Common scenarios">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            { icon: '🍽️', label: 'Restaurant (sit-down)', pct: '18–20%', note: 'Standard in tip-culture countries' },
            { icon: '🍕', label: 'Pizza delivery',        pct: '15–20%', note: '$3–5 minimum per order' },
            { icon: '✂️', label: 'Hair salon',            pct: '15–20%', note: 'On service total, not retail' },
            { icon: '🚕', label: 'Taxi / rideshare',      pct: '15–20%', note: 'More for help with luggage' },
            { icon: '🏨', label: 'Hotel housekeeping',    pct: '$3–5/night', note: 'Leave daily, not just checkout' },
            { icon: '☕', label: 'Coffee counter',        pct: '10–15%', note: 'Or round up — optional' },
          ].map((r, i) => (
            <div key={i} style={{ padding: '11px 13px', borderRadius: 10, background: 'var(--bg-raised)', border: '0.5px solid var(--border)' }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontSize: 16 }}>{r.icon}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>{r.label}</span>
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>{r.pct}</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{r.note}</div>
            </div>
          ))}
        </div>
      </Sec>

      <Sec title="Frequently asked questions">
        {FAQ.map((f, i) => <Acc key={i} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} color={C} />)}
      </Sec>
    </div>
  )
}
