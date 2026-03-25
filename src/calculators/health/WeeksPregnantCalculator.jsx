import { useState, useEffect, useRef } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'

const clamp = (v,a,b) => Math.min(b, Math.max(a, v))
const addDays = (d,n) => { const r = new Date(d); r.setDate(r.getDate() + n); return r }
const fmtDate = d => d.toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' })
const fmtShort = d => d.toLocaleDateString('en-GB', { day:'numeric', month:'short' })
const daysBetween = (a,b) => Math.round((b - a) / 86400000)

const WEEKLY_MILESTONES = {
  4:  'Embryo implants. Pregnancy test turns positive. Size: poppy seed.',
  5:  'Heart begins beating. Neural tube forming. Size: sesame seed.',
  6:  'Facial features start forming. Arms and legs bud. Size: lentil.',
  7:  'Brain developing rapidly. Hands and feet emerge. Size: blueberry.',
  8:  'All major organs forming. Webbed fingers start separating. Size: kidney bean.',
  9:  "Moves independently (you can't feel it yet). Size: grape.",
  10: 'All organs in place. Fetus fully formed. Size: kumquat.',
  12: 'Risk of miscarriage drops significantly. Size: lime.',
  16: 'Can hear sounds. May find out the sex. Size: avocado.',
  20: 'Halfway! Anatomy scan. You may feel movement. Size: banana.',
  24: 'Viability threshold — survival possible with intensive care. Size: corn.',
  28: 'Lungs developing air sacs. Rapid brain growth. Size: eggplant.',
  32: 'Practising breathing movements. Gaining 250g/week. Size: squash.',
  36: 'Considered early term. Head may engage. Size: papaya.',
  40: 'Full term. Ready to meet the world!',
}

