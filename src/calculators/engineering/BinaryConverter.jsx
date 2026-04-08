import { useState } from 'react'
import FormulaCard from '../../components/calculator/FormulaCard'
import AIHintCard from '../../components/calculator/AIHintCard'

const FAQ = [
  { q: 'How does binary represent numbers?', a: 'Binary (base 2) uses only 0 and 1. Each position is a power of 2: 1, 2, 4, 8, 16, 32... Reading 1011 from right: 1×1 + 1×2 + 0×4 + 1×8 = 1+2+8 = 11 decimal. Binary is used in all digital computing because transistors have two states: on/off.' },
  { q: 'What is hexadecimal used for?', a: 'Hex (base 16) is a compact way to represent binary. Each hex digit = 4 binary bits. 0xFF = 11111111 binary = 255 decimal. Used for memory addresses, color codes (#FF5733), machine code, and SHA hashes. Hex is essentially shorthand for binary.' },
  { q: 'What is two\'s complement?', a: 'Two\'s complement is how computers represent negative integers in binary. To negate: flip all bits (one\'s complement) then add 1. For 8-bit: -1 = 11111111, -127 = 10000001, -128 = 10000000. This makes subtraction work using addition, simplifying CPU design.' },
  { q: 'Why does binary matter in computing?', a: 'Every piece of data in a computer — images, text, video, code — is ultimately stored as binary. CPUs process binary through logic gates (AND, OR, NOT). Understanding binary helps you grasp memory sizes (1 byte = 8 bits), bitwise operations in programming, and how data is encoded.' },
  { q: 'What is a nibble, byte, and word?', a: 'A nibble is 4 bits (one hex digit). A byte is 8 bits (0–255). A word is typically 16, 32, or 64 bits depending on the CPU architecture. These groupings make binary easier to work with and define how much data a CPU can process at once.' },
]

