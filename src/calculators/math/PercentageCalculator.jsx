import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'

const clamp = (v,a,b)=>Math.min(b,Math.max(a,v))
const fmt = n => isNaN(n)||!isFinite(n)?'—':Number.isInteger(n)?String(n):parseFloat(n.toFixed(6)).toString()

const MODES = [
  { v:'whatpct',  label:'What is X% of Y?',          sym:'%×',  color:'#3b82f6', formula:'Result = (X/100) × Y',       eg:'What is 20% of 150?' },
  { v:'xofywhat', label:'X is what % of Y?',          sym:'?%',  color:'#10b981', formula:'Percent = (X/Y) × 100',      eg:'12 is what % of 80?' },
  { v:'xpctY',    label:'X% of what equals Y?',       sym:'÷%',  color:'#f59e0b', formula:'Whole = Y / (X/100)',         eg:'30% of what is 45?' },
  { v:'addpct',   label:'Add X% to Y',                sym:'Y+%', color:'#8b5cf6', formula:'Result = Y × (1 + X/100)',    eg:'Add 15% tax to ₹200' },
  { v:'subpct',   label:'Subtract X% from Y',         sym:'Y−%', color:'#ec4899', formula:'Result = Y × (1 − X/100)',    eg:'20% off ₹500 jacket' },
]

function compute(mode,x,y){
  const pct=x,whole=y
  if(mode==='whatpct')  { const r=(pct/100)*whole; return { result:r, steps:[{label:'Write the formula',math:'Result = (X / 100) × Y',note:'Percentage means "per hundred" — divide by 100 first'},{label:'Substitute values',math:`Result = (${pct} / 100) × ${whole}`,note:'Plug in your numbers'},{label:'Simplify',math:`Result = ${pct/100} × ${whole}`,note:`${pct} ÷ 100 = ${pct/100}`},{label:'Calculate',math:`Result = ${fmt(r)}`,note:`${pct/100} × ${whole} = ${fmt(r)}`}] }}
  if(mode==='xofywhat') { const r=(pct/whole)*100; return { result:r, unit:'%', steps:[{label:'Write the formula',math:'Percent = (X / Y) × 100',note:'Divide the part by the whole, then multiply by 100'},{label:'Substitute',math:`Percent = (${pct} / ${whole}) × 100`},{label:'Divide',math:`Percent = ${fmt(pct/whole)} × 100`,note:`${pct} ÷ ${whole} = ${fmt(pct/whole)}`},{label:'Multiply by 100',math:`Percent = ${fmt(r)}%`}] }}
  if(mode==='xpctY')    { const r=whole/(pct/100); return { result:r, steps:[{label:'Write the formula',math:'Whole = Y ÷ (X / 100)',note:'We know the percentage and the part — solve for the whole'},{label:'Substitute',math:`Whole = ${whole} ÷ (${pct} / 100)`},{label:'Simplify divisor',math:`Whole = ${whole} ÷ ${pct/100}`},{label:'Divide',math:`Whole = ${fmt(r)}`}] }}
  if(mode==='addpct')   { const r=whole*(1+pct/100); return { result:r, steps:[{label:'Write the formula',math:'Result = Y × (1 + X/100)',note:'Adding a percentage means multiplying by (1 + the decimal)'},{label:'Convert %',math:`1 + ${pct}/100 = 1 + ${pct/100} = ${1+pct/100}`},{label:'Multiply',math:`Result = ${whole} × ${1+pct/100} = ${fmt(r)}`},{label:'Increase amount',math:`Increase = ${fmt(r-whole)} (the ${pct}% portion)`,note:`${fmt(r)} − ${whole} = ${fmt(r-whole)}`}] }}
  if(mode==='subpct')   { const r=whole*(1-pct/100); return { result:r, steps:[{label:'Write the formula',math:'Result = Y × (1 − X/100)',note:'Subtracting a percentage means multiplying by (1 minus the decimal)'},{label:'Convert %',math:`1 − ${pct}/100 = 1 − ${pct/100} = ${1-pct/100}`},{label:'Multiply',math:`Result = ${whole} × ${1-pct/100} = ${fmt(r)}`},{label:'Amount saved',math:`Saving = ${fmt(whole-r)} (the ${pct}% removed)`,note:`${whole} − ${fmt(r)} = ${fmt(whole-r)}`}] }}
  return { result:0, steps:[] }
}

