import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'

const fmt=n=>(isNaN(n)||!isFinite(n))?'—':parseFloat(Number(n).toFixed(6)).toString()
const π=Math.PI
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v))
const sq=n=>n*n

function Sec({title,sub,children}){return(<div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,overflow:'hidden'}}><div style={{padding:'13px 18px',borderBottom:'0.5px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center'}}><span style={{fontSize:13,fontWeight:700,color:'var(--text)',fontFamily:"'Space Grotesk',sans-serif"}}>{title}</span>{sub&&<span style={{fontSize:11,color:'var(--text-3)'}}>{sub}</span>}</div><div style={{padding:'16px 18px'}}>{children}</div></div>)}
function Acc({q,a,open,onToggle,color}){return(<div style={{borderBottom:'0.5px solid var(--border)'}}><button onClick={onToggle} style={{width:'100%',display:'flex',justifyContent:'space-between',alignItems:'center',padding:'13px 0',background:'none',border:'none',cursor:'pointer',gap:12,textAlign:'left'}}><span style={{fontSize:13,fontWeight:600,color:'var(--text)',fontFamily:"'DM Sans',sans-serif",lineHeight:1.4}}>{q}</span><span style={{fontSize:18,color,flexShrink:0,transform:open?'rotate(45deg)':'none',transition:'transform .2s'}}>+</span></button>{open&&<p style={{fontSize:12.5,color:'var(--text-2)',lineHeight:1.75,margin:'0 0 13px',fontFamily:"'DM Sans',sans-serif"}}>{a}</p>}</div>)}
function StepsCard({steps,color}){const[e,se]=useState(false);if(!steps?.length)return null;const vis=e?steps:steps.slice(0,2);return(<div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,overflow:'hidden'}}><div style={{padding:'12px 18px',borderBottom:'0.5px solid var(--border)',display:'flex',justifyContent:'space-between'}}><span style={{fontSize:13,fontWeight:700,color:'var(--text)',fontFamily:"'Space Grotesk',sans-serif"}}>Step-by-step working</span><span style={{fontSize:11,color:'var(--text-3)'}}>{steps.length} steps</span></div><div style={{padding:'16px 18px',display:'flex',flexDirection:'column',gap:14}}>{vis.map((s,i)=>(<div key={i} style={{display:'flex',gap:14}}><div style={{width:26,height:26,borderRadius:'50%',flexShrink:0,background:i===steps.length-1?color:color+'18',border:`1.5px solid ${color}40`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,color:i===steps.length-1?'#fff':color}}>{i===steps.length-1?'✓':i+1}</div><div style={{flex:1}}>{s.label&&<div style={{fontSize:10,fontWeight:700,color,textTransform:'uppercase',letterSpacing:'.06em',marginBottom:4}}>{s.label}</div>}<div style={{fontSize:13,fontFamily:"'Space Grotesk',sans-serif",background:'var(--bg-raised)',padding:'8px 12px',borderRadius:8,border:`0.5px solid ${i===steps.length-1?color+'40':'var(--border)'}`}}>{s.math}</div>{s.note&&<div style={{fontSize:11.5,color:'var(--text-3)',marginTop:4,fontStyle:'italic'}}>↳ {s.note}</div>}</div></div>))}{steps.length>2&&<button onClick={()=>se(v=>!v)} style={{padding:'9px',borderRadius:9,border:`1px solid ${color}30`,background:color+'08',color,fontSize:12,fontWeight:600,cursor:'pointer'}}>{e?'▲ Hide steps':`▼ Show all ${steps.length} steps`}</button>}</div></div>)}
function Inp({label,value,onChange,color,unit}){const[f,sf]=useState(false);return(<div style={{marginBottom:14}}><label style={{fontSize:12.5,fontWeight:600,color:'var(--text)',fontFamily:"'DM Sans',sans-serif",display:'block',marginBottom:6}}>{label}</label><div style={{display:'flex',height:44,border:`1.5px solid ${f?color:'var(--border-2)'}`,borderRadius:9,overflow:'hidden',background:'var(--bg-card)'}}><input type="number" value={value} onChange={e=>onChange(Math.max(0.001,Number(e.target.value)||0.001))} onFocus={()=>sf(true)} onBlur={()=>sf(false)} style={{flex:1,border:'none',background:'transparent',padding:'0 14px',fontSize:17,fontWeight:700,color:'var(--text)',outline:'none',fontFamily:"'Space Grotesk',sans-serif"}}/>{unit&&<div style={{padding:'0 12px',display:'flex',alignItems:'center',background:'var(--bg-raised)',borderLeft:'1px solid var(--border)',fontSize:13,fontWeight:600,color:'var(--text-3)'}}>{unit}</div>}</div></div>)}

