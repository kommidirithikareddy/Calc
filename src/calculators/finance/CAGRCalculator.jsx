import { useState, useEffect, useRef } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import CalcShell from '../../components/calculator/CalcShell'
import ResultHero from '../../components/calculator/ResultHero'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'
import CurrencyDropdown, { CURRENCIES } from '../../components/calculator/CurrencyDropdown'

const fmt = (n,sym='$') => sym+Math.round(Math.max(0,n)).toLocaleString()
const fmtP = n => (n>=0?'+':'')+n.toFixed(2)+'%'

const EXAMPLES = [
  { title:'Stock Portfolio',  desc:'$10k grew to $28k over 10 years',    start:10000, end:28000, years:10 },
  { title:'Real Estate',      desc:'$200k grew to $350k over 7 years',   start:200000,end:350000,years:7  },
  { title:'Startup Equity',   desc:'$5k grew to $45k over 5 years',      start:5000,  end:45000, years:5  },
]
const FAQ = [
  { q:'What is CAGR?', a:'CAGR (Compound Annual Growth Rate) is the rate at which an investment would have grown if it grew at a steady annual rate. It smooths out the ups and downs of year-by-year returns to give a single representative annual growth rate. It\'s the most useful metric for comparing investments held over different time periods.' },
  { q:'How is CAGR different from average return?', a:'Average return is a simple arithmetic mean of yearly returns. CAGR is the geometric mean — it accounts for compounding. If an investment goes up 50% one year and down 33% the next, the average return is +8.5% but the CAGR is 0% (you\'re back where you started). CAGR always gives the accurate picture of actual wealth growth.' },
  { q:'What is a good CAGR?', a:'It depends on the asset class and time period. S&P 500 historical CAGR: ~10% nominal, ~7% real. Real estate: 8-12%. Startup investments: 20%+ (but high risk). Savings accounts: 4-5%. As a benchmark, beating the S&P 500\'s ~10% consistently over long periods is considered excellent performance.' },
  { q:'What are the limitations of CAGR?', a:'CAGR assumes steady growth, which rarely happens in reality. It doesn\'t show volatility — a very volatile investment can have the same CAGR as a stable one. It also ignores cash flows during the period (dividends, additional investments). For investments with multiple cash flows, use IRR instead.' },
  { q:'Can CAGR be negative?', a:'Yes — a negative CAGR means the investment lost value over the period. For example, if $10,000 became $7,000 over 5 years, the CAGR is -6.9%. Negative CAGR is common for failed investments, market downturns evaluated at peak-to-trough periods, or poorly performing assets.' },
]
const GLOSSARY = [
  { term:'CAGR', def:'Compound Annual Growth Rate — the rate at which an investment grows annually, assuming profits are reinvested each year.' },
  { term:'Geometric Mean', def:'The CAGR is mathematically a geometric mean — it accounts for compounding unlike the arithmetic mean (simple average).' },
  { term:'Volatility', def:'The degree of variation in returns over time. Two investments can have the same CAGR but very different volatility.' },
  { term:'Absolute Return', def:'The total percentage gain or loss from start to end, without accounting for the time period.' },
  { term:'Benchmark', def:'A reference point for comparing returns — typically the S&P 500 for stock market investments.' },
  { term:'IRR', def:'Internal Rate of Return — a more advanced version of CAGR that handles multiple cash flows at different time points.' },
]

