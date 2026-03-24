import { useState, useEffect, useRef } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import ResultHero from '../../components/calculator/ResultHero'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'
import CurrencyDropdown, { CURRENCIES } from '../../components/calculator/CurrencyDropdown'

const fmt  = (n, sym='$') => sym + Math.round(Math.max(0,n)).toLocaleString()
const fmtD = (n, sym='$') => sym + (Math.round(n*100)/100).toFixed(2)

// Full Retirement Age table by birth year
function getFRA(birthYear) {
  if (birthYear <= 1937) return 65
  if (birthYear === 1938) return 65 + 2/12
  if (birthYear === 1939) return 65 + 4/12
  if (birthYear === 1940) return 65 + 6/12
  if (birthYear === 1941) return 65 + 8/12
  if (birthYear === 1942) return 65 + 10/12
  if (birthYear >= 1943 && birthYear <= 1954) return 66
  if (birthYear === 1955) return 66 + 2/12
  if (birthYear === 1956) return 66 + 4/12
  if (birthYear === 1957) return 66 + 6/12
  if (birthYear === 1958) return 66 + 8/12
  if (birthYear === 1959) return 66 + 10/12
  return 67  // 1960 and later
}

function calcBenefit(pia, claimAge, fra) {
  const diff = claimAge - fra
  if (diff >= 0) {
    // Delayed credits: +8% per year after FRA up to age 70
    const credits = Math.min(diff, 70 - fra)
    return pia * (1 + credits * 0.08)
  } else {
    // Early reduction
    const months = Math.round(Math.abs(diff) * 12)
    if (months <= 36) return pia * (1 - months * (5/9) / 100)
    return pia * (1 - 36*(5/9)/100 - (months-36)*(5/12)/100)
  }
}

const EXAMPLES = [
  { title:'Claim at 62 (Early)',    desc:'Maximum early reduction scenario',   pia:2200, birthYear:1962, claimAge:62, lifeExp:82 },
  { title:'Claim at FRA (67)',       desc:'Full retirement age — no adj.',      pia:2200, birthYear:1962, claimAge:67, lifeExp:82 },
  { title:'Delay to 70 (Max)',       desc:'Maximum delayed retirement credits', pia:2200, birthYear:1962, claimAge:70, lifeExp:85 },
]

const FAQ = [
  { q:'When should I claim Social Security?', a:'The optimal claiming age depends on your health, financial needs, other income sources and marital status. If you\'re in poor health or need income immediately, claiming early (62) makes sense. If you\'re healthy and have other income, delaying to 70 maximises lifetime benefits — especially if you live past the break-even age (typically 78-80).' },
  { q:'What is the break-even age?', a:'The break-even age is when the total lifetime benefits of a later claiming strategy equal the total of an earlier strategy. Claiming at 67 vs 62 typically breaks even around age 78-79. If you live past the break-even, delaying was financially better. If you die before it, claiming early was better.' },
  { q:'How does Social Security calculate PIA?', a:'Your Primary Insurance Amount (PIA) is based on your Average Indexed Monthly Earnings (AIME) from your 35 highest-earning years. The SSA applies a progressive bend-point formula: 90% of the first $1,174 AIME + 32% of the next $5,904 + 15% of AIME above that (2024 figures). The result is your full retirement benefit.' },
  { q:'How much does claiming early reduce my benefit?', a:'Benefits are reduced 5/9 of 1% per month for the first 36 months before FRA, and 5/12 of 1% per month for additional months. For someone with FRA of 67 claiming at 62 (60 months early), the total reduction is 36×(5/9%) + 24×(5/12%) = 20% + 10% = 30% permanent reduction.' },
  { q:'What is the effect of delaying past FRA?', a:'For every month you delay claiming past your Full Retirement Age up to age 70, your benefit increases by 2/3 of 1% (8% per year). This is a guaranteed, risk-free 8% annual return — among the best available to retirees. After 70, no further credits accumulate so there is no benefit to delaying beyond 70.' },
]

const GLOSSARY = [
  { term:'PIA',               def:'Primary Insurance Amount — your full retirement benefit at Full Retirement Age, based on your 35 highest earning years.' },
  { term:'Full Retirement Age', def:'The age at which you receive 100% of your PIA. Ranges from 66 to 67 depending on birth year.' },
  { term:'Delayed Credits',    def:'+8% per year for each year you delay claiming past FRA, up to age 70. Permanently increases your benefit.' },
  { term:'Early Reduction',    def:'Permanent reduction in monthly benefit for claiming before FRA — up to 30% for those with FRA of 67.' },
  { term:'Break-Even Age',     def:'The age at which total lifetime benefits from two different claiming strategies are equal.' },
  { term:'COLA',               def:'Social Security benefits receive an annual Cost-of-Living Adjustment (typically 2-3%) based on the CPI-W index.' },
]

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

