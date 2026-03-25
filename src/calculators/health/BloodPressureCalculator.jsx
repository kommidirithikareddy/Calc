import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'

const clamp = (v,a,b) => Math.min(b, Math.max(a, v))

const BP_CATS = [
  { label:'Normal',         systMax:120, diasMax:80,  color:'#10b981', soft:'#d1fae5', desc:'Optimal. Maintain with healthy lifestyle.' },
  { label:'Elevated',       systMax:129, diasMax:80,  color:'#22a355', soft:'#dcfce7', desc:'Above normal. Monitor and improve lifestyle.' },
  { label:'High — Stage 1', systMax:139, diasMax:89,  color:'#f59e0b', soft:'#fef3c7', desc:'Hypertension Stage 1. Consult a doctor.' },
  { label:'High — Stage 2', systMax:180, diasMax:120, color:'#ef4444', soft:'#fee2e2', desc:'Hypertension Stage 2. Seek medical advice.' },
  { label:'Crisis',         systMax:999, diasMax:999, color:'#dc2626', soft:'#fee2e2', desc:'Hypertensive crisis. Seek immediate medical attention.' },
]

const FAQ = [
  { q:'What is a normal blood pressure reading?',
    a:'Normal: systolic below 120 mmHg AND diastolic below 80 mmHg. Elevated: 120–129 / <80. Stage 1 hypertension: 130–139 / 80–89. Stage 2: ≥140 / ≥90. A single reading does not diagnose hypertension — multiple readings on different days are required for a formal diagnosis.' },
  { q:'What causes high blood pressure?',
    a:'Primary hypertension (90% of cases) has no single cause — it develops gradually from lifestyle factors including excess sodium, low potassium, obesity, physical inactivity, excess alcohol, chronic stress, and genetics. Secondary hypertension (10%) is caused by an underlying condition such as kidney disease, thyroid disorders, or sleep apnoea.' },
  { q:'How can I lower my blood pressure naturally?',
    a:'Evidence-based changes: DASH diet (−8–14 mmHg systolic), reducing sodium below 2,300mg/day (−2–8 mmHg), aerobic exercise 30 min most days (−4–9 mmHg), weight loss (−1 mmHg per kg lost), reducing alcohol (−2–4 mmHg), quitting smoking. These can be as effective as medication for Stage 1 hypertension.' },
  { q:'How should I take my blood pressure reading at home?',
    a:'Sit quietly for 5 minutes before measuring. Sit with back supported, feet flat on floor, arm at heart level. Do not talk during the reading. Take 2–3 readings, 1 minute apart, and average them. Avoid caffeine, exercise, and smoking for 30 minutes beforehand. Measure at the same time each day for consistency.' },
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
  const commit = r => {
    const n = parseFloat(r)
    onChange(clamp(isNaN(n) ? value : n, min, max))
    setEditing(false)
  }

  const btn = {
    width:38,
    height:'100%',
    border:'none',
    background:'var(--bg-raised)',
    color:'var(--text)',
    fontSize:20,
    fontWeight:300,
    cursor:'pointer',
    display:'flex',
    alignItems:'center',
    justifyContent:'center',
    flexShrink:0
  }

  return (
    <div style={{ marginBottom:16 }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
        <label style={{ fontSize:12.5, fontWeight:600, color:'var(--text)', fontFamily:"'DM Sans',sans-serif" }}>{label}</label>
        {hint && <span style={{ fontSize:10, color:'var(--text-3)' }}>{hint}</span>}
      </div>
      <div style={{ display:'flex', alignItems:'stretch', height:40, border:`1.5px solid ${editing ? catColor : 'var(--border-2)'}`, borderRadius:9, overflow:'hidden', background:'var(--bg-card)', transition:'border-color .15s' }}>
        <button onMouseDown={e => { e.preventDefault(); onChange(clamp(value - step, min, max)) }} style={{ ...btn, borderRight:'1px solid var(--border)' }} onMouseEnter={e => e.currentTarget.style.background = catColor + '18'} onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-raised)' }>−</button>
        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:5 }}>
          {editing
            ? <input type="number" defaultValue={value} onBlur={e => commit(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') commit(e.target.value); if (e.key === 'Escape') setEditing(false) }} style={{ width:'55%', border:'none', background:'transparent', textAlign:'center', fontSize:15, fontWeight:700, color:'var(--text)', outline:'none' }} autoFocus />
            : <span onClick={() => setEditing(true)} style={{ fontSize:15, fontWeight:700, color:'var(--text)', cursor:'text', minWidth:36, textAlign:'center' }}>{value}</span>
          }
          <span style={{ fontSize:11, color:'var(--text-3)', fontWeight:500 }}>{unit}</span>
        </div>
        <button onMouseDown={e => { e.preventDefault(); onChange(clamp(value + step, min, max)) }} style={{ ...btn, borderLeft:'1px solid var(--border)' }} onMouseEnter={e => e.currentTarget.style.background = catColor + '18'} onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-raised)' }>+</button>
      </div>
    </div>
  )
}

