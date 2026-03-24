import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'
import HealthJourneyNext from '../../components/health/HealthJourneyNext'

const clamp = (v,a,b) => Math.min(b,Math.max(a,v))

const ACTIVITY = [
  { key:'sed',   label:'Sedentary',         sub:'Desk job, no exercise',    factor:0    },
  { key:'light', label:'Lightly active',    sub:'1–3 days/week exercise',   factor:350  },
  { key:'mod',   label:'Moderately active', sub:'3–5 days/week',            factor:600  },
  { key:'high',  label:'Very active',       sub:'6–7 days/week',            factor:900  },
  { key:'xhigh', label:'Athlete',           sub:'Twice daily training',     factor:1200 },
]
const CLIMATE = [
  { key:'cool',     label:'Cool / indoor',  sub:'AC, temperate',    extra:0   },
  { key:'moderate', label:'Moderate',       sub:'Typical climate',  extra:200 },
  { key:'hot',      label:'Hot / humid',    sub:'Summer, tropical', extra:500 },
]

const GLOSSARY = [
  { term:'Daily Water Intake', def:'The total water consumed from all sources — drinks, food (~20% of intake), and metabolic water produced by the body. The calculator shows beverage intake needed.' },
  { term:'Hyponatremia',       def:'Dangerously low sodium from drinking too much water. Rare but possible. Symptoms: nausea, headache, confusion. More common in endurance athletes.' },
  { term:'Thirst Mechanism',   def:'The body\'s primary hydration signal. Generally reliable for healthy adults — drink when thirsty. Becomes less reliable in elderly, during intense exercise, or in hot climates.' },
  { term:'Urine Colour',       def:'The easiest hydration test. Pale yellow = hydrated. Dark yellow = mildly dehydrated. Amber/brown = severely dehydrated. Completely clear may indicate overhydration.' },
  { term:'Electrolytes',       def:'Minerals (sodium, potassium, magnesium) lost in sweat. Important for active individuals — water alone doesn\'t replace them. Lost significantly after 60+ min intense exercise.' },
]

const FAQ = [
  { q:'Is 8 glasses (2 litres) a day really the rule?',
    a:'No — this is a myth. The "8×8" rule has no scientific basis. Your actual needs depend on body weight, activity level, climate, diet, and health status. This calculator uses the evidence-based formula of ~35ml per kg of bodyweight, adjusted for activity and climate. A large athlete in a hot climate may need 4–5 litres; a small sedentary person may only need 1.5–2 litres.' },
  { q:'Does coffee or tea count toward my water intake?',
    a:'Yes. Despite the common belief, caffeinated drinks like coffee and tea do count toward hydration. The mild diuretic effect of caffeine is more than offset by their water content. However, alcohol does not count — it is a diuretic that increases net water loss.' },
  { q:'How can I tell if I\'m dehydrated?',
    a:'The simplest test is urine colour. Pale yellow = well hydrated. Dark yellow or amber = dehydrated. Other signs: thirst (you\'re already mildly dehydrated when you feel thirsty), headache, fatigue, difficulty concentrating, and dizziness. Weigh yourself before and after exercise — each kg lost equals approximately 1 litre of fluid deficit.' },
  { q:'Should I drink more water to lose weight?',
    a:'Drinking 500ml of water 30 minutes before meals can reduce calorie intake by increasing satiety. Cold water has a tiny thermogenic effect (~8 kcal per 500ml heated to body temperature). More practically, replacing caloric drinks (juice, soda, alcohol) with water creates a significant deficit. Water does not directly burn fat.' },
]

const EXAMPLES = [
  { title:'Active Male',    desc:'82 kg, very active, hot climate', wKg:82, sex:'male',   activity:'high',  climate:'hot',      age:28 },
  { title:'Average Female', desc:'65 kg, moderate, normal climate', wKg:65, sex:'female', activity:'mod',   climate:'moderate', age:32 },
  { title:'Sedentary',      desc:'70 kg, desk job, cool office',    wKg:70, sex:'male',   activity:'sed',   climate:'cool',     age:40 },
]

