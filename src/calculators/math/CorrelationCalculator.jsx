import { useState, useMemo } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'
const fmt=n=>(isNaN(n)||!isFinite(n))? '—':parseFloat(Number(n).toFixed(6)).toString()
function Sec({title,sub,children,color}){return(<div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,overflow:'hidden'}}><div style={{padding:'13px 18px',borderBottom:'0.5px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center',background:color?color+'06':'transparent'}}><span style={{fontSize:13,fontWeight:700,color:'var(--text)',fontFamily:"'Space Grotesk',sans-serif"}}>{title}</span>{sub&&<span style={{fontSize:11,color:'var(--text-3)'}}>{sub}</span>}</div><div style={{padding:'16px 18px'}}>{children}</div></div>)}
function Acc({q,a,open,onToggle,color}){return(<div style={{borderBottom:'0.5px solid var(--border)'}}><button onClick={onToggle} style={{width:'100%',display:'flex',justifyContent:'space-between',alignItems:'center',padding:'13px 0',background:'none',border:'none',cursor:'pointer',gap:12,textAlign:'left'}}><span style={{fontSize:13,fontWeight:600,color:'var(--text)',fontFamily:"'DM Sans',sans-serif",lineHeight:1.4}}>{q}</span><span style={{fontSize:18,color,flexShrink:0,transform:open?'rotate(45deg)':'none',transition:'transform .2s'}}>+</span></button>{open&&<p style={{fontSize:12.5,color:'var(--text-2)',lineHeight:1.75,margin:'0 0 13px'}}>{a}</p>}</div>)}
const FAQ=[
  {q:"What does Pearson's r measure?",a:"Pearson's r measures the linear relationship between two variables. r = 1: perfect positive correlation. r = −1: perfect negative. r = 0: no linear relationship (but may have non-linear). It only measures linear associations — two variables can be strongly related (e.g. circular) yet have r ≈ 0."},
  {q:'What is R² and how do I interpret it?',a:'R² = r² = coefficient of determination. It represents the proportion of variance in Y explained by X. R²=0.64 means X explains 64% of the variability in Y. The remaining 36% is due to other factors. R² is always between 0 and 1 and is more intuitive than r for explaining model fit.'},
  {q:'Does correlation imply causation?',a:'No — this is one of the most important lessons in statistics. Ice cream sales and drowning rates are correlated (both rise in summer) but ice cream does not cause drowning — the confounding variable is temperature/season. Correlation is necessary but not sufficient for causation. Causation requires controlled experiments.'},
  {q:"What is Spearman's rank correlation?",a:"Spearman's ρ measures the monotonic relationship between variables using their ranks rather than raw values. It is more robust to outliers and non-linear but monotonic relationships. Calculate: rank both variables, then compute Pearson r on the ranks. rs = 1 − 6Σd²/(n(n²-1)) where d = difference in ranks."},
]
const DATASETS=[
  {label:'Strong positive',x:'1,2,3,4,5,6,7,8,9,10',y:'2,4,5,8,9,10,12,13,15,18'},
  {label:'Strong negative',x:'1,2,3,4,5,6,7,8,9,10',y:'18,15,13,12,10,9,8,5,4,2'},
  {label:'No correlation',x:'1,2,3,4,5,6,7,8,9,10',y:'5,2,8,1,9,3,7,4,10,6'},
  {label:'Height & Weight',x:'160,165,170,175,180,185,170,155,175,165',y:'55,60,68,72,80,85,70,50,75,62'},
]
export default function CorrelationCalculator({meta,category}){
  const C=category?.color||'#6366f1'
  const[xRaw,setXRaw]=useState('1,2,3,4,5,6,7,8,9,10')
  const[yRaw,setYRaw]=useState('2,4,5,8,9,10,12,13,15,18')
  const[openFaq,setFaq]=useState(null)
  const[hoveredPt,setHovPt]=useState(null)
  const parseArr=raw=>raw.split(/[\s,;]+/).map(Number).filter(v=>!isNaN(v))
  const xs=useMemo(()=>parseArr(xRaw),[xRaw])
  const ys=useMemo(()=>parseArr(yRaw),[yRaw])
  const stats=useMemo(()=>{
    const n=Math.min(xs.length,ys.length);if(n<3)return null
    const x=xs.slice(0,n),y=ys.slice(0,n)
    const mx=x.reduce((a,b)=>a+b)/n,my=y.reduce((a,b)=>a+b)/n
    const sx=Math.sqrt(x.reduce((a,b)=>a+(b-mx)**2,0)/n)
    const sy=Math.sqrt(y.reduce((a,b)=>a+(b-my)**2,0)/n)
    const cov=x.reduce((a,v,i)=>a+(v-mx)*(y[i]-my),0)/n
    const r=sx>0&&sy>0?cov/(sx*sy):0
    const r2=r*r
    const t=r*Math.sqrt((n-2)/(1-r2))
    const slope=cov/sx**2,intercept=my-slope*mx
    const strength=Math.abs(r)>=0.9?'very strong':Math.abs(r)>=0.7?'strong':Math.abs(r)>=0.5?'moderate':Math.abs(r)>=0.3?'weak':'very weak'
    const direction=r>0?'positive':r<0?'negative':'none'
    return{n,r,r2,cov,mx,my,sx,sy,t,slope,intercept,strength,direction,x,y}
  },[xs,ys])
  const W=260,H=180
  const scatter=useMemo(()=>{
    if(!stats)return[]
    const{x,y}=stats
    const xMin=Math.min(...x),xMax=Math.max(...x),yMin=Math.min(...y),yMax=Math.max(...y)
    const toSx=v=>20+((v-xMin)/(xMax-xMin||1))*(W-40)
    const toSy=v=>H-20-((v-yMin)/(yMax-yMin||1))*(H-40)
    const points=x.map((xv,i)=>({px:toSx(xv),py:toSy(y[i]),xv,yv:y[i]}))
    const xRange=Array.from({length:21},(_,i)=>xMin+(i/20)*(xMax-xMin))
    const regLine=xRange.map(xv=>({px:toSx(xv),py:toSy(stats.intercept+stats.slope*xv)}))
    return{points,regLine,toSx,toSy}
  },[stats])
  const rColor=!stats?C:Math.abs(stats.r)>=0.7?'#10b981':Math.abs(stats.r)>=0.4?'#f59e0b':'#ef4444'
  return(<div style={{display:'flex',flexDirection:'column',gap:20}}>
    <div style={{background:`linear-gradient(135deg,${C}12,${C}06)`,border:`1px solid ${C}30`,borderRadius:14,padding:'16px 20px',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12}}>
      <div>
        <div style={{fontSize:10,fontWeight:700,color:C,textTransform:'uppercase',letterSpacing:'.08em',marginBottom:6}}>Pearson Correlation Calculator</div>
        <div style={{fontSize:20,fontWeight:700,color:C,fontFamily:"'Space Grotesk',sans-serif"}}>r = Σ(xᵢ−x̄)(yᵢ−ȳ) / (n·σx·σy)</div>
        <div style={{fontSize:11,color:'var(--text-3)',marginTop:4}}>−1 ≤ r ≤ +1 · measures linear association</div>
      </div>
      {stats&&(<div style={{padding:'10px 20px',background:rColor+'18',borderRadius:12,textAlign:'center'}}>
        <div style={{fontSize:11,color:'var(--text-3)',marginBottom:2}}>r =</div>
        <div style={{fontSize:36,fontWeight:700,color:rColor,fontFamily:"'Space Grotesk',sans-serif"}}>{fmt(stats.r)}</div>
        <div style={{fontSize:11,color:rColor,fontWeight:600}}>{stats.strength} {stats.direction}</div>
      </div>)}
    </div>
    <div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,padding:'14px 18px'}}>
      <div style={{fontSize:12,fontWeight:600,color:'var(--text-2)',marginBottom:12}}>Sample datasets</div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8}}>
        {DATASETS.map((ds,i)=>(<button key={i} onClick={()=>{setXRaw(ds.x);setYRaw(ds.y)}} style={{padding:'9px 6px',borderRadius:10,border:`1.5px solid ${xRaw===ds.x&&yRaw===ds.y?C:'var(--border-2)'}`,background:xRaw===ds.x&&yRaw===ds.y?C+'12':'var(--bg-raised)',cursor:'pointer',textAlign:'center'}}><div style={{fontSize:10,fontWeight:700,color:C}}>{ds.label}</div></button>))}
      </div>
    </div>
    <CalcShell
      left={<>
        <div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:14,paddingBottom:8,borderBottom:'0.5px solid var(--border)'}}>Enter Paired Data</div>
        <div style={{marginBottom:12}}>
          <label style={{fontSize:12.5,fontWeight:600,color:'var(--text)',display:'block',marginBottom:6}}>X values</label>
          <textarea value={xRaw} onChange={e=>setXRaw(e.target.value)} rows={3} style={{width:'100%',border:`1.5px solid ${C}40`,borderRadius:9,padding:'8px 12px',fontSize:12,fontWeight:600,color:'var(--text)',background:'var(--bg-card)',outline:'none',resize:'vertical',fontFamily:"'DM Sans',sans-serif",boxSizing:'border-box'}}/>
        </div>
        <div style={{marginBottom:14}}>
          <label style={{fontSize:12.5,fontWeight:600,color:'var(--text)',display:'block',marginBottom:6}}>Y values</label>
          <textarea value={yRaw} onChange={e=>setYRaw(e.target.value)} rows={3} style={{width:'100%',border:`1.5px solid ${C}40`,borderRadius:9,padding:'8px 12px',fontSize:12,fontWeight:600,color:'var(--text)',background:'var(--bg-card)',outline:'none',resize:'vertical',fontFamily:"'DM Sans',sans-serif",boxSizing:'border-box'}}/>
        </div>
        {stats&&(<div style={{padding:'12px 14px',background:rColor+'08',borderRadius:10,border:`1px solid ${rColor}25`,marginBottom:14}}>
          <div style={{fontSize:12,fontWeight:700,color:rColor}}>r = {fmt(stats.r)}</div>
          <div style={{fontSize:11,color:'var(--text-2)',marginTop:4}}>
            {stats.strength} {stats.direction} correlation<br/>
            R² = {fmt(stats.r2)} — X explains {(stats.r2*100).toFixed(1)}% of Y variance<br/>
            y = {fmt(stats.slope)}x + {fmt(stats.intercept)}
          </div>
        </div>)}
        <div style={{display:'flex',gap:10}}>
          <button style={{flex:1,padding:13,borderRadius:10,border:'none',background:C,color:'#fff',fontSize:14,fontWeight:700,cursor:'pointer'}}>Calculate →</button>
          <button onClick={()=>{setXRaw('1,2,3,4,5,6,7,8,9,10');setYRaw('2,4,5,8,9,10,12,13,15,18')}} style={{padding:'13px 18px',borderRadius:10,border:'1.5px solid var(--border-2)',background:'var(--bg-raised)',color:'var(--text-2)',fontSize:13,fontWeight:500,cursor:'pointer'}}>Reset</button>
        </div>
      </>}
      right={<>
        {stats?(<>
          {/* Scatter plot */}
          <div style={{background:'var(--bg-card)',border:`1.5px solid ${rColor}30`,borderRadius:14,padding:'14px 18px',marginBottom:14}}>
            <div style={{fontSize:12,fontWeight:700,color:'var(--text)',marginBottom:8}}>Scatter plot with regression line</div>
            <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{display:'block',background:'var(--bg-raised)',borderRadius:8}}>
              {/* Regression line */}
              {scatter.regLine&&scatter.regLine.length>1&&<polyline points={scatter.regLine.map(p=>`${p.px},${Math.max(5,Math.min(H-5,p.py))}`).join(' ')} fill="none" stroke={rColor} strokeWidth="1.5" strokeDasharray="5,3"/>}
              {/* Points */}
              {scatter.points&&scatter.points.map((p,i)=>(
                <g key={i} onMouseEnter={()=>setHovPt(i)} onMouseLeave={()=>setHovPt(null)}>
                  <circle cx={p.px} cy={Math.max(10,Math.min(H-10,p.py))} r={hoveredPt===i?6:4} fill={C} stroke="#fff" strokeWidth="1.5" style={{cursor:'pointer'}}/>
                  {hoveredPt===i&&<text x={p.px+7} y={Math.max(15,Math.min(H-5,p.py))-5} fontSize="8" fill={C} fontWeight="700">({p.xv},{p.yv})</text>}
                </g>
              ))}
            </svg>
          </div>
          {/* r gauge */}
          <div style={{padding:'12px 14px',background:'var(--bg-raised)',borderRadius:10,border:'0.5px solid var(--border)',marginBottom:14}}>
            <div style={{fontSize:11,fontWeight:700,color:'var(--text)',marginBottom:8}}>Correlation strength gauge</div>
            <div style={{position:'relative',height:12,background:'linear-gradient(90deg,#ef4444,#f59e0b,#10b981,#f59e0b,#ef4444)',borderRadius:6,marginBottom:6}}>
              <div style={{position:'absolute',left:`${(stats.r+1)/2*100}%`,top:'50%',transform:'translate(-50%,-50%)',width:16,height:16,borderRadius:'50%',background:'var(--bg-card)',border:`2.5px solid ${rColor}`,transition:'left .4s'}}/>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:9,color:'var(--text-3)'}}>
              <span>−1 perfect neg</span><span>0 none</span><span>+1 perfect pos</span>
            </div>
          </div>
          <BreakdownTable title="Correlation results" rows={[
            {label:"Pearson's r",value:fmt(stats.r),bold:true,highlight:true,color:rColor},
            {label:'R² (explained variance)',value:`${fmt(stats.r2)} (${(stats.r2*100).toFixed(1)}%)`,color:C},
            {label:'Covariance',value:fmt(stats.cov)},
            {label:'Regression slope',value:fmt(stats.slope)},
            {label:'Regression intercept',value:fmt(stats.intercept)},
            {label:'t-statistic',value:fmt(stats.t)},
            {label:'n (pairs)',value:stats.n.toString()},
          ]}/>
          <AIHintCard hint={`r=${fmt(stats.r)} — ${stats.strength} ${stats.direction} correlation. R²=${fmt(stats.r2)}: X explains ${(stats.r2*100).toFixed(1)}% of Y variation. Regression: y=${fmt(stats.slope)}x+${fmt(stats.intercept)}.`} color={C}/>
        </>):<div style={{padding:'40px',textAlign:'center',color:'var(--text-3)'}}>Enter paired X and Y values</div>}
      </>}
    />

    {/* Correlation interpretation guide */}
    <Sec title="📊 Correlation Strength Guide — |r| interpretation" color={C}>
      <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:8,marginBottom:14}}>
        {[['0.0–0.2','Negligible','#ef4444'],['0.2–0.4','Weak','#f59e0b'],['0.4–0.6','Moderate','#eab308'],['0.6–0.8','Strong','#22c55e'],['0.8–1.0','Very strong','#10b981']].map(([range,label,col])=>(
          <div key={range} style={{padding:'10px 8px',borderRadius:10,background:col+'12',border:`1px solid ${col}30`,textAlign:'center'}}>
            <div style={{fontSize:18,fontWeight:700,color:col,marginBottom:4}}>●</div>
            <div style={{fontSize:10,fontWeight:700,color:col}}>{label}</div>
            <div style={{fontSize:9,color:'var(--text-3)',marginTop:2}}>{range}</div>
          </div>
        ))}
      </div>
      {stats&&(<div style={{padding:'10px 14px',background:rColor+'08',borderRadius:9,border:`1px solid ${rColor}25`}}>
        <div style={{fontSize:12,fontWeight:700,color:rColor}}>Your r = {fmt(stats.r)} → {stats.strength} {stats.direction} correlation</div>
        <div style={{fontSize:11,color:'var(--text-2)',marginTop:4}}>X explains {(stats.r2*100).toFixed(1)}% of variance in Y. Regression equation: Y = {fmt(stats.slope)}X + {fmt(stats.intercept)}.</div>
      </div>)}
    </Sec>

    {/* Correlation vs causation */}
    <Sec title="⚠️ Correlation ≠ Causation — Famous examples" color={C}>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
        {[{corr:'Ice cream sales & drowning deaths',r:'~0.95',cause:'Both driven by summer heat — temperature confounds both',col:'#ef4444'},{corr:'Shoe size & reading ability in children',r:'~0.80',cause:'Both driven by age — older children have bigger feet AND read better',col:'#f59e0b'},{corr:'Nicolas Cage movies & pool drownings',r:'~0.67',cause:'Spurious — pure coincidence over a small time window',col:'#8b5cf6'},{corr:'Country internet use & Nobel prizes',r:'~0.91',cause:'Both driven by national wealth — GDP is the real driver',col:'#10b981'}].map((ex,i)=>(<div key={i} style={{padding:'12px',borderRadius:10,background:ex.col+'08',border:`1px solid ${ex.col}25`}}><div style={{fontSize:11,fontWeight:700,color:ex.col,marginBottom:4}}>{ex.corr}</div><div style={{fontSize:10,color:C,marginBottom:4}}>r ≈ {ex.r}</div><div style={{fontSize:10,color:'var(--text-3)',lineHeight:1.5}}>Confound: {ex.cause}</div></div>))}
      </div>
    </Sec>

    <Sec title="Frequently asked questions" color={C}>
      {FAQ.map((f,i)=><Acc key={i} q={f.q} a={f.a} open={openFaq===i} onToggle={()=>setFaq(openFaq===i?null:i)} color={C}/>)}
    </Sec>
  </div>)
}
