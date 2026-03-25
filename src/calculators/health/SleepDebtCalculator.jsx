import { useState, useEffect, useRef } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'

const clamp = (v,a,b) => Math.min(b, Math.max(a, v))

const SLEEP_RECS = [
  { age:'School age (6–13)', rec:9.5 },
  { age:'Teen (14–17)',       rec:8.5 },
  { age:'Young adult (18–25)',rec:8   },
  { age:'Adult (26–64)',      rec:7.5 },
  { age:'Older adult (65+)', rec:7.5 },
]

const DAY_NAMES = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']

// Health effects at different debt levels
const DEBT_IMPACTS = [
  { threshold:0,  label:'No debt',        effect:'Optimal cognitive performance. Full immune function.',                              color:'#10b981' },
  { threshold:1,  label:'1h debt',         effect:'Mild attention and reaction time impairment. Slightly elevated hunger hormones.',   color:'#22a355' },
  { threshold:2,  label:'2h debt',         effect:'Memory consolidation reduced ~20%. Mood noticeably lower. Cortisol rising.',        color:'#f59e0b' },
  { threshold:4,  label:'4h debt',         effect:'Equivalent to 0.05% BAC. Reduced testosterone. Immune function suppressed.',       color:'#f97316' },
  { threshold:7,  label:'7h debt',         effect:'Severe impairment. Risk of microsleeps. Equivalent to 0.08% BAC.',                 color:'#ef4444' },
  { threshold:14, label:'14h+ debt',       effect:'Chronic sleep deprivation. Metabolic syndrome risk. Hallucination risk.',          color:'#dc2626' },
]

const FAQ = [
  { q:'Can I catch up on sleep debt on weekends?',
    a:"Partially. Short-term sleep debt (1–2 nights) can be mostly recovered with 1–2 nights of extra sleep. Chronic debt (weeks or months) cannot be fully recovered on weekends. Research shows weekend catch-up sleep reduces but does not eliminate metabolic and cognitive impairments. The only real solution is consistent adequate nightly sleep." },
  { q:'What are the effects of chronic sleep deprivation?',
    a:'Well-documented effects: impaired memory consolidation, reduced reaction time (equivalent to legal alcohol intoxication at 20+ hours awake), elevated cortisol and insulin resistance, increased hunger hormones (ghrelin up, leptin down), reduced testosterone, suppressed immune function, increased cardiovascular disease, obesity, and type 2 diabetes risk.' },
  { q:'How much sleep do I actually need?',
    a:"The vast majority of adults (97%) need 7–9 hours. The rare short sleeper gene affects under 3% of people. If you feel alert without an alarm and don't rely on caffeine to function, you're likely getting enough. Feeling tired despite 7+ hours often signals poor sleep quality (apnoea, alcohol, screens) rather than insufficient quantity." },
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

// SVG debt accumulation chart
function DebtAccumulationChart({ dailySleeps, target, catColor }) {
  const W = 520, H = 120, padL = 36, padR = 12, padT = 10, padB = 28
  const innerW = W - padL - padR
  const innerH = H - padT - padB

  const days = dailySleeps.length
  if (days === 0) return null

  // Compute cumulative debt
  const cumDebt = dailySleeps.reduce((acc, s) => {
    const prev = acc.length > 0 ? acc[acc.length - 1] : 0
    const debt = Math.max(0, target - s)
    return [...acc, prev + debt]
  }, [])

  const maxDebt = Math.max(...cumDebt, 1)
  const colW = innerW / days

  const linePoints = cumDebt.map((d, i) => {
    const x = padL + (i + 0.5) * colW
    const y = padT + innerH - (d / maxDebt) * innerH
    return `${x},${y}`
  })

  const statusColor = cumDebt[cumDebt.length - 1] < 2 ? '#10b981' : cumDebt[cumDebt.length - 1] < 7 ? '#f59e0b' : '#ef4444'

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display:'block' }}>
      {/* grid */}
      {[0, 0.5, 1].map((pct, i) => {
        const y = padT + innerH * (1 - pct)
        return (
          <g key={i}>
            <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="var(--border)" strokeWidth="0.5" strokeDasharray="3,4" />
            <text x={padL - 4} y={y + 3.5} textAnchor="end" fontSize="8" fill="var(--text-3)">{(maxDebt * pct).toFixed(1)}h</text>
          </g>
        )
      })}

      {/* bar columns */}
      {dailySleeps.map((s, i) => {
        const debt = Math.max(0, target - s)
        const barH = (cumDebt[i] / maxDebt) * innerH
        const x = padL + i * colW + colW * 0.1
        const w = colW * 0.8
        const y = padT + innerH - barH
        const hasDebt = debt > 0
        return (
          <rect key={i} x={x} y={y} width={w} height={barH} rx={2}
            fill={hasDebt ? statusColor : '#10b981'} opacity="0.25"
          />
        )
      })}

      {/* debt area fill */}
      {linePoints.length > 1 && (
        <path
          d={`M ${padL + 0.5 * colW},${padT + innerH} ${linePoints.join(' L ')} L ${padL + (days - 0.5) * colW},${padT + innerH} Z`}
          fill={statusColor} fillOpacity="0.1"
        />
      )}

      {/* cumulative line */}
      {linePoints.length > 1 && (
        <polyline points={linePoints.join(' ')} fill="none" stroke={statusColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      )}

      {/* dots */}
      {linePoints.map((p, i) => {
        const [x, y] = p.split(',').map(Number)
        return <circle key={i} cx={x} cy={y} r="4" fill={statusColor} />
      })}

      {/* x-axis labels */}
      <line x1={padL} y1={padT + innerH} x2={W - padR} y2={padT + innerH} stroke="var(--border)" strokeWidth="0.8" />
      {dailySleeps.map((_, i) => (
        <text key={i} x={padL + (i + 0.5) * colW} y={H - 5} textAnchor="middle" fontSize="8" fill="var(--text-3)">
          {DAY_NAMES[i % 7]}
        </text>
      ))}
    </svg>
  )
}

