import { useState, useEffect, useRef } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import ResultHero from '../../components/calculator/ResultHero'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'
import CurrencyDropdown, { CURRENCIES } from '../../components/calculator/CurrencyDropdown'

const fmt = (n, sym='$') => sym + Math.round(Math.max(0,n)).toLocaleString()

const EXAMPLES = [
  { title:'Bond Valuation',    desc:'$10,000 bond in 5 years at 6%',   fv:10000, rate:6,   years:5  },
  { title:'Retirement Goal',   desc:'Need $500k in 20 years at 7%',    fv:500000,rate:7,   years:20 },
  { title:'Business Deal',     desc:'$50k payment in 3 years at 8%',   fv:50000, rate:8,   years:3  },
]

const FAQ = [
  { q:'What is Present Value?', a:'Present Value (PV) is the current worth of a future sum of money, given a specific rate of return. It answers: "How much money do I need today so that it grows to a target amount in the future?" It\'s the foundation of all discounted cash flow analysis and is essential for comparing investments with different time horizons.' },
  { q:'What is the discount rate?', a:'The discount rate is the rate of return used to bring future cash flows back to the present. It represents your opportunity cost — the return you could earn elsewhere. Higher discount rates make future money worth less today. It could be your expected investment return, cost of capital, or a risk-adjusted rate.' },
  { q:'How is PV different from FV?', a:'Future Value (FV) asks "What will this money grow to?" while Present Value (PV) asks "What is that future amount worth today?" They are mathematical inverses. PV discounts future money backward in time; FV compounds present money forward. Together they form the basis of time value of money analysis.' },
  { q:'Where is Present Value used?', a:'PV is used in bond pricing (what to pay today for future coupon payments), business valuation (discounting projected cash flows), real estate (evaluating future rental income), pension funds (calculating lump sum equivalents), and loan analysis (finding the current value of future payment streams).' },
  { q:'What discount rate should I use?', a:'Use the rate that reflects your opportunity cost or required return. For personal use: your expected investment return (6-8%). For business: the weighted average cost of capital (WACC). For risk-free analysis: Treasury bond yields. The higher the risk of the future cash flow, the higher the discount rate you should use.' },
]

const GLOSSARY = [
  { term:'Present Value (PV)',  def:'The current value of a future sum of money, discounted at a specific rate. What you\'d pay today for a future amount.' },
  { term:'Future Value (FV)',   def:'The value you expect to receive in the future — the target amount you\'re discounting back to today.' },
  { term:'Discount Rate',       def:'The rate used to reduce future cash flows to present value. Represents opportunity cost or required return.' },
  { term:'Discounting',         def:'The process of calculating the present value of future cash flows — the opposite of compounding.' },
  { term:'Time Value of Money', def:'The principle that money today is worth more than the same amount in the future, because it can earn returns.' },
  { term:'NPV',                 def:'Net Present Value — the sum of all discounted future cash flows minus the initial investment.' },
]

