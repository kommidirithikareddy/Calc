import { useState } from 'react'
import FormulaCard from '../../components/calculator/FormulaCard'
import AIHintCard from '../../components/calculator/AIHintCard'

function ipToInt(ip) {
  return ip.split('.').reduce((acc, octet) => (acc << 8) | parseInt(octet, 10), 0) >>> 0
}
function intToIp(n) {
  return [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.')
}
function padBinary(n, bits=32) { return (n >>> 0).toString(2).padStart(bits, '0') }

const FAQ = [
  { q: 'What is CIDR notation?', a: 'CIDR (Classless Inter-Domain Routing) notation like 192.168.1.0/24 specifies an IP address and the number of bits in the network mask. /24 means the first 24 bits are the network (255.255.255.0), leaving 8 bits for 254 usable hosts (256 - 2 for network and broadcast addresses).' },
  { q: 'How do I subnet a network?', a: 'To create subnets: decide how many subnets or hosts per subnet you need. Each additional bit borrowed from host portion doubles the number of subnets but halves hosts per subnet. A /24 gives 254 hosts. /25 gives 2 subnets of 126 hosts each. /26 gives 4 subnets of 62 hosts each.' },
  { q: 'Why are 2 addresses reserved in each subnet?', a: 'The first address is the network address (all host bits zero) and cannot be assigned to devices. The last address is the broadcast address (all host bits one) used to send data to all devices in the subnet. Usable hosts = 2^(32-prefix) - 2.' },
]

function Sec({ title, sub, children }) {
  return (
    <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
      <div style={{ padding: '13px 18px', borderBottom: '0.5px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{title}</span>
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
        <span style={{ fontSize: 18, color, display: 'inline-block', transform: open ? 'rotate(45deg)' : 'none', transition: 'transform .2s' }}>+</span>
      </button>
      {open && <p style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.75, margin: '0 0 13px' }}>{a}</p>}
    </div>
  )
}

export default function SubnetCalculator({ meta, category }) {
  const C = category?.color || '#f59e0b'
  const [ip, setIp] = useState('192.168.1.0')
  const [prefix, setPrefix] = useState(24)
  const [openFaq, setOpenFaq] = useState(null)

  let valid = false, networkAddr, broadcastAddr, firstHost, lastHost, numHosts, subnetMask, wildcard, networkBin, maskBin, errorMsg
  try {
    const parts = ip.split('.')
    if (parts.length === 4 && parts.every(p => !isNaN(p) && +p >= 0 && +p <= 255)) {
      const ipInt = ipToInt(ip)
      const maskInt = prefix === 0 ? 0 : (0xFFFFFFFF << (32 - prefix)) >>> 0
      const wildcardInt = (~maskInt) >>> 0
      networkAddr = intToIp((ipInt & maskInt) >>> 0)
      broadcastAddr = intToIp(((ipInt & maskInt) | wildcardInt) >>> 0)
      firstHost = intToIp(((ipInt & maskInt) + 1) >>> 0)
      lastHost = intToIp((((ipInt & maskInt) | wildcardInt) - 1) >>> 0)
      numHosts = Math.max(0, Math.pow(2, 32 - prefix) - 2)
      subnetMask = intToIp(maskInt)
      wildcard = intToIp(wildcardInt)
      networkBin = padBinary(ipToInt(networkAddr))
      maskBin = padBinary(maskInt)
      valid = true
    } else errorMsg = 'Invalid IP address'
  } catch(e) { errorMsg = 'Invalid input' }

  const formatBin = (bin) => [
    <span key="n" style={{ color: C, fontFamily: 'monospace' }}>{bin?.slice(0, prefix)}</span>,
    <span key="h" style={{ color: 'var(--text-3)', fontFamily: 'monospace' }}>{bin?.slice(prefix)}</span>
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ background: `linear-gradient(135deg,${C}15,${C}06)`, border: `1px solid ${C}30`, borderRadius: 14, padding: '16px 20px' }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: C, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>IP Subnet Calculator</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <input value={ip} onChange={e => setIp(e.target.value)} placeholder="192.168.1.0"
            style={{ flex: 1, minWidth: 160, height: 48, border: `2px solid ${C}`, borderRadius: 10, padding: '0 14px', fontSize: 18, fontWeight: 700, color: C, background: 'var(--bg-card)', outline: 'none', fontFamily: "'Space Grotesk',sans-serif" }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 20, fontWeight: 700, color: C }}>/</span>
            <input type="number" min="0" max="32" value={prefix} onChange={e => setPrefix(Math.min(32,Math.max(0,+e.target.value)))}
              style={{ width: 70, height: 48, border: `2px solid ${C}`, borderRadius: 10, padding: '0 10px', fontSize: 22, fontWeight: 700, color: C, background: 'var(--bg-card)', outline: 'none', textAlign: 'center' }} />
          </div>
        </div>
      </div>

      {/* Common subnet presets */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {[[8,'Class A'],[16,'Class B'],[24,'Class C'],[25,'Half C'],[26,'Quarter C'],[28,'16 hosts'],[30,'4 hosts'],[32,'Host']].map(([p,l]) => (
          <button key={p} onClick={() => setPrefix(p)} style={{ padding: '5px 10px', borderRadius: 7, border: `1px solid ${prefix===p ? C : 'var(--border-2)'}`, background: prefix===p ? C+'12' : 'var(--bg-raised)', fontSize: 11, fontWeight: prefix===p ? 700 : 400, color: prefix===p ? C : 'var(--text-2)', cursor: 'pointer' }}>/{p} {l}</button>
        ))}
      </div>

      {valid ? (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[{l:'Network address',v:networkAddr,c:C},{l:'Broadcast address',v:broadcastAddr},{l:'First usable host',v:firstHost,c:'#10b981'},{l:'Last usable host',v:lastHost,c:'#10b981'},{l:'Subnet mask',v:subnetMask},{l:'Wildcard mask',v:wildcard},{l:'Usable hosts',v:numHosts.toLocaleString(),c:C},{l:'Prefix length',v:`/${prefix}`}].map((m,i) => (
              <div key={i} style={{ padding: '11px 13px', background: 'var(--bg-card)', borderRadius: 10, border: '0.5px solid var(--border)' }}>
                <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 3 }}>{m.l}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: m.c || 'var(--text)', fontFamily: "'Space Grotesk',sans-serif" }}>{m.v}</div>
              </div>
            ))}
          </div>

          <Sec title="Binary representation" sub="Network bits in amber, host bits in grey">
            <div style={{ fontFamily: 'monospace', fontSize: 12, lineHeight: 2 }}>
              <div><span style={{ color: 'var(--text-3)', marginRight: 8, minWidth: 80, display: 'inline-block' }}>IP:</span>{formatBin(networkBin)}</div>
              <div><span style={{ color: 'var(--text-3)', marginRight: 8, minWidth: 80, display: 'inline-block' }}>Mask:</span>{formatBin(maskBin)}</div>
            </div>
          </Sec>

          <Sec title={`Subnet split — /${prefix} → /${prefix+1}`} sub="Click to halve the subnet">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {prefix < 32 && [0, 1].map(half => {
                const halfInt = ipToInt(networkAddr) + half * Math.pow(2, 31-prefix)
                return (
                  <div key={half} onClick={() => { setIp(intToIp(halfInt>>>0)); setPrefix(prefix+1) }}
                    style={{ padding: '10px 12px', borderRadius: 9, background: C+'08', border: `1px solid ${C}25`, cursor: 'pointer' }}>
                    <div style={{ fontSize: 11, color: C, fontWeight: 700, marginBottom: 2 }}>Subnet {half+1}</div>
                    <div style={{ fontSize: 12, fontFamily: "'Space Grotesk',sans-serif", color: 'var(--text)' }}>{intToIp(halfInt>>>0)}/{prefix+1}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{Math.max(0,Math.pow(2,31-prefix)-2)} hosts</div>
                  </div>
                )
              })}
            </div>
          </Sec>
        </>
      ) : (
        <div style={{ padding: '20px', textAlign: 'center', color: '#ef4444', background: '#fee2e2', borderRadius: 12 }}>{errorMsg}</div>
      )}

      <FormulaCard
        formula={'Network = IP AND Mask\nBroadcast = Network OR NOT(Mask)\nHosts = 2^(32-prefix) − 2\nFirst = Network + 1'}
        variables={[
          { symbol: '/prefix', meaning: 'Number of network bits (0–32)' },
          { symbol: 'Mask', meaning: '32-bit number: prefix 1s then host 0s' },
          { symbol: 'Hosts', meaning: 'Usable IP addresses in subnet' },
        ]}
        explanation="Subnetting divides a network into smaller segments using bitwise AND with the mask. The mask has 1s in the network portion and 0s in the host portion. Network = all host bits 0, Broadcast = all host bits 1. Usable hosts = total addresses minus 2."
      />

      <Sec title="Frequently asked questions">
        {FAQ.map((f, i) => <Acc key={i} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} color={C} />)}
      </Sec>
    </div>
  )
}
