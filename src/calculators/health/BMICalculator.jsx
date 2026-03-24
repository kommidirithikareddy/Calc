import { useState, useRef, useEffect } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'
import HealthJourneyNext from '../../components/health/HealthJourneyNext'

/* ── zone data ─────────────────────────────────────── */
const ZONES = [
  { key:'suw', label:'Severely Underweight', short:'Sev. Underweight', range:'< 16',    min:10,  max:16,   color:'#1a8faa', soft:'#e0f4fa', advice:'Immediate medical attention recommended. A healthcare professional can help you build a safe plan to gain weight.' },
  { key:'uw',  label:'Underweight',          short:'Underweight',      range:'16–18.5', min:16,  max:18.5, color:'#2aa8c0', soft:'#d0eef5', advice:'You may benefit from increasing caloric intake with nutrient-dense foods. Consider consulting a dietitian.' },
  { key:'nm',  label:'Normal',               short:'Normal',           range:'18.5–25', min:18.5,max:25,   color:'#22a355', soft:'#d6f2e0', advice:'Great work maintaining a healthy weight. Keep up balanced nutrition and regular physical activity.' },
  { key:'ow',  label:'Overweight',           short:'Overweight',       range:'25–30',   min:25,  max:30,   color:'#d4920a', soft:'#fdf3d0', advice:'Small lifestyle changes — 30 min daily walks and reducing processed foods — can bring you back to normal range.' },
  { key:'ob1', label:'Obese Class I',        short:'Obese I',          range:'30–35',   min:30,  max:35,   color:'#d46a0a', soft:'#fde8d0', advice:'Consult your doctor about a structured weight management plan. Even 5–10% weight loss significantly reduces risk.' },
  { key:'ob2', label:'Obese Class II',       short:'Obese II',         range:'35–40',   min:35,  max:40,   color:'#c03818', soft:'#fdd8d0', advice:'Medical supervision is recommended. Structured programs combining diet, activity, and support are most effective.' },
  { key:'ob3', label:'Obese Class III',      short:'Obese III',        range:'> 40',    min:40,  max:50,   color:'#8f1010', soft:'#f8c8c8', advice:'Please speak with a healthcare provider as soon as possible. Effective medical treatments are available.' },
]

const WEIGHT_OBJECTS = [
  { kg:1,  label:'1 litre bottle of water' }, { kg:2,  label:'a bag of sugar' },
  { kg:3,  label:'a newborn baby' },           { kg:5,  label:'a bag of flour' },
  { kg:7,  label:'a large bag of dog food' },  { kg:10, label:'a full-size kettlebell' },
  { kg:15, label:'a carry-on suitcase (full)'},{ kg:20, label:'a 20 kg bag of rice' },
  { kg:25, label:'a large car tyre' },          { kg:30, label:'a small child (age 8)' },
  { kg:40, label:'a large suitcase packed full'},
]

const ACTIVITY_FACTORS = [
  { key:'sed',   label:'Sedentary',         sub:'Desk job, little exercise',  factor:1.2   },
  { key:'light', label:'Lightly active',    sub:'1–3 days/week exercise',     factor:1.375 },
  { key:'mod',   label:'Moderately active', sub:'3–5 days/week exercise',     factor:1.55  },
  { key:'high',  label:'Very active',       sub:'6–7 days/week exercise',     factor:1.725 },
  { key:'xhigh', label:'Athlete',           sub:'Twice daily training',       factor:1.9   },
]

const FAQ = [
  { q:'What is BMI and why does it matter?',
    a:'BMI (Body Mass Index) is your weight in kilograms divided by your height in metres squared. It\'s a quick population-level screening tool that correlates with body fat and associated health risks like type 2 diabetes, heart disease, and hypertension. It matters because it gives you a standardised baseline — not a diagnosis, but a useful first signal.' },
  { q:'Is BMI accurate for everyone?',
    a:'No. BMI cannot distinguish muscle from fat. Muscular athletes often show "Overweight" BMI despite very low body fat. It also underestimates risk in older adults (who lose muscle with age) and has different risk thresholds across ethnicities — many Asian health authorities use 23 as the overweight cutoff instead of 25. Always pair BMI with waist circumference and body fat % for a fuller picture.' },
  { q:'What is a healthy weight range for my height?',
    a:'The healthy weight range corresponds to a BMI of 18.5 to 24.9. This calculator shows your exact range in kg or lbs. The "ideal weight" shown is based on BMI 22 — the mathematical midpoint of the normal range — which is the most commonly cited target.' },
  { q:'What is BMR and how is it different from TDEE?',
    a:'BMR (Basal Metabolic Rate) is the number of calories your body burns at complete rest — just to keep organs functioning. TDEE (Total Daily Energy Expenditure) is BMR multiplied by an activity factor. To maintain your current weight, eat at TDEE. To lose weight, create a deficit of 300–500 kcal/day. This calculator uses the Mifflin-St Jeor equation, validated as the most accurate for general use.' },
  { q:'How long will it take to reach a healthy BMI?',
    a:'A safe, sustainable rate of weight loss is 0.5–1 kg per week (created by a 500–1000 kcal daily deficit). Faster loss risks muscle loss and nutritional deficiencies. The timeline shown in this calculator uses 0.75 kg/week as the default — a realistic, healthy pace for most people.' },
]

