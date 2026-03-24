import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'
import HealthJourneyNext from '../../components/health/HealthJourneyNext'

/* ── categories ── */
const MALE_CATS = [
  { key:'essential', label:'Essential Fat', range:'2–5%',   min:2,  max:5,  color:'#0ea5e9', soft:'#e0f2fe', advice:'Essential fat is the minimum needed for basic physiological function. This level is typical only in competitive bodybuilders briefly before competition.' },
  { key:'athlete',   label:'Athlete',       range:'6–13%',  min:5,  max:13, color:'#22a355', soft:'#d6f2e0', advice:'Excellent — this is the range of competitive athletes with dedicated training and nutrition. Very low health risk.' },
  { key:'fitness',   label:'Fitness',       range:'14–17%', min:13, max:17, color:'#3b82f6', soft:'#dbeafe', advice:'Great shape — active, fit individuals fall here. Associated with low cardiovascular risk and good metabolic health.' },
  { key:'average',   label:'Average',       range:'18–24%', min:17, max:25, color:'#f59e0b', soft:'#fef3c7', advice:'Acceptable range for most adults. Regular exercise and a balanced diet will improve your composition over time.' },
  { key:'obese',     label:'Obese',         range:'≥ 25%',  min:25, max:60, color:'#ef4444', soft:'#fee2e2', advice:'Elevated health risk. Reducing body fat through consistent diet and exercise will significantly improve long-term health outcomes.' },
]
const FEMALE_CATS = [
  { key:'essential', label:'Essential Fat', range:'10–13%', min:10, max:13, color:'#0ea5e9', soft:'#e0f2fe', advice:'Essential fat for females is higher due to hormonal and reproductive functions. This level is only sustainable briefly for elite competitors.' },
  { key:'athlete',   label:'Athlete',       range:'14–20%', min:13, max:20, color:'#22a355', soft:'#d6f2e0', advice:'Excellent — competitive athlete range with dedicated training. Very low health risk and high performance capacity.' },
  { key:'fitness',   label:'Fitness',       range:'21–24%', min:20, max:24, color:'#3b82f6', soft:'#dbeafe', advice:'Great shape — fit, active women typically fall here. Associated with low cardiovascular risk.' },
  { key:'average',   label:'Average',       range:'25–31%', min:24, max:31, color:'#f59e0b', soft:'#fef3c7', advice:'Acceptable range. Regular exercise and balanced nutrition will improve your composition over time.' },
  { key:'obese',     label:'Obese',         range:'≥ 32%',  min:31, max:70, color:'#ef4444', soft:'#fee2e2', advice:'Elevated health risk. A structured programme of diet and exercise can meaningfully reduce body fat and improve health.' },
]

const ATHLETE_BENCHMARKS = [
  { sport:'Marathon runner', malePct:8,  femalePct:16 },
  { sport:'Swimmer',         malePct:12, femalePct:20 },
  { sport:'Cyclist',         malePct:9,  femalePct:17 },
  { sport:'Footballer',      malePct:10, femalePct:18 },
  { sport:'Weightlifter',    malePct:15, femalePct:23 },
  { sport:'Average adult',   malePct:20, femalePct:27 },
]

const GLOSSARY = [
  { term:'Body Fat %',    def:'The proportion of your total body weight that is fat mass. Includes essential fat (organs, bone marrow, nervous system) and storage fat.' },
  { term:'Lean Mass',     def:'Everything in your body that is not fat — muscle, bone, organs, water, and connective tissue.' },
  { term:'Essential Fat', def:'The minimum fat required for basic physiological function. Approximately 2–5% for males and 10–13% for females.' },
  { term:'US Navy Method',def:'Estimates body fat from height, waist, neck (and hip for females). Validated to within ±3–4% of DEXA scan results.' },
  { term:'DEXA Scan',     def:'Dual-Energy X-ray Absorptiometry — the gold standard for body composition measurement, accurate to ±1–2%.' },
  { term:'Visceral Fat',  def:'Fat stored around internal organs. More metabolically dangerous than subcutaneous (under-skin) fat.' },
]

