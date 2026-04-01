import { useState } from 'react'
import FormulaCard from '../../components/calculator/FormulaCard'
import AIHintCard from '../../components/calculator/AIHintCard'

const DECIMAL = [
  { key: 'bit',  label: 'Bits',      symbol: 'b',  factor: 1, system: 'decimal' },
  { key: 'byte', label: 'Bytes',     symbol: 'B',  factor: 8, system: 'decimal' },
  { key: 'kb',   label: 'Kilobytes (KB)',  symbol: 'KB', factor: 8000, system: 'decimal' },
  { key: 'mb',   label: 'Megabytes (MB)',  symbol: 'MB', factor: 8e6,  system: 'decimal' },
  { key: 'gb',   label: 'Gigabytes (GB)',  symbol: 'GB', factor: 8e9,  system: 'decimal' },
  { key: 'tb',   label: 'Terabytes (TB)',  symbol: 'TB', factor: 8e12, system: 'decimal' },
  { key: 'pb',   label: 'Petabytes (PB)',  symbol: 'PB', factor: 8e15, system: 'decimal' },
]

const BINARY = [
  { key: 'kib',  label: 'Kibibytes (KiB)',  symbol: 'KiB', factor: 8192, system: 'binary' },
  { key: 'mib',  label: 'Mebibytes (MiB)',  symbol: 'MiB', factor: 8388608, system: 'binary' },
  { key: 'gib',  label: 'Gibibytes (GiB)',  symbol: 'GiB', factor: 8589934592, system: 'binary' },
  { key: 'tib',  label: 'Tebibytes (TiB)',  symbol: 'TiB', factor: 8796093022208, system: 'binary' },
]

const ALL_UNITS = [...DECIMAL, ...BINARY]

