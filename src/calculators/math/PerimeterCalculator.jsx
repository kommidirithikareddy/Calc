import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'

const fmt   = n => (isNaN(n)||!isFinite(n)) ? '—' : parseFloat(Number(n).toFixed(6)).toString()
const π     = Math.PI
const clamp = (v,a,b) => Math.min(b,Math.max(a,v))

// ── shared UI ─────────────────────────────────────────────────
function Sec({title,sub,children}){return(<div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,overflow:'hidden'}}><div style={{padding:'13px 18px',borderBottom:'0.5px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center'}}><span style={{fontSize:13,fontWeight:700,color:'var(--text)',fontFamily:"'Space Grotesk',sans-serif"}}>{title}</span>{sub&&<span style={{fontSize:11,color:'var(--text-3)'}}>{sub}</span>}</div><div style={{padding:'16px 18px'}}>{children}</div></div>)}
function Acc({q,a,open,onToggle,color}){return(<div style={{borderBottom:'0.5px solid var(--border)'}}><button onClick={onToggle} style={{width:'100%',display:'flex',justifyContent:'space-between',alignItems:'center',padding:'13px 0',background:'none',border:'none',cursor:'pointer',gap:12,textAlign:'left'}}><span style={{fontSize:13,fontWeight:600,color:'var(--text)',fontFamily:"'DM Sans',sans-serif",lineHeight:1.4}}>{q}</span><span style={{fontSize:18,color,flexShrink:0,transform:open?'rotate(45deg)':'none',transition:'transform .2s'}}>+</span></button>{open&&<p style={{fontSize:12.5,color:'var(--text-2)',lineHeight:1.75,margin:'0 0 13px',fontFamily:"'DM Sans',sans-serif"}}>{a}</p>}</div>)}
function StepsCard({steps,color}){const[e,setE]=useState(false);if(!steps?.length)return null;const vis=e?steps:steps.slice(0,2);return(<div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,overflow:'hidden'}}><div style={{padding:'12px 18px',borderBottom:'0.5px solid var(--border)',display:'flex',justifyContent:'space-between'}}><span style={{fontSize:13,fontWeight:700,color:'var(--text)',fontFamily:"'Space Grotesk',sans-serif"}}>Step-by-step working</span><span style={{fontSize:11,color:'var(--text-3)'}}>{steps.length} steps</span></div><div style={{padding:'16px 18px',display:'flex',flexDirection:'column',gap:14}}>{vis.map((s,i)=>(<div key={i} style={{display:'flex',gap:14}}><div style={{width:26,height:26,borderRadius:'50%',flexShrink:0,background:i===steps.length-1?color:color+'18',border:`1.5px solid ${color}40`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,color:i===steps.length-1?'#fff':color}}>{i===steps.length-1?'✓':i+1}</div><div style={{flex:1}}>{s.label&&<div style={{fontSize:10,fontWeight:700,color,textTransform:'uppercase',letterSpacing:'.06em',marginBottom:4}}>{s.label}</div>}<div style={{fontSize:13,fontFamily:"'Space Grotesk',sans-serif",background:'var(--bg-raised)',padding:'8px 12px',borderRadius:8,border:`0.5px solid ${i===steps.length-1?color+'40':'var(--border)'}`}}>{s.math}</div>{s.note&&<div style={{fontSize:11.5,color:'var(--text-3)',marginTop:4,fontStyle:'italic'}}>↳ {s.note}</div>}</div></div>))}{steps.length>2&&<button onClick={()=>setE(v=>!v)} style={{padding:'9px',borderRadius:9,border:`1px solid ${color}30`,background:color+'08',color,fontSize:12,fontWeight:600,cursor:'pointer'}}>{e?'▲ Hide steps':`▼ Show all ${steps.length} steps`}</button>}</div></div>)}
function Inp({label,value,onChange,color,unit,hint}){const[f,setF]=useState(false);return(<div style={{marginBottom:14}}><div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}><label style={{fontSize:12.5,fontWeight:600,color:'var(--text)',fontFamily:"'DM Sans',sans-serif"}}>{label}</label>{hint&&<span style={{fontSize:10,color:'var(--text-3)'}}>{hint}</span>}</div><div style={{display:'flex',height:44,border:`1.5px solid ${f?color:'var(--border-2)'}`,borderRadius:9,overflow:'hidden',background:'var(--bg-card)'}}><input type="number" value={value} onChange={e=>onChange(Math.max(0.001,Number(e.target.value)||0.001))} onFocus={()=>setF(true)} onBlur={()=>setF(false)} style={{flex:1,border:'none',background:'transparent',padding:'0 14px',fontSize:17,fontWeight:700,color:'var(--text)',outline:'none',fontFamily:"'Space Grotesk',sans-serif"}}/>{unit&&<div style={{padding:'0 12px',display:'flex',alignItems:'center',background:'var(--bg-raised)',borderLeft:'1px solid var(--border)',fontSize:13,fontWeight:600,color:'var(--text-3)'}}>{unit}</div>}</div></div>)}

