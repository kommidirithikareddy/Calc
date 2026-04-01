import { useState, useMemo } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'

const fmt  = n => (isNaN(n)||!isFinite(n)) ? '—' : parseFloat(Number(n).toFixed(6)).toString()
const fmt2 = n => (isNaN(n)||!isFinite(n)) ? '—' : parseFloat(Number(n).toFixed(2)).toString()

function erf(x){const t=1/(1+0.3275911*Math.abs(x));const y=1-t*(0.254829592+t*(-0.284496736+t*(1.421413741+t*(-1.453152027+t*1.061405429))))*Math.exp(-x*x);return x>=0?y:-y}
function normalCDF(z){return 0.5*(1+erf(z/Math.sqrt(2)))}
function normalPDF(z){return Math.exp(-z*z/2)/Math.sqrt(2*Math.PI)}
function invNorm(p){if(p<=0)return -Infinity;if(p>=1)return Infinity;const a=[2.515517,0.802853,0.010328],b=[1.432788,0.189269,0.001308];const sign=p<0.5?-1:1,q2=Math.min(p,1-p),t=Math.sqrt(-2*Math.log(q2));return sign*(t-(a[0]+t*(a[1]+t*a[2]))/(1+t*(b[0]+t*(b[1]+t*b[2]))))}

const T_CRIT={90:{1:6.314,2:2.920,5:2.015,10:1.812,15:1.753,20:1.725,25:1.708,30:1.697,40:1.684,60:1.671,120:1.658,999:1.645},95:{1:12.706,2:4.303,5:2.571,10:2.228,15:2.131,20:2.086,25:2.060,30:2.042,40:2.021,60:2.000,120:1.980,999:1.960},99:{1:63.657,2:9.925,5:4.032,10:3.169,15:2.947,20:2.845,25:2.787,30:2.750,40:2.704,60:2.660,120:2.617,999:2.576}}
function getTCrit(df,cl){const tbl=T_CRIT[cl]||T_CRIT[95];const keys=Object.keys(tbl).map(Number).sort((a,b)=>a-b);const k=keys.find(k=>k>=df)||keys[keys.length-1];return tbl[k]}

function Sec({title,sub,icon,children,color,accent}){return(<div style={{background:'var(--bg-card)',border:`1px solid ${accent||'var(--border)'}`,borderRadius:16,overflow:'hidden',boxShadow:accent?`0 0 0 1px ${accent}18`:'none'}}><div style={{padding:'14px 20px',borderBottom:'1px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center',background:accent?accent+'07':'transparent'}}><div style={{display:'flex',alignItems:'center',gap:10}}>{icon&&<span style={{fontSize:18}}>{icon}</span>}<span style={{fontSize:13,fontWeight:700,color:'var(--text)',fontFamily:"'Space Grotesk',sans-serif"}}>{title}</span></div>{sub&&<span style={{fontSize:11,color:'var(--text-3)',background:'var(--bg-raised)',padding:'3px 10px',borderRadius:20}}>{sub}</span>}</div><div style={{padding:'18px 20px'}}>{children}</div></div>)}

function Acc({q,a,open,onToggle,color}){return(<div style={{borderBottom:'0.5px solid var(--border)'}}><button onClick={onToggle} style={{width:'100%',display:'flex',justifyContent:'space-between',alignItems:'center',padding:'14px 0',background:'none',border:'none',cursor:'pointer',gap:12,textAlign:'left'}}><span style={{fontSize:13,fontWeight:600,color:'var(--text)',fontFamily:"'DM Sans',sans-serif",lineHeight:1.4}}>{q}</span><div style={{width:24,height:24,borderRadius:'50%',background:open?color:color+'20',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,transition:'all .2s'}}><span style={{fontSize:14,color:open?'#fff':color,transform:open?'rotate(45deg)':'none',transition:'transform .2s',display:'block',lineHeight:1}}>+</span></div></button>{open&&<div style={{paddingBottom:14}}><p style={{fontSize:12.5,color:'var(--text-2)',lineHeight:1.8,margin:0,background:'var(--bg-raised)',padding:'12px 14px',borderRadius:10}}>{a}</p></div>}</div>)}

function Inp({label,value,onChange,color,hint,step='any',unit}){const[f,sf]=useState(false);return(<div style={{marginBottom:14}}><div style={{display:'flex',justifyContent:'space-between',marginBottom:7}}><label style={{fontSize:12.5,fontWeight:600,color:'var(--text)',fontFamily:"'DM Sans',sans-serif"}}>{label}</label>{hint&&<span style={{fontSize:10,color:'var(--text-3)',background:'var(--bg-raised)',padding:'2px 8px',borderRadius:10}}>{hint}</span>}</div><div style={{display:'flex',height:46,border:`2px solid ${f?color:'var(--border-2)'}`,borderRadius:10,overflow:'hidden',background:'var(--bg-card)',boxShadow:f?`0 0 0 3px ${color}18`:'none',transition:'all .15s'}}><input type="number" step={step} value={value} onChange={e=>onChange(Number(e.target.value))} onFocus={()=>sf(true)} onBlur={()=>sf(false)} style={{flex:1,border:'none',background:'transparent',padding:'0 14px',fontSize:17,fontWeight:700,color:'var(--text)',outline:'none',fontFamily:"'Space Grotesk',sans-serif"}}/>{unit&&<div style={{padding:'0 14px',display:'flex',alignItems:'center',background:'var(--bg-raised)',borderLeft:'1px solid var(--border-2)'}}><span style={{fontSize:12,fontWeight:600,color:'var(--text-3)'}}>{unit}</span></div>}</div></div>)}

