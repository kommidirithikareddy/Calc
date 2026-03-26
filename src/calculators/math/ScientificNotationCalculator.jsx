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

export default function ScientificNotationCalculator({meta,category}){
  const C=category?.color||'#3b82f6'
  const[mode,setMode]=useState('toSci') // toSci | fromSci | multiply | divide
  const[num,setNum]=useState(0.000045)
  const[coeff,setCoeff]=useState(4.5)
  const[exp,setExp]=useState(-5)
  const[coeff2,setCoeff2]=useState(3.2)
  const[exp2,setExp2]=useState(3)
  const[openFaq,setOpenFaq]=useState(null)

  const toSciNotation=n=>{if(n===0)return{c:0,e:0};const e=Math.floor(Math.log10(Math.abs(n)));const c=n/Math.pow(10,e);return{c:parseFloat(c.toFixed(6)),e}}
  const sci=toSciNotation(Number(num)||0)
  const fromSci=Number(coeff)*Math.pow(10,Number(exp))
  const multC=Number(coeff)*Number(coeff2), multE=Number(exp)+Number(exp2)
  const divC=Number(coeff)/Number(coeff2), divE=Number(exp)-Number(exp2)
  const normMult=toSciNotation(multC*Math.pow(10,multE))
  const normDiv=toSciNotation(divC*Math.pow(10,divE))

  const steps=mode==='toSci'?[
    {label:'Start with the number',math:String(Number(num)||0)},
    {label:'Count decimal places to move',math:`Move decimal to get a number between 1 and 10`,note:'The coefficient must satisfy 1 ≤ |coefficient| < 10'},
    {label:'Write coefficient',math:`Coefficient = ${sci.c}`,note:`Moved decimal ${Math.abs(sci.e)} places ${sci.e>0?'left':'right'}`},
    {label:'Determine exponent',math:`Exponent = ${sci.e}`,note:sci.e>0?`Moved left → positive exponent`:`Moved right → negative exponent`},
    {label:'Result',math:`${num} = ${sci.c} × 10^${sci.e}`},
  ]:mode==='fromSci'?[
    {label:'Write in standard form',math:`${coeff} × 10^${exp}`,note:'Scientific notation: coefficient × power of 10'},
    {label:'Calculate 10^n',math:`10^${exp} = ${Math.pow(10,Number(exp))}`,note:Number(exp)>0?'Large exponent → large number':'Negative exponent → small decimal'},
    {label:'Multiply',math:`${coeff} × ${Math.pow(10,Number(exp))} = ${fmt(fromSci)}`},
  ]:mode==='multiply'?[
    {label:'Write out multiplication',math:`(${coeff} × 10^${exp}) × (${coeff2} × 10^${exp2})`},
    {label:'Multiply coefficients',math:`${coeff} × ${coeff2} = ${fmt(multC)}`},
    {label:'Add exponents',math:`10^${exp} × 10^${exp2} = 10^(${exp}+${exp2}) = 10^${multE}`,note:'When multiplying powers: add exponents'},
    {label:'Combine',math:`${fmt(multC)} × 10^${multE}`},
    {label:'Normalize (if needed)',math:`= ${fmt(normMult.c)} × 10^${normMult.e}`,note:'Adjust so coefficient is between 1 and 10'},
  ]:[
    {label:'Write out division',math:`(${coeff} × 10^${exp}) ÷ (${coeff2} × 10^${exp2})`},
    {label:'Divide coefficients',math:`${coeff} ÷ ${coeff2} = ${fmt(divC)}`},
    {label:'Subtract exponents',math:`10^${exp} ÷ 10^${exp2} = 10^(${exp}−${exp2}) = 10^${divE}`,note:'When dividing powers: subtract exponents'},
    {label:'Normalize',math:`= ${fmt(normDiv.c)} × 10^${normDiv.e}`},
  ]

  return(<div style={{display:'flex',flexDirection:'column',gap:20}}>
    <FormulaCard formula="a × 10^n     where 1 ≤ |a| < 10     e.g. 4.5 × 10⁻⁵ = 0.000045" desc="Scientific notation expresses very large or very small numbers compactly" color={C}/>
    <CalcShell left={<>
      <div style={{display:'flex',flexDirection:'column',gap:6,marginBottom:14}}>
        {[{v:'toSci',l:'Number → Scientific notation'},{v:'fromSci',l:'Scientific notation → Number'},{v:'multiply',l:'Multiply in sci notation'},{v:'divide',l:'Divide in sci notation'}].map(m=>(<button key={m.v} onClick={()=>setMode(m.v)} style={{padding:'9px 14px',borderRadius:9,border:`1.5px solid ${mode===m.v?C:'var(--border-2)'}`,background:mode===m.v?C+'12':'var(--bg-raised)',cursor:'pointer',textAlign:'left',fontSize:12,fontWeight:mode===m.v?700:500,color:mode===m.v?C:'var(--text)'}}>{m.l}</button>))}
      </div>
      <div style={{borderTop:'0.5px solid var(--border)',paddingTop:16}}>
        {mode==='toSci'&&<MathInput label="Number" value={num} onChange={setNum} hint="e.g. 0.000045 or 6700000" color={C}/>}
        {mode==='fromSci'&&<><MathInput label="Coefficient (a)" value={coeff} onChange={setCoeff} hint="1 ≤ |a| < 10" color={C}/><MathInput label="Exponent (n)" value={exp} onChange={setExp} hint="integer" color={C}/></>}
        {(mode==='multiply'||mode==='divide')&&<><div style={{fontSize:12,fontWeight:600,color:'var(--text-2)',marginBottom:8}}>First number: a × 10^n</div><MathInput label="a₁ (coefficient)" value={coeff} onChange={setCoeff} color={C}/><MathInput label="n₁ (exponent)" value={exp} onChange={setExp} color={C}/><div style={{fontSize:12,fontWeight:600,color:'var(--text-2)',marginBottom:8,marginTop:8}}>{mode==='multiply'?'×':'÷'} Second: b × 10^m</div><MathInput label="b₂ (coefficient)" value={coeff2} onChange={setCoeff2} color={C}/><MathInput label="m₂ (exponent)" value={exp2} onChange={setExp2} color={C}/></>}
      </div>
      <div style={{borderTop:'0.5px solid var(--border)',paddingTop:14,marginTop:4}}>
        <div style={{fontSize:10,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:10}}>🎯 Examples</div>
        {[{n:0.000045,l:'Wavelength: 0.000045m'},{n:6.674e-11,l:"Newton's G constant"},{n:299792458,l:'Speed of light'},{n:6.022e23,l:"Avogadro's number"}].map((ex,i)=>(<button key={i} onClick={()=>{setMode('toSci');setNum(ex.n)}} style={{display:'block',width:'100%',padding:'8px 12px',borderRadius:8,border:'1px solid var(--border-2)',background:'var(--bg-raised)',cursor:'pointer',textAlign:'left',marginBottom:6,fontSize:11,color:'var(--text)',fontFamily:"'DM Sans',sans-serif"}} onMouseEnter={e=>e.currentTarget.style.borderColor=C+'60'} onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border-2)'}>{ex.l}</button>))}
      </div>
    </>} right={<>
      <BigResult
        value={mode==='toSci'?`${sci.c} × 10^${sci.e}`:mode==='fromSci'?fmt(fromSci):mode==='multiply'?`${fmt(normMult.c)} × 10^${normMult.e}`:`${fmt(normDiv.c)} × 10^${normDiv.e}`}
        label="Result" color={C}
        note={mode==='toSci'?`${num} = ${sci.c} × 10^${sci.e}. The exponent ${sci.e} tells you to move the decimal ${Math.abs(sci.e)} places ${sci.e>0?'right':'left'}.`:mode==='fromSci'?`${coeff} × 10^${exp} = ${fmt(fromSci)}`:mode==='multiply'?`Multiply coefficients, add exponents: ${coeff}×${coeff2}=  ${fmt(multC)}, ${exp}+${exp2}=${multE}`:`Divide coefficients, subtract exponents`}/>
      {/* scale comparison */}
      <div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,padding:'14px 18px',marginBottom:14}}>
        <div style={{fontSize:12,fontWeight:700,color:'var(--text)',marginBottom:12,fontFamily:"'Space Grotesk',sans-serif"}}>Powers of 10 — scale reference</div>
        {[{e:24,l:'10²⁴ — yotta (galaxy scale)'},{e:15,l:'10¹⁵ — peta (petabyte)'},{e:9,l:'10⁹ — giga, billion'},{e:6,l:'10⁶ — mega, million'},{e:3,l:'10³ — kilo, thousand'},{e:0,l:'10⁰ = 1'},{e:-3,l:'10⁻³ — milli (mm)'},{e:-6,l:'10⁻⁶ — micro (μm)'},{e:-9,l:'10⁻⁹ — nano (nm)'},{e:-12,l:'10⁻¹² — pico'}].map((s,i)=>(<div key={i} style={{display:'flex',alignItems:'center',gap:8,padding:'4px 0',borderBottom:'0.5px solid var(--border)'}}><div style={{fontSize:11,fontWeight:700,color:(mode==='toSci'&&s.e===sci.e)||(mode==='fromSci'&&s.e===Number(exp))?C:'var(--text-3)',minWidth:50}}>{s.e>=0?'+':''}{s.e}</div><div style={{fontSize:11,color:(mode==='toSci'&&s.e===sci.e)||(mode==='fromSci'&&s.e===Number(exp))?C:'var(--text-2)'}}>{s.l}</div>{((mode==='toSci'&&s.e===sci.e)||(mode==='fromSci'&&s.e===Number(exp)))&&<div style={{fontSize:9,fontWeight:700,color:C,background:C+'18',padding:'1px 6px',borderRadius:5,flexShrink:0}}>← yours</div>}</div>))}
      </div>
      <AIHintCard hint={mode==='toSci'?`${num} = ${sci.c} × 10^${sci.e}`:`Result: ${mode==='fromSci'?fmt(fromSci):mode==='multiply'?`${fmt(normMult.c)} × 10^${normMult.e}`:`${fmt(normDiv.c)} × 10^${normDiv.e}`}`}/>
    </>}/>
    <StepsCard steps={steps} color={C}/>
    <Sec title="Where scientific notation is essential">
      <RealWorld items={[{icon:'🔬',field:'Chemistry — Avogadro',desc:"One mole of any substance contains 6.022 × 10²³ particles. Writing 602,200,000,000,000,000,000,000 is impractical.",example:"Avogadro's number: 6.022 × 10²³",color:C},{icon:'🌌',field:'Astronomy',desc:'The distance from Earth to the Andromeda galaxy is 2.537 × 10²² metres. Astronomical distances require scientific notation.',example:'Earth to Andromeda: 2.54 × 10²² m',color:'#8b5cf6'},{icon:'⚛️',field:'Physics — particle size',desc:'The radius of a proton is 8.5 × 10⁻¹⁶ metres. Nuclear and quantum physics regularly work with values 10⁻¹⁵ to 10⁻³⁵.',example:'Proton radius: 8.5 × 10⁻¹⁶ m',color:'#ef4444'},{icon:'💻',field:'Computer storage',desc:'1 terabyte = 10¹² bytes. 1 petabyte = 10¹⁵. As storage scales, scientific notation makes sizes communicable.',example:'1 TB = 1 × 10¹² bytes',color:'#10b981'}]}/>
    </Sec>
    <Sec title="⚠️ Common mistakes"><MistakesList items={['Coefficient outside 1–10 range: 45 × 10² should be 4.5 × 10³','Sign error in exponent: 0.0045 = 4.5 × 10⁻³ (negative), not 10⁺³','When multiplying: multiplying exponents instead of adding them (wrong: 10² × 10³ ≠ 10⁶, correct: = 10⁵)']}/></Sec>
    <Sec title="Frequently asked questions">
      {[{q:'Why does a negative exponent give a small number?',a:'10⁻¹ = 1/10 = 0.1. 10⁻³ = 1/1000 = 0.001. A negative exponent means divide by that power of 10. Think of it as moving the decimal point left (negative) vs right (positive). This is why very small scientific measurements (wavelengths, atomic radii) have large negative exponents.'},{q:'What is the difference between scientific notation and engineering notation?',a:'In scientific notation, the exponent is any integer and the coefficient is 1 ≤ |a| < 10. In engineering notation, the exponent must be a multiple of 3 (matching SI prefixes: kilo=10³, mega=10⁶, etc.) and the coefficient is 1 ≤ |a| < 1000. Engineers use 4.5 × 10⁻³ but prefer 4.5 milli-something.'}].map((f,i)=>(<Acc key={i} q={f.q} a={f.a} open={openFaq===i} onToggle={()=>setOpenFaq(openFaq===i?null:i)} color={C}/>))}
    </Sec>
  </div>)
}

