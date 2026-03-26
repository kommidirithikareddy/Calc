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

export default function AngleCalculator({meta,category}){
  const C=category?.color||'#3b82f6'
  const[angle,setAngle]=useState(60)
  const[mode,setMode]=useState('deg') // deg | rad
  const[calcMode,setCalcMode]=useState('props') // props | pairs | convert
  const[angle2,setAngle2]=useState(40)
  const[openFaq,setOpenFaq]=useState(null)

  const θd=mode==='deg'?Number(angle)||0:deg(Number(angle)||0)
  const θr=rad(θd)
  const supp=180-θd, comp=90-θd
  const vertAngle=θd, coInterior=180-θd

  const classify=()=>{
    if(θd===0) return{type:'Zero angle',range:'= 0°',color:'#94a3b8'}
    if(θd<90) return{type:'Acute angle',range:'0° < θ < 90°',color:'#10b981'}
    if(θd===90) return{type:'Right angle',range:'= 90°',color:C}
    if(θd<180) return{type:'Obtuse angle',range:'90° < θ < 180°',color:'#f59e0b'}
    if(θd===180) return{type:'Straight angle',range:'= 180°',color:'#8b5cf6'}
    if(θd<360) return{type:'Reflex angle',range:'180° < θ < 360°',color:'#ec4899'}
    if(θd===360) return{type:'Full angle',range:'= 360°',color:'#ef4444'}
    return{type:'Unknown',range:'',color:'var(--text-3)'}
  }
  const cls=classify()

  const steps=[
    {label:'Input angle',math:`θ = ${θd}°`,note:`In radians: ${fmt(θr,4)} rad`},
    {label:'Classify',math:`${θd}° is an ${cls.type} (${cls.range})`,note:'Based on which range the angle falls in'},
    {label:'Complementary angle',math:θd<=90?`Complement = 90° − ${θd}° = ${comp}°`:`No complement — angle exceeds 90°`,note:'Two angles are complementary if they sum to 90°'},
    {label:'Supplementary angle',math:θd<=180?`Supplement = 180° − ${θd}° = ${supp}°`:`No supplement — angle exceeds 180°`,note:'Two angles are supplementary if they sum to 180°'},
    {label:'Trig values',math:`sin(${θd}°)=${fmt(Math.sin(θr),4)}, cos(${θd}°)=${fmt(Math.cos(θr),4)}, tan(${θd}°)=${fmt(Math.tan(θr),4)}`},
  ]

  // Protractor SVG
  const protR=70, cx=90, cy=90
  const θForSVG=Math.min(θd,360)
  const endX=cx+protR*Math.cos(rad(θForSVG-90)-Math.PI/2+Math.PI/2)
  const handX=cx+protR*Math.cos(rad(-θd+90))
  const handY=cy+protR*Math.sin(rad(-θd+90))

  const SPECIAL=[
    {deg:0,rad:'0',sin:'0',cos:'1',tan:'0'},
    {deg:30,rad:'π/6',sin:'1/2',cos:'√3/2',tan:'1/√3'},
    {deg:45,rad:'π/4',sin:'1/√2',cos:'1/√2',tan:'1'},
    {deg:60,rad:'π/3',sin:'√3/2',cos:'1/2',tan:'√3'},
    {deg:90,rad:'π/2',sin:'1',cos:'0',tan:'∞'},
    {deg:120,rad:'2π/3',sin:'√3/2',cos:'-1/2',tan:'-√3'},
    {deg:135,rad:'3π/4',sin:'1/√2',cos:'-1/√2',tan:'-1'},
    {deg:150,rad:'5π/6',sin:'1/2',cos:'-√3/2',tan:'-1/√3'},
    {deg:180,rad:'π',sin:'0',cos:'-1',tan:'0'},
    {deg:270,rad:'3π/2',sin:'-1',cos:'0',tan:'∞'},
    {deg:360,rad:'2π',sin:'0',cos:'1',tan:'0'},
  ]

  return(<div style={{display:'flex',flexDirection:'column',gap:20}}>
    <FormulaCard title="Angle types & relationships" formula="Complementary: A+B=90°   Supplementary: A+B=180°   Full turn: 360°" desc="Angles are classified by size and related to each other through special pairs." color={C}/>

    <CalcShell left={<>
      <div style={{display:'flex',gap:8,marginBottom:14}}>
        {[{v:'deg',l:'Degrees'},{v:'rad',l:'Radians'}].map(m=>(<button key={m.v} onClick={()=>setMode(m.v)} style={{flex:1,padding:'9px',borderRadius:9,border:`1.5px solid ${mode===m.v?C:'var(--border-2)'}`,background:mode===m.v?C+'12':'var(--bg-raised)',cursor:'pointer',fontSize:12,fontWeight:mode===m.v?700:500,color:mode===m.v?C:'var(--text)'}}>{m.l}</button>))}
      </div>
      <MathInput label={`Angle (${mode==='deg'?'degrees':'radians'})`} value={angle} onChange={setAngle} color={C} unit={mode==='deg'?'°':'rad'}/>
      <div style={{borderTop:'0.5px solid var(--border)',paddingTop:12}}>
        <div style={{fontSize:10,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:10}}>Quick select angles</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:5}}>
          {[0,30,45,60,90,120,135,150,180,225,270,315,360].map(v=>(<button key={v} onClick={()=>{setAngle(v);setMode('deg')}} style={{padding:'6px 4px',borderRadius:7,border:`1px solid ${Math.abs(θd-v)<0.01?C:'var(--border-2)'}`,background:Math.abs(θd-v)<0.01?C+'15':'var(--bg-raised)',cursor:'pointer',fontSize:11,fontWeight:700,color:Math.abs(θd-v)<0.01?C:'var(--text)'}}>{v}°</button>))}
        </div>
      </div>
    </>} right={<>
      {/* Protractor SVG */}
      <div style={{background:'var(--bg-card)',border:`1.5px solid ${C}30`,borderRadius:14,padding:'14px 18px',marginBottom:12}}>
        <div style={{fontSize:12,fontWeight:700,color:'var(--text)',marginBottom:8}}>Interactive protractor</div>
        <svg viewBox="0 0 180 120" width="100%" style={{display:'block'}}>
          {/* protractor base */}
          <path d={`M ${cx-protR},${cy} A ${protR},${protR} 0 0,1 ${cx+protR},${cy}`} fill={C+'08'} stroke={C} strokeWidth="1.5"/>
          <line x1={cx-protR} y1={cy} x2={cx+protR} y2={cy} stroke={C} strokeWidth="1"/>
          {/* degree ticks */}
          {[0,30,45,60,90,120,135,150,180].map(d=>{const rx=cx+protR*Math.cos(rad(180-d)),ry=cy-protR*Math.sin(rad(d));const ix=cx+(protR-8)*Math.cos(rad(180-d)),iy=cy-(protR-8)*Math.sin(rad(d));const lx=cx+(protR+10)*Math.cos(rad(180-d)),ly=cy-(protR+10)*Math.sin(rad(d));return(<g key={d}><line x1={rx} y1={ry} x2={ix} y2={iy} stroke={C} strokeWidth="1" opacity="0.5"/><text x={lx} y={ly+3} textAnchor="middle" fontSize="8" fill="var(--text-3)">{d}</text></g>)})}
          {/* angle hand */}
          {θd<=180&&<line x1={cx} y1={cy} x2={cx+(protR-5)*Math.cos(rad(180-θd))} y2={cy-(protR-5)*Math.sin(rad(θd))} stroke={C} strokeWidth="2.5" strokeLinecap="round"/>}
          <circle cx={cx} cy={cy} r="4" fill={C}/>
          {/* sector fill */}
          {θd>0&&θd<=180&&<path d={`M${cx},${cy} L${cx-protR},${cy} A${protR},${protR} 0 ${θd>90?1:0},1 ${cx+(protR)*Math.cos(rad(180-θd))},${cy-(protR)*Math.sin(rad(θd))} Z`} fill={C+'25'}/>}
          <text x={cx} y={cy+14} textAnchor="middle" fontSize="12" fontWeight="800" fill={C}>{fmt(θd,1)}°</text>
        </svg>
      </div>
      {/* Type badge */}
      <div style={{padding:'10px 14px',borderRadius:10,background:cls.color+'12',border:`1px solid ${cls.color}30`,textAlign:'center',marginBottom:12}}>
        <div style={{fontSize:16,fontWeight:700,color:cls.color}}>{cls.type}</div>
        <div style={{fontSize:11,color:'var(--text-3)',marginTop:3}}>{cls.range}</div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:12}}>
        {[{label:'Radians',val:fmt(θr,4)+' rad',color:C},{label:'Complement',val:comp>0?comp+'°':'None',color:'#10b981'},{label:'Supplement',val:supp>0?supp+'°':'None',color:'#f59e0b'},{label:'360° reflex',val:`${360-θd}°`,color:'#8b5cf6'},{label:'sin θ',val:fmt(Math.sin(θr),4),color:C},{label:'cos θ',val:fmt(Math.cos(θr),4),color:'#10b981'}].map((s,i)=>(<div key={i} style={{padding:'9px',background:'var(--bg-raised)',borderRadius:9,border:`0.5px solid ${s.color}20`}}><div style={{fontSize:9,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.05em',marginBottom:3}}>{s.label}</div><div style={{fontSize:15,fontWeight:700,color:s.color,fontFamily:"'Space Grotesk',sans-serif"}}>{s.val}</div></div>))}
      </div>
      <AIHintCard hint={`${fmt(θd,2)}° = ${fmt(θr,4)} rad → ${cls.type}. Comp=${comp>0?comp+'°':'—'}, Supp=${supp>0?supp+'°':'—'}`}/>
    </>}/>

    <StepsCard steps={steps} color={C}/>

    {/* Angle pairs reference */}
    <Sec title="Angle pairs — the relationships between angles" sub="Essential for geometry proofs">
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:12}}>
        {[{pair:'Complementary',rule:'A + B = 90°',example:'30° + 60° = 90°',use:'Right angle parts',color:'#10b981'},{pair:'Supplementary',rule:'A + B = 180°',example:'70° + 110° = 180°',use:'Straight line angles',color:'#f59e0b'},{pair:'Vertical angles',rule:'A = C (opposite)',example:'Formed at intersecting lines',use:'Always equal',color:C},{pair:'Co-interior',rule:'A + B = 180°',example:'Parallel lines, transversal',use:'Same side of transversal',color:'#8b5cf6'},{pair:'Corresponding',rule:'A = B',example:'Parallel lines, transversal',use:'Same position at each line',color:'#ec4899'},{pair:'Alternate interior',rule:'A = B',example:'Parallel lines, transversal',use:'Opposite sides of transversal',color:'#ef4444'}].map((s,i)=>(<div key={i} style={{padding:'10px 12px',borderRadius:9,background:s.color+'08',border:`1px solid ${s.color}25`}}><div style={{fontSize:12,fontWeight:700,color:s.color,marginBottom:4}}>{s.pair}</div><div style={{fontSize:11,fontWeight:600,color:'var(--text)',fontFamily:"'Space Grotesk',sans-serif",marginBottom:3}}>{s.rule}</div><div style={{fontSize:10,color:'var(--text-3)'}}>{s.example}</div><div style={{fontSize:10,color:s.color,marginTop:2}}>→ {s.use}</div></div>))}
      </div>
    </Sec>

    {/* Special angles table */}
    <Sec title="Special angles — exact trig values" sub="Memorise these for exams">
      <div style={{overflowX:'auto'}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontFamily:"'Space Grotesk',sans-serif"}}>
          <thead><tr style={{borderBottom:`2px solid ${C}30`}}>{['θ (°)','θ (rad)','sin θ','cos θ','tan θ'].map(h=>(<th key={h} style={{padding:'7px 10px',textAlign:'center',fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.05em'}}>{h}</th>))}</tr></thead>
          <tbody>{SPECIAL.map((s,i)=>(<tr key={i} onClick={()=>{setAngle(s.deg);setMode('deg')}} style={{borderBottom:'0.5px solid var(--border)',cursor:'pointer',background:Math.abs(θd-s.deg)<0.01?C+'08':'transparent'}} onMouseEnter={e=>e.currentTarget.style.background=C+'05'} onMouseLeave={e=>e.currentTarget.style.background=Math.abs(θd-s.deg)<0.01?C+'08':'transparent'}>
            <td style={{padding:'7px 10px',textAlign:'center',fontWeight:700,color:C}}>{s.deg}°</td>
            <td style={{padding:'7px 10px',textAlign:'center',fontSize:11}}>{s.rad}</td>
            <td style={{padding:'7px 10px',textAlign:'center',fontSize:11}}>{s.sin}</td>
            <td style={{padding:'7px 10px',textAlign:'center',fontSize:11}}>{s.cos}</td>
            <td style={{padding:'7px 10px',textAlign:'center',fontSize:11}}>{s.tan}</td>
          </tr>))}</tbody>
        </table>
      </div>
      <div style={{marginTop:8,fontSize:11,color:'var(--text-3)'}}>Click any row to set the calculator to that angle</div>
    </Sec>

    {/* Angle type classification chart */}
    <Sec title="Angle classification — complete guide" sub="From zero to full rotation">
      <div style={{display:'flex',flexDirection:'column',gap:6}}>
        {[{name:'Zero',range:'= 0°',example:'No opening',color:'#94a3b8'},{name:'Acute',range:'0° – 90°',example:'Corner of a stop sign, clock at 2:00',color:'#10b981'},{name:'Right',range:'= 90°',example:'Corner of a room, capital L',color:C},{name:'Obtuse',range:'90° – 180°',example:'Open book, clock at 10:10',color:'#f59e0b'},{name:'Straight',range:'= 180°',example:'A straight line',color:'#8b5cf6'},{name:'Reflex',range:'180° – 360°',example:'Greater-than-half rotation',color:'#ec4899'},{name:'Full',range:'= 360°',example:'Complete revolution',color:'#ef4444'}].map((s,i)=>(<div key={i} style={{display:'flex',alignItems:'center',gap:12,padding:'8px 12px',borderRadius:8,background:cls.type.startsWith(s.name)?s.color+'12':'var(--bg-raised)',border:`0.5px solid ${cls.type.startsWith(s.name)?s.color+'40':'var(--border)'}`}}><div style={{width:10,height:10,borderRadius:'50%',background:s.color,flexShrink:0}}/><div style={{flex:1}}><span style={{fontSize:12,fontWeight:700,color:s.color}}>{s.name} angle</span><span style={{fontSize:12,color:'var(--text-3)',marginLeft:8}}>{s.range}</span></div><div style={{fontSize:11,color:'var(--text-2)'}}>{s.example}</div></div>))}
      </div>
    </Sec>

    <Sec title="⚠️ Common mistakes">
      <div style={{display:'flex',flexDirection:'column',gap:8}}>
        {['Confusing complementary (sum=90°) and supplementary (sum=180°) — Co=90, Su=180, remember by alphabetical order: C before S','Thinking a right angle must always look like a corner — it can be in any orientation','Forgetting that reflex angles exist (>180°) — a "full" angle of 270° is a reflex angle','Converting degrees to radians: multiply by π/180. Radians to degrees: multiply by 180/π'].map((m,i)=>(<div key={i} style={{display:'flex',gap:12,padding:'10px 14px',borderRadius:9,background:'#fee2e210',border:'0.5px solid #ef444420'}}><span style={{fontSize:14,flexShrink:0,color:'#ef4444',fontWeight:700}}>✗</span><span style={{fontSize:12.5,color:'var(--text-2)',lineHeight:1.6}}>{m}</span></div>))}
      </div>
    </Sec>

    <Sec title="Frequently asked questions">
      {[{q:'Why are there 360 degrees in a circle?',a:"360 was chosen by ancient Babylonians, likely because their calendar had ~360 days per year, and 360 is divisible by 2, 3, 4, 5, 6, 8, 9, 10, 12, 15, 18, 20, 24... making it very convenient for dividing circles into equal parts without fractions."},{q:'What are radians and why do mathematicians prefer them?',a:'Radians measure angles using arc length: 1 radian is the angle that creates an arc equal to the radius length. A full circle = 2π radians ≈ 6.283 rad. Mathematicians prefer radians because trig derivatives are simpler: d/dx(sin x) = cos x only works in radians. In degrees: d/dx(sin x) = (π/180)cos x.'},{q:'What is the exterior angle theorem?',a:'For any triangle, an exterior angle equals the sum of the two non-adjacent interior angles. If you extend one side of a triangle, the angle formed outside equals the sum of the other two interior angles. This is a direct consequence of angles in a triangle summing to 180°.'}].map((f,i)=>(<Acc key={i} q={f.q} a={f.a} open={openFaq===i} onToggle={()=>setOpenFaq(openFaq===i?null:i)} color={C}/>))}
    </Sec>
  </div>)
}

