import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'

const clamp = (v,a,b) => Math.min(b, Math.max(a, v))

const PACES = [
  { v:'slow',     l:'Slow stroll',    sub:'< 4 km/h',  met:2.8 },
  { v:'moderate', l:'Moderate',       sub:'~5 km/h',   met:3.5 },
  { v:'fast',     l:'Fast walk',      sub:'~6 km/h',   met:4.3 },
  { v:'brisk',    l:'Brisk / power',  sub:'7+ km/h',   met:5.0 },
]

const FAQ = [
  { q:'How many calories does walking burn per step?',
    a:'Approximately 0.03–0.05 kcal per step depending on body weight and pace. A 70 kg person walking at moderate pace burns roughly 0.035 kcal per step — so 10,000 steps ≈ 350 kcal. Heavier people burn more per step because they are moving more mass.' },
  { q:'Is walking good for weight loss?',
    a:"Yes — walking is one of the most underrated fat loss tools. It's low-impact, sustainable, and accumulates significant calorie burn over time. 10,000 steps/day above a sedentary baseline burns roughly 350–500 extra kcal/day, or 2,450–3,500 kcal/week — close to 0.5 kg of fat per week from movement alone." },
  { q:'Why does the research say 10,000 steps?',
    a:"10,000 steps originated from a 1960s Japanese marketing campaign for a pedometer — not scientific research. Modern studies suggest significant health benefits begin at 6,000–7,000 steps/day and plateau around 10,000–12,000 for most adults. The key finding: any increase from your personal baseline reduces mortality risk." },
]

