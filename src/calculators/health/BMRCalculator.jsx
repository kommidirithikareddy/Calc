import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'
import HealthJourneyNext from '../../components/health/HealthJourneyNext'

const clamp  = (v,a,b) => Math.min(b,Math.max(a,v))
const fmtKg  = n => `${(Math.round(n*10)/10).toFixed(1)} kg`
const fmtCm  = n => `${Math.round(n)} cm`
const fmtFtIn= (ft,i) => `${ft}′ ${i}″`

const ACTIVITY = [
  { key:'sed',   label:'Sedentary',          sub:'Little/no exercise',       factor:1.2   },
  { key:'light', label:'Lightly active',     sub:'1–3 days/week',            factor:1.375 },
  { key:'mod',   label:'Moderately active',  sub:'3–5 days/week',            factor:1.55  },
  { key:'high',  label:'Very active',        sub:'6–7 days/week',            factor:1.725 },
  { key:'xhigh', label:'Athlete',            sub:'Twice daily training',     factor:1.9   },
]

const GOAL_ADJUSTMENTS = [
  { key:'lose2',    label:'Lose 1 kg/week',    adj:-1000 },
  { key:'lose1',    label:'Lose 0.5 kg/week',  adj:-500  },
  { key:'maintain', label:'Maintain weight',   adj:0     },
  { key:'gain1',    label:'Gain 0.5 kg/week',  adj:500   },
  { key:'gain2',    label:'Gain 1 kg/week',    adj:1000  },
]

const MEAL_REFS = [
  { name:'Chicken breast (200g)', kcal:220 },
  { name:'Bowl of rice (200g)',   kcal:260 },
  { name:'Banana',                kcal:90  },
  { name:'Avocado',               kcal:240 },
  { name:'Boiled egg',            kcal:78  },
  { name:'Slice of pizza',        kcal:285 },
]

const GLOSSARY = [
  { term:'BMR',             def:'Basal Metabolic Rate — calories burned at complete rest. The minimum energy to keep you alive.' },
  { term:'TDEE',            def:'Total Daily Energy Expenditure — BMR × activity factor. Your actual daily calorie burn.' },
  { term:'Mifflin-St Jeor', def:'Most validated BMR equation (1990). Accurate to ±10% for 82% of people.' },
  { term:'Harris-Benedict', def:'Older BMR equation (1919, revised 1984). Slightly higher estimates than Mifflin.' },
  { term:'Caloric Deficit', def:'Eating fewer calories than TDEE. 500 kcal deficit ≈ 0.5 kg fat loss per week.' },
  { term:'Macronutrients',  def:'Protein (4 kcal/g), carbohydrates (4 kcal/g), fat (9 kcal/g). The three energy-providing nutrients.' },
]

const FAQ = [
  { q:'What is the difference between BMR and TDEE?',
    a:'BMR is the calories your body burns doing absolutely nothing — just keeping heart, lungs, and organs functioning. TDEE is BMR multiplied by an activity factor to account for movement, exercise, and digestion. TDEE is the number that matters for weight management.' },
  { q:'Which BMR formula is most accurate?',
    a:'The Mifflin-St Jeor equation (used as the default here) is validated as the most accurate for general populations — within ±10% for about 82% of people. The Harris-Benedict equation is older and tends to give slightly higher estimates. Neither accounts for body composition; lean, muscular individuals will have higher actual BMRs.' },
  { q:'How many calories should I eat to lose weight?',
    a:'A deficit of 500 kcal/day below your TDEE creates approximately 0.5 kg of fat loss per week — a safe, sustainable rate. Never eat below your BMR without medical supervision, as this causes muscle loss and metabolic adaptation. Combine a moderate deficit with resistance training for best results.' },
  { q:'What are macronutrients and how should I split them?',
    a:'Macronutrients are protein (4 kcal/g), carbohydrates (4 kcal/g), and fat (9 kcal/g). A general starting split is 30% protein, 40% carbs, 30% fat. Higher protein (35–40%) is better for weight loss as it preserves muscle and increases satiety. Adjust based on your goals and food preferences.' },
]

