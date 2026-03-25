import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'

const clamp = (v,a,b) => Math.min(b, Math.max(a, v))

const DRINKS = [
  { key:'beer_pint',     label:'Beer pint (568ml)',    ml:568, abv:4.5, icon:'🍺' },
  { key:'beer_bottle',   label:'Beer bottle (330ml)',  ml:330, abv:5.0, icon:'🍺' },
  { key:'wine_small',    label:'Wine small (125ml)',   ml:125, abv:13,  icon:'🍷' },
  { key:'wine_medium',   label:'Wine medium (175ml)',  ml:175, abv:13,  icon:'🍷' },
  { key:'wine_large',    label:'Wine large (250ml)',   ml:250, abv:13,  icon:'🍷' },
  { key:'spirits_single',label:'Spirits single (25ml)',ml:25,  abv:40,  icon:'🥃' },
  { key:'spirits_double',label:'Spirits double (50ml)',ml:50,  abv:40,  icon:'🥃' },
  { key:'prosecco',      label:'Prosecco flute',       ml:125, abv:11,  icon:'🥂' },
  { key:'cocktail',      label:'Cocktail (avg)',        ml:200, abv:12,  icon:'🍹' },
]

const BAC_LEVELS = [
  { max:0.02, label:'Sober',         color:'#10b981', desc:'No impairment. Legal to drive in all countries.' },
  { max:0.05, label:'Mild effects',  color:'#22a355', desc:'Relaxation, mild euphoria. Slightly reduced reaction time.' },
  { max:0.08, label:'Impaired',      color:'#f59e0b', desc:'Legal driving limit in UK/US. Coordination and judgment impaired.' },
  { max:0.15, label:'Clearly drunk', color:'#f97316', desc:'Slurred speech, poor coordination. Well above legal limit.' },
  { max:0.25, label:'Very drunk',    color:'#ef4444', desc:'Severe impairment. Risk of blackout. Do not drive.' },
  { max:999,  label:'Dangerous',     color:'#dc2626', desc:'Alcohol poisoning risk. Seek medical attention.' },
]

// Widmark factor by sex
const R_FACTOR = { male:0.68, female:0.55 }

// Weight scenarios for comparison table
const WEIGHT_SCENARIOS = [50, 60, 70, 80, 90, 100, 120]

