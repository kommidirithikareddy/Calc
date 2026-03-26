// ═══════════════════════════════════════════════════════════════
//  GEOMETRY CALCULATORS — Batch 2: 4 calculators
//  CircleCalculator · RightTriangleCalculator
//  SlopeCalculator  · AngleCalculator
// ═══════════════════════════════════════════════════════════════
import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'

const fmt=(n,d=4)=>isNaN(n)||!isFinite(n)||n===null?'—':parseFloat(Number(n).toFixed(d)).toString()
const deg=r=>r*180/Math.PI, rad=d=>d*Math.PI/180
const PI=Math.PI, sq=n=>n*n

function Sec({title,sub,children}){return(<div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,overflow:'hidden'}}><div style={{padding:'13px 18px',borderBottom:'0.5px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center'}}><span style={{fontSize:13,fontWeight:700,color:'var(--text)',fontFamily:"'Space Grotesk',sans-serif"}}>{title}</span>{sub&&<span style={{fontSize:11,color:'var(--text-3)'}}>{sub}</span>}</div><div style={{padding:'16px 18px'}}>{children}</div></div>)}
function Acc({q,a,open,onToggle,color}){return(<div style={{borderBottom:'0.5px solid var(--border)'}}><button onClick={onToggle} style={{width:'100%',display:'flex',justifyContent:'space-between',alignItems:'center',padding:'13px 0',background:'none',border:'none',cursor:'pointer',gap:12,textAlign:'left'}}><span style={{fontSize:13,fontWeight:600,color:'var(--text)',fontFamily:"'DM Sans',sans-serif",lineHeight:1.4}}>{q}</span><span style={{fontSize:18,color,flexShrink:0,transform:open?'rotate(45deg)':'none',transition:'transform .2s'}}>+</span></button>{open&&<p style={{fontSize:12.5,color:'var(--text-2)',lineHeight:1.75,margin:'0 0 13px',fontFamily:"'DM Sans',sans-serif"}}>{a}</p>}</div>)}
function StepsCard({steps,color}){const[exp,setExp]=useState(false);if(!steps?.length)return null;const vis=exp?steps:steps.slice(0,2);return(<div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,overflow:'hidden'}}><div style={{padding:'12px 18px',borderBottom:'0.5px solid var(--border)',display:'flex',justifyContent:'space-between'}}><span style={{fontSize:13,fontWeight:700,color:'var(--text)',fontFamily:"'Space Grotesk',sans-serif"}}>Step-by-step working</span><span style={{fontSize:11,color:'var(--text-3)'}}>{steps.length} steps</span></div><div style={{padding:'16px 18px',display:'flex',flexDirection:'column',gap:14}}>{vis.map((s,i)=>(<div key={i} style={{display:'flex',gap:14,alignItems:'flex-start'}}><div style={{width:26,height:26,borderRadius:'50%',flexShrink:0,background:i===steps.length-1?color:color+'18',border:`1.5px solid ${color}40`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,color:i===steps.length-1?'#fff':color}}>{i===steps.length-1?'✓':i+1}</div><div style={{flex:1}}>{s.label&&<div style={{fontSize:10,fontWeight:700,color,textTransform:'uppercase',letterSpacing:'.06em',marginBottom:4}}>{s.label}</div>}<div style={{fontSize:13,fontFamily:"'Space Grotesk',sans-serif",fontWeight:i===steps.length-1?700:500,background:'var(--bg-raised)',padding:'8px 12px',borderRadius:8,border:`0.5px solid ${i===steps.length-1?color+'40':'var(--border)'}`}}>{s.math}</div>{s.note&&<div style={{fontSize:11.5,color:'var(--text-3)',marginTop:4,fontStyle:'italic'}}>↳ {s.note}</div>}</div></div>))}{steps.length>2&&<button onClick={()=>setExp(e=>!e)} style={{padding:'9px',borderRadius:9,border:`1px solid ${color}30`,background:color+'08',color,fontSize:12,fontWeight:600,cursor:'pointer'}}>{exp?'▲ Hide steps':`▼ Show all ${steps.length} steps`}</button>}</div></div>)}
function MathInput({label,value,onChange,color,unit,hint,disabled}){const[f,setF]=useState(false);return(<div style={{marginBottom:12,opacity:disabled?.45:1}}><div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}><label style={{fontSize:12,fontWeight:600,color:'var(--text)',fontFamily:"'DM Sans',sans-serif"}}>{label}</label>{hint&&<span style={{fontSize:10,color:'var(--text-3)'}}>{hint}</span>}</div><div style={{display:'flex',height:42,border:`1.5px solid ${f&&!disabled?color:'var(--border-2)'}`,borderRadius:9,overflow:'hidden',background:'var(--bg-card)',transition:'border-color .15s'}}><input disabled={disabled} type="number" value={value} onChange={e=>onChange(e.target.value===''?'':Number(e.target.value))} onFocus={()=>setF(true)} onBlur={()=>setF(false)} style={{flex:1,border:'none',background:'transparent',padding:'0 12px',fontSize:16,fontWeight:700,color:'var(--text)',outline:'none',fontFamily:"'Space Grotesk',sans-serif",cursor:disabled?'not-allowed':'text'}}/>{unit&&<div style={{padding:'0 10px',display:'flex',alignItems:'center',background:'var(--bg-raised)',borderLeft:'1px solid var(--border)',fontSize:12,fontWeight:600,color:'var(--text-3)'}}>{unit}</div>}</div></div>)}
function FormulaCard({title,formula,desc,color,sub}){return(<div style={{background:`linear-gradient(135deg,${color}12,${color}06)`,border:`1px solid ${color}30`,borderRadius:14,padding:'16px 20px'}}><div style={{fontSize:10,fontWeight:700,color,textTransform:'uppercase',letterSpacing:'.08em',marginBottom:6}}>{title||'Formula'}</div><div style={{fontSize:18,fontWeight:800,color,fontFamily:"'Space Grotesk',sans-serif",lineHeight:1.3}}>{formula}</div>{desc&&<div style={{fontSize:11,color:'var(--text-2)',marginTop:6}}>{desc}</div>}{sub&&<div style={{fontSize:11,color:'var(--text-3)',marginTop:4}}>{sub}</div>}</div>)}
function BigResult({label,value,unit,color,note}){return(<div style={{background:'var(--bg-card)',border:`1.5px solid ${color}30`,borderRadius:14,padding:'16px 20px',marginBottom:12}}><div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:6}}>{label}</div><div style={{fontSize:44,fontWeight:700,color,fontFamily:"'Space Grotesk',sans-serif",lineHeight:1,wordBreak:'break-all'}}>{value}{unit&&<span style={{fontSize:18,marginLeft:4}}>{unit}</span>}</div>{note&&<div style={{marginTop:10,padding:'9px 12px',background:color+'08',borderRadius:8,border:`0.5px solid ${color}20`,fontSize:12,color:'var(--text-2)',lineHeight:1.6}}>💡 {note}</div>}</div>)}

