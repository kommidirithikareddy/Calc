import { useState } from 'react'
import CalcShell from '../../components/calculator/CalcShell'
import BreakdownTable from '../../components/calculator/BreakdownTable'
import AIHintCard from '../../components/calculator/AIHintCard'

// ─── shared helpers ────────────────────────────────────────────
const fmt = n => isNaN(n) || !isFinite(n) ? '—' : parseFloat(Number(n).toFixed(8)).toString()
const clamp = (v, a, b) => Math.min(b, Math.max(a, v))
const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) { [a, b] = [b, a % b] } return a }
const lcm = (a, b) => Math.abs(a * b) / gcd(a, b)

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
      <button
        onClick={onToggle}
        style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 0', background: 'none', border: 'none', cursor: 'pointer', gap: 12, textAlign: 'left' }}
      >
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif", lineHeight: 1.4 }}>{q}</span>
        <span style={{ fontSize: 18, color, flexShrink: 0, transform: open ? 'rotate(45deg)' : 'none', transition: 'transform .2s' }}>+</span>
      </button>
      {open && <p style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.75, margin: '0 0 13px', fontFamily: "'DM Sans',sans-serif" }}>{a}</p>}
    </div>
  )
}

function StepsCard({ steps, color }) {
  const [exp, setExp] = useState(false)
  if (!steps || !steps.length) return null
  const vis = exp ? steps : steps.slice(0, 3)

  return (
    <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
      <div style={{ padding: '12px 18px', borderBottom: '0.5px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', fontFamily: "'Space Grotesk',sans-serif" }}>Step-by-step working</span>
        <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{steps.length} steps</span>
      </div>
      <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {vis.map((s, i) => (
          <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: '50%',
                flexShrink: 0,
                background: i === steps.length - 1 ? color : color + '18',
                border: `1.5px solid ${color}40`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11,
                fontWeight: 700,
                color: i === steps.length - 1 ? '#fff' : color
              }}
            >
              {i === steps.length - 1 ? '✓' : i + 1}
            </div>
            <div style={{ flex: 1 }}>
              {s.label && <div style={{ fontSize: 10, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>{s.label}</div>}
              <div
                style={{
                  fontSize: 13,
                  fontFamily: "'Space Grotesk',sans-serif",
                  fontWeight: i === steps.length - 1 ? 700 : 500,
                  background: 'var(--bg-raised)',
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: `0.5px solid ${i === steps.length - 1 ? color + '40' : 'var(--border)'}`
                }}
              >
                {s.math}
              </div>
              {s.note && <div style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 4, fontStyle: 'italic' }}>↳ {s.note}</div>}
            </div>
          </div>
        ))}
        {steps.length > 3 && (
          <button
            onClick={() => setExp(e => !e)}
            style={{ padding: '9px', borderRadius: 9, border: `1px solid ${color}30`, background: color + '08', color, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
          >
            {exp ? '▲ Hide steps' : `▼ Show all ${steps.length} steps`}
          </button>
        )}
      </div>
    </div>
  )
}

function MathInput({ label, value, onChange, hint, color, unit, type = 'number', placeholder }) {
  const [f, setF] = useState(false)
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <label style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif" }}>{label}</label>
        {hint && <span style={{ fontSize: 10, color: 'var(--text-3)' }}>{hint}</span>}
      </div>
      <div style={{ display: 'flex', alignItems: 'stretch', height: 44, border: `1.5px solid ${f ? color : 'var(--border-2)'}`, borderRadius: 9, overflow: 'hidden', background: 'var(--bg-card)', transition: 'border-color .15s' }}>
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={e => onChange(type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value)}
          onFocus={() => setF(true)}
          onBlur={() => setF(false)}
          style={{ flex: 1, border: 'none', background: 'transparent', padding: '0 14px', fontSize: 16, fontWeight: 600, color: 'var(--text)', outline: 'none', fontFamily: "'Space Grotesk',sans-serif" }}
        />
        {unit && <div style={{ padding: '0 12px', display: 'flex', alignItems: 'center', background: 'var(--bg-raised)', borderLeft: '1px solid var(--border)', fontSize: 13, fontWeight: 600, color: 'var(--text-3)' }}>{unit}</div>}
      </div>
    </div>
  )
}