const BITWISE_OPS = [
  { op: 'AND', sym: '&',  desc: 'Both bits must be 1', example: '1010 & 1100 = 1000' },
  { op: 'OR',  sym: '|',  desc: 'At least one bit is 1', example: '1010 | 1100 = 1110' },
  { op: 'XOR', sym: '^',  desc: 'Bits must be different', example: '1010 ^ 1100 = 0110' },
  { op: 'NOT', sym: '~',  desc: 'Flip all bits', example: '~1010 = 0101' },
  { op: 'LEFT SHIFT',  sym: '<<', desc: 'Shift bits left (×2 each shift)', example: '0011 << 1 = 0110' },
  { op: 'RIGHT SHIFT', sym: '>>', desc: 'Shift bits right (÷2 each shift)', example: '1100 >> 1 = 0110' },
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

function BitVisualizer({ bin, color }) {
  if (!bin || bin === '—') return null
  const padded = bin.padStart(Math.ceil(bin.length / 8) * 8, '0')
  const bits = padded.split('')
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
      {bits.map((bit, i) => (
        <div key={i} style={{
          width: 28, height: 28, borderRadius: 6,
          background: bit === '1' ? color : 'var(--bg-raised)',
          border: `1.5px solid ${bit === '1' ? color : 'var(--border)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 700, fontFamily: 'monospace',
          color: bit === '1' ? '#fff' : 'var(--text-3)',
          transition: 'all .15s',
        }}>{bit}</div>
      ))}
    </div>
  )
}

function ColorPreview({ hex }) {
  if (!hex || hex === '—' || hex.length > 6) return null
  const padded = hex.padStart(6, '0')
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10, padding: '10px 14px', background: 'var(--bg-raised)', borderRadius: 10, border: '0.5px solid var(--border)' }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: `#${padded}`, border: '1px solid var(--border)', flexShrink: 0 }} />
      <div>
        <div style={{ fontSize: 10, color: 'var(--text-3)' }}>CSS Color Preview</div>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', fontFamily: 'monospace' }}>#{padded.toUpperCase()}</div>
      </div>
    </div>
  )
}

export default function BinaryConverter({ meta, category }) {
  const C = category?.color || '#f59e0b'
  const [mode, setMode] = useState('dec')
  const [value, setValue] = useState('255')
  const [openFaq, setOpenFaq] = useState(null)
  const [bitwiseA, setBitwiseA] = useState('10')
  const [bitwiseB, setBitwiseB] = useState('6')

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
  const binGrouped = valid ? bin.padStart(Math.ceil(bin.length/4)*4, '0').match(/.{1,4}/g)?.join(' ') : '—'
  const ascii = valid && num >= 32 && num <= 126 ? String.fromCharCode(num) : '—'

  const modes = [
    { k:'dec', l:'Decimal', c:'#3b82f6' },
    { k:'bin', l:'Binary',  c:'#10b981' },
    { k:'hex', l:'Hex',     c:C },
    { k:'oct', l:'Octal',   c:'#8b5cf6' },
  ]

  // Bitwise playground
  const bwA = parseInt(bitwiseA) || 0
  const bwB = parseInt(bitwiseB) || 0
  const bitwiseResults = [
    { op: 'AND (&)',        val: bwA & bwB },
    { op: 'OR (|)',         val: bwA | bwB },
    { op: 'XOR (^)',        val: bwA ^ bwB },
    { op: 'NOT A (~A)',     val: (~bwA) & 0xFF },
    { op: 'A << 1',        val: (bwA << 1) & 0xFF },
    { op: 'A >> 1',        val: bwA >> 1 },
  ]

  const hint = valid
    ? `${dec} in decimal = ${binGrouped} in binary = 0x${hex} in hex = ${oct} in octal. ${ascii !== '—' ? `ASCII character: "${ascii}". ` : ''}Uses ${bin.length} bit${bin.length !== 1 ? 's' : ''} to store.`
    : 'Enter a number to convert between decimal, binary, hex and octal.'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── Converter ── */}
      <div style={{ background: `linear-gradient(135deg,${C}15,${C}06)`, border: `1px solid ${C}30`, borderRadius: 14, padding: '16px 20px' }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: C, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>Binary / Number Base Converter</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          {modes.map(m => (
            <button key={m.k} onClick={() => { setMode(m.k); setValue('') }}
              style={{ flex: 1, padding: '8px', borderRadius: 8, border: `1.5px solid ${mode===m.k ? m.c : 'var(--border-2)'}`, background: mode===m.k ? m.c+'15' : 'var(--bg-raised)', fontSize: 12, fontWeight: mode===m.k ? 700 : 500, color: mode===m.k ? m.c : 'var(--text-2)', cursor: 'pointer' }}>{m.l}
            </button>
          ))}
        </div>
        {/* ✅ Fixed: removed duplicate fontFamily */}
        <input value={value} onChange={e => setValue(e.target.value)} placeholder={`Enter ${modes.find(m=>m.k===mode)?.l} value`}
          style={{ width: '100%', height: 48, border: `2px solid ${C}`, borderRadius: 10, padding: '0 14px', fontSize: 20, fontWeight: 700, color: C, background: 'var(--bg-card)', outline: 'none', fontFamily: 'monospace', boxSizing: 'border-box' }} />
      </div>

      {/* ── Results Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {[
          { l:'Decimal (base 10)', v:dec,       c:'#3b82f6', k:'dec' },
          { l:'Binary (base 2)',   v:binGrouped, c:'#10b981', k:'bin' },
          { l:'Hex (base 16)',     v:hex,        c:C,         k:'hex' },
          { l:'Octal (base 8)',    v:oct,        c:'#8b5cf6', k:'oct' },
        ].map(m => (
          <div key={m.k} onClick={() => { if(valid) { setMode(m.k); setValue(m.k==='dec'?dec:m.k==='bin'?bin:m.k==='hex'?hex:oct) }}}
            style={{ padding: '13px 15px', borderRadius: 11, background: mode===m.k ? m.c+'12' : 'var(--bg-card)', border: `1.5px solid ${mode===m.k ? m.c : 'var(--border)'}`, cursor: 'pointer', transition: 'all .15s' }}>
            <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 4 }}>{m.l}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: m.c, fontFamily: 'monospace', wordBreak: 'break-all' }}>{m.v}</div>
          </div>
        ))}
      </div>

      {/* ── Extra Info ── */}
      {valid && (
        <div style={{ padding: '12px 16px', background: 'var(--bg-card)', borderRadius: 11, border: '0.5px solid var(--border)', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {[
            { l:'ASCII char',       v: ascii },
            { l:'Bits used',        v: bin.length + ' bits' },
            { l:'Hex (0x prefix)',  v: '0x' + hex },
            { l:'Binary grouped',   v: binGrouped },
          ].map((m,i) => (
            <div key={i}>
              <div style={{ fontSize: 10, color: 'var(--text-3)' }}>{m.l}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: C, fontFamily: 'monospace' }}>{m.v}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── AI Hint ── */}
      <AIHintCard hint={hint} catColor={C} />

      {/* ── Bit Visualizer ── */}
      <Sec title="🔵 Bit Visualizer — see each bit lit up">
        <p style={{ fontSize: 12, color: 'var(--text-3)', margin: '0 0 8px' }}>Each square = 1 bit. Blue = 1, empty = 0.</p>
        <BitVisualizer bin={bin} color={C} />
        {valid && hex.length <= 6 && <ColorPreview hex={hex} />}
      </Sec>

      {/* ── Bitwise Playground ── */}
      <Sec title="⚡ Bitwise Operations Playground">
        <p style={{ fontSize: 12, color: 'var(--text-3)', margin: '0 0 12px' }}>Enter two decimal numbers to see all bitwise operations live.</p>
        <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
          {[['A', bitwiseA, setBitwiseA], ['B', bitwiseB, setBitwiseB]].map(([label, val, set]) => (
            <div key={label} style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', marginBottom: 4 }}>Value {label} (decimal)</div>
              <input type="number" value={val} onChange={e => set(e.target.value)} min={0} max={255}
                style={{ width: '100%', height: 38, border: `1.5px solid ${C}`, borderRadius: 8, padding: '0 10px', fontSize: 14, fontWeight: 700, color: C, background: 'var(--bg-card)', outline: 'none', fontFamily: 'monospace', boxSizing: 'border-box' }} />
              <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 4, fontFamily: 'monospace' }}>
                Binary: {(parseInt(val)||0).toString(2).padStart(8,'0')}
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {bitwiseResults.map((r, i) => (
            <div key={i} style={{ padding: '10px 12px', borderRadius: 9, background: 'var(--bg-raised)', border: '0.5px solid var(--border)' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', marginBottom: 3 }}>{r.op}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: C, fontFamily: 'monospace' }}>{r.val}</div>
              <div style={{ fontSize: 10, color: 'var(--text-3)', fontFamily: 'monospace' }}>{r.val.toString(2).padStart(8,'0')}</div>
            </div>
          ))}
        </div>
      </Sec>

      {/* ── Bitwise Ops Reference ── */}
      <Sec title="📘 Bitwise Operations Reference">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {BITWISE_OPS.map((op, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 9, background: 'var(--bg-raised)', border: '0.5px solid var(--border)' }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: C + '15', border: `1px solid ${C}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace', fontSize: 14, fontWeight: 700, color: C, flexShrink: 0 }}>{op.sym}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>{op.op}</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{op.desc}</div>
              </div>
              <div style={{ fontFamily: 'monospace', fontSize: 11, color: C, background: C + '10', padding: '4px 8px', borderRadius: 6, flexShrink: 0 }}>{op.example}</div>
            </div>
          ))}
        </div>
      </Sec>

      {/* ── Quick Reference Table ── */}
      <Sec title="📊 Quick Reference Table (0–15)">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>{['Dec','Binary','Hex','Octal','ASCII'].map(h => (
                <th key={h} style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textAlign: 'left', padding: '6px 10px', borderBottom: '1px solid var(--border)', background: 'var(--bg-raised)' }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {[...Array(16)].map((_, n) => (
                <tr key={n} style={{ background: n % 2 === 0 ? 'transparent' : 'var(--bg-raised)' }}>
                  {[
                    { v: n.toString(10),                      c: '#3b82f6' },
                    { v: n.toString(2).padStart(4,'0'),        c: '#10b981' },
                    { v: n.toString(16).toUpperCase(),         c: C },
                    { v: n.toString(8),                        c: '#8b5cf6' },
                    { v: n >= 32 ? String.fromCharCode(n) : '—', c: 'var(--text-3)' },
                  ].map((cell, i) => (
                    <td key={i} style={{ padding: '5px 10px', fontSize: 12, fontFamily: 'monospace', borderBottom: '0.5px solid var(--border)', color: cell.c, fontWeight: 600 }}>{cell.v}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Sec>

      {/* ── Formula Card ── */}
      <FormulaCard
        formula={'Decimal → Binary: divide by 2, collect remainders\nBinary → Decimal: Σ(bit × 2^position)\n4 binary bits = 1 hex digit\nByte = 8 bits, Nibble = 4 bits'}
        variables={[
          { symbol: 'Base 2',  meaning: 'Binary — uses 0, 1' },
          { symbol: 'Base 8',  meaning: 'Octal — uses 0–7' },
          { symbol: 'Base 10', meaning: 'Decimal — uses 0–9' },
          { symbol: 'Base 16', meaning: 'Hexadecimal — uses 0–9, A–F' },
        ]}
        explanation="Number bases represent the same quantity differently. To convert decimal to binary, repeatedly divide by 2 and record remainders (read bottom to top). Each hex digit perfectly represents 4 binary bits, making hex a compact binary notation used in memory addresses and color codes."
      />

      {/* ── FAQ ── */}
      <Sec title="Frequently Asked Questions">
        {FAQ.map((f, i) => <Acc key={i} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} color={C} />)}
      </Sec>

    </div>
  )
}
