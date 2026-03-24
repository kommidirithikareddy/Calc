import { useState, useEffect, useRef } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import ResultHero from '../../components/calculator/ResultHero'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'
import CurrencyDropdown, { CURRENCIES } from '../../components/calculator/CurrencyDropdown'

const fmt = (n,sym='$') => sym+Math.round(Math.max(0,n)).toLocaleString()

const EXAMPLES = [
  { title:'Economy Lease',  desc:'Compact car, 36-month lease',  msrp:28000,residual:55,moneyFactor:0.00125,months:36,down:2000,fees:700  },
  { title:'Luxury Lease',   desc:'Luxury sedan, 36-month lease', msrp:55000,residual:52,moneyFactor:0.00180,months:36,down:3000,fees:1200 },
  { title:'SUV Lease',      desc:'Midsize SUV, 39-month lease',  msrp:42000,residual:50,moneyFactor:0.00150,months:39,down:2500,fees:900  },
]
const FAQ = [
  { q:'What is a money factor?', a:'Money factor is the lease equivalent of an interest rate. Multiply it by 2400 to get the approximate APR. A money factor of 0.00125 equals roughly 3% APR. Dealers sometimes inflate money factors — you can negotiate it down to the "buy rate" set by the manufacturer\'s finance arm (e.g. BMW Financial Services).' },
  { q:'What is residual value?', a:'Residual value is the car\'s projected worth at the end of the lease, expressed as a percentage of MSRP. A higher residual means lower monthly payments because you\'re paying for less depreciation. Residuals are set by the lessor (not negotiable) and vary by model and lease term.' },
  { q:'Should I lease or buy?', a:'Lease if: you like driving a new car every 3 years, you drive under 12,000-15,000 miles/year, you don\'t modify your car, and you want lower monthly payments. Buy if: you drive a lot, want to build equity, plan to keep the car long-term, or want freedom from mileage restrictions. Leasing costs more long-term but offers short-term flexibility.' },
  { q:'What happens at lease end?', a:'You have three options: return the car and lease/buy another, buy the car at the residual price, or walk away. If you\'ve exceeded mileage limits, you pay excess mileage fees (typically $0.15-0.30/mile). If the car is worth more than the residual, you can buy it and sell it — capturing the equity.' },
]
const GLOSSARY = [
  { term:'MSRP',            def:'Manufacturer\'s Suggested Retail Price — the sticker price. Negotiate this down before calculating lease payments.' },
  { term:'Capitalized Cost', def:'The negotiated selling price of the car — the basis for lease payment calculations.' },
  { term:'Residual Value',   def:'The car\'s projected value at lease end, set by the lessor. Higher residual = lower payments.' },
  { term:'Money Factor',     def:'Lease equivalent of interest rate. Multiply by 2,400 to convert to approximate APR.' },
  { term:'Depreciation Fee', def:'The portion of your lease payment covering the car\'s value lost during the lease.' },
  { term:'Finance Charge',   def:'The interest portion of your lease payment — money factor × (cap cost + residual value).' },
]