function FieldInput({ label, hint, value, onChange, prefix, suffix, min=0, max, catColor='#6366f1' }) {
  const [raw,setRaw]=useState(String(value))
  const [focused,setFocused]=useState(false)
  useEffect(()=>{if(!focused)setRaw(String(value))},[value,focused])
  return (
    <div style={{ marginBottom:14 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:5 }}>
        <label style={{ fontSize:12.5, fontWeight:600, color:'var(--text)', fontFamily:"'DM Sans',sans-serif" }}>{label}</label>
        {hint&&<span style={{ fontSize:10, color:'var(--text-3)' }}>{hint}</span>}
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:6, background:'var(--bg-input,var(--bg-card))', border:`1.5px solid ${focused?catColor:'var(--border)'}`, borderRadius:8, padding:'0 10px', height:38, boxShadow:focused?`0 0 0 3px ${catColor}18`:'none' }}>
        {prefix&&<span style={{ fontSize:12, color:'var(--text-3)', fontWeight:600, flexShrink:0 }}>{prefix}</span>}
        <input type="text" inputMode="decimal" value={focused?raw:value}
          onChange={e=>{setRaw(e.target.value);const v=parseFloat(e.target.value);if(!isNaN(v))onChange(v)}}
          onFocus={()=>{setFocused(true);setRaw(String(value))}}
          onBlur={()=>{setFocused(false);const v=parseFloat(raw);if(isNaN(v)||raw===''){setRaw(String(min));onChange(min)}else{const c=max!==undefined?Math.min(max,Math.max(min,v)):Math.max(min,v);setRaw(String(c));onChange(c)}}}
          style={{ flex:1, border:'none', background:'transparent', fontSize:13, fontWeight:600, color:'var(--text)', padding:0, outline:'none', minWidth:0, fontFamily:"'DM Sans',sans-serif" }} />
        {suffix&&<span style={{ fontSize:11, color:'var(--text-3)', fontWeight:500, flexShrink:0 }}>{suffix}</span>}
      </div>
    </div>
  )
}
function AccordionItem({ q, a, isOpen, onToggle, catColor }) {
  return (
    <div style={{ borderBottom:'0.5px solid var(--border)' }}>
      <button onClick={onToggle} style={{ width:'100%', display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 0', background:'none', border:'none', cursor:'pointer', gap:12, textAlign:'left' }}>
        <span style={{ fontSize:13, fontWeight:600, color:'var(--text)', fontFamily:"'DM Sans',sans-serif", lineHeight:1.4 }}>{q}</span>
        <span style={{ fontSize:18, color:catColor, flexShrink:0, transition:'transform .2s', transform:isOpen?'rotate(45deg)':'rotate(0)', display:'inline-block' }}>+</span>
      </button>
      {isOpen&&<p style={{ fontSize:12.5, color:'var(--text-2)', lineHeight:1.75, margin:'0 0 14px', fontFamily:"'DM Sans',sans-serif" }}>{a}</p>}
    </div>
  )
}
function GlossaryTerm({ term, def, catColor }) {
  const [open,setOpen]=useState(false)
  return (
    <div onClick={()=>setOpen(o=>!o)} style={{ padding:'9px 12px', borderRadius:8, cursor:'pointer', background:open?catColor+'10':'var(--bg-raised)', border:`1px solid ${open?catColor+'30':'var(--border)'}`, transition:'all .15s' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:8 }}>
        <span style={{ fontSize:12, fontWeight:700, color:open?catColor:'var(--text)', fontFamily:"'Space Grotesk',sans-serif" }}>{term}</span>
        <span style={{ fontSize:14, color:catColor, flexShrink:0 }}>{open?'−':'+'}</span>
      </div>
      {open&&<p style={{ fontSize:11.5, color:'var(--text-2)', lineHeight:1.65, margin:'7px 0 0', fontFamily:"'DM Sans',sans-serif" }}>{def}</p>}
    </div>
  )
}
function Section({ title, subtitle, children }) {
  return (
    <div style={{ background:'var(--bg-card)', border:'0.5px solid var(--border)', borderRadius:14, overflow:'hidden' }}>
      <div style={{ padding:'14px 18px', borderBottom:'0.5px solid var(--border)' }}>
        <div style={{ fontSize:13, fontWeight:700, color:'var(--text)', fontFamily:"'Space Grotesk',sans-serif" }}>{title}</div>
        {subtitle&&<div style={{ fontSize:11, color:'var(--text-3)', marginTop:2 }}>{subtitle}</div>}
      </div>
      <div style={{ padding:'16px 18px' }}>{children}</div>
    </div>
  )
}

export default function CAGRCalculator({ meta, category }) {
  const [startVal,setStartVal]=useState(10000)
  const [endVal,setEndVal]=useState(25000)
  const [years,setYears]=useState(10)
  const [currency,setCurrency]=useState(CURRENCIES[0])
  const [openFaq,setOpenFaq]=useState(null)
  const calcRef=useRef(null)
  const sym=currency.symbol
  const catColor=category?.color||'#6366f1'

  const cagr = startVal>0&&years>0 ? (Math.pow(endVal/startVal,1/years)-1)*100 : 0
  const absReturn = startVal>0 ? ((endVal-startVal)/startVal)*100 : 0
  const gain = endVal-startVal
  const cagrColor = cagr>=0?'#10b981':'#ef4444'

  const chartData = Array.from({length:years+1},(_,i)=>({
    year:`Y${i}`,
    actual: i===0?startVal:i===years?endVal:null,
    projected: Math.round(startVal*Math.pow(1+cagr/100,i)),
  }))

  // Benchmarks
  const benchmarks = [
    {name:'Savings Account',cagr:4.5},
    {name:'Bonds',cagr:5.0},
    {name:'Your Investment',cagr,isYours:true},
    {name:'Real Estate',cagr:8.0},
    {name:'S&P 500 avg',cagr:10.0},
  ].sort((a,b)=>a.cagr-b.cagr)

  const hint = `Your investment grew from ${fmt(startVal,sym)} to ${fmt(endVal,sym)} over ${years} years — a CAGR of ${cagr.toFixed(2)}%. Total absolute return: ${absReturn.toFixed(1)}%.`

  function applyExample(ex){ setStartVal(ex.start); setEndVal(ex.end); setYears(ex.years); setTimeout(()=>calcRef.current?.scrollIntoView({behavior:'smooth',block:'start'}),50) }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:24 }}>
      <div ref={calcRef} style={{ scrollMarginTop:80 }}>
        <CalcShell
          left={<>
            <div style={{ fontSize:11, fontWeight:700, color:'var(--text-3)', textTransform:'uppercase', letterSpacing:'.07em', marginBottom:16, paddingBottom:8, borderBottom:'0.5px solid var(--border)' }}>Investment Details</div>
            <CurrencyDropdown currency={currency} setCurrency={setCurrency} catColor={catColor} />
            <FieldInput label="Starting Value" hint="Initial investment" value={startVal} onChange={setStartVal} prefix={sym} min={1} catColor={catColor} />
            <FieldInput label="Ending Value" hint="Final value" value={endVal} onChange={setEndVal} prefix={sym} min={0} catColor={catColor} />
            <FieldInput label="Number of Years" hint="Investment period" value={years} onChange={setYears} suffix="yrs" min={1} max={50} catColor={catColor} />
            <div style={{ display:'flex', gap:10, marginTop:6 }}>
              <button style={{ flex:1, padding:13, borderRadius:10, border:'none', background:catColor, color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer' }} onMouseEnter={e=>e.currentTarget.style.opacity='.85'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>Calculate →</button>
              <button onClick={()=>{setStartVal(10000);setEndVal(25000);setYears(10)}} style={{ padding:'13px 18px', borderRadius:10, border:'1.5px solid var(--border-2)', background:'var(--bg-raised)', color:'var(--text-2)', fontSize:13, fontWeight:500, cursor:'pointer' }} onMouseEnter={e=>{e.currentTarget.style.borderColor='#ef4444';e.currentTarget.style.color='#ef4444'}} onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border-2)';e.currentTarget.style.color='var(--text-2)'}}>Reset</button>
            </div>
          </>}
          right={<>
            <ResultHero label="CAGR" value={Math.abs(cagr)} formatter={n=>(cagr>=0?'+':'-')+n.toFixed(2)+'%'} sub={`Compound Annual Growth Rate over ${years} years`} color={cagrColor} />
            <BreakdownTable title="Investment Summary" rows={[
              {label:'Starting Value', value:fmt(startVal,sym)},
              {label:'Ending Value', value:fmt(endVal,sym), color:cagrColor},
              {label:'Total Gain / Loss', value:(gain>=0?'+':'')+fmt(Math.abs(gain),sym), color:cagrColor},
              {label:'Absolute Return', value:fmtP(absReturn), color:cagrColor},
              {label:'CAGR', value:fmtP(cagr), color:cagrColor, bold:true, highlight:true},
            ]} />
            <div style={{ background:'var(--bg-card)', border:'0.5px solid var(--border)', borderRadius:12, padding:16 }}>
              <div style={{ fontSize:11, fontWeight:700, color:'var(--text)', marginBottom:12, fontFamily:"'Space Grotesk',sans-serif" }}>Projected Growth Curve</div>
              <ResponsiveContainer width="100%" height={120}>
                <LineChart data={chartData} margin={{top:0,right:0,bottom:0,left:0}}>
                  <XAxis dataKey="year" tick={{fontSize:9,fill:'var(--text-3)'}} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                  <YAxis hide />
                  <Tooltip formatter={v=>[fmt(v,sym),'Value']} contentStyle={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:8,fontSize:11}} />
                  <Line type="monotone" dataKey="projected" stroke={catColor} strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <AIHintCard hint={hint} />
          </>}
        />
      </div>

      <Section title="Real World Examples" subtitle="Click any example to fill the calculator instantly">
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
          {EXAMPLES.map((ex,i)=>(
            <button key={i} onClick={()=>applyExample(ex)} style={{ padding:14, borderRadius:10, border:'1.5px solid var(--border)', background:'var(--bg-raised)', cursor:'pointer', textAlign:'left', transition:'all .15s' }} onMouseEnter={e=>{e.currentTarget.style.borderColor=catColor;e.currentTarget.style.background=catColor+'10'}} onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.background='var(--bg-raised)'}}>
              <div style={{ fontSize:13, fontWeight:700, color:'var(--text)', marginBottom:4 }}>{ex.title}</div>
              <div style={{ fontSize:11, color:'var(--text-3)', marginBottom:10, lineHeight:1.4 }}>{ex.desc}</div>
              {[['Start',`${sym}${ex.start.toLocaleString()}`],['End',`${sym}${ex.end.toLocaleString()}`],['Period',`${ex.years} yrs`],['CAGR',`${((Math.pow(ex.end/ex.start,1/ex.years)-1)*100).toFixed(1)}%`]].map(([k,v])=>(
                <div key={k} style={{ display:'flex', justifyContent:'space-between' }}>
                  <span style={{ fontSize:10, color:'var(--text-3)' }}>{k}</span>
                  <span style={{ fontSize:10, fontWeight:600, color:catColor }}>{v}</span>
                </div>
              ))}
              <div style={{ marginTop:10, fontSize:10, fontWeight:700, color:catColor }}>Apply example →</div>
            </button>
          ))}
        </div>
      </Section>

      <Section title="How Your CAGR Compares" subtitle="Your annual return vs common benchmarks">
        <p style={{ fontSize:12, color:'var(--text-2)', marginBottom:14, lineHeight:1.6 }}>Your CAGR of <strong style={{ color:cagrColor }}>{fmtP(cagr)}/yr</strong> vs common investment benchmarks:</p>
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {benchmarks.map((b,i)=>{
            const maxCagr=Math.max(...benchmarks.map(x=>Math.abs(x.cagr)),1)
            const pct=Math.min(100,(b.cagr/maxCagr)*100)
            return (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:10 }}>
                <span style={{ fontSize:11, color:b.isYours?cagrColor:'var(--text-2)', fontWeight:b.isYours?700:400, minWidth:130, fontFamily:"'DM Sans',sans-serif" }}>{b.name}</span>
                <div style={{ flex:1, height:8, background:'var(--bg-raised)', borderRadius:4, overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${pct}%`, background:b.isYours?cagrColor:'var(--border-2)', borderRadius:4, transition:'width .4s' }} />
                </div>
                <span style={{ fontSize:11, fontWeight:700, color:b.isYours?cagrColor:'var(--text-3)', minWidth:48, textAlign:'right' }}>{b.cagr.toFixed(1)}%</span>
              </div>
            )
          })}
        </div>
      </Section>

      <Section title="Formula Explained" subtitle="The math behind CAGR">
        <div style={{ background:'var(--bg-raised)', borderRadius:10, padding:'14px 16px', marginBottom:14, fontFamily:'monospace', fontSize:13, color:catColor, fontWeight:600, overflowX:'auto', whiteSpace:'nowrap' }}>
          CAGR = (End Value / Start Value)^(1/Years) − 1
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:14 }}>
          {[['End Value','The final value of the investment'],['Start Value','The initial investment amount'],['Years','The number of years held'],['Result','Multiply by 100 for percentage']].map(([s,m])=>(
            <div key={s} style={{ display:'flex', gap:10, padding:'8px 10px', background:'var(--bg-raised)', borderRadius:8 }}>
              <span style={{ fontSize:11, fontWeight:800, color:catColor, fontFamily:'monospace', minWidth:70, flexShrink:0 }}>{s}</span>
              <span style={{ fontSize:11.5, color:'var(--text-2)', lineHeight:1.5 }}>{m}</span>
            </div>
          ))}
        </div>
        <p style={{ fontSize:12, color:'var(--text-2)', lineHeight:1.75, margin:0 }}>CAGR uses the geometric mean to find the single annual rate that would transform your starting value into your ending value over the given period. Unlike simple average return, it correctly accounts for the compounding effect of reinvesting gains each year.</p>
      </Section>

      <Section title="Key Terms" subtitle="CAGR terminology — click any term">
        <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:8 }}>
          {GLOSSARY.map((item,i)=><GlossaryTerm key={i} term={item.term} def={item.def} catColor={catColor} />)}
        </div>
      </Section>

      <Section title="Frequently Asked Questions" subtitle="Everything about CAGR">
        {FAQ.map((item,i)=><AccordionItem key={i} q={item.q} a={item.a} isOpen={openFaq===i} onToggle={()=>setOpenFaq(openFaq===i?null:i)} catColor={catColor} />)}
      </Section>
    </div>
  )
}