const FAQ = [
  { q: 'Why does my 1 TB hard drive show as 931 GB?', a: 'Hard drive makers use decimal: 1 TB = 1,000,000,000,000 bytes. Windows shows capacity in binary: 1 GB = 2³⁰ = 1,073,741,824 bytes. So 1 TB hard drive = 1,000,000,000,000 / 1,073,741,824 ≈ 931.3 GiB. The drive isn\'t faulty — it\'s a unit definition difference.' },
  { q: 'What is the difference between a bit and a byte?', a: '1 byte = 8 bits. Internet speeds are measured in bits per second (Mbps); file sizes in bytes (MB). A 100 Mbps connection downloads at 100/8 = 12.5 MB per second. Always check whether you\'re looking at bits (b) or bytes (B) — lowercase b = bits, uppercase B = bytes.' },
  { q: 'What is the difference between KB and KiB?', a: 'KB (kilobyte) in the SI/decimal system = 1,000 bytes. KiB (kibibyte) in the binary system = 1,024 bytes. The IEC introduced KiB, MiB, GiB in 1998 to eliminate ambiguity. Unfortunately, "KB" is still widely used to mean 1,024 bytes in computing contexts.' },
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

export default function DataStorageConverter({ meta, category }) {
  const C = category?.color || '#f59e0b'
  const [inputVal, setInputVal] = useState(1)
  const [inputUnit, setInputUnit] = useState('gb')
  const [openFaq, setOpenFaq] = useState(null)

  const unit = ALL_UNITS.find(u => u.key === inputUnit)
  const baseBits = inputVal * (unit?.factor || 8e9)
  const fmt = v => {
    if (!isFinite(v) || isNaN(v)) return '—'
    const abs = Math.abs(v)
    if (abs >= 1e12 || (abs < 0.001 && abs > 0)) return v.toExponential(4)
    return parseFloat(v.toPrecision(7)).toString()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      <div style={{ background: `linear-gradient(135deg,${C}15,${C}06)`, border: `1px solid ${C}30`, borderRadius: 14, padding: '16px 20px' }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: C, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>Data Storage Converter</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <input type="number" value={inputVal} onChange={e => setInputVal(+e.target.value)}
            style={{ width: 160, height: 48, border: `2px solid ${C}`, borderRadius: 10, padding: '0 14px', fontSize: 22, fontWeight: 700, color: C, background: 'var(--bg-card)', outline: 'none', fontFamily: "'Space Grotesk',sans-serif" }} />
          <select value={inputUnit} onChange={e => setInputUnit(e.target.value)}
            style={{ height: 48, border: `2px solid ${C}`, borderRadius: 10, padding: '0 14px', fontSize: 14, background: 'var(--bg-card)', color: C, fontWeight: 700, cursor: 'pointer' }}>
            <optgroup label="Decimal (SI)">
              {DECIMAL.map(u => <option key={u.key} value={u.key}>{u.label}</option>)}
            </optgroup>
            <optgroup label="Binary (IEC)">
              {BINARY.map(u => <option key={u.key} value={u.key}>{u.label}</option>)}
            </optgroup>
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Sec title="Decimal (SI) — powers of 1000">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {DECIMAL.map(u => {
              const v = baseBits / u.factor
              return (
                <div key={u.key} onClick={() => { setInputVal(parseFloat(v.toPrecision(7))); setInputUnit(u.key) }}
                  style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', borderRadius: 8, background: inputUnit === u.key ? C + '15' : 'var(--bg-raised)', border: `1px solid ${inputUnit === u.key ? C : 'var(--border)'}`, cursor: 'pointer' }}>
                  <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{u.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: inputUnit === u.key ? C : 'var(--text)', fontFamily: "'Space Grotesk',sans-serif" }}>{fmt(v)} {u.symbol}</span>
                </div>
              )
            })}
          </div>
        </Sec>
        <Sec title="Binary (IEC) — powers of 1024">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {BINARY.map(u => {
              const v = baseBits / u.factor
              return (
                <div key={u.key} onClick={() => { setInputVal(parseFloat(v.toPrecision(7))); setInputUnit(u.key) }}
                  style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', borderRadius: 8, background: inputUnit === u.key ? C + '15' : 'var(--bg-raised)', border: `1px solid ${inputUnit === u.key ? C : 'var(--border)'}`, cursor: 'pointer' }}>
                  <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{u.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: inputUnit === u.key ? C : 'var(--text)', fontFamily: "'Space Grotesk',sans-serif" }}>{fmt(v)} {u.symbol}</span>
                </div>
              )
            })}
            <div style={{ padding: '10px', background: '#fef3c7', borderRadius: 8, marginTop: 4 }}>
              <div style={{ fontSize: 11, color: '#92400e', fontWeight: 600 }}>💡 Why your drive shows less</div>
              <div style={{ fontSize: 11, color: '#78350f', marginTop: 2 }}>
                1 TB (decimal) = {fmt(1e12 / 1099511627776)} TiB (binary)
              </div>
            </div>
          </div>
        </Sec>
      </div>

      <Sec title="Common file sizes reference">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[['MP3 song (4 min)', '4 MB'], ['HD photo (12MP)', '6 MB'], ['1-hour HD video', '~1 GB'], ['4K movie', '~50 GB'], ['OS install', '10–50 GB'], ['Game (modern)', '50–200 GB']].map(([name, size], i) => (
            <div key={i} style={{ padding: '9px 11px', background: 'var(--bg-raised)', borderRadius: 8, border: '0.5px solid var(--border)' }}>
              <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{name}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: C, fontFamily: "'Space Grotesk',sans-serif" }}>{size}</div>
            </div>
          ))}
        </div>
      </Sec>

      <AIHintCard hint={`${inputVal} ${unit?.symbol}: ${fmt(baseBits/8)} bytes = ${fmt(baseBits/8e9)} GB (decimal) = ${fmt(baseBits/8589934592)} GiB (binary).`} />

      <FormulaCard
        formula={'1 KB (SI) = 1,000 bytes\n1 KiB (IEC) = 1,024 bytes\n1 byte = 8 bits\n1 GB = 1,000 MB ≠ 1,024 MiB'}
        variables={[
          { symbol: 'b', meaning: 'bit — smallest unit (0 or 1)' },
          { symbol: 'B', meaning: 'byte = 8 bits' },
          { symbol: 'KB', meaning: 'kilobyte = 1,000 bytes (SI decimal)' },
          { symbol: 'KiB', meaning: 'kibibyte = 1,024 bytes (IEC binary)' },
        ]}
        explanation="Two parallel systems exist: SI decimal (1 KB = 1000 bytes, used by drive makers) and IEC binary (1 KiB = 1024 bytes, used by OS). This causes the apparent discrepancy between advertised and shown drive sizes. Internet speed is in bits/second (Mbps); file size is in bytes (MB)."
      />

      <Sec title="Frequently asked questions">
        {FAQ.map((f, i) => <Acc key={i} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} color={C} />)}
      </Sec>
    </div>
  )
}
