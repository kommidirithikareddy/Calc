import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'
import HealthJourneyNext from '../../components/health/HealthJourneyNext'

const clamp=(v,a,b)=>Math.min(b,Math.max(a,v))

const FIBER_FOODS=[
  {name:'Lentils (100g cooked)',g:8},{name:'Black beans (100g)',g:7},{name:'Avocado (half)',g:5},
  {name:'Oats (100g dry)',g:10},{name:'Chia seeds (30g)',g:10},{name:'Broccoli (100g)',g:3},
  {name:'Apple (medium)',g:4},{name:'Whole wheat bread (slice)',g:2},{name:'Almonds (30g)',g:4},
  {name:'Sweet potato (100g)',g:3},
]

const BENCHMARKS=[
  {label:'Average Western diet',  g:15,  note:'Most people fall here — too low',         color:'#ef4444'},
  {label:'WHO minimum',           g:25,  note:'Lower bound of recommendation',            color:'#f59e0b'},
  {label:'WHO optimal',           g:30,  note:'Associated with best health outcomes',     color:'#22a355'},
  {label:'Optimal for gut health',g:35,  note:'Feeds diverse gut microbiome',             color:'#10b981'},
  {label:'High-fibre diet',       g:50,  note:'Plant-heavy diets — no known upper limit', color:'#0ea5e9'},
]

const GLOSSARY=[
  {term:'Dietary Fibre',   def:'Indigestible plant carbohydrates that feed gut bacteria, slow glucose absorption, increase satiety, and reduce colorectal cancer risk.'},
  {term:'Soluble Fibre',   def:'Dissolves in water to form a gel. Slows digestion, lowers LDL cholesterol, stabilises blood sugar. Sources: oats, legumes, fruit.'},
  {term:'Insoluble Fibre', def:'Does not dissolve in water. Adds bulk to stool, speeds intestinal transit, prevents constipation. Sources: wheat bran, vegetables, whole grains.'},
  {term:'Gut Microbiome',  def:'The 40 trillion bacteria living in your gut. Fibre is their primary food source. Diversity of gut bacteria correlates with immune function and mental health.'},
  {term:'Prebiotic',       def:'Non-digestible food component that selectively feeds beneficial gut bacteria. All dietary fibre is prebiotic. High-fibre diets increase Bifidobacterium and Lactobacillus populations.'},
]

const FAQ=[
  {q:'How much fibre should I eat per day?',a:'WHO recommends 25–30g/day for adults. Most Western adults consume only 15–17g. Higher intakes (35–50g+) from whole plant foods are associated with better gut health outcomes. There is no established upper limit for fibre from whole foods, but increasing rapidly can cause gas and bloating — increase gradually over 2–3 weeks.'},
  {q:'What are the best fibre sources?',a:'Legumes (lentils, beans, chickpeas) provide the most fibre per gram: 6–10g per 100g cooked. Whole grains (oats, barley, whole wheat), vegetables, fruit, nuts, and seeds are excellent secondary sources. Fibre supplements (psyllium, inulin) are inferior to whole food sources because they lack the additional micronutrients and phytochemicals.'},
  {q:'Does fibre help with weight loss?',a:'Yes — fibre increases satiety by slowing gastric emptying and stimulating fullness hormones (GLP-1, PYY). Each 14g increase in daily fibre intake is associated with a 10% reduction in energy intake and 1.9 kg of weight loss over 3.8 months (Howarth et al.). High-fibre foods also tend to be lower calorie density.'},
  {q:'Can too much fibre be harmful?',a:'Excess fibre from supplements can interfere with mineral absorption (iron, zinc, calcium) and cause digestive discomfort. However, this is not seen with fibre from whole foods in normal dietary amounts. Athletes with very high calorie needs may need to moderate fibre intake to avoid gut issues during competition. For most people, more fibre is better.'},
]

const JOURNEY_ITEMS=[{title:'Carb Calculator',sub:'Fibre is part of your carb target',icon:'🌾',path:'/health/calories/carb-calculator'},{title:'Water Intake',sub:'Fibre needs more water to work',icon:'💧',path:'/health/calories/water-intake'},{title:'Macro Calculator',sub:'Complete nutrition breakdown',icon:'🥗',path:'/health/calories/macro-calculator'}]

