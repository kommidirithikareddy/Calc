import { useState, useMemo } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'
const fmt=n=>(isNaN(n)||!isFinite(n))? '—':parseFloat(Number(n).toFixed(4)).toString()
function Sec({title,sub,children,color}){return(<div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,overflow:'hidden'}}><div style={{padding:'13px 18px',borderBottom:'0.5px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center',background:color?color+'06':'transparent'}}><span style={{fontSize:13,fontWeight:700,color:'var(--text)',fontFamily:"'Space Grotesk',sans-serif"}}>{title}</span>{sub&&<span style={{fontSize:11,color:'var(--text-3)'}}>{sub}</span>}</div><div style={{padding:'16px 18px'}}>{children}</div></div>)}
function Acc({q,a,open,onToggle,color}){return(<div style={{borderBottom:'0.5px solid var(--border)'}}><button onClick={onToggle} style={{width:'100%',display:'flex',justifyContent:'space-between',alignItems:'center',padding:'13px 0',background:'none',border:'none',cursor:'pointer',gap:12,textAlign:'left'}}><span style={{fontSize:13,fontWeight:600,color:'var(--text)',fontFamily:"'DM Sans',sans-serif",lineHeight:1.4}}>{q}</span><span style={{fontSize:18,color,flexShrink:0,transform:open?'rotate(45deg)':'none',transition:'transform .2s'}}>+</span></button>{open&&<p style={{fontSize:12.5,color:'var(--text-2)',lineHeight:1.75,margin:'0 0 13px'}}>{a}</p>}</div>)}
const FAQ=[
  {q:'What is a weighted average?',a:'A weighted average assigns different importance (weights) to each value. Regular average treats all values equally. Weighted average: W̄ = Σ(wᵢxᵢ) / Σwᵢ. Used when some items matter more — final exam worth 40% vs homework worth 10%.'},
  {q:'How does GPA work as a weighted average?',a:'GPA = Σ(credit hours × grade points) / Σ(credit hours). A 3-credit A (4.0) contributes 12 points. A 1-credit C (2.0) contributes 2 points. Total = (12+2)/(3+1) = 3.5 GPA. The 3-credit course has 3× the weight of the 1-credit course.'},
  {q:'When should I use weighted vs simple average?',a:'Use weighted when items have unequal importance or different sample sizes. Examples: portfolio return (weight = $ invested), GPA (weight = credit hours), national unemployment rate (weight = labor force size per state), customer satisfaction (weight = number of respondents).'},
  {q:'What happens if weights do not sum to 1?',a:'The formula works regardless: W̄ = Σ(wᵢxᵢ) / Σwᵢ. The denominator normalizes automatically. You can use raw counts, percentages, or any positive numbers as weights — the result is the same as long as the ratios are correct.'},
]
const TEMPLATES=[
  {label:'GPA',items:[{name:'Math',value:92,weight:4},{name:'English',value:85,weight:3},{name:'Art',value:95,weight:1},{name:'Physics',value:78,weight:4}]},
  {label:'Investment',items:[{name:'Stocks',value:12.5,weight:60},{name:'Bonds',value:4.2,weight:30},{name:'Cash',value:1.8,weight:10}]},
  {label:'Course grade',items:[{name:'Homework',value:88,weight:15},{name:'Midterm',value:76,weight:25},{name:'Project',value:82,weight:20},{name:'Final exam',value:90,weight:40}]},
]
export default function WeightedAverageCalculator({meta,category}){
  const C=category?.color||'#6366f1'
  const[items,setItems]=useState([{name:'Math',value:92,weight:4},{name:'English',value:85,weight:3},{name:'Art',value:95,weight:1},{name:'Physics',value:78,weight:4}])
  const[openFaq,setFaq]=useState(null)
  const updateItem=(i,field,val)=>setItems(prev=>prev.map((it,idx)=>idx===i?{...it,[field]:val}:it))
  const addItem=()=>setItems(prev=>[...prev,{name:'New Item',value:0,weight:1}])
  const removeItem=i=>setItems(prev=>prev.filter((_,idx)=>idx!==i))
  const stats=useMemo(()=>{
    const valid=items.filter(it=>!isNaN(it.value)&&!isNaN(it.weight)&&it.weight>0)
    if(!valid.length)return null
    const totalWeight=valid.reduce((a,it)=>a+it.weight,0)
    const wa=valid.reduce((a,it)=>a+(it.value*it.weight),0)/totalWeight
    const simpleAvg=valid.reduce((a,it)=>a+it.value,0)/valid.length
    return{wa,simpleAvg,totalWeight,valid}
  },[items])
  return(<div style={{display:'flex',flexDirection:'column',gap:20}}>
    <div style={{background:`linear-gradient(135deg,${C}12,${C}06)`,border:`1px solid ${C}30`,borderRadius:14,padding:'16px 20px',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12}}>
      <div>
        <div style={{fontSize:10,fontWeight:700,color:C,textTransform:'uppercase',letterSpacing:'.08em',marginBottom:6}}>Weighted Average Calculator</div>
        <div style={{fontSize:20,fontWeight:700,color:C,fontFamily:"'Space Grotesk',sans-serif"}}>W̄ = Σ(wᵢ × xᵢ) / Σwᵢ</div>
        <div style={{fontSize:11,color:'var(--text-3)',marginTop:4}}>Different importance for each value</div>
      </div>
      {stats&&(<div style={{padding:'10px 20px',background:C+'18',borderRadius:12,textAlign:'center'}}>
        <div style={{fontSize:11,color:'var(--text-3)',marginBottom:2}}>Weighted avg</div>
        <div style={{fontSize:36,fontWeight:700,color:C,fontFamily:"'Space Grotesk',sans-serif"}}>{fmt(stats.wa)}</div>
        <div style={{fontSize:10,color:'var(--text-3)'}}>vs simple: {fmt(stats.simpleAvg)}</div>
      </div>)}
    </div>
    {/* Templates */}
    <div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,padding:'14px 18px'}}>
      <div style={{fontSize:12,fontWeight:600,color:'var(--text-2)',marginBottom:12}}>Templates</div>
      <div style={{display:'flex',gap:8}}>
        {TEMPLATES.map((t,i)=>(<button key={i} onClick={()=>setItems(t.items)} style={{flex:1,padding:'10px',borderRadius:10,border:`1.5px solid var(--border-2)`,background:'var(--bg-raised)',cursor:'pointer',fontSize:11,fontWeight:600,color:C}}>{t.label}</button>))}
      </div>
    </div>
    <CalcShell
      left={<>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14,paddingBottom:8,borderBottom:'0.5px solid var(--border)'}}>
          <div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.07em'}}>Items & Weights</div>
          <button onClick={addItem} style={{padding:'5px 12px',borderRadius:7,border:`1px solid ${C}50`,background:C+'10',color:C,fontSize:12,fontWeight:600,cursor:'pointer'}}>+ Add</button>
        </div>
        {/* Header */}
        <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 24px',gap:6,marginBottom:6}}>
          {['Name','Value','Weight',''].map(h=>(<div key={h} style={{fontSize:10,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.05em'}}>{h}</div>))}
        </div>
        {items.map((it,i)=>(<div key={i} style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 24px',gap:6,marginBottom:8,alignItems:'center'}}>
          <input value={it.name} onChange={e=>updateItem(i,'name',e.target.value)} style={{border:'1.5px solid var(--border-2)',borderRadius:7,padding:'6px 10px',fontSize:12,fontWeight:600,color:'var(--text)',background:'var(--bg-card)',outline:'none'}}/>
          <input type="number" value={it.value} onChange={e=>updateItem(i,'value',Number(e.target.value))} style={{border:'1.5px solid var(--border-2)',borderRadius:7,padding:'6px 8px',fontSize:12,fontWeight:700,color:'var(--text)',background:'var(--bg-card)',outline:'none',textAlign:'right',fontFamily:"'Space Grotesk',sans-serif"}}/>
          <input type="number" value={it.weight} onChange={e=>updateItem(i,'weight',Math.max(0,Number(e.target.value)))} style={{border:'1.5px solid var(--border-2)',borderRadius:7,padding:'6px 8px',fontSize:12,fontWeight:700,color:C,background:'var(--bg-card)',outline:'none',textAlign:'right',fontFamily:"'Space Grotesk',sans-serif"}}/>
          {items.length>1&&<button onClick={()=>removeItem(i)} style={{fontSize:16,color:'var(--text-3)',background:'none',border:'none',cursor:'pointer',padding:'0 4px'}}>×</button>}
        </div>))}
        <div style={{padding:'10px 14px',background:C+'08',borderRadius:10,border:`1px solid ${C}20`,marginTop:8,marginBottom:14}}>
          <div style={{fontSize:11,color:'var(--text-3)'}}>Total weight: <strong style={{color:C}}>{stats?fmt(stats.totalWeight):'—'}</strong></div>
        </div>
        <div style={{display:'flex',gap:10}}>
          <button style={{flex:1,padding:13,borderRadius:10,border:'none',background:C,color:'#fff',fontSize:14,fontWeight:700,cursor:'pointer'}}>Calculate →</button>
          <button onClick={()=>setItems([{name:'Item 1',value:80,weight:2},{name:'Item 2',value:90,weight:3}])} style={{padding:'13px 18px',borderRadius:10,border:'1.5px solid var(--border-2)',background:'var(--bg-raised)',color:'var(--text-2)',fontSize:13,fontWeight:500,cursor:'pointer'}}>Reset</button>
        </div>
      </>}
      right={<>
        {stats?(<>
          <div style={{background:'var(--bg-card)',border:`1.5px solid ${C}30`,borderRadius:14,padding:'18px 20px',marginBottom:14}}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              <div style={{textAlign:'center'}}>
                <div style={{fontSize:11,color:'var(--text-3)',marginBottom:4}}>Weighted Average</div>
                <div style={{fontSize:36,fontWeight:700,color:C,fontFamily:"'Space Grotesk',sans-serif"}}>{fmt(stats.wa)}</div>
              </div>
              <div style={{textAlign:'center'}}>
                <div style={{fontSize:11,color:'var(--text-3)',marginBottom:4}}>Simple Average</div>
                <div style={{fontSize:36,fontWeight:700,color:'#10b981',fontFamily:"'Space Grotesk',sans-serif"}}>{fmt(stats.simpleAvg)}</div>
              </div>
            </div>
            <div style={{textAlign:'center',marginTop:10,fontSize:12,color:'var(--text-3)'}}>
              Difference: {fmt(Math.abs(stats.wa-stats.simpleAvg))} ({stats.wa>stats.simpleAvg?'weighted is higher':'simple is higher'})
            </div>
          </div>
          {/* Weight breakdown visual */}
          <div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,padding:'14px 18px',marginBottom:14}}>
            <div style={{fontSize:12,fontWeight:700,color:'var(--text)',marginBottom:12}}>Weight distribution</div>
            {stats.valid.map((it,i)=>{
              const pct=(it.weight/stats.totalWeight)*100
              return(<div key={i} style={{marginBottom:8}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}>
                  <span style={{fontSize:11,fontWeight:600,color:'var(--text)'}}>{it.name}</span>
                  <span style={{fontSize:11,color:C,fontFamily:"'Space Grotesk',sans-serif"}}>{pct.toFixed(1)}% · val={it.value}</span>
                </div>
                <div style={{height:8,background:'var(--bg-raised)',borderRadius:4,overflow:'hidden'}}>
                  <div style={{width:`${pct}%`,height:'100%',background:`hsl(${240+i*40},70%,55%)`,borderRadius:4}}/>
                </div>
              </div>)
            })}
          </div>
          <BreakdownTable title="Weighted calculation" rows={[
            ...stats.valid.map(it=>({label:`${it.name} (w=${it.weight})`,value:`${it.value}×${it.weight}=${fmt(it.value*it.weight)}`,color:C})),
            {label:'Σ(w×x)',value:fmt(stats.valid.reduce((a,it)=>a+(it.value*it.weight),0)),bold:true},
            {label:'Σw (total weight)',value:fmt(stats.totalWeight)},
            {label:'Weighted average',value:fmt(stats.wa),bold:true,highlight:true,color:C},
            {label:'Simple average',value:fmt(stats.simpleAvg),color:'#10b981'},
          ]}/>
          <AIHintCard hint={`Weighted average = ${fmt(stats.wa)}. Simple average = ${fmt(stats.simpleAvg)}. Difference = ${fmt(Math.abs(stats.wa-stats.simpleAvg))}. The highest-weighted items pull the result toward their values.`} color={C}/>
        </>):<div style={{padding:'40px',textAlign:'center',color:'var(--text-3)'}}>Add items with values and weights</div>}
      </>}
    />
    <Sec title="📊 Weighted vs Simple Average — When they differ" color={C}>
      <p style={{fontSize:12,color:'var(--text-2)',lineHeight:1.75,marginBottom:14}}>The weighted average and simple average are equal when all weights are the same. They diverge when high-weight items have values different from low-weight items. The larger the weight spread, the larger the potential difference.</p>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
        {[{icon:'🎓',title:'Academic GPA',desc:'Credit hours are weights. A 4-credit A matters much more than a 1-credit pass/fail course.',col:C},{icon:'💼',title:'Portfolio return',desc:'Dollar amount invested is the weight. A 10% return on $90k trumps a 50% return on $10k.',col:'#10b981'},{icon:'📊',title:'National statistics',desc:'State population is weight for national averages. California (39M) outweighs Wyoming (600k) by 65×.',col:'#f59e0b'},{icon:'🛒',title:'Weighted price index',desc:'Consumer Price Index weights items by how much households typically spend on them (food, housing, transport).',col:'#8b5cf6'}].map((ex,i)=>(<div key={i} style={{padding:'12px',borderRadius:10,background:ex.col+'08',border:`1px solid ${ex.col}25`}}><div style={{display:'flex',gap:8,alignItems:'center',marginBottom:6}}><span style={{fontSize:18}}>{ex.icon}</span><span style={{fontSize:11,fontWeight:700,color:ex.col}}>{ex.title}</span></div><p style={{fontSize:11,color:'var(--text-2)',lineHeight:1.6,margin:0}}>{ex.desc}</p></div>))}
      </div>
    </Sec>
    <Sec title="Frequently asked questions" color={C}>
      {FAQ.map((f,i)=><Acc key={i} q={f.q} a={f.a} open={openFaq===i} onToggle={()=>setFaq(openFaq===i?null:i)} color={C}/>)}
    </Sec>
  </div>)
}
