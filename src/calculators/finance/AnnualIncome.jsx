import { useState, useEffect, useRef } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import ResultHero from '../../components/calculator/ResultHero'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'
import CurrencyDropdown, { CURRENCIES } from '../../components/calculator/CurrencyDropdown'

const fmt  = (n, sym='$') => sym+Math.round(Math.max(0,n)).toLocaleString()
const fmtD = (n, sym='$') => sym+(Math.round(n*100)/100).toFixed(2)
const fmtP = n => n.toFixed(2)+'%'

const BRACKETS=[
  {min:0,      max:11600,  rate:0.10},
  {min:11600,  max:47150,  rate:0.12},
  {min:47150,  max:100525, rate:0.22},
  {min:100525, max:191950, rate:0.24},
  {min:191950, max:243725, rate:0.32},
  {min:243725, max:609350, rate:0.35},
  {min:609350, max:Infinity,rate:0.37},
]
function calcFedTax(income){let t=0;for(const b of BRACKETS){if(income<=b.min)break;t+=(Math.min(income,b.max)-b.min)*b.rate}return t}
function getMarginal(income){for(let i=BRACKETS.length-1;i>=0;i--){if(income>BRACKETS[i].min)return BRACKETS[i].rate*100}return 10}

const EXAMPLES=[
  {title:'Salaried Employee', desc:'Standard W-2 income',                salary:75000, hourly:0,     freelance:0,     rental:0,     dividends:0,    interest:0},
  {title:'Multiple Streams',  desc:'Salary + side hustle + investments', salary:85000, hourly:0,     freelance:15000, rental:12000, dividends:3000, interest:500},
  {title:'Gig Economy',       desc:'Hourly + freelance mix',             salary:0,     hourly:55000, freelance:20000, rental:0,     dividends:0,    interest:200},
]
const FAQ=[
  {q:'What counts as annual income?',a:'Annual income includes all money received in a year: wages and salary, self-employment earnings, rental income, dividends and capital gains, interest, alimony received (if pre-2019 agreement), and any other regular income. Gifts and inheritances are generally not income.'},
  {q:'What is gross vs net income?',a:'Gross income is total earnings before any deductions. Adjusted Gross Income (AGI) is gross minus above-the-line deductions (401k contributions, HSA, student loan interest). Taxable income is AGI minus standard or itemized deductions. Net income is what actually lands in your bank account.'},
  {q:'How does income from different sources get taxed?',a:'Earned income (wages, salary, self-employment) is taxed as ordinary income at your marginal rate. Qualified dividends and long-term capital gains are taxed at preferential rates (0%, 15%, or 20%). Interest income is taxed as ordinary income. Rental income is ordinary income but can be offset by depreciation and expenses.'},
  {q:'What is the difference between marginal and effective tax rate?',a:'Your marginal rate is the rate on your next dollar of income. Your effective rate is your average: total tax divided by total income. The effective rate is always lower than the marginal rate because lower income is taxed at lower bracket rates first.'},
  {q:'Do I need to pay estimated taxes on non-salary income?',a:'Yes. If you expect to owe $1,000 or more in taxes on income not subject to withholding (freelance, rental, investments), the IRS requires quarterly estimated tax payments due in April, June, September and January.'},
]
const GLOSSARY=[
  {term:'Gross Income',        def:'Total income from all sources before any deductions or taxes.'},
  {term:'AGI',                 def:'Adjusted Gross Income — gross income minus above-the-line deductions like 401(k), HSA, and student loan interest.'},
  {term:'Marginal Rate',       def:'The tax rate applied to your highest dollar of income — the rate of your top bracket.'},
  {term:'Effective Rate',      def:'Your average tax rate: total federal tax ÷ total taxable income. Always lower than your marginal rate.'},
  {term:'Passive Income',      def:'Income from rental property or limited partnerships requiring little active involvement.'},
  {term:'Qualified Dividends', def:'Dividends eligible for lower capital gains tax rates (0%, 15%, 20%) rather than ordinary income rates.'},
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

const INCOME_SOURCES=[
  {key:'salary',    label:'Salary / W-2 Wages',          icon:'💼',hint:'Annual gross salary'},
  {key:'hourly',    label:'Hourly Wages',                 icon:'⏰',hint:'Annual from hourly work'},
  {key:'freelance', label:'Freelance / Self-Employment',  icon:'💻',hint:'Gross freelance income'},
  {key:'rental',    label:'Rental Income',                icon:'🏠',hint:'Gross rent collected'},
  {key:'dividends', label:'Dividends',                    icon:'📈',hint:'Qualified or ordinary'},
  {key:'interest',  label:'Interest Income',              icon:'🏦',hint:'Savings, bonds, CDs'},
  {key:'other',     label:'Other Income',                 icon:'📦',hint:'Alimony, royalties, etc.'},
]
const DEF_SRC={salary:75000,hourly:0,freelance:0,rental:0,dividends:0,interest:0,other:0}
const DEF_DED={retirement:5000,hsa:0,studentLoan:0}

export default function AnnualIncome({meta,category}){
  const[sources,setSources]=useState(DEF_SRC)
  const[deductions,setDeductions]=useState(DEF_DED)
  const[currency,setCurrency]=useState(CURRENCIES[0])
  const[openFaq,setOpenFaq]=useState(null)
  const calcRef=useRef(null)
  const sym=currency.symbol
  const catColor=category?.color||'#6366f1'

  const set=(k,v)=>setSources(p=>({...p,[k]:v}))
  const setDed=(k,v)=>setDeductions(p=>({...p,[k]:v}))

  const grossIncome  =Object.values(sources).reduce((a,b)=>a+b,0)
  const totalDed     =Object.values(deductions).reduce((a,b)=>a+b,0)
  const stdDeduction =14600
  const agi          =Math.max(0,grossIncome-totalDed)
  const taxableIncome=Math.max(0,agi-stdDeduction)
  const fedTax       =calcFedTax(taxableIncome)
  const marginalRate =getMarginal(taxableIncome)
  const effectiveRate=taxableIncome>0?fedTax/taxableIncome*100:0
  const ficaTax      =Math.min(sources.salary+sources.hourly,168600)*0.062+(sources.salary+sources.hourly)*0.0145
  const netIncome    =grossIncome-fedTax-ficaTax

  const monthly=grossIncome/12
  const weekly =grossIncome/52
  const daily  =grossIncome/260
  const hrlyEq =grossIncome/2080

  function applyExample(ex){
    setSources({salary:ex.salary,hourly:ex.hourly,freelance:ex.freelance,rental:ex.rental,dividends:ex.dividends,interest:ex.interest,other:0})
    setTimeout(()=>calcRef.current?.scrollIntoView({behavior:'smooth',block:'start'}),50)
  }

  return(
    <div style={{display:'flex',flexDirection:'column',gap:24}}>
      <div ref={calcRef} style={{scrollMarginTop:80}}>
        <CalcShell
          left={<>
            <div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:16,paddingBottom:8,borderBottom:'0.5px solid var(--border)'}}>Income Sources</div>
            <CurrencyDropdown currency={currency} setCurrency={setCurrency} catColor={catColor}/>
            {INCOME_SOURCES.map(src=>(
              <div key={src.key} style={{marginBottom:12}}>
                <div style={{display:'flex',alignItems:'center',gap:7,marginBottom:4}}>
                  <span style={{fontSize:13}}>{src.icon}</span>
                  <label style={{fontSize:12,fontWeight:600,color:'var(--text)',fontFamily:"'DM Sans',sans-serif"}}>{src.label}</label>
                  <span style={{fontSize:10,color:'var(--text-3)',marginLeft:'auto'}}>{src.hint}</span>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:6,background:'var(--bg-input,var(--bg-card))',border:`1.5px solid ${sources[src.key]>0?catColor+'60':'var(--border)'}`,borderRadius:8,padding:'0 10px',height:38}}>
                  <span style={{fontSize:12,color:'var(--text-3)',fontWeight:600,flexShrink:0}}>{sym}</span>
                  <input type="text" inputMode="decimal" defaultValue={sources[src.key]}
                    onChange={e=>{const v=parseFloat(e.target.value);set(src.key,isNaN(v)?0:Math.max(0,v))}}
                    style={{flex:1,border:'none',background:'transparent',fontSize:13,fontWeight:600,color:'var(--text)',padding:0,outline:'none',fontFamily:"'DM Sans',sans-serif"}}/>
                </div>
              </div>
            ))}

            <div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.07em',margin:'16px 0 14px',paddingBottom:8,borderBottom:'0.5px solid var(--border)'}}>Above-the-Line Deductions</div>
            <FieldInput label="401(k) / IRA Contributions" value={deductions.retirement} onChange={v=>setDed('retirement',v)} prefix={sym} max={30000} catColor={catColor}/>
            <FieldInput label="HSA Contributions"          value={deductions.hsa}        onChange={v=>setDed('hsa',v)}        prefix={sym} max={8300}  catColor={catColor}/>
            <FieldInput label="Student Loan Interest"      value={deductions.studentLoan} onChange={v=>setDed('studentLoan',v)} prefix={sym} max={2500}  catColor={catColor}/>

            <div style={{padding:'12px 14px',borderRadius:10,marginBottom:14,background:catColor+'0d',border:`1px solid ${catColor}25`}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
                <span style={{fontSize:11,color:'var(--text-2)',fontFamily:"'DM Sans',sans-serif"}}>Gross Annual Income</span>
                <span style={{fontSize:20,fontWeight:800,color:catColor,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{fmt(grossIncome,sym)}</span>
              </div>
              <div style={{display:'flex',justifyContent:'space-between'}}>
                <span style={{fontSize:10,color:'var(--text-3)'}}>Marginal: {fmtP(marginalRate)}</span>
                <span style={{fontSize:10,color:'var(--text-3)'}}>Net est: {fmt(netIncome,sym)}</span>
              </div>
            </div>

            <div style={{display:'flex',gap:10}}>
              <button style={{flex:1,padding:13,borderRadius:10,border:'none',background:catColor,color:'#fff',fontSize:14,fontWeight:700,cursor:'pointer'}} onMouseEnter={e=>e.currentTarget.style.opacity='.85'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>Calculate →</button>
              <button onClick={()=>{setSources(DEF_SRC);setDeductions(DEF_DED)}} style={{padding:'13px 18px',borderRadius:10,border:'1.5px solid var(--border-2)',background:'var(--bg-raised)',color:'var(--text-2)',fontSize:13,fontWeight:500,cursor:'pointer'}} onMouseEnter={e=>{e.currentTarget.style.borderColor='#ef4444';e.currentTarget.style.color='#ef4444'}} onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border-2)';e.currentTarget.style.color='var(--text-2)'}}>Reset</button>
            </div>
          </>}
          right={<>
            <ResultHero label="Total Annual Income" value={grossIncome} formatter={n=>fmt(n,sym)} sub={`Net after estimated taxes: ${fmt(netIncome,sym)}`} color={catColor}/>
            <BreakdownTable title="Income Summary" rows={[
              {label:'Gross Annual Income',       value:fmt(grossIncome,sym),   color:catColor,bold:true},
              {label:'Monthly',                   value:fmt(monthly,sym)},
              {label:'Weekly',                    value:fmt(weekly,sym)},
              {label:'Daily (260 work days)',      value:fmtD(daily,sym)},
              {label:'Hourly equiv (2,080 hrs)',   value:fmtD(hrlyEq,sym)},
              {label:'Above-the-Line Deductions', value:fmt(totalDed,sym)},
              {label:'Adjusted Gross Income',     value:fmt(agi,sym)},
              {label:'Standard Deduction (2024)', value:fmt(stdDeduction,sym)},
              {label:'Taxable Income',            value:fmt(taxableIncome,sym)},
              {label:'Est. Federal Income Tax',   value:fmt(fedTax,sym),        color:'#ef4444'},
              {label:'FICA (on W-2 wages)',        value:fmt(ficaTax,sym),        color:'#ef4444'},
              {label:'Marginal Rate',             value:fmtP(marginalRate),      color:catColor},
              {label:'Effective Rate',            value:fmtP(effectiveRate)},
              {label:'Estimated Net Income',      value:fmt(netIncome,sym),      bold:true,highlight:true},
            ]}/>
            <AIHintCard hint={`Gross: ${fmt(grossIncome,sym)}/yr | Marginal: ${fmtP(marginalRate)} | Effective: ${fmtP(effectiveRate)} | Net: ${fmt(netIncome,sym)}/yr (${fmt(netIncome/12,sym)}/mo).`}/>
          </>}
        />
      </div>

      <Section title="Income Source Breakdown" subtitle="Contribution of each stream to total gross income">
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {INCOME_SOURCES.filter(s=>sources[s.key]>0).sort((a,b)=>sources[b.key]-sources[a.key]).map(src=>{
            const pct=grossIncome>0?sources[src.key]/grossIncome*100:0
            return(
              <div key={src.key}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                  <span style={{fontSize:12,fontWeight:600,color:'var(--text)',fontFamily:"'DM Sans',sans-serif"}}>{src.icon} {src.label}</span>
                  <span style={{fontSize:12,fontWeight:700,color:catColor}}>{fmt(sources[src.key],sym)} ({Math.round(pct)}%)</span>
                </div>
                <div style={{height:7,background:'var(--bg-raised)',borderRadius:4,overflow:'hidden'}}>
                  <div style={{width:`${pct}%`,height:'100%',background:catColor,borderRadius:4,transition:'width .4s',opacity:0.8}}/>
                </div>
              </div>
            )
          })}
        </div>
      </Section>

      <Section title="Real World Examples" subtitle="Click any example to fill the calculator">
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
          {EXAMPLES.map((ex,i)=>{
            const total=ex.salary+ex.hourly+ex.freelance+ex.rental+ex.dividends+ex.interest
            return(
              <button key={i} onClick={()=>applyExample(ex)} style={{padding:14,borderRadius:10,border:'1.5px solid var(--border)',background:'var(--bg-raised)',cursor:'pointer',textAlign:'left',transition:'all .15s'}} onMouseEnter={e=>{e.currentTarget.style.borderColor=catColor;e.currentTarget.style.background=catColor+'10'}} onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.background='var(--bg-raised)'}}>
                <div style={{fontSize:13,fontWeight:700,color:'var(--text)',marginBottom:4}}>{ex.title}</div>
                <div style={{fontSize:11,color:'var(--text-3)',marginBottom:10,lineHeight:1.4}}>{ex.desc}</div>
                {[['Total',fmt(total,sym)],['Sources',[ex.salary>0&&'W-2',ex.freelance>0&&'Freelance',ex.rental>0&&'Rental'].filter(Boolean).join(', ')||'Hourly']].map(([k,v])=>(
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
          Gross = Sum of all income streams{'\n'}
          AGI = Gross − 401(k) − HSA − Student Loan Interest{'\n'}
          Taxable = AGI − Standard Deduction ($14,600){'\n'}
          Net = Gross − Federal Tax − FICA
        </div>
        <p style={{fontSize:12.5,color:'var(--text-2)',lineHeight:1.75,margin:0,fontFamily:"'DM Sans',sans-serif"}}>
          All income streams combine into gross income. Above-the-line deductions reduce AGI before the standard deduction is applied. Federal tax uses progressive brackets — your effective rate is always lower than marginal. FICA applies only to earned wages, not investment income.
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
