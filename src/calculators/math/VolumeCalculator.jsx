import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'

const fmt   = n => (isNaN(n)||!isFinite(n)) ? '—' : parseFloat(Number(n).toFixed(6)).toString()
const π     = Math.PI
const clamp = (v,a,b) => Math.min(b,Math.max(a,v))

function Sec({title,sub,children}){return(<div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,overflow:'hidden'}}><div style={{padding:'13px 18px',borderBottom:'0.5px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center'}}><span style={{fontSize:13,fontWeight:700,color:'var(--text)',fontFamily:"'Space Grotesk',sans-serif"}}>{title}</span>{sub&&<span style={{fontSize:11,color:'var(--text-3)'}}>{sub}</span>}</div><div style={{padding:'16px 18px'}}>{children}</div></div>)}
function Acc({q,a,open,onToggle,color}){return(<div style={{borderBottom:'0.5px solid var(--border)'}}><button onClick={onToggle} style={{width:'100%',display:'flex',justifyContent:'space-between',alignItems:'center',padding:'13px 0',background:'none',border:'none',cursor:'pointer',gap:12,textAlign:'left'}}><span style={{fontSize:13,fontWeight:600,color:'var(--text)',fontFamily:"'DM Sans',sans-serif",lineHeight:1.4}}>{q}</span><span style={{fontSize:18,color,flexShrink:0,transform:open?'rotate(45deg)':'none',transition:'transform .2s'}}>+</span></button>{open&&<p style={{fontSize:12.5,color:'var(--text-2)',lineHeight:1.75,margin:'0 0 13px',fontFamily:"'DM Sans',sans-serif"}}>{a}</p>}</div>)}
function StepsCard({steps,color}){const[e,se]=useState(false);if(!steps?.length)return null;const vis=e?steps:steps.slice(0,2);return(<div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,overflow:'hidden'}}><div style={{padding:'12px 18px',borderBottom:'0.5px solid var(--border)',display:'flex',justifyContent:'space-between'}}><span style={{fontSize:13,fontWeight:700,color:'var(--text)',fontFamily:"'Space Grotesk',sans-serif"}}>Step-by-step working</span><span style={{fontSize:11,color:'var(--text-3)'}}>{steps.length} steps</span></div><div style={{padding:'16px 18px',display:'flex',flexDirection:'column',gap:14}}>{vis.map((s,i)=>(<div key={i} style={{display:'flex',gap:14}}><div style={{width:26,height:26,borderRadius:'50%',flexShrink:0,background:i===steps.length-1?color:color+'18',border:`1.5px solid ${color}40`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,color:i===steps.length-1?'#fff':color}}>{i===steps.length-1?'✓':i+1}</div><div style={{flex:1}}>{s.label&&<div style={{fontSize:10,fontWeight:700,color,textTransform:'uppercase',letterSpacing:'.06em',marginBottom:4}}>{s.label}</div>}<div style={{fontSize:13,fontFamily:"'Space Grotesk',sans-serif",background:'var(--bg-raised)',padding:'8px 12px',borderRadius:8,border:`0.5px solid ${i===steps.length-1?color+'40':'var(--border)'}`}}>{s.math}</div>{s.note&&<div style={{fontSize:11.5,color:'var(--text-3)',marginTop:4,fontStyle:'italic'}}>↳ {s.note}</div>}</div></div>))}{steps.length>2&&<button onClick={()=>se(v=>!v)} style={{padding:'9px',borderRadius:9,border:`1px solid ${color}30`,background:color+'08',color,fontSize:12,fontWeight:600,cursor:'pointer'}}>{e?'▲ Hide steps':`▼ Show all ${steps.length} steps`}</button>}</div></div>)}
function Inp({label,value,onChange,color,unit,hint}){const[f,sf]=useState(false);return(<div style={{marginBottom:14}}><div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}><label style={{fontSize:12.5,fontWeight:600,color:'var(--text)',fontFamily:"'DM Sans',sans-serif"}}>{label}</label>{hint&&<span style={{fontSize:10,color:'var(--text-3)'}}>{hint}</span>}</div><div style={{display:'flex',height:44,border:`1.5px solid ${f?color:'var(--border-2)'}`,borderRadius:9,overflow:'hidden',background:'var(--bg-card)'}}><input type="number" value={value} onChange={e=>onChange(Math.max(0.001,Number(e.target.value)||0.001))} onFocus={()=>sf(true)} onBlur={()=>sf(false)} style={{flex:1,border:'none',background:'transparent',padding:'0 14px',fontSize:17,fontWeight:700,color:'var(--text)',outline:'none',fontFamily:"'Space Grotesk',sans-serif"}}/>{unit&&<div style={{padding:'0 12px',display:'flex',alignItems:'center',background:'var(--bg-raised)',borderLeft:'1px solid var(--border)',fontSize:13,fontWeight:600,color:'var(--text-3)'}}>{unit}</div>}</div></div>)}

