import { useState, useEffect, useRef } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import ResultHero from '../../components/calculator/ResultHero'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'
import CurrencyDropdown, { CURRENCIES } from '../../components/calculator/CurrencyDropdown'
const fmt=(n,sym='$')=>sym+Math.round(Math.max(0,n)).toLocaleString()
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

const EF_FAQ=[{q:'How large should my emergency fund be?',a:'The standard recommendation is 3-6 months of essential expenses. Stable employment with dual income → 3 months. Single income household → 6 months. Self-employed or variable income → 9-12 months. The goal is to cover unemployment, medical emergencies or major repairs without taking on debt.'},{q:'Where should I keep my emergency fund?',a:'A high-yield savings account is ideal — earns 4-5% APY while remaining fully liquid. Avoid investing emergency funds in stocks (too volatile) or CDs with penalties. The emergency fund's purpose is accessibility and safety, not growth. Keep it separate from checking to reduce the temptation to spend it.'},{q:'Should I pay off debt or build an emergency fund first?',a:'Most financial advisors recommend building a small starter fund ($1,000-2,000) first, then aggressively paying off high-interest debt, then completing the full emergency fund. Without any cushion, you'll keep using credit cards for every surprise expense, negating your debt payoff progress.'},{q:'What counts as an emergency expense?',a:'True emergencies: job loss, medical bills, car repair needed for work, major home repair (roof, HVAC). Not emergencies: planned annual expenses (car registration, holidays), wants or lifestyle upgrades. Having a separate sinking fund for predictable irregular expenses prevents you from raiding your emergency fund.'}]
const EF_GLOSSARY=[{term:'Emergency Fund',def:'A dedicated savings reserve of 3-9 months of expenses, held in liquid accounts for unexpected financial shocks.'},{term:'Essential Expenses',def:'Monthly costs required to maintain basic living: housing, food, utilities, transport, insurance and minimum debt payments.'},{term:'Liquid Assets',def:'Savings that can be accessed immediately without penalty — savings accounts, money market accounts, checking.'},{term:'Sinking Fund',def:'A savings account for planned future expenses — distinct from an emergency fund which covers surprises.'},{term:'High-Yield Savings',def:'An FDIC-insured savings account paying 4-5% APY — the recommended home for emergency funds.'},{term:'Financial Buffer',def:'Any reserve between your income and expenses that prevents small disruptions from becoming financial crises.'}]

