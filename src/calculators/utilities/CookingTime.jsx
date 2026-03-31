import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'

const MEATS = [
  { id: 'chicken_whole', label: 'Whole Chicken', icon: '🐔',
    doneness: [{ label: 'Safe (165°F)', tempF: 165, tempC: 74, note: 'USDA minimum. Check at thickest part of thigh.' }],
    timeRule: (lbs) => `${Math.round(lbs * 15 + 10)}–${Math.round(lbs * 18 + 10)} min at 375°F`,
    tip: 'Rest 15 min before carving. Use a meat thermometer in the thigh — not touching bone.' },
  { id: 'chicken_breast', label: 'Chicken Breast', icon: '🍗',
    doneness: [{ label: 'Safe (165°F)', tempF: 165, tempC: 74, note: 'No pink — slice to check.' }],
    timeRule: (lbs) => `${Math.round(lbs * 18 + 5)}–${Math.round(lbs * 22 + 5)} min at 375°F`,
    tip: 'Pound to even thickness for uniform cooking. Cover with foil if browning too fast.' },
  { id: 'beef_steak', label: 'Beef Steak', icon: '🥩',
    doneness: [
      { label: 'Rare', tempF: 125, tempC: 52, note: 'Cool red center' },
      { label: 'Medium-rare', tempF: 135, tempC: 57, note: 'Warm red center' },
      { label: 'Medium', tempF: 145, tempC: 63, note: 'Warm pink center — USDA safe' },
      { label: 'Well done', tempF: 160, tempC: 71, note: 'No pink' },
    ],
    timeRule: () => '4–6 min per side (1" steak)',
    tip: 'Remove from heat 5°F before target — carryover cooking continues. Rest 5 min.' },
  { id: 'pork', label: 'Pork (chops/loin)', icon: '🐷',
    doneness: [
      { label: 'Safe (145°F)', tempF: 145, tempC: 63, note: 'USDA safe — slight pink is OK' },
      { label: 'Well done', tempF: 160, tempC: 71, note: 'No pink' },
    ],
    timeRule: (lbs) => `${Math.round(lbs * 20)}–${Math.round(lbs * 25)} min at 375°F`,
    tip: 'Pork at 145°F is safe and juicy — many people overcook pork unnecessarily.' },
  { id: 'fish', label: 'Fish Fillet', icon: '🐟',
    doneness: [{ label: 'Flakes easily (145°F)', tempF: 145, tempC: 63, note: 'Flesh opaque and flakes with fork' }],
    timeRule: () => '8–10 min per inch thickness at 400°F',
    tip: 'Fish continues cooking after removal. Remove when just opaque at the thickest part.' },
  { id: 'turkey', label: 'Turkey (whole)', icon: '🦃',
    doneness: [{ label: 'Safe (165°F)', tempF: 165, tempC: 74, note: 'Check in thigh — deepest part' }],
    timeRule: (lbs) => `${Math.round(lbs * 13)}–${Math.round(lbs * 15)} min (unstuffed) at 325°F`,
    tip: 'Add 30 min if stuffed. Rest 20–30 min under foil before carving.' },
  { id: 'lamb', label: 'Lamb', icon: '🐑',
    doneness: [
      { label: 'Medium-rare', tempF: 135, tempC: 57, note: 'Pink and juicy — most preferred' },
      { label: 'Medium', tempF: 145, tempC: 63, note: 'Slightly pink' },
    ],
    timeRule: (lbs) => `${Math.round(lbs * 18)}–${Math.round(lbs * 22)} min at 350°F`,
    tip: 'Lamb is best served medium-rare to medium. Rest 10 min before slicing.' },
]

