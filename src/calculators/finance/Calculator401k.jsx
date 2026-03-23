import { useState, useEffect, useRef } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import CalcShell from '../../components/calculator/CalcShell'
import ResultHero from '../../components/calculator/ResultHero'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'
import CurrencyDropdown, { CURRENCIES } from '../../components/calculator/CurrencyDropdown'
const fmt=(n,sym='$')=>sym+Math.round(Math.max(0,n)).toLocaleString()
const fmtK=(n,sym='$')=>n>=1000000?sym+(n/1000000).toFixed(1)+'M':n>=1000?sym+(n/1000).toFixed(0)+'k':fmt(n,sym)
function FieldInput({label,hint,value,onChange,prefix,suffix,min=0,max,catColor='#6366f1'}) {
  const [raw,setRaw]=useState(String(value));const [focused,setFocused]=useState(false)
  useEffect(()=>{if(!focused)setRaw(String(value))},[value,focused])
  return (<div style={{marginBottom:14}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:5}}><label style={{fontSize:12.5,fontWeight:600,color:'var(--text)',fontFamily:"'DM Sans',sans-serif"}}>{label}</label>{hint&&<span style={{fontSize:10,color:'var(--text-3)'}}>{hint}</span>}</div><div style={{display:'flex',alignItems:'center',gap:6,background:'var(--bg-input,var(--bg-card))',border:`1.5px solid ${focused?catColor:'var(--border)'}`,borderRadius:8,padding:'0 10px',height:38,boxShadow:focused?`0 0 0 3px ${catColor}18`:'none'}}>{prefix&&<span style={{fontSize:12,color:'var(--text-3)',fontWeight:600,flexShrink:0}}>{prefix}</span>}<input type="text" inputMode="decimal" value={focused?raw:value} onChange={e=>{setRaw(e.target.value);const v=parseFloat(e.target.value);if(!isNaN(v))onChange(v)}} onFocus={()=>{setFocused(true);setRaw(String(value))}} onBlur={()=>{setFocused(false);const v=parseFloat(raw);if(isNaN(v)||raw===''){setRaw(String(min));onChange(min)}else{const c=max!==undefined?Math.min(max,Math.max(min,v)):Math.max(min,v);setRaw(String(c));onChange(c)}}} style={{flex:1,border:'none',background:'transparent',fontSize:13,fontWeight:600,color:'var(--text)',padding:0,outline:'none',minWidth:0,fontFamily:"'DM Sans',sans-serif"}} />{suffix&&<span style={{fontSize:11,color:'var(--text-3)',fontWeight:500,flexShrink:0}}>{suffix}</span>}</div></div>)
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

