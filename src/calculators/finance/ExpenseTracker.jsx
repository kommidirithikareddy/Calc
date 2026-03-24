import { useState, useEffect, useRef } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import ResultHero from '../../components/calculator/ResultHero'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'
import CurrencyDropdown, { CURRENCIES } from '../../components/calculator/CurrencyDropdown'

const fmt  = (n,sym='$') => sym+Math.round(Math.max(0,n)).toLocaleString()
const fmtP = n => n.toFixed(1)+'%'

const CATS=[
  {key:'housing',      label:'Housing',         icon:'🏠'},
  {key:'food',         label:'Food & Grocery',   icon:'🛒'},
  {key:'transport',    label:'Transport',        icon:'🚗'},
  {key:'utilities',    label:'Utilities',        icon:'💡'},
  {key:'healthcare',   label:'Healthcare',       icon:'🏥'},
  {key:'entertainment',label:'Entertainment',    icon:'🎬'},
  {key:'dining',       label:'Dining Out',       icon:'🍽️'},
  {key:'shopping',     label:'Shopping',         icon:'🛍️'},
  {key:'subscriptions',label:'Subscriptions',    icon:'📱'},
  {key:'education',    label:'Education',        icon:'📚'},
  {key:'travel',       label:'Travel',           icon:'✈️'},
  {key:'other',        label:'Other',            icon:'📦'},
]

const DEF_EXPENSES={housing:1400,food:400,transport:300,utilities:150,healthcare:100,entertainment:100,dining:200,shopping:150,subscriptions:80,education:50,travel:0,other:70}

const EXAMPLES=[
  {title:'Average Household', desc:'US median spending pattern',       income:5000,  expenses:{housing:1650,food:400,transport:800,utilities:200,healthcare:150,entertainment:120,dining:250,shopping:200,subscriptions:80,education:0,  travel:100,other:150}},
  {title:'City Dweller',      desc:'Higher housing, lower transport',   income:7000,  expenses:{housing:3000,food:500,transport:150,utilities:180,healthcare:200,entertainment:200,dining:400,shopping:300,subscriptions:100,education:0,  travel:200,other:170}},
  {title:'Frugal Saver',      desc:'Aggressive expense reduction',     income:5500,  expenses:{housing:1200,food:300,transport:200,utilities:120,healthcare:80, entertainment:50, dining:100,shopping:100,subscriptions:40,education:100,travel:0,  other:60}},
]

const FAQ=[
  {q:'How do I categorise expenses accurately?',a:'When in doubt, assign to the category where the money primarily went. A Target trip mixing groceries and clothing can be split or assigned to whichever was larger. Consistency matters more than precision — pick a system and stick to it for month-over-month comparison.'},
  {q:'What should I do with my expense data?',a:'Identify your three biggest categories — they almost always hold the most savings potential. Compare month-over-month for seasonal patterns. Set targets for discretionary categories and track whether you hit them. Even a 10% reduction in your top spending category often saves hundreds monthly.'},
  {q:'How long should I track expenses?',a:'Track for at least 3 months. One month is often distorted by irregular expenses. After 3 months you\'ll have enough data to spot patterns, set realistic budgets and make targeted cuts without sacrificing priorities.'},
  {q:'What is a healthy expense ratio?',a:'An expense ratio (total expenses / income) below 80% leaves 20% for savings — the minimum recommended. Below 70% allows for meaningful wealth building. Above 100% means you\'re spending more than you earn and depleting savings or taking on debt.'},
]
const GLOSSARY=[
  {term:'Expense Ratio',      def:'Total expenses as a percentage of income. Below 80% is generally healthy.'},
  {term:'Fixed Expense',      def:'Same amount each month: rent, loan payments, insurance, subscriptions.'},
  {term:'Variable Expense',   def:'Changes month to month: groceries, fuel, dining, entertainment.'},
  {term:'Discretionary',      def:'Non-essential spending you choose — dining, entertainment, shopping. Most flexible to cut.'},
  {term:'Budget Variance',    def:'Difference between planned and actual spending. Tracking variance reveals where discipline breaks down.'},
  {term:'Zero-Based Budget',  def:'Every dollar of income is assigned a job — savings, bills, or spending — leaving $0 unallocated.'},
]

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

