import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'
import HealthJourneyNext from '../../components/health/HealthJourneyNext'

const clamp=(v,a,b)=>Math.min(b,Math.max(a,v))
const ACTIVITY=[{key:'sed',label:'Sedentary',factor:1.2},{key:'light',label:'Lightly active',factor:1.375},{key:'mod',label:'Moderately active',factor:1.55},{key:'high',label:'Very active',factor:1.725},{key:'xhigh',label:'Athlete',factor:1.9}]
const GOALS=[
  {key:'lose',    label:'Fat loss',    fatPct:0.25,color:'#ef4444'},
  {key:'maintain',label:'Maintain',    fatPct:0.30,color:'#10b981'},
  {key:'gain',    label:'Muscle gain', fatPct:0.25,color:'#3b82f6'},
  {key:'keto',    label:'Keto',        fatPct:0.70,color:'#8b5cf6'},
]
const FAT_FOODS=[
  {name:'Avocado (half)',g:15,type:'Unsaturated'},{name:'Olive oil (1 tbsp)',g:14,type:'Unsaturated'},
  {name:'Almonds (30g)',g:15,type:'Unsaturated'},{name:'Salmon (100g)',g:12,type:'Omega-3'},
  {name:'Egg (whole)',g:5,type:'Mixed'},{name:'Peanut butter (2 tbsp)',g:16,type:'Unsaturated'},
  {name:'Cheddar (30g)',g:9,type:'Saturated'},{name:'Dark chocolate (30g)',g:10,type:'Mixed'},
]
const JOURNEY_ITEMS=[{title:'Macro Calculator',sub:'Full protein, carbs and fat targets',icon:'🥗',path:'/health/calories/macro-calculator'},{title:'Calorie Calculator',sub:'Your total daily calorie target',icon:'🔥',path:'/health/calories/calorie-calculator'}]

