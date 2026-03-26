import { useState, useMemo } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'

// ─── helpers ───────────────────────────────────────────────────
const fmt  = n => (isNaN(n)||!isFinite(n)) ? '—' : parseFloat(Number(n).toFixed(6)).toString()
const π    = Math.PI

// ─── shape definitions ─────────────────────────────────────────
const SHAPES = [
  { id:'rectangle', label:'Rectangle',   icon:'▬', inputs:[{k:'l',label:'Length',hint:'l'},{k:'w',label:'Width',hint:'w'}], defaults:{l:8,w:5},
    formula:'A = l × w', formulaDesc:'Length times width',
    area:({l,w})=>l*w, perimeter:({l,w})=>2*(l+w),
    steps:({l,w})=>[
      {label:'Write the formula',math:'A = l × w',note:'Area of a rectangle = length × width'},
      {label:'Substitute values',math:`A = ${l} × ${w}`},
      {label:'Multiply',math:`A = ${fmt(l*w)} square units`,note:`${l} × ${w} = ${fmt(l*w)}`},
    ],
    svg:({l,w,C})=>{const W=200,H=140,ox=20,oy=20;const sx=clamp((W-2*ox)/l,0,999),sy=clamp((H-2*oy)/w,0,999);const sc=Math.min(sx,sy);const rw=l*sc,rh=w*sc,rx=(W-rw)/2,ry=(H-rh)/2;return(
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{display:'block'}}>
        <rect x={rx} y={ry} width={rw} height={rh} fill={C+'20'} stroke={C} strokeWidth="2" rx="2"/>
        <line x1={rx} y1={ry-8} x2={rx+rw} y2={ry-8} stroke={C} strokeWidth="1" markerEnd="url(#arr)" markerStart="url(#arr)"/>
        <text x={rx+rw/2} y={ry-12} textAnchor="middle" fontSize="10" fill={C} fontWeight="700">{l}</text>
        <line x1={rx+rw+8} y1={ry} x2={rx+rw+8} y2={ry+rh} stroke={C} strokeWidth="1" markerEnd="url(#arr)" markerStart="url(#arr)"/>
        <text x={rx+rw+16} y={ry+rh/2} textAnchor="start" fontSize="10" fill={C} fontWeight="700" dominantBaseline="middle">{w}</text>
        <text x={W/2} y={ry+rh/2} textAnchor="middle" fontSize="12" fill={C} fontWeight="700" dominantBaseline="middle">A={fmt(l*w)}</text>
      </svg>
    )},
  },
  { id:'square', label:'Square', icon:'■', inputs:[{k:'s',label:'Side length',hint:'s'}], defaults:{s:6},
    formula:'A = s²', formulaDesc:'Side squared',
    area:({s})=>s*s, perimeter:({s})=>4*s,
    steps:({s})=>[
      {label:'Write the formula',math:'A = s²',note:'A square is a rectangle where length = width'},
      {label:'Substitute',math:`A = ${s}²`},
      {label:'Square the side',math:`A = ${s} × ${s} = ${fmt(s*s)} square units`},
    ],
    svg:({s,C})=>{const W=200,H=140;const sc=Math.min((W-40)/s,(H-40)/s);const side=s*sc,ox=(W-side)/2,oy=(H-side)/2;return(
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{display:'block'}}>
        <rect x={ox} y={oy} width={side} height={side} fill={C+'20'} stroke={C} strokeWidth="2.5" rx="2"/>
        <text x={W/2} y={oy-8} textAnchor="middle" fontSize="10" fill={C} fontWeight="700">{s}</text>
        <text x={W/2} y={oy+side/2} textAnchor="middle" fontSize="12" fill={C} fontWeight="700" dominantBaseline="middle">A={fmt(s*s)}</text>
      </svg>
    )},
  },
  { id:'circle', label:'Circle', icon:'●', inputs:[{k:'r',label:'Radius',hint:'r'}], defaults:{r:5},
    formula:'A = πr²', formulaDesc:'Pi times radius squared',
    area:({r})=>π*r*r, perimeter:({r})=>2*π*r,
    steps:({r})=>[
      {label:'Write the formula',math:'A = π × r²',note:'π ≈ 3.14159265...'},
      {label:'Square the radius',math:`r² = ${r}² = ${r*r}`},
      {label:'Multiply by π',math:`A = ${fmt(π)} × ${r*r} = ${fmt(π*r*r)} square units`},
    ],
    svg:({r,C})=>{const W=200,H=140,cx=100,cy=70,sr=Math.min(80,r*12);return(
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{display:'block'}}>
        <circle cx={cx} cy={cy} r={sr} fill={C+'20'} stroke={C} strokeWidth="2"/>
        <line x1={cx} y1={cy} x2={cx+sr} y2={cy} stroke={C} strokeWidth="1.5" strokeDasharray="4,3"/>
        <text x={cx+sr/2} y={cy-6} textAnchor="middle" fontSize="10" fill={C} fontWeight="700">r={r}</text>
        <text x={cx} y={cy+6} textAnchor="middle" fontSize="12" fill={C} fontWeight="700" dominantBaseline="middle">A={fmt(π*r*r)}</text>
      </svg>
    )},
  },
  { id:'triangle', label:'Triangle', icon:'▲', inputs:[{k:'b',label:'Base',hint:'b'},{k:'h',label:'Height',hint:'h'}], defaults:{b:8,h:5},
    formula:'A = ½ × b × h', formulaDesc:'Half base times height',
    area:({b,h})=>0.5*b*h, perimeter:null,
    steps:({b,h})=>[
      {label:'Write the formula',math:'A = ½ × b × h',note:'The height must be perpendicular to the base'},
      {label:'Multiply base and height',math:`${b} × ${h} = ${b*h}`},
      {label:'Divide by 2',math:`A = ${b*h} ÷ 2 = ${fmt(0.5*b*h)} square units`,note:'Every triangle is half a parallelogram'},
    ],
    svg:({b,h,C})=>{const W=200,H=140;const sc=Math.min((W-40)/b,(H-40)/h);const bw=b*sc,bh=h*sc,bx=(W-bw)/2,by=(H-bh)/2;return(
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{display:'block'}}>
        <polygon points={`${bx+bw/2},${by} ${bx},${by+bh} ${bx+bw},${by+bh}`} fill={C+'20'} stroke={C} strokeWidth="2"/>
        <line x1={bx+bw/2} y1={by} x2={bx+bw/2} y2={by+bh} stroke={C} strokeWidth="1" strokeDasharray="4,3"/>
        <text x={bx+bw/2+6} y={(by+by+bh)/2} fontSize="10" fill={C} fontWeight="700" dominantBaseline="middle">h={h}</text>
        <text x={W/2} y={by+bh+14} textAnchor="middle" fontSize="10" fill={C} fontWeight="700">b={b}</text>
        <text x={W/2} y={by+bh/2+4} textAnchor="middle" fontSize="11" fill={C} fontWeight="700" dominantBaseline="middle">A={fmt(0.5*b*h)}</text>
      </svg>
    )},
  },
  { id:'trapezoid', label:'Trapezoid', icon:'⏢', inputs:[{k:'a',label:'Top base (a)',hint:'a'},{k:'b',label:'Bottom base (b)',hint:'b'},{k:'h',label:'Height',hint:'h'}], defaults:{a:4,b:8,h:5},
    formula:'A = ½(a+b) × h', formulaDesc:'Half sum of parallel sides times height',
    area:({a,b,h})=>0.5*(a+b)*h, perimeter:null,
    steps:({a,b,h})=>[
      {label:'Write the formula',math:'A = ½ × (a + b) × h',note:'a and b are the two parallel sides (bases)'},
      {label:'Sum the bases',math:`a + b = ${a} + ${b} = ${a+b}`},
      {label:'Multiply by height',math:`${a+b} × ${h} = ${(a+b)*h}`},
      {label:'Divide by 2',math:`A = ${(a+b)*h} ÷ 2 = ${fmt(0.5*(a+b)*h)} square units`},
    ],
    svg:({a,b,h,C})=>{const W=200,H=140;const sc=Math.min((W-40)/b,(H-40)/h);const bw=b*sc,aw=a*sc,bh=h*sc,bx=(W-bw)/2,by=(H-bh)/2,offset=(bw-aw)/2;return(
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{display:'block'}}>
        <polygon points={`${bx+offset},${by} ${bx+offset+aw},${by} ${bx+bw},${by+bh} ${bx},${by+bh}`} fill={C+'20'} stroke={C} strokeWidth="2"/>
        <text x={W/2} y={by-6} textAnchor="middle" fontSize="10" fill={C} fontWeight="700">a={a}</text>
        <text x={W/2} y={by+bh+14} textAnchor="middle" fontSize="10" fill={C} fontWeight="700">b={b}</text>
        <text x={W/2} y={by+bh/2+4} textAnchor="middle" fontSize="11" fill={C} fontWeight="700" dominantBaseline="middle">A={fmt(0.5*(a+b)*h)}</text>
      </svg>
    )},
  },
  { id:'parallelogram', label:'Parallelogram', icon:'▱', inputs:[{k:'b',label:'Base',hint:'b'},{k:'h',label:'Height',hint:'h'}], defaults:{b:8,h:5},
    formula:'A = b × h', formulaDesc:'Base times perpendicular height',
    area:({b,h})=>b*h, perimeter:null,
    steps:({b,h})=>[
      {label:'Write the formula',math:'A = b × h',note:'Height is the perpendicular distance between the parallel sides, NOT the slant side'},
      {label:'Substitute',math:`A = ${b} × ${h} = ${fmt(b*h)} square units`},
    ],
    svg:({b,h,C})=>{const W=200,H=140;const sc=Math.min((W-60)/b,(H-40)/h);const bw=b*sc,bh=h*sc,slant=20,bx=(W-bw-slant)/2,by=(H-bh)/2;return(
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{display:'block'}}>
        <polygon points={`${bx+slant},${by} ${bx+slant+bw},${by} ${bx+bw},${by+bh} ${bx},${by+bh}`} fill={C+'20'} stroke={C} strokeWidth="2"/>
        <line x1={bx+slant+bw*0.7} y1={by} x2={bx+slant+bw*0.7} y2={by+bh} stroke={C} strokeWidth="1" strokeDasharray="4,3"/>
        <text x={bx+slant+bw*0.7+6} y={by+bh/2} fontSize="10" fill={C} fontWeight="700" dominantBaseline="middle">h={h}</text>
        <text x={W/2} y={by+bh+14} textAnchor="middle" fontSize="10" fill={C} fontWeight="700">b={b}</text>
        <text x={W/2} y={by+bh/2+4} textAnchor="middle" fontSize="11" fill={C} fontWeight="700" dominantBaseline="middle">A={fmt(b*h)}</text>
      </svg>
    )},
  },
  { id:'ellipse', label:'Ellipse', icon:'⬭', inputs:[{k:'a',label:'Semi-major axis (a)',hint:'a'},{k:'b',label:'Semi-minor axis (b)',hint:'b'}], defaults:{a:7,b:4},
    formula:'A = π × a × b', formulaDesc:'Pi times both semi-axes',
    area:({a,b})=>π*a*b, perimeter:null,
    steps:({a,b})=>[
      {label:'Write the formula',math:'A = π × a × b',note:'An ellipse is a stretched circle. When a = b it becomes a circle (πr²).'},
      {label:'Multiply semi-axes',math:`a × b = ${a} × ${b} = ${a*b}`},
      {label:'Multiply by π',math:`A = π × ${a*b} = ${fmt(π*a*b)} square units`},
    ],
    svg:({a,b,C})=>{const W=200,H=140;const sc=Math.min((W-40)/(2*a),(H-40)/(2*b));const rx=a*sc,ry=b*sc;return(
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{display:'block'}}>
        <ellipse cx={W/2} cy={H/2} rx={rx} ry={ry} fill={C+'20'} stroke={C} strokeWidth="2"/>
        <line x1={W/2} y1={H/2} x2={W/2+rx} y2={H/2} stroke={C} strokeWidth="1.5" strokeDasharray="4,3"/>
        <text x={W/2+rx/2} y={H/2-6} textAnchor="middle" fontSize="10" fill={C} fontWeight="700">a={a}</text>
        <line x1={W/2} y1={H/2} x2={W/2} y2={H/2-ry} stroke={C} strokeWidth="1.5" strokeDasharray="4,3"/>
        <text x={W/2+6} y={H/2-ry/2} fontSize="10" fill={C} fontWeight="700" dominantBaseline="middle">b={b}</text>
        <text x={W/2} y={H/2+6} textAnchor="middle" fontSize="11" fill={C} fontWeight="700" dominantBaseline="middle">A={fmt(π*a*b)}</text>
      </svg>
    )},
  },
  { id:'rhombus', label:'Rhombus', icon:'◆', inputs:[{k:'d1',label:'Diagonal 1',hint:'d₁'},{k:'d2',label:'Diagonal 2',hint:'d₂'}], defaults:{d1:10,d2:6},
    formula:'A = (d₁ × d₂) / 2', formulaDesc:'Half the product of the two diagonals',
    area:({d1,d2})=>d1*d2/2, perimeter:({d1,d2})=>4*Math.sqrt((d1/2)**2+(d2/2)**2),
    steps:({d1,d2})=>[
      {label:'Write the formula',math:'A = (d₁ × d₂) / 2',note:'The diagonals of a rhombus bisect each other at right angles'},
      {label:'Multiply diagonals',math:`${d1} × ${d2} = ${d1*d2}`},
      {label:'Divide by 2',math:`A = ${d1*d2} ÷ 2 = ${fmt(d1*d2/2)} square units`},
    ],
    svg:({d1,d2,C})=>{const W=200,H=140;const sc=Math.min((W-40)/d1,(H-40)/d2);const hw=d1*sc/2,hh=d2*sc/2;return(
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{display:'block'}}>
        <polygon points={`${W/2-hw},${H/2} ${W/2},${H/2-hh} ${W/2+hw},${H/2} ${W/2},${H/2+hh}`} fill={C+'20'} stroke={C} strokeWidth="2"/>
        <line x1={W/2-hw} y1={H/2} x2={W/2+hw} y2={H/2} stroke={C} strokeWidth="1" strokeDasharray="4,3"/>
        <line x1={W/2} y1={H/2-hh} x2={W/2} y2={H/2+hh} stroke={C} strokeWidth="1" strokeDasharray="4,3"/>
        <text x={W/2} y={H/2-hh-8} textAnchor="middle" fontSize="10" fill={C} fontWeight="700">d₁={d1}</text>
        <text x={W/2+hw+6} y={H/2} fontSize="10" fill={C} fontWeight="700" dominantBaseline="middle">d₂={d2}</text>
        <text x={W/2} y={H/2+6} textAnchor="middle" fontSize="11" fill={C} fontWeight="700" dominantBaseline="middle">A={fmt(d1*d2/2)}</text>
      </svg>
    )},
  },
]