const FAQ = [
  { q:'How is BAC calculated?',
    a:'The Widmark formula: BAC = (alcohol grams / (body weight kg × distribution ratio × 10)) × 100. The distribution ratio (r) is 0.68 for men and 0.55 for women, reflecting differences in body water. Alcohol is then eliminated at ~0.015% per hour. Actual BAC varies significantly with food intake, rate of drinking, metabolism, and genetics.' },
  { q:'How long until I am safe to drive?',
    a:'The liver metabolises alcohol at roughly 1 UK unit per hour (0.015% BAC/hour). Water, coffee, and food do not speed this up — only time works. A rough rule: wait at least 1 hour per unit plus 1 extra buffer hour. After heavy drinking, you may still be over the limit the following morning.' },
  { q:'What affects BAC beyond units consumed?',
    a:'Body weight (heavier = lower BAC), biological sex (women have lower body water), food intake (slows absorption by 50%), drinking rate, carbonation (fizzy drinks absorb faster), and liver health. An empty stomach produces peak BAC 45–90 minutes after drinking; a full stomach delays peak to 1–3 hours.' },
  { q:'Can I sober up faster with exercise or cold showers?',
    a:'No. Cold showers, exercise, coffee, and food do not lower BAC. They may temporarily mask symptoms — making you feel more alert while still being objectively impaired. The only thing that lowers BAC is time. The liver processes alcohol at a fixed rate regardless of activity.' },
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

const calcUnits = (ml, abv) => (ml * abv) / 1000

// BAC decay SVG chart
function BACDecayCurve({ peakBAC, catColor, levelColor }) {
  const W = 540, H = 140, padL = 46, padR = 16, padT = 14, padB = 28
  const innerW = W - padL - padR
  const innerH = H - padT - padB
  const totalHours = Math.max(peakBAC / 0.015 + 1, 8)
  const steps = 100
  const maxBAC = Math.max(peakBAC * 1.05, 0.1)

  // Curve points — linear decay from peak
  const points = Array.from({ length: steps + 1 }, (_, i) => {
    const t = (i / steps) * totalHours
    const bac = Math.max(0, peakBAC - t * 0.015)
    const x = padL + (t / totalHours) * innerW
    const y = padT + innerH - (bac / maxBAC) * innerH
    return `${x},${y}`
  })

  const legalLines = [
    { bac:0.08, label:'0.08 UK/US limit', color:'#f59e0b' },
    { bac:0.05, label:'0.05 EU limit',    color:'#3b82f6' },
  ].filter(l => l.bac < peakBAC)

  const now = new Date()
  const xLabels = Array.from({ length: Math.ceil(totalHours) + 1 }, (_, i) => i).filter(h => h <= totalHours)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display:'block', overflow:'visible' }}>
      {/* grid */}
      {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
        const y = padT + innerH * (1 - pct)
        const bacVal = maxBAC * pct
        return (
          <g key={i}>
            <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="var(--border)" strokeWidth="0.5" strokeDasharray="3,4" />
            <text x={padL - 4} y={y + 3.5} textAnchor="end" fontSize="8" fill="var(--text-3)">{bacVal.toFixed(2)}</text>
          </g>
        )
      })}

      {/* legal limit lines */}
      {legalLines.map((l, i) => {
        const y = padT + innerH - (l.bac / maxBAC) * innerH
        const xCross = padL + ((peakBAC - l.bac) / 0.015 / totalHours) * innerW
        return (
          <g key={i}>
            <line x1={padL} y1={y} x2={W - padR} y2={y} stroke={l.color} strokeWidth="1.2" strokeDasharray="5,3" />
            <text x={padL + 4} y={y - 4} fontSize="8" fill={l.color}>{l.label}</text>
            {/* crossing marker */}
            <circle cx={xCross} cy={y} r="4" fill={l.color} />
          </g>
        )
      })}

      {/* shaded area under curve */}
      <path
        d={`M ${padL},${padT + innerH} ${points.join(' L ')} L ${W - padR},${padT + innerH} Z`}
        fill={levelColor} fillOpacity="0.08"
      />

      {/* curve */}
      <polyline points={points.join(' ')} fill="none" stroke={levelColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* peak label */}
      <circle cx={padL} cy={padT + innerH - (peakBAC / maxBAC) * innerH} r="5" fill={levelColor} />
      <text x={padL + 8} y={padT + innerH - (peakBAC / maxBAC) * innerH - 4} fontSize="9" fontWeight="700" fill={levelColor}>Peak {peakBAC.toFixed(3)}%</text>

      {/* x axis */}
      <line x1={padL} y1={padT + innerH} x2={W - padR} y2={padT + innerH} stroke="var(--border)" strokeWidth="0.8" />
      {xLabels.map(h => (
        <g key={h}>
          <text x={padL + (h / totalHours) * innerW} y={H - 5} textAnchor="middle" fontSize="8" fill="var(--text-3)">+{h}h</text>
        </g>
      ))}

      {/* zero marker */}
      {peakBAC > 0 && (
        <g>
          <line x1={padL + (peakBAC / 0.015 / totalHours) * innerW} y1={padT} x2={padL + (peakBAC / 0.015 / totalHours) * innerW} y2={padT + innerH} stroke="#10b981" strokeWidth="1.5" strokeDasharray="3,3" />
          <text x={padL + (peakBAC / 0.015 / totalHours) * innerW + 4} y={padT + 12} fontSize="8" fill="#10b981">Sober</text>
        </g>
      )}
    </svg>
  )
}