function Sec({title,sub,children}){return(<div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,overflow:'hidden'}}><div style={{padding:'13px 18px',borderBottom:'0.5px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center'}}><span style={{fontSize:13,fontWeight:700,color:'var(--text)',fontFamily:"'Space Grotesk',sans-serif"}}>{title}</span>{sub&&<span style={{fontSize:11,color:'var(--text-3)'}}>{sub}</span>}</div><div style={{padding:'16px 18px'}}>{children}</div></div>)}
function Acc({q,a,open,onToggle,catColor}){return(<div style={{borderBottom:'0.5px solid var(--border)'}}><button onClick={onToggle} style={{width:'100%',display:'flex',justifyContent:'space-between',alignItems:'center',padding:'13px 0',background:'none',border:'none',cursor:'pointer',gap:12,textAlign:'left'}}><span style={{fontSize:13,fontWeight:600,color:'var(--text)',fontFamily:"'DM Sans',sans-serif",lineHeight:1.4}}>{q}</span><span style={{fontSize:18,color:catColor,flexShrink:0,transition:'transform .2s',display:'inline-block',transform:open?'rotate(45deg)':'none'}}>+</span></button>{open&&<p style={{fontSize:12.5,color:'var(--text-2)',lineHeight:1.75,margin:'0 0 13px',fontFamily:"'DM Sans',sans-serif"}}>{a}</p>}</div>)}
function GlsTerm({term,def,catColor}){const[open,setOpen]=useState(false);return(<div onClick={()=>setOpen(o=>!o)} style={{padding:'9px 12px',borderRadius:8,cursor:'pointer',transition:'all .15s',border:`1px solid ${open?catColor+'40':'var(--border)'}`,background:open?catColor+'10':'var(--bg-raised)'}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:8}}><span style={{fontSize:12,fontWeight:700,fontFamily:"'Space Grotesk',sans-serif",color:open?catColor:'var(--text)'}}>{term}</span><span style={{fontSize:14,color:catColor,flexShrink:0}}>{open?'−':'+'}</span></div>{open&&<p style={{fontSize:11.5,color:'var(--text-2)',lineHeight:1.65,margin:'6px 0 0',fontFamily:"'DM Sans',sans-serif"}}>{def}</p>}</div>)}
function Stepper({label,hint,value,onChange,min,max,step=1,unit,catColor}){const[editing,setEditing]=useState(false);const commit=r=>{const n=parseFloat(r);onChange(clamp(isNaN(n)?value:n,min,max));setEditing(false)};const btn={width:38,height:'100%',border:'none',background:'var(--bg-raised)',color:'var(--text)',fontSize:20,fontWeight:300,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontFamily:'inherit'};return(<div style={{marginBottom:16}}><div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}><label style={{fontSize:12.5,fontWeight:600,color:'var(--text)',fontFamily:"'DM Sans',sans-serif"}}>{label}</label>{hint&&<span style={{fontSize:10,color:'var(--text-3)'}}>{hint}</span>}</div><div style={{display:'flex',alignItems:'stretch',height:40,border:`1.5px solid ${editing?catColor:'var(--border-2)'}`,borderRadius:9,overflow:'hidden',background:'var(--bg-card)',transition:'border-color .15s'}}><button onMouseDown={e=>{e.preventDefault();onChange(clamp(value-step,min,max))}} style={{...btn,borderRight:'1px solid var(--border)'}} onMouseEnter={e=>e.currentTarget.style.background=catColor+'18'} onMouseLeave={e=>e.currentTarget.style.background='var(--bg-raised)'}>−</button><div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',gap:5}}>{editing?<input type="number" defaultValue={value} onBlur={e=>commit(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')commit(e.target.value);if(e.key==='Escape')setEditing(false)}} style={{width:'55%',border:'none',background:'transparent',textAlign:'center',fontSize:15,fontWeight:700,color:'var(--text)',outline:'none',fontFamily:"'DM Sans',sans-serif"}} autoFocus/>:<span onClick={()=>setEditing(true)} style={{fontSize:15,fontWeight:700,color:'var(--text)',cursor:'text',minWidth:36,textAlign:'center',fontFamily:"'DM Sans',sans-serif"}}>{value}</span>}<span style={{fontSize:11,color:'var(--text-3)',fontWeight:500}}>{unit}</span></div><button onMouseDown={e=>{e.preventDefault();onChange(clamp(value+step,min,max))}} style={{...btn,borderLeft:'1px solid var(--border)'}} onMouseEnter={e=>e.currentTarget.style.background=catColor+'18'} onMouseLeave={e=>e.currentTarget.style.background='var(--bg-raised)'}>+</button></div></div>)}

