import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'

const clamp = (v,a,b) => Math.min(b, Math.max(a, v))
const addDays = (d,n) => { const r = new Date(d); r.setDate(r.getDate() + n); return r }
const fmtDate = d => d.toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' })
const fmtShort = d => d.toLocaleDateString('en-GB', { day:'numeric', month:'short' })
const daysBetween = (a,b) => Math.round((b - a) / 86400000)

// Daily conception probability data
const DAY_PROBS = [
  { offset:-5, pct:10, label:'Day −5', note:'Sperm can survive this long' },
  { offset:-4, pct:14, label:'Day −4', note:'Early fertile window' },
  { offset:-3, pct:16, label:'Day −3', note:'Fertility rising' },
  { offset:-2, pct:27, label:'Day −2', note:'Peak window — highest probability' },
  { offset:-1, pct:31, label:'Day −1', note:'Peak window — highest probability' },
  { offset: 0, pct:25, label:'Day 0',  note:'Ovulation day' },
  { offset: 1, pct: 5, label:'Day +1', note:'Egg viable up to 24 hours' },
  { offset: 2, pct: 0, label:'Day +2', note:'Post-fertile window' },
]

const AGE_BENCHMARKS = [
  { label:'Ages 20–24', value:25, note:'Peak fertility' },
  { label:'Ages 25–29', value:22, note:'High fertility' },
  { label:'Ages 30–34', value:18, note:'Good fertility' },
  { label:'Ages 35–39', value:12, note:'Declining fertility' },
  { label:'Ages 40–44', value: 7, note:'Significantly reduced' },
]

