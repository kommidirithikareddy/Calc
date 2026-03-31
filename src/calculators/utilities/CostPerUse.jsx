import { useState, useMemo } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'
function Sec({title,sub,children}){return(<div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,overflow:'hidden'}}><div style={{padding:'13px 18px',borderBottom:'0.5px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center'}}><span style={{fontSize:13,fontWeight:700,color:'var(--text)',fontFamily:"'Space Grotesk',sans-serif"}}>{title}</span>{sub&&<span style={{fontSize:11,color:'var(--text-3)'}}>{sub}</span>}</div><div style={{padding:'16px 18px'}}>{children}</div></div>)}function Acc({q,a,open,onToggle,color}){return(<div style={{borderBottom:'0.5px solid var(--border)'}}><button onClick={onToggle} style={{width:'100%',display:'flex',justifyContent:'space-between',alignItems:'center',padding:'13px 0',background:'none',border:'none',cursor:'pointer',gap:12,textAlign:'left'}}><span style={{fontSize:13,fontWeight:600,color:'var(--text)',fontFamily:"'DM Sans',sans-serif",lineHeight:1.4}}>{q}</span><span style={{fontSize:18,color,flexShrink:0,display:'inline-block',transform:open?'rotate(45deg)':'none',transition:'transform .2s'}}>+</span></button>{open&&<p style={{fontSize:12.5,color:'var(--text-2)',lineHeight:1.75,margin:'0 0 13px',fontFamily:"'DM Sans',sans-serif"}}>{a}</p>}</div>)}
const FAQ=[{q:'What is cost per use and why does it matter?',a:'Cost per use shows the real value of a purchase beyond the sticker price. A $200 quality coat worn 200 times costs $1/use. A $40 fast-fashion coat worn 10 times costs $4/use. The expensive coat is actually 4× cheaper in use terms.'},{q:'How do I estimate how many times I will use something?',a:'Be honest and conservative. If you\'re unsure, halve your optimistic estimate. Track your actual usage for a week to get realistic numbers. Many items are used far less than expected — hence the full gym membership problem.'}]
export default function CostPerUse({meta,category}){
  const C=category?.color||'#0d9488'
  const [cost,setCost]=useState(200)
  const [uses,setUses]=useState(100)
  const [life,setLife]=useState(365)
  const [openFaq,setOpenFaq]=useState(null)
  const cpu=uses>0?cost/uses:0
  const perDay=life>0?cost/life:0
  const hint=`$${cost} item used ${uses} times = $${cpu.toFixed(3)}/use. Over ${life} days = $${perDay.toFixed(2)}/day.`
  return(<div style={{display:'flex',flexDirection:'column',gap:20}}>
    <div style={{background:`linear-gradient(135deg,${C}12,${C}06)`,border:`1px solid ${C}30`,borderRadius:14,padding:'16px 20px',display:'flex',justifyContent:'space-between',alignItems:'center',gap:16,flexWrap:'wrap'}}>
      <div><div style={{fontSize:10,fontWeight:700,color:C,textTransform:'uppercase',letterSpacing:'.08em',marginBottom:6}}>Formula</div><div style={{fontSize:18,fontWeight:700,color:C,fontFamily:"'Space Grotesk',sans-serif"}}>Cost Per Use = Total Cost ÷ Number of Uses</div></div>
      <div style={{padding:'8px 18px',background:C+'15',borderRadius:10,fontSize:28,fontWeight:700,color:C,fontFamily:"'Space Grotesk',sans-serif"}}>${cpu.toFixed(2)}</div>
    </div>
    <CalcShell
      left={<>
        {[['Item cost ($)',cost,setCost],['Expected uses',uses,setUses],['Lifespan (days)',life,setLife]].map(([l,v,set],i)=>(<div key={i} style={{marginBottom:16}}><label style={{fontSize:12.5,fontWeight:600,color:'var(--text)',fontFamily:"'DM Sans',sans-serif",display:'block',marginBottom:6}}>{l}</label><input type="number" value={v} onChange={e=>set(Math.max(1,+e.target.value))} style={{width:'100%',height:44,border:'1.5px solid var(--border-2)',borderRadius:9,padding:'0 14px',fontSize:17,fontWeight:700,color:'var(--text)',background:'var(--bg-card)',outline:'none',fontFamily:"'Space Grotesk',sans-serif",boxSizing:'border-box'}}/></div>))}
      </>}
      right={<>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:14}}>
          {[{l:'Cost per use',v:`$${cpu.toFixed(3)}`},{l:'Cost per day',v:`$${perDay.toFixed(2)}`},{l:'Total cost',v:`$${cost.toFixed(2)}`},{l:'Total uses',v:`${uses}`}].map((m,i)=>(<div key={i} style={{padding:'12px 14px',background:'var(--bg-raised)',borderRadius:10,border:'0.5px solid var(--border)'}}><div style={{fontSize:10,color:'var(--text-3)',marginBottom:4}}>{m.l}</div><div style={{fontSize:18,fontWeight:700,color:i<2?C:'var(--text)',fontFamily:"'Space Grotesk',sans-serif"}}>{m.v}</div></div>))}
        </div>
        <div style={{padding:'12px 14px',background:'var(--bg-raised)',borderRadius:10,border:'0.5px solid var(--border)',marginBottom:14}}>
          <p style={{margin:0,fontSize:12.5,color:'var(--text-2)',lineHeight:1.65,fontFamily:"'DM Sans',sans-serif"}}>
            {cpu<1?'Under $1/use — excellent value for money.':cpu<5?'$1–5/use — reasonable for a quality item.':cpu<20?'$5–20/use — consider whether you\'ll actually use it this often.':'Over $20/use — be sure this purchase is worth it.'}
          </p>
        </div>
        <AIHintCard hint={hint}/>
      </>}
    />
    <Sec title="FAQ">{FAQ.map((f,i)=><Acc key={i} q={f.q} a={f.a} open={openFaq===i} onToggle={()=>setOpenFaq(openFaq===i?null:i)} color={C}/>)}</Sec>
  </div>)
}
