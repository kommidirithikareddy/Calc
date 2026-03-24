import { useState, useEffect, useRef } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import ResultHero from '../../components/calculator/ResultHero'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'
import CurrencyDropdown, { CURRENCIES } from '../../components/calculator/CurrencyDropdown'

const fmt  = (n, sym='$') => sym+Math.round(Math.max(0,n)).toLocaleString()
const fmtD = (n, sym='$') => sym+(Math.round(n*100)/100).toFixed(2)
const fmtP = n => n.toFixed(2)+'%'

const PAY_PERIODS=[
  {key:'weekly',      label:'Weekly',        n:52},
  {key:'biweekly',    label:'Bi-Weekly',     n:26},
  {key:'semimonthly', label:'Semi-Monthly',  n:24},
  {key:'monthly',     label:'Monthly',       n:12},
]

const BRACKETS_SINGLE=[
  {min:0,max:11600,rate:0.10},{min:11600,max:47150,rate:0.12},
  {min:47150,max:100525,rate:0.22},{min:100525,max:191950,rate:0.24},
  {min:191950,max:243725,rate:0.32},{min:243725,max:609350,rate:0.35},
  {min:609350,max:Infinity,rate:0.37},
]
const BRACKETS_MFJ=[
  {min:0,max:23200,rate:0.10},{min:23200,max:94300,rate:0.12},
  {min:94300,max:201050,rate:0.22},{min:201050,max:383900,rate:0.24},
  {min:383900,max:487450,rate:0.32},{min:487450,max:731200,rate:0.35},
  {min:731200,max:Infinity,rate:0.37},
]
const STD_DED={single:14600,mfj:29200}

function calcFedTax(income,brackets){let t=0;for(const b of brackets){if(income<=b.min)break;t+=(Math.min(income,b.max)-b.min)*b.rate}return t}

const EXAMPLES=[
  {title:'W-2 Employee',   desc:'Standard salaried worker',          salary:65000, payPeriod:'biweekly',    filing:'single', pre401k:3000, preHealth:200},
  {title:'High Earner',    desc:'Senior professional, bi-weekly',    salary:150000,payPeriod:'biweekly',    filing:'mfj',    pre401k:10000,preHealth:400},
  {title:'Hourly Worker',  desc:'$25/hr, 40hrs/week, weekly pay',    salary:52000, payPeriod:'weekly',      filing:'single', pre401k:1500, preHealth:150},
]

