import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'
const fmt=n=>(isNaN(n)||!isFinite(n))? '—':parseFloat(Number(n).toFixed(6)).toString()
const fmtP=n=>(n*100).toFixed(4)+'%'
function factorial(n){if(n<=1)return 1;if(n>170)return Infinity;let r=1;for(let i=2;i<=n;i++)r*=i;return r}
function nCr(n,r){if(r>n||r<0)return 0;return factorial(n)/(factorial(r)*factorial(n-r))}
function binomPDF(n,k,p){return nCr(n,k)*Math.pow(p,k)*Math.pow(1-p,n-k)}
function binomCDF(n,k,p){let s=0;for(let i=0;i<=k;i++)s+=binomPDF(n,i,p);return Math.min(1,s)}
function Sec({title,sub,children}){return(<div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,overflow:'hidden'}}><div style={{padding:'13px 18px',borderBottom:'0.5px solid var(--border)',display:'flex',justifyContent:'space-between'}}><span style={{fontSize:13,fontWeight:700,color:'var(--text)',fontFamily:"'Space Grotesk',sans-serif"}}>{title}</span>{sub&&<span style={{fontSize:11,color:'var(--text-3)'}}>{sub}</span>}</div><div style={{padding:'16px 18px'}}>{children}</div></div>)}
function Acc({q,a,open,onToggle,color}){return(<div style={{borderBottom:'0.5px solid var(--border)'}}><button onClick={onToggle} style={{width:'100%',display:'flex',justifyContent:'space-between',alignItems:'center',padding:'13px 0',background:'none',border:'none',cursor:'pointer',gap:12,textAlign:'left'}}><span style={{fontSize:13,fontWeight:600,color:'var(--text)',fontFamily:"'DM Sans',sans-serif",lineHeight:1.4}}>{q}</span><span style={{fontSize:18,color,flexShrink:0,transform:open?'rotate(45deg)':'none',transition:'transform .2s'}}>+</span></button>{open&&<p style={{fontSize:12.5,color:'var(--text-2)',lineHeight:1.75,margin:'0 0 13px'}}>{a}</p>}</div>)}
const FAQ=[
  {q:'What is the binomial distribution?',a:'The binomial distribution models the number of successes in n independent trials, each with probability p of success. Conditions: fixed n, only two outcomes (success/failure), same p each trial, independent trials. Examples: number of heads in 10 coin flips, defectives in a batch, patients responding to treatment.'},
  {q:'What are the mean and variance of a binomial?',a:'Mean (expected value) = np. Variance = np(1−p). Standard deviation = √(np(1−p)). For n=100 coin flips: mean=50, std dev=5. About 95% of results fall within 2 std devs: 40 to 60 heads. The distribution is symmetric when p=0.5 and skewed otherwise.'},
  {q:'When does binomial approximate normal?',a:"By the Central Limit Theorem, Binomial(n,p) ≈ Normal(np, np(1−p)) when n is large and p is not too extreme. Rule of thumb: np ≥ 10 and n(1−p) ≥ 10. For n=100, p=0.5: np=50, n(1−p)=50 — excellent normal approximation."},
  {q:'When does binomial approximate Poisson?',a:'When n is large and p is small (rare events), Binomial(n,p) ≈ Poisson(np). Rule of thumb: n≥20, p≤0.05. The Poisson distribution is simpler — only one parameter λ=np. Used for counts of rare events: accidents per day, emails per hour, mutations per gene.'},
]
export default function BinomialDistributionCalculator({meta,category}){
  const C=category?.color||'#6366f1'
  const[n,setN]=useState(10)
  const[p,setP]=useState(0.5)
  const[k,setK]=useState(5)
  const[openFaq,setFaq]=useState(null)
  const[simResults,setSimResults]=useState(null)
  const[simCount,setSimCount]=useState(1000)
  const N=Math.max(1,Math.min(30,Math.round(n)))
  const K=Math.max(0,Math.min(N,Math.round(k)))
  const P=Math.max(0,Math.min(1,p))
  const pdf=binomPDF(N,K,P)
  const cdfLE=binomCDF(N,K,P)
  const cdfLT=binomCDF(N,K-1,P)
  const cdfGE=1-cdfLT
  const cdfGT=1-cdfLE
  const mean=N*P
  const variance=N*P*(1-P)
  const stdDev=Math.sqrt(variance)
  const dist=Array.from({length:N+1},(_,i)=>({k:i,prob:binomPDF(N,i,P),cdf:binomCDF(N,i,P)}))
  const maxProb=Math.max(...dist.map(d=>d.prob))
  function simulate(){const results=Array.from({length:simCount},()=>Array.from({length:N},()=>Math.random()<P?1:0).reduce((a,v)=>a+v,0));const counts=new Array(N+1).fill(0);results.forEach(r=>counts[r]++);setSimResults(counts)}
  return(<div style={{display:'flex',flexDirection:'column',gap:20}}>
    <div style={{background:`linear-gradient(135deg,${C}12,${C}06)`,border:`1px solid ${C}30`,borderRadius:14,padding:'16px 20px',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12}}>
      <div>
        <div style={{fontSize:10,fontWeight:700,color:C,textTransform:'uppercase',letterSpacing:'.08em',marginBottom:6}}>Binomial Distribution B(n,p)</div>
        <div style={{fontSize:20,fontWeight:700,color:C,fontFamily:"'Space Grotesk',sans-serif"}}>P(X=k) = C(n,k) · pᵏ · (1−p)ⁿ⁻ᵏ</div>
        <div style={{fontSize:11,color:'var(--text-3)',marginTop:4}}>n={N} trials, p={P} success probability, k={K} successes</div>
      </div>
      <div style={{padding:'10px 20px',background:C+'18',borderRadius:12,textAlign:'center'}}>
        <div style={{fontSize:11,color:'var(--text-3)',marginBottom:2}}>P(X={K})</div>
        <div style={{fontSize:32,fontWeight:700,color:C,fontFamily:"'Space Grotesk',sans-serif"}}>{fmtP(pdf)}</div>
      </div>
    </div>
    <div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,padding:'14px 18px'}}>
      <div style={{fontSize:12,fontWeight:600,color:'var(--text-2)',marginBottom:12}}>Common scenarios</div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8}}>
        {[{l:'Coin 10 flips',n:10,p:0.5,k:5},{l:'Die 20 rolls',n:20,p:1/6,k:3},{l:'Drug trial',n:100,p:0.3,k:30},{l:'Quality 50',n:50,p:0.05,k:2}].map((ex,i)=>(<button key={i} onClick={()=>{setN(ex.n);setP(parseFloat(ex.p.toFixed(4)));setK(ex.k)}} style={{padding:'9px 6px',borderRadius:10,border:`1.5px solid ${N===ex.n&&Math.abs(P-ex.p)<0.001?C:'var(--border-2)'}`,background:N===ex.n&&Math.abs(P-ex.p)<0.001?C+'12':'var(--bg-raised)',cursor:'pointer',textAlign:'center'}}><div style={{fontSize:10,fontWeight:700,color:C}}>n={ex.n},p={(ex.p*100).toFixed(0)}%</div><div style={{fontSize:9,color:'var(--text-3)'}}>{ex.l}</div></button>))}
      </div>
    </div>
    <CalcShell
      left={<>
        <div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:16,paddingBottom:8,borderBottom:'0.5px solid var(--border)'}}>Parameters</div>
        <div style={{marginBottom:14}}>
          <div style={{fontSize:12.5,fontWeight:600,color:'var(--text)',marginBottom:8}}>n = number of trials (1–30)</div>
          <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
            {[5,10,15,20,25,30].map(k2=>(<button key={k2} onClick={()=>setN(k2)} style={{padding:'6px 12px',borderRadius:20,fontSize:11,fontWeight:600,border:'1.5px solid',borderColor:N===k2?C:'var(--border)',background:N===k2?C:'var(--bg-raised)',color:N===k2?'#fff':'var(--text-2)',cursor:'pointer'}}>{k2}</button>))}
          </div>
        </div>
        <div style={{marginBottom:14}}>
          <div style={{fontSize:12.5,fontWeight:600,color:'var(--text)',marginBottom:8}}>p = success probability: {(P*100).toFixed(1)}%</div>
          <input type="range" min="0" max="1" step="0.01" value={P} onChange={e=>setP(Number(e.target.value))} style={{width:'100%',accentColor:C,height:6}}/>
          <div style={{display:'flex',justifyContent:'space-between',fontSize:10,color:'var(--text-3)',marginTop:4}}><span>0%</span><span>50%</span><span>100%</span></div>
        </div>
        <div style={{marginBottom:14}}>
          <div style={{fontSize:12.5,fontWeight:600,color:'var(--text)',marginBottom:8}}>k = number of successes (0–{N})</div>
          <input type="range" min="0" max={N} step="1" value={K} onChange={e=>setK(Number(e.target.value))} style={{width:'100%',accentColor:C,height:6}}/>
          <div style={{textAlign:'center',fontSize:14,fontWeight:700,color:C,marginTop:4}}>k = {K}</div>
        </div>
        <div style={{padding:'10px 14px',background:C+'08',borderRadius:10,border:`1px solid ${C}20`,marginBottom:14}}>
          <div style={{fontSize:12,fontWeight:700,color:C}}>P(X={K}) = C({N},{K}) × {fmt(P)}^{K} × {fmt(1-P)}^{N-K}</div>
          <div style={{fontSize:13,fontWeight:700,color:C,marginTop:4}}>= {fmt(nCr(N,K))} × {fmt(Math.pow(P,K))} × {fmt(Math.pow(1-P,N-K))} = {fmtP(pdf)}</div>
        </div>
        <div style={{display:'flex',gap:10}}>
          <button style={{flex:1,padding:13,borderRadius:10,border:'none',background:C,color:'#fff',fontSize:14,fontWeight:700,cursor:'pointer'}}>Calculate →</button>
          <button onClick={()=>{setN(10);setP(0.5);setK(5)}} style={{padding:'13px 18px',borderRadius:10,border:'1.5px solid var(--border-2)',background:'var(--bg-raised)',color:'var(--text-2)',fontSize:13,fontWeight:500,cursor:'pointer'}}>Reset</button>
        </div>
      </>}
      right={<>
        <div style={{background:'var(--bg-card)',border:`1.5px solid ${C}30`,borderRadius:14,padding:'18px 20px',marginBottom:14}}>
          <div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',marginBottom:8}}>Probabilities</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
            {[['P(X='+K+')',pdf,C],['P(X≤'+K+')',cdfLE,'#10b981'],['P(X≥'+K+')',cdfGE,'#f59e0b'],['P(X>'+K+')',cdfGT,'#ef4444']].map(([label,val,col])=>(<div key={label} style={{padding:'10px',background:col+'08',borderRadius:8,border:`1px solid ${col}20`}}><div style={{fontSize:10,color:'var(--text-3)'}}>{label}</div><div style={{fontSize:18,fontWeight:700,color:col,fontFamily:"'Space Grotesk',sans-serif"}}>{fmtP(val)}</div></div>))}
          </div>
        </div>
        <BreakdownTable title="Distribution Statistics" rows={[
          {label:'P(X=k) exact',value:fmtP(pdf),bold:true,highlight:true,color:C},
          {label:'Mean E[X] = np',value:fmt(mean)},
          {label:'Variance np(1−p)',value:fmt(variance)},
          {label:'Std deviation',value:fmt(stdDev)},
          {label:'P(X≤k) CDF',value:fmtP(cdfLE),color:'#10b981'},
          {label:'P(X≥k)',value:fmtP(cdfGE),color:'#f59e0b'},
          {label:'C(n,k)',value:fmt(nCr(N,K)),note:'ways to choose k from n'},
        ]}/>
        <AIHintCard hint={`B(${N},${P}): P(X=${K})=${fmtP(pdf)}, P(X≤${K})=${fmtP(cdfLE)}, P(X≥${K})=${fmtP(cdfGE)}. Mean=${fmt(mean)}, σ=${fmt(stdDev)}.`} color={C}/>
      </>}
    />
    {/* Distribution chart */}
    <Sec title="📊 Probability Mass Function — Interactive Chart" sub={`B(${N}, ${(P*100).toFixed(1)}%)`}>
      <div style={{display:'flex',flexDirection:'column',gap:3,marginBottom:14}}>
        {dist.map((d,i)=>(<div key={i} style={{display:'flex',alignItems:'center',gap:8}}>
          <div style={{width:24,fontSize:11,fontWeight:700,color:d.k===K?C:'var(--text-2)',textAlign:'right',flexShrink:0}}>{d.k}</div>
          <div style={{flex:1,height:18,background:'var(--bg-raised)',borderRadius:4,overflow:'hidden',cursor:'pointer'}} onClick={()=>setK(d.k)}>
            <div style={{width:`${(d.prob/maxProb)*100}%`,height:'100%',background:d.k===K?C:C+'60',borderRadius:4,transition:'width .3s'}}/>
          </div>
          <div style={{width:55,fontSize:10,color:d.k===K?C:'var(--text-3)',textAlign:'right',flexShrink:0,fontWeight:d.k===K?700:400}}>{fmtP(d.prob)}</div>
          <div style={{width:55,fontSize:10,color:'var(--text-3)',textAlign:'right',flexShrink:0}}>≤{fmtP(d.cdf)}</div>
        </div>))}
      </div>
      <p style={{fontSize:11,color:'var(--text-3)',margin:0}}>Click any bar to select that k value. Left column = exact P(X=k). Right = cumulative P(X≤k).</p>
    </Sec>
    {/* Simulation */}
    <Sec title="🎲 Monte Carlo Simulation" sub="Compare empirical vs theoretical distribution">
      <div style={{display:'flex',gap:8,marginBottom:14,flexWrap:'wrap'}}>
        {[100,500,1000,5000].map(k2=>(<button key={k2} onClick={()=>{setSimCount(k2);setSimResults(null)}} style={{padding:'7px 14px',borderRadius:20,fontSize:11,fontWeight:600,border:'1.5px solid',borderColor:simCount===k2?C:'var(--border)',background:simCount===k2?C:'var(--bg-raised)',color:simCount===k2?'#fff':'var(--text-2)',cursor:'pointer'}}>{k2.toLocaleString()}</button>))}
      </div>
      <button onClick={simulate} style={{width:'100%',padding:13,borderRadius:10,border:'none',background:C,color:'#fff',fontSize:14,fontWeight:700,cursor:'pointer',marginBottom:14}}>▶ Simulate {simCount.toLocaleString()} Experiments</button>
      {simResults&&(<div>
        <div style={{display:'flex',flexDirection:'column',gap:3,marginBottom:12}}>
          {dist.map((d,i)=>(<div key={i} style={{display:'flex',alignItems:'center',gap:8}}>
            <div style={{width:24,fontSize:10,textAlign:'right',flexShrink:0,color:'var(--text-2)'}}>{d.k}</div>
            <div style={{flex:1,height:14,background:'var(--bg-raised)',borderRadius:3,overflow:'hidden',position:'relative'}}>
              <div style={{position:'absolute',left:0,top:0,height:'100%',width:`${(d.prob/maxProb)*100}%`,background:C+'40',borderRadius:3}}/>
              <div style={{position:'absolute',left:0,top:0,height:'100%',width:`${((simResults[d.k]||0)/simCount/maxProb)*100}%`,background:'#ef4444',borderRadius:3,opacity:0.7}}/>
            </div>
            <div style={{width:55,fontSize:9,color:C,textAlign:'right',flexShrink:0}}>{fmtP(d.prob)}</div>
            <div style={{width:55,fontSize:9,color:'#ef4444',textAlign:'right',flexShrink:0}}>{fmtP((simResults[d.k]||0)/simCount)}</div>
          </div>))}
        </div>
        <div style={{display:'flex',gap:12,fontSize:10}}><span style={{color:C}}>█ Theoretical</span><span style={{color:'#ef4444'}}>█ Simulated</span></div>
      </div>)}
    </Sec>
    <Sec title="Frequently asked questions">{FAQ.map((f,i)=><Acc key={i} q={f.q} a={f.a} open={openFaq===i} onToggle={()=>setFaq(openFaq===i?null:i)} color={C}/>)}</Sec>
  </div>)
}
