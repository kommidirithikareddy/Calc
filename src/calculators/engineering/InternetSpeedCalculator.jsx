import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import FormulaCard from '../../components/calculator/FormulaCard'
import AIHintCard from '../../components/calculator/AIHintCard'

const CONTENT = [
  {name:'Email (no attachments)',MB:0.075,icon:'📧'},{name:'Web page',MB:2,icon:'🌐'},{name:'MP3 song',MB:5,icon:'🎵'},{name:'Photo (12MP)',MB:6,icon:'📷'},{name:'SD video (1hr)',MB:700,icon:'📹'},{name:'HD video (1hr)',MB:2000,icon:'🎬'},{name:'4K video (1hr)',MB:7000,icon:'🎥'},{name:'HD game download',MB:50000,icon:'🎮'},{name:'Blu-ray movie',MB:40000,icon:'💿'},{name:'OS installer',MB:10000,icon:'💻'},
]

const CONNECTIONS = [
  {name:'Old 3G',mbps:1},{name:'4G LTE',mbps:50},{name:'5G typical',mbps:200},{name:'Home DSL',mbps:20},{name:'Cable 100',mbps:100},{name:'Gigabit fibre',mbps:1000},
]

export default function InternetSpeedCalculator({ meta, category }) {
  const C = category?.color || '#f59e0b'
  const [speed, setSpeed] = useState(100)
  const [fileIdx, setFileIdx] = useState(5)
  const [efficiency, setEfficiency] = useState(70)

  const file = CONTENT[fileIdx]
  const eff_mbps = speed * efficiency/100
  const eff_MBs = eff_mbps / 8
  const time_s = file.MB / eff_MBs
  const timeStr = time_s < 60 ? `${time_s.toFixed(1)}s` : time_s < 3600 ? `${(time_s/60).toFixed(1)} min` : `${(time_s/3600).toFixed(2)} hr`
  const hint = `${file.name} (${file.MB>=1000?(file.MB/1000).toFixed(1)+'GB':file.MB+'MB'}) at ${speed} Mbps: ${timeStr}`

  return (
    <div style={{display:'flex',flexDirection:'column',gap:20}}>
      <div style={{background:`linear-gradient(135deg,${C}15,${C}06)`,border:`1px solid ${C}30`,borderRadius:14,padding:'16px 20px',display:'flex',justifyContent:'space-between',alignItems:'center',gap:16,flexWrap:'wrap'}}>
        <div>
          <div style={{fontSize:10,fontWeight:700,color:C,textTransform:'uppercase',letterSpacing:'.08em',marginBottom:4}}>Internet Speed Calculator</div>
          <div style={{fontSize:18,fontWeight:700,color:C,fontFamily:"'Space Grotesk',sans-serif"}}>Download time = File (bits) / Speed (bps)</div>
        </div>
        <div style={{padding:'8px 18px',background:C+'15',borderRadius:10,textAlign:'right'}}>
          <div style={{fontSize:28,fontWeight:700,color:C,fontFamily:"'Space Grotesk',sans-serif"}}>{timeStr}</div>
          <div style={{fontSize:11,color:'var(--text-3)'}}>{file.icon} {file.name}</div>
        </div>
      </div>

      <CalcShell
        left={<>
          <div style={{marginBottom:14}}>
            <label style={{fontSize:12.5,fontWeight:600,color:'var(--text)',display:'block',marginBottom:8}}>Your speed (Mbps)</label>
            <div style={{display:'flex',flexDirection:'column',gap:5,marginBottom:8}}>
              {CONNECTIONS.map(c=>(
                <button key={c.name} onClick={()=>setSpeed(c.mbps)} style={{display:'flex',justifyContent:'space-between',padding:'7px 10px',borderRadius:7,border:`1px solid ${speed===c.mbps?C:'var(--border-2)'}`,background:speed===c.mbps?C+'12':'var(--bg-raised)',cursor:'pointer'}}>
                  <span style={{fontSize:12,color:'var(--text)'}}>{c.name}</span>
                  <span style={{fontSize:12,fontWeight:700,color:C,fontFamily:"'Space Grotesk',sans-serif"}}>{c.mbps} Mbps</span>
                </button>
              ))}
            </div>
            <input type="number" value={speed} onChange={e=>setSpeed(+e.target.value)} style={{width:'100%',height:40,border:'1px solid var(--border-2)',borderRadius:7,padding:'0 10px',fontSize:14,background:'var(--bg-card)',color:'var(--text)',boxSizing:'border-box'}} />
          </div>
          <div style={{marginBottom:14}}>
            <label style={{fontSize:12.5,fontWeight:600,color:'var(--text)',display:'block',marginBottom:6}}>Efficiency: {efficiency}%</label>
            <input type="range" min="10" max="100" value={efficiency} onChange={e=>setEfficiency(+e.target.value)} style={{width:'100%',accentColor:C}} />
          </div>
        </>}
        right={<>
          <div style={{marginBottom:14}}>
            <label style={{fontSize:12.5,fontWeight:600,color:'var(--text)',display:'block',marginBottom:8}}>Select content type</label>
            <div style={{display:'flex',flexDirection:'column',gap:5}}>
              {CONTENT.map((c,i)=>(
                <button key={i} onClick={()=>setFileIdx(i)} style={{display:'flex',justifyContent:'space-between',padding:'8px 10px',borderRadius:8,border:`1px solid ${fileIdx===i?C:'var(--border)'}`,background:fileIdx===i?C+'12':'var(--bg-raised)',cursor:'pointer'}}>
                  <span style={{fontSize:12,color:'var(--text)'}}>{c.icon} {c.name}</span>
                  <span style={{fontSize:12,fontWeight:700,color:fileIdx===i?C:'var(--text-3)',fontFamily:"'Space Grotesk',sans-serif"}}>{c.MB>=1000?(c.MB/1000).toFixed(1)+'GB':c.MB+'MB'}</span>
                </button>
              ))}
            </div>
          </div>
          <BreakdownTable title="Results" rows={[
            {label:'Effective speed',value:`${(speed*efficiency/100).toFixed(1)} Mbps`},
            {label:'Download rate',value:`${((speed*efficiency/100)/8).toFixed(2)} MB/s`},
            {label:'File size',value:`${file.MB>=1000?(file.MB/1000).toFixed(2)+' GB':file.MB+' MB'}`},
            {label:'Download time',value:timeStr,bold:true,highlight:true,color:C},
          ]} />
          <AIHintCard hint={hint} />
        </>}
      />

      <FormulaCard
        formula={'Time (s) = File (MB) × 8 / Speed (Mbps)\nMB/s = Mbps / 8\nEffective speed = Rated × Efficiency %'}
        variables={[{symbol:'Mbps',meaning:'Megabits per second (what ISPs advertise)'},{symbol:'MB/s',meaning:'Megabytes per second (what you download at)'},{symbol:'8',meaning:'Conversion factor: 1 byte = 8 bits'}]}
        explanation="Divide Mbps by 8 to get MB/s. Actual speeds are 60-80% of rated due to protocol overhead, network congestion, and server limitations. ISPs advertise in Mbps; download managers show MB/s — both correct, just different units."
      />
    </div>
  )
}
