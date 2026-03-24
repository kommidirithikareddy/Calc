import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'
import HealthJourneyNext from '../../components/health/HealthJourneyNext'
import InsightRotator from '../../components/health/InsightRotator'

const clamp = (v,a,b) => Math.min(b,Math.max(a,v))
const fmtKg = n => `${(Math.round(n*10)/10).toFixed(1)} kg`
const fmtLbs= n => `${(Math.round(n*2.20462*10)/10).toFixed(1)} lbs`

const ACTIVITY = [
  { key:'sed',   label:'Sedentary',         sub:'Little/no exercise',    factor:1.2   },
  { key:'light', label:'Lightly active',    sub:'1–3 days/week',         factor:1.375 },
  { key:'mod',   label:'Moderately active', sub:'3–5 days/week',         factor:1.55  },
  { key:'high',  label:'Very active',       sub:'6–7 days/week',         factor:1.725 },
  { key:'xhigh', label:'Athlete',           sub:'Twice daily training',  factor:1.9   },
]

const GOALS = [
  { key:'lose2',    label:'Lose fast',      sub:'1 kg/week',      adj:-1000, color:'#ef4444', rate:-1   },
  { key:'lose1',    label:'Lose steady',    sub:'0.5 kg/week',    adj:-500,  color:'#f97316', rate:-0.5 },
  { key:'maintain', label:'Maintain',       sub:'Stay the same',  adj:0,     color:'#10b981', rate:0    },
  { key:'gain1',    label:'Gain lean',      sub:'0.5 kg/week',    adj:500,   color:'#3b82f6', rate:0.5  },
  { key:'gain2',    label:'Bulk',           sub:'1 kg/week',      adj:1000,  color:'#8b5cf6', rate:1    },
]

const FOODS = [
  { name:'Chicken breast (150g)', kcal:165, icon:'🍗' },
  { name:'Brown rice (200g)',     kcal:216, icon:'🍚' },
  { name:'Banana',                kcal:89,  icon:'🍌' },
  { name:'Whole egg',             kcal:78,  icon:'🥚' },
  { name:'Avocado (half)',        kcal:120, icon:'🥑' },
  { name:'Slice of pizza',        kcal:285, icon:'🍕' },
  { name:'Protein shake',         kcal:130, icon:'🧃' },
  { name:'Handful of almonds',    kcal:164, icon:'🥜' },
]

const GLOSSARY = [
  { term:'BMR',             def:'Basal Metabolic Rate — calories your body burns at complete rest. The minimum energy to sustain organ function.' },
  { term:'TDEE',            def:'Total Daily Energy Expenditure — BMR × activity factor. Your actual daily calorie burn including all movement.' },
  { term:'Caloric Deficit', def:'Eating fewer calories than your TDEE. 500 kcal deficit/day ≈ 0.5 kg fat loss/week.' },
  { term:'Caloric Surplus', def:'Eating more calories than your TDEE. 500 kcal surplus/day ≈ 0.5 kg weight gain/week.' },
  { term:'Macronutrients',  def:'Protein (4 kcal/g), Carbohydrates (4 kcal/g), Fat (9 kcal/g). The three energy-providing nutrient groups.' },
  { term:'Mifflin-St Jeor', def:'Most validated BMR formula (1990). Accurate to ±10% for 82% of people. Used as the primary formula here.' },
]