const clamp = (v,a,b)=>Math.min(b,Math.max(a,v))

// ─── shared UI ─────────────────────────────────────────────────
function Sec({title,sub,children}){return(<div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,overflow:'hidden'}}><div style={{padding:'13px 18px',borderBottom:'0.5px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center'}}><span style={{fontSize:13,fontWeight:700,color:'var(--text)',fontFamily:"'Space Grotesk',sans-serif"}}>{title}</span>{sub&&<span style={{fontSize:11,color:'var(--text-3)'}}>{sub}</span>}</div><div style={{padding:'16px 18px'}}>{children}</div></div>)}
function Acc({q,a,open,onToggle,color}){return(<div style={{borderBottom:'0.5px solid var(--border)'}}><button onClick={onToggle} style={{width:'100%',display:'flex',justifyContent:'space-between',alignItems:'center',padding:'13px 0',background:'none',border:'none',cursor:'pointer',gap:12,textAlign:'left'}}><span style={{fontSize:13,fontWeight:600,color:'var(--text)',fontFamily:"'DM Sans',sans-serif",lineHeight:1.4}}>{q}</span><span style={{fontSize:18,color,flexShrink:0,transform:open?'rotate(45deg)':'none',transition:'transform .2s'}}>+</span></button>{open&&<p style={{fontSize:12.5,color:'var(--text-2)',lineHeight:1.75,margin:'0 0 13px',fontFamily:"'DM Sans',sans-serif"}}>{a}</p>}</div>)}
function StepsCard({steps,color}){const[exp,setExp]=useState(false);if(!steps?.length)return null;const vis=exp?steps:steps.slice(0,2);return(<div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,overflow:'hidden'}}><div style={{padding:'12px 18px',borderBottom:'0.5px solid var(--border)',display:'flex',justifyContent:'space-between'}}><span style={{fontSize:13,fontWeight:700,color:'var(--text)',fontFamily:"'Space Grotesk',sans-serif"}}>Step-by-step working</span><span style={{fontSize:11,color:'var(--text-3)'}}>{steps.length} steps</span></div><div style={{padding:'16px 18px',display:'flex',flexDirection:'column',gap:14}}>{vis.map((s,i)=>(<div key={i} style={{display:'flex',gap:14,alignItems:'flex-start'}}><div style={{width:26,height:26,borderRadius:'50%',flexShrink:0,background:i===steps.length-1?color:color+'18',border:`1.5px solid ${color}40`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,color:i===steps.length-1?'#fff':color}}>{i===steps.length-1?'✓':i+1}</div><div style={{flex:1}}>{s.label&&<div style={{fontSize:10,fontWeight:700,color,textTransform:'uppercase',letterSpacing:'.06em',marginBottom:4}}>{s.label}</div>}<div style={{fontSize:13,fontFamily:"'Space Grotesk',sans-serif",fontWeight:i===steps.length-1?700:500,background:'var(--bg-raised)',padding:'8px 12px',borderRadius:8,border:`0.5px solid ${i===steps.length-1?color+'40':'var(--border)'}`}}>{s.math}</div>{s.note&&<div style={{fontSize:11.5,color:'var(--text-3)',marginTop:4,fontStyle:'italic'}}>↳ {s.note}</div>}</div></div>))}{steps.length>2&&<button onClick={()=>setExp(e=>!e)} style={{padding:'9px',borderRadius:9,border:`1px solid ${color}30`,background:color+'08',color,fontSize:12,fontWeight:600,cursor:'pointer'}}>{exp?'▲ Hide steps':`▼ Show all ${steps.length} steps`}</button>}</div></div>)}
function MathInput({label,value,onChange,color,unit,hint}){const[f,setF]=useState(false);return(<div style={{marginBottom:14}}><div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}><label style={{fontSize:12.5,fontWeight:600,color:'var(--text)',fontFamily:"'DM Sans',sans-serif"}}>{label}</label>{hint&&<span style={{fontSize:10,color:'var(--text-3)'}}>{hint}</span>}</div><div style={{display:'flex',height:44,border:`1.5px solid ${f?color:'var(--border-2)'}`,borderRadius:9,overflow:'hidden',background:'var(--bg-card)',transition:'border-color .15s'}}><input type="number" value={value} onChange={e=>onChange(Number(e.target.value)||0)} onFocus={()=>setF(true)} onBlur={()=>setF(false)} style={{flex:1,border:'none',background:'transparent',padding:'0 14px',fontSize:17,fontWeight:700,color:'var(--text)',outline:'none',fontFamily:"'Space Grotesk',sans-serif"}}/>{unit&&<div style={{padding:'0 12px',display:'flex',alignItems:'center',background:'var(--bg-raised)',borderLeft:'1px solid var(--border)',fontSize:13,fontWeight:600,color:'var(--text-3)'}}>{unit}</div>}</div></div>)}

