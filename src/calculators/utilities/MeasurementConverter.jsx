import { useState, useMemo } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'

const TABS = [
  { id: 'volume', label: 'Volume', icon: '🧪' },
  { id: 'weight', label: 'Weight', icon: '⚖️' },
  { id: 'temp',   label: 'Temperature', icon: '🌡️' },
]

const VOLUME_UNITS = [
  { k: 'tsp',  label: 'Teaspoon',    ml: 4.92892 },
  { k: 'tbsp', label: 'Tablespoon',  ml: 14.7868 },
  { k: 'floz', label: 'Fl. oz',      ml: 29.5735 },
  { k: 'cup',  label: 'Cup',         ml: 236.588 },
  { k: 'pt',   label: 'Pint',        ml: 473.176 },
  { k: 'qt',   label: 'Quart',       ml: 946.353 },
  { k: 'L',    label: 'Litre',       ml: 1000 },
  { k: 'gal',  label: 'Gallon',      ml: 3785.41 },
  { k: 'ml',   label: 'Millilitre',  ml: 1 },
]

const WEIGHT_UNITS = [
  { k: 'g',   label: 'Gram',     g: 1 },
  { k: 'kg',  label: 'Kilogram', g: 1000 },
  { k: 'oz',  label: 'Ounce',    g: 28.3495 },
  { k: 'lb',  label: 'Pound',    g: 453.592 },
  { k: 'mg',  label: 'Milligram',g: 0.001 },
]

const OVEN_TEMPS = [
  { desc: 'Very low / Slow', f: 250, c: 121, gas: '½' },
  { desc: 'Low',             f: 300, c: 149, gas: '2' },
  { desc: 'Moderate',        f: 350, c: 177, gas: '4' },
  { desc: 'Hot',             f: 400, c: 204, gas: '6' },
  { desc: 'Very hot',        f: 450, c: 232, gas: '8' },
]

