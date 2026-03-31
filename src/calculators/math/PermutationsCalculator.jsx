import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'
const fmt = n => (isNaN(n)||!isFinite(n))? '—' : n > 1e15 ? n.toExponential(3) : Math.round(n).toLocaleString()
function factorial(n){if(n<0||!isFinite(n))return Infinity;if(n===0||n===1)return 1;if(n>170)return Infinity;let r=1;for(let i=2;i<=n;i++)r*=i;return r}
function nPr(n,r){if(r>n||r<0)return 0;return factorial(n)/factorial(n-r)}
function Sec({title,sub,children}){return(<div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,overflow:'hidden'}}><div style={{padding:'13px 18px',borderBottom:'0.5px solid var(--border)',display:'flex',justifyContent:'space-between'}}><span style={{fontSize:13,fontWeight:700,color:'var(--text)',fontFamily:"'Space Grotesk',sans-serif"}}>{title}</span>{sub&&<span style={{fontSize:11,color:'var(--text-3)'}}>{sub}</span>}</div><div style={{padding:'16px 18px'}}>{children}</div></div>)}
function Acc({q,a,open,onToggle,color}){return(<div style={{borderBottom:'0.5px solid var(--border)'}}><button onClick={onToggle} style={{width:'100%',display:'flex',justifyContent:'space-between',alignItems:'center',padding:'13px 0',background:'none',border:'none',cursor:'pointer',gap:12,textAlign:'left'}}><span style={{fontSize:13,fontWeight:600,color:'var(--text)',fontFamily:"'DM Sans',sans-serif",lineHeight:1.4}}>{q}</span><span style={{fontSize:18,color,flexShrink:0,transform:open?'rotate(45deg)':'none',transition:'transform .2s'}}>+</span></button>{open&&<p style={{fontSize:12.5,color:'var(--text-2)',lineHeight:1.75,margin:'0 0 13px'}}>{a}</p>}</div>)}
function Inp({label,value,onChange,color,hint}){const[f,sf]=useState(false);return(<div style={{marginBottom:14}}><div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}><label style={{fontSize:12.5,fontWeight:600,color:'var(--text)',fontFamily:"'DM Sans',sans-serif"}}>{label}</label>{hint&&<span style={{fontSize:10,color:'var(--text-3)'}}>{hint}</span>}</div><div style={{display:'flex',height:44,border:`1.5px solid ${f?color:'var(--border-2)'}`,borderRadius:9,overflow:'hidden',background:'var(--bg-card)'}}><input type="number" value={value} onChange={e=>onChange(Math.max(0,Math.round(Number(e.target.value))))} onFocus={()=>sf(true)} onBlur={()=>sf(false)} style={{flex:1,border:'none',background:'transparent',padding:'0 14px',fontSize:17,fontWeight:700,color:'var(--text)',outline:'none',fontFamily:"'Space Grotesk',sans-serif"}}/></div></div>)}
const FAQ=[
  {q:'What is a permutation?',a:'A permutation is an arrangement of items where order matters. Selecting 3 officers (President, VP, Treasurer) from 10 candidates is a permutation — the order of selection determines who gets which role. P(n,r) = n!/(n−r)! counts all ordered arrangements of r items from n.'},
  {q:'Why does order matter in permutations?',a:'Because different orders represent different outcomes. {A,B,C} and {C,B,A} are the same combination but different permutations — in the first, A is President; in the second, C is. Whenever the roles or positions of items differ based on sequence, use permutations.'},
  {q:'What is the difference between permutations with and without repetition?',a:'Without repetition (default): once an item is selected, it cannot be reused. P(n,r) = n!/(n−r)!. With repetition: each position can be any of the n items. Count = nʳ. Example: 3-digit PIN with digits 0-9, repetition allowed = 10³ = 1000 possibilities.'},
  {q:'What is a circular permutation?',a:'Arrangements in a circle where rotations are considered identical. Circular permutations of n objects = (n−1)!. Seating 5 people at a round table: (5−1)! = 24 arrangements (vs 120 for a line, because rotating everyone one seat gives the same circle).'},
  {q:'Real-world examples of permutations?',a:'Scheduling (order of tasks matters). Race positions (1st, 2nd, 3rd from n runners = P(n,3)). Passwords/PIN codes. Arranging books on a shelf. Lock combinations (actually permutations — order matters!). Tournament brackets.'},
]
export default function PermutationsCalculator({meta,category}){
  const C=category?.color||'#6366f1'
  const[n,setN]=useState(10)
  const[r,setR]=useState(3)
  const[openFaq,setFaq]=useState(null)
  const[openGloss,setGl]=useState(null)
  const[showViz,setShowViz]=useState(false)
  const R=Math.min(r,n)
  const result=nPr(n,R)
  const withRep=Math.pow(n,R)
  const circular=R===n&&n>0?factorial(n-1):null
  const nCr_val=factorial(n)/(factorial(R)*factorial(n-R))

  // Generate example permutations for small n,r
  const letters='ABCDEFGHIJ'.slice(0,Math.min(n,6))
  function getPerm(arr,r,all=[]){if(r===0)return[[]];const res=[];for(let i=0;i<arr.length;i++){const rest=arr.filter((_,j)=>j!==i);getPerm(rest,r-1).forEach(p=>res.push([arr[i],...p]))}return res}
  const examplePerms=n<=6&&R<=3?getPerm(letters.split(''),R).slice(0,12):[]

  return(<div style={{display:'flex',flexDirection:'column',gap:20}}>
    <div style={{background:`linear-gradient(135deg,${C}12,${C}06)`,border:`1px solid ${C}30`,borderRadius:14,padding:'16px 20px',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12}}>
      <div>
        <div style={{fontSize:10,fontWeight:700,color:C,textTransform:'uppercase',letterSpacing:'.08em',marginBottom:6}}>Permutations — Order Matters</div>
        <div style={{fontSize:22,fontWeight:700,color:C,fontFamily:"'Space Grotesk',sans-serif"}}>P(n,r) = n! / (n−r)!</div>
        <div style={{fontSize:11,color:'var(--text-3)',marginTop:4}}>Ordered arrangements of r items from n distinct items</div>
      </div>
      <div style={{padding:'10px 20px',background:C+'18',borderRadius:12,textAlign:'center'}}>
        <div style={{fontSize:11,color:'var(--text-3)',marginBottom:2}}>P({n},{R})</div>
        <div style={{fontSize:28,fontWeight:700,color:C,fontFamily:"'Space Grotesk',sans-serif"}}>{fmt(result)}</div>
      </div>
    </div>

    <div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,padding:'14px 18px'}}>
      <div style={{fontSize:12,fontWeight:600,color:'var(--text-2)',marginBottom:12}}>Common examples</div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8}}>
        {[{label:'Race top 3',n:8,r:3},{label:'Password 4-char',n:26,r:4},{label:'PIN 4-digit',n:10,r:4},{label:'Book arrangement',n:6,r:6}].map((ex,i)=>(<button key={i} onClick={()=>{setN(ex.n);setR(ex.r)}} style={{padding:'9px 6px',borderRadius:10,border:`1.5px solid ${n===ex.n&&R===ex.r?C:'var(--border-2)'}`,background:n===ex.n&&R===ex.r?C+'12':'var(--bg-raised)',cursor:'pointer',textAlign:'center'}}><div style={{fontSize:10,fontWeight:700,color:C}}>P({ex.n},{ex.r})</div><div style={{fontSize:9,color:'var(--text-3)'}}>{ex.label}</div></button>))}
      </div>
    </div>

    <CalcShell
      left={<>
        <div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:16,paddingBottom:8,borderBottom:'0.5px solid var(--border)'}}>Parameters</div>
        <Inp label="Total items (n)" value={n} onChange={setN} color={C} hint="pool size"/>
        <Inp label="Items to arrange (r)" value={r} onChange={v=>setR(Math.min(v,n))} color={C} hint="selection size"/>
        <div style={{padding:'12px 14px',background:C+'08',borderRadius:10,border:`1px solid ${C}20`,marginBottom:14}}>
          <div style={{fontSize:14,fontWeight:700,color:C,fontFamily:"'Space Grotesk',sans-serif"}}>P({n},{R}) = {n}! / ({n}−{R})!</div>
          <div style={{fontSize:13,color:'var(--text-2)',marginTop:4}}>= {fmt(factorial(n))} / {fmt(factorial(n-R))}</div>
          <div style={{fontSize:16,fontWeight:700,color:C,marginTop:4}}>= {fmt(result)}</div>
        </div>
        <div style={{padding:'12px 14px',background:'var(--bg-raised)',borderRadius:10,border:'0.5px solid var(--border)',marginBottom:14}}>
          <div style={{fontSize:11,fontWeight:700,color:'var(--text)',marginBottom:6}}>Step by step</div>
          <div style={{fontSize:11,color:'var(--text-2)',lineHeight:1.8}}>
            <div>n! = {n}! = {fmt(factorial(n))}</div>
            <div>(n−r)! = {n-R}! = {fmt(factorial(n-R))}</div>
            <div>P = {fmt(factorial(n))} ÷ {fmt(factorial(n-R))} = <strong style={{color:C}}>{fmt(result)}</strong></div>
          </div>
        </div>
        <div style={{display:'flex',gap:10}}>
          <button style={{flex:1,padding:13,borderRadius:10,border:'none',background:C,color:'#fff',fontSize:14,fontWeight:700,cursor:'pointer'}}>Calculate →</button>
          <button onClick={()=>{setN(10);setR(3)}} style={{padding:'13px 18px',borderRadius:10,border:'1.5px solid var(--border-2)',background:'var(--bg-raised)',color:'var(--text-2)',fontSize:13,fontWeight:500,cursor:'pointer'}}>Reset</button>
        </div>
      </>}
      right={<>
        <div style={{background:'var(--bg-card)',border:`1.5px solid ${C}30`,borderRadius:14,padding:'18px 20px',marginBottom:14}}>
          <div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',marginBottom:8}}>P({n},{R})</div>
          <div style={{fontSize:38,fontWeight:700,color:C,fontFamily:"'Space Grotesk',sans-serif"}}>{fmt(result)}</div>
          <div style={{fontSize:12,color:'var(--text-3)',marginTop:6}}>ordered arrangements</div>
        </div>
        <BreakdownTable title="Comparison" rows={[
          {label:'P(n,r) — without repetition',value:fmt(result),bold:true,highlight:true,color:C},
          {label:'nʳ — with repetition',value:fmt(withRep),color:'#10b981'},
          {label:'C(n,r) — combinations',value:fmt(nCr_val),note:'order ignored'},
          {label:'n! — all arrangements',value:fmt(factorial(n))},
          ...(circular!==null?[{label:'Circular permutations',value:fmt(circular),note:'(n−1)!'}]:[]),
          {label:'P/C ratio',value:fmt(R<=170?factorial(R):Infinity),note:`r! = ${R}!`},
        ]}/>
        <AIHintCard hint={`P(${n},${R}) = ${fmt(result)} ordered arrangements. With repetition: ${fmt(withRep)}. Combinations C(${n},${R}) = ${fmt(nCr_val)} (order ignored). Permutations = Combinations × r! = ${fmt(nCr_val)} × ${R}! = ${fmt(result)}.`} color={C}/>
      </>}
    />

    {/* Interactive: visualise permutations */}
    {n<=6&&R<=3&&(<Sec title="🔀 Interactive — See All Permutations" sub={`P(${n},${R}) = ${fmt(result)} arrangements shown`}>
      <button onClick={()=>setShowViz(v=>!v)} style={{padding:'10px 20px',borderRadius:10,border:`1.5px solid ${C}`,background:showViz?C:'var(--bg-raised)',color:showViz?'#fff':C,fontSize:12,fontWeight:700,cursor:'pointer',marginBottom:14}}>
        {showViz?'▲ Hide':'▼ Show'} all {fmt(result)} permutations
      </button>
      {showViz&&(<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(80px,1fr))',gap:8}}>
        {examplePerms.map((p,i)=>(<div key={i} style={{padding:'8px 10px',background:C+'10',border:`1px solid ${C}25`,borderRadius:8,textAlign:'center',fontSize:13,fontWeight:700,color:C,fontFamily:"'Space Grotesk',sans-serif"}}>{p.join('→')}</div>))}
      </div>)}
      <p style={{fontSize:11,color:'var(--text-3)',margin:'12px 0 0'}}>Each arrangement is different because ORDER matters. {letters[0]}→{letters[1]}→{letters[2]} ≠ {letters[2]}→{letters[1]}→{letters[0]}</p>
    </Sec>)}

    {/* Permutations vs Combinations visual */}
    <Sec title="📊 Permutations vs Combinations — Visual Comparison" sub="Same items, different counts">
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:14}}>
        {[{title:'Permutations P(n,r)',subtitle:'ORDER MATTERS',example:'ABC ≠ BAC ≠ CAB',formula:'n!/(n−r)!',count:fmt(result),icon:'🔢',color:C},{title:'Combinations C(n,r)',subtitle:'ORDER IGNORED',example:'ABC = BAC = CAB',formula:'n!/(r!(n−r)!)',count:fmt(nCr_val),icon:'🔵',color:'#10b981'}].map((card,i)=>(<div key={i} style={{padding:'14px',borderRadius:12,background:card.color+'08',border:`1.5px solid ${card.color}25`}}><div style={{fontSize:22,marginBottom:6}}>{card.icon}</div><div style={{fontSize:12,fontWeight:700,color:card.color,marginBottom:3}}>{card.title}</div><div style={{fontSize:10,fontWeight:700,color:'var(--text)',marginBottom:6}}>{card.subtitle}</div><div style={{fontSize:10,color:'var(--text-3)',marginBottom:8,fontStyle:'italic'}}>{card.example}</div><div style={{fontSize:11,color:card.color,fontFamily:"'Space Grotesk',sans-serif",marginBottom:4}}>{card.formula}</div><div style={{fontSize:22,fontWeight:700,color:card.color,fontFamily:"'Space Grotesk',sans-serif"}}>{card.count}</div></div>))}
      </div>
      <p style={{fontSize:12,color:'var(--text-2)',lineHeight:1.75,margin:0}}>Permutations = Combinations × r! because each combination of r items can be arranged in r! ways. P({n},{R}) = C({n},{R}) × {R}! = {fmt(nCr_val)} × {fmt(factorial(R))} = {fmt(result)}.</p>
    </Sec>

    {/* n vs P(n,r) table */}
    <Sec title="📈 Growth table — how P(n,r) scales with n" sub="r = 3 fixed">
      <div style={{overflowX:'auto'}}>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead><tr>{['n','P(n,1)','P(n,2)','P(n,3)','P(n,n) = n!'].map(h=>(<th key={h} style={{padding:'8px 10px',fontSize:11,fontWeight:700,color:'var(--text-3)',textAlign:'right',borderBottom:'1px solid var(--border)',background:'var(--bg-raised)'}}>{h}</th>))}</tr></thead>
          <tbody>{[3,4,5,6,8,10,12].map((k,i)=>(<tr key={i} style={{background:k===n?C+'08':i%2===0?'transparent':'var(--bg-raised)'}}><td style={{padding:'7px 10px',fontSize:12,fontWeight:k===n?700:400,color:k===n?C:'var(--text)',textAlign:'right'}}>{k}{k===n?' ✓':''}</td>{[1,2,3].map(rk=>(<td key={rk} style={{padding:'7px 10px',fontSize:11,color:rk===3&&k===n?C:'var(--text-2)',fontWeight:rk===3&&k===n?700:400,textAlign:'right',fontFamily:"'Space Grotesk',sans-serif"}}>{fmt(nPr(k,Math.min(rk,k)))}</td>))}<td style={{padding:'7px 10px',fontSize:11,color:'var(--text-3)',textAlign:'right',fontFamily:"'Space Grotesk',sans-serif"}}>{fmt(factorial(k))}</td></tr>))}</tbody>
        </table>
      </div>
    </Sec>

    <Sec title="Frequently asked questions">{FAQ.map((f,i)=><Acc key={i} q={f.q} a={f.a} open={openFaq===i} onToggle={()=>setFaq(openFaq===i?null:i)} color={C}/>)}</Sec>
  </div>)
}
