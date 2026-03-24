import { useState, useEffect, useRef } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import ResultHero from '../../components/calculator/ResultHero'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'
import CurrencyDropdown, { CURRENCIES } from '../../components/calculator/CurrencyDropdown'

const fmt  = (n, sym='$') => sym + Math.abs(Math.round(n)).toLocaleString()

const FAQ = [
  { q:'What is net worth and why does it matter?', a:'Net worth is total assets minus total liabilities — the single most important measure of financial health. Unlike income (which measures cash flow), net worth measures accumulated wealth. A high income with nothing saved is worth less than a modest income with consistent saving. Tracking net worth monthly reveals whether you are actually building wealth.' },
  { q:'What assets should I include?', a:'Include everything with monetary value: cash, investments, retirement accounts, real estate, vehicles, business ownership and any other property. Use current market values, not purchase prices. For illiquid assets like real estate, use a realistic estimate of what you could sell for today.' },
  { q:'What liabilities should I include?', a:'Include all outstanding balances: mortgage, home equity loans, car loans, student loans, credit card balances, personal loans, medical debt and any other amounts owed. Do NOT include future bills — only current outstanding debts.' },
  { q:'What is a good net worth by age?', a:'A common benchmark is: by 30, have 1× your annual salary saved; by 40, 3×; by 50, 6×; by 60, 8×; at retirement, 10-12×. These are guidelines, not rules. Net worth depends heavily on income, location, life stage and goals. More meaningful is whether your net worth is trending upward month over month.' },
  { q:'How often should I calculate my net worth?', a:'Monthly is ideal — it takes 10-15 minutes and provides valuable trend data. At minimum, calculate quarterly. The most important insight from tracking net worth is the trend line: is it growing? At what rate? Is your growth rate keeping up with your goals?' },
]

const GLOSSARY = [
  { term:'Net Worth',         def:'Total assets minus total liabilities. The most comprehensive measure of financial health.' },
  { term:'Liquid Assets',     def:'Assets that can be converted to cash quickly with minimal loss of value: savings, checking, money market accounts.' },
  { term:'Invested Assets',   def:'Stocks, bonds, mutual funds, ETFs, crypto — assets that grow through market appreciation.' },
  { term:'Illiquid Assets',   def:'Real estate, business equity, collectibles — valuable but cannot be quickly converted to cash.' },
  { term:'Debt-to-Asset Ratio', def:'Total liabilities / Total assets. Lower is better. Above 50% may indicate financial stress.' },
  { term:'Solvency',          def:'Having positive net worth — your assets exceed your liabilities. The opposite (negative net worth) is insolvency.' },
]

const ASSET_CATS = [
  { key:'cash',       label:'Cash & Savings',       icon:'💵', hint:'Checking, savings, money market, cash on hand' },
  { key:'invest',     label:'Investments',           icon:'📈', hint:'Stocks, ETFs, mutual funds, crypto, brokerage' },
  { key:'retirement', label:'Retirement Accounts',  icon:'🏦', hint:'401k, IRA, Roth IRA, pension value' },
  { key:'realestate', label:'Real Estate',           icon:'🏠', hint:'Home value, investment properties' },
  { key:'vehicles',   label:'Vehicles',              icon:'🚗', hint:'Cars, motorcycles, boats (current market value)' },
  { key:'business',   label:'Business Equity',       icon:'🏢', hint:'Your share of any business you own' },
  { key:'other',      label:'Other Assets',          icon:'📦', hint:'Collectibles, jewelry, valuables' },
]

const LIAB_CATS = [
  { key:'mortgage',   label:'Mortgage',              icon:'🏠', hint:'Remaining balance on home loan(s)' },
  { key:'carloan',    label:'Car Loans',             icon:'🚗', hint:'Outstanding auto loan balances' },
  { key:'student',    label:'Student Loans',         icon:'🎓', hint:'Federal and private student loan balances' },
  { key:'credit',     label:'Credit Cards',          icon:'💳', hint:'Total outstanding credit card balances' },
  { key:'personal',   label:'Personal Loans',        icon:'📝', hint:'Personal loans, lines of credit' },
  { key:'other',      label:'Other Liabilities',     icon:'📋', hint:'Medical debt, back taxes, any other owed amounts' },
]

