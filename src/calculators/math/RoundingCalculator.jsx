import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'

// ─── shared helpers ────────────────────────────────────────────
const fmt = n => isNaN(n)||!isFinite(n)?'—':parseFloat(Number(n).toFixed(8)).toString()
const clamp = (v,a,b)=>Math.min(b,Math.max(a,v))
const gcd = (a,b)=>{ a=Math.abs(a);b=Math.abs(b);while(b){[a,b]=[b,a%b]}return a }
const lcm = (a,b)=>Math.abs(a*b)/gcd(a,b)

function Sec({title,sub,children}){return(<div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,overflow:'hidden'}}><div style={{padding:'13px 18px',borderBottom:'0.5px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center'}}><span style={{fontSize:13,fontWeight:700,color:'var(--text)',fontFamily:"'Space Grotesk',sans-serif"}}>{title}</span>{sub&&<span style={{fontSize:11,color:'var(--text-3)'}}>{sub}</span>}</div><div style={{padding:'16px 18px'}}>{children}</div></div>)}
function Acc({q,a,open,onToggle,color}){return(<div style={{borderBottom:'0.5px solid var(--border)'}}><button onClick={onToggle} style={{width:'100%',display:'flex',justifyContent:'space-between',alignItems:'center',padding:'13px 0',background:'none',border:'none',cursor:'pointer',gap:12,textAlign:'left'}}><span style={{fontSize:13,fontWeight:600,color:'var(--text)',fontFamily:"'DM Sans',sans-serif",lineHeight:1.4}}>{q}</span><span style={{fontSize:18,color,flexShrink:0,transform:open?'rotate(45deg)':'none',transition:'transform .2s'}}>+</span></button>{open&&<p style={{fontSize:12.5,color:'var(--text-2)',lineHeight:1.75,margin:'0 0 13px',fontFamily:"'DM Sans',sans-serif"}}>{a}</p>}</div>)}
function StepsCard({steps,color}){const[exp,setExp]=useState(false);if(!steps||!steps.length)return null;const vis=exp?steps:steps.slice(0,2);return(<div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,overflow:'hidden'}}><div style={{padding:'12px 18px',borderBottom:'0.5px solid var(--border)',display:'flex',justifyContent:'space-between'}}><span style={{fontSize:13,fontWeight:700,color:'var(--text)',fontFamily:"'Space Grotesk',sans-serif"}}>Step-by-step working</span><span style={{fontSize:11,color:'var(--text-3)'}}>{steps.length} steps</span></div><div style={{padding:'16px 18px',display:'flex',flexDirection:'column',gap:14}}>{vis.map((s,i)=>(<div key={i} style={{display:'flex',gap:14,alignItems:'flex-start'}}><div style={{width:26,height:26,borderRadius:'50%',flexShrink:0,background:i===steps.length-1?color:color+'18',border:`1.5px solid ${color}40`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,color:i===steps.length-1?'#fff':color}}>{i===steps.length-1?'✓':i+1}</div><div style={{flex:1}}>{s.label&&<div style={{fontSize:10,fontWeight:700,color,textTransform:'uppercase',letterSpacing:'.06em',marginBottom:4}}>{s.label}</div>}<div style={{fontSize:13,fontFamily:"'Space Grotesk',sans-serif",fontWeight:i===steps.length-1?700:500,background:'var(--bg-raised)',padding:'8px 12px',borderRadius:8,border:`0.5px solid ${i===steps.length-1?color+'40':'var(--border)'}`}}>{s.math}</div>{s.note&&<div style={{fontSize:11.5,color:'var(--text-3)',marginTop:4,fontStyle:'italic'}}>↳ {s.note}</div>}</div></div>))}{steps.length>2&&<button onClick={()=>setExp(e=>!e)} style={{padding:'9px',borderRadius:9,border:`1px solid ${color}30`,background:color+'08',color,fontSize:12,fontWeight:600,cursor:'pointer'}}>{exp?'▲ Hide steps':`▼ Show all ${steps.length} steps`}</button>}</div></div>)}
function MathInput({label,value,onChange,hint,color,unit,type='number',placeholder}){const[f,setF]=useState(false);return(<div style={{marginBottom:14}}><div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}><label style={{fontSize:12.5,fontWeight:600,color:'var(--text)',fontFamily:"'DM Sans',sans-serif"}}>{label}</label>{hint&&<span style={{fontSize:10,color:'var(--text-3)'}}>{hint}</span>}</div><div style={{display:'flex',alignItems:'stretch',height:44,border:`1.5px solid ${f?color:'var(--border-2)'}`,borderRadius:9,overflow:'hidden',background:'var(--bg-card)',transition:'border-color .15s'}}><input type={type} value={value} placeholder={placeholder} onChange={e=>onChange(type==='number'?(e.target.value===''?'':Number(e.target.value)):e.target.value)} onFocus={()=>setF(true)} onBlur={()=>setF(false)} style={{flex:1,border:'none',background:'transparent',padding:'0 14px',fontSize:16,fontWeight:600,color:'var(--text)',outline:'none',fontFamily:"'Space Grotesk',sans-serif"}}/>{unit&&<div style={{padding:'0 12px',display:'flex',alignItems:'center',background:'var(--bg-raised)',borderLeft:'1px solid var(--border)',fontSize:13,fontWeight:600,color:'var(--text-3)'}}>{unit}</div>}</div></div>)}
function FormulaCard({formula,desc,color}){return(<div style={{background:`linear-gradient(135deg,${color}12,${color}06)`,border:`1px solid ${color}30`,borderRadius:14,padding:'16px 20px',marginBottom:0}}><div style={{fontSize:10,fontWeight:700,color,textTransform:'uppercase',letterSpacing:'.08em',marginBottom:6}}>Formula</div><div style={{fontSize:17,fontWeight:700,color,fontFamily:"'Space Grotesk',sans-serif"}}>{formula}</div>{desc&&<div style={{fontSize:11,color:'var(--text-3)',marginTop:4}}>{desc}</div>}</div>)}
function RealWorld({items}){return(<div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>{items.map((rw,i)=>(<div key={i} style={{padding:'12px 13px',borderRadius:11,background:rw.color+'08',border:`1px solid ${rw.color}25`}}><div style={{display:'flex',gap:8,alignItems:'center',marginBottom:7}}><span style={{fontSize:18}}>{rw.icon}</span><span style={{fontSize:12,fontWeight:700,color:rw.color}}>{rw.field}</span></div><p style={{fontSize:11.5,color:'var(--text-2)',lineHeight:1.65,margin:'0 0 7px',fontFamily:"'DM Sans',sans-serif"}}>{rw.desc}</p><div style={{fontSize:10,fontWeight:600,color:rw.color,padding:'3px 8px',background:rw.color+'15',borderRadius:6,display:'inline-block'}}>{rw.example}</div></div>))}</div>)}
function MistakesList({items}){return(<div style={{display:'flex',flexDirection:'column',gap:8}}>{items.map((m,i)=>(<div key={i} style={{display:'flex',gap:12,padding:'10px 14px',borderRadius:9,background:'#fee2e210',border:'0.5px solid #ef444420'}}><span style={{fontSize:14,flexShrink:0,color:'#ef4444',fontWeight:700}}>✗</span><span style={{fontSize:12.5,color:'var(--text-2)',lineHeight:1.6}}>{m}</span></div>))}</div>)}
function GlossaryCard({items,color}){const[open,setOpen]=useState(null);return(<>{items.map((g,i)=>(<div key={i} style={{borderBottom:'0.5px solid var(--border)'}}><button onClick={()=>setOpen(open===i?null:i)} style={{width:'100%',display:'flex',justifyContent:'space-between',alignItems:'center',padding:'11px 0',background:'none',border:'none',cursor:'pointer',gap:12,textAlign:'left'}}><div style={{display:'flex',gap:10,alignItems:'center'}}><div style={{width:8,height:8,borderRadius:'50%',background:color,flexShrink:0}}/><span style={{fontSize:13,fontWeight:600,color:'var(--text)',fontFamily:"'DM Sans',sans-serif"}}>{g.term}</span></div><span style={{fontSize:16,color,flexShrink:0,transform:open===i?'rotate(45deg)':'none',transition:'transform .2s'}}>+</span></button>{open===i&&<p style={{fontSize:12.5,color:'var(--text-2)',lineHeight:1.7,margin:'0 0 12px 18px',fontFamily:"'DM Sans',sans-serif"}}>{g.def}</p>}</div>))}</>)}
function BigResult({value,label,unit,color,note}){return(<div style={{background:'var(--bg-card)',border:`1.5px solid ${color}30`,borderRadius:14,padding:'18px 20px',marginBottom:14}}><div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:8}}>{label||'Result'}</div><div style={{fontSize:48,fontWeight:700,color,fontFamily:"'Space Grotesk',sans-serif",lineHeight:1,wordBreak:'break-all'}}>{value}{unit}</div>{note&&<div style={{marginTop:12,padding:'10px 13px',background:color+'08',borderRadius:9,border:`1px solid ${color}20`,fontSize:12,color:'var(--text-2)',lineHeight:1.65}}>💡 {note}</div>}</div>)}

