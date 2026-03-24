import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'
import HealthJourneyNext from '../../components/health/HealthJourneyNext'

const clamp = (v,a,b) => Math.min(b,Math.max(a,v))
const fmtKg = n => `${(Math.round(n*10)/10).toFixed(1)} kg`
const fmtLbs= n => `${(Math.round(n*2.20462*10)/10).toFixed(1)} lbs`

const ACTIVITY=[
  {key:'sed',   label:'Sedentary',         factor:1.2   },
  {key:'light', label:'Lightly active',    factor:1.375 },
  {key:'mod',   label:'Moderately active', factor:1.55  },
  {key:'high',  label:'Very active',       factor:1.725 },
  {key:'xhigh', label:'Athlete',           factor:1.9   },
]

const GLOSSARY=[
  {term:'Weight Loss Timeline', def:'A projection of how long it will take to reach a target weight based on a daily calorie deficit and the 7,700 kcal/kg rule.'},
  {term:'Plateau',              def:'A period where weight loss stalls despite adherence to a deficit. Usually caused by metabolic adaptation, water retention, or measurement error. Recalculate every 4 weeks.'},
  {term:'Safe Rate',            def:'0.5–1.0 kg/week is considered safe and sustainable. Faster loss risks muscle wasting, nutrient deficiency, and metabolic damage.'},
  {term:'Non-linear Loss',      def:'Weight rarely drops in a straight line. Expect fluctuations of ±1–2 kg from water, glycogen, and hormones. Judge progress over 2–4 week trends.'},
  {term:'Refeeds',              def:'Planned days eating at or above maintenance during a deficit. Temporarily raises leptin, reduces cortisol, and improves training performance.'},
]

const FAQ=[
  {q:'Why isn\'t my weight loss linear?',
   a:'Weight fluctuates daily by 1–3 kg due to water retention (carbs, salt, hormones), gut contents, and inflammation. True fat loss is consistent but masked by these fluctuations. Weigh yourself daily at the same time and plot a 7-day average — this removes noise and shows the real trend.'},
  {q:'What if I stop losing weight before my goal?',
   a:'As you lose weight, your TDEE decreases — meaning the same calorie intake produces a smaller and smaller deficit. Recalculate your TDEE every 4 weeks and adjust your calorie target downward. Alternatively, increase activity. A 1–2 week diet break (eating at maintenance) before recalculating also helps counter metabolic adaptation.'},
  {q:'How do I stay motivated on a long timeline?',
   a:'Break your goal into 4-week checkpoints. Celebrate non-scale victories (clothes fitting, energy, strength). Progress photos every 4 weeks are more motivating than daily weighing. Focus on the process (hitting protein, training, sleep) rather than the scale number.'},
  {q:'Is it safe to try to lose weight faster?',
   a:'Deficits above 750–1000 kcal/day significantly increase muscle loss, reduce training performance, disrupt hormones (testosterone, oestrogen, thyroid), and have poor adherence rates. A "fast" approach that loses both fat and muscle leaves you lighter but not healthier. Moderate deficit + protein + resistance training is always superior.'},
]

const EXAMPLES=[
  {title:'Steady Female', desc:'68kg → 60kg, moderate pace', wKg:68,tWKg:60,sex:'female',hCm:165,age:30,activity:'light',deficit:500},
  {title:'Active Male',   desc:'90kg → 78kg, gym-goer',      wKg:90,tWKg:78,sex:'male',  hCm:180,age:28,activity:'mod',  deficit:500},
  {title:'Slow & Steady', desc:'80kg → 72kg, mild deficit',  wKg:80,tWKg:72,sex:'male',  hCm:175,age:35,activity:'sed',  deficit:300},
]

const JOURNEY_ITEMS=[
  {title:'Calorie Deficit',    sub:'Set the right deficit for your pace',      icon:'📉', path:'/health/calories/calorie-deficit'       },
  {title:'Macro Calculator',   sub:'What to eat during your cut',              icon:'🥗', path:'/health/calories/macro-calculator'       },
  {title:'BMI Calculator',     sub:'Track your BMI as you lose weight',        icon:'⚖️', path:'/health/body-metrics/bmi-calculator'     },
]

