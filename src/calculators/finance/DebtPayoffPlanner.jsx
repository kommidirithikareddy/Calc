import { useState, useRef } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import AIHintCard from '../../components/calculator/AIHintCard'
import CurrencyDropdown, { CURRENCIES } from '../../components/calculator/CurrencyDropdown'

const fmt = (n,sym='$') => sym+Math.round(Math.max(0,n)).toLocaleString()

const PRESET_DEBTS = [
  { name:'Credit Card A', balance:5000,  rate:22,  minPayment:100 },
  { name:'Credit Card B', balance:3000,  rate:18,  minPayment:60  },
  { name:'Personal Loan', balance:10000, rate:9,   minPayment:200 },
]

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

function simulateDebts(debts, extra, method) {
  // Clone balances
  let bals = debts.map(d => ({ ...d, bal: d.balance }))
  let months = 0, totalInt = 0
  const order = method === 'avalanche'
    ? [...bals].sort((a,b) => b.rate - a.rate)
    : [...bals].sort((a,b) => a.bal - b.bal)

  while (bals.some(d => d.bal > 0) && months < 600) {
    months++
    // Pay minimums on all
    bals.forEach(d => {
      if (d.bal <= 0) return
      const intCharge = d.bal * d.rate / 100 / 12
      const prin = Math.min(d.minPayment - intCharge, d.bal)
      totalInt += intCharge
      d.bal = Math.max(0, d.bal - Math.max(0, prin))
    })
    // Apply extra to priority debt
    let remaining = extra
    for (const target of order) {
      const debt = bals.find(d => d.name === target.name)
      if (!debt || debt.bal <= 0) continue
      const pay = Math.min(remaining, debt.bal)
      debt.bal = Math.max(0, debt.bal - pay)
      remaining -= pay
      if (remaining <= 0) break
    }
  }
  return { months, totalInt }
}


const EXAMPLES_DEBT = [
  { title:'Student + Card', desc:'Classic post-college debt combo', debts:[{name:'Student Loan',balance:18000,rate:6.5,minPayment:180},{name:'Credit Card',balance:4000,rate:22,minPayment:80}], extra:200 },
  { title:'Multiple Cards',  desc:'3 credit cards, aggressive payoff', debts:[{name:'Visa',balance:6000,rate:24,minPayment:120},{name:'Mastercard',balance:3500,rate:19,minPayment:70},{name:'Store Card',balance:1200,rate:29,minPayment:30}], extra:300 },
  { title:'Mixed Debts',    desc:'Car + personal loan + card', debts:[{name:'Car Loan',balance:12000,rate:7,minPayment:240},{name:'Personal Loan',balance:8000,rate:12,minPayment:200},{name:'Credit Card',balance:2500,rate:21,minPayment:50}], extra:150 },
]
const FAQ_DEBT = [
  {q:'What is the avalanche method?',a:'The debt avalanche pays minimums on all debts and puts all extra money toward the highest interest rate debt first. Once that is paid off, the freed-up payment rolls to the next highest rate. This is mathematically optimal — it minimizes total interest paid.'},
  {q:'What is the snowball method?',a:'The debt snowball pays minimums on all debts and puts all extra money toward the smallest balance first. The psychological wins from eliminating debts quickly keep people motivated. Research shows people using this method pay off debt faster because they stay committed.'},
  {q:'Which method should I choose?',a:'If you are motivated by math and discipline, choose avalanche — it saves more money. If you struggle with motivation or have tried other methods before, choose snowball — the quick wins help. Dave Ramsey popularized snowball; most financial mathematicians prefer avalanche. Both work if you stick with them.'},
  {q:'What is the debt rollover (snowball effect)?',a:'In both methods, when one debt is paid off, its minimum payment amount "rolls over" to the next target debt. This creates an accelerating payoff — each debt you eliminate frees up more money for the next. A $60/month payment freed from a paid-off card adds to your next target, potentially doubling its payoff speed.'},
]
const GLOSSARY_DEBT = [
  {term:'Debt Avalanche',      def:'Payoff strategy: highest interest rate first. Minimizes total interest paid.'},
  {term:'Debt Snowball',       def:'Payoff strategy: smallest balance first. Builds motivation through quick wins.'},
  {term:'Minimum Payment',     def:'The lowest required monthly payment — just enough to avoid penalty but rarely enough to meaningfully reduce debt.'},
  {term:'Payment Rollover',    def:'When a paid-off debts payment is redirected to the next target debt, accelerating payoff.'},
  {term:'Debt-to-Income (DTI)',def:'Total monthly debt payments ÷ gross monthly income. Lenders want below 36-43%.'},
  {term:'Extra Payment',       def:'Any amount paid above the minimum — goes directly toward principal reduction.'},
]

