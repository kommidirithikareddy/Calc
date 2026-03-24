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

const DP_FAQ=[{q:'How much down payment do I need?',a:'The minimum is 3% for conventional loans and 3.5% for FHA. But 20% is the magic number that eliminates PMI, reduces your loan amount, lowers monthly payments and can qualify you for better rates. Any amount between 3-20% is common — the right amount depends on your savings, local market and how long you plan to stay.'},{q:'Is it better to put more down or keep cash?',a:'This depends on your emergency fund, other high-interest debt and expected returns. If you have no emergency fund or high-rate debt, keep cash. If you’re debt-free with savings, a larger down payment avoids PMI and saves significant interest. Never drain your emergency fund for a down payment.'},{q:'What is PMI and when does it go away?',a:'PMI (Private Mortgage Insurance) is required when your down payment is under 20%. It typically costs 0.5-1.5% of the loan annually. By law (Homeowners Protection Act), lenders must cancel PMI when you reach 20% equity based on the original purchase price. You can also request cancellation earlier if your home value has appreciated.'},{q:'Can gifts count toward a down payment?',a:'Yes — gift funds from family members are acceptable for conventional and FHA loans, with proper documentation (gift letter stating no repayment is required). For conventional loans, larger down payments may require some of the buyer’s own funds. Always check with your lender about gift fund requirements.'}]
const DP_GLOSSARY=[{term:'Down Payment',def:'The upfront cash you pay toward the home purchase price. Reduces loan amount and monthly payment.'},{term:'PMI',def:'Private Mortgage Insurance — required when down payment is under 20%. Typically 0.5-1.5% of loan per year.'},{term:'LTV Ratio',def:'Loan-to-Value ratio — loan amount divided by home value. Below 80% LTV eliminates PMI.'},{term:'Equity',def:'Your ownership stake — home value minus outstanding mortgage. Down payment creates immediate equity.'},{term:'Earnest Money',def:'A deposit made with a purchase offer to show good faith. Typically 1-3% of purchase price.'},{term:'Gift Funds',def:'Money gifted by family for down payment. Must be documented with a gift letter stating no repayment required.'}]

