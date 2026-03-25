import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'

const clamp = (v,a,b) => Math.min(b, Math.max(a, v))

const STRIDE_PRESETS = [
  { label:'Short (< 160 cm)',   factor:0.413 },
  { label:'Average (160–175)', factor:0.415 },
  { label:'Tall (176–185 cm)', factor:0.420 },
  { label:'Very tall (185+)',  factor:0.430 },
]

const FAQ = [
  { q:'How many steps in a mile?',
    a:'Approximately 2,000–2,500 steps per mile for many adults, depending on stride length. Taller people with longer strides usually take fewer steps per mile.' },
  { q:'Is 10,000 steps a day enough exercise?',
    a:'10,000 steps is a useful general activity target, but benefits begin below that too. Step count helps daily movement, but it does not fully replace strength training or intentional cardio.' },
  { q:'How can I increase my daily step count?',
    a:'Short walking breaks, stairs, walking during calls, parking farther away, and brief evening walks are simple ways to add steps without changing your whole routine.' },
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

function ActivityInsightSection({ steps, km, miles, walkMin, kcal, stepsPerKm, catColor }) {
  let title = ''
  let message = ''
  let recommendation = ''

  if (steps < 5000) {
    title = 'Light activity day'
    message = 'This step count is on the lower side for a full day, and it usually reflects a more sedentary routine.'
    recommendation = 'A short extra walk can make a noticeable difference today.'
  } else if (steps < 10000) {
    title = 'Moderately active day'
    message = 'You have built a meaningful amount of daily movement. This is a solid base for general health.'
    recommendation = 'A small extra walk can push this into a stronger activity range.'
  } else if (steps < 15000) {
    title = 'Strong activity day'
    message = 'This is a very solid daily step count and usually reflects a clearly active day.'
    recommendation = 'You have already built good movement volume today.'
  } else {
    title = 'Very high activity day'
    message = 'This is a high step total and reflects a very active day with substantial walking volume.'
    recommendation = 'Recovery, hydration, and comfortable footwear matter more on days like this.'
  }

  return (
    <Sec title="Your activity insight" sub={title}>
      <div style={{ display:'grid', gap:14 }}>
        <div style={{ padding:'14px 15px', borderRadius:12, background:catColor+'10', border:`1px solid ${catColor}35` }}>
          <div style={{ fontSize:13, fontWeight:700, color:catColor, marginBottom:6, fontFamily:"'Space Grotesk',sans-serif" }}>
            {steps.toLocaleString()} steps today
          </div>
          <p style={{ margin:0, fontSize:12.5, color:'var(--text-2)', lineHeight:1.75, fontFamily:"'DM Sans',sans-serif" }}>
            {message}
          </p>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(4, minmax(0, 1fr))', gap:10 }}>
          {[
            { label:'Distance', value:`${km.toFixed(2)} km` },
            { label:'Miles', value:`${miles.toFixed(2)}` },
            { label:'Time', value:`${walkMin} min` },
            { label:'Calories', value:`${kcal}` },
          ].map((item, i) => (
            <div key={i} style={{ padding:'12px 10px', borderRadius:10, background:'var(--bg-raised)', border:'0.5px solid var(--border)' }}>
              <div style={{ fontSize:10.5, color:'var(--text-3)', marginBottom:4 }}>{item.label}</div>
              <div style={{ fontSize:15, fontWeight:700, color:'var(--text)', fontFamily:"'Space Grotesk',sans-serif" }}>{item.value}</div>
            </div>
          ))}
        </div>

        <div style={{ padding:'12px 14px', borderRadius:10, background:'var(--bg-raised)', border:'0.5px solid var(--border)' }}>
          <div style={{ fontSize:11, fontWeight:700, color:'var(--text)', marginBottom:6, fontFamily:"'DM Sans',sans-serif" }}>
            Useful takeaway
          </div>
          <p style={{ margin:0, fontSize:12, color:'var(--text-2)', lineHeight:1.7, fontFamily:"'DM Sans',sans-serif" }}>
            You are averaging about {stepsPerKm.toLocaleString()} steps per km, and this total equals roughly {walkMin} minutes of walking. {recommendation}
          </p>
        </div>
      </div>
    </Sec>
  )
}

function WhatItMeansSection({ steps, gap, strideM, catColor }) {
  const items = [
    steps >= 10000
      ? `You have already reached the common 10,000-step target and gone ${Math.max(0, steps - 10000).toLocaleString()} steps beyond it.`
      : `You are ${gap.toLocaleString()} steps away from 10,000, which is about ${((gap * strideM) / 1000).toFixed(2)} km more.`,
    `At your current stride, 1,000 steps is about ${(1000 * strideM / 1000).toFixed(2)} km.`,
    `2,000 extra steps adds roughly ${(2000 * strideM / 1000).toFixed(2)} km of walking.`,
  ]

  return (
    <Sec title="What this step count means" sub="Simple real-world translation">
      <div style={{ display:'grid', gap:10 }}>
        {items.map((item, i) => (
          <div key={i} style={{ display:'flex', gap:10, alignItems:'flex-start', padding:'12px 13px', borderRadius:10, background:i === 0 ? catColor+'10' : 'var(--bg-raised)', border:`0.5px solid ${i === 0 ? catColor+'35' : 'var(--border)'}` }}>
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

function InterestingFactsSection({ steps, miles, kcal, catColor }) {
  const facts = [
    `${steps.toLocaleString()} steps is about ${miles.toFixed(2)} miles of movement.`,
    `This step count burns about ${kcal} kcal in this estimate, though real burn varies by pace and terrain.`,
    'Stride length is a major reason two people can walk the same distance with different step counts.',
    'Step totals are useful for daily movement, even when they are not a formal workout.',
  ]

  return (
    <Sec title="Interesting step facts" sub="Useful and fun context">
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

function AddMoreStepsSection({ gap, strideM, catColor }) {
  const extraKm = (gap * strideM) / 1000

  const ideas = gap <= 0
    ? [
        'Take a short recovery walk if you want extra movement without much effort.',
        'Use the rest of the day for light movement instead of chasing a much bigger number.',
        'Stretch, hydrate, and recover well if this was a high-step day.',
      ]
    : [
        `A short walk of about ${extraKm.toFixed(1)} km would close the gap to 10,000 steps.`,
        'Walking during calls or after meals is one of the easiest ways to add steps.',
        'Breaking the remaining steps into 2 or 3 small walks makes the goal feel easier.',
      ]

  return (
    <Sec title="Easy ways to add more steps" sub="Practical ideas for today">
      <div style={{ display:'grid', gap:10 }}>
        {ideas.map((item, i) => (
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

function AccuracySection({ strideM, catColor }) {
  return (
    <Sec title="How accurate this estimate is" sub="Important distance notes">
      <div style={{ display:'grid', gap:10 }}>
        {[
          `This estimate uses a stride length of about ${(strideM * 100).toFixed(0)} cm based on your selected preset and height.`,
          'Actual step-to-distance can change with pace, terrain, footwear, fatigue, and how long or short your stride is in real life.',
          'For more accurate distance, GPS tracking or a measured walking test is better than a general stride estimate.',
        ].map((item, i) => (
          <div key={i} style={{ padding:'12px 13px', borderRadius:10, background:i === 0 ? catColor+'10' : 'var(--bg-raised)', border:`0.5px solid ${i === 0 ? catColor+'35' : 'var(--border)'}` }}>
            <p style={{ margin:0, fontSize:12.5, color:'var(--text-2)', lineHeight:1.65, fontFamily:"'DM Sans',sans-serif" }}>
              {item}
            </p>
          </div>
        ))}
      </div>
    </Sec>
  )
}

export default function StepsToMilesCalculator({ meta, category }) {
  const catColor = category?.color || '#22a355'
  const [steps, setSteps] = useState(10000)
  const [heightCm, setHeightCm] = useState(170)
  const [wKg, setWKg] = useState(70)
  const [strideIdx, setStrideIdx] = useState(1)
  const [openFaq, setOpenFaq] = useState(null)

  const strideM = (heightCm * STRIDE_PRESETS[strideIdx].factor) / 100
  const stepsPerKm = Math.round(1000 / strideM)
  const km = (steps * strideM) / 1000
  const miles = km * 0.621371
  const kcal = Math.round(0.0005 * wKg * steps)
  const walkMin = Math.round(km / 5 * 60)
  const gap = Math.max(0, 10000 - steps)

  const storyColors = [catColor, '#f59e0b', '#0ea5e9']
  const storySofts = [catColor + '18', '#fef3c7', '#e0f2fe']
  const stories = [
    {
      label:'Your distance',
      headline:`${steps.toLocaleString()} steps = ${km.toFixed(2)} km (${miles.toFixed(2)} miles)`,
      detail:`Based on your ${heightCm} cm height, your stride length is ~${(strideM * 100).toFixed(0)} cm. At ${stepsPerKm.toLocaleString()} steps/km, you covered ${km.toFixed(2)} km in approximately ${walkMin} minutes of walking.`
    },
    {
      label:'Calories burned',
      headline:`Approximately ${kcal} kcal from those steps`,
      detail:`At ${wKg} kg, walking burns ~${(kcal / steps * 1000).toFixed(2)} kcal per 1,000 steps.`
    },
    {
      label:steps >= 10000 ? '10,000 steps hit ✓' : 'How to hit 10,000/day',
      headline:steps >= 10000 ? 'Goal reached — every step beyond adds more benefit' : `You need ${gap.toLocaleString()} more steps to reach 10,000`,
      detail:steps >= 10000
        ? `You have hit 10,000 steps. Every 2,000 additional steps adds roughly ${(2000 * strideM / 1000).toFixed(1)} km more movement.`
        : `Add a ${Math.round(gap * strideM / 1000 / 5 * 60)}-minute walk to close the gap. That is ${(gap * strideM / 1000).toFixed(1)} km more.`
    },
  ]

  const hint = `${steps.toLocaleString()} steps = ${km.toFixed(2)} km (${miles.toFixed(2)} mi). Stride: ${(strideM * 100).toFixed(0)} cm. Calories: ~${kcal} kcal. Walking time: ~${walkMin} min.`

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <CalcShell
        left={<>
          <div style={{ fontSize:10, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:14 }}>Your stats</div>
          <Stepper label="Steps" value={steps} onChange={setSteps} min={100} max={100000} step={500} unit="steps" catColor={catColor} />
          <Stepper label="Height" value={heightCm} onChange={setHeightCm} min={100} max={220} unit="cm" catColor={catColor} />
          <Stepper label="Body weight" value={wKg} onChange={setWKg} min={30} max={250} unit="kg" catColor={catColor} />

          <div style={{ borderTop:'0.5px solid var(--border)', paddingTop:16, marginTop:4 }}>
            <div style={{ fontSize:12, fontWeight:600, color:'var(--text-2)', marginBottom:8, fontFamily:"'DM Sans',sans-serif" }}>Height / stride preset</div>
            <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
              {STRIDE_PRESETS.map((s, i) => (
                <button key={i} onClick={() => setStrideIdx(i)} style={{ display:'flex', justifyContent:'space-between', padding:'8px 12px', borderRadius:8, border:`1.5px solid ${strideIdx === i ? catColor : 'var(--border-2)'}`, background:strideIdx === i ? catColor + '12' : 'var(--bg-raised)', cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>
                  <span style={{ fontSize:12, fontWeight:strideIdx === i ? 700 : 500, color:strideIdx === i ? catColor : 'var(--text)' }}>{s.label}</span>
                  <span style={{ fontSize:10, color:'var(--text-3)' }}>×{s.factor} height</span>
                </button>
              ))}
            </div>
          </div>

          <div style={{ borderTop:'0.5px solid var(--border)', paddingTop:16, marginTop:12 }}>
            <div style={{ fontSize:12, fontWeight:600, color:'var(--text-2)', marginBottom:8, fontFamily:"'DM Sans',sans-serif" }}>Common step goals</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:6 }}>
              {[5000, 7500, 10000, 12000, 15000, 20000].map(s => (
                <button key={s} onClick={() => setSteps(s)} style={{ padding:'8px 4px', borderRadius:8, fontSize:11, fontWeight:steps === s ? 700 : 500, color:steps === s ? catColor : 'var(--text-2)', border:`1.5px solid ${steps === s ? catColor : 'var(--border-2)'}`, background:steps === s ? catColor + '12' : 'var(--bg-raised)', cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>
                  {(s / 1000).toFixed(s % 1000 === 0 ? 0 : 1)}K
                </button>
              ))}
            </div>
          </div>
        </>}
        right={<>
          <div style={{ background:'var(--bg-card)', border:'0.5px solid var(--border)', borderRadius:14, overflow:'hidden', marginBottom:14 }}>
            <div style={{ padding:'11px 16px', borderBottom:'0.5px solid var(--border)', display:'flex', justifyContent:'space-between' }}>
              <span style={{ fontSize:12, fontWeight:700, color:'var(--text)', fontFamily:"'Space Grotesk',sans-serif" }}>Your steps story</span>
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

          <BreakdownTable title="Steps Summary" rows={[
            { label:'Distance (km)', value:`${km.toFixed(2)} km`, bold:true, highlight:true, color:catColor },
            { label:'Distance (miles)', value:`${miles.toFixed(2)} mi` },
            { label:'Calories burned', value:`~${kcal} kcal`, color:'#f59e0b' },
            { label:'Stride length', value:`${(strideM * 100).toFixed(0)} cm` },
            { label:'Steps per km', value:stepsPerKm.toLocaleString() },
            { label:'Walking time', value:`~${walkMin} min` },
            { label:'Gap to 10K', value:steps >= 10000 ? 'Goal hit ✓' : `${gap.toLocaleString()} steps`, color:steps >= 10000 ? catColor : '#f59e0b' },
          ]} />

          <AIHintCard hint={hint} />
        </>}
      />

      <ActivityInsightSection
        steps={steps}
        km={km}
        miles={miles}
        walkMin={walkMin}
        kcal={kcal}
        stepsPerKm={stepsPerKm}
        catColor={catColor}
      />

      <WhatItMeansSection
        steps={steps}
        gap={gap}
        strideM={strideM}
        catColor={catColor}
      />

      <InterestingFactsSection
        steps={steps}
        miles={miles}
        kcal={kcal}
        catColor={catColor}
      />

      <AddMoreStepsSection
        gap={gap}
        strideM={strideM}
        catColor={catColor}
      />

      <AccuracySection
        strideM={strideM}
        catColor={catColor}
      />

      <Sec title="Frequently asked questions" sub="Everything about steps and distance">
        {FAQ.map((f, i) => (
          <Acc key={i} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} catColor={catColor} />
        ))}
      </Sec>
    </div>
  )
}