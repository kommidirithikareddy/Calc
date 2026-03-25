import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'

const clamp = (v,a,b) => Math.min(b, Math.max(a, v))
const addDays = (d,n) => { const r = new Date(d); r.setDate(r.getDate() + n); return r }
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
          {editing
            ? <input type="number" defaultValue={value} onBlur={e=>commit(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')commit(e.target.value);if(e.key==='Escape')setEditing(false)}} style={{width:'55%',border:'none',background:'transparent',textAlign:'center',fontSize:15,fontWeight:700,color:'var(--text)',outline:'none'}} autoFocus/>
            : <span onClick={()=>setEditing(true)} style={{fontSize:15,fontWeight:700,color:'var(--text)',cursor:'text',minWidth:36,textAlign:'center'}}>{value}</span>
          }
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

const FAQ = [
  {
    q:'How is the conception date estimated?',
    a:'This calculator estimates conception from ovulation timing. In a typical 28-day cycle, ovulation is often around day 14, and conception usually happens near that day if sperm is present. The estimate becomes less precise if your cycles vary from month to month.'
  },
  {
    q:'Is conception the same as the first day of pregnancy?',
    a:'No. Pregnancy is usually counted from the first day of the last menstrual period, not the actual conception date. That means conception generally happens about 2 weeks after the pregnancy count begins.'
  },
  {
    q:'Why is there a conception window instead of one exact day?',
    a:'Sperm can survive in the reproductive tract for up to 5 days, while the egg survives about 12–24 hours after ovulation. Because of that, conception is better understood as a window rather than one guaranteed day.'
  },
  {
    q:'Can this calculator be wrong?',
    a:'Yes. It is an estimate based on average cycle timing. Stress, illness, travel, hormonal variation, and irregular cycles can shift ovulation and make the actual conception date earlier or later than predicted.'
  },
]

function ConceptionInsightSection({ ovulation, windowStart, windowEnd, dueDate, cycleLen, catColor }) {
  return (
    <Sec title="Your conception insight" sub="Most likely timing based on ovulation">
      <div style={{display:'grid',gap:14}}>
        <div style={{padding:'14px 15px',borderRadius:12,background:catColor+'10',border:`1px solid ${catColor}35`}}>
          <div style={{fontSize:13,fontWeight:700,color:catColor,marginBottom:6,fontFamily:"'Space Grotesk',sans-serif"}}>
            Most likely conception date
          </div>
          <p style={{margin:0,fontSize:12.5,color:'var(--text-2)',lineHeight:1.75,fontFamily:"'DM Sans',sans-serif"}}>
            Based on a {cycleLen}-day cycle, the most likely conception date is around <strong style={{color:catColor}}>{fmtDate(ovulation)}</strong>. Because sperm can survive for several days, the realistic conception window usually begins earlier than ovulation day itself.
          </p>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'repeat(3, minmax(0, 1fr))',gap:10}}>
          {[
            { label:'Most likely date', value:fmtShort(ovulation) },
            { label:'Window opens', value:fmtShort(windowStart) },
            { label:'Due date', value:fmtShort(dueDate) },
          ].map((item, i) => (
            <div key={i} style={{padding:'12px 10px',borderRadius:10,background:'var(--bg-raised)',border:'0.5px solid var(--border)'}}>
              <div style={{fontSize:10.5,color:'var(--text-3)',marginBottom:4}}>{item.label}</div>
              <div style={{fontSize:15,fontWeight:700,color:'var(--text)',fontFamily:"'Space Grotesk',sans-serif"}}>{item.value}</div>
            </div>
          ))}
        </div>

        <div style={{padding:'12px 14px',borderRadius:10,background:'var(--bg-raised)',border:'0.5px solid var(--border)'}}>
          <div style={{fontSize:11,fontWeight:700,color:'var(--text)',marginBottom:6,fontFamily:"'DM Sans',sans-serif"}}>
            Important note
          </div>
          <p style={{margin:0,fontSize:12,color:'var(--text-2)',lineHeight:1.7,fontFamily:"'DM Sans',sans-serif"}}>
            This is a calendar-based estimate. It is most reliable when cycles are regular and less reliable when ovulation varies from month to month.
          </p>
        </div>
      </div>
    </Sec>
  )
}

function MostLikelyDaysSection({ ovulation, windowStart, windowEnd, catColor }) {
  const days = [
    { label:'Earliest likely day', date:windowStart, note:'Lower probability, but possible' },
    { label:'Most likely day', date:ovulation, note:'Best estimate based on ovulation' },
    { label:'Latest likely day', date:windowEnd, note:'Window usually closes here' },
  ]

  return (
    <Sec title="Most likely conception days" sub="Estimated fertile timing">
      <div style={{display:'grid',gap:8}}>
        {days.map((d, i) => (
          <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'11px 12px',borderRadius:9,background:i === 1 ? catColor+'10' : 'var(--bg-raised)',border:`0.5px solid ${i === 1 ? catColor+'35' : 'var(--border)'}`}}>
            <div>
              <div style={{fontSize:12,fontWeight:700,color:i === 1 ? catColor : 'var(--text)'}}>{d.label}</div>
              <div style={{fontSize:10.5,color:'var(--text-3)',marginTop:2}}>{d.note}</div>
            </div>
            <div style={{fontSize:11.5,fontWeight:700,color:i === 1 ? catColor : 'var(--text)'}}>
              {fmtDate(d.date)}
            </div>
          </div>
        ))}
      </div>
    </Sec>
  )
}

