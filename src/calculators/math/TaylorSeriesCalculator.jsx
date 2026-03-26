import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'
const fmt = n => (isNaN(n)||!isFinite(n))? '—' : parseFloat(Number(n).toFixed(8)).toString()
function factorial(n){if(n<=0)return 1;let r=1;for(let i=2;i<=n;i++)r*=i;return r}
function Sec({title,sub,children}){return(<div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,overflow:'hidden'}}><div style={{padding:'13px 18px',borderBottom:'0.5px solid var(--border)',display:'flex',justifyContent:'space-between'}}><span style={{fontSize:13,fontWeight:700,color:'var(--text)',fontFamily:"'Space Grotesk',sans-serif"}}>{title}</span>{sub&&<span style={{fontSize:11,color:'var(--text-3)'}}>{sub}</span>}</div><div style={{padding:'16px 18px'}}>{children}</div></div>)}
function Acc({q,a,open,onToggle,color}){return(<div style={{borderBottom:'0.5px solid var(--border)'}}><button onClick={onToggle} style={{width:'100%',display:'flex',justifyContent:'space-between',alignItems:'center',padding:'13px 0',background:'none',border:'none',cursor:'pointer',gap:12,textAlign:'left'}}><span style={{fontSize:13,fontWeight:600,color:'var(--text)',fontFamily:"'DM Sans',sans-serif",lineHeight:1.4}}>{q}</span><span style={{fontSize:18,color,flexShrink:0,transform:open?'rotate(45deg)':'none',transition:'transform .2s'}}>+</span></button>{open&&<p style={{fontSize:12.5,color:'var(--text-2)',lineHeight:1.75,margin:'0 0 13px'}}>{a}</p>}</div>)}
function Inp({label,value,onChange,color,hint}){const[f,sf]=useState(false);return(<div style={{marginBottom:14}}><div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}><label style={{fontSize:12.5,fontWeight:600,color:'var(--text)',fontFamily:"'DM Sans',sans-serif"}}>{label}</label>{hint&&<span style={{fontSize:10,color:'var(--text-3)'}}>{hint}</span>}</div><div style={{display:'flex',height:44,border:`1.5px solid ${f?color:'var(--border-2)'}`,borderRadius:9,overflow:'hidden',background:'var(--bg-card)'}}><input type="number" value={value} onChange={e=>onChange(Number(e.target.value))} onFocus={()=>sf(true)} onBlur={()=>sf(false)} style={{flex:1,border:'none',background:'transparent',padding:'0 14px',fontSize:17,fontWeight:700,color:'var(--text)',outline:'none',fontFamily:"'Space Grotesk',sans-serif"}}/></div></div>)}
const SERIES=[
  {id:'sin',label:'sin(x)',coeff:n=>n%2===0?0:(n%4===1?1:-1)/factorial(n),nMax:13,exact:x=>Math.sin(x)},
  {id:'cos',label:'cos(x)',coeff:n=>n%2!==0?0:(n%4===0?1:-1)/factorial(n),nMax:12,exact:x=>Math.cos(x)},
  {id:'exp',label:'eˣ',coeff:n=>1/factorial(n),nMax:10,exact:x=>Math.exp(x)},
  {id:'ln1px',label:'ln(1+x)',coeff:n=>n===0?0:(n%2===0?-1:1)/n,nMax:10,exact:x=>Math.log(1+x)},
]
const FAQ=[
  {q:'What is a Taylor series?',a:'A Taylor series expresses a function as an infinite sum of polynomial terms. Around point a: f(x) = f(a) + f′(a)(x−a) + f″(a)(x−a)²/2! + ... Each term uses higher-order derivatives at a. The Maclaurin series is the special case where a=0.'},
  {q:'Why are Taylor series useful?',a:'Polynomials are easy to differentiate, integrate, and compute. Taylor series let us approximate complex functions (sin, cos, eˣ) with polynomials — essential in physics simulations, calculators, and computer programs. Your calculator computes sin(x) using a Taylor series.'},
  {q:'What is the radius of convergence?',a:'The Taylor series only converges (gives the correct value) within some interval around the centre point a. The radius R defines this: |x−a| < R. For sin(x) and cos(x), R = ∞ (converges everywhere). For ln(1+x), R = 1 (converges for |x| ≤ 1).'},
  {q:'How many terms do I need?',a:"More terms = better approximation further from the centre. Near x=0, even 3 terms of sin(x) ≈ x − x³/6 is excellent. Far from centre, you need many more terms. The error is bounded by the next term in the series (alternating series estimation theorem for alternating series)."},
]
export default function TaylorSeriesCalculator({meta,category}){
  const C=category?.color||'#6366f1'
  const[fnId,setFnId]=useState('sin')
  const[x,setX]=useState(0.5)
  const[terms,setTerms]=useState(6)
  const[openFaq,setFaq]=useState(null)
  const fn=SERIES.find(s=>s.id===fnId)||SERIES[0]
  const N=Math.max(1,Math.min(15,Math.round(terms)))
  const coeffs=Array.from({length:N},(_,k)=>fn.coeff(k))
  const termVals=coeffs.map((c,k)=>c*Math.pow(x,k))
  const approx=termVals.reduce((a,v)=>a+(isFinite(v)?v:0),0)
  const exact=fn.exact(x)
  const error=Math.abs(exact-approx)
  const W=260,H=130
  const xRange=fnId==='ln1px'?[-0.9,0.9]:[-Math.PI,Math.PI]
  const pts=[],approxPts=[]
  for(let i=0;i<=80;i++){
    const xi=xRange[0]+(i/80)*(xRange[1]-xRange[0])
    const yi=fn.exact(xi)
    const approxY=Array.from({length:N},(_,k)=>fn.coeff(k)*Math.pow(xi,k)).reduce((a,v)=>a+(isFinite(v)?v:0),0)
    const px=(i/80)*(W-20)+10
    const py=H/2-yi/(Math.max(Math.abs(fn.exact(xRange[1])),1))*50
    const apy=H/2-approxY/(Math.max(Math.abs(fn.exact(xRange[1])),1))*50
    if(isFinite(py))pts.push(`${px},${Math.max(5,Math.min(H-5,py))}`)
    if(isFinite(apy))approxPts.push(`${px},${Math.max(5,Math.min(H-5,apy))}`)
  }
  return(<div style={{display:'flex',flexDirection:'column',gap:20}}>
    <div style={{background:`linear-gradient(135deg,${C}12,${C}06)`,border:`1px solid ${C}30`,borderRadius:14,padding:'16px 20px',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12}}>
      <div>
        <div style={{fontSize:10,fontWeight:700,color:C,textTransform:'uppercase',letterSpacing:'.08em',marginBottom:6}}>Taylor & Maclaurin Series</div>
        <div style={{fontSize:20,fontWeight:700,color:C,fontFamily:"'Space Grotesk',sans-serif"}}>f(x) = Σ f⁽ⁿ⁾(0)/n! · xⁿ</div>
        <div style={{fontSize:11,color:'var(--text-3)',marginTop:4}}>Polynomial approximation centred at x=0</div>
      </div>
      <div style={{padding:'10px 20px',background:C+'18',borderRadius:12,textAlign:'center'}}>
        <div style={{fontSize:11,color:'var(--text-3)',marginBottom:2}}>{N}-term approx at x={x}</div>
        <div style={{fontSize:28,fontWeight:700,color:C,fontFamily:"'Space Grotesk',sans-serif"}}>{fmt(approx)}</div>
        <div style={{fontSize:10,color:'var(--text-3)'}}>exact: {fmt(exact)} · error: {fmt(error)}</div>
      </div>
    </div>
    <div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,padding:'14px 18px'}}>
      <div style={{fontSize:12,fontWeight:600,color:'var(--text-2)',marginBottom:12}}>Select function</div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8}}>
        {SERIES.map(s=>(<button key={s.id} onClick={()=>setFnId(s.id)} style={{padding:'10px 6px',borderRadius:10,border:`1.5px solid ${fnId===s.id?C:'var(--border-2)'}`,background:fnId===s.id?C+'12':'var(--bg-raised)',cursor:'pointer',textAlign:'center'}}><div style={{fontSize:13,fontFamily:"'Space Grotesk',sans-serif",color:fnId===s.id?C:'var(--text)',fontWeight:700}}>{s.label}</div></button>))}
      </div>
    </div>
    <CalcShell
      left={<>
        <div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:16,paddingBottom:8,borderBottom:'0.5px solid var(--border)'}}>Series parameters</div>
        <Inp label="x value to approximate" value={x} onChange={setX} color={C} hint={fnId==='ln1px'?'-1 < x ≤ 1':'any real'}/>
        <Inp label="Number of terms" value={terms} onChange={v=>setTerms(Math.max(1,Math.min(15,Math.round(v))))} color={C} hint="1 to 15"/>
        <div style={{marginBottom:14}}>
          <div style={{fontSize:12.5,fontWeight:600,color:'var(--text)',marginBottom:8}}>Quick terms</div>
          <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
            {[2,3,4,6,8,12].map(t=>(<button key={t} onClick={()=>setTerms(t)} style={{padding:'6px 12px',borderRadius:20,fontSize:11,fontWeight:600,border:'1.5px solid',borderColor:terms===t?C:'var(--border)',background:terms===t?C:'var(--bg-raised)',color:terms===t?'#fff':'var(--text-2)',cursor:'pointer'}}>{t}</button>))}
          </div>
        </div>
        <div style={{padding:'12px 14px',background:C+'08',borderRadius:10,border:`1px solid ${C}20`,marginBottom:14}}>
          <div style={{fontSize:10,color:'var(--text-3)',marginBottom:6}}>Series expansion</div>
          <div style={{fontSize:11,fontWeight:600,color:C,fontFamily:"'Space Grotesk',sans-serif",lineHeight:1.8}}>
            {termVals.slice(0,Math.min(5,N)).map((v,k)=>isFinite(v)?`${k===0?'':v>=0?' + ':' − '}${fmt(Math.abs(v))}`:null).filter(Boolean).join('')}{N>5?'...':''}
          </div>
        </div>
        <div style={{display:'flex',gap:10}}>
          <button style={{flex:1,padding:13,borderRadius:10,border:'none',background:C,color:'#fff',fontSize:14,fontWeight:700,cursor:'pointer'}}>Expand →</button>
          <button onClick={()=>{setX(0.5);setTerms(6)}} style={{padding:'13px 18px',borderRadius:10,border:'1.5px solid var(--border-2)',background:'var(--bg-raised)',color:'var(--text-2)',fontSize:13,fontWeight:500,cursor:'pointer'}}>Reset</button>
        </div>
      </>}
      right={<>
        <div style={{background:'var(--bg-card)',border:`1.5px solid ${C}30`,borderRadius:14,padding:'18px 20px',marginBottom:14}}>
          <div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',marginBottom:8}}>{N}-Term Taylor Approximation</div>
          <div style={{fontSize:36,fontWeight:700,color:C,fontFamily:"'Space Grotesk',sans-serif"}}>{fmt(approx)}</div>
          <div style={{fontSize:12,color:'var(--text-3)',marginTop:6}}>Exact: {fmt(exact)} · Error: {fmt(error)} ({fmt(error/Math.abs(exact)*100)}%)</div>
        </div>
        <div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,padding:'14px 18px',marginBottom:14}}>
          <div style={{fontSize:12,fontWeight:700,color:'var(--text)',marginBottom:8}}>Approximation vs exact</div>
          <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{display:'block',background:'var(--bg-raised)',borderRadius:8}}>
            <line x1={10} y1={H/2} x2={W-10} y2={H/2} stroke="var(--border)" strokeWidth="1"/>
            {pts.length>1&&<polyline points={pts.join(' ')} fill="none" stroke={C} strokeWidth="2.5" strokeLinejoin="round"/>}
            {approxPts.length>1&&<polyline points={approxPts.join(' ')} fill="none" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="5,3" strokeLinejoin="round"/>}
            <text x={14} y={14} fontSize="9" fill={C} fontWeight="700">exact</text>
            <text x={14} y={26} fontSize="9" fill="#ef4444" fontWeight="700">{N}-term approx</text>
          </svg>
        </div>
        <BreakdownTable title="Accuracy" rows={[
          {label:`${N}-term approx`,value:fmt(approx),bold:true,color:C,highlight:true},
          {label:'Exact value',value:fmt(exact),color:'#10b981'},
          {label:'Absolute error',value:fmt(error),color:error<0.001?'#10b981':'#ef4444'},
          {label:'Relative error',value:`${fmt(error/Math.abs(exact)*100)}%`,color:error<0.01?'#10b981':'#f59e0b'},
          {label:'Terms used',value:String(N)},
        ]}/>
        <AIHintCard hint={`${N}-term Taylor series for ${fn.label} at x=${x}: approx=${fmt(approx)}, exact=${fmt(exact)}, error=${fmt(error)}. ${error<0.001?'Excellent accuracy — very close to exact.':error<0.01?'Good accuracy — add more terms to improve.':'Add more terms or move x closer to 0 for better accuracy.'}`} color={C}/>
      </>}
    />
    <Sec title="Important Maclaurin series" sub="Centred at x=0">
      <div style={{overflowX:'auto'}}>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead><tr>{['Function','Series','Convergence'].map(h=>(<th key={h} style={{padding:'9px 12px',fontSize:11,fontWeight:700,color:'var(--text-3)',textAlign:'left',borderBottom:'1px solid var(--border)',background:'var(--bg-raised)'}}>{h}</th>))}</tr></thead>
          <tbody>{[['eˣ','1 + x + x²/2! + x³/3! + ...','All x (R=∞)'],['sin(x)','x − x³/3! + x⁵/5! − x⁷/7! + ...','All x (R=∞)'],['cos(x)','1 − x²/2! + x⁴/4! − x⁶/6! + ...','All x (R=∞)'],['ln(1+x)','x − x²/2 + x³/3 − x⁴/4 + ...','−1 < x ≤ 1 (R=1)'],['1/(1−x)','1 + x + x² + x³ + ...','|x| < 1 (R=1)'],['arctan(x)','x − x³/3 + x⁵/5 − x⁷/7 + ...','|x| ≤ 1 (R=1)']].map(([fn2,series,conv],i)=>(<tr key={i} style={{background:i%2===0?'transparent':'var(--bg-raised)'}}><td style={{padding:'8px 12px',fontSize:12,fontWeight:700,color:C,borderBottom:'0.5px solid var(--border)'}}>{fn2}</td><td style={{padding:'8px 12px',fontSize:11,color:'var(--text)',fontFamily:"'Space Grotesk',sans-serif",borderBottom:'0.5px solid var(--border)'}}>{series}</td><td style={{padding:'8px 12px',fontSize:11,color:'var(--text-3)',borderBottom:'0.5px solid var(--border)'}}>{conv}</td></tr>))}</tbody>
        </table>
      </div>
    </Sec>
    <Sec title="Frequently asked questions">
      {FAQ.map((f,i)=><Acc key={i} q={f.q} a={f.a} open={openFaq===i} onToggle={()=>setFaq(openFaq===i?null:i)} color={C}/>)}
    </Sec>
  </div>)
}
