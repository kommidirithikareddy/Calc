import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'
import HealthJourneyNext from '../../components/health/HealthJourneyNext'
import InsightRotator from '../../components/health/InsightRotator'

const clamp=(v,a,b)=>Math.min(b,Math.max(a,v))
const fmtKg=n=>`${(Math.round(n*10)/10).toFixed(1)} kg`

const ACTIVITY=[{key:'sed',label:'Sedentary',factor:1.2},{key:'light',label:'Lightly active',factor:1.375},{key:'mod',label:'Moderately active',factor:1.55},{key:'high',label:'Very active',factor:1.725},{key:'xhigh',label:'Athlete',factor:1.9}]

const PHASES=[
  {key:'cut',     label:'Cut',        sub:'Lose fat, preserve muscle', adj:-500,  rate:-0.5, color:'#ef4444', proteinMult:2.2, carbPct:0.35, fatPct:0.30},
  {key:'maintain',label:'Maintain',   sub:'Hold current composition',  adj:0,     rate:0,    color:'#10b981', proteinMult:1.8, carbPct:0.45, fatPct:0.30},
  {key:'lean',    label:'Lean Bulk',  sub:'Slow muscle gain, less fat',adj:300,   rate:0.25, color:'#3b82f6', proteinMult:1.8, carbPct:0.50, fatPct:0.25},
  {key:'bulk',    label:'Bulk',       sub:'Maximum muscle gain',       adj:500,   rate:0.5,  color:'#8b5cf6', proteinMult:1.6, carbPct:0.50, fatPct:0.25},
]

const JOURNEY_ITEMS=[{title:'Calorie Deficit',sub:'Detailed cut planning',icon:'📉',path:'/health/calories/calorie-deficit'},{title:'Macro Calculator',sub:'Full macro breakdown',icon:'🥗',path:'/health/calories/macro-calculator'},{title:'Body Fat %',sub:'Track your composition',icon:'💪',path:'/health/body-metrics/body-fat-calculator'}]

