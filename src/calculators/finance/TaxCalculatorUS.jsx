import { useState, useEffect, useRef } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import ResultHero from '../../components/calculator/ResultHero'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'
import CurrencyDropdown, { CURRENCIES } from '../../components/calculator/CurrencyDropdown'

const fmt  = (n,sym='$') => sym+Math.round(Math.max(0,n)).toLocaleString()
const fmtP = n => n.toFixed(2)+'%'

const FILING_STATUS=[
  {key:'single',    label:'Single'},
  {key:'mfj',       label:'Married Filing Jointly'},
  {key:'mfs',       label:'Married Filing Separately'},
  {key:'hoh',       label:'Head of Household'},
]

const BRACKETS={
  single:[ {min:0,max:11600,rate:0.10},{min:11600,max:47150,rate:0.12},{min:47150,max:100525,rate:0.22},{min:100525,max:191950,rate:0.24},{min:191950,max:243725,rate:0.32},{min:243725,max:609350,rate:0.35},{min:609350,max:Infinity,rate:0.37} ],
  mfj:[    {min:0,max:23200,rate:0.10},{min:23200,max:94300,rate:0.12},{min:94300,max:201050,rate:0.22},{min:201050,max:383900,rate:0.24},{min:383900,max:487450,rate:0.32},{min:487450,max:731200,rate:0.35},{min:731200,max:Infinity,rate:0.37} ],
  mfs:[    {min:0,max:11600,rate:0.10},{min:11600,max:47150,rate:0.12},{min:47150,max:100525,rate:0.22},{min:100525,max:191950,rate:0.24},{min:191950,max:243725,rate:0.32},{min:243725,max:365600,rate:0.35},{min:365600,max:Infinity,rate:0.37} ],
  hoh:[    {min:0,max:16550,rate:0.10},{min:16550,max:63100,rate:0.12},{min:63100,max:100500,rate:0.22},{min:100500,max:191950,rate:0.24},{min:191950,max:243700,rate:0.32},{min:243700,max:609350,rate:0.35},{min:609350,max:Infinity,rate:0.37} ],
}
const STD_DED={single:14600,mfj:29200,mfs:14600,hoh:21900}

function calcTax(income,status){
  let t=0;const bs=BRACKETS[status]||BRACKETS.single
  for(const b of bs){if(income<=b.min)break;t+=(Math.min(income,b.max)-b.min)*b.rate}
  return t
}
function getMarginal(income,status){
  const bs=BRACKETS[status]||BRACKETS.single
  for(let i=bs.length-1;i>=0;i--){if(income>bs[i].min)return bs[i].rate*100}
  return 10
}

const EXAMPLES=[
  {title:'Single Filer',       desc:'Standard W-2 employee',      income:75000,  filing:'single', deductMode:'standard',itemized:0, credits:0},
  {title:'Married Couple',     desc:'Combined household income',   income:150000, filing:'mfj',    deductMode:'standard',itemized:0, credits:2000},
  {title:'High Earner',        desc:'Top bracket planning',        income:400000, filing:'single', deductMode:'itemized',itemized:45000,credits:0},
]

