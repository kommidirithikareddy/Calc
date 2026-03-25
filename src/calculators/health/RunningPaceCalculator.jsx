import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'

const clamp = (v,a,b) => Math.min(b, Math.max(a, v))

const DISTANCES = [
  { key:'1mi',   label:'1 Mile',        km:1.60934 },
  { key:'5k',    label:'5K',            km:5 },
  { key:'10k',   label:'10K',           km:10 },
  { key:'half',  label:'Half Marathon', km:21.0975 },
  { key:'full',  label:'Full Marathon', km:42.195 },
  { key:'custom',label:'Custom',        km:0 },
]

const PACE_ZONES = [
  { label:'Recovery',  minPerKm:7.5, color:'#94a3b8', desc:'Very easy, conversational' },
  { label:'Easy',      minPerKm:6.5, color:'#22a355', desc:'Can hold a full conversation' },
  { label:'Tempo',     minPerKm:5.0, color:'#3b82f6', desc:'Comfortably hard' },
  { label:'Threshold', minPerKm:4.5, color:'#f59e0b', desc:'Hard, sustainable 30–60 min' },
  { label:'Race pace', minPerKm:4.0, color:'#f97316', desc:'Near-maximum sustained effort' },
  { label:'Interval',  minPerKm:3.5, color:'#ef4444', desc:'Fast, short repeats only' },
]

const FAQ = [
  { q:'What is a good running pace?',
    a:'It depends entirely on age, experience, and distance. A good pace is one that improves steadily over time and matches your current training level.' },
  { q:'How do I run faster?',
    a:'Build easy mileage, add 1–2 quality sessions weekly, and increase training gradually. Consistency matters more than one hard workout.' },
  { q:'How do I calculate my finish time from pace?',
    a:'Finish time = pace × distance. For example, 5:30/km over 10K = 55:00.' },
]