function Sec({title,sub,children}){return(<div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,overflow:'hidden'}}><div style={{padding:'13px 18px',borderBottom:'0.5px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center'}}><span style={{fontSize:13,fontWeight:700,color:'var(--text)',fontFamily:"'Space Grotesk',sans-serif"}}>{title}</span>{sub&&<span style={{fontSize:11,color:'var(--text-3)'}}>{sub}</span>}</div><div style={{padding:'16px 18px'}}>{children}</div></div>)}
function Acc({q,a,open,onToggle,catColor}){return(<div style={{borderBottom:'0.5px solid var(--border)'}}><button onClick={onToggle} style={{width:'100%',display:'flex',justifyContent:'space-between',alignItems:'center',padding:'13px 0',background:'none',border:'none',cursor:'pointer',gap:12,textAlign:'left'}}><span style={{fontSize:13,fontWeight:600,color:'var(--text)',fontFamily:"'DM Sans',sans-serif",lineHeight:1.4}}>{q}</span><span style={{fontSize:18,color:catColor,flexShrink:0,transition:'transform .2s',display:'inline-block',transform:open?'rotate(45deg)':'none'}}>+</span></button>{open&&<p style={{fontSize:12.5,color:'var(--text-2)',lineHeight:1.75,margin:'0 0 13px',fontFamily:"'DM Sans',sans-serif"}}>{a}</p>}</div>)}
function GlsTerm({term,def,catColor}){const[open,setOpen]=useState(false);return(<div onClick={()=>setOpen(o=>!o)} style={{padding:'9px 12px',borderRadius:8,cursor:'pointer',transition:'all .15s',border:`1px solid ${open?catColor+'40':'var(--border)'}`,background:open?catColor+'10':'var(--bg-raised)'}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:8}}><span style={{fontSize:12,fontWeight:700,fontFamily:"'Space Grotesk',sans-serif",color:open?catColor:'var(--text)'}}>{term}</span><span style={{fontSize:14,color:catColor,flexShrink:0}}>{open?'−':'+'}</span></div>{open&&<p style={{fontSize:11.5,color:'var(--text-2)',lineHeight:1.65,margin:'6px 0 0',fontFamily:"'DM Sans',sans-serif"}}>{def}</p>}</div>)}
function Stepper({label,hint,value,onChange,min,max,step=1,unit,catColor}){const[editing,setEditing]=useState(false);const commit=r=>{const n=parseFloat(r);onChange(clamp(isNaN(n)?value:n,min,max));setEditing(false)};const btn={width:38,height:'100%',border:'none',background:'var(--bg-raised)',color:'var(--text)',fontSize:20,fontWeight:300,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontFamily:'inherit'};return(<div style={{marginBottom:16}}><div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}><label style={{fontSize:12.5,fontWeight:600,color:'var(--text)',fontFamily:"'DM Sans',sans-serif"}}>{label}</label>{hint&&<span style={{fontSize:10,color:'var(--text-3)'}}>{hint}</span>}</div><div style={{display:'flex',alignItems:'stretch',height:40,border:`1.5px solid ${editing?catColor:'var(--border-2)'}`,borderRadius:9,overflow:'hidden',background:'var(--bg-card)',transition:'border-color .15s'}}><button onMouseDown={e=>{e.preventDefault();onChange(clamp(value-step,min,max))}} style={{...btn,borderRight:'1px solid var(--border)'}} onMouseEnter={e=>e.currentTarget.style.background=catColor+'18'} onMouseLeave={e=>e.currentTarget.style.background='var(--bg-raised)'}>−</button><div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',gap:5}}>{editing?<input type="number" defaultValue={value} onBlur={e=>commit(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')commit(e.target.value);if(e.key==='Escape')setEditing(false)}} style={{width:'55%',border:'none',background:'transparent',textAlign:'center',fontSize:15,fontWeight:700,color:'var(--text)',outline:'none',fontFamily:"'DM Sans',sans-serif"}} autoFocus/>:<span onClick={()=>setEditing(true)} style={{fontSize:15,fontWeight:700,color:'var(--text)',cursor:'text',minWidth:36,textAlign:'center',fontFamily:"'DM Sans',sans-serif"}}>{value}</span>}<span style={{fontSize:11,color:'var(--text-3)',fontWeight:500}}>{unit}</span></div><button onMouseDown={e=>{e.preventDefault();onChange(clamp(value+step,min,max))}} style={{...btn,borderLeft:'1px solid var(--border)'}} onMouseEnter={e=>e.currentTarget.style.background=catColor+'18'} onMouseLeave={e=>e.currentTarget.style.background='var(--bg-raised)'}>+</button></div></div>)}
function IconCardGroup({label,options,value,onChange,catColor}){return(<div style={{marginBottom:18}}><div style={{fontSize:12,fontWeight:600,color:'var(--text-2)',marginBottom:8,fontFamily:"'DM Sans',sans-serif"}}>{label}</div><div style={{display:'flex',gap:8}}>{options.map(opt=>{const active=value===opt.value;return(<button key={opt.value} onClick={()=>onChange(opt.value)} style={{flex:1,padding:'12px 8px',borderRadius:10,cursor:'pointer',border:`1.5px solid ${active?catColor:'var(--border-2)'}`,background:active?catColor+'12':'var(--bg-raised)',display:'flex',flexDirection:'column',alignItems:'center',gap:6,transition:'all .18s',fontFamily:"'DM Sans',sans-serif"}}><div style={{width:28,height:28,display:'flex',alignItems:'center',justifyContent:'center'}}><svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke={active?catColor:'var(--text-3)'} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{opt.icon}</svg></div><span style={{fontSize:12,fontWeight:active?700:500,color:active?catColor:'var(--text-2)',lineHeight:1.2,textAlign:'center'}}>{opt.label}</span>{opt.sub&&<span style={{fontSize:10,color:active?catColor+'cc':'var(--text-3)',lineHeight:1.2,textAlign:'center'}}>{opt.sub}</span>}</button>)})}</div></div>)}

