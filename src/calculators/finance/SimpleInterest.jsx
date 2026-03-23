import { useState, useEffect, useRef } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import ResultHero from '../../components/calculator/ResultHero'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'
import CurrencyDropdown, { CURRENCIES } from '../../components/calculator/CurrencyDropdown'

const fmt = (n,sym='$') => sym+Math.round(Math.max(0,n)).toLocaleString()

const EXAMPLES=[
  {title:'Short-term Loan',  desc:'$5,000 at 8% for 2 years',  p:5000,  rate:8, years:2},
  {title:'Fixed Deposit',    desc:'$20,000 at 5% for 3 years', p:20000, rate:5, years:3},
  {title:'Personal Loan',    desc:'$1,000 at 12% for 1 year',  p:1000,  rate:12,years:1},
]
const FAQ=[
  {q:'What is simple interest?', a:'Simple interest is calculated only on the original principal amount, not on accumulated interest. Unlike compound interest, the interest amount stays the same every period because it\'s always based on the original sum. Formula: I = P × R × T. It\'s commonly used for short-term loans, car loans, and some savings products.'},
  {q:'When is simple interest used vs compound interest?', a:'Simple interest is used for short-term loans (personal loans, car loans, most consumer debt), while compound interest is used for savings accounts, investments, mortgages, and credit cards. Simple interest is more favorable for borrowers (you pay less total interest) while compound interest is more favorable for savers (you earn more over time).'},
  {q:'How does time affect simple interest?', a:'Simple interest grows linearly with time — double the time means double the interest. This is different from compound interest, which grows exponentially. For short periods, the difference between simple and compound interest is small. Over long periods (10+ years), compound interest dramatically outpaces simple interest.'},
  {q:'What is the Rule of 72 for simple interest?', a:'The Rule of 72 is designed for compound interest, not simple interest. For simple interest, divide 100 by the interest rate to find how many years to double your money. At 8% simple interest, it takes 100/8 = 12.5 years to double. At 8% compound interest, it only takes 72/8 = 9 years.'},
]
const GLOSSARY=[
  {term:'Principal', def:'The original amount of money borrowed or invested, before any interest is applied.'},
  {term:'Simple Interest', def:'Interest calculated only on the principal, not on accumulated interest. Grows linearly over time.'},
  {term:'Compound Interest', def:'Interest calculated on both the principal and previously earned interest. Grows exponentially over time.'},
  {term:'Interest Rate', def:'The annual percentage charged on the principal amount.'},
  {term:'Maturity Value', def:'The total amount received at the end of the period — principal plus all interest earned.'},
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

export default function SimpleInterest({meta,category}) {
  const [principal,setPrincipal]=useState(10000)
  const [rate,setRate]=useState(8)
  const [years,setYears]=useState(3)
  const [currency,setCurrency]=useState(CURRENCIES[0])
  const [openFaq,setOpenFaq]=useState(null)
  const calcRef=useRef(null)
  const sym=currency.symbol
  const catColor=category?.color||'#6366f1'

  const interest=principal*rate/100*years
  const total=principal+interest
  const hint=`Simple interest on ${fmt(principal,sym)} at ${rate}% for ${years} years is ${fmt(interest,sym)}. Total maturity value: ${fmt(total,sym)}.`

  function applyExample(ex){setPrincipal(ex.p);setRate(ex.rate);setYears(ex.years);setTimeout(()=>calcRef.current?.scrollIntoView({behavior:'smooth',block:'start'}),50)}

  return (
    <div style={{display:'flex',flexDirection:'column',gap:24}}>
      <div ref={calcRef} style={{scrollMarginTop:80}}>
        <CalcShell
          left={<>
            <div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:16,paddingBottom:8,borderBottom:'0.5px solid var(--border)'}}>Loan / Investment Details</div>
            <CurrencyDropdown currency={currency} setCurrency={setCurrency} catColor={catColor} />
            <FieldInput label="Principal Amount" hint="Starting amount" value={principal} onChange={setPrincipal} prefix={sym} min={1} catColor={catColor} />
            <FieldInput label="Annual Interest Rate" hint="% per year" value={rate} onChange={setRate} suffix="%" min={0} max={100} catColor={catColor} />
            <FieldInput label="Time Period" hint="Years" value={years} onChange={setYears} suffix="yrs" min={0.1} max={50} catColor={catColor} />
            <div style={{display:'flex',gap:10,marginTop:6}}>
              <button style={{flex:1,padding:13,borderRadius:10,border:'none',background:catColor,color:'#fff',fontSize:14,fontWeight:700,cursor:'pointer'}} onMouseEnter={e=>e.currentTarget.style.opacity='.85'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>Calculate →</button>
              <button onClick={()=>{setPrincipal(10000);setRate(8);setYears(3)}} style={{padding:'13px 18px',borderRadius:10,border:'1.5px solid var(--border-2)',background:'var(--bg-raised)',color:'var(--text-2)',fontSize:13,fontWeight:500,cursor:'pointer'}} onMouseEnter={e=>{e.currentTarget.style.borderColor='#ef4444';e.currentTarget.style.color='#ef4444'}} onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border-2)';e.currentTarget.style.color='var(--text-2)'}}>Reset</button>
            </div>
          </>}
          right={<>
            <ResultHero label="Simple Interest" value={Math.round(interest)} formatter={n=>sym+Math.round(Math.max(0,n)).toLocaleString()} sub={`On ${fmt(principal,sym)} at ${rate}% for ${years} years`} color={catColor} />
            <BreakdownTable title="Summary" rows={[
              {label:'Principal',value:fmt(principal,sym),color:catColor},
              {label:'Interest Rate',value:`${rate}% per year`},
              {label:'Time Period',value:`${years} years`},
              {label:'Interest Earned',value:fmt(interest,sym),color:'#10b981'},
              {label:'Maturity Value',value:fmt(total,sym),color:catColor,bold:true,highlight:true},
            ]} />
            <AIHintCard hint={hint} />
          </>}
        />
      </div>

      <Section title="Formula Explained" subtitle="The math behind simple interest">
        <div style={{background:'var(--bg-raised)',borderRadius:10,padding:'14px 16px',marginBottom:14,fontFamily:'monospace',fontSize:13,color:catColor,fontWeight:600}}>
          I = P × R × T &nbsp;&nbsp;|&nbsp;&nbsp; A = P + I
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:14}}>
          {[['I','Simple interest earned'],['P','Principal — original amount'],['R','Annual interest rate (decimal)'],['T','Time in years'],['A','Total amount (Principal + Interest)']].map(([s,m])=>(
            <div key={s} style={{display:'flex',gap:10,padding:'8px 10px',background:'var(--bg-raised)',borderRadius:8}}>
              <span style={{fontSize:13,fontWeight:800,color:catColor,fontFamily:'monospace',minWidth:20,flexShrink:0}}>{s}</span>
              <span style={{fontSize:11.5,color:'var(--text-2)',lineHeight:1.5}}>{m}</span>
            </div>
          ))}
        </div>
        <p style={{fontSize:12,color:'var(--text-2)',lineHeight:1.75,margin:0}}>Simple interest grows linearly — the same amount of interest is earned each period. At 8% on $10,000, you earn exactly $800 every year. This makes simple interest predictable and easy to calculate, but less powerful than compound interest for long-term savings.</p>
      </Section>

      <Section title="Real World Examples" subtitle="Click any example to fill the calculator instantly">
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
          {EXAMPLES.map((ex,i)=>(
            <button key={i} onClick={()=>applyExample(ex)} style={{padding:14,borderRadius:10,border:'1.5px solid var(--border)',background:'var(--bg-raised)',cursor:'pointer',textAlign:'left',transition:'all .15s'}} onMouseEnter={e=>{e.currentTarget.style.borderColor=catColor;e.currentTarget.style.background=catColor+'10'}} onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.background='var(--bg-raised)'}}>
              <div style={{fontSize:13,fontWeight:700,color:'var(--text)',marginBottom:4}}>{ex.title}</div>
              <div style={{fontSize:11,color:'var(--text-3)',marginBottom:10,lineHeight:1.4}}>{ex.desc}</div>
              {[['Principal',`${sym}${ex.p.toLocaleString()}`],['Rate',`${ex.rate}%`],['Term',`${ex.years} yrs`],['Interest',`${sym}${Math.round(ex.p*ex.rate/100*ex.years).toLocaleString()}`]].map(([k,v])=>(
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

      <Section title="Key Terms" subtitle="Simple interest terminology — click any term">
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:8}}>
          {GLOSSARY.map((item,i)=><GlossaryTerm key={i} term={item.term} def={item.def} catColor={catColor} />)}
        </div>
      </Section>

      <Section title="Simple vs Compound Interest" subtitle="See the difference over time">
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontFamily:"'DM Sans',sans-serif"}}>
            <thead><tr>{['Year','Simple Interest','Compound Interest','Difference'].map((h,i)=>(
              <th key={h} style={{padding:'9px 12px',fontSize:11,fontWeight:700,color:'var(--text-3)',textAlign:i===0?'left':'right',borderBottom:'1px solid var(--border)',fontFamily:"'Space Grotesk',sans-serif"}}>{h}</th>
            ))}</tr></thead>
            <tbody>
              {Array.from({length:Math.min(years,10)},(_,i)=>{
                const yr=i+1
                const si=principal*rate/100*yr
                const ci=principal*Math.pow(1+rate/100,yr)-principal
                return (
                  <tr key={yr} style={{background:yr%2===0?'var(--bg-raised)':'transparent'}}>
                    <td style={{padding:'9px 12px',fontSize:12,fontWeight:600,color:catColor}}>Year {yr}</td>
                    <td style={{padding:'9px 12px',fontSize:12,color:'var(--text)',textAlign:'right'}}>{sym}{Math.round(si).toLocaleString()}</td>
                    <td style={{padding:'9px 12px',fontSize:12,color:'#10b981',textAlign:'right'}}>{sym}{Math.round(ci).toLocaleString()}</td>
                    <td style={{padding:'9px 12px',fontSize:12,color:'#10b981',fontWeight:600,textAlign:'right'}}>+{sym}{Math.round(ci-si).toLocaleString()}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Frequently Asked Questions" subtitle="Everything about simple interest">
        {FAQ.map((item,i)=><AccordionItem key={i} q={item.q} a={item.a} isOpen={openFaq===i} onToggle={()=>setOpenFaq(openFaq===i?null:i)} catColor={catColor} />)}
      </Section>
    </div>
  )
}