export default function SleepDebtCalculator({ meta, category }) {
  const catColor   = category?.color || '#8b5cf6'
  const [actual,   setActual]  = useState(6.5)
  const [target,   setTarget]  = useState(8)
  const [days,     setDays]    = useState(7)
  const [slide,    setSlide]   = useState(0)
  const [openFaq,  setOpenFaq] = useState(null)
  const timerRef = useRef(null)

  // 7-day per-night tracker
  const [dailySleeps, setDailySleeps] = useState([6.5, 7, 6, 6.5, 7.5, 8, 6])
  const [trackerMode, setTrackerMode] = useState(false)

  useEffect(() => {
    timerRef.current = setInterval(() => setSlide(s => (s + 1) % 4), 4000)
    return () => clearInterval(timerRef.current)
  }, [])

  const debtPerNight    = clamp(target - actual, 0, 12)
  const totalDebt       = Math.round(debtPerNight * days * 10) / 10
  const debtMin         = Math.round(totalDebt * 60)
  const status          = totalDebt < 2 ? 'Minimal' : totalDebt < 7 ? 'Moderate' : totalDebt < 14 ? 'Significant' : 'Severe'
  const statusColor     = totalDebt < 2 ? '#10b981' : totalDebt < 7 ? '#f59e0b' : totalDebt < 14 ? '#f97316' : '#ef4444'
  const statusSoft      = totalDebt < 2 ? '#d1fae5' : totalDebt < 7 ? '#fef3c7' : totalDebt < 14 ? '#ffedd5' : '#fee2e2'
  const nightsToRecover = Math.ceil(totalDebt / 1.5)

  // Tracker debt
  const trackerDebt = trackerMode
    ? Math.round(dailySleeps.reduce((s, h) => s + Math.max(0, target - h), 0) * 10) / 10
    : totalDebt
  const trackerDebtColor = trackerDebt < 2 ? '#10b981' : trackerDebt < 7 ? '#f59e0b' : trackerDebt < 14 ? '#f97316' : '#ef4444'

  const slides = [
    { label:'Sleep debt', content:(
      <div>
        <div style={{ fontSize:52, fontWeight:700, lineHeight:1, color:statusColor, fontFamily:"'Space Grotesk',sans-serif" }}>{totalDebt}h</div>
        <div style={{ fontSize:11, color:'var(--text-3)', marginTop:3, marginBottom:12 }}>accumulated over {days} days</div>
        <div style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'5px 14px 5px 10px', borderRadius:20, background:statusSoft, border:`1px solid ${statusColor}35`, marginBottom:14 }}>
          <div style={{ width:8, height:8, borderRadius:'50%', background:statusColor }} /><span style={{ fontSize:12, fontWeight:700, color:statusColor }}>{status}</span>
        </div>
        <div style={{ padding:'10px 14px', background:'var(--bg-raised)', borderRadius:8, border:'0.5px solid var(--border)' }}>
          <div style={{ fontSize:11.5, color:'var(--text-2)', lineHeight:1.6 }}>Getting {actual}h vs {target}h target = {debtPerNight.toFixed(1)}h deficit per night. Over {days} days that accumulates to {totalDebt}h total.</div>
        </div>
      </div>
    )},
    { label:'Per-night impact', content:(
      <div>
        <div style={{ fontSize:11, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:12 }}>What happens each night you are short</div>
        {[
          { hr:1, effect:'Mild attention and reaction time impairment.', color:'#f59e0b' },
          { hr:2, effect:'Memory consolidation reduced ~20%. Mood drops noticeably.', color:'#f97316' },
          { hr:3, effect:'Equivalent to 0.05% BAC. Cortisol spikes significantly.', color:'#ef4444' },
          { hr:4, effect:'Severe cognitive impairment. Immune system suppressed.', color:'#dc2626' },
        ].filter(r => r.hr <= Math.ceil(debtPerNight)).map((r, i) => (
          <div key={i} style={{ display:'flex', gap:10, marginBottom:8, padding:'8px 10px', borderRadius:8, background:'var(--bg-raised)', border:'0.5px solid var(--border)' }}>
            <div style={{ width:6, height:6, borderRadius:'50%', background:r.color, flexShrink:0, marginTop:3 }} />
            <div style={{ fontSize:11.5, color:'var(--text-2)', lineHeight:1.5 }}><strong style={{ color:r.color }}>−{r.hr}h:</strong> {r.effect}</div>
          </div>
        ))}
        {debtPerNight < 1 && <div style={{ fontSize:12, color:'#10b981' }}>No significant deficit — great sleep habits!</div>}
      </div>
    )},
    { label:'Recovery plan', content:(
      <div>
        <div style={{ fontSize:11, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:12 }}>How to recover {totalDebt}h of sleep debt</div>
        {[
          { label:'Best method',       val:`+1–1.5h/night for ${nightsToRecover} nights`,       color:catColor  },
          { label:"Don't do this",     val:'Recovering all at once (disrupts circadian rhythm)', color:'#ef4444' },
          { label:'Weekend catch-up',  val:'Add 1–2h on 2 weekends = partial recovery',          color:'#f59e0b' },
          { label:'Long term fix',     val:`Consistent ${target}h nightly going forward`,        color:'#10b981' },
        ].map((r, i) => (
          <div key={i} style={{ padding:'9px 12px', borderRadius:8, background:'var(--bg-raised)', border:'0.5px solid var(--border)', marginBottom:6 }}>
            <div style={{ fontSize:10, color:'var(--text-3)', marginBottom:2 }}>{r.label}</div>
            <div style={{ fontSize:12, fontWeight:600, color:r.color }}>{r.val}</div>
          </div>
        ))}
      </div>
    )},
    { label:'Sleep recs', content:(
      <div>
        <div style={{ fontSize:11, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:12 }}>Recommended sleep by age (NSF)</div>
        {SLEEP_RECS.map((r, i) => (
          <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 12px', borderRadius:8, background:'var(--bg-raised)', border:'0.5px solid var(--border)', marginBottom:5 }}>
            <span style={{ fontSize:11, color:'var(--text)' }}>{r.age}</span>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ width:80, height:4, background:'var(--border)', borderRadius:2 }}>
                <div style={{ height:'100%', width:`${(r.rec / 10) * 100}%`, background:catColor, borderRadius:2 }} />
              </div>
              <span style={{ fontSize:11, fontWeight:700, color:catColor }}>{r.rec}h</span>
            </div>
          </div>
        ))}
      </div>
    )},
  ]

  const hint = `Sleep debt: ${totalDebt}h (${status}) over ${days} days. Deficit: ${debtPerNight.toFixed(1)}h/night. Recovery: +1.5h/night for ${nightsToRecover} nights.`

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

      {/* ── MAIN CALC ── */}
      <CalcShell
        left={<>
          <div style={{ fontSize:10, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:14 }}>Sleep inputs</div>
          <Stepper label="Actual sleep per night" value={actual} onChange={setActual} min={1} max={14} step={0.25} unit="hrs" catColor={catColor} />
          <Stepper label="Target sleep per night" value={target} onChange={setTarget} min={4} max={12} step={0.25} unit="hrs" hint="Adults: 7–9h" catColor={catColor} />
          <Stepper label="Days tracked"           value={days}   onChange={setDays}   min={1} max={30}             unit="days" catColor={catColor} />
          <div style={{ borderTop:'0.5px solid var(--border)', paddingTop:14, marginTop:4 }}>
            <div style={{ padding:'10px 12px', background:statusSoft, borderRadius:9, border:`1px solid ${statusColor}30` }}>
              <div style={{ fontSize:10, fontWeight:700, color:statusColor, marginBottom:2 }}>DEBT SUMMARY</div>
              <div style={{ fontSize:16, fontWeight:700, color:'var(--text)' }}>{totalDebt}h over {days} days</div>
              <div style={{ fontSize:11, color:'var(--text-3)', marginTop:2 }}>{debtMin} min total · {nightsToRecover} nights to recover</div>
            </div>
          </div>
        </>}
        right={<>
          <div style={{ background:'var(--bg-card)', border:'0.5px solid var(--border)', borderRadius:14, overflow:'hidden', marginBottom:14 }}>
            <div style={{ padding:'11px 16px', borderBottom:'0.5px solid var(--border)', display:'flex', justifyContent:'space-between' }}>
              <span style={{ fontSize:12, fontWeight:700, color:'var(--text)', fontFamily:"'Space Grotesk',sans-serif" }}>Sleep Debt Analysis</span>
              <span style={{ fontSize:10, color:'var(--text-3)' }}>4 views · auto-rotates</span>
            </div>
            <div style={{ padding:'16px 18px', minHeight:200 }}>{slides[slide].content}</div>
            <div style={{ display:'flex', justifyContent:'center', gap:6, padding:'8px 0 10px' }}>
              {slides.map((_, i) => (<button key={i} onClick={() => { setSlide(i); clearInterval(timerRef.current) }} style={{ width:i === slide ? 20 : 6, height:6, borderRadius:3, background:i === slide ? catColor : 'var(--border)', border:'none', cursor:'pointer', transition:'all .2s', padding:0 }} />))}
            </div>
            <div style={{ display:'flex', gap:4, overflowX:'auto', padding:'0 12px 12px', scrollbarWidth:'none' }}>
              {slides.map((s, i) => (<button key={i} onClick={() => { setSlide(i); clearInterval(timerRef.current) }} style={{ flexShrink:0, padding:'4px 10px', borderRadius:6, fontSize:10, fontWeight:slide === i ? 700 : 500, color:slide === i ? catColor : 'var(--text-3)', border:`1px solid ${slide === i ? catColor : 'var(--border)'}`, background:slide === i ? catColor + '10' : 'transparent', cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>{s.label}</button>))}
            </div>
          </div>
          <BreakdownTable title="Sleep Debt" rows={[
            { label:'Total debt',        value:`${totalDebt}h`,              bold:true, highlight:true, color:statusColor },
            { label:'Status',            value:status,                        color:statusColor },
            { label:'Per-night deficit', value:`${debtPerNight.toFixed(1)}h` },
            { label:'Days tracked',      value:days },
            { label:'Nights to recover', value:nightsToRecover,              color:catColor },
            { label:'Target sleep',      value:`${target}h/night` },
          ]} />
          <AIHintCard hint={hint} />
        </>}
      />

      {/* ── NEW: 7-DAY TRACKER + DEBT CHART ── */}
      <Sec title="🎯 7-day sleep tracker" sub="Log each night to see your debt accumulate in real time">
        <p style={{ fontSize:12, color:'var(--text-2)', lineHeight:1.7, marginBottom:14, fontFamily:"'DM Sans',sans-serif" }}>
          Adjust each day's sleep using the sliders below. The chart shows your cumulative debt growing over the week. Target: <strong style={{ color:catColor }}>{target}h/night</strong>.
        </p>

        {/* Per-day sliders */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:6, marginBottom:14 }}>
          {dailySleeps.map((h, i) => {
            const debt = Math.max(0, target - h)
            const dayColor = debt === 0 ? '#10b981' : debt < 1.5 ? '#f59e0b' : '#ef4444'
            return (
              <div key={i} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                <div style={{ fontSize:10, fontWeight:700, color:'var(--text-3)' }}>{DAY_NAMES[i]}</div>
                {/* vertical bar visual */}
                <div style={{ width:'100%', height:60, background:'var(--border)', borderRadius:4, overflow:'hidden', position:'relative' }}>
                  {/* target line */}
                  <div style={{ position:'absolute', left:0, right:0, top:`${(1 - target / 12) * 100}%`, height:1, background:catColor, opacity:0.6 }} />
                  {/* actual bar */}
                  <div style={{ position:'absolute', bottom:0, left:0, right:0, height:`${(h / 12) * 100}%`, background:dayColor, borderRadius:'0 0 4px 4px', transition:'height .3s' }} />
                </div>
                {/* −/+ buttons */}
                <div style={{ display:'flex', gap:2, width:'100%' }}>
                  <button onClick={() => setDailySleeps(d => d.map((v, j) => j === i ? Math.max(1, Math.round((v - 0.25) * 4) / 4) : v))} style={{ flex:1, padding:'3px', borderRadius:4, border:'1px solid var(--border)', background:'var(--bg-raised)', cursor:'pointer', fontSize:12, color:'var(--text)' }}>−</button>
                  <button onClick={() => setDailySleeps(d => d.map((v, j) => j === i ? Math.min(12, Math.round((v + 0.25) * 4) / 4) : v))} style={{ flex:1, padding:'3px', borderRadius:4, border:'1px solid var(--border)', background:'var(--bg-raised)', cursor:'pointer', fontSize:12, color:'var(--text)' }}>+</button>
                </div>
                <div style={{ fontSize:11, fontWeight:700, color:dayColor }}>{h}h</div>
                {debt > 0 && <div style={{ fontSize:9, color:'#ef4444' }}>−{debt.toFixed(1)}</div>}
              </div>
            )
          })}
        </div>

        {/* Accumulation chart */}
        <div style={{ background:'var(--bg-raised)', borderRadius:10, padding:'12px 8px 6px', border:'0.5px solid var(--border)', marginBottom:12, overflowX:'auto' }}>
          <DebtAccumulationChart dailySleeps={dailySleeps} target={target} catColor={catColor} />
        </div>

        {/* Summary row */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
          {[
            { label:'7-day total debt', val:`${trackerDebt}h`, color:trackerDebtColor },
            { label:'Avg sleep',        val:`${(dailySleeps.reduce((a,b) => a+b, 0) / dailySleeps.length).toFixed(1)}h/night`, color:catColor },
            { label:'Nights at target', val:`${dailySleeps.filter(h => h >= target).length}/7`, color:'#10b981' },
          ].map((s, i) => (
            <div key={i} style={{ padding:'10px 12px', borderRadius:9, background:'var(--bg-raised)', border:'0.5px solid var(--border)', textAlign:'center' }}>
              <div style={{ fontSize:9, color:'var(--text-3)', marginBottom:3 }}>{s.label}</div>
              <div style={{ fontSize:18, fontWeight:700, color:s.color, fontFamily:"'Space Grotesk',sans-serif" }}>{s.val}</div>
            </div>
          ))}
        </div>
      </Sec>

      {/* ── NEW: HEALTH IMPACT GAUGE ── */}
      <Sec title="Sleep debt health impact scale" sub="What your current debt means for your body">
        <p style={{ fontSize:12, color:'var(--text-2)', lineHeight:1.7, marginBottom:14, fontFamily:"'DM Sans',sans-serif" }}>
          This scale shows which health effects are active at your current debt level of <strong style={{ color:statusColor }}>{totalDebt}h</strong>. Effects are cumulative — higher debt includes all lower effects.
        </p>

        {/* Horizontal gauge */}
        <div style={{ position:'relative', marginBottom:18 }}>
          <div style={{ display:'flex', height:14, borderRadius:7, overflow:'hidden' }}>
            {DEBT_IMPACTS.slice(0, -1).map((d, i) => (
              <div key={i} style={{ flex:1, background:d.color, opacity: totalDebt >= d.threshold ? 1 : 0.2, transition:'opacity .3s' }} />
            ))}
          </div>
          {/* Pointer */}
          <div style={{
            position:'absolute',
            left:`${clamp((totalDebt / 14) * 100, 0, 100)}%`,
            top:-6,
            transform:'translateX(-50%)',
            transition:'left .4s',
          }}>
            <div style={{ width:0, height:0, borderLeft:'7px solid transparent', borderRight:'7px solid transparent', borderTop:`10px solid ${statusColor}`, margin:'0 auto' }} />
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:9, color:'var(--text-3)', marginTop:6 }}>
            <span>0h</span><span>2h</span><span>4h</span><span>7h</span><span>10h</span><span>14h+</span>
          </div>
        </div>

        {/* Impact cards */}
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          {DEBT_IMPACTS.map((d, i) => {
            const isActive = totalDebt >= d.threshold
            return (
              <div key={i} style={{ display:'flex', gap:12, padding:'10px 13px', borderRadius:9, background:isActive ? d.color + '10' : 'var(--bg-raised)', border:`${isActive ? '1.5' : '0.5'}px solid ${isActive ? d.color + '40' : 'var(--border)'}`, opacity:isActive ? 1 : 0.45 }}>
                <div style={{ width:10, height:10, borderRadius:'50%', background:isActive ? d.color : 'var(--border)', flexShrink:0, marginTop:3 }} />
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:12, fontWeight:isActive ? 700 : 500, color:isActive ? d.color : 'var(--text-3)', marginBottom:2 }}>
                    {d.label} {isActive && totalDebt > 0 ? '— ACTIVE' : ''}
                  </div>
                  <div style={{ fontSize:11.5, color:isActive ? 'var(--text-2)' : 'var(--text-3)', lineHeight:1.55 }}>{d.effect}</div>
                </div>
                {isActive && <div style={{ fontSize:9, fontWeight:700, color:d.color, background:d.color + '18', padding:'2px 7px', borderRadius:5, flexShrink:0, height:'fit-content' }}>✓</div>}
              </div>
            )
          })}
        </div>
      </Sec>

      {/* ── 🎯 RECOVERY PLAN BUILDER ── */}
      <Sec title="Build your recovery plan" sub="How quickly can you clear your sleep debt?">
        <p style={{ fontSize:12, color:'var(--text-2)', lineHeight:1.7, marginBottom:14, fontFamily:"'DM Sans',sans-serif" }}>
          You have <strong style={{ color:catColor }}>{totalDebt}h</strong> of sleep debt. Compare four recovery approaches below.
        </p>
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {[
            { label:'Go to bed 30 min earlier',    extraH:0.5, color:'#94a3b8', note:'Gentle — easiest to sustain' },
            { label:'Go to bed 1 hour earlier',    extraH:1,   color:'#3b82f6', note:'Balanced approach' },
            { label:'Go to bed 1.5 hours earlier', extraH:1.5, color:catColor,  note:'Recommended fastest sustainable method', best:true },
            { label:'Weekend long sleeps (+2h)',    extraH:2,   color:'#f59e0b', note:'Works for mild debt, disrupts schedule' },
          ].map((s, i) => {
            const nights = Math.ceil(totalDebt / s.extraH)
            return (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 14px', borderRadius:9, background:s.best ? catColor + '12' : 'var(--bg-raised)', border:`${s.best ? '1.5' : '0.5'}px solid ${s.best ? catColor : 'var(--border)'}` }}>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:2 }}>
                    <span style={{ fontSize:12, fontWeight:s.best ? 700 : 500, color:s.best ? catColor : 'var(--text)' }}>{s.label}</span>
                    {s.best && <span style={{ fontSize:9, fontWeight:700, background:catColor + '18', color:catColor, padding:'1px 6px', borderRadius:5 }}>BEST</span>}
                  </div>
                  <div style={{ fontSize:10, color:'var(--text-3)' }}>{s.note}</div>
                  {/* progress bar showing how quickly it clears */}
                  <div style={{ marginTop:5, height:3, background:'var(--border)', borderRadius:2 }}>
                    <div style={{ height:'100%', width:`${clamp((1 / nights) * 100, 5, 100)}%`, background:s.color, borderRadius:2 }} />
                  </div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontSize:16, fontWeight:700, color:s.color, fontFamily:"'Space Grotesk',sans-serif" }}>{nights}</div>
                  <div style={{ fontSize:9, color:'var(--text-3)' }}>nights</div>
                </div>
              </div>
            )
          })}
        </div>
      </Sec>

      {/* ── 🧠 INTERESTING ── */}
      <Sec title="Sleep debt is invisible — that's what makes it dangerous" sub="The cognitive impairment you don't notice">
        <p style={{ fontSize:12, color:'var(--text-2)', lineHeight:1.7, marginBottom:14, fontFamily:"'DM Sans',sans-serif" }}>
          The most alarming finding in sleep research: people with chronic sleep restriction feel subjectively fine while their objective performance continues to deteriorate. After 2 weeks of sleeping 6 hours, performance equals someone awake for 24 hours straight — but subjects report feeling only slightly sleepy.
        </p>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:14 }}>
          {[
            { label:'17h without sleep',    equiv:'0.05% BAC', color:'#f59e0b', note:'Mildly drunk equivalent' },
            { label:'20h without sleep',    equiv:'0.08% BAC', color:'#f97316', note:'Legal drink-drive limit' },
            { label:'24h without sleep',    equiv:'0.10% BAC', color:'#ef4444', note:'Clearly impaired' },
            { label:'6h/night for 2 weeks', equiv:'24h no sleep', color:'#dc2626', note:'Feels "only slightly tired"' },
          ].map((s, i) => (
            <div key={i} style={{ padding:'10px 12px', borderRadius:9, background:'var(--bg-raised)', border:'0.5px solid var(--border)' }}>
              <div style={{ fontSize:10, color:'var(--text-3)', marginBottom:3 }}>{s.label}</div>
              <div style={{ fontSize:14, fontWeight:700, color:s.color, fontFamily:"'Space Grotesk',sans-serif" }}>{s.equiv}</div>
              <div style={{ fontSize:10, color:'var(--text-3)', marginTop:2 }}>{s.note}</div>
            </div>
          ))}
        </div>
        <p style={{ fontSize:12, color:'var(--text-2)', lineHeight:1.7, margin:0 }}>
          Unlike alcohol, where people often know they are impaired, sleep-deprived individuals consistently <em>underestimate</em> their own impairment — making it uniquely dangerous for driving, complex decisions, and safety-critical tasks.
        </p>
      </Sec>

      {/* ── ⚡ FUN FACT ── */}
      <Sec title="⚡ Sleep debt facts worth knowing">
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {[
            { f:'Every 1-hour reduction in sleep increases appetite by ~300 kcal the next day — driven by higher ghrelin (hunger) and lower leptin (satiety). This is a key mechanism linking poor sleep to obesity.', icon:'🍔' },
            { f:'A 2010 Carnegie Mellon study found people sleeping fewer than 7 hours were nearly 3× more likely to develop a cold when exposed to rhinovirus vs those sleeping 8+ hours.', icon:'🤧' },
            { f:"Matthew Walker's \"Why We Sleep\" (2017) brought mainstream attention to sleep science, but some of its statistics were later scrutinised. The core finding — that insufficient sleep causes widespread harm — is broadly supported.", icon:'📚' },
            { f:'The world record for staying awake is 11 days (Randy Gardner, 1965). He experienced hallucinations, paranoia, and memory failure by day 4. He fully recovered with a single long sleep.', icon:'😵' },
          ].map((f, i) => (
            <div key={i} style={{ display:'flex', gap:12, padding:'11px 14px', borderRadius:9, background:'var(--bg-raised)', border:'0.5px solid var(--border)' }}>
              <span style={{ fontSize:18, flexShrink:0 }}>{f.icon}</span>
              <p style={{ fontSize:12, color:'var(--text-2)', lineHeight:1.65, margin:0 }}>{f.f}</p>
            </div>
          ))}
        </div>
      </Sec>

      <Sec title="Frequently asked questions" sub="Sleep debt explained">
        {FAQ.map((f, i) => (<Acc key={i} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} catColor={catColor} />))}
      </Sec>
    </div>
  )
}