// ── shapes ─────────────────────────────────────────────────────
const SHAPES = [
  { id:'rectangle', label:'Rectangle', icon:'▬',
    inputs:[{k:'l',label:'Length',def:8},{k:'w',label:'Width',def:5}],
    formula:'P = 2(l + w)',
    perim:v=>2*(v.l+v.w), area:v=>v.l*v.w,
    steps:v=>[
      {label:'Formula',math:'P = 2 × (l + w)',note:'A rectangle has 2 pairs of equal sides'},
      {label:'Sum the different sides',math:`l + w = ${v.l} + ${v.w} = ${v.l+v.w}`},
      {label:'Double it',math:`P = 2 × ${v.l+v.w} = ${fmt(2*(v.l+v.w))}`},
    ],
    svg:(v,C)=>{const W=220,H=130,sc=Math.min((W-44)/v.l,(H-44)/v.w),rw=v.l*sc,rh=v.w*sc,rx=(W-rw)/2,ry=(H-rh)/2;return(<svg viewBox={`0 0 ${W} ${H}`} width="100%"><rect x={rx} y={ry} width={rw} height={rh} fill={C+'18'} stroke={C} strokeWidth="3" rx="3"/><text x={W/2} y={ry-8} textAnchor="middle" fontSize="11" fill={C} fontWeight="700">{v.l}</text><text x={rx-8} y={H/2} textAnchor="end" dominantBaseline="middle" fontSize="11" fill={C} fontWeight="700">{v.w}</text><text x={W/2} y={H/2+5} textAnchor="middle" dominantBaseline="middle" fontSize="12" fill={C} fontWeight="700">P={fmt(2*(v.l+v.w))}</text></svg>)},
  },
  { id:'square', label:'Square', icon:'■',
    inputs:[{k:'s',label:'Side',def:6}],
    formula:'P = 4s',
    perim:v=>4*v.s, area:v=>v.s*v.s,
    steps:v=>[
      {label:'Formula',math:'P = 4 × s',note:'All 4 sides of a square are equal'},
      {label:'Calculate',math:`P = 4 × ${v.s} = ${fmt(4*v.s)}`},
    ],
    svg:(v,C)=>{const W=220,H=130,sc=Math.min((W-44)/v.s,(H-44)/v.s),side=v.s*sc,ox=(W-side)/2,oy=(H-side)/2;return(<svg viewBox={`0 0 ${W} ${H}`} width="100%"><rect x={ox} y={oy} width={side} height={side} fill={C+'18'} stroke={C} strokeWidth="3" rx="3"/><text x={W/2} y={oy-8} textAnchor="middle" fontSize="11" fill={C} fontWeight="700">s={v.s}</text><text x={W/2} y={H/2+5} textAnchor="middle" dominantBaseline="middle" fontSize="12" fill={C} fontWeight="700">P={fmt(4*v.s)}</text></svg>)},
  },
  { id:'circle', label:'Circle', icon:'●',
    inputs:[{k:'r',label:'Radius',def:5}],
    formula:'C = 2πr',
    perim:v=>2*π*v.r, area:v=>π*v.r*v.r,
    steps:v=>[
      {label:'Formula',math:'C = 2 × π × r',note:"For a circle the perimeter is called 'circumference'. π ≈ 3.14159"},
      {label:'Substitute',math:`C = 2 × ${fmt(π)} × ${v.r}`},
      {label:'Calculate',math:`C = ${fmt(2*π*v.r)}`},
    ],
    svg:(v,C)=>{const W=220,H=130,sr=Math.min(52,v.r*8),cx=W/2,cy=H/2;return(<svg viewBox={`0 0 ${W} ${H}`} width="100%"><circle cx={cx} cy={cy} r={sr} fill={C+'18'} stroke={C} strokeWidth="3"/><line x1={cx} y1={cy} x2={cx+sr} y2={cy} stroke={C} strokeWidth="1.5" strokeDasharray="4,3"/><text x={cx+sr/2} y={cy-8} textAnchor="middle" fontSize="10" fill={C} fontWeight="700">r={v.r}</text><text x={cx} y={cy+6} textAnchor="middle" dominantBaseline="middle" fontSize="11" fill={C} fontWeight="700">C={fmt(2*π*v.r)}</text></svg>)},
  },
  { id:'triangle', label:'Triangle', icon:'▲',
    inputs:[{k:'a',label:'Side a',def:5},{k:'b',label:'Side b',def:6},{k:'c',label:'Side c',def:7}],
    formula:'P = a + b + c',
    perim:v=>v.a+v.b+v.c, area:v=>{const s=(v.a+v.b+v.c)/2;return Math.sqrt(Math.max(0,s*(s-v.a)*(s-v.b)*(s-v.c)))},
    steps:v=>[
      {label:'Formula',math:'P = a + b + c',note:'Simply add all three sides'},
      {label:'Substitute',math:`P = ${v.a} + ${v.b} + ${v.c}`},
      {label:'Calculate',math:`P = ${fmt(v.a+v.b+v.c)}`},
    ],
    svg:(v,C)=>{const W=220,H=130,sc=(W-44)/v.c,bw=v.c*sc,x0=22,y0=H-18,x1=x0+bw;const cos_A=(v.b*v.b+v.c*v.c-v.a*v.a)/(2*v.b*v.c);const x2=x0+(v.b*v.b+v.c*v.c-v.a*v.a)/(2*v.c)*sc;const h2=Math.sqrt(Math.max(0,v.b*v.b-((v.b*v.b+v.c*v.c-v.a*v.a)/(2*v.c))**2))*sc;const y2=y0-h2;return(<svg viewBox={`0 0 ${W} ${H}`} width="100%"><polygon points={`${x0},${y0} ${x1},${y0} ${x2},${y2}`} fill={C+'18'} stroke={C} strokeWidth="2.5"/><text x={(x0+x1)/2} y={y0+13} textAnchor="middle" fontSize="10" fill={C} fontWeight="700">{v.c}</text><text x={(x0+x2)/2-8} y={(y0+y2)/2} textAnchor="end" dominantBaseline="middle" fontSize="10" fill={C} fontWeight="700">{v.b}</text><text x={(x1+x2)/2+8} y={(y0+y2)/2} dominantBaseline="middle" fontSize="10" fill={C} fontWeight="700">{v.a}</text></svg>)},
  },
  { id:'polygon', label:'Regular Polygon', icon:'⬡',
    inputs:[{k:'n',label:'Number of sides',def:6},{k:'s',label:'Side length',def:4}],
    formula:'P = n × s',
    perim:v=>v.n*v.s, area:v=>(v.n*v.s*v.s)/(4*Math.tan(π/v.n)),
    steps:v=>[
      {label:'Formula',math:'P = n × s',note:'Every regular polygon has all sides equal'},
      {label:'Substitute',math:`P = ${Math.round(v.n)} × ${v.s}`},
      {label:'Calculate',math:`P = ${fmt(Math.round(v.n)*v.s)}`},
    ],
    svg:(v,C)=>{const n=Math.max(3,Math.round(v.n));const W=220,H=130,r=52,cx=W/2,cy=H/2;const pts=Array.from({length:n},(_,i)=>{const a=i*(2*π/n)-π/2;return[cx+r*Math.cos(a),cy+r*Math.sin(a)]});return(<svg viewBox={`0 0 ${W} ${H}`} width="100%"><polygon points={pts.map(p=>p.join(',')).join(' ')} fill={C+'18'} stroke={C} strokeWidth="2.5"/><text x={cx} y={cy+5} textAnchor="middle" dominantBaseline="middle" fontSize="11" fill={C} fontWeight="700">P={fmt(n*v.s)}</text></svg>)},
  },
  { id:'rhombus', label:'Rhombus', icon:'◆',
    inputs:[{k:'a',label:'Side length',def:6}],
    formula:'P = 4a',
    perim:v=>4*v.a, area:null,
    steps:v=>[
      {label:'Formula',math:'P = 4 × a',note:'A rhombus has all 4 sides equal (like a square, but with different angles)'},
      {label:'Calculate',math:`P = 4 × ${v.a} = ${fmt(4*v.a)}`},
    ],
    svg:(v,C)=>{const W=220,H=130,hw=52,hh=38,cx=W/2,cy=H/2;return(<svg viewBox={`0 0 ${W} ${H}`} width="100%"><polygon points={`${cx-hw},${cy} ${cx},${cy-hh} ${cx+hw},${cy} ${cx},${cy+hh}`} fill={C+'18'} stroke={C} strokeWidth="2.5"/><text x={cx} y={cy+5} textAnchor="middle" dominantBaseline="middle" fontSize="11" fill={C} fontWeight="700">P={fmt(4*v.a)}</text></svg>)},
  },
  { id:'trapezoid', label:'Trapezoid', icon:'⏢',
    inputs:[{k:'a',label:'Side a',def:5},{k:'b',label:'Side b',def:8},{k:'c',label:'Side c',def:5},{k:'d',label:'Side d',def:6}],
    formula:'P = a + b + c + d',
    perim:v=>v.a+v.b+v.c+v.d, area:null,
    steps:v=>[
      {label:'Formula',math:'P = a + b + c + d',note:'Sum of all four sides (only two are parallel)'},
      {label:'Calculate',math:`P = ${v.a}+${v.b}+${v.c}+${v.d} = ${fmt(v.a+v.b+v.c+v.d)}`},
    ],
    svg:(v,C)=>{const W=220,H=130,bw=90,tw=55,bh=50,bx=(W-bw)/2,by=(H-bh)/2;const off=(bw-tw)/2;return(<svg viewBox={`0 0 ${W} ${H}`} width="100%"><polygon points={`${bx+off},${by} ${bx+off+tw},${by} ${bx+bw},${by+bh} ${bx},${by+bh}`} fill={C+'18'} stroke={C} strokeWidth="2.5"/><text x={W/2} y={by+bh+14} textAnchor="middle" fontSize="11" fill={C} fontWeight="700">P={fmt(v.a+v.b+v.c+v.d)}</text></svg>)},
  },
]

