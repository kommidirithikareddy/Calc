import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'

const clamp = (v,a,b) => Math.min(b, Math.max(a, v))

const ACTIVITIES = [
  { key:'walk_slow',    label:'Walking (slow)',        met:2.5,  icon:'🚶' },
  { key:'walk_fast',    label:'Walking (brisk)',       met:3.5,  icon:'🚶' },
  { key:'run_easy',     label:'Running (easy)',        met:7.0,  icon:'🏃' },
  { key:'run_moderate', label:'Running (moderate)',    met:9.0,  icon:'🏃' },
  { key:'run_fast',     label:'Running (fast)',        met:11.0, icon:'🏃' },
  { key:'cycling_easy', label:'Cycling (easy)',        met:5.0,  icon:'🚴' },
  { key:'cycling_hard', label:'Cycling (hard)',        met:10.0, icon:'🚴' },
  { key:'swimming',     label:'Swimming (moderate)',   met:7.0,  icon:'🏊' },
  { key:'hiit',         label:'HIIT training',         met:9.5,  icon:'⚡' },
  { key:'weights',      label:'Weight training',       met:4.0,  icon:'🏋️' },
  { key:'yoga',         label:'Yoga / flexibility',    met:2.5,  icon:'🧘' },
  { key:'sports',       label:'Team sports',           met:7.0,  icon:'⚽' },
  { key:'jump_rope',    label:'Jump rope',             met:10.0, icon:'🪢' },
  { key:'rowing',       label:'Rowing machine',        met:7.0,  icon:'🚣' },
  { key:'elliptical',   label:'Elliptical (moderate)', met:5.0,  icon:'💪' },
]

