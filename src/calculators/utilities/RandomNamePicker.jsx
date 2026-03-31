import { useState, useMemo } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'
function Sec({title,sub,children}){return(<div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,overflow:'hidden'}}><div style={{padding:'13px 18px',borderBottom:'0.5px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center'}}><span style={{fontSize:13,fontWeight:700,color:'var(--text)',fontFamily:"'Space Grotesk',sans-serif"}}>{title}</span>{sub&&<span style={{fontSize:11,color:'var(--text-3)'}}>{sub}</span>}</div><div style={{padding:'16px 18px'}}>{children}</div></div>)}function Acc({q,a,open,onToggle,color}){return(<div style={{borderBottom:'0.5px solid var(--border)'}}><button onClick={onToggle} style={{width:'100%',display:'flex',justifyContent:'space-between',alignItems:'center',padding:'13px 0',background:'none',border:'none',cursor:'pointer',gap:12,textAlign:'left'}}><span style={{fontSize:13,fontWeight:600,color:'var(--text)',fontFamily:"'DM Sans',sans-serif",lineHeight:1.4}}>{q}</span><span style={{fontSize:18,color,flexShrink:0,display:'inline-block',transform:open?'rotate(45deg)':'none',transition:'transform .2s'}}>+</span></button>{open&&<p style={{fontSize:12.5,color:'var(--text-2)',lineHeight:1.75,margin:'0 0 13px',fontFamily:"'DM Sans',sans-serif"}}>{a}</p>}</div>)}
const FAQ=[{q:'Is the selection truly random?',a:'Yes — the picker uses Math.random(), which provides cryptographically non-deterministic pseudorandom numbers. For very high-stakes draws, consider a dedicated random.org service which uses atmospheric noise.'},{q:'Can I use this for classroom attendance or team selection?',a:'Absolutely. Enter all student or team member names (one per line), set how many winners you need, and click Pick. The result is fair and unbiased. You can re-run as many times as needed.'}]
export default function RandomNamePicker({meta,category}){
  const C=category?.color||'#0d9488'
  const [input,setInput]=useState('Alice\nBob\nCarol\nDave\nEve')
  const [count,setCount]=useState(1)
  const [winners,setWinners]=useState([])
  const [spinning,setSpinning]=useState(false)
  const [openFaq,setOpenFaq]=useState(null)
  const names=input.split('\n').map(s=>s.trim()).filter(Boolean)
  const pick=()=>{
    if(!names.length)return
    setSpinning(true);setWinners([])
    let i=0
    const iv=setInterval(()=>{i++;if(i>14){clearInterval(iv);const pool=[...names],picked=[]
      for(let j=0;j<Math.min(count,pool.length);j++){const idx=Math.floor(Math.random()*pool.length);picked.push(pool.splice(idx,1)[0])}
      setWinners(picked);setSpinning(false)}},70)
  }
  const hint=winners.length?`Selected: ${winners.join(', ')} from ${names.length} names.`:''
  return(<div style={{display:'flex',flexDirection:'column',gap:20}}>
    <div style={{background:`linear-gradient(135deg,${C}12,${C}06)`,border:`1px solid ${C}30`,borderRadius:14,padding:'16px 20px'}}><div style={{fontSize:10,fontWeight:700,color:C,textTransform:'uppercase',letterSpacing:'.08em',marginBottom:6}}>Random Name Picker</div><div style={{fontSize:18,fontWeight:700,color:C,fontFamily:"'Space Grotesk',sans-serif"}}>Fair, unbiased random selection from any list</div></div>
    <CalcShell
      left={<>
        <div style={{marginBottom:16}}><label style={{fontSize:12.5,fontWeight:600,color:'var(--text)',fontFamily:"'DM Sans',sans-serif",display:'block',marginBottom:6}}>Names (one per line)</label><textarea value={input} onChange={e=>setInput(e.target.value)} style={{width:'100%',height:160,border:'1.5px solid var(--border-2)',borderRadius:9,padding:'10px 14px',fontSize:14,color:'var(--text)',background:'var(--bg-card)',outline:'none',fontFamily:"'DM Sans',sans-serif",resize:'vertical',boxSizing:'border-box'}}/><div style={{fontSize:11,color:'var(--text-3)',marginTop:4}}>{names.length} name{names.length!==1?'s':''} in pool</div></div>
        <div style={{marginBottom:16}}><label style={{fontSize:12.5,fontWeight:600,color:'var(--text)',fontFamily:"'DM Sans',sans-serif",display:'block',marginBottom:6}}>Pick how many winners</label><input type="number" min="1" max={names.length||1} value={count} onChange={e=>setCount(Math.max(1,+e.target.value))} style={{width:'100%',height:44,border:'1.5px solid var(--border-2)',borderRadius:9,padding:'0 14px',fontSize:17,fontWeight:700,color:'var(--text)',background:'var(--bg-card)',outline:'none',fontFamily:"'Space Grotesk',sans-serif",boxSizing:'border-box'}}/></div>
        <button onClick={pick} disabled={!names.length||spinning} style={{width:'100%',height:48,borderRadius:10,background:C,color:'#fff',border:'none',fontSize:16,fontWeight:700,cursor:'pointer',fontFamily:"'Space Grotesk',sans-serif",opacity:!names.length||spinning?0.6:1}}>{spinning?'Picking…':'🎲 Pick!'}</button>
      </>}
      right={<>
        {winners.length>0&&!spinning?(<div style={{background:'var(--bg-card)',border:`1.5px solid ${C}30`,borderRadius:14,padding:'18px 20px',marginBottom:14,textAlign:'center'}}>
          <div style={{fontSize:12,color:'var(--text-3)',marginBottom:14,fontWeight:600}}>{winners.length>1?`${winners.length} winners`:'Winner'}</div>
          {winners.map((w,i)=>(<div key={i} style={{fontSize:28,fontWeight:700,color:C,fontFamily:"'Space Grotesk',sans-serif",marginBottom:8}}>🎉 {w}</div>))}
          <button onClick={pick} style={{marginTop:10,padding:'8px 20px',borderRadius:8,border:`1px solid ${C}`,background:'transparent',color:C,fontSize:13,fontWeight:600,cursor:'pointer'}}>Pick again</button>
        </div>):<div style={{padding:'60px 20px',textAlign:'center',color:'var(--text-3)',fontSize:14,fontFamily:"'DM Sans',sans-serif"}}>Your winner will appear here</div>}
        {hint&&<AIHintCard hint={hint}/>}
      </>}
    />
    <Sec title="FAQ">{FAQ.map((f,i)=><Acc key={i} q={f.q} a={f.a} open={openFaq===i} onToggle={()=>setOpenFaq(openFaq===i?null:i)} color={C}/>)}</Sec>
  </div>)
}