const FAQ = [
  { q:'How many calories do I need per day?',
    a:'Your daily calorie needs depend on your BMR (baseline metabolism) multiplied by your activity level to give TDEE. For an average adult male this is roughly 2,000–3,000 kcal/day; for females 1,600–2,400 kcal/day. This calculator gives you your personalised number based on height, weight, age, sex, and activity level.' },
  { q:'What calorie deficit is safe for weight loss?',
    a:'A deficit of 300–500 kcal/day is considered safe and sustainable, producing 0.3–0.5 kg of fat loss per week. Deficits above 1,000 kcal/day risk muscle loss, nutritional deficiencies, and metabolic adaptation. The minimum safe intake is approximately 1,200 kcal/day for females and 1,500 kcal/day for males.' },
  { q:'Should I eat back calories I burn exercising?',
    a:'This calculator already accounts for exercise via the activity factor — your TDEE includes your exercise calories. You should NOT eat back additional exercise calories on top of this figure, as that would double-count them. The only exception is if your actual exercise significantly exceeds the activity level you selected.' },
  { q:'Why do calorie calculators give different numbers?',
    a:'Different calculators use different BMR formulas (Mifflin, Harris-Benedict, Katch-McArdle) and may round activity factors differently. The spread between formulas is typically 50–200 kcal/day for average adults. Treat any calculator result as a starting point — track for 2–3 weeks, observe weight changes, and adjust by 100–200 kcal as needed.' },
  { q:'How accurate is this calorie calculator?',
    a:'The Mifflin-St Jeor equation used here is accurate to within ±10% for approximately 82% of people. Error increases for very lean or very obese individuals, and for those with thyroid conditions or medications affecting metabolism. Treat the output as a calibrated estimate, not an exact prescription.' },
]

const EXAMPLES = [
  { title:'Active Male',     desc:'30 yr, gym 5x/week',   hCm:180, wKg:80,  age:30, sex:'male',   activity:'mod',   goal:'maintain' },
  { title:'Female, Cut',     desc:'28 yr, light exercise', hCm:165, wKg:68,  age:28, sex:'female', activity:'light', goal:'lose1'    },
  { title:'Athlete Bulking', desc:'24 yr, daily training', hCm:178, wKg:74,  age:24, sex:'male',   activity:'xhigh', goal:'gain1'    },
]

const JOURNEY_ITEMS = [
  { title:'Macro Calculator',  sub:'Split your calories into protein, carbs, fat', icon:'🥗', path:'/health/calories/macro-calculator'    },
  { title:'TDEE Calculator',   sub:'Detailed energy expenditure breakdown',         icon:'⚡', path:'/health/calories/tdee-calculator'     },
  { title:'Weight Loss Timeline',sub:'When will you reach your goal weight?',       icon:'📅', path:'/health/calories/weight-loss-timeline' },
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
      <div style={{ display:'flex', alignItems:'stretch', height:40, border:`1.5px solid ${editing?catColor:'var(--border-2)'}`, borderRadius:9, overflow:'hidden', background:'var(--bg-card)', boxShadow:editing?`0 0 0 3px ${catColor}18`:'none', transition:'border-color .15s,box-shadow .15s' }}>
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
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke={active?catColor:'var(--text-3)'} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ transition:'stroke .18s' }}>{opt.icon}</svg>
              </div>
              <span style={{ fontSize:12, fontWeight:active?700:500, color:active?catColor:'var(--text-2)', lineHeight:1.2, textAlign:'center', transition:'color .18s' }}>{opt.label}</span>
              {opt.sub && <span style={{ fontSize:10, color:active?catColor+'cc':'var(--text-3)', lineHeight:1.2, textAlign:'center' }}>{opt.sub}</span>}
            </button>
          )
        })}
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

/* ══ INSIGHT SLIDES ══ */
function SlideTarget({ targetCal, bmr, tdee, goal, catColor }) {
  const g = GOALS.find(x => x.key === goal)
  const maxVal = Math.max(bmr, tdee, targetCal) * 1.1
  return (
    <div>
      <div style={{ display:'flex', alignItems:'flex-end', gap:12, marginBottom:14 }}>
        <div>
          <div style={{ fontSize:48, fontWeight:700, lineHeight:1, color:g.color, fontFamily:"'Space Grotesk',sans-serif", transition:'color .3s' }}>
            {Math.round(targetCal).toLocaleString()}
          </div>
          <div style={{ fontSize:11, color:'var(--text-3)', marginTop:3 }}>kcal/day — your target</div>
        </div>
        <div style={{ paddingBottom:6 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'5px 12px 5px 8px', borderRadius:20, background:g.color+'18', border:`1px solid ${g.color}35` }}>
            <div style={{ width:8, height:8, borderRadius:'50%', background:g.color }}/>
            <span style={{ fontSize:12, fontWeight:700, color:g.color }}>{g.label}</span>
          </div>
        </div>
      </div>
      {[{label:'BMR (at rest)',val:bmr,color:'#0ea5e9'},{label:'TDEE (active)',val:tdee,color:catColor},{label:'Your target',val:targetCal,color:g.color}].map((r,i)=>(
        <div key={i} style={{ marginBottom:8 }}>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, marginBottom:3 }}>
            <span style={{ color:'var(--text-2)' }}>{r.label}</span>
            <span style={{ fontWeight:700, color:r.color }}>{Math.round(r.val).toLocaleString()} kcal</span>
          </div>
          <div style={{ height:5, background:'var(--border)', borderRadius:3 }}>
            <div style={{ height:'100%', width:`${(r.val/maxVal)*100}%`, background:r.color, borderRadius:3, transition:'width .4s' }}/>
          </div>
        </div>
      ))}
    </div>
  )
}

