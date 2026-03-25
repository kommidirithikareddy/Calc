import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'

const clamp = (v,a,b) => Math.min(b, Math.max(a, v))

const SPO2_CATS = [
  { label:'Normal',          min:95, color:'#10b981', soft:'#d1fae5', desc:'Healthy SpO2. No action needed.' },
  { label:'Acceptable',      min:91, color:'#22a355', soft:'#dcfce7', desc:'Slightly below normal. Monitor closely.' },
  { label:'Mildly low',      min:86, color:'#f59e0b', soft:'#fef3c7', desc:'Mild hypoxia. Consult a doctor.' },
  { label:'Dangerously low', min:0,  color:'#ef4444', soft:'#fee2e2', desc:'Severe hypoxia. Seek immediate medical help.' },
]

const FAQ = [
  { q:'What is a normal SpO2 reading?',
    a:'Normal SpO2 for healthy adults at sea level is 95–100%. Values of 91–94% are mildly below normal. Below 90% is clinically considered hypoxia and warrants immediate medical attention. Readings below 85% are dangerous. Pulse oximeter accuracy can be affected by nail polish, cold hands, poor circulation, movement, and skin tone — consumer devices can be less accurate for darker skin tones.' },
  { q:'Can I rely on a home pulse oximeter?',
    a:'Consumer pulse oximeters are generally accurate to ±2% in the 90–100% range but become less reliable below 90%. For accurate readings: ensure the probe is on a warm finger, remove nail polish, sit still, and take 3 readings, averaging them. Persistent readings below 94% warrant medical evaluation regardless of device type.' },
  { q:'Why does altitude affect SpO2?',
    a:'At high altitude, atmospheric pressure is lower, meaning each breath contains fewer oxygen molecules. At 2,000m, SpO2 typically drops 2–3%; at 4,000m, it may drop 5–8%. This is why mountaineers use supplemental oxygen. Acclimatisation over several days allows the body to compensate by producing more red blood cells.' },
  { q:'What conditions can cause low SpO2?',
    a:'Common causes of chronically low SpO2: sleep apnoea (drops during sleep), COPD, asthma, pneumonia, heart failure, and pulmonary embolism. Temporary causes: breath-holding, hyperventilation, and poor sensor contact. If you consistently read below 94% without being at altitude, speak with a doctor.' },
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

function InsightSection({ spo2, adjusted, altitude, cat, score, catColor }) {
  let title = ''
  let message = ''
  let recommendation = ''

  if (adjusted >= 95) {
    title = 'Healthy oxygen level'
    message = 'Your reading is in the normal range for most healthy adults. This suggests oxygen delivery is currently adequate.'
    recommendation = 'No immediate action is usually needed. Keep tracking only if you are unwell, at altitude, or using SpO2 as part of medical guidance.'
  } else if (adjusted >= 91) {
    title = 'Slightly below ideal'
    message = 'Your oxygen saturation is a little below the usual normal range. This may happen at altitude, with measurement error, or during mild illness.'
    recommendation = 'Repeat the reading carefully after resting. If it stays low, especially at sea level, monitor more closely.'
  } else if (adjusted >= 86) {
    title = 'Mild hypoxia range'
    message = 'Your reading suggests oxygen saturation is below the normal range and may require attention, especially if symptoms are present.'
    recommendation = 'Retest carefully and consider medical advice, particularly if you have shortness of breath, chest symptoms, lung disease, or are not at altitude.'
  } else {
    title = 'Potentially dangerous reading'
    message = 'This reading is significantly low and may reflect severe hypoxia or a bad reading. It should not be ignored.'
    recommendation = 'Recheck immediately. If confirmed or accompanied by symptoms, seek urgent medical care.'
  }

  return (
    <Sec title="Your oxygen insight" sub={title}>
      <div style={{ display:'grid', gap:14 }}>
        <div style={{ padding:'14px 15px', borderRadius:12, background:cat.soft, border:`1px solid ${cat.color}35` }}>
          <div style={{ fontSize:13, fontWeight:700, color:cat.color, marginBottom:6, fontFamily:"'Space Grotesk',sans-serif" }}>
            {cat.label}
          </div>
          <p style={{ margin:0, fontSize:12.5, color:'var(--text-2)', lineHeight:1.75, fontFamily:"'DM Sans',sans-serif" }}>
            {message}
          </p>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(3, minmax(0, 1fr))', gap:10 }}>
          {[
            { label:'Measured SpO2', value:`${spo2}%` },
            { label:'Adjusted SpO2', value:`${adjusted}%` },
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
          {altitude > 0 && (
            <p style={{ margin:'8px 0 0', fontSize:11.5, color:'var(--text-3)', lineHeight:1.7, fontFamily:"'DM Sans',sans-serif" }}>
              Because you entered altitude, this interpretation uses an approximate altitude adjustment.
            </p>
          )}
        </div>
      </div>
    </Sec>
  )
}

function ActionSection({ adjusted, altitude, catColor }) {
  let items = []

  if (adjusted >= 95) {
    items = [
      'Take readings only when needed and under consistent conditions.',
      'If you are sick, compare trends over time rather than relying on a single number.',
      'At altitude, expect slightly lower values than at sea level.',
    ]
  } else if (adjusted >= 91) {
    items = [
      'Warm your hands, sit still, and repeat the reading 2–3 times.',
      'Remove nail polish and avoid checking immediately after movement.',
      `If readings remain low${altitude === 0 ? ' at sea level' : ''}, keep monitoring and consider medical advice.`,
    ]
  } else if (adjusted >= 86) {
    items = [
      'Retest after sitting calmly for several minutes.',
      'Check for symptoms like shortness of breath, bluish lips, dizziness, or chest discomfort.',
      'Speak with a clinician, especially if the value stays low or you have lung or heart disease.',
    ]
  } else {
    items = [
      'Repeat the reading immediately to rule out device or finger-placement error.',
      'Do not ignore symptoms such as breathlessness, confusion, or chest pain.',
      'Seek urgent medical attention if the low reading is confirmed or symptoms are present.',
    ]
  }

  return (
    <Sec title="What to do next" sub="Simple guidance based on your reading">
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
    'Warm fingers before measuring.',
    'Remove nail polish or artificial nails if possible.',
    'Sit still and avoid talking during the reading.',
    'Take 3 readings and average them.',
    'Avoid checking immediately after exercise.',
    'Use the same finger each time for consistency.',
  ]

  return (
    <Sec title="Reading quality checklist" sub="Get more reliable SpO2 results">
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

function AltitudeSection({ altitude, altAdj, adjusted, catColor }) {
  const band =
    altitude === 0 ? 'Sea level'
    : altitude < 1500 ? 'Low altitude'
    : altitude < 3000 ? 'Moderate altitude'
    : altitude < 5000 ? 'High altitude'
    : 'Extreme altitude'

  return (
    <Sec title="Altitude interpretation" sub="Why readings change above sea level">
      <div style={{ display:'grid', gap:14 }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3, minmax(0, 1fr))', gap:10 }}>
          <div style={{ padding:'12px 10px', borderRadius:10, background:'var(--bg-raised)', border:'0.5px solid var(--border)' }}>
            <div style={{ fontSize:10.5, color:'var(--text-3)', marginBottom:4 }}>Altitude</div>
            <div style={{ fontSize:15, fontWeight:700, color:'var(--text)', fontFamily:"'Space Grotesk',sans-serif" }}>{altitude} m</div>
          </div>
          <div style={{ padding:'12px 10px', borderRadius:10, background:'var(--bg-raised)', border:'0.5px solid var(--border)' }}>
            <div style={{ fontSize:10.5, color:'var(--text-3)', marginBottom:4 }}>Adjustment</div>
            <div style={{ fontSize:15, fontWeight:700, color:catColor, fontFamily:"'Space Grotesk',sans-serif" }}>−{altAdj}%</div>
          </div>
          <div style={{ padding:'12px 10px', borderRadius:10, background:'var(--bg-raised)', border:'0.5px solid var(--border)' }}>
            <div style={{ fontSize:10.5, color:'var(--text-3)', marginBottom:4 }}>Environment</div>
            <div style={{ fontSize:15, fontWeight:700, color:'var(--text)', fontFamily:"'Space Grotesk',sans-serif" }}>{band}</div>
          </div>
        </div>

        <div style={{ padding:'12px 14px', borderRadius:10, background:catColor + '10', border:`1px solid ${catColor}35` }}>
          <p style={{ margin:0, fontSize:12.5, color:'var(--text-2)', lineHeight:1.7, fontFamily:"'DM Sans',sans-serif" }}>
            As altitude increases, oxygen pressure falls, so SpO2 readings often run lower than at sea level. Your estimated altitude-adjusted reading is <strong style={{ color:catColor }}>{adjusted}%</strong>.
          </p>
        </div>
      </div>
    </Sec>
  )
}

function MedicalHelpSection({ adjusted, catColor }) {
  const riskCards = [
    {
      title:'Monitor',
      active: adjusted >= 91 && adjusted < 95,
      text:'Repeat readings and watch for symptoms if values remain slightly below normal.',
      color:'#22a355',
      soft:'#dcfce7',
    },
    {
      title:'Call a clinician',
      active: adjusted >= 86 && adjusted < 91,
      text:'Persistent low readings should be medically reviewed, especially with symptoms or chronic illness.',
      color:'#f59e0b',
      soft:'#fef3c7',
    },
    {
      title:'Urgent help',
      active: adjusted < 86,
      text:'Very low readings can be serious. Seek urgent care if confirmed or if symptoms are present.',
      color:'#ef4444',
      soft:'#fee2e2',
    },
  ]

  return (
    <Sec title="When to seek medical help" sub="Important safety context">
      <div style={{ display:'grid', gap:10 }}>
        {riskCards.map((item, i) => (
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
          This calculator is informational and not a diagnosis. Symptoms matter as much as the number.
        </p>
      </div>
    </Sec>
  )
}

export default function OxygenSaturationCalculator({ meta, category }) {
  const catColor = category?.color || '#0ea5e9'
  const [spo2, setSpo2] = useState(98)
  const [altitude, setAltitude] = useState(0)
  const [openFaq, setOpenFaq] = useState(null)

  const altAdj = Math.max(0, Math.round(altitude / 1000 * 2))
  const adjusted = spo2 - altAdj
  const cat = SPO2_CATS.find(c => adjusted >= c.min) || SPO2_CATS[SPO2_CATS.length - 1]
  const score = clamp(Math.round((adjusted - 75) / 25 * 100), 0, 100)

  const R = 42
  const C = 54
  const circ = 2 * Math.PI * R
  const fill = circ * (score / 100)

  const hint = `SpO2: ${spo2}% — ${cat.label}. ${altitude > 0 ? `At ${altitude}m altitude, effective SpO2 ≈ ${adjusted}%.` : 'At sea level.'} ${cat.desc}`

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <CalcShell
        left={
          <>
            <div style={{ fontSize:10, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:14 }}>
              Your reading
            </div>

            <Stepper
              label="Oxygen saturation (SpO2)"
              value={spo2}
              onChange={setSpo2}
              min={50}
              max={100}
              unit="%"
              hint="From pulse oximeter"
              catColor={catColor}
            />

            <Stepper
              label="Altitude"
              value={altitude}
              onChange={setAltitude}
              min={0}
              max={8000}
              step={100}
              unit="m"
              hint="Sea level = 0"
              catColor={catColor}
            />

            <div style={{ borderTop:'0.5px solid var(--border)', paddingTop:16, marginTop:4 }}>
              <div style={{ fontSize:12, fontWeight:600, color:'var(--text-2)', marginBottom:10, fontFamily:"'DM Sans',sans-serif" }}>
                SpO2 categories
              </div>
              {SPO2_CATS.map((c, i) => (
                <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'7px 10px', borderRadius:7, background:cat.label === c.label ? c.soft : 'var(--bg-raised)', border:`${cat.label === c.label ? '1.5' : '0.5'}px solid ${cat.label === c.label ? c.color : 'var(--border)'}`, marginBottom:4 }}>
                  <span style={{ fontSize:11, fontWeight:cat.label === c.label ? 700 : 500, color:c.color }}>{c.label}</span>
                  <span style={{ fontSize:10, color:'var(--text-3)' }}>{c.min}%+</span>
                </div>
              ))}
            </div>

            <div style={{ borderTop:'0.5px solid var(--border)', paddingTop:14, marginTop:12 }}>
              <div style={{ fontSize:12, fontWeight:600, color:'var(--text-2)', marginBottom:8, fontFamily:"'DM Sans',sans-serif" }}>
                Tips for accurate readings
              </div>
              <p style={{ fontSize:11.5, color:'var(--text-3)', lineHeight:1.65, margin:0, fontFamily:"'DM Sans',sans-serif" }}>
                Warm hands, no nail polish, sit still. Hold breath briefly during reading. Take 3 readings and average. Avoid measuring immediately after exercise.
              </p>
            </div>
          </>
        }
        right={
          <>
            <div style={{ background:'var(--bg-card)', border:'0.5px solid var(--border)', borderRadius:14, overflow:'hidden', marginBottom:14 }}>
              <div style={{ padding:'11px 16px', borderBottom:'0.5px solid var(--border)', display:'flex', justifyContent:'space-between' }}>
                <span style={{ fontSize:12, fontWeight:700, color:'var(--text)', fontFamily:"'Space Grotesk',sans-serif" }}>
                  Oxygen Saturation
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
                    <div style={{ fontSize:32, fontWeight:700, color:cat.color, fontFamily:"'Space Grotesk',sans-serif", lineHeight:1 }}>
                      {spo2}%
                    </div>
                    <div style={{ fontSize:10, color:'var(--text-3)', marginTop:3 }}>
                      SpO2{altitude > 0 ? ` (adj: ${adjusted}% @ ${altitude}m)` : ' at sea level'}
                    </div>
                  </div>
                </div>

                {[
                  { label:'Normal',     range:'95–100%', ok:adjusted >= 95 },
                  { label:'Acceptable', range:'91–94%',  ok:adjusted >= 91 && adjusted < 95 },
                  { label:'Mildly low', range:'86–90%',  ok:adjusted >= 86 && adjusted < 91 },
                  { label:'Critical',   range:'< 86%',   ok:adjusted < 86 },
                ].map((r, i) => (
                  <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'6px 10px', borderRadius:7, background:r.ok ? cat.soft : 'var(--bg-raised)', border:`0.5px solid ${r.ok ? cat.color + '40' : 'var(--border)'}`, marginBottom:3 }}>
                    <span style={{ fontSize:11, color:r.ok ? cat.color : 'var(--text-2)', fontWeight:r.ok ? 700 : 400 }}>{r.label}</span>
                    <span style={{ fontSize:11, color:r.ok ? cat.color : 'var(--text-3)' }}>{r.range}</span>
                  </div>
                ))}

                {altitude > 0 && (
                  <div style={{ marginTop:10, padding:'9px 12px', background:'#fef3c7', borderRadius:8, border:'1px solid #f59e0b30' }}>
                    <div style={{ fontSize:11.5, color:'var(--text-2)', lineHeight:1.55 }}>
                      At {altitude}m altitude, SpO2 is typically {altAdj}% lower than at sea level. Your altitude-adjusted reading is approximately <strong style={{ color:'#f59e0b' }}>{adjusted}%</strong>.
                    </div>
                  </div>
                )}
              </div>
            </div>

            <BreakdownTable
              title="SpO2 Summary"
              rows={[
                { label:'SpO2', value:`${spo2}%`, bold:true, highlight:true, color:cat.color },
                { label:'Category', value:cat.label, color:cat.color },
                { label:'Altitude', value:`${altitude}m` },
                { label:'Altitude adj.', value:altitude > 0 ? `−${altAdj}% ≈ ${adjusted}% adjusted` : 'None (sea level)' },
                { label:'Score', value:`${score}/100`, color:cat.color },
              ]}
            />
            <AIHintCard hint={hint} />
          </>
        }
      />

      <InsightSection
        spo2={spo2}
        adjusted={adjusted}
        altitude={altitude}
        cat={cat}
        score={score}
        catColor={catColor}
      />

      <ActionSection
        adjusted={adjusted}
        altitude={altitude}
        catColor={catColor}
      />

      <ReadingChecklist catColor={catColor} />

      <AltitudeSection
        altitude={altitude}
        altAdj={altAdj}
        adjusted={adjusted}
        catColor={catColor}
      />

      <MedicalHelpSection
        adjusted={adjusted}
        catColor={catColor}
      />

      <Sec title="Frequently asked questions" sub="Oxygen saturation explained">
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