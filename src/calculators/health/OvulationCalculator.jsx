import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'

const clamp = (v,a,b) => Math.min(b, Math.max(a, v))
const addDays = (d,n) => { const r=new Date(d); r.setDate(r.getDate()+n); return r }
const fmtDate = d => d.toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})
const fmtShort = d => d.toLocaleDateString('en-GB',{day:'numeric',month:'short'})
const daysBetween = (a,b) => Math.round((b-a)/86400000)

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

function DateInput({label,hint,value,onChange,catColor}) {
  return (
    <div style={{marginBottom:16}}>
      <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
        <label style={{fontSize:12.5,fontWeight:600,color:'var(--text)',fontFamily:"'DM Sans',sans-serif"}}>{label}</label>
        {hint && <span style={{fontSize:10,color:'var(--text-3)'}}>{hint}</span>}
      </div>
      <input
        type="date"
        value={value}
        onChange={e=>onChange(e.target.value)}
        style={{width:'100%',height:40,padding:'0 12px',border:'1.5px solid var(--border-2)',borderRadius:9,background:'var(--bg-card)',color:'var(--text)',fontSize:14,fontFamily:"'DM Sans',sans-serif",boxSizing:'border-box',outline:'none'}}
        onFocus={e=>e.target.style.borderColor=catColor}
        onBlur={e=>e.target.style.borderColor='var(--border-2)'}
      />
    </div>
  )
}

function Stepper({label,hint,value,onChange,min,max,step=1,unit,catColor}) {
  const [editing,setEditing]=useState(false)
  const commit=r=>{
    const n=parseFloat(r)
    onChange(clamp(isNaN(n)?value:n,min,max))
    setEditing(false)
  }
  const btn={width:38,height:'100%',border:'none',background:'var(--bg-raised)',color:'var(--text)',fontSize:20,fontWeight:300,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}

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

const FAQ=[
  {q:'How is ovulation calculated?',a:'Ovulation typically occurs 14 days before the next period (the luteal phase). For a 28-day cycle, that is day 14. For a 32-day cycle, it is day 18. The fertile window includes the 5 days before ovulation plus ovulation day itself — sperm can survive up to 5 days in the reproductive tract, but the egg is only viable for 12–24 hours after release.'},
  {q:'What is the luteal phase?',a:'The luteal phase is the time between ovulation and the start of the next period. It is remarkably consistent at 12–16 days (average 14) regardless of overall cycle length. Cycle length variation almost entirely comes from variation in the follicular phase (before ovulation). This is why ovulation is calculated from the end of the cycle backwards, not the beginning.'},
  {q:'How accurate is this calculator?',a:'This calculator is based on average cycle patterns. Actual ovulation varies due to stress, illness, weight changes, and hormonal fluctuations. For conception planning, tracking basal body temperature (BBT) and LH surge (ovulation predictor kits) alongside calendar methods gives the most accurate picture.'},
]

function FertilityInsightSection({ ovulation, fertWindowStart, fertWindowEnd, inWindow, daysToOvulation, ovulationDay, cycleLen, catColor }) {
  let title = ''
  let message = ''
  let recommendation = ''

  if (inWindow) {
    title = 'You are in your fertile window'
    message = 'This is the most relevant time in your cycle for conception chances. The highest probability is usually in the two days before ovulation and on ovulation day.'
    recommendation = 'If you are trying to conceive, this is the key window to focus on.'
  } else if (daysToOvulation > 0) {
    title = 'Fertile window is approaching'
    message = `Your estimated ovulation is in ${daysToOvulation} days. Your fertile window starts on ${fmtDate(fertWindowStart)}.`
    recommendation = 'Plan ahead for your key fertile days and keep an eye on cycle signs.'
  } else {
    title = 'This cycle window has likely passed'
    message = 'Based on your entries, ovulation has likely already happened in this cycle. These dates are still useful for spotting patterns and planning future cycles.'
    recommendation = 'Use this cycle to learn your rhythm and compare it with next cycle.'
  }

  return (
    <Sec title="Your fertility insight" sub={title}>
      <div style={{display:'grid',gap:14}}>
        <div style={{padding:'14px 15px',borderRadius:12,background:catColor+'10',border:`1px solid ${catColor}35`}}>
          <div style={{fontSize:13,fontWeight:700,color:catColor,marginBottom:6,fontFamily:"'Space Grotesk',sans-serif"}}>
            Ovulation day {ovulationDay}
          </div>
          <p style={{margin:0,fontSize:12.5,color:'var(--text-2)',lineHeight:1.75,fontFamily:"'DM Sans',sans-serif"}}>
            {message}
          </p>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'repeat(4, minmax(0, 1fr))',gap:10}}>
          {[
            { label:'Ovulation', value:fmtShort(ovulation) },
            { label:'Window start', value:fmtShort(fertWindowStart) },
            { label:'Window end', value:fmtShort(fertWindowEnd) },
            { label:'Cycle length', value:`${cycleLen}d` },
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
        </div>
      </div>
    </Sec>
  )
}

function BestDaysSection({ ovulation, catColor }) {
  const bestDays = [-2, -1, 0, 1].map(offset => {
    const d = addDays(ovulation, offset)
    return {
      offset,
      date: d,
      label:
        offset === -2 ? 'Highest chance' :
        offset === -1 ? 'Very high chance' :
        offset === 0 ? 'Ovulation day' :
        'Late fertile day'
    }
  })

  return (
    <Sec title="Best days to try" sub="Most useful conception timing">
      <div style={{display:'grid',gap:8}}>
        {bestDays.map((day, i) => (
          <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'11px 12px',borderRadius:9,background:i === 0 ? catColor+'10' : 'var(--bg-raised)',border:`0.5px solid ${i === 0 ? catColor+'35' : 'var(--border)'}`}}>
            <div>
              <div style={{fontSize:12,fontWeight:700,color:i === 0 ? catColor : 'var(--text)'}}>{day.label}</div>
              <div style={{fontSize:10.5,color:'var(--text-3)',marginTop:2}}>
                {day.offset === 0 ? 'Estimated ovulation day' : `${Math.abs(day.offset)} day${Math.abs(day.offset) > 1 ? 's' : ''} ${day.offset < 0 ? 'before' : 'after'} ovulation`}
              </div>
            </div>
            <div style={{fontSize:11.5,fontWeight:700,color:i === 0 ? catColor : 'var(--text)'}}>
              {fmtDate(day.date)}
            </div>
          </div>
        ))}
      </div>
    </Sec>
  )
}

