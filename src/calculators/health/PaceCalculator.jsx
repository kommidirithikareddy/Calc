import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'

const clamp = (v,a,b) => Math.min(b, Math.max(a, v))

const DISTANCES = [
  { key:'5k',    label:'5K',            km:5 },
  { key:'10k',   label:'10K',           km:10 },
  { key:'half',  label:'Half Marathon', km:21.0975 },
  { key:'full',  label:'Full Marathon', km:42.195 },
  { key:'1mi',   label:'1 Mile',        km:1.60934 },
  { key:'custom',label:'Custom',        km:0 },
]

const PACE_ZONES = [
  { label:'Recovery',   minPerKm:7.5, color:'#94a3b8', desc:'Conversational, very easy' },
  { label:'Easy',       minPerKm:6.5, color:'#22a355', desc:'Can hold a conversation' },
  { label:'Tempo',      minPerKm:5.0, color:'#3b82f6', desc:'Comfortably hard' },
  { label:'Threshold',  minPerKm:4.5, color:'#f59e0b', desc:'Hard, sustainable 30–60 min' },
  { label:'Race pace',  minPerKm:4.0, color:'#f97316', desc:'Near-maximum sustained effort' },
  { label:'Interval',   minPerKm:3.5, color:'#ef4444', desc:'Fast, short repeats only' },
]

const GLOSSARY = [
  { term:'Pace (min/km)',      def:'Time to run one kilometre. The inverse of speed. A faster runner has a lower pace.' },
  { term:'Negative Split',     def:'Running the second half of a race faster than the first half. This is often linked with stronger race execution.' },
  { term:'Cadence',            def:'Steps per minute. Many recreational runners are around 150–170 spm, while faster runners are often higher.' },
  { term:'Lactate Threshold',  def:'The pace where fatigue starts rising faster. Training near threshold is useful for performance gains.' },
  { term:'Race Predictor',     def:'A projected finish time at another distance based on the same current pace or effort.' },
]

const FAQ = [
  { q:'What is a good running pace?',
    a:'It depends on age, experience, training, terrain, and distance. A useful benchmark is not someone else’s pace, but whether your own pace is improving over time.' },
  { q:'How do I run faster?',
    a:'Build aerobic volume, add one quality workout per week, recover well, and increase training gradually. Most improvement comes from consistency rather than a single workout.' },
  { q:'How do I calculate finish time from pace?',
    a:'Finish time = pace × distance. For example, 5:30 per km over 10 km gives 55 minutes. This calculator does that automatically.' },
]

function Sec({title,sub,children}) {
  return (
    <div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,overflow:'hidden'}}>
      <div style={{padding:'13px 18px',borderBottom:'0.5px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <span style={{fontSize:13,fontWeight:700,color:'var(--text)',fontFamily:"'Space Grotesk',sans-serif"}}>{title}</span>
        {sub && <span style={{fontSize:11,color:'var(--text-3)'}}>{sub}</span>}
      </div>
      <div style={{padding:'16px 18px'}}>{children}</div>
    </div>
  )
}

function Acc({q,a,open,onToggle,catColor}) {
  return (
    <div style={{borderBottom:'0.5px solid var(--border)'}}>
      <button onClick={onToggle} style={{width:'100%',display:'flex',justifyContent:'space-between',alignItems:'center',padding:'13px 0',background:'none',border:'none',cursor:'pointer',gap:12,textAlign:'left'}}>
        <span style={{fontSize:13,fontWeight:600,color:'var(--text)',fontFamily:"'DM Sans',sans-serif",lineHeight:1.4}}>{q}</span>
        <span style={{fontSize:18,color:catColor,flexShrink:0,display:'inline-block',transform:open?'rotate(45deg)':'none',transition:'transform .2s'}}>+</span>
      </button>
      {open && <p style={{fontSize:12.5,color:'var(--text-2)',lineHeight:1.75,margin:'0 0 13px',fontFamily:"'DM Sans',sans-serif"}}>{a}</p>}
    </div>
  )
}

function GlsTerm({term,def,catColor}) {
  const [open,setOpen] = useState(false)
  return (
    <div onClick={()=>setOpen(o=>!o)} style={{padding:'9px 12px',borderRadius:8,cursor:'pointer',border:`1px solid ${open?catColor+'40':'var(--border)'}`,background:open?catColor+'10':'var(--bg-raised)'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:8}}>
        <span style={{fontSize:12,fontWeight:700,fontFamily:"'Space Grotesk',sans-serif",color:open?catColor:'var(--text)'}}>{term}</span>
        <span style={{fontSize:14,color:catColor,flexShrink:0}}>{open?'−':'+'}</span>
      </div>
      {open && <p style={{fontSize:11.5,color:'var(--text-2)',lineHeight:1.65,margin:'6px 0 0',fontFamily:"'DM Sans',sans-serif"}}>{def}</p>}
    </div>
  )
}