function Sec({title,sub,children}){return(<div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,overflow:'hidden'}}><div style={{padding:'13px 18px',borderBottom:'0.5px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center'}}><span style={{fontSize:13,fontWeight:700,color:'var(--text)',fontFamily:"'Space Grotesk',sans-serif"}}>{title}</span>{sub&&<span style={{fontSize:11,color:'var(--text-3)'}}>{sub}</span>}</div><div style={{padding:'16px 18px'}}>{children}</div></div>)}
function Acc({q,a,open,onToggle,catColor}){return(<div style={{borderBottom:'0.5px solid var(--border)'}}><button onClick={onToggle} style={{width:'100%',display:'flex',justifyContent:'space-between',alignItems:'center',padding:'13px 0',background:'none',border:'none',cursor:'pointer',gap:12,textAlign:'left'}}><span style={{fontSize:13,fontWeight:600,color:'var(--text)',fontFamily:"'DM Sans',sans-serif",lineHeight:1.4}}>{q}</span><span style={{fontSize:18,color:catColor,flexShrink:0,transition:'transform .2s',display:'inline-block',transform:open?'rotate(45deg)':'none'}}>+</span></button>{open&&<p style={{fontSize:12.5,color:'var(--text-2)',lineHeight:1.75,margin:'0 0 13px',fontFamily:"'DM Sans',sans-serif"}}>{a}</p>}</div>)}
function GlsTerm({term,def,catColor}){const[open,setOpen]=useState(false);return(<div onClick={()=>setOpen(o=>!o)} style={{padding:'9px 12px',borderRadius:8,cursor:'pointer',transition:'all .15s',border:`1px solid ${open?catColor+'40':'var(--border)'}`,background:open?catColor+'10':'var(--bg-raised)'}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:8}}><span style={{fontSize:12,fontWeight:700,fontFamily:"'Space Grotesk',sans-serif",color:open?catColor:'var(--text)'}}>{term}</span><span style={{fontSize:14,color:catColor,flexShrink:0}}>{open?'−':'+'}</span></div>{open&&<p style={{fontSize:11.5,color:'var(--text-2)',lineHeight:1.65,margin:'6px 0 0',fontFamily:"'DM Sans',sans-serif"}}>{def}</p>}</div>)}
function Stepper({label,hint,value,onChange,min,max,step=1,unit,catColor}){const[editing,setEditing]=useState(false);const commit=r=>{const n=parseFloat(r);onChange(clamp(isNaN(n)?value:n,min,max));setEditing(false)};const btn={width:38,height:'100%',border:'none',background:'var(--bg-raised)',color:'var(--text)',fontSize:20,fontWeight:300,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontFamily:'inherit'};return(<div style={{marginBottom:16}}><div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}><label style={{fontSize:12.5,fontWeight:600,color:'var(--text)',fontFamily:"'DM Sans',sans-serif"}}>{label}</label>{hint&&<span style={{fontSize:10,color:'var(--text-3)'}}>{hint}</span>}</div><div style={{display:'flex',alignItems:'stretch',height:40,border:`1.5px solid ${editing?catColor:'var(--border-2)'}`,borderRadius:9,overflow:'hidden',background:'var(--bg-card)',transition:'border-color .15s'}}><button onMouseDown={e=>{e.preventDefault();onChange(clamp(value-step,min,max))}} style={{...btn,borderRight:'1px solid var(--border)'}} onMouseEnter={e=>e.currentTarget.style.background=catColor+'18'} onMouseLeave={e=>e.currentTarget.style.background='var(--bg-raised)'}>−</button><div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',gap:5}}>{editing?<input type="number" defaultValue={value} onBlur={e=>commit(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')commit(e.target.value);if(e.key==='Escape')setEditing(false)}} style={{width:'55%',border:'none',background:'transparent',textAlign:'center',fontSize:15,fontWeight:700,color:'var(--text)',outline:'none',fontFamily:"'DM Sans',sans-serif"}} autoFocus/>:<span onClick={()=>setEditing(true)} style={{fontSize:15,fontWeight:700,color:'var(--text)',cursor:'text',minWidth:36,textAlign:'center',fontFamily:"'DM Sans',sans-serif"}}>{value}</span>}<span style={{fontSize:11,color:'var(--text-3)',fontWeight:500}}>{unit}</span></div><button onMouseDown={e=>{e.preventDefault();onChange(clamp(value+step,min,max))}} style={{...btn,borderLeft:'1px solid var(--border)'}} onMouseEnter={e=>e.currentTarget.style.background=catColor+'18'} onMouseLeave={e=>e.currentTarget.style.background='var(--bg-raised)'}>+</button></div></div>)}
function IconCardGroup({label,options,value,onChange,catColor}){return(<div style={{marginBottom:18}}><div style={{fontSize:12,fontWeight:600,color:'var(--text-2)',marginBottom:8,fontFamily:"'DM Sans',sans-serif"}}>{label}</div><div style={{display:'flex',gap:8}}>{options.map(opt=>{const active=value===opt.value;return(<button key={opt.value} onClick={()=>onChange(opt.value)} style={{flex:1,padding:'12px 8px',borderRadius:10,cursor:'pointer',border:`1.5px solid ${active?catColor:'var(--border-2)'}`,background:active?catColor+'12':'var(--bg-raised)',display:'flex',flexDirection:'column',alignItems:'center',gap:6,transition:'all .18s',fontFamily:"'DM Sans',sans-serif"}}><div style={{width:28,height:28,display:'flex',alignItems:'center',justifyContent:'center'}}><svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke={active?catColor:'var(--text-3)'} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{opt.icon}</svg></div><span style={{fontSize:12,fontWeight:active?700:500,color:active?catColor:'var(--text-2)',lineHeight:1.2,textAlign:'center'}}>{opt.label}</span></button>)})}</div></div>)}

const UNIT_OPTIONS=[{value:'metric',label:'Metric',sub:'cm · kg',icon:<><rect x="3" y="2" width="16" height="18" rx="2.5"/><line x1="7" y1="7.5" x2="15" y2="7.5"/><line x1="7" y1="11" x2="15" y2="11"/><line x1="7" y1="14.5" x2="12" y2="14.5"/></>},{value:'imperial',label:'Imperial',sub:'ft · lbs',icon:<><rect x="3" y="2" width="16" height="18" rx="2.5"/><line x1="7" y1="7.5" x2="15" y2="7.5"/><line x1="7" y1="11" x2="15" y2="11"/><line x1="7" y1="14.5" x2="12" y2="14.5"/></>}]
const SEX_OPTIONS=[{value:'male',label:'Male',icon:<><circle cx="11" cy="9" r="5"/><line x1="11" y1="14" x2="11" y2="20"/><line x1="8" y1="17" x2="14" y2="17"/></>},{value:'female',label:'Female',icon:<><circle cx="11" cy="8.5" r="5"/><line x1="11" y1="13.5" x2="11" y2="20"/><line x1="8" y1="17" x2="14" y2="17"/></>}]

