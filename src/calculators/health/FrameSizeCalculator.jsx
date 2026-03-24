import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'
import HealthJourneyNext from '../../components/health/HealthJourneyNext'
import InsightRotator from '../../components/health/InsightRotator'

const clamp  = (v,a,b) => Math.min(b,Math.max(a,v))
const fmtCm  = n => `${(Math.round(n*10)/10).toFixed(1)} cm`
const fmtIn  = n => `${(Math.round(n*10)/10).toFixed(1)} in`
const fmtKg  = n => `${(Math.round(n*10)/10).toFixed(1)} kg`
const fmtLbs = n => `${(Math.round(n*2.20462*10)/10).toFixed(1)} lbs`
const fmtFtIn= (ft,i) => `${ft}′ ${i}″`

/* ── frame determination ── */
function getFrame(wristCm, hCm, sex) {
  const ratio = hCm / wristCm
  if (sex === 'male') {
    if (ratio > 10.4) return 'small'
    if (ratio >= 9.6) return 'medium'
    return 'large'
  } else {
    if (ratio > 11.0) return 'small'
    if (ratio >= 10.1) return 'medium'
    return 'large'
  }
}

const FRAMES = {
  small:  { label:'Small',  color:'#0ea5e9', soft:'#e0f2fe', textCol:'#0c4a6e', mult:0.95, pct:20, bone:'Lighter bone structure — naturally lower ideal weight range.', desc:'Small-framed individuals have thinner wrists and lighter bone density. Ideal weight formulas should be adjusted downward by ~5%.' },
  medium: { label:'Medium', color:'#10b981', soft:'#d1fae5', textCol:'#065f46', mult:1.00, pct:60, bone:'Average bone structure — standard ideal weight formulas apply.', desc:'Medium frame is the most common. Standard ideal weight formulas (Devine, Robinson, Miller) are calibrated for medium frame by default.' },
  large:  { label:'Large',  color:'#8b5cf6', soft:'#ede9fe', textCol:'#4c1d95', mult:1.06, pct:20, bone:'Denser bone structure — naturally higher ideal weight range.', desc:'Large-framed individuals have thicker wrists and higher bone density. Ideal weight formulas should be adjusted upward by ~6%.' },
}

/* ideal weight formulas (Devine, medium frame baseline) */
function idealDevine(hCm, sex) {
  const hIn = hCm / 2.54
  return sex === 'male' ? 50 + 2.3 * (hIn - 60) : 45.5 + 2.3 * (hIn - 60)
}

const GLOSSARY = [
  { term:'Frame Size',         def:'Determined by wrist circumference relative to height. Classifies bone structure as small, medium, or large — affects ideal weight calculations.' },
  { term:'Wrist Circumference',def:'Measured around the narrowest part of the wrist. Used as a proxy for overall bone structure and density.' },
  { term:'r-value (ratio)',     def:'Height ÷ wrist circumference. Used to determine frame size. Male: >10.4 = small, 9.6–10.4 = medium, <9.6 = large. Female: >11.0 = small, 10.1–11.0 = medium, <10.1 = large.' },
  { term:'Bone Density',       def:'The amount of mineral in bone tissue. Large-framed individuals generally have higher bone density and therefore weigh more at any given height.' },
  { term:'Ideal Weight Mult.', def:'Frame size adjustment: Small ×0.95, Medium ×1.00, Large ×1.06. Applied to Devine/Robinson/Miller formula results.' },
]

const FAQ = [
  { q:'What is frame size and why does it matter?',
    a:'Frame size describes your underlying bone structure — small, medium, or large — based on wrist circumference relative to height. It matters because two people of the same height and sex can have significantly different ideal weights due to bone density differences. Large-framed individuals have denser, heavier bones and should weigh more at a healthy composition than small-framed individuals of the same height.' },
  { q:'How do I measure my wrist correctly?',
    a:'Wrap a soft measuring tape around the narrowest part of your wrist — just distal (below) to the bony prominence (styloid process). Measure in centimetres. Take the measurement of your non-dominant hand. If you only have a ruler, wrap a strip of paper around your wrist, mark where it overlaps, and measure the paper.' },
  { q:'Can I determine frame size without a tape measure?',
    a:'Yes — the finger-overlap method. Wrap your thumb and middle finger around the narrowest part of your opposite wrist. If the fingers overlap: small frame. If they just touch: medium frame. If there is a gap: large frame. This method is less precise than measurement but works as a quick screen.' },
  { q:'Does frame size change with age or weight?',
    a:'No. Frame size is determined by skeletal bone structure, which is set by your late teens and does not change with age or weight gain. However, measurement accuracy can be affected by significant obesity (excess subcutaneous fat around the wrist). In this case, the finger-overlap method may give a more accurate result.' },
]

