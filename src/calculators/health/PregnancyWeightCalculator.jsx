import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'

const clamp = (v,a,b) => Math.min(b, Math.max(a, v))

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

function Stepper({label,hint,value,onChange,min,max,step=1,unit,catColor}) {
  const [editing,setEditing] = useState(false)

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
    <div style={{marginBottom:16}}>
      <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
        <label style={{fontSize:12.5,fontWeight:600,color:'var(--text)',fontFamily:"'DM Sans',sans-serif"}}>{label}</label>
        {hint && <span style={{fontSize:10,color:'var(--text-3)'}}>{hint}</span>}
      </div>

      <div style={{display:'flex',alignItems:'stretch',height:40,border:`1.5px solid ${editing?catColor:'var(--border-2)'}`,borderRadius:9,overflow:'hidden',background:'var(--bg-card)',transition:'border-color .15s'}}>
        <button
          onMouseDown={e=>{e.preventDefault();onChange(clamp(value-step,min,max))}}
          style={{...btn,borderRight:'1px solid var(--border)'}}
          onMouseEnter={e=>e.currentTarget.style.background=catColor+'18'}
          onMouseLeave={e=>e.currentTarget.style.background='var(--bg-raised)'}
        >
          −
        </button>

        <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',gap:5}}>
          {editing ? (
            <input
              type="number"
              defaultValue={value}
              onBlur={e=>commit(e.target.value)}
              onKeyDown={e=>{
                if(e.key==='Enter') commit(e.target.value)
                if(e.key==='Escape') setEditing(false)
              }}
              style={{width:'55%',border:'none',background:'transparent',textAlign:'center',fontSize:15,fontWeight:700,color:'var(--text)',outline:'none'}}
              autoFocus
            />
          ) : (
            <span onClick={()=>setEditing(true)} style={{fontSize:15,fontWeight:700,color:'var(--text)',cursor:'text',minWidth:36,textAlign:'center'}}>
              {value}
            </span>
          )}
          <span style={{fontSize:11,color:'var(--text-3)',fontWeight:500}}>{unit}</span>
        </div>

        <button
          onMouseDown={e=>{e.preventDefault();onChange(clamp(value+step,min,max))}}
          style={{...btn,borderLeft:'1px solid var(--border)'}}
          onMouseEnter={e=>e.currentTarget.style.background=catColor+'18'}
          onMouseLeave={e=>e.currentTarget.style.background='var(--bg-raised)'}
        >
          +
        </button>
      </div>
    </div>
  )
}

const GUIDELINES = [
  { bmi:'Underweight (<18.5)', total:[12.5,18], weekly:[0.5,0.6], color:'#3b82f6' },
  { bmi:'Normal (18.5–24.9)',  total:[11.5,16], weekly:[0.4,0.5], color:'#10b981' },
  { bmi:'Overweight (25–29.9)',total:[7,11.5],  weekly:[0.2,0.3], color:'#f59e0b' },
  { bmi:'Obese (≥30)',         total:[5,9],     weekly:[0.2,0.3], color:'#ef4444' },
]

const FAQ = [
  {q:'How much weight should I gain during pregnancy?',a:'The Institute of Medicine (IOM) guidelines are based on pre-pregnancy BMI. Normal BMI: 11.5–16 kg total (0.4–0.5 kg/week in 2nd/3rd trimester). Underweight: 12.5–18 kg. Overweight: 7–11.5 kg. Obese: 5–9 kg. These are population guidelines — your doctor may adjust based on your specific situation.'},
  {q:'Where does the pregnancy weight go?',a:'A typical 12.5 kg gain breaks down as: baby ~3.4 kg, placenta ~0.7 kg, amniotic fluid ~0.9 kg, breast tissue ~0.9 kg, uterus ~1 kg, blood volume ~1.5 kg, body fluids ~1.5 kg, and fat stores ~3.5 kg. The fat stores provide energy for breastfeeding after birth.'},
  {q:'What if I am gaining too much or too little?',a:'Excessive gain is associated with gestational diabetes, hypertension, large baby, and c-section. Insufficient gain is linked to preterm birth, low birth weight, and nutrient deficiency in the baby. If your gain is outside the expected range, speak with your doctor rather than trying to adjust diet independently during pregnancy.'},
]

