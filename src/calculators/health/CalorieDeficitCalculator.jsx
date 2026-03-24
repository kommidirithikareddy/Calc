import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'
import HealthJourneyNext from '../../components/health/HealthJourneyNext'

const clamp = (v,a,b) => Math.min(b,Math.max(a,v))
const fmtKg = n => `${(Math.round(n*10)/10).toFixed(1)} kg`
const fmtLbs= n => `${(Math.round(n*2.20462*10)/10).toFixed(1)} lbs`

const ACTIVITY = [
  { key:'sed',   label:'Sedentary',         factor:1.2   },
  { key:'light', label:'Lightly active',    factor:1.375 },
  { key:'mod',   label:'Moderately active', factor:1.55  },
  { key:'high',  label:'Very active',       factor:1.725 },
  { key:'xhigh', label:'Athlete',           factor:1.9   },
]

const DEFICIT_LEVELS = [
  { key:'mild',     label:'Mild',     sub:'Slow, easy to sustain', kcal:250,  kgPerWeek:0.25, color:'#22a355' },
  { key:'moderate', label:'Moderate', sub:'Recommended for most',  kcal:500,  kgPerWeek:0.5,  color:'#3b82f6' },
  { key:'aggressive',label:'Aggressive',sub:'Fast, harder to sustain',kcal:750,kgPerWeek:0.75,color:'#f59e0b' },
  { key:'extreme',  label:'Extreme',  sub:'High muscle loss risk',  kcal:1000, kgPerWeek:1.0,  color:'#ef4444' },
]

const GLOSSARY = [
  { term:'Calorie Deficit',    def:'Eating fewer calories than your body burns. A 7,700 kcal total deficit ≈ 1 kg of fat lost.' },
  { term:'TDEE',               def:'Total Daily Energy Expenditure. Your actual daily calorie burn. A deficit is created below this number.' },
  { term:'Metabolic Adaptation',def:'The body reducing its BMR in response to prolonged calorie restriction. Averages 5–15% reduction after 10+ weeks of deficit. Diet breaks help counter this.' },
  { term:'Diet Break',          def:'A planned 1–2 week period eating at maintenance calories during a fat loss phase. Reduces metabolic adaptation and improves adherence.' },
  { term:'Lean Mass Preservation',def:'Maintaining muscle during fat loss. Achieved by: adequate protein (1.6–2.2g/kg), resistance training, moderate deficit (not extreme), and sufficient sleep.' },
  { term:'Recomp',              def:'Body recomposition — losing fat and gaining muscle simultaneously. Possible for beginners and those returning after a break, but slower than a dedicated cut.' },
]

const FAQ = [
  { q:'What is the safest calorie deficit for weight loss?',
    a:'A deficit of 300–500 kcal/day is considered the sweet spot: fast enough to see progress, mild enough to preserve muscle and maintain energy. This produces 0.3–0.5 kg/week fat loss. Deficits above 1,000 kcal/day significantly increase muscle loss risk, hormonal disruption, and diet failure rates.' },
  { q:'How long can I stay in a calorie deficit?',
    a:'Most evidence suggests 10–16 weeks of continuous deficit before a 1–2 week diet break. Beyond 16 weeks, metabolic adaptation significantly slows progress and hunger hormones (leptin, ghrelin) become disruptive. A structured approach: 10 weeks cutting → 2 weeks maintenance → repeat if needed.' },
  { q:'Will I lose muscle in a calorie deficit?',
    a:'You can minimise muscle loss by: eating 1.6–2.2g protein per kg of bodyweight, maintaining resistance training during the cut, not exceeding a 500–750 kcal/day deficit, and getting 7–9 hours sleep. Complete prevention of muscle loss is physiologically difficult, but protein + training preserves >90% of lean mass in a moderate deficit.' },
  { q:'Why do I stop losing weight in a deficit?',
    a:'Four main reasons: (1) The deficit has closed — as you lose weight, your TDEE decreases and the same calorie intake creates a smaller deficit. Recalculate every 4 weeks. (2) Water retention masking fat loss, especially around menstruation. (3) Metabolic adaptation reducing BMR. (4) Measurement error in tracking.' },
]