const EXAMPLES = [
  { title:'Active Male',    desc:'Gym 5 days/week, 30 yr', hCm:180, wKg:80, age:30, sex:'male',   activity:'mod',   goal:'maintain' },
  { title:'Female, Fat Loss',desc:'Light exercise, 28 yr', hCm:165, wKg:70, age:28, sex:'female', activity:'light', goal:'lose1'    },
  { title:'Athlete, Bulk',   desc:'Daily training, 24 yr', hCm:178, wKg:75, age:24, sex:'male',   activity:'xhigh', goal:'gain1'    },
]

const JOURNEY_ITEMS = [
  { title:'BMI Calculator',    sub:'Check your weight status',              icon:'⚖️', path:'/health/body-metrics/bmi-calculator'         },
  { title:'Ideal Weight',      sub:'What should you weigh?',                icon:'🎯', path:'/health/body-metrics/ideal-weight-calculator' },
  { title:'Water Intake',      sub:'How much water do you need daily?',     icon:'💧', path:'/health/body-metrics/water-intake-calculator' },
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
        <span style={{ fontSize:18, color:catColor, flexShrink:0, display:'inline-block', transition:'transform .2s', transform:open?'rotate(45deg)':'none' }}>+</span>
      </button>
      {open && <p style={{ fontSize:12.5, color:'var(--text-2)', lineHeight:1.75, margin:'0 0 13px', fontFamily:"'DM Sans',sans-serif" }}>{a}</p>}
    </div>
  )
}
function GlsTerm({ term, def, catColor }) {
  const [open,setOpen] = useState(false)
  return (
    <div onClick={()=>setOpen(o=>!o)} style={{ padding:'9px 12px', borderRadius:8, cursor:'pointer', transition:'all .15s', border:`1px solid ${open?catColor+'40':'var(--border)'}`, background:open?catColor+'10':'var(--bg-raised)' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:8 }}>
        <span style={{ fontSize:12, fontWeight:700, fontFamily:"'Space Grotesk',sans-serif", color:open?catColor:'var(--text)' }}>{term}</span>
        <span style={{ fontSize:14, color:catColor, flexShrink:0 }}>{open?'−':'+'}</span>
      </div>
      {open && <p style={{ fontSize:11.5, color:'var(--text-2)', lineHeight:1.65, margin:'6px 0 0', fontFamily:"'DM Sans',sans-serif" }}>{def}</p>}
    </div>
  )
}
function Stepper({ label, hint, value, onChange, min, max, step=1, unit, catColor }) {
  const [editing,setEditing] = useState(false)
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

export default function BMRCalculator({ meta, category }) {
  const catColor = category?.color || '#22a355'
  const [unit,       setUnit]      = useState('metric')
  const [hCm,        setHCm]       = useState(175)
  const [hFt,        setHFt]       = useState(5)
  const [hIn,        setHIn]       = useState(9)
  const [wKg,        setWKg]       = useState(75)
  const [wLbs,       setWLbs]      = useState(165)
  const [age,        setAge]       = useState(30)
  const [sex,        setSex]       = useState('male')
  const [activityKey,setActivityKey] = useState('mod')
  const [goalKey,    setGoalKey]   = useState('maintain')
  const [openFaq,    setOpenFaq]   = useState(null)

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

  const isM     = unit==='metric'
  const hM      = isM ? hCm/100 : (hFt*12+hIn)*0.0254
  const wKgVal  = isM ? wKg : wLbs/2.20462
  const hCmVal  = hM*100

  const bmrMifflin = sex==='male' ? 10*wKgVal+6.25*hCmVal-5*age+5 : 10*wKgVal+6.25*hCmVal-5*age-161
  const bmrHarris  = sex==='male' ? 88.362+13.397*wKgVal+4.799*hCmVal-5.677*age : 447.593+9.247*wKgVal+3.098*hCmVal-4.330*age

  const actFactor = ACTIVITY.find(a=>a.key===activityKey)?.factor || 1.55
  const goalAdj   = GOAL_ADJUSTMENTS.find(g=>g.key===goalKey)?.adj || 0
  const tdee      = bmrMifflin * actFactor
  const targetCal = tdee + goalAdj
  const goalLabel = GOAL_ADJUSTMENTS.find(g=>g.key===goalKey)?.label || 'Maintain'
  const goalColor = goalAdj<0 ? '#e07010' : goalAdj>0 ? '#22a355' : catColor

  // macro split (30% protein, 40% carbs, 30% fat)
  const proteinG = Math.round((targetCal*0.30)/4)
  const carbsG   = Math.round((targetCal*0.40)/4)
  const fatG     = Math.round((targetCal*0.30)/9)

  const hint = `BMR: ${Math.round(bmrMifflin).toLocaleString()} kcal/day at rest. TDEE (${ACTIVITY.find(a=>a.key===activityKey)?.label}): ${Math.round(tdee).toLocaleString()} kcal/day. Target for "${goalLabel}": ${Math.round(targetCal).toLocaleString()} kcal/day.`

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
          {/* activity level */}
          <div style={{ borderTop:'0.5px solid var(--border)', paddingTop:16, marginTop:4 }}>
            <div style={{ fontSize:12, fontWeight:600, color:'var(--text-2)', marginBottom:10, fontFamily:"'DM Sans',sans-serif" }}>Activity level</div>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {ACTIVITY.map(a => (
                <button key={a.key} onClick={()=>setActivityKey(a.key)} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'9px 13px', borderRadius:8, border:`1.5px solid ${activityKey===a.key?catColor:'var(--border-2)'}`, background:activityKey===a.key?catColor+'12':'var(--bg-raised)', cursor:'pointer', transition:'all .15s', fontFamily:"'DM Sans',sans-serif" }}>
                  <div style={{ textAlign:'left' }}>
                    <div style={{ fontSize:12, fontWeight:600, color:activityKey===a.key?catColor:'var(--text)' }}>{a.label}</div>
                    <div style={{ fontSize:10, color:'var(--text-3)' }}>{a.sub}</div>
                  </div>
                  <span style={{ fontSize:11, fontWeight:700, color:activityKey===a.key?catColor:'var(--text-3)' }}>×{a.factor}</span>
                </button>
              ))}
            </div>
          </div>
          {/* goal */}
          <div style={{ borderTop:'0.5px solid var(--border)', paddingTop:16, marginTop:12 }}>
            <div style={{ fontSize:12, fontWeight:600, color:'var(--text-2)', marginBottom:10, fontFamily:"'DM Sans',sans-serif" }}>Weight goal</div>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {GOAL_ADJUSTMENTS.map(g => (
                <button key={g.key} onClick={()=>setGoalKey(g.key)} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'9px 13px', borderRadius:8, border:`1.5px solid ${goalKey===g.key?catColor:'var(--border-2)'}`, background:goalKey===g.key?catColor+'12':'var(--bg-raised)', cursor:'pointer', transition:'all .15s', fontFamily:"'DM Sans',sans-serif" }}>
                  <span style={{ fontSize:12, fontWeight:600, color:goalKey===g.key?catColor:'var(--text)' }}>{g.label}</span>
                  <span style={{ fontSize:10, fontWeight:700, color:goalKey===g.key?catColor:'var(--text-3)' }}>{g.adj===0?'TDEE':g.adj>0?`+${g.adj} kcal`:`${g.adj} kcal`}</span>
                </button>
              ))}
            </div>
          </div>
        </>}
        right={<>
          <div style={{ background:'var(--bg-card)', border:'0.5px solid var(--border)', borderRadius:14, overflow:'hidden', marginBottom:14 }}>
            <div style={{ padding:'11px 16px', borderBottom:'0.5px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontSize:12, fontWeight:700, color:'var(--text)', fontFamily:"'Space Grotesk',sans-serif" }}>Calorie Summary</span>
              <span style={{ fontSize:10, color:'var(--text-3)' }}>Updates live</span>
            </div>
            <div style={{ padding:'16px 18px' }}>
              {/* target calories hero */}
              <div style={{ display:'flex', alignItems:'flex-end', gap:12, marginBottom:16 }}>
                <div>
                  <div style={{ fontSize:48, fontWeight:700, lineHeight:1, color:goalColor, fontFamily:"'Space Grotesk',sans-serif", transition:'color .3s' }}>
                    {Math.round(targetCal).toLocaleString()}
                  </div>
                  <div style={{ fontSize:11, color:'var(--text-3)', marginTop:3, fontFamily:"'DM Sans',sans-serif" }}>kcal/day target</div>
                </div>
                <div style={{ paddingBottom:6 }}>
                  <div style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'5px 12px 5px 8px', borderRadius:20, background: goalAdj<0?'#fdf3d0':goalAdj>0?'#d6f2e0':'#e0f4fa', border:`1px solid ${goalColor}35` }}>
                    <div style={{ width:8, height:8, borderRadius:'50%', background:goalColor }}/>
                    <span style={{ fontSize:12, fontWeight:700, color:goalColor, fontFamily:"'DM Sans',sans-serif" }}>{goalLabel}</span>
                  </div>
                </div>
              </div>

              {/* calorie bars: BMR → TDEE → Target */}
              {[
                { label:'BMR (at rest)',    val:bmrMifflin, color:'#0ea5e9' },
                { label:'TDEE (active)',    val:tdee,       color:catColor  },
                { label:'Your target',      val:targetCal,  color:goalColor },
              ].map((r,i) => {
                const max = Math.max(bmrMifflin, tdee, targetCal)*1.1
                return (
                  <div key={i} style={{ marginBottom:10 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, marginBottom:4 }}>
                      <span style={{ color:'var(--text-2)' }}>{r.label}</span>
                      <span style={{ fontWeight:700, color:r.color }}>{Math.round(r.val).toLocaleString()} kcal</span>
                    </div>
                    <div style={{ height:6, background:'var(--border)', borderRadius:3 }}>
                      <div style={{ height:'100%', width:`${(r.val/max)*100}%`, background:r.color, borderRadius:3, transition:'width .4s ease' }}/>
                    </div>
                  </div>
                )
              })}
            </div>
            <div style={{ margin:'0 18px 16px' }}>
              <div style={{ background:'#f0faf4', borderRadius:10, padding:'10px 13px', border:`1px solid ${catColor}30` }}>
                <p style={{ fontSize:11.5, color:'var(--text-2)', margin:0, lineHeight:1.65, fontFamily:"'DM Sans',sans-serif" }}>
                  {goalAdj<0 ? `A ${Math.abs(goalAdj)} kcal daily deficit creates approximately ${(Math.abs(goalAdj)/7700).toFixed(2)} kg fat loss per week — a safe, sustainable rate.`
                   : goalAdj>0 ? `A ${goalAdj} kcal daily surplus supports muscle building and weight gain at a healthy pace.`
                   : 'Eating at your TDEE maintains your current weight. Adjust activity level or goal to change your target.'}
                </p>
              </div>
            </div>
          </div>

          <BreakdownTable title="Calorie Breakdown" rows={[
            { label:'BMR (Mifflin)',    value:`${Math.round(bmrMifflin).toLocaleString()} kcal`, bold:true, highlight:true, color:'#0ea5e9' },
            { label:'BMR (Harris-B.)', value:`${Math.round(bmrHarris).toLocaleString()} kcal` },
            { label:'TDEE',            value:`${Math.round(tdee).toLocaleString()} kcal`, color:catColor },
            { label:'Goal adjustment', value:`${goalAdj===0?'None':goalAdj>0?`+${goalAdj}`:goalAdj} kcal`, color:goalColor },
            { label:'Daily target',    value:`${Math.round(targetCal).toLocaleString()} kcal`, color:goalColor },
            { label:'Protein target',  value:`${proteinG} g/day`, color:catColor },
            { label:'Carbs target',    value:`${carbsG} g/day` },
            { label:'Fat target',      value:`${fatG} g/day` },
          ]}/>
          <AIHintCard hint={hint}/>
        </>}
      />

      {/* Macro split */}
      <Sec title="Your macro split" sub="30% protein · 40% carbs · 30% fat (adjustable guideline)">
        <p style={{ fontSize:12, color:'var(--text-2)', lineHeight:1.7, marginBottom:14, fontFamily:"'DM Sans',sans-serif" }}>
          Based on your target of <strong style={{fontWeight:600,color:catColor}}>{Math.round(targetCal).toLocaleString()} kcal/day</strong>, here is a balanced macro split. Protein is prioritised at 30% to preserve muscle mass, especially important during a calorie deficit.
        </p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:14 }}>
          {[
            { name:'Protein', grams:proteinG, pct:30, kcal:proteinG*4,  color:'#22a355', note:'1.6–2.2g per kg body weight for muscle' },
            { name:'Carbs',   grams:carbsG,  pct:40, kcal:carbsG*4,   color:'#f59e0b', note:'Main fuel for training and brain function' },
            { name:'Fat',     grams:fatG,    pct:30, kcal:fatG*9,     color:'#8b5cf6', note:'Essential for hormones and fat-soluble vitamins' },
          ].map((m,i) => (
            <div key={i} style={{ background:'var(--bg-raised)', borderRadius:10, padding:'12px 14px', border:'0.5px solid var(--border)' }}>
              <div style={{ fontSize:13, fontWeight:700, color:m.color, marginBottom:4 }}>{m.name}</div>
              <div style={{ fontSize:22, fontWeight:700, color:'var(--text)', fontFamily:"'Space Grotesk',sans-serif", marginBottom:2 }}>{m.grams}g</div>
              <div style={{ fontSize:10, color:'var(--text-3)', marginBottom:6 }}>{m.pct}% · {m.kcal.toLocaleString()} kcal</div>
              <div style={{ height:4, background:'var(--border)', borderRadius:2 }}>
                <div style={{ height:'100%', width:`${m.pct}%`, background:m.color, borderRadius:2 }}/>
              </div>
              <div style={{ fontSize:10, color:'var(--text-3)', marginTop:6, lineHeight:1.4 }}>{m.note}</div>
            </div>
          ))}
        </div>
      </Sec>

      {/* Meal equivalents */}
      <Sec title="What your calories look like in food" sub="Making the numbers tangible">
        <p style={{ fontSize:12, color:'var(--text-2)', lineHeight:1.7, marginBottom:14, fontFamily:"'DM Sans',sans-serif" }}>
          Your daily target of <strong style={{fontWeight:600,color:catColor}}>{Math.round(targetCal).toLocaleString()} kcal</strong> equates to approximately this many servings of common foods.
        </p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:8 }}>
          {MEAL_REFS.map((m,i) => {
            const count = (targetCal/m.kcal).toFixed(1)
            return (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 12px', borderRadius:8, background:'var(--bg-raised)', border:'0.5px solid var(--border)' }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:12, fontWeight:600, color:'var(--text)', marginBottom:2 }}>{m.name}</div>
                  <div style={{ fontSize:10, color:'var(--text-3)' }}>{m.kcal} kcal each</div>
                </div>
                <div style={{ fontSize:18, fontWeight:700, color:catColor, fontFamily:"'Space Grotesk',sans-serif" }}>×{count}</div>
              </div>
            )
          })}
        </div>
      </Sec>

      {/* TDEE by activity */}
      <Sec title="TDEE across all activity levels" sub="How your daily burn changes with exercise">
        <p style={{ fontSize:12, color:'var(--text-2)', lineHeight:1.7, marginBottom:14, fontFamily:"'DM Sans',sans-serif" }}>Your BMR of {Math.round(bmrMifflin).toLocaleString()} kcal/day multiplied by your lifestyle factor gives your total daily expenditure.</p>
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          {ACTIVITY.map((a,i) => {
            const val = bmrMifflin*a.factor
            const max = bmrMifflin*1.9*1.05
            return (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'9px 12px', borderRadius:8, background: a.key===activityKey ? catColor+'12':'var(--bg-raised)', border:`0.5px solid ${a.key===activityKey?catColor:'var(--border)'}` }}>
                <div style={{ flex:2 }}>
                  <div style={{ fontSize:12, fontWeight:600, color: a.key===activityKey?catColor:'var(--text)' }}>{a.label}</div>
                  <div style={{ fontSize:10, color:'var(--text-3)' }}>{a.sub}</div>
                </div>
                <div style={{ flex:1, textAlign:'right' }}>
                  <div style={{ fontSize:14, fontWeight:700, color:a.key===activityKey?catColor:'var(--text-2)' }}>{Math.round(val).toLocaleString()}</div>
                  <div style={{ fontSize:9, color:'var(--text-3)' }}>kcal/day</div>
                </div>
                <div style={{ width:60, height:4, background:'var(--border)', borderRadius:2 }}>
                  <div style={{ height:'100%', width:`${(val/max)*100}%`, background:a.key===activityKey?catColor:catColor+'50', borderRadius:2 }}/>
                </div>
              </div>
            )
          })}
        </div>
      </Sec>

      {/* Formula */}
      <Sec title="The science behind the numbers" sub="BMR formulas used">
        <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:14 }}>
          {[
            { label:'Mifflin-St Jeor — male',   formula:'BMR = (10 × weight_kg) + (6.25 × height_cm) − (5 × age) + 5' },
            { label:'Mifflin-St Jeor — female', formula:'BMR = (10 × weight_kg) + (6.25 × height_cm) − (5 × age) − 161' },
            { label:'Harris-Benedict — male',   formula:'BMR = 88.362 + (13.397 × w) + (4.799 × h) − (5.677 × age)' },
            { label:'Harris-Benedict — female', formula:'BMR = 447.593 + (9.247 × w) + (3.098 × h) − (4.330 × age)' },
            { label:'TDEE',                     formula:'TDEE = BMR × activity factor   (1.2 sedentary → 1.9 athlete)' },
          ].map(f=>(
            <div key={f.label}>
              <div style={{ fontSize:10, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.05em', marginBottom:4 }}>{f.label}</div>
              <div style={{ background:'var(--bg-raised)', borderRadius:8, padding:'10px 14px', fontFamily:'monospace', fontSize:11, color:catColor, fontWeight:600, overflowX:'auto', whiteSpace:'nowrap' }}>{f.formula}</div>
            </div>
          ))}
        </div>
        <p style={{ fontSize:12, color:'var(--text-2)', lineHeight:1.75, margin:0, fontFamily:"'DM Sans',sans-serif" }}>Mifflin-St Jeor (1990) is the default — the most validated formula for general populations. Harris-Benedict (revised 1984) tends to estimate 5% higher. Neither accounts for body composition; lean individuals will have higher actual BMRs.</p>
      </Sec>

      {/* Examples */}
      <Sec title="Real world examples" sub="Click any to prefill the calculator">
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
          {EXAMPLES.map((ex,i)=>{
            const bmr2 = ex.sex==='male' ? 10*ex.wKg+6.25*ex.hCm-5*ex.age+5 : 10*ex.wKg+6.25*ex.hCm-5*ex.age-161
            const tdee2 = bmr2*(ACTIVITY.find(a=>a.key===ex.activity)?.factor||1.55)
            return (
              <button key={i} onClick={()=>applyExample(ex)}
                style={{ padding:14, borderRadius:10, border:'1.5px solid var(--border)', background:'var(--bg-raised)', cursor:'pointer', textAlign:'left', transition:'all .15s' }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=catColor;e.currentTarget.style.background=catColor+'10'}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.background='var(--bg-raised)'}}>
                <div style={{ fontSize:13, fontWeight:700, color:'var(--text)', marginBottom:2 }}>{ex.title}</div>
                <div style={{ fontSize:11, color:'var(--text-3)', marginBottom:9, lineHeight:1.4 }}>{ex.desc}</div>
                {[['BMR',`${Math.round(bmr2).toLocaleString()} kcal`],['TDEE',`${Math.round(tdee2).toLocaleString()} kcal`],['Goal',GOAL_ADJUSTMENTS.find(g=>g.key===ex.goal)?.label||'']].map(([k,v])=>(
                  <div key={k} style={{ display:'flex', justifyContent:'space-between' }}>
                    <span style={{ fontSize:10, color:'var(--text-3)' }}>{k}</span>
                    <span style={{ fontSize:10, fontWeight:600, color:catColor }}>{v}</span>
                  </div>
                ))}
                <div style={{ marginTop:8, textAlign:'right' }}>
                  <span style={{ fontSize:10, fontWeight:700, color:catColor }}>Apply →</span>
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

      <HealthJourneyNext catColor={catColor} intro="Your calorie needs are the foundation. These calculators help you understand where those calories should go and what your body is made of." items={JOURNEY_ITEMS}/>

      <Sec title="Frequently asked questions" sub="Everything about BMR and calories">
        {FAQ.map((f,i)=>(
          <Acc key={i} q={f.q} a={f.a} open={openFaq===i} onToggle={()=>setOpenFaq(openFaq===i?null:i)} catColor={catColor}/>
        ))}
      </Sec>
    </div>
  )
}
