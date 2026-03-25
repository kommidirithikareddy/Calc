import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'

const clamp = (v,a,b) => Math.min(b, Math.max(a, v))

const NAP_TYPES = [
  { key:'power',  label:'Power nap',  min:10, color:'#22a355', desc:'Boosts alertness without sleep inertia. Stays in light sleep (N1).', stage:'Light (N1)', inertia:false },
  { key:'short',  label:'Short nap',  min:20, color:'#10b981', desc:'Maximum alertness boost. Best before the afternoon dip.',           stage:'Light (N2)', inertia:false },
  { key:'memory', label:'Memory nap', min:60, color:'#8b5cf6', desc:'Enters deep N3 sleep. Boosts memory consolidation significantly.',  stage:'Deep (N3)',  inertia:true  },
  { key:'full',   label:'Full cycle', min:90, color:'#3b82f6', desc:'One complete sleep cycle including REM. Restores creativity.',      stage:'Full (REM)', inertia:false },
]

const SLEEP_STAGES = [
  { label:'N1',  startMin:0,  endMin:5,  color:'#94a3b8', desc:'Light sleep. Easily woken. Hypnic jerks here.' },
  { label:'N2',  startMin:5,  endMin:20, color:'#3b82f6', desc:'Sleep spindles. Memory consolidation begins.' },
  { label:'N3',  startMin:20, endMin:50, color:'#8b5cf6', desc:'Deep slow-wave. Hardest to wake. Most restorative.' },
  { label:'REM', startMin:50, endMin:90, color:'#ec4899', desc:'Dreaming. Emotional and creativity consolidation.' },
]

// NASA/research alertness boost data (% above baseline after nap vs no nap)
const ALERTNESS_DATA = [
  { key:'power',  label:'10-min',  boost:34, inertia:0,   color:'#22a355' },
  { key:'short',  label:'20-min',  boost:54, inertia:0,   color:'#10b981' },
  { key:'memory', label:'60-min',  boost:40, inertia:30,  color:'#8b5cf6' },
  { key:'full',   label:'90-min',  boost:68, inertia:5,   color:'#3b82f6' },
  { key:'none',   label:'No nap',  boost:0,  inertia:0,   color:'#94a3b8' },
]

// Chronotype optimal nap windows
const CHRONOTYPES = [
  { key:'lion',   label:'🦁 Morning (Lion)',    napStart:'12:30', napEnd:'13:30', note:'Nap earlier — energy dips by 1 PM' },
  { key:'bear',   label:'🐻 Intermediate (Bear)',napStart:'13:00', napEnd:'14:30', note:'Classic post-lunch window works well' },
  { key:'wolf',   label:'🐺 Evening (Wolf)',     napStart:'14:00', napEnd:'15:30', note:'Nap later — natural dip arrives later' },
  { key:'dolphin',label:'🐬 Light sleeper',      napStart:'13:00', napEnd:'13:30', note:'Short naps only — longer ones disrupt night sleep' },
]