const EXAMPLES = [
  { title:'Small Frame Male',   desc:'Slim wrists, 175 cm',  hCm:175, wristCm:16.5, sex:'male',   unit:'metric' },
  { title:'Medium Frame Female',desc:'Average build, 165 cm',hCm:165, wristCm:15.5, sex:'female', unit:'metric' },
  { title:'Large Frame Male',   desc:'Broad build, 183 cm',  hCm:183, wristCm:19.5, sex:'male',   unit:'metric' },
]

const JOURNEY_ITEMS = [
  { title:'Ideal Weight',      sub:'See how frame size adjusts your target',   icon:'⚖️', path:'/health/body-metrics/ideal-weight-calculator'    },
  { title:'BMI Calculator',    sub:'Is your current weight healthy?',           icon:'📊', path:'/health/body-metrics/bmi-calculator'             },
  { title:'Body Fat %',        sub:'Go beyond weight — know your composition',  icon:'💪', path:'/health/body-metrics/body-fat-calculator'        },
]

/* ── shared components ── */
function Sec({ title, sub, children }) {
  return (
    <div style={{ background:'var(--bg-card)', border:'0.5px solid var(--border)', borderRadius:14, overflow:'hidden' }}>
      <div style={{ padding:'13px 18px', borderBottom:'0.5px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <span style={{ fontSize:13, fontWeight:700, color:'var(--text)', fontFamily:"'Space Grotesk',sans-serif" }}>{title}</span>
        {sub && <span style={{ fontSize:11, color:'var(--text-3)' }}>{sub}</span>}
      </div>
      <div style={{ padding:'16px 18px' }}>{children}</div>
    </div>
  )
}
function Acc({ q, a, open, onToggle, catColor }) {
  return (
    <div style={{ borderBottom:'0.5px solid var(--border)' }}>
      <button onClick={onToggle} style={{ width:'100%', display:'flex', justifyContent:'space-between', alignItems:'center', padding:'13px 0', background:'none', border:'none', cursor:'pointer', gap:12, textAlign:'left' }}>
        <span style={{ fontSize:13, fontWeight:600, color:'var(--text)', fontFamily:"'DM Sans',sans-serif", lineHeight:1.4 }}>{q}</span>
        <span style={{ fontSize:18, color:catColor, flexShrink:0, transition:'transform .2s', display:'inline-block', transform:open?'rotate(45deg)':'none' }}>+</span>
      </button>
      {open && <p style={{ fontSize:12.5, color:'var(--text-2)', lineHeight:1.75, margin:'0 0 13px', fontFamily:"'DM Sans',sans-serif" }}>{a}</p>}
    </div>
  )
}
function GlsTerm({ term, def, catColor }) {
  const [open, setOpen] = useState(false)
  return (
    <div onClick={() => setOpen(o => !o)} style={{ padding:'9px 12px', borderRadius:8, cursor:'pointer', transition:'all .15s', border:`1px solid ${open ? catColor + '40' : 'var(--border)'}`, background: open ? catColor + '10' : 'var(--bg-raised)' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:8 }}>
        <span style={{ fontSize:12, fontWeight:700, fontFamily:"'Space Grotesk',sans-serif", color: open ? catColor : 'var(--text)' }}>{term}</span>
        <span style={{ fontSize:14, color:catColor, flexShrink:0 }}>{open ? '−' : '+'}</span>
      </div>
      {open && <p style={{ fontSize:11.5, color:'var(--text-2)', lineHeight:1.65, margin:'6px 0 0', fontFamily:"'DM Sans',sans-serif" }}>{def}</p>}
    </div>
  )
}
function Stepper({ label, hint, value, onChange, min, max, step = 1, unit, catColor }) {
  const [editing, setEditing] = useState(false)
  const commit = r => { const n = parseFloat(r); onChange(clamp(isNaN(n) ? value : n, min, max)); setEditing(false) }
  const btn = { width:38, height:'100%', border:'none', background:'var(--bg-raised)', color:'var(--text)', fontSize:20, fontWeight:300, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontFamily:'inherit', transition:'background .1s' }
  return (
    <div style={{ marginBottom:16 }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
        <label style={{ fontSize:12.5, fontWeight:600, color:'var(--text)', fontFamily:"'DM Sans',sans-serif" }}>{label}</label>
        {hint && <span style={{ fontSize:10, color:'var(--text-3)' }}>{hint}</span>}
      </div>
      <div style={{ display:'flex', alignItems:'stretch', height:40, border:`1.5px solid ${editing ? catColor : 'var(--border-2)'}`, borderRadius:9, overflow:'hidden', background:'var(--bg-card)', boxShadow: editing ? `0 0 0 3px ${catColor}18` : 'none', transition:'border-color .15s,box-shadow .15s' }}>
        <button onMouseDown={e => { e.preventDefault(); onChange(clamp(value - step, min, max)) }} style={{ ...btn, borderRight:'1px solid var(--border)' }} onMouseEnter={e => e.currentTarget.style.background = catColor + '18'} onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-raised)'}>−</button>
        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:5 }}>
          {editing
            ? <input type="number" defaultValue={value} onBlur={e => commit(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') commit(e.target.value); if (e.key === 'Escape') setEditing(false) }} style={{ width:'55%', border:'none', background:'transparent', textAlign:'center', fontSize:15, fontWeight:700, color:'var(--text)', outline:'none', fontFamily:"'DM Sans',sans-serif" }} autoFocus />
            : <span onClick={() => setEditing(true)} style={{ fontSize:15, fontWeight:700, color:'var(--text)', cursor:'text', minWidth:36, textAlign:'center', fontFamily:"'DM Sans',sans-serif" }}>{value}</span>
          }
          <span style={{ fontSize:11, color:'var(--text-3)', fontWeight:500 }}>{unit}</span>
        </div>
        <button onMouseDown={e => { e.preventDefault(); onChange(clamp(value + step, min, max)) }} style={{ ...btn, borderLeft:'1px solid var(--border)' }} onMouseEnter={e => e.currentTarget.style.background = catColor + '18'} onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-raised)'}>+</button>
      </div>
    </div>
  )
}
function IconCardGroup({ label, options, value, onChange, catColor }) {
  return (
    <div style={{ marginBottom:18 }}>
      <div style={{ fontSize:12, fontWeight:600, color:'var(--text-2)', marginBottom:8, fontFamily:"'DM Sans',sans-serif" }}>{label}</div>
      <div style={{ display:'flex', gap:8 }}>
        {options.map(opt => {
          const active = value === opt.value
          return (
            <button key={opt.value} onClick={() => onChange(opt.value)} style={{ flex:1, padding:'12px 8px', borderRadius:10, cursor:'pointer', border:`1.5px solid ${active ? catColor : 'var(--border-2)'}`, background: active ? catColor + '12' : 'var(--bg-raised)', display:'flex', flexDirection:'column', alignItems:'center', gap:6, transition:'all .18s', fontFamily:"'DM Sans',sans-serif" }}>
              <div style={{ width:28, height:28, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke={active ? catColor : 'var(--text-3)'} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ transition:'stroke .18s' }}>{opt.icon}</svg>
              </div>
              <span style={{ fontSize:12, fontWeight: active ? 700 : 500, color: active ? catColor : 'var(--text-2)', lineHeight:1.2, textAlign:'center', transition:'color .18s' }}>{opt.label}</span>
              {opt.sub && <span style={{ fontSize:10, color: active ? catColor + 'cc' : 'var(--text-3)', lineHeight:1.2, textAlign:'center' }}>{opt.sub}</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}

const UNIT_OPTIONS = [
  { value:'metric',   label:'Metric',   sub:'cm · kg', icon:<><rect x="3" y="2" width="16" height="18" rx="2.5"/><line x1="7" y1="7.5" x2="15" y2="7.5"/><line x1="7" y1="11" x2="15" y2="11"/><line x1="7" y1="14.5" x2="12" y2="14.5"/></> },
  { value:'imperial', label:'Imperial', sub:'ft · in',  icon:<><rect x="3" y="2" width="16" height="18" rx="2.5"/><line x1="7" y1="7.5" x2="15" y2="7.5"/><line x1="7" y1="11" x2="15" y2="11"/><line x1="7" y1="14.5" x2="12" y2="14.5"/></> },
]
const SEX_OPTIONS = [
  { value:'male',   label:'Male',   icon:<><circle cx="11" cy="9" r="5"/><line x1="11" y1="14" x2="11" y2="20"/><line x1="8" y1="17" x2="14" y2="17"/></> },
  { value:'female', label:'Female', icon:<><circle cx="11" cy="8.5" r="5"/><line x1="11" y1="13.5" x2="11" y2="20"/><line x1="8" y1="17" x2="14" y2="17"/></> },
]

/* ══ SLIDE CONTENT COMPONENTS ══ */

function Slide1({ frame, f, ratio }) {
  return (
    <div>
      <div style={{ display:'flex', alignItems:'flex-end', gap:12, marginBottom:14 }}>
        <div>
          <div style={{ fontSize:52, fontWeight:700, lineHeight:1, color:f.color, fontFamily:"'Space Grotesk',sans-serif", transition:'color .3s' }}>{f.label}</div>
          <div style={{ fontSize:11, color:'var(--text-3)', marginTop:3, fontFamily:"'DM Sans',sans-serif" }}>Your frame size</div>
        </div>
        <div style={{ paddingBottom:6 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'5px 12px 5px 8px', borderRadius:20, background:f.soft, border:`1px solid ${f.color}35` }}>
            <div style={{ width:8, height:8, borderRadius:'50%', background:f.color, flexShrink:0 }}/>
            <span style={{ fontSize:12, fontWeight:700, color:f.textCol, fontFamily:"'DM Sans',sans-serif" }}>{f.label} frame</span>
          </div>
          <div style={{ fontSize:11, color:'var(--text-3)', marginTop:5, fontFamily:"'DM Sans',sans-serif" }}>
            r-value: <strong style={{ color:'var(--text)', fontWeight:600 }}>{ratio.toFixed(1)}</strong>
          </div>
        </div>
      </div>
      <div style={{ display:'flex', gap:3, height:10, borderRadius:5, overflow:'hidden', marginBottom:4 }}>
        {['small','medium','large'].map(k => (
          <div key={k} style={{ flex:1, background:FRAMES[k].color, opacity:frame===k?1:0.2, borderRadius:2, transition:'opacity .3s', display:'flex', alignItems:'center', justifyContent:'center' }}>
            {frame===k && <span style={{ fontSize:8, fontWeight:700, color:'#fff', letterSpacing:'.3px' }}>{FRAMES[k].label}</span>}
          </div>
        ))}
      </div>
      <div style={{ display:'flex', justifyContent:'space-between', fontSize:9, color:'var(--text-3)', fontFamily:"'DM Sans',sans-serif" }}>
        <span>Small</span><span>Medium</span><span>Large</span>
      </div>
    </div>
  )
}

function Slide2({ f, idealBase, wFmt }) {
  const vals = { small: idealBase * 0.95, medium: idealBase * 1.00, large: idealBase * 1.06 }
  return (
    <div>
      <div style={{ fontSize:10, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:10 }}>How frame size shifts your ideal weight</div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
        {Object.entries(vals).map(([k, v]) => {
          const fr = FRAMES[k], active = k === Object.keys(FRAMES).find(fk => FRAMES[fk] === f)
          return (
            <div key={k} style={{ background: active ? fr.color + '15' : 'var(--bg-raised)', borderRadius:10, padding:'10px 12px', border:`${active ? '1.5px' : '0.5px'} solid ${active ? fr.color : 'var(--border)'}` }}>
              <div style={{ fontSize:10, color: active ? fr.color : 'var(--text-3)', fontWeight:700, marginBottom:4 }}>{fr.label}</div>
              <div style={{ fontSize:16, fontWeight:700, color: active ? fr.color : 'var(--text-2)', fontFamily:"'Space Grotesk',sans-serif" }}>{wFmt(v)}</div>
              <div style={{ fontSize:9, color:'var(--text-3)', marginTop:2 }}>×{fr.mult.toFixed(2)}</div>
            </div>
          )
        })}
      </div>
      <p style={{ fontSize:11.5, color:'var(--text-2)', lineHeight:1.6, margin:'12px 0 0', fontFamily:"'DM Sans',sans-serif" }}>{f.desc}</p>
    </div>
  )
}

function Slide3({ f, frame }) {
  const R = 38, C = 50, circ = 2 * Math.PI * R
  const pct = f.pct
  return (
    <div style={{ display:'flex', alignItems:'center', gap:20 }}>
      <svg viewBox="0 0 100 100" width="90" height="90" style={{ flexShrink:0 }}>
        <circle cx={C} cy={C} r={R} fill="none" stroke="var(--border)" strokeWidth="10"/>
        <circle cx={C} cy={C} r={R} fill="none" stroke={f.color} strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${circ * (pct / 100)} ${circ}`}
          strokeDashoffset={circ / 4}
          transform={`rotate(-90 ${C} ${C})`}
          style={{ transition:'stroke-dasharray .6s ease' }}/>
        <text x={C} y={C - 5} textAnchor="middle" fontSize="16" fontWeight="700" fill="var(--text)" fontFamily="inherit">{pct}%</text>
        <text x={C} y={C + 9}  textAnchor="middle" fontSize="8"  fill="var(--text-3)" fontFamily="inherit">of adults</text>
      </svg>
      <div>
        <div style={{ fontSize:13, fontWeight:700, color:'var(--text)', marginBottom:6 }}>
          {frame === 'medium' ? 'Most common frame size' : frame === 'small' ? 'You have a small frame' : 'You have a large frame'}
        </div>
        <div style={{ fontSize:11, color:'var(--text-2)', lineHeight:1.65, fontFamily:"'DM Sans',sans-serif" }}>
          Approximately <strong style={{ fontWeight:600 }}>{pct}% of adults</strong> share your {FRAMES[frame].label.toLowerCase()} frame. Frame size is genetically determined by bone structure and does not change with weight or age.
        </div>
        <div style={{ display:'flex', gap:6, marginTop:10 }}>
          {['small','medium','large'].map(k => (
            <div key={k} style={{ display:'flex', alignItems:'center', gap:4 }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background:FRAMES[k].color, opacity:frame===k?1:0.35 }}/>
              <span style={{ fontSize:10, color:frame===k?FRAMES[k].color:'var(--text-3)', fontWeight:frame===k?700:400 }}>{FRAMES[k].pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Slide4({ f, frame, ratio, hCm, sex }) {
  const thresholds = sex === 'male'
    ? { small:'>10.4', medium:'9.6–10.4', large:'<9.6' }
    : { small:'>11.0', medium:'10.1–11.0', large:'<10.1' }
  return (
    <div>
      <div style={{ fontSize:10, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:10 }}>What your frame size means for your body</div>
      <div style={{ padding:'11px 14px', background:f.soft, borderRadius:10, border:`1px solid ${f.color}30`, marginBottom:12 }}>
        <p style={{ fontSize:12, color:f.textCol, margin:0, lineHeight:1.65, fontFamily:"'DM Sans',sans-serif" }}>{f.bone}</p>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
        {['small','medium','large'].map(k => (
          <div key={k} style={{ display:'flex', alignItems:'center', gap:10, padding:'7px 10px', borderRadius:7, background: frame===k ? FRAMES[k].color+'15':'var(--bg-raised)', border:`0.5px solid ${frame===k?FRAMES[k].color:'var(--border)'}` }}>
            <div style={{ width:6, height:6, borderRadius:'50%', background:FRAMES[k].color, flexShrink:0 }}/>
            <span style={{ fontSize:11, fontWeight:600, color:frame===k?FRAMES[k].color:'var(--text)', flex:1 }}>{FRAMES[k].label}</span>
            <span style={{ fontSize:10, color:'var(--text-3)', fontFamily:'monospace' }}>r {thresholds[k]}</span>
            <span style={{ fontSize:10, fontWeight:700, color:FRAMES[k].color }}>×{FRAMES[k].mult}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ══ MAIN ══ */
export default function FrameSizeCalculator({ meta, category }) {
  const catColor = category?.color || '#10b981'
  const [unit,    setUnit]    = useState('metric')
  const [hCm,     setHCm]     = useState(175)
  const [hFt,     setHFt]     = useState(5)
  const [hIn,     setHIn]     = useState(9)
  const [wristCm, setWristCm] = useState(17.0)
  const [sex,     setSex]     = useState('male')
  const [openFaq, setOpenFaq] = useState(null)

  function handleUnit(u) {
    if (u === unit) return
    if (u === 'imperial') { const ti = Math.round(hCm / 2.54); setHFt(Math.floor(ti / 12)); setHIn(ti % 12) }
    else setHCm(clamp(Math.round((hFt * 12 + hIn) * 2.54), 100, 250))
    setUnit(u)
  }
  function applyExample(ex) {
    setHCm(ex.hCm); setWristCm(ex.wristCm); setSex(ex.sex)
    const ti = Math.round(ex.hCm / 2.54); setHFt(Math.floor(ti / 12)); setHIn(ti % 12); setUnit('metric')
  }

  const isM      = unit === 'metric'
  const hCmVal   = isM ? hCm : (hFt * 12 + hIn) * 2.54
  const wristIn  = wristCm / 2.54
  const frame    = getFrame(wristCm, hCmVal, sex)
  const f        = FRAMES[frame]
  const ratio    = hCmVal / wristCm
  const idealBase = idealDevine(hCmVal, sex)
  const idealAdj  = idealBase * f.mult
  const wFmt      = kg => isM ? fmtKg(kg) : fmtLbs(kg)

  const hint = `Frame size: ${f.label} (r-value: ${ratio.toFixed(1)}). Adjusted ideal weight: ${wFmt(idealAdj)} (${fmtKg(idealAdj)} using Devine × ${f.mult}). ${f.desc}`

  const slides = [
    {
      label: 'Your result',
      content: <Slide1 frame={frame} f={f} ratio={ratio} />,
    },
    {
      label: 'Ideal weight impact',
      content: <Slide2 f={f} idealBase={idealBase} wFmt={wFmt} />,
    },
    {
      label: 'Population context',
      content: <Slide3 f={f} frame={frame} />,
    },
    {
      label: 'Frame thresholds',
      content: <Slide4 f={f} frame={frame} ratio={ratio} hCm={hCmVal} sex={sex} />,
    },
  ]

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <CalcShell
        left={<>
          <IconCardGroup label="Unit system" options={UNIT_OPTIONS} value={unit} onChange={handleUnit} catColor={catColor} />
          <div style={{ borderTop:'0.5px solid var(--border)', paddingTop:16 }}>
            <div style={{ fontSize:10, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:14 }}>Measurements</div>
            {isM
              ? <Stepper label="Height" value={hCm} onChange={setHCm} min={100} max={250} unit="cm" catColor={catColor} />
              : <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                  <Stepper label="Feet" value={hFt} onChange={setHFt} min={3} max={7} unit="ft" catColor={catColor} />
                  <Stepper label="Inches" value={hIn} onChange={setHIn} min={0} max={11} unit="in" catColor={catColor} />
                </div>
            }
            <Stepper
              label="Wrist circumference"
              hint="Around narrowest point"
              value={isM ? wristCm : parseFloat(fmtIn(wristIn))}
              onChange={v => setWristCm(isM ? v : v * 2.54)}
              min={isM ? 10 : 4} max={isM ? 30 : 12}
              step={0.1} unit={isM ? 'cm' : 'in'} catColor={catColor}
            />
          </div>
          <div style={{ borderTop:'0.5px solid var(--border)', paddingTop:16, marginTop:4 }}>
            <IconCardGroup label="Biological sex" options={SEX_OPTIONS} value={sex} onChange={setSex} catColor={catColor} />
          </div>
          {/* measurement guide */}
          <div style={{ borderTop:'0.5px solid var(--border)', paddingTop:16, marginTop:4 }}>
            <div style={{ fontSize:12, fontWeight:600, color:'var(--text-2)', marginBottom:10, fontFamily:"'DM Sans',sans-serif" }}>How to measure your wrist</div>
            <div style={{ padding:'11px 13px', background:'var(--bg-raised)', borderRadius:9, border:'0.5px solid var(--border)' }}>
              {[
                '1. Use a flexible tape measure or strip of paper.',
                '2. Locate the bony bump on the outer wrist (styloid process).',
                '3. Wrap the tape just below this bump at the narrowest point.',
                '4. Read the measurement — non-dominant wrist preferred.',
              ].map((s, i) => (
                <div key={i} style={{ display:'flex', gap:8, marginBottom: i < 3 ? 7 : 0 }}>
                  <span style={{ fontSize:11, color:catColor, fontWeight:700, flexShrink:0 }}>{i + 1}.</span>
                  <span style={{ fontSize:11, color:'var(--text-2)', lineHeight:1.5, fontFamily:"'DM Sans',sans-serif" }}>{s.slice(3)}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop:12, padding:'10px 13px', background:'var(--bg-raised)', borderRadius:9, border:'0.5px solid var(--border)' }}>
              <div style={{ fontSize:11, fontWeight:700, color:'var(--text)', marginBottom:6 }}>No tape measure? Use this method:</div>
              <p style={{ fontSize:11, color:'var(--text-2)', lineHeight:1.55, margin:0, fontFamily:"'DM Sans',sans-serif" }}>
                Wrap thumb + middle finger around wrist. <strong style={{fontWeight:600}}>Overlap = small</strong>, <strong style={{fontWeight:600}}>touching = medium</strong>, <strong style={{fontWeight:600}}>gap = large</strong>.
              </p>
            </div>
          </div>
        </>}
        right={<>
          {/* InsightRotator replaces the static card */}
          <InsightRotator catColor={catColor} title="Frame Size Result" slides={slides} autoMs={3500} />

          <BreakdownTable title="Frame Size Summary" rows={[
            { label:'Frame size',       value:f.label, bold:true, highlight:true, color:f.color },
            { label:'r-value',          value:ratio.toFixed(1) },
            { label:'Wrist',            value:isM ? fmtCm(wristCm) : fmtIn(wristIn) },
            { label:'Height',           value:isM ? fmtCm(hCmVal) : fmtFtIn(hFt, hIn) },
            { label:'Weight multiplier',value:`×${f.mult}` },
            { label:'Adj. ideal weight',value:wFmt(idealAdj), color:f.color },
            { label:'Population',       value:`~${f.pct}% of adults` },
          ]} />
          <AIHintCard hint={hint} />
        </>}
      />

      {/* Frame comparison section */}
      <Sec title="Understanding the three frame sizes" sub="What the r-value thresholds mean">
        <p style={{ fontSize:12, color:'var(--text-2)', lineHeight:1.7, marginBottom:14, fontFamily:"'DM Sans',sans-serif" }}>
          Frame size is classified by dividing your height by your wrist circumference. This ratio (r-value) reflects the relative thickness of your bone structure. Here's what each classification means.
        </p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
          {Object.entries(FRAMES).map(([k, fr]) => (
            <div key={k} style={{ padding:'12px 14px', borderRadius:10, background: frame === k ? fr.color + '15' : 'var(--bg-raised)', border:`${frame === k ? '1.5px' : '0.5px'} solid ${frame === k ? fr.color : 'var(--border)'}` }}>
              <div style={{ fontSize:13, fontWeight:700, color:fr.color, marginBottom:4 }}>{fr.label}</div>
              <div style={{ fontSize:11, color:'var(--text-2)', lineHeight:1.55, marginBottom:8, fontFamily:"'DM Sans',sans-serif" }}>{fr.desc}</div>
              <div style={{ fontSize:10, fontWeight:700, color:'var(--text-3)' }}>
                {sex === 'male'
                  ? k === 'small' ? 'r > 10.4' : k === 'medium' ? 'r 9.6–10.4' : 'r < 9.6'
                  : k === 'small' ? 'r > 11.0' : k === 'medium' ? 'r 10.1–11.0' : 'r < 10.1'
                }
              </div>
            </div>
          ))}
        </div>
      </Sec>

      {/* Ideal weight adjustment */}
      <Sec title="How frame size adjusts your ideal weight" sub="Devine formula with frame multiplier">
        <p style={{ fontSize:12, color:'var(--text-2)', lineHeight:1.7, marginBottom:14, fontFamily:"'DM Sans',sans-serif" }}>
          Standard ideal weight formulas (Devine, Robinson, Miller) are calibrated for a medium frame. Applying a frame multiplier gives you a more personalised target.
        </p>
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {Object.entries(FRAMES).map(([k, fr]) => {
            const val = idealBase * fr.mult
            const isActive = k === frame
            return (
              <div key={k} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 14px', borderRadius:9, background: isActive ? fr.color + '12' : 'var(--bg-raised)', border:`${isActive ? '1.5px' : '0.5px'} solid ${isActive ? fr.color : 'var(--border)'}` }}>
                <div style={{ width:6, height:6, borderRadius:'50%', background:fr.color, flexShrink:0 }}/>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:12, fontWeight:700, color: isActive ? fr.color : 'var(--text)' }}>{fr.label} frame{isActive ? ' (you)' : ''}</div>
                  <div style={{ fontSize:10, color:'var(--text-3)' }}>×{fr.mult} multiplier</div>
                </div>
                <div style={{ fontSize:15, fontWeight:700, color: isActive ? fr.color : 'var(--text-2)', fontFamily:"'Space Grotesk',sans-serif" }}>{wFmt(val)}</div>
              </div>
            )
          })}
        </div>
        <p style={{ fontSize:11, color:'var(--text-3)', marginTop:10, fontFamily:"'DM Sans',sans-serif", lineHeight:1.5 }}>
          Based on Devine formula baseline of {wFmt(idealBase)}. Frame multipliers: small ×0.95, medium ×1.00, large ×1.06.
        </p>
      </Sec>

      {/* Formula */}
      <Sec title="The science behind the numbers" sub="r-value formula and thresholds">
        <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:14 }}>
          {[
            { label:'r-value formula',          formula:'r = height (cm) ÷ wrist circumference (cm)' },
            { label:'Male thresholds',           formula:'Small: r > 10.4   |   Medium: 9.6–10.4   |   Large: r < 9.6' },
            { label:'Female thresholds',         formula:'Small: r > 11.0   |   Medium: 10.1–11.0  |   Large: r < 10.1' },
            { label:'Adjusted ideal weight',     formula:'Ideal (adj.) = Devine ideal weight × frame multiplier' },
          ].map(f => (
            <div key={f.label}>
              <div style={{ fontSize:10, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.05em', marginBottom:4 }}>{f.label}</div>
              <div style={{ background:'var(--bg-raised)', borderRadius:8, padding:'10px 14px', fontFamily:'monospace', fontSize:11, color:catColor, fontWeight:600, overflowX:'auto', whiteSpace:'nowrap' }}>{f.formula}</div>
            </div>
          ))}
        </div>
        <p style={{ fontSize:12, color:'var(--text-2)', lineHeight:1.75, margin:0, fontFamily:"'DM Sans',sans-serif" }}>
          The r-value method was developed by Grant et al. and is referenced by the American Dietetic Association. Wrist circumference is used as it is minimally affected by fat mass and best reflects underlying skeletal structure.
        </p>
      </Sec>

      {/* Examples */}
      <Sec title="Real world examples" sub="Click any to prefill">
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
          {EXAMPLES.map((ex, i) => {
            const f2 = getFrame(ex.wristCm, ex.hCm, ex.sex)
            const fr2 = FRAMES[f2]
            const r2 = ex.hCm / ex.wristCm
            return (
              <button key={i} onClick={() => applyExample(ex)}
                style={{ padding:14, borderRadius:10, border:'1.5px solid var(--border)', background:'var(--bg-raised)', cursor:'pointer', textAlign:'left', transition:'all .15s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = catColor; e.currentTarget.style.background = catColor + '10' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-raised)' }}>
                <div style={{ fontSize:13, fontWeight:700, color:'var(--text)', marginBottom:2 }}>{ex.title}</div>
                <div style={{ fontSize:11, color:'var(--text-3)', marginBottom:9, lineHeight:1.4 }}>{ex.desc}</div>
                {[['Height', fmtCm(ex.hCm)], ['Wrist', fmtCm(ex.wristCm)], ['Frame', fr2.label]].map(([k, v]) => (
                  <div key={k} style={{ display:'flex', justifyContent:'space-between' }}>
                    <span style={{ fontSize:10, color:'var(--text-3)' }}>{k}</span>
                    <span style={{ fontSize:10, fontWeight:600, color: k === 'Frame' ? fr2.color : catColor }}>{v}</span>
                  </div>
                ))}
                <div style={{ marginTop:8, display:'flex', alignItems:'center' }}>
                  <span style={{ fontSize:9, fontWeight:700, background:fr2.color+'18', color:fr2.color, padding:'2px 8px', borderRadius:10 }}>{fr2.label} frame</span>
                  <span style={{ fontSize:10, fontWeight:700, color:catColor, marginLeft:'auto' }}>Apply →</span>
                </div>
              </button>
            )
          })}
        </div>
      </Sec>

      <Sec title="Key terms explained" sub="Click any term to expand">
        <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:8 }}>
          {GLOSSARY.map((g, i) => <GlsTerm key={i} term={g.term} def={g.def} catColor={catColor} />)}
        </div>
      </Sec>

      <HealthJourneyNext catColor={catColor} intro="Frame size refines your ideal weight target. Use these calculators to build the complete picture of your body metrics." items={JOURNEY_ITEMS} />

      <Sec title="Frequently asked questions" sub="Everything about frame size">
        {FAQ.map((f, i) => (
          <Acc key={i} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} catColor={catColor} />
        ))}
      </Sec>
    </div>
  )
}
