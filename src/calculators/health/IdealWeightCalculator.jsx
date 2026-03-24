import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'
import HealthJourneyNext from '../../components/health/HealthJourneyNext'

const clamp  = (v,a,b) => Math.min(b,Math.max(a,v))
const fmtKg  = n => `${(Math.round(n*10)/10).toFixed(1)} kg`
const fmtLbs = n => `${(Math.round(n*2.20462*10)/10).toFixed(1)} lbs`
const fmtCm  = n => `${Math.round(n)} cm`
const fmtFtIn= (ft,i) => `${ft}′ ${i}″`

/* ── formulas ── all return kg ── */
function calcDevine(hCm, sex) {
  const hIn = hCm/2.54
  return sex==='male' ? 50 + 2.3*(hIn-60) : 45.5 + 2.3*(hIn-60)
}
function calcRobinson(hCm, sex) {
  const hIn = hCm/2.54
  return sex==='male' ? 52 + 1.9*(hIn-60) : 49 + 1.7*(hIn-60)
}
function calcMiller(hCm, sex) {
  const hIn = hCm/2.54
  return sex==='male' ? 56.2 + 1.41*(hIn-60) : 53.1 + 1.36*(hIn-60)
}
function calcHamwi(hCm, sex) {
  const hIn = hCm/2.54
  return sex==='male' ? 48 + 2.7*(hIn-60) : 45.5 + 2.2*(hIn-60)
}
function calcBMI(hCm) { return 22*(hCm/100)*(hCm/100) }

const FRAME_MULT = { small:0.95, medium:1.0, large:1.06 }

const GLOSSARY = [
  { term:'Devine Formula',   def:'1974 formula created for drug dosing. Uses height only. Most cited in clinical settings.' },
  { term:'Robinson Formula', def:'1983 revision of Devine, slightly lower estimates. Commonly used in nutrition.' },
  { term:'Miller Formula',   def:'1983 formula producing the most conservative (lowest) estimates of the five.' },
  { term:'Hamwi Formula',    def:'1964 formula, the oldest and simplest. Slightly higher estimates than others.' },
  { term:'BMI Method',       def:'Uses BMI 22 (midpoint of healthy range 18.5–24.9) × height² to estimate ideal weight.' },
  { term:'Frame Size',       def:'Wrist circumference relative to height. Determines bone structure — adjusts ideal weight up (large) or down (small).' },
]

const FAQ = [
  { q:'Why do the formulas give different results?',
    a:'Each formula was derived from a different study population and era (1964–1983). They use only height and sex as inputs, ignoring muscle mass, bone density, and age. The spread between formulas is typically 2–5 kg — take the range as a guide rather than any single number as an exact target.' },
  { q:'Is there really one "ideal" weight?',
    a:'No. The concept of a single ideal weight is outdated. A healthy weight range (BMI 18.5–24.9) is more meaningful than a single number. Within that range, factors like muscle mass, bone density, and individual health markers determine what is optimal for you specifically.' },
  { q:'How do I determine my frame size?',
    a:'Wrap your thumb and middle finger around your wrist. If they overlap, you have a small frame. If they just touch, medium. If they do not touch, large. Alternatively, divide your height in cm by your wrist circumference in cm — values > 10.4 (male) or > 11 (female) indicate small frame.' },
  { q:'Should I aim for the average of all formulas?',
    a:'The consensus range (overlap of all formulas) is generally the most evidence-informed target. The BMI-based estimate (BMI 22) is the most widely used clinical reference. The Robinson formula is most commonly cited in nutrition literature. Pick one as your primary reference and use the range as context.' },
]

const EXAMPLES = [
  { title:'Tall Male',    desc:'Large frame, 185 cm',  hCm:185, wKg:92, sex:'male',   frame:'large'  },
  { title:'Average Female',desc:'Medium frame, 165 cm', hCm:165, wKg:72, sex:'female', frame:'medium' },
  { title:'Petite Female', desc:'Small frame, 155 cm',  hCm:155, wKg:55, sex:'female', frame:'small'  },
]

