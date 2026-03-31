import { useState, useMemo } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'
function Sec({title,sub,children}){return(<div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,overflow:'hidden'}}><div style={{padding:'13px 18px',borderBottom:'0.5px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center'}}><span style={{fontSize:13,fontWeight:700,color:'var(--text)',fontFamily:"'Space Grotesk',sans-serif"}}>{title}</span>{sub&&<span style={{fontSize:11,color:'var(--text-3)'}}>{sub}</span>}</div><div style={{padding:'16px 18px'}}>{children}</div></div>)}function Acc({q,a,open,onToggle,color}){return(<div style={{borderBottom:'0.5px solid var(--border)'}}><button onClick={onToggle} style={{width:'100%',display:'flex',justifyContent:'space-between',alignItems:'center',padding:'13px 0',background:'none',border:'none',cursor:'pointer',gap:12,textAlign:'left'}}><span style={{fontSize:13,fontWeight:600,color:'var(--text)',fontFamily:"'DM Sans',sans-serif",lineHeight:1.4}}>{q}</span><span style={{fontSize:18,color,flexShrink:0,display:'inline-block',transform:open?'rotate(45deg)':'none',transition:'transform .2s'}}>+</span></button>{open&&<p style={{fontSize:12.5,color:'var(--text-2)',lineHeight:1.75,margin:'0 0 13px',fontFamily:"'DM Sans',sans-serif"}}>{a}</p>}</div>)}
const FAQ=[{q:'What is the 50/30/20 budgeting rule?',a:'Allocate 50% of after-tax income to needs (rent, food, utilities, minimum debt payments), 30% to wants (dining out, entertainment, subscriptions), and 20% to savings and debt payoff. It is a starting guideline, not a rigid rule.'},{q:'What counts as a "need" vs a "want"?',a:'Needs are things you cannot live without: housing, basic food, utilities, essential transport, minimum loan payments. Wants are lifestyle choices: restaurant meals, streaming services, gym memberships, new clothes beyond basics. The line can blur — be honest with yourself.'}]
export default function BudgetCalculator({meta,category}){
  const C=category?.color||'#0d9488'
  const [income,setIncome]=useState(5000)
  const [expenses,setExpenses]=useState([{name:'Housing',amount:1500},{name:'Food',amount:400},{name:'Transport',amount:300},{name:'Utilities',amount:150},{name:'Entertainment',amount:200}])
  const [newName,setNewName]=useState('')
  const [newAmt,setNewAmt]=useState('')
  const [openFaq,setOpenFaq]=useState(null)
  const totalExp=expenses.reduce((s,e)=>s+(+e.amount||0),0)
  const remaining=income-totalExp
  const savingsRate=income>0?remaining/income*100:0
  const health=remaining>=0?(savingsRate>=20?{l:'On track',c:'#10b981',bg:'#d1fae5'}:savingsRate>=10?{l:'Manageable',c:'#3b82f6',bg:'#dbeafe'}:{l:'Tight',c:'#f59e0b',bg:'#fef3c7'}):{l:'Over budget',c:'#ef4444',bg:'#fee2e2'}
  const addExp=()=>{if(!newName)return;setExpenses([...expenses,{name:newName,amount:+newAmt||0}]);setNewName('');setNewAmt('')}
  const hint=`Income $${income}/mo, expenses $${totalExp.toFixed(0)}, remaining $${remaining.toFixed(0)} (${savingsRate.toFixed(1)}% savings rate).`
  return(<div style={{display:'flex',flexDirection:'column',gap:20}}>
    <div style={{background:`linear-gradient(135deg,${C}12,${C}06)`,border:`1px solid ${C}30`,borderRadius:14,padding:'16px 20px',display:'flex',justifyContent:'space-between',alignItems:'center',gap:16,flexWrap:'wrap'}}>
      <div><div style={{fontSize:10,fontWeight:700,color:C,textTransform:'uppercase',letterSpacing:'.08em',marginBottom:6}}>50/30/20 Budget Rule</div><div style={{fontSize:18,fontWeight:700,color:C,fontFamily:"'Space Grotesk',sans-serif"}}>Needs 50% · Wants 30% · Savings 20%</div></div>
      <div style={{padding:'8px 18px',background:health.bg,borderRadius:10,fontSize:14,fontWeight:700,color:health.c}}>{health.l}</div>
    </div>
    <CalcShell
      left={<>
        <div style={{marginBottom:16}}><label style={{fontSize:12.5,fontWeight:600,color:'var(--text)',fontFamily:"'DM Sans',sans-serif",display:'block',marginBottom:6}}>Monthly income ($)</label><input type="number" value={income} onChange={e=>setIncome(Math.max(0,+e.target.value))} style={{width:'100%',height:44,border:'1.5px solid var(--border-2)',borderRadius:9,padding:'0 14px',fontSize:17,fontWeight:700,color:'var(--text)',background:'var(--bg-card)',outline:'none',fontFamily:"'Space Grotesk',sans-serif",boxSizing:'border-box'}}/></div>
        <div style={{marginBottom:8}}><label style={{fontSize:12.5,fontWeight:600,color:'var(--text)',fontFamily:"'DM Sans',sans-serif",display:'block',marginBottom:8}}>Monthly expenses</label>
          {expenses.map((e,i)=>(<div key={i} style={{display:'flex',gap:8,marginBottom:8,alignItems:'center'}}>
            <input value={e.name} onChange={ev=>{const n=[...expenses];n[i].name=ev.target.value;setExpenses(n)}} style={{flex:1,height:38,border:'1px solid var(--border-2)',borderRadius:7,padding:'0 10px',fontSize:13,background:'var(--bg-card)',color:'var(--text)',fontFamily:"'DM Sans',sans-serif"}}/>
            <input type="number" value={e.amount} onChange={ev=>{const n=[...expenses];n[i].amount=+ev.target.value;setExpenses(n)}} style={{width:100,height:38,border:'1px solid var(--border-2)',borderRadius:7,padding:'0 10px',fontSize:13,background:'var(--bg-card)',color:'var(--text)',boxSizing:'border-box'}}/>
            <button onClick={()=>setExpenses(expenses.filter((_,j)=>j!==i))} style={{width:28,height:28,borderRadius:'50%',border:'none',background:'var(--bg-raised)',cursor:'pointer',fontSize:16,color:'var(--text-3)'}}>×</button>
          </div>))}
          <div style={{display:'flex',gap:8,marginTop:4}}>
            <input placeholder="Add category" value={newName} onChange={e=>setNewName(e.target.value)} style={{flex:1,height:38,border:'1px solid var(--border-2)',borderRadius:7,padding:'0 10px',fontSize:13,background:'var(--bg-card)',color:'var(--text)',fontFamily:"'DM Sans',sans-serif"}}/>
            <input type="number" placeholder="$" value={newAmt} onChange={e=>setNewAmt(e.target.value)} style={{width:80,height:38,border:'1px solid var(--border-2)',borderRadius:7,padding:'0 10px',fontSize:13,background:'var(--bg-card)',color:'var(--text)',boxSizing:'border-box'}}/>
            <button onClick={addExp} style={{padding:'0 12px',height:38,borderRadius:7,border:`1px solid ${C}`,background:C+'10',color:C,fontSize:12,fontWeight:600,cursor:'pointer'}}>Add</button>
          </div>
        </div>
      </>}
      right={<>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:14}}>
          {[{l:'Total expenses',v:`$${totalExp.toFixed(0)}`},{l:'Remaining',v:`$${remaining.toFixed(0)}`,c:remaining>=0?C:'#ef4444'},{l:'Savings rate',v:`${savingsRate.toFixed(1)}%`},{l:'50% needs target',v:`$${(income*0.5).toFixed(0)}`}].map((m,i)=>(<div key={i} style={{padding:'12px 14px',background:'var(--bg-raised)',borderRadius:10,border:'0.5px solid var(--border)'}}><div style={{fontSize:10,color:'var(--text-3)',marginBottom:4}}>{m.l}</div><div style={{fontSize:18,fontWeight:700,color:m.c||'var(--text)',fontFamily:"'Space Grotesk',sans-serif"}}>{m.v}</div></div>))}
        </div>
        {expenses.length>0&&<div style={{marginBottom:14}}>{expenses.sort((a,b)=>b.amount-a.amount).map((e,i)=>(<div key={i} style={{marginBottom:8}}><div style={{display:'flex',justifyContent:'space-between',fontSize:12,marginBottom:3}}><span style={{color:'var(--text)'}}>{e.name}</span><span style={{color:C,fontWeight:700}}>${(+e.amount||0).toFixed(0)}</span></div><div style={{height:6,background:'var(--border)',borderRadius:3,overflow:'hidden'}}><div style={{height:'100%',width:`${totalExp>0?(+e.amount||0)/totalExp*100:0}%`,background:C,borderRadius:3,transition:'width .4s'}}/></div></div>))}</div>}
        <AIHintCard hint={hint}/>
      </>}
    />
    <Sec title="FAQ">{FAQ.map((f,i)=><Acc key={i} q={f.q} a={f.a} open={openFaq===i} onToggle={()=>setOpenFaq(openFaq===i?null:i)} color={C}/>)}</Sec>
  </div>)
}
