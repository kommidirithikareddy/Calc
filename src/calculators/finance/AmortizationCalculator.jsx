import { useState, useEffect, useRef } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import CalcShell from '../../components/calculator/CalcShell'
import ResultHero from '../../components/calculator/ResultHero'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'
import CurrencyDropdown, { CURRENCIES } from '../../components/calculator/CurrencyDropdown'

const fmt = (n,sym='$') => sym+Math.round(Math.max(0,n)).toLocaleString()

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


const EXAMPLES_AMORT = [
  { title:'Home Mortgage',    desc:'Standard 30-year home loan',   loanAmt:300000, rate:6.5, termYrs:30 },
  { title:'Car Loan',         desc:'5-year auto financing',        loanAmt:25000,  rate:7.0, termYrs:5  },
  { title:'Personal Loan',    desc:'3-year personal loan',         loanAmt:15000,  rate:10,  termYrs:3  },
]
const FAQ_AMORT = [
  {q:'What is amortization?',a:'Amortization is the process of paying off a loan through regular scheduled payments. Each payment covers both the interest accrued and a portion of the principal. In the early months, most of your payment goes to interest. As the balance decreases, more of each payment goes to principal reduction.'},
  {q:'Why are early payments mostly interest?',a:'Interest is calculated on the outstanding balance each month. When the balance is high (early in the loan), interest charges are high. As you pay down the principal, the balance falls, so less interest accrues — meaning more of your fixed payment goes toward principal. This is the amortization effect.'},
  {q:'How does making extra payments affect amortization?',a:'Extra payments go directly to principal reduction, which lowers your outstanding balance. A lower balance means less interest in subsequent months, which accelerates principal paydown. Even one extra payment per year can shave years off a 30-year mortgage and save tens of thousands in interest.'},
  {q:'What is negative amortization?',a:'Negative amortization occurs when your monthly payment is less than the interest charged — your balance grows instead of shrinks. This can happen with certain adjustable-rate mortgages or income-based repayment plans. It is dangerous because debt grows even while making payments.'},
]
const GLOSSARY_AMORT = [
  {term:'Amortization',      def:'The gradual repayment of a loan through regular payments that cover both principal and interest.'},
  {term:'Principal',         def:'The outstanding loan balance — the amount borrowed minus all principal payments made so far.'},
  {term:'Interest',          def:'The cost of borrowing — calculated monthly on the outstanding principal balance.'},
  {term:'Amortization Schedule', def:'A complete table showing every payment, the interest portion, principal portion, and remaining balance.'},
  {term:'Equity',            def:'The portion of the loan already repaid — total borrowed minus current outstanding balance.'},
  {term:'Negative Amortization', def:'When monthly payments dont cover interest charges, causing the loan balance to grow.'},
]

