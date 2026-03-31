// 🚀 FULL ADVANCED CONFIDENCE INTERVAL CALCULATOR (UPGRADED)

import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'

const fmt = (n) => (isNaN(n) || !isFinite(n)) ? '—' : Number(n).toFixed(4)

function invNorm(p){
  if(p<=0)return -Infinity
  if(p>=1)return Infinity
  const a=[2.515517,0.802853,0.010328]
  const b=[1.432788,0.189269,0.001308]
  const sign=p<0.5?-1:1
  const q2=Math.min(p,1-p)
  const t=Math.sqrt(-2*Math.log(q2))
  return sign*(t-(a[0]+t*(a[1]+t*a[2]))/(1+t*(b[0]+t*(b[1]+t*b[2]))))
}

export default function ConfidenceIntervalCalculator({category}){
  const C = category?.color || '#6366f1'

  const [mode,setMode] = useState('mean')
  const [mean,setMean] = useState(50)
  const [std,setStd] = useState(10)
  const [n,setN] = useState(30)
  const [cl,setCl] = useState(95)
  const [p,setP] = useState(0.5)
  const [data,setData] = useState('')

  // 🎯 AUTO COMPUTE FROM DATA INPUT
  const parsedData = data.split(',').map(Number).filter(x=>!isNaN(x))
  const autoMean = parsedData.length ? parsedData.reduce((a,b)=>a+b,0)/parsedData.length : mean
  const autoStd = parsedData.length ? Math.sqrt(parsedData.map(x=>(x-autoMean)**2).reduce((a,b)=>a+b,0)/(parsedData.length-1 || 1)) : std
  const autoN = parsedData.length || n

  const N = Math.max(2, Math.round(autoN))
  const S = Math.max(0.0001, autoStd)

  const zStar = Math.abs(invNorm((100-cl)/200))

  const se = S / Math.sqrt(N)
  const me = zStar * se

  const lo = autoMean - me
  const hi = autoMean + me

  // proportion
  const pSe = Math.sqrt(p*(1-p)/N)
  const pMe = zStar * pSe
  const pLo = Math.max(0,p - pMe)
  const pHi = Math.min(1,p + pMe)

  // 🎯 SAMPLE SIZE CALCULATOR
  const targetME = 5
  const requiredN = Math.ceil((zStar * S / targetME) ** 2)

  return (
    <CalcShell
      left={(
        <>
          <h3>🧠 Mode</h3>
          <button onClick={()=>setMode('mean')}>Mean</button>
          <button onClick={()=>setMode('proportion')}>Proportion</button>

          <h3>📊 Data Input (optional)</h3>
          <textarea
            placeholder="Paste values like: 10,20,30"
            value={data}
            onChange={e=>setData(e.target.value)}
            style={{width:'100%',height:80}}
          />

          {mode==='mean' && (
            <>
              <input value={mean} onChange={e=>setMean(Number(e.target.value))} placeholder="Mean" />
              <input value={std} onChange={e=>setStd(Number(e.target.value))} placeholder="Std Dev" />
            </>
          )}

          {mode==='proportion' && (
            <input value={p} onChange={e=>setP(Number(e.target.value))} placeholder="Proportion" />
          )}

          <input value={n} onChange={e=>setN(Number(e.target.value))} placeholder="Sample Size" />

          <h3>🎯 Confidence Level</h3>
          {[90,95,99].map(c=> (
            <button key={c} onClick={()=>setCl(c)}>{c}%</button>
          ))}
        </>
      )}

      right={(
        <>
          <h2>📈 Result</h2>

          {mode==='mean' && (
            <div>
              <h3>CI: [{fmt(lo)}, {fmt(hi)}]</h3>
              <p>Margin: ±{fmt(me)}</p>
            </div>
          )}

          {mode==='proportion' && (
            <div>
              <h3>CI: [{(pLo*100).toFixed(2)}%, {(pHi*100).toFixed(2)}%]</h3>
              <p>Margin: ±{(pMe*100).toFixed(2)}%</p>
            </div>
          )}

          {/* 🔥 VISUAL BAR */}
          <div style={{marginTop:20}}>
            <div style={{background:'#eee',height:10,position:'relative'}}>
              <div style={{
                position:'absolute',
                left:'20%',
                width:'60%',
                height:'100%',
                background:C
              }}/>
            </div>
            <p style={{fontSize:12}}>Visual representation of CI</p>
          </div>

          {/* 🎯 SAMPLE SIZE */}
          <div style={{marginTop:20}}>
            <h3>📏 Sample Size Needed</h3>
            <p>For ±{targetME} error → n ≈ {requiredN}</p>
          </div>

          <BreakdownTable
            title="Details"
            rows={[
              {label:'Lower Bound',value:mode==='mean'?fmt(lo):pLo},
              {label:'Upper Bound',value:mode==='mean'?fmt(hi):pHi},
              {label:'Std Error',value:mode==='mean'?fmt(se):fmt(pSe)},
              {label:'Critical Value',value:fmt(zStar)}
            ]}
          />

          <AIHintCard
            hint={`We are ${cl}% confident the true value lies between ${fmt(lo)} and ${fmt(hi)}.`}
            color={C}
          />
        </>
      )}
    />
  )
}