function InsightSection({ systolic, diastolic, pulse, map, score, cat }) {
  let title = ''
  let message = ''
  let recommendation = ''

  if (cat.label === 'Normal') {
    title = 'Healthy blood pressure range'
    message = 'Your reading is within the normal range. That generally suggests lower strain on the heart and blood vessels compared with elevated or hypertensive ranges.'
    recommendation = 'Keep focusing on exercise, sleep, weight control, stress reduction, and a balanced diet to maintain this range.'
  } else if (cat.label === 'Elevated') {
    title = 'Above normal, but not yet hypertension'
    message = 'Your blood pressure is higher than ideal, even though it is not yet in Stage 1 hypertension. This is often the point where lifestyle changes can have the biggest impact.'
    recommendation = 'Repeat readings over time and work on sodium reduction, activity, weight control, and sleep quality.'
  } else if (cat.label === 'High — Stage 1') {
    title = 'Stage 1 hypertension range'
    message = 'Your reading falls into the Stage 1 hypertension category. This does not confirm a diagnosis from one reading alone, but it is a meaningful signal that deserves monitoring.'
    recommendation = 'Track readings at home over several days and discuss them with a clinician, especially if they remain elevated.'
  } else if (cat.label === 'High — Stage 2') {
    title = 'Stage 2 hypertension range'
    message = 'Your reading is clearly elevated and may place greater long-term strain on the heart, kidneys, and blood vessels.'
    recommendation = 'Do not ignore repeated readings in this range. Seek medical guidance and monitor carefully.'
  } else {
    title = 'Hypertensive crisis range'
    message = 'This reading is very high and may require urgent medical attention, especially if accompanied by headache, chest pain, shortness of breath, weakness, or confusion.'
    recommendation = 'Retest immediately and seek urgent care if this reading is confirmed or symptoms are present.'
  }

  return (
    <Sec title="Your blood pressure insight" sub={title}>
      <div style={{ display:'grid', gap:14 }}>
        <div style={{ padding:'14px 15px', borderRadius:12, background:cat.soft, border:`1px solid ${cat.color}35` }}>
          <div style={{ fontSize:13, fontWeight:700, color:cat.color, marginBottom:6, fontFamily:"'Space Grotesk',sans-serif" }}>
            {cat.label}
          </div>
          <p style={{ margin:0, fontSize:12.5, color:'var(--text-2)', lineHeight:1.75, fontFamily:"'DM Sans',sans-serif" }}>
            {message}
          </p>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(4, minmax(0, 1fr))', gap:10 }}>
          {[
            { label:'Reading', value:`${systolic}/${diastolic}` },
            { label:'Pulse pressure', value:`${pulse} mmHg` },
            { label:'MAP', value:`${map} mmHg` },
            { label:'Score', value:`${score}/100` },
          ].map((item, i) => (
            <div key={i} style={{ padding:'12px 10px', borderRadius:10, background:'var(--bg-raised)', border:'0.5px solid var(--border)' }}>
              <div style={{ fontSize:10.5, color:'var(--text-3)', marginBottom:4 }}>{item.label}</div>
              <div style={{ fontSize:15, fontWeight:700, color:'var(--text)', fontFamily:"'Space Grotesk',sans-serif" }}>{item.value}</div>
            </div>
          ))}
        </div>

        <div style={{ padding:'12px 14px', borderRadius:10, background:'var(--bg-raised)', border:'0.5px solid var(--border)' }}>
          <div style={{ fontSize:11, fontWeight:700, color:'var(--text)', marginBottom:6, fontFamily:"'DM Sans',sans-serif" }}>
            Recommended next step
          </div>
          <p style={{ margin:0, fontSize:12, color:'var(--text-2)', lineHeight:1.7, fontFamily:"'DM Sans',sans-serif" }}>
            {recommendation}
          </p>
        </div>
      </div>
    </Sec>
  )
}

