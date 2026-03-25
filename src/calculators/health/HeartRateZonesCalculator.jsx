import { useState, useEffect, useRef } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'
import InsightRotator from '../../components/health/InsightRotator'

const clamp = (v,a,b) => Math.min(b, Math.max(a, v))

const ZONES = [
  { z:1, name:'Recovery',    pctMin:50, pctMax:60,  color:'#94a3b8', desc:'Very light effort. Active recovery between sessions.',          training:'Easy walks, warm-up, cool-down' },
  { z:2, name:'Aerobic Base',pctMin:60, pctMax:70,  color:'#22a355', desc:'Conversational pace. Builds aerobic base and fat burning.',      training:'Easy runs, long cycles, base building' },
  { z:3, name:'Aerobic',     pctMin:70, pctMax:80,  color:'#3b82f6', desc:'Moderate effort. Improves cardiovascular efficiency.',           training:'Tempo runs, moderate-intensity cardio' },
  { z:4, name:'Threshold',   pctMin:80, pctMax:90,  color:'#f59e0b', desc:'Hard effort. Raises lactate threshold and VO2 max.',            training:'Interval training, race pace, HIIT' },
  { z:5, name:'Maximum',     pctMin:90, pctMax:100, color:'#ef4444', desc:'Maximum effort. Sprint intervals and race finishing kicks.',     training:'Sprints, max intervals, peak performance' },
]

