import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'
import HealthJourneyNext from '../../components/health/HealthJourneyNext'

const clamp = (v,a,b) => Math.min(b,Math.max(a,v))

const ACTIVITY = [
  { key:'sed',   label:'Sedentary',          sub:'Desk job, little/no exercise',    factor:1.2,   desc:'Office worker, drives everywhere, no gym.' },
  { key:'light', label:'Lightly active',     sub:'1–3 days/week light exercise',    factor:1.375, desc:'Short walks, yoga 2–3x/week, light housework.' },
  { key:'mod',   label:'Moderately active',  sub:'3–5 days/week moderate exercise', factor:1.55,  desc:'Gym 4x/week, active job or daily brisk walking.' },
  { key:'high',  label:'Very active',        sub:'6–7 days/week hard exercise',     factor:1.725, desc:'Gym daily, physically demanding job, sports.' },
  { key:'xhigh', label:'Athlete',            sub:'Twice daily / elite training',    factor:1.9,   desc:'Professional athlete, twice-daily sessions, competition prep.' },
]

const GLOSSARY = [
  { term:'TDEE',             def:'Total Daily Energy Expenditure — the total calories you burn in a day including BMR, exercise, NEAT, and TEF. The master number for weight management.' },
  { term:'BMR',              def:'Basal Metabolic Rate — calories burned at complete rest. About 60–70% of TDEE for sedentary people.' },
  { term:'NEAT',             def:'Non-Exercise Activity Thermogenesis — calories burned from all non-exercise movement: walking, fidgeting, standing, chores. Highly variable (200–900 kcal/day).' },
  { term:'TEF',              def:'Thermic Effect of Food — energy used digesting and absorbing nutrients. About 8–15% of calories consumed. Protein has the highest TEF (20–30%).' },
  { term:'Activity Factor',  def:'The multiplier applied to BMR to get TDEE. Ranges from 1.2 (sedentary) to 1.9 (elite athlete). Often slightly underestimated by people.' },
  { term:'Mifflin-St Jeor',  def:'Most validated BMR formula (1990). Accurate to ±10% for 82% of the general population. Used as the primary formula here.' },
]

const FAQ = [
  { q:'What is TDEE and why is it the most important number for weight?',
    a:'TDEE is every calorie your body burns in 24 hours — from keeping your organs functioning (BMR), to digesting food (TEF), to all movement including non-exercise activity (NEAT) and planned exercise (EAT). To maintain weight, eat at TDEE. To lose, eat below it. To gain, eat above it. It is more useful than BMR alone because it reflects your actual lifestyle.' },
  { q:'How do I know if I have the right activity level selected?',
    a:'Most people underestimate their activity level. A useful test: weigh yourself consistently for 2 weeks while tracking food accurately with a calorie app. If your weight is stable, your actual calorie intake equals your TDEE. Compare this to the calculator output — if it is significantly lower, you are more sedentary; if higher, more active. Adjust the activity level to match.' },
  { q:'Why does my TDEE change over time?',
    a:'As you lose weight, your BMR decreases (less mass to maintain), your exercise burns fewer calories (lighter body), and metabolic adaptation reduces efficiency. Recalculate every 4–6 weeks during weight loss. TDEE can drop by 200–400 kcal over a significant weight loss journey.' },
  { q:'Is TDEE the same as my calorie goal?',
    a:'Only if your goal is maintenance. To lose fat: eat 300–500 kcal below TDEE. To build muscle: eat 200–300 kcal above TDEE. To recomp (slow simultaneous fat loss + muscle gain): eat at TDEE with high protein (1.8–2.2g/kg) and consistent resistance training.' },
]

const EXAMPLES = [
  { title:'Desk worker',    desc:'35yr female, sedentary',      hCm:165, wKg:68, age:35, sex:'female', activity:'sed'   },
  { title:'Active male',    desc:'28yr male, gym 5x/week',      hCm:180, wKg:82, age:28, sex:'male',   activity:'mod'   },
  { title:'Elite athlete',  desc:'24yr male, twice daily',      hCm:183, wKg:85, age:24, sex:'male',   activity:'xhigh' },
]

