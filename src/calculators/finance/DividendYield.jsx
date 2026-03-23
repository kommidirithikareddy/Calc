import { useState, useEffect, useRef } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import ResultHero from '../../components/calculator/ResultHero'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'
import CurrencyDropdown, { CURRENCIES } from '../../components/calculator/CurrencyDropdown'

const fmt = (n,sym='$') => sym+Math.round(Math.max(0,n)).toLocaleString()
const fmtP = n => n.toFixed(2)+'%'
const fmtD = (n,sym='$') => sym+(Math.round(n*100)/100).toFixed(2)

const EXAMPLES = [
  { title:'Blue Chip Stock',  desc:'Stable dividend payer like Coca-Cola', price:60,   annual:2.52, shares:100 },
  { title:'REIT Investment',  desc:'Real estate investment trust',          price:45,   annual:3.60, shares:200 },
  { title:'Growth Stock',     desc:'Tech stock with small dividend',        price:185,  annual:3.00, shares:50  },
]

const FAQ = [
  { q:'What is dividend yield?', a:'Dividend yield is the annual dividend payment expressed as a percentage of the current stock price. For example, if a stock pays $2.52/year in dividends and trades at $60, the dividend yield is 4.2%. It tells you the "income return" of a stock investment, excluding any capital gains.' },
  { q:'What is a good dividend yield?', a:'It depends on the sector and market conditions. Generally, 2-4% is considered a healthy dividend yield for stable companies. REITs and utilities often yield 4-8%. Yields above 8-10% can be a warning sign — they may indicate the dividend is unsustainable or the stock price has fallen sharply due to problems.' },
  { q:'What is the difference between yield and dividend growth?', a:'Yield measures current income as a percentage of price. Dividend growth measures how fast the dividend per share increases year over year. A stock with a 2% yield but 10% annual dividend growth may outperform a 5% yielding stock with no growth over the long term, as the growing dividend compounds on your original cost basis.' },
  { q:'What is dividend payout ratio?', a:'The payout ratio is the percentage of earnings paid as dividends. A ratio below 60% is generally sustainable. Above 80% may signal the company is stretching to maintain the dividend. A ratio above 100% means the company is paying more in dividends than it earns — often unsustainable.' },
  { q:'Do dividends affect the stock price?', a:'Yes — on the ex-dividend date, the stock price typically drops by approximately the dividend amount. This is because the dividend represents value leaving the company. However, long-term dividend-paying companies often maintain or grow their stock price through retained earnings and business growth.' },
]

const GLOSSARY = [
  { term:'Dividend Yield',      def:'Annual dividend per share divided by the current stock price, expressed as a percentage.' },
  { term:'Annual Dividend',     def:'The total dividend payment per share over one year. Often paid quarterly (4 payments) or monthly.' },
  { term:'Payout Ratio',        def:'The percentage of a company\'s earnings paid as dividends. Lower ratios suggest more sustainable dividends.' },
  { term:'Ex-Dividend Date',    def:'The cutoff date to be eligible for the next dividend payment. Buy before this date to receive the dividend.' },
  { term:'Dividend Reinvestment',def:'Using dividend payments to buy more shares (DRIP). Compounds returns significantly over time.' },
  { term:'Yield on Cost',       def:'The dividend yield based on your original purchase price, not the current price. Rises as dividends grow.' },
]

