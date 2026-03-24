import { useState, useEffect, useRef } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import ResultHero from '../../components/calculator/ResultHero'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'
import CurrencyDropdown, { CURRENCIES } from '../../components/calculator/CurrencyDropdown'

const fmt  = (n,sym='$') => sym+Math.round(Math.max(0,n)).toLocaleString()
const fmtP = n => n.toFixed(1)+'%'

const EXAMPLES=[
  {title:'Starter Budget',   desc:'Entry-level salary, first budget',   income:3500,  housing:1100,food:350, transport:250,utilities:120,insurance:150,minDebt:100,dining:150,entertainment:100,shopping:150,subscriptions:60,other:80,  savings:300,extraDebt:100},
  {title:'Mid-Career',       desc:'Growing income, balanced spending',  income:6000,  housing:1500,food:450, transport:400,utilities:160,insurance:250,minDebt:250,dining:250,entertainment:180,shopping:200,subscriptions:80, other:120, savings:700,extraDebt:200},
  {title:'Aggressive Saver', desc:'High savings rate, FIRE path',       income:8000,  housing:1800,food:400, transport:300,utilities:150,insurance:300,minDebt:200,dining:150,entertainment:100,shopping:100,subscriptions:50, other:50,  savings:3000,extraDebt:400},
]

const FAQ=[
  {q:'What is the 50/30/20 rule?',a:'The 50/30/20 rule allocates after-tax income: 50% for needs (rent, groceries, utilities, minimum debt), 30% for wants (dining, entertainment, subscriptions), and 20% for savings and debt repayment. It\'s a starting framework — adjust percentages to fit your situation and cost of living.'},
  {q:'What counts as a need vs a want?',a:'Needs are essentials required to live and work — housing, food, transport, utilities, insurance, and minimum debt payments. Wants improve quality of life but aren\'t strictly required — dining out, Netflix, gym memberships, hobbies. The line is often blurry; use honest judgment and consistency.'},
  {q:'Why is my budget showing a deficit?',a:'A deficit means expenses exceed income. Start by reviewing wants spending — it\'s the most flexible category. If needs alone exceed 50% of income, consider whether housing or transport can be reduced over time. Any deficit is unsustainable long-term and will deplete savings or increase debt.'},
  {q:'How do I handle irregular expenses?',a:'Set aside 1/12 of annual irregular expenses (car registration, medical, holidays) each month into a sinking fund. This avoids budget surprises. Common irregular expenses range from $2,000-$8,000/year. Add a monthly sinking fund contribution to your "other" or savings category.'},
  {q:'What savings rate should I target?',a:'Financial independence typically requires a 20%+ savings rate. At 50% savings rate you can retire in about 17 years from zero; at 10% it takes 40+ years. Even increasing from 5% to 15% dramatically improves long-term outcomes. Start wherever you can and automate increases annually.'},
]
const GLOSSARY=[
  {term:'50/30/20 Rule',      def:'Budget guideline: 50% to needs, 30% to wants, 20% to savings and debt repayment.'},
  {term:'Discretionary Income',def:'Money left after all essential expenses — what you can freely choose to spend or save.'},
  {term:'Budget Surplus',     def:'When income exceeds expenses. Direct surplus intentionally: emergency fund, investments, debt.'},
  {term:'Budget Deficit',     def:'When expenses exceed income. Requires either cutting spending or increasing income to fix.'},
  {term:'Savings Rate',       def:'Savings as a percentage of gross income. 20%+ is recommended; 50%+ is the FIRE benchmark.'},
  {term:'Sinking Fund',       def:'Money set aside monthly for known irregular expenses (car insurance, holidays, medical).'},
]

