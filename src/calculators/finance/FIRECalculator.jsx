import { useState, useEffect, useRef } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import CalcShell from '../../components/calculator/CalcShell'
import ResultHero from '../../components/calculator/ResultHero'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'
import CurrencyDropdown, { CURRENCIES } from '../../components/calculator/CurrencyDropdown'

const fmt = (n,sym='$') => sym+Math.round(Math.max(0,n)).toLocaleString()

const EXAMPLES = [
  { title:'Lean FIRE',     desc:'Frugal lifestyle, low expenses',         expenses:30000, savings:5000,  current:50000,  rate:7, wr:4 },
  { title:'Regular FIRE',  desc:'Comfortable middle-class retirement',    expenses:60000, savings:15000, current:100000, rate:7, wr:4 },
  { title:'Fat FIRE',      desc:'Luxurious early retirement lifestyle',   expenses:120000,savings:30000, current:200000, rate:7, wr:3.5 },
]
const FAQ = [
  { q:'What is FIRE?', a:'FIRE stands for Financial Independence, Retire Early. It\'s a movement based on aggressively saving and investing a large percentage of income so you can retire much earlier than the traditional age of 65. The core idea is building a portfolio large enough that investment returns can fund your lifestyle indefinitely without needing to work.' },
  { q:'What is the 4% rule?', a:'The 4% rule (also called the Safe Withdrawal Rate) states that you can withdraw 4% of your portfolio in year one of retirement, then adjust for inflation each year, and your portfolio will last at least 30 years. It\'s based on historical stock/bond market returns. Many FIRE practitioners use 3-3.5% for longer retirements to be more conservative.' },
  { q:'How is the FIRE number calculated?', a:'FIRE Number = Annual Expenses × 25. This comes directly from the 4% rule — if you withdraw 4% per year, you need 1/0.04 = 25 times your annual expenses. For $50,000/year expenses, you need $1,250,000. This is sometimes called the "crossover point" — when investment income exceeds living expenses.' },
  { q:'What are the different types of FIRE?', a:'Lean FIRE: Minimal lifestyle, low expenses (~$25-40k/year). Regular FIRE: Comfortable lifestyle (~$50-80k/year). Fat FIRE: Luxurious lifestyle ($100k+/year). Barista FIRE: Semi-retired with part-time work to cover some expenses. Coast FIRE: Stop contributing — existing savings will grow to your FIRE number by traditional retirement age.' },
  { q:'What withdrawal rate should I use?', a:'4% is the traditional benchmark for 30-year retirements. For 40-50 year retirements (early retirees), 3-3.5% is more conservative and historically safer. At 3.5%, your FIRE number is ~28.6x expenses. At 3%, it\'s ~33x. The more conservative you are, the larger the portfolio you need but the lower the risk of running out of money.' },
]
const GLOSSARY = [
  { term:'FIRE Number',     def:'The portfolio size needed to retire — typically 25x your annual expenses (based on the 4% rule).' },
  { term:'Safe Withdrawal Rate', def:'The percentage of your portfolio you can withdraw annually without running out of money. Traditionally 4% for 30 years.' },
  { term:'Financial Independence', def:'The state where your investment income covers all living expenses — you no longer need to work for money.' },
  { term:'Savings Rate',    def:'The percentage of your income you save and invest. Higher savings rate dramatically shortens time to FIRE.' },
  { term:'Coast FIRE',      def:'When your current savings, if left to grow, will reach your FIRE number by traditional retirement age without further contributions.' },
  { term:'Sequence of Returns Risk', def:'The danger that poor market returns early in retirement permanently damage your portfolio, even if long-term returns are fine.' },
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

export default function FIRECalculator({ meta, category }) {
  const [expenses,setExpenses]=useState(50000)
  const [savings,setSavings]=useState(24000)
  const [current,setCurrent]=useState(80000)
  const [rate,setRate]=useState(7)
  const [wr,setWr]=useState(4)
  const [currency,setCurrency]=useState(CURRENCIES[0])
  const [openFaq,setOpenFaq]=useState(null)
  const calcRef=useRef(null)
  const sym=currency.symbol
  const catColor=category?.color||'#6366f1'

  const fireNumber = expenses / (wr/100)
  const remaining  = Math.max(0, fireNumber - current)
  const mr         = rate/100/12
  const monthSavings = savings/12

  // Months to FIRE
  let monthsToFire = Infinity
  if (mr === 0) {
    monthsToFire = monthSavings > 0 ? remaining/monthSavings : Infinity
  } else {
    // FV = current*(1+r)^n + PMT*((1+r)^n-1)/r = fireNumber
    // Solve numerically
    for (let m=1; m<=600; m++) {
      const fv = current*Math.pow(1+mr,m) + monthSavings*(Math.pow(1+mr,m)-1)/mr
      if (fv >= fireNumber) { monthsToFire=m; break }
    }
  }
  const yearsToFire = monthsToFire/12
  const savingsRate = savings > 0 && expenses > 0 ? (savings/(savings+expenses))*100 : 0

  // Portfolio growth chart
  const chartYears = Math.min(Math.ceil(yearsToFire===Infinity?30:yearsToFire)+2,40)
  const chartData = Array.from({length:chartYears+1},(_,i)=>{
    const m=i*12
    const val = current*Math.pow(1+mr,m) + (mr===0?monthSavings*m:monthSavings*(Math.pow(1+mr,m)-1)/mr)
    return {year:`Y${i}`, value:Math.round(val), fire:Math.round(fireNumber)}
  })

  // FIRE type
  const fireType = expenses < 40000 ? 'Lean FIRE' : expenses < 80000 ? 'Regular FIRE' : 'Fat FIRE'

  const hint = `Your FIRE number is ${fmt(fireNumber,sym)} (${expenses.toLocaleString()} × ${100/wr}). At ${sym}${savings.toLocaleString()}/year savings with ${rate}% returns, you reach FIRE in ${yearsToFire===Infinity?'N/A':yearsToFire.toFixed(1)+' years'}.`

  function applyExample(ex){setExpenses(ex.expenses);setSavings(ex.savings);setCurrent(ex.current);setRate(ex.rate);setWr(ex.wr);setTimeout(()=>calcRef.current?.scrollIntoView({behavior:'smooth',block:'start'}),50)}

  return (
    <div style={{display:'flex',flexDirection:'column',gap:24}}>
      <div ref={calcRef} style={{scrollMarginTop:80}}>
        <CalcShell
          left={<>
            <div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:16,paddingBottom:8,borderBottom:'0.5px solid var(--border)'}}>Your FIRE Plan</div>
            <CurrencyDropdown currency={currency} setCurrency={setCurrency} catColor={catColor} />
            <FieldInput label="Annual Expenses" hint="Living costs per year" value={expenses} onChange={setExpenses} prefix={sym} min={1} catColor={catColor} />
            <FieldInput label="Annual Savings" hint="Amount saved per year" value={savings} onChange={setSavings} prefix={sym} min={0} catColor={catColor} />
            <FieldInput label="Current Portfolio" hint="Savings & investments today" value={current} onChange={setCurrent} prefix={sym} min={0} catColor={catColor} />
            <FieldInput label="Expected Annual Return" hint="Investment return %" value={rate} onChange={setRate} suffix="%" min={0} max={30} catColor={catColor} />
            <FieldInput label="Safe Withdrawal Rate" hint="4% is standard" value={wr} onChange={setWr} suffix="%" min={1} max={10} catColor={catColor} />

            {/* Savings rate pill */}
            <div style={{padding:'10px 12px',borderRadius:8,marginBottom:14,background:catColor+'0d',border:`1px solid ${catColor}25`,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <span style={{fontSize:12,color:'var(--text-2)',fontFamily:"'DM Sans',sans-serif"}}>Your savings rate</span>
              <span style={{fontSize:16,fontWeight:800,color:catColor,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{savingsRate.toFixed(1)}%</span>
            </div>

            <div style={{display:'flex',gap:10}}>
              <button style={{flex:1,padding:13,borderRadius:10,border:'none',background:catColor,color:'#fff',fontSize:14,fontWeight:700,cursor:'pointer'}} onMouseEnter={e=>e.currentTarget.style.opacity='.85'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>Calculate →</button>
              <button onClick={()=>{setExpenses(50000);setSavings(24000);setCurrent(80000);setRate(7);setWr(4)}} style={{padding:'13px 18px',borderRadius:10,border:'1.5px solid var(--border-2)',background:'var(--bg-raised)',color:'var(--text-2)',fontSize:13,fontWeight:500,cursor:'pointer'}} onMouseEnter={e=>{e.currentTarget.style.borderColor='#ef4444';e.currentTarget.style.color='#ef4444'}} onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border-2)';e.currentTarget.style.color='var(--text-2)'}}>Reset</button>
            </div>
          </>}
          right={<>
            <ResultHero label="Years to FIRE" value={yearsToFire===Infinity?0:Math.round(yearsToFire*10)/10} formatter={n=>yearsToFire===Infinity?'∞':n.toFixed(1)+' yrs'} sub={`Reach ${fmt(fireNumber,sym)} FIRE number`} color={catColor} />
            <BreakdownTable title="FIRE Summary" rows={[
              {label:'Annual Expenses', value:fmt(expenses,sym)},
              {label:'FIRE Number', value:fmt(fireNumber,sym), color:catColor, bold:true},
              {label:'Current Portfolio', value:fmt(current,sym), color:'#10b981'},
              {label:'Still Needed', value:fmt(remaining,sym)},
              {label:'Years to FIRE', value:yearsToFire===Infinity?'∞':yearsToFire.toFixed(1)+' yrs', color:catColor, highlight:true, bold:true},
              {label:'FIRE Type', value:fireType},
            ]} />
            {/* Portfolio chart */}
            <div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:12,padding:16}}>
              <div style={{fontSize:11,fontWeight:700,color:'var(--text)',marginBottom:12,fontFamily:"'Space Grotesk',sans-serif"}}>Portfolio vs FIRE Number</div>
              <ResponsiveContainer width="100%" height={120}>
                <AreaChart data={chartData} margin={{top:0,right:0,bottom:0,left:0}}>
                  <XAxis dataKey="year" tick={{fontSize:9,fill:'var(--text-3)'}} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                  <YAxis hide />
                  <Tooltip formatter={(v,n)=>[fmt(v,sym),n==='value'?'Portfolio':'FIRE Target']} contentStyle={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:8,fontSize:11}} />
                  <Area type="monotone" dataKey="fire" stroke="#ef444460" fill="transparent" strokeWidth={1.5} strokeDasharray="4 4" name="FIRE Target" />
                  <Area type="monotone" dataKey="value" stroke={catColor} fill={catColor+'20'} strokeWidth={2} name="Portfolio" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <AIHintCard hint={hint} />
          </>}
        />
      </div>

      {/* FIRE types comparison */}
      <Section title="FIRE Types Comparison" subtitle="Which FIRE lifestyle fits your goals?">
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
          {[
            {type:'Lean FIRE', expenses:30000, icon:'🌿', desc:'Minimalist lifestyle, geographic flexibility, very high savings rate required'},
            {type:'Regular FIRE', expenses:60000, icon:'🏠', desc:'Comfortable middle-class lifestyle, balanced approach, most achievable'},
            {type:'Fat FIRE', expenses:120000, icon:'✨', desc:'Luxurious lifestyle, travel freely, requires large portfolio'},
          ].map((f,i)=>{
            const fn=f.expenses/(wr/100)
            const isYours=f.type===fireType
            return (
              <div key={i} style={{padding:'14px',borderRadius:10,border:`1.5px solid ${isYours?catColor:'var(--border)'}`,background:isYours?catColor+'0d':'var(--bg-raised)'}}>
                <div style={{fontSize:20,marginBottom:6}}>{f.icon}</div>
                <div style={{fontSize:13,fontWeight:700,color:isYours?catColor:'var(--text)',marginBottom:4,fontFamily:"'Space Grotesk',sans-serif"}}>{f.type} {isYours&&'← You'}</div>
                <div style={{fontSize:11,color:'var(--text-3)',marginBottom:10,lineHeight:1.4}}>{f.desc}</div>
                <div style={{fontSize:11,color:'var(--text-2)'}}>Expenses: {fmt(f.expenses,sym)}/yr</div>
                <div style={{fontSize:12,fontWeight:700,color:catColor}}>FIRE #: {fmt(fn,sym)}</div>
              </div>
            )
          })}
        </div>
      </Section>

      <Section title="Real World Examples" subtitle="Click any example to fill the calculator instantly">
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
          {EXAMPLES.map((ex,i)=>(
            <button key={i} onClick={()=>applyExample(ex)} style={{padding:14,borderRadius:10,border:'1.5px solid var(--border)',background:'var(--bg-raised)',cursor:'pointer',textAlign:'left',transition:'all .15s'}} onMouseEnter={e=>{e.currentTarget.style.borderColor=catColor;e.currentTarget.style.background=catColor+'10'}} onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.background='var(--bg-raised)'}}>
              <div style={{fontSize:13,fontWeight:700,color:'var(--text)',marginBottom:4}}>{ex.title}</div>
              <div style={{fontSize:11,color:'var(--text-3)',marginBottom:10,lineHeight:1.4}}>{ex.desc}</div>
              {[['Expenses',`${sym}${ex.expenses.toLocaleString()}/yr`],['Annual Savings',`${sym}${ex.savings.toLocaleString()}`],['FIRE #',`${fmt(ex.expenses/(ex.wr/100),sym)}`]].map(([k,v])=>(
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

      <Section title="Formula Explained" subtitle="The math behind FIRE">
        <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:14}}>
          {[{label:'FIRE Number',formula:'FIRE Number = Annual Expenses ÷ Safe Withdrawal Rate'},{label:'Simplified (4% rule)',formula:'FIRE Number = Annual Expenses × 25'}].map(f=>(
            <div key={f.label}>
              <div style={{fontSize:10,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.05em',marginBottom:4}}>{f.label}</div>
              <div style={{background:'var(--bg-raised)',borderRadius:8,padding:'10px 14px',fontFamily:'monospace',fontSize:12,color:catColor,fontWeight:600,overflowX:'auto',whiteSpace:'nowrap'}}>{f.formula}</div>
            </div>
          ))}
        </div>
        <p style={{fontSize:12,color:'var(--text-2)',lineHeight:1.75,margin:0}}>The 4% rule says you can withdraw 4% of your portfolio in year 1 and adjust for inflation each year — historically, this survives 30+ years of retirement. Your FIRE number is therefore 25x your annual expenses. For longer retirements (40-50 years), use 3.5% (28.6x) or 3% (33x) for extra safety.</p>
      </Section>

      <Section title="Key Terms" subtitle="FIRE terminology — click any term">
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:8}}>
          {GLOSSARY.map((item,i)=><GlossaryTerm key={i} term={item.term} def={item.def} catColor={catColor} />)}
        </div>
      </Section>

      <Section title="Frequently Asked Questions" subtitle="Everything about FIRE">
        {FAQ.map((item,i)=><AccordionItem key={i} q={item.q} a={item.a} isOpen={openFaq===i} onToggle={()=>setOpenFaq(openFaq===i?null:i)} catColor={catColor} />)}
      </Section>
    </div>
  )
}
