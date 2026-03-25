import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'

const clamp = (v,a,b) => Math.min(b, Math.max(a, v))

const VO2_BENCHMARKS = {
  male: [
    { label:'Very poor', min:0,  max:35,  color:'#ef4444' },
    { label:'Poor',      min:35, max:42,  color:'#f97316' },
    { label:'Fair',      min:42, max:46,  color:'#f59e0b' },
    { label:'Good',      min:46, max:52,  color:'#3b82f6' },
    { label:'Excellent', min:52, max:60,  color:'#22a355' },
    { label:'Superior',  min:60, max:100, color:'#10b981' },
  ],
  female: [
    { label:'Very poor', min:0,  max:28,  color:'#ef4444' },
    { label:'Poor',      min:28, max:34,  color:'#f97316' },
    { label:'Fair',      min:34, max:38,  color:'#f59e0b' },
    { label:'Good',      min:38, max:44,  color:'#3b82f6' },
    { label:'Excellent', min:44, max:52,  color:'#22a355' },
    { label:'Superior',  min:52, max:100, color:'#10b981' },
  ],
}

const ATHLETE_BENCHMARKS = [
  { label:'Average adult (sedentary)', male:35, female:28 },
  { label:'Recreationally fit',        male:45, female:38 },
  { label:'Competitive runner',        male:55, female:48 },
  { label:'Elite marathon runner',     male:70, female:62 },
  { label:'Elite cyclist',             male:75, female:65 },
  { label:'World-class endurance',     male:90, female:78 },
]

