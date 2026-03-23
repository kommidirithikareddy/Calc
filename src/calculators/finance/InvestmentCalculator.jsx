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
  { title:'Index Fund',    desc:'Long-term S&P 500 investing',       initial:10000,monthly:500, rate:10, years:25, inflation:3 },
  { title:'Bond Portfolio',desc:'Conservative income portfolio',     initial:50000,monthly:200, rate:5,  years:15, inflation:3 },
  { title:'Aggressive',    desc:'High-growth portfolio, young investor',initial:5000,monthly:1000,rate:12,years:30,inflation:3 },
]
const FAQ = [
  { q:'How is this different from the Compound Interest calculator?', a:'This Investment Calculator adds inflation adjustment — showing both nominal returns (what the number says) and real returns (what it\'s worth in today\'s purchasing power). It also shows a more complete picture of total contributions vs growth, and allows you to model more realistic investment scenarios.' },
  { q:'What is inflation adjustment?', a:'Inflation erodes purchasing power over time. $1 million in 30 years won\'t buy what $1 million buys today. Inflation-adjusted (real) future value converts your result to today\'s dollars, so you can realistically evaluate whether you\'re on track for your goals. At 3% inflation over 30 years, your purchasing power is halved.' },
  { q:'What return should I expect?', a:'S&P 500 historical nominal average: ~10%/year. After inflation (~3%): ~7% real. Bonds: 4-5% nominal. A balanced 60/40 portfolio: ~7-8% nominal. These are long-term averages with significant year-to-year variation. Never assume you\'ll get these exact returns; they\'re historical benchmarks, not guarantees.' },
  { q:'What is dollar-cost averaging?', a:'Dollar-cost averaging means investing a fixed amount regularly (like monthly) regardless of market conditions. When prices are low, you buy more shares; when high, fewer. Over time this reduces the impact of volatility. This calculator\'s monthly contribution field models dollar-cost averaging.' },
  { q:'How much do I need to retire?', a:'A common rule is 25x your annual expenses (from the 4% safe withdrawal rate). If you spend $60,000/year, you need $1.5 million. Use the FIRE Calculator for a more detailed retirement projection. This Investment Calculator shows how to get there — enter your current savings and monthly contributions to see when you\'ll reach your target.' },
]
const GLOSSARY = [
  { term:'Nominal Return',    def:'The stated return before adjusting for inflation. What the number shows.' },
  { term:'Real Return',       def:'Return after subtracting inflation. Represents actual increase in purchasing power.' },
  { term:'Inflation',         def:'The rate at which prices rise over time, eroding the purchasing power of money.' },
  { term:'Diversification',   def:'Spreading investments across asset classes to reduce risk without sacrificing expected returns.' },
  { term:'Rebalancing',       def:'Periodically adjusting portfolio allocations back to target percentages as markets shift.' },
  { term:'Expense Ratio',     def:'Annual fee charged by a fund, expressed as a percentage of assets. Even 1% compounds significantly over decades.' },
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


function ComparisonInvestment({initial,monthly,rate,years,inflation,sym,catColor}) {
  const [activeIdx,setActiveIdx]=useState(2)
  function calcFV(iv,m,r,y){const mr=r/100/12,n=y*12;return iv*Math.pow(1+mr,n)+(mr===0?m*n:m*(Math.pow(1+mr,n)-1)/mr)}
  const base=calcFV(initial,monthly,rate,years)
  const scenarios=[
    {label:'2% higher return',emoji:'📈',desc:`At ${rate+2}%/yr`,iv:initial,m:monthly,r:rate+2,y:years},
    {label:'Double monthly',emoji:'💰',desc:`${sym}${monthly*2}/month`,iv:initial,m:monthly*2,r:rate,y:years},
    {label:'Current plan',emoji:'📍',desc:'Your actual plan',iv:initial,m:monthly,r:rate,y:years,isCurrent:true},
    {label:'5 years longer',emoji:'📅',desc:`${years+5} years total`,iv:initial,m:monthly,r:rate,y:years+5},
    {label:'2% lower return',emoji:'📉',desc:`At ${Math.max(1,rate-2)}%/yr`,iv:initial,m:monthly,r:Math.max(1,rate-2),y:years},
    {label:'Start with 2x',emoji:'🚀',desc:`${sym}${initial*2} initial`,iv:initial*2,m:monthly,r:rate,y:years},
  ]
  const active=scenarios[activeIdx],activeVal=calcFV(active.iv,active.m,active.r,active.y),diff=activeVal-base,better=diff>=0
  return (
    <div>
      <p style={{fontSize:12.5,color:'var(--text-2)',lineHeight:1.7,marginBottom:16,fontFamily:"'DM Sans',sans-serif"}}>Time, return rate, and contribution size all dramatically affect your final balance. Click any scenario to compare instantly.</p>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,marginBottom:20}}>
        {scenarios.map((s,i)=>{const val=calcFV(s.iv,s.m,s.r,s.y),d=val-base,isActive=activeIdx===i;return(
          <button key={i} onClick={()=>setActiveIdx(i)} style={{padding:'12px',borderRadius:10,textAlign:'left',cursor:'pointer',border:`1.5px solid ${isActive?catColor:'var(--border)'}`,background:isActive?catColor+'0d':'var(--bg-raised)',transition:'all .15s'}}>
            <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:5}}><span style={{fontSize:16}}>{s.emoji}</span><span style={{fontSize:11,fontWeight:700,color:isActive?catColor:'var(--text)',fontFamily:"'Space Grotesk',sans-serif"}}>{s.label}</span>{s.isCurrent&&<span style={{fontSize:9,fontWeight:700,background:catColor,color:'#fff',padding:'1px 5px',borderRadius:6,marginLeft:'auto'}}>YOU</span>}</div>
            <div style={{fontSize:10,color:'var(--text-3)',marginBottom:7,lineHeight:1.4}}>{s.desc}</div>
            <div style={{fontSize:13,fontWeight:800,color:isActive?catColor:'var(--text)',fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{sym}{Math.round(val).toLocaleString()}</div>
            {!s.isCurrent&&<div style={{fontSize:10,fontWeight:600,color:d>=0?'#10b981':'#ef4444',marginTop:2}}>{d>=0?'+':''}{sym}{Math.abs(Math.round(d)).toLocaleString()}</div>}
          </button>
        )})}
      </div>
      {!active.isCurrent&&(
        <div style={{padding:'14px 16px',borderRadius:12,background:better?'#10b98108':'#ef444408',border:`1.5px solid ${better?'#10b98130':'#ef444430'}`}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:16,flexWrap:'wrap'}}>
            <div style={{flex:1}}><div style={{fontSize:13,fontWeight:700,color:'var(--text)',marginBottom:6,fontFamily:"'Space Grotesk',sans-serif"}}>{active.emoji} {active.label}</div><div style={{fontSize:12,color:'var(--text-2)',lineHeight:1.65,fontFamily:"'DM Sans',sans-serif"}}>{better?`This grows to ${sym}${Math.round(activeVal).toLocaleString()} — ${sym}${Math.abs(Math.round(diff)).toLocaleString()} more than your current plan.`:`This results in ${sym}${Math.round(activeVal).toLocaleString()} — ${sym}${Math.abs(Math.round(diff)).toLocaleString()} less than your current plan.`}</div></div>
            <div style={{textAlign:'right',flexShrink:0}}><div style={{fontSize:22,fontWeight:800,color:better?'#10b981':'#ef4444',fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{better?'+':''}{sym}{Math.abs(Math.round(diff)).toLocaleString()}</div><div style={{fontSize:11,color:'var(--text-3)',marginTop:2}}>vs your plan</div></div>
          </div>
        </div>
      )}
      {active.isCurrent&&<div style={{padding:'14px 16px',borderRadius:10,background:catColor+'08',border:`1px solid ${catColor}25`,fontSize:12.5,color:'var(--text-2)',lineHeight:1.7,fontFamily:"'DM Sans',sans-serif"}}>📍 Your current plan reaches {sym}{Math.round(base).toLocaleString()} after {years} years. Click any scenario above to explore alternatives.</div>}
    </div>
  )
}

