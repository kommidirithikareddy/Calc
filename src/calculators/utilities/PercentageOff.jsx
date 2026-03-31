import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'
function Acc({q,a,open,onToggle,color}){return(<div style={{borderBottom:'0.5px solid var(--border)'}}><button onClick={onToggle} style={{width:'100%',display:'flex',justifyContent:'space-between',alignItems:'center',padding:'13px 0',background:'none',border:'none',cursor:'pointer',gap:12,textAlign:'left'}}><span style={{fontSize:13,fontWeight:600,color:'var(--text)',fontFamily:"'DM Sans',sans-serif",lineHeight:1.4}}>{q}</span><span style={{fontSize:18,color,flexShrink:0,display:'inline-block',transform:open?'rotate(45deg)':'none',transition:'transform .2s'}}>+</span></button>{open&&<p style={{fontSize:12.5,color:'var(--text-2)',lineHeight:1.75,margin:'0 0 13px',fontFamily:"'DM Sans',sans-serif"}}>{a}</p>}</div>)}
const FAQ=[{q:'How do I calculate percentage off in my head?',a:'Quick trick: 10% of any price is just move the decimal one place left. For 20% off: double 10%. For 15% off: find 10% then add half of that. Example: 15% off $80 = $8 + $4 = $12 off, so $68.'},{q:'Is percentage off the same as percentage saved?',a:'Yes — they are the same thing. "15% off" means you save 15% of the original price. It is calculated as: Saving = Original × (Discount% ÷ 100).'}]
export default function PercentageOff({meta,category}){
  const C=category?.color||'#0d9488'
  const [orig,setOrig]=useState(120)
  const [sale,setSale]=useState(90)
  const [openFaq,setOpenFaq]=useState(null)
  const saving=orig-sale, pct=orig>0?saving/orig*100:0
  const hint=`Original $${orig.toFixed(2)}, sale $${sale.toFixed(2)} = ${pct.toFixed(1)}% off, saving $${saving.toFixed(2)}.`
  return(<div style={{display:'flex',flexDirection:'column',gap:20}}>
    <div style={{background:`linear-gradient(135deg,${C}12,${C}06)`,border:`1px solid ${C}30`,borderRadius:14,padding:'16px 20px',display:'flex',justifyContent:'space-between',alignItems:'center',gap:16,flexWrap:'wrap'}}>
      <div><div style={{fontSize:10,fontWeight:700,color:C,textTransform:'uppercase',letterSpacing:'.08em',marginBottom:6}}>Formula</div><div style={{fontSize:18,fontWeight:700,color:C,fontFamily:"'Space Grotesk',sans-serif"}}>% Off = ((Original − Sale) ÷ Original) × 100</div></div>
      <div style={{padding:'8px 18px',background:C+'15',borderRadius:10,fontSize:28,fontWeight:700,color:C,fontFamily:"'Space Grotesk',sans-serif"}}>{pct.toFixed(1)}%</div>
    </div>
    <CalcShell
      left={<>
        <div style={{marginBottom:16}}><label style={{fontSize:12.5,fontWeight:600,color:'var(--text)',fontFamily:"'DM Sans',sans-serif",display:'block',marginBottom:6}}>Original price ($)</label><input type="number" value={orig} onChange={e=>setOrig(Math.max(0,+e.target.value))} style={{width:'100%',height:44,border:'1.5px solid var(--border-2)',borderRadius:9,padding:'0 14px',fontSize:17,fontWeight:700,color:'var(--text)',background:'var(--bg-card)',outline:'none',fontFamily:"'Space Grotesk',sans-serif",boxSizing:'border-box'}}/></div>
        <div style={{marginBottom:16}}><label style={{fontSize:12.5,fontWeight:600,color:'var(--text)',fontFamily:"'DM Sans',sans-serif",display:'block',marginBottom:6}}>Sale / final price ($)</label><input type="number" value={sale} onChange={e=>setSale(Math.max(0,+e.target.value))} style={{width:'100%',height:44,border:'1.5px solid var(--border-2)',borderRadius:9,padding:'0 14px',fontSize:17,fontWeight:700,color:'var(--text)',background:'var(--bg-card)',outline:'none',fontFamily:"'Space Grotesk',sans-serif",boxSizing:'border-box'}}/></div>
      </>}
      right={<>
        <div style={{background:'var(--bg-card)',border:`1.5px solid ${C}30`,borderRadius:14,padding:'18px 20px',marginBottom:14}}>
          <div style={{fontSize:52,fontWeight:700,color:C,fontFamily:"'Space Grotesk',sans-serif",lineHeight:1}}>{pct.toFixed(1)}%</div>
          <div style={{fontSize:13,color:'var(--text-3)',marginTop:4}}>off the original price</div>
          <div style={{marginTop:12,fontSize:18,fontWeight:700,color:'var(--text)',fontFamily:"'Space Grotesk',sans-serif"}}>You save ${saving.toFixed(2)}</div>
          <div style={{marginTop:10,padding:'10px 12px',background:pct>=30?'#d1fae5':pct>=20?'#dbeafe':'#fef3c7',borderRadius:9,fontSize:12,fontWeight:600,color:pct>=30?'#065f46':pct>=20?'#1e40af':'#92400e'}}>{pct>=40?'Excellent deal!':pct>=25?'Great deal':pct>=15?'Good deal':'Modest saving'}</div>
        </div>
        <BreakdownTable title="Summary" rows={[{label:'Original',value:`$${orig.toFixed(2)}`},{label:'Sale price',value:`$${sale.toFixed(2)}`},{label:'You save',value:`$${saving.toFixed(2)}`,color:C},{label:'Percentage off',value:`${pct.toFixed(2)}%`,bold:true,highlight:true,color:C}]}/>
        <AIHintCard hint={hint}/>
      </>}
    />
    <div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,overflow:'hidden'}}><div style={{padding:'13px 18px',borderBottom:'0.5px solid var(--border)'}}><span style={{fontSize:13,fontWeight:700,color:'var(--text)',fontFamily:"'Space Grotesk',sans-serif"}}>FAQ</span></div><div style={{padding:'0 18px'}}>{FAQ.map((f,i)=><Acc key={i} q={f.q} a={f.a} open={openFaq===i} onToggle={()=>setOpenFaq(openFaq===i?null:i)} color={C}/>)}</div></div>
  </div>)
}