function Stepper({label,hint,value,onChange,min,max,step=1,unit,catColor}) {
  const [editing,setEditing] = useState(false)
  const commit = r => {
    const n = parseFloat(r)
    onChange(clamp(isNaN(n)?value:n,min,max))
    setEditing(false)
  }

  const btn = {
    width:38,height:'100%',border:'none',background:'var(--bg-raised)',color:'var(--text)',fontSize:20,fontWeight:300,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0
  }

  return (
    <div style={{marginBottom:16}}>
      <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
        <label style={{fontSize:12.5,fontWeight:600,color:'var(--text)',fontFamily:"'DM Sans',sans-serif"}}>{label}</label>
        {hint && <span style={{fontSize:10,color:'var(--text-3)'}}>{hint}</span>}
      </div>
      <div style={{display:'flex',alignItems:'stretch',height:40,border:`1.5px solid ${editing?catColor:'var(--border-2)'}`,borderRadius:9,overflow:'hidden',background:'var(--bg-card)',transition:'border-color .15s'}}>
        <button onMouseDown={e=>{e.preventDefault();onChange(clamp(value-step,min,max))}} style={{...btn,borderRight:'1px solid var(--border)'}} onMouseEnter={e=>e.currentTarget.style.background=catColor+'18'} onMouseLeave={e=>e.currentTarget.style.background='var(--bg-raised)'}>−</button>
        <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',gap:5}}>
          {editing
            ? <input type="number" defaultValue={value} onBlur={e=>commit(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')commit(e.target.value);if(e.key==='Escape')setEditing(false)}} style={{width:'55%',border:'none',background:'transparent',textAlign:'center',fontSize:15,fontWeight:700,color:'var(--text)',outline:'none'}} autoFocus/>
            : <span onClick={()=>setEditing(true)} style={{fontSize:15,fontWeight:700,color:'var(--text)',cursor:'text',minWidth:36,textAlign:'center'}}>{value}</span>
          }
          <span style={{fontSize:11,color:'var(--text-3)',fontWeight:500}}>{unit}</span>
        </div>
        <button onMouseDown={e=>{e.preventDefault();onChange(clamp(value+step,min,max))}} style={{...btn,borderLeft:'1px solid var(--border)'}} onMouseEnter={e=>e.currentTarget.style.background=catColor+'18'} onMouseLeave={e=>e.currentTarget.style.background='var(--bg-raised)'}>+</button>
      </div>
    </div>
  )
}

const fmtTime = totalSec => {
  const h = Math.floor(totalSec/3600)
  const m = Math.floor((totalSec%3600)/60)
  const s = Math.round(totalSec%60)
  return h>0 ? `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}` : `${m}:${String(s).padStart(2,'0')}`
}

const fmtPace = secPerKm => {
  const m = Math.floor(secPerKm/60)
  const s = Math.round(secPerKm%60)
  return `${m}:${String(s).padStart(2,'0')}`
}

function RaceInsightSection({ dist, displayPaceSec, displayFinSec, speedKmh, paceZone, catColor }) {
  let title = ''
  let message = ''
  let recommendation = ''

  if (displayPaceSec <= 240) {
    title = 'Fast race-oriented pace'
    message = 'This pace sits in a very demanding range and is usually best supported by structured training and controlled race execution.'
    recommendation = 'Pacing discipline and recovery become especially important here.'
  } else if (displayPaceSec <= 330) {
    title = 'Strong recreational pace'
    message = 'This pace reflects solid running fitness and can produce strong results when sustained over common race distances.'
    recommendation = 'Threshold work and long aerobic sessions are usually the biggest performance boosters.'
  } else if (displayPaceSec <= 450) {
    title = 'Steady developing pace'
    message = 'This is a very practical training and racing range for building consistency, endurance, and confidence.'
    recommendation = 'Most progress here comes from consistent weekly mileage and avoiding overtraining.'
  } else {
    title = 'Foundational running pace'
    message = 'This pace is a strong place to build endurance safely. It can still produce excellent health and race progress over time.'
    recommendation = 'Focus on easy consistency first, then gradually add quality sessions.'
  }

  return (
    <Sec title="Your race insight" sub={title}>
      <div style={{ display:'grid', gap:14 }}>
        <div style={{ padding:'14px 15px', borderRadius:12, background:catColor+'10', border:`1px solid ${catColor}35` }}>
          <div style={{ fontSize:13, fontWeight:700, color:catColor, marginBottom:6, fontFamily:"'Space Grotesk',sans-serif" }}>
            {fmtPace(displayPaceSec)}/km for {dist.label}
          </div>
          <p style={{ margin:0, fontSize:12.5, color:'var(--text-2)', lineHeight:1.75, fontFamily:"'DM Sans',sans-serif" }}>
            {message}
          </p>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(4, minmax(0, 1fr))', gap:10 }}>
          {[
            { label:'Pace', value:fmtPace(displayPaceSec) },
            { label:'Speed', value:`${speedKmh.toFixed(1)}` },
            { label:'Finish', value:fmtTime(displayFinSec) },
            { label:'Zone', value:paceZone.label },
          ].map((item, i) => (
            <div key={i} style={{ padding:'12px 10px', borderRadius:10, background:'var(--bg-raised)', border:'0.5px solid var(--border)' }}>
              <div style={{ fontSize:10.5, color:'var(--text-3)', marginBottom:4 }}>{item.label}</div>
              <div style={{ fontSize:15, fontWeight:700, color:'var(--text)', fontFamily:"'Space Grotesk',sans-serif" }}>{item.value}</div>
            </div>
          ))}
        </div>

        <div style={{ padding:'12px 14px', borderRadius:10, background:'var(--bg-raised)', border:'0.5px solid var(--border)' }}>
          <div style={{ fontSize:11, fontWeight:700, color:'var(--text)', marginBottom:6, fontFamily:"'DM Sans',sans-serif" }}>
            Recommended focus
          </div>
          <p style={{ margin:0, fontSize:12, color:'var(--text-2)', lineHeight:1.7, fontFamily:"'DM Sans',sans-serif" }}>
            {recommendation}
          </p>
        </div>
      </div>
    </Sec>
  )
}

function SplitStrategySection({ displayFinSec, km, displayPaceSec, catColor }) {
  const firstHalf = displayFinSec * 0.505
  const secondHalf = displayFinSec * 0.495
  const slowerPace = displayPaceSec * 1.02
  const fasterPace = displayPaceSec * 0.98

  return (
    <Sec title="Split strategy" sub="A smarter way to pace the race">
      <div style={{ display:'grid', gap:10 }}>
        {[
          { title:'First half', value:fmtTime(firstHalf), note:`Settle in around ${fmtPace(slowerPace)}/km` },
          { title:'Second half', value:fmtTime(secondHalf), note:`Aim to close near ${fmtPace(fasterPace)}/km` },
          { title:'Why it works', value:'Negative split', note:'Starting slightly controlled often gives a stronger finish and less late-race fade.' },
        ].map((item, i) => (
          <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'11px 12px', borderRadius:9, background:i === 1 ? catColor+'10' : 'var(--bg-raised)', border:`0.5px solid ${i === 1 ? catColor+'35' : 'var(--border)'}` }}>
            <div>
              <div style={{ fontSize:12, fontWeight:700, color:i === 1 ? catColor : 'var(--text)' }}>{item.title}</div>
              <div style={{ fontSize:10.5, color:'var(--text-3)', marginTop:2 }}>{item.note}</div>
            </div>
            <div style={{ fontSize:12, fontWeight:700, color:i === 1 ? catColor : 'var(--text)' }}>{item.value}</div>
          </div>
        ))}
      </div>
    </Sec>
  )
}

