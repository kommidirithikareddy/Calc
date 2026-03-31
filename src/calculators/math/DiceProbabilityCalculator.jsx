import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'
const fmt = n => parseFloat(Number(n).toFixed(6)).toString()
const fmtP = n => (n*100).toFixed(4)+'%'
function Sec({title,sub,children}){return(<div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,overflow:'hidden'}}><div style={{padding:'13px 18px',borderBottom:'0.5px solid var(--border)',display:'flex',justifyContent:'space-between'}}><span style={{fontSize:13,fontWeight:700,color:'var(--text)',fontFamily:"'Space Grotesk',sans-serif"}}>{title}</span>{sub&&<span style={{fontSize:11,color:'var(--text-3)'}}>{sub}</span>}</div><div style={{padding:'16px 18px'}}>{children}</div></div>)}
function Acc({q,a,open,onToggle,color}){return(<div style={{borderBottom:'0.5px solid var(--border)'}}><button onClick={onToggle} style={{width:'100%',display:'flex',justifyContent:'space-between',alignItems:'center',padding:'13px 0',background:'none',border:'none',cursor:'pointer',gap:12,textAlign:'left'}}><span style={{fontSize:13,fontWeight:600,color:'var(--text)',fontFamily:"'DM Sans',sans-serif",lineHeight:1.4}}>{q}</span><span style={{fontSize:18,color,flexShrink:0,transform:open?'rotate(45deg)':'none',transition:'transform .2s'}}>+</span></button>{open&&<p style={{fontSize:12.5,color:'var(--text-2)',lineHeight:1.75,margin:'0 0 13px'}}>{a}</p>}</div>)}
const FAQ=[
  {q:'How do I calculate the probability of rolling a sum on multiple dice?',a:'For n dice each with s sides, the total outcomes = sⁿ. To count outcomes summing to k, use generating functions or enumerate. For 2 standard dice: outcomes for sum=7 are (1,6),(2,5),(3,4),(4,3),(5,2),(6,1) = 6 ways, P = 6/36 = 1/6. Sum 7 is the most likely for 2d6.'},
  {q:'Why is sum=7 the most likely for 2d6?',a:'There are more ways to make 7 than any other sum: 6 combinations. Sum 2 has only 1 way (1+1), sum 12 has only 1 way (6+6). The distribution is triangular — symmetric around the mean (3.5+3.5=7). This is why 7 is so important in games like Craps.'},
  {q:'What is the expected value of a die roll?',a:'For a fair s-sided die: E = (1+2+...+s)/s = (s+1)/2. For d6: E = 3.5. For n dice: E = n×(s+1)/2. The variance for one die is (s²−1)/12. For 2d6: E = 7, variance = 2×35/12 = 5.83, std dev ≈ 2.42.'},
  {q:'What does "at least one" probability mean?',a:"P(at least one success) = 1 − P(no success). For rolling at least one 6 in 4 rolls: P = 1 − (5/6)⁴ ≈ 52%. This complement approach is almost always easier than summing P(exactly 1) + P(exactly 2) + ... directly."},
]
export default function DiceProbabilityCalculator({meta,category}){
  const C=category?.color||'#6366f1'
  const[numDice,setNumDice]=useState(2)
  const[sides,setSides]=useState(6)
  const[target,setTarget]=useState(7)
  const[openFaq,setFaq]=useState(null)
  const[simResults,setSimResults]=useState(null)
  const[simN,setSimN]=useState(1000)
  const[rolledDice,setRolledDice]=useState(null)
  const D=Math.max(1,Math.min(numDice,4))
  const S=Math.max(2,Math.min(sides,20))
  const T=Math.max(D,Math.min(target,D*S))
  const totalOutcomes=Math.pow(S,D)
  // Count ways to get sum T with D dice of S sides (DP)
  function countWays(dice,s,targetSum){
    let dp=new Array(targetSum+1).fill(0)
    dp[0]=1
    for(let d=0;d<dice;d++){const ndp=new Array(targetSum+1).fill(0);for(let i=0;i<=targetSum;i++){if(dp[i]===0)continue;for(let face=1;face<=s;face++){if(i+face<=targetSum)ndp[i+face]+=dp[i]}};dp=ndp}
    return dp[targetSum]||0
  }
  const ways=countWays(D,S,T)
  const probExact=ways/totalOutcomes
  // Distribution for all possible sums
  const minSum=D, maxSum=D*S
  const distribution=[]
  for(let s=minSum;s<=maxSum;s++){const w=countWays(D,S,s);distribution.push({sum:s,ways:w,prob:w/totalOutcomes})}
  const expectedSum=D*(S+1)/2
  const probAtLeast=distribution.filter(d=>d.sum>=T).reduce((a,d)=>a+d.prob,0)
  const probAtMost=distribution.filter(d=>d.sum<=T).reduce((a,d)=>a+d.prob,0)
  const maxProb=Math.max(...distribution.map(d=>d.prob))
  function rollDice(){const rolls=Array.from({length:D},()=>Math.floor(Math.random()*S)+1);setRolledDice(rolls)}
  function simulate(){const results=Array.from({length:simN},()=>Array.from({length:D},()=>Math.floor(Math.random()*S)+1).reduce((a,v)=>a+v,0));const hits=results.filter(v=>v===T).length;setSimResults({hits,miss:simN-hits,empirical:hits/simN})}
  const DICE_FACES={4:'▲',6:'⬡',8:'♦',10:'●',12:'⬟',20:'★'}
  return(<div style={{display:'flex',flexDirection:'column',gap:20}}>
    <div style={{background:`linear-gradient(135deg,${C}12,${C}06)`,border:`1px solid ${C}30`,borderRadius:14,padding:'16px 20px',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12}}>
      <div>
        <div style={{fontSize:10,fontWeight:700,color:C,textTransform:'uppercase',letterSpacing:'.08em',marginBottom:6}}>Dice Probability Calculator</div>
        <div style={{fontSize:22,fontWeight:700,color:C,fontFamily:"'Space Grotesk',sans-serif"}}>P(sum={T}) with {D}d{S}</div>
        <div style={{fontSize:11,color:'var(--text-3)',marginTop:4}}>{ways} ways out of {totalOutcomes.toLocaleString()} outcomes</div>
      </div>
      <div style={{padding:'10px 20px',background:C+'18',borderRadius:12,textAlign:'center'}}>
        <div style={{fontSize:11,color:'var(--text-3)',marginBottom:2}}>P(sum = {T})</div>
        <div style={{fontSize:32,fontWeight:700,color:C,fontFamily:"'Space Grotesk',sans-serif"}}>{fmtP(probExact)}</div>
      </div>
    </div>
    {/* Dice type selector */}
    <div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,padding:'14px 18px'}}>
      <div style={{fontSize:12,fontWeight:600,color:'var(--text-2)',marginBottom:12}}>Select dice type</div>
      <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
        {[4,6,8,10,12,20].map(s=>(<button key={s} onClick={()=>setSides(s)} style={{padding:'10px 16px',borderRadius:10,border:`1.5px solid ${S===s?C:'var(--border)'}`,background:S===s?C+'12':'var(--bg-raised)',cursor:'pointer',textAlign:'center'}}><div style={{fontSize:18,marginBottom:2}}>{DICE_FACES[s]||'●'}</div><div style={{fontSize:11,fontWeight:700,color:S===s?C:'var(--text-2)'}}>d{s}</div></button>))}
      </div>
    </div>
    <CalcShell
      left={<>
        <div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:16,paddingBottom:8,borderBottom:'0.5px solid var(--border)'}}>Parameters</div>
        <div style={{marginBottom:14}}>
          <div style={{fontSize:12.5,fontWeight:600,color:'var(--text)',marginBottom:8}}>Number of dice</div>
          <div style={{display:'flex',gap:6}}>{[1,2,3,4].map(d=>(<button key={d} onClick={()=>setNumDice(d)} style={{flex:1,padding:'10px',borderRadius:10,border:`1.5px solid ${D===d?C:'var(--border)'}`,background:D===d?C:'var(--bg-raised)',color:D===d?'#fff':'var(--text-2)',cursor:'pointer',fontSize:14,fontWeight:700}}>{d}</button>))}</div>
        </div>
        <div style={{marginBottom:14}}>
          <div style={{fontSize:12.5,fontWeight:600,color:'var(--text)',marginBottom:8}}>Target sum</div>
          <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
            {[D,Math.round(expectedSum),D*S].map((t,i)=>(<button key={i} onClick={()=>setTarget(t)} style={{padding:'7px 12px',borderRadius:20,fontSize:11,fontWeight:600,border:'1.5px solid',borderColor:T===t?C:'var(--border)',background:T===t?C:'var(--bg-raised)',color:T===t?'#fff':'var(--text-2)',cursor:'pointer'}}>{t===D?'Min':t===D*S?'Max':'Mean'} ({t})</button>))}
          </div>
          <div style={{display:'flex',height:44,border:`1.5px solid ${C}20`,borderRadius:9,overflow:'hidden',background:'var(--bg-card)',marginTop:8}}><input type="number" value={target} onChange={e=>setTarget(Math.max(D,Math.min(D*S,Number(e.target.value))))} style={{flex:1,border:'none',background:'transparent',padding:'0 14px',fontSize:17,fontWeight:700,color:'var(--text)',outline:'none',fontFamily:"'Space Grotesk',sans-serif"}}/></div>
        </div>
        <div style={{padding:'10px 14px',background:C+'08',borderRadius:10,border:`1px solid ${C}20`,marginBottom:14}}>
          <div style={{fontSize:12,fontWeight:700,color:C}}>P(sum={T}) = {ways}/{totalOutcomes.toLocaleString()} = {fmtP(probExact)}</div>
          <div style={{fontSize:11,color:'var(--text-2)',marginTop:3}}>Expected sum: {D}×(({S}+1)/2) = {fmt(expectedSum)}</div>
        </div>
        <div style={{display:'flex',gap:10}}>
          <button style={{flex:1,padding:13,borderRadius:10,border:'none',background:C,color:'#fff',fontSize:14,fontWeight:700,cursor:'pointer'}}>Calculate →</button>
          <button onClick={()=>{setNumDice(2);setSides(6);setTarget(7)}} style={{padding:'13px 18px',borderRadius:10,border:'1.5px solid var(--border-2)',background:'var(--bg-raised)',color:'var(--text-2)',fontSize:13,fontWeight:500,cursor:'pointer'}}>Reset</button>
        </div>
      </>}
      right={<>
        <div style={{background:'var(--bg-card)',border:`1.5px solid ${C}30`,borderRadius:14,padding:'18px 20px',marginBottom:14}}>
          <div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',marginBottom:8}}>P(sum = {T}) with {D}d{S}</div>
          <div style={{fontSize:38,fontWeight:700,color:C,fontFamily:"'Space Grotesk',sans-serif"}}>{fmtP(probExact)}</div>
          <div style={{fontSize:12,color:'var(--text-3)',marginTop:6}}>{ways} ways / {totalOutcomes.toLocaleString()} outcomes</div>
        </div>
        <BreakdownTable title="Probability Summary" rows={[
          {label:`P(sum = ${T}) exact`,value:fmtP(probExact),bold:true,highlight:true,color:C},
          {label:`P(sum ≥ ${T})`,value:fmtP(probAtLeast),color:'#10b981'},
          {label:`P(sum ≤ ${T})`,value:fmtP(probAtMost),color:'#f59e0b'},
          {label:`P(sum ≠ ${T})`,value:fmtP(1-probExact),color:'#ef4444'},
          {label:'Expected sum',value:fmt(expectedSum)},
          {label:'Min sum',value:String(D)},
          {label:'Max sum',value:String(D*S)},
          {label:'Total outcomes',value:totalOutcomes.toLocaleString()},
        ]}/>
        <AIHintCard hint={`P(rolling sum=${T} with ${D}d${S}) = ${fmtP(probExact)}. Expected sum = ${fmt(expectedSum)}. P(≥${T}) = ${fmtP(probAtLeast)}.`} color={C}/>
      </>}
    />
    {/* Interactive: Roll dice */}
    <Sec title="🎲 Interactive Dice Roller" sub="Click to roll and see your result">
      <div style={{display:'flex',gap:12,justifyContent:'center',marginBottom:16,minHeight:70,alignItems:'center'}}>
        {rolledDice?rolledDice.map((v,i)=>(<div key={i} style={{width:60,height:60,background:C+'15',border:`2px solid ${C}`,borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,fontWeight:700,color:C,fontFamily:"'Space Grotesk',sans-serif",transition:'all .3s'}}>{v}</div>)):<div style={{fontSize:13,color:'var(--text-3)'}}>Click Roll to throw the dice!</div>}
      </div>
      {rolledDice&&<div style={{textAlign:'center',marginBottom:14}}><span style={{fontSize:16,fontWeight:700,color:C}}>Sum = {rolledDice.reduce((a,v)=>a+v,0)}</span><span style={{fontSize:13,color:'var(--text-3)',marginLeft:8}}>{rolledDice.reduce((a,v)=>a+v,0)===T?'🎯 Hit your target!':'Miss'}</span></div>}
      <button onClick={rollDice} style={{width:'100%',padding:13,borderRadius:10,border:'none',background:C,color:'#fff',fontSize:14,fontWeight:700,cursor:'pointer'}}>🎲 Roll {D}d{S}</button>
    </Sec>
    {/* Interactive: Simulator */}
    <Sec title="📊 Probability Distribution — All Sums" sub={`${D}d${S}: all possible outcomes`}>
      <div style={{display:'flex',flexDirection:'column',gap:4,marginBottom:14}}>
        {distribution.map((d,i)=>(<div key={i} style={{display:'flex',alignItems:'center',gap:8}}>
          <div style={{width:28,fontSize:11,fontWeight:700,color:d.sum===T?C:'var(--text-2)',textAlign:'right',flexShrink:0}}>{d.sum}</div>
          <div style={{flex:1,height:16,background:'var(--bg-raised)',borderRadius:4,overflow:'hidden'}}>
            <div style={{width:`${(d.prob/maxProb)*100}%`,height:'100%',background:d.sum===T?C:C+'50',borderRadius:4,transition:'width .3s'}}/>
          </div>
          <div style={{width:50,fontSize:10,color:d.sum===T?C:'var(--text-3)',textAlign:'right',flexShrink:0}}>{fmtP(d.prob)}</div>
        </div>))}
      </div>
      <div style={{padding:'10px 14px',background:C+'08',borderRadius:9,border:`1px solid ${C}20`}}>
        <div style={{fontSize:11,color:'var(--text-2)',lineHeight:1.7}}>
          Most likely sum: <strong style={{color:C}}>{distribution.reduce((a,d)=>d.prob>a.prob?d:a).sum}</strong> ({fmtP(maxProb)}). Expected: {fmt(expectedSum)}. Your target {T}: <strong style={{color:C}}>{fmtP(probExact)}</strong>
        </div>
      </div>
    </Sec>
    {/* Monte Carlo */}
    <Sec title="🎰 Monte Carlo Simulation" sub="Run thousands of virtual dice rolls">
      <div style={{display:'flex',gap:8,marginBottom:14,flexWrap:'wrap'}}>
        {[100,500,1000,5000,10000].map(k=>(<button key={k} onClick={()=>{setSimN(k);setSimResults(null)}} style={{padding:'7px 14px',borderRadius:20,fontSize:11,fontWeight:600,border:'1.5px solid',borderColor:simN===k?C:'var(--border)',background:simN===k?C:'var(--bg-raised)',color:simN===k?'#fff':'var(--text-2)',cursor:'pointer'}}>{k.toLocaleString()}</button>))}
      </div>
      <button onClick={simulate} style={{width:'100%',padding:13,borderRadius:10,border:'none',background:C,color:'#fff',fontSize:14,fontWeight:700,cursor:'pointer',marginBottom:14}}>▶ Simulate {simN.toLocaleString()} Rolls</button>
      {simResults&&(<div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10}}>
        {[['Hits (sum='+T+')',simResults.hits,C],['Misses',simResults.miss,'#ef4444'],['Empirical P',fmtP(simResults.empirical),'#10b981']].map(([label,val,col])=>(<div key={label} style={{padding:'12px',background:col+'10',borderRadius:10,border:`1px solid ${col}25`,textAlign:'center'}}><div style={{fontSize:10,color:'var(--text-3)',marginBottom:4}}>{label}</div><div style={{fontSize:20,fontWeight:700,color:col}}>{typeof val==='number'?val.toLocaleString():val}</div></div>))}
        <div style={{gridColumn:'1/-1',padding:'10px 14px',background:'var(--bg-raised)',borderRadius:10,border:'0.5px solid var(--border)'}}>
          <div style={{display:'flex',justifyContent:'space-between'}}><span style={{fontSize:12,color:'var(--text)'}}>Theoretical: {fmtP(probExact)}</span><span style={{fontSize:12,color:'var(--text)'}}>Empirical: {fmtP(simResults.empirical)}</span><span style={{fontSize:12,color:Math.abs(simResults.empirical-probExact)<0.05?'#10b981':'#f59e0b'}}>Diff: {fmtP(Math.abs(simResults.empirical-probExact))}</span></div>
        </div>
      </div>)}
    </Sec>
    <Sec title="Frequently asked questions">{FAQ.map((f,i)=><Acc key={i} q={f.q} a={f.a} open={openFaq===i} onToggle={()=>setFaq(openFaq===i?null:i)} color={C}/>)}</Sec>
  </div>)
}