const SHAPES=[
  {id:'cube',     label:'Cube',          icon:'🧊',
   inputs:[{k:'s',label:'Side length (s)',def:4}],
   formula:'V = s³', formulaNote:'All 6 faces are identical squares',
   vol:v=>v.s**3, sa:v=>6*v.s**2,
   steps:v=>[
     {label:'Formula',math:'V = s³ = s × s × s',note:'A cube has equal length, width, and height'},
     {label:'Cube the side',math:`V = ${v.s}³ = ${v.s} × ${v.s} × ${v.s}`},
     {label:'Result',math:`V = ${fmt(v.s**3)} cubic units`},
   ],
   svg:(v,C)=>{const W=200,H=160,d=18,sc=Math.min(70/v.s,15);const side=clamp(v.s*sc,20,75);const x0=40,y0=H-30,x1=x0+side,y1=y0-side;return(<svg viewBox={`0 0 ${W} ${H}`} width="100%"><polygon points={`${x0},${y0} ${x1},${y0} ${x1+d},${y0-d} ${x0+d},${y0-d}`} fill={C+'25'} stroke={C} strokeWidth="1.5"/><polygon points={`${x0},${y1} ${x1},${y1} ${x1},${y0} ${x0},${y0}`} fill={C+'18'} stroke={C} strokeWidth="1.5"/><polygon points={`${x1},${y1} ${x1+d},${y1-d} ${x1+d},${y0-d} ${x1},${y0}`} fill={C+'30'} stroke={C} strokeWidth="1.5"/><polygon points={`${x0},${y1} ${x1},${y1} ${x1+d},${y1-d} ${x0+d},${y1-d}`} fill={C+'12'} stroke={C} strokeWidth="1.5"/><line x1={x0} y1={y0} x2={x0} y2={y1} stroke={C} strokeWidth="1.5"/><text x={x0+side/2} y={y0+14} textAnchor="middle" fontSize="10" fill={C} fontWeight="700">s={v.s}</text><text x={W-20} y={H/2} textAnchor="end" fontSize="11" fill={C} fontWeight="700">V={fmt(v.s**3)}</text></svg>)},
  },
  {id:'cuboid',   label:'Cuboid',        icon:'📦',
   inputs:[{k:'l',label:'Length',def:5},{k:'w',label:'Width',def:3},{k:'h',label:'Height',def:4}],
   formula:'V = l × w × h', formulaNote:'Length times width times height',
   vol:v=>v.l*v.w*v.h, sa:v=>2*(v.l*v.w+v.w*v.h+v.l*v.h),
   steps:v=>[
     {label:'Formula',math:'V = l × w × h'},
     {label:'Substitute',math:`V = ${v.l} × ${v.w} × ${v.h}`},
     {label:'Multiply l × w',math:`${v.l} × ${v.w} = ${v.l*v.w}`},
     {label:'Multiply by h',math:`${v.l*v.w} × ${v.h} = ${fmt(v.l*v.w*v.h)} cubic units`},
   ],
   svg:(v,C)=>{const W=200,H=160,d=14;const sc=Math.min((W-60)/v.l,(H-50)/v.h,50/v.w);const lw=v.l*sc,hh=v.h*sc;const x0=30,y0=H-30;return(<svg viewBox={`0 0 ${W} ${H}`} width="100%"><polygon points={`${x0},${y0} ${x0+lw},${y0} ${x0+lw+d},${y0-d} ${x0+d},${y0-d}`} fill={C+'25'} stroke={C} strokeWidth="1.5"/><polygon points={`${x0},${y0-hh} ${x0+lw},${y0-hh} ${x0+lw},${y0} ${x0},${y0}`} fill={C+'18'} stroke={C} strokeWidth="1.5"/><polygon points={`${x0+lw},${y0-hh} ${x0+lw+d},${y0-hh-d} ${x0+lw+d},${y0-d} ${x0+lw},${y0}`} fill={C+'30'} stroke={C} strokeWidth="1.5"/><line x1={x0} y1={y0} x2={x0} y2={y0-hh} stroke={C} strokeWidth="1.5"/><text x={x0+lw/2} y={y0+14} textAnchor="middle" fontSize="9" fill={C} fontWeight="700">l={v.l}</text><text x={x0-8} y={y0-hh/2} textAnchor="end" dominantBaseline="middle" fontSize="9" fill={C} fontWeight="700">h={v.h}</text><text x={x0+lw+d+6} y={y0-hh/2} fontSize="9" fill={C} fontWeight="700">w={v.w}</text><text x={W-10} y={H/2} textAnchor="end" fontSize="11" fill={C} fontWeight="700">V={fmt(v.l*v.w*v.h)}</text></svg>)},
  },
  {id:'sphere',   label:'Sphere',        icon:'⚽',
   inputs:[{k:'r',label:'Radius (r)',def:5}],
   formula:'V = (4/3)πr³', formulaNote:'Four-thirds times pi times radius cubed',
   vol:v=>(4/3)*π*v.r**3, sa:v=>4*π*v.r**2,
   steps:v=>[
     {label:'Formula',math:'V = (4/3) × π × r³',note:'π ≈ 3.14159265...'},
     {label:'Cube radius',math:`r³ = ${v.r}³ = ${v.r**3}`},
     {label:'Multiply by π',math:`π × ${v.r**3} = ${fmt(π*v.r**3)}`},
     {label:'Multiply by 4/3',math:`V = (4/3) × ${fmt(π*v.r**3)} = ${fmt((4/3)*π*v.r**3)} cubic units`},
   ],
   svg:(v,C)=>{const W=200,H=160,r=Math.min(60,v.r*8),cx=W/2,cy=H/2;return(<svg viewBox={`0 0 ${W} ${H}`} width="100%"><circle cx={cx} cy={cy} r={r} fill={C+'20'} stroke={C} strokeWidth="2"/><ellipse cx={cx} cy={cy} rx={r} ry={r*0.28} fill="none" stroke={C} strokeWidth="1" strokeDasharray="5,3" opacity="0.7"/><line x1={cx} y1={cy} x2={cx+r} y2={cy} stroke={C} strokeWidth="1.5" strokeDasharray="4,3"/><text x={cx+r/2} y={cy-8} textAnchor="middle" fontSize="10" fill={C} fontWeight="700">r={v.r}</text><text x={cx} y={cy+8} textAnchor="middle" dominantBaseline="middle" fontSize="11" fill={C} fontWeight="700">V={fmt((4/3)*π*v.r**3)}</text></svg>)},
  },
  {id:'cylinder', label:'Cylinder',      icon:'🥫',
   inputs:[{k:'r',label:'Radius (r)',def:3},{k:'h',label:'Height (h)',def:8}],
   formula:'V = πr²h', formulaNote:'Base area times height',
   vol:v=>π*v.r**2*v.h, sa:v=>2*π*v.r*(v.r+v.h),
   steps:v=>[
     {label:'Formula',math:'V = π × r² × h',note:'The base is a circle with area πr²'},
     {label:'Base area',math:`π × r² = π × ${v.r}² = ${fmt(π*v.r**2)}`},
     {label:'Multiply by height',math:`${fmt(π*v.r**2)} × ${v.h} = ${fmt(π*v.r**2*v.h)} cubic units`},
   ],
   svg:(v,C)=>{const W=200,H=160;const r=Math.min(50,v.r*8),h=Math.min(90,v.h*6),cx=W/2,by=H-20,ty=by-h;return(<svg viewBox={`0 0 ${W} ${H}`} width="100%"><ellipse cx={cx} cy={by} rx={r} ry={r*0.32} fill={C+'25'} stroke={C} strokeWidth="1.5"/><rect x={cx-r} y={ty} width={r*2} height={h} fill={C+'15'} stroke={C} strokeWidth="1.5"/><ellipse cx={cx} cy={ty} rx={r} ry={r*0.32} fill={C+'30'} stroke={C} strokeWidth="1.5"/><line x1={cx+r+6} y1={ty} x2={cx+r+6} y2={by} stroke={C} strokeWidth="1.5" markerEnd="url(#arr)"/><text x={cx+r+18} y={(ty+by)/2} fontSize="9" fill={C} fontWeight="700" dominantBaseline="middle">h={v.h}</text><text x={cx} y={(ty+by)/2+5} textAnchor="middle" dominantBaseline="middle" fontSize="11" fill={C} fontWeight="700">V={fmt(π*v.r**2*v.h)}</text></svg>)},
  },
  {id:'cone',     label:'Cone',          icon:'🍦',
   inputs:[{k:'r',label:'Radius (r)',def:3},{k:'h',label:'Height (h)',def:8}],
   formula:'V = (1/3)πr²h', formulaNote:'One-third of cylinder with same base and height',
   vol:v=>(1/3)*π*v.r**2*v.h, sa:v=>π*v.r*(v.r+Math.sqrt(v.r**2+v.h**2)),
   steps:v=>[
     {label:'Formula',math:'V = (1/3) × π × r² × h',note:'Exactly 1/3 the volume of a cylinder with the same base and height'},
     {label:'Base area',math:`π × ${v.r}² = ${fmt(π*v.r**2)}`},
     {label:'Multiply by height',math:`${fmt(π*v.r**2)} × ${v.h} = ${fmt(π*v.r**2*v.h)} (full cylinder)`},
     {label:'Divide by 3',math:`V = ${fmt(π*v.r**2*v.h)} ÷ 3 = ${fmt((1/3)*π*v.r**2*v.h)} cubic units`},
   ],
   svg:(v,C)=>{const W=200,H=160;const r=Math.min(50,v.r*8),h=Math.min(90,v.h*7),cx=W/2,by=H-20,ty=by-h;return(<svg viewBox={`0 0 ${W} ${H}`} width="100%"><polygon points={`${cx},${ty} ${cx-r},${by} ${cx+r},${by}`} fill={C+'18'} stroke={C} strokeWidth="2"/><ellipse cx={cx} cy={by} rx={r} ry={r*0.28} fill={C+'25'} stroke={C} strokeWidth="1.5"/><text x={cx} y={(ty+by*2)/3+5} textAnchor="middle" dominantBaseline="middle" fontSize="11" fill={C} fontWeight="700">V={fmt((1/3)*π*v.r**2*v.h)}</text></svg>)},
  },
  {id:'pyramid',  label:'Square Pyramid',icon:'🔺',
   inputs:[{k:'b',label:'Base side (b)',def:4},{k:'h',label:'Height (h)',def:6}],
   formula:'V = (1/3)b²h', formulaNote:'One-third base area times height',
   vol:v=>(1/3)*v.b**2*v.h, sa:v=>v.b**2+2*v.b*Math.sqrt((v.b/2)**2+v.h**2),
   steps:v=>[
     {label:'Formula',math:'V = (1/3) × b² × h',note:'A pyramid is 1/3 of a prism with the same base and height'},
     {label:'Base area',math:`b² = ${v.b}² = ${v.b**2}`},
     {label:'Multiply by height',math:`${v.b**2} × ${v.h} = ${v.b**2*v.h}`},
     {label:'Divide by 3',math:`V = ${v.b**2*v.h} ÷ 3 = ${fmt((1/3)*v.b**2*v.h)} cubic units`},
   ],
   svg:(v,C)=>{const W=200,H=160,d=16;const sc=Math.min(55/v.b,10);const bw=v.b*sc,bh=bw*0.5,apex_h=Math.min(80,v.h*7);const bx=(W-bw)/2,by=H-25;return(<svg viewBox={`0 0 ${W} ${H}`} width="100%"><polygon points={`${bx+bw/2},${by-apex_h} ${bx},${by} ${bx+bw},${by}`} fill={C+'18'} stroke={C} strokeWidth="2"/><polygon points={`${bx+bw/2},${by-apex_h} ${bx+bw},${by} ${bx+bw+d},${by-bh} ${bx+bw/2+d},${by-apex_h-bh}`} fill={C+'25'} stroke={C} strokeWidth="1.5"/><ellipse cx={(bx+bx+bw)/2} cy={by} rx={bw/2} ry={bh/2} fill={C+'15'} stroke={C} strokeWidth="1" strokeDasharray="4,3"/><text x={W-16} y={H/2} textAnchor="end" fontSize="11" fill={C} fontWeight="700">V={fmt((1/3)*v.b**2*v.h)}</text></svg>)},
  },
  {id:'prism',    label:'Triangular Prism',icon:'🔷',
   inputs:[{k:'b',label:'Triangle base',def:4},{k:'h',label:'Triangle height',def:3},{k:'l',label:'Prism length',def:6}],
   formula:'V = ½bhl', formulaNote:'Triangle base area times prism length',
   vol:v=>0.5*v.b*v.h*v.l, sa:v=>{const hyp=Math.sqrt((v.b/2)**2+v.h**2);return v.b*v.h+v.l*(v.b+2*hyp)},
   steps:v=>[
     {label:'Formula',math:'V = ½ × b × h × l',note:'Cross-section area (triangle) × length (depth of prism)'},
     {label:'Triangle area',math:`½ × ${v.b} × ${v.h} = ${fmt(0.5*v.b*v.h)}`},
     {label:'Multiply by length',math:`${fmt(0.5*v.b*v.h)} × ${v.l} = ${fmt(0.5*v.b*v.h*v.l)} cubic units`},
   ],
   svg:(v,C)=>{const W=200,H=160,d=24;const sc=Math.min(60/v.b,60/(v.h||1));const bw=v.b*sc,bh=v.h*sc,x0=30,y0=H-25;return(<svg viewBox={`0 0 ${W} ${H}`} width="100%"><polygon points={`${x0},${y0} ${x0+bw},${y0} ${x0+bw/2},${y0-bh}`} fill={C+'18'} stroke={C} strokeWidth="2"/><polygon points={`${x0+d},${y0-d} ${x0+bw+d},${y0-d} ${x0+bw},${y0}`} fill={C+'25'} stroke={C} strokeWidth="1.5"/><line x1={x0} y1={y0} x2={x0+d} y2={y0-d} stroke={C} strokeWidth="1.5"/><line x1={x0+bw} y1={y0} x2={x0+bw+d} y2={y0-d} stroke={C} strokeWidth="1.5"/><line x1={x0+bw/2} y1={y0-bh} x2={x0+bw/2+d} y2={y0-bh-d} stroke={C} strokeWidth="1.5"/><text x={W-10} y={H/2} textAnchor="end" fontSize="11" fill={C} fontWeight="700">V={fmt(0.5*v.b*v.h*v.l)}</text></svg>)},
  },
]

