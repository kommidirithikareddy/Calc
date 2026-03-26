import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'

const fmt = n => isNaN(n)||!isFinite(n)||n===null?'—':parseFloat(Number(n).toFixed(6)).toString()
const sq = n => Number(n)*Number(n)

// ─── shared UI ──────────────────────────────────────────────────
function Sec({title,sub,children}){return(<div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,overflow:'hidden'}}><div style={{padding:'13px 18px',borderBottom:'0.5px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center'}}><span style={{fontSize:13,fontWeight:700,color:'var(--text)',fontFamily:"'Space Grotesk',sans-serif"}}>{title}</span>{sub&&<span style={{fontSize:11,color:'var(--text-3)'}}>{sub}</span>}</div><div style={{padding:'16px 18px'}}>{children}</div></div>)}
function Acc({q,a,open,onToggle,color}){return(<div style={{borderBottom:'0.5px solid var(--border)'}}><button onClick={onToggle} style={{width:'100%',display:'flex',justifyContent:'space-between',alignItems:'center',padding:'13px 0',background:'none',border:'none',cursor:'pointer',gap:12,textAlign:'left'}}><span style={{fontSize:13,fontWeight:600,color:'var(--text)',fontFamily:"'DM Sans',sans-serif",lineHeight:1.4}}>{q}</span><span style={{fontSize:18,color,flexShrink:0,transform:open?'rotate(45deg)':'none',transition:'transform .2s'}}>+</span></button>{open&&<p style={{fontSize:12.5,color:'var(--text-2)',lineHeight:1.75,margin:'0 0 13px',fontFamily:"'DM Sans',sans-serif"}}>{a}</p>}</div>)}
function StepsCard({steps,color}){const[exp,setExp]=useState(false);if(!steps?.length)return null;const vis=exp?steps:steps.slice(0,2);return(<div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,overflow:'hidden'}}><div style={{padding:'12px 18px',borderBottom:'0.5px solid var(--border)',display:'flex',justifyContent:'space-between'}}><span style={{fontSize:13,fontWeight:700,color:'var(--text)',fontFamily:"'Space Grotesk',sans-serif"}}>Step-by-step working</span><span style={{fontSize:11,color:'var(--text-3)'}}>{steps.length} steps</span></div><div style={{padding:'16px 18px',display:'flex',flexDirection:'column',gap:14}}>{vis.map((s,i)=>(<div key={i} style={{display:'flex',gap:14,alignItems:'flex-start'}}><div style={{width:26,height:26,borderRadius:'50%',flexShrink:0,background:i===steps.length-1?color:color+'18',border:`1.5px solid ${color}40`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,color:i===steps.length-1?'#fff':color}}>{i===steps.length-1?'✓':i+1}</div><div style={{flex:1}}>{s.label&&<div style={{fontSize:10,fontWeight:700,color,textTransform:'uppercase',letterSpacing:'.06em',marginBottom:4}}>{s.label}</div>}<div style={{fontSize:13,fontFamily:"'Space Grotesk',sans-serif",fontWeight:i===steps.length-1?700:500,background:'var(--bg-raised)',padding:'8px 12px',borderRadius:8,border:`0.5px solid ${i===steps.length-1?color+'40':'var(--border)'}`}}>{s.math}</div>{s.note&&<div style={{fontSize:11.5,color:'var(--text-3)',marginTop:4,fontStyle:'italic'}}>↳ {s.note}</div>}</div></div>))}{steps.length>2&&<button onClick={()=>setExp(e=>!e)} style={{padding:'9px',borderRadius:9,border:`1px solid ${color}30`,background:color+'08',color,fontSize:12,fontWeight:600,cursor:'pointer'}}>{exp?'▲ Hide steps':`▼ Show all ${steps.length} steps`}</button>}</div></div>)}
function MathInput({label,value,onChange,color,unit,hint,disabled}){const[f,setF]=useState(false);return(<div style={{marginBottom:14,opacity:disabled?0.45:1}}><div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}><label style={{fontSize:12.5,fontWeight:600,color:'var(--text)',fontFamily:"'DM Sans',sans-serif"}}>{label}</label>{hint&&<span style={{fontSize:10,color:'var(--text-3)'}}>{hint}</span>}</div><div style={{display:'flex',height:44,border:`1.5px solid ${f&&!disabled?color:'var(--border-2)'}`,borderRadius:9,overflow:'hidden',background:'var(--bg-card)',transition:'border-color .15s'}}><input disabled={disabled} type="number" value={value} onChange={e=>onChange(e.target.value===''?'':Number(e.target.value))} onFocus={()=>setF(true)} onBlur={()=>setF(false)} style={{flex:1,border:'none',background:'transparent',padding:'0 14px',fontSize:17,fontWeight:700,color:'var(--text)',outline:'none',fontFamily:"'Space Grotesk',sans-serif",cursor:disabled?'not-allowed':'text'}}/>{unit&&<div style={{padding:'0 12px',display:'flex',alignItems:'center',background:'var(--bg-raised)',borderLeft:'1px solid var(--border)',fontSize:13,fontWeight:600,color:'var(--text-3)'}}>{unit}</div>}</div></div>)}