const FAQ = [
  { q:'How accurate is this body fat calculator?',
    a:'The US Navy method used here is validated to within ±3–4 percentage points of a DEXA scan for most people. It is less accurate for highly muscular individuals (underestimates fat) and those who carry weight unusually. For clinical precision, a DEXA scan or hydrostatic weighing is recommended.' },
  { q:'What is a healthy body fat percentage?',
    a:'For males: athlete 6–13%, fitness 14–17%, acceptable 18–24%, obese ≥25%. For females: athlete 14–20%, fitness 21–24%, acceptable 25–31%, obese ≥32%. These are American Council on Exercise (ACE) classifications. Essential fat (minimum for survival) is 2–5% male, 10–13% female.' },
  { q:'Where should I measure my waist?',
    a:'Measure at the narrowest point of your torso, typically about 1 inch above your navel. Do not suck in. Measure in the morning before eating. For hips (females), measure at the widest point across the buttocks.' },
  { q:'How is body fat different from BMI?',
    a:'BMI only uses height and weight — it cannot distinguish between muscle and fat. Two people with identical BMI can have vastly different body fat percentages. A muscular athlete may show "Overweight" BMI while having 10% body fat. Body fat % is a more meaningful health indicator.' },
  { q:'How do I reduce body fat?',
    a:'A calorie deficit of 300–500 kcal/day combined with resistance training is the most evidence-based approach. Resistance training preserves lean mass while losing fat. Aim for 0.5–1% body fat reduction per month — faster than this usually causes muscle loss.' },
]

const EXAMPLES = [
  { title:'Lean Athlete',  desc:'Male cyclist, competitive', hCm:178, wKg:72, waistCm:76, neckCm:38, hipCm:90,  age:26, sex:'male'   },
  { title:'Average Adult', desc:'Female office worker',      hCm:165, wKg:68, waistCm:80, neckCm:33, hipCm:99,  age:35, sex:'female' },
  { title:'High Body Fat', desc:'Male, sedentary lifestyle', hCm:175, wKg:95, waistCm:99, neckCm:42, hipCm:105, age:44, sex:'male'   },
]

const JOURNEY_ITEMS = [
  { title:'BMI Calculator',    sub:'Check your Body Mass Index',              icon:'⚖️', path:'/health/body-metrics/bmi-calculator'        },
  { title:'Lean Body Mass',    sub:'How much of you is muscle and bone?',     icon:'🏋️', path:'/health/body-metrics/lean-body-mass-calculator' },
  { title:'BMR & Calories',    sub:'How many calories do you need daily?',   icon:'🔥', path:'/health/body-metrics/bmr-calculator'         },
]

/* ── helpers ── */
const fmtKg  = n => `${(Math.round(n*10)/10).toFixed(1)} kg`
const fmtCm  = n => `${Math.round(n)} cm`
const fmtFtIn= (ft,i) => `${ft}′ ${i}″`
const clamp  = (v,a,b) => Math.min(b,Math.max(a,v))

function getCat(pct, sex) {
  const cats = sex==='male' ? MALE_CATS : FEMALE_CATS
  return cats.find((c,i) => i===cats.length-1 ? pct>=c.min : pct>=c.min && pct<c.max) || cats[cats.length-1]
}

function calcBodyFat(hCm, wKg, waistCm, neckCm, hipCm, sex) {
  const hIn = hCm / 2.54
  const waistIn = waistCm / 2.54
  const neckIn = neckCm / 2.54
  const hipIn = hipCm / 2.54
  if (sex === 'male') {
    return 495 / (1.0324 - 0.19077 * Math.log10(waistIn - neckIn) + 0.15456 * Math.log10(hIn)) - 450
  } else {
    return 495 / (1.29579 - 0.35004 * Math.log10(waistIn + hipIn - neckIn) + 0.22100 * Math.log10(hIn)) - 450
  }
}

