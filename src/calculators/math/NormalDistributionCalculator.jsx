import { useState, useMemo, useEffect } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import ResultHero from '../../components/calculator/ResultHero'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'

const fmt  = n => (isNaN(n)||!isFinite(n)) ? '—' : parseFloat(Number(n).toFixed(6)).toString()
const fmtP = n => (n*100).toFixed(4)+'%'
const fmtP2= n => (n*100).toFixed(2)+'%'

// ── Math helpers ─────────────────────────────────────────────
function erf(x){
  const t=1/(1+0.3275911*Math.abs(x))
  const y=1-t*(0.254829592+t*(-0.284496736+t*(1.421413741+t*(-1.453152027+t*1.061405429))))*Math.exp(-x*x)
  return x>=0?y:-y
}
function normalCDF(x,mu,sigma){return 0.5*(1+erf((x-mu)/(sigma*Math.sqrt(2))))}
function normalPDF(x,mu,sigma){return Math.exp(-0.5*((x-mu)/sigma)**2)/(sigma*Math.sqrt(2*Math.PI))}
function inverseNormal(p){
  if(p<=0)return -Infinity; if(p>=1)return Infinity
  const a=[2.515517,0.802853,0.010328], b=[1.432788,0.189269,0.001308]
  const sign=p<0.5?-1:1, q=Math.min(p,1-p)
  const t=Math.sqrt(-2*Math.log(q))
  const num=a[0]+t*(a[1]+t*a[2]), den=1+t*(b[0]+t*(b[1]+t*b[2]))
  return sign*(t-num/den)
}

// ── Shared sub-components ────────────────────────────────────
function FieldInput({label,hint,value,onChange,catColor='#3b82f6',step='any'}){
  const[focused,setFocused]=useState(false)
  return(
    <div style={{marginBottom:14}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:5}}>
        <label style={{fontSize:12.5,fontWeight:600,color:'var(--text)',fontFamily:"'DM Sans',sans-serif"}}>{label}</label>
        {hint&&<span style={{fontSize:10,color:'var(--text-3)'}}>{hint}</span>}
      </div>
      <div style={{display:'flex',alignItems:'center',gap:6,background:'var(--bg-input,var(--bg-card))',border:`1.5px solid ${focused?catColor:'var(--border)'}`,borderRadius:8,padding:'0 10px',height:38,boxShadow:focused?`0 0 0 3px ${catColor}18`:'none'}}>
        <input type="number" step={step} value={value}
          onChange={e=>onChange(Number(e.target.value))}
          onFocus={()=>setFocused(true)}
          onBlur={()=>setFocused(false)}
          style={{flex:1,border:'none',background:'transparent',fontSize:14,fontWeight:700,color:'var(--text)',outline:'none',fontFamily:"'Space Grotesk',sans-serif"}}/>
      </div>
    </div>
  )
}
function AccordionItem({q,a,isOpen,onToggle,catColor}){
  return(
    <div style={{borderBottom:'0.5px solid var(--border)'}}>
      <button onClick={onToggle} style={{width:'100%',display:'flex',justifyContent:'space-between',alignItems:'center',padding:'14px 0',background:'none',border:'none',cursor:'pointer',gap:12,textAlign:'left'}}>
        <span style={{fontSize:13,fontWeight:600,color:'var(--text)',fontFamily:"'DM Sans',sans-serif",lineHeight:1.4}}>{q}</span>
        <span style={{fontSize:18,color:catColor,flexShrink:0,transition:'transform .2s',transform:isOpen?'rotate(45deg)':'rotate(0)',display:'inline-block'}}>+</span>
      </button>
      {isOpen&&<p style={{fontSize:12.5,color:'var(--text-2)',lineHeight:1.75,margin:'0 0 14px',fontFamily:"'DM Sans',sans-serif"}}>{a}</p>}
    </div>
  )
}
function GlossaryTerm({term,def,catColor}){
  const[open,setOpen]=useState(false)
  return(
    <div onClick={()=>setOpen(o=>!o)} style={{padding:'9px 12px',borderRadius:8,cursor:'pointer',background:open?catColor+'10':'var(--bg-raised)',border:`1px solid ${open?catColor+'30':'var(--border)'}`,transition:'all .15s'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:8}}>
        <span style={{fontSize:12,fontWeight:700,color:open?catColor:'var(--text)',fontFamily:"'Space Grotesk',sans-serif"}}>{term}</span>
        <span style={{fontSize:14,color:catColor,flexShrink:0}}>{open?'−':'+'}</span>
      </div>
      {open&&<p style={{fontSize:11.5,color:'var(--text-2)',lineHeight:1.65,margin:'7px 0 0',fontFamily:"'DM Sans',sans-serif"}}>{def}</p>}
    </div>
  )
}
function Section({title,subtitle,children}){
  return(
    <div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,overflow:'hidden'}}>
      <div style={{padding:'14px 18px',borderBottom:'0.5px solid var(--border)'}}>
        <div style={{fontSize:13,fontWeight:700,color:'var(--text)',fontFamily:"'Space Grotesk',sans-serif"}}>{title}</div>
        {subtitle&&<div style={{fontSize:11,color:'var(--text-3)',marginTop:2}}>{subtitle}</div>}
      </div>
      <div style={{padding:'16px 18px'}}>{children}</div>
    </div>
  )
}

