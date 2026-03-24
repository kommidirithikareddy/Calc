import { useState, useEffect, useRef } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import ResultHero from '../../components/calculator/ResultHero'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'
import CurrencyDropdown, { CURRENCIES } from '../../components/calculator/CurrencyDropdown'

const fmt  = (n, sym='$') => sym + Math.round(Math.max(0,n)).toLocaleString()
const fmtP = n => n.toFixed(2) + '%'

const EXAMPLES = [
  { title:'Public School Teacher',  desc:'Classic defined benefit pension',  salary:65000,  yos:30, accrual:2.0,  retireAge:62, cola:2.0 },
  { title:'Federal Employee (FERS)', desc:'FERS basic benefit component',     salary:90000,  yos:25, accrual:1.0,  retireAge:62, cola:2.5 },
  { title:'Police Officer',          desc:'High accrual public safety plan',  salary:80000,  yos:25, accrual:2.5,  retireAge:55, cola:2.0 },
]

const FAQ = [
  { q:'What is a defined benefit pension?', a:'A defined benefit (DB) pension guarantees a specific monthly income in retirement, calculated from years of service, final salary and an accrual rate. The employer bears the investment risk. This differs from a defined contribution plan (like a 401k) where your benefit depends on how much you contributed and how your investments performed.' },
  { q:'What is an accrual rate?', a:'The accrual rate (also called the benefit multiplier) is the percentage of salary you earn in pension per year of service. A 2% accrual rate with 30 years of service gives 60% income replacement. Most public sector plans use 1.5% to 2.5%; some high-risk occupations (police, firefighters) use 2.5% to 3%.' },
  { q:'How does the final average salary work?', a:'Most pension plans calculate benefits based on a Final Average Salary (FAS) — typically the average of your 3 or 5 highest-earning years. Using the FAS rather than your final year prevents manipulation and smooths out year-to-year variation. This calculator uses your entered salary as the FAS directly.' },
  { q:'What is COLA and why does it matter?', a:'COLA (Cost-of-Living Adjustment) is the annual percentage increase applied to your pension after retirement to protect against inflation. A pension of $3,000/month without COLA loses 30% of its purchasing power in 10 years at 3% inflation. Even a 2% COLA dramatically preserves real income over a 20-30 year retirement.' },
  { q:'Should I take a lump sum or monthly pension?', a:'This depends on your health, other income sources, investment ability and risk tolerance. The monthly pension provides guaranteed lifetime income — valuable if you live long. The lump sum allows investment control and leaves an estate. A rough rule: if the lump sum divided by the monthly pension is less than 150-160, the monthly pension is generally more valuable.' },
]

const GLOSSARY = [
  { term:'Defined Benefit (DB)', def:'A pension plan guaranteeing a fixed monthly payment in retirement, typically calculated from salary × years × accrual rate.' },
  { term:'Accrual Rate',         def:'The percentage of final salary earned per year of service. 2% accrual × 25 years = 50% income replacement.' },
  { term:'Final Average Salary', def:'The average of your highest-earning years (typically 3 or 5), used as the salary base for pension calculation.' },
  { term:'COLA',                 def:'Cost-of-Living Adjustment: annual increase to pension payments to offset inflation, often 2-3%.' },
  { term:'Vesting',              def:'The minimum years of service required before you earn the right to a pension. Typically 5-10 years.' },
  { term:'Commuted Value',       def:'The estimated lump sum equivalent of a pension — the present value of all future payments discounted at a specific rate.' },
]