const FAQ = [
  { q: 'Why should I use a meat thermometer?', a: 'Color and texture are unreliable indicators of doneness. A meat thermometer is the only accurate way to ensure food safety and optimal texture. Undercooked poultry can cause salmonella. Overcooked meat is dry and tough — both are avoidable with a thermometer.' },
  { q: 'What is carryover cooking?', a: 'After removing meat from heat, internal temperature continues to rise for 5–15 minutes. A steak at 140°F when removed will reach ~145°F while resting. This is why recipes say to remove meat 5°F before your target temperature.' },
  { q: 'How long should I rest meat before cutting?', a: 'Resting allows juices to redistribute through the meat. Without resting, cutting releases these juices immediately and the meat dries out. Rule of thumb: rest small cuts (steaks, chops) 5 min, medium roasts 10–15 min, large roasts and turkey 20–30 min.' },
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

export default function CookingTime({ meta, category }) {
  const C = category?.color || '#0d9488'
  const [meatId, setMeatId] = useState('beef_steak')
  const [weight, setWeight] = useState(1.5)
  const [selectedDoneness, setSelectedDoneness] = useState(0)
  const [unit, setUnit] = useState('f')
  const [openFaq, setOpenFaq] = useState(null)

  const meat = MEATS.find(m => m.id === meatId)
  const don = meat.doneness[Math.min(selectedDoneness, meat.doneness.length - 1)]
  const timeStr = meat.timeRule(weight)
  const targetTemp = unit === 'f' ? don.tempF : don.tempC
  const hint = `${meat.label}, ${weight} lbs: Target ${don.tempF}°F / ${don.tempC}°C (${don.label}). Cook time: ${timeStr}.`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ background: `linear-gradient(135deg,${C}12,${C}06)`, border: `1px solid ${C}30`, borderRadius: 14, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Cooking Temperatures</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>Internal temp · Doneness · Rest time</div>
        </div>
        <div style={{ padding: '8px 18px', background: C + '15', borderRadius: 10, textAlign: 'right' }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>{targetTemp}°{unit.toUpperCase()}</div>
          <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{don.label}</div>
        </div>
      </div>

      <CalcShell
        left={<>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 8 }}>Select meat</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {MEATS.map(m => (
                <button key={m.id} onClick={() => { setMeatId(m.id); setSelectedDoneness(0) }}
                  style={{ padding: '10px 8px', borderRadius: 9, border: `1.5px solid ${meatId === m.id ? C : 'var(--border-2)'}`, background: meatId === m.id ? C + '12' : 'var(--bg-raised)', cursor: 'pointer', textAlign: 'center' }}>
                  <div style={{ fontSize: 20, marginBottom: 3 }}>{m.icon}</div>
                  <div style={{ fontSize: 11, fontWeight: meatId === m.id ? 700 : 500, color: meatId === m.id ? C : 'var(--text-2)', lineHeight: 1.3 }}>{m.label}</div>
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 6 }}>Weight (lbs)</label>
            <input type="number" step="0.25" value={weight} onChange={e => setWeight(Math.max(0.25, +e.target.value))}
              style={{ width: '100%', height: 44, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 14px', fontSize: 17, fontWeight: 700, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', fontFamily: "'Space Grotesk',sans-serif", boxSizing: 'border-box' }} />
          </div>

          {meat.doneness.length > 1 && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", display: 'block', marginBottom: 8 }}>Doneness</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {meat.doneness.map((d, i) => (
                  <button key={i} onClick={() => setSelectedDoneness(i)}
                    style={{ padding: '9px 14px', borderRadius: 9, border: `1.5px solid ${selectedDoneness === i ? C : 'var(--border-2)'}`, background: selectedDoneness === i ? C + '12' : 'var(--bg-raised)', cursor: 'pointer', textAlign: 'left', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 13, fontWeight: selectedDoneness === i ? 700 : 500, color: selectedDoneness === i ? C : 'var(--text)' }}>{d.label}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{d.tempF}°F / {d.tempC}°C</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 6 }}>
            {[['f', '°F'], ['c', '°C']].map(([m, l]) => (
              <button key={m} onClick={() => setUnit(m)}
                style={{ flex: 1, padding: '8px', borderRadius: 8, border: `1.5px solid ${unit === m ? C : 'var(--border-2)'}`, background: unit === m ? C + '12' : 'var(--bg-raised)', fontSize: 13, fontWeight: unit === m ? 700 : 500, color: unit === m ? C : 'var(--text-2)', cursor: 'pointer' }}>{l}</button>
            ))}
          </div>
        </>}
        right={<>
          <div style={{ background: 'var(--bg-card)', border: `1.5px solid ${C}30`, borderRadius: 14, padding: '18px 20px', marginBottom: 14 }}>
            <div style={{ fontSize: 42, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif", lineHeight: 1 }}>{targetTemp}°{unit.toUpperCase()}</div>
            <div style={{ fontSize: 14, color: 'var(--text-2)', marginTop: 6 }}>{don.label} — {don.note}</div>
            <div style={{ marginTop: 16, padding: '10px 13px', background: 'var(--bg-raised)', borderRadius: 9, fontSize: 13, fontWeight: 700, color: 'var(--text)', fontFamily: "'Space Grotesk',sans-serif" }}>{timeStr}</div>
            <div style={{ marginTop: 12, padding: '10px 13px', background: C + '08', borderRadius: 9, fontSize: 12, color: 'var(--text-2)', lineHeight: 1.65, border: `1px solid ${C}20` }}>
              💡 {meat.tip}
            </div>
          </div>

          <BreakdownTable title="Summary" rows={[
            { label: 'Meat', value: meat.label },
            { label: 'Weight', value: `${weight} lbs` },
            { label: 'Target (°F)', value: `${don.tempF}°F` },
            { label: 'Target (°C)', value: `${don.tempC}°C` },
            { label: 'Cook time', value: timeStr, bold: true, highlight: true, color: C },
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
