import { useState, useMemo } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'
const fmt=n=>(isNaN(n)||!isFinite(n))? '—':parseFloat(Number(n).toFixed(6)).toString()
const fmtP=n=>(isNaN(n)||!isFinite(n))? '—':(n*100).toFixed(4)+'%'
function Sec({title,sub,children,color}){return(<div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,overflow:'hidden'}}><div style={{padding:'13px 18px',borderBottom:'0.5px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center',background:color?color+'06':'transparent'}}><span style={{fontSize:13,fontWeight:700,color:'var(--text)',fontFamily:"'Space Grotesk',sans-serif"}}>{title}</span>{sub&&<span style={{fontSize:11,color:'var(--text-3)'}}>{sub}</span>}</div><div style={{padding:'16px 18px'}}>{children}</div></div>)}
function Acc({q,a,open,onToggle,color}){return(<div style={{borderBottom:'0.5px solid var(--border)'}}><button onClick={onToggle} style={{width:'100%',display:'flex',justifyContent:'space-between',alignItems:'center',padding:'13px 0',background:'none',border:'none',cursor:'pointer',gap:12,textAlign:'left'}}><span style={{fontSize:13,fontWeight:600,color:'var(--text)',fontFamily:"'DM Sans',sans-serif",lineHeight:1.4}}>{q}</span><span style={{fontSize:18,color,flexShrink:0,transform:open?'rotate(45deg)':'none',transition:'transform .2s'}}>+</span></button>{open&&<p style={{fontSize:12.5,color:'var(--text-2)',lineHeight:1.75,margin:'0 0 13px'}}>{a}</p>}</div>)}
function Inp({label,value,onChange,color,hint,step='any'}){const[f,sf]=useState(false);return(<div style={{marginBottom:14}}><div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}><label style={{fontSize:12.5,fontWeight:600,color:'var(--text)',fontFamily:"'DM Sans',sans-serif"}}>{label}</label>{hint&&<span style={{fontSize:10,color:'var(--text-3)'}}>{hint}</span>}</div><div style={{display:'flex',height:44,border:`1.5px solid ${f?color:'var(--border-2)'}`,borderRadius:9,overflow:'hidden',background:'var(--bg-card)',boxShadow:f?`0 0 0 3px ${color}18`:'none'}}><input type="number" step={step} value={value} onChange={e=>onChange(Number(e.target.value))} onFocus={()=>sf(true)} onBlur={()=>sf(false)} style={{flex:1,border:'none',background:'transparent',padding:'0 14px',fontSize:17,fontWeight:700,color:'var(--text)',outline:'none',fontFamily:"'Space Grotesk',sans-serif"}}/></div></div>)}
function erf(x){const t=1/(1+0.3275911*Math.abs(x));const y=1-t*(0.254829592+t*(-0.284496736+t*(1.421413741+t*(-1.453152027+t*1.061405429))))*Math.exp(-x*x);return x>=0?y:-y}
function normalCDF(z){return 0.5*(1+erf(z/Math.sqrt(2)))}
function normalPDF(z){return Math.exp(-z*z/2)/Math.sqrt(2*Math.PI)}
const SCENARIOS=[
  {label:'Test score',x:85,mu:75,sigma:10,desc:'Score=85, avg=75, SD=10'},
  {label:'Height',x:180,mu:170,sigma:7,desc:'180cm, avg=170, SD=7'},
  {label:'IQ score',x:130,mu:100,sigma:15,desc:'IQ=130, avg=100, SD=15'},
  {label:'Stock return',x:-2,mu:0.5,sigma:1.2,desc:'Return=−2%, avg=0.5%'},
]
const Z_TABLE=[{z:-3.0,p:0.0013},{z:-2.58,p:0.0049},{z:-2.0,p:0.0228},{z:-1.96,p:0.0250},{z:-1.645,p:0.0500},{z:-1.0,p:0.1587},{z:-0.5,p:0.3085},{z:0,p:0.5000},{z:0.5,p:0.6915},{z:1.0,p:0.8413},{z:1.645,p:0.9500},{z:1.96,p:0.9750},{z:2.0,p:0.9772},{z:2.58,p:0.9951},{z:3.0,p:0.9987}]
const FAQ=[
  {q:'What is a Z-score?',a:'A Z-score (standard score) measures how many standard deviations a value is from the mean. Z = (x − μ) / σ. Positive Z means above average; negative means below. Z = 2 means the value is 2σ above the mean — rarer than 97.7% of observations.'},
  {q:'How do I interpret a Z-score?',a:'|Z| < 1: very common (68% of data). |Z| 1–2: somewhat unusual. |Z| 2–3: unusual (2–5% of data). |Z| > 3: very rare (< 0.3% of data). In quality control, values beyond 3σ are flagged as anomalies.'},
  {q:'What is the percentile from a Z-score?',a:'Percentile = normalCDF(z) × 100. Z=0 → 50th. Z=1 → 84.1st. Z=1.96 → 97.5th. Z=−1.645 → 5th. Lets you rank any value in its distribution.'},
  {q:'What is standardisation?',a:'Standardisation transforms data to mean=0, SD=1 using Z-scores. This allows comparison across different scales — IQ (mean=100, SD=15) vs height (mean=170cm, SD=7cm) — after standardising, Z-scores are directly comparable.'},
]
export default function ZScoreCalculator({meta,category}){
  const C=category?.color||'#6366f1'
  const[x,setX]=useState(85)
  const[mu,setMu]=useState(75)
  const[sigma,setSigma]=useState(10)
  const[openFaq,setFaq]=useState(null)
  const[openGloss,setGl]=useState(null)
  const[active,setActive]=useState(0)
  const[rawInput,setRawInput]=useState('72, 85, 91, 68, 79, 85, 92, 88, 74, 85')
  const S=Math.max(0.001,sigma)
  const z=(x-mu)/S
  const pBelow=normalCDF(z),pAbove=1-pBelow,pdf=normalPDF(z),pct=pBelow*100
  const nums=useMemo(()=>rawInput.split(/[\s,;]+/).map(Number).filter(v=>!isNaN(v)),[rawInput])
  const dMean=nums.length?nums.reduce((a,b)=>a+b)/nums.length:0
  const dStd=nums.length>1?Math.sqrt(nums.reduce((a,b)=>a+(b-dMean)**2,0)/nums.length):1
  const dZs=nums.map(v=>({v,z:(v-dMean)/dStd}))
  const W=280,H=130,zMin=-4,zMax=4
  const toSx=zv=>((zv-zMin)/(zMax-zMin))*(W-20)+10
  const toSy=p=>H-15-(p/normalPDF(0))*(H-30)
  const curvePts=Array.from({length:81},(_,i)=>{const zv=zMin+(i/80)*(zMax-zMin);return`${toSx(zv)},${Math.max(5,Math.min(H-5,toSy(normalPDF(zv))))}`}).join(' ')
  const zC=Math.max(zMin+0.1,Math.min(zMax-0.1,z))
  const shadePts=()=>{const pts=[`${toSx(zMin)},${H-15}`];for(let i=0;i<=80;i++){const zv=zMin+(i/80)*(zMax-zMin);if(zv<=zC)pts.push(`${toSx(zv)},${Math.max(5,Math.min(H-5,toSy(normalPDF(zv))))}`)}pts.push(`${toSx(zC)},${H-15}`);return pts.join(' ')}
  const zCol=Math.abs(z)>=3?'#ef4444':Math.abs(z)>=2?'#f59e0b':Math.abs(z)>=1?C:'#10b981'
  return(<div style={{display:'flex',flexDirection:'column',gap:20}}>
    <div style={{background:`linear-gradient(135deg,${C}12,${C}06)`,border:`1px solid ${C}30`,borderRadius:14,padding:'16px 20px',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12}}>
      <div>
        <div style={{fontSize:10,fontWeight:700,color:C,textTransform:'uppercase',letterSpacing:'.08em',marginBottom:6}}>Z-Score Calculator</div>
        <div style={{fontSize:22,fontWeight:700,color:C,fontFamily:"'Space Grotesk',sans-serif"}}>Z = (x − μ) / σ</div>
        <div style={{fontSize:11,color:'var(--text-3)',marginTop:4}}>Standard deviations from the mean · percentile ranking</div>
      </div>
      <div style={{padding:'10px 20px',background:zCol+'20',borderRadius:12,textAlign:'center',border:`1.5px solid ${zCol}40`}}>
        <div style={{fontSize:11,color:'var(--text-3)',marginBottom:2}}>Z-score</div>
        <div style={{fontSize:42,fontWeight:700,color:zCol,fontFamily:"'Space Grotesk',sans-serif",lineHeight:1}}>{fmt(z)}</div>
        <div style={{fontSize:11,color:zCol,fontWeight:600,marginTop:2}}>{Math.abs(z)>=3?'🔴 Very rare':Math.abs(z)>=2?'🟡 Unusual':Math.abs(z)>=1?'🔵 Moderate':'🟢 Common'}</div>
      </div>
    </div>
    <div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,padding:'14px 18px'}}>
      <div style={{fontSize:12,fontWeight:600,color:'var(--text-2)',marginBottom:12}}>📌 Real-world scenarios</div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8}}>
        {SCENARIOS.map((sc,i)=>(<button key={i} onClick={()=>{setX(sc.x);setMu(sc.mu);setSigma(sc.sigma);setActive(i)}} style={{padding:'10px 8px',borderRadius:10,border:`1.5px solid ${active===i?C:'var(--border-2)'}`,background:active===i?C+'12':'var(--bg-raised)',cursor:'pointer',textAlign:'center'}}><div style={{fontSize:11,fontWeight:700,color:C}}>{sc.label}</div><div style={{fontSize:9,color:'var(--text-3)',marginTop:2,lineHeight:1.3}}>{sc.desc}</div></button>))}
      </div>
    </div>
    <CalcShell
      left={<>
        <div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:16,paddingBottom:8,borderBottom:'0.5px solid var(--border)'}}>Parameters</div>
        <Inp label="Value (x)" value={x} onChange={setX} color={C} step="0.1" hint="the observation"/>
        <Inp label="Mean (μ)" value={mu} onChange={setMu} color={C} step="0.1" hint="population mean"/>
        <Inp label="Std deviation (σ)" value={sigma} onChange={v=>setSigma(Math.max(0.001,v))} color={C} step="0.1" hint="> 0"/>
        <div style={{padding:'12px 14px',background:zCol+'10',borderRadius:10,border:`1px solid ${zCol}30`,marginBottom:14}}>
          <div style={{fontSize:11,color:'var(--text-3)',marginBottom:4}}>Formula</div>
          <div style={{fontSize:15,fontWeight:700,color:zCol,fontFamily:"'Space Grotesk',sans-serif"}}>Z = ({x} − {mu}) / {S} = {fmt(z)}</div>
        </div>
        <div style={{padding:'12px 14px',background:'var(--bg-raised)',borderRadius:10,border:'0.5px solid var(--border)',marginBottom:14}}>
          <div style={{fontSize:11,fontWeight:700,color:'var(--text)',marginBottom:8}}>Interpretation guide</div>
          {[['|Z| < 1','Common — 68% of data','#10b981'],['|Z| 1–2','Moderate — 95% of data',C],['|Z| 2–3','Unusual — 99.7%','#f59e0b'],['|Z| > 3','Very rare — beyond 3σ','#ef4444']].map(([range,desc,col])=>(<div key={range} style={{display:'flex',gap:8,alignItems:'center',padding:'3px 0',borderBottom:'0.5px solid var(--border)'}}><span style={{fontSize:11,fontWeight:700,color:col,minWidth:56,fontFamily:"'Space Grotesk',sans-serif"}}>{range}</span><span style={{fontSize:11,color:'var(--text-2)'}}>{desc}</span></div>))}
        </div>
        <div style={{display:'flex',gap:10}}>
          <button style={{flex:1,padding:13,borderRadius:10,border:'none',background:C,color:'#fff',fontSize:14,fontWeight:700,cursor:'pointer'}}>Calculate →</button>
          <button onClick={()=>{setX(85);setMu(75);setSigma(10)}} style={{padding:'13px 18px',borderRadius:10,border:'1.5px solid var(--border-2)',background:'var(--bg-raised)',color:'var(--text-2)',fontSize:13,fontWeight:500,cursor:'pointer'}}>Reset</button>
        </div>
      </>}
      right={<>
        <div style={{background:'var(--bg-card)',border:`1.5px solid ${zCol}30`,borderRadius:14,padding:'14px 18px',marginBottom:14}}>
          <div style={{fontSize:12,fontWeight:700,color:'var(--text)',marginBottom:8}}>Standard Normal — Z = {fmt(z)}</div>
          <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{display:'block',background:'var(--bg-raised)',borderRadius:8}}>
            <line x1={10} y1={H-15} x2={W-10} y2={H-15} stroke="var(--border)" strokeWidth="1"/>
            <polygon points={shadePts()} fill={zCol+'30'}/>
            <polyline points={curvePts} fill="none" stroke={C} strokeWidth="2.5" strokeLinejoin="round"/>
            <line x1={toSx(zC)} y1={10} x2={toSx(zC)} y2={H-15} stroke={zCol} strokeWidth="2"/>
            <circle cx={toSx(zC)} cy={Math.max(10,Math.min(H-20,toSy(normalPDF(zC))))} r={5} fill={zCol} stroke="#fff" strokeWidth="2"/>
            {[-3,-2,-1,0,1,2,3].map(zv=>(<text key={zv} x={toSx(zv)} y={H-4} textAnchor="middle" fontSize="7" fill="var(--text-3)">{zv}σ</text>))}
            <text x={toSx(zC)} y={8} textAnchor="middle" fontSize="8" fill={zCol} fontWeight="700">Z={fmt(z)}</text>
          </svg>
          <div style={{display:'flex',justifyContent:'space-between',marginTop:8}}>
            <div style={{fontSize:10,color:'var(--text-3)'}}>Shaded = P(X≤{x}) = {fmtP(pBelow)}</div>
            <div style={{fontSize:10,color:zCol,fontWeight:700}}>{pct.toFixed(2)}th percentile</div>
          </div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:10,marginBottom:14}}>
          {[['Z-score',fmt(z),zCol,'SD from mean'],['Percentile',`${pct.toFixed(2)}th`,C,'rank'],['P(X≤x)',fmtP(pBelow),'#10b981','below'],['P(X>x)',fmtP(pAbove),'#ef4444','above']].map(([l,v,col,sub])=>(<div key={l} style={{padding:'12px',borderRadius:10,background:col+'10',border:`1px solid ${col}20`,textAlign:'center'}}><div style={{fontSize:9,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',marginBottom:3}}>{l}</div><div style={{fontSize:20,fontWeight:700,color:col,fontFamily:"'Space Grotesk',sans-serif"}}>{v}</div><div style={{fontSize:9,color:'var(--text-3)',marginTop:2}}>{sub}</div></div>))}
        </div>
        <BreakdownTable title="Full results" rows={[
          {label:'Value x',value:fmt(x),highlight:true},
          {label:'Mean μ',value:fmt(mu)},
          {label:'Std dev σ',value:fmt(S)},
          {label:'Z-score',value:fmt(z),bold:true,color:zCol,highlight:true},
          {label:'Percentile',value:`${pct.toFixed(4)}th`,color:C},
          {label:'P(X≤x)',value:fmtP(pBelow),color:'#10b981'},
          {label:'P(X>x)',value:fmtP(pAbove),color:'#ef4444'},
        ]}/>
        <AIHintCard hint={`Z=(${x}−${mu})/${S}=${fmt(z)} → ${pct.toFixed(2)}th percentile. ${Math.abs(z)>=3?'⚠️ Extremely rare (beyond 3σ).':Math.abs(z)>=2?'⚠️ Unusual (beyond 2σ).':'✓ Within normal range.'} P(X≤${x})=${fmtP(pBelow)}.`} color={C}/>
      </>}
    />
    {/* Z number line */}
    <Sec title="📏 Interactive Z-Score Number Line" sub="Your value on the distribution" color={C}>
      <div style={{position:'relative',height:70,marginBottom:12}}>
        <div style={{position:'absolute',top:'40%',left:'5%',right:'5%',height:6,background:'linear-gradient(90deg,#ef4444,#f59e0b,#10b981,#f59e0b,#ef4444)',borderRadius:3,transform:'translateY(-50%)'}}/>
        {[-3,-2,-1,0,1,2,3].map(zv=>{const pct2=5+((zv+3)/6)*90;return(<div key={zv} style={{position:'absolute',left:`${pct2}%`,top:'25%',transform:'translateX(-50%)',textAlign:'center'}}><div style={{width:2,height:16,background:'var(--bg-card)',margin:'0 auto'}}/><div style={{fontSize:9,color:'var(--text-3)',marginTop:3}}>{zv}σ</div></div>)})}
        {(()=>{const pct2=Math.max(5,Math.min(95,5+((z+3)/6)*90));return(<div style={{position:'absolute',left:`${pct2}%`,top:'0%',transform:'translateX(-50%)',transition:'left .4s',zIndex:10}}>
          <div style={{background:zCol,color:'#fff',padding:'3px 8px',borderRadius:6,fontSize:10,fontWeight:700,whiteSpace:'nowrap',marginBottom:4,boxShadow:'0 2px 8px rgba(0,0,0,.2)'}}>Z={fmt(z)}</div>
          <div style={{width:0,height:0,borderLeft:'6px solid transparent',borderRight:'6px solid transparent',borderTop:`8px solid ${zCol}`,margin:'0 auto'}}/>
        </div>)})()}
      </div>
      <div style={{display:'flex',gap:10,justifyContent:'center',flexWrap:'wrap',fontSize:10}}>
        {[['🟢 |Z|<1 · 68%','#10b981'],['🟡 1<|Z|<2 · 27%','#f59e0b'],['🔴 |Z|>2 · 5%','#ef4444']].map(([l,c])=>(<span key={l} style={{color:c,fontWeight:600}}>{l}</span>))}
      </div>
    </Sec>
    {/* Batch Z-scores */}
    <Sec title="📊 Batch Z-Score — Standardise your entire dataset" sub="Auto-computes μ and σ" color={C}>
      <div style={{marginBottom:14}}>
        <label style={{fontSize:12.5,fontWeight:600,color:'var(--text)',display:'block',marginBottom:6}}>Dataset (comma separated)</label>
        <textarea value={rawInput} onChange={e=>setRawInput(e.target.value)} rows={2} style={{width:'100%',border:`1.5px solid ${C}40`,borderRadius:9,padding:'10px 14px',fontSize:13,fontWeight:600,color:'var(--text)',background:'var(--bg-card)',outline:'none',resize:'none',fontFamily:"'DM Sans',sans-serif",boxSizing:'border-box'}}/>
      </div>
      <div style={{display:'flex',gap:10,marginBottom:14}}>
        {[['μ',dMean],['σ',dStd],['n',nums.length]].map(([l,v])=>(<div key={l} style={{flex:1,padding:'8px',background:C+'08',borderRadius:8,border:`1px solid ${C}20`,textAlign:'center'}}><div style={{fontSize:10,color:'var(--text-3)'}}>{l}</div><div style={{fontSize:14,fontWeight:700,color:C,fontFamily:"'Space Grotesk',sans-serif"}}>{typeof v==='number'?fmt(v):v}</div></div>))}
      </div>
      <div style={{overflowX:'auto'}}>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead><tr>{['Value','Z-score','Percentile','Status','Bar'].map(h=>(<th key={h} style={{padding:'8px 10px',fontSize:11,fontWeight:700,color:'var(--text-3)',textAlign:'right',borderBottom:'1px solid var(--border)',background:'var(--bg-raised)'}}>{h}</th>))}</tr></thead>
          <tbody>{dZs.map((item,i)=>{
            const col=Math.abs(item.z)>=3?'#ef4444':Math.abs(item.z)>=2?'#f59e0b':Math.abs(item.z)>=1?C:'#10b981'
            const p2=normalCDF(item.z)*100
            const label=Math.abs(item.z)>=3?'🔴 Rare':Math.abs(item.z)>=2?'🟡 Unusual':Math.abs(item.z)>=1?'🔵 Moderate':'🟢 Common'
            const barPct=Math.max(0,Math.min(100,((item.z+4)/8)*100))
            return(<tr key={i} style={{background:i%2===0?'transparent':'var(--bg-raised)'}}>
              <td style={{padding:'6px 10px',fontSize:12,fontWeight:700,color:'var(--text)',textAlign:'right',fontFamily:"'Space Grotesk',sans-serif"}}>{item.v}</td>
              <td style={{padding:'6px 10px',fontSize:12,fontWeight:700,color:col,textAlign:'right',fontFamily:"'Space Grotesk',sans-serif"}}>{fmt(item.z)}</td>
              <td style={{padding:'6px 10px',fontSize:11,color:'var(--text-2)',textAlign:'right'}}>{p2.toFixed(1)}th</td>
              <td style={{padding:'6px 10px',fontSize:10,color:col,textAlign:'right'}}>{label}</td>
              <td style={{padding:'6px 10px'}}><div style={{position:'relative',height:8,background:'var(--bg-raised)',borderRadius:4,overflow:'hidden',minWidth:60}}>
                <div style={{position:'absolute',left:'50%',top:0,bottom:0,width:1,background:'var(--border)'}}/>
                <div style={{position:'absolute',left:item.z>=0?'50%':`${barPct}%`,width:item.z>=0?`${Math.min((item.z/4)*50,50)}%`:`${50-barPct}%`,top:0,bottom:0,background:col}}/>
              </div></td>
            </tr>)
          })}</tbody>
        </table>
      </div>
    </Sec>
    {/* Z-Table */}
    <Sec title="📋 Z-Table Reference" sub="Standard normal cumulative probabilities" color={C}>
      <div style={{overflowX:'auto'}}>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead><tr>{['Z','P(Z≤z)','P(Z>z)','Percentile','Common use'].map(h=>(<th key={h} style={{padding:'8px 10px',fontSize:11,fontWeight:700,color:'var(--text-3)',textAlign:'right',borderBottom:'1px solid var(--border)',background:'var(--bg-raised)'}}>{h}</th>))}</tr></thead>
          <tbody>{Z_TABLE.map((row,i)=>{
            const isCurr=Math.abs(row.z-z)<0.3
            const col=Math.abs(row.z)>=3?'#ef4444':Math.abs(row.z)>=2?'#f59e0b':Math.abs(row.z)>=1?C:'#10b981'
            const use=row.z===1.96?'95% CI':row.z===-1.96?'2.5th pct':row.z===1.645?'90% CI':row.z===-1.645?'5th pct':row.z===2.58?'99% CI':row.z===0?'Median':'';
            return(<tr key={i} style={{background:isCurr?C+'10':i%2===0?'transparent':'var(--bg-raised)'}}>
              <td style={{padding:'7px 10px',fontSize:12,fontWeight:700,color:col,textAlign:'right',fontFamily:"'Space Grotesk',sans-serif"}}>{row.z}{isCurr?' ◀':''}</td>
              <td style={{padding:'7px 10px',fontSize:12,color:'var(--text)',textAlign:'right',fontFamily:"'Space Grotesk',sans-serif"}}>{(row.p*100).toFixed(4)}%</td>
              <td style={{padding:'7px 10px',fontSize:12,color:'#ef4444',textAlign:'right',fontFamily:"'Space Grotesk',sans-serif"}}>{((1-row.p)*100).toFixed(4)}%</td>
              <td style={{padding:'7px 10px',fontSize:11,color:'var(--text-2)',textAlign:'right'}}>{(row.p*100).toFixed(2)}th</td>
              <td style={{padding:'7px 10px',fontSize:10,color:'var(--text-3)',textAlign:'right'}}>{use}</td>
            </tr>)
          })}</tbody>
        </table>
      </div>
    </Sec>
    <Sec title="🌍 Z-scores in the real world" color={C}>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
        {[{icon:'🏥',title:'Pediatric growth charts',desc:'Children\'s Z-scores vs age norms. Z<−2 = underweight concern. Z>2 = overweight. Used daily in pediatrics.',color:C},{icon:'📈',title:'Finance — Value at Risk',desc:'VaR uses Z: Z=1.645 → 5% loss probability. Z=2.33 → 1%. Core to bank risk management.',color:'#10b981'},{icon:'🏭',title:'Six Sigma quality',desc:'6σ = Z=6 → 3.4 defects per million. Z-score directly measures process quality level.',color:'#f59e0b'},{icon:'🎓',title:'Standardised tests',desc:'SAT, IQ, GRE all use Z-based scaling. Perfect SAT ≈ Z=3.5 — rarer than 99.97% of takers.',color:'#8b5cf6'}].map((rw,i)=>(<div key={i} style={{padding:'12px 13px',borderRadius:11,background:rw.color+'08',border:`1px solid ${rw.color}25`}}><div style={{display:'flex',gap:8,alignItems:'center',marginBottom:6}}><span style={{fontSize:18}}>{rw.icon}</span><span style={{fontSize:12,fontWeight:700,color:rw.color}}>{rw.title}</span></div><p style={{fontSize:11.5,color:'var(--text-2)',lineHeight:1.6,margin:0}}>{rw.desc}</p></div>))}
      </div>
    </Sec>
    <Sec title="Frequently asked questions" color={C}>{FAQ.map((f,i)=><Acc key={i} q={f.q} a={f.a} open={openFaq===i} onToggle={()=>setFaq(openFaq===i?null:i)} color={C}/>)}</Sec>
  </div>)
}
