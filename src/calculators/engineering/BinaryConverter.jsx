import { useState } from 'react'
import FormulaCard from '../../components/calculator/FormulaCard'
import AIHintCard from '../../components/calculator/AIHintCard'

const FAQ = [
  { q: 'How does binary represent numbers?', a: 'Binary (base 2) uses only 0 and 1. Each position is a power of 2: 1, 2, 4, 8, 16, 32... Reading 1011 from right: 1×1 + 1×2 + 0×4 + 1×8 = 1+2+8 = 11 decimal. Binary is used in all digital computing because transistors have two states: on/off.' },
  { q: 'What is hexadecimal used for?', a: 'Hex (base 16) is a compact way to represent binary. Each hex digit = 4 binary bits. 0xFF = 11111111 binary = 255 decimal. Used for memory addresses, color codes (#FF5733), machine code, and SHA hashes. Hex is essentially shorthand for binary.' },
  { q: 'What is two\'s complement?', a: 'Two\'s complement is how computers represent negative integers in binary. To negate: flip all bits (one\'s complement) then add 1. For 8-bit: -1 = 11111111, -127 = 10000001, -128 = 10000000. This makes subtraction work using addition, simplifying CPU design.' },
]

function Sec({ title, children }) {
  return (
    <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
      <div style={{ padding: '13px 18px', borderBottom: '0.5px solid var(--border)', fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{title}</div>
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

export default function BinaryConverter({ meta, category }) {
  const C = category?.color || '#f59e0b'
  const [mode, setMode] = useState('dec')
  const [value, setValue] = useState('255')
  const [openFaq, setOpenFaq] = useState(null)

  let num = NaN
  try {
    if (mode === 'dec') num = parseInt(value, 10)
    else if (mode === 'bin') num = parseInt(value, 2)
    else if (mode === 'hex') num = parseInt(value, 16)
    else if (mode === 'oct') num = parseInt(value, 8)
  } catch(e) {}

  const valid = !isNaN(num) && isFinite(num) && num >= 0
  const dec = valid ? num.toString(10) : '—'
  const bin = valid ? num.toString(2) : '—'
  const hex = valid ? num.toString(16).toUpperCase() : '—'
  const oct = valid ? num.toString(8) : '—'

  // Group binary in nibbles of 4
  const binGrouped = valid ? bin.padStart(Math.ceil(bin.length/4)*4, '0').match(/.{1,4}/g)?.join(' ') : '—'
  const ascii = valid && num >= 32 && num <= 126 ? String.fromCharCode(num) : '—'

  const modes = [{k:'dec',l:'Decimal',c:'#3b82f6'},{k:'bin',l:'Binary',c:'#10b981'},{k:'hex',l:'Hex',c:C},{k:'oct',l:'Octal',c:'#8b5cf6'}]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ background: `linear-gradient(135deg,${C}15,${C}06)`, border: `1px solid ${C}30`, borderRadius: 14, padding: '16px 20px' }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: C, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>Binary / Number Base Converter</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          {modes.map(m => (
            <button key={m.k} onClick={() => { setMode(m.k); setValue('') }}
              style={{ flex: 1, padding: '8px', borderRadius: 8, border: `1.5px solid ${mode===m.k ? m.c : 'var(--border-2)'}`, background: mode===m.k ? m.c+'15' : 'var(--bg-raised)', fontSize: 12, fontWeight: mode===m.k ? 700 : 500, color: mode===m.k ? m.c : 'var(--text-2)', cursor: 'pointer' }}>{m.l}</button>
          ))}
        </div>
        <input value={value} onChange={e => setValue(e.target.value)} placeholder={`Enter ${modes.find(m=>m.k===mode)?.l} value`}
          style={{ width: '100%', height: 48, border: `2px solid ${C}`, borderRadius: 10, padding: '0 14px', fontSize: 20, fontWeight: 700, color: C, background: 'var(--bg-card)', outline: 'none', fontFamily: "'Space Grotesk',sans-serif", boxSizing: 'border-box', fontFamily: 'monospace' }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {[{l:'Decimal (base 10)',v:dec,c:'#3b82f6',k:'dec'},{l:'Binary (base 2)',v:binGrouped,c:'#10b981',k:'bin'},{l:'Hexadecimal (base 16)',v:hex,c:C,k:'hex'},{l:'Octal (base 8)',v:oct,c:'#8b5cf6',k:'oct'}].map(m => (
          <div key={m.k} onClick={() => { if(valid) { setMode(m.k); setValue(m.k==='dec'?dec:m.k==='bin'?bin:m.k==='hex'?hex:oct) }}}
            style={{ padding: '13px 15px', borderRadius: 11, background: mode===m.k ? m.c+'12' : 'var(--bg-card)', border: `1.5px solid ${mode===m.k ? m.c : 'var(--border)'}`, cursor: 'pointer' }}>
            <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 4 }}>{m.l}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: m.c, fontFamily: 'monospace', wordBreak: 'break-all' }}>{m.v}</div>
          </div>
        ))}
      </div>

      {valid && <div style={{ padding: '12px 16px', background: 'var(--bg-card)', borderRadius: 11, border: '0.5px solid var(--border)', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {[{l:'ASCII char',v:ascii},{l:'Bits used',v:bin.length+' bits'},{l:'Hex (0x prefix)',v:'0x'+hex},{l:'Binary (0b prefix)',v:'0b'+bin.slice(0,12)+(bin.length>12?'…':'')}].map((m,i) => (
          <div key={i}><div style={{ fontSize: 10, color: 'var(--text-3)' }}>{m.l}</div><div style={{ fontSize: 13, fontWeight: 700, color: C }}>{m.v}</div></div>
        ))}
      </div>}

      <Sec title="Quick reference table">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>{['Dec','Bin','Hex','Oct'].map(h => <th key={h} style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textAlign: 'left', padding: '6px 10px', borderBottom: '1px solid var(--border)', background: 'var(--bg-raised)' }}>{h}</th>)}</tr></thead>
            <tbody>
              {[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15].map(n => (
                <tr key={n}>{[n.toString(10),n.toString(2).padStart(4,'0'),n.toString(16).toUpperCase(),n.toString(8)].map((v,i) => (
                  <td key={i} style={{ padding: '5px 10px', fontSize: 12, fontFamily: 'monospace', borderBottom: '0.5px solid var(--border)', color: i===0 ? 'var(--text)' : i===1 ? '#10b981' : i===2 ? C : '#8b5cf6', fontWeight: 600 }}>{v}</td>
                ))}</tr>
              ))}
            </tbody>
          </table>
        </div>
      </Sec>

      <FormulaCard
        formula={'Decimal → Binary: divide by 2, collect remainders\nBinary → Decimal: Σ(bit × 2^position)\n4 binary bits = 1 hex digit'}
        variables={[
          { symbol: 'Base 2', meaning: 'Binary — uses 0, 1' },
          { symbol: 'Base 8', meaning: 'Octal — uses 0–7' },
          { symbol: 'Base 10', meaning: 'Decimal — uses 0–9' },
          { symbol: 'Base 16', meaning: 'Hexadecimal — uses 0–9, A–F' },
        ]}
        explanation="Number bases represent the same quantity differently. To convert decimal to binary, repeatedly divide by 2 and record remainders (read bottom to top). Each hex digit perfectly represents 4 binary bits, making hex a compact binary notation."
      />

      <Sec title="Frequently asked questions">
        {FAQ.map((f, i) => <Acc key={i} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} color={C} />)}
      </Sec>
    </div>
  )
}
