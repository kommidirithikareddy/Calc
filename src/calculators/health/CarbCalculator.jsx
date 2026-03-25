import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'
import HealthJourneyNext from '../../components/health/HealthJourneyNext'

const clamp=(v,a,b)=>Math.min(b,Math.max(a,v))
const ACTIVITY=[{key:'sed',label:'Sedentary',factor:1.2},{key:'light',label:'Lightly active',factor:1.375},{key:'mod',label:'Moderately active',factor:1.55},{key:'high',label:'Very active',factor:1.725},{key:'xhigh',label:'Athlete',factor:1.9}]
const GOALS=[
  {key:'lose',    label:'Fat loss',      carbPct:0.30,color:'#ef4444'},
  {key:'maintain',label:'Maintenance',   carbPct:0.45,color:'#10b981'},
  {key:'gain',    label:'Muscle gain',   carbPct:0.50,color:'#3b82f6'},
  {key:'endurance',label:'Endurance',    carbPct:0.60,color:'#f59e0b'},
  {key:'keto',    label:'Keto',          carbPct:0.05,color:'#8b5cf6'},
]
const CARB_FOODS=[
  {name:'White rice (100g cooked)',g:28},{name:'Brown rice (100g cooked)',g:23},{name:'Oats (100g dry)',g:66},
  {name:'Sweet potato (100g)',g:20},{name:'Banana (medium)',g:27},{name:'Whole wheat bread (slice)',g:15},
  {name:'Pasta (100g cooked)',g:25},{name:'Quinoa (100g cooked)',g:21},
]
const JOURNEY_ITEMS=[{title:'Macro Calculator',sub:'Full protein, carbs and fat targets',icon:'🥗',path:'/health/calories/macro-calculator'},{title:'Calorie Calculator',sub:'Your total daily calorie target',icon:'🔥',path:'/health/calories/calorie-calculator'},{title:'Fiber Calculator',sub:'Is your carb quality good?',icon:'🌾',path:'/health/calories/fiber-calculator'}]

