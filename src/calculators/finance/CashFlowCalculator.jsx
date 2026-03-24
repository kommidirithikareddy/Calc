import { useState, useEffect, useRef } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import ResultHero from '../../components/calculator/ResultHero'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'
import CurrencyDropdown, { CURRENCIES } from '../../components/calculator/CurrencyDropdown'

const fmt  = (n,sym='$') => sym+Math.round(Math.max(0,n)).toLocaleString()
const fmtP = n => n.toFixed(1)+'%'

const DEF={salary:4500,freelance:500,rental:0,dividends:50,otherIn:0,housing:1400,food:500,transport:350,utilities:150,insurance:200,debt:300,subscriptions:80,personal:300,savings:500,otherOut:100}

const EXAMPLES=[
  {title:'Single Income',   desc:'Standard employed household',          vals:{salary:4500,freelance:0,   rental:0,  dividends:0,  otherIn:0,housing:1400,food:450, transport:350,utilities:150,insurance:200,debt:300,subscriptions:80, personal:300,savings:400,otherOut:100}},
  {title:'Multiple Streams',desc:'Salary + freelance + investments',     vals:{salary:6000,freelance:1500,rental:800,dividends:200,otherIn:0,housing:2000,food:600, transport:400,utilities:200,insurance:300,debt:400,subscriptions:120,personal:500,savings:1500,otherOut:200}},
  {title:'Aggressive Saver',desc:'High savings rate, lean expenses',     vals:{salary:7000,freelance:500, rental:0,  dividends:100,otherIn:0,housing:1500,food:350, transport:250,utilities:130,insurance:250,debt:200,subscriptions:50, personal:200,savings:3500,otherOut:50}},
]

const FAQ=[
  {q:'What is cash flow?',a:'Cash flow is the net movement of money in and out of your finances. Positive cash flow means more money coming in than going out — you\'re accumulating wealth. Negative cash flow means spending exceeds earnings — unsustainable long-term and depletes savings or increases debt.'},
  {q:'Why is cash flow different from profit?',a:'For personal finances, cash flow and surplus are closely related. But cash flow also accounts for timing — you might earn in one month but pay large expenses in another. Tracking monthly reveals timing mismatches that a simple income-expense calculation can miss.'},
  {q:'What should I do with positive cash flow?',a:'Direct it intentionally. Priority order: (1) build emergency fund of 3-6 months expenses, (2) contribute enough to 401(k) for full employer match, (3) pay off high-interest debt, (4) invest additional savings. Leaving surplus unallocated typically means it disappears into lifestyle inflation.'},
  {q:'How do I improve negative cash flow quickly?',a:'Three levers: increase income (freelance, raise, sell items), reduce wants spending (subscriptions, dining, entertainment), defer optional purchases. Focus on highest-dollar categories first — a 10% cut in housing saves more than eliminating all subscriptions.'},
]
const GLOSSARY=[
  {term:'Cash Inflow',  def:'All money received: salary, freelance, rental income, dividends, interest.'},
  {term:'Cash Outflow', def:'All money spent: housing, food, transport, debt payments, savings contributions.'},
  {term:'Net Cash Flow',def:'Inflows minus outflows. Positive = wealth building. Negative = wealth depleting.'},
  {term:'Savings Rate', def:'Savings as a percentage of income. 20%+ is recommended; higher for financial independence goals.'},
  {term:'Expense Ratio',def:'Total expenses as a percentage of income. Below 80% leaves meaningful room for savings.'},
  {term:'Cash Flow Statement',def:'A financial document showing all inflows and outflows over a period — the personal finance equivalent of a business P&L.'},
]