function Sec({title,sub,children}){return(<div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,overflow:'hidden'}}><div style={{padding:'13px 18px',borderBottom:'0.5px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center'}}><span style={{fontSize:13,fontWeight:700,color:'var(--text)',fontFamily:"'Space Grotesk',sans-serif"}}>{title}</span>{sub&&<span style={{fontSize:11,color:'var(--text-3)'}}>{sub}</span>}</div><div style={{padding:'16px 18px'}}>{children}</div></div>)}
function Acc({q,a,open,onToggle,catColor}){return(<div style={{borderBottom:'0.5px solid var(--border)'}}><button onClick={onToggle} style={{width:'100%',display:'flex',justifyContent:'space-between',alignItems:'center',padding:'13px 0',background:'none',border:'none',cursor:'pointer',gap:12,textAlign:'left'}}><span style={{fontSize:13,fontWeight:600,color:'var(--text)',fontFamily:"'DM Sans',sans-serif",lineHeight:1.4}}>{q}</span><span style={{fontSize:18,color:catColor,flexShrink:0,transition:'transform .2s',display:'inline-block',transform:open?'rotate(45deg)':'none'}}>+</span></button>{open&&<p style={{fontSize:12.5,color:'var(--text-2)',lineHeight:1.75,margin:'0 0 13px',fontFamily:"'DM Sans',sans-serif"}}>{a}</p>}</div>)}
function GlsTerm({term,def,catColor}){const[open,setOpen]=useState(false);return(<div onClick={()=>setOpen(o=>!o)} style={{padding:'9px 12px',borderRadius:8,cursor:'pointer',transition:'all .15s',border:`1px solid ${open?catColor+'40':'var(--border)'}`,background:open?catColor+'10':'var(--bg-raised)'}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:8}}><span style={{fontSize:12,fontWeight:700,fontFamily:"'Space Grotesk',sans-serif",color:open?catColor:'var(--text)'}}>{term}</span><span style={{fontSize:14,color:catColor,flexShrink:0}}>{open?'−':'+'}</span></div>{open&&<p style={{fontSize:11.5,color:'var(--text-2)',lineHeight:1.65,margin:'6px 0 0',fontFamily:"'DM Sans',sans-serif"}}>{def}</p>}</div>)}
function Stepper({label,hint,value,onChange,min,max,step=1,unit,catColor}){const[editing,setEditing]=useState(false);const commit=r=>{const n=parseFloat(r);onChange(clamp(isNaN(n)?value:n,min,max));setEditing(false)};const btn={width:38,height:'100%',border:'none',background:'var(--bg-raised)',color:'var(--text)',fontSize:20,fontWeight:300,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontFamily:'inherit',transition:'background .1s'};return(<div style={{marginBottom:16}}><div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}><label style={{fontSize:12.5,fontWeight:600,color:'var(--text)',fontFamily:"'DM Sans',sans-serif"}}>{label}</label>{hint&&<span style={{fontSize:10,color:'var(--text-3)'}}>{hint}</span>}</div><div style={{display:'flex',alignItems:'stretch',height:40,border:`1.5px solid ${editing?catColor:'var(--border-2)'}`,borderRadius:9,overflow:'hidden',background:'var(--bg-card)',transition:'border-color .15s'}}><button onMouseDown={e=>{e.preventDefault();onChange(clamp(value-step,min,max))}} style={{...btn,borderRight:'1px solid var(--border)'}} onMouseEnter={e=>e.currentTarget.style.background=catColor+'18'} onMouseLeave={e=>e.currentTarget.style.background='var(--bg-raised)'}>−</button><div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',gap:5}}>{editing?<input type="number" defaultValue={value} onBlur={e=>commit(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')commit(e.target.value);if(e.key==='Escape')setEditing(false)}} style={{width:'55%',border:'none',background:'transparent',textAlign:'center',fontSize:15,fontWeight:700,color:'var(--text)',outline:'none',fontFamily:"'DM Sans',sans-serif"}} autoFocus/>:<span onClick={()=>setEditing(true)} style={{fontSize:15,fontWeight:700,color:'var(--text)',cursor:'text',minWidth:36,textAlign:'center',fontFamily:"'DM Sans',sans-serif"}}>{value}</span>}<span style={{fontSize:11,color:'var(--text-3)',fontWeight:500}}>{unit}</span></div><button onMouseDown={e=>{e.preventDefault();onChange(clamp(value+step,min,max))}} style={{...btn,borderLeft:'1px solid var(--border)'}} onMouseEnter={e=>e.currentTarget.style.background=catColor+'18'} onMouseLeave={e=>e.currentTarget.style.background='var(--bg-raised)'}>+</button></div></div>)}
function IconCardGroup({label,options,value,onChange,catColor}){return(<div style={{marginBottom:18}}><div style={{fontSize:12,fontWeight:600,color:'var(--text-2)',marginBottom:8,fontFamily:"'DM Sans',sans-serif"}}>{label}</div><div style={{display:'flex',gap:8}}>{options.map(opt=>{const active=value===opt.value;return(<button key={opt.value} onClick={()=>onChange(opt.value)} style={{flex:1,padding:'12px 8px',borderRadius:10,cursor:'pointer',border:`1.5px solid ${active?catColor:'var(--border-2)'}`,background:active?catColor+'12':'var(--bg-raised)',display:'flex',flexDirection:'column',alignItems:'center',gap:6,transition:'all .18s',fontFamily:"'DM Sans',sans-serif"}}><div style={{width:28,height:28,display:'flex',alignItems:'center',justifyContent:'center'}}><svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke={active?catColor:'var(--text-3)'} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{opt.icon}</svg></div><span style={{fontSize:12,fontWeight:active?700:500,color:active?catColor:'var(--text-2)',lineHeight:1.2,textAlign:'center'}}>{opt.label}</span></button>)})}</div></div>)}