// ─── unit conversions ──────────────────────────────────────────
const UNITS = [
  {k:'mm2', label:'mm²', toM2:1e-6},
  {k:'cm2', label:'cm²', toM2:1e-4},
  {k:'m2',  label:'m²',  toM2:1},
  {k:'km2', label:'km²', toM2:1e6},
  {k:'in2', label:'in²', toM2:0.00064516},
  {k:'ft2', label:'ft²', toM2:0.09290304},
  {k:'yd2', label:'yd²', toM2:0.83612736},
]

// ─── real-world size references ────────────────────────────────
const SIZE_REFS = [
  {label:'A4 paper',      m2:0.0623},
  {label:'Smartphone screen', m2:0.006},
  {label:'King-size bed', m2:3.72},
  {label:'Parking space', m2:14.4},
  {label:'Tennis court',  m2:260.87},
  {label:'Football pitch',m2:7140},
  {label:'City block',    m2:40000},
  {label:'Central Park',  m2:3410000},
]

const FORMULA_TABLE = [
  {shape:'Square',       formula:'s²',               note:'s = side'},
  {shape:'Rectangle',    formula:'l × w',             note:'l = length, w = width'},
  {shape:'Circle',       formula:'πr²',               note:'r = radius'},
  {shape:'Triangle',     formula:'½ × b × h',         note:'h ⊥ base'},
  {shape:'Trapezoid',    formula:'½(a+b) × h',        note:'a,b = parallel sides'},
  {shape:'Parallelogram',formula:'b × h',             note:'h = perpendicular height'},
  {shape:'Ellipse',      formula:'π × a × b',         note:'a,b = semi-axes'},
  {shape:'Rhombus',      formula:'(d₁ × d₂) / 2',    note:'d = diagonals'},
  {shape:'Regular hexagon',formula:'(3√3/2) × s²',   note:'s = side'},
  {shape:'Regular polygon',formula:'(n×s²) / (4×tan(π/n))',note:'n = sides, s = side length'},
]

