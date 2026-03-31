import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'
const fmt = n => (isNaN(n)||!isFinite(n))? '—' : n > 1e15 ? n.toExponential(3) : Math.round(n).toLocaleString()
function factorial(n){if(n<=1)return 1;if(n>170)return Infinity;let r=1;for(let i=2;i<=n;i++)r*=i;return r}
function nCr(n,r){if(r>n||r<0)return 0;return factorial(n)/(factorial(r)*factorial(n-r))}
function Sec({title,sub,children}){return(<div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,overflow:'hidden'}}><div style={{padding:'13px 18px',borderBottom:'0.5px solid var(--border)',display:'flex',justifyContent:'space-between'}}><span style={{fontSize:13,fontWeight:700,color:'var(--text)',fontFamily:"'Space Grotesk',sans-serif"}}>{title}</span>{sub&&<span style={{fontSize:11,color:'var(--text-3)'}}>{sub}</span>}</div><div style={{padding:'16px 18px'}}>{children}</div></div>)}
function Acc({q,a,open,onToggle,color}){return(<div style={{borderBottom:'0.5px solid var(--border)'}}><button onClick={onToggle} style={{width:'100%',display:'flex',justifyContent:'space-between',alignItems:'center',padding:'13px 0',background:'none',border:'none',cursor:'pointer',gap:12,textAlign:'left'}}><span style={{fontSize:13,fontWeight:600,color:'var(--text)',fontFamily:"'DM Sans',sans-serif",lineHeight:1.4}}>{q}</span><span style={{fontSize:18,color,flexShrink:0,transform:open?'rotate(45deg)':'none',transition:'transform .2s'}}>+</span></button>{open&&<p style={{fontSize:12.5,color:'var(--text-2)',lineHeight:1.75,margin:'0 0 13px'}}>{a}</p>}</div>)}
function Inp({label,value,onChange,color,hint}){const[f,sf]=useState(false);return(<div style={{marginBottom:14}}><div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}><label style={{fontSize:12.5,fontWeight:600,color:'var(--text)',fontFamily:"'DM Sans',sans-serif"}}>{label}</label>{hint&&<span style={{fontSize:10,color:'var(--text-3)'}}>{hint}</span>}</div><div style={{display:'flex',height:44,border:`1.5px solid ${f?color:'var(--border-2)'}`,borderRadius:9,overflow:'hidden',background:'var(--bg-card)'}}><input type="number" value={value} onChange={e=>onChange(Math.max(0,Math.round(Number(e.target.value))))} onFocus={()=>sf(true)} onBlur={()=>sf(false)} style={{flex:1,border:'none',background:'transparent',padding:'0 14px',fontSize:17,fontWeight:700,color:'var(--text)',outline:'none',fontFamily:"'Space Grotesk',sans-serif"}}/></div></div>)}
const FAQ=[
  {q:'What is a combination?',a:'A combination is a selection of items where order does NOT matter. Choosing 3 students for a committee from 10 is a combination — the same 3 students regardless of the order selected. C(n,r) = n!/(r!(n−r)!) counts all unordered selections of r items from n.'},
  {q:'How do I know when to use combinations vs permutations?',a:"Ask: 'Does the order of selection change the outcome?' Choosing 3 toppings for a pizza — order doesn't matter (combinations). Choosing 1st, 2nd, 3rd place winners — order matters (permutations). Keywords for combinations: choose, select, committee, team, subset. Keywords for permutations: arrange, rank, schedule, order."},
  {q:'What is the combination identity C(n,r) = C(n,n−r)?',a:'Choosing r items to include is the same as choosing n−r items to exclude. C(10,3) = C(10,7) = 120. This symmetry is reflected in Pascal\'s Triangle — each row is symmetric. It also means calculating C(n,r) for r > n/2 can be simplified by using C(n, n-r) instead.'},
  {q:'What does C(n,r) count geometrically?',a:"C(n,2) counts the number of edges in a complete graph Kₙ (connecting every pair of n vertices). C(n,3) counts triangles in a complete graph. C(n,r) in general counts the number of r-element subsets of an n-element set — which is why it's called a 'binomial coefficient'."},
  {q:'Where do combinations appear in mathematics?',a:'Binomial Theorem: (a+b)ⁿ = Σ C(n,k) aⁿ⁻ᵏbᵏ. Pascal\'s Triangle: each entry is a sum of the two above. Probability: hypergeometric distribution uses combinations. Graph theory: counting subgraphs. Number theory: counting divisors.'},
]
export default function CombinationsCalculator({meta,category}){
  const C=category?.color||'#6366f1'
  const[n,setN]=useState(10)
  const[r,setR]=useState(3)
  const[openFaq,setFaq]=useState(null)
  const[openGloss,setGl]=useState(null)
  const[showCombs,setShowCombs]=useState(false)
  const R=Math.min(r,n)
  const result=nCr(n,R)
  const perm=factorial(n)/factorial(n-R)
  const complement=nCr(n,n-R)
  // Pascal triangle rows around R
  const pascalRows=Array.from({length:Math.min(n+1,9)},(_,row)=>Array.from({length:row+1},(_,col)=>nCr(row,col)))
  // Get all combos for small n,r
  const letters='ABCDEF'.slice(0,Math.min(n,6))
  function getCombos(arr,r){if(r===0)return[[]];if(arr.length===0)return[];const[first,...rest]=arr;return[...getCombos(rest,r-1).map(c=>[first,...c]),...getCombos(rest,r)]}
  const exampleCombos=n<=6&&R<=3?getCombos(letters.split(''),R).slice(0,15):[]
  return(<div style={{display:'flex',flexDirection:'column',gap:20}}>
    <div style={{background:`linear-gradient(135deg,${C}12,${C}06)`,border:`1px solid ${C}30`,borderRadius:14,padding:'16px 20px',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:12}}>
      <div>
        <div style={{fontSize:10,fontWeight:700,color:C,textTransform:'uppercase',letterSpacing:'.08em',marginBottom:6}}>Combinations — Order Does NOT Matter</div>
        <div style={{fontSize:22,fontWeight:700,color:C,fontFamily:"'Space Grotesk',sans-serif"}}>C(n,r) = n! / (r! · (n−r)!)</div>
        <div style={{fontSize:11,color:'var(--text-3)',marginTop:4}}>Unordered selections of r items from n distinct items</div>
      </div>
      <div style={{padding:'10px 20px',background:C+'18',borderRadius:12,textAlign:'center'}}>
        <div style={{fontSize:11,color:'var(--text-3)',marginBottom:2}}>C({n},{R})</div>
        <div style={{fontSize:28,fontWeight:700,color:C,fontFamily:"'Space Grotesk',sans-serif"}}>{fmt(result)}</div>
      </div>
    </div>
    <div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,padding:'14px 18px'}}>
      <div style={{fontSize:12,fontWeight:600,color:'var(--text-2)',marginBottom:12}}>Common examples</div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8}}>
        {[{label:'Lottery 6 of 49',n:49,r:6},{label:'Committee 4 of 10',n:10,r:4},{label:'5-card hand',n:52,r:5},{label:'Pizza 3 toppings',n:12,r:3}].map((ex,i)=>(<button key={i} onClick={()=>{setN(ex.n);setR(ex.r)}} style={{padding:'9px 6px',borderRadius:10,border:`1.5px solid ${n===ex.n&&R===ex.r?C:'var(--border-2)'}`,background:n===ex.n&&R===ex.r?C+'12':'var(--bg-raised)',cursor:'pointer',textAlign:'center'}}><div style={{fontSize:10,fontWeight:700,color:C}}>C({ex.n},{ex.r})</div><div style={{fontSize:9,color:'var(--text-3)'}}>{ex.label}</div></button>))}
      </div>
    </div>
    <CalcShell
      left={<>
        <div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.07em',marginBottom:16,paddingBottom:8,borderBottom:'0.5px solid var(--border)'}}>Parameters</div>
        <Inp label="Total items (n)" value={n} onChange={setN} color={C} hint="pool size"/>
        <Inp label="Items to choose (r)" value={r} onChange={v=>setR(Math.min(v,n))} color={C} hint="selection size"/>
        <div style={{padding:'12px 14px',background:C+'08',borderRadius:10,border:`1px solid ${C}20`,marginBottom:14}}>
          <div style={{fontSize:14,fontWeight:700,color:C,fontFamily:"'Space Grotesk',sans-serif"}}>C({n},{R}) = {n}! / ({R}! × {n-R}!)</div>
          <div style={{fontSize:13,color:'var(--text-2)',marginTop:4}}>= {fmt(factorial(n))} / ({fmt(factorial(R))} × {fmt(factorial(n-R))})</div>
          <div style={{fontSize:16,fontWeight:700,color:C,marginTop:4}}>= {fmt(result)}</div>
        </div>
        <div style={{padding:'12px 14px',background:'var(--bg-raised)',borderRadius:10,border:'0.5px solid var(--border)',marginBottom:14}}>
          <div style={{fontSize:11,fontWeight:700,color:'var(--text)',marginBottom:6}}>Symmetry property</div>
          <div style={{fontSize:11,color:'var(--text-2)',lineHeight:1.7}}>
            <div>C({n},{R}) = <strong style={{color:C}}>{fmt(result)}</strong></div>
            <div>C({n},{n-R}) = <strong style={{color:C}}>{fmt(complement)}</strong></div>
            <div style={{fontSize:10,color:'var(--text-3)',marginTop:4}}>Always equal! Choose r to include = choose n−r to exclude</div>
          </div>
        </div>
        <div style={{display:'flex',gap:10}}>
          <button style={{flex:1,padding:13,borderRadius:10,border:'none',background:C,color:'#fff',fontSize:14,fontWeight:700,cursor:'pointer'}}>Calculate →</button>
          <button onClick={()=>{setN(10);setR(3)}} style={{padding:'13px 18px',borderRadius:10,border:'1.5px solid var(--border-2)',background:'var(--bg-raised)',color:'var(--text-2)',fontSize:13,fontWeight:500,cursor:'pointer'}}>Reset</button>
        </div>
      </>}
      right={<>
        <div style={{background:'var(--bg-card)',border:`1.5px solid ${C}30`,borderRadius:14,padding:'18px 20px',marginBottom:14}}>
          <div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',marginBottom:8}}>C({n},{R})</div>
          <div style={{fontSize:38,fontWeight:700,color:C,fontFamily:"'Space Grotesk',sans-serif"}}>{fmt(result)}</div>
          <div style={{fontSize:12,color:'var(--text-3)',marginTop:6}}>unordered selections · C({n},{n-R}) = {fmt(complement)}</div>
        </div>
        <BreakdownTable title="Comparison" rows={[
          {label:'C(n,r) combinations',value:fmt(result),bold:true,highlight:true,color:C},
          {label:'P(n,r) permutations',value:fmt(perm),color:'#10b981',note:'×r! more'},
          {label:'C(n,n−r) complement',value:fmt(complement),note:'same!'},
          {label:'r! (arrangements per combo)',value:fmt(factorial(R))},
          {label:'C(n,0) = C(n,n)',value:'1',note:'trivial cases'},
          {label:'Sum of row n in Pascal',value:fmt(Math.pow(2,n)),note:'2ⁿ'},
        ]}/>
        <AIHintCard hint={`C(${n},${R}) = ${fmt(result)} combinations. Permutations P(${n},${R}) = ${fmt(perm)} = ${fmt(result)} × ${R}! = combinations × arrangements. C(${n},${n-R}) = ${fmt(complement)} (symmetry).`} color={C}/>
      </>}
    />
    {/* Interactive: show all combos */}
    {n<=6&&R<=3&&(<Sec title="🔵 Interactive — All Combinations" sub={`C(${n},${R}) = ${fmt(result)} subsets`}>
      <button onClick={()=>setShowCombs(v=>!v)} style={{padding:'10px 20px',borderRadius:10,border:`1.5px solid ${C}`,background:showCombs?C:'var(--bg-raised)',color:showCombs?'#fff':C,fontSize:12,fontWeight:700,cursor:'pointer',marginBottom:14}}>
        {showCombs?'▲ Hide':'▼ Show'} all {fmt(result)} combinations
      </button>
      {showCombs&&(<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(90px,1fr))',gap:8,marginBottom:10}}>
        {exampleCombos.map((c,i)=>(<div key={i} style={{padding:'8px 10px',background:C+'10',border:`1px solid ${C}25`,borderRadius:8,textAlign:'center',fontSize:13,fontWeight:700,color:C,fontFamily:"'Space Grotesk',sans-serif"}}>{c.join(', ')}</div>))}
      </div>)}
      <p style={{fontSize:11,color:'var(--text-3)',margin:0}}>Each group is unique regardless of order. {'{'+letters[0]+','+letters[1]+'}'} is the same combination as {'{'+letters[1]+','+letters[0]+'}'} — both counted once.</p>
    </Sec>)}
    {/* Pascal's Triangle */}
    <Sec title="🔺 Pascal's Triangle — Interactive" sub="Row n = all C(n,r) values. Your selection highlighted.">
      <div style={{display:'flex',flexDirection:'column',gap:6,alignItems:'center',marginBottom:14}}>
        {pascalRows.map((row,i)=>(<div key={i} style={{display:'flex',gap:5}}>{row.map((v,j)=>{const isCurrent=i===n&&j===R;return(<div key={j} style={{width:36,height:28,display:'flex',alignItems:'center',justifyContent:'center',borderRadius:6,background:isCurrent?C:i===n?C+'15':'var(--bg-raised)',border:`1px solid ${isCurrent?C:i===n?C+'30':'var(--border)'}`,fontSize:isCurrent?12:10,fontWeight:isCurrent?700:400,color:isCurrent?'#fff':i===n?C:'var(--text)'}}>{v>999?'..':v}</div>)})}</div>))}
      </div>
      <p style={{fontSize:12,color:'var(--text-2)',lineHeight:1.75,margin:0}}>Row {n} (highlighted): {Array.from({length:Math.min(n+1,8)},(_,k)=>nCr(n,k)).join(', ')}{n>7?'..':''}. Sum = 2^{n} = {fmt(Math.pow(2,n))}. Your C({n},{R}) = <strong style={{color:C}}>{fmt(result)}</strong>.</p>
    </Sec>
    <Sec title="Frequently asked questions">{FAQ.map((f,i)=><Acc key={i} q={f.q} a={f.a} open={openFaq===i} onToggle={()=>setFaq(openFaq===i?null:i)} color={C}/>)}</Sec>
  </div>)
}
