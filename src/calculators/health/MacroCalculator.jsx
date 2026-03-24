import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'
import HealthJourneyNext from '../../components/health/HealthJourneyNext'

const clamp = (v,a,b) => Math.min(b,Math.max(a,v))

const GOALS = [
  { key:'lose',     label:'Lose fat',      protein:0.35, carbs:0.35, fat:0.30, color:'#ef4444' },
  { key:'maintain', label:'Maintain',      protein:0.30, carbs:0.40, fat:0.30, color:'#10b981' },
  { key:'gain',     label:'Build muscle',  protein:0.30, carbs:0.45, fat:0.25, color:'#3b82f6' },
  { key:'keto',     label:'Keto',          protein:0.30, carbs:0.05, fat:0.65, color:'#f59e0b' },
  { key:'highcarb', label:'High carb',     protein:0.25, carbs:0.55, fat:0.20, color:'#8b5cf6' },
]

const ACTIVITY = [
  { key:'sed',   label:'Sedentary',        factor:1.2   },
  { key:'light', label:'Lightly active',   factor:1.375 },
  { key:'mod',   label:'Moderately active',factor:1.55  },
  { key:'high',  label:'Very active',      factor:1.725 },
  { key:'xhigh', label:'Athlete',          factor:1.9   },
]

const FOOD_SOURCES = {
  protein: ['Chicken breast','Eggs','Greek yogurt','Tuna','Cottage cheese','Whey protein'],
  carbs:   ['Brown rice','Sweet potato','Oats','Quinoa','Whole wheat bread','Banana'],
  fat:     ['Avocado','Olive oil','Almonds','Salmon','Peanut butter','Dark chocolate'],
}

const GLOSSARY = [
  { term:'Macronutrients', def:'The three energy-providing nutrients: protein (4 kcal/g), carbohydrates (4 kcal/g), and fat (9 kcal/g). Everything you eat is a combination of these.' },
  { term:'Protein',        def:'Essential for muscle repair, immune function, and enzyme production. Aim for 1.6–2.2g per kg of lean body mass for active individuals.' },
  { term:'Carbohydrates',  def:'Primary fuel for the brain and muscles. Complex carbs (oats, rice) digest slowly; simple carbs (sugar) digest fast.' },
  { term:'Fat',            def:'Essential for hormone production, fat-soluble vitamins (A, D, E, K), and brain function. Never drop below 0.5g/kg/day.' },
  { term:'TDEE',           def:'Total Daily Energy Expenditure — your actual daily calorie burn. Macros are calculated from this number.' },
  { term:'Macro Split',    def:'The percentage of total calories coming from each macronutrient. E.g., 30/40/30 = 30% protein, 40% carbs, 30% fat.' },
]

const FAQ = [
  { q:'What is the best macro split for weight loss?',
    a:'Higher protein (30–35%) preserves muscle during a calorie deficit. Moderate carbs (35–40%) maintain training performance. Lower fat (25–30%) reduces calorie density. A 35/35/30 split (protein/carbs/fat) is well-supported for fat loss with resistance training.' },
  { q:'Do macros matter if I\'m hitting my calorie goal?',
    a:'Yes — significantly. Protein intake determines muscle retention during weight loss. Too little protein (below 1.2g/kg) causes muscle loss. Fat intake below 0.5g/kg disrupts hormones. While calories determine weight change, macros determine body composition change.' },
  { q:'How do I track macros?',
    a:'Use a food tracking app (MyFitnessPal, Cronometer) and weigh food in grams. Focus on hitting protein first — it\'s the hardest to reach. Fill remaining calories with carbs and fat based on your preference and training schedule.' },
  { q:'Should I change my macros on rest days vs training days?',
    a:'Carb cycling is an advanced strategy: higher carbs on training days (fuel), lower carbs on rest days (fat oxidation). Protein stays constant. Fat fills the gap. Most beginners benefit more from consistent daily macros than complex cycling protocols.' },
]