function FormulaCard({ formula, desc, color }) {
  return (
    <div style={{ background: `linear-gradient(135deg,${color}12,${color}06)`, border: `1px solid ${color}30`, borderRadius: 14, padding: '16px 20px', marginBottom: 0 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Formula</div>
      <div style={{ fontSize: 17, fontWeight: 700, color, fontFamily: "'Space Grotesk',sans-serif" }}>{formula}</div>
      {desc && <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>{desc}</div>}
    </div>
  )
}

function RealWorld({ items }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
      {items.map((rw, i) => (
        <div key={i} style={{ padding: '12px 13px', borderRadius: 11, background: rw.color + '08', border: `1px solid ${rw.color}25` }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 7 }}>
            <span style={{ fontSize: 18 }}>{rw.icon}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: rw.color }}>{rw.field}</span>
          </div>
          <p style={{ fontSize: 11.5, color: 'var(--text-2)', lineHeight: 1.65, margin: '0 0 7px', fontFamily: "'DM Sans',sans-serif" }}>{rw.desc}</p>
          <div style={{ fontSize: 10, fontWeight: 600, color: rw.color, padding: '3px 8px', background: rw.color + '15', borderRadius: 6, display: 'inline-block' }}>{rw.example}</div>
        </div>
      ))}
    </div>
  )
}

function MistakesList({ items }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {items.map((m, i) => (
        <div key={i} style={{ display: 'flex', gap: 12, padding: '10px 14px', borderRadius: 9, background: '#fee2e210', border: '0.5px solid #ef444420' }}>
          <span style={{ fontSize: 14, flexShrink: 0, color: '#ef4444', fontWeight: 700 }}>✗</span>
          <span style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.6 }}>{m}</span>
        </div>
      ))}
    </div>
  )
}

function GlossaryCard({ items, color }) {
  const [open, setOpen] = useState(null)
  return (
    <>
      {items.map((g, i) => (
        <div key={i} style={{ borderBottom: '0.5px solid var(--border)' }}>
          <button onClick={() => setOpen(open === i ? null : i)} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 0', background: 'none', border: 'none', cursor: 'pointer', gap: 12, textAlign: 'left' }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', fontFamily: "'DM Sans',sans-serif" }}>{g.term}</span>
            </div>
            <span style={{ fontSize: 16, color, flexShrink: 0, transform: open === i ? 'rotate(45deg)' : 'none', transition: 'transform .2s' }}>+</span>
          </button>
          {open === i && <p style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.7, margin: '0 0 12px 18px', fontFamily: "'DM Sans',sans-serif" }}>{g.def}</p>}
        </div>
      ))}
    </>
  )
}

function BaseBadge({ label, value, suffix, color }) {
  return (
    <div style={{ padding: '10px 12px', borderRadius: 10, background: 'var(--bg-raised)', border: `1px solid ${color}25` }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color, fontFamily: "'Space Grotesk',sans-serif", wordBreak: 'break-all' }}>
        {value}{suffix}
      </div>
    </div>
  )
}

