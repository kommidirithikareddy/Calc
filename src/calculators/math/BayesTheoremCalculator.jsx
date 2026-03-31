import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'
const fmt = n => (isNaN(n)||!isFinite(n))? '—' : parseFloat(Number(n).toFixed(6)).toString()
const fmtP = n => (isNaN(n)||!isFinite(n))? '—' : (n*100).toFixed(3)+'%'
function Sec({title,sub,children}){return(<div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,overflow:'hidden'}}><div style={{padding:'13px 18px',borderBottom:'0.5px solid var(--border)',display:'flex',justifyContent:'space-between'}}><span style={{fontSize:13,fontWeight:700,color:'var(--text)',fontFamily:"'Space Grotesk',sans-serif"}}>{title}</span>{sub&&<span style={{fontSize:11,color:'var(--text-3)'}}>{sub}</span>}</div><div style={{padding:'16px 18px'}}>{children}</div></div>)}
function Acc({q,a,open,onToggle,color}){return(<div style={{borderBottom:'0.5px solid var(--border)'}}><button onClick={onToggle} style={{width:'100%',display:'flex',justifyContent:'space-between',alignItems:'center',padding:'13px 0',background:'none',border:'none',cursor:'pointer',gap:12,textAlign:'left'}}><span style={{fontSize:13,fontWeight:600,color:'var(--text)',fontFamily:"'DM Sans',sans-serif",lineHeight:1.4}}>{q}</span><span style={{fontSize:18,color,flexShrink:0,transform:open?'rotate(45deg)':'none',transition:'transform .2s'}}>+</span></button>{open&&<p style={{fontSize:12.5,color:'var(--text-2)',lineHeight:1.75,margin:'0 0 13px'}}>{a}</p>}</div>)}
function Inp({label,value,onChange,color,hint}){const[f,sf]=useState(false);return(<div style={{marginBottom:14}}><div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}><label style={{fontSize:12.5,fontWeight:600,color:'var(--text)',fontFamily:"'DM Sans',sans-serif"}}>{label}</label>{hint&&<span style={{fontSize:10,color:'var(--text-3)'}}>{hint}</span>}</div><div style={{display:'flex',height:44,border:`1.5px solid ${f?color:'var(--border-2)'}`,borderRadius:9,overflow:'hidden',background:'var(--bg-card)'}}><input type="number" step="0.001" value={value} onChange={e=>onChange(Math.max(0,Math.min(1,Number(e.target.value))))} onFocus={()=>sf(true)} onBlur={()=>sf(false)} style={{flex:1,border:'none',background:'transparent',padding:'0 14px',fontSize:17,fontWeight:700,color:'var(--text)',outline:'none',fontFamily:"'Space Grotesk',sans-serif"}}/></div></div>)}
const SCENARIOS=[
  {label:'Medical test',pA:0.01,pBgivenA:0.95,pBgivenNotA:0.05,Alabel:'Has disease',Blabel:'Tests positive'},
  {label:'Spam filter',pA:0.3,pBgivenA:0.9,pBgivenNotA:0.05,Alabel:'Is spam',Blabel:'Contains "FREE"'},
  {label:'Quality control',pA:0.02,pBgivenA:0.99,pBgivenNotA:0.03,Alabel:'Defective',Blabel:'Fails inspection'},
]
const FAQ=[
  {q:"What is Bayes' Theorem?",a:"Bayes' Theorem calculates the conditional probability of A given B: P(A|B) = P(B|A)×P(A) / P(B). It lets you update your belief about A after observing B. Named after Thomas Bayes, it is the mathematical foundation of rational belief updating."},
  {q:"What is the 'base rate fallacy'?",a:"The base rate fallacy is ignoring P(A) — the prior probability — when interpreting test results. A test that is 95% accurate for a disease with 1% prevalence gives a positive predictive value of only ~16%, not 95%. The rare disease means most positives are false alarms. Bayes' Theorem corrects for this."},
  {q:"What is sensitivity vs specificity?",a:"Sensitivity = P(positive test | disease) = true positive rate. Specificity = P(negative test | no disease) = true negative rate. High sensitivity catches almost all cases. High specificity avoids false alarms. A perfect test has both at 100%, but there is usually a trade-off."},
  {q:"What does prior and posterior probability mean?",a:"Prior P(A) is your belief before seeing evidence. Posterior P(A|B) is your updated belief after seeing evidence B. Bayes' Theorem converts priors to posteriors. Bayesian inference repeats this: today's posterior becomes tomorrow's prior as more evidence arrives."},
  {q:"Where is Bayes' Theorem used in practice?",a:"Medical diagnosis. Spam filters (naive Bayes classifier). Search engines (document relevance). Autonomous vehicles (sensor fusion). Machine learning (Bayesian neural networks). Insurance (risk assessment). Archaeology (radiocarbon dating uncertainty). Science (hypothesis testing alternative to p-values)."},
]
export default function BayesTheoremCalculator({meta,category}){
  const C=category?.color||'#6366f1'
  const[pA,setPA]=useState(0.01)
  const[pBgivenA,setPBgivenA]=useState(0.95)
  const[pBgivenNotA,setPBgivenNotA]=useState(0.05)
  const[Alabel,setAlabel]=useState('Has disease')
  const[Blabel,setBlabel]=useState('Tests positive')
  const[openFaq,setFaq]=useState(null)
  const[popSize,setPopSize]=useState(10000)
  const pNotA=1-pA
  const pB=pBgivenA*pA+pBgivenNotA*pNotA
  const pAgivenB=pB>0?(pBgivenA*pA)/pB:0
  const pNotAgivenB=1-pAgivenB
  const sensitivity=pBgivenA
  const specificity=1-pBgivenNotA
  const ppv=pAgivenB, npv=pB>0?(1-pBgivenNotA)*(1-pA)/(1-pB):0
  // Population visualization
  const tp=Math.round(pA*pBgivenA*popSize)
  const fp=Math.round(pNotA*pBgivenNotA*popSize)
  const fn2=Math.round(pA*(1-pBgivenA)*popSize)
  const tn=Math.round(pNotA*(1-pBgivenNotA)*popSize)
  return(<div style={{display:'flex',flexDirection:'column',gap:20}}>
    <div style={{background:`linear-gradient(135deg,${C}12,${C}06)`,border:`1px solid ${C}30`,borderRadius:14,padding:'16px 20px',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12}}>
      <div>
        <div style={{fontSize:10,fontWeight:700,color:C,textTransform:'uppercase',letterSpacing:'.08em',marginBottom:6}}>Bayes' Theorem</div>
        <div style={{fontSize:20,fontWeight:700,color:C,fontFamily:"'Space Grotesk',sans-serif"}}>P(A|B) = P(B|A)·P(A) / P(B)</div>
        <div style={{fontSize:11,color:'var(--text-3)',marginTop:4}}>Update beliefs with new evidence</div>
      </div>
      <div style={{padding:'10px 20px',background:C+'18',borderRadius:12,textAlign:'center'}}>
        <div style={{fontSize:11,color:'var(--text-3)',marginBottom:2}}>P(A|B) posterior</div>
        <div style={{fontSize:32,fontWeight:700,color:C,fontFamily:"'Space Grotesk',sans-serif"}}>{fmtP(pAgivenB)}</div>
        <div style={{fontSize:10,color:'var(--text-3)'}}>prior: {fmtP(pA)}</div>
      </div>
    </div>
    {/* Scenario presets */}
    <div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,padding:'14px 18px'}}>
      <div style={{fontSize:12,fontWeight:600,color:'var(--text-2)',marginBottom:12}}>Real-world scenarios</div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
        {SCENARIOS.map((sc,i)=>(<button key={i} onClick={()=>{setPA(sc.pA);setPBgivenA(sc.pBgivenA);setPBgivenNotA(sc.pBgivenNotA);setAlabel(sc.Alabel);setBlabel(sc.Blabel)}} style={{padding:'10px',borderRadius:10,border:`1.5px solid ${pA===sc.pA&&pBgivenA===sc.pBgivenA?C:'var(--border)'}`,background:pA===sc.pA&&pBgivenA===sc.pBgivenA?C+'12':'var(--bg-raised)',cursor:'pointer',textAlign:'center'}}><div style={{fontSize:11,fontWeight:700,color:C}}>{sc.label}</div><div style={{fontSize:9,color:'var(--text-3)'}}>Prior: {(sc.pA*100).toFixed(1)}%</div></button>))}
      </div>
    </div>
    <CalcShell
      left={<>
        <div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:16,paddingBottom:8,borderBottom:'0.5px solid var(--border)'}}>Bayes' Parameters</div>
        <div style={{padding:'10px 14px',background:'var(--bg-raised)',borderRadius:10,border:'0.5px solid var(--border)',marginBottom:14}}>
          <div style={{fontSize:11,color:'var(--text-2)'}}>Event A: <strong style={{color:C}}>{Alabel}</strong></div>
          <div style={{fontSize:11,color:'var(--text-2)',marginTop:2}}>Event B: <strong style={{color:C}}>{Blabel}</strong></div>
        </div>
        <Inp label="P(A) — prior probability" value={pA} onChange={setPA} color={C} hint="prevalence / base rate"/>
        <Inp label="P(B|A) — sensitivity" value={pBgivenA} onChange={setPBgivenA} color={C} hint="true positive rate"/>
        <Inp label="P(B|Aᶜ) — false positive rate" value={pBgivenNotA} onChange={setPBgivenNotA} color={C} hint="1 − specificity"/>
        <div style={{padding:'12px 14px',background:C+'08',borderRadius:10,border:`1px solid ${C}20`,marginBottom:14}}>
          <div style={{fontSize:11,color:'var(--text-3)',marginBottom:4}}>Step by step</div>
          <div style={{fontSize:11,color:'var(--text-2)',lineHeight:1.8}}>
            <div>P(B) = P(B|A)·P(A) + P(B|Aᶜ)·P(Aᶜ)</div>
            <div>= {pBgivenA}×{fmt(pA)} + {pBgivenNotA}×{fmt(pNotA)}</div>
            <div>= <strong style={{color:C}}>{fmt(pB)}</strong></div>
            <div style={{marginTop:4}}>P(A|B) = {pBgivenA}×{fmt(pA)} / {fmt(pB)} = <strong style={{color:C}}>{fmtP(pAgivenB)}</strong></div>
          </div>
        </div>
        <div style={{display:'flex',gap:10}}>
          <button style={{flex:1,padding:13,borderRadius:10,border:'none',background:C,color:'#fff',fontSize:14,fontWeight:700,cursor:'pointer'}}>Calculate →</button>
          <button onClick={()=>{setPA(0.01);setPBgivenA(0.95);setPBgivenNotA(0.05)}} style={{padding:'13px 18px',borderRadius:10,border:'1.5px solid var(--border-2)',background:'var(--bg-raised)',color:'var(--text-2)',fontSize:13,fontWeight:500,cursor:'pointer'}}>Reset</button>
        </div>
      </>}
      right={<>
        <div style={{background:'var(--bg-card)',border:`1.5px solid ${C}30`,borderRadius:14,padding:'18px 20px',marginBottom:14}}>
          <div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',marginBottom:8}}>Posterior P(A|B)</div>
          <div style={{fontSize:38,fontWeight:700,color:C,fontFamily:"'Space Grotesk',sans-serif"}}>{fmtP(pAgivenB)}</div>
          <div style={{fontSize:12,color:'var(--text-3)',marginTop:6}}>Prior: {fmtP(pA)} → Posterior: {fmtP(pAgivenB)} {pAgivenB>pA?'📈 Updated up':'📉 Updated down'}</div>
        </div>
        {/* Prior vs Posterior visual */}
        <div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,padding:'14px 18px',marginBottom:14}}>
          <div style={{fontSize:12,fontWeight:700,color:'var(--text)',marginBottom:12}}>Prior → Posterior update</div>
          {[['Prior P(A)',pA,'#10b981'],['Posterior P(A|B)',pAgivenB,C]].map(([label,val,col])=>(<div key={label} style={{marginBottom:10}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}><span style={{fontSize:11,fontWeight:600,color:'var(--text)'}}>{label}</span><span style={{fontSize:12,fontWeight:700,color:col}}>{fmtP(val)}</span></div>
            <div style={{height:10,background:'var(--bg-raised)',borderRadius:5,overflow:'hidden'}}><div style={{width:`${val*100}%`,height:'100%',background:col,borderRadius:5,transition:'width .5s'}}/></div>
          </div>))}
        </div>
        <BreakdownTable title="Full Test Statistics" rows={[
          {label:'P(A|B) posterior (PPV)',value:fmtP(ppv),bold:true,highlight:true,color:C},
          {label:'P(Aᶜ|B) — false discovery',value:fmtP(pNotAgivenB),color:'#ef4444'},
          {label:'Sensitivity P(B|A)',value:fmtP(sensitivity),color:'#10b981'},
          {label:'Specificity 1−P(B|Aᶜ)',value:fmtP(specificity),color:'#10b981'},
          {label:'P(B) total positive rate',value:fmtP(pB)},
          {label:'NPV P(Aᶜ|Bᶜ)',value:fmtP(npv),note:'negative pred value'},
        ]}/>
        <AIHintCard hint={`Prior P(A)=${fmtP(pA)} → Posterior P(A|B)=${fmtP(pAgivenB)}. Even with ${fmtP(pBgivenA)} sensitivity, if prevalence is ${fmtP(pA)}, ${fmtP(pNotAgivenB)} of positives are false alarms!`} color={C}/>
      </>}
    />
    {/* Population visualization */}
    <Sec title="👥 Population Visualization" sub={`Out of ${popSize.toLocaleString()} people`}>
      <div style={{display:'flex',gap:8,marginBottom:14,flexWrap:'wrap'}}>
        {[1000,10000,100000].map(k=>(<button key={k} onClick={()=>setPopSize(k)} style={{padding:'7px 14px',borderRadius:20,fontSize:11,fontWeight:600,border:'1.5px solid',borderColor:popSize===k?C:'var(--border)',background:popSize===k?C:'var(--bg-raised)',color:popSize===k?'#fff':'var(--text-2)',cursor:'pointer'}}>{k.toLocaleString()}</button>))}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:14}}>
        {[{label:'True Positives',sublabel:'Has disease + tests positive',val:tp,color:C},{label:'False Positives',sublabel:'No disease + tests positive',val:fp,color:'#ef4444'},{label:'False Negatives',sublabel:'Has disease + tests negative',val:fn2,color:'#f59e0b'},{label:'True Negatives',sublabel:'No disease + tests negative',val:tn,color:'#10b981'}].map((cell,i)=>(<div key={i} style={{padding:'12px',borderRadius:10,background:cell.color+'08',border:`1px solid ${cell.color}25`}}><div style={{fontSize:22,fontWeight:700,color:cell.color}}>{cell.val.toLocaleString()}</div><div style={{fontSize:11,fontWeight:600,color:'var(--text)',marginTop:2}}>{cell.label}</div><div style={{fontSize:10,color:'var(--text-3)',marginTop:2}}>{cell.sublabel}</div></div>))}
      </div>
      <div style={{padding:'10px 14px',background:C+'08',borderRadius:9,border:`1px solid ${C}20`}}>
        <div style={{fontSize:11,color:'var(--text-2)',lineHeight:1.75}}>
          Of <strong>{(tp+fp).toLocaleString()}</strong> positive tests, only <strong style={{color:C}}>{tp.toLocaleString()} ({fmtP(pAgivenB)})</strong> actually have {Alabel.toLowerCase()}. <strong style={{color:'#ef4444'}}>{fp.toLocaleString()} ({fmtP(pNotAgivenB)})</strong> are false alarms!
        </div>
      </div>
    </Sec>
    {/* Bayesian updating */}
    <Sec title="🔄 Bayesian Updating — Multiple Tests" sub="What if you test twice?">
      <p style={{fontSize:12,color:'var(--text-2)',lineHeight:1.75,marginBottom:14}}>After a positive test, your updated belief becomes the new prior. Run the test again (independently) and update once more.</p>
      {[1,2,3].map(tests=>{let p=pA;for(let t=0;t<tests;t++){const pBnew=pBgivenA*p+pBgivenNotA*(1-p);p=(pBgivenA*p)/pBnew}return(<div key={tests} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 14px',background:tests===1?C+'08':'var(--bg-raised)',borderRadius:10,border:`1px solid ${tests===1?C+'25':'var(--border)'}`,marginBottom:8}}>
        <span style={{fontSize:12,fontWeight:600,color:'var(--text)'}}>After {tests} positive test{tests>1?'s':''}</span>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          <div style={{height:8,width:100,background:'var(--bg-raised)',borderRadius:4,overflow:'hidden',border:'1px solid var(--border)'}}><div style={{width:`${p*100}%`,height:'100%',background:C,borderRadius:4}}/></div>
          <span style={{fontSize:13,fontWeight:700,color:C,minWidth:55}}>{fmtP(p)}</span>
        </div>
      </div>)})}
    </Sec>
    <Sec title="Frequently asked questions">{FAQ.map((f,i)=><Acc key={i} q={f.q} a={f.a} open={openFaq===i} onToggle={()=>setFaq(openFaq===i?null:i)} color={C}/>)}</Sec>
  </div>)
}