const TRIPLES = [
  {a:3,b:4,c:5,note:'Most fundamental triple'},
  {a:5,b:12,c:13,note:'Common in geometry'},
  {a:8,b:15,c:17,note:'Important for Olympiads'},
  {a:7,b:24,c:25,note:'7-24-25 family'},
  {a:9,b:40,c:41,note:'Large primitive triple'},
  {a:6,b:8,c:10,note:'Scaled 3-4-5'},
  {a:10,b:24,c:26,note:'Scaled 5-12-13'},
  {a:12,b:35,c:37,note:'Primitive triple'},
  {a:20,b:21,c:29,note:'Primitive triple'},
  {a:28,b:45,c:53,note:'Primitive triple'},
]

const REAL_WORLD = [
  {icon:'🏗️',title:'Construction & Carpentry',desc:'Builders use the 3-4-5 rule to check right angles. Measure 3 feet along one wall, 4 feet along the other — if the diagonal is exactly 5 feet, the corner is a perfect 90°.',detail:'Used daily by carpenters, architects and masons worldwide.',color:'#f59e0b'},
  {icon:'📺',title:'Screen Diagonals',desc:'The diagonal size of your TV, phone, or monitor is calculated using the Pythagorean theorem from the width and height. A 16:9 screen at 1920×1080 pixels has a diagonal of √(1920²+1080²) ≈ 2203 pixels.',detail:'Every screen size spec you see uses this formula.',color:'#3b82f6'},
  {icon:'✈️',title:'Navigation & GPS',desc:'Pilots and ships use the Pythagorean theorem for 2D distance calculations. GPS systems use the 3D version (x²+y²+z²=d²) to calculate exact distances between coordinates on Earth.',detail:'Air traffic control uses this for separation distances.',color:'#8b5cf6'},
  {icon:'⚽',title:'Sports Field Marking',desc:'To mark a perfect rectangular football field, groundskeepers measure diagonals. If both diagonals are equal and match √(length²+width²), the field is a perfect rectangle.',detail:'A 100m×64m field has a diagonal of 119.7m.',color:'#10b981'},
  {icon:'📡',title:'Telecommunications',desc:'Engineers calculate the line-of-sight distance between towers using the Pythagorean theorem. This determines signal strength and whether a relay tower is needed.',detail:'Critical for 5G tower placement calculations.',color:'#ec4899'},
  {icon:'🎮',title:'Video Game Physics',desc:'Every game engine calculates distances between characters, objects, and targets using Pythagoras. Collision detection, pathfinding, and projectile motion all rely on this theorem.',detail:'One of the most-used formulas in game development.',color:'#ef4444'},
]

const GLOSSARY = [
  {term:'Hypotenuse',def:'The longest side of a right triangle, always opposite the right angle (90°). In a²+b²=c², c is always the hypotenuse.'},
  {term:'Leg (Cathetus)',def:'Either of the two shorter sides of a right triangle that form the right angle. Also called the adjacent and opposite sides.'},
  {term:'Right angle',def:'An angle of exactly 90°, indicated by a small square symbol in diagrams. It is the angle between the two legs of a right triangle.'},
  {term:'Pythagorean triple',def:'A set of three positive integers (a, b, c) satisfying a²+b²=c². The most famous is (3, 4, 5). There are infinitely many primitive (non-scaled) triples.'},
  {term:'Converse of Pythagorean Theorem',def:'If a²+b²=c² holds for the three sides of a triangle, then that triangle must contain a right angle. This is used to verify if an angle is exactly 90°.'},
  {term:'Irrational number',def:'A number that cannot be expressed as a fraction — its decimal representation never ends or repeats. √2 is irrational: the diagonal of a unit square. This discovery by ancient Greeks was a mathematical crisis.'},
]