const JOURNEY_ITEMS = [
  { title:'Calorie Calculator',   sub:'Set a goal-adjusted calorie target',      icon:'🔥', path:'/health/calories/calorie-calculator'    },
  { title:'Calorie Deficit',      sub:'Calculate your fat loss deficit',          icon:'📉', path:'/health/calories/calorie-deficit'       },
  { title:'Macro Calculator',     sub:'Split TDEE into protein, carbs, fat',      icon:'🥗', path:'/health/calories/macro-calculator'      },
]

function Sec({title,sub,children}){return(<div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,overflow:'hidden'}}><div style={{padding:'13px 18px',borderBottom:'0.5px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center'}}><span style={{fontSize:13,fontWeight:700,color:'var(--text)',fontFamily:"'Space Grotesk',sans-serif"}}>{title}</span>{sub&&<span style={{fontSize:11,color:'var(--text-3)'}}>{sub}</span>}</div><div style={{padding:'16px 18px'}}>{children}</div></div>)}
function Acc({q,a,open,onToggle,catColor}){return(<div style={{borderBottom:'0.5px solid var(--border)'}}><button onClick={onToggle} style={{width:'100%',display:'flex',justifyContent:'space-between',alignItems:'center',padding:'13px 0',background:'none',border:'none',cursor:'pointer',gap:12,textAlign:'left'}}><span style={{fontSize:13,fontWeight:600,color:'var(--text)',fontFamily:"'DM Sans',sans-serif",lineHeight:1.4}}>{q}</span><span style={{fontSize:18,color:catColor,flexShrink:0,transition:'transform .2s',display:'inline-block',transform:open?'rotate(45deg)':'none'}}>+</span></button>{open&&<p style={{fontSize:12.5,color:'var(--text-2)',lineHeight:1.75,margin:'0 0 13px',fontFamily:"'DM Sans',sans-serif"}}>{a}</p>}</div>)}
function GlsTerm({term,def,catColor}){const[open,setOpen]=useState(false);return(<div onClick={()=>setOpen(o=>!o)} style={{padding:'9px 12px',borderRadius:8,cursor:'pointer',transition:'all .15s',border:`1px solid ${open?catColor+'40':'var(--border)'}`,background:open?catColor+'10':'var(--bg-raised)'}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:8}}><span style={{fontSize:12,fontWeight:700,fontFamily:"'Space Grotesk',sans-serif",color:open?catColor:'var(--text)'}}>{term}</span><span style={{fontSize:14,color:catColor,flexShrink:0}}>{open?'−':'+'}</span></div>{open&&<p style={{fontSize:11.5,color:'var(--text-2)',lineHeight:1.65,margin:'6px 0 0',fontFamily:"'DM Sans',sans-serif"}}>{def}</p>}</div>)}
function Stepper({label,hint,value,onChange,min,max,step=1,unit,catColor}){const[editing,setEditing]=useState(false);const commit=r=>{const n=parseFloat(r);onChange(clamp(isNaN(n)?value:n,min,max));setEditing(false)};const btn={width:38,height:'100%',border:'none',background:'var(--bg-raised)',color:'var(--text)',fontSize:20,fontWeight:300,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontFamily:'inherit',transition:'background .1s'};return(<div style={{marginBottom:16}}><div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}><label style={{fontSize:12.5,fontWeight:600,color:'var(--text)',fontFamily:"'DM Sans',sans-serif"}}>{label}</label>{hint&&<span style={{fontSize:10,color:'var(--text-3)'}}>{hint}</span>}</div><div style={{display:'flex',alignItems:'stretch',height:40,border:`1.5px solid ${editing?catColor:'var(--border-2)'}`,borderRadius:9,overflow:'hidden',background:'var(--bg-card)',transition:'border-color .15s'}}><button onMouseDown={e=>{e.preventDefault();onChange(clamp(value-step,min,max))}} style={{...btn,borderRight:'1px solid var(--border)'}} onMouseEnter={e=>e.currentTarget.style.background=catColor+'18'} onMouseLeave={e=>e.currentTarget.style.background='var(--bg-raised)'}>−</button><div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',gap:5}}>{editing?<input type="number" defaultValue={value} onBlur={e=>commit(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')commit(e.target.value);if(e.key==='Escape')setEditing(false)}} style={{width:'55%',border:'none',background:'transparent',textAlign:'center',fontSize:15,fontWeight:700,color:'var(--text)',outline:'none',fontFamily:"'DM Sans',sans-serif"}} autoFocus/>:<span onClick={()=>setEditing(true)} style={{fontSize:15,fontWeight:700,color:'var(--text)',cursor:'text',minWidth:36,textAlign:'center',fontFamily:"'DM Sans',sans-serif"}}>{value}</span>}<span style={{fontSize:11,color:'var(--text-3)',fontWeight:500}}>{unit}</span></div><button onMouseDown={e=>{e.preventDefault();onChange(clamp(value+step,min,max))}} style={{...btn,borderLeft:'1px solid var(--border)'}} onMouseEnter={e=>e.currentTarget.style.background=catColor+'18'} onMouseLeave={e=>e.currentTarget.style.background='var(--bg-raised)'}>+</button></div></div>)}
function IconCardGroup({label,options,value,onChange,catColor}){return(<div style={{marginBottom:18}}><div style={{fontSize:12,fontWeight:600,color:'var(--text-2)',marginBottom:8,fontFamily:"'DM Sans',sans-serif"}}>{label}</div><div style={{display:'flex',gap:8}}>{options.map(opt=>{const active=value===opt.value;return(<button key={opt.value} onClick={()=>onChange(opt.value)} style={{flex:1,padding:'12px 8px',borderRadius:10,cursor:'pointer',border:`1.5px solid ${active?catColor:'var(--border-2)'}`,background:active?catColor+'12':'var(--bg-raised)',display:'flex',flexDirection:'column',alignItems:'center',gap:6,transition:'all .18s',fontFamily:"'DM Sans',sans-serif"}}><div style={{width:28,height:28,display:'flex',alignItems:'center',justifyContent:'center'}}><svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke={active?catColor:'var(--text-3)'} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{opt.icon}</svg></div><span style={{fontSize:12,fontWeight:active?700:500,color:active?catColor:'var(--text-2)',lineHeight:1.2,textAlign:'center'}}>{opt.label}</span>{opt.sub&&<span style={{fontSize:10,color:active?catColor+'cc':'var(--text-3)',lineHeight:1.2,textAlign:'center'}}>{opt.sub}</span>}</button>)})}</div></div>)}