const GLOSSARY = [
  { term:'BMI',             def:'Body Mass Index — weight (kg) ÷ height² (m²). A proxy for body fatness used for population screening.' },
  { term:'BMR',             def:'Basal Metabolic Rate — calories your body burns at complete rest to maintain organ function. Calculated using Mifflin-St Jeor.' },
  { term:'TDEE',            def:'Total Daily Energy Expenditure — your BMR × activity factor. This is how many calories you burn each day in reality.' },
  { term:'Ideal Weight',    def:'Weight corresponding to BMI 22 (midpoint of normal range). Not a strict target — healthy range 18.5–24.9 is equally valid.' },
  { term:'WHO Cutoffs',     def:'World Health Organisation thresholds: <18.5 underweight, 18.5–24.9 normal, 25–29.9 overweight, ≥30 obese.' },
  { term:'Mifflin-St Jeor', def:'1990 equation for BMR. Most validated formula: Male: 10w + 6.25h − 5a + 5. Female: 10w + 6.25h − 5a − 161.' },
  { term:'Caloric Deficit', def:'Eating fewer calories than your TDEE. A 500 kcal/day deficit creates roughly 0.5 kg/week weight loss.' },
  { term:'Waist-to-Height', def:'Waist circumference ÷ height. Values > 0.5 indicate elevated metabolic risk regardless of BMI.' },
]

const EXAMPLES = [
  { title:'Lean Athlete',  desc:'Marathon runner, male',  hCm:175, wKg:65, age:28, sex:'male'   },
  { title:'Average Adult', desc:'Office worker, female',  hCm:163, wKg:72, age:38, sex:'female' },
  { title:'Overweight',    desc:'Pre-obesity screening',  hCm:168, wKg:95, age:45, sex:'male'   },
]

const JOURNEY_ITEMS = [
  { title:'BMR & Calories', sub:'How many calories do you need daily?',      icon:'🔥', path:'/health/body-metrics/bmr-calculator'         },
  { title:'Body Fat %',     sub:'More accurate than BMI for body composition', icon:'💪', path:'/health/body-metrics/body-fat-calculator'     },
  { title:'Water Intake',   sub:'Daily hydration based on your body',          icon:'💧', path:'/health/body-metrics/water-intake-calculator' },
]

/* ── helpers ──────────────────────────────────────── */
const fmtKg   = n => `${(Math.round(n*10)/10).toFixed(1)} kg`
const fmtLbs  = n => `${(Math.round(n*2.20462*10)/10).toFixed(1)} lbs`
const fmtCm   = n => `${Math.round(n)} cm`
const fmtFtIn = (ft,inch) => `${ft}′ ${inch}″`
const clamp   = (v,mn,mx) => Math.min(mx, Math.max(mn, v))

function getZone(bmi) {
  return ZONES.find((z,i) => i===ZONES.length-1 ? bmi>=z.min : bmi>=z.min && bmi<z.max) || ZONES[0]
}
function getWeightObject(kg) {
  return WEIGHT_OBJECTS.reduce((best,o) =>
    Math.abs(o.kg-Math.round(Math.abs(kg))) < Math.abs(best.kg-Math.round(Math.abs(kg))) ? o : best
  )
}