function StatBadge({label,value,sub,color}){return(<div style={{padding:'12px',borderRadius:12,background:`${color}12`,border:`1.5px solid ${color}30`,textAlign:'center'}}><div style={{fontSize:10,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:4}}>{label}</div><div style={{fontSize:20,fontWeight:700,color,fontFamily:"'Space Grotesk',sans-serif",lineHeight:1}}>{value}</div>{sub&&<div style={{fontSize:10,color:'var(--text-3)',marginTop:4}}>{sub}</div>}</div>)}

const SCENARIOS=[
  {label:'Exam scores',icon:'🎓',mean:75,std:10,n:40,cl:95,mode:'mean',desc:'Class of 40, mean=75, SD=10'},
  {label:'Election poll',icon:'🗳️',p:0.52,n:1000,cl:95,mode:'proportion',desc:'n=1000, 52% support'},
  {label:'Drug trial',icon:'💊',mean:128,std:15,n:25,cl:99,mode:'mean',desc:'BP reduction, n=25'},
  {label:'Quality control',icon:'🏭',mean:500.2,std:2.1,n:50,cl:95,mode:'mean',desc:'Product weights, n=50'},
]

const FAQ=[
  {q:'What does a 95% confidence interval actually mean?',a:"A 95% CI does NOT mean 'there is a 95% probability the true value is in this range.' The true parameter is fixed — it either is or isn't in the interval. The 95% describes the long-run procedure: if you repeated this sampling process 100 times, approximately 95 of those intervals would capture the true parameter."},
  {q:'When should I use z-distribution vs t-distribution?',a:"Use z when you know σ or n ≥ 30. Use t when n < 30 AND you don't know σ (the common real-world case). The t-distribution has heavier tails — giving wider, more honest intervals — to account for the extra uncertainty of estimating σ from small samples. As df → ∞, t → z."},
  {q:'How does sample size affect CI width?',a:"Width = 2 × ME = 2 × z*σ/√n. Width shrinks as 1/√n — to halve the width you need 4× more data. To cut width by 10×, you'd need 100× more. This rapidly diminishing return explains why survey sizes typically plateau around n=1,000."},
  {q:'What is the margin of error?',a:"ME = critical value × standard error = z* × σ/√n. It's the 'plus or minus' in media reports: '52% ± 3%'. ME captures sampling uncertainty only — not non-response bias, question wording, or other systematic errors."},
  {q:"What's the difference between confidence level and confidence interval?",a:'Confidence level (e.g. 95%) is the desired long-run success rate of your interval procedure. Confidence interval is the actual [lower, upper] range from your data. Higher confidence level → wider interval for the same data.'},
  {q:'Why might a 99% CI be less useful than a 95% CI?',a:"A 99% CI is always wider. If too wide, it may be practically uninformative — 'the average is between 10 and 90' is correct but useless. The choice of confidence level trades precision for reliability. 95% is standard; 99% is used in safety-critical contexts."},
]

