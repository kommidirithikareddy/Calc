import { useState, useEffect, useRef } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import ResultHero from '../../components/calculator/ResultHero'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'
import CurrencyDropdown, { CURRENCIES } from '../../components/calculator/CurrencyDropdown'

const fmt  = (n, sym='$') => sym + Math.round(Math.max(0,n)).toLocaleString()
const fmtD = (n, sym='$') => sym + (Math.round(n*100)/100).toFixed(2)
const fmtP = n => n.toFixed(3) + '%'

const EXAMPLES = [
  { title:'30-Year Fixed',   desc:'Buy 2 points on a standard mortgage',    loan:400000, baseRate:7.25, points:2,   rateReduction:0.25, term:30 },
  { title:'15-Year Fixed',   desc:'1 point to reduce rate on shorter loan',  loan:300000, baseRate:6.75, points:1,   rateReduction:0.25, term:15 },
  { title:'Jumbo Loan',      desc:'3 points on a large home purchase',       loan:800000, baseRate:7.50, points:3,   rateReduction:0.375, term:30 },
]

const FAQ = [
  { q:'What are mortgage discount points?', a:'Discount points are upfront fees paid to the lender at closing to permanently reduce your mortgage interest rate. One point equals 1% of the loan amount. Paying 2 points on a $400,000 loan costs $8,000 upfront. In exchange, the lender reduces your interest rate — typically by 0.25% per point, though this varies.' },
  { q:'How do I know if buying points is worth it?', a:'The break-even analysis tells you. Divide the upfront cost of the points by your monthly payment savings. If the break-even is 36 months and you plan to stay in the home for 10+ years, buying points makes clear financial sense. If you might move or refinance within 3 years, it probably does not.' },
  { q:'What is the difference between discount points and origination points?', a:'Discount points reduce your interest rate — they are prepaid interest. Origination points are lender fees for processing the loan — they do not reduce your rate. This calculator covers discount points. Always clarify with your lender which type of points they are quoting.' },
  { q:'Are mortgage points tax deductible?', a:'Discount points paid on the purchase of a primary residence are generally fully deductible in the year paid, subject to certain IRS conditions. Points paid on refinancing are deductible over the life of the loan, not all at once. Consult a tax advisor for your specific situation.' },
  { q:'How much does 1 point typically reduce the rate?', a:'The rate reduction per point varies by lender and market conditions — typically 0.125% to 0.375% per point. Most commonly it is 0.25% per point. Lenders usually offer different rate/point combinations (called the "rate sheet") and the best choice depends on your break-even timeline.' },
]