const FAQ = [
  { q:'What is the most accurate way to find my max heart rate?',
    a:"A true max HR test: 10 min warm-up, then 3×3 min intervals at increasing intensity, then a 1-min all-out sprint. The peak HR at the end is your measured max. The 220-age formula is a population average with ±10–15 bpm standard deviation — it can be significantly wrong for individuals. The Tanaka formula (208 − 0.7×age) is slightly more accurate." },
  { q:'What zone should I spend most time in?',
    a:'For general fitness and fat burning, Zone 2 (60–70% max HR) is the most effective training zone. It improves mitochondrial density and fat oxidation without the recovery cost of high-intensity training. Many elite endurance athletes do 80% of training in Zone 2 and 20% in Zone 4–5 ("polarised training").' },
  { q:"How do I know I'm in the right zone?",
    a:'Zone 2: you can hold a full conversation without gasping. Zone 3: you can speak in short sentences. Zone 4: you can only manage one or two words. Zone 5: you cannot speak at all. Using a heart rate monitor gives precise feedback, but the "talk test" is a simple field method.' },
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

function TrainingInsightSection({ age, restHR, maxHR, hrReserve, zones, method, catColor }) {
  const zone2 = zones[1]
  const zone4 = zones[3]
  const restingLabel =
    restHR <= 55 ? 'athletic range'
    : restHR <= 65 ? 'good range'
    : restHR <= 79 ? 'average range'
    : 'higher resting range'

  return (
    <Sec title="Your training insight" sub="What your numbers suggest">
      <div style={{ display:'grid', gap:14 }}>
        <div style={{ padding:'14px 15px', borderRadius:12, background:catColor+'10', border:`1px solid ${catColor}35` }}>
          <div style={{ fontSize:13, fontWeight:700, color:catColor, marginBottom:6, fontFamily:"'Space Grotesk',sans-serif" }}>
            Best all-around training zone
          </div>
          <p style={{ margin:0, fontSize:12.5, color:'var(--text-2)', lineHeight:1.75, fontFamily:"'DM Sans',sans-serif" }}>
            For most people, Zone 2 is the most useful zone to build fitness consistently. Your Zone 2 range is <strong style={{ color:zone2.color }}>{zone2.minBpm}–{zone2.maxBpm} bpm</strong>. Your resting heart rate of {restHR} bpm is in the <strong>{restingLabel}</strong>.
          </p>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(4, minmax(0, 1fr))', gap:10 }}>
          {[
            { label:'Max HR', value:`${maxHR}` },
            { label:'Resting HR', value:`${restHR}` },
            { label:'HR reserve', value:`${hrReserve}` },
            { label:'Method', value:method === 'karvonen' ? 'HRR' : method === 'tanaka' ? 'Tanaka' : '% Max' },
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
            Spend most of your weekly volume in Zone 2, and use Zone 4 in short, intentional sessions. Your threshold zone is <strong style={{ color:zone4.color }}>{zone4.minBpm}–{zone4.maxBpm} bpm</strong>.
          </p>
        </div>
      </div>
    </Sec>
  )
}

function ZoneUseCasesSection({ zones }) {
  return (
    <Sec title="What each zone is best for" sub="Use the right zone for the right goal">
      <div style={{ display:'grid', gap:8 }}>
        {zones.map((z, i) => (
          <div key={i} style={{ display:'flex', gap:10, alignItems:'flex-start', padding:'11px 12px', borderRadius:9, background:'var(--bg-raised)', border:'0.5px solid var(--border)' }}>
            <div style={{ width:10, height:10, borderRadius:'50%', background:z.color, marginTop:4, flexShrink:0 }} />
            <div style={{ flex:1 }}>
              <div style={{ fontSize:12, fontWeight:700, color:z.color, marginBottom:3 }}>Zone {z.z} — {z.name}</div>
              <div style={{ fontSize:11.5, color:'var(--text-2)', lineHeight:1.55, marginBottom:3 }}>{z.desc}</div>
              <div style={{ fontSize:10.5, color:'var(--text-3)' }}>Best for: {z.training}</div>
            </div>
            <div style={{ fontSize:11, fontWeight:700, color:z.color, minWidth:70, textAlign:'right' }}>{z.minBpm}–{z.maxBpm}</div>
          </div>
        ))}
      </div>
    </Sec>
  )
}

function WeeklyPlanSection({ zones, catColor }) {
  const zone2 = zones[1]
  const zone4 = zones[3]

  return (
    <Sec title="Example weekly training split" sub="A simple interactive guide">
      <div style={{ display:'grid', gap:12 }}>
        <div style={{ display:'flex', gap:3, height:34, borderRadius:8, overflow:'hidden' }}>
          {[
            { label:'Z1', pct:10, color:'#94a3b8' },
            { label:'Z2', pct:50, color:'#22a355' },
            { label:'Z3', pct:20, color:'#3b82f6' },
            { label:'Z4', pct:15, color:'#f59e0b' },
            { label:'Z5', pct:5,  color:'#ef4444' },
          ].map((z, i) => (
            <div key={i} style={{ flex:z.pct, background:z.color, display:'flex', alignItems:'center', justifyContent:'center' }}>
              {z.pct >= 10 && <span style={{ fontSize:8, fontWeight:700, color:'#fff' }}>{z.pct}%</span>}
            </div>
          ))}
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
          {[
            { title:'Easy day', text:`Keep most sessions around Zone 2 (${zone2.minBpm}–${zone2.maxBpm} bpm).` },
            { title:'Hard day', text:`Use Zone 4 (${zone4.minBpm}–${zone4.maxBpm} bpm) for short intervals.` },
            { title:'Recovery', text:'Use Zone 1 after hard efforts or on lighter days.' },
            { title:'Avoid drift', text:'Do not turn every session into Zone 3 just because it feels productive.' },
          ].map((item, i) => (
            <div key={i} style={{ padding:'10px 12px', borderRadius:8, background:i === 0 ? catColor+'10' : 'var(--bg-raised)', border:`0.5px solid ${i === 0 ? catColor+'35' : 'var(--border)'}` }}>
              <div style={{ fontSize:11, fontWeight:700, color:i === 0 ? catColor : 'var(--text)', marginBottom:4 }}>{item.title}</div>
              <div style={{ fontSize:11, color:'var(--text-2)', lineHeight:1.5 }}>{item.text}</div>
            </div>
          ))}
        </div>
      </div>
    </Sec>
  )
}

function PracticalTipsSection({ catColor }) {
  const tips = [
    'Use a chest strap or reliable watch if you want accurate live zone tracking.',
    'Re-test resting HR every few weeks because zones may shift as fitness changes.',
    'Use the talk test alongside the monitor: Zone 2 should still feel conversational.',
    'Do not compare your zones directly with someone else’s — heart rates vary a lot between individuals.',
  ]

  return (
    <Sec title="How to use zones correctly" sub="Practical training tips">
      <div style={{ display:'grid', gap:8 }}>
        {tips.map((tip, i) => (
          <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:10, padding:'10px 12px', borderRadius:9, background:i === 0 ? catColor+'10' : 'var(--bg-raised)', border:`0.5px solid ${i === 0 ? catColor+'35' : 'var(--border)'}` }}>
            <div style={{ width:16, height:16, borderRadius:'50%', background:catColor, color:'#fff', fontSize:10, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:1 }}>✓</div>
            <p style={{ margin:0, fontSize:12.5, color:'var(--text-2)', lineHeight:1.6, fontFamily:"'DM Sans',sans-serif" }}>{tip}</p>
          </div>
        ))}
      </div>
    </Sec>
  )
}

function DoctorSection({ restHR }) {
  const items = [
    'Contact your doctor before starting intense training if you have heart disease, chest symptoms, fainting, or known rhythm issues.',
    restHR >= 100
      ? 'Because your resting heart rate is elevated, it may be worth discussing with your doctor, especially if it is persistent.'
      : 'If your resting heart rate changes suddenly or feels unusually high or low for you, talk to your doctor.',
    'This calculator is for training guidance and does not replace personal medical advice.',
  ]

  return (
    <Sec title="When to contact your doctor" sub="General training safety guidance">
      <div style={{ display:'grid', gap:10 }}>
        {items.map((item, i) => (
          <div key={i} style={{ padding:'12px 13px', borderRadius:10, background:'var(--bg-raised)', border:'0.5px solid var(--border)' }}>
            <p style={{ margin:0, fontSize:12.5, color:'var(--text-2)', lineHeight:1.65, fontFamily:"'DM Sans',sans-serif" }}>{item}</p>
          </div>
        ))}
      </div>
    </Sec>
  )
}

export default function HeartRateZonesCalculator({ meta, category }) {
  const catColor = category?.color || '#ef4444'
  const [age, setAge] = useState(30)
  const [restHR, setRestHR] = useState(65)
  const [sex, setSex] = useState('male')
  const [method, setMethod] = useState('karvonen')
  const [openFaq, setOpenFaq] = useState(null)

  const maxHR = method === 'tanaka' ? Math.round(208 - 0.7 * age) : 220 - age
  const hrReserve = maxHR - restHR

  const zones = ZONES.map(z => ({
    ...z,
    minBpm: method === 'karvonen'
      ? Math.round(restHR + hrReserve * (z.pctMin / 100))
      : Math.round(maxHR * (z.pctMin / 100)),
    maxBpm: method === 'karvonen'
      ? Math.round(restHR + hrReserve * (z.pctMax / 100))
      : Math.round(maxHR * (z.pctMax / 100)),
  }))

  const Slide1 = () => (
    <div>
      <div style={{ fontSize:10, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:10 }}>Your 5 heart rate zones</div>
      <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
        {zones.map((z, i) => (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 12px', borderRadius:8, background:'var(--bg-raised)', border:'0.5px solid var(--border)' }}>
            <div style={{ width:8, height:8, borderRadius:'50%', background:z.color, flexShrink:0 }} />
            <div style={{ flex:1 }}>
              <div style={{ fontSize:11, fontWeight:700, color:'var(--text)' }}>Zone {z.z} — {z.name}</div>
              <div style={{ fontSize:9, color:'var(--text-3)' }}>{z.training}</div>
            </div>
            <div style={{ fontSize:12, fontWeight:700, color:z.color, minWidth:70, textAlign:'right' }}>{z.minBpm}–{z.maxBpm} bpm</div>
          </div>
        ))}
      </div>
    </div>
  )

  const Slide2 = () => (
    <div>
      <div style={{ fontSize:10, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:10 }}>What each zone does</div>
      {zones.map((z, i) => (
        <div key={i} style={{ display:'flex', gap:10, marginBottom:8, padding:'8px 10px', borderRadius:8, background:'var(--bg-raised)', border:'0.5px solid var(--border)' }}>
          <div style={{ width:10, height:10, borderRadius:'50%', background:z.color, flexShrink:0, marginTop:2 }} />
          <div>
            <div style={{ fontSize:11, fontWeight:700, color:z.color, marginBottom:2 }}>Zone {z.z}: {z.name}</div>
            <div style={{ fontSize:11, color:'var(--text-2)', lineHeight:1.5 }}>{z.desc}</div>
          </div>
        </div>
      ))}
    </div>
  )

  const Slide3 = () => (
    <div>
      <div style={{ fontSize:10, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:12 }}>Recommended weekly training split</div>
      <div style={{ display:'flex', gap:3, height:32, borderRadius:8, overflow:'hidden', marginBottom:12 }}>
        {[{ z:'Z1', pct:10, color:'#94a3b8' }, { z:'Z2', pct:50, color:'#22a355' }, { z:'Z3', pct:20, color:'#3b82f6' }, { z:'Z4', pct:15, color:'#f59e0b' }, { z:'Z5', pct:5, color:'#ef4444' }].map((z, i) => (
          <div key={i} style={{ flex:z.pct, background:z.color, display:'flex', alignItems:'center', justifyContent:'center' }}>
            {z.pct >= 10 && <span style={{ fontSize:8, fontWeight:700, color:'#fff' }}>{z.pct}%</span>}
          </div>
        ))}
      </div>
      <p style={{ fontSize:11.5, color:'var(--text-2)', lineHeight:1.6, marginBottom:10, fontFamily:"'DM Sans',sans-serif" }}>
        The "polarised" model: ~80% low intensity (Z1–Z2) + ~20% high intensity (Z4–Z5). Zone 3 is often overused.
      </p>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
        {[{ label:'Fat loss', z2:60, z4:10 }, { label:'Cardio fitness', z2:50, z4:20 }, { label:'Race performance', z2:70, z4:25 }, { label:'Beginners', z2:80, z4:5 }].map((p, i) => (
          <div key={i} style={{ padding:'8px 10px', borderRadius:7, background:'var(--bg-raised)', border:'0.5px solid var(--border)' }}>
            <div style={{ fontSize:11, fontWeight:700, color:'var(--text)', marginBottom:4 }}>{p.label}</div>
            <div style={{ fontSize:10, color:'var(--text-3)' }}>Zone 2: {p.z2}% · Zone 4+: {p.z4}%</div>
          </div>
        ))}
      </div>
    </div>
  )

  const Slide4 = () => (
    <div>
      <div style={{ fontSize:10, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:10 }}>Your heart rate numbers</div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:8, marginBottom:12 }}>
        {[
          { label:'Max HR', val:`${maxHR} bpm`, note:'Formula estimate', color:catColor },
          { label:'Resting HR', val:`${restHR} bpm`, note:'Your input', color:'#22a355' },
          { label:'HR Reserve', val:`${hrReserve} bpm`, note:'Max − resting', color:'#3b82f6' },
          { label:'Method', val:method === 'karvonen' ? 'Karvonen' : method === 'tanaka' ? 'Tanaka' : '% Max', note:'Calculation method', color:'#f59e0b' },
        ].map((s, i) => (
          <div key={i} style={{ background:'var(--bg-raised)', borderRadius:8, padding:'10px 12px', border:'0.5px solid var(--border)' }}>
            <div style={{ fontSize:10, color:'var(--text-3)', marginBottom:2 }}>{s.label}</div>
            <div style={{ fontSize:16, fontWeight:700, color:s.color }}>{s.val}</div>
            <div style={{ fontSize:9, color:'var(--text-3)' }}>{s.note}</div>
          </div>
        ))}
      </div>
      <div style={{ padding:'10px 12px', background:'var(--bg-raised)', borderRadius:8, border:'0.5px solid var(--border)' }}>
        <div style={{ fontSize:10, fontWeight:700, color:'var(--text-3)', marginBottom:6 }}>Resting HR fitness reference</div>
        {[{ label:'Athlete', range:'40–55 bpm' }, { label:'Excellent', range:'56–65 bpm' }, { label:'Average', range:'66–79 bpm' }, { label:'Below avg', range:'≥80 bpm' }].map((r, i) => (
          <div key={i} style={{ display:'flex', justifyContent:'space-between', fontSize:11, marginBottom:3 }}>
            <span style={{ color:'var(--text-2)' }}>{r.label}</span>
            <span style={{ color:'var(--text-3)', fontWeight:500 }}>{r.range}</span>
          </div>
        ))}
      </div>
    </div>
  )

  const slides = [
    { label:'Your 5 zones', content:<Slide1 /> },
    { label:'Zone meanings', content:<Slide2 /> },
    { label:'Training split', content:<Slide3 /> },
    { label:'HR numbers', content:<Slide4 /> },
  ]

  const hint = `Max HR: ${maxHR} bpm. Zone 2 (aerobic): ${zones[1].minBpm}–${zones[1].maxBpm} bpm. Zone 4 (threshold): ${zones[3].minBpm}–${zones[3].maxBpm} bpm. Resting HR: ${restHR} bpm.`

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <CalcShell
        left={<>
          <div style={{ fontSize:10, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:14 }}>Your stats</div>
          <Stepper label="Age" value={age} onChange={setAge} min={10} max={100} unit="yrs" catColor={catColor} />
          <Stepper label="Resting heart rate" value={restHR} onChange={setRestHR} min={30} max={120} unit="bpm" hint="Measure first thing in morning" catColor={catColor} />

          <div style={{ borderTop:'0.5px solid var(--border)', paddingTop:16, marginTop:4 }}>
            <IconCardGroup label="Biological sex" options={SEX_OPTIONS} value={sex} onChange={setSex} catColor={catColor} />
          </div>

          <div style={{ borderTop:'0.5px solid var(--border)', paddingTop:16, marginTop:4 }}>
            <div style={{ fontSize:12, fontWeight:600, color:'var(--text-2)', marginBottom:8, fontFamily:"'DM Sans',sans-serif" }}>Calculation method</div>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {[
                { v:'karvonen', l:'Karvonen (HRR)', d:'Uses heart rate reserve — more accurate' },
                { v:'percent', l:'% of max HR', d:'Simpler, widely used in fitness apps' },
                { v:'tanaka', l:'Tanaka formula', d:'Better max HR estimate for older adults' },
              ].map(o => (
                <button key={o.v} onClick={() => setMethod(o.v)} style={{ display:'flex', flexDirection:'column', padding:'9px 13px', borderRadius:8, border:`1.5px solid ${method === o.v ? catColor : 'var(--border-2)'}`, background:method === o.v ? catColor + '12' : 'var(--bg-raised)', cursor:'pointer', textAlign:'left', fontFamily:"'DM Sans',sans-serif" }}>
                  <span style={{ fontSize:12, fontWeight:600, color:method === o.v ? catColor : 'var(--text)' }}>{o.l}</span>
                  <span style={{ fontSize:10, color:'var(--text-3)' }}>{o.d}</span>
                </button>
              ))}
            </div>
          </div>

          <div style={{ borderTop:'0.5px solid var(--border)', paddingTop:14, marginTop:12 }}>
            <p style={{ fontSize:11, color:'var(--text-3)', fontFamily:"'DM Sans',sans-serif", lineHeight:1.6, margin:0 }}>
              <strong style={{ color:'var(--text)', fontWeight:600 }}>Measure resting HR:</strong> Immediately on waking, before getting up. Count for 60 seconds.
            </p>
          </div>
        </>}
        right={<>
          <InsightRotator catColor={catColor} title="Heart Rate Zones" slides={slides} autoMs={4000} />
          <BreakdownTable title="Zone Summary" rows={[
            { label:'Max HR', value:`${maxHR} bpm`, bold:true, highlight:true, color:catColor },
            { label:'Resting HR', value:`${restHR} bpm` },
            ...zones.map(z => ({ label:`Zone ${z.z} — ${z.name}`, value:`${z.minBpm}–${z.maxBpm} bpm`, color:z.color })),
          ]} />
          <AIHintCard hint={hint} />
        </>}
      />

      <TrainingInsightSection
        age={age}
        restHR={restHR}
        maxHR={maxHR}
        hrReserve={hrReserve}
        zones={zones}
        method={method}
        catColor={catColor}
      />

      <ZoneUseCasesSection
        zones={zones}
      />

      <WeeklyPlanSection
        zones={zones}
        catColor={catColor}
      />

      <PracticalTipsSection
        catColor={catColor}
      />

      <DoctorSection
        restHR={restHR}
      />

      <Sec title="Frequently asked questions" sub="Everything about heart rate zones">
        {FAQ.map((f, i) => (
          <Acc key={i} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} catColor={catColor} />
        ))}
      </Sec>
    </div>
  )
}