function WeightInsightSection({ gained, weeks, status, statusColor, statusSoft, guide, preBmi, onTrackLow, onTrackHigh }) {
  let title = ''
  let message = ''
  let recommendation = ''

  if (status === 'On track') {
    title = 'You are tracking well'
    message = 'Your current weight gain is within the expected range for your pre-pregnancy BMI and stage of pregnancy.'
    recommendation = 'Keep focusing on balanced meals, hydration, steady activity, and routine check-ins.'
  } else if (status === 'Below target') {
    title = 'Below the expected range'
    message = 'Your current gain is a bit lower than the expected range for this stage. This does not always mean a problem, but it is worth monitoring.'
    recommendation = 'Try to prioritize nutrient-dense meals and discuss ongoing low gain with your doctor.'
  } else {
    title = 'Above the expected range'
    message = 'Your current gain is above the estimated range for this stage. That can happen for different reasons, including fluid changes, appetite, activity, or eating patterns.'
    recommendation = 'Focus on food quality, routine movement, and speak with your doctor if this trend continues.'
  }

  return (
    <Sec title="Your weight gain insight" sub={title}>
      <div style={{display:'grid',gap:14}}>
        <div style={{padding:'14px 15px',borderRadius:12,background:statusSoft,border:`1px solid ${statusColor}35`}}>
          <div style={{fontSize:13,fontWeight:700,color:statusColor,marginBottom:6,fontFamily:"'Space Grotesk',sans-serif"}}>
            {status}
          </div>
          <p style={{margin:0,fontSize:12.5,color:'var(--text-2)',lineHeight:1.75,fontFamily:"'DM Sans',sans-serif"}}>
            {message}
          </p>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'repeat(4, minmax(0, 1fr))',gap:10}}>
          {[
            { label:'BMI', value:preBmi.toFixed(1) },
            { label:'Week', value:String(weeks) },
            { label:'Gained', value:`${gained.toFixed(1)} kg` },
            { label:'Target now', value:`${onTrackLow.toFixed(1)}–${onTrackHigh.toFixed(1)}` },
          ].map((item, i) => (
            <div key={i} style={{padding:'12px 10px',borderRadius:10,background:'var(--bg-raised)',border:'0.5px solid var(--border)'}}>
              <div style={{fontSize:10.5,color:'var(--text-3)',marginBottom:4}}>{item.label}</div>
              <div style={{fontSize:15,fontWeight:700,color:'var(--text)',fontFamily:"'Space Grotesk',sans-serif"}}>{item.value}</div>
            </div>
          ))}
        </div>

        <div style={{padding:'12px 14px',borderRadius:10,background:'var(--bg-raised)',border:'0.5px solid var(--border)'}}>
          <div style={{fontSize:11,fontWeight:700,color:'var(--text)',marginBottom:6,fontFamily:"'DM Sans',sans-serif"}}>
            Recommended next focus
          </div>
          <p style={{margin:0,fontSize:12,color:'var(--text-2)',lineHeight:1.7,fontFamily:"'DM Sans',sans-serif"}}>
            {recommendation}
          </p>
          <p style={{margin:'8px 0 0',fontSize:11.5,color:'var(--text-3)',lineHeight:1.7,fontFamily:"'DM Sans',sans-serif"}}>
            BMI category: {guide.bmi}
          </p>
        </div>
      </div>
    </Sec>
  )
}