const FAQ = [
  { q:'What is the fertile window?',
    a:"The fertile window is the 6-day period ending on ovulation day — 5 days before ovulation plus ovulation day itself. This window exists because sperm can survive 3–5 days in the reproductive tract, but the egg is only viable for 12–24 hours after release. The 2 days immediately before ovulation (Day −2 and Day −1) carry the highest probability of conception." },
  { q:'How do I know when I am ovulating?',
    a:"Calendar method predicts ovulation at cycle length minus 14 days. It works best for regular cycles. Basal body temperature, ovulation predictor kits, and cervical mucus tracking can improve accuracy." },
  { q:'Why does the fertile window vary month to month?',
    a:'The follicular phase before ovulation can shift because of stress, illness, weight changes, travel, and hormones. The luteal phase is usually more stable, so ovulation can still move several days from cycle to cycle.' },
  { q:'Does age affect the fertile window?',
    a:'Age affects the probability of conception per cycle more than the length of the fertile window itself. The main effect is on egg quality and overall fertility rather than shortening the fertile days.' },
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

function FertilityInsightSection({ ovulation, winStart, winEnd, inWindow, daysToOv, ovulationDay, cycleLen, catColor }) {
  let title = ''
  let message = ''
  let recommendation = ''

  if (inWindow) {
    title = 'You are in your fertile window'
    message = 'This is the most important time in your cycle for conception chances. The highest probability is usually in the two days before ovulation and on ovulation day.'
    recommendation = 'If you are trying to conceive, focus on this window and especially the peak days.'
  } else if (daysToOv > 0) {
    title = 'Your fertile window is approaching'
    message = `Your estimated ovulation is in ${daysToOv} days, and your fertile window opens on ${fmtDate(winStart)}.`
    recommendation = 'Plan ahead for the fertile days and track any ovulation signs if you can.'
  } else {
    title = 'This fertile window has likely passed'
    message = 'Based on your entries, ovulation has likely already happened this cycle. These dates are still useful for spotting patterns for the next cycle.'
    recommendation = 'Use this cycle as a reference and compare it with next month.'
  }

  return (
    <Sec title="Your fertility insight" sub={title}>
      <div style={{ display:'grid', gap:14 }}>
        <div style={{ padding:'14px 15px', borderRadius:12, background:catColor+'10', border:`1px solid ${catColor}35` }}>
          <div style={{ fontSize:13, fontWeight:700, color:catColor, marginBottom:6, fontFamily:"'Space Grotesk',sans-serif" }}>
            Ovulation day {ovulationDay}
          </div>
          <p style={{ margin:0, fontSize:12.5, color:'var(--text-2)', lineHeight:1.75, fontFamily:"'DM Sans',sans-serif" }}>
            {message}
          </p>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(4, minmax(0, 1fr))', gap:10 }}>
          {[
            { label:'Ovulation', value:fmtShort(ovulation) },
            { label:'Window start', value:fmtShort(winStart) },
            { label:'Window end', value:fmtShort(winEnd) },
            { label:'Cycle', value:`${cycleLen}d` },
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

function BestDaysSection({ ovulation, catColor }) {
  const bestDays = [-2, -1, 0, 1].map(offset => ({
    offset,
    date:addDays(ovulation, offset),
    label:
      offset === -2 ? 'Highest chance' :
      offset === -1 ? 'Very high chance' :
      offset === 0 ? 'Ovulation day' :
      'Late fertile day'
  }))

  return (
    <Sec title="Best days to try" sub="Most useful timing for conception">
      <div style={{ display:'grid', gap:8 }}>
        {bestDays.map((day, i) => (
          <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'11px 12px', borderRadius:9, background:i < 2 ? catColor+'10' : 'var(--bg-raised)', border:`0.5px solid ${i < 2 ? catColor+'35' : 'var(--border)'}` }}>
            <div>
              <div style={{ fontSize:12, fontWeight:700, color:i < 2 ? catColor : 'var(--text)' }}>{day.label}</div>
              <div style={{ fontSize:10.5, color:'var(--text-3)', marginTop:2 }}>
                {day.offset === 0 ? 'Estimated ovulation day' : `${Math.abs(day.offset)} day${Math.abs(day.offset) > 1 ? 's' : ''} ${day.offset < 0 ? 'before' : 'after'} ovulation`}
              </div>
            </div>
            <div style={{ fontSize:11.5, fontWeight:700, color:i < 2 ? catColor : 'var(--text)' }}>
              {fmtDate(day.date)}
            </div>
          </div>
        ))}
      </div>
    </Sec>
  )
}

function CycleTimelineSection({ lmp, ovulation, nextPeriod, winStart, winEnd, catColor }) {
  const items = [
    { label:'Period start', date:lmp, color:'#64748b' },
    { label:'Fertile window starts', date:winStart, color:'#3b82f6' },
    { label:'Ovulation', date:ovulation, color:catColor },
    { label:'Fertile window ends', date:winEnd, color:'#10b981' },
    { label:'Next period', date:nextPeriod, color:'#f59e0b' },
  ]

  return (
    <Sec title="Cycle timeline" sub="Key cycle dates at a glance">
      <div style={{ display:'grid', gap:8 }}>
        {items.map((item, i) => (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:9, background:item.label === 'Ovulation' ? catColor+'10' : 'var(--bg-raised)', border:`0.5px solid ${item.label === 'Ovulation' ? catColor+'35' : 'var(--border)'}` }}>
            <div style={{ width:8, height:8, borderRadius:'50%', background:item.color, flexShrink:0 }} />
            <div style={{ flex:1 }}>
              <div style={{ fontSize:12, fontWeight:700, color:item.label === 'Ovulation' ? catColor : 'var(--text)' }}>{item.label}</div>
            </div>
            <div style={{ fontSize:11, color:'var(--text-3)' }}>{fmtDate(item.date)}</div>
          </div>
        ))}
      </div>
    </Sec>
  )
}

function AccuracySection({ catColor }) {
  const items = [
    'Use ovulation predictor kits (LH tests) to catch the surge before ovulation.',
    'Track basal body temperature to confirm ovulation after it happens.',
    'Watch for fertile cervical mucus around your window.',
    'Calendar predictions work best when your cycles are regular.',
  ]

  return (
    <Sec title="How to improve accuracy" sub="Helpful ways to confirm timing">
      <div style={{ display:'grid', gap:8 }}>
        {items.map((item, i) => (
          <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:10, padding:'10px 12px', borderRadius:9, background:i === 0 ? catColor+'10' : 'var(--bg-raised)', border:`0.5px solid ${i === 0 ? catColor+'35' : 'var(--border)'}` }}>
            <div style={{ width:16, height:16, borderRadius:'50%', background:catColor, color:'#fff', fontSize:10, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:1 }}>✓</div>
            <p style={{ margin:0, fontSize:12.5, color:'var(--text-2)', lineHeight:1.6, fontFamily:"'DM Sans',sans-serif" }}>{item}</p>
          </div>
        ))}
      </div>
    </Sec>
  )
}