const REAL_WORLD = [
  {icon:'🏠',field:'Architecture & Construction',desc:'Every building project starts with area calculations — floor area for flooring, wall area for paint, roof area for tiles. An architect must calculate the exact area of every surface to order materials and estimate costs.',example:'A 4m × 3m room needs 12m² of flooring',color:'#f59e0b'},
  {icon:'🌾',field:'Agriculture & Land',desc:'Farmers calculate field area to determine how much seed, fertiliser, or pesticide is needed. Land is bought and sold by area (hectares, acres). 1 hectare = 10,000 m². 1 acre = 4,047 m².',example:'A 100m × 50m field = 0.5 hectares',color:'#10b981'},
  {icon:'🎨',field:'Painting & Decorating',desc:'Paint coverage is measured per m². If a paint covers 10 m²/litre and your wall is 18 m², you need 1.8 litres. Knowing area prevents expensive over-ordering.',example:'18m² wall ÷ 10m²/L = 1.8L of paint needed',color:'#3b82f6'},
  {icon:'🏙️',field:'Urban Planning & Maps',desc:'City planners measure area in km² for zoning — residential, commercial, green space. The entire Mumbai Metropolitan Region covers about 4,355 km².',example:'1 km² = 1,000,000 m² = 100 hectares',color:'#8b5cf6'},
  {icon:'💊',field:'Medicine — Body Surface Area',desc:'Drug dosing, especially chemotherapy and burn treatment, is calculated per m² of body surface area (BSA). The DuBois formula gives BSA from height and weight.',example:'Chemo dose = X mg per m² of BSA',color:'#ef4444'},
  {icon:'☀️',field:'Solar Panels & Energy',desc:'Solar panel output is rated by panel area. A 1m² solar panel produces roughly 150–200W. Knowing roof area tells you the maximum solar generation possible.',example:'10m² roof section × 180W/m² = 1.8kW peak',color:'#f59e0b'},
]

