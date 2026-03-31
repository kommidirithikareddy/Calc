import { useState, useMemo } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'
function Sec({title,sub,children}){return(<div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,overflow:'hidden'}}><div style={{padding:'13px 18px',borderBottom:'0.5px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center'}}><span style={{fontSize:13,fontWeight:700,color:'var(--text)',fontFamily:"'Space Grotesk',sans-serif"}}>{title}</span>{sub&&<span style={{fontSize:11,color:'var(--text-3)'}}>{sub}</span>}</div><div style={{padding:'16px 18px'}}>{children}</div></div>)}function Acc({q,a,open,onToggle,color}){return(<div style={{borderBottom:'0.5px solid var(--border)'}}><button onClick={onToggle} style={{width:'100%',display:'flex',justifyContent:'space-between',alignItems:'center',padding:'13px 0',background:'none',border:'none',cursor:'pointer',gap:12,textAlign:'left'}}><span style={{fontSize:13,fontWeight:600,color:'var(--text)',fontFamily:"'DM Sans',sans-serif",lineHeight:1.4}}>{q}</span><span style={{fontSize:18,color,flexShrink:0,display:'inline-block',transform:open?'rotate(45deg)':'none',transition:'transform .2s'}}>+</span></button>{open&&<p style={{fontSize:12.5,color:'var(--text-2)',lineHeight:1.75,margin:'0 0 13px',fontFamily:"'DM Sans',sans-serif"}}>{a}</p>}</div>)}
const FAQ=[{q:'Does age difference matter in relationships?',a:'Research shows age difference effects vary by context. For work relationships, age gaps rarely affect collaboration. For romantic relationships, large age gaps can correlate with differences in life stage, cultural references, and long-term goals — though many couples navigate these successfully.'},{q:'How is age difference calculated?',a:'Age difference is the absolute value of the difference between two birth dates, expressed in years, months, and days. This calculator gives the precise calendar difference including leap years.'}]
export default function AgeDifferenceCalculator({meta,category}){
  const C=category?.color||'#0d9488'
  const [d1,setD1]=useState('')
  const [d2,setD2]=useState('')
  const [n1,setN1]=useState('Person 1')
  const [n2,setN2]=useState('Person 2')
  const [openFaq,setOpenFaq]=useState(null)
  const diff=useMemo(()=>{
    if(!d1||!d2)return null
    const a=new Date(d1),b=new Date(d2)
    if(isNaN(a)||isNaN(b))return null
    const older=a<b?a:b,younger=a<b?b:a
    const days=Math.floor((younger-older)/86400000)
    const years=younger.getFullYear()-older.getFullYear()
    return{days,years,months:Math.floor(days/30.44),totalMonths:years*12+younger.getMonth()-older.getMonth(),older:a<b?n1:n2,younger:a<b?n2:n1}
  },[d1,d2,n1,n2])
  const hint=diff?`${diff.older} is older by ${diff.years} years, ${diff.months} months, ${diff.days} days.`:''
  return(<div style={{display:'flex',flexDirection:'column',gap:20}}>
    <div style={{background:`linear-gradient(135deg,${C}12,${C}06)`,border:`1px solid ${C}30`,borderRadius:14,padding:'16px 20px'}}><div style={{fontSize:10,fontWeight:700,color:C,textTransform:'uppercase',letterSpacing:'.08em',marginBottom:6}}>Age Difference</div><div style={{fontSize:18,fontWeight:700,color:C,fontFamily:"'Space Grotesk',sans-serif"}}>Exact years, months, and days between two dates</div></div>
    <CalcShell
      left={<>
        {[[n1,setN1,d1,setD1],[n2,setN2,d2,setD2]].map(([name,setName,date,setDate],i)=>(<div key={i} style={{marginBottom:16}}>
          <input value={name} onChange={e=>setName(e.target.value)} style={{width:'100%',height:38,border:'1px solid var(--border-2)',borderRadius:7,padding:'0 10px',fontSize:13,background:'var(--bg-card)',color:'var(--text)',fontFamily:"'DM Sans',sans-serif",boxSizing:'border-box',marginBottom:8}}/>
          <label style={{fontSize:12,color:'var(--text-3)',display:'block',marginBottom:4}}>Date of birth</label>
          <input type="date" value={date} onChange={e=>setDate(e.target.value)} style={{width:'100%',height:44,border:'1.5px solid var(--border-2)',borderRadius:9,padding:'0 14px',fontSize:15,color:'var(--text)',background:'var(--bg-card)',outline:'none',boxSizing:'border-box'}}/>
        </div>))}
      </>}
      right={<>
        {diff?(<>
          <div style={{background:'var(--bg-card)',border:`1.5px solid ${C}30`,borderRadius:14,padding:'18px 20px',marginBottom:14}}>
            <div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:8}}>Age difference</div>
            <div style={{fontSize:48,fontWeight:700,color:C,fontFamily:"'Space Grotesk',sans-serif",lineHeight:1}}>{diff.years}</div>
            <div style={{fontSize:14,color:'var(--text-3)',marginTop:4}}>years apart</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginTop:14}}>
              {[{l:'Total months',v:diff.totalMonths},{l:'Total days',v:diff.days.toLocaleString()}].map((m,i)=>(<div key={i} style={{padding:'10px',background:'var(--bg-raised)',borderRadius:9,textAlign:'center'}}><div style={{fontSize:18,fontWeight:700,color:'var(--text)',fontFamily:"'Space Grotesk',sans-serif"}}>{m.v}</div><div style={{fontSize:11,color:'var(--text-3)',marginTop:2}}>{m.l}</div></div>))}
            </div>
          </div>
          <AIHintCard hint={hint}/>
        </>):<div style={{padding:'40px 20px',textAlign:'center',color:'var(--text-3)',fontSize:13}}>Enter two dates to calculate age difference</div>}
      </>}
    />
    <Sec title="FAQ">{FAQ.map((f,i)=><Acc key={i} q={f.q} a={f.a} open={openFaq===i} onToggle={()=>setOpenFaq(openFaq===i?null:i)} color={C}/>)}</Sec>
  </div>)
}