// ── unit data ──────────────────────────────────────────────────
const UNITS=[{k:'mm',l:'mm',toM:0.001},{k:'cm',l:'cm',toM:0.01},{k:'m',l:'m',toM:1},{k:'km',l:'km',toM:1000},{k:'in',l:'in',toM:0.0254},{k:'ft',l:'ft',toM:0.3048},{k:'yd',l:'yd',toM:0.9144}]

const FORMULA_TABLE=[
  {shape:'Square',            formula:'4s',          note:'s = side'},
  {shape:'Rectangle',         formula:'2(l+w)',       note:'l=length, w=width'},
  {shape:'Circle',            formula:'2πr = πd',     note:'r=radius, d=diameter'},
  {shape:'Triangle',          formula:'a+b+c',        note:'sum of all sides'},
  {shape:'Equilateral △',     formula:'3s',           note:'all sides equal'},
  {shape:'Rhombus',           formula:'4a',           note:'a=side length'},
  {shape:'Parallelogram',     formula:'2(a+b)',        note:'a,b are adjacent sides'},
  {shape:'Trapezoid',         formula:'a+b+c+d',      note:'all 4 sides'},
  {shape:'Regular n-gon',     formula:'n×s',          note:'n=sides, s=side length'},
  {shape:'Semicircle',        formula:'πr + 2r',      note:'curved part + diameter'},
  {shape:'Sector (angle θ)',  formula:'rθ + 2r',      note:'θ in radians'},
  {shape:'Annulus',           formula:'2π(R+r)',      note:'R=outer, r=inner radius'},
]