// ── Constants ────────────────────────────────────────────────
const MODES=[
  {key:'point',     label:'P(X ≤ x)'},
  {key:'right',     label:'P(X ≥ x)'},
  {key:'between',   label:'P(x₁ ≤ X ≤ x₂)'},
  {key:'percentile',label:'Find x for p%'},
]

const COMMON_DISTS=[
  {label:'Standard Normal', desc:'μ=0, σ=1',   mu:0,   sigma:1},
  {label:'IQ Scores',       desc:'μ=100, σ=15', mu:100, sigma:15},
  {label:'SAT Scores',      desc:'μ=1000, σ=200',mu:1000,sigma:200},
]

const FAQ=[
  {q:'What is the normal distribution?',a:'The normal (Gaussian) distribution is a symmetric bell-shaped curve defined by mean μ and standard deviation σ. It models countless natural phenomena: heights, measurement errors, test scores, and stock returns. The Central Limit Theorem states that the mean of many independent random variables tends toward normal — which is why it appears everywhere in statistics.'},
  {q:'What is a Z-score?',a:'Z = (x − μ) / σ converts any normal value to the standard normal (μ=0, σ=1). A Z-score tells you how many standard deviations x is from the mean. Z=2 means x is 2σ above the mean. Z-scores allow comparison across different normal distributions with different scales and units.'},
  {q:'What is a percentile?',a:'The pth percentile is the value below which p% of the distribution falls. For a standard normal, the 95th percentile is Z ≈ 1.645. If SAT scores are N(μ=1000, σ=200), the 95th percentile = 1000 + 1.645×200 = 1329. Only 5% of test-takers score above this.'},
  {q:'Why does the normal distribution appear everywhere?',a:'The Central Limit Theorem (CLT) explains it: if you sum many independent random variables (regardless of their individual distributions), the sum approaches normal as n→∞. Sample means are always approximately normally distributed for large samples. This is why statistical inference based on the normal distribution is so broadly applicable.'},
]

const GLOSSARY=[
  {term:'Normal Distribution', def:'A symmetric bell-shaped probability distribution completely described by its mean (μ) and standard deviation (σ).'},
  {term:'Mean (μ)',            def:'The centre of the distribution — the value at which the bell curve peaks. Also the expected value E[X].'},
  {term:'Standard Deviation (σ)', def:'Measures spread. 68% of data falls within 1σ of the mean, 95% within 2σ, 99.7% within 3σ (the empirical rule).'},
  {term:'Z-score',             def:'Standardised value: Z = (x − μ)/σ. Tells you how many standard deviations x is from the mean.'},
  {term:'PDF',                 def:'Probability Density Function — gives the relative likelihood of a value. For normal: f(x) = e^(−½((x−μ)/σ)²) / (σ√2π).'},
  {term:'CDF',                 def:'Cumulative Distribution Function — P(X ≤ x). The area under the PDF curve to the left of x.'},
  {term:'Percentile',          def:'The value below which a given percentage of observations fall. The 90th percentile means 90% of values are below this point.'},
  {term:'Empirical Rule',      def:'68-95-99.7 rule: 68% of data within ±1σ, 95% within ±2σ, 99.7% within ±3σ of the mean.'},
]

// ── Bell curve SVG ───────────────────────────────────────────
const W=280, H=130