// ── densities for mass calc ────────────────────────────────────
const DENSITIES=[
  {material:'Water',   rho:1.0,   unit:'g/cm³'},
  {material:'Wood (oak)',rho:0.72,unit:'g/cm³'},
  {material:'Concrete',rho:2.3,  unit:'g/cm³'},
  {material:'Iron',    rho:7.87,  unit:'g/cm³'},
  {material:'Gold',    rho:19.32, unit:'g/cm³'},
  {material:'Air',     rho:0.0013,unit:'g/cm³'},
  {material:'Ice',     rho:0.917, unit:'g/cm³'},
]

// ── real-world size references ─────────────────────────────────
const SIZE_REFS=[
  {label:'Teaspoon',ml:5},{label:'Shot glass',ml:44},{label:'Can of soda',ml:330},
  {label:'500ml bottle',ml:500},{label:'1 litre',ml:1000},{label:'Bucket',ml:9000},
  {label:'Bathtub',ml:200000},{label:'Olympic pool',ml:2500000},
]

const FORMULA_TABLE=[
  {shape:'Cube',          formula:'s³',              note:'s = side'},
  {shape:'Cuboid',        formula:'l × w × h',        note:'l, w, h = three dimensions'},
  {shape:'Sphere',        formula:'(4/3)πr³',          note:'r = radius'},
  {shape:'Cylinder',      formula:'πr²h',              note:'r = radius, h = height'},
  {shape:'Cone',          formula:'(1/3)πr²h',         note:'1/3 of cylinder'},
  {shape:'Square pyramid',formula:'(1/3)b²h',          note:'b = base side, h = height'},
  {shape:'Triangular prism',formula:'½bhl',            note:'b,h = triangle; l = length'},
  {shape:'Ellipsoid',     formula:'(4/3)πabc',         note:'a, b, c = semi-axes'},
  {shape:'Torus',         formula:'2π²Rr²',            note:'R = major, r = minor radius'},
  {shape:'Paraboloid',    formula:'(1/2)πr²h',         note:'r = radius at top, h = height'},
]