const GLOSSARY=[
  {term:'Dietary Fat',      def:'One of three macronutrients, providing 9 kcal/g. Essential for hormone production, fat-soluble vitamin absorption (A, D, E, K), and brain function.'},
  {term:'Unsaturated Fat',  def:'Healthy fats found in olive oil, nuts, avocado, and fatty fish. Associated with lower cardiovascular risk. Include both mono and polyunsaturated types.'},
  {term:'Saturated Fat',    def:'Fats solid at room temperature (butter, cheese, red meat). WHO recommends <10% of total calories. Excess is linked to elevated LDL cholesterol.'},
  {term:'Omega-3',          def:'Essential polyunsaturated fat (EPA, DHA from fish; ALA from flax). Anti-inflammatory, supports cardiovascular and brain health. Aim for 2 servings of fatty fish/week.'},
  {term:'Essential Fat Min',def:'The minimum daily fat intake to maintain hormone function: approximately 0.5–1g per kg of bodyweight. Never cut below this — it disrupts oestrogen and testosterone.'},
]
const FAQ=[
  {q:'How much fat do I need per day?',a:'At minimum, 0.5–1g of fat per kg of bodyweight per day to support hormones and fat-soluble vitamin absorption. For general health, 25–35% of total calories from fat is recommended (WHO). On a 2,000 kcal diet this is 55–78g/day. Do not drop below the minimum even in aggressive cutting phases.'},
  {q:'Is dietary fat the same as body fat?',a:'No. Eating fat does not directly cause body fat gain — excess calories do, regardless of source. Fat is actually the most satiating macronutrient per gram (9 kcal/g vs 4 kcal/g for protein/carbs), which can reduce overall food intake. The type of fat matters more than the amount for health outcomes.'},
  {q:'Should I avoid saturated fat?',a:'Minimise it rather than eliminate it. WHO recommends keeping saturated fat below 10% of total calories. Replacing saturated fat with unsaturated fat (olive oil, nuts, avocado) improves LDL:HDL ratios and reduces cardiovascular risk. Processed trans fats (partially hydrogenated oils) should be avoided entirely.'},
]