function WhatIsThisCard({ color }) {
  return (
    <Sec title="What is this calculator?" sub="Start here if this feels confusing">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div
          style={{
            padding: '12px 14px',
            borderRadius: 10,
            background: color + '08',
            border: `1px solid ${color}22`,
            fontSize: 13,
            color: 'var(--text-2)',
            lineHeight: 1.75
          }}
        >
          A <b style={{ color: 'var(--text)' }}>number base converter</b> changes how a number is <b>written</b>, not what the number <b>means</b>.
          <br /><br />
          For example:
          <br />
          <b style={{ color }}>255</b> in decimal,
          <b style={{ color: '#10b981' }}>11111111</b> in binary,
          <b style={{ color: '#8b5cf6' }}>FF</b> in hexadecimal
          <br />
          all mean the <b>same exact value</b>.
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div style={{ padding: '12px 13px', borderRadius: 10, background: 'var(--bg-raised)', border: '0.5px solid var(--border)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color, marginBottom: 6 }}>WHAT IS A BASE?</div>
            <div style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.65 }}>
              A base tells you how many symbols a number system uses before moving to the next place value.
              <br /><br />
              Base 10 uses digits <b>0 to 9</b>.
              <br />
              Base 2 uses digits <b>0 and 1</b>.
            </div>
          </div>

          <div style={{ padding: '12px 13px', borderRadius: 10, background: 'var(--bg-raised)', border: '0.5px solid var(--border)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#10b981', marginBottom: 6 }}>WHY IS IT USED?</div>
            <div style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.65 }}>
              Different systems use different bases:
              <br />
              • <b>Binary</b> for computers
              <br />
              • <b>Hex</b> for programming and colors
              <br />
              • <b>Octal</b> for some permissions
              <br />
              • <b>Decimal</b> for daily life
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          {[
            { label: 'Decimal', value: '10', note: 'daily life', c: color },
            { label: 'Binary', value: '1010', note: 'computers', c: '#10b981' },
            { label: 'Hex', value: 'A', note: 'programming', c: '#8b5cf6' }
          ].map((item, i) => (
            <div key={i} style={{ padding: '12px', borderRadius: 10, background: 'var(--bg-card)', border: `1px solid ${item.c}22`, textAlign: 'center' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', marginBottom: 4 }}>{item.label}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: item.c, fontFamily: "'Space Grotesk',sans-serif", marginBottom: 4 }}>{item.value}</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{item.note}</div>
            </div>
          ))}
        </div>

        <div style={{ padding: '10px 13px', background: '#f59e0b10', borderRadius: 9, border: '1px solid #f59e0b25', fontSize: 12, color: 'var(--text-2)', lineHeight: 1.65 }}>
          💡 Think of it like this: English, Telugu, and Spanish can describe the same object using different words.
          In the same way, binary, octal, decimal, and hex can describe the same number using different symbols.
        </div>
      </div>
    </Sec>
  )
}

function BaseMeaningCard({ input, fromBase, toDec, toBin, toOct, toHex, color }) {
  return (
    <Sec title="What does this answer mean?" sub="Simple explanation">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', lineHeight: 1.6, fontFamily: "'DM Sans',sans-serif" }}>
          <span style={{ color, fontFamily: "'Space Grotesk',sans-serif" }}>{input}</span> in base <b>{fromBase}</b> is the same number as <span style={{ color: '#f59e0b', fontFamily: "'Space Grotesk',sans-serif" }}>{toDec}</span> in decimal.
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 10, padding: '11px 12px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', marginBottom: 4 }}>SAME VALUE</div>
            <div style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.6 }}>
              Binary, octal, decimal, and hex are just <b>different writing systems</b> for the same quantity.
            </div>
          </div>

          <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 10, padding: '11px 12px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', marginBottom: 4 }}>QUICK VIEW</div>
            <div style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.6 }}>
              {toDec}₁₀ = {toBin}₂ = {toOct}₈ = {toHex}₁₆
            </div>
          </div>
        </div>

        <div style={{ padding: '10px 13px', background: color + '08', borderRadius: 9, border: `1px solid ${color}20`, fontSize: 12, color: 'var(--text-2)', lineHeight: 1.65 }}>
          💡 Converting bases does <b>not</b> change the number. It only changes how the number is written.
        </div>
      </div>
    </Sec>
  )
}

function BaseSystemGuide({ color }) {
  const items = [
    { b: 2, name: 'Binary', digits: '0, 1', use: 'Computers', note: 'Each place value is a power of 2.', c: color },
    { b: 8, name: 'Octal', digits: '0–7', use: 'Compact binary grouping', note: 'Each place value is a power of 8.', c: '#10b981' },
    { b: 10, name: 'Decimal', digits: '0–9', use: 'Everyday counting', note: 'Each place value is a power of 10.', c: '#f59e0b' },
    { b: 16, name: 'Hexadecimal', digits: '0–9, A–F', use: 'Programming, colours, memory', note: 'Each place value is a power of 16.', c: '#8b5cf6' }
  ]

  return (
    <Sec title="How number bases work" sub="Base systems made simple">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {items.map((it, i) => (
          <div key={i} style={{ padding: '12px 14px', borderRadius: 10, background: it.c + '08', border: `1px solid ${it.c}25` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: it.c }}>{it.name} (base {it.b})</div>
              <div style={{ fontSize: 10, color: 'var(--text-3)' }}>{it.use}</div>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.6, marginBottom: 6 }}>
              Allowed digits: <b>{it.digits}</b>
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--text-3)', lineHeight: 1.55 }}>{it.note}</div>
          </div>
        ))}
      </div>
    </Sec>
  )
}

