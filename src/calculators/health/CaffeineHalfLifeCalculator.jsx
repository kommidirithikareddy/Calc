import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'

const clamp = (v,a,b) => Math.min(b, Math.max(a, v))

const HALF_LIFE_PRESETS = [
  { v:3,   l:'Fast metaboliser',  d:'CYP1A2 fast — genetic trait, ~10% of people'                           },
  { v:5.5, l:'Average',           d:'Population average — most people fall here'                             },
  { v:7,   l:'Slow metaboliser',  d:'CYP1A2 slow — genetic trait'                                           },
  { v:10,  l:'Pregnant / pill',   d:'Oral contraceptives or pregnancy extends half-life significantly'        },
]

const CAFFEINE_SOURCES = [
  { name:'Espresso (30ml)',       mg:63,  icon:'☕', color:'#92400e' },
  { name:'Drip coffee (240ml)',   mg:150, icon:'☕', color:'#78350f' },
  { name:'Americano',             mg:126, icon:'☕', color:'#92400e' },
  { name:'Latte / cappuccino',    mg:75,  icon:'☕', color:'#b45309' },
  { name:'Matcha latte',          mg:70,  icon:'🍵', color:'#15803d' },
  { name:'Green tea (240ml)',     mg:28,  icon:'🍵', color:'#16a34a' },
  { name:'Black tea (240ml)',     mg:47,  icon:'🍵', color:'#92400e' },
  { name:'Energy drink (250ml)', mg:80,  icon:'⚡', color:'#ca8a04' },
  { name:'Pre-workout (1 scoop)',mg:200, icon:'💪', color:'#dc2626' },
  { name:'Cola (330ml)',          mg:35,  icon:'🥤', color:'#7c3aed' },
]

const FAQ = [
  { q:'What is caffeine half-life?',
    a:'The time for blood caffeine concentration to reduce by 50%. The average is 5–6 hours but ranges from 3–9 hours depending on CYP1A2 genetics. Pregnancy triples half-life; oral contraceptives extend it by ~50%; smoking shortens it by 30–50%. After 5 half-lives, caffeine is considered functionally eliminated.' },
  { q:'How does caffeine affect sleep quality?',
    a:'Caffeine blocks adenosine receptors and reduces slow-wave deep sleep and REM sleep even if you fall asleep normally. A 2013 study showed 400mg 6 hours before bedtime reduced total sleep time by over 1 hour. The cut-off time varies by individual — sensitive people should stop by noon; fast metabolisers may tolerate afternoon coffee.' },
  { q:'Why do I feel a crash even when caffeine is still in my system?',
    a:'The "caffeine crash" is caused by adenosine, not caffeine running out. Caffeine does not clear adenosine — it just blocks its receptors. While caffeine is active, adenosine continues building up behind the blockade. When caffeine wears off (or during the waning phase), the queued adenosine floods its receptors all at once, causing a sudden drop in alertness that feels worse than baseline.' },
  { q:'Does tolerance reduce the half-life?',
    a:'No — caffeine tolerance does not change the half-life. Tolerance is caused by the brain upregulating adenosine receptors to compensate for chronic blockade. The same amount of caffeine stays in your blood for the same duration, but produces less subjective alertness. This is why regular coffee drinkers can drink coffee late and still sleep — their sensitivity has decreased, not the pharmacokinetics.' },
]

const fmtH = h => `${Math.floor(((h % 24) + 24) % 24)}:${String(Math.round(((h % 24) + 24) % 24 % 1 * 60)).padStart(2,'0')}`
const fmtHour = h => {
  const hh = ((h % 24) + 24) % 24
  return `${String(Math.floor(hh)).padStart(2,'0')}:${String(Math.round((hh % 1) * 60)).padStart(2,'0')}`
}

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