const FAQ = [
  { q:'What is VO2 max and why does it matter?',
    a:'VO2 max is the maximum rate at which your body can use oxygen during intense exercise. It is one of the best indicators of aerobic fitness and endurance capacity.' },
  { q:'How can I improve my VO2 max?',
    a:'Consistent aerobic training, interval sessions, and progressive overload are the main ways to improve VO2 max. Beginners usually improve faster than advanced athletes.' },
  { q:'How accurate is the Cooper test estimate?',
    a:'The Cooper 12-minute test is one of the better field-based VO2 max estimates, but it is still an estimate. Lab testing remains the gold standard.' },
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

function IconCardGroup({ label, options, value, onChange, catColor }) {
  return (
    <div style={{ marginBottom:18 }}>
      <div style={{ fontSize:12, fontWeight:600, color:'var(--text-2)', marginBottom:8, fontFamily:"'DM Sans',sans-serif" }}>{label}</div>
      <div style={{ display:'flex', gap:8 }}>
        {options.map(opt => {
          const active = value === opt.value
          return (
            <button key={opt.value} onClick={() => onChange(opt.value)} style={{ flex:1, padding:'12px 8px', borderRadius:10, cursor:'pointer', border:`1.5px solid ${active ? catColor : 'var(--border-2)'}`, background:active ? catColor + '12' : 'var(--bg-raised)', display:'flex', flexDirection:'column', alignItems:'center', gap:6, transition:'all .18s', fontFamily:"'DM Sans',sans-serif" }}>
              <div style={{ width:28, height:28, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke={active ? catColor : 'var(--text-3)'} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{opt.icon}</svg>
              </div>
              <span style={{ fontSize:12, fontWeight:active ? 700 : 500, color:active ? catColor : 'var(--text-2)', lineHeight:1.2, textAlign:'center' }}>{opt.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

const SEX_OPTIONS = [
  { value:'male',   label:'Male',   icon:<><circle cx="11" cy="9" r="5"/><line x1="11" y1="14" x2="11" y2="20"/><line x1="8" y1="17" x2="14" y2="17"/></> },
  { value:'female', label:'Female', icon:<><circle cx="11" cy="8.5" r="5"/><line x1="11" y1="13.5" x2="11" y2="20"/><line x1="8" y1="17" x2="14" y2="17"/></> },
]

function VO2InsightSection({ vo2, cat, sex, method, age, catColor }) {
  let title = ''
  let message = ''

  if (cat.label === 'Very poor' || cat.label === 'Poor') {
    title = 'Strong improvement potential'
    message = 'This result suggests there is a lot of room to build aerobic fitness. The good news is that lower starting points often improve the fastest with consistent training.'
  } else if (cat.label === 'Fair' || cat.label === 'Good') {
    title = 'Solid aerobic base'
    message = 'This is a useful base of cardiovascular fitness. Progress from here usually comes from consistency, structured intervals, and aerobic volume.'
  } else {
    title = 'High aerobic fitness'
    message = 'This is a strong VO2 max result. At this level, improvement tends to come more slowly and usually requires more structured training.'
  }

  return (
    <Sec title="Your VO2 max insight" sub={title}>
      <div style={{ display:'grid', gap:14 }}>
        <div style={{ padding:'14px 15px', borderRadius:12, background:cat.color+'12', border:`1px solid ${cat.color}35` }}>
          <div style={{ fontSize:13, fontWeight:700, color:cat.color, marginBottom:6, fontFamily:"'Space Grotesk',sans-serif" }}>
            {vo2} mL/kg/min — {cat.label}
          </div>
          <p style={{ margin:0, fontSize:12.5, color:'var(--text-2)', lineHeight:1.75, fontFamily:"'DM Sans',sans-serif" }}>
            {message}
          </p>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(4, minmax(0, 1fr))', gap:10 }}>
          {[
            { label:'VO2 max', value:String(vo2) },
            { label:'Category', value:cat.label },
            { label:'Method', value:method === 'cooper' ? 'Cooper' : 'HR ratio' },
            { label:'Age', value:String(age) },
          ].map((item, i) => (
            <div key={i} style={{ padding:'12px 10px', borderRadius:10, background:'var(--bg-raised)', border:'0.5px solid var(--border)' }}>
              <div style={{ fontSize:10.5, color:'var(--text-3)', marginBottom:4 }}>{item.label}</div>
              <div style={{ fontSize:15, fontWeight:700, color:'var(--text)', fontFamily:"'Space Grotesk',sans-serif" }}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>
    </Sec>
  )
}

function WhatItMeansSection({ vo2, sex, catColor }) {
  const comparisons = [
    { label:'Walking up stairs', text:'A higher VO2 max often means daily activity feels easier and recovery is faster.' },
    { label:'Long efforts', text:'Aerobic fitness matters most for sustained efforts like running, cycling, hiking, and endurance sports.' },
    { label:'Health marker', text:'VO2 max is also linked with long-term cardiovascular health and overall fitness.' },
  ]

  return (
    <Sec title="What your score means" sub="Why VO2 max matters">
      <div style={{ display:'grid', gap:10 }}>
        {comparisons.map((item, i) => (
          <div key={i} style={{ display:'flex', gap:10, alignItems:'flex-start', padding:'12px 13px', borderRadius:10, background:i === 0 ? catColor+'10' : 'var(--bg-raised)', border:`0.5px solid ${i === 0 ? catColor+'35' : 'var(--border)'}` }}>
            <div style={{ width:22, height:22, borderRadius:'50%', background:catColor+'18', color:catColor, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, flexShrink:0 }}>
              {i + 1}
            </div>
            <div>
              <div style={{ fontSize:11.5, fontWeight:700, color:'var(--text)', marginBottom:4 }}>{item.label}</div>
              <p style={{ margin:0, fontSize:12.5, color:'var(--text-2)', lineHeight:1.65, fontFamily:"'DM Sans',sans-serif" }}>{item.text}</p>
            </div>
          </div>
        ))}
      </div>
    </Sec>
  )
}

function ImprovementSection({ vo2, catColor }) {
  const ideas = [
    'Add 1–2 interval sessions per week near hard aerobic effort.',
    'Build an easy aerobic base with regular Zone 2 sessions.',
    'Retest after 8–12 weeks to see meaningful change.',
    'Progress slowly and consistently instead of trying to force improvement too fast.',
  ]

  return (
    <Sec title="How to improve your VO2 max" sub="Practical training guidance">
      <div style={{ display:'grid', gap:8 }}>
        {ideas.map((item, i) => (
          <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:10, padding:'10px 12px', borderRadius:9, background:i === 0 ? catColor+'10' : 'var(--bg-raised)', border:`0.5px solid ${i === 0 ? catColor+'35' : 'var(--border)'}` }}>
            <div style={{ width:16, height:16, borderRadius:'50%', background:catColor, color:'#fff', fontSize:10, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:1 }}>✓</div>
            <p style={{ margin:0, fontSize:12.5, color:'var(--text-2)', lineHeight:1.6, fontFamily:"'DM Sans',sans-serif" }}>{item}</p>
          </div>
        ))}
      </div>
    </Sec>
  )
}

function RealWorldContextSection({ vo2, sex, catColor }) {
  const benchmarkPace = vo2 >= 60 ? 'elite endurance range'
    : vo2 >= 50 ? 'competitive fitness range'
    : vo2 >= 40 ? 'recreationally fit range'
    : 'general fitness range'

  const examples = [
    { label:'Your range', value:benchmarkPace },
    { label:'Main strength', value:vo2 >= 50 ? 'High aerobic engine' : vo2 >= 40 ? 'Good base fitness' : 'Foundational endurance building' },
    { label:'Best next step', value:vo2 >= 50 ? 'Refine performance' : 'Build aerobic capacity steadily' },
  ]

  return (
    <Sec title="Real-world performance context" sub="How this score translates">
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
        {examples.map((e, i) => (
          <div key={i} style={{ padding:'10px 12px', borderRadius:8, background:i === 0 ? catColor+'10' : 'var(--bg-raised)', border:`0.5px solid ${i === 0 ? catColor+'35' : 'var(--border)'}` }}>
            <div style={{ fontSize:10.5, color:'var(--text-3)', marginBottom:4 }}>{e.label}</div>
            <div style={{ fontSize:15, fontWeight:700, color:i === 0 ? catColor : 'var(--text)', fontFamily:"'Space Grotesk',sans-serif" }}>{e.value}</div>
          </div>
        ))}
      </div>
    </Sec>
  )
}

function InterestingFactsSection({ vo2, method, catColor }) {
  const facts = [
    `VO2 max is expressed relative to body weight, which is why the unit is mL/kg/min.`,
    `Your current estimate of ${vo2} comes from the ${method === 'cooper' ? 'Cooper field test' : 'heart-rate ratio method'}.`,
    'Field tests are practical, but lab testing is still the gold standard for precision.',
    'Small VO2 max gains can have a big effect on endurance performance when paired with better pacing and efficiency.',
  ]

  return (
    <Sec title="Interesting VO2 facts" sub="Useful and memorable context">
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

function RetestSection({ method, catColor }) {
  const items = [
    'Retest under similar conditions each time so the comparison is fair.',
    method === 'cooper'
      ? 'Use a similar route, weather, and effort level for repeat Cooper tests.'
      : 'Measure resting heart rate consistently, ideally in the morning before getting up.',
    'Give yourself enough training time between tests — usually several weeks, not just a few days.',
  ]

  return (
    <Sec title="When to retest" sub="Make the next score meaningful">
      <div style={{ display:'grid', gap:10 }}>
        {items.map((item, i) => (
          <div key={i} style={{ padding:'12px 13px', borderRadius:10, background:'var(--bg-raised)', border:'0.5px solid var(--border)' }}>
            <p style={{ margin:0, fontSize:12.5, color:'var(--text-2)', lineHeight:1.65, fontFamily:"'DM Sans',sans-serif" }}>
              {item}
            </p>
          </div>
        ))}
      </div>
    </Sec>
  )
}

export default function VO2MaxCalculator({ meta, category }) {
  const catColor = category?.color || '#3b82f6'
  const [age, setAge] = useState(30)
  const [sex, setSex] = useState('male')
  const [method, setMethod] = useState('cooper')
  const [cooperM, setCooperM] = useState(2800)
  const [restHR, setRestHR] = useState(65)
  const [maxHR, setMaxHR] = useState(190)
  const [openFaq, setOpenFaq] = useState(null)

  const vo2Cooper = 22.351 * (cooperM / 1000) - 11.288
  const vo2HR = 15 * (maxHR / restHR)
  const vo2 = Math.round(method === 'cooper' ? vo2Cooper : vo2HR)

  const cats = VO2_BENCHMARKS[sex]
  const cat = cats.find((c, i) => i === cats.length - 1 ? vo2 >= c.min : vo2 >= c.min && vo2 < c.max) || cats[0]
  const benchmarks = ATHLETE_BENCHMARKS.map(b => ({ label:b.label, value:sex === 'male' ? b.male : b.female }))
  const maxVal = Math.max(...benchmarks.map(b => b.value), vo2) * 1.1

  const hint = `VO2 max: ${vo2} mL/kg/min — ${cat.label}. ${sex === 'male' ? 'Male' : 'Female'}, age ${age}. Method: ${method === 'cooper' ? 'Cooper 12-min run' : 'HR ratio'}.`

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <CalcShell
        left={
          <>
            <div style={{ fontSize:10, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:14 }}>Your stats</div>
            <Stepper label="Age" value={age} onChange={setAge} min={10} max={80} unit="yrs" catColor={catColor} />

            <div style={{ borderTop:'0.5px solid var(--border)', paddingTop:16, marginTop:4 }}>
              <IconCardGroup label="Biological sex" options={SEX_OPTIONS} value={sex} onChange={setSex} catColor={catColor} />
            </div>

            <div style={{ borderTop:'0.5px solid var(--border)', paddingTop:16, marginTop:4 }}>
              <div style={{ fontSize:12, fontWeight:600, color:'var(--text-2)', marginBottom:8, fontFamily:"'DM Sans',sans-serif" }}>Estimation method</div>
              <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:16 }}>
                {[
                  { v:'cooper', l:'Cooper 12-min run', d:'Measure metres run in 12 minutes — most accurate field test' },
                  { v:'hrr', l:'Heart rate ratio', d:'Uses resting + max HR — no running required' },
                ].map(o => (
                  <button key={o.v} onClick={() => setMethod(o.v)} style={{ display:'flex', flexDirection:'column', padding:'9px 13px', borderRadius:8, border:`1.5px solid ${method === o.v ? catColor : 'var(--border-2)'}`, background:method === o.v ? catColor + '12' : 'var(--bg-raised)', cursor:'pointer', textAlign:'left', fontFamily:"'DM Sans',sans-serif" }}>
                    <span style={{ fontSize:12, fontWeight:600, color:method === o.v ? catColor : 'var(--text)' }}>{o.l}</span>
                    <span style={{ fontSize:10, color:'var(--text-3)' }}>{o.d}</span>
                  </button>
                ))}
              </div>

              {method === 'cooper'
                ? <Stepper label="Distance in 12 minutes" value={cooperM} onChange={setCooperM} min={500} max={5000} step={50} unit="m" hint="Run as far as you can in 12 min" catColor={catColor} />
                : <>
                    <Stepper label="Resting heart rate" value={restHR} onChange={setRestHR} min={30} max={120} unit="bpm" hint="Morning, before rising" catColor={catColor} />
                    <Stepper label="Max heart rate" value={maxHR} onChange={setMaxHR} min={100} max={230} unit="bpm" hint={`Est: ${220 - age} bpm (220−age)`} catColor={catColor} />
                  </>
              }
            </div>
          </>
        }
        right={<>
          <div style={{ background:'var(--bg-card)', border:'0.5px solid var(--border)', borderRadius:14, overflow:'hidden', marginBottom:14 }}>
            <div style={{ padding:'11px 16px', borderBottom:'0.5px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontSize:12, fontWeight:700, color:'var(--text)', fontFamily:"'Space Grotesk',sans-serif" }}>VO2 Max</span>
              <span style={{ fontSize:10, color:'var(--text-3)' }}>You vs benchmarks</span>
            </div>
            <div style={{ padding:'16px 18px' }}>
              <div style={{ display:'flex', alignItems:'flex-end', gap:12, marginBottom:16 }}>
                <div>
                  <div style={{ fontSize:52, fontWeight:700, lineHeight:1, color:cat.color, fontFamily:"'Space Grotesk',sans-serif" }}>{vo2}</div>
                  <div style={{ fontSize:11, color:'var(--text-3)', marginTop:3 }}>mL/kg/min</div>
                </div>
                <div style={{ paddingBottom:6 }}>
                  <div style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'5px 12px 5px 8px', borderRadius:20, background:cat.color + '18', border:`1px solid ${cat.color}35` }}>
                    <div style={{ width:8, height:8, borderRadius:'50%', background:cat.color }} />
                    <span style={{ fontSize:12, fontWeight:700, color:cat.color, fontFamily:"'DM Sans',sans-serif" }}>{cat.label}</span>
                  </div>
                </div>
              </div>

              <div style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 12px', borderRadius:8, background:cat.color + '12', border:`1.5px solid ${cat.color}`, marginBottom:6 }}>
                <div style={{ width:120, fontSize:11, fontWeight:700, color:cat.color, flexShrink:0 }}>You ← {cat.label}</div>
                <div style={{ flex:1, height:7, background:'var(--border)', borderRadius:3 }}>
                  <div style={{ height:'100%', width:`${(vo2 / maxVal) * 100}%`, background:cat.color, borderRadius:3, transition:'width .5s' }} />
                </div>
                <div style={{ fontSize:12, fontWeight:700, color:cat.color, minWidth:32, textAlign:'right' }}>{vo2}</div>
              </div>

              {benchmarks.map((b, i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'7px 12px', borderRadius:8, background:'var(--bg-raised)', border:'0.5px solid var(--border)', marginBottom:4 }}>
                  <div style={{ width:120, flexShrink:0 }}>
                    <div style={{ fontSize:11, fontWeight:500, color:'var(--text)' }}>{b.label}</div>
                  </div>
                  <div style={{ flex:1, height:5, background:'var(--border)', borderRadius:3 }}>
                    <div style={{ height:'100%', width:`${(b.value / maxVal) * 100}%`, background:catColor, opacity:0.5, borderRadius:3 }} />
                  </div>
                  <div style={{ fontSize:11, fontWeight:600, color:'var(--text-2)', minWidth:28, textAlign:'right' }}>{b.value}</div>
                </div>
              ))}
            </div>
          </div>

          <BreakdownTable title="VO2 Max Summary" rows={[
            { label:'VO2 max', value:`${vo2} mL/kg/min`, bold:true, highlight:true, color:cat.color },
            { label:'Category', value:cat.label, color:cat.color },
            { label:'Method', value:method === 'cooper' ? 'Cooper 12-min run' : 'Heart rate ratio' },
            { label:'Sex / age', value:`${sex === 'male' ? 'Male' : 'Female'}, age ${age}` },
            { label:'Range', value:`${cat.min}–${cat.max < 100 ? cat.max : '85+'} mL/kg/min` },
          ]} />

          <AIHintCard hint={hint} />
        </>}
      />

      <VO2InsightSection
        vo2={vo2}
        cat={cat}
        sex={sex}
        method={method}
        age={age}
        catColor={catColor}
      />

      <WhatItMeansSection
        vo2={vo2}
        sex={sex}
        catColor={catColor}
      />

      <Sec title={`VO2 Max categories — ${sex === 'male' ? 'Male' : 'Female'}`} sub="Reference ranges">
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          {cats.map((c, i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'9px 13px', borderRadius:8, background:cat.label === c.label ? c.color + '12' : 'var(--bg-raised)', border:`${cat.label === c.label ? '1.5' : '0.5'}px solid ${cat.label === c.label ? c.color : 'var(--border)'}` }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background:c.color, flexShrink:0 }} />
              <div style={{ flex:1, fontSize:12, fontWeight:cat.label === c.label ? 700 : 500, color:cat.label === c.label ? c.color : 'var(--text)' }}>{c.label}</div>
              <div style={{ fontSize:11, color:'var(--text-2)' }}>{c.min}–{c.max < 100 ? c.max : '85+'} mL/kg/min</div>
              {cat.label === c.label && <div style={{ fontSize:9, fontWeight:700, background:c.color + '18', color:c.color, padding:'2px 7px', borderRadius:6 }}>YOU</div>}
            </div>
          ))}
        </div>
      </Sec>

      <RealWorldContextSection
        vo2={vo2}
        sex={sex}
        catColor={catColor}
      />

      <ImprovementSection
        vo2={vo2}
        catColor={catColor}
      />

      <InterestingFactsSection
        vo2={vo2}
        method={method}
        catColor={catColor}
      />

      <RetestSection
        method={method}
        catColor={catColor}
      />

      <Sec title="Frequently asked questions" sub="Everything about VO2 max">
        {FAQ.map((f, i) => (
          <Acc key={i} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} catColor={catColor} />
        ))}
      </Sec>
    </div>
  )
}