function Sec({ title, sub, children }) {
  return (
    <div style={{ background:'var(--bg-card)', border:'0.5px solid var(--border)', borderRadius:14, overflow:'hidden' }}>
      <div style={{ padding:'13px 18px', borderBottom:'0.5px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <span style={{ fontSize:13, fontWeight:700, color:'var(--text)', fontFamily:"'Space Grotesk',sans-serif" }}>{title}</span>
        {sub && <span style={{ fontSize:11, color:'var(--text-3)' }}>{sub}</span>}
      </div>
      <div style={{ padding:'16px 18px' }}>{children}</div>
    </div>
  )
}

function Acc({ q, a, open, onToggle, catColor }) {
  return (
    <div style={{ borderBottom:'0.5px solid var(--border)' }}>
      <button onClick={onToggle} style={{ width:'100%', display:'flex', justifyContent:'space-between', alignItems:'center', padding:'13px 0', background:'none', border:'none', cursor:'pointer', gap:12, textAlign:'left' }}>
        <span style={{ fontSize:13, fontWeight:600, color:'var(--text)', fontFamily:"'DM Sans',sans-serif", lineHeight:1.4 }}>{q}</span>
        <span style={{ fontSize:18, color:catColor, flexShrink:0, display:'inline-block', transform:open ? 'rotate(45deg)' : 'none', transition:'transform .2s' }}>+</span>
      </button>
      {open && <p style={{ fontSize:12.5, color:'var(--text-2)', lineHeight:1.75, margin:'0 0 13px', fontFamily:"'DM Sans',sans-serif" }}>{a}</p>}
    </div>
  )
}

function Stepper({ label, hint, value, onChange, min, max, step=1, unit, catColor }) {
  const [editing, setEditing] = useState(false)
  const commit = r => { const n = parseFloat(r); onChange(clamp(isNaN(n) ? value : n, min, max)); setEditing(false) }
  const btn = { width:38, height:'100%', border:'none', background:'var(--bg-raised)', color:'var(--text)', fontSize:20, fontWeight:300, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }
  return (
    <div style={{ marginBottom:16 }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
        <label style={{ fontSize:12.5, fontWeight:600, color:'var(--text)', fontFamily:"'DM Sans',sans-serif" }}>{label}</label>
        {hint && <span style={{ fontSize:10, color:'var(--text-3)' }}>{hint}</span>}
      </div>
      <div style={{ display:'flex', alignItems:'stretch', height:40, border:`1.5px solid ${editing ? catColor : 'var(--border-2)'}`, borderRadius:9, overflow:'hidden', background:'var(--bg-card)', transition:'border-color .15s' }}>
        <button onMouseDown={e => { e.preventDefault(); onChange(clamp(value - step, min, max)) }} style={{ ...btn, borderRight:'1px solid var(--border)' }} onMouseEnter={e => e.currentTarget.style.background = catColor + '18'} onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-raised)'}>−</button>
        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:5 }}>
          {editing
            ? <input type="number" defaultValue={value} onBlur={e => commit(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') commit(e.target.value); if (e.key === 'Escape') setEditing(false) }} style={{ width:'55%', border:'none', background:'transparent', textAlign:'center', fontSize:15, fontWeight:700, color:'var(--text)', outline:'none' }} autoFocus />
            : <span onClick={() => setEditing(true)} style={{ fontSize:15, fontWeight:700, color:'var(--text)', cursor:'text', minWidth:36, textAlign:'center' }}>{value}</span>
          }
          <span style={{ fontSize:11, color:'var(--text-3)', fontWeight:500 }}>{unit}</span>
        </div>
        <button onMouseDown={e => { e.preventDefault(); onChange(clamp(value + step, min, max)) }} style={{ ...btn, borderLeft:'1px solid var(--border)' }} onMouseEnter={e => e.currentTarget.style.background = catColor + '18'} onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-raised)'}>+</button>
      </div>
    </div>
  )
}

export default function StepsToCaloriesCalculator({ meta, category }) {
  const catColor = category?.color || '#22a355'
  const [steps,   setSteps]   = useState(10000)
  const [wKg,     setWKg]     = useState(70)
  const [pace,    setPace]    = useState('moderate')
  const [openFaq, setOpenFaq] = useState(null)
  // interactive section state
  const [goalSteps, setGoalSteps] = useState(10000)

  const paceObj    = PACES.find(p => p.v === pace) || PACES[1]
  const strideM    = 0.762
  const distKm     = (steps * strideM) / 1000
  const durationHr = distKm / (pace === 'slow' ? 4 : pace === 'moderate' ? 5 : pace === 'fast' ? 6 : 7)
  const kcal       = Math.round(paceObj.met * wKg * durationHr)
  const netKcal    = Math.round(kcal - wKg * durationHr * 1.2)
  const fatG       = Math.round(kcal / 7700 * 1000)
  const deficitPct = Math.round((kcal / 2000) * 100)

  // goal projection
  const goalDist   = (goalSteps * strideM) / 1000
  const goalDur    = goalDist / 5
  const goalKcal   = Math.round(paceObj.met * wKg * goalDur)
  const weeklyKcal = goalKcal * 7
  const monthlyKcal= goalKcal * 30

  const hint = `${steps.toLocaleString()} steps at ${pace} pace = ~${kcal} kcal (~${distKm.toFixed(2)} km, ${Math.round(durationHr * 60)} min). Net above resting: ${netKcal} kcal.`

  const storyColors = [catColor, '#f59e0b', '#0ea5e9']
  const storySofts  = [catColor + '18', '#fef3c7', '#e0f2fe']

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <CalcShell
        left={<>
          <div style={{ fontSize:10, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:14 }}>Your stats</div>
          <Stepper label="Steps" value={steps} onChange={setSteps} min={100} max={50000} step={500} unit="steps" catColor={catColor} />
          <Stepper label="Body weight" value={wKg} onChange={setWKg} min={30} max={250} unit="kg" catColor={catColor} />
          <div style={{ borderTop:'0.5px solid var(--border)', paddingTop:16, marginTop:4 }}>
            <div style={{ fontSize:12, fontWeight:600, color:'var(--text-2)', marginBottom:8, fontFamily:"'DM Sans',sans-serif" }}>Walking pace</div>
            <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
              {PACES.map(o => (
                <button key={o.v} onClick={() => setPace(o.v)} style={{ display:'flex', justifyContent:'space-between', padding:'8px 12px', borderRadius:8, border:`1.5px solid ${pace === o.v ? catColor : 'var(--border-2)'}`, background:pace === o.v ? catColor + '12' : 'var(--bg-raised)', cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>
                  <div>
                    <div style={{ fontSize:12, fontWeight:600, color:pace === o.v ? catColor : 'var(--text)' }}>{o.l}</div>
                    <div style={{ fontSize:10, color:'var(--text-3)' }}>{o.sub}</div>
                  </div>
                  <span style={{ fontSize:10, color:'var(--text-3)' }}>MET {o.met}</span>
                </button>
              ))}
            </div>
          </div>
          <div style={{ borderTop:'0.5px solid var(--border)', paddingTop:12, marginTop:12 }}>
            <div style={{ fontSize:12, fontWeight:600, color:'var(--text-2)', marginBottom:8, fontFamily:"'DM Sans',sans-serif" }}>Quick presets</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:5 }}>
              {[5000,7500,10000,12000,15000,20000].map(s => (
                <button key={s} onClick={() => setSteps(s)} style={{ padding:'7px', borderRadius:7, fontSize:10, fontWeight:steps === s ? 700 : 500, color:steps === s ? catColor : 'var(--text-2)', border:`1.5px solid ${steps === s ? catColor : 'var(--border-2)'}`, background:steps === s ? catColor + '12' : 'var(--bg-raised)', cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>
                  {(s / 1000).toFixed(s % 1000 === 0 ? 0 : 1)}K
                </button>
              ))}
            </div>
          </div>
        </>}
        right={<>
          {/* Narrative Story */}
          <div style={{ background:'var(--bg-card)', border:'0.5px solid var(--border)', borderRadius:14, overflow:'hidden', marginBottom:14 }}>
            <div style={{ padding:'11px 16px', borderBottom:'0.5px solid var(--border)', display:'flex', justifyContent:'space-between' }}>
              <span style={{ fontSize:12, fontWeight:700, color:'var(--text)', fontFamily:"'Space Grotesk',sans-serif" }}>Your steps story</span>
              <span style={{ fontSize:10, color:'var(--text-3)' }}>Updates live</span>
            </div>
            <div style={{ padding:'16px 18px', display:'flex', flexDirection:'column', gap:10 }}>
              {[
                { label:'Calories burned',   headline:`${steps.toLocaleString()} steps burns ~${kcal} kcal`,           detail:`At ${paceObj.l} pace over ${distKm.toFixed(2)} km (${Math.round(durationHr * 60)} min). Net calorie burn above resting: ~${netKcal} kcal.` },
                { label:'Fat mobilised',     headline:`~${fatG}g of fat mobilised from those steps`,                    detail:`The body uses a mix of carbs and fat. Walking burns a higher fat percentage than running but fewer total calories. Consistency compounds.` },
                { label:'In context',        headline:`That's ${deficitPct}% of a 2,000 kcal daily intake`,             detail:`10,000 steps/day burns ~${Math.round(paceObj.met * wKg * (10000 * strideM / 1000 / 5))} kcal compared to being sedentary. Over a week: ~${Math.round(kcal * 7).toLocaleString()} kcal.` },
              ].map((s, i) => (
                <div key={i} style={{ borderLeft:`3px solid ${storyColors[i]}`, paddingLeft:12, paddingTop:6, paddingBottom:6, borderRadius:'0 8px 8px 0', background:storySofts[i] }}>
                  <div style={{ fontSize:9, fontWeight:700, color:storyColors[i], textTransform:'uppercase', letterSpacing:'.07em', marginBottom:4 }}>{s.label}</div>
                  <div style={{ fontSize:13, fontWeight:600, color:'var(--text)', lineHeight:1.55, fontFamily:"'Space Grotesk',sans-serif" }}>{s.headline}</div>
                  <div style={{ fontSize:11.5, color:'var(--text-2)', lineHeight:1.6, marginTop:4, fontFamily:"'DM Sans',sans-serif" }}>{s.detail}</div>
                </div>
              ))}
            </div>
          </div>
          <BreakdownTable title="Calorie Summary" rows={[
            { label:'Calories burned',    value:`~${kcal} kcal`,            bold:true, highlight:true, color:catColor },
            { label:'Distance',           value:`${distKm.toFixed(2)} km` },
            { label:'Duration',           value:`~${Math.round(durationHr * 60)} min` },
            { label:'Net above resting',  value:`~${netKcal} kcal`,         color:'#f59e0b' },
            { label:'Fat mobilised',      value:`~${fatG}g` },
            { label:'% of 2000 kcal diet',value:`${deficitPct}%` },
          ]} />
          <AIHintCard hint={hint} />
        </>}
      />

      {/* 🎮 INTERACTIVE — Goal planner */}
      <Sec title="🎯 Step goal planner — interactive" sub="See the long-term impact of your daily step goal">
        <p style={{ fontSize:12, color:'var(--text-2)', lineHeight:1.7, marginBottom:16, fontFamily:"'DM Sans',sans-serif" }}>
          Set a daily step goal and see exactly what it means for your calorie burn over time. Uses your current weight and pace setting.
        </p>
        <Stepper label="Daily step goal" value={goalSteps} onChange={setGoalSteps} min={1000} max={30000} step={500} unit="steps" catColor={catColor} />
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
          {[
            { label:'Per day',     val:`${goalKcal.toLocaleString()} kcal`,        color:catColor  },
            { label:'Per week',    val:`${weeklyKcal.toLocaleString()} kcal`,       color:'#f59e0b' },
            { label:'Per month',   val:`${monthlyKcal.toLocaleString()} kcal`,      color:'#8b5cf6' },
          ].map((s, i) => (
            <div key={i} style={{ padding:'12px', borderRadius:10, background:'var(--bg-raised)', border:'0.5px solid var(--border)', textAlign:'center' }}>
              <div style={{ fontSize:9, color:'var(--text-3)', marginBottom:4 }}>{s.label}</div>
              <div style={{ fontSize:16, fontWeight:700, color:s.color, fontFamily:"'Space Grotesk',sans-serif" }}>{s.val}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop:14, padding:'11px 14px', background:catColor + '10', borderRadius:10, border:`1px solid ${catColor}25` }}>
          <div style={{ fontSize:12, fontWeight:600, color:catColor, marginBottom:3 }}>Annual projection</div>
          <div style={{ fontSize:11.5, color:'var(--text-2)', lineHeight:1.65 }}>
            At {goalSteps.toLocaleString()} steps/day, you burn <strong style={{ color:catColor }}>{(goalKcal * 365).toLocaleString()} kcal/year</strong> from walking — equivalent to approximately <strong style={{ color:catColor }}>{Math.round(goalKcal * 365 / 7700)} kg</strong> of body fat over a year if sustained.
          </div>
        </div>
      </Sec>

      {/* 🧠 INTERESTING — NEAT science */}
      <Sec title="Why NEAT is the secret weapon for fat loss" sub="Non-Exercise Activity Thermogenesis">
        <p style={{ fontSize:12, color:'var(--text-2)', lineHeight:1.7, marginBottom:14, fontFamily:"'DM Sans',sans-serif" }}>
          NEAT (Non-Exercise Activity Thermogenesis) is the energy burned through all non-sport movement — walking, fidgeting, standing, chores. Research by Dr. James Levine at the Mayo Clinic found NEAT can vary by up to <strong style={{ color:catColor }}>2,000 kcal/day</strong> between individuals of the same size.
        </p>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:14 }}>
          {[
            { label:'Sedentary person',     kcal:'200–400',  note:'Mostly seated all day',          color:'#ef4444' },
            { label:'Lightly active',       kcal:'400–800',  note:'Some standing and walking',       color:'#f59e0b' },
            { label:'Moderately active',    kcal:'800–1200', note:'Regular movement throughout day', color:'#3b82f6' },
            { label:'Highly active (NEAT)', kcal:'1200–2000',note:'Constantly moving, standing job', color:'#10b981' },
          ].map((s, i) => (
            <div key={i} style={{ padding:'10px 12px', borderRadius:8, background:'var(--bg-raised)', border:'0.5px solid var(--border)' }}>
              <div style={{ fontSize:11, fontWeight:700, color:s.color, marginBottom:3 }}>{s.label}</div>
              <div style={{ fontSize:16, fontWeight:700, color:'var(--text)', fontFamily:"'Space Grotesk',sans-serif" }}>{s.kcal} kcal</div>
              <div style={{ fontSize:10, color:'var(--text-3)', marginTop:2 }}>{s.note}</div>
            </div>
          ))}
        </div>
        <p style={{ fontSize:12, color:'var(--text-2)', lineHeight:1.7, margin:0, fontFamily:"'DM Sans',sans-serif" }}>
          Unlike formal exercise, NEAT doesn't require gym sessions, sweat, or recovery time. Increasing step count is the most accessible way to raise your NEAT — and it compounds silently in the background every day.
        </p>
      </Sec>

      {/* ⚡ FUN FACT */}
      <Sec title="⚡ Did you know?" sub="Steps facts worth knowing">
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {[
            { fact:'The average person walks about 100,000 miles in a lifetime — roughly 4 times around the Earth.', icon:'🌍' },
            { fact:"10,000 steps originated in a 1960s Japanese marketing campaign for a pedometer called 万歩計 (Manpo-kei — \"10,000 steps meter\"). It was never based on scientific research.", icon:'🇯🇵' },
            { fact:'Every 2,000 extra steps per day reduces cardiovascular mortality risk by ~8% according to a 2023 European Heart Journal meta-analysis.', icon:'❤️' },
            { fact:'Walking after meals (even 10 minutes) reduces blood sugar spikes by up to 22% compared to sitting — more effectively than a single longer daily walk.', icon:'🍽️' },
          ].map((f, i) => (
            <div key={i} style={{ display:'flex', gap:12, padding:'11px 14px', borderRadius:9, background:'var(--bg-raised)', border:'0.5px solid var(--border)' }}>
              <span style={{ fontSize:18, flexShrink:0 }}>{f.icon}</span>
              <p style={{ fontSize:12, color:'var(--text-2)', lineHeight:1.65, margin:0, fontFamily:"'DM Sans',sans-serif" }}>{f.fact}</p>
            </div>
          ))}
        </div>
      </Sec>

      <Sec title="Frequently asked questions">
        {FAQ.map((f, i) => (<Acc key={i} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} catColor={catColor} />))}
      </Sec>
    </div>
  )
}
