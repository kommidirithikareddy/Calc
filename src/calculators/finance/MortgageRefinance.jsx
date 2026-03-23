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

const MR_EXAMPLES=[{title:'Rate Drop Refi',desc:'1.5% rate reduction opportunity',balance:280000,currentRate:7.5,currentTerm:25,newRate:6.0,newTerm:30,closingCosts:6000},{title:'Term Shortening',desc:'Switch from 30yr to 15yr',balance:200000,currentRate:6.5,currentTerm:25,newRate:6.0,newTerm:15,closingCosts:4000},{title:'Cash-out Refi',desc:'Modest rate drop with closing costs',balance:320000,currentRate:7.0,currentTerm:28,newRate:6.25,newTerm:30,closingCosts:8000}]
const MR_FAQ=[{q:'When does refinancing make sense?',a:'Refinancing makes sense when the new rate is at least 0.5-1% lower than your current rate, you plan to stay in the home long enough to recoup closing costs, and you have good credit. The break-even analysis is key — divide closing costs by monthly savings to find how many months to break even.'},{q:'What are typical refinancing closing costs?',a:'Refinancing closing costs typically range from 2-5% of the loan amount. They include lender origination fees (0.5-1%), appraisal ($400-600), title search and insurance, credit report, attorney fees and prepaid items. Rolling costs into the loan eliminates upfront cash but adds to the balance.'},{q:'What is a break-even point in refinancing?',a:'The break-even point is how many months until your accumulated monthly savings equal the upfront closing costs. If closing costs are $6,000 and monthly savings are $200, break-even is 30 months. If you plan to sell or move before then, refinancing likely isn\'t worth it.'},{q:'Does extending my loan term cost more?',a:'Yes. Extending from 25 remaining years to a new 30-year term lowers your monthly payment but increases total interest paid. You are essentially restarting the amortization clock. If your goal is to save money long-term, try to refinance into a shorter term or make extra payments on the new loan.'}]
const MR_GLOSSARY=[{term:'Break-even Point',def:'The month when accumulated monthly savings from refinancing equal the upfront closing costs paid.'},{term:'Closing Costs',def:'Upfront fees to complete the refinance — typically 2-5% of the loan. Includes lender fees, title, appraisal.'},{term:'Rate-and-Term Refi',def:'Refinancing to get a lower rate or different term without taking out extra cash.'},{term:'Cash-out Refi',def:'Refinancing for more than you owe to access home equity as cash.'},{term:'No-closing-cost Refi',def:'Rolling closing costs into the loan balance or accepting a slightly higher rate instead of paying fees upfront.'},{term:'Seasoning',def:'Some lenders require you to wait 6-12 months after your original loan before refinancing.'}]

