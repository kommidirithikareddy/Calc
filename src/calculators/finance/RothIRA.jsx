import { useState, useEffect, useRef } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import ResultHero from '../../components/calculator/ResultHero'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'
import CurrencyDropdown, { CURRENCIES } from '../../components/calculator/CurrencyDropdown'
const fmt=(n,sym='$')=>sym+Math.round(Math.max(0,n)).toLocaleString()
function FieldInput({label,hint,value,onChange,prefix,suffix,min=0,max,catColor='#6366f1'}) {
  const [raw,setRaw]=useState(String(value));const [focused,setFocused]=useState(false)
  useEffect(()=>{if(!focused)setRaw(String(value))},[value,focused])
  return (<div style={{marginBottom:14}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:5}}><label style={{fontSize:12.5,fontWeight:600,color:'var(--text)',fontFamily:"'DM Sans',sans-serif"}}>{label}</label>{hint&&<span style={{fontSize:10,color:'var(--text-3)'}}>{hint}</span>}</div><div style={{display:'flex',alignItems:'center',gap:6,background:'var(--bg-input,var(--bg-card))',border:`1.5px solid ${focused?catColor:'var(--border)'}`,borderRadius:8,padding:'0 10px',height:38,boxShadow:focused?`0 0 0 3px ${catColor}18`:'none'}}>{prefix&&<span style={{fontSize:12,color:'var(--text-3)',fontWeight:600,flexShrink:0}}>{prefix}</span>}<input type="text" inputMode="decimal" value={focused?raw:value} onChange={e=>{setRaw(e.target.value);const v=parseFloat(e.target.value);if(!isNaN(v))onChange(v)}} onFocus={()=>{setFocused(true);setRaw(String(value))}} onBlur={()=>{setFocused(false);const v=parseFloat(raw);if(isNaN(v)||raw===''){setRaw(String(min));onChange(min)}else{const c=max!==undefined?Math.min(max,Math.max(min,v)):Math.max(min,v);setRaw(String(c));onChange(c)}}} style={{flex:1,border:'none',background:'transparent',fontSize:13,fontWeight:600,color:'var(--text)',padding:0,outline:'none',minWidth:0,fontFamily:"'DM Sans',sans-serif"}} />{suffix&&<span style={{fontSize:11,color:'var(--text-3)',fontWeight:500,flexShrink:0}}>{suffix}</span>}</div></div>)
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