function FieldInput({label,hint,value,onChange,prefix,suffix,min=0,max,step=1,catColor='#6366f1'}) {
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

export default function AutoLease({ meta, category }) {
  const [msrp,setMsrp]=useState(28000)
  const [residualPct,setResidualPct]=useState(55)
  const [moneyFactor,setMoneyFactor]=useState(0.00125)
  const [months,setMonths]=useState(36)
  const [down,setDown]=useState(2000)
  const [fees,setFees]=useState(700)
  const [currency,setCurrency]=useState(CURRENCIES[0])
  const [openFaq,setOpenFaq]=useState(null)
  const calcRef=useRef(null)
  const sym=currency.symbol
  const catColor=category?.color||'#6366f1'

  const residualVal   = msrp * residualPct / 100
  const capCost       = msrp - down
  const depreciation  = (capCost - residualVal) / months
  const financeCharge = (capCost + residualVal) * moneyFactor
  const monthlyPayment = depreciation + financeCharge
  const totalLeaseCost = monthlyPayment * months + down + fees
  const approxAPR      = moneyFactor * 2400

  const hint = `Monthly lease: ${fmt(monthlyPayment,sym)}. Total cost over ${months} months: ${fmt(totalLeaseCost,sym)}. Money factor ${moneyFactor} ≈ ${approxAPR.toFixed(2)}% APR. Residual: ${fmt(residualVal,sym)} (${residualPct}% of MSRP).`

  function applyExample(ex){setMsrp(ex.msrp);setResidualPct(ex.residual);setMoneyFactor(ex.moneyFactor);setMonths(ex.months);setDown(ex.down);setFees(ex.fees);setTimeout(()=>calcRef.current?.scrollIntoView({behavior:'smooth',block:'start'}),50)}

  return (
    <div style={{display:'flex',flexDirection:'column',gap:24}}>
      <div ref={calcRef} style={{scrollMarginTop:80}}>
        <CalcShell
          left={<>
            <div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:16,paddingBottom:8,borderBottom:'0.5px solid var(--border)'}}>Lease Details</div>
            <CurrencyDropdown currency={currency} setCurrency={setCurrency} catColor={catColor} />
            <FieldInput label="Vehicle MSRP" hint="Sticker price" value={msrp} onChange={setMsrp} prefix={sym} min={1} catColor={catColor} />
            <FieldInput label="Residual Value" hint="% of MSRP at lease end" value={residualPct} onChange={setResidualPct} suffix="%" min={1} max={100} catColor={catColor} />
            <FieldInput label="Money Factor" hint="×2400 = approx APR" value={moneyFactor} onChange={setMoneyFactor} min={0} catColor={catColor} />
            <FieldInput label="Lease Term" hint="Months" value={months} onChange={setMonths} suffix="mo" min={12} max={60} catColor={catColor} />
            <FieldInput label="Down Payment (Cap Reduction)" hint="Upfront cash" value={down} onChange={setDown} prefix={sym} min={0} catColor={catColor} />
            <FieldInput label="Fees & Taxes" hint="Acquisition, doc fees etc." value={fees} onChange={setFees} prefix={sym} min={0} catColor={catColor} />
            <div style={{display:'flex',gap:10,marginTop:6}}>
              <button style={{flex:1,padding:13,borderRadius:10,border:'none',background:catColor,color:'#fff',fontSize:14,fontWeight:700,cursor:'pointer'}} onMouseEnter={e=>e.currentTarget.style.opacity='.85'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>Calculate →</button>
              <button onClick={()=>{setMsrp(28000);setResidualPct(55);setMoneyFactor(0.00125);setMonths(36);setDown(2000);setFees(700)}} style={{padding:'13px 18px',borderRadius:10,border:'1.5px solid var(--border-2)',background:'var(--bg-raised)',color:'var(--text-2)',fontSize:13,fontWeight:500,cursor:'pointer'}} onMouseEnter={e=>{e.currentTarget.style.borderColor='#ef4444';e.currentTarget.style.color='#ef4444'}} onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border-2)';e.currentTarget.style.color='var(--text-2)'}}>Reset</button>
            </div>
          </>}
          right={<>
            <ResultHero label="Monthly Lease Payment" value={Math.round(monthlyPayment)} formatter={n=>sym+Math.round(Math.max(0,n)).toLocaleString()} sub={`Over ${months} months, ${approxAPR.toFixed(2)}% APR equiv.`} color={catColor} />
            <BreakdownTable title="Lease Breakdown" rows={[
              {label:'Vehicle MSRP',      value:fmt(msrp,sym)},
              {label:'Residual Value',    value:`${fmt(residualVal,sym)} (${residualPct}%)`, color:'#10b981'},
              {label:'Depreciation/mo',   value:fmt(depreciation,sym), color:'var(--text-2)'},
              {label:'Finance Charge/mo', value:fmt(financeCharge,sym), color:'#ef4444'},
              {label:'Monthly Payment',   value:fmt(monthlyPayment,sym), color:catColor, bold:true, highlight:true},
              {label:'Total Lease Cost',  value:fmt(totalLeaseCost,sym), color:catColor},
            ]} />
            <AIHintCard hint={hint} />
          </>}
        />
      </div>

      
      <Section title="Formula Explained" subtitle="How monthly lease payments are calculated">
        <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:14}}>
          {[{label:'Depreciation Fee',formula:'(Cap Cost − Residual Value) ÷ Months'},{label:'Finance Charge',formula:'(Cap Cost + Residual Value) × Money Factor'},{label:'Monthly Payment',formula:'Depreciation Fee + Finance Charge'}].map(f=>(
            <div key={f.label}>
              <div style={{fontSize:10,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.05em',marginBottom:4}}>{f.label}</div>
              <div style={{background:'var(--bg-raised)',borderRadius:8,padding:'10px 14px',fontFamily:'monospace',fontSize:12,color:catColor,fontWeight:600,overflowX:'auto',whiteSpace:'nowrap'}}>{f.formula}</div>
            </div>
          ))}
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:14}}>
          {[['Cap Cost','Negotiated selling price minus any cap reductions'],['Residual','Cars value at lease end — set by manufacturer'],['Money Factor','Lease interest rate ÷ 2400 = approx APR'],['Depreciation','Value lost during lease — the bulk of your payment']].map(([s,m])=>(
            <div key={s} style={{display:'flex',gap:10,padding:'8px 10px',background:'var(--bg-raised)',borderRadius:8}}>
              <span style={{fontSize:11,fontWeight:800,color:catColor,fontFamily:'monospace',minWidth:80,flexShrink:0}}>{s}</span>
              <span style={{fontSize:11.5,color:'var(--text-2)',lineHeight:1.5}}>{m}</span>
            </div>
          ))}
        </div>
        <p style={{fontSize:12,color:'var(--text-2)',lineHeight:1.75,margin:0}}>You only pay for the portion of the car's value you use during the lease. A car with a high residual value (like many luxury vehicles) has lower monthly payments because you’re financing less depreciation. The money factor is negotiable down to the "buy rate" — ask the dealer for the base rate.</p>
      </Section>

      <Section title="Lease vs Buy Comparison" subtitle="Total cost of leasing repeatedly vs buying and keeping">
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
          <div style={{padding:'14px',borderRadius:10,border:`1.5px solid ${catColor}`,background:catColor+'0d'}}>
            <div style={{fontSize:13,fontWeight:700,color:catColor,marginBottom:8,fontFamily:"'Space Grotesk',sans-serif"}}>🔄 Lease (3 cycles)</div>
            {[['Monthly payment',`${sym}${Math.round(monthlyPayment)}`],['Per cycle cost',fmt(totalLeaseCost,sym)],['9-year total',fmt(totalLeaseCost*3,sym)],['Asset at end','$0']].map(([k,v])=>(
              <div key={k} style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                <span style={{fontSize:11,color:'var(--text-3)'}}>{k}</span>
                <span style={{fontSize:11,fontWeight:600,color:catColor}}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{padding:'14px',borderRadius:10,border:'1px solid var(--border)',background:'var(--bg-raised)'}}>
            <div style={{fontSize:13,fontWeight:700,color:'var(--text)',marginBottom:8,fontFamily:"'Space Grotesk',sans-serif"}}>🚗 Buy & Keep (9 yrs)</div>
            {(() => {
              const loanAmt=msrp-down
              const mr=moneyFactor*2400/100/12
              const lMonths=months
              const emi=mr===0?loanAmt/lMonths:loanAmt*mr*Math.pow(1+mr,lMonths)/(Math.pow(1+mr,lMonths)-1)
              const totalCost=emi*lMonths+down+fees
              const resVal=msrp*0.3
              return [['Monthly payment',`${sym}${Math.round(emi)}`],['Loan total',fmt(totalCost,sym)],['9-year total',fmt(totalCost,sym)],['Car value at end',fmt(resVal,sym)]].map(([k,v])=>(
                <div key={k} style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                  <span style={{fontSize:11,color:'var(--text-3)'}}>{k}</span>
                  <span style={{fontSize:11,fontWeight:600,color:'var(--text)'}}>{v}</span>
                </div>
              ))
            })()}
          </div>
        </div>
      </Section>

      <Section title="Real World Examples" subtitle="Click any example to fill the calculator instantly">
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
          {EXAMPLES.map((ex,i)=>(
            <button key={i} onClick={()=>applyExample(ex)} style={{padding:14,borderRadius:10,border:'1.5px solid var(--border)',background:'var(--bg-raised)',cursor:'pointer',textAlign:'left',transition:'all .15s'}} onMouseEnter={e=>{e.currentTarget.style.borderColor=catColor;e.currentTarget.style.background=catColor+'10'}} onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.background='var(--bg-raised)'}}>
              <div style={{fontSize:13,fontWeight:700,color:'var(--text)',marginBottom:4}}>{ex.title}</div>
              <div style={{fontSize:11,color:'var(--text-3)',marginBottom:10,lineHeight:1.4}}>{ex.desc}</div>
              {[['MSRP',`${sym}${ex.msrp.toLocaleString()}`],['Residual',`${ex.residual}%`],['MF',`${ex.moneyFactor}`],['Term',`${ex.months} mo`]].map(([k,v])=>(
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

      <Section title="Key Terms" subtitle="Auto lease terminology — click any term">
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:8}}>
          {GLOSSARY.map((item,i)=><GlossaryTerm key={i} term={item.term} def={item.def} catColor={catColor} />)}
        </div>
      </Section>

      <Section title="Frequently Asked Questions" subtitle="Everything about auto leasing">
        {FAQ.map((item,i)=><AccordionItem key={i} q={item.q} a={item.a} isOpen={openFaq===i} onToggle={()=>setOpenFaq(openFaq===i?null:i)} catColor={catColor} />)}
      </Section>
    </div>
  )
}