function SlideMacros({ targetCal, catColor }) {
  const protein = Math.round((targetCal*0.30)/4)
  const carbs   = Math.round((targetCal*0.40)/4)
  const fat     = Math.round((targetCal*0.30)/9)
  return (
    <div>
      <div style={{ fontSize:10, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:12 }}>Daily macro targets (30/40/30 split)</div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginBottom:12 }}>
        {[
          { name:'Protein', g:protein, pct:30, kcal:protein*4,  color:'#22a355' },
          { name:'Carbs',   g:carbs,   pct:40, kcal:carbs*4,   color:'#f59e0b' },
          { name:'Fat',     g:fat,     pct:30, kcal:fat*9,     color:'#8b5cf6' },
        ].map((m,i)=>(
          <div key={i} style={{ background:'var(--bg-raised)', borderRadius:9, padding:'10px 11px', border:'0.5px solid var(--border)' }}>
            <div style={{ fontSize:10, color:m.color, fontWeight:700, marginBottom:3 }}>{m.name}</div>
            <div style={{ fontSize:20, fontWeight:700, color:'var(--text)', fontFamily:"'Space Grotesk',sans-serif" }}>{m.g}g</div>
            <div style={{ fontSize:9, color:'var(--text-3)', marginBottom:5 }}>{m.pct}% · {m.kcal} kcal</div>
            <div style={{ height:3, background:'var(--border)', borderRadius:2 }}>
              <div style={{ height:'100%', width:`${m.pct}%`, background:m.color, borderRadius:2 }}/>
            </div>
          </div>
        ))}
      </div>
      <div style={{ fontSize:11, color:'var(--text-2)', lineHeight:1.6, fontFamily:"'DM Sans',sans-serif" }}>
        Protein prioritised at 30% to preserve muscle. Adjust ratios based on your specific training goals.
      </div>
    </div>
  )
}