const EXAMPLES = [
  { title:'Steady Female', desc:'68kg, office worker, mild deficit',    wKg:68, sex:'female', hCm:165, age:30, activity:'light', deficit:'moderate', targetWKg:60 },
  { title:'Active Male',   desc:'85kg, gym-goer, moderate cut',        wKg:85, sex:'male',   hCm:180, age:28, activity:'mod',   deficit:'moderate', targetWKg:78 },
  { title:'Fast Track',    desc:'95kg male, aggressive deficit',        wKg:95, sex:'male',   hCm:178, age:35, activity:'light', deficit:'aggressive',targetWKg:80 },
]

const JOURNEY_ITEMS = [
  { title:'Weight Loss Timeline', sub:'Exactly when you\'ll reach your goal',   icon:'📅', path:'/health/calories/weight-loss-timeline'  },
  { title:'Macro Calculator',     sub:'What to eat within your deficit',         icon:'🥗', path:'/health/calories/macro-calculator'       },
  { title:'Calorie Calculator',   sub:'Find your TDEE and daily calorie target', icon:'🔥', path:'/health/calories/calorie-calculator'     },
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
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ── CONCEPT B: Narrative Story ── */
function NarrativeStoryCard({ title, stories, catColor }) {
  const colors = [catColor, '#0ea5e9', '#f59e0b']
  const softs  = [catColor+'18', '#e0f2fe', '#fef3c7']
  return (
    <div style={{ background:'var(--bg-card)', border:'0.5px solid var(--border)', borderRadius:14, overflow:'hidden', marginBottom:14 }}>
      <div style={{ padding:'11px 16px', borderBottom:'0.5px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <span style={{ fontSize:12, fontWeight:700, color:'var(--text)', fontFamily:"'Space Grotesk',sans-serif" }}>{title}</span>
        <span style={{ fontSize:10, color:'var(--text-3)' }}>Updates live as you edit</span>
      </div>
      <div style={{ padding:'16px 18px', display:'flex', flexDirection:'column', gap:10 }}>
        {stories.map((s,i) => (
          <div key={i} style={{ borderLeft:`3px solid ${colors[i]}`, paddingLeft:12, paddingTop:6, paddingBottom:6, borderRadius:'0 8px 8px 0', background:softs[i] }}>
            <div style={{ fontSize:9, fontWeight:700, color:colors[i], textTransform:'uppercase', letterSpacing:'.07em', marginBottom:4 }}>{s.label}</div>
            <div style={{ fontSize:13, fontWeight:600, color:'var(--text)', lineHeight:1.55, fontFamily:"'Space Grotesk',sans-serif" }}>{s.headline}</div>
            {s.detail && <div style={{ fontSize:11.5, color:'var(--text-2)', lineHeight:1.6, marginTop:4, fontFamily:"'DM Sans',sans-serif" }}>{s.detail}</div>}
          </div>
        ))}
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

export default function CalorieDeficitCalculator({ meta, category }) {
  const catColor = category?.color || '#3b82f6'
  const [unit,        setUnit]        = useState('metric')
  const [hCm,         setHCm]         = useState(170)
  const [hFt,         setHFt]         = useState(5)
  const [hIn,         setHIn]         = useState(7)
  const [wKg,         setWKg]         = useState(78)
  const [wLbs,        setWLbs]        = useState(172)
  const [targetWKg,   setTargetWKg]   = useState(70)
  const [targetWLbs,  setTargetWLbs]  = useState(154)
  const [age,         setAge]         = useState(30)
  const [sex,         setSex]         = useState('male')
  const [activityKey, setActivityKey] = useState('mod')
  const [deficitKey,  setDeficitKey]  = useState('moderate')
  const [openFaq,     setOpenFaq]     = useState(null)

  function handleUnit(u) {
    if (u===unit) return
    if (u==='imperial') {
      const ti=Math.round(hCm/2.54); setHFt(Math.floor(ti/12)); setHIn(ti%12)
      setWLbs(Math.round(wKg*2.20462)); setTargetWLbs(Math.round(targetWKg*2.20462))
    } else {
      setHCm(clamp(Math.round((hFt*12+hIn)*2.54),100,250))
      setWKg(clamp(Math.round(wLbs/2.20462),20,300))
      setTargetWKg(clamp(Math.round(targetWLbs/2.20462),20,300))
    }
    setUnit(u)
  }
  function applyExample(ex) {
    setHCm(ex.hCm); setWKg(ex.wKg); setTargetWKg(ex.targetWKg); setAge(ex.age); setSex(ex.sex); setActivityKey(ex.activity); setDeficitKey(ex.deficit)
    const ti=Math.round(ex.hCm/2.54); setHFt(Math.floor(ti/12)); setHIn(ti%12)
    setWLbs(Math.round(ex.wKg*2.20462)); setTargetWLbs(Math.round(ex.targetWKg*2.20462)); setUnit('metric')
  }

  const isM      = unit==='metric'
  const hM       = isM ? hCm/100 : (hFt*12+hIn)*0.0254
  const wKgVal   = isM ? wKg : wLbs/2.20462
  const tWKgVal  = isM ? targetWKg : targetWLbs/2.20462
  const hCmVal   = hM*100
  const wFmt     = kg => isM ? fmtKg(kg) : fmtLbs(kg)
  const diff     = clamp(wKgVal - tWKgVal, 0.5, 200)

  const bmr    = sex==='male' ? 10*wKgVal+6.25*hCmVal-5*age+5 : 10*wKgVal+6.25*hCmVal-5*age-161
  const tdee   = bmr*(ACTIVITY.find(a=>a.key===activityKey)?.factor||1.55)
  const defObj = DEFICIT_LEVELS.find(d=>d.key===deficitKey)||DEFICIT_LEVELS[1]
  const dailyKcal = Math.round(tdee - defObj.kcal)
  const weeks  = Math.ceil(diff / defObj.kgPerWeek)
  const months = (weeks/4.33).toFixed(1)
  const targetDate = new Date(); targetDate.setDate(targetDate.getDate()+weeks*7)
  const targetDateStr = targetDate.toLocaleDateString('en-GB',{month:'long',year:'numeric'})
  const totalKcalDeficit = Math.round(diff * 7700)

  const stories = [
    {
      label: 'Your deficit',
      headline: `A ${defObj.kcal} kcal/day deficit → ${wFmt(defObj.kgPerWeek)} lost per week`,
      detail: `Eat ${dailyKcal.toLocaleString()} kcal/day (${Math.round(tdee).toLocaleString()} TDEE − ${defObj.kcal} deficit). At this rate you'll lose ${wFmt(diff)} in approximately ${weeks} weeks.`,
    },
    {
      label: 'Your timeline',
      headline: `Reach ${wFmt(tWKgVal)} by ${targetDateStr}`,
      detail: `${months} months from today. That's ${totalKcalDeficit.toLocaleString()} total kcal of deficit — the equivalent of skipping ${Math.round(totalKcalDeficit/500)} meals.`,
    },
    {
      label: 'Protect your muscle',
      headline: `Eat at least ${Math.round(wKgVal*1.8)}g protein per day`,
      detail: `In a deficit, protein prevents muscle loss. Aim for 1.8g/kg (${Math.round(wKgVal*1.8)}g/day). Combined with 2–3 resistance training sessions/week, this preserves >90% of your lean mass.`,
    },
  ]

  const hint = `Deficit: ${defObj.kcal} kcal/day → ${dailyKcal.toLocaleString()} kcal target. Lose ${wFmt(diff)} in ${weeks} weeks (${months} months). Protein: ${Math.round(wKgVal*1.8)}g/day minimum.`

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <CalcShell
        left={<>
          <IconCardGroup label="Unit system" options={UNIT_OPTIONS} value={unit} onChange={handleUnit} catColor={catColor}/>
          <div style={{ borderTop:'0.5px solid var(--border)', paddingTop:16 }}>
            <div style={{ fontSize:10, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:14 }}>Your measurements</div>
            {isM ? <Stepper label="Height" value={hCm} onChange={setHCm} min={100} max={250} unit="cm" catColor={catColor}/>
              : <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                  <Stepper label="Feet" value={hFt} onChange={setHFt} min={3} max={7} unit="ft" catColor={catColor}/>
                  <Stepper label="Inches" value={hIn} onChange={setHIn} min={0} max={11} unit="in" catColor={catColor}/>
                </div>}
            {isM ? <Stepper label="Current weight" value={wKg} onChange={setWKg} min={30} max={300} unit="kg" catColor={catColor}/>
              : <Stepper label="Current weight" value={wLbs} onChange={setWLbs} min={66} max={660} unit="lbs" catColor={catColor}/>}
            {isM ? <Stepper label="Target weight" value={targetWKg} onChange={setTargetWKg} min={30} max={300} unit="kg" hint="Your goal" catColor={catColor}/>
              : <Stepper label="Target weight" value={targetWLbs} onChange={setTargetWLbs} min={66} max={660} unit="lbs" hint="Your goal" catColor={catColor}/>}
            <Stepper label="Age" value={age} onChange={setAge} min={10} max={100} unit="yrs" catColor={catColor}/>
          </div>
          <div style={{ borderTop:'0.5px solid var(--border)', paddingTop:16, marginTop:4 }}>
            <IconCardGroup label="Biological sex" options={SEX_OPTIONS} value={sex} onChange={setSex} catColor={catColor}/>
          </div>
          <div style={{ borderTop:'0.5px solid var(--border)', paddingTop:16, marginTop:4 }}>
            <div style={{ fontSize:12, fontWeight:600, color:'var(--text-2)', marginBottom:8, fontFamily:"'DM Sans',sans-serif" }}>Activity level</div>
            <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
              {ACTIVITY.map(a=>(
                <button key={a.key} onClick={()=>setActivityKey(a.key)} style={{ display:'flex', justifyContent:'space-between', padding:'8px 12px', borderRadius:8, border:`1.5px solid ${activityKey===a.key?catColor:'var(--border-2)'}`, background:activityKey===a.key?catColor+'12':'var(--bg-raised)', cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>
                  <span style={{ fontSize:12, fontWeight:600, color:activityKey===a.key?catColor:'var(--text)' }}>{a.label}</span>
                  <span style={{ fontSize:10, color:'var(--text-3)' }}>×{a.factor}</span>
                </button>
              ))}
            </div>
          </div>
          <div style={{ borderTop:'0.5px solid var(--border)', paddingTop:16, marginTop:12 }}>
            <div style={{ fontSize:12, fontWeight:600, color:'var(--text-2)', marginBottom:8, fontFamily:"'DM Sans',sans-serif" }}>Deficit size</div>
            <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
              {DEFICIT_LEVELS.map(d=>(
                <button key={d.key} onClick={()=>setDeficitKey(d.key)} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'9px 12px', borderRadius:8, border:`1.5px solid ${deficitKey===d.key?d.color:'var(--border-2)'}`, background:deficitKey===d.key?d.color+'12':'var(--bg-raised)', cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>
                  <div>
                    <div style={{ fontSize:12, fontWeight:600, color:deficitKey===d.key?d.color:'var(--text)', textAlign:'left' }}>{d.label}</div>
                    <div style={{ fontSize:10, color:'var(--text-3)' }}>{d.sub}</div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontSize:11, fontWeight:700, color:deficitKey===d.key?d.color:'var(--text-3)' }}>−{d.kcal} kcal</div>
                    <div style={{ fontSize:9, color:'var(--text-3)' }}>{d.kgPerWeek}kg/wk</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>}
        right={<>
          <NarrativeStoryCard title="Your deficit story" stories={stories} catColor={catColor}/>
          <BreakdownTable title="Deficit Summary" rows={[
            { label:'TDEE',             value:`${Math.round(tdee).toLocaleString()} kcal`, bold:true, highlight:true, color:'var(--text)' },
            { label:'Deficit',          value:`−${defObj.kcal} kcal/day`, color:defObj.color },
            { label:'Daily target',     value:`${dailyKcal.toLocaleString()} kcal`, color:catColor },
            { label:'Weight to lose',   value:wFmt(diff) },
            { label:'Rate',             value:`${wFmt(defObj.kgPerWeek)}/week` },
            { label:'Time to goal',     value:`${weeks} weeks (${months} months)` },
            { label:'Target date',      value:targetDateStr },
            { label:'Total deficit',    value:`${totalKcalDeficit.toLocaleString()} kcal` },
          ]}/>
          <AIHintCard hint={hint}/>
        </>}
      />

      {/* weekly projection */}
      <Sec title="Week-by-week progress projection" sub={`At ${defObj.kgPerWeek}kg/week — ${defObj.label.toLowerCase()} deficit`}>
        <p style={{ fontSize:12, color:'var(--text-2)', lineHeight:1.7, marginBottom:14, fontFamily:"'DM Sans',sans-serif" }}>
          Each week your TDEE decreases slightly as your body weight drops — meaning the same calorie intake creates a progressively smaller deficit. Recalculate every 4 weeks to stay on track.
        </p>
        <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
          {[1,2,4,8,12,Math.round(weeks)].filter((v,i,a)=>a.indexOf(v)===i).slice(0,6).map((w,i) => {
            const lost  = clamp(defObj.kgPerWeek*w, 0, diff)
            const curr  = wKgVal - lost
            const pct   = (lost/diff)*100
            return (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 12px', borderRadius:8, background:'var(--bg-raised)', border:'0.5px solid var(--border)' }}>
                <div style={{ width:60, fontSize:11, fontWeight:600, color:'var(--text)', flexShrink:0 }}>Week {w}</div>
                <div style={{ flex:1, height:5, background:'var(--border)', borderRadius:3 }}>
                  <div style={{ height:'100%', width:`${Math.min(pct,100)}%`, background:defObj.color, borderRadius:3, transition:'width .4s' }}/>
                </div>
                <div style={{ fontSize:11, fontWeight:700, color:defObj.color, minWidth:80, textAlign:'right' }}>
                  {wFmt(curr)} (−{wFmt(lost)})
                </div>
              </div>
            )
          })}
        </div>
      </Sec>

      {/* deficit comparison */}
      <Sec title="Choosing the right deficit size" sub="Comparing all 4 approaches for your goal">
        <p style={{ fontSize:12, color:'var(--text-2)', lineHeight:1.7, marginBottom:14, fontFamily:"'DM Sans',sans-serif" }}>
          There is no single best deficit — it depends on how fast you want to lose vs how much muscle you can afford to risk. Here's how each approach plays out for your {wFmt(diff)} goal.
        </p>
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {DEFICIT_LEVELS.map((d,i) => {
            const wks = Math.ceil(diff/d.kgPerWeek)
            const mths= (wks/4.33).toFixed(1)
            const kcalTarget = Math.round(tdee-d.kcal)
            return (
              <div key={i} style={{ padding:'12px 14px', borderRadius:10, background: deficitKey===d.key?d.color+'12':'var(--bg-raised)', border:`${deficitKey===d.key?'1.5':'0.5'}px solid ${deficitKey===d.key?d.color:'var(--border)'}` }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:d.color }}>{d.label} — {d.kcal} kcal/day deficit</div>
                  <div style={{ fontSize:11, fontWeight:600, color:d.color }}>{mths} months</div>
                </div>
                <div style={{ display:'flex', gap:16, fontSize:11, color:'var(--text-2)' }}>
                  <span>Eat {kcalTarget.toLocaleString()} kcal/day</span>
                  <span>Lose {wFmt(d.kgPerWeek)}/week</span>
                  <span>{wks} weeks total</span>
                </div>
              </div>
            )
          })}
        </div>
      </Sec>

      {/* formula */}
      <Sec title="The science behind the numbers" sub="Calorie deficit formulas">
        <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:14 }}>
          {[
            { label:'TDEE',                formula:'TDEE = BMR (Mifflin-St Jeor) × activity factor' },
            { label:'Daily calorie target', formula:'Target = TDEE − deficit (kcal/day)' },
            { label:'Fat loss rate',        formula:'Fat loss (kg/week) = deficit (kcal/day) × 7 ÷ 7,700' },
            { label:'Weeks to goal',        formula:'Weeks = weight to lose (kg) ÷ rate (kg/week)' },
          ].map(f=>(
            <div key={f.label}>
              <div style={{ fontSize:10, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.05em', marginBottom:4 }}>{f.label}</div>
              <div style={{ background:'var(--bg-raised)', borderRadius:8, padding:'10px 14px', fontFamily:'monospace', fontSize:11, color:catColor, fontWeight:600, overflowX:'auto', whiteSpace:'nowrap' }}>{f.formula}</div>
            </div>
          ))}
        </div>
        <p style={{ fontSize:12, color:'var(--text-2)', lineHeight:1.75, margin:0, fontFamily:"'DM Sans',sans-serif" }}>The 7,700 kcal/kg rule (1 lb ≈ 3,500 kcal) is an approximation. Real fat loss varies with water retention, muscle loss (which slows deficit), and metabolic adaptation. The projection assumes a constant rate — actual results improve with resistance training and consistent protein intake.</p>
      </Sec>

      {/* examples */}
      <Sec title="Real world examples" sub="Click any to prefill">
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
          {EXAMPLES.map((ex,i)=>{
            const bmr2 = ex.sex==='male' ? 10*ex.wKg+6.25*ex.hCm-5*ex.age+5 : 10*ex.wKg+6.25*ex.hCm-5*ex.age-161
            const tdee2= bmr2*(ACTIVITY.find(a=>a.key===ex.activity)?.factor||1.55)
            const def2 = DEFICIT_LEVELS.find(d=>d.key===ex.deficit)||DEFICIT_LEVELS[1]
            const diff2= clamp(ex.wKg-ex.targetWKg,0.5,200)
            const wks2 = Math.ceil(diff2/def2.kgPerWeek)
            return (
              <button key={i} onClick={()=>applyExample(ex)} style={{ padding:14, borderRadius:10, border:'1.5px solid var(--border)', background:'var(--bg-raised)', cursor:'pointer', textAlign:'left', transition:'all .15s' }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=catColor;e.currentTarget.style.background=catColor+'10'}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.background='var(--bg-raised)'}}>
                <div style={{ fontSize:13, fontWeight:700, color:'var(--text)', marginBottom:2 }}>{ex.title}</div>
                <div style={{ fontSize:11, color:'var(--text-3)', marginBottom:9, lineHeight:1.4 }}>{ex.desc}</div>
                {[['To lose',fmtKg(diff2)],['Rate',`${fmtKg(def2.kgPerWeek)}/wk`],['Timeline',`${wks2} weeks`]].map(([k,v])=>(
                  <div key={k} style={{ display:'flex', justifyContent:'space-between' }}>
                    <span style={{ fontSize:10, color:'var(--text-3)' }}>{k}</span>
                    <span style={{ fontSize:10, fontWeight:600, color:def2.color }}>{v}</span>
                  </div>
                ))}
                <div style={{ marginTop:8, display:'flex', alignItems:'center' }}>
                  <span style={{ fontSize:9, fontWeight:700, background:def2.color+'18', color:def2.color, padding:'2px 8px', borderRadius:10 }}>{def2.label}</span>
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

      <HealthJourneyNext catColor={catColor} intro="Your deficit is set. Now use these calculators to plan the next steps of your weight loss journey." items={JOURNEY_ITEMS}/>

      <Sec title="Frequently asked questions" sub="Everything about calorie deficits">
        {FAQ.map((f,i)=>(<Acc key={i} q={f.q} a={f.a} open={openFaq===i} onToggle={()=>setOpenFaq(openFaq===i?null:i)} catColor={catColor}/>))}
      </Sec>
    </div>
  )
}
