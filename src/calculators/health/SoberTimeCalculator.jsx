import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'

const clamp = (v,a,b) => Math.min(b, Math.max(a, v))

const HEALTH_TIMELINE = [
  { days:1,    label:'20 minutes',  benefit:'Blood pressure and pulse return to normal.', color:'#10b981' },
  { days:1,    label:'24 hours',    benefit:'Carbon monoxide clears. Early cardiovascular strain starts dropping.', color:'#22a355' },
  { days:3,    label:'3 days',      benefit:'Energy often improves. Hydration status improves.', color:'#3b82f6' },
  { days:7,    label:'1 week',      benefit:'Sleep quality may begin improving. Skin may start looking better.', color:'#8b5cf6' },
  { days:14,   label:'2 weeks',     benefit:'Circulation improves. Exercise often feels easier.', color:'#0ea5e9' },
  { days:30,   label:'1 month',     benefit:'Mental clarity and consistency often improve significantly.', color:'#f59e0b' },
  { days:90,   label:'3 months',    benefit:'Mood, sleep, energy, and recovery patterns often feel much more stable.', color:'#f97316' },
  { days:365,  label:'1 year',      benefit:'Long-term health risk reduction becomes much more meaningful.', color:'#ef4444' },
  { days:1825, label:'5 years',     benefit:'Very substantial long-term health benefits accumulate over time.', color:'#dc2626' },
]

const MILESTONES = [1, 3, 7, 14, 30, 60, 90, 100, 180, 365, 500, 730, 1000, 1825]

const FAQ = [
  { q:'What happens to your body when you stop drinking?',
    a:'The first few days can feel hardest. Over time, many people notice better sleep, improved energy, better hydration, more stable mood, and better recovery.' },
  { q:'How long until sleep improves after quitting alcohol?',
    a:'Sleep can feel worse first, then improve gradually. Many people notice more stable and restorative sleep over the first few weeks.' },
  { q:'How do I stay motivated?',
    a:'Tracking streaks, celebrating milestones, using support systems, and focusing on visible benefits like better sleep, money saved, and improved energy can help.' },
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
      <button
        onClick={onToggle}
        style={{ width:'100%', display:'flex', justifyContent:'space-between', alignItems:'center', padding:'13px 0', background:'none', border:'none', cursor:'pointer', gap:12, textAlign:'left' }}
      >
        <span style={{ fontSize:13, fontWeight:600, color:'var(--text)', fontFamily:"'DM Sans',sans-serif", lineHeight:1.4 }}>{q}</span>
        <span style={{ fontSize:18, color:catColor, flexShrink:0, display:'inline-block', transform:open ? 'rotate(45deg)' : 'none', transition:'transform .2s' }}>+</span>
      </button>
      {open && <p style={{ fontSize:12.5, color:'var(--text-2)', lineHeight:1.75, margin:'0 0 13px', fontFamily:"'DM Sans',sans-serif" }}>{a}</p>}
    </div>
  )
}

function StatCard({ label, value, sub, color }) {
  return (
    <div style={{ padding:'12px 12px', borderRadius:10, background:'var(--bg-raised)', border:'0.5px solid var(--border)' }}>
      <div style={{ fontSize:10, color:'var(--text-3)', marginBottom:4 }}>{label}</div>
      <div style={{ fontSize:18, fontWeight:700, color:color || 'var(--text)', fontFamily:"'Space Grotesk',sans-serif" }}>{value}</div>
      {sub && <div style={{ fontSize:10.5, color:'var(--text-3)', marginTop:3 }}>{sub}</div>}
    </div>
  )
}