const K401_EXAMPLES=[{title:'New Employee',desc:'Starting out, employer matches 50%',salary:55000,contribPct:6,employerMatch:50,matchLimit:6,currentBal:0,rate:7,years:35},{title:'Mid-career',desc:'10 years in, maximizing match',salary:90000,contribPct:10,employerMatch:100,matchLimit:5,currentBal:85000,rate:7,years:25},{title:'Pre-retirement',desc:'Catching up in final decade',salary:120000,contribPct:20,employerMatch:50,matchLimit:6,currentBal:300000,rate:6,years:10}]
const K401_FAQ=[{q:'What is a 401(k)?',a:'A 401(k) is an employer-sponsored retirement savings plan that allows employees to contribute pre-tax dollars (traditional) or after-tax dollars (Roth 401k). Traditional contributions reduce your taxable income now; Roth contributions grow tax-free. Contribution limits for 2024 are $23,000 ($30,500 if 50+).'},{q:'How does employer matching work?',a:'If your employer offers a 50% match up to 6% of salary, they contribute $0.50 for every $1 you contribute, up to 6% of your salary. On a $80,000 salary, contributing 6% ($4,800) earns $2,400 in employer match — an instant 50% return on that money. Always contribute at least enough to capture the full match.'},{q:'Should I contribute to traditional or Roth 401(k)?',a:'If you expect to be in a higher tax bracket in retirement, choose Roth (pay tax now at lower rate). If you expect to be in a lower bracket in retirement, choose traditional (defer tax to when it's cheaper). If unsure, splitting contributions between both hedges your tax risk.'},{q:'What if I leave my employer?',a:'You can roll over your 401(k) to your new employer's plan or to an IRA — maintaining tax-advantaged growth. You can also cash out, but you'll owe income tax plus a 10% penalty if under 59½. Rolling over is almost always the right choice.'}]
const K401_GLOSSARY=[{term:'401(k)',def:'Employer-sponsored retirement plan allowing pre-tax or Roth (after-tax) contributions with tax-advantaged growth.'},{term:'Employer Match',def:'Free money — your employer contributes a percentage of what you contribute, up to a limit. Never leave this on the table.'},{term:'Vesting Schedule',def:'The timeline over which employer match becomes fully yours. Immediate, 2-year cliff, or 3-6 year graded.'},{term:'Contribution Limit',def:'IRS maximum annual contribution: $23,000 in 2024 ($30,500 if age 50+).'},{term:'Required Minimum Distribution',def:'Mandatory annual withdrawals from traditional 401(k) starting at age 73.'},{term:'Catch-up Contribution',def:'Additional contributions allowed for those 50+. An extra $7,500/year in 2024.'}]

export default function Calculator401k({meta,category}) {
  const [salary,setSalary]=useState(80000);const [contribPct,setContribPct]=useState(10);const [employerMatch,setEmployerMatch]=useState(50);const [matchLimit,setMatchLimit]=useState(6);const [currentBal,setCurrentBal]=useState(30000);const [rate,setRate]=useState(7);const [years,setYears]=useState(30);const [currency,setCurrency]=useState(CURRENCIES[0])
  const [openFaq,setOpenFaq]=useState(null)
  const sym=currency.symbol;const catColor=category?.color||'#6366f1'
  const annualContrib=salary*contribPct/100
  const employerContrib=salary*Math.min(contribPct,matchLimit)/100*employerMatch/100
  const totalAnnual=annualContrib+employerContrib
  const mr=rate/100/12,n=years*12
  const monthly=totalAnnual/12
  const fv=currentBal*Math.pow(1+mr,n)+(mr===0?monthly*n:monthly*(Math.pow(1+mr,n)-1)/mr)
  const fvNoMatch=currentBal*Math.pow(1+mr,n)+(mr===0?annualContrib/12*n:annualContrib/12*(Math.pow(1+mr,n)-1)/mr)
  const matchValue=fv-fvNoMatch
  const chartData=Array.from({length:Math.min(years,30)},(_,i)=>{
    const yr=Math.round((i+1)*years/Math.min(years,30)),m=yr*12
    const v=currentBal*Math.pow(1+mr,m)+(mr===0?monthly*m:monthly*(Math.pow(1+mr,m)-1)/mr)
    return {year:`Y${yr}`,value:Math.round(v)}
  })
  const hint=`Contributing ${contribPct}% (${fmt(annualContrib,sym)}/yr) + ${fmt(employerContrib,sym)} employer match = ${fmt(totalAnnual,sym)}/yr total. After ${years} years: ${fmt(fv,sym)}. Employer match adds ${fmt(matchValue,sym)}.`
  return (
    <div>
      <CalcShell
        left={<>
          <div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:16,paddingBottom:8,borderBottom:'0.5px solid var(--border)'}}>401(k) Details</div>
          <CurrencyDropdown currency={currency} setCurrency={setCurrency} catColor={catColor} />
          <FieldInput label="Annual Salary" value={salary} onChange={setSalary} prefix={sym} min={1} catColor={catColor} />
          <FieldInput label="Your Contribution" hint="% of salary" value={contribPct} onChange={setContribPct} suffix="%" min={0} max={100} catColor={catColor} />
          <FieldInput label="Employer Match" hint="% of your contribution" value={employerMatch} onChange={setEmployerMatch} suffix="%" min={0} max={100} catColor={catColor} />
          <FieldInput label="Match Limit" hint="% of salary matched" value={matchLimit} onChange={setMatchLimit} suffix="%" min={0} max={100} catColor={catColor} />
          <FieldInput label="Current Balance" value={currentBal} onChange={setCurrentBal} prefix={sym} min={0} catColor={catColor} />
          <FieldInput label="Expected Annual Return" value={rate} onChange={setRate} suffix="%" min={0} max={20} catColor={catColor} />
          <FieldInput label="Years to Retirement" value={years} onChange={setYears} suffix="yrs" min={1} max={50} catColor={catColor} />
          {/* Match preview */}
          <div style={{padding:'10px 12px',borderRadius:8,marginBottom:14,background:'#10b98110',border:'1px solid #10b98130'}}>
            <div style={{fontSize:11,fontWeight:600,color:'#10b981',marginBottom:2}}>Free money from employer</div>
            <div style={{display:'flex',justifyContent:'space-between'}}><span style={{fontSize:11,color:'var(--text-2)'}}>Annual employer match</span><span style={{fontSize:13,fontWeight:800,color:'#10b981'}}>{fmt(employerContrib,sym)}/yr</span></div>
          </div>
          <button style={{width:'100%',padding:13,borderRadius:10,border:'none',background:catColor,color:'#fff',fontSize:14,fontWeight:700,cursor:'pointer'}} onMouseEnter={e=>e.currentTarget.style.opacity='.85'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>Calculate →</button>
        </>}
        right={<>
          <ResultHero label="401(k) Balance at Retirement" value={Math.round(fv)} formatter={n=>sym+Math.round(Math.max(0,n)).toLocaleString()} sub={`After ${years} years at ${rate}% return`} color={catColor} />
          <BreakdownTable title="Contribution Summary" rows={[
            {label:'Your Annual Contribution', value:fmt(annualContrib,sym), color:catColor},
            {label:'Employer Match',           value:fmt(employerContrib,sym), color:'#10b981'},
            {label:'Total Annual',             value:fmt(totalAnnual,sym), color:catColor, bold:true},
            {label:'Value of Employer Match',  value:fmt(matchValue,sym), color:'#10b981', highlight:true},
            {label:'Projected Balance',        value:fmt(fv,sym), color:catColor, bold:true},
          ]} />
          <div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:12,padding:16}}>
            <div style={{fontSize:11,fontWeight:700,color:'var(--text)',marginBottom:12,fontFamily:"'Space Grotesk',sans-serif"}}>Balance Growth</div>
            <ResponsiveContainer width="100%" height={110}>
              <AreaChart data={chartData} margin={{top:0,right:0,bottom:0,left:0}}>
                <XAxis dataKey="year" tick={{fontSize:9,fill:'var(--text-3)'}} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis hide />
                <Tooltip formatter={v=>[fmtK(v,sym),'Balance']} contentStyle={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:8,fontSize:11}} />
                <Area type="monotone" dataKey="value" stroke={catColor} fill={catColor+'20'} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <AIHintCard hint={hint} />
        </>}
      />


      <_Section title="Formula Explained" subtitle="How your 401(k) balance grows">
        <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:14}}>
          {[{label:'Total Monthly Contribution',formula:'Monthly = (Your % + Employer Match %) × Salary ÷ 12'},{label:'Employer Match',formula:'Match = Salary × min(Your%, Match Limit%) × Match Rate ÷ 100'},{label:'Future Balance',formula:'FV = Balance × (1+r)^n + Monthly × ((1+r)^n − 1) / r'}].map(f=>(
            <div key={f.label}><div style={{fontSize:10,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.05em',marginBottom:4}}>{f.label}</div><div style={{background:'var(--bg-raised)',borderRadius:8,padding:'10px 14px',fontFamily:'monospace',fontSize:12,color:catColor,fontWeight:600,overflowX:'auto',whiteSpace:'nowrap'}}>{f.formula}</div></div>
          ))}
        </div>
        <p style={{fontSize:12,color:'var(--text-2)',lineHeight:1.75,margin:0}}>The employer match is the most powerful part of a 401(k). A 50% match up to 6% means your effective return on those contributions is an immediate 50% before any market growth. Combined with pre-tax contributions and decades of compounding, this makes the 401(k) one of the most powerful wealth-building tools available.</p>
      </_Section>

      <_Section title="Real World Examples" subtitle="Click any example to load the calculator">
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
          {K401_EXAMPLES.map((ex,i)=>(
            <button key={i} onClick={()=>{setSalary(ex.salary);setContribPct(ex.contribPct);setEmployerMatch(ex.employerMatch);setMatchLimit(ex.matchLimit);setCurrentBal(ex.currentBal);setRate(ex.rate);setYears(ex.years)}} style={{padding:14,borderRadius:10,border:'1.5px solid var(--border)',background:'var(--bg-raised)',cursor:'pointer',textAlign:'left',transition:'all .15s'}} onMouseEnter={e=>{e.currentTarget.style.borderColor=catColor;e.currentTarget.style.background=catColor+'10'}} onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.background='var(--bg-raised)'}}>
              <div style={{fontSize:13,fontWeight:700,color:'var(--text)',marginBottom:4}}>{ex.title}</div>
              <div style={{fontSize:11,color:'var(--text-3)',marginBottom:8,lineHeight:1.4}}>{ex.desc}</div>
              {[['Salary',`${sym}${ex.salary.toLocaleString()}`],['Contrib',`${ex.contribPct}%`],['Match',`${ex.employerMatch}%`],['Years',`${ex.years}`]].map(([k,v])=>(
                <div key={k} style={{display:'flex',justifyContent:'space-between'}}><span style={{fontSize:10,color:'var(--text-3)'}}>{k}</span><span style={{fontSize:10,fontWeight:600,color:catColor}}>{v}</span></div>
              ))}
              <div style={{marginTop:8,fontSize:10,fontWeight:700,color:catColor}}>Apply example →</div>
            </button>
          ))}
        </div>
      </_Section>

      <_Section title="Key Terms" subtitle="Click any term to see its definition">
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:8}}>
          {K401_GLOSSARY.map((item,i)=><_Glossary key={i} term={item.term} def={item.def} catColor={catColor} />)}
        </div>
      </_Section>

      <_Section title="Frequently Asked Questions">
        {K401_FAQ.map((item,i)=><_Accordion key={i} q={item.q} a={item.a} isOpen={openFaq===i} onToggle={()=>setOpenFaq(openFaq===i?null:i)} catColor={catColor} />)}
      </_Section>
    </div>
  )
}