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

const FAQ = [
  {q:'What is the 28/36 rule?',a:'Lenders use the 28/36 rule as a guideline: your housing costs (mortgage P&I + tax + insurance) should not exceed 28% of gross monthly income, and your total debt payments (housing + car loans + student loans + credit cards) should not exceed 36%. Staying within these ratios improves your approval chances and financial comfort.'},
  {q:'What counts as monthly debt?',a:'Monthly debt includes minimum credit card payments, car loan payments, student loan payments, personal loan payments, and any other recurring debt obligations. It does not include utilities, groceries, insurance or other living expenses — only formal debt payments.'},
  {q:'How much down payment do I need?',a:'The minimum is 3-3.5% for conventional/FHA loans, but 20% avoids PMI. A larger down payment reduces your loan amount, monthly payment and total interest. It also gives you instant equity and may qualify you for better interest rates. The right amount depends on your savings, local market and how long you plan to stay.'},
  {q:'Does this include all my housing costs?',a:'This calculator estimates affordability based on P&I payment, property tax and insurance. Additional housing costs include: HOA fees, maintenance (~1-2% of home value/year), utilities and possible PMI. For a complete picture, add your expected HOA fees to the monthly debt figure.'},
]


function _Section({title,subtitle,children}) {
  return (
    <div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,overflow:'hidden',marginTop:24}}>
      <div style={{padding:'14px 18px',borderBottom:'0.5px solid var(--border)'}}>
        <div style={{fontSize:13,fontWeight:700,color:'var(--text)',fontFamily:"'Space Grotesk',sans-serif"}}>{title}</div>
        {subtitle&&<div style={{fontSize:11,color:'var(--text-3)',marginTop:2}}>{subtitle}</div>}
      </div>
      <div style={{padding:'16px 18px'}}>{children}</div>
    </div>
  )
}
function _Accordion({q,a,isOpen,onToggle,catColor}) {
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
function _Glossary({term,def,catColor}) {
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

const HA_EXAMPLES = [
  {title:'First-Time Buyer',desc:'Moderate income, some debt',income:7000,monthlyDebt:400,downPayment:30000,rate:6.5,tax:200,insurance:80},
  {title:'High Income',desc:'Dual income, minimal debt',income:15000,monthlyDebt:200,downPayment:100000,rate:6.5,tax:400,insurance:150},
  {title:'Tight Budget',desc:'Low debt, modest savings',income:5500,monthlyDebt:300,downPayment:15000,rate:7.0,tax:150,insurance:80},
]
const HA_FAQ = [
  {q:'What is the 28/36 rule?',a:'The 28/36 rule says housing costs should not exceed 28% of gross monthly income, and total debt (housing + all other debts) should not exceed 36%. Lenders use this to assess mortgage risk. Some programs allow higher ratios with strong credit or large down payments.'},
  {q:'What counts as monthly debt in the 36% calculation?',a:'Monthly debt includes minimum credit card payments, car loan payments, student loan payments, personal loan payments, and any alimony or child support. It does not include utilities, groceries, subscriptions or living expenses — only formal debt obligations with fixed payments.'},
  {q:'What if I exceed the 28/36 limits?',a:'Exceeding the limits does not automatically disqualify you — lenders also consider credit score, employment stability, assets, and loan type. FHA loans allow up to 43% DTI; conventional loans sometimes allow 45-50% with compensating factors. However, staying within the limits ensures a comfortable payment that won't strain your budget.'},
  {q:'Should I borrow the maximum I qualify for?',a:'No. Qualifying for the maximum is not the same as being able to comfortably afford it. Lenders consider gross income, but you live on net (after-tax) income. Use a conservative estimate — aim for 25% of gross income for housing — to leave room for savings, emergencies and lifestyle expenses.'},
]
const HA_GLOSSARY = [
  {term:'Debt-to-Income (DTI)',def:'Total monthly debt payments divided by gross monthly income. Lenders want this below 36-43%.'},
  {term:'28/36 Rule',def:'Housing costs ≤ 28% of income and total debt ≤ 36% of income — the standard lender affordability guideline.'},
  {term:'Front-end Ratio',def:'Housing costs alone (P&I + tax + insurance) as a percentage of gross income. Should stay under 28%.'},
  {term:'Back-end Ratio',def:'All debt payments (housing + car + cards + loans) as a percentage of gross income. Should stay under 36%.'},
  {term:'Pre-qualification',def:'An informal lender estimate of how much you might borrow, based on self-reported financial information.'},
  {term:'Pre-approval',def:'A formal lender commitment to lend up to a specific amount, after verifying income, credit and assets.'},
]

export default function HomeAffordability({ meta, category }) {
  const [income,setIncome]=useState(8000)
  const [openFaq,setOpenFaq]=useState(null)
  const [monthlyDebt,setMonthlyDebt]=useState(500)
  const [downPayment,setDownPayment]=useState(40000)
  const [rate,setRate]=useState(6.5)
  const [tax,setTax]=useState(200)
  const [insurance,setInsurance]=useState(100)
  const [currency,setCurrency]=useState(CURRENCIES[0])
  const [openFaq,setOpenFaq]=useState(null)
  const sym=currency.symbol
  const catColor=category?.color||'#6366f1'

  // Max housing payment by 28% rule
  const maxHousing28 = income * 0.28
  // Max housing payment by 36% rule (subtract existing debt)
  const maxHousing36 = income * 0.36 - monthlyDebt
  // Use the more restrictive
  const maxHousingPmt = Math.max(0, Math.min(maxHousing28, maxHousing36))
  // Available for P&I (subtract tax/insurance)
  const maxPI = Math.max(0, maxHousingPmt - tax - insurance)
  // Max loan from maxPI
  const mr = rate/100/12
  const termMonths = 30*12
  const maxLoan = maxPI > 0 && mr > 0 ? maxPI*(Math.pow(1+mr,termMonths)-1)/(mr*Math.pow(1+mr,termMonths)) : maxPI*termMonths
  const maxPrice = maxLoan + downPayment
  // Conservative (25% rule)
  const conservativeHousing = income * 0.25 - tax - insurance
  const conservativeLoan = conservativeHousing > 0 && mr > 0 ? conservativeHousing*(Math.pow(1+mr,termMonths)-1)/(mr*Math.pow(1+mr,termMonths)) : 0
  const conservativePrice = conservativeLoan + downPayment

  const dti = income > 0 ? ((maxHousingPmt + monthlyDebt) / income * 100).toFixed(1) : 0
  const hint = `Based on ${dti}% DTI, you can afford up to ${fmt(maxPrice,sym)}. Conservative estimate (25% rule): ${fmt(conservativePrice,sym)}. Down payment of ${fmt(downPayment,sym)} covers ${downPayment>0?(downPayment/maxPrice*100).toFixed(1):0}%.`

  return (
    <div style={{display:'flex',flexDirection:'column',gap:24}}>
      <div>
        <CalcShell
          left={<>
            <div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:16,paddingBottom:8,borderBottom:'0.5px solid var(--border)'}}>Your Financial Profile</div>
            <CurrencyDropdown currency={currency} setCurrency={setCurrency} catColor={catColor} />
            <FieldInput label="Gross Monthly Income" hint="Before taxes" value={income} onChange={setIncome} prefix={sym} min={1} catColor={catColor} />
            <FieldInput label="Monthly Debt Payments" hint="Car, student loans, credit cards" value={monthlyDebt} onChange={setMonthlyDebt} prefix={sym} min={0} catColor={catColor} />
            <FieldInput label="Available Down Payment" hint="Cash saved for purchase" value={downPayment} onChange={setDownPayment} prefix={sym} min={0} catColor={catColor} />
            <FieldInput label="Expected Interest Rate" hint="Current mortgage rate" value={rate} onChange={setRate} suffix="%" min={0} max={20} catColor={catColor} />
            <FieldInput label="Monthly Property Tax Est." value={tax} onChange={setTax} prefix={sym} min={0} catColor={catColor} />
            <FieldInput label="Monthly Insurance Est." value={insurance} onChange={setInsurance} prefix={sym} min={0} catColor={catColor} />
            <div style={{display:'flex',gap:10,marginTop:6}}>
              <button style={{flex:1,padding:13,borderRadius:10,border:'none',background:catColor,color:'#fff',fontSize:14,fontWeight:700,cursor:'pointer'}} onMouseEnter={e=>e.currentTarget.style.opacity='.85'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>Calculate →</button>
              <button onClick={()=>{setIncome(8000);setMonthlyDebt(500);setDownPayment(40000);setRate(6.5);setTax(200);setInsurance(100)}} style={{padding:'13px 18px',borderRadius:10,border:'1.5px solid var(--border-2)',background:'var(--bg-raised)',color:'var(--text-2)',fontSize:13,fontWeight:500,cursor:'pointer'}} onMouseEnter={e=>{e.currentTarget.style.borderColor='#ef4444';e.currentTarget.style.color='#ef4444'}} onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border-2)';e.currentTarget.style.color='var(--text-2)'}}>Reset</button>
            </div>
          </>}
          right={<>
            <ResultHero label="Max Home Price" value={Math.round(maxPrice)} formatter={n=>sym+Math.round(Math.max(0,n)).toLocaleString()} sub={`Based on 28/36 rule with ${fmt(downPayment,sym)} down`} color={catColor} />
            <BreakdownTable title="Affordability Summary" rows={[
              {label:'Max Monthly Housing',  value:fmt(maxHousingPmt,sym), color:catColor},
              {label:'Available for P&I',    value:fmt(maxPI,sym),          color:catColor},
              {label:'Max Loan Amount',      value:fmt(maxLoan,sym),        color:'#3b82f6'},
              {label:'Down Payment',         value:fmt(downPayment,sym),    color:'#10b981'},
              {label:'Max Home Price (28/36)',value:fmt(maxPrice,sym),      color:catColor, bold:true, highlight:true},
              {label:'Conservative (25%)',   value:fmt(conservativePrice,sym), color:'#10b981'},
            ]} />
            <AIHintCard hint={hint} />
          </>}
        />
      </div>

      <_Section title="Formula Explained" subtitle="How affordability is calculated">
        <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:14}}>
          {[{label:'28% Front-end Rule',formula:'Max Housing = Gross Monthly Income × 0.28'},{label:'36% Back-end Rule',formula:'Max Housing = (Gross Income × 0.36) − Monthly Debts'},{label:'Max Loan from Payment',formula:'Loan = Payment × ((1+r)^n − 1) / (r × (1+r)^n)'}].map(f=>(
            <div key={f.label}>
              <div style={{fontSize:10,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.05em',marginBottom:4}}>{f.label}</div>
              <div style={{background:'var(--bg-raised)',borderRadius:8,padding:'10px 14px',fontFamily:'monospace',fontSize:12,color:catColor,fontWeight:600,overflowX:'auto',whiteSpace:'nowrap'}}>{f.formula}</div>
            </div>
          ))}
        </div>
        <p style={{fontSize:12,color:'var(--text-2)',lineHeight:1.75,margin:0}}>The calculator takes the lower of the 28% and 36% limits to find your maximum safe housing payment, subtracts estimated taxes and insurance to get the available P&I, then solves for the maximum loan using the standard mortgage formula. Add your down payment to get your maximum home price.</p>
      </_Section>

      <_Section title="Real World Examples" subtitle="Click any example to load the calculator">
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
          {HA_EXAMPLES.map((ex,i)=>(
            <button key={i} onClick={()=>{setIncome(ex.income);setMonthlyDebt(ex.monthlyDebt);setDownPayment(ex.downPayment);setRate(ex.rate);setTax(ex.tax);setInsurance(ex.insurance)}} style={{padding:14,borderRadius:10,border:'1.5px solid var(--border)',background:'var(--bg-raised)',cursor:'pointer',textAlign:'left',transition:'all .15s'}} onMouseEnter={e=>{e.currentTarget.style.borderColor=catColor;e.currentTarget.style.background=catColor+'10'}} onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.background='var(--bg-raised)'}}>
              <div style={{fontSize:13,fontWeight:700,color:'var(--text)',marginBottom:4}}>{ex.title}</div>
              <div style={{fontSize:11,color:'var(--text-3)',marginBottom:10,lineHeight:1.4}}>{ex.desc}</div>
              {[['Income',`${sym}${ex.income.toLocaleString()}/mo`],['Debts',`${sym}${ex.monthlyDebt}/mo`],['Down',`${sym}${ex.downPayment.toLocaleString()}`],['Rate',`${ex.rate}%`]].map(([k,v])=>(
                <div key={k} style={{display:'flex',justifyContent:'space-between'}}>
                  <span style={{fontSize:10,color:'var(--text-3)'}}>{k}</span>
                  <span style={{fontSize:10,fontWeight:600,color:catColor}}>{v}</span>
                </div>
              ))}
              <div style={{marginTop:10,fontSize:10,fontWeight:700,color:catColor}}>Apply example →</div>
            </button>
          ))}
        </div>
      </_Section>

      <_Section title="Key Terms" subtitle="Click any term to see its definition">
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:8}}>
          {HA_GLOSSARY.map((item,i)=><_Glossary key={i} term={item.term} def={item.def} catColor={catColor} />)}
        </div>
      </_Section>

      <Section title="Price Range by DTI Rule" subtitle="How different affordability rules affect your max price">
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
          {[{label:'Conservative',pct:25,color:'#10b981'},{label:'Standard (28/36)',pct:28,color:catColor},{label:'Aggressive',pct:33,color:'#f59e0b'}].map((r,i)=>{
            const hp=income*r.pct/100-tax-insurance
            const lp=hp>0&&mr>0?hp*(Math.pow(1+mr,termMonths)-1)/(mr*Math.pow(1+mr,termMonths)):0
            const pp=lp+downPayment
            return (
              <div key={i} style={{padding:'14px',borderRadius:10,border:`1.5px solid ${r.color}30`,background:r.color+'08',textAlign:'center'}}>
                <div style={{fontSize:11,fontWeight:700,color:r.color,marginBottom:6,fontFamily:"'Space Grotesk',sans-serif"}}>{r.label}</div>
                <div style={{fontSize:18,fontWeight:800,color:r.color,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{fmt(pp,sym)}</div>
                <div style={{fontSize:10,color:'var(--text-3)',marginTop:4}}>{r.pct}% of income rule</div>
              </div>
            )
          })}
        </div>
      </Section>

      <Section title="Frequently Asked Questions">
        {FAQ.map((item,i)=><AccordionItem key={i} q={item.q} a={item.a} isOpen={openFaq===i} onToggle={()=>setOpenFaq(openFaq===i?null:i)} catColor={catColor} />)}
      </Section>

      <_Section title="Frequently Asked Questions" subtitle="Everything about home affordability">
        {HA_FAQ.map((item,i)=><_Accordion key={i} q={item.q} a={item.a} isOpen={openFaq===i} onToggle={()=>setOpenFaq(openFaq===i?null:i)} catColor={catColor} />)}
      </_Section>

    </div>
  )
}