const EXAMPLES = [
  { title:'Fat Loss',    desc:'Female, 28, moderate exercise', hCm:165, wKg:68, age:28, sex:'female', activity:'mod',   goal:'lose',     kcal:0 },
  { title:'Maintenance', desc:'Male, 32, lightly active',      hCm:178, wKg:80, age:32, sex:'male',   activity:'light', goal:'maintain', kcal:0 },
  { title:'Muscle Gain', desc:'Male, 25, very active',         hCm:182, wKg:78, age:25, sex:'male',   activity:'high',  goal:'gain',     kcal:0 },
]

const JOURNEY_ITEMS = [
  { title:'Calorie Calculator',    sub:'Find your total daily calorie target first',  icon:'🔥', path:'/health/calories/calorie-calculator'     },
  { title:'Protein Calculator',    sub:'Detailed protein needs from lean body mass',  icon:'💪', path:'/health/calories/protein-calculator'     },
  { title:'Weight Loss Timeline',  sub:'How long to reach your goal weight?',         icon:'📅', path:'/health/calories/weight-loss-timeline'   },
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
            <button key={opt.value} onClick={()=>onChange(opt.value)} style={{ flex:1, padding:'12px 8px', borderRadius:10, cursor:'pointer', border:`1.5px solid ${active?catColor:'var(--border-2)'}`, background:active?catColor+'12':'var(--bg-raised)', display:'flex', flexDirection:'column', alignItems:'center', gap:6, transition:'all .18s', fontFamily:"'DM Sans',sans-serif" }}>
              <div style={{ width:28, height:28, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke={active?catColor:'var(--text-3)'} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{opt.icon}</svg>
              </div>
              <span style={{ fontSize:12, fontWeight:active?700:500, color:active?catColor:'var(--text-2)', lineHeight:1.2, textAlign:'center' }}>{opt.label}</span>
              {opt.sub && <span style={{ fontSize:10, color:active?catColor+'cc':'var(--text-3)', lineHeight:1.2, textAlign:'center' }}>{opt.sub}</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ── CONCEPT A: Health Score Card ── */
function HealthScoreCard({ title, score, grade, gradeColor, gradeSoft, factors, catColor }) {
  const R=42, C=54, circ=2*Math.PI*R
  const fill = circ*(clamp(score,0,100)/100)
  const ringColor = score>=80?'#10b981':score>=60?'#f59e0b':score>=40?'#f97316':'#ef4444'
  return (
    <div style={{ background:'var(--bg-card)', border:'0.5px solid var(--border)', borderRadius:14, overflow:'hidden', marginBottom:14 }}>
      <div style={{ padding:'11px 16px', borderBottom:'0.5px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <span style={{ fontSize:12, fontWeight:700, color:'var(--text)', fontFamily:"'Space Grotesk',sans-serif" }}>{title}</span>
        <span style={{ fontSize:10, color:'var(--text-3)' }}>Updates live</span>
      </div>
      <div style={{ padding:'16px 18px' }}>
        <div style={{ display:'flex', gap:18, alignItems:'center', marginBottom:16 }}>
          {/* score ring */}
          <svg viewBox="0 0 108 108" width="96" height="96" style={{ flexShrink:0 }}>
            <circle cx={C} cy={C} r={R} fill="none" stroke="var(--border)" strokeWidth="11"/>
            <circle cx={C} cy={C} r={R} fill="none" stroke={ringColor} strokeWidth="11"
              strokeLinecap="round" strokeDasharray={`${fill} ${circ}`}
              strokeDashoffset={circ/4} transform={`rotate(-90 ${C} ${C})`}
              style={{ transition:'stroke-dasharray .6s ease, stroke .3s' }}/>
            <text x={C} y={C-6} textAnchor="middle" fontSize="22" fontWeight="700" fill="var(--text)" fontFamily="inherit">{Math.round(score)}</text>
            <text x={C} y={C+10} textAnchor="middle" fontSize="9" fill="var(--text-3)" fontFamily="inherit">/ 100</text>
          </svg>
          {/* grade + badge */}
          <div>
            <div style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'5px 12px 5px 8px', borderRadius:20, background:gradeSoft, border:`1px solid ${gradeColor}35`, marginBottom:8 }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background:gradeColor }}/>
              <span style={{ fontSize:12, fontWeight:700, color:gradeColor, fontFamily:"'DM Sans',sans-serif" }}>{grade}</span>
            </div>
            <div style={{ fontSize:11, color:'var(--text-3)', fontFamily:"'DM Sans',sans-serif", lineHeight:1.5 }}>
              Macro balance score based on your goal split vs actuals.
            </div>
          </div>
        </div>
        {/* factor bars */}
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {factors.map((f,i) => (
            <div key={i}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, marginBottom:4 }}>
                <span style={{ color:'var(--text-2)', fontWeight:500 }}>{f.label}</span>
                <span style={{ fontWeight:700, color:f.color }}>{f.value}</span>
              </div>
              <div style={{ height:6, background:'var(--border)', borderRadius:3, overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${clamp(f.score,0,100)}%`, background:f.color, borderRadius:3, transition:'width .5s ease' }}/>
              </div>
              <div style={{ fontSize:10, color:'var(--text-3)', marginTop:2 }}>{f.note}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ margin:'0 18px 16px', padding:'10px 13px', background:gradeSoft, borderRadius:10, border:`1px solid ${gradeColor}30` }}>
        <p style={{ fontSize:11.5, color:'var(--text-2)', margin:0, lineHeight:1.65, fontFamily:"'DM Sans',sans-serif" }}>
          {score>=80?'Excellent macro balance for your goal. Maintain these ratios consistently.':score>=60?'Good split — fine-tune protein intake to optimise results.':score>=40?'Moderate balance. Increasing protein will significantly improve your score.':'Macro split needs adjustment. Focus on hitting protein targets first.'}
        </p>
      </div>
    </div>
  )
}

const UNIT_OPTIONS = [
  { value:'metric',   label:'Metric',   sub:'cm · kg', icon:<><rect x="3" y="2" width="16" height="18" rx="2.5"/><line x1="7" y1="7.5" x2="15" y2="7.5"/><line x1="7" y1="11" x2="15" y2="11"/><line x1="7" y1="14.5" x2="12" y2="14.5"/></> },
  { value:'imperial', label:'Imperial', sub:'ft · lbs', icon:<><rect x="3" y="2" width="16" height="18" rx="2.5"/><line x1="7" y1="7.5" x2="15" y2="7.5"/><line x1="7" y1="11" x2="15" y2="11"/><line x1="7" y1="14.5" x2="12" y2="14.5"/></> },
]
const SEX_OPTIONS = [
  { value:'male',   label:'Male',   icon:<><circle cx="11" cy="9" r="5"/><line x1="11" y1="14" x2="11" y2="20"/><line x1="8" y1="17" x2="14" y2="17"/></> },
  { value:'female', label:'Female', icon:<><circle cx="11" cy="8.5" r="5"/><line x1="11" y1="13.5" x2="11" y2="20"/><line x1="8" y1="17" x2="14" y2="17"/></> },
]

export default function MacroCalculator({ meta, category }) {
  const catColor = category?.color || '#f97316'
  const [unit,        setUnit]        = useState('metric')
  const [hCm,         setHCm]         = useState(175)
  const [hFt,         setHFt]         = useState(5)
  const [hIn,         setHIn]         = useState(9)
  const [wKg,         setWKg]         = useState(75)
  const [wLbs,        setWLbs]        = useState(165)
  const [age,         setAge]         = useState(30)
  const [sex,         setSex]         = useState('male')
  const [activityKey, setActivityKey] = useState('mod')
  const [goalKey,     setGoalKey]     = useState('maintain')
  const [kcalOverride,setKcalOverride]= useState(0)
  const [useOverride, setUseOverride] = useState(false)
  const [openFaq,     setOpenFaq]     = useState(null)

  function handleUnit(u) {
    if (u===unit) return
    if (u==='imperial') { const ti=Math.round(hCm/2.54); setHFt(Math.floor(ti/12)); setHIn(ti%12); setWLbs(Math.round(wKg*2.20462)) }
    else { setHCm(clamp(Math.round((hFt*12+hIn)*2.54),100,250)); setWKg(clamp(Math.round(wLbs/2.20462),20,300)) }
    setUnit(u)
  }
  function applyExample(ex) {
    setHCm(ex.hCm); setWKg(ex.wKg); setAge(ex.age); setSex(ex.sex); setActivityKey(ex.activity); setGoalKey(ex.goal); setUseOverride(false)
    const ti=Math.round(ex.hCm/2.54); setHFt(Math.floor(ti/12)); setHIn(ti%12); setWLbs(Math.round(ex.wKg*2.20462)); setUnit('metric')
  }

  const isM    = unit==='metric'
  const hM     = isM ? hCm/100 : (hFt*12+hIn)*0.0254
  const wKgVal = isM ? wKg : wLbs/2.20462
  const hCmVal = hM*100
  const bmr    = sex==='male' ? 10*wKgVal+6.25*hCmVal-5*age+5 : 10*wKgVal+6.25*hCmVal-5*age-161
  const tdee   = bmr*(ACTIVITY.find(a=>a.key===activityKey)?.factor||1.55)
  const totalKcal = useOverride && kcalOverride>0 ? kcalOverride : Math.round(tdee)
  const goal   = GOALS.find(g=>g.key===goalKey)||GOALS[1]

  const proteinG = Math.round((totalKcal*goal.protein)/4)
  const carbsG   = Math.round((totalKcal*goal.carbs)/4)
  const fatG     = Math.round((totalKcal*goal.fat)/9)
  const proteinKcal = proteinG*4
  const carbsKcal   = carbsG*4
  const fatKcal     = fatG*9

  // Score: how well does the split match the goal recommendation?
  const proteinScore = clamp(100 - Math.abs(proteinG/(wKgVal*1.9)-1)*100, 0, 100)
  const carbsScore   = Math.round(goal.carbs*100)
  const fatScore     = fat_g => clamp(100 - Math.abs(fat_g/(wKgVal*0.8)-1)*50, 0, 100)
  const overallScore = clamp((proteinScore*0.5+carbsScore*0.3+70*0.2), 0, 100)
  const scoreNum     = Math.round(overallScore)
  const grade        = scoreNum>=85?'Optimal':scoreNum>=70?'Good':scoreNum>=55?'Adequate':'Needs work'
  const gradeColor   = scoreNum>=85?'#10b981':scoreNum>=70?'#3b82f6':scoreNum>=55?'#f59e0b':'#ef4444'
  const gradeSoft    = scoreNum>=85?'#d1fae5':scoreNum>=70?'#dbeafe':scoreNum>=55?'#fef3c7':'#fee2e2'

  const factors = [
    { label:'Protein', value:`${proteinG}g (${Math.round(goal.protein*100)}%)`, score:Math.round(goal.protein*100*1.8), color:'#22a355', note:`${(proteinG/wKgVal).toFixed(1)}g per kg bodyweight` },
    { label:'Carbohydrates', value:`${carbsG}g (${Math.round(goal.carbs*100)}%)`, score:Math.round(goal.carbs*100*1.5), color:'#f59e0b', note:`${carbsKcal} kcal — primary training fuel` },
    { label:'Fat', value:`${fatG}g (${Math.round(goal.fat*100)}%)`, score:Math.round(goal.fat*100*2.5), color:'#8b5cf6', note:`${fatKcal} kcal — essential for hormones` },
  ]

  const hint = `${totalKcal.toLocaleString()} kcal/day for "${goal.label}". Protein: ${proteinG}g, Carbs: ${carbsG}g, Fat: ${fatG}g. Score: ${scoreNum}/100 — ${grade}.`

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <CalcShell
        left={<>
          <IconCardGroup label="Unit system" options={UNIT_OPTIONS} value={unit} onChange={handleUnit} catColor={catColor}/>
          <div style={{ borderTop:'0.5px solid var(--border)', paddingTop:16 }}>
            <div style={{ fontSize:10, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:14 }}>Body measurements</div>
            {isM ? <Stepper label="Height" value={hCm} onChange={setHCm} min={100} max={250} unit="cm" catColor={catColor}/>
              : <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                  <Stepper label="Feet" value={hFt} onChange={setHFt} min={3} max={7} unit="ft" catColor={catColor}/>
                  <Stepper label="Inches" value={hIn} onChange={setHIn} min={0} max={11} unit="in" catColor={catColor}/>
                </div>}
            {isM ? <Stepper label="Weight" value={wKg} onChange={setWKg} min={20} max={300} unit="kg" catColor={catColor}/>
              : <Stepper label="Weight" value={wLbs} onChange={setWLbs} min={44} max={660} unit="lbs" catColor={catColor}/>}
            <Stepper label="Age" value={age} onChange={setAge} min={10} max={100} unit="yrs" catColor={catColor}/>
          </div>
          <div style={{ borderTop:'0.5px solid var(--border)', paddingTop:16, marginTop:4 }}>
            <IconCardGroup label="Biological sex" options={SEX_OPTIONS} value={sex} onChange={setSex} catColor={catColor}/>
          </div>
          {/* activity */}
          <div style={{ borderTop:'0.5px solid var(--border)', paddingTop:16, marginTop:4 }}>
            <div style={{ fontSize:12, fontWeight:600, color:'var(--text-2)', marginBottom:8, fontFamily:"'DM Sans',sans-serif" }}>Activity level</div>
            <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
              {ACTIVITY.map(a => (
                <button key={a.key} onClick={()=>setActivityKey(a.key)} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 12px', borderRadius:8, border:`1.5px solid ${activityKey===a.key?catColor:'var(--border-2)'}`, background:activityKey===a.key?catColor+'12':'var(--bg-raised)', cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>
                  <span style={{ fontSize:12, fontWeight:600, color:activityKey===a.key?catColor:'var(--text)' }}>{a.label}</span>
                  <span style={{ fontSize:10, color:'var(--text-3)' }}>×{a.factor}</span>
                </button>
              ))}
            </div>
          </div>
          {/* goal */}
          <div style={{ borderTop:'0.5px solid var(--border)', paddingTop:16, marginTop:12 }}>
            <div style={{ fontSize:12, fontWeight:600, color:'var(--text-2)', marginBottom:8, fontFamily:"'DM Sans',sans-serif" }}>Goal / diet style</div>
            <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
              {GOALS.map(g => (
                <button key={g.key} onClick={()=>setGoalKey(g.key)} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 12px', borderRadius:8, border:`1.5px solid ${goalKey===g.key?g.color:'var(--border-2)'}`, background:goalKey===g.key?g.color+'12':'var(--bg-raised)', cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>
                  <span style={{ fontSize:12, fontWeight:600, color:goalKey===g.key?g.color:'var(--text)' }}>{g.label}</span>
                  <span style={{ fontSize:10, color:'var(--text-3)' }}>{Math.round(g.protein*100)}/{Math.round(g.carbs*100)}/{Math.round(g.fat*100)}</span>
                </button>
              ))}
            </div>
          </div>
          {/* calorie override */}
          <div style={{ borderTop:'0.5px solid var(--border)', paddingTop:16, marginTop:12 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
              <span style={{ fontSize:12, fontWeight:600, color:'var(--text-2)', fontFamily:"'DM Sans',sans-serif" }}>Custom calorie target</span>
              <button onClick={()=>setUseOverride(o=>!o)} style={{ fontSize:11, fontWeight:600, color:useOverride?catColor:'var(--text-3)', background:useOverride?catColor+'15':'var(--bg-raised)', border:`1px solid ${useOverride?catColor:'var(--border)'}`, borderRadius:8, padding:'3px 10px', cursor:'pointer' }}>
                {useOverride?'Using custom':'Use custom'}
              </button>
            </div>
            {useOverride && <Stepper label="Daily calories" value={kcalOverride||Math.round(tdee)} onChange={setKcalOverride} min={800} max={6000} step={50} unit="kcal" hint="Override TDEE" catColor={catColor}/>}
            {!useOverride && <p style={{ fontSize:11, color:'var(--text-3)', fontFamily:"'DM Sans',sans-serif", lineHeight:1.5 }}>Using calculated TDEE: {Math.round(tdee).toLocaleString()} kcal/day</p>}
          </div>
        </>}
        right={<>
          <HealthScoreCard title="Macro Score" score={scoreNum} grade={grade} gradeColor={gradeColor} gradeSoft={gradeSoft} factors={factors} catColor={catColor}/>
          <BreakdownTable title="Macro Breakdown" rows={[
            { label:'Total calories',   value:`${totalKcal.toLocaleString()} kcal`, bold:true, highlight:true, color:catColor },
            { label:'Protein',          value:`${proteinG}g (${proteinKcal} kcal)`, color:'#22a355' },
            { label:'Carbohydrates',    value:`${carbsG}g (${carbsKcal} kcal)`,     color:'#f59e0b' },
            { label:'Fat',              value:`${fatG}g (${fatKcal} kcal)`,          color:'#8b5cf6' },
            { label:'Protein per kg',   value:`${(proteinG/wKgVal).toFixed(1)}g/kg` },
            { label:'Split (P/C/F)',    value:`${Math.round(goal.protein*100)}/${Math.round(goal.carbs*100)}/${Math.round(goal.fat*100)}` },
          ]}/>
          <AIHintCard hint={hint}/>
        </>}
      />

      {/* visual macro ring */}
      <Sec title="Your daily macro split" sub="Visualised by calories">
        <p style={{ fontSize:12, color:'var(--text-2)', lineHeight:1.7, marginBottom:14, fontFamily:"'DM Sans',sans-serif" }}>Each gram of macronutrient provides different energy. Fat provides 9 kcal/g — more than double protein or carbs at 4 kcal/g each.</p>
        <div style={{ display:'flex', alignItems:'center', gap:24, flexWrap:'wrap' }}>
          <svg viewBox="0 0 140 140" width="130" height="130" style={{ flexShrink:0 }}>
            {(() => {
              const total = proteinKcal+carbsKcal+fatKcal
              const segs = [
                { pct:proteinKcal/total, color:'#22a355', label:'Protein' },
                { pct:carbsKcal/total,   color:'#f59e0b', label:'Carbs'   },
                { pct:fatKcal/total,     color:'#8b5cf6', label:'Fat'     },
              ]
              const R=52, cx=70, cy=70
              let start=0
              return segs.map((s,i)=>{
                const sweep = s.pct*2*Math.PI
                const x1=cx+R*Math.cos(start-Math.PI/2), y1=cy+R*Math.sin(start-Math.PI/2)
                const x2=cx+R*Math.cos(start+sweep-Math.PI/2), y2=cy+R*Math.sin(start+sweep-Math.PI/2)
                const large=sweep>Math.PI?1:0
                const path=`M${cx} ${cy} L${x1.toFixed(1)} ${y1.toFixed(1)} A${R} ${R} 0 ${large} 1 ${x2.toFixed(1)} ${y2.toFixed(1)} Z`
                start+=sweep
                return <path key={i} d={path} fill={s.color} opacity="0.85"/>
              })
            })()}
            <circle cx="70" cy="70" r="32" fill="var(--bg-card)"/>
            <text x="70" y="66" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--text)" fontFamily="inherit">{totalKcal.toLocaleString()}</text>
            <text x="70" y="78" textAnchor="middle" fontSize="8" fill="var(--text-3)" fontFamily="inherit">kcal/day</text>
          </svg>
          <div style={{ flex:1, display:'flex', flexDirection:'column', gap:10 }}>
            {[
              { name:'Protein', g:proteinG, kcal:proteinKcal, color:'#22a355', pct:Math.round(goal.protein*100) },
              { name:'Carbohydrates', g:carbsG, kcal:carbsKcal, color:'#f59e0b', pct:Math.round(goal.carbs*100) },
              { name:'Fat', g:fatG, kcal:fatKcal, color:'#8b5cf6', pct:Math.round(goal.fat*100) },
            ].map((m,i)=>(
              <div key={i}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:4 }}>
                  <span style={{ fontWeight:700, color:m.color }}>{m.name}</span>
                  <span style={{ color:'var(--text-2)' }}>{m.g}g · {m.kcal} kcal · {m.pct}%</span>
                </div>
                <div style={{ height:6, background:'var(--border)', borderRadius:3 }}>
                  <div style={{ height:'100%', width:`${m.pct}%`, background:m.color, borderRadius:3, transition:'width .4s' }}/>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Sec>

      {/* food sources */}
      <Sec title="Best food sources for each macro" sub="Prioritise whole foods">
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
          {[
            { name:'Protein', color:'#22a355', foods:FOOD_SOURCES.protein, target:`${proteinG}g/day` },
            { name:'Carbs',   color:'#f59e0b', foods:FOOD_SOURCES.carbs,   target:`${carbsG}g/day` },
            { name:'Fat',     color:'#8b5cf6', foods:FOOD_SOURCES.fat,     target:`${fatG}g/day` },
          ].map((m,i)=>(
            <div key={i} style={{ background:'var(--bg-raised)', borderRadius:10, padding:'12px 14px', border:'0.5px solid var(--border)' }}>
              <div style={{ fontSize:12, fontWeight:700, color:m.color, marginBottom:2 }}>{m.name}</div>
              <div style={{ fontSize:10, color:'var(--text-3)', marginBottom:8 }}>Target: {m.target}</div>
              {m.foods.map((f,j)=>(
                <div key={j} style={{ display:'flex', alignItems:'center', gap:5, marginBottom:4 }}>
                  <div style={{ width:4, height:4, borderRadius:'50%', background:m.color, flexShrink:0 }}/>
                  <span style={{ fontSize:10, color:'var(--text-2)' }}>{f}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </Sec>

      {/* meal timing */}
      <Sec title="Spreading macros across your day" sub="Timing for maximum muscle protein synthesis">
        <p style={{ fontSize:12, color:'var(--text-2)', lineHeight:1.7, marginBottom:14, fontFamily:"'DM Sans',sans-serif" }}>
          Muscle protein synthesis peaks when protein is spread evenly across 4–5 meals of ~{Math.round(proteinG/4)}g each. Carbs are best front-loaded before training.
        </p>
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          {[
            { meal:'Breakfast',      pPct:0.25, cPct:0.30, fPct:0.25 },
            { meal:'Lunch',          pPct:0.30, cPct:0.35, fPct:0.30 },
            { meal:'Pre-workout',    pPct:0.15, cPct:0.20, fPct:0.05 },
            { meal:'Post-workout',   pPct:0.20, cPct:0.10, fPct:0.10 },
            { meal:'Dinner / snack', pPct:0.10, cPct:0.05, fPct:0.30 },
          ].map((m,i)=>(
            <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 12px', borderRadius:8, background:'var(--bg-raised)', border:'0.5px solid var(--border)' }}>
              <div style={{ width:100, fontSize:11, fontWeight:600, color:'var(--text)', flexShrink:0 }}>{m.meal}</div>
              <div style={{ flex:1, display:'flex', gap:3, height:5 }}>
                <div style={{ flex:m.pPct, background:'#22a355', borderRadius:2, opacity:0.8 }}/>
                <div style={{ flex:m.cPct, background:'#f59e0b', borderRadius:2, opacity:0.8 }}/>
                <div style={{ flex:m.fPct, background:'#8b5cf6', borderRadius:2, opacity:0.8 }}/>
              </div>
              <div style={{ fontSize:10, color:'var(--text-3)', minWidth:120, textAlign:'right' }}>
                P:{Math.round(proteinG*m.pPct)}g · C:{Math.round(carbsG*m.cPct)}g · F:{Math.round(fatG*m.fPct)}g
              </div>
            </div>
          ))}
        </div>
      </Sec>

      {/* formula */}
      <Sec title="The science behind the numbers" sub="How macros are calculated">
        <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:14 }}>
          {[
            { label:'Protein (kcal)',    formula:`Protein (g) = Total kcal × ${Math.round(goal.protein*100)}% ÷ 4` },
            { label:'Carbohydrates',     formula:`Carbs (g) = Total kcal × ${Math.round(goal.carbs*100)}% ÷ 4` },
            { label:'Fat',               formula:`Fat (g) = Total kcal × ${Math.round(goal.fat*100)}% ÷ 9` },
            { label:'Energy values',     formula:'Protein = 4 kcal/g   |   Carbohydrates = 4 kcal/g   |   Fat = 9 kcal/g' },
          ].map(f=>(
            <div key={f.label}>
              <div style={{ fontSize:10, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.05em', marginBottom:4 }}>{f.label}</div>
              <div style={{ background:'var(--bg-raised)', borderRadius:8, padding:'10px 14px', fontFamily:'monospace', fontSize:11, color:catColor, fontWeight:600, overflowX:'auto', whiteSpace:'nowrap' }}>{f.formula}</div>
            </div>
          ))}
        </div>
        <p style={{ fontSize:12, color:'var(--text-2)', lineHeight:1.75, margin:0, fontFamily:"'DM Sans',sans-serif" }}>Macro splits are derived from your TDEE (Mifflin-St Jeor × activity factor). Splits vary by goal — keto removes most carbs, high-carb maximises glycogen for endurance athletes. Protein minimum is 1.2g/kg bodyweight regardless of goal.</p>
      </Sec>

      {/* examples */}
      <Sec title="Real world examples" sub="Click any to prefill">
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
          {EXAMPLES.map((ex,i)=>{
            const bmr2 = ex.sex==='male' ? 10*ex.wKg+6.25*ex.hCm-5*ex.age+5 : 10*ex.wKg+6.25*ex.hCm-5*ex.age-161
            const tdee2= bmr2*(ACTIVITY.find(a=>a.key===ex.activity)?.factor||1.55)
            const g2   = GOALS.find(g=>g.key===ex.goal)||GOALS[1]
            return (
              <button key={i} onClick={()=>applyExample(ex)} style={{ padding:14, borderRadius:10, border:'1.5px solid var(--border)', background:'var(--bg-raised)', cursor:'pointer', textAlign:'left', transition:'all .15s' }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=catColor;e.currentTarget.style.background=catColor+'10'}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.background='var(--bg-raised)'}}>
                <div style={{ fontSize:13, fontWeight:700, color:'var(--text)', marginBottom:2 }}>{ex.title}</div>
                <div style={{ fontSize:11, color:'var(--text-3)', marginBottom:9, lineHeight:1.4 }}>{ex.desc}</div>
                {[['Calories',`${Math.round(tdee2).toLocaleString()} kcal`],['Protein',`${Math.round(tdee2*g2.protein/4)}g`],['Split',`${Math.round(g2.protein*100)}/${Math.round(g2.carbs*100)}/${Math.round(g2.fat*100)}`]].map(([k,v])=>(
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

      <HealthJourneyNext catColor={catColor} intro="Macros are the blueprint. These calculators help you put the plan into action." items={JOURNEY_ITEMS}/>

      <Sec title="Frequently asked questions" sub="Everything about macronutrients">
        {FAQ.map((f,i)=>(<Acc key={i} q={f.q} a={f.a} open={openFaq===i} onToggle={()=>setOpenFaq(openFaq===i?null:i)} catColor={catColor}/>))}
      </Sec>
    </div>
  )
}
