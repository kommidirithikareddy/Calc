import { useState, useEffect, useRef } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import ResultHero from '../../components/calculator/ResultHero'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'
import CurrencyDropdown, { CURRENCIES } from '../../components/calculator/CurrencyDropdown'

const fmt  = (n,sym='$') => sym+Math.round(Math.max(0,n)).toLocaleString()
const fmtP = n => n.toFixed(1)+'%'

const EXAMPLES=[
  {title:'Classic Barista FIRE', desc:'Part-time covers health + extras',  expenses:48000,ptIncome:18000,currentSavings:150000,rate:7,currentAge:40},
  {title:'Semi-Retired Freelancer',desc:'Flexible consulting from home',  expenses:60000,ptIncome:30000,currentSavings:300000,rate:7,currentAge:45},
  {title:'Geoarbitrage Plan',    desc:'Low-cost country + PT remote work', expenses:30000,ptIncome:12000,currentSavings:100000,rate:7,currentAge:35},
]

const FAQ=[
  {q:'What is Barista FIRE?',a:'Barista FIRE is a semi-retirement strategy named after working part-time at a coffee shop (traditionally Starbucks — for healthcare benefits). You accumulate enough investments to cover most expenses, then take a low-stress part-time job to cover the remainder and access employer health benefits. It requires a smaller portfolio than full FIRE.'},
  {q:'How is Barista FIRE different from Coast FIRE?',a:'Coast FIRE means you\'ve already saved enough that compound growth will reach full FIRE by traditional retirement age — without adding another dollar. Barista FIRE means you\'re deliberately semi-retiring with a smaller portfolio, using part-time income to bridge the gap. Both reduce the portfolio required for immediate financial independence.'},
  {q:'What is the safe withdrawal rate?',a:'This calculator uses the 4% safe withdrawal rate (25× annual expenses) as the full FIRE baseline, adjusted for your part-time income. The SWR can be higher for shorter retirement periods or lower for very long (40+ year) retirements. Adjust the return rate to model different scenarios.'},
  {q:'How do I pick the right part-time income level?',a:'Focus on two goals: covering health insurance (a major expense for early retirees) and providing enough income that your portfolio can sustain itself or grow. Even $15,000-20,000/year of part-time income dramatically reduces the portfolio needed — cutting the required amount by $375,000-$500,000 using the 4% rule.'},
  {q:'What are the risks of Barista FIRE?',a:'The part-time income dependency means if you can\'t or don\'t want to work, you may draw more from your portfolio. Sequence of returns risk is elevated with a smaller portfolio. Health insurance access may tie you to employment. Building a slightly larger buffer (5-6× annual gap expenses) reduces these risks.'},
]
const GLOSSARY=[
  {term:'Barista FIRE',        def:'Semi-retirement with a smaller portfolio + part-time work covering remaining expenses or health insurance.'},
  {term:'FIRE Number',         def:'The total portfolio needed to retire fully. Formula: Annual Expenses / Safe Withdrawal Rate (typically 4%).'},
  {term:'Barista FIRE Number', def:'Reduced portfolio target: (Annual Expenses − Part-Time Income) / Safe Withdrawal Rate.'},
  {term:'Safe Withdrawal Rate',def:'The percentage of portfolio withdrawn annually. 4% is the widely cited safe rate for 30-year retirements.'},
  {term:'Portfolio Gap',       def:'Annual expenses minus part-time income — the amount your investments must cover each year.'},
  {term:'Coast FIRE',          def:'Having saved enough that compound growth alone will reach your FIRE number by traditional retirement without further contributions.'},
]

