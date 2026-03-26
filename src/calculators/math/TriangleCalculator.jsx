import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'

const fmt=(n,d=4)=>isNaN(n)||!isFinite(n)||n===null?'—':parseFloat(Number(n).toFixed(d)).toString()
const deg=r=>r*180/Math.PI, rad=d=>d*Math.PI/180
const acos2=(x)=>Math.acos(Math.max(-1,Math.min(1,x)))

function Sec({title,sub,children}){return(<div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,overflow:'hidden'}}><div style={{padding:'13px 18px',borderBottom:'0.5px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center'}}><span style={{fontSize:13,fontWeight:700,color:'var(--text)',fontFamily:"'Space Grotesk',sans-serif"}}>{title}</span>{sub&&<span style={{fontSize:11,color:'var(--text-3)'}}>{sub}</span>}</div><div style={{padding:'16px 18px'}}>{children}</div></div>)}
function Acc({q,a,open,onToggle,color}){return(<div style={{borderBottom:'0.5px solid var(--border)'}}><button onClick={onToggle} style={{width:'100%',display:'flex',justifyContent:'space-between',alignItems:'center',padding:'13px 0',background:'none',border:'none',cursor:'pointer',gap:12,textAlign:'left'}}><span style={{fontSize:13,fontWeight:600,color:'var(--text)',fontFamily:"'DM Sans',sans-serif",lineHeight:1.4}}>{q}</span><span style={{fontSize:18,color,flexShrink:0,transform:open?'rotate(45deg)':'none',transition:'transform .2s'}}>+</span></button>{open&&<p style={{fontSize:12.5,color:'var(--text-2)',lineHeight:1.75,margin:'0 0 13px',fontFamily:"'DM Sans',sans-serif"}}>{a}</p>}</div>)}
function StepsCard({steps,color}){const[exp,setExp]=useState(false);if(!steps?.length)return null;const vis=exp?steps:steps.slice(0,2);return(<div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,overflow:'hidden'}}><div style={{padding:'12px 18px',borderBottom:'0.5px solid var(--border)',display:'flex',justifyContent:'space-between'}}><span style={{fontSize:13,fontWeight:700,color:'var(--text)',fontFamily:"'Space Grotesk',sans-serif"}}>Step-by-step working</span><span style={{fontSize:11,color:'var(--text-3)'}}>{steps.length} steps</span></div><div style={{padding:'16px 18px',display:'flex',flexDirection:'column',gap:14}}>{vis.map((s,i)=>(<div key={i} style={{display:'flex',gap:14,alignItems:'flex-start'}}><div style={{width:26,height:26,borderRadius:'50%',flexShrink:0,background:i===steps.length-1?color:color+'18',border:`1.5px solid ${color}40`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,color:i===steps.length-1?'#fff':color}}>{i===steps.length-1?'✓':i+1}</div><div style={{flex:1}}>{s.label&&<div style={{fontSize:10,fontWeight:700,color,textTransform:'uppercase',letterSpacing:'.06em',marginBottom:4}}>{s.label}</div>}<div style={{fontSize:13,fontFamily:"'Space Grotesk',sans-serif",fontWeight:i===steps.length-1?700:500,background:'var(--bg-raised)',padding:'8px 12px',borderRadius:8,border:`0.5px solid ${i===steps.length-1?color+'40':'var(--border)'}`}}>{s.math}</div>{s.note&&<div style={{fontSize:11.5,color:'var(--text-3)',marginTop:4,fontStyle:'italic'}}>↳ {s.note}</div>}</div></div>))}{steps.length>2&&<button onClick={()=>setExp(e=>!e)} style={{padding:'9px',borderRadius:9,border:`1px solid ${color}30`,background:color+'08',color,fontSize:12,fontWeight:600,cursor:'pointer'}}>{exp?'▲ Hide steps':`▼ Show all ${steps.length} steps`}</button>}</div></div>)}
function MathInput({label,value,onChange,color,unit,hint,disabled}){const[f,setF]=useState(false);return(<div style={{marginBottom:12,opacity:disabled?.45:1}}><div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}><label style={{fontSize:12,fontWeight:600,color:'var(--text)',fontFamily:"'DM Sans',sans-serif"}}>{label}</label>{hint&&<span style={{fontSize:10,color:'var(--text-3)'}}>{hint}</span>}</div><div style={{display:'flex',height:40,border:`1.5px solid ${f&&!disabled?color:'var(--border-2)'}`,borderRadius:9,overflow:'hidden',background:'var(--bg-card)',transition:'border-color .15s'}}><input disabled={disabled} type="number" value={value} onChange={e=>onChange(e.target.value===''?'':Number(e.target.value))} onFocus={()=>setF(true)} onBlur={()=>setF(false)} style={{flex:1,border:'none',background:'transparent',padding:'0 12px',fontSize:15,fontWeight:700,color:'var(--text)',outline:'none',fontFamily:"'Space Grotesk',sans-serif",cursor:disabled?'not-allowed':'text'}}/>{unit&&<div style={{padding:'0 10px',display:'flex',alignItems:'center',background:'var(--bg-raised)',borderLeft:'1px solid var(--border)',fontSize:12,fontWeight:600,color:'var(--text-3)'}}>{unit}</div>}</div></div>)}

