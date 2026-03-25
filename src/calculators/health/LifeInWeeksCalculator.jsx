import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'

const clamp = (v,a,b) => Math.min(b, Math.max(a, v))

const LIFE_EXPECTANCY = { male:79, female:83, unknown:81 }

// Lifestyle modifiers to life expectancy (years added/subtracted)
const LIFESTYLE_FACTORS = [
  { key:'exercise',  label:'Exercise regularly (150+ min/week)', years:+4,  icon:'🏃' },
  { key:'smoking',   label:'Current smoker',                     years:-10, icon:'🚬' },
  { key:'sleep',     label:'Sleep 7–9 hours consistently',       years:+3,  icon:'😴' },
  { key:'diet',      label:'Healthy diet (Mediterranean-style)', years:+3,  icon:'🥗' },
  { key:'alcohol',   label:'Heavy drinker (>14 units/week)',      years:-5,  icon:'🍺' },
  { key:'obese',     label:'BMI over 30',                        years:-3,  icon:'⚖️' },
  { key:'social',    label:'Strong social connections',          years:+3,  icon:'👥' },
]

// Decade descriptors — what each decade typically looks like
const DECADE_DESCRIPTIONS = [
  { decade:0,  label:'0s',  title:'Childhood',          desc:'Play, curiosity, learning everything for the first time. The foundation of everything you will become.',              color:'#f59e0b' },
  { decade:10, label:'10s', title:'Adolescence',        desc:'Identity formation, school, first relationships. Intensity of emotion that adults rarely feel again.',              color:'#f97316' },
  { decade:20, label:'20s', title:'Exploration',        desc:'Education ends, career begins. Relationships deepen. Possibly the most defining decade for your life trajectory.',  color:'#3b82f6' },
  { decade:30, label:'30s', title:'Building',           desc:'Career, family, stability. Highest energy combined with growing wisdom. Many consider this the best decade.',       color:'#10b981' },
  { decade:40, label:'40s', title:'Peak prime',         desc:'Peak earning, peak influence. Children growing. Reassessment of earlier choices. Often a decade of recalibration.', color:'#22a355' },
  { decade:50, label:'50s', title:'Freedom approaching',desc:'Children leave home. Mortgage often paid. Growing freedom. Health still largely good but changes are noticed.',      color:'#8b5cf6' },
  { decade:60, label:'60s', title:'New chapter',        desc:'Retirement begins for many. Grandchildren. Freedom of time. Research shows happiness often peaks here.',             color:'#ec4899' },
  { decade:70, label:'70s', title:'Reflection',         desc:'Health becomes more central. Deep wisdom. Time for relationships becomes the priority. Still 10 years of living.', color:'#0ea5e9' },
  { decade:80, label:'80s', title:'Later life',         desc:'Health permitting, meaningful years. Longevity science is extending quality of life here significantly.',           color:'#94a3b8' },
]

const FAQ = [
  { q:'Why is looking at life in weeks useful?',
    a:"Seeing life as a finite grid makes abstract time tangible. Years feel long; a grid of small boxes makes remaining time feel real without being morbid — it's a prompt to use time deliberately rather than drift. Tim Urban's 2014 'Life in Weeks' article popularised this and changed how thousands of people approached decisions about time." },
  { q:'How accurate is the life expectancy figure?',
    a:'Life expectancy at birth is a population average — it is not a prediction for any individual. Roughly 25% is determined by genetics, ~50% by lifestyle, and ~25% by environment. Non-smokers live ~10 years longer. Regular exercise adds ~4–5 years. The lifestyle modifier tool here lets you adjust your baseline to reflect your own habits. Treat all numbers as useful approximations, not certainties.' },
  { q:'Is this calculator meant to be depressing?',
    a:"No — and most people find it clarifying rather than depressing. The goal is perspective, not anxiety. The insight isn't that life is short, but that it's specific: you have a rough sense of how many winters, summers, and Monday mornings you have left, and that specificity tends to make people more intentional about how they use them. It works best as a planning tool, not a source of dread." },
  { q:"What is the 'peak years' concept?",
    a:"Research on wellbeing shows life satisfaction follows a rough U-curve — lower in the 30s-40s (stress, responsibility, comparison), rising again in the 60s-80s (freedom, acceptance, gratitude). Physical peak is typically 25–35. The 'peak adult prime' where health, wisdom, and freedom overlap is roughly ages 30–60 — about 30 years, or 1,560 weeks. This is a smaller window than most people intuitively assume." },
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
        <span style={{ fontSize:18, color:catColor, flexShrink:0, display:'inline-block', transform:open ? 'rotate(45deg)' : 'none', transition:'transform .2s' }}>+</span>
      </button>
      {open && <p style={{ fontSize:12.5, color:'var(--text-2)', lineHeight:1.75, margin:'0 0 13px', fontFamily:"'DM Sans',sans-serif" }}>{a}</p>}
    </div>
  )
}