const RI_EXAMPLES=[{title:'Young Professional',desc:'Age 25, max contribution, 35 years',annual:7000,currentBal:5000,rate:7,years:35,taxRate:22},{title:'Mid-career',desc:'Age 40, partial contribution, 25 years',annual:5000,currentBal:40000,rate:7,years:25,taxRate:24},{title:'Near retirement',desc:'Age 55, catch-up contribution',annual:8000,currentBal:150000,rate:6,years:10,taxRate:28}]
const RI_FAQ=[{q:'What is a Roth IRA?',a:'A Roth IRA is an individual retirement account where contributions are made with after-tax dollars, but growth and qualified withdrawals are completely tax-free. Unlike traditional IRAs, you pay tax on contributions now but owe nothing in retirement — ideal if you expect to be in a higher tax bracket later.'},{q:'Who can contribute to a Roth IRA?',a:'In 2024, you can contribute up to $7,000/year ($8,000 if 50+) if your modified AGI is under $146,000 (single) or $230,000 (married). Above these limits, contributions are phased out. High earners can use the "backdoor Roth" strategy — contribute to traditional IRA then convert to Roth.'},{q:'Roth IRA vs Traditional IRA — which is better?',a:'Roth is better if you expect to be in a higher tax bracket in retirement, if you want tax-free income in retirement (e.g., to manage Medicare premiums), or if you want flexibility (no RMDs, can withdraw contributions anytime). Traditional is better if you need the tax deduction now to reduce current-year taxable income.'},{q:'Can I withdraw from a Roth IRA early?',a:'You can withdraw your contributions (not earnings) from a Roth IRA at any time without tax or penalty — contributions were already taxed. Earnings can be withdrawn tax-free after age 59½ if the account is 5+ years old. This flexibility makes the Roth IRA a great emergency backup after your main emergency fund.'}]
const RI_GLOSSARY=[{term:'Roth IRA',def:'An individual retirement account with after-tax contributions and tax-free growth and withdrawals.'},{term:'Contribution Limit',def:'$7,000/year in 2024 ($8,000 if 50+), subject to income limits.'},{term:'Income Limit',def:'Roth contributions phase out above $146k (single) or $230k (married) AGI in 2024.'},{term:'Backdoor Roth',def:'A strategy for high earners: contribute to a traditional IRA then convert to Roth, avoiding income limits.'},{term:'5-Year Rule',def:'Roth earnings can only be withdrawn tax-free if the account is at least 5 years old.'},{term:'No RMD',def:'Unlike traditional IRAs and 401(k)s, Roth IRAs have no required minimum distributions during the owner's lifetime.'}]

export default function RothIRA({meta,category}) {
  const [annual,setAnnual]=useState(6500);const [currentBal,setCurrentBal]=useState(10000);const [rate,setRate]=useState(7);const [years,setYears]=useState(30);const [taxRate,setTaxRate]=useState(22);const [currency,setCurrency]=useState(CURRENCIES[0])
  const [openFaq,setOpenFaq]=useState(null)
  const sym=currency.symbol;const catColor=category?.color||'#6366f1'
  const mr=rate/100/12,n=years*12,monthly=annual/12
  const rothFV=currentBal*Math.pow(1+mr,n)+(mr===0?monthly*n:monthly*(Math.pow(1+mr,n)-1)/mr)
  const totalContribs=annual*years+currentBal
  const taxFreeBenefit=(rothFV-totalContribs)*taxRate/100
  // Traditional IRA: contributions tax-deductible now, taxed at withdrawal
  const tradFV=rothFV // same growth
  const tradAfterTax=tradFV*(1-taxRate/100)
  const rothAdvantage=rothFV-tradAfterTax
  const hint=`Roth IRA grows to ${fmt(rothFV,sym)} tax-free. Traditional IRA grows the same but you\'d owe ${fmt(tradFV*taxRate/100,sym)} in taxes at withdrawal (${taxRate}% rate), leaving ${fmt(tradAfterTax,sym)}. Roth advantage: ${fmt(rothAdvantage,sym)}.`
  return (
    <div>
      <CalcShell
        left={<>
          <div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:16,paddingBottom:8,borderBottom:'0.5px solid var(--border)'}}>Roth IRA Details</div>
          <CurrencyDropdown currency={currency} setCurrency={setCurrency} catColor={catColor} />
          <FieldInput label="Annual Contribution" hint="2024 limit: $7,000 ($8,000 50+)" value={annual} onChange={setAnnual} prefix={sym} min={0} max={8000} catColor={catColor} />
          <FieldInput label="Current Balance" value={currentBal} onChange={setCurrentBal} prefix={sym} min={0} catColor={catColor} />
          <FieldInput label="Expected Annual Return" value={rate} onChange={setRate} suffix="%" min={0} max={20} catColor={catColor} />
          <FieldInput label="Years to Retirement" value={years} onChange={setYears} suffix="yrs" min={1} max={50} catColor={catColor} />
          <FieldInput label="Expected Tax Rate at Withdrawal" hint="Used for Traditional IRA comparison" value={taxRate} onChange={setTaxRate} suffix="%" min={0} max={50} catColor={catColor} />
          <button style={{width:'100%',padding:13,borderRadius:10,border:'none',background:catColor,color:'#fff',fontSize:14,fontWeight:700,cursor:'pointer',marginTop:6}} onMouseEnter={e=>e.currentTarget.style.opacity='.85'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>Calculate →</button>
        </>}
        right={<>
          <ResultHero label="Tax-Free Roth Balance" value={Math.round(rothFV)} formatter={n=>sym+Math.round(Math.max(0,n)).toLocaleString()} sub={`After ${years} years — 100% yours, no taxes owed`} color={catColor} />
          <BreakdownTable title="Roth vs Traditional Comparison" rows={[
            {label:'Total Contributions',         value:fmt(totalContribs,sym)},
            {label:'Growth',                      value:fmt(rothFV-totalContribs,sym), color:'#10b981'},
            {label:'Roth IRA (tax-free)',          value:fmt(rothFV,sym), color:catColor, bold:true, highlight:true},
            {label:'Traditional IRA (after tax)',  value:fmt(tradAfterTax,sym), color:'#f59e0b'},
            {label:'Tax saved with Roth',         value:fmt(rothAdvantage,sym), color:'#10b981', bold:true},
          ]} />
          <div style={{padding:'12px 14px',borderRadius:10,background:'#10b98110',border:'1px solid #10b98130'}}>
            <div style={{fontSize:12,fontWeight:700,color:'#10b981',marginBottom:4}}>💡 Tax-free growth advantage</div>
            <div style={{fontSize:11,color:'var(--text-2)',lineHeight:1.6}}>All ${fmt(rothFV,sym)} withdrawn tax-free in retirement. Traditional IRA would cost {fmt(tradFV*taxRate/100,sym)} in taxes at {taxRate}% rate.</div>
          </div>
          <AIHintCard hint={hint} />
        </>}
      />


      <_Section title="Formula Explained" subtitle="Roth IRA growth and tax advantage">
        <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:14}}>
          {[{label:'Future Balance',formula:'FV = Balance × (1+r/12)^(12×years) + PMT × ((1+r/12)^n − 1) / (r/12)'},{label:'Traditional After-tax',formula:'After-tax = FV × (1 − tax rate)'},{label:'Roth Advantage',formula:'Advantage = Roth FV − Traditional After-tax FV'}].map(f=>(
            <div key={f.label}><div style={{fontSize:10,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.05em',marginBottom:4}}>{f.label}</div><div style={{background:'var(--bg-raised)',borderRadius:8,padding:'10px 14px',fontFamily:'monospace',fontSize:12,color:catColor,fontWeight:600,overflowX:'auto',whiteSpace:'nowrap'}}>{f.formula}</div></div>
          ))}
        </div>
        <p style={{fontSize:12,color:'var(--text-2)',lineHeight:1.75,margin:0}}>Both Roth and traditional IRAs grow at the same rate, but their tax treatment differs at withdrawal. In a Roth, all growth is yours. In a traditional, you owe income tax on every withdrawal. The longer the time horizon and the higher your future tax rate, the greater the Roth advantage.</p>
      </_Section>

      <_Section title="Real World Examples" subtitle="Click any example to load the calculator">
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
          {RI_EXAMPLES.map((ex,i)=>(
            <button key={i} onClick={()=>{setAnnual(ex.annual);setCurrentBal(ex.currentBal);setRate(ex.rate);setYears(ex.years);setTaxRate(ex.taxRate)}} style={{padding:14,borderRadius:10,border:'1.5px solid var(--border)',background:'var(--bg-raised)',cursor:'pointer',textAlign:'left',transition:'all .15s'}} onMouseEnter={e=>{e.currentTarget.style.borderColor=catColor;e.currentTarget.style.background=catColor+'10'}} onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.background='var(--bg-raised)'}}>
              <div style={{fontSize:13,fontWeight:700,color:'var(--text)',marginBottom:4}}>{ex.title}</div>
              <div style={{fontSize:11,color:'var(--text-3)',marginBottom:8,lineHeight:1.4}}>{ex.desc}</div>
              {[['Annual',`${sym}${ex.annual.toLocaleString()}`],['Balance',`${sym}${ex.currentBal.toLocaleString()}`],['Years',`${ex.years}`],['Tax Rate',`${ex.taxRate}%`]].map(([k,v])=>(
                <div key={k} style={{display:'flex',justifyContent:'space-between'}}><span style={{fontSize:10,color:'var(--text-3)'}}>{k}</span><span style={{fontSize:10,fontWeight:600,color:catColor}}>{v}</span></div>
              ))}
              <div style={{marginTop:8,fontSize:10,fontWeight:700,color:catColor}}>Apply example →</div>
            </button>
          ))}
        </div>
      </_Section>

      <_Section title="Key Terms" subtitle="Click any term to see its definition">
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:8}}>
          {RI_GLOSSARY.map((item,i)=><_Glossary key={i} term={item.term} def={item.def} catColor={catColor} />)}
        </div>
      </_Section>

      <_Section title="Frequently Asked Questions">
        {RI_FAQ.map((item,i)=><_Accordion key={i} q={item.q} a={item.a} isOpen={openFaq===i} onToggle={()=>setOpenFaq(openFaq===i?null:i)} catColor={catColor} />)}
      </_Section>
    </div>
  )
}