function classifyTriangle(A,B,C,a,b,c){
  const angles=[A,B,C].filter(x=>x>0)
  let angleType='Unknown', sideType='Unknown'
  if(angles.every(x=>x<90)) angleType='Acute'
  else if(angles.some(x=>Math.abs(x-90)<0.01)) angleType='Right'
  else angleType='Obtuse'
  const sides=[a,b,c].filter(x=>x>0)
  if(sides.length===3){
    if(Math.abs(sides[0]-sides[1])<0.001&&Math.abs(sides[1]-sides[2])<0.001) sideType='Equilateral'
    else if(Math.abs(sides[0]-sides[1])<0.001||Math.abs(sides[1]-sides[2])<0.001||Math.abs(sides[0]-sides[2])<0.001) sideType='Isosceles'
    else sideType='Scalene'
  }
  return{angleType,sideType}
}

const MODES=[
  {v:'SSS',l:'SSS',desc:'3 sides known',inputs:['a','b','c'],angles:[]},
  {v:'SAS',l:'SAS',desc:'2 sides + included angle',inputs:['a','b'],angles:['C']},
  {v:'ASA',l:'ASA',desc:'2 angles + included side',inputs:['c'],angles:['A','B']},
  {v:'AAS',l:'AAS',desc:'2 angles + any side',inputs:['a'],angles:['A','B']},
  {v:'SSA',l:'SSA',desc:'2 sides + opposite angle',inputs:['a','b'],angles:['A']},
]

const EXAMPLES=[
  {a:3,b:4,c:5,A:null,B:null,C:null,mode:'SSS',l:'3-4-5 right triangle'},
  {a:7,b:7,c:7,A:null,B:null,C:null,mode:'SSS',l:'Equilateral — all sides 7'},
  {a:5,b:8,c:null,A:null,B:null,C:60,mode:'SAS',l:'SAS with 60° included angle'},
  {a:null,b:null,c:10,A:45,B:60,C:null,mode:'ASA',l:'ASA — 45°, 60°, side 10'},
]