const FAQ = [
  {q:'Why is the theorem called "Pythagorean"?',a:"It's named after the Greek mathematician Pythagoras (c. 570–495 BC), although the relationship was known to Babylonian mathematicians over 1000 years earlier. A Babylonian clay tablet (Plimpton 322) from 1800 BC lists Pythagorean triples, predating Pythagoras significantly. What Pythagoras (or his school) contributed was likely the first rigorous proof."},
  {q:'Does the theorem work in 3D?',a:'Yes — the 3D version is the distance formula: d² = x² + y² + z². The distance between points (x₁,y₁,z₁) and (x₂,y₂,z₂) is √((x₂-x₁)²+(y₂-y₁)²+(z₂-z₁)²). GPS systems use this to calculate positions on a sphere. The theorem extends to any number of dimensions.'},
  {q:'Can I use this theorem for any triangle?',a:"No — the theorem a²+b²=c² only applies to RIGHT triangles (triangles with a 90° angle). For other triangles, use the Law of Cosines: c² = a²+b²−2ab·cos(C). When angle C = 90°, cos(90°) = 0, and the Law of Cosines reduces to the Pythagorean theorem."},
  {q:'Why does a²+b²=c² work? What is the proof?',a:"There are over 370 known proofs. The most visual: draw four identical right triangles arranged around a central square. The outer square has side (a+b) and area (a+b)² = a²+2ab+b². The four triangles together have area 4×(ab/2) = 2ab. The inner square has area c². So: (a+b)² = 4×(½ab) + c² → a²+2ab+b² = 2ab+c² → a²+b² = c²."},
  {q:'What are Pythagorean triples and how do I generate them?',a:'Use Euclid\'s formula: for any two positive integers m > n, set a = m²-n², b = 2mn, c = m²+n². Example: m=2, n=1 → a=3, b=4, c=5. m=3, n=2 → a=5, b=12, c=13. Every primitive triple can be generated this way. Multiply any triple by a positive integer to get more triples.'},
]