function getWeightObj(kg) {
  const objs = [
    {kg:1,label:'a 1-litre water bottle'},{kg:2,label:'a bag of sugar'},{kg:3,label:'a newborn baby'},
    {kg:5,label:'a bag of flour'},{kg:7,label:'a large dog food bag'},{kg:10,label:'a kettlebell'},
    {kg:15,label:'a full carry-on bag'},{kg:20,label:'a 20 kg rice sack'},{kg:25,label:'a car tyre'},
  ]
  return objs.reduce((b,o) => Math.abs(o.kg-Math.round(kg)) < Math.abs(b.kg-Math.round(kg)) ? o : b)
}

/* ── shared sub-components ── */
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
  const [open,setOpen] = useState(false)
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
function Stepper({ label, hint, value, onChange, min, max, step=1, unit, catColor }) {
  const [editing,setEditing] = useState(false)
  const commit = r => { const n=parseFloat(r); onChange(clamp(isNaN(n)?value:n,min,max)); setEditing(false) }
  const btn = { width:38, height:'100%', border:'none', background:'var(--bg-raised)', color:'var(--text)', fontSize:20, fontWeight:300, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontFamily:'inherit', transition:'background .1s' }
  return (
    <div style={{ marginBottom:16 }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
        <label style={{ fontSize:12.5, fontWeight:600, color:'var(--text)', fontFamily:"'DM Sans',sans-serif" }}>{label}</label>
        {hint && <span style={{ fontSize:10, color:'var(--text-3)' }}>{hint}</span>}
      </div>
      <div style={{ display:'flex', alignItems:'stretch', height:40, border:`1.5px solid ${editing?catColor:'var(--border-2)'}`, borderRadius:9, overflow:'hidden', background:'var(--bg-card)', boxShadow:editing?`0 0 0 3px ${catColor}18`:'none', transition:'border-color .15s,box-shadow .15s' }}>
        <button onMouseDown={e=>{e.preventDefault();onChange(clamp(value-step,min,max))}} style={{...btn,borderRight:'1px solid var(--border)'}} onMouseEnter={e=>e.currentTarget.style.background=catColor+'18'} onMouseLeave={e=>e.currentTarget.style.background='var(--bg-raised)'}>−</button>
        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:5 }}>
          {editing
            ? <input type="number" defaultValue={value} onBlur={e=>commit(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')commit(e.target.value);if(e.key==='Escape')setEditing(false)}} style={{ width:'55%', border:'none', background:'transparent', textAlign:'center', fontSize:15, fontWeight:700, color:'var(--text)', outline:'none', fontFamily:"'DM Sans',sans-serif" }} autoFocus/>
            : <span onClick={()=>setEditing(true)} style={{ fontSize:15, fontWeight:700, color:'var(--text)', cursor:'text', minWidth:36, textAlign:'center', fontFamily:"'DM Sans',sans-serif" }}>{value}</span>
          }
          <span style={{ fontSize:11, color:'var(--text-3)', fontWeight:500 }}>{unit}</span>
        </div>
        <button onMouseDown={e=>{e.preventDefault();onChange(clamp(value+step,min,max))}} style={{...btn,borderLeft:'1px solid var(--border)'}} onMouseEnter={e=>e.currentTarget.style.background=catColor+'18'} onMouseLeave={e=>e.currentTarget.style.background='var(--bg-raised)'}>+</button>
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
          const active = value===opt.value
          return (
            <button key={opt.value} onClick={()=>onChange(opt.value)} style={{ flex:1, padding:'12px 8px', borderRadius:10, cursor:'pointer', border:`1.5px solid ${active?catColor:'var(--border-2)'}`, background:active?catColor+'12':'var(--bg-raised)', display:'flex', flexDirection:'column', alignItems:'center', gap:6, transition:'all .18s', fontFamily:"'DM Sans',sans-serif" }}>
              <div style={{ width:28, height:28, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke={active?catColor:'var(--text-3)'} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ transition:'stroke .18s' }}>{opt.icon}</svg>
              </div>
              <span style={{ fontSize:12, fontWeight:active?700:500, color:active?catColor:'var(--text-2)', lineHeight:1.2, textAlign:'center', transition:'color .18s' }}>{opt.label}</span>
              {opt.sub && <span style={{ fontSize:10, color:active?catColor+'cc':'var(--text-3)', lineHeight:1.2, textAlign:'center' }}>{opt.sub}</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ── Body Fat Ring ── */
function BodyFatRing({ fatPct, cat, catColor }) {
  const R=54, C=70, circ=2*Math.PI*R
  const fatFill = circ*(clamp(fatPct,0,100)/100)
  return (
    <div>
      {/* big number + badge */}
      <div style={{ display:'flex', alignItems:'flex-end', gap:12, marginBottom:14 }}>
        <div>
          <div style={{ fontSize:52, fontWeight:700, lineHeight:1, color:cat.color, fontFamily:"'Space Grotesk',sans-serif", transition:'color .3s' }}>
            {isNaN(fatPct)?'—':fatPct.toFixed(1)}%
          </div>
          <div style={{ fontSize:11, color:'var(--text-3)', marginTop:3, fontFamily:"'DM Sans',sans-serif" }}>Body fat percentage</div>
        </div>
        <div style={{ paddingBottom:6 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'5px 12px 5px 8px', borderRadius:20, background:cat.soft, border:`1px solid ${cat.color}35`, transition:'all .3s' }}>
            <div style={{ width:8, height:8, borderRadius:'50%', background:cat.color, flexShrink:0 }}/>
            <span style={{ fontSize:12, fontWeight:700, color:cat.color, fontFamily:"'DM Sans',sans-serif" }}>{cat.label}</span>
          </div>
          <div style={{ fontSize:11, color:'var(--text-3)', marginTop:5, fontFamily:"'DM Sans',sans-serif" }}>
            Range: <strong style={{ color:'var(--text)', fontWeight:600 }}>{cat.range}</strong>
          </div>
        </div>
      </div>

      {/* ring */}
      <div style={{ display:'flex', alignItems:'center', gap:20, marginBottom:14 }}>
        <svg viewBox="0 0 140 140" width="120" height="120" style={{ flexShrink:0 }}>
          <circle cx={C} cy={C} r={R} fill="none" stroke="var(--border)" strokeWidth="12"/>
          <circle cx={C} cy={C} r={R} fill="none" stroke={cat.color} strokeWidth="12"
            strokeLinecap="round" strokeDasharray={`${fatFill} ${circ}`}
            strokeDashoffset={circ/4} transform={`rotate(-90 ${C} ${C})`}
            style={{ transition:'stroke-dasharray .6s ease, stroke .3s' }}/>
          <text x={C} y={C-6} textAnchor="middle" fontSize="16" fontWeight="700" fill="var(--text)" fontFamily="'Space Grotesk',sans-serif">{fatPct.toFixed(1)}%</text>
          <text x={C} y={C+10} textAnchor="middle" fontSize="9" fill="var(--text-3)" fontFamily="'DM Sans',sans-serif">body fat</text>
        </svg>

        {/* lean vs fat split */}
        <div style={{ flex:1 }}>
          <div style={{ fontSize:10, color:'var(--text-3)', marginBottom:6, fontWeight:600, textTransform:'uppercase', letterSpacing:'.05em' }}>Composition split</div>
          {[
            { label:'Fat mass',  pct:fatPct,      color:cat.color },
            { label:'Lean mass', pct:100-fatPct,  color:catColor  },
          ].map((r,i) => (
            <div key={i} style={{ marginBottom:8 }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, marginBottom:4 }}>
                <span style={{ color:'var(--text-2)' }}>{r.label}</span>
                <span style={{ fontWeight:700, color:r.color }}>{r.pct.toFixed(1)}%</span>
              </div>
              <div style={{ height:6, background:'var(--border)', borderRadius:3, overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${r.pct}%`, background:r.color, borderRadius:3, transition:'width .5s ease' }}/>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* category bar */}
      <div style={{ display:'flex', gap:2, height:6, borderRadius:3, overflow:'hidden', marginBottom:4 }}>
        {(MALE_CATS).map((c,i) => (
          <div key={i} style={{ flex:c.max-c.min, background:c.color, opacity:cat.key===c.key?1:0.22, borderRadius:1, transition:'opacity .3s' }}/>
        ))}
      </div>
      <div style={{ display:'flex', justifyContent:'space-between', fontSize:8.5, color:'var(--text-3)', fontFamily:"'DM Sans',sans-serif" }}>
        <span>2%</span><span>6%</span><span>14%</span><span>18%</span><span>25%</span>
      </div>
    </div>
  )
}

const UNIT_OPTIONS = [
  { value:'metric',   label:'Metric',   sub:'cm · kg', icon:<><rect x="3" y="2" width="16" height="18" rx="2.5"/><line x1="7" y1="7.5" x2="15" y2="7.5"/><line x1="7" y1="11" x2="15" y2="11"/><line x1="7" y1="14.5" x2="12" y2="14.5"/></> },
  { value:'imperial', label:'Imperial', sub:'ft · lbs', icon:<><rect x="3" y="2" width="16" height="18" rx="2.5"/><line x1="7" y1="7.5" x2="15" y2="7.5"/><line x1="7" y1="11" x2="15" y2="11"/><line x1="7" y1="14.5" x2="12" y2="14.5"/></> },
]
const SEX_OPTIONS = [
  { value:'male',   label:'Male',   icon:<><circle cx="11" cy="9" r="5"/><line x1="11" y1="14" x2="11" y2="20"/><line x1="8" y1="17" x2="14" y2="17"/></> },
  { value:'female', label:'Female', icon:<><circle cx="11" cy="8.5" r="5"/><line x1="11" y1="13.5" x2="11" y2="20"/><line x1="8" y1="17" x2="14" y2="17"/></> },
]

/* ══ MAIN ══ */
export default function BodyFatCalculator({ meta, category }) {
  const catColor = category?.color || '#22a355'
  const [unit,    setUnit]    = useState('metric')
  const [hCm,     setHCm]     = useState(175)
  const [hFt,     setHFt]     = useState(5)
  const [hIn,     setHIn]     = useState(9)
  const [wKg,     setWKg]     = useState(75)
  const [wLbs,    setWLbs]    = useState(165)
  const [waist,   setWaist]   = useState(82)
  const [neck,    setNeck]    = useState(38)
  const [hip,     setHip]     = useState(95)
  const [age,     setAge]     = useState(28)
  const [sex,     setSex]     = useState('male')
  const [openFaq, setOpenFaq] = useState(null)

  function handleUnit(u) {
    if (u===unit) return
    if (u==='imperial') { const ti=Math.round(hCm/2.54); setHFt(Math.floor(ti/12)); setHIn(ti%12); setWLbs(Math.round(wKg*2.20462)) }
    else { setHCm(clamp(Math.round((hFt*12+hIn)*2.54),100,250)); setWKg(clamp(Math.round(wLbs/2.20462),20,300)) }
    setUnit(u)
  }
  function applyExample(ex) {
    setHCm(ex.hCm); setWKg(ex.wKg); setWaist(ex.waistCm); setNeck(ex.neckCm); setHip(ex.hipCm); setAge(ex.age); setSex(ex.sex)
    const ti=Math.round(ex.hCm/2.54); setHFt(Math.floor(ti/12)); setHIn(ti%12); setWLbs(Math.round(ex.wKg*2.20462)); setUnit('metric')
  }

  const isM    = unit==='metric'
  const heightM= isM ? hCm/100 : (hFt*12+hIn)*0.0254
  const weightK= isM ? wKg : wLbs/2.20462
  const hCmVal = heightM*100
  const fatPct = clamp(calcBodyFat(hCmVal, weightK, waist, neck, hip, sex), 2, 65)
  const cat    = getCat(fatPct, sex)
  const fatKg  = weightK*(fatPct/100)
  const leanKg = weightK - fatKg
  const wObj   = getWeightObj(fatKg)

  const hint = `Body fat: ${fatPct.toFixed(1)}% — ${cat.label}. Fat mass: ${fmtKg(fatKg)}, Lean mass: ${fmtKg(leanKg)}. ${cat.advice}`

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <CalcShell
        left={<>
          <IconCardGroup label="Unit system" options={UNIT_OPTIONS} value={unit} onChange={handleUnit} catColor={catColor}/>
          <div style={{ borderTop:'0.5px solid var(--border)', paddingTop:16, marginBottom:0 }}>
            <div style={{ fontSize:10, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:14 }}>Body measurements</div>
            {isM
              ? <Stepper label="Height" value={hCm} onChange={setHCm} min={100} max={250} unit="cm" catColor={catColor}/>
              : <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                  <Stepper label="Feet" value={hFt} onChange={setHFt} min={3} max={7} unit="ft" catColor={catColor}/>
                  <Stepper label="Inches" value={hIn} onChange={setHIn} min={0} max={11} unit="in" catColor={catColor}/>
                </div>
            }
            {isM
              ? <Stepper label="Weight" value={wKg} onChange={setWKg} min={20} max={300} unit="kg" catColor={catColor}/>
              : <Stepper label="Weight" value={wLbs} onChange={setWLbs} min={44} max={660} unit="lbs" catColor={catColor}/>
            }
            <Stepper label="Waist circumference" value={waist} onChange={setWaist} min={40} max={200} unit="cm" hint="At narrowest point" catColor={catColor}/>
            <Stepper label="Neck circumference" value={neck} onChange={setNeck} min={20} max={70} unit="cm" hint="Below larynx" catColor={catColor}/>
            {sex==='female' && <Stepper label="Hip circumference" value={hip} onChange={setHip} min={50} max={200} unit="cm" hint="At widest point" catColor={catColor}/>}
            <Stepper label="Age" value={age} onChange={setAge} min={10} max={100} unit="yrs" catColor={catColor}/>
          </div>
          <div style={{ borderTop:'0.5px solid var(--border)', paddingTop:16, marginTop:4 }}>
            <IconCardGroup label="Biological sex" options={SEX_OPTIONS} value={sex} onChange={setSex} catColor={catColor}/>
          </div>
        </>}
        right={<>
          <div style={{ background:'var(--bg-card)', border:'0.5px solid var(--border)', borderRadius:14, overflow:'hidden', marginBottom:14 }}>
            <div style={{ padding:'11px 16px', borderBottom:'0.5px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontSize:12, fontWeight:700, color:'var(--text)', fontFamily:"'Space Grotesk',sans-serif" }}>Body Fat Score</span>
              <span style={{ fontSize:10, color:'var(--text-3)' }}>Updates live as you edit</span>
            </div>
            <div style={{ padding:'16px 18px' }}>
              <BodyFatRing fatPct={fatPct} cat={cat} catColor={catColor}/>
            </div>
            <div style={{ margin:'0 18px 16px' }}>
              <div style={{ background:cat.soft, borderRadius:10, padding:'10px 13px', border:`1px solid ${cat.color}30` }}>
                <p style={{ fontSize:11.5, color:'var(--text-2)', margin:0, lineHeight:1.65, fontFamily:"'DM Sans',sans-serif" }}>{cat.advice}</p>
              </div>
            </div>
          </div>
          <BreakdownTable title="Body Composition" rows={[
            { label:'Body fat %',   value:`${fatPct.toFixed(1)}%`, bold:true, highlight:true, color:cat.color },
            { label:'Category',     value:cat.label, color:cat.color },
            { label:'Fat mass',     value:fmtKg(fatKg), color:'#e07010' },
            { label:'Lean mass',    value:fmtKg(leanKg), color:catColor },
            { label:'Total weight', value:fmtKg(weightK) },
            { label:'Range',        value:cat.range },
          ]}/>
          <AIHintCard hint={hint}/>
        </>}
      />

      {/* What your fat mass feels like */}
      <Sec title="What your fat mass feels like" sub="Turning numbers into something tangible">
        <p style={{ fontSize:12, color:'var(--text-2)', lineHeight:1.7, marginBottom:14, fontFamily:"'DM Sans',sans-serif" }}>
          It's easy to ignore percentages on a screen. Here's what your fat mass — {fmtKg(fatKg)} — actually weighs in everyday terms.
        </p>
        <div style={{ display:'flex', alignItems:'center', gap:14, background:'var(--bg-raised)', borderRadius:10, padding:'14px 16px', border:`1px solid ${cat.color}25` }}>
          <span style={{ fontSize:32, flexShrink:0 }}>🏋️</span>
          <div>
            <div style={{ fontSize:13, fontWeight:700, color:'var(--text)', marginBottom:3 }}>
              Your body is carrying <span style={{ color:cat.color }}>{fmtKg(fatKg)}</span> of fat mass
            </div>
            <div style={{ fontSize:12, color:'var(--text-2)', lineHeight:1.6, fontFamily:"'DM Sans',sans-serif" }}>
              That's roughly the weight of <strong style={{ color:'var(--text)', fontWeight:600 }}>{wObj.label}</strong>. Your lean mass of <strong style={{ fontWeight:600 }}>{fmtKg(leanKg)}</strong> — muscle, bone, organs, and water — is doing all the work.
            </div>
          </div>
        </div>
      </Sec>

      {/* Athlete comparison */}
      <Sec title="How you compare to athletes" sub="Body fat % benchmarks by sport">
        <p style={{ fontSize:12, color:'var(--text-2)', lineHeight:1.7, marginBottom:14, fontFamily:"'DM Sans',sans-serif" }}>
          Different sports demand very different body compositions. Here's where your {fatPct.toFixed(1)}% sits relative to typical athletes in each discipline.
        </p>
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {ATHLETE_BENCHMARKS.map((b,i) => {
            const ref = sex==='male' ? b.malePct : b.femalePct
            const isYou = i===ATHLETE_BENCHMARKS.length-1
            return (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'9px 12px', borderRadius:8, background:'var(--bg-raised)', border:'0.5px solid var(--border)' }}>
                <div style={{ width:120, fontSize:12, fontWeight:600, color:'var(--text)', flexShrink:0 }}>{b.sport}</div>
                <div style={{ flex:1, height:6, background:'var(--border)', borderRadius:3, position:'relative' }}>
                  <div style={{ height:'100%', width:`${(ref/60)*100}%`, background: isYou ? 'var(--text-3)' : catColor+'80', borderRadius:3 }}/>
                  <div style={{ position:'absolute', top:-5, width:2, height:16, background:cat.color, borderRadius:1, left:`${(fatPct/60)*100}%` }}/>
                </div>
                <div style={{ fontSize:12, fontWeight:700, color: isYou ? cat.color : 'var(--text-2)', minWidth:36, textAlign:'right' }}>{ref}%</div>
              </div>
            )
          })}
        </div>
        <div style={{ fontSize:10, color:'var(--text-3)', marginTop:8, fontFamily:"'DM Sans',sans-serif" }}>
          <span style={{ display:'inline-block', width:10, height:10, background:cat.color, borderRadius:1, marginRight:4, verticalAlign:'middle' }}/>
          Vertical line = your current body fat %
        </div>
      </Sec>

      {/* Formula */}
      <Sec title="The science behind the numbers" sub="US Navy method formula">
        <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:14 }}>
          {[
            { label:'Male (US Navy)',   formula:'BF% = 495 ÷ (1.0324 − 0.19077 × log₁₀(waist − neck) + 0.15456 × log₁₀(height)) − 450' },
            { label:'Female (US Navy)', formula:'BF% = 495 ÷ (1.29579 − 0.35004 × log₁₀(waist + hip − neck) + 0.22100 × log₁₀(height)) − 450' },
          ].map(f=>(
            <div key={f.label}>
              <div style={{ fontSize:10, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.05em', marginBottom:4 }}>{f.label}</div>
              <div style={{ background:'var(--bg-raised)', borderRadius:8, padding:'10px 14px', fontFamily:'monospace', fontSize:11, color:catColor, fontWeight:600, overflowX:'auto', whiteSpace:'nowrap' }}>{f.formula}</div>
            </div>
          ))}
        </div>
        <p style={{ fontSize:12, color:'var(--text-2)', lineHeight:1.75, margin:0, fontFamily:"'DM Sans',sans-serif" }}>The US Navy circumference method is validated to within ±3–4% of DEXA scan results. Measurements are in inches in the original formula. For clinical precision, use a DEXA scan or hydrostatic weighing.</p>
      </Sec>

      {/* Examples */}
      <Sec title="Real world examples" sub="Click any to prefill the calculator">
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
          {EXAMPLES.map((ex,i)=>{
            const bf = clamp(calcBodyFat(ex.hCm, ex.wKg, ex.waistCm, ex.neckCm, ex.hipCm, ex.sex),2,65)
            const c  = getCat(bf, ex.sex)
            return (
              <button key={i} onClick={()=>applyExample(ex)}
                style={{ padding:14, borderRadius:10, border:'1.5px solid var(--border)', background:'var(--bg-raised)', cursor:'pointer', textAlign:'left', transition:'all .15s' }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=catColor;e.currentTarget.style.background=catColor+'10'}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.background='var(--bg-raised)'}}>
                <div style={{ fontSize:13, fontWeight:700, color:'var(--text)', marginBottom:2 }}>{ex.title}</div>
                <div style={{ fontSize:11, color:'var(--text-3)', marginBottom:9, lineHeight:1.4 }}>{ex.desc}</div>
                {[['Body Fat',`${bf.toFixed(1)}%`],['Fat Mass',fmtKg(ex.wKg*(bf/100))],['Lean Mass',fmtKg(ex.wKg*(1-bf/100))]].map(([k,v])=>(
                  <div key={k} style={{ display:'flex', justifyContent:'space-between' }}>
                    <span style={{ fontSize:10, color:'var(--text-3)' }}>{k}</span>
                    <span style={{ fontSize:10, fontWeight:600, color:k==='Body Fat'?c.color:catColor }}>{v}</span>
                  </div>
                ))}
                <div style={{ marginTop:8, display:'flex', alignItems:'center' }}>
                  <span style={{ fontSize:9, fontWeight:700, background:c.color+'18', color:c.color, padding:'2px 8px', borderRadius:10 }}>{c.label}</span>
                  <span style={{ fontSize:10, fontWeight:700, color:catColor, marginLeft:'auto' }}>Apply →</span>
                </div>
              </button>
            )
          })}
        </div>
      </Sec>

      {/* Glossary */}
      <Sec title="Key terms explained" sub="Click any term to expand">
        <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:8 }}>
          {GLOSSARY.map((g,i)=><GlsTerm key={i} term={g.term} def={g.def} catColor={catColor}/>)}
        </div>
      </Sec>

      <HealthJourneyNext catColor={catColor} intro="Body fat % gives you a clearer picture than BMI alone. Continue building your full health profile with these calculators." items={JOURNEY_ITEMS}/>

      {/* FAQ */}
      <Sec title="Frequently asked questions" sub="Everything about body fat %">
        {FAQ.map((f,i)=>(
          <Acc key={i} q={f.q} a={f.a} open={openFaq===i} onToggle={()=>setOpenFaq(openFaq===i?null:i)} catColor={catColor}/>
        ))}
      </Sec>
    </div>
  )
}