function PositionTable({ input, fromBase, color }) {
  const chars = input.toUpperCase().split('')
  const isSmallEnough = chars.length <= 10
  if (!isSmallEnough) return null

  const valueOfDigit = ch => {
    if (/\d/.test(ch)) return Number(ch)
    return ch.charCodeAt(0) - 55
  }

  return (
    <Sec title="Place value breakdown" sub={`Why ${input} means what it means in base ${fromBase}`}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(92px,1fr))', gap: 8 }}>
        {chars.map((ch, idx) => {
          const power = chars.length - 1 - idx
          const digitVal = valueOfDigit(ch)
          const contribution = digitVal * Math.pow(fromBase, power)

          return (
            <div key={idx} style={{ padding: '10px 10px', borderRadius: 10, background: 'var(--bg-raised)', border: `1px solid ${color}22`, textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 4 }}>digit</div>
              <div style={{ fontSize: 18, fontWeight: 700, color, fontFamily: "'Space Grotesk',sans-serif" }}>{ch}</div>
              <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 6 }}>value</div>
              <div style={{ fontSize: 11, color: 'var(--text-2)' }}>{digitVal}</div>
              <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 6 }}>× {fromBase}^{power}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text)' }}>{contribution}</div>
            </div>
          )
        })}
      </div>
    </Sec>
  )
}

function GroupingVisual({ toBin, color }) {
  if (!toBin || toBin === 'Invalid') return null
  const padded4 = toBin.padStart(Math.ceil(toBin.length / 4) * 4, '0')
  const groups4 = padded4.match(/.{1,4}/g) || []
  const padded3 = toBin.padStart(Math.ceil(toBin.length / 3) * 3, '0')
  const groups3 = padded3.match(/.{1,3}/g) || []

  return (
    <Sec title="Why octal and hex are useful" sub="Grouping binary digits">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>
            Group binary into 4s → hexadecimal
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {groups4.map((g, i) => (
              <div key={i} style={{ padding: '8px 10px', borderRadius: 8, background: '#8b5cf610', border: '1px solid #8b5cf625', fontSize: 14, fontWeight: 700, color: '#8b5cf6', fontFamily: "'Space Grotesk',sans-serif" }}>
                {g}
              </div>
            ))}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>
            Group binary into 3s → octal
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {groups3.map((g, i) => (
              <div key={i} style={{ padding: '8px 10px', borderRadius: 8, background: '#10b98110', border: '1px solid #10b98125', fontSize: 14, fontWeight: 700, color: '#10b981', fontFamily: "'Space Grotesk',sans-serif" }}>
                {g}
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: '10px 13px', background: color + '08', borderRadius: 9, border: `1px solid ${color}20`, fontSize: 12, color: 'var(--text-2)', lineHeight: 1.65 }}>
          💡 1 hex digit = <b>4 binary bits</b>. 1 octal digit = <b>3 binary bits</b>. That is why programmers use hex and octal as shorter forms of binary.
        </div>
      </div>
    </Sec>
  )
}

function ExampleCards({ setInput, setFromBase, color }) {
  const cards = [
    { i: '255', b: 10, title: 'Decimal example', desc: '255 is FF in hex and 11111111 in binary.', icon: '🔢' },
    { i: 'FF', b: 16, title: 'Hex example', desc: 'FF means 15×16 + 15 = 255.', icon: '💜' },
    { i: '101010', b: 2, title: 'Binary example', desc: '101010₂ equals 42 in decimal.', icon: '💻' },
    { i: '755', b: 8, title: 'Octal example', desc: 'Common Unix permission notation.', icon: '🛠️' }
  ]

  return (
    <Sec title="Try a real example" sub="Click a card">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {cards.map((card, i) => (
          <button
            key={i}
            onClick={() => { setInput(card.i); setFromBase(card.b) }}
            style={{ padding: '14px', borderRadius: 12, border: `1px solid ${color}22`, background: i % 2 === 0 ? color + '08' : 'var(--bg-raised)', textAlign: 'left', cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 20 }}>{card.icon}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{card.title}</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.6, marginBottom: 8 }}>{card.desc}</div>
            <div style={{ fontSize: 11, fontWeight: 700, color, background: color + '14', display: 'inline-block', padding: '4px 8px', borderRadius: 8 }}>
              {card.i} (base {card.b})
            </div>
          </button>
        ))}
      </div>
    </Sec>
  )
}

