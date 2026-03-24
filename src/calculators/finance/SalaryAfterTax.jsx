import { useState, useEffect, useRef } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import ResultHero from '../../components/calculator/ResultHero'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'
import CurrencyDropdown, { CURRENCIES } from '../../components/calculator/CurrencyDropdown'

const fmt  = (n,sym='$') => sym+Math.round(Math.max(0,n)).toLocaleString()
const fmtP = n => n.toFixed(2)+'%'

// 2024 flat/effective state income tax rates (approximate)
const STATE_RATES = [
  {code:'AL',name:'Alabama',         rate:4.0},{code:'AK',name:'Alaska',         rate:0.0},
  {code:'AZ',name:'Arizona',         rate:2.5},{code:'AR',name:'Arkansas',        rate:4.4},
  {code:'CA',name:'California',      rate:9.3},{code:'CO',name:'Colorado',        rate:4.4},
  {code:'CT',name:'Connecticut',     rate:5.0},{code:'DE',name:'Delaware',        rate:5.2},
  {code:'FL',name:'Florida',         rate:0.0},{code:'GA',name:'Georgia',         rate:5.49},
  {code:'HI',name:'Hawaii',          rate:8.25},{code:'ID',name:'Idaho',          rate:5.8},
  {code:'IL',name:'Illinois',        rate:4.95},{code:'IN',name:'Indiana',        rate:3.05},
  {code:'IA',name:'Iowa',            rate:5.7},{code:'KS',name:'Kansas',          rate:5.7},
  {code:'KY',name:'Kentucky',        rate:4.5},{code:'LA',name:'Louisiana',       rate:4.25},
  {code:'ME',name:'Maine',           rate:7.15},{code:'MD',name:'Maryland',       rate:5.75},
  {code:'MA',name:'Massachusetts',   rate:5.0},{code:'MI',name:'Michigan',        rate:4.25},
  {code:'MN',name:'Minnesota',       rate:7.85},{code:'MS',name:'Mississippi',    rate:4.7},
  {code:'MO',name:'Missouri',        rate:4.95},{code:'MT',name:'Montana',        rate:6.75},
  {code:'NE',name:'Nebraska',        rate:5.84},{code:'NV',name:'Nevada',         rate:0.0},
  {code:'NH',name:'New Hampshire',   rate:0.0},{code:'NJ',name:'New Jersey',      rate:6.37},
  {code:'NM',name:'New Mexico',      rate:5.9},{code:'NY',name:'New York',        rate:6.85},
  {code:'NC',name:'North Carolina',  rate:4.75},{code:'ND',name:'North Dakota',   rate:2.5},
  {code:'OH',name:'Ohio',            rate:3.99},{code:'OK',name:'Oklahoma',       rate:4.75},
  {code:'OR',name:'Oregon',          rate:9.9},{code:'PA',name:'Pennsylvania',    rate:3.07},
  {code:'RI',name:'Rhode Island',    rate:5.99},{code:'SC',name:'South Carolina', rate:6.4},
  {code:'SD',name:'South Dakota',    rate:0.0},{code:'TN',name:'Tennessee',       rate:0.0},
  {code:'TX',name:'Texas',           rate:0.0},{code:'UT',name:'Utah',            rate:4.85},
  {code:'VT',name:'Vermont',         rate:6.6},{code:'VA',name:'Virginia',        rate:5.75},
  {code:'WA',name:'Washington',      rate:0.0},{code:'WV',name:'West Virginia',   rate:5.12},
  {code:'WI',name:'Wisconsin',       rate:5.3},{code:'WY',name:'Wyoming',         rate:0.0},
  {code:'DC',name:'Washington DC',   rate:8.5},
]

const BRACKETS_SINGLE=[
  {min:0,max:11600,rate:0.10},{min:11600,max:47150,rate:0.12},
  {min:47150,max:100525,rate:0.22},{min:100525,max:191950,rate:0.24},
  {min:191950,max:243725,rate:0.32},{min:243725,max:609350,rate:0.35},
  {min:609350,max:Infinity,rate:0.37},
]
function calcFedTax(income){let t=0;for(const b of BRACKETS_SINGLE){if(income<=b.min)break;t+=(Math.min(income,b.max)-b.min)*b.rate}return t}

