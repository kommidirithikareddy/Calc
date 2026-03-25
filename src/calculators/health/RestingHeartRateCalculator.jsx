import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'

const clamp = (v,a,b) => Math.min(b, Math.max(a, v))

const RHR_CATS_MALE = [
  { label:'Athlete',    max:55,  color:'#10b981' },
  { label:'Excellent',  max:62,  color:'#22a355' },
  { label:'Good',       max:68,  color:'#3b82f6' },
  { label:'Above avg',  max:74,  color:'#f59e0b' },
  { label:'Average',    max:80,  color:'#f97316' },
  { label:'Below avg',  max:90,  color:'#ef4444' },
  { label:'Poor',       max:999, color:'#dc2626' },
]

const RHR_CATS_FEMALE = [
  { label:'Athlete',    max:60,  color:'#10b981' },
  { label:'Excellent',  max:65,  color:'#22a355' },
  { label:'Good',       max:72,  color:'#3b82f6' },
  { label:'Above avg',  max:78,  color:'#f59e0b' },
  { label:'Average',    max:84,  color:'#f97316' },
  { label:'Below avg',  max:94,  color:'#ef4444' },
  { label:'Poor',       max:999, color:'#dc2626' },
]

const BENCHMARKS = [
  { label:'World-class athlete', value:38, note:'Elite endurance athlete'            },
  { label:'Trained athlete',     value:50, note:'Regular intense training'           },
  { label:'Excellent fitness',   value:58, note:'Consistent aerobic exercise'        },
  { label:'Good fitness',        value:65, note:'Active lifestyle'                   },
  { label:'Average adult',       value:72, note:'Typical sedentary to light activity'},
  { label:'Poor fitness',        value:85, note:'Largely sedentary'                  },
]

const FAQ = [
  { q:'What is a healthy resting heart rate?',
    a:'For adults, 60–100 bpm is the normal range. Trained athletes often have 40–60 bpm, reflecting excellent cardiovascular efficiency — the heart pumps more blood per beat, so it beats less frequently. Below 60 bpm (bradycardia) can be normal in fit people but warrants evaluation if symptomatic. Above 100 bpm (tachycardia) at rest generally warrants medical assessment.' },
  { q:'How can I lower my resting heart rate?',
    a:'Aerobic exercise is the most effective method — consistent Zone 2 training (60–70% max HR) over 8–12 weeks can reduce resting HR by 5–25 bpm. Other factors: adequate sleep (7–9 hours), stress management, staying well hydrated, limiting caffeine and alcohol, and not smoking. Each 10 bpm reduction in resting HR is associated with meaningful reduction in cardiovascular mortality risk.' },
  { q:'What affects resting heart rate day to day?',
    a:'Resting HR can vary by 5–10 bpm daily due to: sleep quality, dehydration, stress and cortisol levels, illness (even mild), recent caffeine, alcohol from the night before, and whether you measured correctly. For the most accurate baseline, measure every morning before getting up for 7 consecutive days and average the results.' },
  { q:'How is resting heart rate related to fitness?',
    a:'The heart is a muscle — aerobic training makes it larger and stronger, allowing it to pump more blood per beat (higher stroke volume). As stroke volume increases, fewer beats are needed to maintain the same cardiac output, so resting HR drops. This adaptation is one of the clearest measurable markers of improving cardiovascular fitness.' },
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
        <button
          onMouseDown={e => { e.preventDefault(); onChange(clamp(value - step, min, max)) }}
          style={{ ...btn, borderRight:'1px solid var(--border)' }}
          onMouseEnter={e => e.currentTarget.style.background = catColor + '18'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-raised)'}
        >
          −
        </button>

        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:5 }}>
          {editing ? (
            <input
              type="number"
              defaultValue={value}
              onBlur={e => commit(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') commit(e.target.value)
                if (e.key === 'Escape') setEditing(false)
              }}
              style={{ width:'55%', border:'none', background:'transparent', textAlign:'center', fontSize:15, fontWeight:700, color:'var(--text)', outline:'none' }}
              autoFocus
            />
          ) : (
            <span
              onClick={() => setEditing(true)}
              style={{ fontSize:15, fontWeight:700, color:'var(--text)', cursor:'text', minWidth:36, textAlign:'center' }}
            >
              {value}
            </span>
          )}
          <span style={{ fontSize:11, color:'var(--text-3)', fontWeight:500 }}>{unit}</span>
        </div>

        <button
          onMouseDown={e => { e.preventDefault(); onChange(clamp(value + step, min, max)) }}
          style={{ ...btn, borderLeft:'1px solid var(--border)' }}
          onMouseEnter={e => e.currentTarget.style.background = catColor + '18'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-raised)'}
        >
          +
        </button>
      </div>
    </div>
  )
}