const FAQ = [
  { q:'What is the best nap duration?',
    a:'10–20 minutes is optimal for alertness without sleep inertia (grogginess). 90 minutes completes a full sleep cycle and provides the deepest restoration. The worst zone is 30–60 minutes — you enter deep N3 sleep but cannot complete the cycle, causing grogginess lasting 30–60 minutes on waking.' },
  { q:'When is the best time to nap?',
    a:"The post-lunch dip (1–3 PM) is the natural circadian low point for most people — the ideal nap window. Napping after 3–4 PM can interfere with nighttime sleep by reducing sleep pressure. A coffee nap (drinking coffee immediately before a 20-min nap) takes advantage of caffeine's 20-min absorption time for maximum alertness on waking." },
  { q:'What is sleep inertia?',
    a:'Sleep inertia is the grogginess on waking from deep N3 sleep, lasting 15–60 minutes and temporarily impairing performance below pre-nap levels. Keeping naps under 20 minutes or exactly 90 minutes avoids N3 entirely and minimises inertia.' },
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

const fmtTime = (h, m) => `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`

// SVG nap timeline
function NapTimeline({ napMin, napHour, startMin: napStartMin, napColor, wakeH, wakeM }) {
  const W = 540, H = 90, padL = 10, padR = 10, padT = 24, padB = 20
  const innerW = W - padL - padR
  const totalMin = 90 // always show 90 min scale
  const scale = innerW / totalMin

  const napEndMin = Math.min(napMin, totalMin)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display:'block', overflow:'visible' }}>
      {/* background track */}
      <rect x={padL} y={padT} width={innerW} height={30} rx={6} fill="var(--border)" opacity="0.4" />

      {/* sleep stage bands */}
      {SLEEP_STAGES.map((s, i) => {
        const x1 = padL + s.startMin * scale
        const x2 = padL + Math.min(s.endMin, totalMin) * scale
        const active = s.startMin < napEndMin
        return (
          <rect key={i} x={x1} y={padT} width={x2 - x1} height={30} rx={i === 0 ? 6 : 0}
            style={{ borderRadius: i === SLEEP_STAGES.length - 1 ? '0 6px 6px 0' : 0 }}
            fill={s.color} opacity={active ? 0.85 : 0.18}
          />
        )
      })}

      {/* nap end marker */}
      <line x1={padL + napEndMin * scale} y1={padT - 4} x2={padL + napEndMin * scale} y2={padT + 34} stroke={napColor} strokeWidth="2.5" />
      <polygon points={`${padL + napEndMin * scale - 5},${padT - 4} ${padL + napEndMin * scale + 5},${padT - 4} ${padL + napEndMin * scale},${padT + 2}`} fill={napColor} />

      {/* inertia danger zone */}
      {napMin > 20 && napMin < 90 && (
        <>
          <rect x={padL + 20 * scale} y={padT} width={(napEndMin - 20) * scale} height={30} fill="#ef4444" opacity="0.12" />
          <text x={padL + (20 + (napEndMin - 20) / 2) * scale} y={padT + 19} textAnchor="middle" fontSize="8" fill="#ef4444" fontWeight="700">⚠ inertia zone</text>
        </>
      )}

      {/* stage labels */}
      {SLEEP_STAGES.map((s, i) => {
        const cx = padL + ((s.startMin + Math.min(s.endMin, totalMin)) / 2) * scale
        const active = s.startMin < napEndMin
        if ((s.endMin - s.startMin) * scale < 20) return null
        return (
          <text key={i} x={cx} y={padT + 18} textAnchor="middle" fontSize="8" fontWeight="700" fill="#fff" opacity={active ? 1 : 0.4}>{s.label}</text>
        )
      })}

      {/* x-axis tick marks */}
      {[0, 10, 20, 30, 45, 60, 75, 90].map(m => (
        <g key={m}>
          <line x1={padL + m * scale} y1={padT + 32} x2={padL + m * scale} y2={padT + 36} stroke="var(--border)" strokeWidth="1" />
          <text x={padL + m * scale} y={padT + 46} textAnchor="middle" fontSize="8" fill="var(--text-3)">{m}m</text>
        </g>
      ))}

      {/* wake time label */}
      <text x={padL + napEndMin * scale} y={padT - 8} textAnchor="middle" fontSize="9" fontWeight="700" fill={napColor}>⏰ {fmtTime(wakeH, wakeM)}</text>
    </svg>
  )
}