const fmtTime = totalSec => {
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = Math.round(totalSec % 60)
  return h > 0
    ? `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
    : `${m}:${String(s).padStart(2,'0')}`
}

const fmtPace = secPerKm => {
  const m = Math.floor(secPerKm / 60)
  const s = Math.round(secPerKm % 60)
  return `${m}:${String(s).padStart(2,'0')}`
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
  const commit = r => {
    const n = parseFloat(r)
    onChange(clamp(isNaN(n) ? value : n, min, max))
    setEditing(false)
  }
  const btn = { width:38, height:'100%', border:'none', background:'var(--bg-raised)', color:'var(--text)', fontSize:20, fontWeight:300, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }

  return (
    <div style={{ marginBottom:16 }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
        <label style={{ fontSize:12.5, fontWeight:600, color:'var(--text)', fontFamily:"'DM Sans',sans-serif" }}>{label}</label>
        {hint && <span style={{ fontSize:10, color:'var(--text-3)' }}>{hint}</span>}
      </div>
      <div style={{ display:'flex', alignItems:'stretch', height:40, border:`1.5px solid ${editing ? catColor : 'var(--border-2)'}`, borderRadius:9, overflow:'hidden', background:'var(--bg-card)', transition:'border-color .15s' }}>
        <button onMouseDown={e => { e.preventDefault(); onChange(clamp(value - step, min, max)) }} style={{ ...btn, borderRight:'1px solid var(--border)' }}>−</button>
        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:5 }}>
          {editing
            ? <input type="number" defaultValue={value} onBlur={e => commit(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') commit(e.target.value); if (e.key === 'Escape') setEditing(false) }} style={{ width:'55%', border:'none', background:'transparent', textAlign:'center', fontSize:15, fontWeight:700, color:'var(--text)', outline:'none' }} autoFocus />
            : <span onClick={() => setEditing(true)} style={{ fontSize:15, fontWeight:700, color:'var(--text)', cursor:'text', minWidth:36, textAlign:'center' }}>{value}</span>}
          <span style={{ fontSize:11, color:'var(--text-3)', fontWeight:500 }}>{unit}</span>
        </div>
        <button onMouseDown={e => { e.preventDefault(); onChange(clamp(value + step, min, max)) }} style={{ ...btn, borderLeft:'1px solid var(--border)' }}>+</button>
      </div>
    </div>
  )
}

function RaceInsightSection({ dist, displayPaceSec, displayFinSec, speedKmh, paceZone, catColor }) {
  return (
    <Sec title="Your race insight" sub="What this pace says">
      <div style={{ display:'grid', gap:12 }}>
        <div style={{ padding:'12px 14px', borderRadius:10, background:catColor+'10', border:`1px solid ${catColor}35` }}>
          <div style={{ fontSize:13, fontWeight:700, color:catColor, marginBottom:5 }}>Current pace summary</div>
          <div style={{ fontSize:12.5, color:'var(--text-2)', lineHeight:1.7 }}>
            At <strong>{fmtPace(displayPaceSec)}/km</strong>, your projected <strong>{dist.label}</strong> finish is <strong>{fmtTime(displayFinSec)}</strong>. This pace sits in the <strong style={{ color:paceZone.color }}>{paceZone.label}</strong> zone.
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8 }}>
          {[
            { label:'Pace', value:`${fmtPace(displayPaceSec)}/km` },
            { label:'Speed', value:`${speedKmh.toFixed(1)} km/h` },
            { label:'Finish', value:fmtTime(displayFinSec) },
            { label:'Zone', value:paceZone.label },
          ].map((x, i) => (
            <div key={i} style={{ padding:'10px 12px', borderRadius:8, background:'var(--bg-raised)', border:'0.5px solid var(--border)' }}>
              <div style={{ fontSize:10, color:'var(--text-3)', marginBottom:4 }}>{x.label}</div>
              <div style={{ fontSize:15, fontWeight:700, color:'var(--text)', fontFamily:"'Space Grotesk',sans-serif" }}>{x.value}</div>
            </div>
          ))}
        </div>
      </div>
    </Sec>
  )
}

function SplitStrategySection({ displayPaceSec, displayFinSec, catColor }) {
  const firstHalfPace = displayPaceSec * 1.02
  const secondHalfPace = displayPaceSec * 0.98

  return (
    <Sec title="Split strategy" sub="Run smarter, not just harder">
      <div style={{ display:'grid', gap:8 }}>
        {[
          { title:'First half', desc:`Open slightly controlled at about ${fmtPace(firstHalfPace)}/km.` },
          { title:'Second half', desc:`Aim to close closer to ${fmtPace(secondHalfPace)}/km if you feel strong.` },
          { title:'Why it works', desc:'Negative splits usually reduce blow-ups and produce stronger overall finishes.' },
        ].map((item, i) => (
          <div key={i} style={{ padding:'11px 13px', borderRadius:8, background:i === 1 ? catColor+'10' : 'var(--bg-raised)', border:`0.5px solid ${i === 1 ? catColor+'35' : 'var(--border)'}` }}>
            <div style={{ fontSize:12, fontWeight:700, color:i === 1 ? catColor : 'var(--text)', marginBottom:4 }}>{item.title}</div>
            <div style={{ fontSize:11.5, color:'var(--text-2)', lineHeight:1.6 }}>{item.desc}</div>
          </div>
        ))}
      </div>
    </Sec>
  )
}

function PaceEquivalentsSection({ displayPaceSec, catColor }) {
  return (
    <Sec title="Pace equivalents" sub="See your pace in different formats">
      <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:8 }}>
        {[
          { label:'Per kilometre', value:`${fmtPace(displayPaceSec)}/km` },
          { label:'Per mile', value:`${fmtPace(displayPaceSec * 1.60934)}/mi` },
          { label:'400m track split', value:fmtTime(displayPaceSec * 0.4) },
          { label:'200m repeat', value:fmtTime(displayPaceSec * 0.2) },
        ].map((x, i) => (
          <div key={i} style={{ padding:'10px 12px', borderRadius:8, background:i === 0 ? catColor+'10' : 'var(--bg-raised)', border:`0.5px solid ${i === 0 ? catColor+'35' : 'var(--border)'}` }}>
            <div style={{ fontSize:10, color:'var(--text-3)', marginBottom:4 }}>{x.label}</div>
            <div style={{ fontSize:16, fontWeight:700, color:i === 0 ? catColor : 'var(--text)', fontFamily:"'Space Grotesk',sans-serif" }}>{x.value}</div>
          </div>
        ))}
      </div>
    </Sec>
  )
}

function TrainingSuggestionsSection({ paceZone, catColor }) {
  const tips =
    paceZone.label === 'Recovery' || paceZone.label === 'Easy'
      ? [
          'Build consistent weekly mileage first.',
          'Add short strides after easy runs.',
          'Focus on frequency before intensity.',
        ]
      : paceZone.label === 'Tempo'
      ? [
          'Use 1 tempo workout each week.',
          'Keep easy days truly easy.',
          'Long runs will help hold this pace longer.',
        ]
      : [
          'This is a demanding pace, so recovery matters more.',
          'Use quality sessions carefully, not every day.',
          'Alternate hard workouts with easy aerobic running.',
        ]

  return (
    <Sec title="How to improve this pace" sub="Smart training ideas">
      <div style={{ display:'grid', gap:8 }}>
        {tips.map((t, i) => (
          <div key={i} style={{ display:'flex', gap:10, padding:'11px 13px', borderRadius:8, background:'var(--bg-raised)', border:'0.5px solid var(--border)' }}>
            <div style={{ width:20, height:20, borderRadius:'50%', background:catColor+'18', color:catColor, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, flexShrink:0 }}>{i + 1}</div>
            <div style={{ fontSize:11.5, color:'var(--text-2)', lineHeight:1.6 }}>{t}</div>
          </div>
        ))}
      </div>
    </Sec>
  )
}

function InterestingFactsSection({ displayPaceSec, dist, displayFinSec, catColor }) {
  const faster10 = Math.max(displayPaceSec - 10, 1)
  const saved = Math.max(displayFinSec - faster10 * dist.km, 0)

  return (
    <Sec title="Interesting pace facts" sub="Small changes add up">
      <div style={{ display:'grid', gap:8 }}>
        {[
          `Improving by just 10 seconds per kilometre would save about ${fmtTime(saved)} over ${dist.label}.`,
          `Your current pace equals ${fmtPace(displayPaceSec * 1.60934)} per mile.`,
          'Even small pace improvements create big gains over longer race distances.',
        ].map((x, i) => (
          <div key={i} style={{ padding:'11px 13px', borderRadius:8, background:i === 0 ? catColor+'10' : 'var(--bg-raised)', border:`0.5px solid ${i === 0 ? catColor+'35' : 'var(--border)'}`, fontSize:11.5, color:'var(--text-2)', lineHeight:1.6 }}>
            {x}
          </div>
        ))}
      </div>
    </Sec>
  )
}

export default function RunningPaceCalculator({ meta, category }) {
  const catColor = category?.color || '#22a355'
  const [mode, setMode] = useState('pace_to_time')
  const [distKey, setDistKey] = useState('10k')
  const [customKm, setCustomKm] = useState(5)
  const [paceMin, setPaceMin] = useState(5)
  const [paceSec, setPaceSec] = useState(30)
  const [finHours, setFinHours] = useState(0)
  const [finMins, setFinMins] = useState(55)
  const [finSecs, setFinSecs] = useState(0)
  const [openFaq, setOpenFaq] = useState(null)

  const dist = DISTANCES.find(d => d.key === distKey) || DISTANCES[1]
  const km = dist.key === 'custom' ? customKm : dist.km
  const paceSecPerKm = paceMin * 60 + paceSec
  const finTotalSec = finHours * 3600 + finMins * 60 + finSecs
  const derivedPaceSec = km > 0 ? finTotalSec / km : 0
  const derivedFinSec = paceSecPerKm * km

  const displayPaceSec = mode === 'pace_to_time' ? paceSecPerKm : derivedPaceSec
  const displayFinSec = mode === 'pace_to_time' ? derivedFinSec : finTotalSec
  const speedKmh = 3600 / displayPaceSec

  const paceZone = PACE_ZONES.slice().reverse().find(z => displayPaceSec / 60 <= z.minPerKm) || PACE_ZONES[0]

  const storyColors = [catColor, '#0ea5e9', '#f59e0b']
  const storySofts = [catColor + '18', '#e0f2fe', '#fef3c7']
  const stories = [
    { label:'Your pace',
      headline:`${fmtPace(displayPaceSec)}/km — ${paceZone.label}`,
      detail:`That is ${speedKmh.toFixed(1)} km/h. ${paceZone.desc}. For ${dist.label}, at this pace you will finish in ${fmtTime(displayFinSec)}.` },
    { label:'Splits strategy',
      headline:`Target ${fmtPace(displayPaceSec * 0.98)}/km for the second half`,
      detail:`A slightly controlled start often leads to a stronger finish than going out too fast.` },
    { label:'The pace to beat',
      headline:`${fmtPace(displayPaceSec * 0.95)}/km is your next target`,
      detail:`A 5% pace improvement creates a meaningful finish-time drop over race distance.` },
  ]

  const hint = `Pace: ${fmtPace(displayPaceSec)}/km (${speedKmh.toFixed(1)} km/h). ${dist.label} finish: ${fmtTime(displayFinSec)}. Zone: ${paceZone.label}.`

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <CalcShell
        left={<>
          <div style={{ marginBottom:18 }}>
            <div style={{ fontSize:12, fontWeight:600, color:'var(--text-2)', marginBottom:8, fontFamily:"'DM Sans',sans-serif" }}>Calculate</div>
            <div style={{ display:'flex', gap:8 }}>
              {[{ v:'pace_to_time', l:'Pace → Finish time' }, { v:'time_to_pace', l:'Finish time → Pace' }].map(o => (
                <button key={o.v} onClick={() => setMode(o.v)} style={{ flex:1, padding:'9px 6px', borderRadius:8, fontSize:11, fontWeight:mode === o.v ? 700 : 500, color:mode === o.v ? catColor : 'var(--text-2)', border:`1.5px solid ${mode === o.v ? catColor : 'var(--border-2)'}`, background:mode === o.v ? catColor + '12' : 'var(--bg-raised)', cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>{o.l}</button>
              ))}
            </div>
          </div>

          <div style={{ borderTop:'0.5px solid var(--border)', paddingTop:16, marginBottom:4 }}>
            <div style={{ fontSize:12, fontWeight:600, color:'var(--text-2)', marginBottom:8, fontFamily:"'DM Sans',sans-serif" }}>Distance</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:6 }}>
              {DISTANCES.map(d => (
                <button key={d.key} onClick={() => setDistKey(d.key)} style={{ padding:'8px 4px', borderRadius:8, fontSize:11, fontWeight:distKey === d.key ? 700 : 500, color:distKey === d.key ? catColor : 'var(--text-2)', border:`1.5px solid ${distKey === d.key ? catColor : 'var(--border-2)'}`, background:distKey === d.key ? catColor + '12' : 'var(--bg-raised)', cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>{d.label}</button>
              ))}
            </div>
            {distKey === 'custom' && (
              <div style={{ marginTop:10 }}>
                <Stepper label="Custom distance" value={customKm} onChange={setCustomKm} min={0.1} max={200} step={0.5} unit="km" catColor={catColor} />
              </div>
            )}
          </div>

          <div style={{ borderTop:'0.5px solid var(--border)', paddingTop:16 }}>
            {mode === 'pace_to_time' ? (
              <>
                <div style={{ fontSize:10, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:14 }}>Your pace</div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                  <Stepper label="Minutes" value={paceMin} onChange={setPaceMin} min={2} max={20} unit="min" catColor={catColor} />
                  <Stepper label="Seconds" value={paceSec} onChange={setPaceSec} min={0} max={59} unit="sec" catColor={catColor} />
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize:10, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:14 }}>Your finish time</div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
                  <Stepper label="Hours" value={finHours} onChange={setFinHours} min={0} max={24} unit="hr" catColor={catColor} />
                  <Stepper label="Minutes" value={finMins} onChange={setFinMins} min={0} max={59} unit="min" catColor={catColor} />
                  <Stepper label="Seconds" value={finSecs} onChange={setFinSecs} min={0} max={59} unit="sec" catColor={catColor} />
                </div>
              </>
            )}
          </div>
        </>}
        right={<>
          <div style={{ background:'var(--bg-card)', border:'0.5px solid var(--border)', borderRadius:14, overflow:'hidden', marginBottom:14 }}>
            <div style={{ padding:'11px 16px', borderBottom:'0.5px solid var(--border)', display:'flex', justifyContent:'space-between' }}>
              <span style={{ fontSize:12, fontWeight:700, color:'var(--text)', fontFamily:"'Space Grotesk',sans-serif" }}>Your pace story</span>
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

          <BreakdownTable title="Pace Summary" rows={[
            { label:'Pace', value:`${fmtPace(displayPaceSec)}/km`, bold:true, highlight:true, color:catColor },
            { label:'Speed', value:`${speedKmh.toFixed(1)} km/h` },
            { label:'Pace (miles)', value:`${fmtPace(displayPaceSec * 1.60934)}/mi` },
            { label:'Finish time', value:fmtTime(displayFinSec), color:catColor },
            { label:'Distance', value:`${km.toFixed(4).replace(/\.?0+$/, '')} km` },
            { label:'Zone', value:paceZone.label, color:paceZone.color },
          ]} />

          <AIHintCard hint={hint} />
        </>}
      />

      <RaceInsightSection dist={dist} displayPaceSec={displayPaceSec} displayFinSec={displayFinSec} speedKmh={speedKmh} paceZone={paceZone} catColor={catColor} />

      <SplitStrategySection displayPaceSec={displayPaceSec} displayFinSec={displayFinSec} catColor={catColor} />

      <Sec title="Your pace across all race distances" sub="Projected finish times">
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          {DISTANCES.filter(d => d.key !== 'custom').map((d, i) => {
            const t = displayPaceSec * d.km
            return (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'9px 14px', borderRadius:8, background:distKey === d.key ? catColor + '10' : 'var(--bg-raised)', border:`${distKey === d.key ? '1.5' : '0.5'}px solid ${distKey === d.key ? catColor : 'var(--border)'}` }}>
                <div style={{ width:100, flexShrink:0 }}>
                  <div style={{ fontSize:12, fontWeight:700, color:distKey === d.key ? catColor : 'var(--text)' }}>{d.label}</div>
                  <div style={{ fontSize:10, color:'var(--text-3)' }}>{d.km.toFixed(4).replace(/\.?0+$/, '')} km</div>
                </div>
                <div style={{ flex:1, height:4, background:'var(--border)', borderRadius:2 }}>
                  <div style={{ height:'100%', width:`${(d.km / 42.195) * 100}%`, background:catColor, borderRadius:2, opacity:0.6 }} />
                </div>
                <div style={{ fontSize:13, fontWeight:700, color:catColor, minWidth:70, textAlign:'right' }}>{fmtTime(t)}</div>
              </div>
            )
          })}
        </div>
      </Sec>

      <PaceEquivalentsSection displayPaceSec={displayPaceSec} catColor={catColor} />

      <Sec title="Running pace zones" sub="Where does your pace fit?">
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          {PACE_ZONES.map((z, i) => {
            const isYours = z.label === paceZone.label
            return (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'9px 13px', borderRadius:8, background:isYours ? z.color + '12' : 'var(--bg-raised)', border:`${isYours ? '1.5' : '0.5'}px solid ${isYours ? z.color : 'var(--border)'}` }}>
                <div style={{ width:8, height:8, borderRadius:'50%', background:z.color, flexShrink:0 }} />
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:12, fontWeight:isYours ? 700 : 500, color:isYours ? z.color : 'var(--text)' }}>{z.label}</div>
                  <div style={{ fontSize:10, color:'var(--text-3)' }}>{z.desc}</div>
                </div>
                <div style={{ fontSize:11, fontWeight:600, color:'var(--text-2)' }}>&lt;{z.minPerKm}:00/km</div>
                {isYours && <div style={{ fontSize:9, fontWeight:700, background:z.color + '18', color:z.color, padding:'2px 7px', borderRadius:6 }}>YOUR PACE</div>}
              </div>
            )
          })}
        </div>
      </Sec>

      <TrainingSuggestionsSection paceZone={paceZone} catColor={catColor} />

      <InterestingFactsSection displayPaceSec={displayPaceSec} dist={dist} displayFinSec={displayFinSec} catColor={catColor} />

      <Sec title="Frequently asked questions" sub="Everything about running pace">
        {FAQ.map((f, i) => (<Acc key={i} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} catColor={catColor} />))}
      </Sec>
    </div>
  )
}