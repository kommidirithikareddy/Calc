import { useState, useEffect, useRef } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import ResultHero from '../../components/calculator/ResultHero'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'
import CurrencyDropdown, { CURRENCIES } from '../../components/calculator/CurrencyDropdown'

const fmt  = (n, sym='$') => sym + Math.round(Math.max(0,n)).toLocaleString()
const fmtD = (n, sym='$') => sym + (Math.round(n*100)/100).toFixed(2)
const fmtP = n => n.toFixed(2) + '%'

const EXAMPLES = [
  { title:'Home Equity Draw',  desc:'Tap equity for home renovation',   homeVal:450000, mortgage:280000, draw:50000, drawRate:8.5, repayYrs:10 },
  { title:'Large Remodel',     desc:'Kitchen & bath full renovation',   homeVal:600000, mortgage:350000, draw:80000, drawRate:8.5, repayYrs:15 },
  { title:'Debt Consolidation',desc:'Pay off high-interest credit cards',homeVal:380000, mortgage:200000, draw:30000, drawRate:7.9, repayYrs:10 },
]

const FAQ = [
  { q:'What is a HELOC?', a:'A Home Equity Line of Credit (HELOC) is a revolving credit line secured by your home\'s equity. Unlike a lump-sum home equity loan, you draw funds as needed up to your credit limit. During the draw period (typically 5-10 years) you pay interest only on the amount borrowed. After that, the repayment period begins and you pay principal plus interest.' },
  { q:'How is the HELOC credit limit determined?', a:'Lenders typically allow you to borrow up to 80-85% of your home\'s appraised value minus your remaining mortgage balance. For example: $400,000 home × 80% = $320,000 maximum. Minus $250,000 mortgage = $70,000 HELOC limit. Your credit score, income and debt-to-income ratio also affect the approved limit.' },
  { q:'What happens at the end of the draw period?', a:'When the draw period ends, the HELOC enters the repayment period (typically 10-20 years). You can no longer draw funds, and payments switch from interest-only to full principal + interest amortisation. This "payment shock" can significantly increase your monthly payment — planning for it in advance is critical.' },
  { q:'Is HELOC interest tax deductible?', a:'HELOC interest may be tax-deductible if the funds are used to "buy, build, or substantially improve" the home securing the loan (per IRS Publication 936). Interest on HELOCs used for debt consolidation, vacations or other personal expenses is generally NOT deductible since the 2017 Tax Cuts and Jobs Act. Consult a tax advisor for your specific situation.' },
  { q:'HELOC vs Home Equity Loan — which is better?', a:'A HELOC offers flexibility (draw what you need, when you need it) and variable rates that may start lower. A home equity loan provides a fixed lump sum at a fixed rate — predictable but inflexible. HELOCs suit ongoing projects with uncertain costs; home equity loans suit one-time purchases where you know the exact amount needed.' },
]

