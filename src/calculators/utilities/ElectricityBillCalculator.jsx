import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'

const DEFAULT_APPLIANCES = [
  { name: 'Refrigerator', watts: 150, hoursPerDay: 24, on: true },
  { name: 'Air conditioner', watts: 1500, hoursPerDay: 8, on: true },
  { name: 'Washing machine', watts: 500, hoursPerDay: 1, on: true },
  { name: 'LED lights (5 bulbs)', watts: 50, hoursPerDay: 6, on: true },
  { name: 'Television', watts: 120, hoursPerDay: 4, on: true },
  { name: 'Laptop / Computer', watts: 60, hoursPerDay: 8, on: true },
]

const FAQ = [
  { q: 'How is electricity usage calculated?', a: 'Usage = Watts × Hours used ÷ 1000. This gives kilowatt-hours (kWh). Your utility bill charges per kWh, typically between $0.10 and $0.30 depending on location. A 1000W appliance run for 1 hour uses 1 kWh.' },
  { q: 'What appliances use the most electricity?', a: 'The biggest energy consumers are typically: air conditioners and heaters (1,000–5,000W), electric water heaters (4,500W), electric dryers (5,000W), and refrigerators (100–400W running constantly). Small electronics like phone chargers (5W) have minimal impact compared to heating and cooling.' },
  { q: 'How can I reduce my electricity bill?', a: 'Most impactful changes: upgrade to LED lighting (75% less energy than incandescent), use a programmable thermostat, wash clothes in cold water, unplug electronics when not in use, and switch to Energy Star appliances. Improving home insulation can cut heating and cooling costs by 15–20%.' },
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

export default function ElectricityBillCalculator({ meta, category }) {
  const C = category?.color || '#0d9488'
  const [appliances, setAppliances] = useState(DEFAULT_APPLIANCES)
  const [rate, setRate] = useState(0.13)
  const [openFaq, setOpenFaq] = useState(null)

  const update = (i, f, v) => { const n = [...appliances]; n[i] = { ...n[i], [f]: v }; setAppliances(n) }

  const items = appliances
    .filter(a => a.on)
    .map(a => ({
      ...a,
      kwhDay: a.watts * a.hoursPerDay / 1000,
      costDay: a.watts * a.hoursPerDay / 1000 * rate,
    }))

  const totalKwhDay = items.reduce((s, a) => s + a.kwhDay, 0)
  const totalCostDay = totalKwhDay * rate
  const totalCostMonth = totalCostDay * 30
  const totalCostYear = totalCostDay * 365
  const maxItem = items.reduce((m, a) => a.kwhDay > (m?.kwhDay || 0) ? a : m, null)

  const hint = `Total daily usage: ${totalKwhDay.toFixed(2)} kWh, monthly cost: $${totalCostMonth.toFixed(2)} at $${rate}/kWh.`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ background: `linear-gradient(135deg,${C}12,${C}06)`, border: `1px solid ${C}30`, borderRadius: 14, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Electricity Formula</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>kWh = Watts × Hours ÷ 1000</div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>Cost = kWh × Rate per kWh</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>${totalCostMonth.toFixed(2)}</div>
          <div style={{ fontSize: 13, color: 'var(--text-3)' }}>per month</div>
        </div>
      </div>

      <CalcShell
        left={<>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 6 }}>Electricity rate ($/kWh)</label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
              {[0.10, 0.13, 0.16, 0.20, 0.25].map(r => (
                <button key={r} onClick={() => setRate(r)}
                  style={{ padding: '5px 10px', borderRadius: 7, border: `1.5px solid ${Math.abs(rate - r) < 0.001 ? C : 'var(--border-2)'}`, background: Math.abs(rate - r) < 0.001 ? C + '12' : 'var(--bg-raised)', fontSize: 12, fontWeight: Math.abs(rate - r) < 0.001 ? 700 : 500, color: Math.abs(rate - r) < 0.001 ? C : 'var(--text-2)', cursor: 'pointer' }}>${r}</button>
              ))}
            </div>
            <input type="number" step="0.01" value={rate} onChange={e => setRate(+e.target.value)}
              style={{ width: '100%', height: 44, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 14px', fontSize: 17, fontWeight: 700, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', fontFamily: "'Space Grotesk',sans-serif", boxSizing: 'border-box' }} />
          </div>

          <div style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif" }}>Appliances</label>
              <button onClick={() => setAppliances([...appliances, { name: 'New appliance', watts: 100, hoursPerDay: 4, on: true }])}
                style={{ padding: '4px 10px', borderRadius: 6, border: `1px solid ${C}`, background: 'transparent', color: C, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>+ Add</button>
            </div>
            {appliances.map((a, i) => (
              <div key={i} style={{ background: a.on ? 'var(--bg-raised)' : 'var(--bg-card)', borderRadius: 10, padding: '10px 12px', marginBottom: 6, border: `0.5px solid ${a.on ? 'var(--border)' : 'var(--border)'}`, opacity: a.on ? 1 : 0.5 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                  <input type="checkbox" checked={a.on} onChange={e => update(i, 'on', e.target.checked)} style={{ accentColor: C, width: 16, height: 16, flexShrink: 0 }} />
                  <input value={a.name} onChange={e => update(i, 'name', e.target.value)}
                    style={{ flex: 1, height: 30, border: '1px solid var(--border-2)', borderRadius: 6, padding: '0 8px', fontSize: 12, background: 'var(--bg-card)', color: 'var(--text)' }} />
                  <button onClick={() => setAppliances(appliances.filter((_, j) => j !== i))}
                    style={{ width: 22, height: 22, borderRadius: '50%', border: 'none', background: 'var(--bg-card)', cursor: 'pointer', color: 'var(--text-3)', fontSize: 13 }}>×</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                  {[['Watts', 'watts'], ['Hours/day', 'hoursPerDay']].map(([lbl, fld]) => (
                    <div key={fld}>
                      <label style={{ fontSize: 10, color: 'var(--text-3)', display: 'block', marginBottom: 2 }}>{lbl}</label>
                      <input type="number" value={a[fld]} onChange={e => update(i, fld, +e.target.value)}
                        style={{ width: '100%', height: 32, border: '1px solid var(--border-2)', borderRadius: 6, padding: '0 8px', fontSize: 12, fontWeight: 700, background: 'var(--bg-card)', color: 'var(--text)', boxSizing: 'border-box' }} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>}
        right={<>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
            {[{ l: 'Daily kWh', v: totalKwhDay.toFixed(2) }, { l: 'Daily cost', v: `$${totalCostDay.toFixed(2)}` }, { l: 'Monthly', v: `$${totalCostMonth.toFixed(2)}`, c: C }, { l: 'Yearly', v: `$${totalCostYear.toFixed(0)}` }].map((m, i) => (
              <div key={i} style={{ padding: '12px 14px', background: 'var(--bg-raised)', borderRadius: 10, border: '0.5px solid var(--border)' }}>
                <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 4 }}>{m.l}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: m.c || 'var(--text)', fontFamily: "'Space Grotesk',sans-serif" }}>{m.v}</div>
              </div>
            ))}
          </div>

          {items.length > 0 && (
            <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 12, overflow: 'hidden', marginBottom: 14 }}>
              <div style={{ padding: '10px 14px', borderBottom: '0.5px solid var(--border)', fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>Usage by appliance</div>
              {[...items].sort((a, b) => b.kwhDay - a.kwhDay).slice(0, 5).map((a, i) => (
                <div key={i} style={{ padding: '8px 14px', borderBottom: '0.5px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: 'var(--text)' }}>{a.name}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: C }}>${(a.costDay * 30).toFixed(2)}/mo</span>
                  </div>
                  <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${maxItem ? Math.min(a.kwhDay / maxItem.kwhDay * 100, 100) : 0}%`, background: C, borderRadius: 2 }} />
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2 }}>{a.kwhDay.toFixed(2)} kWh/day</div>
                </div>
              ))}
            </div>
          )}

          <AIHintCard hint={hint} />
        </>}
      />
      <Sec title="Frequently asked questions">
        {FAQ.map((f, i) => <Acc key={i} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} color={C} />)}
      </Sec>
    </div>
  )
}