function BellCurve({mu,sigma,x,x1,x2,queryMode,catColor}){
  const S=Math.max(0.001,sigma)
  const pts=useMemo(()=>{
    const arr=[]; const lo=mu-4*S, hi=mu+4*S
    for(let i=0;i<=80;i++){const xi=lo+(i/80)*(hi-lo); arr.push({xi, y:normalPDF(xi,mu,S)})}
    return arr
  },[mu,S])

  const maxY=Math.max(...pts.map(p=>p.y),0.001)
  const toX=xv=>10+((xv-(mu-4*S))/(8*S))*(W-20)
  const toY=y=>H-15-(y/maxY)*(H-25)
  const zeroY=H-15

  const curveStr=pts.map(p=>`${toX(p.xi)},${Math.max(5,Math.min(H-5,toY(p.y)))}`).join(' ')

  const shadePts=useMemo(()=>{
    const lo=mu-4*S, hi=mu+4*S
    const lb=queryMode==='right'?x:(queryMode==='between'?x1:lo)
    const ub=queryMode==='between'?x2:x
    const arr=[`${toX(lb)},${zeroY}`]
    for(const p of pts){if(p.xi>=lb&&p.xi<=ub)arr.push(`${toX(p.xi)},${Math.max(5,toY(p.y))}`)}
    arr.push(`${toX(ub)},${zeroY}`)
    return arr.join(' ')
  },[mu,S,x,x1,x2,queryMode,pts])

  const qx=queryMode==='between'?null:x
  return(
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{display:'block',background:'var(--bg-raised)',borderRadius:8}}>
      <line x1={10} y1={zeroY} x2={W-10} y2={zeroY} stroke="var(--border)" strokeWidth="1"/>
      {shadePts&&<polygon points={shadePts} fill={catColor+'35'} stroke="none"/>}
      <polyline points={curveStr} fill="none" stroke={catColor} strokeWidth="2.5" strokeLinejoin="round"/>
      <line x1={toX(mu)} y1={20} x2={toX(mu)} y2={zeroY} stroke={catColor} strokeWidth="1.5" strokeDasharray="4,3"/>
      <text x={toX(mu)} y={16} textAnchor="middle" fontSize="8" fill={catColor} fontWeight="700">μ={mu}</text>
      {qx!==null&&<>
        <line x1={toX(qx)} y1={20} x2={toX(qx)} y2={zeroY} stroke="#ef4444" strokeWidth="1.5"/>
        <circle cx={toX(qx)} cy={toY(normalPDF(qx,mu,S))} r={4} fill="#ef4444"/>
      </>}
    </svg>
  )
}

