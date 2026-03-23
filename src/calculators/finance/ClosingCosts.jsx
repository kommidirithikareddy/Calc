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

const CC_FAQ=[{q:'What are closing costs?',a:'Closing costs are fees paid to complete a real estate transaction — to the lender, title company, government agencies and service providers. They typically total 2-5% of the loan amount and are paid at the closing meeting. They're in addition to your down payment.'},{q:'Can closing costs be negotiated?',a:'Some closing costs are negotiable (lender fees, title insurance), while others are fixed (government recording fees, transfer taxes). You can shop around for title companies and attorneys. Lenders must provide a Loan Estimate within 3 days of application that itemizes all expected costs.'},{q:'Can I roll closing costs into the loan?',a:'In many cases, yes — through a no-closing-cost mortgage. The lender covers upfront costs in exchange for a slightly higher interest rate (typically 0.125-0.25% more). This makes sense if you plan to sell or refinance within a few years. Long-term, paying closing costs upfront is usually cheaper.'},{q:'What are prepaid items at closing?',a:'Prepaids are not fees — they're advance payments of future costs. Typically include homeowner insurance (first year), property tax escrow (2-3 months), and prepaid interest from closing day to the end of the month. They're often 1-2% of the loan and are easy to overlook when budgeting for closing.'}]
const CC_GLOSSARY=[{term:'Origination Fee',def:'Lender's charge for processing the loan, typically 0.5-1% of the loan amount.'},{term:'Discount Points',def:'Optional upfront fees paid to reduce your interest rate. 1 point = 1% of loan = ~0.25% rate reduction.'},{term:'Title Insurance',def:'Protects against defects in the property title. Required by lenders; optional for buyers but recommended.'},{term:'Escrow',def:'An account holding prepaid taxes and insurance. Usually 2-3 months of each collected at closing.'},{term:'Recording Fee',def:'Government fee to officially record the property transfer in public records.'},{term:'Appraisal',def:'An independent estimate of the property's market value, required by the lender before approving the loan.'}]

export default function ClosingCosts({ meta, category }) {
  const [homePrice,setHomePrice]=useState(350000)
  const [openFaq,setOpenFaq]=useState(null)
  const [loanAmt,setLoanAmt]=useState(280000)
  const [currency,setCurrency]=useState(CURRENCIES[0])
  const sym=currency.symbol
  const catColor=category?.color||'#6366f1'

  const fees = [
    {category:'Lender Fees',    items:[
      {name:'Origination fee (1%)', amount:loanAmt*0.01},
      {name:'Discount points',      amount:0},
      {name:'Application fee',      amount:500},
      {name:'Underwriting fee',     amount:800},
    ]},
    {category:'Third-Party Fees',items:[
      {name:'Appraisal',            amount:550},
      {name:'Credit report',        amount:35},
      {name:'Title search',         amount:300},
      {name:'Title insurance',      amount:loanAmt*0.005},
      {name:'Attorney/settlement',  amount:600},
      {name:'Home inspection',      amount:400},
    ]},
    {category:'Prepaid Items',   items:[
      {name:'Homeowner insurance (1 yr)', amount:1200},
      {name:'Property tax (2 months)',    amount:homePrice*0.012/12*2},
      {name:'Mortgage interest (prepaid)',amount:loanAmt*0.065/12*15},
    ]},
    {category:'Government Fees', items:[
      {name:'Recording fees',       amount:200},
      {name:'Transfer taxes (est)', amount:homePrice*0.002},
    ]},
  ]

  const totalClosing = fees.reduce((s,cat)=>s+cat.items.reduce((s2,i)=>s2+i.amount,0),0)
  const totalCash    = totalClosing + (homePrice-loanAmt)
  const pct          = homePrice>0?(totalClosing/homePrice*100).toFixed(2):0

  const hint = `Estimated closing costs: ${fmt(totalClosing,sym)} (${pct}% of purchase price). Total cash needed at closing: ${fmt(totalCash,sym)} (closing costs + ${fmt(homePrice-loanAmt,sym)} down payment).`

  return (
    <div style={{display:'flex',flexDirection:'column',gap:24}}>
      <div>
        <CalcShell
          left={<>
            <div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:16,paddingBottom:8,borderBottom:'0.5px solid var(--border)'}}>Property Details</div>
            <CurrencyDropdown currency={currency} setCurrency={setCurrency} catColor={catColor} />
            <FieldInput label="Home Purchase Price" value={homePrice} onChange={setHomePrice} prefix={sym} min={1} catColor={catColor} />
            <FieldInput label="Loan Amount" hint="After down payment" value={loanAmt} onChange={setLoanAmt} prefix={sym} min={1} catColor={catColor} />
            <div style={{padding:'12px',borderRadius:8,background:catColor+'0d',border:`1px solid ${catColor}25`,marginTop:8}}>
              <div style={{fontSize:11,color:'var(--text-2)',marginBottom:4}}>Down Payment</div>
              <div style={{fontSize:18,fontWeight:800,color:catColor,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{fmt(homePrice-loanAmt,sym)} ({homePrice>0?((homePrice-loanAmt)/homePrice*100).toFixed(1):0}%)</div>
            </div>
            <button style={{width:'100%',padding:13,borderRadius:10,border:'none',background:catColor,color:'#fff',fontSize:14,fontWeight:700,cursor:'pointer',marginTop:14}} onMouseEnter={e=>e.currentTarget.style.opacity='.85'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>Estimate →</button>
          </>}
          right={<>
            <ResultHero label="Total Closing Costs" value={Math.round(totalClosing)} formatter={n=>sym+Math.round(Math.max(0,n)).toLocaleString()} sub={`${pct}% of ${fmt(homePrice,sym)} purchase price`} color={catColor} />
            <BreakdownTable title="Cash Needed at Closing" rows={[
              {label:'Down Payment',      value:fmt(homePrice-loanAmt,sym), color:'#10b981'},
              {label:'Closing Costs',     value:fmt(totalClosing,sym),      color:'#f59e0b'},
              {label:'Total Cash Needed', value:fmt(totalCash,sym),         color:catColor, bold:true, highlight:true},
            ]} />
            <AIHintCard hint={hint} />
          </>}
        />
      </div>

      <_Section title="Formula Explained" subtitle="How closing costs are calculated">
        <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:14}}>
          {[{label:'Origination Fee',formula:'Typically 0.5–1% of loan amount'},{label:'Title Insurance',formula:'Typically 0.3–0.5% of loan amount'},{label:'Total Closing Costs',formula:'Sum of all lender + third-party + prepaid + government fees'},{label:'Cash at Closing',formula:'Down Payment + Total Closing Costs'}].map(f=>(
            <div key={f.label}><div style={{fontSize:10,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.05em',marginBottom:4}}>{f.label}</div><div style={{background:'var(--bg-raised)',borderRadius:8,padding:'10px 14px',fontFamily:'monospace',fontSize:12,color:catColor,fontWeight:600,overflowX:'auto',whiteSpace:'nowrap'}}>{f.formula}</div></div>
          ))}
        </div>
        <p style={{fontSize:12,color:'var(--text-2)',lineHeight:1.75,margin:0}}>Closing costs have four categories: lender fees (negotiable), third-party fees (shop around), prepaid items (fixed costs paid in advance), and government fees (non-negotiable). The biggest variable is lender fees — getting multiple Loan Estimates and comparing them can save thousands.</p>
      </_Section>

      <_Section title="Real World Examples" subtitle="Click any example to load the calculator">
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
          {[{title:'Starter Home',desc:'First-time buyer, FHA loan',homePrice:280000,loanAmt:269000},{title:'Move-up Home',desc:'Conventional loan, 20% down',homePrice:450000,loanAmt:360000},{title:'Luxury Purchase',desc:'Jumbo loan, high-value property',homePrice:900000,loanAmt:720000}].map((ex,i)=>(
            <button key={i} onClick={()=>{setHomePrice(ex.homePrice);setLoanAmt(ex.loanAmt)}} style={{padding:14,borderRadius:10,border:'1.5px solid var(--border)',background:'var(--bg-raised)',cursor:'pointer',textAlign:'left',transition:'all .15s'}} onMouseEnter={e=>{e.currentTarget.style.borderColor=catColor;e.currentTarget.style.background=catColor+'10'}} onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.background='var(--bg-raised)'}}>
              <div style={{fontSize:13,fontWeight:700,color:'var(--text)',marginBottom:4}}>{ex.title}</div>
              <div style={{fontSize:11,color:'var(--text-3)',marginBottom:10,lineHeight:1.4}}>{ex.desc}</div>
              {[['Price',`${sym}${ex.homePrice.toLocaleString()}`],['Loan',`${sym}${ex.loanAmt.toLocaleString()}`],['Down',`${sym}${(ex.homePrice-ex.loanAmt).toLocaleString()}`]].map(([k,v])=>(
                <div key={k} style={{display:'flex',justifyContent:'space-between'}}><span style={{fontSize:10,color:'var(--text-3)'}}>{k}</span><span style={{fontSize:10,fontWeight:600,color:catColor}}>{v}</span></div>
              ))}
              <div style={{marginTop:10,fontSize:10,fontWeight:700,color:catColor}}>Apply example →</div>
            </button>
          ))}
        </div>
      </_Section>

      <_Section title="Key Terms" subtitle="Click any term to see its definition">
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:8}}>
          {CC_GLOSSARY.map((item,i)=><_Glossary key={i} term={item.term} def={item.def} catColor={catColor} />)}
        </div>
      </_Section>

      <Section title="Detailed Cost Breakdown" subtitle="Estimated closing costs by category">
        {fees.map((cat,ci)=>(
          <div key={ci} style={{marginBottom:ci<fees.length-1?20:0}}>
            <div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.05em',marginBottom:8}}>{cat.category}</div>
            {cat.items.map((item,ii)=>(
              <div key={ii} style={{display:'flex',justifyContent:'space-between',padding:'7px 0',borderBottom:'0.5px solid var(--border)'}}>
                <span style={{fontSize:12,color:'var(--text-2)'}}>{item.name}</span>
                <span style={{fontSize:12,fontWeight:600,color:'var(--text)'}}>{fmt(item.amount,sym)}</span>
              </div>
            ))}
            <div style={{display:'flex',justifyContent:'space-between',padding:'8px 0',marginTop:2}}>
              <span style={{fontSize:12,fontWeight:700,color:catColor}}>{cat.category} subtotal</span>
              <span style={{fontSize:12,fontWeight:700,color:catColor}}>{fmt(cat.items.reduce((s,i)=>s+i.amount,0),sym)}</span>
            </div>
          </div>
        ))}
        <div style={{display:'flex',justifyContent:'space-between',padding:'12px',borderRadius:8,background:catColor+'0d',border:`1px solid ${catColor}30`,marginTop:8}}>
          <span style={{fontSize:13,fontWeight:800,color:catColor,fontFamily:"'Space Grotesk',sans-serif"}}>Total Closing Costs</span>
          <span style={{fontSize:13,fontWeight:800,color:catColor}}>{fmt(totalClosing,sym)}</span>
        </div>
      </Section>

      <_Section title="Frequently Asked Questions">
        {CC_FAQ.map((item,i)=><_Accordion key={i} q={item.q} a={item.a} isOpen={openFaq===i} onToggle={()=>setOpenFaq(openFaq===i?null:i)} catColor={catColor} />)}
      </_Section>
    </div>
  )
}