function FieldInput({label,hint,value,onChange,prefix,suffix,min=0,max,catColor='#6366f1'}){
  const[raw,setRaw]=useState(String(value))
  const[focused,setFocused]=useState(false)
  useEffect(()=>{if(!focused)setRaw(String(value))},[value,focused])
  return(
    <div style={{marginBottom:12}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
        <label style={{fontSize:12,fontWeight:600,color:'var(--text)',fontFamily:"'DM Sans',sans-serif"}}>{label}</label>
        {hint&&<span style={{fontSize:10,color:'var(--text-3)'}}>{hint}</span>}
      </div>
      <div style={{display:'flex',alignItems:'center',gap:6,background:'var(--bg-input,var(--bg-card))',border:`1.5px solid ${focused?catColor:'var(--border)'}`,borderRadius:8,padding:'0 10px',height:36,boxShadow:focused?`0 0 0 3px ${catColor}18`:'none'}}>
        {prefix&&<span style={{fontSize:12,color:'var(--text-3)',fontWeight:600,flexShrink:0}}>{prefix}</span>}
        <input type="text" inputMode="decimal" value={focused?raw:value}
          onChange={e=>{setRaw(e.target.value);const v=parseFloat(e.target.value);if(!isNaN(v))onChange(v)}}
          onFocus={()=>{setFocused(true);setRaw(String(value))}}
          onBlur={()=>{setFocused(false);const v=parseFloat(raw);if(isNaN(v)||raw===''){setRaw(String(min));onChange(min)}else{const c=max!==undefined?Math.min(max,Math.max(min,v)):Math.max(min,v);setRaw(String(c));onChange(c)}}}
          style={{flex:1,border:'none',background:'transparent',fontSize:12.5,fontWeight:600,color:'var(--text)',padding:0,outline:'none',minWidth:0,fontFamily:"'DM Sans',sans-serif"}}/>
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

const DEF={income:5000,housing:1400,food:400,transport:350,utilities:150,insurance:200,minDebt:200,dining:200,entertainment:150,shopping:200,subscriptions:80,other:120,savings:500,extraDebt:100}

export default function BudgetPlanner({meta,category}){
  const[v,setV]=useState(DEF)
  const[currency,setCurrency]=useState(CURRENCIES[0])
  const[openFaq,setOpenFaq]=useState(null)
  const calcRef=useRef(null)
  const sym=currency.symbol
  const catColor=category?.color||'#6366f1'
  const s=(k,val)=>setV(p=>({...p,[k]:val}))

  const needs=v.housing+v.food+v.transport+v.utilities+v.insurance+v.minDebt
  const wants=v.dining+v.entertainment+v.shopping+v.subscriptions+v.other
  const savingsTotal=v.savings+v.extraDebt
  const total=needs+wants+savingsTotal
  const surplus=v.income-total
  const needsPct=v.income>0?needs/v.income*100:0
  const wantsPct=v.income>0?wants/v.income*100:0
  const savingsPct=v.income>0?savingsTotal/v.income*100:0
  const ideal50=v.income*0.5, ideal30=v.income*0.3, ideal20=v.income*0.2

  function applyExample(ex){
    setV({income:ex.income,housing:ex.housing,food:ex.food,transport:ex.transport,utilities:ex.utilities,insurance:ex.insurance,minDebt:ex.minDebt,dining:ex.dining,entertainment:ex.entertainment,shopping:ex.shopping,subscriptions:ex.subscriptions,other:ex.other,savings:ex.savings,extraDebt:ex.extraDebt})
    setTimeout(()=>calcRef.current?.scrollIntoView({behavior:'smooth',block:'start'}),50)
  }

  return(
    <div style={{display:'flex',flexDirection:'column',gap:24}}>
      <div ref={calcRef} style={{scrollMarginTop:80}}>
        <CalcShell
          left={<>
            <div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:14,paddingBottom:8,borderBottom:'0.5px solid var(--border)'}}>Monthly Income</div>
            <CurrencyDropdown currency={currency} setCurrency={setCurrency} catColor={catColor}/>
            <FieldInput label="After-Tax Monthly Income" value={v.income} onChange={val=>s('income',val)} prefix={sym} catColor={catColor}/>

            <div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.07em',margin:'14px 0 12px',paddingBottom:8,borderBottom:'0.5px solid var(--border)'}}>Needs — Housing, Food, Bills</div>
            <FieldInput label="Housing (rent/mortgage)" value={v.housing}    onChange={val=>s('housing',val)}    prefix={sym} catColor={catColor}/>
            <FieldInput label="Groceries & Food"        value={v.food}       onChange={val=>s('food',val)}       prefix={sym} catColor={catColor}/>
            <FieldInput label="Transport"               value={v.transport}  onChange={val=>s('transport',val)}  prefix={sym} catColor={catColor}/>
            <FieldInput label="Utilities"               value={v.utilities}  onChange={val=>s('utilities',val)}  prefix={sym} catColor={catColor}/>
            <FieldInput label="Insurance"               value={v.insurance}  onChange={val=>s('insurance',val)}  prefix={sym} catColor={catColor}/>
            <FieldInput label="Minimum Debt Payments"   value={v.minDebt}    onChange={val=>s('minDebt',val)}    prefix={sym} catColor={catColor}/>

            <div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.07em',margin:'14px 0 12px',paddingBottom:8,borderBottom:'0.5px solid var(--border)'}}>Wants — Lifestyle</div>
            <FieldInput label="Dining Out"              value={v.dining}         onChange={val=>s('dining',val)}         prefix={sym} catColor={catColor}/>
            <FieldInput label="Entertainment & Hobbies" value={v.entertainment}  onChange={val=>s('entertainment',val)}  prefix={sym} catColor={catColor}/>
            <FieldInput label="Shopping & Clothing"     value={v.shopping}       onChange={val=>s('shopping',val)}       prefix={sym} catColor={catColor}/>
            <FieldInput label="Subscriptions"           value={v.subscriptions}  onChange={val=>s('subscriptions',val)}  prefix={sym} catColor={catColor}/>
            <FieldInput label="Other Discretionary"     value={v.other}          onChange={val=>s('other',val)}          prefix={sym} catColor={catColor}/>

            <div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.07em',margin:'14px 0 12px',paddingBottom:8,borderBottom:'0.5px solid var(--border)'}}>Savings & Debt</div>
            <FieldInput label="Savings & Investments"   value={v.savings}  onChange={val=>s('savings',val)}  prefix={sym} catColor={catColor}/>
            <FieldInput label="Extra Debt Repayment"    value={v.extraDebt} onChange={val=>s('extraDebt',val)} prefix={sym} catColor={catColor}/>

            <div style={{padding:'12px 14px',borderRadius:10,marginBottom:14,background:catColor+'0d',border:`1px solid ${catColor}25`}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
                <span style={{fontSize:11,color:'var(--text-2)',fontFamily:"'DM Sans',sans-serif"}}>Monthly Surplus / Deficit</span>
                <span style={{fontSize:20,fontWeight:800,color:surplus>=0?catColor:'#ef4444',fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{surplus>=0?'+':'-'}{fmt(Math.abs(surplus),sym)}</span>
              </div>
              <div style={{display:'flex',justifyContent:'space-between'}}>
                <span style={{fontSize:10,color:'var(--text-3)'}}>Needs {Math.round(needsPct)}% · Wants {Math.round(wantsPct)}%</span>
                <span style={{fontSize:10,color:'var(--text-3)'}}>Savings {Math.round(savingsPct)}%</span>
              </div>
            </div>

            <div style={{display:'flex',gap:10}}>
              <button style={{flex:1,padding:13,borderRadius:10,border:'none',background:catColor,color:'#fff',fontSize:14,fontWeight:700,cursor:'pointer'}} onMouseEnter={e=>e.currentTarget.style.opacity='.85'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>Calculate →</button>
              <button onClick={()=>setV(DEF)} style={{padding:'13px 18px',borderRadius:10,border:'1.5px solid var(--border-2)',background:'var(--bg-raised)',color:'var(--text-2)',fontSize:13,fontWeight:500,cursor:'pointer'}} onMouseEnter={e=>{e.currentTarget.style.borderColor='#ef4444';e.currentTarget.style.color='#ef4444'}} onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border-2)';e.currentTarget.style.color='var(--text-2)'}}>Reset</button>
            </div>
          </>}
          right={<>
            <ResultHero label="Monthly Surplus / Deficit" value={Math.abs(surplus)} formatter={n=>(surplus>=0?'+':'-')+fmt(n,sym)} sub={surplus>=0?'Available to save or invest':'Spending exceeds income'} color={surplus>=0?catColor:'#ef4444'}/>
            <BreakdownTable title="Budget Allocation" rows={[
              {label:'Monthly Income',    value:fmt(v.income,sym),      color:catColor,bold:true},
              {label:'Total Needs',       value:fmt(needs,sym),         note:`${Math.round(needsPct)}% (target ≤50%)`, color:needsPct>60?'#ef4444':undefined},
              {label:'Total Wants',       value:fmt(wants,sym),         note:`${Math.round(wantsPct)}% (target ≤30%)`, color:wantsPct>40?'#f59e0b':undefined},
              {label:'Savings & Debt',    value:fmt(savingsTotal,sym),  note:`${Math.round(savingsPct)}% (target ≥20%)`, color:savingsPct<10?'#ef4444':undefined},
              {label:'Total Expenses',    value:fmt(total,sym)},
              {label:surplus>=0?'Surplus':'Deficit', value:(surplus>=0?'+':'-')+fmt(Math.abs(surplus),sym), bold:true, highlight:true, color:surplus>=0?catColor:'#ef4444'},
            ]}/>

            <div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,padding:'16px 18px'}}>
              <div style={{fontSize:13,fontWeight:700,color:'var(--text)',fontFamily:"'Space Grotesk',sans-serif",marginBottom:12}}>vs 50/30/20 Ideal</div>
              {[{label:'Needs',actual:needs,ideal:ideal50,pct:needsPct,target:50},{label:'Wants',actual:wants,ideal:ideal30,pct:wantsPct,target:30},{label:'Savings',actual:savingsTotal,ideal:ideal20,pct:savingsPct,target:20}].map(row=>{
                const diff=row.actual-row.ideal
                return(
                  <div key={row.label} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderBottom:'0.5px solid var(--border)'}}>
                    <span style={{fontSize:12,fontWeight:600,color:'var(--text)',fontFamily:"'DM Sans',sans-serif"}}>{row.label}</span>
                    <div style={{textAlign:'right'}}>
                      <span style={{fontSize:12,fontWeight:700,color:'var(--text)'}}>{Math.round(row.pct)}%</span>
                      <span style={{fontSize:10,color:'var(--text-3)',marginLeft:4}}>vs {row.target}%</span>
                      <span style={{fontSize:10,marginLeft:6,color:diff>0?(row.label==='Savings'?'#10b981':'#ef4444'):(row.label==='Savings'?'#f59e0b':'#10b981'),fontWeight:600}}>
                        {diff>0?'+':''}{fmt(diff,sym)}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>

            <AIHintCard hint={surplus<0?`Budget deficit of ${fmt(Math.abs(surplus),sym)}/mo. Review wants spending first — dining, entertainment and subscriptions are most flexible.`:needsPct>60?`Needs are ${Math.round(needsPct)}% of income — above the 50% guideline. Housing or transport may be worth reviewing long-term.`:savingsPct<10?`Saving only ${Math.round(savingsPct)}% of income. Automate an extra ${fmt(v.income*0.05,sym)}/mo to build the habit.`:`Healthy budget with ${fmt(surplus,sym)}/mo surplus. Savings rate of ${Math.round(savingsPct)}% is above the 20% guideline.`}/>
          </>}
        />
      </div>

      <Section title="Real World Examples" subtitle="Click any example to fill the calculator">
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
          {EXAMPLES.map((ex,i)=>(
            <button key={i} onClick={()=>applyExample(ex)} style={{padding:14,borderRadius:10,border:'1.5px solid var(--border)',background:'var(--bg-raised)',cursor:'pointer',textAlign:'left',transition:'all .15s'}} onMouseEnter={e=>{e.currentTarget.style.borderColor=catColor;e.currentTarget.style.background=catColor+'10'}} onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.background='var(--bg-raised)'}}>
              <div style={{fontSize:13,fontWeight:700,color:'var(--text)',marginBottom:4}}>{ex.title}</div>
              <div style={{fontSize:11,color:'var(--text-3)',marginBottom:10,lineHeight:1.4}}>{ex.desc}</div>
              {[['Income',fmt(ex.income,sym)],['Savings',fmt(ex.savings,sym)],['Rate',fmtP(ex.savings/ex.income*100)]].map(([k,val])=>(
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
          Surplus = Income − Needs − Wants − Savings{'\n'}
          Needs % = Needs / Income × 100 (target ≤50%){'\n'}
          Savings Rate = Savings / Income × 100 (target ≥20%)
        </div>
        <p style={{fontSize:12.5,color:'var(--text-2)',lineHeight:1.75,margin:0,fontFamily:"'DM Sans',sans-serif"}}>
          The 50/30/20 budget divides after-tax income into three categories. Needs are non-negotiable. Wants improve quality of life but can be reduced. Savings includes investments and extra debt payments. Your surplus is what remains — ideally zero or positive with all savings goals fully funded.
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
