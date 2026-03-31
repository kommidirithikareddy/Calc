import { useState, useMemo } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'
const fmt=n=>(isNaN(n)||!isFinite(n))? '—':parseFloat(Number(n).toFixed(4)).toString()
function Sec({title,sub,children,color}){return(<div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,overflow:'hidden'}}><div style={{padding:'13px 18px',borderBottom:'0.5px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center',background:color?color+'06':'transparent'}}><span style={{fontSize:13,fontWeight:700,color:'var(--text)',fontFamily:"'Space Grotesk',sans-serif"}}>{title}</span>{sub&&<span style={{fontSize:11,color:'var(--text-3)'}}>{sub}</span>}</div><div style={{padding:'16px 18px'}}>{children}</div></div>)}
function Acc({q,a,open,onToggle,color}){return(<div style={{borderBottom:'0.5px solid var(--border)'}}><button onClick={onToggle} style={{width:'100%',display:'flex',justifyContent:'space-between',alignItems:'center',padding:'13px 0',background:'none',border:'none',cursor:'pointer',gap:12,textAlign:'left'}}><span style={{fontSize:13,fontWeight:600,color:'var(--text)',fontFamily:"'DM Sans',sans-serif",lineHeight:1.4}}>{q}</span><span style={{fontSize:18,color,flexShrink:0,transform:open?'rotate(45deg)':'none',transition:'transform .2s'}}>+</span></button>{open&&<p style={{fontSize:12.5,color:'var(--text-2)',lineHeight:1.75,margin:'0 0 13px'}}>{a}</p>}</div>)}
const FAQ=[
  {q:'What is linear regression?',a:'Linear regression finds the best-fit line y = mx + b through a set of data points by minimising the sum of squared residuals (differences between observed and predicted values). The slope m = Σ(xᵢ−x̄)(yᵢ−ȳ)/Σ(xᵢ−x̄)² and intercept b = ȳ − m·x̄. It is the foundation of predictive modelling.'},
  {q:'What does R² tell me?',a:'R² (coefficient of determination) measures how much of the variance in Y is explained by X. R²=0.85 means 85% of the variation in Y is accounted for by the linear relationship with X. R²=1 = perfect fit. R²=0 = X explains nothing. R² = r² where r is Pearson correlation.'},
  {q:'What are residuals?',a:'A residual = observed Y − predicted Y (from the regression line). Residuals should be: (1) random — no pattern, (2) centred on zero — unbiased, (3) roughly equal variance — homoscedastic. Patterns in residuals (funnel shape, curves) indicate the linear model is not appropriate.'},
  {q:'What is the difference between correlation and regression?',a:'Correlation (r) measures the strength and direction of the linear relationship — symmetric, no cause/effect. Regression models Y as a function of X — directional, enables prediction. r = 0.8 → R² = 0.64 → regression explains 64% of variance. Regression goes further by giving you the actual equation.'},
  {q:'What are the assumptions of linear regression?',a:'(1) Linearity: Y and X have a linear relationship. (2) Independence: observations are independent. (3) Homoscedasticity: residuals have constant variance. (4) Normality: residuals are normally distributed. Violations can be checked with residual plots, QQ plots, and statistical tests.'},
]
const DATASETS=[
  {label:'Study vs Grade',xLabel:'Study hours',yLabel:'Grade %',x:'1,2,3,4,5,6,7,8,9,10',y:'45,55,60,65,70,75,80,85,88,95'},
  {label:'Height vs Weight',xLabel:'Height (cm)',yLabel:'Weight (kg)',x:'155,160,165,170,175,180,185',y:'50,55,60,65,72,78,85'},
  {label:'Ad spend vs Sales',xLabel:'Ad spend ($k)',yLabel:'Sales ($k)',x:'1,2,3,4,5,6,7,8',y:'14,17,19,22,23,26,28,31'},
  {label:'Temperature vs Ice cream',xLabel:'Temp (°C)',yLabel:'Sales (units)',x:'10,15,20,25,30,35',y:'20,35,55,75,95,120'},
]
export default function LinearRegressionCalculator({meta,category}){
  const C=category?.color||'#6366f1'
  const[xRaw,setXRaw]=useState('1,2,3,4,5,6,7,8,9,10')
  const[yRaw,setYRaw]=useState('45,55,60,65,70,75,80,85,88,95')
  const[xLabel,setXLabel]=useState('Study hours')
  const[yLabel,setYLabel]=useState('Grade %')
  const[predX,setPredX]=useState(11)
  const[openFaq,setFaq]=useState(null)
  const[hovPt,setHovPt]=useState(null)
  const[activeDS,setActiveDS]=useState(0)
  const parse=raw=>raw.split(/[\s,;]+/).map(Number).filter(v=>!isNaN(v))
  const xs=useMemo(()=>parse(xRaw),[xRaw])
  const ys=useMemo(()=>parse(yRaw),[yRaw])
  const reg=useMemo(()=>{
    const n=Math.min(xs.length,ys.length);if(n<3)return null
    const x=xs.slice(0,n),y=ys.slice(0,n)
    const mx=x.reduce((a,b)=>a+b)/n,my=y.reduce((a,b)=>a+b)/n
    const ssxy=x.reduce((a,v,i)=>a+(v-mx)*(y[i]-my),0)
    const ssx=x.reduce((a,v)=>a+(v-mx)**2,0)
    const ssy=y.reduce((a,v)=>a+(v-my)**2,0)
    const slope=ssxy/ssx,intercept=my-slope*mx
    const r=ssx>0&&ssy>0?ssxy/Math.sqrt(ssx*ssy):0,r2=r*r
    const predicted=x.map(v=>slope*v+intercept)
    const residuals=y.map((v,i)=>v-predicted[i])
    const sse=residuals.reduce((a,v)=>a+v**2,0)
    const mse=sse/n,rmse=Math.sqrt(mse)
    const mae=residuals.reduce((a,v)=>a+Math.abs(v),0)/n
    const predY=slope*predX+intercept
    const se_slope=Math.sqrt(mse/ssx)
    return{n,x,y,mx,my,slope,intercept,r,r2,predicted,residuals,sse,mse,rmse,mae,predY,se_slope}
  },[xs,ys,predX])
  const W=280,H=180
  const scatter=useMemo(()=>{
    if(!reg)return null
    const{x,y,slope,intercept}=reg
    const allX=[...x,predX],allY=[...y,slope*predX+intercept]
    const xMin=Math.min(...allX)-1,xMax=Math.max(...allX)+1
    const yMin=Math.min(...allY)-5,yMax=Math.max(...allY)+5
    const toSx=v=>20+((v-xMin)/(xMax-xMin||1))*(W-40)
    const toSy=v=>H-20-((v-yMin)/(yMax-yMin||1))*(H-40)
    const regPts=[xMin,xMax].map(xv=>`${toSx(xv)},${Math.max(5,Math.min(H-5,toSy(intercept+slope*xv)))}`)
    const pts=x.map((xv,i)=>({px:toSx(xv),py:toSy(y[i]),xv,yv:y[i],pred:toSy(reg.predicted[i]),res:reg.residuals[i]}))
    const predPx=toSx(predX),predPy=toSy(reg.predY)
    return{pts,regPts,predPx,predPy,toSx,toSy,xMin,xMax,yMin,yMax}
  },[reg,predX])
  return(<div style={{display:'flex',flexDirection:'column',gap:20}}>
    <div style={{background:`linear-gradient(135deg,${C}12,${C}06)`,border:`1px solid ${C}30`,borderRadius:14,padding:'16px 20px',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12}}>
      <div>
        <div style={{fontSize:10,fontWeight:700,color:C,textTransform:'uppercase',letterSpacing:'.08em',marginBottom:6}}>Linear Regression Calculator</div>
        <div style={{fontSize:20,fontWeight:700,color:C,fontFamily:"'Space Grotesk',sans-serif"}}>ŷ = {reg?`${fmt(reg.slope)}x ${reg.intercept>=0?'+':''} ${fmt(reg.intercept)}`:'mx + b'}</div>
        <div style={{fontSize:11,color:'var(--text-3)',marginTop:4}}>Best-fit line · Least squares method · R² = {reg?fmt(reg.r2):'?'}</div>
      </div>
      {reg&&(<div style={{padding:'10px 16px',background:C+'18',borderRadius:12,textAlign:'center'}}>
        <div style={{fontSize:10,color:'var(--text-3)',marginBottom:2}}>Predict at x={predX}</div>
        <div style={{fontSize:30,fontWeight:700,color:C,fontFamily:"'Space Grotesk',sans-serif"}}>{fmt(reg.predY)}</div>
        <div style={{fontSize:10,color:'var(--text-3)',marginTop:1}}>R² = {fmt(reg.r2)}</div>
      </div>)}
    </div>
    {/* Datasets */}
    <div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,padding:'14px 18px'}}>
      <div style={{fontSize:12,fontWeight:600,color:'var(--text-2)',marginBottom:12}}>📊 Sample datasets</div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8}}>
        {DATASETS.map((ds,i)=>(<button key={i} onClick={()=>{setXRaw(ds.x);setYRaw(ds.y);setXLabel(ds.xLabel);setYLabel(ds.yLabel);setActiveDS(i)}} style={{padding:'10px 6px',borderRadius:10,border:`1.5px solid ${activeDS===i?C:'var(--border-2)'}`,background:activeDS===i?C+'12':'var(--bg-raised)',cursor:'pointer',textAlign:'center'}}><div style={{fontSize:10,fontWeight:700,color:C}}>{ds.label}</div><div style={{fontSize:9,color:'var(--text-3)',marginTop:2}}>{ds.xLabel} → {ds.yLabel}</div></button>))}
      </div>
    </div>
    <CalcShell
      left={<>
        <div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:14,paddingBottom:8,borderBottom:'0.5px solid var(--border)'}}>Paired Data</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>
          <div><label style={{fontSize:11,fontWeight:600,color:'var(--text)',display:'block',marginBottom:4}}>X-axis label</label><input value={xLabel} onChange={e=>setXLabel(e.target.value)} style={{width:'100%',border:'1.5px solid var(--border-2)',borderRadius:8,padding:'8px 12px',fontSize:12,color:'var(--text)',background:'var(--bg-card)',outline:'none',boxSizing:'border-box'}}/></div>
          <div><label style={{fontSize:11,fontWeight:600,color:'var(--text)',display:'block',marginBottom:4}}>Y-axis label</label><input value={yLabel} onChange={e=>setYLabel(e.target.value)} style={{width:'100%',border:'1.5px solid var(--border-2)',borderRadius:8,padding:'8px 12px',fontSize:12,color:'var(--text)',background:'var(--bg-card)',outline:'none',boxSizing:'border-box'}}/></div>
        </div>
        <div style={{marginBottom:10}}>
          <label style={{fontSize:12.5,fontWeight:600,color:'var(--text)',display:'block',marginBottom:6}}>X values ({xLabel})</label>
          <textarea value={xRaw} onChange={e=>setXRaw(e.target.value)} rows={2} style={{width:'100%',border:`1.5px solid ${C}40`,borderRadius:9,padding:'8px 12px',fontSize:12,fontWeight:600,color:'var(--text)',background:'var(--bg-card)',outline:'none',resize:'none',fontFamily:"'DM Sans',sans-serif",boxSizing:'border-box'}}/>
        </div>
        <div style={{marginBottom:14}}>
          <label style={{fontSize:12.5,fontWeight:600,color:'var(--text)',display:'block',marginBottom:6}}>Y values ({yLabel})</label>
          <textarea value={yRaw} onChange={e=>setYRaw(e.target.value)} rows={2} style={{width:'100%',border:`1.5px solid ${C}40`,borderRadius:9,padding:'8px 12px',fontSize:12,fontWeight:600,color:'var(--text)',background:'var(--bg-card)',outline:'none',resize:'none',fontFamily:"'DM Sans',sans-serif",boxSizing:'border-box'}}/>
        </div>
        {reg&&(<div style={{padding:'12px 14px',background:C+'08',borderRadius:10,border:`1px solid ${C}20`,marginBottom:14}}>
          <div style={{fontSize:12,fontWeight:700,color:C,marginBottom:6}}>ŷ = {fmt(reg.slope)}x + {fmt(reg.intercept)}</div>
          <div style={{fontSize:11,color:'var(--text-2)',lineHeight:1.7}}>
            <div>Slope: {fmt(reg.slope)} (y increases by {fmt(reg.slope)} per unit x)</div>
            <div>R² = {fmt(reg.r2)} — explains {(reg.r2*100).toFixed(1)}% of variance</div>
          </div>
        </div>)}
        <div style={{marginBottom:14}}>
          <label style={{fontSize:12.5,fontWeight:600,color:'var(--text)',display:'block',marginBottom:6}}>Predict at x =</label>
          <div style={{display:'flex',height:44,border:`1.5px solid ${C}40`,borderRadius:9,overflow:'hidden',background:'var(--bg-card)'}}><input type="number" step="0.1" value={predX} onChange={e=>setPredX(Number(e.target.value))} style={{flex:1,border:'none',background:'transparent',padding:'0 14px',fontSize:17,fontWeight:700,color:'var(--text)',outline:'none',fontFamily:"'Space Grotesk',sans-serif"}}/></div>
        </div>
        <div style={{display:'flex',gap:10}}>
          <button style={{flex:1,padding:13,borderRadius:10,border:'none',background:C,color:'#fff',fontSize:14,fontWeight:700,cursor:'pointer'}}>Calculate →</button>
          <button onClick={()=>{setXRaw('1,2,3,4,5,6,7,8,9,10');setYRaw('45,55,60,65,70,75,80,85,88,95')}} style={{padding:'13px 18px',borderRadius:10,border:'1.5px solid var(--border-2)',background:'var(--bg-raised)',color:'var(--text-2)',fontSize:13,fontWeight:500,cursor:'pointer'}}>Reset</button>
        </div>
      </>}
      right={<>
        {reg?(<>
          {/* Scatter + regression plot */}
          <div style={{background:'var(--bg-card)',border:`1.5px solid ${C}30`,borderRadius:14,padding:'14px 18px',marginBottom:14}}>
            <div style={{fontSize:12,fontWeight:700,color:'var(--text)',marginBottom:8}}>{yLabel} vs {xLabel}</div>
            <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{display:'block',background:'var(--bg-raised)',borderRadius:8}}>
              {/* Grid lines */}
              {[0.25,0.5,0.75].map(p=>(<line key={p} x1={20} y1={H-20-(p*(H-40))} x2={W-10} y2={H-20-(p*(H-40))} stroke="var(--border)" strokeWidth="0.5" strokeDasharray="3,3"/>))}
              {/* Regression line */}
              {scatter&&<polyline points={scatter.regPts.join(' ')} fill="none" stroke={C} strokeWidth="1.5" strokeDasharray="5,3"/>}
              {/* Residual lines */}
              {scatter&&scatter.pts.map((p,i)=>(<line key={i} x1={p.px} y1={p.py} x2={p.px} y2={p.pred} stroke={p.res>=0?'#10b981':'#ef4444'} strokeWidth="1" strokeDasharray="2,2" opacity="0.6"/>))}
              {/* Data points */}
              {scatter&&scatter.pts.map((p,i)=>(<g key={i} onMouseEnter={()=>setHovPt(i)} onMouseLeave={()=>setHovPt(null)} style={{cursor:'pointer'}}>
                <circle cx={p.px} cy={Math.max(10,Math.min(H-10,p.py))} r={hovPt===i?6:4} fill={C} stroke="#fff" strokeWidth="1.5"/>
                {hovPt===i&&<text x={p.px+8} y={Math.max(15,Math.min(H-8,p.py))-4} fontSize="8" fill={C} fontWeight="700">({p.xv},{p.yv})</text>}
              </g>))}
              {/* Prediction point */}
              {scatter&&<g>
                <circle cx={scatter.predPx} cy={Math.max(10,Math.min(H-10,scatter.predPy))} r={6} fill="#f59e0b" stroke="#fff" strokeWidth="2"/>
                <text x={scatter.predPx+8} y={Math.max(15,Math.min(H-8,scatter.predPy))} fontSize="8" fill="#f59e0b" fontWeight="700">x={predX}→{fmt(reg.predY)}</text>
              </g>}
              {/* Axis labels */}
              <text x={(W)/2} y={H-2} textAnchor="middle" fontSize="7" fill="var(--text-3)">{xLabel}</text>
              <text x={8} y={H/2} textAnchor="middle" fontSize="7" fill="var(--text-3)" transform={`rotate(-90,8,${H/2})`}>{yLabel}</text>
            </svg>
            <div style={{display:'flex',gap:12,marginTop:8,fontSize:9}}>
              <span style={{color:C}}>● Data · — Regression line</span>
              <span style={{color:'#f59e0b'}}>● Prediction</span>
              <span style={{color:'#10b981'}}>| Positive residual</span>
              <span style={{color:'#ef4444'}}>| Negative residual</span>
            </div>
          </div>
          {/* R² gauge */}
          <div style={{padding:'12px 14px',background:'var(--bg-raised)',borderRadius:10,border:'0.5px solid var(--border)',marginBottom:14}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
              <span style={{fontSize:12,fontWeight:700,color:'var(--text)'}}>R² — Model fit quality</span>
              <span style={{fontSize:14,fontWeight:700,color:reg.r2>0.8?'#10b981':reg.r2>0.5?C:'#ef4444'}}>{(reg.r2*100).toFixed(1)}%</span>
            </div>
            <div style={{height:12,background:'linear-gradient(90deg,#ef4444,#f59e0b,#10b981)',borderRadius:6,position:'relative'}}>
              <div style={{position:'absolute',left:`${reg.r2*100}%`,top:'50%',transform:'translate(-50%,-50%)',width:18,height:18,borderRadius:'50%',background:'var(--bg-card)',border:`2.5px solid ${reg.r2>0.8?'#10b981':reg.r2>0.5?C:'#ef4444'}`,transition:'left .4s'}}/>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:9,color:'var(--text-3)',marginTop:4}}>
              <span>0% (no fit)</span><span>50% (moderate)</span><span>100% (perfect)</span>
            </div>
          </div>
          <BreakdownTable title="Regression results" rows={[
            {label:'Equation',value:`ŷ=${fmt(reg.slope)}x+${fmt(reg.intercept)}`,bold:true,highlight:true,color:C},
            {label:'Slope (m)',value:fmt(reg.slope),note:`y changes by ${fmt(reg.slope)} per x`,color:C},
            {label:'Intercept (b)',value:fmt(reg.intercept),note:'y when x=0'},
            {label:'R (correlation)',value:fmt(reg.r),color:'#10b981'},
            {label:'R² (explained var)',value:`${(reg.r2*100).toFixed(2)}%`,bold:true,color:'#10b981',highlight:true},
            {label:'RMSE',value:fmt(reg.rmse),note:'root mean sq error'},
            {label:'MAE',value:fmt(reg.mae),note:'mean abs error'},
            {label:`Predict at x=${predX}`,value:fmt(reg.predY),bold:true,color:'#f59e0b'},
          ]}/>
          <AIHintCard hint={`ŷ=${fmt(reg.slope)}x+${fmt(reg.intercept)}. R²=${fmt(reg.r2)} — model explains ${(reg.r2*100).toFixed(1)}% of variance. At x=${predX}, ŷ≈${fmt(reg.predY)}. RMSE=${fmt(reg.rmse)}.`} color={C}/>
        </>):<div style={{padding:'40px',textAlign:'center',color:'var(--text-3)'}}>Enter paired X and Y values</div>}
      </>}
    />
    {/* Residuals analysis */}
    {reg&&(<Sec title="📊 Residual Analysis — How well does the model fit?" sub="Observed minus predicted" color={C}>
      <p style={{fontSize:12,color:'var(--text-2)',lineHeight:1.7,marginBottom:14}}>Residuals = actual − predicted. A good model has residuals randomly scattered around zero with no pattern.</p>
      <div style={{overflowX:'auto'}}>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead><tr>{['i','X','Y (actual)','Ŷ (predicted)','Residual','|Error|'].map(h=>(<th key={h} style={{padding:'7px 10px',fontSize:11,fontWeight:700,color:'var(--text-3)',textAlign:'right',borderBottom:'1px solid var(--border)',background:'var(--bg-raised)'}}>{h}</th>))}</tr></thead>
          <tbody>{reg.x.map((xv,i)=>{
            const res=reg.residuals[i],pred=reg.predicted[i]
            return(<tr key={i} style={{background:i%2===0?'transparent':'var(--bg-raised)'}}>
              <td style={{padding:'5px 10px',fontSize:11,color:'var(--text-3)',textAlign:'right'}}>{i+1}</td>
              <td style={{padding:'5px 10px',fontSize:11,fontWeight:700,color:C,textAlign:'right',fontFamily:"'Space Grotesk',sans-serif"}}>{fmt(xv)}</td>
              <td style={{padding:'5px 10px',fontSize:11,color:'var(--text)',textAlign:'right',fontFamily:"'Space Grotesk',sans-serif"}}>{fmt(reg.y[i])}</td>
              <td style={{padding:'5px 10px',fontSize:11,color:C,textAlign:'right',fontFamily:"'Space Grotesk',sans-serif"}}>{fmt(pred)}</td>
              <td style={{padding:'5px 10px',fontSize:11,fontWeight:700,color:res>=0?'#10b981':'#ef4444',textAlign:'right',fontFamily:"'Space Grotesk',sans-serif"}}>{res>=0?'+':''}{fmt(res)}</td>
              <td style={{padding:'5px 10px',fontSize:11,color:'var(--text-2)',textAlign:'right',fontFamily:"'Space Grotesk',sans-serif"}}>{fmt(Math.abs(res))}</td>
            </tr>)
          })}</tbody>
          <tfoot><tr style={{ background: C + '08' }}>
            <td colSpan={4} style={{ padding: '7px 10px', fontSize: 12, fontWeight: 700, color: C, textAlign: 'right' }}>RMSE</td>
            <td style={{ padding: '7px 10px', fontSize: 12, fontWeight: 700, color: C, textAlign: 'right' }}>{fmt(reg.rmse)}</td>
            <td style={{ padding: '7px 10px', fontSize: 12, fontWeight: 700, color: C, textAlign: 'right' }}>MAE={fmt(reg.mae)}</td>
          </tr>
          </tfoot>
        </table>
      </div>
    </Sec>)}
    {/* Prediction table */}
    {reg&&(<Sec title="🔮 Prediction Table — Forecast multiple X values" sub="Based on regression equation" color={C}>
      <div style={{overflowX:'auto'}}>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead><tr>{['X value','Predicted Y','Equation'].map(h=>(<th key={h} style={{padding:'8px 10px',fontSize:11,fontWeight:700,color:'var(--text-3)',textAlign:'right',borderBottom:'1px solid var(--border)',background:'var(--bg-raised)'}}>{h}</th>))}</tr></thead>
          <tbody>{(() => {
            const xMin=Math.min(...reg.x),xMax=Math.max(...reg.x),range=xMax-xMin
            const steps=[xMin-range*0.2,xMin,reg.mx,(xMin+xMax)/2,xMax,xMax+range*0.2,predX].sort((a,b)=>a-b)
            return steps.map((xv,i)=>{
              const yv=reg.slope*xv+reg.intercept
              const isExtrap=xv<xMin||xv>xMax,isCurr=Math.abs(xv-predX)<0.01
              return(<tr key={i} style={{background:isCurr?C+'10':i%2===0?'transparent':'var(--bg-raised)'}}>
                <td style={{padding:'7px 10px',fontSize:12,fontWeight:700,color:isCurr?'#f59e0b':isExtrap?'#ef4444':C,textAlign:'right',fontFamily:"'Space Grotesk',sans-serif"}}>{fmt(xv)}{isCurr?' ◀':isExtrap?' ⚠':''}</td>
                <td style={{padding:'7px 10px',fontSize:12,fontWeight:isCurr?700:400,color:isCurr?'#f59e0b':'var(--text)',textAlign:'right',fontFamily:"'Space Grotesk',sans-serif"}}>{fmt(yv)}</td>
                <td style={{padding:'7px 10px',fontSize:11,color:'var(--text-3)',textAlign:'right'}}>ŷ={fmt(reg.slope)}×{fmt(xv)}+{fmt(reg.intercept)}</td>
              </tr>)
            })
          })()}</tbody>
        </table>
      </div>
      <p style={{fontSize:11,color:'#ef4444',margin:'10px 0 0'}}>⚠️ = Extrapolation (outside training data range) — predictions less reliable.</p>
    </Sec>)}
    {/* Assumptions */}
    <Sec title="✅ Regression Assumptions Checklist" sub="Verify before trusting your model" color={C}>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
        {[{icon:'📈',title:'Linearity',desc:'Plot Y vs X. Should look like a straight-line relationship, not curved. If curved, try transformations (log X, √Y).',color:C},{icon:'🎲',title:'Independence',desc:'Each observation collected independently. Time series data often violates this — check for autocorrelation in residuals.',color:'#10b981'},{icon:'📏',title:'Homoscedasticity',desc:'Residuals should have constant spread. Plot residuals vs fitted values — should show random cloud, not funnel shape.',color:'#f59e0b'},{icon:'🔔',title:'Normality',desc:'Residuals approximately normal. Check QQ plot. Violated by heavy-tailed data. Less critical for large n (CLT).',color:'#8b5cf6'}].map((a,i)=>(<div key={i} style={{padding:'12px',borderRadius:10,background:a.color+'08',border:`1px solid ${a.color}25`}}><div style={{display:'flex',gap:8,alignItems:'center',marginBottom:6}}><span style={{fontSize:18}}>{a.icon}</span><span style={{fontSize:12,fontWeight:700,color:a.color}}>{a.title}</span></div><p style={{fontSize:11,color:'var(--text-2)',lineHeight:1.5,margin:0}}>{a.desc}</p></div>))}
      </div>
    </Sec>
    <Sec title="Frequently asked questions" color={C}>{FAQ.map((f,i)=><Acc key={i} q={f.q} a={f.a} open={openFaq===i} onToggle={()=>setFaq(openFaq===i?null:i)} color={C}/>)}</Sec>
  </div>)
}