export default function BACCalculator({ meta, category }) {
  const catColor = category?.color || '#f59e0b'
  const [wKg,     setWKg]    = useState(75)
  const [sex,     setSex]    = useState('male')
  const [hours,   setHours]  = useState(2)
  const [items,   setItems]  = useState([{ key:'beer_pint', qty:2 }, { key:'wine_medium', qty:1 }])
  const [foodMode,setFoodMode] = useState('empty') // 'empty' | 'full'
  const [openFaq, setOpenFaq]= useState(null)

  const addItem    = () => setItems(i => [...i, { key:'beer_pint', qty:1 }])
  const removeItem = idx => setItems(i => i.filter((_, j) => j !== idx))
  const updateItem = (idx, f, v) => setItems(i => i.map((it, j) => j === idx ? { ...it, [f]:v } : it))

  const r          = R_FACTOR[sex]
  const totalUnits = items.reduce((s, it) => { const d = DRINKS.find(x => x.key === it.key) || DRINKS[0]; return s + calcUnits(d.ml, d.abv) * it.qty }, 0)
  const alcoholG   = totalUnits * 10
  // food slows absorption: full stomach delays peak by ~1h extra and reduces peak by ~20%
  const foodFactor = foodMode === 'full' ? 0.80 : 1.0
  const peakBAC    = clamp((alcoholG / (wKg * r * 10)) * 100 * foodFactor, 0, 0.5)
  const currentBAC = clamp(peakBAC - hours * 0.015, 0, 0.5)
  const hoursToZero = Math.max(0, peakBAC / 0.015)
  const hoursToSafe = Math.max(0, (peakBAC - 0.05) / 0.015)
  const hoursToLegal= Math.max(0, (peakBAC - 0.08) / 0.015)

  const level = BAC_LEVELS.find(l => currentBAC <= l.max) || BAC_LEVELS[BAC_LEVELS.length - 1]

  const hint = `Estimated BAC: ${currentBAC.toFixed(3)}% — ${level.label}. Total units: ${totalUnits.toFixed(1)}. Peak: ${peakBAC.toFixed(3)}%. Hours to zero: ${hoursToZero.toFixed(1)}h. ${level.desc}`

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

      {/* ── MAIN CALC ── */}
      <CalcShell
        left={<>
          <div style={{ fontSize:10, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:14 }}>Your stats</div>
          <Stepper label="Body weight" value={wKg} onChange={setWKg} min={40} max={200} unit="kg" catColor={catColor} />
          <Stepper label="Hours since first drink" value={hours} onChange={setHours} min={0} max={24} step={0.5} unit="hrs" catColor={catColor} />

          <div style={{ borderTop:'0.5px solid var(--border)', paddingTop:16, marginTop:4 }}>
            <div style={{ fontSize:12, fontWeight:600, color:'var(--text-2)', marginBottom:8 }}>Sex</div>
            <div style={{ display:'flex', gap:8, marginBottom:14 }}>
              {[{ v:'male', l:'Male' }, { v:'female', l:'Female' }].map(o => (
                <button key={o.v} onClick={() => setSex(o.v)} style={{ flex:1, padding:'10px', borderRadius:9, border:`1.5px solid ${sex === o.v ? catColor : 'var(--border-2)'}`, background:sex === o.v ? catColor + '12' : 'var(--bg-raised)', fontSize:12, fontWeight:sex === o.v ? 700 : 500, color:sex === o.v ? catColor : 'var(--text-2)', cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>{o.l}</button>
              ))}
            </div>

            {/* Food state toggle */}
            <div style={{ fontSize:12, fontWeight:600, color:'var(--text-2)', marginBottom:8 }}>Stomach</div>
            <div style={{ display:'flex', gap:8, marginBottom:14 }}>
              {[{ v:'empty', l:'Empty stomach', note:'Faster absorption, higher peak' }, { v:'full', l:'Full stomach', note:'~20% lower peak, slower rise' }].map(o => (
                <button key={o.v} onClick={() => setFoodMode(o.v)} style={{ flex:1, padding:'8px', borderRadius:9, border:`1.5px solid ${foodMode === o.v ? catColor : 'var(--border-2)'}`, background:foodMode === o.v ? catColor + '12' : 'var(--bg-raised)', cursor:'pointer', textAlign:'left', fontFamily:"'DM Sans',sans-serif" }}>
                  <div style={{ fontSize:11, fontWeight:foodMode === o.v ? 700 : 500, color:foodMode === o.v ? catColor : 'var(--text)' }}>{o.l}</div>
                  <div style={{ fontSize:9, color:'var(--text-3)', marginTop:1 }}>{o.note}</div>
                </button>
              ))}
            </div>

            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
              <span style={{ fontSize:12, fontWeight:600, color:'var(--text-2)' }}>Drinks consumed</span>
              <button onClick={addItem} style={{ fontSize:11, fontWeight:700, color:catColor, background:catColor + '15', border:`1px solid ${catColor}`, borderRadius:8, padding:'3px 10px', cursor:'pointer' }}>+ Add</button>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
              {items.map((it, idx) => {
                const d = DRINKS.find(x => x.key === it.key) || DRINKS[0]
                return (
                  <div key={idx} style={{ padding:'10px 12px', borderRadius:9, background:'var(--bg-raised)', border:'0.5px solid var(--border)' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:7 }}>
                      <span style={{ fontSize:11, fontWeight:700, color:'var(--text)' }}>{d.icon} {(calcUnits(d.ml, d.abv) * it.qty).toFixed(1)} units</span>
                      <button onClick={() => removeItem(idx)} style={{ fontSize:15, color:'var(--text-3)', background:'none', border:'none', cursor:'pointer' }}>×</button>
                    </div>
                    <select value={it.key} onChange={e => updateItem(idx, 'key', e.target.value)} style={{ width:'100%', marginBottom:6, padding:'5px 8px', borderRadius:7, border:'1px solid var(--border)', background:'var(--bg-card)', color:'var(--text)', fontSize:11 }}>
                      {DRINKS.map(d => (<option key={d.key} value={d.key}>{d.icon} {d.label} ({calcUnits(d.ml, d.abv).toFixed(1)}u)</option>))}
                    </select>
                    <div style={{ display:'flex', gap:6 }}>
                      {[1, 2, 3, 4].map(q => (
                        <button key={q} onClick={() => updateItem(idx, 'qty', q)} style={{ flex:1, padding:'4px', borderRadius:6, fontSize:11, fontWeight:it.qty === q ? 700 : 400, color:it.qty === q ? catColor : 'var(--text-2)', border:`1px solid ${it.qty === q ? catColor : 'var(--border)'}`, background:it.qty === q ? catColor + '12' : 'var(--bg-raised)', cursor:'pointer' }}>×{q}</button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </>}
        right={<>
          {/* BAC gauge */}
          <div style={{ background:'var(--bg-card)', border:'0.5px solid var(--border)', borderRadius:14, overflow:'hidden', marginBottom:14 }}>
            <div style={{ padding:'11px 16px', borderBottom:'0.5px solid var(--border)', display:'flex', justifyContent:'space-between' }}>
              <span style={{ fontSize:12, fontWeight:700, color:'var(--text)', fontFamily:"'Space Grotesk',sans-serif" }}>Blood Alcohol Content</span>
              <span style={{ fontSize:10, color:'var(--text-3)' }}>Widmark formula</span>
            </div>
            <div style={{ padding:'16px 18px' }}>
              <div style={{ display:'flex', alignItems:'flex-end', gap:12, marginBottom:14 }}>
                <div>
                  <div style={{ fontSize:48, fontWeight:700, lineHeight:1, color:level.color, fontFamily:"'Space Grotesk',sans-serif", transition:'color .3s' }}>{currentBAC.toFixed(3)}</div>
                  <div style={{ fontSize:11, color:'var(--text-3)', marginTop:3 }}>% BAC</div>
                </div>
                <div style={{ paddingBottom:4 }}>
                  <div style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'5px 12px 5px 8px', borderRadius:20, background:level.color + '18', border:`1px solid ${level.color}35` }}>
                    <div style={{ width:8, height:8, borderRadius:'50%', background:level.color }} />
                    <span style={{ fontSize:12, fontWeight:700, color:level.color }}>{level.label}</span>
                  </div>
                  <div style={{ fontSize:11, color:'var(--text-3)', marginTop:5 }}>{level.desc}</div>
                </div>
              </div>
              {/* BAC scale bar */}
              <div style={{ display:'flex', gap:2, height:12, borderRadius:6, overflow:'hidden', marginBottom:8 }}>
                {BAC_LEVELS.slice(0, -1).map((l, i) => (<div key={i} style={{ flex:1, background:l.color, opacity:currentBAC <= l.max && (i === 0 || currentBAC > BAC_LEVELS[i-1].max) ? 1 : 0.25 }} />))}
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:9, color:'var(--text-3)', marginBottom:14 }}>
                <span>0.00</span><span>0.02</span><span>0.05</span><span>0.08</span><span>0.15</span><span>0.25+</span>
              </div>
              {[
                { label:'Legal to drive (0.08%)',   hours:hoursToLegal, color:'#f59e0b' },
                { label:'Comfortably safe (0.05%)', hours:hoursToSafe,  color:'#22a355' },
                { label:'Fully sober (0.00%)',      hours:hoursToZero,  color:'#10b981' },
              ].map((r, i) => (
                <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'7px 10px', borderRadius:7, background:'var(--bg-raised)', border:'0.5px solid var(--border)', marginBottom:4 }}>
                  <span style={{ fontSize:11, color:'var(--text-2)' }}>{r.label}</span>
                  <span style={{ fontSize:12, fontWeight:700, color:r.hours === 0 ? r.color : catColor }}>{r.hours === 0 ? 'Now ✓' : `~${r.hours.toFixed(1)}h`}</span>
                </div>
              ))}
            </div>
          </div>
          <BreakdownTable title="BAC Summary" rows={[
            { label:'Current BAC',   value:`${currentBAC.toFixed(3)}%`,    bold:true, highlight:true, color:level.color },
            { label:'Status',        value:level.label,                     color:level.color },
            { label:'Peak BAC',      value:`${peakBAC.toFixed(3)}%` },
            { label:'Total units',   value:`${totalUnits.toFixed(1)} units` },
            { label:'Stomach',       value:foodMode === 'full' ? 'Full (−20% peak)' : 'Empty' },
            { label:'Hours to legal',value:hoursToLegal === 0 ? 'Now ✓' : `~${hoursToLegal.toFixed(1)}h` },
            { label:'Hours to zero', value:`~${hoursToZero.toFixed(1)}h` },
          ]} />
          <AIHintCard hint={hint} />
        </>}
      />

      {/* ── NEW: BAC DECAY CURVE ── */}
      <Sec title="BAC decay curve" sub="How your blood alcohol drops over time">
        <p style={{ fontSize:12, color:'var(--text-2)', lineHeight:1.7, marginBottom:14, fontFamily:"'DM Sans',sans-serif" }}>
          This chart shows your BAC falling at the fixed liver rate of <strong style={{ color:catColor }}>0.015%/hour</strong>. The legal limit lines show exactly when you cross back into safe territory — the dots mark the crossing point.
        </p>
        <div style={{ background:'var(--bg-raised)', borderRadius:10, padding:'14px 8px 8px', border:'0.5px solid var(--border)', overflowX:'auto' }}>
          <BACDecayCurve peakBAC={peakBAC} catColor={catColor} levelColor={level.color} />
        </div>
        <div style={{ display:'flex', gap:16, marginTop:10, flexWrap:'wrap' }}>
          {[
            { color:level.color, label:'Your BAC curve' },
            { color:'#f59e0b',   label:'0.08% UK/US limit', dash:true },
            { color:'#3b82f6',   label:'0.05% EU limit',    dash:true },
            { color:'#10b981',   label:'Fully sober',       dash:true },
          ].map((s, i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:5 }}>
              {s.dash
                ? <div style={{ width:14, height:2, borderTop:`2px dashed ${s.color}` }} />
                : <div style={{ width:8, height:8, borderRadius:'50%', background:s.color }} />
              }
              <span style={{ fontSize:10, color:'var(--text-3)' }}>{s.label}</span>
            </div>
          ))}
        </div>
        {foodMode === 'full' && (
          <div style={{ marginTop:10, padding:'9px 12px', background:'#dbeafe', borderRadius:8, border:'1px solid #3b82f630' }}>
            <p style={{ fontSize:11.5, color:'#1e40af', margin:0, lineHeight:1.6 }}>
              🍽️ <strong>Full stomach active:</strong> Peak BAC is estimated ~20% lower. The curve uses this adjusted peak — actual BAC may vary.
            </p>
          </div>
        )}
      </Sec>

      {/* ── 🎯 INTERACTIVE — Safe to drive with real-time clock ── */}
      <Sec title="🎯 Safe to drive calculator" sub="Precise clock times for each legal threshold">
        <p style={{ fontSize:12, color:'var(--text-2)', lineHeight:1.7, marginBottom:14, fontFamily:"'DM Sans',sans-serif" }}>
          Based on your drinks, the liver processes alcohol at a fixed rate. Here is exactly when the clock says you will be safe — at four different legal standards around the world.
        </p>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:12 }}>
          {[
            { label:'UK/US legal limit',   threshold:0.08, country:'🇬🇧🇺🇸', color:'#f59e0b' },
            { label:'EU legal limit',       threshold:0.05, country:'🇪🇺',     color:'#3b82f6' },
            { label:'Zero tolerance',       threshold:0.02, country:'Many', color:'#22a355' },
            { label:'Fully sober',          threshold:0.00, country:'Everyone', color:'#10b981' },
          ].map((s, i) => {
            const h = Math.max(0, (peakBAC - s.threshold) / 0.015)
            const clearTime = new Date(Date.now() + h * 3600000)
            const timeStr = clearTime.toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' })
            const isNow = h === 0
            return (
              <div key={i} style={{ padding:'12px 14px', borderRadius:10, background:isNow ? s.color + '12' : 'var(--bg-raised)', border:`${isNow ? '1.5' : '0.5'}px solid ${isNow ? s.color : 'var(--border)'}` }}>
                <div style={{ fontSize:10, color:'var(--text-3)', marginBottom:3 }}>{s.country} {s.label}</div>
                <div style={{ fontSize:20, fontWeight:700, color:isNow ? s.color : catColor, fontFamily:"'Space Grotesk',sans-serif" }}>{isNow ? 'Now ✓' : timeStr}</div>
                <div style={{ fontSize:10, color:'var(--text-3)', marginTop:2 }}>{h > 0 ? `${h.toFixed(1)}h from now` : 'Already below this limit'}</div>
                {/* mini bar showing wait as pct of total sober time */}
                {h > 0 && hoursToZero > 0 && (
                  <div style={{ marginTop:5, height:3, background:'var(--border)', borderRadius:2 }}>
                    <div style={{ height:'100%', width:`${(1 - h / hoursToZero) * 100}%`, background:s.color, borderRadius:2 }} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
        <div style={{ padding:'10px 13px', background:'#fee2e2', borderRadius:10, border:'1px solid #ef444430' }}>
          <p style={{ fontSize:11.5, color:'#991b1b', margin:0, lineHeight:1.65 }}>
            ⚠️ <strong>Estimate only.</strong> Individual BAC varies significantly. When in doubt, do not drive. No calculator replaces a breathalyser or personal judgment.
          </p>
        </div>
      </Sec>

      {/* ── NEW: BODY WEIGHT IMPACT TABLE ── */}
      <Sec title="How body weight changes your BAC" sub={`Same ${totalUnits.toFixed(1)} units, different weights — tap to set yours`}>
        <p style={{ fontSize:12, color:'var(--text-2)', lineHeight:1.7, marginBottom:14, fontFamily:"'DM Sans',sans-serif" }}>
          Body weight is one of the biggest factors in BAC. Here is what your exact drinks would produce at different weights — for your current sex ({sex}).
        </p>
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          {WEIGHT_SCENARIOS.map((w, i) => {
            const bac = clamp((totalUnits * 10 / (w * R_FACTOR[sex] * 10)) * 100 * foodFactor - hours * 0.015, 0, 0.5)
            const lvl = BAC_LEVELS.find(l => bac <= l.max) || BAC_LEVELS[BAC_LEVELS.length - 1]
            const isYours = w === wKg || Math.abs(w - wKg) < 5
            return (
              <button key={i} onClick={() => setWKg(w)} style={{ display:'flex', alignItems:'center', gap:12, padding:'9px 14px', borderRadius:9, background:isYours ? lvl.color + '12' : 'var(--bg-raised)', border:`${isYours ? '1.5' : '0.5'}px solid ${isYours ? lvl.color : 'var(--border)'}`, cursor:'pointer', textAlign:'left' }}>
                <div style={{ width:46, flexShrink:0 }}>
                  <div style={{ fontSize:13, fontWeight:isYours ? 700 : 500, color:isYours ? lvl.color : 'var(--text)' }}>{w}kg</div>
                </div>
                <div style={{ flex:1, height:6, background:'var(--border)', borderRadius:3 }}>
                  <div style={{ height:'100%', width:`${(bac / 0.3) * 100}%`, background:lvl.color, borderRadius:3, transition:'width .4s' }} />
                </div>
                <div style={{ minWidth:55, textAlign:'right' }}>
                  <div style={{ fontSize:13, fontWeight:700, color:lvl.color }}>{bac.toFixed(3)}%</div>
                  <div style={{ fontSize:9, color:'var(--text-3)' }}>{lvl.label}</div>
                </div>
                {isYours && <div style={{ fontSize:9, fontWeight:700, color:lvl.color, background:lvl.color + '18', padding:'2px 6px', borderRadius:5, flexShrink:0 }}>YOU</div>}
              </button>
            )
          })}
        </div>
        <p style={{ fontSize:11, color:'var(--text-3)', lineHeight:1.6, margin:'10px 0 0' }}>Tap any row to set it as your weight.</p>
      </Sec>

      {/* ── 🧠 INTERESTING ── */}
      <Sec title="Why women have higher BAC than men at the same intake" sub="Three biological reasons">
        <p style={{ fontSize:12, color:'var(--text-2)', lineHeight:1.7, marginBottom:14, fontFamily:"'DM Sans',sans-serif" }}>
          Even at identical body weight and intake, women typically have 20–30% higher BAC. This is why the Widmark formula uses different distribution ratios (r=0.68 male, r=0.55 female).
        </p>
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {[
            { title:'Less body water',    desc:'Women typically have 45–55% body water vs 55–65% in men. Alcohol distributes in body water — the same amount is diluted into less fluid, producing higher concentration.', icon:'💧', color:catColor },
            { title:'Lower ADH enzyme',   desc:'Women produce less alcohol dehydrogenase (ADH) in the stomach lining — the enzyme that begins breaking down alcohol before it even reaches the bloodstream. More reaches the blood intact.', icon:'⚗️', color:'#8b5cf6' },
            { title:'Hormonal variation', desc:"BAC peaks higher during ovulation and the luteal phase of the menstrual cycle. Oral contraceptives also slow alcohol metabolism. The same drinks genuinely hit harder on some days than others — this is not psychological.", icon:'📊', color:'#ec4899' },
          ].map((s, i) => (
            <div key={i} style={{ display:'flex', gap:12, padding:'11px 13px', borderRadius:9, background:'var(--bg-raised)', border:'0.5px solid var(--border)' }}>
              <span style={{ fontSize:18, flexShrink:0 }}>{s.icon}</span>
              <div>
                <div style={{ fontSize:12, fontWeight:700, color:s.color, marginBottom:3 }}>{s.title}</div>
                <div style={{ fontSize:11.5, color:'var(--text-2)', lineHeight:1.6 }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </Sec>

      {/* ── ⚡ FUN FACT ── */}
      <Sec title="⚡ BAC facts worth knowing">
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {[
            { f:'The 0.08% BAC driving limit in the US and UK was not based on safety research — it was a political compromise. Research suggests impairment begins at 0.05%. Germany and Australia use 0.05% as their limit.', icon:'🚗' },
            { f:'Water, coffee, food, and exercise do not lower BAC. They only manage symptoms. The liver processes alcohol at a fixed rate of ~1 unit/hour regardless of what else you do.', icon:'💊' },
            { f:'Breath alcohol (breathalyser) is converted to blood alcohol using a 2,100:1 ratio — 2,100mL of breath contains the same alcohol as 1mL of blood. This is why breath tests are legally admissible.', icon:'🫁' },
            { f:'Carbonated drinks (champagne, prosecco, mixers with fizzy drinks) absorb ~20% faster than still drinks. The carbonation opens the pyloric valve, speeding alcohol into the small intestine where most absorption occurs.', icon:'🥂' },
          ].map((f, i) => (
            <div key={i} style={{ display:'flex', gap:12, padding:'11px 14px', borderRadius:9, background:'var(--bg-raised)', border:'0.5px solid var(--border)' }}>
              <span style={{ fontSize:18, flexShrink:0 }}>{f.icon}</span>
              <p style={{ fontSize:12, color:'var(--text-2)', lineHeight:1.65, margin:0 }}>{f.f}</p>
            </div>
          ))}
        </div>
      </Sec>

      <Sec title="Frequently asked questions">
        {FAQ.map((f, i) => (<Acc key={i} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} catColor={catColor} />))}
      </Sec>
    </div>
  )
}