const FAQ = [
  { q: 'How many teaspoons are in a tablespoon?', a: '3 teaspoons = 1 tablespoon. This is one of the most commonly needed conversions in cooking. 4 tablespoons = ¼ cup, 16 tablespoons = 1 cup.' },
  { q: 'How do I convert cups to millilitres?', a: '1 US cup = 236.6 mL. 1 metric cup (used in Australia and Canada) = 250 mL. Always check which system a recipe uses — a 10 mL difference per cup adds up in baking.' },
  { q: 'What is the difference between fluid ounces and weight ounces?', a: 'Fluid ounces (fl oz) measure volume. Weight ounces (oz) measure mass. 1 fl oz of water ≈ 1 oz by weight, but 1 fl oz of honey ≈ 1.5 oz by weight because honey is denser. Use weight for baking accuracy.' },
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

export default function MeasurementConverter({ meta, category }) {
  const C = category?.color || '#0d9488'
  const [tab, setTab] = useState('volume')
  const [amount, setAmount] = useState(1)
  const [fromUnit, setFromUnit] = useState('cup')
  const [tempVal, setTempVal] = useState(350)
  const [tempMode, setTempMode] = useState('f')
  const [openFaq, setOpenFaq] = useState(null)

  const units = tab === 'volume' ? VOLUME_UNITS : WEIGHT_UNITS
  const base = tab === 'volume' ? 'ml' : 'g'
  const fromU = units.find(u => u.k === fromUnit) || units[0]

  const conversionKey = tab === 'volume' ? 'ml' : 'g'
  const baseValue = amount * fromU[conversionKey]

  const tempC = tempMode === 'f' ? (tempVal - 32) * 5 / 9 : tempVal
  const tempF = tempMode === 'c' ? tempVal * 9 / 5 + 32 : tempVal

  const hint = tab === 'temp'
    ? `${tempVal}°${tempMode.toUpperCase()} = ${tempMode === 'f' ? tempC.toFixed(1) + '°C' : tempF.toFixed(1) + '°F'}`
    : `${amount} ${fromU.label} = ${baseValue.toFixed(2)} ${base}`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ background: `linear-gradient(135deg,${C}12,${C}06)`, border: `1px solid ${C}30`, borderRadius: 14, padding: '16px 20px' }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: C, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Cooking Measurement Converter</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>Volume · Weight · Temperature</div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => { setTab(t.id); setFromUnit(t.id === 'volume' ? 'cup' : t.id === 'weight' ? 'oz' : '') }}
            style={{ flex: 1, padding: '10px 6px', borderRadius: 9, border: `1.5px solid ${tab === t.id ? C : 'var(--border-2)'}`, background: tab === t.id ? C + '12' : 'var(--bg-raised)', fontSize: 12, fontWeight: tab === t.id ? 700 : 500, color: tab === t.id ? C : 'var(--text-2)', cursor: 'pointer' }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab === 'temp' ? (
        <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 14, padding: '20px' }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
              {[['f', '°F'], ['c', '°C']].map(([m, l]) => (
                <button key={m} onClick={() => setTempMode(m)}
                  style={{ flex: 1, padding: '10px', borderRadius: 8, border: `1.5px solid ${tempMode === m ? C : 'var(--border-2)'}`, background: tempMode === m ? C + '12' : 'var(--bg-raised)', fontSize: 14, fontWeight: tempMode === m ? 700 : 500, color: tempMode === m ? C : 'var(--text-2)', cursor: 'pointer' }}>Enter in {l}</button>
              ))}
            </div>
            <input type="number" value={tempVal} onChange={e => setTempVal(+e.target.value)}
              style={{ width: '100%', height: 52, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 14px', fontSize: 20, fontWeight: 700, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', fontFamily: "'Space Grotesk',sans-serif", boxSizing: 'border-box' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            {[{ l: '°Fahrenheit', v: tempF.toFixed(1) }, { l: '°Celsius', v: tempC.toFixed(1) }].map((m, i) => (
              <div key={i} style={{ padding: '16px', background: 'var(--bg-raised)', borderRadius: 12, textAlign: 'center' }}>
                <div style={{ fontSize: 32, fontWeight: 700, color: i === 0 ? C : 'var(--text)', fontFamily: "'Space Grotesk',sans-serif" }}>{m.v}°</div>
                <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>{m.l}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 10 }}>Common oven temperatures</div>
          {OVEN_TEMPS.map((t, i) => (
            <div key={i} onClick={() => { setTempVal(tempMode === 'f' ? t.f : t.c) }}
              style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', borderRadius: 8, background: Math.abs(tempF - t.f) < 15 ? C + '10' : 'var(--bg-raised)', border: `0.5px solid ${Math.abs(tempF - t.f) < 15 ? C + '40' : 'var(--border)'}`, marginBottom: 4, cursor: 'pointer' }}>
              <span style={{ fontSize: 12, color: 'var(--text)' }}>{t.desc}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: C }}>{t.f}°F / {t.c}°C</span>
            </div>
          ))}
        </div>
      ) : (
        <CalcShell
          left={<>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 6 }}>Amount</label>
              <input type="number" value={amount} onChange={e => setAmount(+e.target.value)}
                style={{ width: '100%', height: 44, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 14px', fontSize: 17, fontWeight: 700, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', fontFamily: "'Space Grotesk',sans-serif", boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 8 }}>Convert from</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {units.map(u => (
                  <button key={u.k} onClick={() => setFromUnit(u.k)}
                    style={{ padding: '8px 10px', borderRadius: 8, border: `1.5px solid ${fromUnit === u.k ? C : 'var(--border-2)'}`, background: fromUnit === u.k ? C + '12' : 'var(--bg-raised)', fontSize: 12, fontWeight: fromUnit === u.k ? 700 : 500, color: fromUnit === u.k ? C : 'var(--text-2)', cursor: 'pointer', textAlign: 'left' }}>
                    <div>{u.label}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2 }}>{u.k}</div>
                  </button>
                ))}
              </div>
            </div>
          </>}
          right={<>
            <div style={{ background: 'var(--bg-card)', border: `1.5px solid ${C}30`, borderRadius: 14, overflow: 'hidden', marginBottom: 14 }}>
              <div style={{ padding: '10px 14px', borderBottom: '0.5px solid var(--border)', fontSize: 12, fontWeight: 700, color: 'var(--text)', fontFamily: "'Space Grotesk',sans-serif" }}>All conversions</div>
              {units.map((u, i) => {
                const val = baseValue / u[conversionKey]
                return (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 14px', borderBottom: '0.5px solid var(--border)', background: u.k === fromUnit ? C + '08' : 'transparent' }}>
                    <span style={{ fontSize: 12, color: u.k === fromUnit ? C : 'var(--text-2)' }}>{u.label}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: u.k === fromUnit ? C : 'var(--text)', fontFamily: "'Space Grotesk',sans-serif" }}>
                      {val < 0.001 ? val.toExponential(2) : val < 10 ? val.toFixed(3) : val.toFixed(1)}
                    </span>
                  </div>
                )
              })}
            </div>
            <AIHintCard hint={hint} />
          </>}
        />
      )}

      <Sec title="Frequently asked questions">
        {FAQ.map((f, i) => <Acc key={i} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} color={C} />)}
      </Sec>
    </div>
  )
}
