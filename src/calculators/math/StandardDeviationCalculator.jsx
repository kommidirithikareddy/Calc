import { useState, useMemo } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'
const fmt = n => (isNaN(n)||!isFinite(n))? '—':parseFloat(Number(n).toFixed(6)).toString()
function Sec({title,sub,children,color}){return(<div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,overflow:'hidden'}}><div style={{padding:'13px 18px',borderBottom:'0.5px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center',background:color?color+'06':'transparent'}}><span style={{fontSize:13,fontWeight:700,color:'var(--text)',fontFamily:"'Space Grotesk',sans-serif"}}>{title}</span>{sub&&<span style={{fontSize:11,color:'var(--text-3)'}}>{sub}</span>}</div><div style={{padding:'16px 18px'}}>{children}</div></div>)}
function Acc({q,a,open,onToggle,color}){return(<div style={{borderBottom:'0.5px solid var(--border)'}}><button onClick={onToggle} style={{width:'100%',display:'flex',justifyContent:'space-between',alignItems:'center',padding:'13px 0',background:'none',border:'none',cursor:'pointer',gap:12,textAlign:'left'}}><span style={{fontSize:13,fontWeight:600,color:'var(--text)',fontFamily:"'DM Sans',sans-serif",lineHeight:1.4}}>{q}</span><span style={{fontSize:18,color,flexShrink:0,transform:open?'rotate(45deg)':'none',transition:'transform .2s'}}>+</span></button>{open&&<p style={{fontSize:12.5,color:'var(--text-2)',lineHeight:1.75,margin:'0 0 13px',fontFamily:"'DM Sans',sans-serif"}}>{a}</p>}</div>)}
const FAQ=[
  {q:'What is standard deviation?',a:'Standard deviation measures the average distance of each data point from the mean. A small σ means data clusters tightly around the mean. A large σ means data is spread out. Formally: σ = √(Σ(xᵢ−μ)²/n) for a population, s = √(Σ(xᵢ−x̄)²/(n−1)) for a sample.'},
  {q:'Population vs sample standard deviation — which to use?',a:'Use population (σ, divide by n) when you have the ENTIRE group. Use sample (s, divide by n−1) when you have a subset and want to estimate the population. Sample uses n−1 (Bessel\'s correction) because using n underestimates the true population variance. Most statistics textbooks default to sample std dev.'},
  {q:'What is the empirical rule (68-95-99.7)?',a:'For a normal distribution: 68% of data falls within ±1σ of the mean, 95% within ±2σ, 99.7% within ±3σ. This is called the empirical rule or "three-sigma rule." It lets you immediately assess how common or rare a value is if you know μ and σ.'},
  {q:'What does a high CV mean?',a:'Coefficient of Variation (CV) = σ/μ × 100%. CV > 30% = high variability; CV < 15% = low variability. Useful for comparing spread between datasets with different units or scales — e.g., comparing height variability (σ≈10cm, μ=170cm, CV≈6%) to salary variability (σ≈$20k, μ=60k, CV≈33%).'},
]
export default function StandardDeviationCalculator({meta,category}){
  const C=category?.color||'#6366f1'
  const[rawInput,setRawInput]=useState('4, 7, 13, 2, 8, 11, 15, 6, 9, 3')
  const[type,setType]=useState('both')
  const[openFaq,setFaq]=useState(null)
  const nums=useMemo(()=>rawInput.split(/[\s,;]+/).map(Number).filter(v=>!isNaN(v)&&v.toString()!==''),[rawInput])
  const stats=useMemo(()=>{
    if(nums.length<2)return null
    const n=nums.length
    const mean=nums.reduce((a,b)=>a+b,0)/n
    const deviations=nums.map(v=>v-mean)
    const squaredDev=deviations.map(d=>d*d)
    const popVar=squaredDev.reduce((a,b)=>a+b,0)/n
    const sampleVar=squaredDev.reduce((a,b)=>a+b,0)/(n-1)
    const popStd=Math.sqrt(popVar)
    const sampleStd=Math.sqrt(sampleVar)
    const sem=sampleStd/Math.sqrt(n)
    const cv=(popStd/Math.abs(mean))*100
    return{n,mean,deviations,squaredDev,popVar,sampleVar,popStd,sampleStd,sem,cv,sum:nums.reduce((a,b)=>a+b,0),sumSqDev:squaredDev.reduce((a,b)=>a+b,0)}
  },[nums])
  const DATASETS=[
    {label:'Low variance',data:'8, 9, 10, 11, 12, 9, 10, 11, 10, 9'},
    {label:'High variance',data:'2, 45, 8, 99, 15, 70, 3, 88, 22, 55'},
    {label:'Normal-ish',data:'4, 7, 13, 2, 8, 11, 15, 6, 9, 3'},
  ]
  const W=280,H=100
  return(<div style={{display:'flex',flexDirection:'column',gap:20}}>
    <div style={{background:`linear-gradient(135deg,${C}12,${C}06)`,border:`1px solid ${C}30`,borderRadius:14,padding:'16px 20px',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12}}>
      <div>
        <div style={{fontSize:10,fontWeight:700,color:C,textTransform:'uppercase',letterSpacing:'.08em',marginBottom:6}}>Standard Deviation Calculator</div>
        <div style={{fontSize:20,fontWeight:700,color:C,fontFamily:"'Space Grotesk',sans-serif"}}>σ = √(Σ(xᵢ−μ)² / n)</div>
        <div style={{fontSize:11,color:'var(--text-3)',marginTop:4}}>Measures spread around the mean</div>
      </div>
      {stats&&(<div style={{display:'flex',gap:10}}>
        <div style={{padding:'10px 16px',background:C+'18',borderRadius:12,textAlign:'center'}}>
          <div style={{fontSize:10,color:'var(--text-3)',marginBottom:2}}>Population σ</div>
          <div style={{fontSize:26,fontWeight:700,color:C,fontFamily:"'Space Grotesk',sans-serif"}}>{fmt(stats.popStd)}</div>
        </div>
        <div style={{padding:'10px 16px',background:'#10b98118',borderRadius:12,textAlign:'center'}}>
          <div style={{fontSize:10,color:'var(--text-3)',marginBottom:2}}>Sample s</div>
          <div style={{fontSize:26,fontWeight:700,color:'#10b981',fontFamily:"'Space Grotesk',sans-serif"}}>{fmt(stats.sampleStd)}</div>
        </div>
      </div>)}
    </div>
    <div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,padding:'14px 18px'}}>
      <div style={{fontSize:12,fontWeight:600,color:'var(--text-2)',marginBottom:12}}>Sample datasets</div>
      <div style={{display:'flex',gap:8}}>
        {DATASETS.map((ds,i)=>(<button key={i} onClick={()=>setRawInput(ds.data)} style={{flex:1,padding:'10px',borderRadius:10,border:`1.5px solid ${rawInput===ds.data?C:'var(--border-2)'}`,background:rawInput===ds.data?C+'12':'var(--bg-raised)',cursor:'pointer',textAlign:'center'}}><div style={{fontSize:11,fontWeight:700,color:C}}>{ds.label}</div></button>))}
      </div>
    </div>
    <CalcShell
      left={<>
        <div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:14,paddingBottom:8,borderBottom:'0.5px solid var(--border)'}}>Enter Data</div>
        <div style={{marginBottom:14}}>
          <label style={{fontSize:12.5,fontWeight:600,color:'var(--text)',display:'block',marginBottom:6}}>Data values</label>
          <textarea value={rawInput} onChange={e=>setRawInput(e.target.value)} rows={4} style={{width:'100%',border:`1.5px solid ${C}40`,borderRadius:9,padding:'10px 14px',fontSize:13,fontWeight:600,color:'var(--text)',background:'var(--bg-card)',outline:'none',resize:'vertical',fontFamily:"'DM Sans',sans-serif",boxSizing:'border-box'}} placeholder="e.g. 4, 7, 13, 2, 8..."/>
        </div>
        {stats&&(<>
          <div style={{padding:'12px 14px',background:C+'08',borderRadius:10,border:`1px solid ${C}20`,marginBottom:14}}>
            <div style={{fontSize:11,fontWeight:700,color:'var(--text)',marginBottom:8}}>Empirical Rule (68-95-99.7)</div>
            {[['±1σ','68.27%',C,stats.mean-stats.popStd,stats.mean+stats.popStd],['±2σ','95.45%','#10b981',stats.mean-2*stats.popStd,stats.mean+2*stats.popStd],['±3σ','99.73%','#f59e0b',stats.mean-3*stats.popStd,stats.mean+3*stats.popStd]].map(([label,pct,col,lo,hi])=>(
              <div key={label} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'4px 0',borderBottom:'0.5px solid var(--border)'}}>
                <span style={{fontSize:11,fontWeight:700,color:col}}>{label}</span>
                <span style={{fontSize:10,color:'var(--text-3)',fontFamily:"'Space Grotesk',sans-serif"}}>{fmt(lo)} to {fmt(hi)}</span>
                <span style={{fontSize:11,fontWeight:700,color:col}}>{pct}</span>
              </div>
            ))}
          </div>
        </>)}
        <div style={{display:'flex',gap:10}}>
          <button style={{flex:1,padding:13,borderRadius:10,border:'none',background:C,color:'#fff',fontSize:14,fontWeight:700,cursor:'pointer'}}>Calculate →</button>
          <button onClick={()=>setRawInput('4, 7, 13, 2, 8, 11, 15, 6, 9, 3')} style={{padding:'13px 18px',borderRadius:10,border:'1.5px solid var(--border-2)',background:'var(--bg-raised)',color:'var(--text-2)',fontSize:13,fontWeight:500,cursor:'pointer'}}>Reset</button>
        </div>
      </>}
      right={<>
        {stats?(<>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:14}}>
            {[['Population σ',stats.popStd,C,'divide by n'],['Sample s',stats.sampleStd,'#10b981','divide by n−1'],['Variance σ²',stats.popVar,'#8b5cf6','spread squared'],['Sample Var s²',stats.sampleVar,'#8b5cf6',''],['Std Error',stats.sem,'#f59e0b','σ/√n'],['CV',`${fmt(stats.cv)}%`,'#ef4444','σ/μ × 100']].map(([l,v,col,sub])=>(
              <div key={l} style={{padding:'10px 12px',borderRadius:10,background:'var(--bg-raised)',border:'0.5px solid var(--border)'}}>
                <div style={{fontSize:9,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',marginBottom:3}}>{l}</div>
                <div style={{fontSize:18,fontWeight:700,color:col,fontFamily:"'Space Grotesk',sans-serif"}}>{typeof v==='number'?fmt(v):v}</div>
                {sub&&<div style={{fontSize:9,color:'var(--text-3)',marginTop:2}}>{sub}</div>}
              </div>
            ))}
          </div>
          <BreakdownTable title="Calculation breakdown" rows={[
            {label:'n (count)',value:stats.n.toString()},
            {label:'Mean (μ)',value:fmt(stats.mean),color:C},
            {label:'Σ(xᵢ−μ)²',value:fmt(stats.sumSqDev)},
            {label:'Pop variance (÷n)',value:fmt(stats.popVar)},
            {label:'Pop std dev (σ)',value:fmt(stats.popStd),bold:true,color:C,highlight:true},
            {label:'Sample variance (÷n−1)',value:fmt(stats.sampleVar)},
            {label:'Sample std dev (s)',value:fmt(stats.sampleStd),bold:true,color:'#10b981',highlight:true},
          ]}/>
          <AIHintCard hint={`n=${stats.n}, mean=${fmt(stats.mean)}. Population σ=${fmt(stats.popStd)}, sample s=${fmt(stats.sampleStd)}. CV=${fmt(stats.cv)}% — ${stats.cv<15?'very consistent data':stats.cv<30?'moderate variability':'high variability'}.`} color={C}/>
        </>):<div style={{padding:'40px',textAlign:'center',color:'var(--text-3)'}}>Enter data values</div>}
      </>}
    />

    {/* Step by step deviation table */}
    {stats&&stats.n<=15&&(<Sec title="📋 Step-by-Step Deviation Table" sub="How σ is calculated" color={C}>
      <div style={{overflowX:'auto'}}>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead><tr>{['xᵢ','xᵢ − μ','(xᵢ − μ)²'].map(h=>(<th key={h} style={{padding:'8px 10px',fontSize:11,fontWeight:700,color:'var(--text-3)',textAlign:'right',borderBottom:'1px solid var(--border)',background:'var(--bg-raised)'}}>{h}</th>))}</tr></thead>
          <tbody>
            {nums.map((v,i)=>{
              const dev=stats.deviations[i],sq=stats.squaredDev[i]
              return(<tr key={i} style={{background:i%2===0?'transparent':'var(--bg-raised)'}}>
                <td style={{padding:'6px 10px',fontSize:12,fontWeight:700,color:C,textAlign:'right',fontFamily:"'Space Grotesk',sans-serif"}}>{v}</td>
                <td style={{padding:'6px 10px',fontSize:12,color:dev>=0?'#10b981':'#ef4444',textAlign:'right',fontFamily:"'Space Grotesk',sans-serif"}}>{dev>=0?'+':''}{fmt(dev)}</td>
                <td style={{padding:'6px 10px',fontSize:12,color:'var(--text)',textAlign:'right',fontFamily:"'Space Grotesk',sans-serif"}}>{fmt(sq)}</td>
              </tr>)
            })}
            <tr style={{background:C+'08',fontWeight:700}}>
              <td style={{padding:'7px 10px',fontSize:12,color:C,textAlign:'right'}}>Σ = {fmt(stats.sum)}</td>
              <td style={{padding:'7px 10px',fontSize:12,color:'var(--text-3)',textAlign:'right'}}>= 0 (always)</td>
              <td style={{padding:'7px 10px',fontSize:12,color:C,textAlign:'right'}}>Σ = {fmt(stats.sumSqDev)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginTop:14}}>
        <div style={{padding:'10px 14px',background:C+'08',borderRadius:10,border:`1px solid ${C}25`}}>
          <div style={{fontSize:11,fontWeight:700,color:C,marginBottom:4}}>Population σ</div>
          <div style={{fontSize:12,color:'var(--text-2)',fontFamily:"'Space Grotesk',sans-serif"}}>σ = √({fmt(stats.sumSqDev)} ÷ {stats.n}) = √{fmt(stats.popVar)} = <strong style={{color:C}}>{fmt(stats.popStd)}</strong></div>
        </div>
        <div style={{padding:'10px 14px',background:'#10b98108',borderRadius:10,border:'1px solid #10b98125'}}>
          <div style={{fontSize:11,fontWeight:700,color:'#10b981',marginBottom:4}}>Sample s</div>
          <div style={{fontSize:12,color:'var(--text-2)',fontFamily:"'Space Grotesk',sans-serif"}}>s = √({fmt(stats.sumSqDev)} ÷ {stats.n-1}) = √{fmt(stats.sampleVar)} = <strong style={{color:'#10b981'}}>{fmt(stats.sampleStd)}</strong></div>
        </div>
      </div>
    </Sec>)}

    {/* Empirical rule visual */}
    {stats&&(<Sec title="📐 Empirical Rule — 68-95-99.7 Visualised" sub="Normal distribution bell curve" color={C}>
      <svg viewBox="0 0 280 100" width="100%" style={{display:'block',background:'var(--bg-raised)',borderRadius:10,marginBottom:12}}>
        {/* Bell curve approximation */}
        {[1,2,3].map(sigma=>{
          const col=sigma===1?C:sigma===2?'#10b981':'#f59e0b'
          const pct=sigma===1?34:sigma===2?13.5:2.35
          const x1=140-(sigma*35),x2=140+(sigma*35)
          return(<g key={sigma}>
            <rect x={x1} y={20} width={x2-x1} height={60} fill={col+(sigma===1?'30':sigma===2?'20':'15')} rx="2"/>
          </g>)
        })}
        {/* Curve */}
        <polyline points={Array.from({length:61},(_,i)=>{const x=-3+i*0.1;const y=Math.exp(-x*x/2)/(Math.sqrt(2*Math.PI));return`${140+x*35},${80-y*180}`}).join(' ')} fill="none" stroke={C} strokeWidth="2.5"/>
        {/* Axis */}
        <line x1={10} y1={80} x2={270} y2={80} stroke="var(--border)" strokeWidth="1"/>
        {/* Labels */}
        {[['μ-3σ',35],['μ-2σ',70],['μ-σ',105],['μ',140],['μ+σ',175],['μ+2σ',210],['μ+3σ',245]].map(([l,x])=>(<text key={l} x={x} y={92} textAnchor="middle" fontSize="5" fill="var(--text-3)">{l}</text>))}
        {[['68%',140,40,C],['95%',140,52,'#10b981'],['99.7%',140,64,'#f59e0b']].map(([l,x,y,col])=>(<text key={l} x={x} y={y} textAnchor="middle" fontSize="6" fill={col} fontWeight="700">{l}</text>))}
      </svg>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8}}>
        {[['68.27%','±1σ',`${fmt(stats.mean-stats.popStd)} to ${fmt(stats.mean+stats.popStd)}`,C],['95.45%','±2σ',`${fmt(stats.mean-2*stats.popStd)} to ${fmt(stats.mean+2*stats.popStd)}`,'#10b981'],['99.73%','±3σ',`${fmt(stats.mean-3*stats.popStd)} to ${fmt(stats.mean+3*stats.popStd)}`,'#f59e0b']].map(([pct,range,vals,col])=>(
          <div key={range} style={{padding:'10px',borderRadius:10,background:col+'08',border:`1px solid ${col}25`,textAlign:'center'}}>
            <div style={{fontSize:16,fontWeight:700,color:col}}>{pct}</div>
            <div style={{fontSize:11,color:'var(--text)',fontWeight:600}}>{range}</div>
            <div style={{fontSize:9,color:'var(--text-3)',marginTop:3}}>{vals}</div>
          </div>
        ))}
      </div>
    </Sec>)}

    <Sec title="Frequently asked questions" color={C}>
      {FAQ.map((f,i)=><Acc key={i} q={f.q} a={f.a} open={openFaq===i} onToggle={()=>setFaq(openFaq===i?null:i)} color={C}/>)}
    </Sec>
  </div>)
}