// ═══════════════════════════════════════════════════════════════
//  1. PERCENT ERROR CALCULATOR

export default function RoundingCalculator({meta,category}){
  const C=category?.color||'#3b82f6'
  const[num,setNum]=useState(3.7456)
  const[places,setPlaces]=useState(2)
  const[mode,setMode]=useState('nearest') // nearest | up | down | sigfigs
  const[openFaq,setOpenFaq]=useState(null)

  const n=Number(num)||0
  let result,steps
  if(mode==='nearest'){
    result=Math.round(n*Math.pow(10,places))/Math.pow(10,places)
    const factor=Math.pow(10,places)
    const shifted=n*factor
    const floor=Math.floor(shifted), ceil=Math.ceil(shifted)
    const decimal=(shifted-floor).toFixed(4)
    steps=[
      {label:'Identify rounding place',math:`Rounding to ${places} decimal place${places!==1?'s':''}`,note:`This means keeping ${places} digit${places!==1?'s':''} after the decimal point`},
      {label:'Multiply to shift decimal',math:`${n} × 10^${places} = ${shifted}`,note:`Shifting the decimal ${places} place${places!==1?'s':''} right`},
      {label:'Look at next digit',math:`${shifted} → integer part: ${floor}, decimal part: ${decimal}`,note:`The digit after your rounding place is ${Math.floor(Number(decimal)*10)}`},
      {label:'Apply rounding rule',math:Number(decimal)>=0.5?`${decimal} ≥ 0.5 → round UP to ${ceil}`:`${decimal} < 0.5 → round DOWN to ${floor}`,note:'≥ 5 rounds up, < 5 rounds down (or stays)'},
      {label:'Shift back',math:`${Number(decimal)>=0.5?ceil:floor} ÷ ${factor} = ${result}`,note:'Divide by the same power of 10'},
    ]
  } else if(mode==='up'){
    result=Math.ceil(n*Math.pow(10,places))/Math.pow(10,places)
    steps=[{label:'Always round up (ceiling)',math:`⌈${n} × 10^${places}⌉ ÷ 10^${places} = ${result}`,note:'Ceiling function — always moves to the next higher value'},{label:'Result',math:`${result}`,note:'Useful for: charging customers, calculating required materials'}]
  } else if(mode==='down'){
    result=Math.floor(n*Math.pow(10,places))/Math.pow(10,places)
    steps=[{label:'Always round down (floor)',math:`⌊${n} × 10^${places}⌋ ÷ 10^${places} = ${result}`,note:'Floor function — always drops the trailing digits'},{label:'Result',math:`${result}`,note:'Useful for: tax calculations, conservative estimates'}]
  } else {
    // significant figures
    const sf=places
    const mag=Math.floor(Math.log10(Math.abs(n)||1))
    const factor=Math.pow(10,sf-1-mag)
    result=Math.round(n*factor)/factor
    steps=[{label:'Count significant figures',math:`${sf} significant figures required`,note:'Significant figures count from the first non-zero digit'},{label:'Find magnitude',math:`${n} has ${Math.floor(Math.log10(Math.abs(n)||1))+1} digits before decimal — magnitude = 10^${mag}`},{label:'Calculate factor',math:`Factor = 10^(${sf}-1-${mag}) = ${factor}`},{label:'Round',math:`round(${n} × ${factor}) ÷ ${factor} = ${result}`,note:`${result} has ${sf} significant figures`}]
  }

  return(<div style={{display:'flex',flexDirection:'column',gap:20}}>
    <FormulaCard formula="round(n × 10^d) ÷ 10^d" desc="Shift, round, shift back — the universal rounding algorithm" color={C}/>
    <CalcShell left={<>
      <MathInput label="Number to round" value={num} onChange={setNum} hint="Any decimal" color={C}/>
      <div style={{fontSize:12,fontWeight:600,color:'var(--text-2)',marginBottom:8,fontFamily:"'DM Sans',sans-serif"}}>Rounding method</div>
      <div style={{display:'flex',flexDirection:'column',gap:6,marginBottom:14}}>
        {[{v:'nearest',l:'Round to nearest'},{ v:'up',l:'Always round up (ceiling)'},{v:'down',l:'Always round down (floor)'},{v:'sigfigs',l:'Significant figures'}].map(m=>(<button key={m.v} onClick={()=>setMode(m.v)} style={{padding:'9px 14px',borderRadius:9,border:`1.5px solid ${mode===m.v?C:'var(--border-2)'}`,background:mode===m.v?C+'12':'var(--bg-raised)',cursor:'pointer',textAlign:'left',fontSize:12,fontWeight:mode===m.v?700:500,color:mode===m.v?C:'var(--text)'}}>{m.l}</button>))}
      </div>
      <MathInput label={mode==='sigfigs'?'Significant figures':'Decimal places'} value={places} onChange={v=>setPlaces(Math.max(0,Math.min(10,Math.round(Number(v)))))} hint="0–10" color={C}/>
      <div style={{borderTop:'0.5px solid var(--border)',paddingTop:14,marginTop:4}}>
        <div style={{fontSize:10,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:10}}>🎯 Examples</div>
        {[{n:3.7456,p:2,l:'3.7456 to 2dp'},{n:9.995,p:2,l:'9.995 to 2dp (tricky!)'},{n:12345.6,p:0,l:'12345.6 to nearest whole'},{n:0.00456,p:4,l:'0.00456 to 4dp'}].map((ex,i)=>(<button key={i} onClick={()=>{setNum(ex.n);setPlaces(ex.p)}} style={{display:'block',width:'100%',padding:'8px 12px',borderRadius:8,border:'1px solid var(--border-2)',background:'var(--bg-raised)',cursor:'pointer',textAlign:'left',marginBottom:6,fontSize:12,color:'var(--text)',fontFamily:"'DM Sans',sans-serif"}} onMouseEnter={e=>e.currentTarget.style.borderColor=C+'60'} onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border-2)'}>{ex.l}</button>))}
      </div>
    </>} right={<>
      <BigResult value={fmt(result)} label="Rounded result" color={C} note={`${num} rounded to ${mode==='sigfigs'?places+' significant figures':places+' decimal place'+(places!==1?'s':'')} ${mode==='nearest'?'(nearest)':mode==='up'?'(ceiling)':mode==='down'?'(floor)':''} = ${fmt(result)}`}/>
      {/* number line showing rounding direction */}
      {mode==='nearest'&&(<div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,padding:'14px 18px',marginBottom:14}}>
        <div style={{fontSize:12,fontWeight:700,color:'var(--text)',marginBottom:12,fontFamily:"'Space Grotesk',sans-serif"}}>Number line</div>
        {(()=>{
          const factor=Math.pow(10,places)
          const floor=Math.floor(n*factor)/factor
          const ceil=Math.ceil(n*factor)/factor
          const pos=(n-floor)/(ceil-floor||1)
          return(<div>
            <div style={{position:'relative',height:20,margin:'8px 16px'}}>
              <div style={{position:'absolute',top:8,left:0,right:0,height:3,background:'var(--border)',borderRadius:2}}/>
              <div style={{position:'absolute',top:3,left:0,width:3,height:13,background:'var(--text-3)',borderRadius:2}}/>
              <div style={{position:'absolute',top:3,right:0,width:3,height:13,background:'var(--text-3)',borderRadius:2}}/>
              <div style={{position:'absolute',top:0,left:`${pos*100}%`,transform:'translateX(-50%)',width:16,height:16,borderRadius:'50%',background:C,border:'2px solid #fff'}}/>
              <div style={{position:'absolute',top:3,left:'50%',width:1,height:13,background:'var(--text-3)',opacity:0.3}}/>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:10,color:'var(--text-3)',padding:'0 4px'}}><span>{fmt(floor)}</span><span>midpoint</span><span>{fmt(ceil)}</span></div>
            <div style={{marginTop:8,textAlign:'center',fontSize:12,fontWeight:700,color:C}}>{pos>=0.5?`→ rounds UP to ${fmt(ceil)}`:`→ rounds DOWN to ${fmt(floor)}`}</div>
          </div>)
        })()}
      </div>)}
      <BreakdownTable title="All rounding methods" rows={[{label:'Round to nearest',value:fmt(Math.round(n*Math.pow(10,places))/Math.pow(10,places)),bold:true,highlight:true,color:C},{label:'Round up (ceiling)',value:fmt(Math.ceil(n*Math.pow(10,places))/Math.pow(10,places))},{label:'Round down (floor)',value:fmt(Math.floor(n*Math.pow(10,places))/Math.pow(10,places))},{label:'Original',value:fmt(n)}]}/>
      <AIHintCard hint={`${num} → ${fmt(result)} (${mode}, ${places}${mode==='sigfigs'?' sig figs':' dp'})`}/>
    </>}/>
    <StepsCard steps={steps} color={C}/>
    <Sec title="⚠️ Common mistakes"><MistakesList items={['Rounding intermediate steps too early — only round the final answer','Confusing decimal places (after decimal) with significant figures (from first non-zero digit)','Rounding 2.45 to 1dp as 2.4 — floating point means 2.45 may actually be 2.449999... in computers']}/></Sec>
    <Sec title="Frequently asked questions">
      {[{q:'What is the difference between decimal places and significant figures?',a:'Decimal places count digits after the decimal point: 3.14159 to 2dp = 3.14. Significant figures count from the first non-zero digit: 3.14159 to 3sf = 3.14, but 0.00314159 to 3sf = 0.00314. Significant figures are more useful in science; decimal places are more common in everyday calculations.'},{q:'Why does 2.5 sometimes round to 2 and sometimes to 3?',a:"Banks Rounding (or Banker's Rounding): round half to the nearest even number. So 2.5 rounds to 2 (even) but 3.5 rounds to 4 (even). This reduces cumulative rounding error in financial systems. Most everyday rounding (as in this calculator) uses round-half-up: 2.5 → 3."}].map((f,i)=>(<Acc key={i} q={f.q} a={f.a} open={openFaq===i} onToggle={()=>setOpenFaq(openFaq===i?null:i)} color={C}/>))}
    </Sec>
  </div>)
}