const GLOSSARY = [
  { term:'Discount Point',    def:'1% of the loan amount paid upfront to permanently reduce the mortgage interest rate.' },
  { term:'Break-Even Point',  def:'The month when cumulative monthly savings equal the upfront cost of the points. After this, buying points saves money.' },
  { term:'Rate Buydown',      def:'The process of paying points to obtain a lower interest rate than the market rate.' },
  { term:'APR',               def:'Annual Percentage Rate — includes both the interest rate and fees like points, giving a true cost comparison.' },
  { term:'Par Rate',          def:'The baseline mortgage rate with zero points — the market rate offered without any buydown.' },
  { term:'Origination Points', def:'Lender fees for processing the loan. Unlike discount points, they do NOT reduce your interest rate.' },
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

function pmt(rate, n, pv) {
  const r = rate/100/12
  if (r===0) return pv/n
  return pv * r * Math.pow(1+r,n) / (Math.pow(1+r,n)-1)
}

export default function MortgagePoints({ meta, category }) {
  const [loan,          setLoan]          = useState(400000)
  const [baseRate,      setBaseRate]      = useState(7.25)
  const [points,        setPoints]        = useState(2)
  const [rateReduction, setRateReduction] = useState(0.25)
  const [term,          setTerm]          = useState(30)
  const [currency,      setCurrency]      = useState(CURRENCIES[0])
  const [openFaq,       setOpenFaq]       = useState(null)
  const calcRef = useRef(null)
  const sym = currency.symbol
  const catColor = category?.color || '#6366f1'

  const pointsCost      = loan * points / 100
  const newRate         = Math.max(0.1, baseRate - points * rateReduction)
  const n               = term * 12
  const pmtBase         = pmt(baseRate, n, loan)
  const pmtNew          = pmt(newRate,  n, loan)
  const monthlySavings  = pmtBase - pmtNew
  const breakEvenMonths = monthlySavings > 0 ? Math.ceil(pointsCost / monthlySavings) : Infinity
  const totalSavingsLife= monthlySavings * n - pointsCost
  const worthIt         = breakEvenMonths < n

  function applyExample(ex) {
    setLoan(ex.loan); setBaseRate(ex.baseRate); setPoints(ex.points)
    setRateReduction(ex.rateReduction); setTerm(ex.term)
    setTimeout(()=>calcRef.current?.scrollIntoView({behavior:'smooth',block:'start'}),50)
  }

  return (
    <div style={{display:'flex',flexDirection:'column',gap:24}}>
      <div ref={calcRef} style={{scrollMarginTop:80}}>
        <CalcShell
          left={<>
            <div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:16,paddingBottom:8,borderBottom:'0.5px solid var(--border)'}}>Loan Details</div>
            <CurrencyDropdown currency={currency} setCurrency={setCurrency} catColor={catColor} />
            <FieldInput label="Loan Amount"       value={loan}     onChange={setLoan}     prefix={sym} catColor={catColor} />
            <FieldInput label="Base Interest Rate (no points)" hint="Par rate" value={baseRate} onChange={setBaseRate} suffix="%" max={20} catColor={catColor} />
            <FieldInput label="Loan Term"         value={term}     onChange={setTerm}     suffix="years" max={30} catColor={catColor} />

            <div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.07em',margin:'16px 0',paddingBottom:8,borderBottom:'0.5px solid var(--border)'}}>Points to Buy</div>
            <FieldInput label="Number of Points"  hint="1 point = 1% of loan" value={points} onChange={setPoints} suffix="pts" max={5} catColor={catColor} />
            <FieldInput label="Rate Reduction per Point" hint="Typically 0.125–0.375%" value={rateReduction} onChange={setRateReduction} suffix="%" max={0.5} catColor={catColor} />

            <div style={{padding:'12px 14px',borderRadius:10,marginBottom:14,background:catColor+'0d',border:`1px solid ${catColor}25`}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
                <span style={{fontSize:11,color:'var(--text-2)',fontFamily:"'DM Sans',sans-serif"}}>New Rate After Points</span>
                <span style={{fontSize:20,fontWeight:800,color:catColor,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{fmtP(newRate)}</span>
              </div>
              <div style={{display:'flex',justifyContent:'space-between'}}>
                <span style={{fontSize:10,color:'var(--text-3)'}}>Points cost: {fmt(pointsCost,sym)}</span>
                <span style={{fontSize:10,color:'var(--text-3)'}}>Saves: {fmt(monthlySavings,sym)}/mo</span>
              </div>
            </div>

            <div style={{display:'flex',gap:10}}>
              <button style={{flex:1,padding:13,borderRadius:10,border:'none',background:catColor,color:'#fff',fontSize:14,fontWeight:700,cursor:'pointer'}} onMouseEnter={e=>e.currentTarget.style.opacity='.85'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>Calculate →</button>
              <button onClick={()=>{setLoan(400000);setBaseRate(7.25);setPoints(2);setRateReduction(0.25);setTerm(30)}} style={{padding:'13px 18px',borderRadius:10,border:'1.5px solid var(--border-2)',background:'var(--bg-raised)',color:'var(--text-2)',fontSize:13,fontWeight:500,cursor:'pointer'}}>Reset</button>
            </div>
          </>}
          right={<>
            <ResultHero label="Break-Even Point" value={breakEvenMonths===Infinity?'N/A':`${breakEvenMonths} months`} formatter={v=>v} sub={breakEvenMonths<Infinity?`(${Math.floor(breakEvenMonths/12)}y ${breakEvenMonths%12}mo)`:'No savings'} color={catColor} />
            <BreakdownTable title="Points Analysis" rows={[
              {label:'Points Cost Upfront',       value:fmt(pointsCost,sym),          color:catColor},
              {label:'Base Rate (no points)',      value:fmtP(baseRate)},
              {label:'New Rate (with points)',     value:fmtP(newRate),                color:'#10b981'},
              {label:'Rate Reduction',             value:`−${fmtP(points*rateReduction)}`, color:'#10b981'},
              {label:'Monthly Payment — No Points', value:fmt(pmtBase,sym)},
              {label:'Monthly Payment — With Points', value:fmt(pmtNew,sym),           color:catColor},
              {label:'Monthly Savings',            value:fmt(monthlySavings,sym),      color:'#10b981', bold:true},
              {label:'Break-Even',                 value:breakEvenMonths===Infinity?'Never':`${breakEvenMonths} months`, color:worthIt?catColor:'#ef4444'},
              {label:'Net Savings Over Loan Life', value:totalSavingsLife>0?fmt(totalSavingsLife,sym):`-${fmt(Math.abs(totalSavingsLife),sym)}`, bold:true, highlight:true, color:totalSavingsLife>0?'#10b981':'#ef4444'},
            ]} />
            <AIHintCard hint={worthIt?`Break-even in ${breakEvenMonths} months (${Math.floor(breakEvenMonths/12)}y ${breakEvenMonths%12}mo). If you stay in the home beyond that, paying ${fmt(pointsCost,sym)} upfront saves you ${fmt(totalSavingsLife,sym)} over the loan life.`:`With a ${breakEvenMonths===Infinity?'no':'very long'} break-even, buying points may not make sense unless you plan to keep this loan long-term.`} />
          </>}
        />
      </div>

      {/* Break-even timeline */}
      <Section title="Break-Even Timeline" subtitle="Cumulative savings vs upfront cost">
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontFamily:"'DM Sans',sans-serif"}}>
            <thead><tr>{['Year','Cumulative Savings','Points Cost','Net Benefit'].map((h,i)=>(
              <th key={h} style={{padding:'9px 12px',fontSize:11,fontWeight:700,color:'var(--text-3)',textAlign:i===0?'left':'right',borderBottom:'1px solid var(--border)',fontFamily:"'Space Grotesk',sans-serif"}}>{h}</th>
            ))}</tr></thead>
            <tbody>
              {[1,2,3,5,7,10,15,20,term].filter((y,i,a)=>a.indexOf(y)===i&&y<=term).map((yr,i)=>{
                const cumSav = monthlySavings * yr * 12
                const netBen = cumSav - pointsCost
                return (
                  <tr key={yr} style={{background:i%2===0?'var(--bg-raised)':'transparent'}}>
                    <td style={{padding:'9px 12px',fontSize:12,fontWeight:600,color:'var(--text)'}}>Year {yr}</td>
                    <td style={{padding:'9px 12px',fontSize:12,color:'#10b981',textAlign:'right'}}>{fmt(cumSav,sym)}</td>
                    <td style={{padding:'9px 12px',fontSize:12,color:'var(--text-2)',textAlign:'right'}}>{fmt(pointsCost,sym)}</td>
                    <td style={{padding:'9px 12px',fontSize:12,fontWeight:600,textAlign:'right',color:netBen>=0?catColor:'#ef4444'}}>{netBen>=0?'+':''}{fmt(netBen,sym)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Real World Examples" subtitle="Click any example to fill the calculator">
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
          {EXAMPLES.map((ex,i)=>(
            <button key={i} onClick={()=>applyExample(ex)} style={{padding:14,borderRadius:10,border:'1.5px solid var(--border)',background:'var(--bg-raised)',cursor:'pointer',textAlign:'left',transition:'all .15s'}} onMouseEnter={e=>{e.currentTarget.style.borderColor=catColor;e.currentTarget.style.background=catColor+'10'}} onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.background='var(--bg-raised)'}}>
              <div style={{fontSize:13,fontWeight:700,color:'var(--text)',marginBottom:4}}>{ex.title}</div>
              <div style={{fontSize:11,color:'var(--text-3)',marginBottom:10,lineHeight:1.4}}>{ex.desc}</div>
              {[['Loan',fmt(ex.loan,sym)],['Base Rate',fmtP(ex.baseRate)],['Points',`${ex.points} pts`],['Reduction',`${fmtP(ex.rateReduction)}/pt`]].map(([k,v])=>(
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

      <Section title="Formula Explained">
        <div style={{background:'var(--bg-raised)',borderRadius:10,padding:'14px 16px',marginBottom:14,fontFamily:'monospace',fontSize:12,color:catColor,lineHeight:1.9}}>
          Points Cost = Loan Amount × (Points / 100){'\n'}
          New Rate = Base Rate − (Points × Rate Reduction){'\n'}
          Monthly Savings = PMT(Base Rate) − PMT(New Rate){'\n'}
          Break-Even = Points Cost / Monthly Savings
        </div>
        <p style={{fontSize:12.5,color:'var(--text-2)',lineHeight:1.75,margin:0,fontFamily:"'DM Sans',sans-serif"}}>
          Paying points is a trade-off between upfront cash and long-term savings. The break-even point is the pivotal number — if you keep the loan longer than the break-even, points save you money. If you refinance or sell beforehand, you lose money on the points.
        </p>
      </Section>

      <Section title="Key Terms">
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {GLOSSARY.map(g=><GlossaryTerm key={g.term} {...g} catColor={catColor}/>)}
        </div>
      </Section>

      <Section title="FAQ">
        {FAQ.map((f,i)=><AccordionItem key={i} q={f.q} a={f.a} isOpen={openFaq===i} onToggle={()=>setOpenFaq(openFaq===i?null:i)} catColor={catColor}/>)}
      </Section>
    </div>
  )
}