export default function InvestmentCalculator({ meta, category }) {
  const [initial,setInitial]=useState(10000)
  const [monthly,setMonthly]=useState(500)
  const [rate,setRate]=useState(10)
  const [years,setYears]=useState(25)
  const [inflation,setInflation]=useState(3)
  const [currency,setCurrency]=useState(CURRENCIES[0])
  const [openFaq,setOpenFaq]=useState(null)
  const calcRef=useRef(null)
  const sym=currency.symbol
  const catColor=category?.color||'#6366f1'

  const mr=rate/100/12
  const n=years*12
  const nominalFV=initial*Math.pow(1+mr,n)+(mr===0?monthly*n:monthly*(Math.pow(1+mr,n)-1)/mr)
  const realFV=nominalFV/Math.pow(1+inflation/100,years)
  const totalContribs=monthly*n
  const interestEarned=Math.max(0,nominalFV-initial-totalContribs)
  const realRate=(1+rate/100)/(1+inflation/100)-1
  const realMr=realRate/12
  const realFV2=initial*Math.pow(1+realMr,n)+(realMr===0?monthly*n:monthly*(Math.pow(1+realMr,n)-1)/realMr)

  const chartData=Array.from({length:Math.min(years,30)},(_,i)=>{
    const yr=Math.round((i+1)*years/Math.min(years,30))
    const m=yr*12
    const nom=initial*Math.pow(1+mr,m)+(mr===0?monthly*m:monthly*(Math.pow(1+mr,m)-1)/mr)
    const real=nom/Math.pow(1+inflation/100,yr)
    return {year:`Y${yr}`,nominal:Math.round(nom),real:Math.round(real)}
  })

  const hint=`${sym}${initial.toLocaleString()} + ${sym}${monthly}/month at ${rate}% for ${years} years = ${fmt(nominalFV,sym)} nominal (${fmt(realFV,sym)} in today's money after ${inflation}% inflation).`

  function applyExample(ex){setInitial(ex.initial);setMonthly(ex.monthly);setRate(ex.rate);setYears(ex.years);setInflation(ex.inflation);setTimeout(()=>calcRef.current?.scrollIntoView({behavior:'smooth',block:'start'}),50)}

  return (
    <div style={{display:'flex',flexDirection:'column',gap:24}}>
      <div ref={calcRef} style={{scrollMarginTop:80}}>
        <CalcShell
          left={<>
            <div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:16,paddingBottom:8,borderBottom:'0.5px solid var(--border)'}}>Investment Details</div>
            <CurrencyDropdown currency={currency} setCurrency={setCurrency} catColor={catColor} />
            <FieldInput label="Initial Investment" hint="Lump sum today" value={initial} onChange={setInitial} prefix={sym} min={0} catColor={catColor} />
            <FieldInput label="Monthly Contribution" hint="Regular deposits" value={monthly} onChange={setMonthly} prefix={sym} min={0} catColor={catColor} />
            <FieldInput label="Annual Return Rate" hint="Expected nominal return" value={rate} onChange={setRate} suffix="%" min={0} max={50} catColor={catColor} />
            <FieldInput label="Investment Period" hint="Years" value={years} onChange={setYears} suffix="yrs" min={1} max={50} catColor={catColor} />
            <FieldInput label="Inflation Rate" hint="For real return calc" value={inflation} onChange={setInflation} suffix="%" min={0} max={20} catColor={catColor} />

            {/* Real return preview */}
            <div style={{padding:'10px 12px',borderRadius:8,marginBottom:14,background:catColor+'0d',border:`1px solid ${catColor}25`,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <span style={{fontSize:11,color:'var(--text-2)',fontFamily:"'DM Sans',sans-serif"}}>Real return (after inflation)</span>
              <span style={{fontSize:15,fontWeight:800,color:catColor,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{(realRate*100).toFixed(2)}%</span>
            </div>

            <div style={{display:'flex',gap:10}}>
              <button style={{flex:1,padding:13,borderRadius:10,border:'none',background:catColor,color:'#fff',fontSize:14,fontWeight:700,cursor:'pointer'}} onMouseEnter={e=>e.currentTarget.style.opacity='.85'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>Calculate →</button>
              <button onClick={()=>{setInitial(10000);setMonthly(500);setRate(10);setYears(25);setInflation(3)}} style={{padding:'13px 18px',borderRadius:10,border:'1.5px solid var(--border-2)',background:'var(--bg-raised)',color:'var(--text-2)',fontSize:13,fontWeight:500,cursor:'pointer'}} onMouseEnter={e=>{e.currentTarget.style.borderColor='#ef4444';e.currentTarget.style.color='#ef4444'}} onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border-2)';e.currentTarget.style.color='var(--text-2)'}}>Reset</button>
            </div>
          </>}
          right={<>
            <ResultHero label="Future Value (Nominal)" value={Math.round(nominalFV)} formatter={n=>sym+Math.round(Math.max(0,n)).toLocaleString()} sub={`After ${years} years at ${rate}% return`} color={catColor} />
            <BreakdownTable title="Investment Summary" rows={[
              {label:'Initial Investment',   value:fmt(initial,sym),        color:catColor},
              {label:'Total Contributions',  value:fmt(totalContribs,sym),  color:'#3b82f6'},
              {label:'Investment Growth',    value:fmt(interestEarned,sym), color:'#10b981'},
              {label:'Nominal Future Value', value:fmt(nominalFV,sym),      color:catColor, bold:true, highlight:true},
              {label:'Real Value (today\'s $)',value:fmt(realFV,sym),       color:'#10b981'},
            ]} />
            <div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:12,padding:16}}>
              <div style={{fontSize:11,fontWeight:700,color:'var(--text)',marginBottom:12,fontFamily:"'Space Grotesk',sans-serif"}}>Nominal vs Real Growth</div>
              <ResponsiveContainer width="100%" height={120}>
                <AreaChart data={chartData} margin={{top:0,right:0,bottom:0,left:0}}>
                  <XAxis dataKey="year" tick={{fontSize:9,fill:'var(--text-3)'}} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                  <YAxis hide />
                  <Tooltip formatter={v=>[fmtK(v,sym),'Value']} contentStyle={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:8,fontSize:11}} />
                  <Area type="monotone" dataKey="nominal" stroke={catColor} fill={catColor+'20'} strokeWidth={2} name="Nominal" />
                  <Area type="monotone" dataKey="real" stroke="#10b981" fill="#10b98115" strokeWidth={1.5} strokeDasharray="4 4" name="Real" />
                </AreaChart>
              </ResponsiveContainer>
              <div style={{display:'flex',gap:16,marginTop:8,justifyContent:'center'}}>
                <div style={{display:'flex',alignItems:'center',gap:4}}><div style={{width:12,height:3,background:catColor,borderRadius:2}}/><span style={{fontSize:10,color:'var(--text-3)'}}>Nominal</span></div>
                <div style={{display:'flex',alignItems:'center',gap:4}}><div style={{width:12,height:3,background:'#10b981',borderRadius:2,opacity:.6}}/><span style={{fontSize:10,color:'var(--text-3)'}}>Real (inflation-adjusted)</span></div>
              </div>
            </div>
            <AIHintCard hint={hint} />
          </>}
        />
      </div>

      <Section title="Real World Examples" subtitle="Click any example to fill the calculator instantly">
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
          {EXAMPLES.map((ex,i)=>(
            <button key={i} onClick={()=>applyExample(ex)} style={{padding:14,borderRadius:10,border:'1.5px solid var(--border)',background:'var(--bg-raised)',cursor:'pointer',textAlign:'left',transition:'all .15s'}} onMouseEnter={e=>{e.currentTarget.style.borderColor=catColor;e.currentTarget.style.background=catColor+'10'}} onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.background='var(--bg-raised)'}}>
              <div style={{fontSize:13,fontWeight:700,color:'var(--text)',marginBottom:4}}>{ex.title}</div>
              <div style={{fontSize:11,color:'var(--text-3)',marginBottom:10,lineHeight:1.4}}>{ex.desc}</div>
              {[['Initial',`${sym}${ex.initial.toLocaleString()}`],['Monthly',`${sym}${ex.monthly}`],['Rate',`${ex.rate}%`],['Period',`${ex.years} yrs`]].map(([k,v])=>(
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

      <Section title="Impact of Expense Ratio" subtitle="Even small fees significantly erode returns over decades">
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontFamily:"'DM Sans',sans-serif"}}>
            <thead><tr>{['Expense Ratio','Effective Rate','Final Value','Lost to Fees'].map((h,i)=>(
              <th key={h} style={{padding:'9px 12px',fontSize:11,fontWeight:700,color:'var(--text-3)',textAlign:i===0?'left':'right',borderBottom:'1px solid var(--border)',fontFamily:"'Space Grotesk',sans-serif"}}>{h}</th>
            ))}</tr></thead>
            <tbody>
              {[0,0.03,0.1,0.5,1.0].map((fee,i)=>{
                const r=(rate-fee)/100/12
                const fv=initial*Math.pow(1+r,n)+(r===0?monthly*n:monthly*(Math.pow(1+r,n)-1)/r)
                const lost=nominalFV-fv
                return (
                  <tr key={fee} style={{background:i%2===0?'var(--bg-raised)':'transparent'}}>
                    <td style={{padding:'9px 12px',fontSize:12,fontWeight:fee===0?700:400,color:fee===0?catColor:'var(--text)'}}>{fee===0?'No fees':`${fee}%/yr`}</td>
                    <td style={{padding:'9px 12px',fontSize:12,color:'var(--text-2)',textAlign:'right'}}>{(rate-fee).toFixed(2)}%</td>
                    <td style={{padding:'9px 12px',fontSize:12,fontWeight:600,color:'var(--text)',textAlign:'right'}}>{fmt(fv,sym)}</td>
                    <td style={{padding:'9px 12px',fontSize:12,color:lost>0?'#ef4444':'var(--text-3)',fontWeight:lost>0?600:400,textAlign:'right'}}>{lost>0?`-${fmt(lost,sym)}`:'—'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Section>


      <Section title="Formula Explained" subtitle="The math behind investment growth">
        <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:14}}>
          {[{label:'Lump Sum Growth',formula:'FV = PV × (1 + r/12)^(12×years)'},{label:'With Monthly Contributions',formula:'FV = PV×(1+r/12)^n + PMT×((1+r/12)^n − 1)/(r/12)'}].map(f=>(
            <div key={f.label}>
              <div style={{fontSize:10,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.05em',marginBottom:4,fontFamily:"'DM Sans',sans-serif"}}>{f.label}</div>
              <div style={{background:'var(--bg-raised)',borderRadius:8,padding:'10px 14px',fontFamily:'monospace',fontSize:12,color:catColor,fontWeight:600,overflowX:'auto',whiteSpace:'nowrap'}}>{f.formula}</div>
            </div>
          ))}
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:14}}>
          {[['FV','Future value — total portfolio value'],['PV','Present value — initial lump sum'],['r','Annual return rate (decimal)'],['n','Total months = Years × 12'],['PMT','Monthly contribution amount'],['Real FV','FV ÷ (1+inflation)^years']].map(([s,m])=>(
            <div key={s} style={{display:'flex',gap:10,padding:'8px 10px',background:'var(--bg-raised)',borderRadius:8}}>
              <span style={{fontSize:12,fontWeight:800,color:catColor,fontFamily:'monospace',minWidth:52,flexShrink:0}}>{s}</span>
              <span style={{fontSize:11.5,color:'var(--text-2)',lineHeight:1.5}}>{m}</span>
            </div>
          ))}
        </div>
        <p style={{fontSize:12,color:'var(--text-2)',lineHeight:1.75,margin:0}}>The nominal return is what the numbers show. The real return (after inflation) is what your money actually buys. At 3% inflation over 25 years, a $1M nominal portfolio has only ~$478k of today's purchasing power — which is why real returns matter for long-term planning.</p>
      </Section>

      <Section title="How Small Changes Make a Big Difference" subtitle="Click any scenario to see how it changes your final value">
        <ComparisonInvestment initial={initial} monthly={monthly} rate={rate} years={years} inflation={inflation} sym={sym} catColor={catColor} />
      </Section>

      <Section title="Key Terms" subtitle="Investment terminology — click any term">
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:8}}>
          {GLOSSARY.map((item,i)=><GlossaryTerm key={i} term={item.term} def={item.def} catColor={catColor} />)}
        </div>
      </Section>

      <Section title="Frequently Asked Questions" subtitle="Everything about investing">
        {FAQ.map((item,i)=><AccordionItem key={i} q={item.q} a={item.a} isOpen={openFaq===i} onToggle={()=>setOpenFaq(openFaq===i?null:i)} catColor={catColor} />)}
      </Section>
    </div>
  )
}