function AssetRow({item, value, onChange, sym, catColor}) {
  const [raw, setRaw] = useState(String(value))
  const [f, setF] = useState(false)
  useEffect(()=>{ if(!f) setRaw(String(value)) },[value,f])
  return (
    <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
      <span style={{fontSize:16,flexShrink:0}}>{item.icon}</span>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:12,fontWeight:600,color:'var(--text)',fontFamily:"'DM Sans',sans-serif"}}>{item.label}</div>
        <div style={{fontSize:10,color:'var(--text-3)'}}>{item.hint}</div>
      </div>
      <div style={{display:'flex',alignItems:'center',gap:4,background:'var(--bg-input,var(--bg-card))',border:`1.5px solid ${f?catColor:'var(--border)'}`,borderRadius:8,padding:'0 8px',height:36,width:130,flexShrink:0}}>
        <span style={{fontSize:11,color:'var(--text-3)',fontWeight:600}}>{sym}</span>
        <input type="text" inputMode="decimal" value={f?raw:value}
          onChange={e=>{setRaw(e.target.value);const v=parseFloat(e.target.value);if(!isNaN(v))onChange(v)}}
          onFocus={()=>{setF(true);setRaw(String(value))}}
          onBlur={()=>{setF(false);const v=parseFloat(raw);onChange(isNaN(v)?0:Math.max(0,v))}}
          style={{flex:1,border:'none',background:'transparent',fontSize:12,fontWeight:700,color:'var(--text)',padding:0,outline:'none',fontFamily:"'DM Sans',sans-serif"}} />
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

