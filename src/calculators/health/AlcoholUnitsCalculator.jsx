import { useState, useEffect, useRef } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'

const clamp = (v,a,b) => Math.min(b, Math.max(a, v))

const DRINKS = [
  { key:'beer_pint',     label:'Beer / lager pint',    ml:568, abv:4.5, icon:'🍺' },
  { key:'beer_bottle',   label:'Beer bottle (330ml)',   ml:330, abv:5.0, icon:'🍺' },
  { key:'wine_small',    label:'Wine small (125ml)',    ml:125, abv:13,  icon:'🍷' },
  { key:'wine_medium',   label:'Wine medium (175ml)',   ml:175, abv:13,  icon:'🍷' },
  { key:'wine_large',    label:'Wine large (250ml)',    ml:250, abv:13,  icon:'🍷' },
  { key:'spirits_single',label:'Spirits single (25ml)', ml:25,  abv:40,  icon:'🥃' },
  { key:'spirits_double',label:'Spirits double (50ml)', ml:50,  abv:40,  icon:'🥃' },
  { key:'prosecco',      label:'Prosecco flute',        ml:125, abv:11,  icon:'🥂' },
  { key:'cocktail',      label:'Cocktail (avg)',         ml:200, abv:12,  icon:'🍹' },
  { key:'cider_pint',    label:'Cider pint',            ml:568, abv:5.0, icon:'🍺' },
]

const calcUnits = (ml, abv) => parseFloat(((ml * abv) / 1000).toFixed(2))