export default function MortgageRefinance({ meta, category }) {
  const [balance,setBalance]=useState(280000)
  const [openFaq,setOpenFaq]=useState(null)
  const [currentRate,setCurrentRate]=useState(7.5)
  const [currentTerm,setCurrentTerm]=useState(25)
  const [newRate,setNewRate]=useState(6.0)
  const [newTerm,setNewTerm]=useState(30)
  const [closingCosts,setClosingCosts]=useState(5000)
  const [currency,setCurrency]=useState(CURRENCIES[0])
  const sym=currency.symbol
  const catColor=category?.color||'#6366f1'

  function calcEMI(p,r,t) {
    const mr=r/100/12, n=t*12
    return mr===0?p/n:p*mr*Math.pow(1+mr,n)/(Math.pow(1+mr,n)-1)
  }

  const currentEMI = calcEMI(balance,currentRate,currentTerm)
  const newEMI     = calcEMI(balance,newRate,newTerm)
  const monthlySavings = currentEMI-newEMI
  const breakEvenMonths = monthlySavings>0?Math.ceil(closingCosts/monthlySavings):Infinity
  const totalCurrentInt = currentEMI*currentTerm*12-balance
  const totalNewInt     = newEMI*newTerm*12-balance
  const lifetimeSavings = totalCurrentInt-totalNewInt-closingCosts
  const worthIt = monthlySavings>0 && breakEvenMonths<currentTerm*12

  const hint = monthlySavings>0
    ? `Refinancing saves ${fmt(monthlySavings,sym)}/month. Break-even: ${breakEvenMonths} months (${(breakEvenMonths/12).toFixed(1)} years). ${lifetimeSavings>0?`Net lifetime savings: ${fmt(lifetimeSavings,sym)}.`:`But extends term means ${fmt(Math.abs(lifetimeSavings),sym)} more total interest.`}`
    : `The new rate results in a higher payment — refinancing is not beneficial in this scenario.`

  return (
    <div style={{display:'flex',flexDirection:'column',gap:24}}>
      <div>
        <CalcShell
          left={<>
            <div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:16,paddingBottom:8,borderBottom:'0.5px solid var(--border)'}}>Refinance Details</div>
            <CurrencyDropdown currency={currency} setCurrency={setCurrency} catColor={catColor} />
            <div style={{fontSize:11,fontWeight:600,color:'var(--text-3)',marginBottom:8}}>CURRENT MORTGAGE</div>
            <FieldInput label="Remaining Balance" value={balance} onChange={setBalance} prefix={sym} min={1} catColor={catColor} />
            <FieldInput label="Current Interest Rate" value={currentRate} onChange={setCurrentRate} suffix="%" min={0} max={20} catColor={catColor} />
            <FieldInput label="Remaining Term" value={currentTerm} onChange={setCurrentTerm} suffix="yrs" min={1} max={30} catColor={catColor} />
            <div style={{fontSize:11,fontWeight:600,color:'var(--text-3)',marginBottom:8,marginTop:4}}>NEW MORTGAGE</div>
            <FieldInput label="New Interest Rate" value={newRate} onChange={setNewRate} suffix="%" min={0} max={20} catColor={catColor} />
            <FieldInput label="New Loan Term" value={newTerm} onChange={setNewTerm} suffix="yrs" min={1} max={30} catColor={catColor} />
            <FieldInput label="Closing Costs" hint="Typically 2-5% of loan" value={closingCosts} onChange={setClosingCosts} prefix={sym} min={0} catColor={catColor} />
            <div style={{display:'flex',gap:10,marginTop:6}}>
              <button style={{flex:1,padding:13,borderRadius:10,border:'none',background:catColor,color:'#fff',fontSize:14,fontWeight:700,cursor:'pointer'}} onMouseEnter={e=>e.currentTarget.style.opacity='.85'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>Calculate →</button>
              <button onClick={()=>{setBalance(280000);setCurrentRate(7.5);setCurrentTerm(25);setNewRate(6.0);setNewTerm(30);setClosingCosts(5000)}} style={{padding:'13px 18px',borderRadius:10,border:'1.5px solid var(--border-2)',background:'var(--bg-raised)',color:'var(--text-2)',fontSize:13,fontWeight:500,cursor:'pointer'}} onMouseEnter={e=>{e.currentTarget.style.borderColor='#ef4444';e.currentTarget.style.color='#ef4444'}} onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border-2)';e.currentTarget.style.color='var(--text-2)'}}>Reset</button>
            </div>
          </>}
          right={<>
            <ResultHero label="Monthly Savings" value={Math.abs(Math.round(monthlySavings))} formatter={n=>(monthlySavings>0?'+':'-')+sym+n.toLocaleString()} sub={monthlySavings>0?`Break-even in ${breakEvenMonths} months`:'Higher payment — not beneficial'} color={monthlySavings>0?'#10b981':'#ef4444'} />
            <BreakdownTable title="Refinance Comparison" rows={[
              {label:'Current Monthly Payment', value:fmt(currentEMI,sym)},
              {label:'New Monthly Payment',      value:fmt(newEMI,sym), color:catColor},
              {label:'Monthly Savings',          value:(monthlySavings>0?'+':'')+fmt(monthlySavings,sym), color:monthlySavings>0?'#10b981':'#ef4444'},
              {label:'Closing Costs',            value:fmt(closingCosts,sym), color:'#f59e0b'},
              {label:'Break-even Period',        value:breakEvenMonths===Infinity?'Never':`${breakEvenMonths} months`, color:catColor, bold:true},
              {label:'Net Lifetime Savings',     value:(lifetimeSavings>0?'+':'')+fmt(lifetimeSavings,sym), color:lifetimeSavings>0?'#10b981':'#ef4444', highlight:true, bold:true},
            ]} />
            <AIHintCard hint={hint} />
          </>}
        />
      </div>

      <_Section title="Formula Explained" subtitle="How refinance savings and break-even are calculated">
        <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:14}}>
          {[{label:'New Monthly Payment',formula:'EMI = Balance × r × (1+r)^n / ((1+r)^n − 1)'},{label:'Monthly Savings',formula:'Savings = Current EMI − New EMI'},{label:'Break-even Months',formula:'Break-even = Closing Costs ÷ Monthly Savings'},{label:'Net Lifetime Savings',formula:'Net = (Current Total Interest − New Total Interest) − Closing Costs'}].map(f=>(
            <div key={f.label}><div style={{fontSize:10,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.05em',marginBottom:4}}>{f.label}</div><div style={{background:'var(--bg-raised)',borderRadius:8,padding:'10px 14px',fontFamily:'monospace',fontSize:12,color:catColor,fontWeight:600,overflowX:'auto',whiteSpace:'nowrap'}}>{f.formula}</div></div>
          ))}
        </div>
        <p style={{fontSize:12,color:'var(--text-2)',lineHeight:1.75,margin:0}}>Break-even is the single most important number in refinancing. A short break-even (under 2 years) with strong monthly savings typically makes refinancing worthwhile. Extending the loan term lowers payments but resets amortization — recalculate total lifetime interest to see the true long-term cost.</p>
      </_Section>

      <_Section title="Real World Examples" subtitle="Click any example to load the calculator">
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
          {MR_EXAMPLES.map((ex,i)=>(
            <button key={i} onClick={()=>{setBalance(ex.balance);setCurrentRate(ex.currentRate);setCurrentTerm(ex.currentTerm);setNewRate(ex.newRate);setNewTerm(ex.newTerm);setClosingCosts(ex.closingCosts)}} style={{padding:14,borderRadius:10,border:'1.5px solid var(--border)',background:'var(--bg-raised)',cursor:'pointer',textAlign:'left',transition:'all .15s'}} onMouseEnter={e=>{e.currentTarget.style.borderColor=catColor;e.currentTarget.style.background=catColor+'10'}} onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.background='var(--bg-raised)'}}>
              <div style={{fontSize:13,fontWeight:700,color:'var(--text)',marginBottom:4}}>{ex.title}</div>
              <div style={{fontSize:11,color:'var(--text-3)',marginBottom:8,lineHeight:1.4}}>{ex.desc}</div>
              {[['Balance',`${sym}${ex.balance.toLocaleString()}`],['Current',`${ex.currentRate}%`],['New Rate',`${ex.newRate}%`],['Costs',`${sym}${ex.closingCosts.toLocaleString()}`]].map(([k,v])=>(
                <div key={k} style={{display:'flex',justifyContent:'space-between'}}><span style={{fontSize:10,color:'var(--text-3)'}}>{k}</span><span style={{fontSize:10,fontWeight:600,color:catColor}}>{v}</span></div>
              ))}
              <div style={{marginTop:8,fontSize:10,fontWeight:700,color:catColor}}>Apply example →</div>
            </button>
          ))}
        </div>
      </_Section>

      <_Section title="Key Terms" subtitle="Click any term to see its definition">
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:8}}>
          {MR_GLOSSARY.map((item,i)=><_Glossary key={i} term={item.term} def={item.def} catColor={catColor} />)}
        </div>
      </_Section>

      <Section title="Should You Refinance?" subtitle="Key decision factors">
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {[
            {label:'Rate reduction',val:`${Math.abs(newRate-currentRate).toFixed(2)}%`,good:newRate<currentRate,desc:newRate<currentRate?'Lower rate benefits you':'Higher rate — no benefit'},
            {label:'Monthly savings',val:monthlySavings>0?`+${fmt(monthlySavings,sym)}/mo`:`-${fmt(Math.abs(monthlySavings),sym)}/mo`,good:monthlySavings>0,desc:monthlySavings>0?'Cash flow improves':'Cash flow gets worse'},
            {label:'Break-even',val:breakEvenMonths===Infinity?'Never':`${(breakEvenMonths/12).toFixed(1)} years`,good:breakEvenMonths<60&&monthlySavings>0,desc:breakEvenMonths<60?'Fast payback — likely worth it':breakEvenMonths<120?'Moderate payback period':'Long payback — consider carefully'},
            {label:'Lifetime savings',val:lifetimeSavings>0?fmt(lifetimeSavings,sym):`-${fmt(Math.abs(lifetimeSavings),sym)}`,good:lifetimeSavings>0,desc:lifetimeSavings>0?'Net savings after closing costs':'Extending term costs more overall'},
          ].map((r,i)=>(
            <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 12px',borderRadius:8,background:r.good?'#10b98108':'#ef444408',border:`1px solid ${r.good?'#10b98130':'#ef444430'}`}}>
              <div>
                <div style={{fontSize:12,fontWeight:600,color:'var(--text)'}}>{r.label}</div>
                <div style={{fontSize:10,color:'var(--text-3)'}}>{r.desc}</div>
              </div>
              <div style={{fontSize:14,fontWeight:800,color:r.good?'#10b981':'#ef4444',fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{r.val}</div>
            </div>
          ))}
        </div>
      </Section>

      <_Section title="Frequently Asked Questions">
        {MR_FAQ.map((item,i)=><_Accordion key={i} q={item.q} a={item.a} isOpen={openFaq===i} onToggle={()=>setOpenFaq(openFaq===i?null:i)} catColor={catColor} />)}
      </_Section>
    </div>
  )
}