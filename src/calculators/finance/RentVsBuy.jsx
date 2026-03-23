import { useState, useEffect, useRef } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import ResultHero from '../../components/calculator/ResultHero'
import AIHintCard from '../../components/calculator/AIHintCard'
import CurrencyDropdown, { CURRENCIES } from '../../components/calculator/CurrencyDropdown'

const fmt = (n,sym='$') => sym+Math.round(Math.max(0,n)).toLocaleString()

function FieldInput({label,hint,value,onChange,prefix,suffix,min=0,max,catColor='#6366f1'}) {
  const [raw,setRaw]=useState(String(value))
  const [focused,setFocused]=useState(false)
  useEffect(()=>{if(!focused)setRaw(String(value))},[value,focused])
  return (
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
          style={{flex:1,border:'none',background:'transparent',fontSize:13,fontWeight:600,color:'var(--text)',padding:0,outline:'none',minWidth:0,fontFamily:"'DM Sans',sans-serif"}} />
        {suffix&&<span style={{fontSize:11,color:'var(--text-3)',fontWeight:500,flexShrink:0}}>{suffix}</span>}
      </div>
    </div>
  )
}
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

export default function RentVsBuy({ meta, category }) {
  const [homePrice,setHomePrice]=useState(350000)
  const [openFaq,setOpenFaq]=useState(null)
  const [downPct,setDownPct]=useState(20)
  const [rate,setRate]=useState(6.5)
  const [rent,setRent]=useState(1800)
  const [rentIncrease,setRentIncrease]=useState(3)
  const [homeAppreciation,setHomeAppreciation]=useState(4)
  const [years,setYears]=useState(7)
  const [tax,setTax]=useState(300)
  const [insurance,setInsurance]=useState(100)
  const [maintenance,setMaintenance]=useState(200)
  const [currency,setCurrency]=useState(CURRENCIES[0])
  const sym=currency.symbol
  const catColor=category?.color||'#6366f1'

  const downAmt = homePrice*downPct/100
  const loanAmt = homePrice-downAmt
  const mr = rate/100/12
  const n = 30*12
  const emi = mr===0?loanAmt/n:loanAmt*mr*Math.pow(1+mr,n)/(Math.pow(1+mr,n)-1)
  const pmi = downPct<20?loanAmt*0.005/12:0

  // Total buy costs over years
  let totalBuyCost=downAmt // opportunity cost of down payment
  let bal=loanAmt, totalInterest=0, totalPrincipal=0
  for(let m=1;m<=years*12;m++){
    const ip=bal*mr, pp=Math.min(emi-ip,bal)
    totalInterest+=ip; totalPrincipal+=pp
    bal=Math.max(0,bal-pp)
    totalBuyCost+=emi+(tax+insurance+maintenance+pmi)
  }
  // Selling costs (6% agent + closing)
  const futureHomeValue = homePrice*Math.pow(1+homeAppreciation/100,years)
  const equity = futureHomeValue - bal
  const sellingCosts = futureHomeValue*0.06
  const netFromSale = equity - sellingCosts
  const netBuyCost = totalBuyCost - netFromSale

  // Total rent costs over years
  let totalRentCost=0
  for(let yr=0;yr<years;yr++){
    totalRentCost+=rent*Math.pow(1+rentIncrease/100,yr)*12
  }
  // Investment return on down payment if renting
  const investmentReturn = downAmt*Math.pow(1+0.07,years)-downAmt
  const netRentCost = totalRentCost - investmentReturn

  const buyingWins = netBuyCost < netRentCost
  const diff = Math.abs(netBuyCost-netRentCost)

  // Break-even year
  let breakEvenYr = null
  for(let yr=1;yr<=30;yr++){
    let bc=downAmt,rb=loanAmt2=loanAmt,tc=0
    let b2=loanAmt,ti=0
    for(let m=1;m<=yr*12;m++){const ip2=b2*mr,pp2=Math.min(emi-ip2,b2);ti+=ip2;b2=Math.max(0,b2-pp2)}
    const fhv=homePrice*Math.pow(1+homeAppreciation/100,yr)
    const eq=fhv-b2, sc=fhv*0.06
    let buyC=downAmt+(emi+(tax+insurance+maintenance+pmi))*yr*12-(eq-sc)
    let rentC=0
    for(let y2=0;y2<yr;y2++) rentC+=rent*Math.pow(1+rentIncrease/100,y2)*12
    rentC-=downAmt*(Math.pow(1.07,yr)-1)
    if(buyC<rentC){breakEvenYr=yr;break}
  }

  const hint = `${buyingWins?'Buying':'Renting'} is cheaper over ${years} years by ${fmt(diff,sym)}. ${breakEvenYr?`Break-even at year ${breakEvenYr}.`:'Renting is cheaper over the full period analyzed.'}`

  return (
    <div style={{display:'flex',flexDirection:'column',gap:24}}>
      <div>
        <CalcShell
          left={<>
            <div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:16,paddingBottom:8,borderBottom:'0.5px solid var(--border)'}}>Your Scenario</div>
            <CurrencyDropdown currency={currency} setCurrency={setCurrency} catColor={catColor} />
            <div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',marginBottom:8,textTransform:'uppercase',letterSpacing:'.05em'}}>If Buying</div>
            <FieldInput label="Home Price" value={homePrice} onChange={setHomePrice} prefix={sym} min={1} catColor={catColor} />
            <FieldInput label="Down Payment" hint="%" value={downPct} onChange={setDownPct} suffix="%" min={0} max={100} catColor={catColor} />
            <FieldInput label="Mortgage Rate" value={rate} onChange={setRate} suffix="%" min={0} max={20} catColor={catColor} />
            <FieldInput label="Monthly Tax + Insurance" value={tax+insurance} onChange={v=>{setTax(v*0.75|0);setInsurance(v*0.25|0)}} prefix={sym} min={0} catColor={catColor} />
            <FieldInput label="Monthly Maintenance" hint="~1%/yr of home value" value={maintenance} onChange={setMaintenance} prefix={sym} min={0} catColor={catColor} />
            <div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',margin:'8px 0',textTransform:'uppercase',letterSpacing:'.05em'}}>If Renting</div>
            <FieldInput label="Monthly Rent" value={rent} onChange={setRent} prefix={sym} min={1} catColor={catColor} />
            <FieldInput label="Annual Rent Increase" value={rentIncrease} onChange={setRentIncrease} suffix="%" min={0} max={20} catColor={catColor} />
            <div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',margin:'8px 0',textTransform:'uppercase',letterSpacing:'.05em'}}>Assumptions</div>
            <FieldInput label="Home Appreciation Rate" value={homeAppreciation} onChange={setHomeAppreciation} suffix="%/yr" min={0} max={20} catColor={catColor} />
            <FieldInput label="Time Horizon" value={years} onChange={setYears} suffix="yrs" min={1} max={30} catColor={catColor} />
            <button style={{width:'100%',padding:13,borderRadius:10,border:'none',background:catColor,color:'#fff',fontSize:14,fontWeight:700,cursor:'pointer',marginTop:6}} onMouseEnter={e=>e.currentTarget.style.opacity='.85'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>Compare →</button>
          </>}
          right={<>
            <div style={{padding:'16px',borderRadius:12,background:buyingWins?catColor+'0d':'#10b98108',border:`1.5px solid ${buyingWins?catColor+'30':'#10b98130'}`,textAlign:'center',marginBottom:12}}>
              <div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',marginBottom:6,textTransform:'uppercase',letterSpacing:'.07em'}}>Better choice over {years} years</div>
              <div style={{fontSize:28,fontWeight:800,color:buyingWins?catColor:'#10b981',fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{buyingWins?'🏠 Buying':'🏢 Renting'}</div>
              <div style={{fontSize:13,color:'var(--text-2)',marginTop:4}}>saves {fmt(diff,sym)} net</div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:12}}>
              {[{label:'Net Buy Cost',val:netBuyCost,color:catColor},{label:'Net Rent Cost',val:netRentCost,color:'#10b981'}].map((r,i)=>(
                <div key={i} style={{padding:'12px',borderRadius:10,background:'var(--bg-card)',border:'0.5px solid var(--border)',textAlign:'center'}}>
                  <div style={{fontSize:10,color:'var(--text-3)',marginBottom:4,textTransform:'uppercase',letterSpacing:'.05em'}}>{r.label}</div>
                  <div style={{fontSize:16,fontWeight:800,color:r.color,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{fmt(r.val,sym)}</div>
                </div>
              ))}
            </div>
            {breakEvenYr&&<div style={{padding:'10px 12px',borderRadius:8,background:catColor+'08',border:`1px solid ${catColor}25`,fontSize:12,color:'var(--text-2)',marginBottom:12}}>⚖️ Break-even point: <strong style={{color:catColor}}>Year {breakEvenYr}</strong> — buying becomes cheaper after this point.</div>}
            <AIHintCard hint={hint} />
          </>}
        />
      </div>

      <_Section title="Formula Explained" subtitle="The math behind this calculator">
        <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:14}}>
          {[
          {label:'Net Buy Cost',formula:"Total payments + opportunity cost of down − net sale proceeds"},
          {label:'Net Rent Cost',formula:"Total rent paid − investment return on down payment amount"},
          {label:'Break-even Year',formula:"Year when cumulative buy cost < cumulative rent cost"},
          ].map(f=>(
            <div key={f.label}>
              <div style={{fontSize:10,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.05em',marginBottom:4}}>{''+f.label}</div>
              <div style={{background:'var(--bg-raised)',borderRadius:8,padding:'10px 14px',fontFamily:'monospace',fontSize:12,color:catColor,fontWeight:600,overflowX:'auto',whiteSpace:'nowrap'}}>{''+f.formula}</div>
            </div>
          ))}
        </div>
        <p style={{fontSize:12,color:'var(--text-2)',lineHeight:1.75,margin:0}}>Both renting and buying have hidden costs. Buying has mortgage interest, taxes, insurance, maintenance and the opportunity cost of your down payment. Renting loses potential equity gains but keeps your down payment invested. True comparison requires modeling all cash flows over your planned time horizon.</p>
      </_Section>

      <_Section title="Real World Examples" subtitle="Click to load scenario">
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
          {[{title:'Urban Renter',desc:'High rent city, unsure about buying',homePrice:500000,downPct:10,rate:6.5,rent:2800,rentIncrease:3,homeAppreciation:4,years:7,tax:350,insurance:100,maintenance:300},{title:'Suburban Buyer',desc:'Good deal vs local rents',homePrice:320000,downPct:20,rate:6.5,rent:1800,rentIncrease:3,homeAppreciation:3,years:10,tax:250,insurance:90,maintenance:200},{title:'Long-term Owner',desc:'Plan to stay 15+ years',homePrice:400000,downPct:20,rate:6.5,rent:2000,rentIncrease:3,homeAppreciation:4,years:15,tax:300,insurance:100,maintenance:250}].map((ex,i)=>(
            <button key={i} onClick={()=>{setHomePrice(ex.homePrice);setDownPct(ex.downPct);setRate(ex.rate);setRent(ex.rent);setRentIncrease(ex.rentIncrease);setHomeAppreciation(ex.homeAppreciation);setYears(ex.years);setTax(ex.tax);setInsurance(ex.insurance);setMaintenance(ex.maintenance)}} style={{padding:14,borderRadius:10,border:'1.5px solid var(--border)',background:'var(--bg-raised)',cursor:'pointer',textAlign:'left',transition:'all .15s'}} onMouseEnter={e=>{e.currentTarget.style.borderColor=catColor;e.currentTarget.style.background=catColor+'10'}} onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.background='var(--bg-raised)'}}>
              <div style={{fontSize:13,fontWeight:700,color:'var(--text)',marginBottom:4}}>{ex.title}</div>
              <div style={{fontSize:11,color:'var(--text-3)',marginBottom:8,lineHeight:1.4}}>{ex.desc}</div>
              {[['Price',`${sym}${ex.homePrice.toLocaleString()}`],['Rent',`${sym}${ex.rent}/mo`],['Horizon',`${ex.years} yrs`]].map(([k,v])=>(
                <div key={k} style={{display:'flex',justifyContent:'space-between'}}><span style={{fontSize:10,color:'var(--text-3)'}}>{k}</span><span style={{fontSize:10,fontWeight:600,color:catColor}}>{v}</span></div>
              ))}
              <div style={{marginTop:8,fontSize:10,fontWeight:700,color:catColor}}>Apply example →</div>
            </button>
          ))}
        </div>
      </_Section>

      <_Section title="Key Terms" subtitle="Click any term to see its definition">
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:8}}>
          {[
  {term:'Opportunity Cost',def:"The return you forgo by putting money into a down payment instead of investing it."}
  {term:'Home Appreciation',def:"The annual rate at which your property value increases."}
  {term:'Break-even Year',def:"The year when total cost of buying becomes less than total cost of renting."}
  {term:'Net Proceeds',def:"Sale price minus remaining mortgage balance and selling costs (~6%)."}
  {term:'Equity',def:"Your ownership stake — home value minus outstanding mortgage balance."}
  {term:'Rent Inflation',def:"The annual percentage increase in your rent, typically 2-4%."}
          ].map((item,i)=><_Glossary key={i} term={item.term} def={item.def} catColor={catColor} />)}
        </div>
      </_Section>

      <Section title="Cost Breakdown" subtitle="Where your money goes over the analysis period">
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontFamily:"'DM Sans',sans-serif"}}>
            <thead><tr>{['',`Buying (${years} yrs)`,`Renting (${years} yrs)`].map((h,i)=>(
              <th key={h} style={{padding:'9px 12px',fontSize:11,fontWeight:700,color:'var(--text-3)',textAlign:i===0?'left':'right',borderBottom:'1px solid var(--border)',fontFamily:"'Space Grotesk',sans-serif"}}>{h}</th>
            ))}</tr></thead>
            <tbody>
              {[
                ['Mortgage / Rent payments',fmt(emi*years*12,sym),fmt(totalRentCost,sym)],
                ['Tax + Insurance + Maintenance',fmt((tax+insurance+maintenance)*years*12,sym),'—'],
                ['Down payment (opportunity cost)',fmt(downAmt,sym),`invested → +${fmt(investmentReturn,sym)}`],
                ['Home sale proceeds',`-${fmt(netFromSale,sym)}`,'—'],
                ['Net total cost',fmt(netBuyCost,sym),fmt(netRentCost,sym)],
              ].map(([label,...vals],i)=>(
                <tr key={label} style={{background:i%2===0?'var(--bg-raised)':'transparent',fontWeight:i===4?700:400}}>
                  <td style={{padding:'9px 12px',fontSize:12,color:i===4?catColor:'var(--text)'}}>{label}</td>
                  {vals.map((v,j)=><td key={j} style={{padding:'9px 12px',fontSize:12,color:i===4?(j===0&&buyingWins||j===1&&!buyingWins?catColor:'var(--text)'):'var(--text-2)',textAlign:'right'}}>{v}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <_Section title="Frequently Asked Questions">
        {[
  {q:"Is buying always better than renting?",a:"No. Whether buying beats renting depends on how long you stay, local price-to-rent ratios, market appreciation, and your opportunity cost. In expensive cities with high price-to-rent ratios, renting and investing the difference can outperform buying over 5-7 year horizons."},
  {q:"What is the price-to-rent ratio?",a:"Price-to-rent ratio = home price ÷ annual rent. Below 15 favors buying; 15-20 is neutral; above 20 favors renting. In expensive cities like NYC or SF, ratios can exceed 30, making renting financially sensible for shorter timeframes."},
  {q:"Why does the break-even take so long?",a:"Early in a mortgage, most payments go to interest, not equity. Buying also has significant upfront costs (closing costs, down payment opportunity cost). It typically takes 5-8 years before buying becomes cheaper than renting, which is why buying only makes sense if you plan to stay long-term."},
  {q:"Does this account for taxes?",a:"This calculator does not include mortgage interest deduction or capital gains exclusion. Homeowners can deduct mortgage interest (if itemizing) and exclude up to $250k ($500k married) in capital gains. These tax benefits can make buying more attractive for high-income earners."},
        ].map((item,i)=><_Accordion key={i} q={item.q} a={item.a} isOpen={openFaq===i} onToggle={()=>setOpenFaq(openFaq===i?null:i)} catColor={catColor} />)}
      </_Section>
    </div>
  )
}