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

export default function RightTriangleCalculator({meta,category}){
  const C=category?.color||'#3b82f6'
  const[mode,setMode]=useState('angle') // angle | sides
  const[angle,setAngle]=useState(30)
  const[hyp,setHyp]=useState(10)
  const[legA,setLegA]=useState(3)
  const[legB,setLegB]=useState(4)
  const[openFaq,setOpenFaq]=useState(null)

  const θ=Number(angle)||30, H=Number(hyp)||0, lA=Number(legA)||0, lB=Number(legB)||0

  let opp=0,adj=0,hypR=0,angA=0,angB=0,area=0
  if(mode==='angle'){
    opp=H*Math.sin(rad(θ)), adj=H*Math.cos(rad(θ)), hypR=H, angA=θ, angB=90-θ
    area=0.5*opp*adj
  } else {
    hypR=Math.sqrt(lA*lA+lB*lB), opp=lA, adj=lB
    angA=deg(Math.atan2(lA,lB)), angB=90-angA, area=0.5*lA*lB
  }

  const sinVal=fmt(Math.sin(rad(angA)),6), cosVal=fmt(Math.cos(rad(angA)),6), tanVal=fmt(Math.tan(rad(angA)),6)
  const steps=mode==='angle'?[
    {label:'Given',math:`Angle θ = ${θ}°, Hypotenuse = ${H}`,note:'Using SOH-CAH-TOA to find sides'},
    {label:'Find opposite side (SOH)',math:`sin(${θ}°) = Opposite/Hypotenuse → Opposite = H×sin θ = ${H}×${sinVal} = ${fmt(opp)}`,note:'SOH: Sin = Opposite/Hypotenuse'},
    {label:'Find adjacent side (CAH)',math:`cos(${θ}°) = Adjacent/Hypotenuse → Adjacent = H×cos θ = ${H}×${cosVal} = ${fmt(adj)}`,note:'CAH: Cos = Adjacent/Hypotenuse'},
    {label:'Second angle',math:`θ₂ = 90° − ${θ}° = ${90-θ}°`,note:'The two acute angles in a right triangle always sum to 90°'},
    {label:'Area',math:`Area = ½ × opposite × adjacent = ½ × ${fmt(opp)} × ${fmt(adj)} = ${fmt(area)} sq units`},
  ]:[
    {label:'Given',math:`Leg a = ${lA}, Leg b = ${lB}`,note:'Using Pythagorean theorem and inverse trig'},
    {label:'Hypotenuse',math:`c = √(a²+b²) = √(${sq(lA)}+${sq(lB)}) = √${sq(lA)+sq(lB)} = ${fmt(hypR)}`,note:"Pythagorean theorem: a²+b²=c²"},
    {label:'Angle A (opposite leg a)',math:`tan A = a/b = ${lA}/${lB} = ${fmt(lA/lB)} → A = tan⁻¹(${fmt(lA/lB)}) = ${fmt(angA)}°`},
    {label:'Angle B',math:`B = 90° − A = ${fmt(90-angA)}°`},
    {label:'All trig ratios',math:`sin A = ${fmt(opp/hypR)}, cos A = ${fmt(adj/hypR)}, tan A = ${fmt(opp/adj)}`},
  ]

  const SOH=[
    {name:'sin A',formula:'Opposite / Hypotenuse',val:fmt(opp/hypR,4),mnemonic:'SOH'},
    {name:'cos A',formula:'Adjacent / Hypotenuse',val:fmt(adj/hypR,4),mnemonic:'CAH'},
    {name:'tan A',formula:'Opposite / Adjacent',val:fmt(opp/adj,4),mnemonic:'TOA'},
    {name:'csc A',formula:'Hypotenuse / Opposite',val:fmt(hypR/opp,4),mnemonic:''},
    {name:'sec A',formula:'Hypotenuse / Adjacent',val:fmt(hypR/adj,4),mnemonic:''},
    {name:'cot A',formula:'Adjacent / Opposite',val:fmt(adj/opp,4),mnemonic:''},
  ]

  return(<div style={{display:'flex',flexDirection:'column',gap:20}}>
    <FormulaCard title="SOH-CAH-TOA" formula="sin=O/H   cos=A/H   tan=O/A" desc="The three primary trig ratios for a right triangle. All six trig functions derive from these." color={C} sub="O=Opposite · A=Adjacent · H=Hypotenuse"/>

    <CalcShell left={<>
      <div style={{display:'flex',gap:8,marginBottom:14}}>
        {[{v:'angle',l:'Known: angle + hyp'},{v:'sides',l:'Known: two legs'}].map(m=>(<button key={m.v} onClick={()=>setMode(m.v)} style={{flex:1,padding:'10px',borderRadius:9,border:`1.5px solid ${mode===m.v?C:'var(--border-2)'}`,background:mode===m.v?C+'12':'var(--bg-raised)',cursor:'pointer',fontSize:12,fontWeight:mode===m.v?700:500,color:mode===m.v?C:'var(--text)'}}>{m.l}</button>))}
      </div>
      <div style={{borderTop:'0.5px solid var(--border)',paddingTop:14}}>
        {mode==='angle'?<>
          <MathInput label="Acute angle θ" value={angle} onChange={setAngle} color={C} unit="°" hint="0°–90°"/>
          <MathInput label="Hypotenuse" value={hyp} onChange={setHyp} color={C} unit="units"/>
        </>:<>
          <MathInput label="Leg a (opposite)" value={legA} onChange={setLegA} color={C} unit="units"/>
          <MathInput label="Leg b (adjacent)" value={legB} onChange={setLegB} color={C} unit="units"/>
        </>}
      </div>
      <div style={{borderTop:'0.5px solid var(--border)',paddingTop:12,marginTop:4}}>
        <div style={{fontSize:10,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:10}}>🎯 Classic triangles</div>
        {[{m:'angle',a:30,h:10,la:'',lb:'',l:'30°-60°-90°'},{m:'angle',a:45,h:10,la:'',lb:'',l:'45°-45°-90°'},{m:'sides',a:'',h:'',la:3,lb:4,l:'3-4-5 right'},{m:'sides',a:'',h:'',la:5,lb:12,l:'5-12-13 right'}].map((ex,i)=>(<button key={i} onClick={()=>{setMode(ex.m);if(ex.a)setAngle(ex.a);if(ex.h)setHyp(ex.h);if(ex.la)setLegA(ex.la);if(ex.lb)setLegB(ex.lb)}} style={{display:'block',width:'100%',padding:'7px 12px',borderRadius:8,border:'1px solid var(--border-2)',background:'var(--bg-raised)',cursor:'pointer',textAlign:'left',marginBottom:5,fontSize:12,color:'var(--text)'}} onMouseEnter={e=>e.currentTarget.style.borderColor=C+'60'} onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border-2)'}>{ex.l}</button>))}
      </div>
    </>} right={<>
      {/* Right triangle SVG */}
      <div style={{background:'var(--bg-card)',border:`1.5px solid ${C}30`,borderRadius:14,padding:'14px 18px',marginBottom:12}}>
        <div style={{fontSize:12,fontWeight:700,color:'var(--text)',marginBottom:10}}>Right triangle</div>
        <svg viewBox="0 0 200 140" width="100%" style={{display:'block'}}>
          <polygon points="20,120 140,120 20,30" fill={C+'10'} stroke={C} strokeWidth="1.5"/>
          <polyline points="20,110 30,110 30,120" fill="none" stroke={C} strokeWidth="1" opacity="0.7"/>
          <text x={80} y={135} textAnchor="middle" fontSize="11" fontWeight="700" fill={C}>adj={fmt(adj,2)}</text>
          <text x={8} y={78} textAnchor="end" fontSize="11" fontWeight="700" fill="#10b981">opp={fmt(opp,2)}</text>
          <text x={95} y={72} textAnchor="middle" fontSize="11" fontWeight="700" fill="#f59e0b">hyp={fmt(hypR,2)}</text>
          <text x={24} y={115} fontSize="9" fill={C}>90°</text>
          <text x={26} y={108} fontSize="9" fill="#10b981">{fmt(angA,1)}°</text>
          <text x={130} y={117} fontSize="9" fill="#f59e0b">{fmt(angB,1)}°</text>
        </svg>
      </div>
      {/* 6 trig ratios */}
      <div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,padding:'12px 16px',marginBottom:12}}>
        <div style={{fontSize:12,fontWeight:700,color:'var(--text)',marginBottom:10}}>All 6 trig ratios (angle A = {fmt(angA,1)}°)</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:6}}>
          {SOH.map((s,i)=>(<div key={i} style={{padding:'8px',background:i<3?C+'08':'var(--bg-raised)',borderRadius:8,border:`0.5px solid ${i<3?C+'30':'var(--border)'}`,textAlign:'center'}}>{s.mnemonic&&<div style={{fontSize:8,fontWeight:800,color:C,letterSpacing:'.05em',marginBottom:2}}>{s.mnemonic}</div>}<div style={{fontSize:11,fontWeight:700,color:i<3?C:'var(--text)',fontFamily:"'Space Grotesk',sans-serif"}}>{s.name}</div><div style={{fontSize:13,fontWeight:700,color:i<3?C:'var(--text-2)',fontFamily:"'Space Grotesk',sans-serif"}}>{s.val}</div><div style={{fontSize:9,color:'var(--text-3)',marginTop:1}}>{s.formula}</div></div>))}
        </div>
      </div>
      <BreakdownTable title="Summary" rows={[{label:'Opposite',value:fmt(opp)+' units',color:C,bold:true,highlight:true},{label:'Adjacent',value:fmt(adj)+' units',color:'#10b981'},{label:'Hypotenuse',value:fmt(hypR)+' units',color:'#f59e0b'},{label:'Angle A',value:fmt(angA,1)+'°'},{label:'Angle B',value:fmt(angB,1)+'°'},{label:'Area',value:fmt(area)+' sq units'}]}/>
      <AIHintCard hint={`Right triangle: opp=${fmt(opp)}, adj=${fmt(adj)}, hyp=${fmt(hypR)}, A=${fmt(angA,1)}°, B=${fmt(angB,1)}°`}/>
    </>}/>

    <StepsCard steps={steps} color={C}/>

    {/* SOH-CAH-TOA reference */}
    <Sec title="SOH-CAH-TOA — the complete guide" sub="Everything you need to remember">
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10,marginBottom:14}}>
        {[{name:'SOH',full:'Sine',formula:'sin θ = O/H',note:'Opposite over Hypotenuse',color:C},{name:'CAH',full:'Cosine',formula:'cos θ = A/H',note:'Adjacent over Hypotenuse',color:'#10b981'},{name:'TOA',full:'Tangent',formula:'tan θ = O/A',note:'Opposite over Adjacent',color:'#f59e0b'}].map((s,i)=>(<div key={i} style={{padding:'12px',borderRadius:10,background:s.color+'08',border:`1px solid ${s.color}30`,textAlign:'center'}}><div style={{fontSize:22,fontWeight:800,color:s.color,fontFamily:"'Space Grotesk',sans-serif",marginBottom:4}}>{s.name}</div><div style={{fontSize:11,fontWeight:700,color:s.color}}>{s.full}</div><div style={{fontSize:13,fontWeight:700,color:'var(--text)',fontFamily:"'Space Grotesk',sans-serif",margin:'6px 0'}}>{s.formula}</div><div style={{fontSize:10,color:'var(--text-3)'}}>{s.note}</div></div>))}
      </div>
      {/* Special angle table */}
      <div style={{fontSize:12,fontWeight:700,color:'var(--text)',marginBottom:8}}>Special angle values</div>
      <table style={{width:'100%',borderCollapse:'collapse',fontFamily:"'Space Grotesk',sans-serif"}}>
        <thead><tr style={{borderBottom:`2px solid ${C}30`}}>{['θ','sin θ','cos θ','tan θ'].map(h=>(<th key={h} style={{padding:'7px 10px',textAlign:'center',fontSize:11,fontWeight:700,color:'var(--text-3)'}}>{h}</th>))}</tr></thead>
        <tbody>{[[0,'0','1','0'],[30,'1/2','√3/2','1/√3'],[45,'1/√2','1/√2','1'],[60,'√3/2','1/2','√3'],[90,'1','0','∞']].map(([a,s,c,t])=>(<tr key={a} style={{borderBottom:'0.5px solid var(--border)'}}>
          {[a+'°',s,c,t].map((v,j)=>(<td key={j} style={{padding:'7px 10px',textAlign:'center',fontSize:12,fontWeight:j===0?700:500,color:j===0?C:'var(--text)'}}>{v}</td>))}
        </tr>))}</tbody>
      </table>
    </Sec>

    <Sec title="⚠️ Common mistakes">
      <div style={{display:'flex',flexDirection:'column',gap:8}}>
        {['Mixing up opposite and adjacent — adjacent is ALWAYS the side touching the angle (not the hypotenuse); opposite is always across from the angle','SOH-CAH-TOA only works for RIGHT triangles — use the Law of Sines/Cosines for other triangles','Calculator set to degrees when it should be radians (or vice versa) — always check your calculator mode!','tan(90°) is undefined — this is a vertical line, infinitely steep'].map((m,i)=>(<div key={i} style={{display:'flex',gap:12,padding:'10px 14px',borderRadius:9,background:'#fee2e210',border:'0.5px solid #ef444420'}}><span style={{fontSize:14,flexShrink:0,color:'#ef4444',fontWeight:700}}>✗</span><span style={{fontSize:12.5,color:'var(--text-2)',lineHeight:1.6}}>{m}</span></div>))}
      </div>
    </Sec>

    <Sec title="Frequently asked questions">
      {[{q:'Why is SOH-CAH-TOA only for right triangles?',a:"SOH-CAH-TOA defines ratios based on the specific relationship between the right angle, the hypotenuse, and the two legs. Without a right angle, there is no hypotenuse, and the ratios don't apply in the same way. For non-right triangles, the Law of Sines (a/sin A = b/sin B = c/sin C) and Law of Cosines are used."},{q:'What is the unit circle and how does it extend trig beyond right triangles?',a:"The unit circle has radius 1 centred at the origin. For any angle θ, the point on the circle is (cos θ, sin θ). This extends trig to any angle — not just 0° to 90°. At 180°: sin=0, cos=-1. At 270°: sin=-1, cos=0. This is how calculators compute sin(120°) or cos(300°)."},{q:'When is trigonometry used in the real world?',a:'Engineering (structural analysis, signal processing), physics (waves, optics, mechanics), architecture (roof pitches, bridge design), navigation (GPS, aviation), computer graphics (rotation, 3D rendering), and music (sound waves are sine waves). Trig is one of the most applied areas of mathematics.'}].map((f,i)=>(<Acc key={i} q={f.q} a={f.a} open={openFaq===i} onToggle={()=>setOpenFaq(openFaq===i?null:i)} color={C}/>))}
    </Sec>
  </div>)
}

// ═══════════════════════════════════════════════════════════════
//  SLOPE CALCULATOR
// ═══════════════════════════════════════════════════════════════