function ActionStepsSection({ status, catColor }) {
  const items = status === 'On track'
    ? [
        'Keep your meals balanced rather than trying to eat dramatically more.',
        'Stay active with doctor-approved movement like walking.',
        'Keep tracking weight trends over time, not just single weigh-ins.',
      ]
    : status === 'Below target'
    ? [
        'Add nutrient-dense calories through snacks like yogurt, nuts, eggs, or smoothies.',
        'Avoid skipping meals and spread intake across the day if appetite is low.',
        'Contact your doctor if weight gain stays low over the next few weeks.',
      ]
    : [
        'Focus on meal quality, not restriction or crash dieting.',
        'Reduce ultra-processed snacks and liquid calories where possible.',
        'Bring the trend up with your doctor if the gain continues faster than expected.',
      ]

  return (
    <Sec title="What to do next" sub="Simple actions that can help">
      <div style={{display:'grid',gap:10}}>
        {items.map((item, i) => (
          <div key={i} style={{display:'flex',gap:10,alignItems:'flex-start',padding:'12px 13px',borderRadius:10,background:'var(--bg-raised)',border:'0.5px solid var(--border)'}}>
            <div style={{width:22,height:22,borderRadius:'50%',background:catColor+'18',color:catColor,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,flexShrink:0}}>
              {i + 1}
            </div>
            <p style={{margin:0,fontSize:12.5,color:'var(--text-2)',lineHeight:1.65,fontFamily:"'DM Sans',sans-serif"}}>
              {item}
            </p>
          </div>
        ))}
      </div>
    </Sec>
  )
}

function WeightBreakdownSection({ gained, catColor }) {
  const referenceGain = Math.max(gained, 12.5)
  const parts = [
    { label:'Baby', value:3.4 },
    { label:'Placenta', value:0.7 },
    { label:'Amniotic fluid', value:0.9 },
    { label:'Breast tissue', value:0.9 },
    { label:'Uterus', value:1.0 },
    { label:'Blood volume', value:1.5 },
    { label:'Body fluids', value:1.5 },
    { label:'Fat stores', value:3.5 },
  ]

  return (
    <Sec title="Where pregnancy weight usually goes" sub="Educational breakdown">
      <div style={{display:'grid',gap:8}}>
        {parts.map((p, i) => (
          <div key={i} style={{display:'flex',alignItems:'center',gap:10}}>
            <div style={{width:105,fontSize:11.5,color:'var(--text)',flexShrink:0}}>{p.label}</div>
            <div style={{flex:1,height:7,background:'var(--border)',borderRadius:4}}>
              <div
                style={{
                  height:'100%',
                  width:`${(p.value / referenceGain) * 100}%`,
                  background:i === 0 ? catColor : catColor + '80',
                  borderRadius:4,
                  transition:'width .4s'
                }}
              />
            </div>
            <div style={{fontSize:11,color:'var(--text-3)',minWidth:40,textAlign:'right'}}>{p.value} kg</div>
          </div>
        ))}
      </div>
      <p style={{margin:'12px 0 0',fontSize:11.5,color:'var(--text-3)',lineHeight:1.7,fontFamily:"'DM Sans',sans-serif"}}>
        This is a typical educational breakdown, not a personal measurement. Your actual pattern may differ.
      </p>
    </Sec>
  )
}

