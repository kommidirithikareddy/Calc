import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'
import HealthJourneyNext from '../../components/health/HealthJourneyNext'

const clamp  = (v,a,b) => Math.min(b,Math.max(a,v))
const fmtKg  = n => `${(Math.round(n*10)/10).toFixed(1)} kg`

const SPORT_BENCHMARKS = [
  { sport:'Marathon runner',  maleLBM:62, femaleLBM:48, icon:'🏃' },
  { sport:'Swimmer',          maleLBM:74, femaleLBM:56, icon:'🏊' },
  { sport:'Cyclist',          maleLBM:66, femaleLBM:50, icon:'🚴' },
  { sport:'Football player',  maleLBM:78, femaleLBM:58, icon:'⚽' },
  { sport:'Weightlifter',     maleLBM:82, femaleLBM:60, icon:'🏋️' },
  { sport:'Average adult',    maleLBM:58, femaleLBM:44, icon:'🧑' },
]

const GLOSSARY = [
  { term:'Lean Body Mass',   def:'Everything in your body except fat — muscle (~43%), water (~42%), bone (~15%), organs and connective tissue.' },
  { term:'Boer Formula',     def:'1984 formula for LBM: Male: 0.407w + 0.267h − 19.2. Female: 0.252w + 0.473h − 48.3. Most widely validated.' },
  { term:'Fat-Free Mass',    def:'Synonymous with Lean Body Mass. Sometimes used interchangeably in clinical literature.' },
  { term:'Skeletal Muscle',  def:'The largest component of LBM (~43% of body weight in healthy adults). The primary determinant of metabolic rate and strength.' },
  { term:'Protein Synthesis',def:'The process by which cells build new proteins (muscle). Stimulated by resistance training and adequate protein intake (1.6–2.2g/kg LBM).' },
  { term:'FFMI',             def:'Fat-Free Mass Index — LBM ÷ height² (m²). A body-composition-adjusted alternative to BMI. Values > 25 (male) are exceptional.' },
]

const FAQ = [
  { q:'What is lean body mass?',
    a:'Lean body mass (LBM) is your total body weight minus fat mass. It includes skeletal muscle (~43%), body water (~42%), bone mineral (~15%), and organs, skin, and connective tissue (~0%). LBM is the metabolically active component — it determines your BMR and strength capacity.' },
  { q:'How accurate is the Boer formula?',
    a:'The Boer formula (1984) is the most validated LBM equation for general populations, with a mean error of approximately ±2–3 kg compared to DEXA scan. It tends to slightly overestimate LBM in obese individuals and underestimate in very lean, muscular athletes. For clinical precision, DEXA scanning remains the gold standard.' },
  { q:'How much protein do I need based on LBM?',
    a:'Current evidence supports 1.6–2.2g of protein per kg of LBM per day for individuals engaged in resistance training. Higher intakes (up to 3.1g/kg LBM) may benefit advanced athletes in a calorie deficit. At minimum, 1.2g/kg LBM prevents muscle loss during weight management.' },
  { q:'What is FFMI and why does it matter?',
    a:'Fat-Free Mass Index (FFMI) = LBM ÷ height². It measures muscularity independent of body fat. Average males score 18–20, well-trained athletes 22–24, and values above 25 are considered the natural physiological ceiling for drug-free athletes. FFMI is more meaningful than BMI for muscular individuals.' },
]

const EXAMPLES = [
  { title:'Lean Athlete',   desc:'Male runner, 10% body fat',  hCm:178, wKg:72, sex:'male',   fatPct:10 },
  { title:'Average Adult',  desc:'Female, 27% body fat',       hCm:165, wKg:68, sex:'female', fatPct:27 },
  { title:'High Muscle',    desc:'Male bodybuilder, 8% fat',   hCm:182, wKg:92, sex:'male',   fatPct:8  },
]