const UNIT_OPTIONS=[{value:'metric',label:'Metric',sub:'cm · kg',icon:<><rect x="3" y="2" width="16" height="18" rx="2.5"/><line x1="7" y1="7.5" x2="15" y2="7.5"/><line x1="7" y1="11" x2="15" y2="11"/><line x1="7" y1="14.5" x2="12" y2="14.5"/></>},{value:'imperial',label:'Imperial',sub:'ft · lbs',icon:<><rect x="3" y="2" width="16" height="18" rx="2.5"/><line x1="7" y1="7.5" x2="15" y2="7.5"/><line x1="7" y1="11" x2="15" y2="11"/><line x1="7" y1="14.5" x2="12" y2="14.5"/></>}]
const SEX_OPTIONS=[{value:'male',label:'Male',icon:<><circle cx="11" cy="9" r="5"/><line x1="11" y1="14" x2="11" y2="20"/><line x1="8" y1="17" x2="14" y2="17"/></>},{value:'female',label:'Female',icon:<><circle cx="11" cy="8.5" r="5"/><line x1="11" y1="13.5" x2="11" y2="20"/><line x1="8" y1="17" x2="14" y2="17"/></>}]

const GLOSSARY=[
  {term:'Lean Bulk',    def:'A slow caloric surplus (200–300 kcal) designed to maximise muscle gain while minimising fat accumulation. Typically 0.25–0.5 kg/week gain.'},
  {term:'Cut',          def:'A caloric deficit phase to reduce body fat while preserving muscle through high protein intake and resistance training.'},
  {term:'Body Recomp',  def:'Simultaneously losing fat and gaining muscle. Possible for beginners and those returning from a break. Achieved at maintenance calories with high protein.'},
  {term:'Dirty Bulk',   def:'An aggressive caloric surplus without food quality control. Maximises scale weight gain but accumulates significant fat alongside muscle.'},
  {term:'Meso Cycle',   def:'A training block of 4–12 weeks. Most practitioners alternate cut and bulk phases over mesocycles, with maintenance phases between to consolidate gains.'},
]

const FAQ=[
  {q:'Should I bulk or cut first?',a:'If your body fat is above 20% (male) or 30% (female), cut first until you reach 12–15% (male) or 20–23% (female). At high body fat, insulin sensitivity is reduced and muscle gain efficiency drops. At lower body fat, bulking produces a better muscle:fat ratio. If you\'re a beginner, start at maintenance with high protein — you may recomp naturally for 6–12 months.'},
  {q:'How long should a lean bulk last?',a:'Typically 12–20 weeks (3–5 months). Beyond 20 weeks, fat accumulation usually outpaces muscle gain and you\'ll need a cut to restore insulin sensitivity. A mini-cut of 4–6 weeks after a bulk allows consolidation and restores visual definition before the next bulk phase.'},
  {q:'What is the maximum rate of natural muscle gain?',a:'Natural muscle gain is slow: beginners can gain 1–1.5 kg of muscle/month, intermediates 0.5–1 kg/month, advanced 0.25–0.5 kg/month. This is why lean bulking (slow surplus) is superior to aggressive bulking — exceeding these rates just adds fat without additional muscle.'},
]

