import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import FormulaCard from '../../components/calculator/FormulaCard'
import AIHintCard from '../../components/calculator/AIHintCard'

const CONNECTIONS = [
  { name: '3G mobile', speed_mbps: 10, icon: '📱' },
  { name: '4G LTE', speed_mbps: 50, icon: '📶' },
  { name: '5G (typical)', speed_mbps: 200, icon: '🔥' },
  { name: 'DSL (ADSL)', speed_mbps: 20, icon: '☎️' },
  { name: 'Cable internet', speed_mbps: 200, icon: '🔌' },
  { name: 'Fibre (FTTC)', speed_mbps: 100, icon: '💡' },
  { name: 'Gigabit fibre', speed_mbps: 1000, icon: '⚡' },
  { name: 'Fast Ethernet', speed_mbps: 100, icon: '🖥️' },
  { name: 'Gigabit Ethernet', speed_mbps: 1000, icon: '🖧' },
  { name: '10G Ethernet', speed_mbps: 10000, icon: '🚀' },
]

const FAQ = [
  { q: 'Why is my actual download speed lower than my plan?', a: 'ISP speeds are theoretical maximums. Real-world factors reduce speed: network congestion, distance from exchange, router quality, Wi-Fi vs ethernet, server speed, and overhead (TCP/IP headers). Expect 60-80% of stated speed under good conditions. Run a speed test multiple times at different hours.' },
  { q: 'What is the difference between Mbps and MB/s?', a: '1 Mbps (megabits per second) = 0.125 MB/s (megabytes per second). Internet speed is measured in Mbps; download managers show MB/s. A 100 Mbps connection downloads at 12.5 MB/s maximum. Always divide Mbps by 8 to get MB/s.' },
  { q: 'What bandwidth do I need for video streaming?', a: 'Netflix recommends: SD = 3 Mbps, HD = 5 Mbps, 4K = 25 Mbps. For multiple simultaneous streams, multiply. A household with 3 4K streams needs at least 75 Mbps. Add overhead for other devices and fluctuations.' },
  { q: 'How long to transfer a 1 TB hard drive?', a: 'At 1 Gbps (Gigabit Ethernet): 1 TB = 8 Tb ÷ 1 Gbps = 8000 seconds ≈ 2.2 hours (at 100% efficiency, which is unrealistic). With 60% real-world efficiency: ~3.7 hours. USB 3.0 (5 Gbps theoretical) is similar. For large transfers, physical drives are still often faster than cloud.' },
]

function Sec({ title, sub, children }) {
  return (
    <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
      <div style={{ padding: '13px 18px', borderBottom: '0.5px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', fontFamily: "'Space Grotesk',sans-serif" }}>{title}</span>
        {sub && <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{sub}</span>}
      </div>
      <div style={{ padding: '16px 18px' }}>{children}</div>
    </div>
  )
}
function Acc({ q, a, open, onToggle, color }) {
  return (
    <div style={{ borderBottom: '0.5px solid var(--border)' }}>
      <button onClick={onToggle} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 0', background: 'none', border: 'none', cursor: 'pointer', gap: 12, textAlign: 'left' }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', lineHeight: 1.4 }}>{q}</span>
        <span style={{ fontSize: 18, color, flexShrink: 0, display: 'inline-block', transform: open ? 'rotate(45deg)' : 'none', transition: 'transform .2s' }}>+</span>
      </button>
      {open && <p style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.75, margin: '0 0 13px' }}>{a}</p>}
    </div>
  )
}

