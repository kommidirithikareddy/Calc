import { useState, useEffect, useRef } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'

const clamp = (v,a,b) => Math.min(b, Math.max(a, v))
const addDays = (d,n) => { const r = new Date(d); r.setDate(r.getDate() + n); return r }
const fmtDate = d => d.toLocaleDateString('en-GB',{ day:'numeric', month:'long', year:'numeric' })
const fmtShort = d => d.toLocaleDateString('en-GB',{ day:'numeric', month:'short' })
const daysBetween = (a,b) => Math.round((b - a) / 86400000)

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

function DateInput({ label, hint, value, onChange, catColor }) {
  return (
    <div style={{ marginBottom:16 }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
        <label style={{ fontSize:12.5, fontWeight:600, color:'var(--text)', fontFamily:"'DM Sans',sans-serif" }}>{label}</label>
        {hint && <span style={{ fontSize:10, color:'var(--text-3)' }}>{hint}</span>}
      </div>
      <input
        type="date"
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          width:'100%',
          height:40,
          padding:'0 12px',
          border:'1.5px solid var(--border-2)',
          borderRadius:9,
          background:'var(--bg-card)',
          color:'var(--text)',
          fontSize:14,
          fontFamily:"'DM Sans',sans-serif",
          boxSizing:'border-box',
          outline:'none'
        }}
        onFocus={e => e.target.style.borderColor = catColor}
        onBlur={e => e.target.style.borderColor = 'var(--border-2)'}
      />
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
        <button
          onMouseDown={e => { e.preventDefault(); onChange(clamp(value - step, min, max)) }}
          style={{ ...btn, borderRight:'1px solid var(--border)' }}
          onMouseEnter={e => e.currentTarget.style.background = catColor + '18'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-raised)'}
        >
          −
        </button>

        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:5 }}>
          {editing ? (
            <input
              type="number"
              defaultValue={value}
              onBlur={e => commit(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') commit(e.target.value)
                if (e.key === 'Escape') setEditing(false)
              }}
              style={{ width:'55%', border:'none', background:'transparent', textAlign:'center', fontSize:15, fontWeight:700, color:'var(--text)', outline:'none' }}
              autoFocus
            />
          ) : (
            <span onClick={() => setEditing(true)} style={{ fontSize:15, fontWeight:700, color:'var(--text)', cursor:'text', minWidth:36, textAlign:'center' }}>
              {value}
            </span>
          )}
          <span style={{ fontSize:11, color:'var(--text-3)', fontWeight:500 }}>{unit}</span>
        </div>

        <button
          onMouseDown={e => { e.preventDefault(); onChange(clamp(value + step, min, max)) }}
          style={{ ...btn, borderLeft:'1px solid var(--border)' }}
          onMouseEnter={e => e.currentTarget.style.background = catColor + '18'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-raised)'}
        >
          +
        </button>
      </div>
    </div>
  )
}

