import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'

const clamp = (v,a,b) => Math.min(b, Math.max(a, v))

const CYCLE_MIN   = 90
const FALL_ASLEEP = 15  // avg minutes to fall asleep

const FAQ = [
  { q:'Why wake between sleep cycles?',
    a:"Each 90-minute sleep cycle ends in a period of lighter sleep before the next cycle begins. Waking during this window feels natural and refreshed. Waking mid-cycle — especially from deep N3 sleep — causes sleep inertia: grogginess and disorientation that can last 30–60 minutes and temporarily impairs cognitive performance below pre-sleep baseline." },
  { q:'How many sleep cycles do I need?',
    a:'Most adults function best with 5 complete cycles (7.5 hours). 4 cycles (6 hours) is the minimum for basic function but accumulates sleep debt over time. 6 cycles (9 hours) is ideal for recovery, illness, or intense training periods. The key is completing whole cycles rather than stopping mid-cycle.' },
  { q:'What if I naturally wake at a different time?',
    a:"Your body naturally wakes at the lightest point in a cycle when possible — this is why you sometimes wake before your alarm feeling refreshed, or why hitting snooze and drifting back into deep sleep makes you feel worse. Alarm timing, light, temperature, and bladder pressure all influence natural wake points. A consistent sleep schedule trains your body to reach light sleep at your target wake time." },
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

const fmtTime = totalMin => {
  const h = Math.floor(((totalMin % 1440) + 1440) % 1440 / 60)
  const m = ((totalMin % 1440) + 1440) % 1440 % 60
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`
}

const CYCLE_COLORS = ['#94a3b8','#3b82f6','#8b5cf6','#ec4899','#f97316','#10b981']

export default function SleepCycleCalculator({ meta, category }) {
  const catColor   = category?.color || '#8b5cf6'
  const [mode,     setMode]    = useState('bedtime')  // 'bedtime' or 'wakeup'
  const [hour,     setHour]    = useState(mode === 'bedtime' ? 23 : 7)
  const [min,      setMin]     = useState(0)
  const [openFaq,  setOpenFaq] = useState(null)

  const inputMin = hour * 60 + min
  const cycles   = [4, 5, 6]

  const wakeTimes = cycles.map(n => ({
    cycles: n,
    hours:  (n * CYCLE_MIN + FALL_ASLEEP) / 60,
    wakeMin: mode === 'bedtime'
      ? (inputMin + FALL_ASLEEP + n * CYCLE_MIN)
      : inputMin - (FALL_ASLEEP + n * CYCLE_MIN),
    color: CYCLE_COLORS[n - 1],
  }))

  const bedTimes = cycles.map(n => ({
    cycles:  n,
    hours:   (n * CYCLE_MIN + FALL_ASLEEP) / 60,
    bedMin:  mode === 'wakeup'
      ? inputMin - (FALL_ASLEEP + n * CYCLE_MIN)
      : inputMin,
    color: CYCLE_COLORS[n - 1],
  }))

  const results = wakeTimes

  const hint = mode === 'bedtime'
    ? `Bedtime ${fmtTime(inputMin)}. Best wake times: ${results.map(r => fmtTime(r.wakeMin)).join(', ')} (${cycles.join('/')} cycles).`
    : `Wake time ${fmtTime(inputMin)}. Best bedtimes: ${results.map(r => fmtTime(inputMin - (FALL_ASLEEP + r.cycles * CYCLE_MIN))).join(', ')}.`

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <CalcShell
        left={<>
          {/* Mode toggle */}
          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:12, fontWeight:600, color:'var(--text-2)', marginBottom:8, fontFamily:"'DM Sans',sans-serif" }}>I want to calculate</div>
            <div style={{ display:'flex', gap:8 }}>
              {[{ v:'bedtime', l:'When to wake up' }, { v:'wakeup', l:'When to go to bed' }].map(o => (
                <button key={o.v} onClick={() => setMode(o.v)} style={{ flex:1, padding:'10px 6px', borderRadius:9, border:`1.5px solid ${mode === o.v ? catColor : 'var(--border-2)'}`, background:mode === o.v ? catColor + '12' : 'var(--bg-raised)', fontSize:11, fontWeight:mode === o.v ? 700 : 500, color:mode === o.v ? catColor : 'var(--text-2)', cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>{o.l}</button>
              ))}
            </div>
          </div>

          <div style={{ borderTop:'0.5px solid var(--border)', paddingTop:16 }}>
            <div style={{ fontSize:12, fontWeight:600, color:'var(--text-2)', marginBottom:10, fontFamily:"'DM Sans',sans-serif" }}>
              {mode === 'bedtime' ? 'I plan to go to bed at' : 'I need to wake up at'}
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              {[{ label:'Hour', val:hour, set:setHour, max:23 }, { label:'Minute', val:min, set:setMin, max:59, step:5 }].map((f, i) => {
                const [editing, setEditing] = useState(false)
                const btn = { width:38, height:'100%', border:'none', background:'var(--bg-raised)', color:'var(--text)', fontSize:20, fontWeight:300, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }
                return (
                  <div key={i} style={{ marginBottom:0 }}>
                    <label style={{ fontSize:12, fontWeight:600, color:'var(--text)', fontFamily:"'DM Sans',sans-serif", display:'block', marginBottom:6 }}>{f.label}</label>
                    <div style={{ display:'flex', alignItems:'stretch', height:40, border:`1.5px solid ${editing ? catColor : 'var(--border-2)'}`, borderRadius:9, overflow:'hidden', background:'var(--bg-card)', transition:'border-color .15s' }}>
                      <button onMouseDown={e => { e.preventDefault(); f.set(v => ((v - (f.step||1) + f.max + 1) % (f.max + 1))) }} style={{ ...btn, borderRight:'1px solid var(--border)' }} onMouseEnter={e => e.currentTarget.style.background = catColor+'18'} onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-raised)'}>−</button>
                      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, fontWeight:700, color:'var(--text)' }}>{String(f.val).padStart(2,'0')}</div>
                      <button onMouseDown={e => { e.preventDefault(); f.set(v => (v + (f.step||1)) % (f.max + 1)) }} style={{ ...btn, borderLeft:'1px solid var(--border)' }} onMouseEnter={e => e.currentTarget.style.background = catColor+'18'} onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-raised)'}>+</button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div style={{ marginTop:16, padding:'10px 12px', background:catColor + '10', borderRadius:9, border:`1px solid ${catColor}25` }}>
            <div style={{ fontSize:11, color:'var(--text-3)', lineHeight:1.6 }}>
              Includes <strong style={{ color:catColor }}>~{FALL_ASLEEP} min</strong> to fall asleep. Each cycle is <strong style={{ color:catColor }}>{CYCLE_MIN} min</strong>.
            </div>
          </div>

          <div style={{ borderTop:'0.5px solid var(--border)', paddingTop:14, marginTop:16 }}>
            <div style={{ fontSize:12, fontWeight:600, color:'var(--text-2)', marginBottom:10, fontFamily:"'DM Sans',sans-serif" }}>Quick bedtime presets</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:6 }}>
              {[{ l:'10:00 PM', h:22, m:0 }, { l:'10:30 PM', h:22, m:30 }, { l:'11:00 PM', h:23, m:0 }, { l:'11:30 PM', h:23, m:30 }, { l:'12:00 AM', h:0, m:0 }, { l:'12:30 AM', h:0, m:30 }].map((p, i) => (
                <button key={i} onClick={() => { setHour(p.h); setMin(p.m) }} style={{ padding:'7px 4px', borderRadius:7, fontSize:10, fontWeight:hour === p.h && min === p.m ? 700 : 400, color:hour === p.h && min === p.m ? catColor : 'var(--text-2)', border:`1px solid ${hour === p.h && min === p.m ? catColor : 'var(--border)'}`, background:hour === p.h && min === p.m ? catColor + '12' : 'var(--bg-raised)', cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>{p.l}</button>
              ))}
            </div>
          </div>
        </>}
        right={<>
          {/* Results */}
          <div style={{ background:'var(--bg-card)', border:'0.5px solid var(--border)', borderRadius:14, overflow:'hidden', marginBottom:14 }}>
            <div style={{ padding:'11px 16px', borderBottom:'0.5px solid var(--border)', display:'flex', justifyContent:'space-between' }}>
              <span style={{ fontSize:12, fontWeight:700, color:'var(--text)', fontFamily:"'Space Grotesk',sans-serif" }}>
                {mode === 'bedtime' ? 'Best wake-up times' : 'Best bedtimes'}
              </span>
              <span style={{ fontSize:10, color:'var(--text-3)' }}>Based on 90-min cycles</span>
            </div>
            <div style={{ padding:'16px 18px' }}>
              <p style={{ fontSize:11, color:'var(--text-3)', lineHeight:1.6, marginBottom:14 }}>
                {mode === 'bedtime'
                  ? `If you fall asleep at ${fmtTime(inputMin)}, set your alarm for one of these times to wake between cycles — not mid-cycle.`
                  : `To wake at ${fmtTime(inputMin)} feeling refreshed, go to bed at one of these times.`}
              </p>
              {results.map((r, i) => {
                const displayTime = mode === 'bedtime' ? fmtTime(r.wakeMin) : fmtTime(inputMin - (FALL_ASLEEP + r.cycles * CYCLE_MIN))
                const isRecommended = r.cycles === 5
                return (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:14, padding:'12px 14px', borderRadius:10, background:isRecommended ? r.color + '12' : 'var(--bg-raised)', border:`${isRecommended ? '1.5' : '0.5'}px solid ${isRecommended ? r.color : 'var(--border)'}`, marginBottom:8 }}>
                    <div style={{ fontSize:28, fontWeight:700, color:r.color, fontFamily:"'Space Grotesk',sans-serif", minWidth:70 }}>{displayTime}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:12, fontWeight:isRecommended ? 700 : 500, color:isRecommended ? r.color : 'var(--text)' }}>
                        {r.cycles} cycles · {r.hours.toFixed(1)}h sleep
                        {isRecommended && <span style={{ fontSize:9, fontWeight:700, background:r.color + '18', color:r.color, padding:'1px 6px', borderRadius:5, marginLeft:6 }}>IDEAL</span>}
                      </div>
                      <div style={{ fontSize:10, color:'var(--text-3)', marginTop:2 }}>
                        {r.cycles === 4 ? 'Minimum — may build sleep debt' : r.cycles === 5 ? 'Optimal for most adults' : 'Best for recovery / heavy training'}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          <BreakdownTable title="Sleep Cycle Summary" rows={[
            { label:mode === 'bedtime' ? 'Bedtime' : 'Wake time', value:fmtTime(inputMin),                    bold:true, highlight:true, color:catColor },
            { label:'Fall asleep',   value:`~${FALL_ASLEEP} min` },
            { label:'4 cycles (min)',value:`${fmtTime(mode === 'bedtime' ? results[0].wakeMin : inputMin - (FALL_ASLEEP + 4*CYCLE_MIN))} · 6h` },
            { label:'5 cycles (opt)',value:`${fmtTime(mode === 'bedtime' ? results[1].wakeMin : inputMin - (FALL_ASLEEP + 5*CYCLE_MIN))} · 7.5h`, color:catColor },
            { label:'6 cycles (max)',value:`${fmtTime(mode === 'bedtime' ? results[2].wakeMin : inputMin - (FALL_ASLEEP + 6*CYCLE_MIN))} · 9h` },
          ]}/>
          <AIHintCard hint={hint}/>
        </>}
      />

      {/* 🎯 INTERACTIVE — Find your optimal sleep schedule */}
      <Sec title="🎯 Find your perfect sleep window" sub="Dial in your schedule around your real life">
        <p style={{ fontSize:12, color:'var(--text-2)', lineHeight:1.7, marginBottom:14, fontFamily:"'DM Sans',sans-serif" }}>
          Most people have a fixed wake time (work, kids, commute). Work backwards from your wake time to find the bedtime that lines up with a full cycle.
        </p>
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          {[5, 6, 7, 8].map(wakeH => {
            const wakeMin = wakeH * 60
            return [4, 5, 6].map(nc => {
              const bedMin  = wakeMin - (FALL_ASLEEP + nc * CYCLE_MIN)
              const hrs     = (nc * CYCLE_MIN + FALL_ASLEEP) / 60
              const isIdeal = nc === 5
              return (
                <div key={`${wakeH}-${nc}`} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 13px', borderRadius:8, background:isIdeal ? catColor + '08' : 'var(--bg-raised)', border:`0.5px solid ${isIdeal ? catColor + '30' : 'var(--border)'}` }}>
                  <div style={{ width:65, fontSize:11, fontWeight:600, color:'var(--text-3)', flexShrink:0 }}>Wake {fmtTime(wakeMin)}</div>
                  <div style={{ flex:1, fontSize:12, fontWeight:isIdeal ? 700 : 400, color:isIdeal ? catColor : 'var(--text)' }}>Bed at {fmtTime(bedMin)}</div>
                  <div style={{ fontSize:10, color:'var(--text-3)' }}>{nc} cycles · {hrs.toFixed(1)}h</div>
                  {isIdeal && <div style={{ fontSize:9, fontWeight:700, color:catColor, background:catColor+'18', padding:'1px 6px', borderRadius:5, flexShrink:0 }}>✓</div>}
                </div>
              )
            })
          })}
        </div>
      </Sec>

      {/* 🧠 INTERESTING — Sleep cycle architecture */}
      <Sec title="How sleep cycles actually change through the night" sub="Early vs late cycle differences">
        <p style={{ fontSize:12, color:'var(--text-2)', lineHeight:1.7, marginBottom:14, fontFamily:"'DM Sans',sans-serif" }}>
          Not all 90-minute cycles are equal. The proportions of deep sleep and REM sleep shift dramatically across the night — which is why cutting sleep short loses disproportionately more of one type.
        </p>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:14 }}>
          {[
            { label:'Cycles 1–2 (first 3h)',  n3:'60%', rem:'10%', color:'#8b5cf6', note:'Dominated by deep N3 sleep — physical restoration, immune function, growth hormone' },
            { label:'Cycles 4–5 (last 3h)',   n3:'15%', rem:'50%', color:'#ec4899', note:'Dominated by REM — memory consolidation, emotional processing, creativity' },
          ].map((s, i) => (
            <div key={i} style={{ padding:'12px', borderRadius:10, background:'var(--bg-raised)', border:'0.5px solid var(--border)' }}>
              <div style={{ fontSize:11, fontWeight:700, color:s.color, marginBottom:8 }}>{s.label}</div>
              <div style={{ marginBottom:5 }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, marginBottom:2 }}>
                  <span style={{ color:'var(--text-3)' }}>Deep (N3)</span><span style={{ fontWeight:700, color:'#8b5cf6' }}>{s.n3}</span>
                </div>
                <div style={{ height:4, background:'var(--border)', borderRadius:2 }}>
                  <div style={{ height:'100%', width:s.n3, background:'#8b5cf6', borderRadius:2 }}/>
                </div>
              </div>
              <div>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, marginBottom:2 }}>
                  <span style={{ color:'var(--text-3)' }}>REM</span><span style={{ fontWeight:700, color:'#ec4899' }}>{s.rem}</span>
                </div>
                <div style={{ height:4, background:'var(--border)', borderRadius:2 }}>
                  <div style={{ height:'100%', width:s.rem, background:'#ec4899', borderRadius:2 }}/>
                </div>
              </div>
              <div style={{ fontSize:10, color:'var(--text-3)', lineHeight:1.5, marginTop:8 }}>{s.note}</div>
            </div>
          ))}
        </div>
        <div style={{ padding:'11px 14px', background:catColor + '10', borderRadius:10, border:`1px solid ${catColor}25` }}>
          <div style={{ fontSize:11.5, color:'var(--text-2)', lineHeight:1.65 }}>
            Sleeping 6 hours instead of 8 does not lose 25% of all sleep types equally — it cuts 60–90% of your REM sleep, because REM is concentrated in the final cycles. This is why short sleepers feel mentally foggy even when they feel physically rested.
          </div>
        </div>
      </Sec>

      {/* ⚡ FUN FACT */}
      <Sec title="⚡ Sleep cycle facts worth knowing">
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {[
            { f:'Dolphins and some whales practice unihemispheric sleep — one brain hemisphere sleeps while the other stays awake, allowing them to keep swimming and surface for air. Birds near predators do the same.', icon:'🐬' },
            { f:"The word 'alarm' comes from the Italian all'arme — 'to arms!' — used to call sleeping soldiers to battle. Historically, being woken abruptly was associated with danger. Your body hasn't caught up with the idea that it's just a meeting.", icon:'⏰' },
            { f:'During REM sleep, your body is temporarily paralysed (REM atonia) — a mechanism to prevent you from physically acting out dreams. Sleep disorders that impair this system cause REM sleep behaviour disorder, where people physically enact their dreams.', icon:'😴' },
            { f:'Teenagers are not lazy — they are biologically programmed to shift their sleep cycle 2–3 hours later during puberty (delayed sleep phase), making 7 AM school starts equivalent to 4–5 AM for adults.', icon:'🧑' },
          ].map((f, i) => (
            <div key={i} style={{ display:'flex', gap:12, padding:'11px 14px', borderRadius:9, background:'var(--bg-raised)', border:'0.5px solid var(--border)' }}>
              <span style={{ fontSize:18, flexShrink:0 }}>{f.icon}</span>
              <p style={{ fontSize:12, color:'var(--text-2)', lineHeight:1.65, margin:0 }}>{f.f}</p>
            </div>
          ))}
        </div>
      </Sec>

      <Sec title="Frequently asked questions" sub="Sleep cycles explained">
        {FAQ.map((f, i) => (<Acc key={i} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} catColor={catColor} />))}
      </Sec>
    </div>
  )
}
