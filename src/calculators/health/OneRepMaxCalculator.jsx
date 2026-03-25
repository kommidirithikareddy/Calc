import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'

const clamp=(v,a,b)=>Math.min(b,Math.max(a,v))
const fmtKg=n=>`${(Math.round(n*10)/10).toFixed(1)} kg`
const fmtLbs=n=>`${(Math.round(n*2.20462*10)/10).toFixed(1)} lbs`

const calc1RM=(w,r)=>({
  epley:   r===1?w:w*(1+r/30),
  brzycki: r===1?w:w*(36/(37-r)),
  lander:  w/(1.013-(0.0267123*r)),
  lombardi:w*Math.pow(r,0.1),
  oconner: w*(1+r/40),
})

const LIFTS=['Squat','Bench Press','Deadlift','Overhead Press','Barbell Row','Hip Thrust']

const STRENGTH_STANDARDS={
  male:  [{label:'Beginner',mult:0.5},{label:'Novice',mult:0.75},{label:'Intermediate',mult:1.0},{label:'Advanced',mult:1.5},{label:'Elite',mult:2.0}],
  female:[{label:'Beginner',mult:0.25},{label:'Novice',mult:0.5},{label:'Intermediate',mult:0.75},{label:'Advanced',mult:1.1},{label:'Elite',mult:1.4}],
}