const JOURNEY_ITEMS = [
  { title:'Body Fat %',   sub:'How much of your weight is fat?',    icon:'💪', path:'/health/body-metrics/body-fat-calculator'  },
  { title:'BMR & Calories',sub:'Calories needed to maintain muscle', icon:'🔥', path:'/health/body-metrics/bmr-calculator'       },
  { title:'Ideal Weight', sub:'What should your total weight be?',  icon:'⚖️', path:'/health/body-metrics/ideal-weight-calculator' },
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

export default function LeanBodyMassCalculator({ meta, category }) {
  const catColor = category?.color || '#22a355'
  const [unit,    setUnit]    = useState('metric')
  const [hCm,     setHCm]     = useState(175)
  const [hFt,     setHFt]     = useState(5)
  const [hIn,     setHIn]     = useState(9)
  const [wKg,     setWKg]     = useState(78)
  const [wLbs,    setWLbs]    = useState(172)
  const [sex,     setSex]     = useState('male')
  const [fatPct,  setFatPct]  = useState(18)
  const [useFat,  setUseFat]  = useState(false)
  const [openFaq, setOpenFaq] = useState(null)

  function handleUnit(u) {
    if (u===unit) return
    if (u==='imperial') { const ti=Math.round(hCm/2.54); setHFt(Math.floor(ti/12)); setHIn(ti%12); setWLbs(Math.round(wKg*2.20462)) }
    else { setHCm(clamp(Math.round((hFt*12+hIn)*2.54),100,250)); setWKg(clamp(Math.round(wLbs/2.20462),20,300)) }
    setUnit(u)
  }
  function applyExample(ex) {
    setHCm(ex.hCm); setWKg(ex.wKg); setSex(ex.sex); setFatPct(ex.fatPct); setUseFat(true)
    const ti=Math.round(ex.hCm/2.54); setHFt(Math.floor(ti/12)); setHIn(ti%12); setWLbs(Math.round(ex.wKg*2.20462)); setUnit('metric')
  }

  const isM    = unit==='metric'
  const hM     = isM ? hCm/100 : (hFt*12+hIn)*0.0254
  const wKgVal = isM ? wKg : wLbs/2.20462
  const hCmVal = hM*100

  // Boer formula
  const lbmBoer = sex==='male'
    ? 0.407*wKgVal + 0.267*hCmVal - 19.2
    : 0.252*wKgVal + 0.473*hCmVal - 48.3

  // if user provides body fat %
  const lbmFat  = wKgVal*(1-fatPct/100)
  const lbm     = useFat ? lbmFat : lbmBoer
  const fatKg   = wKgVal - lbm
  const fatPctCalc = (fatKg/wKgVal)*100

  // composition breakdown
  const muscleKg = lbm*0.43
  const waterKg  = lbm*0.42
  const boneKg   = lbm*0.15

  // FFMI
  const ffmi = lbm/(hM*hM)

  // protein needs
  const proteinMin = Math.round(lbm*1.6)
  const proteinMax = Math.round(lbm*2.2)

  const hint = `LBM: ${fmtKg(lbm)} (Boer formula). Fat mass: ${fmtKg(fatKg)} (${fatPctCalc.toFixed(1)}%). FFMI: ${ffmi.toFixed(1)}. Daily protein target: ${proteinMin}–${proteinMax}g.`

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <CalcShell
        left={<>
          <IconCardGroup label="Unit system" options={UNIT_OPTIONS} value={unit} onChange={handleUnit} catColor={catColor}/>
          <div style={{ borderTop:'0.5px solid var(--border)', paddingTop:16 }}>
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
          </div>
          <div style={{ borderTop:'0.5px solid var(--border)', paddingTop:16, marginTop:4 }}>
            <IconCardGroup label="Biological sex" options={SEX_OPTIONS} value={sex} onChange={setSex} catColor={catColor}/>
          </div>
          <div style={{ borderTop:'0.5px solid var(--border)', paddingTop:16, marginTop:4 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
              <div style={{ fontSize:12, fontWeight:600, color:'var(--text-2)', fontFamily:"'DM Sans',sans-serif" }}>Body fat % (optional)</div>
              <button onClick={()=>setUseFat(f=>!f)} style={{ fontSize:11, fontWeight:600, color:useFat?catColor:'var(--text-3)', background:useFat?catColor+'15':'var(--bg-raised)', border:`1px solid ${useFat?catColor:'var(--border)'}`, borderRadius:8, padding:'3px 10px', cursor:'pointer' }}>
                {useFat?'Using BF%':'Use BF%'}
              </button>
            </div>
            {useFat && <Stepper label="Your body fat %" value={fatPct} onChange={setFatPct} min={3} max={60} unit="%" hint="More accurate if known" catColor={catColor}/>}
            {!useFat && <p style={{ fontSize:11, color:'var(--text-3)', fontFamily:"'DM Sans',sans-serif', lineHeight:1.5" }}>Using Boer formula (height + weight + sex). Enable BF% above for more accuracy if you know your body fat.</p>}
          </div>
        </>}
        right={<>
          <div style={{ background:'var(--bg-card)', border:'0.5px solid var(--border)', borderRadius:14, overflow:'hidden', marginBottom:14 }}>
            <div style={{ padding:'11px 16px', borderBottom:'0.5px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontSize:12, fontWeight:700, color:'var(--text)', fontFamily:"'Space Grotesk',sans-serif" }}>Body Composition</span>
              <span style={{ fontSize:10, color:'var(--text-3)' }}>Updates live</span>
            </div>
            <div style={{ padding:'16px 18px' }}>
              {/* big LBM number */}
              <div style={{ display:'flex', alignItems:'flex-end', gap:12, marginBottom:16 }}>
                <div>
                  <div style={{ fontSize:48, fontWeight:700, lineHeight:1, color:catColor, fontFamily:"'Space Grotesk',sans-serif" }}>{fmtKg(lbm)}</div>
                  <div style={{ fontSize:11, color:'var(--text-3)', marginTop:3 }}>Lean body mass</div>
                </div>
                <div style={{ paddingBottom:6 }}>
                  <div style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'5px 12px 5px 8px', borderRadius:20, background:'#e0f2fe', border:`1px solid #0ea5e935` }}>
                    <div style={{ width:8, height:8, borderRadius:'50%', background:'#0ea5e9' }}/>
                    <span style={{ fontSize:12, fontWeight:700, color:'#0c4a6e', fontFamily:"'DM Sans',sans-serif" }}>FFMI {ffmi.toFixed(1)}</span>
                  </div>
                </div>
              </div>

              {/* lean vs fat bars */}
              {[
                { label:'Lean mass', kg:lbm,   pct:(lbm/wKgVal)*100,       color:catColor },
                { label:'Fat mass',  kg:fatKg, pct:(fatKg/wKgVal)*100,     color:'#f59e0b' },
              ].map((r,i) => (
                <div key={i} style={{ marginBottom:10 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, marginBottom:4 }}>
                    <span style={{ color:'var(--text-2)' }}>{r.label}</span>
                    <span style={{ fontWeight:700, color:r.color }}>{fmtKg(r.kg)} ({r.pct.toFixed(1)}%)</span>
                  </div>
                  <div style={{ height:6, background:'var(--border)', borderRadius:3 }}>
                    <div style={{ height:'100%', width:`${r.pct}%`, background:r.color, borderRadius:3, transition:'width .4s ease' }}/>
                  </div>
                </div>
              ))}

              {/* LBM breakdown */}
              <div style={{ marginTop:12, padding:'10px 12px', background:'var(--bg-raised)', borderRadius:8, border:'0.5px solid var(--border)' }}>
                <div style={{ fontSize:10, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.05em', marginBottom:8 }}>LBM breakdown (estimate)</div>
                <div style={{ display:'flex', gap:2, height:8, borderRadius:4, overflow:'hidden', marginBottom:6 }}>
                  <div style={{ flex:43, background:catColor }}/>
                  <div style={{ flex:42, background:'#0ea5e9' }}/>
                  <div style={{ flex:15, background:'#8b5cf6' }}/>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:4 }}>
                  {[{label:'Muscle',color:catColor,kg:muscleKg,pct:43},{label:'Water',color:'#0ea5e9',kg:waterKg,pct:42},{label:'Bone',color:'#8b5cf6',kg:boneKg,pct:15}].map((c,i)=>(
                    <div key={i} style={{ textAlign:'center' }}>
                      <div style={{ fontSize:9, color:c.color, fontWeight:700 }}>{c.label}</div>
                      <div style={{ fontSize:11, fontWeight:700, color:'var(--text)' }}>{fmtKg(c.kg)}</div>
                      <div style={{ fontSize:9, color:'var(--text-3)' }}>{c.pct}%</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <BreakdownTable title="LBM Summary" rows={[
            { label:'Lean body mass',   value:fmtKg(lbm), bold:true, highlight:true, color:catColor },
            { label:'Fat mass',         value:`${fmtKg(fatKg)} (${fatPctCalc.toFixed(1)}%)`, color:'#f59e0b' },
            { label:'FFMI',             value:ffmi.toFixed(1), color:'#0ea5e9' },
            { label:'Est. muscle mass', value:fmtKg(muscleKg) },
            { label:'Est. bone mass',   value:fmtKg(boneKg)   },
            { label:'Protein min',      value:`${proteinMin}g/day`, color:catColor },
            { label:'Protein max',      value:`${proteinMax}g/day`, color:catColor },
            { label:'Formula',          value:useFat?'Body fat %':'Boer formula' },
          ]}/>
          <AIHintCard hint={hint}/>
        </>}
      />

      {/* Sport benchmarks */}
      <Sec title="Your LBM vs sport benchmarks" sub="Typical lean mass by discipline">
        <p style={{ fontSize:12, color:'var(--text-2)', lineHeight:1.7, marginBottom:14, fontFamily:"'DM Sans',sans-serif" }}>
          Different sports demand different amounts of lean mass. Here's how your {fmtKg(lbm)} of lean mass compares to typical athletes in each sport.
        </p>
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {SPORT_BENCHMARKS.map((b,i) => {
            const ref = sex==='male' ? b.maleLBM : b.femaleLBM
            const maxVal = Math.max(...SPORT_BENCHMARKS.map(x=>sex==='male'?x.maleLBM:x.femaleLBM))*1.1
            const isLast = i===SPORT_BENCHMARKS.length-1
            return (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 12px', borderRadius:8, background:'var(--bg-raised)', border:'0.5px solid var(--border)' }}>
                <span style={{ fontSize:16, flexShrink:0 }}>{b.icon}</span>
                <div style={{ width:120, fontSize:12, fontWeight:600, color:'var(--text)', flexShrink:0 }}>{b.sport}</div>
                <div style={{ flex:1, height:6, background:'var(--border)', borderRadius:3, position:'relative' }}>
                  <div style={{ height:'100%', width:`${(ref/maxVal)*100}%`, background:isLast?'var(--text-3)':catColor+'70', borderRadius:3 }}/>
                  <div style={{ position:'absolute', top:-4, width:2, height:14, background:catColor, borderRadius:1, left:`${(lbm/maxVal)*100}%` }}/>
                </div>
                <div style={{ fontSize:12, fontWeight:700, color:isLast?'var(--text-3)':'var(--text-2)', minWidth:44, textAlign:'right' }}>{ref} kg</div>
              </div>
            )
          })}
        </div>
        <div style={{ fontSize:10, color:'var(--text-3)', marginTop:8 }}>
          <span style={{ display:'inline-block', width:10, height:10, background:catColor, borderRadius:1, marginRight:4, verticalAlign:'middle' }}/>Your LBM
        </div>
      </Sec>

      {/* Protein needs */}
      <Sec title="Your daily protein target" sub="Based on lean body mass — the most accurate method">
        <p style={{ fontSize:12, color:'var(--text-2)', lineHeight:1.7, marginBottom:14, fontFamily:"'DM Sans',sans-serif" }}>
          Protein targets based on lean body mass are more accurate than total body weight — fat tissue doesn't need protein for repair or growth. The range below covers general fitness to competitive training.
        </p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
          {[
            { label:'Minimum',    g:Math.round(lbm*1.2), note:'Prevents muscle loss on a diet', color:'#0ea5e9' },
            { label:'Optimal',    g:Math.round(lbm*1.9), note:'Best for most active adults',    color:catColor  },
            { label:'Maximum',    g:Math.round(lbm*2.2), note:'Advanced athletes, heavy training', color:'#8b5cf6' },
          ].map((p,i)=>(
            <div key={i} style={{ background:'var(--bg-raised)', borderRadius:10, padding:'12px 14px', border:'0.5px solid var(--border)' }}>
              <div style={{ fontSize:10, color:'var(--text-3)', fontWeight:700, textTransform:'uppercase', letterSpacing:'.05em', marginBottom:4 }}>{p.label}</div>
              <div style={{ fontSize:26, fontWeight:700, color:p.color, fontFamily:"'Space Grotesk',sans-serif", marginBottom:2 }}>{p.g}g</div>
              <div style={{ fontSize:10, color:'var(--text-3)', lineHeight:1.5 }}>{p.note}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop:12, padding:'10px 14px', background:'var(--bg-raised)', borderRadius:8, border:'0.5px solid var(--border)' }}>
          <p style={{ fontSize:11.5, color:'var(--text-2)', margin:0, lineHeight:1.6, fontFamily:"'DM Sans',sans-serif" }}>
            Based on your LBM of {fmtKg(lbm)}: 1.2g/kg (minimum) = {Math.round(lbm*1.2)}g, 1.6g/kg = {Math.round(lbm*1.6)}g, 2.2g/kg (max) = {Math.round(lbm*2.2)}g per day. Spread across 3–5 meals for optimal muscle protein synthesis.
          </p>
        </div>
      </Sec>

      {/* Formula */}
      <Sec title="The science behind the numbers" sub="Boer formula for LBM">
        <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:14 }}>
          {[
            { label:'Boer — male',   formula:'LBM = (0.407 × weight_kg) + (0.267 × height_cm) − 19.2' },
            { label:'Boer — female', formula:'LBM = (0.252 × weight_kg) + (0.473 × height_cm) − 48.3' },
            { label:'FFMI',          formula:'FFMI = LBM (kg) ÷ height² (m²)' },
            { label:'From body fat %', formula:'LBM = total weight × (1 − body fat % ÷ 100)' },
          ].map(f=>(
            <div key={f.label}>
              <div style={{ fontSize:10, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.05em', marginBottom:4 }}>{f.label}</div>
              <div style={{ background:'var(--bg-raised)', borderRadius:8, padding:'10px 14px', fontFamily:'monospace', fontSize:11, color:catColor, fontWeight:600, overflowX:'auto', whiteSpace:'nowrap' }}>{f.formula}</div>
            </div>
          ))}
        </div>
        <p style={{ fontSize:12, color:'var(--text-2)', lineHeight:1.75, margin:0, fontFamily:"'DM Sans',sans-serif" }}>The Boer formula (1984) is the most validated LBM equation, accurate to ±2–3 kg vs DEXA scan. It slightly overestimates in obese individuals. Providing your body fat percentage (if known) gives a more accurate result.</p>
      </Sec>

      {/* Examples */}
      <Sec title="Real world examples" sub="Click any to prefill">
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
          {EXAMPLES.map((ex,i)=>{
            const lbm2 = ex.sex==='male' ? 0.407*ex.wKg+0.267*ex.hCm-19.2 : 0.252*ex.wKg+0.473*ex.hCm-48.3
            const ffmi2= lbm2/((ex.hCm/100)**2)
            return (
              <button key={i} onClick={()=>applyExample(ex)}
                style={{ padding:14, borderRadius:10, border:'1.5px solid var(--border)', background:'var(--bg-raised)', cursor:'pointer', textAlign:'left', transition:'all .15s' }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=catColor;e.currentTarget.style.background=catColor+'10'}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.background='var(--bg-raised)'}}>
                <div style={{ fontSize:13, fontWeight:700, color:'var(--text)', marginBottom:2 }}>{ex.title}</div>
                <div style={{ fontSize:11, color:'var(--text-3)', marginBottom:9, lineHeight:1.4 }}>{ex.desc}</div>
                {[['LBM',fmtKg(lbm2)],['Fat mass',fmtKg(ex.wKg-lbm2)],['FFMI',ffmi2.toFixed(1)]].map(([k,v])=>(
                  <div key={k} style={{ display:'flex', justifyContent:'space-between' }}>
                    <span style={{ fontSize:10, color:'var(--text-3)' }}>{k}</span>
                    <span style={{ fontSize:10, fontWeight:600, color:catColor }}>{v}</span>
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

      <HealthJourneyNext catColor={catColor} intro="Lean body mass tells you what your body is made of. Use these calculators to understand your full health picture." items={JOURNEY_ITEMS}/>

      <Sec title="Frequently asked questions" sub="Everything about lean body mass">
        {FAQ.map((f,i)=>(
          <Acc key={i} q={f.q} a={f.a} open={openFaq===i} onToggle={()=>setOpenFaq(openFaq===i?null:i)} catColor={catColor}/>
        ))}
      </Sec>
    </div>
  )
}