function Stepper({ label, hint, value, onChange, min, max, step=1, unit, catColor }) {
  const [editing, setEditing] = useState(false)
  const commit = r => { const n = parseFloat(r); onChange(clamp(isNaN(n) ? value : n, min, max)); setEditing(false) }
  const btn = { width:38, height:'100%', border:'none', background:'var(--bg-raised)', color:'var(--text)', fontSize:20, fontWeight:300, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }
  return (
    <div style={{ marginBottom:16 }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
        <label style={{ fontSize:12.5, fontWeight:600, color:'var(--text)', fontFamily:"'DM Sans',sans-serif" }}>{label}</label>
        {hint && <span style={{ fontSize:10, color:'var(--text-3)' }}>{hint}</span>}
      </div>
      <div style={{ display:'flex', alignItems:'stretch', height:40, border:`1.5px solid ${editing ? catColor : 'var(--border-2)'}`, borderRadius:9, overflow:'hidden', background:'var(--bg-card)', transition:'border-color .15s' }}>
        <button onMouseDown={e => { e.preventDefault(); onChange(clamp(value - step, min, max)) }} style={{ ...btn, borderRight:'1px solid var(--border)' }} onMouseEnter={e => e.currentTarget.style.background = catColor + '18'} onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-raised)'}>−</button>
        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:5 }}>
          {editing
            ? <input type="number" defaultValue={value} onBlur={e => commit(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') commit(e.target.value); if (e.key === 'Escape') setEditing(false) }} style={{ width:'55%', border:'none', background:'transparent', textAlign:'center', fontSize:15, fontWeight:700, color:'var(--text)', outline:'none' }} autoFocus />
            : <span onClick={() => setEditing(true)} style={{ fontSize:15, fontWeight:700, color:'var(--text)', cursor:'text', minWidth:36, textAlign:'center' }}>{value}</span>
          }
          <span style={{ fontSize:11, color:'var(--text-3)', fontWeight:500 }}>{unit}</span>
        </div>
        <button onMouseDown={e => { e.preventDefault(); onChange(clamp(value + step, min, max)) }} style={{ ...btn, borderLeft:'1px solid var(--border)' }} onMouseEnter={e => e.currentTarget.style.background = catColor + '18'} onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-raised)'}>+</button>
      </div>
    </div>
  )
}