export default function NetWorth({ meta, category }) {
  const [currency, setCurrency] = useState(CURRENCIES[0])
  const [openFaq,  setOpenFaq]  = useState(null)
  const sym = currency.symbol
  const catColor = category?.color || '#6366f1'

  const [assets,  setAssets]  = useState({ cash:15000, invest:45000, retirement:80000, realestate:350000, vehicles:25000, business:0,      other:5000 })
  const [liabs,   setLiabs]   = useState({ mortgage:280000, carloan:12000, student:18000, credit:3500, personal:0, other:0 })

  const setA = (k,v) => setAssets(p=>({...p,[k]:v}))
  const setL = (k,v) => setLiabs(p=>({...p,[k]:v}))

  const totalAssets = Object.values(assets).reduce((a,b)=>a+b,0)
  const totalLiabs  = Object.values(liabs).reduce((a,b)=>a+b,0)
  const netWorth    = totalAssets - totalLiabs
  const debtRatio   = totalAssets > 0 ? (totalLiabs/totalAssets)*100 : 0
  const liquidAssets= assets.cash + assets.invest
  const isPositive  = netWorth >= 0

  return (
    <div style={{display:'flex',flexDirection:'column',gap:24}}>
      <CalcShell
        left={<>
          <div style={{display:'flex',justifyContent:'flex-end',marginBottom:12}}>
            <CurrencyDropdown currency={currency} setCurrency={setCurrency} catColor={catColor} />
          </div>
          <div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:14,paddingBottom:8,borderBottom:'0.5px solid var(--border)'}}>Assets — What You Own</div>
          {ASSET_CATS.map(item=>(
            <AssetRow key={item.key} item={item} value={assets[item.key]} onChange={v=>setA(item.key,v)} sym={sym} catColor={catColor} />
          ))}
          <div style={{display:'flex',justifyContent:'space-between',padding:'10px 0',borderTop:'1px solid var(--border)',marginTop:4,marginBottom:20}}>
            <span style={{fontSize:13,fontWeight:700,color:'var(--text)',fontFamily:"'Space Grotesk',sans-serif"}}>Total Assets</span>
            <span style={{fontSize:14,fontWeight:800,color:'#10b981',fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{fmt(totalAssets,sym)}</span>
          </div>

          <div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:14,paddingBottom:8,borderBottom:'0.5px solid var(--border)'}}>Liabilities — What You Owe</div>
          {LIAB_CATS.map(item=>(
            <AssetRow key={item.key} item={item} value={liabs[item.key]} onChange={v=>setL(item.key,v)} sym={sym} catColor={catColor} />
          ))}
          <div style={{display:'flex',justifyContent:'space-between',padding:'10px 0',borderTop:'1px solid var(--border)',marginTop:4}}>
            <span style={{fontSize:13,fontWeight:700,color:'var(--text)',fontFamily:"'Space Grotesk',sans-serif"}}>Total Liabilities</span>
            <span style={{fontSize:14,fontWeight:800,color:'#ef4444',fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{fmt(totalLiabs,sym)}</span>
          </div>
        </>}
        right={<>
          <ResultHero
            label="Net Worth"
            value={netWorth}
            formatter={n=>(n>=0?'':'-')+fmt(Math.abs(n),sym)}
            sub={isPositive?`Assets exceed liabilities`:`Liabilities exceed assets`}
            color={isPositive?catColor:'#ef4444'}
          />
          <BreakdownTable title="Net Worth Summary" rows={[
            {label:'Total Assets',          value:fmt(totalAssets,sym),   color:'#10b981'},
            {label:'Total Liabilities',     value:fmt(totalLiabs,sym),    color:'#ef4444'},
            {label:'Net Worth',             value:(netWorth>=0?'':'-')+fmt(Math.abs(netWorth),sym), bold:true, highlight:true, color:isPositive?catColor:'#ef4444'},
            {label:'Liquid Assets',         value:fmt(liquidAssets,sym)},
            {label:'Debt-to-Asset Ratio',   value:`${debtRatio.toFixed(1)}%`, color:debtRatio>50?'#ef4444':debtRatio>30?'#f59e0b':'#10b981'},
            {label:'Illiquid Assets',       value:fmt(totalAssets-liquidAssets,sym)},
          ]} />

          {/* Asset allocation visual */}
          <div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,padding:'16px 18px'}}>
            <div style={{fontSize:13,fontWeight:700,color:'var(--text)',fontFamily:"'Space Grotesk',sans-serif",marginBottom:14}}>Asset Breakdown</div>
            {ASSET_CATS.filter(c=>assets[c.key]>0).sort((a,b)=>assets[b.key]-assets[a.key]).map(c=>{
              const pct = totalAssets>0?assets[c.key]/totalAssets*100:0
              return (
                <div key={c.key} style={{marginBottom:10}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}>
                    <span style={{fontSize:11.5,color:'var(--text-2)',fontFamily:"'DM Sans',sans-serif"}}>{c.icon} {c.label}</span>
                    <span style={{fontSize:11.5,fontWeight:700,color:catColor}}>{fmt(assets[c.key],sym)} ({Math.round(pct)}%)</span>
                  </div>
                  <div style={{height:6,background:'var(--bg-raised)',borderRadius:3,overflow:'hidden'}}>
                    <div style={{width:`${pct}%`,height:'100%',background:catColor,borderRadius:3,transition:'width .4s'}}/>
                  </div>
                </div>
              )
            })}
          </div>

          <AIHintCard hint={`Net worth: ${(netWorth>=0?'':'-')+fmt(Math.abs(netWorth),sym)}. Debt-to-asset ratio: ${debtRatio.toFixed(1)}% — ${debtRatio<30?'healthy':'consider paying down debt'}. Liquid assets (${fmt(liquidAssets,sym)}) cover ${totalLiabs>0?(liquidAssets/totalLiabs*100).toFixed(0)+'% of liabilities':'all liabilities'}.`} />
        </>}
      />

      <Section title="Formula Explained">
        <div style={{background:'var(--bg-raised)',borderRadius:10,padding:'14px 16px',marginBottom:14,fontFamily:'monospace',fontSize:12,color:catColor,lineHeight:1.9}}>
          Net Worth = Total Assets − Total Liabilities{'\n'}
          Debt-to-Asset Ratio = Liabilities / Assets × 100
        </div>
        <p style={{fontSize:12.5,color:'var(--text-2)',lineHeight:1.75,margin:0,fontFamily:"'DM Sans',sans-serif"}}>
          Net worth is the most complete snapshot of financial health — it captures everything you own and everything you owe. A growing net worth trend means you are accumulating wealth. Track it monthly to see the effect of saving, debt repayment, and investment growth in real numbers.
        </p>
      </Section>

      <Section title="Net Worth by Age Benchmarks" subtitle="Common milestones — not rules, just reference points">
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontFamily:"'DM Sans',sans-serif"}}>
            <thead><tr>{['Age','Fidelity Target','Based on $75k Income','Based on $150k Income'].map((h,i)=>(
              <th key={h} style={{padding:'9px 12px',fontSize:11,fontWeight:700,color:'var(--text-3)',textAlign:i===0?'left':'right',borderBottom:'1px solid var(--border)',fontFamily:"'Space Grotesk',sans-serif"}}>{h}</th>
            ))}</tr></thead>
            <tbody>
              {[
                {age:30,mult:1,  a:75000,  b:150000},
                {age:40,mult:3,  a:225000, b:450000},
                {age:50,mult:6,  a:450000, b:900000},
                {age:60,mult:8,  a:600000, b:1200000},
                {age:67,mult:10, a:750000, b:1500000},
              ].map((r,i)=>(
                <tr key={r.age} style={{background:i%2===0?'var(--bg-raised)':'transparent'}}>
                  <td style={{padding:'9px 12px',fontSize:12,fontWeight:600,color:'var(--text)'}}>Age {r.age}</td>
                  <td style={{padding:'9px 12px',fontSize:12,color:catColor,textAlign:'right'}}>{r.mult}× salary</td>
                  <td style={{padding:'9px 12px',fontSize:12,color:'var(--text)',textAlign:'right'}}>{fmt(r.a,sym)}</td>
                  <td style={{padding:'9px 12px',fontSize:12,color:'var(--text)',textAlign:'right'}}>{fmt(r.b,sym)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