const REAL_WORLD=[
  {icon:'🏡',field:'Fencing a Garden',desc:'Every metre of fence costs money. Knowing perimeter exactly prevents waste. A 12m×8m garden needs 40m of fencing. At ₹200/m that is ₹8,000.',example:'12×8m garden → 40m fence → ₹8,000',color:'#10b981'},
  {icon:'🏃',field:'Running Tracks',desc:'A standard athletic track is exactly 400m in lane 1. Race distances (100m, 400m, 800m, 1500m) are all multiples of this perimeter.',example:'Standard athletics track = 400m lap',color:'#3b82f6'},
  {icon:'🖼️',field:'Picture Frames & Borders',desc:'The length of frame material needed equals the perimeter. A 60cm×45cm photo needs 2×(60+45) = 210cm = 2.1m of frame.',example:'60×45cm photo → 2.1m of frame',color:'#f59e0b'},
  {icon:'🧵',field:'Sewing & Fabric',desc:'Sewing a border, hem, or trim requires perimeter of the piece. A tailor cutting fabric needs perimeter to estimate binding material.',example:'Tablecloth 150×90cm → 480cm binding',color:'#8b5cf6'},
  {icon:'🗺️',field:'Country Borders',desc:"A country's border length is its perimeter. India has ~15,200km of land border and ~7,516km of coastline. These are crucial for security planning.",example:"India's total border: ~22,700km",color:'#ef4444'},
  {icon:'⚡',field:'Electrical Wiring',desc:'Running wire around the perimeter of a room (skirting board conduit) needs perimeter calculation. Underestimating means mid-job hardware trips.',example:'6×5m room → 22m perimeter wire run',color:'#f97316'},
]

const MISTAKES=[
  'Confusing perimeter (length of boundary) with area (space inside) — they have different units',
  'For circles, using diameter instead of radius in C=2πr — this gives double the correct answer',
  'Forgetting that "perimeter" of a circle is specifically called "circumference"',
  'Adding only 3 sides of a rectangle instead of all 4 (or forgetting to double)',
]

const GLOSSARY=[
  {term:'Perimeter',def:'The total length of the boundary of a 2D shape. From Greek: peri (around) + metron (measure). Measured in linear units (m, cm, km).'},
  {term:'Circumference',def:'The perimeter specifically of a circle. C = 2πr = πd. The word comes from Latin: circum (around) + ferre (carry).'},
  {term:'Boundary',def:'The outer edge of a shape. The perimeter is the total length of this boundary.'},
  {term:'Regular polygon',def:'A polygon with all sides equal AND all angles equal. Perimeter = n × s where n is the number of sides.'},
  {term:'π (Pi)',def:'The ratio of any circle\'s circumference to its diameter. π ≈ 3.14159... — irrational and transcendental, never terminates or repeats.'},
  {term:'Semiperimeter',def:'Half the perimeter. s = P/2. Used in Heron\'s formula for triangle area and in other geometry formulas.'},
]