const UNIT_OPTIONS=[{value:'metric',label:'Metric',sub:'cm · kg',icon:<><rect x="3" y="2" width="16" height="18" rx="2.5"/><line x1="7" y1="7.5" x2="15" y2="7.5"/><line x1="7" y1="11" x2="15" y2="11"/><line x1="7" y1="14.5" x2="12" y2="14.5"/></>},{value:'imperial',label:'Imperial',sub:'ft · lbs',icon:<><rect x="3" y="2" width="16" height="18" rx="2.5"/><line x1="7" y1="7.5" x2="15" y2="7.5"/><line x1="7" y1="11" x2="15" y2="11"/><line x1="7" y1="14.5" x2="12" y2="14.5"/></>}]
const SEX_OPTIONS=[{value:'male',label:'Male',icon:<><circle cx="11" cy="9" r="5"/><line x1="11" y1="14" x2="11" y2="20"/><line x1="8" y1="17" x2="14" y2="17"/></>},{value:'female',label:'Female',icon:<><circle cx="11" cy="8.5" r="5"/><line x1="11" y1="13.5" x2="11" y2="20"/><line x1="8" y1="17" x2="14" y2="17"/></>}]

export default function TDEECalculator({ meta, category }) {
  const catColor = category?.color || '#f97316'
  const [unit,setUnit]=useState('metric')
  const [hCm,setHCm]=useState(175); const [hFt,setHFt]=useState(5); const [hIn,setHIn]=useState(9)
  const [wKg,setWKg]=useState(75);  const [wLbs,setWLbs]=useState(165)
  const [age,setAge]=useState(30);  const [sex,setSex]=useState('male')
  const [activityKey,setActivityKey]=useState('mod')
  const [openFaq,setOpenFaq]=useState(null)

  function handleUnit(u){if(u===unit)return;if(u==='imperial'){const ti=Math.round(hCm/2.54);setHFt(Math.floor(ti/12));setHIn(ti%12);setWLbs(Math.round(wKg*2.20462))}else{setHCm(clamp(Math.round((hFt*12+hIn)*2.54),100,250));setWKg(clamp(Math.round(wLbs/2.20462),20,300))};setUnit(u)}
  function applyExample(ex){setHCm(ex.hCm);setWKg(ex.wKg);setAge(ex.age);setSex(ex.sex);setActivityKey(ex.activity);const ti=Math.round(ex.hCm/2.54);setHFt(Math.floor(ti/12));setHIn(ti%12);setWLbs(Math.round(ex.wKg*2.20462));setUnit('metric')}

  const isM=unit==='metric'
  const hM=isM?hCm/100:(hFt*12+hIn)*0.0254; const wKgVal=isM?wKg:wLbs/2.20462; const hCmVal=hM*100
  const bmr=sex==='male'?10*wKgVal+6.25*hCmVal-5*age+5:10*wKgVal+6.25*hCmVal-5*age-161
  const actObj=ACTIVITY.find(a=>a.key===activityKey)||ACTIVITY[2]
  const tdee=Math.round(bmr*actObj.factor)

  // TDEE breakdown
  const bmrPct   = Math.round((bmr/tdee)*100)
  const neatPct  = actObj.key==='sed'?5:actObj.key==='light'?12:actObj.key==='mod'?18:actObj.key==='high'?24:29
  const eatPct   = actObj.key==='sed'?0:actObj.key==='light'?8:actObj.key==='mod'?15:actObj.key==='high'?22:28
  const tefPct   = 10
  const restPct  = 100-bmrPct-neatPct-eatPct-tefPct

  const benchmarks = ACTIVITY.map(a => ({
    label: a.label, value: Math.round(bmr*a.factor),
    note: a.desc,
    color: a.key===activityKey ? catColor : '#94a3b8',
  }))

  const hint = `TDEE: ${tdee.toLocaleString()} kcal/day (${actObj.label}). BMR: ${Math.round(bmr).toLocaleString()} kcal. To maintain weight, eat ${tdee.toLocaleString()} kcal. To lose 0.5kg/week, eat ${(tdee-500).toLocaleString()} kcal.`

  return (
    <div style={{display:'flex',flexDirection:'column',gap:20}}>
      <CalcShell
        left={<>
          <IconCardGroup label="Unit system" options={UNIT_OPTIONS} value={unit} onChange={handleUnit} catColor={catColor}/>
          <div style={{borderTop:'0.5px solid var(--border)',paddingTop:16}}>
            <div style={{fontSize:10,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:14}}>Body measurements</div>
            {isM?<Stepper label="Height" value={hCm} onChange={setHCm} min={100} max={250} unit="cm" catColor={catColor}/>:<div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}><Stepper label="Feet" value={hFt} onChange={setHFt} min={3} max={7} unit="ft" catColor={catColor}/><Stepper label="Inches" value={hIn} onChange={setHIn} min={0} max={11} unit="in" catColor={catColor}/></div>}
            {isM?<Stepper label="Weight" value={wKg} onChange={setWKg} min={20} max={300} unit="kg" catColor={catColor}/>:<Stepper label="Weight" value={wLbs} onChange={setWLbs} min={44} max={660} unit="lbs" catColor={catColor}/>}
            <Stepper label="Age" value={age} onChange={setAge} min={10} max={100} unit="yrs" catColor={catColor}/>
          </div>
          <div style={{borderTop:'0.5px solid var(--border)',paddingTop:16,marginTop:4}}>
            <IconCardGroup label="Biological sex" options={SEX_OPTIONS} value={sex} onChange={setSex} catColor={catColor}/>
          </div>
          <div style={{borderTop:'0.5px solid var(--border)',paddingTop:16,marginTop:4}}>
            <div style={{fontSize:12,fontWeight:600,color:'var(--text-2)',marginBottom:10,fontFamily:"'DM Sans',sans-serif"}}>Activity level</div>
            <div style={{display:'flex',flexDirection:'column',gap:6}}>
              {ACTIVITY.map(a=>(
                <button key={a.key} onClick={()=>setActivityKey(a.key)} style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',padding:'10px 13px',borderRadius:8,border:`1.5px solid ${activityKey===a.key?catColor:'var(--border-2)'}`,background:activityKey===a.key?catColor+'12':'var(--bg-raised)',cursor:'pointer',fontFamily:"'DM Sans',sans-serif",textAlign:'left'}}>
                  <div>
                    <div style={{fontSize:12,fontWeight:700,color:activityKey===a.key?catColor:'var(--text)'}}>{a.label}</div>
                    <div style={{fontSize:10,color:'var(--text-3)'}}>{a.sub}</div>
                  </div>
                  <div style={{textAlign:'right',flexShrink:0,marginLeft:8}}>
                    <div style={{fontSize:11,fontWeight:700,color:activityKey===a.key?catColor:'var(--text-3)'}}>×{a.factor}</div>
                    <div style={{fontSize:9,color:'var(--text-3)'}}>{Math.round(bmr*a.factor).toLocaleString()} kcal</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>}
        right={<>
          {/* Concept C — Comparison Ticker */}
          <div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,overflow:'hidden',marginBottom:14}}>
            <div style={{padding:'11px 16px',borderBottom:'0.5px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <span style={{fontSize:12,fontWeight:700,color:'var(--text)',fontFamily:"'Space Grotesk',sans-serif"}}>TDEE — Your daily burn</span>
              <span style={{fontSize:10,color:'var(--text-3)'}}>Vs all activity levels</span>
            </div>
            <div style={{padding:'16px 18px'}}>
              {/* big number */}
              <div style={{display:'flex',alignItems:'flex-end',gap:12,marginBottom:16}}>
                <div>
                  <div style={{fontSize:52,fontWeight:700,lineHeight:1,color:catColor,fontFamily:"'Space Grotesk',sans-serif",transition:'color .3s'}}>{tdee.toLocaleString()}</div>
                  <div style={{fontSize:11,color:'var(--text-3)',marginTop:3}}>kcal burned per day</div>
                </div>
                <div style={{paddingBottom:6}}>
                  <div style={{display:'inline-flex',alignItems:'center',gap:6,padding:'5px 12px 5px 8px',borderRadius:20,background:catColor+'18',border:`1px solid ${catColor}35`}}>
                    <div style={{width:8,height:8,borderRadius:'50%',background:catColor}}/>
                    <span style={{fontSize:12,fontWeight:700,color:catColor,fontFamily:"'DM Sans',sans-serif"}}>{actObj.label}</span>
                  </div>
                </div>
              </div>
              {/* comparison bars — all activity levels */}
              <div style={{display:'flex',flexDirection:'column',gap:6}}>
                {benchmarks.map((b,i)=>{
                  const isActive=ACTIVITY[i].key===activityKey
                  return(
                    <div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:isActive?'8px 12px':'7px 12px',borderRadius:8,background:isActive?catColor+'12':'var(--bg-raised)',border:`${isActive?'1.5':'0.5'}px solid ${isActive?catColor:'var(--border)'}`}}>
                      <div style={{width:110,flexShrink:0}}>
                        <div style={{fontSize:11,fontWeight:isActive?700:500,color:isActive?catColor:'var(--text)'}}>{b.label}</div>
                        <div style={{fontSize:9,color:'var(--text-3)'}}>×{ACTIVITY[i].factor}</div>
                      </div>
                      <div style={{flex:1,height:isActive?7:5,background:'var(--border)',borderRadius:3}}>
                        <div style={{height:'100%',width:`${(b.value/benchmarks[benchmarks.length-1].value)*100}%`,background:isActive?catColor:catColor+'45',borderRadius:3,transition:'width .4s'}}/>
                      </div>
                      <div style={{fontSize:isActive?13:11,fontWeight:700,color:isActive?catColor:'var(--text-2)',minWidth:55,textAlign:'right'}}>{b.value.toLocaleString()}</div>
                    </div>
                  )
                })}
              </div>
            </div>
            {/* goal targets strip */}
            <div style={{margin:'0 18px 16px',background:'var(--bg-raised)',borderRadius:10,padding:'10px 14px',border:'0.5px solid var(--border)'}}>
              <div style={{fontSize:10,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.05em',marginBottom:8}}>Based on your TDEE of {tdee.toLocaleString()} kcal</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8}}>
                {[{label:'Lose 0.5kg/wk',val:tdee-500,color:'#ef4444'},{label:'Maintain',val:tdee,color:catColor},{label:'Gain 0.5kg/wk',val:tdee+500,color:'#22a355'}].map((g,i)=>(
                  <div key={i} style={{textAlign:'center'}}>
                    <div style={{fontSize:9,color:'var(--text-3)',marginBottom:2}}>{g.label}</div>
                    <div style={{fontSize:13,fontWeight:700,color:g.color}}>{g.val.toLocaleString()}</div>
                    <div style={{fontSize:9,color:'var(--text-3)'}}>kcal/day</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <BreakdownTable title="TDEE Breakdown" rows={[
            {label:'TDEE',           value:`${tdee.toLocaleString()} kcal`,        bold:true,highlight:true,color:catColor},
            {label:'BMR',            value:`${Math.round(bmr).toLocaleString()} kcal (${bmrPct}%)`},
            {label:'Activity factor',value:`×${actObj.factor} (${actObj.label})`},
            {label:'Maintain weight',value:`${tdee.toLocaleString()} kcal/day`,    color:catColor},
            {label:'Lose 0.5kg/wk',  value:`${(tdee-500).toLocaleString()} kcal`,  color:'#ef4444'},
            {label:'Lose 1kg/wk',    value:`${(tdee-1000).toLocaleString()} kcal`, color:'#dc2626'},
            {label:'Gain 0.5kg/wk',  value:`${(tdee+500).toLocaleString()} kcal`,  color:'#22a355'},
          ]}/>
          <AIHintCard hint={hint}/>
        </>}
      />

      {/* TDEE component breakdown */}
      <Sec title="What makes up your TDEE" sub="Where every calorie goes">
        <p style={{fontSize:12,color:'var(--text-2)',lineHeight:1.7,marginBottom:14,fontFamily:"'DM Sans',sans-serif"}}>
          Your daily calorie burn has four components. BMR dominates, but NEAT (non-exercise movement) is the most variable and the easiest to increase without formal exercise.
        </p>
        <div style={{display:'flex',gap:3,height:32,borderRadius:8,overflow:'hidden',marginBottom:10}}>
          {[{label:'BMR',pct:bmrPct,color:'#0ea5e9'},{label:'NEAT',pct:neatPct,color:'#22a355'},{label:'EAT',pct:eatPct,color:catColor},{label:'TEF',pct:tefPct,color:'#8b5cf6'}].map((c,i)=>(
            <div key={i} style={{flex:c.pct,background:c.color,display:'flex',alignItems:'center',justifyContent:'center',minWidth:c.pct<8?0:40}}>
              {c.pct>=8&&<span style={{fontSize:9,fontWeight:700,color:'#fff',whiteSpace:'nowrap'}}>{c.label}</span>}
            </div>
          ))}
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:8}}>
          {[
            {label:'BMR',kcal:Math.round(bmr),pct:bmrPct,color:'#0ea5e9',desc:'Resting organ function'},
            {label:'NEAT',kcal:Math.round(tdee*(neatPct/100)),pct:neatPct,color:'#22a355',desc:'Non-exercise movement'},
            {label:'EAT',kcal:Math.round(tdee*(eatPct/100)),pct:eatPct,color:catColor,desc:'Planned exercise'},
            {label:'TEF',kcal:Math.round(tdee*(tefPct/100)),pct:tefPct,color:'#8b5cf6',desc:'Digesting food'},
          ].map((c,i)=>(
            <div key={i} style={{padding:'10px 12px',borderRadius:8,background:'var(--bg-raised)',border:'0.5px solid var(--border)'}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                <span style={{fontSize:12,fontWeight:700,color:c.color}}>{c.label}</span>
                <span style={{fontSize:12,fontWeight:700,color:'var(--text)'}}>{c.kcal.toLocaleString()} kcal</span>
              </div>
              <div style={{fontSize:10,color:'var(--text-3)',marginBottom:5}}>{c.desc} · {c.pct}%</div>
              <div style={{height:3,background:'var(--border)',borderRadius:2}}>
                <div style={{height:'100%',width:`${c.pct}%`,background:c.color,borderRadius:2}}/>
              </div>
            </div>
          ))}
        </div>
      </Sec>

      {/* how to increase TDEE */}
      <Sec title="How to increase your TDEE without more gym time" sub="NEAT is your secret weapon">
        <p style={{fontSize:12,color:'var(--text-2)',lineHeight:1.7,marginBottom:14,fontFamily:"'DM Sans',sans-serif"}}>NEAT (non-exercise activity thermogenesis) can vary by 600–900 kcal/day between people of the same size. Small habits compound significantly.</p>
        <div style={{display:'flex',flexDirection:'column',gap:6}}>
          {[
            {action:'Take the stairs instead of lift',kcal:30,easy:'Very easy'},
            {action:'Walk 10,000 steps/day (vs 5,000)',kcal:200,easy:'Easy'},
            {action:'Stand desk 3hrs/day (vs sitting)',kcal:100,easy:'Easy'},
            {action:'Walk/cycle to work instead of drive',kcal:250,easy:'Moderate'},
            {action:'Fidget, pace while on calls',kcal:150,easy:'Very easy'},
            {action:'30-min walk after each meal',kcal:180,easy:'Easy'},
          ].map((a,i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',gap:12,padding:'9px 14px',borderRadius:8,background:'var(--bg-raised)',border:'0.5px solid var(--border)'}}>
              <div style={{flex:1,fontSize:11,fontWeight:500,color:'var(--text)'}}>{a.action}</div>
              <div style={{fontSize:10,color:'var(--text-3)',flexShrink:0}}>+{a.kcal} kcal</div>
              <div style={{fontSize:9,fontWeight:700,background:'#d1fae5',color:'#065f46',padding:'2px 7px',borderRadius:6,flexShrink:0}}>{a.easy}</div>
            </div>
          ))}
        </div>
      </Sec>

      {/* formula */}
      <Sec title="The science behind the numbers" sub="Mifflin-St Jeor × activity factor">
        <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:14}}>
          {[
            {label:'BMR — male',  formula:'BMR = (10 × weight_kg) + (6.25 × height_cm) − (5 × age) + 5'},
            {label:'BMR — female',formula:'BMR = (10 × weight_kg) + (6.25 × height_cm) − (5 × age) − 161'},
            {label:'TDEE',        formula:'TDEE = BMR × activity factor   (1.2 sedentary → 1.9 athlete)'},
          ].map(f=>(<div key={f.label}><div style={{fontSize:10,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.05em',marginBottom:4}}>{f.label}</div><div style={{background:'var(--bg-raised)',borderRadius:8,padding:'10px 14px',fontFamily:'monospace',fontSize:11,color:catColor,fontWeight:600,overflowX:'auto',whiteSpace:'nowrap'}}>{f.formula}</div></div>))}
        </div>
        <p style={{fontSize:12,color:'var(--text-2)',lineHeight:1.75,margin:0,fontFamily:"'DM Sans',sans-serif"}}>Activity factors were derived by Harris and Benedict (1919) and refined in subsequent studies. They represent population averages — individual variation can be ±10–15%. The most accurate TDEE measurement is to track food intake and body weight for 2 weeks and calculate actual expenditure from stable weight maintenance calories.</p>
      </Sec>

      <Sec title="Real world examples" sub="Click any to prefill">
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
          {EXAMPLES.map((ex,i)=>{
            const bmr2=ex.sex==='male'?10*ex.wKg+6.25*ex.hCm-5*ex.age+5:10*ex.wKg+6.25*ex.hCm-5*ex.age-161
            const tdee2=Math.round(bmr2*(ACTIVITY.find(a=>a.key===ex.activity)?.factor||1.55))
            return(<button key={i} onClick={()=>applyExample(ex)} style={{padding:14,borderRadius:10,border:'1.5px solid var(--border)',background:'var(--bg-raised)',cursor:'pointer',textAlign:'left',transition:'all .15s'}} onMouseEnter={e=>{e.currentTarget.style.borderColor=catColor;e.currentTarget.style.background=catColor+'10'}} onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.background='var(--bg-raised)'}}>
              <div style={{fontSize:13,fontWeight:700,color:'var(--text)',marginBottom:2}}>{ex.title}</div>
              <div style={{fontSize:11,color:'var(--text-3)',marginBottom:9,lineHeight:1.4}}>{ex.desc}</div>
              {[['BMR',`${Math.round(bmr2).toLocaleString()} kcal`],['TDEE',`${tdee2.toLocaleString()} kcal`],['Activity',ACTIVITY.find(a=>a.key===ex.activity)?.label||'']].map(([k,v])=>(<div key={k} style={{display:'flex',justifyContent:'space-between'}}><span style={{fontSize:10,color:'var(--text-3)'}}>{k}</span><span style={{fontSize:10,fontWeight:600,color:catColor}}>{v}</span></div>))}
              <div style={{marginTop:8,textAlign:'right'}}><span style={{fontSize:10,fontWeight:700,color:catColor}}>Apply →</span></div>
            </button>)
          })}
        </div>
      </Sec>

      <Sec title="Key terms explained" sub="Click any term to expand">
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:8}}>
          {GLOSSARY.map((g,i)=><GlsTerm key={i} term={g.term} def={g.def} catColor={catColor}/>)}
        </div>
      </Sec>

      <HealthJourneyNext catColor={catColor} intro="TDEE is your true daily burn. Now set your goal and build the full nutrition plan." items={JOURNEY_ITEMS}/>

      <Sec title="Frequently asked questions" sub="Everything about TDEE">
        {FAQ.map((f,i)=>(<Acc key={i} q={f.q} a={f.a} open={openFaq===i} onToggle={()=>setOpenFaq(openFaq===i?null:i)} catColor={catColor}/>))}
      </Sec>
    </div>
  )
}
