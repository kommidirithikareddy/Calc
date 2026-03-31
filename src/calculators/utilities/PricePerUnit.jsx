import { useState, useMemo } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'
function Sec({title,sub,children}){return(<div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,overflow:'hidden'}}><div style={{padding:'13px 18px',borderBottom:'0.5px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center'}}><span style={{fontSize:13,fontWeight:700,color:'var(--text)',fontFamily:"'Space Grotesk',sans-serif"}}>{title}</span>{sub&&<span style={{fontSize:11,color:'var(--text-3)'}}>{sub}</span>}</div><div style={{padding:'16px 18px'}}>{children}</div></div>)}function Acc({q,a,open,onToggle,color}){return(<div style={{borderBottom:'0.5px solid var(--border)'}}><button onClick={onToggle} style={{width:'100%',display:'flex',justifyContent:'space-between',alignItems:'center',padding:'13px 0',background:'none',border:'none',cursor:'pointer',gap:12,textAlign:'left'}}><span style={{fontSize:13,fontWeight:600,color:'var(--text)',fontFamily:"'DM Sans',sans-serif",lineHeight:1.4}}>{q}</span><span style={{fontSize:18,color,flexShrink:0,display:'inline-block',transform:open?'rotate(45deg)':'none',transition:'transform .2s'}}>+</span></button>{open&&<p style={{fontSize:12.5,color:'var(--text-2)',lineHeight:1.75,margin:'0 0 13px',fontFamily:"'DM Sans',sans-serif"}}>{a}</p>}</div>)}
const FAQ=[{q:'Why compare price per unit instead of total price?',a:'Total price is misleading when package sizes differ. A 500g bag of coffee for $12 and a 1kg bag for $20 look similar — but per 100g the small bag costs $2.40 while the large bag costs $2.00. You save 20% by buying the larger size.'},{q:'What counts as a unit?',a:'A unit is whatever makes sense for that product: per ounce or gram for food, per sheet for paper towels, per load for detergent, per count for vitamins. Always compare the same unit type.'}]
export default function PricePerUnit({meta,category}){
  const C=category?.color||'#0d9488'
  const [items,setItems]=useState([{name:'Brand A',price:4.99,qty:16,unit:'oz'},{name:'Brand B',price:7.49,qty:32,unit:'oz'}])
  const [openFaq,setOpenFaq]=useState(null)
  const results=items.map(it=>({...it,ppu:it.qty>0?it.price/it.qty:null}))
  const minPPU=Math.min(...results.filter(r=>r.ppu).map(r=>r.ppu))
  const update=(i,f,v)=>{const n=[...items];n[i]={...n[i],[f]:v};setItems(n)}
  const hint=`Best value: ${results.find(r=>r.ppu===minPPU)?.name||''} at $${minPPU?.toFixed(4)||'—'} per ${items[0]?.unit||'unit'}.`
  return(<div style={{display:'flex',flexDirection:'column',gap:20}}>
    <div style={{background:`linear-gradient(135deg,${C}12,${C}06)`,border:`1px solid ${C}30`,borderRadius:14,padding:'16px 20px'}}><div style={{fontSize:10,fontWeight:700,color:C,textTransform:'uppercase',letterSpacing:'.08em',marginBottom:6}}>Formula</div><div style={{fontSize:18,fontWeight:700,color:C,fontFamily:"'Space Grotesk',sans-serif"}}>Price Per Unit = Total Price ÷ Quantity</div></div>
    <Sec title="Compare products" sub="Add up to 5 items">
      {results.map((it,i)=>(<div key={i} style={{background:'var(--bg-raised)',borderRadius:10,padding:'12px 14px',marginBottom:10,border:`${it.ppu===minPPU&&it.ppu?`1.5px solid ${C}`:'0.5px solid var(--border)'}`}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
          <input value={it.name} onChange={e=>update(i,'name',e.target.value)} style={{flex:1,height:34,border:'1px solid var(--border-2)',borderRadius:7,padding:'0 10px',fontSize:13,background:'var(--bg-card)',color:'var(--text)',fontFamily:"'DM Sans',sans-serif"}}/>
          {it.ppu===minPPU&&it.ppu&&<span style={{marginLeft:10,padding:'2px 10px',borderRadius:20,background:'#d1fae5',color:'#065f46',fontSize:11,fontWeight:700}}>Best deal</span>}
          {items.length>2&&<button onClick={()=>setItems(items.filter((_,j)=>j!==i))} style={{marginLeft:8,width:26,height:26,borderRadius:'50%',border:'none',background:'var(--bg-card)',cursor:'pointer',fontSize:14,color:'var(--text-3)'}}>×</button>}
        </div>
        <div style={{display:'flex',gap:8}}>
          <div style={{flex:1}}><label style={{fontSize:11,color:'var(--text-3)',display:'block',marginBottom:4}}>Price ($)</label><input type="number" value={it.price} onChange={e=>update(i,'price',+e.target.value)} style={{width:'100%',height:40,border:'1px solid var(--border-2)',borderRadius:7,padding:'0 10px',fontSize:14,fontWeight:700,background:'var(--bg-card)',color:'var(--text)',boxSizing:'border-box'}}/></div>
          <div style={{flex:1}}><label style={{fontSize:11,color:'var(--text-3)',display:'block',marginBottom:4}}>Quantity</label><input type="number" value={it.qty} onChange={e=>update(i,'qty',+e.target.value)} style={{width:'100%',height:40,border:'1px solid var(--border-2)',borderRadius:7,padding:'0 10px',fontSize:14,fontWeight:700,background:'var(--bg-card)',color:'var(--text)',boxSizing:'border-box'}}/></div>
          <div style={{width:70}}><label style={{fontSize:11,color:'var(--text-3)',display:'block',marginBottom:4}}>Unit</label><input value={it.unit} onChange={e=>update(i,'unit',e.target.value)} style={{width:'100%',height:40,border:'1px solid var(--border-2)',borderRadius:7,padding:'0 8px',fontSize:12,background:'var(--bg-card)',color:'var(--text)',boxSizing:'border-box'}}/></div>
        </div>
        {it.ppu&&<div style={{marginTop:10,fontSize:15,fontWeight:700,color:it.ppu===minPPU?C:'var(--text)',fontFamily:"'Space Grotesk',sans-serif"}}>${it.ppu.toFixed(4)} / {it.unit}</div>}
      </div>))}
      {items.length<5&&<button onClick={()=>setItems([...items,{name:`Brand ${String.fromCharCode(65+items.length)}`,price:0,qty:0,unit:items[0]?.unit||'oz'}])} style={{width:'100%',padding:'10px',borderRadius:9,border:`1px dashed ${C}`,background:'transparent',color:C,fontSize:13,fontWeight:600,cursor:'pointer'}}>+ Add product</button>}
    </Sec>
    <Sec title="Frequently asked questions">{FAQ.map((f,i)=><Acc key={i} q={f.q} a={f.a} open={openFaq===i} onToggle={()=>setOpenFaq(openFaq===i?null:i)} color={C}/>)}</Sec>
    <AIHintCard hint={hint}/>
  </div>)
}