function CycleTimelineSection({ lmp, ovulation, nextPeriod, fertWindowStart, fertWindowEnd, catColor }) {
  const items = [
    { label:'Period start', date:lmp, color:'#64748b' },
    { label:'Fertile window starts', date:fertWindowStart, color:'#3b82f6' },
    { label:'Ovulation', date:ovulation, color:catColor },
    { label:'Fertile window ends', date:fertWindowEnd, color:'#10b981' },
    { label:'Next period', date:nextPeriod, color:'#f59e0b' },
  ]

  return (
    <Sec title="Cycle timeline" sub="See the key dates clearly">
      <div style={{display:'grid',gap:8}}>
        {items.map((item, i) => (
          <div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 12px',borderRadius:9,background:i === 2 ? catColor+'10' : 'var(--bg-raised)',border:`0.5px solid ${i === 2 ? catColor+'35' : 'var(--border)'}`}}>
            <div style={{width:8,height:8,borderRadius:'50%',background:item.color,flexShrink:0}} />
            <div style={{flex:1}}>
              <div style={{fontSize:12,fontWeight:700,color:i === 2 ? catColor : 'var(--text)'}}>{item.label}</div>
            </div>
            <div style={{fontSize:11,color:'var(--text-3)'}}>{fmtDate(item.date)}</div>
          </div>
        ))}
      </div>
    </Sec>
  )
}

function AccuracySection({ catColor }) {
  const items = [
    'Use basal body temperature (BBT) tracking to confirm ovulation after it happens.',
    'Use LH ovulation predictor kits to identify the surge before ovulation.',
    'Watch for cervical mucus changes around the fertile window.',
    'Calendar predictions are less reliable when cycles are irregular.',
  ]

  return (
    <Sec title="How to improve accuracy" sub="Useful ways to confirm timing">
      <div style={{display:'grid',gap:8}}>
        {items.map((item, i) => (
          <div key={i} style={{display:'flex',alignItems:'flex-start',gap:10,padding:'10px 12px',borderRadius:9,background:i === 0 ? catColor+'10' : 'var(--bg-raised)',border:`0.5px solid ${i === 0 ? catColor+'35' : 'var(--border)'}`}}>
            <div style={{width:16,height:16,borderRadius:'50%',background:catColor,color:'#fff',fontSize:10,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginTop:1}}>
              ✓
            </div>
            <p style={{margin:0,fontSize:12.5,color:'var(--text-2)',lineHeight:1.6,fontFamily:"'DM Sans',sans-serif"}}>
              {item}
            </p>
          </div>
        ))}
      </div>
    </Sec>
  )
}

