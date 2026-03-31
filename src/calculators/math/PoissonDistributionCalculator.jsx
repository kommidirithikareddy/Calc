import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'
const fmt=n=>(isNaN(n)||!isFinite(n))? '—':parseFloat(Number(n).toFixed(6)).toString()
const fmtP=n=>(n*100).toFixed(4)+'%'
function factorial(n){if(n<=1)return 1;if(n>170)return Infinity;let r=1;for(let i=2;i<=n;i++)r*=i;return r}
function poissonPDF(k,lam){return Math.pow(lam,k)*Math.exp(-lam)/factorial(k)}
function poissonCDF(k,lam){let s=0;for(let i=0;i<=k;i++)s+=poissonPDF(i,lam);return Math.min(1,s)}
function Sec({title,sub,children}){return(<div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,overflow:'hidden'}}><div style={{padding:'13px 18px',borderBottom:'0.5px solid var(--border)',display:'flex',justifyContent:'space-between'}}><span style={{fontSize:13,fontWeight:700,color:'var(--text)',fontFamily:"'Space Grotesk',sans-serif"}}>{title}</span>{sub&&<span style={{fontSize:11,color:'var(--text-3)'}}>{sub}</span>}</div><div style={{padding:'16px 18px'}}>{children}</div></div>)}
function Acc({q,a,open,onToggle,color}){return(<div style={{borderBottom:'0.5px solid var(--border)'}}><button onClick={onToggle} style={{width:'100%',display:'flex',justifyContent:'space-between',alignItems:'center',padding:'13px 0',background:'none',border:'none',cursor:'pointer',gap:12,textAlign:'left'}}><span style={{fontSize:13,fontWeight:600,color:'var(--text)',fontFamily:"'DM Sans',sans-serif",lineHeight:1.4}}>{q}</span><span style={{fontSize:18,color,flexShrink:0,transform:open?'rotate(45deg)':'none',transition:'transform .2s'}}>+</span></button>{open&&<p style={{fontSize:12.5,color:'var(--text-2)',lineHeight:1.75,margin:'0 0 13px'}}>{a}</p>}</div>)}
const FAQ=[
  {q:'What is the Poisson distribution?',a:"The Poisson distribution models the number of events occurring in a fixed interval (time, area, volume) given a known average rate λ. Conditions: events occur independently, at a constant average rate, and two events cannot occur at exactly the same time. P(X=k) = e^(-λ)·λᵏ/k!"},
  {q:'What is λ (lambda)?',a:'λ (lambda) is the average number of events per interval. It is both the mean AND the variance of the Poisson distribution (a unique property). If λ=3 calls per minute, you expect 3 calls on average, with variance also 3 and std dev = √3 ≈ 1.73 calls.'},
  {q:'How does Poisson differ from binomial?',a:'Binomial: fixed n trials, each with probability p. Poisson: unlimited potential events, fixed average rate λ. Poisson is the limit of Binomial as n→∞, p→0 with np=λ fixed. Use Poisson when events are rare (small p) and n is large — it is simpler (one parameter vs two).'},
  {q:'What are common applications?',a:'Phone calls arriving at a call centre. Emails per hour. Website requests per second. Radioactive decay counts. Number of accidents on a road per day. Mutations per gene. Bacteria colonies on a plate. Customer arrivals per minute. Any count of rare independent events over a fixed interval.'},
  {q:'What is the memoryless property?',a:"The Poisson process is memoryless — knowing no events occurred in the past gives no information about when the next event occurs. The time between events follows an Exponential distribution with mean 1/λ. This memoryless property is why Poisson processes are fundamental in queuing theory."},
]
export default function PoissonDistributionCalculator({meta,category}){
  const C=category?.color||'#6366f1'
  const[lam,setLam]=useState(3)
  const[k,setK]=useState(3)
  const[openFaq,setFaq]=useState(null)
  const[simResults,setSimResults]=useState(null)
  const[simCount,setSimCount]=useState(1000)
  const[interval,setInterval]=useState(1)
  const LAM=Math.max(0.1,Math.min(20,lam))*interval
  const K=Math.max(0,Math.min(30,Math.round(k)))
  const pdf=poissonPDF(K,LAM)
  const cdfLE=poissonCDF(K,LAM)
  const cdfGE=1-poissonCDF(K-1,LAM)
  const mean=LAM, variance=LAM, stdDev=Math.sqrt(LAM)
  const maxK=Math.ceil(LAM+4*stdDev+2)
  const dist=Array.from({length:Math.min(maxK+1,31)},(_,i)=>({k:i,prob:poissonPDF(i,LAM),cdf:poissonCDF(i,LAM)}))
  const maxProb=Math.max(...dist.map(d=>d.prob))
  function simulate(){
    function poissonSample(l){let L=Math.exp(-l),p2=1,k2=0;do{k2++;p2*=Math.random()}while(p2>L);return k2-1}
    const results=Array.from({length:simCount},()=>poissonSample(LAM))
    const counts=new Array(maxK+1).fill(0);results.forEach(r=>{if(r<=maxK)counts[r]++})
    setSimResults({counts,total:simCount})
  }
  const SCENARIOS=[
    {label:'Call centre',lam:5,unit:'calls/min',k:5},
    {label:'Website hits',lam:120,unit:'hits/hr',k:120},
    {label:'Accidents',lam:2,unit:'accidents/day',k:2},
    {label:'Mutations',lam:0.5,unit:'per gene',k:1},
  ]
  return(<div style={{display:'flex',flexDirection:'column',gap:20}}>
    <div style={{background:`linear-gradient(135deg,${C}12,${C}06)`,border:`1px solid ${C}30`,borderRadius:14,padding:'16px 20px',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12}}>
      <div>
        <div style={{fontSize:10,fontWeight:700,color:C,textTransform:'uppercase',letterSpacing:'.08em',marginBottom:6}}>Poisson Distribution Poisson(λ)</div>
        <div style={{fontSize:20,fontWeight:700,color:C,fontFamily:"'Space Grotesk',sans-serif"}}>P(X=k) = e^(−λ) · λᵏ / k!</div>
        <div style={{fontSize:11,color:'var(--text-3)',marginTop:4}}>λ={fmt(LAM)} events per interval · P(X={K}) = {fmtP(pdf)}</div>
      </div>
      <div style={{padding:'10px 20px',background:C+'18',borderRadius:12,textAlign:'center'}}>
        <div style={{fontSize:11,color:'var(--text-3)',marginBottom:2}}>P(X={K})</div>
        <div style={{fontSize:32,fontWeight:700,color:C,fontFamily:"'Space Grotesk',sans-serif"}}>{fmtP(pdf)}</div>
      </div>
    </div>
    <div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,padding:'14px 18px'}}>
      <div style={{fontSize:12,fontWeight:600,color:'var(--text-2)',marginBottom:12}}>Real-world scenarios</div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8}}>
        {SCENARIOS.map((sc,i)=>(<button key={i} onClick={()=>{setLam(sc.lam);setK(sc.k);setInterval(1)}} style={{padding:'9px 6px',borderRadius:10,border:`1.5px solid ${Math.abs(lam-sc.lam)<0.01?C:'var(--border-2)'}`,background:Math.abs(lam-sc.lam)<0.01?C+'12':'var(--bg-raised)',cursor:'pointer',textAlign:'center'}}><div style={{fontSize:10,fontWeight:700,color:C}}>λ={sc.lam}</div><div style={{fontSize:9,color:'var(--text-3)'}}>{sc.label}</div></button>))}
      </div>
    </div>
    <CalcShell
      left={<>
        <div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:16,paddingBottom:8,borderBottom:'0.5px solid var(--border)'}}>Parameters</div>
        <div style={{marginBottom:14}}>
          <div style={{fontSize:12.5,fontWeight:600,color:'var(--text)',marginBottom:8}}>λ = average rate per interval: {fmt(lam)}</div>
          <input type="range" min="0.1" max="20" step="0.1" value={lam} onChange={e=>setLam(Number(e.target.value))} style={{width:'100%',accentColor:C,height:6}}/>
          <div style={{display:'flex',justifyContent:'space-between',fontSize:10,color:'var(--text-3)',marginTop:4}}><span>0.1</span><span>10</span><span>20</span></div>
        </div>
        <div style={{marginBottom:14}}>
          <div style={{fontSize:12.5,fontWeight:600,color:'var(--text)',marginBottom:8}}>Time interval multiplier: {interval}x</div>
          <div style={{display:'flex',gap:6}}>{[0.5,1,2,5,10].map(t=>(<button key={t} onClick={()=>setInterval(t)} style={{flex:1,padding:'7px',borderRadius:8,border:`1.5px solid ${interval===t?C:'var(--border)'}`,background:interval===t?C+'12':'var(--bg-raised)',color:interval===t?C:'var(--text-2)',fontSize:11,fontWeight:interval===t?700:500,cursor:'pointer'}}>{t}x</button>))}</div>
          <div style={{fontSize:11,color:'var(--text-3)',marginTop:6}}>Effective λ = {fmt(lam)} × {interval} = <strong style={{color:C}}>{fmt(LAM)}</strong></div>
        </div>
        <div style={{marginBottom:14}}>
          <div style={{fontSize:12.5,fontWeight:600,color:'var(--text)',marginBottom:8}}>k = exact count to find: {K}</div>
          <input type="range" min="0" max={Math.min(maxK,30)} step="1" value={K} onChange={e=>setK(Number(e.target.value))} style={{width:'100%',accentColor:C,height:6}}/>
          <div style={{textAlign:'center',fontSize:14,fontWeight:700,color:C,marginTop:4}}>k = {K}</div>
        </div>
        <div style={{padding:'10px 14px',background:C+'08',borderRadius:10,border:`1px solid ${C}20`,marginBottom:14}}>
          <div style={{fontSize:12,fontWeight:700,color:C}}>P(X={K}) = e^(−{fmt(LAM)}) × {fmt(LAM)}^{K} / {K}!</div>
          <div style={{fontSize:13,fontWeight:700,color:C,marginTop:4}}>= {fmtP(pdf)}</div>
        </div>
        <div style={{display:'flex',gap:10}}>
          <button style={{flex:1,padding:13,borderRadius:10,border:'none',background:C,color:'#fff',fontSize:14,fontWeight:700,cursor:'pointer'}}>Calculate →</button>
          <button onClick={()=>{setLam(3);setK(3);setInterval(1)}} style={{padding:'13px 18px',borderRadius:10,border:'1.5px solid var(--border-2)',background:'var(--bg-raised)',color:'var(--text-2)',fontSize:13,fontWeight:500,cursor:'pointer'}}>Reset</button>
        </div>
      </>}
      right={<>
        <div style={{background:'var(--bg-card)',border:`1.5px solid ${C}30`,borderRadius:14,padding:'18px 20px',marginBottom:14}}>
          <div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',marginBottom:8}}>Poisson({fmt(LAM)}) Probabilities</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
            {[['P(X='+K+')',pdf,C],['P(X≤'+K+')',cdfLE,'#10b981'],['P(X≥'+K+')',cdfGE,'#f59e0b'],['P(X>'+K+')',1-cdfLE,'#ef4444']].map(([label,val,col])=>(<div key={label} style={{padding:'10px',background:col+'08',borderRadius:8,border:`1px solid ${col}20`}}><div style={{fontSize:10,color:'var(--text-3)'}}>{label}</div><div style={{fontSize:18,fontWeight:700,color:col,fontFamily:"'Space Grotesk',sans-serif"}}>{fmtP(val)}</div></div>))}
          </div>
        </div>
        <BreakdownTable title="Distribution Statistics" rows={[
          {label:'P(X=k) exact',value:fmtP(pdf),bold:true,highlight:true,color:C},
          {label:'Mean E[X] = λ',value:fmt(mean)},
          {label:'Variance = λ (unique!)',value:fmt(variance)},
          {label:'Std deviation √λ',value:fmt(stdDev)},
          {label:'P(X≤k) CDF',value:fmtP(cdfLE),color:'#10b981'},
          {label:'P(X≥k)',value:fmtP(cdfGE),color:'#f59e0b'},
          {label:'Mode ⌊λ⌋',value:String(Math.floor(LAM))},
        ]}/>
        <AIHintCard hint={`Poisson(λ=${fmt(LAM)}): P(X=${K})=${fmtP(pdf)}, P(X≤${K})=${fmtP(cdfLE)}. Mean=Variance=λ=${fmt(LAM)}, σ=${fmt(stdDev)}. Mode=${Math.floor(LAM)}.`} color={C}/>
      </>}
    />
    {/* PMF chart */}
    <Sec title="📊 Probability Mass Function — Click bars to explore" sub={`Poisson(λ=${fmt(LAM)})`}>
      <div style={{display:'flex',flexDirection:'column',gap:3,marginBottom:14}}>
        {dist.map((d,i)=>(<div key={i} style={{display:'flex',alignItems:'center',gap:8}}>
          <div style={{width:24,fontSize:11,fontWeight:700,color:d.k===K?C:'var(--text-2)',textAlign:'right',flexShrink:0}}>{d.k}</div>
          <div style={{flex:1,height:18,background:'var(--bg-raised)',borderRadius:4,overflow:'hidden',cursor:'pointer'}} onClick={()=>setK(d.k)}>
            <div style={{width:`${(d.prob/maxProb)*100}%`,height:'100%',background:d.k===K?C:d.k===Math.round(LAM)?C+'80':C+'50',borderRadius:4,transition:'width .3s'}}/>
          </div>
          <div style={{width:55,fontSize:10,color:d.k===K?C:'var(--text-3)',textAlign:'right',flexShrink:0,fontWeight:d.k===K?700:400}}>{fmtP(d.prob)}</div>
        </div>))}
      </div>
      <p style={{fontSize:11,color:'var(--text-3)',margin:0}}>Click any bar to set k. Peak is near λ={fmt(LAM)}. Mean=Variance=λ is a unique Poisson property.</p>
    </Sec>
    {/* Simulation */}
    <Sec title="🎲 Poisson Simulation — Generate Random Events" sub="See how the distribution emerges">
      <div style={{display:'flex',gap:8,marginBottom:14,flexWrap:'wrap'}}>
        {[200,500,1000,5000].map(sc=>(<button key={sc} onClick={()=>{setSimCount(sc);setSimResults(null)}} style={{padding:'7px 14px',borderRadius:20,fontSize:11,fontWeight:600,border:'1.5px solid',borderColor:simCount===sc?C:'var(--border)',background:simCount===sc?C:'var(--bg-raised)',color:simCount===sc?'#fff':'var(--text-2)',cursor:'pointer'}}>{sc.toLocaleString()}</button>))}
      </div>
      <button onClick={simulate} style={{width:'100%',padding:13,borderRadius:10,border:'none',background:C,color:'#fff',fontSize:14,fontWeight:700,cursor:'pointer',marginBottom:14}}>▶ Simulate {simCount.toLocaleString()} Intervals</button>
      {simResults&&(<div>
        <div style={{display:'flex',flexDirection:'column',gap:3,marginBottom:12}}>
          {dist.map((d,i)=>(<div key={i} style={{display:'flex',alignItems:'center',gap:8}}>
            <div style={{width:24,fontSize:10,textAlign:'right',flexShrink:0,color:'var(--text-2)'}}>{d.k}</div>
            <div style={{flex:1,height:14,background:'var(--bg-raised)',borderRadius:3,overflow:'hidden',position:'relative'}}>
              <div style={{position:'absolute',left:0,top:0,height:'100%',width:`${(d.prob/maxProb)*100}%`,background:C+'40',borderRadius:3}}/>
              <div style={{position:'absolute',left:0,top:0,height:'100%',width:`${((simResults.counts[d.k]||0)/simResults.total/maxProb)*100}%`,background:'#ef4444',borderRadius:3,opacity:0.7}}/>
            </div>
            <div style={{width:55,fontSize:9,color:C,textAlign:'right',flexShrink:0}}>{fmtP(d.prob)}</div>
            <div style={{width:55,fontSize:9,color:'#ef4444',textAlign:'right',flexShrink:0}}>{fmtP((simResults.counts[d.k]||0)/simResults.total)}</div>
          </div>))}
        </div>
        <div style={{display:'flex',gap:12,fontSize:10}}><span style={{color:C}}>█ Theoretical</span><span style={{color:'#ef4444'}}>█ Simulated</span></div>
      </div>)}
    </Sec>
    <Sec title="Frequently asked questions">{FAQ.map((f,i)=><Acc key={i} q={f.q} a={f.a} open={openFaq===i} onToggle={()=>setFaq(openFaq===i?null:i)} color={C}/>)}</Sec>
  </div>)
}
