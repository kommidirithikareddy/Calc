import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'
import HealthJourneyNext from '../../components/health/HealthJourneyNext'

const clamp = (v,a,b) => Math.min(b,Math.max(a,v))
const fmtM2 = n => `${(Math.round(n*100)/100).toFixed(2)} m²`

/* formulas */
function mosteller(hCm, wKg)  { return Math.sqrt((hCm*wKg)/3600) }
function dubois(hCm, wKg)     { return 0.007184 * Math.pow(hCm,0.725) * Math.pow(wKg,0.425) }
function haycock(hCm, wKg)    { return 0.024265 * Math.pow(hCm,0.3964) * Math.pow(wKg,0.5378) }
function gehanGeorge(hCm, wKg){ return 0.0235 * Math.pow(hCm,0.42246) * Math.pow(wKg,0.51456) }

const FORMULAS = [
  { key:'mosteller',    label:'Mosteller',     fn:mosteller,     note:'Most widely used in clinical practice. Simple and accurate.' },
  { key:'dubois',       label:'DuBois & DuBois',fn:dubois,        note:'Original 1916 formula. Slightly lower estimates in obese patients.' },
  { key:'haycock',      label:'Haycock',        fn:haycock,       note:'Validated for paediatric populations. Best for children.' },
  { key:'gehan',        label:'Gehan-George',   fn:gehanGeorge,   note:'1970 formula. Most accurate for obese patients.' },
]

const BSA_COMPARISONS = [
  { object:'A king-size bed sheet',       m2:5.0  },
  { object:'A front door (standard)',     m2:1.89 },
  { object:'A bath towel',               m2:0.9  },
  { object:'A yoga mat',                 m2:1.76 },
  { object:'A desk (standard office)',    m2:0.72 },
]

const BODY_REGIONS = [
  { region:'Head & neck',    pct:9,  note:'Rule of Nines' },
  { region:'Each arm',       pct:9,  note:'×2 = 18% total' },
  { region:'Chest (front)',  pct:9,  note:'Anterior trunk' },
  { region:'Abdomen (front)',pct:9,  note:'Anterior trunk' },
  { region:'Upper back',     pct:9,  note:'Posterior trunk' },
  { region:'Lower back',     pct:9,  note:'Posterior trunk' },
  { region:'Each thigh',     pct:9,  note:'×2 = 18% total' },
  { region:'Each lower leg', pct:4.5,note:'×2 = 9% total' },
  { region:'Genitalia',      pct:1,  note:'' },
]

const GLOSSARY = [
  { term:'Body Surface Area', def:'The total external surface area of the human body in square metres. Used for drug dosing, burn assessment, and physiological calculations.' },
  { term:'Mosteller Formula', def:'BSA = √(height_cm × weight_kg ÷ 3600). The most widely used clinical formula due to its simplicity and accuracy.' },
  { term:'Rule of Nines',     def:'A method to estimate burn surface area by dividing the body into regions each representing 9% (or multiples of 9%) of total BSA.' },
  { term:'Drug Dosing',       def:'Many chemotherapy agents and some antibiotics are dosed per m² of BSA rather than body weight, to account for differences in body size and metabolism.' },
  { term:'Average Adult BSA', def:'Approximately 1.7–1.9 m² for an average adult. Males average ~1.9 m², females ~1.7 m².' },
  { term:'Paediatric BSA',    def:'Children have proportionally more BSA relative to body weight than adults — an important consideration for drug dosing in paediatric medicine.' },
]

