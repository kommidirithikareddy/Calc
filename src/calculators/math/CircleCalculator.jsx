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

export default function CircleCalculator({meta,category}){
  const C=category?.color||'#3b82f6'
  const[from,setFrom]=useState('r')
  const[val,setVal]=useState(7)
  const[sectorAngle,setSectorAngle]=useState(90)
  const[openFaq,setOpenFaq]=useState(null)

  const v=Number(val)||0
  let r=0
  if(from==='r') r=v
  else if(from==='d') r=v/2
  else if(from==='C') r=v/(2*PI)
  else if(from==='A') r=Math.sqrt(v/PI)

  const d=2*r, circ=2*PI*r, area=PI*r*r
  const sA=(sectorAngle/360)*area, sL=(sectorAngle/360)*circ

  const steps=[
    {label:'Given input',math:`${from==='r'?'radius':from==='d'?'diameter':from==='C'?'circumference':'area'} = ${v}`,note:`Converting to radius first`},
    from!=='r'?{label:'Find radius',math:from==='d'?`r = d/2 = ${v}/2 = ${fmt(r)}`:from==='C'?`r = C/(2π) = ${v}/(2×${fmt(PI)}) = ${fmt(r)}`:from==='A'?`r = √(A/π) = √(${v}/π) = ${fmt(r)}`:null,note:'All circle properties derive from radius'}:{label:'Radius given',math:`r = ${r}`},
    {label:'Diameter',math:`d = 2r = 2 × ${fmt(r)} = ${fmt(d)}`},
    {label:'Circumference',math:`C = 2πr = 2 × π × ${fmt(r)} = ${fmt(circ)}`,note:'π ≈ 3.14159265...'},
    {label:'Area',math:`A = πr² = π × ${fmt(r)}² = π × ${fmt(r*r)} = ${fmt(area)}`},
    {label:'Summary',math:`r=${fmt(r)}, d=${fmt(d)}, C=${fmt(circ)}, A=${fmt(area)}`},
  ].filter(Boolean)

  return(<div style={{display:'flex',flexDirection:'column',gap:20}}>
    <FormulaCard title="Circle formulas" formula="C = 2πr = πd     A = πr²" desc="All circle measurements derive from one value — enter any one and get all four." color={C} sub="r = radius · d = diameter · C = circumference · A = area"/>

    <CalcShell left={<>
      <div style={{fontSize:12,fontWeight:600,color:'var(--text-2)',marginBottom:10}}>Enter any one measurement</div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginBottom:14}}>
        {[{v:'r',l:'Radius (r)'},{v:'d',l:'Diameter (d)'},{v:'C',l:'Circumference (C)'},{v:'A',l:'Area (A)'}].map(f=>(<button key={f.v} onClick={()=>setFrom(f.v)} style={{padding:'9px',borderRadius:9,border:`1.5px solid ${from===f.v?C:'var(--border-2)'}`,background:from===f.v?C+'12':'var(--bg-raised)',cursor:'pointer',fontSize:12,fontWeight:from===f.v?700:500,color:from===f.v?C:'var(--text)'}}>{f.l}</button>))}
      </div>
      <MathInput label={from==='r'?'Radius':from==='d'?'Diameter':from==='C'?'Circumference':'Area'} value={val} onChange={setVal} color={C} unit={from==='A'?'sq units':'units'}/>
      <div style={{borderTop:'0.5px solid var(--border)',paddingTop:14,marginTop:4}}>
        <div style={{fontSize:12,fontWeight:600,color:'var(--text-2)',marginBottom:8}}>Sector / Arc calculator</div>
        <MathInput label="Central angle" value={sectorAngle} onChange={setSectorAngle} color={C} unit="°" hint="0–360"/>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
          {[{label:'Sector area',val:fmt(sA)+' sq u'},{label:'Arc length',val:fmt(sL)+' u'}].map((s,i)=>(<div key={i} style={{padding:'10px',background:'var(--bg-raised)',borderRadius:9,border:`0.5px solid ${C}25`}}><div style={{fontSize:10,color:'var(--text-3)',marginBottom:3}}>{s.label}</div><div style={{fontSize:14,fontWeight:700,color:C,fontFamily:"'Space Grotesk',sans-serif"}}>{s.val}</div></div>))}
        </div>
        <div style={{borderTop:'0.5px solid var(--border)',paddingTop:12,marginTop:12}}>
          <div style={{fontSize:10,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:10}}>🎯 Common circles</div>
          {[{v:7,from:'r',l:'r=7 (classic textbook)'},{v:14,from:'d',l:'d=14 cm pizza'},{v:31.4,from:'C',l:'C≈31.4 (≈10π)'},{v:314,from:'A',l:'A=314 sq cm'}].map((ex,i)=>(<button key={i} onClick={()=>{setVal(ex.v);setFrom(ex.from)}} style={{display:'block',width:'100%',padding:'7px 12px',borderRadius:8,border:'1px solid var(--border-2)',background:'var(--bg-raised)',cursor:'pointer',textAlign:'left',marginBottom:5,fontSize:12,color:'var(--text)'}} onMouseEnter={e=>e.currentTarget.style.borderColor=C+'60'} onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border-2)'}>{ex.l}</button>))}
        </div>
      </div>
    </>} right={<>
      {/* Circle SVG */}
      <div style={{background:'var(--bg-card)',border:`1.5px solid ${C}30`,borderRadius:14,padding:'14px 18px',marginBottom:14}}>
        <div style={{fontSize:12,fontWeight:700,color:'var(--text)',marginBottom:10}}>Circle diagram</div>
        <svg viewBox="0 0 180 180" width="100%" style={{display:'block'}}>
          <circle cx={90} cy={90} r={72} fill={C+'12'} stroke={C} strokeWidth="2"/>
          {/* sector highlight */}
          {sectorAngle>0&&sectorAngle<360&&(<path d={`M90,90 L${90+72*Math.cos(-PI/2)},${90+72*Math.sin(-PI/2)} A72,72 0 ${sectorAngle>180?1:0},1 ${90+72*Math.cos(rad(sectorAngle)-PI/2)},${90+72*Math.sin(rad(sectorAngle)-PI/2)} Z`} fill={C+'30'} stroke={C} strokeWidth="1"/>)}
          {/* radius line */}
          <line x1={90} y1={90} x2={162} y2={90} stroke={C} strokeWidth="1.5" strokeDasharray="3,2"/>
          <text x={126} y={84} textAnchor="middle" fontSize="11" fontWeight="700" fill={C}>r={fmt(r,2)}</text>
          {/* diameter */}
          <line x1={18} y1={90} x2={162} y2={90} stroke="var(--border)" strokeWidth="1" strokeDasharray="2,3"/>
          <text x={90} y={178} textAnchor="middle" fontSize="10" fill="var(--text-3)">d={fmt(d,2)}</text>
          {sectorAngle>0&&sectorAngle<360&&<text x={90+30*Math.cos(rad(sectorAngle/2)-PI/2)} y={90+30*Math.sin(rad(sectorAngle/2)-PI/2)} textAnchor="middle" fontSize="9" fontWeight="700" fill={C}>{sectorAngle}°</text>}
        </svg>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:12}}>
        {[{label:'Radius',val:fmt(r,4),unit:'units',color:C},{label:'Diameter',val:fmt(d,4),unit:'units',color:'#10b981'},{label:'Circumference',val:fmt(circ,4),unit:'units',color:'#f59e0b'},{label:'Area',val:fmt(area,4),unit:'sq units',color:'#8b5cf6'}].map((s,i)=>(<div key={i} style={{padding:'12px',background:'var(--bg-raised)',borderRadius:10,border:`1px solid ${s.color}20`}}><div style={{fontSize:9,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.06em',marginBottom:3}}>{s.label}</div><div style={{fontSize:20,fontWeight:700,color:s.color,fontFamily:"'Space Grotesk',sans-serif"}}>{s.val}</div><div style={{fontSize:9,color:'var(--text-3)',marginTop:1}}>{s.unit}</div></div>))}
      </div>
      <AIHintCard hint={`Circle with ${from}=${v}: r=${fmt(r)}, d=${fmt(d)}, C=${fmt(circ)}, A=${fmt(area)}`}/>
    </>}/>

    <StepsCard steps={steps} color={C}/>

    {/* π facts */}
    <Sec title="π (Pi) — the number that defines circles" sub="3.14159265358979...">
      <div style={{display:'flex',flexDirection:'column',gap:10}}>
        {[{icon:'🔢',title:'π is irrational and transcendental',desc:'π cannot be expressed as a fraction and is not the root of any polynomial with rational coefficients. Its decimal never ends or repeats. Computers have calculated over 100 trillion digits.'},{icon:'📐',title:'π appears far beyond circles',desc:'π shows up in probability (the Gaussian bell curve), quantum mechanics, Fourier transforms, and even the distribution of prime numbers — a deep connection between circles and the fabric of mathematics.'},{icon:'🏛️',title:'Known for over 4000 years',desc:'Babylonians used π ≈ 25/8 = 3.125. Archimedes (250 BC) bounded it between 223/71 and 22/7. Today, supercomputers race to compute trillions of decimal places.'},{icon:'📅',title:'Pi Day — March 14',desc:"March 14 (3/14) is Pi Day, celebrated worldwide. In 2015 it was extra special: 3/14/15 at 9:26:53 AM matched π's digits: 3.14159265..."}].map((f,i)=>(<div key={i} style={{display:'flex',gap:12,padding:'12px',borderRadius:10,background:'var(--bg-raised)',border:'0.5px solid var(--border)'}}><span style={{fontSize:20,flexShrink:0}}>{f.icon}</span><div><div style={{fontSize:12,fontWeight:700,color:'var(--text)',marginBottom:3}}>{f.title}</div><div style={{fontSize:11.5,color:'var(--text-2)',lineHeight:1.65}}>{f.desc}</div></div></div>))}
      </div>
    </Sec>

    {/* Circle formulas table */}
    <Sec title="All circle formulas — reference table">
      <table style={{width:'100%',borderCollapse:'collapse',fontFamily:"'DM Sans',sans-serif"}}>
        <thead><tr style={{borderBottom:`2px solid ${C}30`}}>{['Quantity','Formula','Given r='+fmt(r,2)].map(h=>(<th key={h} style={{padding:'8px 10px',textAlign:'left',fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.06em'}}>{h}</th>))}</tr></thead>
        <tbody>{[
          {name:'Diameter',formula:'d = 2r',val:fmt(d,4)+' units'},
          {name:'Circumference',formula:'C = 2πr = πd',val:fmt(circ,4)+' units'},
          {name:'Area',formula:'A = πr²',val:fmt(area,4)+' sq units'},
          {name:'Arc length (θ°)',formula:'L = (θ/360) × 2πr',val:fmt(sL,4)+' units (at '+sectorAngle+'°)'},
          {name:'Sector area (θ°)',formula:'A = (θ/360) × πr²',val:fmt(sA,4)+' sq units'},
          {name:'Chord length',formula:'c = 2r·sin(θ/2)',val:fmt(2*r*Math.sin(rad(sectorAngle/2)),4)+' units'},
          {name:'Inscribed circle of square s',formula:'r = s/2',val:'(side='+fmt(2*r,2)+' → r='+fmt(r,2)+')'},
        ].map((t,i)=>(<tr key={i} style={{borderBottom:'0.5px solid var(--border)'}}><td style={{padding:'8px 10px',fontWeight:700,color:C,fontFamily:"'Space Grotesk',sans-serif",fontSize:12}}>{t.name}</td><td style={{padding:'8px 10px',fontSize:12,fontFamily:"'Space Grotesk',sans-serif"}}>{t.formula}</td><td style={{padding:'8px 10px',fontSize:12,color:'var(--text-2)'}}>{t.val}</td></tr>))}</tbody>
      </table>
    </Sec>

    <Sec title="⚠️ Common mistakes">
      <div style={{display:'flex',flexDirection:'column',gap:8}}>
        {['Confusing radius and diameter — r is half the diameter, not the full width','Using πd² instead of πr² for area — the formula is πr², always','Forgetting units — area is in square units while circumference and radius are in linear units'].map((m,i)=>(<div key={i} style={{display:'flex',gap:12,padding:'10px 14px',borderRadius:9,background:'#fee2e210',border:'0.5px solid #ef444420'}}><span style={{fontSize:14,flexShrink:0,color:'#ef4444',fontWeight:700}}>✗</span><span style={{fontSize:12.5,color:'var(--text-2)',lineHeight:1.6}}>{m}</span></div>))}
      </div>
    </Sec>

    <Sec title="Frequently asked questions">
      {[{q:'Why is the area πr² and not πd²?',a:'The area formula uses the radius because the circle extends r units from the centre in every direction. Deriving it: cut the circle into infinitely thin rings of radius x and width dx, each with area 2πx·dx. Integrating from 0 to r gives ∫₀ʳ 2πx dx = πr². Using diameter: A = π(d/2)² = πd²/4.'},{q:'What is the relationship between circumference and area?',a:'They are related through the radius: C=2πr and A=πr². So A = C²/(4π) and C = 2√(πA). This means if you double the radius, circumference doubles (linear) but area quadruples (squared). This is why larger circular fields have proportionally much more area.'},{q:'What is a chord and how is it different from a diameter?',a:'A chord is any line segment connecting two points on a circle. A diameter is the longest possible chord — it passes through the centre. Every diameter is a chord but not every chord is a diameter.'}].map((f,i)=>(<Acc key={i} q={f.q} a={f.a} open={openFaq===i} onToggle={()=>setOpenFaq(openFaq===i?null:i)} color={C}/>))}
    </Sec>
  </div>)
}

// ═══════════════════════════════════════════════════════════════
//  RIGHT TRIANGLE CALCULATOR
// ═══════════════════════════════════════════════════════════════
