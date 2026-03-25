import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'

const clamp = (v,a,b) => Math.min(b, Math.max(a, v))

const SOURCES = [
  { key:'espresso',    label:'Espresso (30ml)',      mg:63,  icon:'☕' },
  { key:'drip',        label:'Drip coffee (240ml)',  mg:150, icon:'☕' },
  { key:'americano',   label:'Americano',            mg:126, icon:'☕' },
  { key:'latte',       label:'Latte / cappuccino',   mg:75,  icon:'☕' },
  { key:'green_tea',   label:'Green tea (240ml)',    mg:28,  icon:'🍵' },
  { key:'black_tea',   label:'Black tea (240ml)',    mg:47,  icon:'🍵' },
  { key:'matcha',      label:'Matcha latte',         mg:70,  icon:'🍵' },
  { key:'energy',      label:'Energy drink (250ml)', mg:80,  icon:'⚡' },
  { key:'cola',        label:'Cola (330ml)',          mg:35,  icon:'🥤' },
  { key:'preworkout',  label:'Pre-workout (1 scoop)',mg:200, icon:'💪' },
]

const FAQ = [
  { q:'How much caffeine is safe per day?',
    a:'The FDA and EFSA consider up to 400mg/day safe for healthy adults — roughly 4 cups of drip coffee. Pregnant women are advised to limit to 200mg/day. Sensitivity varies significantly by genetics — CYP1A2 fast metabolisers clear caffeine quickly, while slow metabolisers feel effects much longer.' },
  { q:'When should I stop drinking caffeine?',
    a:"Caffeine has a half-life of 5–6 hours. To avoid disrupting sleep, stop consuming caffeine at least 6 hours before bedtime — ideally 8–10 hours for sensitive individuals. A single 150mg coffee at 3pm can still contribute 37–75mg at 11pm, measurably reducing sleep quality even if you fall asleep normally." },
  { q:"Does caffeine cause anxiety?",
    a:'Caffeine is an adenosine antagonist and stimulates cortisol and adrenaline release. At high doses (>400mg) it commonly causes jitteriness and anxiety, especially in slow metabolisers. If you experience anxiety, reducing dose or switching to lower-caffeine sources (matcha, green tea) is more effective than timing alone.' },
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

export default function CaffeineCalculator({ meta, category }) {
  const catColor   = category?.color || '#f97316'
  const [wKg,      setWKg]      = useState(75)
  const [bedHour,  setBedHour]  = useState(23)
  const [items,    setItems]    = useState([{ key:'drip', hour:8, qty:1 }, { key:'espresso', hour:13, qty:1 }])
  const [openFaq,  setOpenFaq]  = useState(null)

  const addItem   = () => setItems(i => [...i, { key:'drip', hour:9, qty:1 }])
  const removeItem= idx => setItems(i => i.filter((_, j) => j !== idx))
  const updateItem= (idx, f, v) => setItems(i => i.map((it, j) => j === idx ? { ...it, [f]:v } : it))

  const now    = new Date()
  const nowH   = now.getHours() + now.getMinutes() / 60

  const totalMg    = items.reduce((s, it) => { const src = SOURCES.find(x => x.key === it.key) || SOURCES[0]; return s + src.mg * it.qty }, 0)
  const activeMg   = items.reduce((s, it) => { const src = SOURCES.find(x => x.key === it.key) || SOURCES[0]; const hoursAgo = clamp(nowH - it.hour, 0, 24); return s + src.mg * it.qty * Math.pow(0.5, hoursAgo / 5.5) }, 0)
  const atBedMg    = items.reduce((s, it) => { const src = SOURCES.find(x => x.key === it.key) || SOURCES[0]; const hoursUntil = clamp(bedHour - it.hour, 0, 24); return s + src.mg * it.qty * Math.pow(0.5, hoursUntil / 5.5) }, 0)
  const safeLimit  = 400
  const remaining  = Math.max(0, safeLimit - totalMg)
  const mgPerKg    = totalMg / wKg
  const status     = totalMg <= 200 ? 'Low' : totalMg <= 400 ? 'Moderate' : totalMg <= 600 ? 'High' : 'Very high'
  const statusColor= totalMg <= 200 ? '#10b981' : totalMg <= 400 ? '#f59e0b' : totalMg <= 600 ? '#f97316' : '#ef4444'
  const statusSoft = totalMg <= 200 ? '#d1fae5' : totalMg <= 400 ? '#fef3c7' : totalMg <= 600 ? '#ffedd5' : '#fee2e2'
  const score      = clamp(Math.round((1 - totalMg / 600) * 100), 0, 100)
  const R = 42, C = 54, circ = 2 * Math.PI * R, fill = circ * (score / 100)

  const hint = `Total caffeine: ${Math.round(totalMg)}mg (limit: 400mg). Active now: ~${Math.round(activeMg)}mg. At bedtime: ~${Math.round(atBedMg)}mg. ${mgPerKg.toFixed(1)}mg/kg. Status: ${status}.`

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <CalcShell
        left={<>
          <div style={{ fontSize:10, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:14 }}>Your stats</div>
          <Stepper label="Body weight" value={wKg} onChange={setWKg} min={30} max={200} unit="kg" catColor={catColor} />
          <Stepper label="Bedtime (hour)" value={bedHour} onChange={setBedHour} min={18} max={3} unit="hr" catColor={catColor} />

          <div style={{ borderTop:'0.5px solid var(--border)', paddingTop:16, marginTop:4 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
              <span style={{ fontSize:12, fontWeight:600, color:'var(--text-2)', fontFamily:"'DM Sans',sans-serif" }}>Caffeine log today</span>
              <button onClick={addItem} style={{ fontSize:11, fontWeight:700, color:catColor, background:catColor + '15', border:`1px solid ${catColor}`, borderRadius:8, padding:'3px 10px', cursor:'pointer' }}>+ Add</button>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {items.map((it, idx) => {
                const src = SOURCES.find(s => s.key === it.key) || SOURCES[0]
                return (
                  <div key={idx} style={{ padding:'10px 12px', borderRadius:9, background:'var(--bg-raised)', border:'0.5px solid var(--border)' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:7 }}>
                      <span style={{ fontSize:11, fontWeight:700, color:'var(--text)' }}>{src.icon} {Math.round(src.mg * it.qty)}mg</span>
                      <button onClick={() => removeItem(idx)} style={{ fontSize:15, color:'var(--text-3)', background:'none', border:'none', cursor:'pointer', lineHeight:1 }}>×</button>
                    </div>
                    <select value={it.key} onChange={e => updateItem(idx, 'key', e.target.value)} style={{ width:'100%', marginBottom:7, padding:'5px 8px', borderRadius:7, border:'1px solid var(--border)', background:'var(--bg-card)', color:'var(--text)', fontSize:11, fontFamily:"'DM Sans',sans-serif" }}>
                      {SOURCES.map(s => (<option key={s.key} value={s.key}>{s.icon} {s.label} ({s.mg}mg)</option>))}
                    </select>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
                      <div>
                        <div style={{ fontSize:10, color:'var(--text-3)', marginBottom:3 }}>Hour consumed</div>
                        <select value={it.hour} onChange={e => updateItem(idx, 'hour', parseInt(e.target.value))} style={{ width:'100%', padding:'4px 8px', borderRadius:7, border:'1px solid var(--border)', background:'var(--bg-card)', color:'var(--text)', fontSize:11 }}>
                          {Array.from({ length:24 }, (_, h) => (<option key={h} value={h}>{String(h).padStart(2, '0')}:00</option>))}
                        </select>
                      </div>
                      <div>
                        <div style={{ fontSize:10, color:'var(--text-3)', marginBottom:3 }}>Quantity</div>
                        <select value={it.qty} onChange={e => updateItem(idx, 'qty', parseFloat(e.target.value))} style={{ width:'100%', padding:'4px 8px', borderRadius:7, border:'1px solid var(--border)', background:'var(--bg-card)', color:'var(--text)', fontSize:11 }}>
                          {[0.5,1,1.5,2,3].map(q => (<option key={q} value={q}>×{q}</option>))}
                        </select>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </>}
        right={<>
          {/* Score Card */}
          <div style={{ background:'var(--bg-card)', border:'0.5px solid var(--border)', borderRadius:14, overflow:'hidden', marginBottom:14 }}>
            <div style={{ padding:'11px 16px', borderBottom:'0.5px solid var(--border)', display:'flex', justifyContent:'space-between' }}>
              <span style={{ fontSize:12, fontWeight:700, color:'var(--text)', fontFamily:"'Space Grotesk',sans-serif" }}>Caffeine Score</span>
              <span style={{ fontSize:10, color:'var(--text-3)' }}>Updates live</span>
            </div>
            <div style={{ padding:'16px 18px' }}>
              <div style={{ display:'flex', gap:18, alignItems:'center', marginBottom:14 }}>
                <svg viewBox="0 0 108 108" width="90" height="90" style={{ flexShrink:0 }}>
                  <circle cx={C} cy={C} r={R} fill="none" stroke="var(--border)" strokeWidth="11" />
                  <circle cx={C} cy={C} r={R} fill="none" stroke={statusColor} strokeWidth="11" strokeLinecap="round" strokeDasharray={`${fill} ${circ}`} strokeDashoffset={circ / 4} transform={`rotate(-90 ${C} ${C})`} style={{ transition:'stroke-dasharray .6s, stroke .3s' }} />
                  <text x={C} y={C - 6} textAnchor="middle" fontSize="20" fontWeight="700" fill="var(--text)" fontFamily="inherit">{score}</text>
                  <text x={C} y={C + 10} textAnchor="middle" fontSize="9" fill="var(--text-3)" fontFamily="inherit">/ 100</text>
                </svg>
                <div>
                  <div style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'5px 12px 5px 8px', borderRadius:20, background:statusSoft, border:`1px solid ${statusColor}35`, marginBottom:6 }}>
                    <div style={{ width:8, height:8, borderRadius:'50%', background:statusColor }} />
                    <span style={{ fontSize:12, fontWeight:700, color:statusColor }}>{status}</span>
                  </div>
                  <div style={{ fontSize:26, fontWeight:700, color:catColor, fontFamily:"'Space Grotesk',sans-serif" }}>{Math.round(totalMg)}mg</div>
                  <div style={{ fontSize:10, color:'var(--text-3)', marginTop:2 }}>of 400mg limit</div>
                </div>
              </div>
              {[
                { label:'Total today',    value:`${Math.round(totalMg)}mg`,  score:(totalMg/400)*100,   color:statusColor, note:`${Math.round((totalMg/400)*100)}% of safe daily limit` },
                { label:'Active right now',value:`~${Math.round(activeMg)}mg`,score:(activeMg/200)*100, color:'#f59e0b',   note:'Still in your bloodstream stimulating you' },
                { label:'At bedtime',     value:`~${Math.round(atBedMg)}mg`, score:(atBedMg/100)*100,   color:atBedMg > 50 ? '#ef4444' : '#22a355', note: atBedMg > 50 ? '⚠️ May disrupt sleep quality' : '✓ Low — should not disrupt sleep' },
              ].map((f, i) => (
                <div key={i} style={{ marginBottom:10 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, marginBottom:4 }}>
                    <span style={{ color:'var(--text-2)' }}>{f.label}</span>
                    <span style={{ fontWeight:700, color:f.color }}>{f.value}</span>
                  </div>
                  <div style={{ height:6, background:'var(--border)', borderRadius:3 }}>
                    <div style={{ height:'100%', width:`${clamp(f.score, 0, 100)}%`, background:f.color, borderRadius:3, transition:'width .5s' }} />
                  </div>
                  <div style={{ fontSize:10, color:'var(--text-3)', marginTop:2 }}>{f.note}</div>
                </div>
              ))}
            </div>
          </div>
          <BreakdownTable title="Caffeine Summary" rows={[
            { label:'Total today',    value:`${Math.round(totalMg)}mg`,  bold:true, highlight:true, color:statusColor },
            { label:'Safe limit',     value:'400mg/day' },
            { label:'Remaining',      value:`${remaining}mg`,            color:catColor },
            { label:'Active now',     value:`~${Math.round(activeMg)}mg` },
            { label:'At bedtime',     value:`~${Math.round(atBedMg)}mg`, color:atBedMg > 50 ? '#ef4444' : '#22a355' },
            { label:'Per kg',         value:`${mgPerKg.toFixed(1)}mg/kg` },
          ]} />
          <AIHintCard hint={hint} />
        </>}
      />

      {/* 🎮 INTERACTIVE — Find your personal cut-off time */}
      <Sec title="🎯 Find your personal caffeine cut-off" sub="Interactive — adjust to see when caffeine clears">
        <p style={{ fontSize:12, color:'var(--text-2)', lineHeight:1.7, marginBottom:16, fontFamily:"'DM Sans',sans-serif" }}>
          Drag the slider to see how many hours before bed you should stop caffeine to have less than 50mg active at bedtime.
        </p>
        {(() => {
          const lastCoffee = items.length > 0 ? Math.max(...items.map(it => it.hour)) : 14
          const halfLife = 5.5
          const lastItemMg = items.reduce((s, it) => { const src = SOURCES.find(x => x.key === it.key) || SOURCES[0]; return it.hour === lastCoffee ? s + src.mg * it.qty : s }, totalMg * 0.5)
          const clearHours = lastItemMg > 0 ? (Math.log(lastItemMg / 50) / Math.log(2)) * halfLife : 0
          const cutOffHour = Math.round(bedHour - clearHours)
          const safeHour = cutOffHour < 0 ? cutOffHour + 24 : cutOffHour
          return (
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              {[
                { label:'Last caffeine consumed', val:`${lastCoffee}:00`,                color:'var(--text)'  },
                { label:'Hours until bed',        val:`${Math.round(bedHour - (nowH < bedHour ? nowH : nowH - 24))}h`, color:'var(--text)' },
                { label:'Recommended cut-off',    val:`${safeHour}:00`,                  color:catColor       },
                { label:'At bedtime',             val:`~${Math.round(atBedMg)}mg`,       color:atBedMg > 50 ? '#ef4444' : '#22a355' },
              ].map((s, i) => (
                <div key={i} style={{ padding:'11px 13px', borderRadius:9, background:'var(--bg-raised)', border:'0.5px solid var(--border)' }}>
                  <div style={{ fontSize:10, color:'var(--text-3)', marginBottom:3 }}>{s.label}</div>
                  <div style={{ fontSize:18, fontWeight:700, color:s.color, fontFamily:"'Space Grotesk',sans-serif" }}>{s.val}</div>
                </div>
              ))}
            </div>
          )
        })()}
      </Sec>

      {/* 🧠 INTERESTING — How caffeine works */}
      <Sec title="How caffeine actually works in your brain" sub="The adenosine mechanism explained">
        <p style={{ fontSize:12, color:'var(--text-2)', lineHeight:1.7, marginBottom:14, fontFamily:"'DM Sans',sans-serif" }}>
          Caffeine does not give you energy — it blocks the signal that makes you feel tired. Adenosine is a chemical that builds up in your brain throughout the day, progressively making you feel more sleepy. Caffeine molecules are structurally similar to adenosine and physically fit into the same receptors — blocking them, like plugging a keyhole.
        </p>
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {[
            { step:'1', title:'Adenosine builds up',     desc:'Every waking hour, adenosine accumulates in your brain. After 16 hours awake, the "sleep pressure" is overwhelming.', color:'#94a3b8' },
            { step:'2', title:'Caffeine blocks receptors',desc:"Caffeine molecules fit adenosine receptors and block them. You don't burn off the adenosine — it's still there, waiting.", color:catColor },
            { step:'3', title:'Crash when caffeine clears',desc:'When caffeine wears off (after ~5 half-lives), all the queued-up adenosine floods its receptors at once — explaining the "caffeine crash".', color:'#ef4444' },
            { step:'4', title:'Tolerance develops',       desc:'Regular caffeine use causes the brain to grow more adenosine receptors to compensate, requiring more caffeine to feel the same effect.', color:'#f59e0b' },
          ].map((s, i) => (
            <div key={i} style={{ display:'flex', gap:12, padding:'10px 13px', borderRadius:9, background:'var(--bg-raised)', border:'0.5px solid var(--border)' }}>
              <div style={{ width:22, height:22, borderRadius:'50%', background:s.color, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:11, fontWeight:700, color:'#fff' }}>{s.step}</div>
              <div>
                <div style={{ fontSize:12, fontWeight:700, color:s.color, marginBottom:2 }}>{s.title}</div>
                <div style={{ fontSize:11.5, color:'var(--text-2)', lineHeight:1.55 }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </Sec>

      {/* ⚡ FUN FACT */}
      <Sec title="⚡ Caffeine facts worth knowing">
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {[
            { f:'Coffee is the second most traded commodity on Earth after oil.', icon:'🌍' },
            { f:'The "coffee nap" (drinking coffee immediately before a 20-min nap) is more effective than either alone — caffeine takes ~20 min to absorb, so it kicks in exactly as you wake.', icon:'😴' },
            { f:'Caffeine is detectable in urine for up to 5–10 days in heavy users. Athletes must declare caffeine use as it was a banned substance in Olympic competition until 2004.', icon:'🏃' },
            { f:'A lethal dose of caffeine is approximately 150–200mg/kg body weight — equivalent to ~75–100 cups of coffee consumed very rapidly. Death from coffee alone is essentially impossible.', icon:'☕' },
          ].map((f, i) => (
            <div key={i} style={{ display:'flex', gap:12, padding:'11px 14px', borderRadius:9, background:'var(--bg-raised)', border:'0.5px solid var(--border)' }}>
              <span style={{ fontSize:18, flexShrink:0 }}>{f.icon}</span>
              <p style={{ fontSize:12, color:'var(--text-2)', lineHeight:1.65, margin:0 }}>{f.f}</p>
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