function QuickFacts({ input, fromBase, toDec, toBin, toHex, color }) {
  return (
    <Sec title="Quick facts" sub="Helpful observations">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10 }}>
        {[
          { label: 'Input base', value: fromBase, c: color },
          { label: 'Digits used', value: input.length, c: '#10b981' },
          { label: 'Binary bits', value: toBin.length, c: '#f59e0b' },
          { label: 'Hex digits', value: toHex.length, c: '#8b5cf6' }
        ].map((item, i) => (
          <div key={i} style={{ padding: '12px', borderRadius: 10, background: 'var(--bg-raised)', border: `1px solid ${item.c}25`, textAlign: 'center' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', marginBottom: 5 }}>{item.label}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: item.c, fontFamily: "'Space Grotesk',sans-serif", wordBreak: 'break-word' }}>{item.value}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-2)', lineHeight: 1.65 }}>
        Decimal value: <b>{toDec}</b>
      </div>
    </Sec>
  )
}

function ChallengeCard({ toDec, color }) {
  const [show, setShow] = useState(false)
  const dec = Number(toDec)
  if (isNaN(dec)) return null

  const next = dec + 1
  const opts = [
    next.toString(16).toUpperCase(),
    dec.toString(16).toUpperCase(),
    (next + 1).toString(16).toUpperCase(),
    Math.max(0, next - 1).toString(16).toUpperCase()
  ]

  return (
    <Sec title="Challenge yourself" sub="Quick thinking quiz">
      <div style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.75, marginBottom: 12 }}>
        If the decimal value is <b>{toDec}</b>, what is <b>{next}</b> in hexadecimal?
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
        {opts.map((option, i) => (
          <div key={i} style={{ padding: '10px 12px', borderRadius: 10, background: 'var(--bg-card)', border: '0.5px solid var(--border)', fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.55 }}>
            {String.fromCharCode(65 + i)}. {option}₁₆
          </div>
        ))}
      </div>

      <button onClick={() => setShow(v => !v)} style={{ padding: '10px 14px', borderRadius: 9, border: `1px solid ${color}30`, background: color + '10', color, fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}>
        {show ? 'Hide answer' : 'Reveal answer'}
      </button>

      {show && (
        <div style={{ marginTop: 12, padding: '12px 14px', borderRadius: 10, background: 'var(--bg-card)', border: '0.5px solid var(--border)' }}>
          <div style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.75, marginBottom: 8 }}>
            ✅ <b style={{ color: 'var(--text)' }}>Correct answer:</b> <b>{next.toString(16).toUpperCase()}₁₆</b>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.7 }}>
            Add 1 in decimal, then convert to hexadecimal.
          </div>
        </div>
      )}
    </Sec>
  )
}

// ═══════════════════════════════════════════════════════════════
//  NUMBER BASE CONVERTER