const FAQ = [
  { q:'How many calories do I burn running 5km?',
    a:'At an easy pace, a 70 kg person often burns a few hundred calories over 5 km. Heavier runners and higher intensity usually increase the number. This calculator gives a standard MET-based estimate.' },
  { q:'Does cardio or weights burn more calories?',
    a:'Cardio usually burns more during the session, while resistance training may contribute more after the workout through recovery demands and long-term muscle gain. Both are valuable for different reasons.' },
  { q:'Why do calorie trackers give different results?',
    a:'Most tools use different assumptions about efficiency, body composition, heart rate, and activity intensity. MET-based estimates are useful, but they are still approximations rather than exact measurements.' },
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
        <span style={{ fontSize:18, color:catColor, flexShrink:0, display:'inline-block', transform:open?'rotate(45deg)':'none', transition:'transform .2s' }}>+</span>
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

function SessionInsightSection({ act, durationMin, kcal, epoc, grade, gradeColor, gradeSoft, kcalPerMin, catColor }) {
  let title = ''
  let message = ''

  if (kcal < 200) {
    title = 'Light session'
    message = 'This workout creates a lighter calorie burn and is good for movement, recovery, or low-intensity activity.'
  } else if (kcal < 400) {
    title = 'Moderate session'
    message = 'This session creates a solid burn and can contribute meaningfully to general fitness and energy expenditure.'
  } else if (kcal < 700) {
    title = 'High-burn session'
    message = 'This is a strong workout from an energy-expenditure perspective, especially when repeated consistently over time.'
  } else {
    title = 'Very high-burn session'
    message = 'This is a demanding session with substantial calorie burn. Recovery, hydration, and fuelling matter more here.'
  }

  return (
    <Sec title="Your session insight" sub={title}>
      <div style={{ display:'grid', gap:14 }}>
        <div style={{ padding:'14px 15px', borderRadius:12, background:gradeSoft, border:`1px solid ${gradeColor}35` }}>
          <div style={{ fontSize:13, fontWeight:700, color:gradeColor, marginBottom:6, fontFamily:"'Space Grotesk',sans-serif" }}>
            {act.label} for {durationMin} minutes
          </div>
          <p style={{ margin:0, fontSize:12.5, color:'var(--text-2)', lineHeight:1.75, fontFamily:"'DM Sans',sans-serif" }}>
            {message}
          </p>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(4, minmax(0, 1fr))', gap:10 }}>
          {[
            { label:'Burn', value:`${kcal}` },
            { label:'Afterburn', value:`+${epoc}` },
            { label:'Per min', value:`${kcalPerMin}` },
            { label:'Grade', value:grade },
          ].map((item, i) => (
            <div key={i} style={{ padding:'12px 10px', borderRadius:10, background:'var(--bg-raised)', border:'0.5px solid var(--border)' }}>
              <div style={{ fontSize:10.5, color:'var(--text-3)', marginBottom:4 }}>{item.label}</div>
              <div style={{ fontSize:15, fontWeight:700, color:'var(--text)', fontFamily:"'Space Grotesk',sans-serif" }}>{item.value}</div>
            </div>
          ))}
        </div>

        <div style={{ padding:'12px 14px', borderRadius:10, background:'var(--bg-raised)', border:'0.5px solid var(--border)' }}>
          <div style={{ fontSize:11, fontWeight:700, color:'var(--text)', marginBottom:6, fontFamily:"'DM Sans',sans-serif" }}>
            Practical takeaway
          </div>
          <p style={{ margin:0, fontSize:12, color:'var(--text-2)', lineHeight:1.7, fontFamily:"'DM Sans',sans-serif" }}>
            Your estimated total including afterburn is about <strong style={{ color:catColor }}>{kcal + epoc} kcal</strong>. This is useful for understanding session load, but consistency across many sessions matters more than one workout.
          </p>
        </div>
      </div>
    </Sec>
  )
}

function BurnMeaningSection({ kcal, epoc, durationMin, catColor }) {
  const total = kcal + epoc
  const items = [
    `This session burns about ${Math.round(total / Math.max(durationMin, 1))} calories per ${durationMin >= 60 ? 'hour fraction' : 'session minute block'} on average across the workout.`,
    `A second session like this would roughly double the estimate to about ${total * 2} kcal.`,
    `At this level, repeating the session 3 times in a week would total about ${total * 3} kcal of exercise burn.`,
  ]

  return (
    <Sec title="What this burn means" sub="Translate the number into something useful">
      <div style={{ display:'grid', gap:10 }}>
        {items.map((item, i) => (
          <div key={i} style={{ display:'flex', gap:10, alignItems:'flex-start', padding:'12px 13px', borderRadius:10, background:i === 0 ? catColor+'10' : 'var(--bg-raised)', border:`0.5px solid ${i === 0 ? catColor+'35' : 'var(--border)'}` }}>
            <div style={{ width:22, height:22, borderRadius:'50%', background:catColor+'18', color:catColor, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, flexShrink:0 }}>
              {i + 1}
            </div>
            <p style={{ margin:0, fontSize:12.5, color:'var(--text-2)', lineHeight:1.65, fontFamily:"'DM Sans',sans-serif" }}>
              {item}
            </p>
          </div>
        ))}
      </div>
    </Sec>
  )
}

function FoodEquivalentsSection({ kcal, catColor }) {
  const foods = [
    { label:'Bananas', value:Math.max(1, Math.round(kcal / 89)) },
    { label:'Eggs', value:Math.max(1, Math.round(kcal / 78)) },
    { label:'Slices of bread', value:Math.max(1, Math.round(kcal / 80)) },
    { label:'Peanut butter tbsp', value:Math.max(1, Math.round(kcal / 95)) },
  ]

  return (
    <Sec title="Food equivalents" sub="A fun way to picture the energy">
      <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:8 }}>
        {foods.map((f, i) => (
          <div key={i} style={{ padding:'10px 12px', borderRadius:8, background:i === 0 ? catColor+'10' : 'var(--bg-raised)', border:`0.5px solid ${i === 0 ? catColor+'35' : 'var(--border)'}` }}>
            <div style={{ fontSize:10.5, color:'var(--text-3)', marginBottom:4 }}>{f.label}</div>
            <div style={{ fontSize:16, fontWeight:700, color:i === 0 ? catColor : 'var(--text)', fontFamily:"'Space Grotesk',sans-serif" }}>{f.value}</div>
          </div>
        ))}
      </div>
    </Sec>
  )
}