export default function FiberCalculator({meta,category}){
  const catColor=category?.color||'#22a355'
  const[age,setAge]=useState(30);const[sex,setSex]=useState('male');const[wKg,setWKg]=useState(75)
  const[currentFiber,setCurrentFiber]=useState(18)
  const[openFaq,setOpenFaq]=useState(null)

  const target=sex==='male'?38:25
  const whoTarget=30
  const gap=Math.max(0,target-currentFiber)
  const status=currentFiber>=target?'Excellent':currentFiber>=whoTarget?'Good':currentFiber>=18?'Low':'Very low'
  const statusColor=currentFiber>=target?'#10b981':currentFiber>=whoTarget?'#22a355':currentFiber>=18?'#f59e0b':'#ef4444'
  const maxVal=55

  const hint=`Daily fibre target: ${target}g (${sex==='male'?'male':'female'}, age ${age}). Current: ${currentFiber}g — ${status}. Gap: ${gap}g. WHO recommends 25–30g; optimal gut health at 35g+.`

  return(<div style={{display:'flex',flexDirection:'column',gap:20}}>
    <CalcShell
      left={<>
        <div style={{marginBottom:0}}>
          <div style={{fontSize:10,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:14}}>About you</div>
          <Stepper label="Age" value={age} onChange={setAge} min={10} max={100} unit="yrs" catColor={catColor}/>
          <Stepper label="Body weight" value={wKg} onChange={setWKg} min={30} max={250} unit="kg" catColor={catColor}/>
        </div>
        <div style={{borderTop:'0.5px solid var(--border)',paddingTop:16,marginTop:4}}>
          <div style={{fontSize:12,fontWeight:600,color:'var(--text-2)',marginBottom:8,fontFamily:"'DM Sans',sans-serif"}}>Biological sex</div>
          <div style={{display:'flex',gap:8}}>
            {[{v:'male',l:'Male'},{v:'female',l:'Female'}].map(o=>(<button key={o.v} onClick={()=>setSex(o.v)} style={{flex:1,padding:'10px',borderRadius:9,border:`1.5px solid ${sex===o.v?catColor:'var(--border-2)'}`,background:sex===o.v?catColor+'12':'var(--bg-raised)',fontSize:12,fontWeight:sex===o.v?700:500,color:sex===o.v?catColor:'var(--text-2)',cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}}>{o.l}</button>))}
          </div>
        </div>
        <div style={{borderTop:'0.5px solid var(--border)',paddingTop:16,marginTop:16}}>
          <Stepper label="Current daily fibre intake" value={currentFiber} onChange={setCurrentFiber} min={0} max={80} unit="g" hint="Your honest estimate" catColor={catColor}/>
          <p style={{fontSize:11,color:'var(--text-3)',marginTop:-8,lineHeight:1.5,fontFamily:"'DM Sans',sans-serif"}}>Not sure? Most people eating a standard Western diet consume 15–18g. High veggie/legume diet: 25–35g.</p>
        </div>
        <div style={{borderTop:'0.5px solid var(--border)',paddingTop:16,marginTop:4}}>
          <div style={{fontSize:12,fontWeight:600,color:'var(--text-2)',marginBottom:8,fontFamily:"'DM Sans',sans-serif"}}>Quick fibre check</div>
          {[
            {q:'Do you eat legumes daily?',points:8},{q:'Do you eat 5+ portions of veg/fruit?',points:10},
            {q:'Do you choose whole grains?',points:7},{q:'Do you eat nuts/seeds daily?',points:5},
          ].map((item,i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'7px 10px',borderRadius:7,background:'var(--bg-raised)',border:'0.5px solid var(--border)',marginBottom:5}}>
              <span style={{fontSize:11,color:'var(--text-2)'}}>{item.q}</span>
              <span style={{fontSize:10,fontWeight:600,color:catColor}}>+{item.points}g</span>
            </div>
          ))}
        </div>
      </>}
      right={<>
        {/* Concept C — Comparison Ticker */}
        <div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,overflow:'hidden',marginBottom:14}}>
          <div style={{padding:'11px 16px',borderBottom:'0.5px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <span style={{fontSize:12,fontWeight:700,color:'var(--text)',fontFamily:"'Space Grotesk',sans-serif"}}>Fibre Intake</span>
            <span style={{fontSize:10,color:'var(--text-3)'}}>You vs benchmarks</span>
          </div>
          <div style={{padding:'16px 18px'}}>
            {/* big number */}
            <div style={{display:'flex',alignItems:'flex-end',gap:12,marginBottom:16}}>
              <div>
                <div style={{fontSize:52,fontWeight:700,lineHeight:1,color:statusColor,fontFamily:"'Space Grotesk',sans-serif",transition:'color .3s'}}>{currentFiber}g</div>
                <div style={{fontSize:11,color:'var(--text-3)',marginTop:3}}>current daily fibre</div>
              </div>
              <div style={{paddingBottom:6}}>
                <div style={{display:'inline-flex',alignItems:'center',gap:6,padding:'5px 12px 5px 8px',borderRadius:20,background:statusColor+'18',border:`1px solid ${statusColor}35`}}>
                  <div style={{width:8,height:8,borderRadius:'50%',background:statusColor}}/>
                  <span style={{fontSize:12,fontWeight:700,color:statusColor,fontFamily:"'DM Sans',sans-serif"}}>{status}</span>
                </div>
                {gap>0&&<div style={{fontSize:11,color:'var(--text-3)',marginTop:5}}>+{gap}g to reach target</div>}
              </div>
            </div>
            {/* your bar */}
            <div style={{display:'flex',alignItems:'center',gap:10,padding:'8px 12px',borderRadius:8,background:statusColor+'12',border:`1.5px solid ${statusColor}`,marginBottom:6}}>
              <div style={{width:120,fontSize:11,fontWeight:700,color:statusColor,flexShrink:0}}>You ← current</div>
              <div style={{flex:1,height:7,background:'var(--border)',borderRadius:3}}>
                <div style={{height:'100%',width:`${(currentFiber/maxVal)*100}%`,background:statusColor,borderRadius:3,transition:'width .5s'}}/>
              </div>
              <div style={{fontSize:12,fontWeight:700,color:statusColor,minWidth:36,textAlign:'right'}}>{currentFiber}g</div>
            </div>
            {/* benchmarks */}
            {BENCHMARKS.map((b,i)=>(
              <div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'7px 12px',borderRadius:8,background:'var(--bg-raised)',border:'0.5px solid var(--border)',marginBottom:4}}>
                <div style={{width:120,flexShrink:0}}>
                  <div style={{fontSize:11,fontWeight:500,color:'var(--text)'}}>{b.label}</div>
                  <div style={{fontSize:9,color:'var(--text-3)'}}>{b.note}</div>
                </div>
                <div style={{flex:1,height:5,background:'var(--border)',borderRadius:3}}>
                  <div style={{height:'100%',width:`${(b.g/maxVal)*100}%`,background:b.color,borderRadius:3,opacity:0.6,transition:'width .5s'}}/>
                </div>
                <div style={{fontSize:11,fontWeight:600,color:'var(--text-2)',minWidth:28,textAlign:'right'}}>{b.g}g</div>
              </div>
            ))}
            {/* target */}
            <div style={{marginTop:8,padding:'8px 12px',background:catColor+'12',borderRadius:8,border:`1px solid ${catColor}30`}}>
              <div style={{fontSize:10,color:catColor,fontWeight:700,marginBottom:2}}>YOUR TARGET (Academy of Nutrition)</div>
              <div style={{fontSize:14,fontWeight:700,color:'var(--text)'}}>{target}g/day <span style={{fontSize:11,fontWeight:400,color:'var(--text-3)'}}>({sex==='male'?'male 19–50yr':'female 19–50yr'})</span></div>
            </div>
          </div>
        </div>
        <BreakdownTable title="Fibre Summary" rows={[
          {label:'Your current intake', value:`${currentFiber}g/day`, bold:true,highlight:true,color:statusColor},
          {label:'Status',              value:status,                  color:statusColor},
          {label:'Your target',         value:`${target}g/day`},
          {label:'Gap to target',       value:gap>0?`+${gap}g needed`:'On target ✓', color:gap>0?'#f59e0b':catColor},
          {label:'WHO recommendation',  value:'25–30g/day'},
          {label:'Optimal gut health',  value:'35g+/day'},
        ]}/>
        <AIHintCard hint={hint}/>
      </>}
    />

    <Sec title="How to add more fibre to your day" sub={`You need +${gap}g more — here's the easiest way`}>
      <p style={{fontSize:12,color:'var(--text-2)',lineHeight:1.7,marginBottom:14,fontFamily:"'DM Sans',sans-serif"}}>The easiest swaps add significant fibre with minimal effort. Start with 2–3 changes and increase gradually over 2 weeks to avoid bloating.</p>
      <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:8}}>
        {FIBER_FOODS.map((f,i)=>{
          const needed=Math.ceil(gap/f.g)
          return(<div key={i} style={{padding:'9px 12px',borderRadius:8,background:'var(--bg-raised)',border:'0.5px solid var(--border)'}}>
            <div style={{fontSize:11,fontWeight:600,color:'var(--text)',marginBottom:2}}>{f.name}</div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <span style={{fontSize:10,color:'var(--text-3)'}}>{f.g}g fibre/serving</span>
              <span style={{fontSize:11,fontWeight:700,color:catColor}}>{needed} serving{needed!==1?'s':''} = +{Math.min(f.g*needed,gap)}g</span>
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

    <HealthJourneyNext catColor={catColor} intro="Fibre is the most overlooked nutrient. Build the rest of your nutrition plan." items={JOURNEY_ITEMS}/>

    <Sec title="Frequently asked questions" sub="Everything about dietary fibre">
      {FAQ.map((f,i)=>(<Acc key={i} q={f.q} a={f.a} open={openFaq===i} onToggle={()=>setOpenFaq(openFaq===i?null:i)} catColor={catColor}/>))}
    </Sec>
  </div>)
}