const FAQ=[
  {q:'Can two shapes with the same area have different perimeters?',a:'Absolutely — and this is one of the most counterintuitive facts in geometry. A 4×4 square has area 16m² and perimeter 16m. A 1×16 rectangle also has area 16m² but perimeter 34m. Among all shapes with the same area, the circle has the smallest perimeter (isoperimetric inequality). Nature exploits this: round soap bubbles and spherical cells minimise surface relative to their volume.'},
  {q:'Can two shapes with the same perimeter have different areas?',a:'Yes — this is the same isoperimetric inequality from the other direction. A 5×5 square has perimeter 20m and area 25m². A 1×9 rectangle also has perimeter 20m but area only 9m². The circle (or sphere in 3D) always maximises area/volume for a given perimeter/surface. This is why cells, bubbles, and planets are round.'},
  {q:'What is the perimeter of a fractal like a snowflake?',a:"A fractal curve's perimeter can be infinite! The Koch snowflake is a famous example — at each iteration you add more detail to the edge, making it longer. After infinite iterations, the snowflake has a finite area but an infinite perimeter. This is why coastlines, measured at finer and finer scales, appear to get longer without bound (the Coastline Paradox)."},
  {q:'Why is the circumference formula 2πr and not something simpler?',a:"Because π is defined as the ratio C/d = C/(2r), rearranging gives C = πd = 2πr. π is not a convenient round number — it's irrational. But any circle, regardless of size, has exactly the same C/d ratio. That's what makes π fundamental."},
]