function IntensityBreakdownSection({ act, durationMin, kcal, gradeColor, catColor }) {
  const chunks = [
    { label:'Warm-up', pct:15, kcal:Math.round(kcal * 0.15) },
    { label:'Main work', pct:70, kcal:Math.round(kcal * 0.70) },
    { label:'Cool-down', pct:15, kcal:Math.round(kcal * 0.15) },
  ]

  return (
    <Sec title="Session visualization" sub="A simple burn breakdown">
      <div style={{ display:'grid', gap:12 }}>
        <div style={{ display:'flex', gap:4, height:32, borderRadius:8, overflow:'hidden' }}>
          {chunks.map((c, i) => (
            <div key={i} style={{ flex:c.pct, background:i === 1 ? catColor : i === 0 ? '#f59e0b' : '#94a3b8', display:'flex', alignItems:'center', justifyContent:'center' }}>
              {c.pct >= 15 && <span style={{ fontSize:9, fontWeight:700, color:'#fff' }}>{c.pct}%</span>}
            </div>
          ))}
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
          {chunks.map((c, i) => (
            <div key={i} style={{ padding:'10px 12px', borderRadius:8, background:'var(--bg-raised)', border:'0.5px solid var(--border)' }}>
              <div style={{ fontSize:10, color:'var(--text-3)', marginBottom:4 }}>{c.label}</div>
              <div style={{ fontSize:15, fontWeight:700, color:i === 1 ? catColor : i === 0 ? '#f59e0b' : '#94a3b8', fontFamily:"'Space Grotesk',sans-serif" }}>{c.kcal} kcal</div>
            </div>
          ))}
        </div>

        <p style={{ margin:0, fontSize:11.5, color:'var(--text-3)', lineHeight:1.65, fontFamily:"'DM Sans',sans-serif" }}>
          This is a visual teaching aid, not a lab measurement. Real calorie burn shifts throughout the session depending on effort changes.
        </p>
      </div>
    </Sec>
  )
}

function InterestingFactsSection({ act, kcal, epoc, durationMin, catColor }) {
  const facts = [
    `${act.label} has a MET value of ${act.met}, meaning it uses about ${act.met} times the energy of complete rest.`,
    `Your workout burns about ${Math.round(kcal / Math.max(1, durationMin / 10))} kcal per 10 minutes on average.`,
    epoc > 0
      ? `Because this session is more intense, it may add about ${epoc} kcal of extra recovery burn afterward.`
      : 'Lower-intensity sessions usually have very little afterburn, but they are still valuable for consistency and recovery.',
    'Wearables, gym machines, and apps often disagree because they use slightly different calorie formulas and assumptions.',
  ]

  return (
    <Sec title="Interesting calorie facts" sub="Helpful and amusing context">
      <div style={{ display:'grid', gap:8 }}>
        {facts.map((item, i) => (
          <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:10, padding:'10px 12px', borderRadius:9, background:i === 0 ? catColor+'10' : 'var(--bg-raised)', border:`0.5px solid ${i === 0 ? catColor+'35' : 'var(--border)'}` }}>
            <div style={{ width:16, height:16, borderRadius:'50%', background:catColor, color:'#fff', fontSize:10, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:1 }}>
              ✓
            </div>
            <p style={{ margin:0, fontSize:12.5, color:'var(--text-2)', lineHeight:1.6, fontFamily:"'DM Sans',sans-serif" }}>
              {item}
            </p>
          </div>
        ))}
      </div>
    </Sec>
  )
}

