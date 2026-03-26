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

export default function RandomNumberGenerator({meta,category}){
  const C=category?.color||'#3b82f6'
  const[min,setMin]=useState(1)
  const[max,setMax]=useState(100)
  const[count,setCount]=useState(1)
  const[unique,setUnique]=useState(false)
  const[result,setResult]=useState([])
  const[history,setHistory]=useState([])
  const[openFaq,setOpenFaq]=useState(null)

  const generate=()=>{
    const mn=Math.min(Number(min)||0,Number(max)||100)
    const mx=Math.max(Number(min)||0,Number(max)||100)
    const n=Math.min(Number(count)||1,unique?mx-mn+1:1000)
    let nums=[]
    if(unique){
      const pool=Array.from({length:mx-mn+1},(_,i)=>mn+i)
      for(let i=pool.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]]}
      nums=pool.slice(0,n)
    } else {
      nums=Array.from({length:n},()=>Math.floor(Math.random()*(mx-mn+1))+mn)
    }
    setResult(nums)
    setHistory(h=>[nums,...h].slice(0,10))
  }

  return(<div style={{display:'flex',flexDirection:'column',gap:20}}>
    <FormulaCard formula="rand(min, max) = floor(random() × (max − min + 1)) + min" desc="Generates uniformly distributed random integers within a specified range" color={C}/>
    <CalcShell left={<>
      <MathInput label="Minimum" value={min} onChange={setMin} color={C}/>
      <MathInput label="Maximum" value={max} onChange={setMax} color={C}/>
      <MathInput label="How many numbers?" value={count} onChange={setCount} hint="1–100" color={C}/>
      <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:16}}>
        <button onClick={()=>setUnique(u=>!u)} style={{width:24,height:24,borderRadius:6,border:`2px solid ${unique?C:'var(--border)'}`,background:unique?C:'transparent',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>{unique&&<span style={{color:'#fff',fontSize:13,fontWeight:700}}>✓</span>}</button>
        <span style={{fontSize:12,color:'var(--text)',fontFamily:"'DM Sans',sans-serif"}}>No repeats (unique numbers only)</span>
      </div>
      <button onClick={generate} style={{width:'100%',padding:'14px',borderRadius:10,border:'none',background:C,color:'#fff',fontSize:15,fontWeight:700,cursor:'pointer',fontFamily:"'Space Grotesk',sans-serif",letterSpacing:'.02em'}}>🎲 Generate</button>
      <div style={{borderTop:'0.5px solid var(--border)',paddingTop:14,marginTop:16}}>
        <div style={{fontSize:10,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:10}}>Quick presets</div>
        {[{mn:1,mx:6,n:1,l:'🎲 Roll a dice (1–6)'},{mn:1,mx:100,n:1,l:'Pick 1–100'},{mn:1,mx:49,n:6,u:true,l:'🎰 Lottery pick (6 from 49)'},{mn:0,mx:1,n:1,l:'Coin flip (0 or 1)'}].map((ex,i)=>(<button key={i} onClick={()=>{setMin(ex.mn);setMax(ex.mx);setCount(ex.n);setUnique(!!ex.u)}} style={{display:'block',width:'100%',padding:'8px 12px',borderRadius:8,border:'1px solid var(--border-2)',background:'var(--bg-raised)',cursor:'pointer',textAlign:'left',marginBottom:6,fontSize:12,color:'var(--text)',fontFamily:"'DM Sans',sans-serif"}} onMouseEnter={e=>e.currentTarget.style.borderColor=C+'60'} onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border-2)'}>{ex.l}</button>))}
      </div>
    </>} right={<>
      {result.length===0?(<div style={{background:'var(--bg-raised)',border:'0.5px solid var(--border)',borderRadius:14,padding:'40px 24px',textAlign:'center',marginBottom:14}}><div style={{fontSize:32,marginBottom:12}}>🎲</div><div style={{fontSize:14,color:'var(--text-3)'}}>Press Generate to create random numbers</div></div>):(<>
      <div style={{background:'var(--bg-card)',border:`1.5px solid ${C}30`,borderRadius:14,padding:'18px 20px',marginBottom:14}}>
        <div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:10}}>Generated {result.length} number{result.length!==1?'s':''}</div>
        {result.length===1?(<div style={{fontSize:64,fontWeight:700,color:C,fontFamily:"'Space Grotesk',sans-serif",lineHeight:1,textAlign:'center',padding:'16px 0'}}>{result[0]}</div>):(<div style={{display:'flex',flexWrap:'wrap',gap:8,marginBottom:12}}>
          {result.map((n,i)=>(<div key={i} style={{padding:'8px 14px',borderRadius:9,background:C+'15',border:`1px solid ${C}30`,fontSize:16,fontWeight:700,color:C,fontFamily:"'Space Grotesk',sans-serif"}}>{n}</div>))}
        </div>)}
        {result.length>1&&<div style={{padding:'8px 12px',background:'var(--bg-raised)',borderRadius:8,fontSize:12,color:'var(--text-3)'}}>Sum: {result.reduce((a,b)=>a+b,0)} · Average: {fmt(result.reduce((a,b)=>a+b,0)/result.length)} · Min: {Math.min(...result)} · Max: {Math.max(...result)}</div>}
      </div>
      {/* distribution bar for range */}
      <div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,padding:'14px 18px',marginBottom:14}}>
        <div style={{fontSize:12,fontWeight:700,color:'var(--text)',marginBottom:10,fontFamily:"'Space Grotesk',sans-serif"}}>Probability range</div>
        <div style={{height:8,background:'var(--border)',borderRadius:4,marginBottom:6,overflow:'hidden',position:'relative'}}>
          {result.map((n,i)=>{const pos=((n-Number(min))/(Number(max)-Number(min)||1))*100;return(<div key={i} style={{position:'absolute',left:`${clamp(pos,0,100)}%`,top:0,bottom:0,width:3,background:C,borderRadius:2,transform:'translateX(-50%)'}}/>)})}
        </div>
        <div style={{display:'flex',justifyContent:'space-between',fontSize:9,color:'var(--text-3)'}}><span>{min}</span><span>{max}</span></div>
      </div>
      </>)}
      {history.length>1&&(<div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,padding:'14px 18px',marginBottom:14}}>
        <div style={{fontSize:12,fontWeight:700,color:'var(--text)',marginBottom:8,fontFamily:"'Space Grotesk',sans-serif"}}>Previous results</div>
        {history.slice(1,6).map((h,i)=>(<div key={i} style={{fontSize:12,color:'var(--text-3)',padding:'5px 0',borderBottom:'0.5px solid var(--border)'}}>{h.join(', ')}</div>))}
      </div>)}
      <AIHintCard hint={`Random ${count} number${count!==1?'s':''} from ${min} to ${max}${unique?' (unique)':''}: ${result.join(', ')}`}/>
    </>}/>

    <Sec title="Where random number generation is used">
      <RealWorld items={[{icon:'🔐',field:'Cryptography',desc:'Encryption keys must be generated from truly random or pseudorandom sources. Weak randomness in key generation is a common vulnerability in security systems.',example:'256-bit AES key = 256 random bits',color:C},{icon:'🎮',field:'Games & Simulations',desc:"Procedurally generated worlds, enemy behaviour, loot drops — games rely on random numbers constantly. Minecraft's terrain is generated from a single random seed.",example:"Minecraft world = seeded random generation",color:'#10b981'},{icon:'📊',field:'Statistics & Research',desc:'Random sampling ensures a study represents the population fairly. Random assignment in clinical trials prevents bias in treatment group selection.',example:'Random sampling: survey 1000 from millions',color:'#f59e0b'},{icon:'🎰',field:'Probability Experiments',desc:'Simulating thousands of dice rolls, coin flips, or card draws lets you verify probability calculations and explore distributions empirically.',example:'Simulate 10,000 dice rolls to verify P(6)=1/6',color:'#8b5cf6'}]}/>
    </Sec>
    <Sec title="⚠️ Common mistakes"><MistakesList items={['True randomness vs pseudorandomness — computers generate pseudorandom numbers (PRNG) from a seed. They look random but are deterministic','Using weak randomness for security — Math.random() in JavaScript is not cryptographically secure','Thinking random sequences cannot repeat — consecutive identical values are perfectly valid in true randomness']}/></Sec>
    <Sec title="Frequently asked questions">
      {[{q:'Are computer-generated numbers truly random?',a:'No — computers use pseudorandom number generators (PRNGs). These are mathematical algorithms seeded with a value (often the current time) that produce sequences which pass statistical tests for randomness but are actually deterministic. Truly random numbers come from physical processes like radioactive decay, atmospheric noise, or quantum events. For cryptography, operating systems collect entropy from hardware events to produce cryptographically secure random numbers.'},{q:'What is a random seed?',a:'A seed is the starting value for a random number generator. Given the same seed, a PRNG always produces the same sequence. This is useful for reproducibility in games (same seed = same world), scientific simulations, and debugging. Minecraft uses a seed to generate its world — sharing a seed shares the exact world.'}].map((f,i)=>(<Acc key={i} q={f.q} a={f.a} open={openFaq===i} onToggle={()=>setOpenFaq(openFaq===i?null:i)} color={C}/>))}
    </Sec>
  </div>)
}