const FAQ = [
  { q:'What is one alcohol unit?',
    a:'One UK alcohol unit contains 10ml (8g) of pure alcohol. A pint of 4.5% beer ≈ 2.6 units. A 175ml glass of 13% wine ≈ 2.3 units. A 25ml single of 40% spirits = 1 unit. UK Chief Medical Officers recommend no more than 14 units per week spread over 3+ days, with at least 2 alcohol-free days.' },
  { q:'How long does alcohol stay in your system?',
    a:'The liver processes approximately 1 unit per hour. Water, coffee, exercise and food do not speed this up — only time works. After 8+ units, you may still be over the legal driving limit the following morning. A safe rule: add 1 extra hour buffer to your total unit count before driving.' },
  { q:'How many calories are in alcohol?',
    a:'Alcohol provides 7 kcal per gram — nearly as energy-dense as fat. A pint of lager: ~180–220 kcal. A large glass of wine: ~200–250 kcal. Cocktails can reach 300–500 kcal. These are empty calories with no nutritional value, and the body halts fat burning entirely while processing alcohol.' },
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

function RotatorCard({ title, slides, catColor, autoMs=4000 }) {
  const [idx, setIdx] = useState(0)
  const ref = useRef(null)
  useEffect(() => { ref.current = setInterval(() => setIdx(i => (i+1) % slides.length), autoMs); return () => clearInterval(ref.current) }, [slides.length, autoMs])
  return (
    <div style={{ background:'var(--bg-card)', border:'0.5px solid var(--border)', borderRadius:14, overflow:'hidden', marginBottom:14 }}>
      <div style={{ padding:'11px 16px', borderBottom:'0.5px solid var(--border)', display:'flex', justifyContent:'space-between' }}>
        <span style={{ fontSize:12, fontWeight:700, color:'var(--text)', fontFamily:"'Space Grotesk',sans-serif" }}>{title}</span>
        <span style={{ fontSize:10, color:'var(--text-3)' }}>Auto-rotates · {slides.length} views</span>
      </div>
      <div style={{ padding:'16px 18px', minHeight:190 }} onMouseEnter={() => clearInterval(ref.current)} onMouseLeave={() => { ref.current = setInterval(() => setIdx(i => (i+1) % slides.length), autoMs) }}>
        {slides[idx]?.content}
      </div>
      <div style={{ display:'flex', justifyContent:'center', gap:6, paddingBottom:10 }}>
        {slides.map((_, i) => (<button key={i} onClick={() => { setIdx(i); clearInterval(ref.current) }} style={{ width:i===idx?20:6, height:6, borderRadius:3, background:i===idx?catColor:'var(--border)', border:'none', cursor:'pointer', transition:'all .2s', padding:0 }} />))}
      </div>
      <div style={{ display:'flex', gap:4, overflowX:'auto', padding:'0 12px 12px', scrollbarWidth:'none' }}>
        {slides.map((s, i) => (<button key={i} onClick={() => { setIdx(i); clearInterval(ref.current) }} style={{ flexShrink:0, padding:'4px 10px', borderRadius:6, fontSize:10, fontWeight:idx===i?700:500, color:idx===i?catColor:'var(--text-3)', border:`1px solid ${idx===i?catColor:'var(--border)'}`, background:idx===i?catColor+'10':'transparent', cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>{s.label}</button>))}
      </div>
    </div>
  )
}

export default function AlcoholUnitsCalculator({ meta, category }) {
  const catColor = category?.color || '#f59e0b'
  const [wKg,     setWKg]    = useState(75)
  const [sex,     setSex]    = useState('male')
  const [items,   setItems]  = useState([{ drinkKey:'beer_pint', qty:2 }, { drinkKey:'wine_medium', qty:1 }])
  const [openFaq, setOpenFaq]= useState(null)
  const [weeklyItems, setWeeklyItems] = useState([{ drinkKey:'beer_pint', qty:4 }, { drinkKey:'wine_medium', qty:3 }])

  const addItem    = () => setItems(i => [...i, { drinkKey:'beer_pint', qty:1 }])
  const removeItem = idx => setItems(i => i.filter((_, j) => j !== idx))
  const updateItem = (idx, f, v) => setItems(i => i.map((it, j) => j === idx ? { ...it, [f]:v } : it))
  const addWeekly    = () => setWeeklyItems(i => [...i, { drinkKey:'beer_pint', qty:1 }])
  const removeWeekly = idx => setWeeklyItems(i => i.filter((_, j) => j !== idx))
  const updateWeekly = (idx, f, v) => setWeeklyItems(i => i.map((it, j) => j === idx ? { ...it, [f]:v } : it))

  const totalUnits = items.reduce((s,it) => { const d=DRINKS.find(d=>d.key===it.drinkKey)||DRINKS[0]; return s+calcUnits(d.ml,d.abv)*it.qty }, 0)
  const totalKcal  = Math.round(items.reduce((s,it) => { const d=DRINKS.find(d=>d.key===it.drinkKey)||DRINKS[0]; return s+(d.ml*d.abv*0.789*7/100)*it.qty }, 0))
  const r          = sex==='male' ? 0.68 : 0.55
  const bac        = clamp(((totalUnits*10)/(wKg*r*1000))*100, 0, 0.5)
  const clearHours = (bac/0.015).toFixed(1)
  const status     = totalUnits<=2?'Low risk':totalUnits<=6?'Moderate':totalUnits<=14?'High risk':'Very high'
  const statusColor= totalUnits<=2?'#10b981':totalUnits<=6?'#f59e0b':totalUnits<=14?'#f97316':'#ef4444'

  const weeklyUnits = weeklyItems.reduce((s,it) => { const d=DRINKS.find(d=>d.key===it.drinkKey)||DRINKS[0]; return s+calcUnits(d.ml,d.abv)*it.qty }, 0)
  const weeklyKcal  = Math.round(weeklyItems.reduce((s,it) => { const d=DRINKS.find(d=>d.key===it.drinkKey)||DRINKS[0]; return s+(d.ml*d.abv*0.789*7/100)*it.qty }, 0))
  const annualKcal  = weeklyKcal*52
  const annualUnits = Math.round(weeklyUnits*52)

  const slides = [
    { label:'Units & BAC', content:(
      <div>
        <div style={{ display:'flex', alignItems:'flex-end', gap:12, marginBottom:14 }}>
          <div>
            <div style={{ fontSize:48, fontWeight:700, lineHeight:1, color:statusColor, fontFamily:"'Space Grotesk',sans-serif" }}>{totalUnits.toFixed(1)}</div>
            <div style={{ fontSize:11, color:'var(--text-3)', marginTop:3 }}>alcohol units</div>
          </div>
          <div style={{ paddingBottom:6 }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'5px 12px 5px 8px', borderRadius:20, background:statusColor+'18', border:`1px solid ${statusColor}35` }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background:statusColor }}/><span style={{ fontSize:12, fontWeight:700, color:statusColor }}>{status}</span>
            </div>
            <div style={{ fontSize:11, color:'var(--text-3)', marginTop:5 }}>BAC ≈ {bac.toFixed(3)}% · clears ~{clearHours}h</div>
          </div>
        </div>
        {[
          { l:'Units (session)', v:`${totalUnits.toFixed(1)} / 14 weekly`, pct:(totalUnits/14)*100, color:statusColor },
          { l:'BAC estimate', v:`${bac.toFixed(3)}%`, pct:(bac/0.08)*100, color:bac>0.05?'#ef4444':'#f59e0b' },
          { l:'Calories', v:`${totalKcal} kcal`, pct:(totalKcal/800)*100, color:'#8b5cf6' },
        ].map((r,i) => (
          <div key={i} style={{ marginBottom:8 }}>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, marginBottom:3 }}>
              <span style={{ color:'var(--text-2)' }}>{r.l}</span><span style={{ fontWeight:700, color:r.color }}>{r.v}</span>
            </div>
            <div style={{ height:5, background:'var(--border)', borderRadius:3 }}>
              <div style={{ height:'100%', width:`${clamp(r.pct,0,100)}%`, background:r.color, borderRadius:3, transition:'width .4s' }}/>
            </div>
          </div>
        ))}
      </div>
    )},
    { label:'Clearance', content:(
      <div>
        <div style={{ fontSize:10, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:12 }}>When alcohol clears your system</div>
        <div style={{ fontSize:32, fontWeight:700, color:catColor, fontFamily:"'Space Grotesk',sans-serif", marginBottom:4 }}>{clearHours}h</div>
        <div style={{ fontSize:11, color:'var(--text-3)', marginBottom:14 }}>until BAC reaches zero</div>
        {[{h:1,label:'1 hour'},{h:2,label:'2 hours'},{h:4,label:'4 hours'},{h:parseFloat(clearHours),label:'Fully clear'}].map((t,i) => {
          const rem=Math.max(0, totalUnits-t.h)
          return(
            <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'7px 11px', borderRadius:7, background:rem===0?'#d1fae520':'var(--bg-raised)', border:'0.5px solid var(--border)', marginBottom:4 }}>
              <div style={{ width:65, fontSize:11, fontWeight:600, color:'var(--text)', flexShrink:0 }}>+{t.label}</div>
              <div style={{ flex:1, height:4, background:'var(--border)', borderRadius:2 }}>
                <div style={{ height:'100%', width:`${totalUnits>0?(rem/totalUnits)*100:0}%`, background:rem===0?'#10b981':catColor, borderRadius:2, transition:'width .4s' }}/>
              </div>
              <div style={{ fontSize:11, fontWeight:700, color:rem===0?'#10b981':catColor, minWidth:55, textAlign:'right' }}>{rem===0?'Clear ✓':`${rem.toFixed(1)}u`}</div>
            </div>
          )
        })}
      </div>
    )},
    { label:'vs Guidelines', content:(
      <div>
        <div style={{ fontSize:10, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:12 }}>UK CMO guidelines (14 units/week)</div>
        {[{l:'This session',u:totalUnits,c:statusColor},{l:'Low risk',u:6,c:'#10b981'},{l:'Moderate',u:9,c:'#f59e0b'},{l:'Weekly limit',u:14,c:'#ef4444'}].map((r,i)=>(
          <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'7px 12px', borderRadius:7, background:i===0?statusColor+'12':'var(--bg-raised)', border:`${i===0?'1.5':'0.5'}px solid ${i===0?statusColor:'var(--border)'}`, marginBottom:5 }}>
            <div style={{ width:90, fontSize:11, fontWeight:i===0?700:400, color:r.c, flexShrink:0 }}>{r.l}</div>
            <div style={{ flex:1, height:5, background:'var(--border)', borderRadius:2 }}>
              <div style={{ height:'100%', width:`${(r.u/14)*100}%`, background:r.c, opacity:i===0?1:0.5, borderRadius:2, transition:'width .4s' }}/>
            </div>
            <div style={{ fontSize:11, fontWeight:700, color:r.c, minWidth:28 }}>{typeof r.u==='number'?r.u.toFixed(1):r.u}u</div>
          </div>
        ))}
      </div>
    )},
    { label:'Health impact', content:(
      <div>
        <div style={{ fontSize:10, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:10 }}>What alcohol does to your body</div>
        {[
          { title:'Sleep quality', effect:'Even 1–2 units within 3h of bed reduces REM sleep. You fall asleep faster but wake less rested.', color:'#8b5cf6' },
          { title:'Calories', effect:`${totalKcal} kcal this session. Body halts fat burning entirely while processing alcohol.`, color:'#f59e0b' },
          { title:'Hydration', effect:'Alcohol is a diuretic. Drink 1 glass of water per unit to offset dehydration headaches.', color:'#0ea5e9' },
          { title:'Liver recovery', effect:'Needs alcohol-free days to regenerate. Aim for at least 2–3 per week.', color:'#10b981' },
        ].map((r,i)=>(
          <div key={i} style={{ display:'flex', gap:8, marginBottom:7, padding:'7px 10px', borderRadius:8, background:'var(--bg-raised)', border:'0.5px solid var(--border)' }}>
            <div style={{ width:6, height:6, borderRadius:'50%', background:r.color, flexShrink:0, marginTop:3 }}/>
            <div>
              <div style={{ fontSize:11, fontWeight:600, color:r.color, marginBottom:1 }}>{r.title}</div>
              <div style={{ fontSize:11, color:'var(--text-2)', lineHeight:1.5 }}>{r.effect}</div>
            </div>
          </div>
        ))}
      </div>
    )},
  ]

  const hint = `${totalUnits.toFixed(1)} units. BAC ≈ ${bac.toFixed(3)}% — clears in ~${clearHours}h. ${totalKcal} kcal. Status: ${status}. UK weekly limit: 14 units.`

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <CalcShell
        left={<>
          <div style={{ fontSize:10, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:14 }}>Your stats</div>
          <Stepper label="Body weight" value={wKg} onChange={setWKg} min={30} max={200} unit="kg" catColor={catColor}/>
          <div style={{ borderTop:'0.5px solid var(--border)', paddingTop:16, marginTop:4 }}>
            <div style={{ fontSize:12, fontWeight:600, color:'var(--text-2)', marginBottom:8, fontFamily:"'DM Sans',sans-serif" }}>Sex</div>
            <div style={{ display:'flex', gap:8, marginBottom:16 }}>
              {[{v:'male',l:'Male'},{v:'female',l:'Female'}].map(o=>(
                <button key={o.v} onClick={()=>setSex(o.v)} style={{ flex:1, padding:'10px', borderRadius:9, border:`1.5px solid ${sex===o.v?catColor:'var(--border-2)'}`, background:sex===o.v?catColor+'12':'var(--bg-raised)', fontSize:12, fontWeight:sex===o.v?700:500, color:sex===o.v?catColor:'var(--text-2)', cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>{o.l}</button>
              ))}
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
              <span style={{ fontSize:12, fontWeight:600, color:'var(--text-2)', fontFamily:"'DM Sans',sans-serif" }}>Drinks log</span>
              <button onClick={addItem} style={{ fontSize:11, fontWeight:700, color:catColor, background:catColor+'15', border:`1px solid ${catColor}`, borderRadius:8, padding:'3px 10px', cursor:'pointer' }}>+ Add</button>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {items.map((it,idx) => {
                const d=DRINKS.find(d=>d.key===it.drinkKey)||DRINKS[0]
                return(
                  <div key={idx} style={{ padding:'10px 12px', borderRadius:9, background:'var(--bg-raised)', border:'0.5px solid var(--border)' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                      <span style={{ fontSize:12, fontWeight:700, color:'var(--text)' }}>{d.icon} {(calcUnits(d.ml,d.abv)*it.qty).toFixed(1)}u</span>
                      <button onClick={()=>removeItem(idx)} style={{ fontSize:14, color:'var(--text-3)', background:'none', border:'none', cursor:'pointer' }}>×</button>
                    </div>
                    <select value={it.drinkKey} onChange={e=>updateItem(idx,'drinkKey',e.target.value)} style={{ width:'100%', marginBottom:6, padding:'5px 8px', borderRadius:7, border:'1px solid var(--border)', background:'var(--bg-card)', color:'var(--text)', fontSize:11 }}>
                      {DRINKS.map(d=>(<option key={d.key} value={d.key}>{d.icon} {d.label} ({calcUnits(d.ml,d.abv)}u)</option>))}
                    </select>
                    <div style={{ display:'flex', gap:6 }}>
                      {[1,2,3,4].map(q=>(<button key={q} onClick={()=>updateItem(idx,'qty',q)} style={{ flex:1, padding:'4px', borderRadius:6, fontSize:11, fontWeight:it.qty===q?700:400, color:it.qty===q?catColor:'var(--text-2)', border:`1px solid ${it.qty===q?catColor:'var(--border)'}`, background:it.qty===q?catColor+'12':'var(--bg-raised)', cursor:'pointer' }}>×{q}</button>))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </>}
        right={<>
          <RotatorCard title="Alcohol Analysis" slides={slides} catColor={catColor}/>
          <BreakdownTable title="Session Summary" rows={[
            { label:'Total units',   value:`${totalUnits.toFixed(1)} units`, bold:true, highlight:true, color:statusColor },
            { label:'Status',        value:status,                            color:statusColor },
            { label:'BAC estimate',  value:`${bac.toFixed(3)}%`,             color:bac>0.05?'#ef4444':'#f59e0b' },
            { label:'Time to clear', value:`~${clearHours} hours` },
            { label:'Calories',      value:`${totalKcal} kcal`,              color:'#8b5cf6' },
            { label:'Weekly limit',  value:'14 units (UK CMO)' },
            { label:'Remaining',     value:`${Math.max(0,14-totalUnits).toFixed(1)} units this week` },
          ]}/>
          <AIHintCard hint={hint}/>
        </>}
      />

      {/* 🎯 INTERACTIVE — Weekly habit true cost */}
      <Sec title="🎯 Your weekly drinking habit — the real numbers" sub="Build your typical week to see the annual impact">
        <p style={{ fontSize:12, color:'var(--text-2)', lineHeight:1.7, marginBottom:14, fontFamily:"'DM Sans',sans-serif" }}>
          Log your typical weekly drinking below. The annual totals often surprise people.
        </p>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
          <span style={{ fontSize:12, fontWeight:600, color:'var(--text)', fontFamily:"'DM Sans',sans-serif" }}>Typical weekly drinks</span>
          <button onClick={addWeekly} style={{ fontSize:11, fontWeight:700, color:catColor, background:catColor+'15', border:`1px solid ${catColor}`, borderRadius:8, padding:'3px 10px', cursor:'pointer' }}>+ Add</button>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:14 }}>
          {weeklyItems.map((it,idx) => {
            const d=DRINKS.find(d=>d.key===it.drinkKey)||DRINKS[0]
            return(
              <div key={idx} style={{ display:'flex', gap:8, alignItems:'center', padding:'8px 12px', borderRadius:9, background:'var(--bg-raised)', border:'0.5px solid var(--border)' }}>
                <select value={it.drinkKey} onChange={e=>updateWeekly(idx,'drinkKey',e.target.value)} style={{ flex:1, padding:'5px 8px', borderRadius:7, border:'1px solid var(--border)', background:'var(--bg-card)', color:'var(--text)', fontSize:11 }}>
                  {DRINKS.map(d=>(<option key={d.key} value={d.key}>{d.icon} {d.label}</option>))}
                </select>
                <select value={it.qty} onChange={e=>updateWeekly(idx,'qty',parseInt(e.target.value))} style={{ width:52, padding:'5px', borderRadius:7, border:'1px solid var(--border)', background:'var(--bg-card)', color:'var(--text)', fontSize:11 }}>
                  {[1,2,3,4,5,6].map(q=>(<option key={q} value={q}>×{q}</option>))}
                </select>
                <button onClick={()=>removeWeekly(idx)} style={{ fontSize:16, color:'var(--text-3)', background:'none', border:'none', cursor:'pointer' }}>×</button>
              </div>
            )
          })}
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:12 }}>
          {[
            { label:'Weekly units', val:`${weeklyUnits.toFixed(1)}u`, color:weeklyUnits>14?'#ef4444':catColor },
            { label:'Weekly kcal',  val:`${weeklyKcal.toLocaleString()} kcal`, color:'#8b5cf6' },
            { label:'Annual units', val:`${annualUnits.toLocaleString()}u/yr`, color:catColor },
          ].map((s,i)=>(
            <div key={i} style={{ padding:'12px', borderRadius:10, background:'var(--bg-raised)', border:'0.5px solid var(--border)', textAlign:'center' }}>
              <div style={{ fontSize:9, color:'var(--text-3)', marginBottom:4 }}>{s.label}</div>
              <div style={{ fontSize:16, fontWeight:700, color:s.color, fontFamily:"'Space Grotesk',sans-serif" }}>{s.val}</div>
            </div>
          ))}
        </div>
        <div style={{ padding:'11px 14px', background:catColor+'10', borderRadius:10, border:`1px solid ${catColor}25` }}>
          <div style={{ fontSize:11.5, color:'var(--text-2)', lineHeight:1.65 }}>
            At this pace you consume <strong style={{ color:catColor }}>{annualKcal.toLocaleString()} kcal/year</strong> from alcohol — equivalent to roughly <strong style={{ color:catColor }}>{Math.round(annualKcal/7700)} kg</strong> of fat in energy terms.
          </div>
        </div>
      </Sec>

      {/* 🧠 INTERESTING — liver science */}
      <Sec title="What alcohol actually does to your liver" sub="The 4-step metabolism process">
        <p style={{ fontSize:12, color:'var(--text-2)', lineHeight:1.7, marginBottom:14, fontFamily:"'DM Sans',sans-serif" }}>
          Your liver processes alcohol at a fixed rate of ~1 unit/hour — nothing speeds this up. Here's exactly what happens inside.
        </p>
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {[
            { step:'1', title:'Ethanol → Acetaldehyde (ADH enzyme)', desc:'Alcohol dehydrogenase converts ethanol into acetaldehyde — a toxic compound more damaging than alcohol itself. This causes the flushing and nausea of drinking.', color:catColor },
            { step:'2', title:'Acetaldehyde → Acetate (ALDH enzyme)', desc:"ALDH2 converts acetaldehyde into harmless acetate. In the ~35% of East Asians with a common ALDH2 variant, this step is slow — acetaldehyde builds up causing intense flushing even with small amounts.", color:'#f59e0b' },
            { step:'3', title:'Fat burning shuts down completely', desc:'While metabolising alcohol, the liver deprioritises all fat oxidation. Excess acetate is stored as fatty acids. Regular drinking leads to fatty liver (steatosis) — the first and most reversible stage of liver disease.', color:'#ef4444' },
            { step:'4', title:'Liver regenerates with abstinence', desc:'Fatty liver is almost entirely reversible within 2–6 weeks of abstinence. Liver enzymes (ALT, AST) typically normalise within 4–8 weeks. The liver has extraordinary regenerative capacity.', color:'#10b981' },
          ].map((s,i)=>(
            <div key={i} style={{ display:'flex', gap:12, padding:'10px 13px', borderRadius:9, background:'var(--bg-raised)', border:'0.5px solid var(--border)' }}>
              <div style={{ width:22, height:22, borderRadius:'50%', background:s.color, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:11, fontWeight:700, color:'#fff' }}>{s.step}</div>
              <div>
                <div style={{ fontSize:12, fontWeight:700, color:s.color, marginBottom:3 }}>{s.title}</div>
                <div style={{ fontSize:11.5, color:'var(--text-2)', lineHeight:1.6 }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </Sec>

      {/* ⚡ FUN FACT */}
      <Sec title="⚡ Alcohol facts worth knowing">
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {[
            { f:'Alcohol is a Group 1 carcinogen (IARC) linked to 7 cancer types: mouth, throat, oesophagus, liver, colon, rectum, and breast. There is no established safe level for cancer risk.', icon:'🔬' },
            { f:'The UK reduced its safe weekly limit from 21 units to 14 units in 2016 — applying the same number to men and women for the first time — based on updated cancer evidence.', icon:'📋' },
            { f:'A 175ml glass of 13% wine has roughly the same calories as a scoop of ice cream (~180 kcal), but unlike ice cream, it also halts all fat burning for 2–3 hours while your liver processes it.', icon:'🍦' },
            { f:"The \"hair of the dog\" hangover cure works by temporarily suppressing withdrawal symptoms but prolongs total alcohol processing time and increases liver toxin exposure. There is no evidence it accelerates recovery.", icon:'🍺' },
          ].map((f,i)=>(
            <div key={i} style={{ display:'flex', gap:12, padding:'11px 14px', borderRadius:9, background:'var(--bg-raised)', border:'0.5px solid var(--border)' }}>
              <span style={{ fontSize:18, flexShrink:0 }}>{f.icon}</span>
              <p style={{ fontSize:12, color:'var(--text-2)', lineHeight:1.65, margin:0 }}>{f.f}</p>
            </div>
          ))}
        </div>
      </Sec>

      <Sec title="Frequently asked questions" sub="Alcohol units explained">
        {FAQ.map((f,i)=>(<Acc key={i} q={f.q} a={f.a} open={openFaq===i} onToggle={()=>setOpenFaq(openFaq===i?null:i)} catColor={catColor}/>))}
      </Sec>
    </div>
  )
}