// ── Main component ───────────────────────────────────────────
export default function NormalDistributionCalculator({meta,category}){
  const catColor=category?.color||'#3b82f6'
  const[mu,    setMu]    =useState(0)
  const[sigma, setSigma] =useState(1)
  const[x,     setX]     =useState(1)
  const[x1,    setX1]    =useState(-1)
  const[x2,    setX2]    =useState(1)
  const[pct,   setPct]   =useState(95)
  const[mode,  setMode]  =useState('point')
  const[openFaq,setOpenFaq]=useState(null)
  const calcRef=useState(null)

  const S=Math.max(0.001,sigma)
  const z=(x-mu)/S
  const pdf=normalPDF(x,mu,S)
  const cdfLeft=normalCDF(x,mu,S)
  const cdfRight=1-cdfLeft
  const pBetween=normalCDF(x2,mu,S)-normalCDF(x1,mu,S)
  const xAtPct=mu+inverseNormal(pct/100)*S
  const zAtPct=inverseNormal(pct/100)

  // Primary result per mode
  const primaryVal = mode==='point'    ? cdfLeft
                   : mode==='right'   ? cdfRight
                   : mode==='between' ? pBetween
                   :                    xAtPct
  const primaryLabel= mode==='point'    ? `P(X ≤ ${x})`
                    : mode==='right'   ? `P(X ≥ ${x})`
                    : mode==='between' ? `P(${x1} ≤ X ≤ ${x2})`
                    :                    `x at ${pct}th percentile`
  const primarySub  = mode==='percentile'
    ? `Z = ${fmt(zAtPct)} | P(X ≤ x) = ${fmtP2(pct/100)}`
    : `Z = ${fmt(z)} | PDF f(x) = ${fmt(pdf)}`

  return(
    <div style={{display:'flex',flexDirection:'column',gap:24}}>

      {/* Mode selector */}
      <div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,padding:'14px 18px'}}>
        <div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:12}}>Calculation Mode</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8}}>
          {MODES.map(m=>(
            <button key={m.key} onClick={()=>setMode(m.key)} style={{padding:'9px 6px',borderRadius:9,border:`1.5px solid ${mode===m.key?catColor:'var(--border)'}`,background:mode===m.key?catColor+'12':'var(--bg-raised)',cursor:'pointer',fontSize:11,fontWeight:mode===m.key?700:500,color:mode===m.key?catColor:'var(--text-2)',fontFamily:"'DM Sans',sans-serif",transition:'all .15s'}}>
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <CalcShell
        left={<>
          <div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:16,paddingBottom:8,borderBottom:'0.5px solid var(--border)'}}>Distribution Parameters</div>
          <FieldInput label="Mean (μ)" value={mu} onChange={setMu} catColor={catColor} step="0.1"/>
          <FieldInput label="Standard Deviation (σ)" hint=">0" value={sigma} onChange={v=>setSigma(Math.max(0.001,v))} catColor={catColor} step="0.1"/>

          <div style={{borderTop:'0.5px solid var(--border)',paddingTop:14,marginBottom:14}}>
            <div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:12}}>
              {mode==='point'?'Find P(X ≤ x)':mode==='right'?'Find P(X ≥ x)':mode==='between'?'Find P(x₁ ≤ X ≤ x₂)':'Find x at Percentile'}
            </div>
            {mode==='between'?(
              <>
                <FieldInput label="x₁ (lower bound)" value={x1} onChange={setX1} catColor={catColor} step="0.1"/>
                <FieldInput label="x₂ (upper bound)" value={x2} onChange={setX2} catColor={catColor} step="0.1"/>
              </>
            ):mode==='percentile'?(
              <FieldInput label="Percentile (%)" hint="0.001 – 99.999" value={pct} onChange={v=>setPct(Math.max(0.001,Math.min(99.999,v)))} catColor={catColor} step="0.1"/>
            ):(
              <FieldInput label={mode==='right'?'x (find P(X ≥ x))':'x (find P(X ≤ x))'} value={x} onChange={setX} catColor={catColor} step="0.1"/>
            )}
          </div>

          {/* Common distributions */}
          <div style={{padding:'12px 14px',borderRadius:10,background:'var(--bg-raised)',border:'0.5px solid var(--border)',marginBottom:14}}>
            <div style={{fontSize:11,fontWeight:700,color:'var(--text)',marginBottom:10,fontFamily:"'Space Grotesk',sans-serif"}}>Common Distributions</div>
            {COMMON_DISTS.map(d=>(
              <button key={d.label} onClick={()=>{setMu(d.mu);setSigma(d.sigma)}}
                style={{display:'block',width:'100%',padding:'7px 10px',borderRadius:8,border:`1.5px solid ${mu===d.mu&&sigma===d.sigma?catColor:'var(--border)'}`,background:mu===d.mu&&sigma===d.sigma?catColor+'12':'transparent',cursor:'pointer',textAlign:'left',marginBottom:5,fontSize:12,fontWeight:600,color:mu===d.mu&&sigma===d.sigma?catColor:'var(--text)',fontFamily:"'DM Sans',sans-serif"}}>
                {d.label} <span style={{fontFamily:"'Space Grotesk',sans-serif",color:'var(--text-3)',fontWeight:400,fontSize:11}}>{d.desc}</span>
              </button>
            ))}
          </div>

          <div style={{padding:'12px 14px',borderRadius:10,marginBottom:14,background:catColor+'0d',border:`1px solid ${catColor}25`}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
              <span style={{fontSize:11,color:'var(--text-2)',fontFamily:"'DM Sans',sans-serif"}}>{primaryLabel}</span>
              <span style={{fontSize:20,fontWeight:800,color:catColor,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
                {mode==='percentile'?fmt(primaryVal):fmtP2(primaryVal)}
              </span>
            </div>
            <div style={{display:'flex',justifyContent:'space-between'}}>
              <span style={{fontSize:10,color:'var(--text-3)'}}>N(μ={mu}, σ={S})</span>
              <span style={{fontSize:10,color:'var(--text-3)'}}>Z={fmt(mode==='percentile'?zAtPct:z)}</span>
            </div>
          </div>

          <div style={{display:'flex',gap:10}}>
            <button style={{flex:1,padding:13,borderRadius:10,border:'none',background:catColor,color:'#fff',fontSize:14,fontWeight:700,cursor:'pointer'}}
              onMouseEnter={e=>e.currentTarget.style.opacity='.85'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
              Calculate →
            </button>
            <button onClick={()=>{setMu(0);setSigma(1);setX(1);setX1(-1);setX2(1);setPct(95)}}
              style={{padding:'13px 18px',borderRadius:10,border:'1.5px solid var(--border-2)',background:'var(--bg-raised)',color:'var(--text-2)',fontSize:13,fontWeight:500,cursor:'pointer'}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor='#ef4444';e.currentTarget.style.color='#ef4444'}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border-2)';e.currentTarget.style.color='var(--text-2)'}}>
              Reset
            </button>
          </div>
        </>}

        right={<>
          <ResultHero
            label={primaryLabel}
            value={mode==='percentile'?primaryVal:primaryVal*100}
            formatter={n=>mode==='percentile'?fmt(n):(n/100<1&&n/100>-1?fmtP2(n/100):fmt(n)+'%')}
            sub={primarySub}
            color={catColor}
          />

          {/* Bell curve */}
          <div style={{background:'var(--bg-card)',border:`1.5px solid ${catColor}30`,borderRadius:14,padding:'14px 18px'}}>
            <div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:8}}>
              N(μ={mu}, σ={S}) — Shaded area = result
            </div>
            <BellCurve mu={mu} sigma={S} x={x} x1={x1} x2={x2} queryMode={mode} catColor={catColor}/>
          </div>

          {/* Results grid */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
            {mode==='point'&&[
              {l:`P(X ≤ ${x})`,  v:cdfLeft,  col:catColor,   isP:true},
              {l:`P(X > ${x})`,  v:cdfRight, col:'#ef4444',  isP:true},
              {l:'Z-score',       v:z,         col:'#10b981',  isP:false},
              {l:'PDF f(x)',      v:pdf,       col:'#8b5cf6',  isP:false},
            ].map(({l,v,col,isP})=>(
              <div key={l} style={{padding:'12px',borderRadius:10,background:col+'08',border:`1px solid ${col}20`,textAlign:'center'}}>
                <div style={{fontSize:10,color:'var(--text-3)',marginBottom:4,fontFamily:"'DM Sans',sans-serif"}}>{l}</div>
                <div style={{fontSize:17,fontWeight:700,color:col,fontFamily:"'Space Grotesk',sans-serif"}}>{isP?fmtP2(v):fmt(v)}</div>
              </div>
            ))}
            {mode==='right'&&[
              {l:`P(X ≥ ${x})`,  v:cdfRight, col:catColor,   isP:true},
              {l:`P(X < ${x})`,  v:cdfLeft,  col:'#ef4444',  isP:true},
              {l:'Z-score',       v:z,         col:'#10b981',  isP:false},
              {l:'PDF f(x)',      v:pdf,       col:'#8b5cf6',  isP:false},
            ].map(({l,v,col,isP})=>(
              <div key={l} style={{padding:'12px',borderRadius:10,background:col+'08',border:`1px solid ${col}20`,textAlign:'center'}}>
                <div style={{fontSize:10,color:'var(--text-3)',marginBottom:4,fontFamily:"'DM Sans',sans-serif"}}>{l}</div>
                <div style={{fontSize:17,fontWeight:700,color:col,fontFamily:"'Space Grotesk',sans-serif"}}>{isP?fmtP2(v):fmt(v)}</div>
              </div>
            ))}
            {mode==='between'&&[
              {l:`P(${x1}≤X≤${x2})`,        v:pBetween,                     col:catColor,  isP:true},
              {l:`P(X < ${x1})`,              v:normalCDF(x1,mu,S),          col:'#f59e0b', isP:true},
              {l:`P(X > ${x2})`,              v:1-normalCDF(x2,mu,S),        col:'#ef4444', isP:true},
              {l:'Z₁',                         v:(x1-mu)/S,                   col:'#10b981', isP:false},
            ].map(({l,v,col,isP})=>(
              <div key={l} style={{padding:'12px',borderRadius:10,background:col+'08',border:`1px solid ${col}20`,textAlign:'center'}}>
                <div style={{fontSize:10,color:'var(--text-3)',marginBottom:4,fontFamily:"'DM Sans',sans-serif"}}>{l}</div>
                <div style={{fontSize:17,fontWeight:700,color:col,fontFamily:"'Space Grotesk',sans-serif"}}>{isP?fmtP2(v):fmt(v)}</div>
              </div>
            ))}
            {mode==='percentile'&&[
              {l:`x at ${pct}th pct`,          v:xAtPct,      col:catColor,  isP:false},
              {l:'Z-score',                      v:zAtPct,      col:'#10b981', isP:false},
              {l:'P(X ≤ x)',                    v:pct/100,     col:catColor,  isP:true},
              {l:'P(X > x)',                    v:1-pct/100,   col:'#ef4444', isP:true},
            ].map(({l,v,col,isP})=>(
              <div key={l} style={{padding:'12px',borderRadius:10,background:col+'08',border:`1px solid ${col}20`,textAlign:'center'}}>
                <div style={{fontSize:10,color:'var(--text-3)',marginBottom:4,fontFamily:"'DM Sans',sans-serif"}}>{l}</div>
                <div style={{fontSize:17,fontWeight:700,color:col,fontFamily:"'Space Grotesk',sans-serif"}}>{isP?fmtP2(v):fmt(v)}</div>
              </div>
            ))}
          </div>

          <BreakdownTable title="Distribution Summary" rows={[
            {label:'Mean (μ)',              value:fmt(mu)},
            {label:'Std Deviation (σ)',     value:fmt(S)},
            {label:'Variance (σ²)',         value:fmt(S*S)},
            {label:'P(X within ±1σ)',      value:fmtP2(normalCDF(mu+S,mu,S)-normalCDF(mu-S,mu,S)), note:'68% rule'},
            {label:'P(X within ±2σ)',      value:fmtP2(normalCDF(mu+2*S,mu,S)-normalCDF(mu-2*S,mu,S)), note:'95% rule'},
            {label:'P(X within ±3σ)',      value:fmtP2(normalCDF(mu+3*S,mu,S)-normalCDF(mu-3*S,mu,S)), note:'99.7% rule'},
            {label:primaryLabel,            value:mode==='percentile'?fmt(primaryVal):fmtP2(primaryVal), bold:true, highlight:true, color:catColor},
          ]}/>

          <AIHintCard hint={
            mode==='point'    ? `N(${mu}, ${S}): P(X ≤ ${x}) = ${fmtP2(cdfLeft)}, P(X > ${x}) = ${fmtP2(cdfRight)}, Z = ${fmt(z)}.`
          : mode==='right'   ? `N(${mu}, ${S}): P(X ≥ ${x}) = ${fmtP2(cdfRight)}, P(X < ${x}) = ${fmtP2(cdfLeft)}, Z = ${fmt(z)}.`
          : mode==='between' ? `P(${x1} ≤ X ≤ ${x2}) = ${fmtP2(pBetween)}. This is ${(pBetween*100).toFixed(2)}% of the distribution.`
          :                    `The ${pct}th percentile of N(${mu}, ${S}) is x = ${fmt(xAtPct)} (Z = ${fmt(zAtPct)}).`
          } color={catColor}/>
        </>}
      />

      {/* Z-score reference table */}
      <Section title="Z-Score Reference Table" subtitle="Standard Normal N(μ=0, σ=1)">
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontFamily:"'DM Sans',sans-serif"}}>
            <thead><tr>{['Z','P(X≤Z)','P(X>Z)','Common Use'].map((h,i)=>(
              <th key={h} style={{padding:'9px 12px',fontSize:11,fontWeight:700,color:'var(--text-3)',textAlign:i===0?'left':'right',borderBottom:'1px solid var(--border)',fontFamily:"'Space Grotesk',sans-serif"}}>{h}</th>
            ))}</tr></thead>
            <tbody>
              {[-3,-2.576,-1.96,-1.645,-1,0,1,1.645,1.96,2.576,3].map((z2,i)=>{
                const p2=normalCDF(z2,0,1)
                const isCurrent=mode!=='between'&&mode!=='percentile'&&Math.abs(z2-z)<0.05
                const labels={0:'50th pct',[1.645]:'90th pct',[1.96]:'95th pct',[2.576]:'99th pct',[-1.645]:'10th pct',[-1.96]:'5th pct',[-2.576]:'1st pct',[3]:'99.87th pct',[-3]:'0.13th pct'}
                return(
                  <tr key={i} style={{background:isCurrent?catColor+'12':i%2===0?'var(--bg-raised)':'transparent'}}>
                    <td style={{padding:'7px 12px',fontSize:12,fontWeight:isCurrent?700:400,color:isCurrent?catColor:'var(--text)',fontFamily:"'Space Grotesk',sans-serif"}}>{z2}{isCurrent?' ◀':''}</td>
                    <td style={{padding:'7px 12px',fontSize:12,color:catColor,textAlign:'right'}}>{fmtP2(p2)}</td>
                    <td style={{padding:'7px 12px',fontSize:12,color:'#ef4444',textAlign:'right'}}>{fmtP2(1-p2)}</td>
                    <td style={{padding:'7px 12px',fontSize:11,color:'var(--text-3)',textAlign:'right'}}>{labels[z2]||''}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Section>

      {/* Real-world examples */}
      <Section title="Real-World Examples" subtitle="Normal distribution in practice">
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
          {[
            {icon:'🧠',title:'IQ Scores',       desc:'N(100, 15). P(IQ>130) = 2.28% — gifted threshold. P(IQ>145) = 0.13% — profoundly gifted.',color:catColor},
            {icon:'📏',title:'Human Heights',   desc:'Male heights approx N(175cm, 7cm). P(>190cm) ≈ 1.6%. P(<160cm) ≈ 1.6%. Extremes are genuinely rare.',color:'#10b981'},
            {icon:'📈',title:'Stock Returns',   desc:'Daily S&P 500 returns ≈ N(0.04%, 1%). A −3% day (Z≈−3) happens only 0.13% of trading days in theory.',color:'#f59e0b'},
            {icon:'🏭',title:'Manufacturing',   desc:'Six-sigma quality: P(defect) < 3.4 per million. Sigma level = how many std devs fit between mean and spec limit.',color:'#8b5cf6'},
          ].map((rw,i)=>(
            <div key={i} style={{padding:'12px 13px',borderRadius:11,background:rw.color+'08',border:`1px solid ${rw.color}25`}}>
              <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:6}}>
                <span style={{fontSize:18}}>{rw.icon}</span>
                <span style={{fontSize:12,fontWeight:700,color:rw.color,fontFamily:"'Space Grotesk',sans-serif"}}>{rw.title}</span>
              </div>
              <p style={{fontSize:11.5,color:'var(--text-2)',lineHeight:1.6,margin:0,fontFamily:"'DM Sans',sans-serif"}}>{rw.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Formula explained */}
      <Section title="Formula Explained">
        <div style={{background:'var(--bg-raised)',borderRadius:10,padding:'14px 16px',marginBottom:14,fontFamily:'monospace',fontSize:12,color:catColor,lineHeight:1.9}}>
          PDF:  f(x) = e^(−½((x−μ)/σ)²) / (σ√2π){'\n'}
          CDF:  P(X≤x) = Φ((x−μ)/σ)  [Φ = standard normal CDF]{'\n'}
          Z:    Z = (x−μ)/σ{'\n'}
          Percentile:  x = μ + Z_p × σ
        </div>
        <p style={{fontSize:12.5,color:'var(--text-2)',lineHeight:1.75,margin:0,fontFamily:"'DM Sans',sans-serif"}}>
          The PDF gives the relative likelihood (density) at any point — it is not a probability itself since P(X=x)=0 for continuous distributions. The CDF gives the cumulative probability P(X≤x) as the area under the PDF curve to the left of x. The Z-score standardises any normal to N(0,1), enabling use of the standard normal table.
        </p>
      </Section>

      {/* Key Terms */}
      <Section title="Key Terms">
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {GLOSSARY.map(g=><GlossaryTerm key={g.term} {...g} catColor={catColor}/>)}
        </div>
      </Section>

      {/* FAQ */}
      <Section title="FAQ">
        {FAQ.map((f,i)=><AccordionItem key={i} q={f.q} a={f.a} isOpen={openFaq===i} onToggle={()=>setOpenFaq(openFaq===i?null:i)} catColor={catColor}/>)}
      </Section>
    </div>
  )
}