const REAL_WORLD=[
  {icon:'🛒',field:'Shopping Discounts',desc:'Every sale tag uses percentage. A 30% discount on ₹2,000 saves ₹600. Understanding this helps you quickly calculate what you actually pay vs what you save.',example:'30% off ₹2,000 = you pay ₹1,400',color:'#f59e0b'},
  {icon:'🏦',field:'Bank Interest',desc:'Savings accounts, FDs, and loans all use percentages. A 6.5% annual interest rate on ₹10,000 earns ₹650 per year. Knowing how to calculate this is essential for financial decisions.',example:'6.5% of ₹10,000 = ₹650 interest/year',color:'#10b981'},
  {icon:'📊',field:'Marks & Grades',desc:'Your exam score is always a percentage. If you got 68 out of 80, that is (68/80)×100 = 85%. Rank cutoffs, scholarship percentages, and grade boundaries all use this calculation.',example:'68/80 = 85% — determines your grade',color:'#3b82f6'},
  {icon:'🍕',field:'Tips & Service Charge',desc:'A 10% tip on a ₹450 restaurant bill is ₹45. A 12.5% service charge on ₹1,200 is ₹150. You should be able to calculate these mentally — or at least quickly verify the bill.',example:'10% of ₹450 = ₹45 tip',color:'#8b5cf6'},
  {icon:'📈',field:'Business & Tax',desc:'GST at 18% on goods, income tax slabs, profit margins — all percentages. A business adding 18% GST to a ₹500 base price charges ₹590 total.',example:'₹500 + 18% GST = ₹590',color:'#ec4899'},
  {icon:'🏥',field:'Medicine & Dosage',desc:'Drug concentrations are percentages: a 5% saline solution is 5g of salt per 100ml. Doctors calculate dosages as a percentage of body weight. Precision here is critical.',example:'5% of 200ml = 10ml of active ingredient',color:'#ef4444'},
]

const MISTAKES=[
  'Confusing "X% of Y" with "X is what % of Y" — these are completely different calculations',
  'Forgetting to divide by 100 before multiplying (writing 20 × 500 instead of 0.20 × 500)',
  'Adding the percentage to the original using the wrong formula — always multiply by (1 + decimal), not add the raw number',
  'Mixing up percentage points and percentages — "interest rose from 5% to 6%" is a 1 percentage point rise but a 20% increase',
]

const GLOSSARY=[
  {term:'Percentage',def:'A ratio expressed as a fraction of 100. "Per cent" literally means "per hundred" in Latin. 45% = 45/100 = 0.45.'},
  {term:'Base / Whole',def:'The original number you are calculating the percentage of. In "what is 20% of 150?" — 150 is the base.'},
  {term:'Part',def:'The portion of the whole. In "15 is 30% of 50" — 15 is the part.'},
  {term:'Rate',def:'The percentage itself — the number followed by the % symbol. In the same example, 30% is the rate.'},
  {term:'Percentage point',def:'An absolute difference between two percentages. Going from 5% to 8% is a 3 percentage point increase — but a 60% relative increase.'},
  {term:'Markup vs Discount',def:'Markup adds a percentage to a base (cost price → selling price). Discount subtracts a percentage from a base (RRP → sale price).'},
]
const FAQ=[
  {q:'What is the difference between percentage and percentage points?',a:'If interest rates rise from 4% to 6%, that is a 2 percentage point increase. But the relative percentage increase is (2/4)×100 = 50%. Percentage points measure absolute difference; percentage change measures relative change. News and finance articles often confuse the two intentionally.'},
  {q:'How do I work out a percentage in my head?',a:'Two tricks: (1) 10% of anything is just move the decimal one place left — 10% of 340 is 34. Then scale: 20% = 34×2 = 68, 5% = 34÷2 = 17. (2) 1% of anything is divide by 100. Then multiply by the percentage you need.'},
  {q:'Why does adding 50% and then removing 50% not give back the original?',a:'Because the base changes. Adding 50% to 100 gives 150. Removing 50% from 150 gives 75 — not 100. This is why "buy 50% more, then 33% off" deals are designed: the operations do not cancel.'},
  {q:'When would I use the "X% of what equals Y" mode?',a:'Any reverse percentage problem: "After a 20% discount the price is ₹400 — what was the original price?" or "After adding 18% GST the total is ₹590 — what is the pre-tax amount?" These are extremely common in commerce and banking.'},
]

