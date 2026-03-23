import { useState, useEffect, useRef } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import ResultHero from '../../components/calculator/ResultHero'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'
import CurrencyDropdown, { CURRENCIES } from '../../components/calculator/CurrencyDropdown'

const fmt = (n,sym='$') => sym+Math.round(Math.max(0,n)).toLocaleString()

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

// Newton-Raphson to find monthly rate from loan params
function findRate(pv, pmt, n) {
  let r = 0.05/12
  for(let i=0;i<200;i++){
    const f = pmt - pv*r*Math.pow(1+r,n)/(Math.pow(1+r,n)-1)
    const df = -pv*(Math.pow(1+r,n)*(1+r*n)-Math.pow(1+r,n)*1)/Math.pow(Math.pow(1+r,n)-1,2)
    const r2 = r - f/df
    if(Math.abs(r2-r)<1e-9)return r2
    if(r2<0)r=0.001
    else r=r2
  }
  return r
}


const EXAMPLES_IR = [
  { title:'Car Loan',      desc:'Find rate from payment',      mode:'loan', loanAmt:25000, payment:480, months:60, pv:0, fv:0, years:0 },
  { title:'Mortgage',      desc:'Implied mortgage rate',       mode:'loan', loanAmt:280000,payment:1800,months:360,pv:0,fv:0,years:0 },
  { title:'Savings Goal',  desc:'Required return to grow $5k', mode:'savings', loanAmt:0, payment:0, months:0, pv:5000, fv:8000, years:5 },
]
const FAQ_IR = [
  {q:'When do I need to find an interest rate?',a:'You need to reverse-engineer a rate when you know the loan terms (amount, payment, duration) but not the rate — for example, evaluating a dealer financing offer, checking a lenders advertised payment against the stated rate, or finding what return a savings product actually offers.'},
  {q:'Why might the implied rate differ from advertised?',a:'Lenders often advertise "as low as" rates or monthly payment amounts that assume specific terms. By entering the actual payment, amount and duration, you can find the true rate. This is especially useful with dealer financing, where the rate is often buried in the payment structure.'},
  {q:'What is the difference between nominal and effective rate?',a:'The nominal rate is stated without considering compounding. The effective rate (APY) accounts for how often interest compounds — monthly compounding at 6% nominal equals a 6.17% effective rate. This calculator finds nominal annual rates.'},
]
const GLOSSARY_IR = [
  {term:'Nominal Rate',     def:'The stated annual interest rate without adjusting for compounding frequency.'},
  {term:'Implied Rate',     def:'The interest rate that mathematically explains a given set of loan terms (amount, payment, duration).'},
  {term:'Newton-Raphson',   def:'An iterative numerical method used to solve equations with no closed-form solution — used here to find interest rates.'},
  {term:'APR vs APY',       def:'APR is the nominal rate; APY accounts for compounding. For monthly-compound loans, APY slightly exceeds APR.'},
]