const SHAPES=[
  {id:'cube',     label:'Cube',      icon:'🧊',
   inputs:[{k:'s',label:'Side (s)',def:4}],
   formula:'SA = 6s²', formulaNote:'6 identical square faces',
   sa:v=>6*sq(v.s), vol:v=>v.s**3,
   faces:[{label:'6 square faces (all identical)',area:v=>sq(v.s),count:6}],
   slant:null,
   steps:v=>[
     {label:'Formula',math:'SA = 6 × s²',note:'A cube has exactly 6 square faces, all the same size'},
     {label:'Area of one face',math:`s² = ${v.s}² = ${sq(v.s)}`},
     {label:'Multiply by 6 faces',math:`SA = 6 × ${sq(v.s)} = ${fmt(6*sq(v.s))}`},
   ],
  },
  {id:'cuboid',   label:'Cuboid',    icon:'📦',
   inputs:[{k:'l',label:'Length (l)',def:5},{k:'w',label:'Width (w)',def:3},{k:'h',label:'Height (h)',def:4}],
   formula:'SA = 2(lw + wh + lh)', formulaNote:'Three pairs of rectangles',
   sa:v=>2*(v.l*v.w+v.w*v.h+v.l*v.h), vol:v=>v.l*v.w*v.h,
   faces:[{label:'Top & Bottom',area:v=>v.l*v.w,count:2},{label:'Front & Back',area:v=>v.l*v.h,count:2},{label:'Left & Right',area:v=>v.w*v.h,count:2}],
   steps:v=>[
     {label:'Formula',math:'SA = 2(lw + wh + lh)',note:'A cuboid has 3 pairs of rectangles'},
     {label:'Calculate each pair',math:`lw = ${v.l*v.w},  wh = ${v.w*v.h},  lh = ${v.l*v.h}`},
     {label:'Sum',math:`${v.l*v.w} + ${v.w*v.h} + ${v.l*v.h} = ${v.l*v.w+v.w*v.h+v.l*v.h}`},
     {label:'Multiply by 2',math:`SA = 2 × ${v.l*v.w+v.w*v.h+v.l*v.h} = ${fmt(2*(v.l*v.w+v.w*v.h+v.l*v.h))}`},
   ],
  },
  {id:'sphere',   label:'Sphere',    icon:'⚽',
   inputs:[{k:'r',label:'Radius (r)',def:5}],
   formula:'SA = 4πr²', formulaNote:'Exactly 4 times the area of a great circle',
   sa:v=>4*π*sq(v.r), vol:v=>(4/3)*π*v.r**3,
   faces:null,
   steps:v=>[
     {label:'Formula',math:'SA = 4 × π × r²',note:'Remarkably: sphere SA = 4 × (area of its great circle). Proved by Archimedes.'},
     {label:'r²',math:`r² = ${v.r}² = ${sq(v.r)}`},
     {label:'Calculate',math:`SA = 4 × ${fmt(π)} × ${sq(v.r)} = ${fmt(4*π*sq(v.r))}`},
   ],
  },
  {id:'cylinder', label:'Cylinder',  icon:'🥫',
   inputs:[{k:'r',label:'Radius (r)',def:3},{k:'h',label:'Height (h)',def:8}],
   formula:'SA = 2πr(r + h)', formulaNote:'Two circles + curved rectangle',
   sa:v=>2*π*v.r*(v.r+v.h), vol:v=>π*sq(v.r)*v.h,
   faces:[{label:'Two circular ends',area:v=>π*sq(v.r),count:2},{label:'Curved lateral surface',area:v=>2*π*v.r*v.h,count:1}],
   steps:v=>[
     {label:'Formula',math:'SA = 2πr(r + h)',note:'Two circles + lateral surface (a rectangle when unrolled)'},
     {label:'Two circles',math:`2πr² = 2 × ${fmt(π)} × ${sq(v.r)} = ${fmt(2*π*sq(v.r))}`},
     {label:'Curved surface',math:`2πrh = 2 × ${fmt(π)} × ${v.r} × ${v.h} = ${fmt(2*π*v.r*v.h)}`},
     {label:'Total',math:`SA = ${fmt(2*π*sq(v.r))} + ${fmt(2*π*v.r*v.h)} = ${fmt(2*π*v.r*(v.r+v.h))}`},
   ],
  },
  {id:'cone',     label:'Cone',      icon:'🍦',
   inputs:[{k:'r',label:'Radius (r)',def:3},{k:'h',label:'Height (h)',def:8}],
   formula:'SA = πr(r + l)', formulaNote:'l = slant height = √(r² + h²)',
   sa:v=>π*v.r*(v.r+Math.sqrt(sq(v.r)+sq(v.h))), vol:v=>(1/3)*π*sq(v.r)*v.h,
   faces:[{label:'Base circle',area:v=>π*sq(v.r),count:1},{label:'Lateral (curved) surface',area:v=>π*v.r*Math.sqrt(sq(v.r)+sq(v.h)),count:1}],
   slant:v=>Math.sqrt(sq(v.r)+sq(v.h)),
   steps:v=>{const l=Math.sqrt(sq(v.r)+sq(v.h));return[
     {label:'Find slant height',math:`l = √(r² + h²) = √(${sq(v.r)}+${sq(v.h)}) = ${fmt(l)}`,note:'The slant height is the distance from apex to base edge along the surface'},
     {label:'Formula',math:'SA = πr(r + l)'},
     {label:'Calculate',math:`SA = ${fmt(π)} × ${v.r} × (${v.r} + ${fmt(l)}) = ${fmt(π*v.r*(v.r+l))}`},
   ]},
  },
  {id:'pyramid',  label:'Sq. Pyramid',icon:'🔺',
   inputs:[{k:'b',label:'Base side (b)',def:4},{k:'h',label:'Height (h)',def:6}],
   formula:'SA = b² + 2bl', formulaNote:'l = slant height = √(h² + (b/2)²)',
   sa:v=>{const l=Math.sqrt(sq(v.h)+sq(v.b/2));return sq(v.b)+2*v.b*l},
   vol:v=>(1/3)*sq(v.b)*v.h,
   faces:[{label:'Square base',area:v=>sq(v.b),count:1},{label:'4 triangular faces',area:v=>0.5*v.b*Math.sqrt(sq(v.h)+sq(v.b/2)),count:4}],
   steps:v=>{const l=Math.sqrt(sq(v.h)+sq(v.b/2));return[
     {label:'Slant height',math:`l = √(h² + (b/2)²) = √(${sq(v.h)}+${sq(v.b/2)}) = ${fmt(l)}`},
     {label:'Base area',math:`b² = ${sq(v.b)}`},
     {label:'4 triangular faces',math:`4 × (½ × b × l) = 2 × ${v.b} × ${fmt(l)} = ${fmt(2*v.b*l)}`},
     {label:'Total SA',math:`SA = ${sq(v.b)} + ${fmt(2*v.b*l)} = ${fmt(sq(v.b)+2*v.b*l)}`},
   ]},
  },
]