function HowItWorksSection({ lmp, ovulation, dueDate, catColor }) {
  const weeksToDue = Math.round(daysBetween(lmp, dueDate) / 7)

  return (
    <Sec title="How this estimate works" sub="LMP, ovulation, and due date">
      <div style={{display:'grid',gap:10}}>
        {[
          {
            title:'Step 1: Last menstrual period',
            text:`Pregnancy dating usually starts from the first day of the last menstrual period: ${fmtDate(lmp)}.`,
          },
          {
            title:'Step 2: Estimated ovulation',
            text:`Ovulation is estimated from your cycle length, placing likely conception around ${fmtDate(ovulation)}.`,
          },
          {
            title:'Step 3: Due date',
            text:`The due date is then projected forward to ${fmtDate(dueDate)}, which is about ${weeksToDue} weeks from LMP.`,
          },
        ].map((item, i) => (
          <div key={i} style={{padding:'12px 13px',borderRadius:10,background:i === 1 ? catColor+'10' : 'var(--bg-raised)',border:`0.5px solid ${i === 1 ? catColor+'35' : 'var(--border)'}`}}>
            <div style={{fontSize:11,fontWeight:700,color:i === 1 ? catColor : 'var(--text)',marginBottom:5,fontFamily:"'DM Sans',sans-serif"}}>
              {item.title}
            </div>
            <p style={{margin:0,fontSize:12.5,color:'var(--text-2)',lineHeight:1.65,fontFamily:"'DM Sans',sans-serif"}}>
              {item.text}
            </p>
          </div>
        ))}
      </div>
    </Sec>
  )
}

function ImportantThingsSection({ cycleLen, catColor }) {
  const items = [
    `This estimate assumes a roughly regular ${cycleLen}-day cycle.`,
    'Irregular cycles can move ovulation earlier or later than expected.',
    'Implantation happens after conception, so pregnancy test timing can vary.',
    'Ultrasound dating is usually more reliable than calendar estimates once pregnancy is confirmed.',
  ]

  return (
    <Sec title="Important things to know" sub="Helpful context and care points">
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
    'Talk to your doctor if your cycle length varies a lot or ovulation is hard to predict.',
    'Talk to your doctor if you need a more accurate conception estimate after pregnancy is confirmed.',
    'If dates are important for medical planning, your doctor may use ultrasound rather than calendar timing.',
  ]

  return (
    <Sec title="When to contact your doctor" sub="General guidance">
      <div style={{display:'grid',gap:10}}>
        {items.map((item, i) => (
          <div key={i} style={{padding:'12px 13px',borderRadius:10,background:'var(--bg-raised)',border:'0.5px solid var(--border)'}}>
            <p style={{margin:0,fontSize:12.5,color:'var(--text-2)',lineHeight:1.65,fontFamily:"'DM Sans',sans-serif"}}>
              {item}
            </p>
          </div>
        ))}
        <p style={{margin:'4px 0 0',fontSize:11.5,color:'var(--text-3)',lineHeight:1.7,fontFamily:"'DM Sans',sans-serif"}}>
          This calculator gives an estimate only and does not replace medical advice.
        </p>
      </div>
    </Sec>
  )
}