const FAQ = [
  { q:'What is body surface area used for in medicine?',
    a:'BSA is primarily used in oncology (cancer treatment) to dose chemotherapy drugs such as cisplatin, carboplatin, and paclitaxel. It is also used for some antifungal agents, cardiac output calculations, burn injury assessment, and nutritional support calculations. BSA-based dosing accounts for individual differences in metabolism, organ function, and drug distribution better than weight-based dosing alone.' },
  { q:'Which BSA formula is most accurate?',
    a:'The Mosteller formula is the most widely used in clinical practice due to its simplicity (easy to calculate mentally) and reasonable accuracy. The DuBois formula is the oldest (1916) and slightly less accurate in obese patients. Haycock is best validated for children. Gehan-George is most accurate in obese patients. The difference between formulas is typically < 5% for average adults.' },
  { q:'What is the average BSA for an adult?',
    a:'The average BSA for adult males is approximately 1.9 m² and for adult females approximately 1.7 m². These figures vary considerably with height and weight — a 50 kg, 155 cm female may have a BSA of 1.5 m², while a 100 kg, 190 cm male may have 2.3 m².' },
  { q:'What is the Rule of Nines?',
    a:'The Rule of Nines is a quick clinical method for estimating the total burned surface area (TBSA) in burn patients. The body is divided into regions each representing 9% (or multiples of 9%) of BSA: head 9%, each arm 9%, chest 9%, abdomen 9%, upper back 9%, lower back 9%, each thigh 9%, each lower leg 4.5%, genitalia 1%. The sum of affected regions gives TBSA%, which guides fluid resuscitation (Parkland formula).' },
]

const EXAMPLES = [
  { title:'Average Female',  desc:'165 cm, 62 kg',  hCm:165, wKg:62 },
  { title:'Average Male',    desc:'178 cm, 80 kg',  hCm:178, wKg:80 },
  { title:'Large Frame',     desc:'190 cm, 100 kg', hCm:190, wKg:100},
]