function InsightCard({ rhr, cat, maxHR, reserve, catColor }) {
  let message = ''
  let tone = ''
  let recommendation = ''

  if (rhr <= 60) {
    tone = 'Excellent cardiovascular baseline'
    message = 'Your resting heart rate suggests strong cardiovascular efficiency. This is often seen in active or aerobically fit individuals.'
    recommendation = 'Maintain your routine with regular aerobic exercise, consistent sleep, and hydration.'
  } else if (rhr <= 72) {
    tone = 'Good overall range'
    message = 'Your resting heart rate is in a reasonably healthy range, but there may still be room to improve your cardiovascular fitness over time.'
    recommendation = 'A modest improvement of 5–10 bpm may be possible with regular walking, cycling, or Zone 2 cardio.'
  } else if (rhr <= 84) {
    tone = 'Average to slightly elevated'
    message = 'Your resting heart rate is not unusual, but it may indicate lower aerobic conditioning, stress, poor sleep, or inconsistent recovery.'
    recommendation = 'Focus on sleep, daily movement, hydration, and reducing stress to gradually improve your baseline.'
  } else {
    tone = 'Higher than ideal resting rate'
    message = 'Your resting heart rate is on the higher side, which can sometimes reflect stress, illness, low fitness, dehydration, stimulants, or poor recovery.'
    recommendation = 'Retest over several mornings. If this stays elevated or you have symptoms, consider medical evaluation.'
  }

  return (
    <Sec title="Your personalized insight" sub={tone}>
      <div style={{ display:'grid', gap:14 }}>
        <div style={{ padding:'14px 15px', borderRadius:12, background:catColor + '12', border:`1px solid ${catColor}35` }}>
          <div style={{ fontSize:13, fontWeight:700, color:catColor, marginBottom:6, fontFamily:"'Space Grotesk',sans-serif" }}>
            {cat.label} category
          </div>
          <p style={{ margin:0, fontSize:12.5, color:'var(--text-2)', lineHeight:1.75, fontFamily:"'DM Sans',sans-serif" }}>
            {message}
          </p>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(3, minmax(0, 1fr))', gap:10 }}>
          {[
            { label:'Resting HR', value:`${rhr} bpm` },
            { label:'Max HR', value:`${maxHR} bpm` },
            { label:'HR reserve', value:`${reserve} bpm` },
          ].map((item, i) => (
            <div key={i} style={{ padding:'12px 10px', borderRadius:10, background:'var(--bg-raised)', border:'0.5px solid var(--border)' }}>
              <div style={{ fontSize:10.5, color:'var(--text-3)', marginBottom:4 }}>{item.label}</div>
              <div style={{ fontSize:15, fontWeight:700, color:'var(--text)', fontFamily:"'Space Grotesk',sans-serif" }}>{item.value}</div>
            </div>
          ))}
        </div>

        <div style={{ padding:'12px 14px', borderRadius:10, background:'var(--bg-raised)', border:'0.5px solid var(--border)' }}>
          <div style={{ fontSize:11, fontWeight:700, color:'var(--text)', marginBottom:6, fontFamily:"'DM Sans',sans-serif" }}>
            Recommended next focus
          </div>
          <p style={{ margin:0, fontSize:12, color:'var(--text-2)', lineHeight:1.7, fontFamily:"'DM Sans',sans-serif" }}>
            {recommendation}
          </p>
        </div>
      </div>
    </Sec>
  )
}