const JOURNEY_ITEMS = [
  { title:'Calorie Calculator',  sub:'Know your daily energy needs',          icon:'🔥', path:'/health/calories/calorie-calculator'    },
  { title:'Macro Calculator',    sub:'Protein, carbs and fat targets',        icon:'🥗', path:'/health/calories/macro-calculator'      },
  { title:'BMR Calculator',      sub:'Your baseline metabolic rate',          icon:'⚡', path:'/health/body-metrics/bmr-calculator'    },
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
        <span style={{ fontSize:18, color:catColor, flexShrink:0, transition:'transform .2s', display:'inline-block', transform:open?'rotate(45deg)':'none' }}>+</span>
      </button>
      {open && <p style={{ fontSize:12.5, color:'var(--text-2)', lineHeight:1.75, margin:'0 0 13px', fontFamily:"'DM Sans',sans-serif" }}>{a}</p>}
    </div>
  )
}
function GlsTerm({ term, def, catColor }) {
  const [open, setOpen] = useState(false)
  return (
    <div onClick={() => setOpen(o => !o)} style={{ padding:'9px 12px', borderRadius:8, cursor:'pointer', transition:'all .15s', border:`1px solid ${open?catColor+'40':'var(--border)'}`, background:open?catColor+'10':'var(--bg-raised)' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:8 }}>
        <span style={{ fontSize:12, fontWeight:700, fontFamily:"'Space Grotesk',sans-serif", color:open?catColor:'var(--text)' }}>{term}</span>
        <span style={{ fontSize:14, color:catColor, flexShrink:0 }}>{open?'−':'+'}</span>
      </div>
      {open && <p style={{ fontSize:11.5, color:'var(--text-2)', lineHeight:1.65, margin:'6px 0 0', fontFamily:"'DM Sans',sans-serif" }}>{def}</p>}
    </div>
  )
}
function Stepper({ label, hint, value, onChange, min, max, step=1, unit, catColor }) {
  const [editing, setEditing] = useState(false)
  const commit = r => { const n=parseFloat(r); onChange(clamp(isNaN(n)?value:n,min,max)); setEditing(false) }
  const btn = { width:38, height:'100%', border:'none', background:'var(--bg-raised)', color:'var(--text)', fontSize:20, fontWeight:300, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontFamily:'inherit', transition:'background .1s' }
  return (
    <div style={{ marginBottom:16 }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
        <label style={{ fontSize:12.5, fontWeight:600, color:'var(--text)', fontFamily:"'DM Sans',sans-serif" }}>{label}</label>
        {hint && <span style={{ fontSize:10, color:'var(--text-3)' }}>{hint}</span>}
      </div>
      <div style={{ display:'flex', alignItems:'stretch', height:40, border:`1.5px solid ${editing?catColor:'var(--border-2)'}`, borderRadius:9, overflow:'hidden', background:'var(--bg-card)', transition:'border-color .15s' }}>
        <button onMouseDown={e=>{e.preventDefault();onChange(clamp(value-step,min,max))}} style={{...btn,borderRight:'1px solid var(--border)'}} onMouseEnter={e=>e.currentTarget.style.background=catColor+'18'} onMouseLeave={e=>e.currentTarget.style.background='var(--bg-raised)'}>−</button>
        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:5 }}>
          {editing
            ? <input type="number" defaultValue={value} onBlur={e=>commit(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')commit(e.target.value);if(e.key==='Escape')setEditing(false)}} style={{ width:'55%', border:'none', background:'transparent', textAlign:'center', fontSize:15, fontWeight:700, color:'var(--text)', outline:'none', fontFamily:"'DM Sans',sans-serif" }} autoFocus/>
            : <span onClick={()=>setEditing(true)} style={{ fontSize:15, fontWeight:700, color:'var(--text)', cursor:'text', minWidth:36, textAlign:'center', fontFamily:"'DM Sans',sans-serif" }}>{value}</span>
          }
          <span style={{ fontSize:11, color:'var(--text-3)', fontWeight:500 }}>{unit}</span>
        </div>
        <button onMouseDown={e=>{e.preventDefault();onChange(clamp(value+step,min,max))}} style={{...btn,borderLeft:'1px solid var(--border)'}} onMouseEnter={e=>e.currentTarget.style.background=catColor+'18'} onMouseLeave={e=>e.currentTarget.style.background='var(--bg-raised)'}>+</button>
      </div>
    </div>
  )
}
function IconCardGroup({ label, options, value, onChange, catColor }) {
  return (
    <div style={{ marginBottom:18 }}>
      <div style={{ fontSize:12, fontWeight:600, color:'var(--text-2)', marginBottom:8, fontFamily:"'DM Sans',sans-serif" }}>{label}</div>
      <div style={{ display:'flex', gap:8 }}>
        {options.map(opt => {
          const active = value===opt.value
          return (
            <button key={opt.value} onClick={()=>onChange(opt.value)} style={{ flex:1, padding:'10px 6px', borderRadius:10, cursor:'pointer', border:`1.5px solid ${active?catColor:'var(--border-2)'}`, background:active?catColor+'12':'var(--bg-raised)', display:'flex', flexDirection:'column', alignItems:'center', gap:5, transition:'all .18s', fontFamily:"'DM Sans',sans-serif" }}>
              <span style={{ fontSize:12, fontWeight:active?700:500, color:active?catColor:'var(--text-2)', lineHeight:1.2, textAlign:'center' }}>{opt.label}</span>
              {opt.sub && <span style={{ fontSize:10, color:active?catColor+'cc':'var(--text-3)', lineHeight:1.2, textAlign:'center' }}>{opt.sub}</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ── CONCEPT B: Narrative Story Card ── */
function NarrativeStoryCard({ title, stories, catColor }) {
  const storyColors = [catColor, '#0ea5e9', '#f59e0b']
  const storySofts  = [catColor+'18', '#e0f2fe', '#fef3c7']
  return (
    <div style={{ background:'var(--bg-card)', border:'0.5px solid var(--border)', borderRadius:14, overflow:'hidden', marginBottom:14 }}>
      <div style={{ padding:'11px 16px', borderBottom:'0.5px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <span style={{ fontSize:12, fontWeight:700, color:'var(--text)', fontFamily:"'Space Grotesk',sans-serif" }}>{title}</span>
        <span style={{ fontSize:10, color:'var(--text-3)' }}>Updates live as you edit</span>
      </div>
      <div style={{ padding:'16px 18px', display:'flex', flexDirection:'column', gap:10 }}>
        {stories.map((s,i) => (
          <div key={i} style={{ borderLeft:`3px solid ${storyColors[i]}`, paddingLeft:12, paddingTop:6, paddingBottom:6, borderRadius:'0 8px 8px 0', background:storySofts[i] }}>
            <div style={{ fontSize:9, fontWeight:700, color:storyColors[i], textTransform:'uppercase', letterSpacing:'.07em', marginBottom:4 }}>{s.label}</div>
            <div style={{ fontSize:13, fontWeight:600, color:'var(--text)', lineHeight:1.55, fontFamily:"'Space Grotesk',sans-serif" }}>{s.headline}</div>
            {s.detail && <div style={{ fontSize:11.5, color:'var(--text-2)', lineHeight:1.6, marginTop:4, fontFamily:"'DM Sans',sans-serif" }}>{s.detail}</div>}
          </div>
        ))}
      </div>
    </div>
  )
}

const SEX_OPTIONS = [
  { value:'male',   label:'Male',   icon:<><circle cx="11" cy="9" r="5"/><line x1="11" y1="14" x2="11" y2="20"/><line x1="8" y1="17" x2="14" y2="17"/></> },
  { value:'female', label:'Female', icon:<><circle cx="11" cy="8.5" r="5"/><line x1="11" y1="13.5" x2="11" y2="20"/><line x1="8" y1="17" x2="14" y2="17"/></> },
]

export default function WaterIntakeCalculator({ meta, category }) {
  const catColor = category?.color || '#0ea5e9'
  const [wKg,         setWKg]         = useState(75)
  const [sex,         setSex]         = useState('male')
  const [age,         setAge]         = useState(30)
  const [activityKey, setActivityKey] = useState('mod')
  const [climateKey,  setClimateKey]  = useState('moderate')
  const [openFaq,     setOpenFaq]     = useState(null)

  function applyExample(ex) { setWKg(ex.wKg); setSex(ex.sex); setActivityKey(ex.activity); setClimateKey(ex.climate); setAge(ex.age) }

  const actExtra  = ACTIVITY.find(a=>a.key===activityKey)?.factor || 0
  const climExtra = CLIMATE.find(c=>c.key===climateKey)?.extra || 0
  const sexMult   = sex==='male' ? 1.0 : 0.9
  const baseML    = wKg * 35 * sexMult
  const totalML   = Math.round((baseML + actExtra + climExtra) / 50) * 50
  const totalL    = (totalML/1000).toFixed(1)
  const glasses   = Math.round(totalML/250)
  const bottlesL  = (totalML/500).toFixed(1)
  const perHour   = Math.round(totalML / 16)
  const wakeHrs   = 16

  const stories = [
    {
      label: 'Your daily target',
      headline: `You need ${totalL} litres of water per day`,
      detail: `That's ${glasses} glasses (250ml each) or ${bottlesL} standard 500ml bottles spread across your ${wakeHrs}-hour waking day.`,
    },
    {
      label: 'How to hit it',
      headline: `Drink one glass every ${Math.round(wakeHrs*60/glasses)} minutes`,
      detail: `Start with 500ml on waking. Drink ${Math.round(totalML*0.3/250)} glasses before lunch, ${Math.round(totalML*0.3/250)} by dinner, ${Math.round(totalML*0.2/250)} in the evening. Never wait until thirsty.`,
    },
    {
      label: 'What happens if you don\'t',
      headline: `2% dehydration cuts performance by up to 20%`,
      detail: `At just ${(wKg*0.02).toFixed(1)} kg of fluid loss your concentration drops, heart rate rises, and perceived effort increases. Check your urine — pale yellow means you\'re on track.`,
    },
  ]

  const hint = `Daily water target: ${totalL}L (${glasses} glasses). Base: ${Math.round(baseML/1000*10)/10}L, Activity: +${actExtra}ml, Climate: +${climExtra}ml. Drink ${perHour}ml per hour while awake.`

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <CalcShell
        left={<>
          <div style={{ marginBottom:0 }}>
            <div style={{ fontSize:10, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:14 }}>Your stats</div>
            <Stepper label="Body weight" value={wKg} onChange={setWKg} min={30} max={250} unit="kg" catColor={catColor}/>
            <Stepper label="Age" value={age} onChange={setAge} min={10} max={100} unit="yrs" catColor={catColor}/>
          </div>
          <div style={{ borderTop:'0.5px solid var(--border)', paddingTop:16, marginTop:4 }}>
            <IconCardGroup label="Biological sex" options={SEX_OPTIONS} value={sex} onChange={setSex} catColor={catColor}/>
          </div>
          <div style={{ borderTop:'0.5px solid var(--border)', paddingTop:16, marginTop:4 }}>
            <div style={{ fontSize:12, fontWeight:600, color:'var(--text-2)', marginBottom:8, fontFamily:"'DM Sans',sans-serif" }}>Activity level</div>
            <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
              {ACTIVITY.map(a => (
                <button key={a.key} onClick={()=>setActivityKey(a.key)} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 12px', borderRadius:8, border:`1.5px solid ${activityKey===a.key?catColor:'var(--border-2)'}`, background:activityKey===a.key?catColor+'12':'var(--bg-raised)', cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>
                  <div>
                    <div style={{ fontSize:12, fontWeight:600, color:activityKey===a.key?catColor:'var(--text)', textAlign:'left' }}>{a.label}</div>
                    <div style={{ fontSize:10, color:'var(--text-3)' }}>{a.sub}</div>
                  </div>
                  {a.factor>0 && <span style={{ fontSize:10, color:'var(--text-3)' }}>+{a.factor}ml</span>}
                </button>
              ))}
            </div>
          </div>
          <div style={{ borderTop:'0.5px solid var(--border)', paddingTop:16, marginTop:12 }}>
            <div style={{ fontSize:12, fontWeight:600, color:'var(--text-2)', marginBottom:8, fontFamily:"'DM Sans',sans-serif" }}>Climate / environment</div>
            <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
              {CLIMATE.map(c => (
                <button key={c.key} onClick={()=>setClimateKey(c.key)} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 12px', borderRadius:8, border:`1.5px solid ${climateKey===c.key?catColor:'var(--border-2)'}`, background:climateKey===c.key?catColor+'12':'var(--bg-raised)', cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>
                  <div>
                    <div style={{ fontSize:12, fontWeight:600, color:climateKey===c.key?catColor:'var(--text)', textAlign:'left' }}>{c.label}</div>
                    <div style={{ fontSize:10, color:'var(--text-3)' }}>{c.sub}</div>
                  </div>
                  {c.extra>0 && <span style={{ fontSize:10, color:'var(--text-3)' }}>+{c.extra}ml</span>}
                </button>
              ))}
            </div>
          </div>
        </>}
        right={<>
          <NarrativeStoryCard title="Your hydration story" stories={stories} catColor={catColor}/>
          <BreakdownTable title="Water Breakdown" rows={[
            { label:'Daily target',     value:`${totalL} litres`, bold:true, highlight:true, color:catColor },
            { label:'In glasses (250ml)',value:`${glasses} glasses` },
            { label:'In bottles (500ml)',value:`${bottlesL} bottles` },
            { label:'Base (35ml/kg)',   value:`${Math.round(baseML)}ml` },
            { label:'Activity add',     value:`+${actExtra}ml` },
            { label:'Climate add',      value:`+${climExtra}ml` },
            { label:'Per hour (awake)', value:`${perHour}ml` },
          ]}/>
          <AIHintCard hint={hint}/>
        </>}
      />

      {/* hourly schedule */}
      <Sec title="Your drinking schedule" sub="Spread evenly across 16 waking hours">
        <p style={{ fontSize:12, color:'var(--text-2)', lineHeight:1.7, marginBottom:14, fontFamily:"'DM Sans',sans-serif" }}>
          The easiest way to hit {totalL}L is to link drinking to fixed points in your day rather than waiting for thirst.
        </p>
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          {[
            { time:'On waking (6–7am)',     ml:500,  note:'Rehydrate overnight deficit' },
            { time:'Mid-morning (9–10am)',   ml:Math.round(totalML*0.15/50)*50, note:'Before hunger kicks in' },
            { time:'Before lunch (12pm)',    ml:250,  note:'Improves satiety at meals' },
            { time:'Afternoon (2–4pm)',      ml:Math.round(totalML*0.20/50)*50, note:'Energy slump = often dehydration' },
            { time:'Before dinner (6pm)',    ml:250,  note:'Pre-meal hydration' },
            { time:'Evening (7–9pm)',        ml:Math.round(totalML*0.10/50)*50, note:'Stop 2h before bed' },
          ].map((t,i)=>(
            <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'9px 14px', borderRadius:8, background:'var(--bg-raised)', border:'0.5px solid var(--border)' }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background:catColor, opacity:0.7, flexShrink:0 }}/>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:12, fontWeight:600, color:'var(--text)' }}>{t.time}</div>
                <div style={{ fontSize:10, color:'var(--text-3)' }}>{t.note}</div>
              </div>
              <div style={{ fontSize:14, fontWeight:700, color:catColor }}>{t.ml}ml</div>
            </div>
          ))}
        </div>
      </Sec>

      {/* urine colour guide */}
      <Sec title="The urine colour test" sub="The easiest hydration check">
        <p style={{ fontSize:12, color:'var(--text-2)', lineHeight:1.7, marginBottom:14, fontFamily:"'DM Sans',sans-serif" }}>
          Check first morning urine. This is the most practical daily hydration indicator — no equipment needed.
        </p>
        <div style={{ display:'flex', gap:3, height:28, borderRadius:6, overflow:'hidden', marginBottom:8 }}>
          {['#fff9c4','#f9e84e','#f0c830','#e6a817','#c87e08','#8b5a02'].map((c,i)=>(
            <div key={i} style={{ flex:1, background:c, display:'flex', alignItems:'center', justifyContent:'center' }}>
              {i===1&&<span style={{ fontSize:8, color:'#5a4000', fontWeight:700 }}>✓</span>}
            </div>
          ))}
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
          {[
            { label:'Pale yellow',    color:'#10b981', note:'Well hydrated — ideal' },
            { label:'Dark yellow',    color:'#f59e0b', note:'Mildly dehydrated' },
            { label:'Amber / brown',  color:'#ef4444', note:'Severely dehydrated' },
          ].map((c,i)=>(
            <div key={i} style={{ padding:'8px 10px', borderRadius:7, background:'var(--bg-raised)', border:'0.5px solid var(--border)' }}>
              <div style={{ fontSize:11, fontWeight:700, color:c.color, marginBottom:2 }}>{c.label}</div>
              <div style={{ fontSize:10, color:'var(--text-3)', lineHeight:1.4 }}>{c.note}</div>
            </div>
          ))}
        </div>
      </Sec>

      {/* formula */}
      <Sec title="The science behind the numbers" sub="How daily water intake is calculated">
        <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:14 }}>
          {[
            { label:'Base requirement', formula:'Base (ml) = body weight (kg) × 35 × sex factor (male:1.0, female:0.9)' },
            { label:'Activity adjustment', formula:'Add 350–1200ml depending on exercise intensity and duration' },
            { label:'Climate adjustment', formula:'Add 0–500ml depending on temperature and humidity' },
            { label:'Total', formula:'Total = Base + Activity + Climate   (rounded to nearest 50ml)' },
          ].map(f=>(
            <div key={f.label}>
              <div style={{ fontSize:10, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.05em', marginBottom:4 }}>{f.label}</div>
              <div style={{ background:'var(--bg-raised)', borderRadius:8, padding:'10px 14px', fontFamily:'monospace', fontSize:11, color:catColor, fontWeight:600, overflowX:'auto', whiteSpace:'nowrap' }}>{f.formula}</div>
            </div>
          ))}
        </div>
        <p style={{ fontSize:12, color:'var(--text-2)', lineHeight:1.75, margin:0, fontFamily:"'DM Sans',sans-serif" }}>Based on European Food Safety Authority (EFSA) and National Academies of Medicine recommendations. The 35ml/kg baseline is adjusted for sex (females need ~10% less due to lower lean mass), activity (sweat output), and climate (evaporative loss). Food provides ~20% of daily water — this calculator shows beverage intake only.</p>
      </Sec>

      {/* examples */}
      <Sec title="Real world examples" sub="Click any to prefill">
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
          {EXAMPLES.map((ex,i)=>{
            const base2 = ex.wKg*35*(ex.sex==='male'?1:0.9)
            const act2  = ACTIVITY.find(a=>a.key===ex.activity)?.factor||0
            const cli2  = CLIMATE.find(c=>c.key===ex.climate)?.extra||0
            const tot2  = Math.round((base2+act2+cli2)/50)*50
            return (
              <button key={i} onClick={()=>applyExample(ex)} style={{ padding:14, borderRadius:10, border:'1.5px solid var(--border)', background:'var(--bg-raised)', cursor:'pointer', textAlign:'left', transition:'all .15s' }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=catColor;e.currentTarget.style.background=catColor+'10'}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.background='var(--bg-raised)'}}>
                <div style={{ fontSize:13, fontWeight:700, color:'var(--text)', marginBottom:2 }}>{ex.title}</div>
                <div style={{ fontSize:11, color:'var(--text-3)', marginBottom:9, lineHeight:1.4 }}>{ex.desc}</div>
                {[['Daily target',`${(tot2/1000).toFixed(1)}L`],['Glasses',`${Math.round(tot2/250)}`],['Per hour',`${Math.round(tot2/16)}ml`]].map(([k,v])=>(
                  <div key={k} style={{ display:'flex', justifyContent:'space-between' }}>
                    <span style={{ fontSize:10, color:'var(--text-3)' }}>{k}</span>
                    <span style={{ fontSize:10, fontWeight:600, color:catColor }}>{v}</span>
                  </div>
                ))}
                <div style={{ marginTop:8, textAlign:'right' }}><span style={{ fontSize:10, fontWeight:700, color:catColor }}>Apply →</span></div>
              </button>
            )
          })}
        </div>
      </Sec>

      <Sec title="Key terms explained" sub="Click any term to expand">
        <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:8 }}>
          {GLOSSARY.map((g,i)=><GlsTerm key={i} term={g.term} def={g.def} catColor={catColor}/>)}
        </div>
      </Sec>

      <HealthJourneyNext catColor={catColor} intro="Hydration is the foundation. Pair your water intake with the right nutrition targets." items={JOURNEY_ITEMS}/>

      <Sec title="Frequently asked questions" sub="Everything about daily water intake">
        {FAQ.map((f,i)=>(<Acc key={i} q={f.q} a={f.a} open={openFaq===i} onToggle={()=>setOpenFaq(openFaq===i?null:i)} catColor={catColor}/>))}
      </Sec>
    </div>
  )
}
