import { useState, useEffect, useRef } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import ResultHero from '../../components/calculator/ResultHero'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'
import CurrencyDropdown, { CURRENCIES } from '../../components/calculator/CurrencyDropdown'

const fmt = (n,sym='$') => sym+Math.round(Math.max(0,n)).toLocaleString()

const EXAMPLES = [
  { title:'Small Balance',   desc:'$2,000 at 19.99%, paying $60/mo',   balance:2000,  rate:19.99, payment:60  },
  { title:'Average Card',    desc:'$6,000 at 22%, paying $150/mo',     balance:6000,  rate:22,    payment:150 },
  { title:'High Balance',    desc:'$15,000 at 24.99%, paying $400/mo', balance:15000, rate:24.99, payment:400 },
]
const FAQ = [
  { q:'What happens if I only pay the minimum?', a:'Minimum payments are typically 1-3% of your balance or $25, whichever is higher. Because credit card rates are very high (often 20-30%), minimum payments barely cover the interest. A $6,000 balance at 22% with $150/month minimum could take 5+ years to pay off and cost more than $3,000 in interest.' },
  { q:'What is the avalanche vs snowball method?', a:'Avalanche: Pay minimums on all cards, put extra money on the highest-rate card first. Saves the most money in interest. Snowball: Pay minimums on all cards, put extra on the smallest balance first. Provides psychological wins by eliminating cards faster. Avalanche is mathematically optimal; snowball is better for motivation.' },
  { q:'Should I transfer my balance to a 0% card?', a:'A 0% balance transfer can save significant interest during the promotional period (typically 12-21 months). Watch for transfer fees (usually 3-5%) and ensure you can pay off the balance before the promo period ends — rates typically jump to 20%+ afterward. Good option if you have a clear payoff plan.' },
  { q:'How does a credit card charge interest?', a:'Credit cards use the Daily Periodic Rate (DPR) — the annual rate divided by 365. Interest compounds daily on your outstanding balance. If you don\'t pay in full each month, interest is charged on the average daily balance. This is why carrying a balance even for one month can be costly.' },
]
const GLOSSARY = [
  { term:'APR',              def:'Annual Percentage Rate — the yearly interest rate charged on carried balances.' },
  { term:'Minimum Payment',  def:'The smallest amount you can pay without penalty — usually 1-3% of the balance.' },
  { term:'Balance Transfer',  def:'Moving debt from one card to another, often to take advantage of a lower rate.' },
  { term:'Daily Periodic Rate',def:'Your APR divided by 365 — the rate applied to your balance each day.' },
  { term:'Credit Utilization',def:'Your balance divided by your credit limit. Keeping it below 30% protects your credit score.' },
  { term:'Avalanche Method',  def:'Payoff strategy: pay minimums on all debts, maximize payments on the highest-rate debt first.' },
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

function simulate(balance,rate,payment) {
  const mr=rate/100/12
  let bal=balance,months=0,totalInt=0
  while(bal>0&&months<600) {
    const intCharge=bal*mr
    if(payment<=intCharge)return{months:Infinity,totalInt:Infinity}
    totalInt+=intCharge
    bal=Math.max(0,bal-(payment-intCharge))
    months++
  }
  return{months,totalInt}
}

export default function CreditCardPayoff({ meta, category }) {
  const [balance,setBalance]=useState(6000)
  const [rate,setRate]=useState(22)
  const [payment,setPayment]=useState(150)
  const [currency,setCurrency]=useState(CURRENCIES[0])
  const [openFaq,setOpenFaq]=useState(null)
  const calcRef=useRef(null)
  const sym=currency.symbol
  const catColor=category?.color||'#6366f1'

  const mr=rate/100/12
  const minPayment=Math.max(25,balance*0.02)
  const result=simulate(balance,rate,payment)
  const minResult=simulate(balance,rate,minPayment)

  // Payment needed to pay off in specific timeframes
  function pmtForMonths(m) {
    if(mr===0)return balance/m
    return balance*mr*Math.pow(1+mr,m)/(Math.pow(1+mr,m)-1)
  }

  const hint = result.months===Infinity
    ? `Your payment of ${sym}${payment}/month doesn't cover the interest charges. Increase your payment above ${sym}${Math.ceil(balance*mr+1)}/month.`
    : `At ${sym}${payment}/month you'll pay off in ${Math.ceil(result.months/12)} years and pay ${fmt(result.totalInt,sym)} in interest. Minimum payments would take ${minResult.months===Infinity?'forever':(minResult.months/12).toFixed(1)+' years'}.`

  function applyExample(ex){setBalance(ex.balance);setRate(ex.rate);setPayment(ex.payment);setTimeout(()=>calcRef.current?.scrollIntoView({behavior:'smooth',block:'start'}),50)}

  return (
    <div style={{display:'flex',flexDirection:'column',gap:24}}>
      <div ref={calcRef} style={{scrollMarginTop:80}}>
        <CalcShell
          left={<>
            <div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:16,paddingBottom:8,borderBottom:'0.5px solid var(--border)'}}>Credit Card Details</div>
            <CurrencyDropdown currency={currency} setCurrency={setCurrency} catColor={catColor} />
            <FieldInput label="Current Balance" hint="Amount owed" value={balance} onChange={setBalance} prefix={sym} min={1} catColor={catColor} />
            <FieldInput label="Annual Interest Rate (APR)" hint="Usually 18-30%" value={rate} onChange={setRate} suffix="%" min={0.1} max={60} catColor={catColor} />
            <FieldInput label="Monthly Payment" hint="Amount you plan to pay" value={payment} onChange={setPayment} prefix={sym} min={1} catColor={catColor} />

            {/* Minimum payment warning */}
            <div style={{padding:'10px 12px',borderRadius:8,marginBottom:14,background:'#ef444410',border:'1px solid #ef444430'}}>
              <div style={{fontSize:11,fontWeight:600,color:'#ef4444',marginBottom:2}}>⚠️ Minimum payment: {sym}{Math.round(minPayment)}/mo</div>
              <div style={{fontSize:11,color:'var(--text-2)',lineHeight:1.5}}>
                Paying only the minimum would take {minResult.months===Infinity?'forever to pay off — you\'re treading water!':`${(minResult.months/12).toFixed(1)} years and cost ${fmt(minResult.totalInt,sym)} in interest.`}
              </div>
            </div>

            <div style={{display:'flex',gap:10}}>
              <button style={{flex:1,padding:13,borderRadius:10,border:'none',background:catColor,color:'#fff',fontSize:14,fontWeight:700,cursor:'pointer'}} onMouseEnter={e=>e.currentTarget.style.opacity='.85'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>Calculate →</button>
              <button onClick={()=>{setBalance(6000);setRate(22);setPayment(150)}} style={{padding:'13px 18px',borderRadius:10,border:'1.5px solid var(--border-2)',background:'var(--bg-raised)',color:'var(--text-2)',fontSize:13,fontWeight:500,cursor:'pointer'}} onMouseEnter={e=>{e.currentTarget.style.borderColor='#ef4444';e.currentTarget.style.color='#ef4444'}} onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border-2)';e.currentTarget.style.color='var(--text-2)'}}>Reset</button>
            </div>
          </>}
          right={<>
            <ResultHero label="Payoff Time" value={result.months===Infinity?0:Math.ceil(result.months/12)} formatter={n=>result.months===Infinity?'Never':n+' years'} sub={result.months===Infinity?'Payment too low!':result.months+' months total'} color={result.months===Infinity?'#ef4444':catColor} />
            <BreakdownTable title="Payoff Summary" rows={[
              {label:'Current Balance',    value:fmt(balance,sym)},
              {label:'Monthly Payment',    value:fmt(payment,sym),          color:catColor},
              {label:'Total Interest',     value:result.months===Infinity?'∞':fmt(result.totalInt,sym), color:'#ef4444'},
              {label:'Total Paid',         value:result.months===Infinity?'∞':fmt(result.totalInt+balance,sym), color:catColor, bold:true, highlight:true},
            ]} />
            <AIHintCard hint={hint} />
          </>}
        />
      </div>

      {/* Payoff goal table */}
      
      <Section title="Formula Explained" subtitle="How credit card interest works">
        <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:14}}>
          {[{label:'Daily Periodic Rate',formula:'DPR = APR ÷ 365'},{label:'Monthly Interest Charge',formula:'Interest = Balance × (APR ÷ 12 ÷ 100)'},{label:'Minimum Payment',formula:'Min Payment = max($25, Balance × 2%)'}].map(f=>(
            <div key={f.label}>
              <div style={{fontSize:10,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.05em',marginBottom:4}}>{f.label}</div>
              <div style={{background:'var(--bg-raised)',borderRadius:8,padding:'10px 14px',fontFamily:'monospace',fontSize:12,color:catColor,fontWeight:600,overflowX:'auto',whiteSpace:'nowrap'}}>{f.formula}</div>
            </div>
          ))}
        </div>
        <p style={{fontSize:12,color:'var(--text-2)',lineHeight:1.75,margin:0}}>Credit card interest compounds monthly. If you carry a $5,000 balance at 22% APR, you owe $91.67 in interest the first month alone. Paying only the minimum (~$100) barely covers interest, leaving $91.67 unpaid — which then accrues more interest. This is why minimum payments trap people in debt for years.</p>
      </Section>

      <Section title="How Much to Pay for Your Goal?" subtitle="Required monthly payment to pay off in a specific timeframe">
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontFamily:"'DM Sans',sans-serif"}}>
            <thead><tr>{['Goal','Monthly Payment','Total Interest','Total Cost'].map((h,i)=>(
              <th key={h} style={{padding:'9px 12px',fontSize:11,fontWeight:700,color:'var(--text-3)',textAlign:i===0?'left':'right',borderBottom:'1px solid var(--border)',fontFamily:"'Space Grotesk',sans-serif"}}>{h}</th>
            ))}</tr></thead>
            <tbody>
              {[6,12,18,24,36,48].map((m,i)=>{
                const pmt=pmtForMonths(m)
                const totalInt=pmt*m-balance
                return (
                  <tr key={m} style={{background:i%2===0?'var(--bg-raised)':'transparent'}}>
                    <td style={{padding:'9px 12px',fontSize:12,fontWeight:600,color:catColor}}>{m<12?`${m} months`:`${m/12} year${m/12>1?'s':''}`}</td>
                    <td style={{padding:'9px 12px',fontSize:12,fontWeight:700,color:'var(--text)',textAlign:'right'}}>{sym}{Math.ceil(pmt).toLocaleString()}/mo</td>
                    <td style={{padding:'9px 12px',fontSize:12,color:'#ef4444',textAlign:'right'}}>{fmt(totalInt,sym)}</td>
                    <td style={{padding:'9px 12px',fontSize:12,color:'var(--text)',textAlign:'right'}}>{fmt(balance+totalInt,sym)}</td>
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
              {[['Balance',`${sym}${ex.balance.toLocaleString()}`],['APR',`${ex.rate}%`],['Payment',`${sym}${ex.payment}/mo`]].map(([k,v])=>(
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

      <Section title="Key Terms" subtitle="Credit card terminology — click any term">
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:8}}>
          {GLOSSARY.map((item,i)=><GlossaryTerm key={i} term={item.term} def={item.def} catColor={catColor} />)}
        </div>
      </Section>

      <Section title="Frequently Asked Questions" subtitle="Everything about paying off credit card debt">
        {FAQ.map((item,i)=><AccordionItem key={i} q={item.q} a={item.a} isOpen={openFaq===i} onToggle={()=>setOpenFaq(openFaq===i?null:i)} catColor={catColor} />)}
      </Section>
    </div>
  )
}