// SVG decay curve
function DecayCurve({ mg, consumedHour, halfLife, bedtimeHour, catColor }) {
  const W = 560, H = 160, padL = 38, padR = 16, padT = 14, padB = 28
  const innerW = W - padL - padR
  const innerH = H - padT - padB
  const totalHours = 24
  const steps = 120

  // Generate curve points
  const points = Array.from({ length:steps + 1 }, (_, i) => {
    const t = (i / steps) * totalHours
    const hoursAfter = t - consumedHour
    const mgVal = hoursAfter >= 0 ? mg * Math.pow(0.5, hoursAfter / halfLife) : 0
    const x = padL + (t / totalHours) * innerW
    const y = padT + innerH - (mgVal / mg) * innerH
    return `${x},${y}`
  })

  // Bedtime position
  const bedX = padL + (bedtimeHour / totalHours) * innerW
  const mgAtBed = bedtimeHour > consumedHour ? mg * Math.pow(0.5, (bedtimeHour - consumedHour) / halfLife) : 0
  const bedY = padT + innerH - (mgAtBed / mg) * innerH

  // Now position
  const now = new Date()
  const nowH = now.getHours() + now.getMinutes() / 60
  const nowX = padL + (nowH / totalHours) * innerW
  const hoursAgo = clamp(nowH - consumedHour, 0, 24)
  const mgNow = mg * Math.pow(0.5, hoursAgo / halfLife)
  const nowY = padT + innerH - (mgNow / mg) * innerH

  // 50mg "sleep disruption" threshold line
  const threshY = padT + innerH - (50 / mg) * innerH
  const threshValid = 50 < mg

  // X-axis labels
  const xLabels = [0, 6, 12, 18, 24]

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display:'block', overflow:'visible' }}>
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
        const y = padT + innerH * (1 - pct)
        return (
          <g key={i}>
            <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="var(--border)" strokeWidth="0.5" strokeDasharray="3,4" />
            <text x={padL - 4} y={y + 3.5} textAnchor="end" fontSize="8" fill="var(--text-3)">{Math.round(mg * pct)}</text>
          </g>
        )
      })}

      {/* 50mg threshold line */}
      {threshValid && (
        <g>
          <line x1={padL} y1={threshY} x2={W - padR} y2={threshY} stroke="#f59e0b" strokeWidth="1" strokeDasharray="4,3" />
          <text x={padL + 4} y={threshY - 4} fontSize="8" fill="#f59e0b">50mg — sleep disruption zone</text>
        </g>
      )}

      {/* Shaded area under curve */}
      <path
        d={`M ${padL + (consumedHour / totalHours) * innerW},${padT + innerH} ${points.filter((_, i) => i >= Math.round((consumedHour / totalHours) * steps)).join(' L ')} L ${W - padR},${padT + innerH} Z`}
        fill={catColor}
        fillOpacity="0.08"
      />

      {/* Curve */}
      <polyline
        points={points.join(' ')}
        fill="none"
        stroke={catColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Bedtime marker */}
      {bedtimeHour > consumedHour && (
        <g>
          <line x1={bedX} y1={padT} x2={bedX} y2={padT + innerH} stroke="#8b5cf6" strokeWidth="1.5" strokeDasharray="3,3" />
          <circle cx={bedX} cy={bedY} r="4" fill="#8b5cf6" />
          <text x={bedX + 5} y={padT + 10} fontSize="8" fill="#8b5cf6">😴 Bed</text>
          <text x={bedX + 5} y={padT + 19} fontSize="7.5" fill="var(--text-3)">{Math.round(mgAtBed)}mg</text>
        </g>
      )}

      {/* Now marker */}
      {nowH > consumedHour && nowH < consumedHour + 24 && (
        <g>
          <line x1={nowX} y1={padT} x2={nowX} y2={padT + innerH} stroke={catColor} strokeWidth="1.5" strokeDasharray="3,3" opacity="0.7" />
          <circle cx={nowX} cy={nowY} r="5" fill={catColor} />
          <text x={nowX + 6} y={nowY - 4} fontSize="8" fill={catColor}>Now</text>
          <text x={nowX + 6} y={nowY + 5} fontSize="7.5" fill="var(--text-3)">{Math.round(mgNow)}mg</text>
        </g>
      )}

      {/* X axis */}
      <line x1={padL} y1={padT + innerH} x2={W - padR} y2={padT + innerH} stroke="var(--border)" strokeWidth="0.8" />
      {xLabels.map(h => (
        <text key={h} x={padL + (h / totalHours) * innerW} y={H - 5} textAnchor="middle" fontSize="8" fill="var(--text-3)">{String(h).padStart(2,'0')}:00</text>
      ))}

      {/* Consumed marker */}
      <g>
        <line x1={padL + (consumedHour / totalHours) * innerW} y1={padT} x2={padL + (consumedHour / totalHours) * innerW} y2={padT + innerH} stroke={catColor} strokeWidth="1" strokeDasharray="2,3" opacity="0.5" />
        <text x={padL + (consumedHour / totalHours) * innerW} y={padT - 3} textAnchor="middle" fontSize="7.5" fill={catColor}>☕ {fmtHour(consumedHour)}</text>
      </g>
    </svg>
  )
}