export default function NumberBaseConverter({ meta, category }) {
  const C = category?.color || '#3b82f6'
  const [input, setInput] = useState('255')
  const [fromBase, setFromBase] = useState(10)
  const [openFaq, setOpenFaq] = useState(null)

  const n = parseInt(input, fromBase)
  const isValid =
    input.trim() !== '' &&
    !isNaN(n) &&
    n >= 0 &&
    (fromBase !== 16 || /^[0-9a-fA-F]+$/.test(input)) &&
    (fromBase !== 2 || /^[01]+$/.test(input)) &&
    (fromBase !== 8 || /^[0-7]+$/.test(input)) &&
    (fromBase !== 10 || /^[0-9]+$/.test(input))

  const toBin = isValid ? n.toString(2) : 'Invalid'
  const toOct = isValid ? n.toString(8) : 'Invalid'
  const toDec = isValid ? n.toString(10) : 'Invalid'
  const toHex = isValid ? n.toString(16).toUpperCase() : 'Invalid'

  const steps = isValid ? [
    {
      label: 'Input',
      math: `${input} in base ${fromBase}`,
      note: fromBase === 10
        ? 'Already decimal — conversion starts directly from base 10.'
        : fromBase === 2
          ? 'Binary uses powers of 2.'
          : fromBase === 16
            ? 'Hex uses digits 0-9 and A-F.'
            : 'Octal uses powers of 8.'
    },
    {
      label: 'Convert to decimal',
      math: fromBase === 10
        ? `Already decimal: ${n}`
        : fromBase === 2
          ? `${input.split('').reverse().map((b, i) => `${b}×2^${i}`).join(' + ')} = ${n}`
          : fromBase === 16
            ? `${input.toUpperCase().split('').reverse().map((d, i) => `${parseInt(d, 16)}×16^${i}`).join(' + ')} = ${n}`
            : `${input.split('').reverse().map((d, i) => `${parseInt(d, 8)}×8^${i}`).join(' + ')} = ${n}`,
      note: 'Convert to decimal first if you want a universal method.'
    },
    { label: 'To Binary', math: `${n}₁₀ = ${toBin}₂`, note: 'Base 2' },
    { label: 'To Octal', math: `${n}₁₀ = ${toOct}₈`, note: 'Base 8' },
    { label: 'To Hexadecimal', math: `${n}₁₀ = ${toHex}₁₆`, note: 'Base 16' },
  ] : []

  const BASES = [
    { b: 2, l: 'Binary', desc: 'base 2', digits: '0,1', use: 'Computers' },
    { b: 8, l: 'Octal', desc: 'base 8', digits: '0-7', use: 'Unix permissions' },
    { b: 10, l: 'Decimal', desc: 'base 10', digits: '0-9', use: 'Everyday maths' },
    { b: 16, l: 'Hex', desc: 'base 16', digits: '0-9,A-F', use: 'Colours, memory' }
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <FormulaCard
        formula="value = Σ (digit × base^position)"
        desc="Any number can be written in different bases by using powers of that base."
        color={C}
      />

      <CalcShell
        left={
          <div style={{ alignSelf: 'flex-start', height: 'fit-content' }}>
            <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 14, padding: '16px 18px', height: 'fit-content' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', marginBottom: 10, fontFamily: "'DM Sans',sans-serif" }}>Input base</div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                {[2, 8, 10, 16].map(b => (
                  <button
                    key={b}
                    onClick={() => setFromBase(b)}
                    style={{
                      flex: 1,
                      padding: '10px',
                      borderRadius: 9,
                      border: `1.5px solid ${fromBase === b ? C : 'var(--border-2)'}`,
                      background: fromBase === b ? C + '12' : 'var(--bg-raised)',
                      cursor: 'pointer',
                      textAlign: 'center',
                      fontFamily: "'DM Sans',sans-serif"
                    }}
                  >
                    <div style={{ fontSize: 13, fontWeight: fromBase === b ? 700 : 500, color: fromBase === b ? C : 'var(--text)' }}>{b}</div>
                    <div style={{ fontSize: 9, color: 'var(--text-3)' }}>{b === 2 ? 'Binary' : b === 8 ? 'Octal' : b === 10 ? 'Decimal' : 'Hex'}</div>
                  </button>
                ))}
              </div>

              <MathInput
                label={`Number in base ${fromBase}`}
                value={input}
                onChange={setInput}
                type="text"
                placeholder={fromBase === 2 ? 'e.g. 11111111' : fromBase === 16 ? 'e.g. FF' : fromBase === 8 ? 'e.g. 377' : 'e.g. 255'}
                color={C}
                hint={fromBase === 16 ? 'A-F allowed' : fromBase === 2 ? '0s and 1s only' : fromBase === 8 ? 'digits 0-7' : 'digits 0-9'}
              />

              {!isValid && input && (
                <div style={{ fontSize: 12, color: '#ef4444', padding: '8px 12px', background: '#fee2e210', borderRadius: 8, marginTop: -8, marginBottom: 10 }}>
                  Invalid characters for base {fromBase}
                </div>
              )}

              <div style={{ borderTop: '0.5px solid var(--border)', paddingTop: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>
                  Quick examples
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <button onClick={() => { setInput('255'); setFromBase(10) }} style={{ border: 'none', background: 'transparent', padding: 0 }}>
                    <div><BaseBadge label="Decimal" value="255" suffix="" color={C} /></div>
                  </button>
                  <button onClick={() => { setInput('FF'); setFromBase(16) }} style={{ border: 'none', background: 'transparent', padding: 0 }}>
                    <div><BaseBadge label="Hex" value="FF" suffix="" color="#8b5cf6" /></div>
                  </button>
                  <button onClick={() => { setInput('11111111'); setFromBase(2) }} style={{ border: 'none', background: 'transparent', padding: 0 }}>
                    <div><BaseBadge label="Binary" value="11111111" suffix="" color="#10b981" /></div>
                  </button>
                  <button onClick={() => { setInput('755'); setFromBase(8) }} style={{ border: 'none', background: 'transparent', padding: 0 }}>
                    <div><BaseBadge label="Octal" value="755" suffix="" color="#f59e0b" /></div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        }
        right={
          <>
            {!isValid && input ? (
              <div style={{ background: '#fee2e2', border: '1px solid #ef444430', borderRadius: 14, padding: '20px', textAlign: 'center', marginBottom: 14 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#dc2626' }}>⚠ Invalid input for base {fromBase}</div>
              </div>
            ) : (
              <>
                <div style={{ background: 'var(--bg-card)', border: `1.5px solid ${C}30`, borderRadius: 14, padding: '18px 20px', marginBottom: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 12 }}>Conversions</div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                    <BaseBadge label="Binary" value={toBin} suffix="₂" color={C} />
                    <BaseBadge label="Octal" value={toOct} suffix="₈" color="#10b981" />
                    <BaseBadge label="Decimal" value={toDec} suffix="₁₀" color="#f59e0b" />
                    <BaseBadge label="Hexadecimal" value={toHex} suffix="₁₆" color="#8b5cf6" />
                  </div>

                  <div style={{ padding: '10px 13px', background: C + '08', borderRadius: 9, border: `1px solid ${C}20`, fontSize: 12, color: 'var(--text-2)', lineHeight: 1.65 }}>
                    💡 All four results above describe the same value: <b>{toDec}</b>.
                  </div>
                </div>

                {toBin && toBin !== 'Invalid' && toBin.length <= 12 && (
                  <div style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border)', borderRadius: 14, padding: '14px 18px', marginBottom: 14 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 10, fontFamily: "'Space Grotesk',sans-serif" }}>Binary positional values</div>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {toBin.split('').reverse().map((bit, i) => (
                        <div key={i} style={{ textAlign: 'center', minWidth: 40 }}>
                          <div style={{ fontSize: 9, color: 'var(--text-3)', marginBottom: 2 }}>2^{i}={Math.pow(2, i)}</div>
                          <div style={{ padding: '6px', borderRadius: 6, background: bit === '1' ? C + '20' : 'var(--bg-raised)', border: `1px solid ${bit === '1' ? C : 'var(--border)'}`, fontSize: 14, fontWeight: 700, color: bit === '1' ? C : 'var(--text-3)' }}>
                            {bit}
                          </div>
                        </div>
                      )).reverse()}
                    </div>
                    <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text-3)' }}>
                      Sum of highlighted powers: {toBin.split('').reverse().map((b, i) => b === '1' ? Math.pow(2, i) : 0).reduce((a, b) => a + b, 0)} = {toDec}
                    </div>
                  </div>
                )}

                <BreakdownTable
                  title="Quick summary"
                  rows={[
                    { label: 'Input', value: `${input} (base ${fromBase})`, bold: true, highlight: true, color: C },
                    { label: 'Decimal value', value: `${toDec}`, color: '#f59e0b' },
                    { label: 'Binary digits', value: `${toBin.length}`, color: '#10b981' },
                    { label: 'Hex digits', value: `${toHex.length}`, color: '#8b5cf6' }
                  ]}
                />

                <AIHintCard hint={`${input} (base ${fromBase}) = ${toDec}₁₀ = ${toBin}₂ = ${toOct}₈ = ${toHex}₁₆`} />
              </>
            )}
          </>
        }
      />

      <WhatIsThisCard color={C} />

      {isValid && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <BaseMeaningCard input={input.toUpperCase()} fromBase={fromBase} toDec={toDec} toBin={toBin} toOct={toOct} toHex={toHex} color={C} />
          <BaseSystemGuide color={C} />
          <PositionTable input={input.toUpperCase()} fromBase={fromBase} color={C} />
          <GroupingVisual toBin={toBin} color={C} />
          <ExampleCards setInput={setInput} setFromBase={setFromBase} color={C} />
          <QuickFacts input={input.toUpperCase()} fromBase={fromBase} toDec={toDec} toBin={toBin} toHex={toHex} color={C} />
          <StepsCard steps={steps} color={C} />
          <ChallengeCard toDec={toDec} color={C} />
        </div>
      )}

      <Sec title="Why different number bases exist">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {BASES.map((b, i) => (
            <div key={i} style={{ padding: '12px 14px', borderRadius: 10, background: C + (i === 0 ? '15' : i === 1 ? '0a' : i === 2 ? '08' : '05'), border: `1px solid ${C}${i === 0 ? '40' : '20'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: C }}>{b.l} (base {b.b})</span>
                <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{b.use}</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.6 }}>
                {b.desc} — uses digits: {b.digits}. {b.b === 2
                  ? 'Computers use binary because circuits naturally switch between two states: on and off.'
                  : b.b === 8
                    ? 'Octal is a shorter way to write binary by grouping bits in threes.'
                    : b.b === 10
                      ? 'Humans mostly use decimal in daily life.'
                      : 'Hex is common in programming because one hex digit represents exactly four binary bits.'}
              </div>
            </div>
          ))}
        </div>
      </Sec>

      <Sec title="Where number bases are used">
        <RealWorld items={[
          { icon: '💻', field: 'Computers', desc: 'Binary is the language of digital electronics and machine instructions.', example: '0 and 1 states', color: C },
          { icon: '🎨', field: 'Web colours', desc: 'Hex is used in HTML and CSS colours, like #FF5733.', example: '#RRGGBB format', color: '#8b5cf6' },
          { icon: '🧾', field: 'Permissions', desc: 'Octal is used in Unix file permissions such as 755.', example: 'chmod 755', color: '#10b981' },
          { icon: '🛠️', field: 'Memory and debugging', desc: 'Programmers often read addresses and bytes in hexadecimal.', example: '0xFF, 0xDEADBEEF', color: '#f59e0b' }
        ]} />
      </Sec>

      <Sec title="Math words made easy">
        <GlossaryCard
          color={C}
          items={[
            { term: 'Base', def: 'The number of different digits allowed before a place value increases.' },
            { term: 'Place value', def: 'The value of a digit depending on its position, such as ones, twos, sixteens, and so on.' },
            { term: 'Binary', def: 'Base 2, using only digits 0 and 1.' },
            { term: 'Octal', def: 'Base 8, using digits 0 through 7.' },
            { term: 'Hexadecimal', def: 'Base 16, using digits 0 through 9 and letters A through F.' },
          ]}
        />
      </Sec>

      <Sec title="⚠️ Common mistakes">
        <MistakesList items={[
          'Using digits not allowed in the chosen base, such as 2 in binary or G in hexadecimal',
          'Thinking the written form changes the value — only the representation changes',
          'Forgetting that A-F in hexadecimal mean 10-15',
          'Mixing up powers of the base when expanding place values'
        ]} />
      </Sec>

      <Sec title="Frequently asked questions">
        {[
          {
            q: 'Why do computers use binary?',
            a: 'Because electronic circuits naturally have two reliable states: on and off. Binary matches that perfectly.'
          },
          {
            q: 'Why is hexadecimal popular in programming?',
            a: 'Because one hex digit represents exactly four binary bits, making binary much shorter and easier to read.'
          },
          {
            q: 'Why convert through decimal first?',
            a: 'Because decimal is a common reference point. Once you know the decimal value, converting to other bases is easier to understand.'
          }
        ].map((f, i) => (
          <Acc key={i} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} color={C} />
        ))}
      </Sec>
    </div>
  )
}