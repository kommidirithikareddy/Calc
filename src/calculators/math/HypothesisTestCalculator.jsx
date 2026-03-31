import { useState, useMemo } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'
const fmt=n=>(isNaN(n)||!isFinite(n))? '—':parseFloat(Number(n).toFixed(6)).toString()
const fmtP=n=>(isNaN(n)||!isFinite(n))? '—':(n<0.0001?'< 0.0001':(n*100).toFixed(4)+'%')
function Sec({title,sub,children,color}){return(<div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,overflow:'hidden'}}><div style={{padding:'13px 18px',borderBottom:'0.5px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center',background:color?color+'06':'transparent'}}><span style={{fontSize:13,fontWeight:700,color:'var(--text)',fontFamily:"'Space Grotesk',sans-serif"}}>{title}</span>{sub&&<span style={{fontSize:11,color:'var(--text-3)'}}>{sub}</span>}</div><div style={{padding:'16px 18px'}}>{children}</div></div>)}
function Acc({q,a,open,onToggle,color}){return(<div style={{borderBottom:'0.5px solid var(--border)'}}><button onClick={onToggle} style={{width:'100%',display:'flex',justifyContent:'space-between',alignItems:'center',padding:'13px 0',background:'none',border:'none',cursor:'pointer',gap:12,textAlign:'left'}}><span style={{fontSize:13,fontWeight:600,color:'var(--text)',fontFamily:"'DM Sans',sans-serif",lineHeight:1.4}}>{q}</span><span style={{fontSize:18,color,flexShrink:0,transform:open?'rotate(45deg)':'none',transition:'transform .2s'}}>+</span></button>{open&&<p style={{fontSize:12.5,color:'var(--text-2)',lineHeight:1.75,margin:'0 0 13px'}}>{a}</p>}</div>)}
function Inp({label,value,onChange,color,hint,step='any'}){const[f,sf]=useState(false);return(<div style={{marginBottom:14}}><div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}><label style={{fontSize:12.5,fontWeight:600,color:'var(--text)',fontFamily:"'DM Sans',sans-serif"}}>{label}</label>{hint&&<span style={{fontSize:10,color:'var(--text-3)'}}>{hint}</span>}</div><div style={{display:'flex',height:44,border:`1.5px solid ${f?color:'var(--border-2)'}`,borderRadius:9,overflow:'hidden',background:'var(--bg-card)',boxShadow:f?`0 0 0 3px ${color}18`:'none'}}><input type="number" step={step} value={value} onChange={e=>onChange(Number(e.target.value))} onFocus={()=>sf(true)} onBlur={()=>sf(false)} style={{flex:1,border:'none',background:'transparent',padding:'0 14px',fontSize:17,fontWeight:700,color:'var(--text)',outline:'none',fontFamily:"'Space Grotesk',sans-serif"}}/></div></div>)}
function erf(x){const t=1/(1+0.3275911*Math.abs(x));const y=1-t*(0.254829592+t*(-0.284496736+t*(1.421413741+t*(-1.453152027+t*1.061405429))))*Math.exp(-x*x);return x>=0?y:-y}
function normalCDF(z){return 0.5*(1+erf(z/Math.sqrt(2)))}
function normalPDF(z){return Math.exp(-z*z/2)/Math.sqrt(2*Math.PI)}
function invNorm(p){if(p<=0)return -Infinity;if(p>=1)return Infinity;const a=[2.515517,0.802853,0.010328];const b=[1.432788,0.189269,0.001308];const sign=p<0.5?-1:1;const q2=Math.min(p,1-p);const t=Math.sqrt(-2*Math.log(q2));return sign*(t-(a[0]+t*(a[1]+t*a[2]))/(1+t*(b[0]+t*(b[1]+t*b[2]))))}
// Approximate t-distribution CDF
function tCDF(t,df){const x=df/(df+t*t);let ib=0;const a=df/2,b=0.5;const max=200;let term=1,sum=1;for(let i=1;i<=max;i++){term*=((a+i-1)*(1-x))/i;sum+=term}ib=Math.pow(x,a)*Math.pow(1-x,b)*sum/df;return t>=0?1-ib/2:ib/2}
const TESTS=[
  {id:'one_z',label:'One-sample Z-test',desc:'Test if population mean equals hypothesised value (σ known)'},
  {id:'one_t',label:'One-sample t-test',desc:'Test if population mean equals hypothesised value (σ unknown)'},
  {id:'two_t',label:'Two-sample t-test',desc:'Compare means of two independent groups'},
  {id:'prop',label:'One-proportion Z-test',desc:'Test if proportion equals a hypothesised value'},
]
const FAQ=[
  {q:'What is a p-value?',a:'The p-value is the probability of observing a test statistic as extreme as (or more extreme than) the one computed, assuming H₀ is true. Small p → strong evidence against H₀. p < 0.05 → statistically significant at 5% level. p is NOT the probability that H₀ is true. It is NOT the probability of making an error.'},
  {q:'What does "statistically significant" mean?',a:'A result is statistically significant if p < α (the significance level). α = 0.05 is the most common threshold — it means we accept a 5% chance of a false positive. "Significant" does not mean "important" or "large" — a tiny effect can be highly significant with a large sample. Always report effect size alongside p-value.'},
  {q:'What is the difference between one-tailed and two-tailed tests?',a:'Two-tailed: H₁: μ ≠ μ₀ — tests for difference in either direction. One-tailed: H₁: μ > μ₀ or μ < μ₀ — tests for difference in one direction only. Two-tailed is more conservative (requires stronger evidence). Only use one-tailed when you have strong prior reason to expect a specific direction.'},
  {q:'What is a Type I error vs Type II error?',a:'Type I (α = false positive): Rejecting H₀ when it is actually true. P(Type I) = α = significance level. Type II (β = false negative): Failing to reject H₀ when it is actually false. P(Type II) = β; Power = 1−β. Reducing α increases β (trade-off). Increasing sample size reduces both.'},
  {q:'Why do we "fail to reject" H₀ instead of "accepting" it?',a:'A non-significant result (p > α) does not prove H₀ is true — only that the data did not provide sufficient evidence against it. "Fail to reject" correctly communicates that absence of evidence is not evidence of absence. The test may have been underpowered to detect a real effect.'},
]
export default function HypothesisTestCalculator({meta,category}){
  const C=category?.color||'#6366f1'
  const[testId,setTestId]=useState('one_z')
  const[mu0,setMu0]=useState(100)
  const[xbar,setXbar]=useState(105)
  const[sigma,setSigma]=useState(15)
  const[n,setN]=useState(30)
  const[n2,setN2]=useState(30)
  const[xbar2,setXbar2]=useState(98)
  const[sigma2,setSigma2]=useState(15)
  const[p0,setP0]=useState(0.5)
  const[phat,setPhat]=useState(0.6)
  const[nProp,setNProp]=useState(100)
  const[alpha,setAlpha]=useState(0.05)
  const[tail,setTail]=useState('two')
  const[openFaq,setFaq]=useState(null)
  const result=useMemo(()=>{
    if(testId==='one_z'){
      const se=sigma/Math.sqrt(n),z=(xbar-mu0)/se
      const p=tail==='two'?2*(1-normalCDF(Math.abs(z))):tail==='right'?1-normalCDF(z):normalCDF(z)
      const reject=p<alpha
      return{z,p,se,reject,stat:'z',df:null,ci:[xbar-1.96*se,xbar+1.96*se]}
    }
    if(testId==='one_t'){
      const se=sigma/Math.sqrt(n),t=(xbar-mu0)/se,df=n-1
      const p=tail==='two'?2*tCDF(-Math.abs(t),df):tail==='right'?1-tCDF(t,df):tCDF(t,df)
      const reject=p<alpha
      return{z:t,p,se,reject,stat:'t',df,ci:[xbar-2.042*se,xbar+2.042*se]}
    }
    if(testId==='two_t'){
      const se=Math.sqrt(sigma**2/n+sigma2**2/n2),t=(xbar-xbar2)/se,df=Math.round((sigma**2/n+sigma2**2/n2)**2/((sigma**2/n)**2/(n-1)+(sigma2**2/n2)**2/(n2-1)))
      const p=tail==='two'?2*tCDF(-Math.abs(t),df):tail==='right'?1-tCDF(t,df):tCDF(t,df)
      const reject=p<alpha
      return{z:t,p,se,reject,stat:'t',df,diff:xbar-xbar2,ci:[xbar-xbar2-1.96*se,xbar-xbar2+1.96*se]}
    }
    if(testId==='prop'){
      const se=Math.sqrt(p0*(1-p0)/nProp),z=(phat-p0)/se
      const p=tail==='two'?2*(1-normalCDF(Math.abs(z))):tail==='right'?1-normalCDF(z):normalCDF(z)
      const reject=p<alpha
      return{z,p,se,reject,stat:'z',df:null,ci:[phat-1.96*Math.sqrt(phat*(1-phat)/nProp),phat+1.96*Math.sqrt(phat*(1-phat)/nProp)]}
    }
    return null
  },[testId,mu0,xbar,sigma,n,n2,xbar2,sigma2,p0,phat,nProp,alpha,tail])
  const W=280,H=130,zMin=-4,zMax=4
  const toSx=zv=>((zv-zMin)/(zMax-zMin))*(W-20)+10
  const toSy=pv=>H-15-(pv/normalPDF(0))*(H-28)
  const curvePts=Array.from({length:81},(_,i)=>{const zv=zMin+(i/80)*(zMax-zMin);return`${toSx(zv)},${Math.max(5,Math.min(H-5,toSy(normalPDF(zv))))}`}).join(' ')
  const critZ=invNorm(1-alpha/2)
  const zC=result?Math.max(zMin+0.1,Math.min(zMax-0.1,result.z)):0
  // Critical region shading
  const critShadeLeft=()=>{const pts=[`${toSx(zMin)},${H-15}`];for(let i=0;i<=80;i++){const zv=zMin+(i/80)*(zMax-zMin);if(zv<=-critZ)pts.push(`${toSx(zv)},${Math.max(5,Math.min(H-5,toSy(normalPDF(zv))))}`)}pts.push(`${toSx(-critZ)},${H-15}`);return pts.join(' ')}
  const critShadeRight=()=>{const pts=[`${toSx(critZ)},${H-15}`];for(let i=0;i<=80;i++){const zv=zMin+(i/80)*(zMax-zMin);if(zv>=critZ)pts.push(`${toSx(zv)},${Math.max(5,Math.min(H-5,toSy(normalPDF(zv))))}`)}pts.push(`${toSx(zMax)},${H-15}`);return pts.join(' ')}
  const reject=result?.reject
  const resultColor=reject?'#ef4444':'#10b981'
  return(<div style={{display:'flex',flexDirection:'column',gap:20}}>
    <div style={{background:`linear-gradient(135deg,${C}12,${C}06)`,border:`1px solid ${C}30`,borderRadius:14,padding:'16px 20px',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12}}>
      <div>
        <div style={{fontSize:10,fontWeight:700,color:C,textTransform:'uppercase',letterSpacing:'.08em',marginBottom:6}}>Hypothesis Test Calculator</div>
        <div style={{fontSize:20,fontWeight:700,color:C,fontFamily:"'Space Grotesk',sans-serif"}}>H₀: μ = μ₀ vs H₁: μ ≠ μ₀</div>
        <div style={{fontSize:11,color:'var(--text-3)',marginTop:4}}>α = {alpha} · {tail}-tailed · {testId==='one_z'?'z-test':testId==='prop'?'z-prop':'t-test'}</div>
      </div>
      {result&&(<div style={{padding:'10px 20px',background:resultColor+'20',borderRadius:12,textAlign:'center',border:`1.5px solid ${resultColor}40`}}>
        <div style={{fontSize:11,color:'var(--text-3)',marginBottom:2}}>Result</div>
        <div style={{fontSize:22,fontWeight:700,color:resultColor,fontFamily:"'Space Grotesk',sans-serif"}}>{reject?'Reject H₀':'Fail to Reject H₀'}</div>
        <div style={{fontSize:11,color:resultColor,fontWeight:600}}>p = {fmtP(result.p)}</div>
      </div>)}
    </div>
    {/* Test selector */}
    <div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,padding:'14px 18px'}}>
      <div style={{fontSize:12,fontWeight:600,color:'var(--text-2)',marginBottom:12}}>Select test type</div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:8}}>
        {TESTS.map(t=>(<button key={t.id} onClick={()=>setTestId(t.id)} style={{padding:'10px 12px',borderRadius:10,border:`1.5px solid ${testId===t.id?C:'var(--border)'}`,background:testId===t.id?C+'12':'var(--bg-raised)',cursor:'pointer',textAlign:'left'}}><div style={{fontSize:11,fontWeight:700,color:testId===t.id?C:'var(--text)'}}>{t.label}</div><div style={{fontSize:9,color:'var(--text-3)',marginTop:2}}>{t.desc}</div></button>))}
      </div>
    </div>
    <CalcShell
      left={<>
        <div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:16,paddingBottom:8,borderBottom:'0.5px solid var(--border)'}}>Hypotheses & Parameters</div>
        {/* Hypothesis display */}
        <div style={{padding:'10px 14px',background:'var(--bg-raised)',borderRadius:10,border:'0.5px solid var(--border)',marginBottom:14}}>
          <div style={{fontSize:12,color:'var(--text-2)',lineHeight:1.7}}>
            <div>H₀: {testId==='prop'?`p = ${p0}`:testId==='two_t'?'μ₁ = μ₂':`μ = ${mu0}`}</div>
            <div>H₁: {testId==='prop'?`p ${tail==='two'?'≠':tail==='right'?'>':'<'} ${p0}`:testId==='two_t'?`μ₁ ${tail==='two'?'≠':tail==='right'?'>':'<'} μ₂`:`μ ${tail==='two'?'≠':tail==='right'?'>':'<'} ${mu0}`}</div>
          </div>
        </div>
        {testId==='one_z'&&(<><Inp label="Null hypothesis mean (μ₀)" value={mu0} onChange={setMu0} color={C} step="0.1"/><Inp label="Sample mean (x̄)" value={xbar} onChange={setXbar} color={C} step="0.1"/><Inp label="Population std dev (σ)" value={sigma} onChange={setSigma} color={C} step="0.1"/><Inp label="Sample size (n)" value={n} onChange={v=>setN(Math.max(2,Math.round(v)))} color={C}/></>)}
        {testId==='one_t'&&(<><Inp label="Null hypothesis mean (μ₀)" value={mu0} onChange={setMu0} color={C} step="0.1"/><Inp label="Sample mean (x̄)" value={xbar} onChange={setXbar} color={C} step="0.1"/><Inp label="Sample std dev (s)" value={sigma} onChange={setSigma} color={C} step="0.1" hint="estimated"/><Inp label="Sample size (n)" value={n} onChange={v=>setN(Math.max(2,Math.round(v)))} color={C}/></>)}
        {testId==='two_t'&&(<><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}><div><div style={{fontSize:11,fontWeight:700,color:C,marginBottom:8}}>Group 1</div><Inp label="x̄₁" value={xbar} onChange={setXbar} color={C} step="0.1"/><Inp label="s₁" value={sigma} onChange={setSigma} color={C} step="0.1"/><Inp label="n₁" value={n} onChange={v=>setN(Math.max(2,Math.round(v)))} color={C}/></div><div><div style={{fontSize:11,fontWeight:700,color:'#10b981',marginBottom:8}}>Group 2</div><Inp label="x̄₂" value={xbar2} onChange={setXbar2} color={C} step="0.1"/><Inp label="s₂" value={sigma2} onChange={setSigma2} color={C} step="0.1"/><Inp label="n₂" value={n2} onChange={v=>setN2(Math.max(2,Math.round(v)))} color={C}/></div></div></>)}
        {testId==='prop'&&(<><Inp label="Null proportion (p₀)" value={p0} onChange={v=>setP0(Math.max(0.01,Math.min(0.99,v)))} color={C} step="0.01" hint="0 to 1"/><Inp label="Observed proportion (p̂)" value={phat} onChange={v=>setPhat(Math.max(0.01,Math.min(0.99,v)))} color={C} step="0.01"/><Inp label="Sample size (n)" value={nProp} onChange={v=>setNProp(Math.max(2,Math.round(v)))} color={C}/></>)}
        {/* Alpha & tail */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:14}}>
          <div><div style={{fontSize:12,fontWeight:600,color:'var(--text)',marginBottom:8}}>α (significance)</div><div style={{display:'flex',gap:4}}>{[0.01,0.05,0.10].map(a=>(<button key={a} onClick={()=>setAlpha(a)} style={{flex:1,padding:'8px',borderRadius:8,border:`1.5px solid ${alpha===a?C:'var(--border)'}`,background:alpha===a?C:'var(--bg-raised)',color:alpha===a?'#fff':'var(--text-2)',cursor:'pointer',fontSize:11,fontWeight:700}}>{a}</button>))}</div></div>
          <div><div style={{fontSize:12,fontWeight:600,color:'var(--text)',marginBottom:8}}>Tail</div><div style={{display:'flex',gap:4}}>{[['two','2-tail'],['right','Right'],['left','Left']].map(([k,l])=>(<button key={k} onClick={()=>setTail(k)} style={{flex:1,padding:'8px',borderRadius:8,border:`1.5px solid ${tail===k?C:'var(--border)'}`,background:tail===k?C:'var(--bg-raised)',color:tail===k?'#fff':'var(--text-2)',cursor:'pointer',fontSize:10,fontWeight:700}}>{l}</button>))}</div></div>
        </div>
        <div style={{display:'flex',gap:10}}>
          <button style={{flex:1,padding:13,borderRadius:10,border:'none',background:C,color:'#fff',fontSize:14,fontWeight:700,cursor:'pointer'}}>Run Test →</button>
          <button onClick={()=>{setMu0(100);setXbar(105);setSigma(15);setN(30);setAlpha(0.05);setTail('two')}} style={{padding:'13px 18px',borderRadius:10,border:'1.5px solid var(--border-2)',background:'var(--bg-raised)',color:'var(--text-2)',fontSize:13,fontWeight:500,cursor:'pointer'}}>Reset</button>
        </div>
      </>}
      right={<>
        {result?(<>
          {/* Result banner */}
          <div style={{background:resultColor+'15',border:`2px solid ${resultColor}40`,borderRadius:14,padding:'16px 20px',marginBottom:14,textAlign:'center'}}>
            <div style={{fontSize:22,fontWeight:700,color:resultColor,fontFamily:"'Space Grotesk',sans-serif"}}>{reject?'✗ Reject H₀':'✓ Fail to Reject H₀'}</div>
            <div style={{fontSize:13,color:'var(--text-2)',marginTop:6}}>{reject?`Sufficient evidence at α=${alpha}. The effect is statistically significant.`:`Insufficient evidence at α=${alpha}. Cannot conclude the effect is real.`}</div>
          </div>
          {/* Bell curve with critical regions */}
          <div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,padding:'14px 18px',marginBottom:14}}>
            <div style={{fontSize:12,fontWeight:700,color:'var(--text)',marginBottom:8}}>Test distribution — critical region</div>
            <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{display:'block',background:'var(--bg-raised)',borderRadius:8}}>
              <line x1={10} y1={H-15} x2={W-10} y2={H-15} stroke="var(--border)" strokeWidth="1"/>
              {/* Critical regions */}
              {(tail==='two'||tail==='left')&&<polygon points={critShadeLeft()} fill="#ef444420"/>}
              {(tail==='two'||tail==='right')&&<polygon points={critShadeRight()} fill="#ef444420"/>}
              <polyline points={curvePts} fill="none" stroke={C} strokeWidth="2.5" strokeLinejoin="round"/>
              {/* Critical value lines */}
              {(tail==='two'||tail==='left')&&<line x1={toSx(-critZ)} y1={10} x2={toSx(-critZ)} y2={H-15} stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4,3"/>}
              {(tail==='two'||tail==='right')&&<line x1={toSx(critZ)} y1={10} x2={toSx(critZ)} y2={H-15} stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4,3"/>}
              {/* Test statistic */}
              <line x1={toSx(zC)} y1={10} x2={toSx(zC)} y2={H-15} stroke={resultColor} strokeWidth="2.5"/>
              <circle cx={toSx(zC)} cy={Math.max(10,Math.min(H-20,toSy(normalPDF(zC))))} r={5} fill={resultColor} stroke="#fff" strokeWidth="2"/>
              {/* Labels */}
              <text x={toSx(zC)} y={8} textAnchor="middle" fontSize="8" fill={resultColor} fontWeight="700">{result.stat}={fmt(result.z)}</text>
              {(tail==='two'||tail==='right')&&<text x={toSx(critZ)} y={H-4} textAnchor="middle" fontSize="7" fill="#ef4444">+{fmt(critZ)}</text>}
              {(tail==='two'||tail==='left')&&<text x={toSx(-critZ)} y={H-4} textAnchor="middle" fontSize="7" fill="#ef4444">-{fmt(critZ)}</text>}
            </svg>
            <div style={{display:'flex',gap:10,marginTop:6,fontSize:9}}>
              <span style={{color:'#ef4444'}}>█ Critical region (α={alpha})</span>
              <span style={{color:resultColor}}>│ Test stat: {result.stat}={fmt(result.z)}</span>
            </div>
          </div>
          <BreakdownTable title="Test results" rows={[
            {label:`${result.stat}-statistic`,value:fmt(result.z),bold:true,color:C,highlight:true},
            ...(result.df?[{label:'Degrees of freedom',value:result.df.toString()}]:[]),
            {label:'p-value',value:fmtP(result.p),bold:true,color:reject?'#ef4444':'#10b981',highlight:true},
            {label:'Significance level α',value:alpha.toString()},
            {label:'Critical value ±',value:fmt(critZ)},
            {label:'Decision',value:reject?'Reject H₀':'Fail to reject H₀',color:resultColor},
            ...(result.ci?[{label:'95% CI',value:`[${fmt(result.ci[0])}, ${fmt(result.ci[1])}]`}]:[]),
          ]}/>
          <AIHintCard hint={`${result.stat}=${fmt(result.z)}, p=${fmtP(result.p)}. ${reject?`p < α=${alpha}: REJECT H₀. Statistically significant at ${(1-alpha)*100}% confidence.`:`p > α=${alpha}: FAIL TO REJECT H₀. Not statistically significant.`}`} color={C}/>
        </>):<div style={{padding:'40px',textAlign:'center',color:'var(--text-3)'}}>Enter parameters and run the test</div>}
      </>}
    />
    {/* Decision framework */}
    <Sec title="🔀 Hypothesis Testing Decision Framework" sub="Step-by-step process" color={C}>
      <div style={{display:'flex',flexDirection:'column',gap:8}}>
        {[['1. State hypotheses','Define H₀ (null) and H₁ (alternative). H₀ is always an equality (=). H₁ can be ≠, <, or >.',C],['2. Choose significance level α','Usually 0.05 (5%) or 0.01 (1%). This is the false positive rate you are willing to accept.','#10b981'],['3. Compute test statistic','Calculate z or t from your data. Measures how far the sample is from H₀ in standard error units.','#f59e0b'],['4. Find p-value','P(observed result | H₀ true). Two-tailed: p = 2×P(|Z|≥|z_obs|).','#8b5cf6'],['5. Make decision','If p < α: reject H₀. If p ≥ α: fail to reject H₀. Report effect size + CI, not just p.','#ef4444']].map(([step,desc,col],i)=>(<div key={i} style={{display:'flex',gap:12,padding:'12px 14px',borderRadius:10,background:col+'08',border:`1px solid ${col}20`}}><div style={{width:24,height:24,borderRadius:'50%',background:col,color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,flexShrink:0}}>{i+1}</div><div><div style={{fontSize:12,fontWeight:700,color:col,marginBottom:2}}>{step}</div><div style={{fontSize:11,color:'var(--text-2)',lineHeight:1.5}}>{desc}</div></div></div>))}
      </div>
    </Sec>
    {/* Common errors */}
    <Sec title="⚠️ Common Misinterpretations — Avoid These Mistakes" color={C}>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
        {[{wrong:'p = 0.03 means 3% chance H₀ is true',right:'p is the probability of data this extreme IF H₀ were true — it says nothing about H₀\'s probability.',col:'#ef4444'},{wrong:'"Not significant" proves H₀',right:'"Fail to reject" ≠ "accept." The test may lack power. Absence of evidence ≠ evidence of absence.',col:'#f59e0b'},{wrong:'p < 0.05 is always meaningful',right:'With n=10,000, tiny trivial differences become significant. Always report effect size (Cohen\'s d, r²).',col:'#8b5cf6'},{wrong:'One-tailed tests are always fine',right:'Only use one-tailed if the direction was specified before seeing data. Post-hoc directional tests inflate Type I error.',col:'#10b981'}].map((ex,i)=>(<div key={i} style={{padding:'12px',borderRadius:10,background:ex.col+'08',border:`1px solid ${ex.col}25`}}><div style={{fontSize:10,fontWeight:700,color:'#ef4444',marginBottom:4}}>✗ WRONG: {ex.wrong}</div><div style={{fontSize:10,color:'var(--text-2)',lineHeight:1.5,borderTop:`1px solid ${ex.col}20`,paddingTop:6,marginTop:4}}>✓ CORRECT: {ex.right}</div></div>))}
      </div>
    </Sec>
    <Sec title="Frequently asked questions" color={C}>{FAQ.map((f,i)=><Acc key={i} q={f.q} a={f.a} open={openFaq===i} onToggle={()=>setFaq(openFaq===i?null:i)} color={C}/>)}</Sec>
  </div>)
}