const FAQ=[
  {q:'Why is my paycheck less than my salary divided by pay periods?',a:'Multiple deductions reduce gross pay before you receive it: federal income tax withholding, Social Security (6.2%), Medicare (1.45%), state income tax, and pre-tax deductions for health insurance, dental, 401(k), HSA and FSA. These can collectively reduce gross pay by 25-40%.'},
  {q:'What are pre-tax deductions and why do they matter?',a:'Pre-tax deductions (401(k), health insurance, HSA, FSA, dental) are subtracted from gross pay before federal income tax is calculated. This reduces your taxable income dollar-for-dollar, lowering your tax bill. A $500/month 401(k) contribution does not cost you $500 in take-home pay — it costs significantly less after the tax savings.'},
  {q:'What is the Social Security wage base?',a:'Social Security tax (6.2%) only applies to wages up to $168,600 (2024). Once your cumulative wages exceed this amount for the year, Social Security withholding stops. Medicare tax (1.45%) has no wage base cap and applies to all wages. An additional 0.9% Medicare surtax applies to wages above $200,000 (single) / $250,000 (MFJ).'},
  {q:'How does W-4 filing status affect withholding?',a:'Your W-4 tells your employer how much federal tax to withhold. Filing as Single results in more withholding than Married Filing Jointly for the same income. Claiming additional allowances or specifying extra withholding further adjusts the amount. The goal is to match your actual tax liability to avoid large refunds or bills at filing.'},
  {q:'What is the difference between gross and net pay?',a:'Gross pay is your total earnings for the pay period before any deductions. Net pay (take-home pay) is what remains after all taxes, insurance premiums, retirement contributions and other deductions. Gross pay for budgeting overstates available income — always budget from net pay.'},
]
const GLOSSARY=[
  {term:'Gross Pay',        def:'Total earnings for a pay period before any deductions.'},
  {term:'Net Pay',          def:'Take-home pay after all taxes and deductions. What hits your bank account.'},
  {term:'Pre-Tax Deduction',def:'Deductions taken before income tax is calculated — reduces taxable income. Includes 401(k), health insurance, HSA.'},
  {term:'FICA',             def:'Federal Insurance Contributions Act: 6.2% Social Security + 1.45% Medicare, both employer and employee owe this.'},
  {term:'W-4',              def:'IRS form employees file with their employer to set federal income tax withholding based on filing status and adjustments.'},
  {term:'Withholding',      def:'Federal and state taxes withheld from each paycheck and remitted to the IRS/state on the employee\'s behalf.'},
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

export default function PaycheckCalculator({meta,category}){
  const[salary,    setSalary]    =useState(65000)
  const[ppKey,     setPpKey]     =useState('biweekly')
  const[filing,    setFiling]    =useState('single')
  const[pre401k,   setPre401k]   =useState(3000)
  const[preHealth, setPreHealth] =useState(200)
  const[preHsa,    setPreHsa]    =useState(0)
  const[stateTaxPct,setStateTaxPct]=useState(5)
  const[currency,  setCurrency]  =useState(CURRENCIES[0])
  const[openFaq,   setOpenFaq]   =useState(null)
  const calcRef=useRef(null)
  const sym=currency.symbol
  const catColor=category?.color||'#6366f1'

  const pp=PAY_PERIODS.find(p=>p.key===ppKey)
  const brackets=filing==='single'?BRACKETS_SINGLE:BRACKETS_MFJ
  const stdDed=filing==='single'?STD_DED.single:STD_DED.mfj

  const annualPreTax=pre401k+preHealth*12+preHsa
  const annualTaxable=Math.max(0,salary-annualPreTax-stdDed)
  const annualFedTax=calcFedTax(annualTaxable,brackets)
  const annualStateTax=salary*stateTaxPct/100
  const annualSS=Math.min(salary,168600)*0.062
  const annualMedicare=salary*0.0145
  const annualFica=annualSS+annualMedicare

  const grossPerPeriod=salary/pp.n
  const fedPerPeriod=annualFedTax/pp.n
  const statePerPeriod=annualStateTax/pp.n
  const ssPerPeriod=annualSS/pp.n
  const medicarePerPeriod=annualMedicare/pp.n
  const preTaxPerPeriod=annualPreTax/pp.n
  const netPay=grossPerPeriod-fedPerPeriod-statePerPeriod-ssPerPeriod-medicarePerPeriod-preTaxPerPeriod
  const effectiveRate=annualTaxable>0?annualFedTax/annualTaxable*100:0

  function applyExample(ex){
    setSalary(ex.salary);setPpKey(ex.payPeriod);setFiling(ex.filing);setPre401k(ex.pre401k);setPreHealth(ex.preHealth)
    setTimeout(()=>calcRef.current?.scrollIntoView({behavior:'smooth',block:'start'}),50)
  }

  return(
    <div style={{display:'flex',flexDirection:'column',gap:24}}>
      <div ref={calcRef} style={{scrollMarginTop:80}}>
        <CalcShell
          left={<>
            <div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:16,paddingBottom:8,borderBottom:'0.5px solid var(--border)'}}>Pay Details</div>
            <CurrencyDropdown currency={currency} setCurrency={setCurrency} catColor={catColor}/>
            <FieldInput label="Annual Gross Salary" value={salary} onChange={setSalary} prefix={sym} catColor={catColor}/>

            <div style={{marginBottom:14}}>
              <label style={{fontSize:12.5,fontWeight:600,color:'var(--text)',display:'block',marginBottom:8,fontFamily:"'DM Sans',sans-serif"}}>Pay Frequency</label>
              <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                {PAY_PERIODS.map(p=>(
                  <button key={p.key} onClick={()=>setPpKey(p.key)} style={{padding:'6px 11px',borderRadius:7,border:`1.5px solid ${ppKey===p.key?catColor:'var(--border)'}`,background:ppKey===p.key?catColor+'15':'var(--bg-raised)',color:ppKey===p.key?catColor:'var(--text-2)',fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}}>{p.label}</button>
                ))}
              </div>
            </div>

            <div style={{marginBottom:14}}>
              <label style={{fontSize:12.5,fontWeight:600,color:'var(--text)',display:'block',marginBottom:8,fontFamily:"'DM Sans',sans-serif"}}>Filing Status</label>
              <div style={{display:'flex',gap:8}}>
                {[{k:'single',l:'Single'},{k:'mfj',l:'Married (MFJ)'}].map(f=>(
                  <button key={f.k} onClick={()=>setFiling(f.k)} style={{flex:1,padding:'8px',borderRadius:8,border:`1.5px solid ${filing===f.k?catColor:'var(--border)'}`,background:filing===f.k?catColor+'15':'var(--bg-raised)',color:filing===f.k?catColor:'var(--text-2)',fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}}>{f.l}</button>
                ))}
              </div>
            </div>

            <div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.07em',margin:'16px 0 14px',paddingBottom:8,borderBottom:'0.5px solid var(--border)'}}>Pre-Tax Deductions (Annual)</div>
            <FieldInput label="401(k) Contribution"  value={pre401k}    onChange={setPre401k}    prefix={sym} max={23000} catColor={catColor}/>
            <FieldInput label="Health Insurance Prem." hint="Monthly × 12" value={preHealth}   onChange={setPreHealth}   prefix={sym} catColor={catColor}/>
            <FieldInput label="HSA Contribution"      value={preHsa}     onChange={setPreHsa}     prefix={sym} max={8300}  catColor={catColor}/>
            <FieldInput label="State Income Tax Rate"  value={stateTaxPct} onChange={setStateTaxPct} suffix="%" max={15}   catColor={catColor}/>

            <div style={{padding:'12px 14px',borderRadius:10,marginBottom:14,background:catColor+'0d',border:`1px solid ${catColor}25`}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
                <span style={{fontSize:11,color:'var(--text-2)',fontFamily:"'DM Sans',sans-serif"}}>{pp.label} Take-Home Pay</span>
                <span style={{fontSize:20,fontWeight:800,color:catColor,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{fmtD(netPay,sym)}</span>
              </div>
              <div style={{display:'flex',justifyContent:'space-between'}}>
                <span style={{fontSize:10,color:'var(--text-3)'}}>Gross/period: {fmtD(grossPerPeriod,sym)}</span>
                <span style={{fontSize:10,color:'var(--text-3)'}}>Effective rate: {fmtP(effectiveRate)}</span>
              </div>
            </div>

            <div style={{display:'flex',gap:10}}>
              <button style={{flex:1,padding:13,borderRadius:10,border:'none',background:catColor,color:'#fff',fontSize:14,fontWeight:700,cursor:'pointer'}} onMouseEnter={e=>e.currentTarget.style.opacity='.85'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>Calculate →</button>
              <button onClick={()=>{setSalary(65000);setPpKey('biweekly');setFiling('single');setPre401k(3000);setPreHealth(200);setPreHsa(0);setStateTaxPct(5)}} style={{padding:'13px 18px',borderRadius:10,border:'1.5px solid var(--border-2)',background:'var(--bg-raised)',color:'var(--text-2)',fontSize:13,fontWeight:500,cursor:'pointer'}} onMouseEnter={e=>{e.currentTarget.style.borderColor='#ef4444';e.currentTarget.style.color='#ef4444'}} onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border-2)';e.currentTarget.style.color='var(--text-2)'}}>Reset</button>
            </div>
          </>}
          right={<>
            <ResultHero label={`${pp.label} Net Pay`} value={netPay} formatter={n=>fmtD(n,sym)} sub={`Gross: ${fmtD(grossPerPeriod,sym)} | Annual net: ${fmt(netPay*pp.n,sym)}`} color={catColor}/>
            <BreakdownTable title={`${pp.label} Paycheck Breakdown`} rows={[
              {label:'Gross Pay',                value:fmtD(grossPerPeriod,sym),   color:catColor},
              {label:'Federal Income Tax',       value:`-${fmtD(fedPerPeriod,sym)}`,  color:'#ef4444'},
              {label:'State Income Tax',         value:`-${fmtD(statePerPeriod,sym)}`,color:'#ef4444'},
              {label:'Social Security (6.2%)',   value:`-${fmtD(ssPerPeriod,sym)}`},
              {label:'Medicare (1.45%)',         value:`-${fmtD(medicarePerPeriod,sym)}`},
              {label:'Pre-Tax Deductions',       value:`-${fmtD(preTaxPerPeriod,sym)}`,color:'#10b981',note:'401k+Health+HSA'},
              {label:'Net Take-Home Pay',        value:fmtD(netPay,sym),           bold:true,highlight:true},
              {label:'Annual Net Pay',           value:fmt(netPay*pp.n,sym)},
              {label:'Effective Federal Rate',   value:fmtP(effectiveRate)},
            ]}/>
            <AIHintCard hint={`${pp.label} gross: ${fmtD(grossPerPeriod,sym)} → take-home: ${fmtD(netPay,sym)}. Pre-tax deductions save you ${fmtD(preTaxPerPeriod*(effectiveRate/100),sym)}/period in federal tax. Annual net: ${fmt(netPay*pp.n,sym)}.`}/>
          </>}
        />
      </div>

      <Section title="Pay Period Comparison" subtitle="Your net pay across all pay frequencies">
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontFamily:"'DM Sans',sans-serif"}}>
            <thead><tr>{['Frequency','Gross/Period','Net/Period','Annual Net','Periods/Yr'].map((h,i)=>(
              <th key={h} style={{padding:'9px 12px',fontSize:11,fontWeight:700,color:'var(--text-3)',textAlign:i===0?'left':'right',borderBottom:'1px solid var(--border)',fontFamily:"'Space Grotesk',sans-serif"}}>{h}</th>
            ))}</tr></thead>
            <tbody>
              {PAY_PERIODS.map((p,i)=>{
                const g=salary/p.n
                const net=netPay*(pp.n/p.n)
                const isSelected=p.key===ppKey
                return(
                  <tr key={p.key} style={{background:isSelected?catColor+'12':i%2===0?'var(--bg-raised)':'transparent'}}>
                    <td style={{padding:'9px 12px',fontSize:12,fontWeight:isSelected?700:500,color:isSelected?catColor:'var(--text)'}}>{p.label}{isSelected?' ✓':''}</td>
                    <td style={{padding:'9px 12px',fontSize:12,color:'var(--text)',textAlign:'right'}}>{fmtD(g,sym)}</td>
                    <td style={{padding:'9px 12px',fontSize:12,color:catColor,fontWeight:600,textAlign:'right'}}>{fmtD(net,sym)}</td>
                    <td style={{padding:'9px 12px',fontSize:12,color:'var(--text)',textAlign:'right'}}>{fmt(net*p.n,sym)}</td>
                    <td style={{padding:'9px 12px',fontSize:12,color:'var(--text-3)',textAlign:'right'}}>{p.n}</td>
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
              {[['Salary',fmt(ex.salary,sym)],['Pay',PAY_PERIODS.find(p=>p.key===ex.payPeriod)?.label],['401(k)',fmt(ex.pre401k,sym)]].map(([k,v])=>(
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

      <Section title="Formula Explained">
        <div style={{background:'var(--bg-raised)',borderRadius:10,padding:'14px 16px',marginBottom:14,fontFamily:'monospace',fontSize:12,color:catColor,lineHeight:1.9}}>
          Gross/Period = Annual Salary / Pay Periods{'\n'}
          Taxable = Salary − Pre-Tax Deductions − Std Deduction{'\n'}
          Net = Gross/Period − Fed Tax − State Tax − FICA − Pre-Tax
        </div>
        <p style={{fontSize:12.5,color:'var(--text-2)',lineHeight:1.75,margin:0,fontFamily:"'DM Sans',sans-serif"}}>
          Federal withholding is estimated by annualising the paycheck amount and computing the annual tax, then dividing by pay periods. Pre-tax deductions reduce taxable income before withholding is calculated, providing meaningful tax savings every paycheck.
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