function FieldInput({label,hint,value,onChange,prefix,suffix,min=0,max,catColor='#6366f1'}) {
  const [raw,setRaw]=useState(String(value))
  const [focused,setFocused]=useState(false)
  useEffect(()=>{if(!focused)setRaw(String(value))},[value,focused])
  return (
    <div style={{marginBottom:14}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:5}}>
        <label style={{fontSize:12.5,fontWeight:600,color:'var(--text)',fontFamily:"'DM Sans',sans-serif"}}>{label}</label>
        {hint&&<span style={{fontSize:10,color:'var(--text-3)'}}>{hint}</span>}
      </div>
      <div style={{display:'flex',alignItems:'center',gap:6,background:'var(--bg-input,var(--bg-card))',border:`1.5px solid ${focused?catColor:'var(--border)'}`,borderRadius:8,padding:'0 10px',height:38,boxShadow:focused?`0 0 0 3px ${catColor}18`:'none'}}>
        {prefix&&<span style={{fontSize:12,color:'var(--text-3)',fontWeight:600,flexShrink:0}}>{prefix}</span>}
        <input type="text" inputMode="decimal" value={focused?raw:value}
          onChange={e=>{setRaw(e.target.value);const v=parseFloat(e.target.value);if(!isNaN(v))onChange(v)}}
          onFocus={()=>{setFocused(true);setRaw(String(value))}}
          onBlur={()=>{setFocused(false);const v=parseFloat(raw);if(isNaN(v)||raw===''){setRaw(String(min));onChange(min)}else{const c=max!==undefined?Math.min(max,Math.max(min,v)):Math.max(min,v);setRaw(String(c));onChange(c)}}}
          style={{flex:1,border:'none',background:'transparent',fontSize:13,fontWeight:600,color:'var(--text)',padding:0,outline:'none',minWidth:0,fontFamily:"'DM Sans',sans-serif"}} />
        {suffix&&<span style={{fontSize:11,color:'var(--text-3)',fontWeight:500,flexShrink:0}}>{suffix}</span>}
      </div>
    </div>
  )
}
function AccordionItem({q,a,isOpen,onToggle,catColor}) {
  return (
    <div style={{borderBottom:'0.5px solid var(--border)'}}>
      <button onClick={onToggle} style={{width:'100%',display:'flex',justifyContent:'space-between',alignItems:'center',padding:'14px 0',background:'none',border:'none',cursor:'pointer',gap:12,textAlign:'left'}}>
        <span style={{fontSize:13,fontWeight:600,color:'var(--text)',fontFamily:"'DM Sans',sans-serif",lineHeight:1.4}}>{q}</span>
        <span style={{fontSize:18,color:catColor,flexShrink:0,transition:'transform .2s',transform:isOpen?'rotate(45deg)':'rotate(0)',display:'inline-block'}}>+</span>
      </button>
      {isOpen&&<p style={{fontSize:12.5,color:'var(--text-2)',lineHeight:1.75,margin:'0 0 14px',fontFamily:"'DM Sans',sans-serif"}}>{a}</p>}
    </div>
  )
}
function GlossaryTerm({term,def,catColor}) {
  const [open,setOpen]=useState(false)
  return (
    <div onClick={()=>setOpen(o=>!o)} style={{padding:'9px 12px',borderRadius:8,cursor:'pointer',background:open?catColor+'10':'var(--bg-raised)',border:`1px solid ${open?catColor+'30':'var(--border)'}`,transition:'all .15s'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:8}}>
        <span style={{fontSize:12,fontWeight:700,color:open?catColor:'var(--text)',fontFamily:"'Space Grotesk',sans-serif"}}>{term}</span>
        <span style={{fontSize:14,color:catColor,flexShrink:0}}>{open?'−':'+'}</span>
      </div>
      {open&&<p style={{fontSize:11.5,color:'var(--text-2)',lineHeight:1.65,margin:'7px 0 0',fontFamily:"'DM Sans',sans-serif"}}>{def}</p>}
    </div>
  )
}
function Section({title,subtitle,children}) {
  return (
    <div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,overflow:'hidden'}}>
      <div style={{padding:'14px 18px',borderBottom:'0.5px solid var(--border)'}}>
        <div style={{fontSize:13,fontWeight:700,color:'var(--text)',fontFamily:"'Space Grotesk',sans-serif"}}>{title}</div>
        {subtitle&&<div style={{fontSize:11,color:'var(--text-3)',marginTop:2}}>{subtitle}</div>}
      </div>
      <div style={{padding:'16px 18px'}}>{children}</div>
    </div>
  )
}

