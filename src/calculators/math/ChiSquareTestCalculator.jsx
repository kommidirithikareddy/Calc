import { useState, useMemo } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'
const fmt=n=>(isNaN(n)||!isFinite(n))? '—':parseFloat(Number(n).toFixed(6)).toString()
const fmtP=n=>(isNaN(n)||!isFinite(n))? '—':(n<0.0001?'< 0.0001':(n*100).toFixed(4)+'%')
function Sec({title,sub,children,color}){return(<div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,overflow:'hidden'}}><div style={{padding:'13px 18px',borderBottom:'0.5px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center',background:color?color+'06':'transparent'}}><span style={{fontSize:13,fontWeight:700,color:'var(--text)',fontFamily:"'Space Grotesk',sans-serif"}}>{title}</span>{sub&&<span style={{fontSize:11,color:'var(--text-3)'}}>{sub}</span>}</div><div style={{padding:'16px 18px'}}>{children}</div></div>)}
function Acc({q,a,open,onToggle,color}){return(<div style={{borderBottom:'0.5px solid var(--border)'}}><button onClick={onToggle} style={{width:'100%',display:'flex',justifyContent:'space-between',alignItems:'center',padding:'13px 0',background:'none',border:'none',cursor:'pointer',gap:12,textAlign:'left'}}><span style={{fontSize:13,fontWeight:600,color:'var(--text)',fontFamily:"'DM Sans',sans-serif",lineHeight:1.4}}>{q}</span><span style={{fontSize:18,color,flexShrink:0,transform:open?'rotate(45deg)':'none',transition:'transform .2s'}}>+</span></button>{open&&<p style={{fontSize:12.5,color:'var(--text-2)',lineHeight:1.75,margin:'0 0 13px'}}>{a}</p>}</div>)}
// Chi-square CDF approximation
function chiSquareCDF(x,df){if(x<=0)return 0;let p=0,t=Math.exp(-x/2);if(df%2===0){let term=t;p=t;for(let k=1;k<df/2;k++){term*=x/(2*k);p+=term}}else{const sq=Math.sqrt(x),sqpi=Math.sqrt(Math.PI);let erf2=0;const u=sq/Math.sqrt(2);const t2=1/(1+0.3275911*u);const y=1-t2*(0.254829592+t2*(-0.284496736+t2*(1.421413741+t2*(-1.453152027+t2*1.061405429))))*Math.exp(-u*u);erf2=u>=0?y:-y;p=erf2;let term=t*sq/sqpi;p+=2*term;for(let k=1;k<(df-1)/2;k++){term*=x/(2*k+1);p+=2*term}}return Math.min(1,p)}
function chiPvalue(chi2,df){return 1-chiSquareCDF(chi2,df)}
// Goodness of fit critical values (approximate)
function chiCrit(alpha,df){// Wilson-Hilferty approximation
  const z=alpha===0.05?1.645:alpha===0.01?2.326:1.282
  const h=2/(9*df)
  return df*Math.pow(1-h+z*Math.sqrt(h),3)
}
const FAQ=[
  {q:'What is the Chi-square test?',a:'The chi-square (χ²) test is used with categorical data. The goodness-of-fit test checks if observed counts match expected counts from a hypothesised distribution. The independence test checks if two categorical variables are related. χ² = Σ(O−E)²/E where O = observed and E = expected frequencies.'},
  {q:'What are degrees of freedom in chi-square?',a:'For goodness of fit: df = k−1 where k = number of categories (minus additional estimated parameters). For independence test: df = (rows−1)×(columns−1). Degrees of freedom determine the shape of the chi-square distribution. A χ²(1) test is for 2×2 tables; χ²(4) for 3×3 tables.'},
  {q:'What is the minimum expected frequency assumption?',a:'The chi-square test requires that all expected frequencies E ≥ 5 (some say ≥ 1, with most ≥ 5). When expected frequencies are too small, the chi-square approximation breaks down. In that case: merge categories, collect more data, or use Fisher\'s exact test (for 2×2 tables).'},
  {q:'What is Cramer\'s V?',a:"Cramer's V measures the strength of association between two categorical variables. V = √(χ²/(n·min(r−1,c−1))) where r = rows, c = columns. V = 0: no association. V = 0.1: small. V = 0.3: medium. V = 0.5: large. Unlike χ², V is not affected by sample size, making it a better effect size measure."},
  {q:'When should I use chi-square vs other tests?',a:'Chi-square: categorical data — gender vs preference, region vs voting. T-test: continuous data — compare two group means. ANOVA: continuous data — compare three or more means. Fisher\'s exact: categorical, small sample (E < 5). McNemar\'s test: paired categorical data (before vs after).'},
]
const GOF_EXAMPLES=[
  {label:'Fair die (6 faces)',cats:['1','2','3','4','5','6'],observed:[18,22,15,20,17,28],expected_ratio:[1,1,1,1,1,1]},
  {label:'Blood types',cats:['A','B','AB','O'],observed:[220,80,40,260],expected_ratio:[0.30,0.09,0.03,0.58]},
  {label:'Mendel peas',cats:['Round Yellow','Round Green','Wrinkled Yellow','Wrinkled Green'],observed:[315,108,101,32],expected_ratio:[9,3,3,1]},
]
const CONTINGENCY_EXAMPLES=[
  {label:'Gender × Preference',rows:['Male','Female'],cols:['Product A','Product B','Product C'],data:[[40,35,25],[30,45,30]]},
  {label:'Smoking × Disease',rows:['Smoker','Non-smoker'],cols:['Disease','No Disease'],data:[[90,60],[30,120]]},
]
export default function ChiSquareTestCalculator({meta,category}){
  const C=category?.color||'#6366f1'
  const[mode,setMode]=useState('gof')
  const[alpha,setAlpha]=useState(0.05)
  const[openFaq,setFaq]=useState(null)
  // GOF state
  const[gofCats,setGofCats]=useState(['Heads','Tails'])
  const[gofObs,setGofObs]=useState([55,45])
  const[gofExp,setGofExp]=useState([0.5,0.5])
  const[activeGOF,setActiveGOF]=useState(-1)
  // Contingency state
  const[ctRows,setCtRows]=useState(['Male','Female'])
  const[ctCols,setCtCols]=useState(['Product A','Product B'])
  const[ctData,setCtData]=useState([[40,35],[30,45]])
  const[activeCT,setActiveCT]=useState(-1)
  // GOF calc
  const gofResult=useMemo(()=>{
    const n=Math.min(gofCats.length,gofObs.length,gofExp.length)
    if(n<2)return null
    const obs=gofObs.slice(0,n),expRatio=gofExp.slice(0,n)
    const totalObs=obs.reduce((a,b)=>a+b,0)
    const totalExpR=expRatio.reduce((a,b)=>a+b,0)
    if(totalObs===0||totalExpR===0)return null
    const expected=expRatio.map(r=>(r/totalExpR)*totalObs)
    const terms=obs.map((o,i)=>({cat:gofCats[i]||`Cat ${i+1}`,o,e:expected[i],term:(o-expected[i])**2/expected[i]}))
    const chi2=terms.reduce((a,t)=>a+t.term,0)
    const df=n-1
    const p=chiPvalue(chi2,df)
    const crit=chiCrit(alpha,df)
    const reject=chi2>crit
    const cramersV=Math.sqrt(chi2/(totalObs*(Math.min(n,2)-1)))
    return{chi2,df,p,crit,reject,terms,totalObs,cramersV}
  },[gofCats,gofObs,gofExp,alpha])
  // Contingency calc
  const ctResult=useMemo(()=>{
    const R=ctRows.length,C2=ctCols.length
    if(R<2||C2<2)return null
    const total=ctData.reduce((a,row)=>a+row.reduce((b,v)=>b+v,0),0)
    if(total===0)return null
    const rowTotals=ctData.map(row=>row.reduce((a,v)=>a+v,0))
    const colTotals=Array.from({length:C2},(_,j)=>ctData.reduce((a,row)=>a+row[j],0))
    const expected=ctData.map((row,i)=>row.map((_,j)=>rowTotals[i]*colTotals[j]/total))
    const cells=ctData.flatMap((row,i)=>row.map((o,j)=>({r:i,c:j,o,e:expected[i][j],term:expected[i][j]>0?(o-expected[i][j])**2/expected[i][j]:0})))
    const chi2=cells.reduce((a,cell)=>a+cell.term,0)
    const df=(R-1)*(C2-1)
    const p=chiPvalue(chi2,df)
    const crit=chiCrit(alpha,df)
    const reject=chi2>crit
    const cramersV=Math.sqrt(chi2/(total*Math.min(R-1,C2-1)))
    const phi=R===2&&C2===2?Math.sqrt(chi2/total):null
    return{chi2,df,p,crit,reject,cells,expected,rowTotals,colTotals,total,cramersV,phi}
  },[ctRows,ctCols,ctData,alpha])
  const result=mode==='gof'?gofResult:ctResult
  const reject=result?.reject
  const resultColor=reject?'#ef4444':'#10b981'
  // Chi-square distribution visual
  const df2=result?.df||1,W=280,H=110
  const chiMax=Math.max(df2*3+10,20)
  const toSx=v=>(v/chiMax)*(W-20)+10
  const chiPDF=v=>{if(v<=0)return 0;if(df2===1)return Math.exp(-v/2)/(Math.sqrt(2*v)*Math.sqrt(Math.PI));const lnG=(df2/2)*Math.log(2)+(df2/2-1)*Math.log(v)-v/2;return Math.exp(-lnG)/Math.exp(lgamma(df2/2))}
  function lgamma(x){return(x-0.5)*Math.log(x+4.5)-x-4.5+0.5*Math.log(2*Math.PI)+1/(12*(x+4.5))}
  const toSy=p=>Math.max(5,Math.min(H-15,H-15-(p/(chiPDF(Math.max(1,df2-2)||1)||0.1))*(H-25)))
  const curvePts=Array.from({length:80},(_,i)=>{const v=(i+0.5)/80*chiMax;const p=chiPDF(v);return{v,p}}).filter(p=>isFinite(p.p)&&p.p<10)
  const maxP=Math.max(...curvePts.map(p=>p.p),0.01)
  const toSyN=p=>H-15-(p/maxP)*(H-25)
  const curveStr=curvePts.map(p=>`${toSx(p.v)},${Math.max(5,Math.min(H-5,toSyN(p.p)))}`).join(' ')
  const critV=result?.crit||chiCrit(alpha,df2)
  const chi2=result?.chi2||0
  const shadeRight=curvePts.filter(p=>p.v>=critV).map(p=>`${toSx(p.v)},${Math.max(5,Math.min(H-5,toSyN(p.p)))}`)
  const shadeRightPoly=[`${toSx(critV)},${H-15}`,...shadeRight,`${toSx(chiMax)},${H-15}`].join(' ')
  return(<div style={{display:'flex',flexDirection:'column',gap:20}}>
    <div style={{background:`linear-gradient(135deg,${C}12,${C}06)`,border:`1px solid ${C}30`,borderRadius:14,padding:'16px 20px',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12}}>
      <div>
        <div style={{fontSize:10,fontWeight:700,color:C,textTransform:'uppercase',letterSpacing:'.08em',marginBottom:6}}>Chi-Square Test Calculator</div>
        <div style={{fontSize:20,fontWeight:700,color:C,fontFamily:"'Space Grotesk',sans-serif"}}>χ² = Σ (O − E)² / E</div>
        <div style={{fontSize:11,color:'var(--text-3)',marginTop:4}}>Categorical data · Goodness of fit · Independence test</div>
      </div>
      {result&&(<div style={{padding:'10px 20px',background:resultColor+'20',borderRadius:12,textAlign:'center',border:`1.5px solid ${resultColor}40`}}>
        <div style={{fontSize:11,color:'var(--text-3)',marginBottom:2}}>Decision</div>
        <div style={{fontSize:18,fontWeight:700,color:resultColor,fontFamily:"'Space Grotesk',sans-serif"}}>{reject?'Reject H₀':'Fail to Reject H₀'}</div>
        <div style={{fontSize:12,color:resultColor,fontWeight:600}}>χ²={fmt(result.chi2)} · p={fmtP(result.p)}</div>
      </div>)}
    </div>
    {/* Mode + Alpha */}
    <div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,padding:'14px 18px'}}>
      <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:12,alignItems:'start'}}>
        <div><div style={{fontSize:12,fontWeight:600,color:'var(--text-2)',marginBottom:10}}>Test type</div>
          <div style={{display:'flex',gap:8}}>{[['gof','Goodness of Fit'],['contingency','Independence (Contingency Table)']].map(([k,l])=>(<button key={k} onClick={()=>setMode(k)} style={{flex:1,padding:'10px',borderRadius:10,border:`1.5px solid ${mode===k?C:'var(--border)'}`,background:mode===k?C+'12':'var(--bg-raised)',cursor:'pointer',fontSize:11,fontWeight:mode===k?700:500,color:mode===k?C:'var(--text-2)'}}>{l}</button>))}</div>
        </div>
        <div><div style={{fontSize:12,fontWeight:600,color:'var(--text-2)',marginBottom:10}}>α</div>
          <div style={{display:'flex',gap:4}}>{[0.01,0.05,0.10].map(a=>(<button key={a} onClick={()=>setAlpha(a)} style={{flex:1,padding:'9px',borderRadius:8,border:`1.5px solid ${alpha===a?C:'var(--border)'}`,background:alpha===a?C:'var(--bg-raised)',color:alpha===a?'#fff':'var(--text-2)',cursor:'pointer',fontSize:11,fontWeight:700}}>{a}</button>))}</div>
        </div>
      </div>
    </div>
    <CalcShell
      left={<>
        <div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:14,paddingBottom:8,borderBottom:'0.5px solid var(--border)'}}>
          {mode==='gof'?'Goodness of Fit Data':'Contingency Table'}
        </div>
        {mode==='gof'&&(<>
          <div style={{fontSize:12,fontWeight:600,color:'var(--text-2)',marginBottom:10}}>Example datasets</div>
          <div style={{display:'flex',flexDirection:'column',gap:6,marginBottom:14}}>
            {GOF_EXAMPLES.map((ex,i)=>(<button key={i} onClick={()=>{setGofCats([...ex.cats]);setGofObs([...ex.observed]);setGofExp([...ex.expected_ratio]);setActiveGOF(i)}} style={{padding:'8px 12px',borderRadius:9,border:`1.5px solid ${activeGOF===i?C:'var(--border)'}`,background:activeGOF===i?C+'12':'var(--bg-raised)',cursor:'pointer',textAlign:'left',fontSize:11,fontWeight:600,color:activeGOF===i?C:'var(--text)'}}>{ex.label}</button>))}
          </div>
          <div style={{fontSize:12,fontWeight:600,color:'var(--text)',marginBottom:10}}>Observed vs Expected</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:6,marginBottom:6}}>
            {['Category','Observed','Expected ratio'].map(h=>(<div key={h} style={{fontSize:10,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase'}}>{h}</div>))}
          </div>
          {gofCats.map((cat,i)=>(<div key={i} style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:6,marginBottom:6,alignItems:'center'}}>
            <input value={cat} onChange={e=>{const a=[...gofCats];a[i]=e.target.value;setGofCats(a)}} style={{border:'1.5px solid var(--border-2)',borderRadius:7,padding:'6px 8px',fontSize:11,fontWeight:600,color:'var(--text)',background:'var(--bg-card)',outline:'none'}}/>
            <input type="number" value={gofObs[i]||0} onChange={e=>{const a=[...gofObs];a[i]=Number(e.target.value);setGofObs(a)}} style={{border:'1.5px solid var(--border-2)',borderRadius:7,padding:'6px 8px',fontSize:12,fontWeight:700,color:C,background:'var(--bg-card)',outline:'none',textAlign:'right',fontFamily:"'Space Grotesk',sans-serif"}}/>
            <input type="number" step="0.01" value={gofExp[i]||0} onChange={e=>{const a=[...gofExp];a[i]=Number(e.target.value);setGofExp(a)}} style={{border:'1.5px solid var(--border-2)',borderRadius:7,padding:'6px 8px',fontSize:12,fontWeight:700,color:'#10b981',background:'var(--bg-card)',outline:'none',textAlign:'right',fontFamily:"'Space Grotesk',sans-serif"}}/>
          </div>))}
          <div style={{display:'flex',gap:6,marginBottom:14}}>
            <button onClick={()=>{setGofCats([...gofCats,'New']);setGofObs([...gofObs,0]);setGofExp([...gofExp,1])}} style={{padding:'6px 12px',borderRadius:7,border:`1px solid ${C}50`,background:C+'10',color:C,fontSize:11,fontWeight:600,cursor:'pointer'}}>+ Category</button>
            {gofCats.length>2&&<button onClick={()=>{setGofCats(gofCats.slice(0,-1));setGofObs(gofObs.slice(0,-1));setGofExp(gofExp.slice(0,-1))}} style={{padding:'6px 12px',borderRadius:7,border:'1px solid var(--border)',background:'var(--bg-raised)',color:'var(--text-3)',fontSize:11,cursor:'pointer'}}>− Remove</button>}
          </div>
        </>)}
        {mode==='contingency'&&(<>
          <div style={{fontSize:12,fontWeight:600,color:'var(--text-2)',marginBottom:10}}>Example tables</div>
          <div style={{display:'flex',gap:6,marginBottom:14}}>
            {CONTINGENCY_EXAMPLES.map((ex,i)=>(<button key={i} onClick={()=>{setCtRows([...ex.rows]);setCtCols([...ex.cols]);setCtData(ex.data.map(r=>[...r]));setActiveCT(i)}} style={{flex:1,padding:'8px',borderRadius:9,border:`1.5px solid ${activeCT===i?C:'var(--border)'}`,background:activeCT===i?C+'12':'var(--bg-raised)',cursor:'pointer',fontSize:10,fontWeight:600,color:activeCT===i?C:'var(--text)'}}>{ex.label}</button>))}
          </div>
          {/* Table editor */}
          <div style={{overflowX:'auto'}}>
            <table style={{borderCollapse:'collapse',minWidth:'100%'}}>
              <thead><tr>
                <th style={{padding:'4px',width:60}}/>
                {ctCols.map((col,j)=>(<th key={j} style={{padding:'4px'}}><input value={col} onChange={e=>{const a=[...ctCols];a[j]=e.target.value;setCtCols(a)}} style={{width:70,border:'1.5px solid var(--border-2)',borderRadius:6,padding:'4px 6px',fontSize:10,fontWeight:700,color:C,background:'var(--bg-card)',outline:'none',textAlign:'center'}}/></th>))}
              </tr></thead>
              <tbody>{ctRows.map((row,i)=>(<tr key={i}>
                <td style={{padding:'4px'}}><input value={row} onChange={e=>{const a=[...ctRows];a[i]=e.target.value;setCtRows(a)}} style={{width:60,border:'1.5px solid var(--border-2)',borderRadius:6,padding:'4px 6px',fontSize:10,fontWeight:700,color:'#10b981',background:'var(--bg-card)',outline:'none'}}/></td>
                {ctCols.map((_,j)=>(<td key={j} style={{padding:'4px'}}><input type="number" min="0" value={ctData[i]?.[j]||0} onChange={e=>{const d=ctData.map(r=>[...r]);if(!d[i])d[i]=[];d[i][j]=Number(e.target.value);setCtData(d)}} style={{width:70,border:'1.5px solid var(--border-2)',borderRadius:6,padding:'6px',fontSize:13,fontWeight:700,color:'var(--text)',background:'var(--bg-card)',outline:'none',textAlign:'center',fontFamily:"'Space Grotesk',sans-serif"}}/></td>))}
              </tr>))}</tbody>
            </table>
          </div>
        </>)}
        <div style={{display:'flex',gap:10,marginTop:14}}>
          <button style={{flex:1,padding:13,borderRadius:10,border:'none',background:C,color:'#fff',fontSize:14,fontWeight:700,cursor:'pointer'}}>Run Test →</button>
          <button onClick={()=>{setGofObs([55,45]);setGofExp([0.5,0.5]);setCtData([[40,35],[30,45]])}} style={{padding:'13px 18px',borderRadius:10,border:'1.5px solid var(--border-2)',background:'var(--bg-raised)',color:'var(--text-2)',fontSize:13,fontWeight:500,cursor:'pointer'}}>Reset</button>
        </div>
      </>}
      right={<>
        {result?(<>
          {/* Result */}
          <div style={{background:resultColor+'15',border:`2px solid ${resultColor}40`,borderRadius:14,padding:'16px 20px',marginBottom:14,textAlign:'center'}}>
            <div style={{fontSize:20,fontWeight:700,color:resultColor}}>{reject?'✗ Reject H₀ — Not independent':'✓ Fail to Reject H₀ — Consistent with expected'}</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10,marginTop:12}}>
              {[['χ²',fmt(result.chi2),C],['p-value',fmtP(result.p),resultColor],['df',result.df.toString(),'var(--text-2)']].map(([l,v,col])=>(<div key={l} style={{padding:'8px',background:'var(--bg-card)',borderRadius:8}}><div style={{fontSize:9,color:'var(--text-3)'}}>{l}</div><div style={{fontSize:16,fontWeight:700,color:col,fontFamily:"'Space Grotesk',sans-serif"}}>{v}</div></div>))}
            </div>
          </div>
          {/* Chi-square distribution */}
          <div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,padding:'14px 18px',marginBottom:14}}>
            <div style={{fontSize:12,fontWeight:700,color:'var(--text)',marginBottom:8}}>χ²({result.df}) distribution</div>
            <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{display:'block',background:'var(--bg-raised)',borderRadius:8}}>
              <line x1={10} y1={H-15} x2={W-10} y2={H-15} stroke="var(--border)" strokeWidth="1"/>
              <polygon points={shadeRightPoly} fill="#ef444425"/>
              {curvePts.length>1&&<polyline points={curveStr} fill="none" stroke={C} strokeWidth="2.5" strokeLinejoin="round"/>}
              <line x1={toSx(critV)} y1={10} x2={toSx(critV)} y2={H-15} stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4,3"/>
              {chi2>0&&chi2<chiMax&&<line x1={toSx(chi2)} y1={10} x2={toSx(chi2)} y2={H-15} stroke={resultColor} strokeWidth="2.5"/>}
              {chi2>0&&chi2<chiMax&&<circle cx={toSx(chi2)} cy={Math.max(10,H-20)} r={5} fill={resultColor} stroke="#fff" strokeWidth="2"/>}
              <text x={toSx(critV)} y={H-4} textAnchor="middle" fontSize="7" fill="#ef4444">crit={fmt(critV)}</text>
              {chi2>0&&chi2<chiMax&&<text x={toSx(chi2)+2} y={12} textAnchor="start" fontSize="8" fill={resultColor} fontWeight="700">χ²={fmt(chi2)}</text>}
            </svg>
            <div style={{display:'flex',gap:10,marginTop:6,fontSize:9}}>
              <span style={{color:'#ef4444'}}>█ Rejection region (α={alpha})</span>
              <span style={{color:resultColor}}>│ Your χ²={fmt(result.chi2)}</span>
            </div>
          </div>
          <BreakdownTable title="Test statistics" rows={[
            {label:'χ² statistic',value:fmt(result.chi2),bold:true,color:C,highlight:true},
            {label:'Degrees of freedom',value:result.df.toString()},
            {label:'p-value',value:fmtP(result.p),bold:true,color:resultColor,highlight:true},
            {label:`Critical value (α=${alpha})`,value:fmt(result.crit)},
            {label:'Decision',value:reject?'Reject H₀':'Fail to reject H₀',color:resultColor},
            {label:"Cramér's V (effect size)",value:fmt(result.cramersV),note:result.cramersV>0.5?'large':result.cramersV>0.3?'medium':'small'},
            ...(result.phi?[{label:'Phi coefficient',value:fmt(result.phi)}]:[]),
          ]}/>
          <AIHintCard hint={`χ²=${fmt(result.chi2)}, df=${result.df}, p=${fmtP(result.p)}. ${reject?`Reject H₀ at α=${alpha}. Evidence of ${mode==='gof'?'departure from expected distribution':'association between variables'}.`:`Fail to reject H₀. Data are ${mode==='gof'?'consistent with expected distribution':'no significant association detected'}.`} Cramér's V=${fmt(result.cramersV)} (${result.cramersV>0.5?'large':result.cramersV>0.3?'medium':'small'} effect).`} color={C}/>
        </>):<div style={{padding:'40px',textAlign:'center',color:'var(--text-3)'}}>Enter data and run the test</div>}
      </>}
    />
    {/* Observed vs Expected breakdown */}
    {result&&mode==='gof'&&gofResult&&(<Sec title="📊 Observed vs Expected — Cell Contributions" sub="Largest contributors to χ²" color={C}>
      <div style={{display:'flex',flexDirection:'column',gap:8}}>
        {gofResult.terms.sort((a,b)=>b.term-a.term).map((t,i)=>{
          const pct=(t.term/gofResult.chi2)*100
          return(<div key={i} style={{padding:'10px 14px',borderRadius:10,background:pct>30?C+'12':'var(--bg-raised)',border:`1px solid ${pct>30?C+'30':'var(--border)'}`}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
              <span style={{fontSize:12,fontWeight:700,color:pct>30?C:'var(--text)'}}>{t.cat}</span>
              <span style={{fontSize:12,fontWeight:700,color:C,fontFamily:"'Space Grotesk',sans-serif"}}>χ² contribution: {fmt(t.term)} ({pct.toFixed(1)}%)</span>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,marginBottom:6}}>
              {[['Observed',t.o,C],['Expected',fmt(t.e),'#10b981'],['(O-E)²/E',fmt(t.term),'#f59e0b']].map(([l,v,col])=>(<div key={l} style={{padding:'6px 8px',background:'var(--bg-card)',borderRadius:7,textAlign:'center'}}><div style={{fontSize:9,color:'var(--text-3)'}}>{l}</div><div style={{fontSize:13,fontWeight:700,color:col,fontFamily:"'Space Grotesk',sans-serif"}}>{v}</div></div>))}
            </div>
            <div style={{height:6,background:'var(--border)',borderRadius:3,overflow:'hidden'}}><div style={{width:`${pct}%`,height:'100%',background:C,borderRadius:3,transition:'width .4s'}}/></div>
          </div>)
        })}
      </div>
    </Sec>)}
    {/* Contingency expected frequencies */}
    {result&&mode==='contingency'&&ctResult&&(<Sec title="📋 Expected Frequencies Table" sub="E = row total × col total / grand total" color={C}>
      <div style={{overflowX:'auto',marginBottom:12}}>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead><tr>
            <th style={{padding:'7px 10px',fontSize:11,fontWeight:700,color:'var(--text-3)',borderBottom:'1px solid var(--border)',background:'var(--bg-raised)'}}/>
            {ctCols.map((col,j)=>(<th key={j} style={{padding:'7px 10px',fontSize:11,fontWeight:700,color:C,textAlign:'center',borderBottom:'1px solid var(--border)',background:'var(--bg-raised)'}}>{col}</th>))}
            <th style={{padding:'7px 10px',fontSize:11,fontWeight:700,color:'var(--text-3)',textAlign:'center',borderBottom:'1px solid var(--border)',background:'var(--bg-raised)'}}>Total</th>
          </tr></thead>
          <tbody>{ctRows.map((row,i)=>(<tr key={i} style={{background:i%2===0?'transparent':'var(--bg-raised)'}}>
            <td style={{padding:'7px 10px',fontSize:12,fontWeight:700,color:'#10b981',borderBottom:'0.5px solid var(--border)'}}>{row}</td>
            {ctCols.map((_,j)=>{
              const o=ctData[i]?.[j]||0,e=ctResult.expected[i]?.[j]||0,term=e>0?(o-e)**2/e:0
              const lowE=e<5
              return(<td key={j} style={{padding:'7px 10px',textAlign:'center',borderBottom:'0.5px solid var(--border)',background:lowE?'#f59e0b08':'transparent'}}>
                <div style={{fontSize:12,fontWeight:700,color:C}}>{o}</div>
                <div style={{fontSize:9,color:'#10b981'}}>E={fmt(e)}{lowE?' ⚠':''}</div>
                <div style={{fontSize:9,color:'var(--text-3)'}}>χ={fmt(term)}</div>
              </td>)
            })}
            <td style={{padding:'7px 10px',fontSize:12,fontWeight:700,color:'var(--text)',textAlign:'center',borderBottom:'0.5px solid var(--border)'}}>{ctResult.rowTotals[i]}</td>
          </tr>))}</tbody>
          <tfoot><tr style={{background:C+'08'}}>
            <td style={{padding:'7px 10px',fontSize:12,fontWeight:700,color:'var(--text-3)'}}>Total</td>
            {ctResult.colTotals.map((ct,j)=>(<td key={j} style={{padding:'7px 10px',fontSize:12,fontWeight:700,color:'var(--text)',textAlign:'center'}}>{ct}</td>))}
            <td style={{padding:'7px 10px',fontSize:12,fontWeight:700,color:C,textAlign:'center'}}>{ctResult.total}</td>
          </tr>
          </tfoot>
        </table>
      </div>
      {ctResult.cells.some(c=>c.e<5)&&<p style={{fontSize:11,color:'#f59e0b',margin:0}}>⚠️ Some expected frequencies &lt; 5. Consider merging categories or using Fisher's exact test.</p>}
    </Sec>)}
    {/* When to use */}
    <Sec title="🗂️ Chi-Square Test Selection Guide" color={C}>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
        {[{test:'Goodness of Fit χ²',when:'Do observed counts match a theoretical distribution?',example:'Are dice rolls uniform? Do genetics match Mendel\'s 9:3:3:1 ratio?',col:C},{test:'Independence χ²',when:'Are two categorical variables associated?',example:'Is gender associated with product preference? Smoking with disease?',col:'#10b981'},{test:"Fisher's Exact Test",when:'Independence test when E < 5 (small samples)',example:'2×2 table with small counts. Exact p-value, no approximation.',col:'#f59e0b'},{test:"McNemar's Test",when:'Paired categorical data — same subjects measured twice',example:'Before/after treatment response. Opinion before/after campaign.',col:'#8b5cf6'}].map((item,i)=>(<div key={i} style={{padding:'12px',borderRadius:10,background:item.col+'08',border:`1px solid ${item.col}25`}}><div style={{fontSize:12,fontWeight:700,color:item.col,marginBottom:4}}>{item.test}</div><div style={{fontSize:11,fontWeight:600,color:'var(--text)',marginBottom:4}}>{item.when}</div><div style={{fontSize:10,color:'var(--text-3)',lineHeight:1.5,fontStyle:'italic'}}>{item.example}</div></div>))}
      </div>
    </Sec>
    <Sec title="Frequently asked questions" color={C}>{FAQ.map((f,i)=><Acc key={i} q={f.q} a={f.a} open={openFaq===i} onToggle={()=>setFaq(openFaq===i?null:i)} color={C}/>)}</Sec>
  </div>)
}