export default function DownPaymentCalculator({ meta, category }) {
  const [homePrice,setHomePrice]=useState(350000)
  const [openFaq,setOpenFaq]=useState(null)
  const [saved,setSaved]=useState(15000)
  const [monthly,setMonthly]=useState(1000)
  const [rate,setRate]=useState(6.5)
  const [savingsRate,setSavingsRate]=useState(4)
  const [currency,setCurrency]=useState(CURRENCIES[0])
  const sym=currency.symbol
  const catColor=category?.color||'#6366f1'

  function calcEMI(price,down) {
    const loan=price-down, mr=rate/100/12, n=30*12
    return mr===0?loan/n:loan*mr*Math.pow(1+mr,n)/(Math.pow(1+mr,n)-1)
  }
  function calcPMI(price,down) { return down/price<0.2?((price-down)*0.005/12):0 }
  function monthsToSave(target) {
    if(saved>=target)return 0
    const r=savingsRate/100/12
    if(r===0)return Math.ceil((target-saved)/monthly)
    return Math.ceil(Math.log(1+(target-saved)*r/monthly)/Math.log(1+r))
  }

  const scenarios = [3,5,10,20].map(pct=>{
    const down=homePrice*pct/100
    const emi=calcEMI(homePrice,down)
    const pmi=calcPMI(homePrice,down)
    const m=monthsToSave(down)
    return {pct,down,emi,pmi,months:m,total:emi+pmi}
  })
  const current=scenarios.find(s=>s.down<=saved+1)||scenarios[0]

  const progress = Math.min(100,(saved/((scenarios[1]?.down)||1))*100)
  const hint = `You have ${fmt(saved,sym)} saved. At ${fmt(monthly,sym)}/month, you can reach a 5% down payment in ${monthsToSave(homePrice*0.05)} months and 20% (no PMI) in ${monthsToSave(homePrice*0.2)} months.`

  return (
    <div style={{display:'flex',flexDirection:'column',gap:24}}>
      <div>
        <CalcShell
          left={<>
            <div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:16,paddingBottom:8,borderBottom:'0.5px solid var(--border)'}}>Your Down Payment Plan</div>
            <CurrencyDropdown currency={currency} setCurrency={setCurrency} catColor={catColor} />
            <FieldInput label="Target Home Price" value={homePrice} onChange={setHomePrice} prefix={sym} min={1} catColor={catColor} />
            <FieldInput label="Currently Saved" hint="Amount set aside so far" value={saved} onChange={setSaved} prefix={sym} min={0} catColor={catColor} />
            <FieldInput label="Monthly Savings" hint="How much you save monthly" value={monthly} onChange={setMonthly} prefix={sym} min={0} catColor={catColor} />
            <FieldInput label="Mortgage Rate" hint="Expected rate" value={rate} onChange={setRate} suffix="%" min={0} max={20} catColor={catColor} />
            <FieldInput label="Savings Account Rate" hint="APY on savings" value={savingsRate} onChange={setSavingsRate} suffix="%" min={0} max={10} catColor={catColor} />
            <button style={{width:'100%',padding:13,borderRadius:10,border:'none',background:catColor,color:'#fff',fontSize:14,fontWeight:700,cursor:'pointer',marginTop:6}} onMouseEnter={e=>e.currentTarget.style.opacity='.85'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>Calculate →</button>
          </>}
          right={<>
            <ResultHero label="Time to 20% Down" value={Math.round(monthsToSave(homePrice*0.2)/12*10)/10} formatter={n=>n.toFixed(1)+' years'} sub={`${fmt(homePrice*0.2,sym)} needed to avoid PMI`} color={catColor} />
            <BreakdownTable title="Savings Progress" rows={[
              {label:'Target Home Price',  value:fmt(homePrice,sym)},
              {label:'Currently Saved',    value:fmt(saved,sym), color:'#10b981'},
              {label:'5% Down Target',     value:fmt(homePrice*0.05,sym)},
              {label:'20% Down Target',    value:fmt(homePrice*0.2,sym), color:catColor, bold:true},
              {label:'Months to 5% Down',  value:`${monthsToSave(homePrice*0.05)} mo`},
              {label:'Months to 20% Down', value:`${monthsToSave(homePrice*0.2)} mo`, color:catColor, highlight:true},
            ]} />
            <AIHintCard hint={hint} />
          </>}
        />
      </div>

      <_Section title="Formula Explained" subtitle="How down payment affects your loan">
        <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:14}}>
          {[{label:'Loan Amount',formula:'Loan = Home Price − Down Payment'},{label:'LTV Ratio',formula:'LTV = Loan Amount ÷ Home Price × 100'},{label:'Monthly P&I',formula:'EMI = Loan × r × (1+r)^n / ((1+r)^n − 1)'},{label:'PMI (if < 20% down)',formula:'PMI = Loan Amount × 0.005 ÷ 12 (approx)'}].map(f=>(
            <div key={f.label}><div style={{fontSize:10,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.05em',marginBottom:4}}>{f.label}</div><div style={{background:'var(--bg-raised)',borderRadius:8,padding:'10px 14px',fontFamily:'monospace',fontSize:12,color:catColor,fontWeight:600,overflowX:'auto',whiteSpace:'nowrap'}}>{f.formula}</div></div>
          ))}
        </div>
        <p style={{fontSize:12,color:'var(--text-2)',lineHeight:1.75,margin:0}}>Every extra dollar in down payment reduces your loan by the same amount, saving both monthly payments and total interest. The 20% threshold is crucial — crossing it eliminates PMI, which can add $100-400/month to your payment. This calculator shows exactly how each milestone changes your costs.</p>
      </_Section>

      <_Section title="Real World Examples" subtitle="Click any example to load the calculator">
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
          {[{title:'Starter Home',desc:'First home, low down payment',homePrice:300000,saved:12000,monthly:800,rate:6.5,savingsRate:4},{title:'FHA Buyer',desc:'3.5% FHA minimum down payment',homePrice:350000,saved:25000,monthly:1200,rate:7.0,savingsRate:4.5},{title:'20% Target',desc:'Saving to avoid PMI entirely',homePrice:400000,saved:40000,monthly:1500,rate:6.5,savingsRate:4.75}].map((ex,i)=>(
            <button key={i} onClick={()=>{setHomePrice(ex.homePrice);setSaved(ex.saved);setMonthly(ex.monthly);setRate(ex.rate);setSavingsRate(ex.savingsRate)}} style={{padding:14,borderRadius:10,border:'1.5px solid var(--border)',background:'var(--bg-raised)',cursor:'pointer',textAlign:'left',transition:'all .15s'}} onMouseEnter={e=>{e.currentTarget.style.borderColor=catColor;e.currentTarget.style.background=catColor+'10'}} onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.background='var(--bg-raised)'}}>
              <div style={{fontSize:13,fontWeight:700,color:'var(--text)',marginBottom:4}}>{ex.title}</div>
              <div style={{fontSize:11,color:'var(--text-3)',marginBottom:10,lineHeight:1.4}}>{ex.desc}</div>
              {[['Price',`${sym}${ex.homePrice.toLocaleString()}`],['Saved',`${sym}${ex.saved.toLocaleString()}`],['Monthly Save',`${sym}${ex.monthly}/mo`]].map(([k,v])=>(
                <div key={k} style={{display:'flex',justifyContent:'space-between'}}><span style={{fontSize:10,color:'var(--text-3)'}}>{k}</span><span style={{fontSize:10,fontWeight:600,color:catColor}}>{v}</span></div>
              ))}
              <div style={{marginTop:10,fontSize:10,fontWeight:700,color:catColor}}>Apply example →</div>
            </button>
          ))}
        </div>
      </_Section>

      <_Section title="Key Terms" subtitle="Click any term to see its definition">
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:8}}>
          {DP_GLOSSARY.map((item,i)=><_Glossary key={i} term={item.term} def={item.def} catColor={catColor} />)}
        </div>
      </_Section>

      <Section title="Down Payment Comparison" subtitle="Down Payment Comparison: How each milestone changes costs">
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontFamily:"'DM Sans',sans-serif"}}>
            <thead><tr>{['Down %','Amount','P&I','PMI','Total/mo','Time to Save'].map((h,i)=>(
              <th key={h} style={{padding:'9px 12px',fontSize:11,fontWeight:700,color:'var(--text-3)',textAlign:i===0?'left':'right',borderBottom:'1px solid var(--border)',fontFamily:"'Space Grotesk',sans-serif"}}>{h}</th>
            ))}</tr></thead>
            <tbody>
              {scenarios.map((s,i)=>(
                <tr key={s.pct} style={{background:s.pct===20?catColor+'08':i%2===0?'var(--bg-raised)':'transparent'}}>
                  <td style={{padding:'9px 12px',fontSize:12,fontWeight:s.pct===20?700:400,color:s.pct===20?catColor:'var(--text)'}}>{s.pct}% {s.pct===20&&'✓ No PMI'}</td>
                  <td style={{padding:'9px 12px',fontSize:12,color:'var(--text)',textAlign:'right'}}>{fmt(s.down,sym)}</td>
                  <td style={{padding:'9px 12px',fontSize:12,color:'var(--text)',textAlign:'right'}}>{fmt(s.emi,sym)}</td>
                  <td style={{padding:'9px 12px',fontSize:12,color:s.pmi>0?'#ef4444':'#10b981',textAlign:'right'}}>{s.pmi>0?fmt(s.pmi,sym):'—'}</td>
                  <td style={{padding:'9px 12px',fontSize:12,fontWeight:600,color:catColor,textAlign:'right'}}>{fmt(s.total,sym)}</td>
                  <td style={{padding:'9px 12px',fontSize:12,color:'var(--text-3)',textAlign:'right'}}>{s.months===0?'Ready now':`${Math.ceil(s.months/12)}yr ${s.months%12}mo`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <_Section title="Frequently Asked Questions">
        {DP_FAQ.map((item,i)=><_Accordion key={i} q={item.q} a={item.a} isOpen={openFaq===i} onToggle={()=>setOpenFaq(openFaq===i?null:i)} catColor={catColor} />)}
      </_Section>
    </div>
  )
}