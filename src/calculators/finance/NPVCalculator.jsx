import { useState, useRef } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts'
import CalcShell from '../../components/calculator/CalcShell'
import ResultHero from '../../components/calculator/ResultHero'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'
import CurrencyDropdown, { CURRENCIES } from '../../components/calculator/CurrencyDropdown'

const fmt = (n,sym='$') => (n<0?'-':'')+sym+Math.round(Math.abs(n)).toLocaleString()

const EXAMPLES = [
  { title:'Factory Expansion', desc:'$100k investment, 5-year payback',  rate:8,  flows:[-100000,25000,30000,35000,30000,20000] },
  { title:'Software Project',  desc:'2-year dev cost, 3 years of revenue',rate:12, flows:[-40000,-20000,25000,35000,40000]       },
  { title:'Rental Property',   desc:'Buy & rent out for 5 years',         rate:7,  flows:[-180000,15000,15000,15000,15000,210000] },
]
const FAQ = [
  { q:'What is NPV?', a:'Net Present Value (NPV) is the sum of all future cash flows discounted back to the present, minus the initial investment. A positive NPV means the investment creates value — you earn more than your required rate of return. A negative NPV means it destroys value. NPV is considered the most reliable method for investment appraisal.' },
  { q:'How is NPV different from IRR?', a:'NPV gives an absolute dollar value of the investment\'s value creation. IRR gives a percentage return. NPV is generally preferred because it shows the actual dollar benefit. IRR can be misleading for projects with unusual cash flow patterns. For ranking multiple projects, NPV is more reliable than IRR.' },
  { q:'What discount rate should I use?', a:'Use your required rate of return or cost of capital. For businesses: the WACC (Weighted Average Cost of Capital). For personal investments: your opportunity cost — what you could earn elsewhere at similar risk. A higher discount rate makes future cash flows worth less today, resulting in a lower NPV.' },
  { q:'What does a negative NPV mean?', a:'A negative NPV means the investment returns less than your required rate of return. You would be better off investing elsewhere at the hurdle rate. It does not necessarily mean the investment loses money in absolute terms — it may still be profitable, just not profitable enough relative to your required return.' },
  { q:'When should I use NPV vs payback period?', a:'Payback period is simple and intuitive — good for quick screening. NPV is more rigorous — it accounts for time value, all cash flows including post-payback, and gives an absolute value measure. Use payback period for initial screening, then NPV for the final decision on shortlisted projects.' },
]
const GLOSSARY = [
  { term:'NPV',            def:'Net Present Value — the sum of discounted future cash flows minus the initial investment.' },
  { term:'Discount Rate',  def:'The rate used to convert future cash flows to present value — your required rate of return.' },
  { term:'Cash Flow',      def:'Money received (positive) or paid (negative) at each time period.' },
  { term:'Present Value',  def:'The current worth of a future cash flow, after discounting at the required rate.' },
  { term:'Value Creation', def:'Positive NPV means the project creates value above the required return — it\'s worth doing.' },
  { term:'WACC',           def:'Weighted Average Cost of Capital — often used as the discount rate for corporate investment decisions.' },
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
function AccordionItem({q,a,isOpen,onToggle,catColor}) {
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
function GlossaryTerm({term,def,catColor}) {
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

export default function NPVCalculator({ meta, category }) {
  const [flows,setFlows]=useState([-100000,25000,30000,35000,30000,20000])
  const [rate,setRate]=useState(8)
  const [currency,setCurrency]=useState(CURRENCIES[0])
  const [openFaq,setOpenFaq]=useState(null)
  const calcRef=useRef(null)
  const sym=currency.symbol
  const catColor=category?.color||'#6366f1'

  const npv = flows.reduce((sum,cf,t)=>sum+cf/Math.pow(1+rate/100,t),0)
  const npvColor = npv>=0?'#10b981':'#ef4444'

  // Discounted cash flows
  const dcfRows = flows.map((cf,t)=>{
    const pv=cf/Math.pow(1+rate/100,t)
    return {year:t,cf:Math.round(cf),pv:Math.round(pv)}
  })

  // NPV sensitivity at different rates
  const sensitivityRates = [rate-4,rate-2,rate,rate+2,rate+4].filter(r=>r>0)

  function updateFlow(i,val){const next=[...flows];next[i]=val;setFlows(next)}
  function addYear(){setFlows([...flows,0])}
  function removeYear(){if(flows.length>2)setFlows(flows.slice(0,-1))}

  const hint = `NPV of ${fmt(npv,sym)} at ${rate}% discount rate. ${npv>=0?'Positive NPV — this investment creates value above your required return.':'Negative NPV — this investment does not meet your required rate of return.'}`

  function applyExample(ex){setFlows(ex.flows);setRate(ex.rate);setTimeout(()=>calcRef.current?.scrollIntoView({behavior:'smooth',block:'start'}),50)}

  return (
    <div style={{display:'flex',flexDirection:'column',gap:24}}>
      <div ref={calcRef} style={{scrollMarginTop:80}}>
        <CalcShell
          left={<>
            <div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:16,paddingBottom:8,borderBottom:'0.5px solid var(--border)'}}>Cash Flows & Rate</div>
            <CurrencyDropdown currency={currency} setCurrency={setCurrency} catColor={catColor} />

            {/* Discount rate */}
            <div style={{marginBottom:14}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:5}}>
                <label style={{fontSize:12.5,fontWeight:600,color:'var(--text)',fontFamily:"'DM Sans',sans-serif"}}>Discount Rate</label>
                <span style={{fontSize:10,color:'var(--text-3)'}}>Required rate of return</span>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:6,background:'var(--bg-input,var(--bg-card))',border:`1.5px solid var(--border)`,borderRadius:8,padding:'0 10px',height:38}}>
                <input type="text" inputMode="decimal" value={rate} onChange={e=>{const v=parseFloat(e.target.value);if(!isNaN(v))setRate(v)}} style={{flex:1,border:'none',background:'transparent',fontSize:13,fontWeight:600,color:'var(--text)',outline:'none',fontFamily:"'DM Sans',sans-serif"}} />
                <span style={{fontSize:11,color:'var(--text-3)',fontWeight:500}}>%</span>
              </div>
            </div>

            {/* Cash flows */}
            <div style={{marginBottom:14}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                <label style={{fontSize:12.5,fontWeight:600,color:'var(--text)',fontFamily:"'DM Sans',sans-serif"}}>Cash Flows</label>
                <span style={{fontSize:10,color:'var(--text-3)'}}>Year 0 = initial cost (negative)</span>
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:6}}>
                {flows.map((cf,i)=>(
                  <div key={i} style={{display:'flex',alignItems:'center',gap:8}}>
                    <span style={{fontSize:11,color:'var(--text-3)',minWidth:44}}> Year {i}</span>
                    <div style={{flex:1,display:'flex',alignItems:'center',gap:4,background:'var(--bg-input,var(--bg-card))',border:`1.5px solid var(--border)`,borderRadius:8,padding:'0 10px',height:34}}>
                      <span style={{fontSize:12,color:'var(--text-3)',fontWeight:600,flexShrink:0}}>{sym}</span>
                      <input type="text" inputMode="numeric" defaultValue={cf}
                        onBlur={e=>{const v=parseFloat(e.target.value);if(!isNaN(v))updateFlow(i,v)}}
                        style={{flex:1,border:'none',background:'transparent',fontSize:13,fontWeight:600,color:cf<0?'#ef4444':'#10b981',outline:'none',fontFamily:"'DM Sans',sans-serif"}} />
                    </div>
                  </div>
                ))}
              </div>
              <div style={{display:'flex',gap:6,marginTop:8}}>
                <button onClick={addYear} style={{flex:1,padding:'7px',borderRadius:8,border:`1px solid ${catColor}40`,background:catColor+'0d',color:catColor,fontSize:12,fontWeight:600,cursor:'pointer'}}>+ Add Year</button>
                <button onClick={removeYear} style={{flex:1,padding:'7px',borderRadius:8,border:'1px solid var(--border)',background:'var(--bg-raised)',color:'var(--text-3)',fontSize:12,fontWeight:500,cursor:'pointer'}}>− Remove</button>
              </div>
            </div>

            <div style={{display:'flex',gap:10}}>
              <button style={{flex:1,padding:13,borderRadius:10,border:'none',background:catColor,color:'#fff',fontSize:14,fontWeight:700,cursor:'pointer'}} onMouseEnter={e=>e.currentTarget.style.opacity='.85'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>Calculate →</button>
              <button onClick={()=>{setFlows([-100000,25000,30000,35000,30000,20000]);setRate(8)}} style={{padding:'13px 18px',borderRadius:10,border:'1.5px solid var(--border-2)',background:'var(--bg-raised)',color:'var(--text-2)',fontSize:13,fontWeight:500,cursor:'pointer'}} onMouseEnter={e=>{e.currentTarget.style.borderColor='#ef4444';e.currentTarget.style.color='#ef4444'}} onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border-2)';e.currentTarget.style.color='var(--text-2)'}}>Reset</button>
            </div>
          </>}
          right={<>
            <ResultHero label="Net Present Value" value={Math.abs(Math.round(npv))} formatter={n=>(npv>=0?'+':'-')+sym+n.toLocaleString()} sub={npv>=0?'✓ Positive — creates value':'✗ Negative — below required return'} color={npvColor} />
            <BreakdownTable title="NPV Summary" rows={[
              {label:'Total Cash Inflows',  value:fmt(flows.filter(f=>f>0).reduce((a,b)=>a+b,0),sym),color:'#10b981'},
              {label:'Total Cash Outflows', value:fmt(Math.abs(flows.filter(f=>f<0).reduce((a,b)=>a+b,0)),sym),color:'#ef4444'},
              {label:'Sum of PV Inflows',   value:fmt(dcfRows.filter(r=>r.pv>0).reduce((a,b)=>a+b.pv,0),sym),color:'#10b981'},
              {label:'NPV',                 value:fmt(npv,sym), color:npvColor, bold:true, highlight:true},
              {label:'Decision',            value:npv>=0?'Accept ✓':'Reject ✗', color:npvColor},
            ]} />
            <div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:12,padding:16}}>
              <div style={{fontSize:11,fontWeight:700,color:'var(--text)',marginBottom:12,fontFamily:"'Space Grotesk',sans-serif"}}>Discounted Cash Flows</div>
              <ResponsiveContainer width="100%" height={120}>
                <BarChart data={dcfRows} margin={{top:0,right:0,bottom:0,left:0}}>
                  <XAxis dataKey="year" tickFormatter={v=>`Y${v}`} tick={{fontSize:9,fill:'var(--text-3)'}} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip formatter={v=>[fmt(v,sym),'Present Value']} contentStyle={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:8,fontSize:11}} />
                  <ReferenceLine y={0} stroke="var(--border)" />
                  <Bar dataKey="pv" radius={[4,4,0,0]}>
                    {dcfRows.map((r,i)=><Cell key={i} fill={r.pv>=0?catColor:'#ef4444'} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <AIHintCard hint={hint} />
          </>}
        />
      </div>

      {/* Sensitivity table */}
      <Section title="NPV Sensitivity" subtitle="How NPV changes with different discount rates">
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontFamily:"'DM Sans',sans-serif"}}>
            <thead><tr>{['Discount Rate','NPV','Decision'].map((h,i)=>(
              <th key={h} style={{padding:'9px 12px',fontSize:11,fontWeight:700,color:'var(--text-3)',textAlign:i===0?'left':'right',borderBottom:'1px solid var(--border)',fontFamily:"'Space Grotesk',sans-serif"}}>{h}</th>
            ))}</tr></thead>
            <tbody>
              {sensitivityRates.map((r,i)=>{
                const n=flows.reduce((sum,cf,t)=>sum+cf/Math.pow(1+r/100,t),0)
                const isCurrent=r===rate
                return (
                  <tr key={r} style={{background:isCurrent?catColor+'08':'transparent'}}>
                    <td style={{padding:'9px 12px',fontSize:12,fontWeight:isCurrent?700:400,color:isCurrent?catColor:'var(--text)'}}>{r}% {isCurrent&&'✓'}</td>
                    <td style={{padding:'9px 12px',fontSize:12,fontWeight:600,color:n>=0?'#10b981':'#ef4444',textAlign:'right'}}>{fmt(n,sym)}</td>
                    <td style={{padding:'9px 12px',fontSize:11,color:n>=0?'#10b981':'#ef4444',textAlign:'right'}}>{n>=0?'Accept':'Reject'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Real World Examples" subtitle="Click any example to fill the calculator instantly">
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
          {EXAMPLES.map((ex,i)=>(
            <button key={i} onClick={()=>applyExample(ex)} style={{padding:14,borderRadius:10,border:'1.5px solid var(--border)',background:'var(--bg-raised)',cursor:'pointer',textAlign:'left',transition:'all .15s'}} onMouseEnter={e=>{e.currentTarget.style.borderColor=catColor;e.currentTarget.style.background=catColor+'10'}} onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.background='var(--bg-raised)'}}>
              <div style={{fontSize:13,fontWeight:700,color:'var(--text)',marginBottom:4}}>{ex.title}</div>
              <div style={{fontSize:11,color:'var(--text-3)',marginBottom:10,lineHeight:1.4}}>{ex.desc}</div>
              {[['Rate',`${ex.rate}%`],['Years',`${ex.flows.length-1}`],['NPV',fmt(ex.flows.reduce((s,cf,t)=>s+cf/Math.pow(1+ex.rate/100,t),0),sym)]].map(([k,v])=>(
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

      <Section title="Formula Explained" subtitle="The math behind NPV">
        <div style={{background:'var(--bg-raised)',borderRadius:10,padding:'14px 16px',marginBottom:14,fontFamily:'monospace',fontSize:12,color:catColor,fontWeight:600,overflowX:'auto',whiteSpace:'nowrap'}}>
          NPV = Σ [CFₜ / (1 + r)ᵗ] for t = 0 to n
        </div>
        <p style={{fontSize:12,color:'var(--text-2)',lineHeight:1.75,margin:0}}>NPV discounts each cash flow by the required rate of return, then sums them all. Year 0 is not discounted (it's already in present terms). Positive flows add to NPV; negative flows subtract. If the total is positive, the investment earns more than your required rate — it creates value.</p>
      </Section>

      <Section title="Key Terms" subtitle="NPV terminology — click any term">
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:8}}>
          {GLOSSARY.map((item,i)=><GlossaryTerm key={i} term={item.term} def={item.def} catColor={catColor} />)}
        </div>
      </Section>

      <Section title="Frequently Asked Questions" subtitle="Everything about NPV">
        {FAQ.map((item,i)=><AccordionItem key={i} q={item.q} a={item.a} isOpen={openFaq===i} onToggle={()=>setOpenFaq(openFaq===i?null:i)} catColor={catColor} />)}
      </Section>
    </div>
  )
}