function FieldInput({ label, hint, value, onChange, prefix, suffix, min=0, max, catColor='#6366f1' }) {
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

export default function PresentValue({ meta, category }) {
  const [fv,setFv]=useState(10000)
  const [rate,setRate]=useState(6)
  const [years,setYears]=useState(5)
  const [currency,setCurrency]=useState(CURRENCIES[0])
  const [openFaq,setOpenFaq]=useState(null)
  const calcRef=useRef(null)
  const sym=currency.symbol
  const catColor=category?.color||'#6366f1'

  const pv = fv / Math.pow(1 + rate/100, years)
  const discount = fv - pv
  const discountPct = fv > 0 ? (discount/fv)*100 : 0

  // Sensitivity table — different rates
  const rates = [rate-2, rate-1, rate, rate+1, rate+2].filter(r=>r>0)

  const hint = `To receive ${fmt(fv,sym)} in ${years} years at ${rate}% return, you need ${fmt(pv,sym)} today. That's a discount of ${fmt(discount,sym)} (${discountPct.toFixed(1)}%).`

  function applyExample(ex){setFv(ex.fv);setRate(ex.rate);setYears(ex.years);setTimeout(()=>calcRef.current?.scrollIntoView({behavior:'smooth',block:'start'}),50)}

  return (
    <div style={{display:'flex',flexDirection:'column',gap:24}}>
      <div ref={calcRef} style={{scrollMarginTop:80}}>
        <CalcShell
          left={<>
            <div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:16,paddingBottom:8,borderBottom:'0.5px solid var(--border)'}}>Calculate Present Value</div>
            <CurrencyDropdown currency={currency} setCurrency={setCurrency} catColor={catColor} />
            <FieldInput label="Future Value" hint="Target amount" value={fv} onChange={setFv} prefix={sym} min={1} catColor={catColor} />
            <FieldInput label="Discount Rate" hint="Annual rate %" value={rate} onChange={setRate} suffix="%" min={0.1} max={50} catColor={catColor} />
            <FieldInput label="Time Period" hint="Years until payment" value={years} onChange={setYears} suffix="yrs" min={1} max={50} catColor={catColor} />
            <div style={{display:'flex',gap:10,marginTop:6}}>
              <button style={{flex:1,padding:13,borderRadius:10,border:'none',background:catColor,color:'#fff',fontSize:14,fontWeight:700,cursor:'pointer'}} onMouseEnter={e=>e.currentTarget.style.opacity='.85'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>Calculate →</button>
              <button onClick={()=>{setFv(10000);setRate(6);setYears(5)}} style={{padding:'13px 18px',borderRadius:10,border:'1.5px solid var(--border-2)',background:'var(--bg-raised)',color:'var(--text-2)',fontSize:13,fontWeight:500,cursor:'pointer'}} onMouseEnter={e=>{e.currentTarget.style.borderColor='#ef4444';e.currentTarget.style.color='#ef4444'}} onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border-2)';e.currentTarget.style.color='var(--text-2)'}}>Reset</button>
            </div>
          </>}
          right={<>
            <ResultHero label="Present Value" value={Math.round(pv)} formatter={n=>sym+Math.round(Math.max(0,n)).toLocaleString()} sub={`To receive ${fmt(fv,sym)} in ${years} years at ${rate}%`} color={catColor} />
            <BreakdownTable title="Valuation Summary" rows={[
              {label:'Future Value (target)', value:fmt(fv,sym)},
              {label:'Discount Rate', value:`${rate}% per year`},
              {label:'Time Period', value:`${years} years`},
              {label:'Total Discount', value:fmt(discount,sym), color:'#ef4444'},
              {label:'Present Value', value:fmt(pv,sym), color:catColor, bold:true, highlight:true},
            ]} />
            <AIHintCard hint={hint} />
          </>}
        />
      </div>

      <Section title="Rate Sensitivity" subtitle="How the discount rate affects present value">
        <p style={{fontSize:12,color:'var(--text-2)',marginBottom:14,lineHeight:1.6}}>Higher discount rates make future money worth less today. See how the PV of {fmt(fv,sym)} in {years} years changes across different rates:</p>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontFamily:"'DM Sans',sans-serif"}}>
            <thead><tr>{['Rate','Present Value','Discount','Discount %'].map((h,i)=>(
              <th key={h} style={{padding:'9px 12px',fontSize:11,fontWeight:700,color:'var(--text-3)',textAlign:i===0?'left':'right',borderBottom:'1px solid var(--border)',fontFamily:"'Space Grotesk',sans-serif"}}>{h}</th>
            ))}</tr></thead>
            <tbody>
              {rates.map((r,i)=>{
                const p=fv/Math.pow(1+r/100,years)
                const d=fv-p
                const isCurrent=r===rate
                return (
                  <tr key={r} style={{background:isCurrent?catColor+'08':'transparent'}}>
                    <td style={{padding:'9px 12px',fontSize:12,fontWeight:isCurrent?700:500,color:isCurrent?catColor:'var(--text)'}}>{r}% {isCurrent&&'✓'}</td>
                    <td style={{padding:'9px 12px',fontSize:12,fontWeight:600,color:'var(--text)',textAlign:'right'}}>{fmt(p,sym)}</td>
                    <td style={{padding:'9px 12px',fontSize:12,color:'#ef4444',textAlign:'right'}}>{fmt(d,sym)}</td>
                    <td style={{padding:'9px 12px',fontSize:12,color:'var(--text-3)',textAlign:'right'}}>{((d/fv)*100).toFixed(1)}%</td>
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
              {[['Future Value',`${sym}${ex.fv.toLocaleString()}`],['Rate',`${ex.rate}%`],['Period',`${ex.years} yrs`],['PV Today',`${sym}${Math.round(ex.fv/Math.pow(1+ex.rate/100,ex.years)).toLocaleString()}`]].map(([k,v])=>(
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

      <Section title="Formula Explained" subtitle="The math behind Present Value">
        <div style={{background:'var(--bg-raised)',borderRadius:10,padding:'14px 16px',marginBottom:14,fontFamily:'monospace',fontSize:13,color:catColor,fontWeight:600}}>
          PV = FV / (1 + r)^n
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:14}}>
          {[['PV','Present value — what you need today'],['FV','Future value — the target amount'],['r','Annual discount rate (as decimal)'],['n','Number of years']].map(([s,m])=>(
            <div key={s} style={{display:'flex',gap:10,padding:'8px 10px',background:'var(--bg-raised)',borderRadius:8}}>
              <span style={{fontSize:13,fontWeight:800,color:catColor,fontFamily:'monospace',minWidth:20,flexShrink:0}}>{s}</span>
              <span style={{fontSize:11.5,color:'var(--text-2)',lineHeight:1.5}}>{m}</span>
            </div>
          ))}
        </div>
        <p style={{fontSize:12,color:'var(--text-2)',lineHeight:1.75,margin:0}}>Present Value is the inverse of Future Value — instead of compounding forward, you discount backward. A higher discount rate or longer time period makes the present value smaller, because money in the far future is worth less today than money received soon.</p>
      </Section>

      <Section title="Key Terms" subtitle="Present Value terminology — click any term">
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:8}}>
          {GLOSSARY.map((item,i)=><GlossaryTerm key={i} term={item.term} def={item.def} catColor={catColor} />)}
        </div>
      </Section>

      <Section title="Frequently Asked Questions" subtitle="Everything about Present Value">
        {FAQ.map((item,i)=><AccordionItem key={i} q={item.q} a={item.a} isOpen={openFaq===i} onToggle={()=>setOpenFaq(openFaq===i?null:i)} catColor={catColor} />)}
      </Section>
    </div>
  )
}