function CompareIntensitySection({ act, wKg, durationMin, catColor }) {
  const options = ACTIVITIES
    .filter(a => a.key !== act.key)
    .sort((a, b) => Math.abs(a.met - act.met) - Math.abs(b.met - act.met))
    .slice(0, 4)

  return (
    <Sec title="Similar activity comparison" sub="What else burns roughly like this?">
      <div style={{ display:'grid', gap:8 }}>
        {[act, ...options].map((a, i) => {
          const burn = Math.round(a.met * wKg * (durationMin / 60))
          const active = a.key === act.key
          return (
            <div key={a.key} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:9, background:active ? catColor+'10' : 'var(--bg-raised)', border:`0.5px solid ${active ? catColor+'35' : 'var(--border)'}` }}>
              <div style={{ fontSize:15 }}>{a.icon}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:12, fontWeight:700, color:active ? catColor : 'var(--text)' }}>{a.label}</div>
                <div style={{ fontSize:10.5, color:'var(--text-3)' }}>MET {a.met}</div>
              </div>
              <div style={{ fontSize:12, fontWeight:700, color:active ? catColor : 'var(--text)' }}>{burn} kcal</div>
            </div>
          )
        })}
      </div>
    </Sec>
  )
}

export default function CaloriesBurnedCalculator({ meta, category }) {
  const catColor = category?.color || '#ef4444'
  const [wKg, setWKg] = useState(75)
  const [actKey, setActKey] = useState('run_moderate')
  const [durationMin, setDurationMin] = useState(45)
  const [openFaq, setOpenFaq] = useState(null)

  const act = ACTIVITIES.find(a => a.key === actKey) || ACTIVITIES[3]
  const kcal = Math.round(act.met * wKg * (durationMin / 60))
  const kcalPerMin = (act.met * wKg / 60).toFixed(1)
  const epoc = act.met >= 8 ? Math.round(kcal * 0.12) : act.met >= 6 ? Math.round(kcal * 0.07) : 0
  const score = clamp(Math.round((kcal / 700) * 100), 5, 100)
  const grade = score >= 80 ? 'High burn' : score >= 55 ? 'Moderate burn' : score >= 30 ? 'Light burn' : 'Low burn'
  const gradeColor = score >= 80 ? '#ef4444' : score >= 55 ? '#f59e0b' : score >= 30 ? '#22a355' : '#94a3b8'
  const gradeSoft = score >= 80 ? '#fee2e2' : score >= 55 ? '#fef3c7' : score >= 30 ? '#d1fae5' : '#f1f5f9'
  const R = 42, C = 54, circ = 2 * Math.PI * R, fill = circ * (score / 100)

  const factors = [
    { label:'Calories burned', value:`${kcal} kcal`, score:score, color:gradeColor, note:`${kcalPerMin} kcal/min during session` },
    { label:'Afterburn (EPOC)', value:`+${epoc} kcal`, score:clamp(epoc / 60 * 100, 0, 100), color:'#f59e0b', note: epoc > 0 ? 'Elevated metabolism post-exercise' : 'Minimal afterburn for this activity' },
    { label:'Session intensity', value:`MET ${act.met}`, score:clamp((act.met / 12) * 100, 0, 100), color:'#3b82f6', note:`MET 1 = rest · MET ${act.met} = ${act.met}× resting rate` },
  ]

  const hint = `${act.label} for ${durationMin} min at ${wKg}kg ≈ ${kcal} kcal (${kcalPerMin} kcal/min). Plus ~${epoc} kcal EPOC. Total: ~${kcal + epoc} kcal.`

  const maxActivityKcal = Math.round(Math.max(...ACTIVITIES.map(a => a.met)) * wKg * (durationMin / 60))

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <CalcShell
        left={<>
          <div style={{ fontSize:10, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:14 }}>Your stats</div>
          <Stepper label="Body weight" value={wKg} onChange={setWKg} min={30} max={250} unit="kg" catColor={catColor} />
          <Stepper label="Duration" value={durationMin} onChange={setDurationMin} min={1} max={300} unit="min" catColor={catColor} />

          <div style={{ borderTop:'0.5px solid var(--border)', paddingTop:16, marginTop:4 }}>
            <div style={{ fontSize:12, fontWeight:600, color:'var(--text-2)', marginBottom:10, fontFamily:"'DM Sans',sans-serif" }}>Activity</div>
            <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
              {ACTIVITIES.map(a => (
                <button key={a.key} onClick={() => setActKey(a.key)} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'9px 12px', borderRadius:8, border:`1.5px solid ${actKey === a.key ? catColor : 'var(--border-2)'}`, background:actKey === a.key ? catColor + '12' : 'var(--bg-raised)', cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ fontSize:14 }}>{a.icon}</span>
                    <span style={{ fontSize:12, fontWeight:actKey === a.key ? 700 : 500, color:actKey === a.key ? catColor : 'var(--text)' }}>{a.label}</span>
                  </div>
                  <span style={{ fontSize:10, color:'var(--text-3)' }}>MET {a.met}</span>
                </button>
              ))}
            </div>
          </div>
        </>}
        right={<>
          <div style={{ background:'var(--bg-card)', border:'0.5px solid var(--border)', borderRadius:14, overflow:'hidden', marginBottom:14 }}>
            <div style={{ padding:'11px 16px', borderBottom:'0.5px solid var(--border)', display:'flex', justifyContent:'space-between' }}>
              <span style={{ fontSize:12, fontWeight:700, color:'var(--text)', fontFamily:"'Space Grotesk',sans-serif" }}>Session Burn Score</span>
              <span style={{ fontSize:10, color:'var(--text-3)' }}>Updates live</span>
            </div>
            <div style={{ padding:'16px 18px' }}>
              <div style={{ display:'flex', gap:18, alignItems:'center', marginBottom:16 }}>
                <svg viewBox="0 0 108 108" width="96" height="96" style={{ flexShrink:0 }}>
                  <circle cx={C} cy={C} r={R} fill="none" stroke="var(--border)" strokeWidth="11" />
                  <circle cx={C} cy={C} r={R} fill="none" stroke={gradeColor} strokeWidth="11" strokeLinecap="round" strokeDasharray={`${fill} ${circ}`} strokeDashoffset={circ / 4} transform={`rotate(-90 ${C} ${C})`} style={{ transition:'stroke-dasharray .6s ease, stroke .3s' }} />
                  <text x={C} y={C - 6} textAnchor="middle" fontSize="22" fontWeight="700" fill="var(--text)" fontFamily="inherit">{score}</text>
                  <text x={C} y={C + 10} textAnchor="middle" fontSize="9" fill="var(--text-3)" fontFamily="inherit">/ 100</text>
                </svg>
                <div>
                  <div style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'5px 12px 5px 8px', borderRadius:20, background:gradeSoft, border:`1px solid ${gradeColor}35`, marginBottom:8 }}>
                    <div style={{ width:8, height:8, borderRadius:'50%', background:gradeColor }} />
                    <span style={{ fontSize:12, fontWeight:700, color:gradeColor }}>{grade}</span>
                  </div>
                  <div style={{ fontSize:32, fontWeight:700, color:catColor, fontFamily:"'Space Grotesk',sans-serif", lineHeight:1 }}>{kcal}</div>
                  <div style={{ fontSize:11, color:'var(--text-3)', marginTop:3 }}>kcal burned</div>
                </div>
              </div>

              {factors.map((f, i) => (
                <div key={i} style={{ marginBottom:10 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, marginBottom:4 }}>
                    <span style={{ color:'var(--text-2)' }}>{f.label}</span>
                    <span style={{ fontWeight:700, color:f.color }}>{f.value}</span>
                  </div>
                  <div style={{ height:6, background:'var(--border)', borderRadius:3, overflow:'hidden' }}>
                    <div style={{ height:'100%', width:`${clamp(f.score, 0, 100)}%`, background:f.color, borderRadius:3, transition:'width .5s' }} />
                  </div>
                  <div style={{ fontSize:10, color:'var(--text-3)', marginTop:2 }}>{f.note}</div>
                </div>
              ))}
            </div>

            <div style={{ margin:'0 18px 16px', padding:'10px 13px', background:gradeSoft, borderRadius:10, border:`1px solid ${gradeColor}30` }}>
              <p style={{ fontSize:11.5, color:'var(--text-2)', margin:0, lineHeight:1.65 }}>
                Total including afterburn: <strong style={{ color:gradeColor }}>{kcal + epoc} kcal</strong>
              </p>
            </div>
          </div>

          <BreakdownTable title="Calorie Burn" rows={[
            { label:'Calories burned', value:`${kcal} kcal`, bold:true, highlight:true, color:catColor },
            { label:'EPOC afterburn', value:`+${epoc} kcal`, color:'#f59e0b' },
            { label:'Total estimated', value:`${kcal + epoc} kcal`, color:catColor },
            { label:'Rate', value:`${kcalPerMin} kcal/min` },
            { label:'Activity MET', value:act.met },
            { label:'Duration', value:`${durationMin} min` },
          ]} />

          <AIHintCard hint={hint} />
        </>}
      />

      <SessionInsightSection
        act={act}
        durationMin={durationMin}
        kcal={kcal}
        epoc={epoc}
        grade={grade}
        gradeColor={gradeColor}
        gradeSoft={gradeSoft}
        kcalPerMin={kcalPerMin}
        catColor={catColor}
      />

      <BurnMeaningSection
        kcal={kcal}
        epoc={epoc}
        durationMin={durationMin}
        catColor={catColor}
      />

      <FoodEquivalentsSection
        kcal={kcal}
        catColor={catColor}
      />

      <IntensityBreakdownSection
        act={act}
        durationMin={durationMin}
        kcal={kcal}
        gradeColor={gradeColor}
        catColor={catColor}
      />

      <Sec title="Compare all activities" sub={`${durationMin} minutes at ${wKg} kg`}>
        <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
          {ACTIVITIES.slice().sort((a, b) => b.met - a.met).map((a, i) => {
            const k = Math.round(a.met * wKg * (durationMin / 60))
            const isActive = a.key === actKey
            return (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 12px', borderRadius:8, background:isActive ? catColor + '12' : 'var(--bg-raised)', border:`${isActive ? '1.5' : '0.5'}px solid ${isActive ? catColor : 'var(--border)'}` }}>
                <span style={{ fontSize:13, flexShrink:0 }}>{a.icon}</span>
                <div style={{ flex:1, fontSize:11, fontWeight:isActive ? 700 : 400, color:isActive ? catColor : 'var(--text)' }}>{a.label}</div>
                <div style={{ flex:2, height:4, background:'var(--border)', borderRadius:2 }}>
                  <div style={{ height:'100%', width:`${(k / maxActivityKcal) * 100}%`, background:isActive ? catColor : catColor + '45', borderRadius:2 }} />
                </div>
                <div style={{ fontSize:11, fontWeight:700, color:isActive ? catColor : 'var(--text-2)', minWidth:55, textAlign:'right' }}>{k} kcal</div>
              </div>
            )
          })}
        </div>
      </Sec>

      <CompareIntensitySection
        act={act}
        wKg={wKg}
        durationMin={durationMin}
        catColor={catColor}
      />

      <InterestingFactsSection
        act={act}
        kcal={kcal}
        epoc={epoc}
        durationMin={durationMin}
        catColor={catColor}
      />

      <Sec title="Frequently asked questions" sub="Calorie burn explained">
        {FAQ.map((f, i) => (
          <Acc key={i} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} catColor={catColor} />
        ))}
      </Sec>
    </div>
  )
}