export default function LifeInWeeksCalculator({ meta, category }) {
  const catColor  = category?.color || '#8b5cf6'
  const [age,     setAge]     = useState(30)
  const [sex,     setSex]     = useState('unknown')
  const [lifeExp, setLifeExp] = useState(81)
  const [openFaq, setOpenFaq] = useState(null)

  // Lifestyle modifiers
  const [activeFactors, setActiveFactors] = useState(new Set())
  const toggleFactor = key => setActiveFactors(s => { const n = new Set(s); n.has(key) ? n.delete(key) : n.add(key); return n })

  // Time budget (interactive hours per day)
  const [timeSlots, setTimeSlots] = useState([
    { key:'sleep',   label:'Sleeping',                icon:'😴', color:'#8b5cf6', hours:8 },
    { key:'work',    label:'Working',                 icon:'💼', color:'#3b82f6', hours:9 },
    { key:'screens', label:'Screens & social media',  icon:'📱', color:'#ef4444', hours:4 },
    { key:'family',  label:'Family & close friends',  icon:'❤️', color:'#10b981', hours:1 },
    { key:'exercise',label:'Exercise & movement',     icon:'🏃', color:'#22a355', hours:0.5 },
    { key:'nature',  label:'Outdoors & hobbies',      icon:'🌿', color:'#f59e0b', hours:0.5 },
  ])
  const updateSlot = (key, hours) => setTimeSlots(s => s.map(sl => sl.key === key ? { ...sl, hours } : sl))

  // People calculator
  const [parentAge,   setParentAge]   = useState(60)
  const [parentVisits,setParentVisits]= useState(4)  // times per year
  const [friendMeets, setFriendMeets] = useState(2)  // times per month

  // Tooltip state for grid
  const [hoveredYear, setHoveredYear] = useState(null)

  // Modifier calculation
  const modifierYears = Array.from(activeFactors).reduce((s, k) => {
    const f = LIFESTYLE_FACTORS.find(x => x.key === k)
    return s + (f ? f.years : 0)
  }, 0)
  const adjustedLifeExp = clamp(lifeExp + modifierYears, 50, 110)

  const totalWeeks  = Math.round(adjustedLifeExp * 52.18)
  const livedWeeks  = Math.round(age * 52.18)
  const remaining   = Math.max(0, totalWeeks - livedWeeks)
  const pctLived    = Math.round((livedWeeks / totalWeeks) * 100)
  const yearsLeft   = Math.max(0, adjustedLifeExp - age)

  // Prime years remaining (30–60)
  const primeStart = 30, primeEnd = 60
  const primeWeeksTotal = Math.round((primeEnd - primeStart) * 52.18)
  const primeWeeksLived = age >= primeEnd ? primeWeeksTotal : age >= primeStart ? Math.round((age - primeStart) * 52.18) : 0
  const primeRemaining  = Math.max(0, primeWeeksTotal - primeWeeksLived)
  const inPrime = age >= primeStart && age < primeEnd

  // People calculations
  const parentLifeExpRemaining = Math.max(0, 83 - parentAge)  // female avg
  const daysWithParents  = Math.round(parentLifeExpRemaining * parentVisits * (1 / parentVisits) * parentVisits)
  const actualDaysParents = Math.round(Math.min(parentLifeExpRemaining, yearsLeft) * parentVisits)
  const friendDaysPerYear = friendMeets * 12 * 1  // 1 day per meet
  const totalFriendDays   = Math.round(yearsLeft * friendDaysPerYear)

  // Rough friend days
  const friendDaysLeft = Math.round(yearsLeft * friendMeets * 12)

  // Time budget — weeks consumed
  const totalHoursPerDay = timeSlots.reduce((s, sl) => s + sl.hours, 0)
  const weeksOnEach = timeSlots.map(sl => ({
    ...sl,
    weeksLeft: Math.round(sl.hours / 24 * 7 * remaining),
    pctOfLife: ((sl.hours / 24) * 100).toFixed(0),
  }))

  // Discretionary time = remaining hours not allocated
  const allocatedHours = timeSlots.reduce((s, sl) => s + sl.hours, 0)
  const freeHoursPerDay = Math.max(0, 24 - allocatedHours)
  const freeWeeksLeft   = Math.round(freeHoursPerDay / 24 * 7 * remaining)

  // Narrative sentence
  const phase = age < 18 ? 'child' : age < 30 ? 'young adult' : age < 45 ? 'in your prime' : age < 60 ? 'in your peak years' : age < 75 ? 'in your 60s or 70s' : 'in later life'
  const summersDesc = yearsLeft === 1 ? '1 more summer' : `${yearsLeft} more summers`

  const hint = `Age ${age}. Adjusted life expectancy: ${adjustedLifeExp}. Lived: ${livedWeeks.toLocaleString()} weeks (${pctLived}%). Remaining: ${remaining.toLocaleString()} weeks. ${inPrime ? `Prime years remaining: ${primeRemaining.toLocaleString()} weeks.` : ''}`

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

      {/* ── MAIN CALC ── */}
      <CalcShell
        left={<>
          <div style={{ fontSize:10, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:14 }}>Your details</div>
          <Stepper label="Current age" value={age} onChange={setAge} min={1} max={100} unit="yrs" catColor={catColor} />
          <Stepper label="Life expectancy (baseline)" value={lifeExp} onChange={setLifeExp} min={50} max={110} unit="yrs" hint="UK avg: 79–83" catColor={catColor} />

          <div style={{ borderTop:'0.5px solid var(--border)', paddingTop:14, marginTop:4 }}>
            <div style={{ fontSize:12, fontWeight:600, color:'var(--text-2)', marginBottom:8, fontFamily:"'DM Sans',sans-serif" }}>Sex</div>
            <div style={{ display:'flex', gap:8, marginBottom:14 }}>
              {[{ v:'male', l:'Male' }, { v:'female', l:'Female' }, { v:'unknown', l:'Unknown' }].map(o => (
                <button key={o.v} onClick={() => { setSex(o.v); setLifeExp(LIFE_EXPECTANCY[o.v]) }} style={{ flex:1, padding:'8px 4px', borderRadius:9, border:`1.5px solid ${sex === o.v ? catColor : 'var(--border-2)'}`, background:sex === o.v ? catColor + '12' : 'var(--bg-raised)', fontSize:10, fontWeight:sex === o.v ? 700 : 400, color:sex === o.v ? catColor : 'var(--text-2)', cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>{o.l}</button>
              ))}
            </div>
          </div>

          {/* Key stats */}
          <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
            {[
              { label:'Weeks lived',     val:livedWeeks.toLocaleString(),  color:catColor,       sub:`${pctLived}% of your life` },
              { label:'Weeks remaining', val:remaining.toLocaleString(),   color:'#10b981',      sub:`~${yearsLeft} years left` },
              { label:'Prime weeks left',val:primeRemaining.toLocaleString(), color:'#f59e0b',   sub:`ages 30–60 remaining` },
            ].map((s, i) => (
              <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'9px 12px', borderRadius:8, background:'var(--bg-raised)', border:'0.5px solid var(--border)' }}>
                <div>
                  <div style={{ fontSize:11, fontWeight:600, color:'var(--text)' }}>{s.label}</div>
                  <div style={{ fontSize:10, color:'var(--text-3)', marginTop:1 }}>{s.sub}</div>
                </div>
                <div style={{ fontSize:20, fontWeight:700, color:s.color, fontFamily:"'Space Grotesk',sans-serif" }}>{s.val}</div>
              </div>
            ))}
          </div>

          {/* Lifestyle modifier note */}
          {modifierYears !== 0 && (
            <div style={{ marginTop:10, padding:'9px 12px', background:modifierYears > 0 ? '#d1fae5' : '#fee2e2', borderRadius:9, border:`1px solid ${modifierYears > 0 ? '#10b98130' : '#ef444430'}` }}>
              <div style={{ fontSize:11, fontWeight:700, color:modifierYears > 0 ? '#065f46' : '#991b1b' }}>
                Lifestyle adjustments: {modifierYears > 0 ? '+' : ''}{modifierYears} years
              </div>
              <div style={{ fontSize:10, color:modifierYears > 0 ? '#047857' : '#b91c1c', marginTop:2 }}>
                Adjusted expectancy: {adjustedLifeExp} years
              </div>
            </div>
          )}
        </>}
        right={<>
          {/* Life grid */}
          <div style={{ background:'var(--bg-card)', border:'0.5px solid var(--border)', borderRadius:14, overflow:'hidden', marginBottom:14 }}>
            <div style={{ padding:'11px 16px', borderBottom:'0.5px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontSize:12, fontWeight:700, color:'var(--text)', fontFamily:"'Space Grotesk',sans-serif" }}>Life in Weeks</span>
              <span style={{ fontSize:10, color:'var(--text-3)' }}>Each dot = 1 week · Each row = 1 year</span>
            </div>
            <div style={{ padding:'14px 16px' }}>
              {/* Legend */}
              <div style={{ display:'flex', gap:12, marginBottom:12, flexWrap:'wrap' }}>
                {[
                  { label:'Lived',       color:catColor,    opacity:1   },
                  { label:'Childhood',   color:'#f59e0b',   opacity:0.5 },
                  { label:'Prime (30–60)',color:'#10b981',   opacity:0.5 },
                  { label:'Later life',  color:'#94a3b8',   opacity:0.4 },
                ].map((s, i) => (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:5 }}>
                    <div style={{ width:8, height:8, borderRadius:'50%', background:s.color, opacity:s.opacity }} />
                    <span style={{ fontSize:10, color:'var(--text-3)' }}>{s.label}</span>
                  </div>
                ))}
              </div>
              {/* Tooltip */}
              {hoveredYear !== null && (
                <div style={{ padding:'6px 10px', background:catColor + '15', borderRadius:7, border:`1px solid ${catColor}30`, marginBottom:8, fontSize:11 }}>
                  <strong style={{ color:catColor }}>Age {hoveredYear}</strong>
                  <span style={{ color:'var(--text-3)', marginLeft:8 }}>
                    {hoveredYear < 18 ? 'Childhood' : hoveredYear < 30 ? 'Young adult' : hoveredYear < 60 ? 'Prime years' : 'Later life'}
                    {' · '}Week {(hoveredYear * 52).toLocaleString()}
                    {hoveredYear < age ? ' (lived)' : hoveredYear === age ? ' ← you are here' : ''}
                  </span>
                </div>
              )}
              {/* Grid */}
              <div style={{ overflowY:'auto', maxHeight:340, paddingRight:4 }}>
                {Array.from({ length:adjustedLifeExp }, (_, yr) => {
                  const phase = yr < 18 ? 'childhood' : yr < 60 ? 'prime' : 'later'
                  const isCurrentYear = yr === Math.floor(age)
                  const isLivedYear   = yr < age
                  return (
                    <div
                      key={yr}
                      style={{ display:'flex', alignItems:'center', gap:3, marginBottom:isCurrentYear ? 3 : 2 }}
                      onMouseEnter={() => setHoveredYear(yr)}
                      onMouseLeave={() => setHoveredYear(null)}
                    >
                      {/* Year label every 5 */}
                      {yr % 10 === 0
                        ? <div style={{ fontSize:8, color:'var(--text-3)', minWidth:22, textAlign:'right', flexShrink:0, fontWeight:700 }}>{yr}</div>
                        : <div style={{ minWidth:22, flexShrink:0 }} />
                      }
                      <div style={{ display:'flex', gap:1, flexWrap:'nowrap' }}>
                        {Array.from({ length:52 }, (_, w) => {
                          const globalWeek  = yr * 52 + w
                          const isThisLived = globalWeek < livedWeeks
                          const isCurrent   = isCurrentYear && w === Math.floor((age % 1) * 52)
                          const dotColor    = isThisLived
                            ? catColor
                            : phase === 'childhood' ? '#f59e0b'
                            : phase === 'prime'     ? '#10b981'
                            : '#94a3b8'
                          const opacity = isThisLived ? 1 : isCurrent ? 1 : 0.28
                          return (
                            <div
                              key={w}
                              style={{
                                width:  isCurrent ? 7 : 5,
                                height: isCurrent ? 7 : 5,
                                borderRadius: '50%',
                                background: isCurrent ? catColor : dotColor,
                                opacity,
                                flexShrink: 0,
                                outline: isCurrent ? `1.5px solid ${catColor}` : 'none',
                                outlineOffset: 1,
                                transition: 'all .1s',
                              }}
                            />
                          )
                        })}
                      </div>
                      {/* Phase transition labels */}
                      {yr === 18 && <div style={{ fontSize:7, color:'#f97316', marginLeft:4, flexShrink:0, whiteSpace:'nowrap', opacity:0.7 }}>→ prime</div>}
                      {yr === 60 && <div style={{ fontSize:7, color:'#94a3b8', marginLeft:4, flexShrink:0, whiteSpace:'nowrap', opacity:0.7 }}>→ later</div>}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
          <BreakdownTable title="Life Summary" rows={[
            { label:'Age now',           value:`${age} years`,                          bold:true, highlight:true, color:catColor },
            { label:'Weeks lived',       value:livedWeeks.toLocaleString(),             color:catColor },
            { label:'Weeks remaining',   value:remaining.toLocaleString(),              color:'#10b981' },
            { label:'Life progress',     value:`${pctLived}% complete` },
            { label:'Life expectancy',   value:`${adjustedLifeExp} years${modifierYears !== 0 ? ` (adj. ${modifierYears > 0 ? '+' : ''}${modifierYears}y)` : ''}` },
            { label:'Prime yrs left',    value:`${primeRemaining.toLocaleString()} wks`, color:'#f59e0b' },
          ]} />
          <AIHintCard hint={hint} />
        </>}
      />

      {/* ── YOUR LIFE IN SENTENCES ── */}
      <Sec title="Your life in plain sentences" sub="What the numbers actually mean for you">
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {/* Opening narrative */}
          <div style={{ padding:'16px 18px', background:catColor + '08', borderRadius:12, border:`1px solid ${catColor}20` }}>
            <p style={{ fontSize:14, color:'var(--text)', lineHeight:1.8, margin:0, fontFamily:"'DM Sans',sans-serif" }}>
              You are <strong style={{ color:catColor }}>{age} years old</strong>. You have been alive for approximately <strong style={{ color:catColor }}>{livedWeeks.toLocaleString()} weeks</strong> — which is <strong style={{ color:catColor }}>{pctLived}%</strong> of your expected life of {adjustedLifeExp} years.
            </p>
          </div>

          <div style={{ padding:'14px 18px', background:'var(--bg-raised)', borderRadius:12, border:'0.5px solid var(--border)' }}>
            <p style={{ fontSize:13.5, color:'var(--text)', lineHeight:1.8, margin:0, fontFamily:"'DM Sans',sans-serif" }}>
              You have roughly <strong style={{ color:'#10b981' }}>{remaining.toLocaleString()} weeks</strong> left — that is about <strong style={{ color:'#10b981' }}>{yearsLeft} years</strong>, or approximately <strong style={{ color:'#10b981' }}>{summersDesc}</strong>. Every week that passes is one fewer in that total.
            </p>
          </div>

          {inPrime && (
            <div style={{ padding:'14px 18px', background:'#fef3c7', borderRadius:12, border:'1px solid #f59e0b30' }}>
              <p style={{ fontSize:13.5, color:'#78350f', lineHeight:1.8, margin:0, fontFamily:"'DM Sans',sans-serif" }}>
                You are currently in your <strong>prime years (ages 30–60)</strong>. You have <strong style={{ color:'#d97706' }}>{primeRemaining.toLocaleString()} prime weeks</strong> remaining — the period where most people have the best combination of health, energy, earning power, and relative freedom. Of the roughly 1,560 prime-year weeks a person gets, you have used <strong>{(primeWeeksLived / primeWeeksTotal * 100).toFixed(0)}%</strong>.
              </p>
            </div>
          )}

          {!inPrime && age < 30 && (
            <div style={{ padding:'14px 18px', background:'#dbeafe', borderRadius:12, border:'1px solid #3b82f630' }}>
              <p style={{ fontSize:13.5, color:'#1e40af', lineHeight:1.8, margin:0, fontFamily:"'DM Sans',sans-serif" }}>
                Your prime years (ages 30–60) have not yet begun. You have the full <strong style={{ color:'#2563eb' }}>1,560 prime weeks</strong> ahead of you — roughly 30 years where health, wisdom, and freedom tend to overlap most fully.
              </p>
            </div>
          )}

          <div style={{ padding:'14px 18px', background:'var(--bg-raised)', borderRadius:12, border:'0.5px solid var(--border)' }}>
            <p style={{ fontSize:13.5, color:'var(--text)', lineHeight:1.8, margin:0, fontFamily:"'DM Sans',sans-serif" }}>
              In those {yearsLeft} years, you will sleep for approximately <strong style={{ color:'#8b5cf6' }}>{Math.round(8 / 24 * 7 * remaining).toLocaleString()} weeks</strong>. You will likely work for another <strong style={{ color:'#3b82f6' }}>{Math.round(9 / 24 * 7 * remaining).toLocaleString()} weeks</strong>. That leaves roughly <strong style={{ color:catColor }}>{Math.round((24 - 17) / 24 * 7 * remaining).toLocaleString()} weeks</strong> of waking, non-working time to spend as you choose.
            </p>
          </div>

          <div style={{ padding:'14px 18px', background:'var(--bg-raised)', borderRadius:12, border:'0.5px solid var(--border)' }}>
            <p style={{ fontSize:13.5, color:'var(--text)', lineHeight:1.8, margin:0, fontFamily:"'DM Sans',sans-serif" }}>
              Most people overestimate how much time they have and underestimate how quickly a decade passes. At age {age}, your next 10 years will feel long now — but at age {age + 10}, they will feel as short as the last 10 did. <strong>The weeks don't wait.</strong>
            </p>
          </div>
        </div>
      </Sec>

      {/* ── DECADE BREAKDOWN ── */}
      <Sec title="Your life decade by decade" sub="Hover each decade to see what it typically holds">
        <p style={{ fontSize:12, color:'var(--text-2)', lineHeight:1.7, marginBottom:16, fontFamily:"'DM Sans',sans-serif" }}>
          Each bar below represents one decade of your life — coloured by life phase. Decades you have already lived are at full opacity. Your current decade pulses.
        </p>
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          {DECADE_DESCRIPTIONS.filter(d => d.decade < adjustedLifeExp).map((d, i) => {
            const decadeEnd  = d.decade + 10
            const isLived    = age >= decadeEnd
            const isCurrent  = age >= d.decade && age < decadeEnd
            const isFuture   = age < d.decade
            const pctThrough = isCurrent ? ((age - d.decade) / 10) * 100 : isLived ? 100 : 0
            return (
              <div key={i} style={{ padding:'11px 14px', borderRadius:10, background:isCurrent ? d.color + '15' : isLived ? d.color + '08' : 'var(--bg-raised)', border:`${isCurrent ? '1.5' : '0.5'}px solid ${isCurrent ? d.color : isLived ? d.color + '40' : 'var(--border)'}`, opacity:isFuture ? 0.6 : 1 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                  <div>
                    <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                      <span style={{ fontSize:11, fontWeight:700, color:d.color }}>Ages {d.decade}–{d.decade + 10}</span>
                      <span style={{ fontSize:12, fontWeight:700, color:isCurrent ? d.color : 'var(--text)' }}>{d.title}</span>
                      {isCurrent && <span style={{ fontSize:9, fontWeight:700, background:d.color + '20', color:d.color, padding:'1px 7px', borderRadius:10 }}>← YOU</span>}
                      {isLived && !isCurrent && <span style={{ fontSize:9, color:'var(--text-3)', fontStyle:'italic' }}>lived</span>}
                    </div>
                    <div style={{ fontSize:11.5, color:'var(--text-2)', lineHeight:1.55, marginTop:4, maxWidth:380 }}>{d.desc}</div>
                  </div>
                  <div style={{ textAlign:'right', flexShrink:0, marginLeft:10 }}>
                    <div style={{ fontSize:12, fontWeight:700, color:d.color }}>{Math.round(10 * 52.18)}</div>
                    <div style={{ fontSize:9, color:'var(--text-3)' }}>weeks</div>
                  </div>
                </div>
                {/* Progress bar for current decade */}
                {(isCurrent || isLived) && (
                  <div style={{ height:4, background:'var(--border)', borderRadius:2 }}>
                    <div style={{ height:'100%', width:`${pctThrough}%`, background:d.color, borderRadius:2, transition:'width .4s' }} />
                  </div>
                )}
                {isCurrent && (
                  <div style={{ fontSize:10, color:d.color, marginTop:4 }}>
                    {pctThrough.toFixed(0)}% through this decade · {Math.round((10 - (age - d.decade)) * 52.18)} weeks remaining in your {d.decade}s
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </Sec>

      {/* ── INTERACTIVE TIME BUDGET ── */}
      <Sec title="🎯 Where will your remaining weeks actually go?" sub="Adjust hours per day — see weeks of life consumed">
        <p style={{ fontSize:12, color:'var(--text-2)', lineHeight:1.7, marginBottom:16, fontFamily:"'DM Sans',sans-serif" }}>
          You have <strong style={{ color:catColor }}>{remaining.toLocaleString()} weeks</strong> remaining. Use the +/− buttons to adjust how many hours per day you spend on each activity. Watch the weeks of life it consumes update in real time.
        </p>
        <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:14 }}>
          {weeksOnEach.map((sl, i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 14px', borderRadius:10, background:'var(--bg-raised)', border:'0.5px solid var(--border)' }}>
              <span style={{ fontSize:16, flexShrink:0 }}>{sl.icon}</span>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:12, fontWeight:600, color:'var(--text)', marginBottom:4 }}>{sl.label}</div>
                {/* hour buttons */}
                <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                  <button onClick={() => updateSlot(sl.key, Math.max(0, sl.hours - 0.5))} style={{ width:22, height:22, borderRadius:5, border:'1px solid var(--border)', background:'var(--bg-card)', cursor:'pointer', fontSize:13, color:'var(--text)', display:'flex', alignItems:'center', justifyContent:'center' }}>−</button>
                  <span style={{ fontSize:13, fontWeight:700, color:sl.color, minWidth:32, textAlign:'center' }}>{sl.hours}h</span>
                  <button onClick={() => updateSlot(sl.key, Math.min(16, sl.hours + 0.5))} style={{ width:22, height:22, borderRadius:5, border:'1px solid var(--border)', background:'var(--bg-card)', cursor:'pointer', fontSize:13, color:'var(--text)', display:'flex', alignItems:'center', justifyContent:'center' }}>+</button>
                  <span style={{ fontSize:10, color:'var(--text-3)' }}>{sl.pctOfLife}% of each day</span>
                </div>
              </div>
              <div style={{ textAlign:'right', minWidth:70 }}>
                <div style={{ fontSize:15, fontWeight:700, color:sl.color, fontFamily:"'Space Grotesk',sans-serif" }}>{sl.weeksLeft.toLocaleString()}</div>
                <div style={{ fontSize:9, color:'var(--text-3)' }}>wks of life</div>
              </div>
            </div>
          ))}
        </div>
        {/* Allocated vs free */}
        <div style={{ padding:'13px 16px', background:catColor + '10', borderRadius:12, border:`1px solid ${catColor}25` }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
            <span style={{ fontSize:13, fontWeight:700, color:'var(--text)' }}>Allocated time</span>
            <span style={{ fontSize:14, fontWeight:700, color:totalHoursPerDay > 24 ? '#ef4444' : catColor, fontFamily:"'Space Grotesk',sans-serif" }}>{allocatedHours.toFixed(1)}h / 24h</span>
          </div>
          <div style={{ height:8, background:'var(--border)', borderRadius:4, overflow:'hidden', marginBottom:8 }}>
            <div style={{ height:'100%', width:`${Math.min((allocatedHours / 24) * 100, 100)}%`, background:allocatedHours > 24 ? '#ef4444' : catColor, borderRadius:4, transition:'width .3s' }} />
          </div>
          {freeHoursPerDay > 0 ? (
            <p style={{ fontSize:12, color:'var(--text-2)', lineHeight:1.65, margin:0 }}>
              After the above, you have <strong style={{ color:catColor }}>{freeHoursPerDay.toFixed(1)} free hours per day</strong> — that is <strong style={{ color:catColor }}>{freeWeeksLeft.toLocaleString()} weeks</strong> of completely discretionary time across your remaining life. This is time you can give to anything you choose.
            </p>
          ) : (
            <p style={{ fontSize:12, color:'#ef4444', lineHeight:1.65, margin:0 }}>
              ⚠️ You have allocated more than 24 hours. Reduce some activities to see your free time.
            </p>
          )}
        </div>
      </Sec>

      {/* ── TIME WITH PEOPLE ── */}
      <Sec title="Time with the people who matter most" sub="The maths most people never do">
        <p style={{ fontSize:12, color:'var(--text-2)', lineHeight:1.7, marginBottom:16, fontFamily:"'DM Sans',sans-serif" }}>
          One of the most confronting realisations about finite time is how few occasions remain with people you love — especially ageing parents. The numbers below are real; they change how many people think about weekly plans and holiday decisions.
        </p>

        {/* Parents */}
        <div style={{ padding:'14px 16px', background:'#fef3c7', borderRadius:12, border:'1px solid #f59e0b30', marginBottom:14 }}>
          <div style={{ fontSize:12, fontWeight:700, color:'#92400e', marginBottom:10 }}>🧓 Time with your parents</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:12 }}>
            <div>
              <div style={{ fontSize:11, color:'#78350f', marginBottom:4 }}>Parent's current age</div>
              <div style={{ display:'flex', height:34, border:'1px solid #f59e0b60', borderRadius:8, overflow:'hidden' }}>
                <button onClick={() => setParentAge(v => Math.max(40, v - 1))} style={{ width:34, background:'#fef9c3', border:'none', cursor:'pointer', fontSize:16, color:'#92400e' }}>−</button>
                <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:700, color:'#92400e' }}>{parentAge}</div>
                <button onClick={() => setParentAge(v => Math.min(100, v + 1))} style={{ width:34, background:'#fef9c3', border:'none', cursor:'pointer', fontSize:16, color:'#92400e' }}>+</button>
              </div>
            </div>
            <div>
              <div style={{ fontSize:11, color:'#78350f', marginBottom:4 }}>Visits per year</div>
              <div style={{ display:'flex', height:34, border:'1px solid #f59e0b60', borderRadius:8, overflow:'hidden' }}>
                <button onClick={() => setParentVisits(v => Math.max(1, v - 1))} style={{ width:34, background:'#fef9c3', border:'none', cursor:'pointer', fontSize:16, color:'#92400e' }}>−</button>
                <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:700, color:'#92400e' }}>{parentVisits}</div>
                <button onClick={() => setParentVisits(v => Math.min(365, v + 1))} style={{ width:34, background:'#fef9c3', border:'none', cursor:'pointer', fontSize:16, color:'#92400e' }}>+</button>
              </div>
            </div>
          </div>
          <div style={{ padding:'10px 13px', background:'#fef9c3', borderRadius:9 }}>
            <p style={{ fontSize:13, color:'#78350f', lineHeight:1.75, margin:0, fontFamily:"'DM Sans',sans-serif" }}>
              If your parent is currently <strong>{parentAge}</strong> and lives to the average life expectancy of ~83, you have roughly <strong style={{ color:'#b45309' }}>{Math.min(Math.max(0, 83 - parentAge), yearsLeft)} more years</strong> with them. At <strong>{parentVisits} visit{parentVisits !== 1 ? 's' : ''} per year</strong>, that is approximately <strong style={{ fontSize:14, color:'#b45309' }}>{actualDaysParents} more visits.</strong>
            </p>
            <p style={{ fontSize:12, color:'#92400e', lineHeight:1.65, margin:'8px 0 0', fontFamily:"'DM Sans',sans-serif" }}>
              Most people react to this number by wanting to increase the visits. That is exactly the point.
            </p>
          </div>
        </div>

        {/* Close friends */}
        <div style={{ padding:'14px 16px', background:'#ede9fe', borderRadius:12, border:'1px solid #8b5cf630' }}>
          <div style={{ fontSize:12, fontWeight:700, color:'#4c1d95', marginBottom:10 }}>👥 Time with close friends</div>
          <div style={{ marginBottom:12 }}>
            <div style={{ fontSize:11, color:'#5b21b6', marginBottom:4 }}>Times you see them per month</div>
            <div style={{ display:'flex', height:34, border:'1px solid #8b5cf660', borderRadius:8, overflow:'hidden', width:160 }}>
              <button onClick={() => setFriendMeets(v => Math.max(0, v - 1))} style={{ width:34, background:'#f5f3ff', border:'none', cursor:'pointer', fontSize:16, color:'#4c1d95' }}>−</button>
              <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:700, color:'#4c1d95' }}>{friendMeets}×</div>
              <button onClick={() => setFriendMeets(v => Math.min(30, v + 1))} style={{ width:34, background:'#f5f3ff', border:'none', cursor:'pointer', fontSize:16, color:'#4c1d95' }}>+</button>
            </div>
          </div>
          <div style={{ padding:'10px 13px', background:'#f5f3ff', borderRadius:9 }}>
            <p style={{ fontSize:13, color:'#4c1d95', lineHeight:1.75, margin:0, fontFamily:"'DM Sans',sans-serif" }}>
              At <strong>{friendMeets} meeting{friendMeets !== 1 ? 's' : ''} per month</strong>, you will see your closest friends approximately <strong style={{ color:'#6d28d9', fontSize:14 }}>{friendDaysLeft.toLocaleString()} more times</strong> across your remaining life.
            </p>
            <p style={{ fontSize:12, color:'#5b21b6', lineHeight:1.65, margin:'6px 0 0' }}>
              Research consistently shows close social relationships are the single strongest predictor of happiness and longevity — stronger than money, health, or fame. Yet most people treat friend time as optional.
            </p>
          </div>
        </div>
      </Sec>

      {/* ── LIFESTYLE MODIFIERS ── */}
      <Sec title="Personalise your life expectancy" sub="Evidence-based adjustments — transparent and sourced">
        <p style={{ fontSize:12, color:'var(--text-2)', lineHeight:1.7, marginBottom:8, fontFamily:"'DM Sans',sans-serif" }}>
          Life expectancy is a population average. Your personal expectancy is shaped significantly by lifestyle choices. Toggle the factors that apply to you — each is based on published epidemiological data. Your baseline adjusts immediately above.
        </p>
        <div style={{ padding:'9px 13px', background:'var(--bg-raised)', borderRadius:8, border:'0.5px solid var(--border)', marginBottom:14 }}>
          <p style={{ fontSize:11, color:'var(--text-3)', margin:0, lineHeight:1.65 }}>
            ⚠️ <strong style={{ color:'var(--text)' }}>These are estimated averages, not predictions.</strong> Factors interact and individual variation is large. A 90-year-old lifelong smoker exists. A 50-year-old marathon runner can die young. Treat this as directional — a reason to take the choices seriously, not as certainty.
          </p>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          {LIFESTYLE_FACTORS.map(f => {
            const isActive = activeFactors.has(f.key)
            const isPositive = f.years > 0
            const color = isPositive ? '#10b981' : '#ef4444'
            return (
              <button key={f.key} onClick={() => toggleFactor(f.key)} style={{ display:'flex', alignItems:'center', gap:12, padding:'11px 14px', borderRadius:10, background:isActive ? color + '10' : 'var(--bg-raised)', border:`${isActive ? '1.5' : '0.5'}px solid ${isActive ? color : 'var(--border)'}`, cursor:'pointer', textAlign:'left' }}>
                <span style={{ fontSize:17, flexShrink:0 }}>{f.icon}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:12, fontWeight:isActive ? 700 : 500, color:isActive ? color : 'var(--text)' }}>{f.label}</div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ fontSize:14, fontWeight:700, color:isPositive ? '#10b981' : '#ef4444', minWidth:36, textAlign:'right' }}>{isPositive ? '+' : ''}{f.years}y</span>
                  <div style={{ width:18, height:18, borderRadius:5, border:`2px solid ${isActive ? color : 'var(--border)'}`, background:isActive ? color : 'transparent', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    {isActive && <span style={{ fontSize:11, color:'#fff', fontWeight:700 }}>✓</span>}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
        {modifierYears !== 0 && (
          <div style={{ marginTop:12, padding:'10px 14px', background:modifierYears > 0 ? '#d1fae5' : '#fee2e2', borderRadius:10, border:`1px solid ${modifierYears > 0 ? '#10b98130' : '#ef444430'}` }}>
            <p style={{ fontSize:12, color:modifierYears > 0 ? '#065f46' : '#991b1b', lineHeight:1.65, margin:0 }}>
              Your selected factors adjust life expectancy by <strong>{modifierYears > 0 ? '+' : ''}{modifierYears} years</strong>. Your adjusted expectancy is <strong>{adjustedLifeExp} years</strong> — giving you approximately <strong>{remaining.toLocaleString()} remaining weeks</strong>. All figures above update to reflect this.
            </p>
          </div>
        )}
      </Sec>

      {/* ── THE MATHS ── */}
      <Sec title="The confronting maths of a human life" sub="Numbers that tend to reframe how people think about time">
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {[
            {
              stat:`~${yearsLeft} summers left`,
              val:yearsLeft,
              unit:'summers',
              color:catColor,
              desc:`Each summer lasts about 12 weeks. ${yearsLeft} more of them. Most people in their 30s feel like summers are infinite — they are not. This number tends to land harder than "years remaining" because summers feel specific.`,
            },
            {
              stat:`~${Math.round(remaining * 2 / 7)} weekends left`,
              val:Math.round(remaining * 2 / 7),
              unit:'weekends',
              color:'#10b981',
              desc:`You have roughly ${Math.round(remaining * 2 / 7)} Saturdays remaining. Most of them will be ordinary. But that is also how many chances you have to do something memorable with someone you love.`,
            },
            {
              stat:'4,000 weeks total (for 80 years)',
              val:4000,
              unit:'weeks total',
              color:'#3b82f6',
              desc:`Oliver Burkeman's "Four Thousand Weeks" (2021) used this framing: a full 80-year life is about 4,000 weeks. You have lived ${livedWeeks.toLocaleString()} of them. You have approximately ${remaining.toLocaleString()} left. Written on paper, this fits in a small grid.`,
            },
            {
              stat:`~${Math.round(remaining * 24 * 7)} waking hours left`,
              val:Math.round(remaining * (24 - 8) * 7),
              unit:'waking hours',
              color:'#f59e0b',
              desc:`Assuming 8 hours of sleep per night, you have roughly ${Math.round(remaining * 16 * 7).toLocaleString()} waking hours remaining. That is the total budget. Every decision about time is a trade-off within that number.`,
            },
          ].map((s, i) => (
            <div key={i} style={{ display:'flex', gap:16, padding:'13px 16px', borderRadius:11, background:'var(--bg-raised)', border:'0.5px solid var(--border)', alignItems:'flex-start' }}>
              <div style={{ textAlign:'center', flexShrink:0, minWidth:60 }}>
                <div style={{ fontSize:22, fontWeight:700, color:s.color, fontFamily:"'Space Grotesk',sans-serif", lineHeight:1 }}>{typeof s.val === 'number' && s.val > 999 ? s.val.toLocaleString() : s.val}</div>
                <div style={{ fontSize:9, color:'var(--text-3)', marginTop:3, lineHeight:1.3 }}>{s.unit}</div>
              </div>
              <div>
                <div style={{ fontSize:12, fontWeight:700, color:s.color, marginBottom:4 }}>{s.stat}</div>
                <div style={{ fontSize:12, color:'var(--text-2)', lineHeight:1.65, fontFamily:"'DM Sans',sans-serif" }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </Sec>

      {/* ── ⚡ FUN FACT ── */}
      <Sec title="⚡ Life in weeks — facts worth knowing">
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {[
            { f:"Tim Urban's 2014 article 'Your Life in Weeks' on Wait But Why visualised a 90-year life as a 90×52 grid of boxes. It became one of the most widely shared pieces of long-form internet writing, credited with changing how thousands of people approached decisions.", icon:'📊' },
            { f:"The average person spends ~33 years sleeping, ~13 years working, ~3 years in education, and ~9 years on screens across a 79-year life. That leaves roughly 21 years of discretionary waking time — the time that defines how you're actually remembered.", icon:'⏱️' },
            { f:"Deathbed regret research consistently finds the same patterns: working too much, not pursuing what mattered, not expressing feelings, and losing touch with friends — almost never 'I wish I'd earned more money'.", icon:'💭' },
            { f:"Researchers studying longevity in Blue Zones (Okinawa, Sardinia, Loma Linda, etc.) found the single most consistent predictor of long, happy lives was not diet or exercise — it was having a clear sense of purpose and strong community ties.", icon:'🌍' },
          ].map((f, i) => (
            <div key={i} style={{ display:'flex', gap:12, padding:'11px 14px', borderRadius:9, background:'var(--bg-raised)', border:'0.5px solid var(--border)' }}>
              <span style={{ fontSize:18, flexShrink:0 }}>{f.icon}</span>
              <p style={{ fontSize:12, color:'var(--text-2)', lineHeight:1.65, margin:0 }}>{f.f}</p>
            </div>
          ))}
        </div>
      </Sec>

      <Sec title="Frequently asked questions" sub="Life in weeks explained">
        {FAQ.map((f, i) => (<Acc key={i} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} catColor={catColor} />))}
      </Sec>

    </div>
  )
}