function FieldInput({label,hint,value,onChange,prefix,suffix,min=0,max,step=1,catColor='#6366f1'}) {
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

export default function DividendYield({ meta, category }) {
  const [price,setPrice]=useState(60)
  const [annual,setAnnual]=useState(2.52)
  const [shares,setShares]=useState(100)
  const [currency,setCurrency]=useState(CURRENCIES[0])
  const [openFaq,setOpenFaq]=useState(null)
  const calcRef=useRef(null)
  const sym=currency.symbol
  const catColor=category?.color||'#6366f1'

  const yield_pct = price > 0 ? (annual/price)*100 : 0
  const quarterly = annual/4
  const monthly   = annual/12
  const totalInvestment = price*shares
  const annualIncome    = annual*shares
  const monthlyIncome   = annualIncome/12

  const hint = `At ${fmtP(yield_pct)} dividend yield, your ${shares} shares (${fmt(totalInvestment,sym)} investment) generate ${fmt(annualIncome,sym)}/year or ${fmtD(monthlyIncome,sym)}/month in dividend income.`

  function applyExample(ex){setPrice(ex.price);setAnnual(ex.annual);setShares(ex.shares);setTimeout(()=>calcRef.current?.scrollIntoView({behavior:'smooth',block:'start'}),50)}

  return (
    <div style={{display:'flex',flexDirection:'column',gap:24}}>
      <div ref={calcRef} style={{scrollMarginTop:80}}>
        <CalcShell
          left={<>
            <div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:16,paddingBottom:8,borderBottom:'0.5px solid var(--border)'}}>Stock Details</div>
            <CurrencyDropdown currency={currency} setCurrency={setCurrency} catColor={catColor} />
            <FieldInput label="Stock Price" hint="Current market price" value={price} onChange={setPrice} prefix={sym} min={0.01} catColor={catColor} />
            <FieldInput label="Annual Dividend Per Share" hint="Total yearly dividend" value={annual} onChange={setAnnual} prefix={sym} min={0} catColor={catColor} />
            <FieldInput label="Number of Shares" hint="Shares you own or plan to buy" value={shares} onChange={setShares} suffix="shares" min={1} catColor={catColor} />

            {/* Live yield preview */}
            <div style={{padding:'12px 14px',borderRadius:10,marginBottom:14,background:catColor+'0d',border:`1px solid ${catColor}25`}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
                <span style={{fontSize:11,color:'var(--text-2)',fontFamily:"'DM Sans',sans-serif"}}>Dividend Yield</span>
                <span style={{fontSize:20,fontWeight:800,color:catColor,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{fmtP(yield_pct)}</span>
              </div>
              <div style={{display:'flex',justifyContent:'space-between'}}>
                <span style={{fontSize:10,color:'var(--text-3)'}}>Quarterly: {fmtD(quarterly,sym)}/share</span>
                <span style={{fontSize:10,color:'var(--text-3)'}}>Monthly: {fmtD(monthly,sym)}/share</span>
              </div>
            </div>

            <div style={{display:'flex',gap:10}}>
              <button style={{flex:1,padding:13,borderRadius:10,border:'none',background:catColor,color:'#fff',fontSize:14,fontWeight:700,cursor:'pointer'}} onMouseEnter={e=>e.currentTarget.style.opacity='.85'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>Calculate →</button>
              <button onClick={()=>{setPrice(60);setAnnual(2.52);setShares(100)}} style={{padding:'13px 18px',borderRadius:10,border:'1.5px solid var(--border-2)',background:'var(--bg-raised)',color:'var(--text-2)',fontSize:13,fontWeight:500,cursor:'pointer'}} onMouseEnter={e=>{e.currentTarget.style.borderColor='#ef4444';e.currentTarget.style.color='#ef4444'}} onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border-2)';e.currentTarget.style.color='var(--text-2)'}}>Reset</button>
            </div>
          </>}
          right={<>
            <ResultHero label="Dividend Yield" value={Math.round(yield_pct*100)/100} formatter={n=>n.toFixed(2)+'%'} sub={`${fmtD(annual,sym)}/share annually`} color={catColor} />
            <BreakdownTable title="Income Summary" rows={[
              {label:'Total Investment',   value:fmt(totalInvestment,sym), color:catColor},
              {label:'Annual Dividend/Share', value:fmtD(annual,sym)},
              {label:'Quarterly Dividend', value:fmtD(quarterly*shares,sym)},
              {label:'Monthly Income',     value:fmtD(monthlyIncome,sym), color:'#10b981'},
              {label:'Annual Income',      value:fmt(annualIncome,sym),    color:catColor, bold:true, highlight:true},
            ]} />
            <AIHintCard hint={hint} />
          </>}
        />
      </div>

      <Section title="Dividend Growth Projection" subtitle="How your income grows if the dividend increases annually">
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontFamily:"'DM Sans',sans-serif"}}>
            <thead><tr>{['Growth Rate','Year 5 Income','Year 10 Income','Yield on Cost'].map((h,i)=>(
              <th key={h} style={{padding:'9px 12px',fontSize:11,fontWeight:700,color:'var(--text-3)',textAlign:i===0?'left':'right',borderBottom:'1px solid var(--border)',fontFamily:"'Space Grotesk',sans-serif"}}>{h}</th>
            ))}</tr></thead>
            <tbody>
              {[0,3,5,8,10].map((g,i)=>{
                const y5=annualIncome*Math.pow(1+g/100,5)
                const y10=annualIncome*Math.pow(1+g/100,10)
                const yoc=price>0?(annual*Math.pow(1+g/100,10)/price)*100:0
                return (
                  <tr key={g} style={{background:i%2===0?'var(--bg-raised)':'transparent'}}>
                    <td style={{padding:'9px 12px',fontSize:12,fontWeight:600,color:g===0?'var(--text)':catColor}}>{g===0?'No growth':`+${g}%/yr`}</td>
                    <td style={{padding:'9px 12px',fontSize:12,color:'var(--text)',textAlign:'right'}}>{fmt(y5,sym)}</td>
                    <td style={{padding:'9px 12px',fontSize:12,color:'#10b981',fontWeight:600,textAlign:'right'}}>{fmt(y10,sym)}</td>
                    <td style={{padding:'9px 12px',fontSize:12,color:catColor,textAlign:'right'}}>{yoc.toFixed(2)}%</td>
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
              {[['Price',`${sym}${ex.price}`],['Annual Div',`${sym}${ex.annual}/share`],['Shares',`${ex.shares}`],['Yield',`${((ex.annual/ex.price)*100).toFixed(2)}%`]].map(([k,v])=>(
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

      <Section title="Formula Explained" subtitle="How dividend yield is calculated">
        <div style={{background:'var(--bg-raised)',borderRadius:10,padding:'14px 16px',marginBottom:14,fontFamily:'monospace',fontSize:13,color:catColor,fontWeight:600}}>
          Dividend Yield = (Annual Dividend Per Share / Stock Price) × 100
        </div>
        <p style={{fontSize:12,color:'var(--text-2)',lineHeight:1.75,margin:0}}>Dividend yield measures the cash return you receive relative to the stock price. As a stock price rises, yield falls (same dividend, higher price). As a stock price falls, yield rises. This is why a suspiciously high yield can indicate market concern about the company's ability to maintain the dividend.</p>
      </Section>

      <Section title="Key Terms" subtitle="Dividend terminology — click any term">
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:8}}>
          {GLOSSARY.map((item,i)=><GlossaryTerm key={i} term={item.term} def={item.def} catColor={catColor} />)}
        </div>
      </Section>

      <Section title="Frequently Asked Questions" subtitle="Everything about dividend investing">
        {FAQ.map((item,i)=><AccordionItem key={i} q={item.q} a={item.a} isOpen={openFaq===i} onToggle={()=>setOpenFaq(openFaq===i?null:i)} catColor={catColor} />)}
      </Section>
    </div>
  )
}
