import { useState, useEffect, useRef } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import CalcShell from '../../components/calculator/CalcShell'
import ResultHero from '../../components/calculator/ResultHero'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'
import CurrencyDropdown, { CURRENCIES } from '../../components/calculator/CurrencyDropdown'

const fmt = (n,sym='$') => sym+Math.round(Math.max(0,n)).toLocaleString()
const fmtK = (n,sym='$') => n>=1000000?sym+(n/1000000).toFixed(1)+'M':n>=1000?sym+(n/1000).toFixed(0)+'k':fmt(n,sym)

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

const RP_EXAMPLES=[{title:'Early Starter',desc:'Age 25, starting retirement savings early',currentAge:25,retireAge:65,currentSavings:10000,monthlyContrib:500,preReturnRate:7,postReturnRate:5,retireIncome:50000,inflation:3},{title:'Mid-career',desc:'Age 40, catching up on retirement',currentAge:40,retireAge:65,currentSavings:80000,monthlyContrib:1500,preReturnRate:7,postReturnRate:5,retireIncome:60000,inflation:3},{title:'Late Start',desc:'Age 50, aggressive contributions needed',currentAge:50,retireAge:67,currentSavings:120000,monthlyContrib:2500,preReturnRate:6,postReturnRate:4,retireIncome:55000,inflation:3}]
const RP_FAQ=[{q:'How much do I need to retire?',a:'The most common rule is 25x your annual expenses (the 4% rule). If you spend $60,000/year, you need $1.5 million. This allows you to withdraw 4% annually while the portfolio sustains itself indefinitely. For longer retirements (40+ years), some planners use 3.5% (28.6x expenses) for extra safety.'},{q:'What return rate should I assume?',a:'A 7% nominal rate is the most commonly cited long-term S&P 500 return. After 3% inflation, the real return is approximately 4%. For the accumulation phase, 6-7% nominal is reasonable. For the drawdown phase, use 4-5% to be conservative — you need the portfolio to last 25-30 years.'},{q:'What is the sequence of returns risk?',a:'Sequence risk is the danger that poor returns early in retirement permanently damage your portfolio, even if long-term averages are fine. A 20% loss in year 1 of retirement is far more damaging than a 20% loss in year 20. This is why keeping 1-2 years of expenses in cash is recommended at retirement.'},{q:'How does inflation affect retirement planning?',a:'Inflation erodes purchasing power over time. $60,000 today at 3% inflation requires $97,000 in 20 years to maintain the same lifestyle. This calculator adjusts your desired retirement income for inflation to show the true future cost, and sizes your required portfolio accordingly.'}]
const RP_GLOSSARY=[{term:'4% Rule',def:'A guideline suggesting you can withdraw 4% of your portfolio in year 1 of retirement and adjust for inflation each year — historically, this survives 30+ years.'},{term:'FIRE Number',def:'The total portfolio needed to retire, typically 25x annual expenses based on the 4% rule.'},{term:'Sequence of Returns Risk',def:'The danger that poor returns early in retirement deplete your portfolio before long-term averages can recover.'},{term:'Inflation Adjustment',def:'Your retirement income target is increased by inflation each year to maintain purchasing power.'},{term:'Asset Allocation',def:'The mix of stocks, bonds and cash in your portfolio. Typically shifts more conservative as you approach retirement.'},{term:'Drawdown Phase',def:'The retirement period when you withdraw from your portfolio rather than accumulate to it.'}]