export default function BandwidthCalculator({ meta, category }) {
  const C = category?.color || '#f59e0b'
  const [fileSize_MB, setFileSize] = useState(1000)
  const [speed_mbps, setSpeed] = useState(100)
  const [efficiency, setEfficiency] = useState(70)
  const [openFaq, setOpenFaq] = useState(null)

  const effective_mbps = speed_mbps * (efficiency / 100)
  const effective_MBs = effective_mbps / 8
  const fileBits = fileSize_MB * 8
  const time_s = fileBits / effective_mbps
  const hrs = Math.floor(time_s / 3600)
  const mins = Math.floor((time_s % 3600) / 60)
  const secs = Math.floor(time_s % 60)
  const timeStr = hrs > 0 ? `${hrs}h ${mins}m ${secs}s` : mins > 0 ? `${mins}m ${secs}s` : `${secs}s`

  const hint = `${fileSize_MB >= 1000 ? (fileSize_MB/1000).toFixed(2)+' GB' : fileSize_MB+' MB'} at ${speed_mbps} Mbps (${efficiency}% efficiency = ${effective_MBs.toFixed(2)} MB/s): ${timeStr}`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ background: `linear-gradient(135deg,${C}15,${C}06)`, border: `1px solid ${C}30`, borderRadius: 14, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>Bandwidth Calculator</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>Time = File size (bits) / Speed (bps)</div>
        </div>
        <div style={{ padding: '8px 18px', background: C + '15', borderRadius: 10, textAlign: 'right' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>{timeStr}</div>
          <div style={{ fontSize: 11, color: 'var(--text-3)' }}>transfer time</div>
        </div>
      </div>

      <CalcShell
        left={<>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 6 }}>File size (MB)</label>
            <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
              {[[10,'10 MB'],[100,'100 MB'],[1000,'1 GB'],[10000,'10 GB'],[100000,'100 GB'],[1000000,'1 TB']].map(([v,l]) => (
                <button key={v} onClick={() => setFileSize(v)} style={{ padding: '4px 8px', borderRadius: 6, border: `1px solid ${fileSize_MB === v ? C : 'var(--border-2)'}`, background: fileSize_MB === v ? C + '12' : 'var(--bg-raised)', fontSize: 11, color: fileSize_MB === v ? C : 'var(--text-2)', cursor: 'pointer' }}>{l}</button>
              ))}
            </div>
            <input type="number" value={fileSize_MB} onChange={e => setFileSize(+e.target.value)} style={{ width: '100%', height: 44, border: '1.5px solid var(--border-2)', borderRadius: 9, padding: '0 14px', fontSize: 17, fontWeight: 700, color: 'var(--text)', background: 'var(--bg-card)', outline: 'none', fontFamily: "'Space Grotesk',sans-serif", boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 8 }}>Connection speed (Mbps)</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {CONNECTIONS.slice(0,6).map(c => (
                <button key={c.name} onClick={() => setSpeed(c.speed_mbps)} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 10px', borderRadius: 7, border: `1px solid ${speed_mbps === c.speed_mbps ? C : 'var(--border-2)'}`, background: speed_mbps === c.speed_mbps ? C + '12' : 'var(--bg-raised)', cursor: 'pointer' }}>
                  <span style={{ fontSize: 12, color: 'var(--text)' }}>{c.icon} {c.name}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>{c.speed_mbps} Mbps</span>
                </button>
              ))}
            </div>
            <input type="number" value={speed_mbps} onChange={e => setSpeed(+e.target.value)} style={{ width: '100%', height: 40, border: '1px solid var(--border-2)', borderRadius: 7, padding: '0 10px', fontSize: 14, background: 'var(--bg-card)', color: 'var(--text)', marginTop: 8, boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 6 }}>Real-world efficiency: {efficiency}%</label>
            <input type="range" min="10" max="100" value={efficiency} onChange={e => setEfficiency(+e.target.value)} style={{ width: '100%', accentColor: C }} />
          </div>
        </>}
        right={<>
          <BreakdownTable title="Transfer details" rows={[
            { label: 'File size', value: `${fileSize_MB >= 1000 ? (fileSize_MB/1000).toFixed(2)+' GB' : fileSize_MB+' MB'} = ${(fileSize_MB*8).toLocaleString()} Mb` },
            { label: 'Connection speed', value: `${speed_mbps} Mbps` },
            { label: 'Efficiency', value: `${efficiency}%` },
            { label: 'Effective speed', value: `${effective_mbps.toFixed(1)} Mbps = ${effective_MBs.toFixed(2)} MB/s` },
            { label: 'Transfer time', value: timeStr, bold: true, highlight: true, color: C },
            { label: 'Time (seconds)', value: `${time_s.toFixed(1)} s` },
          ]} />
          <AIHintCard hint={hint} />
        </>}
      />

      <Sec title="Connection speeds reference">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {CONNECTIONS.map((c, i) => (
            <div key={i} onClick={() => setSpeed(c.speed_mbps)}
              style={{ padding: '10px 12px', borderRadius: 9, background: 'var(--bg-raised)', border: `1px solid ${speed_mbps === c.speed_mbps ? C : 'var(--border)'}`, cursor: 'pointer' }}>
              <div style={{ fontSize: 13, marginBottom: 3 }}>{c.icon} {c.name}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>{c.speed_mbps >= 1000 ? (c.speed_mbps/1000)+' Gbps' : c.speed_mbps+' Mbps'}</div>
              <div style={{ fontSize: 10, color: 'var(--text-3)' }}>{(c.speed_mbps/8).toFixed(1)} MB/s max</div>
            </div>
          ))}
        </div>
      </Sec>

      <FormulaCard
        formula={'Time (s) = File (bits) / Speed (bps)\nSpeed (MB/s) = Speed (Mbps) / 8\nFile (bits) = File (bytes) × 8'}
        variables={[
          { symbol: 'Mbps', meaning: 'Megabits per second (internet speed)' },
          { symbol: 'MB/s', meaning: 'Megabytes per second (download rate)' },
          { symbol: '8', meaning: 'Conversion factor: 1 byte = 8 bits' },
        ]}
        explanation="Always divide Mbps by 8 to get MB/s. A 100 Mbps line downloads at 12.5 MB/s maximum. Real-world speeds are 60-80% of this due to TCP overhead, protocol headers, and network congestion."
      />

      <Sec title="Frequently asked questions">
        {FAQ.map((f, i) => <Acc key={i} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} color={C} />)}
      </Sec>
    </div>
  )
}