function SlideFood({ targetCal }) {
  return (
    <div>
      <div style={{ fontSize:10, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:10 }}>Your {Math.round(targetCal).toLocaleString()} kcal target in real food</div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
        {FOODS.slice(0,6).map((f,i)=>(
          <div key={i} style={{ display:'flex', alignItems:'center', gap:8, padding:'7px 10px', borderRadius:7, background:'var(--bg-raised)', border:'0.5px solid var(--border)' }}>
            <span style={{ fontSize:16, flexShrink:0 }}>{f.icon}</span>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:10, fontWeight:600, color:'var(--text)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{f.name}</div>
              <div style={{ fontSize:9, color:'var(--text-3)' }}>{f.kcal} kcal</div>
            </div>
            <div style={{ fontSize:12, fontWeight:700, color:'#f97316', flexShrink:0 }}>×{(targetCal/f.kcal).toFixed(1)}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SlideAllActivity({ bmr, activityKey, catColor }) {
  return (
    <div>
      <div style={{ fontSize:10, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:10 }}>TDEE across all activity levels</div>
      <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
        {ACTIVITY.map((a,i)=>{
          const val = bmr*a.factor
          const max = bmr*1.9*1.05
          const active = a.key===activityKey
          return (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'7px 10px', borderRadius:7, background:active?catColor+'12':'var(--bg-raised)', border:`0.5px solid ${active?catColor:'var(--border)'}` }}>
              <div style={{ width:90, fontSize:11, fontWeight:active?700:500, color:active?catColor:'var(--text-2)', flexShrink:0 }}>{a.label}</div>
              <div style={{ flex:1, height:5, background:'var(--border)', borderRadius:3 }}>
                <div style={{ height:'100%', width:`${(val/max)*100}%`, background:active?catColor:catColor+'40', borderRadius:3 }}/>
              </div>
              <div style={{ fontSize:11, fontWeight:700, color:active?catColor:'var(--text-2)', minWidth:42, textAlign:'right' }}>{Math.round(val).toLocaleString()}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ══ MAIN ══ */
export default function CalorieCalculator({ meta, category }) {
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
  const [openFaq,     setOpenFaq]     = useState(null)

  function handleUnit(u) {
    if (u===unit) return
    if (u==='imperial') { const ti=Math.round(hCm/2.54); setHFt(Math.floor(ti/12)); setHIn(ti%12); setWLbs(Math.round(wKg*2.20462)) }
    else { setHCm(clamp(Math.round((hFt*12+hIn)*2.54),100,250)); setWKg(clamp(Math.round(wLbs/2.20462),20,300)) }
    setUnit(u)
  }
  function applyExample(ex) {
    setHCm(ex.hCm); setWKg(ex.wKg); setAge(ex.age); setSex(ex.sex); setActivityKey(ex.activity); setGoalKey(ex.goal)
    const ti=Math.round(ex.hCm/2.54); setHFt(Math.floor(ti/12)); setHIn(ti%12); setWLbs(Math.round(ex.wKg*2.20462)); setUnit('metric')
  }

  const isM    = unit==='metric'
  const hM     = isM ? hCm/100 : (hFt*12+hIn)*0.0254
  const wKgVal = isM ? wKg : wLbs/2.20462
  const hCmVal = hM*100

  const bmr        = sex==='male' ? 10*wKgVal+6.25*hCmVal-5*age+5 : 10*wKgVal+6.25*hCmVal-5*age-161
  const actFactor  = ACTIVITY.find(a=>a.key===activityKey)?.factor || 1.55
  const goalObj    = GOALS.find(g=>g.key===goalKey) || GOALS[2]
  const tdee       = bmr*actFactor
  const targetCal  = tdee+goalObj.adj
  const proteinG   = Math.round((targetCal*0.30)/4)
  const carbsG     = Math.round((targetCal*0.40)/4)
  const fatG       = Math.round((targetCal*0.30)/9)
  const wFmt       = kg => isM ? fmtKg(kg) : fmtLbs(kg)

  const weeksToGoal = goalObj.rate !== 0 ? Math.abs(1/goalObj.rate) : null

  const hint = `Daily calorie target: ${Math.round(targetCal).toLocaleString()} kcal (${goalObj.label}). BMR: ${Math.round(bmr).toLocaleString()} kcal. TDEE: ${Math.round(tdee).toLocaleString()} kcal. Macros: ${proteinG}g protein, ${carbsG}g carbs, ${fatG}g fat.`

  const slides = [
    { label:'Your calorie target', content:<SlideTarget targetCal={targetCal} bmr={bmr} tdee={tdee} goal={goalKey} catColor={catColor}/> },
    { label:'Macro split',         content:<SlideMacros targetCal={targetCal} catColor={catColor}/> },
    { label:'In real food',        content:<SlideFood targetCal={targetCal}/> },
    { label:'All activity levels', content:<SlideAllActivity bmr={bmr} activityKey={activityKey} catColor={catColor}/> },
  ]

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <CalcShell
        left={<>
          <IconCardGroup label="Unit system" options={UNIT_OPTIONS} value={unit} onChange={handleUnit} catColor={catColor}/>
          <div style={{ borderTop:'0.5px solid var(--border)', paddingTop:16 }}>
            <div style={{ fontSize:10, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:14 }}>Body measurements</div>
            {isM
              ? <Stepper label="Height" value={hCm} onChange={setHCm} min={100} max={250} unit="cm" catColor={catColor}/>
              : <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                  <Stepper label="Feet" value={hFt} onChange={setHFt} min={3} max={7} unit="ft" catColor={catColor}/>
                  <Stepper label="Inches" value={hIn} onChange={setHIn} min={0} max={11} unit="in" catColor={catColor}/>
                </div>
            }
            {isM
              ? <Stepper label="Weight" value={wKg} onChange={setWKg} min={20} max={300} unit="kg" catColor={catColor}/>
              : <Stepper label="Weight" value={wLbs} onChange={setWLbs} min={44} max={660} unit="lbs" catColor={catColor}/>
            }
            <Stepper label="Age" value={age} onChange={setAge} min={10} max={100} unit="yrs" catColor={catColor}/>
          </div>
          <div style={{ borderTop:'0.5px solid var(--border)', paddingTop:16, marginTop:4 }}>
            <IconCardGroup label="Biological sex" options={SEX_OPTIONS} value={sex} onChange={setSex} catColor={catColor}/>
          </div>

          {/* activity */}
          <div style={{ borderTop:'0.5px solid var(--border)', paddingTop:16, marginTop:4 }}>
            <div style={{ fontSize:12, fontWeight:600, color:'var(--text-2)', marginBottom:10, fontFamily:"'DM Sans',sans-serif" }}>Activity level</div>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {ACTIVITY.map(a=>(
                <button key={a.key} onClick={()=>setActivityKey(a.key)} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'9px 13px', borderRadius:8, border:`1.5px solid ${activityKey===a.key?catColor:'var(--border-2)'}`, background:activityKey===a.key?catColor+'12':'var(--bg-raised)', cursor:'pointer', transition:'all .15s', fontFamily:"'DM Sans',sans-serif" }}>
                  <div>
                    <div style={{ fontSize:12, fontWeight:600, color:activityKey===a.key?catColor:'var(--text)', textAlign:'left' }}>{a.label}</div>
                    <div style={{ fontSize:10, color:'var(--text-3)' }}>{a.sub}</div>
                  </div>
                  <span style={{ fontSize:11, fontWeight:700, color:activityKey===a.key?catColor:'var(--text-3)' }}>×{a.factor}</span>
                </button>
              ))}
            </div>
          </div>

          {/* goal */}
          <div style={{ borderTop:'0.5px solid var(--border)', paddingTop:16, marginTop:12 }}>
            <div style={{ fontSize:12, fontWeight:600, color:'var(--text-2)', marginBottom:10, fontFamily:"'DM Sans',sans-serif" }}>Your goal</div>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {GOALS.map(g=>(
                <button key={g.key} onClick={()=>setGoalKey(g.key)} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'9px 13px', borderRadius:8, border:`1.5px solid ${goalKey===g.key?g.color:'var(--border-2)'}`, background:goalKey===g.key?g.color+'12':'var(--bg-raised)', cursor:'pointer', transition:'all .15s', fontFamily:"'DM Sans',sans-serif" }}>
                  <div>
                    <div style={{ fontSize:12, fontWeight:600, color:goalKey===g.key?g.color:'var(--text)', textAlign:'left' }}>{g.label}</div>
                    <div style={{ fontSize:10, color:'var(--text-3)' }}>{g.sub}</div>
                  </div>
                  <span style={{ fontSize:10, fontWeight:700, color:goalKey===g.key?g.color:'var(--text-3)' }}>
                    {g.adj===0?'TDEE':g.adj>0?`+${g.adj}`:g.adj} kcal
                  </span>
                </button>
              ))}
            </div>
          </div>
        </>}
        right={<>
          <InsightRotator catColor={catColor} title="Calorie Results" slides={slides} autoMs={4000}/>
          <BreakdownTable title="Calorie Breakdown" rows={[
            { label:'BMR (Mifflin)',   value:`${Math.round(bmr).toLocaleString()} kcal`,        bold:true, highlight:true, color:'#0ea5e9' },
            { label:'Activity factor',  value:`×${actFactor} (${ACTIVITY.find(a=>a.key===activityKey)?.label})` },
            { label:'TDEE',             value:`${Math.round(tdee).toLocaleString()} kcal`,        color:catColor },
            { label:'Goal adjustment',  value:`${goalObj.adj===0?'None':goalObj.adj>0?`+${goalObj.adj}`:goalObj.adj} kcal`, color:goalObj.color },
            { label:'Daily target',     value:`${Math.round(targetCal).toLocaleString()} kcal`,   color:goalObj.color },
            { label:'Protein',          value:`${proteinG}g/day (30%)`,  color:'#22a355' },
            { label:'Carbohydrates',    value:`${carbsG}g/day (40%)`,   color:'#f59e0b' },
            { label:'Fat',              value:`${fatG}g/day (30%)`,     color:'#8b5cf6' },
          ]}/>
          <AIHintCard hint={hint}/>
        </>}
      />

      {/* Weekly progress projection */}
      <Sec title="Your weekly progress projection" sub="At your current calorie target">
        <p style={{ fontSize:12, color:'var(--text-2)', lineHeight:1.7, marginBottom:14, fontFamily:"'DM Sans',sans-serif" }}>
          Based on a target of <strong style={{fontWeight:600,color:goalObj.color}}>{Math.round(targetCal).toLocaleString()} kcal/day</strong> ({goalObj.label}), here is your projected progress over the next 12 weeks.
        </p>
        <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
          {[1,2,4,8,12].map(w => {
            const change = (goalObj.rate||0) * w
            const newW   = wKgVal + change
            const bar    = Math.abs(change) / (Math.abs(goalObj.rate||0.5)*12)
            return (
              <div key={w} style={{ display:'flex', alignItems:'center', gap:10, padding:'7px 12px', borderRadius:7, background:'var(--bg-raised)', border:'0.5px solid var(--border)' }}>
                <div style={{ width:60, fontSize:11, fontWeight:600, color:'var(--text)', flexShrink:0 }}>Week {w}</div>
                <div style={{ flex:1, height:5, background:'var(--border)', borderRadius:3 }}>
                  {goalObj.rate!==0 && <div style={{ height:'100%', width:`${Math.min(bar*100,100)}%`, background:goalObj.color, borderRadius:3, transition:'width .4s' }}/>}
                </div>
                <div style={{ fontSize:11, fontWeight:700, color:goalObj.color, minWidth:70, textAlign:'right' }}>
                  {change===0 ? wFmt(newW) : `${change>0?'+':''}${fmtKg(Math.abs(change))} → ${wFmt(newW)}`}
                </div>
              </div>
            )
          })}
        </div>
        <p style={{ fontSize:10, color:'var(--text-3)', marginTop:8, fontFamily:"'DM Sans',sans-serif" }}>
          Based on 7,700 kcal ≈ 1 kg of fat. Actual results vary with body composition and adherence.
        </p>
      </Sec>

      {/* Meal plan template */}
      <Sec title="What your daily calories look like in meals" sub="A template — not a prescription">
        <p style={{ fontSize:12, color:'var(--text-2)', lineHeight:1.7, marginBottom:14, fontFamily:"'DM Sans',sans-serif" }}>
          Spreading {Math.round(targetCal).toLocaleString()} kcal across meals. Adjust portions and foods to match your preferences.
        </p>
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {[
            { meal:'Breakfast', pct:0.25, color:'#f59e0b', example:'Eggs, oats, fruit' },
            { meal:'Lunch',     pct:0.35, color:'#10b981', example:'Protein, complex carbs, vegetables' },
            { meal:'Dinner',    pct:0.30, color:'#0ea5e9', example:'Lean protein, rice/potato, salad' },
            { meal:'Snacks',    pct:0.10, color:'#8b5cf6', example:'Protein shake, nuts, yogurt' },
          ].map((m,i)=>{
            const kcal = Math.round(targetCal*m.pct)
            return (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 14px', borderRadius:9, background:'var(--bg-raised)', border:'0.5px solid var(--border)' }}>
                <div style={{ width:6, height:6, borderRadius:'50%', background:m.color, flexShrink:0 }}/>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:12, fontWeight:700, color:'var(--text)', marginBottom:2 }}>{m.meal}</div>
                  <div style={{ fontSize:10, color:'var(--text-3)' }}>{m.example}</div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontSize:14, fontWeight:700, color:m.color }}>{kcal.toLocaleString()}</div>
                  <div style={{ fontSize:9, color:'var(--text-3)' }}>kcal ({Math.round(m.pct*100)}%)</div>
                </div>
              </div>
            )
          })}
        </div>
      </Sec>

      {/* Formula */}
      <Sec title="The science behind the numbers" sub="Mifflin-St Jeor BMR formula">
        <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:14 }}>
          {[
            { label:'BMR — male',   formula:'BMR = (10 × weight_kg) + (6.25 × height_cm) − (5 × age) + 5' },
            { label:'BMR — female', formula:'BMR = (10 × weight_kg) + (6.25 × height_cm) − (5 × age) − 161' },
            { label:'TDEE',         formula:'TDEE = BMR × activity factor   (1.2 sedentary → 1.9 athlete)' },
            { label:'Target',       formula:'Target = TDEE + goal adjustment   (−1000 to +1000 kcal/day)' },
          ].map(f=>(
            <div key={f.label}>
              <div style={{ fontSize:10, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.05em', marginBottom:4 }}>{f.label}</div>
              <div style={{ background:'var(--bg-raised)', borderRadius:8, padding:'10px 14px', fontFamily:'monospace', fontSize:11, color:catColor, fontWeight:600, overflowX:'auto', whiteSpace:'nowrap' }}>{f.formula}</div>
            </div>
          ))}
        </div>
        <p style={{ fontSize:12, color:'var(--text-2)', lineHeight:1.75, margin:0, fontFamily:"'DM Sans',sans-serif" }}>Mifflin-St Jeor (1990) is the most validated general-population BMR formula. Activity factors (Harris-Benedict scale) convert BMR to TDEE. The 7,700 kcal/kg rule (1 lb ≈ 3,500 kcal) is used for weight change projections.</p>
      </Sec>

      {/* Examples */}
      <Sec title="Real world examples" sub="Click any to prefill">
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
          {EXAMPLES.map((ex,i)=>{
            const bmr2 = ex.sex==='male' ? 10*ex.wKg+6.25*ex.hCm-5*ex.age+5 : 10*ex.wKg+6.25*ex.hCm-5*ex.age-161
            const f2   = ACTIVITY.find(a=>a.key===ex.activity)?.factor||1.55
            const g2   = GOALS.find(g=>g.key===ex.goal)||GOALS[2]
            const t2   = bmr2*f2+g2.adj
            return (
              <button key={i} onClick={()=>applyExample(ex)}
                style={{ padding:14, borderRadius:10, border:'1.5px solid var(--border)', background:'var(--bg-raised)', cursor:'pointer', textAlign:'left', transition:'all .15s' }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=catColor;e.currentTarget.style.background=catColor+'10'}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.background='var(--bg-raised)'}}>
                <div style={{ fontSize:13, fontWeight:700, color:'var(--text)', marginBottom:2 }}>{ex.title}</div>
                <div style={{ fontSize:11, color:'var(--text-3)', marginBottom:9, lineHeight:1.4 }}>{ex.desc}</div>
                {[['BMR',`${Math.round(bmr2).toLocaleString()} kcal`],['TDEE',`${Math.round(bmr2*f2).toLocaleString()} kcal`],['Target',`${Math.round(t2).toLocaleString()} kcal`]].map(([k,v])=>(
                  <div key={k} style={{ display:'flex', justifyContent:'space-between' }}>
                    <span style={{ fontSize:10, color:'var(--text-3)' }}>{k}</span>
                    <span style={{ fontSize:10, fontWeight:600, color:catColor }}>{v}</span>
                  </div>
                ))}
                <div style={{ marginTop:8, display:'flex', alignItems:'center' }}>
                  <span style={{ fontSize:9, fontWeight:700, background:g2.color+'18', color:g2.color, padding:'2px 8px', borderRadius:10 }}>{g2.label}</span>
                  <span style={{ fontSize:10, fontWeight:700, color:catColor, marginLeft:'auto' }}>Apply →</span>
                </div>
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

      <HealthJourneyNext catColor={catColor} intro="Knowing your calorie target is step one. These calculators help you hit it with the right food choices and realistic timelines." items={JOURNEY_ITEMS}/>

      <Sec title="Frequently asked questions" sub="Everything about daily calories">
        {FAQ.map((f,i)=>(
          <Acc key={i} q={f.q} a={f.a} open={openFaq===i} onToggle={()=>setOpenFaq(openFaq===i?null:i)} catColor={catColor}/>
        ))}
      </Sec>
    </div>
  )
}