function ProgressBar({ label, value, color, sub }) {
  return (
    <div style={{ marginBottom:10 }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
        <span style={{ fontSize:11.5, color:'var(--text-2)', fontWeight:600 }}>{label}</span>
        <span style={{ fontSize:11.5, color:color, fontWeight:700 }}>{value}%</span>
      </div>
      <div style={{ height:7, background:'var(--border)', borderRadius:4, overflow:'hidden' }}>
        <div style={{ height:'100%', width:`${value}%`, background:color, borderRadius:4, transition:'width .5s' }} />
      </div>
      {sub && <div style={{ fontSize:10, color:'var(--text-3)', marginTop:3 }}>{sub}</div>}
    </div>
  )
}

function Badge({ text, active, color }) {
  return (
    <div style={{
      padding:'8px 10px',
      borderRadius:999,
      fontSize:10.5,
      fontWeight:700,
      background:active ? color + '18' : 'var(--bg-raised)',
      color:active ? color : 'var(--text-3)',
      border:`1px solid ${active ? color + '40' : 'var(--border)'}`,
      whiteSpace:'nowrap'
    }}>
      {text}
    </div>
  )
}

export default function SoberTimeCalculator({ meta, category }) {
  const catColor = category?.color || '#22a355'
  const [startStr, setStartStr] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() - 30)
    return d.toISOString().split('T')[0]
  })
  const [openFaq, setOpenFaq] = useState(null)

  const [unitsPerDay, setUnitsPerDay] = useState(3)
  const [costPerUnit, setCostPerUnit] = useState(4)
  const [minutesCraving, setMinutesCraving] = useState(20)

  const startDate = new Date(startStr)
  const today = new Date()
  const days = Math.max(0, Math.floor((today - startDate) / 86400000))
  const weeks = Math.floor(days / 7)
  const months = (days / 30.44).toFixed(1)

  const nextMilestone = MILESTONES.find(m => m > days) || 1825
  const daysToNext = Math.max(0, nextMilestone - days)
  const progressToNext = nextMilestone > 0 ? Math.round((days / nextMilestone) * 100) : 100

  const activeHealthItems = HEALTH_TIMELINE.filter(h => h.days <= days)
  const latestHealth = activeHealthItems[activeHealthItems.length - 1]

  const totalUnits = Math.round(unitsPerDay * days)
  const totalKcal = Math.round(totalUnits * 100)
  const totalMoney = Math.round(totalUnits * costPerUnit)
  const fatKg = (totalKcal / 7700).toFixed(1)
  const hoursRecovered = Math.round((minutesCraving * days) / 60)

  const soberYearPct = Math.min(100, Math.round((days / 365) * 100))

  const sleepRecovery = clamp(Math.round(days * 2.2), 5, 100)
  const energyRecovery = clamp(Math.round(days * 1.7), 8, 100)
  const moodRecovery = clamp(Math.round(days * 1.4), 6, 100)
  const hydrationRecovery = clamp(Math.round(days * 2.8), 12, 100)
  const focusRecovery = clamp(Math.round(days * 1.6), 7, 100)

  const riskPhase =
    days < 7 ? { label:'Acute adjustment', color:'#ef4444', desc:'The earliest stretch can feel the most intense.' } :
    days < 30 ? { label:'Early rebuilding', color:'#f59e0b', desc:'The routine is changing, but new stability is forming.' } :
    days < 90 ? { label:'Stabilising phase', color:'#3b82f6', desc:'Sleep, mood, and consistency often improve here.' } :
    { label:'Long-term reinforcement', color:'#22a355', desc:'The streak is more deeply part of your identity and routine.' }

  const achievements = [
    { days:1, icon:'🌱', label:'Day One' },
    { days:7, icon:'🗓️', label:'One Week' },
    { days:30, icon:'🔥', label:'One Month' },
    { days:90, icon:'💪', label:'90 Days' },
    { days:365, icon:'🏆', label:'One Year' },
    { days:1000, icon:'💎', label:'1000 Days' },
  ]

  const hint = `${days} days sober since ${startDate.toLocaleDateString('en-GB')}. ${weeks} weeks, ${months} months. Next milestone: ${nextMilestone} days (${daysToNext} to go). Units avoided: ~${totalUnits}.`

  const storyColors = [catColor, '#0ea5e9', '#f59e0b']
  const storySofts = [catColor + '18', '#e0f2fe', '#fef3c7']

  const stories = [
    {
      label:'Your streak',
      headline:`${days} day${days !== 1 ? 's' : ''} sober`,
      detail:`Since ${startDate.toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' })}. That is ${weeks} weeks and ${months} months. Your next major milestone is ${nextMilestone} days.`
    },
    {
      label:'Health progress',
      headline:`${activeHealthItems.length} recovery milestones reached`,
      detail:`${latestHealth?.benefit || 'Your body starts changing from day one.'}`
    },
    {
      label:'What you have saved',
      headline:`~${totalUnits} units, ~${totalKcal.toLocaleString()} kcal, ~£${totalMoney}`,
      detail:`Based on your personal estimate of ${unitsPerDay} units/day and £${costPerUnit} per unit.`
    },
  ]

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <CalcShell
        left={<>
          <div style={{ fontSize:10, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:14 }}>Sobriety start date</div>

          <div style={{ marginBottom:16 }}>
            <label style={{ fontSize:12.5, fontWeight:600, color:'var(--text)', fontFamily:"'DM Sans',sans-serif", display:'block', marginBottom:6 }}>
              First day sober
            </label>
            <input
              type="date"
              value={startStr}
              onChange={e => setStartStr(e.target.value)}
              style={{ width:'100%', height:40, padding:'0 12px', border:'1.5px solid var(--border-2)', borderRadius:9, background:'var(--bg-card)', color:'var(--text)', fontSize:14, fontFamily:"'DM Sans',sans-serif", boxSizing:'border-box', outline:'none' }}
              onFocus={e => e.target.style.borderColor = catColor}
              onBlur={e => e.target.style.borderColor = 'var(--border-2)'}
            />
          </div>

          <div style={{ padding:'14px 16px', background:catColor + '12', borderRadius:10, border:`1px solid ${catColor}30`, marginBottom:16 }}>
            <div style={{ fontSize:40, fontWeight:700, color:catColor, fontFamily:"'Space Grotesk',sans-serif", lineHeight:1 }}>{days}</div>
            <div style={{ fontSize:12, color:'var(--text-2)', marginTop:4 }}>days · {weeks} weeks · {months} months</div>

            <div style={{ marginTop:10, height:6, background:'var(--border)', borderRadius:4 }}>
              <div style={{ height:'100%', width:`${progressToNext}%`, background:catColor, borderRadius:4, transition:'width .5s' }} />
            </div>
            <div style={{ fontSize:10, color:'var(--text-3)', marginTop:5 }}>{daysToNext} days to {nextMilestone}-day milestone</div>
          </div>

          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:12, fontWeight:600, color:'var(--text-2)', marginBottom:8, fontFamily:"'DM Sans',sans-serif" }}>Quick presets</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
              {[{ l:'Today', d:0 }, { l:'1 week ago', d:-7 }, { l:'1 month ago', d:-30 }, { l:'3 months ago', d:-90 }].map((o, i) => {
                const d = new Date()
                d.setDate(d.getDate() + o.d)
                return (
                  <button
                    key={i}
                    onClick={() => setStartStr(d.toISOString().split('T')[0])}
                    style={{ padding:'7px', borderRadius:7, fontSize:10, fontWeight:600, color:catColor, border:`1px solid ${catColor}30`, background:catColor + '08', cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}
                  >
                    {o.l}
                  </button>
                )
              })}
            </div>
          </div>

          <div style={{ borderTop:'0.5px solid var(--border)', paddingTop:16 }}>
            <div style={{ fontSize:12, fontWeight:600, color:'var(--text-2)', marginBottom:10, fontFamily:"'DM Sans',sans-serif" }}>Your personal estimate</div>

            <div style={{ marginBottom:12 }}>
              <div style={{ fontSize:11.5, fontWeight:600, color:'var(--text)', marginBottom:6 }}>Units per day before quitting</div>
              <div style={{ display:'flex', height:38, border:'1.5px solid var(--border-2)', borderRadius:9, overflow:'hidden' }}>
                <button onClick={() => setUnitsPerDay(v => clamp(v - 0.5, 1, 20))} style={{ width:38, background:'var(--bg-raised)', border:'none', cursor:'pointer', fontSize:18, color:'var(--text)' }}>−</button>
                <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', fontSize:15, fontWeight:700, color:'var(--text)' }}>{unitsPerDay}</div>
                <button onClick={() => setUnitsPerDay(v => clamp(v + 0.5, 1, 20))} style={{ width:38, background:'var(--bg-raised)', border:'none', cursor:'pointer', fontSize:18, color:'var(--text)' }}>+</button>
              </div>
            </div>

            <div style={{ marginBottom:12 }}>
              <div style={{ fontSize:11.5, fontWeight:600, color:'var(--text)', marginBottom:6 }}>Cost per unit (£)</div>
              <div style={{ display:'flex', height:38, border:'1.5px solid var(--border-2)', borderRadius:9, overflow:'hidden' }}>
                <button onClick={() => setCostPerUnit(v => clamp(v - 0.5, 1, 20))} style={{ width:38, background:'var(--bg-raised)', border:'none', cursor:'pointer', fontSize:18, color:'var(--text)' }}>−</button>
                <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', fontSize:15, fontWeight:700, color:'var(--text)' }}>£{costPerUnit}</div>
                <button onClick={() => setCostPerUnit(v => clamp(v + 0.5, 1, 20))} style={{ width:38, background:'var(--bg-raised)', border:'none', cursor:'pointer', fontSize:18, color:'var(--text)' }}>+</button>
              </div>
            </div>

            <div>
              <div style={{ fontSize:11.5, fontWeight:600, color:'var(--text)', marginBottom:6 }}>Minutes/day previously lost</div>
              <div style={{ display:'flex', height:38, border:'1.5px solid var(--border-2)', borderRadius:9, overflow:'hidden' }}>
                <button onClick={() => setMinutesCraving(v => clamp(v - 5, 5, 240))} style={{ width:38, background:'var(--bg-raised)', border:'none', cursor:'pointer', fontSize:18, color:'var(--text)' }}>−</button>
                <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', fontSize:15, fontWeight:700, color:'var(--text)' }}>{minutesCraving} min</div>
                <button onClick={() => setMinutesCraving(v => clamp(v + 5, 5, 240))} style={{ width:38, background:'var(--bg-raised)', border:'none', cursor:'pointer', fontSize:18, color:'var(--text)' }}>+</button>
              </div>
            </div>
          </div>
        </>}
        right={<>
          <div style={{ background:'var(--bg-card)', border:'0.5px solid var(--border)', borderRadius:14, overflow:'hidden', marginBottom:14 }}>
            <div style={{ padding:'11px 16px', borderBottom:'0.5px solid var(--border)', display:'flex', justifyContent:'space-between' }}>
              <span style={{ fontSize:12, fontWeight:700, color:'var(--text)', fontFamily:"'Space Grotesk',sans-serif" }}>Your sobriety story</span>
              <span style={{ fontSize:10, color:'var(--text-3)' }}>Updates live</span>
            </div>
            <div style={{ padding:'16px 18px', display:'flex', flexDirection:'column', gap:10 }}>
              {stories.map((s, i) => (
                <div key={i} style={{ borderLeft:`3px solid ${storyColors[i]}`, paddingLeft:12, paddingTop:6, paddingBottom:6, borderRadius:'0 8px 8px 0', background:storySofts[i] }}>
                  <div style={{ fontSize:9, fontWeight:700, color:storyColors[i], textTransform:'uppercase', letterSpacing:'.07em', marginBottom:4 }}>{s.label}</div>
                  <div style={{ fontSize:13, fontWeight:600, color:'var(--text)', lineHeight:1.55, fontFamily:"'Space Grotesk',sans-serif" }}>{s.headline}</div>
                  <div style={{ fontSize:11.5, color:'var(--text-2)', lineHeight:1.6, marginTop:4, fontFamily:"'DM Sans',sans-serif" }}>{s.detail}</div>
                </div>
              ))}
            </div>
          </div>

          <BreakdownTable title="Sober Summary" rows={[
            { label:'Days sober', value:`${days} days`, bold:true, highlight:true, color:catColor },
            { label:'Weeks', value:`${weeks}w` },
            { label:'Months', value:`${months} months` },
            { label:'Units avoided', value:`~${totalUnits}`, color:catColor },
            { label:'Kcal avoided', value:`~${totalKcal.toLocaleString()}` },
            { label:'Money saved', value:`~£${totalMoney}`, color:'#22a355' },
            { label:'Next milestone', value:`${nextMilestone}d (${daysToNext} to go)`, color:catColor },
          ]} />

          <AIHintCard hint={hint} />
        </>}
      />

      <Sec title="Visual recovery dashboard" sub="How progress often feels over time">
        <div style={{ display:'grid', gap:8 }}>
          <ProgressBar label="Sleep recovery" value={sleepRecovery} color="#8b5cf6" sub="Often rebounds after the first couple of weeks" />
          <ProgressBar label="Energy recovery" value={energyRecovery} color="#22a355" sub="Usually improves as routine stabilises" />
          <ProgressBar label="Mood stability" value={moodRecovery} color="#0ea5e9" sub="Can take time, but often becomes more consistent" />
          <ProgressBar label="Hydration balance" value={hydrationRecovery} color="#3b82f6" sub="Often improves quickly" />
          <ProgressBar label="Mental clarity" value={focusRecovery} color="#f59e0b" sub="Usually improves gradually over weeks" />
        </div>
      </Sec>

      <Sec title="Milestone achievements" sub="Your unlocked badges">
        <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
          {achievements.map((a, i) => (
            <Badge key={i} text={`${a.icon} ${a.label}`} active={days >= a.days} color={catColor} />
          ))}
        </div>
      </Sec>

      <Sec title="Health recovery timeline" sub="What may improve over time">
        <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
          {HEALTH_TIMELINE.map((h, i) => (
            <div
              key={i}
              style={{
                display:'flex',
                gap:10,
                padding:'8px 10px',
                borderRadius:8,
                background:h.days <= days ? catColor + '08' : 'var(--bg-raised)',
                border:`0.5px solid ${h.days <= days ? catColor + '40' : 'var(--border)'}`,
                opacity:h.days <= days ? 1 : 0.55
              }}
            >
              <div style={{ width:8, height:8, borderRadius:'50%', background:h.days <= days ? h.color : 'var(--border)', flexShrink:0, marginTop:4 }} />
              <div>
                <div style={{ fontSize:11, fontWeight:700, color:h.days <= days ? h.color : 'var(--text-3)' }}>
                  {h.label} {h.days <= days ? '✓' : ''}
                </div>
                <div style={{ fontSize:11, color:'var(--text-2)', lineHeight:1.5 }}>{h.benefit}</div>
              </div>
            </div>
          ))}
        </div>
      </Sec>

      <Sec title="What sobriety has saved you" sub="Interactive personal estimate">
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10 }}>
          <StatCard label="Money saved" value={`£${totalMoney.toLocaleString()}`} sub={`£${costPerUnit}/unit`} color="#22a355" />
          <StatCard label="Units avoided" value={totalUnits.toLocaleString()} sub={`${unitsPerDay}/day`} color={catColor} />
          <StatCard label="Calories avoided" value={totalKcal.toLocaleString()} sub="~100 kcal per unit" color="#f59e0b" />
          <StatCard label="Time recovered" value={`${hoursRecovered}h`} sub={`${minutesCraving} min/day`} color="#8b5cf6" />
        </div>

        <div style={{ marginTop:14, padding:'12px 14px', borderRadius:10, background:'var(--bg-raised)', border:'0.5px solid var(--border)' }}>
          <div style={{ fontSize:11, fontWeight:700, color:'var(--text)', marginBottom:5 }}>Visual equivalents</div>
          <div style={{ fontSize:12, color:'var(--text-2)', lineHeight:1.7 }}>
            That is roughly <strong>{fatKg} kg</strong> worth of empty-calorie energy avoided, plus <strong>{hoursRecovered} hours</strong> of life and attention recovered.
          </div>
        </div>
      </Sec>

      <Sec title="Your current phase" sub="Where this streak sits right now">
        <div style={{ padding:'14px 15px', borderRadius:12, background:riskPhase.color+'12', border:`1px solid ${riskPhase.color}35` }}>
          <div style={{ fontSize:13, fontWeight:700, color:riskPhase.color, marginBottom:6, fontFamily:"'Space Grotesk',sans-serif" }}>
            {riskPhase.label}
          </div>
          <p style={{ margin:0, fontSize:12.5, color:'var(--text-2)', lineHeight:1.75, fontFamily:"'DM Sans',sans-serif" }}>
            {riskPhase.desc}
          </p>
        </div>

        <div style={{ marginTop:12, display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8 }}>
          {[
            { label:'0–7d', active:days < 7, color:'#ef4444' },
            { label:'7–30d', active:days >= 7 && days < 30, color:'#f59e0b' },
            { label:'30–90d', active:days >= 30 && days < 90, color:'#3b82f6' },
            { label:'90d+', active:days >= 90, color:'#22a355' },
          ].map((p, i) => (
            <div key={i} style={{ padding:'10px 8px', borderRadius:8, textAlign:'center', background:p.active ? p.color+'12' : 'var(--bg-raised)', border:`0.5px solid ${p.active ? p.color+'35' : 'var(--border)'}` }}>
              <div style={{ fontSize:12, fontWeight:700, color:p.active ? p.color : 'var(--text-3)' }}>{p.label}</div>
            </div>
          ))}
        </div>
      </Sec>

      <Sec title="One-year visual" sub="How far through the first sober year you are">
        <div style={{ marginBottom:10, display:'flex', justifyContent:'space-between', fontSize:11, color:'var(--text-3)' }}>
          <span>Day 0</span>
          <span>Day 365</span>
        </div>
        <div style={{ height:14, background:'var(--border)', borderRadius:999, overflow:'hidden' }}>
          <div style={{ height:'100%', width:`${soberYearPct}%`, background:catColor, borderRadius:999, transition:'width .6s' }} />
        </div>
        <div style={{ marginTop:8, fontSize:12, color:'var(--text-2)', lineHeight:1.6 }}>
          You are <strong style={{ color:catColor }}>{soberYearPct}%</strong> of the way through the first year milestone.
        </div>
      </Sec>

      <Sec title="What alcohol actually does to your brain" sub="The neuroscience of drinking and stopping">
        <div style={{ display:'flex', flexDirection:'column', gap:9 }}>
          {[
            { title:'GABA & glutamate imbalance', desc:'Alcohol changes the balance between calming and excitatory brain systems. When drinking stops, the brain needs time to stabilise again.', color:catColor },
            { title:'Dopamine hijacking', desc:'Alcohol can overstimulate the reward system. Over time, ordinary pleasures may feel flatter until recovery improves.', color:'#f59e0b' },
            { title:'Neuroplasticity recovery', desc:'With time sober, the brain often regains more stable attention, learning, emotional regulation, and clarity.', color:'#3b82f6' },
          ].map((s, i) => (
            <div key={i} style={{ padding:'11px 14px', borderRadius:9, background:'var(--bg-raised)', border:'0.5px solid var(--border)' }}>
              <div style={{ fontSize:12, fontWeight:700, color:s.color, marginBottom:4 }}>{s.title}</div>
              <div style={{ fontSize:11.5, color:'var(--text-2)', lineHeight:1.6 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </Sec>

      <Sec title="Sobriety facts worth knowing" sub="Encouraging and memorable">
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {[
            { f:'The first 90 days are often the hardest behaviourally. Reaching that point can make long-term progress feel much more stable.', icon:'🏆' },
            { f:'Tracking streaks is powerful because visible progress reinforces identity change and consistency.', icon:'📅' },
            { f:'Even before huge milestones, many people notice changes in sleep, hydration, mood, and money saved.', icon:'📊' },
            { f:'Small daily gains become massive when repeated over months.', icon:'✨' },
          ].map((f, i) => (
            <div key={i} style={{ display:'flex', gap:12, padding:'11px 14px', borderRadius:9, background:'var(--bg-raised)', border:'0.5px solid var(--border)' }}>
              <span style={{ fontSize:18, flexShrink:0 }}>{f.icon}</span>
              <p style={{ fontSize:12, color:'var(--text-2)', lineHeight:1.65, margin:0 }}>{f.f}</p>
            </div>
          ))}
        </div>
      </Sec>

      <Sec title="Frequently asked questions" sub="Common sobriety questions">
        {FAQ.map((f, i) => (
          <Acc key={i} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} catColor={catColor} />
        ))}
      </Sec>
    </div>
  )
}