export default function PythagoreanTheoremCalculator({meta,category}){
  const C = category?.color||'#3b82f6'
  const[mode,setMode]=useState('findC') // findC | findA | findB | verify
  const[a,setA]=useState(3)
  const[b,setB]=useState(4)
  const[c,setC2]=useState(5)
  const[openFaq,setOpenFaq]=useState(null)
  const[openGloss,setOpenGloss]=useState(null)
  const[showProof,setShowProof]=useState(false)

  const na=Number(a)||0, nb=Number(b)||0, nc=Number(c)||0
  let result=null, steps=[], label='', isValid=true

  if(mode==='findC'){
    result=Math.sqrt(sq(na)+sq(nb))
    label='Hypotenuse (c)'
    steps=[
      {label:'Write the theorem',math:'a² + b² = c²',note:'a and b are legs, c is the hypotenuse (longest side)'},
      {label:'Substitute values',math:`${na}² + ${nb}² = c²`,note:'Square each leg'},
      {label:'Square the legs',math:`${sq(na)} + ${sq(nb)} = c²`,note:`${na}×${na}=${sq(na)}, ${nb}×${nb}=${sq(nb)}`},
      {label:'Add the squares',math:`${sq(na)+sq(nb)} = c²`,note:'Sum of the squares of both legs'},
      {label:'Take the square root',math:`c = √${sq(na)+sq(nb)} = ${fmt(result)}`,note:'The positive square root gives the hypotenuse length'},
    ]
  } else if(mode==='findA'){
    result=Math.sqrt(sq(nc)-sq(nb))
    isValid=sq(nc)>=sq(nb)
    label='Leg a'
    steps=[
      {label:'Start with the theorem',math:'a² + b² = c²'},
      {label:'Rearrange for a',math:'a² = c² − b²',note:'Subtract b² from both sides'},
      {label:'Substitute',math:`a² = ${nc}² − ${nb}² = ${sq(nc)} − ${sq(nb)} = ${sq(nc)-sq(nb)}`},
      {label:'Square root',math:`a = √${sq(nc)-sq(nb)} = ${fmt(result)}`,note:'Only take the positive root — length is always positive'},
    ]
  } else if(mode==='findB'){
    result=Math.sqrt(sq(nc)-sq(na))
    isValid=sq(nc)>=sq(na)
    label='Leg b'
    steps=[
      {label:'Start with the theorem',math:'a² + b² = c²'},
      {label:'Rearrange for b',math:'b² = c² − a²'},
      {label:'Substitute',math:`b² = ${nc}² − ${na}² = ${sq(nc)} − ${sq(na)} = ${sq(nc)-sq(na)}`},
      {label:'Square root',math:`b = √${sq(nc)-sq(na)} = ${fmt(result)}`},
    ]
  } else {
    const lhs=sq(na)+sq(nb), rhs=sq(nc)
    const isRight=Math.abs(lhs-rhs)<0.0001
    label='Verification'
    steps=[
      {label:'Check if a²+b²=c²',math:`${na}² + ${nb}² vs ${nc}²`},
      {label:'Calculate left side',math:`${sq(na)} + ${sq(nb)} = ${lhs}`,note:`${na}²=${sq(na)}, ${nb}²=${sq(nb)}`},
      {label:'Calculate right side',math:`${nc}² = ${rhs}`},
      {label:'Compare',math:`${lhs} ${isRight?'=':'≠'} ${rhs}`,note:isRight?'The values are equal — this IS a right triangle!':'The values differ — this is NOT a right triangle'},
      {label:'Conclusion',math:isRight?`✓ YES — (${na}, ${nb}, ${nc}) forms a right triangle`:`✗ NO — (${na}, ${nb}, ${nc}) is not a right triangle`,note:isRight?'The angle between sides a and b is exactly 90°':'Try the 3-4-5 triple: a=3, b=4, c=5'},
    ]
    result=isRight?1:0
  }

  const dispResult=mode==='verify'?(sq(na)+sq(nb)===sq(nc)?'Right ✓':'Not Right ✗'):fmt(result)

  // SVG triangle dimensions
  const svgA=mode==='findC'?na:(mode==='findA'?Number(fmt(result)):na)
  const svgB=mode==='findC'?nb:(mode==='findB'?Number(fmt(result)):nb)
  const svgC=mode==='findC'?Number(fmt(result)):(mode==='findA'||mode==='findB'?nc:nc)
  const maxSide=Math.max(svgA,svgB,svgC,1)
  const scale=70/maxSide
  const tx=20, ty=20+svgB*scale, bx=20+svgA*scale, by=20+svgB*scale

  return(<div style={{display:'flex',flexDirection:'column',gap:20}}>

    {/* Formula card */}
    <div style={{background:`linear-gradient(135deg,${C}14,${C}06)`,border:`1px solid ${C}30`,borderRadius:14,padding:'18px 22px'}}>
      <div style={{fontSize:10,fontWeight:700,color:C,textTransform:'uppercase',letterSpacing:'.08em',marginBottom:8}}>The Pythagorean Theorem</div>
      <div style={{fontSize:26,fontWeight:800,color:C,fontFamily:"'Space Grotesk',sans-serif",letterSpacing:'-0.02em'}}>a² + b² = c²</div>
      <div style={{fontSize:12,color:'var(--text-2)',marginTop:6,lineHeight:1.6}}>In any right triangle: the square of the hypotenuse equals the sum of the squares of the two legs.<br/>a, b = legs (sides forming the right angle) · c = hypotenuse (longest side, opposite the right angle)</div>
    </div>

    <CalcShell left={<>
      <div style={{fontSize:12,fontWeight:600,color:'var(--text-2)',marginBottom:10}}>What do you want to find?</div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginBottom:16}}>
        {[{v:'findC',l:'Find c (hyp)',d:'Know a and b'},{v:'findA',l:'Find a (leg)',d:'Know b and c'},{v:'findB',l:'Find b (leg)',d:'Know a and c'},{v:'verify',l:'Verify triangle',d:'Check if right triangle'}].map(m=>(<button key={m.v} onClick={()=>setMode(m.v)} style={{padding:'10px',borderRadius:9,border:`1.5px solid ${mode===m.v?C:'var(--border-2)'}`,background:mode===m.v?C+'12':'var(--bg-raised)',cursor:'pointer',textAlign:'left'}}><div style={{fontSize:12,fontWeight:700,color:mode===m.v?C:'var(--text)'}}>{m.l}</div><div style={{fontSize:10,color:'var(--text-3)',marginTop:2}}>{m.d}</div></button>))}
      </div>
      <div style={{borderTop:'0.5px solid var(--border)',paddingTop:16}}>
        <MathInput label="Side a (leg)" value={a} onChange={setA} color={C} unit="units" disabled={mode==='findA'} hint={mode==='findA'?'calculated':undefined}/>
        <MathInput label="Side b (leg)" value={b} onChange={setB} color={C} unit="units" disabled={mode==='findB'} hint={mode==='findB'?'calculated':undefined}/>
        <MathInput label="Side c (hypotenuse)" value={c} onChange={setC2} color={C} unit="units" disabled={mode==='findC'} hint={mode==='findC'?'calculated':undefined}/>
      </div>
      <div style={{borderTop:'0.5px solid var(--border)',paddingTop:14,marginTop:4}}>
        <div style={{fontSize:10,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:10}}>🎯 Famous triangles — tap to load</div>
        {[{a:3,b:4,c:5,l:'3-4-5 (classic)'},{a:5,b:12,c:13,l:'5-12-13'},{a:8,b:15,c:17,l:'8-15-17'},{a:1,b:1,c:null,l:'√2 diagonal — unit square'}].map((ex,i)=>(<button key={i} onClick={()=>{setA(ex.a);setB(ex.b);if(ex.c)setC2(ex.c);setMode('findC')}} style={{display:'block',width:'100%',padding:'8px 12px',borderRadius:8,border:'1px solid var(--border-2)',background:'var(--bg-raised)',cursor:'pointer',textAlign:'left',marginBottom:6,fontSize:12,color:'var(--text)',fontFamily:"'DM Sans',sans-serif"}} onMouseEnter={e=>e.currentTarget.style.borderColor=C+'60'} onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border-2)'}>{ex.l}</button>))}
      </div>
    </>} right={<>
      {!isValid?(<div style={{background:'#fee2e2',border:'1px solid #ef444430',borderRadius:14,padding:'20px',marginBottom:14,textAlign:'center'}}><div style={{fontSize:15,fontWeight:700,color:'#dc2626'}}>⚠ Impossible triangle</div><div style={{fontSize:12,color:'#991b1b',marginTop:6}}>The hypotenuse must be longer than either leg. c &gt; a and c &gt; b.</div></div>):(<>
      {/* Answer */}
      <div style={{background:'var(--bg-card)',border:`1.5px solid ${C}30`,borderRadius:14,padding:'18px 20px',marginBottom:14}}>
        <div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:8}}>{label}</div>
        <div style={{fontSize:52,fontWeight:700,color:C,fontFamily:"'Space Grotesk',sans-serif",lineHeight:1}}>{dispResult}</div>
        {mode!=='verify'&&<div style={{fontSize:11,color:'var(--text-3)',marginTop:4}}>units</div>}
        <div style={{marginTop:12,padding:'10px 13px',background:C+'08',borderRadius:9,border:`1px solid ${C}20`,fontSize:12,color:'var(--text-2)',lineHeight:1.65}}>
          💡 {mode==='findC'&&`With legs ${na} and ${nb}, the hypotenuse is ${fmt(result)} units. Check: ${sq(na)}+${sq(nb)}=${sq(na)+sq(nb)}=${fmt(sq(Number(fmt(result))))} ✓`}
          {mode==='findA'&&`With hypotenuse ${nc} and leg ${nb}, the missing leg is ${fmt(result)} units.`}
          {mode==='findB'&&`With hypotenuse ${nc} and leg ${na}, the missing leg is ${fmt(result)} units.`}
          {mode==='verify'&&(sq(na)+sq(nb)===sq(nc)?`${na}²+${nb}²=${sq(na)+sq(nb)}=${sq(nc)}=${nc}² ✓ This IS a right triangle!`:`${na}²+${nb}²=${sq(na)+sq(nb)} ≠ ${sq(nc)}=${nc}² — Not a right triangle.`)}
        </div>
      </div>

      {/* Live triangle SVG */}
      <div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,padding:'14px 18px',marginBottom:14}}>
        <div style={{fontSize:12,fontWeight:700,color:'var(--text)',marginBottom:10,fontFamily:"'Space Grotesk',sans-serif"}}>Triangle diagram</div>
        <svg viewBox="0 0 160 120" width="100%" style={{display:'block'}}>
          <defs><marker id="sqMarker" markerWidth="6" markerHeight="6" refX="3" refY="3"><rect x="1" y="1" width="4" height="4" fill="none" stroke={C} strokeWidth="1"/></marker></defs>
          {/* right angle square */}
          <polyline points={`${tx+8},${ty} ${tx+8},${ty-8} ${tx},${ty-8}`} fill="none" stroke={C} strokeWidth="1" opacity="0.6"/>
          {/* triangle */}
          <polygon points={`${tx},${ty} ${bx},${by} ${tx},${ty-svgB*scale}`} fill={C+'10'} stroke={C} strokeWidth="1.5"/>
          {/* labels */}
          <text x={(tx+bx)/2} y={by+14} textAnchor="middle" fontSize="11" fontWeight="700" fill={C}>a = {mode==='findA'?fmt(result):na}</text>
          <text x={tx-16} y={(ty+ty-svgB*scale)/2} textAnchor="middle" fontSize="11" fontWeight="700" fill="#10b981">b = {mode==='findB'?fmt(result):nb}</text>
          <text x={(tx+bx)/2+16} y={(ty-svgB*scale+by)/2-4} textAnchor="middle" fontSize="11" fontWeight="700" fill="#f59e0b">c = {mode==='findC'?fmt(result):nc}</text>
          <text x={tx+3} y={ty-2} fontSize="9" fill={C}>90°</text>
        </svg>
      </div>

      <BreakdownTable title="Summary" rows={[
        {label:'a (leg)',value:fmt(mode==='findA'?result:na)+'  units',bold:mode==='findA',highlight:mode==='findA',color:C},
        {label:'b (leg)',value:fmt(mode==='findB'?result:nb)+' units',bold:mode==='findB',highlight:mode==='findB',color:'#10b981'},
        {label:'c (hypotenuse)',value:fmt(mode==='findC'?result:nc)+' units',bold:mode==='findC',highlight:mode==='findC',color:'#f59e0b'},
        {label:'a²',value:String(sq(mode==='findA'?Number(fmt(result)):na))},
        {label:'b²',value:String(sq(mode==='findB'?Number(fmt(result)):nb))},
        {label:'c²',value:String(sq(mode==='findC'?Number(fmt(result)):nc))},
      ]}/>
      <AIHintCard hint={`a=${na}, b=${nb}, c=${nc} → ${label}: ${dispResult}`}/>
      </>)}
    </>}/>

    <StepsCard steps={steps} color={C}/>

    {/* Proof visual */}
    <Sec title="Visual proof — why a²+b²=c² works" sub="Tap to see the classic geometric proof">
      <button onClick={()=>setShowProof(p=>!p)} style={{width:'100%',padding:'12px',borderRadius:10,border:`1px solid ${C}30`,background:C+'08',color:C,fontSize:13,fontWeight:700,cursor:'pointer',marginBottom:showProof?14:0}}>{showProof?'▲ Hide proof':'▼ Show geometric proof'}</button>
      {showProof&&<>
        <div style={{fontSize:12.5,color:'var(--text-2)',lineHeight:1.75,marginBottom:14,fontFamily:"'DM Sans',sans-serif"}}>
          Draw a large square with side length <strong>(a+b)</strong>. Place four identical right triangles inside, each with legs a and b. The square in the middle has side c (the hypotenuse). This gives us the proof:
        </div>
        <svg viewBox="0 0 260 200" width="100%" style={{display:'block',marginBottom:14}}>
          {/* outer square */}
          <rect x={20} y={10} width={160} height={160} fill="none" stroke="var(--border)" strokeWidth="1.5" strokeDasharray="4,2"/>
          {/* 4 triangles */}
          {[[20,10,100,10,20,90],[100,10,180,90,20,90],[180,90,180,170,100,170],[20,90,180,170,100,10]].map(([x1,y1,x2,y2,x3,y3],i)=>(
            <polygon key={i} points={`${x1},${y1} ${x2},${y2} ${x3},${y3}`} fill={[C+'25','#10b98125','#f59e0b25','#8b5cf625'][i]} stroke={[C,'#10b981','#f59e0b','#8b5cf6'][i]} strokeWidth="1.5"/>
          ))}
          {/* inner square (c²) */}
          <polygon points="100,10 180,90 100,170 20,90" fill={C+'15'} stroke={C} strokeWidth="2"/>
          <text x={100} y={95} textAnchor="middle" fontSize="13" fontWeight="800" fill={C}>c²</text>
          {/* labels */}
          <text x={60} y={7} textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--text-2)">a</text>
          <text x={140} y={7} textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--text-2)">b</text>
          <text x={195} y={55} textAnchor="start" fontSize="11" fontWeight="700" fill="var(--text-2)">a</text>
          <text x={195} y={135} textAnchor="start" fontSize="11" fontWeight="700" fill="var(--text-2)">b</text>
          {/* annotation */}
          <text x={200} y={95} textAnchor="start" fontSize="10" fill="var(--text-3)">Each triangle</text>
          <text x={200} y={108} textAnchor="start" fontSize="10" fill="var(--text-3)">has area ½ab</text>
        </svg>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8}}>
          {[{label:'Outer square area',val:'(a+b)²',color:'var(--text-2)'},{label:'4 triangles total',val:'4 × ½ab = 2ab',color:C},{label:'Inner square (c²)',val:'(a+b)² − 2ab',color:C}].map((s,i)=>(<div key={i} style={{padding:'10px',background:'var(--bg-raised)',borderRadius:9,textAlign:'center'}}><div style={{fontSize:10,color:'var(--text-3)',marginBottom:4}}>{s.label}</div><div style={{fontSize:13,fontWeight:700,color:s.color,fontFamily:"'Space Grotesk',sans-serif"}}>{s.val}</div></div>))}
        </div>
        <div style={{marginTop:12,padding:'12px 14px',background:C+'08',borderRadius:10,border:`1px solid ${C}20`,fontSize:13,fontWeight:600,color:C,textAlign:'center',fontFamily:"'Space Grotesk',sans-serif"}}>
          (a+b)² − 2ab = a²+2ab+b² − 2ab = a²+b² = c² ✓
        </div>
      </>}
    </Sec>

    {/* Pythagorean triples table */}
    <Sec title="Pythagorean triples — famous right triangles" sub="All satisfy a²+b²=c² exactly">
      <div style={{overflowX:'auto'}}>
        <table style={{width:'100%',borderCollapse:'collapse',fontFamily:"'DM Sans',sans-serif"}}>
          <thead><tr style={{borderBottom:`2px solid ${C}30`}}>{['a','b','c','a²+b²','c²','Note'].map(h=>(<th key={h} style={{padding:'8px 10px',textAlign:'left',fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.06em'}}>{h}</th>))}</tr></thead>
          <tbody>{TRIPLES.map((t,i)=>(<tr key={i} onClick={()=>{setA(t.a);setB(t.b);setC2(t.c);setMode('verify')}} style={{cursor:'pointer',borderBottom:'0.5px solid var(--border)'}} onMouseEnter={e=>e.currentTarget.style.background=C+'08'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
            <td style={{padding:'9px 10px',fontWeight:700,color:C,fontFamily:"'Space Grotesk',sans-serif"}}>{t.a}</td>
            <td style={{padding:'9px 10px',fontWeight:700,color:'#10b981',fontFamily:"'Space Grotesk',sans-serif"}}>{t.b}</td>
            <td style={{padding:'9px 10px',fontWeight:700,color:'#f59e0b',fontFamily:"'Space Grotesk',sans-serif"}}>{t.c}</td>
            <td style={{padding:'9px 10px',fontSize:12,color:'var(--text-2)'}}>{sq(t.a)+sq(t.b)}</td>
            <td style={{padding:'9px 10px',fontSize:12,color:'var(--text-2)'}}>{sq(t.c)}</td>
            <td style={{padding:'9px 10px',fontSize:11,color:'var(--text-3)'}}>{t.note}</td>
          </tr>))}</tbody>
        </table>
      </div>
      <div style={{marginTop:10,fontSize:11,color:'var(--text-3)'}}>Tap any row to verify it in the calculator above</div>
    </Sec>

    {/* Euclid's formula for generating triples */}
    <Sec title="Generate your own Pythagorean triples — Euclid's formula" sub="Works for all primitive triples">
      <div style={{padding:'14px 16px',background:C+'08',borderRadius:10,border:`1px solid ${C}20`,marginBottom:14}}>
        <div style={{fontSize:13,fontWeight:700,color:C,marginBottom:8,fontFamily:"'Space Grotesk',sans-serif"}}>For any integers m &gt; n &gt; 0:</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10}}>
          {['a = m² − n²','b = 2mn','c = m² + n²'].map((f,i)=>(<div key={i} style={{padding:'10px',background:'var(--bg-card)',borderRadius:8,border:'0.5px solid var(--border)',textAlign:'center',fontSize:13,fontWeight:700,color:C,fontFamily:"'Space Grotesk',sans-serif"}}>{f}</div>))}
        </div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
        {[[2,1],[3,2],[4,1],[4,3]].map(([m,n])=>{const ta=sq(m)-sq(n),tb=2*m*n,tc=sq(m)+sq(n);return(<div key={`${m}${n}`} style={{padding:'10px 12px',borderRadius:9,background:'var(--bg-raised)',border:'0.5px solid var(--border)'}} onClick={()=>{setA(ta);setB(tb);setC2(tc);setMode('verify')}}><div style={{fontSize:10,color:'var(--text-3)',marginBottom:4}}>m={m}, n={n}</div><div style={{fontSize:13,fontWeight:700,color:C}}>({ta}, {tb}, {tc})</div><div style={{fontSize:10,color:'var(--text-3)',marginTop:2}}>{sq(ta)}+{sq(tb)}={sq(ta)+sq(tb)}={sq(tc)} ✓</div></div>)})}</div>
    </Sec>

    {/* Real world */}
    <Sec title="Where Pythagoras shows up in real life" sub="From classrooms to construction sites">
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
        {REAL_WORLD.map((rw,i)=>(<div key={i} style={{padding:'12px 13px',borderRadius:11,background:rw.color+'08',border:`1px solid ${rw.color}25`}}><div style={{display:'flex',gap:8,alignItems:'center',marginBottom:7}}><span style={{fontSize:20}}>{rw.icon}</span><span style={{fontSize:12,fontWeight:700,color:rw.color}}>{rw.title}</span></div><p style={{fontSize:11.5,color:'var(--text-2)',lineHeight:1.65,margin:'0 0 6px',fontFamily:"'DM Sans',sans-serif"}}>{rw.desc}</p><div style={{fontSize:10,color:rw.color,fontStyle:'italic'}}>{rw.detail}</div></div>))}
      </div>
    </Sec>

    {/* Fun facts */}
    <Sec title="🤯 Mind-blowing facts about the Pythagorean theorem">
      <div style={{display:'flex',flexDirection:'column',gap:10}}>
        {[
          {fact:'Over 370 known proofs',detail:'The Pythagorean theorem has more proofs than any other theorem in mathematics. President James A. Garfield published an original proof in 1876 while still a member of Congress.',icon:'📜'},
          {fact:'Known 1,000 years before Pythagoras',detail:'The Babylonian clay tablet Plimpton 322 (1800 BC) contains Pythagorean triples, predating Pythagoras by over 1000 years. The Egyptians also used the 3-4-5 triangle to mark right angles.',icon:'🏺'},
          {fact:'√2 caused a mathematical crisis',detail:"The diagonal of a unit square is √2 ≈ 1.41421... — an irrational number. When this was discovered, the Pythagorean school's belief that 'all is number' (meaning rational number) was shattered. Legend says Hippasus was drowned for revealing this.",icon:'⚡'},
          {fact:'It works in non-Euclidean geometry... differently',detail:'On a sphere (like Earth), the Pythagorean theorem does NOT hold exactly. Great-circle navigation uses spherical trigonometry instead. Einstein\'s general relativity uses a curved spacetime version.',icon:'🌍'},
          {fact:'There are infinitely many Pythagorean triples',detail:"Euclid's formula generates all primitive triples: (m²-n², 2mn, m²+n²). Since there are infinitely many pairs (m,n), there are infinitely many triples. And each primitive triple generates infinitely many by scaling.",icon:'∞'},
        ].map((f,i)=>(<div key={i} style={{display:'flex',gap:12,padding:'12px 14px',borderRadius:10,background:'var(--bg-raised)',border:'0.5px solid var(--border)'}}><span style={{fontSize:20,flexShrink:0}}>{f.icon}</span><div><div style={{fontSize:12,fontWeight:700,color:'var(--text)',marginBottom:4}}>{f.fact}</div><div style={{fontSize:11.5,color:'var(--text-2)',lineHeight:1.65,fontFamily:"'DM Sans',sans-serif"}}>{f.detail}</div></div></div>))}
      </div>
    </Sec>

    {/* Common mistakes */}
    <Sec title="⚠️ Common mistakes to avoid">
      <div style={{display:'flex',flexDirection:'column',gap:8}}>
        {['Forgetting that c must be the HYPOTENUSE — it is always the side opposite the right angle, not just any long side','Applying this theorem to non-right triangles (use the Law of Cosines instead for other triangles)','Confusing a²+b²=c² with (a+b)²=c² — these are very different: (a+b)² = a²+2ab+b²','Forgetting to take the square root at the end — c² is not the answer, c is','Using approximate values mid-calculation and losing precision — keep full decimal precision until the final answer'].map((m,i)=>(<div key={i} style={{display:'flex',gap:12,padding:'10px 14px',borderRadius:9,background:'#fee2e210',border:'0.5px solid #ef444420'}}><span style={{fontSize:14,flexShrink:0,color:'#ef4444',fontWeight:700}}>✗</span><span style={{fontSize:12.5,color:'var(--text-2)',lineHeight:1.6}}>{m}</span></div>))}
      </div>
    </Sec>

    {/* Glossary */}
    <Sec title="Key terms explained" sub="Tap to expand">
      {GLOSSARY.map((g,i)=>(<div key={i} style={{borderBottom:'0.5px solid var(--border)'}}><button onClick={()=>setOpenGloss(openGloss===i?null:i)} style={{width:'100%',display:'flex',justifyContent:'space-between',alignItems:'center',padding:'11px 0',background:'none',border:'none',cursor:'pointer',gap:12,textAlign:'left'}}><div style={{display:'flex',gap:10,alignItems:'center'}}><div style={{width:8,height:8,borderRadius:'50%',background:C,flexShrink:0}}/><span style={{fontSize:13,fontWeight:600,color:'var(--text)',fontFamily:"'DM Sans',sans-serif"}}>{g.term}</span></div><span style={{fontSize:16,color:C,flexShrink:0,transform:openGloss===i?'rotate(45deg)':'none',transition:'transform .2s'}}>+</span></button>{openGloss===i&&<p style={{fontSize:12.5,color:'var(--text-2)',lineHeight:1.7,margin:'0 0 12px 18px',fontFamily:"'DM Sans',sans-serif"}}>{g.def}</p>}</div>))}
    </Sec>

    {/* FAQ */}
    <Sec title="Frequently asked questions">
      {FAQ.map((f,i)=>(<Acc key={i} q={f.q} a={f.a} open={openFaq===i} onToggle={()=>setOpenFaq(openFaq===i?null:i)} color={C}/>))}
    </Sec>

  </div>)
}