function Sec({title,sub,children}){return(<div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,overflow:'hidden'}}><div style={{padding:'13px 18px',borderBottom:'0.5px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center'}}><span style={{fontSize:13,fontWeight:700,color:'var(--text)',fontFamily:"'Space Grotesk',sans-serif"}}>{title}</span>{sub&&<span style={{fontSize:11,color:'var(--text-3)'}}>{sub}</span>}</div><div style={{padding:'16px 18px'}}>{children}</div></div>)}
function Acc({q,a,open,onToggle,color}){return(<div style={{borderBottom:'0.5px solid var(--border)'}}><button onClick={onToggle} style={{width:'100%',display:'flex',justifyContent:'space-between',alignItems:'center',padding:'13px 0',background:'none',border:'none',cursor:'pointer',gap:12,textAlign:'left'}}><span style={{fontSize:13,fontWeight:600,color:'var(--text)',fontFamily:"'DM Sans',sans-serif",lineHeight:1.4}}>{q}</span><span style={{fontSize:18,color,flexShrink:0,display:'inline-block',transform:open?'rotate(45deg)':'none',transition:'transform .2s'}}>+</span></button>{open&&<p style={{fontSize:12.5,color:'var(--text-2)',lineHeight:1.75,margin:'0 0 13px',fontFamily:"'DM Sans',sans-serif"}}>{a}</p>}</div>)}
function StepsCard({steps,color}){const[exp,setExp]=useState(false);if(!steps||!steps.length)return null;const vis=exp?steps:steps.slice(0,2);return(<div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,overflow:'hidden'}}><div style={{padding:'12px 18px',borderBottom:'0.5px solid var(--border)',display:'flex',justifyContent:'space-between'}}><span style={{fontSize:13,fontWeight:700,color:'var(--text)',fontFamily:"'Space Grotesk',sans-serif"}}>Step-by-step working</span><span style={{fontSize:11,color:'var(--text-3)'}}>{steps.length} steps</span></div><div style={{padding:'16px 18px',display:'flex',flexDirection:'column',gap:14}}>{vis.map((s,i)=>(<div key={i} style={{display:'flex',gap:14,alignItems:'flex-start'}}><div style={{width:26,height:26,borderRadius:'50%',flexShrink:0,background:i===steps.length-1?color:color+'18',border:`1.5px solid ${color}40`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,color:i===steps.length-1?'#fff':color}}>{i===steps.length-1?'✓':i+1}</div><div style={{flex:1}}>{s.label&&<div style={{fontSize:10,fontWeight:700,color,textTransform:'uppercase',letterSpacing:'.06em',marginBottom:4}}>{s.label}</div>}<div style={{fontSize:13,fontFamily:"'Space Grotesk',sans-serif",fontWeight:i===steps.length-1?700:500,background:'var(--bg-raised)',padding:'8px 12px',borderRadius:8,border:`0.5px solid ${i===steps.length-1?color+'40':'var(--border)'}`}}>{s.math}</div>{s.note&&<div style={{fontSize:11.5,color:'var(--text-3)',marginTop:4,fontStyle:'italic'}}>↳ {s.note}</div>}</div></div>))}{steps.length>2&&<button onClick={()=>setExp(e=>!e)} style={{padding:'9px',borderRadius:9,border:`1px solid ${color}30`,background:color+'08',color,fontSize:12,fontWeight:600,cursor:'pointer'}}>{exp?'▲ Hide steps':`▼ Show all ${steps.length} steps`}</button>}</div></div>)}