export default function CaffeineHalfLifeCalculator({ meta, category }) {
  const catColor       = category?.color || '#f97316'
  const [mg,           setMg]          = useState(200)
  const [halfLife,     setHalfLife]    = useState(5.5)
  const [consumedHour, setConsumedHour]= useState(8)
  const [bedtimeHour,  setBedtimeHour] = useState(23)
  const [openFaq,      setOpenFaq]     = useState(null)

  const now         = new Date()
  const nowH        = now.getHours() + now.getMinutes() / 60
  const hoursAgo    = clamp(nowH - consumedHour, 0, 24)
  const activeMg    = mg * Math.pow(0.5, hoursAgo / halfLife)
  const mgAtBedtime = mg * Math.pow(0.5, (bedtimeHour - consumedHour) / halfLife)
  const clearHours  = (Math.log(mg / 10) / Math.log(2)) * halfLife
  const clearTime   = (consumedHour + clearHours) % 24
  const maxVal      = mg * 1.05

  const hint = `${mg}mg caffeine (half-life ${halfLife}h). Active now: ~${Math.round(activeMg)}mg. At bedtime (${bedtimeHour}:00): ~${Math.round(mgAtBedtime)}mg. Functionally clear by ~${fmtHour(clearTime)}.`

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

      {/* ── MAIN CALC ── */}
      <CalcShell
        left={<>
          <div style={{ fontSize:10, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:14 }}>Caffeine details</div>
          <Stepper label="Caffeine consumed" value={mg} onChange={setMg} min={10} max={800} step={10} unit="mg" hint="Coffee: 60–150mg" catColor={catColor} />
          <Stepper label="Time consumed (hour)" value={consumedHour} onChange={setConsumedHour} min={0} max={23} unit="hr" catColor={catColor} />
          <Stepper label="Bedtime (hour)" value={bedtimeHour} onChange={setBedtimeHour} min={18} max={3} unit="hr" catColor={catColor} />
          <div style={{ borderTop:'0.5px solid var(--border)', paddingTop:16, marginTop:4 }}>
            <div style={{ fontSize:12, fontWeight:600, color:'var(--text-2)', marginBottom:8, fontFamily:"'DM Sans',sans-serif" }}>Your metabolism type</div>
            {HALF_LIFE_PRESETS.map(o => (
              <button key={o.v} onClick={() => setHalfLife(o.v)} style={{ display:'flex', flexDirection:'column', width:'100%', padding:'9px 13px', borderRadius:8, border:`1.5px solid ${halfLife === o.v ? catColor : 'var(--border-2)'}`, background:halfLife === o.v ? catColor + '12' : 'var(--bg-raised)', cursor:'pointer', textAlign:'left', marginBottom:5, fontFamily:"'DM Sans',sans-serif" }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ fontSize:12, fontWeight:600, color:halfLife === o.v ? catColor : 'var(--text)' }}>{o.l}</span>
                  <span style={{ fontSize:11, fontWeight:700, color:halfLife === o.v ? catColor : 'var(--text-3)' }}>{o.v}h</span>
                </div>
                <span style={{ fontSize:10, color:'var(--text-3)', marginTop:2 }}>{o.d}</span>
              </button>
            ))}
          </div>
        </>}
        right={<>
          {/* Comparison Ticker */}
          <div style={{ background:'var(--bg-card)', border:'0.5px solid var(--border)', borderRadius:14, overflow:'hidden', marginBottom:14 }}>
            <div style={{ padding:'11px 16px', borderBottom:'0.5px solid var(--border)', display:'flex', justifyContent:'space-between' }}>
              <span style={{ fontSize:12, fontWeight:700, color:'var(--text)', fontFamily:"'Space Grotesk',sans-serif" }}>Caffeine Half-Life</span>
              <span style={{ fontSize:10, color:'var(--text-3)' }}>Decay over time</span>
            </div>
            <div style={{ padding:'16px 18px' }}>
              <div style={{ display:'flex', alignItems:'flex-end', gap:12, marginBottom:14 }}>
                <div>
                  <div style={{ fontSize:48, fontWeight:700, lineHeight:1, color:catColor, fontFamily:"'Space Grotesk',sans-serif" }}>{Math.round(activeMg)}</div>
                  <div style={{ fontSize:11, color:'var(--text-3)', marginTop:3 }}>mg active right now</div>
                </div>
                <div style={{ paddingBottom:4 }}>
                  <div style={{ fontSize:11, color:'var(--text-3)' }}>At bedtime: ~{Math.round(mgAtBedtime)}mg</div>
                  <div style={{ fontSize:11, color:'var(--text-3)', marginTop:2 }}>Clear by: ~{fmtHour(clearTime)}</div>
                </div>
              </div>
              {/* your bar */}
              <div style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 12px', borderRadius:8, background:catColor + '12', border:`1.5px solid ${catColor}`, marginBottom:6 }}>
                <div style={{ width:110, fontSize:11, fontWeight:700, color:catColor, flexShrink:0 }}>Active now</div>
                <div style={{ flex:1, height:7, background:'var(--border)', borderRadius:3 }}>
                  <div style={{ height:'100%', width:`${(activeMg / maxVal) * 100}%`, background:catColor, borderRadius:3, transition:'width .5s' }} />
                </div>
                <div style={{ fontSize:12, fontWeight:700, color:catColor, minWidth:45, textAlign:'right' }}>{Math.round(activeMg)}mg</div>
              </div>
              {/* decay rows */}
              {[1, 2, 3, 4, 5].map(hl => {
                const hoursLater = hl * halfLife
                const mgLeft     = mg * Math.pow(0.5, hl)
                const timeLabel  = fmtHour((consumedHour + hoursLater) % 24)
                const isBed      = Math.abs((consumedHour + hoursLater) % 24 - bedtimeHour) < 0.5
                return (
                  <div key={hl} style={{ display:'flex', alignItems:'center', gap:10, padding:'7px 12px', borderRadius:8, background:isBed ? '#fef3c730' : 'var(--bg-raised)', border:`0.5px solid ${isBed ? '#f59e0b' : 'var(--border)'}`, marginBottom:4 }}>
                    <div style={{ width:110, flexShrink:0 }}>
                      <div style={{ fontSize:11, color:'var(--text)' }}>{hl} half-life{hl > 1 ? 's' : ''} (+{hoursLater.toFixed(1)}h)</div>
                      <div style={{ fontSize:9, color:'var(--text-3)' }}>~{timeLabel}{isBed ? ' 😴 bedtime' : ''}</div>
                    </div>
                    <div style={{ flex:1, height:5, background:'var(--border)', borderRadius:3 }}>
                      <div style={{ height:'100%', width:`${(mgLeft / maxVal) * 100}%`, background:catColor, opacity:0.5, borderRadius:3 }} />
                    </div>
                    <div style={{ fontSize:11, fontWeight:600, color:'var(--text-2)', minWidth:45, textAlign:'right' }}>{Math.round(mgLeft)}mg</div>
                  </div>
                )
              })}
            </div>
          </div>
          <BreakdownTable title="Half-Life Summary" rows={[
            { label:'Consumed',           value:`${mg}mg at ${fmtHour(consumedHour)}`, bold:true, highlight:true, color:catColor },
            { label:'Active now',         value:`~${Math.round(activeMg)}mg`,          color:catColor },
            { label:'At bedtime',         value:`~${Math.round(mgAtBedtime)}mg`,       color:mgAtBedtime > 50 ? '#ef4444' : '#22a355' },
            { label:'Half-life',          value:`${halfLife}h` },
            { label:'Functionally clear', value:`~${fmtHour(clearTime)}` },
          ]} />
          <AIHintCard hint={hint} />
        </>}
      />

      {/* ── NEW: 24-HOUR DECAY CURVE ── */}
      <Sec title="24-hour decay curve" sub="Visual caffeine timeline">
        <p style={{ fontSize:12, color:'var(--text-2)', lineHeight:1.7, marginBottom:14, fontFamily:"'DM Sans',sans-serif" }}>
          The curve shows exactly how much caffeine is active in your bloodstream across the day. The dotted yellow line marks <strong style={{ color:'#f59e0b' }}>50mg</strong> — the approximate threshold below which caffeine begins to lose meaningful sleep disruption potential.
        </p>
        <div style={{ background:'var(--bg-raised)', borderRadius:10, padding:'14px 12px 8px', border:'0.5px solid var(--border)', overflowX:'auto' }}>
          <DecayCurve mg={mg} consumedHour={consumedHour} halfLife={halfLife} bedtimeHour={bedtimeHour} catColor={catColor} />
        </div>
        <div style={{ display:'flex', gap:16, marginTop:12, flexWrap:'wrap' }}>
          {[
            { color:catColor,  label:`Decay curve (${halfLife}h half-life)`, dot:true },
            { color:'#8b5cf6', label:'Bedtime marker',                        dot:true },
            { color:'#f59e0b', label:'50mg sleep disruption threshold',       dash:true },
          ].map((s, i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:6 }}>
              {s.dot && <div style={{ width:8, height:8, borderRadius:'50%', background:s.color }}/>}
              {s.dash && <div style={{ width:14, height:2, background:s.color, borderRadius:1, borderTop:`2px dashed ${s.color}` }}/>}
              <span style={{ fontSize:10, color:'var(--text-3)' }}>{s.label}</span>
            </div>
          ))}
        </div>
      </Sec>

      {/* ── 🎯 INTERACTIVE — Compare metaboliser types ── */}
      <Sec title="🎯 How your metabolism type changes everything" sub="Same dose, same bedtime — dramatically different results">
        <p style={{ fontSize:12, color:'var(--text-2)', lineHeight:1.7, marginBottom:14, fontFamily:"'DM Sans',sans-serif" }}>
          Same {mg}mg at {fmtHour(consumedHour)}. Same bedtime at {String(bedtimeHour).padStart(2,'0')}:00. Your CYP1A2 genetics determine the rest.
        </p>
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          {HALF_LIFE_PRESETS.map(p => {
            const bed    = Math.max(0, mg * Math.pow(0.5, (bedtimeHour - consumedHour) / p.v))
            const clearH = (Math.log(mg / 10) / Math.log(2)) * p.v
            const clearT = fmtHour((consumedHour + clearH) % 24)
            const isYours= p.v === halfLife
            const bedColor = bed > 100 ? '#ef4444' : bed > 50 ? '#f59e0b' : '#22a355'
            const barW   = (bed / mg) * 100
            return (
              <div key={p.v} style={{ padding:'11px 14px', borderRadius:10, background:isYours ? catColor + '12' : 'var(--bg-raised)', border:`${isYours ? '1.5' : '0.5'}px solid ${isYours ? catColor : 'var(--border)'}` }}>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                  <div style={{ flex:1 }}>
                    <span style={{ fontSize:12, fontWeight:isYours ? 700 : 500, color:isYours ? catColor : 'var(--text)' }}>{p.l} ({p.v}h)</span>
                    <span style={{ fontSize:10, color:'var(--text-3)', marginLeft:8 }}>{p.d.split(' — ')[0]}</span>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontSize:13, fontWeight:700, color:bedColor }}>{Math.round(bed)}mg at bed</div>
                    <div style={{ fontSize:9, color:'var(--text-3)' }}>clear ~{clearT}</div>
                  </div>
                  {isYours && <div style={{ fontSize:9, fontWeight:700, background:catColor + '18', color:catColor, padding:'2px 7px', borderRadius:6, flexShrink:0 }}>YOU</div>}
                </div>
                {/* mini decay bar */}
                <div style={{ height:4, background:'var(--border)', borderRadius:2 }}>
                  <div style={{ height:'100%', width:`${clamp(barW, 0, 100)}%`, background:bedColor, borderRadius:2, transition:'width .4s' }} />
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:9, color:'var(--text-3)', marginTop:3 }}>
                  <span>0mg</span><span>50mg threshold</span><span>{mg}mg</span>
                </div>
              </div>
            )
          })}
        </div>
      </Sec>

      {/* ── NEW: PERSONALISED LAST COFFEE GUIDE ── */}
      <Sec title="Your personalised last coffee time" sub={`For ${mg}mg with bedtime at ${String(bedtimeHour).padStart(2,'0')}:00`}>
        <p style={{ fontSize:12, color:'var(--text-2)', lineHeight:1.7, marginBottom:14, fontFamily:"'DM Sans',sans-serif" }}>
          Based on your {mg}mg dose and {String(bedtimeHour).padStart(2,'0')}:00 bedtime, this table shows the latest time you should consume caffeine to arrive below 50mg at bed — for each metabolism type.
        </p>
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          {HALF_LIFE_PRESETS.map((p, i) => {
            // Solve: mg × 0.5^(t/hl) = 50  →  t = hl × log2(mg/50)
            const hoursNeeded = p.v * Math.log2(mg / 50)
            const cutoffHour  = ((bedtimeHour - hoursNeeded) + 24) % 24
            const isYours     = p.v === halfLife
            const isSafe      = mg <= 50
            const colors      = ['#10b981','#22a355','#f59e0b','#ef4444']
            return (
              <div key={p.v} style={{ display:'flex', alignItems:'center', gap:14, padding:'11px 14px', borderRadius:10, background:isYours ? catColor + '10' : 'var(--bg-raised)', border:`${isYours ? '1.5' : '0.5'}px solid ${isYours ? catColor : 'var(--border)'}` }}>
                <div style={{ width:10, height:10, borderRadius:'50%', background:colors[i], flexShrink:0 }}/>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:12, fontWeight:isYours ? 700 : 500, color:isYours ? catColor : 'var(--text)' }}>{p.l}</div>
                  <div style={{ fontSize:10, color:'var(--text-3)' }}>{p.v}h half-life · needs {hoursNeeded.toFixed(1)}h to clear to 50mg</div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontSize:16, fontWeight:700, color:colors[i], fontFamily:"'Space Grotesk',sans-serif" }}>
                    {isSafe ? 'Any time' : fmtHour(cutoffHour)}
                  </div>
                  <div style={{ fontSize:9, color:'var(--text-3)' }}>last caffeine</div>
                </div>
                {isYours && <div style={{ fontSize:9, fontWeight:700, background:catColor + '18', color:catColor, padding:'2px 7px', borderRadius:6, flexShrink:0 }}>YOU</div>}
              </div>
            )
          })}
        </div>
        <div style={{ marginTop:12, padding:'10px 13px', background:'#fef3c7', borderRadius:10, border:'1px solid #f59e0b30' }}>
          <p style={{ fontSize:11.5, color:'#92400e', margin:0, lineHeight:1.65 }}>
            ⚠️ These cut-off times assume <strong>{mg}mg</strong>. If you have multiple coffees, add their mg together and recalculate. Sensitivity varies — some people notice sleep effects even below 50mg.
          </p>
        </div>
      </Sec>

      {/* ── NEW: CAFFEINE SOURCE REFERENCE ── */}
      <Sec title="Caffeine in common drinks" sub="Know your actual dose before you input it">
        <p style={{ fontSize:12, color:'var(--text-2)', lineHeight:1.7, marginBottom:14, fontFamily:"'DM Sans',sans-serif" }}>
          Most people underestimate their caffeine intake. A "cup of coffee" can mean anywhere from 63mg (espresso) to 200mg (large drip). Use this reference to set your dose accurately above.
        </p>
        <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
          {CAFFEINE_SOURCES.slice().sort((a, b) => b.mg - a.mg).map((s, i) => {
            const barPct = (s.mg / 200) * 100
            const isSelected = Math.abs(s.mg - mg) <= 15
            return (
              <button key={i} onClick={() => setMg(s.mg)} style={{ display:'flex', alignItems:'center', gap:12, padding:'9px 12px', borderRadius:8, background:isSelected ? catColor + '10' : 'var(--bg-raised)', border:`${isSelected ? '1.5' : '0.5'}px solid ${isSelected ? catColor : 'var(--border)'}`, cursor:'pointer', textAlign:'left', width:'100%' }}>
                <span style={{ fontSize:16, flexShrink:0 }}>{s.icon}</span>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:11, fontWeight:isSelected ? 700 : 500, color:isSelected ? catColor : 'var(--text)', marginBottom:3 }}>{s.name}</div>
                  <div style={{ height:4, background:'var(--border)', borderRadius:2 }}>
                    <div style={{ height:'100%', width:`${barPct}%`, background:isSelected ? catColor : s.color, borderRadius:2 }} />
                  </div>
                </div>
                <div style={{ fontSize:13, fontWeight:700, color:isSelected ? catColor : 'var(--text-2)', minWidth:42, textAlign:'right', fontFamily:"'Space Grotesk',sans-serif" }}>{s.mg}mg</div>
                {isSelected && <div style={{ fontSize:9, fontWeight:700, color:catColor, background:catColor + '18', padding:'2px 6px', borderRadius:5, flexShrink:0 }}>SET</div>}
              </button>
            )
          })}
        </div>
        <p style={{ fontSize:11, color:'var(--text-3)', lineHeight:1.65, margin:'12px 0 0', fontFamily:"'DM Sans',sans-serif" }}>
          Tap any drink to set it as your dose. Values are averages — actual caffeine varies by brand, grind, and brew time.
        </p>
      </Sec>

      {/* ── ⚡ FUN FACT ── */}
      <Sec title="⚡ Half-life facts worth knowing">
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {[
            { f:'Smokers metabolise caffeine roughly twice as fast as non-smokers due to CYP1A2 enzyme upregulation from tobacco smoke. Quitting smoking can noticeably increase caffeine sensitivity within weeks.', icon:'🚬' },
            { f:"Caffeine's half-life can reach 15 hours during the third trimester of pregnancy — meaning a morning coffee can still be 25% active the next morning. This is why the NHS recommends limiting caffeine to 200mg/day during pregnancy.", icon:'🤰' },
            { f:'Grapefruit juice inhibits CYP1A2 and can extend caffeine half-life by 50–100%, similar to slow metaboliser genetics. The same applies to fluvoxamine (an antidepressant) which can multiply the half-life by 5×.', icon:'🍊' },
            { f:'Caffeine tolerance is caused by receptor upregulation, not changes in half-life. A habitual coffee drinker has the same caffeine in their blood after 4 cups as a non-drinker — they just have more adenosine receptors, so the same amount does less.', icon:'🧬' },
          ].map((f, i) => (
            <div key={i} style={{ display:'flex', gap:12, padding:'11px 14px', borderRadius:9, background:'var(--bg-raised)', border:'0.5px solid var(--border)' }}>
              <span style={{ fontSize:18, flexShrink:0 }}>{f.icon}</span>
              <p style={{ fontSize:12, color:'var(--text-2)', lineHeight:1.65, margin:0 }}>{f.f}</p>
            </div>
          ))}
        </div>
      </Sec>

      {/* ── FAQ ── */}
      <Sec title="Frequently asked questions">
        {FAQ.map((f, i) => (<Acc key={i} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} catColor={catColor} />))}
      </Sec>

    </div>
  )
}