function AccordionItemA({q,a,isOpen,onToggle,catColor}) {
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
function GlossaryTermA({term,def,catColor}) {
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
export default function AmortizationCalculator({ meta, category }) {
  const [loanAmt,setLoanAmt]=useState(200000)
  const [rate,setRate]=useState(6.5)
  const [termYrs,setTermYrs]=useState(30)
  const [currency,setCurrency]=useState(CURRENCIES[0])
  const [showAll,setShowAll]=useState(false)
  const [openFaq,setOpenFaq]=useState(null)
  const calcRef=useRef(null)
  const sym=currency.symbol
  const catColor=category?.color||'#6366f1'

  function applyExample(ex){setLoanAmt(ex.loanAmt);setRate(ex.rate);setTermYrs(ex.termYrs);setTimeout(()=>window.scrollTo({top:0,behavior:'smooth'}),50)}
  const mr=rate/100/12
  const tm=termYrs*12
  const emi=mr===0?loanAmt/tm:loanAmt*mr*Math.pow(1+mr,tm)/(Math.pow(1+mr,tm)-1)
  const totalPaid=emi*tm
  const totalInt=totalPaid-loanAmt

  // Build full amortization
  const rows=[]
  let bal=loanAmt, cumInt=0, cumPrin=0
  for(let m=1;m<=tm;m++){
    const intPaid=bal*mr
    const prinPaid=Math.min(emi-intPaid,bal)
    bal=Math.max(0,bal-prinPaid)
    cumInt+=intPaid; cumPrin+=prinPaid
    if(m%12===0||m===tm){
      rows.push({period:`Year ${Math.ceil(m/12)}`,emi:Math.round(emi),principal:Math.round(cumPrin),interest:Math.round(cumInt),balance:Math.round(bal)})
      cumInt=0;cumPrin=0
    }
  }

  // Chart
  const chartRows=[]
  bal=loanAmt; let cInt=0,cPrin=0
  for(let m=1;m<=tm;m++){
    const ip=bal*mr,pp=Math.min(emi-ip,bal)
    bal=Math.max(0,bal-pp);cInt+=ip;cPrin+=pp
    if(m%12===0||m===tm) chartRows.push({year:`Y${Math.ceil(m/12)}`,balance:Math.round(bal),equity:Math.round(loanAmt-bal)})
  }

  const visible=showAll?rows:rows.slice(0,5)
  const hint=`Monthly payment: ${fmt(emi,sym)}. Total interest over ${termYrs} years: ${fmt(totalInt,sym)} — ${((totalInt/loanAmt)*100).toFixed(0)}% of the loan. You build 50% equity at year ${rows.findIndex(r=>r.balance<=loanAmt/2)+1 || termYrs}.`

  return (
    <div style={{display:'flex',flexDirection:'column',gap:24}}>
      <div ref={calcRef} style={{scrollMarginTop:80}}>
        <CalcShell
          left={<>
            <div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:16,paddingBottom:8,borderBottom:'0.5px solid var(--border)'}}>Loan Details</div>
            <CurrencyDropdown currency={currency} setCurrency={setCurrency} catColor={catColor} />
            <FieldInput label="Loan Amount" hint="Principal borrowed" value={loanAmt} onChange={setLoanAmt} prefix={sym} min={1} catColor={catColor} />
            <FieldInput label="Annual Interest Rate" hint="% per year" value={rate} onChange={setRate} suffix="%" min={0.1} max={30} catColor={catColor} />
            <FieldInput label="Loan Term" hint="Years" value={termYrs} onChange={setTermYrs} suffix="yrs" min={1} max={30} catColor={catColor} />
            <div style={{display:'flex',gap:10,marginTop:6}}>
              <button style={{flex:1,padding:13,borderRadius:10,border:'none',background:catColor,color:'#fff',fontSize:14,fontWeight:700,cursor:'pointer'}} onMouseEnter={e=>e.currentTarget.style.opacity='.85'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>Generate Schedule →</button>
              <button onClick={()=>{setLoanAmt(200000);setRate(6.5);setTermYrs(30)}} style={{padding:'13px 18px',borderRadius:10,border:'1.5px solid var(--border-2)',background:'var(--bg-raised)',color:'var(--text-2)',fontSize:13,fontWeight:500,cursor:'pointer'}} onMouseEnter={e=>{e.currentTarget.style.borderColor='#ef4444';e.currentTarget.style.color='#ef4444'}} onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border-2)';e.currentTarget.style.color='var(--text-2)'}}>Reset</button>
            </div>
          </>}
          right={<>
            <ResultHero label="Monthly Payment" value={Math.round(emi)} formatter={n=>sym+Math.round(Math.max(0,n)).toLocaleString()} sub={`Over ${termYrs} years at ${rate}% interest`} color={catColor} />
            <BreakdownTable title="Loan Summary" rows={[
              {label:'Loan Amount',   value:fmt(loanAmt,sym),  color:catColor},
              {label:'Total Interest',value:fmt(totalInt,sym),  color:'#ef4444'},
              {label:'Total Paid',    value:fmt(totalPaid,sym), color:catColor, bold:true, highlight:true},
            ]} />
            <div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:12,padding:16}}>
              <div style={{fontSize:11,fontWeight:700,color:'var(--text)',marginBottom:12,fontFamily:"'Space Grotesk',sans-serif"}}>Equity vs Balance</div>
              <ResponsiveContainer width="100%" height={110}>
                <AreaChart data={chartRows.filter((_,i)=>i%2===0||i===chartRows.length-1)} margin={{top:0,right:0,bottom:0,left:0}}>
                  <XAxis dataKey="year" tick={{fontSize:9,fill:'var(--text-3)'}} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                  <YAxis hide />
                  <Tooltip formatter={v=>[fmt(v,sym),'Value']} contentStyle={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:8,fontSize:11}} />
                  <Area type="monotone" dataKey="equity" stroke="#10b981" fill="#10b98125" strokeWidth={2} name="Equity" />
                  <Area type="monotone" dataKey="balance" stroke={catColor} fill={catColor+'15'} strokeWidth={2} name="Balance" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <AIHintCard hint={hint} />
          </>}
        />
      </div>

      <Section title="Amortization Schedule" subtitle="Year-by-year breakdown of every payment">
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontFamily:"'DM Sans',sans-serif"}}>
            <thead><tr>{['Period','Payment','Principal','Interest','Balance'].map((h,i)=>(
              <th key={h} style={{padding:'9px 12px',fontSize:11,fontWeight:700,color:'var(--text-3)',textAlign:i===0?'left':'right',borderBottom:'1px solid var(--border)',fontFamily:"'Space Grotesk',sans-serif"}}>{h}</th>
            ))}</tr></thead>
            <tbody>
              {visible.map((r,i)=>(
                <tr key={i} style={{background:i%2===0?'var(--bg-raised)':'transparent'}}>
                  <td style={{padding:'9px 12px',fontSize:12,fontWeight:600,color:catColor}}>{r.period}</td>
                  <td style={{padding:'9px 12px',fontSize:12,color:'var(--text)',textAlign:'right'}}>{sym}{r.emi.toLocaleString()}</td>
                  <td style={{padding:'9px 12px',fontSize:12,color:'#10b981',textAlign:'right'}}>{sym}{r.principal.toLocaleString()}</td>
                  <td style={{padding:'9px 12px',fontSize:12,color:'#ef4444',textAlign:'right'}}>{sym}{r.interest.toLocaleString()}</td>
                  <td style={{padding:'9px 12px',fontSize:12,color:'var(--text-2)',textAlign:'right'}}>{sym}{r.balance.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length>5&&(
            <button onClick={()=>setShowAll(s=>!s)} style={{marginTop:12,width:'100%',padding:'9px',borderRadius:8,border:`1px solid ${catColor}40`,background:catColor+'08',color:catColor,fontSize:12,fontWeight:600,cursor:'pointer'}}>
              {showAll?'Show less ↑':`Show all ${rows.length} years ↓`}
            </button>
          )}
        </div>
      </Section>
<Section title="Real World Examples" subtitle="Click any example to fill the calculator instantly">
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
          {EXAMPLES_AMORT.map((ex,i)=>(
            <button key={i} onClick={()=>applyExample(ex)} style={{padding:14,borderRadius:10,border:'1.5px solid var(--border)',background:'var(--bg-raised)',cursor:'pointer',textAlign:'left',transition:'all .15s'}} onMouseEnter={e=>{e.currentTarget.style.borderColor=catColor;e.currentTarget.style.background=catColor+'10'}} onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.background='var(--bg-raised)'}}>
              <div style={{fontSize:13,fontWeight:700,color:'var(--text)',marginBottom:4}}>{ex.title}</div>
              <div style={{fontSize:11,color:'var(--text-3)',marginBottom:10,lineHeight:1.4}}>{ex.desc}</div>
              {[['Amount',`${sym}${ex.loanAmt.toLocaleString()}`],['Rate',`${ex.rate}%`],['Term',`${ex.termYrs} yrs`]].map(([k,v])=>(
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

      <Section title="Formula Explained" subtitle="The math behind amortization">
        <div style={{background:'var(--bg-raised)',borderRadius:10,padding:'14px 16px',marginBottom:14,fontFamily:'monospace',fontSize:13,color:catColor,fontWeight:600,overflowX:'auto',whiteSpace:'nowrap'}}>
          EMI = P × r × (1+r)^n / ((1+r)^n − 1)
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:14}}>
          {[['P','Principal loan amount'],['r','Monthly rate = Annual rate ÷ 12 ÷ 100'],['n','Total payments = Years × 12'],['Interest','Balance × Monthly rate each month'],['Principal','EMI − Monthly interest charge'],['Balance','Previous balance − Principal paid']].map(([s,m])=>(
            <div key={s} style={{display:'flex',gap:10,padding:'8px 10px',background:'var(--bg-raised)',borderRadius:8}}>
              <span style={{fontSize:12,fontWeight:800,color:catColor,fontFamily:'monospace',minWidth:56,flexShrink:0}}>{s}</span>
              <span style={{fontSize:11.5,color:'var(--text-2)',lineHeight:1.5}}>{m}</span>
            </div>
          ))}
        </div>
        <p style={{fontSize:12,color:'var(--text-2)',lineHeight:1.75,margin:0}}>In amortization, the total payment stays constant but its composition shifts. Early payments are mostly interest because the balance is large. As you repay principal, the balance falls, so less interest accrues — and more of the same fixed payment goes to principal. This is why the last few payments are almost entirely principal.</p>
      </Section>

      <Section title="Key Terms" subtitle="Amortization terminology — click any term">
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:8}}>
          {GLOSSARY_AMORT.map((item,i)=><GlossaryTermA key={i} term={item.term} def={item.def} catColor={catColor} />)}
        </div>
      </Section>

      <Section title="Frequently Asked Questions" subtitle="Everything about amortization">
        {FAQ_AMORT.map((item,i)=><AccordionItemA key={i} q={item.q} a={item.a} isOpen={openFaq===i} onToggle={()=>setOpenFaq(openFaq===i?null:i)} catColor={catColor} />)}
      </Section>
    </div>
  )
}