function FieldInput({label,hint,value,onChange,prefix,suffix,min=0,max,catColor='#6366f1'}){
  const[raw,setRaw]=useState(String(value))
  const[focused,setFocused]=useState(false)
  useEffect(()=>{if(!focused)setRaw(String(value))},[value,focused])
  return(
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
          style={{flex:1,border:'none',background:'transparent',fontSize:13,fontWeight:600,color:'var(--text)',padding:0,outline:'none',minWidth:0,fontFamily:"'DM Sans',sans-serif"}}/>
        {suffix&&<span style={{fontSize:11,color:'var(--text-3)',fontWeight:500,flexShrink:0}}>{suffix}</span>}
      </div>
    </div>
  )
}
function AccordionItem({q,a,isOpen,onToggle,catColor}){
  return(
    <div style={{borderBottom:'0.5px solid var(--border)'}}>
      <button onClick={onToggle} style={{width:'100%',display:'flex',justifyContent:'space-between',alignItems:'center',padding:'14px 0',background:'none',border:'none',cursor:'pointer',gap:12,textAlign:'left'}}>
        <span style={{fontSize:13,fontWeight:600,color:'var(--text)',fontFamily:"'DM Sans',sans-serif",lineHeight:1.4}}>{q}</span>
        <span style={{fontSize:18,color:catColor,flexShrink:0,transition:'transform .2s',transform:isOpen?'rotate(45deg)':'rotate(0)',display:'inline-block'}}>+</span>
      </button>
      {isOpen&&<p style={{fontSize:12.5,color:'var(--text-2)',lineHeight:1.75,margin:'0 0 14px',fontFamily:"'DM Sans',sans-serif"}}>{a}</p>}
    </div>
  )
}
function GlossaryTerm({term,def,catColor}){
  const[open,setOpen]=useState(false)
  return(
    <div onClick={()=>setOpen(o=>!o)} style={{padding:'9px 12px',borderRadius:8,cursor:'pointer',background:open?catColor+'10':'var(--bg-raised)',border:`1px solid ${open?catColor+'30':'var(--border)'}`,transition:'all .15s'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:8}}>
        <span style={{fontSize:12,fontWeight:700,color:open?catColor:'var(--text)',fontFamily:"'Space Grotesk',sans-serif"}}>{term}</span>
        <span style={{fontSize:14,color:catColor,flexShrink:0}}>{open?'−':'+'}</span>
      </div>
      {open&&<p style={{fontSize:11.5,color:'var(--text-2)',lineHeight:1.65,margin:'7px 0 0',fontFamily:"'DM Sans',sans-serif"}}>{def}</p>}
    </div>
  )
}
function Section({title,subtitle,children}){
  return(
    <div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,overflow:'hidden'}}>
      <div style={{padding:'14px 18px',borderBottom:'0.5px solid var(--border)'}}>
        <div style={{fontSize:13,fontWeight:700,color:'var(--text)',fontFamily:"'Space Grotesk',sans-serif"}}>{title}</div>
        {subtitle&&<div style={{fontSize:11,color:'var(--text-3)',marginTop:2}}>{subtitle}</div>}
      </div>
      <div style={{padding:'16px 18px'}}>{children}</div>
    </div>
  )
}

