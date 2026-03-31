import { useState, useMemo } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'
const fmt=n=>(isNaN(n)||!isFinite(n))? '—':parseFloat(Number(n).toFixed(4)).toString()
function Sec({title,sub,children,color}){return(<div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,overflow:'hidden'}}><div style={{padding:'13px 18px',borderBottom:'0.5px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center',background:color?color+'06':'transparent'}}><span style={{fontSize:13,fontWeight:700,color:'var(--text)',fontFamily:"'Space Grotesk',sans-serif"}}>{title}</span>{sub&&<span style={{fontSize:11,color:'var(--text-3)'}}>{sub}</span>}</div><div style={{padding:'16px 18px'}}>{children}</div></div>)}
function Acc({q,a,open,onToggle,color}){return(<div style={{borderBottom:'0.5px solid var(--border)'}}><button onClick={onToggle} style={{width:'100%',display:'flex',justifyContent:'space-between',alignItems:'center',padding:'13px 0',background:'none',border:'none',cursor:'pointer',gap:12,textAlign:'left'}}><span style={{fontSize:13,fontWeight:600,color:'var(--text)',fontFamily:"'DM Sans',sans-serif",lineHeight:1.4}}>{q}</span><span style={{fontSize:18,color,flexShrink:0,transform:open?'rotate(45deg)':'none',transition:'transform .2s'}}>+</span></button>{open&&<p style={{fontSize:12.5,color:'var(--text-2)',lineHeight:1.75,margin:'0 0 13px'}}>{a}</p>}</div>)}
function Inp({label,value,onChange,color,hint,step='any',min,max}){const[f,sf]=useState(false);return(<div style={{marginBottom:14}}><div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}><label style={{fontSize:12.5,fontWeight:600,color:'var(--text)',fontFamily:"'DM Sans',sans-serif"}}>{label}</label>{hint&&<span style={{fontSize:10,color:'var(--text-3)'}}>{hint}</span>}</div><div style={{display:'flex',height:44,border:`1.5px solid ${f?color:'var(--border-2)'}`,borderRadius:9,overflow:'hidden',background:'var(--bg-card)',boxShadow:f?`0 0 0 3px ${color}18`:'none'}}><input type="number" step={step} min={min} max={max} value={value} onChange={e=>onChange(Number(e.target.value))} onFocus={()=>sf(true)} onBlur={()=>sf(false)} style={{flex:1,border:'none',background:'transparent',padding:'0 14px',fontSize:17,fontWeight:700,color:'var(--text)',outline:'none',fontFamily:"'Space Grotesk',sans-serif"}}/></div></div>)}
function invNorm(p){if(p<=0)return -Infinity;if(p>=1)return Infinity;const a=[2.515517,0.802853,0.010328];const b=[1.432788,0.189269,0.001308];const sign=p<0.5?-1:1;const q2=Math.min(p,1-p);const t=Math.sqrt(-2*Math.log(q2));return sign*(t-(a[0]+t*(a[1]+t*a[2]))/(1+t*(b[0]+t*(b[1]+t*b[2]))))}
const FAQ=[
  {q:'Why does sample size matter?',a:'A sample that is too small gives unreliable results with wide confidence intervals — you might miss real effects or find spurious ones. Too large wastes resources. The correct sample size balances precision, power, and cost. It depends on what you are measuring, how much variability exists, and how confident you need to be.'},
  {q:'What is statistical power?',a:'Power (1−β) is the probability of detecting a real effect when it truly exists. Power = 0.8 means 80% chance of finding significance if the true effect is real. Low power → high false-negative rate. Most studies aim for 80% or 90% power. Increasing sample size increases power.'},
  {q:'What is a Type I vs Type II error?',a:'Type I error (α = false positive): rejecting H₀ when it is true. α = 0.05 means 5% chance of this error. Type II error (β = false negative): failing to reject H₀ when it is false. Power = 1−β. Reducing α (e.g. 0.01) requires larger n to maintain the same power.'},
  {q:'What is the minimum detectable effect?',a:'The smallest effect you want to reliably detect. Smaller effects require larger samples. A drug that improves survival by 1% needs far more patients than one that improves by 20%. Effect size should be based on clinical or practical significance, not just statistical convention.'},
  {q:'What is the finite population correction?',a:'When sampling from a small, known population N without replacement: n_corrected = n / (1 + n/N). This reduces the required sample size. For surveys, if N = 1000 and uncorrected n = 400, corrected n = 400/(1+400/1000) = 286. The correction only matters when n > 5% of N.'},
]
export default function SampleSizeCalculator({meta,category}){
  const C=category?.color||'#6366f1'
  const[mode,setMode]=useState('proportion')
  const[cl,setCl]=useState(95)
  const[power,setPower]=useState(80)
  const[me,setMe]=useState(5)
  const[p,setP]=useState(50)
  const[sigma,setSigma]=useState(15)
  const[effect,setEffect]=useState(5)
  const[population,setPopulation]=useState(0)
  const[openFaq,setFaq]=useState(null)
  const CL=cl/100,POWER=power/100
  const zAlpha=Math.abs(invNorm((1-CL)/2))
  const zBeta=Math.abs(invNorm(1-POWER))
  const ME=me/100
  const propP=p/100
  // Sample size for proportion CI
  const n_prop_ci=Math.ceil(zAlpha**2*propP*(1-propP)/ME**2)
  // Sample size for mean CI
  const n_mean_ci=Math.ceil((zAlpha*sigma/effect)**2)
  // Sample size for two proportion test
  const p0=propP,p1=propP+effect/100
  const p_bar=(p0+p1)/2
  const n_prop_test=Math.ceil(((zAlpha*Math.sqrt(2*p_bar*(1-p_bar))+zBeta*Math.sqrt(p0*(1-p0)+p1*(1-p1)))/Math.abs(p1-p0))**2)
  // Sample size for t-test (two sample)
  const n_ttest=Math.ceil(2*(zAlpha+zBeta)**2*(sigma/effect)**2)
  const rawN=mode==='proportion'?n_prop_ci:n_mean_ci
  // Finite population correction
  const Pop=Math.round(population)
  const correctedN=Pop>0&&rawN<Pop?Math.ceil(rawN/(1+rawN/Pop)):rawN
  const finalN=Pop>0?correctedN:rawN
  return(<div style={{display:'flex',flexDirection:'column',gap:20}}>
    <div style={{background:`linear-gradient(135deg,${C}12,${C}06)`,border:`1px solid ${C}30`,borderRadius:14,padding:'16px 20px',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12}}>
      <div>
        <div style={{fontSize:10,fontWeight:700,color:C,textTransform:'uppercase',letterSpacing:'.08em',marginBottom:6}}>Sample Size Calculator</div>
        <div style={{fontSize:20,fontWeight:700,color:C,fontFamily:"'Space Grotesk',sans-serif"}}>n = (z* / ME)² · p(1−p)</div>
        <div style={{fontSize:11,color:'var(--text-3)',marginTop:4}}>{cl}% confidence · {me}% margin of error · power {power}%</div>
      </div>
      <div style={{padding:'10px 20px',background:C+'18',borderRadius:12,textAlign:'center'}}>
        <div style={{fontSize:11,color:'var(--text-3)',marginBottom:2}}>Required n</div>
        <div style={{fontSize:42,fontWeight:700,color:C,fontFamily:"'Space Grotesk',sans-serif",lineHeight:1}}>{finalN.toLocaleString()}</div>
        {Pop>0&&<div style={{fontSize:10,color:'var(--text-3)',marginTop:2}}>corrected from {rawN}</div>}
      </div>
    </div>
    {/* Mode tabs */}
    <div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,padding:'14px 18px'}}>
      <div style={{fontSize:12,fontWeight:600,color:'var(--text-2)',marginBottom:12}}>What are you estimating?</div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
        {[['proportion','Proportion / Percentage (e.g. survey)'],['mean','Mean / Average (e.g. measurement)']].map(([k,l])=>(<button key={k} onClick={()=>setMode(k)} style={{padding:'12px',borderRadius:10,border:`1.5px solid ${mode===k?C:'var(--border)'}`,background:mode===k?C+'12':'var(--bg-raised)',cursor:'pointer',textAlign:'left',fontSize:12,fontWeight:mode===k?700:500,color:mode===k?C:'var(--text-2)'}}>{l}</button>))}
      </div>
    </div>
    <CalcShell
      left={<>
        <div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:16,paddingBottom:8,borderBottom:'0.5px solid var(--border)'}}>Parameters</div>
        {/* Confidence level */}
        <div style={{marginBottom:14}}>
          <div style={{fontSize:12.5,fontWeight:600,color:'var(--text)',marginBottom:8}}>Confidence level</div>
          <div style={{display:'flex',gap:6}}>{[90,95,99].map(c=>(<button key={c} onClick={()=>setCl(c)} style={{flex:1,padding:'10px',borderRadius:10,border:`1.5px solid ${cl===c?C:'var(--border)'}`,background:cl===c?C:'var(--bg-raised)',color:cl===c?'#fff':'var(--text-2)',cursor:'pointer',fontSize:13,fontWeight:700}}>{c}%</button>))}</div>
        </div>
        {/* Power */}
        <div style={{marginBottom:14}}>
          <div style={{fontSize:12.5,fontWeight:600,color:'var(--text)',marginBottom:8}}>Statistical power (1−β): {power}%</div>
          <input type="range" min="70" max="99" step="1" value={power} onChange={e=>setPower(Number(e.target.value))} style={{width:'100%',accentColor:C,height:6}}/>
          <div style={{display:'flex',justifyContent:'space-between',fontSize:10,color:'var(--text-3)',marginTop:3}}><span>70%</span><span>80% (standard)</span><span>99%</span></div>
        </div>
        <Inp label="Margin of error (%)" value={me} onChange={v=>setMe(Math.max(0.1,Math.min(50,v)))} color={C} hint="e.g. 5 = ±5%" step="0.1" min="0.1" max="50"/>
        {mode==='proportion'
          ?<Inp label="Expected proportion (%)" value={p} onChange={v=>setP(Math.max(1,Math.min(99,v)))} color={C} hint="use 50% if unknown" step="1"/>
          :<><Inp label="Population std deviation (σ)" value={sigma} onChange={v=>setSigma(Math.max(0.1,v))} color={C} step="0.1"/><Inp label="Effect size (minimum detectable)" value={effect} onChange={v=>setEffect(Math.max(0.1,v))} color={C} hint="smallest diff that matters" step="0.1"/></>
        }
        <Inp label="Population size (0 = infinite)" value={population} onChange={v=>setPopulation(Math.max(0,Math.round(v)))} color={C} hint="for finite pop correction" step="1"/>
        <div style={{padding:'10px 14px',background:C+'08',borderRadius:10,border:`1px solid ${C}20`,marginBottom:14}}>
          <div style={{fontSize:11,color:'var(--text-3)',marginBottom:4}}>Formula components</div>
          <div style={{fontSize:11,color:'var(--text-2)',lineHeight:1.7,fontFamily:"'Space Grotesk',sans-serif"}}>
            <div>z* = {fmt(zAlpha)} (for {cl}% CI)</div>
            <div>z_β = {fmt(zBeta)} (for {power}% power)</div>
            {mode==='proportion'&&<div>n = {fmt(zAlpha)}² × {fmt(propP)} × {fmt(1-propP)} / {fmt(ME)}² = {rawN.toLocaleString()}</div>}
            {mode==='mean'&&<div>n = ({fmt(zAlpha)} × {sigma} / {effect})² = {rawN.toLocaleString()}</div>}
            {Pop>0&&rawN<Pop&&<div>Corrected: {rawN}/（1+{rawN}/{Pop}) = {correctedN}</div>}
          </div>
        </div>
        <div style={{display:'flex',gap:10}}>
          <button style={{flex:1,padding:13,borderRadius:10,border:'none',background:C,color:'#fff',fontSize:14,fontWeight:700,cursor:'pointer'}}>Calculate →</button>
          <button onClick={()=>{setMe(5);setP(50);setSigma(15);setEffect(5);setPower(80);setCl(95);setPopulation(0)}} style={{padding:'13px 18px',borderRadius:10,border:'1.5px solid var(--border-2)',background:'var(--bg-raised)',color:'var(--text-2)',fontSize:13,fontWeight:500,cursor:'pointer'}}>Reset</button>
        </div>
      </>}
      right={<>
        <div style={{background:'var(--bg-card)',border:`1.5px solid ${C}30`,borderRadius:14,padding:'18px 20px',marginBottom:14}}>
          <div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',marginBottom:12}}>Required sample size</div>
          <div style={{fontSize:56,fontWeight:700,color:C,fontFamily:"'Space Grotesk',sans-serif",lineHeight:1}}>{finalN.toLocaleString()}</div>
          <div style={{fontSize:13,color:'var(--text-3)',marginTop:8}}>
            {Pop>0?`${correctedN} (finite pop corrected from ${rawN})`:`participants needed (infinite population)`}
          </div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:14}}>
          {[['z* critical',fmt(zAlpha),C,'for CI'],['z_β power',fmt(zBeta),'#10b981','for power'],['CI level',`${cl}%`,'#8b5cf6',''],['Power',`${power}%`,'#f59e0b','']].map(([l,v,col,sub])=>(<div key={l} style={{padding:'10px',borderRadius:10,background:col+'08',border:`1px solid ${col}20`,textAlign:'center'}}><div style={{fontSize:9,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',marginBottom:3}}>{l}</div><div style={{fontSize:18,fontWeight:700,color:col,fontFamily:"'Space Grotesk',sans-serif"}}>{v}</div>{sub&&<div style={{fontSize:9,color:'var(--text-3)',marginTop:2}}>{sub}</div>}</div>))}
        </div>
        <BreakdownTable title="Summary" rows={[
          {label:'Required n (raw)',value:rawN.toLocaleString(),bold:true,color:C,highlight:true},
          ...(Pop>0?[{label:'Corrected n (finite pop)',value:correctedN.toLocaleString(),bold:true,color:'#10b981',highlight:true}]:[]),
          {label:'Confidence level',value:`${cl}%`},
          {label:'Margin of error',value:`±${me}%`},
          {label:'Power (1−β)',value:`${power}%`},
          {label:'z* (alpha)',value:fmt(zAlpha)},
          ...(mode==='proportion'?[{label:'Proportion p',value:`${p}%`}]:[{label:'Std dev σ',value:fmt(sigma)},{label:'Effect size',value:fmt(effect)}]),
        ]}/>
        <AIHintCard hint={`You need n=${finalN.toLocaleString()} participants for ${cl}% confidence, ±${me}% margin of error, and ${power}% power. ${Pop>0?`Finite population correction applied (N=${Pop.toLocaleString()}).`:''}`} color={C}/>
      </>}
    />
    {/* ME vs n trade-off */}
    <Sec title="📊 Trade-off: Margin of Error vs Sample Size" sub={`At ${cl}% confidence · ${mode==='proportion'?`p=${p}%`:`σ=${sigma}`}`} color={C}>
      <p style={{fontSize:12,color:'var(--text-2)',lineHeight:1.7,marginBottom:14}}>Halving the margin of error requires 4× more participants (n ∝ 1/ME²). This is the fundamental cost of precision.</p>
      <div style={{overflowX:'auto'}}>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead><tr>{['Margin of Error','Sample Size','4× rule','Cost (relative)'].map(h=>(<th key={h} style={{padding:'8px 10px',fontSize:11,fontWeight:700,color:'var(--text-3)',textAlign:'right',borderBottom:'1px solid var(--border)',background:'var(--bg-raised)'}}>{h}</th>))}</tr></thead>
          <tbody>{[1,2,3,5,7,10,15,20].map((targetME,i)=>{
            const tME=targetME/100
            const tN=mode==='proportion'?Math.ceil(zAlpha**2*propP*(1-propP)/tME**2):Math.ceil((zAlpha*sigma/(targetME/100*sigma/me*effect))**2)
            const refN=mode==='proportion'?Math.ceil(zAlpha**2*propP*(1-propP)/(me/100)**2):rawN
            const isCurr=Math.abs(targetME-me)<0.5
            return(<tr key={i} style={{background:isCurr?C+'08':i%2===0?'transparent':'var(--bg-raised)'}}>
              <td style={{padding:'7px 10px',fontSize:12,fontWeight:isCurr?700:400,color:isCurr?C:'var(--text)',textAlign:'right'}}>±{targetME}%{isCurr?' ◀':''}</td>
              <td style={{padding:'7px 10px',fontSize:12,fontWeight:isCurr?700:400,color:isCurr?C:'var(--text)',textAlign:'right',fontFamily:"'Space Grotesk',sans-serif"}}>{tN.toLocaleString()}</td>
              <td style={{padding:'7px 10px',fontSize:11,color:'var(--text-3)',textAlign:'right'}}>{i>0?`${((tN/([1,2,3,5,7,10,15,20].slice(0,i).map(m=>{const m2=m/100;return mode==='proportion'?Math.ceil(zAlpha**2*propP*(1-propP)/m2**2):rawN}).slice(-1)[0]||tN))).toFixed(1)}×`:'—'}</td>
              <td style={{padding:'7px 10px',textAlign:'right'}}>
                <div style={{display:'flex',justifyContent:'flex-end'}}><div style={{height:8,width:`${Math.min(100,(tN/Math.max(mode==='proportion'?Math.ceil(zAlpha**2*propP*(1-propP)/0.0001):rawN*4,1))*100)}%`,maxWidth:100,background:isCurr?C:C+'60',borderRadius:4}}/></div>
              </td>
            </tr>)
          })}</tbody>
        </table>
      </div>
    </Sec>
    {/* Power analysis */}
    <Sec title="⚡ Power Analysis — n vs Statistical Power" sub="At fixed effect size and alpha" color={C}>
      <p style={{fontSize:12,color:'var(--text-2)',lineHeight:1.7,marginBottom:14}}>Increasing sample size increases power. Power ≥ 80% is the standard threshold. Below shows required n for different power targets.</p>
      <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:8}}>
        {[70,75,80,85,90,95,99].map(pw=>{
          const zB=Math.abs(invNorm(1-pw/100))
          const np=mode==='proportion'?Math.ceil(((zAlpha*Math.sqrt(2*propP*(1-propP))+zB*Math.sqrt(propP*(1-propP)+Math.min(propP+0.05,0.99)*(1-Math.min(propP+0.05,0.99))))/0.05)**2):Math.ceil(2*(zAlpha+zB)**2*(sigma/effect)**2)
          const isCurr=pw===power
          return(<div key={pw} style={{padding:'12px 8px',borderRadius:10,background:isCurr?C+'15':'var(--bg-raised)',border:`1.5px solid ${isCurr?C:'var(--border)'}`,textAlign:'center'}}>
            <div style={{fontSize:14,fontWeight:700,color:isCurr?C:'var(--text)'}}>n={np.toLocaleString()}</div>
            <div style={{fontSize:11,fontWeight:700,color:isCurr?C:'var(--text-3)',marginTop:3}}>{pw}% power</div>
            {isCurr&&<div style={{fontSize:9,color:C,marginTop:2}}>← your setting</div>}
          </div>)
        })}
      </div>
    </Sec>
    {/* Real-world examples */}
    <Sec title="🌍 Real-world sample size examples" color={C}>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
        {[{icon:'🗳️',title:'Election poll',desc:'±3% ME, 95% CI, p=50% → n=1,068. Most TV polls use 1,000–1,500 respondents for this reason.',color:C},{icon:'💊',title:'Clinical trial',desc:'Drug vs placebo: 80% power, α=0.05, medium effect size → typically 150–400 per group. FDA requires adequate power.',color:'#10b981'},{icon:'🛒',title:'A/B website test',desc:'Conversion 5%, detect +1%, 80% power → n≈3,800 per variant. Tests often run 2–4 weeks to accumulate users.',color:'#f59e0b'},{icon:'🏭',title:'Quality inspection',desc:'Acceptance sampling: inspect n=50 from a batch of 1,000. If ≤1 defect, accept batch. Balances cost vs risk.',color:'#8b5cf6'}].map((rw,i)=>(<div key={i} style={{padding:'12px 13px',borderRadius:11,background:rw.color+'08',border:`1px solid ${rw.color}25`}}><div style={{display:'flex',gap:8,alignItems:'center',marginBottom:6}}><span style={{fontSize:18}}>{rw.icon}</span><span style={{fontSize:12,fontWeight:700,color:rw.color}}>{rw.title}</span></div><p style={{fontSize:11.5,color:'var(--text-2)',lineHeight:1.6,margin:0}}>{rw.desc}</p></div>))}
      </div>
    </Sec>
    <Sec title="Frequently asked questions" color={C}>{FAQ.map((f,i)=><Acc key={i} q={f.q} a={f.a} open={openFaq===i} onToggle={()=>setFaq(openFaq===i?null:i)} color={C}/>)}</Sec>
  </div>)
}
