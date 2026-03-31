import { useState, useMemo } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'
const fmt=n=>(isNaN(n)||!isFinite(n))? '—':parseFloat(Number(n).toFixed(6)).toString()
function Sec({title,sub,children,color}){return(<div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,overflow:'hidden'}}><div style={{padding:'13px 18px',borderBottom:'0.5px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center',background:color?color+'06':'transparent'}}><span style={{fontSize:13,fontWeight:700,color:'var(--text)',fontFamily:"'Space Grotesk',sans-serif"}}>{title}</span>{sub&&<span style={{fontSize:11,color:'var(--text-3)'}}>{sub}</span>}</div><div style={{padding:'16px 18px'}}>{children}</div></div>)}
function Acc({q,a,open,onToggle,color}){return(<div style={{borderBottom:'0.5px solid var(--border)'}}><button onClick={onToggle} style={{width:'100%',display:'flex',justifyContent:'space-between',alignItems:'center',padding:'13px 0',background:'none',border:'none',cursor:'pointer',gap:12,textAlign:'left'}}><span style={{fontSize:13,fontWeight:600,color:'var(--text)',fontFamily:"'DM Sans',sans-serif",lineHeight:1.4}}>{q}</span><span style={{fontSize:18,color,flexShrink:0,transform:open?'rotate(45deg)':'none',transition:'transform .2s'}}>+</span></button>{open&&<p style={{fontSize:12.5,color:'var(--text-2)',lineHeight:1.75,margin:'0 0 13px'}}>{a}</p>}</div>)}
const FAQ=[
  {q:'What is variance and how does it differ from standard deviation?',a:'Variance is the average of squared deviations from the mean: σ² = Σ(xᵢ−μ)²/n. Standard deviation is simply √variance. Variance is in squared units (e.g. kg²), making it less intuitive but mathematically cleaner. Standard deviation is in the same units as the data, making it easier to interpret.'},
  {q:'Why do we square the deviations?',a:'Without squaring: deviations above and below the mean cancel out — their sum is always 0. Squaring makes all deviations positive, so they accumulate. It also penalizes large deviations more heavily than small ones (a deviation of 2 contributes 4, not twice as much as a deviation of 1 which contributes 1).'},
  {q:'Population variance vs sample variance — why divide by n−1?',a:"Sample variance uses n−1 (Bessel's correction) because using n underestimates the true population variance. Intuitively: the sample mean x̄ is itself an estimate, and the deviations from x̄ are slightly smaller than deviations from the true μ. Dividing by n−1 corrects for this bias."},
  {q:'What are the properties of variance?',a:'Var(X+c) = Var(X) — adding a constant does not change spread. Var(cX) = c²·Var(X) — scaling multiplies variance by c². Var(X+Y) = Var(X)+Var(Y) if X,Y are independent. These properties are why variance (not std dev) is used in statistical theory.'},
]
export default function VarianceCalculator({meta,category}){
  const C=category?.color||'#6366f1'
  const[rawInput,setRawInput]=useState('5, 8, 3, 12, 7, 10, 2, 9, 6, 11')
  const[openFaq,setFaq]=useState(null)
  const nums=useMemo(()=>rawInput.split(/[\s,;]+/).map(Number).filter(v=>!isNaN(v)&&v.toString()!==''),[rawInput])
  const stats=useMemo(()=>{
    if(nums.length<2)return null
    const n=nums.length,mean=nums.reduce((a,b)=>a+b)/n
    const devs=nums.map(v=>({v,dev:v-mean,sq:(v-mean)**2}))
    const sumSq=devs.reduce((a,d)=>a+d.sq,0)
    const popVar=sumSq/n,sampleVar=sumSq/(n-1)
    const popStd=Math.sqrt(popVar),sampleStd=Math.sqrt(sampleVar)
    return{n,mean,devs,sumSq,popVar,sampleVar,popStd,sampleStd,min:Math.min(...nums),max:Math.max(...nums)}
  },[nums])
  const DATASETS=[
    {label:'Low variance',data:'9,10,10,11,10,9,11,10,10,10'},
    {label:'High variance',data:'1,50,5,80,20,70,10,90,3,60'},
    {label:'Medium',data:'5,8,3,12,7,10,2,9,6,11'},
  ]
  return(<div style={{display:'flex',flexDirection:'column',gap:20}}>
    <div style={{background:`linear-gradient(135deg,${C}12,${C}06)`,border:`1px solid ${C}30`,borderRadius:14,padding:'16px 20px',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12}}>
      <div>
        <div style={{fontSize:10,fontWeight:700,color:C,textTransform:'uppercase',letterSpacing:'.08em',marginBottom:6}}>Variance Calculator</div>
        <div style={{fontSize:20,fontWeight:700,color:C,fontFamily:"'Space Grotesk',sans-serif"}}>σ² = Σ(xᵢ−μ)² / n</div>
        <div style={{fontSize:11,color:'var(--text-3)',marginTop:4}}>Average squared deviation from the mean</div>
      </div>
      {stats&&(<div style={{display:'flex',gap:10}}>
        <div style={{padding:'10px 16px',background:C+'18',borderRadius:12,textAlign:'center'}}>
          <div style={{fontSize:10,color:'var(--text-3)',marginBottom:2}}>Population σ²</div>
          <div style={{fontSize:26,fontWeight:700,color:C,fontFamily:"'Space Grotesk',sans-serif"}}>{fmt(stats.popVar)}</div>
        </div>
        <div style={{padding:'10px 16px',background:'#10b98118',borderRadius:12,textAlign:'center'}}>
          <div style={{fontSize:10,color:'var(--text-3)',marginBottom:2}}>Sample s²</div>
          <div style={{fontSize:26,fontWeight:700,color:'#10b981',fontFamily:"'Space Grotesk',sans-serif"}}>{fmt(stats.sampleVar)}</div>
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
          <textarea value={rawInput} onChange={e=>setRawInput(e.target.value)} rows={4} style={{width:'100%',border:`1.5px solid ${C}40`,borderRadius:9,padding:'10px 14px',fontSize:13,fontWeight:600,color:'var(--text)',background:'var(--bg-card)',outline:'none',resize:'vertical',fontFamily:"'DM Sans',sans-serif",boxSizing:'border-box'}} placeholder="e.g. 5, 8, 3, 12, 7..."/>
        </div>
        {stats&&(<div style={{padding:'12px 14px',background:C+'08',borderRadius:10,border:`1px solid ${C}20`,marginBottom:14}}>
          <div style={{fontSize:11,fontWeight:700,color:'var(--text)',marginBottom:6}}>Formula walkthrough</div>
          <div style={{fontSize:11,color:'var(--text-2)',lineHeight:1.8,fontFamily:"'Space Grotesk',sans-serif"}}>
            <div>μ = {fmt(stats.mean)}</div>
            <div>Σ(xᵢ−μ)² = {fmt(stats.sumSq)}</div>
            <div>σ² = {fmt(stats.sumSq)} ÷ {stats.n} = {fmt(stats.popVar)}</div>
            <div>s² = {fmt(stats.sumSq)} ÷ {stats.n-1} = {fmt(stats.sampleVar)}</div>
          </div>
        </div>)}
        <div style={{display:'flex',gap:10}}>
          <button style={{flex:1,padding:13,borderRadius:10,border:'none',background:C,color:'#fff',fontSize:14,fontWeight:700,cursor:'pointer'}}>Calculate →</button>
          <button onClick={()=>setRawInput('5, 8, 3, 12, 7, 10, 2, 9, 6, 11')} style={{padding:'13px 18px',borderRadius:10,border:'1.5px solid var(--border-2)',background:'var(--bg-raised)',color:'var(--text-2)',fontSize:13,fontWeight:500,cursor:'pointer'}}>Reset</button>
        </div>
      </>}
      right={<>
        {stats?(<>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:14}}>
            {[['Pop variance σ²',stats.popVar,C,'÷ n'],['Sample variance s²',stats.sampleVar,'#10b981','÷ n−1'],['Pop std dev σ',stats.popStd,'#8b5cf6','√σ²'],['Sample std dev s',stats.sampleStd,'#f59e0b','√s²']].map(([l,v,col,sub])=>(
              <div key={l} style={{padding:'12px',borderRadius:10,background:col+'08',border:`1px solid ${col}20`}}>
                <div style={{fontSize:10,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',marginBottom:3}}>{l}</div>
                <div style={{fontSize:20,fontWeight:700,color:col,fontFamily:"'Space Grotesk',sans-serif"}}>{fmt(v)}</div>
                <div style={{fontSize:9,color:'var(--text-3)',marginTop:2}}>{sub}</div>
              </div>
            ))}
          </div>
          <BreakdownTable title="Summary" rows={[
            {label:'n',value:stats.n.toString()},
            {label:'Mean μ',value:fmt(stats.mean),color:C},
            {label:'Σ(xᵢ−μ)²',value:fmt(stats.sumSq)},
            {label:'Pop variance σ²',value:fmt(stats.popVar),bold:true,color:C,highlight:true},
            {label:'Sample variance s²',value:fmt(stats.sampleVar),bold:true,color:'#10b981',highlight:true},
            {label:'Pop std dev σ',value:fmt(stats.popStd)},
            {label:'Sample std dev s',value:fmt(stats.sampleStd)},
          ]}/>
          <AIHintCard hint={`σ²=${fmt(stats.popVar)} (population), s²=${fmt(stats.sampleVar)} (sample). σ=${fmt(stats.popStd)}, s=${fmt(stats.sampleStd)}. Mean=${fmt(stats.mean)}.`} color={C}/>
        </>):<div style={{padding:'40px',textAlign:'center',color:'var(--text-3)'}}>Enter data values</div>}
      </>}
    />
    {stats&&stats.n<=15&&(<Sec title="📋 Deviation Table — Step by step" sub="How variance is computed" color={C}>
      <div style={{overflowX:'auto'}}>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead><tr>{['xᵢ','xᵢ − μ','(xᵢ − μ)²'].map(h=>(<th key={h} style={{padding:'8px 10px',fontSize:11,fontWeight:700,color:'var(--text-3)',textAlign:'right',borderBottom:'1px solid var(--border)',background:'var(--bg-raised)'}}>{h}</th>))}</tr></thead>
          <tbody>
            {stats.devs.map((d,i)=>(<tr key={i} style={{background:i%2===0?'transparent':'var(--bg-raised)'}}>
              <td style={{padding:'6px 10px',fontSize:12,color:C,textAlign:'right',fontWeight:700,fontFamily:"'Space Grotesk',sans-serif"}}>{d.v}</td>
              <td style={{padding:'6px 10px',fontSize:12,color:d.dev>=0?'#10b981':'#ef4444',textAlign:'right',fontFamily:"'Space Grotesk',sans-serif"}}>{d.dev>=0?'+':''}{fmt(d.dev)}</td>
              <td style={{padding:'6px 10px',fontSize:12,color:'var(--text)',textAlign:'right',fontFamily:"'Space Grotesk',sans-serif"}}>{fmt(d.sq)}</td>
            </tr>))}
            <tr style={{background:C+'08'}}>
              <td style={{padding:'7px 10px',fontSize:12,fontWeight:700,color:C,textAlign:'right'}}>μ={fmt(stats.mean)}</td>
              <td style={{padding:'7px 10px',fontSize:12,color:'var(--text-3)',textAlign:'right'}}>Σ=0</td>
              <td style={{padding:'7px 10px',fontSize:12,fontWeight:700,color:C,textAlign:'right'}}>Σ={fmt(stats.sumSq)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </Sec>)}
    <Sec title="Frequently asked questions" color={C}>
      {FAQ.map((f,i)=><Acc key={i} q={f.q} a={f.a} open={openFaq===i} onToggle={()=>setFaq(openFaq===i?null:i)} color={C}/>)}
    </Sec>
  </div>)
}