const FAQ=[
  {q:'Why is the cone exactly 1/3 of the cylinder?',a:"Cavalieri's Principle proves this rigorously: if every horizontal cross-section of two solids at every height has the same area, they have the same volume. A cone's circular cross-sections shrink from πr² at the base to 0 at the apex. Integrating πr²(1-z/h)² from 0 to h gives (1/3)πr²h. You can demonstrate this physically: fill a cone 3 times to fill the matching cylinder."},
  {q:'How does volume scale when you double all dimensions?',a:'Volume scales with the cube of the linear scale factor. Double all dimensions → 2³ = 8 times the volume. Triple all dimensions → 3³ = 27 times the volume. This is why giants in science fiction are impossible — their weight grows as the cube of their height but their bones\' cross-section only grows as the square, eventually crushing them.'},
  {q:'What is the relationship between volume and mass?',a:'Mass = Volume × Density. If volume is in cm³ and density is in g/cm³, mass is in grams. 1 cm³ of water = 1g. 1 cm³ of gold = 19.32g. This is why a gold cube of side 10cm has volume 1000cm³ but mass 19.32kg — much heavier than it looks.'},
  {q:'What is displacement volume and why does it matter?',a:"Archimedes discovered that a submerged object displaces water equal to its own volume. He used this to detect whether a crown was pure gold (same density → same volume for same mass). This principle is used in calculating ship buoyancy, measuring irregular object volumes, and medicine (lung volume measurement)."},
]

