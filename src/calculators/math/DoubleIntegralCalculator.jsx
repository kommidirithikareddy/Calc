import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'
const fmt = n => (isNaN(n)||!isFinite(n))? '—' : parseFloat(Number(n).toFixed(6)).toString()
function integrate1D(f,a,b,n=200){if(a===b)return 0;const h=(b-a)/n;let sum=f(a)+f(b);for(let i=1;i<n;i++)sum+=(i%2===0?2:4)*f(a+i*h);return(h/3)*sum}
function integrate2D(f,ax,bx,ay,by,n=40){return integrate1D(x=>integrate1D(y=>f(x,y),ay,by,n),ax,bx,n)}
function Sec({title,sub,children}){return(<div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,overflow:'hidden'}}><div style={{padding:'13px 18px',borderBottom:'0.5px solid var(--border)',display:'flex',justifyContent:'space-between'}}><span style={{fontSize:13,fontWeight:700,color:'var(--text)',fontFamily:"'Space Grotesk',sans-serif"}}>{title}</span>{sub&&<span style={{fontSize:11,color:'var(--text-3)'}}>{sub}</span>}</div><div style={{padding:'16px 18px'}}>{children}</div></div>)}
function Acc({q,a,open,onToggle,color}){return(<div style={{borderBottom:'0.5px solid var(--border)'}}><button onClick={onToggle} style={{width:'100%',display:'flex',justifyContent:'space-between',alignItems:'center',padding:'13px 0',background:'none',border:'none',cursor:'pointer',gap:12,textAlign:'left'}}><span style={{fontSize:13,fontWeight:600,color:'var(--text)',fontFamily:"'DM Sans',sans-serif",lineHeight:1.4}}>{q}</span><span style={{fontSize:18,color,flexShrink:0,transform:open?'rotate(45deg)':'none',transition:'transform .2s'}}>+</span></button>{open&&<p style={{fontSize:12.5,color:'var(--text-2)',lineHeight:1.75,margin:'0 0 13px'}}>{a}</p>}</div>)}
function Inp({label,value,onChange,color,hint}){const[f,sf]=useState(false);return(<div style={{marginBottom:12}}><div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}><label style={{fontSize:12,fontWeight:600,color:'var(--text)',fontFamily:"'DM Sans',sans-serif"}}>{label}</label>{hint&&<span style={{fontSize:10,color:'var(--text-3)'}}>{hint}</span>}</div><div style={{display:'flex',height:40,border:`1.5px solid ${f?color:'var(--border-2)'}`,borderRadius:9,overflow:'hidden',background:'var(--bg-card)'}}><input type="number" value={value} onChange={e=>onChange(Number(e.target.value))} onFocus={()=>sf(true)} onBlur={()=>sf(false)} style={{flex:1,border:'none',background:'transparent',padding:'0 12px',fontSize:15,fontWeight:700,color:'var(--text)',outline:'none',fontFamily:"'Space Grotesk',sans-serif"}}/></div></div>)}
const FUNCTIONS=[
  {id:'xy',label:'xy',f:(x,y)=>x*y,fStr:'xy',steps:(ax,bx,ay,by)=>[{label:'Set up',math:`∬ xy dA = ∫${ax}^${bx} ∫${ay}^${by} xy dy dx`},{label:'Inner integral (∂y)',math:`∫ xy dy = x·y²/2`,note:'Treat x as constant'},{label:'Apply y limits',math:`[x·y²/2]${ay}^${by} = x·(${by}²−${ay}²)/2 = x·${(by*by-ay*ay)/2}`},{label:'Outer integral (∂x)',math:`∫${ax}^${bx} ${(by*by-ay*ay)/2}x dx = ${(by*by-ay*ay)/2}·x²/2`},{label:'Apply x limits',math:`= ${(by*by-ay*ay)/2}·(${bx}²−${ax}²)/2 = ${fmt(integrate2D((x,y)=>x*y,ax,bx,ay,by))}`}]},
  {id:'x2y2',label:'x²+y²',f:(x,y)=>x*x+y*y,fStr:'x²+y²',steps:(ax,bx,ay,by)=>[{label:'Set up',math:`∬ (x²+y²) dA = ∫${ax}^${bx} ∫${ay}^${by} (x²+y²) dy dx`},{label:'Inner integral',math:`∫ (x²+y²) dy = x²y + y³/3`,note:'x² is constant w.r.t. y'},{label:'Apply y limits & outer integral',math:`∫${ax}^${bx} [x²(${by-ay}) + (${by}³−${ay}³)/3] dx`},{label:'Result',math:`= ${fmt(integrate2D((x,y)=>x*x+y*y,ax,bx,ay,by))}`}]},
  {id:'sinxy',label:'sin(x+y)',f:(x,y)=>Math.sin(x+y),fStr:'sin(x+y)',steps:(ax,bx,ay,by)=>[{label:'Set up',math:`∬ sin(x+y) dA`},{label:'Inner integral',math:`∫ sin(x+y) dy = −cos(x+y)`,note:'u-substitution: u=x+y, du=dy'},{label:'Apply y limits',math:`−cos(x+${by}) + cos(x+${ay})`},{label:'Result',math:`= ${fmt(integrate2D((x,y)=>Math.sin(x+y),ax,bx,ay,by))}`}]},
]
const FAQ=[
  {q:'What is a double integral?',a:'A double integral ∬f(x,y)dA integrates over a 2D region. Geometrically, it equals the volume under the surface z=f(x,y) over the region R. For a rectangle, it becomes an iterated integral: ∫∫f(x,y)dy dx — integrate the inner integral first, then the outer.'},
  {q:'What is Fubini\'s theorem?',a:"Fubini's theorem says you can switch the order of integration for nice functions: ∫∫f(x,y)dy dx = ∫∫f(x,y)dx dy. This is useful when one order is easier than the other. The theorem holds when f is continuous on the region."},
  {q:'What is a double integral used for?',a:'Volume: ∬f(x,y)dA = volume under z=f(x,y). Area: ∬1 dA = area of region R. Mass: ∬ρ(x,y)dA where ρ is density. Average value: (1/Area)∬f(x,y)dA. Center of mass. Electric/gravitational potential over a surface.'},
  {q:'How do I handle non-rectangular regions?',a:'For a region bounded by y=g₁(x) and y=g₂(x): ∫ₐᵇ [∫g₁(x)^g₂(x) f(x,y) dy] dx. The inner limits can be functions of x. Polar coordinates are often better for circular regions: ∬f(x,y)dA = ∬f(r cosθ, r sinθ)·r dr dθ.'},
]
export default function DoubleIntegralCalculator({meta,category}){
  const C=category?.color||'#6366f1'
  const[fnId,setFnId]=useState('xy')
  const[ax,setAx]=useState(0);const[bx,setBx]=useState(2)
  const[ay,setAy]=useState(0);const[by,setBy]=useState(3)
  const[openFaq,setFaq]=useState(null)
  const fn=FUNCTIONS.find(f=>f.id===fnId)||FUNCTIONS[0]
  const result=integrate2D(fn.f,ax,bx,ay,by)
  const area=(bx-ax)*(by-ay)
  const avgVal=area>0?result/area:0
  const steps=fn.steps(ax,bx,ay,by)
  const W=180,H=140
  const toSx=x=>20+(x-ax)/(bx-ax+0.001)*(W-40)
  const toSy=y=>H-20-(y-ay)/(by-ay+0.001)*(H-40)
  return(<div style={{display:'flex',flexDirection:'column',gap:20}}>
    <div style={{background:`linear-gradient(135deg,${C}12,${C}06)`,border:`1px solid ${C}30`,borderRadius:14,padding:'16px 20px',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12}}>
      <div>
        <div style={{fontSize:10,fontWeight:700,color:C,textTransform:'uppercase',letterSpacing:'.08em',marginBottom:6}}>Double Integral</div>
        <div style={{fontSize:20,fontWeight:700,color:C,fontFamily:"'Space Grotesk',sans-serif"}}>∬ f(x,y) dA = ∫∫ f(x,y) dy dx</div>
        <div style={{fontSize:11,color:'var(--text-3)',marginTop:4}}>Volume under surface z=f(x,y) over region R</div>
      </div>
      <div style={{padding:'10px 20px',background:C+'18',borderRadius:12,textAlign:'center'}}>
        <div style={{fontSize:11,color:'var(--text-3)',marginBottom:2}}>∬{fn.fStr} dA</div>
        <div style={{fontSize:28,fontWeight:700,color:C,fontFamily:"'Space Grotesk',sans-serif"}}>{fmt(result)}</div>
        <div style={{fontSize:10,color:'var(--text-3)'}}>over [{ax},{bx}]×[{ay},{by}]</div>
      </div>
    </div>
    <div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,padding:'14px 18px'}}>
      <div style={{fontSize:12,fontWeight:600,color:'var(--text-2)',marginBottom:12}}>Select function f(x,y)</div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
        {FUNCTIONS.map(f=>(<button key={f.id} onClick={()=>setFnId(f.id)} style={{padding:'10px',borderRadius:10,border:`1.5px solid ${fnId===f.id?C:'var(--border-2)'}`,background:fnId===f.id?C+'12':'var(--bg-raised)',cursor:'pointer',fontSize:13,fontWeight:700,color:fnId===f.id?C:'var(--text-2)',fontFamily:"'Space Grotesk',sans-serif"}}>{f.fStr}</button>))}
      </div>
    </div>
    <CalcShell
      left={<>
        <div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:12,paddingBottom:8,borderBottom:'0.5px solid var(--border)'}}>f(x,y) = {fn.fStr}</div>
        <div style={{fontSize:12,fontWeight:600,color:'var(--text)',marginBottom:8}}>x limits</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}><Inp label="x from (a)" value={ax} onChange={setAx} color={C}/><Inp label="x to (b)" value={bx} onChange={setBx} color={C}/></div>
        <div style={{fontSize:12,fontWeight:600,color:'var(--text)',marginBottom:8,marginTop:4}}>y limits</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}><Inp label="y from (c)" value={ay} onChange={setAy} color={C}/><Inp label="y to (d)" value={by} onChange={setBy} color={C}/></div>
        <div style={{padding:'10px 14px',background:C+'08',borderRadius:10,border:`1px solid ${C}20`,marginBottom:14,marginTop:4}}>
          <div style={{fontSize:13,fontWeight:700,color:C,fontFamily:"'Space Grotesk',sans-serif"}}>∫{ax}^{bx} ∫{ay}^{by} {fn.fStr} dy dx</div>
          <div style={{fontSize:16,fontWeight:700,color:C,marginTop:4}}>= {fmt(result)}</div>
        </div>
        <div style={{display:'flex',gap:10}}>
          <button style={{flex:1,padding:13,borderRadius:10,border:'none',background:C,color:'#fff',fontSize:14,fontWeight:700,cursor:'pointer'}}>Integrate →</button>
          <button onClick={()=>{setAx(0);setBx(2);setAy(0);setBy(3)}} style={{padding:'13px 18px',borderRadius:10,border:'1.5px solid var(--border-2)',background:'var(--bg-raised)',color:'var(--text-2)',fontSize:13,fontWeight:500,cursor:'pointer'}}>Reset</button>
        </div>
      </>}
      right={<>
        <div style={{background:'var(--bg-card)',border:`1.5px solid ${C}30`,borderRadius:14,padding:'18px 20px',marginBottom:14}}>
          <div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',marginBottom:8}}>∬ {fn.fStr} dA</div>
          <div style={{fontSize:38,fontWeight:700,color:C,fontFamily:"'Space Grotesk',sans-serif"}}>{fmt(result)}</div>
          <div style={{fontSize:12,color:'var(--text-3)',marginTop:6}}>Area of region: {fmt(area)} · Average value: {fmt(avgVal)}</div>
        </div>
        <div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,padding:'14px 18px',marginBottom:14}}>
          <div style={{fontSize:12,fontWeight:700,color:'var(--text)',marginBottom:8}}>Integration region R</div>
          <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{display:'block',background:'var(--bg-raised)',borderRadius:8}}>
            <rect x={20} y={20} width={W-40} height={H-40} fill={C+'15'} stroke={C} strokeWidth="2" rx="4"/>
            <line x1={20} y1={H-20} x2={W-10} y2={H-20} stroke="var(--border)" strokeWidth="1"/>
            <line x1={20} y1={H-20} x2={20} y2={10} stroke="var(--border)" strokeWidth="1"/>
            <text x={W/2} y={H-5} textAnchor="middle" fontSize="9" fill={C} fontWeight="700">x: [{ax},{bx}]</text>
            <text x={8} y={H/2} textAnchor="middle" fontSize="9" fill={C} fontWeight="700" transform={`rotate(-90,8,${H/2})`}>y: [{ay},{by}]</text>
            <text x={W/2} y={H/2} textAnchor="middle" fontSize="11" fill={C} fontWeight="700">∬ {fn.fStr} dA</text>
            <text x={W/2} y={H/2+16} textAnchor="middle" fontSize="13" fill={C} fontWeight="700">= {fmt(result)}</text>
          </svg>
        </div>
        <BreakdownTable title="Results" rows={[
          {label:'∬ f(x,y) dA',value:fmt(result),bold:true,highlight:true,color:C},
          {label:'Region area',value:fmt(area)},
          {label:'Average value',value:fmt(avgVal),note:'result ÷ area'},
          {label:'x range',value:`[${ax}, ${bx}]`},
          {label:'y range',value:`[${ay}, ${by}]`},
        ]}/>
        <AIHintCard hint={`∬${fn.fStr} dA over [${ax},${bx}]×[${ay},${by}] = ${fmt(result)}. This equals the volume under the surface z=${fn.fStr}. Average value = ${fmt(avgVal)}.`} color={C}/>
      </>}
    />
    <Sec title="Step-by-step — iterated integration">
      <div style={{display:'flex',flexDirection:'column',gap:14}}>
        {steps.map((s,i)=>(<div key={i} style={{display:'flex',gap:14}}><div style={{width:26,height:26,borderRadius:'50%',flexShrink:0,background:i===steps.length-1?C:C+'18',border:`1.5px solid ${C}40`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,color:i===steps.length-1?'#fff':C}}>{i===steps.length-1?'✓':i+1}</div><div style={{flex:1}}>{s.label&&<div style={{fontSize:10,fontWeight:700,color:C,textTransform:'uppercase',letterSpacing:'.06em',marginBottom:4}}>{s.label}</div>}<div style={{fontSize:13,fontFamily:"'Space Grotesk',sans-serif",background:'var(--bg-raised)',padding:'8px 12px',borderRadius:8,border:`0.5px solid ${i===steps.length-1?C+'40':'var(--border)'}`}}>{s.math}</div>{s.note&&<div style={{fontSize:11.5,color:'var(--text-3)',marginTop:4,fontStyle:'italic'}}>↳ {s.note}</div>}</div></div>))}
      </div>
    </Sec>
    <Sec title="Frequently asked questions">
      {FAQ.map((f,i)=><Acc key={i} q={f.q} a={f.a} open={openFaq===i} onToggle={()=>setFaq(openFaq===i?null:i)} color={C}/>)}
    </Sec>
  </div>)
}
