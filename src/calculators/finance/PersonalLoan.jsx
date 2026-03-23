import { useState, useEffect, useRef } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import ResultHero from '../../components/calculator/ResultHero'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'
import CurrencyDropdown, { CURRENCIES } from '../../components/calculator/CurrencyDropdown'

const fmt = (n,sym='$') => sym+Math.round(Math.max(0,n)).toLocaleString()

const EXAMPLES = [
  { title:'Home Renovation', desc:'Kitchen remodel, good credit',    amount:20000, rate:9.5,  months:48, fee:1.5 },
  { title:'Debt Consolidation',desc:'Consolidate credit card debt', amount:15000, rate:11,   months:36, fee:2   },
  { title:'Emergency Fund',   desc:'Medical expense, fair credit',   amount:5000,  rate:14.5, months:24, fee:3   },
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

const FAQ = [
  { q:'What is a personal loan origination fee?', a:'An origination fee is a one-time charge by the lender for processing your loan, typically 1-8% of the loan amount. It\'s often deducted from your disbursement — if you borrow $10,000 with a 3% fee, you receive $9,700 but repay the full $10,000. Always factor origination fees into your true cost comparison.' },
  { q:'What credit score do I need for a personal loan?', a:'Most lenders require 600+ for approval. For the best rates, aim for 700+. With 750+, you\'ll qualify for rates as low as 7-9%. With 600-649, expect 20%+ rates. Below 580, consider secured loans or credit unions. Check your rate with a soft inquiry (no credit impact) before formally applying.' },
  { q:'Personal loan vs credit card: which is better?', a:'Personal loans offer lower rates (8-15% vs 18-30%) and fixed monthly payments — better for large expenses you need time to pay off. Credit cards offer flexibility, rewards, and 0% intro periods — better for smaller, short-term needs. For consolidating credit card debt, a personal loan almost always makes sense if you can qualify for a lower rate.' },
  { q:'Can I pay off a personal loan early?', a:'Most personal loans allow early payoff. Check if there\'s a prepayment penalty (typically 1-2% of remaining balance). Even with a penalty, early payoff often saves money on interest. If no penalty, extra payments directly reduce principal and save significant interest on the remaining balance.' },
]
const GLOSSARY = [
  { term:'Origination Fee',   def:'One-time upfront fee charged by the lender — typically 1-8% of the loan amount.' },
  { term:'APR',               def:'Annual Percentage Rate — includes both the interest rate and fees for a true cost comparison.' },
  { term:'Unsecured Loan',    def:'A personal loan with no collateral required — approved based on creditworthiness.' },
  { term:'Debt-to-Income',    def:'Your total monthly debt payments divided by gross income. Lenders want this below 36-43%.' },
  { term:'Prepayment Penalty',def:'A fee for paying off your loan early — not all lenders charge this; ask before signing.' },
]

export default function PersonalLoan({ meta, category }) {
  const [amount,setAmount]=useState(15000)
  const [rate,setRate]=useState(11)
  const [months,setMonths]=useState(36)
  const [fee,setFee]=useState(2)
  const [currency,setCurrency]=useState(CURRENCIES[0])
  const [openFaq,setOpenFaq]=useState(null)
  const calcRef=useRef(null)
  const sym=currency.symbol
  const catColor=category?.color||'#6366f1'

  const originationFee = amount * fee / 100
  const netAmount      = amount - originationFee
  const mr             = rate/100/12
  const emi            = mr===0?amount/months:amount*mr*Math.pow(1+mr,months)/(Math.pow(1+mr,months)-1)
  const totalPaid      = emi*months
  const totalInt       = totalPaid - amount
  const trueCost       = totalPaid + originationFee
  // True APR approximation (Newton-Raphson on net amount)
  let trueRate = rate/100/12
  for(let i=0;i<100;i++){
    const f=netAmount-emi*(1-Math.pow(1+trueRate,-months))/trueRate
    const df=emi*(-months*Math.pow(1+trueRate,-months-1)/trueRate+(1-Math.pow(1+trueRate,-months))/(trueRate*trueRate))
    const r2=trueRate-f/df
    if(Math.abs(r2-trueRate)<1e-8)break
    trueRate=r2
  }
  const trueAPR = trueRate * 12 * 100

  const hint = `Monthly payment: ${fmt(emi,sym)}. Total interest: ${fmt(totalInt,sym)}. With ${fee}% origination fee (${fmt(originationFee,sym)}), true APR is ~${trueAPR.toFixed(2)}% vs stated ${rate}%.`

  function applyExample(ex){setAmount(ex.amount);setRate(ex.rate);setMonths(ex.months);setFee(ex.fee);setTimeout(()=>calcRef.current?.scrollIntoView({behavior:'smooth',block:'start'}),50)}

  return (
    <div style={{display:'flex',flexDirection:'column',gap:24}}>
      <div ref={calcRef} style={{scrollMarginTop:80}}>
        <CalcShell
          left={<>
            <div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:16,paddingBottom:8,borderBottom:'0.5px solid var(--border)'}}>Loan Details</div>
            <CurrencyDropdown currency={currency} setCurrency={setCurrency} catColor={catColor} />
            <FieldInput label="Loan Amount" hint="Amount you want to borrow" value={amount} onChange={setAmount} prefix={sym} min={500} catColor={catColor} />
            <FieldInput label="Annual Interest Rate" hint="APR offered by lender" value={rate} onChange={setRate} suffix="%" min={1} max={60} catColor={catColor} />
            <FieldInput label="Loan Term" hint="Months" value={months} onChange={setMonths} suffix="mo" min={6} max={84} catColor={catColor} />
            <FieldInput label="Origination Fee" hint="% of loan amount (0 if none)" value={fee} onChange={setFee} suffix="%" min={0} max={10} catColor={catColor} />

            {/* True APR preview */}
            <div style={{padding:'10px 12px',borderRadius:8,marginBottom:14,background:catColor+'0d',border:`1px solid ${catColor}25`}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:2}}>
                <span style={{fontSize:11,color:'var(--text-2)'}}>True APR (with fee)</span>
                <span style={{fontSize:15,fontWeight:800,color:catColor,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{trueAPR.toFixed(2)}%</span>
              </div>
              <div style={{fontSize:10,color:'var(--text-3)'}}>You receive {fmt(netAmount,sym)} but repay {fmt(amount,sym)}</div>
            </div>

            <div style={{display:'flex',gap:10}}>
              <button style={{flex:1,padding:13,borderRadius:10,border:'none',background:catColor,color:'#fff',fontSize:14,fontWeight:700,cursor:'pointer'}} onMouseEnter={e=>e.currentTarget.style.opacity='.85'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>Calculate →</button>
              <button onClick={()=>{setAmount(15000);setRate(11);setMonths(36);setFee(2)}} style={{padding:'13px 18px',borderRadius:10,border:'1.5px solid var(--border-2)',background:'var(--bg-raised)',color:'var(--text-2)',fontSize:13,fontWeight:500,cursor:'pointer'}} onMouseEnter={e=>{e.currentTarget.style.borderColor='#ef4444';e.currentTarget.style.color='#ef4444'}} onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border-2)';e.currentTarget.style.color='var(--text-2)'}}>Reset</button>
            </div>
          </>}
          right={<>
            <ResultHero label="Monthly Payment" value={Math.round(emi)} formatter={n=>sym+Math.round(Math.max(0,n)).toLocaleString()} sub={`${months} months at ${rate}% APR`} color={catColor} />
            <BreakdownTable title="Loan Summary" rows={[
              {label:'Loan Amount',      value:fmt(amount,sym),          color:catColor},
              {label:'Origination Fee',  value:fmt(originationFee,sym),  color:'#f59e0b'},
              {label:'Net Disbursed',    value:fmt(netAmount,sym),        color:'#10b981'},
              {label:'Total Interest',   value:fmt(totalInt,sym),         color:'#ef4444'},
              {label:'Total Cost',       value:fmt(trueCost,sym),         color:catColor, bold:true, highlight:true},
              {label:'True APR',         value:`${trueAPR.toFixed(2)}%`,  color:'#f59e0b'},
            ]} />
            <AIHintCard hint={hint} />
          </>}
        />
      </div>

      
      <Section title="Formula Explained" subtitle="Monthly payment and true APR calculation">
        <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:14}}>
          {[{label:'Monthly Payment',formula:'EMI = P × r × (1+r)^n / ((1+r)^n − 1)'},{label:'True APR (with fees)',formula:'Solve: Net Amount = EMI × (1-(1+r)^-n) / r'}].map(f=>(
            <div key={f.label}>
              <div style={{fontSize:10,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.05em',marginBottom:4}}>{f.label}</div>
              <div style={{background:'var(--bg-raised)',borderRadius:8,padding:'10px 14px',fontFamily:'monospace',fontSize:12,color:catColor,fontWeight:600,overflowX:'auto',whiteSpace:'nowrap'}}>{f.formula}</div>
            </div>
          ))}
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:14}}>
          {[['P','Loan amount (full amount borrowed)'],['r','Monthly rate = Annual rate ÷ 12 ÷ 100'],['n','Number of monthly payments'],['Net Amt','Amount actually received after fees']].map(([s,m])=>(
            <div key={s} style={{display:'flex',gap:10,padding:'8px 10px',background:'var(--bg-raised)',borderRadius:8}}>
              <span style={{fontSize:13,fontWeight:800,color:catColor,fontFamily:'monospace',minWidth:56,flexShrink:0}}>{s}</span>
              <span style={{fontSize:11.5,color:'var(--text-2)',lineHeight:1.5}}>{m}</span>
            </div>
          ))}
        </div>
        <p style={{fontSize:12,color:'var(--text-2)',lineHeight:1.75,margin:0}}>The origination fee is deducted upfront — you receive less than you borrow but repay the full amount. This makes the true APR higher than the stated rate. Always compare loans using APR (which includes fees), not just the interest rate. A lower rate with a high origination fee may cost more than a slightly higher rate with no fee.</p>
      </Section>

      <Section title="Real World Examples" subtitle="Click any example to fill the calculator instantly">
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
          {EXAMPLES.map((ex,i)=>(
            <button key={i} onClick={()=>applyExample(ex)} style={{padding:14,borderRadius:10,border:'1.5px solid var(--border)',background:'var(--bg-raised)',cursor:'pointer',textAlign:'left',transition:'all .15s'}} onMouseEnter={e=>{e.currentTarget.style.borderColor=catColor;e.currentTarget.style.background=catColor+'10'}} onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.background='var(--bg-raised)'}}>
              <div style={{fontSize:13,fontWeight:700,color:'var(--text)',marginBottom:4}}>{ex.title}</div>
              <div style={{fontSize:11,color:'var(--text-3)',marginBottom:10,lineHeight:1.4}}>{ex.desc}</div>
              {[['Amount',`${sym}${ex.amount.toLocaleString()}`],['Rate',`${ex.rate}%`],['Term',`${ex.months} mo`],['Orig. Fee',`${ex.fee}%`]].map(([k,v])=>(
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

      <Section title="Key Terms" subtitle="Personal loan terminology — click any term">
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:8}}>
          {GLOSSARY.map((item,i)=><GlossaryTerm key={i} term={item.term} def={item.def} catColor={catColor} />)}
        </div>
      </Section>

      <Section title="Frequently Asked Questions" subtitle="Everything about personal loans">
        {FAQ.map((item,i)=><AccordionItem key={i} q={item.q} a={item.a} isOpen={openFaq===i} onToggle={()=>setOpenFaq(openFaq===i?null:i)} catColor={catColor} />)}
      </Section>
    </div>
  )
}