function AccordionItemIR({q,a,isOpen,onToggle,catColor}) {
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
function GlossaryTermIR({term,def,catColor}) {
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
export default function InterestRateCalculator({ meta, category }) {
  const [mode,setMode]=useState('loan') // 'loan' | 'savings'
  const [loanAmt,setLoanAmt]=useState(20000)
  const [payment,setPayment]=useState(450)
  const [months,setMonths]=useState(48)
  // Savings mode
  const [pv,setPv]=useState(5000)
  const [fv,setFv]=useState(8000)
  const [years,setYears]=useState(5)
  const [currency,setCurrency]=useState(CURRENCIES[0])
  const sym=currency.symbol
  const catColor=category?.color||'#6366f1'
  const [openFaq,setOpenFaq]=useState(null)
  const calcRef=useRef(null)

  let rate=0, label='', sub=''
  if(mode==='loan'){
    const mr=findRate(loanAmt,payment,months)
    rate=mr*12*100
    label='Annual Interest Rate'
    sub=`On ${fmt(loanAmt,sym)} loan, ${fmt(payment,sym)}/mo for ${months} months`
  } else {
    rate=years>0?(Math.pow(fv/pv,1/years)-1)*100:0
    label='Required Annual Return'
    sub=`To grow ${fmt(pv,sym)} to ${fmt(fv,sym)} in ${years} years`
  }

  const totalPaid = mode==='loan' ? payment*months : 0
  const totalInt  = mode==='loan' ? Math.max(0,totalPaid-loanAmt) : 0

  const hint = mode==='loan'
    ? `Your loan has an implied rate of ${rate.toFixed(2)}%. Total interest: ${fmt(totalInt,sym)} on a ${fmt(loanAmt,sym)} loan.`
    : `Growing ${fmt(pv,sym)} to ${fmt(fv,sym)} in ${years} years requires a ${rate.toFixed(2)}% annual return.`

  return (
    <div style={{display:'flex',flexDirection:'column',gap:24}}>
      <div ref={calcRef} style={{scrollMarginTop:80}}>
        <CalcShell
          left={<>
            <div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:16,paddingBottom:8,borderBottom:'0.5px solid var(--border)'}}>Find Interest Rate</div>
            <CurrencyDropdown currency={currency} setCurrency={setCurrency} catColor={catColor} />

            {/* Mode toggle */}
            <div style={{marginBottom:16}}>
              <div style={{fontSize:12.5,fontWeight:600,color:'var(--text)',marginBottom:8,fontFamily:"'DM Sans',sans-serif"}}>Calculate rate for</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                {[['loan','🏦 Loan / Mortgage','Find rate from monthly payment'],['savings','📈 Savings / Investment','Find rate from growth target']].map(([m,label,desc])=>(
                  <button key={m} onClick={()=>setMode(m)} style={{padding:'10px 12px',borderRadius:10,border:`1.5px solid ${mode===m?catColor:'var(--border)'}`,background:mode===m?catColor+'0d':'var(--bg-raised)',cursor:'pointer',textAlign:'left',transition:'all .15s'}}>
                    <div style={{fontSize:12,fontWeight:700,color:mode===m?catColor:'var(--text)',marginBottom:3}}>{label}</div>
                    <div style={{fontSize:10,color:'var(--text-3)',lineHeight:1.4}}>{desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {mode==='loan'?(
              <>
                <FieldInput label="Loan Amount" hint="Principal borrowed" value={loanAmt} onChange={setLoanAmt} prefix={sym} min={1} catColor={catColor} />
                <FieldInput label="Monthly Payment" hint="Your actual payment" value={payment} onChange={setPayment} prefix={sym} min={1} catColor={catColor} />
                <FieldInput label="Loan Term" hint="Number of months" value={months} onChange={setMonths} suffix="mo" min={1} max={360} catColor={catColor} />
              </>
            ):(
              <>
                <FieldInput label="Present Value" hint="Starting amount" value={pv} onChange={setPv} prefix={sym} min={1} catColor={catColor} />
                <FieldInput label="Future Value" hint="Target amount" value={fv} onChange={setFv} prefix={sym} min={1} catColor={catColor} />
                <FieldInput label="Time Period" hint="Years" value={years} onChange={setYears} suffix="yrs" min={0.5} max={50} catColor={catColor} />
              </>
            )}

            <div style={{display:'flex',gap:10,marginTop:6}}>
              <button style={{flex:1,padding:13,borderRadius:10,border:'none',background:catColor,color:'#fff',fontSize:14,fontWeight:700,cursor:'pointer'}} onMouseEnter={e=>e.currentTarget.style.opacity='.85'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>Find Rate →</button>
              <button onClick={()=>{setLoanAmt(20000);setPayment(450);setMonths(48);setPv(5000);setFv(8000);setYears(5)}} style={{padding:'13px 18px',borderRadius:10,border:'1.5px solid var(--border-2)',background:'var(--bg-raised)',color:'var(--text-2)',fontSize:13,fontWeight:500,cursor:'pointer'}} onMouseEnter={e=>{e.currentTarget.style.borderColor='#ef4444';e.currentTarget.style.color='#ef4444'}} onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border-2)';e.currentTarget.style.color='var(--text-2)'}}>Reset</button>
            </div>
          </>}
          right={<>
            <ResultHero label={label} value={Math.abs(rate)} formatter={n=>n.toFixed(2)+'%'} sub={sub} color={catColor} />
            {mode==='loan'?(
              <BreakdownTable title="Loan Summary" rows={[
                {label:'Loan Amount',    value:fmt(loanAmt,sym)},
                {label:'Monthly Payment',value:fmt(payment,sym), color:catColor},
                {label:'Loan Term',      value:`${months} months`},
                {label:'Total Paid',     value:fmt(totalPaid,sym)},
                {label:'Total Interest', value:fmt(totalInt,sym), color:'#ef4444'},
                {label:'Implied Rate',   value:`${rate.toFixed(2)}%`, color:catColor, bold:true, highlight:true},
              ]} />
            ):(
              <BreakdownTable title="Growth Summary" rows={[
                {label:'Starting Amount', value:fmt(pv,sym)},
                {label:'Target Amount',   value:fmt(fv,sym), color:'#10b981'},
                {label:'Time Period',     value:`${years} years`},
                {label:'Total Growth',    value:fmt(fv-pv,sym), color:'#10b981'},
                {label:'Required Return', value:`${rate.toFixed(2)}%/yr`, color:catColor, bold:true, highlight:true},
              ]} />
            )}
            <AIHintCard hint={hint} />
          </>}
        />
      </div>

      {/* Rate comparison table */}
      <Section title={mode==='loan'?'How Does Your Rate Compare?':'Required Return in Context'} subtitle="Common reference rates">
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {(mode==='loan'?[
            {label:'Excellent credit mortgage',range:'5.5 – 6.5%'},
            {label:'Good credit auto loan',range:'5 – 8%'},
            {label:'Good credit personal loan',range:'8 – 12%'},
            {label:'Fair credit personal loan',range:'15 – 20%'},
            {label:'Credit card average',range:'18 – 25%'},
            {label:'Your loan rate',range:`${rate.toFixed(2)}%`,isYours:true},
          ]:[
            {label:'High-yield savings',range:'4 – 5%'},
            {label:'Government bonds',range:'4.5 – 5.5%'},
            {label:'Balanced portfolio',range:'6 – 8%'},
            {label:'S&P 500 historical',range:'~10%'},
            {label:'Required return',range:`${rate.toFixed(2)}%`,isYours:true},
          ]).map((r,i)=>(
            <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'9px 12px',borderRadius:8,background:r.isYours?catColor+'10':'var(--bg-raised)',border:`1px solid ${r.isYours?catColor+'40':'var(--border)'}`}}>
              <span style={{fontSize:12,color:r.isYours?catColor:'var(--text-2)',fontWeight:r.isYours?700:400}}>{r.label} {r.isYours&&'← You'}</span>
              <span style={{fontSize:12,fontWeight:700,color:r.isYours?catColor:'var(--text)'}}>{r.range}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Formula Explained" subtitle="How we find an unknown interest rate">
        <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:14}}>
          {[{label:'For Loans (find r given P, EMI, n)',formula:'0 = EMI - P×r×(1+r)^n / ((1+r)^n-1)  [solved iteratively]'},{label:'For Savings (find r given PV, FV, years)',formula:'r = (FV/PV)^(1/years) - 1  [direct formula]'}].map(f=>(
            <div key={f.label}>
              <div style={{fontSize:10,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.05em',marginBottom:4}}>{f.label}</div>
              <div style={{background:'var(--bg-raised)',borderRadius:8,padding:'10px 14px',fontFamily:'monospace',fontSize:11,color:catColor,fontWeight:600,overflowX:'auto',whiteSpace:'nowrap'}}>{f.formula}</div>
            </div>
          ))}
        </div>
        <p style={{fontSize:12,color:'var(--text-2)',lineHeight:1.75,margin:0}}>For loans, there is no direct formula to solve for the interest rate — it requires iterative numerical methods. This calculator uses Newton-Raphson iteration, converging on the exact rate within microseconds. For savings growth, the rate can be found directly using the CAGR formula.</p>
      </Section>

      <Section title="Real World Examples" subtitle="Click any example to fill the calculator">
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
          {EXAMPLES_IR.map((ex,i)=>(
            <button key={i} onClick={()=>{setMode(ex.mode);if(ex.mode==='loan'){setLoanAmt(ex.loanAmt);setPayment(ex.payment);setMonths(ex.months)}else{setPv(ex.pv);setFv(ex.fv);setYears(ex.years)}}} style={{padding:14,borderRadius:10,border:'1.5px solid var(--border)',background:'var(--bg-raised)',cursor:'pointer',textAlign:'left',transition:'all .15s'}} onMouseEnter={e=>{e.currentTarget.style.borderColor=catColor;e.currentTarget.style.background=catColor+'10'}} onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.background='var(--bg-raised)'}}>
              <div style={{fontSize:13,fontWeight:700,color:'var(--text)',marginBottom:4}}>{ex.title}</div>
              <div style={{fontSize:11,color:'var(--text-3)',marginBottom:8,lineHeight:1.4}}>{ex.desc}</div>
              <div style={{fontSize:10,color:catColor,fontWeight:600}}>{ex.mode==='loan'?`${sym}${ex.loanAmt.toLocaleString()} · ${sym}${ex.payment}/mo · ${ex.months}mo`:`${sym}${ex.pv.toLocaleString()} → ${sym}${ex.fv.toLocaleString()} in ${ex.years}yrs`}</div>
              <div style={{marginTop:8,fontSize:10,fontWeight:700,color:catColor}}>Apply example →</div>
            </button>
          ))}
        </div>
      </Section>

      <Section title="Key Terms" subtitle="Interest rate terminology — click any term">
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:8}}>
          {GLOSSARY_IR.map((item,i)=><GlossaryTermIR key={i} term={item.term} def={item.def} catColor={catColor} />)}
        </div>
      </Section>

      <Section title="Frequently Asked Questions">
        {FAQ_IR.map((item,i)=><AccordionItemIR key={i} q={item.q} a={item.a} isOpen={openFaq===i} onToggle={()=>setOpenFaq(openFaq===i?null:i)} catColor={catColor} />)}
      </Section>
    </div>
  )
}