const MISTAKES = [
  'Using the slant height instead of the perpendicular height in triangle and trapezoid formulas',
  'Forgetting to square the units — doubling the side of a square quadruples the area, not doubles it',
  'Using diameter instead of radius in circle area (πr² not πd²)',
  'Adding areas in different units (mixing cm² and m²) without converting first',
]

const GLOSSARY = [
  {term:'Area',def:'The amount of 2D space enclosed within a shape. Measured in square units (cm², m², km²).'},
  {term:'Perpendicular height',def:'The height measured at a right angle to the base. This is NOT the slant height or the length of any side — it is the shortest distance between the two parallel sides.'},
  {term:'π (Pi)',def:'The ratio of a circle\'s circumference to its diameter. Approximately 3.14159265... — an irrational number that never terminates or repeats.'},
  {term:'Radius',def:'The distance from the centre of a circle to any point on its circumference. Always half the diameter.'},
  {term:'Diagonal (rhombus)',def:'A line segment connecting two non-adjacent vertices. A rhombus has two diagonals that bisect each other at right angles.'},
  {term:'Semi-axis (ellipse)',def:'Half the length of the major or minor axis. If an ellipse is 10 units wide and 6 units tall, a = 5 and b = 3.'},
  {term:'Hectare',def:'A unit of area equal to 10,000 m² (100m × 100m). Commonly used for land — 1 km² = 100 hectares.'},
]

const FAQ = [
  {q:'Why does doubling the side length of a square quadruple the area?',a:'Because area is a two-dimensional measurement. When you scale length by a factor k, area scales by k². Double the side (k=2) → area × 4. Triple the side (k=3) → area × 9. This is why a 10m × 10m room (100m²) needs four times as much flooring as a 5m × 5m room (25m²), not twice as much.'},
  {q:'What is the difference between area and perimeter?',a:'Area measures the 2D space enclosed inside a shape (square units). Perimeter measures the total length of the boundary around the shape (linear units). A shape with a small perimeter can have a large area — a circle has the maximum area for a given perimeter of any shape (isoperimetric inequality).'},
  {q:'Why is π in the area of a circle?',a:'The circle area formula A = πr² comes from calculus — integrating infinitely many thin concentric rings from radius 0 to r. Intuitively, you can cut a circle into many thin pizza slices and rearrange them into a near-rectangle of length πr and height r, giving area πr × r = πr².'},
  {q:'What is the largest shape for a given area?',a:'A circle encloses the maximum area for a given perimeter. This is called the isoperimetric inequality. Nature exploits this: cells are roughly spherical, soap bubbles are spheres, and planets are roughly spherical — all because the sphere/circle maximises volume/area for a given surface area/perimeter.'},
  {q:'How do I find the area of an irregular shape?',a:'Several methods: (1) Grid method — overlay a square grid and count squares inside; (2) Divide and conquer — split into simpler known shapes and sum; (3) Shoelace formula — for polygons with known vertices; (4) Integration — for curves. In real life, surveying software uses GPS coordinates and the shoelace formula.'},
]