export default function NapCalculator({ meta, category }) {
  const catColor   = category?.color || '#8b5cf6'
  const [napKey,   setNapKey]  = useState('short')
  const [napHour,  setNapHour] = useState(13)
  const [napMin,   setNapMin]  = useState(0)
  const [chronoKey,setChronoKey] = useState('bear')
  const [openFaq,  setOpenFaq] = useState(null)

  const nap     = NAP_TYPES.find(n => n.key === napKey) || NAP_TYPES[1]
  const wakeMin = (napHour * 60 + napMin + nap.min) % 1440
  const wakeH   = Math.floor(wakeMin / 60)
  const wakeM   = wakeMin % 60

  const storyColors = [nap.color, '#0ea5e9', '#f59e0b']
  const storySofts  = [nap.color + '18', '#e0f2fe', '#fef3c7']
  const stories = [
    { label:'Your nap',    headline:`${nap.min}-min ${nap.label} — wake at ${fmtTime(wakeH, wakeM)}`, detail:`Start at ${fmtTime(napHour, napMin)}, set alarm for ${fmtTime(wakeH, wakeM)}. ${nap.desc}` },
    { label:'Sleep stage', headline:`You will reach ${nap.stage} sleep`,                               detail:`${nap.min <= 20 ? 'Staying in light sleep means easy waking and no grogginess — the sweet spot.' : nap.min <= 60 ? 'You will enter deep N3 sleep. Move immediately on waking — bright light clears inertia faster.' : 'Full 90-min cycle includes REM — maximum cognitive and emotional restoration.'}` },
    { label:'Pro tip',     headline:napKey === 'power' ? '☕ Try the coffee nap trick' : '💡 Kill sleep inertia fast', detail:napKey === 'power' ? 'Drink coffee then nap immediately. Caffeine takes ~20 min to absorb — it activates exactly as you wake, stacking two alertness boosts.' : 'Bright light on waking suppresses melatonin faster than anything else. Step outside or use a bright lamp immediately.' },
  ]

  const hint = `${nap.min}-min ${nap.label} at ${fmtTime(napHour, napMin)} → wake at ${fmtTime(wakeH, wakeM)}. Stage: ${nap.stage}. ${nap.desc}`

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

      {/* ── MAIN CALC ── */}
      <CalcShell
        left={<>
          <div style={{ fontSize:12, fontWeight:600, color:'var(--text-2)', marginBottom:10, fontFamily:"'DM Sans',sans-serif" }}>Nap type</div>
          <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:16 }}>
            {NAP_TYPES.map(n => (
              <button key={n.key} onClick={() => setNapKey(n.key)} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'11px 13px', borderRadius:8, border:`1.5px solid ${napKey === n.key ? n.color : 'var(--border-2)'}`, background:napKey === n.key ? n.color + '12' : 'var(--bg-raised)', cursor:'pointer', textAlign:'left', fontFamily:"'DM Sans',sans-serif" }}>
                <div>
                  <div style={{ fontSize:12, fontWeight:700, color:napKey === n.key ? n.color : 'var(--text)' }}>{n.label}</div>
                  <div style={{ fontSize:10, color:'var(--text-3)', lineHeight:1.35 }}>{n.stage}{n.inertia ? ' · ⚠ inertia risk' : ''}</div>
                </div>
                <span style={{ fontSize:14, fontWeight:700, color:napKey === n.key ? n.color : 'var(--text-3)', flexShrink:0, marginLeft:8 }}>{n.min}m</span>
              </button>
            ))}
          </div>
          <div style={{ borderTop:'0.5px solid var(--border)', paddingTop:16 }}>
            <div style={{ fontSize:12, fontWeight:600, color:'var(--text-2)', marginBottom:10, fontFamily:"'DM Sans',sans-serif" }}>Nap start time</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              <Stepper label="Hour"   value={napHour} onChange={setNapHour} min={0} max={23}          unit="hr"  catColor={catColor} />
              <Stepper label="Minute" value={napMin}  onChange={setNapMin}  min={0} max={59} step={5} unit="min" catColor={catColor} />
            </div>
          </div>
          <div style={{ borderTop:'0.5px solid var(--border)', paddingTop:14, marginTop:4 }}>
            <div style={{ fontSize:12, fontWeight:600, color:'var(--text-2)', marginBottom:10, fontFamily:"'DM Sans',sans-serif" }}>Sleep stages entered</div>
            <div style={{ display:'flex', height:12, borderRadius:6, overflow:'hidden', gap:2 }}>
              {SLEEP_STAGES.map((s, i) => (
                <div key={i} style={{ flex:s.endMin - s.startMin, background:s.startMin < nap.min ? s.color : s.color + '28', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <span style={{ fontSize:7, fontWeight:700, color:'#fff' }}>{s.label}</span>
                </div>
              ))}
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:9, color:'var(--text-3)', marginTop:4 }}>
              <span>0</span><span>20m</span><span>50m</span><span>90m</span>
            </div>
            <div style={{ marginTop:8, padding:'9px 12px', background:nap.color + '10', borderRadius:8, border:`1px solid ${nap.color}25` }}>
              <div style={{ fontSize:11, fontWeight:700, color:nap.color }}>Nap ends in {nap.stage} sleep</div>
              {nap.inertia && <div style={{ fontSize:10, color:'#ef4444', marginTop:2 }}>⚠ Expect 15–30 min grogginess on waking</div>}
            </div>
          </div>
        </>}
        right={<>
          <div style={{ background:'var(--bg-card)', border:'0.5px solid var(--border)', borderRadius:14, overflow:'hidden', marginBottom:14 }}>
            <div style={{ padding:'11px 16px', borderBottom:'0.5px solid var(--border)', display:'flex', justifyContent:'space-between' }}>
              <span style={{ fontSize:12, fontWeight:700, color:'var(--text)', fontFamily:"'Space Grotesk',sans-serif" }}>Your nap plan</span>
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
          <BreakdownTable title="Nap Summary" rows={[
            { label:'Nap type',   value:nap.label,              bold:true, highlight:true, color:nap.color },
            { label:'Duration',   value:`${nap.min} minutes`,   color:nap.color },
            { label:'Start time', value:fmtTime(napHour, napMin) },
            { label:'Wake time',  value:fmtTime(wakeH, wakeM),  color:nap.color },
            { label:'Stage',      value:nap.stage },
            { label:'Inertia risk',value:nap.inertia ? 'Yes — move immediately on waking' : 'None', color:nap.inertia ? '#ef4444' : '#10b981' },
          ]} />
          <AIHintCard hint={hint} />
        </>}
      />

      {/* ── NEW: NAP TIMELINE VISUAL ── */}
      <Sec title="Your nap sleep stage timeline" sub="What your brain goes through during the nap">
        <p style={{ fontSize:12, color:'var(--text-2)', lineHeight:1.7, marginBottom:14, fontFamily:"'DM Sans',sans-serif" }}>
          This timeline shows exactly which sleep stages your <strong style={{ color:nap.color }}>{nap.min}-minute {nap.label}</strong> will reach. The red zone marks where sleep inertia (grogginess on waking) kicks in.
        </p>
        <div style={{ background:'var(--bg-raised)', borderRadius:10, padding:'16px 12px 10px', border:'0.5px solid var(--border)', overflowX:'auto' }}>
          <NapTimeline napMin={nap.min} napHour={napHour} napColor={nap.color} wakeH={wakeH} wakeM={wakeM} />
        </div>
        {/* Stage legend */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginTop:12 }}>
          {SLEEP_STAGES.map((s, i) => {
            const reached = s.startMin < nap.min
            return (
              <div key={i} style={{ display:'flex', gap:8, padding:'8px 10px', borderRadius:8, background:reached ? s.color + '10' : 'var(--bg-raised)', border:`${reached ? '1' : '0.5'}px solid ${reached ? s.color + '40' : 'var(--border)'}`, opacity:reached ? 1 : 0.5 }}>
                <div style={{ width:28, height:28, borderRadius:7, background:s.color, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:9, fontWeight:700, color:'#fff' }}>{s.label}</div>
                <div>
                  <div style={{ fontSize:11, fontWeight:700, color:reached ? s.color : 'var(--text-3)' }}>{s.label} {reached ? '✓' : '(not reached)'}</div>
                  <div style={{ fontSize:10, color:'var(--text-3)', lineHeight:1.4 }}>{s.desc}</div>
                </div>
              </div>
            )
          })}
        </div>
      </Sec>

      {/* ── NEW: ALERTNESS BOOST CHART ── */}
      <Sec title="Alertness boost by nap type" sub="Research-backed comparison (% above baseline)">
        <p style={{ fontSize:12, color:'var(--text-2)', lineHeight:1.7, marginBottom:14, fontFamily:"'DM Sans',sans-serif" }}>
          Based on NASA pilot research and sleep lab studies. The bars show alertness improvement — but the net benefit also accounts for sleep inertia (grogginess on waking) which can temporarily push performance below baseline.
        </p>
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {ALERTNESS_DATA.map((d, i) => {
            const isSelected = d.key === napKey
            const maxBoost = 68
            return (
              <div key={i} style={{ padding:'10px 13px', borderRadius:9, background:isSelected ? d.color + '12' : 'var(--bg-raised)', border:`${isSelected ? '1.5' : '0.5'}px solid ${isSelected ? d.color : 'var(--border)'}` }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                  <span style={{ fontSize:12, fontWeight:isSelected ? 700 : 500, color:isSelected ? d.color : 'var(--text)' }}>
                    {d.label} nap{d.key === 'none' ? '' : ''} {isSelected ? '← you' : ''}
                  </span>
                  <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                    {d.inertia > 0 && <span style={{ fontSize:10, color:'#ef4444' }}>⚠ {d.inertia}min inertia</span>}
                    <span style={{ fontSize:12, fontWeight:700, color:d.boost > 0 ? d.color : 'var(--text-3)' }}>+{d.boost}%</span>
                  </div>
                </div>
                {/* Alertness bar */}
                <div style={{ height:8, background:'var(--border)', borderRadius:4, overflow:'hidden', marginBottom:d.inertia > 0 ? 4 : 0 }}>
                  <div style={{ height:'100%', width:`${(d.boost / maxBoost) * 100}%`, background:d.color, borderRadius:4, transition:'width .4s' }} />
                </div>
                {/* Inertia cost bar */}
                {d.inertia > 0 && (
                  <>
                    <div style={{ fontSize:9, color:'var(--text-3)', marginBottom:2 }}>Net benefit after inertia clears</div>
                    <div style={{ height:5, background:'var(--border)', borderRadius:3, overflow:'hidden' }}>
                      <div style={{ height:'100%', width:`${((d.boost - d.inertia) / maxBoost) * 100}%`, background:'#ef4444', borderRadius:3 }} />
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
        <div style={{ marginTop:12, padding:'9px 12px', background:'var(--bg-raised)', borderRadius:8, border:'0.5px solid var(--border)' }}>
          <p style={{ fontSize:11, color:'var(--text-3)', margin:0, lineHeight:1.6 }}>
            Sources: NASA Fatigue Countermeasures Program; Mednick et al. (2002); Takahashi et al. (2004). Individual results vary by chronotype, baseline tiredness, and sleep debt level.
          </p>
        </div>
      </Sec>

      {/* ── NEW: CHRONOTYPE NAP WINDOWS ── */}
      <Sec title="🎯 Optimal nap window by chronotype" sub="When should YOU nap based on your body clock?">
        <p style={{ fontSize:12, color:'var(--text-2)', lineHeight:1.7, marginBottom:14, fontFamily:"'DM Sans',sans-serif" }}>
          The ideal nap window shifts by 1–2 hours depending on your chronotype. Select yours below to see your personalised window.
        </p>
        <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:14 }}>
          {CHRONOTYPES.map(c => (
            <button key={c.key} onClick={() => setChronoKey(c.key)} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 14px', borderRadius:9, border:`1.5px solid ${chronoKey === c.key ? catColor : 'var(--border-2)'}`, background:chronoKey === c.key ? catColor + '12' : 'var(--bg-raised)', cursor:'pointer', textAlign:'left', fontFamily:"'DM Sans',sans-serif" }}>
              <div>
                <div style={{ fontSize:12, fontWeight:chronoKey === c.key ? 700 : 500, color:chronoKey === c.key ? catColor : 'var(--text)' }}>{c.label}</div>
                <div style={{ fontSize:10, color:'var(--text-3)', marginTop:1 }}>{c.note}</div>
              </div>
              <div style={{ textAlign:'right' }}>
                <div style={{ fontSize:13, fontWeight:700, color:catColor }}>{c.napStart}–{c.napEnd}</div>
                <div style={{ fontSize:9, color:'var(--text-3)' }}>optimal window</div>
              </div>
            </button>
          ))}
        </div>
        {/* Visual 24h clock strip showing nap window */}
        {(() => {
          const c = CHRONOTYPES.find(t => t.key === chronoKey) || CHRONOTYPES[1]
          const startH = parseInt(c.napStart.split(':')[0]) + parseInt(c.napStart.split(':')[1]) / 60
          const endH   = parseInt(c.napEnd.split(':')[0])   + parseInt(c.napEnd.split(':')[1])   / 60
          const wakeH_ct = parseInt(c.napStart.split(':')[0])
          const wakeM_ct = parseInt(c.napStart.split(':')[1]) + nap.min
          return (
            <div style={{ padding:'14px 16px', background:catColor + '08', borderRadius:10, border:`1px solid ${catColor}25` }}>
              <div style={{ fontSize:11, fontWeight:700, color:catColor, marginBottom:10 }}>Your optimal nap window — {c.label}</div>
              {/* 24h strip 8:00–20:00 */}
              <div style={{ position:'relative', height:20, background:'var(--border)', borderRadius:6, marginBottom:8, overflow:'hidden' }}>
                {/* highlight window */}
                <div style={{
                  position:'absolute',
                  left:`${((startH - 8) / 12) * 100}%`,
                  width:`${((endH - startH) / 12) * 100}%`,
                  top:0, bottom:0,
                  background:catColor,
                  opacity:0.8,
                  borderRadius:4,
                }} />
                {/* current nap time marker if in range */}
                <div style={{
                  position:'absolute',
                  left:`${((napHour + napMin / 60 - 8) / 12) * 100}%`,
                  top:0, bottom:0,
                  width:2,
                  background:'#fff',
                  opacity:0.9,
                }} />
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:9, color:'var(--text-3)', marginBottom:10 }}>
                <span>08:00</span><span>11:00</span><span>14:00</span><span>17:00</span><span>20:00</span>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                {[{ l:'Optimal start', v:c.napStart }, { l:'Optimal end', v:c.napEnd }, { l:'Best type', v:`${nap.min}m ${nap.label}` }, { l:'Your set time', v:fmtTime(napHour, napMin) }].map((s, i) => (
                  <div key={i} style={{ padding:'8px 10px', background:'var(--bg-card)', borderRadius:8, border:'0.5px solid var(--border)' }}>
                    <div style={{ fontSize:9, color:'var(--text-3)', marginBottom:2 }}>{s.l}</div>
                    <div style={{ fontSize:13, fontWeight:700, color:catColor }}>{s.v}</div>
                  </div>
                ))}
              </div>
            </div>
          )
        })()}
      </Sec>

      {/* ── 🎯 COFFEE NAP INTERACTIVE ── */}
      <Sec title="🎯 Coffee nap timing calculator" sub="The science-backed performance hack">
        <p style={{ fontSize:12, color:'var(--text-2)', lineHeight:1.7, marginBottom:14, fontFamily:"'DM Sans',sans-serif" }}>
          Drink coffee immediately before a 20-min nap. Caffeine takes ~20 min to absorb — it activates exactly as you wake, stacking both alertness boosts simultaneously.
        </p>
        <div style={{ padding:'12px 14px', background:nap.color + '10', borderRadius:10, border:`1px solid ${nap.color}25`, marginBottom:14 }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10 }}>
            {[
              { label:'Drink coffee at',     val:fmtTime(napHour, napMin), icon:'☕' },
              { label:'Nap starts',          val:fmtTime(napHour, napMin), icon:'😴' },
              { label:'Wake + caffeine hit', val:fmtTime(wakeH, wakeM),   icon:'⚡' },
            ].map((s, i) => (
              <div key={i} style={{ textAlign:'center', padding:'10px 8px', background:'var(--bg-card)', borderRadius:9, border:'0.5px solid var(--border)' }}>
                <div style={{ fontSize:18, marginBottom:3 }}>{s.icon}</div>
                <div style={{ fontSize:13, fontWeight:700, color:nap.color, fontFamily:"'Space Grotesk',sans-serif" }}>{s.val}</div>
                <div style={{ fontSize:9, color:'var(--text-3)', marginTop:2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
          {[
            { label:'Regular nap only',    boost:34, color:'#94a3b8', note:'Moderate alertness boost' },
            { label:'Coffee only',          boost:42, color:'#f59e0b', note:'Caffeine kick after 20–30 min' },
            { label:'Coffee nap (combined)',boost:68, color:nap.color, note:'Maximum alertness — both boosters activate together', best:true },
          ].map((s, i) => (
            <div key={i} style={{ padding:'10px 13px', borderRadius:9, background:s.best ? nap.color + '12' : 'var(--bg-raised)', border:`${s.best ? '1.5' : '0.5'}px solid ${s.best ? nap.color : 'var(--border)'}` }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                  <div style={{ width:8, height:8, borderRadius:'50%', background:s.color }} />
                  <span style={{ fontSize:12, fontWeight:s.best ? 700 : 500, color:s.best ? s.color : 'var(--text)' }}>{s.label}</span>
                  {s.best && <span style={{ fontSize:9, fontWeight:700, background:nap.color + '18', color:nap.color, padding:'1px 6px', borderRadius:5 }}>BEST</span>}
                </div>
                <span style={{ fontSize:12, fontWeight:700, color:s.color }}>+{s.boost}%</span>
              </div>
              <div style={{ height:5, background:'var(--border)', borderRadius:3 }}>
                <div style={{ height:'100%', width:`${(s.boost / 68) * 100}%`, background:s.color, borderRadius:3 }} />
              </div>
              <div style={{ fontSize:10, color:'var(--text-3)', marginTop:3 }}>{s.note}</div>
            </div>
          ))}
        </div>
      </Sec>

      {/* ── 🧠 INTERESTING ── */}
      <Sec title="Inside a sleep cycle — what actually happens" sub="90-minute architecture every night">
        <p style={{ fontSize:12, color:'var(--text-2)', lineHeight:1.7, marginBottom:14, fontFamily:"'DM Sans',sans-serif" }}>
          Every night your brain cycles through 4–6 complete 90-minute sleep cycles. Each contains the same 4 stages — but proportions shift dramatically across the night.
        </p>
        <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:14 }}>
          {SLEEP_STAGES.map((s, i) => (
            <div key={i} style={{ display:'flex', gap:12, padding:'10px 13px', borderRadius:9, background:'var(--bg-raised)', border:'0.5px solid var(--border)' }}>
              <div style={{ width:36, height:36, borderRadius:9, background:s.color, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:11, fontWeight:700, color:'#fff' }}>{s.label}</div>
              <div>
                <div style={{ fontSize:12, fontWeight:700, color:s.color, marginBottom:2 }}>{s.label} — ~{s.endMin - s.startMin}min</div>
                <div style={{ fontSize:11.5, color:'var(--text-2)', lineHeight:1.55 }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding:'11px 14px', background:'var(--bg-raised)', borderRadius:10, border:'0.5px solid var(--border)' }}>
          <div style={{ fontSize:11.5, color:'var(--text-2)', lineHeight:1.65 }}>
            Early cycles (first 3h): dominated by N3 deep sleep — physical restoration, immune function, growth hormone. Late cycles (last 3h): dominated by REM — memory, emotions, creativity. Cutting sleep short loses disproportionately more REM.
          </div>
        </div>
      </Sec>

      {/* ── ⚡ FUN FACT ── */}
      <Sec title="⚡ Nap facts worth knowing">
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {[
            { f:'NASA research on military pilots found a 40-minute nap improved performance by 34% and alertness by 100% compared to no nap.', icon:'🚀' },
            { f:"Many of history's most productive people were dedicated nappers: Einstein, Churchill, Edison, Da Vinci, and JFK all incorporated daily naps into their routines.", icon:'🧠' },
            { f:'Cultures with regular afternoon napping historically had lower cardiovascular disease rates — a 2007 study found 37% lower coronary mortality in regular nappers.', icon:'❤️' },
            { f:"The so-called '6-hour sleep myth' — that successful people only sleep 6 hours — is contradicted by sleep research. Under 1% of the population are genuine short sleepers. Most 6-hour sleepers are chronically sleep-deprived.", icon:'😴' },
          ].map((f, i) => (
            <div key={i} style={{ display:'flex', gap:12, padding:'11px 14px', borderRadius:9, background:'var(--bg-raised)', border:'0.5px solid var(--border)' }}>
              <span style={{ fontSize:18, flexShrink:0 }}>{f.icon}</span>
              <p style={{ fontSize:12, color:'var(--text-2)', lineHeight:1.65, margin:0 }}>{f.f}</p>
            </div>
          ))}
        </div>
      </Sec>

      <Sec title="Frequently asked questions" sub="Nap science explained">
        {FAQ.map((f, i) => (<Acc key={i} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} catColor={catColor} />))}
      </Sec>
    </div>
  )
}