export default function PensionCalculator({ meta, category }) {
  const [salary,     setSalary]     = useState(65000)
  const [yos,        setYos]        = useState(30)
  const [accrual,    setAccrual]    = useState(2.0)
  const [retireAge,  setRetireAge]  = useState(62)
  const [cola,       setCola]       = useState(2.0)
  const [lifeExp,    setLifeExp]    = useState(85)
  const [currency,   setCurrency]   = useState(CURRENCIES[0])
  const [openFaq,    setOpenFaq]    = useState(null)
  const calcRef = useRef(null)
  const sym = currency.symbol
  const catColor = category?.color || '#6366f1'

  const replacePct      = yos * accrual                                  // % income replacement
  const annualPension   = salary * Math.min(replacePct,100) / 100
  const monthlyPension  = annualPension / 12
  const retirementYears = Math.max(0, lifeExp - retireAge)

  // COLA-adjusted totals
  const colaRate = cola / 100
  let totalLifetime = 0
  let year10 = 0, year20 = 0
  for (let y=1; y<=retirementYears; y++) {
    const val = annualPension * Math.pow(1+colaRate, y-1)
    totalLifetime += val
    if (y===10) year10 = val
    if (y===20) year20 = val
  }

  // Commuted value (present value at 5% discount)
  const discount = 0.05
  let pv = 0
  for (let y=1; y<=retirementYears; y++) {
    pv += annualPension * Math.pow(1+colaRate, y-1) / Math.pow(1+discount, y)
  }

  function applyExample(ex) {
    setSalary(ex.salary); setYos(ex.yos); setAccrual(ex.accrual)
    setRetireAge(ex.retireAge); setCola(ex.cola)
    setTimeout(()=>calcRef.current?.scrollIntoView({behavior:'smooth',block:'start'}),50)
  }

  return (
    <div style={{display:'flex',flexDirection:'column',gap:24}}>
      <div ref={calcRef} style={{scrollMarginTop:80}}>
        <CalcShell
          left={<>
            <div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:16,paddingBottom:8,borderBottom:'0.5px solid var(--border)'}}>Your Details</div>
            <CurrencyDropdown currency={currency} setCurrency={setCurrency} catColor={catColor} />
            <FieldInput label="Final Average Salary"  value={salary}    onChange={setSalary}    prefix={sym} catColor={catColor} />
            <FieldInput label="Years of Service"      value={yos}       onChange={setYos}       suffix="years" max={50} catColor={catColor} />
            <FieldInput label="Accrual Rate"           hint="Per year of service" value={accrual} onChange={setAccrual} suffix="%" max={4} catColor={catColor} />
            <FieldInput label="Retirement Age"         value={retireAge} onChange={setRetireAge} suffix="years" max={75} catColor={catColor} />

            <div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.07em',margin:'16px 0',paddingBottom:8,borderBottom:'0.5px solid var(--border)'}}>Projections</div>
            <FieldInput label="Annual COLA"            hint="Cost-of-living adj." value={cola}   onChange={setCola}   suffix="%" max={6} catColor={catColor} />
            <FieldInput label="Life Expectancy"        value={lifeExp}   onChange={setLifeExp}   suffix="years" max={100} catColor={catColor} />

            <div style={{padding:'12px 14px',borderRadius:10,marginBottom:14,background:catColor+'0d',border:`1px solid ${catColor}25`}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
                <span style={{fontSize:11,color:'var(--text-2)',fontFamily:"'DM Sans',sans-serif"}}>Income Replacement</span>
                <span style={{fontSize:20,fontWeight:800,color:catColor,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{Math.min(replacePct,100).toFixed(0)}%</span>
              </div>
              <div style={{display:'flex',justifyContent:'space-between'}}>
                <span style={{fontSize:10,color:'var(--text-3)'}}>{yos} yrs × {accrual}% = {replacePct.toFixed(1)}%</span>
                <span style={{fontSize:10,color:replacePct>=70?'#10b981':'#f59e0b',fontWeight:600}}>{replacePct>=70?'✓ Strong replacement':'Consider supplementing'}</span>
              </div>
            </div>

            <div style={{display:'flex',gap:10}}>
              <button style={{flex:1,padding:13,borderRadius:10,border:'none',background:catColor,color:'#fff',fontSize:14,fontWeight:700,cursor:'pointer'}} onMouseEnter={e=>e.currentTarget.style.opacity='.85'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>Calculate →</button>
              <button onClick={()=>{setSalary(65000);setYos(30);setAccrual(2.0);setRetireAge(62);setCola(2.0);setLifeExp(85)}} style={{padding:'13px 18px',borderRadius:10,border:'1.5px solid var(--border-2)',background:'var(--bg-raised)',color:'var(--text-2)',fontSize:13,fontWeight:500,cursor:'pointer'}}>Reset</button>
            </div>
          </>}
          right={<>
            <ResultHero label="Monthly Pension" value={monthlyPension} formatter={n=>fmt(n,sym)+'/mo'} sub={`${fmt(annualPension,sym)}/year at retirement`} color={catColor} />
            <BreakdownTable title="Pension Summary" rows={[
              {label:'Final Average Salary',    value:fmt(salary,sym),        color:catColor},
              {label:'Years of Service',        value:`${yos} years`},
              {label:'Accrual Rate',            value:fmtP(accrual)+'/year'},
              {label:'Income Replacement',      value:fmtP(Math.min(replacePct,100)), color:catColor},
              {label:'Annual Pension (Year 1)', value:fmt(annualPension,sym)},
              {label:'Monthly Pension (Year 1)',value:fmt(monthlyPension,sym),         bold:true},
              {label:`Annual Pension (Year 10, +${fmtP(cola)} COLA)`, value:fmt(year10,sym), color:'#10b981'},
              {label:`Annual Pension (Year 20)`, value:fmt(year20,sym),               color:'#10b981'},
              {label:'Estimated Lifetime Total',value:fmt(totalLifetime,sym),         bold:true, highlight:true},
              {label:'Commuted Value (~5% disc)',value:fmt(pv,sym)},
            ]} />
            <AIHintCard hint={`Your pension replaces ${Math.min(replacePct,100).toFixed(0)}% of income — ${replacePct>=70?'above':'below'} the 70% income-replacement target. Over ${retirementYears} years with ${fmtP(cola)} COLA, you'll receive an estimated ${fmt(totalLifetime,sym)} lifetime.`} />
          </>}
        />
      </div>

      <Section title="COLA Projection" subtitle="How annual cost-of-living adjustments grow your pension over time">
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontFamily:"'DM Sans',sans-serif"}}>
            <thead><tr>{['COLA Rate','Year 1','Year 10','Year 20','Year 30'].map((h,i)=>(
              <th key={h} style={{padding:'9px 12px',fontSize:11,fontWeight:700,color:'var(--text-3)',textAlign:i===0?'left':'right',borderBottom:'1px solid var(--border)',fontFamily:"'Space Grotesk',sans-serif"}}>{h}</th>
            ))}</tr></thead>
            <tbody>
              {[0,1,2,3,4].map((c,i)=>{
                const y1=annualPension
                const y10=annualPension*Math.pow(1+c/100,9)
                const y20=annualPension*Math.pow(1+c/100,19)
                const y30=annualPension*Math.pow(1+c/100,29)
                return (
                  <tr key={c} style={{background:i%2===0?'var(--bg-raised)':'transparent'}}>
                    <td style={{padding:'9px 12px',fontSize:12,fontWeight:600,color:c===cola?catColor:'var(--text)'}}>{c===0?'No COLA':`+${c}%/yr`}{c===cola?' ✓':''}</td>
                    <td style={{padding:'9px 12px',fontSize:12,color:'var(--text)',textAlign:'right'}}>{fmt(y1,sym)}</td>
                    <td style={{padding:'9px 12px',fontSize:12,color:'#10b981',textAlign:'right'}}>{fmt(y10,sym)}</td>
                    <td style={{padding:'9px 12px',fontSize:12,color:catColor,fontWeight:600,textAlign:'right'}}>{fmt(y20,sym)}</td>
                    <td style={{padding:'9px 12px',fontSize:12,color:catColor,fontWeight:700,textAlign:'right'}}>{fmt(y30,sym)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Real World Examples" subtitle="Click any example to fill the calculator">
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
          {EXAMPLES.map((ex,i)=>(
            <button key={i} onClick={()=>applyExample(ex)} style={{padding:14,borderRadius:10,border:'1.5px solid var(--border)',background:'var(--bg-raised)',cursor:'pointer',textAlign:'left',transition:'all .15s'}} onMouseEnter={e=>{e.currentTarget.style.borderColor=catColor;e.currentTarget.style.background=catColor+'10'}} onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.background='var(--bg-raised)'}}>
              <div style={{fontSize:13,fontWeight:700,color:'var(--text)',marginBottom:4}}>{ex.title}</div>
              <div style={{fontSize:11,color:'var(--text-3)',marginBottom:10,lineHeight:1.4}}>{ex.desc}</div>
              {[['Salary',fmt(ex.salary,sym)],['YOS',`${ex.yos} yrs`],['Accrual',`${ex.accrual}%/yr`],['Replacement',`${(ex.yos*ex.accrual).toFixed(0)}%`]].map(([k,v])=>(
                <div key={k} style={{display:'flex',justifyContent:'space-between'}}>
                  <span style={{fontSize:10,color:'var(--text-3)'}}>{k}</span>
                  <span style={{fontSize:10,fontWeight:600,color:catColor}}>{v}</span>
                </div>
              ))}
              <div style={{marginTop:10,fontSize:10,fontWeight:700,color:catColor}}>Apply example →</div>
            </button>
          ))}
        </div>
      </Section>

      <Section title="Formula Explained">
        <div style={{background:'var(--bg-raised)',borderRadius:10,padding:'14px 16px',marginBottom:14,fontFamily:'monospace',fontSize:12,color:catColor,lineHeight:1.9}}>
          Annual Pension = Salary × (Years × Accrual Rate / 100){'\n'}
          Monthly Pension = Annual Pension / 12{'\n'}
          Year N Value = Annual Pension × (1 + COLA)^(N−1)
        </div>
        <p style={{fontSize:12.5,color:'var(--text-2)',lineHeight:1.75,margin:0,fontFamily:"'DM Sans',sans-serif"}}>
          The defined benefit formula multiplies your final average salary by years of service and the plan's accrual rate. A 2% accrual rate with 30 years gives 60% income replacement. COLA adjustments compound annually, significantly increasing lifetime value — a 3% COLA doubles the pension's nominal value in about 24 years.
        </p>
      </Section>

      <Section title="Key Terms">
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {GLOSSARY.map(g=><GlossaryTerm key={g.term} {...g} catColor={catColor}/>)}
        </div>
      </Section>

      <Section title="FAQ">
        {FAQ.map((f,i)=><AccordionItem key={i} q={f.q} a={f.a} isOpen={openFaq===i} onToggle={()=>setOpenFaq(openFaq===i?null:i)} catColor={catColor}/>)}
      </Section>
    </div>
  )
}