export default function LeanBulkCutCalculator({meta,category}){
  const catColor=category?.color||'#3b82f6'
  const[unit,setUnit]=useState('metric')
  const[hCm,setHCm]=useState(178);const[hFt,setHFt]=useState(5);const[hIn,setHIn]=useState(10)
  const[wKg,setWKg]=useState(80);const[wLbs,setWLbs]=useState(176)
  const[age,setAge]=useState(26);const[sex,setSex]=useState('male')
  const[activityKey,setActivityKey]=useState('mod');const[phaseKey,setPhaseKey]=useState('lean')
  const[openFaq,setOpenFaq]=useState(null)

  function handleUnit(u){if(u===unit)return;if(u==='imperial'){const ti=Math.round(hCm/2.54);setHFt(Math.floor(ti/12));setHIn(ti%12);setWLbs(Math.round(wKg*2.20462))}else{setHCm(clamp(Math.round((hFt*12+hIn)*2.54),100,250));setWKg(clamp(Math.round(wLbs/2.20462),20,300))};setUnit(u)}

  const isM=unit==='metric';const hM=isM?hCm/100:(hFt*12+hIn)*0.0254;const wKgVal=isM?wKg:wLbs/2.20462;const hCmVal=hM*100
  const bmr=sex==='male'?10*wKgVal+6.25*hCmVal-5*age+5:10*wKgVal+6.25*hCmVal-5*age-161
  const tdee=bmr*(ACTIVITY.find(a=>a.key===activityKey)?.factor||1.55)
  const phase=PHASES.find(p=>p.key===phaseKey)||PHASES[2]
  const targetKcal=Math.round(tdee+phase.adj)
  const proteinG=Math.round(wKgVal*phase.proteinMult)
  const proteinKcal=proteinG*4
  const remaining=targetKcal-proteinKcal
  const carbsG=Math.round((remaining*phase.carbPct*4)/4) // rough
  const fatG=Math.round((remaining*(phase.fatPct/(phase.carbPct+phase.fatPct)))/9)
  const wkChange=phase.rate
  const hint=`Phase: ${phase.label}. Target: ${targetKcal.toLocaleString()} kcal/day. Protein: ${proteinG}g, Carbs: ${carbsG}g, Fat: ${fatG}g. Rate: ${wkChange>0?'+':''}${wkChange} kg/week.`

  // Slide 1: calorie target
  const Slide1=()=>(
    <div>
      <div style={{display:'flex',alignItems:'flex-end',gap:12,marginBottom:14}}>
        <div>
          <div style={{fontSize:48,fontWeight:700,lineHeight:1,color:phase.color,fontFamily:"'Space Grotesk',sans-serif"}}>{targetKcal.toLocaleString()}</div>
          <div style={{fontSize:11,color:'var(--text-3)',marginTop:3}}>kcal/day</div>
        </div>
        <div style={{paddingBottom:6}}>
          <div style={{display:'inline-flex',alignItems:'center',gap:6,padding:'5px 12px 5px 8px',borderRadius:20,background:phase.color+'18',border:`1px solid ${phase.color}35`}}>
            <div style={{width:8,height:8,borderRadius:'50%',background:phase.color}}/>
            <span style={{fontSize:12,fontWeight:700,color:phase.color}}>{phase.label}</span>
          </div>
          <div style={{fontSize:11,color:'var(--text-3)',marginTop:5}}>{phase.adj>0?`+${phase.adj}`:phase.adj} kcal vs TDEE {`(${Math.round(tdee).toLocaleString()} kcal)`}</div>
        </div>
      </div>
      {[{label:'BMR',val:Math.round(bmr),color:'#0ea5e9'},{label:'TDEE',val:Math.round(tdee),color:catColor},{label:'Target',val:targetKcal,color:phase.color}].map((r,i)=>{
        const max=Math.max(bmr,tdee,targetKcal)*1.1
        return(<div key={i} style={{marginBottom:8}}><div style={{display:'flex',justifyContent:'space-between',fontSize:11,marginBottom:3}}><span style={{color:'var(--text-2)'}}>{r.label}</span><span style={{fontWeight:700,color:r.color}}>{r.val.toLocaleString()} kcal</span></div><div style={{height:5,background:'var(--border)',borderRadius:3}}><div style={{height:'100%',width:`${(r.val/max)*100}%`,background:r.color,borderRadius:3,transition:'width .4s'}}/></div></div>)
      })}
    </div>
  )

  // Slide 2: macro split
  const Slide2=()=>(
    <div>
      <div style={{fontSize:10,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:12}}>Macro targets for {phase.label.toLowerCase()}</div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
        {[{name:'Protein',g:proteinG,color:'#22a355',note:`${phase.proteinMult}g/kg — muscle preservation`},{name:'Carbs',g:carbsG,color:'#f59e0b',note:'Training fuel'},{name:'Fat',g:fatG,color:'#8b5cf6',note:'Hormones + vitamins'}].map((m,i)=>(
          <div key={i} style={{background:'var(--bg-raised)',borderRadius:9,padding:'10px 11px',border:'0.5px solid var(--border)'}}>
            <div style={{fontSize:10,color:m.color,fontWeight:700,marginBottom:3}}>{m.name}</div>
            <div style={{fontSize:22,fontWeight:700,color:'var(--text)',fontFamily:"'Space Grotesk',sans-serif"}}>{m.g}g</div>
            <div style={{fontSize:9,color:'var(--text-3)',marginTop:3,lineHeight:1.4}}>{m.note}</div>
          </div>
        ))}
      </div>
      <div style={{marginTop:12,padding:'8px 12px',background:'var(--bg-raised)',borderRadius:8,border:'0.5px solid var(--border)'}}>
        <div style={{fontSize:10,color:'var(--text-3)',marginBottom:4}}>Calorie check: {proteinG*4}+{carbsG*4}+{fatG*9} = {(proteinG*4+carbsG*4+fatG*9).toLocaleString()} kcal</div>
        <div style={{display:'flex',gap:2,height:6,borderRadius:3,overflow:'hidden'}}>
          <div style={{flex:proteinG*4,background:'#22a355',borderRadius:2}}/>
          <div style={{flex:carbsG*4,background:'#f59e0b',borderRadius:2}}/>
          <div style={{flex:fatG*9,background:'#8b5cf6',borderRadius:2}}/>
        </div>
      </div>
    </div>
  )

  // Slide 3: weekly change projection
  const Slide3=()=>(
    <div>
      <div style={{fontSize:10,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:12}}>Weekly progress at {phase.label.toLowerCase()} pace</div>
      <div style={{display:'flex',flexDirection:'column',gap:5}}>
        {[1,2,4,8,12].map(w=>{
          const change=wkChange*w; const curr=wKgVal+change
          return(<div key={w} style={{display:'flex',alignItems:'center',gap:10,padding:'7px 11px',borderRadius:7,background:'var(--bg-raised)',border:'0.5px solid var(--border)'}}>
            <div style={{width:52,fontSize:11,fontWeight:600,color:'var(--text)',flexShrink:0}}>Week {w}</div>
            <div style={{flex:1,height:5,background:'var(--border)',borderRadius:3}}>
              {change!==0&&<div style={{height:'100%',width:`${Math.min(Math.abs(change/wkChange/12)*100,100)}%`,background:phase.color,borderRadius:3}}/>}
            </div>
            <div style={{fontSize:11,fontWeight:700,color:phase.color,minWidth:120,textAlign:'right'}}>
              {fmtKg(curr)} ({change>0?'+':''}{fmtKg(change)})
            </div>
          </div>)
        })}
      </div>
    </div>
  )

  // Slide 4: all phases compared
  const Slide4=()=>(
    <div>
      <div style={{fontSize:10,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:10}}>All phases compared</div>
      <div style={{display:'flex',flexDirection:'column',gap:6}}>
        {PHASES.map((p,i)=>{
          const kcal=Math.round(tdee+p.adj)
          const isActive=p.key===phaseKey
          return(<div key={i} style={{padding:'10px 12px',borderRadius:8,background:isActive?p.color+'12':'var(--bg-raised)',border:`${isActive?'1.5':'0.5'}px solid ${isActive?p.color:'var(--border)'}`}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}>
              <span style={{fontSize:12,fontWeight:700,color:p.color}}>{p.label}</span>
              <span style={{fontSize:12,fontWeight:700,color:'var(--text)'}}>{kcal.toLocaleString()} kcal</span>
            </div>
            <div style={{display:'flex',gap:12,fontSize:10,color:'var(--text-3)'}}>
              <span>{p.sub}</span>
              <span>{p.rate>0?`+${p.rate}`:p.rate} kg/week</span>
              <span>Protein: {Math.round(wKgVal*p.proteinMult)}g/day</span>
            </div>
          </div>)
        })}
      </div>
    </div>
  )

  const slides=[
    {label:'Calorie target',     content:<Slide1/>},
    {label:'Macro split',        content:<Slide2/>},
    {label:'Weekly projection',  content:<Slide3/>},
    {label:'All phases',         content:<Slide4/>},
  ]

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
          <div style={{fontSize:12,fontWeight:600,color:'var(--text-2)',marginBottom:8,fontFamily:"'DM Sans',sans-serif"}}>Phase</div>
          <div style={{display:'flex',flexDirection:'column',gap:6}}>
            {PHASES.map(p=>(<button key={p.key} onClick={()=>setPhaseKey(p.key)} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 13px',borderRadius:8,border:`1.5px solid ${phaseKey===p.key?p.color:'var(--border-2)'}`,background:phaseKey===p.key?p.color+'12':'var(--bg-raised)',cursor:'pointer',fontFamily:"'DM Sans',sans-serif",textAlign:'left'}}>
              <div>
                <div style={{fontSize:12,fontWeight:700,color:phaseKey===p.key?p.color:'var(--text)'}}>{p.label}</div>
                <div style={{fontSize:10,color:'var(--text-3)'}}>{p.sub}</div>
              </div>
              <div style={{textAlign:'right',flexShrink:0}}>
                <div style={{fontSize:11,fontWeight:700,color:phaseKey===p.key?p.color:'var(--text-3)'}}>{p.adj>0?`+${p.adj}`:p.adj===0?'TDEE':p.adj} kcal</div>
                <div style={{fontSize:9,color:'var(--text-3)'}}>{p.rate>0?`+${p.rate}`:p.rate} kg/wk</div>
              </div>
            </button>))}
          </div>
        </div>
      </>}
      right={<>
        <InsightRotator catColor={phase.color} title="Phase Results" slides={slides} autoMs={4000}/>
        <BreakdownTable title="Phase Summary" rows={[
          {label:'Phase',          value:phase.label,                                      bold:true,highlight:true,color:phase.color},
          {label:'Daily calories', value:`${targetKcal.toLocaleString()} kcal`,            color:phase.color},
          {label:'vs TDEE',        value:`${phase.adj>0?'+':''}${phase.adj} kcal`,         color:phase.color},
          {label:'Protein',        value:`${proteinG}g (${phase.proteinMult}g/kg)`,        color:'#22a355'},
          {label:'Carbohydrates',  value:`${carbsG}g`},
          {label:'Fat',            value:`${fatG}g`},
          {label:'Weight change',  value:`${phase.rate>0?'+':''}${phase.rate} kg/week`,    color:phase.color},
        ]}/>
        <AIHintCard hint={hint}/>
      </>}
    />

    <Sec title="Key terms explained" sub="Click any to expand">
      <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:8}}>
        {GLOSSARY.map((g,i)=><GlsTerm key={i} term={g.term} def={g.def} catColor={catColor}/>)}
      </div>
    </Sec>

    <HealthJourneyNext catColor={catColor} intro="Phase selected. Now build the full nutrition and tracking plan." items={JOURNEY_ITEMS}/>

    <Sec title="Frequently asked questions" sub="Everything about bulk, cut, and lean bulk">
      {FAQ.map((f,i)=>(<Acc key={i} q={f.q} a={f.a} open={openFaq===i} onToggle={()=>setOpenFaq(openFaq===i?null:i)} catColor={catColor}/>))}
    </Sec>
  </div>)
}