export default function PerimeterCalculator({meta,category}){
  const C = category?.color||'#3b82f6'
  const [shId,  setShId]  = useState('rectangle')
  const [vals,  setVals]  = useState({l:8,w:5,s:6,r:5,a:5,b:6,c:7,d:6,n:6})
  const [unit,  setUnit]  = useState('m')
  const [cost,  setCost]  = useState(200)
  const [openFaq, setFaq] = useState(null)
  const [openGloss,setGl] = useState(null)

  const sh    = SHAPES.find(s=>s.id===shId)||SHAPES[0]
  const perim = sh.perim(vals)
  const area  = sh.area?sh.area(vals):null
  const steps = sh.steps(vals)
  const uObj  = UNITS.find(u=>u.k===unit)||UNITS[2]
  const perimM= perim * uObj.toM

  // isoperimetric: same perimeter, different shapes
  const isoShapes=[
    {label:'Square',    area:perim**2/16},
    {label:'Rectangle\n(2:1)',area:(perim/6)*(perim/3)},
    {label:'Equilateral\nTriangle',area:(Math.sqrt(3)/36)*perim**2},
    {label:'Circle',    area:perim**2/(4*π)},
  ]

  return(
    <div style={{display:'flex',flexDirection:'column',gap:20}}>

      {/* FORMULA BANNER */}
      <div style={{background:`linear-gradient(135deg,${C}12,${C}06)`,border:`1px solid ${C}30`,borderRadius:14,padding:'16px 20px',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12}}>
        <div>
          <div style={{fontSize:10,fontWeight:700,color:C,textTransform:'uppercase',letterSpacing:'.08em',marginBottom:6}}>{sh.label} — Perimeter Formula</div>
          <div style={{fontSize:24,fontWeight:700,color:C,fontFamily:"'Space Grotesk',sans-serif"}}>{sh.formula}</div>
        </div>
        <div style={{padding:'10px 20px',background:C+'18',borderRadius:12,textAlign:'center'}}>
          <div style={{fontSize:11,color:'var(--text-3)',marginBottom:2}}>Perimeter</div>
          <div style={{fontSize:32,fontWeight:700,color:C,fontFamily:"'Space Grotesk',sans-serif"}}>{fmt(perim)}</div>
          <div style={{fontSize:11,color:'var(--text-3)'}}>{uObj.l}</div>
        </div>
      </div>

      {/* SHAPE SELECTOR */}
      <div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,padding:'14px 18px'}}>
        <div style={{fontSize:12,fontWeight:600,color:'var(--text-2)',marginBottom:12,fontFamily:"'DM Sans',sans-serif"}}>Select shape</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8}}>
          {SHAPES.map(s=>(
            <button key={s.id} onClick={()=>setShId(s.id)} style={{padding:'10px 4px',borderRadius:10,border:`1.5px solid ${shId===s.id?C:'var(--border-2)'}`,background:shId===s.id?C+'12':'var(--bg-raised)',cursor:'pointer',textAlign:'center'}}>
              <div style={{fontSize:18,marginBottom:2}}>{s.icon}</div>
              <div style={{fontSize:10,fontWeight:shId===s.id?700:500,color:shId===s.id?C:'var(--text-2)',lineHeight:1.2}}>{s.label}</div>
            </button>
          ))}
        </div>
      </div>

      <CalcShell
        left={<>
          {/* inputs */}
          <div style={{fontSize:12,fontWeight:600,color:'var(--text-2)',marginBottom:12,fontFamily:"'DM Sans',sans-serif"}}>Dimensions</div>
          {sh.inputs.map(inp=>(
            <Inp key={inp.k} label={inp.label} value={vals[inp.k]||inp.def} onChange={v=>setVals(p=>({...p,[inp.k]:v}))} color={C}/>
          ))}

          {/* unit selector */}
          <div style={{borderTop:'0.5px solid var(--border)',paddingTop:14,marginBottom:14}}>
            <div style={{fontSize:12,fontWeight:600,color:'var(--text-2)',marginBottom:8,fontFamily:"'DM Sans',sans-serif"}}>Units</div>
            <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
              {UNITS.map(u=>(
                <button key={u.k} onClick={()=>setUnit(u.k)} style={{padding:'5px 11px',borderRadius:7,border:`1.5px solid ${unit===u.k?C:'var(--border-2)'}`,background:unit===u.k?C+'12':'var(--bg-raised)',fontSize:12,fontWeight:unit===u.k?700:500,color:unit===u.k?C:'var(--text-2)',cursor:'pointer'}}>{u.l}</button>
              ))}
            </div>
          </div>

          {/* cost estimator */}
          <div style={{background:'var(--bg-raised)',borderRadius:11,padding:'12px 14px',border:'0.5px solid var(--border)',marginBottom:14}}>
            <div style={{fontSize:12,fontWeight:700,color:'var(--text)',marginBottom:10}}>💰 Border/fence cost estimator</div>
            <Inp label="Cost per unit" value={cost} onChange={setCost} color={C} unit="₹"/>
            <div style={{padding:'10px 12px',background:C+'12',borderRadius:9,border:`1px solid ${C}25`}}>
              <div style={{fontSize:11,color:'var(--text-3)',marginBottom:2}}>Total cost</div>
              <div style={{fontSize:22,fontWeight:700,color:C,fontFamily:"'Space Grotesk',sans-serif"}}>₹{fmt(Math.round(perim*cost))}</div>
              <div style={{fontSize:10,color:'var(--text-3)',marginTop:2}}>{fmt(perim)} {uObj.l} × ₹{cost}/{uObj.l}</div>
            </div>
          </div>

          {/* quick examples */}
          <div style={{borderTop:'0.5px solid var(--border)',paddingTop:14}}>
            <div style={{fontSize:10,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:10}}>🎯 Real examples</div>
            {[
              {s:'rectangle',v:{l:20,w:10},l:'🏡 Garden 20×10m'},
              {s:'circle',   v:{r:7},      l:'🔵 Round pond r=7m'},
              {s:'square',   v:{s:5},      l:'🏠 Room 5×5m'},
              {s:'triangle', v:{a:3,b:4,c:5},l:'📐 3-4-5 triangle'},
              {s:'polygon',  v:{n:6,s:3},  l:'⬡ Hexagon s=3'},
            ].map((ex,i)=>(
              <button key={i} onClick={()=>{setShId(ex.s);setVals(p=>({...p,...ex.v}))}} style={{display:'block',width:'100%',padding:'8px 12px',borderRadius:8,border:'1px solid var(--border-2)',background:'var(--bg-raised)',cursor:'pointer',textAlign:'left',marginBottom:6,fontSize:12,color:'var(--text)',fontFamily:"'DM Sans',sans-serif"}}
                onMouseEnter={e=>e.currentTarget.style.borderColor=C+'60'} onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border-2)'}>{ex.l}</button>
            ))}
          </div>
        </>}

        right={<>
          {/* result card */}
          <div style={{background:'var(--bg-card)',border:`1.5px solid ${C}30`,borderRadius:14,padding:'18px 20px',marginBottom:14}}>
            <div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:8}}>{shId==='circle'?'Circumference':'Perimeter'}</div>
            <div style={{fontSize:52,fontWeight:700,color:C,fontFamily:"'Space Grotesk',sans-serif",lineHeight:1}}>{fmt(perim)}</div>
            <div style={{fontSize:14,color:'var(--text-3)',marginTop:4,marginBottom:12}}>{uObj.l}</div>
            {area!=null&&<div style={{fontSize:13,color:'var(--text-2)',marginBottom:10}}>Area enclosed: <strong style={{color:C}}>{fmt(area)} {uObj.l}²</strong></div>}
            <div style={{padding:'10px 13px',background:C+'08',borderRadius:9,border:`1px solid ${C}20`,fontSize:12,color:'var(--text-2)',lineHeight:1.65}}>
              💡 If you walked around this {sh.label} you would travel exactly {fmt(perim)} {uObj.l}. To fence it at ₹{cost}/{uObj.l} costs ₹{fmt(Math.round(perim*cost))}.
            </div>
          </div>

          {/* live shape SVG */}
          <div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,padding:'14px 18px',marginBottom:14}}>
            <div style={{fontSize:12,fontWeight:700,color:'var(--text)',marginBottom:8,fontFamily:"'Space Grotesk',sans-serif"}}>Shape outline</div>
            <div style={{background:'var(--bg-raised)',borderRadius:10,padding:'8px',border:'0.5px solid var(--border)'}}>
              {sh.svg(vals,C)}
            </div>
          </div>

          {/* unit conversion */}
          <div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,padding:'14px 18px',marginBottom:14}}>
            <div style={{fontSize:12,fontWeight:700,color:'var(--text)',marginBottom:10,fontFamily:"'Space Grotesk',sans-serif"}}>Perimeter in all units</div>
            {UNITS.map(u=>(
              <div key={u.k} style={{display:'flex',justifyContent:'space-between',padding:'6px 0',borderBottom:'0.5px solid var(--border)'}}>
                <span style={{fontSize:12,color:'var(--text-3)'}}>{u.l}</span>
                <span style={{fontSize:13,fontWeight:700,color:unit===u.k?C:'var(--text)',fontFamily:"'Space Grotesk',sans-serif"}}>{fmt(perimM/u.toM)}</span>
              </div>
            ))}
          </div>

          <BreakdownTable title="Summary" rows={[
            {label:shId==='circle'?'Circumference':'Perimeter', value:`${fmt(perim)} ${uObj.l}`, bold:true, highlight:true, color:C},
            ...(area!=null?[{label:'Area',value:`${fmt(area)} ${uObj.l}²`}]:[]),
            {label:'Shape',   value:sh.label},
            {label:'Formula', value:sh.formula},
          ]}/>
          <AIHintCard hint={`${sh.label} perimeter = ${fmt(perim)} ${uObj.l}`}/>
        </>}
      />

      <StepsCard steps={steps} color={C}/>

      {/* ISOPERIMETRIC COMPARISON */}
      <Sec title="Same perimeter — very different areas" sub="Isoperimetric inequality">
        <p style={{fontSize:12,color:'var(--text-2)',lineHeight:1.7,marginBottom:14,fontFamily:"'DM Sans',sans-serif"}}>
          These four shapes all have exactly the same perimeter as your {sh.label} ({fmt(perim)} {uObj.l}), yet their enclosed areas are very different. The <strong style={{color:C}}>circle always encloses the maximum area</strong> for any given perimeter — this is the Isoperimetric Inequality.
        </p>
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:10}}>
          {isoShapes.map((s,i)=>{
            const pct=clamp((s.area/isoShapes[3].area)*100,2,100)
            const colors=[C,'#10b981','#f59e0b','#8b5cf6']
            return(
              <div key={i} style={{padding:'12px 14px',borderRadius:11,background:colors[i]+'08',border:`1px solid ${colors[i]}25`}}>
                <div style={{fontSize:12,fontWeight:700,color:colors[i],marginBottom:8}}>{s.label.replace('\n',' ')}</div>
                <div style={{fontSize:20,fontWeight:700,color:colors[i],fontFamily:"'Space Grotesk',sans-serif",marginBottom:6}}>{fmt(Math.round(s.area*100)/100)} {uObj.l}²</div>
                <div style={{height:6,background:'var(--border)',borderRadius:3,overflow:'hidden'}}>
                  <div style={{height:'100%',width:`${pct}%`,background:colors[i],borderRadius:3,transition:'width .5s'}}/>
                </div>
                <div style={{fontSize:10,color:'var(--text-3)',marginTop:4}}>{fmt(Math.round(pct))}% of circle's area</div>
              </div>
            )
          })}
        </div>
        <div style={{marginTop:12,padding:'12px 14px',background:C+'08',borderRadius:10,border:`1px solid ${C}20`,fontSize:12,color:'var(--text-2)',lineHeight:1.65}}>
          💡 A circle with perimeter {fmt(perim)}{uObj.l} encloses {fmt(Math.round(isoShapes[3].area*100)/100)}{uObj.l}². A thin rectangle with the same perimeter might enclose almost nothing. This is why circular stadiums, round tables, and spherical cells are so efficient.
        </div>
      </Sec>

      {/* ALL FORMULAS TABLE */}
      <Sec title="Perimeter formulas for every shape" sub="Complete reference">
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead>
              <tr>{['Shape','Formula','Notes'].map(h=>(
                <th key={h} style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textAlign:'left',padding:'8px 12px',borderBottom:'1px solid var(--border)',background:'var(--bg-raised)'}}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {FORMULA_TABLE.map((r,i)=>(
                <tr key={i} onMouseEnter={e=>e.currentTarget.style.background=C+'08'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <td style={{padding:'8px 12px',fontSize:13,fontWeight:600,color:'var(--text)',borderBottom:'0.5px solid var(--border)'}}>{r.shape}</td>
                  <td style={{padding:'8px 12px',fontSize:14,fontWeight:700,color:C,fontFamily:"'Space Grotesk',sans-serif",borderBottom:'0.5px solid var(--border)'}}>{r.formula}</td>
                  <td style={{padding:'8px 12px',fontSize:11,color:'var(--text-3)',borderBottom:'0.5px solid var(--border)'}}>{r.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Sec>

      {/* REAL WORLD */}
      <Sec title="Where perimeter calculations are used in real life">
        <RealWorld items={REAL_WORLD} color={C}/>
      </Sec>

      {/* FUN FACTS */}
      <Sec title="⚡ Surprising facts about perimeter">
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {[
            {icon:'🏝️',fact:"The Coastline Paradox: the measured length of a country's coastline increases without limit as you measure at finer scales. At 1km resolution, Britain's coast is 2,800km. At 100m resolution it grows to 17,000km. There is no true single answer."},
            {icon:'⚗️',fact:"Koch Snowflake: starting from an equilateral triangle and repeatedly adding smaller triangles to each edge creates a shape with infinite perimeter but finite area. Area = 8/5 of the original triangle. Perimeter → ∞."},
            {icon:'🌍',fact:"Earth's equatorial circumference is 40,075 km. The polar circumference is slightly less at 40,008 km — Earth is an oblate spheroid (slightly squashed at poles). Eratosthenes calculated Earth's circumference in 240 BC using shadow angles — getting within 2% of the correct answer."},
            {icon:'🔢',fact:"The number π was first calculated to high precision specifically to find circle perimeters. Archimedes (287-212 BC) proved 3 10/71 < π < 3 1/7 by inscribing and circumscribing regular 96-gons around a circle."},
          ].map((f,i)=>(
            <div key={i} style={{display:'flex',gap:14,padding:'12px 14px',borderRadius:11,background:'var(--bg-raised)',border:'0.5px solid var(--border)'}}>
              <span style={{fontSize:22,flexShrink:0}}>{f.icon}</span>
              <p style={{fontSize:12.5,color:'var(--text-2)',lineHeight:1.7,margin:0,fontFamily:"'DM Sans',sans-serif"}}>{f.fact}</p>
            </div>
          ))}
        </div>
      </Sec>

      {/* COMMON MISTAKES */}
      <Sec title="⚠️ Common mistakes to avoid">
        <MistakesList items={MISTAKES}/>
      </Sec>

      {/* GLOSSARY */}
      <Sec title="Key terms explained" sub="Tap to expand">
        <GlossaryCard items={GLOSSARY} color={C}/>
      </Sec>

      {/* FAQ */}
      <Sec title="Frequently asked questions">
        {FAQ.map((f,i)=>(
          <Acc key={i} q={f.q} a={f.a} open={openFaq===i} onToggle={()=>setFaq(openFaq===i?null:i)} color={C}/>
        ))}
      </Sec>

    </div>
  )
}

// ── internal helpers used in JSX above ─────────────────────────
function RealWorld({items}){return(<div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>{items.map((rw,i)=>(<div key={i} style={{padding:'12px 13px',borderRadius:11,background:rw.color+'08',border:`1px solid ${rw.color}25`}}><div style={{display:'flex',gap:8,alignItems:'center',marginBottom:7}}><span style={{fontSize:18}}>{rw.icon}</span><span style={{fontSize:12,fontWeight:700,color:rw.color}}>{rw.field}</span></div><p style={{fontSize:11.5,color:'var(--text-2)',lineHeight:1.65,margin:'0 0 7px',fontFamily:"'DM Sans',sans-serif"}}>{rw.desc}</p><div style={{fontSize:10,fontWeight:600,color:rw.color,padding:'3px 8px',background:rw.color+'15',borderRadius:6,display:'inline-block'}}>{rw.example}</div></div>))}</div>)}
function MistakesList({items}){return(<div style={{display:'flex',flexDirection:'column',gap:8}}>{items.map((m,i)=>(<div key={i} style={{display:'flex',gap:12,padding:'10px 14px',borderRadius:9,background:'#fee2e210',border:'0.5px solid #ef444420'}}><span style={{fontSize:14,flexShrink:0,color:'#ef4444',fontWeight:700}}>✗</span><span style={{fontSize:12.5,color:'var(--text-2)',lineHeight:1.6}}>{m}</span></div>))}</div>)}
function GlossaryCard({items,color}){const[open,setOpen]=useState(null);return(<>{items.map((g,i)=>(<div key={i} style={{borderBottom:'0.5px solid var(--border)'}}><button onClick={()=>setOpen(open===i?null:i)} style={{width:'100%',display:'flex',justifyContent:'space-between',alignItems:'center',padding:'11px 0',background:'none',border:'none',cursor:'pointer',gap:12,textAlign:'left'}}><div style={{display:'flex',gap:10,alignItems:'center'}}><div style={{width:8,height:8,borderRadius:'50%',background:color,flexShrink:0}}/><span style={{fontSize:13,fontWeight:600,color:'var(--text)',fontFamily:"'DM Sans',sans-serif"}}>{g.term}</span></div><span style={{fontSize:16,color,flexShrink:0,transform:open===i?'rotate(45deg)':'none',transition:'transform .2s'}}>+</span></button>{open===i&&<p style={{fontSize:12.5,color:'var(--text-2)',lineHeight:1.7,margin:'0 0 12px 18px',fontFamily:"'DM Sans',sans-serif"}}>{g.def}</p>}</div>))}</>)}