// ─── MAIN COMPONENT ───────────────────────────────────────────
export default function AreaCalculator({meta,category}){
  const C = category?.color || '#3b82f6'
  const [shapeId, setShapeId] = useState('rectangle')
  const [vals,    setVals]    = useState({l:8,w:5,s:6,r:5,b:8,h:5,a:4,d1:10,d2:6})
  const [unit,    setUnit]    = useState('m2')
  const [openFaq, setOpenFaq] = useState(null)
  const [openGloss,setOpenGloss]=useState(null)

  const shape  = SHAPES.find(s=>s.id===shapeId)||SHAPES[0]
  const area   = shape.area(vals)
  const perim  = shape.perimeter ? shape.perimeter(vals) : null
  const unitObj= UNITS.find(u=>u.k===unit)||UNITS[2]
  const areaInM2 = area * (unitObj.toM2)
  const steps  = shape.steps(vals)
  const hint   = `${shape.label}: area = ${fmt(area)} ${unitObj.label}`

  // nearest real-world size
  const nearest = SIZE_REFS.reduce((best,ref)=>{
    return Math.abs(Math.log10(areaInM2+0.0001)-Math.log10(ref.m2)) < Math.abs(Math.log10(areaInM2+0.0001)-Math.log10(best.m2)) ? ref : best
  })
  const ratio = areaInM2 / nearest.m2

  return(
    <div style={{display:'flex',flexDirection:'column',gap:20}}>

      {/* ── FORMULA CARD ─── */}
      <div style={{background:`linear-gradient(135deg,${C}12,${C}06)`,border:`1px solid ${C}30`,borderRadius:14,padding:'16px 20px',display:'flex',justifyContent:'space-between',alignItems:'center',gap:16,flexWrap:'wrap'}}>
        <div>
          <div style={{fontSize:10,fontWeight:700,color:C,textTransform:'uppercase',letterSpacing:'.08em',marginBottom:6}}>{shape.label} — Formula</div>
          <div style={{fontSize:22,fontWeight:700,color:C,fontFamily:"'Space Grotesk',sans-serif"}}>{shape.formula}</div>
          <div style={{fontSize:11,color:'var(--text-3)',marginTop:4}}>{shape.formulaDesc}</div>
        </div>
        <div style={{padding:'8px 16px',background:C+'15',borderRadius:10,fontSize:28,fontWeight:700,color:C,fontFamily:"'Space Grotesk',sans-serif"}}>{fmt(area)} {unitObj.label}</div>
      </div>

      {/* ── SHAPE SELECTOR ─── */}
      <div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,padding:'14px 18px'}}>
        <div style={{fontSize:12,fontWeight:600,color:'var(--text-2)',marginBottom:12,fontFamily:"'DM Sans',sans-serif"}}>Select shape</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8}}>
          {SHAPES.map(s=>(<button key={s.id} onClick={()=>setShapeId(s.id)} style={{padding:'10px 6px',borderRadius:10,border:`1.5px solid ${shapeId===s.id?C:'var(--border-2)'}`,background:shapeId===s.id?C+'12':'var(--bg-raised)',cursor:'pointer',textAlign:'center'}}><div style={{fontSize:18,marginBottom:2}}>{s.icon}</div><div style={{fontSize:10,fontWeight:shapeId===s.id?700:500,color:shapeId===s.id?C:'var(--text-2)'}}>{s.label}</div></button>))}
        </div>
      </div>

      <CalcShell
        left={<>
          {/* inputs */}
          <div style={{fontSize:12,fontWeight:600,color:'var(--text-2)',marginBottom:12,fontFamily:"'DM Sans',sans-serif"}}>Dimensions</div>
          {shape.inputs.map(inp=>(
            <MathInput key={inp.k} label={inp.label} value={vals[inp.k]||0} onChange={v=>setVals(prev=>({...prev,[inp.k]:Math.max(0.001,v)}))} color={C} hint={inp.hint}/>
          ))}
          {/* unit selector */}
          <div style={{borderTop:'0.5px solid var(--border)',paddingTop:14,marginBottom:14}}>
            <div style={{fontSize:12,fontWeight:600,color:'var(--text-2)',marginBottom:10}}>Unit</div>
            <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
              {UNITS.map(u=>(<button key={u.k} onClick={()=>setUnit(u.k)} style={{padding:'6px 12px',borderRadius:8,border:`1.5px solid ${unit===u.k?C:'var(--border-2)'}`,background:unit===u.k?C+'12':'var(--bg-raised)',fontSize:12,fontWeight:unit===u.k?700:500,color:unit===u.k?C:'var(--text-2)',cursor:'pointer'}}>{u.label}</button>))}
            </div>
          </div>
          {/* examples */}
          <div style={{borderTop:'0.5px solid var(--border)',paddingTop:14}}>
            <div style={{fontSize:10,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:10}}>🎯 Real examples</div>
            {[
              {label:'📱 Phone screen',     shape:'rectangle', v:{l:15.1,w:7}},
              {label:'🏟️ Football pitch',  shape:'rectangle', v:{l:105,w:68}},
              {label:'🍕 12-inch pizza',    shape:'circle',    v:{r:15.24}},
              {label:'⛺ Tent floor',       shape:'triangle',  v:{b:3,h:2.6}},
              {label:'🔷 Tiles (rhombus)', shape:'rhombus',   v:{d1:30,d2:20}},
            ].map((ex,i)=>(<button key={i} onClick={()=>{setShapeId(ex.shape);setVals(prev=>({...prev,...ex.v}))}} style={{display:'block',width:'100%',padding:'8px 12px',borderRadius:8,border:'1px solid var(--border-2)',background:'var(--bg-raised)',cursor:'pointer',textAlign:'left',marginBottom:6,fontSize:12,color:'var(--text)',fontFamily:"'DM Sans',sans-serif"}} onMouseEnter={e=>e.currentTarget.style.borderColor=C+'60'} onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border-2)'}>{ex.label}</button>))}
          </div>
        </>}

        right={<>
          {/* answer */}
          <div style={{background:'var(--bg-card)',border:`1.5px solid ${C}30`,borderRadius:14,padding:'18px 20px',marginBottom:14}}>
            <div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:8}}>Area</div>
            <div style={{fontSize:52,fontWeight:700,color:C,fontFamily:"'Space Grotesk',sans-serif",lineHeight:1}}>{fmt(area)}</div>
            <div style={{fontSize:14,color:'var(--text-3)',marginTop:4,marginBottom:12}}>{unitObj.label}</div>
            {perim&&<div style={{fontSize:13,color:'var(--text-2)',marginBottom:12}}>Perimeter: <strong style={{color:C}}>{fmt(perim)} {unitObj.label.replace('²','')}</strong></div>}
            <div style={{padding:'10px 13px',background:C+'08',borderRadius:9,border:`1px solid ${C}20`,fontSize:12,color:'var(--text-2)',lineHeight:1.65}}>
              💡 {fmt(area)} {unitObj.label} is roughly {ratio>=1?`${fmt(Math.round(ratio*10)/10)}×`:`${fmt(Math.round(1/ratio*10)/10)}th the size of`} {nearest.label}.
            </div>
          </div>

          {/* live SVG shape */}
          <div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,padding:'14px 18px',marginBottom:14}}>
            <div style={{fontSize:12,fontWeight:700,color:'var(--text)',marginBottom:8,fontFamily:"'Space Grotesk',sans-serif"}}>Live shape</div>
            <div style={{background:'var(--bg-raised)',borderRadius:10,padding:'8px',border:'0.5px solid var(--border)'}}>
              {shape.svg({...vals, C})}
            </div>
          </div>

          {/* unit conversion table */}
          <div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,padding:'14px 18px',marginBottom:14}}>
            <div style={{fontSize:12,fontWeight:700,color:'var(--text)',marginBottom:10,fontFamily:"'Space Grotesk',sans-serif"}}>Area in all units</div>
            {UNITS.map(u=>(<div key={u.k} style={{display:'flex',justifyContent:'space-between',padding:'6px 0',borderBottom:'0.5px solid var(--border)'}}><span style={{fontSize:12,color:'var(--text-3)'}}>{u.label}</span><span style={{fontSize:13,fontWeight:700,color:unit===u.k?C:'var(--text)',fontFamily:"'Space Grotesk',sans-serif"}}>{fmt(area*(unitObj.toM2/u.toM2))}</span></div>))}
          </div>

          <BreakdownTable title="Summary" rows={[
            {label:'Area',    value:`${fmt(area)} ${unitObj.label}`, bold:true, highlight:true, color:C},
            ...(perim?[{label:'Perimeter', value:`${fmt(perim)} ${unitObj.label.replace('²','')}`}]:[]),
            {label:'Shape',   value:shape.label},
            {label:'Formula', value:shape.formula},
          ]}/>
          <AIHintCard hint={hint}/>
        </>}
      />

      <StepsCard steps={steps} color={C}/>

      {/* ── ALL FORMULAS TABLE ─── */}
      <Sec title="Area formulas for every shape" sub="Complete reference">
        <p style={{fontSize:12,color:'var(--text-2)',lineHeight:1.7,marginBottom:14,fontFamily:"'DM Sans',sans-serif"}}>All common 2D shapes with their area formulas, colour-coded by complexity.</p>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead>
              <tr>{['Shape','Formula','Variables'].map(h=>(<th key={h} style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textAlign:'left',padding:'8px 12px',borderBottom:'1px solid var(--border)',background:'var(--bg-raised)'}}>{h}</th>))}</tr>
            </thead>
            <tbody>
              {FORMULA_TABLE.map((row,i)=>(<tr key={i} style={{background:shapeId===row.shape.toLowerCase()?C+'08':'transparent'}}
                onMouseEnter={e=>e.currentTarget.style.background=C+'08'} onMouseLeave={e=>e.currentTarget.style.background=shapeId===row.shape.toLowerCase()?C+'08':'transparent'}>
                <td style={{padding:'9px 12px',fontSize:13,fontWeight:600,color:'var(--text)',borderBottom:'0.5px solid var(--border)'}}>{row.shape}</td>
                <td style={{padding:'9px 12px',fontSize:14,fontWeight:700,color:C,fontFamily:"'Space Grotesk',sans-serif",borderBottom:'0.5px solid var(--border)'}}>{row.formula}</td>
                <td style={{padding:'9px 12px',fontSize:11,color:'var(--text-3)',borderBottom:'0.5px solid var(--border)'}}>{row.note}</td>
              </tr>))}
            </tbody>
          </table>
        </div>
      </Sec>

      {/* ── REAL WORLD SIZE COMPARISON ─── */}
      <Sec title="How does your area compare?" sub="Real-world size reference">
        <p style={{fontSize:12,color:'var(--text-2)',lineHeight:1.7,marginBottom:14,fontFamily:"'DM Sans',sans-serif"}}>Here is how your calculated area ({fmt(area)} {unitObj.label}) compares to familiar objects and spaces.</p>
        <div style={{display:'flex',flexDirection:'column',gap:6}}>
          {SIZE_REFS.map((ref,i)=>{
            const refInUnit = ref.m2 / unitObj.toM2
            const pct = clamp((Math.min(areaInM2,ref.m2)/Math.max(areaInM2,ref.m2))*100,1,100)
            const bigger = areaInM2 > ref.m2
            return(<div key={i} style={{padding:'10px 14px',borderRadius:10,background:'var(--bg-raised)',border:'0.5px solid var(--border)'}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
                <span style={{fontSize:12,fontWeight:600,color:'var(--text)'}}>{ref.label}</span>
                <span style={{fontSize:11,color:'var(--text-3)'}}>{fmt(refInUnit)} {unitObj.label}</span>
              </div>
              <div style={{display:'flex',gap:6,alignItems:'center'}}>
                <div style={{flex:1,height:6,background:'var(--border)',borderRadius:3,overflow:'hidden'}}>
                  <div style={{height:'100%',width:`${bigger?100:pct}%`,background:C,borderRadius:3,transition:'width .4s'}}/>
                </div>
                <div style={{flex:1,height:6,background:'var(--border)',borderRadius:3,overflow:'hidden'}}>
                  <div style={{height:'100%',width:`${bigger?pct:100}%`,background:C+'60',borderRadius:3,transition:'width .4s'}}/>
                </div>
              </div>
              <div style={{fontSize:10,color:'var(--text-3)',marginTop:4}}>Your area is {bigger?`${fmt(Math.round(areaInM2/ref.m2*10)/10)}× larger`:`${fmt(Math.round(ref.m2/areaInM2*10)/10)}× smaller`} than {ref.label}</div>
            </div>)
          })}
        </div>
      </Sec>

      {/* ── SCALING EXPLORER ─── */}
      <Sec title="How area scales with size" sub="Interactive exploration">
        <p style={{fontSize:12,color:'var(--text-2)',lineHeight:1.7,marginBottom:14,fontFamily:"'DM Sans',sans-serif"}}>
          When you scale a shape, area changes by the <strong>square</strong> of the scale factor. This surprises most people.
        </p>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,marginBottom:14}}>
          {[1,2,3,4].map(factor=>{
            const scaledArea=area*factor*factor
            return(<div key={factor} style={{padding:'12px',borderRadius:10,background:factor===1?C+'15':C+'08',border:`1px solid ${factor===1?C:C+'30'}`,textAlign:'center'}}>
              <div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',marginBottom:4}}>Scale ×{factor}</div>
              <div style={{fontSize:18,fontWeight:700,color:C,fontFamily:"'Space Grotesk',sans-serif"}}>{fmt(Math.round(scaledArea*100)/100)}</div>
              <div style={{fontSize:10,color:'var(--text-3)',marginTop:2}}>{unitObj.label}</div>
              <div style={{fontSize:10,color:C,marginTop:4,fontWeight:700}}>{factor===1?'original':`${factor*factor}× area`}</div>
            </div>)
          })}
        </div>
        <div style={{padding:'12px 14px',background:C+'08',borderRadius:10,border:`1px solid ${C}20`,fontSize:12,color:'var(--text-2)',lineHeight:1.65}}>
          💡 Doubling every dimension <strong>quadruples</strong> the area. Tripling every dimension makes the area <strong>9×</strong> larger. This is why large buildings cost disproportionately more than small ones.
        </div>
      </Sec>

      {/* ── REAL WORLD USES ─── */}
      <Sec title="Where area calculations are used in real life">
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
          {REAL_WORLD.map((rw,i)=>(<div key={i} style={{padding:'12px 13px',borderRadius:11,background:rw.color+'08',border:`1px solid ${rw.color}25`}}><div style={{display:'flex',gap:8,alignItems:'center',marginBottom:7}}><span style={{fontSize:18}}>{rw.icon}</span><span style={{fontSize:12,fontWeight:700,color:rw.color}}>{rw.field}</span></div><p style={{fontSize:11.5,color:'var(--text-2)',lineHeight:1.65,margin:'0 0 7px',fontFamily:"'DM Sans',sans-serif"}}>{rw.desc}</p><div style={{fontSize:10,fontWeight:600,color:rw.color,padding:'3px 8px',background:rw.color+'15',borderRadius:6,display:'inline-block'}}>{rw.example}</div></div>))}
        </div>
      </Sec>

      {/* ── FUN FACTS ─── */}
      <Sec title="⚡ Surprising facts about area">
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {[
            {icon:'🔵',fact:"Among all shapes with the same perimeter, the circle always has the largest area. This is called the isoperimetric inequality — and it's why planets, soap bubbles, and cells are all roughly spherical."},
            {icon:'🇷🇺',fact:'Russia is the world\'s largest country at 17.1 million km². India is 3.29 million km². The entire surface of Earth is 510 million km². Only 29% (149 million km²) is land.'},
            {icon:'🧮',fact:"A square with side n has area n². The word 'square' in algebra (x²) literally comes from the geometric square — squaring a number means finding the area of a square with that side length."},
            {icon:'🌀',fact:'The Mandelbrot set has a well-defined finite area (approximately 1.506 square units) even though its boundary is a fractal with infinite length. Area and perimeter are truly independent properties.'},
          ].map((f,i)=>(<div key={i} style={{display:'flex',gap:14,padding:'12px 14px',borderRadius:11,background:'var(--bg-raised)',border:'0.5px solid var(--border)'}}><span style={{fontSize:22,flexShrink:0}}>{f.icon}</span><p style={{fontSize:12.5,color:'var(--text-2)',lineHeight:1.7,margin:0,fontFamily:"'DM Sans',sans-serif"}}>{f.fact}</p></div>))}
        </div>
      </Sec>

      {/* ── COMMON MISTAKES ─── */}
      <Sec title="⚠️ Common mistakes to avoid">
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {MISTAKES.map((m,i)=>(<div key={i} style={{display:'flex',gap:12,padding:'10px 14px',borderRadius:9,background:'#fee2e210',border:'0.5px solid #ef444420'}}><span style={{fontSize:14,flexShrink:0,color:'#ef4444',fontWeight:700}}>✗</span><span style={{fontSize:12.5,color:'var(--text-2)',lineHeight:1.6}}>{m}</span></div>))}
        </div>
      </Sec>

      {/* ── GLOSSARY ─── */}
      <Sec title="Key terms explained" sub="Tap to expand">
        {GLOSSARY.map((g,i)=>(<div key={i} style={{borderBottom:'0.5px solid var(--border)'}}><button onClick={()=>setOpenGloss(openGloss===i?null:i)} style={{width:'100%',display:'flex',justifyContent:'space-between',alignItems:'center',padding:'11px 0',background:'none',border:'none',cursor:'pointer',gap:12,textAlign:'left'}}><div style={{display:'flex',gap:10,alignItems:'center'}}><div style={{width:8,height:8,borderRadius:'50%',background:C,flexShrink:0}}/><span style={{fontSize:13,fontWeight:600,color:'var(--text)',fontFamily:"'DM Sans',sans-serif"}}>{g.term}</span></div><span style={{fontSize:16,color:C,flexShrink:0,transform:openGloss===i?'rotate(45deg)':'none',transition:'transform .2s'}}>+</span></button>{openGloss===i&&<p style={{fontSize:12.5,color:'var(--text-2)',lineHeight:1.7,margin:'0 0 12px 18px',fontFamily:"'DM Sans',sans-serif"}}>{g.def}</p>}</div>))}
      </Sec>

      {/* ── FAQ ─── */}
      <Sec title="Frequently asked questions">
        {FAQ.map((f,i)=>(<Acc key={i} q={f.q} a={f.a} open={openFaq===i} onToggle={()=>setOpenFaq(openFaq===i?null:i)} color={C}/>))}
      </Sec>

    </div>
  )
}