function RotatorCard({ title, slides, catColor, autoMs=4000 }) {
  const [idx, setIdx] = useState(0)
  const timerRef = useRef(null)

  useEffect(() => {
    timerRef.current = setInterval(() => setIdx(i => (i + 1) % slides.length), autoMs)
    return () => clearInterval(timerRef.current)
  }, [slides.length, autoMs])

  return (
    <div style={{ background:'var(--bg-card)', border:'0.5px solid var(--border)', borderRadius:14, overflow:'hidden', marginBottom:14 }}>
      <div style={{ padding:'11px 16px', borderBottom:'0.5px solid var(--border)', display:'flex', justifyContent:'space-between' }}>
        <span style={{ fontSize:12, fontWeight:700, color:'var(--text)', fontFamily:"'Space Grotesk',sans-serif" }}>{title}</span>
        <span style={{ fontSize:10, color:'var(--text-3)' }}>Updates live · auto-rotates</span>
      </div>

      <div
        style={{ padding:'16px 18px', minHeight:200 }}
        onMouseEnter={() => clearInterval(timerRef.current)}
        onMouseLeave={() => {
          timerRef.current = setInterval(() => setIdx(i => (i + 1) % slides.length), autoMs)
        }}
      >
        {slides[idx]?.content}
      </div>

      <div style={{ display:'flex', justifyContent:'center', gap:6, paddingBottom:10 }}>
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => { setIdx(i); clearInterval(timerRef.current) }}
            style={{
              width:i === idx ? 20 : 6,
              height:6,
              borderRadius:3,
              background:i === idx ? catColor : 'var(--border)',
              border:'none',
              cursor:'pointer',
              transition:'all .2s'
            }}
          />
        ))}
      </div>

      <div style={{ display:'flex', gap:4, overflowX:'auto', padding:'0 12px 12px', scrollbarWidth:'none' }}>
        {slides.map((s, i) => (
          <button
            key={i}
            onClick={() => { setIdx(i); clearInterval(timerRef.current) }}
            style={{
              flexShrink:0,
              padding:'4px 10px',
              borderRadius:6,
              fontSize:10,
              fontWeight:idx === i ? 700 : 500,
              color:idx === i ? catColor : 'var(--text-3)',
              border:`1px solid ${idx === i ? catColor : 'var(--border)'}`,
              background:idx === i ? catColor + '10' : 'transparent',
              cursor:'pointer',
              fontFamily:"'DM Sans',sans-serif"
            }}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  )
}

const TRIMESTER_MILESTONES = [
  { week:4,  label:'Positive pregnancy test',     tri:1 },
  { week:8,  label:'Embryo becomes fetus',        tri:1 },
  { week:12, label:'End of first trimester',      tri:1 },
  { week:16, label:'Anatomy scan possible',       tri:2 },
  { week:20, label:'Anatomy scan (mid-pregnancy)',tri:2 },
  { week:24, label:'Viability threshold',         tri:2 },
  { week:28, label:'Third trimester begins',      tri:3 },
  { week:32, label:'Lungs nearly mature',         tri:3 },
  { week:36, label:'Early term',                  tri:3 },
  { week:40, label:'Due date (full term)',        tri:3 },
]

const FAQ = [
  { q:'How is the due date calculated?', a:"The standard Naegele's Rule adds 280 days (40 weeks) to the first day of the last menstrual period (LMP). This assumes a 28-day cycle with ovulation on day 14. For longer or shorter cycles, the due date shifts accordingly. Only about 4% of babies are born exactly on their due date — most arrive within 2 weeks either side." },
  { q:'What is the difference between LMP and conception date?', a:'LMP is typically 2 weeks before conception because ovulation occurs around day 14 of a 28-day cycle. Pregnancy is counted from LMP even though fertilisation has not happened yet. At "4 weeks pregnant," the embryo is only about 2 weeks old.' },
  { q:"What affects whether I'll go early or late?", a:'Factors associated with going past due date: first pregnancy, having a boy, family history of long pregnancies, BMI >30. Factors associated with early birth: prior preterm birth, smoking, certain infections. Most births (80%) occur between 38–42 weeks.' },
]

function PregnancyInsight({ dueDate, weeksPregnant, extraDays, trimester, daysLeft, triColor }) {
  let title = ''
  let message = ''
  let recommendation = ''

  if (trimester === 1) {
    title = 'Early pregnancy phase'
    message = 'This stage is focused on implantation, rapid cell division, and early organ development. Many people notice symptoms such as fatigue, nausea, and breast tenderness.'
    recommendation = 'Focus on prenatal vitamins, hydration, rest, and booking an appointment with your doctor if you have not already done so.'
  } else if (trimester === 2) {
    title = 'Growth and development phase'
    message = 'The second trimester is often more comfortable. Baby growth accelerates, movement may become noticeable, and key screening appointments often happen during this time.'
    recommendation = 'Keep up with routine appointments, nutrition, hydration, and tracking important scan dates.'
  } else {
    title = 'Birth preparation phase'
    message = 'The third trimester is when the baby gains weight quickly and your body prepares for labour. Energy may fluctuate and discomfort often increases.'
    recommendation = 'Prepare for labour, hospital plans, newborn essentials, and contact your doctor if symptoms change suddenly.'
  }

  return (
    <Sec title="Your pregnancy insight" sub={title}>
      <div style={{ display:'grid', gap:14 }}>
        <div style={{ padding:'14px 15px', borderRadius:12, background:triColor + '12', border:`1px solid ${triColor}35` }}>
          <div style={{ fontSize:13, fontWeight:700, color:triColor, marginBottom:6, fontFamily:"'Space Grotesk',sans-serif" }}>
            Trimester {trimester}
          </div>
          <p style={{ margin:0, fontSize:12.5, color:'var(--text-2)', lineHeight:1.75, fontFamily:"'DM Sans',sans-serif" }}>
            {message}
          </p>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(4, minmax(0, 1fr))', gap:10 }}>
          {[
            { label:'Due date', value:fmtShort(dueDate) },
            { label:'Weeks', value:`${weeksPregnant}w` },
            { label:'Extra days', value:`${extraDays}d` },
            { label:'Time left', value:daysLeft > 0 ? `${daysLeft}d` : 'Past due' },
          ].map((item, i) => (
            <div key={i} style={{ padding:'12px 10px', borderRadius:10, background:'var(--bg-raised)', border:'0.5px solid var(--border)' }}>
              <div style={{ fontSize:10.5, color:'var(--text-3)', marginBottom:4 }}>{item.label}</div>
              <div style={{ fontSize:15, fontWeight:700, color:'var(--text)', fontFamily:"'Space Grotesk',sans-serif" }}>{item.value}</div>
            </div>
          ))}
        </div>

        <div style={{ padding:'12px 14px', borderRadius:10, background:'var(--bg-raised)', border:'0.5px solid var(--border)' }}>
          <div style={{ fontSize:11, fontWeight:700, color:'var(--text)', marginBottom:6, fontFamily:"'DM Sans',sans-serif" }}>
            Recommended next focus
          </div>
          <p style={{ margin:0, fontSize:12, color:'var(--text-2)', lineHeight:1.7, fontFamily:"'DM Sans',sans-serif" }}>
            {recommendation}
          </p>
        </div>
      </div>
    </Sec>
  )
}

function NextStepsSection({ trimester, catColor }) {
  const items = trimester === 1
    ? [
        'Book or confirm your first prenatal appointment.',
        'Start or continue folic acid and prenatal vitamins.',
        'Track symptoms, hydration, and rest more carefully.',
      ]
    : trimester === 2
    ? [
        'Keep up with anatomy scan timing and routine checkups.',
        'Start planning maternity care, work leave, and household support.',
        'Monitor movement once it becomes regular for you.',
      ]
    : [
        'Prepare your hospital bag, transport plans, and your doctor’s contact details.',
        'Review labour signs and when to call your doctor.',
        'Finish practical newborn planning and support arrangements.',
      ]

  return (
    <Sec title="What happens next" sub="Practical next steps">
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

function UpcomingMilestonesSection({ lmp, cycleAdj, weeksPregnant, today, catColor }) {
  const upcoming = TRIMESTER_MILESTONES
    .map(m => ({ ...m, date:addDays(lmp, m.week * 7 + cycleAdj) }))
    .filter(m => m.week >= weeksPregnant)
    .slice(0, 5)

  return (
    <Sec title="Important upcoming milestones" sub="What is coming up next">
      <div style={{ display:'grid', gap:8 }}>
        {upcoming.map((m, i) => {
          const colors = ['#10b981', '#3b82f6', '#8b5cf6']
          const c = colors[m.tri - 1]
          const daysAway = daysBetween(today, m.date)

          return (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'11px 12px', borderRadius:9, background:i === 0 ? catColor + '10' : 'var(--bg-raised)', border:`0.5px solid ${i === 0 ? catColor + '35' : 'var(--border)'}` }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background:c, flexShrink:0 }} />
              <div style={{ flex:1 }}>
                <div style={{ fontSize:12, fontWeight:700, color:i === 0 ? catColor : 'var(--text)' }}>{m.label}</div>
                <div style={{ fontSize:10.5, color:'var(--text-3)', marginTop:2 }}>Week {m.week} · {fmtDate(m.date)}</div>
              </div>
              <div style={{ fontSize:10.5, fontWeight:700, color:i === 0 ? catColor : 'var(--text-3)', flexShrink:0 }}>
                {daysAway > 0 ? `${daysAway}d` : 'Now'}
              </div>
            </div>
          )
        })}
      </div>
    </Sec>
  )
}