const FORMULA_TABLE=[
  {shape:'Cube',        formula:'6s²',               note:'6 equal square faces'},
  {shape:'Cuboid',      formula:'2(lw+wh+lh)',       note:'3 pairs of rectangles'},
  {shape:'Sphere',      formula:'4πr²',              note:'Archimedes proved this in 212 BC'},
  {shape:'Cylinder',    formula:'2πr(r+h)',          note:'2 discs + rolled rectangle'},
  {shape:'Cone',        formula:'πr(r+l)',           note:'l = √(r²+h²) = slant height'},
  {shape:'Sq. Pyramid', formula:'b²+2bl',            note:'l = √(h²+(b/2)²)'},
  {shape:'Hemisphere',  formula:'3πr²',              note:'curved half + flat circle'},
  {shape:'Open cylinder', formula:'2πrh',            note:'just the curved lateral side'},
]

const FAQ=[
  {q:'What is the difference between total and lateral surface area?',a:"Total surface area (TSA) includes all faces — the top, bottom, and sides. Lateral surface area (LSA or curved SA) is just the sides, excluding any flat ends. For a cylinder: LSA = 2πrh (just the curved tube), TSA = 2πr(r+h) (tube + both discs). In real applications, a tin can manufacturer needs TSA; someone painting just the walls of a room needs lateral SA."},
  {q:'Why does a sphere have SA = 4πr²?',a:"Archimedes proved that the surface area of a sphere equals exactly 4 times the area of its great circle (πr²). He showed this by proving the sphere's surface area equals the lateral surface of the circumscribed cylinder (a cylinder with the same radius and height 2r), which is 2πr(2r) = 4πr². He was so proud of this result he asked for a sphere-in-cylinder diagram on his tombstone."},
  {q:'Why does surface area matter in chemistry?',a:'Chemical reactions occur at surfaces. A higher surface area means more reaction sites per unit mass. Catalysts are made as fine powders or porous materials to maximise SA. A 1cm cube has SA = 6cm². Cut it into 1000 tiny cubes (0.1cm each) → total SA = 60cm² — 10× more surface area from the same material. This is why powdered reactants react faster than lumps.'},
  {q:'What is the SA:V ratio and why does it matter?',a:"The surface-area-to-volume ratio (SA/V) decreases as objects get larger. For a sphere: SA/V = 3/r. Small objects (cells, insects) have high SA/V — great for heat loss and nutrient exchange. Large animals (elephants) have low SA/V — they struggle to stay cool. This is why elephants have large ears (increases SA) and small animals need to eat constantly (high metabolic rate to compensate for heat loss)."},
]

