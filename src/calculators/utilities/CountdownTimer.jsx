import { useState, useMemo } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'
function Sec({title,sub,children}){return(<div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,overflow:'hidden'}}><div style={{padding:'13px 18px',borderBottom:'0.5px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center'}}><span style={{fontSize:13,fontWeight:700,color:'var(--text)',fontFamily:"'Space Grotesk',sans-serif"}}>{title}</span>{sub&&<span style={{fontSize:11,color:'var(--text-3)'}}>{sub}</span>}</div><div style={{padding:'16px 18px'}}>{children}</div></div>)}function Acc({q,a,open,onToggle,color}){return(<div style={{borderBottom:'0.5px solid var(--border)'}}><button onClick={onToggle} style={{width:'100%',display:'flex',justifyContent:'space-between',alignItems:'center',padding:'13px 0',background:'none',border:'none',cursor:'pointer',gap:12,textAlign:'left'}}><span style={{fontSize:13,fontWeight:600,color:'var(--text)',fontFamily:"'DM Sans',sans-serif",lineHeight:1.4}}>{q}</span><span style={{fontSize:18,color,flexShrink:0,display:'inline-block',transform:open?'rotate(45deg)':'none',transition:'transform .2s'}}>+</span></button>{open&&<p style={{fontSize:12.5,color:'var(--text-2)',lineHeight:1.75,margin:'0 0 13px',fontFamily:"'DM Sans',sans-serif"}}>{a}</p>}</div>)}
const FAQ=[{q:'How accurate is this countdown?',a:'The calculator computes the exact difference in days, hours, and minutes from right now to your target date. For live countdowns that tick in real-time, you would need to refresh the page or use a dedicated countdown app.'},{q:'Can I count days to a past date?',a:'Yes — if your target date is in the past, the calculator shows how long ago that event was, displayed as elapsed time.'}]
export default function CountdownTimer({meta,category}){
  const C=category?.color||'#0d9488'
  const [target,setTarget]=useState('')
  const [label,setLabel]=useState('My Event')
  const [openFaq,setOpenFaq]=useState(null)
  const diff=useMemo(()=>{
    if(!target)return null
    const now=new Date(),then=new Date(target)
    if(isNaN(then))return null
    const ms=then-now,past=ms<0,abs=Math.abs(ms)
    const days=Math.floor(abs/86400000)
    const hours=Math.floor((abs%86400000)/3600000)
    const mins=Math.floor((abs%3600000)/60000)
    return{days,hours,mins,weeks:Math.floor(days/7),months:Math.floor(days/30.44),past}
  },[target])
  const hint=diff?`${label}: ${diff.past?'passed':'in'} ${diff.days} days, ${diff.hours} hours, ${diff.mins} minutes.`:''
  return(<div style={{display:'flex',flexDirection:'column',gap:20}}>
    <div style={{background:`linear-gradient(135deg,${C}12,${C}06)`,border:`1px solid ${C}30`,borderRadius:14,padding:'16px 20px'}}><div style={{fontSize:10,fontWeight:700,color:C,textTransform:'uppercase',letterSpacing:'.08em',marginBottom:6}}>Countdown</div><div style={{fontSize:18,fontWeight:700,color:C,fontFamily:"'Space Grotesk',sans-serif"}}>Days · Hours · Minutes until your date</div></div>
    <CalcShell
      left={<>
        <div style={{marginBottom:16}}><label style={{fontSize:12.5,fontWeight:600,color:'var(--text)',fontFamily:"'DM Sans',sans-serif",display:'block',marginBottom:6}}>Event name</label><input value={label} onChange={e=>setLabel(e.target.value)} style={{width:'100%',height:44,border:'1.5px solid var(--border-2)',borderRadius:9,padding:'0 14px',fontSize:15,color:'var(--text)',background:'var(--bg-card)',outline:'none',fontFamily:"'DM Sans',sans-serif",boxSizing:'border-box'}}/></div>
        <div style={{marginBottom:16}}><label style={{fontSize:12.5,fontWeight:600,color:'var(--text)',fontFamily:"'DM Sans',sans-serif",display:'block',marginBottom:6}}>Target date & time</label><input type="datetime-local" value={target} onChange={e=>setTarget(e.target.value)} style={{width:'100%',height:44,border:'1.5px solid var(--border-2)',borderRadius:9,padding:'0 14px',fontSize:15,color:'var(--text)',background:'var(--bg-card)',outline:'none',boxSizing:'border-box'}}/></div>
        <div style={{marginBottom:14}}><label style={{fontSize:12.5,fontWeight:600,color:'var(--text)',fontFamily:"'DM Sans',sans-serif",display:'block',marginBottom:8}}>Quick dates</label>
          {[['New Year',`${new Date().getFullYear()+1}-01-01T00:00`],['Christmas',`${new Date().getFullYear()}-12-25T00:00`],['Summer',`${new Date().getFullYear()}-06-21T00:00`]].map(([l,v])=>(<button key={l} onClick={()=>{setLabel(l);setTarget(v)}} style={{display:'block',width:'100%',padding:'8px 12px',borderRadius:8,border:'1px solid var(--border-2)',background:'var(--bg-raised)',cursor:'pointer',textAlign:'left',marginBottom:6,fontSize:12,color:'var(--text)',fontFamily:"'DM Sans',sans-serif"}}>{l}</button>))}
        </div>
      </>}
      right={<>
        {diff?(<>
          <div style={{background:'var(--bg-card)',border:`1.5px solid ${C}30`,borderRadius:14,padding:'18px 20px',marginBottom:14}}>
            <div style={{fontSize:13,fontWeight:700,color:C,marginBottom:12,fontFamily:"'Space Grotesk',sans-serif"}}>{label} {diff.past?'(passed)':''}</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              {[{l:'Days',v:diff.days},{l:'Hours',v:diff.hours},{l:'Minutes',v:diff.mins},{l:'Weeks',v:diff.weeks}].map((m,i)=>(<div key={i} style={{padding:'12px',background:'var(--bg-raised)',borderRadius:10,textAlign:'center'}}><div style={{fontSize:28,fontWeight:700,color:i===0?C:'var(--text)',fontFamily:"'Space Grotesk',sans-serif"}}>{m.v}</div><div style={{fontSize:11,color:'var(--text-3)',marginTop:2}}>{m.l}</div></div>))}
            </div>
            <div style={{marginTop:12,padding:'10px 13px',background:C+'08',borderRadius:9,fontSize:12,color:'var(--text-2)'}}>≈ {diff.months} months {diff.past?'ago':'away'}</div>
          </div>
          <AIHintCard hint={hint}/>
        </>):<div style={{padding:'40px 20px',textAlign:'center',color:'var(--text-3)',fontSize:13}}>Select a date to see your countdown</div>}
      </>}
    />
    <Sec title="FAQ">{FAQ.map((f,i)=><Acc key={i} q={f.q} a={f.a} open={openFaq===i} onToggle={()=>setOpenFaq(openFaq===i?null:i)} color={C}/>)}</Sec>
  </div>)
}