function MathInput({label,value,onChange,hint,color,unit}){const[f,setF]=useState(false);return(<div style={{marginBottom:14}}><div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}><label style={{fontSize:12.5,fontWeight:600,color:'var(--text)',fontFamily:"'DM Sans',sans-serif"}}>{label}</label>{hint&&<span style={{fontSize:10,color:'var(--text-3)'}}>{hint}</span>}</div><div style={{display:'flex',alignItems:'stretch',height:44,border:`1.5px solid ${f?color:'var(--border-2)'}`,borderRadius:9,overflow:'hidden',background:'var(--bg-card)',transition:'border-color .15s'}}><input type="number" value={value} onChange={e=>onChange(e.target.value===''?'':Number(e.target.value))} onFocus={()=>setF(true)} onBlur={()=>setF(false)} style={{flex:1,border:'none',background:'transparent',padding:'0 14px',fontSize:17,fontWeight:700,color:'var(--text)',outline:'none',fontFamily:"'Space Grotesk',sans-serif"}}/>{unit&&<div style={{padding:'0 12px',display:'flex',alignItems:'center',background:'var(--bg-raised)',borderLeft:'1px solid var(--border)',fontSize:13,fontWeight:600,color:'var(--text-3)'}}>{unit}</div>}</div></div>)}