export default function ConceptionDateCalculator({meta,category}) {
  const catColor = category?.color || '#ec4899'
  const [lmpStr,setLmpStr] = useState(()=>{const d=new Date();d.setDate(d.getDate()-56);return d.toISOString().split('T')[0]})
  const [cycleLen,setCycleLen] = useState(28)
  const [openFaq,setOpenFaq] = useState(null)

  const lmp = new Date(lmpStr)
  const cycleAdj = cycleLen - 28
  const ovulation = addDays(lmp,14 + cycleAdj)
  const windowStart = addDays(ovulation,-5)
  const windowEnd = addDays(ovulation,1)
  const dueDate = addDays(lmp,280 + cycleAdj)

  const storyColors = [catColor,'#0ea5e9','#f59e0b']
  const storySofts = [catColor+'18','#e0f2fe','#fef3c7']
  const stories = [
    {
      label:'Most likely conception',
      headline:`Around ${fmtDate(ovulation)}`,
      detail:`Based on ovulation at day ${14 + cycleAdj} of your ${cycleLen}-day cycle. Sperm can survive 3–5 days inside the reproductive tract, so conception can occur up to 5 days before ovulation.`
    },
    {
      label:'Conception window',
      headline:`${fmtDate(windowStart)} to ${fmtDate(windowEnd)}`,
      detail:`The 6-day fertile window includes the 5 days before ovulation plus ovulation day. The 2–3 days immediately before ovulation usually carry the highest probability.`
    },
    {
      label:'LMP vs conception',
      headline:`LMP to due date is ${Math.round(daysBetween(lmp,dueDate)/7)} weeks`,
      detail:`Pregnancy is counted from LMP, not conception. At "4 weeks pregnant," the embryo is only about 2 weeks post-conception. Due date: ${fmtDate(dueDate)}.`
    },
  ]

  const hint = `Most likely conception: ${fmtDate(ovulation)}. Fertile window: ${fmtDate(windowStart)} – ${fmtDate(windowEnd)}. Due date: ${fmtDate(dueDate)}.`

  return(
    <div style={{display:'flex',flexDirection:'column',gap:20}}>
      <CalcShell
        left={
          <>
            <div style={{marginBottom:16}}>
              <label style={{fontSize:12.5,fontWeight:600,color:'var(--text)',fontFamily:"'DM Sans',sans-serif",display:'block',marginBottom:6}}>
                First day of last period (LMP)
              </label>
              <input
                type="date"
                value={lmpStr}
                onChange={e=>setLmpStr(e.target.value)}
                style={{width:'100%',height:40,padding:'0 12px',border:'1.5px solid var(--border-2)',borderRadius:9,background:'var(--bg-card)',color:'var(--text)',fontSize:14,fontFamily:"'DM Sans',sans-serif",boxSizing:'border-box',outline:'none'}}
                onFocus={e=>e.target.style.borderColor=catColor}
                onBlur={e=>e.target.style.borderColor='var(--border-2)'}
              />
            </div>

            <Stepper
              label="Cycle length"
              value={cycleLen}
              onChange={setCycleLen}
              min={21}
              max={45}
              unit="days"
              hint="Average: 28 days"
              catColor={catColor}
            />

            <div style={{borderTop:'0.5px solid var(--border)',paddingTop:14,marginTop:4}}>
              <div style={{fontSize:12,fontWeight:600,color:'var(--text-2)',marginBottom:10,fontFamily:"'DM Sans',sans-serif"}}>
                Key dates at a glance
              </div>
              {[
                {l:'LMP started', d:lmp, highlight:false},
                {l:'Ovulation day', d:ovulation, highlight:false},
                {l:'Conception window start', d:windowStart, highlight:false},
                {l:'Most likely conception', d:ovulation, highlight:true},
                {l:'Due date', d:dueDate, highlight:false},
              ].map((r,i)=>(
                <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'7px 10px',borderRadius:7,background:r.highlight?catColor+'10':'var(--bg-raised)',border:`0.5px solid ${r.highlight?catColor:'var(--border)'}`,marginBottom:4}}>
                  <span style={{fontSize:11,color:r.highlight?catColor:'var(--text-2)'}}>{r.l}</span>
                  <span style={{fontSize:11,fontWeight:600,color:r.highlight?catColor:'var(--text)'}}>{fmtShort(r.d)}</span>
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
                  Conception date story
                </span>
                <span style={{fontSize:10,color:'var(--text-3)'}}>Updates live</span>
              </div>
              <div style={{padding:'16px 18px',display:'flex',flexDirection:'column',gap:10}}>
                {stories.map((s,i)=>(
                  <div key={i} style={{borderLeft:`3px solid ${storyColors[i]}`,paddingLeft:12,paddingTop:6,paddingBottom:6,borderRadius:'0 8px 8px 0',background:storySofts[i]}}>
                    <div style={{fontSize:9,fontWeight:700,color:storyColors[i],textTransform:'uppercase',letterSpacing:'.07em',marginBottom:4}}>
                      {s.label}
                    </div>
                    <div style={{fontSize:13,fontWeight:600,color:'var(--text)',lineHeight:1.55,fontFamily:"'Space Grotesk',sans-serif"}}>
                      {s.headline}
                    </div>
                    <div style={{fontSize:11.5,color:'var(--text-2)',lineHeight:1.6,marginTop:4,fontFamily:"'DM Sans',sans-serif"}}>
                      {s.detail}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <BreakdownTable title="Conception Dates" rows={[
              {label:'Most likely date', value:fmtDate(ovulation), bold:true, highlight:true, color:catColor},
              {label:'Window (earliest)', value:fmtDate(windowStart)},
              {label:'Window (latest)', value:fmtDate(windowEnd)},
              {label:'Ovulation day', value:fmtDate(ovulation), color:catColor},
              {label:'Due date', value:fmtDate(dueDate)},
              {label:'Cycle length', value:`${cycleLen} days`},
            ]}/>

            <AIHintCard hint={hint}/>
          </>
        }
      />

      <ConceptionInsightSection
        ovulation={ovulation}
        windowStart={windowStart}
        windowEnd={windowEnd}
        dueDate={dueDate}
        cycleLen={cycleLen}
        catColor={catColor}
      />

      <MostLikelyDaysSection
        ovulation={ovulation}
        windowStart={windowStart}
        windowEnd={windowEnd}
        catColor={catColor}
      />

      <HowItWorksSection
        lmp={lmp}
        ovulation={ovulation}
        dueDate={dueDate}
        catColor={catColor}
      />

      <ImportantThingsSection
        cycleLen={cycleLen}
        catColor={catColor}
      />

      <DoctorSection />

      <Sec title="Frequently asked questions" sub="Conception timing explained">
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