const FAQ = [
  { q:'How are weeks of pregnancy counted?',
    a:'Pregnancy is counted from the first day of your last menstrual period (LMP), not from the date of conception. This means you are technically "2 weeks pregnant" at the moment of conception. The full pregnancy is 40 weeks (280 days) from LMP. Most doctors use this dating method, often confirmed by an early ultrasound scan.' },
  { q:'What is the difference between gestational age and fetal age?',
    a:"Gestational age (counted from LMP) is usually about 2 weeks more than fetal age (counted from conception). A 12-week gestational pregnancy contains a 10-week-old fetus. Doctors use gestational age. This calculator uses gestational age too." },
  { q:'When does each trimester start and end?',
    a:'First trimester: weeks 1–12. Second trimester: weeks 13–26. Third trimester: weeks 27–40. Babies born before 37 weeks are considered preterm.' },
  { q:'Is it normal for my due date to change at the ultrasound?',
    a:"Yes. Ultrasound dating in the first trimester is often more accurate than LMP-based dating, especially if cycles are irregular. If the scan date differs enough, your doctor may adjust your due date." },
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

function InsightRotator({ title, slides, catColor, autoMs = 4000 }) {
  const [idx, setIdx] = useState(0)
  const ref = useRef(null)
  useEffect(() => {
    ref.current = setInterval(() => setIdx(i => (i + 1) % slides.length), autoMs)
    return () => clearInterval(ref.current)
  }, [slides.length, autoMs])

  return (
    <div style={{ background:'var(--bg-card)', border:'0.5px solid var(--border)', borderRadius:14, overflow:'hidden', marginBottom:14 }}>
      <div style={{ padding:'11px 16px', borderBottom:'0.5px solid var(--border)', display:'flex', justifyContent:'space-between' }}>
        <span style={{ fontSize:12, fontWeight:700, color:'var(--text)', fontFamily:"'Space Grotesk',sans-serif" }}>{title}</span>
        <span style={{ fontSize:10, color:'var(--text-3)' }}>Auto-rotates · {slides.length} views</span>
      </div>
      <div
        style={{ padding:'16px 18px', minHeight:210 }}
        onMouseEnter={() => clearInterval(ref.current)}
        onMouseLeave={() => { ref.current = setInterval(() => setIdx(i => (i + 1) % slides.length), autoMs) }}
      >
        {slides[idx]?.content}
      </div>
      <div style={{ display:'flex', justifyContent:'center', gap:6, paddingBottom:10 }}>
        {slides.map((_, i) => (
          <button key={i} onClick={() => { setIdx(i); clearInterval(ref.current) }} style={{ width:i === idx ? 20 : 6, height:6, borderRadius:3, background:i === idx ? catColor : 'var(--border)', border:'none', cursor:'pointer', transition:'all .2s', padding:0 }} />
        ))}
      </div>
      <div style={{ display:'flex', gap:4, overflowX:'auto', padding:'0 12px 12px', scrollbarWidth:'none' }}>
        {slides.map((s, i) => (
          <button key={i} onClick={() => { setIdx(i); clearInterval(ref.current) }} style={{ flexShrink:0, padding:'4px 10px', borderRadius:6, fontSize:10, fontWeight:idx === i ? 700 : 500, color:idx === i ? catColor : 'var(--text-3)', border:`1px solid ${idx === i ? catColor : 'var(--border)'}`, background:idx === i ? catColor + '10' : 'transparent', cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>
            {s.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function PregnancyInsightSection({ weeks, extraD, trimester, dueDate, daysLeft, triColor, closestWeek }) {
  const trimesterText =
    trimester === 1
      ? 'This is the first trimester, when major organs are forming and symptoms like nausea and tiredness are often strongest.'
      : trimester === 2
      ? 'This is the second trimester, when growth speeds up and many people begin to feel movement and a bit more energy.'
      : 'This is the third trimester, when the baby gains weight quickly and your body starts preparing for birth.'

  return (
    <Sec title="Your pregnancy insight" sub={`Trimester ${trimester}`}>
      <div style={{ display:'grid', gap:14 }}>
        <div style={{ padding:'14px 15px', borderRadius:12, background:triColor + '12', border:`1px solid ${triColor}35` }}>
          <div style={{ fontSize:13, fontWeight:700, color:triColor, marginBottom:6, fontFamily:"'Space Grotesk',sans-serif" }}>
            {weeks} weeks + {extraD} days
          </div>
          <p style={{ margin:0, fontSize:12.5, color:'var(--text-2)', lineHeight:1.75, fontFamily:"'DM Sans',sans-serif" }}>
            {trimesterText}
          </p>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(4, minmax(0, 1fr))', gap:10 }}>
          {[
            { label:'Week', value:String(weeks) },
            { label:'Extra days', value:`${extraD}d` },
            { label:'Due date', value:fmtShort(dueDate) },
            { label:'Days left', value:daysLeft > 0 ? `${daysLeft}` : '0' },
          ].map((item, i) => (
            <div key={i} style={{ padding:'12px 10px', borderRadius:10, background:'var(--bg-raised)', border:'0.5px solid var(--border)' }}>
              <div style={{ fontSize:10.5, color:'var(--text-3)', marginBottom:4 }}>{item.label}</div>
              <div style={{ fontSize:15, fontWeight:700, color:'var(--text)', fontFamily:"'Space Grotesk',sans-serif" }}>{item.value}</div>
            </div>
          ))}
        </div>

        <div style={{ padding:'12px 14px', borderRadius:10, background:'var(--bg-raised)', border:'0.5px solid var(--border)' }}>
          <div style={{ fontSize:11, fontWeight:700, color:'var(--text)', marginBottom:6, fontFamily:"'DM Sans',sans-serif" }}>
            Closest milestone
          </div>
          <p style={{ margin:0, fontSize:12, color:'var(--text-2)', lineHeight:1.7, fontFamily:"'DM Sans',sans-serif" }}>
            Week {closestWeek}: {WEEKLY_MILESTONES[closestWeek]}
          </p>
        </div>
      </div>
    </Sec>
  )
}

function TrimesterExpectationsSection({ trimester, catColor }) {
  const sections = trimester === 1
    ? [
        'Symptoms like tiredness, breast tenderness, and nausea are common in early pregnancy.',
        'This is the major organ-formation phase, so routine prenatal care matters a lot.',
        'Many people do not show much externally yet, even though development is happening quickly.',
      ]
    : trimester === 2
    ? [
        'Energy often improves, and many people begin to feel movement around this phase.',
        'The anatomy scan often happens in the middle of the second trimester.',
        'Growth becomes more noticeable, both for the baby and physically for you.',
      ]
    : [
        'The baby usually gains weight quickly in the third trimester.',
        'Breathing discomfort, sleep changes, and more pressure are common as the uterus grows.',
        'This is the phase for birth preparation, logistics, and watching for labour signs.',
      ]

  return (
    <Sec title="What to expect this trimester" sub="Helpful phase-by-phase context">
      <div style={{ display:'grid', gap:10 }}>
        {sections.map((item, i) => (
          <div key={i} style={{ display:'flex', gap:10, alignItems:'flex-start', padding:'12px 13px', borderRadius:10, background:'var(--bg-raised)', border:'0.5px solid var(--border)' }}>
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

function ImportantFactsSection({ weeks, dueDate, catColor }) {
  const facts = [
    `Pregnancy is dated from the first day of your last period, not the day of conception.`,
    `Only a small number of babies arrive exactly on the due date of ${fmtDate(dueDate)}.`,
    weeks < 12
      ? 'Early ultrasound is often the most accurate way to confirm dates.'
      : 'Ultrasound dating may adjust the due date if it differs enough from the LMP estimate.',
    'This calculator is a timing guide, not a substitute for medical confirmation.',
  ]

  return (
    <Sec title="Important things to know" sub="Useful pregnancy facts">
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

function DoctorSection({ trimester, daysLeft }) {
  const items = [
    'Contact your doctor if you have bleeding, severe pain, fainting, or sudden worrying symptoms.',
    trimester === 3
      ? 'In the third trimester, contact your doctor for reduced movement, fluid leakage, or regular contractions.'
      : 'Contact your doctor if symptoms feel unusually severe or change suddenly.',
    daysLeft <= 0
      ? 'If you are at or past your due date, follow your doctor’s advice and follow-up plan closely.'
      : 'Keep attending routine prenatal visits even if everything seems normal.',
  ]

  return (
    <Sec title="When to contact your doctor" sub="General pregnancy guidance">
      <div style={{ display:'grid', gap:10 }}>
        {items.map((item, i) => (
          <div key={i} style={{ padding:'12px 13px', borderRadius:10, background:'var(--bg-raised)', border:'0.5px solid var(--border)' }}>
            <p style={{ margin:0, fontSize:12.5, color:'var(--text-2)', lineHeight:1.65, fontFamily:"'DM Sans',sans-serif" }}>
              {item}
            </p>
          </div>
        ))}
        <p style={{ margin:'4px 0 0', fontSize:11.5, color:'var(--text-3)', lineHeight:1.7, fontFamily:"'DM Sans',sans-serif" }}>
          This calculator estimates pregnancy timing and does not replace medical advice.
        </p>
      </div>
    </Sec>
  )
}

export default function WeeksPregnantCalculator({ meta, category }) {
  const catColor = category?.color || '#ec4899'
  const [lmpStr, setLmpStr] = useState(() => { const d = new Date(); d.setDate(d.getDate() - 70); return d.toISOString().split('T')[0] })
  const [cycleLen, setCycleLen] = useState(28)
  const [openFaq, setOpenFaq] = useState(null)

  const lmp = new Date(lmpStr)
  const today = new Date()
  const cycleAdj = cycleLen - 28
  const daysPreg = clamp(daysBetween(lmp, today), 0, 294)
  const weeks = Math.floor(daysPreg / 7)
  const extraD = daysPreg % 7
  const dueDate = addDays(lmp, 280 + cycleAdj)
  const daysLeft = daysBetween(today, dueDate)
  const trimester = weeks < 13 ? 1 : weeks < 27 ? 2 : 3
  const triColor = trimester === 1 ? '#10b981' : trimester === 2 ? '#3b82f6' : '#8b5cf6'
  const pct = clamp(Math.round((weeks / 40) * 100), 0, 100)

  const milestoneWeeks = Object.keys(WEEKLY_MILESTONES).map(Number).sort((a, b) => a - b)
  const closestWeek = milestoneWeeks.reduce((p, c) => Math.abs(c - weeks) < Math.abs(p - weeks) ? c : p, milestoneWeeks[0])

  const Slide1 = () => (
    <div>
      <div style={{ display:'flex', alignItems:'flex-end', gap:12, marginBottom:14 }}>
        <div>
          <div style={{ fontSize:52, fontWeight:700, lineHeight:1, color:triColor, fontFamily:"'Space Grotesk',sans-serif" }}>{weeks}</div>
          <div style={{ fontSize:16, fontWeight:600, color:triColor, lineHeight:1.2 }}>weeks + {extraD}d</div>
          <div style={{ fontSize:11, color:'var(--text-3)', marginTop:3 }}>pregnant</div>
        </div>
        <div style={{ paddingBottom:6 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'5px 12px 5px 8px', borderRadius:20, background:triColor + '18', border:`1px solid ${triColor}35`, marginBottom:6 }}>
            <div style={{ width:8, height:8, borderRadius:'50%', background:triColor }} />
            <span style={{ fontSize:12, fontWeight:700, color:triColor }}>Trimester {trimester}</span>
          </div>
          <div style={{ fontSize:11, color:'var(--text-3)' }}>Due: {fmtShort(dueDate)} ({daysLeft > 0 ? `${daysLeft}d left` : 'overdue'})</div>
        </div>
      </div>
      <div style={{ padding:'10px 12px', background:triColor + '12', borderRadius:8, border:`1px solid ${triColor}30` }}>
        <div style={{ fontSize:10, fontWeight:700, color:triColor, marginBottom:3 }}>WEEK {closestWeek} MILESTONE</div>
        <div style={{ fontSize:11.5, color:'var(--text-2)', lineHeight:1.6 }}>{WEEKLY_MILESTONES[closestWeek]}</div>
      </div>
    </div>
  )

  const Slide2 = () => (
    <div>
      <div style={{ fontSize:10, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:12 }}>40-week journey</div>
      <div style={{ position:'relative', height:20, background:'var(--border)', borderRadius:10, overflow:'hidden', marginBottom:6 }}>
        <div style={{ height:'100%', width:`${pct}%`, background:triColor, borderRadius:10, transition:'width .5s' }} />
        {[13, 27].map(w => (
          <div key={w} style={{ position:'absolute', left:`${(w / 40) * 100}%`, top:0, bottom:0, width:2, background:'var(--bg-card)', opacity:0.8 }} />
        ))}
      </div>
      <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, color:'var(--text-3)', marginBottom:14 }}>
        <span>W1</span><span>T2 → W13</span><span>T3 → W27</span><span>W40</span>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
        {[
          { label:'Complete', val:`${pct}%`, color:triColor },
          { label:'Weeks left', val:Math.max(0, 40 - weeks), color:'#f59e0b' },
          { label:'Days left', val:Math.max(0, daysLeft), color:'#8b5cf6' },
        ].map((s, i) => (
          <div key={i} style={{ textAlign:'center', padding:'10px 8px', background:'var(--bg-raised)', borderRadius:8, border:'0.5px solid var(--border)' }}>
            <div style={{ fontSize:20, fontWeight:700, color:s.color, fontFamily:"'Space Grotesk',sans-serif" }}>{s.val}</div>
            <div style={{ fontSize:9, color:'var(--text-3)', marginTop:3 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  )

  const Slide3 = () => (
    <div>
      <div style={{ fontSize:10, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:10 }}>Key week milestones</div>
      <div style={{ maxHeight:210, overflowY:'auto', display:'flex', flexDirection:'column', gap:5, paddingRight:4 }}>
        {milestoneWeeks.map(w => {
          const wDate = addDays(lmp, w * 7 + cycleAdj)
          const isPast = w < weeks
          const isCurr = Math.abs(w - weeks) <= 1
          const tc = w < 13 ? '#10b981' : w < 27 ? '#3b82f6' : '#8b5cf6'
          return (
            <div key={w} style={{ padding:'8px 12px', borderRadius:8, background:isCurr ? tc + '18' : 'var(--bg-raised)', border:`${isCurr ? '1.5' : '0.5'}px solid ${isCurr ? tc : 'var(--border)'}`, opacity:isPast ? 0.65 : 1 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:2 }}>
                <span style={{ fontSize:12, fontWeight:isCurr ? 700 : 600, color:isCurr ? tc : 'var(--text)' }}>Week {w}</span>
                <span style={{ fontSize:10, color:'var(--text-3)' }}>{fmtShort(wDate)}</span>
              </div>
              <div style={{ fontSize:11, color:'var(--text-2)', lineHeight:1.45 }}>{WEEKLY_MILESTONES[w]}</div>
            </div>
          )
        })}
      </div>
    </div>
  )

  const Slide4 = () => (
    <div>
      <div style={{ fontSize:10, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:10 }}>Your trimester schedule</div>
      {[
        { n:1, sw:1, ew:12, color:'#10b981', desc:'Organ formation, morning sickness peak weeks 6–12' },
        { n:2, sw:13, ew:26, color:'#3b82f6', desc:'Growth phase, anatomy scan at 20 weeks' },
        { n:3, sw:27, ew:40, color:'#8b5cf6', desc:'Weight gain, lung maturation, birth preparation' },
      ].map((t, i) => {
        const start = addDays(lmp, t.sw * 7 + cycleAdj)
        const end = addDays(lmp, t.ew * 7 + cycleAdj)
        return (
          <div key={i} style={{ padding:'11px 14px', borderRadius:9, background:trimester === t.n ? t.color + '12' : 'var(--bg-raised)', border:`${trimester === t.n ? '1.5' : '0.5'}px solid ${trimester === t.n ? t.color : 'var(--border)'}`, marginBottom:7 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
              <span style={{ fontSize:13, fontWeight:700, color:t.color }}>Trimester {t.n}</span>
              <span style={{ fontSize:11, color:'var(--text-3)' }}>Weeks {t.sw}–{t.ew}</span>
            </div>
            <div style={{ display:'flex', gap:8, fontSize:11, color:'var(--text-2)', marginBottom:4 }}>
              <span>{fmtShort(start)}</span><span>→</span><span>{fmtShort(end)}</span>
            </div>
            <div style={{ fontSize:11, color:'var(--text-2)', lineHeight:1.4 }}>{t.desc}</div>
            {trimester === t.n && <div style={{ fontSize:10, fontWeight:700, color:t.color, marginTop:5 }}>← You are here</div>}
          </div>
        )
      })}
    </div>
  )

  const slides = [
    { label:'Current week', content:<Slide1 /> },
    { label:'Progress', content:<Slide2 /> },
    { label:'Weekly guide', content:<Slide3 /> },
    { label:'Trimesters', content:<Slide4 /> },
  ]

  const hint = `${weeks} weeks and ${extraD} days pregnant. Trimester ${trimester}. Due: ${fmtDate(dueDate)}. ${daysLeft > 0 ? `${daysLeft} days remaining.` : 'Past due date.'}`

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <CalcShell
        left={<>
          <div style={{ marginBottom:16 }}>
            <label style={{ fontSize:12.5, fontWeight:600, color:'var(--text)', fontFamily:"'DM Sans',sans-serif", display:'block', marginBottom:6 }}>First day of last period (LMP)</label>
            <input
              type="date"
              value={lmpStr}
              onChange={e => setLmpStr(e.target.value)}
              style={{ width:'100%', height:40, padding:'0 12px', border:'1.5px solid var(--border-2)', borderRadius:9, background:'var(--bg-card)', color:'var(--text)', fontSize:14, fontFamily:"'DM Sans',sans-serif", boxSizing:'border-box', outline:'none' }}
              onFocus={e => e.target.style.borderColor = catColor}
              onBlur={e => e.target.style.borderColor = 'var(--border-2)'}
            />
          </div>

          <Stepper label="Cycle length" value={cycleLen} onChange={setCycleLen} min={21} max={45} unit="days" hint="Average: 28 days" catColor={catColor} />

          <div style={{ padding:'12px 14px', background:triColor + '10', borderRadius:9, border:`1px solid ${triColor}25`, marginTop:4 }}>
            <div style={{ fontSize:24, fontWeight:700, color:triColor, fontFamily:"'Space Grotesk',sans-serif", lineHeight:1 }}>{weeks}w {extraD}d</div>
            <div style={{ fontSize:11, color:'var(--text-3)', marginTop:4 }}>Trimester {trimester} · Due {fmtShort(dueDate)}</div>
          </div>

          <div style={{ marginTop:16 }}>
            <div style={{ fontSize:10, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:8 }}>Quick options</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
              {[{ l:'4 weeks ago', d:-28 }, { l:'6 weeks ago', d:-42 }, { l:'10 weeks ago', d:-70 }, { l:'20 weeks ago', d:-140 }].map((o, i) => {
                const d = new Date(); d.setDate(d.getDate() + o.d)
                return (
                  <button key={i} onClick={() => setLmpStr(d.toISOString().split('T')[0])} style={{ padding:'7px', borderRadius:7, fontSize:10, fontWeight:600, color:catColor, border:`1px solid ${catColor}30`, background:catColor + '08', cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>
                    {o.l}
                  </button>
                )
              })}
            </div>
          </div>
        </>}
        right={<>
          <InsightRotator title="Pregnancy Progress" slides={slides} catColor={catColor} autoMs={4000} />

          <BreakdownTable title="Weeks Summary" rows={[
            { label:'Weeks pregnant', value:`${weeks}w ${extraD}d`, bold:true, highlight:true, color:triColor },
            { label:'Trimester', value:`Trimester ${trimester}`, color:triColor },
            { label:'Due date', value:fmtDate(dueDate), color:catColor },
            { label:'Days remaining', value:daysLeft > 0 ? `${daysLeft} days` : 'Overdue', color:daysLeft > 0 ? catColor : '#ef4444' },
            { label:'Progress', value:`${pct}% complete` },
            { label:'Weeks remaining', value:`${Math.max(0, 40 - weeks)} weeks` },
          ]} />

          <AIHintCard hint={hint} />
        </>}
      />

      <PregnancyInsightSection
        weeks={weeks}
        extraD={extraD}
        trimester={trimester}
        dueDate={dueDate}
        daysLeft={daysLeft}
        triColor={triColor}
        closestWeek={closestWeek}
      />

      <TrimesterExpectationsSection
        trimester={trimester}
        catColor={catColor}
      />

      <Sec title="Full pregnancy milestone timeline" sub="All key weeks at a glance">
        <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
          {milestoneWeeks.map(w => {
            const wDate = addDays(lmp, w * 7 + cycleAdj)
            const isPast = w < weeks
            const isCurr = Math.abs(w - weeks) <= 1
            const tc = w < 13 ? '#10b981' : w < 27 ? '#3b82f6' : '#8b5cf6'
            return (
              <div key={w} style={{ display:'flex', alignItems:'flex-start', gap:12, padding:'9px 13px', borderRadius:8, background:isCurr ? tc + '12' : 'var(--bg-raised)', border:`${isCurr ? '1.5' : '0.5'}px solid ${isCurr ? tc : 'var(--border)'}`, opacity:isPast ? 0.65 : 1 }}>
                <div style={{ width:8, height:8, borderRadius:'50%', background:isCurr ? tc : isPast ? 'var(--text-3)' : 'var(--border)', flexShrink:0, marginTop:3 }} />
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:12, fontWeight:isCurr ? 700 : 600, color:isCurr ? tc : 'var(--text)', marginBottom:2 }}>
                    Week {w} {isCurr ? '← you are here' : ''}
                  </div>
                  <div style={{ fontSize:11, color:'var(--text-2)', lineHeight:1.5 }}>{WEEKLY_MILESTONES[w]}</div>
                </div>
                <div style={{ fontSize:10, color:'var(--text-3)', flexShrink:0, paddingTop:2 }}>{fmtShort(wDate)}</div>
              </div>
            )
          })}
        </div>
      </Sec>

      <ImportantFactsSection
        weeks={weeks}
        dueDate={dueDate}
        catColor={catColor}
      />

      <DoctorSection
        trimester={trimester}
        daysLeft={daysLeft}
      />

      <Sec title="Frequently asked questions" sub="Everything about weeks pregnant">
        {FAQ.map((f, i) => (
          <Acc key={i} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} catColor={catColor} />
        ))}
      </Sec>
    </div>
  )
}