function DoctorSection() {
  const items = [
    'Talk to your doctor if your cycles are very irregular or you are not sure when ovulation happens.',
    'Talk to your doctor if periods stop, become unusually painful, or cycle length changes a lot month to month.',
    'If you are trying to conceive and timing has been difficult, a doctor can help you assess ovulation and cycle health.',
  ]

  return (
    <Sec title="When to contact your doctor" sub="General cycle guidance">
      <div style={{display:'grid',gap:10}}>
        {items.map((item, i) => (
          <div key={i} style={{padding:'12px 13px',borderRadius:10,background:'var(--bg-raised)',border:'0.5px solid var(--border)'}}>
            <p style={{margin:0,fontSize:12.5,color:'var(--text-2)',lineHeight:1.65,fontFamily:"'DM Sans',sans-serif"}}>
              {item}
            </p>
          </div>
        ))}
        <p style={{margin:'4px 0 0',fontSize:11.5,color:'var(--text-3)',lineHeight:1.7,fontFamily:"'DM Sans',sans-serif"}}>
          This calculator estimates timing only and does not replace personal medical advice.
        </p>
      </div>
    </Sec>
  )
}

export default function OvulationCalculator({meta,category}) {
  const catColor=category?.color||'#ec4899'
  const [lmpStr,setLmpStr]=useState(()=>{const d=new Date();d.setDate(d.getDate()-10);return d.toISOString().split('T')[0]})
  const [cycleLen,setCycleLen]=useState(28)
  const [lutealPhase,setLutealPhase]=useState(14)
  const [openFaq,setOpenFaq]=useState(null)

  const lmp=new Date(lmpStr)
  const ovulationDay=cycleLen-lutealPhase
  const ovulation=addDays(lmp,ovulationDay)
  const fertWindowStart=addDays(ovulation,-5)
  const fertWindowEnd=addDays(ovulation,1)
  const nextPeriod=addDays(lmp,cycleLen)
  const today=new Date()
  const daysToOvulation=daysBetween(today,ovulation)
  const inWindow=today>=fertWindowStart&&today<=fertWindowEnd

  const cycles=[0,1,2].map(i=>({
    lmpStart:addDays(lmp,i*cycleLen),
    ovDate:addDays(lmp,i*cycleLen+ovulationDay),
    winStart:addDays(lmp,i*cycleLen+ovulationDay-5),
    winEnd:addDays(lmp,i*cycleLen+ovulationDay+1),
  }))

  const storyColors=[catColor,'#0ea5e9','#f59e0b']
  const storySofts=[catColor+'18','#e0f2fe','#fef3c7']
  const stories=[
    {label:'Your ovulation',
     headline:inWindow?'You are in your fertile window now!':`Ovulation: ${fmtDate(ovulation)}`,
     detail:inWindow?`Your fertile window runs until ${fmtDate(fertWindowEnd)}. This is the highest conception probability window of your cycle.`:`${Math.abs(daysToOvulation)} days ${daysToOvulation>0?'until':'since'} ovulation. Ovulation is day ${ovulationDay} of your ${cycleLen}-day cycle.`},
    {label:'Fertile window',
     headline:`${fmtDate(fertWindowStart)} – ${fmtDate(fertWindowEnd)}`,
     detail:`Your 6-day fertile window (5 days before + ovulation day). Probability of conception per cycle: ~15–25% for healthy couples. Highest on days −2 and −1 before ovulation.`},
    {label:'Next 3 cycles',
     headline:`Next ovulation predicted ${fmtShort(cycles[1].ovDate)}`,
     detail:`Cycle 1: ovulation ${fmtShort(cycles[0].ovDate)} · Cycle 2: ${fmtShort(cycles[1].ovDate)} · Cycle 3: ${fmtShort(cycles[2].ovDate)}. Predictions become less accurate with irregular cycles.`},
  ]

  const hint=`Ovulation: ${fmtDate(ovulation)} (day ${ovulationDay}). Fertile window: ${fmtDate(fertWindowStart)}–${fmtDate(fertWindowEnd)}. ${inWindow?'Currently in fertile window.':''}`

  return (
    <div style={{display:'flex',flexDirection:'column',gap:20}}>
      <CalcShell
        left={
          <>
            <DateInput label="First day of last period (LMP)" value={lmpStr} onChange={setLmpStr} catColor={catColor}/>
            <Stepper label="Cycle length" value={cycleLen} onChange={setCycleLen} min={21} max={45} unit="days" hint="Average: 28 days" catColor={catColor}/>
            <Stepper label="Luteal phase length" value={lutealPhase} onChange={setLutealPhase} min={10} max={16} unit="days" hint="Average: 14 days" catColor={catColor}/>

            {inWindow && (
              <div style={{padding:'11px 13px',background:'#d1fae5',borderRadius:9,border:'1px solid #10b98130',marginTop:4}}>
                <div style={{fontSize:12,fontWeight:700,color:'#065f46'}}>🌸 You are in your fertile window</div>
                <div style={{fontSize:11,color:'#047857',marginTop:3}}>Window closes: {fmtDate(fertWindowEnd)}</div>
              </div>
            )}

            <div style={{borderTop:'0.5px solid var(--border)',paddingTop:14,marginTop:16}}>
              <div style={{fontSize:12,fontWeight:600,color:'var(--text-2)',marginBottom:10,fontFamily:"'DM Sans',sans-serif"}}>3-cycle forecast</div>
              {cycles.map((c,i)=>(
                <div key={i} style={{padding:'8px 12px',borderRadius:8,background:'var(--bg-raised)',border:'0.5px solid var(--border)',marginBottom:6}}>
                  <div style={{fontSize:10,fontWeight:700,color:'var(--text-3)',marginBottom:4}}>CYCLE {i+1}{i===0?' (current)':''}</div>
                  <div style={{display:'flex',gap:16,fontSize:11,color:'var(--text-2)'}}>
                    <span>Period: <strong style={{color:'var(--text)'}}>{fmtShort(c.lmpStart)}</strong></span>
                    <span>Ovulation: <strong style={{color:catColor}}>{fmtShort(c.ovDate)}</strong></span>
                  </div>
                  <div style={{fontSize:10,color:'var(--text-3)',marginTop:3}}>Window: {fmtShort(c.winStart)} – {fmtShort(c.winEnd)}</div>
                </div>
              ))}
            </div>
          </>
        }
        right={
          <>
            <div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,overflow:'hidden',marginBottom:14}}>
              <div style={{padding:'11px 16px',borderBottom:'0.5px solid var(--border)',display:'flex',justifyContent:'space-between'}}>
                <span style={{fontSize:12,fontWeight:700,color:'var(--text)',fontFamily:"'Space Grotesk',sans-serif"}}>Your ovulation story</span>
                <span style={{fontSize:10,color:'var(--text-3)'}}>Updates live</span>
              </div>
              <div style={{padding:'16px 18px',display:'flex',flexDirection:'column',gap:10}}>
                {stories.map((s,i)=>(
                  <div key={i} style={{borderLeft:`3px solid ${storyColors[i]}`,paddingLeft:12,paddingTop:6,paddingBottom:6,borderRadius:'0 8px 8px 0',background:storySofts[i]}}>
                    <div style={{fontSize:9,fontWeight:700,color:storyColors[i],textTransform:'uppercase',letterSpacing:'.07em',marginBottom:4}}>{s.label}</div>
                    <div style={{fontSize:13,fontWeight:600,color:'var(--text)',lineHeight:1.55,fontFamily:"'Space Grotesk',sans-serif"}}>{s.headline}</div>
                    <div style={{fontSize:11.5,color:'var(--text-2)',lineHeight:1.6,marginTop:4,fontFamily:"'DM Sans',sans-serif"}}>{s.detail}</div>
                  </div>
                ))}
              </div>
            </div>

            <BreakdownTable title="Ovulation Summary" rows={[
              {label:'Ovulation date', value:fmtDate(ovulation), bold:true, highlight:true, color:catColor},
              {label:'Fertile window', value:`${fmtShort(fertWindowStart)} – ${fmtShort(fertWindowEnd)}`},
              {label:'Days to ovulation', value:daysToOvulation>0?`${daysToOvulation} days`:'Passed', color:inWindow?'#10b981':catColor},
              {label:'In window now?', value:inWindow?'Yes ✓':'No', color:inWindow?'#10b981':'var(--text-3)'},
              {label:'Next period', value:fmtDate(nextPeriod)},
              {label:'Ovulation day', value:`Day ${ovulationDay} of ${cycleLen}`},
            ]}/>
            <AIHintCard hint={hint}/>
          </>
        }
      />

      <FertilityInsightSection
        ovulation={ovulation}
        fertWindowStart={fertWindowStart}
        fertWindowEnd={fertWindowEnd}
        inWindow={inWindow}
        daysToOvulation={daysToOvulation}
        ovulationDay={ovulationDay}
        cycleLen={cycleLen}
        catColor={catColor}
      />

      <BestDaysSection
        ovulation={ovulation}
        catColor={catColor}
      />

      <CycleTimelineSection
        lmp={lmp}
        ovulation={ovulation}
        nextPeriod={nextPeriod}
        fertWindowStart={fertWindowStart}
        fertWindowEnd={fertWindowEnd}
        catColor={catColor}
      />

      <AccuracySection
        catColor={catColor}
      />

      <DoctorSection />

      <Sec title="Frequently asked questions">
        {FAQ.map((f,i)=>(
          <Acc key={i} q={f.q} a={f.a} open={openFaq===i} onToggle={()=>setOpenFaq(openFaq===i?null:i)} catColor={catColor}/>
        ))}
      </Sec>
    </div>
  )
}