function ActionSteps({ rhr, catColor }) {
  const items =
    rhr <= 60
      ? [
          'Maintain your aerobic base with 3–5 days of cardio each week.',
          'Keep sleep quality high and monitor changes during stress or illness.',
          'Track your morning baseline weekly so you notice trends early.',
        ]
      : rhr <= 72
      ? [
          'Add 20–30 minutes of brisk walking or cycling 4–5 times per week.',
          'Aim for consistent hydration and avoid measuring after caffeine.',
          'Retest first thing in the morning for 7 days and average the readings.',
        ]
      : rhr <= 84
      ? [
          'Start with daily walking and gradual aerobic conditioning.',
          'Improve sleep duration and reduce late-night stimulants.',
          'Review stress, hydration, and recovery habits over the next 2–4 weeks.',
        ]
      : [
          'Repeat measurements over several mornings under consistent conditions.',
          'Reduce stimulants, address hydration, and prioritize recovery.',
          'Seek medical guidance if your reading remains high or symptoms are present.',
        ]

  return (
    <Sec title="What to do next" sub="Simple actions that can help">
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

function GoalTracker({ rhr, catColor }) {
  const goal = 60
  const improvementNeeded = Math.max(0, rhr - goal)
  const progress = Math.max(0, Math.min(100, ((90 - rhr) / (90 - goal)) * 100))

  return (
    <Sec title="Goal tracker" sub="Progress toward a stronger baseline">
      <div style={{ display:'grid', gap:14 }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3, minmax(0, 1fr))', gap:10 }}>
          <div style={{ padding:'12px 10px', borderRadius:10, background:'var(--bg-raised)', border:'0.5px solid var(--border)' }}>
            <div style={{ fontSize:10.5, color:'var(--text-3)', marginBottom:4 }}>Current</div>
            <div style={{ fontSize:16, fontWeight:700, color:'var(--text)', fontFamily:"'Space Grotesk',sans-serif" }}>{rhr} bpm</div>
          </div>
          <div style={{ padding:'12px 10px', borderRadius:10, background:'var(--bg-raised)', border:'0.5px solid var(--border)' }}>
            <div style={{ fontSize:10.5, color:'var(--text-3)', marginBottom:4 }}>Target</div>
            <div style={{ fontSize:16, fontWeight:700, color:catColor, fontFamily:"'Space Grotesk',sans-serif" }}>{goal} bpm</div>
          </div>
          <div style={{ padding:'12px 10px', borderRadius:10, background:'var(--bg-raised)', border:'0.5px solid var(--border)' }}>
            <div style={{ fontSize:10.5, color:'var(--text-3)', marginBottom:4 }}>To improve</div>
            <div style={{ fontSize:16, fontWeight:700, color:'var(--text)', fontFamily:"'Space Grotesk',sans-serif" }}>{improvementNeeded} bpm</div>
          </div>
        </div>

        <div>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
            <span style={{ fontSize:11.5, color:'var(--text-2)', fontWeight:600 }}>Estimated progress</span>
            <span style={{ fontSize:11.5, color:catColor, fontWeight:700 }}>{Math.round(progress)}%</span>
          </div>
          <div style={{ height:10, background:'var(--border)', borderRadius:999, overflow:'hidden' }}>
            <div style={{ width:`${progress}%`, height:'100%', background:catColor, borderRadius:999, transition:'width .4s ease' }} />
          </div>
        </div>

        <p style={{ margin:0, fontSize:12, color:'var(--text-3)', lineHeight:1.7, fontFamily:"'DM Sans',sans-serif" }}>
          This is a motivational target, not a diagnosis. Improvements usually come from consistent aerobic exercise, better sleep, lower stress, and recovery habits over time.
        </p>
      </div>
    </Sec>
  )
}

function DidYouKnow({ catColor }) {
  const facts = [
    'Resting heart rate is usually lowest immediately after waking.',
    'Regular aerobic training can lower resting heart rate over time.',
    'Poor sleep, dehydration, illness, and stress can temporarily raise your reading.',
  ]

  return (
    <Sec title="Did you know?" sub="Quick facts">
      <div style={{ display:'grid', gap:10 }}>
        {facts.map((fact, i) => (
          <div key={i} style={{ padding:'12px 13px', borderRadius:10, background:i === 0 ? catColor + '10' : 'var(--bg-raised)', border:`0.5px solid ${i === 0 ? catColor + '40' : 'var(--border)'}` }}>
            <div style={{ fontSize:11, fontWeight:700, color:i === 0 ? catColor : 'var(--text)', marginBottom:4, fontFamily:"'DM Sans',sans-serif" }}>
              Fact {i + 1}
            </div>
            <p style={{ margin:0, fontSize:12.5, color:'var(--text-2)', lineHeight:1.65, fontFamily:"'DM Sans',sans-serif" }}>
              {fact}
            </p>
          </div>
        ))}
      </div>
    </Sec>
  )
}

export default function RestingHeartRateCalculator({ meta, category }) {
  const catColor = category?.color || '#ef4444'
  const [rhr, setRhr] = useState(68)
  const [age, setAge] = useState(35)
  const [sex, setSex] = useState('male')
  const [openFaq, setOpenFaq] = useState(null)

  const cats = sex === 'male' ? RHR_CATS_MALE : RHR_CATS_FEMALE
  const cat = cats.find(c => rhr <= c.max) || cats[cats.length - 1]
  const maxHR = 220 - age
  const maxVal = 110
  const reserve = maxHR - rhr

  const hint = `Resting HR: ${rhr} bpm — ${cat.label}. Max HR (estimated): ${maxHR} bpm. HR reserve: ${reserve} bpm. Target: below 60 bpm for optimal cardiovascular fitness.`

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <CalcShell
        left={
          <>
            <div style={{ fontSize:10, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:14 }}>
              Your stats
            </div>

            <Stepper
              label="Resting heart rate"
              value={rhr}
              onChange={setRhr}
              min={30}
              max={130}
              unit="bpm"
              hint="Measure on waking"
              catColor={catColor}
            />

            <Stepper
              label="Age"
              value={age}
              onChange={setAge}
              min={10}
              max={100}
              unit="yrs"
              catColor={catColor}
            />

            <div style={{ borderTop:'0.5px solid var(--border)', paddingTop:16, marginTop:4 }}>
              <div style={{ fontSize:12, fontWeight:600, color:'var(--text-2)', marginBottom:8, fontFamily:"'DM Sans',sans-serif" }}>
                Sex
              </div>
              <div style={{ display:'flex', gap:8 }}>
                {[{ v:'male', l:'Male' }, { v:'female', l:'Female' }].map(o => (
                  <button
                    key={o.v}
                    onClick={() => setSex(o.v)}
                    style={{
                      flex:1,
                      padding:'10px',
                      borderRadius:9,
                      border:`1.5px solid ${sex === o.v ? catColor : 'var(--border-2)'}`,
                      background:sex === o.v ? catColor + '12' : 'var(--bg-raised)',
                      fontSize:12,
                      fontWeight:sex === o.v ? 700 : 500,
                      color:sex === o.v ? catColor : 'var(--text-2)',
                      cursor:'pointer',
                      fontFamily:"'DM Sans',sans-serif"
                    }}
                  >
                    {o.l}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ borderTop:'0.5px solid var(--border)', paddingTop:14, marginTop:16 }}>
              <div style={{ fontSize:12, fontWeight:600, color:'var(--text-2)', marginBottom:8, fontFamily:"'DM Sans',sans-serif" }}>
                How to measure correctly
              </div>
              <p style={{ fontSize:11.5, color:'var(--text-3)', lineHeight:1.65, margin:0, fontFamily:"'DM Sans',sans-serif" }}>
                Measure immediately upon waking before getting up. Lie still for 1 minute, then count beats for 60 seconds. Average readings over 3–7 mornings for your true baseline.
              </p>
            </div>

            <div style={{ borderTop:'0.5px solid var(--border)', paddingTop:14, marginTop:14 }}>
              <div style={{ fontSize:12, fontWeight:600, color:'var(--text-2)', marginBottom:8, fontFamily:"'DM Sans',sans-serif" }}>
                Categories ({sex === 'male' ? 'male' : 'female'})
              </div>

              {cats.map((c, i) => (
                <div
                  key={i}
                  style={{
                    display:'flex',
                    justifyContent:'space-between',
                    padding:'5px 10px',
                    borderRadius:6,
                    background:cat.label === c.label ? c.color + '12' : 'var(--bg-raised)',
                    border:`${cat.label === c.label ? '1.5' : '0.5'}px solid ${cat.label === c.label ? c.color : 'var(--border)'}`,
                    marginBottom:3
                  }}
                >
                  <span style={{ fontSize:11, fontWeight:cat.label === c.label ? 700 : 400, color:c.color }}>
                    {c.label}
                  </span>
                  <span style={{ fontSize:10, color:'var(--text-3)' }}>
                    ≤{c.max < 999 ? c.max : '100+'} bpm
                  </span>
                </div>
              ))}
            </div>
          </>
        }
        right={
          <>
            <div style={{ background:'var(--bg-card)', border:'0.5px solid var(--border)', borderRadius:14, overflow:'hidden', marginBottom:14 }}>
              <div style={{ padding:'11px 16px', borderBottom:'0.5px solid var(--border)', display:'flex', justifyContent:'space-between' }}>
                <span style={{ fontSize:12, fontWeight:700, color:'var(--text)', fontFamily:"'Space Grotesk',sans-serif" }}>
                  Resting Heart Rate
                </span>
                <span style={{ fontSize:10, color:'var(--text-3)' }}>
                  You vs benchmarks
                </span>
              </div>

              <div style={{ padding:'16px 18px' }}>
                <div style={{ display:'flex', alignItems:'flex-end', gap:12, marginBottom:16 }}>
                  <div>
                    <div style={{ fontSize:52, fontWeight:700, lineHeight:1, color:cat.color, fontFamily:"'Space Grotesk',sans-serif", transition:'color .3s' }}>
                      {rhr}
                    </div>
                    <div style={{ fontSize:11, color:'var(--text-3)', marginTop:3 }}>
                      bpm resting
                    </div>
                  </div>

                  <div style={{ paddingBottom:6 }}>
                    <div style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'5px 12px 5px 8px', borderRadius:20, background:cat.color + '18', border:`1px solid ${cat.color}35` }}>
                      <div style={{ width:8, height:8, borderRadius:'50%', background:cat.color }} />
                      <span style={{ fontSize:12, fontWeight:700, color:cat.color }}>
                        {cat.label}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 12px', borderRadius:8, background:cat.color + '12', border:`1.5px solid ${cat.color}`, marginBottom:6 }}>
                  <div style={{ width:120, fontSize:11, fontWeight:700, color:cat.color, flexShrink:0 }}>
                    You ← {cat.label}
                  </div>
                  <div style={{ flex:1, height:7, background:'var(--border)', borderRadius:3 }}>
                    <div style={{ height:'100%', width:`${(rhr / maxVal) * 100}%`, background:cat.color, borderRadius:3, transition:'width .5s' }} />
                  </div>
                  <div style={{ fontSize:12, fontWeight:700, color:cat.color, minWidth:36, textAlign:'right' }}>
                    {rhr}
                  </div>
                </div>

                {BENCHMARKS.map((b, i) => (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'7px 12px', borderRadius:8, background:'var(--bg-raised)', border:'0.5px solid var(--border)', marginBottom:4 }}>
                    <div style={{ width:120, flexShrink:0 }}>
                      <div style={{ fontSize:11, color:'var(--text)' }}>{b.label}</div>
                      <div style={{ fontSize:9, color:'var(--text-3)' }}>{b.note}</div>
                    </div>
                    <div style={{ flex:1, height:5, background:'var(--border)', borderRadius:3 }}>
                      <div style={{ height:'100%', width:`${(b.value / maxVal) * 100}%`, background:catColor, opacity:0.45, borderRadius:3 }} />
                    </div>
                    <div style={{ fontSize:11, fontWeight:600, color:'var(--text-2)', minWidth:36, textAlign:'right' }}>{b.value}</div>
                  </div>
                ))}
              </div>
            </div>

            <BreakdownTable
              title="RHR Summary"
              rows={[
                { label:'Resting HR', value:`${rhr} bpm`, bold:true, highlight:true, color:cat.color },
                { label:'Category', value:cat.label, color:cat.color },
                { label:'Max HR (est)', value:`${maxHR} bpm` },
                { label:'HR reserve', value:`${reserve} bpm` },
                { label:'Target', value:'< 60 bpm (optimal)' },
              ]}
            />

            <AIHintCard hint={hint} />
          </>
        }
      />

      <InsightCard
        rhr={rhr}
        cat={cat}
        maxHR={maxHR}
        reserve={reserve}
        catColor={catColor}
      />

      <ActionSteps
        rhr={rhr}
        catColor={catColor}
      />

      <GoalTracker
        rhr={rhr}
        catColor={catColor}
      />

      <DidYouKnow
        catColor={catColor}
      />

      <Sec title="Frequently asked questions" sub="Resting heart rate explained">
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