const EXAMPLES=[
  {title:'Texas vs California', desc:'Same salary, very different take-home', salary:100000, stateCode:'TX'},
  {title:'NYC Area',            desc:'NY state + local taxes',                salary:85000,  stateCode:'NY'},
  {title:'No Income Tax State', desc:'Washington — no state income tax',      salary:90000,  stateCode:'WA'},
]

const FAQ=[
  {q:'Which states have no income tax?',a:'Nine states have no state income tax: Alaska, Florida, Nevada, New Hampshire (no wage tax), South Dakota, Tennessee (no wage tax), Texas, Washington, and Wyoming. However, these states often compensate with higher property taxes, sales taxes, or other levies — the total tax burden varies.'},
  {q:'How much can state taxes vary?',a:'State income taxes range from 0% (no-tax states) to over 13% for high earners in California. For a $100,000 salary, you might pay nothing in Texas vs $10,000+ in California — a $10,000+ annual difference. This can significantly affect real-world take-home pay and is worth factoring into job location and relocation decisions.'},
  {q:'Do I pay state taxes where I live or where I work?',a:'Generally you pay state taxes where you live and where you work. If you live in one state and work in another, you typically file in both states, but many states have reciprocity agreements that simplify this. Remote workers usually owe taxes only in their state of residence.'},
  {q:'Are there local income taxes in addition to state?',a:'Yes — some cities levy their own income taxes on top of state taxes. New York City (up to 3.88%), Philadelphia (3.75%), Baltimore (3.2%), and Cleveland (2.5%) are notable examples. This calculator shows state-level tax only; local taxes may apply additionally.'},
]
const GLOSSARY=[
  {term:'State Income Tax',    def:'Tax levied by individual US states on residents\' income. Ranges from 0% to 13%+ depending on state and income level.'},
  {term:'Effective Tax Rate',  def:'Your actual average rate after applying the full calculation — total tax ÷ gross income.'},
  {term:'Tax Burden',          def:'The total percentage of income paid in taxes — federal + state + FICA combined.'},
  {term:'No-Tax States',       def:'States with no state income tax: Alaska, Florida, Nevada, South Dakota, Texas, Washington, Wyoming (+ NH & TN on wages).'},
  {term:'SALT Deduction',      def:'State and Local Tax deduction — capped at $10,000/yr for federal itemizers since 2018 TCJA.'},
  {term:'Reciprocity Agreement',def:'An agreement between states allowing residents to pay income tax only in their home state even if they work in another state.'},
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

export default function SalaryAfterTax({meta,category}){
  const[salary,    setSalary]    =useState(100000)
  const[stateCode, setStateCode] =useState('CA')
  const[currency,  setCurrency]  =useState(CURRENCIES[0])
  const[openFaq,   setOpenFaq]   =useState(null)
  const[search,    setSearch]    =useState('')
  const calcRef=useRef(null)
  const sym=currency.symbol
  const catColor=category?.color||'#6366f1'

  const stdDed=14600
  const taxableIncome=Math.max(0,salary-stdDed)
  const fedTax=calcFedTax(taxableIncome)
  const ficaTax=Math.min(salary,168600)*0.062+salary*0.0145
  const stateObj=STATE_RATES.find(s=>s.code===stateCode)||STATE_RATES[0]
  const stateTax=salary*stateObj.rate/100
  const totalTax=fedTax+ficaTax+stateTax
  const netIncome=salary-totalTax
  const effectiveFed=taxableIncome>0?fedTax/salary*100:0
  const totalBurden=salary>0?totalTax/salary*100:0

  const filteredStates=STATE_RATES.filter(s=>s.name.toLowerCase().includes(search.toLowerCase())||s.code.toLowerCase().includes(search.toLowerCase()))

  function applyExample(ex){
    setSalary(ex.salary);setStateCode(ex.stateCode)
    setTimeout(()=>calcRef.current?.scrollIntoView({behavior:'smooth',block:'start'}),50)
  }

  return(
    <div style={{display:'flex',flexDirection:'column',gap:24}}>
      <div ref={calcRef} style={{scrollMarginTop:80}}>
        <CalcShell
          left={<>
            <div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:16,paddingBottom:8,borderBottom:'0.5px solid var(--border)'}}>Salary & State</div>
            <CurrencyDropdown currency={currency} setCurrency={setCurrency} catColor={catColor}/>
            <FieldInput label="Annual Gross Salary" value={salary} onChange={setSalary} prefix={sym} catColor={catColor}/>

            <div style={{marginBottom:14}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                <label style={{fontSize:12.5,fontWeight:600,color:'var(--text)',fontFamily:"'DM Sans',sans-serif"}}>Select State</label>
                <span style={{fontSize:11,fontWeight:700,color:catColor}}>{stateObj.name} ({fmtP(stateObj.rate)})</span>
              </div>
              <input type="text" placeholder="Search state..." value={search} onChange={e=>setSearch(e.target.value)}
                style={{width:'100%',padding:'8px 10px',border:'1.5px solid var(--border)',borderRadius:8,background:'var(--bg-input,var(--bg-card))',color:'var(--text)',fontSize:12,outline:'none',fontFamily:"'DM Sans',sans-serif",marginBottom:8,boxSizing:'border-box'}}/>
              <div style={{height:180,overflowY:'auto',border:'1px solid var(--border)',borderRadius:8}}>
                {filteredStates.map(s=>(
                  <div key={s.code} onClick={()=>{setStateCode(s.code);setSearch('')}}
                    style={{display:'flex',justifyContent:'space-between',padding:'8px 12px',cursor:'pointer',background:stateCode===s.code?catColor+'15':'transparent',borderBottom:'0.5px solid var(--border)'}}>
                    <span style={{fontSize:12,fontWeight:stateCode===s.code?700:500,color:stateCode===s.code?catColor:'var(--text)',fontFamily:"'DM Sans',sans-serif"}}>{s.name}</span>
                    <span style={{fontSize:11,color:s.rate===0?'#10b981':stateCode===s.code?catColor:'var(--text-3)',fontWeight:600}}>{s.rate===0?'No tax':fmtP(s.rate)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{padding:'12px 14px',borderRadius:10,marginBottom:14,background:catColor+'0d',border:`1px solid ${catColor}25`}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
                <span style={{fontSize:11,color:'var(--text-2)',fontFamily:"'DM Sans',sans-serif"}}>Take-Home (Annual)</span>
                <span style={{fontSize:20,fontWeight:800,color:catColor,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{fmt(netIncome,sym)}</span>
              </div>
              <div style={{display:'flex',justifyContent:'space-between'}}>
                <span style={{fontSize:10,color:'var(--text-3)'}}>State: {stateObj.name}</span>
                <span style={{fontSize:10,color:'var(--text-3)'}}>Total burden: {fmtP(totalBurden)}</span>
              </div>
            </div>

            <div style={{display:'flex',gap:10}}>
              <button style={{flex:1,padding:13,borderRadius:10,border:'none',background:catColor,color:'#fff',fontSize:14,fontWeight:700,cursor:'pointer'}} onMouseEnter={e=>e.currentTarget.style.opacity='.85'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>Calculate →</button>
              <button onClick={()=>{setSalary(100000);setStateCode('CA')}} style={{padding:'13px 18px',borderRadius:10,border:'1.5px solid var(--border-2)',background:'var(--bg-raised)',color:'var(--text-2)',fontSize:13,fontWeight:500,cursor:'pointer'}} onMouseEnter={e=>{e.currentTarget.style.borderColor='#ef4444';e.currentTarget.style.color='#ef4444'}} onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border-2)';e.currentTarget.style.color='var(--text-2)'}}>Reset</button>
            </div>
          </>}
          right={<>
            <ResultHero label="Annual Take-Home" value={netIncome} formatter={n=>fmt(n,sym)} sub={`${fmt(netIncome/12,sym)}/month | Total burden: ${fmtP(totalBurden)}`} color={catColor}/>
            <BreakdownTable title={`Tax Breakdown — ${stateObj.name}`} rows={[
              {label:'Gross Salary',             value:fmt(salary,sym),     color:catColor},
              {label:'Federal Income Tax',       value:fmt(fedTax,sym),     color:'#ef4444'},
              {label:'FICA (SS + Medicare)',      value:fmt(ficaTax,sym),    color:'#ef4444'},
              {label:`State Tax (${fmtP(stateObj.rate)})`,value:fmt(stateTax,sym), color:stateObj.rate===0?'#10b981':'#ef4444'},
              {label:'Total Tax',                value:fmt(totalTax,sym),   bold:true, color:'#ef4444'},
              {label:'Annual Take-Home',         value:fmt(netIncome,sym),  bold:true, highlight:true},
              {label:'Monthly Take-Home',        value:fmt(netIncome/12,sym)},
              {label:'Bi-Weekly Take-Home',      value:fmt(netIncome/26,sym)},
              {label:'Effective Federal Rate',   value:fmtP(effectiveFed)},
              {label:'State Tax Rate',           value:fmtP(stateObj.rate)},
              {label:'Total Tax Burden',         value:fmtP(totalBurden)},
            ]}/>
            <AIHintCard hint={`In ${stateObj.name} (${fmtP(stateObj.rate)} state tax), ${fmt(salary,sym)} salary nets ${fmt(netIncome,sym)}/yr (${fmt(netIncome/12,sym)}/mo). Total tax burden: ${fmtP(totalBurden)}.${stateObj.rate===0?' 🎉 No state income tax!':''}`}/>
          </>}
        />
      </div>

      <Section title="State Tax Comparison" subtitle="How your take-home varies in 10 major states">
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontFamily:"'DM Sans',sans-serif"}}>
            <thead><tr>{['State','State Rate','State Tax','Total Tax','Take-Home'].map((h,i)=>(
              <th key={h} style={{padding:'9px 12px',fontSize:11,fontWeight:700,color:'var(--text-3)',textAlign:i===0?'left':'right',borderBottom:'1px solid var(--border)',fontFamily:"'Space Grotesk',sans-serif"}}>{h}</th>
            ))}</tr></thead>
            <tbody>
              {['TX','FL','WA','NY','CA','IL','PA','OH','NJ','OR'].map((code,i)=>{
                const s=STATE_RATES.find(x=>x.code===code)
                if(!s)return null
                const st=salary*s.rate/100
                const total=fedTax+ficaTax+st
                const net=salary-total
                const isSelected=s.code===stateCode
                return(
                  <tr key={code} onClick={()=>setStateCode(code)} style={{background:isSelected?catColor+'12':i%2===0?'var(--bg-raised)':'transparent',cursor:'pointer'}}>
                    <td style={{padding:'9px 12px',fontSize:12,fontWeight:isSelected?700:500,color:isSelected?catColor:'var(--text)'}}>{s.name}{isSelected?' ✓':''}</td>
                    <td style={{padding:'9px 12px',fontSize:12,color:s.rate===0?'#10b981':'var(--text-2)',textAlign:'right',fontWeight:s.rate===0?700:400}}>{s.rate===0?'None':fmtP(s.rate)}</td>
                    <td style={{padding:'9px 12px',fontSize:12,color:'#ef4444',textAlign:'right'}}>{fmt(st,sym)}</td>
                    <td style={{padding:'9px 12px',fontSize:12,color:'var(--text)',textAlign:'right'}}>{fmt(total,sym)}</td>
                    <td style={{padding:'9px 12px',fontSize:12,color:catColor,fontWeight:600,textAlign:'right'}}>{fmt(net,sym)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Real World Examples" subtitle="Click any example to fill the calculator">
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
          {EXAMPLES.map((ex,i)=>{
            const s=STATE_RATES.find(x=>x.code===ex.stateCode)
            return(
              <button key={i} onClick={()=>applyExample(ex)} style={{padding:14,borderRadius:10,border:'1.5px solid var(--border)',background:'var(--bg-raised)',cursor:'pointer',textAlign:'left',transition:'all .15s'}} onMouseEnter={e=>{e.currentTarget.style.borderColor=catColor;e.currentTarget.style.background=catColor+'10'}} onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.background='var(--bg-raised)'}}>
                <div style={{fontSize:13,fontWeight:700,color:'var(--text)',marginBottom:4}}>{ex.title}</div>
                <div style={{fontSize:11,color:'var(--text-3)',marginBottom:10,lineHeight:1.4}}>{ex.desc}</div>
                {[['Salary',fmt(ex.salary,sym)],['State',s?.name],['State Rate',s?.rate===0?'None':fmtP(s?.rate||0)]].map(([k,v])=>(
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
          Federal Tax = Progressive brackets on (Salary − Std Deduction){'\n'}
          FICA = 6.2% SS (up to $168,600) + 1.45% Medicare{'\n'}
          State Tax = Salary × State Rate (simplified flat rate){'\n'}
          Net = Salary − Federal − FICA − State Tax
        </div>
        <p style={{fontSize:12.5,color:'var(--text-2)',lineHeight:1.75,margin:0,fontFamily:"'DM Sans',sans-serif"}}>
          State tax rates shown are effective marginal rates for a typical filer — most states use progressive brackets but this calculator uses a representative flat rate for comparison. The purpose is to compare take-home across states. For exact state calculations, use each state's official tax calculator.
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
