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

export default function PrimeFactorizationCalculator({meta,category}){
  const C=category?.color||'#3b82f6'
  const[num,setNum]=useState(360)
  const[openFaq,setOpenFaq]=useState(null)

  const n=Math.abs(Math.round(Number(num)||2))
  const primeFactors=()=>{let n2=n,fs=[];for(let d=2;d*d<=n2;d++){while(n2%d===0){fs.push(d);n2=Math.floor(n2/d)}}if(n2>1)fs.push(n2);return fs}
  const factors=n>=2?primeFactors():[]
  const factorMap={}; factors.forEach(f=>{factorMap[f]=(factorMap[f]||0)+1})
  const notation=Object.entries(factorMap).map(([p,e])=>e===1?p:`${p}^${e}`).join(' × ')
  const steps=[
    {label:'Start with the number',math:`${n}`,note:'We will divide repeatedly by the smallest prime factor'},
    ...Object.entries(factorMap).reduce((acc,[p,e])=>{let rem=n;for(let i=0;i<acc.length;i++)rem=Math.floor(rem/Number(Object.entries(factorMap)[i][0])**Object.entries(factorMap)[i][1]);return acc},[]).concat([]),
    ...Object.entries(factorMap).map(([p,e],i)=>({label:`Divide by ${p}`,math:`÷ ${p} repeated ${e} time${e>1?'s':''}`,note:`${p} is prime (divisible only by 1 and itself)`})),
    {label:'Prime factorization',math:`${n} = ${notation}`,note:'Every composite number has a unique prime factorization — this is the Fundamental Theorem of Arithmetic'},
  ]

  const COLORS=['#3b82f6','#10b981','#f59e0b','#8b5cf6','#ec4899','#ef4444']

  return(<div style={{display:'flex',flexDirection:'column',gap:20}}>
    <FormulaCard formula={`n = p₁^a × p₂^b × p₃^c × ...`} desc="Every integer > 1 is either prime or a unique product of prime powers (Fundamental Theorem of Arithmetic)" color={C}/>
    <CalcShell left={<>
      <MathInput label="Enter a whole number" value={num} onChange={setNum} hint="2 to 10,000,000" color={C}/>
      <div style={{borderTop:'0.5px solid var(--border)',paddingTop:14,marginTop:4}}>
        <div style={{fontSize:10,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:10}}>🎯 Interesting numbers</div>
        {[{n:360,l:'360 — highly composite'},{n:1024,l:'1024 — pure power of 2'},{n:997,l:'997 — large prime'},{n:2310,l:'2310 = 2×3×5×7×11'},{n:12,l:'12 — smallest with 6 factors'},{n:100,l:'100 = 2² × 5²'}].map((ex,i)=>(<button key={i} onClick={()=>setNum(ex.n)} style={{display:'block',width:'100%',padding:'8px 12px',borderRadius:8,border:'1px solid var(--border-2)',background:'var(--bg-raised)',cursor:'pointer',textAlign:'left',marginBottom:6,fontSize:12,color:'var(--text)',fontFamily:"'DM Sans',sans-serif"}} onMouseEnter={e=>e.currentTarget.style.borderColor=C+'60'} onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border-2)'}>{ex.l}</button>))}
      </div>
    </>} right={<>
      <div style={{background:'var(--bg-card)',border:`1.5px solid ${C}30`,borderRadius:14,padding:'18px 20px',marginBottom:14}}>
        <div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:8}}>Prime factorization</div>
        <div style={{fontSize:n>9999?18:28,fontWeight:700,color:C,fontFamily:"'Space Grotesk',sans-serif",lineHeight:1.3,marginBottom:12,wordBreak:'break-all'}}>
          {n} = {notation||'(prime)'}
        </div>
        {/* factor chips */}
        <div style={{display:'flex',flexWrap:'wrap',gap:6,marginBottom:12}}>
          {factors.map((f,i)=>(<div key={i} style={{padding:'5px 12px',borderRadius:20,background:COLORS[Object.keys(factorMap).indexOf(String(f))%COLORS.length]+'20',border:`1px solid ${COLORS[Object.keys(factorMap).indexOf(String(f))%COLORS.length]}40`,fontSize:14,fontWeight:700,color:COLORS[Object.keys(factorMap).indexOf(String(f))%COLORS.length]}}>{f}</div>))}
        </div>
        {factors.length===0&&n>=2&&<div style={{fontSize:12,color:'var(--text-3)',padding:'10px',background:C+'08',borderRadius:8}}>{n} is a prime number — it has no prime factors other than itself</div>}
        <div style={{padding:'10px 13px',background:C+'08',borderRadius:9,border:`1px solid ${C}20`,fontSize:12,color:'var(--text-2)',lineHeight:1.65}}>
          💡 {factors.length===0&&n>=2?`${n} is prime — it is only divisible by 1 and ${n} itself.`:`${n} breaks down into ${factors.length} prime factor${factors.length!==1?'s':''}. Recombining them: ${factors.join(' × ')} = ${factors.reduce((a,b)=>a*b,1)}.`}
        </div>
      </div>
      {Object.keys(factorMap).length>0&&(<div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,padding:'14px 18px',marginBottom:14}}>
        <div style={{fontSize:12,fontWeight:700,color:'var(--text)',marginBottom:10,fontFamily:"'Space Grotesk',sans-serif"}}>Factor breakdown</div>
        {Object.entries(factorMap).map(([p,e],i)=>(<div key={p} style={{display:'flex',alignItems:'center',gap:12,marginBottom:8}}><div style={{width:36,height:36,borderRadius:9,background:COLORS[i%COLORS.length]+'20',border:`1px solid ${COLORS[i%COLORS.length]}40`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,fontWeight:700,color:COLORS[i%COLORS.length]}}>{p}</div><div style={{flex:1}}><div style={{fontSize:12,fontWeight:700,color:'var(--text)'}}>{p} appears {e} time{e>1?'s':''} → {p}^{e} = {Math.pow(Number(p),e)}</div><div style={{height:5,background:'var(--border)',borderRadius:3,marginTop:4}}><div style={{height:'100%',width:`${(e/Math.max(...Object.values(factorMap)))*100}%`,background:COLORS[i%COLORS.length],borderRadius:3}}/></div></div></div>))}
      </div>)}
      <BreakdownTable title="Summary" rows={[{label:'Number',value:String(n)},{label:'Factorization',value:notation||'Prime',bold:true,highlight:true,color:C},{label:'Prime factors',value:Object.keys(factorMap).join(', ')||String(n)},{label:'Number of factors',value:String(Object.values(factorMap).reduce((s,e)=>s*(e+1),1))},{label:'Is prime?',value:factors.length===0&&n>=2?'Yes ✓':'No'}]}/>
      <AIHintCard hint={`${n} = ${notation||'prime'}`}/>
    </>}/>
    <StepsCard steps={steps} color={C}/>
    <Sec title="Why prime factorization matters">
      <RealWorld items={[{icon:'🔐',field:'Cryptography & Security',desc:'RSA encryption — used for every HTTPS website — is based on the fact that multiplying two large primes is easy but factoring the result is computationally hard. Your bank uses this every day.',example:'RSA-2048: product of two 1024-bit primes',color:C},{icon:'➗',field:'Simplifying fractions',desc:'To simplify a fraction, find the GCF using prime factorization. 84/126: 84=2²×3×7, 126=2×3²×7, GCF=2×3×7=42. So 84/126 = 2/3.',example:'84/126 = 2/3 via prime factorization',color:'#10b981'},{icon:'📐',field:'Finding GCF and LCM',desc:'Prime factorization gives the fastest method for GCF (take minimum exponents) and LCM (take maximum exponents) of large numbers.',example:'GCF(180,168): find prime factors of each',color:'#f59e0b'},{icon:'🔢',field:'Number theory',desc:'The Fundamental Theorem of Arithmetic — every integer > 1 has a unique prime factorization — is one of the most important results in mathematics.',example:'Proven by Euclid, ~300 BC',color:'#8b5cf6'}]}/>
    </Sec>
    <Sec title="⚠️ Common mistakes"><MistakesList items={['Stopping factorization too early — make sure all factors are prime (e.g. 4 = 2², not just "4")','Forgetting that 1 is not a prime number','Thinking primes are rare — there are infinitely many, distributed throughout all numbers']}/></Sec>
    <Sec title="Frequently asked questions">
      {[{q:'Why is 1 not a prime number?',a:'The definition of a prime requires exactly two distinct factors: 1 and itself. The number 1 has only one factor (itself), so it fails this condition. Excluding 1 from primes also ensures the uniqueness of prime factorization — if 1 were prime, every number would have infinitely many factorizations (12 = 2²×3 = 1×2²×3 = 1²×2²×3 = ...).'},{q:'How do I check if a number is prime?',a:"Check divisibility by all primes up to its square root. If none divide it evenly, it's prime. For example, to check if 97 is prime: √97 ≈ 9.8, so check primes 2, 3, 5, 7. None divide 97 evenly, so 97 is prime. This is the trial division method."}].map((f,i)=>(<Acc key={i} q={f.q} a={f.a} open={openFaq===i} onToggle={()=>setOpenFaq(openFaq===i?null:i)} color={C}/>))}
    </Sec>
  </div>)
}