export default function FatCalculator({meta,category}){
  const catColor=category?.color||'#8b5cf6'
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
  const fatG=Math.round((tdee*goal.fatPct)/9)
  const fatKcal=Math.round(fatG*9)
  const minFatG=Math.round(wKgVal*0.8)
  const satFatMax=Math.round((tdee*0.10)/9)

  const stories=[
    {label:'Your daily target',headline:`You need ${fatG}g of fat per day`,detail:`That is ${fatKcal} kcal from fat (${Math.round(goal.fatPct*100)}% of your ${Math.round(tdee).toLocaleString()} kcal TDEE). Fat provides 9 kcal per gram — more than double protein or carbs.`},
    {label:'The minimum you need',headline:`Never go below ${minFatG}g/day`,detail:`Your body needs at least 0.8g/kg/day (${minFatG}g) for hormone production, testosterone, oestrogen, and fat-soluble vitamins. Cutting below this disrupts your endocrine system — even when cutting aggressively.`},
    {label:'What type of fat',headline:`Prioritise unsaturated, limit saturated to ${satFatMax}g`,detail:`Fill most fat intake with olive oil, avocado, nuts, and fatty fish. Keep saturated fat below ${satFatMax}g/day (10% of calories). Avoid trans fats entirely — they have zero safe threshold.`},
  ]

  const hint=`Daily fat target: ${fatG}g (${Math.round(goal.fatPct*100)}% of TDEE) for "${goal.label}". Minimum: ${minFatG}g/day. Max saturated fat: ${satFatMax}g. Never cut below minimum — hormones depend on it.`

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
          <div style={{fontSize:12,fontWeight:600,color:'var(--text-2)',marginBottom:8,fontFamily:"'DM Sans',sans-serif"}}>Goal</div>
          <div style={{display:'flex',flexDirection:'column',gap:5}}>
            {GOALS.map(g=>(<button key={g.key} onClick={()=>setGoalKey(g.key)} style={{display:'flex',justifyContent:'space-between',padding:'8px 12px',borderRadius:8,border:`1.5px solid ${goalKey===g.key?g.color:'var(--border-2)'}`,background:goalKey===g.key?g.color+'12':'var(--bg-raised)',cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}}><span style={{fontSize:12,fontWeight:600,color:goalKey===g.key?g.color:'var(--text)'}}>{g.label}</span><span style={{fontSize:10,color:'var(--text-3)'}}>{Math.round(g.fatPct*100)}% fat</span></button>))}
          </div>
        </div>
      </>}
      right={<>
        {/* Concept B: Narrative Story */}
        <div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,overflow:'hidden',marginBottom:14}}>
          <div style={{padding:'11px 16px',borderBottom:'0.5px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <span style={{fontSize:12,fontWeight:700,color:'var(--text)',fontFamily:"'Space Grotesk',sans-serif"}}>Your fat intake story</span>
            <span style={{fontSize:10,color:'var(--text-3)'}}>Updates live</span>
          </div>
          <div style={{padding:'16px 18px',display:'flex',flexDirection:'column',gap:10}}>
            {stories.map((s,i)=>{
              const colors=[catColor,'#0ea5e9','#f59e0b'];const softs=[catColor+'18','#e0f2fe','#fef3c7']
              return(<div key={i} style={{borderLeft:`3px solid ${colors[i]}`,paddingLeft:12,paddingTop:6,paddingBottom:6,borderRadius:'0 8px 8px 0',background:softs[i]}}>
                <div style={{fontSize:9,fontWeight:700,color:colors[i],textTransform:'uppercase',letterSpacing:'.07em',marginBottom:4}}>{s.label}</div>
                <div style={{fontSize:13,fontWeight:600,color:'var(--text)',lineHeight:1.55,fontFamily:"'Space Grotesk',sans-serif"}}>{s.headline}</div>
                <div style={{fontSize:11.5,color:'var(--text-2)',lineHeight:1.6,marginTop:4,fontFamily:"'DM Sans',sans-serif"}}>{s.detail}</div>
              </div>)
            })}
          </div>
        </div>
        <BreakdownTable title="Fat Summary" rows={[
          {label:'Daily fat',      value:`${fatG}g`,           bold:true,highlight:true,color:goal.color},
          {label:'% of calories',  value:`${Math.round(goal.fatPct*100)}%`},
          {label:'Kcal from fat',  value:`${fatKcal} kcal`},
          {label:'Minimum (0.8g/kg)',value:`${minFatG}g/day`,  color:'#ef4444'},
          {label:'Max saturated',  value:`${satFatMax}g/day`,  color:'#f59e0b'},
          {label:'Per meal (4x)',  value:`${Math.round(fatG/4)}g`},
        ]}/>
        <AIHintCard hint={hint}/>
      </>}
    />

    <Sec title="Best fat sources" sub="Unsaturated first, saturated in moderation">
      <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:8}}>
        {FAT_FOODS.map((f,i)=>{
          const servings=(fatG/f.g).toFixed(1)
          const typeColor=f.type==='Unsaturated'?'#22a355':f.type==='Omega-3'?'#0ea5e9':f.type==='Saturated'?'#f59e0b':'#94a3b8'
          return(<div key={i} style={{padding:'9px 12px',borderRadius:8,background:'var(--bg-raised)',border:'0.5px solid var(--border)'}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}>
              <span style={{fontSize:11,fontWeight:600,color:'var(--text)'}}>{f.name}</span>
              <span style={{fontSize:12,fontWeight:700,color:catColor}}>×{servings}</span>
            </div>
            <div style={{display:'flex',gap:6,alignItems:'center'}}>
              <span style={{fontSize:9,fontWeight:700,background:typeColor+'20',color:typeColor,padding:'1px 6px',borderRadius:5}}>{f.type}</span>
              <span style={{fontSize:10,color:'var(--text-3)'}}>{f.g}g fat per serving</span>
            </div>
          </div>)
        })}
      </div>
    </Sec>

    <Sec title="Key terms" sub="Click any to expand">
      <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:8}}>
        {GLOSSARY.map((g,i)=><GlsTerm key={i} term={g.term} def={g.def} catColor={catColor}/>)}
      </div>
    </Sec>

    <HealthJourneyNext catColor={catColor} intro="Fat fuels hormones and absorbs vitamins. Complete your macro plan." items={JOURNEY_ITEMS}/>

    <Sec title="Frequently asked questions" sub="Everything about dietary fat">
      {FAQ.map((f,i)=>(<Acc key={i} q={f.q} a={f.a} open={openFaq===i} onToggle={()=>setOpenFaq(openFaq===i?null:i)} catColor={catColor}/>))}
    </Sec>
  </div>)
}