function AccordionItemD({q,a,isOpen,onToggle,catColor}) {
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
function GlossaryTermD({term,def,catColor}) {
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
export default function DebtPayoffPlanner({ meta, category }) {
  const [debts, setDebts] = useState(PRESET_DEBTS)
  const [openFaq, setOpenFaq] = useState(null)
  const [extra, setExtra] = useState(200)
  const [method, setMethod] = useState('avalanche')
  const [currency, setCurrency] = useState(CURRENCIES[0])
  const calcRef = useRef(null)
  const sym = currency.symbol
  const catColor = category?.color || '#6366f1'

  const avalanche = simulateDebts(debts, extra, 'avalanche')
  const snowball  = simulateDebts(debts, extra, 'snowball')
  const current   = method === 'avalanche' ? avalanche : snowball
  const other     = method === 'avalanche' ? snowball  : avalanche
  const intSaved  = other.totalInt - current.totalInt

  const totalBalance = debts.reduce((s,d) => s + d.balance, 0)
  const totalMin     = debts.reduce((s,d) => s + d.minPayment, 0)

  function addDebt() {
    setDebts([...debts, { name: `Debt ${debts.length+1}`, balance: 1000, rate: 10, minPayment: 25 }])
  }
  function removeDebt(i) { setDebts(debts.filter((_,idx) => idx !== i)) }
  function updateDebt(i, field, val) {
    const next = [...debts]
    next[i] = { ...next[i], [field]: val }
    setDebts(next)
  }

  const hint = `Using ${method} method with ${sym}${extra}/month extra: debt-free in ${Math.ceil(current.months/12)} years, paying ${fmt(current.totalInt,sym)} total interest. ${intSaved>0?`This saves ${fmt(intSaved,sym)} vs the ${method==='avalanche'?'snowball':'avalanche'} method.`:''}`

  return (
    <div style={{display:'flex',flexDirection:'column',gap:24}}>
      <div ref={calcRef} style={{scrollMarginTop:80}}>
        <CalcShell
          left={<>
            <div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:16,paddingBottom:8,borderBottom:'0.5px solid var(--border)'}}>Your Debts</div>
            <CurrencyDropdown currency={currency} setCurrency={setCurrency} catColor={catColor} />

            {/* Debt list */}
            <div style={{display:'flex',flexDirection:'column',gap:10,marginBottom:14}}>
              {debts.map((d,i)=>(
                <div key={i} style={{padding:'12px',borderRadius:10,border:`1px solid var(--border)`,background:'var(--bg-raised)'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                    <input value={d.name} onChange={e=>updateDebt(i,'name',e.target.value)}
                      style={{fontSize:12,fontWeight:700,color:catColor,background:'none',border:'none',outline:'none',fontFamily:"'Space Grotesk',sans-serif",flex:1}} />
                    <button onClick={()=>removeDebt(i)} style={{border:'none',background:'none',cursor:'pointer',color:'var(--text-3)',fontSize:16}}>×</button>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:6}}>
                    {[['Balance',d.balance,'balance',sym,''],[`Rate`,d.rate,'rate','','%'],['Min Pmt',d.minPayment,'minPayment',sym,'']].map(([label,val,field,pre,suf])=>(
                      <div key={field}>
                        <div style={{fontSize:9,color:'var(--text-3)',marginBottom:2,textTransform:'uppercase',letterSpacing:'.05em'}}>{label}</div>
                        <div style={{display:'flex',alignItems:'center',gap:2,background:'var(--bg-card)',borderRadius:6,padding:'4px 8px',border:'1px solid var(--border)'}}>
                          {pre&&<span style={{fontSize:11,color:'var(--text-3)'}}>{pre}</span>}
                          <input type="text" inputMode="decimal" defaultValue={val}
                            onBlur={e=>{const v=parseFloat(e.target.value);if(!isNaN(v))updateDebt(i,field,v)}}
                            style={{flex:1,border:'none',background:'none',fontSize:12,fontWeight:600,color:'var(--text)',outline:'none',minWidth:0,fontFamily:"'DM Sans',sans-serif"}} />
                          {suf&&<span style={{fontSize:11,color:'var(--text-3)'}}>{suf}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <button onClick={addDebt} style={{padding:'9px',borderRadius:8,border:`1px dashed ${catColor}60`,background:catColor+'08',color:catColor,fontSize:12,fontWeight:600,cursor:'pointer'}}>+ Add Debt</button>
            </div>

            {/* Extra payment */}
            <div style={{marginBottom:14}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:5}}>
                <label style={{fontSize:12.5,fontWeight:600,color:'var(--text)',fontFamily:"'DM Sans',sans-serif"}}>Extra Monthly Payment</label>
                <span style={{fontSize:10,color:'var(--text-3)'}}>On top of minimums</span>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:6,background:'var(--bg-input,var(--bg-card))',border:`1.5px solid var(--border)`,borderRadius:8,padding:'0 10px',height:38}}>
                <span style={{fontSize:12,color:'var(--text-3)',fontWeight:600}}>{sym}</span>
                <input type="text" inputMode="decimal" value={extra} onChange={e=>{const v=parseFloat(e.target.value);if(!isNaN(v))setExtra(v)}}
                  style={{flex:1,border:'none',background:'transparent',fontSize:13,fontWeight:600,color:'var(--text)',outline:'none',fontFamily:"'DM Sans',sans-serif"}} />
              </div>
            </div>

            {/* Method toggle */}
            <div style={{marginBottom:16}}>
              <div style={{fontSize:12.5,fontWeight:600,color:'var(--text)',marginBottom:8,fontFamily:"'DM Sans',sans-serif"}}>Payoff Strategy</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                {[['avalanche','🔥 Avalanche','Highest rate first — saves most interest'],['snowball','❄️ Snowball','Smallest balance first — quickest wins']].map(([m,label,desc])=>(
                  <button key={m} onClick={()=>setMethod(m)} style={{padding:'10px 12px',borderRadius:10,border:`1.5px solid ${method===m?catColor:'var(--border)'}`,background:method===m?catColor+'0d':'var(--bg-raised)',cursor:'pointer',textAlign:'left',transition:'all .15s'}}>
                    <div style={{fontSize:12,fontWeight:700,color:method===m?catColor:'var(--text)',fontFamily:"'Space Grotesk',sans-serif",marginBottom:3}}>{label}</div>
                    <div style={{fontSize:10,color:'var(--text-3)',lineHeight:1.4}}>{desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <button style={{width:'100%',padding:13,borderRadius:10,border:'none',background:catColor,color:'#fff',fontSize:14,fontWeight:700,cursor:'pointer'}} onMouseEnter={e=>e.currentTarget.style.opacity='.85'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>Calculate Plan →</button>
          </>}
          right={<>
            {/* Summary cards */}
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              {[['Total Debt',fmt(totalBalance,sym),'var(--text)'],['Monthly (min)',fmt(totalMin,sym),'var(--text)'],['With Extra',fmt(totalMin+extra,sym),catColor],['Debt-free in',Math.ceil(current.months/12)+' yrs',catColor]].map(([label,val,color])=>(
                <div key={label} style={{padding:'12px',borderRadius:10,background:'var(--bg-card)',border:'0.5px solid var(--border)',textAlign:'center'}}>
                  <div style={{fontSize:10,color:'var(--text-3)',marginBottom:4,textTransform:'uppercase',letterSpacing:'.05em'}}>{label}</div>
                  <div style={{fontSize:16,fontWeight:800,color,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{val}</div>
                </div>
              ))}
            </div>

            {/* Method comparison */}
            <div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:12,padding:14}}>
              <div style={{fontSize:11,fontWeight:700,color:'var(--text)',marginBottom:10,fontFamily:"'Space Grotesk',sans-serif"}}>Strategy Comparison</div>
              {[{m:'avalanche',label:'🔥 Avalanche',r:avalanche},{m:'snowball',label:'❄️ Snowball',r:snowball}].map(({m,label,r})=>(
                <div key={m} style={{padding:'10px 12px',borderRadius:8,marginBottom:6,background:method===m?catColor+'0d':'var(--bg-raised)',border:`1px solid ${method===m?catColor+'30':'var(--border)'}`}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <span style={{fontSize:12,fontWeight:700,color:method===m?catColor:'var(--text)',fontFamily:"'DM Sans',sans-serif"}}>{label} {method===m&&'← Selected'}</span>
                    <span style={{fontSize:12,fontWeight:700,color:method===m?catColor:'var(--text-2)'}}>{Math.ceil(r.months/12)} yrs</span>
                  </div>
                  <div style={{fontSize:11,color:'var(--text-3)',marginTop:2}}>Total interest: {fmt(r.totalInt,sym)}</div>
                </div>
              ))}
              {intSaved>0&&(
                <div style={{padding:'8px 10px',borderRadius:8,background:'#10b98110',border:'1px solid #10b98130',marginTop:4}}>
                  <div style={{fontSize:11,fontWeight:600,color:'#10b981'}}>{method==='avalanche'?'Avalanche':'Snowball'} saves {fmt(intSaved,sym)} more in interest</div>
                </div>
              )}
            </div>

            {/* Payoff order */}
            <div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:12,padding:14}}>
              <div style={{fontSize:11,fontWeight:700,color:'var(--text)',marginBottom:10,fontFamily:"'Space Grotesk',sans-serif"}}>Payoff Order ({method})</div>
              {(method==='avalanche'?[...debts].sort((a,b)=>b.rate-a.rate):[...debts].sort((a,b)=>a.balance-b.balance)).map((d,i)=>(
                <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'7px 0',borderBottom:i<debts.length-1?'0.5px solid var(--border)':'none'}}>
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    <div style={{width:20,height:20,borderRadius:'50%',background:catColor,color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,flexShrink:0}}>{i+1}</div>
                    <span style={{fontSize:12,fontWeight:600,color:'var(--text)',fontFamily:"'DM Sans',sans-serif"}}>{d.name}</span>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <div style={{fontSize:11,fontWeight:600,color:catColor}}>{fmt(d.balance,sym)}</div>
                    <div style={{fontSize:10,color:'var(--text-3)'}}>{d.rate}% APR</div>
                  </div>
                </div>
              ))}
            </div>

            <AIHintCard hint={hint} />
          </>}
        />
      </div>

      <Section title="Formula Explained" subtitle="How avalanche and snowball payoffs are calculated">
        <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:14}}>
          {[{label:'Monthly Interest on Each Debt',formula:'Interest = Balance × (Rate ÷ 12 ÷ 100)'},{label:'Principal Reduction',formula:'Principal = Min Payment − Interest'},{label:'Extra Payment (Avalanche)',formula:'Apply to highest-rate debt first, then cascade down'}].map(f=>(
            <div key={f.label}>
              <div style={{fontSize:10,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.05em',marginBottom:4}}>{f.label}</div>
              <div style={{background:'var(--bg-raised)',borderRadius:8,padding:'10px 14px',fontFamily:'monospace',fontSize:12,color:catColor,fontWeight:600,overflowX:'auto',whiteSpace:'nowrap'}}>{f.formula}</div>
            </div>
          ))}
        </div>
        <p style={{fontSize:12,color:'var(--text-2)',lineHeight:1.75,margin:0}}>Each month, the simulator pays minimums on all debts (covering interest + minimum principal), then applies your extra payment to the priority debt. When a debt reaches zero, its minimum payment rolls over to the next target — creating the acceleration effect that makes both methods so powerful.</p>
      </Section>

      <Section title="Quick-Load Examples" subtitle="Replace your debts with a preset scenario">
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
          {EXAMPLES_DEBT.map((ex,i)=>(
            <button key={i} onClick={()=>{setDebts(ex.debts);setExtra(ex.extra)}} style={{padding:14,borderRadius:10,border:'1.5px solid var(--border)',background:'var(--bg-raised)',cursor:'pointer',textAlign:'left',transition:'all .15s'}} onMouseEnter={e=>{e.currentTarget.style.borderColor=catColor;e.currentTarget.style.background=catColor+'10'}} onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.background='var(--bg-raised)'}}>
              <div style={{fontSize:13,fontWeight:700,color:'var(--text)',marginBottom:4}}>{ex.title}</div>
              <div style={{fontSize:11,color:'var(--text-3)',marginBottom:8,lineHeight:1.4}}>{ex.desc}</div>
              <div style={{fontSize:10,color:catColor,fontWeight:600}}>{ex.debts.length} debts · +${ex.extra}/mo extra</div>
              <div style={{marginTop:8,fontSize:10,fontWeight:700,color:catColor}}>Load scenario →</div>
            </button>
          ))}
        </div>
      </Section>

      <Section title="Key Terms" subtitle="Debt payoff terminology — click any term">
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:8}}>
          {GLOSSARY_DEBT.map((item,i)=><GlossaryTermD key={i} term={item.term} def={item.def} catColor={catColor} />)}
        </div>
      </Section>

      <Section title="Frequently Asked Questions" subtitle="Avalanche vs snowball and everything in between">
        {FAQ_DEBT.map((item,i)=><AccordionItemD key={i} q={item.q} a={item.a} isOpen={openFaq===i} onToggle={()=>setOpenFaq(openFaq===i?null:i)} catColor={catColor} />)}
      </Section>
    </div>
  )
}