function Sec({title,sub,children}){return(<div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,overflow:'hidden'}}><div style={{padding:'13px 18px',borderBottom:'0.5px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center'}}><span style={{fontSize:13,fontWeight:700,color:'var(--text)',fontFamily:"'Space Grotesk',sans-serif"}}>{title}</span>{sub&&<span style={{fontSize:11,color:'var(--text-3)'}}>{sub}</span>}</div><div style={{padding:'16px 18px'}}>{children}</div></div>)}
function Acc({q,a,open,onToggle,catColor}){return(<div style={{borderBottom:'0.5px solid var(--border)'}}><button onClick={onToggle} style={{width:'100%',display:'flex',justifyContent:'space-between',alignItems:'center',padding:'13px 0',background:'none',border:'none',cursor:'pointer',gap:12,textAlign:'left'}}><span style={{fontSize:13,fontWeight:600,color:'var(--text)',fontFamily:"'DM Sans',sans-serif",lineHeight:1.4}}>{q}</span><span style={{fontSize:18,color:catColor,flexShrink:0,transition:'transform .2s',display:'inline-block',transform:open?'rotate(45deg)':'none'}}>+</span></button>{open&&<p style={{fontSize:12.5,color:'var(--text-2)',lineHeight:1.75,margin:'0 0 13px',fontFamily:"'DM Sans',sans-serif"}}>{a}</p>}</div>)}
function GlsTerm({term,def,catColor}){const[open,setOpen]=useState(false);return(<div onClick={()=>setOpen(o=>!o)} style={{padding:'9px 12px',borderRadius:8,cursor:'pointer',transition:'all .15s',border:`1px solid ${open?catColor+'40':'var(--border)'}`,background:open?catColor+'10':'var(--bg-raised)'}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:8}}><span style={{fontSize:12,fontWeight:700,fontFamily:"'Space Grotesk',sans-serif",color:open?catColor:'var(--text)'}}>{term}</span><span style={{fontSize:14,color:catColor,flexShrink:0}}>{open?'−':'+'}</span></div>{open&&<p style={{fontSize:11.5,color:'var(--text-2)',lineHeight:1.65,margin:'6px 0 0',fontFamily:"'DM Sans',sans-serif"}}>{def}</p>}</div>)}
function Stepper({label,hint,value,onChange,min,max,step=1,unit,catColor}){const[editing,setEditing]=useState(false);const commit=r=>{const n=parseFloat(r);onChange(clamp(isNaN(n)?value:n,min,max));setEditing(false)};const btn={width:38,height:'100%',border:'none',background:'var(--bg-raised)',color:'var(--text)',fontSize:20,fontWeight:300,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontFamily:'inherit'};return(<div style={{marginBottom:16}}><div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}><label style={{fontSize:12.5,fontWeight:600,color:'var(--text)',fontFamily:"'DM Sans',sans-serif"}}>{label}</label>{hint&&<span style={{fontSize:10,color:'var(--text-3)'}}>{hint}</span>}</div><div style={{display:'flex',alignItems:'stretch',height:40,border:`1.5px solid ${editing?catColor:'var(--border-2)'}`,borderRadius:9,overflow:'hidden',background:'var(--bg-card)',transition:'border-color .15s'}}><button onMouseDown={e=>{e.preventDefault();onChange(clamp(value-step,min,max))}} style={{...btn,borderRight:'1px solid var(--border)'}} onMouseEnter={e=>e.currentTarget.style.background=catColor+'18'} onMouseLeave={e=>e.currentTarget.style.background='var(--bg-raised)'}>−</button><div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',gap:5}}>{editing?<input type="number" defaultValue={value} onBlur={e=>commit(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')commit(e.target.value);if(e.key==='Escape')setEditing(false)}} style={{width:'55%',border:'none',background:'transparent',textAlign:'center',fontSize:15,fontWeight:700,color:'var(--text)',outline:'none',fontFamily:"'DM Sans',sans-serif"}} autoFocus/>:<span onClick={()=>setEditing(true)} style={{fontSize:15,fontWeight:700,color:'var(--text)',cursor:'text',minWidth:36,textAlign:'center',fontFamily:"'DM Sans',sans-serif"}}>{value}</span>}<span style={{fontSize:11,color:'var(--text-3)',fontWeight:500}}>{unit}</span></div><button onMouseDown={e=>{e.preventDefault();onChange(clamp(value+step,min,max))}} style={{...btn,borderLeft:'1px solid var(--border)'}} onMouseEnter={e=>e.currentTarget.style.background=catColor+'18'} onMouseLeave={e=>e.currentTarget.style.background='var(--bg-raised)'}>+</button></div></div>)}
function IconCardGroup({label,options,value,onChange,catColor}){return(<div style={{marginBottom:18}}><div style={{fontSize:12,fontWeight:600,color:'var(--text-2)',marginBottom:8,fontFamily:"'DM Sans',sans-serif"}}>{label}</div><div style={{display:'flex',gap:8}}>{options.map(opt=>{const active=value===opt.value;return(<button key={opt.value} onClick={()=>onChange(opt.value)} style={{flex:1,padding:'12px 8px',borderRadius:10,cursor:'pointer',border:`1.5px solid ${active?catColor:'var(--border-2)'}`,background:active?catColor+'12':'var(--bg-raised)',display:'flex',flexDirection:'column',alignItems:'center',gap:6,transition:'all .18s',fontFamily:"'DM Sans',sans-serif"}}><div style={{width:28,height:28,display:'flex',alignItems:'center',justifyContent:'center'}}><svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke={active?catColor:'var(--text-3)'} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{opt.icon}</svg></div><span style={{fontSize:12,fontWeight:active?700:500,color:active?catColor:'var(--text-2)',lineHeight:1.2,textAlign:'center'}}>{opt.label}</span></button>)})}</div></div>)}

const UNIT_OPTIONS=[{value:'metric',label:'Metric',sub:'cm · kg',icon:<><rect x="3" y="2" width="16" height="18" rx="2.5"/><line x1="7" y1="7.5" x2="15" y2="7.5"/><line x1="7" y1="11" x2="15" y2="11"/><line x1="7" y1="14.5" x2="12" y2="14.5"/></>},{value:'imperial',label:'Imperial',sub:'ft · lbs',icon:<><rect x="3" y="2" width="16" height="18" rx="2.5"/><line x1="7" y1="7.5" x2="15" y2="7.5"/><line x1="7" y1="11" x2="15" y2="11"/><line x1="7" y1="14.5" x2="12" y2="14.5"/></>}]
const SEX_OPTIONS=[{value:'male',label:'Male',icon:<><circle cx="11" cy="9" r="5"/><line x1="11" y1="14" x2="11" y2="20"/><line x1="8" y1="17" x2="14" y2="17"/></>},{value:'female',label:'Female',icon:<><circle cx="11" cy="8.5" r="5"/><line x1="11" y1="13.5" x2="11" y2="20"/><line x1="8" y1="17" x2="14" y2="17"/></>}]