export default function SurfaceAreaCalculator({meta,category}){
  const C=category?.color||'#3b82f6'
  const[shId,setShId]=useState('cuboid')
  const[vals,setVals]=useState({s:4,l:5,w:3,h:4,r:5,b:4})
  const[costPerM2,setCost]=useState(150)
  const[openFaq,setFaq]=useState(null)
  const[openGloss,setGl]=useState(null)

  const sh=SHAPES.find(s=>s.id===shId)||SHAPES[0]
  const sa=sh.sa(vals), vol=sh.vol?sh.vol(vals):null
  const sav=vol>0?sa/vol:null
  const steps=sh.steps(vals)
  const slant=sh.slant?sh.slant(vals):null

  return(<div style={{display:'flex',flexDirection:'column',gap:20}}>

    {/* FORMULA BANNER */}
    <div style={{background:`linear-gradient(135deg,${C}12,${C}06)`,border:`1px solid ${C}30`,borderRadius:14,padding:'16px 20px',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12}}>
      <div>
        <div style={{fontSize:10,fontWeight:700,color:C,textTransform:'uppercase',letterSpacing:'.08em',marginBottom:6}}>{sh.label} — Surface Area</div>
        <div style={{fontSize:22,fontWeight:700,color:C,fontFamily:"'Space Grotesk',sans-serif"}}>{sh.formula}</div>
        <div style={{fontSize:11,color:'var(--text-3)',marginTop:4}}>{sh.formulaNote}</div>
      </div>
      <div style={{padding:'10px 20px',background:C+'18',borderRadius:12,textAlign:'center'}}>
        <div style={{fontSize:11,color:'var(--text-3)',marginBottom:2}}>Surface Area</div>
        <div style={{fontSize:30,fontWeight:700,color:C,fontFamily:"'Space Grotesk',sans-serif"}}>{fmt(sa)}</div>
        <div style={{fontSize:11,color:'var(--text-3)'}}>sq units</div>
      </div>
    </div>

    {/* SHAPE SELECTOR */}
    <div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,padding:'14px 18px'}}>
      <div style={{fontSize:12,fontWeight:600,color:'var(--text-2)',marginBottom:12}}>Select shape</div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
        {SHAPES.map(s=>(
          <button key={s.id} onClick={()=>setShId(s.id)} style={{padding:'10px 6px',borderRadius:10,border:`1.5px solid ${shId===s.id?C:'var(--border-2)'}`,background:shId===s.id?C+'12':'var(--bg-raised)',cursor:'pointer',textAlign:'center'}}>
            <div style={{fontSize:20,marginBottom:2}}>{s.icon}</div>
            <div style={{fontSize:10,fontWeight:shId===s.id?700:500,color:shId===s.id?C:'var(--text-2)',lineHeight:1.2}}>{s.label}</div>
          </button>
        ))}
      </div>
    </div>

    <CalcShell
      left={<>
        <div style={{fontSize:12,fontWeight:600,color:'var(--text-2)',marginBottom:12}}>Dimensions</div>
        {sh.inputs.map(inp=>(<Inp key={inp.k} label={inp.label} value={vals[inp.k]||inp.def} onChange={v=>setVals(p=>({...p,[inp.k]:v}))} color={C}/>))}
        {slant&&<div style={{padding:'8px 12px',background:'var(--bg-raised)',borderRadius:8,marginBottom:14,border:'0.5px solid var(--border)'}}>
          <div style={{fontSize:11,color:'var(--text-3)',marginBottom:2}}>Slant height (l)</div>
          <div style={{fontSize:16,fontWeight:700,color:C,fontFamily:"'Space Grotesk',sans-serif"}}>{fmt(slant)}</div>
        </div>}

        {/* face breakdown */}
        {sh.faces&&<div style={{background:'var(--bg-raised)',borderRadius:11,padding:'12px 14px',border:'0.5px solid var(--border)',marginBottom:14}}>
          <div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',marginBottom:10,textTransform:'uppercase',letterSpacing:'.06em'}}>Face breakdown</div>
          {sh.faces.map((f,i)=>{
            const faceArea=f.area(vals)
            return(<div key={i} style={{display:'flex',justifyContent:'space-between',padding:'6px 0',borderBottom:'0.5px solid var(--border)'}}>
              <span style={{fontSize:12,color:'var(--text-2)'}}>{f.label}</span>
              <span style={{fontSize:12,fontWeight:700,color:C,fontFamily:"'Space Grotesk',sans-serif"}}>{f.count} × {fmt(Math.round(faceArea*100)/100)} = {fmt(Math.round(f.count*faceArea*100)/100)}</span>
            </div>)
          })}
          <div style={{display:'flex',justifyContent:'space-between',padding:'6px 0',marginTop:4}}>
            <span style={{fontSize:12,fontWeight:700,color:'var(--text)'}}>Total SA</span>
            <span style={{fontSize:13,fontWeight:700,color:C,fontFamily:"'Space Grotesk',sans-serif"}}>{fmt(sa)}</span>
          </div>
        </div>}

        {/* paint cost estimator */}
        <div style={{borderTop:'0.5px solid var(--border)',paddingTop:14,marginTop:4,marginBottom:14}}>
          <div style={{fontSize:12,fontWeight:700,color:'var(--text)',marginBottom:10}}>🎨 Paint / wrap cost estimator</div>
          <Inp label="Cost per m²" value={costPerM2} onChange={setCost} color={C} unit="₹"/>
          <div style={{padding:'10px 13px',background:C+'08',borderRadius:9,border:`1px solid ${C}20`}}>
            <div style={{fontSize:10,color:'var(--text-3)',marginBottom:2}}>Total cost (if units = cm → convert SA to m²)</div>
            <div style={{fontSize:18,fontWeight:700,color:C,fontFamily:"'Space Grotesk',sans-serif"}}>₹{fmt(Math.round(sa/10000*costPerM2*100)/100)}</div>
            <div style={{fontSize:10,color:'var(--text-3)',marginTop:2}}>{fmt(sa)} cm² ÷ 10,000 = {fmt(Math.round(sa/10000*100)/100)} m²</div>
          </div>
        </div>

        {/* examples */}
        <div style={{borderTop:'0.5px solid var(--border)',paddingTop:14}}>
          <div style={{fontSize:10,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:10}}>🎯 Real objects</div>
          {[
            {s:'cuboid',v:{l:30,w:25,h:20},l:'📦 Shoebox 30×25×20cm'},
            {s:'cylinder',v:{r:3.3,h:12.2},l:'🥫 Can label (r=3.3,h=12.2cm)'},
            {s:'sphere',v:{r:11},l:'⚽ Football (r=11cm)'},
            {s:'cube',v:{s:10},l:'🧊 Ice cube 10cm'},
          ].map((ex,i)=>(
            <button key={i} onClick={()=>{setShId(ex.s);setVals(p=>({...p,...ex.v}))}} style={{display:'block',width:'100%',padding:'8px 12px',borderRadius:8,border:'1px solid var(--border-2)',background:'var(--bg-raised)',cursor:'pointer',textAlign:'left',marginBottom:6,fontSize:12,color:'var(--text)',fontFamily:"'DM Sans',sans-serif"}}
              onMouseEnter={e=>e.currentTarget.style.borderColor=C+'60'} onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border-2)'}>{ex.l}</button>
          ))}
        </div>
      </>}

      right={<>
        {/* result */}
        <div style={{background:'var(--bg-card)',border:`1.5px solid ${C}30`,borderRadius:14,padding:'18px 20px',marginBottom:14}}>
          <div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:8}}>Total Surface Area</div>
          <div style={{fontSize:48,fontWeight:700,color:C,fontFamily:"'Space Grotesk',sans-serif",lineHeight:1}}>{fmt(sa)}</div>
          <div style={{fontSize:13,color:'var(--text-3)',marginTop:4,marginBottom:12}}>square units</div>
          {vol!=null&&<div style={{fontSize:13,color:'var(--text-2)',marginBottom:8}}>Volume: <strong style={{color:'#10b981'}}>{fmt(vol)} cubic units</strong></div>}
          {sav!=null&&<div style={{fontSize:13,color:'var(--text-2)',marginBottom:12}}>SA:V ratio: <strong style={{color:'#f59e0b'}}>{fmt(Math.round(sav*1000)/1000)}</strong></div>}
          <div style={{padding:'10px 13px',background:C+'08',borderRadius:9,border:`1px solid ${C}20`,fontSize:12,color:'var(--text-2)',lineHeight:1.65}}>
            💡 To wrap, paint, or plate this {sh.label} you need at least {fmt(sa)} sq units of material. At ₹{costPerM2}/m², the cost (if units=cm) is ₹{fmt(Math.round(sa/10000*costPerM2*100)/100)}.
          </div>
        </div>

        {/* cube net visual — only for cube */}
        {shId==='cube'&&<div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,padding:'14px 18px',marginBottom:14}}>
          <div style={{fontSize:12,fontWeight:700,color:'var(--text)',marginBottom:8}}>Cube net (unfolded)</div>
          <p style={{fontSize:11,color:'var(--text-3)',marginBottom:10,lineHeight:1.5}}>When you unfold a cube you get a cross-shaped net of 6 squares. The total area = 6s² = SA.</p>
          {(()=>{const s=vals.s,W=200,H=160;const u=Math.min(30,(W-10)/(4),(H-10)/3);const cx=W/2-u,cy=H/2-u;const faces=[[cx,cy-u],[cx-u,cy],[cx,cy],[cx+u,cy],[cx,cy+u],[cx+2*u,cy]];const faceColors=[C+'40',C+'30',C+'25',C+'30',C+'20',C+'15'];return(<svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{display:'block'}}>{faces.map((f,i)=>(<rect key={i} x={f[0]} y={f[1]} width={u} height={u} fill={faceColors[i]} stroke={C} strokeWidth="1.5"/>))}<text x={W/2} y={H-8} textAnchor="middle" fontSize="10" fill={C}>6 × {fmt(u/u*Math.round(vals.s**2*100)/100)} = {fmt(6*sq(vals.s))} total</text></svg>)})()}
        </div>}

        {/* SA vs Volume comparison */}
        {vol!=null&&<div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,padding:'14px 18px',marginBottom:14}}>
          <div style={{fontSize:12,fontWeight:700,color:'var(--text)',marginBottom:12}}>SA vs Volume</div>
          {[{label:'Surface Area',val:sa,unit:'sq units',color:C},{label:'Volume',val:vol,unit:'cubic units',color:'#10b981'}].map((s,i)=>(
            <div key={i} style={{marginBottom:10}}>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:12,marginBottom:4}}>
                <span style={{color:'var(--text-2)'}}>{s.label}</span>
                <span style={{fontWeight:700,color:s.color,fontFamily:"'Space Grotesk',sans-serif"}}>{fmt(Math.round(s.val*100)/100)} {s.unit}</span>
              </div>
              <div style={{height:8,background:'var(--border)',borderRadius:4,overflow:'hidden'}}>
                <div style={{height:'100%',width:`${clamp((s.val/Math.max(sa,vol))*100,2,100)}%`,background:s.color,borderRadius:4,transition:'width .5s'}}/>
              </div>
            </div>
          ))}
          {sav!=null&&<div style={{fontSize:12,color:'var(--text-3)',marginTop:8}}>SA:V ratio = {fmt(Math.round(sav*1000)/1000)} — {sav>1?'relatively high (good for heat exchange)':'relatively low (efficient for storage)'}</div>}
        </div>}

        <BreakdownTable title="Summary" rows={[
          {label:'Surface Area',value:`${fmt(sa)} sq units`,bold:true,highlight:true,color:C},
          ...(vol!=null?[{label:'Volume',value:`${fmt(vol)} cubic units`}]:[]),
          ...(sav!=null?[{label:'SA:V ratio',value:fmt(Math.round(sav*1000)/1000)}]:[]),
          {label:'Shape',value:sh.label},
          {label:'Formula',value:sh.formula},
        ]}/>
        <AIHintCard hint={`${sh.label} SA = ${fmt(sa)}`}/>
      </>}
    />

    <StepsCard steps={steps} color={C}/>

    {/* SA:V RATIO EXPLORER */}
    <Sec title="Surface-area-to-volume ratio — why it matters" sub="SA:V explorer">
      <p style={{fontSize:12,color:'var(--text-2)',lineHeight:1.7,marginBottom:14,fontFamily:"'DM Sans',sans-serif"}}>
        The SA:V ratio is one of biology's most important constraints. For a sphere (SA=4πr², V=(4/3)πr³), SA/V = 3/r. As an object gets larger, its volume grows faster than its surface area.
      </p>
      <div style={{overflowX:'auto'}}>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead>
            <tr>{['Sphere radius','SA (4πr²)','Volume ((4/3)πr³)','SA:V ratio','Example'].map(h=>(
              <th key={h} style={{fontSize:10,fontWeight:700,color:'var(--text-3)',textAlign:'left',padding:'7px 10px',borderBottom:'1px solid var(--border)',background:'var(--bg-raised)'}}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {[{r:0.001,ex:'Bacterium (1μm)'},{r:0.01,ex:'Human cell'},{r:1,ex:'Marble (cm)'},{r:5,ex:'Tennis ball'},{r:100,ex:'Person (approx)'},{r:6371000,ex:'Earth (m)'}].map((row,i)=>{
              const s=4*π*row.r**2,v=(4/3)*π*row.r**3,ratio=s/v
              return(<tr key={i} onMouseEnter={e=>e.currentTarget.style.background=C+'08'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                <td style={{padding:'7px 10px',fontSize:12,fontWeight:600,color:C,borderBottom:'0.5px solid var(--border)',fontFamily:"'Space Grotesk',sans-serif"}}>{row.r}</td>
                <td style={{padding:'7px 10px',fontSize:11,color:'var(--text-2)',borderBottom:'0.5px solid var(--border)'}}>{fmt(Math.round(s*1000)/1000)}</td>
                <td style={{padding:'7px 10px',fontSize:11,color:'var(--text-2)',borderBottom:'0.5px solid var(--border)'}}>{fmt(Math.round(v*1000)/1000)}</td>
                <td style={{padding:'7px 10px',fontSize:12,fontWeight:700,color:'#10b981',borderBottom:'0.5px solid var(--border)',fontFamily:"'Space Grotesk',sans-serif"}}>{fmt(Math.round(ratio*1000)/1000)}</td>
                <td style={{padding:'7px 10px',fontSize:11,color:'var(--text-3)',borderBottom:'0.5px solid var(--border)'}}>{row.ex}</td>
              </tr>)
            })}
          </tbody>
        </table>
      </div>
      <div style={{marginTop:12,padding:'10px 14px',background:'#10b98108',borderRadius:9,border:'1px solid #10b98125',fontSize:12,color:'var(--text-2)',lineHeight:1.65}}>
        💡 A bacterium has SA/V ≈ 3,000 — excellent for nutrient absorption. A human has SA/V ≈ 0.03 — much lower, which is why we need a circulatory system to deliver nutrients internally. Earth's SA/V is negligible — it retains internal heat for billions of years.
      </div>
    </Sec>

    {/* ALL FORMULAS */}
    <Sec title="Surface area formulas — complete reference">
      <table style={{width:'100%',borderCollapse:'collapse'}}>
        <thead><tr>{['Shape','Formula','Note'].map(h=>(<th key={h} style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textAlign:'left',padding:'8px 10px',borderBottom:'1px solid var(--border)',background:'var(--bg-raised)'}}>{h}</th>))}</tr></thead>
        <tbody>
          {FORMULA_TABLE.map((r,i)=>(<tr key={i} onMouseEnter={e=>e.currentTarget.style.background=C+'08'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}><td style={{padding:'8px 10px',fontSize:13,fontWeight:600,color:'var(--text)',borderBottom:'0.5px solid var(--border)'}}>{r.shape}</td><td style={{padding:'8px 10px',fontSize:13,fontWeight:700,color:C,fontFamily:"'Space Grotesk',sans-serif",borderBottom:'0.5px solid var(--border)'}}>{r.formula}</td><td style={{padding:'8px 10px',fontSize:11,color:'var(--text-3)',borderBottom:'0.5px solid var(--border)'}}>{r.note}</td></tr>))}
        </tbody>
      </table>
    </Sec>

    {/* REAL WORLD */}
    <Sec title="Where surface area matters in real life">
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
        {[
          {icon:'🎁',field:'Packaging Design',desc:'Manufacturers minimise packaging material (SA) while maximising product volume. A sphere has the lowest SA per unit volume — but is impractical for stacking.',example:'Box: minimise SA for given volume',color:C},
          {icon:'🔥',field:'Heat Transfer',desc:'Heating and cooling depend on surface area. Radiators, CPU heatsinks, and car engines all maximise SA to transfer heat faster.',example:'Heatsink: high SA = faster cooling',color:'#ef4444'},
          {icon:'🏠',field:'Insulation & Paint',desc:'Painting a house requires the total exterior surface area. Buying too little stops work; too much wastes money. Insulation coverage is also sold per m².',example:'House exterior: calculate SA exactly',color:'#f59e0b'},
          {icon:'🧪',field:'Chemistry — Catalysts',desc:'Catalysts are finely powdered to maximise surface area. Platinum catalytic converters have the same mass but 1000× more SA as powder vs solid chunk.',example:'Powder vs chunk: same mass, 1000× SA',color:'#8b5cf6'},
          {icon:'🫁',field:'Lungs — Gas Exchange',desc:"Human lungs have ~70m² of alveolar surface — about the size of a tennis court — folded into a ~5 litre volume. High SA enables efficient oxygen/CO₂ exchange.",example:'Lung SA: ~70m² in 5 litres',color:'#3b82f6'},
          {icon:'🦎',field:'Biology — Thermoregulation',desc:'Elephants lose heat through their large ears (increasing effective SA). Arctic foxes have small ears to reduce SA and conserve heat.',example:'Elephant ears: SA ↑ = heat loss ↑',color:'#10b981'},
        ].map((rw,i)=>(
          <div key={i} style={{padding:'12px 13px',borderRadius:11,background:rw.color+'08',border:`1px solid ${rw.color}25`}}>
            <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:7}}><span style={{fontSize:18}}>{rw.icon}</span><span style={{fontSize:12,fontWeight:700,color:rw.color}}>{rw.field}</span></div>
            <p style={{fontSize:11.5,color:'var(--text-2)',lineHeight:1.65,margin:'0 0 7px',fontFamily:"'DM Sans',sans-serif"}}>{rw.desc}</p>
            <div style={{fontSize:10,fontWeight:600,color:rw.color,padding:'3px 8px',background:rw.color+'15',borderRadius:6,display:'inline-block'}}>{rw.example}</div>
          </div>
        ))}
      </div>
    </Sec>

    {/* MISTAKES */}
    <Sec title="⚠️ Common mistakes to avoid">
      <div style={{display:'flex',flexDirection:'column',gap:8}}>
        {[
          'Using vertical height instead of slant height in cone and pyramid lateral area formulas',
          'Including or excluding ends incorrectly — know whether you need total SA or just lateral SA',
          'Confusing SA (square units) with volume (cubic units) in formulas',
          'Forgetting that sphere SA = 4πr², not 2πr² (hemisphere) or πr² (just one circle)',
        ].map((m,i)=>(
          <div key={i} style={{display:'flex',gap:12,padding:'10px 14px',borderRadius:9,background:'#fee2e210',border:'0.5px solid #ef444420'}}>
            <span style={{fontSize:14,flexShrink:0,color:'#ef4444',fontWeight:700}}>✗</span>
            <span style={{fontSize:12.5,color:'var(--text-2)',lineHeight:1.6}}>{m}</span>
          </div>
        ))}
      </div>
    </Sec>

    {/* GLOSSARY */}
    <Sec title="Key terms" sub="Tap to expand">
      {[
        {term:'Total Surface Area (TSA)',def:'The sum of all face areas of a 3D solid, including base(s) and top(s). What you need to paint, wrap, or coat an object completely.'},
        {term:'Lateral Surface Area (LSA)',def:'The area of only the curved or side surfaces, excluding the flat bases. For a cylinder: LSA = 2πrh. Useful for labelling a can or painting just the walls of a room.'},
        {term:'Slant height',def:'The height of a triangular face of a pyramid, or the diagonal height of a cone from apex to base edge. Always longer than the vertical height. Calculated as √(h² + (b/2)²) for a pyramid.'},
        {term:'SA:V ratio',def:'Surface area divided by volume. Determines how efficiently an object can exchange matter or energy with its environment through its surface.'},
        {term:'Net (of a solid)',def:'A 2D flat shape that can be folded to form a 3D solid. A cube has 11 distinct nets. The area of the net equals the total surface area of the solid.'},
      ].map((g,i)=>(
        <div key={i} style={{borderBottom:'0.5px solid var(--border)'}}>
          <button onClick={()=>setGl(openGloss===i?null:i)} style={{width:'100%',display:'flex',justifyContent:'space-between',alignItems:'center',padding:'11px 0',background:'none',border:'none',cursor:'pointer',gap:12,textAlign:'left'}}>
            <div style={{display:'flex',gap:10,alignItems:'center'}}><div style={{width:8,height:8,borderRadius:'50%',background:C,flexShrink:0}}/><span style={{fontSize:13,fontWeight:600,color:'var(--text)',fontFamily:"'DM Sans',sans-serif"}}>{g.term}</span></div>
            <span style={{fontSize:16,color:C,flexShrink:0,transform:openGloss===i?'rotate(45deg)':'none',transition:'transform .2s'}}>+</span>
          </button>
          {openGloss===i&&<p style={{fontSize:12.5,color:'var(--text-2)',lineHeight:1.7,margin:'0 0 12px 18px',fontFamily:"'DM Sans',sans-serif"}}>{g.def}</p>}
        </div>
      ))}
    </Sec>

    <Sec title="Frequently asked questions">
      {FAQ.map((f,i)=>(<Acc key={i} q={f.q} a={f.a} open={openFaq===i} onToggle={()=>setFaq(openFaq===i?null:i)} color={C}/>))}
    </Sec>

  </div>)
}