export default function TriangleCalculator({meta,category}){
  const C=category?.color||'#3b82f6'
  const[mode,setMode]=useState('SSS')
  const[a,setA]=useState(5)
  const[b,setB]=useState(7)
  const[c,setC]=useState(9)
  const[A,setAng]=useState(null)
  const[B,setBng]=useState(null)
  const[Cv,setCv]=useState(null)
  const[openFaq,setOpenFaq]=useState(null)

  // Solve triangle
  let sa=Number(a)||0,sb=Number(b)||0,sc=Number(c)||0
  let sA=Number(A)||0,sB=Number(B)||0,sC=Number(Cv)||0
  let steps=[],area=null,perimeter=null,error=null,solved={a:sa,b:sb,c:sc,A:sA,B:sB,C:sC}

  try{
  if(mode==='SSS'){
    if(sa<=0||sb<=0||sc<=0) throw new Error('All sides must be positive')
    if(sa+sb<=sc||sb+sc<=sa||sa+sc<=sb) throw new Error('Invalid triangle — triangle inequality fails')
    const cosA=(sb*sb+sc*sc-sa*sa)/(2*sb*sc)
    const cosB=(sa*sa+sc*sc-sb*sb)/(2*sa*sc)
    sA=deg(acos2(cosA)), sB=deg(acos2(cosB)), sC=180-sA-sB
    solved={a:sa,b:sb,c:sc,A:sA,B:sB,C:sC}
    area=0.5*sa*sb*Math.sin(rad(sC))
    perimeter=sa+sb+sc
    steps=[
      {label:'Given (SSS)',math:`a=${sa}, b=${sb}, c=${sc}`,note:'Three sides given — use the Law of Cosines to find angles'},
      {label:'Law of Cosines: find angle A',math:`cos A = (b²+c²−a²)/(2bc) = (${sb*sb}+${sc*sc}−${sa*sa})/(2×${sb}×${sc}) = ${fmt(cosA)}`,note:'cos⁻¹ of this value gives the angle'},
      {label:'A = cos⁻¹('+fmt(cosA)+')',math:`A = ${fmt(sA)}°`},
      {label:'Find angle B similarly',math:`B = cos⁻¹((a²+c²−b²)/(2ac)) = ${fmt(sB)}°`},
      {label:'Angle C from sum',math:`C = 180° − A − B = 180° − ${fmt(sA)}° − ${fmt(sB)}° = ${fmt(sC)}°`,note:'Angles in a triangle always sum to 180°'},
      {label:'Area (Heron\'s formula)',math:`s = (${sa}+${sb}+${sc})/2 = ${(sa+sb+sc)/2}, Area = √(s(s-a)(s-b)(s-c)) = ${fmt(area)} sq units`},
    ]
  } else if(mode==='SAS'){
    if(sa<=0||sb<=0||Number(Cv)<=0||Number(Cv)>=180) throw new Error('Enter two sides and the angle between them (0°–180°)')
    sC=Number(Cv), sc=Math.sqrt(sa*sa+sb*sb-2*sa*sb*Math.cos(rad(sC)))
    sA=deg(acos2((sb*sb+sc*sc-sa*sa)/(2*sb*sc)))
    sB=180-sA-sC
    solved={a:sa,b:sb,c:sc,A:sA,B:sB,C:sC}
    area=0.5*sa*sb*Math.sin(rad(sC))
    perimeter=sa+sb+sc
    steps=[
      {label:'Given (SAS)',math:`a=${sa}, b=${sb}, C=${sC}°`,note:'Two sides and included angle — Law of Cosines finds the third side'},
      {label:'Law of Cosines: find c',math:`c² = a²+b²−2ab·cos C = ${sa*sa}+${sb*sb}−2(${sa})(${sb})cos(${sC}°) = ${fmt(sc*sc)}`,note:`c = √${fmt(sc*sc)} = ${fmt(sc)}`},
      {label:'c',math:`c = ${fmt(sc)}`},
      {label:'Law of Sines: find angle A',math:`sin A / a = sin C / c → A = sin⁻¹(${sa}·sin(${sC}°)/${fmt(sc)}) = ${fmt(sA)}°`},
      {label:'Angle B',math:`B = 180° − A − C = ${fmt(sB)}°`},
      {label:'Area',math:`Area = ½ab·sin C = ½×${sa}×${sb}×sin(${sC}°) = ${fmt(area)} sq units`},
    ]
  } else if(mode==='ASA'){
    if(Number(A)<=0||Number(B)<=0||sc<=0) throw new Error('Enter two angles and the side between them')
    if(Number(A)+Number(B)>=180) throw new Error('Angles A+B must be less than 180°')
    sA=Number(A),sB=Number(B),sC=180-sA-sB
    sa=sc*Math.sin(rad(sA))/Math.sin(rad(sC))
    sb=sc*Math.sin(rad(sB))/Math.sin(rad(sC))
    solved={a:sa,b:sb,c:sc,A:sA,B:sB,C:sC}
    area=0.5*sa*sb*Math.sin(rad(sC))
    perimeter=sa+sb+sc
    steps=[
      {label:'Given (ASA)',math:`A=${sA}°, B=${sB}°, c=${sc}`,note:'Two angles with included side — Law of Sines finds the remaining sides'},
      {label:'Find angle C',math:`C = 180° − ${sA}° − ${sB}° = ${sC}°`},
      {label:'Law of Sines: find a',math:`a/sin A = c/sin C → a = ${sc}×sin(${sA}°)/sin(${sC}°) = ${fmt(sa)}`},
      {label:'Law of Sines: find b',math:`b/sin B = c/sin C → b = ${sc}×sin(${sB}°)/sin(${sC}°) = ${fmt(sb)}`},
      {label:'Area',math:`Area = ½ab·sin C = ${fmt(area)} sq units`},
    ]
  } else if(mode==='AAS'){
    if(Number(A)<=0||Number(B)<=0||sa<=0) throw new Error('Enter two angles and any one side')
    if(Number(A)+Number(B)>=180) throw new Error('Angles must sum to less than 180°')
    sA=Number(A),sB=Number(B),sC=180-sA-sB
    sb=sa*Math.sin(rad(sB))/Math.sin(rad(sA))
    sc=sa*Math.sin(rad(sC))/Math.sin(rad(sA))
    solved={a:sa,b:sb,c:sc,A:sA,B:sB,C:sC}
    area=0.5*sa*sb*Math.sin(rad(sC))
    perimeter=sa+sb+sc
    steps=[
      {label:'Given (AAS)',math:`A=${sA}°, B=${sB}°, a=${sa}`,note:'Two angles and a non-included side — Law of Sines solves the rest'},
      {label:'Find C',math:`C = 180° − ${sA}° − ${sB}° = ${sC}°`},
      {label:'Law of Sines',math:`a/sin A = b/sin B = c/sin C`,note:`All ratios equal ${fmt(sa/Math.sin(rad(sA)))}`},
      {label:'Find b and c',math:`b = a·sin B/sin A = ${fmt(sb)},  c = a·sin C/sin A = ${fmt(sc)}`},
      {label:'Area',math:`Area = ½ab·sin C = ${fmt(area)} sq units`},
    ]
  } else if(mode==='SSA'){
    if(sa<=0||sb<=0||Number(A)<=0) throw new Error('Enter two sides and the angle opposite the first side')
    sA=Number(A)
    const sinB=sb*Math.sin(rad(sA))/sa
    if(sinB>1) throw new Error('No triangle exists — the side is too short for the given angle')
    sB=deg(Math.asin(sinB))
    sC=180-sA-sB
    sc=sa*Math.sin(rad(sC))/Math.sin(rad(sA))
    solved={a:sa,b:sb,c:sc,A:sA,B:sB,C:sC}
    area=0.5*sa*sb*Math.sin(rad(sC))
    perimeter=sa+sb+sc
    steps=[
      {label:'Given (SSA — ambiguous case)',math:`a=${sa}, b=${sb}, A=${sA}°`,note:'SSA can have 0, 1, or 2 solutions — the ambiguous case'},
      {label:'Law of Sines: find sin B',math:`sin B = b·sin A/a = ${sb}×sin(${sA}°)/${sa} = ${fmt(sinB)}`},
      {label:'Angle B',math:`B = sin⁻¹(${fmt(sinB)}) = ${fmt(sB)}°`,note:`Second possible: B' = 180° − ${fmt(sB)}° = ${fmt(180-sB)}° (check if A+B' < 180°)`},
      {label:'Angle C',math:`C = 180° − ${sA}° − ${fmt(sB)}° = ${fmt(sC)}°`},
      {label:'Side c',math:`c = a·sin C/sin A = ${fmt(sc)}`},
    ]
  }
  }catch(e){error=e.message}

  const{angleType,sideType}=classifyTriangle(solved.A,solved.B,solved.C,solved.a,solved.b,solved.c)

  // SVG triangle
  const maxS=Math.max(solved.a,solved.b,solved.c,1)
  const scale=80/maxS
  const Bx=20+solved.a*scale, By=120
  const Ax=20, Ay=120
  const Cx=Ax+solved.b*Math.cos(rad(solved.C||90))*scale, Cy=Ay-solved.b*Math.sin(rad(solved.C||90))*scale

  return(<div style={{display:'flex',flexDirection:'column',gap:20}}>

    {/* Formula card */}
    <div style={{background:`linear-gradient(135deg,${C}12,${C}06)`,border:`1px solid ${C}30`,borderRadius:14,padding:'16px 20px'}}>
      <div style={{fontSize:10,fontWeight:700,color:C,textTransform:'uppercase',letterSpacing:'.08em',marginBottom:8}}>Key formulas</div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
        {[{label:'Law of Cosines',math:'c² = a²+b² − 2ab·cos C',color:C},{label:'Law of Sines',math:'a/sin A = b/sin B = c/sin C',color:'#10b981'},{label:"Heron's Area",math:'Area = √(s(s−a)(s−b)(s−c))',color:'#f59e0b'},{label:'Angle sum',math:'A + B + C = 180°',color:'#8b5cf6'}].map((f,i)=>(<div key={i} style={{padding:'8px 10px',background:f.color+'08',borderRadius:8,border:`0.5px solid ${f.color}25`}}><div style={{fontSize:9,fontWeight:700,color:f.color,textTransform:'uppercase',letterSpacing:'.06em',marginBottom:3}}>{f.label}</div><div style={{fontSize:11.5,fontWeight:700,color:'var(--text)',fontFamily:"'Space Grotesk',sans-serif"}}>{f.math}</div></div>))}
      </div>
    </div>

    <CalcShell left={<>
      <div style={{fontSize:12,fontWeight:600,color:'var(--text-2)',marginBottom:10}}>Choose what you know</div>
      <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:16}}>
        {MODES.map(m=>(<button key={m.v} onClick={()=>setMode(m.v)} style={{padding:'8px 12px',borderRadius:9,border:`1.5px solid ${mode===m.v?C:'var(--border-2)'}`,background:mode===m.v?C+'12':'var(--bg-raised)',cursor:'pointer'}}><div style={{fontSize:13,fontWeight:700,color:mode===m.v?C:'var(--text)'}}>{m.l}</div><div style={{fontSize:9,color:'var(--text-3)'}}>{m.desc}</div></button>))}
      </div>
      <div style={{borderTop:'0.5px solid var(--border)',paddingTop:14}}>
        <MathInput label="Side a (opposite A)" value={a} onChange={setA} color={C} unit="units" disabled={!['SSS','SAS','AAS','SSA'].includes(mode)&&mode!=='SSA'}/>
        <MathInput label="Side b (opposite B)" value={b} onChange={setB} color={C} unit="units" disabled={!['SSS','SAS','SSA'].includes(mode)}/>
        <MathInput label="Side c (opposite C)" value={c} onChange={setC} color={C} unit="units" disabled={!['SSS','ASA'].includes(mode)}/>
        <MathInput label="Angle A (opposite a)" value={A||''} onChange={setAng} color={C} unit="°" disabled={!['ASA','AAS','SSA'].includes(mode)}/>
        <MathInput label="Angle B (opposite b)" value={B||''} onChange={setBng} color={C} unit="°" disabled={!['ASA','AAS'].includes(mode)}/>
        <MathInput label="Angle C (opposite c)" value={Cv||''} onChange={setCv} color={C} unit="°" disabled={!['SAS'].includes(mode)}/>
      </div>
      <div style={{borderTop:'0.5px solid var(--border)',paddingTop:12,marginTop:4}}>
        <div style={{fontSize:10,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:10}}>🎯 Examples</div>
        {EXAMPLES.map((ex,i)=>(<button key={i} onClick={()=>{setA(ex.a||'');setB(ex.b||'');setC(ex.c||'');setAng(ex.A||'');setBng(ex.B||'');setCv(ex.C||'');setMode(ex.mode)}} style={{display:'block',width:'100%',padding:'8px 12px',borderRadius:8,border:'1px solid var(--border-2)',background:'var(--bg-raised)',cursor:'pointer',textAlign:'left',marginBottom:5,fontSize:12,color:'var(--text)'}} onMouseEnter={e=>e.currentTarget.style.borderColor=C+'60'} onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border-2)'}>{ex.l}</button>))}
      </div>
    </>} right={<>
      {error?(<div style={{background:'#fee2e2',border:'1px solid #ef444430',borderRadius:14,padding:'18px',marginBottom:14,textAlign:'center'}}><div style={{fontSize:14,fontWeight:700,color:'#dc2626'}}>⚠ {error}</div></div>):(<>
      {/* Triangle type badge */}
      <div style={{display:'flex',gap:8,marginBottom:14}}>
        {[{label:sideType,colors:{Equilateral:[C,'#dbeafe'],Isosceles:['#10b981','#d1fae5'],Scalene:['#f59e0b','#fef3c7']}[sideType]||['#8b5cf6','#ede9fe']},{label:angleType+' Triangle',colors:{Acute:['#10b981','#d1fae5'],Right:['#3b82f6','#dbeafe'],Obtuse:['#f59e0b','#fef3c7']}[angleType]||['#8b5cf6','#ede9fe']}].map((badge,i)=>(<div key={i} style={{flex:1,padding:'8px 12px',borderRadius:9,background:badge.colors[1],border:`1px solid ${badge.colors[0]}40`,textAlign:'center'}}><div style={{fontSize:12,fontWeight:700,color:badge.colors[0]}}>{badge.label}</div></div>))}
      </div>

      {/* Live triangle SVG */}
      <div style={{background:'var(--bg-card)',border:`1.5px solid ${C}30`,borderRadius:14,padding:'14px 18px',marginBottom:14}}>
        <div style={{fontSize:12,fontWeight:700,color:'var(--text)',marginBottom:10}}>Triangle diagram</div>
        <svg viewBox="0 0 200 140" width="100%" style={{display:'block'}}>
          <polygon points={`${Ax},${Ay} ${Bx},${By} ${Cx},${Cy}`} fill={C+'10'} stroke={C} strokeWidth="1.5"/>
          {/* side labels */}
          <text x={(Ax+Bx)/2} y={Ay+14} textAnchor="middle" fontSize="11" fontWeight="700" fill={C}>a={fmt(solved.a,2)}</text>
          <text x={(Ax+Cx)/2-12} y={(Ay+Cy)/2} textAnchor="middle" fontSize="11" fontWeight="700" fill="#10b981">b={fmt(solved.b,2)}</text>
          <text x={(Bx+Cx)/2+12} y={(By+Cy)/2} textAnchor="middle" fontSize="11" fontWeight="700" fill="#f59e0b">c={fmt(solved.c,2)}</text>
          {/* angle labels */}
          <text x={Ax-6} y={Ay+4} textAnchor="end" fontSize="9" fill={C}>{fmt(solved.A,1)}°</text>
          <text x={Bx+4} y={By+4} fontSize="9" fill="#10b981">{fmt(solved.B,1)}°</text>
          <text x={Cx} y={Cy-5} textAnchor="middle" fontSize="9" fill="#f59e0b">{fmt(solved.C,1)}°</text>
        </svg>
      </div>

      <BreakdownTable title="Solved triangle" rows={[
        {label:'Side a',value:fmt(solved.a)+' units',color:C,bold:true,highlight:true},
        {label:'Side b',value:fmt(solved.b)+' units',color:'#10b981'},
        {label:'Side c',value:fmt(solved.c)+' units',color:'#f59e0b'},
        {label:'Angle A',value:fmt(solved.A)+'°'},
        {label:'Angle B',value:fmt(solved.B)+'°'},
        {label:'Angle C',value:fmt(solved.C)+'°'},
        {label:'Perimeter',value:fmt(perimeter)+' units'},
        {label:'Area',value:fmt(area)+' sq units'},
      ]}/>
      <AIHintCard hint={`${mode}: a=${fmt(solved.a)}, b=${fmt(solved.b)}, c=${fmt(solved.c)}, A=${fmt(solved.A)}°, B=${fmt(solved.B)}°, C=${fmt(solved.C)}°, Area=${fmt(area)}`}/>
      </>)}
    </>}/>

    <StepsCard steps={steps} color={C}/>

    {/* Triangle classification chart */}
    <Sec title="Triangle classification — all types" sub="By angles and by sides">
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:14}}>
        <div>
          <div style={{fontSize:12,fontWeight:700,color:'var(--text-3)',marginBottom:8,textTransform:'uppercase',letterSpacing:'.05em'}}>By Angles</div>
          {[{type:'Acute',rule:'All angles < 90°',eg:'60°, 70°, 50°',color:'#10b981'},{type:'Right',rule:'One angle = 90°',eg:'90°, 45°, 45°',color:C},{type:'Obtuse',rule:'One angle > 90°',eg:'120°, 35°, 25°',color:'#f59e0b'}].map((t,i)=>(<div key={i} style={{padding:'10px 12px',borderRadius:9,background:t.color+'08',border:`1px solid ${t.color}25`,marginBottom:8}}>
            <div style={{fontSize:12,fontWeight:700,color:t.color}}>{t.type}</div>
            <div style={{fontSize:11,color:'var(--text-2)',marginTop:3}}>{t.rule}</div>
            <div style={{fontSize:10,color:'var(--text-3)',marginTop:2}}>e.g. {t.eg}</div>
          </div>))}
        </div>
        <div>
          <div style={{fontSize:12,fontWeight:700,color:'var(--text-3)',marginBottom:8,textTransform:'uppercase',letterSpacing:'.05em'}}>By Sides</div>
          {[{type:'Equilateral',rule:'All 3 sides equal',eg:'All angles = 60°',color:'#8b5cf6'},{type:'Isosceles',rule:'2 sides equal',eg:'Base angles equal',color:'#ec4899'},{type:'Scalene',rule:'All sides different',eg:'All angles different',color:'#ef4444'}].map((t,i)=>(<div key={i} style={{padding:'10px 12px',borderRadius:9,background:t.color+'08',border:`1px solid ${t.color}25`,marginBottom:8}}>
            <div style={{fontSize:12,fontWeight:700,color:t.color}}>{t.type}</div>
            <div style={{fontSize:11,color:'var(--text-2)',marginTop:3}}>{t.rule}</div>
            <div style={{fontSize:10,color:'var(--text-3)',marginTop:2}}>{t.eg}</div>
          </div>))}
        </div>
      </div>
    </Sec>

    {/* Special triangles */}
    <Sec title="Special triangles — memorise these" sub="They appear everywhere in mathematics">
      <div style={{overflowX:'auto'}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontFamily:"'DM Sans',sans-serif"}}>
          <thead><tr style={{borderBottom:`2px solid ${C}30`}}>{['Triangle','Angles','Side ratios','Where used'].map(h=>(<th key={h} style={{padding:'8px 10px',textAlign:'left',fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.06em'}}>{h}</th>))}</tr></thead>
          <tbody>{[
            {name:'45-45-90',angles:'45°, 45°, 90°',sides:'1 : 1 : √2',use:'Square diagonal, rotated squares'},
            {name:'30-60-90',angles:'30°, 60°, 90°',sides:'1 : √3 : 2',use:'Equilateral triangle half, trig values'},
            {name:'3-4-5 right',angles:'37°, 53°, 90°',sides:'3 : 4 : 5',use:'Construction, carpentry right-angle check'},
            {name:'Equilateral',angles:'60°, 60°, 60°',sides:'1 : 1 : 1',use:'Tessellation, regular hexagons'},
            {name:'Golden gnomon',angles:'36°, 36°, 108°',sides:'φ : φ : 1',use:'Pentagons, golden ratio geometry'},
          ].map((t,i)=>(<tr key={i} style={{borderBottom:'0.5px solid var(--border)'}}><td style={{padding:'8px 10px',fontWeight:700,color:C,fontFamily:"'Space Grotesk',sans-serif"}}>{t.name}</td><td style={{padding:'8px 10px',fontSize:12}}>{t.angles}</td><td style={{padding:'8px 10px',fontSize:12,fontFamily:"'Space Grotesk',sans-serif"}}>{t.sides}</td><td style={{padding:'8px 10px',fontSize:11,color:'var(--text-3)'}}>{t.use}</td></tr>))}</tbody>
        </table>
      </div>
    </Sec>

    <Sec title="⚠️ Common mistakes">
      <div style={{display:'flex',flexDirection:'column',gap:8}}>
        {['The Law of Sines ambiguous case (SSA) can give 0, 1, or 2 triangles — always check all possibilities','Angles must sum to EXACTLY 180° — if yours do not, re-check your values','The Law of Cosines, not Sines, must be used when you have SSS or SAS — Law of Sines needs an angle-side pair','The largest angle is always opposite the longest side — use this to check answers'].map((m,i)=>(<div key={i} style={{display:'flex',gap:12,padding:'10px 14px',borderRadius:9,background:'#fee2e210',border:'0.5px solid #ef444420'}}><span style={{fontSize:14,flexShrink:0,color:'#ef4444',fontWeight:700}}>✗</span><span style={{fontSize:12.5,color:'var(--text-2)',lineHeight:1.6}}>{m}</span></div>))}
      </div>
    </Sec>

    <Sec title="Frequently asked questions">
      {[{q:'What is the difference between Law of Sines and Law of Cosines?',a:'Law of Sines (a/sin A = b/sin B = c/sin C) works when you have an angle-side pair: ASA, AAS, or SSA. Law of Cosines (c² = a²+b²−2ab·cos C) is needed when you have three sides (SSS) or two sides and an included angle (SAS). Think of Law of Cosines as the Pythagorean theorem for any triangle — when C=90°, cos(90°)=0 and it reduces to a²+b²=c².'},{q:'When does the SSA case have two solutions?',a:"SSA (two sides and a non-included angle) is the ambiguous case. If side a (opposite angle A) is shorter than side b, there can be two triangles. Geometrically: you're swinging side a like a pendulum — it may hit the base line in two places, giving two valid triangles. If a ≥ b, only one triangle is possible. If a < b·sin A, no triangle exists."},{q:"What is Heron's formula and when is it used?",a:"Heron's formula calculates triangle area using only the three sides: s = (a+b+c)/2 (semi-perimeter), then Area = √(s(s-a)(s-b)(s-c)). It's ideal when you know all three sides but no angles — like in SSS mode. Named after Heron of Alexandria (10-70 AD), though Archimedes may have known it earlier."},{q:'Does every set of three angles define a unique triangle?',a:'No — three angles (AAA) define the SHAPE but not the SIZE. Any equilateral triangle has 60°-60°-60°, but could be tiny or enormous. You always need at least one side length to define a unique triangle. This is why AAA is not a valid input mode.'}].map((f,i)=>(<Acc key={i} q={f.q} a={f.a} open={openFaq===i} onToggle={()=>setOpenFaq(openFaq===i?null:i)} color={C}/>))}
    </Sec>

  </div>)
}