const GLOSSARY=[
  {term:'Carbohydrates',def:'The body\'s primary energy source, providing 4 kcal/g. Broken down into glucose, which fuels the brain and muscles.'},
  {term:'Glycogen',    def:'Stored carbohydrate in muscles (~400g) and liver (~100g). Primary fuel for high-intensity exercise. Depleted after ~90 min of intense activity.'},
  {term:'Glycaemic Index',def:'A ranking of carbs by how quickly they raise blood sugar. Low GI (≤55): oats, lentils. High GI (≥70): white bread, white rice. Lower GI generally preferred for sustained energy.'},
  {term:'Fibre',       def:'Indigestible carbohydrate that feeds gut bacteria, slows glucose absorption, and improves satiety. Recommended: 25–38g/day.'},
  {term:'Net Carbs',   def:'Total carbohydrates minus fibre (and sometimes sugar alcohols). Used in keto and low-carb tracking. Net carbs = total carbs − fibre.'},
]
const FAQ=[
  {q:'Are carbs bad for weight loss?',a:'No. Carbohydrates are not inherently fattening. Weight loss is determined by total calorie intake, not macronutrient distribution. Low-carb diets can work because they often reduce total calorie intake (by eliminating processed foods) and increase satiety from higher protein. However, well-controlled trials show equal long-term fat loss between low-carb and low-fat diets at equal calorie deficits.'},
  {q:'How many carbs should I eat per day?',a:'It depends on your goal. Fat loss: 30–35% of calories (100–150g on a 1,500 kcal diet). Maintenance: 40–50% (200–250g on 2,000 kcal). Endurance sport: 50–65% (300–400g on 2,500 kcal). Keto: <50g total, ideally <20–30g net carbs. There is no universal optimal — match carb intake to your activity level and goals.'},
  {q:'What are the best carb sources?',a:'Prioritise complex, high-fibre carbs: oats, brown rice, sweet potato, legumes, quinoa, whole wheat, fruit, and vegetables. These digest slowly, maintain stable blood sugar, and provide micronutrients. Minimise refined carbs (white bread, pastries, sugary drinks) which are calorie-dense, nutrient-poor, and spike insulin rapidly.'},
]