export default function BaristaFIRE({meta,category}){
  const[expenses,       setExpenses]       =useState(48000)
  const[ptIncome,       setPtIncome]       =useState(18000)
  const[currentSavings, setCurrentSavings] =useState(150000)
  const[rate,           setRate]           =useState(7)
  const[currentAge,     setCurrentAge]     =useState(40)
  const[swr,            setSwr]            =useState(4)
  const[currency,       setCurrency]       =useState(CURRENCIES[0])
  const[openFaq,        setOpenFaq]        =useState(null)
  const calcRef=useRef(null)
  const sym=currency.symbol
  const catColor=category?.color||'#6366f1'

  const annualGap       = Math.max(0,expenses-ptIncome)
  const baristaNumber   = swr>0 ? annualGap/(swr/100) : 0
  const fullFireNumber  = swr>0 ? expenses/(swr/100) : 0
  const portfolioShortfall = Math.max(0,baristaNumber-currentSavings)
  const ptCoverage      = expenses>0 ? ptIncome/expenses*100 : 0
  const yearsToTarget   = currentSavings>=baristaNumber ? 0 : (rate>0 ? Math.log(baristaNumber/currentSavings)/Math.log(1+rate/100) : 999)
  const targetYear      = new Date().getFullYear()+Math.ceil(yearsToTarget)
  const alreadyThere    = portfolioShortfall<=0

  const hintText = alreadyThere
    ? 'You have already reached Barista FIRE! With ' + fmt(currentSavings,sym) + ' saved and ' + fmt(ptIncome,sym) + '/yr part-time income, your portfolio covers the gap.'
    : 'With ' + fmt(ptIncome,sym) + '/yr part-time income covering ' + fmtP(ptCoverage) + ' of expenses, your Barista FIRE number is ' + fmt(baristaNumber,sym) + '. You need ' + fmt(portfolioShortfall,sym) + ' more, achievable in ~' + yearsToTarget.toFixed(1) + ' years at ' + fmtP(rate) + ' growth.'

  function applyExample(ex){
    setExpenses(ex.expenses);setPtIncome(ex.ptIncome);setCurrentSavings(ex.currentSavings)
    setRate(ex.rate);setCurrentAge(ex.currentAge)
    setTimeout(()=>calcRef.current?.scrollIntoView({behavior:'smooth',block:'start'}),50)
  }

  return(
    <div style={{display:'flex',flexDirection:'column',gap:24}}>
      <div ref={calcRef} style={{scrollMarginTop:80}}>
        <CalcShell
          left={<>
            <div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:16,paddingBottom:8,borderBottom:'0.5px solid var(--border)'}}>Expenses & Income</div>
            <CurrencyDropdown currency={currency} setCurrency={setCurrency} catColor={catColor}/>
            <FieldInput label="Annual Living Expenses"        value={expenses}       onChange={setExpenses}       prefix={sym} catColor={catColor}/>
            <FieldInput label="Annual Part-Time Income"       hint="Target PT earnings" value={ptIncome} onChange={setPtIncome} prefix={sym} catColor={catColor}/>

            <div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.07em',margin:'16px 0 14px',paddingBottom:8,borderBottom:'0.5px solid var(--border)'}}>Portfolio Details</div>
            <FieldInput label="Current Savings / Portfolio"   value={currentSavings} onChange={setCurrentSavings} prefix={sym} catColor={catColor}/>
            <FieldInput label="Expected Annual Return"        hint="Historical avg ~7%" value={rate} onChange={setRate} suffix="%" max={20} catColor={catColor}/>
            <FieldInput label="Safe Withdrawal Rate"          hint="4% = 25× expenses" value={swr} onChange={setSwr} suffix="%" max={10} catColor={catColor}/>
            <FieldInput label="Current Age"                   value={currentAge}     onChange={setCurrentAge}     suffix="years" max={70} catColor={catColor}/>

            <div style={{padding:'12px 14px',borderRadius:10,marginBottom:14,background:catColor+'0d',border:`1px solid ${catColor}25`}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
                <span style={{fontSize:11,color:'var(--text-2)',fontFamily:"'DM Sans',sans-serif"}}>Barista FIRE Number</span>
                <span style={{fontSize:20,fontWeight:800,color:catColor,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{fmt(baristaNumber,sym)}</span>
              </div>
              <div style={{display:'flex',justifyContent:'space-between'}}>
                <span style={{fontSize:10,color:'var(--text-3)'}}>PT covers {fmtP(ptCoverage)} of expenses</span>
                <span style={{fontSize:10,color:'#10b981',fontWeight:600}}>{fmt(fullFireNumber-baristaNumber,sym)} less than full FIRE</span>
              </div>
            </div>

            <div style={{display:'flex',gap:10}}>
              <button style={{flex:1,padding:13,borderRadius:10,border:'none',background:catColor,color:'#fff',fontSize:14,fontWeight:700,cursor:'pointer'}} onMouseEnter={e=>e.currentTarget.style.opacity='.85'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>Calculate →</button>
              <button onClick={()=>{setExpenses(48000);setPtIncome(18000);setCurrentSavings(150000);setRate(7);setSwr(4);setCurrentAge(40)}} style={{padding:'13px 18px',borderRadius:10,border:'1.5px solid var(--border-2)',background:'var(--bg-raised)',color:'var(--text-2)',fontSize:13,fontWeight:500,cursor:'pointer'}} onMouseEnter={e=>{e.currentTarget.style.borderColor='#ef4444';e.currentTarget.style.color='#ef4444'}} onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border-2)';e.currentTarget.style.color='var(--text-2)'}}>Reset</button>
            </div>
          </>}
          right={<>
            <ResultHero label="Barista FIRE Number" value={baristaNumber} formatter={n=>fmt(n,sym)} sub={fmt(fullFireNumber-baristaNumber,sym)+' less than full FIRE'} color={catColor}/>
            <BreakdownTable title="Barista FIRE Analysis" rows={[
              {label:'Annual Expenses',             value:fmt(expenses,sym),         color:catColor},
              {label:'Part-Time Income',            value:fmt(ptIncome,sym),          color:'#10b981'},
              {label:'Annual Portfolio Gap',        value:fmt(annualGap,sym)},
              {label:'Barista FIRE Number',         value:fmt(baristaNumber,sym),     bold:true, color:catColor},
              {label:'Full FIRE Number',            value:fmt(fullFireNumber,sym)},
              {label:'Savings vs Full FIRE',        value:'-'+fmt(fullFireNumber-baristaNumber,sym), color:'#10b981', note:'less needed'},
              {label:'Current Portfolio',           value:fmt(currentSavings,sym)},
              {label:'Amount Still Needed',         value:alreadyThere?'✓ Already there!':fmt(portfolioShortfall,sym), color:alreadyThere?'#10b981':'#f59e0b'},
              {label:'Years to Barista FIRE',       value:alreadyThere?'Now! 🎉':'~'+yearsToTarget.toFixed(1)+' years', color:alreadyThere?'#10b981':catColor},
              {label:'Target Year',                 value:alreadyThere?'This year!':String(targetYear), highlight:true},
            ]}/>
            <AIHintCard hint={hintText}/>
          </>}
        />
      </div>

      <Section title="Part-Time Income Sensitivity" subtitle="How different PT income levels change your required portfolio">
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontFamily:"'DM Sans',sans-serif"}}>
            <thead><tr>{['PT Income/yr','% Covered','Annual Gap','FIRE Number','vs Full FIRE'].map((h,i)=>(
              <th key={h} style={{padding:'9px 12px',fontSize:11,fontWeight:700,color:'var(--text-3)',textAlign:i===0?'left':'right',borderBottom:'1px solid var(--border)',fontFamily:"'Space Grotesk',sans-serif"}}>{h}</th>
            ))}</tr></thead>
            <tbody>
              {[0,10000,ptIncome,25000,35000,Math.round(expenses*0.75)].filter((val,i,a)=>a.indexOf(val)===i).sort((a,b)=>a-b).map((pt,i)=>{
                const gap=Math.max(0,expenses-pt)
                const num=swr>0?gap/(swr/100):0
                const pct=expenses>0?pt/expenses*100:0
                const diff=num-fullFireNumber
                const isSelected=Math.abs(pt-ptIncome)<1
                return(
                  <tr key={i} style={{background:isSelected?catColor+'12':i%2===0?'var(--bg-raised)':'transparent'}}>
                    <td style={{padding:'9px 12px',fontSize:12,fontWeight:isSelected?700:500,color:isSelected?catColor:'var(--text)'}}>{fmt(pt,sym)}{isSelected?' ✓':''}</td>
                    <td style={{padding:'9px 12px',fontSize:12,color:'#10b981',textAlign:'right'}}>{fmtP(pct)}</td>
                    <td style={{padding:'9px 12px',fontSize:12,color:'var(--text)',textAlign:'right'}}>{fmt(gap,sym)}</td>
                    <td style={{padding:'9px 12px',fontSize:12,color:catColor,fontWeight:600,textAlign:'right'}}>{fmt(num,sym)}</td>
                    <td style={{padding:'9px 12px',fontSize:12,color:'var(--text-3)',textAlign:'right'}}>{diff<0?'-'+fmt(Math.abs(diff),sym):'$0'}</td>
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
              {[['Expenses',fmt(ex.expenses,sym)],['PT Income',fmt(ex.ptIncome,sym)],['Saved',fmt(ex.currentSavings,sym)]].map(([k,val])=>(
                <div key={k} style={{display:'flex',justifyContent:'space-between'}}>
                  <span style={{fontSize:10,color:'var(--text-3)'}}>{k}</span>
                  <span style={{fontSize:10,fontWeight:600,color:catColor}}>{val}</span>
                </div>
              ))}
              <div style={{marginTop:10,fontSize:10,fontWeight:700,color:catColor}}>Apply example →</div>
            </button>
          ))}
        </div>
      </Section>

      <Section title="Formula Explained">
        <div style={{background:'var(--bg-raised)',borderRadius:10,padding:'14px 16px',marginBottom:14,fontFamily:'monospace',fontSize:12,color:catColor,lineHeight:1.9}}>
          Annual Gap = Annual Expenses − Part-Time Income{'\n'}
          Barista FIRE Number = Annual Gap / SWR{'\n'}
          Full FIRE Number = Annual Expenses / SWR{'\n'}
          SWR default = 4% (divide by 0.04 = multiply by 25)
        </div>
        <p style={{fontSize:12.5,color:'var(--text-2)',lineHeight:1.75,margin:0,fontFamily:"'DM Sans',sans-serif"}}>
          Barista FIRE reduces the required portfolio by using part-time income to cover the difference. Each $10,000/year of part-time income reduces your required portfolio by $250,000 at the 4% rule. The trade-off: you remain partially employed, but with far more freedom and flexibility than full-time work.
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