/* ── CONCEPT A: Health Score Card ── */
function HealthScoreCard({title,score,grade,gradeColor,gradeSoft,factors,catColor}){
  const R=42,C=54,circ=2*Math.PI*R,fill=circ*(clamp(score,0,100)/100)
  const ringColor=score>=80?'#10b981':score>=60?'#3b82f6':score>=40?'#f59e0b':'#ef4444'
  return(
    <div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,overflow:'hidden',marginBottom:14}}>
      <div style={{padding:'11px 16px',borderBottom:'0.5px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <span style={{fontSize:12,fontWeight:700,color:'var(--text)',fontFamily:"'Space Grotesk',sans-serif"}}>{title}</span>
        <span style={{fontSize:10,color:'var(--text-3)'}}>Updates live</span>
      </div>
      <div style={{padding:'16px 18px'}}>
        <div style={{display:'flex',gap:18,alignItems:'center',marginBottom:16}}>
          <svg viewBox="0 0 108 108" width="96" height="96" style={{flexShrink:0}}>
            <circle cx={C} cy={C} r={R} fill="none" stroke="var(--border)" strokeWidth="11"/>
            <circle cx={C} cy={C} r={R} fill="none" stroke={ringColor} strokeWidth="11" strokeLinecap="round" strokeDasharray={`${fill} ${circ}`} strokeDashoffset={circ/4} transform={`rotate(-90 ${C} ${C})`} style={{transition:'stroke-dasharray .6s ease,stroke .3s'}}/>
            <text x={C} y={C-6} textAnchor="middle" fontSize="22" fontWeight="700" fill="var(--text)" fontFamily="inherit">{Math.round(score)}</text>
            <text x={C} y={C+10} textAnchor="middle" fontSize="9" fill="var(--text-3)" fontFamily="inherit">/ 100</text>
          </svg>
          <div>
            <div style={{display:'inline-flex',alignItems:'center',gap:6,padding:'5px 12px 5px 8px',borderRadius:20,background:gradeSoft,border:`1px solid ${gradeColor}35`,marginBottom:8}}>
              <div style={{width:8,height:8,borderRadius:'50%',background:gradeColor}}/>
              <span style={{fontSize:12,fontWeight:700,color:gradeColor,fontFamily:"'DM Sans',sans-serif"}}>{grade}</span>
            </div>
            <div style={{fontSize:11,color:'var(--text-3)',lineHeight:1.5,fontFamily:"'DM Sans',sans-serif"}}>Goal progress score based on timeline, deficit safety, and loss rate.</div>
          </div>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {factors.map((f,i)=>(
            <div key={i}>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:11,marginBottom:4}}>
                <span style={{color:'var(--text-2)',fontWeight:500}}>{f.label}</span>
                <span style={{fontWeight:700,color:f.color}}>{f.value}</span>
              </div>
              <div style={{height:6,background:'var(--border)',borderRadius:3,overflow:'hidden'}}>
                <div style={{height:'100%',width:`${clamp(f.score,0,100)}%`,background:f.color,borderRadius:3,transition:'width .5s ease'}}/>
              </div>
              <div style={{fontSize:10,color:'var(--text-3)',marginTop:2}}>{f.note}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{margin:'0 18px 16px',padding:'10px 13px',background:gradeSoft,borderRadius:10,border:`1px solid ${gradeColor}30`}}>
        <p style={{fontSize:11.5,color:'var(--text-2)',margin:0,lineHeight:1.65,fontFamily:"'DM Sans',sans-serif"}}>
          {score>=80?'Excellent plan — sustainable pace with realistic timeline. Stay consistent.':score>=60?'Good approach. Consider increasing protein to protect muscle during the cut.':score>=40?'Moderate plan. A slightly slower pace would improve muscle retention significantly.':'Very aggressive timeline. High risk of muscle loss and burnout. Consider extending by 4–8 weeks.'}
        </p>
      </div>
    </div>
  )
}