export default function ExpenseTracker({meta,category}){
  const[income,  setIncome]  =useState(5000)
  const[expenses,setExpenses]=useState(DEF_EXPENSES)
  const[currency,setCurrency]=useState(CURRENCIES[0])
  const[openFaq, setOpenFaq] =useState(null)
  const calcRef=useRef(null)
  const sym=currency.symbol
  const catColor=category?.color||'#6366f1'
  const setExp=(k,v)=>setExpenses(p=>({...p,[k]:v}))

  const total=Object.values(expenses).reduce((a,b)=>a+b,0)
  const surplus=income-total
  const expRatio=income>0?total/income*100:0
  const sorted=[...CATS].filter(c=>expenses[c.key]>0).sort((a,b)=>expenses[b.key]-expenses[a.key])

  function applyExample(ex){
    setIncome(ex.income)
    setExpenses({...DEF_EXPENSES,...ex.expenses})
    setTimeout(()=>calcRef.current?.scrollIntoView({behavior:'smooth',block:'start'}),50)
  }

  return(
    <div style={{display:'flex',flexDirection:'column',gap:24}}>
      <div ref={calcRef} style={{scrollMarginTop:80}}>
        <CalcShell
          left={<>
            <div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:14,paddingBottom:8,borderBottom:'0.5px solid var(--border)'}}>Monthly Income</div>
            <CurrencyDropdown currency={currency} setCurrency={setCurrency} catColor={catColor}/>
            <div style={{display:'flex',alignItems:'center',gap:6,background:'var(--bg-input,var(--bg-card))',border:`1.5px solid ${catColor}`,borderRadius:8,padding:'0 10px',height:38,marginBottom:16}}>
              <span style={{fontSize:12,color:'var(--text-3)',fontWeight:600}}>{sym}</span>
              <input type="text" inputMode="decimal" defaultValue={income}
                onChange={e=>{const v=parseFloat(e.target.value);if(!isNaN(v))setIncome(Math.max(0,v))}}
                style={{flex:1,border:'none',background:'transparent',fontSize:13,fontWeight:600,color:'var(--text)',padding:0,outline:'none',fontFamily:"'DM Sans',sans-serif"}}/>
            </div>

            <div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:12,paddingBottom:8,borderBottom:'0.5px solid var(--border)'}}>Monthly Expenses by Category</div>
            {CATS.map(cat=>(
              <div key={cat.key} style={{marginBottom:10}}>
                <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:3}}>
                  <span style={{fontSize:13}}>{cat.icon}</span>
                  <label style={{fontSize:12,fontWeight:600,color:'var(--text)',fontFamily:"'DM Sans',sans-serif"}}>{cat.label}</label>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:6,background:'var(--bg-input,var(--bg-card))',border:`1.5px solid ${expenses[cat.key]>0?catColor+'50':'var(--border)'}`,borderRadius:8,padding:'0 10px',height:34}}>
                  <span style={{fontSize:11.5,color:'var(--text-3)',fontWeight:600}}>{sym}</span>
                  <input type="text" inputMode="decimal" defaultValue={expenses[cat.key]}
                    onChange={e=>{const v=parseFloat(e.target.value);setExp(cat.key,isNaN(v)?0:Math.max(0,v))}}
                    style={{flex:1,border:'none',background:'transparent',fontSize:12.5,fontWeight:600,color:'var(--text)',padding:0,outline:'none',fontFamily:"'DM Sans',sans-serif"}}/>
                </div>
              </div>
            ))}

            <div style={{padding:'12px 14px',borderRadius:10,marginBottom:14,marginTop:6,background:catColor+'0d',border:`1px solid ${catColor}25`}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
                <span style={{fontSize:11,color:'var(--text-2)',fontFamily:"'DM Sans',sans-serif"}}>Total Monthly Expenses</span>
                <span style={{fontSize:20,fontWeight:800,color:catColor,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{fmt(total,sym)}</span>
              </div>
              <div style={{display:'flex',justifyContent:'space-between'}}>
                <span style={{fontSize:10,color:'var(--text-3)'}}>Expense ratio: {fmtP(expRatio)}</span>
                <span style={{fontSize:10,color:surplus>=0?'#10b981':'#ef4444',fontWeight:600}}>{surplus>=0?`Surplus: ${fmt(surplus,sym)}`:`Deficit: ${fmt(Math.abs(surplus),sym)}`}</span>
              </div>
            </div>

            <div style={{display:'flex',gap:10}}>
              <button style={{flex:1,padding:13,borderRadius:10,border:'none',background:catColor,color:'#fff',fontSize:14,fontWeight:700,cursor:'pointer'}} onMouseEnter={e=>e.currentTarget.style.opacity='.85'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>Calculate →</button>
              <button onClick={()=>{setIncome(5000);setExpenses(DEF_EXPENSES)}} style={{padding:'13px 18px',borderRadius:10,border:'1.5px solid var(--border-2)',background:'var(--bg-raised)',color:'var(--text-2)',fontSize:13,fontWeight:500,cursor:'pointer'}} onMouseEnter={e=>{e.currentTarget.style.borderColor='#ef4444';e.currentTarget.style.color='#ef4444'}} onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border-2)';e.currentTarget.style.color='var(--text-2)'}}>Reset</button>
            </div>
          </>}
          right={<>
            <ResultHero label={surplus>=0?'Monthly Surplus':'Monthly Deficit'} value={Math.abs(surplus)} formatter={n=>(surplus>=0?'+':'-')+fmt(n,sym)} sub={`${fmt(total,sym)} spent of ${fmt(income,sym)} income`} color={surplus>=0?catColor:'#ef4444'}/>
            <BreakdownTable title="Spending Summary" rows={[
              {label:'Monthly Income',  value:fmt(income,sym),   color:catColor,bold:true},
              {label:'Total Expenses',  value:fmt(total,sym)},
              {label:surplus>=0?'Surplus':'Deficit', value:(surplus>=0?'+':'-')+fmt(Math.abs(surplus),sym), bold:true, highlight:true, color:surplus>=0?catColor:'#ef4444'},
              {label:'Expense Ratio',   value:fmtP(expRatio),    color:expRatio>90?'#ef4444':expRatio>80?'#f59e0b':'#10b981'},
            ]}/>

            <div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,padding:'16px 18px'}}>
              <div style={{fontSize:13,fontWeight:700,color:'var(--text)',fontFamily:"'Space Grotesk',sans-serif",marginBottom:14}}>Spending Breakdown</div>
              {sorted.map(cat=>{
                const val=expenses[cat.key]||0
                const pct=total>0?val/total*100:0
                return(
                  <div key={cat.key} style={{marginBottom:9}}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}>
                      <span style={{fontSize:11.5,fontWeight:600,color:'var(--text-2)',fontFamily:"'DM Sans',sans-serif"}}>{cat.icon} {cat.label}</span>
                      <span style={{fontSize:11.5,fontWeight:700,color:'var(--text)'}}>{fmt(val,sym)} <span style={{color:'var(--text-3)',fontWeight:500}}>({Math.round(pct)}%)</span></span>
                    </div>
                    <div style={{height:6,background:'var(--bg-raised)',borderRadius:3,overflow:'hidden'}}>
                      <div style={{width:`${pct}%`,height:'100%',background:catColor,borderRadius:3,transition:'width .4s',opacity:0.75}}/>
                    </div>
                  </div>
                )
              })}
            </div>

            <AIHintCard hint={surplus<0?`Spending ${fmt(Math.abs(surplus),sym)}/mo more than earned. Top category: ${sorted[0]?.label||'—'} at ${fmt(expenses[sorted[0]?.key||'housing'],sym)} — start here.`:`Top 3 expenses: ${sorted.slice(0,3).map(c=>`${c.label} ${fmt(expenses[c.key],sym)}`).join(', ')}.`}/>
          </>}
        />
      </div>

      <Section title="Real World Examples" subtitle="Click any example to fill the calculator">
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
          {EXAMPLES.map((ex,i)=>{
            const tot=Object.values(ex.expenses).reduce((a,b)=>a+b,0)
            return(
              <button key={i} onClick={()=>applyExample(ex)} style={{padding:14,borderRadius:10,border:'1.5px solid var(--border)',background:'var(--bg-raised)',cursor:'pointer',textAlign:'left',transition:'all .15s'}} onMouseEnter={e=>{e.currentTarget.style.borderColor=catColor;e.currentTarget.style.background=catColor+'10'}} onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.background='var(--bg-raised)'}}>
                <div style={{fontSize:13,fontWeight:700,color:'var(--text)',marginBottom:4}}>{ex.title}</div>
                <div style={{fontSize:11,color:'var(--text-3)',marginBottom:10,lineHeight:1.4}}>{ex.desc}</div>
                {[['Income',fmt(ex.income,sym)],['Expenses',fmt(tot,sym)],['Ratio',fmtP(tot/ex.income*100)]].map(([k,v])=>(
                  <div key={k} style={{display:'flex',justifyContent:'space-between'}}>
                    <span style={{fontSize:10,color:'var(--text-3)'}}>{k}</span>
                    <span style={{fontSize:10,fontWeight:600,color:catColor}}>{v}</span>
                  </div>
                ))}
                <div style={{marginTop:10,fontSize:10,fontWeight:700,color:catColor}}>Apply example →</div>
              </button>
            )
          })}
        </div>
      </Section>

      <Section title="Formula Explained">
        <div style={{background:'var(--bg-raised)',borderRadius:10,padding:'14px 16px',marginBottom:14,fontFamily:'monospace',fontSize:12,color:catColor,lineHeight:1.9}}>
          Surplus = Income − Sum of All Expenses{'\n'}
          Expense Ratio = Total Expenses / Income × 100{'\n'}
          Category % = Category Spend / Total Spend × 100
        </div>
        <p style={{fontSize:12.5,color:'var(--text-2)',lineHeight:1.75,margin:0,fontFamily:"'DM Sans',sans-serif"}}>
          Expense tracking reveals where money actually goes vs where you think it goes. Most people underestimate discretionary spending by 30-50%. By categorising every expense you identify patterns and can make targeted cuts without affecting spending that matters most.
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