function WeeklyCheckpointsSection({ weeks, guide, gained, onTrackLow, onTrackHigh, catColor }) {
  const checkpoints = [12, 20, 28, 36, 40]

  return (
    <Sec title="Weekly checkpoints" sub="See how this stage compares">
      <div style={{display:'grid',gap:8}}>
        {checkpoints.map((wk, i) => {
          const low = guide.total[0] * (wk / 40) * 0.85
          const high = guide.total[1] * (wk / 40) * 1.15
          const active = wk === weeks || (weeks > checkpoints[i - 1] && weeks < wk)

          return (
            <div key={wk} style={{padding:'11px 12px',borderRadius:9,background:active ? catColor + '10' : 'var(--bg-raised)',border:`0.5px solid ${active ? catColor + '35' : 'var(--border)'}`}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                <span style={{fontSize:12,fontWeight:700,color:active ? catColor : 'var(--text)'}}>Week {wk}</span>
                <span style={{fontSize:10.5,color:'var(--text-3)'}}>{low.toFixed(1)}–{high.toFixed(1)} kg</span>
              </div>
              <div style={{fontSize:11.5,color:'var(--text-2)',lineHeight:1.6}}>
                {wk === weeks
                  ? `At your current week, your expected range is about ${onTrackLow.toFixed(1)}–${onTrackHigh.toFixed(1)} kg.`
                  : `This checkpoint shows the estimated gain range around week ${wk}.`}
              </div>
            </div>
          )
        })}
      </div>
      <div style={{marginTop:12,padding:'10px 12px',background:catColor+'08',borderRadius:8,border:`1px solid ${catColor}22`}}>
        <div style={{fontSize:11.5,color:'var(--text-2)',lineHeight:1.65}}>
          Your current recorded gain: <strong style={{color:catColor}}>{gained.toFixed(1)} kg</strong>
        </div>
      </div>
    </Sec>
  )
}

function DoctorGuidanceSection({ status }) {
  const messages = [
    'Contact your doctor if weight gain is staying far below or far above expectations over multiple weeks.',
    'Contact your doctor sooner if swelling, severe nausea, dizziness, or rapid unexpected weight changes appear.',
    status === 'Below target'
      ? 'Because your gain is below target, it is worth checking in if appetite, nausea, or low gain continues.'
      : status === 'Above target'
      ? 'Because your gain is above target, discuss the trend with your doctor if it continues climbing quickly.'
      : 'Even when things are on track, routine pregnancy checkups still matter.',
  ]

  return (
    <Sec title="When to contact your doctor" sub="Important guidance">
      <div style={{display:'grid',gap:10}}>
        {messages.map((item, i) => (
          <div key={i} style={{padding:'12px 13px',borderRadius:10,background:'var(--bg-raised)',border:'0.5px solid var(--border)'}}>
            <p style={{margin:0,fontSize:12.5,color:'var(--text-2)',lineHeight:1.65,fontFamily:"'DM Sans',sans-serif"}}>
              {item}
            </p>
          </div>
        ))}
        <p style={{margin:'4px 0 0',fontSize:11.5,color:'var(--text-3)',lineHeight:1.7,fontFamily:"'DM Sans',sans-serif"}}>
          This calculator is for guidance only and does not replace personal medical advice.
        </p>
      </div>
    </Sec>
  )
}

export default function PregnancyWeightCalculator({meta,category}) {
  const catColor = category?.color || '#ec4899'
  const [preWKg,setPreWKg] = useState(65)
  const [hCm,setHCm] = useState(165)
  const [currentWKg,setCurrentWKg] = useState(70)
  const [weeks,setWeeks] = useState(20)
  const [openFaq,setOpenFaq] = useState(null)

  const hM = hCm / 100
  const preBmi = preWKg / (hM * hM)
  const guide = preBmi < 18.5 ? GUIDELINES[0] : preBmi < 25 ? GUIDELINES[1] : preBmi < 30 ? GUIDELINES[2] : GUIDELINES[3]
  const gained = currentWKg - preWKg
  const onTrackLow = guide.total[0] * (weeks / 40) * 0.85
  const onTrackHigh = guide.total[1] * (weeks / 40) * 1.15
  const expectedMid = (onTrackLow + onTrackHigh) / 2
  const status = gained < onTrackLow ? 'Below target' : gained > onTrackHigh ? 'Above target' : 'On track'
  const statusColor = status === 'On track' ? '#10b981' : status === 'Below target' ? '#3b82f6' : '#f59e0b'
  const statusSoft = status === 'On track' ? '#d1fae5' : status === 'Below target' ? '#dbeafe' : '#fef3c7'
  const score = clamp(100 - Math.round(Math.abs(gained - expectedMid) / Math.max(expectedMid,0.1) * 80), 20, 100)

  const R = 42
  const C = 54
  const circ = 2 * Math.PI * R
  const fill = circ * (score / 100)
  const rc = score >= 80 ? '#10b981' : score >= 60 ? '#3b82f6' : score >= 40 ? '#f59e0b' : '#ef4444'

  const factors = [
    {label:'Weight gained', value:`${gained.toFixed(1)} kg`, score:clamp((gained / guide.total[1]) * 100, 0, 100), color:statusColor, note:`Expected by w${weeks}: ${onTrackLow.toFixed(1)}–${onTrackHigh.toFixed(1)} kg`},
    {label:'Total target', value:`${guide.total[0]}–${guide.total[1]} kg`, score:65, color:guide.color, note:`${guide.bmi} — pre-pregnancy BMI ${preBmi.toFixed(1)}`},
    {label:'Weekly rate', value:`${guide.weekly[0]}–${guide.weekly[1]} kg/wk`, score:70, color:'#8b5cf6', note:'From 2nd trimester onwards'},
  ]

  const advice = status === 'On track'
    ? `Excellent — you are gaining at the right rate for your BMI. Continue eating nutrient-dense whole foods.`
    : status === 'Below target'
    ? `Slightly below expected. Increase intake with nutrient-dense foods and contact your doctor if the trend continues.`
    : `Slightly above expected. Focus on food quality over quantity. Light walking is often helpful if approved by your doctor.`

  const hint = `Pre-pregnancy BMI: ${preBmi.toFixed(1)} (${guide.bmi.split(' ')[0]}). Gained: ${gained.toFixed(1)} kg at week ${weeks} — ${status}. Target: ${guide.total[0]}–${guide.total[1]} kg total.`

  return (
    <div style={{display:'flex',flexDirection:'column',gap:20}}>
      <CalcShell
        left={
          <>
            <div>
              <div style={{fontSize:10,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:14}}>
                Your measurements
              </div>
              <Stepper label="Pre-pregnancy weight" value={preWKg} onChange={setPreWKg} min={30} max={200} unit="kg" catColor={catColor}/>
              <Stepper label="Height" value={hCm} onChange={setHCm} min={130} max={220} unit="cm" catColor={catColor}/>
              <Stepper label="Current weight" value={currentWKg} onChange={setCurrentWKg} min={30} max={250} unit="kg" catColor={catColor}/>
              <Stepper label="Weeks pregnant" value={weeks} onChange={setWeeks} min={1} max={42} unit="weeks" catColor={catColor}/>
            </div>

            <div style={{borderTop:'0.5px solid var(--border)',paddingTop:14,marginTop:4}}>
              <div style={{fontSize:12,fontWeight:600,color:'var(--text-2)',marginBottom:10,fontFamily:"'DM Sans',sans-serif"}}>
                IOM weight gain guidelines
              </div>
              {GUIDELINES.map((g,i)=>(
                <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'7px 10px',borderRadius:7,background:guide===g?g.color+'12':'var(--bg-raised)',border:`${guide===g?'1.5':'0.5'}px solid ${guide===g?g.color:'var(--border)'}`,marginBottom:4}}>
                  <span style={{fontSize:11,fontWeight:guide===g?700:400,color:g.color}}>
                    {g.bmi.split('(')[0].trim()}
                  </span>
                  <span style={{fontSize:10,color:'var(--text-3)'}}>
                    {g.total[0]}–{g.total[1]} kg total
                  </span>
                </div>
              ))}
            </div>
          </>
        }
        right={
          <>
            <div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,overflow:'hidden',marginBottom:14}}>
              <div style={{padding:'11px 16px',borderBottom:'0.5px solid var(--border)',display:'flex',justifyContent:'space-between'}}>
                <span style={{fontSize:12,fontWeight:700,color:'var(--text)',fontFamily:"'Space Grotesk',sans-serif"}}>
                  Weight Gain Score
                </span>
                <span style={{fontSize:10,color:'var(--text-3)'}}>Updates live</span>
              </div>

              <div style={{padding:'16px 18px'}}>
                <div style={{display:'flex',gap:18,alignItems:'center',marginBottom:16}}>
                  <svg viewBox="0 0 108 108" width="90" height="90" style={{flexShrink:0}}>
                    <circle cx={C} cy={C} r={R} fill="none" stroke="var(--border)" strokeWidth="11"/>
                    <circle cx={C} cy={C} r={R} fill="none" stroke={rc} strokeWidth="11" strokeLinecap="round" strokeDasharray={`${fill} ${circ}`} strokeDashoffset={circ/4} transform={`rotate(-90 ${C} ${C})`} style={{transition:'stroke-dasharray .6s,stroke .3s'}}/>
                    <text x={C} y={C-6} textAnchor="middle" fontSize="20" fontWeight="700" fill="var(--text)" fontFamily="inherit">{Math.round(score)}</text>
                    <text x={C} y={C+10} textAnchor="middle" fontSize="9" fill="var(--text-3)" fontFamily="inherit">/ 100</text>
                  </svg>

                  <div>
                    <div style={{display:'inline-flex',alignItems:'center',gap:6,padding:'5px 12px 5px 8px',borderRadius:20,background:statusSoft,border:`1px solid ${statusColor}35`,marginBottom:6}}>
                      <div style={{width:8,height:8,borderRadius:'50%',background:statusColor}}/>
                      <span style={{fontSize:12,fontWeight:700,color:statusColor}}>{status}</span>
                    </div>
                    <div style={{fontSize:11,color:'var(--text-3)',lineHeight:1.5}}>
                      Compared to IOM guidelines for your BMI category.
                    </div>
                  </div>
                </div>

                {factors.map((f,i)=>(
                  <div key={i} style={{marginBottom:10}}>
                    <div style={{display:'flex',justifyContent:'space-between',fontSize:11,marginBottom:4}}>
                      <span style={{color:'var(--text-2)'}}>{f.label}</span>
                      <span style={{fontWeight:700,color:f.color}}>{f.value}</span>
                    </div>
                    <div style={{height:6,background:'var(--border)',borderRadius:3,overflow:'hidden'}}>
                      <div style={{height:'100%',width:`${clamp(f.score,0,100)}%`,background:f.color,borderRadius:3,transition:'width .5s'}}/>
                    </div>
                    <div style={{fontSize:10,color:'var(--text-3)',marginTop:2}}>{f.note}</div>
                  </div>
                ))}

                <div style={{marginTop:12,padding:'10px 13px',background:statusSoft,borderRadius:10,border:`1px solid ${statusColor}30`}}>
                  <p style={{fontSize:11.5,color:'var(--text-2)',margin:0,lineHeight:1.65}}>{advice}</p>
                </div>
              </div>
            </div>

            <BreakdownTable
              title="Weight Summary"
              rows={[
                {label:'Gained so far', value:`${gained.toFixed(1)} kg`, bold:true, highlight:true, color:statusColor},
                {label:'Status', value:status, color:statusColor},
                {label:'Pre-preg BMI', value:`${preBmi.toFixed(1)} (${guide.bmi.split(' ')[0]})`},
                {label:'Total target', value:`${guide.total[0]}–${guide.total[1]} kg`, color:guide.color},
                {label:'Weekly rate', value:`${guide.weekly[0]}–${guide.weekly[1]} kg/wk`},
                {label:'Expected by now', value:`${onTrackLow.toFixed(1)}–${onTrackHigh.toFixed(1)} kg`},
                {label:'At week 40', value:`${(preWKg+guide.total[0]).toFixed(0)}–${(preWKg+guide.total[1]).toFixed(0)} kg`},
              ]}
            />

            <AIHintCard hint={hint}/>
          </>
        }
      />

      <WeightInsightSection
        gained={gained}
        weeks={weeks}
        status={status}
        statusColor={statusColor}
        statusSoft={statusSoft}
        guide={guide}
        preBmi={preBmi}
        onTrackLow={onTrackLow}
        onTrackHigh={onTrackHigh}
      />

      <ActionStepsSection
        status={status}
        catColor={catColor}
      />

      <WeightBreakdownSection
        gained={gained}
        catColor={catColor}
      />

      <WeeklyCheckpointsSection
        weeks={weeks}
        guide={guide}
        gained={gained}
        onTrackLow={onTrackLow}
        onTrackHigh={onTrackHigh}
        catColor={catColor}
      />

      <DoctorGuidanceSection
        status={status}
      />

      <Sec title="Frequently asked questions">
        {FAQ.map((f,i)=>(
          <Acc
            key={i}
            q={f.q}
            a={f.a}
            open={openFaq===i}
            onToggle={()=>setOpenFaq(openFaq===i?null:i)}
            catColor={catColor}
          />
        ))}
      </Sec>
    </div>
  )
}