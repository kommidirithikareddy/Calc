import { useState, useMemo } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'
function Sec({title,sub,children}){return(<div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,overflow:'hidden'}}><div style={{padding:'13px 18px',borderBottom:'0.5px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center'}}><span style={{fontSize:13,fontWeight:700,color:'var(--text)',fontFamily:"'Space Grotesk',sans-serif"}}>{title}</span>{sub&&<span style={{fontSize:11,color:'var(--text-3)'}}>{sub}</span>}</div><div style={{padding:'16px 18px'}}>{children}</div></div>)}function Acc({q,a,open,onToggle,color}){return(<div style={{borderBottom:'0.5px solid var(--border)'}}><button onClick={onToggle} style={{width:'100%',display:'flex',justifyContent:'space-between',alignItems:'center',padding:'13px 0',background:'none',border:'none',cursor:'pointer',gap:12,textAlign:'left'}}><span style={{fontSize:13,fontWeight:600,color:'var(--text)',fontFamily:"'DM Sans',sans-serif",lineHeight:1.4}}>{q}</span><span style={{fontSize:18,color,flexShrink:0,display:'inline-block',transform:open?'rotate(45deg)':'none',transition:'transform .2s'}}>+</span></button>{open&&<p style={{fontSize:12.5,color:'var(--text-2)',lineHeight:1.75,margin:'0 0 13px',fontFamily:"'DM Sans',sans-serif"}}>{a}</p>}</div>)}
const FAQ=[{q:'What makes a password strong?',a:'Length is the most important factor — every extra character multiplies the search space. After length, diversity matters: using all four character classes (lowercase, uppercase, digits, symbols) maximises entropy. Avoid dictionary words, names, and predictable substitutions like @ for a.'},{q:'What is password entropy?',a:'Entropy measures how unpredictable a password is, in bits. Each bit doubles the number of possible passwords an attacker must try. A 60-bit entropy password requires 2^60 ≈ 1 quintillion guesses to crack by brute force — practically impossible with current computing.'},{q:'Should I use a password manager?',a:'Yes. Password managers let you use a unique, long, random password for every site without memorising them. A single strong master password protects everything. This is the single biggest security upgrade most people can make.'}]
export default function PasswordStrength({meta,category}){
  const C=category?.color||'#0d9488'
  const [pw,setPw]=useState('')
  const [show,setShow]=useState(false)
  const [openFaq,setOpenFaq]=useState(null)
  const analysis=useMemo(()=>{
    if(!pw)return null
    const has={lower:/[a-z]/.test(pw),upper:/[A-Z]/.test(pw),digit:/\d/.test(pw),symbol:/[^a-zA-Z0-9]/.test(pw),len12:pw.length>=12,len16:pw.length>=16}
    const charset=(has.lower?26:0)+(has.upper?26:0)+(has.digit?10:0)+(has.symbol?32:0)
    const entropy=pw.length*Math.log2(Math.max(charset,1))
    const score=[has.lower,has.upper,has.digit,has.symbol,has.len12,has.len16].filter(Boolean).length
    const strength=score<=2?{l:'Weak',c:'#ef4444',pct:20}:score<=3?{l:'Fair',c:'#f59e0b',pct:45}:score<=4?{l:'Good',c:'#3b82f6',pct:70}:score<=5?{l:'Strong',c:'#10b981',pct:90}:{l:'Very strong',c:'#10b981',pct:100}
    const crackTime=entropy<40?'Under a minute':entropy<60?'Hours to days':entropy<80?'Centuries':'Effectively unbreakable'
    const tips=[]
    if(!has.upper)tips.push('Add uppercase letters')
    if(!has.digit)tips.push('Include numbers')
    if(!has.symbol)tips.push('Add symbols (!, @, #...)')
    if(!has.len12)tips.push('Use at least 12 characters')
    return{has,strength,crackTime,entropy:entropy.toFixed(0),tips}
  },[pw])
  const hint=analysis?`Password: ${analysis.strength.l}, ${analysis.entropy} bits entropy, time to crack: ${analysis.crackTime}.`:''
  return(<div style={{display:'flex',flexDirection:'column',gap:20}}>
    <div style={{background:`linear-gradient(135deg,${C}12,${C}06)`,border:`1px solid ${C}30`,borderRadius:14,padding:'16px 20px'}}><div style={{fontSize:10,fontWeight:700,color:C,textTransform:'uppercase',letterSpacing:'.08em',marginBottom:6}}>Password Strength</div><div style={{fontSize:18,fontWeight:700,color:C,fontFamily:"'Space Grotesk',sans-serif"}}>Entropy · Crack time · Character analysis</div></div>
    <CalcShell
      left={<>
        <div style={{marginBottom:16}}>
          <label style={{fontSize:12.5,fontWeight:600,color:'var(--text)',fontFamily:"'DM Sans',sans-serif",display:'block',marginBottom:6}}>Enter password</label>
          <div style={{position:'relative'}}>
            <input type={show?'text':'password'} value={pw} onChange={e=>setPw(e.target.value)} placeholder="Type your password…" style={{width:'100%',height:44,border:'1.5px solid var(--border-2)',borderRadius:9,padding:'0 60px 0 14px',fontSize:15,color:'var(--text)',background:'var(--bg-card)',outline:'none',fontFamily:'monospace',boxSizing:'border-box'}}/>
            <button onClick={()=>setShow(!show)} style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'var(--text-3)',fontSize:12,fontWeight:600}}>{show?'Hide':'Show'}</button>
          </div>
          <div style={{fontSize:11,color:'var(--text-3)',marginTop:4}}>{pw.length} characters</div>
        </div>
        {analysis&&(<>
          <div style={{marginBottom:14}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}><span style={{fontSize:12,color:'var(--text-2)'}}>Strength</span><span style={{fontSize:12,fontWeight:700,color:analysis.strength.c}}>{analysis.strength.l}</span></div>
            <div style={{height:8,background:'var(--border)',borderRadius:4,overflow:'hidden'}}><div style={{height:'100%',width:`${analysis.strength.pct}%`,background:analysis.strength.c,borderRadius:4,transition:'width .4s'}}/></div>
          </div>
          <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
            {[{l:'Lowercase',ok:analysis.has.lower},{l:'Uppercase',ok:analysis.has.upper},{l:'Numbers',ok:analysis.has.digit},{l:'Symbols',ok:analysis.has.symbol},{l:'12+ chars',ok:analysis.has.len12},{l:'16+ chars',ok:analysis.has.len16}].map(c=>(<span key={c.l} style={{fontSize:11,padding:'3px 10px',borderRadius:20,background:c.ok?'#d1fae5':'var(--bg-raised)',color:c.ok?'#065f46':'var(--text-3)',border:`0.5px solid ${c.ok?'#bbf7d0':'var(--border)'}`}}>{c.ok?'✓':'○'} {c.l}</span>))}
          </div>
        </>)}
      </>}
      right={<>
        {analysis?(<>
          <div style={{background:'var(--bg-card)',border:`1.5px solid ${analysis.strength.c}40`,borderRadius:14,padding:'18px 20px',marginBottom:14}}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
              {[{l:'Entropy',v:`${analysis.entropy} bits`},{l:'Strength',v:analysis.strength.l},{l:'Length',v:`${pw.length} chars`},{l:'Time to crack',v:analysis.crackTime}].map((m,i)=>(<div key={i} style={{padding:'10px 12px',background:'var(--bg-raised)',borderRadius:9}}><div style={{fontSize:10,color:'var(--text-3)',marginBottom:4}}>{m.l}</div><div style={{fontSize:13,fontWeight:700,color:i===0?analysis.strength.c:'var(--text)',fontFamily:"'Space Grotesk',sans-serif"}}>{m.v}</div></div>))}
            </div>
            {analysis.tips.length>0&&<div style={{marginTop:14,padding:'10px 13px',background:'#fef3c720',borderRadius:9,border:'0.5px solid #f59e0b30'}}><div style={{fontSize:11,fontWeight:700,color:'#92400e',marginBottom:6}}>IMPROVEMENTS</div>{analysis.tips.map((t,i)=>(<div key={i} style={{fontSize:12,color:'var(--text-2)',marginBottom:3}}>→ {t}</div>))}</div>}
          </div>
          <AIHintCard hint={hint}/>
        </>):<div style={{padding:'40px 20px',textAlign:'center',color:'var(--text-3)',fontSize:13}}>Start typing to analyze your password</div>}
      </>}
    />
    <Sec title="FAQ">{FAQ.map((f,i)=><Acc key={i} q={f.q} a={f.a} open={openFaq===i} onToggle={()=>setOpenFaq(openFaq===i?null:i)} color={C}/>)}</Sec>
  </div>)
}