const FAQ_1RM=[
  {q:'Which 1RM formula is most accurate?',a:'Epley and Brzycki are both widely used and usually close for moderate rep ranges. Accuracy falls as reps get higher.'},
  {q:'How do I use my 1RM for programming?',a:'Use training percentages: lighter percentages for volume and technique, heavier percentages for strength and peaking.'},
  {q:'How often should my 1RM change?',a:'Beginners can improve quickly, while advanced lifters improve more slowly. Estimated 1RM usually moves faster than true tested maxes.'},
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
        <span style={{fontSize:18,color:catColor,flexShrink:0,transition:'transform .2s',display:'inline-block',transform:open?'rotate(45deg)':'none'}}>+</span>
      </button>
      {open && <p style={{fontSize:12.5,color:'var(--text-2)',lineHeight:1.75,margin:'0 0 13px',fontFamily:"'DM Sans',sans-serif"}}>{a}</p>}
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
  const btn={width:38,height:'100%',border:'none',background:'var(--bg-raised)',color:'var(--text)',fontSize:20,fontWeight:300,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontFamily:'inherit'}

  return (
    <div style={{marginBottom:16}}>
      <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
        <label style={{fontSize:12.5,fontWeight:600,color:'var(--text)',fontFamily:"'DM Sans',sans-serif"}}>{label}</label>
        {hint && <span style={{fontSize:10,color:'var(--text-3)'}}>{hint}</span>}
      </div>
      <div style={{display:'flex',alignItems:'stretch',height:40,border:`1.5px solid ${editing?catColor:'var(--border-2)'}`,borderRadius:9,overflow:'hidden',background:'var(--bg-card)',transition:'border-color .15s'}}>
        <button onMouseDown={e=>{e.preventDefault();onChange(clamp(value-step,min,max))}} style={{...btn,borderRight:'1px solid var(--border)'}}>−</button>
        <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',gap:5}}>
          {editing
            ? <input type="number" defaultValue={value} onBlur={e=>commit(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')commit(e.target.value);if(e.key==='Escape')setEditing(false)}} style={{width:'55%',border:'none',background:'transparent',textAlign:'center',fontSize:15,fontWeight:700,color:'var(--text)',outline:'none',fontFamily:"'DM Sans',sans-serif"}} autoFocus/>
            : <span onClick={()=>setEditing(true)} style={{fontSize:15,fontWeight:700,color:'var(--text)',cursor:'text',minWidth:36,textAlign:'center',fontFamily:"'DM Sans',sans-serif"}}>{value}</span>}
          <span style={{fontSize:11,color:'var(--text-3)',fontWeight:500}}>{unit}</span>
        </div>
        <button onMouseDown={e=>{e.preventDefault();onChange(clamp(value+step,min,max))}} style={{...btn,borderLeft:'1px solid var(--border)'}}>+</button>
      </div>
    </div>
  )
}

function IconCardGroup({label,options,value,onChange,catColor}) {
  return (
    <div style={{marginBottom:18}}>
      <div style={{fontSize:12,fontWeight:600,color:'var(--text-2)',marginBottom:8,fontFamily:"'DM Sans',sans-serif"}}>{label}</div>
      <div style={{display:'flex',gap:8}}>
        {options.map(opt=>{
          const active=value===opt.value
          return(
            <button key={opt.value} onClick={()=>onChange(opt.value)} style={{flex:1,padding:'12px 8px',borderRadius:10,cursor:'pointer',border:`1.5px solid ${active?catColor:'var(--border-2)'}`,background:active?catColor+'12':'var(--bg-raised)',display:'flex',flexDirection:'column',alignItems:'center',gap:6,transition:'all .18s',fontFamily:"'DM Sans',sans-serif"}}>
              <div style={{width:28,height:28,display:'flex',alignItems:'center',justifyContent:'center'}}>
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke={active?catColor:'var(--text-3)'} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{opt.icon}</svg>
              </div>
              <span style={{fontSize:12,fontWeight:active?700:500,color:active?catColor:'var(--text-2)',lineHeight:1.2,textAlign:'center'}}>{opt.label}</span>
              {opt.sub && <span style={{fontSize:10,color:active?catColor+'cc':'var(--text-3)',lineHeight:1.2,textAlign:'center'}}>{opt.sub}</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}

const UNIT_OPTIONS=[
  {value:'metric',label:'Metric',sub:'kg',icon:<><rect x="3" y="2" width="16" height="18" rx="2.5"/><line x1="7" y1="7.5" x2="15" y2="7.5"/><line x1="7" y1="11" x2="15" y2="11"/><line x1="7" y1="14.5" x2="12" y2="14.5"/></>},
  {value:'imperial',label:'Imperial',sub:'lbs',icon:<><rect x="3" y="2" width="16" height="18" rx="2.5"/><line x1="7" y1="7.5" x2="15" y2="7.5"/><line x1="7" y1="11" x2="15" y2="11"/><line x1="7" y1="14.5" x2="12" y2="14.5"/></>}
]
const SEX_OPTIONS=[
  {value:'male',label:'Male',icon:<><circle cx="11" cy="9" r="5"/><line x1="11" y1="14" x2="11" y2="20"/><line x1="8" y1="17" x2="14" y2="17"/></>},
  {value:'female',label:'Female',icon:<><circle cx="11" cy="8.5" r="5"/><line x1="11" y1="13.5" x2="11" y2="20"/><line x1="8" y1="17" x2="14" y2="17"/></>}
]

function StrengthInsightSection({ avg, level, bodyRatio, selectedLift, wFmt, catColor }) {
  return (
    <Sec title="Your strength insight" sub="What this 1RM suggests">
      <div style={{ display:'grid', gap:12 }}>
        <div style={{ padding:'12px 14px', borderRadius:10, background:catColor+'10', border:`1px solid ${catColor}35` }}>
          <div style={{ fontSize:13, fontWeight:700, color:catColor, marginBottom:5 }}>{selectedLift} estimated max</div>
          <div style={{ fontSize:12.5, color:'var(--text-2)', lineHeight:1.7 }}>
            Your estimated 1RM is <strong>{wFmt(avg)}</strong>, which places you in the <strong>{level.label}</strong> range at about <strong>{bodyRatio.toFixed(2)}× bodyweight</strong>.
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
          {[
            { label:'Estimated max', value:wFmt(avg) },
            { label:'Level', value:level.label },
            { label:'BW ratio', value:`${bodyRatio.toFixed(2)}×` },
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

function RepChartSection({ avg, wFmt, catColor }) {
  const rows = [1,2,3,5,8,10].map(r => ({
    reps: r,
    pct: r === 1 ? 100 : r === 2 ? 95 : r === 3 ? 92 : r === 5 ? 87 : r === 8 ? 80 : 75,
  }))

  return (
    <Sec title="Estimated rep max chart" sub="Quick working-weight guide">
      <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
        {rows.map((r, i) => (
          <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 12px', borderRadius:8, background:i === 0 ? catColor+'10' : 'var(--bg-raised)', border:`0.5px solid ${i === 0 ? catColor+'35' : 'var(--border)'}` }}>
            <div>
              <div style={{ fontSize:12, fontWeight:700, color:i === 0 ? catColor : 'var(--text)' }}>{r.reps} rep{r.reps > 1 ? 's' : ''}</div>
              <div style={{ fontSize:10, color:'var(--text-3)' }}>{r.pct}% of estimated 1RM</div>
            </div>
            <div style={{ fontSize:13, fontWeight:700, color:i === 0 ? catColor : 'var(--text)' }}>{wFmt(avg * r.pct / 100)}</div>
          </div>
        ))}
      </div>
    </Sec>
  )
}

function ProgrammingSection({ avg, wFmt, catColor }) {
  return (
    <Sec title="Programming suggestions" sub="Use your 1RM in training">
      <div style={{ display:'grid', gap:8 }}>
        {[
          { label:'60–70%', note:'Technique, volume, endurance', val:wFmt(avg*0.65) },
          { label:'70–80%', note:'Hypertrophy and main working sets', val:wFmt(avg*0.75) },
          { label:'80–90%', note:'Strength-focused work', val:wFmt(avg*0.85) },
          { label:'90%+', note:'Heavy singles and peaking', val:wFmt(avg*0.92) },
        ].map((x, i) => (
          <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 12px', borderRadius:8, background:'var(--bg-raised)', border:'0.5px solid var(--border)' }}>
            <div>
              <div style={{ fontSize:12, fontWeight:700, color:'var(--text)' }}>{x.label}</div>
              <div style={{ fontSize:10.5, color:'var(--text-3)' }}>{x.note}</div>
            </div>
            <div style={{ fontSize:13, fontWeight:700, color:catColor }}>{x.val}</div>
          </div>
        ))}
      </div>
    </Sec>
  )
}

function RecoverySafetySection({ catColor }) {
  return (
    <Sec title="Recovery and safety notes" sub="Lift smart">
      <div style={{ display:'grid', gap:8 }}>
        {[
          'Estimated 1RM is safer to use regularly than frequent true-max testing.',
          'For heavy bench, squat, or overhead work, proper setup and spotters matter.',
          'Good progress usually comes from consistent programming, recovery, and technique — not maxing out too often.',
        ].map((x, i) => (
          <div key={i} style={{ padding:'11px 13px', borderRadius:8, background:i === 0 ? catColor+'10' : 'var(--bg-raised)', border:`0.5px solid ${i === 0 ? catColor+'35' : 'var(--border)'}`, fontSize:11.5, color:'var(--text-2)', lineHeight:1.6 }}>
            {x}
          </div>
        ))}
      </div>
    </Sec>
  )
}

function StandardsMeaningSection({ level, catColor }) {
  return (
    <Sec title="What your strength level means" sub="Beginner to elite">
      <div style={{ display:'grid', gap:8 }}>
        {[
          { title:'Beginner / Novice', text:'Still building base strength and technique. Progress usually comes quickly.' },
          { title:'Intermediate', text:'Solid foundation. Programming quality matters more now.' },
          { title:'Advanced / Elite', text:'Progress tends to come slower and requires more structure and recovery.' },
        ].map((x, i) => (
          <div key={i} style={{ padding:'11px 13px', borderRadius:8, background:x.title.includes(level.label) ? catColor+'10' : 'var(--bg-raised)', border:`0.5px solid ${x.title.includes(level.label) ? catColor+'35' : 'var(--border)'}` }}>
            <div style={{ fontSize:12, fontWeight:700, color:x.title.includes(level.label) ? catColor : 'var(--text)', marginBottom:4 }}>{x.title}</div>
            <div style={{ fontSize:11.5, color:'var(--text-2)', lineHeight:1.6 }}>{x.text}</div>
          </div>
        ))}
      </div>
    </Sec>
  )
}

export default function OneRepMaxCalculator({meta,category}) {
  const catColor=category?.color||'#f97316'
  const[unit,setUnit]=useState('metric')
  const[wKg,setWKg]=useState(75)
  const[wLbs,setWLbs]=useState(165)
  const[bodyKg,setBodyKg]=useState(80)
  const[reps,setReps]=useState(5)
  const[sex,setSex]=useState('male')
  const[selectedLift,setSelectedLift]=useState('Squat')
  const[openFaq,setOpenFaq]=useState(null)

  function handleUnit(u){
    if(u===unit)return
    if(u==='imperial') setWLbs(Math.round(wKg*2.20462))
    else setWKg(clamp(Math.round(wLbs/2.20462),1,500))
    setUnit(u)
  }

  const isM=unit==='metric'
  const liftW=isM?wKg:wLbs/2.20462
  const results=calc1RM(liftW,reps)
  const avg=Math.round((results.epley+results.brzycki+results.lander+results.lombardi+results.oconner)/5)
  const wFmt=kg=>isM?fmtKg(kg):fmtLbs(kg)

  const standards=STRENGTH_STANDARDS[sex]
  const bodyRatio=avg/bodyKg
  const level=standards.reduce((best,s)=>bodyRatio>=s.mult?s:best,standards[0])
  const maxVal=Math.max(avg,...standards.map(s=>s.mult*bodyKg))*1.1

  const GLOSSARY_1RM=[
    {term:'One Rep Max (1RM)',def:'The maximum weight you can lift for a single repetition with proper form.'},
    {term:'Epley Formula',def:'A common 1RM estimate formula that works well in moderate rep ranges.'},
    {term:'Brzycki Formula',def:'Another widely used 1RM estimate formula, often very close to Epley.'},
    {term:'Training %',def:'Training intensity expressed as a percentage of your estimated 1RM.'},
    {term:'Strength Standard',def:'A bodyweight-relative way to classify lifting strength from beginner to elite.'},
  ]

  const hint=`Estimated 1RM: ${wFmt(avg)}. Level: ${level.label}. Bodyweight ratio: ${bodyRatio.toFixed(2)}×. Training zones: 70%=${wFmt(avg*0.7)}, 80%=${wFmt(avg*0.8)}, 90%=${wFmt(avg*0.9)}.`

  return (
    <div style={{display:'flex',flexDirection:'column',gap:20}}>
      <CalcShell
        left={<>
          <IconCardGroup label="Unit system" options={UNIT_OPTIONS} value={unit} onChange={handleUnit} catColor={catColor}/>
          <div style={{borderTop:'0.5px solid var(--border)',paddingTop:16}}>
            <div style={{fontSize:10,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:14}}>Your lift</div>

            <div style={{marginBottom:12}}>
              <div style={{fontSize:12,fontWeight:600,color:'var(--text-2)',marginBottom:8,fontFamily:"'DM Sans',sans-serif"}}>Exercise</div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:5}}>
                {LIFTS.map(l=>(
                  <button key={l} onClick={()=>setSelectedLift(l)} style={{padding:'8px',borderRadius:7,fontSize:11,fontWeight:selectedLift===l?700:500,color:selectedLift===l?catColor:'var(--text-2)',border:`1.5px solid ${selectedLift===l?catColor:'var(--border-2)'}`,background:selectedLift===l?catColor+'12':'var(--bg-raised)',cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}}>
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {isM
              ? <Stepper label="Weight lifted" value={wKg} onChange={setWKg} min={1} max={500} unit="kg" catColor={catColor}/>
              : <Stepper label="Weight lifted" value={wLbs} onChange={setWLbs} min={1} max={1100} unit="lbs" catColor={catColor}/>
            }

            <Stepper label="Reps performed" value={reps} onChange={setReps} min={1} max={30} unit="reps" hint="Best: 2–10 for accuracy" catColor={catColor}/>
            <Stepper label="Body weight" value={bodyKg} onChange={setBodyKg} min={30} max={250} unit="kg" hint="For strength standard" catColor={catColor}/>
          </div>

          <div style={{borderTop:'0.5px solid var(--border)',paddingTop:16,marginTop:4}}>
            <IconCardGroup label="Biological sex" options={SEX_OPTIONS} value={sex} onChange={setSex} catColor={catColor}/>
          </div>
        </>}
        right={<>
          <div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,overflow:'hidden',marginBottom:14}}>
            <div style={{padding:'11px 16px',borderBottom:'0.5px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <span style={{fontSize:12,fontWeight:700,color:'var(--text)',fontFamily:"'Space Grotesk',sans-serif"}}>One Rep Max — {selectedLift}</span>
              <span style={{fontSize:10,color:'var(--text-3)'}}>You vs standards</span>
            </div>
            <div style={{padding:'16px 18px'}}>
              <div style={{display:'flex',alignItems:'flex-end',gap:12,marginBottom:16}}>
                <div>
                  <div style={{fontSize:48,fontWeight:700,lineHeight:1,color:catColor,fontFamily:"'Space Grotesk',sans-serif"}}>{wFmt(avg)}</div>
                  <div style={{fontSize:11,color:'var(--text-3)',marginTop:3}}>estimated 1RM</div>
                </div>
                <div style={{paddingBottom:6}}>
                  <div style={{display:'inline-flex',alignItems:'center',gap:6,padding:'5px 12px 5px 8px',borderRadius:20,background:catColor+'18',border:`1px solid ${catColor}35`}}>
                    <div style={{width:8,height:8,borderRadius:'50%',background:catColor}}/>
                    <span style={{fontSize:12,fontWeight:700,color:catColor}}>{level.label}</span>
                  </div>
                  <div style={{fontSize:11,color:'var(--text-3)',marginTop:5}}>{bodyRatio.toFixed(2)}× bodyweight</div>
                </div>
              </div>

              <div style={{display:'flex',alignItems:'center',gap:10,padding:'8px 12px',borderRadius:8,background:catColor+'12',border:`1.5px solid ${catColor}`,marginBottom:6}}>
                <div style={{width:100,fontSize:11,fontWeight:700,color:catColor,flexShrink:0}}>You ← {level.label}</div>
                <div style={{flex:1,height:7,background:'var(--border)',borderRadius:3}}>
                  <div style={{height:'100%',width:`${(avg/maxVal)*100}%`,background:catColor,borderRadius:3,transition:'width .5s'}}/>
                </div>
                <div style={{fontSize:12,fontWeight:700,color:catColor,minWidth:55,textAlign:'right'}}>{wFmt(avg)}</div>
              </div>

              {standards.map((s,i)=>{
                const val=s.mult*bodyKg
                return(
                  <div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'7px 12px',borderRadius:8,background:'var(--bg-raised)',border:'0.5px solid var(--border)',marginBottom:4}}>
                    <div style={{width:100,flexShrink:0}}>
                      <div style={{fontSize:11,fontWeight:500,color:'var(--text)'}}>{s.label}</div>
                      <div style={{fontSize:9,color:'var(--text-3)'}}>×{s.mult} BW</div>
                    </div>
                    <div style={{flex:1,height:5,background:'var(--border)',borderRadius:3}}>
                      <div style={{height:'100%',width:`${(val/maxVal)*100}%`,background:catColor,opacity:0.4,borderRadius:3}}/>
                    </div>
                    <div style={{fontSize:11,fontWeight:600,color:'var(--text-2)',minWidth:55,textAlign:'right'}}>{wFmt(val)}</div>
                  </div>
                )
              })}
            </div>
          </div>

          <BreakdownTable title="1RM Results" rows={[
            {label:'Average (5 formulas)',value:wFmt(avg),bold:true,highlight:true,color:catColor},
            {label:'Epley',value:wFmt(results.epley)},
            {label:'Brzycki',value:wFmt(results.brzycki)},
            {label:'Lander',value:wFmt(results.lander)},
            {label:'Strength level',value:level.label,color:catColor},
            {label:'70% (hypertrophy)',value:wFmt(avg*0.7)},
            {label:'80% (strength)',value:wFmt(avg*0.8)},
            {label:'90% (near-max)',value:wFmt(avg*0.9)},
          ]}/>

          <AIHintCard hint={hint}/>
        </>}
      />

      <StrengthInsightSection avg={avg} level={level} bodyRatio={bodyRatio} selectedLift={selectedLift} wFmt={wFmt} catColor={catColor} />

      <RepChartSection avg={avg} wFmt={wFmt} catColor={catColor} />

      <Sec title="Training percentages from your 1RM" sub="Prescribe your sessions">
        <p style={{fontSize:12,color:'var(--text-2)',lineHeight:1.7,marginBottom:14,fontFamily:"'DM Sans',sans-serif"}}>
          Use these weights to program sessions from your estimated 1RM of <strong style={{fontWeight:600,color:catColor}}>{wFmt(avg)}</strong>.
        </p>
        <div style={{display:'flex',flexDirection:'column',gap:6}}>
          {[
            {pct:60,reps:'15–20',goal:'Endurance / technique',color:'#22a355'},
            {pct:70,reps:'10–15',goal:'Hypertrophy (volume)',color:'#3b82f6'},
            {pct:75,reps:'8–12',goal:'Hypertrophy (main)',color:'#3b82f6'},
            {pct:80,reps:'5–8',goal:'Strength (moderate)',color:'#f59e0b'},
            {pct:85,reps:'3–5',goal:'Strength (heavy)',color:'#f97316'},
            {pct:90,reps:'2–3',goal:'Near-maximum effort',color:'#ef4444'},
            {pct:95,reps:'1–2',goal:'Competition / test',color:'#dc2626'},
          ].map((row,i)=>(
            <div key={i} style={{display:'flex',alignItems:'center',gap:12,padding:'9px 14px',borderRadius:8,background:'var(--bg-raised)',border:'0.5px solid var(--border)'}}>
              <div style={{width:35,fontSize:11,fontWeight:700,color:row.color,flexShrink:0}}>{row.pct}%</div>
              <div style={{flex:1}}>
                <div style={{fontSize:11,fontWeight:600,color:'var(--text)'}}>{row.goal}</div>
                <div style={{fontSize:10,color:'var(--text-3)'}}>{row.reps} reps</div>
              </div>
              <div style={{fontSize:14,fontWeight:700,color:row.color}}>{wFmt(avg*(row.pct/100))}</div>
            </div>
          ))}
        </div>
      </Sec>

      <ProgrammingSection avg={avg} wFmt={wFmt} catColor={catColor} />
      <StandardsMeaningSection level={level} catColor={catColor} />

      <Sec title="Key terms" sub="Quick reference">
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:8}}>
          {GLOSSARY_1RM.map((g,i)=>(
            <div key={i} style={{padding:'9px 12px',borderRadius:8,background:'var(--bg-raised)',border:'0.5px solid var(--border)'}}>
              <div style={{fontSize:12,fontWeight:700,color:catColor,marginBottom:3}}>{g.term}</div>
              <div style={{fontSize:11,color:'var(--text-2)',lineHeight:1.5}}>{g.def}</div>
            </div>
          ))}
        </div>
      </Sec>

      <RecoverySafetySection catColor={catColor} />

      <Sec title="Frequently asked questions" sub="Everything about one rep max">
        {FAQ_1RM.map((f,i)=>(<Acc key={i} q={f.q} a={f.a} open={openFaq===i} onToggle={()=>setOpenFaq(openFaq===i?null:i)} catColor={catColor}/>))}
      </Sec>
    </div>
  )
}