const UNIT_OPTIONS=[
  {value:'metric',label:'Metric',sub:'cm · kg',icon:<><rect x="3" y="2" width="16" height="18" rx="2.5"/><line x1="7" y1="7.5" x2="15" y2="7.5"/><line x1="7" y1="11" x2="15" y2="11"/><line x1="7" y1="14.5" x2="12" y2="14.5"/></>},
  {value:'imperial',label:'Imperial',sub:'ft · lbs',icon:<><rect x="3" y="2" width="16" height="18" rx="2.5"/><line x1="7" y1="7.5" x2="15" y2="7.5"/><line x1="7" y1="11" x2="15" y2="11"/><line x1="7" y1="14.5" x2="12" y2="14.5"/></>},
]
const SEX_OPTIONS=[
  {value:'male',label:'Male',icon:<><circle cx="11" cy="9" r="5"/><line x1="11" y1="14" x2="11" y2="20"/><line x1="8" y1="17" x2="14" y2="17"/></>},
  {value:'female',label:'Female',icon:<><circle cx="11" cy="8.5" r="5"/><line x1="11" y1="13.5" x2="11" y2="20"/><line x1="8" y1="17" x2="14" y2="17"/></>},
]

export default function WeightLossTimelineCalculator({meta,category}){
  const catColor=category?.color||'#3b82f6'
  const[unit,setUnit]=useState('metric')
  const[hCm,setHCm]=useState(170)
  const[hFt,setHFt]=useState(5)
  const[hIn,setHIn]=useState(7)
  const[wKg,setWKg]=useState(80)
  const[wLbs,setWLbs]=useState(176)
  const[tWKg,setTWKg]=useState(70)
  const[tWLbs,setTWLbs]=useState(154)
  const[age,setAge]=useState(30)
  const[sex,setSex]=useState('male')
  const[activityKey,setActivityKey]=useState('mod')
  const[deficit,setDeficit]=useState(500)
  const[openFaq,setOpenFaq]=useState(null)

  function handleUnit(u){
    if(u===unit)return
    if(u==='imperial'){const ti=Math.round(hCm/2.54);setHFt(Math.floor(ti/12));setHIn(ti%12);setWLbs(Math.round(wKg*2.20462));setTWLbs(Math.round(tWKg*2.20462))}
    else{setHCm(clamp(Math.round((hFt*12+hIn)*2.54),100,250));setWKg(clamp(Math.round(wLbs/2.20462),20,300));setTWKg(clamp(Math.round(tWLbs/2.20462),20,300))}
    setUnit(u)
  }
  function applyExample(ex){setHCm(ex.hCm);setWKg(ex.wKg);setTWKg(ex.tWKg);setAge(ex.age);setSex(ex.sex);setActivityKey(ex.activity);setDeficit(ex.deficit);const ti=Math.round(ex.hCm/2.54);setHFt(Math.floor(ti/12));setHIn(ti%12);setWLbs(Math.round(ex.wKg*2.20462));setTWLbs(Math.round(ex.tWKg*2.20462));setUnit('metric')}

  const isM    = unit==='metric'
  const hM     = isM ? hCm/100 : (hFt*12+hIn)*0.0254
  const wKgVal = isM ? wKg : wLbs/2.20462
  const tKgVal = isM ? tWKg : tWLbs/2.20462
  const hCmVal = hM*100
  const wFmt   = kg => isM ? fmtKg(kg) : fmtLbs(kg)
  const diff   = clamp(wKgVal-tKgVal,0.5,200)
  const bmr    = sex==='male' ? 10*wKgVal+6.25*hCmVal-5*age+5 : 10*wKgVal+6.25*hCmVal-5*age-161
  const tdee   = bmr*(ACTIVITY.find(a=>a.key===activityKey)?.factor||1.55)
  const kgPerWeek = deficit/7700*7
  const weeks  = Math.ceil(diff/kgPerWeek)
  const months = (weeks/4.33).toFixed(1)
  const targetDate = new Date(); targetDate.setDate(targetDate.getDate()+weeks*7)
  const dateStr= targetDate.toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})
  const dailyKcal = Math.round(tdee-deficit)

  // score components
  const rateScore  = clamp(100-(Math.max(0,kgPerWeek-0.75)*60),0,100)
  const defScore   = clamp(100-((deficit-300)/700)*60,0,100)
  const timeScore  = clamp(100-Math.max(0,(weeks-26)*2),0,100)
  const overallScore = Math.round(rateScore*0.4+defScore*0.35+timeScore*0.25)
  const grade = overallScore>=80?'Excellent':overallScore>=65?'Good':overallScore>=50?'Moderate':'Aggressive'
  const gradeColor = overallScore>=80?'#10b981':overallScore>=65?'#3b82f6':overallScore>=50?'#f59e0b':'#ef4444'
  const gradeSoft  = overallScore>=80?'#d1fae5':overallScore>=65?'#dbeafe':overallScore>=50?'#fef3c7':'#fee2e2'

  const factors=[
    {label:'Loss rate',     value:`${kgPerWeek.toFixed(2)} kg/week`, score:rateScore,  color:rateScore>=70?'#10b981':rateScore>=50?'#f59e0b':'#ef4444', note:'0.5–0.75 kg/week is optimal for muscle preservation'},
    {label:'Deficit size',  value:`${deficit} kcal/day`,             score:defScore,   color:defScore>=70?'#3b82f6':defScore>=50?'#f59e0b':'#ef4444',   note:'300–500 kcal ideal; above 750 increases muscle loss risk'},
    {label:'Timeline score',value:`${weeks} weeks`,                  score:timeScore,  color:timeScore>=70?'#22a355':timeScore>=40?'#f59e0b':'#ef4444', note:'Shorter timelines = higher risk. Allow time for sustainable loss.'},
  ]

  const hint = `Lose ${wFmt(diff)} in ${weeks} weeks (${months} months) at ${kgPerWeek.toFixed(2)} kg/week. Eat ${dailyKcal.toLocaleString()} kcal/day. Target date: ${dateStr}. Plan score: ${overallScore}/100 — ${grade}.`

  return(
    <div style={{display:'flex',flexDirection:'column',gap:20}}>
      <CalcShell
        left={<>
          <IconCardGroup label="Unit system" options={UNIT_OPTIONS} value={unit} onChange={handleUnit} catColor={catColor}/>
          <div style={{borderTop:'0.5px solid var(--border)',paddingTop:16}}>
            <div style={{fontSize:10,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:14}}>Measurements</div>
            {isM?<Stepper label="Height" value={hCm} onChange={setHCm} min={100} max={250} unit="cm" catColor={catColor}/>
              :<div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}><Stepper label="Feet" value={hFt} onChange={setHFt} min={3} max={7} unit="ft" catColor={catColor}/><Stepper label="Inches" value={hIn} onChange={setHIn} min={0} max={11} unit="in" catColor={catColor}/></div>}
            {isM?<Stepper label="Current weight" value={wKg} onChange={setWKg} min={30} max={300} unit="kg" catColor={catColor}/>
              :<Stepper label="Current weight" value={wLbs} onChange={setWLbs} min={66} max={660} unit="lbs" catColor={catColor}/>}
            {isM?<Stepper label="Target weight" value={tWKg} onChange={setTWKg} min={30} max={300} unit="kg" hint="Your goal weight" catColor={catColor}/>
              :<Stepper label="Target weight" value={tWLbs} onChange={setTWLbs} min={66} max={660} unit="lbs" hint="Your goal weight" catColor={catColor}/>}
            <Stepper label="Age" value={age} onChange={setAge} min={10} max={100} unit="yrs" catColor={catColor}/>
          </div>
          <div style={{borderTop:'0.5px solid var(--border)',paddingTop:16,marginTop:4}}>
            <IconCardGroup label="Biological sex" options={SEX_OPTIONS} value={sex} onChange={setSex} catColor={catColor}/>
          </div>
          <div style={{borderTop:'0.5px solid var(--border)',paddingTop:16,marginTop:4}}>
            <div style={{fontSize:12,fontWeight:600,color:'var(--text-2)',marginBottom:8,fontFamily:"'DM Sans',sans-serif"}}>Activity level</div>
            <div style={{display:'flex',flexDirection:'column',gap:5}}>
              {ACTIVITY.map(a=>(<button key={a.key} onClick={()=>setActivityKey(a.key)} style={{display:'flex',justifyContent:'space-between',padding:'8px 12px',borderRadius:8,border:`1.5px solid ${activityKey===a.key?catColor:'var(--border-2)'}`,background:activityKey===a.key?catColor+'12':'var(--bg-raised)',cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}}><span style={{fontSize:12,fontWeight:600,color:activityKey===a.key?catColor:'var(--text)'}}>{a.label}</span><span style={{fontSize:10,color:'var(--text-3)'}}>×{a.factor}</span></button>))}
            </div>
          </div>
          <div style={{borderTop:'0.5px solid var(--border)',paddingTop:16,marginTop:12}}>
            <Stepper label="Daily calorie deficit" value={deficit} onChange={setDeficit} min={100} max={1200} step={50} unit="kcal" hint={`${dailyKcal.toLocaleString()} kcal/day`} catColor={catColor}/>
            <div style={{display:'flex',gap:3,height:5,borderRadius:3,overflow:'hidden',marginTop:-8,marginBottom:4}}>
              <div style={{flex:2,background:'#22a355',borderRadius:2,opacity:deficit<=400?1:0.3}}/>
              <div style={{flex:3,background:'#3b82f6',borderRadius:2,opacity:deficit>400&&deficit<=700?1:0.3}}/>
              <div style={{flex:2,background:'#f59e0b',borderRadius:2,opacity:deficit>700&&deficit<=900?1:0.3}}/>
              <div style={{flex:2,background:'#ef4444',borderRadius:2,opacity:deficit>900?1:0.3}}/>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:9,color:'var(--text-3)'}}>
              <span>Mild</span><span>Moderate</span><span>Aggressive</span><span>Extreme</span>
            </div>
          </div>
        </>}
        right={<>
          <HealthScoreCard title="Plan Score" score={overallScore} grade={grade} gradeColor={gradeColor} gradeSoft={gradeSoft} factors={factors} catColor={catColor}/>
          <BreakdownTable title="Timeline Summary" rows={[
            {label:'Weight to lose',   value:wFmt(diff),                             bold:true,highlight:true,color:catColor},
            {label:'Rate',             value:`${kgPerWeek.toFixed(2)} kg/week`},
            {label:'Total weeks',      value:`${weeks} weeks`,                        color:catColor},
            {label:'Total months',     value:`${months} months`},
            {label:'Target date',      value:dateStr,                                 color:catColor},
            {label:'Daily calories',   value:`${dailyKcal.toLocaleString()} kcal`},
            {label:'TDEE',             value:`${Math.round(tdee).toLocaleString()} kcal`},
            {label:'Plan score',       value:`${overallScore}/100 — ${grade}`,        color:gradeColor},
          ]}/>
          <AIHintCard hint={hint}/>
        </>}
      />

      {/* visual timeline */}
      <Sec title="Your weight loss journey" sub="Month-by-month projection">
        <p style={{fontSize:12,color:'var(--text-2)',lineHeight:1.7,marginBottom:14,fontFamily:"'DM Sans',sans-serif"}}>
          Week-by-week projection at {kgPerWeek.toFixed(2)} kg/week. Real results will fluctuate — this shows the trend line.
        </p>
        <div style={{display:'flex',flexDirection:'column',gap:5}}>
          {Array.from({length:Math.min(Math.ceil(weeks/4),12)},(_,i)=>{
            const w=(i+1)*4
            const lost=clamp(kgPerWeek*w,0,diff)
            const curr=wKgVal-lost
            const pct=(lost/diff)*100
            const d=new Date(); d.setDate(d.getDate()+w*7)
            return(
              <div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 12px',borderRadius:8,background:'var(--bg-raised)',border:'0.5px solid var(--border)'}}>
                <div style={{width:70,fontSize:11,fontWeight:600,color:'var(--text)',flexShrink:0}}>
                  {d.toLocaleDateString('en-GB',{month:'short',year:'2-digit'})}
                </div>
                <div style={{flex:1,height:5,background:'var(--border)',borderRadius:3}}>
                  <div style={{height:'100%',width:`${Math.min(pct,100)}%`,background:catColor,borderRadius:3,transition:'width .4s'}}/>
                </div>
                <div style={{fontSize:11,fontWeight:700,color:catColor,minWidth:90,textAlign:'right'}}>
                  {wFmt(curr)} (−{wFmt(lost)})
                </div>
                {pct>=100&&<div style={{fontSize:9,fontWeight:700,background:'#d1fae5',color:'#065f46',padding:'2px 6px',borderRadius:6}}>GOAL</div>}
              </div>
            )
          })}
        </div>
        {weeks>48&&<p style={{fontSize:11,color:'var(--text-3)',marginTop:8,fontFamily:"'DM Sans',sans-serif"}}>Timeline exceeds 12 months — consider increasing activity or accepting a slightly faster deficit.</p>}
      </Sec>

      {/* milestone checkpoints */}
      <Sec title="Key milestones" sub="Motivational checkpoints along the way">
        <p style={{fontSize:12,color:'var(--text-2)',lineHeight:1.7,marginBottom:14,fontFamily:"'DM Sans',sans-serif"}}>Breaking your goal into checkpoints makes long timelines feel manageable. Celebrate each one.</p>
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:8}}>
          {[0.25,0.5,0.75,1.0].map((frac,i)=>{
            const kgLost=diff*frac
            const wAt=wKgVal-kgLost
            const wksAt=Math.round(kgLost/kgPerWeek)
            const d=new Date(); d.setDate(d.getDate()+wksAt*7)
            const colors=['#0ea5e9','#22a355','#f59e0b',catColor]
            return(
              <div key={i} style={{padding:'12px 14px',borderRadius:10,background:colors[i]+'12',border:`1px solid ${colors[i]}30`}}>
                <div style={{fontSize:10,fontWeight:700,color:colors[i],marginBottom:3}}>{Math.round(frac*100)}% of goal</div>
                <div style={{fontSize:16,fontWeight:700,color:'var(--text)',fontFamily:"'Space Grotesk',sans-serif",marginBottom:2}}>{wFmt(wAt)}</div>
                <div style={{fontSize:10,color:'var(--text-3)'}}>{d.toLocaleDateString('en-GB',{month:'short',year:'numeric'})} · week {wksAt}</div>
                <div style={{fontSize:11,color:colors[i],marginTop:4,fontWeight:500}}>Lost {wFmt(kgLost)}</div>
              </div>
            )
          })}
        </div>
      </Sec>

      <Sec title="Key terms explained" sub="Click any term to expand">
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:8}}>
          {GLOSSARY.map((g,i)=><GlsTerm key={i} term={g.term} def={g.def} catColor={catColor}/>)}
        </div>
      </Sec>

      <HealthJourneyNext catColor={catColor} intro="Timeline is set — now make sure you have the right tools to execute it." items={JOURNEY_ITEMS}/>

      <Sec title="Frequently asked questions" sub="Everything about weight loss timelines">
        {FAQ.map((f,i)=>(<Acc key={i} q={f.q} a={f.a} open={openFaq===i} onToggle={()=>setOpenFaq(openFaq===i?null:i)} catColor={catColor}/>))}
      </Sec>
    </div>
  )
}