const JOURNEY_ITEMS = [
  { title:'BMI Calculator',   sub:'How does your weight compare to your height?', icon:'⚖️', path:'/health/body-metrics/bmi-calculator'      },
  { title:'BMR & Calories',   sub:'Calories needed to reach your ideal weight',    icon:'🔥', path:'/health/body-metrics/bmr-calculator'      },
  { title:'Body Fat %',       sub:'Is your weight fat or muscle?',                 icon:'💪', path:'/health/body-metrics/body-fat-calculator'  },
]

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

const UNIT_OPTIONS = [
  { value:'metric',   label:'Metric',   sub:'cm · kg', icon:<><rect x="3" y="2" width="16" height="18" rx="2.5"/><line x1="7" y1="7.5" x2="15" y2="7.5"/><line x1="7" y1="11" x2="15" y2="11"/><line x1="7" y1="14.5" x2="12" y2="14.5"/></> },
  { value:'imperial', label:'Imperial', sub:'ft · lbs', icon:<><rect x="3" y="2" width="16" height="18" rx="2.5"/><line x1="7" y1="7.5" x2="15" y2="7.5"/><line x1="7" y1="11" x2="15" y2="11"/><line x1="7" y1="14.5" x2="12" y2="14.5"/></> },
]
const SEX_OPTIONS = [
  { value:'male',   label:'Male',   icon:<><circle cx="11" cy="9" r="5"/><line x1="11" y1="14" x2="11" y2="20"/><line x1="8" y1="17" x2="14" y2="17"/></> },
  { value:'female', label:'Female', icon:<><circle cx="11" cy="8.5" r="5"/><line x1="11" y1="13.5" x2="11" y2="20"/><line x1="8" y1="17" x2="14" y2="17"/></> },
]
const FRAME_OPTIONS = [
  { value:'small',  label:'Small',  sub:'Thumb overlaps',  icon:<><circle cx="11" cy="11" r="6"/><path d="M7 11h8"/></> },
  { value:'medium', label:'Medium', sub:'Thumb just meets', icon:<><circle cx="11" cy="11" r="6"/><path d="M7 11h8"/><path d="M11 7v8"/></> },
  { value:'large',  label:'Large',  sub:'Gap between',      icon:<><circle cx="11" cy="11" r="6"/></> },
]

const FORMULA_COLORS = ['#22a355','#0ea5e9','#f59e0b','#8b5cf6','#ef4444']
const FORMULA_NAMES  = ['Devine','Robinson','Miller','Hamwi','BMI (22)']