function TrainingSuggestionsSection({ paceZone, displayPaceSec, catColor }) {
  const suggestions =
    paceZone.label === 'Recovery' || paceZone.label === 'Easy'
      ? [
          'Build weekly mileage gradually before chasing more speed.',
          'Add short strides or light pickups after easy runs.',
          'Keep most running comfortable so consistency stays high.',
        ]
      : paceZone.label === 'Tempo'
      ? [
          'One tempo workout per week can move this pace noticeably.',
          'Support faster running with easy aerobic mileage between hard days.',
          'Use long runs to improve durability at this pace.',
        ]
      : [
          'Hard pace needs careful recovery, sleep, and structured workouts.',
          'Use easy days properly instead of stacking intense sessions.',
          'Race-specific workouts and pacing practice become more important here.',
        ]

  return (
    <Sec title="How to improve this pace" sub="Training ideas based on your current pace">
      <div style={{ display:'grid', gap:10 }}>
        {suggestions.map((item, i) => (
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

function PaceEquivalentsSection({ displayPaceSec, catColor }) {
  const equivalents = [
    { label:'Per kilometre', value:`${fmtPace(displayPaceSec)}/km` },
    { label:'Per mile', value:`${fmtPace(displayPaceSec * 1.60934)}/mi` },
    { label:'400m lap', value:fmtTime(displayPaceSec * 0.4) },
    { label:'200m rep', value:fmtTime(displayPaceSec * 0.2) },
  ]

  return (
    <Sec title="Pace equivalents" sub="See the same pace in different ways">
      <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:8 }}>
        {equivalents.map((e, i) => (
          <div key={i} style={{ padding:'10px 12px', borderRadius:8, background:i === 0 ? catColor+'10' : 'var(--bg-raised)', border:`0.5px solid ${i === 0 ? catColor+'35' : 'var(--border)'}` }}>
            <div style={{ fontSize:10.5, color:'var(--text-3)', marginBottom:4 }}>{e.label}</div>
            <div style={{ fontSize:16, fontWeight:700, color:i === 0 ? catColor : 'var(--text)', fontFamily:"'Space Grotesk',sans-serif" }}>{e.value}</div>
          </div>
        ))}
      </div>
    </Sec>
  )
}

function AttractiveFactsSection({ displayPaceSec, speedKmh, dist, displayFinSec, catColor }) {
  const facts = [
    `At this pace, you are moving at about ${speedKmh.toFixed(1)} km/h.`,
    `A ${dist.label} at this pace finishes in ${fmtTime(displayFinSec)}.`,
    `Dropping just 10 sec/km from this pace would save ${fmtTime((displayPaceSec - 10) * dist.km < 0 ? 0 : displayFinSec - ((displayPaceSec - 10) * dist.km))} over ${dist.label}.`,
    'Small pace gains add up dramatically over longer race distances.',
  ]

  return (
    <Sec title="Interesting pace facts" sub="Small gains make big differences">
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

export default function PaceCalculator({ meta, category }) {
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

  const dist = DISTANCES.find(d=>d.key===distKey) || DISTANCES[1]
  const km = dist.key==='custom' ? customKm : dist.km
  const paceSecPerKm = paceMin*60 + paceSec
  const finTotalSec = finHours*3600 + finMins*60 + finSecs
  const derivedPaceSec = km>0 ? finTotalSec/km : 0
  const derivedFinSec = paceSecPerKm * km

  const displayPaceSec = mode==='pace_to_time' ? paceSecPerKm : derivedPaceSec
  const displayFinSec = mode==='pace_to_time' ? derivedFinSec : finTotalSec
  const speedKmh = 3600 / displayPaceSec

  const paceZone = PACE_ZONES.slice().reverse().find(z => displayPaceSec/60 <= z.minPerKm) || PACE_ZONES[0]

  const stories = [
    {
      label:'Your pace',
      headline:`${fmtPace(displayPaceSec)} per km — ${paceZone.label}`,
      detail:`That's ${speedKmh.toFixed(1)} km/h. ${paceZone.desc}. For ${dist.label}, at this pace you'll finish in ${fmtTime(displayFinSec)}.`,
    },
    {
      label:'Splits strategy',
      headline:`Target ${fmtPace(displayPaceSec*0.97)}/km for the first half`,
      detail:`Run the first half slightly slower and aim to run the second half at ${fmtPace(displayPaceSec)} or faster. This often produces better finish times than going out too fast.`,
    },
    {
      label:'The pace to beat',
      headline:`${fmtPace(displayPaceSec * 0.95)}/km is your next milestone`,
      detail:`A 5% pace improvement over ${dist.label} creates a meaningful finish-time drop. Build toward it with consistent training rather than forcing it in one session.`,
    },
  ]

  const hint = `Pace: ${fmtPace(displayPaceSec)}/km (${speedKmh.toFixed(1)} km/h). ${dist.label} finish time: ${fmtTime(displayFinSec)}. Zone: ${paceZone.label}.`

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <CalcShell
        left={<>
          <div style={{ marginBottom:18 }}>
            <div style={{ fontSize:12, fontWeight:600, color:'var(--text-2)', marginBottom:8, fontFamily:"'DM Sans',sans-serif" }}>Calculate</div>
            <div style={{ display:'flex', gap:8 }}>
              {[{v:'pace_to_time',l:'Pace → Finish time'},{v:'time_to_pace',l:'Finish time → Pace'}].map(o=>(
                <button key={o.v} onClick={()=>setMode(o.v)} style={{ flex:1, padding:'9px 6px', borderRadius:8, fontSize:11, fontWeight:mode===o.v?700:500, color:mode===o.v?catColor:'var(--text-2)', border:`1.5px solid ${mode===o.v?catColor:'var(--border-2)'}`, background:mode===o.v?catColor+'12':'var(--bg-raised)', cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>
                  {o.l}
                </button>
              ))}
            </div>
          </div>

          <div style={{ borderTop:'0.5px solid var(--border)', paddingTop:16, marginBottom:12 }}>
            <div style={{ fontSize:12, fontWeight:600, color:'var(--text-2)', marginBottom:8, fontFamily:"'DM Sans',sans-serif" }}>Distance</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:6 }}>
              {DISTANCES.map(d=>(
                <button key={d.key} onClick={()=>setDistKey(d.key)} style={{ padding:'8px 4px', borderRadius:8, fontSize:11, fontWeight:distKey===d.key?700:500, color:distKey===d.key?catColor:'var(--text-2)', border:`1.5px solid ${distKey===d.key?catColor:'var(--border-2)'}`, background:distKey===d.key?catColor+'12':'var(--bg-raised)', cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>
                  {d.label}
                </button>
              ))}
            </div>
            {distKey==='custom' && (
              <div style={{ marginTop:10 }}>
                <Stepper label="Custom distance" value={customKm} onChange={setCustomKm} min={0.1} max={200} step={0.5} unit="km" catColor={catColor}/>
              </div>
            )}
          </div>

          <div style={{ borderTop:'0.5px solid var(--border)', paddingTop:16 }}>
            {mode==='pace_to_time' ? <>
              <div style={{ fontSize:10, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:14 }}>Your pace</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                <Stepper label="Minutes" value={paceMin} onChange={setPaceMin} min={2} max={20} unit="min" catColor={catColor}/>
                <Stepper label="Seconds" value={paceSec} onChange={setPaceSec} min={0} max={59} unit="sec" catColor={catColor}/>
              </div>
            </> : <>
              <div style={{ fontSize:10, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:14 }}>Your finish time</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
                <Stepper label="Hours" value={finHours} onChange={setFinHours} min={0} max={24} unit="hr" catColor={catColor}/>
                <Stepper label="Minutes" value={finMins} onChange={setFinMins} min={0} max={59} unit="min" catColor={catColor}/>
                <Stepper label="Seconds" value={finSecs} onChange={setFinSecs} min={0} max={59} unit="sec" catColor={catColor}/>
              </div>
            </>}
          </div>
        </>}
        right={<>
          <div style={{ background:'var(--bg-card)', border:'0.5px solid var(--border)', borderRadius:14, overflow:'hidden', marginBottom:14 }}>
            <div style={{ padding:'11px 16px', borderBottom:'0.5px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontSize:12, fontWeight:700, color:'var(--text)', fontFamily:"'Space Grotesk',sans-serif" }}>Your pace story</span>
              <span style={{ fontSize:10, color:'var(--text-3)' }}>Updates live</span>
            </div>
            <div style={{ padding:'16px 18px', display:'flex', flexDirection:'column', gap:10 }}>
              {stories.map((s,i)=>{
                const colors=[catColor,'#0ea5e9','#f59e0b']
                const softs=[catColor+'18','#e0f2fe','#fef3c7']
                return(
                  <div key={i} style={{ borderLeft:`3px solid ${colors[i]}`, paddingLeft:12, paddingTop:6, paddingBottom:6, borderRadius:'0 8px 8px 0', background:softs[i] }}>
                    <div style={{ fontSize:9, fontWeight:700, color:colors[i], textTransform:'uppercase', letterSpacing:'.07em', marginBottom:4 }}>{s.label}</div>
                    <div style={{ fontSize:13, fontWeight:600, color:'var(--text)', lineHeight:1.55, fontFamily:"'Space Grotesk',sans-serif" }}>{s.headline}</div>
                    <div style={{ fontSize:11.5, color:'var(--text-2)', lineHeight:1.6, marginTop:4, fontFamily:"'DM Sans',sans-serif" }}>{s.detail}</div>
                  </div>
                )
              })}
            </div>
          </div>

          <BreakdownTable title="Pace Summary" rows={[
            { label:'Pace', value:`${fmtPace(displayPaceSec)}/km`, bold:true, highlight:true, color:catColor },
            { label:'Speed', value:`${speedKmh.toFixed(1)} km/h` },
            { label:'Pace (miles)', value:`${fmtPace(displayPaceSec*1.60934)}/mi` },
            { label:'Finish time', value:fmtTime(displayFinSec), color:catColor },
            { label:'Distance', value:`${km.toFixed(4).replace(/\.?0+$/,'')} km` },
            { label:'Zone', value:paceZone.label, color:paceZone.color },
          ]}/>

          <AIHintCard hint={hint}/>
        </>}
      />

      <RaceInsightSection
        dist={dist}
        displayPaceSec={displayPaceSec}
        displayFinSec={displayFinSec}
        speedKmh={speedKmh}
        paceZone={paceZone}
        catColor={catColor}
      />

      <SplitStrategySection
        displayFinSec={displayFinSec}
        km={km}
        displayPaceSec={displayPaceSec}
        catColor={catColor}
      />

      <Sec title="Your pace across all race distances" sub="Projected finish times">
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          {DISTANCES.filter(d=>d.key!=='custom').map((d,i)=>{
            const t = displayPaceSec * d.km
            return(
              <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'9px 14px', borderRadius:8, background:'var(--bg-raised)', border:'0.5px solid var(--border)' }}>
                <div style={{ width:100, flexShrink:0 }}>
                  <div style={{ fontSize:12, fontWeight:700, color:'var(--text)' }}>{d.label}</div>
                  <div style={{ fontSize:10, color:'var(--text-3)' }}>{d.km.toFixed(4).replace(/\.?0+$/,'')} km</div>
                </div>
                <div style={{ flex:1, height:4, background:'var(--border)', borderRadius:2 }}>
                  <div style={{ height:'100%', width:`${(d.km/42.195)*100}%`, background:catColor, borderRadius:2, opacity:0.6 }}/>
                </div>
                <div style={{ fontSize:13, fontWeight:700, color:catColor, minWidth:70, textAlign:'right' }}>{fmtTime(t)}</div>
              </div>
            )
          })}
        </div>
      </Sec>

      <PaceEquivalentsSection
        displayPaceSec={displayPaceSec}
        catColor={catColor}
      />

      <Sec title="Running pace zones" sub="Where does your pace fit?">
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          {PACE_ZONES.map((z,i)=>{
            const isYours = z.label === paceZone.label
            return(
              <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'9px 13px', borderRadius:8, background:isYours?z.color+'12':'var(--bg-raised)', border:`${isYours?'1.5':'0.5'}px solid ${isYours?z.color:'var(--border)'}` }}>
                <div style={{ width:8, height:8, borderRadius:'50%', background:z.color, flexShrink:0 }}/>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:12, fontWeight:isYours?700:500, color:isYours?z.color:'var(--text)' }}>{z.label}</div>
                  <div style={{ fontSize:10, color:'var(--text-3)' }}>{z.desc}</div>
                </div>
                <div style={{ fontSize:11, fontWeight:600, color:'var(--text-2)' }}>&lt;{z.minPerKm}:00 /km</div>
                {isYours && <div style={{ fontSize:9, fontWeight:700, background:z.color+'18', color:z.color, padding:'2px 7px', borderRadius:6 }}>YOUR PACE</div>}
              </div>
            )
          })}
        </div>
      </Sec>

      <TrainingSuggestionsSection
        paceZone={paceZone}
        displayPaceSec={displayPaceSec}
        catColor={catColor}
      />

      <AttractiveFactsSection
        displayPaceSec={displayPaceSec}
        speedKmh={speedKmh}
        dist={dist}
        displayFinSec={displayFinSec}
        catColor={catColor}
      />

      <Sec title="Key terms" sub="Click any to expand">
        <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:8 }}>
          {GLOSSARY.map((g,i)=><GlsTerm key={i} term={g.term} def={g.def} catColor={catColor}/>)}
        </div>
      </Sec>

      <Sec title="Frequently asked questions" sub="Everything about running pace">
        {FAQ.map((f,i)=>(
          <Acc key={i} q={f.q} a={f.a} open={openFaq===i} onToggle={()=>setOpenFaq(openFaq===i?null:i)} catColor={catColor}/>
        ))}
      </Sec>
    </div>
  )
}