const JOURNEY_ITEMS = [
  { title:'BMI Calculator',   sub:'Weight status from height and weight',   icon:'⚖️', path:'/health/body-metrics/bmi-calculator'        },
  { title:'Ideal Weight',     sub:'What weight should you aim for?',         icon:'🎯', path:'/health/body-metrics/ideal-weight-calculator' },
  { title:'BMR & Calories',   sub:'Daily energy needs',                      icon:'🔥', path:'/health/body-metrics/bmr-calculator'         },
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
        <span style={{ fontSize:18, color:catColor, flexShrink:0, display:'inline-block', transition:'transform .2s', transform:open?'rotate(45deg)':'none' }}>+</span>
      </button>
      {open && <p style={{ fontSize:12.5, color:'var(--text-2)', lineHeight:1.75, margin:'0 0 13px', fontFamily:"'DM Sans',sans-serif" }}>{a}</p>}
    </div>
  )
}
function GlsTerm({ term, def, catColor }) {
  const [open,setOpen] = useState(false)
  return (
    <div onClick={()=>setOpen(o=>!o)} style={{ padding:'9px 12px', borderRadius:8, cursor:'pointer', transition:'all .15s', border:`1px solid ${open?catColor+'40':'var(--border)'}`, background:open?catColor+'10':'var(--bg-raised)' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:8 }}>
        <span style={{ fontSize:12, fontWeight:700, fontFamily:"'Space Grotesk',sans-serif", color:open?catColor:'var(--text)' }}>{term}</span>
        <span style={{ fontSize:14, color:catColor, flexShrink:0 }}>{open?'−':'+'}</span>
      </div>
      {open && <p style={{ fontSize:11.5, color:'var(--text-2)', lineHeight:1.65, margin:'6px 0 0', fontFamily:"'DM Sans',sans-serif" }}>{def}</p>}
    </div>
  )
}
function Stepper({ label, hint, value, onChange, min, max, step=1, unit, catColor }) {
  const [editing,setEditing] = useState(false)
  const commit = r => { const n=parseFloat(r); onChange(clamp(isNaN(n)?value:n,min,max)); setEditing(false) }
  const btn = { width:38, height:'100%', border:'none', background:'var(--bg-raised)', color:'var(--text)', fontSize:20, fontWeight:300, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontFamily:'inherit', transition:'background .1s' }
  return (
    <div style={{ marginBottom:16 }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
        <label style={{ fontSize:12.5, fontWeight:600, color:'var(--text)', fontFamily:"'DM Sans',sans-serif" }}>{label}</label>
        {hint && <span style={{ fontSize:10, color:'var(--text-3)' }}>{hint}</span>}
      </div>
      <div style={{ display:'flex', alignItems:'stretch', height:40, border:`1.5px solid ${editing?catColor:'var(--border-2)'}`, borderRadius:9, overflow:'hidden', background:'var(--bg-card)', boxShadow:editing?`0 0 0 3px ${catColor}18`:'none', transition:'border-color .15s,box-shadow .15s' }}>
        <button onMouseDown={e=>{e.preventDefault();onChange(clamp(value-step,min,max))}} style={{...btn,borderRight:'1px solid var(--border)'}} onMouseEnter={e=>e.currentTarget.style.background=catColor+'18'} onMouseLeave={e=>e.currentTarget.style.background='var(--bg-raised)'}>−</button>
        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:5 }}>
          {editing
            ? <input type="number" defaultValue={value} onBlur={e=>commit(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')commit(e.target.value);if(e.key==='Escape')setEditing(false)}} style={{ width:'55%', border:'none', background:'transparent', textAlign:'center', fontSize:15, fontWeight:700, color:'var(--text)', outline:'none', fontFamily:"'DM Sans',sans-serif" }} autoFocus/>
            : <span onClick={()=>setEditing(true)} style={{ fontSize:15, fontWeight:700, color:'var(--text)', cursor:'text', minWidth:36, textAlign:'center', fontFamily:"'DM Sans',sans-serif" }}>{value}</span>
          }
          <span style={{ fontSize:11, color:'var(--text-3)', fontWeight:500 }}>{unit}</span>
        </div>
        <button onMouseDown={e=>{e.preventDefault();onChange(clamp(value+step,min,max))}} style={{...btn,borderLeft:'1px solid var(--border)'}} onMouseEnter={e=>e.currentTarget.style.background=catColor+'18'} onMouseLeave={e=>e.currentTarget.style.background='var(--bg-raised)'}>+</button>
      </div>
    </div>
  )
}

const FORMULA_COLORS = ['#22a355','#0ea5e9','#f59e0b','#8b5cf6']

export default function BodySurfaceAreaCalculator({ meta, category }) {
  const catColor = category?.color || '#22a355'
  const [unit,       setUnit]       = useState('metric')
  const [hCm,        setHCm]        = useState(175)
  const [hFt,        setHFt]        = useState(5)
  const [hIn,        setHIn]        = useState(9)
  const [wKg,        setWKg]        = useState(75)
  const [wLbs,       setWLbs]       = useState(165)
  const [activeForm, setActiveForm] = useState('mosteller')
  const [openFaq,    setOpenFaq]    = useState(null)

  function handleUnit(u) {
    if (u===unit) return
    if (u==='imperial') { const ti=Math.round(hCm/2.54); setHFt(Math.floor(ti/12)); setHIn(ti%12); setWLbs(Math.round(wKg*2.20462)) }
    else { setHCm(clamp(Math.round((hFt*12+hIn)*2.54),100,250)); setWKg(clamp(Math.round(wLbs/2.20462),20,300)) }
    setUnit(u)
  }
  function applyExample(ex) {
    setHCm(ex.hCm); setWKg(ex.wKg)
    const ti=Math.round(ex.hCm/2.54); setHFt(Math.floor(ti/12)); setHIn(ti%12); setWLbs(Math.round(ex.wKg*2.20462)); setUnit('metric')
  }

  const isM    = unit==='metric'
  const hM     = isM ? hCm/100 : (hFt*12+hIn)*0.0254
  const wKgVal = isM ? wKg : wLbs/2.20462
  const hCmVal = hM*100

  const results   = FORMULAS.map(f => ({ ...f, bsa:f.fn(hCmVal,wKgVal) }))
  const activeBSA = results.find(r=>r.key===activeForm)?.bsa || results[0].bsa
  const avgBSA    = results.reduce((s,r)=>s+r.bsa,0)/results.length
  const avgAdult  = 1.8
  const vsDiff    = activeBSA - avgAdult
  const maxBar    = Math.max(...results.map(r=>r.bsa))*1.1

  // closest comparison object
  const closest = BSA_COMPARISONS.reduce((b,o)=>Math.abs(o.m2-activeBSA)<Math.abs(b.m2-activeBSA)?o:b)

  const hint = `BSA (Mosteller): ${fmtM2(activeBSA)}. Average adult: 1.8 m². You are ${Math.abs(vsDiff)<0.05?'at the average':vsDiff>0?`${(vsDiff).toFixed(2)} m² above average`:`${(Math.abs(vsDiff)).toFixed(2)} m² below average`}.`

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <CalcShell
        left={<>
          <div style={{ marginBottom:16 }}>
            {/* unit toggle */}
            <div style={{ fontSize:12, fontWeight:600, color:'var(--text-2)', marginBottom:8, fontFamily:"'DM Sans',sans-serif" }}>Unit system</div>
            <div style={{ display:'flex', gap:6, marginBottom:18 }}>
              {[{v:'metric',l:'Metric (cm, kg)'},{v:'imperial',l:'Imperial (ft, lbs)'}].map(o=>(
                <button key={o.v} onClick={()=>handleUnit(o.v)} style={{ flex:1, padding:'9px 0', borderRadius:8, border:`1.5px solid ${unit===o.v?catColor:'var(--border-2)'}`, background:unit===o.v?catColor:'var(--bg-raised)', color:unit===o.v?'#fff':'var(--text-2)', fontWeight:600, fontSize:12, cursor:'pointer', fontFamily:"'DM Sans',sans-serif", transition:'all .18s' }}>{o.l}</button>
              ))}
            </div>
          </div>
          <div style={{ borderTop:'0.5px solid var(--border)', paddingTop:16 }}>
            <div style={{ fontSize:10, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:14 }}>Body measurements</div>
            {isM
              ? <Stepper label="Height" value={hCm} onChange={setHCm} min={100} max={250} unit="cm" catColor={catColor}/>
              : <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                  <Stepper label="Feet" value={hFt} onChange={setHFt} min={3} max={7} unit="ft" catColor={catColor}/>
                  <Stepper label="Inches" value={hIn} onChange={setHIn} min={0} max={11} unit="in" catColor={catColor}/>
                </div>
            }
            {isM
              ? <Stepper label="Weight" value={wKg} onChange={setWKg} min={20} max={300} unit="kg" catColor={catColor}/>
              : <Stepper label="Weight" value={wLbs} onChange={setWLbs} min={44} max={660} unit="lbs" catColor={catColor}/>
            }
          </div>
          {/* formula selector */}
          <div style={{ borderTop:'0.5px solid var(--border)', paddingTop:16, marginTop:4 }}>
            <div style={{ fontSize:12, fontWeight:600, color:'var(--text-2)', marginBottom:10, fontFamily:"'DM Sans',sans-serif" }}>Formula</div>
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {FORMULAS.map((f,i)=>(
                <button key={f.key} onClick={()=>setActiveForm(f.key)} style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', padding:'9px 13px', borderRadius:8, border:`1.5px solid ${activeForm===f.key?catColor:'var(--border-2)'}`, background:activeForm===f.key?catColor+'12':'var(--bg-raised)', cursor:'pointer', transition:'all .15s', textAlign:'left' }}>
                  <div>
                    <div style={{ fontSize:12, fontWeight:600, color:activeForm===f.key?catColor:'var(--text)' }}>{f.label}</div>
                    <div style={{ fontSize:10, color:'var(--text-3)', marginTop:2 }}>{f.note}</div>
                  </div>
                  <span style={{ fontSize:12, fontWeight:700, color:FORMULA_COLORS[i], flexShrink:0, marginLeft:8 }}>{fmtM2(results[i]?.bsa||0)}</span>
                </button>
              ))}
            </div>
          </div>
        </>}
        right={<>
          <div style={{ background:'var(--bg-card)', border:'0.5px solid var(--border)', borderRadius:14, overflow:'hidden', marginBottom:14 }}>
            <div style={{ padding:'11px 16px', borderBottom:'0.5px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontSize:12, fontWeight:700, color:'var(--text)', fontFamily:"'Space Grotesk',sans-serif" }}>Body Surface Area</span>
              <span style={{ fontSize:10, color:'var(--text-3)' }}>Updates live</span>
            </div>
            <div style={{ padding:'16px 18px' }}>
              {/* big BSA */}
              <div style={{ display:'flex', alignItems:'flex-end', gap:12, marginBottom:16 }}>
                <div>
                  <div style={{ fontSize:52, fontWeight:700, lineHeight:1, color:catColor, fontFamily:"'Space Grotesk',sans-serif" }}>
                    {fmtM2(activeBSA)}
                  </div>
                  <div style={{ fontSize:11, color:'var(--text-3)', marginTop:3 }}>Body surface area</div>
                </div>
                <div style={{ paddingBottom:6 }}>
                  <div style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'5px 12px 5px 8px', borderRadius:20, background: Math.abs(vsDiff)<0.1?'#d6f2e0':vsDiff>0?'#fef3c7':'#dbeafe', border:`1px solid ${Math.abs(vsDiff)<0.1?catColor:vsDiff>0?'#f59e0b':'#0ea5e9'}35` }}>
                    <div style={{ width:8, height:8, borderRadius:'50%', background:Math.abs(vsDiff)<0.1?catColor:vsDiff>0?'#f59e0b':'#0ea5e9' }}/>
                    <span style={{ fontSize:12, fontWeight:700, color:Math.abs(vsDiff)<0.1?catColor:vsDiff>0?'#92400e':'#1e40af', fontFamily:"'DM Sans',sans-serif" }}>
                      {Math.abs(vsDiff)<0.05?'Average adult':vsDiff>0?`+${vsDiff.toFixed(2)} m² above avg`:`${vsDiff.toFixed(2)} m² below avg`}
                    </span>
                  </div>
                </div>
              </div>

              {/* formula comparison bars */}
              {results.map((r,i)=>(
                <div key={i} style={{ marginBottom:8 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, marginBottom:3 }}>
                    <span style={{ color: r.key===activeForm?'var(--text)':'var(--text-2)', fontWeight:r.key===activeForm?700:400 }}>{r.label}</span>
                    <span style={{ fontWeight:700, color:FORMULA_COLORS[i] }}>{fmtM2(r.bsa)}</span>
                  </div>
                  <div style={{ height:5, background:'var(--border)', borderRadius:3 }}>
                    <div style={{ height:'100%', width:`${(r.bsa/maxBar)*100}%`, background:FORMULA_COLORS[i], borderRadius:3, opacity:r.key===activeForm?1:0.5, transition:'all .3s' }}/>
                  </div>
                </div>
              ))}

              <div style={{ marginTop:12, padding:'8px 12px', background:'var(--bg-raised)', borderRadius:8, border:'0.5px solid var(--border)' }}>
                <div style={{ fontSize:10, color:'var(--text-3)', marginBottom:2 }}>Average across all formulas</div>
                <div style={{ fontSize:14, fontWeight:700, color:'var(--text)', fontFamily:"'Space Grotesk',sans-serif" }}>{fmtM2(avgBSA)}</div>
              </div>
            </div>
          </div>

          <BreakdownTable title="BSA Summary" rows={[
            { label:'BSA (Mosteller)',    value:fmtM2(results[0]?.bsa||0), bold:true, highlight:true, color:FORMULA_COLORS[0] },
            { label:'BSA (DuBois)',       value:fmtM2(results[1]?.bsa||0), color:FORMULA_COLORS[1] },
            { label:'BSA (Haycock)',      value:fmtM2(results[2]?.bsa||0), color:FORMULA_COLORS[2] },
            { label:'BSA (Gehan-George)',  value:fmtM2(results[3]?.bsa||0), color:FORMULA_COLORS[3] },
            { label:'Average (4 formulas)',value:fmtM2(avgBSA) },
            { label:'vs average adult',    value:Math.abs(vsDiff)<0.05?'At average':vsDiff>0?`+${vsDiff.toFixed(2)} m²`:`${vsDiff.toFixed(2)} m²`, color:Math.abs(vsDiff)<0.1?catColor:vsDiff>0?'#f59e0b':'#0ea5e9' },
          ]}/>
          <AIHintCard hint={hint}/>
        </>}
      />

      {/* What does this BSA look like */}
      <Sec title="What does your body surface area look like?" sub="Putting square metres into perspective">
        <p style={{ fontSize:12, color:'var(--text-2)', lineHeight:1.7, marginBottom:14, fontFamily:"'DM Sans',sans-serif" }}>
          {fmtM2(activeBSA)} of skin covering your entire body — here's how that compares to everyday objects.
        </p>
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {BSA_COMPARISONS.map((c,i)=>{
            const ratio = activeBSA/c.m2
            return (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'9px 12px', borderRadius:8, background:'var(--bg-raised)', border:`0.5px solid ${Math.abs(ratio-1)<0.15?catColor:'var(--border)'}` }}>
                <div style={{ flex:2, fontSize:12, fontWeight:600, color: Math.abs(ratio-1)<0.15?catColor:'var(--text)' }}>{c.object}</div>
                <div style={{ flex:1, textAlign:'center', fontSize:11, color:'var(--text-2)' }}>{fmtM2(c.m2)}</div>
                <div style={{ fontSize:12, fontWeight:700, color: Math.abs(ratio-1)<0.15?catColor:'var(--text-3)' }}>
                  {ratio<0.9?`${(c.m2/activeBSA).toFixed(1)}× larger`:ratio>1.1?`${(activeBSA/c.m2).toFixed(1)}× your size`:'≈ same size'}
                </div>
              </div>
            )
          })}
        </div>
      </Sec>

      {/* Drug dosing context */}
      <Sec title="Clinical use — drug dosing" sub="Why BSA matters in medicine">
        <p style={{ fontSize:12, color:'var(--text-2)', lineHeight:1.7, marginBottom:14, fontFamily:"'DM Sans',sans-serif" }}>
          BSA-based dosing is used primarily in oncology because many chemotherapy drugs have narrow therapeutic windows — the difference between an effective and a toxic dose is small, and BSA correlates better with drug clearance than body weight alone.
        </p>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          {[
            { drug:'Cisplatin',    dose:'75 mg/m²', your:`${(75*activeBSA).toFixed(0)} mg`, note:'Platinum-based chemotherapy' },
            { drug:'Carboplatin',  dose:'AUC×(GFR+25)', your:'Variable', note:'Calvert formula uses GFR' },
            { drug:'Paclitaxel',   dose:'175 mg/m²', your:`${(175*activeBSA).toFixed(0)} mg`, note:'Taxane chemotherapy' },
            { drug:'Doxorubicin',  dose:'60–75 mg/m²',your:`${(65*activeBSA).toFixed(0)} mg`, note:'Anthracycline (estimate)' },
          ].map((d,i)=>(
            <div key={i} style={{ background:'var(--bg-raised)', borderRadius:8, padding:'10px 12px', border:'0.5px solid var(--border)' }}>
              <div style={{ fontSize:12, fontWeight:700, color:catColor, marginBottom:3 }}>{d.drug}</div>
              <div style={{ fontSize:10, color:'var(--text-3)', marginBottom:4 }}>{d.note}</div>
              <div style={{ fontSize:11, color:'var(--text-2)', marginBottom:2 }}>Standard: {d.dose}</div>
              <div style={{ fontSize:13, fontWeight:700, color:'var(--text)' }}>Your dose: {d.your}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop:12, padding:'10px 13px', background:'#fef3c7', borderRadius:8, border:'0.5px solid #f59e0b30' }}>
          <p style={{ fontSize:11.5, color:'#92400e', margin:0, lineHeight:1.6, fontFamily:"'DM Sans',sans-serif" }}>
            ⚠️ These are illustrative estimates only. Actual oncology dosing is determined by a specialist team, accounting for renal function, prior treatment, and individual factors. Never use these figures clinically.
          </p>
        </div>
      </Sec>

      {/* Rule of Nines */}
      <Sec title="Burn assessment — Rule of Nines" sub="How BSA is used in burn injury evaluation">
        <p style={{ fontSize:12, color:'var(--text-2)', lineHeight:1.7, marginBottom:14, fontFamily:"'DM Sans',sans-serif" }}>
          In burn medicine, the total burned surface area (TBSA%) is estimated using the Rule of Nines. Each body region represents 9% (or a multiple) of total BSA. This guides fluid resuscitation (Parkland formula) and surgical planning.
        </p>
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          {BODY_REGIONS.map((r,i)=>(
            <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'8px 12px', borderRadius:7, background:'var(--bg-raised)', border:'0.5px solid var(--border)' }}>
              <div style={{ flex:2, fontSize:12, fontWeight:600, color:'var(--text)' }}>{r.region}</div>
              <div style={{ fontSize:12, fontWeight:700, color:catColor, minWidth:32, textAlign:'right' }}>{r.pct}%</div>
              <div style={{ flex:1, textAlign:'right', fontSize:11, color:'var(--text-3)' }}>{fmtM2(activeBSA*(r.pct/100))}</div>
              {r.note && <div style={{ fontSize:10, color:'var(--text-3)', minWidth:100, textAlign:'right' }}>{r.note}</div>}
            </div>
          ))}
        </div>
      </Sec>

      {/* Formula */}
      <Sec title="The science behind the numbers" sub="All 4 BSA formulas">
        <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:14 }}>
          {[
            { label:'Mosteller (1987)',     formula:'BSA = √(height_cm × weight_kg ÷ 3600)' },
            { label:'DuBois & DuBois (1916)',formula:'BSA = 0.007184 × height_cm^0.725 × weight_kg^0.425' },
            { label:'Haycock (1978)',        formula:'BSA = 0.024265 × height_cm^0.3964 × weight_kg^0.5378' },
            { label:'Gehan-George (1970)',   formula:'BSA = 0.0235 × height_cm^0.42246 × weight_kg^0.51456' },
          ].map((f,i)=>(
            <div key={f.label}>
              <div style={{ fontSize:10, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.05em', marginBottom:4 }}>{f.label}</div>
              <div style={{ background:'var(--bg-raised)', borderRadius:8, padding:'10px 14px', fontFamily:'monospace', fontSize:11, color:FORMULA_COLORS[i], fontWeight:600, overflowX:'auto', whiteSpace:'nowrap' }}>{f.formula}</div>
            </div>
          ))}
        </div>
        <p style={{ fontSize:12, color:'var(--text-2)', lineHeight:1.75, margin:0, fontFamily:"'DM Sans',sans-serif" }}>The Mosteller formula is preferred in most clinical settings for its simplicity. Average adult BSA is approximately 1.7–1.9 m². The difference between formulas is typically less than 5% for average adults but can be larger for very obese or very lean patients.</p>
      </Sec>

      {/* Examples */}
      <Sec title="Real world examples" sub="Click any to prefill">
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
          {EXAMPLES.map((ex,i)=>{
            const bsa2 = mosteller(ex.hCm,ex.wKg)
            return (
              <button key={i} onClick={()=>applyExample(ex)}
                style={{ padding:14, borderRadius:10, border:'1.5px solid var(--border)', background:'var(--bg-raised)', cursor:'pointer', textAlign:'left', transition:'all .15s' }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=catColor;e.currentTarget.style.background=catColor+'10'}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.background='var(--bg-raised)'}}>
                <div style={{ fontSize:13, fontWeight:700, color:'var(--text)', marginBottom:2 }}>{ex.title}</div>
                <div style={{ fontSize:11, color:'var(--text-3)', marginBottom:9, lineHeight:1.4 }}>{ex.desc}</div>
                {[['Height',`${ex.hCm} cm`],['Weight',`${ex.wKg} kg`],['BSA',fmtM2(bsa2)]].map(([k,v])=>(
                  <div key={k} style={{ display:'flex', justifyContent:'space-between' }}>
                    <span style={{ fontSize:10, color:'var(--text-3)' }}>{k}</span>
                    <span style={{ fontSize:10, fontWeight:600, color:k==='BSA'?catColor:'var(--text-2)' }}>{v}</span>
                  </div>
                ))}
                <div style={{ marginTop:8, textAlign:'right' }}>
                  <span style={{ fontSize:10, fontWeight:700, color:catColor }}>Apply →</span>
                </div>
              </button>
            )
          })}
        </div>
      </Sec>

      <Sec title="Key terms explained" sub="Click any term to expand">
        <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:8 }}>
          {GLOSSARY.map((g,i)=><GlsTerm key={i} term={g.term} def={g.def} catColor={catColor}/>)}
        </div>
      </Sec>

      <HealthJourneyNext catColor={catColor} intro="Body surface area is one piece of your physical profile. These calculators give you the rest of the picture." items={JOURNEY_ITEMS}/>

      <Sec title="Frequently asked questions" sub="Everything about body surface area">
        {FAQ.map((f,i)=>(
          <Acc key={i} q={f.q} a={f.a} open={openFaq===i} onToggle={()=>setOpenFaq(openFaq===i?null:i)} catColor={catColor}/>
        ))}
      </Sec>
    </div>
  )
}