function DoctorSection() {
  const items = [
    'Talk to your doctor if your cycles are very irregular or hard to predict.',
    'Talk to your doctor if periods suddenly change a lot or become unusually painful.',
    'If timing has been difficult for several cycles, a doctor can help assess ovulation and cycle health.',
  ]

  return (
    <Sec title="When to contact your doctor" sub="General fertility guidance">
      <div style={{ display:'grid', gap:10 }}>
        {items.map((item, i) => (
          <div key={i} style={{ padding:'12px 13px', borderRadius:10, background:'var(--bg-raised)', border:'0.5px solid var(--border)' }}>
            <p style={{ margin:0, fontSize:12.5, color:'var(--text-2)', lineHeight:1.65, fontFamily:"'DM Sans',sans-serif" }}>{item}</p>
          </div>
        ))}
        <p style={{ margin:'4px 0 0', fontSize:11.5, color:'var(--text-3)', lineHeight:1.7, fontFamily:"'DM Sans',sans-serif" }}>
          This calculator estimates timing only and does not replace personal medical advice.
        </p>
      </div>
    </Sec>
  )
}

export default function FertilityWindowCalculator({ meta, category }) {
  const catColor = category?.color || '#ec4899'
  const [lmpStr, setLmpStr] = useState(() => { const d = new Date(); d.setDate(d.getDate() - 10); return d.toISOString().split('T')[0] })
  const [cycleLen, setCycleLen] = useState(28)
  const [age, setAge] = useState(28)
  const [openFaq, setOpenFaq] = useState(null)

  const lmp = new Date(lmpStr)
  const today = new Date()
  const ovulationDay = cycleLen - 14
  const ovulation = addDays(lmp, ovulationDay)
  const winStart = addDays(ovulation, -5)
  const winEnd = addDays(ovulation, 1)
  const nextPeriod = addDays(lmp, cycleLen)
  const daysToOv = daysBetween(today, ovulation)
  const inWindow = today >= winStart && today <= winEnd
  const isPeakDay = Math.abs(daysBetween(today, addDays(ovulation, -1))) <= 1 || Math.abs(daysBetween(today, addDays(ovulation, -2))) <= 1

  const ageBenchmark = AGE_BENCHMARKS.find(b => {
    const lo = parseInt(b.label.split(' ')[1])
    const hi = parseInt(b.label.split('–')[1])
    return age >= lo && age <= hi
  }) || AGE_BENCHMARKS[AGE_BENCHMARKS.length - 1]

  const maxPct = 35

  const hint = `Fertile window: ${fmtDate(winStart)} – ${fmtDate(winEnd)}. Ovulation: ${fmtDate(ovulation)} (day ${ovulationDay}). Peak days: ${fmtShort(addDays(ovulation,-2))} & ${fmtShort(addDays(ovulation,-1))}. Age group: ${ageBenchmark.label} — ~${ageBenchmark.value}% chance per cycle.`

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
          <Stepper label="Your age" value={age} onChange={setAge} min={18} max={55} unit="yrs" catColor={catColor} />

          {inWindow && (
            <div style={{ padding:'11px 13px', background:'#d1fae5', borderRadius:9, border:'1px solid #10b98130', marginBottom:12 }}>
              <div style={{ fontSize:12, fontWeight:700, color:'#065f46' }}>🌸 You are in your fertile window</div>
              <div style={{ fontSize:11, color:'#047857', marginTop:3 }}>
                {isPeakDay ? '⭐ Today is a peak conception day' : `Window closes: ${fmtDate(winEnd)}`}
              </div>
            </div>
          )}

          <div style={{ borderTop:'0.5px solid var(--border)', paddingTop:14, marginTop:4 }}>
            <div style={{ fontSize:12, fontWeight:600, color:'var(--text-2)', marginBottom:10, fontFamily:"'DM Sans',sans-serif" }}>Your cycle dates</div>
            {[
              { l:'LMP started', d:lmp, highlight:false },
              { l:'Fertile window opens', d:winStart, highlight:false },
              { l:'Peak days', d:addDays(ovulation,-2), highlight:true },
              { l:'Ovulation', d:ovulation, highlight:true },
              { l:'Fertile window closes', d:winEnd, highlight:false },
              { l:'Next period (est.)', d:nextPeriod, highlight:false },
            ].map((r, i) => (
              <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'6px 10px', borderRadius:7, background:r.highlight ? catColor + '10' : 'var(--bg-raised)', border:`0.5px solid ${r.highlight ? catColor + '40' : 'var(--border)'}`, marginBottom:4 }}>
                <span style={{ fontSize:11, color:r.highlight ? catColor : 'var(--text-2)' }}>{r.l}</span>
                <span style={{ fontSize:11, fontWeight:r.highlight ? 700 : 500, color:r.highlight ? catColor : 'var(--text)' }}>{fmtShort(r.d)}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop:12, padding:'10px 12px', background:'var(--bg-raised)', borderRadius:9, border:'0.5px solid var(--border)' }}>
            <div style={{ fontSize:10, fontWeight:700, color:'var(--text-3)', marginBottom:3 }}>YOUR AGE GROUP</div>
            <div style={{ fontSize:14, fontWeight:700, color:catColor }}>{ageBenchmark.label}</div>
            <div style={{ fontSize:11, color:'var(--text-3)' }}>{ageBenchmark.note} · ~{ageBenchmark.value}% per cycle</div>
          </div>
        </>}
        right={<>
          <div style={{ background:'var(--bg-card)', border:'0.5px solid var(--border)', borderRadius:14, overflow:'hidden', marginBottom:14 }}>
            <div style={{ padding:'11px 16px', borderBottom:'0.5px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontSize:12, fontWeight:700, color:'var(--text)', fontFamily:"'Space Grotesk',sans-serif" }}>Fertile Window</span>
              <span style={{ fontSize:10, color:'var(--text-3)' }}>Conception probability by day</span>
            </div>
            <div style={{ padding:'16px 18px' }}>
              <div style={{ marginBottom:16 }}>
                {inWindow ? (
                  <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'8px 14px 8px 10px', borderRadius:20, background:'#d1fae520', border:'1px solid #10b98140' }}>
                    <div style={{ width:10, height:10, borderRadius:'50%', background:'#10b981' }} />
                    <span style={{ fontSize:14, fontWeight:700, color:'#10b981' }}>In fertile window now</span>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize:42, fontWeight:700, lineHeight:1, color:catColor, fontFamily:"'Space Grotesk',sans-serif" }}>
                      {Math.abs(daysToOv)}
                    </div>
                    <div style={{ fontSize:11, color:'var(--text-3)', marginTop:3 }}>
                      days {daysToOv > 0 ? 'until ovulation' : 'since ovulation'}
                    </div>
                  </div>
                )}
              </div>

              <div style={{ fontSize:10, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:10 }}>
                Probability of conception by cycle day
              </div>

              {DAY_PROBS.map((d, i) => {
                const isPeak = d.pct >= 27
                return (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'6px 10px', borderRadius:7, background:isPeak ? catColor + '12' : 'var(--bg-raised)', border:`${isPeak ? '1.5' : '0.5'}px solid ${isPeak ? catColor : 'var(--border)'}`, marginBottom:4 }}>
                    <div style={{ width:76, flexShrink:0 }}>
                      <div style={{ fontSize:11, fontWeight:isPeak ? 700 : 500, color:isPeak ? catColor : 'var(--text)' }}>{d.label}</div>
                      <div style={{ fontSize:9, color:'var(--text-3)' }}>{fmtShort(addDays(ovulation, d.offset))}</div>
                    </div>
                    <div style={{ flex:1, height:6, background:'var(--border)', borderRadius:3 }}>
                      <div style={{ height:'100%', width:`${(d.pct / maxPct) * 100}%`, background:isPeak ? catColor : d.pct > 0 ? catColor + '70' : 'transparent', borderRadius:3, transition:'width .4s' }} />
                    </div>
                    <div style={{ fontSize:12, fontWeight:isPeak ? 700 : 600, color:isPeak ? catColor : 'var(--text-2)', minWidth:30, textAlign:'right' }}>{d.pct}%</div>
                  </div>
                )
              })}
            </div>
          </div>

          <BreakdownTable title="Fertility Summary" rows={[
            { label:'Fertile window', value:`${fmtShort(winStart)} – ${fmtShort(winEnd)}`, bold:true, highlight:true, color:catColor },
            { label:'Ovulation date', value:fmtDate(ovulation), color:catColor },
            { label:'Peak days', value:`${fmtShort(addDays(ovulation,-2))} & ${fmtShort(addDays(ovulation,-1))}` },
            { label:'Days to ovulation', value:daysToOv > 0 ? `${daysToOv} days` : daysToOv === 0 ? 'Today' : `${Math.abs(daysToOv)}d ago`, color:inWindow ? '#10b981' : catColor },
            { label:'In window now?', value:inWindow ? 'Yes ✓' : 'No', color:inWindow ? '#10b981' : 'var(--text-3)' },
            { label:'Age group', value:ageBenchmark.label, color:catColor },
            { label:'Chance per cycle', value:`~${ageBenchmark.value}%` },
            { label:'Next period', value:fmtDate(nextPeriod) },
          ]} />

          <AIHintCard hint={hint} />
        </>}
      />

      <FertilityInsightSection
        ovulation={ovulation}
        winStart={winStart}
        winEnd={winEnd}
        inWindow={inWindow}
        daysToOv={daysToOv}
        ovulationDay={ovulationDay}
        cycleLen={cycleLen}
        catColor={catColor}
      />

      <BestDaysSection
        ovulation={ovulation}
        catColor={catColor}
      />

      <CycleTimelineSection
        lmp={lmp}
        ovulation={ovulation}
        nextPeriod={nextPeriod}
        winStart={winStart}
        winEnd={winEnd}
        catColor={catColor}
      />

      <Sec title="3-cycle forecast" sub="Predicted fertile windows for the next 3 cycles">
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {[0, 1, 2].map(i => {
            const cLmp = addDays(lmp, i * cycleLen)
            const cOv = addDays(cLmp, ovulationDay)
            const cWinS = addDays(cOv, -5)
            const cWinE = addDays(cOv, 1)
            const isNow = today >= cWinS && today <= cWinE
            return (
              <div key={i} style={{ padding:'12px 14px', borderRadius:10, background:isNow ? catColor + '12' : 'var(--bg-raised)', border:`${isNow ? '1.5' : '0.5'}px solid ${isNow ? catColor : 'var(--border)'}` }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                  <span style={{ fontSize:13, fontWeight:700, color:isNow ? catColor : 'var(--text)' }}>
                    Cycle {i + 1} {isNow ? '← current' : ''}
                  </span>
                  <span style={{ fontSize:11, color:'var(--text-3)' }}>Period: {fmtShort(cLmp)}</span>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
                  {[
                    { l:'Window opens', d:fmtShort(cWinS) },
                    { l:'Ovulation', d:fmtShort(cOv) },
                    { l:'Window closes', d:fmtShort(cWinE) },
                  ].map((r, j) => (
                    <div key={j} style={{ textAlign:'center', padding:'6px', background:'var(--bg-card)', borderRadius:7, border:'0.5px solid var(--border)' }}>
                      <div style={{ fontSize:9, color:'var(--text-3)', marginBottom:2 }}>{r.l}</div>
                      <div style={{ fontSize:12, fontWeight:700, color:isNow ? catColor : 'var(--text)' }}>{r.d}</div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </Sec>

      <Sec title="Conception probability by age" sub="Per-cycle rates for healthy couples">
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          {AGE_BENCHMARKS.map((b, i) => {
            const isYours = b.label === ageBenchmark.label
            return (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'9px 13px', borderRadius:8, background:isYours ? catColor + '12' : 'var(--bg-raised)', border:`${isYours ? '1.5' : '0.5'}px solid ${isYours ? catColor : 'var(--border)'}` }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:12, fontWeight:isYours ? 700 : 500, color:isYours ? catColor : 'var(--text)' }}>{b.label}</div>
                  <div style={{ fontSize:10, color:'var(--text-3)' }}>{b.note}</div>
                </div>
                <div style={{ width:100, height:5, background:'var(--border)', borderRadius:3 }}>
                  <div style={{ height:'100%', width:`${(b.value / 30) * 100}%`, background:isYours ? catColor : catColor + '50', borderRadius:3 }} />
                </div>
                <div style={{ fontSize:13, fontWeight:700, color:isYours ? catColor : 'var(--text-2)', minWidth:35, textAlign:'right' }}>~{b.value}%</div>
                {isYours && <div style={{ fontSize:9, fontWeight:700, background:catColor + '18', color:catColor, padding:'2px 7px', borderRadius:6 }}>YOU</div>}
              </div>
            )
          })}
        </div>
      </Sec>

      <AccuracySection catColor={catColor} />

      <DoctorSection />

      <Sec title="Frequently asked questions" sub="Everything about the fertile window">
        {FAQ.map((f, i) => (
          <Acc key={i} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} catColor={catColor} />
        ))}
      </Sec>
    </div>
  )
}