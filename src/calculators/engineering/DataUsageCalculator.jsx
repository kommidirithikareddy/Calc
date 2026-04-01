import { useState } from 'react'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'

const ACTIVITIES = [
  {name:'SD streaming',icon:'📺',unit:'hr/day',mbPerUnit:1000,desc:'720p video'},
  {name:'HD streaming',icon:'🎬',unit:'hr/day',mbPerUnit:3000,desc:'1080p Netflix'},
  {name:'4K streaming',icon:'🎥',unit:'hr/day',mbPerUnit:7000,desc:'4K UHD'},
  {name:'Music streaming',icon:'🎵',unit:'hr/day',mbPerUnit:60,desc:'Spotify high quality'},
  {name:'Video calls (HD)',icon:'📹',unit:'hr/day',mbPerUnit:600,desc:'Zoom/Teams HD'},
  {name:'Web browsing',icon:'🌐',unit:'hr/day',mbPerUnit:60,desc:'Average web pages'},
  {name:'Social media',icon:'📱',unit:'hr/day',mbPerUnit:120,desc:'Instagram, TikTok feed'},
  {name:'Online gaming',icon:'🎮',unit:'hr/day',mbPerUnit:40,desc:'Active gameplay'},
]

export default function DataUsageCalculator({ meta, category }) {
  const C = category?.color || '#f59e0b'
  const [usage, setUsage] = useState({0:1,1:2,2:0,3:1,4:0.5,5:2,6:0.5,7:0})
  const [days, setDays] = useState(30)

  const totalMBday = ACTIVITIES.reduce((sum,a,i) => sum + (usage[i]||0) * a.mbPerUnit, 0)
  const totalGB = totalMBday * days / 1000

  const rows = ACTIVITIES.map((a,i) => ({ label: `${a.icon} ${a.name} (${(usage[i]||0)}hr)`, value: `${((usage[i]||0)*a.mbPerUnit/1000).toFixed(2)} GB/day` }))

  return (
    <div style={{display:'flex',flexDirection:'column',gap:20}}>
      <div style={{background:`linear-gradient(135deg,${C}15,${C}06)`,border:`1px solid ${C}30`,borderRadius:14,padding:'16px 20px',display:'flex',justifyContent:'space-between',alignItems:'center',gap:16,flexWrap:'wrap'}}>
        <div>
          <div style={{fontSize:10,fontWeight:700,color:C,textTransform:'uppercase',letterSpacing:'.08em',marginBottom:4}}>Data Usage Calculator</div>
          <div style={{fontSize:16,fontWeight:700,color:C,fontFamily:"'Space Grotesk',sans-serif"}}>Estimate your monthly data consumption</div>
        </div>
        <div style={{textAlign:'right'}}>
          <div style={{fontSize:32,fontWeight:700,color:C,fontFamily:"'Space Grotesk',sans-serif"}}>{totalGB.toFixed(1)} GB</div>
          <div style={{fontSize:11,color:'var(--text-3)'}}>per {days} days</div>
        </div>
      </div>

      <div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,overflow:'hidden'}}>
        <div style={{padding:'13px 18px',borderBottom:'0.5px solid var(--border)',fontSize:13,fontWeight:700,color:'var(--text)'}}>Daily activity (hours per day)</div>
        <div style={{padding:'16px 18px',display:'flex',flexDirection:'column',gap:12}}>
          {ACTIVITIES.map((a,i)=>{
            const mbDay = (usage[i]||0)*a.mbPerUnit
            const pct = totalMBday > 0 ? mbDay/totalMBday*100 : 0
            return (
              <div key={i}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
                  <label style={{fontSize:12,fontWeight:600,color:'var(--text)'}}>{a.icon} {a.name} <span style={{fontSize:10,color:'var(--text-3)'}}>{a.desc}</span></label>
                  <div style={{display:'flex',alignItems:'center',gap:6}}>
                    <input type="number" step="0.5" min="0" max="24" value={usage[i]||0} onChange={e=>setUsage({...usage,[i]:+e.target.value})}
                      style={{width:60,height:32,border:'1px solid var(--border-2)',borderRadius:6,padding:'0 6px',fontSize:13,fontWeight:700,color:C,background:'var(--bg-card)',textAlign:'center'}} />
                    <span style={{fontSize:11,color:'var(--text-3)',minWidth:50,textAlign:'right'}}>{(mbDay/1000).toFixed(2)} GB</span>
                  </div>
                </div>
                <div style={{height:6,background:'var(--border)',borderRadius:3,overflow:'hidden'}}>
                  <div style={{height:'100%',width:`${pct}%`,background:C,borderRadius:3,transition:'width .3s'}} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,padding:'14px 16px'}}>
        <label style={{fontSize:12.5,fontWeight:600,color:'var(--text)',display:'block',marginBottom:6}}>Calculation period: {days} days</label>
        <input type="range" min="1" max="31" value={days} onChange={e=>setDays(+e.target.value)} style={{width:'100%',accentColor:C}} />
      </div>

      <BreakdownTable title="Monthly data breakdown" rows={[
        ...rows,
        {label:'Total daily',value:`${(totalMBday/1000).toFixed(2)} GB/day`},
        {label:`Total (${days} days)`,value:`${totalGB.toFixed(2)} GB`,bold:true,highlight:true,color:C},
      ]} />

      <div style={{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:14,padding:'14px 16px'}}>
        <div style={{fontSize:13,fontWeight:700,color:'var(--text)',marginBottom:10}}>Suggested data plan</div>
        {[['5 GB',5],['20 GB',20],['50 GB',50],['100 GB',100],['Unlimited',999]].map(([label,gb])=>(
          <div key={label} style={{display:'flex',justifyContent:'space-between',padding:'7px 0',borderBottom:'0.5px solid var(--border)',fontSize:12}}>
            <span style={{color:'var(--text)'}}>{label} plan</span>
            <span style={{fontWeight:700,color:totalGB<=gb?'#10b981':'#ef4444'}}>{totalGB<=gb?'✓ Sufficient':`✗ ${(totalGB-gb).toFixed(1)}GB over`}</span>
          </div>
        ))}
      </div>

      <AIHintCard hint={`Total: ${totalGB.toFixed(1)} GB over ${days} days (${(totalMBday/1000).toFixed(2)} GB/day). Largest consumer: ${ACTIVITIES[Object.entries(usage).sort((a,b)=>(+b[1]*ACTIVITIES[+b[0]].mbPerUnit)-(+a[1]*ACTIVITIES[+a[0]].mbPerUnit))[0]?.[0]]?.name||'—'}.`} />
    </div>
  )
}