export default function ConfidenceIntervalCalculator({meta,category}){
  const C=category?.color||'#6366f1'
  const[mode,setMode]=useState('mean')
  const[mean,setMean]=useState(75)
  const[std,setStd]=useState(10)
  const[n,setN]=useState(40)
  const[cl,setCl]=useState(95)
  const[pHat,setPhat]=useState(0.52)
  const[nProp,setNProp]=useState(1000)
  const[openFaq,setFaq]=useState(null)
  const[activeScenario,setActiveScenario]=useState(0)
  const[simRuns,setSimRuns]=useState(null)
  const[isSimulating,setIsSimulating]=useState(false)

  const N=Math.max(2,Math.round(n))
  const S=Math.max(0.001,std)
  const df=N-1
  const useZ=N>=30
  const zStar=Math.abs(invNorm((1-cl/100)/2))
  const tStar=useZ?zStar:getTCrit(df,cl)
  const se_mean=S/Math.sqrt(N),me_mean=tStar*se_mean,lo_mean=mean-me_mean,hi_mean=mean+me_mean
  const se_prop=Math.sqrt(pHat*(1-pHat)/nProp),me_prop=zStar*se_prop,lo_prop=Math.max(0,pHat-me_prop),hi_prop=Math.min(1,pHat+me_prop)
  const lo=mode==='mean'?lo_mean:lo_prop,hi=mode==='mean'?hi_mean:hi_prop
  const me=mode==='mean'?me_mean:me_prop,crit=mode==='mean'?tStar:zStar,se=mode==='mean'?se_mean:se_prop
  const center=mode==='mean'?mean:pHat

  function runSimulation(){
    setIsSimulating(true)
    setTimeout(()=>{
      const REPS=100,trueMean=mean
      const results=Array.from({length:REPS},()=>{
        const sample=Array.from({length:N},()=>trueMean+S*(Math.random()+Math.random()+Math.random()+Math.random()-2))
        const sm=sample.reduce((a,b)=>a+b)/N
        const ss=Math.sqrt(sample.reduce((a,b)=>a+(b-sm)**2,0)/N)
        const me2=tStar*ss/Math.sqrt(N)
        return{lo:sm-me2,hi:sm+me2,contains:sm-me2<=trueMean&&trueMean<=sm+me2}
      })
      setSimRuns({results,hits:results.filter(r=>r.contains).length,trueMean})
      setIsSimulating(false)
    },80)
  }

  const W=300,H=140,zMin=-4,zMax=4
  const toSx=zv=>((zv-zMin)/(zMax-zMin))*(W-24)+12
  const toSy=pv=>H-18-(pv/normalPDF(0))*(H-32)
  const curvePts=Array.from({length:81},(_,i)=>{const zv=zMin+(i/80)*(zMax-zMin);return`${toSx(zv)},${Math.max(6,Math.min(H-6,toSy(normalPDF(zv))))}`}).join(' ')
  const shadeCI=useMemo(()=>{const pts=[`${toSx(-crit)},${H-18}`];for(let i=0;i<=80;i++){const zv=zMin+(i/80)*(zMax-zMin);if(zv>=-crit&&zv<=crit)pts.push(`${toSx(zv)},${Math.max(6,Math.min(H-6,toSy(normalPDF(zv))))}`)}pts.push(`${toSx(crit)},${H-18}`);return pts.join(' ')},[crit])

  const sweepNs=[5,10,15,20,30,50,75,100,200,500,1000]
  const sweepData=sweepNs.map(k=>{const se2=mode==='mean'?S/Math.sqrt(k):Math.sqrt(pHat*(1-pHat)/k);const c2=k>=30?zStar:getTCrit(k-1,cl);return{n:k,width:2*c2*se2}})
  const maxSW=Math.max(...sweepData.map(d=>d.width))

  const ciCompare=[90,95,99].map(level=>{
    const zs=Math.abs(invNorm((1-level/100)/2))
    const ts=N>=30?zs:getTCrit(df,level)
    const c2=mode==='mean'?ts:zs,me2=mode==='mean'?c2*se_mean:c2*se_prop
    return{level,lo:center-me2,hi:center+me2,me:me2,crit:c2}
  })
  const maxME=Math.max(...ciCompare.map(c=>c.me))

  return(<div style={{display:'flex',flexDirection:'column',gap:22}}>

    {/* ── HERO BANNER ── */}
    <div style={{background:`linear-gradient(135deg,${C}15,${C}05)`,border:`1.5px solid ${C}35`,borderRadius:18,padding:'20px 24px',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:16}}>
      <div>
        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
          <div style={{width:32,height:32,borderRadius:10,background:`${C}20`,display:'flex',alignItems:'center',justifyContent:'center'}}><span style={{fontSize:18}}>📊</span></div>
          <div style={{fontSize:10,fontWeight:700,color:C,textTransform:'uppercase',letterSpacing:'.1em'}}>Confidence Interval Calculator</div>
        </div>
        <div style={{fontSize:22,fontWeight:700,color:C,fontFamily:"'Space Grotesk',sans-serif",marginBottom:4}}>{mode==='mean'?`x̄ ± ${useZ?'z*':'t*'} · (s/√n)`:'p̂ ± z* · √(p̂(1−p̂)/n)'}</div>
        <div style={{fontSize:12,color:'var(--text-3)'}}>{cl}% confidence · {mode==='mean'?(useZ?`z* = ${fmt2(zStar)}`:`t*(${df}) = ${fmt2(tStar)}`):(`z* = ${fmt2(zStar)}`)}</div>
      </div>
      <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
        {[['Lower',mode==='mean'?fmt2(lo_mean):(lo_prop*100).toFixed(2)+'%','#10b981'],['± ME',mode==='mean'?`±${fmt2(me_mean)}`:`±${(me_prop*100).toFixed(2)}%`,'var(--text)'],['Upper',mode==='mean'?fmt2(hi_mean):(hi_prop*100).toFixed(2)+'%','#ef4444']].map(([l,v,col])=>(
          <div key={l} style={{padding:'12px 18px',background:col==='var(--text)'?`${C}08`:`${col}15`,borderRadius:12,textAlign:'center',border:`1.5px solid ${col==='var(--text)'?`${C}20`:`${col}30`}`}}>
            <div style={{fontSize:10,color:'var(--text-3)',marginBottom:4}}>{l}</div>
            <div style={{fontSize:22,fontWeight:700,color:col==='var(--text)'?'var(--text)':col,fontFamily:"'Space Grotesk',sans-serif"}}>{v}</div>
          </div>
        ))}
      </div>
    </div>

    {/* ── SECTION 1: SCENARIOS ── */}
    <Sec title="Real-World Scenarios" icon="🌍" sub="Click to load" accent={C}>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10}}>
        {SCENARIOS.map((sc,i)=>(<button key={i} onClick={()=>{setActiveScenario(i);setMode(sc.mode);if(sc.mode==='mean'){setMean(sc.mean);setStd(sc.std);setN(sc.n);setCl(sc.cl)}else{setPhat(sc.p);setNProp(sc.n);setCl(sc.cl)}}} style={{padding:'14px 10px',borderRadius:12,border:`2px solid ${activeScenario===i?C:'var(--border)'}`,background:activeScenario===i?`${C}12`:'var(--bg-raised)',cursor:'pointer',textAlign:'center',transition:'all .15s'}}>
          <div style={{fontSize:24,marginBottom:6}}>{sc.icon}</div>
          <div style={{fontSize:11,fontWeight:700,color:activeScenario===i?C:'var(--text)',marginBottom:3}}>{sc.label}</div>
          <div style={{fontSize:9,color:'var(--text-3)',lineHeight:1.4}}>{sc.desc}</div>
        </button>))}
      </div>
    </Sec>

    {/* ── SECTION 2: CALCULATOR ── */}
    <CalcShell
      left={<>
        <div style={{marginBottom:18}}>
          <div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:10}}>Estimating</div>
          <div style={{display:'flex',gap:8,background:'var(--bg-raised)',padding:4,borderRadius:12}}>
            {[['mean','📐 Population Mean'],['proportion','📊 Proportion']].map(([k,l])=>(<button key={k} onClick={()=>setMode(k)} style={{flex:1,padding:'10px',borderRadius:9,border:'none',background:mode===k?C:'transparent',color:mode===k?'#fff':'var(--text-2)',cursor:'pointer',fontSize:12,fontWeight:mode===k?700:500,transition:'all .2s'}}>{l}</button>))}
          </div>
        </div>
        <div style={{marginBottom:18}}>
          <div style={{fontSize:12.5,fontWeight:600,color:'var(--text)',marginBottom:10}}>Confidence Level</div>
          <div style={{display:'flex',gap:8}}>
            {[90,95,99].map(c=>(<button key={c} onClick={()=>setCl(c)} style={{flex:1,padding:'12px',borderRadius:10,border:`2px solid ${cl===c?C:'var(--border)'}`,background:cl===c?C:'var(--bg-raised)',color:cl===c?'#fff':'var(--text-2)',cursor:'pointer',fontSize:14,fontWeight:700,transition:'all .2s'}}>{c}%</button>))}
          </div>
        </div>
        {mode==='mean'?<><Inp label="Sample mean (x̄)" value={mean} onChange={setMean} color={C} step="0.1"/><Inp label="Standard deviation (s or σ)" value={std} onChange={v=>setStd(Math.max(0.001,v))} color={C} step="0.1" hint="sample or population"/><Inp label="Sample size (n)" value={n} onChange={v=>setN(Math.max(2,Math.round(v)))} color={C} hint="≥ 2"/></>
        :<><Inp label="Sample proportion (p̂)" value={pHat} onChange={v=>setPhat(Math.max(0.001,Math.min(0.999,v)))} color={C} step="0.01" hint="e.g. 0.52 = 52%"/><Inp label="Sample size (n)" value={nProp} onChange={v=>setNProp(Math.max(2,Math.round(v)))} color={C}/></>}
        <div style={{padding:'14px 16px',background:`${C}08`,borderRadius:12,border:`1.5px solid ${C}25`,marginBottom:16}}>
          <div style={{fontSize:10,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:8}}>Live formula</div>
          {mode==='mean'?(<>
            <div style={{fontSize:12,color:'var(--text-2)',marginBottom:3}}>SE = {fmt2(S)} / √{N} = <strong style={{color:C}}>{fmt(se_mean)}</strong></div>
            <div style={{fontSize:12,color:'var(--text-2)',marginBottom:3}}>{useZ?'z*':'t*'} = <strong style={{color:C}}>{fmt2(tStar)}</strong></div>
            <div style={{fontSize:12,color:'var(--text-2)',marginBottom:3}}>ME = {fmt2(tStar)} × {fmt(se_mean)} = <strong style={{color:C}}>{fmt2(me_mean)}</strong></div>
            <div style={{fontSize:13,fontWeight:700,color:C}}>CI = [{fmt2(lo_mean)}, {fmt2(hi_mean)}]</div>
          </>):(<>
            <div style={{fontSize:12,color:'var(--text-2)',marginBottom:3}}>SE = √({fmt2(pHat)}×{fmt2(1-pHat)}/{nProp}) = <strong style={{color:C}}>{fmt(se_prop)}</strong></div>
            <div style={{fontSize:12,color:'var(--text-2)',marginBottom:3}}>z* = <strong style={{color:C}}>{fmt2(zStar)}</strong></div>
            <div style={{fontSize:13,fontWeight:700,color:C}}>CI = [{(lo_prop*100).toFixed(2)}%, {(hi_prop*100).toFixed(2)}%]</div>
          </>)}
        </div>
        <div style={{padding:'10px 14px',borderRadius:10,background:useZ?'#10b98110':'#f59e0b10',border:`1px solid ${useZ?'#10b98130':'#f59e0b30'}`,marginBottom:16}}>
          <div style={{fontSize:12,fontWeight:700,color:useZ?'#10b981':'#f59e0b',marginBottom:2}}>{useZ?'✓ Z-distribution':'⚡ t-distribution'}</div>
          <div style={{fontSize:11,color:'var(--text-2)'}}>{mode==='mean'?(useZ?`n=${N}≥30: z*=${fmt2(zStar)}`:`n=${N}<30, df=${df}: t*=${fmt2(tStar)} (heavier tails)`):`Proportions always use z*=${fmt2(zStar)}`}</div>
        </div>
        <div style={{display:'flex',gap:10}}>
          <button style={{flex:1,padding:'14px',borderRadius:11,border:'none',background:C,color:'#fff',fontSize:14,fontWeight:700,cursor:'pointer',boxShadow:`0 4px 12px ${C}40`}}>Calculate CI →</button>
          <button onClick={()=>{setMean(75);setStd(10);setN(40);setCl(95);setPhat(0.52);setNProp(1000);setMode('mean');setActiveScenario(0)}} style={{padding:'14px 18px',borderRadius:11,border:'1.5px solid var(--border-2)',background:'var(--bg-raised)',color:'var(--text-2)',fontSize:13,fontWeight:500,cursor:'pointer'}}>Reset</button>
        </div>
      </>}
      right={<>
        <div style={{background:'var(--bg-card)',border:`2px solid ${C}30`,borderRadius:16,padding:'20px',marginBottom:16}}>
          <div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:14}}>{cl}% Confidence Interval</div>
          {/* CI bar */}
          <div style={{position:'relative',height:50,marginBottom:14}}>
            <div style={{position:'absolute',top:'50%',left:'5%',right:'5%',height:6,background:'var(--bg-raised)',borderRadius:3,transform:'translateY(-50%)'}}/>
            {(()=>{
              const range=mode==='mean'?S*7:0.4,ref=center-range/2
              const toP=v=>Math.max(5,Math.min(95,((v-ref)/range)*90+5))
              const loPct=toP(lo),hiPct=toP(hi),cenPct=toP(center)
              return<>
                <div style={{position:'absolute',top:'50%',left:`${loPct}%`,width:`${hiPct-loPct}%`,height:12,background:`${C}40`,borderRadius:6,transform:'translateY(-50%)',border:`2px solid ${C}`,transition:'all .4s'}}/>
                {[{pos:loPct,val:lo,col:'#10b981'},{pos:cenPct,val:center,col:C,center:true},{pos:hiPct,val:hi,col:'#ef4444'}].map(({pos,val,col,center:isCen},idx)=>(
                  <div key={idx} style={{position:'absolute',left:`${pos}%`,top:isCen?0:'auto',bottom:isCen?0:'auto',transform:'translateX(-50%)',width:isCen?2:1,background:isCen?'var(--text-3)':col,opacity:isCen?0.35:1}}>
                    {!isCen&&<div style={{position:'absolute',top:-18,left:'50%',transform:'translateX(-50%)',fontSize:9,fontWeight:700,color:col,whiteSpace:'nowrap',background:'var(--bg-card)',padding:'2px 4px',borderRadius:4}}>{mode==='mean'?fmt2(val):(val*100).toFixed(1)+'%'}</div>}
                  </div>
                ))}
              </>
            })()}
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
            <StatBadge label="Lower" value={mode==='mean'?fmt2(lo_mean):(lo_prop*100).toFixed(2)+'%'} color="#10b981"/>
            <StatBadge label="Center" value={mode==='mean'?fmt2(mean):(pHat*100).toFixed(1)+'%'} color={C}/>
            <StatBadge label="Upper" value={mode==='mean'?fmt2(hi_mean):(hi_prop*100).toFixed(2)+'%'} color="#ef4444"/>
          </div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:14}}>
          <StatBadge label="Margin of Error" value={mode==='mean'?`±${fmt2(me_mean)}`:`±${(me_prop*100).toFixed(2)}%`} sub="half CI width" color={C}/>
          <StatBadge label="CI Width" value={mode==='mean'?fmt2(me*2):(me*200).toFixed(2)+'%'} sub="full width" color="#8b5cf6"/>
          <StatBadge label="Standard Error" value={fmt(se)} sub="σ/√n or √(pq/n)" color="#f59e0b"/>
          <StatBadge label="Critical value" value={fmt2(crit)} sub={useZ||mode==='proportion'?'z*':'t* (df='+df+')'} color="#ec4899"/>
        </div>
        <BreakdownTable title="Full results" rows={[
          {label:'Confidence level',value:`${cl}%`,highlight:true},
          {label:'Lower bound',value:mode==='mean'?fmt2(lo_mean):(lo_prop*100).toFixed(4)+'%',color:'#10b981'},
          {label:'Upper bound',value:mode==='mean'?fmt2(hi_mean):(hi_prop*100).toFixed(4)+'%',color:'#ef4444'},
          {label:'Margin of error',value:mode==='mean'?`±${fmt2(me_mean)}`:`±${(me_prop*100).toFixed(4)}%`,bold:true,color:C,highlight:true},
          {label:'Standard error',value:fmt(se)},
          {label:'Critical value',value:fmt2(crit),note:useZ||mode==='proportion'?'z*':'t* (t-dist)'},
          ...(mode==='mean'?[{label:'Method',value:useZ?'Z (n≥30)':'t-distribution (n<30)'}]:[]),
        ]}/>
        <AIHintCard hint={`${cl}% CI: [${mode==='mean'?fmt2(lo):(lo*100).toFixed(2)+'%'}, ${mode==='mean'?fmt2(hi):(hi*100).toFixed(2)+'%'}]. ME=±${mode==='mean'?fmt2(me):(me*100).toFixed(2)+'%'}. ${mode==='mean'?(useZ?`Large sample — using z*=${fmt2(zStar)}.`:`Small sample (n=${N}) — using t*(${df})=${fmt2(tStar)}.`):''}`} color={C}/>
      </>}
    />

    {/* ── SECTION 3: BELL CURVE ── */}
    <Sec title="Normal Distribution — Shaded CI Region" icon="🔔" sub={`${cl}% of area between ±${fmt2(crit)}σ`} accent={C}>
      <p style={{fontSize:12,color:'var(--text-2)',lineHeight:1.7,marginBottom:16}}>The shaded region shows the middle {cl}% of the distribution. The critical values ±{fmt2(crit)} mark the boundaries — {((100-cl)/2).toFixed(1)}% of probability lies in each tail (red zones).</p>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{display:'block',background:'var(--bg-raised)',borderRadius:12,marginBottom:14}}>
        {[0.25,0.5,0.75].map(p=>(<line key={p} x1={12} y1={H-18-(p*(H-32))} x2={W-12} y2={H-18-(p*(H-32))} stroke="var(--border)" strokeWidth="0.5" strokeDasharray="4,4"/>))}
        <line x1={12} y1={H-18} x2={W-12} y2={H-18} stroke="var(--border)" strokeWidth="1"/>
        <polygon points={shadeCI} fill={`${C}30`}/>
        {[[-4,-crit],[crit,4]].map(([a,b],idx)=>{const pts=[`${toSx(a)},${H-18}`];for(let i=0;i<=80;i++){const zv=zMin+(i/80)*(zMax-zMin);if(zv>=a&&zv<=b)pts.push(`${toSx(zv)},${Math.max(6,Math.min(H-6,toSy(normalPDF(zv))))}`)}pts.push(`${toSx(b)},${H-18}`);return<polygon key={idx} points={pts.join(' ')} fill="#ef444420"/>})}
        <polyline points={curvePts} fill="none" stroke={C} strokeWidth="2.5" strokeLinejoin="round"/>
        {[-crit,crit].map(zv=>(<g key={zv}><line x1={toSx(zv)} y1={10} x2={toSx(zv)} y2={H-18} stroke={C} strokeWidth="1.5" strokeDasharray="5,3"/><text x={toSx(zv)} y={H-4} textAnchor="middle" fontSize="8" fill={C} fontWeight="700">{zv>0?'+':''}{fmt2(zv)}</text></g>))}
        {[-3,-2,-1,0,1,2,3].map(sv=>(<text key={sv} x={toSx(sv)} y={H-6} textAnchor="middle" fontSize="7" fill="var(--text-3)">{sv}σ</text>))}
        <text x={W/2} y={50} textAnchor="middle" fontSize="12" fill={C} fontWeight="700">{cl}%</text>
        <text x={toSx(-3.1)} y={62} textAnchor="middle" fontSize="9" fill="#ef4444">{((100-cl)/2).toFixed(1)}%</text>
        <text x={toSx(3.1)} y={62} textAnchor="middle" fontSize="9" fill="#ef4444">{((100-cl)/2).toFixed(1)}%</text>
      </svg>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
        {[90,95,99].map(lv=>{const z2=Math.abs(invNorm((1-lv/100)/2));const isActive=lv===cl;return(<div key={lv} style={{padding:'12px',borderRadius:10,background:isActive?`${C}15`:'var(--bg-raised)',border:`1.5px solid ${isActive?C:'var(--border)'}`,textAlign:'center',cursor:'pointer',transition:'all .2s'}} onClick={()=>setCl(lv)}><div style={{fontSize:16,fontWeight:700,color:isActive?C:'var(--text)'}}>{lv}%</div><div style={{fontSize:11,color:'var(--text-3)',marginTop:2}}>z* = {fmt2(z2)}</div><div style={{fontSize:10,color:'var(--text-3)'}}>±{((100-lv)/2).toFixed(1)}% tails</div></div>)})}
      </div>
    </Sec>

    {/* ── SECTION 4: CI COMPARISON ── */}
    <Sec title="CI Width at 90% / 95% / 99% — Click to Apply" icon="📏" sub="Same data, different confidence" accent={C}>
      <p style={{fontSize:12,color:'var(--text-2)',lineHeight:1.7,marginBottom:16}}>Higher confidence requires wider intervals. With the same data, going from 95% → 99% widens the CI by ~{(((ciCompare[2].me/ciCompare[1].me)-1)*100).toFixed(0)}%. There is always a trade-off between confidence and precision.</p>
      <div style={{display:'flex',flexDirection:'column',gap:12}}>
        {ciCompare.map(({level,lo:clo,hi:chi,me:cme,crit:ccrit},i)=>{
          const isActive=level===cl,barWidth=(cme/maxME)*82
          const colors=['#10b981','#6366f1','#ef4444']
          const col=colors[i]
          return(<div key={level} onClick={()=>setCl(level)} style={{padding:'14px 16px',borderRadius:12,background:isActive?`${col}12`:'var(--bg-raised)',border:`2px solid ${isActive?col:'var(--border)'}`,cursor:'pointer',transition:'all .2s'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <div style={{width:28,height:28,borderRadius:8,background:`${col}20`,display:'flex',alignItems:'center',justifyContent:'center'}}><span style={{fontSize:12,fontWeight:700,color:col}}>{level}%</span></div>
                <div><div style={{fontSize:13,fontWeight:700,color:isActive?col:'var(--text)'}}>{level}% CI{isActive?' ← active':''}</div><div style={{fontSize:11,color:'var(--text-3)'}}>{mode==='mean'?`[${fmt2(clo)}, ${fmt2(chi)}]`:`[${(clo*100).toFixed(2)}%, ${(chi*100).toFixed(2)}%]`}</div></div>
              </div>
              <div style={{textAlign:'right'}}><div style={{fontSize:15,fontWeight:700,color:col}}>±{mode==='mean'?fmt2(cme):(cme*100).toFixed(2)+'%'}</div><div style={{fontSize:10,color:'var(--text-3)'}}>crit={fmt2(ccrit)}</div></div>
            </div>
            <div style={{position:'relative',height:10,background:'var(--bg-card)',borderRadius:5,overflow:'hidden'}}>
              <div style={{position:'absolute',left:`${(100-barWidth*2)/2}%`,width:`${barWidth*2}%`,height:'100%',background:`${col}55`,borderRadius:5,transition:'width .4s'}}/>
              <div style={{position:'absolute',left:'50%',top:0,bottom:0,width:2,background:'var(--border)',transform:'translateX(-50%)'}}/>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:9,color:'var(--text-3)',marginTop:3}}><span>← Narrower (less confident)</span><span>Wider (more confident) →</span></div>
          </div>)
        })}
      </div>
    </Sec>

    {/* ── SECTION 5: n vs WIDTH ── */}
    <Sec title="Sample Size vs CI Width — The 1/√n Law" icon="⚖️" sub="n↑ → width↓ (diminishing returns)" accent={C}>
      <p style={{fontSize:12,color:'var(--text-2)',lineHeight:1.7,marginBottom:14}}>Doubling sample size cuts width by only ~29%. To halve the width you need 4× more data. This is why polls plateau around n=1,000 — going to n=4,000 only halves the margin, rarely worth the extra cost.</p>
      <div style={{display:'flex',flexDirection:'column',gap:5,marginBottom:16}}>
        {sweepData.map(({n:sn,width:sw})=>{
          const isActive=sn===N,barW=(sw/maxSW)*100
          return(<div key={sn} style={{display:'flex',alignItems:'center',gap:10}}>
            <div style={{width:46,fontSize:11,fontWeight:isActive?700:400,color:isActive?C:'var(--text-3)',textAlign:'right',flexShrink:0}}>n={sn}</div>
            <div style={{flex:1,position:'relative',height:16,background:'var(--bg-raised)',borderRadius:4,overflow:'hidden'}}>
              <div style={{height:'100%',width:`${barW}%`,background:isActive?C:C+'45',borderRadius:4,transition:'width .4s'}}/>
              {isActive&&<div style={{position:'absolute',right:4,top:'50%',transform:'translateY(-50%)',fontSize:8,fontWeight:700,color:'#fff'}}>← your n</div>}
            </div>
            <div style={{width:62,fontSize:10,color:isActive?C:'var(--text-3)',fontFamily:"'Space Grotesk',sans-serif",flexShrink:0,fontWeight:isActive?700:400}}>{mode==='mean'?fmt2(sw):(sw*100).toFixed(1)+'%'}</div>
          </div>)
        })}
      </div>
      <div style={{padding:'14px',background:'var(--bg-raised)',borderRadius:12,border:'1px solid var(--border)'}}>
        <div style={{fontSize:12,fontWeight:700,color:'var(--text)',marginBottom:10}}>📐 Required n for target CI width</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8}}>
          {(mode==='mean'?[1,2,3,5]:[0.01,0.02,0.03,0.05]).map(targetW=>{
            const reqN=mode==='mean'?Math.ceil((2*zStar*S/targetW)**2):Math.ceil((2*zStar*Math.sqrt(pHat*(1-pHat))/targetW)**2)
            return(<div key={targetW} style={{textAlign:'center',padding:'10px 6px',background:'var(--bg-card)',borderRadius:9,border:'1px solid var(--border)'}}>
              <div style={{fontSize:9,color:'var(--text-3)',marginBottom:3}}>width ≤ {mode==='mean'?targetW:(targetW*100)+'%'}</div>
              <div style={{fontSize:18,fontWeight:700,color:C}}>{reqN.toLocaleString()}</div>
              <div style={{fontSize:8,color:'var(--text-3)'}}>participants</div>
            </div>)
          })}
        </div>
      </div>
    </Sec>

    {/* ── SECTION 6: SIMULATION ── */}
    <Sec title="Monte Carlo — See CI Coverage Live" icon="🎲" sub="100 repeated experiments" accent={C}>
      <p style={{fontSize:12,color:'var(--text-2)',lineHeight:1.7,marginBottom:14}}>Each horizontal bar is a {cl}% CI from a random sample of n={N}. About {cl} out of 100 should capture the true mean (dashed red line). Some will miss — that's expected and correct.</p>
      <button onClick={runSimulation} disabled={isSimulating||mode!=='mean'} style={{width:'100%',padding:'13px',borderRadius:11,border:'none',background:mode!=='mean'?'var(--bg-raised)':C,color:mode!=='mean'?'var(--text-3)':'#fff',fontSize:13,fontWeight:700,cursor:mode!=='mean'?'not-allowed':'pointer',marginBottom:14,boxShadow:mode!=='mean'?'none':`0 4px 14px ${C}35`,transition:'all .2s'}}>
        {isSimulating?'⏳ Simulating 100 experiments...':mode!=='mean'?'⚠️ Switch to Mean mode to run simulation':`▶ Run 100 Simulations (n=${N}, ${cl}% CI, μ=${mean})`}
      </button>
      {simRuns&&(<>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:14}}>
          {[['Captured μ',simRuns.hits,'out of 100','#10b981'],['Missed μ',100-simRuns.hits,'out of 100','#ef4444'],['Coverage',simRuns.hits+'%',`target: ${cl}%`,C]].map(([l,v,s,col])=>(<div key={l} style={{padding:'12px',background:`${col}12`,border:`1.5px solid ${col}30`,borderRadius:10,textAlign:'center'}}><div style={{fontSize:10,color:'var(--text-3)',marginBottom:4}}>{l}</div><div style={{fontSize:24,fontWeight:700,color:col}}>{v}</div><div style={{fontSize:10,color:'var(--text-3)'}}>{s}</div></div>))}
        </div>
        <div style={{background:'var(--bg-raised)',borderRadius:12,padding:'12px',overflow:'hidden',marginBottom:8}}>
          {(()=>{
            const allLo=simRuns.results.map(r=>r.lo),allHi=simRuns.results.map(r=>r.hi)
            const gMin=Math.min(...allLo),gMax=Math.max(...allHi),gRange=gMax-gMin||1
            const toX=v=>20+((v-gMin)/gRange)*260
            const trueX=toX(simRuns.trueMean)
            const show=simRuns.results.slice(0,50)
            return(<svg viewBox={`0 0 300 ${show.length*7+20}`} width="100%" style={{display:'block'}}>
              <line x1={trueX} y1={0} x2={trueX} y2={show.length*7+14} stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4,3"/>
              <text x={trueX} y={8} textAnchor="middle" fontSize="7" fill="#ef4444" fontWeight="700">μ={fmt2(simRuns.trueMean)}</text>
              {show.map((r,i)=>{
                const y=13+i*7
                return(<g key={i}>
                  <line x1={toX(r.lo)} y1={y} x2={toX(r.hi)} y2={y} stroke={r.contains?'#10b981':'#ef4444'} strokeWidth="4" strokeLinecap="round" opacity={0.8}/>
                  <circle cx={toX((r.lo+r.hi)/2)} cy={y} r={2} fill={r.contains?'#10b981':'#ef4444'}/>
                </g>)
              })}
            </svg>)
          })()}
        </div>
        <p style={{fontSize:10,color:'var(--text-3)',margin:0,textAlign:'center'}}>🟢 captures μ &nbsp;·&nbsp; 🔴 misses μ &nbsp;·&nbsp; First 50 of 100 shown</p>
      </>)}
    </Sec>

    {/* ── SECTION 7: REAL-WORLD ── */}
    <Sec title="Real-World Applications & Common Mistakes" icon="🌍" sub="Where CIs are essential" accent={C}>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:18}}>
        {[{icon:'🗳️',title:'Election polling',example:'52% ± 3% (n=1,067, 95% CI). If CI contains 50%, the race is a statistical toss-up — not a guaranteed win.',tip:'n≈1,000 gives ±3% at 95%',color:C},{icon:'💊',title:'Clinical trials',example:'Drug reduces BP by 12±4 mmHg (95% CI: 8–16). Full CI above 0 → statistically & clinically significant.',tip:'FDA requires CI to exclude null effect',color:'#10b981'},{icon:'📈',title:'A/B testing',example:'Variant B CTR 5.2%±0.3% vs Control 4.8%±0.3%. Non-overlapping CIs → launch the variant.',tip:'Overlapping CIs ≠ no difference (run a t-test)',color:'#f59e0b'},{icon:'🏭',title:'Manufacturing QC',example:'Mean bolt: 10.02±0.01mm (99% CI). Entire CI within spec 10±0.05mm → batch accepted.',tip:'Tighter CI needs larger sample',color:'#8b5cf6'}].map((rw,i)=>(<div key={i} style={{padding:'14px',borderRadius:12,background:`${rw.color}08`,border:`1.5px solid ${rw.color}25`}}><div style={{display:'flex',gap:8,alignItems:'center',marginBottom:8}}><span style={{fontSize:20}}>{rw.icon}</span><span style={{fontSize:12,fontWeight:700,color:rw.color}}>{rw.title}</span></div><p style={{fontSize:11.5,color:'var(--text-2)',lineHeight:1.6,margin:'0 0 8px'}}>{rw.example}</p><div style={{fontSize:10,color:rw.color,background:`${rw.color}12`,padding:'4px 8px',borderRadius:7}}>💡 {rw.tip}</div></div>))}
      </div>
      <div style={{borderRadius:12,border:'1px solid var(--border)',overflow:'hidden'}}>
        <div style={{padding:'11px 14px',background:'var(--bg-raised)',borderBottom:'1px solid var(--border)'}}><span style={{fontSize:12,fontWeight:700,color:'var(--text)'}}>⚠️ Common Misconceptions</span></div>
        {[{wrong:'There is a 95% probability the true mean is inside this CI',right:'The true mean is fixed — it either is or isn\'t in the interval. 95% describes the long-run reliability of the procedure.'},
          {wrong:'A wider CI is always worse or less accurate',right:'A wider CI correctly reflects uncertainty. A spuriously narrow CI would be misleading and overconfident.'},
          {wrong:'Overlapping confidence intervals mean no significant difference',right:'Two overlapping 95% CIs can still be statistically different (p<0.05). Always run a formal two-sample test.'}
        ].map((m,i)=>(<div key={i} style={{padding:'12px 14px',borderBottom:i<2?'1px solid var(--border)':'none'}}><div style={{display:'flex',gap:8}}><span style={{fontSize:13,flexShrink:0}}>❌</span><div><div style={{fontSize:11.5,color:'#ef4444',marginBottom:4,fontWeight:600}}>{m.wrong}</div><div style={{fontSize:11.5,color:'var(--text-2)',lineHeight:1.5}}><span style={{color:'#10b981',fontWeight:700}}>✓ </span>{m.right}</div></div></div></div>))}
      </div>
    </Sec>

    {/* ── SECTION 8: FAQ ── */}
    <Sec title="Frequently Asked Questions" icon="❓" sub="Tap to expand" accent={C}>
      {FAQ.map((f,i)=>(<Acc key={i} q={f.q} a={f.a} open={openFaq===i} onToggle={()=>setFaq(openFaq===i?null:i)} color={C}/>))}
      <div style={{marginTop:20,borderRadius:12,background:'var(--bg-raised)',padding:'16px',border:'1px solid var(--border)'}}>
        <div style={{fontSize:12,fontWeight:700,color:'var(--text)',marginBottom:12}}>📐 Formula Quick Reference</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
          {[{name:'CI for mean (σ known)',formula:'x̄ ± z* · σ/√n',color:C},{name:'CI for mean (σ unknown, n<30)',formula:'x̄ ± t*(df) · s/√n',color:'#10b981'},{name:'CI for proportion',formula:'p̂ ± z* · √(p̂(1−p̂)/n)',color:'#f59e0b'},{name:'Required n (proportion)',formula:'n = (z*/ME)² · p(1−p)',color:'#8b5cf6'}].map((f,i)=>(<div key={i} style={{padding:'10px 12px',borderRadius:9,background:`${f.color}08`,border:`1px solid ${f.color}20`}}><div style={{fontSize:10,fontWeight:700,color:'var(--text-3)',marginBottom:4}}>{f.name}</div><div style={{fontSize:12,fontWeight:700,color:f.color,fontFamily:"'Space Grotesk',sans-serif"}}>{f.formula}</div></div>))}
        </div>
      </div>
    </Sec>

  </div>)
}
