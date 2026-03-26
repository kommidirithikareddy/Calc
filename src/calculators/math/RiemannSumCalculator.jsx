import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'
const fmt = n => (isNaN(n)||!isFinite(n))? '—' : parseFloat(Number(n).toFixed(6)).toString()
function Sec({title,sub,children}){return(<div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,overflow:'hidden'}}><div style={{padding:'13px 18px',borderBottom:'0.5px solid var(--border)',display:'flex',justifyContent:'space-between'}}><span style={{fontSize:13,fontWeight:700,color:'var(--text)',fontFamily:"'Space Grotesk',sans-serif"}}>{title}</span>{sub&&<span style={{fontSize:11,color:'var(--text-3)'}}>{sub}</span>}</div><div style={{padding:'16px 18px'}}>{children}</div></div>)}
function Acc({q,a,open,onToggle,color}){return(<div style={{borderBottom:'0.5px solid var(--border)'}}><button onClick={onToggle} style={{width:'100%',display:'flex',justifyContent:'space-between',alignItems:'center',padding:'13px 0',background:'none',border:'none',cursor:'pointer',gap:12,textAlign:'left'}}><span style={{fontSize:13,fontWeight:600,color:'var(--text)',fontFamily:"'DM Sans',sans-serif",lineHeight:1.4}}>{q}</span><span style={{fontSize:18,color,flexShrink:0,transform:open?'rotate(45deg)':'none',transition:'transform .2s'}}>+</span></button>{open&&<p style={{fontSize:12.5,color:'var(--text-2)',lineHeight:1.75,margin:'0 0 13px'}}>{a}</p>}</div>)}
function Inp({label,value,onChange,color,hint}){const[f,sf]=useState(false);return(<div style={{marginBottom:14}}><div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}><label style={{fontSize:12.5,fontWeight:600,color:'var(--text)',fontFamily:"'DM Sans',sans-serif"}}>{label}</label>{hint&&<span style={{fontSize:10,color:'var(--text-3)'}}>{hint}</span>}</div><div style={{display:'flex',height:44,border:`1.5px solid ${f?color:'var(--border-2)'}`,borderRadius:9,overflow:'hidden',background:'var(--bg-card)'}}><input type="number" value={value} onChange={e=>onChange(Number(e.target.value))} onFocus={()=>sf(true)} onBlur={()=>sf(false)} style={{flex:1,border:'none',background:'transparent',padding:'0 14px',fontSize:17,fontWeight:700,color:'var(--text)',outline:'none',fontFamily:"'Space Grotesk',sans-serif"}}/></div></div>)}
const FUNCTIONS=[
  {id:'quad',label:'x²',f:x=>x*x,exact:(a,b)=>b*b*b/3-a*a*a/3},
  {id:'linear',label:'2x+1',f:x=>2*x+1,exact:(a,b)=>b*b+b-a*a-a},
  {id:'sin',label:'sin(x)',f:x=>Math.sin(x),exact:(a,b)=>-Math.cos(b)+Math.cos(a)},
  {id:'exp',label:'eˣ',f:x=>Math.exp(x),exact:(a,b)=>Math.exp(b)-Math.exp(a)},
]
const FAQ=[
  {q:'What is a Riemann sum?',a:'A Riemann sum approximates the area under a curve by dividing the region into rectangles. Each rectangle has width Δx = (b−a)/n and height f(xᵢ*) for some point xᵢ* in the interval. The sum of all rectangle areas approximates the definite integral. As n→∞, the Riemann sum equals the integral.'},
  {q:'What are left, right, and midpoint rules?',a:'Left rule: use the left endpoint of each subinterval for rectangle height. Right rule: use the right endpoint. Midpoint rule: use the midpoint — this is usually the most accurate of the three. Trapezoidal rule uses the average of left and right endpoints, equivalent to trapezia instead of rectangles.'},
  {q:'How many rectangles do I need?',a:'Depends on how smooth the function is and the accuracy required. For smooth functions, the midpoint and trapezoidal rules converge as O(1/n²) — doubling rectangles reduces error by 4×. Simpson\'s rule (like this calculator uses for integration) converges as O(1/n⁴) — much faster.'},
  {q:'What is the connection to the definite integral?',a:'The definite integral is defined as the limit of Riemann sums as n→∞. lim(n→∞) Σf(xᵢ*)Δx = ∫ₐᵇf(x)dx. This is the Riemann definition of the integral. The Fundamental Theorem of Calculus provides a much faster computational method: F(b)−F(a).'},
]
export default function RiemannSumCalculator({meta,category}){
  const C=category?.color||'#6366f1'
  const[fnId,setFnId]=useState('quad')
  const[lo,setLo]=useState(0)
  const[hi,setHi]=useState(3)
  const[n,setN]=useState(8)
  const[method,setMethod]=useState('mid')
  const[openFaq,setFaq]=useState(null)
  const fn=FUNCTIONS.find(f=>f.id===fnId)||FUNCTIONS[0]
  const N=Math.max(1,Math.min(50,Math.round(n)))
  const h=(hi-lo)/N
  const rects=Array.from({length:N},(_,i)=>{
    const xL=lo+i*h,xR=lo+(i+1)*h,xM=(xL+xR)/2
    const xi=method==='left'?xL:method==='right'?xR:xM
    return{xL,xR,xM,xi,height:fn.f(xi),area:fn.f(xi)*h}
  })
  const riemannSum=rects.reduce((a,r)=>a+r.area,0)
  const exactVal=fn.exact(lo,hi)
  const error=Math.abs(exactVal-riemannSum)
  const W=260,H=140
  const xMin=lo,xMax=hi
  const allY=[]
  for(let i=0;i<=60;i++){const xi=xMin+(i/60)*(xMax-xMin);allY.push(fn.f(xi))}
  const yMin=Math.min(...allY,0),yMax=Math.max(...allY,0.1)
  const toSx=x=>((x-xMin)/(xMax-xMin))*(W-20)+10
  const toSy=y=>H-10-((y-yMin)/(yMax-yMin+0.001))*(H-20)
  const curvePts=allY.map((y,i)=>`${10+(i/60)*(W-20)},${Math.max(5,Math.min(H-5,toSy(y)))}`)
  const zeroY=Math.max(5,Math.min(H-5,toSy(0)))
  return(<div style={{display:'flex',flexDirection:'column',gap:20}}>
    <div style={{background:`linear-gradient(135deg,${C}12,${C}06)`,border:`1px solid ${C}30`,borderRadius:14,padding:'16px 20px',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12}}>
      <div>
        <div style={{fontSize:10,fontWeight:700,color:C,textTransform:'uppercase',letterSpacing:'.08em',marginBottom:6}}>Riemann Sum</div>
        <div style={{fontSize:22,fontWeight:700,color:C,fontFamily:"'Space Grotesk',sans-serif"}}>Σ f(xᵢ*) · Δx  →  ∫ f(x)dx</div>
        <div style={{fontSize:11,color:'var(--text-3)',marginTop:4}}>Area approximation using {N} rectangles ({method} rule)</div>
      </div>
      <div style={{padding:'10px 20px',background:C+'18',borderRadius:12,textAlign:'center'}}>
        <div style={{fontSize:11,color:'var(--text-3)',marginBottom:2}}>Riemann sum</div>
        <div style={{fontSize:28,fontWeight:700,color:C,fontFamily:"'Space Grotesk',sans-serif"}}>{fmt(riemannSum)}</div>
        <div style={{fontSize:10,color:'var(--text-3)'}}>exact: {fmt(exactVal)}</div>
      </div>
    </div>
    <div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,padding:'14px 18px'}}>
      <div style={{fontSize:12,fontWeight:600,color:'var(--text-2)',marginBottom:10}}>Function & method</div>
      <div style={{display:'flex',gap:8,marginBottom:10}}>
        {FUNCTIONS.map(f=>(<button key={f.id} onClick={()=>setFnId(f.id)} style={{flex:1,padding:'9px',borderRadius:10,border:`1.5px solid ${fnId===f.id?C:'var(--border)'}`,background:fnId===f.id?C+'12':'var(--bg-raised)',cursor:'pointer',fontSize:12,fontWeight:700,color:fnId===f.id?C:'var(--text-2)'}}>{f.label}</button>))}
      </div>
      <div style={{display:'flex',gap:8}}>
        {[['left','Left'],['mid','Midpoint'],['right','Right']].map(([k,label])=>(<button key={k} onClick={()=>setMethod(k)} style={{flex:1,padding:'8px',borderRadius:10,border:`1.5px solid ${method===k?C:'var(--border)'}`,background:method===k?C+'12':'var(--bg-raised)',cursor:'pointer',fontSize:11,fontWeight:method===k?700:500,color:method===k?C:'var(--text-2)'}}>{label}</button>))}
      </div>
    </div>
    <CalcShell
      left={<>
        <div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:16,paddingBottom:8,borderBottom:'0.5px solid var(--border)'}}>Parameters</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}><Inp label="Lower limit (a)" value={lo} onChange={setLo} color={C}/><Inp label="Upper limit (b)" value={hi} onChange={setHi} color={C}/></div>
        <Inp label="Number of rectangles (n)" value={n} onChange={v=>setN(Math.max(1,Math.min(50,Math.round(v))))} color={C} hint="1 to 50"/>
        <div style={{marginBottom:14}}>
          <div style={{fontSize:12.5,fontWeight:600,color:'var(--text)',marginBottom:8}}>Quick n</div>
          <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
            {[2,4,8,16,32,50].map(k=>(<button key={k} onClick={()=>setN(k)} style={{padding:'6px 12px',borderRadius:20,fontSize:11,fontWeight:600,border:'1.5px solid',borderColor:N===k?C:'var(--border)',background:N===k?C:'var(--bg-raised)',color:N===k?'#fff':'var(--text-2)',cursor:'pointer'}}>{k}</button>))}
          </div>
        </div>
        <div style={{padding:'12px 14px',background:C+'08',borderRadius:10,border:`1px solid ${C}20`,marginBottom:14}}>
          <div style={{fontSize:13,fontWeight:700,color:C}}>Δx = ({hi}−{lo})/{N} = {fmt(h)}</div>
          <div style={{fontSize:11,color:'var(--text-2)',marginTop:4}}>Each rectangle has width {fmt(h)}</div>
        </div>
        <div style={{display:'flex',gap:10}}>
          <button style={{flex:1,padding:13,borderRadius:10,border:'none',background:C,color:'#fff',fontSize:14,fontWeight:700,cursor:'pointer'}}>Calculate →</button>
          <button onClick={()=>{setLo(0);setHi(3);setN(8)}} style={{padding:'13px 18px',borderRadius:10,border:'1.5px solid var(--border-2)',background:'var(--bg-raised)',color:'var(--text-2)',fontSize:13,fontWeight:500,cursor:'pointer'}}>Reset</button>
        </div>
      </>}
      right={<>
        <div style={{background:'var(--bg-card)',border:`1.5px solid ${C}30`,borderRadius:14,padding:'18px 20px',marginBottom:14}}>
          <div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',marginBottom:8}}>Riemann Sum ({method} rule, n={N})</div>
          <div style={{fontSize:38,fontWeight:700,color:C,fontFamily:"'Space Grotesk',sans-serif"}}>{fmt(riemannSum)}</div>
          <div style={{fontSize:12,color:'var(--text-3)',marginTop:6}}>Exact: {fmt(exactVal)} · Error: {fmt(error)}</div>
        </div>
        <div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,padding:'14px 18px',marginBottom:14}}>
          <div style={{fontSize:12,fontWeight:700,color:'var(--text)',marginBottom:8}}>Rectangles visualised ({Math.min(N,20)} shown)</div>
          <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{display:'block',background:'var(--bg-raised)',borderRadius:8}}>
            <line x1={10} y1={zeroY} x2={W-10} y2={zeroY} stroke="var(--border)" strokeWidth="1"/>
            {rects.slice(0,20).map((r,i)=>{
              const rx=toSx(r.xL),rw=toSx(r.xR)-toSx(r.xL)
              const ry=Math.min(zeroY,Math.max(5,toSy(r.height)))
              const rh=Math.abs(zeroY-Math.max(5,Math.min(H-5,toSy(r.height))))
              return(<rect key={i} x={rx} y={ry} width={Math.max(1,rw-1)} height={rh} fill={C+'30'} stroke={C} strokeWidth="0.5"/>)
            })}
            {curvePts.length>1&&<polyline points={curvePts.join(' ')} fill="none" stroke={C} strokeWidth="2.5" strokeLinejoin="round"/>}
          </svg>
        </div>
        <BreakdownTable title="Results" rows={[
          {label:'Riemann sum',value:fmt(riemannSum),bold:true,color:C,highlight:true},
          {label:'Exact integral',value:fmt(exactVal),color:'#10b981'},
          {label:'Error',value:fmt(error),color:error<0.1?'#10b981':'#ef4444'},
          {label:'Relative error',value:`${fmt(error/Math.abs(exactVal)*100)}%`},
          {label:'Rectangles n',value:String(N)},
          {label:'Width Δx',value:fmt(h)},
        ]}/>
        <AIHintCard hint={`${N} rectangles (${method} rule): sum=${fmt(riemannSum)}, exact=${fmt(exactVal)}, error=${fmt(error)}. ${N<16?`Try n=${N*2} to roughly halve the error.`:'Good approximation — increasing n further has diminishing returns.'}`} color={C}/>
      </>}
    />
    <Sec title="Convergence — how error decreases with n">
      <div style={{overflowX:'auto'}}>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead><tr>{['n','Left sum','Midpoint sum','Right sum','Exact'].map(h=>(<th key={h} style={{padding:'8px 10px',fontSize:11,fontWeight:700,color:'var(--text-3)',textAlign:'right',borderBottom:'1px solid var(--border)',background:'var(--bg-raised)'}}>{h}</th>))}</tr></thead>
          <tbody>{[2,4,8,16,32].map((k,i)=>{
            const hk=(hi-lo)/k
            const lft=Array.from({length:k},(_,j)=>fn.f(lo+j*hk)*hk).reduce((a,v)=>a+v,0)
            const mid=Array.from({length:k},(_,j)=>fn.f(lo+(j+0.5)*hk)*hk).reduce((a,v)=>a+v,0)
            const rgt=Array.from({length:k},(_,j)=>fn.f(lo+(j+1)*hk)*hk).reduce((a,v)=>a+v,0)
            const isCurrent=k===N
            return(<tr key={i} style={{background:isCurrent?C+'08':'transparent'}}><td style={{padding:'7px 10px',fontSize:12,fontWeight:isCurrent?700:400,color:isCurrent?C:'var(--text)',textAlign:'right'}}>{k}{isCurrent?' ✓':''}</td><td style={{padding:'7px 10px',fontSize:11,color:'var(--text-2)',textAlign:'right'}}>{fmt(lft)}</td><td style={{padding:'7px 10px',fontSize:11,fontWeight:700,color:C,textAlign:'right'}}>{fmt(mid)}</td><td style={{padding:'7px 10px',fontSize:11,color:'var(--text-2)',textAlign:'right'}}>{fmt(rgt)}</td><td style={{padding:'7px 10px',fontSize:11,fontWeight:700,color:'#10b981',textAlign:'right'}}>{fmt(exactVal)}</td></tr>)
          })}</tbody>
        </table>
      </div>
    </Sec>
    <Sec title="Frequently asked questions">
      {FAQ.map((f,i)=><Acc key={i} q={f.q} a={f.a} open={openFaq===i} onToggle={()=>setFaq(openFaq===i?null:i)} color={C}/>)}
    </Sec>
  </div>)
}