function RowInput({label,value,onChange,sym,catColor,color}){
  const[raw,setRaw]=useState(String(value))
  const[f,setF]=useState(false)
  useEffect(()=>{if(!f)setRaw(String(value))},[value,f])
  return(
    <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:9}}>
      <span style={{fontSize:12,fontWeight:600,color:'var(--text-2)',flex:1,fontFamily:"'DM Sans',sans-serif"}}>{label}</span>
      <div style={{display:'flex',alignItems:'center',gap:4,background:'var(--bg-input,var(--bg-card))',border:`1.5px solid ${f?catColor:'var(--border)'}`,borderRadius:8,padding:'0 8px',height:32,width:120,flexShrink:0}}>
        <span style={{fontSize:11,color:color||'var(--text-3)',fontWeight:600}}>{sym}</span>
        <input type="text" inputMode="decimal" value={f?raw:value}
          onChange={e=>{setRaw(e.target.value);const v=parseFloat(e.target.value);if(!isNaN(v))onChange(v)}}
          onFocus={()=>{setF(true);setRaw(String(value))}}
          onBlur={()=>{setF(false);const v=parseFloat(raw);onChange(isNaN(v)?0:Math.max(0,v))}}
          style={{flex:1,border:'none',background:'transparent',fontSize:12,fontWeight:600,color:'var(--text)',padding:0,outline:'none',fontFamily:"'DM Sans',sans-serif"}}/>
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