export default function EmergencyFund({meta,category}) {
  const [housing,setHousing]=useState(1500);const [food,setFood]=useState(600);const [transport,setTransport]=useState(400);const [utilities,setUtilities]=useState(200);const [insurance,setInsurance]=useState(300);const [other,setOther]=useState(300);const [saved,setSaved]=useState(3000);const [monthly,setMonthly]=useState(500);const [jobType,setJobType]=useState('employed');const [currency,setCurrency]=useState(CURRENCIES[0])
  const [openFaq,setOpenFaq]=useState(null)
  const sym=currency.symbol;const catColor=category?.color||'#6366f1'
  const monthlyExpenses=housing+food+transport+utilities+insurance+other
  const months=jobType==='self-employed'?9:jobType==='single-income'?6:3
  const target=monthlyExpenses*months
  const gap=Math.max(0,target-saved)
  const monthsToGoal=monthly>0?Math.ceil(gap/monthly):Infinity
  const progress=Math.min(100,saved/target*100)
  const hint=`Your ${months}-month emergency fund target is ${fmt(target,sym)}. You have ${fmt(saved,sym)} (${progress.toFixed(0)}%). ${gap>0?`At ${fmt(monthly,sym)}/month, you\'ll be fully funded in ${monthsToGoal} months.`:'You\'re fully funded!'}`
  return (
    <div>
      <CalcShell
        left={<>
          <div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:16,paddingBottom:8,borderBottom:'0.5px solid var(--border)'}}>Monthly Essential Expenses</div>
          <CurrencyDropdown currency={currency} setCurrency={setCurrency} catColor={catColor} />
          <FieldInput label="Housing (rent/mortgage)" value={housing} onChange={setHousing} prefix={sym} min={0} catColor={catColor} />
          <FieldInput label="Food & Groceries" value={food} onChange={setFood} prefix={sym} min={0} catColor={catColor} />
          <FieldInput label="Transport" value={transport} onChange={setTransport} prefix={sym} min={0} catColor={catColor} />
          <FieldInput label="Utilities & Phone" value={utilities} onChange={setUtilities} prefix={sym} min={0} catColor={catColor} />
          <FieldInput label="Insurance" value={insurance} onChange={setInsurance} prefix={sym} min={0} catColor={catColor} />
          <FieldInput label="Other Essentials" value={other} onChange={setOther} prefix={sym} min={0} catColor={catColor} />
          <div style={{marginBottom:14}}>
            <div style={{fontSize:12.5,fontWeight:600,color:'var(--text)',marginBottom:8}}>Employment Type</div>
            <div style={{display:'flex',flexDirection:'column',gap:6}}>
              {[['employed','Employed (stable income) — 3 months'],['single-income','Single income household — 6 months'],['self-employed','Self-employed / variable income — 9 months']].map(([val,label])=>(
                <label key={val} style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer',fontSize:12,color:'var(--text-2)'}}>
                  <input type="radio" checked={jobType===val} onChange={()=>setJobType(val)} style={{accentColor:catColor}} />{label}
                </label>
              ))}
            </div>
          </div>
          <FieldInput label="Currently Saved" value={saved} onChange={setSaved} prefix={sym} min={0} catColor={catColor} />
          <FieldInput label="Monthly Savings for Fund" value={monthly} onChange={setMonthly} prefix={sym} min={0} catColor={catColor} />
          <button style={{width:'100%',padding:13,borderRadius:10,border:'none',background:catColor,color:'#fff',fontSize:14,fontWeight:700,cursor:'pointer',marginTop:6}} onMouseEnter={e=>e.currentTarget.style.opacity='.85'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>Calculate →</button>
        </>}
        right={<>
          <ResultHero label="Emergency Fund Target" value={Math.round(target)} formatter={n=>sym+Math.round(Math.max(0,n)).toLocaleString()} sub={`${months} months of ${fmt(monthlyExpenses,sym)}/month expenses`} color={catColor} />
          <div style={{marginBottom:12}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}><span style={{fontSize:12,fontWeight:600,color:'var(--text)'}}>Progress</span><span style={{fontSize:12,fontWeight:700,color:catColor}}>{progress.toFixed(0)}%</span></div>
            <div style={{height:8,background:'var(--bg-raised)',borderRadius:4,overflow:'hidden',border:'1px solid var(--border)'}}><div style={{height:'100%',width:`${progress}%`,background:catColor,borderRadius:4,transition:'width .4s'}} /></div>
            <div style={{display:'flex',justifyContent:'space-between',marginTop:4}}><span style={{fontSize:10,color:'var(--text-3)'}}>{fmt(saved,sym)} saved</span><span style={{fontSize:10,color:'var(--text-3)'}}>{fmt(target,sym)} target</span></div>
          </div>
          <BreakdownTable title="Fund Summary" rows={[
            {label:'Monthly Expenses',  value:fmt(monthlyExpenses,sym)},
            {label:'Months Coverage',   value:`${months} months`, color:catColor},
            {label:'Target Amount',     value:fmt(target,sym), color:catColor, bold:true},
            {label:'Currently Saved',   value:fmt(saved,sym), color:'#10b981'},
            {label:'Still Needed',      value:fmt(gap,sym), color:gap>0?'#ef4444':'#10b981'},
            {label:'Months to Goal',    value:monthsToGoal===Infinity?'Set a savings amount':`${monthsToGoal} months`, color:catColor, highlight:true},
          ]} />
          <AIHintCard hint={hint} />
        </>}
      />


      <_Section title="Formula Explained" subtitle="How your emergency fund target is calculated">
        <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:14}}>
          {[{label:'Monthly Essential Expenses',formula:'Housing + Food + Transport + Utilities + Insurance + Other'},{label:'Target Emergency Fund',formula:'Target = Monthly Expenses × Coverage Months (3, 6, or 9)'},{label:'Months to Goal',formula:'Months = (Target − Saved) ÷ Monthly Savings Rate'}].map(f=>(
            <div key={f.label}><div style={{fontSize:10,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.05em',marginBottom:4}}>{f.label}</div><div style={{background:'var(--bg-raised)',borderRadius:8,padding:'10px 14px',fontFamily:'monospace',fontSize:12,color:catColor,fontWeight:600,overflowX:'auto',whiteSpace:'nowrap'}}>{f.formula}</div></div>
          ))}
        </div>
        <p style={{fontSize:12,color:'var(--text-2)',lineHeight:1.75,margin:0}}>Coverage months vary by risk: 3 for stable dual-income households, 6 for single incomes, 9+ for self-employed or variable income. The calculator uses only essential expenses — not total spending — because in a true emergency you cut discretionary spending. Include only what you truly can't cut.</p>
      </_Section>

      <_Section title="Real World Examples" subtitle="Click any example to load the calculator">
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
          {[{title:'Single Renter',desc:'Employed, renting, building starter fund',housing:1400,food:500,transport:300,utilities:150,insurance:200,other:200,saved:2000,monthly:400,jobType:'employed'},{title:'Family Home',desc:'Dual income, mortgage, kids',housing:2000,food:900,transport:600,utilities:250,insurance:400,other:400,saved:8000,monthly:1000,jobType:'single-income'},{title:'Freelancer',desc:'Variable income, needs larger buffer',housing:1600,food:600,transport:350,utilities:200,insurance:300,other:300,saved:5000,monthly:800,jobType:'self-employed'}].map((ex,i)=>(
            <button key={i} onClick={()=>{setHousing(ex.housing);setFood(ex.food);setTransport(ex.transport);setUtilities(ex.utilities);setInsurance(ex.insurance);setOther(ex.other);setSaved(ex.saved);setMonthly(ex.monthly);setJobType(ex.jobType)}} style={{padding:14,borderRadius:10,border:'1.5px solid var(--border)',background:'var(--bg-raised)',cursor:'pointer',textAlign:'left',transition:'all .15s'}} onMouseEnter={e=>{e.currentTarget.style.borderColor=catColor;e.currentTarget.style.background=catColor+'10'}} onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.background='var(--bg-raised)'}}>
              <div style={{fontSize:13,fontWeight:700,color:'var(--text)',marginBottom:4}}>{ex.title}</div>
              <div style={{fontSize:11,color:'var(--text-3)',marginBottom:10,lineHeight:1.4}}>{ex.desc}</div>
              {[['Monthly exp',`${sym}${(ex.housing+ex.food+ex.transport+ex.utilities+ex.insurance+ex.other).toLocaleString()}`],['Saved',`${sym}${ex.saved.toLocaleString()}`],['Type',ex.jobType]].map(([k,v])=>(
                <div key={k} style={{display:'flex',justifyContent:'space-between'}}><span style={{fontSize:10,color:'var(--text-3)'}}>{k}</span><span style={{fontSize:10,fontWeight:600,color:catColor}}>{v}</span></div>
              ))}
              <div style={{marginTop:10,fontSize:10,fontWeight:700,color:catColor}}>Apply example →</div>
            </button>
          ))}
        </div>
      </_Section>

      <_Section title="Key Terms" subtitle="Click any term to see its definition">
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:8}}>
          {EF_GLOSSARY.map((item,i)=><_Glossary key={i} term={item.term} def={item.def} catColor={catColor} />)}
        </div>
      </_Section>

      <_Section title="Frequently Asked Questions">
        {EF_FAQ.map((item,i)=><_Accordion key={i} q={item.q} a={item.a} isOpen={openFaq===i} onToggle={()=>setOpenFaq(openFaq===i?null:i)} catColor={catColor} />)}
      </_Section>
    </div>
  )
}