export default function SocialSecurity({ meta, category }) {
  const [pia,        setPia]        = useState(2200)
  const [birthYear,  setBirthYear]  = useState(1962)
  const [claimAge,   setClaimAge]   = useState(67)
  const [lifeExp,    setLifeExp]    = useState(82)
  const [currency,   setCurrency]   = useState(CURRENCIES[0])
  const [openFaq,    setOpenFaq]    = useState(null)
  const calcRef = useRef(null)
  const sym = currency.symbol
  const catColor = category?.color || '#6366f1'

  const fra            = getFRA(birthYear)
  const fraDisplay     = `${Math.floor(fra)} years${fra%1>0?` ${Math.round((fra%1)*12)} months`:''}`
  const monthlyBenefit = calcBenefit(pia, claimAge, fra)
  const adjPct         = ((monthlyBenefit - pia) / pia) * 100
  const retirementYears= Math.max(0, lifeExp - claimAge)
  const totalLifetime  = monthlyBenefit * 12 * retirementYears

  // Break-even vs FRA
  const fraMonthly     = calcBenefit(pia, fra, fra)
  const breakEvenYears = claimAge < fra
    ? fra + (fraMonthly - monthlyBenefit) * 12 * (fra - claimAge) / ((fraMonthly - monthlyBenefit) * 12)
    : claimAge > fra
      ? fra + (monthlyBenefit - fraMonthly) * 12 * (claimAge - fra) / ((monthlyBenefit - fraMonthly) * 12)
      : null

  // Properly compute break-even vs FRA claiming
  const breakEvenAge = (() => {
    if (claimAge === fra) return null
    // Find age where cumulative benefits equal
    for (let age = 62; age <= 100; age += 0.01) {
      const yearsA = Math.max(0, age - claimAge)
      const yearsB = Math.max(0, age - fra)
      if (Math.abs(monthlyBenefit*12*yearsA - fraMonthly*12*yearsB) < 50) return Math.round(age)
    }
    return null
  })()

  function applyExample(ex) {
    setPia(ex.pia); setBirthYear(ex.birthYear); setClaimAge(ex.claimAge); setLifeExp(ex.lifeExp)
    setTimeout(()=>calcRef.current?.scrollIntoView({behavior:'smooth',block:'start'}),50)
  }

  return (
    <div style={{display:'flex',flexDirection:'column',gap:24}}>
      <div ref={calcRef} style={{scrollMarginTop:80}}>
        <CalcShell
          left={<>
            <div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:16,paddingBottom:8,borderBottom:'0.5px solid var(--border)'}}>Your Details</div>
            <CurrencyDropdown currency={currency} setCurrency={setCurrency} catColor={catColor} />
            <FieldInput label="Primary Insurance Amount (PIA)" hint="Your full benefit at FRA" value={pia} onChange={setPia} prefix={sym} catColor={catColor} />
            <FieldInput label="Birth Year" value={birthYear} onChange={setBirthYear} suffix="" min={1937} max={1970} catColor={catColor} hint={`FRA: ${fraDisplay}`} />
            <FieldInput label="Claiming Age" hint="Between 62 and 70" value={claimAge} onChange={setClaimAge} suffix="years" min={62} max={70} catColor={catColor} />
            <FieldInput label="Life Expectancy" value={lifeExp} onChange={setLifeExp} suffix="years" max={100} catColor={catColor} />

            <div style={{padding:'12px 14px',borderRadius:10,marginBottom:14,background:catColor+'0d',border:`1px solid ${catColor}25`}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
                <span style={{fontSize:11,color:'var(--text-2)',fontFamily:"'DM Sans',sans-serif"}}>Adjusted Monthly Benefit</span>
                <span style={{fontSize:20,fontWeight:800,color:catColor,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{fmt(monthlyBenefit,sym)}/mo</span>
              </div>
              <div style={{display:'flex',justifyContent:'space-between'}}>
                <span style={{fontSize:10,color:'var(--text-3)'}}>FRA: {fraDisplay}</span>
                <span style={{fontSize:10,color:adjPct>=0?'#10b981':'#ef4444',fontWeight:600}}>{adjPct>=0?'+':''}{adjPct.toFixed(1)}% vs PIA</span>
              </div>
            </div>

            <div style={{display:'flex',gap:10}}>
              <button style={{flex:1,padding:13,borderRadius:10,border:'none',background:catColor,color:'#fff',fontSize:14,fontWeight:700,cursor:'pointer'}} onMouseEnter={e=>e.currentTarget.style.opacity='.85'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>Calculate →</button>
              <button onClick={()=>{setPia(2200);setBirthYear(1962);setClaimAge(67);setLifeExp(82)}} style={{padding:'13px 18px',borderRadius:10,border:'1.5px solid var(--border-2)',background:'var(--bg-raised)',color:'var(--text-2)',fontSize:13,fontWeight:500,cursor:'pointer'}}>Reset</button>
            </div>
          </>}
          right={<>
            <ResultHero label="Monthly Benefit" value={monthlyBenefit} formatter={n=>fmt(n,sym)+'/mo'} sub={`${fmt(monthlyBenefit*12,sym)}/year | ${adjPct>=0?'+':''}${adjPct.toFixed(1)}% vs PIA`} color={catColor} />
            <BreakdownTable title="Claiming Analysis" rows={[
              {label:'PIA (at FRA)',                   value:fmt(pia,sym)},
              {label:'Your Full Retirement Age',       value:fraDisplay,     color:catColor},
              {label:'Claiming Age',                   value:`${claimAge} years`},
              {label:'Benefit Adjustment',             value:`${adjPct>=0?'+':''}${adjPct.toFixed(1)}%`, color:adjPct>=0?'#10b981':'#ef4444'},
              {label:'Monthly Benefit',                value:fmt(monthlyBenefit,sym),  bold:true, color:catColor},
              {label:'Annual Benefit',                 value:fmt(monthlyBenefit*12,sym)},
              {label:'Break-Even vs FRA',              value:breakEvenAge?`Age ${breakEvenAge}`:'N/A',  color:catColor},
              {label:'Years of Benefits',              value:`${retirementYears} years`},
              {label:'Estimated Lifetime Total',       value:fmt(totalLifetime,sym),   bold:true, highlight:true},
            ]} />
            <AIHintCard hint={claimAge<fra?`Claiming at ${claimAge} reduces your benefit by ${Math.abs(adjPct).toFixed(1)}% permanently. Break-even vs FRA claiming is around age ${breakEvenAge||'N/A'}. If you expect to live past that, consider waiting.`:claimAge>fra?`Delaying to ${claimAge} increases your benefit by ${adjPct.toFixed(1)}% permanently — a guaranteed 8%/year increase. Break-even vs FRA is around age ${breakEvenAge||'N/A'}.`:`Claiming at your Full Retirement Age gives you 100% of your PIA — ${fmt(pia,sym)}/month with no adjustments.`} />
          </>}
        />
      </div>

      {/* Claiming age comparison table */}
      <Section title="Claiming Age Comparison" subtitle="Monthly and lifetime benefits at every claiming age">
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontFamily:"'DM Sans',sans-serif"}}>
            <thead><tr>{['Claim Age','Monthly Benefit','vs PIA','Lifetime (to '+lifeExp+')'].map((h,i)=>(
              <th key={h} style={{padding:'9px 12px',fontSize:11,fontWeight:700,color:'var(--text-3)',textAlign:i===0?'left':'right',borderBottom:'1px solid var(--border)',fontFamily:"'Space Grotesk',sans-serif"}}>{h}</th>
            ))}</tr></thead>
            <tbody>
              {[62,63,64,65,66,67,68,69,70].map((age,i)=>{
                const b = calcBenefit(pia, age, fra)
                const pct = ((b-pia)/pia)*100
                const lt = b*12*Math.max(0,lifeExp-age)
                const isSelected = age===claimAge
                return (
                  <tr key={age} style={{background:isSelected?catColor+'12':i%2===0?'var(--bg-raised)':'transparent'}}>
                    <td style={{padding:'9px 12px',fontSize:12,fontWeight:isSelected?700:500,color:isSelected?catColor:'var(--text)'}}>{age}{age===Math.floor(fra)?' (FRA)':''}{isSelected?' ✓':''}</td>
                    <td style={{padding:'9px 12px',fontSize:12,fontWeight:isSelected?700:400,color:isSelected?catColor:'var(--text)',textAlign:'right'}}>{fmt(b,sym)}/mo</td>
                    <td style={{padding:'9px 12px',fontSize:12,textAlign:'right',color:pct>=0?'#10b981':'#ef4444',fontWeight:600}}>{pct>=0?'+':''}{pct.toFixed(1)}%</td>
                    <td style={{padding:'9px 12px',fontSize:12,textAlign:'right',color:isSelected?catColor:'var(--text)',fontWeight:isSelected?700:400}}>{fmt(lt,sym)}</td>
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
              {[['PIA',fmt(ex.pia,sym)+'/mo'],['Born',ex.birthYear],['Claim Age',ex.claimAge],['Life Exp',ex.lifeExp]].map(([k,v])=>(
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
          Early (before FRA): −5/9% per month (first 36 mo){'\n'}
          Early (before FRA): −5/12% per month (beyond 36 mo){'\n'}
          Delayed (after FRA): +2/3% per month (+8%/year)
        </div>
        <p style={{fontSize:12.5,color:'var(--text-2)',lineHeight:1.75,margin:0,fontFamily:"'DM Sans',sans-serif"}}>
          Social Security adjustments are permanent — a reduced benefit at 62 stays reduced for life. The 8% annual delayed credit for waiting past FRA is one of the best risk-free returns available, especially for healthy individuals who expect to live past the break-even age.
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
