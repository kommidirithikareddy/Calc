import { useState, useEffect, useRef } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts'
import CalcShell from '../../components/calculator/CalcShell'
import ResultHero from '../../components/calculator/ResultHero'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'
import CurrencyDropdown, { CURRENCIES } from '../../components/calculator/CurrencyDropdown'

const fmt = (n,sym='$') => (n<0?'-':'')+sym+Math.round(Math.abs(n)).toLocaleString()

const EXAMPLES = [
  { title:'Real Estate',     desc:'Buy, renovate & sell in 3 years',   flows:[-200000,0,0,250000]  },
  { title:'Business Invest', desc:'3-year payback then profit',         flows:[-50000,10000,20000,35000] },
  { title:'Equipment',       desc:'Machine pays back over 5 years',    flows:[-30000,8000,8000,8000,8000,8000] },
]
const FAQ = [
  { q:'What is IRR?', a:'IRR (Internal Rate of Return) is the discount rate that makes the Net Present Value (NPV) of all cash flows equal to zero. In other words, it\'s the annualized effective return rate of an investment. If the IRR exceeds your required rate of return (hurdle rate), the investment is worth making.' },
  { q:'How is IRR different from ROI?', a:'ROI measures total return as a percentage of investment, ignoring time. IRR accounts for the timing and size of each cash flow, giving an annualized rate that reflects when money is received. An investment that pays back quickly has a higher IRR than one with the same total return spread over more years.' },
  { q:'What is a good IRR?', a:'It depends on your cost of capital (hurdle rate). Most businesses require IRR to exceed their WACC (Weighted Average Cost of Capital). For real estate: 10-20% is typical. For private equity: 20%+. For infrastructure: 8-12%. The key benchmark: IRR must exceed your required return rate for the investment to create value.' },
  { q:'What are the limitations of IRR?', a:'IRR assumes all cash flows are reinvested at the IRR rate — unrealistic for very high IRRs. It can give multiple solutions when cash flows change signs more than once. For mutually exclusive projects, a higher IRR doesn\'t always mean better — NPV can give a different ranking. Use IRR alongside NPV for complete analysis.' },
  { q:'What is the difference between IRR and MIRR?', a:'MIRR (Modified IRR) fixes IRR\'s reinvestment assumption by using a separate reinvestment rate. It gives a more realistic picture when the IRR is very high or cash flows change sign multiple times. MIRR is generally considered more accurate for complex projects but is less commonly used in practice.' },
]
const GLOSSARY = [
  { term:'IRR',           def:'Internal Rate of Return — the discount rate at which the NPV of all cash flows equals zero.' },
  { term:'Hurdle Rate',   def:'Your minimum required rate of return. Accept projects where IRR > hurdle rate.' },
  { term:'Cash Flow',     def:'Money flowing in (positive) or out (negative) at each time period.' },
  { term:'NPV',           def:'Net Present Value — sum of all discounted cash flows. At IRR, NPV = 0.' },
  { term:'WACC',          def:'Weighted Average Cost of Capital — a company\'s blended cost of debt and equity financing.' },
  { term:'Reinvestment Rate', def:'The assumed rate at which interim cash flows are reinvested. IRR assumes this equals the IRR itself.' },
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

// Newton-Raphson IRR solver
function calcIRR(flows) {
  let r = 0.1
  for (let i=0; i<100; i++) {
    let npv=0, dnpv=0
    flows.forEach((cf,t) => {
      const pv = cf/Math.pow(1+r,t)
      npv += pv
      dnpv += -t*cf/Math.pow(1+r,t+1)
    })
    const r2 = r - npv/dnpv
    if (Math.abs(r2-r) < 1e-7) return r2*100
    r = r2
  }
  return NaN
}

function calcNPV(flows, rate) {
  return flows.reduce((sum,cf,t) => sum + cf/Math.pow(1+rate/100,t), 0)
}

export default function IRRCalculator({ meta, category }) {
  const [flows, setFlows] = useState([-50000,10000,20000,35000])
  const [hurdle, setHurdle] = useState(10)
  const [currency,setCurrency]=useState(CURRENCIES[0])
  const [openFaq,setOpenFaq]=useState(null)
  const calcRef=useRef(null)
  const sym=currency.symbol
  const catColor=category?.color||'#6366f1'

  const irr = calcIRR(flows)
  const npvAtHurdle = calcNPV(flows, hurdle)
  const totalInflow = flows.filter(f=>f>0).reduce((a,b)=>a+b,0)
  const initialInvestment = Math.abs(flows[0])
  const irrColor = isNaN(irr)?'var(--text-3)':irr>=hurdle?'#10b981':'#ef4444'

  // NPV vs rate curve data
  const curveData = Array.from({length:21},(_,i)=>{
    const r=i*2
    return {rate:`${r}%`, npv:Math.round(calcNPV(flows,r))}
  })

  function updateFlow(i, val) {
    const next=[...flows]
    next[i]=val
    setFlows(next)
  }
  function addYear() { setFlows([...flows, 0]) }
  function removeYear() { if(flows.length>2) setFlows(flows.slice(0,-1)) }

  const hint = isNaN(irr)
    ? 'Could not compute IRR — check that cash flows change sign at least once.'
    : `IRR of ${irr.toFixed(2)}% is ${irr>=hurdle?'above':'below'} your ${hurdle}% hurdle rate. NPV at hurdle rate: ${fmt(npvAtHurdle,sym)}. ${irr>=hurdle?'Accept this investment.':'Reject — insufficient return.'}`

  function applyExample(ex){setFlows(ex.flows);setTimeout(()=>calcRef.current?.scrollIntoView({behavior:'smooth',block:'start'}),50)}

  return (
    <div style={{display:'flex',flexDirection:'column',gap:24}}>
      <div ref={calcRef} style={{scrollMarginTop:80}}>
        <CalcShell
          left={<>
            <div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:16,paddingBottom:8,borderBottom:'0.5px solid var(--border)'}}>Cash Flows</div>
            <CurrencyDropdown currency={currency} setCurrency={setCurrency} catColor={catColor} />

            {/* Cash flow inputs */}
            <div style={{marginBottom:14}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                <label style={{fontSize:12.5,fontWeight:600,color:'var(--text)',fontFamily:"'DM Sans',sans-serif"}}>Cash Flows by Year</label>
                <span style={{fontSize:10,color:'var(--text-3)'}}>Year 0 = initial investment (negative)</span>
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:6}}>
                {flows.map((cf,i)=>(
                  <div key={i} style={{display:'flex',alignItems:'center',gap:8}}>
                    <span style={{fontSize:11,color:'var(--text-3)',minWidth:44,fontFamily:"'DM Sans',sans-serif"}}>Year {i}</span>
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

            {/* Hurdle rate */}
            <div style={{marginBottom:14}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:5}}>
                <label style={{fontSize:12.5,fontWeight:600,color:'var(--text)',fontFamily:"'DM Sans',sans-serif"}}>Hurdle Rate</label>
                <span style={{fontSize:10,color:'var(--text-3)'}}>Your required minimum return</span>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:6,background:'var(--bg-input,var(--bg-card))',border:`1.5px solid var(--border)`,borderRadius:8,padding:'0 10px',height:38}}>
                <input type="text" inputMode="decimal" value={hurdle}
                  onChange={e=>{const v=parseFloat(e.target.value);if(!isNaN(v))setHurdle(v)}}
                  style={{flex:1,border:'none',background:'transparent',fontSize:13,fontWeight:600,color:'var(--text)',outline:'none',fontFamily:"'DM Sans',sans-serif"}} />
                <span style={{fontSize:11,color:'var(--text-3)',fontWeight:500}}>%</span>
              </div>
            </div>

            <div style={{display:'flex',gap:10}}>
              <button style={{flex:1,padding:13,borderRadius:10,border:'none',background:catColor,color:'#fff',fontSize:14,fontWeight:700,cursor:'pointer'}} onMouseEnter={e=>e.currentTarget.style.opacity='.85'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>Calculate →</button>
              <button onClick={()=>{setFlows([-50000,10000,20000,35000]);setHurdle(10)}} style={{padding:'13px 18px',borderRadius:10,border:'1.5px solid var(--border-2)',background:'var(--bg-raised)',color:'var(--text-2)',fontSize:13,fontWeight:500,cursor:'pointer'}} onMouseEnter={e=>{e.currentTarget.style.borderColor='#ef4444';e.currentTarget.style.color='#ef4444'}} onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border-2)';e.currentTarget.style.color='var(--text-2)'}}>Reset</button>
            </div>
          </>}
          right={<>
            <ResultHero label="Internal Rate of Return" value={isNaN(irr)?0:Math.abs(irr)} formatter={n=>isNaN(irr)?'N/A':(irr>=0?'+':'-')+n.toFixed(2)+'%'} sub={irr>=hurdle?`✓ Exceeds ${hurdle}% hurdle rate`:`✗ Below ${hurdle}% hurdle rate`} color={irrColor} />
            <BreakdownTable title="Investment Summary" rows={[
              {label:'Initial Investment', value:fmt(-flows[0],sym)},
              {label:'Total Inflows', value:fmt(totalInflow,sym), color:'#10b981'},
              {label:'Net Profit', value:fmt(totalInflow-initialInvestment,sym), color:'#10b981'},
              {label:'IRR', value:isNaN(irr)?'N/A':irr.toFixed(2)+'%', color:irrColor, bold:true, highlight:true},
              {label:`NPV at ${hurdle}%`, value:fmt(npvAtHurdle,sym), color:npvAtHurdle>=0?'#10b981':'#ef4444'},
            ]} />

            {/* Decision indicator */}
            <div style={{padding:'12px 14px',borderRadius:10,background:(!isNaN(irr)&&irr>=hurdle)?'#10b98110':'#ef444410',border:`1px solid ${(!isNaN(irr)&&irr>=hurdle)?'#10b98130':'#ef444430'}`}}>
              <div style={{fontSize:13,fontWeight:700,color:(!isNaN(irr)&&irr>=hurdle)?'#10b981':'#ef4444',marginBottom:4}}>
                {(!isNaN(irr)&&irr>=hurdle)?'✓ Accept Investment':'✗ Reject Investment'}
              </div>
              <div style={{fontSize:11,color:'var(--text-2)',lineHeight:1.5}}>
                {isNaN(irr)?'Could not compute IRR':irr>=hurdle?`IRR ${irr.toFixed(2)}% exceeds ${hurdle}% hurdle — this investment creates value.`:`IRR ${irr.toFixed(2)}% is below ${hurdle}% hurdle — insufficient return for the risk.`}
              </div>
            </div>

            <AIHintCard hint={hint} />
          </>}
        />
      </div>

      {/* NPV Curve */}
      <Section title="NPV vs Discount Rate" subtitle="IRR is where NPV crosses zero">
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={curveData} margin={{top:0,right:0,bottom:0,left:0}}>
            <XAxis dataKey="rate" tick={{fontSize:9,fill:'var(--text-3)'}} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip formatter={v=>[fmt(v,sym),'NPV']} contentStyle={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:8,fontSize:11}} />
            <ReferenceLine y={0} stroke="var(--border)" />
            <Bar dataKey="npv" radius={[4,4,0,0]}>
              {curveData.map((entry,i)=>(
                <Cell key={i} fill={entry.npv>=0?catColor+'99':'#ef444499'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <p style={{fontSize:11,color:'var(--text-3)',marginTop:8,textAlign:'center'}}>At the IRR, NPV = 0. Left of IRR = positive NPV (profitable). Right = negative NPV (unprofitable).</p>
      </Section>

      <Section title="Real World Examples" subtitle="Click any example to fill the calculator instantly">
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
          {EXAMPLES.map((ex,i)=>(
            <button key={i} onClick={()=>applyExample(ex)} style={{padding:14,borderRadius:10,border:'1.5px solid var(--border)',background:'var(--bg-raised)',cursor:'pointer',textAlign:'left',transition:'all .15s'}} onMouseEnter={e=>{e.currentTarget.style.borderColor=catColor;e.currentTarget.style.background=catColor+'10'}} onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.background='var(--bg-raised)'}}>
              <div style={{fontSize:13,fontWeight:700,color:'var(--text)',marginBottom:4}}>{ex.title}</div>
              <div style={{fontSize:11,color:'var(--text-3)',marginBottom:10,lineHeight:1.4}}>{ex.desc}</div>
              {ex.flows.map((f,j)=>(
                <div key={j} style={{display:'flex',justifyContent:'space-between'}}>
                  <span style={{fontSize:10,color:'var(--text-3)'}}>Year {j}</span>
                  <span style={{fontSize:10,fontWeight:600,color:f<0?'#ef4444':'#10b981'}}>{fmt(f,sym)}</span>
                </div>
              ))}
              <div style={{marginTop:6,fontSize:11,fontWeight:700,color:catColor}}>IRR: {calcIRR(ex.flows).toFixed(1)}%</div>
              <div style={{marginTop:4,fontSize:10,fontWeight:700,color:catColor}}>Apply example →</div>
            </button>
          ))}
        </div>
      </Section>

      <Section title="Formula Explained" subtitle="How IRR is calculated">
        <div style={{background:'var(--bg-raised)',borderRadius:10,padding:'14px 16px',marginBottom:14,fontFamily:'monospace',fontSize:12,color:catColor,fontWeight:600,overflowX:'auto',whiteSpace:'nowrap'}}>
          0 = CF₀ + CF₁/(1+IRR) + CF₂/(1+IRR)² + ... + CFₙ/(1+IRR)ⁿ
        </div>
        <p style={{fontSize:12,color:'var(--text-2)',lineHeight:1.75,margin:0}}>IRR has no closed-form solution — it must be solved iteratively. This calculator uses the Newton-Raphson method to find the rate where NPV equals zero. A negative Year 0 cash flow (initial investment) followed by positive inflows is required for a valid IRR solution.</p>
      </Section>

      <Section title="Key Terms" subtitle="IRR terminology — click any term">
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:8}}>
          {GLOSSARY.map((item,i)=><GlossaryTerm key={i} term={item.term} def={item.def} catColor={catColor} />)}
        </div>
      </Section>

      <Section title="Frequently Asked Questions" subtitle="Everything about IRR">
        {FAQ.map((item,i)=><AccordionItem key={i} q={item.q} a={item.a} isOpen={openFaq===i} onToggle={()=>setOpenFaq(openFaq===i?null:i)} catColor={catColor} />)}
      </Section>
    </div>
  )
}