export default function VolumeCalculator({meta,category}){
  const C=category?.color||'#3b82f6'
  const[shId,setShId]=useState('cuboid')
  const[vals,setVals]=useState({s:4,l:5,w:3,h:4,r:5,b:4,n:6})
  const[matIdx,setMatIdx]=useState(0)
  const[openFaq,setFaq]=useState(null)
  const[openGloss,setGl]=useState(null)

  const sh=SHAPES.find(s=>s.id===shId)||SHAPES[0]
  const vol=sh.vol(vals), sa=sh.sa?sh.sa(vals):null
  const steps=sh.steps(vals)
  const mat=DENSITIES[matIdx]
  const massG=vol*mat.rho

  const nearest=SIZE_REFS.reduce((b,ref)=>Math.abs(vol-ref.ml)<Math.abs(vol-b.ml)?ref:b)
  const fillPct=clamp((Math.log10(vol+1)/Math.log10(3000000+1))*100,3,97)

  // scaling table
  const SCALES=[1,2,3,4,5,10]

  return(<div style={{display:'flex',flexDirection:'column',gap:20}}>

    {/* FORMULA BANNER */}
    <div style={{background:`linear-gradient(135deg,${C}12,${C}06)`,border:`1px solid ${C}30`,borderRadius:14,padding:'16px 20px',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12}}>
      <div>
        <div style={{fontSize:10,fontWeight:700,color:C,textTransform:'uppercase',letterSpacing:'.08em',marginBottom:6}}>{sh.label} — Volume Formula</div>
        <div style={{fontSize:24,fontWeight:700,color:C,fontFamily:"'Space Grotesk',sans-serif"}}>{sh.formula}</div>
        <div style={{fontSize:11,color:'var(--text-3)',marginTop:4}}>{sh.formulaNote}</div>
      </div>
      <div style={{padding:'10px 20px',background:C+'18',borderRadius:12,textAlign:'center'}}>
        <div style={{fontSize:11,color:'var(--text-3)',marginBottom:2}}>Volume</div>
        <div style={{fontSize:32,fontWeight:700,color:C,fontFamily:"'Space Grotesk',sans-serif"}}>{fmt(vol)}</div>
        <div style={{fontSize:11,color:'var(--text-3)'}}>cubic units</div>
      </div>
    </div>

    {/* SHAPE SELECTOR */}
    <div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,padding:'14px 18px'}}>
      <div style={{fontSize:12,fontWeight:600,color:'var(--text-2)',marginBottom:12,fontFamily:"'DM Sans',sans-serif"}}>Select 3D shape</div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8}}>
        {SHAPES.map(s=>(
          <button key={s.id} onClick={()=>setShId(s.id)} style={{padding:'10px 4px',borderRadius:10,border:`1.5px solid ${shId===s.id?C:'var(--border-2)'}`,background:shId===s.id?C+'12':'var(--bg-raised)',cursor:'pointer',textAlign:'center'}}>
            <div style={{fontSize:20,marginBottom:2}}>{s.icon}</div>
            <div style={{fontSize:10,fontWeight:shId===s.id?700:500,color:shId===s.id?C:'var(--text-2)',lineHeight:1.2}}>{s.label}</div>
          </button>
        ))}
      </div>
    </div>

    <CalcShell
      left={<>
        <div style={{fontSize:12,fontWeight:600,color:'var(--text-2)',marginBottom:12,fontFamily:"'DM Sans',sans-serif"}}>Dimensions</div>
        {sh.inputs.map(inp=>(
          <Inp key={inp.k} label={inp.label} value={vals[inp.k]||inp.def} onChange={v=>setVals(p=>({...p,[inp.k]:v}))} color={C}/>
        ))}

        {/* density / mass calculator */}
        <div style={{borderTop:'0.5px solid var(--border)',paddingTop:14,marginTop:4,marginBottom:14}}>
          <div style={{fontSize:12,fontWeight:700,color:'var(--text)',marginBottom:10}}>⚖️ Mass calculator (if units = cm)</div>
          <div style={{display:'flex',flexWrap:'wrap',gap:6,marginBottom:10}}>
            {DENSITIES.map((d,i)=>(
              <button key={i} onClick={()=>setMatIdx(i)} style={{padding:'5px 10px',borderRadius:7,border:`1.5px solid ${matIdx===i?C:'var(--border-2)'}`,background:matIdx===i?C+'12':'var(--bg-raised)',fontSize:11,fontWeight:matIdx===i?700:500,color:matIdx===i?C:'var(--text-2)',cursor:'pointer'}}>{d.material}</button>
            ))}
          </div>
          <div style={{padding:'10px 13px',background:C+'08',borderRadius:9,border:`1px solid ${C}20`}}>
            <div style={{fontSize:10,color:'var(--text-3)',marginBottom:2}}>{mat.material} (ρ = {mat.rho} {mat.unit})</div>
            <div style={{fontSize:22,fontWeight:700,color:C,fontFamily:"'Space Grotesk',sans-serif"}}>{fmt(Math.round(massG*100)/100)} g</div>
            {massG>1000&&<div style={{fontSize:12,color:'var(--text-3)',marginTop:2}}>{fmt(Math.round(massG/10)/100)} kg</div>}
          </div>
        </div>

        {/* examples */}
        <div style={{borderTop:'0.5px solid var(--border)',paddingTop:14}}>
          <div style={{fontSize:10,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:10}}>🎯 Real objects</div>
          {[
            {s:'cylinder',v:{r:3.3,h:12.2},l:'🥤 Soda can (330ml)'},
            {s:'sphere',  v:{r:11},         l:'⚽ Football'},
            {s:'cuboid',  v:{l:20,w:20,h:7},l:'📚 Textbook'},
            {s:'cone',    v:{r:2.5,h:12},   l:'🍦 Ice cream cone'},
            {s:'pyramid', v:{b:230,h:139},  l:'🏛️ Great Pyramid (m)'},
          ].map((ex,i)=>(
            <button key={i} onClick={()=>{setShId(ex.s);setVals(p=>({...p,...ex.v}))}} style={{display:'block',width:'100%',padding:'8px 12px',borderRadius:8,border:'1px solid var(--border-2)',background:'var(--bg-raised)',cursor:'pointer',textAlign:'left',marginBottom:6,fontSize:12,color:'var(--text)',fontFamily:"'DM Sans',sans-serif"}}
              onMouseEnter={e=>e.currentTarget.style.borderColor=C+'60'} onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border-2)'}>{ex.l}</button>
          ))}
        </div>
      </>}

      right={<>
        {/* main result */}
        <div style={{background:'var(--bg-card)',border:`1.5px solid ${C}30`,borderRadius:14,padding:'18px 20px',marginBottom:14}}>
          <div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:8}}>Volume</div>
          <div style={{fontSize:48,fontWeight:700,color:C,fontFamily:"'Space Grotesk',sans-serif",lineHeight:1}}>{fmt(vol)}</div>
          <div style={{fontSize:13,color:'var(--text-3)',marginTop:4,marginBottom:10}}>cubic units</div>
          {sa!=null&&<div style={{fontSize:13,color:'var(--text-2)',marginBottom:10}}>Surface area: <strong style={{color:'#10b981'}}>{fmt(sa)} sq units</strong></div>}
          <div style={{padding:'10px 13px',background:C+'08',borderRadius:9,border:`1px solid ${C}20`,fontSize:12,color:'var(--text-2)',lineHeight:1.65}}>
            💡 If units are cm³: {fmt(vol)} cm³ = {fmt(vol)} ml = {fmt(Math.round(vol/100)/10)} L. Closest common container: <strong>{nearest.label}</strong> ({nearest.ml}ml).
          </div>
        </div>

        {/* liquid fill visual */}
        <div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,padding:'14px 18px',marginBottom:14}}>
          <div style={{fontSize:12,fontWeight:700,color:'var(--text)',marginBottom:10,fontFamily:"'Space Grotesk',sans-serif"}}>Liquid fill visualisation</div>
          <div style={{position:'relative',height:80,background:'var(--bg-raised)',borderRadius:10,border:`2px solid ${C}30`,overflow:'hidden'}}>
            <div style={{position:'absolute',bottom:0,left:0,right:0,height:`${fillPct}%`,background:`linear-gradient(0deg,${C}99,${C}44)`,transition:'height .7s ease',borderRadius:'0 0 8px 8px'}}/>
            <div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',fontSize:16,fontWeight:700,color:C,fontFamily:"'Space Grotesk',sans-serif",zIndex:2,textShadow:'0 1px 3px rgba(0,0,0,.15)'}}>{fmt(Math.round(vol))} units³</div>
          </div>
          <div style={{display:'flex',justifyContent:'space-between',fontSize:10,color:'var(--text-3)',marginTop:6}}>
            <span>1ml</span><span>1 litre</span><span>1000L</span><span>Olympic pool</span>
          </div>
        </div>

        {/* 3D shape SVG */}
        <div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,padding:'14px 18px',marginBottom:14}}>
          <div style={{fontSize:12,fontWeight:700,color:'var(--text)',marginBottom:8,fontFamily:"'Space Grotesk',sans-serif"}}>3D shape</div>
          <div style={{background:'var(--bg-raised)',borderRadius:10,padding:'8px',border:'0.5px solid var(--border)'}}>
            {sh.svg(vals,C)}
          </div>
        </div>

        {/* real-world size comparison */}
        <div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,padding:'14px 18px',marginBottom:14}}>
          <div style={{fontSize:12,fontWeight:700,color:'var(--text)',marginBottom:10,fontFamily:"'Space Grotesk',sans-serif"}}>Size comparison (units = ml)</div>
          {SIZE_REFS.map((ref,i)=>{
            const isNearest=ref.label===nearest.label
            return(
              <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'5px 0',borderBottom:'0.5px solid var(--border)'}}>
                <span style={{fontSize:12,color:isNearest?C:'var(--text-2)',fontWeight:isNearest?700:400}}>{ref.label}</span>
                <span style={{fontSize:12,fontWeight:700,color:isNearest?C:'var(--text-3)',fontFamily:"'Space Grotesk',sans-serif"}}>{ref.ml}ml{isNearest?' ← closest':''}</span>
              </div>
            )
          })}
        </div>

        <BreakdownTable title="Summary" rows={[
          {label:'Volume',value:`${fmt(vol)} units³`,bold:true,highlight:true,color:C},
          ...(sa!=null?[{label:'Surface area',value:`${fmt(sa)} units²`}]:[]),
          {label:'Shape',value:sh.label},
          {label:'Formula',value:sh.formula},
          {label:`Mass (${mat.material})`,value:`${fmt(Math.round(massG*100)/100)} g`},
        ]}/>
        <AIHintCard hint={`${sh.label} volume = ${fmt(vol)}, mass in ${mat.material} = ${fmt(Math.round(massG*100)/100)}g`}/>
      </>}
    />

    <StepsCard steps={steps} color={C}/>

    {/* CAVALIERI PRINCIPLE */}
    <Sec title="Why cone = ⅓ cylinder — Cavalieri's Principle" sub="Visual proof">
      <p style={{fontSize:12,color:'var(--text-2)',lineHeight:1.7,marginBottom:14,fontFamily:"'DM Sans',sans-serif"}}>
        Cavalieri's Principle (1635): if two solids have the same height and every corresponding cross-section has the same area, they have equal volumes. A cone's circular cross-sections shrink quadratically from base to apex — integrating them gives exactly ⅓ of the cylinder.
      </p>
      <svg viewBox="0 0 280 120" width="100%" style={{display:'block',marginBottom:14}}>
        {/* cylinder */}
        <ellipse cx={60} cy={100} rx={35} ry={10} fill={C+'25'} stroke={C} strokeWidth="1.5"/>
        <rect x={25} y={20} width={70} height={80} fill={C+'12'} stroke={C} strokeWidth="1.5"/>
        <ellipse cx={60} cy={20} rx={35} ry={10} fill={C+'30'} stroke={C} strokeWidth="1.5"/>
        <text x={60} y={115} textAnchor="middle" fontSize="10" fill={C} fontWeight="700">Cylinder</text>
        <text x={60} y={127} textAnchor="middle" fontSize="8" fill="var(--text-3)">πr²h</text>
        {/* equals */}
        <text x={120} y={65} textAnchor="middle" fontSize="18" fill="var(--text-3)" fontWeight="700">=</text>
        <text x={120} y={85} textAnchor="middle" fontSize="10" fill="var(--text-3)">3 ×</text>
        {/* three cones */}
        {[0,1,2].map(i=>{const cx=155+i*40;return(<g key={i}><polygon points={`${cx},20 ${cx-20},100 ${cx+20},100`} fill={C+'18'} stroke={C} strokeWidth="1.5"/><ellipse cx={cx} cy={100} rx={20} ry={6} fill={C+'25'} stroke={C} strokeWidth="1"/></g>)})}
        <text x={195} y={115} textAnchor="middle" fontSize="10" fill={C} fontWeight="700">3 × Cone</text>
        <text x={195} y={127} textAnchor="middle" fontSize="8" fill="var(--text-3)">3 × (⅓πr²h)</text>
      </svg>
      <div style={{padding:'10px 14px',background:C+'08',borderRadius:9,border:`1px solid ${C}20`,fontSize:12,color:'var(--text-2)',lineHeight:1.65}}>
        💡 Fill a cone with water and pour into the matching cylinder — it takes exactly <strong>3 fills</strong>. Try it! A pyramid and a prism with the same base and height follow the same rule.
      </div>
    </Sec>

    {/* SCALING TABLE */}
    <Sec title="How volume scales with size" sub="Volume grows as the cube">
      <p style={{fontSize:12,color:'var(--text-2)',lineHeight:1.7,marginBottom:12,fontFamily:"'DM Sans',sans-serif"}}>
        When you scale all dimensions by a factor k, volume scales by k³. This surprises most people and has enormous practical consequences.
      </p>
      <div style={{overflowX:'auto'}}>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead>
            <tr>{['Scale factor','Volume','vs original','Example'].map(h=>(
              <th key={h} style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textAlign:'left',padding:'8px 10px',borderBottom:'1px solid var(--border)',background:'var(--bg-raised)'}}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {SCALES.map((k,i)=>(
              <tr key={i} style={{background:k===1?C+'10':'transparent'}} onMouseEnter={e=>e.currentTarget.style.background=C+'08'} onMouseLeave={e=>e.currentTarget.style.background=k===1?C+'10':'transparent'}>
                <td style={{padding:'8px 10px',fontSize:13,fontWeight:700,color:C,borderBottom:'0.5px solid var(--border)',fontFamily:"'Space Grotesk',sans-serif"}}>×{k}</td>
                <td style={{padding:'8px 10px',fontSize:13,fontWeight:600,color:'var(--text)',borderBottom:'0.5px solid var(--border)',fontFamily:"'Space Grotesk',sans-serif"}}>{fmt(Math.round(vol*k**3*100)/100)}</td>
                <td style={{padding:'8px 10px',fontSize:12,color:'var(--text-2)',borderBottom:'0.5px solid var(--border)'}}>{k===1?'original':`${k**3}× larger`}</td>
                <td style={{padding:'8px 10px',fontSize:11,color:'var(--text-3)',borderBottom:'0.5px solid var(--border)'}}>{k===2?'Double side → 8× volume':k===3?'Triple → 27× volume':k===10?'10× size → 1000× volume':''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Sec>

    {/* ALL FORMULAS TABLE */}
    <Sec title="Volume formulas for every 3D shape" sub="Complete reference">
      <table style={{width:'100%',borderCollapse:'collapse'}}>
        <thead>
          <tr>{['Shape','Formula','Key note'].map(h=>(
            <th key={h} style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textAlign:'left',padding:'8px 10px',borderBottom:'1px solid var(--border)',background:'var(--bg-raised)'}}>{h}</th>
          ))}</tr>
        </thead>
        <tbody>
          {FORMULA_TABLE.map((r,i)=>(
            <tr key={i} onMouseEnter={e=>e.currentTarget.style.background=C+'08'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
              <td style={{padding:'8px 10px',fontSize:13,fontWeight:600,color:'var(--text)',borderBottom:'0.5px solid var(--border)'}}>{r.shape}</td>
              <td style={{padding:'8px 10px',fontSize:13,fontWeight:700,color:C,fontFamily:"'Space Grotesk',sans-serif",borderBottom:'0.5px solid var(--border)'}}>{r.formula}</td>
              <td style={{padding:'8px 10px',fontSize:11,color:'var(--text-3)',borderBottom:'0.5px solid var(--border)'}}>{r.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Sec>

    {/* REAL WORLD */}
    <Sec title="Where volume calculations are used in real life">
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
        {[
          {icon:'🚢',field:'Shipping & Cargo',desc:'Container ships are loaded by volume (m³) and weight (tonnes). A 20-foot TEU container holds 33.2m³. Volume determines how many containers fit per ship.',example:'20ft container = 33.2m³ capacity',color:C},
          {icon:'🏗️',field:'Concrete & Construction',desc:'Concrete is ordered by the cubic metre. A standard driveway needs about 3–5m³. Under-ordering stops work; over-ordering wastes thousands of rupees.',example:'Driveway: 6m×3m×0.1m = 1.8m³',color:'#10b981'},
          {icon:'💊',field:'Medicine & Dosing',desc:'IV drip bags, syringes, and capsules are all measured by volume (ml, cc). 1cc = 1cm³ = 1ml. Precise dosing depends on precise volume measurement.',example:'1cc = 1cm³ = 1ml exactly',color:'#ef4444'},
          {icon:'🌊',field:'Water & Reservoirs',desc:'Water consumption is measured in litres (1L = 1000cm³) and reservoirs in million litres or million m³. Mumbai uses ~3.5 billion litres per day.',example:"Mumbai: 3,500,000 m³/day water",color:'#3b82f6'},
          {icon:'🔋',field:'Batteries & Energy',desc:"Battery capacity (mAh) is not volume, but the physical size of a battery cell is determined by volume. Energy density (Wh/L) tells how much energy fits in a given volume.",example:'Li-ion: ~700 Wh/L energy density',color:'#f59e0b'},
          {icon:'🧬',field:'Biology — Cell Size',desc:'Cells maintain a high surface-area-to-volume ratio for nutrient exchange. As a cell grows, its volume grows faster than its SA (cube vs square), which is why cells divide.',example:'SA/V ratio: why cells are small',color:'#8b5cf6'},
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
          'Confusing volume (cubic units) with area (square units) — volume is always units³',
          'Using diameter instead of radius in sphere and cylinder formulas',
          'Forgetting the 1/3 factor in cone and pyramid formulas — they are 1/3 of the prism/cylinder',
          'Scaling: doubling one dimension doubles volume, but doubling ALL dimensions multiplies volume by 8',
        ].map((m,i)=>(
          <div key={i} style={{display:'flex',gap:12,padding:'10px 14px',borderRadius:9,background:'#fee2e210',border:'0.5px solid #ef444420'}}>
            <span style={{fontSize:14,flexShrink:0,color:'#ef4444',fontWeight:700}}>✗</span>
            <span style={{fontSize:12.5,color:'var(--text-2)',lineHeight:1.6}}>{m}</span>
          </div>
        ))}
      </div>
    </Sec>

    {/* GLOSSARY */}
    <Sec title="Key terms explained" sub="Tap to expand">
      {[
        {term:'Volume',def:'The amount of 3D space a solid occupies, measured in cubic units (cm³, m³, litres). 1 litre = 1000cm³.'},
        {term:'Cubic units',def:'Units raised to the third power: mm³, cm³, m³. Since volume is 3-dimensional, always three dimensions are multiplied.'},
        {term:'Density',def:'Mass per unit volume (g/cm³ or kg/m³). Mass = Volume × Density. Water has density 1 g/cm³ by definition.'},
        {term:'Displacement',def:"The volume of fluid displaced by a submerged object equals the object's volume. Archimedes used this to measure the volume of an irregular crown."},
        {term:'Cavalieri\'s Principle',def:'Two solids with the same height and equal cross-sectional areas at every level have equal volumes. Proved by Bonaventura Cavalieri in 1635.'},
        {term:'SA:V ratio',def:'Surface-area-to-volume ratio. For a sphere: SA/V = 3/r. Smaller objects have higher SA/V — critical in biology, chemistry, and heat transfer.'},
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

    {/* FAQ */}
    <Sec title="Frequently asked questions">
      {FAQ.map((f,i)=>(
        <Acc key={i} q={f.q} a={f.a} open={openFaq===i} onToggle={()=>setFaq(openFaq===i?null:i)} color={C}/>
      ))}
    </Sec>

  </div>)
}