export default function CarbCalculator({meta,category}){
  const catColor=category?.color||'#f59e0b'
  const[unit,setUnit]=useState('metric')
  const[hCm,setHCm]=useState(175);const[hFt,setHFt]=useState(5);const[hIn,setHIn]=useState(9)
  const[wKg,setWKg]=useState(75);const[wLbs,setWLbs]=useState(165)
  const[age,setAge]=useState(30);const[sex,setSex]=useState('male')
  const[activityKey,setActivityKey]=useState('mod');const[goalKey,setGoalKey]=useState('maintain')
  const[openFaq,setOpenFaq]=useState(null)

  function handleUnit(u){if(u===unit)return;if(u==='imperial'){const ti=Math.round(hCm/2.54);setHFt(Math.floor(ti/12));setHIn(ti%12);setWLbs(Math.round(wKg*2.20462))}else{setHCm(clamp(Math.round((hFt*12+hIn)*2.54),100,250));setWKg(clamp(Math.round(wLbs/2.20462),20,300))};setUnit(u)}

  const isM=unit==='metric';const hM=isM?hCm/100:(hFt*12+hIn)*0.0254;const wKgVal=isM?wKg:wLbs/2.20462;const hCmVal=hM*100
  const bmr=sex==='male'?10*wKgVal+6.25*hCmVal-5*age+5:10*wKgVal+6.25*hCmVal-5*age-161
  const tdee=bmr*(ACTIVITY.find(a=>a.key===activityKey)?.factor||1.55)
  const goal=GOALS.find(g=>g.key===goalKey)||GOALS[1]
  const carbsG=Math.round((tdee*goal.carbPct)/4)
  const carbsKcal=carbsG*4
  const whoMin=Math.round(tdee*0.45/4);const whoMax=Math.round(tdee*0.65/4)
  const score=clamp(goalKey==='keto'?50:goalKey==='lose'?65:goalKey==='maintain'?85:goalKey==='gain'?80:90,0,100)
  const grade=score>=80?'Optimal':score>=65?'Good':'Restricted'
  const gradeColor=score>=80?'#10b981':score>=65?'#3b82f6':'#f59e0b'
  const gradeSoft=score>=80?'#d1fae5':score>=65?'#dbeafe':'#fef3c7'
  const R=42,C=54,circ=2*Math.PI*R,fill=circ*(score/100)
  const ringColor=score>=80?'#10b981':score>=60?'#3b82f6':'#f59e0b'
  const hint=`Daily carb target: ${carbsG}g (${Math.round(goal.carbPct*100)}% of ${Math.round(tdee).toLocaleString()} kcal TDEE) for "${goal.label}". That's ${carbsKcal} kcal from carbs. WHO range: ${whoMin}–${whoMax}g.`

  return(<div style={{display:'flex',flexDirection:'column',gap:20}}>
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
          <div style={{fontSize:12,fontWeight:600,color:'var(--text-2)',marginBottom:8,fontFamily:"'DM Sans',sans-serif"}}>Activity level</div>
          <div style={{display:'flex',flexDirection:'column',gap:5}}>
            {ACTIVITY.map(a=>(<button key={a.key} onClick={()=>setActivityKey(a.key)} style={{display:'flex',justifyContent:'space-between',padding:'8px 12px',borderRadius:8,border:`1.5px solid ${activityKey===a.key?catColor:'var(--border-2)'}`,background:activityKey===a.key?catColor+'12':'var(--bg-raised)',cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}}><span style={{fontSize:12,fontWeight:600,color:activityKey===a.key?catColor:'var(--text)'}}>{a.label}</span><span style={{fontSize:10,color:'var(--text-3)'}}>×{a.factor}</span></button>))}
          </div>
        </div>
        <div style={{borderTop:'0.5px solid var(--border)',paddingTop:16,marginTop:12}}>
          <div style={{fontSize:12,fontWeight:600,color:'var(--text-2)',marginBottom:8,fontFamily:"'DM Sans',sans-serif"}}>Diet goal</div>
          <div style={{display:'flex',flexDirection:'column',gap:5}}>
            {GOALS.map(g=>(<button key={g.key} onClick={()=>setGoalKey(g.key)} style={{display:'flex',justifyContent:'space-between',padding:'8px 12px',borderRadius:8,border:`1.5px solid ${goalKey===g.key?g.color:'var(--border-2)'}`,background:goalKey===g.key?g.color+'12':'var(--bg-raised)',cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}}><span style={{fontSize:12,fontWeight:600,color:goalKey===g.key?g.color:'var(--text)'}}>{g.label}</span><span style={{fontSize:10,color:'var(--text-3)'}}>{Math.round(g.carbPct*100)}% carbs</span></button>))}
          </div>
        </div>
      </>}
      right={<>
        {/* Health Score Card */}
        <div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,overflow:'hidden',marginBottom:14}}>
          <div style={{padding:'11px 16px',borderBottom:'0.5px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <span style={{fontSize:12,fontWeight:700,color:'var(--text)',fontFamily:"'Space Grotesk',sans-serif"}}>Carb Score</span>
            <span style={{fontSize:10,color:'var(--text-3)'}}>Updates live</span>
          </div>
          <div style={{padding:'16px 18px'}}>
            <div style={{display:'flex',gap:18,alignItems:'center',marginBottom:16}}>
              <svg viewBox="0 0 108 108" width="96" height="96" style={{flexShrink:0}}>
                <circle cx={C} cy={C} r={R} fill="none" stroke="var(--border)" strokeWidth="11"/>
                <circle cx={C} cy={C} r={R} fill="none" stroke={ringColor} strokeWidth="11" strokeLinecap="round" strokeDasharray={`${fill} ${circ}`} strokeDashoffset={circ/4} transform={`rotate(-90 ${C} ${C})`} style={{transition:'stroke-dasharray .6s ease'}}/>
                <text x={C} y={C-6} textAnchor="middle" fontSize="22" fontWeight="700" fill="var(--text)" fontFamily="inherit">{score}</text>
                <text x={C} y={C+10} textAnchor="middle" fontSize="9" fill="var(--text-3)" fontFamily="inherit">/ 100</text>
              </svg>
              <div>
                <div style={{display:'inline-flex',alignItems:'center',gap:6,padding:'5px 12px 5px 8px',borderRadius:20,background:gradeSoft,border:`1px solid ${gradeColor}35`,marginBottom:8}}>
                  <div style={{width:8,height:8,borderRadius:'50%',background:gradeColor}}/>
                  <span style={{fontSize:12,fontWeight:700,color:gradeColor}}>{grade}</span>
                </div>
                <div style={{fontSize:11,color:'var(--text-3)',lineHeight:1.5}}>Carb balance vs WHO recommendations for your goal.</div>
              </div>
            </div>
            {[
              {label:'Daily carbs',    value:`${carbsG}g`,                     score:score,      color:goal.color,   note:`${carbsKcal} kcal (${Math.round(goal.carbPct*100)}% of TDEE)`},
              {label:'WHO alignment',  value:`${whoMin}–${whoMax}g target`,    score:goalKey==='keto'?15:goalKey==='lose'?55:75, color:'#0ea5e9', note:'WHO recommends 45–65% of calories from carbs'},
              {label:'Glycogen stores',value:carbsG>=200?'Adequate':'Low',     score:Math.min(100,(carbsG/250)*100), color:'#22a355', note:'200g+/day maintains muscle glycogen for training'},
            ].map((f,i)=>(<div key={i} style={{marginBottom:10}}><div style={{display:'flex',justifyContent:'space-between',fontSize:11,marginBottom:4}}><span style={{color:'var(--text-2)'}}>{f.label}</span><span style={{fontWeight:700,color:f.color}}>{f.value}</span></div><div style={{height:6,background:'var(--border)',borderRadius:3,overflow:'hidden'}}><div style={{height:'100%',width:`${clamp(f.score,0,100)}%`,background:f.color,borderRadius:3,transition:'width .5s'}}/></div><div style={{fontSize:10,color:'var(--text-3)',marginTop:2}}>{f.note}</div></div>))}
          </div>
          <div style={{margin:'0 18px 16px',padding:'10px 13px',background:gradeSoft,borderRadius:10,border:`1px solid ${gradeColor}30`}}>
            <p style={{fontSize:11.5,color:'var(--text-2)',margin:0,lineHeight:1.65,fontFamily:"'DM Sans',sans-serif"}}>
              {goalKey==='keto'?`Keto requires keeping carbs below 50g/day (ideally 20–30g net) to maintain ketosis. Your target of ${carbsG}g is in the keto zone.`:goalKey==='endurance'?`Endurance athletes need high carbs to fuel glycogen stores. ${carbsG}g/day supports extended training sessions.`:`${carbsG}g/day of carbs supports your ${goal.label.toLowerCase()} goal. Prioritise complex, high-fibre sources.`}
            </p>
          </div>
        </div>
        <BreakdownTable title="Carb Summary" rows={[
          {label:'Daily carbs',  value:`${carbsG}g`,         bold:true,highlight:true,color:goal.color},
          {label:'% of calories',value:`${Math.round(goal.carbPct*100)}%`},
          {label:'Kcal from carbs',value:`${carbsKcal} kcal`},
          {label:'WHO min',      value:`${whoMin}g (45%)`},
          {label:'WHO max',      value:`${whoMax}g (65%)`},
          {label:'Net carbs',    value:`${Math.max(0,carbsG-25)}g (est. −25g fibre)`},
          {label:'Per meal (4x)',value:`${Math.round(carbsG/4)}g`},
        ]}/>
        <AIHintCard hint={hint}/>
      </>}
    />

    <Sec title="Best carb sources for your goal" sub="Quality matters as much as quantity">
      <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:8}}>
        {CARB_FOODS.map((f,i)=>{
          const servings=(carbsG/f.g).toFixed(1)
          return(<div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'9px 12px',borderRadius:8,background:'var(--bg-raised)',border:'0.5px solid var(--border)'}}>
            <div style={{flex:1}}><div style={{fontSize:11,fontWeight:600,color:'var(--text)',marginBottom:1}}>{f.name}</div><div style={{fontSize:10,color:'var(--text-3)'}}>{f.g}g carbs per serving</div></div>
            <div style={{textAlign:'right'}}><div style={{fontSize:14,fontWeight:700,color:goal.color}}>×{servings}</div><div style={{fontSize:9,color:'var(--text-3)'}}>servings</div></div>
          </div>)
        })}
      </div>
    </Sec>

    <Sec title="Key terms explained" sub="Click any term to expand">
      <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:8}}>
        {GLOSSARY.map((g,i)=><GlsTerm key={i} term={g.term} def={g.def} catColor={catColor}/>)}
      </div>
    </Sec>

    <HealthJourneyNext catColor={catColor} intro="Carbs fuel your training and brain. Complete the full nutrition picture." items={JOURNEY_ITEMS}/>

    <Sec title="Frequently asked questions" sub="Everything about carbohydrates">
      {FAQ.map((f,i)=>(<Acc key={i} q={f.q} a={f.a} open={openFaq===i} onToggle={()=>setOpenFaq(openFaq===i?null:i)} catColor={catColor}/>))}
    </Sec>
  </div>)
}
