import { useState, useEffect, useRef } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import ResultHero from '../../components/calculator/ResultHero'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'
import CurrencyDropdown, { CURRENCIES } from '../../components/calculator/CurrencyDropdown'

const fmt = (n,sym='$') => sym+Math.round(Math.max(0,n)).toLocaleString()

const EXAMPLES = [
  { title:'Economy Car',  desc:'New compact, good credit',      price:28000,down:3000, tradeIn:0,    rate:5.9, months:60 },
  { title:'SUV Purchase', desc:'Family SUV, moderate credit',   price:45000,down:5000, tradeIn:8000, rate:7.5, months:72 },
  { title:'Used Car',     desc:'3-year old sedan, cash down',   price:18000,down:4000, tradeIn:0,    rate:8.9, months:48 },
]
const FAQ = [
  { q:'What is a good interest rate for an auto loan?', a:'Rates depend heavily on your credit score. Excellent credit (750+): 3-5%. Good (700-749): 5-7%. Fair (650-699): 8-12%. Poor (<650): 12%+. New cars generally get lower rates than used. Credit unions often offer lower rates than dealerships. Always get pre-approved before shopping.' },
  { q:'How does a trade-in affect my loan?', a:'A trade-in reduces the amount you need to finance. If your car is worth $8,000 and you trade it in, you finance $8,000 less. However, if you owe more on your current car than it\'s worth (being "underwater"), the negative equity may be rolled into your new loan, increasing what you borrow.' },
  { q:'Should I choose 48-month vs 72-month loan term?', a:'Shorter terms mean higher monthly payments but less total interest. A 48-month loan at 6% on $25,000 costs $1,572 in interest. The same loan over 72 months costs $2,375 — $800 more for the privilege of lower payments. Only choose longer terms if cash flow is tight; pay them off early if possible.' },
  { q:'What is the total cost of ownership vs loan cost?', a:'Your loan cost is just one part. Total cost of ownership includes: loan interest, insurance (~$1,500/year), maintenance (~$1,000/year), fuel (~$2,000/year), registration fees, and depreciation. A "cheaper" car with high insurance or fuel costs may cost more long-term than a "pricier" efficient vehicle.' },
]
const GLOSSARY = [
  { term:'Principal',       def:'The loan amount — vehicle price minus down payment and trade-in value.' },
  { term:'Trade-In Value',  def:'What the dealer gives you for your current car — reduces the amount you need to finance.' },
  { term:'Down Payment',    def:'Cash paid upfront — directly reduces your loan amount and monthly payment.' },
  { term:'Loan Term',       def:'Duration of the loan in months. Shorter terms = higher payments but less total interest.' },
  { term:'APR',             def:'Annual Percentage Rate — the yearly cost of the loan including interest and fees.' },
  { term:'Negative Equity', def:'When you owe more on your car than it\'s currently worth — also called being "underwater".' },
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

export default function AutoLoan({ meta, category }) {
  const [price,setPrice]=useState(28000)
  const [down,setDown]=useState(3000)
  const [tradeIn,setTradeIn]=useState(0)
  const [rate,setRate]=useState(5.9)
  const [months,setMonths]=useState(60)
  const [currency,setCurrency]=useState(CURRENCIES[0])
  const [openFaq,setOpenFaq]=useState(null)
  const calcRef=useRef(null)
  const sym=currency.symbol
  const catColor=category?.color||'#6366f1'

  const loanAmt = Math.max(0, price - down - tradeIn)
  const mr = rate/100/12
  const emi = mr===0 ? loanAmt/months : loanAmt*mr*Math.pow(1+mr,months)/(Math.pow(1+mr,months)-1)
  const totalPaid = emi*months
  const totalInt  = totalPaid - loanAmt
  const downPct   = price > 0 ? ((down+tradeIn)/price*100).toFixed(1) : 0

  const hint = `Your ${fmt(price,sym)} car with ${fmt(down+tradeIn,sym)} down (${downPct}%) requires a ${fmt(loanAmt,sym)} loan. Monthly payment: ${fmt(emi,sym)} over ${months} months. Total interest: ${fmt(totalInt,sym)}.`

  function applyExample(ex){setPrice(ex.price);setDown(ex.down);setTradeIn(ex.tradeIn);setRate(ex.rate);setMonths(ex.months);setTimeout(()=>calcRef.current?.scrollIntoView({behavior:'smooth',block:'start'}),50)}

  return (
    <div style={{display:'flex',flexDirection:'column',gap:24}}>
      <div ref={calcRef} style={{scrollMarginTop:80}}>
        <CalcShell
          left={<>
            <div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:16,paddingBottom:8,borderBottom:'0.5px solid var(--border)'}}>Vehicle & Loan Details</div>
            <CurrencyDropdown currency={currency} setCurrency={setCurrency} catColor={catColor} />
            <FieldInput label="Vehicle Price" hint="Purchase price" value={price} onChange={setPrice} prefix={sym} min={1} catColor={catColor} />
            <FieldInput label="Down Payment" hint="Cash paid upfront" value={down} onChange={setDown} prefix={sym} min={0} catColor={catColor} />
            <FieldInput label="Trade-In Value" hint="Value of current car (0 if none)" value={tradeIn} onChange={setTradeIn} prefix={sym} min={0} catColor={catColor} />
            <FieldInput label="Annual Interest Rate" hint="APR" value={rate} onChange={setRate} suffix="%" min={0} max={30} catColor={catColor} />

            {/* Loan term toggle */}
            <div style={{marginBottom:14}}>
              <div style={{fontSize:12.5,fontWeight:600,color:'var(--text)',marginBottom:8,fontFamily:"'DM Sans',sans-serif"}}>Loan Term</div>
              <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                {[24,36,48,60,72,84].map(m=>(
                  <button key={m} onClick={()=>setMonths(m)} style={{padding:'7px 14px',borderRadius:20,fontSize:11,fontWeight:500,border:'1.5px solid',borderColor:months===m?catColor:'var(--border)',background:months===m?catColor:'var(--bg-raised)',color:months===m?'#fff':'var(--text-2)',cursor:'pointer',transition:'all .12s'}}>{m} mo</button>
                ))}
              </div>
            </div>

            <div style={{display:'flex',gap:10}}>
              <button style={{flex:1,padding:13,borderRadius:10,border:'none',background:catColor,color:'#fff',fontSize:14,fontWeight:700,cursor:'pointer'}} onMouseEnter={e=>e.currentTarget.style.opacity='.85'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>Calculate →</button>
              <button onClick={()=>{setPrice(28000);setDown(3000);setTradeIn(0);setRate(5.9);setMonths(60)}} style={{padding:'13px 18px',borderRadius:10,border:'1.5px solid var(--border-2)',background:'var(--bg-raised)',color:'var(--text-2)',fontSize:13,fontWeight:500,cursor:'pointer'}} onMouseEnter={e=>{e.currentTarget.style.borderColor='#ef4444';e.currentTarget.style.color='#ef4444'}} onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border-2)';e.currentTarget.style.color='var(--text-2)'}}>Reset</button>
            </div>
          </>}
          right={<>
            <ResultHero label="Monthly Payment" value={Math.round(emi)} formatter={n=>sym+Math.round(Math.max(0,n)).toLocaleString()} sub={`Over ${months} months at ${rate}% APR`} color={catColor} />
            <BreakdownTable title="Loan Summary" rows={[
              {label:'Vehicle Price',   value:fmt(price,sym)},
              {label:'Down Payment',    value:fmt(down,sym),       color:'#10b981'},
              {label:'Trade-In Value',  value:fmt(tradeIn,sym),    color:'#10b981'},
              {label:'Loan Amount',     value:fmt(loanAmt,sym),    color:catColor},
              {label:'Total Interest',  value:fmt(totalInt,sym),   color:'#ef4444'},
              {label:'Total Cost',      value:fmt(down+tradeIn+totalPaid,sym), color:catColor, bold:true, highlight:true},
            ]} />
            <AIHintCard hint={hint} />
          </>}
        />
      </div>

      
      <Section title="Formula Explained" subtitle="The math behind your car loan payment">
        <div style={{background:'var(--bg-raised)',borderRadius:10,padding:'14px 16px',marginBottom:14,fontFamily:'monospace',fontSize:13,color:catColor,fontWeight:600,overflowX:'auto',whiteSpace:'nowrap'}}>
          EMI = P × r × (1+r)^n / ((1+r)^n − 1)
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:14}}>
          {[['EMI','Monthly car loan payment'],['P','Loan = Price − Down − Trade-in'],['r','Monthly rate = APR ÷ 12 ÷ 100'],['n','Total months of loan term']].map(([s,m])=>(
            <div key={s} style={{display:'flex',gap:10,padding:'8px 10px',background:'var(--bg-raised)',borderRadius:8}}>
              <span style={{fontSize:13,fontWeight:800,color:catColor,fontFamily:'monospace',minWidth:24,flexShrink:0}}>{s}</span>
              <span style={{fontSize:11.5,color:'var(--text-2)',lineHeight:1.5}}>{m}</span>
            </div>
          ))}
        </div>
        <p style={{fontSize:12,color:'var(--text-2)',lineHeight:1.75,margin:0}}>Your down payment and trade-in directly reduce the loan principal — every dollar reduces both the monthly payment and total interest. A larger down payment also means a lower loan-to-value ratio, which can qualify you for better interest rates from lenders.</p>
      </Section>

      <Section title="Term Comparison" subtitle="How loan term affects monthly payment and total cost">
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontFamily:"'DM Sans',sans-serif"}}>
            <thead><tr>{['Term','Monthly Payment','Total Interest','Total Cost'].map((h,i)=>(
              <th key={h} style={{padding:'9px 12px',fontSize:11,fontWeight:700,color:'var(--text-3)',textAlign:i===0?'left':'right',borderBottom:'1px solid var(--border)',fontFamily:"'Space Grotesk',sans-serif"}}>{h}</th>
            ))}</tr></thead>
            <tbody>
              {[24,36,48,60,72,84].map((m,i)=>{
                const r=mr
                const e=r===0?loanAmt/m:loanAmt*r*Math.pow(1+r,m)/(Math.pow(1+r,m)-1)
                const ti=e*m-loanAmt
                const isCurrent=m===months
                return (
                  <tr key={m} style={{background:isCurrent?catColor+'08':'transparent'}}>
                    <td style={{padding:'9px 12px',fontSize:12,fontWeight:isCurrent?700:400,color:isCurrent?catColor:'var(--text)'}}>{m} months {isCurrent&&'✓'}</td>
                    <td style={{padding:'9px 12px',fontSize:12,fontWeight:700,color:'var(--text)',textAlign:'right'}}>{fmt(e,sym)}/mo</td>
                    <td style={{padding:'9px 12px',fontSize:12,color:'#ef4444',textAlign:'right'}}>{fmt(ti,sym)}</td>
                    <td style={{padding:'9px 12px',fontSize:12,color:'var(--text)',textAlign:'right'}}>{fmt(down+tradeIn+e*m,sym)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Real World Examples" subtitle="Click any example to fill the calculator instantly">
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
          {EXAMPLES.map((ex,i)=>(
            <button key={i} onClick={()=>applyExample(ex)} style={{padding:14,borderRadius:10,border:'1.5px solid var(--border)',background:'var(--bg-raised)',cursor:'pointer',textAlign:'left',transition:'all .15s'}} onMouseEnter={e=>{e.currentTarget.style.borderColor=catColor;e.currentTarget.style.background=catColor+'10'}} onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.background='var(--bg-raised)'}}>
              <div style={{fontSize:13,fontWeight:700,color:'var(--text)',marginBottom:4}}>{ex.title}</div>
              <div style={{fontSize:11,color:'var(--text-3)',marginBottom:10,lineHeight:1.4}}>{ex.desc}</div>
              {[['Price',`${sym}${ex.price.toLocaleString()}`],['Down',`${sym}${ex.down.toLocaleString()}`],['Rate',`${ex.rate}%`],['Term',`${ex.months} mo`]].map(([k,v])=>(
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

      <Section title="Key Terms" subtitle="Auto loan terminology — click any term">
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:8}}>
          {GLOSSARY.map((item,i)=><GlossaryTerm key={i} term={item.term} def={item.def} catColor={catColor} />)}
        </div>
      </Section>

      <Section title="Frequently Asked Questions" subtitle="Everything about auto loans">
        {FAQ.map((item,i)=><AccordionItem key={i} q={item.q} a={item.a} isOpen={openFaq===i} onToggle={()=>setOpenFaq(openFaq===i?null:i)} catColor={catColor} />)}
      </Section>
    </div>
  )
}