export default function RetirementPlanner({ meta, category }) {
  const [currentAge,setCurrentAge]=useState(35)
  const [openFaq,setOpenFaq]=useState(null)
  const [retireAge,setRetireAge]=useState(65)
  const [currentSavings,setCurrentSavings]=useState(50000)
  const [monthlyContrib,setMonthlyContrib]=useState(1000)
  const [preReturnRate,setPreReturnRate]=useState(7)
  const [postReturnRate,setPostReturnRate]=useState(5)
  const [retireIncome,setRetireIncome]=useState(60000)
  const [inflation,setInflation]=useState(3)
  const [currency,setCurrency]=useState(CURRENCIES[0])
  const sym=currency.symbol
  const catColor=category?.color||'#6366f1'

  const yearsToRetire = retireAge-currentAge
  const mr = preReturnRate/100/12
  const n  = yearsToRetire*12
  const portfolioAtRetire = currentSavings*Math.pow(1+mr,n)+(mr===0?monthlyContrib*n:monthlyContrib*(Math.pow(1+mr,n)-1)/mr)

  // Inflation-adjusted income needed
  const realIncome = retireIncome*Math.pow(1+inflation/100,yearsToRetire)
  const neededPortfolio = realIncome/0.04 // 4% rule
  const gap = neededPortfolio - portfolioAtRetire
  const onTrack = gap <= 0

  // How long portfolio lasts
  const annualWithdrawal = realIncome
  const postMr = postReturnRate/100/12
  let bal = portfolioAtRetire, months = 0
  while(bal>0 && months<600){ bal=bal*(1+postMr)-annualWithdrawal/12; months++ }
  const portfolioLasts = months/12

  // Chart
  const chartData = Array.from({length:yearsToRetire+1},(_,i)=>{
    const m=i*12
    const val=currentSavings*Math.pow(1+mr,m)+(mr===0?monthlyContrib*m:monthlyContrib*(Math.pow(1+mr,m)-1)/mr)
    return {age:currentAge+i, value:Math.round(val), target:Math.round(neededPortfolio)}
  })

  const hint = `At retirement (age ${retireAge}): ${fmt(portfolioAtRetire,sym)} projected vs ${fmt(neededPortfolio,sym)} needed. ${onTrack?`You\'re on track with a ${fmt(-gap,sym)} surplus!`:`You\'re ${fmt(gap,sym)} short — increase contributions by ${fmt(gap/(yearsToRetire*12),sym)}/month.`}`

  return (
    <div style={{display:'flex',flexDirection:'column',gap:24}}>
      <div>
        <CalcShell
          left={<>
            <div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:16,paddingBottom:8,borderBottom:'0.5px solid var(--border)'}}>Retirement Details</div>
            <CurrencyDropdown currency={currency} setCurrency={setCurrency} catColor={catColor} />
            <FieldInput label="Current Age" value={currentAge} onChange={setCurrentAge} suffix="yrs" min={18} max={80} catColor={catColor} />
            <FieldInput label="Retirement Age" value={retireAge} onChange={setRetireAge} suffix="yrs" min={currentAge+1} max={90} catColor={catColor} />
            <FieldInput label="Current Savings" value={currentSavings} onChange={setCurrentSavings} prefix={sym} min={0} catColor={catColor} />
            <FieldInput label="Monthly Contribution" value={monthlyContrib} onChange={setMonthlyContrib} prefix={sym} min={0} catColor={catColor} />
            <FieldInput label="Pre-Retirement Return" value={preReturnRate} onChange={setPreReturnRate} suffix="%/yr" min={0} max={20} catColor={catColor} />
            <FieldInput label="Desired Annual Income" hint="In today’s dollars" value={retireIncome} onChange={setRetireIncome} prefix={sym} min={1} catColor={catColor} />
            <FieldInput label="Inflation Rate" value={inflation} onChange={setInflation} suffix="%" min={0} max={10} catColor={catColor} />
            <button style={{width:'100%',padding:13,borderRadius:10,border:'none',background:catColor,color:'#fff',fontSize:14,fontWeight:700,cursor:'pointer',marginTop:6}} onMouseEnter={e=>e.currentTarget.style.opacity='.85'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>Calculate →</button>
          </>}
          right={<>
            <ResultHero label={onTrack?'Projected Surplus':'Retirement Gap'} value={Math.abs(Math.round(gap))} formatter={n=>(onTrack?'+':'-')+sym+Math.round(n).toLocaleString()} sub={onTrack?`You\'re on track for retirement at ${retireAge}`:`Need ${fmt(Math.max(0,gap/(yearsToRetire*12)),sym)} more/month`} color={onTrack?'#10b981':'#ef4444'} />
            <BreakdownTable title="Retirement Summary" rows={[
              {label:'Years to Retire',        value:`${yearsToRetire} years`},
              {label:'Projected Portfolio',     value:fmt(portfolioAtRetire,sym), color:catColor},
              {label:'Needed (4% rule)',         value:fmt(neededPortfolio,sym), color:onTrack?'#10b981':'#ef4444'},
              {label:'Portfolio lasts',          value:`${portfolioLasts.toFixed(0)} years`, color:catColor, bold:true, highlight:true},
            ]} />
            <div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:12,padding:16}}>
              <div style={{fontSize:11,fontWeight:700,color:'var(--text)',marginBottom:12,fontFamily:"'Space Grotesk',sans-serif"}}>Projected vs Target</div>
              <ResponsiveContainer width="100%" height={110}>
                <AreaChart data={chartData} margin={{top:0,right:0,bottom:0,left:0}}>
                  <XAxis dataKey="age" tick={{fontSize:9,fill:'var(--text-3)'}} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                  <YAxis hide />
                  <Tooltip formatter={v=>[fmtK(v,sym),'Value']} contentStyle={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:8,fontSize:11}} />
                  <Area type="monotone" dataKey="target" stroke="#ef444460" fill="transparent" strokeWidth={1.5} strokeDasharray="4 4" name="Target" />
                  <Area type="monotone" dataKey="value" stroke={catColor} fill={catColor+'20'} strokeWidth={2} name="Projected" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <AIHintCard hint={hint} />
          </>}
        />
      </div>


      <_Section title="Formula Explained" subtitle="The math behind retirement projections">
        <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:14}}>
          {[{label:'Portfolio at Retirement',formula:'FV = Current × (1+r)^n + PMT × ((1+r)^n − 1) / r'},{label:'Required Portfolio (4% rule)',formula:'Needed = Inflation-adjusted income ÷ 0.04'},{label:'Inflation-adjusted Income',formula:'Future Income = Today Income × (1+inflation)^years'}].map(f=>(
            <div key={f.label}><div style={{fontSize:10,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.05em',marginBottom:4}}>{f.label}</div><div style={{background:'var(--bg-raised)',borderRadius:8,padding:'10px 14px',fontFamily:'monospace',fontSize:12,color:catColor,fontWeight:600,overflowX:'auto',whiteSpace:'nowrap'}}>{f.formula}</div></div>
          ))}
        </div>
        <p style={{fontSize:12,color:'var(--text-2)',lineHeight:1.75,margin:0}}>Your target income in retirement is adjusted for inflation to reflect its true future cost. The 4% rule then sets your portfolio target at 25x that adjusted income. Your projected portfolio is calculated using compound growth on both your current savings and monthly contributions.</p>
      </_Section>

      <_Section title="Real World Examples" subtitle="Click any example to load the calculator">
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
          {RP_EXAMPLES.map((ex,i)=>(
            <button key={i} onClick={()=>{setCurrentAge(ex.currentAge);setRetireAge(ex.retireAge);setCurrentSavings(ex.currentSavings);setMonthlyContrib(ex.monthlyContrib);setPreReturnRate(ex.preReturnRate);setPostReturnRate(ex.postReturnRate);setRetireIncome(ex.retireIncome);setInflation(ex.inflation)}} style={{padding:14,borderRadius:10,border:'1.5px solid var(--border)',background:'var(--bg-raised)',cursor:'pointer',textAlign:'left',transition:'all .15s'}} onMouseEnter={e=>{e.currentTarget.style.borderColor=catColor;e.currentTarget.style.background=catColor+'10'}} onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.background='var(--bg-raised)'}}>
              <div style={{fontSize:13,fontWeight:700,color:'var(--text)',marginBottom:4}}>{ex.title}</div>
              <div style={{fontSize:11,color:'var(--text-3)',marginBottom:8,lineHeight:1.4}}>{ex.desc}</div>
              {[['Age',`${ex.currentAge} → ${ex.retireAge}`],['Savings',`${sym}${ex.currentSavings.toLocaleString()}`],['Monthly',`${sym}${ex.monthlyContrib}`]].map(([k,v])=>(
                <div key={k} style={{display:'flex',justifyContent:'space-between'}}><span style={{fontSize:10,color:'var(--text-3)'}}>{k}</span><span style={{fontSize:10,fontWeight:600,color:catColor}}>{v}</span></div>
              ))}
              <div style={{marginTop:8,fontSize:10,fontWeight:700,color:catColor}}>Apply example →</div>
            </button>
          ))}
        </div>
      </_Section>

      <_Section title="Key Terms" subtitle="Click any term to see its definition">
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:8}}>
          {RP_GLOSSARY.map((item,i)=><_Glossary key={i} term={item.term} def={item.def} catColor={catColor} />)}
        </div>
      </_Section>

      <_Section title="Frequently Asked Questions">
        {RP_FAQ.map((item,i)=><_Accordion key={i} q={item.q} a={item.a} isOpen={openFaq===i} onToggle={()=>setOpenFaq(openFaq===i?null:i)} catColor={catColor} />)}
      </_Section>
    </div>
  )
}