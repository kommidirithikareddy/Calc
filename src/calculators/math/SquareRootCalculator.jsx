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

export default function SquareRootCalculator({meta,category}){
  const C=category?.color||'#3b82f6'
  const[num,setNum]=useState(144)
  const[nthRoot,setNthRoot]=useState(2)
  const[openFaq,setOpenFaq]=useState(null)

  const n=Number(num)||0
  const r=Number(nthRoot)||2
  const result=n<0&&r%2===0?null:Math.sign(n)*Math.pow(Math.abs(n),1/r)
  const isPerfect=r===2&&Number.isInteger(Math.sqrt(n))
  const steps=[
    {label:'Identify the operation',math:`${r===2?'√':r===3?'∛':'ⁿ√'}${n} = ${n}^(1/${r})`,note:`Taking the ${r===2?'square':r===3?'cube':r+'th'} root is the same as raising to the power 1/${r}`},
    ...(r===2&&isPerfect?[{label:'Recognise perfect square',math:`${n} = ${Math.sqrt(n)} × ${Math.sqrt(n)}`,note:'A perfect square has an integer square root'},{label:'Result',math:`√${n} = ${fmt(result)}`,note:'Exact answer'}]:[{label:'Calculate',math:`${n}^(1/${r}) = ${fmt(result)}`,note:`Use a calculator or Newton's method for non-perfect values`},{label:'Verify',math:`${fmt(result)}^${r} ≈ ${fmt(Math.pow(Number(fmt(result)),r))}`,note:'Raise result to the original power to check'}]),
  ]

  return(<div style={{display:'flex',flexDirection:'column',gap:20}}>
    <FormulaCard formula={`ⁿ√x = x^(1/n)      √x = x^(1/2)      ∛x = x^(1/3)`} desc="The nth root of x equals x raised to the power 1/n" color={C}/>
    <CalcShell left={<>
      <MathInput label="Number" value={num} onChange={setNum} hint="Can be decimal" color={C}/>
      <div style={{fontSize:12,fontWeight:600,color:'var(--text-2)',marginBottom:10,fontFamily:"'DM Sans',sans-serif"}}>Root type</div>
      <div style={{display:'flex',gap:6,marginBottom:14}}>
        {[{n:2,l:'√ Square'},{n:3,l:'∛ Cube'},{n:4,l:'4th'},{n:5,l:'5th'}].map(rt=>(<button key={rt.n} onClick={()=>setNthRoot(rt.n)} style={{flex:1,padding:'9px 4px',borderRadius:9,border:`1.5px solid ${nthRoot===rt.n?C:'var(--border-2)'}`,background:nthRoot===rt.n?C+'12':'var(--bg-raised)',fontSize:12,fontWeight:nthRoot===rt.n?700:500,color:nthRoot===rt.n?C:'var(--text)',cursor:'pointer'}}>{rt.l}</button>))}
      </div>
      <MathInput label="Or enter custom root (n)" value={nthRoot} onChange={v=>setNthRoot(Math.max(2,Number(v)||2))} hint="min 2" color={C}/>
      <div style={{borderTop:'0.5px solid var(--border)',paddingTop:14,marginTop:4}}>
        <div style={{fontSize:10,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:10}}>🎯 Perfect squares</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:6}}>
          {[1,4,9,16,25,36,49,64,81,100,121,144].map(sq=>(<button key={sq} onClick={()=>{setNum(sq);setNthRoot(2)}} style={{padding:'7px',borderRadius:7,border:`1px solid ${num===sq&&nthRoot===2?C:'var(--border-2)'}`,background:num===sq&&nthRoot===2?C+'12':'var(--bg-raised)',cursor:'pointer',fontSize:11,fontWeight:700,color:num===sq&&nthRoot===2?C:'var(--text)'}}>{sq}</button>))}
        </div>
      </div>
    </>} right={<>
      {result===null?(<div style={{background:'#fee2e2',border:'1px solid #ef444430',borderRadius:14,padding:'20px',textAlign:'center',marginBottom:14}}><div style={{fontSize:15,fontWeight:700,color:'#dc2626'}}>⚠ Cannot take even root of negative number</div><div style={{fontSize:12,color:'#991b1b',marginTop:6}}>The square root of a negative number is imaginary (complex number)</div></div>):(<>
      <BigResult value={fmt(result)} label={`${r===2?'Square':r===3?'Cube':r+'th'} root of ${n}`} color={C}
        note={isPerfect?`${n} is a perfect square — √${n} = ${fmt(result)} exactly (${fmt(result)} × ${fmt(result)} = ${n})`:`√${n} ≈ ${fmt(result)} (irrational — decimal never terminates or repeats)`}/>
      {/* geometric square visual */}
      <div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,padding:'14px 18px',marginBottom:14}}>
        <div style={{fontSize:12,fontWeight:700,color:'var(--text)',marginBottom:12,fontFamily:"'Space Grotesk',sans-serif"}}>Geometric interpretation</div>
        {r===2&&(<div style={{textAlign:'center'}}><svg viewBox="0 0 200 120" width="100%" style={{display:'block'}}>
          <rect x={20} y={10} width={80} height={80} fill={C+'20'} stroke={C} strokeWidth="2"/>
          <text x={60} y={56} textAnchor="middle" fontSize="11" fontWeight="700" fill={C}>Area = {n}</text>
          <text x={60} y={108} textAnchor="middle" fontSize="10" fill="var(--text-3)">Side = √{n} = {fmt(result)}</text>
          <line x1={10} y1={10} x2={10} y2={90} stroke={C} strokeWidth="1.5" markerEnd={`url(#arr)`}/>
          <text x={6} y={54} textAnchor="middle" fontSize="9" fill={C} transform="rotate(-90,6,54)">{fmt(result)}</text>
          <line x1={20} y1={98} x2={100} y2={98} stroke={C} strokeWidth="1.5"/>
          <text x={60} y={106} textAnchor="middle" fontSize="9" fill={C}>{fmt(result)}</text>
        </svg></div>)}
        {r===3&&(<div style={{padding:'12px',background:C+'08',borderRadius:9,fontSize:12,color:'var(--text-2)',lineHeight:1.65}}>The cube root of {n} = {fmt(result)} is the side length of a cube with volume {n}. A cube with sides of {fmt(result)} units has a total volume of {n} cubic units.</div>)}
      </div>
      <BreakdownTable title="Summary" rows={[{label:`${r}${r===2?'nd':r===3?'rd':'th'} root of ${n}`,value:fmt(result),bold:true,highlight:true,color:C},{label:'As power',value:`${n}^(1/${r})`},{label:'Perfect ${r===2?"square":"cube"}'  ,value:isPerfect?'Yes ✓':'No'},{label:'Verify',value:`${fmt(result)}^${r} ≈ ${fmt(result===null?0:Math.pow(Number(fmt(result)),r))}`}]}/>
      <AIHintCard hint={`${r===2?'√':r+'th root of '}${n} = ${fmt(result)}`}/>
      </>)}
    </>}/>
    <StepsCard steps={steps} color={C}/>
    <Sec title="Perfect squares reference — 1 to 25">
      <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:6}}>
        {Array.from({length:25},(_,i)=>i+1).map(i=>(<div key={i} style={{padding:'8px 4px',borderRadius:8,background:'var(--bg-raised)',border:'0.5px solid var(--border)',textAlign:'center'}}><div style={{fontSize:11,fontWeight:700,color:C,fontFamily:"'Space Grotesk',sans-serif"}}>{i}²</div><div style={{fontSize:13,fontWeight:700,color:'var(--text)'}}>{i*i}</div></div>))}
      </div>
    </Sec>
    <Sec title="⚠️ Common mistakes"><MistakesList items={['Square root of 0 is 0, not undefined','Square root of 1 is 1 — students often say "cannot be simplified"','√(a+b) ≠ √a + √b — this is a very common algebraic error','Negative numbers have no real square root — only imaginary (complex) roots']}/></Sec>
    <Sec title="Frequently asked questions">
      {[{q:'What is the square root of a negative number?',a:'In real numbers, the square root of a negative number is undefined — no real number squared gives a negative result. In complex numbers, √(−1) is defined as i (the imaginary unit). √(−9) = 3i. This is used in electrical engineering, quantum mechanics, and advanced mathematics.'},{q:'Is every number a perfect square?',a:'No — only numbers that are squares of integers are perfect squares: 1, 4, 9, 16, 25, 36... The square root of all other positive integers is irrational — it never terminates and never repeats as a decimal. For example, √2 = 1.41421356... (proven irrational by Euclid around 300 BC).'}].map((f,i)=>(<Acc key={i} q={f.q} a={f.a} open={openFaq===i} onToggle={()=>setOpenFaq(openFaq===i?null:i)} color={C}/>))}
    </Sec>
  </div>)
}