function ActionSection({ cat, catColor }) {
  let items = []

  if (cat.label === 'Normal') {
    items = [
      'Keep checking periodically rather than obsessing over single readings.',
      'Maintain regular exercise, healthy sleep, and balanced sodium intake.',
      'Use the same cuff, same arm, and similar times of day for consistency.',
    ]
  } else if (cat.label === 'Elevated') {
    items = [
      'Reduce sodium and increase potassium-rich foods if medically appropriate.',
      'Start or maintain regular aerobic exercise most days of the week.',
      'Track readings over several days to see whether the pattern persists.',
    ]
  } else if (cat.label === 'High — Stage 1') {
    items = [
      'Average multiple home readings instead of reacting to a single number.',
      'Work on weight, activity, stress, sleep, and alcohol reduction.',
      'Schedule follow-up with a clinician if readings remain in this range.',
    ]
  } else if (cat.label === 'High — Stage 2') {
    items = [
      'Recheck after resting quietly for 5 minutes.',
      'Keep a log of readings with date, time, and any symptoms.',
      'Seek medical advice rather than waiting if repeated readings stay high.',
    ]
  } else {
    items = [
      'Retake the reading immediately after sitting quietly.',
      'Do not ignore symptoms like chest pain, severe headache, weakness, or breathlessness.',
      'Seek urgent medical evaluation if the reading remains this high or symptoms are present.',
    ]
  }

  return (
    <Sec title="What to do next" sub="Simple steps based on your result">
      <div style={{ display:'grid', gap:10 }}>
        {items.map((item, i) => (
          <div key={i} style={{ display:'flex', gap:10, alignItems:'flex-start', padding:'12px 13px', borderRadius:10, background:'var(--bg-raised)', border:'0.5px solid var(--border)' }}>
            <div style={{ width:22, height:22, borderRadius:'50%', background:catColor + '18', color:catColor, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, flexShrink:0 }}>
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

function ReadingChecklist({ catColor }) {
  const checks = [
    'Sit quietly for 5 minutes before measuring.',
    'Keep your back supported and feet flat on the floor.',
    'Rest your arm at heart level.',
    'Avoid talking during the reading.',
    'Take 2–3 readings and average them.',
    'Avoid caffeine, smoking, or exercise for 30 minutes before measuring.',
  ]

  return (
    <Sec title="Reading quality checklist" sub="Get more reliable BP readings">
      <div style={{ display:'grid', gap:8 }}>
        {checks.map((item, i) => (
          <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:10, padding:'10px 12px', borderRadius:9, background:i === 0 ? catColor + '10' : 'var(--bg-raised)', border:`0.5px solid ${i === 0 ? catColor + '35' : 'var(--border)'}` }}>
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

function RiskFactorsSection({ age, catColor }) {
  const factors = [
    `Age ${age}+ tends to increase blood vessel stiffness over time, which can raise systolic pressure.`,
    'Excess sodium, low potassium intake, and processed foods commonly push blood pressure upward.',
    'Low activity, poor sleep, stress, alcohol, smoking, and excess body weight can all contribute.',
    'Family history, kidney disease, sleep apnoea, and hormone disorders may also play a role.',
  ]

  return (
    <Sec title="What can raise blood pressure?" sub="Common contributors">
      <div style={{ display:'grid', gap:10 }}>
        {factors.map((item, i) => (
          <div key={i} style={{ padding:'12px 13px', borderRadius:10, background:i === 0 ? catColor + '10' : 'var(--bg-raised)', border:`0.5px solid ${i === 0 ? catColor + '35' : 'var(--border)'}` }}>
            <div style={{ fontSize:11, fontWeight:700, color:i === 0 ? catColor : 'var(--text)', marginBottom:5, fontFamily:"'DM Sans',sans-serif" }}>
              Factor {i + 1}
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

function MedicalHelpSection({ cat }) {
  const cards = [
    {
      title:'Monitor',
      active: cat.label === 'Elevated',
      color:'#22a355',
      soft:'#dcfce7',
      text:'Elevated readings deserve repeat checks and lifestyle attention, even if they are not yet hypertension.',
    },
    {
      title:'Book follow-up',
      active: cat.label === 'High — Stage 1' || cat.label === 'High — Stage 2',
      color:'#f59e0b',
      soft:'#fef3c7',
      text:'Repeated Stage 1 or Stage 2 readings should be reviewed with a clinician rather than ignored.',
    },
    {
      title:'Urgent care',
      active: cat.label === 'Crisis',
      color:'#ef4444',
      soft:'#fee2e2',
      text:'Very high blood pressure with or without symptoms may need urgent medical attention.',
    },
  ]

  return (
    <Sec title="When to seek medical help" sub="Important safety context">
      <div style={{ display:'grid', gap:10 }}>
        {cards.map((item, i) => (
          <div key={i} style={{ padding:'12px 13px', borderRadius:10, background:item.active ? item.soft : 'var(--bg-raised)', border:`0.5px solid ${item.active ? item.color + '40' : 'var(--border)'}` }}>
            <div style={{ fontSize:11, fontWeight:700, color:item.active ? item.color : 'var(--text)', marginBottom:5, fontFamily:"'DM Sans',sans-serif" }}>
              {item.title}
            </div>
            <p style={{ margin:0, fontSize:12.5, color:'var(--text-2)', lineHeight:1.65, fontFamily:"'DM Sans',sans-serif" }}>
              {item.text}
            </p>
          </div>
        ))}
        <p style={{ margin:'4px 0 0', fontSize:11.5, color:'var(--text-3)', lineHeight:1.7, fontFamily:"'DM Sans',sans-serif" }}>
          A single reading is not a diagnosis, but very high repeated readings or readings with symptoms should be taken seriously.
        </p>
      </div>
    </Sec>
  )
}

export default function BloodPressureCalculator({ meta, category }) {
  const catColor = category?.color || '#ef4444'
  const [systolic, setSystolic] = useState(120)
  const [diastolic, setDiastolic] = useState(80)
  const [age, setAge] = useState(40)
  const [openFaq, setOpenFaq] = useState(null)

  const cat = BP_CATS.find(c => systolic <= c.systMax && diastolic <= c.diasMax) || BP_CATS[BP_CATS.length - 1]
  const pulse = systolic - diastolic
  const map = Math.round(diastolic + (pulse / 3))
  const score = clamp(
    Math.round(
      100
      - Math.max(0, systolic - 115) / 0.65
      - Math.max(0, diastolic - 75) / 0.5
    ),
    0,
    100
  )

  const R = 42
  const C = 54
  const circ = 2 * Math.PI * R
  const fill = circ * (score / 100)

  const factors = [
    {
      label:'Systolic pressure',
      value:`${systolic} mmHg`,
      score:clamp(100 - (Math.max(0, systolic - 115) / 0.7), 0, 100),
      color:systolic <= 120 ? '#10b981' : systolic <= 130 ? '#22a355' : systolic <= 140 ? '#f59e0b' : '#ef4444',
      note:'Upper number — pressure when heart beats',
    },
    {
      label:'Diastolic pressure',
      value:`${diastolic} mmHg`,
      score:clamp(100 - (Math.max(0, diastolic - 75) / 0.55), 0, 100),
      color:diastolic <= 80 ? '#10b981' : diastolic <= 85 ? '#22a355' : diastolic <= 90 ? '#f59e0b' : '#ef4444',
      note:'Lower number — pressure between beats',
    },
    {
      label:'Mean arterial pressure',
      value:`${map} mmHg`,
      score:clamp(100 - (Math.max(0, map - 93) / 0.6), 0, 100),
      color:map <= 93 ? '#10b981' : map <= 100 ? '#f59e0b' : '#ef4444',
      note:'Average perfusion pressure to organs',
    },
  ]

  const hint = `Blood pressure: ${systolic}/${diastolic} mmHg — ${cat.label}. Pulse pressure: ${pulse} mmHg. MAP: ${map} mmHg. ${cat.desc}`

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <CalcShell
        left={
          <>
            <div style={{ fontSize:10, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:14 }}>
              Your reading
            </div>

            <Stepper
              label="Systolic (top number)"
              value={systolic}
              onChange={setSystolic}
              min={70}
              max={250}
              unit="mmHg"
              catColor={catColor}
            />

            <Stepper
              label="Diastolic (bottom number)"
              value={diastolic}
              onChange={setDiastolic}
              min={40}
              max={150}
              unit="mmHg"
              catColor={catColor}
            />

            <Stepper
              label="Age"
              value={age}
              onChange={setAge}
              min={10}
              max={100}
              unit="yrs"
              catColor={catColor}
            />

            <div style={{ borderTop:'0.5px solid var(--border)', paddingTop:16, marginTop:4 }}>
              <div style={{ fontSize:12, fontWeight:600, color:'var(--text-2)', marginBottom:10, fontFamily:"'DM Sans',sans-serif" }}>
                AHA blood pressure categories
              </div>
              {BP_CATS.map((c, i) => (
                <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'7px 10px', borderRadius:7, background:cat.label === c.label ? c.soft : 'var(--bg-raised)', border:`${cat.label === c.label ? '1.5' : '0.5'}px solid ${cat.label === c.label ? c.color : 'var(--border)'}`, marginBottom:4 }}>
                  <span style={{ fontSize:11, fontWeight:cat.label === c.label ? 700 : 500, color:c.color }}>{c.label}</span>
                  <span style={{ fontSize:10, color:'var(--text-3)' }}>≤{c.systMax}/{c.diasMax}</span>
                </div>
              ))}
            </div>

            <div style={{ borderTop:'0.5px solid var(--border)', paddingTop:14, marginTop:12 }}>
              <div style={{ fontSize:12, fontWeight:600, color:'var(--text-2)', marginBottom:8, fontFamily:"'DM Sans',sans-serif" }}>
                How to get an accurate reading
              </div>
              <p style={{ fontSize:11.5, color:'var(--text-3)', lineHeight:1.65, margin:0, fontFamily:"'DM Sans',sans-serif" }}>
                Sit quietly for 5 minutes. Feet flat, back supported, arm at heart level. Take 2–3 readings 1 minute apart and average them. Avoid caffeine or exercise 30 minutes before.
              </p>
            </div>
          </>
        }
        right={
          <>
            <div style={{ background:'var(--bg-card)', border:'0.5px solid var(--border)', borderRadius:14, overflow:'hidden', marginBottom:14 }}>
              <div style={{ padding:'11px 16px', borderBottom:'0.5px solid var(--border)', display:'flex', justifyContent:'space-between' }}>
                <span style={{ fontSize:12, fontWeight:700, color:'var(--text)', fontFamily:"'Space Grotesk',sans-serif" }}>
                  Blood Pressure Score
                </span>
                <span style={{ fontSize:10, color:'var(--text-3)' }}>
                  Updates live
                </span>
              </div>
              <div style={{ padding:'16px 18px' }}>
                <div style={{ display:'flex', gap:18, alignItems:'center', marginBottom:16 }}>
                  <svg viewBox="0 0 108 108" width="92" height="92" style={{ flexShrink:0 }}>
                    <circle cx={C} cy={C} r={R} fill="none" stroke="var(--border)" strokeWidth="11" />
                    <circle
                      cx={C}
                      cy={C}
                      r={R}
                      fill="none"
                      stroke={cat.color}
                      strokeWidth="11"
                      strokeLinecap="round"
                      strokeDasharray={`${fill} ${circ}`}
                      strokeDashoffset={circ / 4}
                      transform={`rotate(-90 ${C} ${C})`}
                      style={{ transition:'stroke-dasharray .6s, stroke .3s' }}
                    />
                    <text x={C} y={C - 6} textAnchor="middle" fontSize="20" fontWeight="700" fill="var(--text)" fontFamily="inherit">
                      {Math.round(score)}
                    </text>
                    <text x={C} y={C + 10} textAnchor="middle" fontSize="9" fill="var(--text-3)" fontFamily="inherit">
                      / 100
                    </text>
                  </svg>

                  <div>
                    <div style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'5px 12px 5px 8px', borderRadius:20, background:cat.soft, border:`1px solid ${cat.color}35`, marginBottom:6 }}>
                      <div style={{ width:8, height:8, borderRadius:'50%', background:cat.color }} />
                      <span style={{ fontSize:12, fontWeight:700, color:cat.color }}>{cat.label}</span>
                    </div>
                    <div style={{ fontSize:11, color:'var(--text-3)', lineHeight:1.5 }}>{cat.desc}</div>
                    <div style={{ fontSize:24, fontWeight:700, color:cat.color, fontFamily:"'Space Grotesk',sans-serif", marginTop:6 }}>
                      {systolic}/{diastolic}
                    </div>
                    <div style={{ fontSize:10, color:'var(--text-3)' }}>mmHg</div>
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

              <div style={{ margin:'0 18px 16px', padding:'10px 13px', background:cat.soft, borderRadius:10, border:`1px solid ${cat.color}30` }}>
                <p style={{ fontSize:11.5, color:'var(--text-2)', margin:0, lineHeight:1.65 }}>{cat.desc}</p>
              </div>
            </div>

            <BreakdownTable
              title="BP Summary"
              rows={[
                { label:'Reading', value:`${systolic}/${diastolic} mmHg`, bold:true, highlight:true, color:cat.color },
                { label:'Category', value:cat.label, color:cat.color },
                { label:'Pulse pressure', value:`${pulse} mmHg` },
                { label:'Mean art. press', value:`${map} mmHg` },
                { label:'Score', value:`${score}/100`, color:cat.color },
              ]}
            />
            <AIHintCard hint={hint} />
          </>
        }
      />

      <InsightSection
        systolic={systolic}
        diastolic={diastolic}
        pulse={pulse}
        map={map}
        score={score}
        cat={cat}
      />

      <ActionSection
        cat={cat}
        catColor={catColor}
      />

      <ReadingChecklist catColor={catColor} />

      <Sec title="Understanding your numbers" sub="Systolic, diastolic, and what they measure">
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          {[
            { label:'Systolic', val:`${systolic} mmHg`, color:systolic <= 120 ? '#10b981' : '#f59e0b', desc:'Pressure when heart contracts and pumps blood. The upper number.' },
            { label:'Diastolic', val:`${diastolic} mmHg`, color:diastolic <= 80 ? '#10b981' : '#f59e0b', desc:'Pressure when heart rests between beats. The lower number.' },
            { label:'Pulse pressure', val:`${pulse} mmHg`, color:'#3b82f6', desc:'Difference between systolic and diastolic. Normal: 40–60 mmHg.' },
            { label:'Mean art. press', val:`${map} mmHg`, color:map <= 93 ? '#10b981' : '#f59e0b', desc:'Average pressure through one cardiac cycle. Organs need >60 mmHg.' },
          ].map((s, i) => (
            <div key={i} style={{ padding:'11px 13px', borderRadius:9, background:'var(--bg-raised)', border:'0.5px solid var(--border)' }}>
              <div style={{ fontSize:10, color:'var(--text-3)', marginBottom:3 }}>{s.label}</div>
              <div style={{ fontSize:18, fontWeight:700, color:s.color, fontFamily:"'Space Grotesk',sans-serif", marginBottom:4 }}>{s.val}</div>
              <div style={{ fontSize:11, color:'var(--text-2)', lineHeight:1.5 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </Sec>

      <RiskFactorsSection
        age={age}
        catColor={catColor}
      />

      <MedicalHelpSection
        cat={cat}
      />

      <Sec title="Frequently asked questions" sub="Blood pressure explained">
        {FAQ.map((f, i) => (
          <Acc
            key={i}
            q={f.q}
            a={f.a}
            open={openFaq === i}
            onToggle={() => setOpenFaq(openFaq === i ? null : i)}
            catColor={catColor}
          />
        ))}
      </Sec>
    </div>
  )
}