export default function CashFlowCalculator({meta,category}){
  const[v,setV]=useState(DEF)
  const[currency,setCurrency]=useState(CURRENCIES[0])
  const[openFaq, setOpenFaq] =useState(null)
  const calcRef=useRef(null)
  const sym=currency.symbol
  const catColor=category?.color||'#6366f1'
  const s=(k,val)=>setV(p=>({...p,[k]:val}))

  const totalIn =v.salary+v.freelance+v.rental+v.dividends+v.otherIn
  const totalOut=v.housing+v.food+v.transport+v.utilities+v.insurance+v.debt+v.subscriptions+v.personal+v.savings+v.otherOut
  const net=totalIn-totalOut
  const savingsRate=totalIn>0?v.savings/totalIn*100:0
  const expRatio=totalIn>0?totalOut/totalIn*100:0

  function applyExample(ex){
    setV({...DEF,...ex.vals})
    setTimeout(()=>calcRef.current?.scrollIntoView({behavior:'smooth',block:'start'}),50)
  }

  return(
    <div style={{display:'flex',flexDirection:'column',gap:24}}>
      <div ref={calcRef} style={{scrollMarginTop:80}}>
        <CalcShell
          left={<>
            <div style={{fontSize:11,fontWeight:700,color:'#10b981',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:12,paddingBottom:8,borderBottom:'0.5px solid var(--border)'}}>💚 Cash In — Monthly Income</div>
            <CurrencyDropdown currency={currency} setCurrency={setCurrency} catColor={catColor}/>
            <RowInput label="Salary / Wages (net)" value={v.salary}    onChange={val=>s('salary',val)}    sym={sym} catColor={catColor} color="#10b981"/>
            <RowInput label="Freelance / Side Income" value={v.freelance} onChange={val=>s('freelance',val)} sym={sym} catColor={catColor} color="#10b981"/>
            <RowInput label="Rental Income"          value={v.rental}    onChange={val=>s('rental',val)}    sym={sym} catColor={catColor} color="#10b981"/>
            <RowInput label="Dividends / Interest"   value={v.dividends} onChange={val=>s('dividends',val)} sym={sym} catColor={catColor} color="#10b981"/>
            <RowInput label="Other Income"           value={v.otherIn}   onChange={val=>s('otherIn',val)}   sym={sym} catColor={catColor} color="#10b981"/>

            <div style={{display:'flex',justifyContent:'space-between',padding:'10px 0',borderTop:'1px solid var(--border)',marginTop:4,marginBottom:16}}>
              <span style={{fontSize:12,fontWeight:700,color:'var(--text)',fontFamily:"'Space Grotesk',sans-serif"}}>Total Cash In</span>
              <span style={{fontSize:13,fontWeight:800,color:'#10b981',fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{fmt(totalIn,sym)}</span>
            </div>

            <div style={{fontSize:11,fontWeight:700,color:'#ef4444',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:12,paddingBottom:8,borderBottom:'0.5px solid var(--border)'}}>🔴 Cash Out — Monthly Expenses</div>
            <RowInput label="Housing (rent/mortgage)" value={v.housing}      onChange={val=>s('housing',val)}      sym={sym} catColor={catColor} color="#ef4444"/>
            <RowInput label="Food & Groceries"        value={v.food}         onChange={val=>s('food',val)}         sym={sym} catColor={catColor} color="#ef4444"/>
            <RowInput label="Transport"               value={v.transport}    onChange={val=>s('transport',val)}    sym={sym} catColor={catColor} color="#ef4444"/>
            <RowInput label="Utilities"               value={v.utilities}    onChange={val=>s('utilities',val)}    sym={sym} catColor={catColor} color="#ef4444"/>
            <RowInput label="Insurance"               value={v.insurance}    onChange={val=>s('insurance',val)}    sym={sym} catColor={catColor} color="#ef4444"/>
            <RowInput label="Debt Payments"           value={v.debt}         onChange={val=>s('debt',val)}         sym={sym} catColor={catColor} color="#ef4444"/>
            <RowInput label="Subscriptions"           value={v.subscriptions} onChange={val=>s('subscriptions',val)} sym={sym} catColor={catColor} color="#ef4444"/>
            <RowInput label="Personal & Lifestyle"    value={v.personal}     onChange={val=>s('personal',val)}     sym={sym} catColor={catColor} color="#ef4444"/>
            <RowInput label="Savings & Investments"   value={v.savings}      onChange={val=>s('savings',val)}      sym={sym} catColor={catColor} color="#10b981"/>
            <RowInput label="Other Expenses"          value={v.otherOut}     onChange={val=>s('otherOut',val)}     sym={sym} catColor={catColor} color="#ef4444"/>

            <div style={{display:'flex',justifyContent:'space-between',padding:'10px 0',borderTop:'1px solid var(--border)',marginTop:4,marginBottom:14}}>
              <span style={{fontSize:12,fontWeight:700,color:'var(--text)',fontFamily:"'Space Grotesk',sans-serif"}}>Total Cash Out</span>
              <span style={{fontSize:13,fontWeight:800,color:'#ef4444',fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{fmt(totalOut,sym)}</span>
            </div>

            <div style={{padding:'12px 14px',borderRadius:10,marginBottom:14,background:catColor+'0d',border:`1px solid ${catColor}25`}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
                <span style={{fontSize:11,color:'var(--text-2)',fontFamily:"'DM Sans',sans-serif"}}>Net Cash Flow</span>
                <span style={{fontSize:20,fontWeight:800,color:net>=0?catColor:'#ef4444',fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{net>=0?'+':'-'}{fmt(Math.abs(net),sym)}</span>
              </div>
              <div style={{display:'flex',justifyContent:'space-between'}}>
                <span style={{fontSize:10,color:'var(--text-3)'}}>Savings rate: {fmtP(savingsRate)}</span>
                <span style={{fontSize:10,color:'var(--text-3)'}}>Expense ratio: {fmtP(expRatio)}</span>
              </div>
            </div>

            <div style={{display:'flex',gap:10}}>
              <button style={{flex:1,padding:13,borderRadius:10,border:'none',background:catColor,color:'#fff',fontSize:14,fontWeight:700,cursor:'pointer'}} onMouseEnter={e=>e.currentTarget.style.opacity='.85'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>Calculate →</button>
              <button onClick={()=>setV(DEF)} style={{padding:'13px 18px',borderRadius:10,border:'1.5px solid var(--border-2)',background:'var(--bg-raised)',color:'var(--text-2)',fontSize:13,fontWeight:500,cursor:'pointer'}} onMouseEnter={e=>{e.currentTarget.style.borderColor='#ef4444';e.currentTarget.style.color='#ef4444'}} onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border-2)';e.currentTarget.style.color='var(--text-2)'}}>Reset</button>
            </div>
          </>}
          right={<>
            <ResultHero label="Net Monthly Cash Flow" value={Math.abs(net)} formatter={n=>(net>=0?'+':'-')+fmt(n,sym)} sub={net>=0?'Cash flowing in — wealth building':'Spending exceeds income — wealth depleting'} color={net>=0?catColor:'#ef4444'}/>
            <BreakdownTable title="Cash Flow Statement" rows={[
              {label:'Total Cash In',   value:fmt(totalIn,sym),  color:'#10b981'},
              {label:'Total Cash Out',  value:fmt(totalOut,sym), color:'#ef4444'},
              {label:'Net Cash Flow',   value:(net>=0?'+':'-')+fmt(Math.abs(net),sym), bold:true, highlight:true, color:net>=0?catColor:'#ef4444'},
              {label:'Savings Rate',    value:fmtP(savingsRate), color:savingsRate>=20?'#10b981':savingsRate>=10?catColor:'#f59e0b'},
              {label:'Expense Ratio',   value:fmtP(expRatio),    color:expRatio>90?'#ef4444':expRatio>80?'#f59e0b':'#10b981'},
              {label:'Annual Net',      value:(net>=0?'+':'-')+fmt(Math.abs(net*12),sym), color:net>=0?catColor:'#ef4444'},
            ]}/>

            <div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,padding:'16px 18px'}}>
              <div style={{fontSize:13,fontWeight:700,color:'var(--text)',fontFamily:"'Space Grotesk',sans-serif",marginBottom:14}}>Cash Flow Visualised</div>
              {[{label:'Total Cash In',val:totalIn,total:totalIn,color:'#10b981'},{label:'Total Cash Out',val:totalOut,total:totalIn,color:'#ef4444'}].map(row=>(
                <div key={row.label} style={{marginBottom:10}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                    <span style={{fontSize:12,fontWeight:600,color:'var(--text-2)',fontFamily:"'DM Sans',sans-serif"}}>{row.label}</span>
                    <span style={{fontSize:12,fontWeight:700,color:row.color}}>{fmt(row.val,sym)}</span>
                  </div>
                  <div style={{height:8,background:'var(--bg-raised)',borderRadius:4,overflow:'hidden'}}>
                    <div style={{width:`${Math.min(100,row.total>0?row.val/row.total*100:0)}%`,height:'100%',background:row.color,borderRadius:4,transition:'width .4s'}}/>
                  </div>
                </div>
              ))}
            </div>

            <AIHintCard hint={net<0?`Negative cash flow of ${fmt(Math.abs(net),sym)}/mo. Annualised: ${fmt(Math.abs(net*12),sym)} shortfall. Savings rate ${fmtP(savingsRate)} is below 20% — review largest expense categories.`:`Positive cash flow of ${fmt(net,sym)}/mo. Savings rate: ${fmtP(savingsRate)}. ${savingsRate>=20?'Above the 20% recommendation — great position.':'Aim to reach 20%+ savings rate for long-term security.'}`}/>
          </>}
        />
      </div>

      <Section title="Real World Examples" subtitle="Click any example to fill the calculator">
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
          {EXAMPLES.map((ex,i)=>{
            const tin=ex.vals.salary+(ex.vals.freelance||0)+(ex.vals.rental||0)+(ex.vals.dividends||0)
            const tout=Object.entries(ex.vals).filter(([k])=>['housing','food','transport','utilities','insurance','debt','subscriptions','personal','savings','otherOut'].includes(k)).reduce((a,[,b])=>a+b,0)
            return(
              <button key={i} onClick={()=>applyExample(ex)} style={{padding:14,borderRadius:10,border:'1.5px solid var(--border)',background:'var(--bg-raised)',cursor:'pointer',textAlign:'left',transition:'all .15s'}} onMouseEnter={e=>{e.currentTarget.style.borderColor=catColor;e.currentTarget.style.background=catColor+'10'}} onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.background='var(--bg-raised)'}}>
                <div style={{fontSize:13,fontWeight:700,color:'var(--text)',marginBottom:4}}>{ex.title}</div>
                <div style={{fontSize:11,color:'var(--text-3)',marginBottom:10,lineHeight:1.4}}>{ex.desc}</div>
                {[['Cash In',fmt(tin,sym)],['Cash Out',fmt(tout,sym)],['Net',(tin-tout>=0?'+':'-')+fmt(Math.abs(tin-tout),sym)]].map(([k,v])=>(
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
          Net Cash Flow = Total Cash In − Total Cash Out{'\n'}
          Savings Rate = Savings / Total Cash In × 100{'\n'}
          Expense Ratio = Total Cash Out / Cash In × 100
        </div>
        <p style={{fontSize:12.5,color:'var(--text-2)',lineHeight:1.75,margin:0,fontFamily:"'DM Sans',sans-serif"}}>
          Cash flow measures all money entering and leaving your accounts each month. Unlike net worth (a snapshot), cash flow is a flow measure — it shows whether your financial position is improving or deteriorating. Consistently positive cash flow builds wealth; consistently negative depletes it.
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