function PlanningChecklist({ trimester, catColor }) {
  const items = [
    'Keep your key appointment dates written down.',
    'Track symptoms, questions, and medications for appointments.',
    trimester >= 2 ? 'Start planning baby essentials and support after birth.' : 'Think ahead about your support system and prenatal care needs.',
    trimester === 3 ? 'Prepare transport, hospital bag, and newborn care basics.' : 'Keep building a gradual plan so the third trimester feels easier.',
  ]

  return (
    <Sec title="Planning checklist" sub="Simple things to stay on top of">
      <div style={{ display:'grid', gap:8 }}>
        {items.map((item, i) => (
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

function MedicalGuidanceSection({ daysLeft, trimester }) {
  return (
    <Sec title="When to contact your doctor" sub="General safety guidance">
      <div style={{ display:'grid', gap:10 }}>
        {[
          'Contact your doctor urgently for heavy bleeding, severe pain, fainting, or sudden concerning symptoms.',
          trimester >= 3
            ? 'In later pregnancy, contact your doctor for reduced movement, fluid leakage, or regular contractions.'
            : 'Speak with your doctor if symptoms feel severe, unusual, or rapidly worsening.',
          daysLeft < 0
            ? 'If you are past your due date, follow your doctor’s advice and follow-up schedule closely.'
            : 'Keep attending routine checkups even if you feel well.',
        ].map((item, i) => (
          <div key={i} style={{ padding:'12px 13px', borderRadius:10, background:'var(--bg-raised)', border:'0.5px solid var(--border)' }}>
            <p style={{ margin:0, fontSize:12.5, color:'var(--text-2)', lineHeight:1.65, fontFamily:"'DM Sans',sans-serif" }}>
              {item}
            </p>
          </div>
        ))}
        <p style={{ margin:'4px 0 0', fontSize:11.5, color:'var(--text-3)', lineHeight:1.7, fontFamily:"'DM Sans',sans-serif" }}>
          This calculator gives an estimate only. For personal medical guidance, contact your doctor.
        </p>
      </div>
    </Sec>
  )
}

const getTrimesterColor = trimester =>
  trimester === 1 ? '#10b981' : trimester === 2 ? '#3b82f6' : '#8b5cf6'

export default function DueDateCalculator({ meta, category }) {
  const catColor = category?.color || '#ec4899'
  const [lmpStr, setLmpStr] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() - 14)
    return d.toISOString().split('T')[0]
  })
  const [cycleLen, setCycleLen] = useState(28)
  const [openFaq, setOpenFaq] = useState(null)

  const lmp = new Date(lmpStr)
  const cycleAdj = cycleLen - 28
  const dueDate = addDays(lmp, 280 + cycleAdj)
  const today = new Date()
  const daysPregnant = clamp(daysBetween(lmp, today), 0, 294)
  const weeksPregnant = Math.floor(daysPregnant / 7)
  const extraDays = daysPregnant % 7
  const trimester = weeksPregnant < 13 ? 1 : weeksPregnant < 27 ? 2 : 3
  const triColor = getTrimesterColor(trimester)
  const daysLeft = daysBetween(today, dueDate)
  const earlyDate = addDays(dueDate, -14)
  const lateDate = addDays(dueDate, 14)
  const pct = clamp(Math.round((daysPregnant / 280) * 100), 0, 100)

  const slides = [
    {
      label:'Due date',
      content:(
        <div>
          <div style={{ fontSize:10, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:10 }}>Your estimated due date</div>
          <div style={{ fontSize:34, fontWeight:700, color:catColor, fontFamily:"'Space Grotesk',sans-serif", lineHeight:1.1, marginBottom:6 }}>{fmtDate(dueDate)}</div>
          <div style={{ fontSize:11, color:'var(--text-3)', marginBottom:16 }}>{daysLeft > 0 ? `${daysLeft} days from today` : 'Due date has passed'}</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
            {[
              { l:'Earliest (38w)', d:earlyDate, c:'#22a355' },
              { l:'Due date (40w)', d:dueDate, c:catColor },
              { l:'Latest (42w)', d:lateDate, c:'#f59e0b' },
              { l:'Conceived ~', d:addDays(lmp, 14 + cycleAdj), c:'#8b5cf6' },
            ].map((r, i) => (
              <div key={i} style={{ padding:'9px 11px', borderRadius:8, background:'var(--bg-raised)', border:'0.5px solid var(--border)' }}>
                <div style={{ fontSize:9, color:'var(--text-3)', marginBottom:3 }}>{r.l}</div>
                <div style={{ fontSize:12, fontWeight:700, color:r.c }}>{fmtShort(r.d)}</div>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      label:'Progress',
      content:(
        <div>
          <div style={{ fontSize:10, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:10 }}>Pregnancy progress</div>
          <div style={{ display:'flex', alignItems:'flex-end', gap:10, marginBottom:14 }}>
            <div>
              <div style={{ fontSize:48, fontWeight:700, lineHeight:1, color:triColor, fontFamily:"'Space Grotesk',sans-serif" }}>{weeksPregnant}</div>
              <div style={{ fontSize:13, fontWeight:600, color:triColor }}>weeks + {extraDays}d</div>
            </div>
            <div style={{ paddingBottom:4 }}>
              <div style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'5px 12px 5px 8px', borderRadius:20, background:triColor + '18', border:`1px solid ${triColor}35` }}>
                <div style={{ width:8, height:8, borderRadius:'50%', background:triColor }} />
                <span style={{ fontSize:12, fontWeight:700, color:triColor }}>Trimester {trimester}</span>
              </div>
            </div>
          </div>
          <div style={{ height:10, background:'var(--border)', borderRadius:5, overflow:'hidden', marginBottom:6 }}>
            <div style={{ height:'100%', width:`${pct}%`, background:triColor, borderRadius:5, transition:'width .5s' }} />
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, color:'var(--text-3)', marginBottom:14 }}>
            <span>Week 1</span>
            <span>T2 W13→</span>
            <span>T3 W27→</span>
            <span>Week 40</span>
          </div>
          <div style={{ padding:'10px 12px', background:triColor + '12', borderRadius:8, border:`1px solid ${triColor}30` }}>
            <div style={{ fontSize:11.5, color:'var(--text-2)', lineHeight:1.6 }}>
              {trimester === 1
                ? 'First trimester: rapid cell division, major organ formation. Most common time for morning sickness (weeks 6–12).'
                : trimester === 2
                ? 'Second trimester: baby grows significantly. Most parents feel movement (quickening) at 18–22 weeks. Energy typically returns.'
                : 'Third trimester: baby gains weight rapidly. Lungs mature. Prepare for birth — baby can arrive from week 37.'}
            </div>
          </div>
        </div>
      )
    },
    {
      label:'Milestones',
      content:(
        <div>
          <div style={{ fontSize:10, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:10 }}>Key pregnancy milestones</div>
          <div style={{ display:'flex', flexDirection:'column', gap:4, maxHeight:220, overflowY:'auto' }}>
            {TRIMESTER_MILESTONES.map((m, i) => {
              const mDate = addDays(lmp, m.week * 7 + cycleAdj)
              const isPast = today > mDate
              const isCurrent = m.week >= weeksPregnant && m.week < weeksPregnant + 3
              const tc = [catColor, '#3b82f6', '#8b5cf6'][m.tri - 1]

              return (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'7px 11px', borderRadius:7, background:isCurrent ? tc + '18' : 'var(--bg-raised)', border:`${isCurrent ? '1.5' : '0.5'}px solid ${isCurrent ? tc : 'var(--border)'}`, opacity:isPast ? 0.6 : 1 }}>
                  <div style={{ width:6, height:6, borderRadius:'50%', background:isPast ? 'var(--text-3)' : tc, flexShrink:0 }} />
                  <span style={{ flex:1, fontSize:11, fontWeight:isCurrent ? 700 : 400, color:isCurrent ? tc : 'var(--text)' }}>{m.label}</span>
                  <span style={{ fontSize:10, color:'var(--text-3)', flexShrink:0 }}>{fmtShort(mDate)}</span>
                </div>
              )
            })}
          </div>
        </div>
      )
    },
    {
      label:'Trimesters',
      content:(
        <div>
          <div style={{ fontSize:10, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:10 }}>Your trimester dates</div>
          {[
            { n:1, start:lmp, end:addDays(lmp, 91 + cycleAdj), color:'#10b981', desc:'Organ formation, morning sickness peak weeks 6–12' },
            { n:2, start:addDays(lmp, 91 + cycleAdj), end:addDays(lmp, 189 + cycleAdj), color:'#3b82f6', desc:'Growth phase, anatomy scan at 20 weeks' },
            { n:3, start:addDays(lmp, 189 + cycleAdj), end:dueDate, color:'#8b5cf6', desc:'Weight gain, lung maturation, birth preparation' },
          ].map((t, i) => (
            <div key={i} style={{ padding:'11px 13px', borderRadius:9, background:trimester === t.n ? t.color + '12' : 'var(--bg-raised)', border:`${trimester === t.n ? '1.5' : '0.5'}px solid ${trimester === t.n ? t.color : 'var(--border)'}`, marginBottom:7 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
                <span style={{ fontSize:12, fontWeight:700, color:t.color }}>Trimester {t.n}</span>
                <span style={{ fontSize:10, color:'var(--text-3)' }}>{fmtShort(t.start)} – {fmtShort(t.end)}</span>
              </div>
              <div style={{ fontSize:11, color:'var(--text-2)', lineHeight:1.5 }}>{t.desc}</div>
              {trimester === t.n && <div style={{ fontSize:10, fontWeight:700, color:t.color, marginTop:4 }}>← You are here</div>}
            </div>
          ))}
        </div>
      )
    },
  ]

  const hint = `Due date: ${fmtDate(dueDate)}. Currently ${weeksPregnant}w ${extraDays}d pregnant (Trimester ${trimester}). ${daysLeft > 0 ? `${daysLeft} days remaining.` : ''} Cycle: ${cycleLen} days.`

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <CalcShell
        left={
          <>
            <DateInput label="First day of last period (LMP)" value={lmpStr} onChange={setLmpStr} catColor={catColor} />

            <Stepper
              label="Cycle length"
              value={cycleLen}
              onChange={setCycleLen}
              min={21}
              max={45}
              unit="days"
              hint="Average: 28 days"
              catColor={catColor}
            />

            <div style={{ padding:'10px 12px', background:catColor + '10', borderRadius:9, border:`1px solid ${catColor}25`, marginTop:4 }}>
              <div style={{ fontSize:11.5, color:'var(--text-2)', lineHeight:1.6 }}>
                <strong style={{ color:catColor }}>Currently:</strong> {weeksPregnant}w {extraDays}d · Trimester {trimester} · Due {fmtDate(dueDate)}
              </div>
            </div>

            <div style={{ marginTop:16 }}>
              <div style={{ fontSize:10, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:8 }}>Quick options</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
                {[{ l:'Today LMP', d:0 }, { l:'2 weeks ago', d:-14 }, { l:'4 weeks ago', d:-28 }, { l:'6 weeks ago', d:-42 }].map((o, i) => {
                  const d = new Date()
                  d.setDate(d.getDate() + o.d)
                  return (
                    <button
                      key={i}
                      onClick={() => setLmpStr(d.toISOString().split('T')[0])}
                      style={{
                        padding:'7px',
                        borderRadius:7,
                        fontSize:10,
                        fontWeight:600,
                        color:catColor,
                        border:`1px solid ${catColor}30`,
                        background:catColor + '08',
                        cursor:'pointer',
                        fontFamily:"'DM Sans',sans-serif"
                      }}
                    >
                      {o.l}
                    </button>
                  )
                })}
              </div>
            </div>
          </>
        }
        right={
          <>
            <RotatorCard title="Due Date & Progress" slides={slides} catColor={catColor} />

            <BreakdownTable
              title="Due Date Summary"
              rows={[
                { label:'Due date', value:fmtDate(dueDate), bold:true, highlight:true, color:catColor },
                { label:'Days remaining', value:daysLeft > 0 ? `${daysLeft} days` : 'Past due', color:daysLeft > 0 ? catColor : '#ef4444' },
                { label:'Weeks pregnant', value:`${weeksPregnant}w ${extraDays}d`, color:triColor },
                { label:'Trimester', value:`Trimester ${trimester}`, color:triColor },
                { label:'Earliest (38w)', value:fmtDate(earlyDate) },
                { label:'Latest (42w)', value:fmtDate(lateDate) },
                { label:'Conceived ~', value:fmtDate(addDays(lmp, 14 + cycleAdj)) },
              ]}
            />

            <AIHintCard hint={hint} />
          </>
        }
      />

      <PregnancyInsight
        dueDate={dueDate}
        weeksPregnant={weeksPregnant}
        extraDays={extraDays}
        trimester={trimester}
        daysLeft={daysLeft}
        triColor={triColor}
      />

      <NextStepsSection
        trimester={trimester}
        catColor={catColor}
      />

      <UpcomingMilestonesSection
        lmp={lmp}
        cycleAdj={cycleAdj}
        weeksPregnant={weeksPregnant}
        today={today}
        catColor={catColor}
      />

      <PlanningChecklist
        trimester={trimester}
        catColor={catColor}
      />

      <MedicalGuidanceSection
        daysLeft={daysLeft}
        trimester={trimester}
      />

      <Sec title="Frequently asked questions">
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