/* ══════════════════════════════════════════════
   GAUGE — Style 3: Health dashboard
   Big number + animated segmented zone bar
   + smooth sliding marker line
══════════════════════════════════════════════ */
function BMIGauge({ bmi, zone, catColor }) {
  const markerRef    = useRef(null)
  const curPct       = useRef(null)
  const tgtPct       = useRef(null)
  const rafRef       = useRef(null)

  // convert bmi → 0..1 position across the bar
  const bmiToPct = b => clamp((b - 10) / 40, 0, 1)

  useEffect(() => {
    const tp = bmiToPct(bmi)
    if (curPct.current === null) curPct.current = tp
    tgtPct.current = tp

    const animate = () => {
      const diff = tgtPct.current - curPct.current
      if (Math.abs(diff) < 0.0003) { curPct.current = tgtPct.current }
      else { curPct.current += diff * 0.14; rafRef.current = requestAnimationFrame(animate) }

      const pctStr = (curPct.current * 100).toFixed(2) + '%'
      if (markerRef.current)    markerRef.current.style.left    = `calc(${pctStr} - 1px)`
    }
    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current)
  }, [bmi])

  const pct = bmiToPct(bmi)

  return (
    <div>
      {/* ── Big BMI number + zone badge ── */}
      <div style={{ display:'flex', alignItems:'flex-end', gap:12, marginBottom:14 }}>
        <div>
          <div style={{ fontSize:52, fontWeight:700, lineHeight:1, color:zone.color,
            fontFamily:"'Space Grotesk',sans-serif", transition:'color .3s' }}>
            {isNaN(bmi) ? '—' : bmi.toFixed(1)}
          </div>
          <div style={{ fontSize:11, color:'var(--text-3)', marginTop:3,
            fontFamily:"'DM Sans',sans-serif" }}>Body Mass Index</div>
        </div>
        <div style={{ paddingBottom:6 }}>
          {/* zone badge */}
          <div style={{
            display:'inline-flex', alignItems:'center', gap:6,
            padding:'5px 12px 5px 8px', borderRadius:20,
            background: zone.soft, border:`1px solid ${zone.color}35`,
            transition:'all .3s',
          }}>
            <div style={{ width:8, height:8, borderRadius:'50%', background:zone.color,
              flexShrink:0, transition:'background .3s' }}/>
            <span style={{ fontSize:12, fontWeight:700, color:zone.color,
              fontFamily:"'DM Sans',sans-serif", transition:'color .3s' }}>
              {zone.label}
            </span>
          </div>
          <div style={{ fontSize:11, color:'var(--text-3)', marginTop:5,
            fontFamily:"'DM Sans',sans-serif" }}>
            Range: <strong style={{ color:'var(--text)', fontWeight:600 }}>{zone.range}</strong>
          </div>
        </div>
      </div>

      {/* ── Segmented zone bar ── */}
      <div style={{ display:'flex', gap:3, height:28, marginBottom:0 }}>
        {ZONES.map((z, i) => {
          const active = zone.key === z.key
          return (
            <div key={i} style={{
              flex: active ? (z.max - z.min) + 2 : (z.max - z.min),
              background: z.color,
              borderRadius: 6,
              opacity: active ? 1 : 0.22,
              transition: 'flex .4s cubic-bezier(.4,0,.2,1), opacity .3s',
              position: 'relative',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {/* show label inside active segment if wide enough */}
              {active && (
                <span style={{ fontSize:9, fontWeight:700, color:'#fff',
                  letterSpacing:'0.4px', whiteSpace:'nowrap', pointerEvents:'none',
                  textShadow:'0 1px 2px rgba(0,0,0,.25)', fontFamily:"'DM Sans',sans-serif" }}>
                  {z.short || z.label}
                </span>
              )}
            </div>
          )
        })}
      </div>

      {/* ── Animated marker tick ── */}
      <div style={{ position:'relative', height:8, marginTop:3, marginBottom:3 }}>
        <div ref={markerRef} style={{
          position:'absolute', top:0, width:2, height:8,
          background:'var(--text)', borderRadius:1,
          left:`calc(${(pct*100).toFixed(2)}% - 1px)`,
          transition:'left .4s cubic-bezier(.4,0,.2,1)',
        }}/>
      </div>

      {/* ── Scale labels ── */}
      <div style={{ display:'flex', justifyContent:'space-between', fontSize:9,
        color:'var(--text-3)', fontFamily:"'DM Sans',sans-serif", padding:'0 1px' }}>
        {['10','16','18.5','25','30','35','40','50'].map(v => <span key={v}>{v}</span>)}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════
   ICON CARD — Option B input selector
   Used for: unit system + biological sex
══════════════════════════════════════════════ */
function IconCardGroup({ label, options, value, onChange, catColor }) {
  return (
    <div style={{ marginBottom:18 }}>
      <div style={{ fontSize:12, fontWeight:600, color:'var(--text-2)', marginBottom:8, fontFamily:"'DM Sans',sans-serif" }}>
        {label}
      </div>
      <div style={{ display:'flex', gap:8 }}>
        {options.map(opt => {
          const active = value === opt.value
          return (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              style={{
                flex:1, padding:'12px 8px', borderRadius:10, cursor:'pointer',
                border:`1.5px solid ${active ? catColor : 'var(--border-2)'}`,
                background: active ? catColor+'12' : 'var(--bg-raised)',
                display:'flex', flexDirection:'column', alignItems:'center', gap:6,
                transition:'all .18s', fontFamily:"'DM Sans',sans-serif",
              }}
            >
              {/* SVG icon */}
              <div style={{ width:28, height:28, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none"
                  stroke={active ? catColor : 'var(--text-3)'} strokeWidth="1.6"
                  strokeLinecap="round" strokeLinejoin="round"
                  style={{ transition:'stroke .18s' }}>
                  {opt.icon}
                </svg>
              </div>
              {/* label */}
              <span style={{ fontSize:12, fontWeight: active ? 700 : 500, color: active ? catColor : 'var(--text-2)', lineHeight:1.2, textAlign:'center', transition:'color .18s' }}>
                {opt.label}
              </span>
              {/* sub-label */}
              {opt.sub && (
                <span style={{ fontSize:10, color: active ? catColor+'cc' : 'var(--text-3)', lineHeight:1.2, textAlign:'center', transition:'color .18s' }}>
                  {opt.sub}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// SVG icon paths as JSX (used inside the <svg> in IconCardGroup)
const UNIT_OPTIONS = [
  {
    value: 'metric',
    label: 'Metric',
    sub: 'cm · kg',
    icon: <>
      <rect x="3" y="2" width="16" height="18" rx="2.5"/>
      <line x1="7" y1="7.5"  x2="15" y2="7.5"/>
      <line x1="7" y1="11"   x2="15" y2="11"/>
      <line x1="7" y1="14.5" x2="12" y2="14.5"/>
    </>,
  },
  {
    value: 'imperial',
    label: 'Imperial',
    sub: 'ft · lbs',
    icon: <>
      <rect x="3" y="2" width="16" height="18" rx="2.5"/>
      <line x1="7" y1="7.5"  x2="15" y2="7.5"/>
      <line x1="7" y1="11"   x2="15" y2="11"/>
      <line x1="7" y1="14.5" x2="12" y2="14.5"/>
      <path d="M3 6.5h16" strokeDasharray="2 1"/>
    </>,
  },
]

const SEX_OPTIONS = [
  {
    value: 'male',
    label: 'Male',
    icon: <>
      <circle cx="11" cy="9" r="5"/>
      <line x1="11" y1="14" x2="11" y2="20"/>
      <line x1="8"  y1="17" x2="14" y2="17"/>
    </>,
  },
  {
    value: 'female',
    label: 'Female',
    icon: <>
      <circle cx="11" cy="8.5" r="5"/>
      <line x1="11" y1="13.5" x2="11" y2="20"/>
      <line x1="8"  y1="17"   x2="14" y2="17"/>
      <line x1="7"  y1="11"   x2="15" y2="11" strokeOpacity="0.4"/>
    </>,
  },
]

/* ── Stepper ──────────────────────────────────────── */
function Stepper({ label, hint, value, onChange, min, max, step=1, unit, catColor }) {
  const [editing, setEditing] = useState(false)
  const commit = raw => { const n=parseFloat(raw); onChange(clamp(isNaN(n)?value:n,min,max)); setEditing(false) }
  const btnStyle = { width:38, height:'100%', border:'none', background:'var(--bg-raised)', color:'var(--text)', fontSize:20, fontWeight:300, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontFamily:'inherit', transition:'background .1s' }
  return (
    <div style={{ marginBottom:16 }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
        <label style={{ fontSize:12.5, fontWeight:600, color:'var(--text)', fontFamily:"'DM Sans',sans-serif" }}>{label}</label>
        {hint && <span style={{ fontSize:10, color:'var(--text-3)' }}>{hint}</span>}
      </div>
      <div style={{ display:'flex', alignItems:'stretch', height:40, border:`1.5px solid ${editing?catColor:'var(--border-2)'}`, borderRadius:9, overflow:'hidden', background:'var(--bg-card)', boxShadow:editing?`0 0 0 3px ${catColor}18`:'none', transition:'border-color .15s,box-shadow .15s' }}>
        <button onMouseDown={e=>{e.preventDefault();onChange(clamp(value-step,min,max))}} style={{...btnStyle,borderRight:'1px solid var(--border)'}} onMouseEnter={e=>e.currentTarget.style.background=catColor+'18'} onMouseLeave={e=>e.currentTarget.style.background='var(--bg-raised)'}>−</button>
        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:5 }}>
          {editing
            ? <input type="number" defaultValue={value} onBlur={e=>commit(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')commit(e.target.value);if(e.key==='Escape')setEditing(false)}} style={{ width:'55%', border:'none', background:'transparent', textAlign:'center', fontSize:15, fontWeight:700, color:'var(--text)', outline:'none', fontFamily:"'DM Sans',sans-serif" }} autoFocus/>
            : <span onClick={()=>setEditing(true)} title="Click to type" style={{ fontSize:15, fontWeight:700, color:'var(--text)', cursor:'text', minWidth:36, textAlign:'center', fontFamily:"'DM Sans',sans-serif" }}>{value}</span>
          }
          <span style={{ fontSize:11, color:'var(--text-3)', fontWeight:500 }}>{unit}</span>
        </div>
        <button onMouseDown={e=>{e.preventDefault();onChange(clamp(value+step,min,max))}} style={{...btnStyle,borderLeft:'1px solid var(--border)'}} onMouseEnter={e=>e.currentTarget.style.background=catColor+'18'} onMouseLeave={e=>e.currentTarget.style.background='var(--bg-raised)'}>+</button>
      </div>
    </div>
  )
}

/* ── Section / Accordion / Glossary ──────────────── */
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
        <span style={{ fontSize:18, color:catColor, flexShrink:0, display:'inline-block', transition:'transform .2s', transform:open?'rotate(45deg)':'none' }}>+</span>
      </button>
      {open && <p style={{ fontSize:12.5, color:'var(--text-2)', lineHeight:1.75, margin:'0 0 13px', fontFamily:"'DM Sans',sans-serif" }}>{a}</p>}
    </div>
  )
}

function GlsTerm({ term, def, catColor }) {
  const [open,setOpen]=useState(false)
  return (
    <div onClick={()=>setOpen(o=>!o)} style={{ padding:'9px 12px', borderRadius:8, cursor:'pointer', transition:'all .15s', border:`1px solid ${open?catColor+'40':'var(--border)'}`, background:open?catColor+'10':'var(--bg-raised)' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:8 }}>
        <span style={{ fontSize:12, fontWeight:700, fontFamily:"'Space Grotesk',sans-serif", color:open?catColor:'var(--text)' }}>{term}</span>
        <span style={{ fontSize:14, color:catColor, flexShrink:0 }}>{open?'−':'+'}</span>
      </div>
      {open && <p style={{ fontSize:11.5, color:'var(--text-2)', lineHeight:1.65, margin:'6px 0 0', fontFamily:"'DM Sans',sans-serif" }}>{def}</p>}
    </div>
  )
}

/* ── Health sub-components ────────────────────────── */
function PopRing({ bmi, catColor }) {
  const pct=clamp(Math.round(((bmi-10)/40)*100),1,99), zone=getZone(bmi), R=38, C=50, circ=2*Math.PI*R
  return (
    <div style={{ display:'flex', alignItems:'center', gap:20 }}>
      <svg viewBox="0 0 100 100" width="90" height="90" style={{ flexShrink:0 }}>
        <circle cx={C} cy={C} r={R} fill="none" stroke="var(--border)" strokeWidth="8"/>
        <circle cx={C} cy={C} r={R} fill="none" stroke={catColor} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={`${circ*(pct/100)} ${circ}`} strokeDashoffset={circ/4}
          transform={`rotate(-90 ${C} ${C})`} style={{ transition:'stroke-dasharray .8s ease' }}/>
        <text x={C} y={C-4} textAnchor="middle" fontSize="15" fontWeight="700" fill="var(--text)" fontFamily="'Space Grotesk',sans-serif">{pct}%</text>
        <text x={C} y={C+9}  textAnchor="middle" fontSize="8"  fill="var(--text-3)" fontFamily="'DM Sans',sans-serif">percentile</text>
      </svg>
      <div>
        <div style={{ fontSize:13, fontWeight:700, color:'var(--text)', marginBottom:4 }}>Higher BMI than ~{pct}% of adults</div>
        <div style={{ fontSize:12, color:'var(--text-2)', lineHeight:1.65, fontFamily:"'DM Sans',sans-serif", maxWidth:280 }}>
          BMI <strong style={{fontWeight:600}}>{bmi.toFixed(1)}</strong> — <strong style={{fontWeight:600,color:zone.color}}>{zone.label}</strong>.{' '}
          {zone.key==='nm'?'You\'re in the healthiest population segment.':zone.key==='ow'||zone.key==='ob1'?'Small consistent changes bring meaningful results.':'A healthcare provider can help you build a realistic plan.'}
        </div>
      </div>
    </div>
  )
}

function Timeline({ currentBmi, wKg, hM, catColor }) {
  const diff=wKg-(22*hM*hM)
  if (diff<=0) return <p style={{ fontSize:12.5, color:catColor, fontWeight:600, fontFamily:"'DM Sans',sans-serif" }}>You are already at or below the target BMI — great work!</p>
  const weeks=Math.ceil(diff/0.75), months=(weeks/4.33).toFixed(1), d=new Date(); d.setDate(d.getDate()+weeks*7)
  return (
    <div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginBottom:14 }}>
        {[{label:'Weight to lose',val:`${diff.toFixed(1)} kg`},{label:'At 0.75 kg/week',val:`${months} months`},{label:'Target date',val:d.toLocaleDateString('en-GB',{month:'short',year:'numeric'})}].map((m,i)=>(
          <div key={i} style={{ background:'var(--bg-raised)', borderRadius:8, padding:'10px 12px', border:'0.5px solid var(--border)' }}>
            <div style={{ fontSize:10, color:'var(--text-3)', marginBottom:3 }}>{m.label}</div>
            <div style={{ fontSize:14, fontWeight:700, color:i===0?catColor:'var(--text)', fontFamily:"'Space Grotesk',sans-serif" }}>{m.val}</div>
          </div>
        ))}
      </div>
      <div style={{ height:6, background:'var(--border)', borderRadius:3, overflow:'hidden', marginBottom:5 }}>
        <div style={{ height:'100%', width:'4%', background:catColor, borderRadius:3 }}/>
      </div>
      <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, color:'var(--text-3)' }}>
        <span>Now · BMI {currentBmi.toFixed(1)}</span><span>Target · BMI 22</span>
      </div>
    </div>
  )
}

function ActivityCard({ bmr, catColor }) {
  const acts=[{name:'Walking',kcalPerHr:280,icon:'🚶'},{name:'Cycling',kcalPerHr:480,icon:'🚴'},{name:'Swimming',kcalPerHr:520,icon:'🏊'},{name:'Running',kcalPerHr:600,icon:'🏃'},{name:'Yoga',kcalPerHr:200,icon:'🧘'},{name:'HIIT',kcalPerHr:720,icon:'⚡'}]
  return (
    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
      {acts.map((a,i)=>{
        const hrs=(bmr/a.kcalPerHr).toFixed(1), pct=Math.min(100,(bmr/a.kcalPerHr/6)*100)
        return (
          <div key={i} style={{ background:'var(--bg-raised)', borderRadius:9, padding:'10px 12px', border:'0.5px solid var(--border)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:6 }}>
              <span style={{ fontSize:16 }}>{a.icon}</span>
              <span style={{ fontSize:11, fontWeight:600, color:'var(--text)', fontFamily:"'DM Sans',sans-serif" }}>{a.name}</span>
            </div>
            <div style={{ fontSize:16, fontWeight:700, color:catColor, fontFamily:"'Space Grotesk',sans-serif" }}>{hrs} hrs</div>
            <div style={{ height:3, background:'var(--border)', borderRadius:2, marginTop:5 }}>
              <div style={{ height:'100%', width:`${pct}%`, background:catColor, borderRadius:2 }}/>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function HealthAge({ bmi, age, catColor }) {
  const zone=getZone(bmi), delta={suw:5,uw:2,nm:0,ow:3,ob1:6,ob2:10,ob3:15}[zone.key]??0, mAge=age+delta
  return (
    <div style={{ display:'flex', alignItems:'center', gap:16, padding:'14px 16px', background:'var(--bg-raised)', borderRadius:10, border:`1px solid ${zone.color}25` }}>
      <div style={{ textAlign:'center', minWidth:64 }}>
        <div style={{ fontSize:10, color:'var(--text-3)', marginBottom:2 }}>Real age</div>
        <div style={{ fontSize:30, fontWeight:700, color:'var(--text)', fontFamily:"'Space Grotesk',sans-serif" }}>{age}</div>
        <div style={{ fontSize:9, color:'var(--text-3)' }}>years</div>
      </div>
      <div style={{ fontSize:20, color:delta>0?zone.color:catColor }}>→</div>
      <div style={{ textAlign:'center', minWidth:64 }}>
        <div style={{ fontSize:10, color:'var(--text-3)', marginBottom:2 }}>Metabolic age</div>
        <div style={{ fontSize:30, fontWeight:700, color:delta>0?zone.color:catColor, fontFamily:"'Space Grotesk',sans-serif" }}>{mAge}</div>
        <div style={{ fontSize:9, color:delta>0?zone.color:catColor }}>{delta===0?'on track':`+${delta} yrs`}</div>
      </div>
      <div style={{ flex:1, fontSize:11.5, color:'var(--text-2)', lineHeight:1.6 }}>
        {delta===0?'Your BMI is in the normal range — your metabolic age matches your real age.':`A BMI in the ${zone.label} range adds an estimated +${delta} years to your metabolic age. Reaching a normal BMI can reverse this.`}
      </div>
    </div>
  )
}

function TDEETable({ bmr, catColor }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
      {ACTIVITY_FACTORS.map((a,i)=>(
        <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'9px 12px', borderRadius:8, background:'var(--bg-raised)', border:'0.5px solid var(--border)' }}>
          <div style={{ flex:2 }}>
            <div style={{ fontSize:12, fontWeight:600, color:'var(--text)' }}>{a.label}</div>
            <div style={{ fontSize:10, color:'var(--text-3)' }}>{a.sub}</div>
          </div>
          <div style={{ flex:1, textAlign:'right' }}>
            <div style={{ fontSize:14, fontWeight:700, color:catColor }}>{Math.round(bmr*a.factor).toLocaleString()}</div>
            <div style={{ fontSize:9, color:'var(--text-3)' }}>kcal/day</div>
          </div>
          <div style={{ width:56, height:4, background:'var(--border)', borderRadius:2 }}>
            <div style={{ height:'100%', width:`${((a.factor-1.2)/0.7)*100}%`, background:catColor, borderRadius:2 }}/>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ══════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════ */
export default function BMICalculator({ meta, category }) {
  const catColor = category?.color || '#22a355'

  const [unit,      setUnit]      = useState('metric')
  const [heightCm,  setHeightCm]  = useState(170)
  const [heightFt,  setHeightFt]  = useState(5)
  const [heightIn,  setHeightIn]  = useState(7)
  const [weightKg,  setWeightKg]  = useState(70)
  const [weightLbs, setWeightLbs] = useState(154)
  const [age,       setAge]       = useState(28)
  const [sex,       setSex]       = useState('male')
  const [openFaq,   setOpenFaq]   = useState(null)

  function handleUnit(u) {
    if (u===unit) return
    if (u==='imperial') {
      const ti=Math.round(heightCm/2.54); setHeightFt(Math.floor(ti/12)); setHeightIn(ti%12)
      setWeightLbs(Math.round(weightKg*2.20462))
    } else {
      setHeightCm(clamp(Math.round((heightFt*12+heightIn)*2.54),100,250))
      setWeightKg(clamp(Math.round(weightLbs/2.20462),20,300))
    }
    setUnit(u)
  }

  function applyExample(ex) {
    setHeightCm(ex.hCm); setWeightKg(ex.wKg); setAge(ex.age); setSex(ex.sex)
    const ti=Math.round(ex.hCm/2.54); setHeightFt(Math.floor(ti/12)); setHeightIn(ti%12)
    setWeightLbs(Math.round(ex.wKg*2.20462)); setUnit('metric')
  }

  const isM     = unit==='metric'
  const hM      = isM ? heightCm/100 : (heightFt*12+heightIn)*0.0254
  const wKg     = isM ? weightKg : weightLbs/2.20462
  const bmi     = wKg/(hM*hM)
  const zone    = getZone(bmi)
  const idealKg = 22*hM*hM, minKg=18.5*hM*hM, maxKg=24.9*hM*hM
  const diffKg  = wKg-idealKg
  const bmr     = sex==='male' ? 10*wKg+6.25*hM*100-5*age+5 : 10*wKg+6.25*hM*100-5*age-161
  const wFmt    = kg => isM ? fmtKg(kg) : fmtLbs(kg)
  const hDisp   = isM ? fmtCm(heightCm) : fmtFtIn(heightFt,heightIn)
  const wDisp   = isM ? fmtKg(wKg) : fmtLbs(wKg)
  const wObj    = getWeightObject(Math.abs(diffKg))
  const hint    = `BMI ${bmi.toFixed(1)} — ${zone.label}. Ideal weight: ${wFmt(idealKg)}. BMR: ${Math.round(bmr).toLocaleString()} kcal/day at rest. ${Math.abs(diffKg)<1?'You are at your ideal weight.':diffKg>0?`${wFmt(diffKg)} above ideal — like carrying ${wObj.label}.`:`${wFmt(Math.abs(diffKg))} below ideal weight.`}`


  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <CalcShell
        left={<>

          {/* ─── GROUP 1: Unit system ─────────────────── */}
          <IconCardGroup
            label="Unit system"
            options={UNIT_OPTIONS}
            value={unit}
            onChange={handleUnit}
            catColor={catColor}
          />

          {/* ─── GROUP 2: Body measurements ──────────── */}
          <div style={{ borderTop:'0.5px solid var(--border)', paddingTop:16, marginBottom:0 }}>
            <div style={{ fontSize:10, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:14 }}>
              Body measurements
            </div>

            {/* Height — single row for metric, split row for imperial */}
            {isM ? (
              <Stepper label="Height" value={heightCm} onChange={setHeightCm}
                min={100} max={250} unit="cm" catColor={catColor}/>
            ) : (
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                <Stepper label="Feet" value={heightFt} onChange={setHeightFt}
                  min={3} max={7} unit="ft" catColor={catColor}/>
                <Stepper label="Inches" value={heightIn} onChange={setHeightIn}
                  min={0} max={11} unit="in" catColor={catColor}/>
              </div>
            )}

            <Stepper label="Weight" value={isM ? weightKg : weightLbs}
              onChange={isM ? setWeightKg : setWeightLbs}
              min={isM ? 20 : 44} max={isM ? 300 : 660}
              unit={isM ? 'kg' : 'lbs'} catColor={catColor}/>

            <Stepper label="Age" value={age} onChange={setAge}
              min={10} max={100} unit="yrs"
              hint="Used for BMR calculation" catColor={catColor}/>
          </div>

          {/* ─── GROUP 3: Biological sex ──────────────── */}
          <div style={{ borderTop:'0.5px solid var(--border)', paddingTop:16, marginTop:4 }}>
            <IconCardGroup
              label="Biological sex"
              options={SEX_OPTIONS}
              value={sex}
              onChange={setSex}
              catColor={catColor}
            />
          </div>

        </>}

        right={<>
          {/* ── BMI Score card — Style 3 dashboard ── */}
          <div style={{ background:'var(--bg-card)', border:'0.5px solid var(--border)',
            borderRadius:14, overflow:'hidden', marginBottom:14 }}>
            <div style={{ padding:'11px 16px', borderBottom:'0.5px solid var(--border)',
              display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontSize:12, fontWeight:700, color:'var(--text)',
                fontFamily:"'Space Grotesk',sans-serif" }}>BMI Score</span>
              <span style={{ fontSize:10, color:'var(--text-3)' }}>Updates live as you edit</span>
            </div>
            <div style={{ padding:'16px 18px' }}>
              <BMIGauge bmi={bmi} zone={zone} catColor={catColor}/>
            </div>
            {/* advice strip */}
            <div style={{ margin:'0 18px 16px' }}>
              <div style={{ background:zone.soft, borderRadius:10, padding:'10px 13px',
                border:`1px solid ${zone.color}30`, transition:'all .3s' }}>
                <p style={{ fontSize:11.5, color:'var(--text-2)', margin:0, lineHeight:1.65,
                  fontFamily:"'DM Sans',sans-serif" }}>{zone.advice}</p>
              </div>
            </div>
          </div>

          <BreakdownTable title="Health Summary" rows={[
            { label:'Your height',  value:hDisp },
            { label:'Your weight',  value:wDisp },
            { label:'BMI',          value:bmi.toFixed(1), bold:true, highlight:true, color:zone.color },
            { label:'Category',     value:zone.label, color:zone.color },
            { label:'Healthy range',value:`${wFmt(minKg)} – ${wFmt(maxKg)}`, color:catColor },
            { label:'Ideal weight', value:wFmt(idealKg), color:catColor },
            { label:diffKg>0?'To lose':'To gain', value:wFmt(Math.abs(diffKg)), color:Math.abs(diffKg)<1?catColor:diffKg>0?'#e07010':'#1a9ad4' },
            { label:'BMR (at rest)', value:`${Math.round(bmr).toLocaleString()} kcal/day` },
          ]}/>
          <AIHintCard hint={hint}/>
        </>}
      />

      {/* ── Health-unique sections ─────────────────── */}
      <Sec title="Your metabolic age" sub="How your BMI affects biological ageing">
        <p style={{ fontSize:12, color:'var(--text-2)', lineHeight:1.7, marginBottom:14, fontFamily:"'DM Sans',sans-serif" }}>Metabolic age estimates how old your body's physiology acts compared to your real age. BMI outside the normal range correlates with accelerated ageing of organs, joints, and cardiovascular tissue.</p>
        <HealthAge bmi={bmi} age={age} catColor={catColor}/>
      </Sec>

      {Math.abs(diffKg)>=1 && (
        <Sec title="What does that weight feel like?" sub="Turning an abstract number into something real">
          <p style={{ fontSize:12, color:'var(--text-2)', lineHeight:1.7, marginBottom:14, fontFamily:"'DM Sans',sans-serif" }}>Numbers on a screen are easy to ignore. Here's what the difference between your current and ideal weight compares to in everyday life.</p>
          <div style={{ display:'flex', alignItems:'center', gap:14, background:'var(--bg-raised)', borderRadius:10, padding:'14px 16px', border:`1px solid ${zone.color}25` }}>
            <span style={{ fontSize:32, flexShrink:0 }}>⚖️</span>
            <div>
              <div style={{ fontSize:13, fontWeight:700, color:'var(--text)', marginBottom:3 }}>
                You are {diffKg>0?'carrying':''} <span style={{ color:zone.color }}>{wFmt(Math.abs(diffKg))}</span> {diffKg>0?'more than your ideal weight':'below your ideal weight'}
              </div>
              <div style={{ fontSize:12, color:'var(--text-2)', fontFamily:"'DM Sans',sans-serif", lineHeight:1.6 }}>
                That's roughly the weight of <strong style={{ color:'var(--text)', fontWeight:600 }}>{wObj.label}</strong>. {diffKg>0?'Imagine carrying that extra load everywhere, every single day.':'A small but meaningful amount to build back through consistent nutrition.'}
              </div>
            </div>
          </div>
        </Sec>
      )}

      <Sec title="Where you stand" sub="Your BMI relative to the adult population">
        <p style={{ fontSize:12, color:'var(--text-2)', lineHeight:1.7, marginBottom:14, fontFamily:"'DM Sans',sans-serif" }}>Context makes numbers meaningful. This estimate shows roughly where your BMI sits within the global adult population.</p>
        <PopRing bmi={bmi} catColor={catColor}/>
      </Sec>

      <Sec title="Your path to a healthy BMI" sub="Safe pace — 0.75 kg/week">
        <p style={{ fontSize:12, color:'var(--text-2)', lineHeight:1.7, marginBottom:14, fontFamily:"'DM Sans',sans-serif" }}>Safe weight loss is 0.5–1 kg per week. Going faster risks muscle loss and nutritional deficiencies. At 0.75 kg/week — achievable through moderate dietary changes — here is your estimated timeline.</p>
        <Timeline currentBmi={bmi} wKg={wKg} hM={hM} catColor={catColor}/>
      </Sec>

      <Sec title="Your BMR in everyday activities" sub={`${Math.round(bmr).toLocaleString()} kcal/day at rest`}>
        <p style={{ fontSize:12, color:'var(--text-2)', lineHeight:1.7, marginBottom:14, fontFamily:"'DM Sans',sans-serif" }}>Your BMR is the energy your body uses just keeping you alive — breathing, heartbeat, organ function. Here's how long different activities take to burn that same number of calories.</p>
        <ActivityCard bmr={bmr} catColor={catColor}/>
      </Sec>

      <Sec title="Daily calorie needs by activity level" sub="Find your level — eat at or below this number">
        <p style={{ fontSize:12, color:'var(--text-2)', lineHeight:1.7, marginBottom:14, fontFamily:"'DM Sans',sans-serif" }}>TDEE is your true daily calorie burn. Eat at TDEE to maintain weight. Eat 300–500 kcal below to lose weight gradually without sacrificing muscle.</p>
        <TDEETable bmr={bmr} catColor={catColor}/>
      </Sec>

      <Sec title="The science behind the numbers" sub="Formulas used in this calculator">
        <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:14 }}>
          {[
            {label:'BMI',formula:'BMI = weight (kg) ÷ height² (m²)'},
            {label:'Ideal weight',formula:'Ideal = 22 × height² (m²)   ← midpoint of normal BMI range'},
            {label:'Healthy range',formula:'Min = 18.5 × h²   |   Max = 24.9 × h²'},
            {label:'BMR — male',formula:'BMR = (10 × weight) + (6.25 × height_cm) − (5 × age) + 5'},
            {label:'BMR — female',formula:'BMR = (10 × weight) + (6.25 × height_cm) − (5 × age) − 161'},
            {label:'TDEE',formula:'TDEE = BMR × activity factor   (1.2 sedentary → 1.9 athlete)'},
          ].map(f=>(
            <div key={f.label}>
              <div style={{ fontSize:10, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.05em', marginBottom:4 }}>{f.label}</div>
              <div style={{ background:'var(--bg-raised)', borderRadius:8, padding:'10px 14px', fontFamily:'monospace', fontSize:12, color:catColor, fontWeight:600, overflowX:'auto', whiteSpace:'nowrap' }}>{f.formula}</div>
            </div>
          ))}
        </div>
        <p style={{ fontSize:12, color:'var(--text-2)', lineHeight:1.75, margin:0, fontFamily:"'DM Sans',sans-serif" }}>The Mifflin-St Jeor equation (1990) is the most validated BMR formula — accurate to ±10% for 82% of people. BMI was created by Quetelet in 1832 as a population statistics tool, not an individual diagnostic. Always interpret results alongside other health indicators.</p>
      </Sec>

      <Sec title="Real world examples" sub="Click any to prefill the calculator">
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
          {EXAMPLES.map((ex,i)=>{
            const h2=ex.hCm/100,b=ex.wKg/(h2*h2),z=getZone(b)
            return (
              <button key={i} onClick={()=>applyExample(ex)}
                style={{ padding:14, borderRadius:10, border:'1.5px solid var(--border)', background:'var(--bg-raised)', cursor:'pointer', textAlign:'left', transition:'all .15s' }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=catColor;e.currentTarget.style.background=catColor+'10'}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.background='var(--bg-raised)'}}>
                <div style={{ fontSize:13, fontWeight:700, color:'var(--text)', marginBottom:2 }}>{ex.title}</div>
                <div style={{ fontSize:11, color:'var(--text-3)', marginBottom:9, lineHeight:1.4 }}>{ex.desc}</div>
                {[['Height',fmtCm(ex.hCm)],['Weight',fmtKg(ex.wKg)],['BMI',b.toFixed(1)]].map(([k,v])=>(
                  <div key={k} style={{ display:'flex', justifyContent:'space-between' }}>
                    <span style={{ fontSize:10, color:'var(--text-3)' }}>{k}</span>
                    <span style={{ fontSize:10, fontWeight:600, color:k==='BMI'?z.color:catColor }}>{v}</span>
                  </div>
                ))}
                <div style={{ marginTop:8, display:'flex', alignItems:'center' }}>
                  <span style={{ fontSize:9, fontWeight:700, background:z.color+'18', color:z.color, padding:'2px 8px', borderRadius:10 }}>{z.label}</span>
                  <span style={{ fontSize:10, fontWeight:700, color:catColor, marginLeft:'auto' }}>Apply →</span>
                </div>
              </button>
            )
          })}
        </div>
      </Sec>

      <Sec title="Key terms explained" sub="Click any term to expand">
        <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:8 }}>
          {GLOSSARY.map((g,i)=><GlsTerm key={i} term={g.term} def={g.def} catColor={catColor}/>)}
        </div>
      </Sec>

      {/* ── Continue your health journey — reusable component ── */}
      <HealthJourneyNext
        catColor={catColor}
        intro="BMI is your starting point. Your height, weight and BMR from here feed directly into the next calculators — each one builds on the last."
        items={JOURNEY_ITEMS}
      />

      {/* ── FAQ — always last ── */}
      <Sec title="Frequently asked questions" sub="Everything you need to know about BMI">
        {FAQ.map((f,i)=>(
          <Acc key={i} q={f.q} a={f.a} open={openFaq===i} onToggle={()=>setOpenFaq(openFaq===i?null:i)} catColor={catColor}/>
        ))}
      </Sec>

    </div>
  )
}
