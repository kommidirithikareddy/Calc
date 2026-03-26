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

export default function RatioCalculator({meta,category}){
  const C=category?.color||'#3b82f6'
  const[a,setA]=useState(3)
  const[b,setB]=useState(4)
  const[mode,setMode]=useState('simplify') // simplify | scale | missing
  const[scaleTo,setScaleTo]=useState(12)
  const[missingPos,setMissingPos]=useState('b') // which is missing in a:b=c:d
  const[c,setC]=useState(9)
  const[openFaq,setOpenFaq]=useState(null)

  const g=gcd(Math.abs(Number(a)||0),Math.abs(Number(b)||0))
  const simpA=g?Math.round((Number(a)||0)/g):0
  const simpB=g?Math.round((Number(b)||0)/g):0
  const decimal=(Number(b)!==0)?(Number(a)/Number(b)).toFixed(4).replace(/\.?0+$/,''):'—'
  const pct=(Number(b)!==0)?((Number(a)/Number(b))*100).toFixed(2).replace(/\.?0+$/,'')+'%':'—'
  const scaledA=(Number(a)!==0)?Math.round((Number(scaleTo)/Number(b))*Number(a)*1000)/1000:0
  const missingVal=missingPos==='b'?(Number(b)*Number(c)/Number(a)):(Number(a)*Number(b)/Number(c))

  const steps=mode==='simplify'?[
    {label:'Write the ratio',math:`${a} : ${b}`,note:'A ratio compares two quantities in the same unit'},
    {label:'Find the GCD',math:`GCD(${Math.abs(Number(a))}, ${Math.abs(Number(b))}) = ${g}`,note:'Greatest Common Divisor — largest number that divides both'},
    {label:'Divide both by GCD',math:`${a} ÷ ${g} = ${simpA}   and   ${b} ÷ ${g} = ${simpB}`},
    {label:'Simplified ratio',math:`${simpA} : ${simpB}`,note:'Both numbers share no common factor other than 1'},
  ]:mode==='scale'?[
    {label:'Original ratio',math:`${a} : ${b}`},
    {label:'Scale factor',math:`Scale = ${scaleTo} ÷ ${b} = ${fmt(Number(scaleTo)/Number(b))}`,note:`To make B = ${scaleTo}, multiply by this factor`},
    {label:'Apply to A',math:`${a} × ${fmt(Number(scaleTo)/Number(b))} = ${scaledA}`},
    {label:'Scaled ratio',math:`${scaledA} : ${scaleTo}`,note:'The ratio is the same, just scaled up'},
  ]:[
    {label:'Set up proportion',math:`${a} : ${b} = ${c} : ?`,note:'In equivalent ratios, cross-products are equal'},
    {label:'Cross multiply',math:`${a} × ? = ${b} × ${c}`},
    {label:'Solve for ?',math:`? = (${b} × ${c}) ÷ ${a} = ${fmt(missingVal)}`},
    {label:'Verify',math:`${a} : ${b} = ${c} : ${fmt(missingVal)} ✓`},
  ]

  return(<div style={{display:'flex',flexDirection:'column',gap:20}}>
    <FormulaCard formula="a : b = (a/GCD) : (b/GCD)" desc="Simplify by dividing both terms by their Greatest Common Divisor" color={C}/>
    <CalcShell left={<>
      <div style={{fontSize:12,fontWeight:600,color:'var(--text-2)',marginBottom:10,fontFamily:"'DM Sans',sans-serif"}}>What do you want to do?</div>
      <div style={{display:'flex',flexDirection:'column',gap:6,marginBottom:16}}>
        {[{v:'simplify',l:'Simplify a ratio'},{v:'scale',l:'Scale a ratio'},{v:'missing',l:'Find missing value (a:b = c:?)'}].map(m=>(<button key={m.v} onClick={()=>setMode(m.v)} style={{padding:'10px 14px',borderRadius:9,border:`1.5px solid ${mode===m.v?C:'var(--border-2)'}`,background:mode===m.v?C+'12':'var(--bg-raised)',cursor:'pointer',textAlign:'left',fontSize:12,fontWeight:mode===m.v?700:500,color:mode===m.v?C:'var(--text)'}}>{m.l}</button>))}
      </div>
      <div style={{borderTop:'0.5px solid var(--border)',paddingTop:16}}>
        <div style={{display:'flex',gap:12,alignItems:'center',marginBottom:14}}>
          <MathInput label="A" value={a} onChange={setA} color={C}/><span style={{fontSize:20,color:'var(--text-3)',paddingTop:20}}>:</span><MathInput label="B" value={b} onChange={setB} color={C}/>
        </div>
        {mode==='scale'&&<MathInput label="Scale B to" value={scaleTo} onChange={setScaleTo} color={C} hint="What should B become?"/>}
        {mode==='missing'&&<MathInput label="C (so A:B = C:?)" value={c} onChange={setC} color={C}/>}
      </div>
      <div style={{borderTop:'0.5px solid var(--border)',paddingTop:14,marginTop:4}}>
        <div style={{fontSize:10,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:10}}>🎯 Examples</div>
        {[{a:3,b:4,l:'Classic 3:4 ratio'},{a:1,b:2,l:'1:2 — halving'},{a:16,b:24,l:'Screen aspect 16:24'},{a:2,b:3,l:'Concrete mix 2:3'}].map((ex,i)=>(<button key={i} onClick={()=>{setA(ex.a);setB(ex.b)}} style={{display:'block',width:'100%',padding:'8px 12px',borderRadius:8,border:'1px solid var(--border-2)',background:'var(--bg-raised)',cursor:'pointer',textAlign:'left',marginBottom:6,fontSize:12,color:'var(--text)',fontFamily:"'DM Sans',sans-serif"}} onMouseEnter={e=>e.currentTarget.style.borderColor=C+'60'} onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border-2)'}>{ex.l}</button>))}
      </div>
    </>} right={<>
      <BigResult value={mode==='simplify'?`${simpA} : ${simpB}`:mode==='scale'?`${scaledA} : ${scaleTo}`:`${c} : ${fmt(missingVal)}`} label={mode==='simplify'?'Simplified ratio':mode==='scale'?'Scaled ratio':'Missing value found'} color={C}
        note={mode==='simplify'?`${a}:${b} simplifies to ${simpA}:${simpB}. For every ${simpA} of A, there are ${simpB} of B.`:mode==='scale'?`When B = ${scaleTo}, A must be ${scaledA} to keep the same ratio ${simpA}:${simpB}.`:`In the proportion ${a}:${b} = ${c}:?, the missing value is ${fmt(missingVal)}.`}/>
      {/* visual proportional bars */}
      <div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,padding:'14px 18px',marginBottom:14}}>
        <div style={{fontSize:12,fontWeight:700,color:'var(--text)',marginBottom:12,fontFamily:"'Space Grotesk',sans-serif"}}>Proportional comparison</div>
        {[{label:'A',val:Number(a),color:C},{label:'B',val:Number(b),color:'#10b981'}].map((bar,i)=>{const mx=Math.max(Number(a),Number(b),1);return(<div key={i} style={{marginBottom:8}}><div style={{display:'flex',justifyContent:'space-between',fontSize:11,marginBottom:3}}><span style={{color:'var(--text-2)'}}>{bar.label}</span><span style={{fontWeight:700,color:bar.color}}>{bar.val}</span></div><div style={{height:10,background:'var(--border)',borderRadius:5,overflow:'hidden'}}><div style={{height:'100%',width:`${clamp((bar.val/mx)*100,2,100)}%`,background:bar.color,borderRadius:5,transition:'width .4s'}}/></div></div>)})}
        <div style={{marginTop:10,fontSize:12,color:'var(--text-3)'}}>As a fraction: {a}/{b} = {decimal} = {pct}</div>
      </div>
      <BreakdownTable title="Summary" rows={[{label:'Simplified',value:`${simpA} : ${simpB}`,bold:true,highlight:true,color:C},{label:'As decimal',value:decimal},{label:'As percentage',value:pct},{label:'GCD',value:String(g)}]}/>
      <AIHintCard hint={`${a}:${b} simplified = ${simpA}:${simpB}, as decimal = ${decimal}`}/>
    </>}/>
    <StepsCard steps={steps} color={C}/>
    <Sec title="Where ratios appear in real life">
      <RealWorld items={[{icon:'🏗️',field:'Construction',desc:'Concrete is mixed at ratios like 1:2:3 (cement:sand:gravel). Getting this ratio wrong affects the strength of the structure.',example:'Concrete mix ratio 1:2:4',color:'#f59e0b'},{icon:'🗺️',field:'Maps & Scale',desc:'A 1:50,000 map means 1cm on paper = 50,000cm (500m) in reality. Architects use 1:100 or 1:50 for building plans.',example:'Map scale 1:50,000',color:'#3b82f6'},{icon:'📸',field:'Aspect Ratios',desc:'16:9 is the standard widescreen ratio. 4:3 is older TV. 9:16 is vertical video for phones.',example:'1920:1080 = 16:9 simplified',color:'#8b5cf6'},{icon:'💊',field:'Pharmacy',desc:'Drug solutions are often expressed as ratios: 1:1000 adrenaline means 1g active ingredient per 1000ml solution.',example:'1:1000 adrenaline solution',color:'#ef4444'}]}/>
    </Sec>
    <Sec title="⚠️ Common mistakes"><MistakesList items={['Reversing the ratio — the order of terms matters. 3:4 is not the same as 4:3','Confusing ratio with fraction — 3:4 means 3 out of every 7 total, not 3 out of 4','When scaling up, multiplying only one term instead of both']}/></Sec>
    <Sec title="Key terms"><GlossaryCard color={C} items={[{term:'Ratio',def:'A comparison of two quantities by division. Written as a:b or a/b. Both quantities must be in the same unit.'},{term:'Proportion',def:'A statement that two ratios are equal: a:b = c:d. Used to find missing values.'},{term:'Equivalent ratios',def:'Ratios that simplify to the same value. 6:4 and 3:2 are equivalent because both simplify to 3:2.'},{term:'Simplest form',def:'A ratio where the two terms share no common factor other than 1.'}]}/></Sec>
    <Sec title="Frequently asked questions">
      {[{q:'What is the difference between a ratio and a fraction?',a:'A ratio compares two quantities: 3:4 means "3 for every 4". A fraction represents a part of a whole: 3/4 means "3 out of 4 equal parts". They look similar but mean different things — a ratio 3:4 means 3 out of a total of 7, not 3 out of 4.'},{q:'When do I use proportion to find a missing value?',a:'When you know one complete ratio and one term of an equivalent ratio. Example: if 3 workers build 4 walls in a day, how many walls do 9 workers build? Set up 3:4 = 9:? → ? = (4×9)/3 = 12. This is the foundation of direct proportion.'}].map((f,i)=>(<Acc key={i} q={f.q} a={f.a} open={openFaq===i} onToggle={()=>setOpenFaq(openFaq===i?null:i)} color={C}/>))}
    </Sec>
  </div>)
}