// ═══════════════════════════════════════════════════════════════
//  CIRCLE CALCULATOR
// ═══════════════════════════════════════════════════════════════

export default function SlopeCalculator({meta,category}){
  const C=category?.color||'#3b82f6'
  const[x1,setX1]=useState(1), [y1,setY1]=useState(2)
  const[x2,setX2]=useState(5), [y2,setY2]=useState(10)
  const[openFaq,setOpenFaq]=useState(null)

  const nx1=Number(x1)||0,ny1=Number(y1)||0,nx2=Number(x2)||0,ny2=Number(y2)||0
  const dx=nx2-nx1, dy=ny2-ny1
  const slope=dx===0?Infinity:dy/dx
  const angle=deg(Math.atan2(dy,dx))
  const midX=(nx1+nx2)/2, midY=(ny1+ny2)/2
  const dist=Math.sqrt(dx*dx+dy*dy)
  const perpSlope=slope===0?Infinity:slope===Infinity?0:-1/slope
  const yIntercept=ny1-slope*nx1
  const slopeDir=slope===0?'Horizontal':slope===Infinity?'Vertical':slope>0?'Positive (rising)':'Negative (falling)'

  const lineEq=slope===Infinity?`x = ${nx1}`:slope===0?`y = ${fmt(ny1,2)}`:`y = ${fmt(slope,4)}x ${yIntercept>=0?'+':''} ${fmt(yIntercept,4)}`

  const steps=[
    {label:'Identify the two points',math:`P₁ = (${nx1}, ${ny1}),  P₂ = (${nx2}, ${ny2})`},
    {label:'Apply slope formula',math:`m = (y₂ − y₁) / (x₂ − x₁)`,note:'Rise over run — how much y changes per unit of x'},
    {label:'Calculate rise and run',math:`Rise = y₂ − y₁ = ${ny2} − ${ny1} = ${dy},  Run = x₂ − x₁ = ${nx2} − ${nx1} = ${dx}`},
    {label:'Calculate slope',math:`m = ${dy} / ${dx} = ${fmt(slope,4)}`,note:slopeDir},
    {label:'Line equation (slope-intercept)',math:`y = mx + b → b = y₁ − m·x₁ = ${ny1} − ${fmt(slope,4)}×${nx1} = ${fmt(yIntercept,4)}`,note:'b is the y-intercept (where the line crosses the y-axis)'},
    {label:'Midpoint',math:`M = ((x₁+x₂)/2, (y₁+y₂)/2) = (${fmt(midX,4)}, ${fmt(midY,4)})`},
    {label:'Distance',math:`d = √((x₂−x₁)²+(y₂−y₁)²) = √(${dx*dx}+${dy*dy}) = ${fmt(dist,4)}`,note:'Pythagorean theorem applied to coordinate geometry'},
  ]

  // SVG grid
  const allX=[nx1,nx2,0], allY=[ny1,ny2,0]
  const minX=Math.min(...allX)-1, maxX=Math.max(...allX)+1
  const minY=Math.min(...allY)-1, maxY=Math.max(...allY)+1
  const W=180, H=140, padX=20, padY=15
  const toSvgX=x=>padX+(x-minX)/(maxX-minX||1)*(W-2*padX)
  const toSvgY=y=>H-padY-(y-minY)/(maxY-minY||1)*(H-2*padY)

  return(<div style={{display:'flex',flexDirection:'column',gap:20}}>
    <FormulaCard title="Slope, Distance & Midpoint" formula="m = Δy/Δx    d = √(Δx²+Δy²)    M = ((x₁+x₂)/2, (y₁+y₂)/2)" desc="Three fundamental coordinate geometry calculations from any two points." color={C}/>

    <CalcShell left={<>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:6}}>
        <div><div style={{fontSize:12,fontWeight:700,color:C,marginBottom:8,fontFamily:"'Space Grotesk',sans-serif"}}>Point 1 (x₁, y₁)</div><MathInput label="x₁" value={x1} onChange={setX1} color={C}/><MathInput label="y₁" value={y1} onChange={setY1} color={C}/></div>
        <div><div style={{fontSize:12,fontWeight:700,color:'#10b981',marginBottom:8,fontFamily:"'Space Grotesk',sans-serif"}}>Point 2 (x₂, y₂)</div><MathInput label="x₂" value={x2} onChange={setX2} color='#10b981'/><MathInput label="y₂" value={y2} onChange={setY2} color='#10b981'/></div>
      </div>
      <div style={{borderTop:'0.5px solid var(--border)',paddingTop:12}}>
        <div style={{fontSize:10,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:10}}>🎯 Examples</div>
        {[{x1:0,y1:0,x2:4,y2:4,l:'Slope = 1 (45° line)'},{x1:0,y1:0,x2:4,y2:0,l:'Slope = 0 (horizontal)'},{x1:2,y1:0,x2:2,y2:4,l:'Slope = ∞ (vertical)'},{x1:-2,y1:8,x2:4,y2:2,l:'Slope = -1 (falling)'}].map((ex,i)=>(<button key={i} onClick={()=>{setX1(ex.x1);setY1(ex.y1);setX2(ex.x2);setY2(ex.y2)}} style={{display:'block',width:'100%',padding:'7px 12px',borderRadius:8,border:'1px solid var(--border-2)',background:'var(--bg-raised)',cursor:'pointer',textAlign:'left',marginBottom:5,fontSize:12,color:'var(--text)'}} onMouseEnter={e=>e.currentTarget.style.borderColor=C+'60'} onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border-2)'}>{ex.l}</button>))}
      </div>
    </>} right={<>
      {/* Coordinate grid SVG */}
      <div style={{background:'var(--bg-card)',border:`1.5px solid ${C}30`,borderRadius:14,padding:'14px 18px',marginBottom:12}}>
        <div style={{fontSize:12,fontWeight:700,color:'var(--text)',marginBottom:8}}>Coordinate grid</div>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{display:'block'}}>
          {/* grid lines */}
          {[...Array(Math.ceil(maxX)-Math.floor(minX)+1)].map((_,i)=>{const gx=Math.floor(minX)+i;return(<line key={`vg${i}`} x1={toSvgX(gx)} y1={padY} x2={toSvgX(gx)} y2={H-padY} stroke="var(--border)" strokeWidth="0.5"/>)})}
          {[...Array(Math.ceil(maxY)-Math.floor(minY)+1)].map((_,i)=>{const gy=Math.floor(minY)+i;return(<line key={`hg${i}`} x1={padX} y1={toSvgY(gy)} x2={W-padX} y2={toSvgY(gy)} stroke="var(--border)" strokeWidth="0.5"/>)})}
          {/* axes */}
          {minX<=0&&maxX>=0&&<line x1={toSvgX(0)} y1={padY} x2={toSvgX(0)} y2={H-padY} stroke="var(--text-3)" strokeWidth="1"/>}
          {minY<=0&&maxY>=0&&<line x1={padX} y1={toSvgY(0)} x2={W-padX} y2={toSvgY(0)} stroke="var(--text-3)" strokeWidth="1"/>}
          {/* line */}
          <line x1={toSvgX(nx1)} y1={toSvgY(ny1)} x2={toSvgX(nx2)} y2={toSvgY(ny2)} stroke={C} strokeWidth="2"/>
          {/* rise/run */}
          <line x1={toSvgX(nx1)} y1={toSvgY(ny1)} x2={toSvgX(nx2)} y2={toSvgY(ny1)} stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4,2"/>
          <line x1={toSvgX(nx2)} y1={toSvgY(ny1)} x2={toSvgX(nx2)} y2={toSvgY(ny2)} stroke="#10b981" strokeWidth="1.5" strokeDasharray="4,2"/>
          {/* points */}
          <circle cx={toSvgX(nx1)} cy={toSvgY(ny1)} r="5" fill={C}/>
          <circle cx={toSvgX(nx2)} cy={toSvgY(ny2)} r="5" fill="#10b981"/>
          <circle cx={toSvgX(midX)} cy={toSvgY(midY)} r="4" fill="#f59e0b" opacity="0.8"/>
          {/* labels */}
          <text x={toSvgX(nx1)-6} y={toSvgY(ny1)-8} fontSize="9" fontWeight="700" fill={C}>P₁({nx1},{ny1})</text>
          <text x={toSvgX(nx2)+4} y={toSvgY(ny2)-8} fontSize="9" fontWeight="700" fill="#10b981">P₂({nx2},{ny2})</text>
          <text x={toSvgX((nx1+nx2)/2)} y={toSvgY(ny1)+11} textAnchor="middle" fontSize="8" fill="#f59e0b">run={dx}</text>
          <text x={toSvgX(nx2)+12} y={toSvgY((ny1+ny2)/2)} fontSize="8" fill="#10b981">rise={dy}</text>
        </svg>
      </div>
      {/* Results */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:12}}>
        {[{label:'Slope (m)',val:slope===Infinity?'∞':slope===-Infinity?'-∞':fmt(slope,4),color:C,dir:slopeDir},{label:'Distance',val:fmt(dist,4)+' units',color:'#10b981',dir:''},{label:'Midpoint',val:`(${fmt(midX,2)}, ${fmt(midY,2)})`,color:'#f59e0b',dir:''},{label:'Angle',val:fmt(angle,2)+'°',color:'#8b5cf6',dir:'from horizontal'}].map((s,i)=>(<div key={i} style={{padding:'10px 12px',background:'var(--bg-raised)',borderRadius:10,border:`0.5px solid ${s.color}25`}}><div style={{fontSize:9,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:3}}>{s.label}</div><div style={{fontSize:16,fontWeight:700,color:s.color,fontFamily:"'Space Grotesk',sans-serif"}}>{s.val}</div>{s.dir&&<div style={{fontSize:9,color:'var(--text-3)',marginTop:2}}>{s.dir}</div>}</div>))}
      </div>
      <div style={{padding:'10px 14px',background:C+'08',borderRadius:10,border:`0.5px solid ${C}20`,fontSize:12,fontWeight:600,color:C,marginBottom:12,fontFamily:"'Space Grotesk',sans-serif"}}>Line equation: {lineEq}</div>
      <BreakdownTable title="Full summary" rows={[{label:'Slope m',value:slope===Infinity?'∞':fmt(slope,4),bold:true,highlight:true,color:C},{label:'y-intercept b',value:fmt(yIntercept,4)},{label:'Line equation',value:lineEq},{label:'Perpendicular slope',value:perpSlope===Infinity?'∞':fmt(perpSlope,4)},{label:'Distance',value:fmt(dist,4)+' units'},{label:'Midpoint',value:`(${fmt(midX,2)}, ${fmt(midY,2)})`},{label:'Direction',value:slopeDir}]}/>
      <AIHintCard hint={`Slope: m=${fmt(slope,4)}, Equation: ${lineEq}, Distance: ${fmt(dist,4)}, Midpoint: (${fmt(midX,2)},${fmt(midY,2)})`}/>
    </>}/>

    <StepsCard steps={steps} color={C}/>

    {/* Slope steepness chart */}
    <Sec title="Slope steepness — visual comparison" sub="What different slopes look like">
      {[[-2,'Very steep fall',C+'80',-1,'Steep fall','#ef4444'],[-0.5,'Gentle fall','#f97316',0,'Horizontal line','#94a3b8'],[0.5,'Gentle rise','#10b981'],[1,'45° — equal rise and run','#3b82f6'],[2,'Steep rise','#8b5cf6'],['∞','Vertical (undefined)','#ec4899']].flat().filter((_,i)=>i%3===0).map((s,i)=>null)}
      <div style={{display:'flex',flexDirection:'column',gap:6}}>
        {[{m:-2,label:'−2: Very steep fall',color:'#ef4444'},{m:-1,label:'−1: 45° fall',color:'#f97316'},{m:-0.5,label:'−0.5: Gentle fall',color:'#f59e0b'},{m:0,label:'0: Horizontal',color:'#94a3b8'},{m:0.5,label:'0.5: Gentle rise',color:'#10b981'},{m:1,label:'1: 45° rise',color:'#3b82f6'},{m:2,label:'2: Very steep rise',color:'#8b5cf6'}].map((s,i)=>(<div key={i} style={{display:'flex',alignItems:'center',gap:12}}><div style={{width:60,fontSize:11,fontWeight:700,color:s.color,fontFamily:"'Space Grotesk',sans-serif",textAlign:'right'}}>{s.label.split(':')[0]}</div><div style={{flex:1,height:4,background:'var(--border)',borderRadius:2,position:'relative'}}><div style={{position:'absolute',left:'50%',top:'50%',transform:'translate(-50%,-50%)',width:40,height:3,background:s.color,borderRadius:2,rotate:`${-deg(Math.atan(s.m))}deg`}}/></div><div style={{width:80,fontSize:10,color:'var(--text-3)'}}>{s.label.split(':')[1]}</div></div>))}
      </div>
    </Sec>

    <Sec title="⚠️ Common mistakes">
      <div style={{display:'flex',flexDirection:'column',gap:8}}>
        {['Calculating (x₂-x₁)/(y₂-y₁) instead of (y₂-y₁)/(x₂-x₁) — slope is RISE over RUN, y over x','Saying a vertical line has undefined slope — it does not have slope 0, it has NO slope (undefined because division by zero)','Confusing negative slope with a line going "down-left" — a negative slope simply means y decreases as x increases'].map((m,i)=>(<div key={i} style={{display:'flex',gap:12,padding:'10px 14px',borderRadius:9,background:'#fee2e210',border:'0.5px solid #ef444420'}}><span style={{fontSize:14,flexShrink:0,color:'#ef4444',fontWeight:700}}>✗</span><span style={{fontSize:12.5,color:'var(--text-2)',lineHeight:1.6}}>{m}</span></div>))}
      </div>
    </Sec>

    <Sec title="Frequently asked questions">
      {[{q:'What does slope actually mean in real life?',a:'Slope is rate of change — how much one quantity changes per unit of another. In a speed graph, slope = acceleration. In finance, slope of a price line = rate of price change. A road with slope 0.1 rises 1 metre for every 10 metres of horizontal distance (a 10% grade). The slope formula is the same regardless of what the axes represent.'},{q:'What is perpendicular slope?',a:'Two lines are perpendicular (meet at 90°) if their slopes multiply to −1. If m₁ = 2, then m₂ = −1/2. This is the negative reciprocal rule. Parallel lines have identical slopes. This is used in geometry proofs, CAD design, and determining if buildings are truly level.'},{q:'Why is a vertical line\'s slope undefined?',a:'Slope = rise/run = Δy/Δx. For a vertical line, all points have the same x-coordinate, so Δx=0. Division by zero is undefined in mathematics. Physically: a vertical line rises infinitely steeply — the "steepness" is beyond any finite number.'}].map((f,i)=>(<Acc key={i} q={f.q} a={f.a} open={openFaq===i} onToggle={()=>setOpenFaq(openFaq===i?null:i)} color={C}/>))}
    </Sec>
  </div>)
}

// ═══════════════════════════════════════════════════════════════
//  ANGLE CALCULATOR
// ═══════════════════════════════════════════════════════════════
