import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'

const FAQ = [
  { q: 'How often should I take breaks on a road trip?', a: 'The Federal Motor Carrier Safety Administration recommends breaks every 2 hours or every 100 miles — whichever comes first. Research shows driving performance degrades significantly after 2–3 hours. Take 15–20 minute breaks to walk around and stay alert.' },
  { q: 'How do I estimate road trip time accurately?', a: 'Start with Google Maps or similar for base time, then add 10–20% for real-world variations (traffic, slower speeds, road conditions). Add 20 minutes per gas stop, 30 minutes for meals, and 15 minutes per bathroom break. Most people underestimate by 25–30%.' },
  { q: 'What is the best speed for road trip fuel efficiency?', a: 'Most vehicles achieve peak fuel efficiency at 45–55 mph. Each 10 mph above 55 mph increases fuel consumption by roughly 14%. At 70 mph, you may be using 25% more fuel than at 55 mph. The time saved rarely justifies the extra cost for long distances.' },
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

export default function RoadTripCalculator({ meta, category }) {
  const C = category?.color || '#0d9488'
  const [distance, setDistance] = useState(800)
  const [speed, setSpeed] = useState(65)
  const [mpg, setMpg] = useState(30)
  const [gasPrice, setGasPrice] = useState(3.50)
  const [mealsPerDay, setMealsPerDay] = useState(2)
  const [mealCost, setMealCost] = useState(15)
  const [nights, setNights] = useState(1)
  const [hotelCost, setHotelCost] = useState(100)
  const [people, setPeople] = useState(2)
  const [openFaq, setOpenFaq] = useState(null)

  const driveHours = speed > 0 ? distance / speed : 0
  const breakStops = Math.floor(driveHours / 2)
  const breakTime = breakStops * 0.25
  const totalHours = driveHours + breakTime

  const gallons = mpg > 0 ? distance / mpg : 0
  const fuelCost = gallons * gasPrice
  const foodCost = mealsPerDay * mealCost * people * Math.max(1, Math.ceil(totalHours / 24))
  const lodgingCost = nights * hotelCost
  const totalCost = fuelCost + foodCost + lodgingCost
  const perPerson = people > 0 ? totalCost / people : totalCost

  const hint = `${distance} miles: ${Math.floor(totalHours)}h ${Math.round((totalHours % 1) * 60)}m drive. Total cost: $${totalCost.toFixed(0)} ($${perPerson.toFixed(0)}/person).`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ background: `linear-gradient(135deg,${C}12,${C}06)`, border: `1px solid ${C}30`, borderRadius: 14, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Road Trip Planner</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>Time · Fuel · Food · Lodging</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>${totalCost.toFixed(0)}</div>
          <div style={{ fontSize: 12, color: 'var(--text-3)' }}>total trip cost</div>
        </div>
      </div>

      <CalcShell
        left={<>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 10 }}>Driving</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
            {[['Distance (mi)', distance, setDistance], ['Avg speed (mph)', speed, setSpeed], ['MPG', mpg, setMpg], ['Gas price ($/gal)', gasPrice, setGasPrice]].map(([l, v, set]) => (
              <div key={l}>
                <label style={{ fontSize: 11, color: 'var(--text-3)', display: 'block', marginBottom: 4 }}>{l}</label>
                <input type="number" step={l.includes('$') ? 0.01 : 1} value={v} onChange={e => set(Math.max(0.01, +e.target.value))}
                  style={{ width: '100%', height: 40, border: '1px solid var(--border-2)', borderRadius: 7, padding: '0 10px', fontSize: 14, fontWeight: 700, background: 'var(--bg-card)', color: 'var(--text)', boxSizing: 'border-box' }} />
              </div>
            ))}
          </div>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 10 }}>Food & Lodging</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
            {[['Meals/day', mealsPerDay, setMealsPerDay], ['Cost/meal ($)', mealCost, setMealCost], ['Hotel nights', nights, setNights], ['Hotel/night ($)', hotelCost, setHotelCost]].map(([l, v, set]) => (
              <div key={l}>
                <label style={{ fontSize: 11, color: 'var(--text-3)', display: 'block', marginBottom: 4 }}>{l}</label>
                <input type="number" value={v} onChange={e => set(Math.max(0, +e.target.value))}
                  style={{ width: '100%', height: 40, border: '1px solid var(--border-2)', borderRadius: 7, padding: '0 10px', fontSize: 14, fontWeight: 700, background: 'var(--bg-card)', color: 'var(--text)', boxSizing: 'border-box' }} />
              </div>
            ))}
          </div>
          <div>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 6 }}>Number of people</label>
            <div style={{ display: 'flex', gap: 6 }}>
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} onClick={() => setPeople(n)}
                  style={{ flex: 1, padding: '9px', borderRadius: 8, border: `1.5px solid ${people === n ? C : 'var(--border-2)'}`, background: people === n ? C + '12' : 'var(--bg-raised)', fontSize: 14, fontWeight: people === n ? 700 : 500, color: people === n ? C : 'var(--text-2)', cursor: 'pointer' }}>{n}</button>
              ))}
            </div>
          </div>
        </>}
        right={<>
          <div style={{ background: 'var(--bg-card)', border: `1.5px solid ${C}30`, borderRadius: 14, padding: '16px 18px', marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 12 }}>Driving time estimate</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[{ l: 'Drive time', v: `${Math.floor(driveHours)}h ${Math.round((driveHours % 1) * 60)}m` }, { l: 'Break stops', v: `${breakStops} stops` }, { l: 'Total with breaks', v: `${Math.floor(totalHours)}h ${Math.round((totalHours % 1) * 60)}m`, c: C }, { l: 'Gallons needed', v: gallons.toFixed(1) }].map((m, i) => (
                <div key={i} style={{ padding: '10px 12px', background: 'var(--bg-raised)', borderRadius: 9 }}>
                  <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 3 }}>{m.l}</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: m.c || 'var(--text)', fontFamily: "'Space Grotesk',sans-serif" }}>{m.v}</div>
                </div>
              ))}
            </div>
          </div>
          <BreakdownTable title="Cost breakdown" rows={[
            { label: 'Fuel', value: `$${fuelCost.toFixed(2)}` },
            { label: 'Food', value: `$${foodCost.toFixed(2)}` },
            { label: 'Lodging', value: `$${lodgingCost.toFixed(2)}` },
            { label: 'Total', value: `$${totalCost.toFixed(2)}`, bold: true, highlight: true, color: C },
            { label: `Per person (÷${people})`, value: `$${perPerson.toFixed(2)}`, color: C },
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