const FAQ=[
  {q:'How do US federal tax brackets work?',a:'The US uses a progressive tax system with marginal brackets. Each bracket rate applies only to the income within that range — not to your total income. If you\'re in the 22% bracket, only the portion of income above the 12% threshold is taxed at 22%. The rates below it are taxed at lower rates. Your effective rate is always lower than your marginal rate.'},
  {q:'Standard deduction vs itemized deductions — which should I choose?',a:'The standard deduction ($14,600 single / $29,200 MFJ in 2024) is a flat reduction available to everyone. Itemized deductions (mortgage interest, state/local taxes up to $10,000, charitable donations, medical expenses) only make sense if they exceed the standard deduction. About 90% of filers take the standard deduction.'},
  {q:'What are tax credits vs tax deductions?',a:'A deduction reduces your taxable income, saving you money at your marginal rate. A $1,000 deduction in the 22% bracket saves $220. A credit directly reduces your tax bill dollar-for-dollar. A $1,000 credit saves exactly $1,000 regardless of your bracket. Credits are generally more valuable than deductions of the same amount.'},
  {q:'What is the alternative minimum tax (AMT)?',a:'The AMT is a parallel tax calculation designed to ensure high-income taxpayers pay a minimum amount of tax regardless of deductions. For 2024, the AMT exemption is $85,700 (single) / $133,300 (MFJ). If your AMT calculation exceeds your regular tax, you pay the higher amount. This calculator shows regular tax only.'},
  {q:'When do I need to make estimated tax payments?',a:'If you expect to owe at least $1,000 in federal taxes beyond what\'s withheld (common for self-employed, investors, or those with significant non-W2 income), you must make quarterly estimated payments. Due dates: April 15, June 15, September 15, January 15. Underpayment incurs penalties.'},
]
const GLOSSARY=[
  {term:'Marginal Rate',      def:'The tax rate applied to your last dollar of income — the highest bracket you reach.'},
  {term:'Effective Rate',     def:'Your average overall tax rate: total tax owed divided by taxable income.'},
  {term:'Standard Deduction', def:'A flat dollar amount reducing taxable income, available to all filers without itemizing.'},
  {term:'Tax Credit',         def:'A direct reduction of tax owed, dollar-for-dollar. More valuable than an equivalent deduction.'},
  {term:'Taxable Income',     def:'Gross income minus adjustments, minus standard or itemized deductions.'},
  {term:'AGI',                def:'Adjusted Gross Income — gross income minus above-the-line deductions before applying the standard or itemized deduction.'},
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

export default function TaxCalculatorUS({meta,category}){
  const[income,      setIncome]      =useState(75000)
  const[filing,      setFiling]      =useState('single')
  const[deductMode,  setDeductMode]  =useState('standard')
  const[itemized,    setItemized]    =useState(0)
  const[credits,     setCredits]     =useState(0)
  const[pre401k,     setPre401k]     =useState(5000)
  const[currency,    setCurrency]    =useState(CURRENCIES[0])
  const[openFaq,     setOpenFaq]     =useState(null)
  const calcRef=useRef(null)
  const sym=currency.symbol
  const catColor=category?.color||'#6366f1'

  const stdDed=STD_DED[filing]||14600
  const deduction=deductMode==='itemized'?Math.max(itemized,stdDed):stdDed
  const agi=Math.max(0,income-pre401k)
  const taxableIncome=Math.max(0,agi-deduction)
  const grossTax=calcTax(taxableIncome,filing)
  const taxAfterCredits=Math.max(0,grossTax-credits)
  const marginalRate=getMarginal(taxableIncome,filing)
  const effectiveRate=taxableIncome>0?taxAfterCredits/taxableIncome*100:0
  const effectiveOnGross=income>0?taxAfterCredits/income*100:0
  const ficaTax=Math.min(income,168600)*0.062+income*0.0145
  const totalTax=taxAfterCredits+ficaTax
  const netIncome=income-totalTax-pre401k

  function applyExample(ex){
    setIncome(ex.income);setFiling(ex.filing);setDeductMode(ex.deductMode);setItemized(ex.itemized);setCredits(ex.credits)
    setTimeout(()=>calcRef.current?.scrollIntoView({behavior:'smooth',block:'start'}),50)
  }

  return(
    <div style={{display:'flex',flexDirection:'column',gap:24}}>
      <div ref={calcRef} style={{scrollMarginTop:80}}>
        <CalcShell
          left={<>
            <div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:16,paddingBottom:8,borderBottom:'0.5px solid var(--border)'}}>Income & Filing</div>
            <CurrencyDropdown currency={currency} setCurrency={setCurrency} catColor={catColor}/>
            <FieldInput label="Gross Annual Income" value={income} onChange={setIncome} prefix={sym} catColor={catColor}/>

            <div style={{marginBottom:14}}>
              <label style={{fontSize:12.5,fontWeight:600,color:'var(--text)',display:'block',marginBottom:8,fontFamily:"'DM Sans',sans-serif"}}>Filing Status</label>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6}}>
                {FILING_STATUS.map(f=>(
                  <button key={f.key} onClick={()=>setFiling(f.key)} style={{padding:'7px 8px',borderRadius:7,border:`1.5px solid ${filing===f.key?catColor:'var(--border)'}`,background:filing===f.key?catColor+'15':'var(--bg-raised)',color:filing===f.key?catColor:'var(--text-2)',fontSize:11.5,fontWeight:600,cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}}>{f.label}</button>
                ))}
              </div>
            </div>

            <FieldInput label="Pre-Tax 401(k)/IRA" hint="Reduces AGI" value={pre401k} onChange={setPre401k} prefix={sym} max={30000} catColor={catColor}/>

            <div style={{marginBottom:14}}>
              <label style={{fontSize:12.5,fontWeight:600,color:'var(--text)',display:'block',marginBottom:8,fontFamily:"'DM Sans',sans-serif"}}>Deduction Method</label>
              <div style={{display:'flex',gap:8}}>
                {[{k:'standard',l:`Standard (${fmt(stdDed,sym)})`},{k:'itemized',l:'Itemized'}].map(d=>(
                  <button key={d.k} onClick={()=>setDeductMode(d.k)} style={{flex:1,padding:'7px 8px',borderRadius:7,border:`1.5px solid ${deductMode===d.k?catColor:'var(--border)'}`,background:deductMode===d.k?catColor+'15':'var(--bg-raised)',color:deductMode===d.k?catColor:'var(--text-2)',fontSize:11.5,fontWeight:600,cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}}>{d.l}</button>
                ))}
              </div>
            </div>

            {deductMode==='itemized'&&<FieldInput label="Total Itemized Deductions" value={itemized} onChange={setItemized} prefix={sym} catColor={catColor}/>}
            <FieldInput label="Tax Credits" hint="Child, education, EV, etc." value={credits} onChange={setCredits} prefix={sym} catColor={catColor}/>

            <div style={{padding:'12px 14px',borderRadius:10,marginBottom:14,background:catColor+'0d',border:`1px solid ${catColor}25`}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
                <span style={{fontSize:11,color:'var(--text-2)',fontFamily:"'DM Sans',sans-serif"}}>Federal Tax Owed</span>
                <span style={{fontSize:20,fontWeight:800,color:catColor,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{fmt(taxAfterCredits,sym)}</span>
              </div>
              <div style={{display:'flex',justifyContent:'space-between'}}>
                <span style={{fontSize:10,color:'var(--text-3)'}}>Marginal: {fmtP(marginalRate)}</span>
                <span style={{fontSize:10,color:'var(--text-3)'}}>Effective: {fmtP(effectiveRate)}</span>
              </div>
            </div>

            <div style={{display:'flex',gap:10}}>
              <button style={{flex:1,padding:13,borderRadius:10,border:'none',background:catColor,color:'#fff',fontSize:14,fontWeight:700,cursor:'pointer'}} onMouseEnter={e=>e.currentTarget.style.opacity='.85'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>Calculate →</button>
              <button onClick={()=>{setIncome(75000);setFiling('single');setDeductMode('standard');setItemized(0);setCredits(0);setPre401k(5000)}} style={{padding:'13px 18px',borderRadius:10,border:'1.5px solid var(--border-2)',background:'var(--bg-raised)',color:'var(--text-2)',fontSize:13,fontWeight:500,cursor:'pointer'}} onMouseEnter={e=>{e.currentTarget.style.borderColor='#ef4444';e.currentTarget.style.color='#ef4444'}} onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border-2)';e.currentTarget.style.color='var(--text-2)'}}>Reset</button>
            </div>
          </>}
          right={<>
            <ResultHero label="Federal Tax Owed" value={taxAfterCredits} formatter={n=>fmt(n,sym)} sub={`Marginal: ${fmtP(marginalRate)} | Effective: ${fmtP(effectiveRate)}`} color={catColor}/>
            <BreakdownTable title="Tax Calculation" rows={[
              {label:'Gross Income',              value:fmt(income,sym),           color:catColor},
              {label:'Pre-Tax Deductions',        value:fmt(pre401k,sym)},
              {label:'Adjusted Gross Income',     value:fmt(agi,sym)},
              {label:`Deduction (${deductMode})`, value:fmt(deduction,sym)},
              {label:'Taxable Income',            value:fmt(taxableIncome,sym)},
              {label:'Gross Federal Tax',         value:fmt(grossTax,sym),         color:'#ef4444'},
              {label:'Tax Credits',               value:credits>0?`-${fmt(credits,sym)}`:'$0', color:'#10b981'},
              {label:'Federal Tax After Credits', value:fmt(taxAfterCredits,sym),  bold:true, color:'#ef4444'},
              {label:'FICA (SS + Medicare)',       value:fmt(ficaTax,sym),          color:'#ef4444'},
              {label:'Total Tax Burden',          value:fmt(totalTax,sym),         bold:true},
              {label:'Marginal Rate',             value:fmtP(marginalRate),        color:catColor},
              {label:'Effective Federal Rate',    value:fmtP(effectiveRate)},
              {label:'Effective All-In Rate',     value:fmtP(effectiveOnGross)},
              {label:'Estimated Net Income',      value:fmt(netIncome,sym),        bold:true, highlight:true},
            ]}/>
            <AIHintCard hint={`On ${fmt(income,sym)} income (${filing}), federal tax is ${fmt(taxAfterCredits,sym)}. Marginal rate: ${fmtP(marginalRate)} | Effective: ${fmtP(effectiveRate)}. Including FICA, total tax burden is ${fmt(totalTax,sym)} (${fmtP(effectiveOnGross)}).`}/>
          </>}
        />
      </div>

      <Section title="Tax Bracket Breakdown" subtitle="How your income is taxed across each bracket (2024)">
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontFamily:"'DM Sans',sans-serif"}}>
            <thead><tr>{['Bracket','Rate','Taxable Amount','Tax in Bracket'].map((h,i)=>(
              <th key={h} style={{padding:'9px 12px',fontSize:11,fontWeight:700,color:'var(--text-3)',textAlign:i===0?'left':'right',borderBottom:'1px solid var(--border)',fontFamily:"'Space Grotesk',sans-serif"}}>{h}</th>
            ))}</tr></thead>
            <tbody>
              {(BRACKETS[filing]||BRACKETS.single).map((b,i)=>{
                if(taxableIncome<=b.min)return null
                const taxable=Math.min(taxableIncome,b.max===Infinity?taxableIncome:b.max)-b.min
                const taxInBracket=taxable*b.rate
                return(
                  <tr key={i} style={{background:i%2===0?'var(--bg-raised)':'transparent'}}>
                    <td style={{padding:'9px 12px',fontSize:12,color:'var(--text)'}}>{fmt(b.min,sym)}–{b.max===Infinity?'∞':fmt(b.max,sym)}</td>
                    <td style={{padding:'9px 12px',fontSize:12,color:catColor,fontWeight:600,textAlign:'right'}}>{fmtP(b.rate*100)}</td>
                    <td style={{padding:'9px 12px',fontSize:12,color:'var(--text)',textAlign:'right'}}>{fmt(taxable,sym)}</td>
                    <td style={{padding:'9px 12px',fontSize:12,color:'#ef4444',fontWeight:600,textAlign:'right'}}>{fmt(taxInBracket,sym)}</td>
                  </tr>
                )
              }).filter(Boolean)}
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
              {[['Income',fmt(ex.income,sym)],['Status',FILING_STATUS.find(f=>f.key===ex.filing)?.label],['Deduction',ex.deductMode]].map(([k,v])=>(
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
          AGI = Gross Income − 401(k)/IRA{'\n'}
          Taxable = AGI − Deduction (Standard or Itemized){'\n'}
          Tax = Apply progressive brackets to Taxable Income{'\n'}
          Net Tax = Bracket Tax − Credits
        </div>
        <p style={{fontSize:12.5,color:'var(--text-2)',lineHeight:1.75,margin:0,fontFamily:"'DM Sans',sans-serif"}}>
          US federal income tax is progressive — each bracket rate applies only to the income within that range, not your entire income. The marginal rate is the highest bracket you reach. The effective rate is your actual average — always lower than marginal because lower income is taxed at lower rates first.
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
