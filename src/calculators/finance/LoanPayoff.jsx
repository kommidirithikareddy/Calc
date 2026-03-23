import { useState, useEffect, useRef } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import CalcShell from '../../components/calculator/CalcShell'
import ResultHero from '../../components/calculator/ResultHero'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'
import CurrencyDropdown, { CURRENCIES } from '../../components/calculator/CurrencyDropdown'

const fmt = (n,sym='$') => sym+Math.round(Math.max(0,n)).toLocaleString()
const fmtK = (n,sym='$') => n>=1000?sym+(n/1000).toFixed(0)+'k':fmt(n,sym)

const EXAMPLES = [
  { title:'Student Loan',   desc:'$30k at 5.5%, paying extra $100/mo',  balance:30000, rate:5.5, payment:350, extra:100 },
  { title:'Personal Loan',  desc:'$15k at 9%, minimum payments only',   balance:15000, rate:9,   payment:300, extra:0   },
  { title:'Car Loan',       desc:'$25k at 6.5%, $200 extra monthly',    balance:25000, rate:6.5, payment:480, extra:200 },
]
const FAQ = [
  { q:'How does making extra payments help?', a:'Extra payments go directly toward principal, reducing your balance faster. Because interest is calculated on the outstanding balance, a lower balance means less interest accrues each month. Even small extra payments early in a loan can save thousands in interest and years of payments.' },
  { q:'When is the best time to make extra payments?', a:'Early in the loan is most impactful. In the first months, most of your payment goes to interest. Extra payments at this stage dramatically reduce principal and the total interest you\'ll pay. Late in the loan, most of your payment is already principal, so extra payments save less.' },
  { q:'Should I pay off my loan early or invest?', a:'Compare your loan interest rate to your expected investment return. If your loan is at 4% and you can invest at 7-8%, you\'re better off investing. If your loan is at 8%+ (like credit cards), paying it off first gives a guaranteed 8%+ return. Also consider the psychological benefit of being debt-free.' },
  { q:'What is loan payoff vs loan term?', a:'Loan term is the original scheduled duration. Loan payoff is when you actually finish paying, which can be earlier if you make extra payments. This calculator shows the difference and the interest saved by paying off early.' },
]
const GLOSSARY = [
  { term:'Outstanding Balance',  def:'The remaining principal you owe, not including future interest charges.' },
  { term:'Extra Payment',        def:'Any amount paid beyond your required monthly payment. Goes directly to principal.' },
  { term:'Interest Savings',     def:'Total interest avoided by paying off earlier than the original schedule.' },
  { term:'Payoff Date',          def:'The date when your loan balance reaches zero — your debt-free date.' },
  { term:'Amortization',         def:'The process of gradually paying off a loan through regular payments covering principal and interest.' },
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

function simulate(balance, rate, payment, extra=0) {
  const mr = rate/100/12
  let bal = balance, months = 0, totalInt = 0
  const data = []
  while (bal > 0 && months < 600) {
    const intCharge = bal * mr
    const prinPaid = Math.min(payment + extra - intCharge, bal)
    if (payment + extra <= intCharge) break // payment doesn't cover interest
    totalInt += intCharge
    bal = Math.max(0, bal - prinPaid)
    months++
    if (months % 12 === 0 || bal === 0) data.push({ year: `Y${Math.ceil(months/12)}`, balance: Math.round(bal) })
  }
  return { months, totalInt, data }
}

export default function LoanPayoff({ meta, category }) {
  const [balance,setBalance]=useState(25000)
  const [rate,setRate]=useState(6.5)
  const [payment,setPayment]=useState(480)
  const [extra,setExtra]=useState(200)
  const [currency,setCurrency]=useState(CURRENCIES[0])
  const [openFaq,setOpenFaq]=useState(null)
  const calcRef=useRef(null)
  const sym=currency.symbol
  const catColor=category?.color||'#6366f1'

  const base    = simulate(balance, rate, payment, 0)
  const withExtra = simulate(balance, rate, payment, extra)
  const monthsSaved = base.months - withExtra.months
  const intSaved    = base.totalInt - withExtra.totalInt

  const hint = extra > 0
    ? `Paying ${sym}${extra}/month extra saves ${fmt(intSaved,sym)} in interest and pays off ${Math.round(monthsSaved/12*10)/10} years sooner.`
    : `At ${sym}${payment}/month you'll pay off in ${Math.ceil(base.months/12)} years and pay ${fmt(base.totalInt,sym)} in interest total.`

  function applyExample(ex){setBalance(ex.balance);setRate(ex.rate);setPayment(ex.payment);setExtra(ex.extra);setTimeout(()=>calcRef.current?.scrollIntoView({behavior:'smooth',block:'start'}),50)}

  return (
    <div style={{display:'flex',flexDirection:'column',gap:24}}>
      <div ref={calcRef} style={{scrollMarginTop:80}}>
        <CalcShell
          left={<>
            <div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:16,paddingBottom:8,borderBottom:'0.5px solid var(--border)'}}>Loan Details</div>
            <CurrencyDropdown currency={currency} setCurrency={setCurrency} catColor={catColor} />
            <FieldInput label="Current Balance" hint="Amount still owed" value={balance} onChange={setBalance} prefix={sym} min={1} catColor={catColor} />
            <FieldInput label="Annual Interest Rate" hint="% per year" value={rate} onChange={setRate} suffix="%" min={0.1} max={50} catColor={catColor} />
            <FieldInput label="Monthly Payment" hint="Your regular payment" value={payment} onChange={setPayment} prefix={sym} min={1} catColor={catColor} />
            <FieldInput label="Extra Monthly Payment" hint="Additional amount (can be 0)" value={extra} onChange={setExtra} prefix={sym} min={0} catColor={catColor} />
            <div style={{display:'flex',gap:10,marginTop:6}}>
              <button style={{flex:1,padding:13,borderRadius:10,border:'none',background:catColor,color:'#fff',fontSize:14,fontWeight:700,cursor:'pointer'}} onMouseEnter={e=>e.currentTarget.style.opacity='.85'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>Calculate →</button>
              <button onClick={()=>{setBalance(25000);setRate(6.5);setPayment(480);setExtra(200)}} style={{padding:'13px 18px',borderRadius:10,border:'1.5px solid var(--border-2)',background:'var(--bg-raised)',color:'var(--text-2)',fontSize:13,fontWeight:500,cursor:'pointer'}} onMouseEnter={e=>{e.currentTarget.style.borderColor='#ef4444';e.currentTarget.style.color='#ef4444'}} onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border-2)';e.currentTarget.style.color='var(--text-2)'}}>Reset</button>
            </div>
          </>}
          right={<>
            <ResultHero label="Payoff Time (with extra)" value={Math.round(withExtra.months/12*10)/10} formatter={n=>n.toFixed(1)+' years'} sub={extra>0?`vs ${(base.months/12).toFixed(1)} yrs without extra payment`:`${withExtra.months} months total`} color={catColor} />
            <BreakdownTable title="Payoff Comparison" rows={[
              {label:'Current Balance', value:fmt(balance,sym)},
              {label:'Months (standard)', value:`${base.months} mo`, color:'var(--text-2)'},
              {label:'Months (with extra)', value:`${withExtra.months} mo`, color:catColor},
              {label:'Interest (standard)', value:fmt(base.totalInt,sym), color:'#ef4444'},
              {label:'Interest (with extra)', value:fmt(withExtra.totalInt,sym), color:'#10b981'},
              {label:'Interest Saved', value:fmt(intSaved,sym), color:'#10b981', bold:true, highlight:true},
            ]} />
            {extra>0&&(
              <div style={{padding:'12px 14px',borderRadius:10,background:'#10b98110',border:'1px solid #10b98130'}}>
                <div style={{fontSize:13,fontWeight:700,color:'#10b981',marginBottom:4}}>💰 Paying {sym}{extra}/mo extra saves:</div>
                <div style={{display:'flex',gap:16}}>
                  <div><div style={{fontSize:18,fontWeight:800,color:'#10b981',fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{fmt(intSaved,sym)}</div><div style={{fontSize:10,color:'var(--text-3)'}}>interest saved</div></div>
                  <div><div style={{fontSize:18,fontWeight:800,color:'#10b981',fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{(monthsSaved/12).toFixed(1)} yrs</div><div style={{fontSize:10,color:'var(--text-3)'}}>sooner debt-free</div></div>
                </div>
              </div>
            )}
            <div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:12,padding:16}}>
              <div style={{fontSize:11,fontWeight:700,color:'var(--text)',marginBottom:12,fontFamily:"'Space Grotesk',sans-serif"}}>Balance Over Time</div>
              <ResponsiveContainer width="100%" height={110}>
                <AreaChart margin={{top:0,right:0,bottom:0,left:0}}>
                  <XAxis dataKey="year" tick={{fontSize:9,fill:'var(--text-3)'}} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                  <YAxis hide />
                  <Tooltip formatter={v=>[fmtK(v,sym),'Balance']} contentStyle={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:8,fontSize:11}} />
                  <Area data={base.data} type="monotone" dataKey="balance" stroke="#ef444470" fill="transparent" strokeWidth={1.5} strokeDasharray="4 4" name="Standard" />
                  <Area data={withExtra.data} type="monotone" dataKey="balance" stroke={catColor} fill={catColor+'20'} strokeWidth={2} name="With Extra" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <AIHintCard hint={hint} />
          </>}
        />
      </div>

      
      <Section title="Formula Explained" subtitle="The math behind loan payoff and extra payments">
        <div style={{background:'var(--bg-raised)',borderRadius:10,padding:'14px 16px',marginBottom:14,fontFamily:'monospace',fontSize:12,color:catColor,fontWeight:600,overflowX:'auto',whiteSpace:'nowrap'}}>
          Monthly Interest = Balance × (Annual Rate ÷ 12 ÷ 100)<br/>
          Principal Paid = Payment − Interest<br/>
          New Balance = Balance − Principal Paid
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:14}}>
          {[['Balance','Outstanding principal at start of month'],['Annual Rate','Your loan interest rate'],['Payment','Your regular monthly payment'],['Extra','Additional principal payment'],['Payoff','Month when Balance reaches zero']].map(([s,m])=>(
            <div key={s} style={{display:'flex',gap:10,padding:'8px 10px',background:'var(--bg-raised)',borderRadius:8}}>
              <span style={{fontSize:11,fontWeight:800,color:catColor,fontFamily:'monospace',minWidth:60,flexShrink:0}}>{s}</span>
              <span style={{fontSize:11.5,color:'var(--text-2)',lineHeight:1.5}}>{m}</span>
            </div>
          ))}
        </div>
        <p style={{fontSize:12,color:'var(--text-2)',lineHeight:1.75,margin:0}}>Each month, interest is charged on the outstanding balance. Extra payments reduce the balance directly — meaning less interest accrues next month. This compounding effect is why even small extra payments early in a loan save disproportionately large amounts in interest.</p>
      </Section>

      <Section title="Extra Payment Impact" subtitle="See how different extra payment amounts affect payoff time and interest">
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontFamily:"'DM Sans',sans-serif"}}>
            <thead><tr>{['Extra/Month','Payoff Time','Total Interest','Interest Saved','Time Saved'].map((h,i)=>(
              <th key={h} style={{padding:'9px 12px',fontSize:11,fontWeight:700,color:'var(--text-3)',textAlign:i===0?'left':'right',borderBottom:'1px solid var(--border)',fontFamily:"'Space Grotesk',sans-serif"}}>{h}</th>
            ))}</tr></thead>
            <tbody>
              {[0,50,100,200,500].map((e,i)=>{
                const r=simulate(balance,rate,payment,e)
                const saved=base.totalInt-r.totalInt
                const mSaved=base.months-r.months
                const isCurrent=e===extra
                return (
                  <tr key={e} style={{background:isCurrent?catColor+'08':'transparent'}}>
                    <td style={{padding:'9px 12px',fontSize:12,fontWeight:isCurrent?700:400,color:isCurrent?catColor:'var(--text)'}}>{e===0?'None':`+${sym}${e}`} {isCurrent&&'✓'}</td>
                    <td style={{padding:'9px 12px',fontSize:12,color:'var(--text)',textAlign:'right'}}>{(r.months/12).toFixed(1)} yrs</td>
                    <td style={{padding:'9px 12px',fontSize:12,color:'#ef4444',textAlign:'right'}}>{fmt(r.totalInt,sym)}</td>
                    <td style={{padding:'9px 12px',fontSize:12,color:saved>0?'#10b981':'var(--text-3)',fontWeight:saved>0?600:400,textAlign:'right'}}>{saved>0?`${fmt(saved,sym)}`:'—'}</td>
                    <td style={{padding:'9px 12px',fontSize:12,color:mSaved>0?'#10b981':'var(--text-3)',textAlign:'right'}}>{mSaved>0?`${(mSaved/12).toFixed(1)} yrs`:'—'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Real World Examples" subtitle="Click any example to fill the calculator instantly">
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
          {EXAMPLES.map((ex,i)=>(
            <button key={i} onClick={()=>applyExample(ex)} style={{padding:14,borderRadius:10,border:'1.5px solid var(--border)',background:'var(--bg-raised)',cursor:'pointer',textAlign:'left',transition:'all .15s'}} onMouseEnter={e=>{e.currentTarget.style.borderColor=catColor;e.currentTarget.style.background=catColor+'10'}} onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.background='var(--bg-raised)'}}>
              <div style={{fontSize:13,fontWeight:700,color:'var(--text)',marginBottom:4}}>{ex.title}</div>
              <div style={{fontSize:11,color:'var(--text-3)',marginBottom:10,lineHeight:1.4}}>{ex.desc}</div>
              {[['Balance',`${sym}${ex.balance.toLocaleString()}`],['Rate',`${ex.rate}%`],['Payment',`${sym}${ex.payment}/mo`],['Extra',ex.extra>0?`+${sym}${ex.extra}`:'None']].map(([k,v])=>(
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

      <Section title="Key Terms" subtitle="Loan payoff terminology — click any term">
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:8}}>
          {GLOSSARY.map((item,i)=><GlossaryTerm key={i} term={item.term} def={item.def} catColor={catColor} />)}
        </div>
      </Section>

      <Section title="Frequently Asked Questions" subtitle="Everything about paying off loans faster">
        {FAQ.map((item,i)=><AccordionItem key={i} q={item.q} a={item.a} isOpen={openFaq===i} onToggle={()=>setOpenFaq(openFaq===i?null:i)} catColor={catColor} />)}
      </Section>
    </div>
  )
}