export default function PercentageCalculator({meta,category}){
  const catColor=category?.color||'#3b82f6'
  const[mode,setMode]=useState('whatpct')
  const[x,setX]=useState(20)
  const[y,setY]=useState(150)
  const[openFaq,setOpenFaq]=useState(null)
  const[openGloss,setOpenGloss]=useState(null)
  const modeObj=MODES.find(m=>m.v===mode)||MODES[0]
  const{result,steps,unit}=compute(mode,Number(x)||0,Number(y)||0)
  const hint=`${modeObj.label}: X=${x}%, Y=${y} → ${fmt(result)}${unit||''}`
  const pctVis=mode==='whatpct'?clamp((Number(x)||0)/100,0,1):mode==='xofywhat'?clamp(result/100,0,1):0.5

  return(<div style={{display:'flex',flexDirection:'column',gap:20}}>
    {/* formula card */}
    <div style={{background:`linear-gradient(135deg,${catColor}12,${catColor}06)`,border:`1px solid ${catColor}30`,borderRadius:14,padding:'16px 20px'}}>
      <div style={{fontSize:10,fontWeight:700,color:catColor,textTransform:'uppercase',letterSpacing:'.08em',marginBottom:6}}>Formula</div>
      <div style={{fontSize:17,fontWeight:700,color:catColor,fontFamily:"'Space Grotesk',sans-serif"}}>{modeObj.formula}</div>
      <div style={{fontSize:11,color:'var(--text-3)',marginTop:4}}>{modeObj.eg}</div>
    </div>

    <CalcShell left={<>
      <div style={{fontSize:12,fontWeight:600,color:'var(--text-2)',marginBottom:10,fontFamily:"'DM Sans',sans-serif"}}>What do you want to calculate?</div>
      <div style={{display:'flex',flexDirection:'column',gap:6,marginBottom:18}}>
        {MODES.map(m=>(<button key={m.v} onClick={()=>setMode(m.v)} style={{padding:'10px 14px',borderRadius:9,border:`1.5px solid ${mode===m.v?m.color:'var(--border-2)'}`,background:mode===m.v?m.color+'12':'var(--bg-raised)',cursor:'pointer',textAlign:'left',fontFamily:"'DM Sans',sans-serif"}}><div style={{fontSize:12,fontWeight:mode===m.v?700:500,color:mode===m.v?m.color:'var(--text)'}}>{m.label}</div></button>))}
      </div>
      <div style={{borderTop:'0.5px solid var(--border)',paddingTop:16}}>
        <MathInput label="X — the percentage" value={x} onChange={setX} unit="%" color={catColor} hint="e.g. 20" />
        <MathInput label="Y — the number" value={y} onChange={setY} color={catColor} hint="e.g. 150" />
      </div>
      <div style={{borderTop:'0.5px solid var(--border)',paddingTop:14,marginTop:4}}>
        <div style={{fontSize:10,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:10}}>🎯 Quick examples</div>
        {[{x:10,y:200,label:'10% of 200'},{x:25,y:80,label:'25% of 80'},{x:15,y:1000,label:'15% tip on ₹1,000'},{x:18,y:500,label:'18% GST on ₹500'}].map((ex,i)=>(<button key={i} onClick={()=>{setX(ex.x);setY(ex.y)}} style={{display:'block',width:'100%',padding:'8px 12px',borderRadius:8,border:'1px solid var(--border-2)',background:'var(--bg-raised)',cursor:'pointer',textAlign:'left',marginBottom:6,fontSize:12,color:'var(--text)',fontFamily:"'DM Sans',sans-serif"}} onMouseEnter={e=>e.currentTarget.style.borderColor=catColor+'60'} onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border-2)'}>{ex.label}</button>))}
      </div>
    </>} right={<>
      <div style={{background:'var(--bg-card)',border:`1.5px solid ${catColor}30`,borderRadius:14,padding:'18px 20px',marginBottom:14}}>
        <div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:10}}>Result</div>
        <div style={{fontSize:52,fontWeight:700,color:catColor,fontFamily:"'Space Grotesk',sans-serif",lineHeight:1}}>{fmt(result)}{unit||''}</div>
        <div style={{fontSize:12,color:'var(--text-3)',marginTop:6}}>{modeObj.eg}</div>
        <div style={{marginTop:14,padding:'10px 13px',background:catColor+'08',borderRadius:9,border:`1px solid ${catColor}20`,fontSize:12,color:'var(--text-2)',lineHeight:1.65}}>
          💡 {mode==='whatpct'&&`${x}% of ${y} is ${fmt(result)} — that is ${x} out of every 100 units, applied to ${y}.`}
          {mode==='xofywhat'&&`${x} is ${fmt(result)}% of ${y} — for every 100 units of ${y}, you have ${fmt(result)} of them.`}
          {mode==='xpctY'&&`If ${x}% equals ${y}, then the whole must be ${fmt(result)}.`}
          {mode==='addpct'&&`Adding ${x}% to ${y} gives ${fmt(result)}. The ${x}% portion alone is ${fmt(result-y)}.`}
          {mode==='subpct'&&`After removing ${x}% from ${y}, you have ${fmt(result)}. You saved ${fmt(y-result)}.`}
        </div>
      </div>
      {/* pie visual */}
      <div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,padding:'14px 18px',marginBottom:14}}>
        <div style={{fontSize:12,fontWeight:700,color:'var(--text)',marginBottom:12,fontFamily:"'Space Grotesk',sans-serif"}}>Visual representation</div>
        <svg viewBox="0 0 220 110" width="100%" style={{display:'block'}}>
          <rect x={10} y={20} width={200} height={30} rx={6} fill="var(--border)" opacity="0.5"/>
          <rect x={10} y={20} width={Math.max(4,pctVis*200)} height={30} rx={6} fill={catColor} style={{transition:'width .5s'}}/>
          <text x={110} y={40} textAnchor="middle" fontSize="11" fontWeight="700" fill="#fff">{mode==='xofywhat'?`${fmt(result)}%`:`${x}%`}</text>
          <text x={10} y={70} fontSize="10" fill="var(--text-3)">0</text>
          <text x={210} y={70} textAnchor="end" fontSize="10" fill="var(--text-3)">100%</text>
          <line x1={10} y1={65} x2={210} y2={65} stroke="var(--border)" strokeWidth="0.5"/>
          {[25,50,75].map(t=>(<g key={t}><line x1={10+t*2} y1={63} x2={10+t*2} y2={67} stroke="var(--border)" strokeWidth="1"/><text x={10+t*2} y={76} textAnchor="middle" fontSize="8" fill="var(--text-3)">{t}%</text></g>))}
        </svg>
      </div>
      <BreakdownTable title="Calculation summary" rows={[
        {label:'Result',value:`${fmt(result)}${unit||''}`,bold:true,highlight:true,color:catColor},
        {label:'X (percentage)',value:`${x}%`},
        {label:'Y (number)',value:`${y}`},
        {label:'Formula',value:modeObj.formula},
      ]}/>
      <AIHintCard hint={hint}/>
    </>}/>

    <StepsCard steps={steps} color={catColor}/>

    <Sec title="Where percentages appear in real life" sub="Why this matters">
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
        {REAL_WORLD.map((rw,i)=>(<div key={i} style={{padding:'12px 13px',borderRadius:11,background:rw.color+'08',border:`1px solid ${rw.color}25`}}><div style={{display:'flex',gap:8,alignItems:'center',marginBottom:7}}><span style={{fontSize:18}}>{rw.icon}</span><span style={{fontSize:12,fontWeight:700,color:rw.color}}>{rw.field}</span></div><p style={{fontSize:11.5,color:'var(--text-2)',lineHeight:1.65,margin:'0 0 7px',fontFamily:"'DM Sans',sans-serif"}}>{rw.desc}</p><div style={{fontSize:10,fontWeight:600,color:rw.color,padding:'3px 8px',background:rw.color+'15',borderRadius:6,display:'inline-block'}}>{rw.example}</div></div>))}
      </div>
    </Sec>

    <Sec title="⚠️ Common mistakes to avoid">
      <div style={{display:'flex',flexDirection:'column',gap:8}}>
        {MISTAKES.map((m,i)=>(<div key={i} style={{display:'flex',gap:12,padding:'10px 14px',borderRadius:9,background:'#fee2e210',border:'0.5px solid #ef444420'}}><span style={{fontSize:14,flexShrink:0,color:'#ef4444',fontWeight:700}}>✗</span><span style={{fontSize:12.5,color:'var(--text-2)',lineHeight:1.6}}>{m}</span></div>))}
      </div>
    </Sec>

    <Sec title="Key terms explained" sub="Tap to expand">
      {GLOSSARY.map((g,i)=>(<div key={i} style={{borderBottom:'0.5px solid var(--border)'}}><button onClick={()=>setOpenGloss(openGloss===i?null:i)} style={{width:'100%',display:'flex',justifyContent:'space-between',alignItems:'center',padding:'11px 0',background:'none',border:'none',cursor:'pointer',gap:12,textAlign:'left'}}><div style={{display:'flex',gap:10,alignItems:'center'}}><div style={{width:8,height:8,borderRadius:'50%',background:catColor,flexShrink:0}}/><span style={{fontSize:13,fontWeight:600,color:'var(--text)',fontFamily:"'DM Sans',sans-serif"}}>{g.term}</span></div><span style={{fontSize:16,color:catColor,flexShrink:0,transform:openGloss===i?'rotate(45deg)':'none',transition:'transform .2s'}}>+</span></button>{openGloss===i&&<p style={{fontSize:12.5,color:'var(--text-2)',lineHeight:1.7,margin:'0 0 12px 18px',fontFamily:"'DM Sans',sans-serif"}}>{g.def}</p>}</div>))}
    </Sec>

    <Sec title="Frequently asked questions">
      {FAQ.map((f,i)=>(<Acc key={i} q={f.q} a={f.a} open={openFaq===i} onToggle={()=>setOpenFaq(openFaq===i?null:i)} color={catColor}/>))}
    </Sec>
  </div>)
}