export default function IdealWeightCalculator({ meta, category }) {
  const catColor = category?.color || '#22a355'
  const [unit,    setUnit]    = useState('metric')
  const [hCm,     setHCm]     = useState(170)
  const [hFt,     setHFt]     = useState(5)
  const [hIn,     setHIn]     = useState(7)
  const [wKg,     setWKg]     = useState(75)
  const [wLbs,    setWLbs]    = useState(165)
  const [sex,     setSex]     = useState('male')
  const [frame,   setFrame]   = useState('medium')
  const [openFaq, setOpenFaq] = useState(null)

  function handleUnit(u) {
    if (u===unit) return
    if (u==='imperial') { const ti=Math.round(hCm/2.54); setHFt(Math.floor(ti/12)); setHIn(ti%12); setWLbs(Math.round(wKg*2.20462)) }
    else { setHCm(clamp(Math.round((hFt*12+hIn)*2.54),100,250)); setWKg(clamp(Math.round(wLbs/2.20462),20,300)) }
    setUnit(u)
  }
  function applyExample(ex) {
    setHCm(ex.hCm); setWKg(ex.wKg); setSex(ex.sex); setFrame(ex.frame)
    const ti=Math.round(ex.hCm/2.54); setHFt(Math.floor(ti/12)); setHIn(ti%12); setWLbs(Math.round(ex.wKg*2.20462)); setUnit('metric')
  }

  const isM    = unit==='metric'
  const hM     = isM ? hCm/100 : (hFt*12+hIn)*0.0254
  const hCmVal = hM*100
  const wKgVal = isM ? wKg : wLbs/2.20462
  const wFmt   = kg => isM ? fmtKg(kg) : fmtLbs(kg)

  const mult = FRAME_MULT[frame]
  const results = [
    calcDevine(hCmVal,sex),
    calcRobinson(hCmVal,sex),
    calcMiller(hCmVal,sex),
    calcHamwi(hCmVal,sex),
    calcBMI(hCmVal),
  ].map(v => v*mult)

  const avg = results.reduce((s,v)=>s+v,0)/results.length
  const minR = Math.min(...results)
  const maxR = Math.max(...results)
  const diff = wKgVal - avg
  const maxBar = maxR * 1.3

  const hint = `Ideal weight consensus: ${wFmt(avg)} (range ${wFmt(minR)}–${wFmt(maxR)}). You are currently ${Math.abs(diff)<1?'at your ideal weight':diff>0?`${wFmt(diff)} above`:`${wFmt(Math.abs(diff))} below`} the average across all formulas.`

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <CalcShell
        left={<>
          <IconCardGroup label="Unit system" options={UNIT_OPTIONS} value={unit} onChange={handleUnit} catColor={catColor}/>
          <div style={{ borderTop:'0.5px solid var(--border)', paddingTop:16 }}>
            <div style={{ fontSize:10, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:14 }}>Measurements</div>
            {isM
              ? <Stepper label="Height" value={hCm} onChange={setHCm} min={100} max={250} unit="cm" catColor={catColor}/>
              : <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                  <Stepper label="Feet" value={hFt} onChange={setHFt} min={3} max={7} unit="ft" catColor={catColor}/>
                  <Stepper label="Inches" value={hIn} onChange={setHIn} min={0} max={11} unit="in" catColor={catColor}/>
                </div>
            }
            {isM
              ? <Stepper label="Current weight" value={wKg} onChange={setWKg} min={20} max={300} unit="kg" catColor={catColor}/>
              : <Stepper label="Current weight" value={wLbs} onChange={setWLbs} min={44} max={660} unit="lbs" catColor={catColor}/>
            }
          </div>
          <div style={{ borderTop:'0.5px solid var(--border)', paddingTop:16, marginTop:4 }}>
            <IconCardGroup label="Biological sex" options={SEX_OPTIONS} value={sex} onChange={setSex} catColor={catColor}/>
          </div>
          <div style={{ borderTop:'0.5px solid var(--border)', paddingTop:16, marginTop:4 }}>
            <IconCardGroup label="Frame size" options={FRAME_OPTIONS} value={frame} onChange={setFrame} catColor={catColor}/>
            <p style={{ fontSize:11, color:'var(--text-3)', marginTop:-8, lineHeight:1.5, fontFamily:"'DM Sans',sans-serif" }}>
              Wrap thumb + middle finger around wrist. Overlapping = small, touching = medium, gap = large.
            </p>
          </div>
        </>}
        right={<>
          <div style={{ background:'var(--bg-card)', border:'0.5px solid var(--border)', borderRadius:14, overflow:'hidden', marginBottom:14 }}>
            <div style={{ padding:'11px 16px', borderBottom:'0.5px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontSize:12, fontWeight:700, color:'var(--text)', fontFamily:"'Space Grotesk',sans-serif" }}>Ideal Weight</span>
              <span style={{ fontSize:10, color:'var(--text-3)' }}>5 formulas compared</span>
            </div>
            <div style={{ padding:'16px 18px' }}>
              {/* big consensus number */}
              <div style={{ display:'flex', alignItems:'flex-end', gap:12, marginBottom:16 }}>
                <div>
                  <div style={{ fontSize:48, fontWeight:700, lineHeight:1, color:catColor, fontFamily:"'Space Grotesk',sans-serif" }}>
                    {wFmt(avg)}
                  </div>
                  <div style={{ fontSize:11, color:'var(--text-3)', marginTop:3, fontFamily:"'DM Sans',sans-serif" }}>Average across all formulas</div>
                </div>
                <div style={{ paddingBottom:6 }}>
                  <div style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'5px 12px 5px 8px', borderRadius:20, background: Math.abs(diff)<2 ? '#d6f2e0' : diff>0 ? '#fdf3d0' : '#dbeafe', border:`1px solid ${Math.abs(diff)<2?catColor:diff>0?'#f59e0b':'#0ea5e9'}35` }}>
                    <div style={{ width:8, height:8, borderRadius:'50%', background: Math.abs(diff)<2?catColor:diff>0?'#f59e0b':'#0ea5e9' }}/>
                    <span style={{ fontSize:12, fontWeight:700, color: Math.abs(diff)<2?catColor:diff>0?'#92400e':'#1e40af', fontFamily:"'DM Sans',sans-serif" }}>
                      {Math.abs(diff)<1 ? 'At ideal weight' : diff>0 ? `${wFmt(diff)} above` : `${wFmt(Math.abs(diff))} below`}
                    </span>
                  </div>
                </div>
              </div>

              {/* formula bars */}
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {FORMULA_NAMES.map((name,i) => {
                  const val = results[i]
                  const pct = (val/maxBar)*100
                  const youPct = (wKgVal/maxBar)*100
                  return (
                    <div key={i}>
                      <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, marginBottom:4 }}>
                        <span style={{ color:'var(--text-2)', fontWeight:500 }}>{name}</span>
                        <span style={{ fontWeight:700, color:FORMULA_COLORS[i] }}>{wFmt(val)}</span>
                      </div>
                      <div style={{ height:8, background:'var(--border)', borderRadius:4, position:'relative', overflow:'visible' }}>
                        <div style={{ height:'100%', width:`${pct}%`, background:FORMULA_COLORS[i], borderRadius:4, opacity:0.7, transition:'width .4s ease' }}/>
                        {/* current weight marker */}
                        <div style={{ position:'absolute', top:-3, width:2, height:14, background:'var(--text)', borderRadius:1, left:`${clamp(youPct,0,99)}%` }}/>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div style={{ fontSize:10, color:'var(--text-3)', marginTop:8, fontFamily:"'DM Sans',sans-serif" }}>
                <span style={{ display:'inline-block', width:8, height:8, background:'var(--text)', borderRadius:1, marginRight:4, verticalAlign:'middle' }}/>Your current weight
              </div>
            </div>
          </div>

          <BreakdownTable title="Ideal Weight Summary" rows={[
            { label:'Consensus (average)', value:wFmt(avg), bold:true, highlight:true, color:catColor },
            { label:'Range',               value:`${wFmt(minR)} – ${wFmt(maxR)}` },
            { label:'Devine formula',      value:wFmt(results[0]), color:FORMULA_COLORS[0] },
            { label:'Robinson formula',    value:wFmt(results[1]), color:FORMULA_COLORS[1] },
            { label:'Miller formula',      value:wFmt(results[2]), color:FORMULA_COLORS[2] },
            { label:'Hamwi formula',       value:wFmt(results[3]), color:FORMULA_COLORS[3] },
            { label:'BMI method (22)',     value:wFmt(results[4]), color:FORMULA_COLORS[4] },
            { label:'Difference from avg', value: Math.abs(diff)<1?'At ideal':`${diff>0?'+':''}${wFmt(diff)}`, color: Math.abs(diff)<1?catColor:diff>0?'#e07010':'#0ea5e9' },
          ]}/>
          <AIHintCard hint={hint}/>
        </>}
      />

      {/* Why formulas disagree */}
      <Sec title="Why the formulas give different numbers" sub="Understanding the consensus range">
        <p style={{ fontSize:12, color:'var(--text-2)', lineHeight:1.7, marginBottom:14, fontFamily:"'DM Sans',sans-serif" }}>
          All five formulas were created between 1964 and 1983 — before modern understanding of body composition — using different study populations and purposes. None account for muscle mass, bone density, or age. The spread of {wFmt(maxR-minR)} between the highest and lowest results is normal and expected. Use the consensus range, not any single formula, as your reference.
        </p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:8 }}>
          {[
            { name:'Devine (1974)',   use:'Originally for drug dosing — most cited in clinical settings' },
            { name:'Robinson (1983)', use:'Nutrition literature — slightly lower than Devine' },
            { name:'Miller (1983)',   use:'Most conservative estimates — lowest of the five' },
            { name:'Hamwi (1964)',    use:'Oldest formula — slightly higher than modern estimates' },
            { name:'BMI method',     use:'Uses BMI 22 (midpoint of 18.5–24.9 healthy range)' },
          ].map((f,i) => (
            <div key={i} style={{ padding:'10px 12px', borderRadius:8, background:'var(--bg-raised)', border:'0.5px solid var(--border)' }}>
              <div style={{ fontSize:12, fontWeight:700, color:FORMULA_COLORS[i], marginBottom:3 }}>{f.name}</div>
              <div style={{ fontSize:11, color:'var(--text-2)', lineHeight:1.5, fontFamily:"'DM Sans',sans-serif" }}>{f.use}</div>
            </div>
          ))}
        </div>
      </Sec>

      {/* Formula */}
      <Sec title="The science behind the numbers" sub="All 5 formulas">
        <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:14 }}>
          {[
            { label:'Devine', formula:'Male: 50 + 2.3×(height_in − 60)   |   Female: 45.5 + 2.3×(height_in − 60)' },
            { label:'Robinson', formula:'Male: 52 + 1.9×(height_in − 60)   |   Female: 49 + 1.7×(height_in − 60)' },
            { label:'Miller', formula:'Male: 56.2 + 1.41×(height_in − 60)   |   Female: 53.1 + 1.36×(height_in − 60)' },
            { label:'Hamwi', formula:'Male: 48 + 2.7×(height_in − 60)   |   Female: 45.5 + 2.2×(height_in − 60)' },
            { label:'BMI method', formula:'Ideal = 22 × height_m²' },
          ].map((f,i)=>(
            <div key={f.label}>
              <div style={{ fontSize:10, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.05em', marginBottom:4 }}>{f.label}</div>
              <div style={{ background:'var(--bg-raised)', borderRadius:8, padding:'10px 14px', fontFamily:'monospace', fontSize:11, color:FORMULA_COLORS[i], fontWeight:600, overflowX:'auto', whiteSpace:'nowrap' }}>{f.formula}</div>
            </div>
          ))}
        </div>
        <p style={{ fontSize:12, color:'var(--text-2)', lineHeight:1.75, margin:0, fontFamily:"'DM Sans',sans-serif" }}>All formulas output kilograms and use height above 5 feet (60 inches) as input. Frame size multiplier: small ×0.95, medium ×1.0, large ×1.06.</p>
      </Sec>

      {/* Examples */}
      <Sec title="Real world examples" sub="Click any to prefill the calculator">
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
          {EXAMPLES.map((ex,i)=>{
            const mult2=FRAME_MULT[ex.frame]
            const avg2=[calcDevine(ex.hCm,ex.sex),calcRobinson(ex.hCm,ex.sex),calcMiller(ex.hCm,ex.sex),calcHamwi(ex.hCm,ex.sex),calcBMI(ex.hCm)].reduce((s,v)=>s+v*mult2,0)/5
            return (
              <button key={i} onClick={()=>applyExample(ex)}
                style={{ padding:14, borderRadius:10, border:'1.5px solid var(--border)', background:'var(--bg-raised)', cursor:'pointer', textAlign:'left', transition:'all .15s' }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=catColor;e.currentTarget.style.background=catColor+'10'}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.background='var(--bg-raised)'}}>
                <div style={{ fontSize:13, fontWeight:700, color:'var(--text)', marginBottom:2 }}>{ex.title}</div>
                <div style={{ fontSize:11, color:'var(--text-3)', marginBottom:9, lineHeight:1.4 }}>{ex.desc}</div>
                {[['Height',fmtCm(ex.hCm)],['Current',fmtKg(ex.wKg)],['Ideal',fmtKg(avg2)]].map(([k,v])=>(
                  <div key={k} style={{ display:'flex', justifyContent:'space-between' }}>
                    <span style={{ fontSize:10, color:'var(--text-3)' }}>{k}</span>
                    <span style={{ fontSize:10, fontWeight:600, color:k==='Ideal'?catColor:'var(--text-2)' }}>{v}</span>
                  </div>
                ))}
                <div style={{ marginTop:8, textAlign:'right' }}>
                  <span style={{ fontSize:10, fontWeight:700, color:catColor }}>Apply →</span>
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

      <HealthJourneyNext catColor={catColor} intro="Ideal weight gives you a target. Now use these calculators to understand your body composition and calorie needs to get there." items={JOURNEY_ITEMS}/>

      <Sec title="Frequently asked questions" sub="Everything about ideal weight formulas">
        {FAQ.map((f,i)=>(
          <Acc key={i} q={f.q} a={f.a} open={openFaq===i} onToggle={()=>setOpenFaq(openFaq===i?null:i)} catColor={catColor}/>
        ))}
      </Sec>
    </div>
  )
}