const GLOSSARY = [
  { term:'Draw Period',      def:'The initial phase of a HELOC (typically 5-10 years) during which you can borrow funds and make interest-only payments.' },
  { term:'Repayment Period', def:'The phase after the draw period (typically 10-20 years) when no new draws are allowed and you repay principal + interest.' },
  { term:'LTV Ratio',        def:'Loan-to-Value ratio: total debt secured by the home divided by the home\'s appraised value. Lenders cap HELOC+mortgage LTV at 80-85%.' },
  { term:'Draw Amount',      def:'The amount you actually borrow from your HELOC credit line. Only drawn amounts accrue interest — unused credit is free.' },
  { term:'Payment Shock',    def:'The large increase in monthly payment when transitioning from interest-only draw period to fully amortising repayment period.' },
  { term:'Combined LTV',     def:'(Mortgage balance + HELOC draw) / Home value. Most lenders require CLTV ≤ 80% to qualify for a HELOC.' },
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

export default function HELOCCalculator({ meta, category }) {
  const [homeVal,  setHomeVal]  = useState(450000)
  const [mortgage, setMortgage] = useState(280000)
  const [draw,     setDraw]     = useState(50000)
  const [drawRate, setDrawRate] = useState(8.5)
  const [repayYrs, setRepayYrs] = useState(10)
  const [drawYrs,  setDrawYrs]  = useState(5)
  const [currency, setCurrency] = useState(CURRENCIES[0])
  const [openFaq,  setOpenFaq]  = useState(null)
  const calcRef = useRef(null)
  const sym = currency.symbol
  const catColor = category?.color || '#6366f1'

  const monthlyRate   = drawRate / 100 / 12
  const maxCredit     = Math.max(0, homeVal * 0.80 - mortgage)
  const cltv          = homeVal > 0 ? ((mortgage + draw) / homeVal) * 100 : 0
  const drawPmtMonthly= draw * monthlyRate                                             // interest-only
  const nRepay        = repayYrs * 12
  const repayPmt      = monthlyRate > 0 && nRepay > 0
    ? draw * monthlyRate * Math.pow(1+monthlyRate,nRepay) / (Math.pow(1+monthlyRate,nRepay)-1)
    : draw / nRepay
  const totalDrawInt  = drawPmtMonthly * drawYrs * 12
  const totalRepayInt = repayPmt * nRepay - draw
  const totalInterest = totalDrawInt + totalRepayInt
  const totalPaid     = draw + totalInterest

  function applyExample(ex) {
    setHomeVal(ex.homeVal); setMortgage(ex.mortgage); setDraw(ex.draw)
    setDrawRate(ex.drawRate); setRepayYrs(ex.repayYrs)
    setTimeout(()=>calcRef.current?.scrollIntoView({behavior:'smooth',block:'start'}),50)
  }

  return (
    <div style={{display:'flex',flexDirection:'column',gap:24}}>
      <div ref={calcRef} style={{scrollMarginTop:80}}>
        <CalcShell
          left={<>
            <div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:16,paddingBottom:8,borderBottom:'0.5px solid var(--border)'}}>Home & Equity</div>
            <CurrencyDropdown currency={currency} setCurrency={setCurrency} catColor={catColor} />
            <FieldInput label="Home Value"         value={homeVal}  onChange={setHomeVal}  prefix={sym} catColor={catColor} />
            <FieldInput label="Remaining Mortgage" value={mortgage} onChange={setMortgage} prefix={sym} max={homeVal} catColor={catColor} />

            <div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.07em',margin:'16px 0',paddingBottom:8,borderBottom:'0.5px solid var(--border)'}}>HELOC Terms</div>
            <FieldInput label="Draw Amount"        hint="Amount you plan to borrow" value={draw}     onChange={setDraw}     prefix={sym} max={maxCredit} catColor={catColor} />
            <FieldInput label="Interest Rate (APR)" hint="Variable rate"            value={drawRate} onChange={setDrawRate} suffix="%" max={30} catColor={catColor} />
            <FieldInput label="Draw Period"         hint="Interest-only phase"       value={drawYrs}  onChange={setDrawYrs}  suffix="years" max={10} catColor={catColor} />
            <FieldInput label="Repayment Period"    hint="Principal + interest phase" value={repayYrs} onChange={setRepayYrs} suffix="years" max={25} catColor={catColor} />

            {/* Available credit preview */}
            <div style={{padding:'12px 14px',borderRadius:10,marginBottom:14,background:catColor+'0d',border:`1px solid ${catColor}25`}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
                <span style={{fontSize:11,color:'var(--text-2)',fontFamily:"'DM Sans',sans-serif"}}>Max Credit Line (80% LTV)</span>
                <span style={{fontSize:18,fontWeight:800,color:catColor,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{fmt(maxCredit,sym)}</span>
              </div>
              <div style={{display:'flex',justifyContent:'space-between'}}>
                <span style={{fontSize:10,color:'var(--text-3)'}}>CLTV: {fmtP(cltv)}</span>
                <span style={{fontSize:10,color:cltv>80?'#ef4444':'#10b981',fontWeight:600}}>{cltv>80?'⚠ Over 80% LTV':'✓ Within 80% LTV'}</span>
              </div>
            </div>

            <div style={{display:'flex',gap:10}}>
              <button style={{flex:1,padding:13,borderRadius:10,border:'none',background:catColor,color:'#fff',fontSize:14,fontWeight:700,cursor:'pointer'}} onMouseEnter={e=>e.currentTarget.style.opacity='.85'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>Calculate →</button>
              <button onClick={()=>{setHomeVal(450000);setMortgage(280000);setDraw(50000);setDrawRate(8.5);setRepayYrs(10);setDrawYrs(5)}} style={{padding:'13px 18px',borderRadius:10,border:'1.5px solid var(--border-2)',background:'var(--bg-raised)',color:'var(--text-2)',fontSize:13,fontWeight:500,cursor:'pointer'}}>Reset</button>
            </div>
          </>}
          right={<>
            <ResultHero label="Draw Period Payment" value={drawPmtMonthly} formatter={n=>`${sym}${Math.round(n).toLocaleString()}/mo`} sub="Interest-only during draw period" color={catColor} />
            <BreakdownTable title="Payment Summary" rows={[
              {label:'Max Credit Line (80% LTV)', value:fmt(maxCredit,sym),  color:catColor},
              {label:'Draw Amount',               value:fmt(draw,sym)},
              {label:'Combined LTV',              value:fmtP(cltv), color:cltv>80?'#ef4444':'#10b981'},
              {label:'Draw Period Payment (Int only)', value:`${sym}${Math.round(drawPmtMonthly).toLocaleString()}/mo`, color:catColor},
              {label:'Repayment Payment (P+I)',    value:`${sym}${Math.round(repayPmt).toLocaleString()}/mo`, color:'#f59e0b', bold:true},
              {label:'Payment Increase',          value:`+${fmt(repayPmt-drawPmtMonthly,sym)}/mo`, color:'#ef4444'},
              {label:'Total Interest Paid',       value:fmt(totalInterest,sym)},
              {label:'Total Cost of HELOC',       value:fmt(totalPaid,sym), bold:true, highlight:true},
            ]} />
            <AIHintCard hint={`Your draw period payment is ${fmt(drawPmtMonthly,sym)}/mo (interest only). When repayment starts, payments jump to ${fmt(repayPmt,sym)}/mo — a ${fmt(repayPmt-drawPmtMonthly,sym)}/mo increase. Plan for this payment shock.`} />
          </>}
        />
      </div>

      <Section title="Real World Examples" subtitle="Click any example to fill the calculator">
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
          {EXAMPLES.map((ex,i)=>(
            <button key={i} onClick={()=>applyExample(ex)} style={{padding:14,borderRadius:10,border:'1.5px solid var(--border)',background:'var(--bg-raised)',cursor:'pointer',textAlign:'left',transition:'all .15s'}} onMouseEnter={e=>{e.currentTarget.style.borderColor=catColor;e.currentTarget.style.background=catColor+'10'}} onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.background='var(--bg-raised)'}}>
              <div style={{fontSize:13,fontWeight:700,color:'var(--text)',marginBottom:4}}>{ex.title}</div>
              <div style={{fontSize:11,color:'var(--text-3)',marginBottom:10,lineHeight:1.4}}>{ex.desc}</div>
              {[['Home Value',fmt(ex.homeVal,sym)],['Mortgage',fmt(ex.mortgage,sym)],['Draw',fmt(ex.draw,sym)],['Rate',fmtP(ex.drawRate)]].map(([k,v])=>(
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
          Max Credit = Home Value × 80% − Mortgage Balance{'\n'}
          Draw Payment = Draw × (Rate/12)  [interest-only]{'\n'}
          Repay PMT = Draw × r(1+r)ⁿ / [(1+r)ⁿ−1]
        </div>
        <p style={{fontSize:12.5,color:'var(--text-2)',lineHeight:1.75,margin:0,fontFamily:"'DM Sans',sans-serif"}}>
          During the draw period, you pay only interest on the outstanding balance — keeping payments low but building no equity. At repayment, payments switch to a fully amortising schedule covering both principal and interest, significantly increasing the monthly payment.
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
